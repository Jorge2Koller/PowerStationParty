// Microgioco 19: "La ballata del Pallaio" - canta con Lori le storie del PowerStation. CANTA!
//
//  Serata karaoke al bar del Pallaio: Lori, chitarra a tracolla, canta una ballata che racconta gli
//  altri microgiochi (tre storie, una per atto: il Passaggiorgio, il Piovra, ReGrorio, la pizza dal
//  Boni, il Manna). Il gioco è a ritmo, alla Rhythm Heaven / PaRappa (scheda di valutazione: "l'idea
//  che racconti i minigiochi è figata ma cambierei la meccanica"):
//  - LA STROFA (2 battute): nella prima Lori canta l'inizio del verso (sullo schermo del karaoke le
//    parole si accendono a tempo); intanto, appese al filo con le mollette, arrivano 3-5 vignette che
//    scorrono a tempo verso il faro accanto a Lori. Nella seconda battuta passano dal faro, una per
//    battito: chi gioca tocca (o SPAZIO) quando quella GIUSTA, la scena che Lori sta raccontando, è nel
//    faro. Allora Lori canta la fine del verso, il pubblico fa OOOH e con la serie accende gli
//    accendini. La prima vignetta presa decide il verso: se è sbagliata (o la giusta passa senza
//    prenderla) Lori stona ("...le chiavi nel bicchiere?!"), il pubblico fischia e vola un pomodoro;
//    le altre vignette di quel verso volano via. Tocchi a vuoto: una pennata, niente di male.
//  - IL RITORNELLO (1 battuta): il pubblico canta "Oh, Pallaio!" e chi gioca batte le mani sulle
//    manine che arrivano nel faro (pochi punti, ma tengono il ritmo).
//  Tre atti: la prima storia (3 vignette, tutte di altre storie: basta sapere di chi si parla), la
//  seconda (4 vignette, una della stessa storia), il gran finale (Lori accelera, 5 vignette fitte,
//  due della stessa storia, e l'ultima strofa è la morale). Il tempo (PERFETTO o BENE) dà un po' di
//  punti in più; a FACILE la vignetta giusta è sempre nel fumetto di Lori (nelle altre, solo alla
//  prima strofa: si capisce senza spiegazioni).
//  Le storie, le strofe, le vignette (e dove sta la giusta) escono dal seme del round. La musica la
//  scrive la scena a ogni partita dallo spartito della configurazione (Audio.scriviTraccia), e il
//  tempo è quello della musica (Audio.posizione); senza audio si va col proprio orologio.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { CONFIG } from '../config.js';
import { casuale, assicura, liberaGruppi, gruppiDi } from '../grafica/base.js';
import { BALLATA as B, vignetta, texDellaVignetta } from '../grafica/ballata.js';
import { txt, im, scalaDi, scritta, stelle, fumetto, scuoti, caso, vibra, puntiHud, numero, lerp, puntatore, eTouch } from '../fx.js';

const TAGLIA_LORI = 0.8;
const TAGLIA = 0.56;               // il pubblico, dietro al tavolone
const OTTAVO = 0.25;               // un ottavo, a 120 battiti al minuto
const PARTENZA = 512;              // la x dove una vignetta entra (appena fuori dallo schermo)
const Y_CARTA = B.filo + 2 + B.carta.h / 2;
const GIALLO = 0xffe14a, ROSA = '#ff8ad0';
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
// le "frasi" del karaoke quando non canta Lori
const KARAOKE = {
  intro: ['♪ LA BALLATA DEL PALLAIO ♪', 'Lori canta le storie del PowerStation...', '...prendi la vignetta giusta nel faro!'],
  fine: ['♪ GRAZIE PALLAIO! ♪', 'E anche stasera, la storia è finita.', ''],
};

export class BallataScene extends MicrogiocoBase {
  constructor() { super('ballata'); }

  // la musica va alla velocità della parte che suona (il gran finale è più svelto)
  tempoMusica() { return this.parteA(this.pos).tempo; }
  parteA(pos) { let P = this.parti[0]; for (const Q of this.parti) if (pos >= Q.da) P = Q; return P; }
  // a che secondo arriva un punto della canzone (in ottavi)
  secondoDi(pos) { const P = this.parteA(pos); return P.t0 + (pos - P.da) * P.du; }
  get obiettivo() { return this.corta ? this.cfg.obiettivoLampo : this.cfg.obiettivoVersi; }

