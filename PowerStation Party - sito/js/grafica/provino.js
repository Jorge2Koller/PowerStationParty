// "Provini a X-Factor": il palco di un talent show televisivo INVENTATO (luci, muro di led, una
// grande X luminosa di fantasia: non è il logo di nessun programma vero), i due tavoli dei giudici,
// il pubblico al buio con gli accendini. In mezzo, come in Guitar Hero, l'autostrada delle note in
// prospettiva, che parte dalla console di chi suona (in fondo al palco, davanti alla X) e arriva ai
// 4 pad in basso: la strada vuota è qui ('stradaProvino'), le note, i pad e i bagliori li disegna
// XfactorScene. I giudici e i cantanti sono in personaggi.js.
// (Scheda di valutazione: "rifare come Guitar Hero le note e la griglia". Prima la console stava in
// basso, in mezzo al tavolo dei giudici, e le note cadevano dritte in 4 corsie sottili.)
import { tela, CONT, casuale, riemp, tratto, ellisse, rrect, poli, gradL, gradR, alfa, alone } from './base.js';

// L'autostrada: in fondo (cima) è stretta, davanti (colpo, la linea dei pad) è larga; sotto la
// linea continua fino in fondo allo schermo. Una prospettiva vera: z = la distanza (0 sulla linea
// di colpo, 1 in fondo), sc(z) = quanto è grande una cosa lì. Le usa anche XfactorScene.
const STRADA = { cx: 240, cima: 100, colpo: 222, wCima: 66, wColpo: 212 };
const S0 = STRADA.wCima / STRADA.wColpo, DIST = S0 / (1 - S0), YV = (STRADA.cima - STRADA.colpo * S0) / (1 - S0);
const sc = (z) => DIST / (DIST + z);
const yDi = (z) => YV + (STRADA.colpo - YV) * sc(z);
// il centro della corsia k (0..3) a distanza z; k = -0.5 e 3.5 sono i bordi
const xDi = (k, z) => STRADA.cx + (k - 1.5) * (STRADA.wColpo / 4) * sc(z);
// al contrario: a che distanza è un punto dello schermo alto y (per il dito)
const zDi = (y) => (DIST * (STRADA.colpo - YV)) / Math.max(1, y - YV) - DIST;
export const PROSPETTIVA = { ...STRADA, sc, yDi, xDi, zDi, zFondo: zDi(270) };

// i colori delle 4 corsie, come in Guitar Hero: verde, rosso, giallo, blu
export const CORSIE = ['#3fe06a', '#ff4d5e', '#ffd93a', '#3ea2ff'];

// dove stanno le cose sul palco (unità di schermo): le usa XfactorScene
export const PROVINO = {
  pavimento: 200,                       // dove comincia il pavimento del palco
  piedi: 214,                           // i piedi dei cantanti
  cantanti: [58, 422],                  // Tini a sinistra, Oli a destra
  io: 240, ioPiedi: 104,                // chi suona, in fondo al palco, dietro la console
  console: { x: 240, y: 84, w: 96, h: 22 },
  x: { cx: 240, cy: 58, r: 30 },        // la grande X, dietro a chi suona
  banco: { y: 238, h: 26 },             // i due tavoli dei giudici, ai lati della strada
  banchi: [64, 416], wBanco: 128,
  giudici: [32, 96, 384, 448],          // i quattro posti (due per tavolo: in mezzo passa la strada)
  lucine: 247,                          // l'altezza delle lucine sul tavolo
};

