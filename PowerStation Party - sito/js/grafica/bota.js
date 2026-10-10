// "Spalma il Bota!": il Bota sdraiato sul telo, visto dall'alto, e la sua spiaggia.
// Il corpo vive in uno spazio di 160x64 unità (sullo schermo è grande il doppio): testa a
// sinistra, piedi a destra. Le stesse sagome servono a disegnarlo e a dire dove c'è pelle,
// così le celle da spalmare coincidono con quello che si vede.
import { RES, tela, fuoriSchermo, CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alfa, casuale } from './base.js';
import { PERSONAGGI, disegnaTesta, disegnaNuca, sagomaTesta, fiori } from './personaggi.js';
import { manoAperta } from './oggetti.js';

export const CORPO = { w: 160, h: 64, cella: 4, dens: RES * 2, densDin: 4 };   // dens = 8 su computer, 6 su telefono
export const GW = CORPO.w / CORPO.cella, GH = CORPO.h / CORPO.cella;           // griglia delle celle: 40 x 16
export const ESPR_BOTA = ['normale', 'parla', 'urlo', 'triste'];
// il riquadro della testa dentro il corpo (la testa è una texture a parte: cambia espressione)
export const RIQUADRO_TESTA = { x: 0, y: 14, w: 38, h: 36 };

const P = PERSONAGGI.bota;
// La testa è quella del personaggio in piedi (192x288), coricata e rimpicciolita:
// il punto (96, 114) va in TESTA, la cima della testa guarda a sinistra.
const TESTA = { x: 17, y: 32, k: 0.22 };
const inTesta = (c) => { c.translate(TESTA.x, TESTA.y); c.rotate(-Math.PI / 2); c.scale(TESTA.k, TESTA.k); c.translate(-96, -114); };
const dentro = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

// braccia e gambe sono "capsule": un segmento con le punte tonde
function capsula(c, x0, y0, x1, y1, r) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  c.beginPath(); c.arc(x0, y0, r, a + Math.PI / 2, a - Math.PI / 2); c.arc(x1, y1, r, a - Math.PI / 2, a + Math.PI / 2); c.closePath();
}

// Sagome delle parti del corpo (s = -1: quella in alto sullo schermo, 1: quella in basso).
// Il Bota è palestrato: spalle larghe e vita stretta, spalle e bicipiti gonfi, cosce e polpacci grossi.
const SAGOME = {
  braccio: (c, s) => capsula(c, 45, 32 + s * 18, 76, 32 + s * 25.4, 5.2),
  spalla: (c, s) => ellisse(c, 45.5, 32 + s * 17.3, 7.2, 6.4, s * 0.2),
  bicipite: (c, s) => ellisse(c, 58, 32 + s * 21.4, 7.6, 6.3, s * 0.235),
  mano: (c, s) => ellisse(c, 81.6, 32 + s * 26.8, 5.2, 4.5, s * 0.27),
  gamba: (c, s) => capsula(c, 103, 32 + s * 8.9, 145, 32 + s * 9.3, 6.2),
  coscia: (c, s) => ellisse(c, 116, 32 + s * 9.1, 13.5, 7.5),
  polpaccio: (c, s) => ellisse(c, 136.5, 32 + s * 9.3, 8.2, 6.9),
  piede: (c, s) => ellisse(c, 152, 32 + s * 9.4, 5.4, 5.8),
  collo: (c) => rrect(c, 29.5, 26, 9, 12, 2.5),
  busto: (c) => {
    c.beginPath(); c.moveTo(36.5, 23);
    c.quadraticCurveTo(37, 13.5, 46, 13.5); c.bezierCurveTo(58, 13.5, 66, 17, 84, 19); c.lineTo(88.5, 18.8);
    c.lineTo(88.5, 45.2); c.lineTo(84, 45); c.bezierCurveTo(66, 47, 58, 50.5, 46, 50.5); c.quadraticCurveTo(37, 50.5, 36.5, 41);
    c.closePath();
  },
  costume: (c) => rrect(c, 84.5, 16.4, 23, 31.2, [3, 7, 7, 3]),
  testa: (c) => { c.save(); inTesta(c); sagomaTesta(c, P.faccia); c.restore(); },
};
const ARTI = [['braccio', -1], ['braccio', 1], ['spalla', -1], ['spalla', 1], ['bicipite', -1], ['bicipite', 1], ['mano', -1], ['mano', 1],
  ['gamba', -1], ['gamba', 1], ['coscia', -1], ['coscia', 1], ['polpaccio', -1], ['polpaccio', 1], ['piede', -1], ['piede', 1], ['collo'], ['busto'], ['testa']];

