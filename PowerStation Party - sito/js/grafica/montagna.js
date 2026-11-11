// "Il Passo del Passaseo": i piani della montagna (qui sotto), i cartelli della salita, gli
// striscioni e i pedali per il dito. La strada, il prato sotto e le bici (e il Sego che si
// arrampica) si disegnano nella scena, a ogni fotogramma (seguono la pendenza).
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, casuale, alone } from './base.js';

// I piani della montagna, da lontano a vicino. La scena li fa scorrere a velocità diverse e, mentre
// si sale, li fa scendere (più si è in alto, più la valle resta sotto):
//  bgMontagna (fermo, 480x300: il cielo, il sole, le due catene lontane coi ghiacciai);
//  pareteMontagna (ferma: lo sperone di roccia con la croce di vetta, che scala il Sego);
//  nuvolaMontagna (passano piano col vento); boschiMontagna e collineMontagna (strisce di 960 che
//  si ripetono: i dorsi coi boschi, poi i pascoli con le baite e le mucche); lungo la strada gli
//  abeti, i massi, i cespugli e i fiori (immagini piccole, messe dalla scena a metri fissi).

// la parete del Sego: dove sta (in alto a sinistra, sopra al punto più basso della strada), la sua
// sagoma, la via che sale (dal basso in cima: è quella che fa il Sego) e la vetta dove si ferma
export const PARETE = {
  x: 10, y: 38,
  via: [[60, 126], [52, 110], [64, 94], [59, 78], [71, 64], [69, 52], [79, 41]],
  vetta: [93, 26],
};
const SAGOMA = [[0, 250], [8, 206], [20, 176], [26, 150], [40, 118], [46, 92], [60, 64], [70, 44], [78, 28], [86, 20], [93, 25], [99, 36], [110, 56], [118, 80], [132, 106], [140, 136], [152, 168], [160, 204], [170, 250]];

// un'onda che si ripete giusta su W (n = quante volte): per le strisce senza cucitura
const onda = (x, W, a) => a.reduce((s, [amp, n, f]) => s + amp * Math.sin((x / W) * Math.PI * 2 * n + f), 0);
// disegna una cosa anche dall'altra parte della striscia, se sta sul bordo (così combacia)
const ogni = (W, x, fn, m = 40) => { fn(x); if (x < m) fn(x + W); if (x > W - m) fn(x - W); };

// una catena di montagne: il versante in ombra (a sinistra: il sole è a destra), la neve in cima
function catena(c, P, base, col, ombra, neve, neveOmbra) {
  c.beginPath(); c.moveTo(P[0][0], base);
  for (const [x, y] of P) c.lineTo(x, y);
  c.lineTo(P[P.length - 1][0], base); c.closePath();
  c.fillStyle = col; c.fill();
  for (let i = 1; i < P.length - 1; i++) {
    const [x, y] = P[i], [xl, yl] = P[i - 1], [xr, yr] = P[i + 1];
    if (y >= yl || y >= yr) continue;
    const faccia = () => poli(c, [[x, y], [xl, yl], [xl + (x - xl) * 0.4, base], [x + (xr - x) * 0.1, base]]);
    faccia(); c.fillStyle = ombra; c.fill();
    // le rughe di roccia che scendono dalla cima
    for (let k = 1; k <= 2; k++) { c.beginPath(); c.moveTo(x + (xr - x) * 0.25 * k, y + (yr - y) * 0.25 * k); c.lineTo(x + (xr - x) * 0.18 * k + 2, y + (yr - y) * 0.25 * k + 22); tratto(c, ombra, 1.2); }
    if (Math.min(yl, yr) - y < 26) continue;
    // la neve: fino a un terzo dei versanti, col bordo frastagliato
    const t = 0.34, L = [x + (xl - x) * t, y + (yl - y) * t], R = [x + (xr - x) * t, y + (yr - y) * t], neveP = [[x, y], R];
    for (let k = 1; k < 6; k++) { const f = k / 6; neveP.push([R[0] + (L[0] - R[0]) * f, R[1] + (L[1] - R[1]) * f + (k % 2 ? 7 : 1)]); }
    neveP.push(L);
    poli(c, neveP); c.fillStyle = neve; c.fill();
    c.save(); faccia(); c.clip(); poli(c, neveP); c.fillStyle = neveOmbra; c.fill(); c.restore();
  }
}

