// Suoni 8-bit e musichetta, tutto generato con la Web Audio API.

let ac = null, master = null, muto = false;
let contaPassi = 0;   // passi (ottavi) della musica pianificati dall'inizio del brano
// due canali, ognuno col suo volume (Impostazioni): la musica e gli effetti. "uscita" è dove
// suonano nota() e rumore() in quel momento: gli effetti, tranne mentre si pianifica la musica.
let busMusica = null, busEffetti = null, uscita = null, volMusica = 0.8, volEffetti = 0.8;
let traccia = null, timer = null, passo = 0, prossimo = 0, tempo = 1;
let pour = null;
// "Provini a X-Factor": la melodia guida (la dà il microgioco: passo -> { midi, passi } o niente),
// le voci continue dei cantanti (una per nome) e la canzone di questo provino (vedi suonaProvino)
let guida = null, brano = null;
const voci = {};

const midi = (n) => 440 * 2 ** ((n - 69) / 12);

function nota(f, t, d, tipo = 'square', v = 0.08, f2 = 0) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g); g.connect(uscita); // separati: sui Safari vecchi connect() non restituisce il nodo
  o.start(t);
  o.stop(t + d + 0.02);
}

let bufRumore = null;
function rumore(t, d, v = 0.15, freq = 2000, tipo = 'bandpass') {
  if (!bufRumore) {
    bufRumore = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const dati = bufRumore.getChannelData(0);
    for (let i = 0; i < dati.length; i++) dati[i] = Math.random() * 2 - 1;
  }
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = bufRumore;
  f.type = tipo;
  f.frequency.value = freq;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  s.connect(f); f.connect(g); g.connect(uscita);
  s.start(t, Math.random() * 0.5, d + 0.02);
}

const arp = (t, note, passoT = 0.07, d = 0.12, v = 0.08) => note.forEach((n, i) => nota(midi(n), t + i * passoT, d, 'square', v));

