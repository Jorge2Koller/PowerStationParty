// "Emilio in Retromarcia": il vialetto di ghiaia davanti alla casa di campagna, la station
// wagon di Emilio vista di fianco (muso a sinistra: esce in retromarcia verso destra), gli
// Shar Pei, il gatto e gli oggetti. Tutto disegnato via codice, come il resto.
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, mix, alfa, alone, casuale } from './base.js';
import { PERSONAGGI, disegnaTesta } from './personaggi.js';
import { CONFIG } from '../config.js';

export const VIALETTO = {
  strada: { y0: 118, y1: 224 },                 // la ghiaia, da un prato all'altro
  campo: { x0: 86, x1: 456, fondo: 246 },       // fin dove si può camminare
  cima: (x) => (x < 180 ? 102 : 74),            // ...e in alto: davanti a casa solo il portico, più in là il prato
  corsia: { y: 186, prof: 34 },                 // dove passa la macchina: y = filo delle ruote verso chi guarda, prof = larghezza a terra
  partenza: 206,                                // x della coda della macchina all'inizio...
  cancello: 456,                                // ...e x del cancello: quando la coda ci arriva, è fuori
  porta: { x: 70, y: 104 },                     // la porta di casa (da lì esce Pastaffi)
  cuccia: { x: 318, y: 106 },
  vasi: [[204, 116], [264, 115], [408, 116], [124, 236], [214, 238], [304, 237], [376, 238]],
  pilastri: [[459, 120], [459, 236]],
  // dove possono comparire biscotti e palline da raccogliere
  nascondigli: [[296, 110], [344, 112], [214, 124], [398, 126], [130, 228], [226, 230], [312, 229], [352, 229], [110, 132], [432, 138]],
  // la macchina, in unità della sua texture (scala AUTO nella scena)
  auto: { w: 132, h: 60, coda: 128.5, suolo: 56, finestrino: { x: 61, y: 29 }, cardine: { x: 50, y: 47 }, luce: { x: 126.5, y: 40 }, scarico: { x: 124, y: 49 } },
};
const S = VIALETTO.strada, K = VIALETTO.corsia;

// ------------------------------------------------------------
//  SFONDO
// ------------------------------------------------------------
function casa(c, r) {
  // tetto di coppi (si vede dall'alto: sale fino in cima allo schermo)
  c.fillStyle = gradL(c, 0, 0, 0, 46, [[0, '#a8502e'], [1, '#c96a3c']]); c.fillRect(0, 0, 176, 46);
  for (let y = 4; y < 46; y += 6) for (let x = (y % 12 ? 0 : 4); x < 176; x += 8) {
    c.beginPath(); c.arc(x + 4, y, 4, 0.1, Math.PI - 0.1); tratto(c, 'rgba(90,35,15,0.45)', 1);
  }
  c.fillStyle = '#8a3f22'; c.fillRect(0, 43, 178, 4);
  // facciata: intonaco giallo senese con qualche pietra a vista
  c.fillStyle = gradL(c, 0, 46, 0, 94, [[0, '#e9cd92'], [1, '#dcb978']]); c.fillRect(0, 46, 174, 48);
  c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(0, 46, 174, 4);
  for (let i = 0; i < 16; i++) { rrect(c, r() * 164, 50 + r() * 38, 5 + r() * 6, 3 + r() * 3, 1.5); c.fillStyle = alfa('#b99a66', 0.5); c.fill(); }
  c.fillStyle = '#cdb07a'; c.fillRect(172, 46, 4, 48);
  // finestre con le persiane verdi
  for (const x of [26, 118, 150]) {
    rrect(c, x - 8, 54, 16, 22, 1); c.fillStyle = '#3d2f2a'; c.fill(); tratto(c, CONT, 1.2);
    c.fillStyle = 'rgba(255,230,160,0.35)'; c.fillRect(x - 6, 56, 5, 18);
    for (const s of [-1, 1]) {
      rrect(c, x + s * 12.5 - 4.5, 53, 9, 24, 1); c.fillStyle = '#3f7a4e'; c.fill(); tratto(c, CONT, 1.1);
      for (let y = 56; y < 76; y += 3) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + s * 12.5 - 3.5, y, 7, 1); }
    }
    rrect(c, x - 10, 76, 20, 4, 1); c.fillStyle = '#b5673f'; c.fill(); tratto(c, CONT, 1);
    for (let i = 0; i < 5; i++) { ellisse(c, x - 8 + i * 4, 75 - (i % 2), 2.2, 2); c.fillStyle = i % 2 ? '#e8463a' : '#ff6f61'; c.fill(); }
  }
  // la porta, col gradino e la lanterna
  rrect(c, 58, 54, 24, 40, [10, 10, 0, 0]); c.fillStyle = '#6a4a2e'; c.fill(); tratto(c, CONT, 1.4);
  rrect(c, 60.5, 57, 19, 37, [8, 8, 0, 0]); c.fillStyle = gradL(c, 60, 0, 80, 0, [[0, '#356b48'], [1, '#2a5539']]); c.fill(); tratto(c, CONT, 1);
  c.beginPath(); c.moveTo(70, 57); c.lineTo(70, 94); tratto(c, 'rgba(0,0,0,0.35)', 0.8);
  ellisse(c, 73, 78, 1.2, 1.2); c.fillStyle = '#e8c048'; c.fill();
  rrect(c, 88, 60, 5, 7, 1.5); c.fillStyle = '#ffe9a0'; c.fill(); tratto(c, CONT, 1);
  alone(c, 90.5, 63, 12, '#ffe9a0', 0.35);
  // il portico: pavimento di cotto, i pali e la trave con la vite
  c.fillStyle = '#c8794c'; c.fillRect(18, 94, 104, 24);
  for (let x = 18; x < 122; x += 8) { c.fillStyle = 'rgba(80,30,10,0.3)'; c.fillRect(x, 94, 0.8, 24); }
  for (let y = 94; y < 118; y += 8) { c.fillStyle = 'rgba(80,30,10,0.3)'; c.fillRect(18, y, 104, 0.8); }
  rrect(c, 54, 92, 32, 5, 1); c.fillStyle = '#b9b2a4'; c.fill(); tratto(c, CONT, 1);
  for (const x of [20, 120]) { rrect(c, x - 2.5, 50, 5, 68, 1); c.fillStyle = '#7a5530'; c.fill(); tratto(c, CONT, 1.2); }
  rrect(c, 14, 46, 112, 5, 1.5); c.fillStyle = '#8a6238'; c.fill(); tratto(c, CONT, 1.2);
  for (let i = 0; i < 26; i++) { const x = 16 + r() * 108, y = 44 + r() * 12; ellisse(c, x, y, 3 + r() * 2, 2 + r() * 1.5, r() * 3); c.fillStyle = r() < 0.5 ? '#4f8a3a' : '#3d7330'; c.fill(); }
  for (const [x, y] of [[34, 56], [98, 58], [110, 54]]) for (let i = 0; i < 5; i++) { ellisse(c, x + (i % 2) * 2.2, y + i * 1.9, 1.2, 1.2); c.fillStyle = '#6a3f8a'; c.fill(); }   // grappoli
}

