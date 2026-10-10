// Primo piano di Marco per il microgioco della barba.
// La faccia vive in uno spazio di 96x104 unità (sullo schermo è grande il doppio).
// Strati: base (testa, occhi, capelli) -> barba -> schiuma -> top (naso e bocca).
import { RES, tela, fuoriSchermo, tratto, ellisse, rrect, gradR, casuale } from './base.js';
import { PERSONAGGI, disegnaTesta, disegnaMantellina, sagomaTesta } from './personaggi.js';

export const FACCIA = { w: 96, h: 104, dens: RES * 2, densDin: 6 }; // dens = 8 su computer, 6 su telefono
export const ESPR_MARCO = ['normale', 'parla', 'urlo', 'sbadiglio', 'starnuto', 'felice', 'sconvolto'];

// dallo spazio del personaggio (192x288) a quello della faccia (96x104)
const inFaccia = (c) => { c.translate(0, -9); c.scale(0.5, 0.5); };
const dentro = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

// La sagoma del viso (senza orecchie), un punto per unità della faccia: si ricava dallo stesso
// tracciato con cui la testa viene disegnata, così coincide con quello che si vede.
let viso = null;
function pelle(x, y) {
  if (!viso) {
    const c = fuoriSchermo(FACCIA.w, FACCIA.h, 1).getContext('2d');
    inFaccia(c); sagomaTesta(c, PERSONAGGI.marco.faccia);
    viso = new Uint8Array(FACCIA.w * FACCIA.h);
    for (let py = 0; py < FACCIA.h; py++) for (let px = 0; px < FACCIA.w; px++) viso[py * FACCIA.w + px] = c.isPointInPath(px + 0.5, py + 0.5) ? 1 : 0;
  }
  const px = Math.floor(x), py = Math.floor(y);
  return px >= 0 && py >= 0 && px < FACCIA.w && py < FACCIA.h && viso[py * FACCIA.w + px] === 1;
}

// sul viso, e ad almeno "margine" unità dal bordo: nei e cerotti stanno sulla pelle,
// non sulla mantellina o sulla poltrona
export function sulViso(x, y, margine = 0) {
  if (!pelle(x, y)) return false;
  if (margine > 0) for (let a = 0; a < 8; a++) if (!pelle(x + Math.cos(a * 0.785) * margine, y + Math.sin(a * 0.785) * margine)) return false;
  return true;
}

// Dove cresce la barba: guance, baffi e mento. È folta, quindi esce un po' dal viso (di più
// sotto il mento), ma poco: sotto la barba ci dev'essere la faccia. Vicino alle orecchie
// non esce per niente, se no le coprirebbe.
const FUORI = 3, SOTTO = 6;
export const mascheraBarba = (x, y) =>
  y >= 43 &&
  (pelle(x, y) || pelle(x, y - SOTTO / 2) || pelle(x, y - SOTTO) || (y >= 58 && (pelle(x - FUORI, y) || pelle(x + FUORI, y)))) &&
  !dentro(x, y, 48, 44, 23.5, 18.5) &&
  !(x >= 40 && x < 56 && y >= 67.5 && y < 72.5);

// Zone delicate: naso, labbra, occhi, orecchie. Devono coincidere con quello che si vede
// (se sono più grandi del disegno, scatta l'errore anche a chi sta radendo bene); naso e
// labbra chiuse sono anzi un filo più piccoli, per lasciare passare il rasoio sui baffi.
// La bocca aperta è grande quanto è disegnata in quell'espressione: [cx, cy, rx, ry].
// L'urlo non c'è apposta: è la reazione a un errore, non deve provocarne subito un altro.
const BOCCA_APERTA = {
  parla: [48, 70.5, 5.8, 4.3],
  sbadiglio: [48, 72.5, 6.8, 9.2],
};
export const zonaDelicata = (x, y, espr = 'normale') =>
  dentro(x, y, 48, 56.8, 5, 4.6) ||                                                 // naso
  (BOCCA_APERTA[espr] ? dentro(x, y, ...BOCCA_APERTA[espr]) : x >= 41.5 && x < 54.5 && y >= 69 && y < 72.5) ||
  dentro(x, y, 35, 47.5, 6.6, 7.1) || dentro(x, y, 61, 47.5, 6.6, 7.1) ||           // occhi
  // orecchie: solo la parte che spunta dalla testa (sulla basetta lì accanto cresce la barba)
  dentro(x, y, 15.5, 51, 3, 6.5) || dentro(x, y, 80.5, 51, 3, 6.5);

