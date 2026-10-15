// "L'Incubo degli Scapoli": la discoteca vista dall'alto e gli oggetti di scena.
// La pista è una griglia di mattonelle (le accende la scena, a tempo); attorno ci sono il
// bancone del bar (a sinistra), la consolle del DJ (in alto), i divanetti (a destra) e
// l'ingresso col buttafuori (in basso).
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, gradR, casuale } from './base.js';

export const DISCO = {
  pista: { x0: 104, y0: 86, col: 8, righe: 5, lato: 34, alt: 28 },   // 272 x 140
  area: { x0: 64, x1: 420, y0: 84, y1: 238 },                        // dove si può camminare
  centro: { x: 240, y: 160 },
  uscita: { x: 322, y: 262 },                                        // la porta, in basso
  buttafuori: { x: 366, y: 266 },
  console: { x: 240, y: 58 },
  palla: { x: 332, y: 56 },
  bancone: { x: 30, y: 150 },                                        // dove resta chi perde, col bicchiere vuoto
};

function sfondoDisco(c) {
  const P = DISCO.pista, r = casuale(77), W = P.col * P.lato, H = P.righe * P.alt;
  // pavimento scuro, con una moquette appena disegnata
  c.fillStyle = gradL(c, 0, 0, 0, 270, [[0, '#1c1136'], [1, '#120a26']]); c.fillRect(0, 0, 480, 270);
  for (let i = 0; i < 260; i++) { ellisse(c, r() * 480, 46 + r() * 224, 0.6, 0.5); c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.25)'; c.fill(); }
  // parete in fondo, con le strisce al neon
  c.fillStyle = gradL(c, 0, 0, 0, 46, [[0, '#0e0820'], [1, '#231445']]); c.fillRect(0, 0, 480, 46);
  for (const [y, col] of [[43, '#ff3b9a'], [45.5, '#3bd0ff']]) { c.fillStyle = col; c.fillRect(0, y, 480, 1.2); }

  // la pista: cornice al neon e mattonelle spente
  rrect(c, P.x0 - 5, P.y0 - 5, W + 10, H + 10, 4); c.fillStyle = '#0b0618'; c.fill(); tratto(c, '#b06aff', 1.4);
  for (let gy = 0; gy < P.righe; gy++) for (let gx = 0; gx < P.col; gx++) {
    rrect(c, P.x0 + gx * P.lato + 1, P.y0 + gy * P.alt + 1, P.lato - 2, P.alt - 2, 2.5);
    c.fillStyle = (gx + gy) % 2 ? '#241640' : '#1d1136'; c.fill(); tratto(c, 'rgba(176,106,255,0.25)', 0.6);
  }

  // consolle del DJ, con i piatti e le casse
  for (const x of [166, 292]) {
    rrect(c, x, 48, 22, 28, 2); c.fillStyle = '#17131f'; c.fill(); tratto(c, CONT, 1);
    for (const y of [56, 68]) { ellisse(c, x + 11, y, 6, 5); c.fillStyle = '#2a2634'; c.fill(); tratto(c, '#4a4658', 0.8); ellisse(c, x + 11, y, 2.2, 1.9); c.fillStyle = '#0c0a12'; c.fill(); }
  }
  rrect(c, 194, 60, 92, 18, 3); c.fillStyle = gradL(c, 0, 60, 0, 78, [[0, '#3a2a66'], [1, '#231540']]); c.fill(); tratto(c, CONT, 1.1);
  c.fillStyle = '#ff3b9a'; c.fillRect(196, 76, 88, 1.4);
  for (const x of [214, 266]) { ellisse(c, x, 68, 9, 6.5); c.fillStyle = '#121018'; c.fill(); tratto(c, '#5a5670', 0.8); ellisse(c, x, 68, 3, 2.2); c.fillStyle = '#ff3b9a'; c.fill(); c.beginPath(); c.arc(x, 68, 6, 0.4, 1.6); tratto(c, 'rgba(255,255,255,0.35)', 0.7); }
  rrect(c, 231, 62.5, 18, 11, 1.5); c.fillStyle = '#17131f'; c.fill(); tratto(c, '#5a5670', 0.6);
  for (let i = 0; i < 4; i++) { c.fillStyle = ['#7dff9a', '#ffe14a', '#ff6b5a', '#3bd0ff'][i]; c.fillRect(233.5 + i * 3.6, 71.5 - (i % 2 ? 5 : 3), 2, i % 2 ? 5 : 3); }

  // bancone del bar, a sinistra: mensola delle bottiglie, piano, sgabelli
  c.fillStyle = '#0e0820'; c.fillRect(0, 60, 12, 172);
  for (let i = 0; i < 12; i++) {
    const y = 68 + i * 13.4, col = ['#3bd0ff', '#ffe14a', '#ff6b5a', '#7dff9a', '#ff8a3a', '#b06aff'][i % 6];
    rrect(c, 2.5, y, 6.5, 9.5, 1.5); c.fillStyle = col; c.fill(); tratto(c, CONT, 0.6); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(4, y + 1.5, 1.4, 5);
  }
  rrect(c, 16, 62, 30, 170, 5); c.fillStyle = gradL(c, 16, 0, 46, 0, [[0, '#5a3418'], [0.5, '#8a5428'], [1, '#4a2a12']]); c.fill(); tratto(c, CONT, 1.2);
  c.fillStyle = '#3bd0ff'; c.fillRect(44.5, 66, 1.4, 162);
  for (const [x, y] of [[30, 84], [34, 122], [27, 176], [33, 208]]) { ellisse(c, x, y, 3.6, 3.6); c.fillStyle = 'rgba(235,245,255,0.8)'; c.fill(); tratto(c, 'rgba(0,0,0,0.4)', 0.6); ellisse(c, x, y, 2.2, 2.2); c.fillStyle = ['#ff8a2e', '#ffe14a', '#ff6b9a', '#7dd3ff'][Math.floor(r() * 4)]; c.fill(); }
  for (const y of [96, 136, 176, 216]) { ellisse(c, 56, y + 2, 7, 5); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill(); ellisse(c, 55, y, 6.6, 5.2); c.fillStyle = '#c0392b'; c.fill(); tratto(c, CONT, 0.9); ellisse(c, 54, y - 1, 3, 2); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fill(); }

  // divanetti, a destra, coi tavolini
  for (const y of [84, 152]) {
    rrect(c, 438, y, 36, 56, 6); c.fillStyle = '#5a2a8a'; c.fill(); tratto(c, CONT, 1.2);
    rrect(c, 462, y + 3, 10, 50, 4); c.fillStyle = '#7a3fb8'; c.fill(); tratto(c, 'rgba(0,0,0,0.4)', 0.8);
    for (const dy of [5, 30]) { rrect(c, 441, y + dy, 20, 22, 4); c.fillStyle = '#6a34a2'; c.fill(); tratto(c, 'rgba(0,0,0,0.35)', 0.7); }
    ellisse(c, 428, y + 30, 7.5, 6); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
    ellisse(c, 427, y + 28, 7, 5.6); c.fillStyle = '#2a2040'; c.fill(); tratto(c, '#b06aff', 0.8);
    ellisse(c, 425, y + 27, 1.8, 1.8); c.fillStyle = '#ff8a2e'; c.fill(); ellisse(c, 429.5, y + 29.5, 1.6, 1.6); c.fillStyle = '#7dd3ff'; c.fill();
  }

  // l'ingresso, in basso: tappeto rosso, cordone, insegna
  const U = DISCO.uscita;
  poli(c, [[U.x - 18, 244], [U.x + 18, 244], [U.x + 22, 270], [U.x - 22, 270]]); c.fillStyle = '#a82030'; c.fill(); tratto(c, '#5a0c16', 1);
  c.fillStyle = '#0a0612'; c.fillRect(U.x - 22, 264, 44, 6);
  rrect(c, U.x - 19, 247, 38, 9, 2); c.fillStyle = '#0e0820'; c.fill(); tratto(c, '#7dff9a', 0.9);
  for (const s of [-1, 1]) { rrect(c, U.x + s * 30 - 1.5, 248, 3, 16, 1); c.fillStyle = '#d8b048'; c.fill(); tratto(c, CONT, 0.6); ellisse(c, U.x + s * 30, 247, 2.6, 2.6); c.fillStyle = '#f6c63a'; c.fill(); tratto(c, CONT, 0.6); }
  c.beginPath(); c.moveTo(U.x - 78, 252); c.quadraticCurveTo(U.x - 54, 262, U.x - 30, 251); tratto(c, '#c0392b', 2);
  rrect(c, U.x - 81.5, 248, 3, 16, 1); c.fillStyle = '#d8b048'; c.fill(); tratto(c, CONT, 0.6);

  // due piante e la vignettatura
  for (const [x, y] of [[84, 70], [396, 70]]) {
    ellisse(c, x, y + 4, 8, 4); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; ellisse(c, x + Math.cos(a) * 5, y + Math.sin(a) * 4, 6, 2.6, a); c.fillStyle = i % 2 ? '#2e8a4a' : '#3fae5e'; c.fill(); }
    ellisse(c, x, y, 3.4, 3); c.fillStyle = '#8a5428'; c.fill(); tratto(c, CONT, 0.6);
  }
  c.fillStyle = gradR(c, 240, 150, 150, 330, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,10,0.5)']]); c.fillRect(0, 0, 480, 270);
}

