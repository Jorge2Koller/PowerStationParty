// Microgioco 17: "Provini a X-Factor" - suona "Cambiare Aria" del Tini e dell'Oli sui pad. SUONA!
//
//  Il palco di un talent show (inventato), con la grafica di Guitar Hero (scheda di valutazione:
//  "rifare come Guitar Hero le note e la griglia"): in mezzo l'autostrada delle note in prospettiva,
//  che parte dalla console di chi suona (in fondo al palco, davanti alla grande X) e arriva ai 4 pad
//  colorati in basso (verde, rosso, giallo, blu). La canzone è vera (un ritaglio di 35 secondi, 15 in
//  Lampo): le note scendono lungo le corsie, a tempo coi colpi della canzone (la mappa è in
//  xfactor-mappa.json, una per livello: la fanno strumenti/beatmap.py e strumenti/griglia.py). Si
//  colpiscono quando arrivano sul pad: PERFETTO, BUONO, MANCATO; le note lunghe sono scie da tenere,
//  nel gran finale arrivano gli accordi (due pad insieme). Ogni colpo fa una fiammata del colore
//  della corsia; con la serie i bordi della strada si accendono (giallo, arancio, azzurro) e le
//  fiamme crescono.
//  I due cantanti ai lati si dividono la canzone (scheda di valutazione: "la canzone deve avere sia
//  una parte del primo cantante che del secondo"; chi canta e quando è nella mappa, o nelle sezioni
//  in config): chi canta viene avanti sotto il riflettore, l'altro resta un passo indietro e fa il
//  coro; nel ritornello, tutti e due avanti.
//  L'errore si sente sulla canzone: a ogni nota mancata si ovatta e il disco graffia; con 3 errori
//  di fila resta ovattata e rallenta, finché non si torna a prendere le note. Davanti, ai due lati
//  della strada, i quattro giudici (inventati): le lucine dicono già come la pensano, e alla fine
//  votano la precisione.
//  Tre atti, allineati alla canzone: LA STROFA (il crescendo), IL PEZZO FORTE!, IL GRAN FINALE!.
//  Il tempo è quello della canzone (l'orologio dell'audio, meno la latenza e il ritardo audio delle
//  Impostazioni); senza audio si va col proprio orologio. La canzone è la stessa per tutti: nella
//  sfida, a pari livello, tutti suonano la stessa mappa.
//  Il ritaglio si carica e si decodifica quando parte il microgioco e si butta quando finisce.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { CONFIG } from '../config.js';
import { PROVINO, PROSPETTIVA, CORSIE, POS_STRADA } from '../grafica/provino.js';
import { txt, im, scalaDi, scritta, stelle, fumetto, caso, vibra, multiTouch, puntatore, puntiHud, numero, eTouch } from '../fx.js';

const TAGLIA = { cantante: 0.56, io: 0.42, giudice: 0.42 };
const PIEDI_GIUDICI = 263;
const V = PROSPETTIVA;
const COLORI = CORSIE.map((c) => parseInt(c.slice(1), 16));
const CODICI = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
const ESITI = { perfetto: ['PERFETTO!', '#7dff9a'], buono: ['BUONO', '#ffe14a'], mancato: ['MANCATO', '#ff6b5a'], vuoto: ['A VUOTO', '#ff9a8a'], mollata: ['MOLLATA!', '#ff9a8a'], tenuta: ['TENUTA!', '#7dff9a'] };
// il colore dei bordi della strada col moltiplicatore della serie (x1, x1,5, x2, x3)
const BORDI = [[1, 0x9a8cc8], [1.5, 0xffe14a], [2, 0xff9a2e], [3, 0x6ae0ff]];
let MAPPA = null;   // la mappa delle note: si scarica la prima volta e resta (è piccola, 5 KB)

export class XfactorScene extends MicrogiocoBase {
  constructor() { super('xfactor'); }

  // la musichetta non accelera (suona la canzone vera)
  tempoMusica() { return 1; }

  prepara() {
    this.lampo = Sessione.tipo === 'lampo';
    // (si chiamava "pronto", come il pulsante PRONTO! della prova in MicrogiocoBase: lo copriva, e
    // nella prova PRONTO non funzionava)
    this.caricata = false;
    // (la scena si riusa da un turno all'altro: si riparte da zero)
    this.song = null; this._verdetto = null; this.fuoriTempo = false; this.atti = null; this.battiti = null;
    this.note = []; this.iProssima = 0;
    this.pos = 0;                   // dove siamo nella canzone (secondi): quello che si sente
    this.punti = 0; this.serie = 0; this.serieMax = 0;
    this.perfetti = 0; this.buoni = 0; this.mancati = 0; this.mancatiFila = 0; this.lunghe = 0;
    this.premuti = [false, false, false, false];
    this.accesi = [0, 0, 0, 0];     // quanto brilla ogni pad (si spegne piano)
    this.rossi = [0, 0, 0, 0];      // il lampo rosso di una nota mancata
    this.dita = new Map();          // dito (o mouse) -> pad
    this.ovattata = false;
    this.nAtto = -1; this.nBattito = -1;
    this.sezioni = []; this.chiCanta = null; this.prossimaScintilla = 0;
    this.scena();
    this.comandi();
    this.alPausa = () => this.song?.pausa();
    this.events.on('pause', this.alPausa);
    this.carica();
  }

  alRientro() {
    for (let k = 0; k < 4; k++) this.rilascia(k, true);
    this.dita.clear();
    this.song?.riprendi();
  }

  pulisci() {
    this.events.off('pause', this.alPausa);
    this.song?.chiudi();      // (e la canzone decodificata si butta)
    this.song = null;
  }

  termina() {
    this.song?.ovatta(20000);
    super.termina();
  }

  // ---------- la canzone e la mappa ----------
  async carica() {
    const c = this.cfg;
    this.attesa = txt(this, 240, 150, 'SI ACCENDONO LE LUCI...', { size: 12, color: '#ffe14a', depth: 1000 });
    this.tweens.add({ targets: this.attesa, alpha: 0.4, duration: 380, yoyo: true, repeat: -1 });
    try { if (!MAPPA) MAPPA = await (await fetch(c.canzone.mappa)).json(); } catch (e) { MAPPA = null; }
    const R = MAPPA?.ritagli?.[this.lampo ? 'lampo' : 'intero'] ?? null;
    const buffer = R ? await Audio.carica(R.file) : null;
    // (la scena può essersi chiusa nel frattempo)
    if (!this.sys.isActive() && !this.sys.isPaused()) return;
    this.avvia(R, buffer);
  }

