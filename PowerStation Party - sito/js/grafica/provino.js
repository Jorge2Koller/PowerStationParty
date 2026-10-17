// "Provini a X-Factor": il palco di un talent show televisivo INVENTATO (luci, muro di led, una
// grande X luminosa di fantasia: non è il logo di nessun programma vero), il tavolo dei giudici,
// il pubblico al buio con gli accendini. La console coi pad la disegna XfactorScene; i giudici e i
// cantanti sono in personaggi.js.
import { tela, CONT, casuale, riemp, tratto, ellisse, rrect, poli, gradL, gradR, alfa, alone } from './base.js';

// dove stanno le cose sul palco (unità di schermo): le usa XfactorScene
export const PROVINO = {
  pavimento: 200,                       // dove comincia il pavimento del palco
  piedi: 214,                           // i piedi dei cantanti e di chi suona
  cantanti: [58, 422],                  // Tini a sinistra, Oli a destra
  io: 240,                              // chi suona i pad, al centro, dietro la console
  x: { cx: 240, cy: 156, r: 44 },       // la grande X
  banco: { x: 240, y: 238, w: 340, h: 26 },
  giudici: [112, 190, 290, 368],        // i quattro posti al tavolo (in mezzo resta libera la vista sulla console)
  lucine: 247,                          // l'altezza delle lucine sul tavolo
};

function sfondo(c) {
  const rnd = casuale(9091), X = PROVINO.x, P = PROVINO.pavimento;
  // il fondale
  c.fillStyle = gradL(c, 0, 0, 0, 270, [[0, '#130a2c'], [0.55, '#28114e'], [1, '#07040f']]); c.fillRect(0, 0, 480, 270);
  // il muro di led: tanti riquadri, alcuni accesi
  for (let x = 44; x < 436; x += 14) for (let y = 22; y < P - 2; y += 12) {
    const k = rnd();
    c.fillStyle = k < 0.14 ? 'rgba(120,80,255,0.34)' : k < 0.24 ? 'rgba(58,224,255,0.2)' : k < 0.3 ? 'rgba(255,79,184,0.2)' : 'rgba(70,40,130,0.22)';
    c.fillRect(x, y, 12.4, 10.4);
  }
  alone(c, X.cx, X.cy, 130, '#7a3aff', 0.38);
  // le quinte ai lati, a pieghe
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const x0 = s < 0 ? i * 11 : 480 - (i + 1) * 11;
    c.fillStyle = gradL(c, x0, 0, x0 + 11, 0, [[0, '#3a0c22'], [0.5, '#6a1836'], [1, '#2a0818']]); c.fillRect(x0, 0, 11, P + 6);
  }
  // l'americana con i fari
  c.fillStyle = '#1b1b24'; c.fillRect(0, 6, 480, 9);
  for (let x = 4; x < 480; x += 12) { c.beginPath(); c.moveTo(x, 6.5); c.lineTo(x + 6, 14.5); c.lineTo(x + 12, 6.5); tratto(c, '#3c3c4a', 0.8); }
  c.strokeStyle = '#3c3c4a'; c.lineWidth = 1; c.strokeRect(-1, 6, 482, 9);
  ['#3ae0ff', '#ff4fb8', '#ffe14a', '#7dff9a', '#ff4fb8', '#3ae0ff'].forEach((col, i) => {
    const x = 60 + i * 72;
    poli(c, [[x - 5, 15], [x + 5, 15], [x + 7, 25], [x - 7, 25]]); riemp(c, '#22222c'); tratto(c, CONT, 1);
    ellisse(c, x, 26, 6, 2.6); riemp(c, col); alone(c, x, 28, 16, col, 0.5);
  });

  // la grande X luminosa (inventata): un cerchio di lampadine e due tubi al neon incrociati
  ellisse(c, X.cx, X.cy, X.r + 5, X.r + 5); riemp(c, 'rgba(10,6,24,0.72)'); tratto(c, '#f6c63a', 2.4);
  ellisse(c, X.cx, X.cy, X.r + 5, X.r + 5); tratto(c, CONT, 0.8);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2, x = X.cx + Math.cos(a) * (X.r + 5), y = X.cy + Math.sin(a) * (X.r + 5);
    alone(c, x, y, 5, '#fff3b0', 0.6); ellisse(c, x, y, 1.7, 1.7); riemp(c, i % 2 ? '#fff8d8' : '#ffd24a');
  }
  const tubo = (sx, col) => {
    const d = X.r * 0.66, via = () => { c.beginPath(); c.moveTo(X.cx - sx * d, X.cy - d); c.lineTo(X.cx + sx * d, X.cy + d); };
    via(); tratto(c, alfa(col, 0.22), 17); via(); tratto(c, alfa(col, 0.5), 10); via(); tratto(c, col, 6); via(); tratto(c, '#ffffff', 2);
  };
  tubo(1, '#3ae0ff'); tubo(-1, '#ff4fb8');
  for (const [dx, dy, r] of [[-58, -34, 3], [60, -30, 2.4], [-62, 22, 2.2], [57, 28, 3]]) {
    c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.4 : r * 1.6; c.lineTo(X.cx + dx + Math.cos(a) * rr, X.cy + dy + Math.sin(a) * rr); } c.closePath(); riemp(c, '#fff8d8');
  }

  // il pavimento del palco, lucido: riflette la X e i fari
  c.fillStyle = gradL(c, 0, P, 0, 240, [[0, '#3a2468'], [1, '#150c2c']]); c.fillRect(0, P, 480, 40);
  c.save(); c.beginPath(); c.rect(0, P, 480, 40); c.clip();
  for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(240 + i * 22, P); c.lineTo(240 + i * 64, 242); tratto(c, 'rgba(160,120,255,0.13)', 0.8); }
  for (const y of [P + 5, P + 13, P + 25]) { c.beginPath(); c.moveTo(0, y); c.lineTo(480, y); tratto(c, 'rgba(160,120,255,0.1)', 0.7); }
  alone(c, 222, P + 14, 46, '#ff4fb8', 0.3); alone(c, 258, P + 14, 46, '#3ae0ff', 0.3);
  c.restore();
  c.fillStyle = '#0c0718'; c.fillRect(0, 238, 480, 32);
  c.fillStyle = '#5a3aa8'; c.fillRect(0, P - 0.6, 480, 1.2);
  for (let x = 6; x < 480; x += 13) { ellisse(c, x, 239.5, 1.3, 1.3); riemp(c, x % 2 ? '#ffe14a' : '#fff8d8'); }
}

