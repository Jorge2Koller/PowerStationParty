// Crea tutte le texture del gioco. La grafica è vettoriale, disegnata via
// codice su canvas ad alta risoluzione (cartella js/grafica): nessuna immagine esterna.
import { tela, DENS, gruppoPigro, RES } from './grafica/base.js';
import { DOPPIONE } from './sessione.js';
import { Progressi } from './progressi.js';
import { PERSONAGGI, RAGAZZE, TIPE, BUTTAFUORI, GIUDICI, ESPRESSIONI, BOTA_ABBRONZATO, BOTA_ARAGOSTA, disegnaPersonaggio } from './grafica/personaggi.js';
import { creaMarco } from './grafica/marco.js';
import { creaOggetti } from './grafica/oggetti.js';
import { creaSfondi } from './grafica/sfondi.js';
import { creaBota } from './grafica/bota.js';
import { creaPista } from './grafica/disco.js';
import { creaPalco } from './grafica/palco.js';
import { creaMedaglie } from './grafica/medaglie.js';
import { creaVialetto } from './grafica/vialetto.js';
import { creaPallaio, manoPong, MANO_IMG } from './grafica/pallaio.js';
import { creaProvino } from './grafica/provino.js';
import { creaTaverna } from './grafica/taverna.js';
import { creaPiazzetta } from './grafica/piazzetta.js';
import { creaMontagna } from './grafica/montagna.js';

export { RES, Q, SP } from './grafica/base.js';
export { FACCIA, ARTE, mascheraBarba, zonaDelicata, sulViso } from './grafica/marco.js';
export { CORPO, GW, GH, PELLE, zonaVietata } from './grafica/bota.js';

// un personaggio in una texture di 96x144 unità (è disegnato su una griglia 192x288)
const figura = (scene, key, p, e, o) => tela(scene, key, 96, 144, (c) => { c.scale(0.5, 0.5); disegnaPersonaggio(c, p, e, o); });

// il palleggio col piede: la gamba che si alza in due tempi (1 = a metà, 2 = sul pallone),
// a destra (D) e a sinistra (S). extra = altre opzioni del disegno (la corona del costume)
function calci(scene, id, p, lati = [[1, 'D'], [-1, 'S']], extra = {}) {
  for (const [lato, nome] of lati)
    for (const [n, angolo] of [[1, 0.5], [2, 1.12]]) figura(scene, `${id}_calcio${n}${nome}`, p, 'normale', { ...extra, calcio: { lato, angolo }, posa: 'calcio' });
}

// un personaggio col suo costume del Bancone, se ne ha uno: [aspetto, opzioni del disegno]
function vestito(id) {
  const v = Progressi.aspetto(id);
  return [{ ...PERSONAGGI[id], ...v.aspetto }, v.opzioni];
}

// com'è vestito un personaggio adesso (col costume del Bancone): per i disegni fatti a parte
export const aspettoDi = (id) => vestito(id.replace(DOPPIONE, ''))[0];

// rifà le texture di un personaggio dopo un cambio di costume (le pose dei calci si rifanno
// da sole la prossima volta che servono)
export function vestiPersonaggio(scene, id) {
  const [p, o] = vestito(id);
  for (const e of ESPRESSIONI) figura(scene, `${id}_${e}`, p, e, o);
  for (const k of ['calcio1D', 'calcio2D', 'calcio1S', 'calcio2S']) if (scene.textures.exists(`${id}_${k}`)) scene.textures.remove(`${id}_${k}`);
  // (e le facce del beer pong: vedi preparaBevitore)
  for (const k of FACCE_PONG) if (scene.textures.exists(`${id}_${k}`)) scene.textures.remove(`${id}_${k}`);
}

// Le facce da beer pong di un personaggio, create la prima volta che servono (per chi gioca, per
// gli avversari e per il pubblico): le tre della sbronza che sale, cioè allegro (guance rosse e
// sorriso ebete), brillo (palpebre a mezz'asta e naso rosso), sbronzo (occhi incrociati); e per
// il finale: dorme (a bocca aperta) e canta (stonato). In più la sua mano con la pallina
// (manoPong_<id>). L'id può essere quello di un doppione.
const FACCE_PONG = ['allegro', 'brillo', 'sbronzo', 'dorme', 'canta'];
export const FACCE_SBRONZA = ['normale', 'allegro', 'brillo', 'sbronzo'];   // dal livello 0 (lucido) al 3
export function preparaBevitore(scene, id) {
  const base = id.replace(DOPPIONE, '');
  if (!PERSONAGGI[base] || scene.textures.exists(`${id}_sbronzo`)) return;
  const [p0, o] = vestito(base), p = id === base ? p0 : { ...p0, travestimento: true };
  figura(scene, `${id}_allegro`, { ...p, gote: 0.6, sorrisone: true }, 'normale', o);
  figura(scene, `${id}_brillo`, { ...p, gote: 0.85, nasoRosso: 0.45, sorrisone: true, palpebra: [0.44, 0.3] }, 'normale', o);
  figura(scene, `${id}_sbronzo`, { ...p, gote: 1, nasoRosso: 0.8, sorrisone: true, palpebra: [0.56, 0.38], sguardo: [[5, 2], [-5.5, 3]] }, 'normale', o);
  figura(scene, `${id}_dorme`, { ...p, gote: 1, nasoRosso: 0.8 }, 'sbadiglio', o);
  figura(scene, `${id}_canta`, { ...p, gote: 0.9, nasoRosso: 0.6 }, 'urlo', o);
  if (!scene.textures.exists(`manoPong_${base}`)) tela(scene, `manoPong_${base}`, MANO_IMG.w, MANO_IMG.h, (c) => manoPong(c, p.pelle), 6);
}