  avvia(R, buffer) {
    const c = this.cfg, fine = this.durata - 0.15, off = c.canzone.offset ?? 0;
    // senza mappa (non si è potuta scaricare): una nota ogni due battiti, sui quattro pad in giro (i
    // tagli e gli atti sono quelli dei ritagli, a 128 bpm: servono per le sezioni dei cantanti)
    if (!R) {
      const b = 60 / 128;
      R = { da: this.lampo ? 52.621 : 48.871, atti: this.lampo ? [0, 7.5, null] : [0, 11.25, 26.25], battiti: [], forti: [], mappe: {} };
      for (let t = 0; t < this.durata; t += b) { R.battiti.push(t); R.forti.push(R.battiti.length % 4 === 1 ? 1 : 0); }
      R.mappe.normale = R.battiti.filter((t, i) => t > 1.3 && i % 2 === 0).map((t, i) => [t, i % 4, 0]);
    }
    this.ritaglio = R;
    const mappa = (R.mappe[this.livello] ?? R.mappe.normale).filter((n) => n[0] < fine);
    this.note = mappa.map(([t, pad, dur]) => ({ t: t + off, pad, dur: Math.min(dur, fine - t), esito: null, tenuta: false }));
    // gli accordi: le note che arrivano insieme si legano con una sbarretta (si vede che vanno prese insieme)
    this.note.forEach((n, i) => { n.accordo = this.note[i - 1]?.t === n.t || this.note[i + 1]?.t === n.t; });
    // a FACILE le note sono meno e valgono di più (e a DIFFICILE il contrario): in tutto, i punti di NORMALE
    const rif = (R.mappe.normale ?? mappa).filter((n) => n[0] < fine).length;
    this.fattore = rif / Math.max(1, this.note.length);
    // ...e anche la serie: con meno note il moltiplicatore arriva prima (10 di fila a NORMALE sono 5 a FACILE)
    this.soglieSerie = c.serie.map(([n, k]) => [Math.max(3, Math.round(n / this.fattore)), k]);
    this.atti = R.atti;
    this.battiti = R.battiti.map((t) => t + off);
    this.forti = R.forti;
    // chi canta: dalla mappa (le "voci" del ritaglio, già in secondi del ritaglio: le scrive
    // strumenti/beatmap.py); se la mappa non le ha, le sezioni della config, che sono in secondi della
    // canzone intera e qui diventano secondi del ritaglio (quelle che nel ritaglio durano un attimo,
    // all'inizio o alla fine, non contano)
    const voci = R.voci?.length ? R.voci : (c.sezioni ?? []).map((s) => ({ ...s, da: s.da - (R.da ?? 0), a: s.a - (R.da ?? 0) }));
    this.sezioni = voci.map((s) => ({ ...s, da: s.da + off, a: s.a + off })).filter((s) => s.a > 0.3 && s.da < this.durata - 0.3);
    this.cantaChi(0, true);
    this.attesa.destroy();
    this.song = Audio.canzone(buffer);
    this.song?.avvia(0);
    this.caricata = true;
  }

  // Il tempo del microgioco non parte finché la canzone non è pronta; poi è quello della canzone.
  update(ora, delta) {
    if (!this.caricata) return;
    super.update(ora, delta);
  }

