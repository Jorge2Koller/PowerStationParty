// Configurazione del microgioco 'Il Panino di Marsupino' (id: panino).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/PaninoScene.js; questa sezione arriva in CONFIG.microgiochi.panino.)
export default {
  titolo: 'Il Panino di Marsupino',
  verbo: 'IMPILA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0xe08a2a,
  musica: 'cucina',           // js/config/musiche.js
  ospite: { id: 'marsupino', etichetta: 'CHEF:\nMARSUPINO' },
  comandi: [
    'FRECCE SINISTRA/DESTRA (o A/D), oppure il mouse: muovi il pane',
    "Prendi gli ingredienti NELL'ORDINE del cliente (in alto): il prossimo ha il cerchio giallo",
    'Lascia cadere schifezze e ingredienti fuori ordine. Piano: la pila alta crolla!',
  ],
  comandiTouch: [
    'Trascina il dito in basso: il pane si sposta con lui',
    "Prendi gli ingredienti NELL'ORDINE del cliente (in alto): il prossimo ha il cerchio giallo",
    'Lascia cadere schifezze e ingredienti fuori ordine. Piano: la pila alta crolla!',
  ],
  obiettivo: 'Servi almeno 3 ordini!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // (ritarate col giocatore automatico: quello bravo serve 2-3 ordini, 145-200 punti; a caso 0-14;
  // fermo 0)
  // Revisione 4, la stessa scala per tutti (erano 70 / 150 / 220): 3 ordini (l'obiettivo) sono il
  // bronzo, 4 l'argento, 5 l'oro. Ogni ordine vale più del precedente (vedi crescitaPanino).
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoPanini: 3,
  // punti
  // (revisione 4: prima 10 a ingrediente, 30 a ordine, +10 per ingrediente oltre i tre)
  puntiIngrediente: 5,    // l'ingrediente giusto, al momento giusto
  puntiPanino: 10,        // ordine servito: il primo vale tanto...
  crescitaPanino: 6,      // ...poi + tanto x (ordini già serviti)²: 10, 16, 34, 64, 106...
  puntiLungo: 0,          // ...più tanto per ogni ingrediente oltre i tre (gli ordini lunghi hanno già più ingredienti)
  bonusRapido: 10,        // ...e se fatto in meno di "secondiRapido" secondi
  secondiRapido: 8,
  malusFuoriOrdine: 2,    // preso un ingrediente che non tocca ancora: non entra (era 3)
  malusSbagliato: 8,      // presa una schifezza: punti tolti e panino nel cestino (l'ordine resta) (era 10)
  lanciaGiusto: 0.62,     // quante volte su 1 Marsupino lancia proprio l'ingrediente che serve adesso
  // (scheda di valutazione: "forse troppo difficile". Più lanci giusti e più vicini, presa più larga,
  // pila più stabile, meno schifezze: erano lanciaGiusto 0,5, presa 20, crollo 0,3, lontano 60-190)
  // movimento del pane: velocità massima uguale per tastiera, mouse e dito (unità/s)
  velPane: 300,
  guadagnoDito: 1.15,     // col dito: quanto si sposta il pane per ogni unità di trascinamento
  presa: 24,              // mezza larghezza della zona in cui si prende (cresce di 0,6 per strato)
  // la pila ondeggia: molla (rigidità e smorzamento) spinta dalle accelerazioni del pane;
  // più strati = molla più morbida
  ondeggio: 0.003,
  rigidita: 90,
  smorzamento: 9,
  // il crollo: se la pila (con almeno due strati) pende più di "crollo", cadono gli strati di sopra
  // (stratiCrollo). Il limite si abbassa per ogni strato oltre il secondo (crolloPerStrato)
  crollo: 0.34,
  crolloPerStrato: 0.12,
  stratiCrollo: 2,
  malusCrollo: 5,
  // lanci di Marsupino: velocità di caduta a inizio e fine partita
  cadutaInizio: 80,
  cadutaFine: 135,
  // la roba buona cade lontano dal pane: a una distanza tra questi due valori (unità)
  lontanoMin: 45,
  lontanoMax: 160,
  // i tre atti: da quando (secondi), annuncio, quanti ingredienti negli ordini nuovi, secondi tra
  // un lancio e l'altro, probabilità di una schifezza, di due lanci insieme e che la schifezza sia
  // tirata addosso al pane
  atti: [
    { da: 0, ricetta: 3, lancio: 0.95, sbagliati: 0.1, doppio: 0 },
    { da: 12, nome: 'ORDINI DA QUATTRO!', ricetta: 4, lancio: 0.75, sbagliati: 0.15, doppio: 0.4 },
    { da: 24, nome: 'MARSUPINO SI ARRABBIA!', ricetta: 5, lancio: 0.6, sbagliati: 0.24, doppio: 0.35, mira: 0.55 },
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
    // (Facile resta più facile di Normale anche dopo la scheda di valutazione: erano lontano 40-140, lanciaGiusto 0,6)
    facile: { lontanoMin: 35, lontanoMax: 120, cadutaInizio: 70, cadutaFine: 125, crollo: 0.38, lanciaGiusto: 0.72, atti: { lancio: 1.2, sbagliati: 0.6 } },
    difficile: { lontanoMin: 80, lontanoMax: 230, cadutaFine: 175, crollo: 0.25, lanciaGiusto: 0.42, atti: { lancio: 0.85, sbagliati: 1.3 } },
  },
};
