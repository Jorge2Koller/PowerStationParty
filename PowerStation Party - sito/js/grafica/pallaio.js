// "Beer Pong al Pallaio": la veranda del Pallaio vista da dietro le spalle di chi tira, il tavolo
// da ping pong in prospettiva, i bicchieri di plastica pieni di birra, la pallina, la lampadina, la
// mano di chi tira. Tutto disegnato col codice, con la stessa prospettiva del motore di tiro
// (js/beerpong/motore.js: proietta), così bicchieri e pallina stanno dove il disegno dice.
import { tela, CONT, casuale, riemp, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alfa, alone } from './base.js';
import { proietta, TAV } from '../beerpong/motore.js';

// dove sta il ritaglio del tavolo sullo schermo (la texture 'tavoloPong' si mette qui, origine in alto a sinistra)
export const TAVOLO_IMG = { x: 70, y: 120, w: 340, h: 150 };
export const RETE_IMG = { x: 136, y: 146, w: 208, h: 24 };
// il bicchiere: 30x36, il fondo sta in (15, 33) e la bocca è larga 26
export const BICCHIERE_IMG = { w: 30, h: 36, ox: 15 / 30, oy: 33 / 36, bocca: 26, alto: 28 };
export const PALLINA_IMG = { lato: 16, diametro: 13 };
export const MANO_IMG = { w: 46, h: 62, ox: 23 / 46, oy: 9 / 62 };   // l'origine è dove sta la pallina, tra le dita

const LEGNO = '#cf7f2c', LEGNO_S = '#9a5516', LEGNO_C = '#eaa550';
const terra = (x, y) => proietta(x, y, TAV.terra);

// un quadrilatero dai suoi quattro punti dello spazio
const quad = (c, pts) => poli(c, pts.map((p) => [p.x, p.y]));

// --- mobili della veranda, disegnati "di fronte" nel punto (x, y) del pavimento, grandi k unità per metro ---
function sedia(c, x, y, k, col = '#f6f6f2', verso = 1) {
  const u = k / 100;   // i disegni sono in centimetri
  c.save(); c.translate(x, y); c.scale(u * verso, u);
  const ombra = scuro(col, 0.22);
  // gambe dietro e davanti
  for (const gx of [-20, 18]) { rrect(c, gx, -46, 5, 46, 2); riemp(c, ombra); tratto(c, CONT, 2.4); }
  // schienale a stecche
  rrect(c, -24, -86, 44, 44, 9); riemp(c, col); tratto(c, CONT, 2.6);
  for (const sx of [-14, -5, 4]) { rrect(c, sx, -78, 5, 28, 2); riemp(c, ombra); }
  // seduta e braccioli
  rrect(c, -27, -48, 54, 10, 4); riemp(c, chiaro(col, 0.1)); tratto(c, CONT, 2.6);
  for (const bx of [-29, 24]) { rrect(c, bx, -64, 6, 20, 3); riemp(c, col); tratto(c, CONT, 2.2); }
  for (const gx of [-27, 23]) { rrect(c, gx, -40, 5, 40, 2); riemp(c, col); tratto(c, CONT, 2.4); }
  c.restore();
}

function tavolino(c, x, y, k, panno = '#2f9a5a') {
  const u = k / 100;
  c.save(); c.translate(x, y); c.scale(u, u);
  for (const gx of [-34, 30]) { rrect(c, gx, -72, 5, 72, 2); riemp(c, '#1d1d24'); }
  // il piano, visto un po' dall'alto, col panno verde da carte
  poli(c, [[-46, -74], [46, -74], [38, -86], [-38, -86]]); riemp(c, '#2a2a33'); tratto(c, CONT, 2.6);
  poli(c, [[-36, -76.5], [36, -76.5], [30, -84], [-30, -84]]); riemp(c, panno);
  rrect(c, -46, -74, 92, 5, 1.5); riemp(c, '#17171d'); tratto(c, CONT, 2.2);
  c.restore();
}