  prepara() {
    const c = this.cfg, seme = Sessione.seme;
    this.rnd = casuale(seme);
    const rCarte = casuale((seme ^ 0xba11a7) >>> 0), rPubblico = casuale((seme ^ 0x9ab1c0) >>> 0);
    this.corta = Sessione.tipo === 'lampo';
    this.punti = 0; this.giuste = 0; this.serie = 0; this.serieMax = 0; this.mani = 0; this.maniTot = 0;
    this.pos = 0; this.posVis = 0; this.offsetAudio = null;
    this.fineCanzone = null; this.parteOra = null; this.battito = -1;
    this.posaFino = 0; this.posaFissa = null; this.stonaFino = 0; this.accesi = 0;

    // --- la canzone: le tre storie, le parti in fila, le vignette ---
    const ordine = [...c.ballate.keys()];
    for (let i = ordine.length - 1; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [ordine[i], ordine[j]] = [ordine[j], ordine[i]]; }
    this.storie = ordine.slice(0, 3);
    const schema = this.corta ? c.canzoneLampo : c.canzone;
    const nAtto = (s) => Number(s.slice(1));
    const ultimoAtto = Math.max(...schema.filter((s) => s[0] === 's').map(nAtto));
    // le strofe di ogni atto, in ordine: il primo atto comincia dalla prima strofa della sua storia,
    // l'ultimo finisce con la morale (la strofa 8)
    const strofeAtto = {};
    for (let a = 0; a <= ultimoAtto; a++) {
      const n = schema.filter((s) => s === 's' + a).length, prime = a === 0 ? [0] : [], ultime = a === ultimoAtto ? [7] : [];
      const libere = [1, 2, 3, 4, 5, 6].filter((i) => a !== 0 || i !== 0);
      const scelte = [];
      while (scelte.length < n - prime.length - ultime.length && libere.length) scelte.push(libere.splice(Math.floor(this.rnd() * libere.length), 1)[0]);
      strofeAtto[a] = [...prime, ...scelte.sort((x, y) => x - y), ...ultime].slice(0, n);
    }
    this.parti = [];
    this.cose = [];               // le vignette e le manine, in ordine di arrivo al faro
    let p = 0, t0 = 0, k = 0, nRit = 0;
    const usate = {};             // atto -> quante strofe già messe
    schema.forEach((s, i) => {
      const prossimoAtto = schema.slice(i).find((x) => x[0] === 's');
      const a = s[0] === 's' ? nAtto(s) : s === 'fine' ? ultimoAtto : prossimoAtto ? nAtto(prossimoAtto) : ultimoAtto;
      const A = c.atti[a], len = s[0] === 's' ? 16 : 8, du = OTTAVO / A.tempo;
      const P = { tipo: s[0] === 's' ? 'strofa' : s, da: p, len, t0, du, tempo: A.tempo, atto: a, anticipo: A.anticipo };
      if (P.tipo === 'strofa') {
        const j = usate[a] = (usate[a] ?? 0) + 1;
        P.k = k++;
        P.storia = this.storie[a];
        P.strofa = strofeAtto[a][j - 1];
        P.s = c.ballate[P.storia].strofe[P.strofa];
        P.esito = null;
        P.variante = P.k % 2;
        this.preparaCarte(P, A, rCarte);
      } else if (P.tipo === 'rit') {
        P.manine = c.manine[Math.min(nRit++, c.manine.length - 1)];
        for (const m of P.manine) this.cose.push({ tipo: 'mano', t: p + m, parte: P, vel: (PARTENZA - B.faro) / A.anticipo, stato: null });
        this.maniTot += P.manine.length;
      }
      this.parti.push(P);
      p += len; t0 += len * du;
    });
    this.n = k;
    this.cose.sort((x, y) => x.t - y.t);
    // la fine: poco dopo l'ultima strofa (in ottavi della canzone: si va col tempo della musica)
    this.fineCanzone = this.parti.filter((P) => P.tipo === 'strofa').pop().da + 19;
    this.componiMusica();

    // --- la sala, il palco, Lori ---
    im(this, 0, 0, 'bgBallata').setOrigin(0).setDepth(0);
    this.coni = [
      im(this, B.lori.x - 4, 56, 'conoFaro').setOrigin(0.5, 0).setDepth(2).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd8a0),
      im(this, B.faro, 56, 'conoFaro').setOrigin(0.5, 0).setDepth(2).setBlendMode(Phaser.BlendModes.ADD).setTint(0xfff4c8),
    ];
    this.coni[0].setDisplaySize(96, 150).setAlpha(0.35);
    this.coni[1].setDisplaySize(74, 100).setAlpha(0.3);
    this.gFaro = this.add.graphics().setDepth(8);
    this.lori = im(this, B.lori.x, B.lori.y, 'lori_canta', TAGLIA_LORI).setOrigin(0.5, 1).setDepth(30);
    this.posa = 'lori_canta';
    // l'asta del microfono, davanti a Lori
    const g = this.add.graphics().setDepth(31);
    g.lineStyle(3, 0x121216, 1).lineBetween(134, B.lori.y, 132, 150).lineBetween(132, 150, 116, 143);
    g.lineStyle(2, 0x3a3a44, 1).lineBetween(124, B.lori.y + 1, 144, B.lori.y + 1);
    g.fillStyle(0x121216, 1).fillCircle(114, 142, 4.2).fillStyle(0x9aa0ac, 1).fillCircle(113.5, 141.5, 3);
    // le vignette: si disegnano con le immagini degli altri microgiochi (si creano i loro gruppi, e
    // finite le vignette si buttano: vedi gruppoPigro)
    const chiavi = [...new Set(this.cose.filter((x) => x.tipo === 'carta').map((x) => x.id))];
    this.tex = {};
    const vign = (id) => { const [st, sf] = id.split(':').map(Number); return c.ballate[st].strofe[sf].vignetta; };
    const altri = gruppiDi(chiavi.flatMap((id) => texDellaVignetta(vign(id)))).filter((x) => x !== 'ballata' && x !== 'tavolaPallaio');
    assicura(this, altri);
    chiavi.forEach((id, i) => { this.tex[id] = `carta_${i}`; vignetta(this, `carta_${i}`, vign(id)); });
    liberaGruppi(this, altri);