// la tettoia sul bordo del vialetto, con sotto la moto di Emilio
function tettoia(c) {
  for (const x of [6, 72]) { rrect(c, x - 2, 138, 4, 70, 1); c.fillStyle = '#7a5530'; c.fill(); tratto(c, CONT, 1.1); }
  // la moto: una custom nera, cromata, col manubrio alto
  const Y = 208;
  ellisse(c, 39, Y, 30, 2.6); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
  for (const x of [20, 59]) {
    ellisse(c, x, Y - 8, 8, 8); c.fillStyle = '#1a1a1e'; c.fill(); tratto(c, CONT, 1.2);
    ellisse(c, x, Y - 8, 4.6, 4.6); c.fillStyle = '#c9cdd4'; c.fill(); ellisse(c, x, Y - 8, 1.4, 1.4); c.fillStyle = '#55585e'; c.fill();
  }
  c.beginPath(); c.moveTo(59, Y - 8); c.lineTo(49, Y - 27); tratto(c, CONT, 3.4); tratto(c, '#c9cdd4', 1.8);                 // forcella lunga
  c.beginPath(); c.moveTo(49, Y - 27); c.lineTo(44, Y - 34); c.lineTo(40, Y - 33); tratto(c, CONT, 2.8); tratto(c, '#c9cdd4', 1.4);   // manubrio
  poli(c, [[20, Y - 10], [30, Y - 20], [46, Y - 21], [50, Y - 12], [38, Y - 6]]); c.fillStyle = '#2a2a30'; c.fill(); tratto(c, CONT, 1.2);  // telaio e motore
  rrect(c, 30, Y - 14, 12, 8, 2); c.fillStyle = '#9aa0aa'; c.fill(); tratto(c, CONT, 0.9);
  rrect(c, 33, Y - 26, 15, 7, 3.5); c.fillStyle = gradL(c, 0, Y - 26, 0, Y - 19, [[0, '#c62f2a'], [1, '#7a1614']]); c.fill(); tratto(c, CONT, 1.2);  // serbatoio
  rrect(c, 17, Y - 22, 16, 4.5, 2); c.fillStyle = '#15151a'; c.fill(); tratto(c, CONT, 1);                                  // sella
  c.beginPath(); c.moveTo(34, Y - 6); c.lineTo(10, Y - 5); tratto(c, CONT, 3.4); tratto(c, '#dfe3ea', 1.8);                    // scarico
  ellisse(c, 51, Y - 25, 2.6, 2.6); c.fillStyle = '#ffe9a0'; c.fill(); tratto(c, CONT, 0.9);                                 // faro
  // il tetto di tavole, sopra
  poli(c, [[-2, 128], [80, 124], [84, 146], [-2, 152]]); c.fillStyle = gradL(c, 0, 124, 0, 152, [[0, '#9a6e40'], [1, '#7c5630']]); c.fill(); tratto(c, CONT, 1.4);
  for (let x = 6; x < 82; x += 9) { c.beginPath(); c.moveTo(x, 127.6 - x * 0.045); c.lineTo(x + 1.5, 150.5 - x * 0.06); tratto(c, 'rgba(50,30,10,0.4)', 0.9); }
  c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(0, 152, 84, 6);
}

