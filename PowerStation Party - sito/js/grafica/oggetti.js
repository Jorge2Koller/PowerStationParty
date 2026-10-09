// Oggetti di scena: la Golf di ReGrorio, pinte, spina, clienti, mani di Guerra, panino,
// attrezzi del barbiere, particelle.
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, mix, alone, casuale } from './base.js';
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
function polsino(c, g) {
  rrect(c, 10.5, 44, 19, 12, 3); c.fillStyle = gradL(c, 10, 0, 30, 0, [[0, scuro(g.vestito.colore, 0.3)], [0.5, chiaro(g.vestito.colore, 0.12)], [1, scuro(g.vestito.colore, 0.3)]]); c.fill(); tratto(c, CONT, 1.6);
  c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(12, 46.5, 16, 1.1);
  rrect(c, 9.5, 52, 21, 4, 1.5); c.fillStyle = scuro(g.vestito.colore, 0.4); c.fill(); tratto(c, CONT, 1.4);
}

// dita: [angolo dalla verticale, lunghezza, spessore]
const DITA = [[-0.4, 12.5, 5.6], [-0.13, 16, 5.9], [0.13, 15.5, 5.9], [0.4, 12.5, 5.4]];

function manoAperta(c, S) {
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

// pezzo di manica del piumino (si ripete in verticale per fare il braccio lungo)
function manicaGuerra(c) {
  const col = PERSONAGGI.guerra.vestito.colore;
  c.fillStyle = gradL(c, 0, 0, 18, 0, [[0, scuro(col, 0.35)], [0.45, chiaro(col, 0.14)], [1, scuro(col, 0.4)]]); c.fillRect(1.2, 0, 15.6, 16);
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(5, 2, 5, 11);
  c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(1.2, 14.6, 15.6, 1.4);
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
