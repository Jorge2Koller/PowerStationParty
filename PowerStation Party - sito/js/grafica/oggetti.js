// Oggetti di scena: la Golf di ReGrorio, pinte, spina, clienti, mani di Guerra, panino,
// attrezzi del barbiere, particelle.
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, mix, alfa, alone, casuale } from './base.js';
import { PERSONAGGI, disegnaTesta } from './personaggi.js';

// ------------------------------------------------------------
//  LA GOLF BIANCA (vista dall'alto, muso in basso), senza loghi
// ------------------------------------------------------------
function carrozzeria(c) {
  rrect(c, 9.5, 14, 46, 86, 14); c.fillStyle = 'rgba(0,0,0,0.28)'; c.fill();              // ombra a terra
  for (const x of [14.5, 45.5]) alone(c, x, 96, 12, '#fff2a0', 0.55);                         // luce dei fari
  for (const y of [20, 68]) for (const x of [4.5, 50.5]) { rrect(c, x, y, 5, 15, 2); c.fillStyle = '#1b1c22'; c.fill(); }
  const scocca = () => rrect(c, 7, 10, 46, 84, [13, 13, 16, 16]);
  scocca();
  c.fillStyle = gradL(c, 7, 0, 53, 0, [[0, '#b4bbc8'], [0.1, '#eef1f6'], [0.5, '#ffffff'], [0.9, '#eceff4'], [1, '#a9b1bf']]); c.fill();
  c.save(); scocca(); c.clip();
  c.fillStyle = '#cfd4dd'; c.fillRect(7, 10, 46, 5);
  for (const x of [10, 40]) { rrect(c, x, 11, 10, 4.5, 2); c.fillStyle = '#e23a3a'; c.fill(); rrect(c, x + 1, 11.8, 4, 1.5, 0.7); c.fillStyle = '#ff9d9d'; c.fill(); }
  // lunotto
  poli(c, [[13, 18.5], [47, 18.5], [44.5, 27], [15.5, 27]]); c.fillStyle = gradL(c, 0, 18, 0, 27, [[0, '#2b3650'], [1, '#55688c']]); c.fill();
  poli(c, [[17, 19.5], [27, 19.5], [25, 26], [18, 26]]); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill();
  // parabrezza, con il volante abbandonato: il Re guida in piedi
  poli(c, [[13.5, 64], [46.5, 64], [49, 76], [11, 76]]); c.fillStyle = gradL(c, 0, 64, 0, 76, [[0, '#32405c'], [1, '#6d86b0']]); c.fill();
  poli(c, [[16, 65.5], [28, 65.5], [26, 74.5], [14.5, 74.5]]); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill();
  c.beginPath(); c.arc(38, 71.5, 3.2, 0, 6.3); tratto(c, '#151821', 1.2);
  // cofano
  c.fillStyle = gradL(c, 0, 76, 0, 94, [[0, 'rgba(120,130,150,0)'], [1, 'rgba(120,130,150,0.28)']]); c.fillRect(7, 76, 46, 18);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(30 + s * 11, 78); c.quadraticCurveTo(30 + s * 12.5, 84, 30 + s * 13, 90); tratto(c, 'rgba(120,130,150,0.55)', 0.8); }
  for (const x of [9.5, 40.5]) { rrect(c, x, 86.5, 10, 5, 2.2); c.fillStyle = '#fff6c2'; c.fill(); tratto(c, '#8a8f9c', 0.7); }
  rrect(c, 21.5, 89.2, 17, 3.2, 1.4); c.fillStyle = '#2a2d36'; c.fill();
  c.restore();
  scocca(); tratto(c, '#5d6575', 1.3);
  // tetto e tettuccio apribile
  rrect(c, 12, 27, 36, 37, 5); c.fillStyle = gradL(c, 12, 0, 48, 0, [[0, '#e1e5ec'], [0.5, '#ffffff'], [1, '#dde1e8']]); c.fill(); tratto(c, '#aab1be', 0.9);
  rrect(c, 16, 33, 28, 25, 4); c.fillStyle = '#161922'; c.fill(); tratto(c, '#7b8392', 1.1);
  for (const x of [5, 55]) { ellisse(c, x, 66.5, 3, 2); c.fillStyle = '#e9edf3'; c.fill(); tratto(c, '#5d6575', 0.9); }
}

// su = true: la Golf sale lungo lo schermo (muso in alto). Greg resta sempre a testa in su.
function golf(c, su, vento) {
  if (su) { c.save(); c.translate(0, 104); c.scale(1, -1); carrozzeria(c); c.restore(); } else carrozzeria(c);
  const g = PERSONAGGI.greg, cy = su ? 58.5 : 45.5;
  // busto che spunta dal tettuccio: giacca blu e camicia a quadretti
  ellisse(c, 30, cy + 10.5, 12.5, 5.5); c.fillStyle = g.vestito.colore; c.fill(); tratto(c, CONT, 0.8);
  rrect(c, 27.3, cy + 6, 5.4, 9, 1.2); c.fillStyle = '#f5f8ff'; c.fill();
  c.fillStyle = 'rgba(48,88,190,0.5)';
  for (let i = 0; i < 3; i++) { c.fillRect(27.3 + i * 2, cy + 6, 0.9, 9); c.fillRect(27.3, cy + 8 + i * 2, 5.4, 0.9); }
  // mani aggrappate al bordo
  for (const s of [-1, 1]) { ellisse(c, 30 + s * 15, cy + 9, 3, 2.6); c.fillStyle = g.pelle; c.fill(); tratto(c, CONT, 0.8); }
  // testa con la corona, ciuffo al vento
  c.save();
  c.translate(30, cy - 3.5); c.scale(0.29, 0.29); c.translate(-96, -128);
  disegnaTesta(c, g, 'felice', { vento, corona: true });
  c.restore();
}

// ------------------------------------------------------------
//  PUB: pinta (birra + schiuma + vetro), spina, clienti di spalle
// ------------------------------------------------------------
// bicchiere 30x50: fondo a y=49, bordo a y=3; interno da y=46 a y=3
function pinta(scene) {
  const cavita = (c) => poli(c, [[7, 46], [23, 46], [26, 3], [4, 3]]);
  tela(scene, 'pintaBirra', 30, 50, (c) => {
    const r = casuale(8);
    cavita(c);
    c.fillStyle = gradL(c, 4, 0, 26, 0, [[0, '#c97608'], [0.2, '#f6ae1e'], [0.45, '#ffd257'], [0.75, '#f2a214'], [1, '#bf6e06']]); c.fill();
    c.save(); cavita(c); c.clip();
    c.fillStyle = gradL(c, 0, 3, 0, 46, [[0, 'rgba(255,240,170,0.25)'], [1, 'rgba(120,50,0,0.3)']]); c.fillRect(0, 0, 30, 50);
    for (let i = 0; i < 46; i++) { ellisse(c, 6 + r() * 18, 6 + r() * 39, 0.35 + r() * 0.4, 0.35 + r() * 0.4); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill(); }
    c.restore();
  }, 6);
  tela(scene, 'pintaSchiuma', 30, 10, (c) => {
    c.beginPath();
    for (let i = 0; i < 6; i++) c.ellipse(5.5 + i * 3.8, 3.4 + (i % 2) * 0.5, 2.6, 2.4, 0, 0, Math.PI * 2);
    c.rect(4, 3.4, 22, 5.4);
    c.fillStyle = '#e9dcbd'; c.fill();
    c.beginPath();
    for (let i = 0; i < 6; i++) c.ellipse(5.5 + i * 3.8, 3 + (i % 2) * 0.5, 2.5, 2.3, 0, 0, Math.PI * 2);
    c.rect(4, 3.2, 22, 4.6);
    c.fillStyle = '#fffaf0'; c.fill();
  }, 6);
  tela(scene, 'pintaVetro', 30, 50, (c) => {
    const fuori = () => poli(c, [[5.6, 49], [24.4, 49], [27.6, 2.5], [2.4, 2.5]]);
    fuori(); c.fillStyle = 'rgba(205,232,255,0.13)'; c.fill();
    rrect(c, 5.8, 46, 18.4, 3, 1); c.fillStyle = 'rgba(225,242,255,0.55)'; c.fill();
    poli(c, [[6.6, 43], [8.6, 43], [6.8, 7], [4.6, 7]]); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
    poli(c, [[21.4, 40], [22.4, 40], [24.3, 10], [23.2, 10]]); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fill();
    fuori(); tratto(c, 'rgba(236,248,255,0.95)', 0.9);
    ellisse(c, 15, 2.7, 12.5, 1.2); tratto(c, 'rgba(255,255,255,0.9)', 0.6);
  }, 6);
}

function spina(c) {
  const ottone = (x0, x1) => gradL(c, x0, 0, x1, 0, [[0, '#7c5412'], [0.3, '#f8dc82'], [0.55, '#d3a034'], [1, '#6e4a10']]);
  rrect(c, 0.5, 57, 16, 6.5, 2); c.fillStyle = gradL(c, 0, 57, 0, 64, [[0, '#f8dc82'], [1, '#8a5e16']]); c.fill(); tratto(c, '#4a320a', 0.7);
  rrect(c, 4, 9, 8.5, 49, 2); c.fillStyle = ottone(4, 12.5); c.fill(); tratto(c, '#4a320a', 0.7);
  rrect(c, 4, 7, 28.5, 7, 3.4); c.fillStyle = gradL(c, 0, 7, 0, 14, [[0, '#fbe59a'], [0.5, '#d3a034'], [1, '#7c5412']]); c.fill(); tratto(c, '#4a320a', 0.7);
  rrect(c, 25, 13.5, 6, 7, [0, 0, 2, 2]); c.fillStyle = gradL(c, 25, 0, 31, 0, [[0, '#6c727e'], [0.4, '#e8ecf2'], [1, '#6c727e']]); c.fill(); tratto(c, '#3a3f49', 0.6);
  // leva nera con una targhetta dorata anonima
  rrect(c, 25, 0.5, 6, 8, [3, 3, 1, 1]); c.fillStyle = gradL(c, 25, 0, 31, 0, [[0, '#0e0e12'], [0.35, '#55555f'], [1, '#0e0e12']]); c.fill(); tratto(c, '#000000', 0.5);
  ellisse(c, 28, 4.5, 1.6, 1.6); c.fillStyle = '#e8c860'; c.fill();
}

function cliente(c, i, f) {
  const giacche = ['#8a2330', '#2f5d8a', '#3f6b3a', '#c88a2c'], chiome = ['#2a1a12', '#d2ab5e', '#5a341a', '#1c1c24'];
  const G = giacche[i], H = chiome[i], S = '#e8b890';
  // braccio che gesticola (dietro alle spalle)
  if (f) {
    c.beginPath(); c.moveTo(46, 60); c.quadraticCurveTo(54, 44, 50, 26); tratto(c, CONT, 9.5);
    c.beginPath(); c.moveTo(46, 60); c.quadraticCurveTo(54, 44, 50, 26); tratto(c, G, 7);
    // mano "a pigna"
    c.beginPath(); c.moveTo(46, 24); c.quadraticCurveTo(45, 15, 49.5, 9); c.quadraticCurveTo(54.5, 15, 53.5, 24); c.closePath();
    c.fillStyle = S; c.fill(); tratto(c, CONT, 1.2);
    c.beginPath(); c.moveTo(49.7, 12); c.lineTo(49.7, 21); tratto(c, scuro(S, 0.3), 0.7);
  }
  // spalle
  const spalle = () => { c.beginPath(); c.moveTo(1, 78); c.bezierCurveTo(1, 52, 12, 46, 28, 46); c.bezierCurveTo(44, 46, 55, 52, 55, 78); c.closePath(); };
  spalle(); c.fillStyle = gradL(c, 0, 46, 0, 78, [[0, chiaro(G, 0.12)], [1, scuro(G, 0.25)]]); c.fill(); tratto(c, CONT, 1.3);
  c.beginPath(); c.moveTo(28, 50); c.lineTo(28, 78); tratto(c, 'rgba(0,0,0,0.18)', 0.8);
  c.beginPath(); c.moveTo(17, 47.5); c.quadraticCurveTo(28, 53, 39, 47.5); tratto(c, scuro(G, 0.35), 2.2);
  // collo e testa
  rrect(c, 22, 36, 12, 13, 3); c.fillStyle = scuro(S, 0.12); c.fill(); tratto(c, CONT, 1.2);
  for (const s of [-1, 1]) { ellisse(c, 28 + s * 15.5, 27, 2.6, 4); c.fillStyle = S; c.fill(); tratto(c, CONT, 1.1); }
  ellisse(c, 28, 24, 15.5, 17); c.fillStyle = gradR(c, 23, 16, 2, 22, [[0, chiaro(H, 0.2)], [1, H]]); c.fill(); tratto(c, CONT, 1.3);
  const r = casuale(i + 1);
  c.save(); ellisse(c, 28, 24, 15.5, 17); c.clip();
  for (let k = 0; k < 26; k++) {
    const x = 14 + r() * 28, y = 8 + r() * 30;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (x - 28) * 0.15, y + 4, x + (x - 28) * 0.25, y + 8); tratto(c, 'rgba(255,255,255,0.12)', 0.8);
  }
  if (i === 3) { ellisse(c, 28, 16, 9.5, 8); c.fillStyle = S; c.fill(); ellisse(c, 25, 13, 3, 2); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill(); } // chierica
  c.restore();
  if (i === 1) { ellisse(c, 28, 6.5, 6.5, 5.5); c.fillStyle = H; c.fill(); tratto(c, CONT, 1.2); }                                     // chignon
  if (i === 2) { c.beginPath(); c.moveTo(14, 34); c.quadraticCurveTo(28, 44, 42, 34); tratto(c, CONT, 5.5); c.beginPath(); c.moveTo(14, 34); c.quadraticCurveTo(28, 44, 42, 34); tratto(c, H, 3.4); }
}

