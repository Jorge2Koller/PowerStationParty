// "La ballata del Pallaio": la piazzetta davanti al bar Pallaio, di sera, con le lucine appese; il
// cartellone del cantastorie (cornice di legno, tela dipinta, due righe da 4 caselle) sul suo
// cavalletto, il telo che copre la riga in basso, il retro bianco di una vignetta girata dal vento,
// il cappello rovesciato per le monete, i tavolini del pubblico, i pomodori. E le vignette: piccole
// scene disegnate coi personaggi e gli oggetti che esistono già nel gioco (vedi vignetta()).
import { tela, CONT, DENS, casuale, riemp, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alfa, alone } from './base.js';

// dove sta tutto (lo usa BallataScene). Le caselle: 4 colonne x 2 righe, angolo in alto a sinistra
// della casella (col, riga) in (x0 + col * passoX, y0 + riga * passoY)
export const PIAZZA = {
  cella: { w: 76, h: 70 },
  x0: 102, y0: 44, passoX: 82, passoY: 76,
  cornice: { x: 94, y: 36, w: 338, h: 162 },
  sottotitolo: 206,                       // la riga del testo della strofa, sotto il cartellone
  lori: { x: 44, y: 268 },                // i piedi di Lori, a sinistra del cartellone
  cappello: { x: 86, y: 266 },
  fumetto: { x: 47, y: 86 },              // il fumetto della strofa, sopra Lori (centro)
  tavolini: [{ x: 148, posti: [-20, 20] }, { x: 282, posti: [-22, 22] }, { x: 416, posti: [-20, 20] }],
  yTavolini: 264, ySeduti: 262,
};
export const centroCella = (i) => ({ x: PIAZZA.x0 + (i % 4) * PIAZZA.passoX + PIAZZA.cella.w / 2, y: PIAZZA.y0 + Math.floor(i / 4) * PIAZZA.passoY + PIAZZA.cella.h / 2 });

const LEGNO = '#8a5a2c';
const legno = (c, x0, y0, x1, y1, col = LEGNO) => gradL(c, x0, y0, x1, y1, [[0, chiaro(col, 0.18)], [0.5, col], [1, scuro(col, 0.28)]]);
const COLORI_LUCINE = ['#ffd84a', '#ff6a5a', '#7ae08a', '#6ab8ff', '#ff9ad8'];

// ------------------------------------------------------------
//  LO SFONDO
// ------------------------------------------------------------
function lucine(c, x0, y0, x1, y1, pancia, n, r) {
  // il filo che pende tra due punti, con le lampadine appese
  const punto = (t) => ({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t + 4 * pancia * t * (1 - t) });
  c.beginPath(); for (let i = 0; i <= 30; i++) { const p = punto(i / 30); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); } tratto(c, '#17111c', 0.9);
  for (let i = 0; i < n; i++) {
    const p = punto((i + 0.5) / n), col = COLORI_LUCINE[Math.floor(r() * COLORI_LUCINE.length)];
    c.save(); c.globalCompositeOperation = 'lighter'; alone(c, p.x, p.y + 4, 11, col, 0.32); c.restore();
    c.fillStyle = '#17111c'; c.fillRect(p.x - 0.8, p.y, 1.6, 2);
    ellisse(c, p.x, p.y + 4, 1.9, 2.5); riemp(c, col); tratto(c, scuro(col, 0.4), 0.5);
    ellisse(c, p.x - 0.5, p.y + 3.2, 0.6, 0.9); riemp(c, '#ffffff');
  }
}

