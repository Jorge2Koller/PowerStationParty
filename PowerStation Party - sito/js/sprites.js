// Crea tutte le texture del gioco. La grafica è vettoriale, disegnata via
// codice su canvas ad alta risoluzione (cartella js/grafica): nessuna immagine esterna.
import { tela, DENS } from './grafica/base.js';
import { DOPPIONE } from './sessione.js';
import { PERSONAGGI, RAGAZZE, TIPE, BUTTAFUORI, ESPRESSIONI, BOTA_ABBRONZATO, BOTA_ARAGOSTA, disegnaPersonaggio } from './grafica/personaggi.js';
import { creaMarco } from './grafica/marco.js';
import { creaOggetti } from './grafica/oggetti.js';
import { creaSfondi } from './grafica/sfondi.js';
import { creaBota } from './grafica/bota.js';
import { creaPista } from './grafica/disco.js';
import { creaVialetto } from './grafica/vialetto.js';

export { RES, Q, SP } from './grafica/base.js';
export { FACCIA, ARTE, mascheraBarba, zonaDelicata, sulViso } from './grafica/marco.js';
export { CORPO, GW, GH, PELLE, zonaVietata } from './grafica/bota.js';

// un personaggio in una texture di 96x144 unità (è disegnato su una griglia 192x288)
const figura = (scene, key, p, e, o) => tela(scene, key, 96, 144, (c) => { c.scale(0.5, 0.5); disegnaPersonaggio(c, p, e, o); });

// il palleggio col piede: la gamba che si alza in due tempi (1 = a metà, 2 = sul pallone),
// a destra (D) e a sinistra (S)
function calci(scene, id, p, lati = [[1, 'D'], [-1, 'S']]) {
  for (const [lato, nome] of lati)
    for (const [n, angolo] of [[1, 0.5], [2, 1.12]]) figura(scene, `${id}_calcio${n}${nome}`, p, 'normale', { calcio: { lato, angolo }, posa: 'calcio' });
}

// Le pose in più di chi sta per giocare, create la prima volta che servono (farle per tutti i
// personaggi all'avvio sarebbero un centinaio di immagini in più, quasi tutte inutili): i calci
// del palleggio e, se gioca contro se stesso, il "doppione" travestito in tutte le espressioni.
// La chiama MicrogiocoBase prima di ogni microgioco, e l'intro.
export function preparaGiocatore(scene, id, doppione = false) {
  const p = PERSONAGGI[id];
  if (!p) return;
  if (!scene.textures.exists(`${id}_calcio1D`)) calci(scene, id, p);
  const bis = id + DOPPIONE;
  if (doppione && !scene.textures.exists(`${bis}_normale`)) {
    const finto = { ...p, travestimento: true };
    for (const e of ESPRESSIONI) figura(scene, `${bis}_${e}`, finto, e);
    calci(scene, bis, finto);
  }
}

// Il ritratto di un personaggio: la sua testa, ritagliata dalla figura intera, alta "lato" unità
// e centrata in (x, y). Per la griglia di selezione e per le classifiche. (id può essere anche
// quello di un doppione; espr = l'espressione.)
export function ritratto(scene, x, y, id, lato = 30, espr = 'normale') {
  const h = PERSONAGGI[id.replace(DOPPIONE, '')]?.statura ?? 1;       // chi è più basso ha la testa più giù
  const cima = (284 - 278 * h) / 2, alto = 96 * h, mezzo = 43 * h, key = `${id}_${espr}`, d = DENS[key], k = lato / alto;
  return scene.add.image(x - 48 * k, y - (cima + alto / 2) * k, key).setOrigin(0).setScale(k / d).setCrop((48 - mezzo) * d, cima * d, mezzo * 2 * d, alto * d);
}

export function creaTexture(scene) {
  // personaggi: una texture per espressione
  const personaggio = (key, p, e, o) => figura(scene, key, p, e, o);
  for (const [id, p] of Object.entries(PERSONAGGI))
    for (const e of ESPRESSIONI) personaggio(`${id}_${e}`, p, e);
  // Marsupino furioso (il panino rovinato)
  personaggio('marsupino_rabbia', PERSONAGGI.marsupino, 'rabbia');
  // il palleggio col piede dello Zio (calcia sempre di destro, anche con l'aria di sufficienza:
  // palleggia a braccia conserte). Quelli dei giocatori si creano dopo, solo per chi gioca:
  // vedi preparaGiocatore qui sotto.
  calci(scene, 'zio', PERSONAGGI.zio, [[1, 'D']]);
  for (const [n, angolo] of [[1, 0.5], [2, 1.12]]) personaggio(`zio_calcio${n}D_sufficienza`, PERSONAGGI.zio, 'sufficienza', { calcio: { lato: 1, angolo } });
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
  // "L'Incubo degli Scapoli". Il Manna: balla in due tempi, festeggia (si sistema la collanina e
  // indica il pubblico), fa l'occhiolino, si dispera per la macchia, risponde alla mamma, se ne
  // va toccandosi la collanina. Le sue ragazze (tipa0 ... tipa4, altre da quelle di Petri
  // Tentacolari): normali, conquistate (felici), annoiate (sbadiglio). E il buttafuori.
  const manna = PERSONAGGI.manna, macchiato = { ...manna, macchia: '#f08a2e' };
  personaggio('manna_balla1', manna, 'normale', { posa: 'balla1' });
  personaggio('manna_balla2', manna, 'normale', { posa: 'balla2' });
  personaggio('manna_colpo', manna, 'occhiolino', { posa: 'indica' });
  personaggio('manna_occhiolino', manna, 'occhiolino', { posa: 'pollice' });
  personaggio('manna_macchia', macchiato, 'shock');
  personaggio('manna_macchiaTriste', macchiato, 'triste');
  personaggio('manna_telefono', manna, 'parla', { posa: 'alTelefono', accessorio: 'cellulare' });
  personaggio('manna_collana', manna, 'triste', { posa: 'collana' });
  TIPE.forEach((r, i) => { for (const e of ['normale', 'felice', 'sbadiglio']) personaggio(`tipa${i}_${e}`, r, e, { posa: r.accessorio }); });
  personaggio('buttafuori', BUTTAFUORI, 'sufficienza');
  personaggio('buttafuori_chiede', BUTTAFUORI, 'normale', { posa: 'chiede' });
  // "Emilio in Retromarcia". Emilio disperato (le mani nella bandana; per lo spavento gli occhiali
  // gli scivolano sul naso); Pastaffi che corre gridando e che porta il cane in braccio
  personaggio('emilio_disperato', PERSONAGGI.emilio, 'shock', { posa: 'maniInTesta', maniSopra: true });
  personaggio('pastaffi_corre', PERSONAGGI.pastaffi, 'urlo', { posa: 'shock' });
  personaggio('pastaffi_porta', PERSONAGGI.pastaffi, 'shock', { posa: 'porta' });
  creaMarco(scene);
  creaOggetti(scene);
  creaSfondi(scene);
  creaBota(scene);
  creaPista(scene);
  creaVialetto(scene);
}
