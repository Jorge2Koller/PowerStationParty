// Le modalità della Fase 6 (si comprano al Bancone: js/config/bancone.js, "modalita") e della Fase 7,
// e il BEER PONG (in fondo).
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

  // --- BEER PONG (gratis; da 2 a 6 giocatori) ---
  // La partita vera tra di voi, a tiri alternati: ROSSI contro BLU, in ordine di scelta come in
  // Squadre (il 1°, il 3°, il 5° sono rossi; il 2°, il 4°, il 6° blu). In 2 è un 1 contro 1, in 4
  // un 2 contro 2, in 6 un 3 contro 3; con 3 o 5 giocatori l'ultimo scelto fa l'arbitro.
  // Vince chi toglie per primo tutti i bicchieri avversari. Il tiro, la sbronza e le gag sono
  // quelli del microgioco "Beer Pong al Pallaio": js/config/beerpong.js.
  beerpong: {
    minimo: 2,
    massimo: 6,
    bicchieri: { 1: 6, 2: 10, 3: 10 },   // per squadra, secondo quanti si è per squadra
    // secondi di gioco al massimo (il passaggio di mano non conta). Allo scadere si finisce il giro
    // e vince chi ha più bicchieri in piedi; se sono pari, un tiro a testa a oltranza
    tempoMassimo: 240,
    sbronzaPeso: 1,                      // quanto pesa la sbronza sulla mira (1 = come in js/config/beerpong.js)
    musica: 'festa',
    // l'arbitro (quando c'è) commenta da bordo tavolo
    arbitro: {
      centro: ['Regolare!', 'Bel tiro. Si beve!', 'Convalidato!', 'Dentro, dentro.'],
      rimbalzo: ['Di rimbalzo vale doppio!', 'Rimbalzo regolare!'],
      fuori: ['Fuori. Nettamente.', 'Si rigioca? No.', 'Ho visto di meglio.', 'Liscio!'],
      bordo: ['Ha toccato il bordo, l\'ho visto!', 'Bordo. Non vale.'],
      sbronza: ['Qui qualcuno ha bevuto.', 'Segnalo ubriachezza.', 'Tutto regolare. Più o meno.'],
      inizio: ['Mani dietro la linea!', 'Voglio una partita pulita.', 'Fischio io.'],
    },
    // la frase di sfottò per chi perde ({perdenti} e {vincitori} = i nomi): nell'uno contro uno
    // (uno solo che perde) e a squadre
    frasiPerdente: [
      '{perdenti}: domani offri tu. Se ti ricordi qualcosa.',
      '{vincitori} al bancone, {perdenti} a raccogliere i bicchieri.',
      '{perdenti}, la mira l\'hai lasciata a casa.',
      'Qualcuno riaccompagni {perdenti}. Piano.',
      '{perdenti}: più birra bevuta che bicchieri centrati.',
    ],
    frasiPerdenti: [
      '{perdenti}: domani offrite voi. Se vi ricordate qualcosa.',
      '{vincitori} al bancone, {perdenti} a raccogliere i bicchieri.',
      '{perdenti}, la mira l\'avete lasciata a casa.',
      'Qualcuno riaccompagni {perdenti}. Piano.',
      '{perdenti}: più birra bevuta che bicchieri centrati.',
    ],
    canzone: ['LA-LA-LAAA!', 'OOOH-OOOH!', 'NANANA-NAAA!', 'E SE NE VAAA...'],
  },
};