function sampietrini(c, r) {
  // il selciato della piazza: file di sampietrini, più piccoli lontano
  c.fillStyle = gradL(c, 0, 196, 0, 270, [[0, '#4e3e52'], [1, '#33283a']]); c.fillRect(0, 196, 480, 74);
  let y = 198;
  while (y < 272) {
    const h = 3 + (y - 196) * 0.07, w = h * 1.5, sfasa = (Math.round(y) % 2) * w * 0.5;
    for (let x = -w + sfasa; x < 480 + w; x += w + 0.8) {
      rrect(c, x, y, w, h, h * 0.4); c.fillStyle = mixPietra(r()); c.fill(); tratto(c, 'rgba(20,12,24,0.55)', 0.5);
    }
    y += h + 0.8;
  }
}
const mixPietra = (t) => ['#5a4a5e', '#625266', '#544458', '#6a5a6c'][Math.floor(t * 4)];

function sfondo(c) {
  const r = casuale(5150);
  // il cielo di sera
  c.fillStyle = gradL(c, 0, 0, 0, 196, [[0, '#17143a'], [0.45, '#3a2a64'], [0.78, '#87476e'], [1, '#d97a58']]); c.fillRect(0, 0, 480, 196);
  for (let i = 0; i < 46; i++) { ellisse(c, r() * 480, r() * 96, 0.45 + r() * 0.5, 0.45 + r() * 0.5); c.fillStyle = alfa('#ffffff', 0.4 + r() * 0.5); c.fill(); }
  ellisse(c, 404, 30, 9, 9); c.fillStyle = '#fff2c8'; c.fill();
  ellisse(c, 408, 27, 8, 8); c.fillStyle = '#3a2a64'; c.fill();     // la luna a falce
  // i tetti del paese, dietro
  let x = -6;
  while (x < 486) {
    const w = 34 + r() * 40, h = 46 + r() * 56, col = ['#2c2244', '#33284e', '#271e3c'][Math.floor(r() * 3)];
    poli(c, [[x, 196], [x, 196 - h], [x + w / 2, 196 - h - 10 - r() * 8], [x + w, 196 - h], [x + w, 196]]); riemp(c, col);
    for (let k = 0; k < 4; k++) if (r() < 0.55) { rrect(c, x + 6 + r() * (w - 16), 196 - h + 8 + r() * (h - 26), 6, 8, 1); c.fillStyle = r() < 0.6 ? '#ffcf7a' : '#4a3a62'; c.fill(); }
    x += w - 2;
  }
  // il Pallaio, a sinistra: muro caldo, la vetrata illuminata, l'insegna
  c.fillStyle = gradL(c, 0, 70, 0, 196, [[0, '#b8784e'], [1, '#8a5236']]); c.fillRect(0, 70, 96, 126);
  c.fillStyle = '#5a3424'; c.fillRect(0, 66, 98, 6);
  rrect(c, 10, 110, 70, 62, 2); c.fillStyle = gradL(c, 0, 110, 0, 172, [[0, '#ffe2a0'], [1, '#ffb45a']]); c.fill(); tratto(c, '#3a2018', 2);
  c.beginPath(); c.moveTo(45, 110); c.lineTo(45, 172); c.moveTo(10, 140); c.lineTo(80, 140); tratto(c, '#3a2018', 1.6);
  for (const [bx, by] of [[22, 150], [60, 156], [34, 124]]) { ellisse(c, bx, by, 7, 9); c.fillStyle = 'rgba(90,50,30,0.35)'; c.fill(); }   // gente dentro, in controluce
  // l'ingresso a destra, sotto la tenda a strisce, con la luce che esce
  c.fillStyle = gradL(c, 0, 90, 0, 196, [[0, '#b8784e'], [1, '#8a5236']]); c.fillRect(430, 90, 50, 106);
  rrect(c, 446, 130, 30, 66, [3, 3, 0, 0]); c.fillStyle = gradL(c, 0, 130, 0, 196, [[0, '#fff0b8'], [1, '#ffbe6a']]); c.fill(); tratto(c, '#3a2018', 1.6);
  for (let i = 0; i < 6; i++) {
    poli(c, [[430 + i * 9, 112], [439 + i * 9, 112], [439 + i * 9, 124], [434.5 + i * 9, 127], [430 + i * 9, 124]]);
    riemp(c, i % 2 ? '#f4efe6' : '#d8342e'); tratto(c, 'rgba(40,10,10,0.5)', 0.6);
  }
  // l'insegna PALLAIO, in verticale, al neon
  rrect(c, 434, 132, 10, 46, 2); c.fillStyle = '#2a1a22'; c.fill(); tratto(c, '#120a10', 1);
  c.save(); c.globalCompositeOperation = 'lighter'; alone(c, 439, 155, 22, '#ff5ab4', 0.35); c.restore();
  c.fillStyle = '#ffd0ec'; c.font = '600 6px Fredoka, sans-serif'; c.textAlign = 'center';
  'PALLAIO'.split('').forEach((l, i) => c.fillText(l, 439, 138.5 + i * 6.2));
  // la luce calda che esce sulla piazza
  c.save(); c.globalCompositeOperation = 'lighter'; alone(c, 460, 206, 60, '#ffb45a', 0.22); alone(c, 45, 200, 70, '#ffb45a', 0.18); c.restore();
  // il selciato
  sampietrini(c, r);
  c.save(); c.globalCompositeOperation = 'lighter'; alone(c, 262, 220, 170, '#ffb45a', 0.1); c.restore();
  // il cavalletto del cartellone (le gambe; il cartellone ci sta sopra)
  for (const [gx, d] of [[124, -10], [402, 10]]) {
    poli(c, [[gx - 3, 190], [gx + 3, 190], [gx + 3 + d, 246], [gx - 3 + d, 246]]); c.fillStyle = legno(c, gx - 4, 0, gx + 4, 0, '#6a4220'); c.fill(); tratto(c, CONT, 1.2);
    ellisse(c, gx + d, 247, 9, 2.2); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
  }
  // le lucine appese da una parte all'altra della piazza
  lucine(c, -4, 10, 160, 22, 10, 9, r);
  lucine(c, 160, 22, 330, 14, 8, 9, r);
  lucine(c, 330, 14, 484, 26, 9, 8, r);
  lucine(c, -4, 46, 96, 64, 5, 5, r);
  // vignettatura
  c.fillStyle = gradR(c, 260, 130, 160, 320, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(10,0,20,0.45)']]); c.fillRect(0, 0, 480, 270);
}

// ------------------------------------------------------------
//  IL CARTELLONE (cornice e tela; le vignette le appende la scena)
// ------------------------------------------------------------
function cartellone(c) {
  const { w, h } = PIAZZA.cornice, r = casuale(808);
  rrect(c, 0, 0, w, h, 5); c.fillStyle = legno(c, 0, 0, 0, h); c.fill(); tratto(c, CONT, 2);
  // le venature
  for (let i = 0; i < 18; i++) { c.beginPath(); const y = 2 + r() * (h - 4), x = r() * w; c.moveTo(x, y); c.quadraticCurveTo(x + 20, y + 1.5, x + 40 + r() * 30, y); tratto(c, 'rgba(50,25,8,0.25)', 0.6); }
  // la tela dipinta
  rrect(c, 6, 6, w - 12, h - 12, 2); c.fillStyle = gradL(c, 0, 6, 0, h - 6, [[0, '#f3e6c6'], [1, '#e2cfa2']]); c.fill(); tratto(c, scuro(LEGNO, 0.45), 1.4);
  c.globalAlpha = 0.07;
  for (let y = 8; y < h - 6; y += 2) { c.beginPath(); c.moveTo(7, y); c.lineTo(w - 7, y); tratto(c, '#7a5a30', 0.5); }
  for (let x = 8; x < w - 6; x += 2) { c.beginPath(); c.moveTo(x, 7); c.lineTo(x, h - 7); tratto(c, '#7a5a30', 0.5); }
  c.globalAlpha = 1;
  // gli spazi delle caselle (si vedono solo quando una vignetta si sposta)
  for (let i = 0; i < 8; i++) {
    const x = PIAZZA.x0 - PIAZZA.cornice.x + (i % 4) * PIAZZA.passoX, y = PIAZZA.y0 - PIAZZA.cornice.y + Math.floor(i / 4) * PIAZZA.passoY;
    rrect(c, x, y, PIAZZA.cella.w, PIAZZA.cella.h, 4); c.fillStyle = 'rgba(120,80,40,0.16)'; c.fill();
    c.setLineDash([3, 2.5]); tratto(c, 'rgba(110,70,30,0.5)', 0.9); c.setLineDash([]);
    c.fillStyle = 'rgba(110,70,30,0.35)'; c.font = '600 14px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(i + 1), x + PIAZZA.cella.w / 2, y + PIAZZA.cella.h / 2);
  }
  // i chiodi d'ottone agli angoli
  for (const [x, y] of [[3, 3], [w - 3, 3], [3, h - 3], [w - 3, h - 3]]) { ellisse(c, x, y, 2, 2); c.fillStyle = '#e8c060'; c.fill(); tratto(c, CONT, 0.6); }
}

// il telo che copre due caselle (si toglie col vento)
function telo(c, w, h) {
  c.beginPath(); c.moveTo(2, 4); c.quadraticCurveTo(w / 2, 9, w - 2, 4); c.lineTo(w - 4, h - 7); c.quadraticCurveTo(w * 0.75, h - 3, w / 2, h - 7); c.quadraticCurveTo(w * 0.25, h - 3, 4, h - 7); c.closePath();
  c.fillStyle = gradL(c, 0, 0, w, 0, [[0, '#7a1420'], [0.15, '#b82a36'], [0.3, '#8a1a26'], [0.5, '#c43440'], [0.7, '#8a1a26'], [0.85, '#b82a36'], [1, '#6a0f1a']]); c.fill(); tratto(c, CONT, 1.5);
  // le pieghe
  for (const x of [0.2, 0.42, 0.6, 0.8]) { c.beginPath(); c.moveTo(w * x, 8); c.quadraticCurveTo(w * x + 3, h / 2, w * x - 1, h - 8); tratto(c, 'rgba(40,0,8,0.35)', 1.2); }
  // la frangia dorata e il cordone
  for (let x = 6; x < w - 4; x += 3.2) { c.beginPath(); const y = h - 6 + Math.sin(x / 10) * 1.6; c.moveTo(x, y); c.lineTo(x, y + 4); tratto(c, '#e8b84a', 1.1); }
  c.beginPath(); c.moveTo(2, 5); c.quadraticCurveTo(w / 2, 10, w - 2, 5); tratto(c, '#f0c85a', 2.2);
  for (const x of [5, w - 5]) { ellisse(c, x, 5, 3, 3); c.fillStyle = '#f0c85a'; c.fill(); tratto(c, CONT, 0.8); }
}

// il retro di una vignetta (girata dal vento): carta bianca, si tocca per rigirarla
function retro(c, w, h) {
  rrect(c, 1, 1, w - 2, h - 2, 4); c.fillStyle = '#fbf8f0'; c.fill();
  c.save(); rrect(c, 1, 1, w - 2, h - 2, 4); c.clip();
  for (let k = -h; k < w; k += 7) { c.beginPath(); c.moveTo(k, h); c.lineTo(k + h, 0); tratto(c, 'rgba(160,150,130,0.18)', 1); }
  c.restore();
  c.fillStyle = 'rgba(150,130,100,0.45)'; c.font = '600 34px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('?', w / 2, h / 2 + 2);
  rrect(c, 1, 1, w - 2, h - 2, 4); tratto(c, CONT, 2.2);
}

function cappello(c) {
  // il cappello rovesciato, per le monete: la tesa e la cupola vista da sopra
  ellisse(c, 18, 10, 17, 5.5); c.fillStyle = '#3a2e36'; c.fill(); tratto(c, CONT, 1.3);
  ellisse(c, 18, 9.5, 11, 3.8); c.fillStyle = '#17111a'; c.fill();
  c.beginPath(); c.moveTo(7, 10); c.quadraticCurveTo(8, 17, 18, 17.5); c.quadraticCurveTo(28, 17, 29, 10); tratto(c, CONT, 1.2);
  c.beginPath(); c.moveTo(7.5, 11); c.quadraticCurveTo(9, 16, 18, 16.5); c.quadraticCurveTo(27, 16, 28.5, 11); c.fillStyle = '#4a3a44'; c.fill();
  c.fillStyle = '#9a2a2a'; c.fillRect(8.5, 12, 19, 1.8);
}

function tavolino(c) {
  // tavolino tondo da bar, con la tovaglia a quadri, e due bicchieri
  ellisse(c, 34, 30, 16, 2.5); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
  c.fillStyle = '#2a2230'; c.fillRect(32.5, 12, 3, 18);
  ellisse(c, 34, 30, 8, 2); c.fillStyle = '#2a2230'; c.fill();
  c.beginPath(); c.moveTo(4, 8); c.lineTo(64, 8); c.lineTo(61, 17); c.quadraticCurveTo(34, 20, 7, 17); c.closePath();
  c.save(); c.clip();
  for (let x = 0; x < 68; x += 5) for (let y = 4; y < 22; y += 5) { c.fillStyle = (x / 5 + y / 5) % 2 < 1 ? '#d8342e' : '#f6f0e6'; c.fillRect(x, y, 5, 5); }
  c.restore();
  c.beginPath(); c.moveTo(4, 8); c.lineTo(64, 8); c.lineTo(61, 17); c.quadraticCurveTo(34, 20, 7, 17); c.closePath(); tratto(c, CONT, 1.2);
  ellisse(c, 34, 8, 30, 4.5); c.fillStyle = '#f6f0e6'; c.fill(); tratto(c, CONT, 1.2);
  for (const bx of [24, 44]) { rrect(c, bx - 2.5, -1, 5, 8, 1); c.fillStyle = 'rgba(255,200,80,0.85)'; c.fill(); tratto(c, CONT, 0.7); }
}

function pomodoro(c) {
  ellisse(c, 6, 7, 5, 4.6); c.fillStyle = gradR(c, 4.5, 5.5, 0.5, 6, [[0, '#ff7a5a'], [1, '#c8201a']]); c.fill(); tratto(c, CONT, 0.9);
  poli(c, [[6, 2], [3.5, 3.5], [5.5, 3.4], [6, 4.5], [6.5, 3.4], [8.5, 3.5]]); c.fillStyle = '#3a9a3a'; c.fill();
}
function schizzo(c) {
  const r = casuale(41);
  c.beginPath();
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, d = i % 2 ? 4 + r() * 2 : 7 + r() * 3; i ? c.lineTo(11 + Math.cos(a) * d * 1.2, 8 + Math.sin(a) * d * 0.8) : c.moveTo(11 + Math.cos(a) * d * 1.2, 8 + Math.sin(a) * d * 0.8); }
  c.closePath(); c.fillStyle = '#d8281e'; c.fill(); tratto(c, '#8a1010', 0.7);
  for (const [x, y] of [[2, 3], [20, 4], [19, 14], [3, 13]]) { ellisse(c, x, y, 1.2, 1.2); c.fillStyle = '#d8281e'; c.fill(); }
  ellisse(c, 9, 6, 2, 1.2); c.fillStyle = 'rgba(255,200,180,0.6)'; c.fill();
}