// ------------------------------------------------------------
//  LE MANI DI GUERRA: viste dall'alto, dita in su, polso in basso al centro (20, 56).
//  Nel microgioco si ruotano verso il piatto e si attaccano a un braccio che si allunga.
// ------------------------------------------------------------
// polsino di lana a coste del cardigan
function polsino(c, g) {
  const lana = scuro(g.vestito.colore, 0.24);
  rrect(c, 10, 45.5, 20, 10.5, 2.5); c.fillStyle = gradL(c, 10, 0, 30, 0, [[0, scuro(lana, 0.3)], [0.5, chiaro(lana, 0.14)], [1, scuro(lana, 0.3)]]); c.fill(); tratto(c, CONT, 1.6);
  c.fillStyle = 'rgba(0,0,0,0.24)';
  for (let x = 12.6; x < 28.5; x += 2.6) c.fillRect(x, 46.6, 0.9, 8.4);
}

// dita: [angolo dalla verticale, lunghezza, spessore]
const DITA = [[-0.4, 12.5, 5.6], [-0.13, 16, 5.9], [0.13, 15.5, 5.9], [0.4, 12.5, 5.4]];

export function manoAperta(c, S) {
  const base = (a) => [20 + Math.sin(a) * 8, 29];
  const dito = ([a, l]) => { const [x, y] = base(a); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a) * l, y - Math.cos(a) * l); };
  const pollice = () => { c.beginPath(); c.moveTo(12, 37); c.lineTo(3.5, 27.5); };
  const palmo = () => ellisse(c, 20, 35, 10.5, 11);
  // prima tutti i contorni, poi tutti i riempimenti: la mano sembra un pezzo solo
  for (const d of DITA) { dito(d); tratto(c, CONT, d[2] + 2.6); }
  pollice(); tratto(c, CONT, 8.6);
  palmo(); tratto(c, CONT, 2.6);
  for (const d of DITA) { dito(d); tratto(c, S, d[2]); }
  pollice(); tratto(c, S, 6);
  palmo(); c.fillStyle = S; c.fill();
  // unghie e pieghe
  for (const [a, l] of DITA) {
    const [x, y] = base(a), tx = x + Math.sin(a) * (l - 1.6), ty = y - Math.cos(a) * (l - 1.6);
    ellisse(c, tx, ty, 1.6, 2, a); c.fillStyle = chiaro(S, 0.45); c.fill();
  }
  ellisse(c, 4.6, 28.8, 1.6, 2, -0.85); c.fillStyle = chiaro(S, 0.45); c.fill();
  c.beginPath(); c.moveTo(14, 38); c.quadraticCurveTo(20, 42, 27, 36); tratto(c, scuro(S, 0.25), 0.9);
}

function manoGuerra(c, tipo) {
  const g = PERSONAGGI.guerra;
  polsino(c, g);
  if (tipo === 'presa') {
    // pugno chiuso che stringe: si vedono le nocche delle dita piegate
    const S = g.pelle;
    const palmo = () => rrect(c, 9, 22, 22, 24, 9);
    const nocche = () => { c.beginPath(); for (let i = 0; i < 4; i++) c.roundRect(9.5 + i * 5.3, 17 + Math.abs(i - 1.5) * 1.2, 5.6, 10, 2.8); };
    nocche(); tratto(c, CONT, 2.6); palmo(); tratto(c, CONT, 2.6);
    palmo(); c.fillStyle = S; c.fill(); nocche(); c.fillStyle = S; c.fill();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(10.5 + i * 5.3, 25 + Math.abs(i - 1.5) * 1.2); c.lineTo(14.2 + i * 5.3, 25 + Math.abs(i - 1.5) * 1.2); tratto(c, scuro(S, 0.25), 0.8); }
    c.beginPath(); c.moveTo(9, 36); c.quadraticCurveTo(14, 28, 22, 29); tratto(c, CONT, 8.2); c.beginPath(); c.moveTo(9, 36); c.quadraticCurveTo(14, 28, 22, 29); tratto(c, S, 5.6);
    return;
  }
  if (tipo === 'guanto') {
    // guanto da forno a quadretti: protegge, ci vogliono due schiaffi
    const forma = () => { c.beginPath(); c.moveTo(10, 46); c.lineTo(9, 24); c.bezierCurveTo(9, 6, 31, 6, 31, 22); c.lineTo(30, 46); c.closePath(); };
    const pollice = () => ellisse(c, 6.5, 31, 4.6, 8, -0.5);
    pollice(); c.fillStyle = '#d23c3c'; c.fill(); tratto(c, CONT, 2.2);
    forma(); c.fillStyle = '#d23c3c'; c.fill();
    c.save(); forma(); c.clip();
    c.fillStyle = 'rgba(255,255,255,0.55)';
    for (let x = 6; x < 34; x += 6) c.fillRect(x, 0, 2.6, 48);
    for (let y = 8; y < 48; y += 6) c.fillRect(0, y, 40, 2.6);
    c.fillStyle = gradL(c, 9, 0, 31, 0, [[0, 'rgba(0,0,0,0.2)'], [0.4, 'rgba(255,255,255,0.15)'], [1, 'rgba(0,0,0,0.25)']]); c.fillRect(0, 0, 40, 48);
    c.restore();
    forma(); tratto(c, CONT, 2.4);
    rrect(c, 9, 40, 22, 7, 2.5); c.fillStyle = '#f4efe2'; c.fill(); tratto(c, CONT, 1.8);
    return;
  }
  // aperta (normale) oppure colpita: rossa, con i segni dello schiaffo
  const colpita = tipo === 'colpita';
  manoAperta(c, colpita ? mix(g.pelle, '#ff4a3a', 0.42) : g.pelle);
  if (colpita) {
    c.fillStyle = 'rgba(200,20,20,0.35)';
    for (const [x, y, a] of [[15, 33, -0.4], [20, 31, 0], [25, 33, 0.4]]) { ellisse(c, x, y, 1.8, 6, a); c.fill(); }
  }
}

// pezzo di manica del cardigan di lana (si ripete in verticale per fare il braccio lungo)
function manicaGuerra(c) {
  const col = PERSONAGGI.guerra.vestito.colore;
  c.fillStyle = gradL(c, 0, 0, 18, 0, [[0, scuro(col, 0.35)], [0.45, chiaro(col, 0.14)], [1, scuro(col, 0.4)]]); c.fillRect(1.2, 0, 15.6, 16);
  c.fillStyle = 'rgba(0,0,0,0.17)';
  for (let x = 3.6; x < 16; x += 2.8) c.fillRect(x, 0, 0.9, 16);   // coste della lana, lungo il braccio
  c.fillStyle = CONT; c.fillRect(0, 0, 1.4, 16); c.fillRect(16.6, 0, 1.4, 16);
}

// ------------------------------------------------------------
//  IL PANINO DI MARSUPINO: pane, strati della pila, cose che cadono, tubetti
// ------------------------------------------------------------
// fondo del panino (52x12): crosta sotto, mollica in vista sopra (a y = 3)
function paneSotto(c) {
  c.beginPath(); c.moveTo(2, 3); c.lineTo(50, 3); c.bezierCurveTo(51.5, 9, 47, 11.5, 26, 11.5); c.bezierCurveTo(5, 11.5, 0.5, 9, 2, 3); c.closePath();
  c.fillStyle = gradL(c, 0, 3, 0, 11.5, [[0, '#eaa955'], [1, '#a65e1c']]); c.fill(); tratto(c, CONT, 1.1);
  ellisse(c, 26, 3.2, 24.2, 2.6); c.fillStyle = gradL(c, 0, 0.6, 0, 5.8, [[0, '#fff1cf'], [1, '#efd39a']]); c.fill(); tratto(c, '#c98a3c', 0.8);
  const r = casuale(61);
  c.fillStyle = 'rgba(200,150,80,0.45)';
  for (let i = 0; i < 26; i++) { ellisse(c, 6 + r() * 40, 2 + r() * 2.4, 0.5 + r() * 0.7, 0.3 + r() * 0.4); c.fill(); }
  c.beginPath(); c.moveTo(8, 7.5); c.quadraticCurveTo(26, 9.5, 44, 7.5); tratto(c, 'rgba(255,230,180,0.35)', 1);
}

// cappello del panino (52x22) con i semi di sesamo; la base è a y = 20.5
function paneSopra(c) {
  const forma = () => { c.beginPath(); c.moveTo(2, 19); c.bezierCurveTo(1, 6, 12, 1, 26, 1); c.bezierCurveTo(40, 1, 51, 6, 50, 19); c.quadraticCurveTo(26, 22, 2, 19); c.closePath(); };
  forma(); c.fillStyle = gradR(c, 20, 6, 2, 30, [[0, '#f6c878'], [0.6, '#dc9440'], [1, '#a65e1c']]); c.fill(); tratto(c, CONT, 1.1);
  ellisse(c, 18, 7, 9, 3, -0.3); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fill();
  const r = casuale(62);
  for (let i = 0; i < 16; i++) { ellisse(c, 8 + r() * 36, 4 + r() * 11, 1.1, 0.6, r() * 3); c.fillStyle = '#fff3d0'; c.fill(); tratto(c, 'rgba(150,100,40,0.5)', 0.3); }
}

// strati della pila (54x10, centrati su y = 5)
function strato(c, k) {
  if (k === 'prosciutto') {
    const onda = (x, y0) => y0 + Math.sin(x * 0.45) * 1.1;
    c.beginPath();
    for (let x = 2; x <= 52; x += 2) x === 2 ? c.moveTo(x, onda(x, 3)) : c.lineTo(x, onda(x, 3));
    for (let x = 52; x >= 2; x -= 2) c.lineTo(x, onda(x + 2, 7.6));
    c.closePath();
    c.fillStyle = gradL(c, 0, 2, 0, 8.5, [[0, '#f6b3b5'], [1, '#d9727a']]); c.fill(); tratto(c, '#8a3a40', 0.8);
    c.beginPath(); for (let x = 3; x <= 51; x += 2) x === 3 ? c.moveTo(x, onda(x, 3.3)) : c.lineTo(x, onda(x, 3.3));
    tratto(c, '#fff0ec', 1.2);
  } else if (k === 'wurstel') {
    for (const [x, y] of [[2, 2.6], [27, 2.2]]) {
      rrect(c, x, y, 24, 5.6, 2.8); c.fillStyle = gradL(c, 0, y, 0, y + 5.6, [[0, '#f29a6a'], [0.45, '#d9673c'], [1, '#9c3e1c']]); c.fill(); tratto(c, '#5a2410', 0.8);
      c.beginPath(); c.moveTo(x + 3, y + 1.6); c.lineTo(x + 20, y + 1.6); tratto(c, 'rgba(255,220,190,0.6)', 0.8);
    }
  } else if (k === 'sottiletta') {
    // fetta più larga del pane, con gli angoli che cascano
    c.beginPath(); c.moveTo(0.5, 3); c.lineTo(53.5, 3); c.lineTo(53, 8.8); c.lineTo(49.5, 5.6); c.lineTo(4.5, 5.6); c.lineTo(1, 9.2); c.closePath();
    c.fillStyle = gradL(c, 0, 3, 0, 9, [[0, '#ffd85a'], [1, '#f0a818']]); c.fill(); tratto(c, '#b8780c', 0.8);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(4, 3.4, 30, 0.8);
  } else {
    const [bordo, base, luce] = k === 'ketchup' ? ['#7a0c10', '#e0262c', '#ff8f84'] : ['#b89a3a', '#fff0a8', '#ffffff'];
    const linea = (dy) => { c.beginPath(); for (let x = 3; x <= 51; x += 1.5) { const y = 5 + dy + Math.sin(x * 0.55) * 1.6; x === 3 ? c.moveTo(x, y) : c.lineTo(x, y); } };
    linea(0); tratto(c, bordo, 4.4); linea(0); tratto(c, base, 3); linea(-0.8); tratto(c, luce, 0.8);
  }
}

