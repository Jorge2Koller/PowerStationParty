// Microgioco 15: "Emilio in Retromarcia" - fai uscire Emilio dal cancello senza che tocchi i cani. SPINGI!
//
//  Il vialetto è visto dall'alto: la casa col portico a sinistra, il cancello a destra, prato
//  sopra e sotto. I personaggi stanno in piedi e chi è più in basso copre chi è dietro.
//  LA MACCHINA la guida il computer: esce in retromarcia verso destra, a scatti. Prima di ogni
//  scatto si accendono le luci bianche e fa "bip bip". Dietro la coda c'è la zona rossa: se
//  la macchina arriva addosso a un cane che sta lì, è uno spavento (niente di cruento: il cane
//  salta di lato) e si perde una vita.
//  I CANI (array "cani" in config.js) hanno ognuno la sua fissa: il pigro si sdraia dietro la
//  ruota, quello della pallina la rincorre, il goloso va dietro ai biscotti.
//  IL GIOCATORE: li SPINGE camminandoci contro, LANCIA biscotti e palline (SPAZIO: un tiro in
//  avanti; tasto destro: lì dove punti; il gioco sceglie da solo quello che serve: il biscotto
//  per il goloso, la pallina per l'altro) e RACCOGLIE quelli che compaiono in giro. Se si mette
//  dietro la coda e la macchina in moto gli arriva addosso, finisce per terra KO per un paio di
//  secondi (le stelline che girano): poi si rialza e per un attimo lampeggia.
//  Tre atti: all'inizio tranquillo; da 12 secondi EMILIO SI DISTRAE (radio, bandana, telefono:
//  va più forte); negli ultimi 12 PASSA IL GATTO e tutti i cani gli vanno dietro, nella zona
//  rossa. PASTAFFI (Denny) lo chiama chi gioca, col pulsante in basso a destra (o C): esce di casa,
//  prende in braccio il cane più vicino alla coda e lo porta nel prato, ed Emilio inchioda un attimo.
//  Poi va ricaricato (scheda 2: "Denny deve essere chiamato dal giocatore"; prima usciva da solo
//  quando passava il gatto).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { VIALETTO as V, CANE } from '../grafica/vialetto.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, pannello, scuoti, puntatore, colpetto, lerp, caso, quanti, eTouch, vibra, multiTouch } from '../fx.js';

const S = V.strada, K = V.corsia, CAMPO = V.campo, A = V.auto;
const TAGLIA = 0.4;                         // grandezza dei personaggi sul vialetto
const SCALA_AUTO = 0.9;
const SCALA_TESTA = 0.377;                  // la testa di Emilio dietro il finestrino
const SCALA_CANE = 0.7;
const LUNGA = A.coda * SCALA_AUTO;          // dalla coda al muso, a terra
const CENTRO = K.y - K.prof / 2;            // il centro della corsia
const R_CANE = 8;                           // mezzo cane
const ICONE = { biscotto: { x: 30, y: 247 }, pallina: { x: 62, y: 247 } };
const DENNY = { x: 452, y: 247 };            // il pulsante per chiamare Pastaffi
const NOMI = { biscotto: 'BISCOTTO', pallina: 'PALLINA' };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const limita = Phaser.Math.Clamp;
const tra = (a, b) => a + Math.random() * (b - a);   // (solo per le frasi: il gioco usa this.tra, col seme)
// i cani si chiamano tutti Morgan: chi non ha il nome in config.js prende il suo numero romano
const ROMANI = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const romano = (n) => ROMANI.reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');

export class RetromarciaScene extends MicrogiocoBase {
  constructor() { super('retromarcia'); }

  // scelte che cambiano la partita: col seme del round, uguali per tutti i giocatori
  tra(a, b) { return a + this.rnd() * (b - a); }
  pesca(a) { return a[Math.floor(this.rnd() * a.length)]; }