export function creaPiazzetta(scene) {
  tela(scene, 'bgPiazzetta', 480, 270, sfondo);
  tela(scene, 'cartellone', PIAZZA.cornice.w, PIAZZA.cornice.h, cartellone);
  const W = PIAZZA.cella.w, H = PIAZZA.cella.h;
  tela(scene, 'teloBallata', 2 * W + 12, H + 10, (c) => telo(c, 2 * W + 12, H + 10), 4);
  tela(scene, 'retroVignetta', W, H, (c) => retro(c, W, H), 4);
  tela(scene, 'cappelloMonete', 36, 20, cappello, 6);
  tela(scene, 'tavolinoPiazza', 68, 34, (c) => { c.translate(0, 4); tavolino(c); }, 5);
  tela(scene, 'pomodoroLancio', 12, 12, pomodoro, 8);
  tela(scene, 'schizzoPomodoro', 22, 16, schizzo, 6);
}

// ------------------------------------------------------------
//  LE VIGNETTE
//  v = { sfondo: [texture, parte da mostrare 0..1], chi: [[texture, x, y, grandezza]],
//        cosa: [[texture, x, y, grandezza, angolo]], sopra: (come cosa, ma davanti alle figure),
//        morale, tentacoli, maschera }
//  x e y vanno da -1 a 1 dentro la vignetta. Le figure (texture di personaggio, 96x144 unità)
//  stanno coi piedi in y: grandezza 1 = alta come 3/4 della vignetta. Gli oggetti: grandezza 1 =
//  il lato lungo è metà della larghezza della vignetta.
// ------------------------------------------------------------
const sorgente = (scene, key) => (scene.textures.exists(key) ? { img: scene.textures.get(key).getSourceImage(), d: DENS[key] ?? 1 } : null);