// il tavolo da birreria con la tovaglia di carta e le due panche di legno arancione, coi piedi verdi
function panche(c, x, y, k) {
  const u = k / 100;
  c.save(); c.translate(x, y); c.scale(u, u);
  const piede = (px, alto) => { c.beginPath(); c.moveTo(px - 12, 0); c.lineTo(px, -alto); c.lineTo(px + 12, 0); tratto(c, CONT, 6.5); tratto(c, '#256b3d', 4); };
  // la panca dietro
  piede(-62, 50); piede(62, 50);
  rrect(c, -100, -56, 200, 8, 2); riemp(c, LEGNO_S); tratto(c, CONT, 2.4);
  // il tavolo, con la tovaglia bianca che scende
  piede(-70, 76); piede(70, 76);
  poli(c, [[-108, -78], [108, -78], [98, -92], [-98, -92]]); riemp(c, '#ffffff'); tratto(c, CONT, 2.6);
  poli(c, [[-108, -78], [108, -78], [108, -62], [-108, -62]]); riemp(c, '#eef0f2'); tratto(c, CONT, 2.4);
  for (let px = -100; px < 108; px += 9) { c.beginPath(); c.moveTo(px, -76); c.lineTo(px, -64); tratto(c, 'rgba(120,130,150,0.18)', 1); }
  // la panca davanti
  piede(-66, 46); piede(66, 46);
  rrect(c, -112, -52, 224, 10, 2.5); riemp(c, gradL(c, 0, -52, 0, -42, [[0, LEGNO_C], [1, LEGNO]])); tratto(c, CONT, 2.6);
  for (const nx of [-70, -12, 44, 84]) { ellisse(c, nx, -47, 3, 1.4); riemp(c, alfa(LEGNO_S, 0.55)); }
  c.restore();
}