function sfondo(c) {
  const rnd = casuale(9091), X = PROVINO.x, P = PROVINO.pavimento;
  // il fondale
  c.fillStyle = gradL(c, 0, 0, 0, 270, [[0, '#130a2c'], [0.55, '#28114e'], [1, '#07040f']]); c.fillRect(0, 0, 480, 270);
  // il muro di led: tanti riquadri, alcuni accesi
  for (let x = 44; x < 436; x += 14) for (let y = 22; y < P - 2; y += 12) {
    const k = rnd();
    c.fillStyle = k < 0.14 ? 'rgba(120,80,255,0.34)' : k < 0.24 ? 'rgba(58,224,255,0.2)' : k < 0.3 ? 'rgba(255,79,184,0.2)' : 'rgba(70,40,130,0.22)';
    c.fillRect(x, y, 12.4, 10.4);
  }
  alone(c, X.cx, X.cy + 10, 120, '#7a3aff', 0.4);
  // le quinte ai lati, a pieghe
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const x0 = s < 0 ? i * 11 : 480 - (i + 1) * 11;
    c.fillStyle = gradL(c, x0, 0, x0 + 11, 0, [[0, '#3a0c22'], [0.5, '#6a1836'], [1, '#2a0818']]); c.fillRect(x0, 0, 11, P + 6);
  }
  // l'americana con i fari (quelli in mezzo si scostano: lì c'è la X)
  c.fillStyle = '#1b1b24'; c.fillRect(0, 6, 480, 9);
  for (let x = 4; x < 480; x += 12) { c.beginPath(); c.moveTo(x, 6.5); c.lineTo(x + 6, 14.5); c.lineTo(x + 12, 6.5); tratto(c, '#3c3c4a', 0.8); }
  c.strokeStyle = '#3c3c4a'; c.lineWidth = 1; c.strokeRect(-1, 6, 482, 9);
  [[50, '#3ae0ff'], [112, '#ff4fb8'], [174, '#ffe14a'], [306, '#7dff9a'], [368, '#ff4fb8'], [430, '#3ae0ff']].forEach(([x, col]) => {
    poli(c, [[x - 5, 15], [x + 5, 15], [x + 7, 25], [x - 7, 25]]); riemp(c, '#22222c'); tratto(c, CONT, 1);
    ellisse(c, x, 26, 6, 2.6); riemp(c, col); alone(c, x, 28, 16, col, 0.5);
  });

  // la grande X luminosa (inventata): un cerchio di lampadine e due tubi al neon incrociati
  ellisse(c, X.cx, X.cy, X.r + 5, X.r + 5); riemp(c, 'rgba(10,6,24,0.72)'); tratto(c, '#f6c63a', 2.2);
  ellisse(c, X.cx, X.cy, X.r + 5, X.r + 5); tratto(c, CONT, 0.8);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2, x = X.cx + Math.cos(a) * (X.r + 5), y = X.cy + Math.sin(a) * (X.r + 5);
    alone(c, x, y, 4.5, '#fff3b0', 0.6); ellisse(c, x, y, 1.6, 1.6); riemp(c, i % 2 ? '#fff8d8' : '#ffd24a');
  }
  const tubo = (sx, col) => {
    const d = X.r * 0.66, via = () => { c.beginPath(); c.moveTo(X.cx - sx * d, X.cy - d); c.lineTo(X.cx + sx * d, X.cy + d); };
    via(); tratto(c, alfa(col, 0.22), 14); via(); tratto(c, alfa(col, 0.5), 8); via(); tratto(c, col, 5); via(); tratto(c, '#ffffff', 1.7);
  };
  tubo(1, '#3ae0ff'); tubo(-1, '#ff4fb8');
  for (const [dx, dy, r] of [[-48, -26, 2.6], [50, -24, 2.1], [-52, 18, 1.9], [48, 22, 2.6]]) {
    c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.4 : r * 1.6; c.lineTo(X.cx + dx + Math.cos(a) * rr, X.cy + dy + Math.sin(a) * rr); } c.closePath(); riemp(c, '#fff8d8');
  }
  // la pedana di chi suona, in fondo al palco
  c.fillStyle = gradL(c, 0, 96, 0, 112, [[0, '#2a1b52'], [1, '#120a26']]);
  poli(c, [[176, 98], [304, 98], [318, 112], [162, 112]]); c.fill(); tratto(c, 'rgba(90,58,168,0.6)', 0.8);

  // il pavimento del palco, lucido: riflette la X e i fari
  c.fillStyle = gradL(c, 0, P, 0, 240, [[0, '#3a2468'], [1, '#150c2c']]); c.fillRect(0, P, 480, 40);
  c.save(); c.beginPath(); c.rect(0, P, 480, 40); c.clip();
  for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(240 + i * 22, P); c.lineTo(240 + i * 64, 242); tratto(c, 'rgba(160,120,255,0.13)', 0.8); }
  for (const y of [P + 5, P + 13, P + 25]) { c.beginPath(); c.moveTo(0, y); c.lineTo(480, y); tratto(c, 'rgba(160,120,255,0.1)', 0.7); }
  alone(c, 60, P + 14, 46, '#b6f23c', 0.18); alone(c, 420, P + 14, 46, '#4d7cff', 0.22);
  c.restore();
  c.fillStyle = '#0c0718'; c.fillRect(0, 238, 480, 32);
  c.fillStyle = '#5a3aa8'; c.fillRect(0, P - 0.6, 480, 1.2);
  for (let x = 6; x < 480; x += 13) { ellisse(c, x, 239.5, 1.3, 1.3); riemp(c, x % 2 ? '#ffe14a' : '#fff8d8'); }
}

