// Premi buffi di fine sfida: guardando i round giocati da tutti, a chi va "Lo specialista",
// "Mani di burro", "L'eterno secondo"... (titoli e frasi in js/config/premi.js).
// Si usano i punti sfida (0-100 per microgioco, js/punteggi.js): così i microgiochi si confrontano.
// Ritorna al massimo CONFIG.premi.quanti premi, possibilmente a giocatori diversi:
// [{ titolo, frase, g }] (g = il giocatore).
import { CONFIG } from './config.js';
import { normalizza, medaglia } from './punteggi.js';

export function premiBuffi(S) {
  const C = CONFIG.premi, G = S.giocatori, n = G.length;
  // (solo i round giocati da tutti: nel Torneo non giocano sempre tutti)
  const round = S.risultati.map((_r, i) => i).filter((i) => S.completo(i) && G.every((g) => S.risultati[i][g.i]));
  if (n < 2 || round.length < C.minimoRound) return [];
  // v[g][k] = punti sfida del giocatore g nel k-esimo round giocato
  const v = G.map((g) => round.map((i) => normalizza(S.lista[i], S.risultati[i][g.i].punteggio)));
  const media = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const candidati = [];
  const metti = (chiave, g, numero, peso, gioco = '') => {
    const p = C.premi[chiave];
    if (!p) return;
    const frase = p.frase.replaceAll('{nome}', g.nome).replaceAll('{gioco}', gioco).replaceAll('{n}', String(numero));
    candidati.push({ chiave, titolo: p.titolo, frase, g, peso });
  };
  // il migliore in assoluto (deve essere un gran punteggio, e non pari con un altro)
  const migliori = [];
  G.forEach((g, a) => round.forEach((i, k) => migliori.push({ g, x: v[a][k], i })));
  migliori.sort((p, q) => q.x - p.x);
  if (migliori[0].x >= 85 && migliori[0].x > (migliori[1]?.x ?? -1)) metti('specialista', migliori[0].g, Math.round(migliori[0].x), 3, CONFIG.microgiochi[S.lista[migliori[0].i]].titolo);
  // più ori
  const ori = G.map((g) => round.filter((i) => medaglia(S.lista[i], S.risultati[i][g.i].punteggio) === 'oro').length);
  const maxOri = Math.max(...ori);
  if (maxOri >= 2 && ori.filter((x) => x === maxOri).length === 1) metti('medagliere', G[ori.indexOf(maxOri)], maxOri, 3);
  // più round a zero
  const zeri = v.map((a) => a.filter((x) => x <= 0).length), maxZeri = Math.max(...zeri);
  if (maxZeri >= 2 && zeri.filter((x) => x === maxZeri).length === 1) metti('maniDiBurro', G[zeri.indexOf(maxZeri)], maxZeri, 2);
  // più secondi posti (da tre giocatori in su: in due "secondo" vuol dire ultimo)
  if (n >= 3) {
    const sec = G.map((g) => round.filter((i) => S.classificaRound(i).find((r) => r.g.i === g.i).pos === 2).length);
    const maxSec = Math.max(...sec);
    if (maxSec >= 2 && sec.filter((x) => x === maxSec).length === 1) metti('secondo', G[sec.indexOf(maxSec)], maxSec, 2);
  }
  if (round.length >= 3) {
    // il più costante: lo scarto più piccolo dalla sua media (ma una media decente)
    const scarti = v.map((a) => { const m = media(a); return Math.sqrt(media(a.map((x) => (x - m) ** 2))); });
    const a = scarti.indexOf(Math.min(...scarti));
    if (media(v[a]) >= 30) metti('regolare', G[a], Math.round(media(v[a])), 1);
    // chi è migliorato di più dalla prima alla seconda metà
    const meta = Math.floor(round.length / 2);
    const salto = v.map((a) => media(a.slice(meta)) - media(a.slice(0, meta)));
    const b = salto.indexOf(Math.max(...salto));
    if (salto[b] >= 15) metti('rimonta', G[b], Math.round(salto[b]), 2);
  }
  // l'ultimo per media (solo se è proprio l'ultimo, da solo)
  const medie = v.map(media), minimo = Math.min(...medie), c = medie.indexOf(minimo);
  if (medie.filter((x) => x === minimo).length === 1) metti('turista', G[c], Math.round(minimo), 0);
  // se c'è solo il turista non vale la pena: niente premi
  if (!candidati.some((p) => p.peso > 0)) return [];

  // i più importanti per primi, un premio a testa finché si può
  candidati.sort((p, q) => q.peso - p.peso);
  const scelti = [], presi = new Set();
  for (const p of candidati) if (scelti.length < C.quanti && !presi.has(p.g.i)) { scelti.push(p); presi.add(p.g.i); }
  for (const p of candidati) if (scelti.length < C.quanti && !scelti.includes(p) && !scelti.some((s) => s.chiave === p.chiave)) scelti.push(p);
  return scelti;
}