// ------------------------------------------------------------
//  LO SFONDO: la veranda (soffitto di lamiera bianca coi neon, vetrate col telaio di legno e la
//  siepe dietro, il bancone del bar a sinistra, il pavimento di piastrelle, sedie e tavolini)
// ------------------------------------------------------------
function sfondo(c) {
  const rnd = casuale(4242);
  const FONDO = 5.2, LATO = 4.4, TETTO = 1.5;
  const f = (x, h) => proietta(x, FONDO, h);                    // un punto della parete di fondo
  const a = f(-LATO, TETTO), b = f(LATO, TETTO), d = f(-LATO, TAV.terra), e = f(LATO, TAV.terra);
  const bordo = (h) => 46 + (1 - h) * (240 / LATO);              // altezza di schermo a cui la parete di lato esce dallo schermo

  // --- pavimento di piastrelle ---
  c.fillStyle = gradL(c, 0, d.y, 0, 270, [[0, '#d9cdb9'], [1, '#efe6d6']]); c.fillRect(0, d.y - 1, 480, 271 - d.y);
  c.save(); c.beginPath(); c.rect(0, d.y, 480, 270 - d.y); c.clip();
  for (let x = -9; x <= 9; x += 0.45) { const p0 = terra(x, FONDO), p1 = terra(x, -0.7); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); tratto(c, 'rgba(110,92,74,0.3)', 0.7); }
  for (let y = -0.55; y <= FONDO; y += 0.45) { const p = terra(0, y); c.beginPath(); c.moveTo(0, p.y); c.lineTo(480, p.y); tratto(c, 'rgba(110,92,74,0.3)', 0.7); }
  c.restore();

  // --- soffitto di lamiera bianca: le onde vanno verso il fondo ---
  c.fillStyle = gradL(c, 0, 0, 0, a.y, [[0, '#f4f5f7'], [1, '#d5d9df']]); c.fillRect(0, 0, 480, a.y + 1);
  for (let i = -16; i <= 16; i++) {
    const x0 = 240 + i * 9.4, k = (46 + 8) / (46 - a.y);
    c.beginPath(); c.moveTo(x0, a.y); c.lineTo(240 + i * 9.4 * k, -8); tratto(c, i % 4 ? 'rgba(120,130,150,0.2)' : 'rgba(110,118,136,0.5)', i % 4 ? 0.6 : 1);
  }
  // i neon
  const neon = (x0, x1, y) => {
    const p0 = proietta(x0, y, TETTO - 0.06), p1 = proietta(x1, y, TETTO - 0.06), s = p0.k / 60;
    alone(c, (p0.x + p1.x) / 2, p0.y, (p1.x - p0.x) * 0.62, '#ffffff', 0.55);
    rrect(c, p0.x, p0.y - 2.4 * s, p1.x - p0.x, 4.8 * s, 2.4 * s); riemp(c, '#ffffff'); tratto(c, 'rgba(120,130,150,0.8)', 0.8);
    rrect(c, p0.x - 1.5 * s, p0.y - 3.2 * s, 4 * s, 6.4 * s, 1); riemp(c, '#9aa0ac');
    rrect(c, p1.x - 2.5 * s, p0.y - 3.2 * s, 4 * s, 6.4 * s, 1); riemp(c, '#9aa0ac');
  };
  neon(-3.3, -1.5, 2.1); neon(1.5, 3.3, 2.1); neon(-3, -1.6, 4); neon(1.6, 3, 4);

  // --- le pareti: vetrate col telaio di legno, dietro la siepe ---
  // h del davanzale e delle traverse (dal piano del tavolo)
  const DAV = -0.22, MEZZO = 0.62, CIMA = 1.36;
  const siepe = (x0, y0, x1, y1) => {
    c.fillStyle = gradL(c, 0, y0, 0, y1, [[0, '#dff3ff'], [0.16, '#bfe6a0'], [0.3, '#5fae4a'], [1, '#2f7a35']]); c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let i = 0; i < (x1 - x0) * 1.6; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + (0.22 + rnd() * 0.78) * (y1 - y0), r = 1.2 + rnd() * 2.4;
      ellisse(c, x, y, r, r * 0.8); riemp(c, rnd() < 0.5 ? 'rgba(160,220,110,0.45)' : 'rgba(22,84,40,0.4)');
    }
  };
  // parete di fondo
  const vt = f(0, CIMA).y, vm = f(0, MEZZO).y, vd = f(0, DAV).y;
  siepe(a.x, vt, b.x, vd);
  c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(a.x, vt, b.x - a.x, vd - vt);     // il riflesso dei vetri
  c.fillStyle = gradL(c, 0, a.y, 0, vt, [[0, '#f0f1f3'], [1, '#dcdfe4']]); c.fillRect(a.x, a.y, b.x - a.x, vt - a.y + 0.5);
  c.fillStyle = gradL(c, 0, vd, 0, d.y, [[0, '#d6a08c'], [1, '#b98470']]); c.fillRect(a.x, vd, b.x - a.x, d.y - vd);
  for (let x = a.x; x < b.x; x += 9) { c.fillStyle = 'rgba(90,50,40,0.12)'; c.fillRect(x, vd + 4, 0.7, d.y - vd - 4); }
  const trave = (x0, y0, x1, y1, w) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); tratto(c, LEGNO_S, w + 1.2); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); tratto(c, LEGNO, w); };
  for (let i = 0; i <= 8; i++) { const x = a.x + ((b.x - a.x) * i) / 8; trave(x, vt, x, vd, i % 2 ? 1.6 : 2.6); }
  trave(a.x, vt, b.x, vt, 3); trave(a.x, vm, b.x, vm, 2); trave(a.x, vd, b.x, vd, 3.2);
  // pareti di lato (vanno verso chi guarda fino a uscire dallo schermo)
  for (const s of [-1, 1]) {
    const X = s < 0 ? 0 : 480, ang = s < 0 ? a : b, bas = s < 0 ? d : e;
    c.save();
    poli(c, [[ang.x, ang.y], [X, bordo(TETTO)], [X, bordo(TAV.terra)], [bas.x, bas.y]]); c.clip();
    c.fillStyle = '#e4e6ea'; c.fillRect(Math.min(ang.x, X), 0, Math.abs(X - ang.x), 270);
    if (s > 0) {
      // a destra ancora vetrate
      poli(c, [[ang.x, vt], [X, bordo(CIMA)], [X, bordo(DAV)], [ang.x, vd]]); c.save(); c.clip(); siepe(ang.x, bordo(CIMA) - 2, 480, bordo(DAV) + 2); c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(ang.x, 0, 100, 200); c.restore();
      poli(c, [[ang.x, vd], [X, bordo(DAV)], [X, bordo(TAV.terra)], [ang.x, bas.y]]); riemp(c, gradL(c, ang.x, 0, 480, 0, [[0, '#c48f7a'], [1, '#d9a590']]));
      for (const y of [4.5, 3.9, 3.3, 2.8]) { const p0 = proietta(LATO, y, CIMA), p1 = proietta(LATO, y, DAV); trave(p0.x, p0.y, p1.x, p1.y, 2.4 * (p0.k / 40)); }
      trave(ang.x, vt, X, bordo(CIMA), 3.4); trave(ang.x, vm, X, bordo(MEZZO), 2.4); trave(ang.x, vd, X, bordo(DAV), 3.8);
    } else {
      // a sinistra il muro del bar: intonaco chiaro e zoccolo di piastrelle
      c.fillStyle = gradL(c, 0, 0, ang.x, 0, [[0, '#f1e9d8'], [1, '#e2d8c4']]); c.fillRect(0, 0, ang.x, 270);
      poli(c, [[ang.x, vd], [X, bordo(DAV)], [X, bordo(TAV.terra)], [ang.x, bas.y]]); riemp(c, '#d8c7a6');
    }
    c.restore();
    c.beginPath(); c.moveTo(ang.x, ang.y); c.lineTo(bas.x, bas.y); tratto(c, 'rgba(60,50,60,0.35)', 1);
  }

  // --- il bar, a sinistra: la tettoia di legno, gli scaffali con le bottiglie, il bancone ---
  const BX = -3.25, B0 = 2.3, B1 = 5.0, BH = 0.34;      // faccia del bancone verso la sala, da dove a dove, altezza del piano
  const p = (y, h) => proietta(BX, y, h), w = (y, h) => proietta(-LATO, y, h);
  // scaffali sul muro, dietro al bancone
  for (const [h0, h1] of [[0.5, 0.78], [0.84, 1.08]]) {
    quad(c, [w(B0 + 0.5, h1), w(B1 - 0.2, h1), w(B1 - 0.2, h0), w(B0 + 0.5, h0)]); riemp(c, '#6a4a2c');
    for (let y = B0 + 0.62; y < B1 - 0.3; y += 0.16) {
      const q = w(y, h0), alto = (0.16 + rnd() * 0.08) * q.k, col = ['#3f9a4a', '#c8402e', '#e8b93a', '#3a6fc0', '#f0ece0', '#7a3a1e'][Math.floor(rnd() * 6)];
      rrect(c, q.x - 0.035 * q.k, q.y - alto, 0.07 * q.k, alto, 0.6); riemp(c, col);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(q.x - 0.02 * q.k, q.y - alto + 0.6, 0.012 * q.k + 0.3, alto - 1.2);
    }
    c.beginPath(); c.moveTo(w(B0 + 0.5, h0).x, w(B0 + 0.5, h0).y); c.lineTo(w(B1 - 0.2, h0).x, w(B1 - 0.2, h0).y); tratto(c, LEGNO_S, 1.6);
  }
  // la tettoia sopra al bar
  quad(c, [p(B0, 1.5), p(B1, 1.5), p(B1, 1.12), p(B0, 1.12)]); riemp(c, gradL(c, 0, 10, 0, 44, [[0, LEGNO_C], [1, LEGNO]])); tratto(c, CONT, 1);
  quad(c, [p(B0, 1.12), p(B1, 1.12), w(B1, 1.12), w(B0, 1.12)]); riemp(c, LEGNO_S);
  // l'orologio tondo
  { const q = p(3.7, 1.3); ellisse(c, q.x, q.y, 0.1 * q.k, 0.1 * q.k); riemp(c, '#ffffff'); tratto(c, CONT, 0.9); c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x, q.y - 0.07 * q.k); c.moveTo(q.x, q.y); c.lineTo(q.x + 0.05 * q.k, q.y + 0.02 * q.k); tratto(c, CONT, 0.7); }
  // il piano del bancone e la faccia a piastrelle
  quad(c, [p(B0, BH), p(B1, BH), w(B1, BH), w(B0, BH)]); riemp(c, gradL(c, 0, 60, 0, 90, [[0, LEGNO], [1, LEGNO_C]])); tratto(c, CONT, 1);
  const fa = [p(B0, BH), p(B1, BH), p(B1, TAV.terra), p(B0, TAV.terra)];
  quad(c, fa); riemp(c, gradL(c, fa[0].x, 0, fa[1].x, 0, [[0, '#efe3c8'], [1, '#d9caa8']])); tratto(c, CONT, 1.2);
  c.save(); quad(c, fa); c.clip();
  for (let y = B0; y <= B1; y += 0.22) { const q0 = p(y, BH), q1 = p(y, TAV.terra); c.beginPath(); c.moveTo(q0.x, q0.y); c.lineTo(q1.x, q1.y); tratto(c, 'rgba(120,96,60,0.35)', 0.6); }
  for (const h of [0.06, -0.2, -0.48]) { c.beginPath(); c.moveTo(p(B0, h).x, p(B0, h).y); c.lineTo(p(B1, h).x, p(B1, h).y); tratto(c, 'rgba(120,96,60,0.35)', 0.6); }
  // la fascia di piastrelle decorate
  for (let y = B0 + 0.11; y <= B1; y += 0.22) { const q = p(y, -0.07), r = 0.07 * q.k; poli(c, [[q.x, q.y - r], [q.x + r * 0.8, q.y], [q.x, q.y + r], [q.x - r * 0.8, q.y]]); riemp(c, '#c9853a'); ellisse(c, q.x, q.y, r * 0.3, r * 0.3); riemp(c, '#3a6f9a'); }
  c.restore();
  // la cassa e qualche bicchiere sul bancone
  { const q = p(2.9, BH); rrect(c, q.x - 4, q.y - 11, 12, 10, 1.5); riemp(c, '#2a2c38'); tratto(c, CONT, 0.9); rrect(c, q.x - 2.5, q.y - 9.5, 9, 5, 1); riemp(c, '#5aa8e8'); }
  for (const y of [3.5, 3.75, 4.3]) { const q = p(y, BH); rrect(c, q.x - 1.2, q.y - 4.5, 2.8, 4.5, 0.6); riemp(c, 'rgba(255,255,255,0.75)'); tratto(c, 'rgba(60,60,80,0.7)', 0.5); }

  // --- il pilastro bianco ---
  { const q = terra(1.78, 3.25), l = 0.2 * q.k; c.fillStyle = gradL(c, q.x - l / 2, 0, q.x + l / 2, 0, [[0, '#ffffff'], [0.6, '#f0f1f4'], [1, '#c9cdd6']]); c.fillRect(q.x - l / 2, 0, l, q.y); c.strokeStyle = 'rgba(60,60,80,0.45)'; c.lineWidth = 0.8; c.strokeRect(q.x - l / 2, -2, l, q.y + 2); }

  // --- sedie e tavolini (dal fondo verso chi guarda) ---
  const metti = (fn, x, y, ...resto) => { const q = terra(x, y); fn(c, q.x, q.y, q.k, ...resto); };
  metti(tavolino, -1.15, 4.55); metti(sedia, -1.75, 4.5, '#f6f6f2'); metti(sedia, -0.55, 4.6, '#20222a', -1);
  metti(tavolino, 1.0, 4.6); metti(sedia, 0.42, 4.55, '#f6f6f2'); metti(sedia, 1.62, 4.65, '#f6f6f2', -1);
  metti(tavolino, 2.75, 4.1, '#2f9a5a'); metti(sedia, 3.4, 4.05, '#20222a', -1); metti(sedia, 2.15, 4.0, '#f6f6f2');
  metti(sedia, -2.45, 3.9, '#f6f6f2'); metti(tavolino, -1.95, 3.55);
  metti(panche, 3.2, 2.75);
  metti(tavolino, 3.55, 1.75, '#f1f1ee'); metti(sedia, 2.95, 1.7, '#f6f6f2');
  metti(panche, -3.45, 1.55);

  // un velo d'ombra ai bordi, per staccare il tavolo
  c.fillStyle = gradR(c, 240, 150, 150, 330, [[0, 'rgba(31,20,48,0)'], [1, 'rgba(31,20,48,0.3)']]); c.fillRect(0, 0, 480, 270);
}

