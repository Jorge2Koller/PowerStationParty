// Microgioco 11: "Spalma il Bota!" - crema solare prima che il Bota si scotti.
//
//  Il Bota è sdraiato sul telo, visto dall'alto. La sua pelle è una griglia di celle: ognuna
//  ha la sua crema (0 = scoperta, circa 1 = giusta, troppa = chiazza bianca) e la sua
//  scottatura, che sale finché la cella resta scoperta e non torna più indietro.
//  TASTO DESTRO  = tubetto: una goccia di crema, tanta in un punto solo
//                  (sul trackpad del Mac: clic a due dita, oppure CTRL + clic)
//  TASTO SINISTRO = mano: raccoglie la crema in più e la stende dove manca
//  COL DITO: interruttore TUBETTO / MANO in basso a sinistra; l'attrezzo sta un po' sopra il dito.
//  A metà partita si gira: il davanti resta com'era e si ricomincia con la schiena.
//  Disturbi: si sposta per prendere il telefono o una birra, un'onda lava una gamba, il vento
//  porta la sabbia (va ripassata con la mano), un gabbiano viene a rubare il tubetto.
//  Come nella Barba, contano solo gli errori di chi gioca: se occhi e bocca finiscono sotto la
//  mano perché si è mosso lui, non è un errore.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { CORPO, GW, GH, PELLE, zonaVietata } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, pannello, scuoti, puntatore, colpetto, lerp, caso, eTouch, perDito, vibra, multiTouch } from '../fx.js';

const CELLA = CORPO.cella, BW = CORPO.w, BH = CORPO.h;
const CX = 232, CY = 150;            // centro del corpo a riposo (il centro del telo)
const SCALA = 2;                     // unità del corpo -> unità di gioco
const DB = CORPO.densDin;            // densità della texture di crema e scottatura
const TUBO = { x: 438, y: 236 };     // dove sta il tubetto: barra della crema, clic per scuoterlo
const ANGOLO_TUBO = -24;

export class BotaScene extends MicrogiocoBase {
  constructor() { super('bota'); }

