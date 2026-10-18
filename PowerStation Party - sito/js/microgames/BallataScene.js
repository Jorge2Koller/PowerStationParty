// Microgioco 19: "La ballata del Pallaio" - rimetti a posto le vignette del cantastorie. RIORDINA!
//
//  Lori, il cantastorie del gruppo, canta le leggende della compagnia del Pallaio davanti a un
//  cartellone a vignette (due righe da 4), battendo con la bacchetta su ogni scena. Chi gioca è il
//  suo garzone, che le ha appese alla rinfusa: Lori canta senza fermarsi, e le vignette vanno rimesse
//  a posto prima che la bacchetta ci arrivi sopra.
//  - LA STROFA: sopra Lori il fumetto con la scena che sta cantando; la casella dove cadrà la
//    bacchetta si illumina, con l'arco tratteggiato e il cerchio che si stringe. La bacchetta cade
//    sul tempo della musica (sulla battuta forte), ogni strofa su una casella diversa, che si scopre
//    solo quando si illumina (la sceglie il seme): conoscere la storia aiuta a riconoscere la scena,
//    ma il cartellone non si può sistemare in anticipo.
//  - IL GESTO: si trascina una vignetta su un'altra casella e le due si scambiano (o si clicca la
//    vignetta e poi la casella; da tastiera FRECCE, SPAZIO prende e SPAZIO lascia).
//  - IL COLPO: vignetta giusta, TOC, OOOH e monete nel cappello (la serie aumenta i punti);
//    sbagliata, Lori canta quello che c'è nella casella ("...le chiavi nel bicchiere?!"), il pubblico
//    ride, volano i pomodori e lui si gira a fulminare il garzone. Una vignetta battuta resta lì.
//  Tre atti: la riga in alto (quella in basso è sotto il telo); il vento (il telo vola via a metà,
//  le folate girano una vignetta, da toccare per rigirarla, o ne scambiano due già sistemate, e la
//  bacchetta fa qualche finta); il gran finale (tutte e 8, Lori accelera, due colpi ravvicinati e la
//  morale: tutte giuste, il cartellone si illumina e c'è il bonus).
//  La ballata, le caselle delle strofe, la disposizione iniziale (nessuna vignetta parte al posto
//  giusto), le folate e le finte escono dal seme del round. Il tempo è quello della musica (Audio.posizione), come negli
//  Scapoli; senza audio si va col proprio orologio.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { CONFIG } from '../config.js';
import { casuale, assicura, liberaGruppi, gruppiDi } from '../grafica/base.js';
import { PIAZZA as P, centroCella, vignetta, texDellaVignetta } from '../grafica/piazzetta.js';
import { txt, im, scalaDi, scritta, stelle, fumetto, scuoti, puntatore, colpetto, caso, vibra, puntiHud, numero, lerp } from '../fx.js';

const TAGLIA_LORI = 0.78;
const TAGLIA = 0.36;               // il pubblico seduto ai tavolini
const OTTAVO = 0.25;               // un ottavo, a 120 battiti al minuto (la musica 'ballata')
const LEGNO = 0xc8935a, CONT = 0x2b1b17, GIALLO = 0xffe14a;
// la mano destra di Lori (quella della bacchetta) rispetto ai piedi, posa per posa
const MANO = { lori_alza: [29, -61], lori_batte: [34, -36] };
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

export class BallataScene extends MicrogiocoBase {
  constructor() { super('ballata'); }

  // la musica: normale, poi nel terzo atto Lori accelera (MicrogiocoBase la usa)
  tempoMusica() { return this.pos >= this.pos3 ? this.cfg.tempoFinale : 1; }
  durPasso() { return OTTAVO / this.tempoMusica(); }
  // a che secondo arriva un punto della canzone (in ottavi)
  secondoDi(pos) { return pos <= this.pos3 ? pos * OTTAVO : this.pos3 * OTTAVO + ((pos - this.pos3) * OTTAVO) / this.cfg.tempoFinale; }
  attoA(t) { return this.cfg.atti.filter((a) => t >= a.da).pop(); }
  caselleA(t) { return this.corta ? this.n : Math.min(this.n, this.attoA(t).caselle); }
  get atto() { return this.attoA(this.trascorso); }
  // (in Lampo, più corto, l'obiettivo è in proporzione)
  get obiettivo() { return this.corta ? Math.max(1, Math.round((this.cfg.obiettivoStrofe * this.n) / this.cfg.colpi.length)) : this.cfg.obiettivoStrofe; }

