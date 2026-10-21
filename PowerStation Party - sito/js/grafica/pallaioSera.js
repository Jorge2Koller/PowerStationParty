// "Le Perle di Denny": il Pallaio di sera, la saletta dietro dove si gioca a carte. Il muro di mattoni,
// la boiserie, il frigo delle birre acceso, i poster, le bandierine, due sedie spaiate e, in fondo a
// sinistra, il tavolo da ping pong del Beer Pong. Scuro e caldo, poco carico: davanti ci sono i
// personaggi. Si disegna in una texture sola a bassa densità (così è morbido, come sfocato, e pesa
// poco: vedi ProverbiScene); le lampadine a filo e la lampada di Denny, che devono brillare, le
// disegna la scena sopra.
import { CONT, casuale, riemp, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alone } from './base.js';
import { FONT } from '../fx.js';

// il frigo delle birre: vetro acceso, tre ripiani di bottiglie, la scritta rossa in alto
function frigo(c, x, y, w, h, r) {
  rrect(c, x, y, w, h, 3); c.fillStyle = '#23262e'; c.fill(); tratto(c, CONT, 1.6);
  rrect(c, x + 4, y + 13, w - 8, h - 21, 2); c.fillStyle = gradL(c, 0, y + 13, 0, y + h - 8, [[0, '#e4f4ff'], [1, '#93bcdc']]); c.fill();
  const BOTT = ['#7a4a1a', '#2f7a3a', '#c9a83a', '#8a3020'];
  for (let i = 0; i < 4; i++) {
    const yy = y + 17 + (i * (h - 30)) / 4, hb = (h - 30) / 4 - 5;
    for (let bx = x + 7; bx < x + w - 9; bx += 6.5) {
      const col = BOTT[Math.floor(r() * BOTT.length)];
      rrect(c, bx, yy + hb * 0.35, 4.6, hb * 0.65, 1.2); riemp(c, col);
      c.fillStyle = col; c.fillRect(bx + 1.5, yy + hb * 0.12, 1.6, hb * 0.26);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(bx + 0.8, yy + hb * 0.45, 0.9, hb * 0.4);
    }
    c.fillStyle = 'rgba(70,90,110,0.7)'; c.fillRect(x + 5, yy + hb + 1, w - 10, 1.4);
  }
  c.fillStyle = 'rgba(255,255,255,0.22)'; poli(c, [[x + 8, y + 15], [x + 16, y + 15], [x + 9, y + h - 10], [x + 5, y + h - 10]]); c.fill();   // il riflesso sul vetro
  rrect(c, x + w - 7, y + h * 0.42, 2.4, 16, 1); riemp(c, '#9aa0aa');                                                                    // la maniglia
  rrect(c, x + 5, y + 3, w - 10, 8, 2); riemp(c, '#c8202e');
  c.fillStyle = '#fff6e0'; c.font = `600 6.4px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BIRRA', x + w / 2, y + 7.4);
  c.save(); c.globalCompositeOperation = 'lighter'; alone(c, x + w / 2, y + h * 0.5, w * 0.95, '#9fd4ff', 0.2); c.restore();
}

// un poster appeso storto, con lo scotch agli angoli
function poster(c, x, y, w, h, ang, fondo, disegno) {
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(ang);
  rrect(c, -w / 2, -h / 2, w, h, 1); riemp(c, fondo); tratto(c, 'rgba(0,0,0,0.5)', 1);
  disegno(c, w, h);
  c.fillStyle = 'rgba(240,230,200,0.55)';
  for (const [sx, sy] of [[-1, -1], [1, -1]]) { c.save(); c.translate(sx * w / 2, sy * h / 2); c.rotate(sx * 0.6); c.fillRect(-4, -1.5, 8, 3); c.restore(); }
  c.restore();
}
const scritta = (c, s, x, y, px, col) => { c.fillStyle = col; c.font = `600 ${px}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); };

// una sedia di plastica bianca (quelle del Pallaio) o di legno, vista di fronte; i piedi in (x, y)
function sedia(c, x, y, k, col, legno) {
  c.save(); c.translate(x, y); c.scale(k, k);
  const ombra = scuro(col, 0.25);
  for (const gx of [-17, 13]) { rrect(c, gx, -40, 4, 40, 1.5); riemp(c, ombra); tratto(c, CONT, 1.6); }
  if (legno) {
    for (const gx of [-19, 15]) { rrect(c, gx, -82, 4, 44, 1.5); riemp(c, col); tratto(c, CONT, 1.6); }
    for (const sy of [-80, -66]) { rrect(c, -19, sy, 38, 6, 1.5); riemp(c, chiaro(col, 0.08)); tratto(c, CONT, 1.4); }
  } else {
    rrect(c, -20, -78, 40, 38, 8); riemp(c, col); tratto(c, CONT, 1.8);
    for (const sx of [-11, -3, 5]) { rrect(c, sx, -71, 4, 24, 1.5); riemp(c, ombra); }
  }
  rrect(c, -23, -42, 46, 8, 3); riemp(c, chiaro(col, 0.1)); tratto(c, CONT, 1.8);
  c.restore();
}