function figuraIn(c, scene, [key, x, y, g], W, H) {
  const s = sorgente(scene, key);
  if (!s) return null;
  const alto = g * H * 0.78, k = alto / 144, X = ((x + 1) / 2) * W, Y = ((y + 1) / 2) * H + 2;
  c.drawImage(s.img, X - 48 * k, Y - 144 * k, 96 * k, 144 * k);
  return { X, Y, k };
}

function oggettoIn(c, scene, [key, x, y, g, ang = 0], W, H) {
  const s = sorgente(scene, key);
  if (!s) return;
  const w = s.img.width / s.d, h = s.img.height / s.d, k = (g * W * 0.5) / Math.max(w, h);
  c.save(); c.translate(((x + 1) / 2) * W, ((y + 1) / 2) * H); c.rotate(ang);
  c.drawImage(s.img, (-w * k) / 2, (-h * k) / 2, w * k, h * k);
  c.restore();
}

function tentacoliIn(c, f, W) {
  // quattro tentacoli viola che escono dalla schiena del Piovra e si allungano sulla pista
  if (!f) return;
  const ox = f.X, oy = f.Y - 72 * f.k;
  for (const [dx, dy, piega] of [[-0.46, -0.1, -10], [0.46, -0.16, 10], [-0.4, 0.28, 8], [0.42, 0.3, -8]]) {
    const x1 = ox + dx * W, y1 = oy + dy * W;
    const cx = (ox + x1) / 2 + piega, cy = (oy + y1) / 2 - 8;
    for (const [col, lw] of [[CONT, 6.5], ['#9a4fd0', 4.6], ['#c993f2', 1.4]]) { c.beginPath(); c.moveTo(ox, oy); c.quadraticCurveTo(cx, cy, x1, y1); tratto(c, col, lw); }
    ellisse(c, x1, y1, 2.4, 2.4); c.fillStyle = '#9a4fd0'; c.fill(); tratto(c, CONT, 0.8);
    for (const t of [0.35, 0.6]) {
      const u = 1 - t, px = u * u * ox + 2 * u * t * cx + t * t * x1, py = u * u * oy + 2 * u * t * cy + t * t * y1 + 1.5;
      ellisse(c, px, py, 1.1, 1.1); c.fillStyle = '#f8c6ec'; c.fill();
    }
  }
}

