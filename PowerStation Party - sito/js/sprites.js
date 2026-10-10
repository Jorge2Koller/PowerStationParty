// Crea tutte le texture del gioco. La grafica è vettoriale, disegnata via
// codice su canvas ad alta risoluzione (cartella js/grafica): nessuna immagine esterna.
import { tela } from './grafica/base.js';
import { CONFIG } from './config.js';
import { PERSONAGGI, RAGAZZE, ESPRESSIONI, BOTA_ABBRONZATO, BOTA_ARAGOSTA, disegnaPersonaggio } from './grafica/personaggi.js';
import { creaMarco } from './grafica/marco.js';
import { creaOggetti } from './grafica/oggetti.js';
import { creaSfondi } from './grafica/sfondi.js';
import { creaBota } from './grafica/bota.js';

export { RES, Q, SP } from './grafica/base.js';
export { FACCIA, ARTE, mascheraBarba, zonaDelicata, sulViso } from './grafica/marco.js';
export { CORPO, GW, GH, PELLE, zonaVietata } from './grafica/bota.js';

export function creaTexture(scene) {
  // personaggi: una texture per espressione, 96x144 unità (disegnati su una griglia 192x288)
  const personaggio = (key, p, e, o) => tela(scene, key, 96, 144, (c) => { c.scale(0.5, 0.5); disegnaPersonaggio(c, p, e, o); });
  for (const [id, p] of Object.entries(PERSONAGGI))
    for (const e of ESPRESSIONI) personaggio(`${id}_${e}`, p, e);
  // Marsupino furioso (il panino rovinato)
  personaggio('marsupino_rabbia', PERSONAGGI.marsupino, 'rabbia');
  // il palleggio col piede: la gamba che si alza in due tempi (1 = a metà, 2 = sul pallone),
  // a destra (D) e a sinistra (S). Per i due giocatori e per lo Zio, che calcia sempre di destro.
  // (lo Zio anche con l'aria di sufficienza: palleggia a braccia conserte)
  for (const id of [...CONFIG.giocatori.map((g) => g.id), 'zio'])
    for (const [lato, nome] of id === 'zio' ? [[1, 'D']] : [[1, 'D'], [-1, 'S']])
      for (const [n, angolo] of [[1, 0.5], [2, 1.12]]) {
        const o = { calcio: { lato, angolo }, posa: 'calcio' };
        personaggio(`${id}_calcio${n}${nome}`, PERSONAGGI[id], 'normale', o);
        if (id === 'zio') personaggio(`${id}_calcio${n}${nome}_sufficienza`, PERSONAGGI[id], 'sufficienza', o);
      }
  // il Bota a fine giornata: abbronzato (occhiolino e pollice in su) oppure rosso aragosta
  // a chiazze, col segno degli occhiali, rigido come un robot
  personaggio('bota_abbronzato', { ...PERSONAGGI.bota, ...BOTA_ABBRONZATO }, 'occhiolino', { posa: 'pollice' });
  personaggio('bota_aragosta', { ...PERSONAGGI.bota, ...BOTA_ARAGOSTA }, 'triste', { posa: 'robot' });
  // Il Passaggiorgio: Giorgio vestito da sera (camicia), con le cuffie quando si fa scarrozzare,
  // e incappucciato con gli occhiali da sole (il travestimento), come l'amico che gli fa da sosia
  const sera = { ...PERSONAGGI.giorgio, vestito: { tipo: 'camicia', colore: '#eef2f8' }, pantaloni: '#2a2c38', scarpe: '#3a2418' };
  for (const e of ESPRESSIONI) personaggio('giorgioSera_' + e, sera, e);
  personaggio('giorgioCuffie', { ...sera, cuffie: true }, 'felice');
  const incognito = { cappuccio: '#3e4452', occhiali: { montatura: '#121216', lenti: '#1c2029' }, vestito: { tipo: 'tshirt', colore: '#3e4452', collo: 'giro', maniche: 'lunghe' }, pantaloni: '#2a2c38' };
  for (const id of ['giorgio', 'marco', 'beppe', 'bota']) {
    const p = { ...PERSONAGGI[id], ...incognito };
    personaggio(`incognito_${id}`, p, 'normale');
    personaggio(`incognito_${id}_shock`, p, 'shock');
  }
  // Petri Tentacolari: le ragazze della disco (ragazza0 ... ragazza4, tutte le espressioni)
  RAGAZZE.forEach((p, i) => { for (const e of ESPRESSIONI) personaggio(`ragazza${i}_${e}`, p, e); });
  personaggio('zioDJ', { ...PERSONAGGI.zio, cuffie: true }, 'felice');   // il DJ
  creaMarco(scene);
  creaOggetti(scene);
  creaSfondi(scene);
  creaBota(scene);
}
