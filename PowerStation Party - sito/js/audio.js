// Suoni 8-bit e musichetta, tutto generato con la Web Audio API.

let ac = null, master = null, muto = false;
let traccia = null, timer = null, passo = 0, prossimo = 0, tempo = 1;
let pour = null;

const midi = (n) => 440 * 2 ** ((n - 69) / 12);

function nota(f, t, d, tipo = 'square', v = 0.08, f2 = 0) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g); g.connect(master); // separati: sui Safari vecchi connect() non restituisce il nodo
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
  s.connect(f); f.connect(g); g.connect(master);
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
    o.connect(g); g.connect(master);
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
  gioco: {
    bpm: 156,
    lead: [76, 76, 0, 76, 0, 72, 76, 0, 79, 0, 0, 0, 67, 0, 0, 0, 72, 0, 0, 67, 0, 0, 64, 0, 0, 69, 0, 71, 0, 70, 69, 0,
           67, 76, 79, 81, 0, 77, 79, 0, 76, 0, 72, 74, 71, 0, 0, 0, 72, 0, 74, 76, 0, 79, 0, 76, 74, 0, 72, 0, 74, 0, 0, 0],
    basso: [48, 43, 48, 45, 48, 45, 53, 43],
  },
};

function suonaPasso(T, i, t) {
  const d = 60 / (T.bpm * tempo) / 2;
  const n = T.lead[i];
  if (n) nota(midi(n), t, d * 1.6, 'square', 0.045);
  const fond = T.basso[Math.floor(i / 8) % T.basso.length];
  if (i % 4 === 0) nota(midi(fond - 12), t, d * 1.8, 'triangle', 0.14);
  if (i % 4 === 2) nota(midi(fond - 5), t, d * 1.5, 'triangle', 0.11);
  if (i % 2 === 1) rumore(t, 0.03, 0.025, 7000, 'highpass');
}

function pianifica() {
  if (!ac || !traccia) return;
  const T = TRACCE[traccia];
  while (prossimo < ac.currentTime + 0.15) {
    suonaPasso(T, passo, prossimo);
    prossimo += 60 / (T.bpm * tempo) / 2;
    passo = (passo + 1) % T.lead.length;
  }
}

export const Audio = {
  // Va chiamato al primo input dell'utente (i browser bloccano l'audio prima)
  sblocca() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muto ? 0 : 0.8;
      master.connect(ac.destination);
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
    tempo = 1;
    if (ac) prossimo = ac.currentTime + 0.05;
  },

  // moltiplicatore di velocità della musica (1 = normale)
  tempo(k) { tempo = k; },

  silenzia() {
    muto = !muto;
    if (master) master.gain.value = muto ? 0 : 0.8;
    window.dispatchEvent(new Event('audio-cambiato')); // per l'icona dell'audio sullo schermo
    return muto;
  },

  // Suono continuo della spillatura: il tono sale con il livello
  versaInizio() {
    if (!ac || pour) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle';
    o.frequency.value = 180;
    g.gain.value = 0.09;
    o.connect(g); g.connect(master);
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
