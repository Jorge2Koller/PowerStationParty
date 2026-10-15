// Microgioco 17: "Provini a X-Factor" - dai la nota giusta a Tini e Oli. INTONA!
//
//  Il palco di un talent show (inventato): i due cantanti ai lati col microfono, tu al centro alla
//  pianola, davanti i quattro giudici. Sopra il palco c'è il pentagramma: la melodia scorre da
//  destra a sinistra (del colore di chi canta) e tu tieni la nota (il cursore, fisso a sinistra)
//  all'altezza giusta mentre passa. I cantanti cantano la TUA nota: se è giusta la voce è piena,
//  se è sbagliata stona davvero (calante, tremolante, incrinata) e si sente sotto la melodia guida.
//  Si vede anche senza audio: la linea diventa rossa, il cantante ti guarda malissimo, i giudici si
//  tappano le orecchie. Le lucine sul tavolo dicono già come la pensa ogni giudice: alla fine votano.
//  Tre atti: LA STROFA (un cantante alla volta, note lunghe), IL RITORNELLO (si alternano, salti
//  più grandi), L'ACUTO (passaggi veloci e la nota più alta tenuta fino in fondo).
//  La canzone (rock, pop o rap: config.canzoni), la melodia, l'alternanza dei cantanti e le note
//  d'oro escono dal seme del round: uguali per tutti i giocatori. Nel ritornello si sale di un
//  tono. Il tempo è quello della base (Audio.posizione); senza audio si va col proprio orologio.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { PROVINO } from '../grafica/provino.js';
import { txt, im, scritta, stelle, fumetto, lerp, caso, eTouch, vibra, puntatore, puntiHud, numero, quanti } from '../fx.js';

const OTTAVO_120 = 0.25;                              // le durate in configurazione sono in ottavi a 120 bpm (0,25 s)
const PENTA = { x0: 18, x1: 462, cima: 48, salto: 7, cursore: 84 };   // il pentagramma: la riga in cima, quanto dista una nota dall'altra, dove sta il cursore
const ALTA = 6;                                       // la nota più alta (la riga in cima)
const yNota = (p) => PENTA.cima + (ALTA - p) * PENTA.salto;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const clamp = Phaser.Math.Clamp;
const int = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;
const TAGLIA = { cantante: 0.56, io: 0.5, giudice: 0.42 };
const PIEDI_GIUDICI = 263;
const ENTRAMBI = 2;

export class XfactorScene extends MicrogiocoBase {
  constructor() { super('xfactor'); }

  // la base non accelera: la canzone è scritta sul suo tempo (MicrogiocoBase lo chiede a ogni fotogramma)
  tempoMusica() { return 1; }

  prepara() {
    const c = this.cfg, seme = Sessione.seme;
    this.colori = c.cantanti.map((id) => int(CONFIG.personaggiGiocabili.find((p) => p.id === id)?.colore ?? '#ffffff'));
    // la canzone del round (col suo tempo: un passo = un ottavo) e la base che la suona
    this.brano = c.canzoni[Math.floor(casuale((seme ^ 0x51ab1e) >>> 0)() * c.canzoni.length)];
    this.passo = 60 / this.brano.bpm / 2;
    this.note = this.canzone(casuale(seme));
    const sezioni = [0, ...c.atti.slice(1).map((a) => Math.round(a.da / this.passo))];
    Audio.brano({ ...this.brano, sezioni, tono: c.tono, radici: c.armonia.radici, triadi: c.armonia.triadi });
    this.iNota = 0;                 // la nota che sta passando (o la prossima)
    this.pos = 0;                   // dove siamo nella canzone, in ottavi
    this.agganciato = false;        // la base è stata allineata alla partita?
    // (si parte dalla nota più bassa: chi non tocca niente non si trova intonato per caso)
    this.meta = 0;                  // la nota su cui deve andare il cursore
    this.metaF = 0;                 // ...e dove punta il mouse o il dito (anche a metà tra due note)
    this.puntato = false;           // l'ultimo comando è arrivato da mouse o dito (se no dalla tastiera)
    this.cur = 0;                   // dov'è il cursore adesso (scivola verso la meta)
    this.dito = null;
    this.tenuto = { d: 0, t: 0 };
    this.stato = 'attesa';          // 'ok' intonato | 'no' stonato | 'attesa' (pausa, o appena cambiata la nota)
    this.punti = 0; this.serie = 0; this.serieMax = 0; this.livelloSerie = 0; this.ori = 0;
    this.tOk = 0; this.tNo = 0; this.tStonata = 0; this.tAcuto = 0; this.tAcutoOk = 0;
    this.calore = 0;                // quanto è caldo il pubblico (accendini)
    this.tOrecchie = 0; this.tContenti = 0; this.tCuore = 1.5;
    this.facce = [null, null]; this.tStona = [0, 0]; this.male = [false, false];
    this.atto = 0;
    this.inAcuto = false; this.tIo = 0;
    // (la scena viene riusata: quello che si disegna solo quando cambia va riscritto da capo)
    this.hud = null; this.ultimaFaccia = ''; this.statoDisegnato = null; this.lucineDisegnate = null;
    this._verdetto = null;

    this.scena();
    this.pentagramma();
    this.comandi();

    // la melodia guida, piano, nella base: a ogni passo dell'audio, la nota che comincia lì
    const inizi = new Map(this.note.map((n) => [n.da, n]));
    Audio.guida((passo) => {
      const n = this.inCorso ? inizi.get(passo) : null;
      return n ? { midi: c.scala[n.pos] + n.tono + (n.chi === 1 ? c.voci[1].ottava * 12 : 0), passi: n.a - n.da } : null;
    });
    // in pausa le voci tacciono; al rientro la base si riallinea alla partita
    this.suPausa = () => Audio.vociZitte();
    this.suRientro = () => { this.agganciato = false; };
    this.events.on('pause', this.suPausa);
    this.events.on('resume', this.suRientro);
  }

