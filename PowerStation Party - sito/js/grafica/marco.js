// Primo piano di Marco per il microgioco della barba.
// La faccia vive in uno spazio di 96x104 unità (sullo schermo è grande il doppio).
// Strati: base (testa, occhi, capelli) -> barba -> schiuma -> top (naso e bocca).
import { RES, tela, fuoriSchermo, tratto, ellisse, rrect, gradR, casuale } from './base.js';
import { PERSONAGGI, disegnaTesta, disegnaMantellina } from './personaggi.js';

export const FACCIA = { w: 96, h: 104, dens: RES * 2, densDin: 6 }; // dens = 8 su computer, 6 su telefono
export const ESPR_MARCO = ['normale', 'parla', 'urlo', 'sbadiglio', 'starnuto', 'felice', 'sconvolto'];

// dallo spazio del personaggio (192x288) a quello della faccia (96x104)
const inFaccia = (c) => { c.translate(0, -9); c.scale(0.5, 0.5); };
const dentro = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

// dove cresce la barba: esageratamente folta, deborda oltre la mascella
export const mascheraBarba = (x, y) =>
  y >= 43 &&
  dentro(x, y, 48, 65, 36, 33) &&
  Math.abs(x - 48) <= 29.5 + Math.max(0, y - 57) * 0.9 &&
  !dentro(x, y, 48, 44, 23.5, 18.5) &&
  !(x >= 40 && x < 56 && y >= 67.5 && y < 72.5);

// zone "folte": lì servono due passate
export const zonaFolta = (x, y) => dentro(x, y, 48, 84, 15, 11) || dentro(x, y, 48, 65, 11, 2.8);

// zone delicate: naso, labbra (più grandi a bocca aperta), occhi, orecchie
export const zonaDelicata = (x, y, boccaAperta = false) =>
  dentro(x, y, 48, 57, 5.5, 5) ||
  (boccaAperta ? dentro(x, y, 48, 72, 9.5, 8.5) : x >= 41 && x < 55 && y >= 68.5 && y < 72.5) ||
  dentro(x, y, 35, 47.5, 7.5, 7.5) || dentro(x, y, 61, 47.5, 7.5, 7.5) ||
  dentro(x, y, 17.5, 51, 4, 6.5) || dentro(x, y, 78.5, 51, 4, 6.5);

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
  ARTE.folta = fuoriSchermo(96, 104, D, (c) => peli(c, '#090707', 'rgba(70,70,98,0.9)', 'rgba(120,120,150,0.7)'));
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
