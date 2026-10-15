// "La pizza dal Boni": la taverna del Boni, disegnata in unità logiche (480x270). Il forno a legna
// ad arco coi mattoni, le travi coi prosciutti e l'aglio, i fiaschi, la tavola lunga con la tovaglia
// a quadri, il bancone in primo piano con la pasta e le ciotole; i cinque nascondigli degli imbucati
// (tovaglia, botte, cesta della legna, tenda della cantina, cappotti) e i tre travestimenti.
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alone, casuale } from './base.js';

// dove sta tutto (lo usa anche PizzaScene)
export const TAVERNA = {
  forno: { x: 104, y: 128, w: 66, h: 46 },     // la bocca del forno: centro, base, larghezza, altezza
  boni: { x: 140, y: 214 },                    // il Boni al forno (i piedi stanno dietro il bancone)
  tavola: { x0: 262, x1: 438, y: 146 },        // il piano della tavola lunga
  posti: [288, 330, 372, 414],                 // le sedie dietro la tavola
  porta: { x: 459, y: 168 },                   // la porta della taverna (centro in basso)
  tenda: { x: 206, y: 170 },                   // la porta della cantina, con la tenda (centro in basso)
  botte: { x: 242, y: 192 },
  cesta: { x: 186, y: 196 },
  cappotti: { x: 18, y: 190 },
  bancone: 196,                                // il filo del bancone
  pizza: { x: 318, y: 232, r: 33 },
  ciotole: { x0: 26, passo: 39, y: 240 },
  pronta: { x: 422, y: 222 }, rifai: { x: 422, y: 256 },
  foglietto: { x: 272, y: 62, w: 172, h: 80 },
};
export const INGREDIENTI = ['mozzarella', 'salamino', 'funghi', 'olive', 'basilico', 'ananas'];
export const NOMI_INGREDIENTI = { mozzarella: 'mozzarella', salamino: 'salamini', funghi: 'funghi', olive: 'olive', basilico: 'basilico', ananas: 'ananas', pomodoro: 'pomodoro' };

const legno = (c, x0, y0, x1, y1, col) => gradL(c, x0, y0, x1, y1, [[0, chiaro(col, 0.12)], [0.5, col], [1, scuro(col, 0.25)]]);

// ------------------------------------------------------------
//  LO SFONDO
// ------------------------------------------------------------
function prosciutto(c, x, y) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 8); tratto(c, '#d8c8a0', 1.2);
  const forma = () => { c.beginPath(); c.moveTo(x - 3, y + 8); c.bezierCurveTo(x - 14, y + 18, x - 16, y + 46, x - 2, y + 54); c.bezierCurveTo(x + 12, y + 52, x + 14, y + 22, x + 3, y + 8); c.closePath(); };
  forma(); c.fillStyle = gradL(c, x - 15, 0, x + 14, 0, [[0, '#8a3e22'], [0.5, '#c06a3a'], [1, '#7a321a']]); c.fill(); tratto(c, CONT, 1.4);
  ellisse(c, x - 1, y + 47, 7, 5); c.fillStyle = '#e8b0a0'; c.fill(); tratto(c, '#a85a48', 0.8);
  c.beginPath(); for (const k of [16, 24, 32, 40]) { c.moveTo(x - 10, y + k); c.lineTo(x + 10, y + k + 3); } tratto(c, 'rgba(240,220,180,0.55)', 0.8);
}
function treccia(c, x, y, n = 6) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + n * 7 + 4); tratto(c, '#c8b07a', 1.4);
  for (let i = 0; i < n; i++) {
    const s = i % 2 ? 1 : -1, yy = y + 6 + i * 7;
    ellisse(c, x + s * 3.5, yy, 4.2, 4.6); c.fillStyle = '#f4ecd8'; c.fill(); tratto(c, '#9a8a6a', 0.9);
    c.beginPath(); c.moveTo(x + s * 3.5, yy - 4.6); c.lineTo(x + s * 3.5, yy - 7); tratto(c, '#b8a882', 0.8);
  }
}
function peperoncini(c, x, y) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 40); tratto(c, '#c8b07a', 1);
  for (let i = 0; i < 7; i++) {
    const s = i % 2 ? 1 : -1, yy = y + 4 + i * 5.5;
    c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + s * 6, yy + 2, x + s * 5, yy + 8); tratto(c, '#d42a1a', 2.6);
  }
}
function fiasco(c, x, y) {
  // il fiasco col rivestimento di paglia
  rrect(c, x - 1.6, y - 30, 3.2, 10, 1); c.fillStyle = '#3a6a3a'; c.fill();
  ellisse(c, x, y - 9, 8, 10); c.fillStyle = gradL(c, x - 8, 0, x + 8, 0, [[0, '#a8823a'], [0.5, '#e8c470'], [1, '#9a7230']]); c.fill(); tratto(c, CONT, 1);
  c.beginPath(); for (let k = -6; k <= 6; k += 2) { c.moveTo(x + k, y - 17); c.lineTo(x + k * 0.8, y); } tratto(c, 'rgba(120,80,30,0.5)', 0.6);
  rrect(c, x - 3, y - 22, 6, 6, 1.5); c.fillStyle = '#3a6a3a'; c.fill(); tratto(c, CONT, 0.8);
  c.fillStyle = '#c0282e'; c.fillRect(x - 2, y - 31, 4, 2);
}
function mattoni(c, x0, y0, x1, y1, r) {
  for (let y = y0, riga = 0; y < y1; y += 7, riga++) for (let x = x0 - (riga % 2 ? 7 : 0); x < x1; x += 14) {
    rrect(c, x + 0.6, y + 0.6, 12.8, 5.8, 1);
    c.fillStyle = ['#b85a36', '#a84e2e', '#c4683e', '#9a4428'][Math.floor(r() * 4)]; c.fill();
  }
}