// ------------------------------------------------------------
//  IL TAVOLO DA PING PONG (in prospettiva: il lato vicino in basso) E LA RETE
// ------------------------------------------------------------
function tavolo(c) {
  c.translate(-TAVOLO_IMG.x, -TAVOLO_IMG.y);
  const A = proietta(-TAV.W, 0), B = proietta(TAV.W, 0), C = proietta(TAV.W, TAV.L), D = proietta(-TAV.W, TAV.L);
  // l'ombra sul pavimento, dietro e ai lati
  c.fillStyle = 'rgba(31,20,48,0.25)';
  poli(c, [[A.x - 16, 272], [D.x - 6, D.y - 3], [C.x + 6, C.y - 3], [B.x + 16, 272]]); c.fill();
  // il piano
  poli(c, [[A.x, A.y], [B.x, B.y], [C.x, C.y], [D.x, D.y]]);
  riemp(c, gradL(c, 0, D.y, 0, A.y, [[0, '#2a5fa8'], [1, '#3f86d8']])); tratto(c, CONT, 1.6);
  c.save(); poli(c, [[A.x, A.y], [B.x, B.y], [C.x, C.y], [D.x, D.y]]); c.clip();
  // i riflessi dei neon
  c.fillStyle = 'rgba(255,255,255,0.07)';
  poli(c, [[A.x + 40, A.y], [A.x + 90, A.y], [D.x + 34, D.y], [D.x + 14, D.y]]); c.fill();
  poli(c, [[B.x - 110, B.y], [B.x - 84, B.y], [C.x - 30, C.y], [C.x - 40, C.y]]); c.fill();
  c.restore();
  // le righe bianche: il bordo e la mezzeria
  const riga = (x0, y0, x1, y1, w) => { const p0 = proietta(x0, y0), p1 = proietta(x1, y1); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); tratto(c, 'rgba(255,255,255,0.92)', w); };
  const m = 0.03;
  riga(-TAV.W + m, m, TAV.W - m, m, 2.6); riga(-TAV.W + m, TAV.L - m, TAV.W - m, TAV.L - m, 1.2);
  riga(-TAV.W + m, m, -TAV.W + m, TAV.L - m, 1.8); riga(TAV.W - m, m, TAV.W - m, TAV.L - m, 1.8);
  riga(0, m, 0, TAV.L - m, 1);
  // lo spessore del piano e il buio sotto
  c.fillStyle = '#1f3f74'; c.fillRect(A.x, A.y, B.x - A.x, 5.5); c.strokeStyle = CONT; c.lineWidth = 1.6; c.strokeRect(A.x, A.y, B.x - A.x, 5.5);
  c.fillStyle = gradL(c, 0, A.y + 5.5, 0, 272, [[0, '#181222'], [1, '#2a2036']]); c.fillRect(A.x + 6, A.y + 5.5, B.x - A.x - 12, 16);
}