function sfondoVialetto(c) {
  const r = casuale(123);
  // prato
  c.fillStyle = gradL(c, 0, 0, 0, 270, [[0, '#74b24e'], [1, '#5f9d40']]); c.fillRect(0, 0, 480, 270);
  for (let i = 0; i < 520; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,60,0,0.15)'; c.fillRect(r() * 480, r() * 270, 0.8 + r() * 1.4, 1 + r() * 2.2); }
  for (let i = 0; i < 46; i++) { const x = 180 + r() * 270, y = r() < 0.6 ? 54 + r() * 56 : 232 + r() * 34; ellisse(c, x, y, 1.1, 1.1); c.fillStyle = i % 3 ? '#fffbe6' : '#ffe14a'; c.fill(); }
  // la strada di là dal muro
  c.fillStyle = '#74767e'; c.fillRect(466, 0, 14, 270);
  for (let y = 4; y < 270; y += 16) { c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(477, y, 1.4, 8); }
  // il vialetto di ghiaia: scende piano verso il cancello (più in ombra in fondo)
  c.fillStyle = gradL(c, 0, 0, 470, 0, [[0, '#dcd0b6'], [0.7, '#d0c3a6'], [1, '#bfb193']]); c.fillRect(0, S.y0, 470, S.y1 - S.y0);
  for (let i = 0; i < 1700; i++) {
    ellisse(c, r() * 470, S.y0 + r() * (S.y1 - S.y0), 0.5 + r() * 0.9, 0.4 + r() * 0.6);
    c.fillStyle = ['rgba(255,255,255,0.4)', 'rgba(90,70,50,0.26)', 'rgba(140,130,115,0.42)'][i % 3]; c.fill();
  }
  for (const y of [K.y - K.prof + 6, K.y - 5]) { c.fillStyle = 'rgba(110,95,70,0.2)'; c.fillRect(90, y - 2.6, 380, 5.2); }   // i solchi delle ruote
  for (const y of [S.y0, S.y1]) for (let x = 0; x < 468; x += 7) {
    rrect(c, x + 0.5, y - 2.2, 6, 4.4, 1.8); c.fillStyle = r() < 0.5 ? '#bdb6a8' : '#a69d8d'; c.fill(); tratto(c, 'rgba(60,50,40,0.5)', 0.6);
  }
  casa(c, r);
  tettoia(c);
  // le ciotole davanti alla cuccia
  for (const [x, y, col, dentro] of [[352, 110, '#3f7ad0', '#bfe3ff'], [366, 113, '#d0423f', '#a8703c']]) {
    ellisse(c, x, y + 1.5, 6, 2.4); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fill();
    poli(c, [[x - 5.5, y - 2], [x + 5.5, y - 2], [x + 4.4, y + 2], [x - 4.4, y + 2]]); c.fillStyle = col; c.fill(); tratto(c, CONT, 0.9);
    ellisse(c, x, y - 2, 5.5, 1.8); c.fillStyle = dentro; c.fill(); tratto(c, CONT, 0.8);
  }
  // cipressi e un olivo, in fondo al prato
  for (const [x, y, h] of [[430, 86, 62], [448, 70, 50]]) {
    ellisse(c, x + 3, y + 1, 8, 2.6); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
    rrect(c, x - 1.4, y - 8, 2.8, 9, 1); c.fillStyle = '#5a3d22'; c.fill();
    c.beginPath(); c.moveTo(x, y - h); c.bezierCurveTo(x + 9, y - h * 0.6, x + 8, y - 12, x, y - 6); c.bezierCurveTo(x - 8, y - 12, x - 9, y - h * 0.6, x, y - h); c.closePath();
    c.fillStyle = gradL(c, x - 8, 0, x + 8, 0, [[0, '#2f5d38'], [1, '#1f4428']]); c.fill(); tratto(c, CONT, 1.2);
  }
  // muro di cinta con la siepe, e le ante del cancello aperte verso la strada
  for (const [y0, y1] of [[0, S.y0 - 6], [S.y1 + 6, 270]]) {
    c.fillStyle = '#b9b0a0'; c.fillRect(454, y0, 10, y1 - y0);
    for (let y = y0 + 3; y < y1; y += 7) { c.fillStyle = 'rgba(60,50,40,0.3)'; c.fillRect(454, y, 10, 0.8); }
    for (let y = y0 + 3; y < y1 - 2; y += 6) { ellisse(c, 459 + (r() - 0.5) * 3, y, 6.5, 5); c.fillStyle = r() < 0.5 ? '#3d7a3a' : '#33692f'; c.fill(); }
  }
  for (const [y, s] of [[S.y0 - 2, -1], [S.y1 + 2, 1]]) {
    poli(c, [[460, y], [478, y - s * 12], [478, y - s * 14], [460, y - s * 2]]); c.fillStyle = '#2a2a30'; c.fill();
    for (let i = 0; i <= 6; i++) { c.beginPath(); c.moveTo(460 + i * 3, y - s * i * 2); c.lineTo(460 + i * 3, y - s * i * 2 - 15); tratto(c, '#26262c', 1.2); }
    c.beginPath(); c.moveTo(460, y - 15); c.lineTo(478, y - s * 12 - 15); tratto(c, '#26262c', 1.6);
  }
}

// ------------------------------------------------------------
//  OGGETTI DEL GIARDINO (stanno davanti o dietro a chi passa)
// ------------------------------------------------------------
// la cuccia di legno (46x44, i piedi a y = 42)
function cuccia(c) {
  ellisse(c, 23, 41.5, 22, 2.6); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  rrect(c, 5, 18, 36, 24, 1.5); c.fillStyle = gradL(c, 0, 18, 0, 42, [[0, '#c98a4e'], [1, '#a66d38']]); c.fill(); tratto(c, CONT, 1.3);
  for (let y = 24; y < 42; y += 6) { c.fillStyle = 'rgba(70,40,15,0.35)'; c.fillRect(5, y, 36, 0.8); }
  rrect(c, 14, 22, 18, 20, [9, 9, 0, 0]); c.fillStyle = '#2a1c14'; c.fill(); tratto(c, CONT, 1.2);
  poli(c, [[23, 2], [45, 20], [1, 20]]); c.fillStyle = gradL(c, 0, 2, 0, 20, [[0, '#b5452f'], [1, '#8f3122']]); c.fill(); tratto(c, CONT, 1.4);
  for (let y = 8; y < 20; y += 4) { c.beginPath(); c.moveTo(23 - (y - 2) * 1.2, y); c.lineTo(23 + (y - 2) * 1.2, y); tratto(c, 'rgba(60,15,10,0.4)', 0.8); }
  // la targhetta a forma d'osso
  for (const x of [17, 29]) for (const y of [16.8, 19.4]) { ellisse(c, x, y, 1.6, 1.6); c.fillStyle = '#fff3d6'; c.fill(); }
  c.fillStyle = '#fff3d6'; c.fillRect(17, 16.6, 12, 3);
}

