// Configurazione del microgioco 'Petri Tentacolari' (id: piovra).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/PiovraScene.js; questa sezione arriva in CONFIG.microgiochi.piovra.)
export default {
  titolo: 'Petri Tentacolari',
  verbo: 'SALVALE!',        // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x7a2fa8,
  musica: 'disco',
  ospite: { id: 'petri', etichetta: 'OCCHIO A:\nIL PIOVRA' },
  comandi: [
    'Clicca una ragazza e TRASCINA: disegni la strada fino al tavolo delle amiche',
    'CLIC sui tentacoli del Petri: SCIAF! (tastiera: TAB ragazza, FRECCE, SPAZIO schiaffo)',
    'Aiuti (in basso o 1 e 2): BIRRA GRATIS (poi clicca dove lanciarla) e AMICO IN MEZZO',
  ],
  comandiTouch: [
    'Tocca una ragazza e TRASCINA: disegni la strada fino al tavolo delle amiche',
    'Tocca i tentacoli del Petri: SCIAF! Mollano la presa (anche con un altro dito)',
    'Aiuti in basso: BIRRA GRATIS (poi tocca dove lanciarla) e AMICO IN MEZZO',
  ],
  obiettivo: 'Fai scappare almeno 8 ragazze!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: 10 per ragazza salvata + la serie: dieci salvate (la vittoria) sono l'argento.
  medaglie: { bronzo: 60, argento: 150, oro: 250 },
  obiettivoSalvate: 8,
  // punti
  puntiSalvata: 10,
  bonusSerie: 5,           // fughe di fila senza nessuna agganciata nel frattempo: +5 alla seconda, +10 alla terza...
  maxBonusSerie: 20,
  malusAgganciata: 15,     // a fine partita, per ogni ragazza ancora agganciata (il totale non va sotto zero)
  // ragazze
  velSegue: 95,            // velocità lungo la strada disegnata (unità/s)
  velBalla: 22,            // mentre balla si sposta piano
  velTrascinata: 45,       // agganciata, il tentacolo la tira verso il Petri
  distanzaChiacchiera: 40, // ...fin qui
  // schiaffi
  raggioTentacolo: 5,      // quanto lontano dal tentacolo vale il colpo (unità, oltre al suo spessore)
  raggioDito: 4,           // col dito un po' di più
  // aiuti
  birra: { ricarica: 9, durata: 3, velPetri: 170 },   // (era lo shottino: stesso effetto, il Petri ci si fionda)
  // l'amico in mezzo: sempre O'Sfurnacchiat. Si mette davanti alla ragazza più in pericolo e la
  // segue (vel); i tentacoli che gli passano a meno di "raggio" sbattono, e non si possono prendere
  // né lei né chi gli sta a meno di "scudo"
  amico: { id: 'marco', ricarica: 11, durata: 4.5, raggio: 20, scudo: 34, vel: 120 },
  fraseAmico: 'Gnamo Petri, falla finita',
  versoPetri: 'Grrhhh...',          // il verso gutturale del Petri, prima del lamento
  lamentoPetri: 'Gnamooo DeLu',
  // Fasi di difficoltà. "da" = secondo da cui vale la fase.
  //  ogni = secondi tra una ragazza nuova e l'altra, max = ragazze in pista insieme, tentacoli = quanti ne usa,
  //  vel = velocità dei tentacoli (unità/s), portata = fin dove arrivano, petri = velocità con cui si sposta
  //  (0 = fermo), reazione = [min,max] secondi prima che un tentacolo libero punti qualcuno
  //  nome = l'annuncio (i tre atti)
  fasi: [
    { da: 0,  ogni: 2.6, max: 3, tentacoli: 2, vel: 70,  portata: 120, petri: 0,  reazione: [0.9, 1.6] },
    { da: 12, nome: 'IL PETRI SI MUOVE!', ogni: 2.2, max: 4, tentacoli: 3, vel: 85, portata: 140, petri: 14, reazione: [0.7, 1.3] },
    { da: 18, ogni: 2.0, max: 5, tentacoli: 4, vel: 100, portata: 160, petri: 20, reazione: [0.5, 1.1] },
    { da: 24, nome: 'TENTACOLI A SORPRESA!', ogni: 1.7, max: 6, tentacoli: 5, vel: 115, portata: 175, petri: 28, reazione: [0.4, 0.9] },
  ],
  // tentacolo a sorpresa (da sotto un tavolino o dalla consolle)
  sorpresaDa: 24,
  sorpresaOgni: [6, 8],
  velSorpresa: 150,
  frasiPetri: ['Ciao, vieni spesso qui?', 'Ti offro da bere?', 'Sai che faccio palestra?', 'Che segno sei?', 'Balli benissimo!', 'Ti posso dire una cosa?'],
  frasiRagazze: ['Aiuto!', 'Le mie amiche mi aspettano!', 'Ma quante mani hai?!', 'Ehm... devo andare', 'Lasciami!'],
  frasiSalva: ['Ciao ciao!', 'Salva!', 'Grazie!', 'Arrivo, ragazze!'],
  frasiSchiaffo: ['Ahia!', 'Era per salutare!', 'Che manesca!', 'Ma dai!'],
  frasiBirra: ['Birra gratis?! Arrivo!', 'Una birra! Mia!', 'Offre la casa?!'],
  frasiAmico: ['Ehi, io no!', 'Petri, calmati!', 'Giù le mani!', 'Fermo lì!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { velSegue: 110, fasi: { vel: 0.85, ogni: 1.15 }, amico: { ricarica: 9, durata: 5.5, scudo: 40 } },
    difficile: { velSegue: 85, fasi: { vel: 1.15, ogni: 0.88 }, amico: { ricarica: 13, durata: 3.5, scudo: 28 } },
  },
};