    // --- il pubblico al tavolone (amici del Pallaio, dal seme), con gli accendini ---
    const io = this.giocatore.id.replace(DOPPIONE, ''), ids = CONFIG.personaggiGiocabili.map((x) => x.id).filter((id) => id !== io && id !== 'lori');
    const pesca = () => ids.splice(Math.floor(rPubblico() * ids.length), 1)[0];
    this.pubblico = B.pubblico.map((x, i) => {
      const id = pesca();
      const img = im(this, x, B.piediPubblico, `${id}_normale`, TAGLIA).setOrigin(0.5, 1).setDepth(40).setFlipX(i % 2 === 1);
      const lato = i % 2 ? -1 : 1;
      const acc = im(this, x + lato * 15, B.tavola - 30, 'accendinoBallata', 1.1).setOrigin(0.5, 1).setDepth(41).setVisible(false);
      return { id, x, img, acc };
    });
    im(this, 240, B.tavola, 'tavolaPallaio').setOrigin(0.5, 0).setDepth(45);

    // --- lo schermo del karaoke: la storia, il verso di Lori, la fine del verso ---
    const S = B.schermo, cx = S.x + S.w / 2;
    this.kTesta = txt(this, cx, S.y + 7, '', { size: 7, color: ROSA, depth: 20 });
    this.k1 = txt(this, cx, S.y + 22, '', { size: 7.5, color: '#9aa4d8', depth: 20 });
    this.k1acceso = txt(this, cx, S.y + 22, '', { size: 7.5, color: '#ffe14a', depth: 21 });
    this.k2 = txt(this, cx, S.y + 37, '', { size: 7.5, color: '#9aa4d8', depth: 20 });
    this.k2acceso = txt(this, cx, S.y + 37, '', { size: 7.5, color: '#7dff9a', depth: 21 });
    this.karaoke(...KARAOKE.intro);
    // il fumetto di Lori con la vignetta giusta (a FACILE sempre, se no solo nella prima strofa)
    const gF = this.add.graphics();
    gF.fillStyle(0x1f1430, 1).fillRoundedRect(-27, -25, 54, 50, 8).fillCircle(-10, 31, 4).fillCircle(-15, 39, 2.6);
    gF.fillStyle(0xffffff, 1).fillRoundedRect(-26, -24, 52, 48, 7).fillCircle(-10, 31, 3).fillCircle(-15, 39, 1.8);
    this.iconaAiuto = this.add.image(0, 0, 'carta_0');
    this.aiuto = this.add.container(72, 50, [gF, this.iconaAiuto]).setDepth(900).setVisible(false);
    this.gEsito = this.add.graphics().setDepth(24);

    // --- l'HUD ---
    this.testoPunti = txt(this, 474, 36, '', { size: 9, ox: 1, depth: 1001 });
    this.testoVersi = txt(this, 474, 49, '', { size: 7, ox: 1, depth: 1001, color: '#ffe14a' });
    this.testoSerie = txt(this, 474, 60, '', { size: 7, ox: 1, depth: 1001, color: '#ff9ad8' });
    this.hud = '';

