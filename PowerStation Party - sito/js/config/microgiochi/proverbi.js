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
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. stringi = gli elenchi a tempo i cui atti si stringono nei 15 secondi
  lampo: { obiettivo: 'Correggi almeno 3 proverbi!', stringi: ['atti'] },
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
  // sbaglia); dice = la parola sbagliata che dice lui; livello = quanto è difficile ('facile',
  // 'medio', 'difficile': quanto è conosciuto il proverbio e quanto è nascosto l'errore); perla: true
  // se è un suo sbaglio vero (vale doppio). Per aggiungerne uno basta una riga. Gli errori devono
  // restare realistici: sbagli che uno potrebbe fare davvero.
  // Come si dividono tra i giocatori (vedi ProverbiScene.js, blocchiDelRound): a ogni round tutto
  // l'elenco si mescola una volta, dal seme del round, e ogni giocatore della partita ha un blocco suo,
  // senza sovrapposizioni, con lo stesso numero di proverbi per livello, in ordine: prima i facili,
  // poi i medi, poi i difficili (negli atti più avanti). Quelli usciti di recente (recenti: quanti se
  // ne ricorda il salvataggio) vanno in fondo; nella Sfida del giorno no, così è uguale per tutti.
  // Meglio tenerli in numero uguale per livello (ora 23 per livello, 69 in tutto).
  recenti: 45,
  proverbi: [
    { proverbio: 'Ambasciator non porta [pena]', dice: 'pane', livello: 'medio', perla: true },
    { proverbio: 'Chi dorme non piglia [pesci]', dice: 'pesche', livello: 'medio' },
    { proverbio: "Il mattino ha l'[oro] in bocca", dice: 'orso', livello: 'facile' },
    { proverbio: 'Can che abbaia non [morde]', dice: 'morte', livello: 'medio' },
    { proverbio: 'A caval donato non si guarda in [bocca]', dice: 'borsa', livello: 'facile' },
    { proverbio: "Tra il dire e il fare c'è di mezzo il [mare]", dice: 'marito', livello: 'facile' },
    { proverbio: "L'erba del vicino è sempre più [verde]", dice: 'verdura', livello: 'facile' },
    { proverbio: 'Chi va piano va sano e va [lontano]', dice: 'lontra', livello: 'facile' },
    { proverbio: 'Non tutte le ciambelle riescono col [buco]', dice: 'bucato', livello: 'facile' },
    { proverbio: 'Chi semina vento raccoglie [tempesta]', dice: 'tempera', livello: 'medio' },
    { proverbio: 'Rosso di sera bel tempo si [spera]', dice: 'pera', livello: 'medio' },
    { proverbio: 'Una mela al giorno toglie il medico di [torno]', dice: 'torta', livello: 'facile' },
    { proverbio: 'Chi trova un amico trova un [tesoro]', dice: 'toro', livello: 'facile' },
    { proverbio: 'Meglio un uovo oggi che una [gallina] domani', dice: 'galleria', livello: 'facile' },
    { proverbio: 'Il lupo perde il pelo ma non il [vizio]', dice: 'vino', livello: 'facile' },
    { proverbio: 'Chi fa da sé fa per [tre]', dice: 're', livello: 'medio' },
    { proverbio: "L'abito non fa il [monaco]", dice: 'manico', livello: 'medio' },
    { proverbio: 'Batti il ferro finché è [caldo]', dice: 'calvo', livello: 'facile' },
    { proverbio: 'Ogni lasciata è [persa]', dice: 'pesca', livello: 'difficile' },
    { proverbio: 'Chi tardi arriva male [alloggia]', dice: 'abbaglia', livello: 'difficile' },
    { proverbio: 'Paese che vai [usanza] che trovi', dice: 'pancetta', livello: 'facile' },
    { proverbio: 'Il buon giorno si vede dal [mattino]', dice: 'mattone', livello: 'facile' },
    { proverbio: "Chi la fa l'[aspetti]", dice: 'affetti', livello: 'difficile' },
    { proverbio: 'Occhio non vede cuore non [duole]', dice: 'suole', livello: 'difficile' },
    { proverbio: 'Moglie e [buoi] dei paesi tuoi', dice: 'boa', livello: 'difficile' },
    { proverbio: 'Natale con i tuoi, [Pasqua] con chi vuoi', dice: 'pasta', livello: 'facile' },
    { proverbio: 'Gallina vecchia fa buon [brodo]', dice: 'bordo', livello: 'difficile' },
    { proverbio: "Non c'è due senza [tre]", dice: 'trippa', livello: 'facile' },
    { proverbio: 'Chi di spada ferisce di spada [perisce]', dice: 'pulisce', livello: 'medio' },
    { proverbio: 'Chi ha tempo non aspetti [tempo]', dice: 'tempura', livello: 'difficile' },
    { proverbio: 'Chi si accontenta [gode]', dice: 'code', livello: 'difficile' },
    { proverbio: 'Chi disprezza [compra]', dice: 'campa', livello: 'difficile' },
    { proverbio: 'Tanto va la gatta al [lardo] che ci lascia lo zampino', dice: 'lago', livello: 'facile' },
    { proverbio: 'Chi va con lo zoppo impara a [zoppicare]', dice: 'zappare', livello: 'medio' },
    { proverbio: "Quando il gatto non c'è i [topi] ballano", dice: 'tipi', livello: 'medio' },
    { proverbio: 'Chi non risica non [rosica]', dice: 'risica', livello: 'difficile' },
    { proverbio: 'Il riso abbonda sulla bocca degli [sciocchi]', dice: 'cuochi', livello: 'medio' },
    { proverbio: 'Chi lascia la strada vecchia per la nuova sa quel che lascia ma non sa quel che [trova]', dice: 'prova', livello: 'difficile' },
    { proverbio: 'Meglio soli che male [accompagnati]', dice: 'accomodati', livello: 'medio' },
    { proverbio: "L'appetito vien [mangiando]", dice: 'guardando', livello: 'facile' },
    { proverbio: 'Dimmi con chi vai e ti dirò chi [sei]', dice: 'sai', livello: 'difficile' },
    { proverbio: 'Fidarsi è bene, non fidarsi è [meglio]', dice: 'peggio', livello: 'facile' },
    { proverbio: 'Non svegliare il can che [dorme]', dice: 'morde', livello: 'medio' },
    { proverbio: 'Acqua passata non [macina] più', dice: 'cammina', livello: 'difficile' },
    { proverbio: 'Chi rompe [paga] e i cocci sono suoi', dice: 'piega', livello: 'medio' },
    { proverbio: 'Ride bene chi ride [ultimo]', dice: 'ottimo', livello: 'facile' },
    { proverbio: 'Volere è [potere]', dice: 'potare', livello: 'difficile' },
    { proverbio: "Il silenzio è d'[oro]", dice: 'orzo', livello: 'medio' },
    { proverbio: 'Chi tace [acconsente]', dice: 'accontenta', livello: 'difficile' },
    { proverbio: 'Una rondine non fa [primavera]', dice: 'primiera', livello: 'medio' },
    { proverbio: "L'occasione fa l'uomo [ladro]", dice: 'lardo', livello: 'difficile' },
    { proverbio: 'Non si può avere la [botte] piena e la moglie ubriaca', dice: 'bocca', livello: 'facile' },
    { proverbio: 'Al cuor non si [comanda]', dice: 'domanda', livello: 'medio' },
    { proverbio: "Chi va al mulino s'[infarina]", dice: 'innamora', livello: 'difficile' },
    { proverbio: "Sbagliando s'[impara]", dice: 'impera', livello: 'difficile' },
    { proverbio: 'Il mondo è bello perché è [vario]', dice: 'varo', livello: 'difficile' },
    { proverbio: 'Chi più spende meno [spende]', dice: 'rende', livello: 'difficile' },
    { proverbio: 'A mali estremi, estremi [rimedi]', dice: 'rimorsi', livello: 'medio' },
    { proverbio: 'Tra moglie e marito non mettere il [dito]', dice: 'vino', livello: 'facile' },
    { proverbio: "L'unione fa la [forza]", dice: 'forca', livello: 'medio' },
    { proverbio: 'Il pesce puzza dalla [testa]', dice: 'coda', livello: 'facile' },
    { proverbio: 'La gatta frettolosa fa i figli [ciechi]', dice: 'secchi', livello: 'difficile' },
    { proverbio: 'Patti chiari, amicizia [lunga]', dice: 'lenta', livello: 'medio' },
    { proverbio: "Chi ben comincia è a metà dell'[opera]", dice: 'ora', livello: 'difficile' },
    { proverbio: 'Prendere due piccioni con una [fava]', dice: 'fata', livello: 'medio' },
    { proverbio: 'Non è tutto oro quel che [luccica]', dice: 'lucida', livello: 'medio' },
    { proverbio: "Ognuno tira l'acqua al suo [mulino]", dice: 'giardino', livello: 'facile' },
    { proverbio: "Fatta la legge, trovato l'[inganno]", dice: 'ingaggio', livello: 'difficile' },
    { proverbio: 'Il diavolo fa le pentole ma non i [coperchi]', dice: 'coperti', livello: 'medio' },
  ],

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { atti: { tempo: 1.4, leggibile: 1.6 }, sottolineaSempre: true, suggerimento: true },
    difficile: { atti: { tempo: 0.75, leggibile: 0.8 }, sottolineaMai: true, tolleranza: 0 },
  },
};