// palla stroboscopica (26x26)
function pallaDisco(c) {
  ellisse(c, 13, 13, 11, 11); c.fillStyle = gradR(c, 9, 9, 1, 13, [[0, '#ffffff'], [0.5, '#b8c0d8'], [1, '#4a5068']]); c.fill();
  c.save(); ellisse(c, 13, 13, 11, 11); c.clip();
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.ellipse(13, 13, 11, Math.abs(i) * 3.6 + 0.4, 0, 0, Math.PI * 2); tratto(c, 'rgba(40,40,70,0.5)', 0.5); c.beginPath(); c.ellipse(13, 13, Math.abs(i) * 3.6 + 0.4, 11, 0, 0, Math.PI * 2); tratto(c, 'rgba(40,40,70,0.5)', 0.5); }
  for (const [x, y, col] of [[8, 8, '#ffffff'], [16, 10, '#7dd3ff'], [11, 16, '#ff9ac4'], [18, 17, '#ffe98a']]) { c.fillStyle = col; c.fillRect(x, y, 2.6, 2.4); }
  c.restore();
  ellisse(c, 13, 13, 11, 11); tratto(c, CONT, 1.2);
  c.fillStyle = '#8a8e9a'; c.fillRect(12, 0, 2, 3);
}

// il DJ visto dall'alto (30x26): testa con le cuffie, spalle, braccia sui piatti
function dj(c) {
  rrect(c, 4, 12, 22, 12, 5); c.fillStyle = '#2f9ad8'; c.fill(); tratto(c, CONT, 1.1);
  for (const s of [-1, 1]) { rrect(c, 15 + s * 11 - 2.5, 14, 5, 11, 2.5); c.fillStyle = '#e0b08a'; c.fill(); tratto(c, CONT, 0.9); }
  ellisse(c, 15, 10, 7.5, 7); c.fillStyle = '#e0b08a'; c.fill(); tratto(c, CONT, 1.1);
  c.beginPath(); c.arc(15, 9.5, 7.6, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(15, 5); c.closePath(); c.fillStyle = '#2a1a12'; c.fill();
  c.beginPath(); c.arc(15, 9.5, 8.6, Math.PI * 1.08, Math.PI * 1.92); tratto(c, CONT, 3.4); tratto(c, '#ff3b9a', 1.8);
  for (const s of [-1, 1]) { rrect(c, 15 + s * 8.2 - 2, 7, 4, 7, 1.6); c.fillStyle = '#1c1c24'; c.fill(); tratto(c, CONT, 0.8); }
}

// gli oggetti dei sabotaggi (20x20)
function oggetto(c, tipo) {
  if (tipo === 'drink') {
    c.save(); c.translate(10, 10); c.rotate(-0.5);
    const coppa = () => { c.beginPath(); c.moveTo(-7, -7); c.lineTo(7, -7); c.lineTo(0.8, 1.5); c.lineTo(-0.8, 1.5); c.closePath(); };
    coppa(); c.fillStyle = '#ff8a2e'; c.fill(); tratto(c, CONT, 1.2);
    c.beginPath(); c.moveTo(0, 1.5); c.lineTo(0, 7); c.moveTo(-3.6, 7.4); c.lineTo(3.6, 7.4); tratto(c, CONT, 2.6); tratto(c, '#eaf4ff', 1.2);
    ellisse(c, 5.5, -7.5, 2.8, 2.8); c.fillStyle = '#ffd84a'; c.fill(); tratto(c, CONT, 0.8);
    c.restore();
    for (const [x, y] of [[4, 15], [7, 18], [2, 11]]) { ellisse(c, x, y, 1.3, 1.6); c.fillStyle = '#ff8a2e'; c.fill(); }   // le gocce che cadono
  } else if (tipo === 'mamma') {
    rrect(c, 5, 1.5, 10.5, 17, 2.2); c.fillStyle = '#22242c'; c.fill(); tratto(c, CONT, 1.1);
    rrect(c, 6.3, 3.5, 7.9, 11.6, 1); c.fillStyle = '#ffd0e0'; c.fill();
    c.beginPath(); c.moveTo(10.2, 12); c.bezierCurveTo(5.6, 8.6, 7.6, 5.4, 10.2, 7.6); c.bezierCurveTo(12.8, 5.4, 14.8, 8.6, 10.2, 12); c.closePath(); c.fillStyle = '#e0304a'; c.fill();
    for (const rr of [2.2, 3.8]) { c.beginPath(); c.arc(15.5, 3.5, rr, -1.2, 0.4); tratto(c, '#ffe14a', 1); }   // squilla
  } else if (tipo === 'shottino') {
    const vetro = () => poli(c, [[5, 4], [15, 4], [13.2, 17], [6.8, 17]]);
    vetro(); c.fillStyle = 'rgba(235,245,255,0.8)'; c.fill();
    c.save(); vetro(); c.clip(); c.fillStyle = '#e8a020'; c.fillRect(4, 7.5, 12, 10); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(7, 8.5, 1.6, 7); c.restore();
    vetro(); tratto(c, CONT, 1.2);
    c.fillStyle = '#eaf4ff'; c.fillRect(6.6, 15.4, 6.8, 1.6);
  } else if (tipo === 'dj') {
    ellisse(c, 10, 10, 8.4, 8.4); c.fillStyle = '#16141c'; c.fill(); tratto(c, CONT, 1.1);
    for (const rr of [6.4, 4.8]) { c.beginPath(); c.arc(10, 10, rr, 0, Math.PI * 2); tratto(c, 'rgba(255,255,255,0.16)', 0.5); }
    ellisse(c, 10, 10, 3, 3); c.fillStyle = '#ff6b9a'; c.fill(); ellisse(c, 10, 10, 0.8, 0.8); c.fillStyle = '#16141c'; c.fill();
    c.beginPath(); c.arc(10, 10, 6.8, -2.3, -1.3); tratto(c, 'rgba(255,255,255,0.6)', 1);
  } else {
    // buttafuori: il documento d'identità
    rrect(c, 2, 4.5, 16, 11.5, 1.8); c.fillStyle = '#f4efe2'; c.fill(); tratto(c, CONT, 1.1);
    c.fillStyle = '#2f6fd8'; c.fillRect(2.8, 5.2, 14.4, 2.4);
    rrect(c, 3.8, 8.6, 4.6, 5.6, 0.8); c.fillStyle = '#c9b8a0'; c.fill(); ellisse(c, 6.1, 10.4, 1.3, 1.4); c.fillStyle = '#6a4a36'; c.fill();
    c.fillStyle = '#5a5a66'; for (const [y, w] of [[9.4, 6.4], [11.4, 5], [13.2, 6]]) c.fillRect(10, y, w, 0.9);
  }
}

// il bersaglio della sfida lampo (20x20): la freccia punta in su, si gira per le altre direzioni
function frecciaSfida(c, cerchio) {
  ellisse(c, 10, 10, 8.6, 8.6); c.fillStyle = gradR(c, 8, 7, 1, 10, [[0, '#4a2a8a'], [1, '#231445']]); c.fill(); tratto(c, '#ffffff', 1.3);
  if (cerchio) { ellisse(c, 10, 10, 3.4, 3.4); c.fillStyle = '#ffffff'; c.fill(); return; }
  poli(c, [[10, 3.4], [15.4, 9.6], [12, 9.6], [12, 16.2], [8, 16.2], [8, 9.6], [4.6, 9.6]]); c.fillStyle = '#ffffff'; c.fill(); tratto(c, CONT, 0.7);
}

// bicchiere vuoto, per chi resta al bancone (12x16)
function bicchiereVuoto(c) {
  const vetro = () => poli(c, [[2, 2], [10, 2], [8.6, 14], [3.4, 14]]);
  vetro(); c.fillStyle = 'rgba(235,245,255,0.55)'; c.fill(); tratto(c, CONT, 1.1);
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(4, 3.5, 1.3, 8);
  ellisse(c, 6, 12.6, 1.6, 0.7); c.fillStyle = '#ff8a2e'; c.fill();
}

export const SABOTAGGI = ['drink', 'mamma', 'shottino', 'dj', 'buttafuori'];

// (I nomi sono diversi da quelli della disco di Petri Tentacolari, che ha il suo sfondo
//  'bgDisco' in sfondi.js e i suoi oggetti in oggetti.js: qui 'bgPista' e creaPista.)
export function creaPista(scene) {
  tela(scene, 'bgPista', 480, 270, sfondoDisco);
  tela(scene, 'pallaDisco', 26, 26, pallaDisco, 8);
  tela(scene, 'dj', 30, 26, dj, 8);
  for (const t of SABOTAGGI) tela(scene, 'sab_' + t, 20, 20, (c) => oggetto(c, t), 10);
  tela(scene, 'frecciaSfida', 20, 20, (c) => frecciaSfida(c, false), 10);
  tela(scene, 'cerchioSfida', 20, 20, (c) => frecciaSfida(c, true), 10);
  tela(scene, 'bicchiereVuoto', 12, 16, bicchiereVuoto, 10);
}
