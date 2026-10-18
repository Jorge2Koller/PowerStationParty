// La pizzeria al taglio di "Scontrino, prego!", vista di fronte: lo sfondo (pareti, arco d'ingresso,
// porta d'uscita, pavimento) e, davanti, il banco con la vetrina e la cassa (Michele sta in mezzo,
// dietro al banco). In più le cose piccole del microgioco: lo scontrino, il trancio, il cartone, i
// soldi, i clienti a pezzi (corpo, pelle e capelli: si ricolorano col tint), il volantino dello
// scontrino finto, la luce del lampeggiante dei finanzieri. Tutto disegnato: le foto di riferimento
// non entrano nel gioco. Il nome del locale è quello della configurazione (nomeLocale).
import { CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alone, casuale, tela } from './base.js';
import scontrino from '../config/microgiochi/scontrino.js';

// dove stanno le cose (unità logiche, schermo 480x270): le usa anche la scena
export const PIZZERIA = {
  banco: { x: 200, y: 86, w: 214, h: 120 },       // l'immagine del banco (vetrina e cassa comprese)
  piano: 150,                                     // il piano del banco
  vetrina: { x0: 212, x1: 300, y0: 114, y1: 148 },
  display: { x: 364, y: 101, w: 48, h: 18 },      // il display della cassa (centro e misure)
  tasti: { x: 364, y: 126 },                      // i tasti, sul piano della cassa
  fessura: { x: 395, y: 113 },                    // la fessura della stampante: lo scontrino esce verso l'alto
  arco: { x: 174, y: 206 },                       // l'arco d'ingresso (da dove entrano i clienti)
  porta: { x0: 436, x1: 476, y0: 92, y1: 228 },   // la porta d'uscita, a destra
  telefono: { x: 392, y: 74 },                    // il telefono degli ordini, sul muro
  mensola: { x: 420, y: 138 },                    // la mensola a destra (la birra)
};
const NOME = scontrino.nomeLocale.toUpperCase();

