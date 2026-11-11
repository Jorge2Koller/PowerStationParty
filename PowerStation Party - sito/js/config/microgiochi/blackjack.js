// Configurazione del microgioco "L'Ingiocabile" (id: blackjack).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/; questa sezione arriva in CONFIG.microgiochi.blackjack.)
export default {
  titolo: "L'Ingiocabile",
  verbo: 'PUNTA!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x1f8a4a,
  musica: 'casino',           // js/config/musiche.js
  ospite: { id: 'ingiocabile', etichetta: "AL BANCO:\nL'INGIOCABILE" },
  comandi: [
    '1, 2, 3 (o le fiches): punta. Poi C carta, S stai, D raddoppia (o i pulsanti)',
    'Arriva vicino a 21 senza sballare: il banco sta su 17. Decidi in fretta!',
    'Ogni mano vinta: le fiches vinte sono punti. Giocata da pro (le mosse giuste): paga doppio',
  ],
  comandiTouch: [
    'Tocca una fiche per puntare, poi CARTA, STAI o RADDOPPIA',
    'Arriva vicino a 21 senza sballare: il banco sta su 17. Decidi in fretta!',
    'Ogni mano vinta: le fiches vinte sono punti. Giocata da pro (le mosse giuste): paga doppio',
  ],
  obiettivo: 'Vinci almeno 100 fiches!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. stringi = gli elenchi a tempo i cui atti si stringono nei 15 secondi
  lampo: { obiettivo: 'Vinci almeno 43 fiches!', stringi: ['atti'] },
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: le fiches vinte nelle mani vinte.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  // Il punteggio sono le fiches VINTE nelle mani vinte (1 punto a fiche, subito a ogni mano vinta).
  // La mano vinta paga la puntata (il blackjack 3 a 2, il raddoppio il doppio), quella persa se la
  // porta via ma non toglie punti: quanto punti conta. (Scheda 2: prima contavano le fiches sopra le
  // 100 di partenza, e dopo una mano persa vincerne una non dava punti.) Se vinci una mano giocandola tutta da pro (almeno una scelta, tutte
  // uguali alla strategia di base) il banco paga premioPro in più (1 = la vincita due volte). Mosse
  // giuste e mani perse: niente punti. Puntare forte rende di più, ma al verde la partita finisce.
  // (Revisione 4: contavano le mosse da pro di fila, e le fiches pochissimo. L'utente: "non è che
  // se fai mosse giuste ma perdi sempre le mani vinci comunque", e la puntata deve contare.)
  fiches: 100,
  premioPro: 1,             // (con 0,5 il giocatore automatico bravo vinceva 2 partite su 8: troppa fortuna)
  // i tre atti: da quando (secondi), annuncio, secondi per puntare e per ogni scelta (poi il banco
  // punta il minimo per te, o stai)
  atti: [
    { da: 0, tempo: 2.6 },
    { da: 12, nome: 'IL BANCO ACCELERA!', tempo: 2 },
    { da: 24, nome: 'ULTIME MANI!', tempo: 1.7 },
  ],
  puntate: [10, 25, 50],
  // le attese del banco (dare le carte, tirare, pagare) per tanto: con 0,7 in 35 secondi si giocano
  // 9-10 mani invece di 6-7, e la fortuna di una mano pesa meno; con 0,5 (scheda di valutazione:
  // "aumentare la velocità per fare più mani") se ne giocano ancora un paio in più
  ritmoTavolo: 0.5,
  mazzi: 2,
  rimescola: 20,          // sotto queste carte rimaste, il sabot si rimescola
  stai: 17,               // il banco tira finché non arriva almeno a questo
  frasi: ['Puntate, signori.', 'Fate il vostro gioco.', 'Il banco aspetta.', 'Coraggio...', 'Carte!'],
  frasiPerde: ['Mah...', 'Fortuna.', 'Stavolta passi.', 'Mischio meglio la prossima.', 'Pff.'],
  frasePerdeSpesso: 'Non mi fanno',   // quando perde il banco, una volta su due dice questa
  fraseServe: 'Sto leggendo',         // mentre dà le carte (non sempre: vedi serveOgni)
  serveOgni: 0.5,                     // probabilità di dirla a ogni mano
  fraseVince: 'Come le leggo!',
  // lo Zio, al tavolo come spettatore (non gioca): quando perdi ride, e ogni tanto sogna in grande
  frasiZioPerdi: ['Popone'],
  frasiZio: ['Se entro mi fo lo stipendio'],
  zioOgni: [10, 16],                  // secondi (da... a...) tra un commento e l'altro
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { atti: { tempo: 1.5 } },
    difficile: { atti: { tempo: 0.75 } },
  },
};
