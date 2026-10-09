// Stato della partita in corso.
// Sfida: Riccardo e Giorgio giocano a turno lo stesso microgioco; chi comincia
// si alterna a ogni round. Allenamento: un solo giocatore, un solo microgioco.
import { CONFIG } from './config.js';

export const Sessione = {
  modo: 'sfida',     // 'sfida' | 'allenamento'
  lista: [],         // id dei microgiochi da giocare
  indice: 0,         // round corrente
  passo: 0,          // 0 = gioca il primo del round, 1 = gioca il secondo
  solo: null,        // in allenamento: indice del giocatore
  risultati: [],     // risultati[round][giocatore] = { punteggio, vittoria, riepilogo }

  nuovaSfida(lista = CONFIG.ordineSfida) { this.avvia('sfida', lista, null); },
  nuovoAllenamento(id, giocatore = 0) { this.avvia('allenamento', [id], giocatore); },
  avvia(modo, lista, solo) {
    Object.assign(this, { modo, lista: [...lista], indice: 0, passo: 0, solo, risultati: lista.map(() => []) });
  },

  get idCorrente() { return this.lista[this.indice]; },
  // chi gioca adesso (0 = Giocatore 1, 1 = Giocatore 2)
  get turno() { return this.solo ?? (this.indice + this.passo) % 2; },
  get giocatore() { return CONFIG.giocatori[this.turno]; },
  get avversario() { return CONFIG.giocatori[1 - this.turno]; },
  // risultato già fatto dall'altro in questo round, se ha già giocato
  get daBattere() {
    return this.modo === 'sfida' && this.passo === 1 ? this.risultati[this.indice][1 - this.turno] : null;
  },

  registra(r) { this.risultati[this.indice][this.turno] = r; },

  // 0 o 1 = chi ha vinto il round, -1 = pari
  vincitoreRound(i) {
    const [a, b] = this.risultati[i];
    return a.punteggio === b.punteggio ? -1 : a.punteggio > b.punteggio ? 0 : 1;
  },

  classifica() {
    const round = [0, 0], punti = [0, 0];
    this.risultati.forEach((r, i) => {
      const v = this.vincitoreRound(i);
      if (v >= 0) round[v]++;
      punti[0] += r[0].punteggio;
      punti[1] += r[1].punteggio;
    });
    let vincitore = round[0] === round[1] ? -1 : round[0] > round[1] ? 0 : 1;
    if (vincitore < 0 && punti[0] !== punti[1]) vincitore = punti[0] > punti[1] ? 0 : 1; // spareggio ai punti
    return { round, punti, vincitore };
  },
};