// ------------------------------------------------------------
//  LO SFONDO
// ------------------------------------------------------------
function sfondo(c) {
  const r = casuale(23);
  // soffitto e pareti color crema
  c.fillStyle = gradL(c, 0, 0, 0, 26, [[0, '#cdb88f'], [1, '#e2cfa8']]); c.fillRect(0, 0, 480, 26);
  c.fillStyle = gradL(c, 0, 26, 0, 200, [[0, '#f1e2bf'], [0.6, '#ecdab3'], [1, '#e2cda2']]); c.fillRect(0, 26, 480, 176);
  c.fillStyle = 'rgba(120,80,40,0.25)'; c.fillRect(0, 25, 480, 2);
  // la fascia grigia in basso, sul muro
  c.fillStyle = gradL(c, 0, 166, 0, 202, [[0, '#a9aaa2'], [1, '#8f918a']]); c.fillRect(0, 166, 480, 36);
  c.fillStyle = '#c9c4b2'; c.fillRect(0, 164, 480, 3);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, 167, 480, 1.2);
  // il pavimento chiaro, a piastrelle (in prospettiva)
  c.fillStyle = gradL(c, 0, 200, 0, 270, [[0, '#cbc4b4'], [1, '#e2dccf']]); c.fillRect(0, 200, 480, 70);
  c.fillStyle = 'rgba(0,0,0,0.1)';
  for (const y of [206, 214, 224, 237, 252]) c.fillRect(0, y, 480, 0.8);
  for (let k = -12; k <= 12; k++) { c.beginPath(); c.moveTo(300 + k * 26, 201); c.lineTo(300 + k * 62, 270); tratto(c, 'rgba(0,0,0,0.08)', 0.8); }
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, 200, 480, 2.2);

  // il binario dei faretti, al soffitto, e la loro luce sul muro
  c.fillStyle = '#3a3a40'; c.fillRect(110, 9, 362, 3);
  for (const x of [140, 192, 244, 296, 348, 400, 452]) {
    c.fillStyle = gradL(c, x - 18, 0, x + 18, 0, [[0, 'rgba(255,240,200,0)'], [0.5, 'rgba(255,240,200,0.28)'], [1, 'rgba(255,240,200,0)']]);
    poli(c, [[x - 4, 22], [x + 4, 22], [x + 26, 120], [x - 26, 120]]); c.fill();
    alone(c, x, 42, 20, '#fff6dc', 0.5);
    c.beginPath(); c.moveTo(x, 12); c.lineTo(x, 15); tratto(c, '#2a2a30', 1.6);
    rrect(c, x - 4, 14, 8, 8, 2); c.fillStyle = gradL(c, x - 4, 0, x + 4, 0, [[0, '#2a2a30'], [0.5, '#6a6a74'], [1, '#2a2a30']]); c.fill(); tratto(c, CONT, 0.8);
    ellisse(c, x, 22.5, 3.2, 1.4); c.fillStyle = '#fffbe8'; c.fill();
  }

  // a sinistra: il grande menù a lavagna, l'orologio, la mensola con lo sgabello
  rrect(c, 6, 36, 78, 90, 3); c.fillStyle = '#7a4a26'; c.fill(); tratto(c, CONT, 1.6);
  rrect(c, 10, 40, 70, 82, 2); c.fillStyle = gradL(c, 0, 40, 0, 122, [[0, '#2e3430'], [1, '#232825']]); c.fill();
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(255,255,240,0.92)';
  c.font = 'bold 8px sans-serif'; c.fillText('MENÙ', 45, 49);
  c.beginPath(); c.moveTo(26, 55); c.lineTo(64, 55); tratto(c, 'rgba(255,255,240,0.5)', 0.7);
  c.font = 'bold 4.2px sans-serif'; c.textAlign = 'left';
  const voci = [['ROSSA', '1,2'], ['MARGHERITA', '1,5'], ['PATATE', '1,6'], ['FUNGHI', '1,8'], ['VERDURE', '1,8'], ['SALSICCIA', '2,0'], ['FARCITA', '2,2'], ['BIBITE', '2,5']];
  voci.forEach(([v, p], i) => {
    const y = 61 + i * 7.4;
    c.fillStyle = 'rgba(255,255,240,0.85)'; c.fillText(v, 14, y);
    c.fillStyle = 'rgba(255,214,120,0.9)'; c.textAlign = 'right'; c.fillText(p, 76, y); c.textAlign = 'left';
    c.setLineDash([0.6, 1.4]); c.beginPath(); c.moveTo(14 + v.length * 3 + 2, y + 1); c.lineTo(66, y + 1); tratto(c, 'rgba(255,255,240,0.35)', 0.5); c.setLineDash([]);
  });
  c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(12, 42, 30, 78);
  // l'orologio tondo
  ellisse(c, 104, 50, 12, 12); c.fillStyle = '#f8f6f0'; c.fill(); tratto(c, CONT, 2.2);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(104 + Math.cos(a) * 9.6, 50 + Math.sin(a) * 9.6); c.lineTo(104 + Math.cos(a) * 11, 50 + Math.sin(a) * 11); tratto(c, '#2a2a30', i % 3 ? 0.6 : 1.2); }
  c.beginPath(); c.moveTo(104, 50); c.lineTo(104 + 4.5, 50 - 4); tratto(c, '#1a1a20', 1.4);
  c.beginPath(); c.moveTo(104, 50); c.lineTo(104 - 1, 50 + 8.5); tratto(c, '#1a1a20', 0.9);
  ellisse(c, 104, 50, 1.1, 1.1); c.fillStyle = '#c8282e'; c.fill();
  // la mensola lungo il muro, con lo sgabello alto
  rrect(c, 0, 134, 96, 5, 1.5); c.fillStyle = gradL(c, 0, 134, 0, 139, [[0, '#e8d3a8'], [1, '#c8ae7c']]); c.fill(); tratto(c, CONT, 1);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, 139, 96, 3);
  sgabello(c, 70, 152);

  // l'arco verso l'ingresso: dentro, la luce del corridoio e la porta sulla strada
  const arco = () => { c.beginPath(); c.moveTo(150, 202); c.lineTo(150, 92); c.arc(174, 92, 24, Math.PI, 0); c.lineTo(198, 202); c.closePath(); };
  arco(); c.fillStyle = gradL(c, 0, 68, 0, 202, [[0, '#f6efe0'], [1, '#d9cfbc']]); c.fill();
  rrect(c, 162, 104, 24, 98, 1.5); c.fillStyle = gradL(c, 0, 104, 0, 200, [[0, '#d9e8f2'], [1, '#aebfcc']]); c.fill(); tratto(c, '#8a8a90', 1.4);
  c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(166, 108, 3, 88);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(150, 196, 48, 6);
  c.save(); arco(); c.lineWidth = 5; c.strokeStyle = '#d8c69c'; c.stroke(); c.restore();
  arco(); tratto(c, 'rgba(90,60,30,0.55)', 1.2);
  // la pianta in vaso, accanto all'arco
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 2.4, d = 10 + r() * 30, x = 139 + Math.cos(a) * d * 0.7, y = 168 + Math.sin(a) * d;
    ellisse(c, x, y, 4.6, 2.6, a + 1.2); c.fillStyle = i % 3 ? '#4f8a3a' : '#6aa64a'; c.fill(); tratto(c, '#2e5a24', 0.7);
  }
  c.beginPath(); c.moveTo(139, 184); c.lineTo(137, 150); c.moveTo(139, 184); c.lineTo(145, 156); tratto(c, '#6a4a2a', 1.4);
  poli(c, [[128, 182], [150, 182], [147, 202], [131, 202]]); c.fillStyle = gradL(c, 128, 0, 150, 0, [[0, '#a8522e'], [0.5, '#cf7a4a'], [1, '#9a4a28']]); c.fill(); tratto(c, CONT, 1.2);
  c.fillStyle = '#8a4224'; c.fillRect(127, 181, 24, 3);

  // dietro al banco: la nicchia ad arco, il quadro, il fornetto scaldapizza, la porticina del retro
  c.beginPath(); c.moveTo(232, 150); c.lineTo(232, 70); c.quadraticCurveTo(282, 44, 332, 70); c.lineTo(332, 150); c.closePath();
  c.fillStyle = gradL(c, 0, 50, 0, 150, [[0, '#f8eed6'], [1, '#e8d8b4']]); c.fill(); tratto(c, 'rgba(120,90,50,0.45)', 1.4);
  rrect(c, 262, 62, 40, 26, 1.5); c.fillStyle = '#6a3a1e'; c.fill(); tratto(c, CONT, 1);
  rrect(c, 265, 65, 34, 20, 1); c.fillStyle = '#f4ead2'; c.fill();
  // (nel quadro: una pizza disegnata, tonda)
  ellisse(c, 282, 75, 8, 7); c.fillStyle = '#e8b064'; c.fill(); ellisse(c, 282, 75, 6.4, 5.6); c.fillStyle = '#d8402e'; c.fill();
  for (const [x, y] of [[279, 73], [285, 76], [281, 78], [284, 72]]) { ellisse(c, x, y, 1.4, 1.2); c.fillStyle = '#fff6e0'; c.fill(); }
  // il fornetto scaldapizza, d'acciaio, con la luce arancione dentro
  rrect(c, 236, 94, 40, 26, 2); c.fillStyle = gradL(c, 236, 0, 276, 0, [[0, '#8a9098'], [0.5, '#d0d6dc'], [1, '#7a8088']]); c.fill(); tratto(c, CONT, 1.2);
  rrect(c, 240, 98, 32, 16, 1.5); c.fillStyle = gradL(c, 0, 98, 0, 114, [[0, '#ffb24a'], [1, '#d8602a']]); c.fill(); tratto(c, '#3a3a40', 1);
  for (const y of [103, 109]) { c.fillStyle = 'rgba(80,40,10,0.5)'; c.fillRect(241, y, 30, 1); }
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(242, 99, 6, 14);
  // la porticina del retro, bianca, col vetrino
  rrect(c, 342, 58, 34, 94, 1.5); c.fillStyle = '#bfb6a2'; c.fill();
  rrect(c, 345, 61, 28, 91, 1); c.fillStyle = gradL(c, 345, 0, 373, 0, [[0, '#f4f2ec'], [1, '#dcd8ce']]); c.fill(); tratto(c, 'rgba(0,0,0,0.3)', 0.8);
  rrect(c, 351, 68, 16, 14, 1); c.fillStyle = '#b8c8d4'; c.fill(); tratto(c, 'rgba(0,0,0,0.35)', 0.8);
  ellisse(c, 369, 108, 1.6, 1.6); c.fillStyle = '#9a9aa2'; c.fill();
  // l'insegna sopra il banco, col nome del locale
  rrect(c, 222, 27, 140, 24, 4); c.fillStyle = '#7a2a20'; c.fill(); tratto(c, CONT, 1.4);
  rrect(c, 225, 30, 134, 18, 3); c.fillStyle = gradL(c, 0, 30, 0, 48, [[0, '#fff8e4'], [1, '#f2e2b8']]); c.fill();
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 13px sans-serif';
  c.lineWidth = 2.4; c.strokeStyle = '#ffffff'; c.strokeText(NOME, 292, 39.5, 112); c.fillStyle = '#c8282e'; c.fillText(NOME, 292, 39.5, 112);
  for (const x of [232, 352]) fettina(c, x, 39, 0.75);
  alone(c, 292, 38, 70, '#fff2c0', 0.18);

  // a destra: le foto in bianco e nero incorniciate, la mensola con lo sgabello, la porta d'uscita
  fotoBN(c, 404, 46, 24, 20, 1);
  fotoBN(c, 406, 72, 20, 24, 2);
  rrect(c, 404, 136, 32, 5, 1.5); c.fillStyle = gradL(c, 0, 136, 0, 141, [[0, '#e8d3a8'], [1, '#c8ae7c']]); c.fill(); tratto(c, CONT, 1);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(404, 141, 32, 3);
  sgabello(c, 420, 156);
  // la porta: il telaio d'alluminio e, nel vano, la sera fuori (il battente lo disegna la scena)
  const P = PIZZERIA.porta;
  rrect(c, P.x0 - 3, P.y0 - 4, P.x1 - P.x0 + 6, P.y1 - P.y0 + 4, 2); c.fillStyle = '#9aa0a8'; c.fill(); tratto(c, CONT, 1.2);
  c.fillStyle = gradL(c, 0, P.y0, 0, P.y1, [[0, '#2c3a5a'], [0.6, '#3e4a62'], [1, '#5a5a5e']]); c.fillRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
  alone(c, P.x0 + 12, P.y0 + 30, 18, '#ffd88a', 0.55);   // un lampione, fuori
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(P.x0, P.y1 - 30, P.x1 - P.x0, 30);
  // l'insegna verde USCITA, sopra la porta
  rrect(c, 444, 80, 24, 8, 1.5); c.fillStyle = '#1e9a4a'; c.fill(); tratto(c, CONT, 0.8);
  c.font = 'bold 4.6px sans-serif'; c.fillStyle = '#ffffff'; c.fillText('USCITA', 456, 84.3);
  alone(c, 456, 84, 14, '#6aff9a', 0.2);
  // l'ombra del banco sul pavimento
  c.fillStyle = gradL(c, 0, 200, 0, 214, [[0, 'rgba(0,0,0,0.22)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(204, 200, 210, 14);
}

// uno sgabello alto da bar: la seduta tonda di legno e le gambe di metallo
function sgabello(c, x, y) {
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 4, y + 2); c.lineTo(x + s * 9, y + 50); tratto(c, CONT, 2.6); tratto(c, '#3a3a40', 1.4); }
  c.beginPath(); c.moveTo(x - 7, y + 30); c.lineTo(x + 7, y + 30); tratto(c, '#3a3a40', 1.4);
  ellisse(c, x, y, 11, 3.6); c.fillStyle = gradL(c, x - 11, 0, x + 11, 0, [[0, '#8a4a22'], [0.5, '#c27a3e'], [1, '#7a3e1a']]); c.fill(); tratto(c, CONT, 1.2);
}