// cose che cadono (24x22, centrate): ingredienti, schizzi di salsa, roba sbagliata
function cade(c, k) {
  c.save(); c.translate(12, 11);
  if (k === 'prosciutto') {
    c.rotate(-0.25);
    const forma = () => { c.beginPath(); c.moveTo(-10, -3); c.bezierCurveTo(-8, -9, 6, -10, 10, -4); c.bezierCurveTo(12, 1, 8, 8, 0, 8); c.bezierCurveTo(-7, 8, -12, 3, -10, -3); c.closePath(); };
    forma(); c.fillStyle = gradR(c, -2, -2, 1, 12, [[0, '#f8c0c2'], [1, '#d66a72']]); c.fill();
    c.beginPath(); c.moveTo(-10, -3); c.bezierCurveTo(-8, -9, 6, -10, 10, -4); tratto(c, '#fff0ec', 2.2);
    for (const [x, y] of [[-4, 1], [2, -2], [3, 3.5]]) { c.beginPath(); c.moveTo(x - 2.5, y); c.quadraticCurveTo(x, y - 1.2, x + 2.5, y); tratto(c, 'rgba(255,240,240,0.7)', 0.7); }
    forma(); tratto(c, '#8a3a40', 1);
  } else if (k === 'wurstel') {
    c.rotate(-0.5);
    rrect(c, -10.5, -3.6, 21, 7.2, 3.6); c.fillStyle = gradL(c, 0, -3.6, 0, 3.6, [[0, '#f29a6a'], [0.45, '#d9673c'], [1, '#9c3e1c']]); c.fill(); tratto(c, '#5a2410', 1);
    c.beginPath(); c.moveTo(-7, -1.6); c.lineTo(7, -1.6); tratto(c, 'rgba(255,220,190,0.7)', 1);
    for (const s of [-1, 1]) { ellisse(c, s * 10.6, 0, 1, 1.4); c.fillStyle = '#7a2e12'; c.fill(); }
  } else if (k === 'sottiletta') {
    c.rotate(0.15);
    rrect(c, -8.5, -7.5, 17, 15, 1.2); c.fillStyle = gradL(c, 0, -7.5, 0, 7.5, [[0, '#ffdc66'], [1, '#f0a818']]); c.fill(); tratto(c, '#b8780c', 1);
    poli(c, [[2, -7.5], [8.5, -7.5], [8.5, -1]]); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill(); tratto(c, 'rgba(180,180,180,0.8)', 0.5); // la plastica che si stacca
  } else if (k === 'ketchup' || k === 'maionese') {
    const [bordo, base, luce] = k === 'ketchup' ? ['#7a0c10', '#e0262c', '#ff9a90'] : ['#a88a2a', '#fff2b0', '#ffffff'];
    c.beginPath(); c.moveTo(0, -9); c.bezierCurveTo(6, -2, 7, 3, 5, 6); c.bezierCurveTo(3, 9.5, -3, 9.5, -5, 6); c.bezierCurveTo(-7, 3, -6, -2, 0, -9); c.closePath();
    c.fillStyle = base; c.fill(); tratto(c, bordo, 1);
    ellisse(c, -2, 2, 1.5, 3, -0.3); c.fillStyle = luce; c.fill();
  } else if (k === 'calzino') {
    c.rotate(0.35);
    const forma = () => { c.beginPath(); c.moveTo(-4, -10); c.lineTo(4, -10); c.lineTo(4, 3); c.bezierCurveTo(4, 5, 6, 5, 9, 5); c.bezierCurveTo(12.5, 5, 12.5, 10, 9, 10); c.lineTo(-1, 10); c.bezierCurveTo(-4.5, 10, -4, 7, -4, 5); c.closePath(); };
    forma(); c.fillStyle = '#f2f0ea'; c.fill();
    c.save(); forma(); c.clip();
    c.fillStyle = '#d83a3a'; c.fillRect(-5, -9, 10, 2); c.fillStyle = '#2f6fd8'; c.fillRect(-5, -5.5, 10, 2);
    c.fillStyle = 'rgba(120,110,100,0.35)'; ellisse(c, 9.5, 7.5, 3.5, 3); c.fill(); ellisse(c, -2, 8, 3, 3); c.fill();
    c.restore();
    forma(); tratto(c, CONT, 1);
    for (const x of [-1, 3]) { c.beginPath(); c.moveTo(x, -12); c.quadraticCurveTo(x + 2, -14, x, -16); c.quadraticCurveTo(x - 2, -18, x, -20); tratto(c, 'rgba(110,170,50,0.85)', 0.9); }
  } else if (k === 'lisca') {
    c.rotate(-0.2);
    c.beginPath(); c.moveTo(-4, 0); c.lineTo(8, 0); tratto(c, '#5d6575', 2.6); c.beginPath(); c.moveTo(-4, 0); c.lineTo(8, 0); tratto(c, '#eef2f5', 1.3);
    for (let i = 0; i < 5; i++) {
      const x = -2 + i * 2.4;
      c.beginPath(); c.moveTo(x - 1, -4.8); c.quadraticCurveTo(x + 1, 0, x - 1, 4.8); tratto(c, '#5d6575', 1.9);
      c.beginPath(); c.moveTo(x - 1, -4.8); c.quadraticCurveTo(x + 1, 0, x - 1, 4.8); tratto(c, '#eef2f5', 0.8);
    }
    poli(c, [[8, 0], [12, -4.8], [10.8, 0], [12, 4.8]]); c.fillStyle = '#e4eaee'; c.fill(); tratto(c, '#5d6575', 0.8);
    c.beginPath(); c.moveTo(-11, 0); c.quadraticCurveTo(-8, -6, -4, -5); c.lineTo(-4, 5); c.quadraticCurveTo(-8, 6, -11, 0); c.closePath();
    c.fillStyle = '#dfe6ea'; c.fill(); tratto(c, '#5d6575', 0.9);
    c.beginPath(); c.moveTo(-8.3, -2.8); c.lineTo(-6.3, -0.8); c.moveTo(-8.3, -0.8); c.lineTo(-6.3, -2.8); tratto(c, '#2b1b17', 0.7); // occhio a X
  } else if (k === 'ghiaccio') {
    poli(c, [[-7, -3], [4, -3], [4, 8], [-7, 8]]); c.fillStyle = 'rgba(170,220,250,0.9)'; c.fill(); tratto(c, '#3d7fa8', 0.9);
    poli(c, [[-7, -3], [-3, -7], [8, -7], [4, -3]]); c.fillStyle = 'rgba(225,246,255,0.95)'; c.fill(); tratto(c, '#3d7fa8', 0.9);
    poli(c, [[4, -3], [8, -7], [8, 4], [4, 8]]); c.fillStyle = 'rgba(120,180,225,0.95)'; c.fill(); tratto(c, '#3d7fa8', 0.9);
    c.beginPath(); c.moveTo(-5, 5.5); c.lineTo(-5, -1); c.lineTo(1, -1); tratto(c, 'rgba(255,255,255,0.85)', 0.9);
  } else if (k === 'ciabatta') {
    c.rotate(0.5);
    ellisse(c, 0, 0.5, 5.6, 10.5); c.fillStyle = '#f08ab2'; c.fill(); tratto(c, CONT, 1);
    ellisse(c, 0, 1.5, 4, 8.5); c.fillStyle = '#ffc6dc'; c.fill();
    c.beginPath(); c.ellipse(0, -3.5, 6.2, 4.6, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); tratto(c, CONT, 0.9);
    for (let i = 0; i < 6; i++) { ellisse(c, -5 + i * 2, -3.7, 1.4, 1.4); c.fillStyle = '#ffffff'; c.fill(); }
    ellisse(c, 0, -6.5, 2.2, 2.2); c.fillStyle = '#f08ab2'; c.fill(); tratto(c, CONT, 0.6);
  }
  c.restore();
}

// tubetto (18x40) capovolto: il beccuccio è in basso, a (9, 39)
function tubetto(c, salsa) {
  const [corpo, tappo] = salsa === 'ketchup' ? ['#d6262c', '#f4f4f4'] : ['#fff1b8', '#2f6fd8'];
  rrect(c, 2, 2, 14, 27, [6, 6, 3, 3]); c.fillStyle = gradL(c, 2, 0, 16, 0, [[0, scuro(corpo, 0.25)], [0.35, chiaro(corpo, 0.25)], [1, scuro(corpo, 0.3)]]); c.fill(); tratto(c, CONT, 1.1);
  rrect(c, 3.5, 10, 11, 10, 1.5); c.fillStyle = '#ffffff'; c.fill(); tratto(c, 'rgba(0,0,0,0.25)', 0.5);
  if (salsa === 'ketchup') {
    ellisse(c, 9, 15.5, 3.2, 2.8); c.fillStyle = '#e0262c'; c.fill(); tratto(c, '#7a0c10', 0.5);
    poli(c, [[7.5, 12.6], [9, 13.4], [10.5, 12.6], [9, 12]]); c.fillStyle = '#3aa64a'; c.fill();
  } else {
    ellisse(c, 9, 15, 2.6, 3.2); c.fillStyle = '#ffffff'; c.fill(); tratto(c, '#b8a060', 0.5);
    ellisse(c, 9, 15.8, 1.5, 1.5); c.fillStyle = '#ffc83a'; c.fill();
  }
  rrect(c, 4, 28.5, 10, 4.5, 1.2); c.fillStyle = tappo; c.fill(); tratto(c, CONT, 0.9);
  poli(c, [[6.5, 33], [11.5, 33], [9.8, 38.5], [8.2, 38.5]]); c.fillStyle = tappo; c.fill(); tratto(c, CONT, 0.8);
  ellisse(c, 9, 39, 1.2, 0.9); c.fillStyle = salsa === 'ketchup' ? '#e0262c' : '#fff2b0'; c.fill();
}