function mascheraIn(c, scene, f) {
  // la maschera di cartone con la faccia di Giorgio, sulla faccia di chi si è imbucato
  const s = sorgente(scene, 'giorgio_normale'), b = sorgente(scene, 'bordoMaschera');
  if (!s || !f) return;
  const cx = f.X + 2 * f.k, cy = f.Y - 92 * f.k, lato = 62 * f.k;
  if (b) c.drawImage(b.img, cx - lato * 0.52, cy - lato * 0.5, lato * 1.04, lato * 1.12);
  c.drawImage(s.img, 5 * s.d, 3 * s.d, 86 * s.d, 96 * s.d, cx - lato * 0.45, cy - lato * 0.5, lato * 0.9, lato);
  c.beginPath(); c.moveTo(cx - lato * 0.5, cy); c.lineTo(cx - lato * 0.62, cy - 2); c.moveTo(cx + lato * 0.5, cy); c.lineTo(cx + lato * 0.62, cy - 2); tratto(c, '#1a1a1a', 0.8);
}

function morale(c, W, H) {
  // la pergamena della morale, con la stella
  c.fillStyle = gradL(c, 0, 0, 0, H, [[0, '#fff6dc'], [1, '#f0d89a']]); c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'lighter'; alone(c, W / 2, H * 0.55, W * 0.6, '#ffe08a', 0.45); c.restore();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; c.beginPath(); c.moveTo(W / 2, H * 0.6); c.lineTo(W / 2 + Math.cos(a) * W, H * 0.6 + Math.sin(a) * W); tratto(c, 'rgba(240,190,80,0.18)', 4); }
  // il nastro con la scritta
  poli(c, [[2, 5], [W - 2, 5], [W - 7, 11], [W - 2, 17], [2, 17], [7, 11]]); c.fillStyle = '#c0392b'; c.fill(); tratto(c, CONT, 1);
  c.fillStyle = '#fff2c8'; c.font = '600 8.5px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('MORALE', W / 2, 11.5);
}