  pulisci() {
    Audio.guida(null);
    Audio.brano(null);
    Audio.vociZitte();
    this.events.off('pause', this.suPausa);
    this.events.off('resume', this.suRientro);
  }

  alRientro() { this.dito = null; this.tenuto = { d: 0, t: 0 }; }

  // quando il microgioco finisce (anche la prova lampo, che non ha il verdetto) i cantanti tacciono
  termina() {
    if (!this.finito) { Audio.guida(null); Audio.vociZitte(); }
    super.termina();
  }

  // ---------- la canzone ----------
  // Le note: { da, a (ottavi), pos (0..6 sul pentagramma), chi (0 Tini, 1 Oli, 2 tutti e due), oro,
  // acuto }. Si scrive tutta all'inizio, dal seme del round.
  canzone(rnd) {
    const c = this.cfg, P = this.passo, k120 = OTTAVO_120 / P, tot = Math.round(this.durata / P), ultimo = c.atti[c.atti.length - 1];
    const attoDi = (n) => c.atti.filter((a) => n * P >= a.da).pop();
    // l'acuto c'è solo se la partita arriva al terzo atto (in Lampo, 15 secondi, no)
    this.conAcuto = this.durata >= ultimo.da + c.acuto.secondi + 1;
    const pAcuto = this.conAcuto ? Math.round(c.acuto.secondi / P) : 0, fine = tot - pAcuto;
    const note = [];
    let n = Math.min(Math.round(c.primoPasso * k120), Math.max(0, fine - 4)), pos = 3, chi = rnd() < 0.5 ? 0 : 1, cambio = -1;
    while (n < fine) {
      const a = attoDi(n), k = c.atti.indexOf(a), finoA = (c.atti[k + 1]?.da ?? this.durata) / P, daA = a.da / P;
      let dur = Math.max(1, Math.round(a.durate[Math.floor(rnd() * a.durate.length)] * k120));
      if (fine - n - dur < 2) dur = fine - n;                 // niente moncherini in fondo
      if (note.length) {
        // la nota dopo: entro "salto" da quella di prima, meglio se è una nota dell'accordo della battuta
        const salto = Math.max(1, Math.round(a.salto)), accordo = c.accordi[this.brano.giro[Math.floor(n / 8) % this.brano.giro.length]], cand = [];
        for (let p = Math.max(0, pos - salto); p <= Math.min(ALTA, pos + salto); p++) if (p !== pos) for (let w = accordo.includes(p) ? 3 : 1; w > 0; w--) cand.push(p);
        pos = cand[Math.floor(rnd() * cand.length)];
        // il cantante cambia ogni tanto: sempre più spesso verso la fine dell'atto
        if (n >= cambio) { if (cambio >= 0) chi = 1 - chi; cambio = n + Math.round(lerp(a.cambio[0], a.cambio[1], clamp((n - daA) / Math.max(1, finoA - daA), 0, 1)) * k120); }
      } else cambio = n + Math.round(a.cambio[0] * k120);
      note.push({ da: n, a: n + dur, pos, chi, oro: dur >= 2 && rnd() < a.oro, tono: c.tono[k] ?? 0 });
      n += dur;
    }
    if (this.conAcuto) {
      // l'acuto: la nota più alta fino alla fine, con qualche tremolo (due ottavi sulla nota sotto)
      const tono = c.tono[c.tono.length - 1] ?? 0, posti = [], scelti = [];
      for (let q = 2; q + 2 <= pAcuto - 5; q += 3) posti.push(q);
      for (let i = Math.min(Math.round(c.acuto.tremoli), posti.length); i > 0; i--) scelti.push(posti.splice(Math.floor(rnd() * posti.length), 1)[0]);
      scelti.sort((x, y) => x - y);
      let p = 0;
      for (const s of scelti) {
        if (s > p) note.push({ da: fine + p, a: fine + s, pos: ALTA, chi: ENTRAMBI, acuto: true, tono });
        note.push({ da: fine + s, a: fine + s + 2, pos: ALTA - 1, chi: ENTRAMBI, acuto: true, tono });
        p = s + 2;
      }
      note.push({ da: fine + p, a: tot, pos: ALTA, chi: ENTRAMBI, acuto: true, tono });
      this.inizioAcuto = fine;
    }
    // l'attimo di grazia di ogni nota (per arrivarci senza che conti come stonatura): più lungo
    // se il salto dalla nota di prima è grande
    note.forEach((x, i) => Object.assign(x, { ok: 0, err: 0, punti: 0, chiusa: false, grazia: c.grazia + c.graziaSalto * Math.max(0, Math.abs(x.pos - (note[i - 1]?.pos ?? 0)) - 1) }));   // (alla prima ci si arriva dal fondo, dove parte il cursore)
    return note;
  }