// una foto in bianco e nero, incorniciata (inventata: una vespa, oppure un pizzaiolo al forno)
function fotoBN(c, x, y, w, h, tipo) {
  rrect(c, x, y, w, h, 1); c.fillStyle = '#4a2c18'; c.fill(); tratto(c, CONT, 0.9);
  rrect(c, x + 2, y + 2, w - 4, h - 4, 0.5); c.fillStyle = gradL(c, 0, y, 0, y + h, [[0, '#d8d6d0'], [1, '#9a9894']]); c.fill();
  c.fillStyle = '#3a3a3a';
  if (tipo === 1) {
    for (const dx of [6, 17]) { ellisse(c, x + dx, y + h - 6, 2.6, 2.6); c.fill(); }
    poli(c, [[x + 5, y + h - 8], [x + 11, y + h - 12], [x + 19, y + h - 11], [x + 19, y + h - 7], [x + 7, y + h - 6]]); c.fill();
    c.fillRect(x + 9, y + 6, 1.2, 6); ellisse(c, x + 12, y + 5, 2.4, 2.4); c.fill();
  } else {
    ellisse(c, x + 8, y + 8, 3, 3); c.fill(); c.fillRect(x + 5, y + 11, 6, 9);
    c.fillStyle = '#5a5a58'; rrect(c, x + 12, y + 9, 6, 9, [3, 3, 0, 0]); c.fill();
    c.fillStyle = '#f0eee8'; ellisse(c, x + 15, y + 14, 1.6, 1.6); c.fill();
  }
}

// una fettina di pizza (per l'insegna)
function fettina(c, x, y, k) {
  c.save(); c.translate(x, y); c.scale(k, k);
  poli(c, [[-7, -7], [7, -7], [0, 9]]); c.fillStyle = '#f2c060'; c.fill(); tratto(c, CONT, 1.2);
  poli(c, [[-5, -4], [5, -4], [0, 6]]); c.fillStyle = '#d8402e'; c.fill();
  c.fillStyle = '#fff4dc'; for (const [px, py] of [[-2, -2], [2, 0], [0, 3]]) { ellisse(c, px, py, 1.3, 1.1); c.fill(); }
  rrect(c, -8, -9, 16, 3.5, 1.5); c.fillStyle = '#c88a3a'; c.fill(); tratto(c, CONT, 1);
  c.restore();
}

