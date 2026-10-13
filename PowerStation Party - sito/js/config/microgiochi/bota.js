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
  obiettivo: 'Finisci con meno del 18% di pelle scottata!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // (ritarate col giocatore automatico: bravo circa 200, a caso 30-50, fermo 0. Vedi note/fase-c.md)
  medaglie: { bronzo: 100, argento: 170, oro: 230 },
  sogliaScottata: 18,     // % di pelle scottata: per vincere bisogna restare sotto (era 15: ora ci sono tre atti)
  // punti: la crema del primo atto (puntiCopertura per ogni % di pelle coperta), l'ombra del secondo
  // (puntiOmbra al secondo), ogni zona calda spenta e ogni gabbiano scacciato del terzo, più la pelle
  // sana alla fine: (pelleSana - % scottata) x puntiPelle (chi sta fermo si scotta e non prende niente)
  puntiCopertura: 0.8,
  puntiOmbra: 6,
  puntiZona: 10,
  pelleSana: 40,
  puntiPelle: 2,
  // --- la crema (1 = una cella coperta per bene) ---
  strato: 1,              // quanta ne lascia la mano su ogni cella dove passa
  sogliaProtetta: 0.35,   // da qui in su la cella è protetta
  consumo: 0.13,          // quanta se ne consuma al secondo (da 1 a 0,35 ci vogliono 5 secondi)
  raggioMano: 9,          // raggio della mano (unità del corpo: 1 unità = 2 px di gioco)
  sopraDito: 22,          // col dito la mano sta tante unità sopra il polpastrello (così si vede)
  // --- le zone calde ---
  primaZona: 1.2,         // secondi prima della prima
  ogniZonaInizio: 2.3,    // secondi tra una zona e l'altra, a inizio partita...
  ogniZonaFine: 1.1,      //   ...e a fine partita
  raggioZona: 15,         // raggio (unità del corpo) di una zona
  cresceZona: 0.8,        // secondi in cui una zona arriva alla sua grandezza
  durataZona: 6,          // secondi in cui una zona resta accesa (se non la spegni prima)
  tempoSpegni: 0.4,       // coperta tutta per tanti secondi di fila: spenta
  // --- il sole ---
  secondiRossoInizio: 3.4, // dentro una zona calda: secondi perché una cella scoperta diventi rossa, a inizio...
  secondiRossoFine: 2.4,   //   ...e a fine partita
  secondiRossoFuori: 60,   // fuori dalle zone: il sole scotta, ma molto piano
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
  ombrellone: { r: 34, dx: 14, dy: 16, segue: 7, vento: [2.6, 4], colpoVento: 46, tieneVento: 0.9 },
  // la macchia di sole: raggio (unità del corpo), da dove a dove scivola (x del corpo, dalla testa ai
  // piedi), quante volte va e torna in un atto, quanto ondeggia su e giù
  macchia: { r: 17, da: 30, a: 135, giri: 3, su: 14, ondeggia: 1.7, secondiRosso: 5.5 },   // (secondiRosso: quanto ci mette a scottare una cella)
  // i gabbiani (terzo atto): il primo dopo tanti secondi, poi ogni tanti; quanto ci mettono a
  // rubare la crema, velocità, raggio del clic che li scaccia, punti e secondi senza crema
  gabbiani: { primo: 1.5, ogni: [2.6, 3.8], tempo: 2.4, vel: 55, raggio: 16, punti: 5, senzaCrema: 2.5 },
  // l'onda: dopo tanti secondi dall'inizio del terzo atto; lava la crema dalle celle oltre daX (le gambe)
  onda: { dopo: 5.5, daX: 92, finoA: 300 },
  // --- il Bota che si muove ---
  ondaInizio: 4,          // quanto ondeggia sul telo (unità), a inizio e fine partita
  ondaFine: 12,
  primaMossa: 4,          // secondi prima del primo scatto (si stiracchia, prende il telefono o una birra)
  mossaInizio: 4.5,       // secondi tra uno scatto e l'altro, a inizio e fine partita
  mossaFine: 2.5,
  tieneMossa: 1.1,        // secondi che resta spostato
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
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { secondiRossoInizio: 4.3, secondiRossoFine: 3.2, consumo: 0.1, ondaFine: 9, ombrellone: { colpoVento: 32, r: 39 }, gabbiani: { tempo: 3.1 } },
    difficile: { secondiRossoInizio: 2.9, secondiRossoFine: 2, consumo: 0.16, ondaFine: 15, ombrellone: { colpoVento: 60, r: 30 }, gabbiani: { tempo: 1.9 } },
  },
};