// Effetti sonori: nome -> funzione(t)
const SFX = {
  muovi: (t) => nota(660, t, 0.05, 'square', 0.05),
  scegli: (t) => arp(t, [76, 83]),
  bip: (t) => nota(520, t, 0.14, 'square', 0.09),
  via: (t) => { nota(1040, t, 0.35, 'square', 0.1); nota(1560, t, 0.35, 'square', 0.05); },
  ok: (t) => arp(t, [79, 83, 88], 0.05),
  errore: (t) => nota(220, t, 0.3, 'sawtooth', 0.1, 80),
  scivola: (t) => { rumore(t, 0.3, 0.08, 3000, 'highpass'); nota(350, t, 0.25, 'triangle', 0.1, 900); },
  ding: (t) => { nota(1568, t, 0.3, 'triangle', 0.14); nota(2093, t + 0.06, 0.3, 'triangle', 0.1); },
  splash: (t) => rumore(t, 0.4, 0.18, 900, 'lowpass'),
  clacson: (t) => { for (const dt of [0, 0.16]) { nota(392, t + dt, 0.12, 'square', 0.07); nota(494, t + dt, 0.12, 'square', 0.07); } },
  sgommata: (t) => { rumore(t, 0.25, 0.1, 2500); nota(1400, t, 0.25, 'sawtooth', 0.03, 900); },
  botto: (t) => { rumore(t, 0.35, 0.3, 400, 'lowpass'); nota(180, t, 0.35, 'square', 0.12, 45); },
  salto: (t) => nota(300, t, 0.2, 'square', 0.06, 750),
  bonus: (t) => arp(t, [86, 91, 98], 0.05, 0.1),
  rasoio: (t) => rumore(t, 0.06, 0.05, 5000, 'highpass'),
  pennello: (t) => rumore(t, 0.09, 0.05, 1400, 'lowpass'),
  ahia: (t) => { nota(950, t, 0.4, 'sawtooth', 0.11, 280); nota(1000, t, 0.4, 'square', 0.05, 300); },
  starnuto: (t) => { rumore(t, 0.3, 0.25, 1400); nota(800, t, 0.25, 'square', 0.07, 180); },
  sbadiglio: (t) => nota(420, t, 0.9, 'triangle', 0.09, 170),
  tsk: (t) => { rumore(t, 0.04, 0.12, 6000, 'highpass'); rumore(t + 0.09, 0.04, 0.1, 6000, 'highpass'); },
  vittoria: (t) => arp(t, [72, 76, 79, 84, 79, 84, 88], 0.1, 0.2, 0.09),
  sconfitta: (t) => arp(t, [67, 66, 65, 64, 60], 0.16, 0.25, 0.09),
  tempo: (t) => arp(t, [84, 79, 84], 0.12, 0.2),
  // panino
  lancio: (t) => { rumore(t, 0.16, 0.05, 1800); nota(420, t, 0.16, 'triangle', 0.05, 900); },
  preso: (t) => { nota(660, t, 0.07, 'square', 0.07); nota(990, t + 0.06, 0.1, 'square', 0.07); },
  spruzzo: (t) => { rumore(t, 0.25, 0.16, 700, 'lowpass'); nota(240, t, 0.2, 'sawtooth', 0.04, 90); },
  splat: (t) => { rumore(t, 0.14, 0.16, 500, 'lowpass'); nota(160, t, 0.1, 'triangle', 0.08, 70); },
  gnam: (t) => { for (const dt of [0, 0.14]) { rumore(t + dt, 0.08, 0.16, 1200); nota(300, t + dt, 0.08, 'square', 0.06, 200); } },
  bleah: (t) => { nota(300, t, 0.5, 'sawtooth', 0.08, 120); nota(310, t, 0.5, 'square', 0.04, 110); },
  // spalma il Bota
  goccia: (t) => { nota(880, t, 0.09, 'triangle', 0.09, 300); rumore(t, 0.05, 0.06, 1800, 'lowpass'); },
  scuoti: (t) => { for (const dt of [0, 0.09, 0.18, 0.27]) rumore(t + dt, 0.05, 0.12, 2400); },
  sfrigola: (t) => rumore(t, 0.4, 0.07, 5200, 'highpass'),
  gabbiano: (t) => { for (const dt of [0, 0.15, 0.3]) nota(1500, t + dt, 0.12, 'sawtooth', 0.06, 900); },
  vento: (t) => { rumore(t, 0.7, 0.12, 700); rumore(t + 0.1, 0.5, 0.06, 2600, 'highpass'); },
  // L'Incubo degli Scapoli
  conquista: (t) => arp(t, [79, 83, 86, 91], 0.06, 0.12, 0.09),
  squillo: (t) => { for (const dt of [0, 0.12, 0.42, 0.54]) nota(1320, t + dt, 0.09, 'square', 0.05); },
  scatena: (t) => { for (let i = 0; i < 6; i++) nota(330 + i * 110, t + i * 0.07, 0.1, 'sawtooth', 0.07); },
  spento: (t) => nota(520, t, 0.5, 'sawtooth', 0.08, 110),
  // Emilio in Retromarcia
  bipRetro: (t) => nota(1560, t, 0.11, 'square', 0.055),
  bau: (t) => { nota(190, t, 0.09, 'sawtooth', 0.12, 120); rumore(t, 0.08, 0.1, 500, 'lowpass'); },
  cai: (t) => { nota(700, t, 0.12, 'square', 0.07, 1100); nota(900, t + 0.12, 0.16, 'square', 0.06, 500); },
  miao: (t) => { nota(560, t, 0.16, 'triangle', 0.09, 880); nota(880, t + 0.16, 0.22, 'triangle', 0.08, 520); },
  ruggito: (t) => { nota(230, t, 0.6, 'sawtooth', 0.12, 95); nota(236, t, 0.6, 'square', 0.05, 100); rumore(t, 0.55, 0.14, 450, 'lowpass'); },
  // Beer Pong al Pallaio: il singhiozzo, la pallina che gira sul bordo, il rullo di tamburi dell'ultimo bicchiere
  hic: (t) => { nota(480, t, 0.07, 'square', 0.08, 1150); nota(930, t + 0.09, 0.06, 'triangle', 0.06, 520); },
  bordo: (t) => { for (let i = 0; i < 9; i++) nota(980 + (i % 2) * 170 - i * 30, t + i * 0.085, 0.07, 'triangle', 0.06); },
  rullo: (t) => { for (let i = 0; i < 26; i++) rumore(t + i * 0.055, 0.045, 0.05 + i * 0.004, 1700 + i * 35); },
  stonato: (t) => { nota(392, t, 0.28, 'triangle', 0.07, 372); nota(466, t + 0.28, 0.4, 'triangle', 0.07, 530); },   // i perdenti che cantano
  // Provini a X-Factor: il colpo di tamburo dei voti, i fischi del pubblico, l'applauso
  tamburo: (t) => { nota(150, t, 0.24, 'sine', 0.3, 48); rumore(t, 0.13, 0.2, 500, 'lowpass'); },
  buu: (t) => { nota(196, t, 0.5, 'sawtooth', 0.055, 118); nota(204, t, 0.5, 'square', 0.03, 122); rumore(t, 0.4, 0.05, 700); },
  applauso: (t) => { for (let i = 0; i < 8; i++) rumore(t + i * 0.045 + Math.random() * 0.02, 0.05, 0.065, 1400 + Math.random() * 1000); },
  // mani di Guerra
  schiaffo: (t) => { rumore(t, 0.09, 0.32, 3200, 'highpass'); rumore(t, 0.12, 0.2, 900); nota(1400, t, 0.06, 'square', 0.05, 500); },
  tonfo: (t) => { rumore(t, 0.12, 0.22, 300, 'lowpass'); nota(140, t, 0.14, 'triangle', 0.12, 60); },
  pof: (t) => { rumore(t, 0.18, 0.12, 1600); nota(700, t, 0.15, 'triangle', 0.06, 1400); },
  furto: (t) => { nota(500, t, 0.18, 'square', 0.05, 250); nota(380, t + 0.12, 0.2, 'square', 0.05, 180); },
  // fumogeni a casa di Sego
  lancioGranata: (t) => { rumore(t, 0.3, 0.08, 900); nota(260, t, 0.3, 'triangle', 0.06, 520); },
  fumata: (t) => { rumore(t, 0.6, 0.28, 600, 'lowpass'); rumore(t + 0.05, 0.4, 0.1, 2500); nota(120, t, 0.25, 'square', 0.06, 50); },
  tonk: (t) => { nota(880, t, 0.12, 'square', 0.07, 600); nota(1320, t, 0.08, 'triangle', 0.05); },
  tosse: (t) => { for (const dt of [0, 0.22, 0.4]) { rumore(t + dt, 0.12, 0.22, 900); nota(210, t + dt, 0.1, 'sawtooth', 0.05, 140); } },
  sbam: (t) => { rumore(t, 0.1, 0.25, 1200); nota(200, t, 0.12, 'square', 0.08, 90); },
  porta: (t) => { nota(180, t, 0.5, 'sawtooth', 0.04, 260); nota(240, t + 0.3, 0.3, 'triangle', 0.05, 160); },
  // TorRONDAcelli
  cannonata: (t) => { rumore(t, 0.5, 0.34, 500, 'lowpass'); rumore(t, 0.12, 0.2, 2500); nota(120, t, 0.3, 'square', 0.12, 40); },
  buco: (t) => { rumore(t, 0.14, 0.22, 1400); nota(520, t, 0.16, 'square', 0.06, 180); },
  affonda: (t) => { rumore(t, 0.6, 0.14, 700, 'lowpass'); for (let i = 0; i < 4; i++) nota(700 - i * 110, t + 0.15 + i * 0.13, 0.1, 'triangle', 0.08, 380 - i * 60); },
  ricarica: (t) => { rumore(t, 0.05, 0.2, 3000, 'highpass'); nota(700, t + 0.07, 0.06, 'square', 0.06); rumore(t + 0.14, 0.05, 0.22, 3000, 'highpass'); },
  vuoto: (t) => { nota(900, t, 0.05, 'square', 0.05); rumore(t + 0.03, 0.04, 0.08, 4000, 'highpass'); },
  fischietto: (t) => { for (let i = 0; i < 10; i++) nota(i % 2 ? 2350 : 2550, t + i * 0.035, 0.04, 'square', 0.035); nota(2450, t + 0.36, 0.3, 'square', 0.04); },
  rubato: (t) => arp(t, [76, 73, 70, 66], 0.09, 0.14, 0.07),
  // Passa di qua
  schizzo: (t) => { rumore(t, 0.5, 0.3, 900, 'lowpass'); rumore(t + 0.04, 0.35, 0.14, 3500, 'highpass'); },
  campanello: (t) => { for (const dt of [0, 0.16]) { nota(2637, t + dt, 0.18, 'triangle', 0.08); nota(3520, t + dt, 0.12, 'triangle', 0.04); } },
  frenata: (t) => { rumore(t, 0.4, 0.12, 3000); nota(1700, t, 0.4, 'sawtooth', 0.03, 1100); },
  // Il Passaggiorgio
  apri: (t) => { rumore(t, 0.06, 0.16, 2500, 'highpass'); nota(320, t, 0.12, 'square', 0.04, 520); },
  portiera: (t) => { rumore(t, 0.14, 0.35, 350, 'lowpass'); nota(110, t, 0.15, 'square', 0.1, 60); rumore(t + 0.02, 0.05, 0.12, 3000, 'highpass'); },
  motore: (t) => {
    for (let i = 0; i < 6; i++) nota(70 + i * 6, t + i * 0.07, 0.09, 'sawtooth', 0.09, 55 + i * 6);
    nota(90, t + 0.42, 0.55, 'sawtooth', 0.08, 170); rumore(t + 0.42, 0.5, 0.08, 400, 'lowpass');
  },
  tossisce: (t) => { for (const dt of [0, 0.22, 0.5]) { rumore(t + dt, 0.12, 0.25, 500, 'lowpass'); nota(80, t + dt, 0.12, 'square', 0.08, 50); } },
  tintinnio: (t) => { for (let i = 0; i < 5; i++) nota(3200 + (i % 2) * 700, t + i * 0.045, 0.07, 'triangle', 0.05); },
  // Petri Tentacolari
  plop: (t) => { nota(700, t, 0.1, 'triangle', 0.1, 180); rumore(t, 0.05, 0.08, 900, 'lowpass'); },
  glu: (t) => { for (let i = 0; i < 3; i++) { nota(260 - i * 30, t + i * 0.16, 0.1, 'triangle', 0.1, 140 - i * 15); rumore(t + i * 0.16, 0.06, 0.08, 600, 'lowpass'); } },
  salva: (t) => arp(t, [79, 84, 88, 91], 0.06, 0.12, 0.07),
  // il gabbiano (Spalma il Bota!): due versi stridi che scendono
  gabbiano: (t) => { nota(1500, t, 0.14, 'square', 0.05, 900); nota(1350, t + 0.17, 0.18, 'square', 0.05, 760); rumore(t, 0.12, 0.03, 3000); },
  // il Petri: un verso gutturale (basso, raschiato) e il lamento che scende ("Gnamooo...")
  verso: (t) => { for (let i = 0; i < 6; i++) nota(i % 2 ? 92 : 74, t + i * 0.055, 0.08, 'sawtooth', 0.09, 62); rumore(t, 0.34, 0.08, 260, 'lowpass'); },
  lamento: (t) => { nota(240, t, 0.5, 'triangle', 0.1, 170); nota(190, t + 0.45, 0.55, 'triangle', 0.09, 120); },
  bonk: (t) => { nota(330, t, 0.12, 'square', 0.08, 160); rumore(t, 0.08, 0.15, 700, 'lowpass'); },
  // MaraZio
  calcio: (t) => { rumore(t, 0.08, 0.26, 700, 'lowpass'); nota(160, t, 0.1, 'triangle', 0.14, 70); },
  rimbalzo: (t) => { rumore(t, 0.06, 0.12, 500, 'lowpass'); nota(110, t, 0.08, 'triangle', 0.09, 60); },
  vuotoCalcio: (t) => rumore(t, 0.16, 0.08, 2200),
  // L'Ingiocabile
  carta: (t) => { rumore(t, 0.07, 0.12, 5000, 'highpass'); rumore(t + 0.03, 0.05, 0.06, 1800); },
  gira: (t) => { rumore(t, 0.05, 0.1, 3500, 'highpass'); nota(1200, t, 0.04, 'triangle', 0.04); },
  fiches: (t) => { for (let i = 0; i < 4; i++) { nota(2600 + i * 180, t + i * 0.035, 0.06, 'triangle', 0.05); rumore(t + i * 0.035, 0.02, 0.06, 6000, 'highpass'); } },
  // un fischio solo, lungo quanto la spazzolata del braccio: sale mentre il braccio tira a sé le fiches
  fischio: (t) => {
    const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(), d = 1.15;
    o.type = 'sine';
    o.frequency.setValueAtTime(1250, t);
    o.frequency.exponentialRampToValueAtTime(1500, t + 0.25);
    o.frequency.exponentialRampToValueAtTime(2350, t + d);
    lfo.frequency.value = 7; lg.gain.value = 28;
    lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.06);
    g.gain.setValueAtTime(0.13, t + d - 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(busEffetti);
    o.start(t); lfo.start(t); o.stop(t + d + 0.02); lfo.stop(t + d + 0.02);
    rumore(t, d, 0.02, 3200);
  },
};