  // ---------- il palco ----------
  scena() {
    const c = this.cfg, P = PROVINO;
    im(this, 0, 0, 'bgProvino').setOrigin(0);
    this.fasci = this.add.graphics().setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
    this.buio = this.add.rectangle(0, 0, 480, 270, 0x05020c, 0).setOrigin(0).setDepth(15);
    // i due cantanti (Oli, a destra, è girato verso il centro) e chi suona, alla pianola
    this.cantanti = c.cantanti.map((id, k) => im(this, P.cantanti[k], P.piedi, `${id}_palco`, TAGLIA.cantante).setOrigin(0.5, 1).setDepth(20).setFlipX(k === 1));
    this.io = im(this, P.io, P.piedi - 2, `${this.giocatore.id}_normale`, TAGLIA.io).setOrigin(0.5, 1).setDepth(20);
    im(this, P.io, P.piedi - 24, 'pianola').setOrigin(0.5, 0).setDepth(21);
    // il fumo sul pavimento
    for (let i = 0; i < 7; i++) {
      const f = im(this, 30 + i * 70, P.piedi + 6 + (i % 3) * 5, 'fumo', 2.6 + (i % 2)).setDepth(26).setAlpha(0.14 + (i % 3) * 0.04);
      this.tweens.add({ targets: f, x: f.x + (i % 2 ? 50 : -50), duration: 5200 + i * 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    // i giudici al tavolo, con la lucina davanti a ognuno
    this.giudici = c.giudici.map((g, i) => ({ ...g, x: P.giudici[i], img: im(this, P.giudici[i], PIEDI_GIUDICI, `giudice${i}_normale`, TAGLIA.giudice).setOrigin(0.5, 1).setDepth(30), faccia: 'normale', voto: null }));
    im(this, P.banco.x, P.banco.y, 'bancoGiudici').setOrigin(0.5, 0).setDepth(31);
    this.lucine = this.add.graphics().setDepth(32);
    // il pubblico al buio, con gli accendini
    im(this, 0, 247, 'pubblicoProvino').setOrigin(0).setDepth(33);
    this.accendini = [];
    for (let i = 0; i < 18; i++) {
      const x = 14 + i * 26.5 + (i % 3) * 4, a = im(this, x, 268, 'accendino').setOrigin(0.5, 0).setDepth(34).setAlpha(0);
      this.accendini.push({ img: a, x, fase: i * 1.7, soglia: ((i * 7) % 18) / 18 });   // (si accendono in ordine sparso)
    }
    // i punti e la barra degli applausi (si riempie coi punti, con le tacche dei quattro giudici)
    this.barraApplausi = this.add.graphics().setDepth(1001);
    this.etichettaApplausi = txt(this, 148, 22, 'APPLAUSI', { size: 5.5, ox: 1, depth: 1001, color: '#fff3d6' });
    this.testoPunti = txt(this, 474, 36, '', { size: 9, ox: 1, depth: 1001 });
    this.testoSerie = txt(this, PENTA.cursore, 116, '', { size: 7, depth: 105, color: '#ffe14a' });
    if (eTouch()) {
      // sul telefono: dove si trascina (la metà destra, sotto i pulsanti)
      const g = this.add.graphics().setDepth(900);
      g.fillStyle(0xffffff, 0.14); g.fillRoundedRect(463, 132, 11, 62, 5.5);
      g.fillStyle(0xffffff, 0.55); g.fillTriangle(468.5, 136, 465, 142, 472, 142); g.fillTriangle(468.5, 190, 465, 184, 472, 184);
    }
  }

  // il pentagramma: cinque righe vere, la chiave di violino, il bemolle in chiave; la melodia e il
  // cursore si ridisegnano a ogni fotogramma
  pentagramma() {
    const g = this.add.graphics().setDepth(100), w = PENTA.x1 - PENTA.x0;
    g.fillStyle(0x0a0518, 0.8); g.fillRoundedRect(PENTA.x0, PENTA.cima - 8, w, 8 * PENTA.salto + 16, 8);
    g.lineStyle(1, 0x9a7aff, 0.55); g.strokeRoundedRect(PENTA.x0, PENTA.cima - 8, w, 8 * PENTA.salto + 16, 8);
    for (let r = 0; r < 5; r++) { g.lineStyle(1, 0xffffff, r === 4 ? 0.3 : 0.62); g.lineBetween(PENTA.x0 + 5, PENTA.cima + r * 2 * PENTA.salto, PENTA.x1 - 5, PENTA.cima + r * 2 * PENTA.salto); }
    // dove "arriva" la melodia: la colonna del cursore
    g.fillStyle(0xffffff, 0.1); g.fillRect(PENTA.cursore - 5, PENTA.cima - 5, 10, 8 * PENTA.salto + 10);
    const chiave = im(this, PENTA.x0 + 16, PENTA.cima + 4 * PENTA.salto + 1, 'chiaveViolino', 1.18).setDepth(101);
    const bemolle = im(this, PENTA.x0 + 34, yNota(2) - 2.5, 'bemolle', 0.95).setDepth(101);
    this.gMelodia = this.add.graphics().setDepth(102);
    this.cursore = im(this, PENTA.cursore, yNota(this.cur), 'notaCursore', 1).setOrigin(8 / 20, 18 / 24).setDepth(104);
    this.alone = this.add.ellipse(PENTA.cursore, yNota(this.cur), 16, 12, 0xffffff, 0.22).setDepth(103);
    this.penta = [g, chiave, bemolle, this.gMelodia, this.cursore, this.alone];   // (per il verdetto si toglie tutto)
  }

  // ---------- comandi ----------
  comandi() {
    const c = this.cfg;
    // tastiera: SU/GIÙ (o W/S) di una nota alla volta; tenendo premuto si scorre (vedi aggiorna)
    this.tasti = this.input.keyboard.addKeys({ su: 'UP', giu: 'DOWN', w: 'W', s: 'S' });
    this.input.keyboard.on('keydown', (e) => {
      if (e.repeat || !this.inCorso) return;
      const d = e.code === 'ArrowUp' || e.code === 'KeyW' ? 1 : e.code === 'ArrowDown' || e.code === 'KeyS' ? -1 : 0;
      if (d) this.diUnaNota(d);
    });
    // mouse: il cursore segue il mouse in verticale. Dito: si trascina nella metà destra, sotto i
    // pulsanti di pausa e audio, e il cursore si sposta di quanto si muove il dito
    const zona = (w) => w.x >= 240 && w.y >= PENTA.cima - 6;
    this.input.on('pointerdown', (p) => {
      if (!p.wasTouch) return;
      const w = puntatore(this, p);
      if (!this.dito && zona(w)) this.dito = { id: p.id, y0: w.y, v0: this.puntato ? this.metaF : this.meta };
    });
    this.input.on('pointermove', (p) => {
      const w = puntatore(this, p);
      if (p.wasTouch) {
        if (this.dito?.id !== p.id) return;
        this.metaF = clamp(this.dito.v0 + (this.dito.y0 - w.y) / c.ditoPasso, 0, ALTA);
      } else this.metaF = clamp((yNota(0) - w.y) / PENTA.salto, 0, ALTA);
      this.puntato = true;
    });
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => { if (this.dito?.id === p.id) this.dito = null; });
  }

  diUnaNota(d) {
    this.puntato = false;
    this.meta = clamp(Math.round(this.meta) + d, 0, ALTA);
    this.metaF = this.meta;
  }

  // ---------- conti ----------
  get moltiplicatore() { const S = this.cfg.serie; return Math.min(S.max, 1 + Math.floor(this.serie / S.ogni) * S.passo); }
  // quanto sei stato intonato finora (da 0 a 1), sul tempo cantato: è quello che guardano i giudici
  get intonazione() { const t = this.tOk + this.tNo; return t > 0 ? this.tOk / t : 0; }

  // i punti che vuole un giudice per dire SÌ (in Lampo, più corto, in proporzione)
  sogliaGiudice(q) { return q.soglia * this.cfg.medaglie.bronzo * Math.min(1, this.durata / this.cfg.durata); }

  // i voti dei giudici e l'esito (si calcolano una volta sola: il verdetto è quello del risultato)
  verdetto() {
    if (!this._verdetto) {
      const c = this.cfg, acuto = this.conAcuto && this.tAcuto > 0 && this.tAcutoOk / this.tAcuto >= c.acuto.tenuta;
      const punteggio = Math.round(this.punti) + (acuto ? c.bonusAcuto : 0);
      const voti = this.giudici.map((q) => punteggio >= this.sogliaGiudice(q)), si = voti.filter(Boolean).length;
      this._verdetto = { into: this.intonazione, punteggio, voti, si, acuto, vittoria: si >= c.siPerVincere };
    }
    return this._verdetto;
  }

  risultato() {
    const c = this.cfg, v = this.verdetto();
    return {
      punteggio: v.punteggio,
      vittoria: v.vittoria,
      riepilogo: `Intonato al ${Math.round(v.into * 100)}%   SÌ: ${v.si} su ${c.giudici.length}` + (v.acuto ? '   acuto tenuto!' : ''),
      titoli: [c.frasiVittoria[0], c.frasiSconfitta[0]],
    };
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    const c = this.cfg, pos0 = this.pos;
    // il tempo della canzone: il proprio orologio, tenuto agganciato a quello dell'audio quando c'è
    this.pos += dt / this.passo;
    // (col ritardo audio misurato nelle Impostazioni: quello che si sente è un po' indietro rispetto
    // a quello che l'audio sta suonando, e le note vanno a tempo con quello che si sente)
    const rit = Audio.ritardo / this.passo, ap0 = Audio.posizione, ap = ap0 == null ? null : ap0 - rit;
    if (ap != null) {
      // (all'inizio, dopo una pausa o se si sono persi di vista: è la base che si riallinea alla partita)
      if (!this.agganciato || Math.abs(ap - this.pos) > 1.5) { this.agganciato = true; Audio.vaiA(this.pos + rit); }
      else this.pos += (ap - this.pos) * Math.min(1, dt * 3);
    }
    // Il tempo della partita È quello della canzone. L'orologio dei microgiochi salta i fotogrammi
    // lenti (oltre 50 ms) e la pausa, la musica no: prima, con un telefono che rallenta o dopo
    // qualche pausa, la canzone finiva fino a 4 secondi prima della partita e il pentagramma
    // restava vuoto. Così finiscono insieme.
    this.trascorso = Math.max(0, this.pos * this.passo);
    // (e i punti si contano sul tempo della canzone, non su quello dei fotogrammi: se l'audio di un
    // telefono affaticato va più piano, la partita dura di più ma non vale di più)
    const dtc = Math.max(0, Math.min(0.1, (this.pos - pos0) * this.passo));

    // gli atti si annunciano
    const atto = c.atti.filter((a) => this.trascorso >= a.da).length - 1;
    if (atto !== this.atto) {
      this.atto = atto;
      Audio.sfx('bonus');
      scritta(this, 240, 150, c.atti[atto].nome, { size: 15, color: atto === c.atti.length - 1 ? '#ff6b9a' : '#ffe14a', durata: 900, depth: 950 });
    }

    // tastiera, tenendo premuto: si scorre di nota in nota
    const d = (this.tasti.su.isDown || this.tasti.w.isDown ? 1 : 0) - (this.tasti.giu.isDown || this.tasti.s.isDown ? 1 : 0);
    if (d && d === this.tenuto.d) {
      this.tenuto.t -= dt;
      if (this.tenuto.t <= 0) { this.tenuto.t = c.ripeti[1]; this.diUnaNota(d); }
    } else this.tenuto = { d, t: c.ripeti[0] };

    // la nota che sta passando: quelle finite si chiudono (le note d'oro pagano qui)
    while (this.iNota < this.note.length && this.pos >= this.note[this.iNota].a) this.chiudi(this.note[this.iNota++]);
    const n = this.iNota < this.note.length && this.pos >= this.note[this.iNota].da ? this.note[this.iNota] : null;

    // mouse e dito: il cursore si aggancia alla nota più vicina (nessun aiuto verso quella giusta)
    if (this.puntato) this.meta = Math.round(clamp(this.metaF, 0, ALTA));
    // il cursore scivola verso la sua nota: morbido, ma senza inerzia
    this.cur += (this.meta - this.cur) * Math.min(1, dt * c.scivola);
    if (Math.abs(this.meta - this.cur) < 0.02) this.cur = this.meta;

    // intonato, stonato, o appena cambiata la nota (un attimo di grazia per arrivarci)
    const prima = this.stato;
    if (!n) this.stato = 'attesa';
    else if (Math.abs(this.cur - n.pos) <= c.tolleranza) this.stato = 'ok';
    else this.stato = (this.pos - n.da) * this.passo < n.grazia ? 'attesa' : 'no';
    if (this.stato === 'ok') {
      const guadagno = dtc * c.puntiSecondo * this.moltiplicatore;
      this.punti += guadagno; n.punti += guadagno; n.ok += dtc;
      this.tOk += dtc; this.serie += dtc; this.serieMax = Math.max(this.serieMax, this.serie);
      this.tStonata = 0;
      this.calore = Math.min(1, this.calore + dt * 0.11);
      const liv = Math.floor(this.serie / c.serie.ogni);
      if (liv > this.livelloSerie) { this.livelloSerie = liv; this.gasati(); }
    } else if (this.stato === 'no') {
      this.tNo += dtc; n.err += dtc; this.tStonata += dtc;
      this.calore = Math.max(0, this.calore - dt * 0.45);
      if (prima !== 'no') this.stona(n);
    }
    if (n?.acuto && this.stato !== 'attesa') { this.tAcuto += dtc; if (this.stato === 'ok') this.tAcutoOk += dtc; }

    this.canta(n);
    this.reazioni(dt, n);
    this.disegna(n);
  }

  // una nota è finita: se era d'oro e non l'hai mai stonata, vale doppio
  chiudi(n) {
    const c = this.cfg;
    n.chiusa = true;
    if (!n.oro || n.err > 0 || n.ok < ((n.a - n.da) * this.passo - n.grazia) * 0.85) return;
    this.punti += n.punti;
    this.ori++;
    Audio.sfx('ding');
    scritta(this, PENTA.cursore + 26, yNota(n.pos) - 2, `ORO! +${Math.round(n.punti)}`, { size: 7.5, color: '#ffe14a', durata: 380, depth: 960 }).setAngle(0);
    stelle(this, PENTA.cursore, yNota(n.pos), 4, 950);
  }

  // una stonatura (la prima dopo che andava bene): la serie si azzera e se ne accorgono tutti
  stona(n) {
    this.serie = 0; this.livelloSerie = 0;
    this.tOrecchie = 0.85;
    for (const k of n.chi === ENTRAMBI ? [0, 1] : [n.chi]) { this.tStona[k] = 0.4; this.male[k] = true; }
    this.io.setTexture(`${this.giocatore.id}_shock`); this.tIo = 0.5;
    Audio.sfx('buu');
    vibra(30);
  }

  // la serie sale di un gradino: i cantanti si gasano, i giudici annuiscono, cuoricini e accendini
  gasati() {
    const P = PROVINO;
    Audio.sfx(this.livelloSerie >= 4 ? 'applauso' : 'ok');
    scritta(this, PENTA.cursore + 34, 122, `SERIE! x${numero(this.moltiplicatore, 1)}`, { size: 8.5, color: '#7dff9a', durata: 500, depth: 960 }).setAngle(0);
    this.tContenti = 0.9;
    this.calore = Math.min(1, this.calore + 0.2);
    for (const g of this.giudici) this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI + 3, duration: 110, yoyo: true, repeat: 1 });
    this.io.setTexture(`${this.giocatore.id}_felice`); this.tIo = 0.6;
    const da = caso([0, 3]);
    for (let i = 0; i < 2; i++) this.cuore(P.giudici[da] + (i ? 10 : -8), 204 - i * 6, i * 120);
  }