// ------------------------------------------------------------
//  IL BANCO (davanti a Michele): il banco di legno chiaro, la vetrina con le teglie e i cartellini
//  dei prezzi colorati, la cassa col display e la stampante degli scontrini
// ------------------------------------------------------------
const PIZZE = ['margherita', 'patate', 'funghi', 'verdure', 'salsiccia', 'rossa'];
function teglia(c, x, y, w, h, tipo, cartellino, r) {
  rrect(c, x, y, w, h, 1); c.fillStyle = '#5a5a60'; c.fill();
  rrect(c, x + 1, y + 0.8, w - 2, h - 1.8, 1); c.fillStyle = '#e8b866'; c.fill();
  rrect(c, x + 2, y + 1.6, w - 4, h - 3.4, 1);
  c.fillStyle = { margherita: '#d8442e', patate: '#f2e2b0', funghi: '#f4ead4', verdure: '#e8d8b0', salsiccia: '#f4ead4', rossa: '#c8341e' }[tipo]; c.fill();
  for (let i = 0; i < w * 0.9; i++) {
    const px = x + 3 + r() * (w - 6), py = y + 2.4 + r() * (h - 4.8);
    if (tipo === 'margherita') { ellisse(c, px, py, 1.5, 1.1); c.fillStyle = i % 4 ? '#fff6e0' : '#3a8a3a'; c.fill(); }
    else if (tipo === 'patate') { ellisse(c, px, py, 1.6, 1.1); c.fillStyle = i % 5 ? '#f6d880' : '#4a7a3a'; c.fill(); tratto(c, 'rgba(160,110,40,0.5)', 0.3); }
    else if (tipo === 'funghi') { ellisse(c, px, py, 1.3, 0.9); c.fillStyle = '#8a5a3a'; c.fill(); }
    else if (tipo === 'verdure') { ellisse(c, px, py, 1.2, 0.9); c.fillStyle = ['#3a9a3a', '#d8402e', '#f2c43a', '#6a3a8a'][i % 4]; c.fill(); }
    else if (tipo === 'salsiccia') { ellisse(c, px, py, 1.4, 1.1); c.fillStyle = '#a8603a'; c.fill(); }
    else if (i % 3 === 0) { ellisse(c, px, py, 0.6, 0.6); c.fillStyle = '#5a8a3a'; c.fill(); }
  }
  // il cartellino del prezzo, colorato, sullo stecchino
  const [col, prezzo] = cartellino, cx = x + w * 0.7, cy = y - 3;
  c.beginPath(); c.moveTo(cx, cy + 2); c.lineTo(cx - 0.5, y + 3); tratto(c, '#d8c8a0', 0.6);
  rrect(c, cx - 4.5, cy - 3, 9, 5.6, 1); c.fillStyle = col; c.fill(); tratto(c, CONT, 0.6);
  c.font = 'bold 3.3px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1f1430'; c.fillText(prezzo, cx, cy - 0.2);
}

function banco(c) {
  const V = PIZZERIA.vetrina, r = casuale(31);
  c.save(); c.translate(-PIZZERIA.banco.x, -PIZZERIA.banco.y);
  // il banco di legno chiaro, coi pannelli
  rrect(c, 204, 150, 210, 54, 1.5); c.fillStyle = gradL(c, 0, 150, 0, 204, [[0, '#e4c996'], [1, '#c9a66c']]); c.fill(); tratto(c, CONT, 1.4);
  for (const [x, w] of [[212, 60], [278, 60], [344, 62]]) {
    rrect(c, x, 158, w, 38, 1.5); c.fillStyle = 'rgba(120,80,30,0.1)'; c.fill(); tratto(c, 'rgba(120,80,30,0.45)', 1);
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + 2, 159, w - 4, 1.2);
  }
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(204, 200, 210, 4);
  // il piano
  rrect(c, 202, 145, 214, 7, 1.5); c.fillStyle = gradL(c, 0, 145, 0, 152, [[0, '#faf4e6'], [1, '#d8ccb2']]); c.fill(); tratto(c, CONT, 1.2);

  // la vetrina: le teglie in due file (dietro più piccole), il vetro coi riflessi, l'acciaio
  rrect(c, V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0, 2); c.fillStyle = gradL(c, 0, V.y0, 0, V.y1, [[0, '#e6eef2'], [1, '#c8d2d8']]); c.fill();
  const prezzi = [['#ff5a6a', '1,5'], ['#ffe14a', '1,6'], ['#7dff9a', '1,8'], ['#ff9a3a', '1,8'], ['#5ab4ff', '2,0'], ['#ff7ac8', '1,2']];
  for (let k = 0; k < 3; k++) teglia(c, V.x0 + 5 + k * 27.5, 121, 25, 8, PIZZE[k + 3], prezzi[k + 3], r);
  for (let k = 0; k < 3; k++) teglia(c, V.x0 + 3 + k * 28, 134, 27, 10, PIZZE[k], prezzi[k], r);
  rrect(c, V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0, 2); c.fillStyle = 'rgba(210,235,255,0.2)'; c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)';
  for (const x of [V.x0 + 14, V.x0 + 52]) poli(c, [[x, V.y0 + 1], [x + 7, V.y0 + 1], [x - 6, V.y1 - 1], [x - 13, V.y1 - 1]]), c.fill();
  c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(V.x0 + 1, V.y0, V.x1 - V.x0 - 2, 1.2);
  rrect(c, V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0, 2); tratto(c, '#7a8088', 1.6);
  rrect(c, V.x0 - 1, V.y1 - 1, V.x1 - V.x0 + 2, 4, 1); c.fillStyle = gradL(c, V.x0, 0, V.x1, 0, [[0, '#8a9098'], [0.5, '#dfe4e8'], [1, '#8a9098']]); c.fill(); tratto(c, CONT, 0.8);

  // la cassa: il display dei clienti sull'asta, il corpo coi tasti, la stampante degli scontrini
  const D = PIZZERIA.display;
  rrect(c, 361, 109, 6, 14, 1); c.fillStyle = '#2a2c32'; c.fill(); tratto(c, CONT, 0.8);
  rrect(c, D.x - D.w / 2 - 3, D.y - D.h / 2 - 3, D.w + 6, D.h + 6, 3); c.fillStyle = '#2a2c32'; c.fill(); tratto(c, CONT, 1.2);
  rrect(c, D.x - D.w / 2, D.y - D.h / 2, D.w, D.h, 1.5); c.fillStyle = '#123022'; c.fill();
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(D.x - D.w / 2 + 2, D.y - D.h / 2 + 1, D.w - 4, 3);
  poli(c, [[344, 130], [348, 122], [386, 122], [388, 130]]); c.fillStyle = '#4a4e58'; c.fill(); tratto(c, CONT, 1);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 9; j++) {
    rrect(c, 350 + j * 3.9 + i * 0.3, 123.2 + i * 1.6, 3.1, 1.2, 0.3);
    c.fillStyle = j === 8 ? (i < 2 ? '#e05a4e' : '#4caf6a') : '#d8dce4'; c.fill();
  }
  rrect(c, 342, 129, 62, 21, 2); c.fillStyle = gradL(c, 0, 129, 0, 150, [[0, '#4a4e58'], [1, '#2e3138']]); c.fill(); tratto(c, CONT, 1.2);
  rrect(c, 348, 137, 36, 7, 1); c.fillStyle = '#26282e'; c.fill(); tratto(c, 'rgba(255,255,255,0.15)', 0.6);
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(344, 130.5, 58, 1.2);
  // la stampante: una scatola chiara, con la fessura da dove esce lo scontrino
  const F = PIZZERIA.fessura;
  rrect(c, F.x - 9, F.y - 1, 18, 17, 2.5); c.fillStyle = gradL(c, 0, F.y, 0, F.y + 16, [[0, '#e8eaee'], [1, '#b0b4bc']]); c.fill(); tratto(c, CONT, 1.2);
  rrect(c, F.x - 6.5, F.y + 0.5, 13, 2.2, 1); c.fillStyle = '#1a1a1e'; c.fill();
  ellisse(c, F.x + 5, F.y + 11, 1.3, 1.3); c.fillStyle = '#4caf6a'; c.fill();
  c.restore();
}

