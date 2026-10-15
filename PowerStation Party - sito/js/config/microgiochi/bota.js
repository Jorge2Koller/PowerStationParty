// Configurazione del microgioco "Spalma il Bota!" (id: bota): una giornata al lido in tre atti.
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/BotaScene.js; questa sezione arriva in CONFIG.microgiochi.bota.)
export default {
  titolo: 'Spalma il Bota!',
  verbo: 'SPALMA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x1fa8c9,
  ospite: { id: 'bota', etichetta: 'DA SPALMARE:\nIL BOTA' },
  comandi: [
    'TIENI PREMUTO e passa la mano: coprilo tutto di crema (non su occhi e bocca)',
    "Poi muovi l'OMBRELLONE: la sua ombra sulla MACCHIA DI SOLE",
    'Alla fine: crema sulle ZONE ROSSE, e un clic sui gabbiani che rubano la crema',
  ],
  comandiTouch: [
    'Tieni il dito sul Bota e passalo: coprilo tutto di crema (non su occhi e bocca)',
    "Poi trascina l'OMBRELLONE: la sua ombra sulla MACCHIA DI SOLE",
    'Alla fine: crema sulle ZONE ROSSE, e tocca i gabbiani che rubano la crema',
  ],
  obiettivo: 'Finisci con meno del 16% di pelle scottata!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 100 / 170 / 230), e il Bota è più difficile: il
  // tubetto finisce, si rigira, due zone alla volta. Poi ancora più difficile (l'utente: "ancora troppo
  // semplice"): si vince sotto il 16% (era il 20), il sole brucia e la crema finisce prima, più zone,
  // gabbiani e onde, il Bota si muove di più. Restare sotto il 16% è il bronzo; molto sotto (con
  // tutto il resto fatto bene) l'argento e l'oro.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  sogliaScottata: 16,     // % di pelle scottata: per vincere bisogna restare sotto (era 20; prima 18 e 15)
  // punti: la crema del primo atto (puntiCopertura per ogni % di pelle coperta), l'ombra del secondo
  // (puntiOmbra al secondo), ogni zona calda spenta e ogni gabbiano scacciato del terzo; e se finisci
  // sotto la soglia, bonusSano più puntiPelle per ogni punto sotto la soglia (chi si scotta non prende
  // niente). Prima: 0,8, 6, 10, e (40 - % scottata) x 2.
  puntiCopertura: 0.4,
  puntiOmbra: 3,
  puntiZona: 5,
  bonusSano: 50,
  puntiPelle: 10,
  // --- la crema (1 = una cella coperta per bene) ---
  strato: 1,              // quanta ne lascia la mano su ogni cella dove passa
  sogliaProtetta: 0.35,   // da qui in su la cella è protetta
  consumo: 0.17,          // quanta se ne consuma al secondo (da 1 a 0,35 ci vogliono 4 secondi; era 0,13)
  // il tubetto (revisione 4: era infinito, e il Bota troppo facile). pieno = quanta pelle copre un
  // tubetto pieno, partendo da pelle nuda (1 = tutto un lato); si ricarica da solo piano (ricarica al
  // secondo) e tutto d'un colpo quando scacci un gabbiano. Passare la mano dove la crema è ancora
  // fresca (da giaCoperta in su) la spreca: spreco = tubetto al secondo, con la mano tutta sul coperto
  tubetto: { pieno: 0.65, ricarica: 0.04, giaCoperta: 0.6, spreco: 0.18 },   // (erano 0,8, 0,05 e 0,14)
  raggioMano: 9,          // raggio della mano (unità del corpo: 1 unità = 2 px di gioco)
  sopraDito: 22,          // col dito la mano sta tante unità sopra il polpastrello (così si vede)
  // --- le zone calde ---
  primaZona: 1.2,         // secondi prima della prima
  ogniZonaInizio: 2.2,    // secondi tra una zona e l'altra, a inizio partita... (escono a coppie; erano 2,6 e 1,8)
  ogniZonaFine: 1.4,      //   ...e a fine partita
  zoneInsieme: 2,         // quante zone si accendono insieme (in due posti diversi)
  raggioZona: 15,         // raggio (unità del corpo) di una zona
  cresceZona: 0.8,        // secondi in cui una zona arriva alla sua grandezza
  durataZona: 5,          // secondi in cui una zona resta accesa (se non la spegni prima; era 6)
  tempoSpegni: 0.4,       // coperta tutta per tanti secondi di fila: spenta
  // --- il sole ---
  // (il sole brucia più in fretta: erano 3,4, 2,4, 60 e 5,5, poi nella revisione 4 2,7, 1,9, 48 e 4,4)
  secondiRossoInizio: 2.2, // dentro una zona calda: secondi perché una cella scoperta diventi rossa, a inizio...
  secondiRossoFine: 1.5,   //   ...e a fine partita
  secondiRossoFuori: 34,   // fuori dalle zone: il sole scotta, più piano
  rossa: 0.5,             // scottatura da cui la cella è "rossa" e non torna più bianca (1 = rosso aragosta)
  // i tre atti: da (secondi), annuncio, aiuto in basso, e cosa c'è: consumo della crema (x),
  // ombrellone, zone calde, gabbiani (il Bota si gira a pancia in giù all'inizio del terzo)
  atti: [
    { da: 0, nome: '', consumo: 0, aiuto: 'TIENI PREMUTO e passa la mano: coprilo tutto di crema!', aiutoDito: 'Passa il dito sul Bota: coprilo tutto di crema!' },
    { da: 12, nome: "L'OMBRELLONE!", ombrellone: true, aiuto: "Muovi l'ombrellone: la sua ombra sulla macchia di sole", aiutoDito: "Trascina l'ombrellone: la sua ombra sulla macchia di sole" },
    { da: 24, nome: 'GABBIANI E ONDE!', zone: true, gabbiani: true, aiuto: 'Crema sulle zone rosse! Clic sui gabbiani', aiutoDito: 'Crema sulle zone rosse! Tocca i gabbiani' },
  ],
  // l'ombrellone (secondo atto): raggio della sua ombra (unità di gioco), dove cade rispetto
  // all'ombrellone, quanto in fretta segue il puntatore; il vento: ogni quanti secondi, di quanto lo
  // sposta e per quanto
  ombrellone: { r: 34, dx: 14, dy: 16, segue: 7, vento: [2, 3.2], colpoVento: 56, tieneVento: 0.9 },   // (vento ogni 2,6-4 s e colpo 46, prima)
  // la macchia di sole: raggio (unità del corpo), da dove a dove scivola (x del corpo, dalla testa ai
  // piedi), quante volte va e torna in un atto, quanto ondeggia su e giù
  macchia: { r: 17, da: 30, a: 135, giri: 4, su: 14, ondeggia: 1.7, secondiRosso: 3.4 },   // (giri 3 e 4,4 s, prima)   // (secondiRosso: quanto ci mette a scottare una cella)
  // i gabbiani (terzo atto): il primo dopo tanti secondi, poi ogni tanti; quanto ci mettono a
  // rubare la crema (il tubetto: resta vuoto), velocità, raggio del clic che li scaccia (e il
  // tubetto si riempie), punti e secondi senza crema in mano (erano ogni 2,6-3,8 s)
  gabbiani: { primo: 1, ogni: [1.4, 2.2], tempo: 2, vel: 55, raggio: 16, punti: 3, senzaCrema: 1 },   // (ogni 1,8-2,8 s e 2,4 s, prima)
  // le onde: la prima dopo tanti secondi dall'inizio del terzo atto, poi ogni tanti (era una sola);
  // lavano la crema dalle celle oltre daX (le gambe)
  onda: { dopo: 3, ogni: 3.5, daX: 92, finoA: 300 },
  // nel terzo atto si rigira ogni tanti secondi (pancia in giù, pancia in su...): era una volta sola
  giraOgni: 4,             // (era 5)
  // --- il Bota che si muove ---
  // (si muove di più dalla revisione 4: erano 12, 4, 4,5, 2,5, 1,1 e scatti di 16 unità)
  ondaInizio: 4,          // quanto ondeggia sul telo (unità), a inizio e fine partita
  ondaFine: 18,
  primaMossa: 3,          // secondi prima del primo scatto (si stiracchia, prende il telefono o una birra)
  mossaInizio: 2.6,       // secondi tra uno scatto e l'altro, a inizio e fine partita (erano 3,2 e 1,8)
  mossaFine: 1.3,
  tieneMossa: 1.2,        // secondi che resta spostato
  scatto: 28,             // quanto si sposta (unità) quando si stiracchia (era 22)
  // --- errori ---
  stordito: 0.9,          // secondi di stop se la crema finisce su occhi o bocca
  velSussulto: 30,        // se il Bota si sposta più veloce di così (unità/s), quello che finisce sotto la
                          //   mano non è colpa di chi spalma
  // --- frasi del Bota ---
  frasi: ['Spalma bene eh!', 'Dai che mi scotto!', 'Non lasciarmi le righe!', 'Che caldo oggi!', 'Più su... no, più giù!'],
  frasiBrucia: ['Lì mi brucia!', 'Ahia, scotta!', 'Sento friggere!', 'Sto cuocendo!'],
  frasiBravo: ['Ahhh, che fresco!', 'Così sì!', 'Mani di fata!'],
  frasiGira: ['Fammi la schiena!'],
  frasiMuove: { telefono: ["Aspe', il telefono!", 'Un messaggino...'], birra: ['Una birretta!', 'Che sete!'] },
  frasiOcchi: ['NEGLI OCCHI NO!', 'BRUCIAAA!', 'MA DOVE SPALMI?!'],
  frasiOnda: ["L'acqua è gelata!", 'Mi ha tolto la crema!', 'Le gambe!'],
  frasiGiraDinuovo: ['Ora la pancia!', 'Mi giro, eh!', 'Di qua scotta!', 'Rigiro!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { secondiRossoInizio: 3.2, secondiRossoFine: 2.3, consumo: 0.12, ondaFine: 12, ombrellone: { colpoVento: 40, r: 39 }, gabbiani: { tempo: 2.7 }, tubetto: { pieno: 0.9, ricarica: 0.06, spreco: 0.1 } },
    difficile: { secondiRossoInizio: 1.9, secondiRossoFine: 1.3, consumo: 0.2, ondaFine: 21, ombrellone: { colpoVento: 66, r: 30 }, gabbiani: { tempo: 1.7 }, tubetto: { pieno: 0.55, ricarica: 0.035, spreco: 0.22 } },
  },
};