function sfondoTaverna(c) {
  const r = casuale(311);
  // la parete: intonaco caldo, un po' scrostato, con la luce delle lanterne
  c.fillStyle = gradL(c, 0, 0, 0, 170, [[0, '#a07850'], [0.4, '#d4b07c'], [1, '#c09060']]); c.fillRect(0, 0, 480, 170);
  for (let i = 0; i < 40; i++) { ellisse(c, r() * 480, 20 + r() * 110, 6 + r() * 14, 3 + r() * 7); c.fillStyle = `rgba(${r() < 0.5 ? '120,80,40' : '255,235,200'},0.08)`; c.fill(); }
  alone(c, 300, 60, 150, '#ffd48a', 0.25);
  // lo zoccolo di pietra
  for (let y = 124, riga = 0; y < 170; y += 11, riga++) for (let x = -10 + (riga % 2) * 14; x < 480; x += 28) {
    rrect(c, x + 1, y + 1, 26, 9.5, 3); c.fillStyle = ['#8a7a66', '#9a8a74', '#7c6c5a'][Math.floor(r() * 3)]; c.fill(); tratto(c, 'rgba(40,28,18,0.4)', 0.8);
  }
  // le travi a vista: quella lunga in alto e quelle che vengono verso di noi
  c.fillStyle = legno(c, 0, 0, 0, 14, '#4a2c18'); c.fillRect(0, 0, 480, 14);
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, 14, 480, 2);
  for (const x of [20, 240, 460]) { poli(c, [[x - 10, 0], [x + 10, 0], [x + 14, 18], [x - 14, 18]]); c.fillStyle = legno(c, x - 14, 0, x + 14, 0, '#5a361e'); c.fill(); tratto(c, '#2a160a', 1); }
  // appesi alla trave: prosciutti, trecce d'aglio, peperoncini
  prosciutto(c, 300, 14); prosciutto(c, 352, 14);
  treccia(c, 276, 14); treccia(c, 382, 14, 5); peperoncini(c, 326, 14);
  // la mensola coi fiaschi (sopra la tavola)
  c.fillStyle = legno(c, 0, 92, 0, 98, '#6a4224'); c.fillRect(282, 92, 150, 6);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(282, 98, 150, 2);
  for (const x of [296, 318, 344, 400, 422]) fiasco(c, x, 92);
  rrect(c, 362, 76, 22, 16, 2); c.fillStyle = '#c8b48a'; c.fill(); tratto(c, CONT, 1);   // un cesto di pane
  for (const x of [366, 372, 378]) { ellisse(c, x, 76, 4, 3); c.fillStyle = '#d89a50'; c.fill(); }
  // la porta della cantina (la tenda è a parte) e la porta della taverna (a parte anche lei)
  for (const [x, w, top] of [[TAVERNA.tenda.x, 44, 72], [TAVERNA.porta.x, 34, 62]]) {
    rrect(c, x - w / 2 - 4, top - 4, w + 8, 170 - top + 4, [12, 12, 0, 0]); c.fillStyle = '#5a3a20'; c.fill(); tratto(c, CONT, 1.4);
    rrect(c, x - w / 2, top, w, 170 - top, [10, 10, 0, 0]); c.fillStyle = gradL(c, 0, top, 0, 170, [[0, '#1a100a'], [1, '#2c1c12']]); c.fill();
  }
  // il pavimento di cotto
  c.fillStyle = '#9a5634'; c.fillRect(0, 168, 480, 40);
  for (let y = 168, k = 0; y < 208; y += 9, k++) for (let x = -20 + (k % 2) * 13; x < 480; x += 26) {
    rrect(c, x + 0.8, y + 0.8, 24.4, 7.6, 1); c.fillStyle = ['#b8673e', '#a85a34', '#c27442'][Math.floor(r() * 3)]; c.fill();
  }
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, 168, 480, 3);
  // la legna accatastata accanto al forno
  for (let row = 0; row < 4; row++) for (let i = 0; i < 3; i++) {
    const x = 170 + i * 9 + (row % 2) * 4, y = 164 - row * 8;
    ellisse(c, x, y, 4.6, 4.2); c.fillStyle = '#8a5a32'; c.fill(); tratto(c, CONT, 0.9);
    ellisse(c, x, y, 2.6, 2.4); tratto(c, '#c89a62', 0.7);
  }
  forno(c);
}