// L'autostrada vuota (la texture parte da x = 96, y = cima - 4): il nastro scuro, le corsie coi loro
// colori che si accendono verso i pad, le righe tra le corsie, i bordi cromati e la nebbia in fondo
const STRADA_X = 96, STRADA_Y = STRADA.cima - 4, STRADA_W = 288, STRADA_H = 270 - STRADA_Y;
export const POS_STRADA = { x: STRADA_X, y: STRADA_Y };
function strada(c) {
  c.translate(-STRADA_X, -STRADA_Y);
  const zF = PROSPETTIVA.zFondo, bordo = (k, z) => [xDi(k, z), yDi(z)];
  const nastro = () => poli(c, [bordo(-0.5, 1), bordo(3.5, 1), bordo(3.5, zF), bordo(-0.5, zF)]);
  nastro(); c.fillStyle = gradL(c, 0, STRADA.cima, 0, 270, [[0, 'rgba(14,8,30,0.78)'], [0.6, 'rgba(10,6,22,0.86)'], [1, 'rgba(6,3,14,0.9)']]); c.fill();
  // le corsie: un velo del loro colore, più forte vicino ai pad
  CORSIE.forEach((col, k) => {
    poli(c, [bordo(k - 0.5, 1), bordo(k + 0.5, 1), bordo(k + 0.5, zF), bordo(k - 0.5, zF)]);
    c.fillStyle = gradL(c, 0, STRADA.cima, 0, STRADA.colpo, [[0, alfa(col, 0)], [0.7, alfa(col, 0.07)], [1, alfa(col, 0.2)]]); c.fill();
  });
  // le righe tra le corsie
  for (let k = 0.5; k < 3; k++) { c.beginPath(); c.moveTo(...bordo(k, 1)); c.lineTo(...bordo(k, zF)); tratto(c, 'rgba(255,255,255,0.13)', 0.8); }
  // i bordi: una striscia cromata per lato
  for (const k of [-0.5, 3.5]) {
    c.beginPath(); c.moveTo(...bordo(k, 1)); c.lineTo(...bordo(k, zF)); tratto(c, 'rgba(20,10,40,0.9)', 4);
    c.beginPath(); c.moveTo(...bordo(k, 1)); c.lineTo(...bordo(k, zF)); tratto(c, gradL(c, 0, STRADA.cima, 0, 270, [[0, 'rgba(190,180,230,0.2)'], [1, 'rgba(230,225,255,0.85)']]), 1.6);
  }
  // la linea di colpo: una sbarra chiara da bordo a bordo, dietro ai pad
  const y = STRADA.colpo, x0 = xDi(-0.5, 0), x1 = xDi(3.5, 0);
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x0, y - 11, x1 - x0, 22);
  c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); tratto(c, 'rgba(255,255,255,0.55)', 1.4);
  // la nebbia in fondo, dove spuntano le note
  nastro(); c.fillStyle = gradL(c, 0, STRADA.cima - 2, 0, STRADA.cima + 26, [[0, 'rgba(122,58,255,0.55)'], [1, 'rgba(122,58,255,0)']]); c.fill();
}