function sfondoMontagna(c) {
  c.fillStyle = gradL(c, 0, 0, 0, 240, [[0, '#3d8bd8'], [0.45, '#86c2ec'], [0.8, '#cfe9f3'], [1, '#f4ecd6']]); c.fillRect(0, 0, 480, 300);
  // il sole in alto a destra, coi raggi larghi e l'alone
  c.save(); c.translate(402, 56);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 300, a, a + 0.13); c.closePath(); c.fillStyle = 'rgba(255,248,214,0.08)'; c.fill(); }
  c.restore();
  alone(c, 402, 56, 80, '#fff3c4', 0.6);
  ellisse(c, 402, 56, 19, 19); c.fillStyle = '#fff2c0'; c.fill();
  ellisse(c, 400, 54, 14, 14); c.fillStyle = '#fffbea'; c.fill();
  // le velature alte (le nuvole vere passano davanti: nuvolaMontagna)
  for (const [x, y, w] of [[110, 28, 80], [262, 50, 110], [470, 100, 60], [200, 92, 50]]) {
    ellisse(c, x, y, w, 3.2); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill();
    ellisse(c, x + w * 0.3, y - 2.4, w * 0.45, 2.4); c.fill();
  }
  // la catena più lontana, quasi nella foschia, e quella davanti coi ghiacciai
  catena(c, [[0, 150], [34, 120], [70, 138], [118, 96], [160, 128], [204, 92], [236, 118], [272, 76], [318, 120], [352, 104], [384, 128], [430, 86], [462, 116], [480, 108]], 300, '#b2c6e0', '#9bb0d0', '#f6f9ff', '#d4e0f2');
  c.fillStyle = gradL(c, 0, 120, 0, 200, [[0, 'rgba(240,246,250,0)'], [1, 'rgba(240,246,250,0.6)']]); c.fillRect(0, 120, 480, 180);
  catena(c, [[0, 180], [46, 156], [96, 176], [150, 140], [196, 170], [244, 130], [298, 172], [350, 126], [404, 168], [448, 144], [480, 162]], 300, '#86a2c2', '#6c88ac', '#eef4fb', '#c2d0e6');
  // il ghiacciaio che scende fra le due cime di destra, e la foschia della valle
  poli(c, [[350, 130], [362, 150], [374, 176], [366, 190], [356, 172], [344, 150]]); c.fillStyle = 'rgba(236,244,252,0.8)'; c.fill();
  c.fillStyle = gradL(c, 0, 170, 0, 300, [[0, 'rgba(226,238,244,0)'], [1, 'rgba(226,238,244,0.7)']]); c.fillRect(0, 170, 480, 130);
}