// ------------------------------------------------------------
//  GUERRA, VIA QUELLE MANI: piatti di cibo (64x40, centro del piatto a 32, 23) e la mano di chi gioca
// ------------------------------------------------------------
function piatto(c, cibo) {
  ellisse(c, 32, 26, 30, 13); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fill();
  ellisse(c, 32, 23, 30, 14); c.fillStyle = gradL(c, 0, 9, 0, 37, [[0, '#ffffff'], [1, '#d9dee6']]); c.fill(); tratto(c, '#7b8492', 1);
  ellisse(c, 32, 23, 21, 9.5); c.fillStyle = '#f4f6f9'; c.fill(); tratto(c, 'rgba(120,130,150,0.5)', 0.7);
  c.beginPath(); c.ellipse(32, 23, 26, 12, 0, Math.PI * 1.1, Math.PI * 1.6); tratto(c, '#3a6fd8', 0.9); // bordino blu
  const r = casuale(cibo.length * 7);
  if (cibo === 'spaghetti') {
    ellisse(c, 32, 20, 15, 8); c.fillStyle = '#f2c95a'; c.fill();
    for (let i = 0; i < 22; i++) {
      const x = 19 + r() * 26, y = 14 + r() * 11;
      c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 4, y - 3, x + 6, y + 3, x + 10 * (r() - 0.3), y + 2); tratto(c, i % 3 ? '#e8b440' : '#fff0a0', 1);
    }
    ellisse(c, 32, 16, 8, 4); c.fillStyle = '#d8322a'; c.fill(); tratto(c, '#8a1a14', 0.6);
    ellisse(c, 30, 15, 2.5, 1.2); c.fillStyle = 'rgba(255,160,140,0.6)'; c.fill();
    poli(c, [[34, 13], [38, 11], [37, 14.5]]); c.fillStyle = '#3aa64a'; c.fill();
  } else if (cibo === 'pizza') {
    ellisse(c, 32, 21, 19, 9.5); c.fillStyle = '#d8964a'; c.fill(); tratto(c, '#8a5a24', 0.8);
    ellisse(c, 32, 21, 16, 7.8); c.fillStyle = '#d8402e'; c.fill();
    for (const [x, y] of [[25, 19], [36, 18], [30, 24], [40, 23], [22, 23]]) { ellisse(c, x, y, 3, 1.8); c.fillStyle = '#fff6e0'; c.fill(); }
    for (const [x, y] of [[29, 18], [38, 21]]) { ellisse(c, x, y, 1.8, 1, 0.5); c.fillStyle = '#2f8a3c'; c.fill(); }
    c.beginPath(); c.moveTo(32, 21); c.lineTo(48, 21); tratto(c, 'rgba(120,60,20,0.6)', 0.6);
  } else if (cibo === 'cotoletta') {
    for (let i = 0; i < 9; i++) { rrect(c, 38 + r() * 10, 13 + r() * 9, 2.4, 9, 1); c.fillStyle = '#ffd34a'; c.fill(); tratto(c, '#c8901a', 0.4); }
    c.beginPath(); c.moveTo(16, 21); c.bezierCurveTo(15, 12, 30, 10, 36, 15); c.bezierCurveTo(42, 20, 36, 30, 26, 29); c.bezierCurveTo(19, 28, 16, 26, 16, 21); c.closePath();
    c.fillStyle = gradR(c, 25, 18, 1, 14, [[0, '#f0b65a'], [1, '#b8701e']]); c.fill(); tratto(c, '#7a4a14', 0.8);
    for (let i = 0; i < 26; i++) { ellisse(c, 18 + r() * 18, 14 + r() * 13, 0.5, 0.5); c.fillStyle = 'rgba(120,70,20,0.5)'; c.fill(); }
    ellisse(c, 23, 15, 4, 2.6); c.fillStyle = '#fff36a'; c.fill(); tratto(c, '#c8b018', 0.5); // limone
  } else if (cibo === 'lasagna') {
    const strati = [['#f0d080', 0], ['#c8402e', 2.2], ['#fff4dc', 4.2], ['#f0d080', 6], ['#c8402e', 8]];
    for (const [col, dy] of strati) { poli(c, [[20, 26 - dy], [42, 26 - dy], [46, 22 - dy], [24, 22 - dy]]); c.fillStyle = col; c.fill(); }
    poli(c, [[20, 18], [42, 18], [46, 14], [24, 14]]); c.fillStyle = '#f2c24a'; c.fill(); tratto(c, '#9a6a1c', 0.6);
    for (let i = 0; i < 6; i++) { ellisse(c, 26 + r() * 16, 15 + r() * 2.5, 1.6, 0.8); c.fillStyle = '#c8701e'; c.fill(); }
    poli(c, [[20, 26], [42, 26], [42, 18], [20, 18]]); tratto(c, '#7a3a14', 0.7);
    poli(c, [[42, 26], [46, 22], [46, 14], [42, 18]]); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fill(); tratto(c, '#7a3a14', 0.7);
  } else if (cibo === 'tiramisu') {
    poli(c, [[22, 27], [40, 27], [40, 15], [22, 15]]); c.fillStyle = '#fff2d8'; c.fill();
    for (const y of [24, 19.5]) { c.fillStyle = '#9a5a2a'; c.fillRect(22, y, 18, 2.2); }
    poli(c, [[40, 27], [44, 23], [44, 11], [40, 15]]); c.fillStyle = '#ead8b8'; c.fill(); tratto(c, '#6a3a1a', 0.6);
    poli(c, [[22, 15], [40, 15], [44, 11], [26, 11]]); c.fillStyle = '#6a3a1a'; c.fill(); tratto(c, '#3a1e0c', 0.6);
    for (let i = 0; i < 20; i++) { ellisse(c, 25 + r() * 17, 11.5 + r() * 3, 0.5, 0.4); c.fillStyle = '#3a1e0c'; c.fill(); }
    poli(c, [[22, 27], [40, 27], [40, 15], [22, 15]]); tratto(c, '#6a3a1a', 0.6);
    rrect(c, 46, 20, 12, 2, 1); c.fillStyle = '#c9ced8'; c.fill(); tratto(c, '#5d6575', 0.4); // cucchiaino
  }
}

// la mano di chi gioca (stessa forma di quelle di Guerra), manica nera
function manoMia(c) {
  rrect(c, 10.5, 44, 19, 12, 3); c.fillStyle = '#24242e'; c.fill(); tratto(c, CONT, 1.6);
  manoAperta(c, '#e9b58d');
}

// ------------------------------------------------------------
//  SEGO, SONO SOTTO CASA: finestre con le persiane (58x44, vano 32x36 al centro), fumogeni
// ------------------------------------------------------------
function persiana(c, x, y, w, h) {
  rrect(c, x, y, w, h, 0.8); c.fillStyle = gradL(c, x, 0, x + w, 0, [[0, '#2f7a4a'], [0.5, '#3f9a5e'], [1, '#2a6a40']]); c.fill(); tratto(c, '#173a24', 0.8);
  for (let yy = y + 3; yy < y + h - 1; yy += 3) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x + 1.5, yy, w - 3, 0.8); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 1.5, yy + 0.8, w - 3, 0.6); }
}

function finestra(c, aperta) {
  if (aperta) {
    // persiane spalancate ai lati, tendina in alto; il vano resta trasparente (dentro si vede la stanza)
    persiana(c, 1, 4, 11, 36); persiana(c, 46, 4, 11, 36);
    rrect(c, 12.5, 3.5, 33, 37, 0.5); tratto(c, '#f4f1ea', 2);
    c.beginPath(); c.moveTo(13, 4); for (let x = 13; x <= 45; x += 4) c.quadraticCurveTo(x + 2, 12, x + 4, 9); c.lineTo(45, 4); c.closePath();
    c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill(); tratto(c, 'rgba(180,180,190,0.9)', 0.5);
  } else {
    persiana(c, 13, 4, 16, 36); persiana(c, 29, 4, 16, 36);
    c.fillStyle = '#173a24'; c.fillRect(28.5, 4, 1, 36);
    for (const y of [9, 34]) { c.fillStyle = '#2a2a30'; c.fillRect(12, y, 2, 2); c.fillRect(44, y, 2, 2); }
    ellisse(c, 31.5, 22, 0.9, 0.9); c.fillStyle = '#c8a040'; c.fill();
  }
}

// fumogeno: corpo chiaro che la scena colora con setTint, tappo scuro e linguetta
function granata(c) {
  rrect(c, 2, 7, 9, 15, 2.5); c.fillStyle = gradL(c, 2, 0, 11, 0, [[0, '#c8c8c8'], [0.4, '#ffffff'], [1, '#a8a8a8']]); c.fill(); tratto(c, '#2a2a30', 0.8);
  c.fillStyle = '#ffffff'; c.fillRect(2.6, 12, 7.8, 4); c.fillStyle = 'rgba(40,40,48,0.6)'; c.fillRect(2.6, 12, 7.8, 0.8); c.fillRect(2.6, 15.2, 7.8, 0.8);
  rrect(c, 3, 3, 7, 5, 1); c.fillStyle = '#3a3a44'; c.fill(); tratto(c, '#1c1c22', 0.6);
  c.beginPath(); c.arc(10.5, 3.5, 2, 0, 6.3); tratto(c, '#8a8f9c', 0.8);
}

const COLORI_FUMO = ['#ff4a5a', '#ffc93a', '#4ad97a', '#4aa8ff', '#b06aff', '#ff8a3a'];
function cassaFumogeni(c) {
  COLORI_FUMO.forEach((col, i) => {
    const x = 8 + i * 11, y = 4 + (i % 2) * 3;
    rrect(c, x, y, 8, 16, 2); c.fillStyle = gradL(c, x, 0, x + 8, 0, [[0, scuro(col, 0.3)], [0.4, chiaro(col, 0.3)], [1, scuro(col, 0.35)]]); c.fill(); tratto(c, '#2a2a30', 0.7);
    rrect(c, x + 1, y - 2, 6, 3.5, 1); c.fillStyle = '#3a3a44'; c.fill();
  });
  rrect(c, 2, 16, 76, 26, 2); c.fillStyle = gradL(c, 0, 16, 0, 42, [[0, '#c8904a'], [1, '#8a5a28']]); c.fill(); tratto(c, '#4a2c10', 1);
  for (const y of [24, 33]) { c.fillStyle = 'rgba(60,30,10,0.4)'; c.fillRect(3, y, 74, 1); }
  for (const x of [6, 72]) { c.fillStyle = '#6a4018'; c.fillRect(x - 2, 17, 4, 24); }
  rrect(c, 24, 25, 32, 9, 1); c.fillStyle = '#f2e6c8'; c.fill(); tratto(c, '#8a5a28', 0.6);
  c.fillStyle = '#d83a3a'; for (let k = 0; k < 3; k++) { ellisse(c, 31 + k * 9, 29.5, 2.4, 2.4); c.fill(); }
}

function creaPanino(scene) {
  tela(scene, 'paneSotto', 52, 12, paneSotto, 6);
  tela(scene, 'paneSopra', 52, 22, paneSopra, 6);
  for (const k of ['prosciutto', 'wurstel', 'sottiletta', 'ketchup', 'maionese']) tela(scene, 'strato_' + k, 54, 10, (c) => strato(c, k), 6);
  for (const k of ['prosciutto', 'wurstel', 'sottiletta', 'ketchup', 'maionese', 'calzino', 'lisca', 'ghiaccio', 'ciabatta']) tela(scene, 'pan_' + k, 24, 22, (c) => cade(c, k), 6);
  for (const s of ['ketchup', 'maionese']) tela(scene, 'tubetto_' + s, 18, 40, (c) => tubetto(c, s), 6);
}

// ------------------------------------------------------------
//  BARBIERE: rasoio, pennello, bacinella
// ------------------------------------------------------------
function rasoio(c) {
  // testina (il punto che rade è al centro in alto: 12, 4)
  rrect(c, 1, 1, 22, 7, 2); c.fillStyle = gradL(c, 0, 1, 0, 8, [[0, '#ffffff'], [0.5, '#c9d0da'], [1, '#7b8492']]); c.fill(); tratto(c, '#3a3f49', 0.8);
  c.fillStyle = '#eef2f6'; c.fillRect(2.5, 6.6, 19, 1); c.fillStyle = '#3a3f49'; c.fillRect(3, 3.6, 18, 0.5);
  rrect(c, 10, 7.5, 4, 5, 1); c.fillStyle = '#9aa3b0'; c.fill(); tratto(c, '#3a3f49', 0.7);
  rrect(c, 9.2, 12, 5.6, 23, 2.6); c.fillStyle = gradL(c, 9, 0, 15, 0, [[0, '#147a72'], [0.4, '#58dccf'], [1, '#0f5e58']]); c.fill(); tratto(c, '#0a3c38', 0.8);
  for (const y of [18, 22, 26]) { c.fillStyle = 'rgba(0,50,46,0.5)'; c.fillRect(9.6, y, 4.8, 0.8); }
}

function pennello(c) {
  // setole insaponate in alto (punto attivo: 11, 6), manico in legno
  c.beginPath(); c.moveTo(4, 15); c.bezierCurveTo(0, 6, 5, 0.5, 11, 0.5); c.bezierCurveTo(17, 0.5, 22, 6, 18, 15); c.closePath();
  c.fillStyle = gradL(c, 0, 0, 0, 15, [[0, '#ffffff'], [1, '#d9c7a2']]); c.fill(); tratto(c, '#8a7a5c', 0.8);
  for (const [x, y, r] of [[7, 5, 2.6], [12, 3.5, 3], [15.5, 6.5, 2.4], [9.5, 8.5, 2.2]]) { ellisse(c, x, y, r, r); c.fillStyle = '#ffffff'; c.fill(); tratto(c, 'rgba(150,180,220,0.6)', 0.35); }
  rrect(c, 4.5, 14, 13, 4, 1.2); c.fillStyle = gradL(c, 4, 0, 18, 0, [[0, '#8a8f9c'], [0.4, '#f1f3f6'], [1, '#7b8492']]); c.fill(); tratto(c, '#3a3f49', 0.7);
  c.beginPath(); c.moveTo(6, 18); c.bezierCurveTo(4, 26, 7, 30, 7.5, 36); c.lineTo(14.5, 36); c.bezierCurveTo(15, 30, 18, 26, 16, 18); c.closePath();
  c.fillStyle = gradL(c, 5, 0, 17, 0, [[0, '#6a3a1a'], [0.4, '#c8834a'], [1, '#5a3014']]); c.fill(); tratto(c, CONT, 0.8);
}

function bacinella(c) {
  ellisse(c, 38, 40, 34, 5); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  c.beginPath(); c.moveTo(4, 16); c.bezierCurveTo(6, 36, 20, 42, 38, 42); c.bezierCurveTo(56, 42, 70, 36, 72, 16); c.closePath();
  c.fillStyle = gradL(c, 4, 0, 72, 0, [[0, '#9aa3b0'], [0.3, '#f4f6f9'], [0.7, '#cfd5de'], [1, '#7b8492']]); c.fill(); tratto(c, '#3a3f49', 1);
  ellisse(c, 38, 16, 34, 8); c.fillStyle = '#e8ecf2'; c.fill(); tratto(c, '#3a3f49', 1);
  ellisse(c, 38, 17, 30, 6); c.fillStyle = gradL(c, 0, 11, 0, 23, [[0, '#8fd6f2'], [1, '#3d9fd0']]); c.fill();
  c.beginPath(); c.ellipse(32, 16, 12, 2.4, 0, 0, Math.PI * 2); tratto(c, 'rgba(255,255,255,0.6)', 0.7);
  for (const [x, y, r] of [[52, 15, 3], [56, 18, 2.2], [48, 19, 1.8], [20, 18, 2]]) { ellisse(c, x, y, r, r * 0.7); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill(); }
}

