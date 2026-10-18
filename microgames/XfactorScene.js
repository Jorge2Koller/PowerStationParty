// Microgioco 17: "Provini a X-Factor" - suona "Cambiare Aria" del Tini e dell'Oli sui pad. SUONA!
//
//  Il palco di un talent show (inventato): i due cantanti ai lati col microfono, che cantano a
//  tempo; al centro, dietro la console coi 4 pad luminosi, chi gioca fa la base. La canzone è vera
//  (un ritaglio di 35 secondi, 15 in Lampo): le note scendono verso i pad, a tempo coi battiti e gli
//  attacchi della canzone (la mappa è in xfactor-mappa.json, una per livello: la fa
//  strumenti/beatmap.py). Si colpiscono quando toccano il pad: PERFETTO, BUONO, MANCATO; le note
//  lunghe si tengono finché finisce la scia.
//  L'errore si sente sulla canzone: a ogni nota mancata si ovatta e il disco graffia; con 3 errori
//  di fila resta ovattata e rallenta, finché non si torna a prendere le note. Davanti, i quattro
//  giudici (inventati): le lucine dicono già come la pensano, e alla fine votano la precisione.
//  Tre atti, allineati alla canzone: LA STROFA (il crescendo), IL PEZZO FORTE!, IL GRAN FINALE!.
//  Il tempo è quello della canzone (l'orologio dell'audio, meno la latenza e il ritardo audio delle
//  Impostazioni); senza audio si va col proprio orologio. La canzone è la stessa per tutti: nella
//  sfida, a pari livello, tutti suonano la stessa mappa.
//  Il ritaglio si carica e si decodifica quando parte il microgioco e si butta quando finisce.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { PROVINO } from '../grafica/provino.js';
import { txt, im, scritta, stelle, fumetto, caso, vibra, multiTouch, puntatore, puntiHud, numero } from '../fx.js';

const TAGLIA = { cantante: 0.56, io: 0.48, giudice: 0.42 };
const PIEDI_GIUDICI = 263;
// i pad sulla console (in fila, da sinistra) e da dove scendono le note
const PAD = { y: 201, w: 30, h: 12, passo: 36, cima: 36 };
const xPad = (k) => 240 + (k - 1.5) * PAD.passo;
const COLORI = [0xff4fb8, 0x3ae0ff, 0xffe14a, 0x7dff9a];
const CODICI = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
const ESITI = { perfetto: ['PERFETTO!', '#7dff9a'], buono: ['BUONO', '#ffe14a'], mancato: ['MANCATO', '#ff6b5a'], vuoto: ['A VUOTO', '#ff9a8a'], mollata: ['MOLLATA!', '#ff9a8a'], tenuta: ['TENUTA!', '#7dff9a'] };
let MAPPA = null;   // la mappa delle note: si scarica la prima volta e resta (è piccola, 5 KB)

export class XfactorScene extends MicrogiocoBase {
  constructor() { super('xfactor'); }

  // la musichetta non accelera (suona la canzone vera)
  tempoMusica() { return 1; }