// ------------------------------------------------------------
//  LA PORTA D'USCITA (il battente: chiuso, o aperto verso l'interno)
// ------------------------------------------------------------
function portaChiusa(c) {
  const P = PIZZERIA.porta, w = P.x1 - P.x0, h = P.y1 - P.y0;
  rrect(c, 0, 0, w, h, 1); c.fillStyle = '#b8bec6'; c.fill(); tratto(c, CONT, 1.2);
  rrect(c, 4, 4, w - 8, h - 22, 1); c.fillStyle = 'rgba(160,200,230,0.35)'; c.fill(); tratto(c, '#7a8088', 1);
  c.fillStyle = 'rgba(255,255,255,0.35)'; poli(c, [[8, 6], [14, 6], [8, 40], [4, 40]]); c.fill();
  rrect(c, 4, h - 16, w - 8, 12, 1); c.fillStyle = '#9aa0a8'; c.fill(); tratto(c, '#6a7078', 0.8);
  rrect(c, 4, h * 0.52, 6, 3, 1); c.fillStyle = '#e0e4e8'; c.fill(); tratto(c, CONT, 0.8);
  c.font = 'bold 4.2px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.fillText('TIRARE', w / 2, h * 0.36);
}
function portaAperta(c) {
  const P = PIZZERIA.porta, h = P.y1 - P.y0;
  poli(c, [[0, 0], [12, 6], [12, h - 4], [0, h]]); c.fillStyle = '#9aa0a8'; c.fill(); tratto(c, CONT, 1.2);
  poli(c, [[2, 4], [10, 9], [10, h - 22], [2, h - 20]]); c.fillStyle = 'rgba(160,200,230,0.4)'; c.fill(); tratto(c, '#6a7078', 0.8);
}

