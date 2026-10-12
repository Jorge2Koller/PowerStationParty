// Configurazione del microgioco 'Il Passaggiorgio' (id: guida).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/GuidaScene.js; questa sezione arriva in CONFIG.microgiochi.guida.)
export default {
  titolo: 'Il Passaggiorgio',
  verbo: 'ACCHIAPPA!',      // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x3a3a8a,
  ospite: { id: 'giorgio', etichetta: 'STASERA GUIDA:\nGIORGIO' },
  comandi: [
    'Giorgio si infila nelle macchine degli altri: CLICCALO prima che chiuda!',
    'Quando è a terra TRASCINA LE CHIAVI fino a lui (tastiera: FRECCE, SPAZIO e INVIO)',
    'Occhio alle sagome di cartone e agli amici incappucciati!',
  ],
  comandiTouch: [
    'Giorgio si infila nelle macchine degli altri: TOCCALO prima che chiuda!',
    'Quando è a terra TRASCINA LE CHIAVI fino a lui: deve guidare lui!',
    'Occhio alle sagome di cartone e agli amici incappucciati!',
  ],
  obiettivo: 'Fallo guidare almeno 4 volte!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: 50 per guida + 10-15 per ogni volta che lo tiri fuori - 25 per passaggio scroccato.
  medaglie: { bronzo: 60, argento: 200, oro: 320 },   // (stima per 35 s)
  obiettivoGuidate: 4,
  // punti
  puntiFuori: 10,          // Giorgio tirato fuori da una macchina
  bonusUltimo: 5,          // ...se era già quasi dentro (oltre "quasiDentro" della finestra)
  quasiDentro: 0.66,
  puntiGuida: 50,          // Giorgio si siede al volante della sua A3
  malusPassaggio: 25,      // riesce a chiudere la portiera: passaggio scroccato (i punti non vanno sotto zero)
  malusSbagliato: 5,       // tirata fuori la persona sbagliata (l'amico incappucciato)
  bloccoVuoto: 0.85,        // secondi di mano ferma dopo un clic a vuoto
  // tempi
  scopertoInizio: 1.9,     // secondi che Giorgio resta a terra (le chiavi vanno portate prima)
  scopertoFine: 1.3,
  alVolante: 2.4,          // secondi al volante prima di scendere con una scusa
  rientro: 4,              // secondi prima che torni la macchina partita con Giorgio dentro
  raggioChiavi: 22,        // quanto vicino a Giorgio vanno lasciate le chiavi (unità)
  raggioDito: 6,           // col dito si prende un po' più largo
  // Fasi di difficoltà. "da" = secondo da cui vale la fase.
  //  vel = corsa di Giorgio (unità/s), finestra = secondi per tirarlo fuori, finta = probabilità che
  //  cambi macchina all'ultimo, insieme = portiere aperte insieme (le altre con la sagoma di cartone),
  //  travestimento = probabilità di cappuccio e occhiali (con un sosia incappucciato), bagagliaio = probabilità
  //  che si infili nel bagagliaio, pausa = [min,max] secondi prima della corsa successiva
  //  nome = l'annuncio (i tre atti)
  fasi: [
    { da: 0,  vel: 115, finestra: 1.0,  finta: 0.15, insieme: 1, travestimento: 0,    bagagliaio: 0,    pausa: [0.5, 0.8] },
    { da: 6,  vel: 135, finestra: 0.85, finta: 0.3,  insieme: 2, travestimento: 0,    bagagliaio: 0,    pausa: [0.4, 0.7] },
    { da: 12, nome: 'GIORGIO SI TRAVESTE!', vel: 150, finestra: 0.75, finta: 0.35, insieme: 2, travestimento: 0.35, bagagliaio: 0, pausa: [0.3, 0.6] },
    { da: 24, nome: 'ANCHE NEL BAGAGLIAIO!', vel: 175, finestra: 0.65, finta: 0.45, insieme: 3, travestimento: 0.3, bagagliaio: 0.35, pausa: [0.25, 0.5] },
    { da: 30, vel: 195, finestra: 0.55, finta: 0.5,  insieme: 3, travestimento: 0.25, bagagliaio: 0.4,  pausa: [0.2, 0.4] },
  ],
  scuse: ['Stasera bevo io!', "Ce l'ho dal meccanico", 'Tanto passi tu da casa mia', 'Non trovo le chiavi',
    'Mi si è scaricata', 'La mia consuma troppo', 'Guido al ritorno, giuro', 'Ho appena lavato i sedili', 'Non so dove parcheggiare'],
  frasiFuori: ['Ero quasi dentro!', 'Ma dai!', 'Ahia!', 'Uffa...', 'Che cattiveria!'],
  frasiVolante: ['Va bene, va bene...', 'E la benzina chi la paga?', 'Ma torniamo presto, eh'],
  frasiScende: ['Ho scordato il telefono!', 'Mi scappa!', 'Fa un rumore strano...', 'Torno subito!'],
  frasiAmici: ['Miracolo!', 'Fate una foto!', 'Grande Giorgio!', 'Non ci credo!'],
  frasiAutisti: ['Ma scendi!', 'Di nuovo?!', 'Fuori dalla mia macchina!', 'Ancora tu?!'],
  frasiSosia: ['Ehi, io pago la benzina!', 'Ma che fai?!', 'Non sono Giorgio!'],
  frasiCiao: ['Ciao ciao!', 'Grazie del passaggio!', 'Ci vediamo in disco!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { bloccoVuoto: 0.6, fasi: { vel: 0.85, finestra: 1.3 } },
    difficile: { bloccoVuoto: 1, fasi: { vel: 1.12, finestra: 0.82 } },
  },
};
