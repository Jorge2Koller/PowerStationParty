// Le medaglie (bronzo, argento, oro) dei risultati e del profilo: nastro a V e disco con la stella;
// la coppa dei trofei (coppa, coppaGrigia) e la pinta, la moneta del Bancone (iconaPinta).
// Texture: medaglia_bronzo, medaglia_argento, medaglia_oro (26x38 unità), e medaglia_vuota
// (il posto di una medaglia non ancora presa: solo il contorno).
import { tela, CONT, tratto, ellisse, poli, gradL, gradR } from './base.js';

const METALLI = {
  bronzo: { chiaro: '#ffd2a0', medio: '#d8894a', scuro: '#8a4a1e', nastro: ['#c0392b', '#e8604c'] },
  argento: { chiaro: '#ffffff', medio: '#c8d0dc', scuro: '#6a7484', nastro: ['#2f5fc0', '#4a8ae8'] },
  oro: { chiaro: '#fff6b0', medio: '#ffc92e', scuro: '#a86a00', nastro: ['#2e9a4a', '#4ac86a'] },
};

function stella(c, x, y, r1, r2) {
  c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? r2 : r1; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  c.closePath();
}

function medaglia(c, M) {
  // il nastro: due strisce a V
  for (const [x0, col] of [[3, M.nastro[0]], [13, M.nastro[1]]]) {
    poli(c, [[x0, 0], [x0 + 10, 0], [x0 + 10 + (x0 < 10 ? 2 : -2), 16], [x0 + (x0 < 10 ? 2 : -2), 16]]);
    c.fillStyle = col; c.fill(); tratto(c, CONT, 0.8);
  }
  // il disco
  ellisse(c, 13, 25, 11.5, 11.5); c.fillStyle = gradR(c, 9, 20, 1, 13, [[0, M.chiaro], [0.55, M.medio], [1, M.scuro]]); c.fill(); tratto(c, CONT, 1.1);
  ellisse(c, 13, 25, 8.4, 8.4); tratto(c, M.scuro, 0.8);
  stella(c, 13, 25.5, 6, 2.6); c.fillStyle = gradL(c, 0, 19, 0, 31, [[0, M.chiaro], [1, M.medio]]); c.fill(); tratto(c, M.scuro, 0.7);
  ellisse(c, 8.5, 20, 2.6, 1.4, -0.7); c.fillStyle = 'rgba(255,255,255,0.65)'; c.fill();
}

// la coppa dei trofei (oro se preso, grigia se ancora da prendere)
function coppa(c, presa) {
  const [ch, me, sc] = presa ? ['#fff6b0', '#ffc92e', '#a86a00'] : ['#c8ccd4', '#8a909c', '#4a4e58'];
  // manici
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(15 + s * 10, 11, 5, 6, 0, s < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s < 0 ? Math.PI * 1.5 : Math.PI * 0.5, s > 0); tratto(c, CONT, 3.4); tratto(c, me, 1.8); }
  // la coppa
  c.beginPath(); c.moveTo(6, 3); c.lineTo(24, 3); c.bezierCurveTo(24, 16, 19, 21, 15, 21); c.bezierCurveTo(11, 21, 6, 16, 6, 3); c.closePath();
  c.fillStyle = gradL(c, 6, 0, 24, 0, [[0, sc], [0.35, ch], [0.6, me], [1, sc]]); c.fill(); tratto(c, CONT, 1.1);
  // gambo e base
  poli(c, [[13.5, 21], [16.5, 21], [17.5, 26], [12.5, 26]]); c.fillStyle = me; c.fill(); tratto(c, CONT, 0.9);
  poli(c, [[8, 26], [22, 26], [23, 30], [7, 30]]); c.fillStyle = sc; c.fill(); tratto(c, CONT, 0.9);
  if (presa) { stella(c, 15, 10.5, 4, 1.8); c.fillStyle = '#fffbe0'; c.fill(); }
}

// la pinta: la moneta del Bancone
function iconaPinta(c) {
  poli(c, [[3, 3], [15, 3], [14, 21], [4, 21]]); c.fillStyle = gradL(c, 0, 6, 0, 21, [[0, '#ffc93a'], [1, '#d8841a']]); c.fill();
  ellisse(c, 9, 4, 6.5, 3); c.fillStyle = '#fffbe8'; c.fill();
  ellisse(c, 6, 3, 3, 2.2); c.fill(); ellisse(c, 12, 3.2, 3, 2.2); c.fill();
  poli(c, [[3, 3], [15, 3], [14, 21], [4, 21]]); tratto(c, CONT, 1.2);
  c.beginPath(); c.ellipse(16, 12, 3.2, 4.5, 0, -Math.PI / 2, Math.PI / 2); tratto(c, CONT, 1.6);
  poli(c, [[5.5, 8], [7, 8], [6.6, 19], [5.6, 19]]); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fill();
}

export function creaMedaglie(scene) {
  for (const [nome, M] of Object.entries(METALLI)) tela(scene, 'medaglia_' + nome, 26, 38, (c) => medaglia(c, M), 6);
  tela(scene, 'medaglia_vuota', 26, 38, (c) => {
    ellisse(c, 13, 25, 11, 11); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
    c.setLineDash([2, 2]); tratto(c, 'rgba(255,255,255,0.55)', 1.2); c.setLineDash([]);
  }, 6);
  tela(scene, 'coppa', 30, 31, (c) => coppa(c, true), 6);
  tela(scene, 'coppaGrigia', 30, 31, (c) => coppa(c, false), 6);
  tela(scene, 'iconaPinta', 21, 24, iconaPinta, 6);
}
