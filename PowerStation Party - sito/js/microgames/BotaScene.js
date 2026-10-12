// Microgioco 11: "Spalma il Bota!" - insegui le zone calde prima che si scottino. SPALMA!
//
//  Il Bota è sdraiato sul telo, visto dall'alto, e non sta mai fermo (si stiracchia, si sposta,
//  a metà partita si gira). La pelle è una griglia di celle. Il sole accende le ZONE CALDE, una
//  dopo l'altra: dentro una zona la pelle senza crema si scotta in pochi secondi (rosa, rossa,
//  rosso aragosta: da rossa è scottata per sempre). Un solo gesto: tenendo premuto (o col dito)
//  la mano stende la crema dove passa. La crema dura poco: le zone vanno inseguite. Coprire
//  tutta una zona prima che si scotti la SPEGNE (punti). Niente crema su occhi e bocca.
//  Se occhi e bocca finiscono sotto la mano perché si è mosso lui, non è un errore.
//  Le zone calde escono uguali per tutti i giocatori del round (seme del round).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { CORPO, GW, GH, PELLE, zonaVietata } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, pannello, scuoti, puntatore, colpetto, lerp, caso, quanti, eTouch, perDito, vibra } from '../fx.js';

const CELLA = CORPO.cella, BW = CORPO.w, BH = CORPO.h;
const CX = 232, CY = 150;            // centro del corpo a riposo (il centro del telo)
const SCALA = 2;                     // unità del corpo -> unità di gioco
const DB = CORPO.densDin;            // densità della texture di crema e scottatura

export class BotaScene extends MicrogiocoBase {
  constructor() { super('bota'); }