  prepara() {
    const c = this.cfg, seme = Sessione.seme;
    this.rnd = casuale(seme);
    this.rFolate = casuale((seme ^ 0x5eed01) >>> 0);
    this.rFinte = casuale((seme ^ 0x0f17a5) >>> 0);
    const rPubblico = casuale((seme ^ 0x9ab1c0) >>> 0);
    // la ballata del round; in Lampo si accorcia (solo la riga in alto: tre strofe e la morale)
    this.corta = Sessione.tipo === 'lampo';
    this.ballata = c.ballate[Math.floor(this.rnd() * c.ballate.length)];
    this.sequenza = this.corta ? [...c.strofeLampo] : this.ballata.strofe.map((_s, i) => i);
    this.colpi = this.corta ? [...c.colpiLampo] : [...c.colpi];
    this.n = this.sequenza.length;
    this.pos3 = c.atti[c.atti.length - 1].da / OTTAVO;
    this.strofa = (k) => this.ballata.strofe[this.sequenza[k]];
    this.punti = 0; this.giuste = 0; this.serie = 0; this.serieMax = 0;
    this.pos = 0; this.offsetAudio = null;
    this.h = 0;                       // la prossima strofa
    this.armata = -1;                 // la strofa per cui la bacchetta è alzata
    this.bersaglio = null;            // la casella illuminata (durante una finta, quella sbagliata)
    this.finta = false;
    this.fase = 'posata';             // la bacchetta: 'posata' | 'alzata' | 'battuta'
    this.tBattuta = 0;
    this.selezione = null;            // la vignetta presa (clic, o SPAZIO da tastiera)
    this.trascina = null;
    this.cur = 0; this.tastiera = false;
    this.canta = false; this.crepa = 0; this.tZitto = 0;
    this.fineCanzone = null;
    this.prossimaFolata = null;
    this.nAtto = 0;

    // --- la piazzetta, il cartellone, le vignette ---
    im(this, 0, 0, 'bgPiazzetta').setOrigin(0).setDepth(0);
    this.cartellone = im(this, P.cornice.x, P.cornice.y, 'cartellone').setOrigin(0).setDepth(10);
    // le vignette si disegnano con le immagini degli altri microgiochi: si creano i loro gruppi, e
    // finite le vignette si buttano (vedi gruppoPigro)
    const altri = gruppiDi(this.sequenza.flatMap((s) => texDellaVignetta(this.ballata.strofe[s].vignetta))).filter((g) => g !== 'piazzetta');
    assicura(this, altri);
    this.sequenza.forEach((s, k) => vignetta(this, `vign_${k}`, this.ballata.strofe[s].vignetta));
    liberaGruppi(this, altri);
    // dove cade la bacchetta a ogni strofa (la casella della strofa k: this.dove[k]), e dove sono
    // appese le vignette all'inizio
    this.dove = this.caselleStrofe(casuale((seme ^ 0x0d0e5a) >>> 0));
    const posto = this.disponi(this.rnd);
    this.celle = [...Array(8).keys()].map((i) => {
      const { x, y } = centroCella(i);
      return { i, x, y, v: null, img: null, girata: false, bloccata: false, esito: null };
    });
    posto.forEach((i, k) => {
      const C = this.celle[i];
      C.v = k;
      C.img = im(this, C.x, C.y, `vign_${k}`).setDepth(20);
    });
    this.scala = this.celle[0].img.scaleX;
    this.gSegni = this.add.graphics().setDepth(22);
    this.gLuce = this.add.graphics().setDepth(25);
    this.gCursore = this.add.graphics().setDepth(27);
    // i teli sulla riga in basso: in Lampo restano, se no il vento li porta via (secondo e terzo atto)
    this.teli = [[4, 5], [6, 7]].map(([a, b]) => {
      const A = this.celle[a], B = this.celle[b];
      return im(this, (A.x + B.x) / 2, A.y + 2, 'teloBallata').setDepth(30);
    });
    this.caselle = this.caselleA(0);
    // la targa col titolo, in cima alla cornice
    // (sopra la bacchetta, che le passa dietro)
    const titolo = txt(this, P.cornice.x + P.cornice.w / 2, P.cornice.y - 1, this.ballata.titolo.toUpperCase(), { size: 7, color: '#ffe9b0', depth: 56 });
    const targa = this.add.graphics().setDepth(55), tw = titolo.width + 6;
    this.targa = [targa, titolo];
    targa.fillStyle(0x5a3418, 1).fillRoundedRect(titolo.x - tw / 2, titolo.y - 7, tw, 14, 4).lineStyle(1.2, 0xe8c060, 1).strokeRoundedRect(titolo.x - tw / 2, titolo.y - 7, tw, 14, 4);
    // la riga del testo, sotto il cartellone
    this.gSotto = this.add.graphics().setDepth(959);
    this.sotto = txt(this, P.cornice.x + P.cornice.w / 2, P.sottotitolo, '', { size: 8, depth: 960, color: '#fff3d6' });

    // --- Lori, la bacchetta, il cappello ---
    this.lori = im(this, P.lori.x, P.lori.y, 'lori_canta', TAGLIA_LORI).setOrigin(0.5, 1).setDepth(40);
    this.posa = 'lori_canta';
    this.cappello = im(this, P.cappello.x, P.cappello.y, 'cappelloMonete').setOrigin(0.5, 1).setDepth(41);
    this.gMonete = this.add.graphics().setDepth(42);
    this.gArco = this.add.graphics().setDepth(49);
    this.gBacchetta = this.add.graphics().setDepth(50);
    this.punta = { x: P.lori.x + 40, y: P.lori.y - 132 };
    // il fumetto della strofa: la scena grande (si capisce senza leggere)
    const F = P.fumetto, gF = this.add.graphics();
    gF.fillStyle(0x1f1430, 1).fillRoundedRect(-45, -42, 90, 84, 9);
    gF.fillTriangle(-4, 40, 10, 40, 6, 58);
    gF.fillStyle(0xffffff, 1).fillRoundedRect(-44, -41, 88, 82, 8);
    gF.fillTriangle(-2.5, 40, 8.5, 40, 6, 55.5);
    this.icona = im(this, 0, 0, 'vign_0');
    this.fumetto = this.add.container(F.x, F.y, [gF, this.icona]).setDepth(900).setVisible(false);

    // --- il pubblico: amici del Pallaio (personaggi giocabili, dal seme) seduti ai tavolini ---
    const io = this.giocatore.id.replace(DOPPIONE, ''), ids = CONFIG.personaggiGiocabili.map((g) => g.id).filter((id) => id !== io && id !== 'lori');
    const pesca = () => ids.splice(Math.floor(rPubblico() * ids.length), 1)[0];
    this.pubblico = [];
    P.tavolini.forEach((T) => {
      T.posti.forEach((dx) => {
        const id = pesca(), x = T.x + dx;
        this.pubblico.push({ id, x, img: im(this, x, P.ySeduti, `${id}_normale`, TAGLIA).setOrigin(0.5, 1).setDepth(60).setFlipX(dx > 0) });
      });
      im(this, T.x, P.yTavolini, 'tavolinoPiazza').setOrigin(0.5, 1).setDepth(61);
    });

    // --- l'HUD ---
    this.testoPunti = txt(this, 474, 36, '', { size: 9, ox: 1, depth: 1001 });
    this.testoStrofe = txt(this, 474, 49, '', { size: 7, ox: 1, depth: 1001, color: '#ffe14a' });
    this.testoSerie = txt(this, 474, 60, '', { size: 7, ox: 1, depth: 1001, color: '#ff9ad8' });
    this.hud = '';

    // --- i comandi ---
    this.input.on('pointerdown', (p) => this.giu(p));
    this.input.on('pointermove', (p) => this.muovi(p));
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => this.su(p));
    const k = this.input.keyboard;
    k.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    k.on('keydown-LEFT', () => this.cursore(-1, 0));
    k.on('keydown-RIGHT', () => this.cursore(1, 0));
    k.on('keydown-UP', () => this.cursore(0, -1));
    k.on('keydown-DOWN', () => this.cursore(0, 1));
    k.on('keydown-SPACE', () => this.spazio());
    k.on('keydown-ENTER', () => this.invio());
    // in pausa Lori tace; al rientro la musica si riaggancia alla canzone
    this.suPausa = () => Audio.vociZitte();
    this.events.on('pause', this.suPausa);
    this.time.delayedCall(250, () => { if (!this.finito) scritta(this, 263, 118, this.ballata.titolo.toUpperCase(), { size: 12, color: '#ffe9b0', durata: 1100, depth: 966 }); });
    this.time.delayedCall(900, () => { this.canta = true; });
    this.disegnaSegni();
  }

  pulisci() {
    Audio.vociZitte();
    this.events.off('pause', this.suPausa);
  }

  // dopo la pausa: dita e mouse azzerati, la musica riportata al punto della canzone (le
  // Impostazioni, dalla pausa, la fanno ripartire da capo)
  alRientro() {
    if (this.trascina) { const C = this.celle[this.trascina.i]; C.img?.setPosition(C.x, C.y).setDepth(20).setScale(this.scala); this.trascina = null; }
    Audio.vaiA(this.pos);
    this.offsetAudio = null;
  }

  // quando il microgioco finisce (anche la prova lampo) Lori tace
  termina() {
    if (!this.finito) Audio.vociZitte();
    super.termina();
  }

  // La casella di ogni strofa: una a caso tra quelle scoperte quando la bacchetta si alza (nel primo
  // atto la riga in alto), mai la stessa due volte; l'ultima strofa (la morale) prende l'ultima rimasta.
  caselleStrofe(r) {
    const usate = new Set();
    return this.colpi.map((p, k) => {
      const aperte = this.caselleA(this.secondoDi(Math.max(0, p - this.preavviso(k))));
      let scelte = [...Array(aperte).keys()].filter((i) => !usate.has(i));
      if (!scelte.length) scelte = [...Array(this.n).keys()].filter((i) => !usate.has(i));
      const i = scelte[Math.floor(r() * scelte.length)];
      usate.add(i);
      return i;
    });
  }

  // La disposizione iniziale: nessuna vignetta al posto giusto (la casella della sua strofa), e ognuna
  // in una casella che si può usare almeno 2 secondi prima della sua bacchettata (così ogni strofa si
  // può sempre azzeccare).
  disponi(r) {
    const n = this.n, ammesse = this.colpi.map((p) => this.caselleA(Math.max(0, this.secondoDi(p) - 2)));
    const ordine = [...Array(n).keys()].sort((a, b) => ammesse[a] - ammesse[b] || a - b);
    for (let prova = 0; prova < 400; prova++) {
      const libere = new Set(Array.from({ length: n }, (_x, i) => i)), posto = new Array(n);
      let ok = true;
      for (const k of ordine) {
        const scelte = [...libere].filter((i) => i < ammesse[k] && i !== this.dove[k]);
        if (!scelte.length) { ok = false; break; }
        const i = scelte[Math.floor(r() * scelte.length)];
        posto[k] = i; libere.delete(i);
      }
      if (ok) return posto;
    }
    return Array.from({ length: n }, (_x, k) => this.dove[(k + 1) % n]);
  }

  // ---------- le caselle ----------
  cellaA(x, y) {
    const { w, h } = P.cella;
    const C = this.celle.find((C) => Math.abs(x - C.x) <= w / 2 + 3 && Math.abs(y - C.y) <= h / 2 + 3);
    return C && C.i < this.caselle && C.v != null ? C.i : null;
  }
  mobile(i) { const C = this.celle[i]; return !this.finito && i < this.caselle && C.v != null && !C.bloccata; }

  // scambia le vignette di due caselle (vento = la folata: svolazzano)
  scambia(a, b, vento = false) {
    const A = this.celle[a], B = this.celle[b];
    [A.v, B.v] = [B.v, A.v];
    [A.img, B.img] = [B.img, A.img];
    [A.girata, B.girata] = [B.girata, A.girata];
    for (const C of [A, B]) {
      C.img.setDepth(vento ? 24 : 20).setScale(this.scala);
      this.tweens.killTweensOf(C.img);
      this.tweens.add({ targets: C.img, x: C.x, y: C.y, angle: 0, duration: vento ? 320 : 110, ease: vento ? 'Sine.inOut' : 'Quad.out', onComplete: () => C.img.setDepth(20) });
      if (vento) this.tweens.add({ targets: C.img, angle: { from: -14, to: 0 }, duration: 320 });
    }
    if (this.selezione === a || this.selezione === b) this.selezione = null;
    Audio.sfx('foglio');
  }

  // una folata gira una vignetta (si vede il retro bianco)
  gira(i) {
    const C = this.celle[i];
    C.girata = true;
    this.tweens.add({ targets: C.img, scaleX: 0, duration: 120, yoyo: true, onYoyo: () => C.img.setTexture('retroVignetta') });
    if (this.selezione === i) this.selezione = null;
  }

  rigira(i) {
    const C = this.celle[i];
    if (!C.girata) return;
    C.girata = false;
    this.tweens.killTweensOf(C.img);
    C.img.setScale(this.scala);
    this.tweens.add({ targets: C.img, scaleX: 0, duration: 70, yoyo: true, onYoyo: () => C.img.setTexture(`vign_${C.v}`) });
    Audio.sfx('foglio');
  }

  nega(i) {
    const C = this.celle[i];
    if (!C?.img) return;
    this.tweens.add({ targets: C.img, x: C.x + 2, duration: 40, yoyo: true, repeat: 1, onComplete: () => C.img.setX(C.x) });
  }

  // ---------- dito e mouse ----------
  giu(p) {
    if (!this.inCorso || this.trascina) return;
    const q = puntatore(this, p), i = this.cellaA(q.x, q.y);
    if (i == null) { this.selezione = null; return; }
    const C = this.celle[i];
    if (!this.mobile(i)) { this.nega(i); return; }
    if (C.girata) { this.rigira(i); return; }
    if (this.selezione != null && this.selezione !== i && this.mobile(this.selezione) && !this.celle[this.selezione].girata) {
      const s = this.selezione;
      this.selezione = null;
      this.scambia(s, i);
      return;
    }
    this.trascina = { i, id: p.id, x0: q.x, y0: q.y, mosso: false };
    this.tweens.killTweensOf(C.img);
    C.img.setDepth(70).setScale(this.scala * 1.08).setAngle(0);
  }

  muovi(p) {
    const T = this.trascina;
    if (!T || p.id !== T.id) return;
    const q = puntatore(this, p);
    if (!T.mosso && Math.hypot(q.x - T.x0, q.y - T.y0) > 5) T.mosso = true;
    if (T.mosso) this.celle[T.i].img.setPosition(q.x, q.y);
  }

  su(p) {
    const T = this.trascina;
    if (!T || p.id !== T.id) return;
    this.trascina = null;
    const C = this.celle[T.i], q = puntatore(this, p), j = this.cellaA(q.x, q.y);
    C.img.setScale(this.scala);
    if (!T.mosso) {
      // un clic: la vignetta resta presa, e il clic dopo sceglie la casella
      C.img.setPosition(C.x, C.y).setDepth(20);
      this.selezione = this.selezione === T.i ? null : T.i;
      return;
    }
    if (j != null && j !== T.i && this.mobile(j) && !this.celle[j].girata && this.mobile(T.i)) this.scambia(T.i, j);
    else this.tweens.add({ targets: C.img, x: C.x, y: C.y, duration: 100, onComplete: () => C.img.setDepth(20) });
  }

  // ---------- tastiera ----------
  cursore(dx, dy) {
    if (!this.inCorso) return;
    this.tastiera = true;
    const col = Phaser.Math.Clamp((this.cur % 4) + dx, 0, 3), riga = Phaser.Math.Clamp(Math.floor(this.cur / 4) + dy, 0, 1);
    this.cur = riga * 4 + col;
    Audio.sfx('muovi');
  }

  spazio() {
    if (!this.inCorso) return;
    this.tastiera = true;
    const i = this.cur, C = this.celle[i];
    if (!this.mobile(i)) { this.nega(i); return; }
    if (C.girata) { this.rigira(i); return; }
    if (this.selezione == null) { this.selezione = i; Audio.sfx('scegli'); return; }
    if (this.selezione === i) { this.selezione = null; return; }
    const s = this.selezione;
    this.selezione = null;
    if (this.mobile(s) && !this.celle[s].girata) this.scambia(s, i);
  }

  invio() {
    if (!this.inCorso) return;
    this.tastiera = true;
    if (this.celle[this.cur].girata && this.mobile(this.cur)) this.rigira(this.cur);
  }

  // ---------- la canzone ----------
  preavviso(h) {
    const a = this.attoA(this.secondoDi(this.colpi[h]));
    const spazio = this.colpi[h] - (h ? this.colpi[h - 1] : 0) - 2;
    return Math.max(4, Math.min(a.preavviso, spazio));
  }

  // la bacchetta si alza sulla strofa h: il fumetto con la scena, la casella illuminata (o una
  // finta: un'altra casella, di solito lì accanto, e all'ultimo la bacchetta cambia casella)
  arma(h) {
    const a = this.attoA(this.secondoDi(this.colpi[h]));
    this.armata = h;
    this.preToc = 0;
    this.daArma = this.pos;
    const vera = this.dove[h], col = vera % 4, riga = Math.floor(vera / 4);
    const libere = this.celle.filter((C) => C.i !== vera && this.mobile(C.i));
    const accanto = libere.filter((C) => Math.abs((C.i % 4) - col) + Math.abs(Math.floor(C.i / 4) - riga) === 1);
    const tra = accanto.length ? accanto : libere;
    this.finta = !!a.finta && tra.length > 0 && this.rFinte() < a.finta;
    this.bersaglio = this.finta ? tra[Math.floor(this.rFinte() * tra.length)].i : vera;
    this.fase = 'alzata';
    this.mettiPosa('lori_alza');
    // il fumetto: la scena della strofa, grande
    this.icona.setTexture(`vign_${h}`).setScale(scalaDi(`vign_${h}`, 1));
    this.tweens.killTweensOf(this.fumetto);
    this.fumetto.setVisible(true).setScale(0.3).setAlpha(1);
    this.tweens.add({ targets: this.fumetto, scale: 1, duration: 160, ease: 'Back.out' });
    this.sottotitolo(this.strofa(h).inizio + '...', '#fff3d6');
  }

  // la bacchetta cade sulla casella della strofa h
  colpisci(h) {
    const c = this.cfg, C = this.celle[this.dove[h]];
    if (this.trascina?.i === C.i) { C.img.setPosition(C.x, C.y).setScale(this.scala); this.trascina = null; }
    if (this.selezione === C.i) this.selezione = null;
    const eraGirata = C.girata;
    C.bloccata = true;
    this.tweens.killTweensOf(C.img);
    C.img.setPosition(C.x, C.y).setScale(this.scala).setAngle(0).setDepth(20);
    if (eraGirata) { C.girata = false; C.img.setTexture(`vign_${C.v}`); }
    const giusta = C.v === h && !eraGirata;
    this.fase = 'battuta';
    this.tBattuta = 0.38;
    this.punta = { x: C.x, y: C.y };
    this.mettiPosa('lori_batte');
    this.bersaglio = null;
    this.armata = -1;
    Audio.sfx('toc');
    vibra(30);
    colpetto(this, C.img, 1.1, 0.92);
    if (giusta) {
      this.giuste++;
      this.serie++;
      this.serieMax = Math.max(this.serieMax, this.serie);
      const p = (c.puntiStrofa + c.crescitaStrofa * (this.giuste - 1)) * (1 + c.serie * (this.serie - 1));
      this.punti += p;
      C.esito = 'giusta';
      scritta(this, C.x, C.y - 26, '+' + numero(Math.round(p)), { size: 11, color: '#7dff9a', depth: 970 });
      stelle(this, C.x, C.y, 6, 960);
      this.tweens.add({ targets: C.img, angle: { from: -6, to: 0 }, duration: 260, ease: 'Back.out' });
      this.sottotitolo(this.strofa(h).fine, '#7dff9a');
      this.time.delayedCall(120, () => { Audio.sfx('oooh'); this.reagisci('oooh'); });
      this.time.delayedCall(260, () => this.monete(2 + Math.min(3, this.serie)));
      this.time.delayedCall(420, () => { if (!this.finito && this.fase !== 'alzata') this.mettiPosa('lori_canta'); });
    } else {
      this.serie = 0;
      C.esito = 'sbagliata';
      const scena = eraGirata ? 'un foglio bianco' : this.strofa(C.v).scena;
      this.sottotitolo(`...${scena}?!`, '#ff9a8a');
      // Lori si blocca, il pubblico ride, volano i pomodori, e lui fulmina il garzone
      this.tZitto = 1.3;
      this.crepa = 0.8;
      this.time.delayedCall(200, () => { if (!this.finito) { Audio.sfx('risate'); this.reagisci('risate'); } });
      this.time.delayedCall(400, () => { if (!this.finito && this.fase !== 'alzata') this.mettiPosa('lori_confuso'); });
      this.time.delayedCall(450, () => this.pomodoro(0));
      this.time.delayedCall(650, () => this.pomodoro(1));
      this.time.delayedCall(1100, () => {
        if (this.finito || this.fase === 'alzata') return;
        this.mettiPosa('lori_fulmina');
        fumetto(this, P.lori.x + 6, P.lori.y - 124, caso(this.cfg.frasiLori), 900, 965);
      });
      this.time.delayedCall(1900, () => { if (!this.finito && this.fase !== 'alzata') this.mettiPosa('lori_canta'); });
      scuoti(this, 160, 0.004);
      // niente errori a cascata: la vignetta giusta va al suo posto (resta sbagliata, senza punti) e
      // quella che c'era torna libera nella casella lasciata. Prima restava inchiodata dove non doveva
      // stare, e alla sua strofa era sbagliata per forza (scheda di valutazione)
      this.time.delayedCall(350, () => this.rimetti(C.i, h));
    }
    this.disegnaSegni();
    this.time.delayedCall(700, () => { if (this.armata < 0) this.tweens.add({ targets: this.fumetto, alpha: 0, duration: 200, onComplete: () => this.fumetto.setVisible(false) }); });
    // l'ultima strofa: la morale. Tutte giuste: il cartellone si illumina e c'è il bonus
    if (h === this.n - 1) {
      if (this.giuste === this.n) this.time.delayedCall(450, () => this.morale());
      this.fineCanzone = this.trascorso + 1.9;
    }
  }

  // dopo un colpo sbagliato sulla casella i (strofa h): la vignetta h prende il posto di quella battuta
  rimetti(i, h) {
    if (this.finito) return;
    const C = this.celle[i], j = this.celle.findIndex((x) => x.i !== i && x.v === h);
    if (j < 0) return;
    const B = this.celle[j];
    if (this.trascina?.i === j) { this.trascina = null; }
    if (this.selezione === j) this.selezione = null;
    [C.v, B.v] = [B.v, C.v];
    [C.img, B.img] = [B.img, C.img];
    [C.girata, B.girata] = [B.girata, C.girata];
    if (C.girata) { C.girata = false; C.img.setTexture(`vign_${C.v}`); }
    for (const X of [C, B]) {
      this.tweens.killTweensOf(X.img);
      X.img.setScale(this.scala).setDepth(24);
      this.tweens.add({ targets: X.img, x: X.x, y: X.y, angle: 0, duration: 260, ease: 'Quad.out', onComplete: () => X.img.setDepth(20) });
    }
    Audio.sfx('foglio');
  }

  morale() {
    if (this.finito) return;
    this.punti += this.cfg.bonusMorale;
    Audio.sfx('bonus');
    scritta(this, 263, 116, `LA MORALE! +${this.cfg.bonusMorale}`, { size: 14, color: '#ffe14a', durata: 1100, depth: 970 });
    const g = this.add.graphics().setDepth(23).setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(0xffd860, 0.28).fillRoundedRect(P.cornice.x + 4, P.cornice.y + 4, P.cornice.w - 8, P.cornice.h - 8, 6);
    this.tweens.add({ targets: g, alpha: 0.1, duration: 280, yoyo: true, repeat: 3, onComplete: () => g.destroy() });
    this.celle.forEach((C) => C.img && stelle(this, C.x, C.y, 3, 960));
  }

  sottotitolo(s, col) {
    this.sotto.setText(s).setColor(col);
    const w = this.sotto.width + 8;
    this.gSotto.clear().fillStyle(0x1f1430, 0.78).fillRoundedRect(this.sotto.x - w / 2, P.sottotitolo - 7, w, 14, 7);
  }

  mettiPosa(k) {
    if (this.posa === k) return;
    this.posa = k;
    this.lori.setTexture(k).setScale(scalaDi(k, TAGLIA_LORI));
  }

  // il pubblico: OOOH (contenti, un saltino) o risate (si piegano dal ridere)
  reagisci(tipo) {
    if (this.finito) return;
    const chi = this.pubblico;
    chi.forEach((m, k) => {
      m.img.setTexture(`${m.id}_felice`);
      this.tweens.killTweensOf(m.img);
      m.img.setY(P.ySeduti).setAngle(0);
      if (tipo === 'oooh') this.tweens.add({ targets: m.img, y: P.ySeduti - 4, duration: 120, delay: k * 30, yoyo: true });
      else this.tweens.add({ targets: m.img, angle: { from: -5, to: 5 }, duration: 90, delay: k * 20, yoyo: true, repeat: 4, onComplete: () => m.img.setAngle(0) });
    });
    const m = chi[Math.floor(Math.random() * chi.length)];
    fumetto(this, m.x, P.ySeduti - 46, caso(tipo === 'oooh' ? this.cfg.frasiGiusta : this.cfg.frasiRisate), 800, 962);   // (sotto la riga del testo)
    this.time.delayedCall(1000, () => { if (!this.finito) chi.forEach((m) => m.img.setTexture(`${m.id}_normale`)); });
  }

  // un pomodoro dal pubblico, su Lori
  pomodoro(k) {
    if (this.finito) return;
    const m = this.pubblico[(k * 3 + Math.floor(Math.random() * 2)) % this.pubblico.length];
    const da = { x: m.x, y: P.ySeduti - 40 }, a = { x: P.lori.x - 8 + Math.random() * 20, y: P.lori.y - 92 + Math.random() * 30 };
    const t = im(this, da.x, da.y, 'pomodoroLancio', 1).setDepth(980);
    Audio.sfx('lancio');
    this.tweens.addCounter({
      from: 0, to: 1, duration: 420, onUpdate: (tw) => {
        const u = tw.getValue();
        t.setPosition(lerp(da.x, a.x, u), lerp(da.y, a.y, u) - Math.sin(u * Math.PI) * 50).setAngle(u * 400);
      }, onComplete: () => {
        t.destroy();
        Audio.sfx('splat');
        if (!this.finito && this.fase !== 'alzata') this.mettiPosa('lori_ripara');
        const s = im(this, a.x, a.y, 'schizzoPomodoro', 1).setDepth(981).setAngle(Math.random() * 40 - 20);
        this.tweens.add({ targets: s, alpha: 0, delay: 500, duration: 300, onComplete: () => s.destroy() });
      },
    });
  }

  // le monete volano dal pubblico nel cappello
  monete(n) {
    for (let k = 0; k < n; k++) {
      const m = this.pubblico[Math.floor(Math.random() * this.pubblico.length)];
      const da = { x: m.x, y: P.ySeduti - 30 }, a = { x: P.cappello.x - 6 + Math.random() * 12, y: P.cappello.y - 10 };
      const o = im(this, da.x, da.y, 'monetaRe', 0.7).setDepth(985);
      this.tweens.addCounter({
        from: 0, to: 1, duration: 380 + k * 60, delay: k * 70, onUpdate: (tw) => {
          const u = tw.getValue();
          o.setPosition(lerp(da.x, a.x, u), lerp(da.y, a.y, u) - Math.sin(u * Math.PI) * 40);
        }, onComplete: () => { o.destroy(); if (k === 0) Audio.sfx('monete'); this.disegnaMonete(); },
      });
    }
  }

  disegnaMonete() {
    const g = this.gMonete.clear(), n = Math.min(14, this.giuste * 2 + (this.finito ? 6 : 0));
    for (let i = 0; i < n; i++) {
      const x = P.cappello.x - 8 + ((i * 5) % 16), y = P.cappello.y - 11 - Math.floor(i / 4) * 1.6;
      g.fillStyle(0x8a6a10, 1).fillEllipse(x, y + 0.6, 6, 2.6).fillStyle(0xffd34a, 1).fillEllipse(x, y, 6, 2.6);
    }
  }

  // le vignette battute: giuste col bordo d'oro e la stella, sbagliate spente con la croce
  disegnaSegni() {
    const g = this.gSegni.clear(), { w, h } = P.cella;
    for (const C of this.celle) {
      if (!C.esito) continue;
      const x = C.x - w / 2, y = C.y - h / 2;
      if (C.esito === 'giusta') {
        g.lineStyle(2.4, 0xffd34a, 1).strokeRoundedRect(x - 1, y - 1, w + 2, h + 2, 5);
        g.fillStyle(0xffd34a, 1).fillCircle(x + w - 6, y + 6, 5).fillStyle(0x2f9a4a, 1).fillCircle(x + w - 6, y + 6, 3.4);
      } else {
        g.fillStyle(0x1f1430, 0.38).fillRoundedRect(x + 1, y + 1, w - 2, h - 2, 4);
        g.lineStyle(2.6, 0xff3b2f, 1).lineBetween(x + w - 11, y + 3, x + w - 3, y + 11).lineBetween(x + w - 3, y + 3, x + w - 11, y + 11);
      }
    }
  }

  // ---------- il vento ----------
  folata() {
    const r = this.rFolate, via = new Set([this.bersaglio, this.armata >= 0 ? this.dove[this.armata] : null, this.trascina?.i, this.selezione]);
    const cand = this.celle.filter((C) => this.mobile(C.i) && !C.girata && !via.has(C.i));
    // le strisce del vento sul cartellone
    Audio.sfx('vento');
    for (let k = 0; k < 6; k++) {
      const y = P.cornice.y + 14 + k * 26 + Math.random() * 10, l = this.add.rectangle(P.cornice.x + 10, y, 26 + Math.random() * 30, 1.4, 0xffffff, 0.8).setDepth(955);
      this.tweens.add({ targets: l, x: P.cornice.x + P.cornice.w - 10, alpha: 0, delay: k * 40, duration: 420, onComplete: () => l.destroy() });
    }
    if (!cand.length) return;
    const giuste = cand.filter((C) => this.dove[C.v] === C.i);
    if (giuste.length && cand.length >= 2 && r() < 0.5) {
      const a = giuste[Math.floor(r() * giuste.length)], altre = cand.filter((C) => C !== a), b = altre[Math.floor(r() * altre.length)];
      this.scambia(a.i, b.i, true);
    } else {
      const tra = giuste.length ? giuste : cand, C = tra[Math.floor(r() * tra.length)];
      this.gira(C.i);
    }
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    const c = this.cfg;
    // dove siamo nella canzone (in ottavi): il proprio orologio, agganciato all'audio quando c'è
    const dur = this.durPasso();
    this.pos += dt / dur;
    const ap = Audio.posizione;
    if (ap != null) {
      if (this.offsetAudio == null) this.offsetAudio = ap - this.pos;
      this.pos += (ap - this.offsetAudio - Audio.ritardo / dur - this.pos) * Math.min(1, dt * 3);
    }
    // gli atti: il nome, il telo che vola via, le caselle in gioco
    const A = this.atto, nA = c.atti.indexOf(A);
    if (nA !== this.nAtto) {
      this.nAtto = nA;
      if (A.nome) { Audio.sfx('bonus'); scritta(this, 263, 118, A.nome, { size: 14, color: '#ffe14a', durata: 1000, depth: 966 }); }
      this.caselle = this.caselleA(this.trascorso);
      const telo = this.corta ? null : this.teli[nA - 1];
      if (telo?.visible) {
        Audio.sfx('telo');
        this.tweens.add({ targets: telo, x: telo.x + 150, y: telo.y - 110, angle: 35, alpha: 0, duration: 750, ease: 'Quad.in', onComplete: () => telo.setVisible(false) });
      }
      // (in Lampo il secondo atto dura 3 secondi: una folata sola, subito)
      this.prossimaFolata = A.folata ? this.trascorso + (this.corta ? 0.4 : 1.2 + this.rFolate() * 1.5) : null;
    }
    // la strofa: la bacchetta si alza, i due bip che salgono, la finta, il colpo
    const h = this.h;
    if (h < this.n) {
      const colpo = this.colpi[h];
      if (this.armata !== h && this.pos >= colpo - this.preavviso(h)) this.arma(h);
      if (this.armata === h) {
        if (this.preToc === 0 && this.pos >= colpo - 2) { this.preToc = 1; Audio.sfx('preToc1'); }
        if (this.preToc === 1 && this.pos >= colpo - 1) { this.preToc = 2; Audio.sfx('preToc2'); }
        if (this.finta && this.pos >= colpo - c.finta) {
          this.finta = false;
          this.bersaglio = this.dove[h];
          Audio.sfx('fiuu');
          const C = this.celle[this.bersaglio];
          scritta(this, C.x, C.y - 30, '!', { size: 18, color: '#ff9a3a', durata: 400, depth: 972 });
        }
        if (this.pos >= colpo) { this.colpisci(h); this.h++; }
      }
    }
    // la fine della canzone (poco dopo la morale)
    if (this.fineCanzone != null && this.trascorso >= this.fineCanzone) { this.termina(); return; }
    // il vento
    if (this.prossimaFolata != null && this.trascorso >= this.prossimaFolata) {
      this.folata();
      this.prossimaFolata = this.trascorso + lerp(A.folata[0], A.folata[1], this.rFolate());
    }
    // la bacchetta che torna giù dopo il colpo
    if (this.fase === 'battuta') {
      this.tBattuta -= dt;
      if (this.tBattuta <= 0) { this.fase = 'posata'; if (this.posa === 'lori_batte') this.mettiPosa('lori_canta'); }
    }
    this.cantaLori(dt);
    this.disegnaBacchetta();
    this.disegnaCursore();
    // l'HUD (solo quando cambia)
    const hud = `${Math.round(this.punti)}|${this.giuste}|${this.serie}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(this.punti));
      this.testoStrofe.setText(`GIUSTE: ${this.giuste}/${this.obiettivo}`).setColor(this.giuste >= this.obiettivo ? '#7dff9a' : '#ffe14a');
      this.testoSerie.setText(this.serie >= 2 ? `SERIE x${this.serie}` : '');
    }
  }

  // la voce 8-bit di Lori: canta le sillabe della melodia (una nota per ottavo, staccate)
  cantaLori(dt) {
    this.tZitto = Math.max(0, this.tZitto - dt);
    this.crepa = Math.max(0, this.crepa - dt * 0.6);
    const ap = Audio.posizione;
    if (!this.canta || this.finito || ap == null || this.tZitto > 0.4) { Audio.voce('lori', null); return; }
    const passo = Math.floor(ap), fra = ap - passo;
    let n = Audio.notaCanto(passo), dentro = fra < 0.78;
    if (!n) { n = Audio.notaCanto(passo - 1); dentro = fra < 0.5; }
    if (n && dentro) Audio.voce('lori', { freq: hz(n - 12), vol: this.tZitto > 0 ? 0.4 : 0.85, vibrato: 22, vibratoHz: 5.5, tipo: 'square', taglio: 1500, crepa: this.crepa });
    else Audio.voce('lori', null);
  }

  // la bacchetta: dalla mano di Lori alla punta. Alzata sopra la casella (trema di più quando sta
  // per cadere), poi giù lungo l'arco tratteggiato, sul tempo. Il cerchio che si stringe dice quando.
  disegnaBacchetta() {
    const g = this.gBacchetta.clear(), gA = this.gArco.clear(), gL = this.gLuce.clear();
    const L = this.lori;
    let mano, punta;
    if (this.fase === 'alzata' && this.bersaglio != null) {
      const C = this.celle[this.bersaglio], colpo = this.colpi[this.armata], pre = this.preavviso(this.armata);
      const k = Phaser.Math.Clamp((this.pos - (colpo - pre)) / pre, 0, 1);
      const alto = { x: C.x + 10, y: P.cornice.y - 14 + Math.sin(this.trascorso * 28) * k * 2.2 };
      // l'arco: dalla punta alzata al centro della casella
      const ctrl = { x: C.x + 30, y: P.cornice.y - 2 };
      const arco = (u) => ({ x: (1 - u) ** 2 * alto.x + 2 * (1 - u) * u * ctrl.x + u * u * C.x, y: (1 - u) ** 2 * alto.y + 2 * (1 - u) * u * ctrl.y + u * u * C.y });
      gA.lineStyle(1.6, 0xffffff, 0.85);
      for (let i = 0; i < 12; i += 2) { const a = arco(i / 12), b = arco((i + 1) / 12); gA.lineBetween(a.x, a.y, b.x, b.y); }
      // la casella illuminata e il cerchio che si stringe
      const { w, h } = P.cella, vero = this.bersaglio === this.dove[this.armata];
      gL.fillStyle(vero ? GIALLO : 0xff9a3a, 0.12 + 0.22 * k).fillRoundedRect(C.x - w / 2, C.y - h / 2, w, h, 4);
      gL.lineStyle(2.6, vero ? GIALLO : 0xff9a3a, 0.6 + 0.4 * k).strokeRoundedRect(C.x - w / 2 - 1.5, C.y - h / 2 - 1.5, w + 3, h + 3, 5);
      gL.lineStyle(2, 0xffffff, 0.35 + 0.55 * k).strokeCircle(C.x, C.y, lerp(44, 9, k));
      // la caduta: nell'ultimo ottavo e mezzo, lungo l'arco
      const giu = Phaser.Math.Clamp((this.pos - (colpo - 1.5)) / 1.5, 0, 1);
      const voluta = giu > 0 ? arco(giu * giu) : alto;
      // (cambiando casella, la punta ci va di corsa)
      this.punta.x = lerp(this.punta.x, voluta.x, giu > 0 ? 1 : 0.35);
      this.punta.y = lerp(this.punta.y, voluta.y, giu > 0 ? 1 : 0.35);
      punta = this.punta;
      mano = MANO.lori_alza;
    } else if (this.fase === 'battuta') {
      punta = this.punta;
      mano = MANO.lori_batte;
    } else {
      // posata: appoggiata in piedi accanto a Lori
      this.punta = { x: L.x + 40, y: L.y - 132 };
      g.lineStyle(3.6, CONT, 1).lineBetween(L.x + 26, L.y - 1, L.x + 40, L.y - 132);
      g.lineStyle(1.8, LEGNO, 1).lineBetween(L.x + 26, L.y - 1, L.x + 40, L.y - 132);
      g.fillStyle(CONT, 1).fillCircle(L.x + 40, L.y - 132, 3).fillStyle(0xe8c060, 1).fillCircle(L.x + 40, L.y - 132, 2.1);
      return;
    }
    const mx = L.x + mano[0], my = L.y + mano[1];
    g.lineStyle(3.6, CONT, 1).lineBetween(mx, my, punta.x, punta.y);
    g.lineStyle(1.8, LEGNO, 1).lineBetween(mx, my, punta.x, punta.y);
    g.fillStyle(CONT, 1).fillCircle(punta.x, punta.y, 3).fillStyle(0xe8c060, 1).fillCircle(punta.x, punta.y, 2.1);
  }

  // il cursore della tastiera e la vignetta presa (clic o SPAZIO)
  disegnaCursore() {
    const g = this.gCursore.clear(), { w, h } = P.cella;
    if (this.selezione != null) {
      const C = this.celle[this.selezione];
      const s = 1 + Math.sin(this.trascorso * 10) * 0.5;
      g.lineStyle(2.4 + s, 0x6ad8ff, 1).strokeRoundedRect(C.x - w / 2 - 2, C.y - h / 2 - 2, w + 4, h + 4, 6);
    }
    if (this.tastiera) {
      const C = this.celle[this.cur];
      g.lineStyle(1.8, 0xffffff, 1).strokeRoundedRect(C.x - w / 2 - 4, C.y - h / 2 - 4, w + 8, h + 8, 7);
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.fillStyle(0xffffff, 1).fillCircle(C.x + sx * (w / 2 + 4), C.y + sy * (h / 2 + 4), 2.2);
    }
  }

  risultato() {
    return {
      punteggio: Math.round(this.punti),
      vittoria: this.giuste >= this.obiettivo,
      riepilogo: `Strofe giuste ${this.giuste} su ${this.n}, serie max ${this.serieMax}`,
      titoli: ['BIS! BIS!', 'TUTTI A CASA!'],
    };
  }

  // Vittoria: l'inchino di Lori, la pioggia di monete nel cappello, gli amici in piedi che
  // applaudono, il cartellone illuminato. Sconfitta: il pubblico se ne va, la pioggia di pomodori,
  // Lori arrotola il cartellone sconsolato e se la prende col garzone.
  finale(ris, fatto) {
    for (const o of [this.fumetto, this.gArco, this.gLuce, this.gCursore, this.testoPunti, this.testoStrofe, this.testoSerie]) o.setVisible(false);
    if (this.trascina) { const C = this.celle[this.trascina.i]; C.img?.setPosition(C.x, C.y).setScale(this.scala).setDepth(20); this.trascina = null; }
    this.selezione = null;
    this.fase = 'posata';
    this.disegnaBacchetta();
    Audio.sfx('tempo');
    const titolo = (s, col) => txt(this, 263, 118, s, { size: 22, color: col, depth: 990 });
    this.time.delayedCall(350, () => {
      if (ris.vittoria) {
        Audio.sfx('vittoria');
        titolo(ris.titoloFine ?? 'BIS! BIS!', '#7dff9a');
        this.sottotitolo('E vissero tutti felici e contenti!', '#7dff9a');
        this.mettiPosa('lori_inchino');
        const g = this.add.graphics().setDepth(23).setBlendMode(Phaser.BlendModes.ADD);
        g.fillStyle(0xffd860, 0.22).fillRoundedRect(P.cornice.x + 4, P.cornice.y + 4, P.cornice.w - 8, P.cornice.h - 8, 6);
        this.tweens.add({ targets: g, alpha: 0.25, duration: 300, yoyo: true, repeat: -1 });
        // l'inchino: si piega in avanti, due volte
        this.tweens.add({ targets: this.lori, y: P.lori.y + 3, scaleY: this.lori.scaleY * 0.93, angle: 6, duration: 260, delay: 200, yoyo: true, hold: 300, repeat: 1 });
        this.pubblico.forEach((m, k) => {
          m.img.setTexture(`${m.id}_felice`).setDepth(62);
          this.tweens.add({ targets: m.img, y: P.ySeduti - 14, duration: 220, delay: k * 60, ease: 'Back.out' });
          this.tweens.add({ targets: m.img, angle: { from: -4, to: 4 }, duration: 160, delay: 300 + k * 60, yoyo: true, repeat: 7 });
        });
        for (let k = 0; k < 5; k++) this.time.delayedCall(k * 380, () => Audio.sfx('applauso'));
        for (let k = 0; k < 16; k++) {
          const o = im(this, P.cappello.x - 30 + Math.random() * 60, -10, 'monetaRe', 0.7).setDepth(985);
          this.tweens.add({ targets: o, x: P.cappello.x - 6 + Math.random() * 12, y: P.cappello.y - 10, angle: 360, delay: 200 + k * 90, duration: 520, ease: 'Quad.in', onComplete: () => { o.destroy(); if (k % 4 === 0) Audio.sfx('monete'); } });
        }
        this.time.delayedCall(1700, () => { this.disegnaMonete(); stelle(this, P.cappello.x, P.cappello.y - 16, 6, 986); });
        stelle(this, 263, 118, 10, 989);
      } else {
        Audio.sfx('sconfitta');
        titolo(ris.titoloFine ?? 'TUTTI A CASA!', '#ff6b5a');
        this.sottotitolo('Il pubblico non capisce l\'arte.', '#ff9a8a');
        // il pubblico se ne va
        this.pubblico.forEach((m, k) => {
          m.img.setTexture(`${m.id}_sufficienza`);
          const verso = m.x < 282 ? -1 : 1;
          this.tweens.add({ targets: m.img, x: m.x + verso * 140, alpha: 0, delay: 200 + k * 120, duration: 900, ease: 'Sine.in' });
        });
        Audio.sfx('buu');
        // la pioggia di pomodori
        this.mettiPosa('lori_ripara');
        for (let k = 0; k < 6; k++) this.time.delayedCall(k * 160, () => this.pomodoroFinale());
        // Lori arrotola il cartellone e se la prende col garzone
        const quadro = this.add.container(0, 0).setDepth(20);
        quadro.add([this.cartellone, ...this.celle.filter((C) => C.img).map((C) => C.img), this.gSegni, ...this.teli, ...this.targa]);
        const rotolo = this.add.graphics().setDepth(31);
        const altezza = { s: 1 };
        this.tweens.add({
          targets: altezza, s: 0.04, delay: 1100, duration: 900, ease: 'Sine.in', onUpdate: () => {
            quadro.setScale(1, altezza.s).setY(P.cornice.y * (1 - altezza.s));
            const y = P.cornice.y + P.cornice.h * altezza.s;
            rotolo.clear().fillStyle(CONT, 1).fillRoundedRect(P.cornice.x - 4, y - 7, P.cornice.w + 8, 14, 7).fillStyle(0xe2cfa2, 1).fillRoundedRect(P.cornice.x - 2, y - 5, P.cornice.w + 4, 10, 5);
          },
        });
        this.time.delayedCall(1300, () => Audio.sfx('telo'));
        this.time.delayedCall(2100, () => {
          this.mettiPosa('lori_fulmina');
          Audio.sfx('borbottio');
          fumetto(this, P.lori.x + 8, P.lori.y - 124, 'GARZONE!!!', 1300, 990);
        });
      }
    });
    this.time.delayedCall(3500, fatto);
  }

  pomodoroFinale() {
    const a = { x: P.lori.x - 14 + Math.random() * 30, y: P.lori.y - 110 + Math.random() * 70 };
    const t = im(this, 200 + Math.random() * 200, 280, 'pomodoroLancio', 1).setDepth(980);
    this.tweens.add({
      targets: t, x: a.x, y: a.y, angle: 500, duration: 450, ease: 'Quad.out', onComplete: () => {
        t.destroy();
        Audio.sfx('splat');
        const s = im(this, a.x, a.y, 'schizzoPomodoro', 1).setDepth(981).setAngle(Math.random() * 60 - 30);
        this.tweens.add({ targets: s, alpha: 0, delay: 900, duration: 400, onComplete: () => s.destroy() });
      },
    });
  }
}