// ------------------------------------------------------------
//  TORRONDACELLI: ombrelloni, cannone, bagnarole dei pirati, pirati a nuoto, munizioni
// ------------------------------------------------------------
// un pirata da operetta (testa e spalle) in (x, y), grande s; v: 0 bandana, 1 cappello, 2 pappagallo
function pirata(c, x, y, s, v) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -7, 4, 14, 8, 3); c.fillStyle = ['#2f3c66', '#7a1f2a', '#2e6b3a'][v % 3]; c.fill(); tratto(c, CONT, 1);
  c.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 3; i++) c.fillRect(-6, 5.5 + i * 2.2, 12, 0.9);
  ellisse(c, 0, 0, 6.5, 7); c.fillStyle = '#f0c09a'; c.fill(); tratto(c, CONT, 1);
  c.beginPath(); c.moveTo(-3.5, 3); c.quadraticCurveTo(0, 1.6, 3.5, 3); tratto(c, '#3a2414', 1.4);         // baffoni
  ellisse(c, 2.3, -1, 1.2, 1.2); c.fillStyle = CONT; c.fill();
  ellisse(c, -2.4, -1, 1.8, 1.6); c.fillStyle = '#141418'; c.fill();                                     // benda
  c.beginPath(); c.moveTo(-6.5, -3); c.lineTo(5.5, -5.5); tratto(c, '#141418', 0.7);
  if (v === 1) {
    poli(c, [[-10, -4], [0, -12], [10, -4], [0, -6]]); c.fillStyle = '#1c1c22'; c.fill(); tratto(c, CONT, 0.8);
    ellisse(c, 0, -8, 1.6, 1.4); c.fillStyle = '#ffffff'; c.fill();
  } else {
    c.beginPath(); c.ellipse(0, -3, 7, 5, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#d83a3a'; c.fill(); tratto(c, CONT, 0.8);
    c.fillStyle = 'rgba(255,255,255,0.85)'; for (const [dx, dy] of [[-3, -5], [1, -6], [4, -4]]) { ellisse(c, dx, dy, 0.8, 0.8); c.fill(); }
    poli(c, [[6, -3], [10, -1], [8.5, 1]]); c.fillStyle = '#d83a3a'; c.fill();
  }
  if (v === 2) {   // pappagallo sulla spalla
    ellisse(c, 9, 1, 3, 4); c.fillStyle = '#3ac04a'; c.fill(); tratto(c, CONT, 0.7);
    poli(c, [[10.5, -2], [13, -1], [11, 0]]); c.fillStyle = '#f2c43a'; c.fill();
    ellisse(c, 8.6, -1.5, 0.6, 0.6); c.fillStyle = CONT; c.fill();
  }
  c.restore();
}

// bagnarole viste dalla riva, centro in basso a metà: gommone (64x34), pedalò (64x36), galeone (90x64)
function bagnarola(c, tipo) {
  if (tipo === 'gommone') {
    pirata(c, 22, 13, 1, 0); pirata(c, 41, 12, 1, 2);
    rrect(c, 3, 17, 58, 14, 7); c.fillStyle = gradL(c, 0, 17, 0, 31, [[0, '#ffb24a'], [1, '#d86a10']]); c.fill(); tratto(c, CONT, 1.2);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(8, 19, 46, 2);
    for (const x of [14, 32, 50]) { c.beginPath(); c.moveTo(x, 18); c.lineTo(x, 30); tratto(c, 'rgba(120,50,0,0.4)', 0.8); }
    c.beginPath(); c.moveTo(6, 23); c.quadraticCurveTo(32, 28, 58, 23); tratto(c, '#2a2a30', 0.8);
  } else if (tipo === 'pedalo') {
    poli(c, [[44, 6], [52, 6], [58, 24], [52, 24]]); c.fillStyle = '#f2c43a'; c.fill(); tratto(c, CONT, 1);   // scivolo
    pirata(c, 20, 13, 1, 1); pirata(c, 37, 13, 1, 0);
    rrect(c, 2, 19, 60, 14, [3, 3, 8, 8]); c.fillStyle = gradL(c, 0, 19, 0, 33, [[0, '#ffffff'], [1, '#c8d8e8']]); c.fill(); tratto(c, CONT, 1.2);
    rrect(c, 2, 19, 60, 4, 2); c.fillStyle = '#2f6fd8'; c.fill();
    for (const x of [14, 50]) { ellisse(c, x, 30, 4, 2); c.fillStyle = 'rgba(40,60,100,0.35)'; c.fill(); }
  } else {
    // galeone gonfiabile con la bandiera
    c.beginPath(); c.moveTo(45, 4); c.lineTo(45, 40); tratto(c, '#5a3a1a', 2.2);
    poli(c, [[46, 6], [72, 9], [70, 24], [46, 22]]); c.fillStyle = '#18181e'; c.fill(); tratto(c, CONT, 0.8);
    ellisse(c, 58, 13, 3.6, 3.4); c.fillStyle = '#ffffff'; c.fill();
    for (const dx of [-1.3, 1.3]) { ellisse(c, 58 + dx, 12.6, 0.8, 0.9); c.fillStyle = '#18181e'; c.fill(); }
    c.beginPath(); c.moveTo(53, 17); c.lineTo(63, 21); c.moveTo(63, 17); c.lineTo(53, 21); tratto(c, '#ffffff', 1.1);
    pirata(c, 22, 33, 1.1, 1); pirata(c, 40, 32, 1.1, 2); pirata(c, 62, 33, 1.1, 0);
    c.beginPath(); c.moveTo(2, 38); c.quadraticCurveTo(4, 60, 20, 61); c.lineTo(70, 61); c.quadraticCurveTo(86, 60, 88, 38); c.closePath();
    c.fillStyle = gradL(c, 0, 38, 0, 61, [[0, '#b8783a'], [1, '#6a3a14']]); c.fill(); tratto(c, CONT, 1.3);
    for (const y of [45, 53]) { c.beginPath(); c.moveTo(5, y); c.quadraticCurveTo(45, y + 3, 85, y); tratto(c, 'rgba(60,30,10,0.5)', 1); }
    for (const x of [22, 45, 68]) { ellisse(c, x, 49, 3, 3); c.fillStyle = '#1c1c22'; c.fill(); tratto(c, '#e8c048', 0.8); }   // oblò
    rrect(c, 0, 36, 90, 5, 2.5); c.fillStyle = '#e8c048'; c.fill(); tratto(c, CONT, 1);
  }
}

function ombrellone(c) {
  ellisse(c, 20, 44, 13, 2.5); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fill();
  c.fillStyle = '#e8e2d4'; c.fillRect(19, 12, 2, 32);
  const tela = () => { c.beginPath(); c.moveTo(1, 16); c.quadraticCurveTo(20, -4, 39, 16); c.quadraticCurveTo(34.5, 13, 29.5, 16); c.quadraticCurveTo(25, 13, 20, 16); c.quadraticCurveTo(15, 13, 10.5, 16); c.quadraticCurveTo(5.5, 13, 1, 16); c.closePath(); };
  tela(); c.fillStyle = '#ffffff'; c.fill();
  c.save(); tela(); c.clip();
  for (let i = 0; i < 4; i++) { poli(c, [[20, 2], [1 + i * 9.5 * 1.05, 18], [5.5 + i * 9.5 * 1.05, 18]]); c.fillStyle = '#d83a3a'; c.fill(); }
  c.restore();
  tela(); tratto(c, CONT, 1.1);
  ellisse(c, 20, 3.5, 1.4, 1.4); c.fillStyle = '#e8e2d4'; c.fill(); tratto(c, CONT, 0.6);
}

function cannone(c) {
  // canna (40x16): perno a sinistra (4, 8), bocca a destra
  rrect(c, 2, 2.5, 36, 11, [5.5, 3, 3, 5.5]); c.fillStyle = gradL(c, 0, 2.5, 0, 13.5, [[0, '#6a6e7a'], [0.35, '#2a2c34'], [1, '#101116']]); c.fill(); tratto(c, '#000000', 1);
  for (const x of [12, 24]) { rrect(c, x, 2, 3, 12, 1); c.fillStyle = '#c8a040'; c.fill(); tratto(c, '#5a4010', 0.6); }
  rrect(c, 34, 1, 5, 14, 2); c.fillStyle = '#2a2c34'; c.fill(); tratto(c, '#000000', 1);
  c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(6, 4.5, 26, 1.4);
}
function affusto(c) {
  poli(c, [[4, 4], [34, 4], [38, 16], [2, 16]]); c.fillStyle = gradL(c, 0, 4, 0, 16, [[0, '#a8743a'], [1, '#6a4018']]); c.fill(); tratto(c, CONT, 1);
  for (const x of [9, 31]) { ellisse(c, x, 17, 6.5, 6.5); c.fillStyle = '#7a4a1e'; c.fill(); tratto(c, CONT, 1); ellisse(c, x, 17, 2, 2); c.fillStyle = '#c8a040'; c.fill(); for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x, 17); c.lineTo(x + Math.cos(k * 0.785 * 2) * 6, 17 + Math.sin(k * 0.785 * 2) * 6); tratto(c, '#4a2a0e', 0.8); } }
}

function cassaMunizioni(c) {
  rrect(c, 1, 3, 22, 13, 2); c.fillStyle = gradL(c, 0, 3, 0, 16, [[0, '#6a7a3a'], [1, '#3e4a20']]); c.fill(); tratto(c, CONT, 1);
  c.fillStyle = '#e8c048'; c.fillRect(1.5, 8, 21, 3);
  for (const x of [5, 12, 19]) { ellisse(c, x, 9.5, 1.6, 1.6); c.fillStyle = '#18181e'; c.fill(); }
  rrect(c, 8, 0.5, 8, 3.5, 1.5); tratto(c, '#2a2a20', 1.2);
}

function pirataNuota(c) {
  ellisse(c, 12, 12, 11, 4.5); c.fillStyle = '#ff8a2a'; c.fill(); tratto(c, CONT, 1);
  c.fillStyle = '#ffffff'; for (const x of [4, 12, 20]) c.fillRect(x - 1.5, 9, 3, 6);
  pirata(c, 12, 7, 0.8, 0);
  ellisse(c, 12, 12.5, 7, 2.2); c.fillStyle = '#3fa0d0'; c.fill();
}

function spruzzo(c) {
  for (const [x, y, rr] of [[12, 16, 7], [6, 13, 4.5], [18, 13, 4.5], [12, 9, 4], [8, 6, 2.5], [16, 5, 2.5], [12, 3, 2]]) {
    ellisse(c, x, y, rr, rr * 0.9); c.fillStyle = gradR(c, x - 1, y - 1, 0.5, rr, [[0, '#ffffff'], [1, 'rgba(200,235,250,0.85)']]); c.fill();
  }
}

function creaRonda(scene) {
  for (const t of ['gommone', 'pedalo']) tela(scene, 'barca_' + t, 64, 36, (c) => bagnarola(c, t), 5);
  tela(scene, 'barca_galeone', 90, 64, (c) => bagnarola(c, 'galeone'), 5);
  tela(scene, 'ombrellone', 40, 46, ombrellone, 5);
  tela(scene, 'cannone', 40, 16, cannone, 6);
  tela(scene, 'affusto', 40, 24, affusto, 6);
  tela(scene, 'cassaMunizioni', 24, 17, cassaMunizioni, 6);
  tela(scene, 'pirataNuota', 24, 18, pirataNuota, 6);
  tela(scene, 'spruzzo', 24, 20, spruzzo, 5);
  tela(scene, 'palla', 8, 8, (c) => { ellisse(c, 4, 4, 3.6, 3.6); c.fillStyle = gradR(c, 3, 3, 0.3, 3.6, [[0, '#8a8e9a'], [1, '#141418']]); c.fill(); }, 8);
}

// ------------------------------------------------------------
//  L'INGIOCABILE: carte, semi, fiches, sabot, avambraccio a spazzola
// ------------------------------------------------------------
export function seme(c, x, y, k, tipo) {
  c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath();
  if (tipo === 'cuori') { c.moveTo(0, 4); c.bezierCurveTo(-6, -1, -4, -6, 0, -3); c.bezierCurveTo(4, -6, 6, -1, 0, 4); }
  else if (tipo === 'quadri') { c.moveTo(0, -5); c.lineTo(3.6, 0); c.lineTo(0, 5); c.lineTo(-3.6, 0); }
  else if (tipo === 'picche') { c.moveTo(0, -5); c.bezierCurveTo(5, -1, 5, 3, 1, 2.2); c.lineTo(2, 5); c.lineTo(-2, 5); c.lineTo(-1, 2.2); c.bezierCurveTo(-5, 3, -5, -1, 0, -5); }
  else { for (const [dx, dy] of [[0, -2.4], [-2.6, 1], [2.6, 1]]) { c.moveTo(dx + 2.3, dy); c.arc(dx, dy, 2.3, 0, 6.3); } c.moveTo(-0.6, 1); c.lineTo(-2, 5); c.lineTo(2, 5); c.lineTo(0.6, 1); }
  c.closePath();
  c.fillStyle = tipo === 'cuori' || tipo === 'quadri' ? '#d22a34' : '#16161c'; c.fill('nonzero');
  c.restore();
}

