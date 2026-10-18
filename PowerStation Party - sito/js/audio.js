// Suoni 8-bit e musichetta, tutto generato con la Web Audio API.

let ac = null, master = null, muto = false;
let contaPassi = 0;   // passi (ottavi) della musica pianificati dall'inizio del brano
// due canali, ognuno col suo volume (Impostazioni): la musica e gli effetti. "uscita" è dove
// suonano nota() e rumore() in quel momento: gli effetti, tranne mentre si pianifica la musica.
let busMusica = null, busEffetti = null, uscita = null, volMusica = 0.8, volEffetti = 0.8;
let traccia = null, timer = null, passo = 0, prossimo = 0, tempo = 1;
let pour = null;
// le voci continue di chi canta (una per nome: la Ballata del Pallaio)
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
  // "La pizza dal Boni": il forno a legna che crepita, lo "sciaff" della pala, il Boni che sbraita
  // (un borbottio 8-bit), il "glu glu" della caraffa, il portone della taverna che sbatte
  crepitio: (t) => { for (let i = 0; i < 4; i++) rumore(t + i * (0.04 + Math.random() * 0.07), 0.025, 0.05 + Math.random() * 0.05, 2500 + Math.random() * 2500); },
  pala: (t) => { rumore(t, 0.07, 0.26, 2600, 'highpass'); rumore(t + 0.02, 0.14, 0.16, 700); nota(260, t, 0.1, 'triangle', 0.1, 120); },
  borbottio: (t) => { for (let i = 0; i < 7; i++) { const f = 150 + Math.random() * 120; nota(f, t + i * 0.075, 0.07, 'square', 0.07, f * 0.8); } },
  caraffa: (t) => { for (const [dt, f] of [[0, 420], [0.18, 360], [0.36, 300]]) { nota(f, t + dt, 0.12, 'sine', 0.16, f * 0.55); rumore(t + dt, 0.05, 0.04, 600, 'lowpass'); } },
  portone: (t) => { rumore(t, 0.2, 0.3, 260, 'lowpass'); nota(95, t, 0.22, 'triangle', 0.18, 50); rumore(t + 0.03, 0.06, 0.08, 3000, 'highpass'); },
  pof: (t) => { rumore(t, 0.18, 0.12, 1600); nota(700, t, 0.15, 'triangle', 0.06, 1400); },
  // "La ballata del Pallaio": il TOC di legno della bacchetta (e le due note che salgono prima),
  // l'"OOOH" del pubblico, le monete nel cappello, le risate, la tela che vola, la finta della
  // bacchetta, la vignetta che si sposta
  toc: (t) => { nota(1250, t, 0.06, 'square', 0.12, 900); nota(620, t, 0.09, 'triangle', 0.2, 420); rumore(t, 0.035, 0.22, 2600, 'bandpass'); },
  preToc1: (t) => nota(880, t, 0.07, 'triangle', 0.08),
  preToc2: (t) => nota(1175, t, 0.07, 'triangle', 0.09),
  oooh: (t) => { for (const [f, v] of [[196, 0.07], [247, 0.05], [294, 0.04]]) nota(f, t, 0.75, 'triangle', v, f * 1.12); rumore(t, 0.6, 0.025, 900, 'lowpass'); },
  monete: (t) => { for (let i = 0; i < 6; i++) nota(2600 + ((i * 7) % 5) * 260, t + i * 0.055 + Math.random() * 0.02, 0.06, 'triangle', 0.055); },
  risate: (t) => { for (let i = 0; i < 6; i++) { const f = 330 + Math.random() * 90 - i * 12; nota(f, t + i * 0.12, 0.08, 'square', 0.06, f * 0.82); rumore(t + i * 0.12, 0.06, 0.04, 1800); } },
  telo: (t) => { for (let i = 0; i < 5; i++) rumore(t + i * 0.07, 0.09, 0.08 - i * 0.01, 1200 + i * 300); nota(300, t, 0.4, 'triangle', 0.04, 600); },
  fiuu: (t) => { rumore(t, 0.16, 0.08, 3200, 'highpass'); nota(500, t, 0.14, 'square', 0.04, 1500); },
  foglio: (t) => { rumore(t, 0.05, 0.08, 4200, 'highpass'); rumore(t + 0.04, 0.05, 0.05, 2600, 'highpass'); },
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
  fiches: (t) => { for (let i = 0; i < 4; i++) { nota(2600 + i * 180, t + i * 0.035, 0.06, 'triangle', 0.05); rumore(t + i * 0.035, 0.02, 0.06, 6000, 'highpass'); } },  // Scontrino, prego!: i tasti della cassa, il cassetto ("cling"), la stampante degli scontrini
  // ("trrr"), lo strappo, il bip basso dell'annullo, Michele che fischietta, la sirenetta dei finanzieri
  tasti: (t) => { for (let i = 0; i < 3; i++) { nota(1700 + i * 140, t + i * 0.08, 0.03, 'square', 0.035); rumore(t + i * 0.08, 0.02, 0.05, 4500, 'highpass'); } },
  cassa: (t) => { rumore(t, 0.1, 0.12, 1400); nota(2093, t + 0.04, 0.3, 'triangle', 0.1); nota(2637, t + 0.09, 0.35, 'triangle', 0.08); },
  stampante: (t) => { for (let i = 0; i < 16; i++) rumore(t + i * 0.026, 0.02, 0.1, 2600); nota(140, t, 0.42, 'sawtooth', 0.03, 130); },
  strappo: (t) => { rumore(t, 0.17, 0.24, 3400, 'highpass'); rumore(t + 0.05, 0.12, 0.14, 1300); },
  annullo: (t) => { nota(233, t, 0.16, 'square', 0.1); nota(156, t + 0.17, 0.32, 'square', 0.1); },
  fischiettio: (t) => { [[0, 1568], [0.13, 1760], [0.26, 1976], [0.46, 1760], [0.6, 1568], [0.74, 1319]].forEach(([d, f]) => nota(f, t + d, 0.12, 'sine', 0.09, f * 1.03)); },
  sirena: (t) => { for (let i = 0; i < 4; i++) nota(i % 2 ? 620 : 830, t + i * 0.2, 0.19, 'triangle', 0.08); },
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
  // l'osteria del Boni ("La pizza dal Boni"): una tarantella in La minore. Il mandolino ribatte la
  // melodia un'ottava sopra (il tremolo), la fisarmonica fa "um-pa": basso sul battere, accordo in levare
  osteria: {
    bpm: 150,
    osteria: true,
    lead: [69, 0, 72, 0, 76, 0, 72, 0, 74, 0, 71, 0, 68, 0, 0, 0, 69, 0, 72, 0, 76, 0, 81, 0, 79, 0, 77, 0, 76, 0, 0, 0,
           77, 0, 76, 0, 74, 0, 72, 0, 74, 0, 72, 0, 71, 0, 68, 0, 69, 0, 71, 0, 72, 0, 74, 0, 76, 0, 71, 0, 69, 0, 0, 0],
    basso: [45, 40, 45, 40, 41, 40, 45, 45],
    minori: [45],
  },
  // la ballata di Lori ("La ballata del Pallaio"), in Sol maggiore: la chitarra strimpellata in
  // levare, il basso sull'1 e sul 3, il tamburello sul 2 e sul 4, la fisarmonica che risponde a fine
  // frase (lead). La melodia la canta Lori (voce: la segue BallataScene con Audio.voce)
  ballata: {
    bpm: 120,
    ballata: true,
    lead: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 78, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 74, 76,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 81, 79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 74, 0],
    voce: [67, 0, 67, 71, 74, 0, 74, 0, 76, 0, 74, 0, 71, 0, 0, 0, 72, 0, 72, 71, 69, 0, 69, 0, 71, 0, 67, 0, 69, 0, 0, 0,
           67, 0, 67, 71, 74, 0, 79, 0, 78, 0, 76, 0, 74, 0, 0, 0, 72, 0, 76, 0, 74, 0, 71, 0, 69, 0, 71, 0, 67, 0, 0, 0],
    basso: [43, 40, 48, 50, 43, 50, 48, 43],
    minori: [40],
  },
  // niente musichetta: suona una canzone vera, caricata dal microgioco ("Provini a X-Factor": vedi
  // Audio.carica e Audio.canzone qui sotto)
  silenzio: {
    bpm: 120,
    silenzio: true,
    lead: [0],
    basso: [0],
  },
};