// Occhi e bocca: niente crema. Un filo più piccoli del disegno, così non scatta a chi ci passa vicino.
export const zonaVietata = (x, y) =>
  dentro(x, y, 16.8, 26.28, 2.6, 2.4) || dentro(x, y, 16.8, 37.72, 2.6, 2.4) || dentro(x, y, 26.6, 32, 1.4, 3);
// quello che non è pelle, sul davanti: occhi, bocca, occhiali da sole tirati sulla fronte
function nonPelleDavanti(c) {
  for (const y of [26.28, 37.72]) { ellisse(c, 16.8, y, 3, 2.8); c.fill(); }
  ellisse(c, 26.6, 32, 1.6, 3.3); c.fill();
  rrect(c, 5.9, 23.2, 6, 17.6, 1.5); c.fill();
}

// ------------------------------------------------------------
//  IL CORPO (senza la testa sul davanti: è una texture a parte)
// ------------------------------------------------------------
function corpoBota(c, retro) {
  const S = P.pelle, om = alfa(scuro(S, 0.55), 0.5), col = P.pantaloni, luce = chiaro(S, 0.07);
  // prima tutti i contorni, poi tutti i riempimenti: muscoli e arti diventano una sagoma sola
  const parti = ARTI.filter(([nome]) => nome !== 'testa');
  for (const [nome, s] of parti) { SAGOME[nome](c, s); tratto(c, CONT, 2.2); }
  for (const [nome, s] of parti) { SAGOME[nome](c, s); c.fillStyle = S; c.fill(); }
  SAGOME.busto(c); c.fillStyle = gradL(c, 0, 13, 0, 51, [[0, scuro(S, 0.06)], [0.5, chiaro(S, 0.05)], [1, scuro(S, 0.08)]]); c.fill();
  const riga = (pts, w = 0.6) => { c.beginPath(); c.moveTo(pts[0], pts[1]); c.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); tratto(c, om, w); };
  for (const s of [-1, 1]) {
    const y = (d) => 32 + s * d;
    riga([50.5, y(13), 53.5, y(18.5), 50, y(23.4)], 0.7);                          // la spalla, tonda
    if (retro) {
      riga([47, y(3.6), 57, y(6.5), 54, y(14.6)], 0.7);                            // scapole
      riga([57.5, y(17.6), 70, y(13.2), 83, y(12.4)], 0.7);                        // dorsali
      riga([69, y(2.4), 76, y(3.4), 83.5, y(2.6)]);                                // lombari
      riga([50.5, y(21), 57.5, y(25.2), 64.5, y(23)], 0.65);                       // tricipiti
      ellisse(c, 81, y(4.6), 0.7, 0.7); c.fillStyle = om; c.fill();               // fossette
      riga([105.5, y(9.1), 116, y(7.9), 127, y(9.1)]);                             // dietro le cosce
      riga([122, y(5.5), 123.5, y(9), 122, y(12.6)]); riga([125, y(6), 126.3, y(9), 125, y(12.2)]);   // dietro le ginocchia
      riga([129.5, y(9.3), 136.5, y(6.6), 143.5, y(9.3)]); riga([129.5, y(9.3), 136.5, y(12), 143.5, y(9.3)]);   // polpacci
      ellisse(c, 153.5, y(9.4), 2.6, 3.2); tratto(c, om, 0.6);                    // talloni
    } else {
      riga([40.5, y(3), 43.5, y(9), 42, y(15.5)], 0.55);                          // clavicole
      // pettorali gonfi
      c.beginPath(); c.moveTo(45.5, y(0.8)); c.bezierCurveTo(44.5, y(10), 47.5, y(17.6), 54.5, y(16.6)); c.bezierCurveTo(60.5, y(15.6), 61.5, y(5), 59, y(0.8)); c.closePath();
      c.fillStyle = luce; c.fill(); tratto(c, om, 0.75);
      ellisse(c, 56.2, y(10.4), 0.8, 0.8); c.fillStyle = alfa(scuro(S, 0.45), 0.8); c.fill();
      // addominali a tartaruga e fianchi
      for (let i = 0; i < 3; i++) { rrect(c, 62.8 + i * 6.6, s > 0 ? 32.5 : 25.9, 5.6, 5.6, 1.6); c.fillStyle = luce; c.fill(); tratto(c, om, 0.55); }
      riga([61.5, y(15.4), 64, y(13), 67, y(12.4)]); riga([68, y(14.6), 70.5, y(12.6), 73.5, y(12)]);
      riga([52.5, y(19.4), 58.5, y(18), 64.5, y(21.4)], 0.65);                     // bicipiti
      riga([105.5, y(5.8), 116, y(3.8), 127, y(6.6)]); riga([105.5, y(12.4), 116, y(14.2), 127, y(11.8)]);   // quadricipiti
      riga([122.5, y(5.6), 126, y(9), 122.5, y(12.6)]);                           // ginocchia
      riga([130.5, y(9.3), 137, y(8.2), 144, y(9.3)]);                             // stinchi
      for (let i = 0; i < 4; i++) { ellisse(c, 156.2, y(6.4 + i * 1.9), 1, 0.85); c.fillStyle = chiaro(S, 0.2); c.fill(); tratto(c, om, 0.4); }   // dita dei piedi
    }
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(83.3, y(27.1) + i * 1.6); c.lineTo(86.1, y(27.7) + i * 1.9); tratto(c, om, 0.5); }         // dita delle mani
  }
  if (retro) {
    c.beginPath(); c.moveTo(40, 32); c.lineTo(84, 32); tratto(c, om, 0.8);                                                  // spina dorsale
    c.beginPath(); c.moveTo(37.5, 32); c.lineTo(45.5, 23); c.lineTo(60, 32); c.lineTo(45.5, 41); c.closePath(); tratto(c, om, 0.6);   // trapezio
  } else {
    c.beginPath(); c.moveTo(47, 32); c.lineTo(62, 32); tratto(c, alfa(scuro(S, 0.5), 0.35), 0.6);                            // lo sterno
    ellisse(c, 82.8, 32, 0.7, 1); c.fillStyle = alfa(scuro(S, 0.55), 0.85); c.fill();                                        // ombelico
  }
  // il costume a fiori
  SAGOME.costume(c); c.fillStyle = gradL(c, 0, 16, 0, 48, [[0, scuro(col, 0.14)], [0.5, col], [1, scuro(col, 0.18)]]); c.fill();
  c.save(); c.clip();
  fiori(c, P, 85, 16, 22, 32, 51, 0.6);
  c.fillStyle = scuro(col, 0.28); c.fillRect(84, 15, 2.2, 34);                                                              // elastico
  c.beginPath(); c.moveTo(97, 32); c.lineTo(108, 32); tratto(c, alfa(CONT, 0.6), 0.7);
  c.restore();
  SAGOME.costume(c); tratto(c, CONT, 1.1);
  if (!retro) { c.beginPath(); c.moveTo(86.5, 31.3); c.quadraticCurveTo(90, 28.5, 91.5, 30.5); c.moveTo(86.5, 32.7); c.quadraticCurveTo(90.5, 35.5, 92, 33.4); tratto(c, '#ffffff', 0.6); }   // laccetto
  if (retro) { c.save(); inTesta(c); disegnaNuca(c, P); c.restore(); }
}

