// Strumenti comuni per disegnare la grafica vettoriale su canvas.
// Si disegna in "unità logiche" (lo schermo di gioco è 480x270): la texture
// reale è più grande di RES volte, così resta nitida a 1920x1080.
import { TOUCH_ALL_AVVIO } from '../dispositivo.js';

// Pixel reali per unità logica. Computer: 4 (1920x1080). Telefoni e tablet: 3 (1440x810),
// metà dei pixel da disegnare e metà della memoria per le texture: su iPhone i canvas
// hanno un tetto di memoria, e i telefoni economici faticano a riempire 1920x1080 a 60 fps.
// Sullo schermo di un telefono (circa 850x390 punti) 1440x810 resta nitido.
// Si può forzare con ?res=2, ?res=3 o ?res=4 nell'indirizzo.
const resUrl = Number(new URLSearchParams(location.search).get('res'));
export const RES = [2, 3, 4].includes(resUrl) ? resUrl : TOUCH_ALL_AVVIO ? 3 : 4;
export const Q = 1 / RES;      // scala da dare alle immagini per vederle a grandezza naturale
export const SP = Q / 3;       // personaggi: "taglia 3" = grandezza naturale (96x144 unità)
export const CONT = '#2b1b17'; // colore dei contorni

// densità (pixel per unità) di ogni texture creata: serve a im() in fx.js
export const DENS = {};

export function tela(scene, key, w, h, fn, dens = RES) {
  DENS[key] = dens;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const t = scene.textures.createCanvas(key, Math.ceil(w * dens), Math.ceil(h * dens));
  const c = t.context;
  c.save();
  c.scale(dens, dens);
  c.lineJoin = 'round';
  c.lineCap = 'round';
  fn(c);
  c.restore();
  t.refresh();
  return t;
}

// canvas fuori schermo (per "arte" da comporre a runtime, es. la barba)
export function fuoriSchermo(w, h, dens, fn) {
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w * dens);
  cv.height = Math.ceil(h * dens);
  const c = cv.getContext('2d');
  c.scale(dens, dens);
  c.lineJoin = 'round';
  c.lineCap = 'round';
  fn?.(c);
  return cv;
}

export const riemp = (c, col) => { c.fillStyle = col; c.fill(); };
export const tratto = (c, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.stroke(); };
export const ellisse = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2); };
export const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
export const poli = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };

export function gradL(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}
export function gradR(c, x, y, r0, r1, stops) {
  const g = c.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export function mix(a, b, t) {
  const A = rgb(a), B = rgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
export const scuro = (col, t = 0.2) => mix(col, '#000000', t);
export const chiaro = (col, t = 0.2) => mix(col, '#ffffff', t);
// tono leggermente diverso, più chiaro sui colori scuri e più scuro sui chiari
export const risalto = (col) => { const [r, g, b] = rgb(col); return r * 0.3 + g * 0.59 + b * 0.11 > 140 ? scuro(col, 0.25) : chiaro(col, 0.18); };
export const alfa = (col, a) => { const [r, g, b] = rgb(col); return `rgba(${r},${g},${b},${a})`; };

// generatore casuale con seme: stessa grafica a ogni avvio
export function casuale(seme) {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// alone luminoso morbido
export function alone(c, x, y, r, col, a = 0.5) {
  c.fillStyle = gradR(c, x, y, 0, r, [[0, alfa(col, a)], [1, alfa(col, 0)]]);
  c.fillRect(x - r, y - r, r * 2, r * 2);
}