// Le pose in più di chi sta per giocare, create la prima volta che servono (farle per tutti i
// personaggi all'avvio sarebbero un centinaio di immagini in più, quasi tutte inutili): i calci
// del palleggio e, se gioca contro se stesso, il "doppione" travestito in tutte le espressioni.
// La chiama MicrogiocoBase prima di ogni microgioco, e l'intro.
export function preparaGiocatore(scene, id, doppione = false) {
  if (!PERSONAGGI[id]) return;
  const [p, o] = vestito(id);
  if (!scene.textures.exists(`${id}_calcio1D`)) calci(scene, id, p, undefined, o);
  const bis = id + DOPPIONE;
  if (doppione && !scene.textures.exists(`${bis}_normale`)) {
    const finto = { ...p, travestimento: true };
    for (const e of ESPRESSIONI) figura(scene, `${bis}_${e}`, finto, e);
    calci(scene, bis, finto);
  }
}

// Una posa in più di un personaggio (col suo costume del Bancone), creata da un microgioco quando
// serve e buttata da lui alla fine (le Perle di Denny): chiave della texture, chi, espressione,
// opzioni del disegno (posa...) e densità (più alta se si vede in grande)
export function preparaPosa(scene, key, id, espr, o = {}, dens = RES) {
  const [p, op] = vestito(id);
  tela(scene, key, 96, 144, (c) => { c.scale(0.5, 0.5); disegnaPersonaggio(c, p, espr, { ...op, ...o }); }, dens);
}

