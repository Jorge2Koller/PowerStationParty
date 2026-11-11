// Configurazione del microgioco "L'Incubo degli Scapoli" (id: scapoli): la sfida di ballo contro il Manna.
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/ScapoliScene.js; questa sezione arriva in CONFIG.microgiochi.scapoli.)
//
// (scheda di valutazione: divertimento 1/5, difficoltà IMPOSSIBILE, "da ripensare, rifare come Just
// Dance, rifare la griglia delle note". Prima le frecce scendevano in quattro corsie, una a ogni
// battito dal secondo atto e anche a mezzo battito, con finestre strette (perfetto 0,06 s, buono
// 0,13) e il Manna che tirava la pista; ora le mosse arrivano come schede, sui battiti, al massimo
// due di fila, la metà di prima: 35 in tutto invece di circa 75)
export default {
  titolo: "L'Incubo degli Scapoli",
  verbo: 'BALLA!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x9b3fd6,
  musica: 'pista',          // traccia di audio.js (un'altra da 'disco', che è quella di Petri Tentacolari)
  ospite: { id: 'manna', etichetta: 'SFIDA DI BALLO:\nIL MANNA' },
  comandi: [
    'Quando una scheda entra nel riquadro, fai quella mossa!',
    'FRECCE (o WASD) per le mosse, SPAZIO per le mani',
    "Più mosse a tempo, più ragazze. Le d'oro valgono doppio",
  ],
  comandiTouch: [
    'Quando una scheda entra nel riquadro, fai quella mossa!',
    'Striscia il dito come la freccia, tocca per le mani',
    "Più mosse a tempo, più ragazze. Le d'oro valgono doppio",
  ],
  obiettivo: 'Ruba al Manna almeno 3 ragazze su 5!',
  // Medaglie (js/punteggi.js): la scala comune (bronzo 100, argento 200, oro 300). Le ragazze sono
  // le "stelle" del ballo: arrivano dalla tua parte quando i punti passano le soglie qui sotto, e la
  // terza, la quarta e la quinta sono proprio bronzo, argento e oro. Con le prove automatiche (35
  // mosse, giocatori finti): chi gioca attento (a tempo quasi sempre, qualche errore) fa 115-180 (il
  // bronzo), chi è bravo 170-280, il campione 250-335 (l'oro una volta su due); chi gioca a caso
  // resta sotto i 35. (Prima le ragazze andavano e venivano: la pista pendeva a ogni freccia, il
  // Manna la tirava sempre dalla sua parte, e alla fine 3, 4 o 5 ragazze valevano 70, 140 o 200
  // punti. Ora quella presa resta tua.)
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  soglieRagazze: [20, 50, 100, 200, 300],
  ragazzeVittoria: 3,       // quante ragazze servono alla fine per vincere
  // in Lampo (15 secondi, un terzo delle mosse) le soglie sono in proporzione: tanto così
  scalaLampo: 0.4,
  // punti di una mossa: perfetta o buona; le d'oro per puntiOro; tutto per il moltiplicatore della
  // serie (+0,5 ogni ogniSerie mosse di fila, fino a maxMoltiplicatore). Sbagliata o mancata: niente,
  // e la serie riparte; un gesto a vuoto (nessuna mossa vicina) fa ripartire la serie
  // (erano perfetto 1, buono 0,5, d'oro il doppio, +0,5 ogni 10 fino a x3, più le ragazze alla fine)
  puntiPerfetto: 5,
  puntiBuono: 2,            // (scheda 2: "è diventato troppo semplice": era 3)
  puntiOro: 2,
  ogniSerie: 6,
  maxMoltiplicatore: 2,
  // quanto si può sbagliare il tempo (secondi, prima o dopo): perfetto e buono; oltre è mancata
  // (erano 0,06 e 0,13: col dito, strisciando, non ci si arrivava)
  finestre: { perfetto: 0.07, buono: 0.13 },   // (scheda 2, più strette: erano 0,08 e 0,16)
  sogliaStriscia: 10,       // col dito o col mouse: quanto strisciare (unità) perché sia una freccia e non un tocco
  durataPosa: 0.38,         // secondi che chi gioca (e il Manna) resta nella posa della mossa
  primoPasso: 8,            // ottavi di attesa prima della prima mossa (una battuta: le schede si vedono arrivare)
  // LA COREOGRAFIA (la griglia delle mosse). Si scrive a battiti: ogni parola è un battito della
  // musica (due ottavi), "-" = niente. Le mosse: su, giu, sx, dx (le frecce), batti (le mani);
  // con l'asterisco è d'oro (su*). Prima l'attacco (una battuta), poi frasi di due battute (8
  // battiti) pescate a caso dal mazzo dell'atto (col seme del round: uguali per tutti i giocatori),
  // a volte allo specchio (sinistra e destra scambiate), mai la stessa due volte di fila.
  attacco: 'batti - batti -',
  mazzi: {
    // primo atto: una mossa ogni due battiti, e in fondo alla frase si respira
    // (scheda 2: quattro mosse anche nel primo atto, erano tre)
    atto1: ['sx - dx - sx - dx -', 'su - su - giu - su -', 'giu - giu - su - batti -', 'batti - batti - su - giu -', 'sx - dx - batti - su -', 'su - giu - batti - dx -', 'dx - dx - sx - batti -'],
    // secondo atto: una ogni due battiti senza pause, ogni tanto due di fila, e le mosse d'oro
    atto2: ['sx - dx - sx - dx -', 'su - giu - su - giu -', 'batti batti - - sx - dx -', 'sx - sx - dx - dx -', 'su - batti - giu - batti -', 'sx - dx - batti - su* -', 'dx - sx - batti - giu* -', 'su - giu - sx - dx* -'],
    // terzo atto (la musica accelera): due di fila più spesso
    atto3: ['sx dx - - sx dx - -', 'dx sx - - su - su -', 'su giu - - batti batti - -', 'batti batti - - sx - dx* -', 'su - giu - sx dx - -', 'giu su - - batti - su* -', 'batti - sx dx - - su* -'],
  },
  // I tre atti: da = secondo d'inizio (in Lampo in proporzione), annuncio. Nell'ultimo la musica
  // accelera fino a tempoFinale (come prima: le mosse stanno sui battiti, la musica non cambia)
  atti: [
    { da: 0, nome: '' },
    { da: 11, nome: "LE MOSSE D'ORO!" },
    { da: 23, nome: 'IL MANNA SI SCATENA!' },
  ],
  tempoFinale: 1.35,        // (scheda 2: era 1,25)
  frasiManna: ['Guarda e impara.', 'Ovviamente.', 'Questa è roba mia.', 'Troppo lento, bello.', 'Le ragazze mi adorano.'],
  frasiMannaPerde: ['Era bianca! BIANCA!', 'Non vale, la musica è lenta!', 'Chi ti ha insegnato?!', 'DJ, cambia pezzo!'],
  frasiMannaVince: ['Ovviamente.', 'Torna quando sai ballare.', 'La pista è mia, bello.'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  // Facile: finestre più larghe e nel terzo atto due di fila solo ogni tanto; Difficile: finestre
  // più strette e due di fila già nel secondo atto. (tempoFinale è quello di prima: la musica è la stessa)
  livelli: {
    facile: {
      finestre: { perfetto: 0.09, buono: 0.18 }, tempoFinale: 1.2,
      mazzi: { atto3: ['sx - dx - sx - dx -', 'su - giu - batti - su* -', 'batti batti - - sx - dx -', 'dx - sx - su - giu -', 'su - su - batti - giu* -', 'sx - dx - batti batti - -'] },
    },
    difficile: {
      finestre: { perfetto: 0.055, buono: 0.11 }, tempoFinale: 1.45,
      mazzi: { atto2: ['sx dx - - sx - dx -', 'su - giu - su giu - -', 'batti batti - - sx - dx -', 'sx - sx - dx dx - -', 'su - batti - giu - batti -', 'sx dx - - batti - su* -', 'dx - sx - batti batti giu* -', 'su - giu - sx - dx* -'] },
    },
  },
};
