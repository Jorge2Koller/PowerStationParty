// Che dispositivo è: col dito (telefono, tablet) oppure computer con tastiera e mouse.
// Decide quali testi e comandi mostrare (eTouch() in fx.js) e la risoluzione (RES).
// Per provarlo dal computer: index.html?touch=1 (o ?touch=0 per il contrario).
const forzato = new URLSearchParams(location.search).get('touch');
const dito = () => matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && !matchMedia('(pointer: fine)').matches);

let touch = forzato != null ? forzato === '1' : dito();

// com'era all'avvio (per le scelte che non possono cambiare a partita iniziata, come RES)
export const TOUCH_ALL_AVVIO = touch;

// se su un computer arriva un tocco vero (portatile col touchscreen), da lì in poi testi per il dito
if (forzato == null) window.addEventListener('touchstart', () => { touch = true; }, { capture: true, passive: true });

export const eTouch = () => touch;