// la pelle di un lato: maschera precisa (per ritagliare crema e scottatura) e celle della griglia
export const PELLE = {};
function creaPelle(retro) {
  const D = CORPO.densDin;
  const maschera = fuoriSchermo(CORPO.w, CORPO.h, D, (c) => {
    c.fillStyle = '#ffffff';
    for (const [nome, s] of ARTI) { SAGOME[nome](c, s); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    SAGOME.costume(c); c.fill();
    if (!retro) nonPelleDavanti(c);
  });
  const px = maschera.getContext('2d').getImageData(0, 0, maschera.width, maschera.height).data;
  const pieno = (x, y) => px[(Math.floor(y * D) * maschera.width + Math.floor(x * D)) * 4 + 3] > 128;
  const celle = new Uint8Array(GW * GH);
  let n = 0;
  for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
    const x = (gx + 0.5) * CORPO.cella, y = (gy + 0.5) * CORPO.cella;
    let dentroQuanti = 0;
    for (const [dx, dy] of [[0, 0], [-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) if (pieno(x + dx, y + dy)) dentroQuanti++;
    if (dentroQuanti >= 3) { celle[gy * GW + gx] = 1; n++; }
  }
  return { maschera, celle, n };
}

// ------------------------------------------------------------
//  ATTREZZI E COMPARSE
// ------------------------------------------------------------
// tubetto di crema solare (18x40), beccuccio in basso: la goccia esce da (9, 39)
function tubettoCrema(c) {
  rrect(c, 2, 2, 14, 27, [6, 6, 3, 3]); c.fillStyle = gradL(c, 2, 0, 16, 0, [[0, '#c9ced9'], [0.35, '#ffffff'], [1, '#b9c0cf']]); c.fill(); tratto(c, CONT, 1.1);
  rrect(c, 3.5, 8.5, 11, 13.5, 1.5); c.fillStyle = gradL(c, 0, 8, 0, 22, [[0, '#ffb23a'], [1, '#ff7a2e']]); c.fill(); tratto(c, 'rgba(0,0,0,0.25)', 0.5);
  for (let i = 0; i < 8; i++) { const a = i * 0.785; c.beginPath(); c.moveTo(9 + Math.cos(a) * 2.9, 13.4 + Math.sin(a) * 2.9); c.lineTo(9 + Math.cos(a) * 4.1, 13.4 + Math.sin(a) * 4.1); tratto(c, '#fff3a0', 0.7); }
  ellisse(c, 9, 13.4, 2.2, 2.2); c.fillStyle = '#fff3a0'; c.fill();
  c.fillStyle = '#ffffff'; c.fillRect(5.2, 18.6, 7.6, 1.6);
  rrect(c, 4, 28.5, 10, 4.5, 1.2); c.fillStyle = '#2f6fd8'; c.fill(); tratto(c, CONT, 0.9);
  poli(c, [[6.5, 33], [11.5, 33], [9.8, 38.5], [8.2, 38.5]]); c.fillStyle = '#2f6fd8'; c.fill(); tratto(c, CONT, 0.8);
}

// la mano di chi spalma (40x56, palmo a 20, 35)
function manoCrema(c) {
  rrect(c, 12, 44, 16, 13, 4); c.fillStyle = '#dca57c'; c.fill(); tratto(c, CONT, 1.6);
  manoAperta(c, '#e9b58d');
}

// goccia di crema (12x12)
function gocciaCrema(c) {
  const forma = () => { c.beginPath(); c.moveTo(6, 1.2); c.bezierCurveTo(10.5, 1, 11.4, 5, 10.2, 8); c.bezierCurveTo(9, 11.4, 3, 11.4, 1.6, 8.2); c.bezierCurveTo(0.4, 5, 1.5, 1.4, 6, 1.2); c.closePath(); };
  forma(); c.fillStyle = gradR(c, 5, 5, 1, 7, [[0, '#ffffff'], [1, '#e3ebf6']]); c.fill(); tratto(c, 'rgba(120,150,190,0.7)', 0.7);
  ellisse(c, 4.6, 4.2, 1.8, 1.2, -0.5); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
}

// il sole con la faccia (60x60): da sornione (0) a furibondo (3)
function sole(c, liv) {
  const col = ['#ffd84a', '#ffb83a', '#ff8a2e', '#ef4428'][liv], bordo = ['#c88a10', '#c8700c', '#b0460c', '#8a1410'][liv];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, r1 = (i % 2 ? 25 : 28.5) + liv * 0.4;
    poli(c, [[30 + Math.cos(a - 0.17) * 18, 30 + Math.sin(a - 0.17) * 18], [30 + Math.cos(a) * r1, 30 + Math.sin(a) * r1], [30 + Math.cos(a + 0.17) * 18, 30 + Math.sin(a + 0.17) * 18]]);
    c.fillStyle = liv === 3 ? (i % 2 ? '#ffb83a' : '#ff6a2e') : chiaro(col, 0.12); c.fill(); tratto(c, bordo, 0.9);
  }
  ellisse(c, 30, 30, 18, 18); c.fillStyle = gradR(c, 25, 24, 2, 21, [[0, chiaro(col, 0.38)], [1, col]]); c.fill(); tratto(c, bordo, 1.3);
  for (const s of [-1, 1]) { ellisse(c, 30 + s * 11.5, 34.5, 3.4, 2.2); c.fillStyle = 'rgba(255,90,60,0.3)'; c.fill(); }
  const D = CONT;
  for (const s of [-1, 1]) {
    const x = 30 + s * 6.6;
    if (liv === 0) { c.beginPath(); c.moveTo(x - 3, 28.5); c.quadraticCurveTo(x, 24.5, x + 3, 28.5); tratto(c, D, 1.5); }
    else {
      ellisse(c, x, 28, 2.9, liv === 1 ? 2.6 : 3.1); c.fillStyle = '#ffffff'; c.fill(); tratto(c, D, 1);
      ellisse(c, x + s * 0.4, 28.4, 1.25, 1.25); c.fillStyle = D; c.fill();
      if (liv === 1) { c.fillStyle = col; c.fillRect(x - 3.4, 24.6, 6.8, 2.4); c.beginPath(); c.moveTo(x - 3, 27); c.lineTo(x + 3, 27); tratto(c, D, 1); }
      // sopracciglia sempre più cattive
      const giu = [0, 0, 2.2, 3.6][liv];
      c.beginPath(); c.moveTo(x - s * 3.6, 23.2 + giu); c.lineTo(x + s * 3.8, 22.2 - giu * 0.5); tratto(c, D, liv === 3 ? 2.4 : 1.7);
    }
  }
  if (liv === 0) { c.beginPath(); c.moveTo(22.5, 33.5); c.quadraticCurveTo(30, 40.5, 37.5, 33.5); tratto(c, D, 1.6); }
  else if (liv === 1) { c.beginPath(); c.moveTo(23.5, 36); c.quadraticCurveTo(31, 38.5, 37, 34); tratto(c, D, 1.6); }
  else if (liv === 2) { c.beginPath(); c.moveTo(23.5, 38); c.quadraticCurveTo(30, 33.5, 36.5, 38); tratto(c, D, 1.7); }
  else {
    rrect(c, 22.5, 33.8, 15, 6.4, 2.4); c.fillStyle = '#ffffff'; c.fill(); tratto(c, D, 1.2);
    for (const x of [26.2, 30, 33.8]) { c.beginPath(); c.moveTo(x, 33.8); c.lineTo(x, 40.2); tratto(c, D, 0.6); }
    c.beginPath(); c.moveTo(22.5, 37); c.lineTo(37.5, 37); tratto(c, D, 0.6);
  }
}

// gabbiano ladro (34x30), guarda a destra; ali = true: ali alzate
function gabbiano(c, ali) {
  const G = '#8f98a8';
  for (const x of [14, 18.5]) { c.beginPath(); c.moveTo(x, 21); c.lineTo(x - 0.5, 27.5); c.lineTo(x + 2.4, 27.8); tratto(c, '#f08a1e', 1.1); }
  poli(c, [[7.5, 14], [1.5, 13], [3, 17.5], [8, 18.5]]); c.fillStyle = '#3a3f4a'; c.fill(); tratto(c, CONT, 0.8);
  if (ali) { ellisse(c, 11, 8.5, 8.2, 3.4, -0.7); c.fillStyle = scuro(G, 0.15); c.fill(); tratto(c, CONT, 0.9); }
  ellisse(c, 15, 17, 9.4, 6.2, 0.06); c.fillStyle = gradL(c, 0, 11, 0, 23, [[0, '#ffffff'], [1, '#dfe6ee']]); c.fill(); tratto(c, CONT, 1);
  ellisse(c, 24.5, 10.2, 4.8, 4.6); c.fillStyle = '#ffffff'; c.fill(); tratto(c, CONT, 1);
  poli(c, [[28.4, 9.2], [33.6, 11.4], [28.2, 12.8]]); c.fillStyle = '#ffc93a'; c.fill(); tratto(c, CONT, 0.8);
  ellisse(c, 31.4, 11.6, 0.8, 0.7); c.fillStyle = '#e0352c'; c.fill();
  ellisse(c, 25.6, 9.4, 1.05, 1.15); c.fillStyle = CONT; c.fill();
  c.beginPath(); c.moveTo(23, 7); c.lineTo(27.6, 8.2); tratto(c, CONT, 1);              // sguardo da furfante
  if (ali) ellisse(c, 12.5, 9.5, 8.4, 3.5, -0.5); else ellisse(c, 13, 16.2, 7, 3.8, 0.12);
  c.fillStyle = G; c.fill(); tratto(c, CONT, 0.9);
  c.beginPath(); if (ali) { c.moveTo(6, 12.6); c.lineTo(9, 7.6); } else { c.moveTo(7.5, 17.4); c.lineTo(12, 18.6); } tratto(c, '#3a3f4a', 1.1);
}

// lingua d'onda (190x40) che arriva da destra: la punta è a sinistra
function onda(c) {
  const forma = (m) => { c.beginPath(); c.moveTo(192, 1 + m); c.lineTo(44, 3 + m); c.bezierCurveTo(16, 4 + m, 2 + m, 12, 2 + m, 20); c.bezierCurveTo(2 + m, 28, 16, 36 - m, 44, 37 - m); c.lineTo(192, 39 - m); c.closePath(); };
  forma(0); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
  forma(3.2); c.fillStyle = gradL(c, 0, 0, 190, 0, [[0, 'rgba(150,222,238,0.9)'], [1, 'rgba(60,160,214,0.92)']]); c.fill();
  const r = casuale(7);
  c.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 46; i++) { const x = 10 + r() * 175, y = 7 + r() * 26; ellisse(c, x, y, 0.6 + r() * 1.3, 0.5 + r()); c.fill(); }
  for (let i = 0; i < 6; i++) { const x = 30 + r() * 140, y = 9 + r() * 22; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 7, y - 2.5, x + 14, y); tratto(c, 'rgba(255,255,255,0.6)', 0.9); }
}

