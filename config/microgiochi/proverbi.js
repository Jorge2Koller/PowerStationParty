// Configurazione del microgioco 'Le Perle di Denny' (id: proverbi).
// Durata, comandi, obiettivo, punti, difficoltà, frasi e i proverbi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/ProverbiScene.js; questa sezione arriva in CONFIG.microgiochi.proverbi.)
export default {
  titolo: 'Le Perle di Denny',
  verbo: 'CORREGGI!',       // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x2f6f8f,
  musica: 'quiz',           // js/config/musiche.js
  // Denny è Pastaffi, il figlio di Emilio: chi sceglie Pastaffi qui gioca "contro se stesso"
  ospite: { id: 'pastaffi', etichetta: 'LE PERLE DI:\nDENNY' },
  comandi: [
    'Denny dice un proverbio con una parola sbagliata',
    'Scrivi quella GIUSTA e premi INVIO: niente clic',
    'Prima è sottolineata, poi trovala tu. Le PERLE: doppio!',
  ],
  comandiTouch: [
    'Denny dice un proverbio con una parola sbagliata',
    'Tocca SCRIVI, scrivi quella GIUSTA e premi Invio (o OK)',
    'Prima è sottolineata, poi trovala tu. Le PERLE: doppio!',
  ],
  obiettivo: 'Correggi almeno 6 proverbi!',
  // Medaglie (js/punteggi.js): la scala comune (bronzo 100, argento 200, oro 300). 6 proverbi giusti
  // (l'obiettivo) sono il bronzo: fino a 5 il totale si ferma a tettoPrima, il sesto lo porta almeno
  // al bronzo, e da lì non si scende più sotto.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoProverbi: 6,
  obiettivoLampo: 3,        // in Lampo (15 secondi) bastano 3 proverbi giusti; lì le medaglie non contano
  tettoPrima: 90,

  // --- punti ---
  // un proverbio giusto vale punti (+ bonusVeloce se in meno di secondiVeloce), per il moltiplicatore
  // della serie, per 2 se è una perla; ogni tentativo sbagliato toglie sbaglio punti (mai sotto zero)
  punti: 10,
  bonusVeloce: 5,
  secondiVeloce: 3,
  serie: [[3, 1.5], [5, 2]],   // [dopo quanti giusti di fila, moltiplicatore]: un errore o un tempo scaduto la azzerano
  perla: 2,
  sbaglio: 2,

  // --- la risposta ---
  // si ignorano maiuscole, spazi prima e dopo, accenti e apostrofi; dalle parole di
  // lunghezzaTolleranza lettere in su si accettano "tolleranza" errori di battitura (distanza di
  // Levenshtein). La parola sbagliata di Denny non vale mai.
  tolleranza: 1,
  lunghezzaTolleranza: 5,
  pausaGiusto: 1.0,         // secondi: la correzione nel fumetto, poi arriva il proverbio dopo
  pausaScaduto: 2.0,        // secondi: la "verità definitiva" e il proverbio giusto, a tempo scaduto

  // I tre atti: da = secondo d'inizio; tempo = secondi per ogni proverbio; sottolinea = la parola
  // sbagliata è sottolineata; leggibile = dopo quanti secondi il fumetto sbiadisce (resta la casella);
  // svelto = Denny parla in fretta (le parole arrivano una dopo l'altra, veloci)
  atti: [
    { da: 0, nome: 'LE PERLE DI DENNY', sottolinea: true, tempo: 10 },
    { da: 12, nome: 'TROVALA TU!', sottolinea: false, tempo: 8 },
    { da: 24, nome: 'DENNY SI SCATENA!', sottolinea: false, tempo: 6, leggibile: 2.5, svelto: true },
  ],
  sottolineaSempre: false,  // (Facile) sottolineata in tutti gli atti
  sottolineaMai: false,     // (Difficile) mai sottolineata, nemmeno nel primo atto
  suggerimento: false,      // (Facile) la prima lettera in grigio nella casella

  // --- le frasi di Denny ---
  frasiOffeso: ['Eh, è uguale!', "L'ho detto apposta.", 'Si dice in tutti e due i modi.', 'Mia nonna lo diceva così.', 'Vabbè, era per vedere se stavi attento.'],
  frasiGongola: ['Visto? Avevo ragione io!', 'Te l\'avevo detto!', 'Ascolta chi ne sa.', 'Eh no, caro mio.'],
  frasiVerita: ['È la verità definitiva.', 'Non si discute.', 'Scritto nella pietra.', 'Lo dice anche il babbo.'],
  fraseResa: 'Va bene, va bene... chi va piano va sano e va lontra.',
  frasiSedia: ['E ricordatevi:', 'Ascoltate tutti:', 'Parola di Denny:'],

  // --- i proverbi ---
  // Ogni voce: il proverbio giusto, con tra [quadre] la parola da scrivere (quella che Denny
  // sbaglia); dice = la parola sbagliata che dice lui; perla: true se è un suo sbaglio vero
  // (vale doppio). Per aggiungerne uno basta una riga.
  proverbi: [
    { proverbio: 'Ambasciator non porta [pena]', dice: 'pane', perla: true },
    { proverbio: 'Chi dorme non piglia [pesci]', dice: 'pesche' },
    { proverbio: "Il mattino ha l'[oro] in bocca", dice: 'orso' },
    { proverbio: 'Can che abbaia non [morde]', dice: 'morte' },
    { proverbio: 'A caval donato non si guarda in [bocca]', dice: 'borsa' },
    { proverbio: "Tra il dire e il fare c'è di mezzo il [mare]", dice: 'marito' },
    { proverbio: "L'erba del vicino è sempre più [verde]", dice: 'verdura' },
    { proverbio: 'Chi va piano va sano e va [lontano]', dice: 'lontra' },
    { proverbio: 'Non tutte le ciambelle riescono col [buco]', dice: 'bucato' },
    { proverbio: 'Chi semina vento raccoglie [tempesta]', dice: 'tempera' },
    { proverbio: 'Rosso di sera bel tempo si [spera]', dice: 'pera' },
    { proverbio: 'Una mela al giorno toglie il medico di [torno]', dice: 'torta' },
    { proverbio: 'Chi trova un amico trova un [tesoro]', dice: 'toro' },
    { proverbio: 'Meglio un uovo oggi che una [gallina] domani', dice: 'galleria' },
    { proverbio: 'Il lupo perde il pelo ma non il [vizio]', dice: 'vino' },
    { proverbio: 'Chi fa da sé fa per [tre]', dice: 're' },
    { proverbio: "L'abito non fa il [monaco]", dice: 'manico' },
    { proverbio: 'Batti il ferro finché è [caldo]', dice: 'calvo' },
    { proverbio: 'Ogni lasciata è [persa]', dice: 'pesca' },
    { proverbio: 'Chi tardi arriva male [alloggia]', dice: 'abbaglia' },
    { proverbio: 'Paese che vai [usanza] che trovi', dice: 'pancetta' },
    { proverbio: 'Il buon giorno si vede dal [mattino]', dice: 'mattone' },
    { proverbio: "Chi la fa l'[aspetti]", dice: 'affetti' },
    { proverbio: 'Occhio non vede cuore non [duole]', dice: 'suole' },
    { proverbio: 'Moglie e [buoi] dei paesi tuoi', dice: 'boa' },
    { proverbio: 'Natale con i tuoi, [Pasqua] con chi vuoi', dice: 'pasta' },
    { proverbio: 'Gallina vecchia fa buon [brodo]', dice: 'bordo' },
    { proverbio: "Non c'è due senza [tre]", dice: 'trippa' },
    { proverbio: 'Chi di spada ferisce di spada [perisce]', dice: 'pulisce' },
    { proverbio: 'Chi ha tempo non aspetti [tempo]', dice: 'tempura' },
  ],

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { atti: { tempo: 1.4, leggibile: 1.6 }, sottolineaSempre: true, suggerimento: true },
    difficile: { atti: { tempo: 0.75, leggibile: 0.8 }, sottolineaMai: true, tolleranza: 0 },
  },
};
