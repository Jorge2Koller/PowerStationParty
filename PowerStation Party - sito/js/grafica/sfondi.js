// Sfondi dei microgiochi, disegnati in unità logiche (480x270).
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alone, casuale } from './base.js';

// ------------------------------------------------------------
//  POWERSTATION: pub in stile irlandese, ma chiaramente in Italia
// ------------------------------------------------------------
function bottiglia(c, x, y, h, col, larga) {
  const w = larga ? 6.5 : 5;
  const vetro = gradL(c, x, 0, x + w, 0, [[0, scuro(col, 0.4)], [0.3, chiaro(col, 0.3)], [0.6, col], [1, scuro(col, 0.45)]]);
  rrect(c, x + w / 2 - 1.1, y - h - 5, 2.2, 7, 0.7); c.fillStyle = vetro; c.fill();
  rrect(c, x, y - h, w, h, [2, 2, 0.6, 0.6]); c.fillStyle = vetro; c.fill();
  c.fillStyle = '#d8b24a'; c.fillRect(x + w / 2 - 1.3, y - h - 6, 2.6, 1.6);
  rrect(c, x + 0.5, y - h * 0.62, w - 1, h * 0.32, 0.5); c.fillStyle = '#f6eeda'; c.fill();
  c.fillStyle = scuro(col, 0.2); c.fillRect(x + 1, y - h * 0.5, w - 2, 0.8);
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x + 0.9, y - h + 1.5, 0.7, h - 3);
}

function sfondoPub(c) {
  const r = casuale(77);
  // parete bordeaux con motivo damascato
  c.fillStyle = gradL(c, 0, 0, 0, 120, [[0, '#35121a'], [1, '#5c2129']]); c.fillRect(0, 0, 480, 120);
  c.globalAlpha = 0.07;
  for (let y = 6; y < 116; y += 12) for (let x = (y / 12) % 2 ? 6 : 14; x < 480; x += 16) {
    poli(c, [[x, y - 4], [x + 3, y], [x, y + 4], [x - 3, y]]); c.fillStyle = '#ffd9a0'; c.fill();
  }
  c.globalAlpha = 1;
  // boiserie
  c.fillStyle = gradL(c, 0, 112, 0, 180, [[0, '#3e2414'], [1, '#22120a']]); c.fillRect(0, 112, 480, 70);
  for (let x = 2; x < 480; x += 40) {
    rrect(c, x + 3, 124, 34, 44, 2); c.fillStyle = gradL(c, 0, 124, 0, 168, [[0, '#4a2c18'], [1, '#2e1a0e']]); c.fill();
    tratto(c, '#1a0d06', 0.8);
    c.beginPath(); c.moveTo(x + 4, 167); c.lineTo(x + 4, 125); c.lineTo(x + 36, 125); tratto(c, 'rgba(255,200,140,0.18)', 0.7);
  }
  c.fillStyle = gradL(c, 0, 108, 0, 116, [[0, '#8a5a30'], [1, '#4a2c18']]); c.fillRect(0, 108, 480, 8);
  c.fillStyle = 'rgba(255,220,170,0.35)'; c.fillRect(0, 108, 480, 0.8);
  c.fillStyle = gradL(c, 0, 0, 0, 6, [[0, '#2a160c'], [1, '#5a3418']]); c.fillRect(0, 0, 480, 6);

  // scaffali retroilluminati con le bottiglie
  const colori = ['#2f7d4f', '#b5651d', '#cfe0ea', '#7a1f2a', '#e2b33c', '#3b5fb0', '#6b3a1a', '#d85a3a'];
  for (const x0 of [14, 318]) {
    rrect(c, x0, 44, 148, 68, 3); c.fillStyle = '#1c0d0a'; c.fill(); tratto(c, '#6e4526', 2);
    for (const y of [76, 109]) {
      c.fillStyle = gradL(c, 0, y - 30, 0, y, [[0, 'rgba(255,190,90,0)'], [1, 'rgba(255,190,90,0.22)']]); c.fillRect(x0 + 2, y - 30, 144, 30);
      for (let x = x0 + 5; x < x0 + 140; x += 8.4) bottiglia(c, x, y, 13 + Math.floor(r() * 3) * 3.5, colori[Math.floor(r() * colori.length)], r() < 0.25);
      c.fillStyle = gradL(c, 0, y, 0, y + 3.5, [[0, '#9a6a3a'], [1, '#4a2c18']]); c.fillRect(x0 + 1, y, 146, 3.5);
    }
  }
  // moka sullo scaffale: siamo in Italia
  poli(c, [[149, 76], [158, 76], [156.5, 68], [158, 62], [149, 62], [150.5, 68]]); c.fillStyle = gradL(c, 149, 0, 158, 0, [[0, '#8a909c'], [0.4, '#eef0f4'], [1, '#6c727e']]); c.fill(); tratto(c, '#3a3f49', 0.6);
  c.fillStyle = '#1c1c22'; c.fillRect(151.5, 59, 4, 3); c.fillRect(158, 64, 3, 1.5); c.fillRect(160, 64, 1.4, 6);

  // quadretti: il Vesuvio sul golfo e una tazzina
  rrect(c, 20, 10, 42, 28, 1.5); c.fillStyle = '#c8a45a'; c.fill(); tratto(c, '#5a4018', 1);
  c.save(); c.beginPath(); c.rect(23, 13, 36, 22); c.clip();
  c.fillStyle = gradL(c, 0, 13, 0, 35, [[0, '#ffd9a0'], [0.6, '#f6a86a'], [1, '#3d7fb0']]); c.fillRect(23, 13, 36, 22);
  poli(c, [[26, 30], [36, 19], [40, 22], [45, 18], [57, 30]]); c.fillStyle = '#6a5a7a'; c.fill();
  c.fillStyle = '#3d7fb0'; c.fillRect(23, 29, 36, 6); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(28, 31, 10, 0.6); c.fillRect(42, 33, 8, 0.6);
  c.restore();
  rrect(c, 70, 13, 24, 24, 1.5); c.fillStyle = '#3a2416'; c.fill(); tratto(c, '#1a0d06', 0.8);
  rrect(c, 72.5, 15.5, 19, 19, 1); c.fillStyle = '#f1e6cf'; c.fill();
  rrect(c, 77, 23, 9, 6, [0.5, 0.5, 3, 3]); c.fillStyle = '#ffffff'; c.fill(); tratto(c, '#7a5a3a', 0.7);
  c.beginPath(); c.arc(86.5, 25.5, 2, -1.2, 1.2); tratto(c, '#7a5a3a', 0.7);
  c.beginPath(); c.moveTo(79, 21); c.quadraticCurveTo(80.5, 19, 79.5, 17.5); c.moveTo(83, 21); c.quadraticCurveTo(84.5, 19, 83.5, 17.5); tratto(c, '#b09a80', 0.6);

  // festone tricolore
  c.beginPath(); c.moveTo(320, 8); c.quadraticCurveTo(398, 26, 476, 9); tratto(c, '#e8dcc0', 0.7);
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12, x = 320 + t * 156, y = 8 + 2 * t * (1 - t) * 18 + (9 - 8) * t;
    poli(c, [[x - 4, y], [x + 4, y], [x, y + 9]]); c.fillStyle = ['#2e9b57', '#f6f6f6', '#d83a3a'][i % 3]; c.fill(); tratto(c, 'rgba(0,0,0,0.25)', 0.4);
  }

  // insegna in legno e lavagna
  rrect(c, 172, 32, 136, 20, 4); c.fillStyle = gradL(c, 0, 32, 0, 52, [[0, '#4a2c18'], [1, '#2a160c']]); c.fill(); tratto(c, '#d8a23c', 1.2);
  for (const x of [178, 302]) { ellisse(c, x, 42, 1.3, 1.3); c.fillStyle = '#d8a23c'; c.fill(); }
  rrect(c, 162, 56, 156, 58, 3); c.fillStyle = gradL(c, 0, 56, 0, 114, [[0, '#9a6a3a'], [1, '#5a381c']]); c.fill(); tratto(c, '#2a160c', 1);
  rrect(c, 167, 61, 146, 48, 1.5); c.fillStyle = '#1d2a25'; c.fill();
  c.globalAlpha = 0.06;
  for (let i = 0; i < 40; i++) { c.beginPath(); const x = 170 + r() * 138, y = 64 + r() * 42; c.moveTo(x, y); c.lineTo(x + 10 + r() * 20, y + (r() - 0.5) * 3); tratto(c, '#ffffff', 2 + r() * 3); }
  c.globalAlpha = 1;
  rrect(c, 294, 106, 12, 2.2, 1); c.fillStyle = '#f6f6f6'; c.fill();

  // lampade a sospensione
  for (const x of [110, 370]) {
    c.fillStyle = '#120806'; c.fillRect(x - 0.5, 0, 1, 20);
    c.save(); c.globalCompositeOperation = 'lighter';
    alone(c, x, 30, 70, '#ffb040', 0.2); alone(c, x, 28, 26, '#ffe0a0', 0.35);
    c.restore();
    poli(c, [[x - 4, 19], [x + 4, 19], [x + 11, 28], [x - 11, 28]]); c.fillStyle = gradL(c, x - 11, 0, x + 11, 0, [[0, '#2a2a30'], [0.4, '#6a6a74'], [1, '#1c1c22']]); c.fill(); tratto(c, '#0e0e12', 0.7);
    ellisse(c, x, 28.5, 10, 2); c.fillStyle = '#ffe9a8'; c.fill();
    ellisse(c, x, 29.5, 3.2, 2.6); c.fillStyle = '#fffbe6'; c.fill();
  }

  // retrobanco: macchina del caffè, tazzine, bicchieri
  rrect(c, 212, 138, 56, 34, 3); c.fillStyle = gradL(c, 0, 138, 0, 172, [[0, '#f1f3f6'], [0.3, '#b9bec8'], [1, '#7b8492']]); c.fill(); tratto(c, '#3a3f49', 0.9);
  rrect(c, 216, 147, 48, 9, 1.5); c.fillStyle = '#23252e'; c.fill();
  for (const x of [226, 240, 254]) { ellisse(c, x, 151.5, 2.2, 2.2); c.fillStyle = '#e23a3a'; c.fill(); rrect(c, x - 3, 158, 6, 4, 1); c.fillStyle = '#4a4e5a'; c.fill(); }
  for (const x of [220, 231, 242, 253]) { rrect(c, x, 132.5, 8, 5.5, [0.5, 0.5, 2, 2]); c.fillStyle = '#ffffff'; c.fill(); tratto(c, '#8a8f9c', 0.5); }
  for (let i = 0; i < 4; i++) { rrect(c, 284 + i * 7, 152, 5.5, 16, 0.8); c.fillStyle = 'rgba(220,240,255,0.22)'; c.fill(); tratto(c, 'rgba(235,248,255,0.7)', 0.5); }
  ellisse(c, 190, 166, 12, 4); c.fillStyle = '#8a5a30'; c.fill();
  for (const [x, y] of [[185, 162], [191, 160], [196, 163]]) { ellisse(c, x, y, 3.6, 3); c.fillStyle = '#f6d84a'; c.fill(); tratto(c, '#b8962a', 0.5); }

  // vignettatura
  c.fillStyle = gradR(c, 240, 110, 150, 330, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]); c.fillRect(0, 0, 480, 270);
}