  // ---------- il palco ----------
  scena() {
    const c = this.cfg, P = PROVINO;
    im(this, 0, 0, 'bgProvino').setOrigin(0);
    this.fasci = this.add.graphics().setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
    this.buio = this.add.rectangle(0, 0, 480, 270, 0x05020c, 0).setOrigin(0).setDepth(15);
    // chi suona, in fondo al palco dietro la console (da lì parte la strada delle note)
    this.io = im(this, P.io, P.ioPiedi, `${this.giocatore.id}_normale`, TAGLIA.io).setOrigin(0.5, 1).setDepth(8);
    im(this, P.console.x, P.console.y, 'consoleDj').setOrigin(0.5, 0).setDepth(9);
    // i due cantanti (Oli, a destra, è girato verso il centro), coi loro riflettori: chi canta viene
    // avanti e si illumina, l'altro fa il coro un passo indietro (vedi cantaChi)
    this.riflettori = c.cantanti.map((id, k) => im(this, P.cantanti[k] + (k ? -6 : 6), 14, 'riflettore', 1).setOrigin(0.5, 0).setDepth(21).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(scalaDi('riflettore', 1.15), scalaDi('riflettore', 1.02)));
    this.pozze = c.cantanti.map((id, k) => im(this, P.cantanti[k], P.piedi, 'pozzaLuce', 1.2).setDepth(19).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    this.cantanti = c.cantanti.map((id, k) => im(this, P.cantanti[k], P.piedi, `${id}_palco`, TAGLIA.cantante).setOrigin(0.5, 1).setDepth(20).setFlipX(k === 1));
    this.taglie = [TAGLIA.cantante, TAGLIA.cantante];   // la taglia di adesso (chi canta è più grande)
    this.colori = c.cantanti.map((id) => CONFIG.personaggiGiocabili.find((p) => p.id === id)?.colore ?? '#ffe14a');
    // sopra la testa: il nome di chi canta (col suo colore) e "coro" sull'altro
    this.cartellini = c.cantanti.map((id, k) => {
      const t = txt(this, 0, 0, '', { size: 7.5, color: '#1f1430', thick: 0 }), g = this.add.graphics();
      return this.add.container(P.cantanti[k], P.piedi - 96, [g, t]).setDepth(36).setAlpha(0);
    });
    this.faccia = [0, 0];           // fino a quando un cantante tiene la faccia di una reazione
    // il fumo sul pavimento (dietro alla strada: davanti ai pad li copriva)
    for (let i = 0; i < 7; i++) {
      const f = im(this, 30 + i * 70, P.piedi + 6 + (i % 3) * 5, 'fumo', 2.6 + (i % 2)).setDepth(20.5).setAlpha(0.12 + (i % 3) * 0.03);
      this.tweens.add({ targets: f, x: f.x + (i % 2 ? 50 : -50), duration: 5200 + i * 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    // l'autostrada: la strada vuota (disegnata una volta), poi le righe dei battiti e i bordi che si
    // accendono, i pad, le scie delle note lunghe, le note (immagini, riusate), le fiamme
    this.strada = im(this, POS_STRADA.x, POS_STRADA.y, 'stradaProvino').setOrigin(0).setDepth(21);
    this.gRighe = this.add.graphics().setDepth(22);
    this.gLuce = this.add.graphics().setDepth(22.5).setBlendMode(Phaser.BlendModes.ADD);
    this.gPad = this.add.graphics().setDepth(23);
    this.gScie = this.add.graphics().setDepth(24);
    this.gemme = [];
    // (le scritte sopra i pad più piccole delle corsie, che lì sono larghe 53: a 6,5 un PERFETTO!
    // largo 55 toccava quello della corsia accanto e si leggeva PERFETTOPERFETTO)
    this.esiti = [0, 1, 2, 3].map((k) => txt(this, V.xDi(k, 0), V.colpo - 24, '', { size: 5.5, depth: 40 }).setAlpha(0));
    this.testoSerie = txt(this, 240, V.colpo + 27, '', { size: 8, color: '#ffe14a', depth: 40 });
    // i tasti sotto i pad (col dito no: si tocca il pad)
    this.tasti = eTouch() ? [] : ['D', 'F', 'J', 'K'].map((s, k) => txt(this, V.xDi(k, -0.03), V.colpo + 14, s, { size: 7, depth: 40, color: CORSIE[k] }).setAlpha(0.75));
    // i giudici ai due tavoli, con la lucina davanti a ognuno, e il NO del produttore
    this.giudici = c.giudici.map((g, i) => ({ ...g, x: P.giudici[i], img: im(this, P.giudici[i], PIEDI_GIUDICI, `giudice${i}_normale`, TAGLIA.giudice).setOrigin(0.5, 1).setDepth(30), voto: null }));
    for (const x of P.banchi) im(this, x, P.banco.y, 'bancoGiudici').setOrigin(0.5, 0).setDepth(31);
    this.lucine = this.add.graphics().setDepth(32);
    this.lucineDi = null;
    this.no = this.add.container(P.giudici[2] + 30, P.lucine, [this.add.graphics(), txt(this, 0, 0.5, 'NO', { size: 7, color: '#ffe1dc', thick: 0 })]).setDepth(33);
    this.disegnaNo(false);
    // il pubblico al buio, con gli accendini (si alzano con la serie)
    im(this, 0, 247, 'pubblicoProvino').setOrigin(0).setDepth(33);
    this.accendini = [];
    for (let i = 0; i < 18; i++) {
      const x = 14 + i * 26.5 + (i % 3) * 4, a = im(this, x, 268, 'accendino').setOrigin(0.5, 0).setDepth(34).setAlpha(0);
      this.accendini.push({ img: a, x, fase: i * 1.7, soglia: ((i * 7) % 18) / 18 });
    }
    this.testoPunti = txt(this, 474, 36, puntiHud(0), { size: 9, ox: 1, depth: 1001 });
    this.testoPrecisione = txt(this, 474, 48, '', { size: 7, ox: 1, depth: 1001, color: '#fff3d6' });
  }

  disegnaNo(acceso) {
    const g = this.no.list[0];
    g.clear();
    g.fillStyle(acceso ? 0xff2a2a : 0x6a1a1a, 1); g.fillRoundedRect(-9, -5, 18, 10, 3);
    g.lineStyle(1, 0x2b1b17, 1); g.strokeRoundedRect(-9, -5, 18, 10, 3);
    if (acceso) { g.fillStyle(0xff4a3a, 0.35); g.fillCircle(0, 0, 13); }
    this.no.list[1].setAlpha(acceso ? 1 : 0.5);
  }

  // ---------- chi canta ----------
  // Le sezioni della canzone (config: sezioni): chi canta viene avanti, più grande, sotto il suo
  // riflettore, col nome sopra la testa; l'altro fa un passo indietro, un po' in ombra, e fa il coro
  // ('insieme': tutti e due avanti). Al cambio, "TOCCA A OLI!".
  cantaChi(v, subito = false) {
    const c = this.cfg, P = PROVINO;
    const s = this.sezioni.find((s) => v >= s.da && v < s.a);
    const chi = s?.cantante ?? this.chiCanta ?? 'insieme';
    if (chi === this.chiCanta) return;
    const primo = this.chiCanta == null;
    this.chiCanta = chi;
    c.cantanti.forEach((id, k) => {
      const su = chi === 'insieme' || chi === id, img = this.cantanti[k], verso = k ? -1 : 1;
      this.taglie[k] = TAGLIA.cantante * (su ? 1.1 : 0.92);
      const dove = { x: P.cantanti[k] + (su ? 8 : -4) * verso, y: P.piedi + (su ? 4 : -4), scaleX: scalaDi(img.texture.key, this.taglie[k]), scaleY: scalaDi(img.texture.key, this.taglie[k]) };
      this.tweens.killTweensOf(img);
      if (subito) img.setPosition(dove.x, dove.y).setScale(dove.scaleX);
      else this.tweens.add({ targets: img, ...dove, duration: 320, ease: 'Back.out' });
      if (su) img.clearTint(); else img.setTint(0xa49cc4);
      img.setDepth(su ? 20 : 19.5);
      this.tweens.add({ targets: [this.riflettori[k], this.pozze[k]], alpha: su ? 1 : 0, duration: subito ? 1 : 300 });
      this.tweens.add({ targets: this.riflettori[k], x: dove.x, duration: subito ? 1 : 320 });
      this.tweens.add({ targets: this.pozze[k], x: dove.x, y: dove.y, duration: subito ? 1 : 320 });
      // il cartellino: il nome sul colore del cantante, o "coro" in grigio
      const cart = this.cartellini[k], [g, t] = cart.list;
      t.setText(su ? id.toUpperCase() : 'CORO').setColor(su ? '#1f1430' : '#d8d0f0').setFontSize((su ? 7.5 : 7) * 1.3);
      const w = t.width + 6;
      g.clear();
      if (su) { g.fillStyle(0x1f1430, 1); g.fillRoundedRect(-w / 2 - 1, -7, w + 2, 14, 7); g.fillStyle(Phaser.Display.Color.HexStringToColor(this.colori[k]).color, 1); g.fillRoundedRect(-w / 2, -6, w, 12, 6); }
      cart.setPosition(dove.x, dove.y - 96 * this.taglie[k] * 1.5 - 8);
      this.tweens.add({ targets: cart, alpha: su ? 1 : 0.7, duration: 200 });
      // chi attacca a cantare lo fa subito, a bocca aperta
      if (su && v >= this.faccia[k]) img.setTexture(`${id}_canta`);
    });
    if (!primo && !subito) {
      // (tutti e due insieme: "INSIEME!" sopra a ognuno)
      c.cantanti.forEach((id, k) => {
        if (chi !== 'insieme' && chi !== id) return;
        scritta(this, P.cantanti[k] + (k ? -40 : 40), P.piedi - 128, chi === 'insieme' ? 'INSIEME!' : `TOCCA A ${chi.toUpperCase()}!`, { size: 9, color: this.colori[k], durata: 650, depth: 960 });
      });
    }
  }

  // ---------- i comandi ----------
  comandi() {
    const quando = (ts) => {
      // (il momento vero del tasto, non quello del fotogramma: conta anche per i millesimi)
      const ora = this.song?.suona ? this.song.posizione : this.pos;
      return ora - Math.max(0, (performance.now() - (ts ?? performance.now())) / 1000);
    };
    // (ogni tasto una volta sola: quando i fotogrammi sono lenti lo stesso tasto a volte arrivava due
    // volte, e il secondo era un colpo a vuoto)
    const visti = new WeakSet();
    this.input.keyboard.on('keydown', (e) => {
      const k = CODICI[e.code];
      if (k == null || e.repeat || visti.has(e)) return;
      visti.add(e);
      e.preventDefault?.();
      this.premi(k, quando(e.timeStamp));
    });
    this.input.keyboard.on('keyup', (e) => { const k = CODICI[e.code]; if (k != null) this.rilascia(k); });
    // dito e mouse: si tocca il pad, o la sua corsia sulla strada (più dita insieme). La corsia è
    // quella della prospettiva all'altezza del dito, un po' più larga ai bordi (sui pad esterni il
    // dito scappa fuori); in alto no, lì ci sono i pulsanti
    multiTouch(this, 4);
    const corsia = (p) => {
      const w = puntatore(this, p);
      if (w.y < V.cima + 12) return null;
      const u = (w.x - V.cx) / ((V.wColpo / 4) * V.sc(V.zDi(w.y))) + 1.5;
      return u < -1.1 || u > 4.1 ? null : Phaser.Math.Clamp(Math.round(u), 0, 3);
    };
    this.input.on('pointerdown', (p) => {
      const k = corsia(p);
      if (k == null) return;
      this.dita.set(p.id, k);
      this.premi(k, quando(p.event?.timeStamp));
    });
    const su = (p) => { const k = this.dita.get(p.id); if (k == null) return; this.dita.delete(p.id); this.rilascia(k); };
    this.input.on('pointerup', su);
    this.input.on('pointerupoutside', su);
  }

  molt() { return (this.soglieSerie ?? this.cfg.serie).reduce((m, [n, k]) => (this.serie >= n ? k : m), 1); }

  // un pad premuto (quando = il momento, in secondi di canzone)
  premi(k, quando) {
    if (!this.inCorso || !this.caricata) return;
    const F = this.cfg.finestre;
    this.premuti[k] = true;
    this.accesi[k] = Math.max(this.accesi[k], 0.45);
    let meglio = null;
    for (let i = this.iProssima; i < this.note.length; i++) {
      const n = this.note[i];
      if (n.t - quando > F.vuoto) break;
      if (n.esito || n.pad !== k) continue;
      const d = Math.abs(n.t - quando);
      if (d <= F.buono && (!meglio || d < Math.abs(meglio.t - quando))) meglio = n;
    }
    if (!meglio) {
      // a vuoto: se c'era una nota lì vicino (troppo presto o troppo tardi) la serie si azzera
      if (this.note.some((n, i) => i >= this.iProssima && !n.esito && n.pad === k && Math.abs(n.t - quando) <= F.vuoto)) { this.serie = 0; this.mostra(k, 'vuoto'); Audio.sfx('tsk'); this.hud(); }
      return;
    }
    this.colpita(meglio, Math.abs(meglio.t - quando) <= F.perfetto ? 'perfetto' : 'buono');
  }

  rilascia(k, pausa = false) {
    this.premuti[k] = false;
    // una nota lunga lasciata prima della fine della scia (il resto della scia diventa grigio)
    for (const n of this.note) {
      if (!n.tenuta || n.pad !== k) continue;
      n.tenuta = false;
      if (!pausa && this.pos < n.t + n.dur - this.cfg.finestre.buono) { n.mollata = true; this.mostra(k, 'mollata'); this.serie = 0; this.hud(); }
      else this.finitaLunga(n);
    }
  }

  colpita(n, esito) {
    const c = this.cfg, prima = this.molt();
    n.esito = esito;
    if (n.dur > 0) n.tenuta = true;
    const v = c.punti[esito] * this.molt() * this.fattore;
    this.punti += v;
    this.serie++; this.serieMax = Math.max(this.serieMax, this.serie);
    if (esito === 'perfetto') this.perfetti++; else this.buoni++;
    this.mancatiFila = 0;
    // la canzone torna pulita (e a tempo giusto)
    if (this.ovattata) { this.ovattata = false; this.song?.ovatta(20000); this.song?.velocita(1); }
    this.accesi[n.pad] = 1;
    this.mostra(n.pad, esito);
    this.fiammata(n.pad, esito === 'perfetto' ? 1 : 0.75);
    // un traguardo della serie: fiamme su tutti i pad, la scritta e le stelle
    if (this.soglieSerie?.some(([q]) => q === this.serie)) {
      scritta(this, 240, V.colpo - 46, `${this.serie} DI FILA!`, { size: 11, color: '#ffe14a', durata: 550 });
      // (le stelle dietro la scritta: davanti la coprivano)
      stelle(this, 240, V.colpo - 46, 8, 940);
      for (let k = 0; k < 4; k++) if (k !== n.pad) this.time.delayedCall(40 * k, () => this.fiammata(k, 1.1));
    }
    if (this.molt() > prima) this.bagliore = 1;
    // i cantanti si gasano, i giudici annuiscono
    if (this.serie >= 5 && this.serie % 5 === 0) this.reagisci('gasato', 0.5);
    for (const g of this.giudici) if (g.precisa && Math.random() < 0.3) this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI + 2, duration: 90, yoyo: true });
    this.hud();
  }

  // la fiammata del colpo: una fiamma del colore della corsia che sale dal pad, e le scintille.
  // Con la serie (moltiplicatore) le fiamme sono più alte e le scintille di più
  fiammata(k, forza = 1) {
    const x = V.xDi(k, 0), y = V.colpo, m = this.molt(), alta = forza * (1 + (m - 1) * 0.35);
    const f = im(this, x, y + 3, 'fiammaPad', 1).setOrigin(0.5, 1).setDepth(27).setTint(COLORI[k]).setBlendMode(Phaser.BlendModes.ADD);
    const s0 = scalaDi('fiammaPad', 1);
    f.setScale(s0 * 1.2, s0 * 0.5 * alta);
    this.tweens.add({ targets: f, scaleY: s0 * 1.5 * alta, scaleX: s0 * 0.8, alpha: 0, duration: 300 + 60 * m, ease: 'Quad.out', onComplete: () => f.destroy() });
    const anello = this.add.ellipse(x, y, 30, 12).setStrokeStyle(2, COLORI[k], 1).setDepth(27).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: anello, scaleX: 1.7, scaleY: 1.7, alpha: 0, duration: 260, onComplete: () => anello.destroy() });
    this.scintille(k, m > 1 ? 7 : 4);
  }