function rete(c) {
  c.translate(-RETE_IMG.x, -RETE_IMG.y);
  const y = TAV.rete, a = proietta(-TAV.W - 0.06, y, 0), b = proietta(TAV.W + 0.06, y, 0), alto = TAV.altoRete * a.k;
  // la maglia
  c.fillStyle = 'rgba(20,24,36,0.42)'; c.fillRect(a.x, a.y - alto, b.x - a.x, alto);
  for (let x = a.x + 3; x < b.x; x += 3.2) { c.beginPath(); c.moveTo(x, a.y - alto); c.lineTo(x, a.y); tratto(c, 'rgba(255,255,255,0.16)', 0.5); }
  for (let yy = a.y - alto + 3; yy < a.y; yy += 3) { c.beginPath(); c.moveTo(a.x, yy); c.lineTo(b.x, yy); tratto(c, 'rgba(255,255,255,0.16)', 0.5); }
  // la fettuccia bianca in alto e i due sostegni
  rrect(c, a.x, a.y - alto - 1.2, b.x - a.x, 2.6, 1); riemp(c, '#ffffff'); tratto(c, CONT, 0.8);
  for (const p of [a, b]) { rrect(c, p.x - 1.6, p.y - alto - 3, 3.2, alto + 5.5, 1); riemp(c, '#2a2c38'); tratto(c, CONT, 0.8); }
}