  cuore(x, y, ritardo = 0) {
    const h = im(this, x, y, 'cuore', 0.9).setDepth(40).setAlpha(0);
    this.tweens.add({ targets: h, alpha: { from: 1, to: 0 }, y: y - 30, x: x + (Math.random() - 0.5) * 14, delay: ritardo, duration: 900, onComplete: () => h.destroy() });
  }

  // La voce: chi canta, canta la nota su cui sta il cursore. Giusta: piena, col vibrato sulle note
  // tenute. Sbagliata: calante (sempre di più), col tremolio largo, incrinata. A metà tra due note:
  // un glissato brutto.
  canta(n) {
    const c = this.cfg, S = c.stonata;
    const giu = Math.floor(clamp(this.cur, 0, ALTA)), su = Math.min(ALTA, giu + 1), inMezzo = Math.abs(this.cur - Math.round(this.cur)) > 0.16;
    const base = lerp(c.scala[giu], c.scala[su], this.cur - giu) + (n?.tono ?? 0);
    c.voci.forEach((V, k) => {
      if (!n || !(n.chi === k || n.chi === ENTRAMBI)) return Audio.voce('cantante' + k, null);
      let midi = base + V.ottava * 12, vibrato = 0, vibratoHz = 5.5, crepa = inMezzo ? 0.3 : 0, vol = 1;
      if (this.stato === 'ok') { if (n.ok > c.vibrato.dopo) vibrato = c.vibrato.cent * (n.acuto ? c.vibrato.acuto : 1); }
      else if (this.stato === 'no') {
        midi -= lerp(S.cala[0], S.cala[1], Math.min(1, this.tStonata / S.secondi)) / 100;
        vibrato = S.tremolo; vibratoHz = 8.5; crepa = S.crepa; vol = 0.92;
      }
      Audio.voce('cantante' + k, { tipo: V.tipo, taglio: V.taglio, freq: hz(midi), vol, vibrato, vibratoHz, crepa });
    });
  }