// lo sperone del Sego (170x250): roccia calda, in ombra a sinistra e al sole a destra, le cenge
// con l'erba e qualche abete, le crepe, la neve in cima e la croce di vetta
function parete(c) {
  const r = casuale(4478);
  const lato = (y, s) => {   // il bordo sinistro (s = 0) o destro (s = 1) della sagoma a quell'altezza
    const P = s ? SAGOMA.slice(9) : SAGOMA.slice(0, 10).reverse();
    for (let i = 1; i < P.length; i++) { const [x0, y0] = P[i - 1], [x1, y1] = P[i]; if ((y - y0) * (y - y1) <= 0) return x0 + (x1 - x0) * ((y - y0) / (y1 - y0 || 1)); }
    return s ? 170 : 0;
  };
  poli(c, SAGOMA);
  c.save(); c.clip();
  c.fillStyle = gradL(c, 0, 0, 170, 0, [[0, '#c9bda8'], [1, '#e2d6bf']]); c.fillRect(0, 0, 170, 250);
  // il versante in ombra: dalla cresta (a zigzag) verso sinistra
  const cresta = [[86, 20], [82, 58], [90, 98], [80, 140], [88, 190], [78, 250]];
  poli(c, [...cresta, [0, 250], [0, 0]]); c.fillStyle = gradL(c, 0, 0, 90, 0, [[0, '#7c7064'], [1, '#9a8e7e']]); c.fill();
  // le placche di roccia: macchie chiare e scure, e le crepe che scendono
  for (let i = 0; i < 60; i++) { const y = 30 + r() * 220, x = lato(y, 0) + r() * (lato(y, 1) - lato(y, 0)); ellisse(c, x, y, 3 + r() * 8, 1.5 + r() * 3); c.fillStyle = r() < 0.5 ? 'rgba(255,248,230,0.16)' : 'rgba(60,46,36,0.12)'; c.fill(); }
  for (let i = 0; i < 12; i++) {
    let y = 40 + r() * 190, x = lato(y, 0) + 8 + r() * (lato(y, 1) - lato(y, 0) - 16);
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0, n = 3 + r() * 4; k < n; k++) { x += (r() - 0.5) * 6; y += 4 + r() * 6; c.lineTo(x, y); }
    tratto(c, 'rgba(52,40,32,0.45)', 0.8);
  }
  // le cenge: il filo chiaro sopra, l'ombra sotto, ciuffi d'erba e (le più basse) un abete
  for (const y0 of [60, 86, 114, 144, 174, 206]) {
    const a = lato(y0, 0) + 3 + r() * 10, b = lato(y0, 1) - 3 - r() * 12, dy = (r() - 0.5) * 6;
    c.beginPath(); c.moveTo(a, y0 + 2); c.lineTo(b, y0 + dy + 2); tratto(c, 'rgba(46,34,26,0.3)', 2.6);
    c.beginPath(); c.moveTo(a, y0); c.lineTo(b, y0 + dy); tratto(c, '#eee4cc', 1.2);
    for (let k = 0; k < (b - a) / 9; k++) { const x = a + r() * (b - a), y = y0 + dy * ((x - a) / (b - a)) - 0.6; ellisse(c, x, y, 2 + r() * 2.5, 1.2 + r()); c.fillStyle = r() < 0.5 ? '#6f9e4a' : '#5a8a3c'; c.fill(); }
    if (y0 > 120) for (let k = 0; k < 2; k++) { const x = a + 6 + r() * (b - a - 12), y = y0 + dy * ((x - a) / (b - a)); abete(c, x, y, 8 + r() * 6, '#2f5e3a', '#4a7e4a'); }
  }
  // la neve in cima
  poli(c, [[86, 20], [93, 25], [99, 36], [94, 33], [90, 38], [86, 32], [80, 37], [76, 34], [78, 28]]); c.fillStyle = '#f4f8ff'; c.fill();
  poli(c, [[86, 20], [78, 28], [76, 34], [80, 37], [85, 32]]); c.fillStyle = '#ccd8ea'; c.fill();
  // la foschia giù in basso: lo sperone si stacca dalle montagne lontane
  c.fillStyle = gradL(c, 0, 120, 0, 250, [[0, 'rgba(170,196,222,0)'], [1, 'rgba(170,196,222,0.55)']]); c.fillRect(0, 120, 170, 130);
  c.restore();
  poli(c, SAGOMA); tratto(c, 'rgba(70,56,46,0.55)', 1);
  // la croce di vetta, di legno
  c.beginPath(); c.moveTo(86, 21); c.lineTo(86, 3); tratto(c, '#4a3424', 1.8);
  c.beginPath(); c.moveTo(81, 8); c.lineTo(91, 8); tratto(c, '#4a3424', 1.6);
}

// una nuvola che passa (100x40): bolle bianche, il fondo piatto in ombra
function nuvola(c) {
  const bolle = [[30, 24, 15], [50, 16, 17], [70, 21, 14], [84, 27, 10], [16, 28, 9]];
  c.save(); c.beginPath(); c.rect(0, 0, 100, 34); c.clip();
  for (const [x, y, rr] of bolle) { ellisse(c, x, y + 3, rr, rr * 0.82); c.fillStyle = '#c8dcef'; c.fill(); }
  c.restore();
  c.save(); c.beginPath(); c.rect(0, 0, 100, 31); c.clip();
  for (const [x, y, rr] of bolle) { ellisse(c, x, y, rr, rr * 0.82); c.fillStyle = '#ffffff'; c.fill(); }
  for (const [x, y, rr] of bolle) { ellisse(c, x + rr * 0.25, y - rr * 0.3, rr * 0.45, rr * 0.3); c.fillStyle = 'rgba(255,252,236,0.9)'; c.fill(); }
  c.restore();
}