// il tavolo dei giudici: il piano e il frontale, con una striscia di luce
function banco(c) {
  const B = PROVINO.banco;
  poli(c, [[6, 8], [B.w - 6, 8], [B.w - 1, 14], [1, 14]]); riemp(c, gradL(c, 0, 8, 0, 14, [[0, '#3a3350'], [1, '#262038']])); tratto(c, CONT, 1.2);
  rrect(c, 1, 14, B.w - 2, B.h - 14, [0, 0, 4, 4]); riemp(c, gradL(c, 0, 14, 0, B.h, [[0, '#191326'], [1, '#0d0916']])); tratto(c, CONT, 1.2);
  c.fillStyle = '#7a3aff'; c.fillRect(4, 16.5, B.w - 8, 1.4);
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(8, 9.2, B.w - 16, 1);
}

// il pubblico al buio: teste e spalle in controluce
function pubblico(c) {
  const rnd = casuale(733);
  for (let i = 0; i < 21; i++) {
    const x = i * 24 + rnd() * 10 - 4, y = 12 + rnd() * 5, r = 6 + rnd() * 2;
    ellisse(c, x, y + r + 7, r * 1.9, r * 1.2); riemp(c, '#05030b');
    ellisse(c, x, y, r, r * 1.08); riemp(c, '#07040f');
    c.beginPath(); c.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.9); tratto(c, 'rgba(150,110,255,0.4)', 0.9);
  }
}

// un accendino acceso, tenuto in alto
function accendino(c) {
  c.fillStyle = '#05030b'; rrect(c, 2.6, 9, 3.8, 9, 1.6); c.fill();
  rrect(c, 3.3, 6.4, 2.4, 3.6, 0.6); riemp(c, '#c9cdd6');
  alone(c, 4.5, 3.4, 5, '#ffd24a', 0.75);
  c.beginPath(); c.moveTo(4.5, 0.6); c.quadraticCurveTo(7.2, 4, 4.5, 6.4); c.quadraticCurveTo(1.8, 4, 4.5, 0.6); c.closePath();
  riemp(c, gradL(c, 0, 0, 0, 6.4, [[0, '#fff8c0'], [1, '#ff9a2e']]));
}

export function creaProvino(scene) {
  const B = PROVINO.banco;
  tela(scene, 'bgProvino', 480, 270, sfondo);
  tela(scene, 'bancoGiudici', B.w, B.h, banco);
  tela(scene, 'pubblicoProvino', 480, 26, pubblico);
  tela(scene, 'accendino', 9, 18, accendino, 8);
}