// "arte" della barba e della schiuma: canvas fuori schermo che la scena
// ritaglia a runtime in base alle celle ancora da radere
export const ARTE = {};

function creaArte() {
  const D = FACCIA.densDin, r = casuale(42);
  const peli = (c, base, luce, luce2) => {
    c.fillStyle = base; c.fillRect(0, 0, 96, 104);
    c.fillStyle = gradR(c, 48, 72, 8, 46, [[0, 'rgba(0,0,0,0.3)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 0, 96, 104);
    for (let i = 0; i < 3200; i++) {
      const x = r() * 96, y = 40 + r() * 64, d = (x - 48) * 0.035, l = 2 + r() * 2.6;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + d * l * 0.5, y + l * 0.6, x + d * l, y + l);
      tratto(c, i % 5 === 0 ? luce2 : luce, 0.45);
    }
  };
  ARTE.barba = fuoriSchermo(96, 104, D, (c) => peli(c, '#1e1713', 'rgba(98,78,64,0.85)', 'rgba(8,5,4,0.9)'));
  ARTE.schiuma = fuoriSchermo(96, 104, D, (c) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, 96, 104);
    for (let i = 0; i < 900; i++) {
      ellisse(c, r() * 96, 36 + r() * 68, 0.4 + r() * 1.1, 0.4 + r() * 1.1);
      tratto(c, 'rgba(150,180,220,0.45)', 0.3);
    }
    for (let i = 0; i < 300; i++) { ellisse(c, r() * 96, 36 + r() * 68, 1.5, 1.2); c.fillStyle = 'rgba(205,220,240,0.35)'; c.fill(); }
  });
  ARTE.tmp = fuoriSchermo(96, 104, D);
}

export function creaMarco(scene) {
  const p = PERSONAGGI.marco;
  for (const e of ESPR_MARCO) {
    tela(scene, `marcoBase_${e}`, 96, 104, (c) => {
      inFaccia(c);
      disegnaMantellina(c, p);
      disegnaTesta(c, p, e, { strato: 'base', senzaBarba: true });
    }, FACCIA.dens);
    tela(scene, `marcoTop_${e}`, 96, 104, (c) => { inFaccia(c); disegnaTesta(c, p, e, { strato: 'top' }); }, FACCIA.dens);
  }
  creaArte();

  // neo: da evitare col rasoio
  tela(scene, 'neo', 6, 6, (c) => {
    ellisse(c, 3, 3, 2.3, 2.1); c.fillStyle = '#f0c8a8'; c.fill();
    ellisse(c, 3, 3, 1.6, 1.5); c.fillStyle = '#7a3f22'; c.fill(); tratto(c, '#3a1c0e', 0.35);
    ellisse(c, 2.5, 2.5, 0.5, 0.4); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
    c.beginPath(); c.moveTo(3.4, 2.2); c.quadraticCurveTo(4.6, 0.8, 5.2, 1.4); tratto(c, '#1e1713', 0.3);
  }, 16);

  // cerotto: uno per ogni taglietto
  tela(scene, 'cerotto', 12, 6, (c) => {
    rrect(c, 0.5, 1, 11, 4, 2); c.fillStyle = '#f2c9a0'; c.fill(); tratto(c, '#b98a62', 0.4);
    rrect(c, 4, 1.4, 4, 3.2, 0.6); c.fillStyle = '#fbe6cf'; c.fill();
    c.fillStyle = '#b98a62';
    for (const x of [1.8, 2.8, 9.2, 10.2]) for (const y of [2.3, 3.7]) { ellisse(c, x, y, 0.25, 0.25); c.fill(); }
  }, 16);
}