// ------------------------------------------------------------
//  LE COSE PICCOLE
// ------------------------------------------------------------
// lo scontrino: carta bianca, le righe stampate, il totale, il bordo strappato in cima
function foglioScontrino(c) {
  poli(c, [[0.5, 2], [2, 0.5], [3.5, 2], [5, 0.5], [6.5, 2], [8, 0.5], [9.5, 2], [9.5, 25.5], [0.5, 25.5]]);
  c.fillStyle = '#ffffff'; c.fill(); tratto(c, CONT, 0.9);
  c.fillStyle = 'rgba(60,60,70,0.55)';
  for (const [y, w] of [[5, 6], [8, 5], [10.5, 6.5], [13, 4.5], [15.5, 6]]) c.fillRect(2, y, w, 0.9);
  c.fillStyle = 'rgba(30,30,40,0.85)'; c.fillRect(2, 19, 6.5, 1.5);
  c.fillStyle = 'rgba(60,60,70,0.4)'; c.fillRect(2, 22.5, 5, 0.8);
}
// il trancio incartato nella carta
function trancio(c) {
  poli(c, [[2, 4], [16, 2], [14, 11], [4, 12]]); c.fillStyle = '#f6efe0'; c.fill(); tratto(c, CONT, 1);
  poli(c, [[4, 4.5], [14, 3], [13, 6], [5, 7]]); c.fillStyle = '#d8442e'; c.fill();
  for (const [x, y] of [[7, 5], [11, 4.6]]) { ellisse(c, x, y, 1.2, 0.8); c.fillStyle = '#fff6e0'; c.fill(); }
  c.beginPath(); c.moveTo(3, 8); c.lineTo(15, 6.5); tratto(c, 'rgba(0,0,0,0.15)', 0.6);
}
// il cartone da asporto (di lato)
function cartone(c) {
  rrect(c, 0.5, 1, 23, 8, 1); c.fillStyle = gradL(c, 0, 1, 0, 9, [[0, '#f0dcae'], [1, '#d4b47a']]); c.fill(); tratto(c, CONT, 1);
  c.fillStyle = '#c8282e'; c.fillRect(3, 4, 18, 2);
  c.beginPath(); c.moveTo(0.5, 3); c.lineTo(23.5, 3); tratto(c, 'rgba(0,0,0,0.2)', 0.6);
}
// i soldi: una banconota
function banconota(c) {
  rrect(c, 0.5, 0.5, 13, 7, 1); c.fillStyle = gradL(c, 0, 0, 14, 0, [[0, '#7ac0a0'], [1, '#4a9a7a']]); c.fill(); tratto(c, CONT, 0.8);
  ellisse(c, 7, 4, 2.2, 2.2); tratto(c, 'rgba(255,255,255,0.7)', 0.6);
  c.font = 'bold 3.6px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.fillText('€', 7, 4.2);
}
// la mezzaluna sul banco (Michele taglia il trancio)
function mezzalunaPiccola(c) {
  c.beginPath(); c.moveTo(1, 6); c.quadraticCurveTo(10, 15, 19, 6); c.quadraticCurveTo(10, 10, 1, 6); c.closePath();
  c.fillStyle = gradL(c, 0, 6, 0, 12, [[0, '#eef2f6'], [1, '#8a939c']]); c.fill(); tratto(c, CONT, 0.9);
  for (const x of [2, 18]) { rrect(c, x - 1.8, 0.5, 3.6, 7, 1.5); c.fillStyle = '#b07a42'; c.fill(); tratto(c, CONT, 0.8); }
}
// la teglia nuova, fumante (il fumo lo fa la scena)
function tegliaNuova(c) {
  rrect(c, 0.5, 1, 39, 7, 1); c.fillStyle = '#5a5a60'; c.fill(); tratto(c, CONT, 0.9);
  rrect(c, 1.8, 1.8, 36.4, 5, 1); c.fillStyle = '#d8442e'; c.fill();
  const r = casuale(5);
  for (let i = 0; i < 20; i++) { ellisse(c, 3 + r() * 34, 2.6 + r() * 3.4, 1.4, 1); c.fillStyle = i % 4 ? '#fff6e0' : '#3a8a3a'; c.fill(); }
}
// il telefono degli ordini, sul muro
function telefono(c) {
  rrect(c, 1, 3, 12, 18, 2); c.fillStyle = gradL(c, 0, 3, 0, 21, [[0, '#efe6d2'], [1, '#cfc2a4']]); c.fill(); tratto(c, CONT, 1);
  rrect(c, -1, 0.5, 4, 17, 2); c.fillStyle = '#e8dcc2'; c.fill(); tratto(c, CONT, 0.9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { rrect(c, 5 + j * 2.5, 7 + i * 2.6, 1.8, 1.8, 0.4); c.fillStyle = '#7a7266'; c.fill(); }
  c.beginPath(); c.moveTo(1, 16); c.bezierCurveTo(-2, 22, 4, 24, 2, 28); tratto(c, '#3a3a40', 0.7);
}
// il bicchiere di birra sulla mensola, e la pozza quando si rovescia
function birra(c) {
  poli(c, [[1, 2], [7, 2], [6.4, 12], [1.6, 12]]); c.fillStyle = 'rgba(240,180,40,0.9)'; c.fill();
  ellisse(c, 4, 2.6, 3.6, 1.8); c.fillStyle = '#fffaf0'; c.fill();
  poli(c, [[1, 2], [7, 2], [6.4, 12], [1.6, 12]]); tratto(c, CONT, 0.8);
  c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(2.2, 4, 0.8, 7);
}
function pozza(c) {
  c.beginPath(); c.moveTo(2, 4); c.bezierCurveTo(3, 0.5, 12, 1, 15, 2); c.bezierCurveTo(22, 0.5, 27, 3, 26, 5); c.bezierCurveTo(24, 7.5, 14, 7, 9, 6.5); c.bezierCurveTo(5, 7.5, 1, 6, 2, 4); c.closePath();
  c.fillStyle = 'rgba(230,170,40,0.75)'; c.fill(); tratto(c, 'rgba(160,110,20,0.6)', 0.6);
  ellisse(c, 9, 3.5, 3, 0.8); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
}
// la cartellina del Giso, e la mazzetta di scontrini che ci si gonfia sopra
function cartellina(c) {
  rrect(c, 0.5, 2, 17, 23, 1.5); c.fillStyle = gradL(c, 0, 0, 18, 0, [[0, '#9a6a3a'], [1, '#c48a4a']]); c.fill(); tratto(c, CONT, 1);
  rrect(c, 2.5, 5, 13, 18, 0.5); c.fillStyle = '#fbfbf6'; c.fill();
  c.fillStyle = 'rgba(60,60,80,0.45)'; for (let y = 8; y < 22; y += 2.6) c.fillRect(4, y, 10, 0.7);
  rrect(c, 5, 0.5, 8, 4.5, 1); c.fillStyle = '#c8ccd4'; c.fill(); tratto(c, CONT, 0.8);
}
function mazzetta(c) {
  for (let i = 0; i < 5; i++) {
    rrect(c, 0.5 + (i % 2) * 1.2, 0.5 + i * 1.4, 14, 2.2, 0.5); c.fillStyle = i % 2 ? '#ffffff' : '#f2f0ea'; c.fill(); tratto(c, 'rgba(43,27,23,0.7)', 0.5);
  }
}
// le gocce di sudore (Michele beccato) e la nota musicale (Michele che fischietta)
function gocce(c) {
  for (const [x, y, k] of [[3, 6, 1], [10, 3.5, 0.75]]) {
    c.beginPath(); c.moveTo(x, y - 3.4 * k); c.bezierCurveTo(x + 2.4 * k, y, x + 1.8 * k, y + 2 * k, x, y + 2 * k); c.bezierCurveTo(x - 1.8 * k, y + 2 * k, x - 2.4 * k, y, x, y - 3.4 * k);
    c.fillStyle = '#7fd3ff'; c.fill(); tratto(c, '#3d8fc4', 0.6);
  }
}
function nota(c) {
  ellisse(c, 3, 9, 2.6, 2, -0.4); c.fillStyle = '#1f1430'; c.fill();
  c.beginPath(); c.moveTo(5.3, 8.6); c.lineTo(5.3, 1); c.quadraticCurveTo(8, 2.5, 7.6, 5.5); tratto(c, '#1f1430', 1.1);
}
// la mano di Michele sui tasti della cassa (il braccio sta dietro alla cassa)
function manoMichele(c) {
  rrect(c, 1, 2, 9, 7, 3); c.fillStyle = '#eab792'; c.fill(); tratto(c, CONT, 1);
  c.beginPath(); c.moveTo(3.4, 3); c.lineTo(3.4, 7); c.moveTo(5.6, 3); c.lineTo(5.6, 7.4); tratto(c, 'rgba(120,60,30,0.45)', 0.6);
  rrect(c, 7.5, 0.5, 3, 5.5, 1.5); c.fillStyle = '#eab792'; c.fill(); tratto(c, CONT, 0.9);
}
// lo scontrino finto di Michele: il volantino giallo della pizzeria (col trancio disegnato), che dà
// al posto dello scontrino. Si riconosce: è giallo e largo, lo scontrino è bianco e lungo
function volantino(c) {
  rrect(c, 0.5, 0.5, 13, 15, 1); c.fillStyle = gradL(c, 0, 0, 0, 16, [[0, '#ffe45a'], [1, '#f2b82a']]); c.fill(); tratto(c, CONT, 0.9);
  poli(c, [[3, 9], [11, 7], [7, 13.5]]); c.fillStyle = '#e8a24a'; c.fill(); tratto(c, 'rgba(43,27,23,0.7)', 0.6);
  for (const [x, y] of [[6.5, 9.4], [8.6, 9]]) { ellisse(c, x, y, 0.9, 0.9); c.fillStyle = '#c8282e'; c.fill(); }
  c.font = 'bold 3.2px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c8282e'; c.fillText('PIZZA!', 7, 3.6);
}
// la croce rossa sullo scontrino annullato (in mano al cliente)
function crocione(c) {
  for (const [a, b, d, e] of [[2, 2, 12, 12], [12, 2, 2, 12]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); tratto(c, '#ffffff', 4.4); tratto(c, '#e0242c', 2.6); }
}
// gli occhiali scuri del furbetto (un pezzo in più del cliente, sopra la faccia)
function occhialiFurbetto(c) {
  for (const s of [-1, 1]) { rrect(c, 20 + s * 6 - 4.5, 17.5, 9, 5.5, 2); c.fillStyle = '#16161c'; c.fill(); tratto(c, CONT, 0.9); }
  c.beginPath(); c.moveTo(18, 19.5); c.lineTo(22, 19.5); tratto(c, CONT, 1);
  ellisse(c, 15.5, 19, 1.2, 0.8); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill();
}
// la luce blu del lampeggiante, che entra dalla porta (i finanzieri sono arrivati)
function lampeggio(c) {
  c.fillStyle = gradR(c, 30, 60, 2, 60, [[0, 'rgba(90,150,255,0.85)'], [0.5, 'rgba(60,110,255,0.35)'], [1, 'rgba(60,110,255,0)']]);
  c.fillRect(0, 0, 60, 120);
}
// la multa
function multa(c) {
  rrect(c, 0.5, 0.5, 13, 17, 1); c.fillStyle = '#fff8e8'; c.fill(); tratto(c, CONT, 0.9);
  c.font = 'bold 3.6px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c8282e'; c.fillText('MULTA', 7, 4);
  c.fillStyle = 'rgba(60,60,80,0.5)'; for (let y = 7.5; y < 15; y += 2.2) c.fillRect(2.5, y, 9, 0.7);
  ellisse(c, 10, 14, 2.2, 2.2); tratto(c, 'rgba(200,40,46,0.8)', 0.7);
}

// ------------------------------------------------------------
//  I CLIENTI: pochi tipi generici a pezzi, bianchi e grigi, che la scena ricolora col tint
//  (gambe = i pantaloni, maglia = la maglietta, capelli = i capelli); la pelle (testa, collo e mani,
//  con la faccia) ha già il suo colore. Ogni pezzo è 40x84, coi piedi in basso al centro.
//  tipo 0 = snello, 1 = robusto
// ------------------------------------------------------------
export const CLIENTE = { w: 40, h: 84, mano: [15, -27] };   // (la mano destra rispetto ai piedi: lì tiene le cose)
export const TONI = ['#f2caa6', '#d9a07a', '#9a6440'];
const largo = (t) => (t ? 15.5 : 12.5);

function gambeCliente(c, t) {
  const w = t ? 9.5 : 8;
  for (const s of [-1, 1]) {
    const x = 20 + s * (t ? 6 : 5) - w / 2;
    rrect(c, x, 57, w, 23, 2.5); c.fillStyle = gradL(c, 0, 57, 0, 80, [[0, '#ffffff'], [1, '#c8c8c8']]); c.fill(); tratto(c, CONT, 1.1);
    rrect(c, x - (s < 0 ? 2 : 0), 78, w + 2, 5.5, [2.5, 2.5, 1.2, 1.2]); c.fillStyle = '#3a3a40'; c.fill(); tratto(c, CONT, 1.1);
  }
}
function magliaCliente(c, t) {
  const L = largo(t);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(20 + s * (L - 3), 37); c.lineTo(20 + s * (L + 2.5), 53); tratto(c, CONT, 7.6); tratto(c, '#f4f4f4', 5.3); }
  c.beginPath(); c.moveTo(20 - L, 45); c.quadraticCurveTo(20 - L, 34, 20 - L + 7, 33); c.lineTo(20 + L - 7, 33); c.quadraticCurveTo(20 + L, 34, 20 + L, 45);
  if (t) { c.quadraticCurveTo(20 + L + 3, 53, 20 + L - 1, 61); c.lineTo(20 - L + 1, 61); c.quadraticCurveTo(20 - L - 3, 53, 20 - L, 45); }
  else { c.lineTo(20 + L - 1, 61); c.lineTo(20 - L + 1, 61); }
  c.closePath();
  c.fillStyle = gradL(c, 0, 33, 0, 61, [[0, '#ffffff'], [1, '#cfcfcf']]); c.fill(); tratto(c, CONT, 1.2);
  c.beginPath(); c.moveTo(20 - L + 4, 52); c.quadraticCurveTo(20, 55, 20 + L - 4, 52); tratto(c, 'rgba(0,0,0,0.1)', 1.2);
}
function pelleCliente(c, t, tono) {
  const S = TONI[tono], L = largo(t);
  rrect(c, 16.5, 27, 7, 9, 2); c.fillStyle = scuro(S, 0.12); c.fill(); tratto(c, CONT, 1);
  for (const s of [-1, 1]) { ellisse(c, 20 + s * (L + 2.5), 56.5, 3.3, 3.3); c.fillStyle = S; c.fill(); tratto(c, CONT, 1); }
  for (const s of [-1, 1]) { ellisse(c, 20 + s * 14.4, 20.5, 2.6, 3.4); c.fillStyle = scuro(S, 0.05); c.fill(); tratto(c, CONT, 1); }
  ellisse(c, 20, 19, 14.5, 14); c.fillStyle = gradR(c, 16, 14, 2, 18, [[0, chiaro(S, 0.12)], [1, S]]); c.fill(); tratto(c, CONT, 1.3);
  for (const s of [-1, 1]) {
    ellisse(c, 20 + s * 5.6, 20.5, 1.9, 2.3); c.fillStyle = '#1f1430'; c.fill();
    ellisse(c, 20 + s * 5.6 - 0.6, 19.6, 0.6, 0.6); c.fillStyle = '#ffffff'; c.fill();
    c.beginPath(); c.moveTo(20 + s * 3.6, 15.6); c.lineTo(20 + s * 7.8, 15); tratto(c, scuro(S, 0.55), 1.1);
    ellisse(c, 20 + s * 8.6, 24.6, 2.4, 1.4); c.fillStyle = 'rgba(238,105,95,0.3)'; c.fill();
  }
  c.beginPath(); c.moveTo(19.2, 22); c.quadraticCurveTo(18.2, 24.4, 20.4, 24.4); tratto(c, scuro(S, 0.4), 0.8);
  c.beginPath(); c.moveTo(17, 27.4); c.quadraticCurveTo(20, 29.4, 23, 27.4); tratto(c, CONT, 1);
}
function capelliCliente(c, s) {
  const fill = () => { c.fillStyle = gradL(c, 0, 3, 0, 30, [[0, '#ffffff'], [1, '#bdbdbd']]); c.fill(); tratto(c, CONT, 1.1); };
  if (s === 0) {   // corti
    c.beginPath(); c.moveTo(5.4, 20); c.bezierCurveTo(4, 7, 12, 3.4, 20, 3.4); c.bezierCurveTo(28, 3.4, 36, 7, 34.6, 20);
    c.lineTo(32, 13); [[28, 11.5], [24, 13.5], [20, 11.5], [16, 13.5], [12, 11.5], [8.5, 13.5]].forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); fill();
  } else if (s === 1) {   // lunghi, che scendono ai lati del viso
    c.beginPath(); c.moveTo(4, 42); c.bezierCurveTo(1.5, 26, 3, 6, 20, 3.2); c.bezierCurveTo(37, 6, 38.5, 26, 36, 42); c.lineTo(31, 42);
    c.bezierCurveTo(33.5, 30, 33, 18, 29, 13); c.quadraticCurveTo(20, 16.5, 10.5, 12.5); c.bezierCurveTo(7, 18, 6.5, 30, 9, 42); c.closePath(); fill();
  } else if (s === 2) {   // ricci
    for (let k = 0; k < 11; k++) { const a = Math.PI * (0.92 + k * 0.116); ellisse(c, 20 + Math.cos(a) * 14, 18 + Math.sin(a) * 13.5, 4.4, 4.4); fill(); }
    ellisse(c, 20, 9, 11, 6); c.fillStyle = '#e8e8e8'; c.fill();
  } else {   // la coda
    c.beginPath(); c.moveTo(34, 12); c.bezierCurveTo(42, 14, 41, 28, 37, 36); c.bezierCurveTo(36, 28, 35, 20, 31, 16); c.closePath(); fill();
    c.beginPath(); c.moveTo(5.4, 19); c.bezierCurveTo(4, 7, 12, 3.4, 20, 3.4); c.bezierCurveTo(28, 3.4, 36, 7, 34.6, 19);
    c.quadraticCurveTo(26, 9, 20, 10); c.quadraticCurveTo(12, 10, 5.4, 19); c.closePath(); fill();
    rrect(c, 31, 10.5, 4.5, 4, 1.5); c.fillStyle = '#9a9a9a'; c.fill(); tratto(c, CONT, 0.8);
  }
}

