// Il PowerStation, il bar degli amici (La Spina): le foto incorniciate del gruppo alle pareti.
// Una foto è a tre strati: il fondo (fondoFoto), sopra i ritratti dei personaggi (li mette la scena,
// ritagliati dalle loro figure, così sono sempre uguali ai personaggi veri) e sopra ancora la
// cornice, col riflesso del vetro (cornice). Unità logiche, come gli sfondi.
import { CONT, tratto, ellisse, rrect, poli, gradL, chiaro, scuro, casuale } from './base.js';

export const BORDO_FOTO = 3.5;   // lo spessore della cornice (unità)
export const TIPI_FOTO = ['mare', 'bar', 'prato', 'festa'];

// il fondo della foto (w x h): al mare, al bar, sul prato o a una festa
export function fondoFoto(c, w, h, tipo) {
  const r = casuale(w * 7 + h * 13 + tipo.length);
  if (tipo === 'mare') {
    c.fillStyle = gradL(c, 0, 0, 0, h, [[0, '#7cc4f2'], [0.55, '#cfeafc'], [0.56, '#2f86c6'], [1, '#1d5f9a']]); c.fillRect(0, 0, w, h);
    ellisse(c, w * 0.78, h * 0.2, 3, 3); c.fillStyle = '#fff4b8'; c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)';
    for (let i = 0; i < 4; i++) c.fillRect(r() * w, h * (0.62 + r() * 0.3), 3 + r() * 4, 0.5);
  } else if (tipo === 'prato') {
    c.fillStyle = gradL(c, 0, 0, 0, h, [[0, '#9fd6f5'], [1, '#e2f4fb']]); c.fillRect(0, 0, w, h);
    c.beginPath(); c.moveTo(0, h * 0.6); c.quadraticCurveTo(w * 0.5, h * 0.42, w, h * 0.62); c.lineTo(w, h); c.lineTo(0, h); c.closePath();
    c.fillStyle = gradL(c, 0, h * 0.45, 0, h, [[0, '#7cc25a'], [1, '#3f8a34']]); c.fill();
  } else if (tipo === 'festa') {
    c.fillStyle = gradL(c, 0, 0, 0, h, [[0, '#2a1640'], [1, '#4a1f52']]); c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { ellisse(c, r() * w, r() * h * 0.7, 1 + r() * 1.6, 1 + r() * 1.6); c.fillStyle = ['rgba(255,95,162,0.7)', 'rgba(255,225,74,0.7)', 'rgba(110,200,255,0.7)'][i % 3]; c.fill(); }
  } else {
    // al bar: legno caldo e le luci sfocate
    c.fillStyle = gradL(c, 0, 0, 0, h, [[0, '#6a3a1e'], [1, '#3a1e0e']]); c.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) { ellisse(c, r() * w, r() * h * 0.6, 1.4 + r() * 1.8, 1.4 + r() * 1.8); c.fillStyle = 'rgba(255,200,110,0.45)'; c.fill(); }
  }
}

// la cornice (w x h fuori tutto, più l'ombra sul muro): legno scuro col filo dorato dentro, il buco
// per la foto e il riflesso del vetro sopra
export function cornice(c, w, h, legno = '#4a2a16') {
  const b = BORDO_FOTO, iw = w - 2 * b, ih = h - 2 * b;
  rrect(c, 1.2, 1.6, w, h, 1); c.fillStyle = 'rgba(0,0,0,0.38)'; c.fill();                 // l'ombra
  c.beginPath(); c.rect(0, 0, w, h); c.rect(b, b, iw, ih);
  c.fillStyle = gradL(c, 0, 0, w, h, [[0, chiaro(legno, 0.28)], [0.5, legno], [1, scuro(legno, 0.32)]]); c.fill('evenodd');
  c.beginPath(); c.rect(0.35, 0.35, w - 0.7, h - 0.7); tratto(c, CONT, 0.7);
  c.beginPath(); c.rect(b - 0.9, b - 0.9, iw + 1.8, ih + 1.8); tratto(c, '#d8a23c', 0.7);       // il filo dorato
  c.beginPath(); c.rect(b, b, iw, ih); tratto(c, CONT, 0.6);
  // il riflesso sul vetro: una banda chiara di traverso
  c.save(); c.beginPath(); c.rect(b, b, iw, ih); c.clip();
  poli(c, [[b, b + ih * 0.5], [b + iw * 0.45, b], [b + iw * 0.7, b], [b, b + ih * 0.85]]); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fill();
  c.restore();
  ellisse(c, w / 2, -2.2, 1, 1); c.fillStyle = '#c9a24a'; c.fill();                          // il chiodino
  c.beginPath(); c.moveTo(w * 0.3, 0.4); c.lineTo(w / 2, -2.2); c.lineTo(w * 0.7, 0.4); tratto(c, 'rgba(30,20,10,0.6)', 0.4);
}