    // --- i comandi: un tasto solo (tocco ovunque, SPAZIO, INVIO, le frecce) ---
    // (sul telefono il tocco sul pulsante della pausa, in alto a destra, non è una pennata)
    this.input.on('pointerdown', (p) => { const q = puntatore(this, p); if (!(eTouch() && q.x > 396 && q.y < 36)) this.tocca(); });
    const kb = this.input.keyboard;
    kb.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER']);
    kb.on('keydown', (ev) => { if (!ev.repeat && ['Space', 'Enter', 'NumpadEnter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyZ', 'KeyX'].includes(ev.code)) this.tocca(); });
    // in pausa Lori e il pubblico tacciono; al rientro la musica si riaggancia alla canzone
    this.suPausa = () => Audio.vociZitte();
    this.events.on('pause', this.suPausa);
  }

  // Le vignette di una strofa: una giusta (in un posto a caso tra quelli dell'atto) e le altre di altre
  // storie, o (quante dice l'atto) della stessa. Per la morale, le altre sono le morali delle altre storie.
  preparaCarte(P, A, r) {
    const c = this.cfg, morale = P.strofa === 7, id = (st, sf) => `${st}:${sf}`;
    const stessa = [0, 1, 2, 3, 4, 5, 6].filter((sf) => sf !== P.strofa).map((sf) => id(P.storia, sf));
    const altre = this.storie.filter((st) => st !== P.storia).flatMap((st) => (morale ? [7] : [0, 1, 2, 3, 4, 5, 6]).map((sf) => id(st, sf)));
    const pesca = (da) => da.splice(Math.floor(r() * da.length), 1)[0];
    const n = A.carte.length, giusta = Math.floor(r() * n), finte = [];
    for (let i = 0; i < Math.min(A.stesse, n - 1); i++) finte.push(pesca(stessa));
    while (finte.length < n - 1) finte.push(pesca(altre.length ? altre : stessa));
    for (let i = finte.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [finte[i], finte[j]] = [finte[j], finte[i]]; }
    P.carte = A.carte.map((o, i) => {
      const x = { tipo: 'carta', t: P.da + o, parte: P, giusta: i === giusta, id: i === giusta ? id(P.storia, P.strofa) : finte.pop(), vel: (PARTENZA - B.faro) / A.anticipo, stato: null };
      this.cose.push(x);
      return x;
    });
  }

  // La musica della partita: intro, strofe (due varianti alternate), ritornelli e finale, passo per
  // passo, dallo spartito (vedi la ballata in audio.js)
  componiMusica() {
    const sp = this.cfg.spartito, T = { bpm: 120, ballata: true, lead: [], voce: [], coro: [], coro2: [], passi: [], basso: [0] };
    for (const P of this.parti) {
      const pezzo = P.tipo === 'strofa' ? sp.strofe[P.variante] : sp[P.tipo];
      for (let i = 0; i < P.len; i++) {
        const [acc, min] = pezzo.accordi[Math.floor(i / 4)] ?? pezzo.accordi[0];
        T.passi.push({ acc, min: !!min, b: i % 8, sez: P.tipo, en: P.atto + 1 });
        T.lead.push(pezzo.lead?.[i] ?? 0); T.voce.push(pezzo.voce?.[i] ?? 0);
        T.coro.push(pezzo.coro?.[i] ?? 0); T.coro2.push(pezzo.coro2?.[i] ?? 0);
      }
    }
    for (let i = 0; i < 16; i++) { T.passi.push({ acc: 55, b: 8, sez: 'fine', en: 1 }); for (const v of ['lead', 'voce', 'coro', 'coro2']) T[v].push(0); }
    Audio.musica(null);   // (la ripartenza dalla prova: la musica nuova riparte da capo)
    Audio.scriviTraccia('ballata', T);
  }

  pulisci() {
    Audio.vociZitte();
    this.events.off('pause', this.suPausa);
  }

  // dopo la pausa: la musica riportata al punto della canzone
  alRientro() {
    Audio.vaiA(this.pos);
    this.offsetAudio = null;
  }

  termina() {
    if (!this.finito) Audio.vociZitte();
    super.termina();
  }

  // ---------- il tocco (o il tasto) ----------
  tocca() {
    if (!this.inCorso) return;
    this.pennata();
    // la vignetta (o la manina) più vicina al faro, se è dentro il tempo
    // (il tocco arriva tra un fotogramma e l'altro: al tempo del fotogramma si aggiunge quello passato da allora)
    const F = this.cfg.finestre, ora = this.secondoDi(this.posVis) + Math.min(0.05, (performance.now() - (this.oraFrame ?? performance.now())) / 1000);
    let presa = null, scarto = Infinity;
    for (const x of this.cose) {
      if (x.stato) continue;
      const d = Math.abs(this.secondoDi(x.t) - ora);
      if (d < scarto) { scarto = d; presa = x; }
      if (x.t > this.posVis + 4) break;
    }
    if (!presa || scarto > F.bene) { Audio.sfx('pennata'); return; }
    const perfetto = scarto <= F.perfetto;
    if (presa.tipo === 'mano') this.battiMani(presa, perfetto);
    else if (presa.giusta) this.versoGiusto(presa, perfetto);
    else this.versoStonato(presa.parte, presa);
  }

  // Lori dà la pennata (la posa cambia, la chitarra suona)
  pennata() {
    if (this.posaFissa) return;
    this.mettiPosa(this.posa === 'lori_canta' ? 'lori_canta2' : 'lori_canta');
  }

  battiMani(x, perfetto) {
    x.stato = 'presa';
    this.mani++;
    this.punti += this.cfg.punti.mano;
    Audio.sfx('battimani');
    vibra(20);
    this.esito(perfetto ? 'PERFETTO!' : 'BENE!', perfetto ? '#7dff9a' : '#ffe14a');
    stelle(this, B.faro, Y_CARTA, 4, 960);
    this.tweens.add({ targets: x.img, scale: x.img.scale * 1.5, alpha: 0, y: x.img.y - 10, duration: 220, onComplete: () => this.via(x) });
    this.pubblico.forEach((m, i) => this.tweens.add({ targets: m.img, y: B.piediPubblico - 3, duration: 70, delay: i * 12, yoyo: true }));
  }

  versoGiusto(x, perfetto) {
    const c = this.cfg, P = x.parte;
    x.stato = 'presa';
    P.esito = 'giusto'; P.decisa = this.posVis;
    this.giuste++; this.serie++; this.serieMax = Math.max(this.serieMax, this.serie);
    const pt = (c.punti.verso + c.punti.crescita * (this.giuste - 1)) * (1 + c.punti.serie * (this.serie - 1)) + (perfetto ? c.punti.perfetto : 0);
    this.punti += pt;
    Audio.sfx('monete');
    vibra(30);
    this.esito(perfetto ? 'PERFETTO!' : 'BENE!', perfetto ? '#7dff9a' : '#ffe14a');
    scritta(this, B.faro, B.filo - 16, '+' + numero(Math.round(pt)), { size: 11, color: '#7dff9a', depth: 970, durata: 500 });
    stelle(this, B.faro, Y_CARTA, 7, 960);
    // la vignetta brilla e vola sullo schermo del karaoke
    x.img.setDepth(26);
    this.tweens.add({ targets: x.img, scale: x.img.scale * 1.25, duration: 110, yoyo: true, ease: 'Quad.out' });
    this.tweens.add({ targets: x.img, x: B.schermo.x + 18, y: B.schermo.y + 24, scale: x.img.scale * 0.55, angle: -8, delay: 260, duration: 380, ease: 'Cubic.in', onComplete: () => this.tweens.add({ targets: x.img, alpha: 0, duration: 400, delay: 300, onComplete: () => this.via(x) }) });
    this.scartaAltre(P);
    this.k2.setText(P.s.fine).setColor('#5a7a8a');
    this.k2acceso.setText('');
    this.adatta(this.k2);
    this.posaPer('lori_gode', 0.5);
    this.time.delayedCall(140, () => { if (!this.finito) { Audio.sfx('oooh'); this.reagisci('oooh'); } });
    this.aggiornaAccendini();
  }

  // il verso stonato: la vignetta sbagliata presa (x), o quella giusta passata senza prenderla (x = null)
  versoStonato(P, x) {
    P.esito = 'stonato'; P.decisa = this.posVis;
    this.serie = 0;
    this.stonaFino = P.da + P.len;
    Audio.sfx('stona');
    vibra(60);
    scuoti(this, 160, 0.004);
    if (x) {
      x.stato = 'sbagliata';
      this.esito('STONATA!', '#ff6b5a');
      // la vignetta sbagliata si stacca dal filo e cade
      x.img.setDepth(26);
      this.tweens.add({ targets: x.img, y: 300, angle: 70, duration: 700, ease: 'Quad.in', onComplete: () => this.via(x) });
      const g = this.gEsito;
      g.lineStyle(4, 0xff3b2f, 1).lineBetween(B.faro - 14, Y_CARTA - 14, B.faro + 14, Y_CARTA + 14).lineBetween(B.faro + 14, Y_CARTA - 14, B.faro - 14, Y_CARTA + 14);
      this.time.delayedCall(260, () => g.clear());
    } else this.esito('MANCATA!', '#ff6b5a');
    this.scartaAltre(P);
    const scena = x ? this.cfg.ballate[x.id.split(':')[0]].strofe[x.id.split(':')[1]].scena : null;
    this.k2.setText(scena ? `...${scena}?!` : '...?!').setColor('#ff6b5a');
    this.k2acceso.setText('');
    this.adatta(this.k2);
    this.posaPer('lori_stona', 0.9);
    this.aggiornaAccendini();
    this.time.delayedCall(180, () => { if (!this.finito) { Audio.sfx('fischi'); this.reagisci('fischi'); } });
    this.time.delayedCall(330, () => this.pomodoro());
  }

  // le altre vignette del verso, già deciso, volano via dal filo
  scartaAltre(P) {
    for (const y of P.carte) {
      if (y.stato) continue;
      y.stato = 'via';
      if (!y.img) continue;
      this.tweens.add({ targets: y.img, y: y.img.y - 30, alpha: 0, angle: (Math.random() - 0.5) * 50, duration: 360, ease: 'Quad.out', onComplete: () => this.via(y) });
    }
    if (P.carte.some((y) => y.img && y.stato === 'via')) Audio.sfx('volaVia');
  }

  via(x) { x.img?.destroy(); x.img = null; }

  esito(s, col) { scritta(this, B.faro, B.filo - 4, s, { size: 9, color: col, depth: 971, durata: 380 }); }

  // ---------- il karaoke ----------
  karaoke(testa, r1, r2) {
    this.kTesta.setText(testa);
    this.k1.setText(r1).setColor('#9aa4d8'); this.k1acceso.setText('').setColor('#ffe14a');
    this.k2.setText(r2).setColor('#9aa4d8'); this.k2acceso.setText('').setColor('#7dff9a');
    this.adatta(this.k1, this.k2);
  }

  // (le righe lunghe si stringono un po' per stare nello schermo)
  adatta(...tt) { for (const t of tt) t.setScale(Math.min(1, (B.schermo.w - 6) / Math.max(1, t.width))); }

  // la parte "accesa" di una riga (0..1), parola per parola come al karaoke: una seconda scritta
  // colorata con le prime parole, sopra la riga, allineata a sinistra
  accendi(t, base, k) {
    const parole = base.text.split(' '), s = parole.slice(0, Math.ceil(Phaser.Math.Clamp(k, 0, 1) * parole.length)).join(' ');
    if (t.text !== s) t.setText(s);
    t.setOrigin(0, 0.5).setScale(base.scaleX).setPosition(base.x - base.displayWidth / 2, base.y);
  }

  // all'inizio di ogni parte: lo schermo, l'annuncio degli atti, il fumetto d'aiuto
  nuovaParte(P) {
    const c = this.cfg, prima = this.parti.find((Q) => Q.atto === P.atto && Q.tipo !== 'intro');
    if (P === prima && P.tipo !== 'fine') {
      Audio.sfx('bonus');
      scritta(this, 300, 152, c.atti[P.atto].nome, { size: 13, color: '#ffe14a', durata: 900, depth: 966 });
      this.time.delayedCall(450, () => { if (!this.finito) scritta(this, 300, 168, c.ballate[this.storie[P.atto]].titolo.toUpperCase(), { size: 9, color: ROSA, durata: 900, depth: 966 }); });
    }
    this.aiuto.setVisible(false);
    if (P.tipo === 'strofa') {
      this.karaoke('♪ ' + c.ballate[P.storia].titolo.toUpperCase() + ' ♪', P.s.inizio, '♪  . . .  ♪');
      if (P.k < c.aiuto) {
        const g = P.carte.find((x) => x.giusta);
        this.iconaAiuto.setTexture(this.tex[g.id]).setScale(scalaDi(this.tex[g.id], 0.8));
        this.aiuto.setVisible(true).setScale(0.3);
        this.tweens.add({ targets: this.aiuto, scale: 1, duration: 160, ease: 'Back.out' });
      }
    } else if (P.tipo === 'rit') {
      this.karaoke('♪ TUTTI INSIEME! ♪', c.ritornello, 'Batti le mani!');
      this.k1.setColor('#c08ab0'); this.k1acceso.setColor('#ff9ad8');
    } else { this.karaoke(...KARAOKE[P.tipo]); this.k1.setColor('#ffffff'); this.k2.setColor('#ffe14a'); }
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    // dove siamo nella canzone (in ottavi): il proprio orologio, agganciato all'audio quando c'è
    // (se l'audio parte a partita già cominciata, si porta la musica al punto giusto)
    const dur = this.parteA(this.pos).du;
    this.pos += dt / dur;
    const ap = Audio.posizione;
    if (ap != null) {
      if (this.offsetAudio == null) {
        if (Math.abs(ap - this.pos) > 1) Audio.vaiA(this.pos);
        this.offsetAudio = Math.abs(ap - this.pos) > 1 ? 0 : ap - this.pos;
      } else this.pos += (ap - this.offsetAudio - this.pos) * Math.min(1, dt * 3);
    }
    // quello che si sente adesso (il ritardo audio delle Impostazioni: cuffie Bluetooth)
    this.posVis = this.pos - Audio.ritardo / dur;
    const pv = this.posVis;
    this.oraFrame = performance.now();

    const P = this.parteA(pv);
    if (P !== this.parteOra) { this.parteOra = P; this.nuovaParte(P); }
    // il karaoke: le parole si accendono mentre Lori canta (o il pubblico, nel ritornello)
    if (P.tipo === 'strofa') {
      this.accendi(this.k1acceso, this.k1, (pv - P.da + 0.5) / 7);
      if (P.esito === 'giusto') this.accendi(this.k2acceso, this.k2, (pv - P.decisa + 0.3) / Math.max(1, P.da + 15 - P.decisa));
    } else if (P.tipo === 'rit') this.accendi(this.k1acceso, this.k1, (pv - P.da + 0.5) / 7);

    // i battiti: Lori dà la pennata, il faro pulsa, nel ritornello il pubblico ondeggia
    const bt = Math.floor(pv / 2);
    if (bt !== this.battito) {
      this.battito = bt;
      if (pv >= 0) this.pennata();
      if (P.tipo === 'rit') this.pubblico.forEach((m, i) => this.tweens.add({ targets: m.img, angle: (bt + i) % 2 ? 4 : -4, duration: 140 }));
      else if (P.tipo === 'strofa') this.pubblico.forEach((m) => m.img.angle && this.tweens.add({ targets: m.img, angle: 0, duration: 140 }));
    }
    if (this.posaFissa && this.trascorso >= this.posaFino) { this.posaFissa = null; this.mettiPosa('lori_canta'); }

    // le vignette e le manine sul filo: entrano da destra e saltellano a tempo verso il faro
    const F = this.cfg.finestre, ora = this.secondoDi(pv);
    for (const x of this.cose) {
      if (x.stato && x.stato !== 'passata') continue;
      const X = B.faro + (x.t - pv) * x.vel;
      if (X > PARTENZA + 10) break;
      if (!x.img) this.creaCosa(x);
      const salto = -2.6 * Math.abs(Math.sin((Math.PI * pv) / 2));
      x.img.setPosition(X, Y_CARTA + salto).setAngle(Math.sin(pv * 0.8 + x.t) * 3);
      if (x.stato === 'passata') {
        x.img.setAlpha(Phaser.Math.Clamp((X - (B.faro - 70)) / 40, 0, 1));
        if (X < B.faro - 70) { x.stato = 'finita'; this.via(x); }
        continue;
      }
      // passata senza prenderla
      if (ora - this.secondoDi(x.t) > F.bene) {
        if (x.tipo === 'carta' && x.giusta && !x.parte.esito) {
          x.stato = 'persa';
          this.versoStonato(x.parte, null);
          this.tweens.add({ targets: x.img, y: 300, angle: -60, alpha: 0.6, duration: 700, ease: 'Quad.in', onComplete: () => this.via(x) });
          x.img.list.forEach((o) => o.setTint?.(0x888888));
        } else x.stato = 'passata';
      }
    }
    this.disegnaFaro(pv);
    this.cantaLori(pv);
    // la fine della canzone (poco dopo l'ultima strofa)
    if (pv >= this.fineCanzone) { this.termina(); return; }
    // l'HUD (solo quando cambia)
    const hud = `${Math.round(this.punti)}|${this.giuste}|${this.serie}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(this.punti));
      this.testoVersi.setText(`VERSI: ${this.giuste}/${this.obiettivo}`).setColor(this.giuste >= this.obiettivo ? '#7dff9a' : '#ffe14a');
      this.testoSerie.setText(this.serie >= 2 ? `SERIE x${this.serie}` : '');
    }
  }

  // una vignetta (con la molletta) o una manina, appesa al filo
  creaCosa(x) {
    const parti = [];
    if (x.tipo === 'carta') {
      const ombra = this.add.rectangle(2, 3, B.carta.w, B.carta.h, 0x000000, 0.3);
      parti.push(ombra, im(this, 0, 0, this.tex[x.id]), im(this, 0, -B.carta.h / 2 - 1, 'molletta'));
    } else parti.push(im(this, 0, -B.carta.h / 2 + 22, 'battimani'), im(this, 0, -B.carta.h / 2 - 1, 'molletta'));
    x.img = this.add.container(PARTENZA, Y_CARTA, parti).setDepth(20);
  }

  // il faro: la cornice d'oro dove si prendono le vignette. Pulsa sui battiti, e brilla quando c'è
  // qualcosa da prendere dentro il tempo
  disegnaFaro(pv) {
    const g = this.gFaro.clear(), w = B.carta.w + 10, h = B.carta.h + 10, x = B.faro - w / 2, y = Y_CARTA - h / 2;
    const k = 1 - (((pv % 2) + 2) % 2) / 2, ora = this.secondoDi(pv);
    const dentro = this.cose.some((c) => !c.stato && Math.abs(this.secondoDi(c.t) - ora) <= this.cfg.finestre.bene);
    g.fillStyle(0xfff4c8, 0.08 + 0.1 * k + (dentro ? 0.12 : 0)).fillRoundedRect(x, y, w, h, 6);
    g.lineStyle(dentro ? 3.2 : 2.2, dentro ? 0xffffff : GIALLO, 0.55 + 0.45 * k).strokeRoundedRect(x, y, w, h, 6);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.fillStyle(GIALLO, 1).fillCircle(B.faro + (sx * w) / 2, Y_CARTA + (sy * h) / 2, 2.4);
    this.coni[1].setAlpha(0.22 + 0.18 * k + (dentro ? 0.15 : 0));
  }

  // la voce 8-bit di Lori (la prima battuta della strofa sempre; la seconda solo se il verso è
  // giusto, stonata se è sbagliato) e il pubblico che canta il ritornello (due voci, a terze)
  cantaLori(pv) {
    if (this.finito) return;
    const ap = Audio.posizione;
    if (ap == null) return;
    const P = this.parteA(pv), passo = Math.floor(ap), fra = ap - passo;
    const nota = (campo) => {
      let n = Audio.notaCanto(passo, campo), dentro = fra < 0.78;
      if (!n) { n = Audio.notaCanto(passo - 1, campo); dentro = fra < 0.5; }
      return n && dentro ? n : 0;
    };
    let n = 0, stona = false;
    if (P.tipo === 'strofa') {
      const secondaBattuta = pv - P.da >= 8;
      if (!secondaBattuta || P.esito === 'giusto') n = nota('voce');
      else if (P.esito === 'stonato') { n = nota('voce'); stona = true; }
    }
    if (n) Audio.voce('lori', { freq: hz(n - 12) * (stona ? 2 ** ((-0.7 + Math.sin(this.trascorso * 9) * 0.5) / 12) : 1), vol: 0.85, vibrato: stona ? 60 : 22, vibratoHz: 5.5, tipo: 'square', taglio: 1500, crepa: stona ? 0.8 : 0 });
    else Audio.voce('lori', null);
    const c1 = P.tipo === 'rit' ? nota('coro') : 0, c2 = P.tipo === 'rit' ? nota('coro2') : 0;
    Audio.voce('coro1', c1 ? { freq: hz(c1 - 12), vol: 0.5, vibrato: 30, vibratoHz: 5, tipo: 'sawtooth', taglio: 1100 } : null);
    Audio.voce('coro2', c2 ? { freq: hz(c2 - 12), vol: 0.4, vibrato: 30, vibratoHz: 4.6, tipo: 'sawtooth', taglio: 900 } : null);
  }

  mettiPosa(k) {
    if (this.posa === k) return;
    this.posa = k;
    this.lori.setTexture(k).setScale(scalaDi(k, TAGLIA_LORI));
  }

  // una posa che resta per un po' (contento, stonato), poi si torna a strimpellare
  posaPer(k, s) { this.posaFissa = k; this.posaFino = this.trascorso + s; this.mettiPosa(k); }

  // il pubblico: OOOH (contenti, un saltino) o fischi (le facce scocciate)
  reagisci(tipo) {
    if (this.finito) return;
    this.pubblico.forEach((m, i) => {
      m.img.setTexture(`${m.id}_${tipo === 'oooh' ? 'felice' : 'sufficienza'}`);
      this.tweens.add({ targets: m.img, y: B.piediPubblico - (tipo === 'oooh' ? 6 : 1), duration: 110, delay: i * 30, yoyo: true });
    });
    if (tipo !== 'oooh' || Math.random() < 0.5) {
      const m = caso(this.pubblico);
      fumetto(this, m.x, B.tavola - 46, caso(tipo === 'oooh' ? this.cfg.frasiGiusta : this.cfg.frasiFischi), 800, 962);
    }
    this.time.delayedCall(1000, () => { if (!this.finito) this.pubblico.forEach((m) => m.img.setTexture(`${m.id}_normale`)); });
  }

  // gli accendini: con la serie se ne accendono due a verso giusto; uno sbaglio li spegne
  aggiornaAccendini() {
    const voluti = Math.min(this.pubblico.length, Math.max(0, (this.serie - 1) * 2));
    if (voluti > this.accesi) Audio.sfx('accendino');
    this.pubblico.forEach((m, i) => {
      const acceso = i < voluti;
      if (acceso && !m.acc.visible) {
        m.acc.setVisible(true).setAlpha(0).setY(B.tavola - 20);
        this.tweens.add({ targets: m.acc, alpha: 1, y: B.tavola - 30, duration: 220, delay: (i % 2) * 80 });
        m.ondeggia = this.tweens.add({ targets: m.acc, angle: { from: -10, to: 10 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 90 });
      } else if (!acceso && m.acc.visible) {
        m.ondeggia?.remove(); m.ondeggia = null;
        this.tweens.add({ targets: m.acc, alpha: 0, y: B.tavola - 22, duration: 200, onComplete: () => m.acc.setVisible(false).setAngle(0) });
      }
    });
    if (voluti >= 4 && this.accesi < 4) scritta(this, 300, 186, 'ACCENDINI!', { size: 10, color: '#ffcf6a', durata: 700, depth: 966 });
    this.accesi = voluti;
  }

  // un pomodoro dal pubblico, su Lori
  pomodoro(forza = false) {
    if (this.finito && !forza) return;
    const m = caso(this.pubblico), da = { x: m.x, y: B.tavola - 30 }, a = { x: B.lori.x - 8 + Math.random() * 18, y: B.lori.y - 92 + Math.random() * 26 };
    const t = im(this, da.x, da.y, 'pomodoroLancio', 1).setDepth(980);
    Audio.sfx('lancio');
    this.tweens.addCounter({
      from: 0, to: 1, duration: 420, onUpdate: (tw) => {
        const u = tw.getValue();
        t.setPosition(lerp(da.x, a.x, u), lerp(da.y, a.y, u) - Math.sin(u * Math.PI) * 50).setAngle(u * 400);
      }, onComplete: () => {
        t.destroy();
        Audio.sfx('splat');
        const s = im(this, a.x, a.y, 'schizzoPomodoro', 1).setDepth(981).setAngle(Math.random() * 40 - 20);
        this.tweens.add({ targets: s, alpha: 0, delay: 500, duration: 300, onComplete: () => s.destroy() });
      },
    });
  }

  risultato() {
    const bis = this.giuste === this.n && !this.corta;
    if (bis) this.punti += this.cfg.punti.bis;
    return {
      punteggio: Math.round(this.punti),
      vittoria: this.giuste >= this.obiettivo,
      riepilogo: `Versi giusti ${this.giuste} su ${this.n}, serie max ${this.serieMax}, mani ${this.mani}/${this.maniTot}${bis ? ', BIS!' : ''}`,
      titoli: ['BIS! BIS!', 'TUTTI A CASA!'],
    };
  }

  // Vittoria: l'inchino di Lori, il pubblico in piedi con tutti gli accendini, gli applausi.
  // Sconfitta: il pubblico se ne va scocciato, la pioggia di pomodori, Lori si ripara.
  finale(ris, fatto) {
    Audio.vociZitte();
    for (const o of [this.aiuto, this.testoPunti, this.testoVersi, this.testoSerie]) o.setVisible(false);
    for (const x of this.cose) if (x.img) this.tweens.add({ targets: x.img, alpha: 0, duration: 200 });
    this.posaFissa = 'fine';
    Audio.sfx('tempo');
    const titolo = (s, col) => txt(this, 300, 150, s, { size: 22, color: col, depth: 990 });
    this.time.delayedCall(350, () => {
      if (ris.vittoria) {
        Audio.sfx('vittoria');
        titolo(ris.titoloFine ?? 'BIS! BIS!', '#7dff9a');
        this.karaoke('♪ BIS! BIS! ♪', 'E vissero tutti felici e contenti!', '');
        this.mettiPosa('lori_inchino');
        this.tweens.add({ targets: this.lori, y: B.lori.y + 3, scaleY: this.lori.scaleY * 0.93, angle: 6, duration: 260, delay: 200, yoyo: true, hold: 300, repeat: 1 });
        this.serie = 99; this.aggiornaAccendini();
        this.pubblico.forEach((m, k) => {
          m.img.setTexture(`${m.id}_felice`);
          this.tweens.add({ targets: [m.img, m.acc], y: `-=10`, duration: 220, delay: k * 60, ease: 'Back.out' });
        });
        for (let k = 0; k < 5; k++) this.time.delayedCall(k * 380, () => Audio.sfx('applauso'));
        stelle(this, 300, 150, 10, 989);
        this.time.delayedCall(700, () => stelle(this, B.lori.x, B.lori.y - 90, 8, 989));
      } else {
        Audio.sfx('sconfitta');
        titolo(ris.titoloFine ?? 'TUTTI A CASA!', '#ff6b5a');
        this.karaoke('♪ ... ♪', 'Il pubblico non capisce l\'arte.', '');
        this.serie = 0; this.aggiornaAccendini();
        this.pubblico.forEach((m, k) => {
          m.img.setTexture(`${m.id}_sufficienza`);
          this.tweens.add({ targets: m.img, x: m.x + 200, alpha: 0, delay: 300 + k * 120, duration: 900, ease: 'Sine.in' });
        });
        Audio.sfx('buu');
        this.mettiPosa('lori_ripara');
        for (let k = 0; k < 5; k++) this.time.delayedCall(k * 170, () => this.pomodoro(true));
      }
    });
    this.time.delayedCall(3300, fatto);
  }
}