// ------------------------------------------------------------
//  BICCHIERE DI PLASTICA TRASPARENTE PIENO DI BIRRA, PALLINA, MANO, LAMPADINA, E IL RESTO
// ------------------------------------------------------------
function bicchiere(c) {
  const cx = 15, yt = 5, yb = 33, rt = 13, rb = 8.6;
  const corpo = () => { c.beginPath(); c.moveTo(cx - rt, yt); c.lineTo(cx - rb, yb - 1); c.quadraticCurveTo(cx, yb + 2.6, cx + rb, yb - 1); c.lineTo(cx + rt, yt); c.closePath(); };
  // la plastica
  corpo(); riemp(c, 'rgba(255,255,255,0.3)');
  // la birra (fino a tre quarti) con la schiuma
  c.save(); corpo(); c.clip();
  c.fillStyle = gradL(c, cx - rt, 0, cx + rt, 0, [[0, '#f2a81e'], [0.35, '#ffd24a'], [0.7, '#f6b52a'], [1, '#d98a10']]); c.fillRect(0, 13, 30, 24);
  c.fillStyle = '#fff7df'; c.fillRect(0, 10.5, 30, 4.2);
  for (const [bx, by, br] of [[9, 20, 0.9], [18, 26, 0.8], [13, 29, 0.6], [21, 18, 0.7], [11, 25, 0.5]]) { ellisse(c, bx, by, br, br); riemp(c, 'rgba(255,255,255,0.65)'); }
  // le righe della plastica e il riflesso
  for (const k of [-0.62, -0.25, 0.2, 0.6]) { c.beginPath(); c.moveTo(cx + k * rt, yt); c.lineTo(cx + k * rb, yb); tratto(c, 'rgba(255,255,255,0.3)', 0.6); }
  poli(c, [[cx - rt + 2.2, yt + 1], [cx - rt + 5.4, yt + 1], [cx - rb + 3.8, yb - 3], [cx - rb + 1.6, yb - 3]]); riemp(c, 'rgba(255,255,255,0.5)');
  c.restore();
  corpo(); tratto(c, 'rgba(43,27,23,0.85)', 1.1);
  // la bocca: l'orlo arrotolato
  ellisse(c, cx, yt, rt, 3.4); riemp(c, 'rgba(255,255,255,0.38)'); tratto(c, 'rgba(43,27,23,0.85)', 1.1);
  ellisse(c, cx, yt, rt - 1.5, 2.4); tratto(c, 'rgba(255,255,255,0.85)', 0.9);
}

