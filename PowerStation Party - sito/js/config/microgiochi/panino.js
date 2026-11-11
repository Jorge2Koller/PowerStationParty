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
    'Marsupino va avanti e indietro: CLIC o SPAZIO quando è sopra al panino',
    "Più cade al centro più vale. Segui l'ORDINE del cliente (in alto)",
    'Schifezze e ingredienti sbagliati: NON lasciarli, li cambia lui. Storto: la pila crolla!',
  ],
  comandiTouch: [
    'Marsupino va avanti e indietro: TOCCA quando è sopra al panino',
    "Più cade al centro più vale. Segui l'ORDINE del cliente (in alto)",
    'Schifezze e ingredienti sbagliati: NON lasciarli, li cambia lui. Storto: la pila crolla!',
  ],
  obiettivo: 'Servi almeno 3 panini!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase)
  lampo: { obiettivoPanini: 1, obiettivo: 'Servi almeno 1 panino!', stringi: ['atti'] },
  // Medaglie (js/punteggi.js): stessa scala per tutti. 3 panini fatti bene sono il bronzo.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoPanini: 3,
  // Scheda 2: "la grafica è da rivedere, da migliorare la fluidità: ispirati a giochi esistenti, come
  // per Guitar Hero; il Pallaio come ambientazione". Rifatto come Papa's Burgeria + Stack: Marsupino va
  // avanti e indietro con l'ingrediente sopra la testa, e si lascia cadere sul panino a tempo.
  // (Prima: il pane si spostava sul bancone e Marsupino lanciava la roba dall'alto.)
  punti: { perfetto: 6, buono: 4, storto: 2 },
  // quanto lontano dal centro della cima (unità): perfetto, buono, storto; oltre, cade fuori
  finestre: { perfetto: 4, buono: 10, storto: 22 },
  spostamento: 0.8,       // storto o buono: di quanto si sposta la cima (1 = dove è caduto)
  crollo: 20,             // se la cima è più in là di così dal centro del pane, crolla
  corsa: 150,             // quanto si sposta Marsupino a destra e a sinistra (unità)
  velCaduta: 420,         // unità/s
  attesa: 0.35,           // secondi tra un pezzo e l'altro
  tempoSbagliato: 1.3,    // secondi che tiene in mano la schifezza prima di cambiarla
  puntiPanino: 10,        // ordine servito: il primo vale tanto...
  crescitaPanino: 4,      // ...poi + tanto x (ordini già serviti)²: 10, 14, 26, 46...
  bonusRapido: 8,         // ...e se fatto in meno di "secondiRapido" secondi
  secondiRapido: 7,
  malusMancato: 3,        // caduto fuori dal panino
  malusSbagliato: 8,      // lasciata cadere una schifezza: panino da buttare (l'ordine resta)
  malusCrollo: 5,
  // gli atti: vel = velocità dell'andirivieni (radianti al secondo), ricetta = ingredienti
  // dell'ordine, sbagliati = probabilità che abbia in mano la cosa sbagliata, scatti = quanto cambia
  // la velocità (l'ultimo atto: ora svelto, ora piano)
  atti: [
    { da: 0, ricetta: 3, vel: 2.2, sbagliati: 0 },
    { da: 12, nome: 'ORDINI DA QUATTRO!', ricetta: 4, vel: 2.8, sbagliati: 0.25 },
    { da: 24, nome: 'MARSUPINO SI ARRABBIA!', ricetta: 5, vel: 3.3, sbagliati: 0.3, scatti: 0.4 },
  ],
  frasi: ['Al volo!', 'Abbonda col ketchup!', 'Questo è arte.', 'Panino della casa!', 'Occhio al würstel!', 'Dai che si fredda!'],
  frasiPanino: ['Capolavoro!', 'Uno spettacolo!', 'Questo lo mangio io!', 'Chef stellato!'],
  // panino rovinato: prima l'urlo (corto, a caratteri cubitali), poi continua a brontolare
  urla: ['MA CHE FAI?!', 'NOOOO!', 'CHE SCHIFO!', 'IL MIO PANINO!', 'MA SEI MATTO?!', 'ROBA DA PAZZI!'],
  frasiSbaglio: ['Quello era il mio calzino!', 'Così me lo rovini!', 'Fuori dal mio bar!', 'Ma chi ti ha insegnato?!', 'Lo butto, lo butto tutto!', 'Non ci vedo più dalla rabbia!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { finestre: { perfetto: 5, buono: 13, storto: 26 }, crollo: 26, atti: { vel: 0.8 } },
    difficile: { finestre: { perfetto: 3, buono: 8, storto: 18 }, crollo: 16, atti: { vel: 1.2 } },
  },
};