// vaso di gerani (16x24, i piedi a y = 23)
function vaso(c) {
  ellisse(c, 8, 22.5, 7, 1.8); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  poli(c, [[2.5, 12], [13.5, 12], [12, 23], [4, 23]]); c.fillStyle = gradL(c, 2, 0, 14, 0, [[0, '#c8693f'], [1, '#9c4a2a']]); c.fill(); tratto(c, CONT, 1.1);
  rrect(c, 1.6, 10.4, 12.8, 3.2, 1.2); c.fillStyle = '#d07a4c'; c.fill(); tratto(c, CONT, 1);
  const r = casuale(8);
  for (let i = 0; i < 9; i++) { ellisse(c, 2.5 + r() * 11, 5 + r() * 6, 2.6, 2, r() * 3); c.fillStyle = r() < 0.5 ? '#3f8a3a' : '#2f7030'; c.fill(); }
  for (const [x, y] of [[4, 4.5], [8.4, 2.6], [12.2, 5], [6.4, 8]]) for (let i = 0; i < 4; i++) { ellisse(c, x + Math.cos(i * 1.57) * 1.3, y + Math.sin(i * 1.57) * 1.3, 1.25, 1.25); c.fillStyle = i % 2 ? '#e8322c' : '#ff5a4e'; c.fill(); }
}

// pilastro del cancello (16x34, i piedi a y = 33)
function pilastro(c) {
  ellisse(c, 8, 32.5, 8, 2); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  rrect(c, 2.5, 8, 11, 25, 1); c.fillStyle = gradL(c, 2, 0, 14, 0, [[0, '#cfc7b7'], [1, '#a59c8b']]); c.fill(); tratto(c, CONT, 1.2);
  for (let y = 13; y < 32; y += 5) { c.fillStyle = 'rgba(60,50,40,0.35)'; c.fillRect(2.5, y, 11, 0.8); }
  rrect(c, 1, 5.5, 14, 3.4, 1); c.fillStyle = '#b9b0a0'; c.fill(); tratto(c, CONT, 1.1);
  ellisse(c, 8, 3.4, 2.8, 2.8); c.fillStyle = '#d8d0c0'; c.fill(); tratto(c, CONT, 1);
}

