// Configurazione del microgioco "Spalma il Bota!" (id: bota): insegui le zone calde con la crema.
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/BotaScene.js; questa sezione arriva in CONFIG.microgiochi.bota.)
export default {
  titolo: 'Spalma il Bota!',
  verbo: 'SPALMA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x1fa8c9,
  ospite: { id: 'bota', etichetta: 'DA SPALMARE:\nIL BOTA' },
  comandi: [
    'TIENI PREMUTO e passa la mano sul Bota: spalmi la crema',
    'Insegui le ZONE ROSSE: coprile prima che si scottino',
    'La crema dura poco. Niente crema su occhi e bocca',
  ],
  comandiTouch: [
    'Tieni il dito sul Bota e passalo: spalmi la crema',
    'Insegui le ZONE ROSSE: coprile prima che si scottino',
    'La crema dura poco. Niente crema su occhi e bocca',
  ],
  obiettivo: 'Finisci con meno del 15% di pelle scottata!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // (un giocatore automatico bravo fa 230-260: 17-18 zone spente, 8-12% scottata; chi sta fermo 0)
  medaglie: { bronzo: 80, argento: 150, oro: 230 },
  sogliaScottata: 15,     // % di pelle scottata: per vincere bisogna restare sotto
  // punti: ogni zona calda spenta, più la pelle sana alla fine: (pelleSana - % scottata) x puntiPelle
  // (sotto zero non va: chi sta fermo si scotta più del 40% e non prende niente)
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
  giraA: 0.5,             // a questo punto della partita (0..1) il Bota si gira a pancia in giù
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
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { secondiRossoInizio: 4.3, secondiRossoFine: 3.2, consumo: 0.1, ondaFine: 9 },
    difficile: { secondiRossoInizio: 2.9, secondiRossoFine: 2, consumo: 0.16, ondaFine: 15 },
  },
};