// Musica: lead (onda quadra) + basso (triangolare), un passo = un ottavo
const TRACCE = {
  menu: {
    bpm: 128,
    lead: [72, 0, 76, 0, 79, 0, 76, 0, 77, 0, 81, 0, 79, 0, 0, 0, 72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 79, 0, 76, 0, 0, 0,
           81, 0, 77, 0, 81, 0, 84, 0, 79, 0, 76, 0, 79, 0, 0, 0, 77, 0, 76, 0, 74, 0, 72, 0, 74, 0, 79, 0, 72, 0, 0, 0],
    basso: [48, 53, 48, 43, 53, 48, 50, 43],
  },
  // la disco: cassa dritta, basso a ottave, battimani sul 2 e sul 4 (vedi suonaPasso)
  disco: {
    bpm: 122, disco: true,
    lead: [79, 0, 79, 81, 0, 79, 76, 0, 74, 0, 76, 0, 0, 0, 0, 0, 79, 0, 79, 81, 0, 83, 84, 0, 83, 0, 81, 0, 0, 0, 0, 0,
           76, 0, 76, 79, 0, 76, 74, 0, 72, 0, 74, 0, 0, 76, 0, 0, 74, 0, 72, 74, 0, 76, 79, 0, 77, 0, 76, 0, 74, 0, 0, 0],
    basso: [45, 45, 48, 48, 43, 43, 41, 43],
  },
  gioco: {
    bpm: 156,
    lead: [76, 76, 0, 76, 0, 72, 76, 0, 79, 0, 0, 0, 67, 0, 0, 0, 72, 0, 0, 67, 0, 0, 64, 0, 0, 69, 0, 71, 0, 70, 69, 0,
           67, 76, 79, 81, 0, 77, 79, 0, 76, 0, 72, 74, 71, 0, 0, 0, 72, 0, 74, 76, 0, 79, 0, 76, 74, 0, 72, 0, 74, 0, 0, 0],
    basso: [48, 43, 48, 45, 48, 45, 53, 43],
  },
  // la pista del Manna (L'Incubo degli Scapoli): un'altra canzone da discoteca, più svelta.
  // Cassa in quattro, basso che rimbalza di ottava, charleston in levare
  pista: {
    bpm: 132,
    dance: true,
    lead: [81, 0, 76, 81, 0, 76, 84, 0, 83, 0, 79, 83, 0, 76, 79, 0, 81, 0, 77, 81, 0, 77, 84, 0, 86, 0, 84, 83, 0, 79, 76, 0,
           81, 0, 76, 81, 0, 76, 84, 0, 88, 0, 86, 84, 0, 83, 84, 0, 86, 0, 84, 83, 0, 79, 81, 0, 83, 0, 84, 86, 0, 88, 0, 0],
    basso: [57, 57, 53, 55, 57, 60, 53, 55],
  },
  // la marcia del Generale (TorRONDAcelli): rullante in ottavi, basso "um-pa"
  marcia: {
    bpm: 116,
    marcia: true,
    lead: [72, 0, 72, 74, 76, 0, 72, 0, 79, 0, 0, 0, 76, 0, 0, 0, 77, 0, 77, 76, 74, 0, 71, 0, 72, 0, 0, 0, 67, 0, 0, 0,
           72, 0, 72, 74, 76, 0, 79, 0, 81, 0, 79, 0, 77, 0, 76, 0, 74, 0, 76, 77, 79, 0, 74, 0, 72, 0, 0, 0, 0, 0, 0, 0],
    basso: [48, 43, 48, 43, 50, 43, 48, 48],
  },
  // in strada (Arriva ReGrorio!, Passa di qua): svelta, basso che pompa in ottavi
  corsa: {
    bpm: 168,
    corsa: true,
    lead: [69, 0, 72, 0, 76, 0, 72, 74, 76, 0, 74, 72, 71, 0, 67, 0, 69, 0, 72, 0, 76, 0, 79, 77, 76, 0, 74, 0, 72, 0, 71, 0,
           72, 0, 76, 0, 79, 0, 76, 79, 81, 0, 79, 76, 74, 0, 72, 0, 71, 0, 72, 74, 76, 0, 74, 72, 69, 0, 0, 0, 69, 0, 0, 0],
    basso: [45, 45, 41, 43, 45, 41, 43, 45],
  },
  // la festa (premi buffi e classifica finale): allegra, coi battimani
  festa: {
    bpm: 120,
    festa: true,
    lead: [77, 0, 81, 0, 84, 0, 81, 0, 82, 0, 79, 0, 77, 0, 0, 0, 74, 0, 77, 0, 81, 0, 79, 77, 76, 0, 79, 0, 72, 0, 0, 0,
           77, 0, 81, 0, 84, 0, 86, 0, 84, 0, 82, 81, 79, 0, 77, 0, 76, 0, 77, 79, 81, 0, 79, 76, 77, 0, 0, 0, 77, 0, 0, 0],
    basso: [53, 53, 50, 48, 53, 46, 48, 53],
  },
  // l'autoradio di Emilio (Emilio in Retromarcia): rock, con la chitarra che gratta in ottavi
  rock: {
    bpm: 164,
    rock: true,
    lead: [64, 0, 67, 64, 0, 69, 67, 0, 64, 0, 67, 69, 71, 0, 69, 67, 64, 0, 67, 64, 0, 69, 67, 0, 71, 0, 74, 71, 69, 67, 64, 0,
           76, 0, 74, 71, 0, 74, 71, 0, 69, 0, 71, 69, 67, 0, 64, 0, 67, 0, 69, 71, 0, 74, 76, 0, 74, 71, 69, 67, 64, 0, 64, 0],
    basso: [40, 40, 43, 45, 40, 40, 45, 47],
  },
  // la base di "Provini a X-Factor": una canzone vera (rock, pop o rap: la sceglie il microgioco
  // col seme del round, vedi Audio.brano e suonaProvino). Niente melodia fissa: quella, piano, la
  // dà il microgioco (Audio.guida), e sopra ci cantano le voci (Audio.voce). Il bpm è del brano.
  provino: {
    bpm: 120,
    provino: true,
    lead: new Array(64).fill(0),
    basso: [41],
  },
};

