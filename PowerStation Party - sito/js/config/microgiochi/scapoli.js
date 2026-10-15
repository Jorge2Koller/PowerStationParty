// Configurazione del microgioco "L'Incubo degli Scapoli" (id: scapoli): la sfida di ballo contro il Manna.
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/ScapoliScene.js; questa sezione arriva in CONFIG.microgiochi.scapoli.)
export default {
  titolo: "L'Incubo degli Scapoli",
  verbo: 'BALLA!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x9b3fd6,
  musica: 'pista',          // traccia di audio.js (un'altra da 'disco', che è quella di Petri Tentacolari)
  ospite: { id: 'manna', etichetta: 'SFIDA DI BALLO:\nIL MANNA' },
  comandi: [
    'FRECCE (o WASD): premi la freccia quando scende sul bersaglio',
    'Perfetto e serie: le ragazze passano dalla tua parte',
    "Quelle d'oro valgono doppio, ma vanno prese precise",
  ],
  comandiTouch: [
    'Tocca il quarto di schermo della freccia quando scende sul bersaglio',
    'Perfetto e serie: le ragazze passano dalla tua parte',
    "Quelle d'oro valgono doppio, ma vanno prese precise",
  ],
  obiettivo: 'Porta almeno 3 ragazze su 5 dalla tua parte!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 300 / 700 / 1300; il giocatore automatico perfetto
  // faceva 1800-2100): le frecce valgono un decimo, e le ragazze dalla tua parte sempre di più
  // (vedi bonusRagazze), così portarne 3 (l'obiettivo) va col bronzo.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  ragazzeVittoria: 3,       // quante ragazze servono alla fine per vincere
  // punti: ogni freccia (le d'oro il doppio), per il moltiplicatore della serie; a fine partita
  // ogni ragazza dalla tua parte
  puntiPerfetto: 1,         // (era 10)
  puntiBuono: 0.5,          // (era 5)
  // alla fine, le ragazze dalla tua parte (da 0 a 5): sotto le 3 niente, poi sempre di più (era 25 a ragazza)
  bonusRagazze: [0, 0, 0, 70, 140, 200],
  maxMoltiplicatore: 3,     // la serie: +0,5 ogni 10 frecce di fila, fino a tanto
  // quanto si può sbagliare il tempo (secondi, prima o dopo): perfetto e buono; oltre è mancata
  finestre: { perfetto: 0.06, buono: 0.13 },
  finestreOro: { perfetto: 0.045, buono: 0.08 },
  finestreDoppie: { perfetto: 0.1, buono: 0.2 },   // le doppie: due tasti (o due dita) insieme, più larghe
  durataBallo: 0.9,         // secondi che chi gioca continua a ballare dopo una freccia presa
  // quanto pende la pista (da 0 a 1: ogni ragazza è un quinto) per ogni freccia...
  spinta: { perfetto: 0.03, buono: 0.015, mancato: 0.05, vuoto: 0.015 },
  // ...e quanto la tira il Manna, al secondo, in ogni atto (chi sta fermo le perde tutte)
  pressione: [0.012, 0.02, 0.032],
  primoPasso: 8,            // ottavi di attesa prima della prima freccia
  // I tre atti: da = secondo d'inizio, ogni = ottavi tra una freccia e l'altra, doppie = probabilità
  // di due frecce insieme (solo nell'ultimo atto, mai due di fila), oro = di una freccia d'oro,
  // raffica = di una freccia subito dopo (un ottavo)
  atti: [
    { da: 0, ogni: 4, doppie: 0, oro: 0, raffica: 0, nome: '' },
    { da: 11, ogni: 2, doppie: 0, oro: 0.14, raffica: 0.12, nome: "LE FRECCE D'ORO!" },
    { da: 23, ogni: 2, doppie: 0.08, oro: 0.12, raffica: 0.3, nome: 'IL MANNA SI SCATENA!' },
  ],
  tempoFinale: 1.25,        // nell'ultimo atto la musica accelera fino a tanto
  frasiManna: ['Guarda e impara.', 'Ovviamente.', 'Questa è roba mia.', 'Troppo lento, bello.', 'Le ragazze mi adorano.'],
  frasiMannaPerde: ['Era bianca! BIANCA!', 'Non vale, la musica è lenta!', 'Chi ti ha insegnato?!', 'DJ, cambia pezzo!'],
  frasiMannaVince: ['Ovviamente.', 'Torna quando sai ballare.', 'La pista è mia, bello.'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { finestre: { perfetto: 0.075, buono: 0.16 }, finestreOro: { perfetto: 0.06, buono: 0.1 }, finestreDoppie: { perfetto: 0.12, buono: 0.24 }, tempoFinale: 1.15 },
    difficile: { finestre: { perfetto: 0.05, buono: 0.11 }, finestreOro: { perfetto: 0.038, buono: 0.065 }, finestreDoppie: { perfetto: 0.085, buono: 0.17 }, tempoFinale: 1.35 },
  },
};
