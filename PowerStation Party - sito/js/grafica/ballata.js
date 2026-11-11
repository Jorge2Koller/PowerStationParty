// "La ballata del Pallaio": la serata karaoke al bar del Pallaio (lo stesso locale del Panino, vedi
// sfondoPallaioBar in sfondi.js, ma di sera: il tetto di lamiera coi neon, la vetrata sul buio con la
// siepe, il pilastro bianco). A sinistra il palchetto di legno col sipario rosso, l'insegna KARAOKE e
// l'amplificatore; in alto lo schermo del karaoke (le parole le scrive la scena); da una parte
// all'altra il filo con le mollette dove scorrono le vignette, fino al faro accanto a Lori. Davanti, il
// pubblico al tavolone ('tavolaPallaio'). E le vignette: piccole scene disegnate coi personaggi e gli
// oggetti che esistono già nel gioco (vedi vignetta()).
import { tela, CONT, DENS, casuale, riemp, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alfa, alone } from './base.js';
import { FONT } from '../fx.js';

// dove sta tutto (lo usa BallataScene)
export const BALLATA = {
  filo: 80,                                // l'altezza del filo delle mollette
  faro: 178,                               // la x del faro: lì si toccano le vignette
  carta: { w: 56, h: 52 },                 // una vignetta appesa
  lori: { x: 86, y: 196 },                 // i piedi di Lori, sul palco
  schermo: { x: 134, y: 15, w: 266, h: 48 },
  palco: 186,                              // il piano del palco
  pubblico: [150, 206, 262, 318, 374, 430], piediPubblico: 264, tavola: 236,
};

const NOTTE = ['#0b1230', '#1b2550'];