// un abete a tre piani, col lato al sole più chiaro (e il contorno, per quelli in primo piano)
function abete(c, x, y, h, col = '#2f6a3a', luce = '#4a8a4a', cont = 0) {
  c.fillStyle = '#5a3a20'; c.fillRect(x - h * 0.045, y - h * 0.14, h * 0.09, h * 0.15);
  for (let k = 0; k < 3; k++) {
    const yb = y - h * 0.1 - k * h * 0.27, w = h * (0.36 - k * 0.08), ht = h * 0.42;
    poli(c, [[x, yb - ht], [x - w, yb], [x + w, yb]]); c.fillStyle = col; c.fill();
    if (cont) tratto(c, CONT, cont);
    poli(c, [[x, yb - ht], [x + w * 0.1, yb], [x + w - cont, yb - cont * 0.5]]); c.fillStyle = luce; c.fill();
  }
}

// una baita: il basamento di pietra, i muri di legno, il tetto con la luce a destra, il fumo
function baita(c, x, y, s) {
  rrect(c, x - 11 * s, y - 5 * s, 22 * s, 5 * s, s); c.fillStyle = '#a29c90'; c.fill();
  c.fillStyle = '#9a6a3c'; c.fillRect(x - 10 * s, y - 13 * s, 20 * s, 8 * s);
  for (let k = 1; k < 4; k++) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x - 10 * s, y - 13 * s + k * 2 * s, 20 * s, 0.4 * s); }
  c.fillStyle = '#f0e0c0'; c.fillRect(x - 6 * s, y - 11 * s, 4.4 * s, 3.6 * s); c.fillStyle = '#3a2a20'; c.fillRect(x - 5.4 * s, y - 10.4 * s, 3.2 * s, 2.4 * s);
  c.fillStyle = '#5a3a22'; c.fillRect(x + 3 * s, y - 10 * s, 3.6 * s, 5 * s);
  c.fillStyle = '#8a857c'; c.fillRect(x + 5 * s, y - 22 * s, 2.6 * s, 6 * s);
  poli(c, [[x - 14 * s, y - 12 * s], [x, y - 21 * s], [x + 14 * s, y - 12 * s]]); c.fillStyle = '#6e4430'; c.fill();
  poli(c, [[x, y - 21 * s], [x + 14 * s, y - 12 * s], [x + 2 * s, y - 12 * s]]); c.fillStyle = '#8c5a3c'; c.fill();
  for (let k = 0; k < 3; k++) { ellisse(c, x + 6.5 * s + k * 2.5 * s, y - 25 * s - k * 4 * s, (1.6 + k) * s, (1.2 + k * 0.6) * s); c.fillStyle = `rgba(255,255,255,${0.55 - k * 0.15})`; c.fill(); }
}

// una mucca al pascolo, piccola (s = scala, v = verso)
function mucca(c, x, y, s, v) {
  c.save(); c.translate(x, y); c.scale(s * v, s);
  c.strokeStyle = '#3a2a22'; c.lineWidth = 0.9;
  for (const lx of [-3.2, -1.6, 1.8, 3.2]) { c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, 3.4); c.stroke(); }
  ellisse(c, 0, -1, 5, 2.8); c.fillStyle = '#f8f4ec'; c.fill(); tratto(c, '#3a2a22', 0.5);
  ellisse(c, -1.5, -1.6, 1.6, 1.1); c.fillStyle = '#6a3a22'; c.fill();
  ellisse(c, 2.2, -0.4, 1.2, 0.9); c.fill();
  ellisse(c, 5.6, -2.2, 1.7, 1.4); c.fillStyle = '#f8f4ec'; c.fill(); tratto(c, '#3a2a22', 0.5);
  ellisse(c, 6.6, -1.6, 0.9, 0.7); c.fillStyle = '#e8a8a0'; c.fill();
  c.restore();
}

