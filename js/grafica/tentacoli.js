// I tentacoli del Petri ("il Piovra"): viola, con le ventose rosa e la punta arricciata.
// Non sono texture: si ridisegnano a ogni fotogramma con un Graphics di Phaser, così si
// allungano, si piegano e si ritraggono. Le misure sono in unità di gioco (schermo 480x270).
import { CONT } from './base.js';

const C = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;
export const COLORI_TENTACOLO = { pelle: '#9a4fd0', luce: '#c993f2', ventosa: '#f8c6ec', bordo: '#7a2fa8', schiaffo: '#ff6a8a' };

// Punti lungo un tentacolo che parte da (x0, y0) e arriva fino a (x1, y1).
//  piega = quanto si curva di lato (unità), onda = ampiezza dell'ondeggiare, fase = tempo,
//  ricciolo = quanto si arriccia la punta (0..1), n = numero di punti
export function curvaTentacolo(x0, y0, x1, y1, o = {}) {
  const n = o.n ?? 14, piega = o.piega ?? 0, onda = o.onda ?? 3, fase = o.fase ?? 0, ricciolo = o.ricciolo ?? 0.6;
  const dx = x1 - x0, dy = y1 - y0, L = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / L, ny = dx / L;                       // normale (a sinistra della direzione)
  const cx = (x0 + x1) / 2 + nx * piega, cy = (y0 + y1) / 2 + ny * piega;
  const punti = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), u = 1 - t;
    const ox = Math.sin(t * Math.PI * 2 + fase) * onda * t;
    punti.push({ x: u * u * x0 + 2 * u * t * cx + t * t * x1 + nx * ox, y: u * u * y0 + 2 * u * t * cy + t * t * y1 + ny * ox });
  }
  // la punta che si arriccia: qualche punto in più che gira su sé stesso
  if (ricciolo > 0 && L > 12) {
    const a = punti[n - 2], b = punti[n - 1];
    let ang = Math.atan2(b.y - a.y, b.x - a.x);
    const r = 4 * ricciolo + 1.5;
    let x = b.x, y = b.y;
    for (let k = 0; k < 4; k++) {
      ang += 0.75 * ricciolo + 0.25;
      x += Math.cos(ang) * r; y += Math.sin(ang) * r;
      punti.push({ x, y });
    }
  }
  return punti;
}

// Disegna il tentacolo lungo i punti. o.base / o.punta = spessore all'attacco e in cima,
// o.tinta = colore della pelle (rosso quando ha appena preso lo schiaffo)
export function disegnaTentacolo(g, punti, o = {}) {
  const n = punti.length, base = o.base ?? 14, punta = o.punta ?? 3.2;
  const pelle = C(o.tinta ?? COLORI_TENTACOLO.pelle), luce = C(COLORI_TENTACOLO.luce), cont = C(CONT);
  const w = (i) => base + (punta - base) * (i / (n - 1));
  // contorno, poi la pelle, poi il riflesso: segmenti con le giunture tonde
  for (const [col, extra] of [[cont, 2.6], [pelle, 0]]) {
    for (let i = 0; i < n; i++) {
      const p = punti[i], s = w(i) + extra;
      g.fillStyle(col, 1); g.fillCircle(p.x, p.y, s / 2);
      if (i < n - 1) { g.lineStyle(s, col, 1); g.lineBetween(p.x, p.y, punti[i + 1].x, punti[i + 1].y); }
    }
  }
  // riflesso sul dorso e ventose sotto
  for (let i = 0; i < n - 1; i++) {
    const p = punti[i], q = punti[i + 1], dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L, s = w(i);
    if (i < n - 3) { g.lineStyle(s * 0.28, luce, 0.8); g.lineBetween(p.x + nx * s * 0.22, p.y + ny * s * 0.22, q.x + nx * s * 0.22, q.y + ny * s * 0.22); }
    if (i % 2 === 1 && i < n - 4) {
      const vx = p.x - nx * s * 0.2, vy = p.y - ny * s * 0.2, r = Math.max(1, s * 0.25);
      g.fillStyle(C(COLORI_TENTACOLO.bordo), 1); g.fillCircle(vx, vy, r + 0.6);
      g.fillStyle(C(COLORI_TENTACOLO.ventosa), 1); g.fillCircle(vx, vy, r);
      g.fillStyle(C(COLORI_TENTACOLO.bordo), 0.8); g.fillCircle(vx, vy, r * 0.4);
    }
  }
}