// Le due pose del ballo (L'Incubo degli Scapoli) di chi gioca, felice: create quando servono
export function preparaBallo(scene, id) {
  const base = id.replace(DOPPIONE, '');
  if (!PERSONAGGI[base] || scene.textures.exists(`${id}_balla2`)) return;
  const [p0, o] = vestito(base), p = id === base ? p0 : { ...p0, travestimento: true };
  for (const n of [1, 2]) figura(scene, `${id}_balla${n}`, p, 'felice', { ...o, posa: 'balla' + n });
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
  // (col costume del Bancone, se ne hanno uno)
  for (const id of Object.keys(PERSONAGGI)) {
    const [p, o] = vestito(id);
    for (const e of ESPRESSIONI) personaggio(`${id}_${e}`, p, e, o);
  }
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
  // "Provini a X-Factor". I due cantanti sul palco, col microfono: in attesa, mentre cantano (a
  // occhi chiusi e bocca aperta), gasati, sulla nota stonata (sconvolti), mentre guardano malissimo
  // chi li accompagna, sull'acuto (braccia al cielo) e mentre gli danno la colpa ("ti indico")
  for (const id of ['tini', 'oli']) {
    const p = PERSONAGGI[id], mic = { posa: 'microfono', accessorio: 'microfono' };
    personaggio(`${id}_palco`, p, 'normale', mic);
    personaggio(`${id}_canta`, p, 'canta', mic);
    personaggio(`${id}_gasato`, p, 'felice', mic);
    personaggio(`${id}_stona`, p, 'sconvolto', mic);
    personaggio(`${id}_male`, p, 'sufficienza', mic);
    personaggio(`${id}_acuto`, p, 'urlo', { posa: 'felice', accessorio: 'microfono' });
    personaggio(`${id}_indica`, p, 'rabbia', { posa: 'tiIndico' });
  }
  // ...e i quattro giudici (inventati): come stanno di solito (il produttore a braccia conserte,
  // il commosso con la lacrima), quando gli piace, con le mani sulle orecchie, quando è no
  GIUDICI.forEach((g, i) => {
    const mano = g.accessorio ? { posa: g.accessorio } : {};
    const commosso = g.nome === 'commosso';
    personaggio(`giudice${i}_normale`, g, g.nome === 'produttore' ? 'sufficienza' : commosso ? 'triste' : 'normale', mano);
    personaggio(`giudice${i}_felice`, g, commosso ? 'triste' : 'felice', commosso ? { posa: 'felice' } : mano);
    personaggio(`giudice${i}_orecchie`, g, 'shock', { posa: 'orecchie', maniSopra: true, accessorio: 'niente' });
    personaggio(`giudice${i}_no`, g, 'sufficienza');
  });
  // "La pizza dal Boni": con la pala (inforna), che grida l'ordinazione, arrabbiato che corre, che
  // beve dalla caraffa, "vi ho beccati!" (indica, sconvolto), che caccia gli imbucati con la pala
  const boni = PERSONAGGI.boni;
  personaggio('boni_pala', boni, 'felice', { posa: 'pala', accessorio: 'pala' });
  personaggio('boni_grida', boni, 'urlo', { posa: 'grida', maniSopra: true, accessorio: 'niente' });
  personaggio('boni_corre', boni, 'rabbia', { posa: 'corre' });
  personaggio('boni_beve', boni, 'rabbia', { posa: 'beve', accessorio: 'caraffa' });
  personaggio('boni_beccati', boni, 'sconvolto', { posa: 'tiIndico' });
  personaggio('boni_caccia', boni, 'rabbia', { posa: 'caccia', accessorio: 'palaAlta' });
  personaggio('boni_rabbia', boni, 'rabbia');
  // "La ballata del Pallaio": Lori che canta a bocca spalancata con la mano sul cuore, che alza
  // la bacchetta, che batte (TOC), che si blocca confuso, che fulmina il garzone, che si ripara
  // dai pomodori, l'inchino finale. (La bacchetta la disegna la scena: va dalla mano alla casella.)
  const lori = PERSONAGGI.lori;
  personaggio('lori_canta', lori, 'canta', { posa: 'cuore' });
  personaggio('lori_alza', lori, 'canta', { posa: 'alza' });
  personaggio('lori_batte', lori, 'felice', { posa: 'batte' });
  personaggio('lori_confuso', lori, 'sconvolto', { posa: 'gratta', maniSopra: true, accessorio: 'niente' });
  personaggio('lori_fulmina', lori, 'rabbia', { posa: 'tiIndico' });
  personaggio('lori_ripara', lori, 'shock', { posa: 'maniInTesta', maniSopra: true, accessorio: 'niente' });
  personaggio('lori_inchino', lori, 'felice', { posa: 'inchino' });
  // gli imbucati che, sotto la tovaglia, si passano la fetta e fanno l'occhiolino
  for (const id of ['oli', 'sego']) personaggio(`${id}_occhiolino`, PERSONAGGI[id], 'occhiolino');
  creaOggetti(scene);
  creaMedaglie(scene);
  // gli sfondi e le immagini di un microgioco solo: si creano quando servono (vedi gruppoPigro in
  // grafica/base.js e GRUPPI_MICROGIOCHI qui sotto)
  creaSfondi(scene);
  gruppoPigro(scene, 'marco', creaMarco);
  gruppoPigro(scene, 'bota', creaBota);
  gruppoPigro(scene, 'disco', creaPista);
  gruppoPigro(scene, 'palco', creaPalco);
  gruppoPigro(scene, 'vialetto', creaVialetto);
  gruppoPigro(scene, 'pallaio', creaPallaio);
  gruppoPigro(scene, 'provino', creaProvino);
  gruppoPigro(scene, 'taverna', creaTaverna);
  gruppoPigro(scene, 'piazzetta', creaPiazzetta);
  gruppoPigro(scene, 'montagna', creaMontagna);
}

// I gruppi di immagini che servono a ogni microgioco (gli sfondi di sfondi.js sono un gruppo per
// sfondo, col nome della texture). Quando parte un microgioco si creano i suoi e si buttano gli
// altri (MicrogiocoBase). Un microgioco nuovo con immagini sue: un gruppoPigro qui sopra e una riga
// qui. (Il Passaggiorgio usa la station wagon di Emilio, la Retromarcia il telefono del Bota, il beer
// pong il cane del Vialetto per la gag; la ballata prende anche i gruppi delle sue vignette.)
export const GRUPPI_MICROGIOCHI = {
  spina: ['bgPub', 'bancone'], regrorio: ['bgStrada'], barba: ['marco', 'bgBarbiere'], panino: ['bgBar', 'banconeBar'],
  mani: ['bgSala', 'tavola'], sego: ['bgCortile', 'portoneAperto'], ronda: ['bgSpiaggia'], blackjack: ['bgCasino', 'tavoloVerde'],
  palleggi: ['bgParco'], passaseo: ['montagna'], bota: ['bota'], guida: ['bgParcheggio', 'vialetto'], piovra: ['bgDisco'],
  scapoli: ['palco'], retromarcia: ['vialetto', 'bota'], beerpong: ['pallaio', 'vialetto'], xfactor: ['provino'],
  pizza: ['taverna'], ballata: ['piazzetta'], proverbi: ['pallaio'],
};