export function vignetta(scene, key, v, W = PIAZZA.cella.w, H = PIAZZA.cella.h) {
  tela(scene, key, W, H, (c) => {
    c.save();
    rrect(c, 1, 1, W - 2, H - 2, 4); c.clip();
    if (v.morale) morale(c, W, H);
    else {
      const s = sorgente(scene, v.sfondo?.[0]);
      if (s) {
        // un ritaglio dello sfondo del microgioco (la parte bassa, dove stanno i personaggi)
        const ch = 180, cw = (ch * W) / H, cx = (v.sfondo[1] ?? 0.5) * (480 - cw), cy = 270 - ch - 12;
        c.drawImage(s.img, cx * s.d, cy * s.d, cw * s.d, ch * s.d, 0, 0, W, H);
        c.fillStyle = 'rgba(255,250,235,0.16)'; c.fillRect(0, 0, W, H);       // colori più chiari, da cartellone
      } else { c.fillStyle = '#e8dcc0'; c.fillRect(0, 0, W, H); }
    }
    // prima gli oggetti dietro (le macchine e i tavoli, che stanno in basso), poi le figure, poi gli altri
    const cose = v.cosa ?? [], dietro = cose.filter((o) => o[2] >= 0.3), davanti = cose.filter((o) => o[2] < 0.3);
    for (const o of dietro) oggettoIn(c, scene, o, W, H);
    const figure = (v.chi ?? []).map((f) => figuraIn(c, scene, f, W, H));
    if (v.tentacoli) tentacoliIn(c, figure[0], W);
    if (v.maschera) mascheraIn(c, scene, figure[0]);
    for (const o of [...davanti, ...(v.sopra ?? [])]) oggettoIn(c, scene, o, W, H);
    c.restore();
    // il bordo spesso
    rrect(c, 1, 1, W - 2, H - 2, 4); tratto(c, CONT, 2.4);
    rrect(c, 2.6, 2.6, W - 5.2, H - 5.2, 3); tratto(c, 'rgba(255,255,255,0.75)', 0.9);
  }, 4);
}