// ------------------------------------------------------------
//  LO SFONDO
// ------------------------------------------------------------
function sfondo(c) {
  const r = casuale(4242), B = BALLATA;
  // il tetto di lamiera, di sera: grigio azzurro, coi neon accesi
  c.fillStyle = gradL(c, 0, 0, 0, 46, [[0, '#3c4152'], [1, '#596072']]); c.fillRect(0, 0, 480, 46);
  for (let x = -200; x < 700; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(240 + (x - 240) * 0.55, 46); tratto(c, 'rgba(20,24,36,0.35)', 0.8); }
  for (const [x, y, w] of [[20, 8, 46], [426, 9, 44]]) {
    c.save(); c.globalCompositeOperation = 'lighter'; alone(c, x + w / 2, y + 3, w * 0.8, '#cfe8ff', 0.3); c.restore();
    rrect(c, x, y, w, 4, 2); c.fillStyle = '#f4fbff'; c.fill(); tratto(c, '#8a90a0', 0.6);
  }
  c.fillStyle = '#c9cbd0'; c.fillRect(0, 44, 480, 4); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 47, 480, 1);

  // la vetrata sul buio: il cielo blu notte, la siepe nera, i telai di legno (come di giorno)
  c.fillStyle = gradL(c, 0, 48, 0, 150, [[0, NOTTE[0]], [1, NOTTE[1]]]); c.fillRect(150, 48, 330, 104);
  for (let i = 0; i < 26; i++) { ellisse(c, 150 + r() * 330, 52 + r() * 40, 0.5, 0.5); c.fillStyle = alfa('#ffffff', 0.35 + r() * 0.5); c.fill(); }
  for (let i = 0; i < 380; i++) {
    const x = 150 + r() * 330, y = 98 + r() * 54;
    ellisse(c, x, y, 3 + r() * 4, 2.5 + r() * 3); c.fillStyle = ['#0f2418', '#163020', '#0b1c12', '#1c3a26'][Math.floor(r() * 4)]; c.fill();
  }
  // i riflessi caldi del locale sul vetro
  c.save(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = 'rgba(255,170,90,0.07)'; c.fillRect(150, 48, 330, 104);
  for (const x of [196, 286, 376]) { poli(c, [[x, 50], [x + 10, 50], [x - 14, 150], [x - 24, 150]]); c.fillStyle = 'rgba(255,255,255,0.05)'; c.fill(); }
  c.restore();
  c.fillStyle = '#9a5a22';
  for (let x = 150; x <= 480; x += 30) c.fillRect(x, 48, 3, 104);
  c.fillRect(150, 48, 330, 3); c.fillRect(150, 92, 330, 2);
  c.fillStyle = '#6a3a14'; c.fillRect(150, 150, 330, 4);
  c.fillStyle = gradL(c, 0, 154, 0, 176, [[0, '#5a3016'], [1, '#3e200c']]); c.fillRect(150, 154, 330, 24);
  // il pilastro bianco (in penombra), con l'insegna PALLAIO al neon
  c.fillStyle = '#d8d6d0'; c.fillRect(440, 48, 14, 132); c.fillStyle = '#aeaca6'; c.fillRect(451, 48, 3, 132);
  rrect(c, 442, 96, 10, 48, 2); c.fillStyle = '#2a1a22'; c.fill(); tratto(c, '#120a10', 1);
  c.save(); c.globalCompositeOperation = 'lighter'; alone(c, 447, 120, 24, '#ff5ab4', 0.4); c.restore();
  c.fillStyle = '#ffd0ec'; c.font = `600 6px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  'PALLAIO'.split('').forEach((l, i) => c.fillText(l, 447, 102 + i * 6.2));

  // il sipario rosso dietro al palco, con la mantovana e la frangia d'oro
  c.fillStyle = gradL(c, 0, 0, 152, 0, [[0, '#5a0c18'], [0.5, '#8a1424'], [1, '#4a0812']]); c.fillRect(0, 48, 152, 140);
  for (let x = 4; x < 152; x += 13) {
    c.fillStyle = gradL(c, x, 0, x + 13, 0, [[0, 'rgba(20,0,6,0.4)'], [0.4, 'rgba(255,110,120,0.16)'], [1, 'rgba(20,0,6,0.45)']]);
    c.fillRect(x, 60, 13, 128);
  }
  c.beginPath(); c.moveTo(0, 48); c.lineTo(156, 48); c.lineTo(156, 58);
  for (let x = 156; x >= 0; x -= 19.5) c.quadraticCurveTo(x - 9.75, 70, x - 19.5, 58);
  c.closePath(); c.fillStyle = gradL(c, 0, 48, 0, 68, [[0, '#a81c30'], [1, '#6a0c1a']]); c.fill(); tratto(c, CONT, 1.2);
  for (let x = 2; x < 156; x += 3) { const y = 59 + Math.abs(Math.sin(((x % 19.5) / 19.5) * Math.PI)) * 10; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 3.5); tratto(c, '#e8b84a', 1); }
  // l'insegna SERATA KARAOKE al neon, sul sipario (rosa, con l'alone)
  c.save(); c.globalCompositeOperation = 'lighter'; alone(c, 40, 80, 50, '#ff4aa8', 0.22); c.restore();
  c.font = `600 6.5px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#ffd8f0'; c.fillText('SERATA', 40, 70);
  c.font = `700 13px ${FONT}`; c.lineWidth = 3; c.strokeStyle = 'rgba(255,60,170,0.55)'; c.strokeText('KARAOKE', 40, 81);
  c.fillStyle = '#fff0fa'; c.fillText('KARAOKE', 40, 81);

  // il pavimento a mattonelle, nella penombra calda
  c.fillStyle = gradL(c, 0, 176, 0, 270, [[0, '#6e604c'], [1, '#93826a']]); c.fillRect(0, 176, 480, 94);
  for (let i = 0; i < 7; i++) { const y = 176 + Math.pow(i / 6, 1.6) * 94; c.fillStyle = 'rgba(40,30,20,0.35)'; c.fillRect(0, y, 480, 0.8); }
  for (let x = -600; x < 1100; x += 34) { c.beginPath(); c.moveTo(240 + (x - 240) * 0.35, 176); c.lineTo(x, 270); tratto(c, 'rgba(40,30,20,0.28)', 0.7); }
  // due tavolini e le sedie in fondo, nella penombra
  for (const [x, y] of [[300, 186], [392, 190]]) {
    c.fillStyle = '#2a2a30'; c.fillRect(x - 12, y, 1.6, 12); c.fillRect(x + 10, y, 1.6, 12);
    rrect(c, x - 15, y - 3, 30, 4, 1); c.fillStyle = '#2a2a30'; c.fill(); c.fillStyle = '#2a6a3e'; c.fillRect(x - 13, y - 3, 26, 2.2);
    for (const s of [-1, 1]) { rrect(c, x + s * 22 - 6, y - 8, 12, 10, 3); c.fillStyle = '#d8d8d2'; c.fill(); c.fillStyle = '#d8d8d2'; c.fillRect(x + s * 22 - 6, y + 1, 12, 3); }
  }

  // il palco: il piano di assi e il bordo con le lucine, dal sipario fino a metà sala
  const P = B.palco;
  poli(c, [[0, P - 8], [262, P - 8], [272, P + 4], [0, P + 4]]); c.fillStyle = gradL(c, 0, P - 8, 0, P + 4, [[0, '#b77a3e'], [1, '#d6995a']]); c.fill();
  for (let x = 0; x < 268; x += 22) { c.beginPath(); c.moveTo(x, P - 8); c.lineTo(x + 3, P + 4); tratto(c, 'rgba(70,35,10,0.35)', 0.7); }
  c.fillStyle = gradL(c, 0, P + 4, 0, P + 22, [[0, '#5a3014'], [1, '#3a1c08']]); c.fillRect(0, P + 4, 272, 18);
  c.fillStyle = '#7a4a22'; c.fillRect(0, P + 3, 272, 2.5);
  for (let x = 10; x < 268; x += 18) {
    c.save(); c.globalCompositeOperation = 'lighter'; alone(c, x, P + 11, 7, '#ffcf6a', 0.4); c.restore();
    ellisse(c, x, P + 11, 2, 2); c.fillStyle = '#ffe9a8'; c.fill(); tratto(c, '#5a3014', 0.6);
  }
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, P + 22, 276, 3);
  // l'amplificatore e la custodia aperta della chitarra, sul palco
  rrect(c, 8, P - 46, 40, 42, 3); c.fillStyle = '#1e1c22'; c.fill(); tratto(c, CONT, 1.4);
  rrect(c, 12, P - 34, 32, 27, 2); c.fillStyle = '#3a3640'; c.fill();
  for (let y = P - 32; y < P - 8; y += 3) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(13, y, 30, 1); }
  for (const x of [16, 22, 28, 34]) { ellisse(c, x, P - 40, 1.6, 1.6); c.fillStyle = '#d8c070'; c.fill(); }
  rrect(c, 36, P - 42.5, 8, 3.5, 1); c.fillStyle = '#e8e2d0'; c.fill();
  // la custodia: aperta, col velluto rosso, qualche moneta
  poli(c, [[136, P - 2], [180, P - 6], [186, P + 1], [140, P + 4]]); c.fillStyle = '#1a1416'; c.fill(); tratto(c, CONT, 1);
  poli(c, [[140, P - 1], [178, P - 4.5], [182, P], [142, P + 2.5]]); c.fillStyle = '#9a1a2a'; c.fill();
  for (const [x, y] of [[150, P - 1], [158, P], [168, P - 2.5]]) { ellisse(c, x, y, 2.2, 1.1); c.fillStyle = '#ffd34a'; c.fill(); }

  // lo schermo del karaoke, appeso al tetto: la cornice nera e il vetro blu (le parole le scrive la scena)
  const S = B.schermo;
  c.fillStyle = '#1a1a20'; c.fillRect(S.x + 30, 0, 3, S.y + 2); c.fillRect(S.x + S.w - 33, 0, 3, S.y + 2);
  c.save(); c.globalCompositeOperation = 'lighter'; alone(c, S.x + S.w / 2, S.y + S.h / 2, S.w * 0.6, '#4a7aff', 0.16); c.restore();
  rrect(c, S.x - 4, S.y - 4, S.w + 8, S.h + 8, 5); c.fillStyle = '#121218'; c.fill(); tratto(c, CONT, 1.5);
  rrect(c, S.x, S.y, S.w, S.h, 2); c.fillStyle = gradL(c, 0, S.y, 0, S.y + S.h, [[0, '#0c1640'], [1, '#1a2a6a']]); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.05)'; poli(c, [[S.x, S.y], [S.x + 90, S.y], [S.x + 50, S.y + S.h], [S.x, S.y + S.h]]); c.fill();
  c.fillStyle = '#ff7ac8'; c.font = `600 5px ${FONT}`; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText('KARAOKE  ♪', S.x + S.w - 2, S.y + S.h + 2);

  // il filo delle vignette: dal palo vicino al faro fino al muro a destra, con le lampadine sopra
  const F = B.filo;
  c.fillStyle = '#1a1a20'; c.fillRect(B.faro - 50, 48, 3, F - 46);
  ellisse(c, B.faro - 48.5, F, 3, 3); c.fillStyle = '#1a1a20'; c.fill();
  c.beginPath(); c.moveTo(B.faro - 48, F); c.lineTo(484, F); tratto(c, '#120c14', 1.4);
  for (let x = B.faro - 30; x < 480; x += 24) {
    const col = ['#ffd84a', '#ff6a5a', '#7ae08a', '#6ab8ff', '#ff9ad8'][Math.floor(r() * 5)];
    c.save(); c.globalCompositeOperation = 'lighter'; alone(c, x, F - 4, 9, col, 0.35); c.restore();
    ellisse(c, x, F - 4, 2, 2.6); c.fillStyle = col; c.fill(); tratto(c, scuro(col, 0.4), 0.5);
    c.fillStyle = '#17111c'; c.fillRect(x - 0.8, F - 1.5, 1.6, 1.5);
  }
  // i due fari appesi al tetto: uno su Lori, uno sul posto delle vignette
  for (const [x, ang] of [[B.lori.x - 6, 0.25], [B.faro, 0]]) {
    c.save(); c.translate(x, 50); c.rotate(ang);
    c.fillStyle = '#121216'; c.fillRect(-1, -6, 2, 6);
    rrect(c, -6, 0, 12, 10, 2); c.fillStyle = '#26262e'; c.fill(); tratto(c, CONT, 1);
    ellisse(c, 0, 10, 5, 2); c.fillStyle = '#fff6d0'; c.fill();
    c.restore();
  }
  // la vignettatura: il buio in sala, la luce sul palco
  c.fillStyle = gradR(c, 170, 130, 120, 330, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(8,4,20,0.5)']]); c.fillRect(0, 0, 480, 270);
}