// i dorsi coi boschi (960x170): due creste, la foschia fra le due, il paesino col campanile
function boschi(c) {
  const W = 960, H = 170, r = casuale(1871);
  const A = [[10, 3, 0], [6, 7, 1], [3, 13, 2]], B = [[12, 2, 0.5], [5, 9, 0], [2, 17, 1]];
  const yA = (x) => 30 + onda(x, W, A), yB = (x) => 76 + onda(x, W, B);
  const dorso = (f, col) => { c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 6) c.lineTo(x, f(x)); c.lineTo(W, H); c.closePath(); c.fillStyle = col; c.fill(); };
  const punta = (x, y, h, col) => ogni(W, x, (x) => { poli(c, [[x, y - h], [x - h * 0.32, y], [x + h * 0.32, y]]); c.fillStyle = col; c.fill(); });
  dorso(yA, gradL(c, 0, 10, 0, 120, [[0, '#86aab8'], [1, '#6e96a4']]));
  // la cascata che scende dal dorso lontano
  c.beginPath(); c.moveTo(212, yA(212) + 4); for (let y = 0; y < 34; y += 3) c.lineTo(212 + Math.sin(y * 0.6) * 1.2, yA(212) + 6 + y); tratto(c, 'rgba(255,255,255,0.75)', 1.4);
  for (let x = 0; x < W; x += 4.5) punta(x + r() * 2, yA(x) + 3, 4 + r() * 4, '#6a929e');
  for (let i = 0; i < 220; i++) { const x = r() * W; punta(x, yA(x) + 6 + r() * 50, 4 + r() * 4, r() < 0.5 ? '#628a98' : '#5c8492'); }
  c.fillStyle = gradL(c, 0, 50, 0, 110, [[0, 'rgba(236,244,248,0)'], [1, 'rgba(236,244,248,0.45)']]); c.fillRect(0, 50, W, 120);
  dorso(yB, gradL(c, 0, 50, 0, H, [[0, '#5e8e74'], [1, '#4a7a60']]));
  // il paesino: le case bianche coi tetti rossi e il campanile (nella radura: gli abeti lo lasciano stare)
  const P = 640, yP = yB(P) + 14;
  for (const [dx, w, h] of [[-14, 9, 6], [-4, 8, 5], [12, 10, 6], [20, 7, 5]]) {
    c.fillStyle = '#eee6d6'; c.fillRect(P + dx, yP - h, w, h);
    poli(c, [[P + dx - 1, yP - h], [P + dx + w / 2, yP - h - 3.5], [P + dx + w + 1, yP - h]]); c.fillStyle = '#b4523a'; c.fill();
  }
  c.fillStyle = '#e6dcc8'; c.fillRect(P + 4, yP - 17, 4, 17);
  c.fillStyle = '#5a4a3a'; c.fillRect(P + 5, yP - 14, 2, 2.4);
  poli(c, [[P + 3.4, yP - 17], [P + 6, yP - 23], [P + 8.6, yP - 17]]); c.fillStyle = '#8a4a34'; c.fill();
  const radura = (x, y) => Math.abs(x - P - 4) < 30 && y < yP + 10;
  for (let x = 0; x < W; x += 5.5) { const y = yB(x) + 3; if (!radura(x, y)) punta(x + r() * 2, y, 6 + r() * 5, '#3f6e56'); }
  for (let i = 0; i < 300; i++) {
    const x = r() * W, y = yB(x) + 8 + r() * 80, h = 6 + r() * 6;
    if (radura(x, y)) continue;
    punta(x, y, h, r() < 0.5 ? '#3a6850' : '#447458');
    ogni(W, x, (x) => { poli(c, [[x, y - h], [x + h * 0.05, y], [x + h * 0.3, y]]); c.fillStyle = 'rgba(160,210,150,0.22)'; c.fill(); });
  }
}