// ------------------------------------------------------------
//  LA STATION WAGON DI EMILIO (132x60: muso a sinistra, coda a destra, suolo a y = 56)
// ------------------------------------------------------------
const AUTO_COL = '#2f373d';
function wagon(c) {
  const Y = 56, col = AUTO_COL;
  ellisse(c, 66, Y - 0.4, 63, 3.2); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fill();
  // lo scarico
  rrect(c, 121, 48, 9, 2.6, 1.2); c.fillStyle = '#8a8e96'; c.fill(); tratto(c, CONT, 0.8);
  const scocca = () => {
    c.beginPath();
    c.moveTo(7, 48); c.quadraticCurveTo(3.4, 47.5, 3.6, 42);
    c.lineTo(4.6, 36.5); c.quadraticCurveTo(5.6, 32.6, 12, 32);
    c.lineTo(36, 29.6); c.lineTo(51, 14.6); c.quadraticCurveTo(53, 12.4, 57, 12.4);
    c.lineTo(114, 12.4); c.quadraticCurveTo(119.5, 12.4, 121.5, 16.4);
    c.lineTo(127, 30); c.quadraticCurveTo(128.6, 33.2, 128.6, 37);
    c.lineTo(128.6, 45); c.quadraticCurveTo(128.6, 48, 125, 48);
    c.closePath();
  };
  scocca(); c.fillStyle = gradL(c, 0, 12, 0, 48, [[0, chiaro(col, 0.2)], [0.42, col], [0.62, scuro(col, 0.12)], [1, scuro(col, 0.38)]]); c.fill();
  c.save(); scocca(); c.clip();
  // lo sportello dietro è di un altro colore (di ricambio), e più giù la fascia di plastica
  c.fillStyle = alfa('#4a555e', 0.85); c.fillRect(76, 14, 22.5, 31);
  c.fillStyle = 'rgba(255,255,255,0.13)'; c.fillRect(0, 33.4, 132, 1.6);
  c.fillStyle = '#1b1f23'; c.fillRect(0, 43.5, 132, 5);
  // ammaccature, graffi e un po' di ruggine
  for (const [x, y, rx, ry, a] of [[21, 37.5, 6.5, 3.4, -0.15], [111, 38, 5.6, 3.6, 0.2], [64, 39, 4, 2.4, 0]]) {
    ellisse(c, x, y, rx, ry, a); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
    c.beginPath(); c.ellipse(x, y, rx, ry, a, Math.PI * 1.1, Math.PI * 1.8); tratto(c, 'rgba(255,255,255,0.3)', 0.9);
  }
  for (const [x0, y0, x1, y1] of [[40, 36, 49, 38.4], [86, 31.5, 95, 30.5], [103, 41, 110, 42]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); tratto(c, 'rgba(210,215,220,0.5)', 0.7); }
  const r = casuale(66);
  for (let i = 0; i < 16; i++) { ellisse(c, (i % 2 ? 16 : 92) + r() * 22, 40 + r() * 5, 0.8 + r() * 1.2, 0.6 + r()); c.fillStyle = alfa('#8a4a26', 0.75); c.fill(); }
  // i finestrini: vetro quasi trasparente (dietro quello davanti si vede chi guida)
  const vetri = [[[54.5, 16], [73, 16], [73, 29], [45.6, 29]], [[76, 16], [97.4, 16], [97.4, 29], [76, 29]], [[100.4, 16], [114.6, 16], [120.6, 29], [100.4, 29]]];
  for (const v of vetri) {
    poli(c, v); c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,0.78)'; c.fill(); c.globalCompositeOperation = 'source-over';
    poli(c, v); c.fillStyle = 'rgba(52,74,100,0.34)'; c.fill();
    c.save(); poli(c, v); c.clip();
    poli(c, [[v[0][0] + 9, 16], [v[0][0] + 13, 16], [v[0][0] + 5, 29], [v[0][0] + 1, 29]]); c.fillStyle = 'rgba(255,255,255,0.2)'; c.fill();
    c.restore();
    poli(c, v); tratto(c, '#15181b', 1.5);
  }
  // l'adesivo col teschio, sul vetro in fondo
  ellisse(c, 109, 21.4, 3.3, 3); c.fillStyle = '#f4f4f0'; c.fill();
  rrect(c, 107, 23.2, 4, 2.8, 0.7); c.fill();
  c.fillStyle = '#15181b'; ellisse(c, 107.8, 21.4, 0.95, 1.05); c.fill(); ellisse(c, 110.2, 21.4, 0.95, 1.05); c.fill();
  c.fillRect(108.5, 24.2, 0.4, 1.6); c.fillRect(109.3, 24.2, 0.4, 1.6);
  // le portiere e le maniglie
  c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 0.9;
  for (const x of [50, 75, 98.6]) { c.beginPath(); c.moveTo(x, 29); c.lineTo(x + (x === 50 ? -4 : 0), 44); c.stroke(); }
  c.beginPath(); c.moveTo(121.8, 17); c.lineTo(126.4, 30); c.stroke();
  for (const x of [67, 90]) { rrect(c, x, 31.6, 6, 1.9, 0.8); c.fillStyle = '#15181b'; c.fill(); }
  c.restore();
  scocca(); tratto(c, CONT, 1.5);
  // le barre sul tetto, lo specchietto, i fari
  c.fillStyle = '#15181b'; c.fillRect(60, 9.6, 52, 1.7);
  for (const x of [64, 106]) c.fillRect(x, 9.6, 1.8, 3.4);
  rrect(c, 46.4, 25.4, 5, 4, 1.4); c.fillStyle = col; c.fill(); tratto(c, CONT, 1);
  rrect(c, 3.8, 34.6, 6.4, 4.4, 1.6); c.fillStyle = '#fff1b8'; c.fill(); tratto(c, CONT, 0.8);
  rrect(c, 124.4, 31.4, 4.6, 6.6, 1.4); c.fillStyle = '#d8302a'; c.fill(); tratto(c, CONT, 0.8);
  rrect(c, 124.8, 38.4, 4.2, 3, 1); c.fillStyle = '#e9edf2'; c.fill(); tratto(c, CONT, 0.7);                  // la luce di retromarcia (spenta)
  for (const [x, w] of [[2.4, 12], [118.6, 12]]) { rrect(c, x, 43.4, w, 5.4, 2.2); c.fillStyle = '#23272b'; c.fill(); tratto(c, CONT, 0.9); }
  // le ruote (i cerchi di ferro, una col copricerchio perso)
  [27, 103].forEach((x, i) => {
    ellisse(c, x, Y - 9, 11.4, 11.4); c.fillStyle = '#101214'; c.fill();
    ellisse(c, x, Y - 9, 9, 9); c.fillStyle = '#24262b'; c.fill(); tratto(c, CONT, 1);
    ellisse(c, x, Y - 9, 4.9, 4.9); c.fillStyle = i ? '#5d6168' : gradR(c, x - 1, Y - 10, 0.5, 5, [[0, '#eef0f4'], [1, '#9aa0aa']]); c.fill();
    for (let k = 0; k < 5; k++) { ellisse(c, x + Math.cos(k * 1.2566) * 2.8, Y - 9 + Math.sin(k * 1.2566) * 2.8, 0.8, 0.8); c.fillStyle = '#3a3d43'; c.fill(); }
  });
}

// la portiera aperta verso chi guarda (26x44): sotto il pannello, sopra il telaio del finestrino
// senza vetro. Il cardine è in alto a destra... cioè sul bordo destro della texture.
function portiera(c) {
  const col = AUTO_COL;
  poli(c, [[3, 20], [23, 16.5], [23, 42], [3, 40]]); c.fillStyle = gradL(c, 0, 16, 0, 42, [[0, chiaro(col, 0.12)], [1, scuro(col, 0.3)]]); c.fill(); tratto(c, CONT, 1.5);
  c.fillStyle = '#1b1f23'; c.fillRect(4, 34.5, 18.4, 4);
  rrect(c, 8, 25, 9, 3, 1.2); c.fillStyle = '#15181b'; c.fill();
  c.beginPath(); c.moveTo(3, 20); c.lineTo(5.4, 4); c.lineTo(22, 2.4); c.lineTo(23, 16.5);
  tratto(c, CONT, 3.6); tratto(c, col, 1.8);
}