  // le facce di cantanti, giudici e pubblico, secondo come sta andando
  reazioni(dt, n) {
    const c = this.cfg, P = PROVINO, battito = Math.floor(this.pos / 2);
    // i cantanti: chi canta a bocca aperta (gasato se la serie va), chi ha appena stonato ti guarda malissimo
    this.cantanti.forEach((img, k) => {
      const tocca = !!n && (n.chi === k || n.chi === ENTRAMBI);
      if (this.tStona[k] > 0) this.tStona[k] -= dt;
      if (this.male[k] && this.stato === 'ok' && n.ok > 0.35) this.male[k] = false;
      const f = this.tStona[k] > 0 ? 'stona' : this.male[k] ? 'male' : n?.acuto ? 'acuto' : tocca ? (this.serie >= c.serie.ogni && battito % 2 ? 'gasato' : 'canta') : 'palco';
      if (f !== this.facce[k]) { this.facce[k] = f; img.setTexture(`${c.cantanti[k]}_${f}`).setFlipX((k === 1) !== (f === 'male')); }
      // a tempo: chi canta molleggia
      img.y = P.piedi - (tocca && this.stato === 'ok' ? Math.abs(Math.sin(this.pos * Math.PI / 2)) * 3 : 0);
    });
    if (this.tIo > 0) { this.tIo -= dt; if (this.tIo <= 0) this.io.setTexture(`${this.giocatore.id}_normale`); }
    this.io.y = P.piedi - 2 - Math.abs(Math.sin(this.pos * Math.PI / 2)) * 1.5;

    // i giudici: mani sulle orecchie quando stoni, contenti quando la serie sale
    if (this.tOrecchie > 0) this.tOrecchie -= dt;
    if (this.tContenti > 0) this.tContenti -= dt;
    const f = this.tOrecchie > 0 ? 'orecchie' : this.tContenti > 0 ? 'felice' : 'normale';
    if (f !== this.ultimaFaccia) { this.ultimaFaccia = f; this.giudici.forEach((g, i) => g.img.setTexture(`giudice${i}_${f}`)); }
    // ogni tanto un cuoricino, se va bene
    if (this.stato === 'ok' && this.serie > c.serie.ogni) {
      this.tCuore -= dt;
      if (this.tCuore <= 0) { this.tCuore = 1.1 + Math.random() * 1.2; this.cuore(P.giudici[caso([0, 3])] + (Math.random() - 0.5) * 16, 204); }
    }
    // l'acuto: riflettori puntati, tutti in piedi
    const inAcuto = !!n?.acuto;
    if (inAcuto !== this.inAcuto) {
      this.inAcuto = inAcuto;
      if (inAcuto) {
        Audio.sfx('applauso');
        scritta(this, 240, 150, 'TIENILA!', { size: 15, color: '#ffffff', durata: 700, depth: 950 });
        for (const g of this.giudici) this.tweens.add({ targets: g.img, y: PIEDI_GIUDICI - 7, duration: 260, ease: 'Back.out' });
        this.tweens.add({ targets: this.buio, fillAlpha: 0.45, duration: 300 });
      }
    }
    // gli accendini: più il pubblico è caldo, più se ne accendono e più salgono
    const caldo = inAcuto ? 1 : this.calore;
    for (const a of this.accendini) {
      const su = caldo > a.soglia ? 1 : 0;
      a.k = (a.k ?? 0) + (su - (a.k ?? 0)) * Math.min(1, dt * 5);
      a.img.setAlpha(a.k).setPosition(a.x + Math.sin(this.pos * 0.8 + a.fase) * 3 * a.k, 268 - a.k * (15 + caldo * 5));
    }
  }

