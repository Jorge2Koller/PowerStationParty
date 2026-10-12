// Configurazione del microgioco 'Sego, sono sotto casa!' (id: sego).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/SegoScene.js; questa sezione arriva in CONFIG.microgiochi.sego.)
export default {
  titolo: 'Sego, sono sotto casa!',
  verbo: 'LANCIA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x8a5ac8,
  ospite: { id: 'sego', etichetta: 'OBIETTIVO:\nSEGO' },
  comandi: [
    'MOUSE: premi, tira indietro come una fionda e lascia (o FRECCE + SPAZIO tenuto)',
    'Fai entrare i fumogeni dalle finestre APERTE (dov\'è Franci valgono doppio)',
    'Riempi la casa di fumo: all\'80% Franci esce!',
  ],
  comandiTouch: [
    'Appoggia il dito e tira indietro come una fionda, poi lascia',
    'Fai entrare i fumogeni dalle finestre APERTE (dov\'è Franci valgono doppio)',
    'Riempi la casa di fumo: all\'80% Franci esce!',
  ],
  obiettivo: 'Fai uscire Franci di casa!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: Franci fuori vale 50 + 2 al secondo avanzato + i fumogeni a segno.
  medaglie: { bronzo: 40, argento: 110, oro: 170 },
  soglia: 80,             // % di fumo in casa a cui Franci esce
  // punti
  puntiFinestra: 3,       // fumogeno entrato da una finestra
  puntiFranci: 6,         // ...nella stanza dove c'è Franci
  malusSprecato: 2,       // fumogeno sul muro, sulle persiane chiuse o nel cortile
  bonusUscita: 50,        // Franci esce
  bonusSecondo: 2,        // ...più 2 punti per ogni secondo che avanza
  // fumo (1 = stanza piena)
  fumoGranata: 0.6,       // quanto fumo porta un fumogeno nella stanza
  fumoVicine: 0.15,       // ...e nelle stanze accanto
  passaggio: 0.25,        // quanto fumo passa da una stanza all'altra (al secondo)
  diradaAperta: 1.3,      // quanto se ne va più in fretta con la finestra aperta
  // finestre e Franci
  aperteInizio: 7,        // finestre aperte all'inizio (su 12)
  // i tre atti: da quando (secondi), annuncio, secondi tra una finestra che sbatte e l'altra,
  // secondi tra una finestra chiusa da Franci e l'altra, parte del fumo che se ne va ogni secondo
  atti: [
    { da: 0, vento: 4, franci: 6, dirada: 0.015 },
    { da: 12, nome: 'TIRA VENTO!', vento: 2.2, franci: 4.5, dirada: 0.022 },
    { da: 24, nome: 'FRANCI CHIUDE TUTTO!', vento: 2, franci: 2.2, dirada: 0.03 },
  ],
  // lancio
  ricarica: 0.7,          // secondi per prendere il fumogeno successivo
  periodoForza: 2.2,      // tastiera: secondi perché la forza salga e riscenda (SPAZIO tenuto)
  velMira: 200,           // tastiera: velocità del mirino (unità/s)
  tolleranza: 4,          // margine (unità) intorno al vano della finestra
  nebbia: 3,              // secondi di fumo sprecato davanti alla casa
  frasi: ['Chi è?', 'Cinque minuti!', 'Non ci sono!', 'Sto arrivando...', 'Sto finendo una cosa!', 'Ma che volete?'],
  frasiTosse: ['COF COF!', 'Ma siete matti?!', 'Che fumo!', 'Non si respira!'],
  frasiChiude: ['Chiudo tutto!', 'Che spiffero!', 'Fuori di qui!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { atti: { vento: 1.3, franci: 1.4, dirada: 0.7 } },
    difficile: { atti: { vento: 0.8, franci: 0.75, dirada: 1.3 } },
  },
};
