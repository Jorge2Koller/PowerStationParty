// Le modalità della Fase 6 (si comprano al Bancone: js/config/bancone.js, "modalita") e della Fase 7.
export default {
  // LAMPO: tanti microgiochi corti, uno dopo l'altro (da 2 giocatori in su)
  lampo: {
    microgiochi: 6,         // quanti, pescati a caso
    durata: 15,             // secondi di ogni microgioco (i primi due atti)
  },
  // DA SOLO: microgiochi a caso con 4 vite; senza medaglia si perde una vita. L'ultimo è il BOSS:
  // a livello DIFFICILE, e per batterlo serve almeno l'argento
  solitario: {
    vite: 4,
    microgiochi: 7,         // prima del boss
    medagliaBoss: 'argento',
    pinteBoss: 10,          // Pinte in più se si batte il boss (oltre a quelle delle medaglie)
  },

  // --- Fase 7 (gratis, non si comprano) ---
  // TORNEO (da 4 a 8 giocatori): tabellone a eliminazione diretta, una sfida a due per partita
  // (un microgioco a caso, lo stesso per tutti e due); in caso di pari si rigioca con un altro
  torneo: { minimo: 4 },
  // SQUADRE (da 4 giocatori in su): ROSSI contro BLU, in ordine di scelta (1° rossi, 2° blu, 3° rossi...).
  // A ogni round conta la media dei punti sfida della squadra (così vale anche con squadre dispari)
  squadre: { minimo: 4, microgiochi: 5, nomi: ['ROSSI', 'BLU'], colori: ['#ff6b5a', '#5ab4ff'] },
  // SFIDA DEL GIORNO (da soli): ogni giorno 5 microgiochi uguali per tutti, a livello NORMALE.
  // Si può rigiocare: resta il punteggio migliore del giorno
  giorno: { microgiochi: 5 },
};