  // la melodia che scorre, il cursore, le lucine, i fasci di luce, i punti
  disegna(n) {
    // (scorrimento è in unità per ottavo a 120: così la melodia scorre alla stessa velocità con ogni canzone)
    const c = this.cfg, g = this.gMelodia, PX = c.scorrimento * this.passo / OTTAVO_120, X = (passo) => PENTA.cursore + (passo - this.pos) * PX;
    const sx = PENTA.x0 + 44, dx = PENTA.x1 - 4, colore = (x) => (x.chi === ENTRAMBI ? 0xffe14a : this.colori[x.chi]);
    g.clear();
    for (let i = Math.max(0, this.iNota - 6); i < this.note.length; i++) {
      const x = this.note[i], x0 = X(x.da), x1 = X(x.a), y = yNota(x.pos);
      if (x1 < sx) continue;
      if (x0 > dx) break;
      const a0 = Math.max(sx, x0), a1 = Math.min(dx, x1), col = colore(x), ora = x === n;
      // la parte già passata: spenta, rossa dove si è stonato; quella che deve arrivare: accesa
      const meta = clamp(PENTA.cursore, a0, a1);
      if (meta > a0) { g.fillStyle(x.err > 0.05 ? 0xff5a4a : col, x.err > 0.05 ? 0.75 : 0.3); g.fillRoundedRect(a0, y - 2.4, meta - a0, 4.8, 2.4); }
      if (a1 > meta) {
        if (x.oro) { g.fillStyle(0xffe14a, 1); g.fillRoundedRect(meta - 0.8, y - 4, a1 - meta + 1.6, 8, 4); }
        g.fillStyle(0x0a0518, 1); g.fillRoundedRect(meta - 0.2, y - 3.4, a1 - meta + 0.4, 6.8, 3.4);
        g.fillStyle(ora && this.stato === 'no' ? 0xff5a4a : col, 1); g.fillRoundedRect(meta, y - 2.6, a1 - meta, 5.2, 2.6);
      }
      // la linea che la unisce alla nota dopo
      const poi = this.note[i + 1];
      if (poi && x1 > sx && x1 < dx) { g.lineStyle(1.8, colore(poi), x1 < PENTA.cursore ? 0.3 : 0.95); g.lineBetween(x1, y, x1, yNota(poi.pos)); }
      // la stella delle note d'oro
      if (x.oro && x0 > PENTA.cursore - 4 && x0 < dx - 6) {
        const pts = [];
        for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 2 : 4.6; pts.push({ x: x0 + 5 + Math.cos(a) * r, y: y - 8 + Math.sin(a) * r }); }
        g.fillStyle(0xffe14a, 1); g.fillPoints(pts, true); g.lineStyle(0.7, 0x7a5a00, 1); g.strokePoints(pts, true);
      }
    }
    // il cursore: verde se è intonato, rosso (e tremante) se stona
    const yc = yNota(this.cur), stonato = this.stato === 'no';
    this.cursore.setPosition(PENTA.cursore + (stonato ? Math.sin(this.trascorso * 60) * 1.2 : 0), yc);
    this.alone.setPosition(PENTA.cursore, yc);
    if (this.stato !== this.statoDisegnato) {
      this.statoDisegnato = this.stato;
      this.cursore.setTint(this.stato === 'ok' ? 0x9dffb0 : stonato ? 0xff8a7a : 0xffffff);
      this.alone.setFillStyle(this.stato === 'ok' ? 0x7dff9a : stonato ? 0xff5a4a : 0xffffff, this.stato === 'attesa' ? 0.2 : 0.42);
    }

