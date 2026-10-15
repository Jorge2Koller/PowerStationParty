// Configurazione del microgioco 'La pizza dal Boni' (id: pizza).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/PizzaScene.js; questa sezione arriva in CONFIG.microgiochi.pizza.)
export default {
  titolo: 'La pizza dal Boni',
  verbo: 'CONDISCI!',       // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0xc0392b,
  musica: 'osteria',
  ospite: { id: 'boni', etichetta: 'A CENA DAL:\nBONI' },
  cast: ['oli', 'sego'],    // gli imbucati: chi li sceglie qui gioca "contro se stesso"
  comandi: [
    'Leggi la pizza sul foglietto: poi si gira, va fatta A MEMORIA (TAB: la rivedi, ma niente bonus)',
    'SPAZIO tenuto: il pomodoro. Da 1 a 6 (o clic sulla ciotola, poi sulla pizza): un pezzo',
    'INVIO: PRONTA! Niente ananas. G: rimanda giù l\'imbucato che sbuca, prima che il Boni si giri',
  ],
  comandiTouch: [
    'Leggi la pizza sul foglietto: poi si gira, va fatta A MEMORIA (toccalo: la rivedi, ma niente bonus)',
    'Passa il dito in tondo sulla pasta: il pomodoro. Tocca la ciotola e poi la pizza: un pezzo',
    'Poi PRONTA! Niente ananas. Tocca l\'imbucato che sbuca, prima che il Boni si giri',
  ],
  obiettivo: 'Fai 3 pizze giuste senza far scoprire tutti e due!',
  // Medaglie (js/punteggi.js): la scala comune (bronzo 100, argento 200, oro 300). 3 pizze giuste
  // (l'obiettivo) sono il bronzo; ogni pizza giusta vale più della precedente.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoPizze: 3,
  // punti: la k-esima pizza giusta vale puntiPizza + crescitaPizza x (k - 1); più bonusRapido se
  // consegnata entro secondiRapido senza rivedere il foglietto; più la serie (pizze giuste di fila,
  // bonusSerie x (serie - 1)). Se il Boni li scopre tutti e due i punti si fermano a maxScoperti.
  // Così 2 pizze non arrivano mai a 100 (al massimo 77), 3 sì (almeno 105); 6 perfette fanno 315,
  // 7 fanno 392
  puntiPizza: 30,
  crescitaPizza: 5,
  bonusRapido: 5,
  secondiRapido: 6,
  bonusSerie: 2,
  maxScoperti: 90,
  // il pomodoro: la pizza è pronta se è coperto almeno questo (da 0 a 1); da tastiera, SPAZIO tenuto
  // lo stende in tanti secondi
  pomodoroMinimo: 0.7,
  pomodoroTasto: 1.1,
  // le pizze del menu: ingredienti e quanti pezzi (il pomodoro c'è sempre). Atto 1: due o tre
  // ingredienti, pochi pezzi; atto 2 e 3: quattro o cinque, con le quantità. L'ananas non c'è mai.
  menu: [
    [
      { nome: 'MARGHERITA', pezzi: { mozzarella: 3, basilico: 1 } },
      { nome: 'MARINARA', pezzi: { olive: 3, basilico: 2 } },
      { nome: 'BIANCA E SALAME', pezzi: { mozzarella: 2, salamino: 2 } },
      { nome: 'FUNGHETTO', pezzi: { funghi: 3, basilico: 1 } },
    ],
    [
      { nome: 'DIAVOLA', pezzi: { mozzarella: 3, salamino: 4, basilico: 1 } },
      { nome: 'CAPRICCIOSA', pezzi: { mozzarella: 2, funghi: 2, olive: 3, salamino: 2 } },
      { nome: 'BOSCAIOLA', pezzi: { funghi: 4, salamino: 3, mozzarella: 2 } },
      { nome: 'LA NUTRIZIONISTA', pezzi: { basilico: 3, funghi: 2, olive: 4 } },
      { nome: 'QUATTRO SALAMINI', pezzi: { salamino: 4, mozzarella: 1, olive: 2, basilico: 1 } },
    ],
  ],
  // i tre atti: da quando (secondi), annuncio, quale parte del menu, quanti secondi resta visibile
  // il foglietto, ogni quanti secondi sbuca un imbucato (o gli cade il travestimento: dal secondo
  // atto), quanti secondi per rimandarlo giù, tempo per ogni pizza (solo nel terzo: il Boni ha fretta)
  atti: [
    { da: 0, nome: 'LE PRIME PIZZE', menu: 0, foglietto: 3.2 },
    { da: 12, nome: 'GLI INVITATI ORDINANO', menu: 1, foglietto: 2, sbuca: [3.5, 5.5], avviso: 1.6 },
    { da: 24, nome: 'IL BONI HA FRETTA', menu: 1, foglietto: 0.8, sbuca: [3.5, 5], avviso: 1.4, tempo: 6.5 },
  ],
  sbirciata: 1.1,           // secondi che il foglietto resta girato quando lo si rivede
  // gli imbucati: dove si nascondono e come si travestono (il seme del round sceglie per ognuno
  // un nascondiglio o un travestimento, tutti diversi)
  nascondigli: ['tovaglia', 'botte', 'cesta', 'tenda', 'cappotti'],
  travestimenti: ['maschera', 'baffi', 'cuoco'],
  travestito: 0.45,         // quante volte su 1 un imbucato è travestito (se no è nascosto)
  frasiOrdine: ['UNA {pizza}!', 'ARRIVA UNA {pizza}!', '{pizza}, SUBITO!', 'MI FAI UNA {pizza}?'],
  frasiGiusta: ['Perfetta!', 'Questa è arte.', 'Equilibrata, bilanciata.', 'Da nutrizionista!', 'Che profumo!'],
  frasiSbagliata: ['MA CHE ROBA È?!', 'QUESTA NON È UNA PIZZA!', 'LA BUTTO!', 'SCHIFO!'],
  frasiAnanas: ['ANANAS?! SULLA PIZZA?!', 'L\'ANANAS NO! MAI!', 'MI VIENE MALE!'],
  frasiLento: ['TROPPO LENTO!', 'SI FREDDA TUTTO!'],
  frasiScoperto: ['{nome}?! E TE CHI T\'HA INVITATO?', '{nome}?! FUORI DI QUI!', 'MA GUARDA CHI C\'È: {nome}!'],
  frasiImbucato: ['Una fetta?', 'Ho fame...', 'Psst!', 'Ne avanza?'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { atti: { foglietto: 1.5, avviso: 1.3, tempo: 1.3 }, secondiRapido: 7.5, sbirciata: 1.5 },
    difficile: { atti: { foglietto: 0.7, avviso: 0.8, tempo: 0.85 }, secondiRapido: 5, sbirciata: 0.8 },
  },
};
