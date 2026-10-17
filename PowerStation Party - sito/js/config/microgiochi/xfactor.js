// Configurazione del microgioco 'Provini a X-Factor' (id: xfactor).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/XfactorScene.js; questa sezione arriva in CONFIG.microgiochi.xfactor.)
// Il talent, la grande X e i giudici sono inventati: non sono il logo del programma né persone vere.
// La canzone è vera: "Cambiare Aria" del Tini e dell'Oli. I ritagli (audio/) e la mappa delle note
// (xfactor-mappa.json, qui accanto) li fa strumenti/beatmap.py, fuori dal sito: se cambia la
// canzone, si rilancia quello.
export default {
  titolo: 'Provini a X-Factor',
  verbo: 'SUONA!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x7a2fd0,
  musica: 'silenzio',       // niente musichetta: la canzone vera la suona il microgioco
  // i due cantanti: Tini e Oli (chi li sceglie come personaggio qui gioca "contro se stesso")
  ospite: { id: 'tini', etichetta: 'IL PROVINO DI:\nTINI E OLI' },
  cast: ['oli'],
  cantanti: ['tini', 'oli'],
  comandi: [
    'D F J K (o le frecce): i 4 pad, da sinistra a destra',
    'Colpisci quando il cerchio tocca il pad. Note lunghe: tieni',
    'Sbagli e la canzone si ovatta. I giudici votano la precisione',
  ],
  comandiTouch: [
    'Tocca i 4 pad quando il cerchio ci arriva sopra',
    'Note lunghe: tieni il dito finché finisce la scia',
    'Sbagli e la canzone si ovatta. I giudici votano la precisione',
  ],
  obiettivo: 'Almeno 3 SÌ su 4 dai giudici!',
  // Medaglie (js/punteggi.js): la scala comune (bronzo 100, argento 200, oro 300). Il bronzo è la
  // vittoria, cioè il provino passato: senza 3 SÌ il totale si ferma a tettoPrima, con 3 SÌ sale
  // almeno al bronzo. Argento e oro vengono dai punti delle note.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  tettoPrima: 90,

  // --- la canzone ---
  // mappa = il file delle note (battiti, atti e note per ogni livello, per il ritaglio intero e per
  // quello del Lampo); offset = secondi da aggiungere a ogni nota se il file audio parte un filo in
  // ritardo (i decoder MP3 a volte aggiungono qualche millesimo di silenzio all'inizio)
  canzone: { titolo: 'Cambiare Aria', di: 'Social Tedio e Vanz De La Cruz', mappa: 'js/config/microgiochi/xfactor-mappa.json', offset: 0 },

  // --- punti ---
  // le proporzioni sono quelle di sempre (PERFETTO il doppio di BUONO, la nota lunga tenuta un
  // bonus), sulla scala comune delle medaglie. Una nota vale per il moltiplicatore della serie e
  // per il fattore della mappa (a FACILE le note sono meno, e valgono di più: in tutto si fanno i
  // punti di NORMALE); ogni SÌ dei giudici vale "si" punti
  punti: { perfetto: 2.5, buono: 1.25, lunga: 1, si: 10 },
  serie: [[10, 1.5], [20, 2], [40, 3]],     // [dopo quante note di fila, moltiplicatore]: un errore la azzera
  pesoBuono: 0.6,           // per la precisione: un BUONO vale 0,6 di un PERFETTO, un MANCATO zero

  // --- i pad ---
  // finestre (secondi, prima o dopo la nota): PERFETTO, BUONO, e più in là un tocco "a vuoto" (che
  // azzera la serie); anticipo = quanti secondi prima si vede arrivare la nota (la velocità)
  finestre: { perfetto: 0.055, buono: 0.12, vuoto: 0.25 },
  anticipo: 1.35,
  // l'errore si sente sulla canzone: a ogni nota mancata si ovatta (passa-basso a "taglio" Hz) per
  // "ovatta" secondi, col graffio del disco; con "fila" errori di fila resta ovattata e rallenta a
  // "lento" (un po' più bassa di tono) finché non si torna a prendere le note
  errori: { taglio: 700, ovatta: 0.5, fila: 3, lento: 0.96 },

  // I tre atti, allineati alla canzone: i secondi in cui cominciano sono nella mappa (li calcola lo
  // script dai battiti: nel ritaglio intero 0, 12,19 e 23,89; nel Lampo il primo non c'è).
  // luci = quanto girano e brillano i fasci; tutti in piedi = i giudici si alzano
  atti: [
    { nome: 'LA STROFA', luci: 0.45 },
    { nome: 'IL PEZZO FORTE!', luci: 1 },
    { nome: 'IL GRAN FINALE!', luci: 1.4, riflettori: true, inPiedi: true },
  ],

  // --- i giudici (inventati), nell'ordine in cui siedono. soglia = la precisione (da 0 a 1) che
  // vogliono per dire SÌ: il produttore è il più severo, il commosso dice quasi sempre sì. La lucina
  // sul tavolo diventa verde quando la tua precisione passa la sua soglia.
  siPerVincere: 3,
  giudici: [
    { nome: 'LA DIVA', soglia: 0.52, si: ['Tesoro, sei una stella!', 'Mi hai fatto venire i brividi.', 'Divino. Quasi come me.'], no: ['Per me è no, tesoro.', 'Mi si è sciolto il trucco.', 'Ho sentito di meglio in ascensore.'] },
    { nome: 'MC CATENA', soglia: 0.64, si: ['Bro, spacca!', 'Bootcamp!', 'Flow pulito, rispetto.'], no: ['Bro... no.', 'Zero flow.', 'Cambiare aria... magari tu.'] },
    { nome: 'IL PRODUTTORE', soglia: 0.84, si: ['Si può lavorare.', 'Non male. Ho detto non male.', 'Firmate qui.'], no: ['Per me è no.', 'Ho un aereo da prendere.', 'Cambiare aria... magari tu.'] },
    { nome: 'IL COMMOSSO', soglia: 0.33, si: ['Sto piangendo! Sì!', 'Mi avete toccato il cuore.', 'Che emozione, ragazzi!'], no: ['Piango... ma di dispiacere.', 'Mi dispiace tanto, è no.'] },
  ],
  frasiVittoria: ['SEI AI BOOTCAMP!'],
  frasiSconfitta: ['È UN NO PER ME'],
  frasiColpa: ['È colpa sua!', 'Ci ha sbagliato la base!', 'Suonava un\'altra canzone!'],

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori (e ognuno ha la sua mappa delle note). Un oggetto al posto di un elenco
  // (giudici) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { finestre: { perfetto: 0.075, buono: 0.16 }, anticipo: 1.6, giudici: { soglia: 0.85 } },
    difficile: { finestre: { perfetto: 0.042, buono: 0.095 }, anticipo: 1.12, giudici: { soglia: 1.07 } },
  },
};