function pallina(c) {
  ellisse(c, 8, 8, 6.5, 6.5); riemp(c, gradR(c, 6, 5.6, 0.6, 7.4, [[0, '#ffffff'], [0.7, '#f1f1ee'], [1, '#c9ccd4']])); tratto(c, CONT, 0.9);
  ellisse(c, 5.8, 5.4, 1.9, 1.3, -0.6); riemp(c, 'rgba(255,255,255,0.95)');
}

// la mano di chi tira (dal basso), con la pallina tra pollice e indice: pelle = colore della pelle
export function manoPong(c, pelle) {
  const P = pelle, S = scuro(pelle, 0.16);
  // avambraccio
  poli(c, [[11, 62], [15, 34], [31, 34], [36, 62]]); riemp(c, gradL(c, 11, 0, 36, 0, [[0, P], [1, S]])); tratto(c, CONT, 1.7);
  // palmo
  rrect(c, 12.5, 18, 21, 20, 7); riemp(c, P); tratto(c, CONT, 1.7);
  // le tre dita chiuse
  for (const [x, y] of [[27, 15.5], [31, 19], [33, 24]]) { rrect(c, x - 3.2, y - 3, 7.5, 8.5, 3.2); riemp(c, P); tratto(c, CONT, 1.5); }
  // pollice e indice che tengono la pallina
  c.beginPath(); c.moveTo(14.5, 27); c.quadraticCurveTo(10.5, 16, 17, 10.5); tratto(c, CONT, 8.2); c.beginPath(); c.moveTo(14.5, 27); c.quadraticCurveTo(10.5, 16, 17, 10.5); tratto(c, P, 5.2);
  c.beginPath(); c.moveTo(24, 21); c.quadraticCurveTo(29.5, 13, 27, 9.5); tratto(c, CONT, 8.2); c.beginPath(); c.moveTo(24, 21); c.quadraticCurveTo(29.5, 13, 27, 9.5); tratto(c, P, 5.2);
  ellisse(c, 20, 27, 5, 3.4); riemp(c, alfa(S, 0.5));
}

