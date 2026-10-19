// Microgioco 14: "L'Incubo degli Scapoli" - sfida di ballo contro il Manna. BALLA!
//
//  Come Just Dance. La pista vista di fronte: tu a sinistra, il Manna a destra, lo Zio DJ in fondo
//  e le cinque ragazze del Manna che guardano. In basso scorrono le schede delle mosse (i
//  pittogrammi: braccia al cielo, giù, a sinistra, a destra, battimani), a tempo di musica, verso
//  il riquadro a sinistra: quando una ci entra si fa la mossa. FRECCE (o WASD) e SPAZIO; col dito
//  si striscia come la freccia e si tocca per battere le mani (col mouse lo stesso: trascinare e
//  cliccare). Il tuo personaggio fa la mossa che fai tu; il Manna, a tempo, quella giusta.
//  PERFETTO, BUONO o MANCATA (anche la mossa sbagliata); le mosse giuste di fila sono la serie, che
//  moltiplica i punti, e i punti ti portano via le ragazze del Manna una alla volta (la terza è
//  il bronzo, la quarta l'argento, la quinta l'oro). Niente di quello che hai preso si perde.
//  Tre atti: si comincia piano (una mossa ogni due battiti, con le pause), poi senza pause e con le
//  mosse d'oro (valgono doppio), alla fine il Manna si scatena, la musica accelera e le mosse
//  arrivano anche a due a due. La coreografia è scritta a frasi nella configurazione (la griglia
//  delle mosse) ed è la stessa per tutti i giocatori del round (seme del round): conta l'abilità.
//  Il tempo è quello della musica (Audio.posizione); senza audio si va col proprio orologio.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { casuale, RES } from '../grafica/base.js';
import { PALCO, COLORI_MOSSE, SCHEDA } from '../grafica/palco.js';
import { PERSONAGGI } from '../grafica/personaggi.js';
import { preparaBallo, preparaPosa, preparaFigura } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, scuoti, lerp, caso, quanti, perDito, vibra, multiTouch, puntatore, fumetto, puntiHud, numero } from '../fx.js';

const BPM = 132;                               // la musica 'pista' (audio.js)
const TASTI = { ARROWLEFT: 'sx', A: 'sx', ARROWRIGHT: 'dx', D: 'dx', ARROWUP: 'su', W: 'su', ARROWDOWN: 'giu', S: 'giu', ' ': 'batti' };
// le pose delle mosse (js/grafica/personaggi.js, POSE): a sinistra e a destra anche con la gamba di lato
const POSE_MOSSE = {
  su: { posa: 'mossaSu' }, giu: { posa: 'mossaGiu' }, batti: { posa: 'mossaBatti' },
  sx: { posa: 'mossaSx', calcio: { lato: -1, angolo: 0.42 } }, dx: { posa: 'mossaDx', calcio: { lato: 1, angolo: 0.42 } },
};
const ZONA = { x: 48, y: 245 };                // il riquadro dove arrivano le schede
const STRISCIA = 221;                          // dove comincia la striscia delle schede, in basso
const PIX_PASSO = 19;                          // quanto scorre una scheda in un passo (un ottavo): due di fila non si toccano
const PIEDI = 220;                             // i piedi di chi balla, appena sopra la striscia
const X_IO = 150, X_MANNA = 330;
const N_RAGAZZE = 5;
const TAGLIA = 0.72, TAGLIA_RAGAZZA = 0.4;
const Y_RAGAZZE = 152;                         // le ragazze guardano da dietro, ai lati della consolle
// i posti delle ragazze: dalla mia parte (la prima conquistata mi sta accanto) o da quella del Manna
const lato = (mia, k) => (mia ? 112 - k * 23 : 460 - (N_RAGAZZE - 1 - k) * 23);
const MEDAGLIE = [null, null, null, ['BRONZO!', '#e8a060'], ['ARGENTO!', '#e6ecf4'], ['ORO!', '#ffe14a']];

