// Il tabellone del Torneo (Fase 7): eliminazione diretta, da 4 a 8 giocatori.
// Se i giocatori non sono 4 o 8, al primo turno qualcuno passa senza giocare (il "bye"): così al
// secondo turno si è sempre in 2 o in 4. Il tabellone è { turni: [ [partita, ...], ... ] }, e ogni
// partita è { a, b, vincitore } (numeri dei giocatori; b = null per chi passa senza giocare).
const potenza = (n) => 2 ** Math.ceil(Math.log2(Math.max(2, n)));

export function nuovoTabellone(indici, rnd = Math.random) {
  const p = [...indici];
  for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  const posti = potenza(p.length) / 2, vere = p.length - posti;   // partite vere al primo turno
  const primo = [];
  for (let k = 0; k < posti; k++) {
    if (k < vere) primo.push({ a: p[2 * k], b: p[2 * k + 1], vincitore: null });
    else { const chi = p[2 * vere + (k - vere)]; primo.push({ a: chi, b: null, vincitore: chi }); }
  }
  return { turni: [primo] };
}

// la prossima partita da giocare (se il turno è finito si prepara il successivo); null = torneo finito
export function prossimaPartita(T) {
  for (;;) {
    const turno = T.turni[T.turni.length - 1];
    const daGiocare = turno.find((m) => m.vincitore == null);
    if (daGiocare) return daGiocare;
    if (turno.length === 1) return null;   // la finale è decisa
    const nuovo = [];
    for (let k = 0; k < turno.length; k += 2) nuovo.push({ a: turno[k].vincitore, b: turno[k + 1].vincitore, vincitore: null });
    T.turni.push(nuovo);
  }
}

export function campione(T) {
  const ultimo = T.turni[T.turni.length - 1];
  return ultimo.length === 1 && ultimo[0].vincitore != null ? ultimo[0].vincitore : null;
}

// fin dove è arrivato ogni giocatore: quante partite ha vinto (chi passa senza giocare non conta)
export function vittorie(T, n) {
  const v = Array(n).fill(0);
  for (const turno of T.turni) for (const m of turno) if (m.b != null && m.vincitore != null) v[m.vincitore]++;
  return v;
}

// il nome del turno: FINALE, SEMIFINALI, QUARTI
export function nomeTurno(T, k = T.turni.length - 1) {
  const quante = T.turni[k].length;
  return quante === 1 ? 'FINALE' : quante === 2 ? 'SEMIFINALE' : 'QUARTI';
}