// il forno a legna: la cupola di mattoni ad arco, la cappa, la base di pietra, la bocca nera
// (il fuoco e il bagliore li mette la scena, animati)
function forno(c) {
  const r = casuale(17), F = TAVERNA.forno;
  // la cappa che sale
  poli(c, [[F.x - 26, 0], [F.x + 26, 0], [F.x + 38, 40], [F.x - 38, 40]]); c.fillStyle = legno(c, F.x - 38, 0, F.x + 38, 0, '#7a4a2a'); c.fill(); tratto(c, CONT, 1.4);
  // la cupola
  const cupola = () => { c.beginPath(); c.moveTo(F.x - 74, 168); c.lineTo(F.x - 74, 96); c.bezierCurveTo(F.x - 72, 44, F.x + 72, 44, F.x + 74, 96); c.lineTo(F.x + 74, 168); c.closePath(); };
  cupola(); c.fillStyle = '#a84e2e'; c.fill();
  c.save(); cupola(); c.clip(); mattoni(c, F.x - 80, 40, F.x + 80, 170, r); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(F.x - 80, 40, 160, 130); c.restore();
  cupola(); tratto(c, CONT, 2);
  // la base di pietra e il ripiano davanti alla bocca
  rrect(c, F.x - 78, F.y, 156, 10, 2); c.fillStyle = legno(c, 0, F.y, 0, F.y + 10, '#9a8a74'); c.fill(); tratto(c, CONT, 1.4);
  // l'arco della bocca, coi mattoni a raggiera
  const bocca = (k) => { c.beginPath(); c.moveTo(F.x - F.w / 2 - k, F.y); c.lineTo(F.x - F.w / 2 - k, F.y - F.h * 0.45); c.bezierCurveTo(F.x - F.w / 2 - k, F.y - F.h - k * 1.2, F.x + F.w / 2 + k, F.y - F.h - k * 1.2, F.x + F.w / 2 + k, F.y - F.h * 0.45); c.lineTo(F.x + F.w / 2 + k, F.y); c.closePath(); };
  bocca(7); c.fillStyle = '#8a3a22'; c.fill(); tratto(c, CONT, 1.4);
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI, cx = F.x, cy = F.y - F.h * 0.5;
    c.beginPath(); c.moveTo(cx + Math.cos(a) * (F.w / 2), cy + Math.sin(a) * (F.h * 0.55)); c.lineTo(cx + Math.cos(a) * (F.w / 2 + 7), cy + Math.sin(a) * (F.h * 0.55 + 7)); tratto(c, '#c06a40', 1.4);
  }
  bocca(0); c.fillStyle = gradL(c, 0, F.y - F.h, 0, F.y, [[0, '#120806'], [0.6, '#2a0e06'], [1, '#5a1a08']]); c.fill(); tratto(c, CONT, 1.6);
  // la brace sul fondo
  for (let i = 0; i < 14; i++) { ellisse(c, F.x - 26 + r() * 52, F.y - 4 - r() * 4, 3 + r() * 3, 2); c.fillStyle = ['#ff6a1a', '#ffb02e', '#c0280e'][i % 3]; c.fill(); }
  // la nicchia della legna sotto
  rrect(c, F.x - 40, F.y + 12, 80, 26, 3); c.fillStyle = '#2a1a10'; c.fill(); tratto(c, CONT, 1.2);
  for (let i = 0; i < 6; i++) { ellisse(c, F.x - 30 + i * 12, F.y + 30, 5, 5); c.fillStyle = '#7a4a28'; c.fill(); tratto(c, CONT, 0.8); }
}

// le fiamme (tre fotogrammi, per farle ballare)
function fuoco(c, k) {
  const r = casuale(50 + k * 13);
  for (const [col, s] of [['#c0280e', 1], ['#ff7a1a', 0.78], ['#ffd23a', 0.5]]) {
    c.beginPath(); c.moveTo(4, 30);
    for (let i = 0; i <= 8; i++) {
      const x = 4 + i * 6, alto = (10 + r() * 16) * s + (i % 2 ? 0 : 6 * s);
      c.quadraticCurveTo(x - 3, 30 - alto * 0.5, x, 30 - alto);
      c.quadraticCurveTo(x + 2, 30 - alto * 0.4, x + 3, 30);
    }
    c.closePath(); c.fillStyle = col; c.fill();
  }
}