function bancone(c) {
  // piano lucido
  c.fillStyle = gradL(c, 0, 0, 0, 17, [[0, '#d39a58'], [0.25, '#b47a3e'], [0.8, '#8a5628'], [1, '#5a3418']]); c.fillRect(0, 0, 480, 17);
  c.fillStyle = 'rgba(255,235,200,0.5)'; c.fillRect(0, 0, 480, 0.9);
  for (const [x, w] of [[30, 60], [150, 26], [260, 80], [400, 40]]) { poli(c, [[x, 1.5], [x + w, 1.5], [x + w - 5, 10], [x - 5, 10]]); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill(); }
  c.fillStyle = '#2a160c'; c.fillRect(0, 16, 480, 2.5);
  // fronte a pannelli
  c.fillStyle = gradL(c, 0, 18, 0, 112, [[0, '#5e351c'], [1, '#2e180c']]); c.fillRect(0, 18, 480, 94);
  for (let x = 8; x < 480; x += 78) {
    rrect(c, x, 28, 66, 56, 3); c.fillStyle = gradL(c, 0, 28, 0, 84, [[0, '#6e4024'], [1, '#42240f']]); c.fill(); tratto(c, '#22110a', 1);
    rrect(c, x + 6, 34, 54, 44, 2); c.fillStyle = gradL(c, 0, 34, 0, 78, [[0, '#553018'], [1, '#3a1e0e']]); c.fill();
    c.beginPath(); c.moveTo(x + 6, 78); c.lineTo(x + 6, 34); c.lineTo(x + 60, 34); tratto(c, 'rgba(0,0,0,0.35)', 0.8);
    c.beginPath(); c.moveTo(x + 60, 34); c.lineTo(x + 60, 78); c.lineTo(x + 6, 78); tratto(c, 'rgba(255,200,140,0.16)', 0.8);
  }
  // corrimano in ottone
  for (let x = 40; x < 480; x += 100) { c.fillStyle = '#8a5e16'; c.fillRect(x, 86, 2.5, 8); }
  c.fillStyle = gradL(c, 0, 90, 0, 95.5, [[0, '#fff0a8'], [0.4, '#e2b33c'], [1, '#7c5412']]); c.fillRect(0, 90, 480, 5.5);
  c.fillStyle = gradL(c, 0, 96, 0, 112, [[0, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0.6)']]); c.fillRect(0, 96, 480, 16);
}

// ------------------------------------------------------------
//  STRADA DI PAESE vista dall'alto
// ------------------------------------------------------------
function casa(c, x, y, w, h, muro, tetto, r) {
  rrect(c, x + 3, y + 4, w, h, 2); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  rrect(c, x, y, w, h, 1.5); c.fillStyle = muro; c.fill(); tratto(c, scuro(muro, 0.35), 0.8);
  // tetto a due falde con coppi
  const tx = x + 4, ty = y + 4, tw = w - 8, th = h - 8;
  c.fillStyle = gradL(c, tx, 0, tx + tw, 0, [[0, chiaro(tetto, 0.12)], [0.5, tetto], [0.5, scuro(tetto, 0.14)], [1, scuro(tetto, 0.28)]]); c.fillRect(tx, ty, tw, th);
  c.save(); c.beginPath(); c.rect(tx, ty, tw, th); c.clip();
  for (let yy = ty; yy < ty + th; yy += 3) { c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(tx, yy, tw, 0.7); }
  for (let xx = tx + (r() * 3); xx < tx + tw; xx += 3.2) { c.fillStyle = 'rgba(255,220,190,0.08)'; c.fillRect(xx, ty, 1, th); }
  c.restore();
  c.fillStyle = chiaro(tetto, 0.3); c.fillRect(tx + tw / 2 - 1, ty, 2, th);
  c.strokeStyle = scuro(tetto, 0.45); c.lineWidth = 0.7; c.strokeRect(tx, ty, tw, th);
  // comignolo e lucernario
  const cx = tx + 8 + r() * (tw - 24), cy = ty + 6 + r() * (th - 18);
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(cx + 2, cy + 2, 7, 7);
  rrect(c, cx, cy, 7, 7, 0.8); c.fillStyle = '#9a9086'; c.fill(); tratto(c, '#5a524a', 0.6);
  c.fillStyle = '#2e2a26'; c.fillRect(cx + 2, cy + 2, 3, 3);
  if (r() < 0.6) { const lx = tx + 6 + r() * (tw - 22), ly = ty + th - 14; rrect(c, lx, ly, 9, 7, 0.8); c.fillStyle = '#9fd0ee'; c.fill(); tratto(c, '#f4f4f4', 0.9); }
}

function albero(c, x, y, rr) {
  ellisse(c, x + 2, y + 3, rr, rr); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  ellisse(c, x, y, rr, rr); c.fillStyle = gradR(c, x - rr * 0.3, y - rr * 0.3, 1, rr, [[0, '#7cc46a'], [1, '#2f7a3c']]); c.fill(); tratto(c, '#1f5a2a', 0.6);
  for (const [dx, dy] of [[-0.3, -0.2], [0.25, 0.1], [-0.1, 0.35]]) { ellisse(c, x + dx * rr, y + dy * rr, rr * 0.3, rr * 0.3); c.fillStyle = 'rgba(160,220,130,0.4)'; c.fill(); }
}

function vespa(c, x, y, col) {
  c.save(); c.translate(x, y);
  ellisse(c, 5.5, 13, 5, 11); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  rrect(c, 2.2, -1, 3.6, 5, 1.2); c.fillStyle = '#1c1c22'; c.fill();
  rrect(c, 2.2, 20, 3.6, 5, 1.2); c.fill();
  rrect(c, 0, 13, 8, 10, [2, 2, 4, 4]); c.fillStyle = gradL(c, 0, 0, 8, 0, [[0, scuro(col, 0.2)], [0.4, chiaro(col, 0.3)], [1, scuro(col, 0.25)]]); c.fill(); tratto(c, scuro(col, 0.5), 0.5);
  rrect(c, 2, 8, 4, 8, 1.5); c.fillStyle = '#3a2a20'; c.fill();
  rrect(c, 1, 2, 6, 6.5, [3, 3, 1, 1]); c.fillStyle = gradL(c, 0, 0, 8, 0, [[0, scuro(col, 0.2)], [0.4, chiaro(col, 0.3)], [1, scuro(col, 0.25)]]); c.fill(); tratto(c, scuro(col, 0.5), 0.5);
  rrect(c, -2, 3.4, 12, 1.6, 0.8); c.fillStyle = '#c9ced8'; c.fill(); tratto(c, '#5d6575', 0.4);
  ellisse(c, 4, 1.8, 1.3, 1); c.fillStyle = '#fff6c2'; c.fill();
  c.restore();
}

function sfondoStrada(c) {
  const r = casuale(31);
  c.fillStyle = '#86b56e'; c.fillRect(0, 0, 480, 270);
  for (let i = 0; i < 500; i++) { c.fillStyle = i % 2 ? 'rgba(60,120,50,0.25)' : 'rgba(180,220,130,0.25)'; c.fillRect(r() * 480, r() * 270, 1.4, 0.7); }

  const muri = ['#f2d06b', '#f0a8a0', '#f4e3b0', '#9ed0c0', '#f2b87a', '#d8c0e8'], tetti = ['#c8553a', '#d9774a', '#b84a32', '#cf6a44'];
  for (const lato of [0, 1]) {
    let y = -14, i = lato * 2;
    const x = lato ? 358 : 6;
    while (y < 270) {
      const h = 54 + ((i * 17) % 3) * 12;
      casa(c, x, y, 116, h, muri[i % muri.length], tetti[i % tetti.length], r);
      y += h + 20;
      // cortile: vialetto, panni stesi, alberelli
      c.fillStyle = '#d8ccb0'; c.fillRect(x + 50, y - 18, 14, 16);
      albero(c, x + 16, y - 9, 7); albero(c, x + 100, y - 10, 6);
      c.beginPath(); c.moveTo(x + 28, y - 10); c.lineTo(x + 90, y - 10); tratto(c, '#f6f6f6', 0.5);
      for (let k = 0; k < 6; k++) {
        const px = x + 30 + k * 10, col = ['#f6f6f6', '#e86a6a', '#6ab4e8', '#f2d06b', '#f6f6f6', '#9ed0c0'][(k + i) % 6];
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(px + 1, y - 8, 7, 5);
        c.fillStyle = col; c.fillRect(px, y - 9.5, 7, 5);
      }
      i++;
    }
  }

  // marciapiedi in pietra
  for (const x of [126, 330]) {
    c.fillStyle = gradL(c, x, 0, x + 24, 0, [[0, '#d9d2c2'], [1, '#c6bfae']]); c.fillRect(x, 0, 24, 270);
    for (let y = 0; y < 270; y += 9) { c.fillStyle = 'rgba(120,110,95,0.35)'; c.fillRect(x, y, 24, 0.6); c.fillRect(x + ((y / 9) % 2 ? 8 : 16), y, 0.6, 9); }
  }
  c.fillStyle = '#8f897b'; c.fillRect(148, 0, 3, 270); c.fillRect(329, 0, 3, 270);
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(148, 0, 0.8, 270); c.fillRect(331.2, 0, 0.8, 270);

  // asfalto
  c.fillStyle = gradL(c, 151, 0, 329, 0, [[0, '#55565f'], [0.5, '#63646e'], [1, '#55565f']]); c.fillRect(151, 0, 178, 270);
  for (let i = 0; i < 900; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'; c.fillRect(151 + r() * 178, r() * 270, 1, 1); }
  for (const [x, y, w, h] of [[168, 60, 30, 18], [280, 150, 34, 22], [200, 190, 22, 12]]) { rrect(c, x, y, w, h, 3); c.fillStyle = 'rgba(40,40,48,0.25)'; c.fill(); }
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(151, 0, 5, 270); c.fillRect(324, 0, 5, 270);
  for (const x of [209, 269]) for (let y = 4; y < 214; y += 26) { rrect(c, x, y, 2.4, 15, 1.2); c.fillStyle = '#f1f1ea'; c.fill(); }
  for (let x = 157; x < 324; x += 14) { rrect(c, x, 222, 8.5, 31, 1); c.fillStyle = '#f1f1ea'; c.fill(); }
  ellisse(c, 285, 120, 6.5, 6); c.fillStyle = '#3f4048'; c.fill(); tratto(c, '#2c2d34', 0.8);
  for (let i = -2; i <= 2; i++) { c.fillStyle = '#2c2d34'; c.fillRect(280.5, 120 + i * 2.2 - 0.3, 9, 0.6); }

  // vita di paese: vespe, vasi, tavolino del bar, panchina
  vespa(c, 133, 34, '#7fd0b8'); vespa(c, 133, 66, '#e04a3a'); vespa(c, 338, 146, '#f4ecd8'); vespa(c, 338, 16, '#5aa0e0');
  for (const [x, y] of [[138, 128], [138, 204], [342, 92], [342, 240]]) {
    ellisse(c, x + 1.5, y + 2, 5.5, 5.5); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fill();
    ellisse(c, x, y, 5.5, 5.5); c.fillStyle = '#c0683a'; c.fill(); tratto(c, '#7a3c1c', 0.6);
    ellisse(c, x, y, 4.2, 4.2); c.fillStyle = gradR(c, x - 1, y - 1, 0.5, 4.5, [[0, '#8fd87a'], [1, '#2f7a3c']]); c.fill();
    for (const [dx, dy] of [[-1.5, -1], [1.6, 0.6], [0, 1.8]]) { ellisse(c, x + dx, y + dy, 0.9, 0.9); c.fillStyle = '#ff7aa0'; c.fill(); }
  }
  // ombrellone a spicchi con tavolino
  ellisse(c, 344, 196, 10, 10); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fill();
  for (let i = 0; i < 8; i++) {
    c.beginPath(); c.moveTo(342, 193); c.arc(342, 193, 10, (i * Math.PI) / 4, ((i + 1) * Math.PI) / 4); c.closePath();
    c.fillStyle = i % 2 ? '#f6f6f6' : '#d83a3a'; c.fill();
  }
  ellisse(c, 342, 193, 10, 10); tratto(c, '#8a2424', 0.6); ellisse(c, 342, 193, 1.2, 1.2); c.fillStyle = '#5a5a5a'; c.fill();
  rrect(c, 131, 158, 6, 22, 1.5); c.fillStyle = '#8a5a30'; c.fill(); tratto(c, '#4a2c18', 0.6);
  for (let i = 1; i < 4; i++) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(131, 158 + i * 5.5, 6, 0.5); }

  c.fillStyle = gradR(c, 240, 135, 170, 330, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.25)']]); c.fillRect(0, 0, 480, 270);
}

// ------------------------------------------------------------
//  VECCHIA BARBERIA ITALIANA
// ------------------------------------------------------------
function boccetta(c, x, y, w, h, col) {
  rrect(c, x, y - h, w, h, [2, 2, 1, 1]); c.fillStyle = gradL(c, x, 0, x + w, 0, [[0, scuro(col, 0.25)], [0.35, chiaro(col, 0.35)], [1, scuro(col, 0.3)]]); c.fill(); tratto(c, scuro(col, 0.5), 0.5);
  rrect(c, x + w / 2 - 1.5, y - h - 4, 3, 4.5, 0.6); c.fillStyle = '#e8ecf2'; c.fill(); tratto(c, '#7b8492', 0.4);
  rrect(c, x + 1, y - h * 0.6, w - 2, h * 0.3, 0.5); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
}

function sfondoBarbiere(c) {
  // piastrelle verde menta
  c.fillStyle = gradL(c, 0, 0, 480, 190, [[0, '#dff1e4'], [1, '#b9d9c4']]); c.fillRect(0, 0, 480, 192);
  for (let y = 0; y < 192; y += 9) for (let x = (y / 9) % 2 ? -9 : 0; x < 480; x += 18) {
    c.strokeStyle = 'rgba(110,160,130,0.45)'; c.lineWidth = 0.6; c.strokeRect(x, y, 18, 9);
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x + 1, y + 1, 16, 1);
  }
  // boiserie
  c.fillStyle = gradL(c, 0, 190, 0, 270, [[0, '#7a4e28'], [1, '#3e2412']]); c.fillRect(0, 190, 480, 80);
  c.fillStyle = gradL(c, 0, 186, 0, 195, [[0, '#b07a44'], [1, '#5a381c']]); c.fillRect(0, 186, 480, 9);
  for (let x = 0; x < 480; x += 32) { rrect(c, x + 3, 202, 26, 62, 2); tratto(c, 'rgba(0,0,0,0.3)', 0.9); c.fillStyle = 'rgba(255,200,140,0.06)'; c.fill(); }

  // specchio con cornice dorata
  rrect(c, 12, 26, 122, 154, 8); c.fillStyle = gradL(c, 12, 26, 134, 180, [[0, '#f8dc82'], [0.5, '#c8901a'], [1, '#f2c94c']]); c.fill(); tratto(c, '#6b4a0c', 1.2);
  rrect(c, 17, 31, 112, 144, 5); tratto(c, '#8a620e', 1);
  rrect(c, 22, 36, 102, 134, 3); c.fillStyle = gradL(c, 22, 36, 124, 170, [[0, '#e8f6fc'], [0.5, '#b4dcec'], [1, '#d4eef8']]); c.fill(); tratto(c, '#6b4a0c', 1);
  c.save(); rrect(c, 22, 36, 102, 134, 3); c.clip();
  for (const [x, w] of [[30, 12], [50, 5], [92, 8]]) { poli(c, [[x, 170], [x + w, 170], [x + w + 50, 36], [x + 50, 36]]); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill(); }
  c.restore();
  for (const [x, y] of [[14.5, 28.5], [131.5, 28.5], [14.5, 177.5], [131.5, 177.5]]) { ellisse(c, x, y, 4, 4); c.fillStyle = '#f8dc82'; c.fill(); tratto(c, '#6b4a0c', 0.8); }
  // mensola sotto lo specchio
  c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(10, 188, 128, 3);
  rrect(c, 8, 181, 130, 7, 1.5); c.fillStyle = gradL(c, 0, 181, 0, 188, [[0, '#c08a50'], [1, '#6a4020']]); c.fill(); tratto(c, '#3a2010', 0.7);
  boccetta(c, 20, 181, 9, 16, '#e86a6a'); boccetta(c, 34, 181, 8, 20, '#6ab4e8'); boccetta(c, 47, 181, 10, 13, '#f2d06b'); boccetta(c, 104, 181, 9, 18, '#9ed0c0');
  // tazza da barba con pennello
  rrect(c, 70, 168, 16, 13, [1, 1, 5, 5]); c.fillStyle = '#f7f7fb'; c.fill(); tratto(c, '#8a8f9c', 0.7);
  c.beginPath(); c.arc(87, 174, 4, -1.3, 1.3); tratto(c, '#8a8f9c', 1.2);
  ellisse(c, 78, 167, 8.5, 3.5); c.fillStyle = '#ffffff'; c.fill(); tratto(c, 'rgba(150,180,220,0.7)', 0.5);

  // insegna
  rrect(c, 344, 24, 88, 22, 4); c.fillStyle = gradL(c, 0, 24, 0, 46, [[0, '#b4303c'], [1, '#7a1f2a']]); c.fill(); tratto(c, '#f2c94c', 1.3);
  // palo del barbiere
  c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(444, 52, 20, 110);
  rrect(c, 438, 46, 22, 9, 3); c.fillStyle = gradL(c, 438, 0, 460, 0, [[0, '#7b8492'], [0.4, '#f1f3f6'], [1, '#6c727e']]); c.fill(); tratto(c, '#3a3f49', 0.8);
  rrect(c, 438, 149, 22, 9, 3); c.fill(); tratto(c, '#3a3f49', 0.8);
  ellisse(c, 449, 44, 5, 4); c.fill(); tratto(c, '#3a3f49', 0.8);
  c.save(); rrect(c, 441, 55, 16, 94, 2); c.clip();
  c.fillStyle = '#fbfbfe'; c.fillRect(441, 55, 16, 94);
  for (let y = 30; y < 170; y += 24) {
    poli(c, [[441, y + 16], [457, y], [457, y + 7], [441, y + 23]]); c.fillStyle = '#d83a3a'; c.fill();
    poli(c, [[441, y + 28], [457, y + 12], [457, y + 19], [441, y + 35]]); c.fillStyle = '#3b5fb0'; c.fill();
  }
  c.fillStyle = gradL(c, 441, 0, 457, 0, [[0, 'rgba(0,0,0,0.25)'], [0.25, 'rgba(255,255,255,0.45)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.3)']]); c.fillRect(441, 55, 16, 94);
  c.restore();
  rrect(c, 441, 55, 16, 94, 2); tratto(c, '#3a3f49', 0.8);

  // mensola con asciugamani e lozioni
  c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(346, 127, 86, 3);
  rrect(c, 344, 120, 88, 7, 1.5); c.fillStyle = gradL(c, 0, 120, 0, 127, [[0, '#c08a50'], [1, '#6a4020']]); c.fill(); tratto(c, '#3a2010', 0.7);
  for (let i = 0; i < 3; i++) { rrect(c, 350, 113 - i * 6, 26, 6.5, 2.5); c.fillStyle = ['#f7f7fb', '#bcd6f2', '#f7f7fb'][i]; c.fill(); tratto(c, '#8a8f9c', 0.5); }
  boccetta(c, 384, 120, 9, 18, '#f2a65a'); boccetta(c, 397, 120, 8, 14, '#7ac0a0'); boccetta(c, 410, 120, 10, 21, '#b48ad8');

  // poltrona rossa con bottoni capitonné
  rrect(c, 143, 96, 194, 190, 22); c.fillStyle = '#7c141c'; c.fill(); tratto(c, CONT, 1.5);
  rrect(c, 150, 102, 180, 184, 17); c.fillStyle = gradL(c, 150, 0, 330, 0, [[0, '#a81c26'], [0.5, '#e0404a'], [1, '#a01a24']]); c.fill();
  c.save(); rrect(c, 150, 102, 180, 184, 17); c.clip();
  for (let y = 118; y < 290; y += 26) for (let x = 166 + ((y - 118) / 26) % 2 * 15; x < 330; x += 30) {
    alone(c, x, y, 13, '#5a0a10', 0.35);
    ellisse(c, x, y, 2.2, 2.2); c.fillStyle = '#8e1820'; c.fill(); ellisse(c, x - 0.6, y - 0.6, 0.8, 0.8); c.fillStyle = '#ff9aa0'; c.fill();
  }
  c.restore();
  rrect(c, 196, 62, 88, 38, 14); c.fillStyle = gradL(c, 0, 62, 0, 100, [[0, '#e64650'], [1, '#a01a24']]); c.fill(); tratto(c, CONT, 1.5);
  rrect(c, 230, 96, 20, 9, 2); c.fillStyle = gradL(c, 230, 0, 250, 0, [[0, '#7b8492'], [0.4, '#f1f3f6'], [1, '#6c727e']]); c.fill(); tratto(c, '#3a3f49', 0.8);
  for (const x of [118, 322]) {
    rrect(c, x, 212, 40, 14, 6); c.fillStyle = gradL(c, 0, 212, 0, 226, [[0, '#f4f6f9'], [0.5, '#b9bec8'], [1, '#6c727e']]); c.fill(); tratto(c, '#3a3f49', 0.9);
    rrect(c, x + 4, 208, 32, 7, 3.5); c.fillStyle = '#c0282e'; c.fill(); tratto(c, CONT, 0.9);
  }

  // mobiletto per la bacinella
  rrect(c, 372, 240, 100, 40, 3); c.fillStyle = gradL(c, 0, 240, 0, 270, [[0, '#8a5a30'], [1, '#4a2c18']]); c.fill(); tratto(c, '#2a160c', 1);
  rrect(c, 368, 234, 108, 8, 2); c.fillStyle = gradL(c, 0, 234, 0, 242, [[0, '#f4f1ea'], [1, '#c9c2b4']]); c.fill(); tratto(c, '#7a7468', 0.8);

  c.fillStyle = gradR(c, 240, 130, 170, 340, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(20,10,0,0.3)']]); c.fillRect(0, 0, 480, 270);
}

// ------------------------------------------------------------
//  BAR visto da dietro il bancone: la sala dei clienti, con Marsupino dall'altra parte
// ------------------------------------------------------------
function sfondoBar(c) {
  const r = casuale(91);
  // parete color crema a righe
  c.fillStyle = gradL(c, 0, 0, 0, 150, [[0, '#f3dcae'], [1, '#e2bd82']]); c.fillRect(0, 0, 480, 150);
  c.globalAlpha = 0.07;
  for (let x = 0; x < 480; x += 12) { c.fillStyle = '#9a6a34'; c.fillRect(x, 0, 5, 150); }
  c.globalAlpha = 1;
  c.fillStyle = gradL(c, 0, 0, 0, 8, [[0, '#6a3e1c'], [1, '#a8723c']]); c.fillRect(0, 0, 480, 8);
  // pavimento a scacchi in prospettiva (punto di fuga in alto al centro)
  const righe = [176, 181, 187, 194, 202, 212, 224, 239, 256, 276];
  const xa = (k, y) => 240 + (-660 + k * 44 - 240) * ((y - 70) / 206);
  for (let i = 0; i < righe.length - 1; i++) for (let k = 0; k < 32; k++) {
    const y0 = righe[i], y1 = righe[i + 1];
    poli(c, [[xa(k, y0), y0], [xa(k + 1, y0), y0], [xa(k + 1, y1), y1], [xa(k, y1), y1]]);
    c.fillStyle = (i + k) % 2 ? '#2e3038' : '#ece3d0'; c.fill();
  }
  // boiserie verde bottiglia con listello d'ottone
  c.fillStyle = gradL(c, 0, 138, 0, 177, [[0, '#2f6b52'], [1, '#1d4434']]); c.fillRect(0, 138, 480, 39);
  for (let x = 4; x < 480; x += 36) { rrect(c, x, 145, 30, 26, 2); c.fillStyle = 'rgba(0,0,0,0.14)'; c.fill(); tratto(c, 'rgba(255,255,255,0.1)', 0.8); }
  c.fillStyle = gradL(c, 0, 135, 0, 139, [[0, '#f2d27a'], [1, '#9a6a1c']]); c.fillRect(0, 135, 480, 4);
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, 176, 480, 2);

  // vetrina a sinistra: la strada, il palazzo di fronte
  rrect(c, 12, 30, 118, 102, 3); c.fillStyle = '#f4f1ea'; c.fill(); tratto(c, '#8a7a62', 1.2);
  c.save(); c.beginPath(); c.rect(17, 35, 108, 92); c.clip();
  c.fillStyle = gradL(c, 0, 35, 0, 127, [[0, '#8fd0f4'], [1, '#d8f0fa']]); c.fillRect(17, 35, 108, 92);
  c.fillStyle = '#e9b866'; c.fillRect(20, 52, 104, 80);
  for (let x = 28; x < 120; x += 24) for (const y of [60, 88]) {
    rrect(c, x, y, 12, 18, 1); c.fillStyle = '#4a5a6a'; c.fill();
    c.fillStyle = '#3f8a5a'; c.fillRect(x - 4, y, 3.5, 18); c.fillRect(x + 12.5, y, 3.5, 18);
  }
  c.fillStyle = '#c0d0d8'; c.fillRect(17, 112, 108, 16);
  c.fillStyle = '#d8553a'; poli(c, [[20, 104], [74, 104], [70, 112], [24, 112]]); c.fill();
  c.globalAlpha = 0.35; c.fillStyle = '#ffffff';
  poli(c, [[40, 35], [64, 35], [30, 127], [6, 127]]); c.fill(); poli(c, [[74, 35], [82, 35], [48, 127], [40, 127]]); c.fill();
  c.globalAlpha = 1;
  c.restore();
  c.fillStyle = '#f4f1ea'; c.fillRect(69, 35, 4, 92);
  rrect(c, 8, 128, 126, 6, 2); c.fillStyle = '#d8d0c0'; c.fill(); tratto(c, '#8a7a62', 0.8);
  // vasetto di basilico sul davanzale
  rrect(c, 100, 118, 14, 11, [1, 1, 3, 3]); c.fillStyle = '#c8603a'; c.fill(); tratto(c, '#6a2a14', 0.7);
  for (const [x, y] of [[103, 114], [108, 110], [113, 114], [107, 116]]) { ellisse(c, x, y, 4, 3); c.fillStyle = '#4caf50'; c.fill(); tratto(c, '#2a6a2e', 0.5); }

  // sciarpa viola appesa sopra la vetrina
  c.beginPath(); c.moveTo(16, 16); c.quadraticCurveTo(70, 28, 126, 16); tratto(c, '#5a2a8a', 7);
  for (let i = 0; i < 9; i++) { const t = (i + 0.5) / 9, x = 16 + t * 110, y = 16 + 2 * t * (1 - t) * 12; c.fillStyle = i % 2 ? '#ffffff' : '#7a3fc0'; c.fillRect(x - 3, y - 3.2, 5, 6.4); }
  for (const x of [14, 128]) { rrect(c, x - 3, 14, 6, 14, 1); c.fillStyle = '#7a3fc0'; c.fill(); for (let k = 0; k < 4; k++) { c.fillStyle = '#ffffff'; c.fillRect(x - 2.6 + k * 1.6, 27, 0.8, 4); } }

  // lavagna con il menù (le scritte le mette la scena)
  rrect(c, 142, 46, 58, 74, 2); c.fillStyle = '#8a5a30'; c.fill(); tratto(c, '#4a2c18', 1);
  rrect(c, 146, 50, 50, 66, 1); c.fillStyle = '#26332e'; c.fill();
  c.globalAlpha = 0.06;
  for (let i = 0; i < 24; i++) { const x = 148 + r() * 44, y = 52 + r() * 60; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8 + r() * 10, y + (r() - 0.5) * 2); tratto(c, '#ffffff', 2 + r() * 2); }
  c.globalAlpha = 1;

  // televisore con la partita
  rrect(c, 300, 50, 66, 42, 3); c.fillStyle = '#18181c'; c.fill(); tratto(c, '#000000', 1);
  rrect(c, 303, 53, 60, 34, 1); c.fillStyle = gradL(c, 0, 53, 0, 87, [[0, '#3faa50'], [1, '#2a8a3c']]); c.fill();
  c.globalAlpha = 0.25; for (let x = 303; x < 363; x += 8) { c.fillStyle = '#ffffff'; c.fillRect(x, 53, 4, 34); } c.globalAlpha = 1;
  c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.6;
  c.strokeRect(306, 56, 54, 28); c.beginPath(); c.moveTo(333, 56); c.lineTo(333, 84); c.stroke(); c.beginPath(); c.arc(333, 70, 5, 0, 6.3); c.stroke();
  for (const [x, y, col] of [[318, 64, '#e23a3a'], [326, 76, '#e23a3a'], [340, 66, '#7a3fc0'], [350, 74, '#7a3fc0'], [336, 71, '#ffffff']]) { ellisse(c, x, y, 1.3, 1.3); c.fillStyle = col; c.fill(); }
  c.fillStyle = '#18181c'; c.fillRect(330, 40, 6, 10);

  // porta d'ingresso a vetri
  rrect(c, 384, 30, 78, 148, 2); c.fillStyle = '#2f6b52'; c.fill(); tratto(c, '#173a2a', 1.2);
  rrect(c, 391, 37, 64, 92, 1); c.fillStyle = gradL(c, 0, 37, 0, 129, [[0, '#a8daf2'], [1, '#e2f2f8']]); c.fill();
  c.fillStyle = 'rgba(233,184,102,0.6)'; c.fillRect(391, 70, 64, 59);
  c.globalAlpha = 0.35; c.fillStyle = '#ffffff'; poli(c, [[402, 37], [418, 37], [396, 129], [391, 129], [391, 70]]); c.fill(); c.globalAlpha = 1;
  rrect(c, 391, 134, 64, 38, 1); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fill();
  rrect(c, 444, 96, 4, 40, 2); c.fillStyle = gradL(c, 444, 0, 448, 0, [[0, '#9a6a1c'], [0.5, '#f8dc82'], [1, '#9a6a1c']]); c.fill();
  rrect(c, 400, 64, 46, 12, 2); c.fillStyle = '#ffffff'; c.fill(); tratto(c, '#c0392b', 0.8); // cartello "APERTO" (la scritta la mette la scena)

  // tavolini con le sedie
  for (const [x, w] of [[44, 30], [168, 22]]) {
    c.fillStyle = '#3a3f49'; c.fillRect(x - 1, 168, 2, 12);
    ellisse(c, x, 167, w * 0.5, 3.4); c.fillStyle = '#f1ede6'; c.fill(); tratto(c, '#6c727e', 0.7);
  }
  rrect(c, 40, 160, 6, 6, [0.5, 0.5, 2, 2]); c.fillStyle = '#ffffff'; c.fill(); tratto(c, '#8a8f9c', 0.5); // tazzina
  for (const x of [20, 70]) { rrect(c, x - 6, 150, 12, 14, 2); c.fillStyle = '#c0392b'; c.fill(); tratto(c, '#6a1a14', 0.7); c.fillStyle = '#6a1a14'; c.fillRect(x - 5, 164, 1.4, 12); c.fillRect(x + 3.6, 164, 1.4, 12); }

  // lampade a sospensione
  for (const x of [110, 260, 368]) {
    c.fillStyle = '#2a1a10'; c.fillRect(x - 0.5, 8, 1, 14);
    c.save(); c.globalCompositeOperation = 'lighter'; alone(c, x, 28, 50, '#ffcf70', 0.18); c.restore();
    c.beginPath(); c.moveTo(x - 9, 30); c.quadraticCurveTo(x, 14, x + 9, 30); c.closePath(); c.fillStyle = '#c0392b'; c.fill(); tratto(c, '#6a1a14', 0.8);
    ellisse(c, x, 30, 9, 1.8); c.fillStyle = '#fff3c0'; c.fill();
  }
  c.fillStyle = gradR(c, 240, 120, 140, 330, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(40,20,0,0.35)']]); c.fillRect(0, 0, 480, 270);
}

// il piano del bancone in primo piano (480x74): marmo chiaro, bordo d'acciaio
function banconeBar(c) {
  const r = casuale(93);
  c.fillStyle = gradL(c, 0, 0, 0, 7, [[0, '#4a2c18'], [1, '#8a5a30']]); c.fillRect(0, 0, 480, 7);
  c.fillStyle = gradL(c, 0, 7, 0, 64, [[0, '#cfc9bf'], [0.35, '#f1ede6'], [1, '#e0dbd2']]); c.fillRect(0, 7, 480, 57);
  for (let i = 0; i < 14; i++) {
    const x = r() * 480, y = 9 + r() * 52;
    c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 20, y + (r() - 0.5) * 16, x + 40, y + (r() - 0.5) * 16, x + 60 + r() * 30, y + (r() - 0.5) * 10);
    tratto(c, `rgba(140,140,150,${0.15 + r() * 0.2})`, 0.4 + r() * 0.6);
  }
  for (const [x, w] of [[40, 70], [210, 40], [330, 90]]) { poli(c, [[x, 10], [x + w, 10], [x + w - 14, 60], [x - 14, 60]]); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill(); }
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, 7, 480, 2);
  c.fillStyle = gradL(c, 0, 64, 0, 74, [[0, '#f4f6f9'], [0.4, '#b9bec8'], [1, '#6c727e']]); c.fillRect(0, 64, 480, 10);
  c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(0, 64.5, 480, 0.8);
}