  prepara() {
    this.lampo = Sessione.tipo === 'lampo';
    this.pronto = false;
    // (la scena si riusa da un turno all'altro: si riparte da zero)
    this.song = null; this._verdetto = null; this.fuoriTempo = false; this.atti = null; this.battiti = null;
    this.note = []; this.iProssima = 0;
    this.pos = 0;                   // dove siamo nella canzone (secondi): quello che si sente
    this.punti = 0; this.serie = 0; this.serieMax = 0;
    this.perfetti = 0; this.buoni = 0; this.mancati = 0; this.mancatiFila = 0; this.lunghe = 0;
    this.premuti = [false, false, false, false];
    this.accesi = [0, 0, 0, 0];     // quanto brilla ogni pad (si spegne piano)
    this.dita = new Map();          // dito (o mouse) -> pad
    this.ovattata = false;
    this.nAtto = -1; this.nBattito = -1;
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
    this.attesa = txt(this, 240, 118, 'SI ACCENDONO LE LUCI...', { size: 12, color: '#ffe14a', depth: 1000 });
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
    // senza mappa (non si è potuta scaricare): una nota ogni due battiti, sui quattro pad in giro
    if (!R) {
      const b = 60 / 129.2;
      R = { atti: this.lampo ? [null, 0, 11.7] : [0, 12.19, 23.89], battiti: [], forti: [], mappe: {} };
      for (let t = 0; t < this.durata; t += b) { R.battiti.push(t); R.forti.push(R.battiti.length % 4 === 1 ? 1 : 0); }
      R.mappe.normale = R.battiti.filter((t, i) => t > 1.3 && i % 2 === 0).map((t, i) => [t, i % 4, 0]);
    }
    this.ritaglio = R;
    const mappa = (R.mappe[this.livello] ?? R.mappe.normale).filter((n) => n[0] < fine);
    this.note = mappa.map(([t, pad, dur]) => ({ t: t + off, pad, dur: Math.min(dur, fine - t), esito: null, tenuta: false }));
    // a FACILE le note sono meno e valgono di più (e a DIFFICILE il contrario): in tutto, i punti di NORMALE
    const rif = (R.mappe.normale ?? mappa).filter((n) => n[0] < fine).length;
    this.fattore = rif / Math.max(1, this.note.length);
    // ...e anche la serie: con meno note il moltiplicatore arriva prima (10 di fila a NORMALE sono 5 a FACILE)
    this.soglieSerie = c.serie.map(([n, k]) => [Math.max(3, Math.round(n / this.fattore)), k]);
    this.atti = R.atti;
    this.battiti = R.battiti.map((t) => t + off);
    this.forti = R.forti;
    this.attesa.destroy();
    this.song = Audio.canzone(buffer);
    this.song?.avvia(0);
    this.pronto = true;
  }

  // Il tempo del microgioco non parte finché la canzone non è pronta; poi è quello della canzone.
  update(ora, delta) {
    if (!this.pronto) return;
    super.update(ora, delta);
  }