// ------------------------------------------------------------
//  GLI SHAR PEI (texture 60x42: guardano a destra; i piedi a y = 38, il centro a x = 29)
//  d = { collare, taglia?, macchia?, pelo? } dall'array "cani" di config.js
//  posa: 'a' e 'b' (i due passi), 'giu' (sdraiato, a occhi chiusi), 'felice' (lingua fuori)
// ------------------------------------------------------------
export const CANE = { w: 60, h: 42, ox: 29 / 60, oy: 38 / 42 };
const PELO = '#b0773f';
function sharPei(c, d, posa) {
  const P = d.pelo ?? PELO, scu = scuro(P, 0.26), k = d.taglia ?? 1;
  const giu = posa === 'giu', felice = posa === 'felice', b = posa === 'b';
  // una piega della pelle: il solco scuro e, appena sotto, il bordo chiaro del rotolo
  const ruga = (x0, y0, qx, qy, x1, y1, w = 1.1) => {
    c.beginPath(); c.moveTo(x0 + 0.5, y0 + 0.7); c.quadraticCurveTo(qx + 0.5, qy + 0.7, x1 + 0.5, y1 + 0.7); tratto(c, alfa(chiaro(P, 0.35), 0.55), w);
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(qx, qy, x1, y1); tratto(c, alfa(scuro(P, 0.55), 0.8), w * 0.9);
  };
  c.translate(4, 3);
  c.save(); c.translate(25, 35); c.scale(k, k); c.translate(-25, -35);    // la taglia, coi piedi sempre a terra
  ellisse(c, 25, 34.6, giu ? 21 : 17, 2.4); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
  const zampa = (x, y, col) => {
    rrect(c, x - 3, y, 6, 35 - y, 2.6); c.fillStyle = col; c.fill(); tratto(c, CONT, 1.3);
    ruga(x - 2.4, y + 3.4, x, y + 4.4, x + 2.4, y + 3.4, 0.9); ruga(x - 2.4, y + 6, x, y + 7, x + 2.4, y + 6, 0.9);     // calzini di pieghe
  };
  // la coda arrotolata sul sedere
  const coda = (x, y) => { c.beginPath(); c.arc(x, y, 3.5, 0.9, 5.9); tratto(c, CONT, 4.2); tratto(c, P, 2.2); ellisse(c, x + 0.4, y - 0.2, 1.1, 1.1); c.fillStyle = scu; c.fill(); };
  const testa = (dx, dy) => {
    c.save(); c.translate(dx, dy);
    // orecchie piccolissime, ripiegate
    poli(c, [[30.4, 8.6], [34, 5.4], [35, 10.4]]); c.fillStyle = scu; c.fill(); tratto(c, CONT, 1.2);
    ellisse(c, 37, 14.4, 8.8, 8.4); c.fillStyle = gradR(c, 35, 11, 1, 10, [[0, chiaro(P, 0.14)], [1, P]]); c.fill(); tratto(c, CONT, 1.4);
    // il muso largo, da ippopotamo
    rrect(c, 38.6, 13.4, 12, 10.4, 4.8); c.fillStyle = mix(P, '#5a3a26', 0.32); c.fill(); tratto(c, CONT, 1.4);
    ellisse(c, 49.6, 15, 2.1, 1.8); c.fillStyle = '#231814'; c.fill();
    c.beginPath(); c.moveTo(40, 21.2); c.quadraticCurveTo(45, 23.4, 50, 20.6); tratto(c, CONT, 1.1);
    if (felice || d.lingua) { rrect(c, 43.4, 21.6, 4.4, 6, 2.1); c.fillStyle = '#4a4e86'; c.fill(); tratto(c, CONT, 0.9); c.beginPath(); c.moveTo(45.6, 22.4); c.lineTo(45.6, 26); tratto(c, 'rgba(0,0,0,0.35)', 0.6); }
    // rughe: tre sulla fronte, due tra gli occhi, due sulla guancia, una sul muso
    ruga(30.6, 10.4, 36.6, 5.6, 43, 9.6, 1.3); ruga(31.4, 12.8, 36.8, 8.6, 42.4, 12, 1.2); ruga(33, 7.6, 37, 4.4, 41, 7.2, 1);
    ruga(40.6, 10.4, 41.6, 12.4, 40.8, 14.4, 1); ruga(42.8, 11, 43.8, 13, 43, 15, 0.9);
    ruga(33.4, 18.4, 35.4, 22, 39, 23, 1.2); ruga(31.4, 15.6, 32.6, 19.6, 35, 21.6, 1);
    ruga(42, 15.4, 45.4, 14.2, 48.4, 16, 0.9);
    // l'occhio, piccolo e infossato sotto la piega
    if (giu) ruga(36.4, 13.8, 38.2, 15, 40, 13.8, 1.4);
    else if (felice) ruga(36.4, 14, 38.2, 12.2, 40, 14, 1.5);
    else { ellisse(c, 38.3, 13.8, 1.35, 1.2); c.fillStyle = '#16100e'; c.fill(); ellisse(c, 38.7, 13.4, 0.4, 0.4); c.fillStyle = '#ffffff'; c.fill(); ruga(35.8, 12.4, 38.4, 10.8, 41, 12.6, 1.5); }
    c.restore();
  };
  const collare = (x, y, a) => {
    c.save(); c.translate(x, y); c.rotate(a);
    rrect(c, -1.8, -7.6, 3.6, 15.2, 1.6); c.fillStyle = d.collare ?? '#e8463a'; c.fill(); tratto(c, CONT, 1.1);
    ellisse(c, 0.6, 8.6, 1.7, 1.7); c.fillStyle = '#f2c43a'; c.fill(); tratto(c, CONT, 0.7);
    c.restore();
  };
  if (giu) {
    coda(7.4, 22.4);
    ellisse(c, 12, 28, 7, 6); c.fillStyle = scu; c.fill(); tratto(c, CONT, 1.3);                                   // la coscia
    const corpo = () => ellisse(c, 22, 26.4, 15.4, 7.6);
    corpo(); c.fillStyle = gradL(c, 0, 19, 0, 34, [[0, chiaro(P, 0.12)], [1, scu]]); c.fill();
    if (d.macchia) { c.save(); corpo(); c.clip(); ellisse(c, 17, 21.6, 6, 3.4, -0.2); c.fillStyle = d.macchia; c.fill(); c.restore(); }
    corpo(); tratto(c, CONT, 1.4);
    ruga(15, 20.6, 17.4, 25, 15.6, 30); ruga(21, 19.6, 23.6, 24.4, 21.6, 30.4); ruga(26.6, 20, 29, 24.4, 27.4, 30.4, 1.3); ruga(9, 24, 12, 26.4, 10, 31);
    rrect(c, 32, 30.4, 16, 4.4, 2.2); c.fillStyle = P; c.fill(); tratto(c, CONT, 1.2);                               // le zampe davanti, allungate
    collare(31.6, 25.4, 0.5);
    testa(1, 9.6);
  } else {
    // le zampe dall'altra parte, più scure; poi il corpo a botte; poi quelle di qua
    zampa(13.4 + (b ? 2.4 : 0), 25 - (b ? 1.4 : 0), scu); zampa(29 - (b ? 2.2 : 0), 25, scu);
    coda(7.6, 13.6);
    const corpo = () => rrect(c, 6.4, 12.6, 27.6, 15.6, 7.6);
    corpo(); c.fillStyle = gradL(c, 0, 12, 0, 28, [[0, chiaro(P, 0.14)], [0.6, P], [1, scu]]); c.fill();
    if (d.macchia) { c.save(); corpo(); c.clip(); ellisse(c, 16, 15, 6.4, 4, -0.15); c.fillStyle = d.macchia; c.fill(); c.restore(); }
    corpo(); tratto(c, CONT, 1.4);
    // pieghe: sul collo e la spalla (tante), lungo la schiena, sul fianco
    ruga(24.4, 13.4, 27.6, 19, 25.4, 26.4, 1.3); ruga(21, 13, 23.6, 18.6, 21.8, 25.4, 1.2); ruga(27.6, 14, 30.6, 19.6, 29, 26.4, 1.3);
    ruga(11, 14.6, 13.4, 19, 11.6, 24.6); ruga(15.6, 13.4, 17.6, 17, 16.4, 21.6, 1); ruga(9.6, 24.4, 14, 26.6, 19, 25.4, 1);
    zampa(10 - (b ? 2 : 0), 25, P); zampa(26.4 + (b ? 2.4 : 0), 25 - (b ? 1.6 : 0), P);
    collare(30.6, 17.4, 0.26);
    testa(0, 0);
  }
  c.restore();
}