  prepara() {
    this.rnd = casuale(Sessione.seme);
    const c = this.cfg, id = this.giocatore.id;
    im(this, 0, 0, 'bgVialetto').setOrigin(0);
    // quello che sta in giardino e copre (o è coperto da) chi passa
    im(this, V.cuccia.x, V.cuccia.y, 'cuccia').setOrigin(0.5, 42 / 44).setDepth(100 + V.cuccia.y);
    for (const [x, y] of V.vasi) im(this, x, y, 'vasoGerani').setOrigin(0.5, 23 / 24).setDepth(100 + y);
    for (const [x, y] of V.pilastri) im(this, x, y, 'pilastro').setOrigin(0.5, 33 / 34).setDepth(100 + y);
    this.gZona = this.add.graphics().setDepth(3);
    this.gMira = this.add.graphics().setDepth(940);

    this.vite = c.vite;
    this.distrattoDetto = false;   // annuncio del secondo atto fatto
    this.salvataggi = 0;      // cani tolti dalla zona rossa all'ultimo istante
    this.scattiPuliti = 0;    // scatti della macchina finiti senza spaventare nessun cane...
    this.serieScatti = 0;     // ...quanti di fila (uno spavento la azzera)...
    this.puntiScatti = 0;     // ...e quanto valgono: il k-esimo di fila vale k volte puntiScatto
    this.uscita = false;      // la macchina ha passato il cancello
    this.muni = { ...c.munizioni };
    this.armato = null;       // col dito: l'icona toccata, in attesa del punto dove lanciare
    this.oggetti = [];        // biscotti e palline a terra
    this.voli = [];           // ...e in volo
    this.raccolte = [];       // munizioni da andare a prendere
    this.tNuova = 3;
    this.pasta = null;        // Pastaffi, quando è fuori
    this.ricaricaDenny = c.pastaffi.primo;   // secondi prima di poterlo chiamare (di nuovo)
    this.gatto = null;
    this.gattoFatto = false;
    this.meta = null;         // dove sto andando (clic o dito)
    this.dito = null;
    this.tAvviso = 0;
    this.tFrase = 3.5;
    this.tNota = 0.6;
    this.tFumo = 0;
    this.hud = '';
    this.fum = null;

    // --- la macchina: la testa di Emilio sta dietro il vetro (si vedono solo bandana e occhiali) ---
    const pr = 100 + K.y;
    this.auto = { x: V.partenza, v: 0, stato: 'ferma', t: c.primaPartenza, vMeta: 0, tScatto: 0, tBip: 0, distratto: null };
    this.interno = this.add.rectangle(0, 0, 73 * SCALA_AUTO, 13 * SCALA_AUTO, 0x9fb0bd).setDepth(pr - 0.3);      // l'abitacolo, chiaro: la testa ci si staglia contro
    this.testa = im(this, 0, 0, 'emilio_normale', SCALA_TESTA).setOrigin(0.5, 0).setDepth(pr - 0.2);
    this.testa.setCrop(0, 0, this.testa.frame.width, this.testa.frame.height * (88 / 144));
    this.schermo = this.add.rectangle(0, 0, 3.4, 5.4, 0xbfe6ff).setStrokeStyle(0.7, 0x1f1430).setDepth(pr - 0.1).setVisible(false);   // il telefono
    this.autoImg = im(this, 0, 0, 'wagon', SCALA_AUTO).setOrigin(A.coda / A.w, A.suolo / A.h).setDepth(pr);
    this.luce = im(this, 0, 0, 'luceRetro', 1).setDepth(pr + 0.1).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    this.corna = im(this, 0, 0, 'manoCorna', 0.62).setOrigin(0.5, 1).setDepth(pr + 0.2).setVisible(false);
    // per gli spaventi: la portiera aperta ed Emilio dietro, con le mani nella bandana
    this.emilioGiu = im(this, 0, 0, 'emilio_disperato', TAGLIA).setOrigin(0.5, 1).setDepth(pr + 2).setVisible(false);
    this.portiera = im(this, 0, 0, 'wagonPortiera', SCALA_AUTO).setOrigin(23 / 26, 2.4 / 44).setDepth(pr + 3).setVisible(false);

    // --- io e i cani ---
    // (ko: il volo e il tempo a terra, quando la macchina mi stende; tIntoccabile: dopo, quanto lampeggio ancora)
    this.io = { x: 250, y: 214, dx: 1, dy: 0, fermo: true, key: '', tEspr: 0, ko: null, tIntoccabile: 0,
      ombra: this.add.ellipse(250, 213, 22, 6, 0x000000, 0.3).setDepth(9),
      img: im(this, 250, 214, `${id}_normale`, TAGLIA).setOrigin(0.5, 1) };
    // le stelline che girano sulla testa di chi è KO: una si spegne per ogni terzo del tempo che passa
    this.stelleKO = [0, 1, 2].map(() => im(this, 0, 0, 'stella', 1.1).setVisible(false));
    const posti = [[318, 146], [300, 210], [392, 206], [350, 132], [420, 172]];
    this.cani = c.cani.map((d, i) => {
      const [x, y] = posti[i % posti.length];
      return { i, d, nome: d.nome ?? `Morgan ${romano(i + 1)}`, tipo: d.personalita, x, y, vx: 0, vy: 0, stato: 'gira', t: 0.6 + i * 0.5, meta: null, verso: i % 2 ? -1 : 1, key: '',
        pericolo: false, tSalvo: 0, oggetto: null, salto: null, inMoto: false, rosso: null,
        ombra: this.add.ellipse(x, y, 20, 5, 0x000000, 0).setDepth(9),
        img: im(this, x, y, `cane${i}_a`, SCALA_CANE).setOrigin(CANE.ox, CANE.oy),
        etichetta: txt(this, x, y - 25, '', { size: 7, depth: 930 }) };
    });

    // --- in alto: metri e vite; in basso: biscotti e palline ---
    this.testoMetri = txt(this, 218, 22, '', { size: 10, depth: 1001, thick: 3 });
    this.zampe = [...Array(c.vite).keys()].map((i) => im(this, 290 + i * 14, 22, 'zampa', 0.95).setDepth(1001));
    this.hudV = [pannello(this, 240, 22, 200, 18, { depth: 1000 }), this.testoMetri, ...this.zampe];
    this.slot = {};
    for (const tipo of ['biscotto', 'pallina']) {
      const P = ICONE[tipo];
      this.slot[tipo] = { g: this.add.graphics().setDepth(1000), ico: im(this, P.x, P.y - 2, tipo, tipo === 'biscotto' ? 1.15 : 1.5).setDepth(1001), n: txt(this, P.x + 9, P.y + 8, '', { size: 7, depth: 1002 }) };
      this.hudV.push(...Object.values(this.slot[tipo]));
    }
    this.testoSotto = txt(this, 96, 263, eTouch() ? '' : 'FRECCE: muoviti   SPAZIO: lancia   destro: lancia lì   C: Denny', { ox: 0, size: 7, depth: 1001 });
    this.hudV.push(this.testoSotto);
    this.slotDenny = { g: this.add.graphics().setDepth(1000), ico: im(this, DENNY.x, DENNY.y - 1, 'icoPastaffi', 0.85).setDepth(1001),
      n: txt(this, DENNY.x, DENNY.y + 13, 'DENNY', { size: 6.5, depth: 1002 }) };
    this.hudV.push(...Object.values(this.slotDenny));
    this.aggiornaHud(true);
    this.piazzaAuto();

    // --- comandi ---
    this.tasti = this.input.keyboard.addKeys({ su: 'UP', giu: 'DOWN', sx: 'LEFT', dx: 'RIGHT', w: 'W', a: 'A', s: 'S', d: 'D' });
    this.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) this.lanciaAvanti(); });
    this.input.keyboard.on('keydown-C', (e) => { if (!e.repeat) this.chiamaDenny(); });
    this.input.mouse?.disableContextMenu();
    multiTouch(this);
    this.input.on('pointerdown', (p) => {
      if (!this.inCorso) return;
      const w = puntatore(this, p);
      for (const tipo of ['biscotto', 'pallina']) if (dist(w, ICONE[tipo]) < 15) return this.toccaIcona(tipo, p.wasTouch);
      if (dist(w, DENNY) < 16) return this.chiamaDenny();
      if (p.wasTouch && this.armato) { const tipo = this.armato; this.armato = null; this.lancia(w.x, w.y, tipo); return this.aggiornaHud(true); }
      if (!p.wasTouch && (p.rightButtonDown() || p.event?.ctrlKey)) return this.lancia(w.x, w.y);
      this.dito = p.id;
      this.vaiA(w, p.wasTouch);
    });
    this.input.on('pointermove', (p) => { if (p.isDown && this.dito === p.id) this.vaiA(puntatore(this, p), p.wasTouch); });
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => {
      if (this.dito !== p.id) return;
      this.dito = null;
      if (p.wasTouch) this.meta = null;      // col dito ci si ferma quando lo si alza; col clic si arriva fino al punto
    });
  }

  // dopo una pausa il dito che trascinava non c'è più
  alRientro() { this.dito = null; this.meta = null; }

  // ------------------------------------------------------------
  //  ATTREZZI
  // ------------------------------------------------------------
  // sposta "o" verso un punto a velocità v; ritorna true quando gli è arrivato a meno di "vicino"
  vai(o, x, y, v, dt, vicino = 1) {
    const dx = x - o.x, dy = y - o.y, d = Math.hypot(dx, dy), passo = v * dt;
    if (d <= Math.max(passo, vicino)) { if (d <= passo) { o.x = x; o.y = y; } return true; }
    o.x += (dx / d) * passo; o.y += (dy / d) * passo;
    if (Math.abs(dx) > 1) o.verso = dx > 0 ? 1 : -1;
    return false;
  }

  // dentro il campo (il prato sopra c'è solo a destra della casa)
  nelCampo(o, margine = 0) {
    o.x = limita(o.x, CAMPO.x0 - margine, CAMPO.x1 + margine);
    o.y = limita(o.y, V.cima(o.x) - margine, CAMPO.fondo + margine);
  }

  sullaGhiaia(o) { return o.y > S.y0 + 3 && o.y < S.y1 - 3; }
  // è a terra dentro la zona rossa?
  inZona(o) { const Au = this.auto; return o.x > Au.x - 2 && o.x < Au.x + this.cfg.zona && o.y > K.y - K.prof + 2 && o.y < K.y + 2; }
  get attiva() { return ['avviso', 'muove', 'frena'].includes(this.auto.stato); }

  // un punto della macchina (in unità della sua texture) sullo schermo
  px(tx) { return this.auto.x - (A.coda - tx) * SCALA_AUTO; }
  py(ty) { return K.y - (A.suolo - ty) * SCALA_AUTO; }

  avviso(s) {
    if (this.tAvviso > 0) return;
    this.tAvviso = 0.9;
    Audio.sfx('tsk');
    scritta(this, limita(this.io.x, 60, 420), this.io.y - 70, s, { size: 7, color: '#ff9a8a', durata: 600, depth: 950 });
  }

  parlaEmilio(s, ms = 1400) {
    this.fum?.destroy();
    this.fum = fumetto(this, limita(this.px(A.finestrino.x) + 26, 70, 400), this.py(4) - 12, s, ms, 945);
    this.tFrase = Math.max(this.tFrase, 3.5);
  }

  // ------------------------------------------------------------
  aggiorna(dt, p) {
    const c = this.cfg;
    this.tAvviso -= dt;
    this.muovi(dt);
    this.aggiornaAuto(dt, p);
    if (!this.inCorso) return;
    this.ricaricaDenny = Math.max(0, this.ricaricaDenny - dt);
    this.aggiornaPastaffi(dt);
    this.aggiornaGatto(dt);
    this.aggiornaCani(dt, p);
    this.aggiornaOggetti(dt, p);
    this.disegna();
    // secondo atto: Emilio comincia a distrarsi
    if (!this.distrattoDetto && p > c.distrattoDa) {
      this.distrattoDetto = true;
      Audio.sfx('bonus');
      scritta(this, 240, 96, 'EMILIO SI DISTRAE!', { size: 14, color: '#ffe14a', durata: 1000, depth: 960 });
    }
    // gli ultimi secondi: passa il gatto (in Lampo in proporzione)
    if (!this.gattoFatto && this.tempoRimasto <= (c.gatto.a * this.durata) / c.durata) this.passaIlGatto();
    // ogni tanto Emilio dice la sua dal finestrino
    this.tFrase -= dt;
    if (this.tFrase <= 0 && this.auto.stato !== 'incidente') { this.tFrase = tra(4.5, 7.5); this.parlaEmilio(caso(c.frasi)); }
    this.aggiornaHud();
  }

  // ------------------------------------------------------------
  //  IL GIOCATORE
  // ------------------------------------------------------------
  vaiA(w, colDito) {
    // col dito il personaggio sta un po' sopra il polpastrello, così si vede
    const m = { x: w.x, y: w.y - (colDito ? 12 : 0) };
    this.nelCampo(m);
    this.meta = m;
  }

  muovi(dt) {
    const c = this.cfg, io = this.io, t = this.tasti, Au = this.auto;
    if (io.ko) return this.aggiornaKO(dt);
    // appena rialzato lampeggio: la macchina, per ora, fa solo da muro
    if (io.tIntoccabile > 0) {
      io.tIntoccabile -= dt;
      const a = io.tIntoccabile > 0 && Math.floor(io.tIntoccabile * 10) % 2 ? 0.35 : 1;
      io.img.setAlpha(a); io.ombra.setAlpha(a);
    }
    let vx = 0, vy = 0;
    const dx = (t.dx.isDown || t.d.isDown ? 1 : 0) - (t.sx.isDown || t.a.isDown ? 1 : 0);
    const dy = (t.giu.isDown || t.s.isDown ? 1 : 0) - (t.su.isDown || t.w.isDown ? 1 : 0);
    if (dx || dy) {
      const L = Math.hypot(dx, dy);
      vx = (dx / L) * c.velGiocatore; vy = (dy / L) * c.velGiocatore;
      this.meta = null;
    } else if (this.meta) {
      const d = dist(this.meta, io);
      if (d < 1.5) { if (this.dito == null) this.meta = null; }
      else { const v = Math.min(c.velGiocatore, d * 12); vx = ((this.meta.x - io.x) / d) * v; vy = ((this.meta.y - io.y) / d) * v; }
    }
    const vel = Math.hypot(vx, vy);
    io.fermo = vel < 12;
    if (!io.fermo) { io.dx = vx / vel; io.dy = vy / vel; }
    io.x += vx * dt; io.y += vy * dt;
    this.nelCampo(io);
    // la macchina non si attraversa: fuori dal lato più vicino
    const x0 = Au.x - LUNGA - 5, x1 = Au.x + 7, y0 = K.y - K.prof - 5, y1 = K.y + 5;
    // ...ma se sto dietro la coda e la macchina mi viene addosso, mi stende (vedi travolto)
    if (Au.v > 2 && io.tIntoccabile <= 0 && io.x > Au.x - 6 && io.x < x1 && io.y > y0 && io.y < y1) return this.travolto();
    if (io.x > x0 && io.x < x1 && io.y > y0 && io.y < y1) {
      const fuori = [[io.x - x0, () => { io.x = x0; }], [x1 - io.x, () => { io.x = x1; }], [io.y - y0, () => { io.y = y0; }], [y1 - io.y, () => { io.y = y1; }]];
      fuori.sort((a, b) => a[0] - b[0])[0][1]();
    }
    // camminando contro un cane lo spingo dalla parte dove sto andando
    if (!io.fermo) for (const k of this.cani) {
      if (k.stato === 'portato' || k.stato === 'salto') continue;
      const ex = k.x - io.x, ey = k.y - io.y;
      if (Math.hypot(ex, ey) < c.raggioSpinta && ex * io.dx + ey * io.dy > -3) this.spingi(k);
    }
    if (io.tEspr > 0) io.tEspr -= dt;
    const key = `${this.giocatore.id}_${io.tEspr > 0 ? 'felice' : 'normale'}`;
    if (key !== io.key) { io.key = key; io.img.setTexture(key); }
    if (Math.abs(vx) > 4) io.img.setFlipX(vx < 0);
    io.img.setPosition(io.x, io.y - (io.fermo ? 0 : Math.abs(Math.sin(this.trascorso * 13)) * 2)).setDepth(100 + io.y);
    io.ombra.setPosition(io.x, io.y - 1);
  }

  spingi(k) {
    const c = this.cfg, io = this.io;
    if (k.stato !== 'spinto') {
      Audio.sfx('pof');
      vibra(15);
      if (k.stato === 'occupato' && k.oggetto) k.oggetto.preso = null;      // gli casca di bocca
    }
    // nella direzione in cui cammino, e un po' via da me; se è nella corsia della macchina, anche
    // un po' verso il bordo più vicino (una spinta lo deve togliere di lì, non farlo scorrere lungo la corsia)
    const ex = k.x - io.x, ey = k.y - io.y, d = Math.hypot(ex, ey) || 1;
    const fuori = k.y > K.y - K.prof && k.y < K.y + 2 ? (k.y < CENTRO ? -c.spintaFuori : c.spintaFuori) : 0;
    const ux = io.dx * 0.75 + (ex / d) * 0.25, uy = io.dy * 0.75 + (ey / d) * 0.25 + fuori, L = Math.hypot(ux, uy) || 1;
    Object.assign(k, { stato: 'spinto', t: c.durataSpinta, vx: (ux / L) * c.velSpinta, vy: (uy / L) * c.velSpinta, oggetto: null, meta: null });
  }

  // La macchina in retromarcia mi è arrivata addosso con la coda (scheda di valutazione: "se ti
  // metti dietro la macchina dovrebbe lasciarti per terra se ti tocca"): SBAM, un volo di lato fuori
  // dalla corsia (così la macchina passa e non mi ripiglia) e giù steso, KO. Emilio neanche se ne
  // accorge e va avanti: il guaio è che intanto i cani fanno quello che vogliono.
  travolto() {
    const c = this.cfg, io = this.io, su = io.y < CENTRO;
    const x1 = limita(io.x + 24, CAMPO.x0 + 14, CAMPO.x1 - 14), y1 = su ? K.y - K.prof - 13 : K.y + 14;
    io.ko = { t: 0, x0: io.x, y0: io.y, x1, y1, cip: 0.5, giu: false };
    io.tIntoccabile = 0; io.fermo = true;
    this.meta = null;
    this.armato = null;
    io.key = `${this.giocatore.id}_shock`;
    io.img.setTexture(io.key).setAlpha(1).setFlipX(false);
    io.ombra.setAlpha(1);
    Audio.sfx('sbam');
    vibra(100);
    scuoti(this, 160, 0.007);
    stelle(this, io.x, io.y - 22, 6, 950);
    scritta(this, limita(io.x + 10, 60, 420), io.y - 82, 'SBAM! KO!', { size: 12, color: '#ffe14a', durata: 800, depth: 955 });
    if (this.auto.stato !== 'incidente') this.parlaEmilio(caso(c.frasiKO), 1400);
    this.aggiornaHud(true);
    this.aggiornaKO(0);
  }

  // il volo, poi steso con le stelline, poi in piedi
  aggiornaKO(dt) {
    const c = this.cfg, io = this.io, K0 = io.ko, T = this.trascorso;
    K0.t += dt;
    const e = Math.min(1, K0.t / c.voloKO);
    io.x = lerp(K0.x0, K0.x1, e); io.y = lerp(K0.y0, K0.y1, e);
    // in volo gira su se stesso; a terra resta steso, con la testa dalla parte opposta alla macchina
    // (il centro della figura scende da mezza altezza, in piedi, a mezza larghezza, stesa)
    const alto = Math.sin(e * Math.PI) * 16, w = io.img.displayWidth, h = io.img.displayHeight;
    if (e < 1) io.img.setOrigin(0.5, 0.5).setAngle(e * 84 + Math.sin(e * Math.PI) * 200).setPosition(io.x, io.y - lerp(h * 0.5, w * 0.42, e) - alto);
    else {
      if (!K0.giu) {
        K0.giu = true;
        Audio.sfx('tonfo');
        fumo(this, io.x, io.y - 2, 4, 99 + io.y);
        colpetto(this, io.img, 1.15, 0.85);
      }
      io.img.setOrigin(0.5, 0.5).setAngle(84).setPosition(io.x, io.y - w * 0.42);
    }
    io.img.setDepth(100 + io.y);
    io.ombra.setPosition(io.x, io.y - 1).setScale(e < 1 ? 1 - alto / 40 : 2.1, 1);
    // le stelline (da quando tocco terra): girano in tondo sopra la testa, e una si spegne per ogni
    // terzo del KO che passa (così si vede quanto manca a rialzarsi)
    const resta = c.durataKO - K0.t, hx = io.x + h * 0.2, hy = io.y - w * 0.42 - 26;
    this.stelleKO.forEach((s, i) => {
      const a = T * 6 + (i * Math.PI * 2) / 3, accesa = K0.giu && resta > (i * c.durataKO) / 3;
      s.setVisible(accesa).setPosition(hx + Math.cos(a) * 16, hy + Math.sin(a) * 5).setAngle(T * 300).setDepth(100 + io.y + (Math.sin(a) > 0 ? 0.5 : -0.5));
    });
    // e gli uccellini cantano
    if (K0.giu && (K0.cip -= dt) <= 0) { K0.cip = 0.7; Audio.sfx('cipCip'); }
    if (resta > 0) return;
    // in piedi! (per un attimo lampeggio: la macchina non mi stende di nuovo)
    io.ko = null;
    io.tIntoccabile = c.invulnerabileKO;
    io.key = `${this.giocatore.id}_normale`;
    io.img.setTexture(io.key).setOrigin(0.5, 1).setAngle(0).setPosition(io.x, io.y);
    io.ombra.setScale(1);
    for (const s of this.stelleKO) s.setVisible(false);
    colpetto(this, io.img, 0.85, 1.2);
    Audio.sfx('salto');
  }

  // --- lanci ---
  // cosa lanciare: quello che piace al cane più vicino alla zona rossa (il biscotto al goloso, la
  // pallina all'altro); se è finito, l'altro
  sceltaAuto() {
    const Au = this.auto;
    let tipo = null, dMin = 1e9;
    for (const k of this.cani) {
      const vuole = k.tipo === 'goloso' ? 'biscotto' : k.tipo === 'pallina' ? 'pallina' : null;
      if (!vuole || this.muni[vuole] <= 0 || k.stato === 'portato' || k.stato === 'salto') continue;
      const d = Math.hypot(k.x - (Au.x + this.cfg.zona / 2), k.y - CENTRO);
      if (d < dMin) { dMin = d; tipo = vuole; }
    }
    return tipo ?? (this.muni.biscotto >= this.muni.pallina ? 'biscotto' : 'pallina');
  }

  // SPAZIO: un tiro in avanti, dove sto guardando
  lanciaAvanti() {
    const io = this.io, g = this.cfg.gittataTasto;
    this.lancia(io.x + io.dx * g, io.y + io.dy * g);
  }

  toccaIcona(tipo, colDito) {
    if (this.io.ko) return this.avviso('SEI KO!');
    if (colDito) {
      // col dito: l'icona si "arma", il prossimo tocco sul vialetto è il lancio
      if (this.muni[tipo] <= 0) this.avviso(`${NOMI[tipo]}: FINITE!`);
      else this.armato = this.armato === tipo ? null : tipo;
    }
    Audio.sfx('muovi');
    this.aggiornaHud(true);
  }

  lancia(x, y, voluto) {
    const c = this.cfg, io = this.io;
    if (!this.inCorso) return;
    if (io.ko) return this.avviso('SEI KO!');     // steso per terra non si lancia niente
    const tipo = voluto && this.muni[voluto] > 0 ? voluto : this.sceltaAuto();
    if (this.muni[tipo] <= 0) return this.avviso('NIENTE DA LANCIARE!');
    this.muni[tipo]--;
    // non oltre la gittata, e dentro il giardino
    const dx = x - io.x, dy = y - io.y, d = Math.hypot(dx, dy) || 1, g = Math.min(d, c.gittataMax);
    const P = { x: limita(io.x + (dx / d) * g, 20, 462), y: limita(io.y + (dy / d) * g, 62, 252) };
    const img = im(this, io.x, io.y - 36, tipo, tipo === 'biscotto' ? 0.8 : 0.9).setDepth(945);
    this.voli.push({ tipo, img, x0: io.x, y0: io.y - 36, P, t: 0, T: 0.3 + g / 260, arco: 14 + g * 0.18 });
    Audio.sfx('lancioGranata');
    if (Math.abs(dx) > 4) io.img.setFlipX(dx < 0);
    this.aggiornaHud(true);
  }

  // ------------------------------------------------------------
  //  LA MACCHINA DI EMILIO
  // ------------------------------------------------------------
  aggiornaAuto(dt, p) {
    const c = this.cfg, Au = this.auto;
    Au.t -= dt;
    if (Au.stato === 'ferma') {
      if (Au.t <= 0) this.preparaScatto(p);
    } else if (Au.stato === 'avviso') {
      // luci bianche e bip bip: sta per muoversi
      Au.tBip -= dt;
      if (Au.tBip <= 0) { Au.tBip = 0.28; Audio.sfx('bipRetro'); }
      if (Au.t <= 0) Au.stato = 'muove';
    } else if (Au.stato === 'muove') {
      Au.v = Math.min(Au.vMeta, Au.v + c.accelerazione * dt);
      Au.tBip -= dt;
      if (Au.tBip <= 0) { Au.tBip = 0.45; Audio.sfx('bipRetro'); }
      Au.tScatto -= dt;
      if (Au.tScatto <= 0) Au.stato = 'frena';
    } else if (Au.stato === 'frena') {
      Au.v = Math.max(0, Au.v - c.frenata * dt);
      if (Au.v <= 0) { this.scattoFinito(); this.fermaAuto((lerp(c.pausaInizio, c.pausaFine, p) * this.tra(0.75, 1.25)) / (Au.ritmo ?? 1)); }
    } else if (Au.stato === 'inchiodata') {
      if (Au.t <= 0) this.fermaAuto(0.25);
    } else if (Au.stato === 'incidente' && Au.t <= 0) {
      this.portiera.setVisible(false); this.emilioGiu.setVisible(false); this.testa.setVisible(true);
      this.fermaAuto(0.7);
    }
    if (Au.v > 0) {
      Au.x += Au.v * dt;
      this.tFumo -= dt;
      if (this.tFumo <= 0) {
        this.tFumo = 0.16;
        const f = im(this, this.px(A.scarico.x) + 4, this.py(A.scarico.y), 'fumo', 0.14).setAlpha(0.55).setDepth(99 + K.y);
        this.tweens.add({ targets: f, x: f.x + 9, y: f.y - 5, alpha: 0, scale: f.scale * 2.4, duration: 520, onComplete: () => f.destroy() });
      }
      if (Au.x >= V.cancello) { Au.x = V.cancello; this.uscita = true; this.scattoFinito(); this.piazzaAuto(); return this.termina(); }
    }
    // i cani davanti alla coda: se la macchina va, è uno spavento; se è ferma fa solo da muro
    for (const k of this.cani) {
      if (k.stato === 'portato' || k.stato === 'salto' || k.y <= K.y - K.prof + 2 || k.y >= K.y + 2) continue;
      if (k.x - R_CANE < Au.x && k.x > Au.x - 18) {
        if (Au.v > 2) { this.incidente(k); break; }
        k.x = Au.x + R_CANE;
      } else if (k.x <= Au.x - 18 && k.x > Au.x - LUNGA - 4) k.y = k.y < CENTRO ? K.y - K.prof + 1 : K.y + 3;       // sotto la macchina non si passa
    }
    this.piazzaAuto();
    // l'autoradio: qualche nota dal finestrino (tante, se ha alzato il volume)
    this.tNota -= dt;
    if (this.tNota <= 0 && Au.stato !== 'incidente') {
      this.tNota = Au.distratto === 'radio' ? 0.22 : 1.2;
      const n = im(this, this.px(A.finestrino.x) + Phaser.Math.Between(-6, 8), this.py(10), 'nota', 0.55).setDepth(946).setTint(caso([0xffffff, 0xffe14a, 0xff9ac4, 0x9ae0ff]));
      this.tweens.add({ targets: n, x: n.x + Phaser.Math.Between(-10, 14), y: n.y - 18, alpha: 0, angle: Phaser.Math.Between(-30, 30), duration: 800, onComplete: () => n.destroy() });
    }
  }

  // decide il prossimo scatto e accende le luci: da qui al movimento passa il tempo dell'avviso
  preparaScatto(p) {
    const c = this.cfg, Au = this.auto;
    const quanto = p <= c.distrattoDa ? 0 : c.distratto * (p - c.distrattoDa) / (1 - c.distrattoDa);
    const distratto = this.rnd() < quanto ? this.pesca(['radio', 'bandana', 'telefono']) : null;
    // "Faccio tardi!": se è indietro sulla tabella di marcia (dopo uno spavento o una frenata)
    // recupera, andando più forte e fermandosi meno
    const fatto = (Au.x - V.partenza) / (V.cancello - V.partenza), atteso = Math.min(1, (p / c.arrivo) ** c.curvaArrivo);
    const ritmo = limita(1 + (atteso - fatto - 0.05) * c.recupero, 1, c.recuperoMax);
    Object.assign(Au, {
      pulito: true,
      stato: 'avviso', t: lerp(c.avvisoInizio, c.avvisoFine, p), tBip: 0, distratto, ritmo,
      vMeta: lerp(c.velInizio, c.velFine, p) * this.tra(0.8, 1.2) * (distratto ? c.distrattoVel : 1) * ritmo,
      tScatto: this.tra(c.scatto[0], c.scatto[1]),
    });
    this.luce.setVisible(true);
    // più va avanti, più è distratto: alza la radio (corna rock dal finestrino), si sistema la bandana, guarda il telefono
    this.corna.setVisible(distratto === 'radio');
    this.schermo.setVisible(distratto === 'telefono');
    if (distratto) this.parlaEmilio(caso(c.frasiDistratto[distratto]), 1200);
  }

  // uno scatto finito senza spaventare nessuno: VIA LIBERA (è il punteggio di chi tiene la corsia sgombra)
  scattoFinito() {
    const Au = this.auto, c = this.cfg;
    if (!Au.pulito) return;
    Au.pulito = false;
    this.scattiPuliti++;
    this.serieScatti++;
    const vale = c.puntiScatto * this.serieScatti;
    this.puntiScatti += vale;
    scritta(this, limita(Au.x + 20, 60, 430), K.y - 40, `VIA LIBERA +${vale}`, { size: 7, color: '#7dff9a', durata: 450, depth: 950 });
  }

  fermaAuto(t) {
    Object.assign(this.auto, { stato: 'ferma', v: 0, t, distratto: null });
    this.luce.setVisible(false); this.corna.setVisible(false); this.schermo.setVisible(false);
  }

  piazzaAuto() {
    const Au = this.auto, T = this.trascorso;
    this.autoImg.setPosition(Au.x, K.y + (Au.v > 0 ? Math.sin(T * 42) * 0.25 : 0));
    this.interno.setPosition(this.px(83.5), this.py(22.6));
    // la testa dietro il vetro: dal finestrino spuntano solo la bandana e gli occhiali. Dondola
    // a tempo di musica; se si sistema la bandana scuote la testa, col telefono guarda in giù.
    const fx = this.px(A.finestrino.x), fy = this.py(A.finestrino.y) - 86 * SCALA_TESTA;
    const d = Au.distratto;
    this.testa.setPosition(fx + (d === 'bandana' ? Math.sin(T * 20) * 1.2 : 0), fy - Math.abs(Math.sin(T * 8.6)) * 0.8 + (d === 'telefono' ? 1.6 : 0)).setAngle(d === 'bandana' ? Math.sin(T * 20) * 7 : d === 'telefono' ? 7 : 0);
    this.schermo.setPosition(fx + 9, fy + 22);
    this.corna.setPosition(fx - 9, this.py(A.finestrino.y) - 2 - Math.abs(Math.sin(T * 9)) * 2.4).setAngle(-18 + Math.sin(T * 9) * 8);
    this.luce.setPosition(this.px(A.luce.x), this.py(A.luce.y)).setAlpha(Au.stato === 'avviso' ? 0.55 + 0.45 * Math.abs(Math.sin(T * 12)) : 1);
    this.portiera.setPosition(this.px(A.cardine.x), this.py(13));
    this.emilioGiu.setPosition(this.px(A.cardine.x) - 10, K.y + 2);
  }

  // la macchina è arrivata addosso a un cane: niente di grave, ma che spavento
  incidente(k) {
    const c = this.cfg, Au = this.auto;
    this.vite--;
    this.serieScatti = 0;
    Object.assign(Au, { stato: 'incidente', v: 0, t: c.durataIncidente, distratto: null, pulito: false });
    this.luce.setVisible(false); this.corna.setVisible(false); this.schermo.setVisible(false);
    Audio.sfx('frenata'); Audio.sfx('cai');
    scuoti(this, 240, 0.012);
    vibra(120);
    scritta(this, limita(k.x, 80, 400), k.y - 52, 'CAI CAI!', { size: 12, color: '#ff6b5a', durata: 700, depth: 955 });
    scritta(this, 240, 96, this.vite > 0 ? `CHE SPAVENTO!  -1 VITA` : 'CHE SPAVENTO!', { size: 14, color: '#ff6b5a', durata: 1100, depth: 960 });
    // il cane fa un salto comico di lato (le pieghe ballonzolano) e atterra nel prato
    const su = k.y < CENTRO;
    Object.assign(k, { stato: 'salto', pericolo: false, oggetto: null, meta: null,
      salto: { x0: k.x, y0: k.y, x1: limita(k.x + 30, 190, 440), y1: su ? S.y0 - 14 : S.y1 + 12, t: 0, T: 0.7 } });
    // Emilio scende e si dispera: basso com'è, dietro la portiera quasi sparisce
    this.testa.setVisible(false);
    this.portiera.setVisible(true);
    this.emilioGiu.setVisible(true);
    this.piazzaAuto();
    colpetto(this, this.emilioGiu, 1.15, 0.9);
    this.parlaEmilio(caso(c.frasiIncidente), 1900);
    // e Pastaffi, dalla porta di casa
    this.time.delayedCall(900, () => { if (!this.finito) fumetto(this, V.porta.x + 44, V.porta.y - 60, caso(c.frasiPastaffiSpavento), 1500, 946); });
    this.aggiornaHud(true);
    if (this.vite <= 0) this.time.delayedCall(1100, () => this.termina());
  }

  // ------------------------------------------------------------
  //  I CANI
  // ------------------------------------------------------------
  // dove va a sdraiarsi il pigro: proprio dietro la ruota
  // (finché la macchina va o sta per partire, la segue camminando di fianco alla corsia: sotto
  //  non ci si butta; appena è ferma, due passi e si sdraia. Se è già lì, ci resta.)
  dietroLaRuota(k) {
    // (se i pigri sono più d'uno, ognuno si sdraia un po' più in là del precedente)
    const quale = this.cani.filter((q) => q.tipo === 'pigro').indexOf(k);
    const Au = this.auto, x = Math.min(Au.x + this.cfg.pigroDietro + Math.max(0, quale) * 16, CAMPO.x1 - 4);
    return Au.stato === 'ferma' || this.inZona(k) ? { x, y: K.y - 8 } : { x: Math.min(x + (Au.v > 0 ? 22 : 6), CAMPO.x1 - 4), y: K.y + 8 };
  }

  // dove va a spasso un cane: ogni tanto proprio dietro la macchina, se no in giro per il vialetto
  nuovaMeta(k, p) {
    const c = this.cfg, Au = this.auto;
    if (this.rnd() < lerp(c.vogliaZonaInizio, c.vogliaZonaFine, p)) return { x: Math.min(Au.x + this.tra(10, c.zona - 4), CAMPO.x1 - 6), y: this.tra(K.y - K.prof + 6, K.y - 3) };
    for (let prove = 0; prove < 8; prove++) {
      const m = { x: this.tra(Math.max(110, Au.x - 60), CAMPO.x1 - 8), y: this.tra(S.y0 + 8, S.y1 - 5) };
      if (!(m.x < Au.x + 8 && m.y > K.y - K.prof - 4 && m.y < K.y + 4)) return m;      // non sotto la macchina
    }
    return { x: Math.min(Au.x + 60, CAMPO.x1 - 8), y: S.y1 - 8 };
  }

  // il biscotto o la pallina che interessa a questo cane (quello più vicino)
  oggettoPer(k) {
    const vuole = k.tipo === 'goloso' ? 'biscotto' : k.tipo === 'pallina' ? 'pallina' : null;
    let meglio = null, dMin = 1e9;
    for (const o of this.oggetti) if (o.tipo === vuole && !o.preso && !o.via) { const d = dist(o, k); if (d < dMin) { dMin = d; meglio = o; } }
    return meglio;
  }

  // finito quello che stava facendo: riprende a fare di testa sua
  dopo(k, attesa) {
    const c = this.cfg, p = this.progresso;
    k.oggetto = null; k.meta = null;
    if (!this.sullaGhiaia(k)) return Object.assign(k, { stato: 'sicuro', t: attesa ?? lerp(c.sicuroInizio, c.sicuroFine, p) });   // nel prato ci resta un po'
    Object.assign(k, { stato: 'gira', t: attesa ?? (k.tipo === 'pigro' ? lerp(c.pigroPausa, c.pigroPausaFine, p) : 0.7) });
  }

  aggiornaCani(dt, p) {
    const c = this.cfg, Au = this.auto;
    for (const k of this.cani) {
      const x0 = k.x, y0 = k.y;
      k.tSalvo -= dt;
      // il suo oggetto preferito è nei paraggi? Molla tutto e ci corre (il pigro no)
      if (['gira', 'sicuro', 'gatto'].includes(k.stato)) {
        const o = this.oggettoPer(k);
        if (o) { Object.assign(k, { stato: 'insegue', oggetto: o }); Audio.sfx('bau'); }
      }
      if (k.stato === 'salto') {
        const s = k.salto;
        s.t += dt;
        const e = Math.min(1, s.t / s.T);
        k.x = lerp(s.x0, s.x1, e); k.y = lerp(s.y0, s.y1, e);
        if (e >= 1) { k.salto = null; this.dopo(k, c.sicuroInizio + 1); }
      } else if (k.stato === 'spinto') {
        // qualche passo ciondolando, rallentando
        k.t -= dt;
        const f = Math.max(0, k.t / c.durataSpinta);
        k.x += k.vx * f * dt; k.y += k.vy * f * dt;
        if (Math.abs(k.vx) > 6) k.verso = k.vx > 0 ? 1 : -1;
        if (k.t <= 0) this.dopo(k);
      } else if (k.stato === 'insegue') {
        const o = k.oggetto;
        if (!o || o.via || (o.preso && o.preso !== k)) this.dopo(k, 0.3);
        else if (this.vai(k, o.x, o.y + 1, c.velCorsa, dt, 6)) {
          o.preso = k;
          Object.assign(k, { stato: 'occupato', t: o.tipo === 'biscotto' ? c.mangia : c.giocaPallina });
          Audio.sfx('preso');
        }
      } else if (k.stato === 'occupato') {
        // mangia il biscotto, o si tiene la pallina
        k.t -= dt;
        if (k.t <= 0) { if (k.oggetto) this.togliOggetto(k.oggetto); this.dopo(k, 0.6); }
      } else if (k.stato === 'gatto') {
        const g = this.gatto;
        if (!g) this.dopo(k, 0.8);
        else this.vai(k, g.x - 6, g.y, c.gatto.velCani, dt, 7);
      } else if (k.stato === 'sicuro') {
        k.t -= dt;
        if (k.t <= 0) Object.assign(k, { stato: 'gira', t: 0, meta: null });
      } else if (k.stato === 'gira') {
        if (k.t > 0) k.t -= dt;
        else {
          const pigro = k.tipo === 'pigro';
          if (pigro) k.meta = this.dietroLaRuota(k);
          else if (!k.meta) k.meta = this.nuovaMeta(k, p);
          if (this.vai(k, k.meta.x, k.meta.y, c.velCane * (pigro ? c.pigroVel : 1), dt, 2)) {
            if (pigro) { if (this.inZona(k)) k.stato = 'dorme'; }
            else { k.meta = null; k.t = this.tra(c.sosta[0], c.sosta[1]); }
          }
        }
      }
      if (k.stato !== 'portato' && k.stato !== 'salto') this.nelCampo(k, k.stato === 'gatto' ? 30 : 0);
      k.inMoto = Math.hypot(k.x - x0, k.y - y0) > 0.05;
      // salvato all'ultimo istante: era nella zona rossa con la macchina addosso, e ne è uscito
      const dentro = this.inZona(k);
      if (k.pericolo && !dentro && k.tSalvo <= 0 && k.stato !== 'salto' && this.inCorso) {
        k.tSalvo = c.attesaSalvataggio;
        this.salvataggi++;
        this.io.tEspr = 1;
        Audio.sfx('ok');
        scritta(this, limita(k.x, 60, 420), k.y - 44, `SALVO! +${c.bonusSalvataggio}`, { size: 9, color: '#7dff9a', durata: 600, depth: 955 });
        stelle(this, k.x, k.y - 14, 5, 940);
      }
      k.pericolo = dentro && this.attiva && k.x - Au.x < c.vicino;
      this.disegnaCane(k, dentro);
    }
    this.etichette();
  }

  // I nomi dei cani non si sovrappongono: se due sono vicini, resta quello che conta di più (prima
  // chi è nella zona rossa con la macchina in moto, poi chi è più vicino alla coda della macchina)
  etichette() {
    const Au = this.auto, fatti = [];
    const ordine = [...this.cani].sort((a, b) => (b.rosso ? 1 : 0) - (a.rosso ? 1 : 0) || Math.abs(a.x - Au.x) - Math.abs(b.x - Au.x));
    for (const k of ordine) {
      const e = k.etichetta, libero = !fatti.some((f) => Math.abs(f.x - e.x) < (f.width + e.width) / 2 + 2 && Math.abs(f.y - e.y) < 9);
      e.setVisible(libero && k.img.visible);
      if (libero) fatti.push(e);
    }
  }

  disegnaCane(k, dentro) {
    const T = this.trascorso;
    // che figura fa: sdraiato, contento (lingua fuori), oppure i due passi
    const posa = k.stato === 'dorme' ? 'giu' : ['occupato', 'sicuro', 'portato'].includes(k.stato) ? 'felice' : k.inMoto && Math.floor(T * (k.stato === 'insegue' ? 12 : 7)) % 2 ? 'b' : 'a';
    const key = `cane${k.i}_${posa}`;
    if (key !== k.key) { k.key = key; k.img.setTexture(key); }
    let x = k.x, y = k.y, ang = 0, sy = 1;
    if (k.stato === 'salto') { const e = k.salto.t / k.salto.T; y -= Math.sin(e * Math.PI) * 34; ang = e * 360 * (k.salto.y1 < k.salto.y0 ? -1 : 1); sy = 1 + Math.sin(T * 40) * 0.12; }   // le pieghe ballonzolano
    else if (k.stato === 'spinto') ang = Math.sin(T * 26) * 9;
    else if (k.stato === 'portato') { y -= 7; ang = -10; sy = 1 + Math.sin(T * 16) * 0.05; }
    else if (k.stato === 'occupato' || k.stato === 'sicuro') y -= Math.abs(Math.sin(T * 9 + k.i)) * 1.6;        // scodinzola e saltella
    else if (k.inMoto) ang = Math.sin(T * 9 + k.i) * 3;                                                         // ciondola
    const s = scalaDi(k.key, SCALA_CANE);
    k.img.setPosition(x, y).setAngle(ang).setScale(s, s * sy).setFlipX(k.verso < 0).setDepth(k.stato === 'portato' ? 101 + this.pasta.y : 100 + k.y);
    k.ombra.setPosition(k.x, k.y).setFillStyle(0x000000, k.stato === 'salto' || k.stato === 'portato' ? 0.25 : 0);
    // il nome: rosso col punto esclamativo se è nella zona rossa mentre la macchina si muove
    const rischio = dentro && this.attiva, nome = k.nome + (k.stato === 'dorme' ? ' zzz' : rischio ? '!' : '');
    if (k.etichetta.text !== nome) k.etichetta.setText(nome);
    if (rischio !== k.rosso) { k.rosso = rischio; k.etichetta.setColor(rischio ? '#ff6b5a' : '#fff3d6'); }      // (solo quando cambia: ridisegnare un testo costa)
    k.etichetta.setPosition(x, y - 25);
  }

  // ------------------------------------------------------------
  //  PASTAFFI, L'AIUTO DA CASA
  // ------------------------------------------------------------
  // lo chiama chi gioca: se è già fuori o non è ancora pronto, niente
  chiamaDenny() {
    if (!this.inCorso || this.pasta || this.ricaricaDenny > 0) return Audio.sfx('vuoto');
    this.ricaricaDenny = this.cfg.pastaffi.ricarica;
    this.chiama();
  }

  chiama() {
    const c = this.cfg, cp = c.pastaffi, Au = this.auto;
    if (!this.inCorso || this.pasta) return;
    Audio.sfx('scegli');
    vibra(40);
    this.pasta = { stato: 'corre', x: V.porta.x, y: V.porta.y, verso: 1, cane: null, t: 0, meta: null, key: 'pastaffi_corre',
      ombra: this.add.ellipse(V.porta.x, V.porta.y, 22, 6, 0x000000, 0.3).setDepth(9),
      img: im(this, V.porta.x, V.porta.y, 'pastaffi_corre', TAGLIA).setOrigin(0.5, 1) };
    fumetto(this, V.porta.x + 44, V.porta.y - 60, caso(c.frasiPastaffi), 1200, 946);
    // "PAPÀ, FERMO!": Emilio inchioda per un attimo
    if (Au.stato !== 'incidente') {
      if (Au.v > 4) Audio.sfx('frenata');
      Object.assign(Au, { stato: 'inchiodata', v: 0, t: cp.frenata, distratto: null });
      this.luce.setVisible(false); this.corna.setVisible(false); this.schermo.setVisible(false);
      scritta(this, limita(this.px(60), 80, 400), this.py(0) - 6, 'SCREEECH!', { size: 8, color: '#ffffff', durata: 500, depth: 950 });
    }
    this.aggiornaHud(true);
  }

  // il cane da portare via: quello più vicino alla coda della macchina
  caneDaPortare() {
    const Au = this.auto;
    let meglio = null, dMin = 1e9;
    for (const k of this.cani) {
      if (k.stato === 'salto' || k.stato === 'portato') continue;
      const d = Math.hypot(k.x - (Au.x + 8), k.y - CENTRO) + (this.sullaGhiaia(k) ? 0 : 300);     // prima quelli sul vialetto
      if (d < dMin) { dMin = d; meglio = k; }
    }
    return meglio;
  }

  aggiornaPastaffi(dt) {
    const P = this.pasta, c = this.cfg, cp = c.pastaffi;
    if (!P) return;
    let key = P.key;
    if (P.stato === 'corre') {
      const k = this.caneDaPortare();
      if (!k) P.stato = 'torna';
      else if (this.vai(P, k.x + (P.x < k.x ? -9 : 9), k.y + 1, cp.velCorsa, dt, 4)) {
        // lo prende in braccio: pesa, ed è tutto pieghe
        if (k.oggetto?.preso === k) k.oggetto.preso = null;
        Object.assign(k, { stato: 'portato', oggetto: null, meta: null });
        Object.assign(P, { stato: 'solleva', cane: k, t: 0.35 });
        key = 'pastaffi_porta';
        Audio.sfx('bau');
        fumetto(this, limita(P.x + 26, 60, 420), P.y - 62, caso(c.frasiCarico), 1000, 946);
      }
    } else if (P.stato === 'solleva') {
      P.t -= dt;
      if (P.t <= 0) { P.stato = 'porta'; P.meta = P.y < CENTRO ? { x: limita(P.x, 196, 440), y: S.y0 - 14 } : { x: limita(P.x, 100, 440), y: S.y1 + 13 }; }
    } else if (P.stato === 'porta') {
      if (this.vai(P, P.meta.x, P.meta.y, cp.velCarico, dt, 1.5)) {
        const k = P.cane;
        k.x = limita(P.x + P.verso * 14, CAMPO.x0 + 4, CAMPO.x1 - 4); k.y = P.y;
        Object.assign(k, { stato: 'sicuro', t: cp.sosta });
        Object.assign(P, { stato: 'torna', cane: null });
        key = 'pastaffi_normale';
        Audio.sfx('pof');
      }
    } else if (this.vai(P, V.porta.x, V.porta.y, cp.velCorsa * 0.75, dt, 2)) {
      P.img.destroy(); P.ombra.destroy();
      this.pasta = null;
      return this.aggiornaHud(true);
    }
    if (P.cane) { P.cane.x = P.x + P.verso * 7; P.cane.y = P.y; P.cane.verso = P.verso; }
    if (key !== P.key) { P.key = key; P.img.setTexture(key); }
    const corre = P.stato === 'corre' || P.stato === 'torna';
    P.img.setPosition(P.x, P.y - Math.abs(Math.sin(this.trascorso * (corre ? 16 : 9))) * (corre ? 2.6 : 1.4)).setFlipX(P.verso < 0).setDepth(100 + P.y);
    P.ombra.setPosition(P.x, P.y - 1);
  }

  // ------------------------------------------------------------
  //  IL GATTO
  // ------------------------------------------------------------
  passaIlGatto() {
    const c = this.cfg, Au = this.auto;
    this.gattoFatto = true;
    // scende dal prato, passa proprio dietro la macchina e se ne va dall'altra parte
    const x0 = limita(Au.x + c.gatto.avanti, 150, 410);
    const punti = [{ x: x0 - 8, y: S.y0 - 24 }, { x: x0 + 2, y: K.y - K.prof / 2 }, { x: x0 + 26, y: K.y - 6 }, { x: x0 + 38, y: CAMPO.fondo + 34 }];
    this.gatto = { x: punti[0].x, y: punti[0].y, verso: 1, punti, i: 1, img: im(this, punti[0].x, punti[0].y, 'gatto_a', 0.8).setOrigin(0.5, 22 / 24) };
    Audio.sfx('miao'); Audio.sfx('bau');
    scuoti(this, 260, 0.008);
    vibra(80);
    scritta(this, 240, 124, 'PASSA IL GATTO!', { size: 30, color: '#ffe14a', durata: 1400, depth: 960 });
    // tutti gli Shar Pei gli vanno dietro (piano, goffi): pure il pigro
    for (const k of this.cani) if (['gira', 'sicuro', 'dorme', 'spinto'].includes(k.stato)) Object.assign(k, { stato: 'gatto', meta: null });
    // (Pastaffi non esce più da solo: tocca a chi gioca chiamarlo, e il pulsante lampeggia)
    if (!this.pasta && this.ricaricaDenny <= 0) scritta(this, DENNY.x - 20, DENNY.y - 26, 'CHIAMA DENNY!', { size: 8, color: '#7dff9a', durata: 1400, depth: 1003 });
  }

  aggiornaGatto(dt) {
    const g = this.gatto;
    if (!g) return;
    const q = g.punti[g.i];
    if (this.vai(g, q.x, q.y, this.cfg.gatto.vel, dt, 1.5) && ++g.i >= g.punti.length) {
      g.img.destroy();
      this.gatto = null;
      return;
    }
    g.img.setTexture(Math.floor(this.trascorso * 10) % 2 ? 'gatto_b' : 'gatto_a').setPosition(g.x, g.y).setFlipX(g.verso < 0).setDepth(100 + g.y);
  }

  // ------------------------------------------------------------
  //  BISCOTTI E PALLINE
  // ------------------------------------------------------------
  togliOggetto(o) {
    o.via = true;
    this.tweens.add({ targets: o.img, alpha: 0, scale: o.img.scale * 0.4, duration: 180, onComplete: () => o.img.destroy() });
  }

  aggiornaOggetti(dt, p) {
    const c = this.cfg, io = this.io, Au = this.auto;
    // in volo: un arco fino al punto mirato
    for (const v of this.voli) {
      v.t += dt;
      const e = Math.min(1, v.t / v.T);
      v.img.setPosition(lerp(v.x0, v.P.x, e), lerp(v.y0, v.P.y, e) - v.arco * 4 * e * (1 - e)).setAngle(v.img.angle + 700 * dt);
      if (e < 1) continue;
      v.fatto = true;
      // sotto la macchina non resta: rimbalza di lato
      const P = v.P;
      if (P.x > Au.x - LUNGA - 2 && P.x < Au.x + 2 && P.y > K.y - K.prof - 2 && P.y < K.y + 2) P.y = P.y < CENTRO ? K.y - K.prof - 6 : K.y + 7;
      v.img.setPosition(P.x, P.y - 3).setAngle(0).setDepth(99 + P.y);
      colpetto(this, v.img, 1.3, 0.7);
      this.oggetti.push({ tipo: v.tipo, x: P.x, y: P.y, img: v.img, t: c.durataOggetto, preso: null, via: false });
      Audio.sfx('pof');
    }
    this.voli = this.voli.filter((v) => !v.fatto);
    // a terra: se nessuno li prende, dopo un po' spariscono; la pallina in bocca segue il cane
    for (const o of this.oggetti) {
      if (o.via) continue;
      if (o.preso) {
        const k = o.preso;
        if (o.tipo === 'pallina') { o.x = k.x; o.y = k.y; o.img.setPosition(k.x + k.verso * 13, k.y - 9).setDepth(101 + k.y); }
        else o.img.setAlpha(Math.max(0.2, k.t / c.mangia));
      } else if ((o.t -= dt) <= 0) this.togliOggetto(o);
      else if (o.t < 1.5) o.img.setAlpha(0.4 + 0.6 * Math.abs(Math.sin(o.t * 10)));
    }
    this.oggetti = this.oggetti.filter((o) => !o.via);
    // ogni tanto ne compare una da raccogliere, in giro per il giardino: quella che mi manca di più
    this.tNuova -= dt;
    if (this.tNuova <= 0 && this.raccolte.length < c.maxInGiro) {
      this.tNuova = lerp(c.nuoveInizio, c.nuoveFine, p) * this.tra(0.8, 1.2);
      const conta = (t) => this.muni[t] + this.raccolte.filter((r) => r.tipo === t).length;
      const tipo = conta('biscotto') === conta('pallina') ? this.pesca(['biscotto', 'pallina']) : conta('biscotto') < conta('pallina') ? 'biscotto' : 'pallina';
      const liberi = V.nascondigli.filter(([x, y]) => Math.hypot(x - io.x, y - io.y) > 46 && !this.raccolte.some((r) => r.x === x && r.y === y));
      if (liberi.length && conta(tipo) < c.maxMunizioni) {
        const [x, y] = this.pesca(liberi);
        const alone = this.add.ellipse(x, y, 20, 8, 0xffe14a, 0.4).setDepth(8);
        const img = im(this, x, y - 8, tipo, tipo === 'biscotto' ? 0.95 : 1.1).setDepth(100 + y);
        this.tweens.add({ targets: img, y: y - 12, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.tweens.add({ targets: alone, alpha: 0.12, duration: 420, yoyo: true, repeat: -1 });
        this.raccolte.push({ tipo, x, y, img, alone });
      }
    }
    // ...e ci si passa sopra per prenderla
    for (const r of this.raccolte) {
      if (io.ko || Math.hypot(r.x - io.x, r.y - io.y) > 14 || this.muni[r.tipo] >= c.maxMunizioni) continue;
      r.preso = true;
      this.tweens.killTweensOf(r.img); this.tweens.killTweensOf(r.alone);
      r.img.destroy(); r.alone.destroy();
      this.muni[r.tipo]++;
      Audio.sfx('preso');
      scritta(this, io.x, io.y - 70, `+1 ${NOMI[r.tipo]}`, { size: 7, color: '#ffe14a', durata: 500, depth: 950 });
      this.aggiornaHud(true);
    }
    this.raccolte = this.raccolte.filter((r) => !r.preso);
  }

  // ------------------------------------------------------------
  //  DISEGNO E HUD
  // ------------------------------------------------------------
  disegna() {
    const c = this.cfg, Au = this.auto, T = this.trascorso;
    // la zona rossa dietro la coda: lampeggia durante l'avviso, piena quando la macchina si muove
    const g = this.gZona, a = Au.stato === 'avviso' ? 0.24 + 0.24 * Math.abs(Math.sin(T * 13)) : this.attiva ? 0.42 : 0.13;
    const zx = Au.x, zw = Math.min(c.zona, 468 - Au.x), zy = K.y - K.prof - 2, zh = K.prof + 6;
    g.clear();
    g.fillStyle(0xff2a2a, a); g.fillRect(zx, zy, zw, zh);
    g.lineStyle(1.2, 0xff2a2a, Math.min(1, a + 0.4)); g.strokeRect(zx, zy, zw, zh);
    if (this.attiva) {
      // le frecce: da che parte sta venendo
      g.lineStyle(1.6, 0xffffff, 0.55);
      for (let i = 0; i < 3; i++) { const x = zx + 8 + ((T * 30 + i * 14) % Math.max(10, zw - 10)), y = zy + zh / 2; g.beginPath(); g.moveTo(x - 4, y - 6); g.lineTo(x + 2, y); g.lineTo(x - 4, y + 6); g.strokePath(); }
    }
    const m = this.gMira;
    m.clear();
    if (this.armato) {
      // col dito: il cerchio della gittata, per capire fin dove arriva il lancio
      m.lineStyle(1.2, 0xffe14a, 0.5 + 0.3 * Math.sin(T * 8)); m.strokeCircle(this.io.x, this.io.y, c.gittataMax);
    }
  }

  aggiornaHud(forza = false) {
    const c = this.cfg, metri = Math.floor((this.auto.x - V.partenza) / c.unitaMetro), totale = Math.round((V.cancello - V.partenza) / c.unitaMetro);
    const pronto = !this.pasta && this.ricaricaDenny <= 0;
    const hud = `${metri}|${this.vite}|${this.muni.biscotto}|${this.muni.pallina}|${this.armato}|${pronto}|${Math.ceil(this.ricaricaDenny * 4)}|${this.gatto ? Math.floor(this.trascorso * 4) % 2 : 0}`;
    if (!forza && hud === this.hud) return;
    this.hud = hud;
    this.testoMetri.setText(`EMILIO: ${metri} m su ${totale}`);
    this.zampe.forEach((z, i) => z.setAlpha(i < this.vite ? 1 : 0.22).setTint(i < this.vite ? 0xff8a9a : 0x555555));
    for (const tipo of ['biscotto', 'pallina']) {
      const s = this.slot[tipo], P = ICONE[tipo], scelta = this.armato === tipo, vuota = this.muni[tipo] <= 0;
      s.g.clear();
      s.g.fillStyle(0x1f1430, 0.85); s.g.fillCircle(P.x, P.y, 14.5);
      s.g.fillStyle(this.armato === tipo ? 0xb5651d : scelta ? 0x3d6b2a : 0x3a2a55, 1); s.g.fillCircle(P.x, P.y, 13);
      s.g.lineStyle(scelta ? 2 : 1, scelta ? 0xffe14a : 0x8a7aa8, 1); s.g.strokeCircle(P.x, P.y, 13);
      s.ico.setAlpha(vuota ? 0.3 : 1);
      s.n.setText('x' + this.muni[tipo]).setColor(vuota ? '#ff9a8a' : '#ffffff');
    }
    // Denny: pronto (verde, e lampeggia quando passa il gatto) o in ricarica (lo spicchio che si riempie)
    const D = this.slotDenny, lampeggia = pronto && this.gatto && Math.floor(this.trascorso * 4) % 2;
    D.g.clear();
    D.g.fillStyle(0x1f1430, 0.85); D.g.fillCircle(DENNY.x, DENNY.y, 15.5);
    D.g.fillStyle(pronto ? (lampeggia ? 0x6fbf4a : 0x3d6b2a) : 0x3a2a55, 1); D.g.fillCircle(DENNY.x, DENNY.y, 14);
    if (!pronto && !this.pasta) {
      const k = 1 - this.ricaricaDenny / c.pastaffi.ricarica;
      D.g.fillStyle(0x3d6b2a, 0.8); D.g.slice(DENNY.x, DENNY.y, 14, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); D.g.fillPath();
    }
    D.g.lineStyle(pronto ? 2 : 1, pronto ? 0xffe14a : 0x8a7aa8, 1); D.g.strokeCircle(DENNY.x, DENNY.y, 14);
    D.ico.setAlpha(pronto ? 1 : 0.45);
    if (eTouch()) this.testoSotto.setText(this.armato ? `TOCCA DOVE LANCIARE LA ${NOMI[this.armato]}` : '');
  }

  // ------------------------------------------------------------
  //  FINE
  // ------------------------------------------------------------
  risultato() {
    const c = this.cfg, fuori = this.uscita && this.vite > 0;
    const metri = Math.floor((this.auto.x - V.partenza) / c.unitaMetro);
    // gli scatti puliti e i cani salvati sempre; uscita e vite solo se Emilio esce dal cancello
    // (con le vite che valgono sempre di più: chi esce coi cani spaventati non prende la medaglia)
    const punteggio = this.puntiScatti + this.salvataggi * c.bonusSalvataggio + (fuori ? c.bonusUscita + c.bonusVite[this.vite] : 0);
    return {
      punteggio,
      vittoria: fuori && this.vite >= c.viteVittoria,
      riepilogo: `${quanti(this.scattiPuliti, 'scatto pulito', 'scatti puliti')}, ${quanti(this.salvataggi, 'cane salvato', 'cani salvati')}, ${quanti(this.vite, 'vita', 'vite')}` + (fuori ? ' - fuori dal cancello!' : ` (${quanti(metri, 'metro', 'metri')})`),
    };
  }

  // Se ho vinto: la macchina esce dal cancello, Emilio fa le corna rock dal finestrino e i cani
  // scodinzolano intorno a me e a Pastaffi. Se ho perso: la macchina resta di traverso, Emilio è
  // seduto per terra con le mani nella bandana e i cani gli leccano la faccia, mentre Pastaffi
  // scuote la testa sulla porta.
  finale(ris, fatto) {
    const id = this.giocatore.id, Au = this.auto, n = this.cani.length;
    this.fum?.destroy();
    this.gZona.clear(); this.gMira.clear();
    for (const o of [...this.hudV, ...this.stelleKO, this.io.img, this.io.ombra, this.pasta?.img, this.pasta?.ombra, this.gatto?.img, this.luce, this.schermo, this.portiera, this.emilioGiu,
      ...this.cani.flatMap((k) => [k.img, k.ombra, k.etichetta]), ...this.oggetti.map((o) => o.img), ...this.voli.map((v) => v.img), ...this.raccolte.flatMap((r) => [r.img, r.alone])]) o?.setVisible(false);
    this.testa.setVisible(true);
    Audio.sfx('tempo');
    const grande = (key, x, y, k) => im(this, x, y, key, k).setOrigin(0.5, 1).setDepth(705);
    const cane = (i, x, y, k, flip) => im(this, x, y, `cane${i % n}_felice`, k).setOrigin(CANE.ox, CANE.oy).setDepth(706 + i).setFlipX(flip);

    if (ris.vittoria) {
      // via, in strada: dal finestrino spuntano le corna
      this.corna.setVisible(true);
      Au.distratto = 'radio';
      this.tweens.add({ targets: Au, x: Au.x + 150, duration: 1700, ease: 'Quad.in', onUpdate: () => this.piazzaAuto() });
      this.add.rectangle(0, 0, 480, 270, 0x10220c, 0.35).setOrigin(0).setDepth(700);
      const io = grande(`${id}_felice`, 200, 266, 0.9), pa = grande('pastaffi_felice', 292, 266, 0.9);
      for (const o of [io, pa]) this.tweens.add({ targets: o, y: 254, duration: 240, yoyo: true, repeat: -1, ease: 'Quad.out', delay: o === pa ? 120 : 0 });
      [[130, 262, false], [246, 268, true], [356, 262, true]].forEach(([x, y, flip], i) => {
        const k = cane(i, x, y, 1.55, flip);
        this.tweens.add({ targets: k, angle: { from: -5, to: 5 }, y: y - 5, duration: 150 + i * 20, yoyo: true, repeat: -1 });      // scodinzolano
      });
      this.time.delayedCall(700, () => {
        Audio.sfx('vittoria');
        txt(this, 240, 40, this.uscita ? "FUORI DAL CANCELLO! ROCK'N'ROLL!" : "BELLA GUIDA! ROCK'N'ROLL!", { size: 14, color: '#7dff9a', depth: 710 });
      });
    } else {
      // la macchina di traverso nel vialetto
      this.tweens.add({ targets: this.autoImg, angle: -7, duration: 300, ease: 'Back.out' });
      this.testa.setVisible(false); this.corna.setVisible(false);
      this.add.rectangle(0, 0, 480, 270, 0x10220c, 0.4).setOrigin(0).setDepth(700);
      // Emilio seduto per terra, con le mani nella bandana; i cani gli leccano la faccia
      grande('emilio_disperato', 250, 306, 1.15);
      [[176, 262, false], [326, 262, true], [250, 272, false]].slice(0, Math.max(2, Math.min(3, n))).forEach(([x, y, flip], i) => {
        const k = cane(i, x, y, i === 2 ? 1.2 : 1.6, flip).setDepth(i === 2 ? 709 : 704);
        this.tweens.add({ targets: k, x: x + (flip ? -9 : 9), duration: 200 + i * 40, yoyo: true, repeat: -1, ease: 'Sine.inOut' });   // slap, slap
      });
      // Pastaffi sulla porta scuote la testa
      const pa = im(this, V.porta.x + 6, V.porta.y + 12, 'pastaffi_sufficienza', 0.62).setOrigin(0.5, 1).setDepth(703);
      this.tweens.add({ targets: pa, angle: { from: -5, to: 5 }, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      grande(`${id}_triste`, 420, 268, 0.8);
      this.time.delayedCall(700, () => {
        Audio.sfx('sconfitta');
        txt(this, 240, 40, this.vite <= 0 ? 'TROPPI SPAVENTI!' : this.uscita ? 'FUORI, MA CHE FATICA!' : 'TEMPO SCADUTO: EMILIO FA TARDI!', { size: 14, color: '#ff6b5a', depth: 710 });
        fumetto(this, V.porta.x + 52, V.porta.y - 44, 'Papà...', 2400, 712);
      });
    }
    this.time.delayedCall(3600, fatto);
  }
}