export function creaPizzeria(scene) {
  tela(scene, 'bgPizzeria', 480, 270, sfondo);
  const B = PIZZERIA.banco;
  tela(scene, 'bancoPizzeria', B.w, B.h, banco);
  const P = PIZZERIA.porta;
  tela(scene, 'portaUscita', P.x1 - P.x0, P.y1 - P.y0, portaChiusa);
  tela(scene, 'portaUscitaAperta', 12, P.y1 - P.y0, portaAperta);
  tela(scene, 'scontrinoCarta', 10, 26, foglioScontrino, 6);
  tela(scene, 'trancio', 18, 13, trancio, 6);
  tela(scene, 'cartonePizza', 24, 10, cartone, 6);
  tela(scene, 'banconota', 14, 8, banconota, 7);
  tela(scene, 'mezzaluna', 20, 12, mezzalunaPiccola, 6);
  tela(scene, 'tegliaNuova', 40, 9, tegliaNuova, 5);
  tela(scene, 'telefonoMuro', 14, 29, (c) => { c.translate(1, 0); telefono(c); }, 6);
  tela(scene, 'birraBicchiere', 8, 13, birra, 7);
  tela(scene, 'pozzaBirra', 28, 8, pozza, 5);
  tela(scene, 'cartellina', 18, 26, cartellina, 6);
  tela(scene, 'mazzetta', 16, 8, mazzetta, 6);
  tela(scene, 'gocceSudore', 13, 9, gocce, 7);
  tela(scene, 'notaMusica', 9, 11, nota, 7);
  tela(scene, 'manoMichele', 11, 10, manoMichele, 7);
  tela(scene, 'volantino', 14, 16, volantino, 6);
  tela(scene, 'crocione', 14, 14, crocione, 6);
  tela(scene, 'lampeggio', 60, 120, lampeggio, 2);
  tela(scene, 'clOcchiali', 40, 84, occhialiFurbetto, 3);
  tela(scene, 'multa', 14, 18, multa, 6);
  for (const t of [0, 1]) {
    tela(scene, `clGambe${t}`, 40, 84, (c) => gambeCliente(c, t), 3);
    tela(scene, `clMaglia${t}`, 40, 84, (c) => magliaCliente(c, t), 3);
    for (const k of [0, 1, 2]) tela(scene, `clPelle${t}_${k}`, 40, 84, (c) => pelleCliente(c, t, k), 3);
  }
  for (const s of [0, 1, 2, 3]) tela(scene, `clCapelli${s}`, 40, 84, (c) => capelliCliente(c, s), 3);
}