// La coreografia: le mosse { passo, mossa, oro, atto }, sui battiti (passi pari) della musica.
// Prima l'attacco, poi frasi di due battute pescate dal mazzo dell'atto (seme del round), a volte
// allo specchio, mai la stessa due volte di fila; finché c'è tempo (durata: in Lampo è più corta,
// e gli atti si stringono in proporzione). L'atto di una frase è quello del suo primo battito.
export function coreografia(c, seme, durata) {
  const rnd = casuale(seme), ultimo = c.atti[c.atti.length - 1].da, scala = durata / c.durata;
  // il secondo (da inizio partita) di ogni passo, con la musica che accelera come in tempoMusica()
  const tempoA = (t) => (t < ultimo ? 1 : lerp(1, c.tempoFinale, Math.min(1, (t - ultimo) / (c.durata - ultimo))));
  const T = [];
  for (let t = 0, pos = -c.primoPasso; t < durata + 1; t += 0.004) {
    const prima = pos;
    pos += 0.004 / (60 / (BPM * tempoA(t)) / 2);
    if (Math.floor(pos) > Math.floor(prima) && pos >= 0) T[Math.floor(pos)] = t + 0.004;
  }
  const fine = durata - 0.6, note = [];
  let passo = 0, ultima = null;
  const metti = (frase, atto, specchio) => {
    const battiti = frase.trim().split(/\s+/);
    battiti.forEach((b, k) => {
      const p = passo + k * 2;
      if (b === '-' || !(T[p] <= fine)) return;
      let mossa = b.replace('*', '');
      if (specchio) mossa = { sx: 'dx', dx: 'sx' }[mossa] ?? mossa;
      note.push({ passo: p, mossa, oro: b.endsWith('*'), atto });
    });
    passo += battiti.length * 2;
  };
  metti(c.attacco, 0, false);
  while (T[passo] <= fine) {
    const atto = c.atti.filter((a) => T[passo] >= a.da * scala).length - 1;
    const mazzo = c.mazzi['atto' + (atto + 1)];
    let frase = mazzo[Math.floor(rnd() * mazzo.length)];
    if (frase === ultima) frase = mazzo[(mazzo.indexOf(frase) + 1) % mazzo.length];
    ultima = frase;
    metti(frase, atto, rnd() < 0.5);
  }
  return note;
}

export class ScapoliScene extends MicrogiocoBase {
  constructor() { super('scapoli'); }

  // la musica: normale, poi nell'ultimo atto accelera fino a tempoFinale (MicrogiocoBase la usa)
  tempoMusica() {
    const c = this.cfg, da = c.atti[c.atti.length - 1].da;
    return this.trascorso < da ? 1 : lerp(1, c.tempoFinale, Math.min(1, (this.trascorso - da) / (c.durata - da)));
  }
  durPasso() { return 60 / (BPM * this.tempoMusica()) / 2; }

