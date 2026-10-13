// Configurazione del microgioco "L'Ingiocabile" (id: blackjack).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/; questa sezione arriva in CONFIG.microgiochi.blackjack.)
export default {
  titolo: "L'Ingiocabile",
  verbo: 'PUNTA!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x1f8a4a,
  ospite: { id: 'ingiocabile', etichetta: "AL BANCO:\nL'INGIOCABILE" },
  comandi: [
    '1, 2, 3 (o le fiches): punta. Poi C carta, S stai, D raddoppia (o i pulsanti)',
    'Arriva vicino a 21 senza sballare: il banco sta su 17. Decidi in fretta!',
    'Gioca come un pro: ogni mossa giusta vale fiches in più',
  ],
  comandiTouch: [
    'Tocca una fiche per puntare, poi CARTA, STAI o RADDOPPIA',
    'Arriva vicino a 21 senza sballare: il banco sta su 17. Decidi in fretta!',
    'Gioca come un pro: ogni mossa giusta vale fiches in più',
  ],
  obiettivo: 'Finisci con più di 100 fiches!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: le fiches: si parte con 100, quindi sotto le 100 vale zero.
  medaglie: { zero: 110, bronzo: 130, argento: 170, oro: 240 },   // (chi sta fermo: il banco punta il minimo per lui, finisce tra 90 e 110)
  fiches: 100,
  // i tre atti: da quando (secondi), annuncio, secondi per puntare e per ogni scelta (poi il banco
  // punta il minimo per te, o stai) e fiches in più per ogni scelta uguale alla strategia di base
  atti: [
    { da: 0, tempo: 3, bonus: 5 },
    { da: 12, nome: 'IL BANCO ACCELERA!', tempo: 2.3, bonus: 5 },
    { da: 24, nome: 'MOSSE DA PRO x2!', tempo: 2, bonus: 10 },
  ],
  puntate: [10, 25, 50],
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
