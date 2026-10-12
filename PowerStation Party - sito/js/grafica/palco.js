// "L'Incubo degli Scapoli": la pista del Manna vista di FRONTE, per la sfida di ballo.
// In fondo la parete coi pannelli a LED e la consolle (dietro c'è lo Zio DJ, che la scena mette
// in piedi tra la parete e la consolle); davanti il pavimento a mattonelle in prospettiva.
// Le frecce della sfida: frecciaBallo (piena, quella che sale), bersaglioBallo (il contorno
// fisso in alto), frecciaOro (quella che vale doppio).
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, gradR, casuale, alone } from './base.js';

export const PALCO = { pavimento: 118, consolle: 112 };

function sfondoPalco(c) {
  const r = casuale(41), P = PALCO.pavimento;
  // parete in fondo, viola scuro, con una griglia di pannelli a LED
  c.fillStyle = gradL(c, 0, 0, 0, P, [[0, '#0c0618'], [1, '#22123f']]); c.fillRect(0, 0, 480, P);
  const COL = ['#ff3b9a', '#3bd0ff', '#ffe14a', '#7dff9a', '#b06aff'];
  for (let y = 10; y < P - 14; y += 11) for (let x = 6; x < 480; x += 11) {
    const acceso = r() < 0.32;
    rrect(c, x, y, 8, 8, 1.5);
    c.fillStyle = acceso ? COL[Math.floor(r() * COL.length)] : '#1a0f30';
    c.globalAlpha = acceso ? 0.55 : 1; c.fill(); c.globalAlpha = 1;
  }
  // due casse ai lati della consolle
  for (const x of [150, 312]) {
    rrect(c, x, 58, 18, 54, 2); c.fillStyle = '#121019'; c.fill(); tratto(c, CONT, 1);
    for (const [y, rr] of [[72, 6], [97, 7.5]]) { ellisse(c, x + 9, y, rr, rr); c.fillStyle = '#26222f'; c.fill(); tratto(c, '#4a4658', 0.8); ellisse(c, x + 9, y, rr * 0.35, rr * 0.35); c.fillStyle = '#0a090e'; c.fill(); }
  }
  // fasci di luce che scendono dall'alto
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const [x, col] of [[80, '#ff3b9a'], [240, '#3bd0ff'], [400, '#b06aff']]) {
    poli(c, [[x - 6, 0], [x + 6, 0], [x + 60, 270], [x - 60, 270]]);
    c.fillStyle = gradL(c, 0, 0, 0, 270, [[0, col + '55'], [1, col + '00']]); c.fill();
  }
  c.restore();
  // pavimento a mattonelle in prospettiva (le righe si stringono verso il fondo)
  c.fillStyle = '#140a28'; c.fillRect(0, P, 480, 270 - P);
  const righe = 7;
  for (let i = 0; i < righe; i++) {
    const y0 = P + (270 - P) * (i / righe) ** 1.6, y1 = P + (270 - P) * ((i + 1) / righe) ** 1.6;
    const k0 = 0.55 + 0.45 * (i / righe), k1 = 0.55 + 0.45 * ((i + 1) / righe);
    for (let j = -6; j < 6; j++) {
      const a0 = 240 + j * 44 * k0, b0 = 240 + (j + 1) * 44 * k0, a1 = 240 + j * 44 * k1, b1 = 240 + (j + 1) * 44 * k1;
      poli(c, [[a0, y0], [b0, y0], [b1, y1], [a1, y1]]);
      c.fillStyle = (i + j) % 2 ? '#2a1650' : '#1d1038'; c.fill(); tratto(c, 'rgba(176,106,255,0.35)', 0.6);
    }
  }
  c.fillStyle = '#ff3b9a'; c.fillRect(0, P - 1.5, 480, 1.5);
  // vignettatura sui bordi
  c.fillStyle = gradR(c, 240, 150, 120, 320, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]); c.fillRect(0, 0, 480, 270);
}

// la consolle davanti allo Zio DJ (sta sopra di lui: si vede dalla vita in su)
function consolle(c) {
  rrect(c, 2, 4, 136, 26, 4); c.fillStyle = gradL(c, 0, 4, 0, 30, [[0, '#3a2a66'], [1, '#1d1236']]); c.fill(); tratto(c, CONT, 1.3);
  c.fillStyle = '#ff3b9a'; c.fillRect(4, 27, 132, 1.6);
  for (const x of [34, 106]) { ellisse(c, x, 9, 15, 4.5); c.fillStyle = '#121018'; c.fill(); tratto(c, '#5a5670', 0.8); ellisse(c, x, 9, 4, 1.4); c.fillStyle = '#ff3b9a'; c.fill(); }
  for (let i = 0; i < 6; i++) { c.fillStyle = ['#7dff9a', '#ffe14a', '#ff6b5a', '#3bd0ff', '#b06aff', '#7dff9a'][i]; c.fillRect(56 + i * 5, 22 - (i % 3) * 3, 3, 3 + (i % 3) * 3); }
  // (la scritta "ZIO DJ" la mette la scena con txt(), così usa il font del gioco anche se arriva tardi)
}

// freccia che punta in su (la scena la ruota per le altre direzioni)
function freccia(c, col, bordo, piena) {
  const f = () => { poli(c, [[11, 1.5], [20.5, 11], [15, 11], [15, 20.5], [7, 20.5], [7, 11], [1.5, 11]]); };
  if (piena) {
    f(); c.fillStyle = gradL(c, 0, 1, 0, 21, [[0, col], [1, bordo]]); c.fill();
    c.save(); f(); c.clip(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, 0, 22, 7); c.restore();
    f(); tratto(c, CONT, 1.6);
  } else {
    f(); c.fillStyle = 'rgba(20,10,40,0.55)'; c.fill(); tratto(c, bordo, 1.8);
  }
}

export function creaPalco(scene) {
  tela(scene, 'bgPalco', 480, 270, sfondoPalco);
  tela(scene, 'consollePalco', 140, 32, consolle, 6);
  tela(scene, 'frecciaBallo', 22, 22, (c) => freccia(c, '#9af0ff', '#2f8fd8', true), 8);
  tela(scene, 'frecciaOro', 22, 22, (c) => { alone(c, 11, 11, 11, '#ffe14a', 0.6); freccia(c, '#fff3a0', '#e0a020', true); }, 8);
  tela(scene, 'bersaglioBallo', 22, 22, (c) => freccia(c, '#ffffff', '#ffffff', false), 8);
}