function suonaPasso(T, i, t, conta = 0) {
  const d = 60 / (T.bpm * tempo) / 2;
  const n = T.lead[i];
  if (n) nota(midi(n), t, d * 1.6, 'square', 0.045);
  const fond = T.basso[Math.floor(i / 8) % T.basso.length];
  if (T.provino) {
    suonaProvino(conta, t, d);
    // la melodia giusta, piano, come guida: chi è intonato la copre, chi stona la sente sotto
    const g = guida?.(conta);
    if (g) nota(midi(g.midi), t, Math.max(0.1, g.passi * d * 0.92), 'triangle', 0.034);
    return;
  }
  if (T.disco) {
    nota(midi(fond - (i % 2 ? 0 : 12)), t, d * 0.9, 'triangle', 0.14);           // basso a ottave
    if (i % 2 === 0) nota(120, t, 0.12, 'sine', 0.22, 45);                       // cassa
    else rumore(t, 0.05, 0.05, 8000, 'highpass');                                // charleston in levare
    if (i % 4 === 2) rumore(t, 0.09, 0.09, 1600);                                // battimani
    return;
  }
  if (T.rock) {
    // la chitarra: fondamentale e quinta in ottavi (un "power chord"); cassa sull'1 e sul 3,
    // rullante sul 2 e sul 4, charleston in levare
    nota(midi(fond), t, d * 0.8, 'sawtooth', 0.06); nota(midi(fond + 7), t, d * 0.8, 'square', 0.025);
    if (i % 4 === 0) nota(110, t, 0.1, 'sine', 0.2, 45);
    if (i % 4 === 2) rumore(t, 0.08, 0.1, 2200);
    if (i % 2 === 1) rumore(t, 0.03, 0.03, 8000, 'highpass');
    return;
  }
  if (T.marcia) {
    // um-pa del basso, cassa sull'1 e sul 3, rullante in ottavi (più forte sui battiti) e un rullo a fine battuta
    if (i % 4 === 0) { nota(midi(fond - 12), t, d * 1.2, 'triangle', 0.15); nota(110, t, 0.1, 'sine', 0.18, 45); }
    if (i % 4 === 2) nota(midi(fond - 5), t, d * 1.2, 'triangle', 0.11);
    rumore(t, 0.04, i % 2 ? 0.035 : 0.07, 2600);
    if (i % 8 === 7) rumore(t + d / 2, 0.03, 0.05, 2600);
    return;
  }
  if (T.corsa) {
    // basso a ottave in ottavi, cassa sull'1 e sul 3, rullante sul 2 e sul 4, charleston sempre
    nota(midi(fond - (i % 2 ? 0 : 12)), t, d * 0.85, 'triangle', 0.12);
    if (i % 4 === 0) nota(120, t, 0.1, 'sine', 0.2, 45);
    if (i % 4 === 2) rumore(t, 0.08, 0.09, 2000);
    rumore(t, 0.025, 0.025, 8000, 'highpass');
    return;
  }
  if (T.festa) {
    if (i % 4 === 0) nota(midi(fond - 12), t, d * 1.8, 'triangle', 0.14);
    if (i % 4 === 2) { nota(midi(fond - 5), t, d * 1.5, 'triangle', 0.11); rumore(t, 0.09, 0.08, 1700); }   // battimani
    if (i % 2 === 1) rumore(t, 0.03, 0.025, 7000, 'highpass');
    return;
  }
  if (T.dance) {
    // cassa su ogni battito, basso in levare un'ottava sopra, charleston aperto in levare
    if (i % 2 === 0) { nota(150, t, 0.12, 'sine', 0.22, 42); nota(midi(fond - 12), t, d * 0.9, 'triangle', 0.12); }
    else { nota(midi(fond), t, d * 0.9, 'triangle', 0.1); rumore(t, 0.06, 0.05, 8000, 'highpass'); }
    if (i % 8 === 4) rumore(t, 0.09, 0.07, 1800);   // battimani
    return;
  }
  if (i % 4 === 0) nota(midi(fond - 12), t, d * 1.8, 'triangle', 0.14);
  if (i % 4 === 2) nota(midi(fond - 5), t, d * 1.5, 'triangle', 0.11);
  if (i % 2 === 1) rumore(t, 0.03, 0.025, 7000, 'highpass');
}

