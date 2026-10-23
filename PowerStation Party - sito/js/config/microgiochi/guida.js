// Configurazione del microgioco 'Il Passaggiorgio' (id: guida).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/GuidaScene.js; questa sezione arriva in CONFIG.microgiochi.guida.)
export default {
  titolo: 'Il Passaggiorgio',
  verbo: 'ACCHIAPPA!',      // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x3a3a8a,
  musica: 'parcheggio',           // js/config/musiche.js
  ospite: { id: 'giorgio', etichetta: 'STASERA GUIDA:\nGIORGIO' },
  comandi: [
    'Giorgio si infila nelle macchine degli altri: CLICCALO prima che chiuda!',
    'Quando è a terra TRASCINA LE CHIAVI fino a lui (tastiera: FRECCE, SPAZIO e INVIO)',
    'Più lo fai guidare, più diventa furbo. Se passa Emilio, fermalo o tiralo giù dalla macchina!',
  ],
  comandiTouch: [
    'Giorgio si infila nelle macchine degli altri: TOCCALO prima che chiuda!',
    'Quando è a terra TRASCINA LE CHIAVI fino a lui: deve guidare lui!',
    'Più lo fai guidare, più diventa furbo. Se passa Emilio, fermalo o tiralo giù dalla macchina!',
  ],
  obiettivo: 'Fallo guidare almeno 4 volte!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. stringi = gli elenchi a tempo i cui atti si stringono nei 15 secondi
  lampo: { obiettivoGuidate: 2, obiettivo: 'Fallo guidare almeno 2 volte!', stringi: ['atti'] },
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 70 / 160 / 240): ogni guidata vale 10 più della
  // precedente, così 4 guidate (l'obiettivo) sono il bronzo, 6 l'argento, 7 l'oro (il giocatore
  // automatico, che reagisce subito, ne fa 6-7). A caso e fermo: 0.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoGuidate: 4,
  // punti
  puntiFuori: 2,           // Giorgio tirato fuori da una macchina (era 10)
  bonusUltimo: 2,          // ...se era già quasi dentro (oltre "quasiDentro" della finestra) (era 5)
  quasiDentro: 0.66,
  puntiGuida: 10,          // Giorgio si siede al volante della sua A3 (la prima volta)...
  crescitaGuida: 10,       // ...e ogni volta dopo vale tanto di più: 10, 20, 30, 40... (era sempre 50)
  malusPassaggio: 10,      // riesce a chiudere la portiera: passaggio scroccato (i punti non vanno sotto zero) (era 25)
  malusSbagliato: 3,       // tirata fuori la persona sbagliata (l'amico incappucciato) (era 5)
  bloccoVuoto: 0.85,        // secondi di mano ferma dopo un clic a vuoto
  // la furbizia di Giorgio: sale di furbiziaSecondo al secondo, di furbiziaGuida ogni volta che
  // lo metti al volante e di furbiziaFuori ogni volta che lo tiri fuori (o lo fermi). Le fasi qui
  // sotto valgono da quella furbizia ("da"): chi è bravo se lo trova sempre più difficile
  furbiziaSecondo: 0.3,
  furbiziaGuida: 3,
  furbiziaFuori: 0.4,
  // Emilio che passa in macchina con Denny (nel secondo e nel terzo atto): Giorgio gli corre dietro
  emilio: {
    vel: 70,               // la macchina (unità/s)...
    ferma: [150, 330],     // ...che tra queste x va piano (aspetta Giorgio)...
    rallenta: 0.3,         // ...a tanto della sua velocità
    velGiorgio: 95,        // Giorgio che corre alla macchina (un po' più piano che verso le portiere: va fermato,
                           //   o tirato fuori mentre sale: la macchina lo aspetta quanto la finestra della fase)
    daQuando: 0.4,         // da tastiera: SPAZIO lo ferma solo da questo punto della corsa (prima è a vuoto)
    punti: 5,              // fermato (era 15)
    malus: 10,             // salito: passaggio scroccato (era 25)
    frasiVia: ['Peccato, Giorgio!', 'Ci vediamo in disco!', 'Ciao Giorgio!'],
  },
  fraseDenny: 'Giorgio, ci porta i mi babbo, gnamo monta!',
  // tempi
  scopertoInizio: 1.9,     // secondi che Giorgio resta a terra (le chiavi vanno portate prima)
  scopertoFine: 1.3,
  // (tempi dimezzati e più, dopo la revisione 4: prima il giro tra una guidata e l'altra durava
  // quasi 5 s, e 8 s quando la macchina partiva con lui dentro, senza niente da fare)
  alVolante: 1,            // secondi al volante prima di scendere con una scusa (era 2,4)
  rientro: 0.4,            // secondi prima che torni la macchina partita con Giorgio dentro (era 4)
  velVersoA3: 190,         // Giorgio che va alla sua A3 con le chiavi (era 120)
  raggioChiavi: 22,        // quanto vicino a Giorgio vanno lasciate le chiavi (unità)
  raggioDito: 6,           // col dito si prende un po' più largo
  // Le chiavi che Giorgio butta via quando scende dall'A3. Di solito tornano nell'angolo in basso
  // a destra, ma ogni tanto le lancia lontano, apposta, e vanno prese da dove sono cadute
  // (scheda di valutazione: "un po' monotono, magari le chiavi potrebbero essere lanciate in
  // luoghi diversi, magari non sempre sennò perdi troppo tempo"; prima tornavano sempre nell'angolo)
  chiaviLontane: {
    prob: 0.45,            // probabilità di lanciarle lontano...
    diFila: false,         // ...ma mai due volte di fila (così è al massimo una volta su due)
    distanza: [110, 270],  // quanto lontano dall'angolo (unità: lo schermo è largo 480)
    zona: { x: [150, 420], y: [224, 258] },   // dove possono cadere: in mezzo al parcheggio, sotto
                           //   la fila delle macchine (lì non coprono le portiere da cliccare)
    tetto: 0.25,           // di quelle volte, probabilità che restino sul tetto dell'A3
    piuTempo: 0.25,        // secondi in più a terra quando non sono nell'angolo (il tempo di trovarle:
                           //   così la difficoltà resta quella di prima)
    frasi: ['Così non le trovate!', 'Ops, mi son cadute!', 'Chiavi? Quali chiavi?', 'Andatele a prendere!'],
  },
  // Fasi di difficoltà. "da" = la furbizia da cui vale la fase (vedi sopra; una stella a fase).
  //  vel = corsa di Giorgio (unità/s), finestra = secondi per tirarlo fuori, finta = probabilità che
  //  cambi macchina all'ultimo, insieme = portiere aperte insieme (le altre con la sagoma di cartone),
  //  travestimento = probabilità di cappuccio e occhiali (con un sosia incappucciato: dal secondo
  //  atto), bagagliaio = probabilità che si infili nel bagagliaio (dal terzo atto), pausa = [min,max]
  //  secondi prima della corsa successiva
  fasi: [
    { da: 0,    vel: 115, finestra: 1.0,  finta: 0.12, insieme: 1, travestimento: 0.15, bagagliaio: 0.2,  pausa: [0.5, 0.8] },
    { da: 3,    vel: 130, finestra: 0.9,  finta: 0.25, insieme: 2, travestimento: 0.25, bagagliaio: 0.25, pausa: [0.4, 0.7] },
    { da: 6.5,  vel: 148, finestra: 0.78, finta: 0.33, insieme: 2, travestimento: 0.33, bagagliaio: 0.3,  pausa: [0.3, 0.6] },
    { da: 10,   vel: 168, finestra: 0.66, finta: 0.42, insieme: 3, travestimento: 0.33, bagagliaio: 0.35, pausa: [0.25, 0.5] },
    { da: 14,   vel: 188, finestra: 0.56, finta: 0.5,  insieme: 3, travestimento: 0.3,  bagagliaio: 0.4,  pausa: [0.2, 0.4] },
    { da: 19,   vel: 205, finestra: 0.5,  finta: 0.55, insieme: 3, travestimento: 0.3,  bagagliaio: 0.45, pausa: [0.15, 0.35] },
  ],
  // i tre atti (a tempo): l'annuncio, cosa si sblocca e quando passa Emilio (secondi dall'inizio dell'atto)
  atti: [
    { da: 0, nome: '' },
    { da: 12, nome: 'ARRIVA EMILIO!', travestimento: true, emilio: [1.2] },
    { da: 24, nome: 'ANCHE NEL BAGAGLIAIO!', travestimento: true, bagagliaio: true, emilio: [4.5] },
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
    facile: { bloccoVuoto: 0.6, fasi: { vel: 0.85, finestra: 1.3 }, furbiziaGuida: 2, emilio: { velGiorgio: 80 }, chiaviLontane: { prob: 0.3 } },
    difficile: { bloccoVuoto: 1, fasi: { vel: 1.12, finestra: 0.82 }, furbiziaGuida: 4, emilio: { velGiorgio: 110 }, chiaviLontane: { prob: 0.55, piuTempo: 0.15 } },
  },
};
