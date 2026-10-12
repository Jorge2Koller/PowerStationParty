// Configurazione del microgioco 'Il Panino di Marsupino' (id: panino).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/PaninoScene.js; questa sezione arriva in CONFIG.microgiochi.panino.)
export default {
  titolo: 'Il Panino di Marsupino',
  verbo: 'IMPILA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0xe08a2a,
  ospite: { id: 'marsupino', etichetta: 'CHEF:\nMARSUPINO' },
  comandi: [
    'FRECCE SINISTRA/DESTRA (o A/D), oppure il mouse: muovi il pane',
    'Prendi i 5 ingredienti in alto (ketchup e maionese dai tubetti): panino fatto!',
    'NON prendere calzini, lische, ghiaccio e ciabatte! Più è alto, più ondeggia',
  ],
  comandiTouch: [
    'Trascina il dito in basso: il pane si sposta con lui',
    'Prendi i 5 ingredienti in alto (ketchup e maionese dai tubetti): panino fatto!',
    'NON prendere calzini, lische, ghiaccio e ciabatte! Più è alto, più ondeggia',
  ],
  obiettivo: 'Fai almeno 3 panini completi!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Stima: un panino completo vale circa 80-90: tre panini (la vittoria) sono l'argento.
  medaglie: { bronzo: 70, argento: 180, oro: 300 },   // (stima per 35 s, con la roba che cade lontano dal pane)
  obiettivoPanini: 3,
  // punti
  puntiIngrediente: 10,   // ingrediente che mancava nel panino
  puntiDoppione: 3,       // ingrediente che c'era già (si impila lo stesso)
  puntiPanino: 30,        // panino completo
  bonusRapido: 10,        // ...se fatto in meno di "secondiRapido" secondi
  secondiRapido: 8,
  malusSbagliato: 10,     // presa una schifezza: punti tolti e panino nel cestino
  // movimento del pane: velocità massima uguale per tastiera, mouse e dito (unità/s)
  velPane: 300,
  guadagnoDito: 1.15,     // col dito: quanto si sposta il pane per ogni unità di trascinamento
  presa: 20,              // mezza larghezza della zona in cui si prende (cresce di 0,6 per strato)
  maxStrati: 10,          // oltre, i doppioni non entrano più (gli ingredienti che mancano sì)
  // la pila ondeggia: molla (rigidità e smorzamento) spinta dalle accelerazioni del pane;
  // più strati = molla più morbida
  ondeggio: 0.003,
  rigidita: 90,
  smorzamento: 9,
  // lanci di Marsupino: velocità di caduta a inizio e fine partita
  cadutaInizio: 80,
  cadutaFine: 150,
  // la roba buona cade lontano dal pane: a una distanza tra questi due valori (unità)
  lontanoMin: 60,
  lontanoMax: 190,
  // i tre atti: da quando (secondi), annuncio, secondi tra un lancio e l'altro, probabilità di una
  // schifezza, di due lanci insieme e che la schifezza sia tirata addosso al pane
  atti: [
    { da: 0, lancio: 1.0, sbagliati: 0.1, doppio: 0 },
    { da: 12, nome: 'DOPPIO LANCIO!', lancio: 0.8, sbagliati: 0.18, doppio: 0.4 },
    { da: 24, nome: 'MARSUPINO SI ARRABBIA!', lancio: 0.6, sbagliati: 0.3, doppio: 0.35, mira: 0.7 },
  ],
  // tubetti di ketchup e maionese
  tubettoInizio: 3.4,     // secondi tra un tubetto e l'altro
  tubettoFine: 2.2,
  velSchizzo: 1.35,       // gli schizzi cadono più veloci degli ingredienti
  frasi: ['Al volo!', 'Abbonda col ketchup!', 'Questo è arte.', 'Panino della casa!', 'Occhio al würstel!', 'Dai che si fredda!'],
  frasiPanino: ['Capolavoro!', 'Uno spettacolo!', 'Questo lo mangio io!', 'Chef stellato!'],
  // panino rovinato: prima l'urlo (corto, a caratteri cubitali), poi continua a brontolare
  urla: ['MA CHE FAI?!', 'NOOOO!', 'CHE SCHIFO!', 'IL MIO PANINO!', 'MA SEI MATTO?!', 'ROBA DA PAZZI!'],
  frasiSbaglio: ['Quello era il mio calzino!', 'Così me lo rovini!', 'Fuori dal mio bar!', 'Ma chi ti ha insegnato?!', 'Lo butto, lo butto tutto!', 'Non ci vedo più dalla rabbia!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { lontanoMin: 40, lontanoMax: 140, cadutaInizio: 70, cadutaFine: 125, atti: { lancio: 1.2, sbagliati: 0.6 } },
    difficile: { lontanoMin: 80, lontanoMax: 230, cadutaFine: 175, atti: { lancio: 0.85, sbagliati: 1.3 } },
  },
};
