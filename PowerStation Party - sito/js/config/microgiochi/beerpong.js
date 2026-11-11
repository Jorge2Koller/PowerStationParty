// Configurazione del microgioco 'Beer Pong al Pallaio' (id: beerpong).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/BeerpongScene.js; questa sezione arriva in CONFIG.microgiochi.beerpong.
// Il tiro, la sbronza, le gag e le reazioni sono in comune con la modalità BEER PONG: js/config/beerpong.js.)
export default {
  titolo: 'Beer Pong al Pallaio',
  verbo: 'TIRA!',           // il comando in una parola (schermata prima del microgioco)
  durata: 50,               // (scheda 2: "troppo corto": era 35)
  colore: 0x2f8f6a,
  musica: 'pallaio',           // js/config/musiche.js
  // i veterani del Pallaio: lo Zio e Marsupino, mossi dal computer
  ospite: { id: 'zio', etichetta: 'CONTRO:\nI VETERANI' },
  cast: ['marsupino'],      // altri personaggi della storia: chi li sceglie qui gioca "contro se stesso"
  veterani: ['zio', 'marsupino'],
  comandi: [
    'MOUSE: tira indietro e lascia (o FRECCE + SPAZIO tenuto)',
    'Verso = mira, lunghezza = forza. Di RIMBALZO vale doppio',
    'Ogni bicchiere che ti centrano lo bevi: più bevi, peggio miri!',
  ],
  comandiTouch: [
    'Una fiondata col dito verso i bicchieri, poi alza il dito',
    'Verso = mira, lunghezza = forza. Di RIMBALZO vale doppio',
    'Ogni bicchiere che ti centrano lo bevi: più bevi, peggio miri!',
  ],
  obiettivo: 'Togli più bicchieri di quanti te ne tolgono!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. stringi = gli elenchi a tempo i cui atti si stringono nei 15 secondi
  lampo: { stringi: ['atti'] },
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 70 / 110 / 170, con lo "zero" a 15). In 35 s si
  // fanno una decina di tiri: un bicchiere più di loro è il bronzo, otto tolti e tre persi
  // l'argento, il triangolo finito l'oro.
  medaglie: { bronzo: 130, argento: 260, oro: 390 },   // (con 50 secondi invece di 35: erano 100, 200, 300)
  // punti: si parte da puntiPari (la partita pari); ogni bicchiere tolto aggiunge, ogni bicchiere
  // perso toglie puntiPerso (prima erano 10 a bicchiere e 5 per ogni tuo bicchiere ancora in piedi)
  puntiPari: 80,
  puntiCentro: 20,          // un bicchiere centrato
  puntiRimbalzo: 40,        // ...centrato dopo un rimbalzo sul tavolo
  bonusFiamme: 10,          // in più per ogni centro quando si è "IN FIAMME!" (dal secondo di fila)
  bonusTriangolo: 40,       // per ogni triangolo finito
  puntiPerso: 20,           // per ogni tuo bicchiere che centrano i veterani
  // bicchieri
  bicchieriVeterani: 10,    // il primo triangolo dei veterani
  bicchieriDopo: 6,         // finito quello, ne rimettono uno così
  bicchieriMiei: 6,         // i tuoi: se li perdi tutti, finisce prima
  // i tre atti: da quando (secondi), annuncio, ogni quanti secondi tirano i veterani e quante volte
  // centrano (0..1); nell'ultimo Marsupino disturba
  atti: [
    { da: 0, nome: 'RISCALDAMENTO!', ogni: 5, precisione: 0.25 },
    { da: 17, nome: 'SI BEVE!', ogni: 4, precisione: 0.36 },
    { da: 34, nome: 'ULTIMO GIRO!', ogni: 2.9, precisione: 0.44, disturbo: true },
  ],
  primoTiro: 2.6,           // secondi prima del primo tiro dei veterani
  bordoVeterani: 0.3,       // quanti dei loro tiri sbagliati prendono almeno il bordo (e poi escono)
  // anche i veterani bevono i bicchieri che gli centri: la loro precisione cala con la sbronza
  // (lucidi, allegri, brilli, sbronzi)
  caloVeterani: [1, 0.9, 0.72, 0.55],
  // il disturbo di Marsupino nell'ultimo atto: ogni quanti secondi, quanto fa sobbalzare la mira
  disturbo: { ogni: [3.6, 5.2], forza: 0.085, frasi: ['BUUURP!', 'Scusate, il würstel.', 'OOOH!', 'Attento che sbagli!', 'Hai una cosa sulla spalla!'] },
  // Lo schiaffo: quando Marsupino sbaglia un tiro se la prende con Greg, che gli sta accanto in
  // fondo al tavolo (scheda di valutazione: "quando Marsupino sbaglia, deve dare uno schiaffo a
  // Greg"; prima Greg non c'era). È solo di contorno, non cambia la partita: js/beerpong/schiaffo.js
  schiaffo: {
    chi: 'marsupino', a: 'greg',  // chi lo dà e chi lo prende
    probabilita: 1,         // tra i tiri sbagliati di Marsupino, quanti finiscono in schiaffo (1 = tutti)
    distanza: 60,           // quanto sta lontano Greg da Marsupino (unità)
    manoScala: 0.68,        // quanto è grande la manata
    // i tempi in millisecondi: la mano che si alza, il colpo, la mano ferma sulla guancia, la mano
    // che torna, quando Greg si riprende (dall'inizio del colpo) e quanto girano le stelline
    tempi: { carica: 200, colpo: 90, fermo: 90, ritorno: 220, riprende: 1300, stordito: 1100 },
    scritte: ['SCIAF!', 'SCIAFF!', 'PAF!'],
    parlaMarsupino: 0.4,    // quante volte Marsupino dà la colpa a Greg...
    parlaGreg: 0.35,        // ...e quante volte Greg protesta (il resto, zitti tutti e due)
    frasiMarsupino: ['Colpa tua, Greg!', 'Mi hai mosso il braccio!', 'Non guardarmi quando tiro!', 'Porti sfiga, Greg!', 'Era per la mira.'],
    frasiGreg: ['Ahia!', 'Ma io che c\'entro?!', 'Sempre a me!', 'Ohi! La faccia!', 'Prenditela col tavolo!'],
  },
  sbronzaPeso: 1,           // quanto pesa la sbronza sulla mira (1 = come in js/config/beerpong.js)
  frasiVittoria: ['Ai miei tempi si mirava meglio.', 'Rivincita. Subito.', 'Ha avuto fortuna, il ragazzo.'],
  frasiSconfitta: ['Esperienza, ragazzo.', 'Offri tu, vero?', 'Trent\'anni di Pallaio.'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  // (Il livello cambia anche il tiro di chi gioca: vedi "livelli" in js/config/beerpong.js.)
  livelli: {
    facile: { atti: { ogni: 1.3, precisione: 0.7 }, sbronzaPeso: 0.6 },
    difficile: { atti: { ogni: 0.8, precisione: 1.3 }, sbronzaPeso: 1.4 },
  },
};
