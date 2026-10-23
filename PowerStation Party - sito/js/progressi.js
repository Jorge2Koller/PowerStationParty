// ============================================================
//  PROGRESSI: statistiche, record, albo d'oro, trofei, Pinte e Bancone
//
//  Tutto finisce nel salvataggio (js/salvataggio.js):
//    statistiche  { turni, sfide, sfideComplete, maxGiocatori, oriDiFila, pinteTotali,
//                   giochi: { id: { giocati, migliore, medaglia } },
//                   personaggi: { id: { turni, ori, argenti, bronzi, sfide, sfideVinte, roundVinti, medaglie: { gioco: 0..3 } } },
//                   albo: [ { giorno, tipo, n, giocatori: [id], vincitore: id | null } ] }
//    record       { gioco: { punteggio, chi, nome, giorno } }       il migliore di sempre, per microgioco
//    trofei       { trofeo: giorno }                                quelli sbloccati
//    pinte        quante ce ne sono da spendere
//    sblocchi     { costumi: [], temi: [], frasi: [], modalita: [], vestiti: { personaggio: costume }, tema }
//  (medaglia: 0 = nessuna, 1 = bronzo, 2 = argento, 3 = oro; giorno = Date.now())
//  Si chiama dopo ogni turno vero (non la prova lampo), a fine sfida e al Bancone. Ogni funzione
//  ritorna quello che c'è da far vedere: Pinte guadagnate, record, trofei appena sbloccati.
// ============================================================
import { CONFIG } from './config.js';
import { Salvataggio } from './salvataggio.js';
import { medaglia, MEDAGLIE } from './punteggi.js';

const LIVELLO = { bronzo: 1, argento: 2, oro: 3 };
// la chiave di un giorno: AAAA-MM-GG (ora locale)
export const chiaveGiorno = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const ALBO_MAX = 40;
const giochi = () => Object.keys(CONFIG.microgiochi);