    // i fasci dei fari: girano a tempo; sull'acuto puntano tutti i cantanti
    const f = this.fasci, P = PROVINO;
    f.clear();
    [0x3ae0ff, 0xff4fb8, 0xffe14a, 0x7dff9a, 0xff4fb8, 0x3ae0ff].forEach((col, i) => {
      const x = 60 + i * 72, verso = this.inAcuto ? (i < 3 ? P.cantanti[0] + 30 : P.cantanti[1] - 30) + (i % 3 - 1) * 26 : x + Math.sin(this.pos * 0.4 + i * 1.3) * 90;
      f.fillStyle(col, this.inAcuto ? 0.2 : 0.1); f.fillTriangle(x, 27, verso - 24, P.piedi + 12, verso + 24, P.piedi + 12);
    });

    // le lucine dei giudici: verde quando i tuoi punti passano la sua soglia, rossa se no (quella
    // del produttore lampeggia quando stoni). Spente finché non hai cantato almeno un po'
    const punti = this.punti, acceso = this.tOk + this.tNo > 1;
    const stato = `${this.giudici.map((q) => (punti >= this.sogliaGiudice(q) ? 1 : 0)).join('')}${acceso}${stonato && Math.floor(this.trascorso * 8) % 2}`;
    if (stato !== this.lucineDisegnate) {
      this.lucineDisegnate = stato;
      const l = this.lucine;
      l.clear();
      this.giudici.forEach((q, i) => {
        const si = punti >= this.sogliaGiudice(q), spenta = !acceso || (i === 2 && stonato && Math.floor(this.trascorso * 8) % 2);
        const col = spenta ? 0x3a3350 : i === 2 && stonato ? 0xff3a2e : si ? 0x4ade80 : 0xff5a4a;
        if (!spenta) { l.fillStyle(col, 0.3); l.fillCircle(q.x, P.lucine, 5.5); }
        l.fillStyle(col, 1); l.fillCircle(q.x, P.lucine, 2.8);
        l.lineStyle(0.8, 0x0a0518, 1); l.strokeCircle(q.x, P.lucine, 2.8);
      });
    }

