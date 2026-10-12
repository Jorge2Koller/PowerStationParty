// Configurazione del microgioco 'Guerra, via quelle mani!' (id: mani).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/ManiScene.js; questa sezione arriva in CONFIG.microgiochi.mani.)
export default {
  titolo: 'Guerra, via quelle mani!',
  verbo: 'SCIAF!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x2f8a5a,
  ospite: { id: 'guerra', etichetta: 'OCCHIO A:\nGUERRA' },
  comandi: [
    'CLIC sulle mani di Guerra: schiaffo! (o i tasti 1-5: la mano su quel piatto)',
    'Se una mano prende un piatto, colpiscila per salvarlo. Col guanto: DUE schiaffi',
    'Schiaffo a vuoto: la mano ti fa male. All\'ultimo istante vale di più!',
  ],
  comandiTouch: [
    'Tocca le mani di Guerra per dargli uno schiaffo (anche due insieme)',
    'Se una mano prende un piatto, colpiscila per salvarlo. Col guanto: DUE schiaffi',
    'Schiaffo a vuoto: la mano ti fa male. All\'ultimo istante vale di più!',
  ],
  obiettivo: 'Salva almeno 3 piatti su 5!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: schiaffi da 5-8 punti + 15 per piatto rimasto.
  medaglie: { bronzo: 70, argento: 150, oro: 240 },   // (stima per 35 s)
  piattiMinimi: 3,
  // punti
  puntiSchiaffo: 5,      // schiaffo normale
  puntiUltimo: 8,        // ...se la mano era a meno di "vicino" unità dal piatto
  puntiSalvato: 4,       // ...se stava già trascinando via un piatto: è un recupero, vale meno
                         //    (altrimenti converrebbe lasciarli prendere apposta)
  puntiGuanto: 2,        // guanto da forno tolto (primo schiaffo)
  puntiPiatto: 15,       // per ogni piatto ancora tuo alla fine
  vicino: 30,
  // schiaffi
  raggioSchiaffo: 15,    // quanto vicino al palmo bisogna cliccare (unità)
  raggioDito: 19,        // col dito un po' di più: è meno preciso del mouse
  bloccoVuoto: 0.6,      // secondi di mano dolorante dopo uno schiaffo a vuoto
  velRitiro: 420,        // velocità della mano che scappa dopo lo schiaffo
  // Fasi di difficoltà. "da" = secondo da cui vale la fase.
  //  maxMani = mani in giro insieme, vel = velocità delle mani (unità/s),
  //  intervallo = [min,max] secondi tra una mano e l'altra, tira = velocità con cui trascina un piatto,
  //  finta / guanto = probabilità (0-1); nome = l'annuncio (i tre atti)
  fasi: [
    { da: 0,  maxMani: 1, vel: 66,  intervallo: [1.3, 1.7],  tira: 22, finta: 0,    guanto: 0 },
    { da: 6,  maxMani: 2, vel: 82,  intervallo: [1.0, 1.4],  tira: 26, finta: 0.15, guanto: 0 },
    { da: 12, nome: 'IL GUANTO DA FORNO!', maxMani: 3, vel: 100, intervallo: [0.8, 1.1], tira: 32, finta: 0.25, guanto: 0.25 },
    { da: 24, nome: 'GUERRA HA FAME!', maxMani: 4, vel: 125, intervallo: [0.55, 0.8], tira: 40, finta: 0.3, guanto: 0.2 },
    { da: 30, maxMani: 5, vel: 140, intervallo: [0.45, 0.65], tira: 45, finta: 0.3, guanto: 0.25 },
  ],
  frasi: ['Solo un assaggio!', 'Ma questo lo lasci?', 'Una forchettata e basta!', 'Che fame...', 'Dai, dividiamo!', 'Non lo finisci?'],
  frasiSchiaffo: ['Ahia!', 'Che manesco!', 'Ma dai!', 'Ohi!', 'Che cattiveria...'],
  frasiFurto: ['Grazie!', 'Buonissimo!', 'Gnam!', 'Questo è mio!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { bloccoVuoto: 0.4, fasi: { vel: 0.85, intervallo: 1.2, tira: 0.8 } },
    difficile: { bloccoVuoto: 0.8, fasi: { vel: 1.15, intervallo: 0.85, tira: 1.15 } },
  },
};