function suonaPasso(T, i, t, conta = 0) {
  const d = 60 / (T.bpm * tempo) / 2;
  const n = T.lead[i];
  if (n) nota(midi(n), t, d * 1.6, 'square', 0.045);
  const fond = T.basso[Math.floor(i / 8) % T.basso.length];
  if (T.silenzio) return;
  if (T.osteria) {
    if (n) nota(midi(n + 12), t + d / 2, d * 0.4, 'triangle', 0.028);                          // il tremolo del mandolino
    if (i % 4 === 0) nota(midi(fond - 12), t, d * 1.4, 'triangle', 0.15);                      // um...
    if (i % 4 === 2) for (const k of [12, T.minori.includes(fond) ? 15 : 16, 19]) nota(midi(fond + k), t, d * 1.1, 'sawtooth', 0.016);   // ...pa
    if (i % 8 === 7) rumore(t, 0.04, 0.03, 5000, 'highpass');                                  // il tamburello
    return;
  }
  if (T.ballata) {
    if (i % 4 === 0) nota(midi(fond - 12), t, d * 1.6, 'triangle', 0.15);                                     // il basso
    if (i % 4 === 2) [12, T.minori.includes(fond) ? 15 : 16, 19, 24].forEach((k, j) => nota(midi(fond + k), t + j * 0.018, d * 1.2, 'triangle', 0.03));   // la chitarra
    if (i % 4 === 3) [12, T.minori.includes(fond) ? 15 : 16, 19].forEach((k, j) => nota(midi(fond + k), t + j * 0.014, d * 0.6, 'triangle', 0.018));
    if (i % 8 === 2 || i % 8 === 6) rumore(t, 0.05, 0.035, 6000, 'highpass');                            // il tamburello
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

  // la nota della melodia cantata (la "voce" della traccia) in quel passo, o 0: la segue chi canta
  notaCanto(passo) { const v = TRACCE[traccia]?.voce; return v ? v[((passo % v.length) + v.length) % v.length] : 0; },

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

  // --- le canzoni vere ("Provini a X-Factor") ---
  // Un ritaglio di una canzone vera (un file audio mono), caricato quando parte il microgioco e
  // buttato quando finisce (decodificato pesa: circa 190 KB al secondo). carica(url) lo scarica e lo
  // decodifica: null se non si può (audio non ancora sbloccato, niente rete): si gioca lo stesso.
  async carica(url) {
    if (!ac) return null;
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      const dati = await r.arrayBuffer();
      // (i Safari vecchi vogliono le funzioni, i browser nuovi rispondono anche con la promessa)
      return await new Promise((ok, no) => { const pr = ac.decodeAudioData(dati, ok, no); pr?.then?.(ok, no); });
    } catch (e) { return null; }
  },

  // l'audio sta suonando davvero? (su iPhone, dopo una telefonata, resta fermo finché non si tocca)
  get inFunzione() { return !!ac && ac.state === 'running'; },

  // Suona un ritaglio caricato (sul canale della musica), attraverso un filtro passa-basso: con
  // ovatta() la canzone si sente "da dietro una porta" (gli errori), con graffio() il disco graffia,
  // con velocita() rallenta (e cala di tono). La posizione è quella di quello che SI SENTE adesso:
  // l'orologio dell'audio meno la latenza di uscita e il ritardo audio delle Impostazioni.
  // pausa() e riprendi() tengono il segno; vaiA(sec) la porta lì; chiudi() la butta via.
  canzone(buffer) {
    if (!ac || !buffer) return null;
    const filtro = ac.createBiquadFilter(), vol = ac.createGain();
    filtro.type = 'lowpass'; filtro.frequency.value = 20000; filtro.Q.value = 0.7;
    filtro.connect(vol); vol.connect(busMusica);
    const latenza = () => (ac.outputLatency || 0) + (ac.baseLatency || 0) + Audio.ritardo;
    let src = null, base = 0, quando = 0, vel = 1, ferma = true;
    // posizione = base + (adesso - quando) x velocità, da quando si comincia a sentire
    const dove = () => (ferma ? base : base + Math.max(0, ac.currentTime - quando) * vel);
    const spegni = () => { if (src) { try { src.stop(); } catch (e) { /* già fermo */ } src.disconnect(); src = null; } };
    const parti = (da) => {
      spegni();
      src = ac.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = vel;
      src.connect(filtro);
      const t = ac.currentTime + 0.05;
      src.start(t, Math.max(0, Math.min(buffer.duration, da)));
      base = da; quando = t + latenza(); ferma = false;
    };
    return {
      durata: buffer.duration,
      get posizione() { return dove(); },
      get suona() { return !ferma; },
      avvia(da = 0) { parti(da); },
      vaiA(da) { parti(da); },
      pausa() { if (ferma) return; base = dove(); ferma = true; spegni(); },
      riprendi() { if (ferma) parti(base); },
      velocita(v) {
        if (v === vel) return;
        base = dove(); quando = ac.currentTime; vel = v;
        src?.playbackRate.setValueAtTime(v, ac.currentTime);
      },
      // il passa-basso: taglio = frequenza (Hz) per tanti secondi (0 = finché non si toglie)
      ovatta(taglio, secondi = 0) {
        const t = ac.currentTime, f = filtro.frequency;
        f.cancelScheduledValues(t); f.setValueAtTime(f.value, t); f.setTargetAtTime(taglio, t, 0.03);
        if (secondi) f.setTargetAtTime(20000, t + secondi, 0.12);
      },
      // il disco graffiato: un fruscio che gratta e la puntina che salta
      graffio() {
        const t = ac.currentTime + 0.005, prima = uscita;
        uscita = busMusica;
        rumore(t, 0.07, 0.14, 1500, 'bandpass'); rumore(t + 0.08, 0.05, 0.1, 2600, 'bandpass');
        nota(900, t, 0.09, 'sawtooth', 0.035, 240); nota(320, t + 0.09, 0.07, 'sawtooth', 0.03, 900);
        uscita = prima;
      },
      chiudi() { ferma = true; spegni(); filtro.disconnect(); vol.disconnect(); buffer = null; },
    };
  },

  // Porta la musica in un punto preciso (in passi, anche a metà di un passo): la usa la ballata per
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