function telefono(c) {
  rrect(c, 1, 1, 9, 15, 1.8); c.fillStyle = '#22242c'; c.fill(); tratto(c, CONT, 0.9);
  rrect(c, 2, 2.4, 7, 11.4, 0.8); c.fillStyle = gradL(c, 0, 2, 0, 14, [[0, '#7fd3ff'], [1, '#2f6fd8']]); c.fill();
  c.fillStyle = '#ffffff'; c.fillRect(3, 4, 5, 1); c.fillRect(3, 6, 3.5, 1);
}

function lattina(c) {
  rrect(c, 1.2, 1.5, 7.6, 12, 1.6); c.fillStyle = gradL(c, 1, 0, 9, 0, [[0, '#c98a10'], [0.4, '#ffd84a'], [1, '#b87a0c']]); c.fill(); tratto(c, CONT, 0.9);
  c.fillStyle = '#c0392b'; c.fillRect(1.6, 5.5, 6.8, 3.6);
  ellisse(c, 5, 1.9, 3.2, 0.9); c.fillStyle = '#d8dce4'; c.fill(); tratto(c, CONT, 0.6);
}

// ------------------------------------------------------------
//  LA SPIAGGIA VISTA DALL'ALTO (il telo è al centro: 232, 150)
// ------------------------------------------------------------
export const LIDO = { telo: { x: 232, y: 150, w: 360, h: 136 }, mare: 456 };