// ------------------------------------------------------------
//  LA TAVOLA, IL BANCONE, LA PIZZA
// ------------------------------------------------------------
function tavola(c) {
  const W = TAVERNA.tavola.x1 - TAVERNA.tavola.x0;
  // il piano visto un po' dall'alto, con piatti, bicchieri e il pane
  rrect(c, 0, 0, W, 12, 2); c.fillStyle = '#f4efe6'; c.fill();
  c.save(); rrect(c, 0, 0, W, 12, 2); c.clip();
  for (let x = 0; x < W; x += 10) for (let y = 0; y < 12; y += 6) if ((x / 10 + y / 6) % 2 < 1) { c.fillStyle = 'rgba(200,40,40,0.55)'; c.fillRect(x, y, 10, 6); }
  c.restore();
  for (const x of [26, 68, 110, 152]) { ellisse(c, x, 6, 9, 3.4); c.fillStyle = '#ffffff'; c.fill(); tratto(c, '#9aa0aa', 0.7); rrect(c, x + 11, -6, 4, 10, 1); c.fillStyle = 'rgba(200,230,255,0.7)'; c.fill(); tratto(c, '#8a9aaa', 0.6); }
  // la tovaglia a quadri che scende fino quasi a terra, con le pieghe
  const tela = () => { c.beginPath(); c.moveTo(0, 10); c.lineTo(W, 10); c.lineTo(W + 2, 42); for (let x = W; x >= 0; x -= 22) c.quadraticCurveTo(x - 6, 46, x - 11, 42.5); c.lineTo(-2, 42); c.closePath(); };
  tela(); c.fillStyle = '#f6f1e8'; c.fill();
  c.save(); tela(); c.clip();
  for (let x = -4; x < W + 6; x += 9) for (let y = 10; y < 48; y += 9) if (((x + 4) / 9 + (y - 10) / 9) % 2 < 1) { c.fillStyle = 'rgba(206,36,36,0.78)'; c.fillRect(x, y, 9, 9); }
  for (let x = 11; x < W; x += 22) { c.beginPath(); c.moveTo(x, 12); c.lineTo(x - 2, 44); tratto(c, 'rgba(0,0,0,0.1)', 3); }
  c.restore();
  tela(); tratto(c, CONT, 1.4);
}

function bancone(c) {
  // il piano di legno visto dall'alto e il fronte a doghe
  c.fillStyle = legno(c, 0, 0, 0, 20, '#9a6a3a'); c.fillRect(0, 0, 480, 22);
  c.fillStyle = 'rgba(255,230,190,0.35)'; c.fillRect(0, 0, 480, 1.4);
  const r = casuale(5);
  for (let i = 0; i < 26; i++) { c.beginPath(); const y = 3 + r() * 16, x = r() * 480; c.moveTo(x, y); c.lineTo(x + 30 + r() * 40, y + r() * 2 - 1); tratto(c, 'rgba(70,40,18,0.25)', 0.8); }
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 22, 480, 3);
  for (let x = 0; x < 480; x += 30) { c.fillStyle = legno(c, x, 0, x + 30, 0, x % 60 ? '#6a4224' : '#74482a'); c.fillRect(x, 25, 30, 55); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x + 29, 25, 1.5, 55); }
  // il tagliere tondo di legno sotto la pasta
  const P = TAVERNA.pizza, y = P.y - TAVERNA.bancone;
  ellisse(c, P.x + 1, y + 3, 40, 35); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
  ellisse(c, P.x, y, 40, 35); c.fillStyle = gradR(c, P.x - 10, y - 10, 4, 44, [[0, '#d8a868'], [1, '#a8743a']]); c.fill(); tratto(c, CONT, 1.4);
  ellisse(c, P.x, y, 35, 30.5); tratto(c, 'rgba(90,50,20,0.3)', 1);
}

function pasta(c) {
  ellisse(c, 36, 37, 34, 30); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fill();
  ellisse(c, 36, 35, 34, 30); c.fillStyle = gradR(c, 32, 30, 4, 36, [[0, '#f8ecd2'], [0.8, '#efdcb4'], [1, '#d8b07a']]); c.fill(); tratto(c, '#a87a44', 1.6);
  ellisse(c, 36, 35, 27, 23.5); tratto(c, 'rgba(200,150,90,0.35)', 2);
  const r = casuale(8);
  for (let i = 0; i < 18; i++) { ellisse(c, 12 + r() * 48, 14 + r() * 42, 0.8, 0.8); c.fillStyle = 'rgba(190,150,100,0.5)'; c.fill(); }
}
function pomodoro(c) {
  const r = casuale(21);
  c.beginPath();
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI * 2, rr = 5.6 + r() * 1.6; i ? c.lineTo(7 + Math.cos(a) * rr, 7 + Math.sin(a) * rr) : c.moveTo(7 + Math.cos(a) * rr, 7 + Math.sin(a) * rr); }
  c.closePath(); c.fillStyle = '#d42a1a'; c.fill();
  ellisse(c, 5, 5, 2, 1.4); c.fillStyle = 'rgba(255,170,150,0.5)'; c.fill();
}
function pizzaCotta(c) {
  ellisse(c, 36, 35, 34, 30); c.fillStyle = gradR(c, 36, 35, 20, 36, [[0, '#e8a050'], [1, '#b8682a']]); c.fill(); tratto(c, '#7a3a14', 1.6);
  ellisse(c, 36, 35, 27, 23.5); c.fillStyle = '#c8301c'; c.fill();
  const r = casuale(31);
  for (let i = 0; i < 9; i++) { ellisse(c, 18 + r() * 36, 20 + r() * 30, 4 + r() * 2, 3 + r() * 2); c.fillStyle = '#fff4dc'; c.fill(); }
  for (let i = 0; i < 6; i++) { ellisse(c, 18 + r() * 36, 20 + r() * 30, 3.2, 3.2); c.fillStyle = '#9a1e1e'; c.fill(); tratto(c, '#5a0e0e', 0.6); }
  for (let i = 0; i < 4; i++) { ellisse(c, 18 + r() * 36, 20 + r() * 30, 3, 1.6, r() * 3); c.fillStyle = '#2f8a3a'; c.fill(); }
}
function fetta(c) {
  poli(c, [[2, 2], [20, 4], [10, 20]]); c.fillStyle = '#c8301c'; c.fill();
  c.beginPath(); c.moveTo(2, 2); c.quadraticCurveTo(11, -1, 20, 4); tratto(c, '#d89a50', 3.5);
  ellisse(c, 9, 7, 2.4, 1.8); c.fillStyle = '#fff4dc'; c.fill(); ellisse(c, 13, 10, 1.8, 1.8); c.fillStyle = '#9a1e1e'; c.fill();
  poli(c, [[2, 2], [20, 4], [10, 20]]); tratto(c, CONT, 1);
}

