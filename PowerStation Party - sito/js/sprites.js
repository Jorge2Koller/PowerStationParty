// Crea tutte le texture del gioco. La grafica è vettoriale, disegnata via
// codice su canvas ad alta risoluzione (cartella js/grafica): nessuna immagine esterna.
import { tela } from './grafica/base.js';
import { PERSONAGGI, ESPRESSIONI, disegnaPersonaggio } from './grafica/personaggi.js';
import { creaMarco } from './grafica/marco.js';
import { creaOggetti } from './grafica/oggetti.js';
import { creaSfondi } from './grafica/sfondi.js';

export { RES, Q, SP } from './grafica/base.js';
export { FACCIA, ARTE, mascheraBarba, zonaDelicata, zonaFolta } from './grafica/marco.js';

export function creaTexture(scene) {
  // personaggi: una texture per espressione, 96x144 unità (disegnati su una griglia 192x288)
  for (const [id, p] of Object.entries(PERSONAGGI))
    for (const e of ESPRESSIONI) tela(scene, `${id}_${e}`, 96, 144, (c) => { c.scale(0.5, 0.5); disegnaPersonaggio(c, p, e); });
  creaMarco(scene);
  creaOggetti(scene);
  creaSfondi(scene);
}