  // ---------- il palco ----------
  scena() {
    const c = this.cfg, P = PROVINO;
    im(this, 0, 0, 'bgProvino').setOrigin(0);
    this.fasci = this.add.graphics().setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
    this.buio = this.add.rectangle(0, 0, 480, 270, 0x05020c, 0).setOrigin(0).setDepth(15);
    // i due cantanti (Oli, a destra, è girato verso il centro) e chi suona, dietro la console
    this.cantanti = c.cantanti.map((id, k) => im(this, P.cantanti[k], P.piedi, `${id}_palco`, TAGLIA.cantante).setOrigin(0.5, 1).setDepth(20).setFlipX(k === 1));
    this.faccia = [0, 0];           // fino a quando un cantante tiene la faccia di una reazione
    this.io = im(this, P.io, P.piedi + 4, `${this.giocatore.id}_normale`, TAGLIA.io).setOrigin(0.5, 1).setDepth(19);
    // il fumo sul pavimento
    for (let i = 0; i < 7; i++) {
      const f = im(this, 30 + i * 70, P.piedi + 6 + (i % 3) * 5, 'fumo', 2.6 + (i % 2)).setDepth(26).setAlpha(0.14 + (i % 3) * 0.04);
      this.tweens.add({ targets: f, x: f.x + (i % 2 ? 50 : -50), duration: 5200 + i * 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    // la console coi pad (disegnata), le corsie delle note, le note
    this.gCorsie = this.add.graphics().setDepth(22);
    this.disegnaCorsie();
    this.gConsole = this.add.graphics().setDepth(24);
    this.disegnaConsole();
    this.gPad = this.add.graphics().setDepth(25);
    this.gNote = this.add.graphics().setDepth(30.5);   // (davanti alle teste dei giudici, dietro al tavolo)
    this.esiti = [0, 1, 2, 3].map((k) => txt(this, xPad(k), PAD.y - 18, '', { size: 7, depth: 40 }).setAlpha(0));
    this.testoSerie = txt(this, 240, PAD.y + 22, '', { size: 8, color: '#ffe14a', depth: 40 });
    // i giudici al tavolo, con la lucina davanti a ognuno, e il NO del produttore
    this.giudici = c.giudici.map((g, i) => ({ ...g, x: P.giudici[i], img: im(this, P.giudici[i], PIEDI_GIUDICI, `giudice${i}_normale`, TAGLIA.giudice).setOrigin(0.5, 1).setDepth(30), voto: null }));
    im(this, P.banco.x, P.banco.y, 'bancoGiudici').setOrigin(0.5, 0).setDepth(31);
    this.lucine = this.add.graphics().setDepth(32);
    this.lucineDi = null;
    this.no = this.add.container(P.giudici[2] + 22, P.lucine, [this.add.graphics(), txt(this, 0, 0.5, 'NO', { size: 7, color: '#ffe1dc', thick: 0 })]).setDepth(33);
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

  disegnaCorsie() {
    const g = this.gCorsie;
    g.clear();
    for (let k = 0; k < 4; k++) {
      const x = xPad(k);
      g.fillStyle(0x0a0518, 0.34); g.fillRect(x - PAD.w / 2, PAD.cima - 6, PAD.w, PAD.y - PAD.cima + 6);
      g.lineStyle(1, COLORI[k], 0.22); g.lineBetween(x, PAD.cima - 6, x, PAD.y - 8);
    }
  }

  disegnaConsole() {
    const g = this.gConsole, x0 = xPad(0) - PAD.w / 2 - 10, x1 = xPad(3) + PAD.w / 2 + 10;
    g.clear();
    g.fillStyle(0x000000, 0.3); g.fillRoundedRect(x0 + 2, PAD.y - 9, x1 - x0, 30, 6);
    g.fillStyle(0x2b2f3d, 1); g.fillRoundedRect(x0, PAD.y - 11, x1 - x0, 30, 6);
    g.fillStyle(0x3d4254, 1); g.fillRoundedRect(x0 + 2, PAD.y - 9, x1 - x0 - 4, 7, 4);
    g.lineStyle(1.5, 0x12141c, 1); g.strokeRoundedRect(x0, PAD.y - 11, x1 - x0, 30, 6);
    // le manopole e i led della console (finti)
    for (let i = 0; i < 6; i++) { g.fillStyle(0x12141c, 1); g.fillCircle(x0 + 12 + i * 24, PAD.y + 13, 2.4); g.fillStyle([0x7dff9a, 0xffe14a, 0xff6b5a][i % 3], 0.9); g.fillCircle(x0 + 20 + i * 24, PAD.y + 13, 1.2); }
  }

  disegnaNo(acceso) {
    const g = this.no.list[0];
    g.clear();
    g.fillStyle(acceso ? 0xff2a2a : 0x6a1a1a, 1); g.fillRoundedRect(-9, -5, 18, 10, 3);
    g.lineStyle(1, 0x2b1b17, 1); g.strokeRoundedRect(-9, -5, 18, 10, 3);
    if (acceso) { g.fillStyle(0xff4a3a, 0.35); g.fillCircle(0, 0, 13); }
    this.no.list[1].setAlpha(acceso ? 1 : 0.5);
  }

  // ---------- i comandi ----------
  comandi() {
    const quando = (ts) => {
      // (il momento vero del tasto, non quello del fotogramma: conta anche per i millesimi)
      const ora = this.song?.suona ? this.song.posizione : this.pos;
      return ora - Math.max(0, (performance.now() - (ts ?? performance.now())) / 1000);
    };
    this.input.keyboard.on('keydown', (e) => {
      const k = CODICI[e.code];
      if (k == null || e.repeat) return;
      e.preventDefault?.();
      this.premi(k, quando(e.timeStamp));
    });
    this.input.keyboard.on('keyup', (e) => { const k = CODICI[e.code]; if (k != null) this.rilascia(k); });
    // dito e mouse: si tocca il pad, o la sua corsia nella metà bassa (più dita insieme)
    multiTouch(this, 4);
    const corsia = (p) => {
      const w = puntatore(this, p);
      if (w.y < 110) return null;
      const k = Math.round((w.x - xPad(0)) / PAD.passo);
      return k >= 0 && k <= 3 && Math.abs(w.x - xPad(k)) <= PAD.passo / 2 + 8 ? k : null;
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
    if (!this.inCorso || !this.pronto) return;
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
    // una nota lunga lasciata prima della fine della scia
    for (const n of this.note) {
      if (!n.tenuta || n.pad !== k) continue;
      n.tenuta = false;
      if (!pausa && this.pos < n.t + n.dur - this.cfg.finestre.buono) { this.mostra(k, 'mollata'); this.serie = 0; this.hud(); }
      else this.finitaLunga(n);
    }
  }

  colpita(n, esito) {
    const c = this.cfg;
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
    if (this.soglieSerie?.some(([n]) => n === this.serie)) { scritta(this, 392, 112, `${this.serie} DI FILA!`, { size: 10, color: '#ffe14a', durata: 500 }); stelle(this, 392, 112, 6, 960); }
    // i cantanti si gasano, i giudici annuiscono
    if (this.serie >= 5 && this.serie % 5 === 0) this.reagisci('gasato', 0.5);
    for (const g of this.giudici) if (g.precisa && Math.random() < 0.3) this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI + 2, duration: 90, yoyo: true });
    this.hud();
  }

  finitaLunga(n) {
    if (n.chiusa) return;
    n.chiusa = true;
    this.punti += this.cfg.punti.lunga * this.molt() * this.fattore;
    this.lunghe++;
    this.mostra(n.pad, 'tenuta');
    this.hud();
  }

  mancata(n) {
    const c = this.cfg, E = c.errori;
    n.esito = 'mancato';
    this.mancati++; this.mancatiFila++;
    this.serie = 0;
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
    t.setText(s).setColor(col).setAlpha(1).setY(PAD.y - 18).setScale(esito === 'perfetto' ? 1.15 : 1);
    this.tweens.add({ targets: t, y: PAD.y - 30, alpha: 0, duration: 520, delay: 120 });
  }

  get precisione() {
    const fatte = this.perfetti + this.buoni + this.mancati;
    return fatte ? (this.perfetti + this.cfg.pesoBuono * this.buoni) / fatte : 0;
  }

  hud() {
    this.testoPunti.setText(puntiHud(this.punti));
    const m = this.molt();
    this.testoSerie.setText(this.serie >= 3 ? `SERIE ${this.serie}${m > 1 ? `  x${numero(m, m % 1 ? 1 : 0)}` : ''}` : '');
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
        // (sopra le corsie, in alto: non deve coprire le note che scendono)
        scritta(this, 240, 27, c.atti[atto].nome, { size: 13, color: atto === 2 ? '#ff6b5a' : '#ffe14a', durata: 900, depth: 950 });
      }
      // (in piedi di poco: le teste non devono arrivare a metà dei pad, dove si colpisce)
      if (c.atti[atto].inPiedi) for (const g of this.giudici) this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI - 4, duration: 300, ease: 'Back.out' });
    }
    this.battito();
    this.disegna(dt);
  }

  // i cantanti cantano a tempo: a ogni battito aprono la bocca e molleggiano (di più sui battiti forti)
  battito() {
    if (!this.battiti) return;
    let b = this.nBattito;
    while (b + 1 < this.battiti.length && this.pos >= this.battiti[b + 1]) b++;
    if (b === this.nBattito) return;
    this.nBattito = b;
    const c = this.cfg, forte = this.forti[b];
    this.cantanti.forEach((img, k) => {
      if (this.pos < this.faccia[k]) return;
      const tocca = this.nAtto === 0 ? b % 4 < 2 === (k === 0) : true;     // nella strofa cantano a turno
      img.setTexture(`${c.cantanti[k]}_${tocca ? (this.nAtto === 2 && forte ? 'acuto' : 'canta') : 'palco'}`).setFlipX(k === 1);
      const sy = img.scaleY, k0 = forte ? 0.94 : 0.97;
      this.tweens.add({ targets: img, scaleY: { from: sy * k0, to: sy }, duration: 180, ease: 'Quad.out' });
    });
    this.tweens.add({ targets: this.io, y: { from: PROVINO.piedi + 6, to: PROVINO.piedi + 4 }, duration: 160 });
  }

  disegna(dt) {
    const c = this.cfg, P = PROVINO, A = c.atti[this.nAtto] ?? c.atti[0], v = this.pos;
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
    // i pad: accesi del colore della nota quando li colpisci, e un po' quando li premi
    const p = this.gPad;
    p.clear();
    for (let k = 0; k < 4; k++) {
      this.accesi[k] = Math.max(this.premuti[k] ? 0.35 : 0, this.accesi[k] - dt * 3);
      const x = xPad(k) - PAD.w / 2, a = this.accesi[k];
      p.fillStyle(COLORI[k], 0.25 + a * 0.75); p.fillRoundedRect(x, PAD.y - PAD.h / 2, PAD.w, PAD.h, 3);
      p.lineStyle(1.5, COLORI[k], 1); p.strokeRoundedRect(x, PAD.y - PAD.h / 2, PAD.w, PAD.h, 3);
      if (a > 0.5) { p.fillStyle(COLORI[k], (a - 0.5) * 0.5); p.fillCircle(xPad(k), PAD.y, 18 + a * 6); }
    }
    // le note: cerchi che scendono verso il loro pad; quelle lunghe con la scia
    const n = this.gNote, vel = (PAD.y - PAD.cima) / c.anticipo;
    n.clear();
    for (let i = this.iProssima; i < this.note.length; i++) {
      const q = this.note[i];
      if (q.t - v > c.anticipo) break;
      if (q.esito && !q.tenuta && q.esito !== 'mancato') continue;
      const x = xPad(q.pad), yT = Math.min(PAD.y, PAD.y - (q.t - v) * vel), col = COLORI[q.pad];
      if (q.dur > 0) {
        const yF = PAD.y - (q.t + q.dur - v) * vel;
        if (yF < PAD.y) { n.fillStyle(col, q.esito === 'mancato' ? 0.18 : q.tenuta ? 0.75 : 0.5); n.fillRect(x - 4.5, Math.max(PAD.cima - 6, yF), 9, Math.min(PAD.y, q.tenuta ? PAD.y : yT) - Math.max(PAD.cima - 6, yF)); }
      }
      // (la mancata, grigia, affonda appena nel pad e sparisce: sotto ci sono le facce dei giudici)
      if (q.esito === 'mancato') { const yM = PAD.y - (q.t - v) * vel; if (yM < PAD.y + 6) { n.fillStyle(0x5a5470, 0.6); n.fillCircle(x, yM, 7); } continue; }
      if (q.tenuta) continue;
      const y = PAD.y - (q.t - v) * vel;
      if (y < PAD.cima - 8) continue;
      n.fillStyle(0x12101a, 0.9); n.fillCircle(x, y, 9.5);
      n.fillStyle(col, 1); n.fillCircle(x, y, 8);
      n.fillStyle(0xffffff, 0.75); n.fillCircle(x - 2.5, y - 2.5, 2.4);
    }
    // gli accendini: più è lunga la serie, più se ne alzano
    const quanti = Math.min(1, this.serie / 25);
    for (const a of this.accendini) {
      const su = quanti > a.soglia, al = a.img.alpha + ((su ? 1 : 0) - a.img.alpha) * Math.min(1, dt * 4);
      a.img.setAlpha(al).setY(268 - al * 16 + Math.sin(v * 2 + a.fase) * 1.2).setAngle(Math.sin(v * 1.6 + a.fase) * 8);
    }
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
    for (const o of [this.gNote, this.gPad, this.gCorsie, this.testoSerie, this.testoPunti, this.testoPrecisione, this.no, ...this.esiti]) o.setVisible(false);
    this.tweens.killTweensOf(this.buio);
    this.tweens.add({ targets: this.buio, fillAlpha: 0.5, duration: 250 });
    this.cantanti.forEach((img, k) => img.setTexture(`${c.cantanti[k]}_palco`).setFlipX(k === 1).setY(P.piedi));
    this.giudici.forEach((g, i) => { g.img.setTexture(`giudice${i}_normale`); this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI, duration: 200 }); });
    let chiuso = false;
    const fine = () => { if (chiuso) return; chiuso = true; fatto(); };
    this.time.delayedCall(350, () => {
      for (const k of ['ENTER', 'SPACE']) this.input.keyboard.once('keydown-' + k, fine);
      this.input.once('pointerdown', fine);
    });
    const titolo = txt(this, 240, 72, 'IL VERDETTO...', { size: 16, color: '#ffe14a', depth: 960 });
    const frase = txt(this, 240, 100, '', { size: 8, color: '#ffffff', depth: 960, wrap: 380 });
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
      cartelli.forEach((t, i) => this.tweens.add({ targets: t, x: this.giudici[i].x + 15, y: P.lucine + 1, scale: 0.5, duration: 220, ease: 'Quad.out' }));
      if (ris.vittoria) this.festa(); else this.colpa();
    });
    this.time.delayedCall(3900, fine);
  }

  // passato: coriandoli, i due cantanti si abbracciano, il giudice commosso piange a fontana
  festa() {
    const c = this.cfg, P = PROVINO, COL = [0xff5a6a, 0x5ab4ff, 0xffe14a, 0x7dff9a, 0xff9ac4, 0xb06aff];
    Audio.sfx('vittoria'); Audio.sfx('applauso');
    this.tweens.add({ targets: this.buio, fillAlpha: 0, duration: 200 });
    this.time.addEvent({ delay: 45, repeat: 34, callback: () => {
      const r = this.add.rectangle(Math.random() * 480, 100, 3.2, 5, caso(COL)).setAngle(Math.random() * 360).setDepth(940);
      this.tweens.add({ targets: r, y: 280, x: r.x + (Math.random() - 0.5) * 70, angle: r.angle + 500, duration: 1300 + Math.random() * 700, onComplete: () => r.destroy() });
    } });
    this.cantanti.forEach((img, k) => {
      img.setTexture(`${c.cantanti[k]}_gasato`).setDepth(28);   // (davanti alla console)
      this.tweens.add({ targets: img, x: P.io + (k ? 58 : -58), duration: 420, ease: 'Quad.out' });
      this.tweens.add({ targets: img, y: P.piedi - 9, duration: 180, yoyo: true, repeat: 5, delay: 420 });
    });
    this.io.setTexture(`${this.giocatore.id}_felice`);
    this.tweens.add({ targets: this.io, y: P.piedi - 8, duration: 190, yoyo: true, repeat: 5 });
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
    for (const a of this.accendini) a.img.setVisible(false);
    this.tweens.add({ targets: this.buio, fillAlpha: 0.78, duration: 350 });
    this.cantanti.forEach((img, k) => {
      img.setTexture(`${c.cantanti[k]}_indica`).setFlipX(k === 1);
      this.tweens.add({ targets: img, x: P.cantanti[k] + (k ? -60 : 60), duration: 260, ease: 'Quad.out' });
    });
    this.io.setTexture(`${this.giocatore.id}_triste`);
    this.tweens.add({ targets: this.io, x: P.io + 2, duration: 55, yoyo: true, repeat: 20 });
    this.time.delayedCall(300, () => fumetto(this, P.cantanti[0] + 78, P.piedi - 96, caso(c.frasiColpa), 1300, 962));
  }
}