function lampada(c) {
  c.beginPath(); c.moveTo(15, 0); c.lineTo(15, 27); tratto(c, '#1b1b22', 1.2);
  alone(c, 15, 37, 15, '#fff3b0', 0.75);
  rrect(c, 11.6, 26, 6.8, 6.5, 1.4); riemp(c, '#3a3c48'); tratto(c, CONT, 0.9);
  ellisse(c, 15, 37.5, 5.6, 6.2); riemp(c, gradR(c, 14, 36, 0.5, 7, [[0, '#ffffff'], [0.5, '#fff6b8'], [1, '#ffd24a']])); tratto(c, CONT, 0.9);
  c.beginPath(); c.moveTo(13.2, 36); c.lineTo(14.4, 39); c.lineTo(15.6, 36); c.lineTo(16.8, 39); tratto(c, 'rgba(200,120,20,0.8)', 0.6);
}

// il buio attorno alla luce della lampadina (per la gag: quando dondola, la luce va e viene).
// È più largo dello schermo (720): così può spostarsi di lato senza scoprire i bordi.
function luce(c) {
  c.fillStyle = gradR(c, 360, 150, 60, 300, [[0, 'rgba(14,8,30,0)'], [0.55, 'rgba(14,8,30,0.5)'], [1, 'rgba(14,8,30,0.82)']]);
  c.fillRect(0, 0, 720, 270);
}

function fiammella(c) {
  c.beginPath(); c.moveTo(6, 0.5); c.bezierCurveTo(11.5, 6, 11.5, 12, 6, 15.5); c.bezierCurveTo(0.5, 12, 0.5, 6, 6, 0.5); c.closePath();
  riemp(c, gradL(c, 0, 0, 0, 16, [[0, '#ffe14a'], [0.5, '#ff9a2e'], [1, '#ff4a2e']])); tratto(c, 'rgba(160,40,10,0.8)', 0.7);
  c.beginPath(); c.moveTo(6, 6); c.bezierCurveTo(8.6, 9, 8.6, 12, 6, 14); c.bezierCurveTo(3.4, 12, 3.4, 9, 6, 6); c.closePath(); riemp(c, '#fff6b8');
}

// una giacca buttata addosso a chi dorme sul tavolo
function giacca(c) {
  c.beginPath(); c.moveTo(4, 26); c.quadraticCurveTo(2, 9, 20, 5); c.quadraticCurveTo(32, 1, 44, 5); c.quadraticCurveTo(62, 9, 60, 26); c.quadraticCurveTo(32, 31, 4, 26); c.closePath();
  riemp(c, gradL(c, 0, 4, 0, 28, [[0, '#44506e'], [1, '#2b3350']])); tratto(c, CONT, 1.5);
  poli(c, [[25, 4.5], [32, 12], [39, 4.5], [35, 3.4], [32, 6], [29, 3.4]]); riemp(c, '#5a6890'); tratto(c, CONT, 1);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(32 + s * 9, 9); c.quadraticCurveTo(32 + s * 16, 17, 32 + s * 13, 27); tratto(c, 'rgba(20,24,40,0.55)', 1); }
  for (const y of [14, 19, 24]) { ellisse(c, 32, y, 1.1, 1.1); riemp(c, '#c9cdd6'); }
}

export function creaPallaio(scene) {
  tela(scene, 'bgPallaio', 480, 270, sfondo);
  tela(scene, 'tavoloPong', TAVOLO_IMG.w, TAVOLO_IMG.h, tavolo);
  tela(scene, 'retePong', RETE_IMG.w, RETE_IMG.h, rete);
  tela(scene, 'bicchierePong', BICCHIERE_IMG.w, BICCHIERE_IMG.h, bicchiere, 8);
  tela(scene, 'pallinaPong', PALLINA_IMG.lato, PALLINA_IMG.lato, pallina, 8);
  tela(scene, 'lampadaPong', 30, 46, lampada, 6);
  tela(scene, 'lucePong', 720, 270, luce, 1);
  tela(scene, 'fiammella', 12, 16, fiammella, 8);
  tela(scene, 'giaccaPong', 64, 32, giacca, 6);
}