function lettino(c, x, y, col) {
  c.save(); c.translate(x, y);
  rrect(c, -37, -10, 76, 23, 3); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fill();
  rrect(c, -38, -12, 76, 23, 3); c.fillStyle = '#f6f3ea'; c.fill(); tratto(c, CONT, 1);
  rrect(c, -36, -10, 72, 19, 2); c.fillStyle = col; c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = -30; i < 34; i += 8) c.fillRect(i, -10, 3, 19);
  rrect(c, -36, -10, 20, 19, 2); c.fillStyle = scuro(col, 0.18); c.fill();                       // lo schienale
  c.beginPath(); c.moveTo(-16, -10); c.lineTo(-16, 9); tratto(c, 'rgba(0,0,0,0.3)', 0.8);
  c.restore();
}

function sfondoLido(c) {
  const r = casuale(123), T = LIDO.telo, M = LIDO.mare;
  // sabbia
  c.fillStyle = gradL(c, 0, 0, 480, 0, [[0, '#f4dfb4'], [0.8, '#efd5a2'], [0.92, '#dcc08c'], [1, '#c8ab78']]); c.fillRect(0, 0, 480, 270);
  for (let i = 0; i < 1000; i++) { ellisse(c, r() * 452, r() * 270, 0.4 + r() * 0.5, 0.35 + r() * 0.4); c.fillStyle = r() < 0.5 ? 'rgba(170,125,60,0.3)' : 'rgba(255,255,255,0.55)'; c.fill(); }
  for (let i = 0; i < 30; i++) { const x = r() * 420, y = r() * 270, w = 14 + r() * 22; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y - 2.5, x + w, y); tratto(c, 'rgba(180,140,80,0.2)', 1); }
  // orme che vanno al mare
  for (let i = 0; i < 9; i++) { ellisse(c, 250 + i * 22, 232 + (i % 2 ? 5 : -1) - i * 0.8, 3.2, 1.8, -0.1); c.fillStyle = 'rgba(160,120,70,0.28)'; c.fill(); }
  // battigia bagnata, schiuma e mare sul bordo destro
  const riva = (x0, amp) => {
    c.beginPath(); c.moveTo(486, -6); c.lineTo(x0, -6);
    for (let y = -6; y < 276; y += 20) c.quadraticCurveTo(x0 + ((y / 20) % 2 ? amp : -amp), y + 10, x0, y + 20);
    c.lineTo(486, 280); c.closePath();
  };
  riva(M - 20, 4); c.fillStyle = 'rgba(176,138,86,0.5)'; c.fill();
  riva(M, 4); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
  riva(M + 5, 4); c.fillStyle = gradL(c, M, 0, 480, 0, [[0, '#8fdcea'], [1, '#2f98d0']]); c.fill();
  for (let i = 0; i < 12; i++) { const x = M + 8 + r() * 14, y = r() * 270; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y + 5, x, y + 10); tratto(c, 'rgba(255,255,255,0.55)', 0.9); }
  // conchiglie e una stella marina
  for (const [x, y, a] of [[30, 204, 0.3], [408, 226, 1.2], [124, 256, 2], [420, 96, 0.6]]) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(0, 3); c.bezierCurveTo(-5, 1, -4, -4, 0, -4); c.bezierCurveTo(4, -4, 5, 1, 0, 3); c.closePath(); c.fillStyle = '#f6e6d6'; c.fill(); tratto(c, '#b8926a', 0.6);
    for (const dx of [-1.6, 0, 1.6]) { c.beginPath(); c.moveTo(0, 2.6); c.lineTo(dx, -3.2); tratto(c, '#c9a680', 0.4); }
    c.restore();
  }
  c.save(); c.translate(22, 172); c.rotate(0.4);
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, d = i % 2 ? 2.6 : 6.4; i ? c.lineTo(Math.cos(a) * d, Math.sin(a) * d) : c.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
  c.closePath(); c.fillStyle = '#ff8a5a'; c.fill(); tratto(c, '#b8501e', 0.8); c.restore();

  // ombrellone chiuso, steso accanto al telo
  c.save(); c.translate(150, 66); c.rotate(-0.07);
  c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(-52, 3, 122, 6);
  c.fillStyle = '#e8e2d4'; c.fillRect(-58, -1.3, 132, 2.6); c.strokeStyle = CONT; c.lineWidth = 0.7; c.strokeRect(-58, -1.3, 132, 2.6);
  const chiuso = () => { c.beginPath(); c.moveTo(-50, 0); c.quadraticCurveTo(-20, -9, 38, -5); c.lineTo(46, 0); c.lineTo(38, 5); c.quadraticCurveTo(-20, 9, -50, 0); c.closePath(); };
  chiuso(); c.fillStyle = '#ffffff'; c.fill();
  c.save(); chiuso(); c.clip(); c.fillStyle = '#e0453a'; for (let i = -50; i < 50; i += 16) c.fillRect(i, -10, 8, 20); c.restore();
  chiuso(); tratto(c, CONT, 1);
  for (const x of [-12, 14]) { c.beginPath(); c.moveTo(x, -7.4); c.lineTo(x + 1, 7.4); tratto(c, '#f6e9c8', 1.4); }                 // i laccetti che lo tengono chiuso
  c.restore();
  // lettini
  lettino(c, 300, 64, '#2f8fd8'); lettino(c, 388, 66, '#f2a13a');
  // secchiello con paletta e formina
  c.save(); c.translate(178, 240);
  ellisse(c, 2, 3, 11, 9.5); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fill();
  ellisse(c, 0, 0, 10.5, 9.5); c.fillStyle = '#e0453a'; c.fill(); tratto(c, CONT, 1);
  ellisse(c, 0, 0, 8, 7.2); c.fillStyle = gradR(c, -2, -2, 1, 8, [[0, '#f4dfb4'], [1, '#d9bd84']]); c.fill(); tratto(c, 'rgba(0,0,0,0.3)', 0.7);
  c.beginPath(); c.moveTo(-10, -1); c.quadraticCurveTo(0, -16, 10, -1); tratto(c, '#f6f3ea', 1.3);
  c.save(); c.translate(22, 4); c.rotate(0.7); rrect(c, -1.2, -11, 2.4, 13, 1); c.fillStyle = '#f2c43a'; c.fill(); tratto(c, CONT, 0.7); rrect(c, -4, 1, 8, 9, 2); c.fillStyle = '#2f8fd8'; c.fill(); tratto(c, CONT, 0.8); c.restore();
  c.restore();
  // borsa frigo, con le lattine
  c.save(); c.translate(300, 240);
  rrect(c, -19, -11, 42, 27, 4); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fill();
  rrect(c, -21, -14, 42, 27, 4); c.fillStyle = '#2f6fd8'; c.fill(); tratto(c, CONT, 1.1);
  rrect(c, -18, -11, 36, 21, 3); c.fillStyle = '#f6f3ea'; c.fill(); tratto(c, 'rgba(0,0,0,0.3)', 0.8);
  rrect(c, -15, -8, 30, 15, 2); c.fillStyle = gradL(c, 0, -8, 0, 7, [[0, '#bfe6ff'], [1, '#7fc0ea']]); c.fill();
  for (const [x, y] of [[-8, -2], [1, 1], [9, -3]]) { ellisse(c, x, y, 3.6, 3.6); c.fillStyle = '#ffd84a'; c.fill(); tratto(c, CONT, 0.7); ellisse(c, x, y, 1.5, 1.5); c.fillStyle = '#d8dce4'; c.fill(); }
  c.restore();
  // infradito
  for (const [x, y, a] of [[226, 236, -0.25], [240, 242, 0.1]]) {
    c.save(); c.translate(x, y); c.rotate(a); rrect(c, -4, -9, 8, 18, 4); c.fillStyle = '#ffcf3a'; c.fill(); tratto(c, CONT, 0.9);
    c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -6); c.lineTo(3, 0); tratto(c, '#2f6fd8', 1.2); c.restore();
  }

  // il telo da mare, a righe, con le frange
  c.save(); c.translate(T.x, T.y);
  rrect(c, -T.w / 2 + 3, -T.h / 2 + 4, T.w, T.h, 5); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fill();
  c.fillStyle = '#f6f3ea';
  for (let y = -T.h / 2 + 5; y < T.h / 2 - 3; y += 6) { c.fillRect(-T.w / 2 - 4, y, 5, 2.4); c.fillRect(T.w / 2 - 1, y, 5, 2.4); }
  const telo = () => rrect(c, -T.w / 2, -T.h / 2, T.w, T.h, 5);
  telo(); c.fillStyle = '#2f7fd8'; c.fill();
  c.save(); telo(); c.clip();
  c.fillStyle = '#5aa6ee'; for (let y = -T.h / 2 + 10; y < T.h / 2; y += 28) c.fillRect(-T.w / 2, y, T.w, 12);
  c.fillStyle = 'rgba(255,255,255,0.85)'; for (let y = -T.h / 2 + 8; y < T.h / 2; y += 28) { c.fillRect(-T.w / 2, y, T.w, 1.4); c.fillRect(-T.w / 2, y + 14.6, T.w, 1.4); }
  c.fillStyle = gradL(c, 0, -T.h / 2, 0, T.h / 2, [[0, 'rgba(255,255,255,0.12)'], [1, 'rgba(0,0,0,0.12)']]); c.fillRect(-T.w / 2, -T.h / 2, T.w, T.h);
  // l'ombra del Bota sul telo (disegnata a parte e stampata in un colpo solo: le parti si sovrappongono)
  const ombra = fuoriSchermo(CORPO.w, CORPO.h, 2, (k) => { k.fillStyle = '#000000'; for (const [nome, s] of ARTI) { SAGOME[nome](k, s); k.fill(); } });
  c.globalAlpha = 0.2; c.drawImage(ombra, -CORPO.w + 3, -CORPO.h + 4, CORPO.w * 2, CORPO.h * 2); c.globalAlpha = 1;
  c.restore();
  telo(); tratto(c, CONT, 1.2);
  c.restore();
  c.fillStyle = gradR(c, 240, 135, 170, 340, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(60,30,0,0.2)']]); c.fillRect(0, 0, 480, 270);
}

