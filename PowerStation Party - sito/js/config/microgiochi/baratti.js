// Configurazione del microgioco 'Capitan Ghiori' (id: baratti).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/BarattiScene.js; questa sezione arriva in CONFIG.microgiochi.baratti.)
export default {
  titolo: 'Capitan Ghiori',
  verbo: 'TIRA!',           // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x4f6f86,
  musica: 'marinara',       // js/config/musiche.js
  // Giorgio porta il gommone (il Danda 2): chi sceglie Giorgio qui gioca "contro se stesso" (a prua
  // c'è il suo doppione). Anche Greg, che nuota lì vicino: se gioca lui, in acqua c'è il suo doppione
  ospite: { id: 'giorgio', etichetta: 'IN BARCA CON:\nGIORGIO' },
  cast: ['greg'],
  trofeo: 'Oro a Parti, Giorgio!',   // il nome del suo trofeo d'oro (al posto di "Oro: Capitan Ghiori")
  comandi: [
    'SPAZIO o clic a ritmo: ogni colpo è uno strappo',
    'Barra piena: UN colpo con la lancetta nel VERDE',
    'Arriva alla boa rossa! Al centro del verde: PERFETTO!',
  ],
  comandiTouch: [
    'Tocca a ritmo, anche a due dita: è uno strappo',
    'Barra piena: UN tocco con la lancetta nel VERDE',
    'Arriva alla boa rossa! Al centro del verde: PERFETTO!',
  ],
  obiettivo: 'Fai partire il motore 5 volte: arriva alla boa rossa!',
  // In Lampo (15 secondi) solo lo strappo puro: niente lancetta, a barra piena il motore parte da
  // solo. Comandi e obiettivo li mostra l'introduzione al posto di quelli sopra
  lampo: {
    comandi: ['Premi SPAZIO più veloce che puoi: i GIRI salgono', 'Barra piena: il motore parte da solo!'],
    comandiTouch: ['Tocca più veloce che puoi (anche a due dita)', 'Barra piena: il motore parte da solo!'],
    obiettivo: 'Premi più veloce che puoi! 3 partenze per la boa',
  },
  // Medaglie (js/punteggi.js): la scala comune. La boa rossa (5 partenze) è il bronzo: fino ad
  // allora il totale si ferma a tettoPrima, quando ci arrivi sale almeno a 100
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  tettoPrima: 90,

  // --- punti ---
  punti: 10,          // ogni volta che il motore parte
  perfetto: 5,        // in più se lo strappo finale è al centro della zona verde
  puntoMetro: 1,      // per ogni metro fatto dal gommone
  boa: 5,             // le partenze per arrivare alla boa rossa (la vittoria)
  boaLampo: 3,        // in Lampo
  metri: 15,          // i metri di ogni corsa (la boa è a boa x metri)

  // --- il motore ---
  premuteAlSecondo: 10,   // al massimo tante pressioni al secondo: quelle in più non contano
  meta: 0.5,              // dopo uno strappo finale sbagliato la barra dei giri torna qui
  perfetta: 0.3,          // PERFETTO se la lancetta è entro questa frazione di mezza zona dal centro
  tempoLancetta: 2.6,     // secondi in cui resta la lancetta; se non premi, la barra si scarica
  corsa: 1,               // secondi di corsa del gommone
  pausaPuf: 0.35,         // secondi del "puf puf", prima di ricominciare dalla carica
  pausaSbagliato: 0.7,    // secondi in cui Giorgio si dispera, dopo uno strappo finale sbagliato

  // I tre atti: da quando (secondi; daLampo in Lampo, dove dura 15 secondi: come nella Spina, così
  // anche lì si passa per tutti e tre), annuncio e riga sotto. strappo = di quanto sale la barra a ogni
  // pressione (1 = piena), cala = quanto scende da sola al secondo, zona = ampiezza della zona verde
  // (frazione del quadrante), lancetta = quadranti al secondo, sposta = di quanto si sposta la zona
  // verde avanti e indietro (terzo atto, le onde)
  atti: [
    { da: 0, daLampo: 0, nome: 'SI PARTE!', strappo: 0.13, cala: 0.2, zona: 0.24, lancetta: 0.75, sposta: 0 },
    { da: 12, daLampo: 5, nome: 'INGOLFATO!', sotto: 'Fumo nero: i giri salgono più piano', strappo: 0.105, cala: 0.3, zona: 0.18, lancetta: 0.9, sposta: 0, fumoNero: true },
    { da: 24, daLampo: 10, nome: 'ARRIVA LA BURRASCA!', sotto: 'Le onde: la zona verde si sposta!', strappo: 0.1, cala: 0.3, zona: 0.17, lancetta: 1.15, sposta: 0.2, onde: true, fumoNero: true },
  ],

  // --- Giorgio e gli altri ---
  frasi: ['Dai, dai, dai!', 'Ieri partiva!', 'È la batteria!', 'Ancora uno e parte, giuro!', 'Danda, non mi tradire!'],
  frasiParte: ['Vaiii!', 'Si va!', 'Danda!!', 'Te lo dicevo!'],
  frasiMuore: ['Noooo!', 'Ma dai...', 'Ieri partiva!', 'È la batteria!'],
  // Greg, che nuota nell'acqua bassa vicino ai motori delle barche ormeggiate (dal secondo atto),
  // terrorizzato: le sue frasi, e quelle di quando il motore del Danda parte e lui scappa
  frasiGreg: ['Ho la submechanophobia!', 'Le eliche sott\'acqua no!', 'Spegnete quei motori!', 'Non guardate sotto!', 'Qualcosa mi ha toccato un piede!'],
  frasiGregMotore: ['Spegnete quei motori!', 'Le eliche sott\'acqua no!'],
  frasiRiva: ['Ahahah!', 'Spingi, Capitano!', 'Hai provato coi remi?'],

  // I livelli: Normale è la configurazione qui sopra; Facile e Difficile cambiano solo questi valori.
  // Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { atti: { strappo: 1.2, cala: 0.75, zona: 1.3, lancetta: 0.82 }, perfetta: 0.36 },
    difficile: { atti: { strappo: 0.85, cala: 1.25, zona: 0.78, lancetta: 1.18 }, perfetta: 0.25 },
  },
};