// la console di chi suona, in fondo alla strada: il piano coi due piatti e il frontale coi led
function consoleDj(c) {
  const { w, h } = PROVINO.console;
  poli(c, [[8, 2], [w - 8, 2], [w - 2, 9], [2, 9]]); riemp(c, gradL(c, 0, 2, 0, 9, [[0, '#4a4560'], [1, '#2c283c']])); tratto(c, CONT, 1);
  for (const x of [24, w - 24]) { ellisse(c, x, 5.6, 9, 2.6); riemp(c, '#15131d'); ellisse(c, x, 5.6, 3, 0.9); riemp(c, '#c8c2dc'); }
  for (let i = 0; i < 4; i++) { c.fillStyle = '#8f88a8'; c.fillRect(w / 2 - 7 + i * 4, 3.6, 1.6, 4); }
  rrect(c, 2, 9, w - 4, h - 10, [0, 0, 3, 3]); riemp(c, gradL(c, 0, 9, 0, h, [[0, '#1d1830'], [1, '#0e0b18']])); tratto(c, CONT, 1);
  c.fillStyle = '#7a3aff'; c.fillRect(5, 11.5, w - 10, 1.2);
  CORSIE.forEach((col, k) => { const x = w / 2 + (k - 1.5) * 13; alone(c, x, 16.5, 5, col, 0.6); ellisse(c, x, 16.5, 2.4, 1.6); riemp(c, col); });
}

// il tavolo dei giudici (uno per lato): il piano e il frontale, con una striscia di luce
function banco(c) {
  const w = PROVINO.wBanco, h = PROVINO.banco.h;
  poli(c, [[6, 8], [w - 6, 8], [w - 1, 14], [1, 14]]); riemp(c, gradL(c, 0, 8, 0, 14, [[0, '#3a3350'], [1, '#262038']])); tratto(c, CONT, 1.2);
  rrect(c, 1, 14, w - 2, h - 14, [0, 0, 4, 4]); riemp(c, gradL(c, 0, 14, 0, h, [[0, '#191326'], [1, '#0d0916']])); tratto(c, CONT, 1.2);
  c.fillStyle = '#7a3aff'; c.fillRect(4, 16.5, w - 8, 1.4);
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(8, 9.2, w - 16, 1);
}

// il pubblico al buio: teste e spalle in controluce
function pubblico(c) {
  const rnd = casuale(733);
  for (let i = 0; i < 21; i++) {
    const x = i * 24 + rnd() * 10 - 4, y = 12 + rnd() * 5, r = 6 + rnd() * 2;
    ellisse(c, x, y + r + 7, r * 1.9, r * 1.2); riemp(c, '#05030b');
    ellisse(c, x, y, r, r * 1.08); riemp(c, '#07040f');
    c.beginPath(); c.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.9); tratto(c, 'rgba(150,110,255,0.4)', 0.9);
  }
}

// un accendino acceso, tenuto in alto
function accendino(c) {
  c.fillStyle = '#05030b'; rrect(c, 2.6, 9, 3.8, 9, 1.6); c.fill();
  rrect(c, 3.3, 6.4, 2.4, 3.6, 0.6); riemp(c, '#c9cdd6');
  alone(c, 4.5, 3.4, 5, '#ffd24a', 0.75);
  c.beginPath(); c.moveTo(4.5, 0.6); c.quadraticCurveTo(7.2, 4, 4.5, 6.4); c.quadraticCurveTo(1.8, 4, 4.5, 0.6); c.closePath();
  riemp(c, gradL(c, 0, 0, 0, 6.4, [[0, '#fff8c0'], [1, '#ff9a2e']]));
}

// una nota della strada (la "gemma" di Guitar Hero): un disco lucido del colore della corsia, visto
// un po' di sbieco, con lo spessore sotto e il bottone bianco in mezzo
function gemma(col) {
  return (c) => {
    ellisse(c, 20, 13.5, 18.5, 7.5); riemp(c, 'rgba(0,0,0,0.55)');
    ellisse(c, 20, 12, 18.5, 7.5); riemp(c, gradL(c, 0, 4, 0, 20, [[0, col], [1, '#1a1024']])); tratto(c, CONT, 1);
    ellisse(c, 20, 9.5, 18, 7); riemp(c, gradR(c, 16, 6, 1, 19, [[0, '#ffffff'], [0.25, col], [1, col]])); tratto(c, 'rgba(255,255,255,0.8)', 1);
    ellisse(c, 20, 9.6, 8, 3.1); riemp(c, gradL(c, 0, 6.5, 0, 12.7, [[0, '#ffffff'], [1, '#d8d4e8']])); tratto(c, 'rgba(30,20,50,0.6)', 0.8);
    ellisse(c, 13, 6.6, 4, 1.4, -0.15); riemp(c, 'rgba(255,255,255,0.75)');
  };
}

