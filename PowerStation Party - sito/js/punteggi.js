// ============================================================
//  PUNTEGGI CONFRONTABILI: medaglie e punteggio normalizzato
//
//  Ogni microgioco ha la sua scala (le pinte della Spina sono una trentina, le fiches del
//  blackjack centinaia): sommarle così com'erano faceva pesare di più i microgiochi "ricchi".
//  Per questo ogni microgioco dichiara nella sua configurazione tre soglie,
//      medaglie: { bronzo, argento, oro }        (e facoltativi: zero, massimo)
//  e da lì si ricava un punteggio da 0 a 100, uguale per tutti:
//      zero (di solito 0) -> 0    bronzo -> 40    argento -> 70    oro -> 90    massimo -> 100
//  in mezzo si va in proporzione. "zero" serve dove anche chi non fa niente prende punti
//  (le 100 fiches di partenza del blackjack); "massimo", se manca, è oro + (oro - argento).
//  A schermo si vede sempre il punteggio vero del microgioco: il normalizzato serve solo a
//  sommare microgiochi diversi (la sfida a due) e agli spareggi.
// ============================================================
import { CONFIG } from './config.js';

export const MEDAGLIE = ['bronzo', 'argento', 'oro'];
const TAPPE = { zero: 0, bronzo: 40, argento: 70, oro: 90, massimo: 100 };

const soglie = (id) => {
  const m = CONFIG.microgiochi[id]?.medaglie;
  if (!m) return null;
  const zero = m.zero ?? 0, massimo = m.massimo ?? m.oro + (m.oro - m.argento);
  return [[zero, TAPPE.zero], [m.bronzo, TAPPE.bronzo], [m.argento, TAPPE.argento], [m.oro, TAPPE.oro], [massimo, TAPPE.massimo]];
};

// il punteggio di un microgioco portato da 0 a 100 (intero)
export function normalizza(id, punteggio) {
  const t = soglie(id);
  if (!t) return Math.round(Math.max(0, Math.min(100, punteggio)));   // microgioco senza soglie: com'è, entro 0..100
  if (punteggio <= t[0][0]) return 0;
  for (let i = 1; i < t.length; i++) {
    const [p0, v0] = t[i - 1], [p1, v1] = t[i];
    if (punteggio <= p1) return Math.round(v0 + ((punteggio - p0) / Math.max(1e-9, p1 - p0)) * (v1 - v0));
  }
  return 100;
}

// la medaglia presa con quel punteggio: 'oro' | 'argento' | 'bronzo' | null
export function medaglia(id, punteggio) {
  const m = CONFIG.microgiochi[id]?.medaglie;
  if (!m) return null;
  return punteggio >= m.oro ? 'oro' : punteggio >= m.argento ? 'argento' : punteggio >= m.bronzo ? 'bronzo' : null;
}