  prepara() {
    const c = this.cfg;
    im(this, 0, 0, 'bgPalco').setOrigin(0);
    this.dj = im(this, 240, PALCO.consolle + 10, 'zioDJ', 0.42).setOrigin(0.5, 1).setDepth(2);
    im(this, 240, PALCO.consolle + 10, 'consollePalco').setDepth(3);
    txt(this, 240, PALCO.consolle + 13, 'ZIO DJ', { size: 6, color: '#3bd0ff', thick: 0, depth: 4 });

    // le pose delle mosse, create adesso (e buttate alla fine): le mie (col costume del Bancone; il
    // doppione travestito) e quelle del Manna (come le sue altre figure, senza costume)
    const id = this.giocatore.id, base = id.replace(DOPPIONE, '');
    this.posePronte = [];
    for (const [m, o] of Object.entries(POSE_MOSSE)) {
      preparaPosa(this, `${id}_mossa_${m}`, base, 'felice', o, RES, id === base ? {} : { travestimento: true });
      preparaFigura(this, `manna_mossa_${m}`, PERSONAGGI.manna, 'normale', o);
      this.posePronte.push(`${id}_mossa_${m}`, `manna_mossa_${m}`);
    }
    preparaBallo(this, id);
    // io e il Manna (base: dove stanno fermi, per rimetterli a posto dopo ogni mossa)
    const ballerino = (x, key) => {
      const img = im(this, x, PIEDI, key, TAGLIA).setOrigin(0.5, 1).setDepth(20);
      img.base = { x, y: PIEDI, s: img.scaleX };
      img.fino = 0;          // fino a quando resta nella posa (o nella faccia) di adesso
      return img;
    };
    this.io = ballerino(X_IO, `${id}_normale`);
    this.manna = ballerino(X_MANNA, 'manna_balla1');
    this.passoBallo = 0;

    // le cinque ragazze, tutte col Manna; vengono da me una alla volta (vedi conquista)
    this.ragazze = Phaser.Utils.Array.Shuffle([0, 1, 2, 3, 4]).map((t, k) => ({
      t, mia: false, img: im(this, lato(false, k), Y_RAGAZZE, `tipa${t}_normale`, TAGLIA_RAGAZZA).setOrigin(0.5, 1).setDepth(10).setFlipX(true),
    }));
    this.vinte = 0;
    // le soglie dei punti per ogni ragazza (in Lampo, più corto, in proporzione)
    this.lampo = Sessione.tipo === 'lampo';
    this.soglie = c.soglieRagazze.map((s) => s * (this.lampo ? c.scalaLampo : 1));

    // la striscia in basso, coi battiti segnati, e il riquadro
    const g = this.striscia = this.add.graphics().setDepth(900);
    g.fillStyle(0x0a0518, 0.78); g.fillRect(0, STRISCIA, 480, 270 - STRISCIA);
    g.fillStyle(0xff3b9a, 1); g.fillRect(0, STRISCIA, 480, 1.5);
    g.fillStyle(0x3bd0ff, 0.35); g.fillRect(0, 268.5, 480, 1.5);
    this.tacche = this.add.graphics().setDepth(901);
    this.zona = im(this, ZONA.x, ZONA.y, 'zonaBallo').setDepth(902);
    this.bagliore = this.add.rectangle(ZONA.x, ZONA.y, SCHEDA.w + 2, SCHEDA.h + 2, 0xffffff, 0).setDepth(906).setBlendMode(Phaser.BlendModes.ADD);
    this.testoSerie = txt(this, ZONA.x, STRISCIA - 9, '', { size: 7, color: '#ffe14a', depth: 960 });

    // l'HUD: le ragazze (cinque caselle: quelle piene sono mie), i punti, il moltiplicatore
    this.barraRagazze = this.add.graphics().setDepth(1000);
    this.etichette = [txt(this, 146, 26, 'TU', { size: 8, color: this.giocatore.colore, depth: 1001, ox: 1 }), txt(this, 334, 26, 'MANNA', { size: 8, color: '#f6c63a', depth: 1001, ox: 0 })];
    this.testoPunti = txt(this, 474, 36, '', { size: 9, ox: 1, depth: 1001 });
    // all'inizio, come si fa (sparisce dopo i primi secondi: vedi aggiorna)
    this.aiuto = txt(this, 240, 52, perDito('FRECCE o SPAZIO quando la scheda entra nel riquadro', 'STRISCIA come la freccia, TOCCA per le mani'), { size: 8, color: '#ffffff', depth: 1001 });

    // la coreografia: uguale per tutti i giocatori del round
    this.note = coreografia(c, Sessione.seme, this.durata);
    this.prossima = 0;                         // la prima mossa che non ha ancora la sua scheda
    this.pos = -c.primoPasso;                  // dove siamo, in passi (si parte una battuta prima della prima mossa)
    this.oraPos = performance.now();           // quando si è calcolato pos (per i gesti tra un fotogramma e l'altro)
    this.offsetAudio = null;
    this.atti = c.atti.map((a) => a.da * (this.durata / c.durata));
    this.punti = 0; this.serie = 0; this.serieMax = 0; this.perfetti = 0; this.buoni = 0; this.mancate = 0;
    this.atto = 0;
    this.tFrase = 5;
    this.ultimoBattito = -1;
    this.dita = {};                            // i tocchi in corso: un tocco o una strisciata?

    // comandi: tastiera; dito o mouse (strisciare = una freccia, toccare = le mani; più dita insieme).
    // (Phaser, se due tasti arrivano nello stesso fotogramma, ripassa anche quelli di prima: ogni
    // pressione deve contare una volta sola, se no la seconda rompe la serie)
    const visti = new WeakSet();
    this.input.keyboard.on('keydown', (e) => {
      const m = TASTI[e.key.toUpperCase()];
      if (e.repeat || !m || visti.has(e)) return;
      visti.add(e);
      this.gesto(m, this.posA(e.timeStamp));
    });
    multiTouch(this, 3);
    this.input.on('pointerdown', (p) => {
      if (!this.inCorso) return;
      const q = puntatore(this, p);
      this.dita[p.id] = { x: q.x, y: q.y, pos: this.posA(p.downTime), ora: performance.now() };
    });
    this.input.on('pointermove', (p) => {
      const d = this.dita[p.id];
      if (!d || !this.inCorso) return;
      const q = puntatore(this, p), dx = q.x - d.x, dy = q.y - d.y;
      if (Math.hypot(dx, dy) < c.sogliaStriscia) return;
      delete this.dita[p.id];
      this.gesto(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'sx' : 'dx') : dy < 0 ? 'su' : 'giu', this.posA(p.moveTime));
    });
    // un tocco (senza strisciare): battimani, col tempo di quando il dito è sceso
    const su = (p) => { const d = this.dita[p.id]; if (!d) return; delete this.dita[p.id]; this.gesto('batti', d.pos); };
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, su);
    this.aggiornaHud();
  }

  // dopo la pausa i rilasci non arrivano: i tocchi in corso si dimenticano
  alRientro() { this.dita = {}; }

  // dov'era la musica (in passi) nell'istante ts di un tasto o di un tocco: pos è quello dell'ultimo
  // fotogramma, più il pezzetto di tempo da allora (sui telefoni lenti un fotogramma è tanto)
  posA(ts) {
    // (un orologio che non torna, come i vecchi browser che danno l'ora vera: niente correzione)
    const d = (ts || performance.now()) - this.oraPos, dt = Math.abs(d) < 1000 ? Phaser.Math.Clamp(d / 1000, -0.06, 0.06) : 0;
    return this.pos + dt / this.durPasso();
  }

  moltiplicatore() { const c = this.cfg; return Math.min(c.maxMoltiplicatore, 1 + Math.floor(Math.max(0, this.serie - 1) / c.ogniSerie) * 0.5); }

  aggiornaHud() {
    const b = this.barraRagazze, x0 = 150, W = 180, w = W / N_RAGAZZE;
    // quanto manca alla prossima ragazza: la casella si riempie piano
    const da = this.soglie[this.vinte - 1] ?? 0, a = this.soglie[this.vinte];
    const pieno = this.vinte + (a ? Phaser.Math.Clamp((this.punti - da) / (a - da), 0, 1) : 0);
    b.clear();
    b.fillStyle(0x1f1430, 0.9); b.fillRoundedRect(x0 - 2, 21, W + 4, 10, 5);
    b.fillStyle(0xf6c63a, 1); b.fillRoundedRect(x0, 23, W, 6, 3);
    b.fillStyle(Phaser.Display.Color.HexStringToColor(this.giocatore.colore).color, 1);
    if (pieno > 0.02) b.fillRoundedRect(x0, 23, w * pieno, 6, Math.min(3, (w * pieno) / 2));
    // le tacche delle ragazze: la terza, la quarta e la quinta coi colori delle medaglie
    for (let k = 1; k <= N_RAGAZZE; k++) {
      const x = x0 + w * k - (k === N_RAGAZZE ? 3 : 0), col = [0xff9ac4, 0xff9ac4, 0xff9ac4, 0xd9893a, 0xd6dde6, 0xffd83a][k];
      b.fillStyle(0x1f1430, 1); b.fillCircle(x, 26, 4.2);
      b.fillStyle(col, k <= this.vinte ? 1 : 0.25); b.fillCircle(x, 26, 3.1);
    }
    const molt = this.moltiplicatore();
    this.testoPunti.setText(puntiHud(this.punti) + (molt > 1 ? `  x${numero(molt, 1)}` : ''));
    this.testoSerie.setText(this.serie >= 2 ? `SERIE ${this.serie}` : '');
  }

  // Un gesto (tasto, strisciata o tocco) all'istante pos della musica. Chi gioca fa sempre la mossa;
  // poi conta la mossa più vicina nel tempo, se è abbastanza vicina: giusta (perfetta o buona) o
  // sbagliata (mancata). Lontano da tutte: a vuoto, la serie riparte (pestare a caso non conviene).
  gesto(mossa, pos) {
    if (!this.inCorso) return;
    const f = this.cfg.finestre, dur = this.durPasso();
    this.balla(this.io, mossa, `${this.giocatore.id}_mossa_${mossa}`);
    let scelta = null, errore = Infinity;
    for (const n of this.note) {
      if (n.fatta) continue;
      const e = Math.abs(n.passo - pos) * dur;
      if (e < errore) { errore = e; scelta = n; }
      else if (n.passo > pos) break;
    }
    if (!scelta || errore > f.buono) return this.aVuoto();
    if (scelta.mossa !== mossa) return this.manca(scelta, 'SBAGLIATA!');
    this.prendi(scelta, errore <= f.perfetto ? 'perfetto' : 'buono');
  }

  aVuoto() {
    if (this.serie > 0) { this.serie = 0; this.aggiornaHud(); }
    this.io.setTint(0xffb0b0); this.time.delayedCall(90, () => this.io.clearTint());
  }

  prendi(n, voto) {
    const c = this.cfg;
    n.fatta = true;
    const prima = this.moltiplicatore();
    this.serie++; this.serieMax = Math.max(this.serieMax, this.serie);
    if (voto === 'perfetto') this.perfetti++; else this.buoni++;
    const molt = this.moltiplicatore();
    this.punti += (voto === 'perfetto' ? c.puntiPerfetto : c.puntiBuono) * (n.oro ? c.puntiOro : 1) * molt;
    Audio.sfx(n.oro ? 'bonus' : voto === 'perfetto' ? 'preso' : 'muovi');
    const col = n.oro ? '#ffe14a' : voto === 'perfetto' ? '#7dff9a' : '#9af0ff';
    scritta(this, X_IO, 104, n.oro ? (voto === 'perfetto' ? "ORO! PERFETTO" : 'ORO! BUONO') : voto === 'perfetto' ? 'PERFETTO!' : 'BUONO', { size: 10, color: col, durata: 260, depth: 960 }).setAngle(0);
    // la scheda esplode nel riquadro, che si illumina del colore della mossa
    if (n.img) { const img = n.img; n.img = null; img.x = ZONA.x; this.tweens.add({ targets: img, scale: img.scale * 1.45, alpha: 0, duration: 200, onComplete: () => img.destroy() }); }
    this.bagliore.setFillStyle(Phaser.Display.Color.HexStringToColor(n.oro ? '#ffe14a' : COLORI_MOSSE[n.mossa]).color, voto === 'perfetto' ? 0.7 : 0.4);
    this.tweens.killTweensOf(this.bagliore);
    this.tweens.add({ targets: this.bagliore, fillAlpha: 0, duration: 260 });
    if (voto === 'perfetto') stelle(this, ZONA.x, ZONA.y, n.oro ? 8 : 3, 950);
    if (n.oro) {
      stelle(this, X_IO, PIEDI - 60, 8, 950);
      scritta(this, 240, 96, "MOSSA D'ORO!", { size: 14, color: '#ffe14a', durata: 600 });
    }
    // il moltiplicatore sale: un annuncio
    if (molt > prima) {
      Audio.sfx('ok');
      scritta(this, ZONA.x + 30, STRISCIA - 22, `x${numero(molt, 1)}!`, { size: 11, color: '#ffe14a', durata: 500 });
    }
    this.conquista();
    this.aggiornaHud();
  }

  manca(n, perche) {
    n.fatta = true;
    this.mancate++;
    this.serie = 0;
    if (n.img) {
      const img = n.img; n.img = null;
      img.setTint(0x666677);
      this.tweens.add({ targets: img, x: img.x - 26, y: img.y + 8, alpha: 0, duration: 300, onComplete: () => img.destroy() });
    }
    scritta(this, X_IO, 104, perche, { size: 10, color: '#ff8a7a', durata: 260, depth: 960 }).setAngle(0);
    // mancata (senza gesto): chi gioca ci resta male; sbagliata: resta nella mossa che ha fatto
    if (perche === 'MANCATA') this.faccia(this.io, `${this.giocatore.id}_triste`, 0.35);
    Audio.sfx('errore');
    vibra(30);
    // (e il Manna, se non sta facendo una faccia, ogni tanto ti fa l'occhiolino)
    if (Math.random() < 0.3 && (!(this.manna.fino > this.trascorso) || this.manna.mossa)) this.faccia(this.manna, 'manna_occhiolino', 0.45);
    this.aggiornaHud();
  }

  // i punti passano una soglia: la ragazza lascia il Manna e viene da me (e non torna più)
  conquista() {
    while (this.vinte < N_RAGAZZE && this.punti >= this.soglie[this.vinte] - 1e-6) {
      const k = this.vinte++, r = this.ragazze[k];
      r.mia = true;
      r.cammina = true;
      r.img.setTexture(`tipa${r.t}_felice`).setFlipX(false);
      this.tweens.killTweensOf(r.img);
      r.img.y = Y_RAGAZZE;
      this.tweens.add({ targets: r.img, x: lato(true, k), duration: 900, ease: 'Sine.inOut', onComplete: () => { r.cammina = false; } });
      this.tweens.add({ targets: r.img, y: Y_RAGAZZE - 8, duration: 225, yoyo: true, repeat: 1, ease: 'Quad.out' });
      Audio.sfx('ding');
      stelle(this, lato(true, k), Y_RAGAZZE - 40, 5, 900);
      // la terza, la quarta e la quinta sono le medaglie (in Lampo le medaglie non contano)
      const med = MEDAGLIE[k + 1];
      scritta(this, 240, 78, `${quanti(k + 1, 'RAGAZZA', 'RAGAZZE')} CON TE!${med && !this.lampo ? '  ' + med[0] : ''}`, { size: 11, color: med && !this.lampo ? med[1] : '#ff9ac4', durata: 800 });
      // il Manna, nervoso, si tocca la collanina
      this.faccia(this.manna, 'manna_collana', 0.6);
    }
  }

  // un ballerino fa una mossa: la posa e un movimento (il saltino, l'accucciata, il passo di lato)
  balla(img, mossa, chiave) {
    const b = img.base, d = this.cfg.durataPosa;
    this.tweens.killTweensOf(img);
    img.setPosition(b.x, b.y).setScale(b.s).setAngle(0).setTexture(chiave);
    img.fino = this.trascorso + d;
    const via = (o) => this.tweens.add({ targets: img, yoyo: true, ease: 'Quad.out', ...o });
    if (mossa === 'su') via({ y: b.y - 8, duration: 120 });
    else if (mossa === 'giu') via({ scaleY: b.s * 0.9, scaleX: b.s * 1.06, duration: 130 });
    else if (mossa === 'sx' || mossa === 'dx') via({ angle: mossa === 'sx' ? -6 : 6, x: b.x + (mossa === 'sx' ? -4 : 4), duration: 160, ease: 'Sine.out' });
    else via({ scaleX: b.s * 1.05, scaleY: b.s * 1.05, duration: 80 });
  }

  faccia(img, key, sec) {
    this.tweens.killTweensOf(img);
    img.setPosition(img.base.x, img.base.y).setScale(img.base.s).setAngle(0).setTexture(key);
    img.mossa = false;
    img.fino = this.trascorso + sec;
  }

  // a riposo: chi gioca balla a tempo finché ha la serie (se no sta fermo), il Manna balla sempre
  riposo(img) {
    if (img === this.manna) return img.setTexture(this.passoBallo ? 'manna_balla2' : 'manna_balla1');
    img.setTexture(this.serie > 0 ? `${this.giocatore.id}_balla${this.passoBallo + 1}` : `${this.giocatore.id}_normale`);
  }

  aggiorna(dt) {
    const c = this.cfg, f = c.finestre, dur = this.durPasso();
    // dove siamo nella musica: il proprio orologio, tenuto agganciato all'audio quando c'è
    this.pos += dt / dur;
    const ap = Audio.posizione;
    if (ap != null) {
      // (col ritardo audio misurato nelle Impostazioni le mosse vanno a tempo con quello che si sente)
      const ritardo = Audio.ritardo / dur;
      // l'aggancio è a battute intere della musica (8 ottavi), così le mosse cadono sui suoi battiti
      // e le frasi cominciano con le sue battute (prima era al passo qualsiasi del primo fotogramma)
      if (this.offsetAudio == null) this.offsetAudio = Math.round((ap - ritardo - this.pos) / 8) * 8;
      this.pos += (ap - this.offsetAudio - ritardo - this.pos) * Math.min(1, dt * 3);
    }
    this.oraPos = performance.now();

    // l'atto: all'inizio di quelli nuovi, un annuncio
    const atto = this.atti.filter((da) => this.trascorso >= da).length - 1;
    if (atto !== this.atto) {
      this.atto = atto;
      Audio.sfx(atto === c.atti.length - 1 ? 'scatena' : 'bonus');
      scritta(this, 240, 120, c.atti[atto].nome, { size: 14, color: atto === c.atti.length - 1 ? '#ff6b9a' : '#ffe14a', durata: 900 });
      if (atto === c.atti.length - 1) { this.faccia(this.manna, 'manna_colpo', 1.2); scuoti(this, 300, 0.006); }
    }

    if (this.aiuto && this.trascorso > 5.5) { const a = this.aiuto; this.aiuto = null; this.tweens.add({ targets: a, alpha: 0, duration: 400, onComplete: () => a.destroy() }); }

    // un dito fermo da mezzo secondo senza strisciare: è un tocco (così la mossa non aspetta per sempre)
    const ora = performance.now();
    for (const [k, d] of Object.entries(this.dita)) if (ora - d.ora > 500) { delete this.dita[k]; this.gesto('batti', d.pos); }

    // le schede: entrano da destra e scorrono verso il riquadro; quelle passate sono mancate
    const vista = (480 + SCHEDA.w - ZONA.x) / PIX_PASSO;
    while (this.prossima < this.note.length && this.note[this.prossima].passo - this.pos < vista) {
      const n = this.note[this.prossima++];
      n.img = im(this, 480 + SCHEDA.w, ZONA.y, (n.oro ? 'schedaOro_' : 'scheda_') + n.mossa).setDepth(n.oro ? 904 : 903);
    }
    const dita = Object.values(this.dita);
    for (let i = 0; i < this.prossima; i++) {
      const n = this.note[i];
      // il Manna fa ogni mossa giusta, a tempo
      if (!n.delManna && this.pos >= n.passo) { n.delManna = true; if (!(this.manna.fino > this.trascorso) || this.manna.mossa) { this.balla(this.manna, n.mossa, `manna_mossa_${n.mossa}`); this.manna.mossa = true; } }
      if (n.fatta) continue;
      n.img.x = ZONA.x + (n.passo - this.pos) * PIX_PASSO;
      // (un dito ancora giù, sceso in tempo, può essere il tocco giusto: si aspetta che si alzi)
      if ((this.pos - n.passo) * dur > f.buono && !dita.some((d) => Math.abs(n.passo - d.pos) * dur <= f.buono)) this.manca(n, 'MANCATA');
    }
    // la prima volta che arrivano due mosse di fila, un avviso
    if (!this.vistaCoppia) {
      const k = this.note.findIndex((n, i) => i > 0 && i < this.prossima && n.passo - this.note[i - 1].passo <= 2 && n.img && n.img.x < 330);
      if (k > 0) { this.vistaCoppia = true; scritta(this, 240, 207, 'DUE DI FILA!', { size: 10, color: '#ffd6ff', durata: 900 }).setAngle(0); }
    }
    // i battiti sulla striscia: scorrono con le schede (quelli grossi sono le battute)
    const t = this.tacche;
    t.clear();
    for (let b = Math.ceil((this.pos - 3) / 2); b * 2 - this.pos < vista; b++) {
      const x = ZONA.x + (b * 2 - this.pos) * PIX_PASSO;
      t.fillStyle(0xffffff, b % 4 === 0 ? 0.55 : 0.25); t.fillCircle(x, STRISCIA + 4.5, b % 4 === 0 ? 1.6 : 1);
    }

    // a tempo: i ballerini a riposo, il DJ che muove la testa, il riquadro e le ragazze che saltellano
    const battito = Math.floor(this.pos / 2);
    if (battito !== this.ultimoBattito && this.pos >= -c.primoPasso) {
      this.ultimoBattito = battito;
      this.passoBallo = battito & 1;
      for (const img of [this.io, this.manna]) if (!(img.fino > this.trascorso)) this.riposo(img);
      const k = scalaDi('zioDJ', 0.42);
      this.dj.setScale(k * 1.03, k * 0.97);
      this.time.delayedCall(110, () => this.dj.setScale(k));
      this.zona.setScale(scalaDi('zonaBallo', 1.08));
      this.tweens.add({ targets: this.zona, scale: scalaDi('zonaBallo', 1), duration: 170 });
      for (const r of this.ragazze) if (!r.cammina && Math.random() < 0.3) this.tweens.add({ targets: r.img, y: { from: Y_RAGAZZE, to: Y_RAGAZZE - 3 }, duration: 90, yoyo: true });
    }
    // finita la posa (o la faccia), di nuovo a riposo
    for (const img of [this.io, this.manna]) if (img.fino && img.fino <= this.trascorso) { img.fino = 0; img.mossa = false; this.riposo(img); }

    // ogni tanto il Manna dice la sua
    this.tFrase -= dt;
    if (this.tFrase <= 0) { this.tFrase = 6 + Math.random() * 3; fumetto(this, X_MANNA, 104, caso(this.vinte >= 3 ? c.frasiMannaPerde : c.frasiManna), 1300, 800); }
  }

  pulisci() {
    // le pose delle mosse: prima le immagini, poi le texture
    this.io?.destroy(); this.manna?.destroy();
    for (const k of this.posePronte ?? []) if (this.textures.exists(k)) this.textures.remove(k);
  }

  risultato() {
    const c = this.cfg, mie = this.vinte;
    return {
      punteggio: Math.round(this.punti),
      vittoria: mie >= c.ragazzeVittoria,
      riepilogo: `${quanti(mie, 'ragazza', 'ragazze')} con te, ${quanti(this.perfetti, 'perfetta', 'perfette')}, ${quanti(this.buoni, 'buona', 'buone')}, serie max ${this.serieMax}`,
      titoli: ['CHE BALLERINO!', 'VINCE IL MANNA!'],
    };
  }

  // Vittoria: il Manna se ne va da solo, toccandosi la collanina; sconfitta: lui con le ragazze
  finale(ris, fatto) {
    for (const n of this.note) n.img?.setVisible(false);
    for (const o of [this.striscia, this.zona, this.tacche, this.bagliore, this.testoSerie, this.barraRagazze, this.testoPunti, ...this.etichette]) o.setVisible(false);
    // (i ballerini e le ragazze della pista lasciano il posto a quelli in grande del finale)
    for (const o of [this.io, this.manna, ...this.ragazze.map((r) => r.img)]) { this.tweens.killTweensOf(o); o.setVisible(false); }
    Audio.sfx('tempo');
    const buio = this.add.rectangle(0, 0, 480, 270, 0x05020c, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: buio, fillAlpha: 0.7, duration: 400 });
    const grande = (key, x, y, k) => im(this, x, y, key, k).setOrigin(0.5, 1).setDepth(705);
    const mie = this.ragazze.filter((r) => r.mia);
    this.time.delayedCall(500, () => {
      if (ris.vittoria) {
        Audio.sfx('vittoria');
        txt(this, 240, 26, 'IL MANNA TORNA A CASA DA SOLO!', { size: 14, color: '#7dff9a', depth: 710 });
        const io = grande(`${this.giocatore.id}_felice`, 240, 262, 0.95);
        this.tweens.add({ targets: io, y: 248, duration: 240, yoyo: true, repeat: -1, ease: 'Quad.out' });
        mie.forEach((r, k) => {
          const x = 240 + (k - (mie.length - 1) / 2) * 56 + (k < mie.length / 2 ? -40 : 40);
          const s = grande(`tipa${r.t}_felice`, x, 262, 0.7).setFlipX(x > 240).setDepth(704);
          this.tweens.add({ targets: s, y: 256, duration: 200 + k * 30, yoyo: true, repeat: -1 });
        });
        const solo = grande('manna_collana', 430, 262, 0.7).setDepth(703);
        this.tweens.add({ targets: solo, x: 520, delay: 900, duration: 1600, ease: 'Sine.in' });
      } else {
        Audio.sfx('sconfitta');
        txt(this, 240, 26, 'IL MANNA SI PRENDE LA PISTA', { size: 14, color: '#ff6b5a', depth: 710 });
        const lui = grande('manna_occhiolino', 240, 262, 0.95).setDepth(708);
        this.tweens.add({ targets: lui, scaleX: lui.scaleX * 1.04, duration: 300, yoyo: true, repeat: -1 });
        this.ragazze.filter((r) => !r.mia).forEach((r, k, tutte) => {
          const x = 240 + (k - (tutte.length - 1) / 2) * 50 + (k < tutte.length / 2 ? -45 : 45);
          grande(`tipa${r.t}_felice`, x, 262, 0.7).setFlipX(x > 240).setDepth(704);
        });
        const io = grande(`${this.giocatore.id}_triste`, 60, 262, 0.7).setDepth(706);
        this.tweens.add({ targets: io, x: 62, duration: 60, yoyo: true, repeat: -1 });
        fumetto(this, 240, 120, caso(this.cfg.frasiMannaVince), 2000, 712);
      }
    });
    this.time.delayedCall(3300, fatto);
  }
}