function carta(c, dorso) {
  rrect(c, 1, 1.5, 26, 36, 3); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
  rrect(c, 0.5, 0.5, 26, 36, 3); c.fillStyle = dorso ? '#f6f6f2' : gradL(c, 0, 0, 0, 36, [[0, '#ffffff'], [1, '#ece8de']]); c.fill(); tratto(c, '#8a8478', 0.6);
  if (!dorso) return;
  rrect(c, 2.5, 2.5, 22, 32, 2); c.fillStyle = '#2a4ab8'; c.fill();
  c.save(); rrect(c, 2.5, 2.5, 22, 32, 2); c.clip();
  for (let k = -40; k < 40; k += 3.2) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 40, 40); c.moveTo(k + 40, 0); c.lineTo(k, 40); tratto(c, 'rgba(255,255,255,0.22)', 0.6); }
  c.restore();
  ellisse(c, 13.5, 18.5, 5.5, 7.5); c.fillStyle = '#c0392b'; c.fill(); tratto(c, '#ffffff', 0.8);
  seme(c, 13.5, 18.5, 0.75, 'picche');
}

function fiche(c, col) {
  ellisse(c, 8, 9, 7.6, 5.4); c.fillStyle = scuro(col, 0.35); c.fill();
  ellisse(c, 8, 7, 7.6, 5.4); c.fillStyle = col; c.fill(); tratto(c, scuro(col, 0.5), 0.7);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.save(); c.translate(8 + Math.cos(a) * 6.3, 7 + Math.sin(a) * 4.4); c.rotate(a); c.fillStyle = '#ffffff'; c.fillRect(-1.1, -0.7, 2.2, 1.4); c.restore(); }
  ellisse(c, 8, 7, 4.4, 3.1); tratto(c, 'rgba(255,255,255,0.7)', 0.6);
  c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(2, 9.6, 12, 1);
}

// avambraccio del banco, steso sul tavolo: gomito a destra (x 74), mano aperta a sinistra
function avambraccio(c) {
  rrect(c, 20, 3, 56, 13, 6); c.fillStyle = gradL(c, 0, 3, 0, 16, [[0, '#3a6ad0'], [1, '#1c3a8a']]); c.fill(); tratto(c, CONT, 1.1);
  for (const x of [34, 52]) { c.beginPath(); c.moveTo(x, 4); c.quadraticCurveTo(x - 3, 9.5, x, 15); tratto(c, 'rgba(0,0,0,0.25)', 0.8); }
  rrect(c, 15, 3.5, 7, 12, 2); c.fillStyle = '#f4f4f4'; c.fill(); tratto(c, CONT, 0.9);
  ellisse(c, 18.5, 9.5, 1, 1); c.fillStyle = '#e8c048'; c.fill();
  // mano di taglio, che spinge
  c.beginPath(); c.moveTo(16, 4.5); c.quadraticCurveTo(4, 3, 1.5, 8); c.quadraticCurveTo(1, 13, 7, 15); c.lineTo(16, 14.5); c.closePath();
  c.fillStyle = '#e6b28a'; c.fill(); tratto(c, CONT, 1);
  for (const y of [7.5, 10.2, 12.6]) { c.beginPath(); c.moveTo(3, y); c.lineTo(9, y + 0.3); tratto(c, 'rgba(120,60,30,0.5)', 0.6); }
}

function sabot(c) {
  poli(c, [[2, 26], [6, 6], [38, 4], [40, 26]]); c.fillStyle = gradL(c, 0, 4, 0, 26, [[0, '#4a2a14'], [1, '#22120a']]); c.fill(); tratto(c, CONT, 1);
  poli(c, [[8, 8], [36, 6.5], [36, 18], [9, 19]]); c.fillStyle = '#2a4ab8'; c.fill(); tratto(c, '#f6f6f2', 0.8);
  poli(c, [[2, 26], [6, 22], [16, 20], [14, 26]]); c.fillStyle = '#f6f6f2'; c.fill(); tratto(c, '#8a8478', 0.6);
}

function creaBlackjack(scene) {
  tela(scene, 'carta', 28, 38, (c) => carta(c, false), 6);
  tela(scene, 'cartaDorso', 28, 38, (c) => carta(c, true), 6);
  for (const t of ['cuori', 'quadri', 'fiori', 'picche']) tela(scene, 'seme_' + t, 12, 12, (c) => seme(c, 6, 6, 1, t), 8);
  for (const [v, col] of [[10, '#2f6fd8'], [25, '#2e9a4a'], [50, '#1c1c24']]) tela(scene, 'fiche_' + v, 16, 15, (c) => fiche(c, col), 8);
  tela(scene, 'avambraccio', 78, 18, avambraccio, 6);
  tela(scene, 'sabot', 42, 28, sabot, 6);
}

// ------------------------------------------------------------
//  PASSA DI QUA: Panda rossa, Passaseo scout in bici, pozzanghere, trattore e Vespa (dall'alto)
// ------------------------------------------------------------
function panda(c, freni) {
  rrect(c, 3, 4, 26, 46, 5); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
  for (const y of [9, 36]) for (const x of [1.5, 26.5]) { rrect(c, x, y, 4, 9, 1.5); c.fillStyle = '#1b1c22'; c.fill(); }
  const scocca = () => rrect(c, 3, 2, 26, 46, [6, 6, 4, 4]);
  scocca(); c.fillStyle = gradL(c, 3, 0, 29, 0, [[0, '#a8201c'], [0.15, '#e23a30'], [0.5, '#f04a3e'], [0.85, '#e23a30'], [1, '#a8201c']]); c.fill();
  c.save(); scocca(); c.clip();
  poli(c, [[6, 11], [26, 11], [24, 17], [8, 17]]); c.fillStyle = gradL(c, 0, 11, 0, 17, [[0, '#6d86b0'], [1, '#32405c']]); c.fill();         // parabrezza
  rrect(c, 7, 17, 18, 18, 1.5); c.fillStyle = '#d8322a'; c.fill(); tratto(c, 'rgba(0,0,0,0.25)', 0.8);                                      // tetto
  for (const x of [8.5, 22.5]) { c.fillStyle = '#2a2a30'; c.fillRect(x, 18, 1.2, 16); }                                                    // barre
  poli(c, [[8, 35], [24, 35], [25, 40], [7, 40]]); c.fillStyle = '#32405c'; c.fill();                                                     // lunotto
  c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(9, 12, 5, 4);
  c.fillStyle = '#2a2a30'; c.fillRect(3, 44, 26, 4);
  for (const x of [5, 23]) { rrect(c, x, 2.5, 4, 3, 1); c.fillStyle = '#fff6c2'; c.fill(); }
  for (const x of [4, 24]) { rrect(c, x, 44.5, 4, 3, 0.8); c.fillStyle = freni ? '#ff3a2a' : '#8a1a14'; c.fill(); }
  c.restore();
  if (freni) for (const x of [6, 26]) { c.save(); c.globalCompositeOperation = 'lighter'; alone(c, x, 47, 7, '#ff3020', 0.7); c.restore(); }
  for (const x of [1, 28]) { ellisse(c, x, 15, 2, 1.4); c.fillStyle = '#c8281e'; c.fill(); tratto(c, CONT, 0.6); }
  scocca(); tratto(c, CONT, 1.1);
}

// Passaseo scout in bici visto dall'alto, va verso l'alto (18x36)
function ciclista(c, bagnato) {
  ellisse(c, 11, 20, 7, 14); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fill();
  for (const y of [1, 26]) { rrect(c, 8.2, y, 1.6, 9, 0.8); c.fillStyle = '#1c1c22'; c.fill(); }
  c.fillStyle = '#8a8e98'; c.fillRect(8.5, 9, 1, 18);
  c.beginPath(); c.moveTo(3, 8); c.lineTo(15, 8); tratto(c, '#3a3a40', 1.3);                         // manubrio
  for (const x of [3.5, 14.5]) { c.beginPath(); c.moveTo(x, 8.5); c.lineTo(x < 9 ? 5 : 13, 15); tratto(c, '#ecb894', 2); } // braccia
  for (const x of [5.5, 12.5]) { ellisse(c, x, 22, 2, 3); c.fillStyle = '#2c3a62'; c.fill(); }    // ginocchia
  ellisse(c, 9, 17, 6.2, 4.6); c.fillStyle = bagnato ? '#4a6a9a' : '#6c8fbe'; c.fill(); tratto(c, CONT, 0.8);   // spalle
  // fazzolettone sulla schiena, a righe
  c.save(); poli(c, [[4.5, 17.5], [13.5, 17.5], [9, 23]]); c.clip();
  ['#2f5fc0', '#f2c43a', '#d83a3a'].forEach((col, i) => { c.fillStyle = col; c.fillRect(4, 17.5 + i * 1.9, 10, 1.9); });
  c.restore();
  ellisse(c, 9, 14.5, 4, 4.2); c.fillStyle = '#2a1a12'; c.fill(); tratto(c, CONT, 0.7);             // testa riccia
  c.fillStyle = 'rgba(120,80,60,0.6)'; for (const [dx, dy] of [[-1.6, -1.4], [1.4, -1.8], [0, 0.6], [-1.8, 1.4], [1.8, 1.2]]) { ellisse(c, 9 + dx, 14.5 + dy, 0.9, 0.9); c.fill(); }
  if (bagnato) for (const [x, y] of [[3, 13], [15, 15], [6, 24], [13, 26], [9, 30]]) { ellisse(c, x, y, 1, 1.4); c.fillStyle = '#9fd4ff'; c.fill(); }
}

function pozzanghera(c) {
  c.beginPath(); c.moveTo(4, 9);
  c.bezierCurveTo(2, 3, 12, 1, 18, 2.5); c.bezierCurveTo(26, 0.5, 34, 4, 32, 9); c.bezierCurveTo(33, 14, 22, 16, 15, 14.5); c.bezierCurveTo(8, 16, 2, 13, 4, 9);
  c.closePath(); c.fillStyle = gradL(c, 0, 1, 0, 15, [[0, '#7aa0c0'], [1, '#4a6a88']]); c.fill(); tratto(c, 'rgba(40,40,50,0.5)', 0.8);
  c.beginPath(); c.moveTo(9, 6); c.quadraticCurveTo(15, 4, 21, 5.5); tratto(c, 'rgba(255,255,255,0.55)', 1);
  ellisse(c, 26, 10, 2.5, 1); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill();
}

function trattore(c) {
  rrect(c, 2, 6, 26, 40, 4); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  for (const x of [0, 22]) { rrect(c, x, 26, 8, 16, 2); c.fillStyle = '#1c1c22'; c.fill(); c.fillStyle = '#3a3a40'; for (let y = 28; y < 42; y += 3) c.fillRect(x + 1, y, 6, 1.2); }
  for (const x of [4, 21]) { rrect(c, x, 3, 5, 9, 1.5); c.fillStyle = '#1c1c22'; c.fill(); }
  rrect(c, 9, 1, 12, 24, 3); c.fillStyle = gradL(c, 9, 0, 21, 0, [[0, '#2a7a2a'], [0.5, '#4ab04a'], [1, '#2a7a2a']]); c.fill(); tratto(c, CONT, 1);
  c.fillStyle = '#1c1c22'; c.fillRect(11, 3, 8, 1.2);
  rrect(c, 7, 24, 16, 18, 2); c.fillStyle = '#e8c048'; c.fill(); tratto(c, CONT, 1);
  rrect(c, 9, 27, 12, 10, 1.5); c.fillStyle = '#3a8a3a'; c.fill();
  ellisse(c, 15, 18, 1.4, 1.4); c.fillStyle = '#3a3a40'; c.fill();
}

function vespa(c) {
  ellisse(c, 7, 15, 6, 13); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fill();
  rrect(c, 5.2, 0.5, 1.6, 6, 0.8); c.fillStyle = '#1c1c22'; c.fill(); rrect(c, 5.2, 21.5, 1.6, 6, 0.8); c.fill();
  c.beginPath(); c.moveTo(6, 4); c.quadraticCurveTo(1, 14, 3, 22); c.lineTo(9, 22); c.quadraticCurveTo(11, 14, 6, 4); c.closePath();
  c.fillStyle = '#a8d8c8'; c.fill(); tratto(c, CONT, 0.8);
  c.beginPath(); c.moveTo(1, 5); c.lineTo(11, 5); tratto(c, '#3a3a40', 1.2);
  ellisse(c, 6, 13, 3.6, 3); c.fillStyle = '#c0392b'; c.fill();       // giubbotto
  ellisse(c, 6, 10.5, 2.6, 2.6); c.fillStyle = '#f4f4f4'; c.fill(); tratto(c, CONT, 0.6);  // casco
}

