// Configurazione del microgioco 'La Spina del PowerStation' (id: spina).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/SpinaScene.js; questa sezione arriva in CONFIG.microgiochi.spina.)
export default {
  titolo: 'La Spina del PowerStation',
  verbo: 'SPILLA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0xb5651d,
  musica: 'bar',           // js/config/musiche.js
  ospite: { id: 'beppe', etichetta: 'CONTRO:\nBEPPE' },
  comandi: [
    'Tieni premuto SPAZIO per spillare',
    'Rilascia nella ZONA VERDE (al centro: PERFETTA!)',
    'Boccale e calice valgono di più: il calice è difficile',
    'Quando lo Zere suona la vuvuzela, la zona balla!',
  ],
  comandiTouch: [
    'Tieni il dito sullo schermo per spillare',
    'Alza il dito nella ZONA VERDE (al centro: PERFETTA!)',
    'Boccale e calice valgono di più: il calice è difficile',
    'Quando lo Zere suona la vuvuzela, la zona balla!',
  ],
  obiettivo: 'Fai più punti di Beppe!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 100 / 150 / 200, e si prendeva il bronzo anche
  // perdendo con Beppe). Ora il punteggio è la sfida con lui: a pari punti vale puntiPari (il
  // bronzo), poi si aggiunge quanto lo batti (o si toglie quanto ti batte). Beppe in 35 s fa da 20
  // a 25 pinte, dipende dalla sua giornata.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  puntiPari: 100,
  // i tre bicchieri: forma (largo, alto), ampiezza della zona verde (x), velocità (x) e punti
  // (i punti sono 3 volte quelli di prima: 5, 8, 9, la PERFETTA 3 e la pinta di Beppe 6)
  bicchieri: {
    pinta: { largo: 1, alto: 1, zona: 1, vel: 1, punti: 15 },
    boccale: { largo: 1.25, alto: 1.1, zona: 1.1, vel: 0.7, punti: 24 },  // grande: si riempie piano
    calice: { largo: 0.8, alto: 1.05, zona: 0.55, vel: 1.15, punti: 27 }, // zona strettissima: il rischio
  },
  perfetta: 0.18,      // PERFETTA se si rilascia entro questa frazione dal centro della zona verde (era 0.3)
  bonusPerfetta: 9,    // punti in più per una PERFETTA
  puntiBeppe: 18,      // punti che Beppe fa con ogni sua pinta
  // la giornata di Beppe (dal seme del round: uguale per tutti nel round, diversa tra un round e
  // l'altro): i suoi secondi per pinta si moltiplicano per un numero tra questi due...
  formaBeppe: [0.88, 1.12],
  variaBeppe: 0.12,    // ...e ogni pinta ci mette fino al 12% in più o in meno
  sbagliaBeppe: 0.07,  // probabilità che una pinta gli trabocchi (la butta: niente punti)
  penalita: 1.2,       // secondi persi per un bicchiere sbagliato
  // I tre atti, a fasi: ognuno più difficile di quello prima, a scalini che si sentono (scheda di
  // valutazione: "aumentare la difficoltà con le fasi"; prima la zona verde si stringeva e la birra
  // accelerava piano piano su tutta la partita, da 0.22 a 0.13 e da 0.85 a 1.1, e le fasi quasi non
  // si notavano). Per ogni atto: da quando (secondi; daLampo: in Lampo, dove la partita dura 15
  // secondi, un terzo del tempo l'uno come la musica, così anche lì si passa per tutte e tre le
  // fasi), annuncio e riga sotto, ampiezza della zona verde (frazione del bicchiere, per la pinta),
  // velocità della birra (bicchieri al secondo), dove sta la zona (il suo centro, tra questi due:
  // più in basso o più in alto, non sempre lì), secondi per pinta di Beppe, pausa dopo un bicchiere
  // buono, probabilità di calice e boccale, e se lo Zere suona la vuvuzela. Così, per una pinta, il tempo per rilasciare nella zona passa da 0,3 s
  // (primo atto) a 0,18 s (secondo) a 0,12 s (terzo, e intanto la vuvuzela: è come la fine della
  // partita di prima, ma ci si arriva a scalini e non per gradi).
  atti: [
    { da: 0, daLampo: 0, nome: 'SPILLA!', zona: 0.24, vel: 0.8, altezza: [0.66, 0.8], beppe: 1.6, pausa: 0.35, calice: 0, boccale: 0 },                    // (Beppe era 2.0, 1.8, 1.7)
    { da: 12, daLampo: 5, nome: 'ORA DI PUNTA!', sotto: 'Più veloce: arrivano boccali e calici!', zona: 0.18, vel: 1, altezza: [0.54, 0.84], beppe: 1.45, pausa: 0.25, calice: 0.22, boccale: 0.3 },
    { da: 24, daLampo: 10, nome: 'LO ZERE SI SCATENA!', sotto: 'Quando suona la vuvuzela la zona balla!', zona: 0.14, vel: 1.15, altezza: [0.54, 0.84], beppe: 1.35, pausa: 0.25, calice: 0.28, boccale: 0.3, vuvuzela: true },
  ],
  // Lo Zere e la sua vuvuzela BLU (scheda di valutazione: al posto di Beppe che urtava il bancone
  // nel terzo atto, che faceva ballare la zona verde per 1,2 s ogni 3,5 s circa). Lo Zere fa il tifo
  // in piedi a destra del bancone; nel terzo atto, ogni tanto, alza la vuvuzela, prende fiato
  // (il preavviso: si vede arrivare) e la suona: finché suona la zona verde balla su e giù e il
  // bicchiere ti trema in mano.
  vuvuzelaOgni: [2, 3],     // secondi tra la fine di una suonata e il preavviso della prossima (a caso tra questi due)
  primaVuvuzela: 1.2,       // secondi dall'inizio del terzo atto alla prima (dopo l'annuncio)
  preavviso: 0.55,          // secondi in cui alza la vuvuzela e prende fiato
  suonata: 1.3,             // secondi della suonata (il suono, in js/audio.js, dura uguale)
  ballaZona: 0.09,          // di quanto si sposta la zona verde mentre suona (frazione del bicchiere; era 0.08)
  frasiBeppe: ['Tsk.', 'Lento...', 'Mah.', 'Dilettante.', 'Guagliò...'],
  frasiBeppeZere: ['Bravo Zere!', 'Hehe.', 'Suona, suona!', 'Ancora!'],   // Beppe, quando lo Zere suona
  frasiZere: ['Forza!', 'Grande!', 'Vaiii!', 'Uè!'],                     // lo Zere, quando fa il tifo
  frasiClienti: ['Uè!', 'Ma dai!', "Un'altra!", 'Eh, oh!', 'Grande!', 'Mamma mia!', 'Offro io!', 'Ma che dici?!', 'Salute!', 'Cin cin!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  // (Prima cambiavano zonaInizio / zonaFine e velInizio / velFine: facile 0.28 / 0.18 e 0.75 / 0.95,
  // difficile 0.18 / 0.1 e 0.95 / 1.25; qui sono gli stessi scarti, atto per atto.)
  livelli: {
    facile: { atti: { zona: 1.3, vel: 0.88 }, perfetta: 0.26, vuvuzelaOgni: [3, 4.2], ballaZona: 0.06, formaBeppe: [1, 1.22] },
    difficile: { atti: { zona: 0.8, vel: 1.13 }, perfetta: 0.13, vuvuzelaOgni: [1.4, 2.2], ballaZona: 0.11, formaBeppe: [0.82, 1] },
  },
};