// la molletta di legno che tiene una vignetta al filo
function molletta(c) {
  rrect(c, 1, 0, 6, 14, 1.5); c.fillStyle = gradL(c, 1, 0, 7, 0, [[0, '#e8c48a'], [1, '#b8884a']]); c.fill(); tratto(c, CONT, 0.9);
  c.beginPath(); c.moveTo(4, 1); c.lineTo(4, 13); tratto(c, 'rgba(90,50,20,0.6)', 0.6);
  rrect(c, 0.5, 5, 7, 3, 1); c.fillStyle = '#c0c4cc'; c.fill(); tratto(c, CONT, 0.6);
}

// il battimani del ritornello: un tondo rosa con due mani che si battono
function battimani(c) {
  const W = 40;
  ellisse(c, W / 2, W / 2 + 1.5, 18, 18); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fill();
  ellisse(c, W / 2, W / 2, 18, 18); c.fillStyle = gradR(c, 16, 14, 2, 22, [[0, '#ffb8e0'], [1, '#e83a8e']]); c.fill(); tratto(c, '#ffffff', 2.2);
  ellisse(c, W / 2, W / 2, 18, 18); tratto(c, CONT, 0.8);
  for (const s of [-1, 1]) {
    c.save(); c.translate(W / 2 + s * 4.5, W / 2 + 2); c.rotate(s * 0.35);
    rrect(c, -5, -9, 10, 15, 4.5); c.fillStyle = '#f2c49a'; c.fill(); tratto(c, CONT, 1.3);
    for (const x of [-2.5, 0, 2.5]) { c.beginPath(); c.moveTo(x, -9); c.lineTo(x, -4); tratto(c, 'rgba(120,60,30,0.45)', 0.6); }
    c.restore();
  }
  for (const [x1, y1, x2, y2] of [[8, 9, 12, 12], [32, 9, 28, 12], [20, 4, 20, 8]]) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); tratto(c, '#ffffff', 1.6); }
}

