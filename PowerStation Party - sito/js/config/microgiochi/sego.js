// Configurazione del microgioco 'Sego, sono sotto casa!' (id: sego).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/SegoScene.js; questa sezione arriva in CONFIG.microgiochi.sego.)
export default {
  titolo: 'Sego, sono sotto casa!',
  verbo: 'LANCIA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x8a5ac8,
  musica: 'nascosto',           // js/config/musiche.js
  ospite: { id: 'sego', etichetta: 'OBIETTIVO:\nSEGO' },
  comandi: [
    'MOUSE: premi, tira indietro come una fionda e lascia (o FRECCE + SPAZIO tenuto)',
    'Fai entrare i fumogeni dalle finestre APERTE (dov\'è Franci valgono doppio)',
    'Riempi la casa di fumo fino alla tacca gialla: Franci esce!',
  ],
  comandiTouch: [
    'Appoggia il dito e tira indietro come una fionda, poi lascia',
    'Fai entrare i fumogeni dalle finestre APERTE (dov\'è Franci valgono doppio)',
    'Riempi la casa di fumo fino alla tacca gialla: Franci esce!',
  ],
  obiettivo: 'Fai uscire Franci di casa!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: Franci fuori vale 50 + 2 al secondo avanzato + i fumogeni a segno.
  // Revisione 4, la stessa scala per tutti (erano 40 / 110 / 170): far uscire Franci è il bronzo;
  // con 6 secondi d'anticipo l'argento, con 12 l'oro. Se non esce, il fumo conta poco.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  // (scheda di valutazione: col fumo più difficile si arrivava al bronzo anche senza farlo uscire,
  // a forza di fumogeni a segno. Ora se non esce il totale si ferma a tettoPrima, e se esce vale
  // almeno il bronzo: la vittoria è farlo uscire, come dice l'obiettivo)
  tettoPrima: 90,
  soglia: 80,             // % di fumo in casa a cui Franci esce
  // in Lampo (15 secondi, solo il primo atto) la soglia è più bassa: col fumo di adesso all'80% non
  // ci arrivava quasi nessuno. Comandi e HUD non dicono il numero: c'è la tacca gialla sulla barra
  sogliaLampo: 65,
  // punti
  puntiFinestra: 5,       // fumogeno entrato da una finestra (era 3)
  puntiFranci: 9,         // ...nella stanza dove c'è Franci (era 6)
  malusSprecato: 3,       // fumogeno sul muro, sulle persiane chiuse o nel cortile (era 2)
  bonusUscita: 40,        // Franci esce (era 50)...
  bonusSecondo: 15,       // ...più tanti punti per ogni secondo che avanza (erano 2)
  puntiFumo: 0.2,         // se non esce: punti per ogni % di fumo in casa (era metà della %)
  // fumo (1 = stanza piena)
  fumoGranata: 0.48,      // quanto fumo porta un fumogeno nella stanza
  fumoVicine: 0.15,       // ...e nelle stanze accanto
  passaggio: 0.25,        // quanto fumo passa da una stanza all'altra (al secondo)
  diradaAperta: 1.3,      // quanto se ne va più in fretta con la finestra aperta
  // finestre e Franci
  aperteInizio: 5,        // finestre aperte all'inizio (su 12)
  // (scheda di valutazione: "facile, da rivedere la difficoltà". Meno fumo a fumogeno, meno finestre
  // aperte, Franci le chiude prima e il fumo se ne va più in fretta: erano 0,6, 7 aperte, atti 6/4,5/2,2)
  // i tre atti: da quando (secondi), annuncio, secondi tra una finestra che sbatte e l'altra,
  // secondi tra una finestra chiusa da Franci e l'altra, parte del fumo che se ne va ogni secondo
  atti: [
    { da: 0, vento: 3.4, franci: 4.5, dirada: 0.022 },
    { da: 12, nome: 'TIRA VENTO!', vento: 1.9, franci: 3.2, dirada: 0.03 },
    { da: 24, nome: 'FRANCI CHIUDE TUTTO!', vento: 1.6, franci: 1.8, dirada: 0.04 },
  ],
  // lancio
  ricarica: 0.85,         // secondi per prendere il fumogeno successivo
  // fionda (mouse e dito): quanto tirare indietro (unità) per la forza piena. Se sotto al punto
  // dove hai premuto c'è meno spazio, basta meno (mai meno di tiroMinimo). Col mouse si tira di
  // meno: il mouse è preciso, e spesso si preme in fondo allo schermo, sulla mano
  tiroPieno: 46,          // (era 70 per tutti)
  tiroPienoDito: 64,
  tiroMinimo: 24,
  mirino: 2.2,            // quanto si sposta il mirino per ogni unità di tiro di lato (mouse)...
  mirinoDito: 2.2,        //   ...e col dito
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