// un pezzo di ingrediente (16x16): sulla pizza, nelle ciotole e sul foglietto
function ingrediente(c, tipo) {
  const x = 8, y = 8;
  if (tipo === 'mozzarella') {
    c.beginPath(); c.moveTo(2, 9); c.bezierCurveTo(1, 2, 9, 0, 13, 4); c.bezierCurveTo(16, 8, 14, 15, 8, 14); c.bezierCurveTo(4, 14, 2, 12, 2, 9); c.closePath();
    c.fillStyle = '#fffaf0'; c.fill(); tratto(c, '#c8bca4', 1); ellisse(c, 6, 6, 2.2, 1.4); c.fillStyle = '#ffffff'; c.fill();
  } else if (tipo === 'salamino') {
    ellisse(c, x, y, 6.5, 6.5); c.fillStyle = '#b8282a'; c.fill(); tratto(c, '#6a1010', 1.2);
    for (const [a, b] of [[5, 6], [10, 5], [8, 10], [11, 10], [5, 10]]) { ellisse(c, a, b, 1.1, 1.1); c.fillStyle = '#f4c8b8'; c.fill(); }
  } else if (tipo === 'funghi') {
    c.beginPath(); c.moveTo(2, 9); c.bezierCurveTo(2, 1, 14, 1, 14, 9); c.lineTo(10, 9); c.lineTo(10, 14); c.lineTo(6, 14); c.lineTo(6, 9); c.closePath();
    c.fillStyle = '#d8b88a'; c.fill(); tratto(c, '#7a5a3a', 1);
    c.beginPath(); c.moveTo(3, 8); c.bezierCurveTo(4, 3, 12, 3, 13, 8); tratto(c, '#8a6440', 1.4);
  } else if (tipo === 'olive') {
    ellisse(c, x, y, 5.6, 5); c.fillStyle = '#22201e'; c.fill(); tratto(c, '#000000', 0.8);
    ellisse(c, x, y, 2, 1.8); c.fillStyle = '#7a6a3a'; c.fill();
    ellisse(c, 6, 5.5, 1.4, 0.8); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fill();
  } else if (tipo === 'basilico') {
    c.beginPath(); c.moveTo(2, 13); c.bezierCurveTo(3, 4, 10, 1, 14, 2); c.bezierCurveTo(14, 9, 8, 14, 2, 13); c.closePath();
    c.fillStyle = '#2f9a3a'; c.fill(); tratto(c, '#16561e', 1);
    c.beginPath(); c.moveTo(3, 12); c.quadraticCurveTo(8, 7, 13, 3); tratto(c, '#7ad07a', 0.8);
  } else if (tipo === 'ananas') {
    poli(c, [[2, 13], [8, 2], [14, 13]]); c.fillStyle = '#ffd23a'; c.fill(); tratto(c, '#b88a10', 1);
    c.beginPath(); c.moveTo(5, 10); c.lineTo(11, 10); c.moveTo(6.5, 7); c.lineTo(9.5, 7); tratto(c, '#e0a820', 0.8);
    c.beginPath(); c.moveTo(2, 13); c.lineTo(14, 13); tratto(c, '#e8b830', 2);
  } else if (tipo === 'pomodoro') {
    ellisse(c, x, y + 1, 6, 5.4); c.fillStyle = '#e0301c'; c.fill(); tratto(c, '#8a1408', 1);
    poli(c, [[5, 3], [8, 5], [11, 3], [9, 6], [7, 6]]); c.fillStyle = '#2f8a3a'; c.fill();
    ellisse(c, 5.5, 7, 1.6, 1.1); c.fillStyle = 'rgba(255,200,180,0.6)'; c.fill();
  }
}

function ciotola(c) {
  ellisse(c, 19, 9, 18, 5.5); c.fillStyle = '#3a1e10'; c.fill();
  c.beginPath(); c.moveTo(1, 9); c.quadraticCurveTo(3, 22, 19, 22); c.quadraticCurveTo(35, 22, 37, 9); c.closePath();
  c.fillStyle = gradL(c, 0, 0, 38, 0, [[0, '#9a4a26'], [0.4, '#d07a44'], [1, '#8a3e1e']]); c.fill(); tratto(c, CONT, 1.3);
  ellisse(c, 19, 9, 18, 5.5); tratto(c, CONT, 1.3);
  c.beginPath(); c.moveTo(5, 14); c.quadraticCurveTo(19, 19, 33, 14); tratto(c, 'rgba(255,220,180,0.4)', 1.2);
}