// il gatto (32x24, i piedi a y = 22: guarda a destra), nei due passi
function gatto(c, b) {
  const P = '#e79a3a', scu = scuro(P, 0.3);
  ellisse(c, 15, 21.6, 11, 1.8); c.fillStyle = 'rgba(0,0,0,0.28)'; c.fill();
  c.beginPath(); c.moveTo(6.4, 13.6); c.quadraticCurveTo(1.4, 8, 5, 2.4); tratto(c, CONT, 4.4); tratto(c, P, 2.4);                // la coda dritta
  for (const [x, dy] of [[8.6 + (b ? 1.8 : 0), b ? 1 : 0], [18.6 - (b ? 1.6 : 0), 0]]) { rrect(c, x - 1.3, 15, 2.6, 7 - dy, 1.2); c.fillStyle = scu; c.fill(); tratto(c, CONT, 0.9); }
  ellisse(c, 14, 13.2, 8.4, 4.8); c.fillStyle = P; c.fill(); tratto(c, CONT, 1.2);
  for (const x of [10, 13.4, 16.8]) { c.beginPath(); c.moveTo(x, 9); c.lineTo(x + 0.8, 12.4); tratto(c, scu, 1.2); }
  for (const [x, dy] of [[6.6 - (b ? 1.6 : 0), 0], [20.4 + (b ? 1.8 : 0), b ? 1.2 : 0]]) { rrect(c, x - 1.3, 15, 2.6, 7 - dy, 1.2); c.fillStyle = P; c.fill(); tratto(c, CONT, 0.9); }
  for (const pts of [[[20, 6.4], [21, 1.6], [23.4, 5.4]], [[23.6, 5.4], [26, 1.6], [26.8, 6.6]]]) { poli(c, pts); c.fillStyle = P; c.fill(); tratto(c, CONT, 1); }
  ellisse(c, 23.4, 9.6, 5.4, 4.8); c.fillStyle = P; c.fill(); tratto(c, CONT, 1.2);
  ellisse(c, 25.2, 9, 0.9, 1.2); c.fillStyle = '#1c2a1a'; c.fill();
  ellisse(c, 28.4, 10.6, 0.8, 0.6); c.fillStyle = '#e87a8a'; c.fill();
  for (const dy of [-0.8, 0.8]) { c.beginPath(); c.moveTo(27.6, 11.4); c.lineTo(31.4, 11.4 + dy * 1.6); tratto(c, 'rgba(255,255,255,0.8)', 0.5); }
}

