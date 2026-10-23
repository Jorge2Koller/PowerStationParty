// "Capitan Ghiori": il golfo di Baratti in una giornata grigia, visto di lato dall'acqua bassa vicino a
// riva. Il cielo coperto, le colline con la pineta, le case in fondo, l'acqua calma; il Danda 2 (il
// gommone di Giorgio) in due pezzi, quello dietro e quello davanti a chi ci sta sopra; i barchini
// ormeggiati (pochi tipi, ricolorati dalla scena) e la riva di ciottoli, che scorre. Tutto disegnato
// col codice: le foto erano solo un riferimento. Le texture le crea il microgioco e le butta alla fine.
import { CONT, casuale, riemp, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alfa } from './base.js';
import { FONT } from '../fx.js';

// il gommone: la texture è 270x120 unità; la linea dell'acqua è a y 104 (lo scafo resta quasi tutto
// sotto: fuori c'è il tubolare), il ponte a y 70; la maniglia della cordicella sul motore (vedi BarattiScene)
export const GOMMONE = { w: 270, h: 120, acqua: 104, ponte: 70, maniglia: { x: 30, y: 57 } };
const GRIGIO = '#a9afb6', GRIGIO_S = '#7b8189', SCAFO = '#3e434a';

// lo sfondo: cielo, nuvole, colline con la pineta, le case, l'acqua del golfo (480x270)
export function sfondoBaratti(c) {
  const r = casuale(1907);
  c.fillStyle = gradL(c, 0, 0, 0, 120, [[0, '#9aa3ad'], [0.6, '#c3c9cf'], [1, '#d5d9dc']]); c.fillRect(0, 0, 480, 124);
  // le nuvole: banchi grigi, morbidi
  for (let i = 0; i < 26; i++) {
    const x = r() * 520 - 20, y = 8 + r() * 70, w = 40 + r() * 70;
    ellisse(c, x, y, w, 6 + r() * 9); c.fillStyle = alfa(i % 3 ? '#e4e7ea' : '#8e979f', 0.35 + r() * 0.25); c.fill();
  }
  // le colline lontane e la pineta, scura, col profilo a ombrello dei pini
  c.beginPath(); c.moveTo(0, 112);
  for (let x = 0; x <= 480; x += 12) c.lineTo(x, 104 - Math.sin(x / 70) * 6 - Math.sin(x / 23) * 2);
  c.lineTo(480, 120); c.lineTo(0, 120); c.closePath(); riemp(c, '#7d8a86');
  c.beginPath(); c.moveTo(0, 120);
  for (let x = 0; x <= 480; x += 6) c.lineTo(x, 111 - Math.abs(Math.sin(x / 9 + r())) * 5 - (x > 300 ? 3 : 0));
  c.lineTo(480, 126); c.lineTo(0, 126); c.closePath(); riemp(c, '#3f5245');
  for (let i = 0; i < 30; i++) { const x = r() * 480, y = 108 + r() * 6; ellisse(c, x, y, 7 + r() * 6, 3 + r() * 2); riemp(c, i % 2 ? '#34463a' : '#4a5e4f'); }
  // le case in fondo a destra, sulla riva
  for (const [x, w, h, col] of [[392, 18, 9, '#d8cbb8'], [412, 12, 7, '#c9b49a'], [428, 22, 10, '#e2d6c2']]) {
    c.fillStyle = col; c.fillRect(x, 120 - h, w, h);
    poli(c, [[x - 1, 120 - h], [x + w + 1, 120 - h], [x + w / 2, 120 - h - 4]]); riemp(c, '#9a5a40');
    c.fillStyle = '#6a6f74'; c.fillRect(x + 3, 122 - h + 3, 2, 2.4); if (w > 14) c.fillRect(x + w - 6, 122 - h + 3, 2, 2.4);
  }
  // la riva lontana e il muretto del porticciolo
  c.fillStyle = '#8a8478'; c.fillRect(0, 124, 480, 3);
  c.fillStyle = '#a7a297'; c.fillRect(300, 121, 180, 5); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(300, 125, 180, 1);
  // l'acqua: limpida, turchese, più chiara lontano (ci si specchia il cielo) e verso riva (l'acqua è
  // bassa e si vede il fondo); più intensa in mezzo
  c.fillStyle = gradL(c, 0, 127, 0, 270, [[0, '#a6d6da'], [0.1, '#72c2ca'], [0.42, '#38a6b2'], [0.72, '#3fb2b2'], [1, '#86d4c4']]); c.fillRect(0, 127, 480, 143);
  // il fondale che si vede attraverso l'acqua, sempre più nitido verso riva: sabbia chiara e sassi
  c.save(); c.beginPath(); c.rect(0, 168, 480, 102); c.clip();
  const FONDO = ['#e4dcb4', '#cfc49c', '#a9b8a4', '#93a89c', '#d9c9a0', '#7f9a92'];
  for (let i = 0; i < 160; i++) {
    const y = 170 + r() ** 0.75 * 100, k = (y - 168) / 102, rx = 1.5 + k * 5 * (0.5 + r());
    ellisse(c, r() * 480, y, rx, rx * (0.45 + r() * 0.2), r() * 0.4 - 0.2); c.fillStyle = alfa(FONDO[Math.floor(r() * FONDO.length)], 0.06 + k * 0.3); c.fill();
  }
  // la luce che balla sul fondo (le caustiche): una rete di righe chiare e mosse
  for (let y = 176; y < 270; y += 6.5) {
    const k = (y - 168) / 102, f = r() * 6;
    c.beginPath();
    for (let x = -4; x <= 484; x += 6) { const yy = y + Math.sin(x / 11 + f) * 1.6 + Math.sin(x / 4.3 + f * 2) * 0.7; x < 0 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
    tratto(c, `rgba(230,255,248,${0.05 + k * 0.2})`, 0.6 + k * 0.5);
  }
  c.restore();
  // i riflessi del cielo sulla superficie: righe chiare, lunghe e sottili lontano, corte vicino
  for (let i = 0; i < 90; i++) {
    const y = 129 + r() ** 1.5 * 125, k = (y - 127) / 143, w = 30 - k * 20 + r() * 14;
    c.fillStyle = alfa(r() < 0.7 ? '#eafcff' : '#2c8e9a', 0.22 + r() * 0.3); c.fillRect(r() * 480, y, w, 0.6 + k * 0.9);
  }
  // qualche luccichio
  for (let i = 0; i < 36; i++) {
    const x = r() * 480, y = 132 + r() ** 1.3 * 110, s = 0.6 + r() * 1.2;
    c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(x - s * 1.6, y - 0.3, s * 3.2, 0.6); c.fillRect(x - 0.3, y - s, 0.6, s * 2);
  }
  // un filo di foschia sull'orizzonte
  c.fillStyle = gradL(c, 0, 127, 0, 146, [[0, 'rgba(214,234,236,0.55)'], [1, 'rgba(214,234,236,0)']]); c.fillRect(0, 127, 480, 19);
}

// la riva di ciottoli e sabbia scura (in primo piano, in basso), che si ripete: 160x40 unità. I sassi
// che escono da un lato rientrano dall'altro, così la striscia scorre senza giunte
export function rivaBaratti(c) {
  const r = casuale(2207), W = 160;
  c.fillStyle = gradL(c, 0, 0, 0, 40, [[0, '#6e6457'], [1, '#4c443b']]); c.fillRect(0, 4, W, 36);
  // il bordo bagnato, verso l'acqua
  c.fillStyle = 'rgba(60,70,72,0.55)'; c.fillRect(0, 2, W, 4);
  const COL = ['#8f8f8a', '#a29d93', '#6f6b66', '#b58a6e', '#7c7f80', '#9a8f80', '#585654'];
  for (let i = 0; i < 120; i++) {
    const x = r() * W, y = 6 + r() ** 0.8 * 34, rx = 1.6 + r() * 3.6 * (0.6 + y / 40), ry = rx * (0.55 + r() * 0.2), col = COL[Math.floor(r() * COL.length)];
    for (const dx of [-W, 0, W]) {
      ellisse(c, x + dx, y, rx, ry, r() * 0.6 - 0.3); riemp(c, col); tratto(c, 'rgba(30,26,22,0.6)', 0.5);
      ellisse(c, x + dx - rx * 0.3, y - ry * 0.35, rx * 0.4, ry * 0.3); riemp(c, 'rgba(255,255,255,0.18)');
    }
  }
}

// --- il Danda 2, di lato, con la prua a destra ---
// il tubolare vicino (quello che si vede tutto): dalla poppa (a sinistra) alla prua che si alza
function tubolare(c, dy, scuroK) {
  c.beginPath(); c.moveTo(26, 74 + dy);
  c.bezierCurveTo(26, 66 + dy, 30, 63 + dy, 40, 63 + dy);
  c.lineTo(214, 60 + dy);
  c.bezierCurveTo(248, 58 + dy, 266, 54 + dy, 267, 66 + dy);
  c.bezierCurveTo(268, 80 + dy, 252, 90 + dy, 222, 92 + dy);
  c.lineTo(40, 94 + dy);
  c.bezierCurveTo(30, 94 + dy, 26, 86 + dy, 26, 74 + dy);
  c.closePath();
  if (scuroK) { riemp(c, scuro(GRIGIO, scuroK)); tratto(c, CONT, 2); }
}

// quello che sta dietro a chi è sul gommone: il tubolare lontano, il ponte, il roll-bar d'acciaio con la
// scaletta, il sedile bianco, la consolle col volante e il parabrezza, il fuoribordo nero (niente marchi)
export function gommoneDietro(c) {
  // il tubolare lontano (se ne vede la cima, sopra quello vicino) e il ponte
  tubolare(c, -8, 0.22);
  c.fillStyle = '#4a4f57'; c.fillRect(36, 60, 200, 8);
  // il roll-bar: due archi di tubo d'acciaio con la scaletta
  const tubo = (pts, w = 4) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); tratto(c, CONT, w + 2); tratto(c, '#d6dbe0', w); tratto(c, 'rgba(255,255,255,0.6)', w * 0.3); };
  tubo([[38, 66], [40, 8], [70, 4], [74, 64]]);
  tubo([[46, 66], [50, 14], [66, 12], [68, 64]], 2.6);
  for (let y = 16; y < 60; y += 9) tubo([[41, y + 1], [49, y]], 2.2);
  // il sedile bianco, con lo schienale
  rrect(c, 92, 44, 26, 20, 4); riemp(c, '#f2f2ee'); tratto(c, CONT, 1.8);
  rrect(c, 90, 28, 8, 30, 3); riemp(c, '#e8e8e2'); tratto(c, CONT, 1.8);
  c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(93, 56, 24, 3);
  // la consolle bianca, col volante e il parabrezza
  poli(c, [[124, 66], [124, 34], [130, 28], [156, 28], [160, 34], [160, 66]]); c.fillStyle = gradL(c, 124, 0, 160, 0, [[0, '#ffffff'], [1, '#d9dcdf']]); c.fill(); tratto(c, CONT, 1.8);
  c.fillStyle = '#2a2e34'; c.fillRect(132, 34, 20, 6);                                   // il cruscotto
  ellisse(c, 124, 38, 3, 9, 0.2); tratto(c, '#222428', 2.6);                             // il volante, di taglio
  c.fillStyle = '#222428'; c.fillRect(124, 37, 5, 2);
  poli(c, [[131, 28], [138, 14], [155, 14], [157, 28]]); c.fillStyle = 'rgba(150,118,92,0.42)'; c.fill(); tratto(c, CONT, 1.3);   // il parabrezza fumé
  c.beginPath(); c.moveTo(136, 14); c.lineTo(133, 26); tratto(c, 'rgba(255,255,255,0.45)', 1.2);
  // il fuoribordo nero, a poppa: la calotta, il gambo nell'acqua e la piastra (nessun marchio)
  rrect(c, 12, 70, 7, 42, 2); c.fillStyle = gradL(c, 12, 0, 19, 0, [[0, '#1b1c20'], [1, '#34363c']]); c.fill(); tratto(c, CONT, 1.4);
  rrect(c, 7, 103, 17, 4, 1.5); riemp(c, '#26272c'); tratto(c, CONT, 1.1);
  c.beginPath(); c.moveTo(4, 66); c.bezierCurveTo(2, 52, 7, 45, 17, 45); c.bezierCurveTo(28, 45, 32, 53, 31, 62); c.bezierCurveTo(30, 70, 25, 74, 16, 74); c.bezierCurveTo(8, 74, 4, 72, 4, 66); c.closePath();
  c.fillStyle = gradR(c, 13, 52, 2, 22, [[0, '#4a4c54'], [0.5, '#22242a'], [1, '#121317']]); c.fill(); tratto(c, CONT, 1.8);
  c.beginPath(); c.moveTo(7, 65); c.quadraticCurveTo(18, 69, 29, 63); tratto(c, 'rgba(255,255,255,0.12)', 1.2);
  ellisse(c, 12, 52, 3, 4.5, -0.3); riemp(c, 'rgba(255,255,255,0.14)');
  // la maniglia della cordicella, sul davanti della calotta
  rrect(c, 28, 55, 6, 4, 1.5); riemp(c, '#c8202e'); tratto(c, CONT, 1);
}