    // punti, serie, barra degli applausi
    const molt = this.moltiplicatore, hud = `${Math.floor(this.punti)}|${molt}|${acceso}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(Math.floor(this.punti)));
      this.testoSerie.setText(molt > 1 ? `x${numero(molt, 1)}` : '');
      const b = this.barraApplausi, x0 = 152, W = 176;
      b.clear();
      b.fillStyle(0x1f1430, 0.9); b.fillRoundedRect(x0 - 2, 17, W + 4, 10, 5);
      // (piena = il giudice più severo e un po' di più; verde da quando i SÌ bastano per passare)
      const soglie = this.giudici.map((q) => this.sogliaGiudice(q)), pieno = Math.max(...soglie) * 1.12;
      const si = soglie.filter((v) => punti >= v).length;
      b.fillStyle(si >= c.siPerVincere ? 0x4ade80 : si ? 0xfacc15 : 0xf87171, 1);
      if (acceso && punti > 0) b.fillRoundedRect(x0, 19, Math.max(6, W * Math.min(1, punti / pieno)), 6, 3);
      for (const v of soglie) { b.fillStyle(0xffffff, 0.9); b.fillRect(x0 + W * (v / pieno) - 0.6, 17.5, 1.2, 9); }
    }
  }

  // ---------- il verdetto ----------
  // I quattro voti uno dietro l'altro, con un colpo di tamburo ciascuno, poi l'esito. Al massimo
  // quattro secondi; si salta con un tocco, INVIO o SPAZIO.
  finale(ris, fatto) {
    const c = this.cfg, P = PROVINO, v = this.verdetto();
    Audio.guida(null);
    Audio.vociZitte();
    for (const o of [...this.penta, this.testoSerie, this.testoPunti, this.barraApplausi, this.etichettaApplausi]) o.setVisible(false);
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
    // i voti
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
    // l'esito
    this.time.delayedCall(280 + v.voti.length * 500 + 120, () => {
      titolo.setText(ris.titoloFine).setColor(ris.vittoria ? '#7dff9a' : '#ff6b5a').setFontSize(22 * 1.3);
      this.tweens.add({ targets: titolo, scale: { from: 1.6, to: 1 }, duration: 220, ease: 'Back.out' });
      // i voti si fanno piccoli e vanno sul tavolo, davanti a chi li ha dati: il palco resta libero
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
      img.setTexture(`${c.cantanti[k]}_gasato`);
      this.tweens.add({ targets: img, x: P.io + (k ? 58 : -58), duration: 420, ease: 'Quad.out' });
      this.tweens.add({ targets: img, y: P.piedi - 9, duration: 180, yoyo: true, repeat: 5, delay: 420 });
    });
    this.io.setTexture(`${this.giocatore.id}_felice`);
    this.tweens.add({ targets: this.io, y: P.piedi - 12, duration: 190, yoyo: true, repeat: 5 });
    // la fontana di lacrime del commosso
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