// --- le canzoni del provino ---
// Batteria: cassa (un tonfo che scende), rullante e battimani (rumore), charleston (rumore acuto)
const cassa = (t, v = 0.2) => nota(120, t, 0.11, 'sine', v, 45);
const rullante = (t, v = 0.09) => { rumore(t, 0.09, v, 2000); nota(190, t, 0.05, 'triangle', v * 0.35, 120); };
const charleston = (t, v = 0.025, aperto = false) => rumore(t, aperto ? 0.09 : 0.025, v, 8000, 'highpass');
const tom = (t, f, v = 0.12) => nota(f, t, 0.13, 'sine', v, f * 0.55);
// il passaggio di batteria nell'ultima battuta prima di un atto nuovo: rullante in sedicesimi che
// cresce, poi i tom che scendono
function passaggio(k, t, d) {
  if (k < 4) { for (const h of [0, 0.5]) rullante(t + h * d, 0.05 + k * 0.012); return; }
  tom(t, [260, 210, 170, 130][k - 4]); tom(t + d / 2, [235, 190, 150, 115][k - 4]);
}
// Una canzone: brano = { stile, bpm, giro (gli accordi, uno per battuta), radici e triadi (MIDI),
// sezioni [strofa, ritornello, acuto] (in passi dall'inizio), tono [semitoni in più per sezione] }.
// La strofa è più tranquilla, il ritornello più pieno (e un tono sopra), l'acuto finale suona con tutto.
function suonaProvino(conta, t, d) {
  const B = brano;
  if (!B) return;
  const sez = conta >= B.sezioni[2] ? 2 : conta >= B.sezioni[1] ? 1 : 0, k = conta % 8;
  const acc = B.giro[Math.floor(conta / 8) % B.giro.length], su = B.tono[sez];
  const rad = B.radici[acc] + su, tri = B.triadi[acc].map((m) => m + su);
  // l'ultima battuta prima di un atto nuovo: il passaggio di batteria (e il basso tiene)
  const prossima = B.sezioni.find((x) => x > conta);
  if (prossima != null && prossima - conta <= 8 && prossima - conta > 0) {
    passaggio(8 - (prossima - conta), t, d);
    if (k === 0) nota(midi(rad), t, d * 6, 'triangle', 0.12);
    return;
  }
  if (sez === 2 && k === 0) rumore(t, 0.5, 0.06, 6000, 'highpass');              // il piatto, a ogni battuta dell'acuto
  if (B.stile === 'rock') {
    // rock: cassa sull'1 e sul 3 (più il levare del 3), rullante sul 2 e sul 4, charleston in ottavi;
    // basso in ottavi con l'ottava sul 7; chitarra a "power chord" (3+3+2 nella strofa, in ottavi dopo)
    if (k === 0 || k === 4 || (k === 5 && sez > 0)) cassa(t);
    if (k === 2 || k === 6) rullante(t);
    charleston(t, k % 2 ? 0.02 : 0.03, k === 7);
    nota(midi(rad - 12 + (k === 6 ? 12 : 0)), t, d * 0.85, 'triangle', 0.12);
    const colpi = sez === 0 ? [0, 3, 6] : [0, 1, 2, 3, 4, 5, 6, 7];
    if (colpi.includes(k)) { nota(midi(rad), t, d * (sez ? 0.7 : 1.6), 'sawtooth', sez ? 0.04 : 0.032); nota(midi(rad + 7), t, d * (sez ? 0.7 : 1.6), 'square', 0.018); }
    if (sez === 2) charleston(t + d / 2, 0.018);
  } else if (B.stile === 'pop') {
    // pop: cassa in quattro, battimani sul 2 e sul 4, shaker in sedicesimi; basso sincopato
    // (1, il levare del 2, il 4); accordi arpeggiati (su e giù), e nel ritornello un tappeto sotto
    if (k % 2 === 0) cassa(t, sez === 0 ? 0.15 : 0.2);
    if (k === 2 || k === 6) { rumore(t, 0.08, 0.075, 1600); rumore(t + 0.012, 0.06, 0.05, 2400); }
    for (const h of [0, 0.5]) charleston(t + h * d, 0.012 + (sez ? 0.006 : 0));
    if (k === 0 || k === 3 || k === 6) nota(midi(rad - 12 + (k === 6 ? 7 : 0)), t, d * 1.6, 'triangle', 0.13);
    const arp = [0, 1, 2, 1][k % 4];
    nota(midi(tri[arp] + 12), t, d * 0.9, 'square', 0.016);
    if (sez > 0) nota(midi(tri[(arp + 1) % 3] + 12), t + d / 2, d * 0.45, 'square', 0.012);
    if (sez > 0 && k === 0) for (const m of tri) nota(midi(m), t, d * 7.5, 'sawtooth', 0.011);
  } else {
    // rap: batteria "boom bap" (cassa sull'1, sul levare del 2 e sul 3 e mezzo, rullante sul 2 e sul
    // 4), charleston in sedicesimi un po' sghembi; basso lungo che scende di tono a fine nota; gli
    // accordi a colpi secchi in levare, e nel ritornello una campanella che risponde
    if (k === 0 || k === 3 || k === 5) cassa(t, 0.22);
    if (k === 2 || k === 6) rullante(t, 0.1);
    charleston(t, 0.022); charleston(t + d * 0.58, 0.014);
    if (k === 0 || k === 5) nota(midi(rad - 12), t, d * (k === 0 ? 3.4 : 2.4), 'sine', 0.2, midi(rad - 13));
    if (k === 1 || k === 5) for (const m of tri) nota(midi(m), t, d * 0.35, 'triangle', 0.022);
    if (sez > 0 && (k === 3 || k === 7)) nota(midi(tri[2] + 12), t, d * 0.5, 'triangle', 0.03);
    if (sez === 2 && k % 2 === 1) cassa(t + d / 2, 0.12);
  }
}

