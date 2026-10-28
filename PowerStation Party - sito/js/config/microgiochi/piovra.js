// Configurazione del microgioco 'Petri Tentacolari' (id: piovra).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/PiovraScene.js; questa sezione arriva in CONFIG.microgiochi.piovra.)
export default {
  titolo: 'Petri Tentacolari',
  verbo: 'SALVALE!',        // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x7a2fa8,
  musica: 'disco',           // js/config/musiche.js
  ospite: { id: 'petri', etichetta: 'OCCHIO A:\nIL PIOVRA' },
  comandi: [
    'Clicca una ragazza e TRASCINA: disegni la strada fino al tavolo delle amiche',
    'CLIC sui tentacoli del Petri: SCIAF! (tastiera: TAB ragazza, FRECCE, SPAZIO schiaffo)',
    'Aiuti (in basso o 1 e 2): BIRRA GRATIS (poi clicca dove lanciarla) e L\'AMICO, che blocca il Petri per 3 secondi',
  ],
  comandiTouch: [
    'Tocca una ragazza e TRASCINA: disegni la strada fino al tavolo delle amiche',
    'Tocca i tentacoli del Petri: SCIAF! Mollano la presa (anche con un altro dito)',
    'Aiuti in basso: BIRRA GRATIS (poi tocca dove lanciarla) e L\'AMICO, che blocca il Petri per 3 secondi',
  ],
  obiettivo: 'Fai scappare almeno 8 ragazze!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. stringi = gli elenchi a tempo i cui atti si stringono nei 15 secondi
  lampo: { obiettivoSalvate: 3, obiettivo: 'Fai scappare almeno 3 ragazze!', stringi: ['fasi'], sorpresaDa: 10.3 },
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 60 / 150 / 250): 8 salvate, l'obiettivo, sono il bronzo.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoSalvate: 8,
  // punti
  // (revisione 4) ogni ragazza salvata vale più della precedente: la prima puntiSalvata, la seconda il
  // doppio... (2,5 x quante ne hai salvate, arrotondato: 3, 5, 8, 10, 13...). Così l'obiettivo, 8
  // ragazze, fa circa 100 (il bronzo), e chi ne salva il doppio vola. Prima ognuna valeva 10.
  // (scheda di valutazione: "se salvi 8 ragazze perdi comunque". Con 2,5 le prime 8 facevano 92 punti,
  // sotto il bronzo; con 2,8 fanno 101: 8 salvate bastano, come dice l'obiettivo)
  puntiSalvata: 2.8,
  bonusSerie: 2,           // fughe di fila senza nessuna agganciata nel frattempo: +2 alla seconda, +4 alla terza... (erano 5)
  maxBonusSerie: 8,        // (era 20)
  malusAgganciata: 10,     // a fine partita, per ogni ragazza ancora agganciata (il totale non va sotto zero) (era 15)
  // ragazze
  velSegue: 95,            // velocità lungo la strada disegnata (unità/s)
  velBalla: 22,            // mentre balla si sposta piano
  velTrascinata: 45,       // agganciata, il tentacolo la tira verso il Petri
  distanzaChiacchiera: 40, // ...fin qui
  // schiaffi
  raggioTentacolo: 8,      // quanto lontano dal tentacolo vale il colpo (unità, oltre al suo spessore) (era 5: dal PC si mancava)
  velPC: 0.88,             // dal computer (mouse o trackpad) i tentacoli vanno un po' più piano: era più difficile che col dito
  raggioDito: 4,           // col dito un po' di più
  // aiuti
  birra: { ricarica: 9, durata: 3, velPetri: 170 },   // (era lo shottino: stesso effetto, il Petri ci si fionda)
  // l'amico: sempre O'Sfurnacchiat. Arriva davanti al Petri e lo sgrida: per "durata" secondi il Petri
  // resta mortificato e fermo, senza tentacoli nuovi, ma le ragazze già prese restano prese (vanno
  // liberate a schiaffi). (Scheda 2: "il Delu è troppo utile, deve immobilizzarlo solo per 3 secondi
  // ma non garantire il passaggio sicuro delle ragazze": prima le mollava tutte, con la ricarica a 13.
  // Ora che aiuta meno la ricarica è più corta)
  amico: { id: 'marco', ricarica: 10, durata: 3 },
  fraseAmico: 'Gnamo Petri, falla finita',
  versoPetri: 'Grrhhh...',          // il verso gutturale del Petri, prima del lamento
  lamentoPetri: 'Gnamooo DeLu',
  // Fasi di difficoltà. "da" = secondo da cui vale la fase.
  //  ogni = secondi tra una ragazza nuova e l'altra, max = ragazze in pista insieme, tentacoli = quanti ne usa,
  //  vel = velocità dei tentacoli (unità/s), portata = fin dove arrivano, petri = velocità con cui si sposta
  //  (0 = fermo), reazione = [min,max] secondi prima che un tentacolo libero punti qualcuno
  //  nome = l'annuncio (i tre atti)
  // (scheda 2: "troppo difficile": i tentacoli un po' più lenti, erano 70, 85, 100, 115)
  fasi: [
    { da: 0,  ogni: 2.6, max: 3, tentacoli: 2, vel: 63,  portata: 120, petri: 0,  reazione: [0.9, 1.6] },
    { da: 12, nome: 'IL PETRI SI MUOVE!', ogni: 2.2, max: 4, tentacoli: 3, vel: 77, portata: 140, petri: 14, reazione: [0.7, 1.3] },
    { da: 18, ogni: 2.0, max: 5, tentacoli: 4, vel: 90, portata: 160, petri: 20, reazione: [0.5, 1.1] },
    { da: 24, nome: 'TENTACOLI A SORPRESA!', ogni: 1.7, max: 6, tentacoli: 5, vel: 104, portata: 175, petri: 28, reazione: [0.4, 0.9] },
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
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { velSegue: 110, fasi: { vel: 0.85, ogni: 1.15 }, amico: { ricarica: 8, durata: 3.5 } },
    difficile: { velSegue: 85, fasi: { vel: 1.15, ogni: 0.88 }, amico: { ricarica: 12, durata: 2.5 } },
  },
};