// un accendino acceso, tenuto in alto (il pubblico, con la serie)
function accendino(c) {
  c.fillStyle = '#d83a3a'; rrect(c, 2.6, 9, 3.8, 9, 1.6); c.fill();
  rrect(c, 3.3, 6.4, 2.4, 3.6, 0.6); riemp(c, '#c9cdd6');
  alone(c, 4.5, 3.4, 5, '#ffd24a', 0.75);
  c.beginPath(); c.moveTo(4.5, 0.6); c.quadraticCurveTo(7.2, 4, 4.5, 6.4); c.quadraticCurveTo(1.8, 4, 4.5, 0.6); c.closePath();
  riemp(c, gradL(c, 0, 0, 0, 6.4, [[0, '#fff8c0'], [1, '#ff9a2e']]));
}

// il cono di luce di un faro (bianco: la scena lo tinge e lo somma alla luce)
function cono(c) {
  c.beginPath(); c.moveTo(16, 0); c.lineTo(24, 0); c.lineTo(40, 120); c.lineTo(0, 120); c.closePath();
  riemp(c, gradL(c, 0, 0, 0, 120, [[0, 'rgba(255,255,255,0.7)'], [0.75, 'rgba(255,255,255,0.22)'], [1, 'rgba(255,255,255,0)']]));
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

export function creaBallata(scene) {
  tela(scene, 'bgBallata', 480, 270, sfondo);
  tela(scene, 'molletta', 8, 14, molletta, 6);
  tela(scene, 'battimani', 40, 41, battimani, 5);
  tela(scene, 'accendinoBallata', 9, 18, accendino, 8);
  tela(scene, 'conoFaro', 40, 120, cono, 2);
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

// le texture che servono a una vignetta (per creare prima i loro gruppi: vedi gruppoPigro)
export const texDellaVignetta = (v) => [v.sfondo?.[0], ...[...(v.chi ?? []), ...(v.cosa ?? []), ...(v.sopra ?? [])].map((o) => o[0]),
  ...(v.maschera ? ['giorgio_normale', 'bordoMaschera'] : [])].filter(Boolean);

export function vignetta(scene, key, v, W = BALLATA.carta.w, H = BALLATA.carta.h) {
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