  prepara() {
    const c = this.cfg;
    this.rnd = casuale(Sessione.seme);
    im(this, 0, 0, 'bgLido').setOrigin(0);
    for (let i = 0; i < 3; i++) {
      const o = this.add.ellipse(474, 42 + i * 94, 24, 74, 0xffffff, 0.5).setDepth(2);
      this.tweens.add({ targets: o, x: 463, alpha: 0.12, duration: 1500 + i * 280, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // i due lati del Bota: dove c'è pelle, quanta crema, quanto è scottata
    this.lati = {};
    for (const nome of ['fronte', 'retro']) {
      const n = GW * GH;
      this.lati[nome] = { nome, pelle: PELLE[nome].celle, n: PELLE[nome].n, maschera: PELLE[nome].maschera, crema: new Float32Array(n), scotta: new Float32Array(n) };
      // le celle di pelle, per pescare dove accendere una zona calda
      this.lati[nome].lista = [];
      for (let i = 0; i < n; i++) if (PELLE[nome].celle[i]) this.lati[nome].lista.push(i);
    }
    this.lato = this.lati.fronte;
    this.girato = false;

    // crema e scottatura si disegnano su una texture sopra il corpo (un pixel per cella, ingrandito)
    if (this.textures.exists('botaStrato')) this.textures.remove('botaStrato');
    this.texStrato = this.textures.createCanvas('botaStrato', BW * DB, BH * DB);
    this.mini = document.createElement('canvas');
    this.mini.width = GW; this.mini.height = GH;
    this.miniDati = this.mini.getContext('2d').createImageData(GW, GH);
    this.sporco = true;
    this.tDisegno = 0;

    this.imgCorpo = im(this, 0, 0, 'botaFronte');
    this.imgTesta = im(this, -61, 0, 'botaTesta_normale');
    this.imgStrato = this.add.image(0, 0, 'botaStrato').setScale(1 / DB);
    this.corpo = this.add.container(CX, CY, [this.imgCorpo, this.imgTesta, this.imgStrato]).setScale(SCALA).setDepth(50);
    this.zoneG = this.add.graphics().setDepth(55);   // le zone calde, disegnate sopra al corpo

    this.spost = { x: 0, y: 0, sx: 1, sy: 1, rot: 0 };
    this.zone = [];             // { cx, cy (celle del corpo), r, eta, lato, spenta, coperta }
    this.tZona = c.primaZona;
    this.spente = 0;
    this.bruciate = 0;
    this.stordito = 0; this.tFermo = 0; this.tEspr = 0; this.espr = 'normale';
    this.prec = null; this.precMondo = null; this.locPrec = null;
    this.tSussulto = 0; this.perdonato = false; this.tAppoggio = 0;
    this.tMossa = c.primaMossa;
    this.tFrase = 3.5; this.tBrucia = 0; this.tVapore = 0; this.tAvviso = 0; this.tSuono = 0;
    this.fum = null; this.hud = '';

    // la mano (il cursore del mouse è nascosto: si vede la mano)
    this.mano = im(this, CX, 236, 'manoCrema', 0.85).setOrigin(0.5, 0.62).setDepth(600);
    this.input.setDefaultCursor('none');
    this.dito = null;
    this.modoDito = eTouch();
    this.puntoDito = { x: CX, y: 236 };
    this.input.on('pointerdown', (p) => {
      if (!this.inCorso || !p.wasTouch || this.dito) return;
      const w = puntatore(this, p);
      this.dito = p; this.modoDito = true; this.prec = null;
      this.puntoDito = { x: w.x, y: w.y - this.cfg.sopraDito };
      this.tAppoggio = 0.08;                     // la mano compare sopra il dito: per un istante non lavora
      this.tSussulto = Math.max(this.tSussulto, 0.3);
    });
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => { if (this.dito?.id === p.id) { this.dito = null; this.prec = null; } });

    // il sole, sempre più cattivo
    this.livSole = 0;
    this.sole = im(this, 44, 68, 'sole_0').setDepth(30);
    this.tweens.add({ targets: this.sole, angle: { from: -7, to: 7 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.testoSpente = txt(this, 186, 22, '', { size: 9, depth: 1001, color: '#7dff9a' });
    this.testoScot = txt(this, 296, 22, '', { size: 9, depth: 1001 });
    this.hudBota = [
      pannello(this, 240, 22, 220, 18, { depth: 1000 }), this.testoSpente, this.testoScot,
      txt(this, 240, 37, `OBIETTIVO: MENO DEL ${c.sogliaScottata}% SCOTTATA`, { depth: 1001, size: 7 }),
      txt(this, 6, 262, perDito('TIENI PREMUTO e passa la mano: spalmi la crema', 'Tieni il dito sul Bota e passalo: spalmi la crema'), { ox: 0, size: 6.5, depth: 1001 }),
      this.sole,
    ];
  }

  pulisci() { this.input.setDefaultCursor('default'); }

  // dopo una pausa il dito che lavorava non c'è più
  alRientro() { this.dito = null; this.prec = null; this.precMondo = null; this.locPrec = null; this.perdonato = false; }

  // dal punto sullo schermo alle coordinate del corpo (che trasla, ruota e si deforma), e ritorno
  aLocale(wx, wy) {
    const t = this.corpo, dx = wx - t.x, dy = wy - t.y, cs = Math.cos(-t.rotation), sn = Math.sin(-t.rotation);
    return { x: (dx * cs - dy * sn) / t.scaleX + BW / 2, y: (dx * sn + dy * cs) / t.scaleY + BH / 2 };
  }
  aMondo(lx, ly) {
    const t = this.corpo, x = (lx - BW / 2) * t.scaleX, y = (ly - BH / 2) * t.scaleY, cs = Math.cos(t.rotation), sn = Math.sin(t.rotation);
    return { x: t.x + x * cs - y * sn, y: t.y + x * sn + y * cs };
  }

  // applica fn(indice, distanza al quadrato) alle celle il cui centro è entro il raggio dal punto
  perCelle(x, y, r, fn) {
    const gx0 = Math.floor(x / CELLA), gy0 = Math.floor(y / CELLA), gr = Math.ceil(r / CELLA);
    for (let gy = gy0 - gr; gy <= gy0 + gr; gy++) for (let gx = gx0 - gr; gx <= gx0 + gr; gx++) {
      if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
      const d2 = ((gx + 0.5) * CELLA - x) ** 2 + ((gy + 0.5) * CELLA - y) ** 2;
      if (d2 <= r * r) fn(gy * GW + gx, d2);
    }
  }

  vietato(x, y) { return this.lato.nome === 'fronte' && zonaVietata(x, y); }

  espressione(e, sec = 0) {
    this.espr = e;
    this.imgTesta.setTexture('botaTesta_' + e);
    this.tEspr = sec;
  }

  parla(s, ms = 1300) {
    this.fum?.destroy();
    this.fum = fumetto(this, Phaser.Math.Clamp(this.corpo.x - 104, 66, 300), this.corpo.y - 56, s, ms, 900);
    this.tFrase = Math.max(this.tFrase, 3);
    if (!this.girato && this.espr === 'normale') this.espressione('parla', 0.8);
  }

  aggiorna(dt, p) {
    const c = this.cfg, ptr = this.input.activePointer;
    let w = puntatore(this);

    // --- il Bota non sta mai fermo: ondeggia piano, ogni tanto si stiracchia; a metà si gira ---
    const t = this.corpo, A = lerp(c.ondaInizio, c.ondaFine, p);
    t.x = CX + this.spost.x + Math.sin(this.trascorso * 0.9) * A;
    t.y = CY + this.spost.y + Math.cos(this.trascorso * 1.3) * A * 0.5;
    t.rotation = this.spost.rot + Math.sin(this.trascorso * 0.7) * A * 0.004;
    t.setScale(SCALA * this.spost.sx, SCALA * this.spost.sy * (1 + Math.sin(this.trascorso * 2.2) * 0.012));
    if (!this.girato && p >= c.giraA) this.gira();
    this.tFermo -= dt; this.stordito -= dt; this.tSuono -= dt; this.tAvviso -= dt;
    this.tMossa -= dt;
    if (this.tMossa <= 0 && this.tFermo <= 0) { this.tMossa = lerp(c.mossaInizio, c.mossaFine, p) * (0.8 + this.rnd() * 0.4); this.siMuove(); }
    if (this.tEspr > 0) { this.tEspr -= dt; if (this.tEspr <= 0) this.espressione('normale'); }

    // --- la mano: tenuto premuto (qualunque tasto del mouse) o il dito, spalma ---
    let spalmo;
    if (this.modoDito) {
      if (this.dito) { const d = puntatore(this, this.dito); this.puntoDito = { x: d.x, y: d.y - c.sopraDito }; }
      w = this.puntoDito ?? w;
      spalmo = !!this.dito;
    } else spalmo = ptr.isDown;
    if (this.tAppoggio > 0) { this.tAppoggio -= dt; spalmo = false; }
    if (this.tFermo > 0 || this.stordito > 0) spalmo = false;
    this.mano.setPosition(w.x, w.y).setAngle(spalmo ? Math.sin(this.trascorso * 18) * 5 : 0);

    const loc = this.aLocale(w.x, w.y);
    // se il Bota fa uno scatto, per un attimo quello che finisce sotto la mano non è colpa mia
    if (this.locPrec && this.precMondo) {
      const dxw = w.x - this.precMondo.x, dyw = w.y - this.precMondo.y, cs = Math.cos(-t.rotation), sn = Math.sin(-t.rotation);
      const mx = (dxw * cs - dyw * sn) / t.scaleX, my = (dxw * sn + dyw * cs) / t.scaleY;
      if (Math.hypot(loc.x - this.locPrec.x - mx, loc.y - this.locPrec.y - my) / Math.max(dt, 0.001) > c.velSussulto) this.tSussulto = 0.25;
    }
    this.tSussulto -= dt;
    this.locPrec = loc;
    this.precMondo = { x: w.x, y: w.y };

    if (spalmo) {
      const da = this.prec ?? loc, passi = Math.max(1, Math.ceil(Math.hypot(loc.x - da.x, loc.y - da.y) / 2));
      let fatto = 0, occhi = false;
      for (let i = 1; i <= passi; i++) {
        const x = lerp(da.x, loc.x, i / passi), y = lerp(da.y, loc.y, i / passi);
        if (this.vietato(x, y)) { occhi = true; break; }
        fatto += this.spalma(x, y);
      }
      if (!occhi) this.perdonato = false;
      else if (this.tSussulto > 0 || this.perdonato) this.perdonato = true;
      else this.smorfia();
      if (fatto && this.tSuono <= 0) { this.tSuono = 0.11; Audio.sfx('pennello'); }
      this.prec = loc;
    } else this.prec = null;

    this.zoneCalde(dt, p);
    this.scotta(dt, p);

    // --- il sole si incattivisce ---
    const liv = Math.min(3, Math.floor(p * 4));
    if (liv !== this.livSole) { this.livSole = liv; this.sole.setTexture('sole_' + liv); colpetto(this, this.sole, 1.4, 1.4); Audio.sfx('sfrigola'); }

    this.tFrase -= dt;
    if (this.tFrase <= 0) { this.tFrase = 5 + Math.random() * 3; this.parla(caso(c.frasi)); }

    // contatori (si riscrivono solo quando cambiano)
    const scot = Math.floor(this.conta().scottata), hud = `${this.spente}|${scot}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoSpente.setText(`ZONE SPENTE: ${this.spente}`);
      this.testoScot.setText(`SCOTTATA: ${scot}%`).setColor(scot >= c.sogliaScottata ? '#ff6b5a' : scot >= c.sogliaScottata * 0.6 ? '#ffe14a' : '#ffffff');
    }

    // la crema si consuma: va ripassata
    const L = this.lato, via = c.consumo * dt;
    for (let i = 0; i < L.pelle.length; i++) if (L.crema[i] > 0) { L.crema[i] = Math.max(0, L.crema[i] - via); if (L.crema[i] < c.sogliaProtetta + via * 2) this.sporco = true; }
    this.tDisegno -= dt;
    if (this.sporco && this.tDisegno <= 0) { this.tDisegno = 1 / 30; this.ridisegna(); }
  }

  // la mano stende la crema dove passa (quanta ne serve: il tubetto non finisce mai)
  spalma(x, y) {
    const c = this.cfg, L = this.lato;
    let fatto = 0;
    this.perCelle(x, y, c.raggioMano, (i) => {
      if (!L.pelle[i] || L.crema[i] >= c.strato) return;
      L.crema[i] = c.strato;
      fatto++;
    });
    if (fatto) this.sporco = true;
    return fatto;
  }

  // crema su occhi o bocca: smorfia, urlo e un attimo di stop
  smorfia() {
    if (this.stordito > -0.5) return;
    const c = this.cfg;
    this.stordito = c.stordito;
    this.prec = null;
    this.espressione('urlo', 0.9);
    Audio.sfx('ahia');
    vibra(70);
    scuoti(this, 220, 0.01);
    this.cameras.main.flash(120, 255, 80, 80);
    scritta(this, 150, 92, caso(c.frasiOcchi), { size: 15, color: '#ff6b5a' });
    this.tweens.add({ targets: this.spost, sy: 1.1, sx: 0.95, duration: 70, yoyo: true, repeat: 2 });
  }

  // --- LE ZONE CALDE ---
  zoneCalde(dt, p) {
    const c = this.cfg, L = this.lato;
    this.tZona -= dt;
    if (this.tZona <= 0 && this.tFermo <= 0) {
      this.tZona = lerp(c.ogniZonaInizio, c.ogniZonaFine, p);
      const k = L.lista[Math.floor(this.rnd() * L.lista.length)];
      const cx = ((k % GW) + 0.5) * CELLA, cy = (Math.floor(k / GW) + 0.5) * CELLA;
      // (non sopra a occhi e bocca: lì non si può spalmare)
      if (!this.vietato(cx, cy)) {
        this.zone.push({ cx, cy, r: 0, eta: 0, lato: L, coperta: 0 });
        Audio.sfx('sfrigola');
      }
    }
    const g = this.zoneG;
    g.clear();
    for (const z of this.zone) {
      z.eta += dt;
      z.r = Math.min(c.raggioZona, (z.eta / c.cresceZona) * c.raggioZona);
      // coperta tutta di crema (la pelle già bruciata non conta)? per un attimo di fila: spenta.
      // Bruciata tutta, o finito il suo tempo: si chiude senza punti
      let celle = 0, ok = 0;
      this.perCelle(z.cx, z.cy, z.r, (i) => { if (!L.pelle[i] || L.scotta[i] >= c.rossa) return; celle++; if (L.crema[i] >= c.sogliaProtetta) ok++; });
      z.coperta = celle && ok >= celle * 0.92 && z.r >= c.raggioZona * 0.6 ? z.coperta + dt : 0;
      if (z.coperta >= c.tempoSpegni) this.spegni(z);
      else if (z.eta >= c.durataZona || (!celle && z.r >= c.raggioZona)) z.finita = true;
      if (z.finita || z.lato !== L) continue;
      // il disegno: un cerchio rosso che pulsa, sul corpo (segue il Bota)
      const m = this.aMondo(z.cx, z.cy), R = z.r * SCALA, puls = 0.5 + 0.5 * Math.sin(this.trascorso * 9);
      g.fillStyle(0xff3b20, 0.12 + puls * 0.1).fillCircle(m.x, m.y, R);
      g.lineStyle(1.6, 0xff5a3a, 0.75).strokeCircle(m.x, m.y, R);
      g.lineStyle(1, 0xffe14a, 0.6 * puls).strokeCircle(m.x, m.y, R + 2.5);
    }
    this.zone = this.zone.filter((z) => !z.finita);
  }

  spegni(z) {
    const c = this.cfg;
    z.finita = true;
    this.spente++;
    Audio.sfx('ok');
    const m = this.aMondo(z.cx, z.cy);
    stelle(this, m.x, m.y, 5, 610);
    scritta(this, m.x, m.y - 18, `SPENTA! +${c.puntiZona}`, { size: 8, color: '#7dff9a', durata: 400 });
    if (this.spente % 5 === 0 && this.tFrase < 3.6) this.parla(caso(c.frasiBravo));
  }

  // --- IL SOLE ---
  // dentro le zone calde la pelle senza crema si scotta in fretta; fuori, molto piano
  scotta(dt, p) {
    const c = this.cfg, L = this.lato;
    const fuori = (dt / c.secondiRossoFuori) * c.rossa, dentro = (dt / lerp(c.secondiRossoInizio, c.secondiRossoFine, p)) * c.rossa;
    const calde = new Uint8Array(L.pelle.length);
    for (const z of this.zone) if (z.lato === L) this.perCelle(z.cx, z.cy, z.r, (i) => { calde[i] = 1; });
    let nuove = 0;
    for (let i = 0; i < L.pelle.length; i++) {
      if (!L.pelle[i] || L.scotta[i] >= 1 || L.crema[i] >= c.sogliaProtetta) continue;
      const prima = L.scotta[i], dopo = Math.min(1, prima + (calde[i] ? dentro : fuori));
      L.scotta[i] = dopo;
      if (prima < c.rossa && dopo >= c.rossa) nuove++;
      if (Math.floor(prima * 14) !== Math.floor(dopo * 14)) this.sporco = true;
    }
    this.bruciate += nuove;
    this.tBrucia -= dt;
    if (nuove && this.tBrucia <= 0) {
      this.tBrucia = 2.5;
      Audio.sfx('sfrigola');
      if (this.tFrase < 3.6) this.parla(caso(c.frasiBrucia));
      if (!this.girato && this.espr === 'normale') this.espressione('triste', 1);
    }
    this.tVapore -= dt;
    if (this.tVapore <= 0) {
      this.tVapore = 0.35;
      const cotte = [];
      for (let i = 0; i < L.pelle.length; i++) if (L.pelle[i] && L.scotta[i] >= 0.85) cotte.push(i);
      if (cotte.length) { const k = caso(cotte), m = this.aMondo(((k % GW) + 0.5) * CELLA, (Math.floor(k / GW) + 0.5) * CELLA); fumo(this, m.x, m.y, 1, 580); }
    }
  }

  // quanta pelle è scottata (in % di quella che ha preso il sole finora)
  conta() {
    const c = this.cfg;
    let esposte = 0, scot = 0;
    for (const L of this.girato ? [this.lati.fronte, this.lati.retro] : [this.lati.fronte]) {
      esposte += L.n;
      for (let i = 0; i < L.pelle.length; i++) if (L.pelle[i] && L.scotta[i] >= c.rossa) scot++;
    }
    return { scottata: (scot / esposte) * 100 };
  }

  // --- A METÀ PARTITA SI GIRA ---
  gira() {
    const c = this.cfg;
    this.girato = true;
    this.tFermo = 0.9;
    this.prec = null;
    this.perdonato = false;
    this.zone = [];
    this.tZona = Math.max(this.tZona, 1.2);
    Audio.sfx('scivola');
    scritta(this, 240, 74, 'SI GIRA!', { size: 16, color: '#ffe14a', durata: 800 });
    this.parla(caso(c.frasiGira), 1600);
    this.tweens.add({
      targets: this.spost, sy: 0.06, duration: 190, ease: 'Sine.in',
      onComplete: () => {
        this.lato = this.lati.retro;
        this.imgCorpo.setTexture('botaRetro');
        this.imgTesta.setVisible(false);
        this.sporco = true;
        this.tDisegno = 0;
        this.tweens.add({ targets: this.spost, sy: 1, duration: 220, ease: 'Back.out' });
      },
    });
  }

  // si stiracchia o si allunga a prendere il telefono o una birra: uno scatto da inseguire
  siMuove() {
    const c = this.cfg, cosa = caso(['telefono', 'birra', 'stira']), s = this.rnd() < 0.5 ? 1 : -1;
    Audio.sfx('muovi');
    const dx = cosa === 'stira' ? s * 16 : s * 9, dy = cosa === 'stira' ? -s * 6 : s * 11;
    this.tweens.add({ targets: this.spost, x: dx, y: dy, rot: s * 0.07, duration: 170, ease: 'Quad.out', yoyo: true, hold: c.tieneMossa * 1000 });
    if (cosa !== 'stira') {
      this.parla(caso(c.frasiMuove[cosa]), 1200);
      const key = cosa === 'birra' ? 'lattina' : 'telefono';
      const o = im(this, CX + 4 + s * 9, CY + s * 74, key).setDepth(55).setScale(0);
      this.tweens.add({ targets: o, scale: scalaDi(key, 1.3), duration: 160, ease: 'Back.out' });
      this.tweens.add({ targets: o, alpha: 0, delay: 1250, duration: 200, onComplete: () => o.destroy() });
    }
  }

  // --- DISEGNO DI CREMA E SCOTTATURA ---
  ridisegna() {
    const c = this.cfg, L = this.lato, d = this.miniDati.data, n = GW * GH;
    for (let i = 0; i < n; i++) {
      let r = 0, g = 0, b = 0, a = 0;
      if (L.pelle[i]) {
        const s = L.scotta[i];
        if (s >= 0.12) {
          if (s < c.rossa) { const k = (s - 0.12) / (c.rossa - 0.12); r = 255; g = 128 - k * 44; b = 138 - k * 64; a = 0.14 + k * 0.44; }
          else { const k = Math.min(1, (s - c.rossa) / (1 - c.rossa)); r = 236 - k * 38; g = 58 - k * 36; b = 50 - k * 24; a = 0.64 + k * 0.26; }
        }
        const v = L.crema[i];
        if (v > 0.03) {
          const ca = Math.min(1, v / c.strato) * 0.55;
          const tot = ca + a * (1 - ca);
          r = (255 * ca + r * a * (1 - ca)) / tot; g = (255 * ca + g * a * (1 - ca)) / tot; b = (255 * ca + b * a * (1 - ca)) / tot;
          a = tot;
        }
      }
      d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = a * 255;
    }
    // le celle fuori dalla pelle prendono il colore delle vicine (il bordo lo ritaglia la maschera)
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
      const i = gy * GW + gx;
      if (L.pelle[i]) continue;
      let r = 0, g = 0, b = 0, a = 0, q = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const x = gx + dx, y = gy + dy;
        if (x < 0 || y < 0 || x >= GW || y >= GH || !L.pelle[y * GW + x]) continue;
        const j = (y * GW + x) * 4;
        r += d[j]; g += d[j + 1]; b += d[j + 2]; a += d[j + 3]; q++;
      }
      if (q) { d[i * 4] = r / q; d[i * 4 + 1] = g / q; d[i * 4 + 2] = b / q; d[i * 4 + 3] = a / q; }
    }
    this.mini.getContext('2d').putImageData(this.miniDati, 0, 0);
    const k = this.texStrato.context, W = BW * DB, H = BH * DB, U = CELLA * DB;
    k.globalCompositeOperation = 'source-over';
    k.clearRect(0, 0, W, H);
    k.imageSmoothingEnabled = true;
    k.imageSmoothingQuality = 'high';
    k.drawImage(this.mini, 0, 0, W, H);
    // riflessi dove la crema è fresca
    for (let i = 0; i < n; i++) {
      if (!L.pelle[i] || L.crema[i] < c.strato * 0.7 || (i + Math.floor(i / GW)) % 2) continue;
      const x = ((i % GW) + 0.5) * U, y = (Math.floor(i / GW) + 0.5) * U;
      k.fillStyle = 'rgba(255,255,255,0.75)';
      k.beginPath(); k.ellipse(x - U * 0.12, y - U * 0.16, U * 0.2, U * 0.085, -0.55, 0, Math.PI * 2); k.fill();
    }
    k.globalCompositeOperation = 'destination-in';
    k.drawImage(L.maschera, 0, 0, W, H);
    k.globalCompositeOperation = 'source-over';
    this.texStrato.refresh();
    this.sporco = false;
  }

  risultato() {
    const c = this.cfg, scot = Math.floor(this.conta().scottata);
    return {
      // (la pelle sana conta solo sotto pelleSana% di scottatura: chi sta fermo non prende niente)
      punteggio: Math.max(0, this.spente * c.puntiZona + Math.max(0, c.pelleSana - scot) * c.puntiPelle),
      vittoria: scot < c.sogliaScottata,
      riepilogo: `${quanti(this.spente, 'zona spenta', 'zone spente')}, scottata ${scot}%`,
    };
  }

  // il Bota si alza e si guarda: abbronzato alla perfezione, oppure rosso aragosta
  finale(ris, fatto) {
    this.tweens.killTweensOf(this.spost);
    for (const o of [...this.hudBota, this.mano, this.zoneG]) o?.setVisible(false);
    this.fum?.destroy();
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.82, duration: 300 });
    this.tweens.add({ targets: this.corpo, alpha: 0, duration: 250 });
    const key = ris.vittoria ? 'bota_abbronzato' : 'bota_aragosta';
    const b = im(this, 240, 290, key, 0.4).setOrigin(0.5, 1).setDepth(702);
    this.tweens.add({ targets: b, y: 262, scale: scalaDi(key, 1.6), delay: 150, duration: 420, ease: 'Back.out' });
    this.time.delayedCall(800, () => {
      if (ris.vittoria) {
        Audio.sfx('vittoria');
        txt(this, 240, 22, 'ABBRONZATURA PERFETTA!', { size: 16, color: '#7dff9a', depth: 710 });
        for (let i = 0; i < 4; i++) this.time.delayedCall(i * 250, () => stelle(this, 150 + Math.random() * 180, 70 + Math.random() * 130, 8, 705));
        this.tweens.add({ targets: b, scaleY: b.scaleY * 1.04, scaleX: b.scaleX * 0.97, y: 258, duration: 240, yoyo: true, repeat: -1 });
      } else {
        Audio.sfx('sconfitta');
        txt(this, 240, 22, 'ROSSO ARAGOSTA!', { size: 16, color: '#ff6b5a', depth: 710 });
        this.tweens.add({ targets: b, x: { from: 240, to: 296 }, duration: 1500, ease: 'Stepped', easeParams: [5], yoyo: true, repeat: -1 });
        this.tweens.add({ targets: b, angle: { from: -3, to: 3 }, duration: 150, ease: 'Stepped', easeParams: [1], yoyo: true, repeat: -1 });
        this.time.addEvent({ delay: 300, repeat: 8, callback: () => { Audio.sfx('tonk'); fumo(this, b.x + (Math.random() - 0.5) * 50, 110 + Math.random() * 60, 1, 705); } });
        this.time.delayedCall(350, () => fumetto(this, 372, 84, 'Non mi toccare!', 2100, 712));
      }
    });
    this.time.delayedCall(3600, fatto);
  }
}