function foglietto(c, retro) {
  const { w, h } = TAVERNA.foglietto;
  rrect(c, 2, 3, w - 2, h - 3, 3); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
  c.beginPath(); c.moveTo(0, 4); for (let x = 0; x <= w - 2; x += 8) c.lineTo(x + 4, x % 16 ? 0 : 3); c.lineTo(w - 2, 4); c.lineTo(w - 2, h - 2); c.lineTo(0, h - 2); c.closePath();
  c.fillStyle = retro ? '#e8dcc0' : '#fbf6e8'; c.fill(); tratto(c, '#8a7a5a', 1.2);
  if (retro) {
    // il retro: lo scarabocchio del Boni e un punto di domanda enorme
    c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(140,110,70,0.5)'; c.fillText('?', w / 2, h / 2 + 16);
    c.beginPath(); c.arc(30, h - 22, 11, 0, Math.PI * 2); tratto(c, 'rgba(160,60,40,0.35)', 1.6);
    c.beginPath(); c.arc(w - 30, 22, 9, 0, Math.PI * 2); tratto(c, 'rgba(160,60,40,0.3)', 1.4);
  } else {
    c.beginPath(); c.moveTo(10, 22); c.lineTo(w - 12, 22); tratto(c, 'rgba(200,40,40,0.5)', 1);
    for (let y = 36; y < h - 4; y += 12) { c.beginPath(); c.moveTo(10, y); c.lineTo(w - 12, y); tratto(c, 'rgba(120,150,200,0.25)', 0.7); }
  }
}

