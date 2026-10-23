// Configurazione del microgioco "Spalma il Bota!" (id: bota): il sole cuoce il Bota, tu spalmi.
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/BotaScene.js; questa sezione arriva in CONFIG.microgiochi.bota.)
// Rifatto da zero dopo la scheda di valutazione ("difficoltà impossibile, gioco incomprensibile: non
// hai mai la crema, l'ombrello non serve a nulla"): un gesto solo, strofinare la crema sui cerchi
// rossi; la crema non finisce mai. Via tubetto, ombrellone, macchia di sole, gabbiani e onde.
export default {
  titolo: 'Spalma il Bota!',
  verbo: 'SPALMA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x1fa8c9,
  musica: 'calypso',           // js/config/musiche.js
  ospite: { id: 'bota', etichetta: 'DA SPALMARE:\nIL BOTA' },
  comandi: [
    'Nascono CERCHI ROSSI: il sole scotta il Bota',
    'TIENI PREMUTO e strofina: coperto di crema, si spegne',
    "Prima che finisca l'anello! (FRECCE e SPAZIO)",
  ],
  comandiTouch: [
    'Nascono CERCHI ROSSI: il sole scotta il Bota',
    'Strofina il dito sul cerchio: coperto di crema, si spegne',
    "Prima che finisca l'anello, se no si scotta!",
  ],
  obiettivo: 'Spegni 15 scottature!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. stringi = gli elenchi a tempo i cui atti si stringono nei 15 secondi
  lampo: { obiettivo: 'Spegni 5 scottature!' },
  // Medaglie (js/punteggi.js): la scala comune (bronzo 100, argento 200, oro 300). L'obiettivo è il
  // bronzo: finché non hai spento obiettivoSpente scottature il totale si ferma a tettoPrima; quando
  // ci sei sale almeno al bronzo. Argento e oro vengono dai punti (velocità e serie).
  // (Prima: vincere voleva dire restare sotto il 16% di pelle scottata, coi punti di crema, ombra,
  // zone e gabbiani: la scheda la dava "impossibile".) Tarato coi giocatori simulati a NORMALE: chi
  // va piano ma strofina sui cerchi ne spegne 16-20 (bronzo, 130-155 punti), chi è svelto 23-24
  // (argento, circa 230), chi è velocissimo e non ne perde una 33-34 (oro, circa 385); chi strofina a
  // caso, o passa la mano su tutto il Bota senza guardare i cerchi, ne spegne da 0 a 9.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoSpente: 15,
  obiettivoLampo: 5,        // in Lampo (15 secondi): lì le medaglie non contano e i punti sono quelli e basta
  tettoPrima: 90,
  // --- punti ---
  // ogni scottatura spenta vale spenta, più presto se la spegni entro "presto" del suo tempo (0,5 =
  // prima di metà anello), per grande se è una grande, per il moltiplicatore della serie (spente di
  // fila: [quante, moltiplicatore]); ogni SCOTTATO toglie scottata (mai sotto zero) e azzera la serie
  punti: { spenta: 4, presto: 2, grande: 2, scottata: 3 },
  presto: 0.5,
  serie: [[5, 1.5], [10, 2]],

  // --- la mano e la crema (1 = una cella coperta) ---
  raggioMano: 9,            // raggio della mano (unità del corpo: 1 unità = 2 px di gioco)
  cremaPerUnita: 0.075,     // crema lasciata su ogni cella sotto la mano, per unità di strada fatta strofinando
  noce: 0.45,               // la noce di crema del primo tocco (un clic da fermo)
  velMax: 520,              // strofinare più veloce di così (unità al secondo) non spalma di più
  cremaMax: 1.25,
  coperta: 0.9,             // quanta pelle del cerchio deve avere la crema perché si spenga
  sciogli: 0.6,             // fuori dai cerchi la crema sparisce piano (al secondo)
  // tastiera: la mano si muove con le FRECCE (unità di gioco al secondo); con SPAZIO strofina da sola
  // facendo piccoli giri (raggio in unità di gioco, velocità in radianti al secondo)
  velTasti: 200,
  raggioGiri: 7,
  giriTasti: 22,

  // --- le scottature ---
  daX: 42,                  // nascono da qui in là (unità del corpo): dalle spalle ai piedi, mai in testa
  raggio: 12,               // raggio di un cerchio (unità del corpo)...
  raggioGrande: 16,         //   ...e di uno grande
  minCelle: 12,             // celle di pelle che deve avere almeno (così non nasce su un pezzetto di dito)
  minCelleGrande: 20,
  vitaGrande: 1.35,         // una grande dura di più (moltiplica la vita dell'atto)
  primaScottatura: 0.9,     // secondi prima della prima
  compare: 0.25,            // secondi in cui il cerchio si allarga
  // I tre atti: da = secondo d'inizio (daLampo: in Lampo, 15 secondi); attivi = quante scottature
  // accese insieme (appena una si spegne o si scotta ne nasce un'altra dopo pausa secondi); vita =
  // secondi prima che si scotti; grandi = quante su 1 nascono grandi; mosse = il Bota si muove;
  // gira = all'inizio si gira a pancia in giù
  atti: [
    { da: 0, daLampo: 0, nome: '', attivi: 1, vita: 4.5, pausa: 0.5, grandi: 0,
      aiuto: 'TIENI PREMUTO e strofina la mano sul cerchio rosso!', aiutoDito: 'Strofina il dito sul cerchio rosso!' },
    { da: 12, daLampo: 5, nome: 'PIÙ SOLE!', attivi: 2, vita: 4.2, pausa: 0.4, grandi: 0, mosse: true,
      aiuto: 'Due insieme, e il Bota si muove: seguilo!', aiutoDito: 'Due insieme, e il Bota si muove: seguilo!' },
    { da: 24, daLampo: 10, nome: 'SI GIRA!', attivi: 3, vita: 3.8, pausa: 0.3, grandi: 0.3, mosse: true, gira: true,
      aiuto: "Tre insieme: prima quella con l'anello più corto!", aiutoDito: "Tre insieme: prima quella con l'anello più corto!" },
  ],

  // --- il Bota che si muove (secondo e terzo atto) ---
  // si allunga a prendere il telefono o la birra, o si stiracchia: il primo scatto dopo primaMossa
  // secondi dall'inizio dell'atto, poi ogni ogniMossa; scatto = quanto si sposta (unità di gioco),
  // scattoIn = secondi per andare (e tornare), tieneMossa = secondi che resta spostato
  primaMossa: 1.2,
  ogniMossa: [2.6, 3.6],
  scatto: 26,
  scattoIn: 0.22,
  tieneMossa: 1.3,

  // --- frasi del Bota ---
  frasiInizio: ['Crema! Mi scotto!', 'Spalmami, dai!'],
  frasi: ['Spalma bene eh!', 'Che caldo oggi!', 'Più su... no, più giù!', 'Non lasciarmi le righe!'],
  frasiBrucia: ['Ahia, scotta!', 'Sento friggere!', 'Sto cuocendo!', 'Lì mi brucia!'],
  frasiBravo: ['Ahhh, che fresco!', 'Così sì!', 'Mani di fata!'],
  frasiGira: ['Fammi la schiena!', 'Mi giro, eh!'],
  frasiMuove: { telefono: ["Aspe', il telefono!", 'Un messaggino...'], birra: ['Una birretta!', 'Che sete!'] },

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  // (Nuovi col gioco rifatto. Facile: le scottature durano di più, la mano è più larga, il Bota si
  // sposta meno. Difficile: durano meno e ne nascono prima, il Bota si sposta di più e più spesso,
  // e per spegnerle va coperto un po' di più.)
  livelli: {
    facile: { atti: { vita: 1.35 }, scatto: 16, raggioMano: 10 },
    difficile: { atti: { vita: 0.8, pausa: 0.7 }, scatto: 34, ogniMossa: [2, 2.8], coperta: 0.93 },
  },
};