  scintille(k, quante) {
    const x = V.xDi(k, 0), y = V.colpo - 2;
    for (let i = 0; i < quante; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, d = 12 + Math.random() * 22;
      const s = im(this, x + (Math.random() - 0.5) * 16, y, 'scintillaPad', 0.7 + Math.random() * 0.6).setDepth(27).setTint(i % 2 ? 0xffffff : COLORI[k]).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: s, x: s.x + Math.cos(a) * d, y: s.y + Math.sin(a) * d, alpha: 0, duration: 280 + Math.random() * 200, ease: 'Quad.out', onComplete: () => s.destroy() });
    }
  }

  finitaLunga(n) {
    if (n.chiusa) return;
    n.chiusa = true;
    this.punti += this.cfg.punti.lunga * this.molt() * this.fattore;
    this.lunghe++;
    this.mostra(n.pad, 'tenuta');
    this.fiammata(n.pad, 0.9);
    this.hud();
  }

  mancata(n) {
    const c = this.cfg, E = c.errori;
    n.esito = 'mancato';
    this.mancati++; this.mancatiFila++;
    this.serie = 0;
    this.rossi[n.pad] = 1;
    this.mostra(n.pad, 'mancato');
    vibra(40);
    // l'errore si sente sulla canzone: ovattata e graffiata; con tre errori di fila resta così e rallenta
    if (this.mancatiFila >= E.fila) { this.ovattata = true; this.song?.ovatta(E.taglio); this.song?.velocita(E.lento); }
    else this.song?.ovatta(E.taglio, E.ovatta);
    this.song?.graffio();
    if (!this.song) Audio.sfx('errore');
    if (this.mancatiFila >= 2) Audio.sfx('buu');
    // il cantante più vicino si gira e guarda malissimo; il produttore preme NO
    this.reagisci('male', 0.7, n.pad < 2 ? 0 : 1);
    this.disegnaNo(true);
    this.time.delayedCall(260, () => this.disegnaNo(false));
    this.time.delayedCall(420, () => { if (this.mancatiFila) this.disegnaNo(true); });
    this.time.delayedCall(640, () => this.disegnaNo(false));
    this.hud();
  }

  // una faccia per un po': 'gasato' (tutti e due) o 'male' (quello di quel lato, girato verso chi suona)
  reagisci(faccia, secondi, chi = null) {
    const c = this.cfg;
    this.cantanti.forEach((img, k) => {
      if (chi != null && k !== chi) return;
      img.setTexture(`${c.cantanti[k]}_${faccia}`).setFlipX(k === 1);
      this.faccia[k] = this.pos + secondi;
    });
  }

  mostra(k, esito) {
    const t = this.esiti[k], [s, col] = ESITI[esito];
    this.tweens.killTweensOf(t);
    // (le corsie 2 e 4 un po' più in alto: i PERFETTO! di due corsie vicine, uno accanto all'altro, si
    // toccavano e si leggevano come una parola sola)
    const y = V.colpo - 24 - (k % 2) * 9;
    t.setText(s).setColor(col).setAlpha(1).setY(y).setScale(esito === 'perfetto' ? 1.06 : 1);
    this.tweens.add({ targets: t, y: y - 12, alpha: 0, duration: 480, delay: 100 });
  }

  get precisione() {
    const fatte = this.perfetti + this.buoni + this.mancati;
    return fatte ? (this.perfetti + this.cfg.pesoBuono * this.buoni) / fatte : 0;
  }

  hud() {
    this.testoPunti.setText(puntiHud(this.punti));
    const m = this.molt();
    // (col moltiplicatore, del colore dei bordi della strada)
    this.testoSerie.setText(this.serie >= 3 ? `SERIE ${this.serie}${m > 1 ? `  x${numero(m, m % 1 ? 1 : 0)}` : ''}` : '')
      .setColor(m > 1 ? '#' + BORDI.reduce((col, [q, c]) => (m >= q ? c : col), 0).toString(16).padStart(6, '0') : '#ffe14a');
    const fatte = this.perfetti + this.buoni + this.mancati;
    this.testoPrecisione.setText(fatte ? `PRECISIONE ${Math.round(this.precisione * 100)}%` : '');
    // le lucine dei giudici: verdi se la precisione passa la loro soglia (si ridisegnano solo se cambiano)
    const chiave = this.giudici.map((g) => (g.precisa = fatte >= 4 && this.precisione >= g.soglia) ? 1 : 0).join('');
    if (chiave !== this.lucineDi) {
      this.lucineDi = chiave;
      const L = this.lucine, y = PROVINO.lucine;
      L.clear();
      this.giudici.forEach((g, i) => {
        const col = fatte < 4 ? 0x8a7aa8 : chiave[i] === '1' ? 0x4ade80 : 0xff3a2e;
        L.fillStyle(col, 0.3).fillCircle(g.x, y, 6).fillStyle(col, 1).fillCircle(g.x, y, 2.8);
      });
    }
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    const c = this.cfg, F = c.finestre;
    // il tempo: quello della canzone; se l'audio non c'è (o è fermo), il proprio orologio
    if (this.song?.suona && Audio.inFunzione) {
      if (this.fuoriTempo) { this.fuoriTempo = false; this.song.vaiA(this.pos); }
      else this.pos = this.song.posizione;
    } else {
      if (this.song?.suona) this.fuoriTempo = true;     // (l'audio si è fermato: al ritorno si riallinea)
      this.pos += dt * (this.ovattata ? c.errori.lento : 1);
    }
    this.trascorso = this.pos;

    // le note passate senza essere prese, e le lunghe tenute fino in fondo
    for (let i = this.iProssima; i < this.note.length; i++) {
      const n = this.note[i];
      if (n.t - this.pos > F.vuoto) break;
      if (!n.esito && this.pos > n.t + F.buono) this.mancata(n);
      if (n.tenuta && this.pos >= n.t + n.dur) { n.tenuta = false; this.finitaLunga(n); }
    }
    while (this.iProssima < this.note.length) {
      const n = this.note[this.iProssima];
      if (n.esito && !n.tenuta && this.pos > n.t + n.dur + F.vuoto) this.iProssima++;
      else break;
    }

    // gli atti
    const atto = this.atti ? this.atti.reduce((a, da, i) => (da != null && this.pos >= da ? i : a), 0) : 0;
    if (atto !== this.nAtto) {
      const primo = this.nAtto < 0;
      this.nAtto = atto;
      if (!primo || atto > 0 || !this.lampo) {
        Audio.sfx('bonus');
        // (in alto, sopra la strada: non deve coprire le note che scendono)
        scritta(this, 240, 40, c.atti[atto].nome, { size: 13, color: atto === 2 ? '#ff6b5a' : '#ffe14a', durata: 900, depth: 950 });
      }
      // (in piedi di poco: le teste non devono coprire i cantanti)
      if (c.atti[atto].inPiedi) for (const g of this.giudici) this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI - 4, duration: 300, ease: 'Back.out' });
    }
    this.cantaChi(this.pos);
    this.battito();
    this.disegna(dt);
  }

  // A ogni battito chi canta apre la bocca e molleggia (di più sui battiti forti); chi fa il coro
  // canta solo sul primo della battuta, e gli scappa una notina. Chi suona va a tempo dietro la console.
  battito() {
    if (!this.battiti) return;
    let b = this.nBattito;
    while (b + 1 < this.battiti.length && this.pos >= this.battiti[b + 1]) b++;
    if (b === this.nBattito) return;
    this.nBattito = b;
    const c = this.cfg, forte = this.forti[b];
    this.cantanti.forEach((img, k) => {
      if (this.pos < this.faccia[k] || this.tweens.isTweening(img)) return;
      const su = this.chiCanta === 'insieme' || this.chiCanta === c.cantanti[k];
      const posa = su ? (this.nAtto === 2 && forte ? 'acuto' : b % 2 || forte ? 'canta' : 'palco') : forte ? 'canta' : 'palco';
      img.setTexture(`${c.cantanti[k]}_${posa}`).setFlipX(k === 1);
      const sy = scalaDi(img.texture.key, this.taglie[k]), k0 = su ? (forte ? 0.93 : 0.96) : 0.98;
      img.setScale(sy);
      this.tweens.add({ targets: img, scaleY: { from: sy * k0, to: sy }, duration: 180, ease: 'Quad.out' });
      if (!su && forte) this.notina(k);
    });
    this.cartellini.forEach((cart) => this.tweens.add({ targets: cart, scale: { from: forte ? 1.12 : 1.05, to: 1 }, duration: 160 }));
    this.tweens.add({ targets: this.io, y: { from: PROVINO.ioPiedi + 2, to: PROVINO.ioPiedi }, duration: 160 });
    this.lampoBattito = forte ? 1 : 0.5;
  }

  // la notina del coro: esce dalla bocca di chi fa il coro e sale ondeggiando
  notina(k) {
    const img = this.cantanti[k], x = img.x + (k ? -8 : 8), y = img.y - 96 * this.taglie[k] * 1.5 + 22;
    const n = im(this, x, y, 'notina', 0.9).setDepth(36).setTint(Phaser.Display.Color.HexStringToColor(this.colori[k]).color).setAlpha(0.9);
    this.tweens.add({ targets: n, y: y - 24, x: x + (k ? -10 : 10), alpha: 0, angle: (k ? -1 : 1) * 20, duration: 900, ease: 'Sine.out', onComplete: () => n.destroy() });
  }

  disegna(dt) {
    const c = this.cfg, P = PROVINO, A = c.atti[this.nAtto] ?? c.atti[0], v = this.pos, ant = c.anticipo;
    // i fasci delle luci: girano a tempo; nel finale i riflettori puntano i cantanti
    const g = this.fasci, luci = A.luci * (this.ovattata ? 0.4 : 1);
    g.clear();
    const fasci = [[60, 0xff4fb8], [170, 0x3ae0ff], [310, 0xffe14a], [420, 0x7a3aff]];
    fasci.forEach(([x, col], i) => {
      const a = Math.sin(v * (1.2 + i * 0.3) + i * 1.7) * 0.45, lung = 230;
      const tx = A.riflettori ? P.cantanti[i % 2] : x + Math.sin(a) * lung;
      g.fillStyle(col, 0.07 * luci);
      g.fillTriangle(x, -4, tx - 34, lung, tx + 34, lung);
    });

    // la strada: le righe dei battiti scorrono verso i pad (più marcate sul primo della battuta)
    const R = this.gRighe, L = this.gLuce, zF = V.zFondo;
    R.clear(); L.clear();
    this.strada.setAlpha(this.ovattata ? 0.7 : 1);
    if (this.battiti) {
      for (let i = Math.max(0, this.nBattito - 1); i < this.battiti.length; i++) {
        const z = (this.battiti[i] - v) / ant;
        if (z > 1) break;
        if (z < zF) continue;
        const y = V.yDi(z), forte = this.forti[i], nebbia = Math.min(1, (1 - z) * 4);
        R.lineStyle((forte ? 1.6 : 0.8) * V.sc(z), 0xffffff, (forte ? 0.32 : 0.14) * nebbia);
        R.lineBetween(V.xDi(-0.5, z), y, V.xDi(3.5, z), y);
      }
    }
    // i bordi: si accendono col moltiplicatore della serie, pulsano coi battiti e quando sale il moltiplicatore
    const m = this.molt(), colB = BORDI.reduce((col, [q, cc]) => (m >= q ? cc : col), BORDI[0][1]);
    this.lampoBattito = Math.max(0, (this.lampoBattito ?? 0) - dt * 4);
    this.bagliore = Math.max(0, (this.bagliore ?? 0) - dt * 1.5);
    const forza = (m > 1 ? 0.55 : 0.18) + this.lampoBattito * 0.25 + this.bagliore * 0.6;
    for (const k of [-0.5, 3.5]) {
      L.lineStyle(7 + this.bagliore * 6, colB, 0.16 * forza); L.lineBetween(V.xDi(k, 1), V.cima, V.xDi(k, zF), 270);
      L.lineStyle(2.2, colB, Math.min(1, 0.5 + forza)); L.lineBetween(V.xDi(k, 1), V.cima, V.xDi(k, zF), 270);
    }

    // i pad: un anello del colore della corsia; premuto si abbassa e si accende, sul colpo brilla
    const p = this.gPad, y0 = V.colpo, rx = V.wColpo / 8 - 4;
    p.clear();
    for (let k = 0; k < 4; k++) {
      this.accesi[k] = Math.max(this.premuti[k] ? 0.35 : 0, this.accesi[k] - dt * 3);
      this.rossi[k] = Math.max(0, this.rossi[k] - dt * 3);
      const x = V.xDi(k, 0), a = this.accesi[k], giu = this.premuti[k] ? 1.5 : 0;
      p.fillStyle(0x000000, 0.45); p.fillEllipse(x, y0 + 3, rx * 2 + 4, 19);
      p.fillStyle(0x15101f, 1); p.fillEllipse(x, y0 + giu, rx * 2 + 2, 17);
      p.lineStyle(3, COLORI[k], 0.6 + a * 0.4); p.strokeEllipse(x, y0 + giu, rx * 2 - 2, 14);
      p.fillStyle(COLORI[k], 0.16 + a * 0.84); p.fillEllipse(x, y0 + giu, rx * 1.3, 8.5);
      if (this.rossi[k] > 0) { p.lineStyle(2, 0xff3a2e, this.rossi[k]); p.strokeEllipse(x, y0, rx * 2 + 4, 18); }
      if (a > 0.4) { L.fillStyle(COLORI[k], (a - 0.4) * 0.5); L.fillEllipse(x, y0, rx * 2 + 16 * a, 24 * a); }
    }

    // le note: le gemme scendono lungo la loro corsia, e diventano grandi avvicinandosi; quelle
    // lunghe con la scia (accesa mentre la tieni, grigia se l'hai mollata); gli accordi con la sbarretta
    const S = this.gScie;
    S.clear();
    let usate = 0, accordo = null;
    for (let i = this.iProssima; i < this.note.length; i++) {
      const q = this.note[i], z = (q.t - v) / ant;
      if (z > 1) break;
      const x = (zz) => V.xDi(q.pad, zz), col = COLORI[q.pad];
      // la scia, dalla testa (o dal pad, se la tieni) alla fine
      if (q.dur > 0 && !q.chiusa) {
        const zT = Math.max(zF, q.tenuta ? 0 : z), zC = Math.min(1, (q.t + q.dur - v) / ant);
        if (zC > zT) {
          const spenta = q.esito === 'mancato' || q.mollata, onda = q.tenuta ? Math.sin(v * 40) * 1.2 : 0;
          const w = (zz, k) => (k * V.sc(zz)), pezzi = 8;
          for (let j = 0; j < pezzi; j++) {
            const za = zT + ((zC - zT) * j) / pezzi, zb = zT + ((zC - zT) * (j + 1)) / pezzi, oa = j % 2 ? onda : -onda;
            S.fillStyle(spenta ? 0x5a5470 : col, spenta ? 0.45 : q.tenuta ? 0.95 : 0.7);
            S.fillPoints([{ x: x(za) - w(za, 5) + oa, y: V.yDi(za) }, { x: x(za) + w(za, 5) + oa, y: V.yDi(za) }, { x: x(zb) + w(zb, 5) - oa, y: V.yDi(zb) }, { x: x(zb) - w(zb, 5) - oa, y: V.yDi(zb) }], true);
            if (!spenta) { S.fillStyle(0xffffff, q.tenuta ? 0.75 : 0.35); S.fillPoints([{ x: x(za) - w(za, 1.4) + oa, y: V.yDi(za) }, { x: x(za) + w(za, 1.4) + oa, y: V.yDi(za) }, { x: x(zb) + w(zb, 1.4) - oa, y: V.yDi(zb) }, { x: x(zb) - w(zb, 1.4) - oa, y: V.yDi(zb) }], true); }
          }
          if (q.tenuta) { L.fillStyle(col, 0.35); L.fillEllipse(x(0), y0, rx * 2 + 10, 20); }
        }
      }
      // la gemma: sparisce quando la prendi; mancata, diventa grigia e scivola giù, fuori dalla strada
      if ((q.esito && q.esito !== 'mancato') || z < zF || q.tenuta) continue;
      const s = V.sc(z), y = V.yDi(z), nebbia = Math.min(1, (1 - z) * 6);
      const gm = this.gemma(usate++);
      gm.setTexture(`gemma${q.pad}`).setPosition(x(z), y - 1.5 * s).setScale(scalaDi('gemma0', s * 0.95)).setVisible(true)
        .setAlpha(q.esito === 'mancato' ? 0.55 * nebbia : nebbia).setDepth(26 - z);
      if (q.esito === 'mancato') gm.setTint(0x6a6480); else gm.clearTint();
      // la sbarretta dell'accordo, tra le gemme che arrivano insieme
      if (q.accordo && !q.esito) {
        if (accordo && accordo.t === q.t) { S.lineStyle(2.4 * s, 0xffffff, 0.7 * nebbia); S.lineBetween(accordo.x, y, x(z), y); }
        accordo = { t: q.t, x: x(z) };
      }
    }
    for (let i = usate; i < this.gemme.length; i++) this.gemme[i].setVisible(false);
    // le scintille della nota lunga tenuta
    if (this.note.some((q) => q.tenuta) && v >= this.prossimaScintilla) {
      this.prossimaScintilla = v + 0.09;
      for (const q of this.note) if (q.tenuta) this.scintille(q.pad, 1);
    }

    // gli accendini: più è lunga la serie, più se ne alzano
    const quanti = Math.min(1, this.serie / 25);
    for (const a of this.accendini) {
      const su = quanti > a.soglia, al = a.img.alpha + ((su ? 1 : 0) - a.img.alpha) * Math.min(1, dt * 4);
      a.img.setAlpha(al).setY(268 - al * 16 + Math.sin(v * 2 + a.fase) * 1.2).setAngle(Math.sin(v * 1.6 + a.fase) * 8);
    }
  }

  // le gemme sono immagini riusate di fotogramma in fotogramma (se ne crea una solo quando servono di più)
  gemma(i) {
    if (!this.gemme[i]) this.gemme[i] = im(this, 0, 0, 'gemma0').setDepth(26);
    return this.gemme[i];
  }

  // ---------- la fine ----------
  verdetto() {
    if (this._verdetto) return this._verdetto;
    const c = this.cfg, totale = Math.max(1, this.note.length);
    // la precisione su tutte le note della canzone (quelle mai arrivate contano come mancate)
    const pr = (this.perfetti + c.pesoBuono * this.buoni) / totale;
    const voti = c.giudici.map((g) => pr >= g.soglia);
    const si = voti.filter(Boolean).length;
    this._verdetto = { precisione: pr, voti, si, vittoria: si >= c.siPerVincere };
    return this._verdetto;
  }

  risultato() {
    const c = this.cfg, v = this.verdetto();
    let p = this.punti + v.si * c.punti.si;
    // la scala comune: senza il provino passato niente bronzo, col provino passato almeno il bronzo
    // (in Lampo le medaglie non contano: i punti e basta)
    if (!this.lampo) p = v.vittoria ? Math.max(c.medaglie.bronzo, p) : Math.min(c.tettoPrima, p);
    return {
      punteggio: Math.round(p),
      vittoria: v.vittoria,
      riepilogo: `Precisione ${Math.round(v.precisione * 100)}%   SÌ: ${v.si} su ${c.giudici.length}`,
      titoloFine: v.vittoria ? c.frasiVittoria[0] : c.frasiSconfitta[0],
    };
  }

  // I quattro voti uno dietro l'altro, con un colpo di tamburo ciascuno, poi l'esito. Al massimo
  // quattro secondi; si salta con un tocco, INVIO o SPAZIO.
  finale(ris, fatto) {
    const c = this.cfg, P = PROVINO, v = this.verdetto();
    for (const o of [this.strada, this.gRighe, this.gLuce, this.gPad, this.gScie, ...this.gemme, ...this.tasti, this.testoSerie, this.testoPunti, this.testoPrecisione, this.no, ...this.esiti, ...this.cartellini]) o.setVisible(false);
    // (i riflettori si spengono: il verdetto è per tutti e due)
    this.tweens.add({ targets: [...this.riflettori, ...this.pozze], alpha: 0, duration: 250 });
    this.tweens.killTweensOf(this.buio);
    this.tweens.add({ targets: this.buio, fillAlpha: 0.5, duration: 250 });
    this.cantanti.forEach((img, k) => { this.tweens.killTweensOf(img); img.setTexture(`${c.cantanti[k]}_palco`).setFlipX(k === 1).clearTint().setScale(scalaDi(`${c.cantanti[k]}_palco`, TAGLIA.cantante)).setPosition(P.cantanti[k], P.piedi); });
    this.giudici.forEach((g, i) => { g.img.setTexture(`giudice${i}_normale`); this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI, duration: 200 }); });
    let chiuso = false;
    const fine = () => { if (chiuso) return; chiuso = true; fatto(); };
    this.time.delayedCall(350, () => {
      for (const k of ['ENTER', 'SPACE']) this.input.keyboard.once('keydown-' + k, fine);
      this.input.once('pointerdown', fine);
    });
    const titolo = txt(this, 240, 128, 'IL VERDETTO...', { size: 16, color: '#ffe14a', depth: 960 });
    const frase = txt(this, 240, 156, '', { size: 8, color: '#ffffff', depth: 960, wrap: 380 });
    const cartelli = [];
    v.voti.forEach((si, i) => this.time.delayedCall(280 + i * 500, () => {
      const g = this.giudici[i];
      Audio.sfx('tamburo');
      g.img.setTexture(`giudice${i}_${si ? 'felice' : 'no'}`);
      this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI - 5, duration: 100, yoyo: true });
      const t = txt(this, g.x, 190, si ? 'SÌ' : 'NO', { size: 17, color: si ? '#7dff9a' : '#ff6b5a', depth: 961 }).setScale(2.4).setAlpha(0);
      cartelli.push(t);
      this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 160, ease: 'Quad.in' });
      this.lucine.fillStyle(si ? 0x4ade80 : 0xff3a2e, 0.35).fillCircle(g.x, P.lucine, 6.5).fillStyle(si ? 0x4ade80 : 0xff3a2e, 1).fillCircle(g.x, P.lucine, 3.2);
      frase.setText(`${g.nome}: "${caso(si ? g.si : g.no)}"`).setColor(si ? '#c8ffd4' : '#ffc8c0');
    }));
    this.time.delayedCall(280 + v.voti.length * 500 + 120, () => {
      titolo.setText(ris.titoloFine).setColor(ris.vittoria ? '#7dff9a' : '#ff6b5a').setFontSize(22 * 1.3);
      this.tweens.add({ targets: titolo, scale: { from: 1.6, to: 1 }, duration: 220, ease: 'Back.out' });
      cartelli.forEach((t, i) => this.tweens.add({ targets: t, x: this.giudici[i].x + (i % 2 ? -15 : 15), y: P.lucine + 1, scale: 0.5, duration: 220, ease: 'Quad.out' }));
      if (ris.vittoria) this.festa(); else this.colpa();
    });
    this.time.delayedCall(3900, fine);
  }

  // passato: coriandoli, i due cantanti si abbracciano al centro, il giudice commosso piange a fontana
  festa() {
    const c = this.cfg, P = PROVINO, COL = [0xff5a6a, 0x5ab4ff, 0xffe14a, 0x7dff9a, 0xff9ac4, 0xb06aff];
    Audio.sfx('vittoria'); Audio.sfx('applauso');
    this.tweens.add({ targets: this.buio, fillAlpha: 0, duration: 200 });
    this.time.addEvent({ delay: 45, repeat: 34, callback: () => {
      const r = this.add.rectangle(Math.random() * 480, 100, 3.2, 5, caso(COL)).setAngle(Math.random() * 360).setDepth(940);
      this.tweens.add({ targets: r, y: 280, x: r.x + (Math.random() - 0.5) * 70, angle: r.angle + 500, duration: 1300 + Math.random() * 700, onComplete: () => r.destroy() });
    } });
    this.cantanti.forEach((img, k) => {
      img.setTexture(`${c.cantanti[k]}_gasato`).setDepth(28);
      this.tweens.add({ targets: img, x: P.io + (k ? 34 : -34), duration: 420, ease: 'Quad.out' });
      // (i riflettori li seguono: adesso cantano tutti e due)
      this.tweens.add({ targets: [this.riflettori[k], this.pozze[k]], x: P.io + (k ? 34 : -34), alpha: 1, duration: 420, ease: 'Quad.out' });
      this.tweens.add({ targets: img, y: P.piedi - 9, duration: 180, yoyo: true, repeat: 5, delay: 420 });
    });
    this.io.setTexture(`${this.giocatore.id}_felice`);
    this.tweens.add({ targets: this.io, y: P.ioPiedi - 8, duration: 190, yoyo: true, repeat: 5 });
    const g = this.giudici[3];
    this.time.addEvent({ delay: 40, repeat: 40, callback: () => {
      for (const s of [-1, 1]) {
        const d = this.add.ellipse(g.x + s * 5, 224, 2.6, 4, 0x7fd3ff).setDepth(35);
        this.tweens.add({ targets: d, x: g.x + s * (16 + Math.random() * 14), duration: 560, ease: 'Sine.out' });
        this.tweens.add({ targets: d, y: 206 - Math.random() * 6, duration: 230, ease: 'Quad.out', onComplete: () => this.tweens.add({ targets: d, y: 248, alpha: 0, duration: 330, ease: 'Quad.in', onComplete: () => d.destroy() }) });
      }
    } });
  }

  // bocciati: i cantanti si girano verso chi suonava e gli danno la colpa; si spengono le luci
  colpa() {
    const c = this.cfg, P = PROVINO;
    Audio.sfx('sconfitta'); Audio.sfx('buu');
    this.fasci.setVisible(false);
    for (const o of [...this.riflettori, ...this.pozze]) o.setVisible(false);
    for (const a of this.accendini) a.img.setVisible(false);
    this.tweens.add({ targets: this.buio, fillAlpha: 0.78, duration: 350 });
    this.cantanti.forEach((img, k) => {
      img.setTexture(`${c.cantanti[k]}_indica`).setFlipX(k === 1).setDepth(28);
      this.tweens.add({ targets: img, x: P.cantanti[k] + (k ? -70 : 70), duration: 260, ease: 'Quad.out' });
    });
    this.io.setTexture(`${this.giocatore.id}_triste`);
    this.tweens.add({ targets: this.io, x: P.io + 2, duration: 55, yoyo: true, repeat: 20 });
    this.time.delayedCall(300, () => fumetto(this, P.cantanti[0] + 84, P.piedi - 96, caso(c.frasiColpa), 1300, 962));
  }
}
