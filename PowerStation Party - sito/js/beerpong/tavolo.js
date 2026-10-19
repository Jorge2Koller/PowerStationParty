// ============================================================
//  BEER PONG: IL TAVOLO
//  Tutto quello che il microgioco "Beer Pong al Pallaio" e la modalità BEER PONG hanno in comune:
//  il Pallaio visto da dietro le spalle di chi tira, i bicchieri, il gesto del tiro e la mira, la
//  pallina che vola (entra, rimbalza, gira sul bordo, esce), la sbronza progressiva, le gag dei
//  tiri sbagliati e le reazioni. I conti del volo sono in motore.js, le gag in gag.js, i numeri in
//  js/config/beerpong.js.
//
//  Chi lo usa (una scena di Phaser):
//    const T = new Tavolo(scene, { cfg, peso, rnd, musica, suEsito, suTiro, arbitro, escludi });
//    T.imposta({ tiratore, avversari, lontani, vicini, sbronza, sbronzaAvv });   // chi tira, a chi
//    T.attivo = true;                // si può mirare e tirare
//    T.aggiorna(dt);                 // a ogni fotogramma
//    T.avversarioTira(k, voglio);    // il tiro di un avversario mosso dal computer
//  suEsito(e) arriva alla fine di ogni tiro: e = { chi: 'io' | 'loro', tipo: 'centro' | 'rimbalzo'
//  | 'fuori' | 'rete', bicchiere, bordo, fiamme, ultimo, tiratore } (tiratore = l'id di chi ha
//  tirato: serve allo schiaffo di Marsupino, js/beerpong/schiaffo.js).
//  I bicchieri sono oggetti { x, y, riga, su } (vedi triangolo in motore.js): quelli "lontani" sono
//  degli avversari, quelli "vicini" di chi tira. Il tavolo spegne "su" quando la pallina entra.
// ============================================================
import { Audio } from '../audio.js';
import { Salvataggio } from '../salvataggio.js';
import { RES, casuale } from '../grafica/base.js';
import { PERSONAGGI } from '../grafica/personaggi.js';
import { SP, ritratto, preparaBevitore, FACCE_SBRONZA } from '../sprites.js';
import { TAVOLO_IMG, RETE_IMG, BICCHIERE_IMG, PALLINA_IMG, MANO_IMG } from '../grafica/pallaio.js';
import { txt, im, scalaDi, scritta, fumetto, stelle, pannello, caso, colpetto, vibra, scuoti, puntatore } from '../fx.js';
import { CAM, TAV, BIC, MANO, PALLA, proietta, specchia, sulTavolo, tiroDa, puntoVolo, pianifica, tiroAvversario } from './motore.js';
import { GAG } from './gag.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const tra = ([a, b], r = Math.random) => a + r() * (b - a);
// profondità dei disegni
const P = { gente: 5, avv: 6, lampada: 8, tavolo: 10, lontani: 13, rete: 20, vicini: 22, ombra: 40, palla: 41, mano: 50, mira: 60, luce: 800, fx: 900, hud: 990 };
// dove sta il pubblico (piedi) e quanto è grande; gli avversari stanno dietro al bordo in fondo
const POSTI = { arbitro: { x: 106, y: 176, s: 2.1 }, dx: { x: 380, y: 176, s: 2 }, sx: { x: 50, y: 156, s: 1.5 }, bevitore: { x: 440, y: 156, s: 1.5 } };
const AVV = { y: 158, s: 2.2 };
const RITRATTO = { x: 36, y: 230, lato: 42 };
const alto = (id, s) => 48 * s * (PERSONAGGI[id]?.statura ?? 1);     // quanto è alto sullo schermo un personaggio di taglia s

export class Tavolo {
  constructor(scene, o = {}) {
    this.scene = scene;
    this.o = o;
    this.cfg = o.cfg;
    this.peso = o.peso ?? 1;                 // quanto pesa la sbronza (1 = normale)
    this.rnd = o.rnd ?? Math.random;         // il caso degli avversari (col seme del round)
    // il caso della sbronza (HIC!, vista doppia, sobbalzi) e delle gag: anche lui dal seme del round,
    // ma un generatore a parte, così non dipende da quanto tirano gli avversari
    this.rndSbronza = o.rnd ? casuale(Math.floor(o.rnd() * 4294967296) >>> 0) : Math.random;
    this.attivo = false;                     // si può mirare e tirare?
    this.palle = [];
    this.inVolo = null;                      // la pallina di chi tira, finché non ha finito
    this.tRicarica = 0;
    this.sbronza = 0;                        // 0 lucido ... 3 sbronzo (di chi tira)
    this.fila = 0;                           // centri di fila di chi tira
    this.lento = 1;                          // rallentatore (1 = no)
    this.zoom = 1;
    this.dramma = null;
    this.tGag = 0; this.gagFino = 0;
    this.orologio = 0;
    this.dm = 0; this.dp = 0;                // di quanto la sbronza sposta la mira (lato, forza)
    this.tHic = tra(this.cfg.sbronza.hic.ogni, this.rndSbronza); this.hicT = 0; this.hicV = { m: 0, p: 0 };
    this.tDoppio = tra(this.cfg.sbronza.doppio.ogni, this.rndSbronza); this.doppioT = 0;
    this.tFrase = tra(this.cfg.sbronza.fraseOgni);
    this.tFiamma = 0;
    this.gesto = null; this.carica = null; this.tastiera = false; this.miraTasti = 0;
    this.lontani = []; this.vicini = []; this.avv = []; this.pubblico = []; this.bevitore = null;
    this.crea();
  }