// ------------------------------------------------------------
//  SALA DA PRANZO: parete con quadro e finestra; la tavola è un livello a parte
//  (davanti a Guerra, che ci sta seduto dietro)
// ------------------------------------------------------------
function sfondoSala(c) {
  const r = casuale(55);
  c.fillStyle = gradL(c, 0, 0, 0, 120, [[0, '#cfe0c4'], [1, '#b4cba6']]); c.fillRect(0, 0, 480, 120);
  // carta da parati a fiorellini
  c.globalAlpha = 0.18;
  for (let y = 8; y < 116; y += 14) for (let x = (y / 14) % 2 ? 4 : 11; x < 480; x += 14) {
    for (let k = 0; k < 4; k++) { ellisse(c, x + Math.cos(k * 1.57) * 2, y + Math.sin(k * 1.57) * 2, 1.6, 1.6); c.fillStyle = '#ffffff'; c.fill(); }
    ellisse(c, x, y, 1, 1); c.fillStyle = '#e8a040'; c.fill();
  }
  c.globalAlpha = 1;
  c.fillStyle = gradL(c, 0, 92, 0, 120, [[0, '#8a5a30'], [1, '#5a3418']]); c.fillRect(0, 96, 480, 24);
  c.fillStyle = 'rgba(255,220,170,0.35)'; c.fillRect(0, 96, 480, 1);

  // finestra con le tende
  rrect(c, 22, 14, 92, 74, 2); c.fillStyle = '#f4f1ea'; c.fill(); tratto(c, '#8a7a62', 1);
  c.fillStyle = gradL(c, 0, 18, 0, 84, [[0, '#ffb070'], [0.6, '#ffd9a0'], [1, '#f6e8c0']]); c.fillRect(26, 18, 84, 66);
  poli(c, [[26, 70], [44, 58], [60, 64], [80, 52], [110, 62], [110, 84], [26, 84]]); c.fillStyle = '#7a9a5a'; c.fill();
  for (const [x, h] of [[50, 22], [58, 16], [92, 20]]) { ellisse(c, x, 70 - h / 2, 2.6, h / 2); c.fillStyle = '#2f5a2a'; c.fill(); } // cipressi
  c.fillStyle = '#f4f1ea'; c.fillRect(66, 18, 3, 66); c.fillRect(26, 49, 84, 3);
  for (const s of [-1, 1]) {
    const x = s < 0 ? 16 : 120;
    c.beginPath(); c.moveTo(x, 10); c.quadraticCurveTo(x + s * -14, 40, x + s * -4, 92); c.lineTo(x + s * 8, 92); c.quadraticCurveTo(x + s * 2, 50, x + s * 10, 10); c.closePath();
    c.fillStyle = '#c0392b'; c.fill(); tratto(c, '#6a1a14', 0.8);
  }
  c.fillStyle = '#6a3a1a'; c.fillRect(8, 8, 122, 3);

  // quadro: natura morta con la frutta
  rrect(c, 340, 18, 76, 56, 2); c.fillStyle = gradL(c, 340, 18, 416, 74, [[0, '#e8c060'], [1, '#a87a20']]); c.fill(); tratto(c, '#5a4010', 1);
  rrect(c, 346, 24, 64, 44, 1); c.fillStyle = '#3a2a1e'; c.fill();
  ellisse(c, 378, 56, 22, 6); c.fillStyle = '#c8a070'; c.fill();
  for (const [x, y, col] of [[368, 50, '#d83a3a'], [378, 47, '#f2c24a'], [388, 51, '#6aa83a'], [374, 54, '#8a3aa0'], [384, 55, '#e86a2a']]) { ellisse(c, x, y, 5, 4.5); c.fillStyle = col; c.fill(); ellisse(c, x - 1.5, y - 1.5, 1.4, 1); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill(); }
  // applique alle pareti
  for (const x of [170, 310]) {
    c.save(); c.globalCompositeOperation = 'lighter'; alone(c, x, 40, 30, '#ffd080', 0.25); c.restore();
    rrect(c, x - 2, 44, 4, 10, 1); c.fillStyle = '#9a6a1c'; c.fill();
    c.beginPath(); c.moveTo(x - 7, 44); c.lineTo(x + 7, 44); c.lineTo(x + 4, 32); c.lineTo(x - 4, 32); c.closePath(); c.fillStyle = '#fff1c8'; c.fill(); tratto(c, '#b8963a', 0.7);
  }
  c.fillStyle = gradR(c, 240, 60, 100, 300, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(30,20,0,0.3)']]); c.fillRect(0, 0, 480, 270);
}

// la tavola (480x190, da y = 80): i primi 30 sono trasparenti, per le cose alte
// appoggiate sul bordo lontano; la tovaglia a quadretti comincia a y = 110
function tavola(c) {
  const r = casuale(56);
  c.translate(0, 30);
  c.fillStyle = '#f6f2ea'; c.fillRect(0, 0, 480, 160);
  // quadretti rossi che si allargano verso chi gioca (punto di fuga in alto, lontano)
  const fuga = -260, xa = (k, y) => 240 + (k * 22 - 240) * ((y - fuga) / (6 - fuga));
  const righe = [6]; for (let y = 6, h = 8; y < 160; h *= 1.16) { y += h; righe.push(y); }
  for (let i = 0; i < righe.length - 1; i++) for (let k = -12; k < 34; k++) {
    if ((i + k) % 2) continue;
    const y0 = righe[i], y1 = righe[i + 1];
    poli(c, [[xa(k, y0), y0], [xa(k + 1, y0), y0], [xa(k + 1, y1), y1], [xa(k, y1), y1]]);
    c.fillStyle = 'rgba(200,40,40,0.55)'; c.fill();
  }
  // bordo lontano della tovaglia che ricade
  c.fillStyle = gradL(c, 0, 0, 0, 7, [[0, '#d8d0c0'], [1, '#f6f2ea']]); c.fillRect(0, 0, 480, 6);
  c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(0, 0, 480, 1.2);
  // pieghe
  for (const x of [90, 200, 330, 420]) { c.beginPath(); c.moveTo(x, 8); c.quadraticCurveTo(x + 6, 60, x - 4, 160); tratto(c, 'rgba(0,0,0,0.05)', 6); }
  // sul lato di Guerra: il suo piatto vuoto con le posate, il pane, il vino
  ellisse(c, 240, 22, 22, 7); c.fillStyle = '#ffffff'; c.fill(); tratto(c, '#7b8492', 0.8);
  ellisse(c, 240, 22, 15, 4.6); c.fillStyle = '#f0f2f6'; c.fill();
  for (const [x, a] of [[212, -0.1], [268, 0.1]]) { c.save(); c.translate(x, 22); c.rotate(a); rrect(c, -1, -9, 2, 18, 1); c.fillStyle = '#c9ced8'; c.fill(); tratto(c, '#5d6575', 0.4); c.restore(); }
  ellisse(c, 70, 24, 22, 8); c.fillStyle = '#b8803a'; c.fill(); tratto(c, '#6a4010', 0.8);
  for (const [x, y] of [[62, 19], [74, 17], [82, 22], [68, 24]]) { ellisse(c, x, y, 7, 4.2, r() - 0.5); c.fillStyle = '#e8b060'; c.fill(); tratto(c, '#9a6a24', 0.6); }
  rrect(c, 400, -22, 12, 40, [5, 5, 2, 2]); c.fillStyle = gradL(c, 400, 0, 412, 0, [[0, '#2a0a10'], [0.4, '#6a1a2a'], [1, '#2a0a10']]); c.fill(); tratto(c, '#000000', 0.6);
  rrect(c, 401.5, -4, 9, 10, 1); c.fillStyle = '#f2e6c8'; c.fill();
  for (const x of [380, 428]) { c.beginPath(); c.moveTo(x - 5, 4); c.lineTo(x + 5, 4); c.lineTo(x + 3, 14); c.lineTo(x - 3, 14); c.closePath(); c.fillStyle = 'rgba(230,240,255,0.6)'; c.fill(); tratto(c, 'rgba(120,130,150,0.8)', 0.6); c.fillStyle = 'rgba(120,20,40,0.7)'; c.fillRect(x - 3.5, 9, 7, 4.5); }
  c.fillStyle = gradL(c, 0, 100, 0, 160, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.12)']]); c.fillRect(0, 100, 480, 60);
}

// ------------------------------------------------------------
//  CORTILE DI FRANCI: la villetta con 12 finestre (3 piani x 4) e il portone.
//  Le finestre vere (aperte/chiuse) le mette la scena sopra le cornici di pietra.
// ------------------------------------------------------------
export const CASA = {
  colonne: [138, 206, 274, 342],   // centri delle finestre (x)
  righe: [56, 106, 156],           // centri delle finestre (y), dall'alto
  w: 32, h: 36,                    // vano della finestra
  porta: { x: 240, y: 232, w: 46, h: 50 },
};

function sfondoCortile(c) {
  const r = casuale(71);
  c.fillStyle = gradL(c, 0, 0, 0, 200, [[0, '#7cc4f0'], [1, '#d4eefa']]); c.fillRect(0, 0, 480, 240);
  for (const [x, y, s] of [[40, 30, 1], [420, 22, 0.8], [250, 6, 0.6]]) for (const [dx, dy, rr] of [[0, 0, 10], [10, -4, 8], [-10, 2, 7], [18, 3, 6]]) { ellisse(c, x + dx * s, y + dy * s, rr * s * 1.4, rr * s); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill(); }
  // case dei vicini ai lati
  c.fillStyle = '#d9c3a0'; c.fillRect(0, 70, 92, 170); c.fillStyle = '#c9b08a'; c.fillRect(0, 62, 96, 10);
  for (const y of [90, 140]) { rrect(c, 22, y, 22, 28, 1); c.fillStyle = '#4a5a6a'; c.fill(); c.fillStyle = '#3f7a5a'; c.fillRect(14, y, 7, 28); c.fillRect(45, y, 7, 28); }
  c.fillStyle = '#e8b4a0'; c.fillRect(388, 50, 92, 190); c.fillStyle = '#c88a70'; c.fillRect(384, 44, 96, 8);
  rrect(c, 410, 96, 48, 6, 1); c.fillStyle = '#8a8f9c'; c.fill();
  for (let x = 412; x < 458; x += 5) { c.fillStyle = '#3a3f49'; c.fillRect(x, 80, 1.4, 16); }
  c.fillStyle = '#3a3f49'; c.fillRect(410, 79, 48, 2);
  rrect(c, 420, 110, 26, 32, 1); c.fillStyle = '#4a5a6a'; c.fill();
  // albero a sinistra
  c.fillStyle = '#6a4a2a'; c.fillRect(66, 150, 8, 85);
  for (const [x, y, rr] of [[70, 140, 26], [52, 156, 18], [90, 156, 18], [70, 118, 18]]) { ellisse(c, x, y, rr, rr * 0.85); c.fillStyle = gradR(c, x - 6, y - 6, 2, rr, [[0, '#8ccf6a'], [1, '#3a8a3c']]); c.fill(); tratto(c, '#2a6a2e', 0.8); }

  // la villetta
  rrect(c, 100, 28, 280, 206, 1); c.fillStyle = gradL(c, 100, 0, 380, 0, [[0, '#f0c48a'], [0.5, '#f6d29c'], [1, '#e8b47a']]); c.fill(); tratto(c, '#a8784a', 1);
  c.globalAlpha = 0.08;
  for (let i = 0; i < 70; i++) { ellisse(c, 104 + r() * 272, 32 + r() * 196, 3 + r() * 6, 2 + r() * 3); c.fillStyle = r() < 0.5 ? '#8a5a2a' : '#ffffff'; c.fill(); }
  c.globalAlpha = 1;
  // marcapiani e zoccolo
  for (const y of [82, 132, 180]) { c.fillStyle = '#e2d6c0'; c.fillRect(100, y, 280, 4); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(100, y + 4, 280, 1.5); }
  c.fillStyle = gradL(c, 0, 184, 0, 234, [[0, '#d8a874'], [1, '#c08a58']]); c.fillRect(100, 184, 280, 50);
  // tetto di coppi con comignolo e grondaia
  poli(c, [[88, 30], [392, 30], [370, 8], [110, 8]]); c.fillStyle = gradL(c, 0, 8, 0, 30, [[0, '#b84a32'], [1, '#d8603e']]); c.fill(); tratto(c, '#6a2a1a', 1);
  for (let x = 112; x < 372; x += 7) { c.beginPath(); c.moveTo(x, 9); c.lineTo(x - 4, 29); tratto(c, 'rgba(90,30,20,0.35)', 1); }
  rrect(c, 320, -4, 16, 18, 1); c.fillStyle = '#c87a5a'; c.fill(); tratto(c, '#6a2a1a', 0.8); c.fillStyle = '#5a2a1a'; c.fillRect(318, -4, 20, 4);
  c.fillStyle = '#8a8f9c'; c.fillRect(86, 30, 308, 3); c.fillRect(372, 33, 3, 200);
  // cornici di pietra delle finestre (il vano lo copre la finestra della scena)
  for (const y of CASA.righe) for (const x of CASA.colonne) {
    rrect(c, x - 21, y - 22, 42, 44, 1.5); c.fillStyle = '#efe6d6'; c.fill(); tratto(c, '#b8a888', 0.8);
    rrect(c, x - 24, y + 19, 48, 5, 1); c.fillStyle = '#ddd2be'; c.fill(); tratto(c, '#a89878', 0.7);
  }
  // piano terra: finestrelle con l'inferriata e il portone
  for (const x of [162, 318]) {
    rrect(c, x - 14, 194, 28, 26, 1); c.fillStyle = '#efe6d6'; c.fill();
    rrect(c, x - 11, 197, 22, 20, 0.5); c.fillStyle = '#3a3a44'; c.fill();
    for (let k = 0; k < 4; k++) { c.fillStyle = '#1c1c22'; c.fillRect(x - 9 + k * 6, 197, 1.6, 20); }
    c.fillStyle = '#1c1c22'; c.fillRect(x - 11, 206, 22, 1.6);
  }
  const P = CASA.porta;
  rrect(c, P.x - P.w / 2 - 5, P.y - P.h - 6, P.w + 10, P.h + 6, [P.w / 2 + 5, P.w / 2 + 5, 0, 0]); c.fillStyle = '#efe6d6'; c.fill(); tratto(c, '#b8a888', 0.8);
  portone(c, P.x - P.w / 2, P.y - P.h, false);
  // gradino e cortile
  rrect(c, P.x - 30, 230, 60, 6, 1); c.fillStyle = '#c8c0b0'; c.fill(); tratto(c, '#8a8070', 0.6);
  c.fillStyle = gradL(c, 0, 234, 0, 270, [[0, '#b8ad98'], [1, '#9a8f7a']]); c.fillRect(0, 234, 480, 36);
  for (let i = 0; i < 160; i++) { ellisse(c, r() * 480, 236 + r() * 34, 1.5 + r() * 2.5, 1 + r() * 1.2); c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.25)' : 'rgba(60,50,40,0.2)'; c.fill(); }
  // vasi di gerani e bicicletta
  for (const x of [196, 284]) { rrect(c, x - 7, 222, 14, 12, [1, 1, 3, 3]); c.fillStyle = '#c8603a'; c.fill(); tratto(c, '#6a2a14', 0.6); for (const [dx, dy] of [[-4, -3], [0, -6], [4, -3]]) { ellisse(c, x + dx, 220 + dy, 3.4, 3); c.fillStyle = '#e83a4a'; c.fill(); } }
  for (const x of [404, 432]) { c.beginPath(); c.arc(x, 244, 10, 0, 6.3); tratto(c, '#2a2a30', 1.6); }
  c.beginPath(); c.moveTo(404, 244); c.lineTo(416, 230); c.lineTo(432, 244); c.moveTo(416, 230); c.lineTo(414, 224); c.lineTo(420, 224); c.moveTo(404, 244); c.lineTo(418, 244); c.lineTo(426, 232); c.lineTo(430, 228); tratto(c, '#2f6fd8', 1.6);
}

// portone di legno ad arco (46x50); aperto = buio dentro e un'anta spalancata
function portone(c, x, y, aperto) {
  const w = CASA.porta.w, h = CASA.porta.h;
  const vano = () => rrect(c, x, y, w, h, [w / 2, w / 2, 0, 0]);
  if (aperto) {
    vano(); c.fillStyle = '#1a1210'; c.fill();
    c.save(); vano(); c.clip(); c.fillStyle = gradL(c, 0, y, 0, y + h, [[0, 'rgba(255,200,120,0.15)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(x, y, w, h); c.restore();
    poli(c, [[x, y + 10], [x - 12, y + 6], [x - 12, y + h + 3], [x, y + h]]); c.fillStyle = '#7a4a24'; c.fill(); tratto(c, '#3a200c', 0.8);
    vano(); tratto(c, '#3a200c', 1);
    return;
  }
  vano(); c.fillStyle = gradL(c, x, 0, x + w, 0, [[0, '#6a3a1a'], [0.5, '#8a5428'], [1, '#6a3a1a']]); c.fill(); tratto(c, '#3a200c', 1);
  c.beginPath(); c.moveTo(x + w / 2, y + 2); c.lineTo(x + w / 2, y + h); tratto(c, '#3a200c', 1);
  for (const dx of [6, w / 2 + 6]) for (const dy of [16, 33]) { rrect(c, x + dx - 2, y + dy, w / 2 - 8, 13, 1); tratto(c, 'rgba(40,20,8,0.6)', 0.8); }
  for (const s of [-1, 1]) { ellisse(c, x + w / 2 + s * 3, y + 30, 1.4, 1.4); c.fillStyle = '#e8c048'; c.fill(); }
}

export function creaSfondi(scene) {
  tela(scene, 'bgPub', 480, 270, sfondoPub);
  tela(scene, 'bancone', 480, 112, bancone);
  tela(scene, 'bgStrada', 480, 270, sfondoStrada);
  tela(scene, 'bgBarbiere', 480, 270, sfondoBarbiere);
  tela(scene, 'bgBar', 480, 270, sfondoBar);
  tela(scene, 'banconeBar', 480, 74, banconeBar);
  tela(scene, 'bgSala', 480, 270, sfondoSala);
  tela(scene, 'tavola', 480, 190, tavola);
  tela(scene, 'bgCortile', 480, 270, sfondoCortile);
  tela(scene, 'portoneAperto', 60, 54, (c) => portone(c, 12, 2, true));
  // vignettatura per le schermate di menu
  tela(scene, 'vignetta', 480, 270, (c) => {
    c.fillStyle = gradR(c, 240, 135, 60, 310, [[0, 'rgba(255,255,255,0.16)'], [0.45, 'rgba(0,0,0,0)'], [1, 'rgba(20,0,30,0.55)']]);
    c.fillRect(0, 0, 480, 270);
  }, 1);
}