// le strutture, create la prima volta che servono (un salvataggio vecchio non le ha)
function st() {
  const s = Salvataggio.dati.statistiche;
  for (const k of ['turni', 'sfide', 'sfideComplete', 'maxGiocatori', 'oriDiFila', 'pinteTotali']) if (typeof s[k] !== 'number') s[k] = 0;
  for (const k of ['giochi', 'personaggi']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
  if (!Array.isArray(s.albo)) s.albo = [];
  return s;
}
function sblocchi() {
  const b = Salvataggio.dati.sblocchi;
  for (const k of ['costumi', 'temi', 'frasi', 'modalita']) if (!Array.isArray(b[k])) b[k] = [];
  if (!b.vestiti || typeof b.vestiti !== 'object') b.vestiti = {};
  if (typeof b.tema !== 'string') b.tema = 'raggi';
  return b;
}
const personaggio = (id) => {
  const P = st().personaggi;
  return P[id] ?? (P[id] = { turni: 0, ori: 0, argenti: 0, bronzi: 0, sfide: 0, sfideVinte: 0, roundVinti: 0, medaglie: {} });
};
const gioco = (id) => {
  const G = st().giochi;
  return G[id] ?? (G[id] = { giocati: 0, migliore: null, medaglia: 0 });
};

// tutti i trofei: i generali e quelli "Oro a ..." di ogni microgioco
export function elencoTrofei() {
  const T = CONFIG.trofei, sbloccati = Salvataggio.dati.trofei;
  const oro = giochi().map((id) => ({
    id: 'oro_' + id, gioco: id,
    // (un microgioco può dare al suo trofeo un nome tutto suo: il campo trofeo, es. Capitan Ghiori)
    nome: CONFIG.microgiochi[id].trofeo ?? T.oro.nome.replace('{titolo}', CONFIG.microgiochi[id].titolo),
    descrizione: T.oro.descrizione.replace('{titolo}', CONFIG.microgiochi[id].titolo),
  }));
  return [...T.generali, ...oro].map((t) => ({ ...t, sbloccato: !!sbloccati[t.id], giorno: sbloccati[t.id] ?? null }));
}

// le condizioni dei trofei (ev = cosa è appena successo: { turno }, { sfida }, { acquisto }, { costume })
function condizione(id, ev) {
  const s = st(), G = s.giochi, tutti = giochi();
  const minimo = (liv) => tutti.every((g) => (G[g]?.medaglia ?? 0) >= liv);
  switch (id) {
    case 'primoTurno': return s.turni >= 1;
    case 'primoBronzo': return tutti.some((g) => (G[g]?.medaglia ?? 0) >= 1);
    case 'primoArgento': return tutti.some((g) => (G[g]?.medaglia ?? 0) >= 2);
    case 'primoOro': return tutti.some((g) => (G[g]?.medaglia ?? 0) >= 3);
    case 'filotto': return s.oriDiFila >= 3;
    case 'tuttiGiocati': return tutti.every((g) => (G[g]?.giocati ?? 0) > 0);
    case 'tuttiBronzo': return minimo(1);
    case 'tuttiArgento': return minimo(2);
    case 'tuttiOro': return minimo(3);
    case 'centoTurni': return s.turni >= 100;
    case 'primaSfida': return s.sfide >= 1;
    case 'dieciSfide': return s.sfide >= 10;
    case 'sfidaCompleta': return s.sfideComplete >= 1;
    case 'otto': return s.maxGiocatori >= 8;
    case 'cappotto': return !!ev.sfida?.cappotto;
    case 'controSeStesso': return !!ev.turno?.controSeStesso;
    case 'zero': return ev.turno ? ev.turno.punteggio <= 0 : false;
    case 'nottambulo': { const h = new Date().getHours(); return !!(ev.turno || ev.sfida) && h < 5; }
    case 'cinquantaPinte': return s.pinteTotali >= 50;
    case 'primoAcquisto': return Object.values(sblocchi()).some((v) => Array.isArray(v) && v.length > 0);
    case 'guardaroba': return Object.keys(sblocchi().vestiti).length > 0;
    case 'abitudinario': return (s.serieGiorni ?? 0) >= 3;
    case 'rePallaio': return Object.values(s.personaggi).some((p) => (p.beerpong?.vittorie ?? 0) >= 5);
    default:
      if (id.startsWith('oro_')) return (G[id.slice(4)]?.medaglia ?? 0) >= 3;
      return false;
  }
}

// controlla tutti i trofei non ancora presi: ritorna quelli appena sbloccati (e dà le loro Pinte)
function controlla(ev = {}) {
  const T = Salvataggio.dati.trofei, nuovi = [];
  for (const t of elencoTrofei()) {
    if (t.sbloccato || !condizione(t.id, ev)) continue;
    T[t.id] = Date.now();
    nuovi.push(t);
  }
  if (nuovi.length) guadagna(nuovi.length * CONFIG.trofei.pinte);
  return nuovi;
}

function guadagna(n) {
  if (n <= 0) return;
  const d = Salvataggio.dati;
  d.pinte += n;
  st().pinteTotali += n;
}

export const Progressi = {
  get pinte() { return Salvataggio.dati.pinte; },
  get statistiche() { return st(); },
  get record() { return Salvataggio.dati.record; },
  get albo() { return st().albo; },
  get sblocchi() { return sblocchi(); },

  // dopo un turno vero: t = { id, punteggio, giocatore (voce di CONFIG.personaggiGiocabili), controSeStesso }
  dopoTurno(t) {
    const s = st(), g = gioco(t.id), p = personaggio(t.giocatore.id), tipo = medaglia(t.id, t.punteggio), liv = LIVELLO[tipo] ?? 0;
    s.turni++;
    g.giocati++;
    if (g.migliore == null || t.punteggio > g.migliore) g.migliore = t.punteggio;
    g.medaglia = Math.max(g.medaglia, liv);
    p.turni++;
    if (tipo === 'oro') p.ori++; else if (tipo === 'argento') p.argenti++; else if (tipo === 'bronzo') p.bronzi++;
    p.medaglie[t.id] = Math.max(p.medaglie[t.id] ?? 0, liv);
    s.oriDiFila = tipo === 'oro' ? s.oriDiFila + 1 : 0;
    // il record di sempre del microgioco
    const R = Salvataggio.dati.record, vecchio = R[t.id];
    const record = !vecchio || t.punteggio > vecchio.punteggio;
    if (record && t.punteggio > 0) R[t.id] = { punteggio: t.punteggio, chi: t.giocatore.id, nome: t.giocatore.nome, giorno: Date.now() };
    const pinte = tipo ? CONFIG.bancone.pinte.medaglia[tipo] : 0;
    guadagna(pinte);
    const trofei = controlla({ turno: t });
    Salvataggio.segna();
    return { pinte, medaglia: tipo, record: record && t.punteggio > 0 && !!vecchio, trofei };
  },

  // dopo un turno in Lampo (15 secondi): solo il record Lampo di quel microgioco, a parte da quelli
  // normali (in Lampo niente medaglie, statistiche e Pinte, come sempre)
  dopoTurnoLampo(t) {
    const R = Salvataggio.dati.recordLampo, vecchio = R[t.id];
    const record = t.punteggio > 0 && (!vecchio || t.punteggio > vecchio.punteggio);
    if (record) R[t.id] = { punteggio: t.punteggio, chi: t.giocatore.id, nome: t.giocatore.nome, giorno: Date.now() };
    Salvataggio.segna();
    return { record: record && !!vecchio, primo: record && !vecchio };
  },

  // il Lampo da soli finito (una volta sola): il totale in punti sfida e il migliore di sempre
  dopoLampoSolo(punti) {
    const s = st(), prima = s.lampoSolo ?? null, record = prima == null || punti > prima;
    if (record) s.lampoSolo = punti;
    Salvataggio.segna();
    return { migliore: s.lampoSolo, record, primo: prima == null };
  },

  // a fine sfida (una volta sola: S.registrata)
  dopoSfida(S) {
    if (S.registrata || S.modo !== 'sfida') return { pinte: 0, trofei: [] };
    S.registrata = true;
    const s = st(), cl = S.classifica(), G = S.giocatori, giocati = S.giocati;
    s.sfide++;
    if (S.tipo === 'completa' && giocati >= giochi().length) s.sfideComplete++;
    s.maxGiocatori = Math.max(s.maxGiocatori, S.n);
    // a squadre vincono tutti quelli della squadra
    const sq = cl.squadre, vincitori = sq ? (sq.vincitrice >= 0 ? G.filter((g) => g.i % 2 === sq.vincitrice) : []) : cl.vincitore >= 0 ? [G[cl.vincitore]] : [];
    const vincitore = !sq && vincitori.length === 1 ? vincitori[0] : null;
    for (const g of G) {
      const p = personaggio(g.id);
      p.sfide++;
      p.roundVinti += cl.round[g.i];
      if (vincitori.includes(g)) p.sfideVinte++;
    }
    s.albo.unshift({ giorno: Date.now(), tipo: S.tipo, n: S.n, giocatori: G.map((g) => g.id), vincitore: vincitore?.id ?? null,
      ...(sq ? { squadra: sq.vincitrice >= 0 ? CONFIG.modalita.squadre.nomi[sq.vincitrice] : null } : {}) });
    if (s.albo.length > ALBO_MAX) s.albo.length = ALBO_MAX;
    const B = CONFIG.bancone.pinte, pinte = B.sfida + B.round * giocati;
    guadagna(pinte);
    // cappotto: il vincitore ha vinto tutti i round (almeno 3)
    const cappotto = !!vincitore && giocati >= 3 && cl.round[vincitore.i] === giocati;
    const trofei = controlla({ sfida: { cappotto } });
    Salvataggio.segna();
    return { pinte, trofei, vincitore };
  },

  // A fine partita di BEER PONG (la modalità). e = { giocatori: chi ha tirato, vincitori: quelli
  // della squadra che ha vinto, arbitro: chi faceva l'arbitro (o null), squadra: il nome della
  // squadra vincente }. Conta come una sfida (albo d'oro, sfide e sfide vinte dei personaggi) e in
  // più tiene le partite e le vittorie a beer pong di ognuno (personaggi[id].beerpong).
  dopoBeerPong(e) {
    const s = st(), tutti = [...e.giocatori, ...(e.arbitro ? [e.arbitro] : [])];
    s.sfide++;
    s.maxGiocatori = Math.max(s.maxGiocatori, tutti.length);
    for (const g of e.giocatori) {
      const p = personaggio(g.id), vince = e.vincitori.includes(g);
      if (!p.beerpong) p.beerpong = { partite: 0, vittorie: 0 };
      p.sfide++; p.beerpong.partite++;
      if (vince) { p.sfideVinte++; p.beerpong.vittorie++; }
    }
    const solo = e.vincitori.length === 1 ? e.vincitori[0] : null;
    s.albo.unshift({ giorno: Date.now(), tipo: 'beerpong', n: tutti.length, giocatori: tutti.map((g) => g.id), vincitore: solo?.id ?? null, ...(solo ? {} : { squadra: e.squadra }) });
    if (s.albo.length > ALBO_MAX) s.albo.length = ALBO_MAX;
    const pinte = CONFIG.bancone.pinte.beerpong ?? 0;
    guadagna(pinte);
    const trofei = controlla({ sfida: { cappotto: false } });
    Salvataggio.segna();
    return { pinte, trofei };
  },

  // la sfida del giorno finita: il migliore del giorno, i giorni di fila, le Pinte (la prima volta)
  dopoGiorno(giorno, punti) {
    const s = st();
    if (!s.giorni || typeof s.giorni !== 'object') s.giorni = {};
    const prima = s.giorni[giorno], primo = prima == null, record = primo || punti > prima;
    if (record) s.giorni[giorno] = punti;
    const pinte = primo ? CONFIG.bancone.pinte.giorno : 0;
    guadagna(pinte);
    let serie = 0;
    for (const d = new Date(giorno + 'T12:00:00'); s.giorni[chiaveGiorno(d)] != null; d.setDate(d.getDate() - 1)) serie++;
    s.serieGiorni = Math.max(s.serieGiorni ?? 0, serie);
    const trofei = controlla({ giorno: true });
    Salvataggio.segna();
    return { migliore: s.giorni[giorno], serie, record, primo, pinte, trofei };
  },

  // Pinte in regalo (il boss della partita Da solo): ritorna i trofei sbloccati
  regala(n) {
    guadagna(n);
    const trofei = controlla({});
    Salvataggio.segna();
    return trofei;
  },

  // --- Bancone ---
  // tipo: 'costumi' | 'temi' | 'frasi' | 'modalita'
  comprato(tipo, id) { return CONFIG.bancone[tipo].find((x) => x.id === id)?.costo === 0 || sblocchi()[tipo].includes(id); },
  compra(tipo, id) {
    const voce = CONFIG.bancone[tipo]?.find((x) => x.id === id);
    if (!voce) return { ok: false, errore: 'non esiste' };
    if (voce.presto) return { ok: false, errore: 'IN ARRIVO!' };
    if (this.comprato(tipo, id)) return { ok: false, errore: 'GIÀ TUO!' };
    if (Salvataggio.dati.pinte < voce.costo) return { ok: false, errore: 'PINTE NON BASTANO!' };
    Salvataggio.dati.pinte -= voce.costo;
    sblocchi()[tipo].push(id);
    const trofei = controlla({ acquisto: true });
    Salvataggio.segna();
    return { ok: true, trofei };
  },
  // il costume di un personaggio (null = nessuno)
  costume(chi) { return sblocchi().vestiti[chi] ?? null; },
  vesti(chi, costume) {
    const v = sblocchi().vestiti;
    if (costume) v[chi] = costume; else delete v[chi];
    const trofei = costume ? controlla({ costume: true }) : [];
    Salvataggio.segna();
    return trofei;
  },
  // come si disegna un personaggio col suo costume: { aspetto, opzioni } da unire al disegno
  aspetto(chi) {
    const id = this.costume(chi), c = id && CONFIG.bancone.costumi.find((x) => x.id === id);
    return { aspetto: c?.aspetto ?? {}, opzioni: c?.opzioni ?? {} };
  },
  get tema() { const t = sblocchi().tema; return this.comprato('temi', t) ? t : 'raggi'; },
  scegliTema(id) { if (this.comprato('temi', id)) { sblocchi().tema = id; Salvataggio.segna(); } },
  // le frasi di sfottò dei pacchetti comprati
  frasiExtra() { return CONFIG.bancone.frasi.filter((f) => this.comprato('frasi', f.id)).flatMap((f) => f.frasi); },

  // la medaglia migliore di un personaggio (o di tutti, se chi è null) in un microgioco: 0..3
  medagliaMigliore(gioco, chi = null) {
    if (chi) return st().personaggi[chi]?.medaglie?.[gioco] ?? 0;
    return st().giochi[gioco]?.medaglia ?? 0;
  },
  NOMI_MEDAGLIE: ['', ...MEDAGLIE],
};