  prepara() {
    const c = this.cfg;
    im(this, 0, 0, 'bgLido').setOrigin(0);
    // le onde vanno e vengono sul bordo
    for (let i = 0; i < 3; i++) {
      const o = this.add.ellipse(474, 42 + i * 94, 24, 74, 0xffffff, 0.5).setDepth(2);
      this.tweens.add({ targets: o, x: 463, alpha: 0.12, duration: 1500 + i * 280, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // i due lati del Bota: dove c'è pelle, quanta crema, quanto è scottata, dove c'è sabbia
    this.lati = {};
    for (const nome of ['fronte', 'retro']) {
      const n = GW * GH, ritmo = new Float32Array(n);
      for (let i = 0; i < n; i++) ritmo[i] = 0.85 + Math.random() * 0.3;   // non tutta la pelle si scotta alla stessa velocità
      this.lati[nome] = { nome, pelle: PELLE[nome].celle, n: PELLE[nome].n, maschera: PELLE[nome].maschera, crema: new Float32Array(n), scotta: new Float32Array(n), sabbia: new Uint8Array(n), ritmo };
    }
    this.lato = this.lati.fronte;
    this.girato = false;

    // crema e scottatura si disegnano su una texture sopra il corpo: un pixel per cella,
    // ingrandito (così sfuma da solo) e ritagliato sulla pelle
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

    this.spost = { x: 0, y: 0, sx: 1, sy: 1, rot: 0 };   // quando si sposta, sussulta o si gira
    this.crema = c.tubetto;     // crema rimasta nel tubetto
    this.inMano = 0;            // crema che la mano si porta dietro
    this.tGoccia = 0;
    this.colpo = false;         // è appena arrivato un clic del tubetto
    this.tScossa = 0;           // sto scuotendo il tubetto
    this.tFurto = 0;            // il gabbiano ha il tubetto
    this.gabbiano = null;
    this.onda = null;
    this.stordito = 0;          // dopo una smorfia gli attrezzi si fermano un attimo
    this.tFermo = 0;            // ...e anche mentre si gira
    this.tEspr = 0;
    this.espr = 'normale';
    this.prec = null;           // dov'era la mano sul corpo nel fotogramma prima (durante una passata)
    this.precMondo = null;
    this.locPrec = null;
    this.tSussulto = 0;         // si è appena mosso lui: quello che finisce sotto la mano non è colpa mia
    this.perdonato = false;
    this.tAppoggio = 0;
    this.salta = false;         // questo clic ha cacciato il gabbiano o scosso il tubetto: non spalma
    this.tDisturbo = c.primoDisturbo;
    this.ultimoDisturbo = '';
    this.tFrase = 3.5;
    this.tBrucia = 0;
    this.tVapore = 0;
    this.tAvviso = 0;
    this.tSuono = 0;
    this.gocce = 0;
    this.fum = null;
    this.hud = '';

    // attrezzi (il cursore del mouse è nascosto: si vede la mano, o il tubetto mentre si spreme)
    this.tubo = im(this, CX, 236, 'tubettoCrema').setOrigin(0.5, 0.97).setDepth(600).setVisible(false);
    this.mano = im(this, CX, 236, 'manoCrema', 0.85).setOrigin(0.5, 0.62).setDepth(600);
    this.cremaMano = im(this, CX, 236, 'gocciaCrema').setDepth(601).setVisible(false);
    this.input.setDefaultCursor('none');
    // CTRL tenuto premuto = tasto destro (Mac), come nella Barba
    this.ctrl = false;
    this.input.keyboard.on('keydown-CTRL', () => { this.ctrl = true; });
    this.input.keyboard.on('keyup-CTRL', () => { this.ctrl = false; });
    for (const ev of ['pointermove', 'pointerup']) this.input.on(ev, (p) => { if (p.event) this.ctrl = !!p.event.ctrlKey; });
    this.input.keyboard.on('keydown-R', (e) => { if (!e.repeat) this.scuotiTubetto(); });

    // col dito: il primo dito appoggiato è quello che lavora; un altro può cambiare attrezzo intanto
    multiTouch(this);
    this.attrezzo = 'tubetto';
    this.dito = null;
    this.modoDito = eTouch();
    this.puntoDito = { x: CX, y: 236 };
    this.input.on('pointerdown', (p) => this.giu(p));
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => { if (this.dito?.id === p.id) { this.dito = null; this.prec = null; } });
    if (eTouch()) this.creaInterruttore();

    // il sole, sempre più cattivo
    this.livSole = 0;
    this.sole = im(this, 44, 68, 'sole_0').setDepth(30);
    this.tweens.add({ targets: this.sole, angle: { from: -7, to: 7 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // il tubetto: quanta crema resta, e dove si clicca per scuoterlo
    this.iconaTubo = im(this, TUBO.x - 22, TUBO.y + 1, 'tubettoCrema', 0.82).setDepth(1001).setAngle(ANGOLO_TUBO);
    this.barraTubo = this.add.graphics().setDepth(1001);
    this.testoProt = txt(this, 188, 22, '', { size: 9, depth: 1001, color: '#7dff9a' });
    this.testoScot = txt(this, 293, 22, '', { size: 9, depth: 1001 });
    this.hudBota = [
      pannello(this, 240, 22, 212, 18, { depth: 1000 }), this.testoProt, this.testoScot,
      txt(this, 240, 37, `OBIETTIVO: MENO DEL ${c.sogliaScottata}% SCOTTATA`, { depth: 1001, size: 7 }),
      pannello(this, TUBO.x, TUBO.y, 74, 36, { depth: 1000 }), this.iconaTubo, this.barraTubo,
      txt(this, TUBO.x + 9, TUBO.y - 9, 'CREMA', { size: 6, depth: 1001, color: '#ffe14a' }),
      txt(this, TUBO.x + 9, TUBO.y + 11, perDito('R: scuotilo', 'tocca: scuotilo'), { size: 5.5, depth: 1001 }),
      txt(this, 6, 262, perDito('DESTRO (o CTRL+CLIC): crema    SINISTRO: spalma', 'Tocca qui sopra per cambiare attrezzo'), { ox: 0, size: 6.5, depth: 1001 }),
      this.sole,
    ];
    if (this.interruttore) this.hudBota.push(this.interruttore);
  }

  // interruttore TUBETTO / MANO (telefono): un tocco cambia attrezzo
  creaInterruttore() {
    const X = 62, Y = 236, W = 104, H = 30;
    const c = this.add.container(X, Y).setDepth(1002);
    const g = this.add.graphics();
    const icone = [im(this, -W / 4, -4, 'tubettoCrema', 0.42), im(this, W / 4, -4, 'manoCrema', 0.36)];
    const scritte = [txt(this, -W / 4, 8, 'TUBETTO', { size: 5.5 }), txt(this, W / 4, 8, 'MANO', { size: 5.5 })];
    c.add([g, ...icone, ...scritte]);
    const disegna = () => {
      const i = this.attrezzo === 'tubetto' ? 0 : 1;
      g.clear();
      g.fillStyle(0x000000, 0.3); g.fillRoundedRect(-W / 2 + 1.5, -H / 2 + 2.5, W, H, 9);
      g.fillStyle(0x1f1430, 0.85); g.fillRoundedRect(-W / 2, -H / 2, W, H, 9);
      g.fillStyle(0xffe14a, 1); g.fillRoundedRect(i ? 1 : -W / 2 + 2, -H / 2 + 2, W / 2 - 3, H - 4, 7);
      g.lineStyle(1.5, 0xffe14a, 1); g.strokeRoundedRect(-W / 2, -H / 2, W, H, 9);
      scritte.forEach((t, k) => t.setColor(k === i ? '#1f1430' : '#ffffff').setStroke('#1f1430', k === i ? 0 : 3));
      icone.forEach((t, k) => t.setAlpha(k === i ? 1 : 0.5));
    };
    disegna();
    this.add.rectangle(X, Y, W + 8, H + 8, 0x000000, 0.001).setDepth(1002).setInteractive()
      .on('pointerdown', (_p, _x, _y, ev) => {
        ev.stopPropagation();   // il tocco sull'interruttore non è una passata
        this.attrezzo = this.attrezzo === 'tubetto' ? 'mano' : 'tubetto';
        this.prec = null;
        Audio.sfx('muovi');
        this.tweens.add({ targets: c, scaleX: { from: 1.08, to: 1 }, scaleY: { from: 0.92, to: 1 }, duration: 140 });
        disegna();
      });
    this.interruttore = c;
  }

  pulisci() { this.input.setDefaultCursor('default'); }

  // dopo una pausa il dito che lavorava non c'è più (se no l'attrezzo resterebbe "premuto")
  alRientro() { this.dito = null; this.prec = null; this.precMondo = null; this.locPrec = null; this.perdonato = false; this.colpo = false; this.salta = false; }

  // un clic (o un tocco): il gabbiano e il tubetto si colpiscono con qualunque attrezzo,
  // e quel colpo non spreme e non spalma
  giu(p) {
    if (!this.inCorso) return;
    if (p.event) this.ctrl = !!p.event.ctrlKey;
    const w = puntatore(this, p), g = this.gabbiano;
    if (g && Math.hypot(w.x - g.img.x, w.y - g.img.y) < 20) { this.salta = true; return this.caccia(); }
    if (Math.abs(w.x - TUBO.x) < 39 && Math.abs(w.y - TUBO.y) < 20) { this.salta = true; return this.scuotiTubetto(); }
    // Il clic del tubetto vale da subito, anche se viene rilasciato prima del prossimo fotogramma
    // (un clic svelto, un tocco al volo): se no la goccia andrebbe persa.
    if (!p.wasTouch) { this.colpo = p.rightButtonDown() || (p.leftButtonDown() && this.ctrl); return; }
    if (this.dito) return;
    this.dito = p;
    this.modoDito = true;
    this.prec = null;
    this.puntoDito = { x: w.x, y: w.y - this.cfg.sopraDito };
    this.colpo = this.attrezzo === 'tubetto';
    // l'attrezzo compare sopra il dito solo adesso: per un istante non lavora, e se è atterrato
    // su occhi o bocca non conta (conta entrarci strisciando)
    this.tAppoggio = 0.1;
    this.tSussulto = Math.max(this.tSussulto, 0.3);
  }

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

  // la cella di pelle sotto il punto, o la più vicina lì attorno (-1 se non c'è pelle)
  cellaVicina(x, y, raggio = 5) {
    const L = this.lato, gx = Math.floor(x / CELLA), gy = Math.floor(y / CELLA);
    if (gx >= 0 && gy >= 0 && gx < GW && gy < GH && L.pelle[gy * GW + gx]) return gy * GW + gx;
    let meglio = -1, dMin = Infinity;
    this.perCelle(x, y, raggio, (i, d2) => { if (L.pelle[i] && d2 < dMin) { dMin = d2; meglio = i; } });
    return meglio;
  }

  // occhi e bocca (solo sul davanti)
  vietato(x, y) { return this.lato.nome === 'fronte' && zonaVietata(x, y); }

  espressione(e, sec = 0) {
    this.espr = e;
    this.imgTesta.setTexture('botaTesta_' + e);
    this.tEspr = sec;
  }

  // il Bota dice qualcosa in un fumetto, sopra la testa
  parla(s, ms = 1300) {
    this.fum?.destroy();
    this.fum = fumetto(this, Phaser.Math.Clamp(this.corpo.x - 104, 66, 300), this.corpo.y - 56, s, ms, 900);
    this.tFrase = Math.max(this.tFrase, 3);
    if (!this.girato && this.espr === 'normale') this.espressione('parla', 0.8);
  }

  avviso(w, s) {
    if (this.tAvviso > 0) return;
    this.tAvviso = 1.1;
    Audio.sfx('tsk');
    scritta(this, Phaser.Math.Clamp(w.x, 60, 420), w.y - 26, s, { size: 8, color: '#ff9a8a', durata: 600 });
  }

  aggiorna(dt, p) {
    const c = this.cfg, ptr = this.input.activePointer;
    let w = puntatore(this);

    // --- il Bota respira, ogni tanto si sposta, a metà partita si gira ---
    const t = this.corpo;
    t.x = CX + this.spost.x;
    t.y = CY + this.spost.y;
    t.rotation = this.spost.rot;
    t.setScale(SCALA * this.spost.sx, SCALA * this.spost.sy * (1 + Math.sin(this.trascorso * 2.2) * 0.012));
    if (!this.girato && p >= c.giraA) this.gira();
    this.tFermo -= dt; this.stordito -= dt; this.tSuono -= dt; this.tAvviso -= dt; this.tScossa -= dt;
    this.tDisturbo -= dt;
    if (this.tDisturbo <= 0 && this.tFermo <= 0) {
      this.tDisturbo = lerp(c.disturboInizio, c.disturboFine, p) * (0.8 + Math.random() * 0.4);
      this.disturbo();
    }
    if (this.tEspr > 0) { this.tEspr -= dt; if (this.tEspr <= 0) this.espressione('normale'); }

    // --- attrezzi ---
    let spremo, spalmo, tuboInMano;
    if (this.modoDito) {
      // col dito: l'attrezzo lo sceglie l'interruttore e sta un po' sopra il dito (così si vede)
      if (this.dito) { const d = puntatore(this, this.dito); this.puntoDito = { x: d.x, y: d.y - c.sopraDito }; }
      w = this.puntoDito ?? w;
      tuboInMano = this.attrezzo === 'tubetto';
      spremo = !!this.dito && tuboInMano;
      spalmo = !!this.dito && !tuboInMano;
    } else {
      spremo = ptr.rightButtonDown() || (ptr.leftButtonDown() && this.ctrl);
      spalmo = ptr.leftButtonDown() && !spremo;
      tuboInMano = spremo;
    }
    if (this.salta) { if (!spremo && !spalmo) this.salta = false; spremo = spalmo = false; }
    if (this.tAppoggio > 0) { this.tAppoggio -= dt; spremo = spalmo = false; }
    if (this.tFermo > 0 || this.stordito > 0) spremo = spalmo = false;
    const rubato = this.tFurto > 0;
    this.tubo.setVisible(tuboInMano && !rubato).setPosition(w.x, w.y).setAngle(spremo ? Math.sin(this.trascorso * 40) * 4 : 0);
    this.mano.setVisible(!this.tubo.visible).setPosition(w.x, w.y).setAngle(spalmo ? Math.sin(this.trascorso * 18) * 5 : 0);
    const piena = Math.min(1, this.inMano / c.capienzaMano);
    this.cremaMano.setVisible(this.mano.visible && piena > 0.04).setPosition(w.x, w.y + 1).setScale(scalaDi('gocciaCrema', 0.5 + piena * 0.9));

    const loc = this.aLocale(w.x, w.y);
    // Di quanto si è spostata la mano sul corpo in questo fotogramma per merito del Bota (si è
    // mosso lui) e non mio? Se fa uno scatto, per un attimo quello che finisce sotto non è colpa mia.
    if (this.locPrec && this.precMondo) {
      const dxw = w.x - this.precMondo.x, dyw = w.y - this.precMondo.y, cs = Math.cos(-t.rotation), sn = Math.sin(-t.rotation);
      const mx = (dxw * cs - dyw * sn) / t.scaleX, my = (dxw * sn + dyw * cs) / t.scaleY;
      if (Math.hypot(loc.x - this.locPrec.x - mx, loc.y - this.locPrec.y - my) / Math.max(dt, 0.001) > c.velSussulto) this.tSussulto = 0.25;
    }
    this.tSussulto -= dt;
    this.locPrec = loc;
    this.precMondo = { x: w.x, y: w.y };

    // tubetto: una goccia appena si preme (colpo), poi una ogni tanto finché si tiene premuto
    if (this.tFermo > 0 || this.stordito > 0) this.colpo = false;
    if (spremo || this.colpo) {
      this.tGoccia -= dt;
      if (this.colpo || this.tGoccia <= 0) { this.tGoccia = c.ritmoGocce; this.goccia(loc, w); }
    }
    this.colpo = false;

    // mano: lungo tutta la strada fatta dal fotogramma prima
    if (spalmo) {
      const da = this.prec ?? loc, passi = Math.max(1, Math.ceil(Math.hypot(loc.x - da.x, loc.y - da.y) / 2));
      let fatto = 0, occhi = false;
      for (let i = 1; i <= passi; i++) {
        const x = lerp(da.x, loc.x, i / passi), y = lerp(da.y, loc.y, i / passi);
        if (this.vietato(x, y)) { occhi = true; break; }
        fatto += this.spalma(x, y);
      }
      // È un errore solo se su occhi e bocca la mano ce l'ho portata io
      if (!occhi) this.perdonato = false;
      else if (this.tSussulto > 0 || this.perdonato) this.perdonato = true;
      else this.smorfia();
      if (fatto && this.tSuono <= 0) { this.tSuono = 0.11; Audio.sfx('pennello'); }
      this.prec = loc;
    } else this.prec = null;

    this.scotta(dt, p);
    this.comparse(dt);

    // --- il sole si incattivisce ---
    const liv = Math.min(3, Math.floor(p * 4));
    if (liv !== this.livSole) {
      this.livSole = liv;
      this.sole.setTexture('sole_' + liv);
      colpetto(this, this.sole, 1.4, 1.4);
      Audio.sfx('sfrigola');
    }

    // --- chiacchiere ---
    this.tFrase -= dt;
    if (this.tFrase <= 0) { this.tFrase = 5 + Math.random() * 3; this.parla(caso(c.frasi)); }

    // --- contatori (si riscrivono solo quando cambiano) ---
    const s = this.conta(), prot = Math.round(s.protetta), scot = Math.floor(s.scottata);
    const hud = `${prot}|${scot}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoProt.setText(`PROTETTA: ${prot}%`);
      this.testoScot.setText(`SCOTTATA: ${scot}%`).setColor(scot >= c.sogliaScottata ? '#ff6b5a' : scot >= c.sogliaScottata * 0.6 ? '#ffe14a' : '#ffffff');
    }
    const g = this.barraTubo, quanta = Phaser.Math.Clamp(this.crema / c.tubetto, 0, 1), vuoto = this.crema < c.goccia;
    g.clear();
    g.fillStyle(0x0d0816, 0.9); g.fillRoundedRect(TUBO.x - 10, TUBO.y - 4, 40, 8, 4);
    g.fillStyle(vuoto ? (Math.floor(this.trascorso * 6) % 2 ? 0xff3b3b : 0xffe14a) : quanta < 0.25 ? 0xffa53b : 0xffffff);
    g.fillRoundedRect(TUBO.x - 8.5, TUBO.y - 2.5, Math.max(3, 37 * quanta), 5, 2.5);

    // crema e scottatura si ridisegnano al massimo 30 volte al secondo
    this.tDisegno -= dt;
    if (this.sporco && this.tDisegno <= 0) { this.tDisegno = 1 / 30; this.ridisegna(); }
  }

  // --- IL TUBETTO ---
  // una goccia: tanta crema nel punto, un po' nelle celle attorno
  goccia(loc, w) {
    const c = this.cfg, L = this.lato;
    if (this.tFurto > 0) return this.avviso(w, "CE L'HA IL GABBIANO!");
    if (this.tScossa > 0) return;
    if (this.crema < c.goccia) {
      Audio.sfx('vuoto');
      colpetto(this, this.iconaTubo, 1.3, 1.3);
      return this.avviso(w, perDito('VUOTO! SCUOTILO (R)', 'VUOTO! TOCCA IL TUBETTO'));
    }
    this.crema -= c.goccia;
    this.gocce++;
    Audio.sfx('goccia');
    const anello = this.add.ellipse(w.x, w.y, 6, 4, 0xffffff, 0.9).setDepth(590);
    this.tweens.add({ targets: anello, scale: 2.6, alpha: 0, duration: 260, onComplete: () => anello.destroy() });
    // negli occhi o in bocca: guaio (a meno che non si sia appena mosso lui)
    if (this.vietato(loc.x, loc.y)) { if (this.tSussulto <= 0) this.smorfia(); return; }
    const i = this.cellaVicina(loc.x, loc.y);
    if (i < 0) {
      // fuori dal Bota: sul telo, sulla sabbia o sul costume. Sprecata.
      const m = im(this, w.x, w.y, 'gocciaCrema', 0.9).setDepth(40).setAngle(Math.random() * 360);
      this.tweens.add({ targets: m, alpha: 0, delay: 2200, duration: 600, onComplete: () => m.destroy() });
      return this.avviso(w, 'SPRECATA!');
    }
    const cera = L.crema[i] > 1.2, vicine = [];
    this.perCelle(((i % GW) + 0.5) * CELLA, (Math.floor(i / GW) + 0.5) * CELLA, CELLA * 1.5, (j) => { if (j !== i && L.pelle[j]) vicine.push(j); });
    L.crema[i] += c.goccia * (vicine.length ? 0.64 : 1);
    for (const j of vicine) L.crema[j] += (c.goccia * 0.36) / vicine.length;
    this.sporco = true;
    if (cera && this.tFrase < 3.6) this.parla(caso(c.frasiTroppa));
    else if (this.gocce === 1 || (Math.random() < 0.07 && this.tFrase < 3.6)) this.parla(caso(c.frasiFredda));
  }

  // tubetto vuoto: scuotendolo tornano due gocce, ma si perde tempo
  scuotiTubetto() {
    const c = this.cfg;
    if (!this.inCorso || this.tScossa > 0) return;
    if (this.tFurto > 0) return this.avviso({ x: TUBO.x - 20, y: TUBO.y }, "CE L'HA IL GABBIANO!");
    if (this.crema >= c.goccia) { colpetto(this, this.iconaTubo, 1.15, 1.15); return this.avviso({ x: TUBO.x - 20, y: TUBO.y }, "CE N'È ANCORA!"); }
    this.tScossa = c.tempoScossa;
    Audio.sfx('scuoti');
    this.tweens.add({ targets: this.iconaTubo, angle: { from: ANGOLO_TUBO - 22, to: ANGOLO_TUBO + 22 }, duration: 65, yoyo: true, repeat: 3, onComplete: () => this.iconaTubo.setAngle(ANGOLO_TUBO) });
    this.time.delayedCall(c.tempoScossa * 1000, () => {
      if (!this.inCorso) return;
      this.crema += c.scossa;
      Audio.sfx('pof');
      scritta(this, TUBO.x - 6, TUBO.y - 28, 'QUALCHE GOCCIA!', { size: 7, color: '#7dff9a', durata: 500 });
    });
  }

  // --- LA MANO ---
  // toglie la sabbia, raccoglie la crema in più e la lascia dove manca. Ritorna quante celle ha toccato.
  spalma(x, y) {
    const c = this.cfg, L = this.lato;
    let fatto = 0;
    this.perCelle(x, y, c.raggioMano, (i) => {
      if (!L.pelle[i]) return;
      if (L.sabbia[i]) { L.sabbia[i] = 0; fatto++; }
      const v = L.crema[i];
      if (v > c.strato && this.inMano < c.capienzaMano) {
        const presa = Math.min((v - c.strato) * 0.6, c.capienzaMano - this.inMano);
        L.crema[i] = v - presa;
        this.inMano += presa;
        fatto++;
      }
    });
    if (this.inMano > 0.001) this.perCelle(x, y, c.raggioMano, (i) => {
      if (!L.pelle[i] || this.inMano <= 0) return;
      const v = L.crema[i];
      if (v >= c.strato) return;
      const data = Math.min(c.strato - v, this.inMano);
      L.crema[i] = v + data;
      this.inMano -= data;
      fatto++;
    });
    if (fatto) this.sporco = true;
    return fatto;
  }

  // crema su occhi o bocca: smorfia, urlo e secondi persi
  smorfia() {
    if (this.stordito > -0.5) return;   // un attimo di tregua tra un urlo e l'altro
    const c = this.cfg;
    this.stordito = 0.7;
    this.prec = null;
    this.trascorso += c.penalita;
    this.espressione('urlo', 0.9);
    Audio.sfx('ahia');
    vibra(70);
    scuoti(this, 220, 0.01);
    this.cameras.main.flash(120, 255, 80, 80);
    scritta(this, 150, 92, caso(c.frasiOcchi), { size: 15, color: '#ff6b5a' });
    scritta(this, 440, 50, `-${String(c.penalita).replace('.', ',')} SEC`, { size: 9, color: '#ff6b5a', durata: 900 });
    this.tweens.add({ targets: this.spost, sy: 1.1, sx: 0.95, duration: 70, yoyo: true, repeat: 2 });
  }

  // --- IL SOLE ---
  // le celle scoperte (o con la sabbia) si scottano, sempre più in fretta
  scotta(dt, p) {
    const c = this.cfg, L = this.lato;
    const passo = (dt / lerp(c.secondiRossoInizio, c.secondiRossoFine, p)) * c.rossa;
    let nuove = 0;
    for (let i = 0; i < L.pelle.length; i++) {
      if (!L.pelle[i] || L.scotta[i] >= 1) continue;
      if (L.crema[i] >= c.sogliaProtetta && !L.sabbia[i]) continue;
      const prima = L.scotta[i], dopo = Math.min(1, prima + passo * L.ritmo[i]);
      L.scotta[i] = dopo;
      if (prima < c.rossa && dopo >= c.rossa) nuove++;
      if (Math.floor(prima * 14) !== Math.floor(dopo * 14)) this.sporco = true;   // si ridisegna quando cambia colore
    }
    this.tBrucia -= dt;
    if (nuove && this.tBrucia <= 0) {
      this.tBrucia = 2.5;
      Audio.sfx('sfrigola');
      if (this.tFrase < 3.6) this.parla(caso(c.frasiBrucia));
      if (!this.girato && this.espr === 'normale') this.espressione('triste', 1);
    }
    // le zone rosso aragosta fumano
    this.tVapore -= dt;
    if (this.tVapore <= 0) {
      this.tVapore = 0.35;
      const cotte = [];
      for (let i = 0; i < L.pelle.length; i++) if (L.pelle[i] && L.scotta[i] >= 0.85) cotte.push(i);
      if (cotte.length) {
        const k = caso(cotte), m = this.aMondo(((k % GW) + 0.5) * CELLA, (Math.floor(k / GW) + 0.5) * CELLA);
        fumo(this, m.x, m.y, 1, 580);
      }
    }
  }

  // quanta pelle è protetta, scottata o piena di chiazze (in % di quella che ha preso il sole finora)
  conta() {
    const c = this.cfg;
    let esposte = 0, prot = 0, scot = 0, chiazze = 0;
    for (const L of this.girato ? [this.lati.fronte, this.lati.retro] : [this.lati.fronte]) {
      esposte += L.n;
      for (let i = 0; i < L.pelle.length; i++) {
        if (!L.pelle[i]) continue;
        if (L.scotta[i] >= c.rossa) scot++;
        else if (L.crema[i] > c.troppa) chiazze++;
        else if (L.crema[i] >= c.sogliaProtetta && !L.sabbia[i]) prot++;
      }
    }
    return { protetta: (prot / esposte) * 100, scottata: (scot / esposte) * 100, chiazze: (chiazze / esposte) * 100 };
  }

  // --- A METÀ PARTITA SI GIRA ---
  gira() {
    const c = this.cfg;
    this.girato = true;
    this.tFermo = 0.9;          // attrezzi fermi mentre si gira
    this.prec = null;
    this.perdonato = false;
    Audio.sfx('scivola');
    scritta(this, 240, 74, 'SI GIRA!', { size: 16, color: '#ffe14a', durata: 800 });
    this.parla(caso(c.frasiGira), 1600);
    this.tweens.add({
      targets: this.spost, sy: 0.06, duration: 190, ease: 'Sine.in',
      onComplete: () => {
        // il davanti resta com'era (ci è sdraiato sopra): da qui conta la schiena
        this.lato = this.lati.retro;
        this.imgCorpo.setTexture('botaRetro');
        this.imgTesta.setVisible(false);
        this.sporco = true;
        this.tDisegno = 0;
        this.tweens.add({ targets: this.spost, sy: 1, duration: 220, ease: 'Back.out' });
      },
    });
  }

  // --- DISTURBI ---
  disturbo() {
    const tipi = ['siMuove', 'arrivaOnda', 'vento'];
    if (!this.gabbiano && this.tFurto <= 0) tipi.push('arrivaGabbiano');
    this.ultimoDisturbo = caso(tipi.filter((t) => t !== this.ultimoDisturbo));
    this[this.ultimoDisturbo]();
  }

  // si allunga a prendere il telefono (in alto) o una birra dalla borsa frigo (in basso)
  siMuove() {
    const c = this.cfg, cosa = caso(['telefono', 'birra']), s = cosa === 'birra' ? 1 : -1;
    Audio.sfx('muovi');
    this.tweens.add({ targets: this.spost, x: s * 9, y: s * 11, rot: s * 0.06, duration: 150, ease: 'Quad.out', yoyo: true, hold: 1100 });
    this.parla(caso(c.frasiMuove[cosa]), 1200);
    const key = cosa === 'birra' ? 'lattina' : 'telefono';
    const o = im(this, CX + 4 + s * 9, CY + s * 74, key).setDepth(55).setScale(0);
    this.tweens.add({ targets: o, scale: scalaDi(key, 1.3), duration: 160, ease: 'Back.out' });
    this.tweens.add({ targets: o, alpha: 0, delay: 1250, duration: 200, onComplete: () => o.destroy() });
  }

  // un'onda arriva fino al telo e lava via la crema da una gamba
  arrivaOnda() {
    const s = Math.random() < 0.5 ? -1 : 1, y = CY + s * 19, punta = CX + 80;
    Audio.sfx('schizzo');
    scritta(this, 410, y - 26, 'ONDA!', { size: 10, color: '#bfe6ff', durata: 700 });
    const img = im(this, 500, y, 'ondaLido').setOrigin(0, 0.5).setDepth(60);
    this.onda = { img, y, punta, lavata: false };
    this.tweens.add({ targets: img, x: punta, duration: 750, ease: 'Sine.out', yoyo: true, hold: 260, onComplete: () => { img.destroy(); if (this.onda?.img === img) this.onda = null; } });
  }

  // l'onda è arrivata: via crema (e sabbia) da quello che ha coperto
  lava(o) {
    const c = this.cfg, L = this.lato;
    let n = 0;
    for (let i = 0; i < L.pelle.length; i++) {
      if (!L.pelle[i]) continue;
      const m = this.aMondo(((i % GW) + 0.5) * CELLA, (Math.floor(i / GW) + 0.5) * CELLA);
      if (m.x < o.punta + 8 || Math.abs(m.y - o.y) > 17) continue;
      if (L.crema[i] > 0 || L.sabbia[i]) n++;
      L.crema[i] = 0;
      L.sabbia[i] = 0;
    }
    this.sporco = true;
    if (n) scritta(this, o.punta + 40, o.y - 22, 'LAVATA VIA!', { size: 8, color: '#ffffff', durata: 700 });
    if (this.tFrase < 3.6) this.parla(caso(c.frasiOnda));
  }

  // una folata porta la sabbia: dove si posa la crema non protegge più, finché non la ripassi con la mano
  vento() {
    const c = this.cfg, L = this.lato, pelle = [];
    Audio.sfx('vento');
    scritta(this, 240, 74, 'VENTO!', { size: 11, color: '#f4dfb4', durata: 600 });
    for (let i = 0; i < 24; i++) {
      const g = this.add.ellipse(-10 - Math.random() * 70, 56 + Math.random() * 180, 3, 1.6, 0xd2ae6e).setDepth(590);
      this.tweens.add({ targets: g, x: 500, y: g.y + (Math.random() - 0.5) * 40, duration: 500 + Math.random() * 400, onComplete: () => g.destroy() });
    }
    for (let i = 0; i < L.pelle.length; i++) if (L.pelle[i]) pelle.push(i);
    const k = caso(pelle), x0 = ((k % GW) + 0.5) * CELLA, y0 = (Math.floor(k / GW) + 0.5) * CELLA;
    this.time.delayedCall(350, () => {
      if (!this.inCorso || this.lato !== L) return;
      this.perCelle(x0, y0, c.raggioSabbia, (i) => { if (L.pelle[i]) L.sabbia[i] = 1; });
      this.sporco = true;
      const m = this.aMondo(x0, y0);
      scritta(this, m.x, m.y - 22, 'SABBIA! RIPASSA!', { size: 8, color: '#fff3d6', durata: 800 });
      if (this.tFrase < 3.6) this.parla(caso(c.frasiSabbia));
    });
  }

  // un gabbiano punta il tubetto: va cacciato con un clic (o un tocco) prima che ci arrivi
  arrivaGabbiano() {
    const img = im(this, 498, 100, 'gabbiano_0').setDepth(70).setFlipX(true);
    this.gabbiano = { img, t: 0, x0: 498, y0: 100 };
    Audio.sfx('gabbiano');
    scritta(this, 400, 84, perDito('GABBIANO! CLICCALO!', 'GABBIANO! TOCCALO!'), { size: 8, color: '#ffffff', durata: 900 });
  }

  caccia() {
    const g = this.gabbiano;
    this.gabbiano = null;
    Audio.sfx('gabbiano');
    Audio.sfx('pof');
    stelle(this, g.img.x, g.img.y, 5, 610);
    scritta(this, Math.min(g.img.x - 14, 446), g.img.y - 20, 'SCIÒ!', { size: 11, color: '#7dff9a', durata: 500 });
    g.img.setTexture('gabbiano_1');
    this.tweens.add({ targets: g.img, x: 530, y: g.img.y - 90, duration: 450, ease: 'Quad.in', onComplete: () => g.img.destroy() });
  }

  // ce l'ha fatta: per qualche secondo niente tubetto
  ruba() {
    const c = this.cfg, g = this.gabbiano;
    this.gabbiano = null;
    this.tFurto = c.gabbianoFurto;
    Audio.sfx('rubato');
    scritta(this, TUBO.x - 34, TUBO.y - 34, 'TUBETTO RUBATO!', { size: 9, color: '#ff9a8a', durata: 900 });
    this.iconaTubo.setVisible(false);
    g.img.setTexture('gabbiano_1');
    const preda = im(this, g.img.x - 12, g.img.y + 5, 'tubettoCrema', 0.6).setDepth(71).setAngle(70);
    this.tweens.add({ targets: [g.img, preda], x: '+=50', y: '-=280', duration: 900, ease: 'Quad.in', onComplete: () => { g.img.destroy(); preda.destroy(); } });
  }

  // gabbiano, onda e tubetto rubato, fotogramma per fotogramma
  comparse(dt) {
    const c = this.cfg, g = this.gabbiano, o = this.onda;
    if (g) {
      g.t += dt;
      const k = Math.min(1, g.t / c.gabbianoTempo);
      g.img.setPosition(lerp(g.x0, TUBO.x + 16, k), lerp(g.y0, TUBO.y - 24, k) - Math.abs(Math.sin(g.t * 9)) * 5);   // arriva saltellando
      g.img.setTexture(Math.sin(g.t * 9) > 0 ? 'gabbiano_0' : 'gabbiano_1');
      if (k >= 1) this.ruba();
    }
    if (o && !o.lavata && o.img.x <= o.punta + 3) { o.lavata = true; this.lava(o); }
    if (this.tFurto > 0) {
      this.tFurto -= dt;
      if (this.tFurto <= 0) {
        // lo lascia cadere dall'alto
        this.iconaTubo.setVisible(true).setY(TUBO.y - 60);
        this.tweens.add({ targets: this.iconaTubo, y: TUBO.y + 1, duration: 320, ease: 'Bounce.out' });
        Audio.sfx('tonfo');
        scritta(this, TUBO.x - 6, TUBO.y - 30, 'È TORNATO!', { size: 8, color: '#7dff9a', durata: 600 });
      }
    }
  }

  // --- DISEGNO DI CREMA E SCOTTATURA ---
  ridisegna() {
    const c = this.cfg, L = this.lato, d = this.miniDati.data, n = GW * GH;
    // un pixel per cella: sotto la scottatura (rosa, poi rossa, poi rosso aragosta), sopra la crema
    // (un velo lucido se è giusta, bianco pieno se è troppa)
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
          const ca = v <= c.strato ? (v / c.strato) * 0.5 : lerp(0.5, 0.97, Math.min(1, (v - c.strato) / (c.troppa - c.strato)));
          const tot = ca + a * (1 - ca);
          r = (255 * ca + r * a * (1 - ca)) / tot; g = (255 * ca + g * a * (1 - ca)) / tot; b = (255 * ca + b * a * (1 - ca)) / tot;
          a = tot;
        }
      }
      d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = a * 255;
    }
    // le celle fuori dalla pelle prendono il colore delle vicine: così, ingrandendo, il bordo
    // non sfuma verso il trasparente (a ritagliarlo ci pensa la maschera)
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
    // le gocce non ancora spalmate: mucchietti bianchi col bordo, ben visibili sulla pelle chiara
    k.strokeStyle = 'rgba(110,140,185,0.6)';
    k.lineWidth = DB * 0.3;
    for (let passata = 0; passata < 2; passata++) for (let i = 0; i < n; i++) {
      const v = L.crema[i];
      if (!L.pelle[i] || v <= c.strato * 1.4) continue;
      const rr = U * (0.34 + Math.min(1, (v - c.strato) / 5) * 0.6);
      k.beginPath(); k.arc(((i % GW) + 0.5) * U, (Math.floor(i / GW) + 0.5) * U, rr, 0, Math.PI * 2);
      if (passata) { k.fillStyle = '#ffffff'; k.fill(); } else k.stroke();     // prima tutti i bordi, poi il bianco: i mucchietti vicini si fondono
    }
    // riflessi dove è spalmata bene, granelli dove c'è la sabbia
    for (let i = 0; i < n; i++) {
      if (!L.pelle[i]) continue;
      const x = ((i % GW) + 0.5) * U, y = (Math.floor(i / GW) + 0.5) * U, v = L.crema[i];
      if (L.sabbia[i]) {
        for (let j = 0; j < 5; j++) {
          const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453, fx = h - Math.floor(h), h2 = Math.sin(i * 39.346 + j * 11.135) * 12543.123, fy = h2 - Math.floor(h2);
          k.fillStyle = j % 2 ? 'rgba(150,112,58,0.95)' : 'rgba(226,196,138,0.95)';
          k.fillRect(x + (fx - 0.5) * U, y + (fy - 0.5) * U, DB * 0.55, DB * 0.55);
        }
      } else if (v >= c.sogliaProtetta && v <= c.strato * 1.4 && (i + Math.floor(i / GW)) % 2 === 0) {
        k.fillStyle = 'rgba(255,255,255,0.75)';
        k.beginPath(); k.ellipse(x - U * 0.12, y - U * 0.16, U * 0.2, U * 0.085, -0.55, 0, Math.PI * 2); k.fill();
      }
    }
    k.globalCompositeOperation = 'destination-in';
    k.drawImage(L.maschera, 0, 0, W, H);
    k.globalCompositeOperation = 'source-over';
    this.texStrato.refresh();
    this.sporco = false;
  }

  risultato() {
    const c = this.cfg, s = this.conta();
    const prot = Math.round(s.protetta), scot = Math.floor(s.scottata), chiazze = Math.round(s.chiazze);
    const bonus = Math.round(Phaser.Math.Clamp(this.crema / c.tubetto, 0, 1) * c.bonusTubetto);
    return {
      punteggio: Math.max(0, Math.round(prot - scot * c.malusScottata - chiazze * c.malusChiazze + bonus)),
      vittoria: scot < c.sogliaScottata,
      riepilogo: `Protetta ${prot}%, scottata ${scot}%` + (chiazze ? `, chiazze ${chiazze}%` : '') + (bonus ? `, +${bonus} crema avanzata` : ''),
    };
  }

  // il Bota si alza e si guarda: abbronzato alla perfezione, oppure rosso aragosta
  finale(ris, fatto) {
    this.tweens.killTweensOf(this.spost);
    for (const o of [...this.hudBota, this.tubo, this.mano, this.cremaMano, this.gabbiano?.img, this.onda?.img]) o?.setVisible(false);
    this.fum?.destroy();
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.82, duration: 300 });
    this.tweens.add({ targets: this.corpo, alpha: 0, duration: 250 });      // si alza dal telo...
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
        // rigido come un robot: guai a sfiorarlo
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