function creaPassaseo(scene) {
  tela(scene, 'panda', 32, 52, (c) => panda(c, false), 6);
  tela(scene, 'pandaFreni', 32, 52, (c) => panda(c, true), 6);
  tela(scene, 'ciclista', 18, 36, (c) => ciclista(c, false), 6);
  tela(scene, 'ciclistaBagnato', 18, 36, (c) => ciclista(c, true), 6);
  tela(scene, 'pozzanghera', 36, 17, pozzanghera, 6);
  tela(scene, 'trattore', 30, 48, trattore, 6);
  tela(scene, 'vespa', 12, 28, vespa, 6);
}

// pallone da calcio classico (12x12)
function pallone(c) {
  ellisse(c, 6, 6, 5.4, 5.4); c.fillStyle = gradR(c, 4.5, 4.5, 0.5, 6, [[0, '#ffffff'], [1, '#d8dce4']]); c.fill();
  c.save(); ellisse(c, 6, 6, 5.4, 5.4); c.clip();
  const pent = (x, y, rr, a0) => { c.beginPath(); for (let i = 0; i < 5; i++) { const a = a0 + i * 1.2566; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = '#1c1c22'; c.fill(); };
  pent(6, 6, 1.9, -1.57);
  for (let i = 0; i < 5; i++) { const a = -1.57 + i * 1.2566 + 0.63; pent(6 + Math.cos(a) * 5.4, 6 + Math.sin(a) * 5.4, 1.8, a); }
  c.restore();
  ellisse(c, 6, 6, 5.4, 5.4); tratto(c, CONT, 0.8);
}


// ------------------------------------------------------------
//  IL PASSAGGIORGIO: macchine viste di lato (muso a destra), chiavi, cartello
// ------------------------------------------------------------
// Misure in unità: x dal centro della macchina (positivo verso il muso), altezze dal suolo.
//  m = mezza lunghezza, sotto = altezza della scocca da terra, cintura = linea dei finestrini,
//  tetto = altezza del tetto, xr = dove comincia il tetto dietro, xt = dove finisce davanti,
//  xa = base del parabrezza, cofano = altezza del cofano, ruota = raggio, xRuote = passo / 2.
//  baule: berlina col bagagliaio (per ora nessuna: hanno tutte il portellone).
//  La Golf di Greg, la Panda di Guerra, il SUV di Sego e l'A3 bianca di Giorgio (senza loghi).
export const MODELLI = {
  panda: { m: 54, sotto: 9, cintura: 31, tetto: 57, xr: -50, xt: 20, xa: 33, cofano: 31, ruota: 9, xRuote: 36 },
  golf: { m: 60, sotto: 9, cintura: 31, tetto: 53, xr: -44, xt: 16, xa: 37, cofano: 29, ruota: 10, xRuote: 40 },
  suv: { m: 64, sotto: 14, cintura: 39, tetto: 65, xr: -57, xt: 18, xa: 40, cofano: 37, ruota: 13, xRuote: 42 },
  a3: { m: 61, sotto: 9, cintura: 31, tetto: 52, xr: -41, xt: 13, xa: 38, cofano: 28, ruota: 10.5, xRuote: 41, calandra: true },
};
export const AUTO = { w: 140, h: 76, suolo: 72 };   // texture: suolo a 72 unità dall'alto

// porte che si vedono dal lato: [inizio, fine] in x (posteriore e anteriore) e dove si sale dietro
export function porteAuto(M) {
  const xc = M.baule ? M.xr + 3 : M.xr + 7, xb = Math.round((xc + M.xa) / 2) - 2;
  return { post: [xc, xb], ant: [xb, M.xa - 2], bag: [-M.m + 2, M.baule ? M.xr - 2 : M.xr + 6] };
}

function auto(c, M, col, o = {}) {
  const X = (x) => AUTO.w / 2 + x, Y = (h) => AUTO.suolo - h;
  const { m, sotto, cintura, tetto, xr, xt, xa, cofano, ruota } = M;
  const xrt = M.baule ? xr + 16 : xr;              // dove comincia davvero il tetto (la berlina ha il lunotto inclinato)
  const P = porteAuto(M);
  // ombra a terra
  ellisse(c, X(0), Y(0.5), m + 2, 3.2); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fill();
  const scocca = () => {
    c.beginPath();
    c.moveTo(X(-m + 3), Y(sotto));
    c.quadraticCurveTo(X(-m), Y(sotto), X(-m), Y(sotto + 4));
    if (M.baule) {
      c.lineTo(X(-m - 1), Y(cintura - 3)); c.quadraticCurveTo(X(-m), Y(cintura + 2), X(-m + 5), Y(cintura + 2));
      c.lineTo(X(xr), Y(cintura + 3));
      c.quadraticCurveTo(X(xr + 9), Y(tetto - 3), X(xrt), Y(tetto));
    } else {
      c.lineTo(X(-m - 1), Y(cintura));
      c.quadraticCurveTo(X(-m + 1), Y(tetto - 2), X(xrt + 4), Y(tetto));
    }
    c.lineTo(X(xt - 4), Y(tetto));
    c.quadraticCurveTo(X(xt + 2), Y(tetto), X(xt + 5), Y(tetto - 4));
    c.lineTo(X(xa), Y(cintura + 3));
    c.quadraticCurveTo(X(xa + 6), Y(cofano + 1), X(m - 6), Y(cofano));
    c.quadraticCurveTo(X(m), Y(cofano - 1), X(m), Y(cofano - 7));
    c.lineTo(X(m), Y(sotto + 4));
    c.quadraticCurveTo(X(m), Y(sotto), X(m - 3), Y(sotto));
    c.closePath();
  };
  scocca();
  c.fillStyle = gradL(c, 0, Y(tetto), 0, Y(sotto), [[0, chiaro(col, 0.22)], [0.45, col], [0.62, scuro(col, 0.08)], [1, scuro(col, 0.3)]]); c.fill();
  c.save(); scocca(); c.clip();
  // riflesso lungo la fiancata e fascia di plastica in basso (Panda e SUV)
  c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(X(-m), Y(cintura - 3), m * 2, 2.2);
  if (M === MODELLI.panda || M === MODELLI.suv) { c.fillStyle = '#3a3c44'; c.fillRect(X(-m), Y(sotto + 7), m * 2, 7); }
  // finestrini laterali (vetro semitrasparente: dietro si vede chi guida)
  const wTop = tetto - 4, wBot = cintura + 3;
  const xrTop = M.baule ? xrt + 3 : xrt + 8, xrBot = M.baule ? xr + 6 : -m + 12;
  const vetro = () => poli(c, [[X(xrTop), Y(wTop)], [X(xt - 1), Y(wTop)], [X(xa - 4), Y(wBot)], [X(xrBot), Y(wBot)]]);
  vetro(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,0.62)'; c.fill(); c.globalCompositeOperation = 'source-over';
  vetro(); c.fillStyle = 'rgba(40,58,92,0.38)'; c.fill();
  c.save(); vetro(); c.clip();
  poli(c, [[X(xrTop + 6), Y(wTop)], [X(xrTop + 14), Y(wTop)], [X(xrTop + 6), Y(wBot)], [X(xrTop - 2), Y(wBot)]]); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill();
  poli(c, [[X(xt - 12), Y(wTop)], [X(xt - 7), Y(wTop)], [X(xt - 15), Y(wBot)], [X(xt - 20), Y(wBot)]]); c.fillStyle = 'rgba(255,255,255,0.16)'; c.fill();
  c.restore();
  vetro(); tratto(c, '#1a1a22', 1.6);
  c.fillStyle = '#1a1a22'; c.fillRect(X(P.ant[0] - 1.6), Y(wTop), 3.2, wTop - wBot);            // montante centrale
  // linee delle porte e maniglie
  c.strokeStyle = alfa('#000000', 0.45); c.lineWidth = 0.9;
  for (const x of [P.post[0], P.ant[0], P.ant[1]]) { c.beginPath(); c.moveTo(X(x), Y(wBot)); c.lineTo(X(x + (x === P.ant[1] ? 1 : 0)), Y(sotto + 2)); c.stroke(); }
  c.beginPath(); c.moveTo(X(P.post[0]), Y(sotto + 2)); c.lineTo(X(P.ant[1]), Y(sotto + 2)); c.stroke();
  for (const [a] of [P.post, P.ant]) { rrect(c, X(a + 4), Y(cintura - 4), 6, 1.8, 0.8); c.fillStyle = scuro(col, 0.4); c.fill(); }
  // portellone o bagagliaio
  c.beginPath(); c.moveTo(X(P.bag[1]), Y(M.baule ? cintura + 3 : tetto - 1)); c.lineTo(X(P.bag[1] + (M.baule ? 0 : -2)), Y(cintura - 6)); c.lineTo(X(-m), Y(cintura - 6)); c.stroke();
  c.restore();
  scocca(); tratto(c, CONT, 1.4);
  // fari, fanali, paraurti, specchietto
  rrect(c, X(m - 7), Y(cofano - 2), 7, 4.5, 1.8); c.fillStyle = '#fff4c0'; c.fill(); tratto(c, CONT, 0.8);
  rrect(c, X(-m - 0.5), Y(cintura - 2), 4, 6, 1.5); c.fillStyle = '#e0302a'; c.fill(); tratto(c, CONT, 0.8);
  for (const [x, w] of [[-m - 1.5, 13], [m - 11.5, 13]]) { rrect(c, X(x), Y(sotto + 6), w, 6, 2.5); c.fillStyle = '#2a2a30'; c.fill(); }
  rrect(c, X(xa - 6), Y(cintura + 7), 5, 4, 1.5); c.fillStyle = col; c.fill(); tratto(c, CONT, 1);
  if (M.calandra) {   // muso grintoso: calandra grande e scura, fari affilati
    poli(c, [[X(m - 1.5), Y(cofano - 7)], [X(m + 0.5), Y(cofano - 7)], [X(m + 0.5), Y(sotto + 6)], [X(m - 2.5), Y(sotto + 7)]]); c.fillStyle = '#1c1c22'; c.fill();
    poli(c, [[X(m - 12), Y(cofano - 1)], [X(m - 1), Y(cofano - 3)], [X(m - 1), Y(cofano - 5.5)], [X(m - 10), Y(cofano - 3.5)]]); c.fillStyle = '#fff4c0'; c.fill(); tratto(c, CONT, 0.8);
  }
  if (M === MODELLI.suv) {   // barre sul tetto
    c.fillStyle = '#2a2a30'; c.fillRect(X(xrt + 6), Y(tetto + 2.5), xt - xrt - 12, 2);
    for (const x of [xrt + 8, xt - 8]) c.fillRect(X(x), Y(tetto + 2.5), 2, 2.5);
  }
  // ruote (la gomma sgonfia si schiaccia)
  for (const s of [-1, 1]) {
    const x = X(s * M.xRuote), sgonfia = o.gomma && s > 0;
    ellisse(c, x, Y(ruota), ruota + 2.6, ruota + 2.6); c.fillStyle = '#121216'; c.fill();
    const ry = sgonfia ? ruota - 2.6 : ruota, cy = Y(ry);
    ellisse(c, x, cy, sgonfia ? ruota + 1.6 : ruota, ry); c.fillStyle = '#24242a'; c.fill(); tratto(c, CONT, 1);
    ellisse(c, x, cy, ruota * 0.52, ry * 0.52); c.fillStyle = gradR(c, x - 1, cy - 1, 0.5, ruota * 0.55, [[0, '#f2f4f8'], [1, '#9aa0aa']]); c.fill();
    for (let i = 0; i < 5; i++) { const a = i * 1.2566; ellisse(c, x + Math.cos(a) * ruota * 0.3, cy + Math.sin(a) * ry * 0.3, 0.9, 0.9); c.fillStyle = '#6a707a'; c.fill(); }
  }
  if (o.polvere) {
    // ferma da anni: polvere a chiazze, la scritta col dito e le ragnatele
    const r = casuale(2019);
    c.save(); scocca(); c.clip();
    c.fillStyle = gradL(c, 0, Y(tetto), 0, Y(sotto), [[0, 'rgba(176,160,132,0.55)'], [1, 'rgba(140,124,98,0.3)']]); c.fillRect(0, 0, AUTO.w, AUTO.h);
    for (let i = 0; i < 260; i++) { ellisse(c, X(-m + r() * m * 2), Y(sotto + r() * (tetto - sotto)), 0.4 + r() * 1.6, 0.4 + r() * 1.2); c.fillStyle = `rgba(${150 + r() * 40 | 0},${132 + r() * 30 | 0},${100 + r() * 20 | 0},${0.25 + r() * 0.35})`; c.fill(); }
    c.restore();
    // sui vetri la polvere è più leggera: chi guida si deve vedere
    vetro(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,0.5)'; c.fill(); c.globalCompositeOperation = 'source-over';
    // (la scritta è al contrario: l'A3 nel gioco è girata col muso a sinistra, così si legge dritta)
    c.save(); c.translate(X((P.post[0] + P.post[1]) / 2), Y(cintura - 13)); c.scale(-1, 1); c.rotate(-0.06);
    c.font = 'bold 6.5px sans-serif'; c.textAlign = 'center'; c.fillStyle = alfa(chiaro(col, 0.35), 0.95); c.fillText('LAVAMI', 0, 0);
    c.restore();
    const ragnatela = (x, y, R, a0, a1) => {
      c.strokeStyle = 'rgba(245,245,250,0.75)'; c.lineWidth = 0.45;
      for (let i = 0; i <= 5; i++) { const a = a0 + (a1 - a0) * i / 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); c.stroke(); }
      for (let k = 1; k <= 3; k++) { c.beginPath(); for (let i = 0; i <= 5; i++) { const a = a0 + (a1 - a0) * i / 5, rr = R * k / 3.4; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.stroke(); }
    };
    ragnatela(X(xa - 4), Y(wBot), 9, -Math.PI / 2, -Math.PI);                                // nell'angolo del finestrino
    ragnatela(X(-M.xRuote), Y(ruota * 2 + 2.4), 8, Math.PI * 0.15, Math.PI * 0.85);          // sulla ruota dietro
    ragnatela(X(xa - 6), Y(cintura + 11), 6, -Math.PI * 0.1, Math.PI * 0.6);                 // dallo specchietto
  }
}

// mazzo di chiavi col telecomando (30x30)
function chiavi(c) {
  ellisse(c, 9, 8, 6, 6); tratto(c, CONT, 3.2); ellisse(c, 9, 8, 6, 6); tratto(c, '#d8dce4', 1.8);
  const chiave = (ang, col) => {
    c.save(); c.translate(9, 13); c.rotate(ang);
    ellisse(c, 0, 3, 3.6, 3.6); c.fillStyle = col; c.fill(); tratto(c, CONT, 1);
    ellisse(c, 0, 3, 1.2, 1.2); c.fillStyle = '#1f1430'; c.fill();
    rrect(c, -1.2, 6, 2.4, 10, 0.6); c.fillStyle = col; c.fill(); tratto(c, CONT, 0.9);
    c.fillStyle = col; c.fillRect(1, 11, 2.2, 1.6); c.fillRect(1, 13.6, 1.6, 1.6);
    c.restore();
  };
  chiave(0.5, '#e8c048'); chiave(-0.15, '#c8ccd6');
  // telecomando dell'auto (polveroso pure lui)
  c.save(); c.translate(14, 9); c.rotate(-0.5);
  rrect(c, 0, 0, 8, 12, 3); c.fillStyle = '#26262e'; c.fill(); tratto(c, CONT, 1);
  ellisse(c, 4, 4, 1.8, 1.8); c.fillStyle = '#e0302a'; c.fill(); ellisse(c, 4, 8.4, 1.4, 1.4); c.fillStyle = '#8a8e98'; c.fill();
  c.restore();
}

// cartello di cartone appoggiato alla macchina di Giorgio (40x30)
function cartello2019(c) {
  c.fillStyle = '#7a5530'; c.fillRect(18.5, 16, 3, 14);
  c.save(); c.translate(20, 10); c.rotate(-0.05);
  rrect(c, -18, -8.5, 36, 17, 1.5); c.fillStyle = '#d9b07a'; c.fill(); tratto(c, CONT, 1.2);
  c.fillStyle = 'rgba(120,80,40,0.35)'; c.fillRect(-18, 3, 36, 1);
  c.font = 'bold 6px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#3a1a10';
  c.fillText('FERMA', 0, -1); c.fillText('DAL 2019', 0, 6);
  c.restore();
}

export const COLORI_AUTO = { panda: '#f08a24', golf: '#f2f4f7', suv: '#8c929b', a3: '#f4f5f7' };

function creaParcheggio(scene) {
  for (const [nome, M] of Object.entries(MODELLI)) {
    const o = nome === 'a3' ? { polvere: true, gomma: true } : {};
    tela(scene, 'auto_' + nome, AUTO.w, AUTO.h, (c) => auto(c, M, COLORI_AUTO[nome], o), 6);
  }
  tela(scene, 'chiavi', 30, 30, chiavi, 8);
  tela(scene, 'cartello2019', 40, 30, cartello2019, 6);
}


// ------------------------------------------------------------
//  DISCOTECA: consolle del DJ, tavolini, shottino, icona dell'amico
// ------------------------------------------------------------
function consolle(c) {
  rrect(c, 4, 8, 112, 30, 4); c.fillStyle = gradL(c, 0, 8, 0, 38, [[0, '#3a3450'], [1, '#1a1628']]); c.fill(); tratto(c, CONT, 1.4);
  rrect(c, 4, 4, 112, 10, 3); c.fillStyle = '#4a4466'; c.fill(); tratto(c, CONT, 1.2);   // il piano
  for (const x of [26, 94]) {   // i due giradischi
    ellisse(c, x, 9, 13, 4.5); c.fillStyle = '#121218'; c.fill(); tratto(c, '#6a6a80', 0.8);
    ellisse(c, x, 9, 4, 1.5); c.fillStyle = '#e8463a'; c.fill();
  }
  rrect(c, 46, 5, 28, 8, 1.5); c.fillStyle = '#22202e'; c.fill();
  for (let i = 0; i < 6; i++) { c.fillStyle = ['#5ad0ff', '#ff5a8a', '#ffd84a'][i % 3]; c.fillRect(49 + i * 4, 7 + (i % 2) * 2, 2.4, 2.4); }
  // davanti: le lucine e la scritta
  for (let i = 0; i < 14; i++) { ellisse(c, 12 + i * 7.3, 32, 1.6, 1.6); c.fillStyle = ['#ff5ad0', '#5ad0ff', '#7dff9a', '#ffd84a'][i % 4]; c.fill(); }
  c.save(); c.font = 'bold 10px sans-serif'; c.textAlign = 'center'; c.shadowColor = '#ff5ad0'; c.shadowBlur = 5; c.fillStyle = '#ff9af0'; c.fillText('DJ', 60, 26); c.restore();
}

// tavolino da cocktail visto un po' dall'alto, con la tovaglia fino a terra (ci si nasconde un tentacolo)
function tavolino(c) {
  ellisse(c, 15, 30, 13, 4); c.fillStyle = 'rgba(0,0,0,0.4)'; c.fill();
  poli(c, [[3, 10], [27, 10], [29, 29], [1, 29]]); c.fillStyle = gradL(c, 0, 10, 0, 29, [[0, '#e8e4f0'], [1, '#a8a0b8']]); c.fill(); tratto(c, CONT, 1);
  c.beginPath(); c.moveTo(1, 29); c.quadraticCurveTo(15, 32, 29, 29); tratto(c, CONT, 1);
  ellisse(c, 15, 10, 12, 4); c.fillStyle = '#f6f2fa'; c.fill(); tratto(c, CONT, 1);
  for (const [x, col] of [[10, '#ff5a8a'], [19, '#7dff9a']]) {
    poli(c, [[x - 2.5, 2], [x + 2.5, 2], [x, 6]]); c.fillStyle = col; c.fill(); tratto(c, CONT, 0.6);
    c.fillStyle = '#c8c8d0'; c.fillRect(x - 0.3, 6, 0.6, 3);
  }
}

function shottino(c) {
  poli(c, [[1.5, 1], [10.5, 1], [9, 13], [3, 13]]); c.fillStyle = 'rgba(220,240,255,0.5)'; c.fill();
  poli(c, [[2.6, 5], [9.4, 5], [8.6, 12], [3.4, 12]]); c.fillStyle = gradL(c, 0, 5, 0, 12, [[0, '#ffc34a'], [1, '#d87a10']]); c.fill();
  poli(c, [[1.5, 1], [10.5, 1], [9, 13], [3, 13]]); tratto(c, CONT, 0.9);
  c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(3, 2, 1, 9);
}

function icoAmico(c) {
  ellisse(c, 8, 5, 3.6, 3.6); c.fillStyle = '#ffe14a'; c.fill(); tratto(c, CONT, 0.9);
  c.beginPath(); c.moveTo(2, 15); c.quadraticCurveTo(2, 9, 8, 9); c.quadraticCurveTo(14, 9, 14, 15); c.closePath(); c.fillStyle = '#ffe14a'; c.fill(); tratto(c, CONT, 0.9);
  // la mano alzata: "ferma!"
  c.beginPath(); c.moveTo(13, 10); c.lineTo(15.5, 4); tratto(c, CONT, 2.6); tratto(c, '#ffe14a', 1.4);
}

function creaDisco(scene) {
  tela(scene, 'consolle', 120, 40, consolle, 6);
  tela(scene, 'tavolino', 30, 34, tavolino, 6);
  tela(scene, 'shottino', 12, 14, shottino, 8);
  tela(scene, 'icoAmico', 17, 16, icoAmico, 8);
}

export function creaOggetti(scene) {
  [-0.1, 0.07].forEach((v, f) => {
    tela(scene, `golfGiu${f}`, 60, 104, (c) => golf(c, false, v), 6);
    tela(scene, `golfSu${f}`, 60, 104, (c) => golf(c, true, v), 6);
  });
  pinta(scene);
  tela(scene, 'spina', 36, 64, spina, 6);
  for (let i = 0; i < 4; i++) for (const f of [0, 1]) tela(scene, `cliente${i}_${f}`, 58, 78, (c) => cliente(c, i, f), 5);
  for (const t of ['aperta', 'presa', 'colpita', 'guanto']) tela(scene, `manoGuerra_${t}`, 40, 56, (c) => manoGuerra(c, t), 6);
  tela(scene, 'manicaGuerra', 18, 16, manicaGuerra, 6);
  creaPanino(scene);
  creaRonda(scene);
  creaBlackjack(scene);
  tela(scene, 'pallone', 12, 12, pallone, 8);
  creaPassaseo(scene);
  creaParcheggio(scene);
  creaDisco(scene);
  for (const cibo of ['spaghetti', 'pizza', 'cotoletta', 'lasagna', 'tiramisu']) tela(scene, 'piatto_' + cibo, 64, 40, (c) => piatto(c, cibo), 6);
  tela(scene, 'manoMia', 40, 56, manoMia, 6);
  tela(scene, 'finestraAperta', 58, 44, (c) => finestra(c, true), 6);
  tela(scene, 'finestraChiusa', 58, 44, (c) => finestra(c, false), 6);
  tela(scene, 'granata', 13, 24, granata, 8);
  tela(scene, 'cassaFumogeni', 80, 44, cassaFumogeni, 5);
  tela(scene, 'rasoio', 24, 36, rasoio, 8);
  tela(scene, 'pennello', 22, 37, pennello, 8);
  tela(scene, 'bacinella', 76, 46, bacinella, 5);

  // particelle e icone
  tela(scene, 'stella', 12, 12, (c) => {
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 2.4 : 5.4; c.lineTo(6 + Math.cos(a) * rr, 6 + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = gradR(c, 5, 5, 0.5, 6, [[0, '#fffbd0'], [1, '#ffcf2e']]); c.fill(); tratto(c, '#b37a00', 0.7);
  }, 8);
  tela(scene, 'fumo', 16, 16, (c) => {
    for (const [x, y, r] of [[8, 9, 5.5], [5, 7, 3.6], [11, 7, 3.8], [8, 5, 3.4]]) { ellisse(c, x, y, r, r); c.fillStyle = gradR(c, x - 1, y - 1, 0.5, r, [[0, '#ffffff'], [1, 'rgba(225,230,240,0.9)']]); c.fill(); }
  }, 6);
  tela(scene, 'cuore', 13, 12, (c) => {
    c.beginPath(); c.moveTo(6.5, 11); c.bezierCurveTo(-1.5, 5.5, 1, 0.3, 4, 0.8); c.bezierCurveTo(5.3, 1, 6.2, 2, 6.5, 3);
    c.bezierCurveTo(6.8, 2, 7.7, 1, 9, 0.8); c.bezierCurveTo(12, 0.3, 14.5, 5.5, 6.5, 11); c.closePath();
    c.fillStyle = gradR(c, 5, 3.5, 0.5, 8, [[0, '#ff7a8c'], [1, '#d81e3c']]); c.fill(); tratto(c, '#7a0d20', 0.8);
    ellisse(c, 4, 3.4, 1.5, 1, -0.5); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
  }, 8);
}
