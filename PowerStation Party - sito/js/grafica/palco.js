// "L'Incubo degli Scapoli": la pista del Manna vista di FRONTE, per la sfida di ballo.
// In fondo la parete coi pannelli a LED e la consolle (dietro c'è lo Zio DJ, che la scena mette
// in piedi tra la parete e la consolle); davanti il pavimento a mattonelle in prospettiva.
// Le schede delle mosse (i pittogrammi alla Just Dance: scheda_<mossa> e schedaOro_<mossa>) e il
// riquadro dove arrivano (zonaBallo); le frecce di prima (frecciaBallo, bersaglioBallo, frecciaOro)
// restano per le vignette della ballata.
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

// ------------------------------------------------------------
//  I PITTOGRAMMI DELLE MOSSE (come le schede di Just Dance)
//  Ogni mossa ha la sua scheda: la sagoma che fa la mossa, bianca e al neon del colore della
//  mossa, su una scheda scura; in fondo la fascia col comando (la freccia da premere o da
//  strisciare, oppure le mani che battono). Le schede scorrono nella striscia in basso verso il
//  riquadro (zonaBallo): quando una ci arriva, si fa la mossa. schedaOro_<mossa> = la mossa d'oro.
// ------------------------------------------------------------
export const MOSSE_BALLO = ['su', 'giu', 'sx', 'dx', 'batti'];
export const COLORI_MOSSE = { su: '#3bd0ff', giu: '#ff5fa2', sx: '#ffb02e', dx: '#7dff9a', batti: '#c58bff' };
export const SCHEDA = { w: 32, h: 42 };

// la sagoma di ogni mossa, sulla scheda (32x42; la sagoma sta nei 31 di sopra): la testa e le
// linee di busto, braccia e gambe (spalla, gomito, mano / anca, ginocchio, piede)
const SAGOME = {
  // braccia al cielo
  su: { testa: [16, 9.5], busto: [[16, 14], [16, 22]], braccia: [[[13.5, 14.5], [10, 9.5], [7.5, 4]], [[18.5, 14.5], [22, 9.5], [24.5, 4]]],
    gambe: [[[15, 22], [13.5, 26], [12.5, 30]], [[17, 22], [18.5, 26], [19.5, 30]]], segni: [[[6, 2.5], [4.5, 0.8]], [[26, 2.5], [27.5, 0.8]]] },
  // giù: accovacciato, le mani sulle ginocchia
  giu: { testa: [16, 13], busto: [[16, 17.5], [16, 23.5]], braccia: [[[13.5, 18], [10, 21], [11.5, 25]], [[18.5, 18], [22, 21], [20.5, 25]]],
    gambe: [[[15, 23.5], [10.5, 25.5], [11, 30]], [[17, 23.5], [21.5, 25.5], [21, 30]]], segni: [[[5, 21], [5, 26]], [[27, 21], [27, 26]]] },
  // a sinistra: il braccio teso verso l'alto a sinistra, l'altro che punta di traverso, la gamba di lato
  sx: { testa: [14, 9.5], busto: [[15, 14], [17, 22]], braccia: [[[13, 14.5], [8.5, 12], [3.5, 8.5]], [[17.5, 14.5], [18, 18.5], [12.5, 17.5]]],
    gambe: [[[16, 22], [11.5, 25.5], [7, 28.5]], [[18, 22], [19, 26], [19.5, 30]]], segni: [[[3, 13], [1, 15]], [[5, 16], [3, 18.5]]] },
  // battimani: le mani che si toccano davanti, coi raggi del colpo
  batti: { testa: [16, 9.5], busto: [[16, 14], [16, 22]], braccia: [[[13.5, 14.5], [8, 19], [15.2, 17.6]], [[18.5, 14.5], [24, 19], [16.8, 17.6]]],
    gambe: [[[15, 22], [14, 26], [13, 30]], [[17, 22], [18, 26], [19, 30]]], segni: [[[12.2, 15.2], [10.4, 13.6]], [[19.8, 15.2], [21.6, 13.6]], [[12.4, 18.6], [10.2, 18.4]], [[19.6, 18.6], [21.8, 18.4]]] },
};
// (a destra è la stessa di sinistra, allo specchio)
const specchia = (v) => (typeof v[0] === 'number' ? [32 - v[0], v[1]] : v.map(specchia));
SAGOME.dx = Object.fromEntries(Object.entries(SAGOME.sx).map(([k, v]) => [k, specchia(v)]));

// una linea spezzata, tre volte: il bagliore largo e trasparente, poi più stretto, poi il cuore chiaro
function neon(c, punti, col, nucleo, w) {
  const via = () => { c.beginPath(); punti.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); };
  via(); tratto(c, col + '40', w + 4);
  via(); tratto(c, col + '99', w + 1.8);
  via(); tratto(c, nucleo, w);
}

function sagoma(c, mossa, col, nucleo) {
  const s = SAGOME[mossa];
  for (const seg of s.segni) neon(c, seg, col, nucleo, 0.9);        // i segni del movimento
  for (const g of s.gambe) neon(c, g, col, nucleo, 2.8);
  neon(c, s.busto, col, nucleo, 4.2);
  for (const b of s.braccia) neon(c, b, col, nucleo, 2.6);
  const [hx, hy] = s.testa;
  alone(c, hx, hy, 6.5, col, 0.55);
  ellisse(c, hx, hy, 3.5, 3.5); c.fillStyle = nucleo; c.fill();
}