// il tavolo da ping pong del Beer Pong, in fondo, al buio: il piano verde con le righe bianche e la rete
function pingPong(c, x0, x1, y) {
  for (const gx of [x0 + 8, x1 - 10]) { c.fillStyle = '#121216'; c.fillRect(gx, y + 6, 3, 30); }
  poli(c, [[x0, y + 6], [x1, y + 6], [x1 - 6, y], [x0 + 6, y]]); riemp(c, '#1d5a3c'); tratto(c, CONT, 1.4);
  c.fillStyle = '#0f3a26'; c.fillRect(x0, y + 6, x1 - x0, 3);
  c.beginPath(); c.moveTo(x0 + 7, y + 5); c.lineTo(x1 - 7, y + 5); c.moveTo((x0 + x1) / 2, y + 0.6); c.lineTo((x0 + x1) / 2, y + 5.6); tratto(c, 'rgba(255,255,255,0.7)', 0.8);
  rrect(c, (x0 + x1) / 2 - 1, y - 5, 2, 7, 0.6); riemp(c, '#e8e8e8');
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect((x0 + x1) / 2 - 18, y - 4.5, 36, 3.5);   // la rete
  // i bicchieri rossi del beer pong, rimasti lì
  for (const [bx, by] of [[x0 + 14, y + 1], [x0 + 19, y + 2.4], [x1 - 16, y + 1.6]]) { poli(c, [[bx - 2.6, by - 4.6], [bx + 2.6, by - 4.6], [bx + 1.9, by], [bx - 1.9, by]]); riemp(c, '#c8202e'); }
}

// la fila di bandierine, appesa tra due punti (pancia = quanto scende in mezzo)
function bandierine(c, x0, y0, x1, y1, pancia) {
  const COL = ['#d8263a', '#f3efe4', '#2f9a5a', '#ffd84a', '#3a7ad8'];
  const punto = (t) => ({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t + 4 * pancia * t * (1 - t) });
  c.beginPath(); for (let i = 0; i <= 24; i++) { const p = punto(i / 24); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); } tratto(c, '#1a1210', 0.8);
  const n = Math.round((x1 - x0) / 12);
  for (let i = 0; i < n; i++) {
    const a = punto((i + 0.15) / n), b = punto((i + 0.85) / n);
    poli(c, [[a.x, a.y], [b.x, b.y], [(a.x + b.x) / 2, (a.y + b.y) / 2 + 10]]); riemp(c, COL[i % COL.length]); tratto(c, 'rgba(0,0,0,0.35)', 0.6);
  }
}

export function sfondoSera(c) {
  const r = casuale(717);
  // il muro di mattoni
  c.fillStyle = '#24130f'; c.fillRect(0, 0, 480, 160);
  for (let y = 0, riga = 0; y < 116; y += 8, riga++) for (let x = -(riga % 2) * 8; x < 480; x += 16) {
    rrect(c, x + 0.8, y + 0.8, 14.4, 6.4, 1.2); c.fillStyle = ['#5c2d22', '#4f261d', '#663428', '#46211a', '#57291f'][Math.floor(r() * 5)]; c.fill();
  }
  // la boiserie di legno, col listello
  c.fillStyle = gradL(c, 0, 116, 0, 158, [[0, '#4a2c1a'], [1, '#2a170d']]); c.fillRect(0, 116, 480, 42);
  for (let x = 6; x < 480; x += 14) { c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(x, 120, 1.2, 38); c.fillStyle = 'rgba(255,200,140,0.06)'; c.fillRect(x + 1.2, 120, 1, 38); }
  c.fillStyle = '#6a4024'; c.fillRect(0, 113, 480, 5); c.fillStyle = 'rgba(255,220,170,0.15)'; c.fillRect(0, 113, 480, 1.2);
  // il pavimento di legno, verso il fondo
  c.fillStyle = gradL(c, 0, 158, 0, 270, [[0, '#2e1d15'], [1, '#140b08']]); c.fillRect(0, 158, 480, 112);
  for (let i = -9; i <= 9; i++) { c.beginPath(); c.moveTo(240 + i * 14, 158); c.lineTo(240 + i * 66, 270); tratto(c, 'rgba(0,0,0,0.28)', 1); }
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 156, 480, 3);
  // i poster, a destra di Denny
  poster(c, 282, 50, 40, 52, -0.05, '#1f3f8a', (k, w, h) => {
    scritta(k, 'BEER', 0, -h / 2 + 8, 7, '#ffe14a'); scritta(k, 'PONG', 0, -h / 2 + 15, 7, '#ffe14a');
    for (const [bx, by] of [[-9, 12], [0, 12], [9, 12], [-4.5, 5], [4.5, 5], [0, -2]]) { poli(k, [[bx - 3.6, by - 6], [bx + 3.6, by - 6], [bx + 2.6, by], [bx - 2.6, by]]); riemp(k, '#d8263a'); }
    ellisse(k, 11, -6, 2.4, 2.4); riemp(k, '#ffffff');
  });
  poster(c, 336, 64, 36, 46, 0.07, '#e8b832', (k, w, h) => {
    scritta(k, 'KARAOKE', 0, -h / 2 + 7, 5.6, '#3a1a10'); scritta(k, 'GIOVEDÌ', 0, h / 2 - 6, 5.2, '#3a1a10');
    ellisse(k, 0, -3, 5.5, 6.5); riemp(k, '#3a1a10'); k.fillStyle = '#3a1a10'; k.fillRect(-1.4, 2, 2.8, 11);
  });
  // le bandierine sopra Denny
  bandierine(c, 196, 30, 400, 32, 8);
  // il frigo delle birre, nell'angolo a destra
  frigo(c, 408, 46, 62, 112, r);
  // due sedie spaiate contro il muro, ai lati di Denny, e il ping pong in fondo a sinistra
  sedia(c, 194, 158, 0.62, '#f2f0ea', false);
  sedia(c, 288, 158, 0.62, '#8a5a2c', true);
  pingPong(c, -12, 82, 124);
  // la luce: calda in mezzo (la lampada di Denny), buio ai lati
  c.fillStyle = gradR(c, 240, 96, 20, 330, [[0, 'rgba(255,190,110,0.16)'], [0.45, 'rgba(20,10,24,0.22)'], [1, 'rgba(8,4,12,0.72)']]); c.fillRect(0, 0, 480, 270);
}
