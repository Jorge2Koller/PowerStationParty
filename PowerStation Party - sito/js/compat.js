// Compatibilità con i browser meno recenti (soprattutto Safari su iPhone e Mac).
// Va importato per primo in main.js, prima che si disegni qualsiasi cosa.

// roundRect del canvas: tutta la grafica lo usa (rrect in grafica/base.js), ma
// Safari lo ha solo dalla versione 16. Qui lo si ricostruisce con quattro archi.
const proto = window.CanvasRenderingContext2D?.prototype;
if (proto && !proto.roundRect) {
  proto.roundRect = function (x, y, w, h, raggi = 0) {
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    const r = (Array.isArray(raggi) ? raggi : [raggi]).map((v) => Math.max(0, typeof v === 'number' ? v : v?.x ?? 0));
    // stessa logica del CSS: 1, 2, 3 o 4 valori, in senso orario dall'angolo in alto a sinistra
    const [as, ad, bd, bs] = r.length === 1 ? [r[0], r[0], r[0], r[0]]
      : r.length === 2 ? [r[0], r[1], r[0], r[1]]
        : r.length === 3 ? [r[0], r[1], r[2], r[1]] : r;
    // se due raggi non ci stanno su un lato, si riducono tutti in proporzione
    const k = Math.min(1, w / (as + ad || 1), w / (bs + bd || 1), h / (as + bs || 1), h / (ad + bd || 1));
    const [a, b, c, d] = [as * k, ad * k, bd * k, bs * k], P = Math.PI;
    this.moveTo(x + a, y);
    this.arc(x + w - b, y + b, b, -P / 2, 0);
    this.arc(x + w - c, y + h - c, c, 0, P / 2);
    this.arc(x + d, y + h - d, d, P / 2, P);
    this.arc(x + a, y + a, a, P, P * 1.5);
    this.closePath();
    this.moveTo(x, y);
  };
}