// la fiamma del colpo (bianca: la scena la tinge del colore della corsia e la somma alla luce)
function fiamma(c) {
  alone(c, 10, 26, 10, '#ffffff', 0.55);
  c.beginPath(); c.moveTo(10, 1); c.bezierCurveTo(14, 9, 19, 14, 17, 22); c.bezierCurveTo(16, 28, 4, 28, 3, 22); c.bezierCurveTo(1, 14, 7, 10, 10, 1); c.closePath();
  riemp(c, gradL(c, 0, 1, 0, 28, [[0, 'rgba(255,255,255,0)'], [0.35, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0.95)']]));
  c.beginPath(); c.moveTo(10, 11); c.bezierCurveTo(13, 16, 14, 19, 13, 23); c.bezierCurveTo(12, 26, 8, 26, 7, 23); c.bezierCurveTo(6, 19, 8, 16, 10, 11); c.closePath();
  riemp(c, 'rgba(255,255,255,0.9)');
}

// il riflettore sul cantante che canta: un cono di luce che sfuma verso il basso, e la pozza sul pavimento
function riflettore(c) {
  c.beginPath(); c.moveTo(19, 0); c.lineTo(29, 0); c.lineTo(48, 200); c.lineTo(0, 200); c.closePath();
  riemp(c, gradL(c, 0, 0, 0, 200, [[0, 'rgba(255,248,220,0.55)'], [0.7, 'rgba(255,248,220,0.18)'], [1, 'rgba(255,248,220,0.05)']]));
}
function pozza(c) { c.save(); c.scale(1, 8 / 30); c.fillStyle = gradR(c, 30, 30, 0, 30, [[0, 'rgba(255,248,220,0.6)'], [1, 'rgba(255,248,220,0)']]); c.fillRect(0, 0, 60, 60); c.restore(); }

// una notina (il coro), una scintilla (i colpi)
function notina(c) {
  ellisse(c, 3.6, 10.2, 3.2, 2.4, -0.4); riemp(c, '#ffffff');
  c.fillStyle = '#ffffff'; c.fillRect(5.6, 1.2, 1.3, 9);
  c.beginPath(); c.moveTo(6.9, 1.2); c.quadraticCurveTo(10.5, 3, 9.5, 6.5); c.quadraticCurveTo(9.4, 4.4, 6.9, 4.2); c.closePath(); riemp(c, '#ffffff');
}
function scintilla(c) { alone(c, 4, 4, 4, '#ffffff', 1); ellisse(c, 4, 4, 1.1, 1.1); riemp(c, '#ffffff'); }

export function creaProvino(scene) {
  tela(scene, 'bgProvino', 480, 270, sfondo);
  tela(scene, 'stradaProvino', STRADA_W, STRADA_H, strada);
  tela(scene, 'consoleDj', PROVINO.console.w, PROVINO.console.h, consoleDj, 6);
  tela(scene, 'bancoGiudici', PROVINO.wBanco, PROVINO.banco.h, banco);
  tela(scene, 'pubblicoProvino', 480, 26, pubblico);
  tela(scene, 'accendino', 9, 18, accendino, 8);
  CORSIE.forEach((col, k) => tela(scene, `gemma${k}`, 40, 22, gemma(col), 6));
  tela(scene, 'fiammaPad', 20, 30, fiamma, 6);
  tela(scene, 'riflettore', 48, 200, riflettore, 2);
  tela(scene, 'pozzaLuce', 60, 16, pozza, 3);
  tela(scene, 'notina', 11, 13, notina, 6);
  tela(scene, 'scintillaPad', 8, 8, scintilla, 6);
}