// quello che sta davanti: il tubolare vicino (grigio, con la fascia più scura), lo scafo grigio scuro
// sotto, e il nome DANDA 2 in nero sulla prua
export function gommoneDavanti(c) {
  // lo scafo, a V, che scende sotto il pelo dell'acqua
  c.beginPath(); c.moveTo(34, 90); c.lineTo(232, 88); c.quadraticCurveTo(262, 86, 262, 76); c.lineTo(258, 92); c.quadraticCurveTo(242, 110, 204, 114); c.lineTo(46, 114); c.quadraticCurveTo(32, 108, 34, 90); c.closePath();
  c.fillStyle = gradL(c, 0, 88, 0, 114, [[0, '#575d65'], [1, SCAFO]]); c.fill(); tratto(c, CONT, 2);
  // il tubolare: grigio, la fascia scura lungo il fianco, la luce sopra
  tubolare(c, 0, 0);
  c.fillStyle = gradL(c, 0, 58, 0, 94, [[0, chiaro(GRIGIO, 0.2)], [0.45, GRIGIO], [1, scuro(GRIGIO, 0.22)]]); c.fill();
  c.save(); tubolare(c, 0, 0); c.clip();
  c.beginPath(); c.moveTo(20, 81); c.lineTo(222, 79); c.bezierCurveTo(250, 78, 262, 74, 270, 70); c.lineTo(270, 77); c.bezierCurveTo(262, 81, 250, 85, 222, 86); c.lineTo(20, 88); c.closePath(); riemp(c, GRIGIO_S);
  c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(30, 64, 190, 2.4);
  // le maniglie di corda e le giunture del tubolare
  c.beginPath(); c.moveTo(44, 68.5);
  for (const x of [80, 120, 160, 200]) c.quadraticCurveTo(x - 20, 70.5, x, 67.5 - (x - 44) * 0.012);
  tratto(c, '#2a2c30', 1.3);
  for (const x of [44, 80, 120, 160, 200]) { rrect(c, x - 2.5, 66 - (x - 44) * 0.012, 5, 3.4, 1); riemp(c, '#5d636b'); }
  for (const x of [96, 196]) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x, 60, 1.4, 34); }
  c.restore();
  tubolare(c, 0, 0); tratto(c, CONT, 2.2);
  // il nome, in nero, sulla prua
  c.save(); c.translate(228, 73); c.rotate(-0.04);
  c.fillStyle = '#16171a'; c.font = `700 9px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DANDA 2', 0, 0);
  c.restore();
}

// --- i barchini ormeggiati, di lato (prua a destra), bianchi: la scena li ricolora (setTint) ---
// tipo 'barchino' (aperto, col fuoribordo), 'motoscafo' (la cabina col vetro), 'gozzo' (di legno, la
// prua alta); banda = la fascia colorata sul fianco (il barchino rosso e bianco). Sono larghi 80, alti 40
// unità, con la linea dell'acqua a y 32
export const BARCHINO = { w: 80, h: 40, acqua: 32 };
export function barchino(c, tipo, banda) {
  const scafo = () => {
    c.beginPath();
    if (tipo === 'gozzo') { c.moveTo(6, 18); c.quadraticCurveTo(40, 22, 74, 10); c.quadraticCurveTo(70, 30, 52, 35); c.lineTo(18, 35); c.quadraticCurveTo(6, 30, 6, 18); }
    else { c.moveTo(8, 20); c.lineTo(70, 19); c.quadraticCurveTo(77, 18, 76, 14); c.lineTo(74, 22); c.quadraticCurveTo(66, 33, 50, 35); c.lineTo(14, 35); c.quadraticCurveTo(8, 30, 8, 20); }
    c.closePath();
  };
  scafo(); c.fillStyle = gradL(c, 0, 14, 0, 35, [[0, '#ffffff'], [1, '#c9ced2']]); c.fill();
  if (banda) { c.save(); scafo(); c.clip(); c.fillStyle = banda; c.fillRect(0, 24, 80, 5); c.restore(); }
  scafo(); tratto(c, CONT, 1.4);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(10, 30, 50, 1.4);
  if (tipo === 'motoscafo') {
    poli(c, [[30, 19], [34, 8], [52, 8], [56, 19]]); c.fillStyle = '#eef0f2'; c.fill(); tratto(c, CONT, 1.2);
    poli(c, [[44, 9], [52, 9], [55, 17], [46, 17]]); c.fillStyle = '#5a7088'; c.fill();
  }
  if (tipo === 'barchino') { rrect(c, 30, 12, 8, 8, 1.5); c.fillStyle = '#e8eaec'; c.fill(); tratto(c, CONT, 1); }
  if (tipo !== 'gozzo') {
    // il fuoribordo, a poppa
    rrect(c, 2, 9, 8, 11, 2.5); riemp(c, '#2a2c32'); tratto(c, CONT, 1);
    c.fillStyle = '#2a2c32'; c.fillRect(4.5, 20, 3, 14);
  } else { c.fillStyle = '#8a6a44'; c.fillRect(12, 16, 54, 2.4); }
}