// ------------------------------------------------------------
//  MUNIZIONI E ICONE
// ------------------------------------------------------------
function biscotto(c) {   // 16x11, a forma d'osso
  const col = '#d9a55c';
  c.fillStyle = col;
  for (const x of [3.4, 12.6]) for (const y of [3.4, 7.6]) { ellisse(c, x, y, 2.6, 2.6); c.fill(); tratto(c, CONT, 1.6); }
  rrect(c, 3.4, 3.4, 9.2, 4.2, 1); c.fill(); tratto(c, CONT, 1.6);
  for (const x of [3.4, 12.6]) for (const y of [3.4, 7.6]) { ellisse(c, x, y, 2.6, 2.6); c.fillStyle = col; c.fill(); }
  c.fillStyle = col; c.fillRect(3.4, 3.6, 9.2, 3.8);
  for (const x of [6, 8, 10]) { ellisse(c, x, 5.5, 0.5, 0.5); c.fillStyle = scuro(col, 0.4); c.fill(); }
}

function pallina(c) {    // 11x11, da tennis
  ellisse(c, 5.5, 5.5, 4.4, 4.4); c.fillStyle = gradR(c, 4.2, 4, 0.5, 5, [[0, '#eaff5a'], [1, '#b6d81e']]); c.fill(); tratto(c, CONT, 1.2);
  c.beginPath(); c.arc(1.4, 5.5, 4.2, -0.9, 0.9); tratto(c, 'rgba(255,255,255,0.9)', 0.9);
  c.beginPath(); c.arc(9.6, 5.5, 4.2, Math.PI - 0.9, Math.PI + 0.9); tratto(c, 'rgba(255,255,255,0.9)', 0.9);
}

function nota(c) {       // 10x13
  rrect(c, 6.2, 1.4, 1.6, 8.6, 0.6); c.fillStyle = '#ffffff'; c.fill(); tratto(c, CONT, 1);
  poli(c, [[7, 1.2], [9.6, 2.8], [9.6, 5.4], [7, 3.8]]); c.fillStyle = '#ffffff'; c.fill(); tratto(c, CONT, 0.9);
  ellisse(c, 4.6, 10, 2.9, 2.2, -0.3); c.fillStyle = '#ffffff'; c.fill(); tratto(c, CONT, 1);
}

// la mano di Emilio che fa le corna rock (16x22, il polso in basso)
function manoCorna(c) {
  const S2 = PERSONAGGI.emilio.pelle;
  rrect(c, 4, 15.4, 8.4, 6.6, 1.6); c.fillStyle = '#1c1c21'; c.fill(); tratto(c, CONT, 1.2);                       // il polsino di pelle
  for (const x of [6, 8.2, 10.4]) { ellisse(c, x, 17.6, 0.8, 0.8); c.fillStyle = '#d2d6dd'; c.fill(); }
  for (const x of [4.6, 11.8]) { rrect(c, x - 1.5, 1.6, 3, 10, 1.5); c.fillStyle = S2; c.fill(); tratto(c, CONT, 1.1); } // indice e mignolo
  rrect(c, 3.4, 8.4, 9.6, 8, 3); c.fillStyle = S2; c.fill(); tratto(c, CONT, 1.2);                                  // il pugno
  for (const x of [6.8, 9.6]) { c.beginPath(); c.moveTo(x, 9); c.lineTo(x, 12.4); tratto(c, 'rgba(0,0,0,0.3)', 0.7); }
  rrect(c, 1.6, 11, 4, 3.4, 1.6); c.fillStyle = S2; c.fill(); tratto(c, CONT, 1);                                   // il pollice
}

function zampa(c) {      // 12x12: l'orma, per le vite
  c.fillStyle = '#ffffff';
  ellisse(c, 6, 8, 3.4, 2.9); c.fill(); tratto(c, CONT, 1.2);
  for (const [x, y] of [[2.2, 4.8], [4.6, 2.4], [7.4, 2.4], [9.8, 4.8]]) { ellisse(c, x, y, 1.5, 1.8); c.fill(); tratto(c, CONT, 1); }
}

export function creaVialetto(scene) {
  tela(scene, 'bgVialetto', 480, 270, sfondoVialetto);
  tela(scene, 'cuccia', 46, 44, cuccia, 6);
  tela(scene, 'vasoGerani', 16, 24, vaso, 8);
  tela(scene, 'pilastro', 16, 34, pilastro, 8);
  tela(scene, 'wagon', VIALETTO.auto.w, VIALETTO.auto.h, wagon, 8);
  tela(scene, 'wagonPortiera', 26, 44, portiera, 8);
  tela(scene, 'luceRetro', 24, 24, (c) => { alone(c, 12, 12, 12, '#ffffff', 0.95); ellisse(c, 12, 12, 2.6, 2.6); c.fillStyle = '#ffffff'; c.fill(); }, 6);
  // un cane per ogni voce dell'array "cani" di config.js: cane0_a, cane0_b, cane0_giu, cane0_felice...
  CONFIG.microgiochi.retromarcia.cani.forEach((d, i) => {
    for (const posa of ['a', 'b', 'giu', 'felice']) tela(scene, `cane${i}_${posa}`, CANE.w, CANE.h, (c) => sharPei(c, d, posa), 10);
  });
  tela(scene, 'gatto_a', 32, 24, (c) => gatto(c, false), 10);
  tela(scene, 'gatto_b', 32, 24, (c) => gatto(c, true), 10);
  tela(scene, 'biscotto', 16, 11, biscotto, 12);
  tela(scene, 'pallina', 11, 11, pallina, 12);
  tela(scene, 'nota', 10, 13, nota, 12);
  tela(scene, 'manoCorna', 16, 22, manoCorna, 10);
  tela(scene, 'zampa', 12, 12, zampa, 10);
  // la faccia di Pastaffi, per l'icona dell'aiuto (30x30)
  tela(scene, 'icoPastaffi', 30, 30, (c) => { c.translate(15, 15.5); c.scale(0.178, 0.178); c.translate(-96, -110); disegnaTesta(c, PERSONAGGI.pastaffi, 'felice'); }, 8);
}