// i pascoli (960x150): il prato al sole, i fiori, i recinti, le baite, le mucche e gli abeti
function colline(c) {
  const W = 960, H = 150, r = casuale(1955);
  const C = [[12, 2, 0], [6, 5, 1], [2.5, 11, 2.2]], alto = (x) => 40 + onda(x, W, C);
  c.beginPath(); c.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) c.lineTo(x, alto(x));
  c.lineTo(W, H); c.closePath();
  c.fillStyle = gradL(c, 0, 20, 0, H, [[0, '#8cc463'], [0.4, '#68a44a'], [1, '#4c873a']]); c.fill();
  c.beginPath(); for (let x = 0; x <= W; x += 6) c.lineTo(x, alto(x) + 1.6);
  tratto(c, 'rgba(226,255,170,0.5)', 2.4);
  // le pieghe del prato (ombre morbide) e i fiori
  for (let i = 0; i < 26; i++) { const x = r() * W, dy = 22 + r() * 60, w = 40 + r() * 40, h = 5 + r() * 6; ogni(W, x, (x) => { ellisse(c, x, alto(x) + dy, w, h); c.fillStyle = 'rgba(40,80,30,0.1)'; c.fill(); }, 80); }
  for (let i = 0; i < 600; i++) { const x = r() * W, y = alto(x) + 4 + r() * (H - alto(x)); c.fillStyle = ['#ffffff', '#ffe46a', '#c08ae8', '#ffffff'][i % 4]; c.globalAlpha = 0.75; c.fillRect(x, y, 1, 1); }
  c.globalAlpha = 1;
  // i recinti di legno
  for (const [x0, l] of [[90, 70], [520, 90]]) {
    c.beginPath(); for (let x = x0; x <= x0 + l; x += 4) c.lineTo(x, alto(x) + 12); tratto(c, '#8a6440', 0.8);
    c.beginPath(); for (let x = x0; x <= x0 + l; x += 4) c.lineTo(x, alto(x) + 9.5); tratto(c, '#8a6440', 0.8);
    for (let x = x0; x <= x0 + l; x += 7) { c.fillStyle = '#6a4a2c'; c.fillRect(x - 0.5, alto(x) + 8, 1, 6); }
  }
  for (const [x, s, v] of [[120, 1, 1], [140, 0.9, -1], [560, 1, 1], [600, 1, -1], [860, 0.9, 1]]) mucca(c, x, alto(x) + 22, s, v);
  for (const x of [300, 780]) baita(c, x, alto(x) + 16, 1);
  // gli abeti: a gruppi, più grandi giù in basso
  for (let i = 0; i < 26; i++) {
    const x0 = r() * W;
    if ([120, 140, 300, 560, 600, 780, 860].some((q) => Math.abs(q - x0) < 26)) continue;
    for (let k = 0, n = 2 + r() * 4; k < n; k++) {
      const x = x0 + (r() - 0.5) * 30, y = alto(x) + 6 + r() * 34, h = 14 + (y - alto(x)) * 0.4 + r() * 8, col = r() < 0.5 ? '#2c6236' : '#346c3c';
      ogni(W, x, (x) => abete(c, x, y, h, col, '#4f8c4c'));
    }
  }
}

// le cose lungo la strada (con il contorno, come i cartelli): l'abete, il masso, il cespuglio, i fiori
function abeteGrande(c) { abete(c, 15, 52, 48, '#2d6438', '#4a8a48', 0.9); }
function masso(c) {
  poli(c, [[2, 17], [4, 9], [10, 3], [18, 2], [24, 7], [27, 17]]); c.fillStyle = '#9a948a'; c.fill(); tratto(c, CONT, 0.9);
  poli(c, [[10, 3], [18, 2], [24, 7], [16, 9], [9, 7]]); c.fillStyle = '#c4beb2'; c.fill();
  poli(c, [[2, 17], [4, 9], [9, 12], [10, 17]]); c.fillStyle = '#7a746a'; c.fill();
  ellisse(c, 6, 9.5, 3, 1.4); c.fillStyle = '#6a9a48'; c.fill();
  c.beginPath(); c.moveTo(15, 9); c.lineTo(17, 13); c.lineTo(16, 17); tratto(c, 'rgba(43,27,23,0.5)', 0.6);
}
function cespuglio(c) {
  const B = [[7, 9, 5.5], [16, 8, 6.5], [12, 5, 5]];
  for (const [x, y, rr] of B) { ellisse(c, x, y, rr, rr * 0.8); c.fillStyle = '#3f7a3a'; c.fill(); tratto(c, CONT, 0.8); }
  for (const [x, y, rr] of B) { ellisse(c, x, y, rr - 0.5, rr * 0.8 - 0.5); c.fillStyle = '#3f7a3a'; c.fill(); ellisse(c, x + 1.4, y - 1.6, rr * 0.5, rr * 0.35); c.fillStyle = '#5e9a4a'; c.fill(); }
  for (const [x, y] of [[9, 6], [17, 5], [13, 10]]) { ellisse(c, x, y, 0.9, 0.9); c.fillStyle = '#d83a3a'; c.fill(); }
}
function fiori(c) {
  for (let i = 0; i < 9; i++) { const x = 3 + i * 1.7; c.beginPath(); c.moveTo(x, 12); c.quadraticCurveTo(x + 0.5, 7, x + (i % 2 ? 1.5 : -1), 3 + (i % 3)); tratto(c, i % 2 ? '#4f8a3c' : '#62a04a', 0.8); }
  for (const [x, y, col] of [[4, 4, '#3a5ad8'], [9, 2.5, '#ffffff'], [14, 4, '#ffd23a'], [17, 6, '#3a5ad8']]) {
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; ellisse(c, x + Math.cos(a) * 1.1, y + Math.sin(a) * 1.1, 0.9, 0.9); c.fillStyle = col; c.fill(); }
    ellisse(c, x, y, 0.6, 0.6); c.fillStyle = '#ffe680'; c.fill();
  }
}