// il comando, nella fascia in fondo: una freccia (verso la mossa) o le due mani che battono
function comando(c, mossa, col) {
  const x = 16, y = 36.6;
  c.save(); c.translate(x, y);
  if (mossa === 'batti') {
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * 2.2, 0.4); c.rotate(s * 0.45);
      rrect(c, -1.5, -2.6, 3, 5.2, 1.4); c.fillStyle = col; c.fill();
      c.restore();
      c.beginPath(); c.moveTo(s * 5.2, -2.2); c.lineTo(s * 6.8, -3.2); c.moveTo(s * 5.4, 0.4); c.lineTo(s * 7.2, 0.4); tratto(c, col, 0.9);
    }
  } else {
    c.rotate({ su: 0, dx: Math.PI / 2, giu: Math.PI, sx: -Math.PI / 2 }[mossa]);
    poli(c, [[0, -3.4], [3.6, 0.2], [1.3, 0.2], [1.3, 3.2], [-1.3, 3.2], [-1.3, 0.2], [-3.6, 0.2]]); c.fillStyle = col; c.fill();
  }
  c.restore();
}

function scheda(c, mossa, oro) {
  const col = oro ? '#ffe14a' : COLORI_MOSSE[mossa], { w, h } = SCHEDA;
  if (oro) alone(c, w / 2, h / 2, 21, '#ffe14a', 0.55);
  rrect(c, 1.5, 1.5, w - 3, h - 3, 5);
  c.fillStyle = gradL(c, 0, 1.5, 0, h - 1.5, oro ? [[0, '#4a3410'], [1, '#1e1406']] : [[0, '#241443'], [1, '#0d0820']]); c.fill();
  c.save(); rrect(c, 1.5, 1.5, w - 3, h - 3, 5); c.clip(); alone(c, w / 2, 15, 17, col, 0.28); c.restore();
  sagoma(c, mossa, col, oro ? '#fff6c8' : '#ffffff');
  // la fascia del comando
  rrect(c, 4, 32.4, w - 8, 8.4, 3); c.fillStyle = col; c.fill();
  comando(c, mossa, oro ? '#4a3410' : '#1f1430');
  rrect(c, 1.5, 1.5, w - 3, h - 3, 5); tratto(c, CONT, 2.4);
  rrect(c, 1.5, 1.5, w - 3, h - 3, 5); tratto(c, col, 1.3);
  if (oro) for (const [x, y, r] of [[4.5, 4.5, 2.2], [27.5, 5.5, 1.6], [27, 28, 1.8]]) {      // le stelline
    poli(c, [[x, y - r * 1.6], [x + r * 0.4, y - r * 0.4], [x + r * 1.6, y], [x + r * 0.4, y + r * 0.4], [x, y + r * 1.6], [x - r * 0.4, y + r * 0.4], [x - r * 1.6, y], [x - r * 0.4, y - r * 0.4]]);
    c.fillStyle = '#fffbe0'; c.fill();
  }
}

// il riquadro dove arrivano le schede: il bordo bianco al neon e i quattro angoli più marcati
function zona(c) {
  const W = 40, H = 50, x = 2, y = 2, w = W - 4, h = H - 4;
  alone(c, W / 2, H / 2, 26, '#ffffff', 0.18);
  rrect(c, x, y, w, h, 6); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill();
  rrect(c, x, y, w, h, 6); tratto(c, 'rgba(255,255,255,0.35)', 3.2);
  rrect(c, x, y, w, h, 6); tratto(c, '#ffffff', 1.3);
  for (const [ax, ay, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    c.beginPath(); c.moveTo(ax, ay + sy * 9); c.lineTo(ax, ay + sy * 3); c.quadraticCurveTo(ax, ay, ax + sx * 3, ay); c.lineTo(ax + sx * 9, ay); tratto(c, '#ffe14a', 2.2);
  }
}

export function creaPalco(scene) {
  tela(scene, 'bgPalco', 480, 270, sfondoPalco);
  tela(scene, 'consollePalco', 140, 32, consolle, 6);
  tela(scene, 'frecciaBallo', 22, 22, (c) => freccia(c, '#9af0ff', '#2f8fd8', true), 8);
  tela(scene, 'frecciaOro', 22, 22, (c) => { alone(c, 11, 11, 11, '#ffe14a', 0.6); freccia(c, '#fff3a0', '#e0a020', true); }, 8);
  tela(scene, 'bersaglioBallo', 22, 22, (c) => freccia(c, '#ffffff', '#ffffff', false), 8);
  // le schede delle mosse (normali e d'oro) e il riquadro
  for (const m of MOSSE_BALLO) {
    tela(scene, 'scheda_' + m, SCHEDA.w, SCHEDA.h, (c) => scheda(c, m, false), 6);
    tela(scene, 'schedaOro_' + m, SCHEDA.w, SCHEDA.h, (c) => scheda(c, m, true), 6);
  }
  tela(scene, 'zonaBallo', 40, 50, zona, 6);
}