// ------------------------------------------------------------
//  I NASCONDIGLI E I TRAVESTIMENTI
// ------------------------------------------------------------
function botte(c) {
  const forma = () => { c.beginPath(); c.moveTo(4, 2); c.quadraticCurveTo(-2, 22, 4, 42); c.lineTo(32, 42); c.quadraticCurveTo(38, 22, 32, 2); c.closePath(); };
  forma(); c.fillStyle = gradL(c, 0, 0, 36, 0, [[0, '#6a3e1e'], [0.45, '#a86a38'], [1, '#5a3218']]); c.fill();
  c.save(); forma(); c.clip();
  for (let x = 6; x < 32; x += 6) { c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + (x - 18) * 0.15, 22, x, 44); tratto(c, 'rgba(40,20,8,0.4)', 0.9); }
  for (const y of [8, 36]) { c.fillStyle = '#5a5a62'; c.fillRect(0, y, 36, 3.4); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(0, y, 36, 0.8); }
  c.restore();
  forma(); tratto(c, CONT, 1.6);
  ellisse(c, 18, 2.5, 14, 3); c.fillStyle = '#8a5a30'; c.fill(); tratto(c, CONT, 1.2);
  rrect(c, 15, 24, 6, 5, 1); c.fillStyle = '#3a2a1a'; c.fill();   // lo spinello
}
function cesta(c) {
  // la cesta della legna, grande, coi ciocchi che spuntano
  for (let i = 0; i < 5; i++) { c.save(); c.translate(10 + i * 7, 6); c.rotate(-0.3 + i * 0.15); rrect(c, -3.5, -9, 7, 18, 3); c.fillStyle = '#8a5a32'; c.fill(); tratto(c, CONT, 0.9); ellisse(c, 0, -9, 3.5, 2); c.fillStyle = '#c89a62'; c.fill(); c.restore(); }
  const forma = () => { c.beginPath(); c.moveTo(2, 8); c.lineTo(46, 8); c.lineTo(42, 36); c.lineTo(6, 36); c.closePath(); };
  forma(); c.fillStyle = '#c8a060'; c.fill();
  c.save(); forma(); c.clip();
  for (let y = 10; y < 36; y += 5) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= 48; x += 6) c.quadraticCurveTo(x + 3, y + (x / 6 % 2 ? 2 : -2), x + 6, y); tratto(c, 'rgba(110,70,30,0.6)', 1.2); }
  c.restore();
  forma(); tratto(c, CONT, 1.5);
  c.beginPath(); c.moveTo(1, 8); c.lineTo(47, 8); tratto(c, '#8a6430', 3);
}
function tenda(c, aperta) {
  // la tenda di velluto rosso della cantina, col bastone; aperta = raccolta da una parte
  rrect(c, 0, 0, 48, 4, 2); c.fillStyle = '#c8a040'; c.fill(); tratto(c, CONT, 1);
  if (aperta) {
    c.beginPath(); c.moveTo(2, 3); c.lineTo(14, 3); c.quadraticCurveTo(10, 50, 14, 98); c.lineTo(2, 98); c.closePath();
  } else {
    c.beginPath(); c.moveTo(2, 3); c.lineTo(46, 3); c.lineTo(46, 92); for (let x = 46; x > 2; x -= 11) c.quadraticCurveTo(x - 5.5, 96, x - 11, 92); c.closePath();
  }
  c.fillStyle = gradL(c, 0, 0, 48, 0, [[0, '#8a1a22'], [0.5, '#c02a34'], [1, '#7a1620']]); c.fill(); tratto(c, CONT, 1.3);
  for (let x = 6; x < (aperta ? 13 : 46); x += 6) { c.beginPath(); c.moveTo(x, 5); c.lineTo(x + 1, 90); tratto(c, 'rgba(0,0,0,0.18)', 1.6); }
}
function attaccapanni(c) {
  rrect(c, 15, 0, 4, 120, 1.5); c.fillStyle = '#4a2c18'; c.fill(); tratto(c, CONT, 1);
  ellisse(c, 17, 120, 12, 3); c.fillStyle = '#3a2210'; c.fill();
  for (const [x, y, s] of [[17, 6, -1], [17, 6, 1], [17, 12, -1], [17, 12, 1]]) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + s * 8, y - 2, x + s * 10, y + 4); tratto(c, '#4a2c18', 2); }
}
function cappotti(c, aTerra) {
  // il mucchio di cappotti appesi (o caduti per terra)
  const col = ['#3a4a6a', '#6a4a2a', '#2a2a30', '#7a2a2a', '#4a5a3a'];
  if (aTerra) {
    col.forEach((k, i) => { ellisse(c, 12 + i * 8, 9 - (i % 2) * 2, 12, 5, (i - 2) * 0.1); c.fillStyle = k; c.fill(); tratto(c, CONT, 1); });
    return;
  }
  col.forEach((k, i) => {
    const x = 6 + i * 6;
    c.beginPath(); c.moveTo(x + 8, 4); c.quadraticCurveTo(x - 4, 26, x + 2, 62); c.lineTo(x + 18, 62); c.quadraticCurveTo(x + 22, 26, x + 12, 4); c.closePath();
    c.fillStyle = k; c.fill(); tratto(c, CONT, 1.1);
    c.beginPath(); c.moveTo(x + 10, 10); c.lineTo(x + 10, 58); tratto(c, 'rgba(0,0,0,0.2)', 0.8);
  });
}
function porta(c, aperta) {
  if (aperta) {
    // aperta verso di noi: si vede la notte, e l'anta di taglio
    rrect(c, 0, 0, 34, 106, [10, 10, 0, 0]); c.fillStyle = gradL(c, 0, 0, 0, 106, [[0, '#101830'], [1, '#2a3a50']]); c.fill();
    for (let i = 0; i < 6; i++) { ellisse(c, 5 + i * 5, 10 + (i * 13) % 30, 0.8, 0.8); c.fillStyle = '#ffffff'; c.fill(); }
    poli(c, [[-10, 2], [0, 6], [0, 106], [-10, 110]]); c.fillStyle = legno(c, -10, 0, 0, 0, '#7a4a28'); c.fill(); tratto(c, CONT, 1.3);
    return;
  }
  rrect(c, 0, 0, 34, 106, [10, 10, 0, 0]); c.fillStyle = legno(c, 0, 0, 34, 0, '#7a4a28'); c.fill(); tratto(c, CONT, 1.4);
  for (const x of [8, 17, 26]) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x, 104); tratto(c, 'rgba(40,20,8,0.4)', 1); }
  for (const y of [24, 80]) { c.fillStyle = '#3a3a40'; c.fillRect(2, y, 30, 3); }
  ellisse(c, 28, 58, 2.4, 2.4); c.fillStyle = '#d8b040'; c.fill(); tratto(c, CONT, 0.8);
}
// i travestimenti
function baffiFinti(c) {
  c.beginPath(); c.moveTo(17, 4); c.bezierCurveTo(12, 0, 4, 2, 1, 9); c.bezierCurveTo(6, 7, 11, 9, 17, 7); c.bezierCurveTo(23, 9, 28, 7, 33, 9); c.bezierCurveTo(30, 2, 22, 0, 17, 4); c.closePath();
  c.fillStyle = '#17110e'; c.fill(); tratto(c, '#000000', 0.8);
}
function cappelloFeltro(c) {
  ellisse(c, 22, 17, 21, 4.2); c.fillStyle = '#3a3036'; c.fill(); tratto(c, CONT, 1.2);
  c.beginPath(); c.moveTo(8, 17); c.quadraticCurveTo(7, 3, 22, 2); c.quadraticCurveTo(37, 3, 36, 17); c.closePath(); c.fillStyle = '#4a3e46'; c.fill(); tratto(c, CONT, 1.2);
  c.fillStyle = '#9a2a2a'; c.fillRect(8.6, 12, 26.8, 3.4);
  c.beginPath(); c.moveTo(16, 4); c.quadraticCurveTo(22, 8, 28, 4); tratto(c, 'rgba(0,0,0,0.3)', 1.4);
}
function cappelloCuoco(c) {
  for (const [x, y, r] of [[9, 12, 8], [24, 10, 9], [16, 6, 9]]) { ellisse(c, x, y, r, r * 0.86); c.fillStyle = '#ffffff'; c.fill(); tratto(c, '#b8bcc8', 1); }
  rrect(c, 5, 15, 24, 15, 2); c.fillStyle = '#f6f6fa'; c.fill(); tratto(c, '#b8bcc8', 1);
  c.beginPath(); c.moveTo(11, 17); c.lineTo(11, 29); c.moveTo(17, 17); c.lineTo(17, 29); c.moveTo(23, 17); c.lineTo(23, 29); tratto(c, 'rgba(150,155,170,0.4)', 0.8);
}
function grembiule(c) {
  c.beginPath(); c.moveTo(8, 0); c.lineTo(32, 0); c.lineTo(34, 14); c.lineTo(38, 46); c.lineTo(2, 46); c.lineTo(6, 14); c.closePath();
  c.fillStyle = '#fbfbf6'; c.fill(); tratto(c, '#a8acb8', 1.2);
  rrect(c, 12, 22, 16, 10, 2); tratto(c, '#c8ccd8', 1);
  c.beginPath(); c.moveTo(8, 0); c.lineTo(4, -8); c.moveTo(32, 0); c.lineTo(36, -8); tratto(c, '#d8dce6', 2);
}
function bordoMaschera(c) {
  // il cartone della maschera (la faccia di Giorgio ce la mette la scena) e l'elastico
  ellisse(c, 16, 18, 15, 17); c.fillStyle = '#d8c09a'; c.fill(); tratto(c, '#8a7050', 1.2);
}
function palaPizza(c) {
  // la pala vista di lato, da infornare: il manico lungo e la paletta
  rrect(c, 0, 9, 52, 5, 2.5); c.fillStyle = '#a8743a'; c.fill(); tratto(c, CONT, 1.2);
  c.beginPath(); c.moveTo(50, 7); c.lineTo(92, 4); c.lineTo(94, 14); c.lineTo(50, 16); c.closePath();
  c.fillStyle = gradL(c, 50, 0, 94, 0, [[0, '#c48a46'], [1, '#e0b070']]); c.fill(); tratto(c, CONT, 1.3);
}
function caraffaTavola(c) {
  const vetro = () => { c.beginPath(); c.moveTo(5, 1); c.lineTo(11, 1); c.lineTo(11, 7); c.quadraticCurveTo(17, 11, 16, 18); c.quadraticCurveTo(15, 24, 8, 24); c.quadraticCurveTo(1, 24, 0, 18); c.quadraticCurveTo(-1, 11, 5, 7); c.closePath(); };
  vetro(); c.fillStyle = 'rgba(230,240,255,0.6)'; c.fill();
  c.save(); vetro(); c.clip(); c.fillStyle = '#8a1f2e'; c.fillRect(-2, 10, 20, 16); c.restore();
  vetro(); tratto(c, CONT, 1.2);
  c.beginPath(); c.moveTo(15, 9); c.quadraticCurveTo(21, 13, 15, 19); tratto(c, CONT, 1.2);
}