// i cartelli (26x32): triangolo bianco col bordo rosso sul palo, col disegno dentro
function cartello(c, tipo) {
  c.fillStyle = '#8a8e96'; c.fillRect(12, 18, 2.2, 14);
  const tri = (m) => { c.beginPath(); c.moveTo(13, 1 + m); c.lineTo(25 - m, 21 - m * 0.6); c.lineTo(1 + m, 21 - m * 0.6); c.closePath(); };
  c.lineJoin = 'round';
  tri(0); c.fillStyle = '#e02626'; c.fill(); tratto(c, CONT, 1.6);
  tri(3.4); c.fillStyle = '#ffffff'; c.fill();
  c.lineCap = 'round';
  if (tipo === 'tornante') {
    // la curva a gomito: sale, gira e torna indietro
    c.beginPath(); c.moveTo(9, 18); c.lineTo(9, 11); c.quadraticCurveTo(9, 7, 13, 7); c.quadraticCurveTo(17, 7, 17, 11); c.lineTo(17, 15); tratto(c, '#1c1c22', 1.8);
    poli(c, [[15, 14], [19, 14], [17, 18]]); c.fillStyle = '#1c1c22'; c.fill();
  } else if (tipo === 'strappo') {
    // la salita ripida col "%"
    poli(c, [[6, 18], [20, 18], [20, 9]]); c.fillStyle = '#1c1c22'; c.fill();
    c.font = 'bold 5px sans-serif'; c.fillStyle = '#ffffff'; c.fillText('%', 15, 17);
  }
}

// lo striscione dello sprint e del traguardo (120x22)
function striscione(c, scritta, col) {
  rrect(c, 1, 1, 118, 20, 3); c.fillStyle = col; c.fill(); tratto(c, CONT, 1.4);
  if (scritta === 'TRAGUARDO') for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#ffffff' : '#1c1c22'; c.fillRect(2 + i * 9.7, j ? 15 : 2, 9.7, 4); }
  c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 2.4; c.strokeStyle = CONT; c.strokeText(scritta, 60, 11.5); c.fillStyle = '#ffffff'; c.fillText(scritta, 60, 11.5);
}

// il pedale per il dito (32x32): la scarpa sul pedale, con la freccia del lato
function pedale(c, lato) {
  ellisse(c, 16, 16, 15, 15); c.fillStyle = 'rgba(31,20,48,0.7)'; c.fill(); tratto(c, '#ffe14a', 1.4);
  rrect(c, 8, 18, 16, 4, 1.5); c.fillStyle = '#c8ccd4'; c.fill(); tratto(c, CONT, 0.8);
  c.save(); c.translate(16, 13); c.scale(lato, 1);
  poli(c, [[-7, -4], [3, -4], [7, 0], [3, 4], [-7, 4]]); c.fillStyle = '#ffe14a'; c.fill(); tratto(c, CONT, 0.8);
  c.restore();
}

export function creaMontagna(scene) {
  tela(scene, 'bgMontagna', 480, 300, sfondoMontagna, 3);
  tela(scene, 'pareteMontagna', 170, 250, parete, 3);
  tela(scene, 'nuvolaMontagna', 100, 40, nuvola, 3);
  tela(scene, 'boschiMontagna', 960, 170, boschi, 2);
  tela(scene, 'collineMontagna', 960, 150, colline, 3);
  tela(scene, 'abeteMontagna', 30, 54, abeteGrande, 4);
  tela(scene, 'massoMontagna', 29, 19, masso, 4);
  tela(scene, 'cespuglioMontagna', 24, 16, cespuglio, 4);
  tela(scene, 'fioriMontagna', 20, 13, fiori, 4);
  tela(scene, 'cartelloTornante', 26, 32, (c) => cartello(c, 'tornante'), 6);
  tela(scene, 'cartelloStrappo', 26, 32, (c) => cartello(c, 'strappo'), 6);
  tela(scene, 'striscioneSprint', 120, 22, (c) => striscione(c, 'SPRINT!', '#2f6fd8'), 5);
  tela(scene, 'striscioneArrivo', 120, 22, (c) => striscione(c, 'TRAGUARDO', '#d83a3a'), 5);
  tela(scene, 'pedaleSx', 32, 32, (c) => pedale(c, -1), 6);
  tela(scene, 'pedaleDx', 32, 32, (c) => pedale(c, 1), 6);
}
