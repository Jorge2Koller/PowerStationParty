// Stato della partita in corso.
// Sfida: Riccardo e Giorgio giocano a turno lo stesso microgioco; chi comincia
// si alterna a ogni round. Allenamento: un solo giocatore, un solo microgioco.
// Sfida completa: tutti i microgiochi, vince chi fa più punti in totale.
// Sfida veloce "al meglio di 3 (o 5)": microgiochi a caso, vince chi ne vince prima 2 (o 3).
import { CONFIG } from './config.js';

export const Sessione = {
  modo: 'sfida',     // 'sfida' | 'allenamento'
  lista: [],         // id dei microgiochi da giocare
  indice: 0,         // round corrente
  passo: 0,          // 0 = gioca il primo del round, 1 = gioca il secondo
  solo: null,        // in allenamento: indice del giocatore
  risultati: [],     // risultati[round][giocatore] = { punteggio, vittoria, riepilogo }
  meglioDi: 0,       // 0 = si contano i punti; 3 o 5 = sfida veloce

  nuovaSfida(lista = CONFIG.ordineSfida) { this.avvia('sfida', lista, null); },
  // tutti i microgiochi in ordine casuale: se ci sono round pari se ne gioca un altro
  nuovaSfidaVeloce(meglioDi) {
    const lista = [...CONFIG.ordineSfida];
    for (let i = lista.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lista[i], lista[j]] = [lista[j], lista[i]]; }
    this.avvia('sfida', lista, null);
    this.meglioDi = meglioDi;
  },
  nuovoAllenamento(id, giocatore = 0) { this.avvia('allenamento', [id], giocatore); },
  avvia(modo, lista, solo) {
    this.meglioDi = 0;
    // un seme per round: nella sfida tutti e due trovano lo stesso mazzo (blackjack)
    const semi = lista.map(() => (Math.random() * 2 ** 32) >>> 0);
    Object.assign(this, { modo, lista: [...lista], indice: 0, passo: 0, solo, risultati: lista.map(() => []), semi });
  },

  get idCorrente() { return this.lista[this.indice]; },
  get seme() { return this.semi?.[this.indice] ?? (Math.random() * 2 ** 32) >>> 0; },
  // chi gioca adesso (0 = Giocatore 1, 1 = Giocatore 2)
  get turno() { return this.solo ?? (this.indice + this.passo) % 2; },
  get giocatore() { return CONFIG.giocatori[this.turno]; },
  get avversario() { return CONFIG.giocatori[1 - this.turno]; },
  // risultato già fatto dall'altro in questo round, se ha già giocato
  get daBattere() {
    return this.modo === 'sfida' && this.passo === 1 ? this.risultati[this.indice][1 - this.turno] : null;
  },

  registra(r) { this.risultati[this.indice][this.turno] = r; },

  // minigiochi da vincere nella sfida veloce (al meglio di 3: 2; al meglio di 5: 3)
  get serve() { return Math.ceil(this.meglioDi / 2); },
  // round giocati da tutti e due
  get giocati() { return this.risultati.filter((r) => r[0] && r[1]).length; },
  // dopo questo round la sfida è finita?
  get finita() {
    if (this.indice >= this.lista.length - 1) return true;
    return this.meglioDi > 0 && this.classifica().round.some((n) => n >= this.serve);
  },

  // 0 o 1 = chi ha vinto il round, -1 = pari
  vincitoreRound(i) {
    const [a, b] = this.risultati[i];
    return a.punteggio === b.punteggio ? -1 : a.punteggio > b.punteggio ? 0 : 1;
  },

  classifica() {
    const round = [0, 0], punti = [0, 0];
    this.risultati.forEach((r, i) => {
      if (!r[0] || !r[1]) return;
      const v = this.vincitoreRound(i);
      if (v >= 0) round[v]++;
      punti[0] += r[0].punteggio;
      punti[1] += r[1].punteggio;
    });
    const perRound = round[0] === round[1] ? -1 : round[0] > round[1] ? 0 : 1;
    const perPunti = punti[0] === punti[1] ? -1 : punti[0] > punti[1] ? 0 : 1;
    // sfida veloce: contano i minigiochi vinti (spareggio ai punti);
    // sfida completa: contano i punti totali (spareggio ai minigiochi vinti)
    const vincitore = this.meglioDi ? (perRound >= 0 ? perRound : perPunti) : (perPunti >= 0 ? perPunti : perRound);
    return { round, punti, vincitore };
  },
};