  // ---------- la scena fissa ----------
  crea() {
    const s = this.scene;
    // (dietro allo sfondo ce n'è una copia un po' più grande: quando la visuale ondeggia o si
    // stringe sulla pallina, ai bordi non si vede il vuoto)
    im(s, 240, 135, 'bgPallaio', 1.14).setDepth(-1);
    im(s, 0, 0, 'bgPallaio').setOrigin(0);
    this.lampada = im(s, 240, -16, 'lampadaPong').setOrigin(0.5, 0).setDepth(P.lampada);
    this.luce = im(s, 240, 135, 'lucePong').setDepth(P.luce).setAlpha(0);
    im(s, TAVOLO_IMG.x, TAVOLO_IMG.y, 'tavoloPong').setOrigin(0).setDepth(P.tavolo);
    im(s, RETE_IMG.x, RETE_IMG.y, 'retePong').setOrigin(0).setDepth(P.rete);
    this.gMira = s.add.graphics().setDepth(P.mira);
    this.creaPubblico();
    this.comandi();
  }

  // chi guarda: due o tre tra quelli che non giocano, uno con la birra in mano, e l'arbitro se c'è
  creaPubblico() {
    const s = this.scene, via = new Set(this.o.escludi ?? []);
    const liberi = this.cfg.comparse.filter((id) => !via.has(id) && s.textures.exists(`${id}_normale`));
    for (let i = liberi.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [liberi[i], liberi[j]] = [liberi[j], liberi[i]]; }
    const metti = (id, posto) => {
      const q = POSTI[posto], img = im(s, q.x, q.y, `${id}_normale`).setOrigin(0.5, 1).setScale(q.s * SP).setDepth(P.gente);
      return { id, img, posto, y0: q.y, alto: alto(id, q.s), faccia: `${id}_normale`, giu: false };
    };
    if (this.o.arbitro) { this.arbitro = metti(this.o.arbitro, 'arbitro'); this.pubblico.push(this.arbitro); }
    for (const posto of ['dx', 'sx', ...(this.o.arbitro ? [] : ['arbitro'])]) { const id = liberi.pop(); if (id) this.pubblico.push(metti(id, posto)); }
    const id = liberi.pop();
    if (id) {
      // quello che beve in disparte, col suo bicchiere
      const b = metti(id, 'bevitore');
      b.pinta = im(s, b.img.x - 13, b.img.y - b.alto * 0.36, 'bicchierePong', 0.42).setDepth(P.gente + 0.5);
      s.tweens.add({ targets: b.pinta, y: b.pinta.y - 2, angle: -6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.bevitore = b;
    }
  }

  // ---------- chi tira e a chi ----------
  // tiratore = { id, nome, colore, esulta }; avversari = [id, ...]; lontani e vicini = i bicchieri;
  // sbronza = il livello di chi tira, sbronzaAvv = quello degli avversari; cfg e peso se cambiano
  imposta(v) {
    const s = this.scene;
    if (v.cfg) this.cfg = v.cfg;
    if (v.peso != null) this.peso = v.peso;
    for (const c of [...this.lontani, ...this.vicini]) { c.img?.destroy(); c.fant?.destroy(); }
    for (const a of this.avv) a.img.destroy();
    for (const p of this.palle) { p.img.destroy(); p.ombra.destroy(); }
    this.palle = []; this.inVolo = null; this.gesto = this.carica = null; this.miraTasti = 0; this.fila = v.fila ?? 0;
    this.ritratto?.destroy(); this.ritratto = null;
    this.mano?.destroy(); this.pallaMano?.destroy(); this.targa?.forEach((o) => o.destroy());
    this.tiratore = v.tiratore;
    this.sbronza = v.sbronza ?? 0;
    this.sbronzaAvv = v.sbronzaAvv ?? 0;
    preparaBevitore(s, v.tiratore.id);
    for (const id of v.avversari) preparaBevitore(s, id);

    // gli avversari, in fondo al tavolo
    const n = v.avversari.length, passo = n <= 1 ? 0 : n === 2 ? 76 : 58;
    this.avv = v.avversari.map((id, i) => {
      const x = 240 + (i - (n - 1) / 2) * passo;
      const img = im(s, x, AVV.y, `${id}_${FACCE_SBRONZA[this.sbronzaAvv]}`).setOrigin(0.5, 1).setScale(AVV.s * SP).setDepth(P.avv + i * 0.01);
      return { id, img, x, alto: alto(id, AVV.s) };
    });
    // i bicchieri: quelli in fondo (con il loro fantasma, per quando la vista si sdoppia) e i propri
    this.lontani = v.lontani.map((c) => this.bicchiere(c, false));
    this.vicini = v.vicini.map((c) => this.bicchiere(c, true));
    // la mano con la pallina e il ritratto di chi tira
    const m0 = proietta(MANO.x, MANO.y, MANO.h), base = v.tiratore.id.replace('Bis', '');
    this.m0 = m0;
    this.mano = im(s, m0.x, m0.y, `manoPong_${base}`).setOrigin(MANO_IMG.ox, MANO_IMG.oy).setDepth(P.mano);
    this.pallaMano = im(s, m0.x, m0.y, 'pallinaPong', (2 * PALLA * m0.k) / PALLINA_IMG.diametro).setDepth(P.mano + 1);
    this.targa = [pannello(s, RITRATTO.x, RITRATTO.y + 1, 52, 52, { alfa: 0.6, raggio: 12, bordo: Phaser.Display.Color.HexStringToColor(v.tiratore.colore).color, depth: P.hud })];
    this.testoSbronza = txt(s, RITRATTO.x, RITRATTO.y + 32, '', { size: 6.5, depth: P.hud + 2 });
    this.targa.push(this.testoSbronza);
    // (nella modalità, dove chi tira cambia a ogni turno, sopra al ritratto c'è il suo nome)
    if (this.o.nome) this.targa.push(txt(s, RITRATTO.x + 2, RITRATTO.y - 33, v.tiratore.nome.toUpperCase(), { size: v.tiratore.nome.length > 10 ? 5.5 : 7.5, color: v.tiratore.colore, depth: P.hud + 2 }));
    this.faccia();
    this.tRicarica = 0;
  }

  bicchiere(c, vicino) {
    const s = this.scene, q = vicino ? specchia(c) : c, sp = proietta(q.x, q.y, 0), scala = (2 * BIC.r * sp.k) / BICCHIERE_IMG.bocca;
    const v = { c, x: q.x, y: q.y, su: c.su, vicino, sx: sp.x, sy: sp.y, k: sp.k };
    if (!c.su) return v;
    const prof = vicino ? P.vicini + c.riga * 0.2 : P.lontani + 1 - c.riga * 0.2;
    v.img = im(s, sp.x, sp.y, 'bicchierePong', scala).setOrigin(BICCHIERE_IMG.ox, BICCHIERE_IMG.oy).setDepth(prof);
    if (!vicino) v.fant = im(s, sp.x, sp.y, 'bicchierePong', scala).setOrigin(BICCHIERE_IMG.ox, BICCHIERE_IMG.oy).setDepth(prof - 0.05).setVisible(false);
    return v;
  }

  // un triangolo nuovo in fondo (il microgioco, quando il primo è finito): entra con un saltello
  nuoviLontani(lista) {
    for (const c of this.lontani) { c.img?.destroy(); c.fant?.destroy(); }
    this.lontani = lista.map((c) => this.bicchiere(c, false));
    this.lontani.forEach((v, i) => { const sc = v.img.scale; v.img.setScale(0); this.scene.tweens.add({ targets: v.img, scale: sc, delay: i * 45, duration: 240, ease: 'Back.out' }); });
  }

  get inPiedi() { return this.lontani.filter((c) => c.su).length; }
  get mieiInPiedi() { return this.vicini.filter((c) => c.su).length; }
  // c'è ancora qualcosa in corso (una pallina per aria, una gag, il rallentatore)?
  get occupato() { return this.palle.length > 0 || this.orologio < this.gagFino || !!this.dramma; }
  get pronto() { return this.attivo && !this.inVolo && this.tRicarica <= 0; }

  // la faccia di chi tira nel ritratto, secondo la sbronza
  faccia(espr) {
    const s = this.scene, S = this.cfg.sbronza, id = this.tiratore.id;
    // (sta in una scatola centrata sulla testa: così può ondeggiare e saltare attorno al suo centro)
    if (!this.ritratto) this.ritratto = s.add.container(RITRATTO.x, RITRATTO.y).setDepth(P.hud + 1);
    this.ritratto.removeAll(true);
    this.ritratto.add(ritratto(s, 0, 0, id, RITRATTO.lato, espr ?? FACCE_SBRONZA[this.sbronza]));
    this.testoSbronza.setText(S.nomi[this.sbronza]).setColor(S.colori[this.sbronza]);
  }

  // cambia il livello di sbronza di chi tira (il ritratto, la scritta) o degli avversari (le facce)
  setSbronza(livello) {
    if (livello === this.sbronza) return;
    this.sbronza = livello;
    this.faccia();
    this.scene.tweens.add({ targets: this.ritratto, scale: { from: 1.35, to: 1 }, duration: 260, ease: 'Back.out' });
  }
  setSbronzaAvv(livello) {
    this.sbronzaAvv = livello;
    for (const a of this.avv) a.img.setTexture(`${a.id}_${FACCE_SBRONZA[livello]}`);
  }

  // ---------- comandi: il gesto (mouse o dito) e la tastiera ----------
  comandi() {
    const s = this.scene;
    this.tasti = s.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT' });
    // (si può cominciare a mirare anche mentre la pallina di prima è ancora per aria: si tira
    // quando torna in mano)
    s.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat && this.attivo && !this.gesto) { this.tastiera = true; this.carica = { t: 0 }; } });
    s.input.keyboard.on('keyup-SPACE', () => {
      if (!this.carica) return;
      const p = this.forzaTasti();
      this.carica = null;
      this.prova(this.miraTasti, p);
    });
    s.input.on('pointerdown', (p) => {
      if (!this.attivo || this.gesto || this.carica || (!p.wasTouch && !p.leftButtonDown())) return;
      const w = puntatore(s, p);
      this.gesto = { id: p.id, ptr: p, x0: w.x, y0: w.y, x: w.x, y: w.y, dito: !!p.wasTouch };
      this.tastiera = false;
    });
    s.input.on('pointermove', (p) => { if (this.gesto?.id === p.id) { const w = puntatore(s, p); this.gesto.x = w.x; this.gesto.y = w.y; } });
    // (tirando indietro il mouse esce facilmente dal gioco: vale anche il rilascio fuori)
    for (const ev of ['pointerup', 'pointerupoutside']) s.input.on(ev, (p) => { if (this.gesto?.id === p.id) this.rilascia(); });
  }

  // fine del gesto: se era abbastanza lungo, parte il tiro
  rilascia() {
    const t = this.daGesto();
    this.gesto = null;
    if (t) this.prova(t.m, t.p);
  }

  // tira, se la pallina è in mano; se no lo dice
  prova(m, p) {
    if (this.pronto) return this.tira(m, p);
    if (this.attivo) scritta(this.scene, this.m0.x, this.m0.y - 24, 'ASPETTA!', { size: 7, color: '#ffe14a', durata: 250, depth: P.fx });
    return false;
  }

  // dopo una pausa non c'è più nessun gesto a metà (il rilascio, in pausa, non arriva)
  alRientro() { this.gesto = this.carica = null; }

  // Dal gesto alla mira: m = di lato, p = forza. Col mouse si tira indietro come una fionda (il
  // tiro va dalla parte opposta), col dito si dà una fiondata in avanti: vanno bene tutti e due,
  // conta il verso (in su = in avanti) e la lunghezza.
  daGesto() {
    const g = this.gesto, T = this.cfg.tiro;
    let dx = g.x - g.x0, dy = g.y - g.y0;
    if (dy > 0) { dx = -dx; dy = -dy; }
    const lung = Math.hypot(dx, dy) / (g.dito ? T.gestoDito : 1);
    if (lung < T.gestoMin) return null;
    return { m: clamp(dx / Math.max(6, -dy), -T.apertura, T.apertura), p: clamp((lung - T.gestoMin) / (T.gestoMax - T.gestoMin), 0, 1) };
  }

  forzaTasti() {
    const f = (this.carica.t / this.cfg.tiro.periodoForza) % 1;   // sale e scende
    return f < 0.5 ? f * 2 : 2 - f * 2;
  }

  // la mira com'è davvero, con gli sbandamenti della sbronza
  storta(m, p) {
    const T = this.cfg.tiro;
    return { m: clamp(m + this.dm, -T.apertura - 0.25, T.apertura + 0.25), p: clamp(p + this.dp, 0, 1) };
  }

  // ---------- il tiro ----------
  tira(m, p) {
    if (!this.pronto) return false;
    const s = this.scene, T = this.cfg.tiro, S = this.cfg.sbronza, R = this.cfg.reazioni;
    const a = this.storta(m, p), tiro = tiroDa(a.m, a.p, T);
    const piano = pianifica(tiro, this.lontani, T, (S.fortuna[this.sbronza] ?? 0) * (this.o.fortuna ?? 1));
    // l'ultimo bicchiere: se la pallina gli arriva vicino, rallentatore e rullo di tamburi
    const rimasti = this.lontani.filter((c) => c.su);
    let dramma = false;
    if (rimasti.length === 1 && this.o.dramma !== false) {
      const u = rimasti[0], vicina = piano.tratti.some((tr) => tr.a && Math.hypot(tr.a.x - u.x, tr.a.y - u.y) < BIC.r * R.ultimo.raggio);
      dramma = vicina || !!piano.esito.bicchiere;
    }
    const b = this.palla('io', piano);
    b.dramma = dramma;
    b.fiamme = this.fila >= R.fiamme;
    this.inVolo = b;
    this.pallaMano.setVisible(false);
    s.tweens.add({ targets: this.mano, y: this.m0.y - 12, angle: a.m * 34 - 10, duration: 90, yoyo: true, onComplete: () => this.mano.setAngle(0) });
    Audio.sfx('lancio');
    this.o.suTiro?.();
    return true;
  }

  // Il tiro di un avversario mosso dal computer (k = quale, voglio = 'centro' | 'bordo' | 'fuori')
  // verso uno dei bicchieri di chi tira. Ritorna false se non c'è più niente a cui tirare.
  avversarioTira(k, voglio) {
    const bersagli = this.vicini.filter((c) => c.su);
    if (!bersagli.length || !this.avv.length) return false;
    const a = this.avv[k % this.avv.length], bers = bersagli[Math.floor(this.rnd() * bersagli.length)];
    const da = { x: (a.x - CAM.cx) / proietta(0, TAV.L + 0.12).k, y: TAV.L + 0.12, h: 0.26 };
    this.palla('loro', tiroAvversario(bers, voglio, this.vicini, this.cfg.tiro, this.rnd, da)).di = a.id;   // (chi l'ha tirata)
    colpetto(this.scene, a.img, 1.08, 0.93);
    Audio.sfx('lancio');
    return true;
  }

  palla(chi, piano) {
    const s = this.scene;
    const b = { chi, piano, i: 0, t: 0, img: im(s, 0, 0, 'pallinaPong').setDepth(P.palla), ombra: s.add.ellipse(0, 0, 4, 2, 0x000000, 0.28).setDepth(P.ombra) };
    this.posa(b, piano.tratti[0].da);
    this.palle.push(b);
    return b;
  }

  // mette pallina e ombra dove dice il punto q del tavolo
  posa(b, q) {
    const y = Math.max(-0.55, q.y), sp = proietta(q.x, y, q.h), d = 2 * PALLA * sp.k;
    b.img.setPosition(sp.x, sp.y).setScale(scalaDi('pallinaPong', d / PALLINA_IMG.diametro));
    const sopra = sulTavolo({ x: q.x, y }) && q.h >= 0;
    b.ombra.setVisible(sopra);
    if (sopra) { const o = proietta(q.x, y, 0); b.ombra.setPosition(o.x, o.y).setSize(d * 1.1, d * 0.42); }
    b.q = q; b.sp = sp;
  }

  voli(dt) {
    const R = this.cfg.reazioni;
    for (const b of [...this.palle]) {
      const tr = b.piano.tratti[b.i];
      b.t += dt * (b.dramma && b.i > 0 ? 1.6 : 1);      // (al rallentatore, dopo l'arrivo si va un po' più svelti)
      const e = Math.min(1, b.t / tr.durata);
      if (tr.tipo === 'bordo') {
        // gira sul bordo del bicchiere, stringendo
        const c = tr.bicchiere, ang = tr.ang + e * Math.PI * 3, r = BIC.r * (tr.dentro ? 1 - 0.75 * e * e : 1);
        this.posa(b, { x: c.x + Math.cos(ang) * r, y: c.y + Math.sin(ang) * r * 0.9, h: BIC.h - (tr.dentro ? 0.05 * e * e : 0) });
      } else this.posa(b, puntoVolo(tr, e));
      if (tr.tipo === 'via' && !tr.resta) b.img.setAlpha(1 - e * e * 0.9);
      if (b.fiamme) this.fiammella(b.sp.x, b.sp.y, 0.7);
      // l'ultimo bicchiere: a metà del volo parte il rallentatore
      if (b.dramma && !this.dramma && b.i === 0 && e > 0.42) this.iniziaDramma(b);
      if (e < 1) continue;
      // il tratto è finito: il prossimo, o l'esito
      b.i++; b.t = 0;
      const poi = b.piano.tratti[b.i];
      if (!poi) { this.fine(b); continue; }
      if (poi.tipo === 'salto') {
        Audio.sfx('rimbalzo');
        scritta(this.scene, b.sp.x, b.sp.y - 8, 'TOC!', { size: 7, color: '#ffffff', durata: 220, depth: P.fx });
      } else if (poi.tipo === 'bordo') {
        Audio.sfx('bordo');
        scritta(this.scene, b.sp.x, b.sp.y - 16, caso(R.bordo), { size: 8, color: '#ffe14a', durata: 500, depth: P.fx });
      } else if (poi.tipo === 'via' && !poi.resta && b.chi === 'io' && this.gag(b)) this.fine(b, true);
    }
  }

  // la pallina ha finito: l'esito, gli effetti, e lo si dice a chi usa il tavolo
  fine(b, conGag = false) {
    const s = this.scene, R = this.cfg.reazioni, es = b.piano.esito, io = b.chi === 'io';
    this.palle = this.palle.filter((x) => x !== b);
    b.ombra.destroy();
    if (!conGag) b.img.destroy();
    const preso = es.tipo === 'centro' || es.tipo === 'rimbalzo';
    const c = es.bicchiere;
    let fiamme = false;
    if (preso) this.rimuovi(c);
    if (io) {
      this.inVolo = null;
      this.tRicarica = this.cfg.tiro.ricarica;
      if (preso) {
        this.fila++;
        fiamme = this.fila >= R.fiamme;
        const y = c.sy - BIC.h * c.k - 12;
        scritta(s, c.sx, y, es.tipo === 'rimbalzo' ? 'RIMBALZO!' : caso(R.centro), { size: es.tipo === 'rimbalzo' ? 12 : 11, color: es.tipo === 'rimbalzo' ? '#7dff9a' : '#ffe14a', durata: 550, depth: P.fx });
        stelle(s, c.sx, y + 8, 6, P.fx);
        if (this.fila === R.fiamme) { Audio.sfx('scatena'); scritta(s, 240, 104, 'IN FIAMME!', { size: 18, color: '#ff8a3a', durata: 800, depth: P.fx + 1 }); }
        else Audio.sfx('ok');
        this.tifo();
        this.avvBeve();
        if (Math.random() < R.esulta && this.tiratore.esulta) fumetto(s, RITRATTO.x + 54, RITRATTO.y - 30, this.tiratore.esulta, 1300, P.hud + 5);
        s.tweens.add({ targets: this.ritratto, y: { from: RITRATTO.y, to: RITRATTO.y - 6 }, duration: 110, yoyo: true, repeat: 1 });
      } else {
        this.fila = 0;
        if (!conGag) {
          const dove = { x: clamp(b.sp.x, 60, 420), y: clamp(b.sp.y, 70, 200) };
          scritta(s, dove.x, dove.y, caso(es.tipo === 'rete' ? R.rete : es.bordo ? R.bordoFuori : R.fuori), { size: 9, color: '#ffb0a4', durata: 420, depth: P.fx });
          Audio.sfx(es.tipo === 'rete' ? 'tonfo' : 'vuotoCalcio');
        }
      }
    } else if (preso) {
      // hanno centrato un bicchiere di chi tira: si beve
      scritta(s, 240, 150, caso(R.bevi), { size: 18, color: '#ff9a8a', durata: 650, depth: P.fx + 1 });
      Audio.sfx('glu');
      vibra(60);
      scuoti(s, 140, 0.006);
      for (const a of this.avv) s.tweens.add({ targets: a.img, y: AVV.y - 7, duration: 130, yoyo: true, repeat: 1 });
    }
    const ultimo = !!b.dramma;
    if (this.dramma?.b === b) this.fineDramma(preso);
    this.o.suEsito?.({ chi: b.chi, tipo: es.tipo, bicchiere: c?.c ?? null, bordo: !!es.bordo, fiamme, ultimo, tiratore: io ? this.tiratore.id : b.di });
  }

  // un bicchiere centrato sparisce, con lo schizzo di birra
  rimuovi(c) {
    const s = this.scene;
    c.su = false; c.c.su = false;
    this.schizzi(c.sx, c.sy - BIC.h * c.k, c.k / 100);
    Audio.sfx('splash');
    for (const o of [c.img, c.fant]) if (o) s.tweens.add({ targets: o, scaleY: 0, alpha: 0, duration: 220, ease: 'Quad.in', onComplete: () => o.destroy() });
    c.img = c.fant = null;
  }

  // toglie un altro bicchiere tra quelli in fondo (la modalità: di rimbalzo vale doppio).
  // bicchiere = l'oggetto di chi usa il tavolo; ritorna false se non c'è o è già giù
  togliLontano(bicchiere) {
    const c = this.lontani.find((x) => x.c === bicchiere && x.su);
    if (!c) return false;
    this.rimuovi(c);
    stelle(this.scene, c.sx, c.sy - BIC.h * c.k, 5, P.fx);
    return true;
  }

  // ---------- reazioni ----------
  // il pubblico esulta (un saltello) e ogni tanto qualcuno dice la sua
  tifo() {
    const s = this.scene, svegli = this.pubblico.filter((v) => !v.giu);
    svegli.forEach((v, i) => s.tweens.add({ targets: v.img, y: v.y0 - 6, duration: 120, yoyo: true, delay: i * 60, onComplete: () => v.img.setY(v.y0) }));
    const v = caso(svegli);
    if (v && Math.random() < 0.45) fumetto(s, v.img.x + (v.img.x < 240 ? 20 : -20), v.img.y - v.alto - 4, caso(this.cfg.reazioni.tifo), 900, P.fx);
  }

  // gli avversari bevono il bicchiere centrato
  avvBeve() {
    const s = this.scene, a = caso(this.avv);
    if (!a) return;
    const b = im(s, a.x + 12, AVV.y - a.alto * 0.52, 'bicchierePong', 0.5).setDepth(P.avv + 0.5).setAngle(-20);
    s.tweens.add({ targets: b, angle: -75, y: b.y - 6, duration: 260, hold: 380, yoyo: true, onComplete: () => b.destroy() });
    scritta(s, a.x, AVV.y - a.alto - 6, 'GLU GLU', { size: 7, color: '#ffffff', durata: 500, depth: P.fx });
  }

  // gocce di birra e di schiuma
  schizzi(x, y, k = 1) {
    const s = this.scene;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, d = (10 + Math.random() * 16) * Math.max(0.6, k);
      const g = s.add.ellipse(x, y, 2.2 + Math.random() * 2, 2.6 + Math.random() * 2.4, i % 3 ? 0xffc93a : 0xfff7df).setDepth(P.fx).setScale(Math.max(0.6, k));
      s.tweens.add({ targets: g, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, duration: 200, ease: 'Quad.out' });
      s.tweens.add({ targets: g, y: y + 14, alpha: 0, delay: 200, duration: 320, ease: 'Quad.in', onComplete: () => g.destroy() });
    }
  }

  fiammella(x, y, k = 1) {
    if (!this.fuoco) return;
    const s = this.scene, f = im(s, x + (Math.random() - 0.5) * 8 * k, y, 'fiammella', k * (0.6 + Math.random() * 0.5)).setDepth(P.fx).setAlpha(0.9);
    s.tweens.add({ targets: f, y: y - 12 * k - Math.random() * 6, alpha: 0, scale: f.scale * 0.5, duration: 380, onComplete: () => f.destroy() });
  }

  // un sobbalzo della mira (l'HIC! della sbronza, o un disturbo da fuori)
  sobbalzo(forza, testo, x = RITRATTO.x + 30, y = RITRATTO.y - 26) {
    const H = this.cfg.sbronza.hic;
    this.hicV = { m: (this.rndSbronza() < 0.5 ? -1 : 1) * forza, p: (this.rndSbronza() < 0.5 ? -1 : 1) * forza * 0.7 };
    this.hicT = H.durata;
    if (testo) scritta(this.scene, x, y, testo, { size: 11, color: '#ffffff', durata: 300, depth: P.hud + 5 });
  }

  // ---------- l'ultimo bicchiere ----------
  iniziaDramma(b) {
    const U = this.cfg.reazioni.ultimo;
    this.dramma = { b };
    this.lento = U.rallenta;
    Audio.sfx('rullo');
    Audio.musica(null);        // silenzio: resta solo il rullo di tamburi
  }
  fineDramma(preso) {
    const s = this.scene;
    this.dramma = null;
    this.lento = 1;
    Audio.musica(this.o.musica ?? 'gioco');
    if (preso) { Audio.sfx('vittoria'); for (let i = 0; i < 4; i++) s.time.delayedCall(i * 110, () => stelle(s, 120 + Math.random() * 240, 90 + Math.random() * 70, 7, P.fx)); }
    else { Audio.sfx('sconfitta'); scritta(s, 240, 120, 'NOOO!', { size: 20, color: '#ffb0a4', durata: 600, depth: P.fx + 1 }); }
  }

  // ---------- le gag ----------
  // la pallina sta uscendo dal tavolo: parte una gag? (true = sì, e la pallina se la prende lei)
  gag(b) {
    const G = this.cfg.gag;
    if (this.o.gag === false || !G.lista.length || b.dramma || this.tGag > 0 || this.rndSbronza() >= G.probabilita) return false;
    let tot = G.lista.reduce((t, g) => t + (g.peso ?? 1), 0), r = this.rndSbronza() * tot, scelta = G.lista[0];
    for (const g of G.lista) { r -= g.peso ?? 1; if (r <= 0) { scelta = g; break; } }
    const fn = GAG[scelta.id];
    if (!fn) return false;
    b.img.setAlpha(1).setDepth(P.fx - 1);
    const durata = fn(this, b.img, scelta);
    if (!durata) return false;
    this.tGag = G.pausa + durata;
    this.gagFino = this.orologio + durata;
    return true;
  }

  // la lampadina dondola (la gag): con lei va e viene la luce
  dondola(verso = 1) { this.pendolo = { t: 0, verso }; }

  // ---------- a ogni fotogramma ----------
  aggiorna(dtVero) {
    const dt = dtVero * this.lento, T = this.cfg.tiro;
    this.orologio += dt;
    this.tGag -= dt;
    // (le fiammelle: una manciata ogni tanto, non a ogni fotogramma)
    this.tFiamma -= dtVero; this.fuoco = this.tFiamma <= 0; if (this.fuoco) this.tFiamma = 0.07;
    // la pallina torna in mano
    if (this.tRicarica > 0 && !this.inVolo) {
      this.tRicarica -= dt;
      if (this.tRicarica <= 0) { this.pallaMano.setVisible(true); colpetto(this.scene, this.pallaMano, 1.4, 1.4); }
    }
    // tastiera: le frecce spostano la mira, SPAZIO tenuto carica
    const dir = (this.tasti.dx.isDown ? 1 : 0) - (this.tasti.sx.isDown ? 1 : 0);
    if (dir && this.attivo) { this.tastiera = true; this.miraTasti = clamp(this.miraTasti + dir * T.velMira * dt, -T.apertura, T.apertura); }
    if (this.carica) this.carica.t += dt;
    // (se il rilascio non è arrivato, per esempio fuori dalla finestra, il gesto finisce lo stesso)
    if (this.gesto && !this.gesto.ptr.isDown) this.rilascia();
    if (!this.attivo) this.gesto = this.carica = null;
    this.ubriachezza(dt);
    this.voli(dt);
    this.disegnaMira();
    this.pendola(dt);
    this.telecamera(dtVero);
    if (this.fila >= this.cfg.reazioni.fiamme) {
      this.fiammella(RITRATTO.x, RITRATTO.y - 14, 1);
      if (this.pallaMano.visible) this.fiammella(this.m0.x, this.m0.y - 4, 0.8);
    }
  }

  // gli effetti della sbronza di chi tira: l'onda e l'HIC! sulla mira, la vista doppia, i fumetti
  ubriachezza(dt) {
    const s = this.scene, S = this.cfg.sbronza, L = this.sbronza, k = this.peso;
    const w = (Math.PI * 2) / S.onda.periodo, t = this.orologio;
    this.dm = S.onda.lato[L] * k * Math.sin(t * w);
    this.dp = S.onda.forza[L] * k * Math.sin(t * w * 0.71 + 1.3);
    if (L >= 1 && this.attivo) {
      this.tHic -= dt;
      if (this.tHic <= 0) {
        this.tHic = tra(S.hic.ogni, this.rndSbronza);
        this.sobbalzo(S.hic.forza[L] * k, 'HIC!');
        Audio.sfx('hic');
        s.tweens.add({ targets: this.ritratto, y: { from: RITRATTO.y, to: RITRATTO.y - 5 }, duration: 70, yoyo: true });
      }
    }
    if (this.hicT > 0) {
      this.hicT -= dt;
      const q = Math.max(0, this.hicT / S.hic.durata);
      this.dm += this.hicV.m * q; this.dp += this.hicV.p * q;
    }
    // il ritratto ondeggia
    this.ritratto?.setAngle(L >= 2 ? Math.sin(t * 1.9) * (L === 3 ? 9 : 5) : 0);
    // gli avversari, se hanno bevuto, ondeggiano anche loro
    this.avv.forEach((a, i) => a.img.setAngle(this.sbronzaAvv >= 2 ? Math.sin(t * 1.7 + i * 1.9) * (this.sbronzaAvv === 3 ? 7 : 3.5) : 0));
    // la vista doppia: da BRILLO ogni tanto, da SBRONZO sempre
    let doppio = L >= 3;
    if (L === 2) {
      this.tDoppio -= dt;
      if (this.tDoppio <= 0) { this.tDoppio = tra(S.doppio.ogni, this.rndSbronza); this.doppioT = S.doppio.durata; }
      if (this.doppioT > 0) { this.doppioT -= dt; doppio = true; }
    }
    const dist = S.doppio.distanza * Math.min(1.3, k), ax = Math.cos(t * 0.9) * dist, ay = Math.sin(t * 1.3) * dist * 0.35;
    for (const c of this.lontani) if (c.fant) c.fant.setVisible(doppio).setPosition(c.sx + ax, c.sy + ay).setAlpha(S.doppio.alfa);
    // fumetti con le parole storpiate
    if (L >= 1 && this.attivo) {
      this.tFrase -= dt;
      if (this.tFrase <= 0) { this.tFrase = tra(S.fraseOgni); const f = S.frasi[L]; if (f?.length) fumetto(s, RITRATTO.x + 58, RITRATTO.y - 30, caso(f), 1500, P.hud + 5); }
    }
  }

  pendola(dt) {
    const p = this.pendolo;
    if (!p) return;
    p.t += dt;
    const ang = 30 * p.verso * Math.sin(p.t * 5.2) * Math.exp(-p.t / 1.5);
    this.lampada.setAngle(ang);
    this.luce.setAlpha(0.95 * Math.exp(-p.t / 2.4)).setX(240 - ang * 2.2);
    if (p.t > 5) { this.pendolo = null; this.lampada.setAngle(0); this.luce.setAlpha(0); }
  }

  // La telecamera: lo zoom sulla pallina per l'ultimo bicchiere e, da SBRONZO, tutta la visuale che
  // ondeggia come una barca (solo se nelle Impostazioni "Schermo che trema" è acceso)
  telecamera(dt) {
    const cam = this.scene.cameras.main, U = this.cfg.reazioni.ultimo, B = this.cfg.sbronza.barca;
    const meta = this.dramma ? U.zoom : 1;
    this.zoom += (meta - this.zoom) * Math.min(1, dt * 7);
    if (Math.abs(this.zoom - 1) < 0.002 && !this.dramma) this.zoom = 1;
    const q = (this.zoom - 1) / Math.max(0.01, U.zoom - 1), f = this.dramma?.b.sp;
    let cx = 240 + ((f?.x ?? 240) - 240) * q * 0.8, cy = 135 + ((f?.y ?? 135) - 135) * q * 0.8, rot = 0;
    if (this.sbronza >= 3 && Salvataggio.impostazioni.tremolio && this.attivo) {
      const t = this.orologio * ((Math.PI * 2) / B.periodo), k = Math.min(1.4, this.peso);
      rot = (B.gradi * k * Math.sin(t) * Math.PI) / 180;
      cx += Math.sin(t * 0.83 + 1) * B.sposta * k; cy += Math.cos(t) * B.sposta * 0.6 * k;
    }
    this.rot = (this.rot ?? 0) + (rot - (this.rot ?? 0)) * Math.min(1, dt * 5);
    cam.setZoom(RES * this.zoom).centerOn(cx, cy).setRotation(this.rot);
  }

  // rimette a posto telecamera e musica (quando la scena finisce o si ferma)
  ferma() {
    this.attivo = false;
    this.gesto = this.carica = null;
    this.gMira.clear();
    for (const b of this.palle) { b.img.setVisible(false); b.ombra.setVisible(false); }
    if (this.dramma) { this.dramma = null; this.lento = 1; Audio.musica(this.o.musica ?? 'gioco'); }
    this.zoom = 1; this.rot = 0;
    // (alla chiusura della scena la telecamera può non esserci già più)
    this.scene.cameras?.main?.setZoom(RES).centerOn(240, 135).setRotation(0);
  }

  // La mira: mentre si fa il gesto (o si carica con SPAZIO) si vede solo il primo tratto della
  // traiettoria, tratteggiato, e la barra della forza. Con le frecce resta una guida corta.
  disegnaMira() {
    const g = this.gMira, T = this.cfg.tiro;
    g.clear();
    if (!this.attivo) return;
    const t = this.gesto ? this.daGesto() : this.carica ? { m: this.miraTasti, p: this.forzaTasti() } : null;
    const guida = !t && this.tastiera ? { m: this.miraTasti, p: 0.42 } : null;
    const cosa = t ?? guida;
    const a = cosa ? this.storta(cosa.m, cosa.p) : { m: 0, p: 0 };
    if (this.pronto) {
      // la mano segue la mira
      this.mano.setAngle(a.m * 30).setY(this.m0.y + (t ? a.p * 7 : 0));
      this.pallaMano.setPosition(this.m0.x + a.m * 3, this.m0.y + (t ? a.p * 7 : 0));
    }
    if (this.gesto) {
      // il gesto, appena accennato
      g.lineStyle(1.4, 0xffffff, 0.35); g.lineBetween(this.gesto.x0, this.gesto.y0, this.gesto.x, this.gesto.y);
      g.fillStyle(0xffffff, 0.4); g.fillCircle(this.gesto.x0, this.gesto.y0, 2.2);
    }
    if (!cosa) return;
    const tiro = tiroDa(a.m, a.p, T), fin = guida ? T.anteprima * 0.6 : T.anteprima, passi = Math.max(3, Math.round(fin * 26));
    for (let i = 1; i <= passi; i++) {
      const e = (i / passi) * fin, sp = (() => { const q = puntoVolo(tiro, e); return proietta(q.x, q.y, q.h); })();
      const r = Math.max(0.9, PALLA * sp.k * 0.5), al = (guida ? 0.45 : 0.95) * (1 - (i / passi) * 0.45);
      g.fillStyle(0x1f1430, al * 0.6); g.fillCircle(sp.x, sp.y, r + 0.6);
      g.fillStyle(0xffffff, al); g.fillCircle(sp.x, sp.y, r);
    }
    if (!t) return;
    // la barra della forza, a destra dei propri bicchieri
    g.fillStyle(0x1f1430, 0.8); g.fillRoundedRect(306, 198, 8, 50, 3);
    g.fillStyle(0xffe14a, 1); if (a.p > 0.04) g.fillRoundedRect(307.5, 246.5 - 47 * a.p, 5, 47 * a.p, 2);
  }
}