export function creaBota(scene) {
  const { w, h, dens } = CORPO, R = RIQUADRO_TESTA;
  tela(scene, 'bgLido', 480, 270, sfondoLido);
  tela(scene, 'botaFronte', w, h, (c) => corpoBota(c, false), dens);
  tela(scene, 'botaRetro', w, h, (c) => corpoBota(c, true), dens);
  for (const e of ESPR_BOTA) tela(scene, 'botaTesta_' + e, R.w, R.h, (c) => { c.translate(-R.x, -R.y); inTesta(c); disegnaTesta(c, P, e); }, dens);
  PELLE.fronte = creaPelle(false);
  PELLE.retro = creaPelle(true);
  tela(scene, 'tubettoCrema', 18, 40, tubettoCrema, 8);
  tela(scene, 'manoCrema', 40, 57, manoCrema, 6);
  tela(scene, 'gocciaCrema', 12, 12, gocciaCrema, 10);
  for (let i = 0; i < 4; i++) tela(scene, 'sole_' + i, 60, 60, (c) => sole(c, i), 6);
  tela(scene, 'gabbiano_0', 34, 30, (c) => gabbiano(c, false), 8);
  tela(scene, 'gabbiano_1', 34, 30, (c) => gabbiano(c, true), 8);
  tela(scene, 'ondaLido', 190, 40, onda, 5);
  tela(scene, 'telefono', 11, 17, telefono, 10);
  tela(scene, 'lattina', 10, 15, lattina, 10);
}