export function creaTaverna(scene) {
  const T = TAVERNA;
  tela(scene, 'bgTaverna', 480, 270, sfondoTaverna);
  for (let k = 0; k < 3; k++) tela(scene, `fuoco${k}`, 56, 32, (c) => fuoco(c, k), 4);
  tela(scene, 'tavolaTaverna', T.tavola.x1 - T.tavola.x0 + 4, 50, (c) => { c.translate(2, 2); tavola(c); });
  tela(scene, 'banconeTaverna', 480, 80, bancone);
  tela(scene, 'pastaPizza', 72, 72, pasta, 5);
  tela(scene, 'pomodoroPizza', 14, 14, pomodoro, 6);
  tela(scene, 'pizzaCotta', 72, 72, pizzaCotta, 5);
  tela(scene, 'fettaPizza', 22, 22, fetta, 6);
  for (const k of [...INGREDIENTI, 'pomodoro']) tela(scene, 'ing_' + k, 16, 16, (c) => ingrediente(c, k), 8);
  tela(scene, 'ciotola', 38, 24, ciotola, 6);
  tela(scene, 'foglietto', T.foglietto.w, T.foglietto.h, (c) => foglietto(c, false), 4);
  tela(scene, 'fogliettoRetro', T.foglietto.w, T.foglietto.h, (c) => foglietto(c, true), 4);
  tela(scene, 'botte', 36, 46, botte, 6);
  tela(scene, 'cesta', 48, 38, cesta, 6);
  tela(scene, 'tendaChiusa', 48, 100, (c) => tenda(c, false), 5);
  tela(scene, 'tendaAperta', 48, 100, (c) => tenda(c, true), 5);
  tela(scene, 'attaccapanni', 34, 124, attaccapanni, 5);
  tela(scene, 'cappotti', 40, 64, (c) => cappotti(c, false), 5);
  tela(scene, 'cappottiTerra', 52, 16, (c) => cappotti(c, true), 5);
  tela(scene, 'portaChiusa', 34, 106, (c) => porta(c, false), 5);
  tela(scene, 'portaAperta', 44, 112, (c) => { c.translate(10, 0); porta(c, true); }, 5);
  tela(scene, 'baffiFinti', 34, 12, baffiFinti, 8);
  tela(scene, 'cappelloFeltro', 44, 22, cappelloFeltro, 8);
  tela(scene, 'cappelloCuoco', 34, 32, cappelloCuoco, 8);
  tela(scene, 'grembiule', 40, 56, (c) => { c.translate(0, 9); grembiule(c); }, 6);
  tela(scene, 'bordoMaschera', 32, 36, bordoMaschera, 8);
  tela(scene, 'palaPizza', 96, 20, palaPizza, 6);
  tela(scene, 'caraffaTavola', 22, 26, (c) => { c.translate(2, 1); caraffaTavola(c); }, 8);
}