function pianifica() {
  if (!ac || !traccia) return;
  const T = TRACCE[traccia];
  uscita = busMusica;
  while (prossimo < ac.currentTime + 0.15) {
    suonaPasso(T, passo, prossimo, contaPassi);
    prossimo += 60 / (T.bpm * tempo) / 2;
    passo = (passo + 1) % T.lead.length;
    contaPassi++;
  }
  uscita = busEffetti;
}

export const Audio = {
  // ritardo del suono in secondi (cuffie o casse Bluetooth: Impostazioni → Ritardo audio). I giochi a tempo
  // di musica (Scapoli, X-Factor) spostano frecce e note di tanto, così sono a tempo con quello che si sente
  ritardo: 0,

  // Va chiamato al primo input dell'utente (i browser bloccano l'audio prima)
  sblocca() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muto ? 0 : 0.8;
      master.connect(ac.destination);
      // (il volume 0.8 di prima è il "normale": i canali lo moltiplicano, 1 = come prima)
      busMusica = ac.createGain(); busMusica.gain.value = volMusica / 0.8; busMusica.connect(master);
      busEffetti = ac.createGain(); busEffetti.gain.value = volEffetti / 0.8; busEffetti.connect(master);
      uscita = busEffetti;
      prossimo = ac.currentTime + 0.05;
      timer = setInterval(pianifica, 40);
      // iPhone vecchi: l'audio si sblocca davvero solo se dentro il tocco parte un suono (anche muto)
      const s = ac.createBufferSource();
      s.buffer = ac.createBuffer(1, 1, 22050);
      s.connect(ac.destination);
      s.start(0);
    }
    // 'interrupted' = iPhone dopo una telefonata o un'altra app che ha preso l'audio
    if (ac.state === 'suspended' || ac.state === 'interrupted') Promise.resolve(ac.resume()).catch(() => {});
  },

  // al ritorno nell'app: su iPhone il contesto audio resta sospeso (o 'interrupted') dopo lo sfondo.
  // Se il browser non lo lascia ripartire senza un tocco, ci pensa sblocca() al tocco successivo.
  riprendi() {
    if (ac && ac.state !== 'running' && ac.state !== 'closed') Promise.resolve(ac.resume()).catch(() => {});
  },

  get eMuto() { return muto; },

  sfx(nome) {
    if (!ac || !SFX[nome]) return;
    SFX[nome](ac.currentTime + 0.005);
  },

  musica(nome) {
    if (traccia === nome) return;
    traccia = nome;
    passo = 0;
    contaPassi = 0;
    tempo = 1;
    if (ac) prossimo = ac.currentTime + 0.05;
  },

  // moltiplicatore di velocità della musica (1 = normale)
  tempo(k) { tempo = k; },

  // dove siamo nel brano, in passi (ottavi) dall'inizio, contati sull'orologio dell'audio: serve
  // ai giochi a ritmo. null se l'audio non suona (non ancora sbloccato, o sospeso).
  get posizione() {
    if (!ac || !traccia || ac.state !== 'running') return null;
    const dur = 60 / (TRACCE[traccia].bpm * tempo) / 2;
    return contaPassi - (prossimo - ac.currentTime) / dur;
  },

  // quanto dura adesso un battito della musica (secondi): serve a chi vuole andare a tempo
  get battito() { return 60 / ((TRACCE[traccia]?.bpm ?? 128) * tempo); },

  // volumi dalle Impostazioni (0..1)
  volumi(musica, effetti) {
    volMusica = musica; volEffetti = effetti;
    if (busMusica) { busMusica.gain.value = musica / 0.8; busEffetti.gain.value = effetti / 0.8; }
  },

  // audio acceso o spento (dalle Impostazioni); il tasto M e il pulsante usano silenzia()
  accendi(acceso) {
    if (muto === !acceso) return;
    this.silenzia();
  },

  silenzia() {
    muto = !muto;
    if (master) master.gain.value = muto ? 0 : 0.8;
    window.dispatchEvent(new Event('audio-cambiato')); // per l'icona dell'audio sullo schermo
    return muto;
  },

  // --- "Provini a X-Factor" ---
  // la melodia guida: fn(passo) ritorna { midi, passi } quando in quel passo (ottavo) comincia
  // una nota, se no niente. null per toglierla.
  guida(fn) { guida = fn; },

  // la canzone del provino (vedi suonaProvino): la sceglie il microgioco; null = nessuna
  brano(b) {
    brano = b;
    if (b) TRACCE.provino.bpm = b.bpm;
  },

  // Porta la musica in un punto preciso (in passi, anche a metà di un passo): la usa il provino per
  // tenere la base agganciata alla partita, all'inizio e dopo una pausa.
  vaiA(pos) {
    if (!ac || !traccia) return;
    const T = TRACCE[traccia], n = Math.max(0, Math.ceil(pos)), dur = 60 / (T.bpm * tempo) / 2;
    passo = n % T.lead.length;
    contaPassi = n;
    prossimo = ac.currentTime + 0.03 + (n - pos) * dur;
  },

  // Una voce continua (un cantante): v = { freq, vol (0..1), vibrato (in cent), vibratoHz, crepa
  // (0..1: la voce che si incrina, il volume trema), tipo (forma d'onda), taglio (Hz del filtro) }.
  // Si chiama a ogni fotogramma; con v = null la voce tace.
  voce(nome, v) {
    if (!ac) return;
    let x = voci[nome];
    const t = ac.currentTime;
    if (!v) {
      if (x) { x.g.gain.setTargetAtTime(0, t, 0.02); x.cg.gain.setTargetAtTime(0, t, 0.02); }
      return;
    }
    if (!x) {
      const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
      const lfo = ac.createOscillator(), lg = ac.createGain(), cr = ac.createOscillator(), cg = ac.createGain();
      o.type = v.tipo ?? 'square';
      o.frequency.value = v.freq;
      f.type = 'lowpass'; f.frequency.value = v.taglio ?? 2400;
      g.gain.value = 0;
      lfo.frequency.value = 5.5; lg.gain.value = 0; lfo.connect(lg); lg.connect(o.frequency);        // il vibrato
      cr.type = 'square'; cr.frequency.value = 27; cg.gain.value = 0; cr.connect(cg); cg.connect(g.gain);   // la crepa
      o.connect(f); f.connect(g); g.connect(busEffetti);
      o.start(); lfo.start(); cr.start();
      x = voci[nome] = { o, g, lfo, lg, cr, cg };
    }
    const vol = 0.075 * (v.vol ?? 1);
    x.o.frequency.setTargetAtTime(v.freq, t, 0.012);
    x.g.gain.setTargetAtTime(vol, t, 0.02);
    x.lfo.frequency.setTargetAtTime(v.vibratoHz ?? 5.5, t, 0.05);
    x.lg.gain.setTargetAtTime(v.freq * (v.vibrato ?? 0) * 0.00057779, t, 0.05);   // da cent a Hz
    x.cg.gain.setTargetAtTime(vol * (v.crepa ?? 0), t, 0.02);
  },

  // spegne e butta via tutte le voci (fine del microgioco, pausa)
  vociZitte() {
    for (const [nome, x] of Object.entries(voci)) {
      try {
        if (ac) { x.g.gain.setTargetAtTime(0, ac.currentTime, 0.01); x.cg.gain.setTargetAtTime(0, ac.currentTime, 0.01); }
        for (const o of [x.o, x.lfo, x.cr]) o.stop(ac.currentTime + 0.08);
      } catch (e) { /* niente */ }
      delete voci[nome];
    }
  },

  // Suono continuo della spillatura: il tono sale con il livello
  versaInizio() {
    if (!ac || pour) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle';
    o.frequency.value = 180;
    g.gain.value = 0.09;
    o.connect(g); g.connect(busEffetti);
    o.start();
    pour = { o, g };
  },
  versaLivello(l) {
    if (pour) pour.o.frequency.setTargetAtTime(180 + l * 620, ac.currentTime, 0.02);
  },
  versaFine() {
    if (!pour) return;
    pour.g.gain.setTargetAtTime(0, ac.currentTime, 0.01);
    pour.o.stop(ac.currentTime + 0.08);
    pour = null;
  },
};
