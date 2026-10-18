// Configurazione del microgioco 'Beer Pong al Pallaio' (id: beerpong).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/BeerpongScene.js; questa sezione arriva in CONFIG.microgiochi.beerpong.
// Il tiro, la sbronza, le gag e le reazioni sono in comune con la modalità BEER PONG: js/config/beerpong.js.)
export default {
  titolo: 'Beer Pong al Pallaio',
  verbo: 'TIRA!',           // il comando in una parola (schermata prima del microgioco)
  durata: 35,
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
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 70 / 110 / 170, con lo "zero" a 15). In 35 s si
  // fanno una decina di tiri: un bicchiere più di loro è il bronzo, otto tolti e tre persi
  // l'argento, il triangolo finito l'oro.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
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
    { da: 12, nome: 'SI BEVE!', ogni: 4, precisione: 0.36 },
    { da: 24, nome: 'ULTIMO GIRO!', ogni: 2.9, precisione: 0.44, disturbo: true },
  ],
  primoTiro: 2.6,           // secondi prima del primo tiro dei veterani
  bordoVeterani: 0.3,       // quanti dei loro tiri sbagliati prendono almeno il bordo (e poi escono)
  // anche i veterani bevono i bicchieri che gli centri: la loro precisione cala con la sbronza
  // (lucidi, allegri, brilli, sbronzi)
  caloVeterani: [1, 0.9, 0.72, 0.55],
  // il disturbo di Marsupino nell'ultimo atto: ogni quanti secondi, quanto fa sobbalzare la mira
  disturbo: { ogni: [3.6, 5.2], forza: 0.085, frasi: ['BUUURP!', 'Scusate, il würstel.', 'OOOH!', 'Attento che sbagli!', 'Hai una cosa sulla spalla!'] },
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
