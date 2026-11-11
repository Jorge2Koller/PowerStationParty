// Configurazione del microgioco 'Provini a X-Factor' (id: xfactor).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/XfactorScene.js; questa sezione arriva in CONFIG.microgiochi.xfactor.)
// Il talent, la grande X e i giudici sono inventati: non sono il logo del programma né persone vere.
// Le canzoni sono vere, del Tini e dell'Oli (l'elenco è "canzoni", qui sotto). I ritagli (audio/) e
// le mappe delle note (xfactor-<canzone>.json, qui accanto) li fa strumenti/beatmap.py, fuori dal
// sito: se cambia una canzone, si rilancia quello. Le note come in Guitar Hero le rifà poi
// strumenti/griglia.py (beatmap.py lo lancia da solo alla fine; si può rilanciare anche da solo, per
// cambiare solo le note).
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
    'Colpisci quando la nota arriva sul pad. Scie: tieni premuto',
    'Due note insieme: due tasti insieme. I giudici votano la precisione',
  ],
  comandiTouch: [
    'Tocca i 4 pad in basso quando la nota ci arriva sopra',
    'Scie: tieni il dito finché finiscono. Due note insieme: due dita',
    'Sbagli e la canzone si ovatta. I giudici votano la precisione',
  ],
  obiettivo: 'Almeno 3 SÌ su 4 dai giudici!',
  // Medaglie (js/punteggi.js): la scala comune (bronzo 100, argento 200, oro 300). Il bronzo è la
  // vittoria, cioè il provino passato: senza 3 SÌ il totale si ferma a tettoPrima, con 3 SÌ sale
  // almeno al bronzo. Argento e oro vengono dai punti delle note.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  tettoPrima: 90,

  // --- le canzoni ---
  // Canzoni vere del Tini e dell'Oli. Quale suona: nella sfida la decide il seme del round (tutti i
  // giocatori la stessa, con la stessa mappa: Sfida del giorno compresa); in Allenamento una a caso, e
  // nell'introduzione si cambia con SINISTRA/DESTRA (o toccando le frecce). Il titolo si vede
  // nell'introduzione e in alto durante la canzone. Per ognuna:
  //   ritagli = i due file audio: il microgioco (35 s) e il Lampo (15 s)
  //   mappa   = il file delle note (battiti, atti, chi canta e le note di ogni livello, per i due
  //             ritagli). Ritagli e mappa li fa strumenti/beatmap.py, dalle voci di strumenti/canzoni.py
  //   offset  = secondi da aggiungere a ogni nota se il file audio parte un filo in ritardo (i decoder
  //             MP3 a volte aggiungono qualche millesimo di silenzio all'inizio)
  //   bpm, inizio = servono solo se la mappa non si scarica: il tempo della canzone e dove cominciano
  //             i due ritagli nella canzone intera (per le sezioni qui sotto)
  //   sezioni = chi canta, solo se la mappa non lo dice (la scena usa le "voci" della mappa): da "da"
  //             ad "a" canta "cantante" ('tini', 'oli' o 'insieme'), in secondi della canzone INTERA,
  //             così valgono sia per i 35 secondi sia per il Lampo
  //   frasiNo = (facoltativo) le battute dei giudici sul titolo, per nome del giudice: si aggiungono
  //             alle sue frasi del NO solo quando suona questa canzone
  // Sul palco chi canta viene avanti sotto il riflettore, col nome sopra la testa, e l'altro fa un
  // passo indietro e fa il coro ('insieme': tutti e due avanti).
  // Una canzone nuova: una voce qui, una in strumenti/canzoni.py, e il lancio di beatmap.py.
  canzoni: [
    {
      id: 'fuori-dagli-schemi', titolo: 'Fuori Dagli Schemi', di: 'Corso Italia',
      ritagli: { intero: 'audio/fuori-dagli-schemi.mp3', lampo: 'audio/fuori-dagli-schemi-lampo.mp3' },
      mappa: 'js/config/microgiochi/xfactor-fuori-dagli-schemi.json', offset: 0,
      bpm: 89, inizio: { intero: 86.815, lampo: 100.298 },
      // la strofa dell'Oli (si alza quando entra la base piena), poi il Tini da 1:43, lo stacco e il suo
      // ritornello
      sezioni: [
        { da: 86.815, a: 102.994, cantante: 'oli' },      // la strofa e il pezzo forte (fino a 16,2 s del ritaglio)
        { da: 102.994, a: 121.869, cantante: 'tini' },    // la fine del pezzo forte, lo stacco e il gran finale
      ],
      frasiNo: { 'MC CATENA': 'Fuori dagli schemi... e pure dal tempo.', 'IL PRODUTTORE': 'Fuori dagli schemi? Fuori e basta.' },
    },
    {
      id: 'stare-up', titolo: 'Stare Up', di: 'Corso Italia',
      ritagli: { intero: 'audio/stare-up.mp3', lampo: 'audio/stare-up-lampo.mp3' },
      mappa: 'js/config/microgiochi/xfactor-stare-up.json', offset: 0,
      bpm: 86, inizio: { intero: 54.323, lampo: 68.277 },
      // la coda di una frase del Tini, la strofa dell'Oli (la voce bassa), poi il Tini dal suo
      // ingresso a 1:16 fino alla fine del ritornello
      sezioni: [
        { da: 54.323, a: 55.718, cantante: 'tini' },
        { da: 55.718, a: 75.952, cantante: 'oli' },       // la strofa e il pezzo forte, fino a 1:16
        { da: 75.952, a: 89.905, cantante: 'tini' },      // la fine del pezzo forte e il gran finale
      ],
      frasiNo: { 'MC CATENA': 'Stare up? Io mi siedo.', 'IL PRODUTTORE': 'Stare up... e scendere subito.' },
    },
    {
      id: 'stare-bene', titolo: 'Stare Bene', di: 'Corso Italia',
      ritagli: { intero: 'audio/stare-bene.mp3', lampo: 'audio/stare-bene-lampo.mp3' },
      mappa: 'js/config/microgiochi/xfactor-stare-bene.json', offset: 0,
      bpm: 92, inizio: { intero: 112.156, lampo: 117.374 },
      // dalla parte finale: la strofa bassa dell'Oli, lo stacco, e l'ultimo ritornello, dove entra il Tini e
      // cantano tutti e due
      sezioni: [
        { da: 112.156, a: 125.200, cantante: 'oli' },     // la strofa (fino a 13 s del ritaglio)
        { da: 125.200, a: 147.375, cantante: 'insieme' }, // il pezzo forte e il gran finale: il ritornello, tutti e due
      ],
      frasiNo: { 'MC CATENA': 'Stare bene? Io adesso no.', 'IL PRODUTTORE': 'Stare bene... a casa, magari.' },
    },
  ],

  // --- punti ---
  // le proporzioni sono quelle di sempre (PERFETTO il doppio di BUONO, la nota lunga tenuta un
  // bonus), sulla scala comune delle medaglie. Una nota vale per il moltiplicatore della serie e
  // per il fattore della mappa: notePunti diviso le note della mappa (a FACILE le note sono meno, e
  // valgono di più). notePunti sono le note di NORMALE di Cambiare Aria (35 s e Lampo), la prima canzone
  // del microgioco, su cui sono tarati i livelli: così ogni canzone e ogni livello fanno gli stessi
  // punti, anche se le mappe hanno più o meno note (le canzoni più lente ne hanno meno). Ogni SÌ dei
  // giudici vale "si" punti
  punti: { perfetto: 2.5, buono: 1.25, lunga: 1, si: 10 },
  notePunti: { intero: 61, lampo: 24 },
  serie: [[10, 1.5], [20, 2], [40, 3]],     // [dopo quante note di fila, moltiplicatore]: un errore la azzera
  pesoBuono: 0.6,           // per la precisione: un BUONO vale 0,6 di un PERFETTO, un MANCATO zero

  // --- i pad ---
  // finestre (secondi, prima o dopo la nota): PERFETTO, BUONO, e più in là un tocco "a vuoto" (che
  // azzera la serie); anticipo = quanti secondi prima si vede arrivare la nota (la velocità).
  // ("Leggermente più difficile", 20 ottobre: finestre più strette del 6% e note più svelte del 5%, a
  // tutti i livelli; erano 0,055 e 0,12, anticipo 1,35. Coi giocatori simulati, a NORMALE chi sbaglia di
  // 75 ms passa il provino una volta su due invece di due su tre, e chi sbaglia di 48 ms prende
  // l'argento poco più di una volta su due invece di due su tre)
  // (scheda 2: "la difficoltà normale è tendente al facile": a NORMALE finestre più strette del 10% e
  // note un po' più svelte; erano 0,052 e 0,113, anticipo 1,28. Facile e Difficile restano com'erano)
  finestre: { perfetto: 0.047, buono: 0.102, vuoto: 0.25 },
  anticipo: 1.2,
  // l'errore si sente sulla canzone: a ogni nota mancata si ovatta (passa-basso a "taglio" Hz) per
  // "ovatta" secondi, col graffio del disco; con "fila" errori di fila resta ovattata e rallenta a
  // "lento" (un po' più bassa di tono) finché non si torna a prendere le note
  errori: { taglio: 700, ovatta: 0.5, fila: 3, lento: 0.96 },

  // I tre atti, allineati alla canzone: i secondi in cui cominciano sono nella mappa (li calcola lo
  // script dai battiti: nel ritaglio intero 0, 11,25 e 26,25; nel Lampo la strofa da 0 e il pezzo
  // forte da 7,5, senza gran finale: era tutto pezzo forte, ma ora il Lampo comincia con l'Oli).
  // Nella mappa c'è anche chi canta, e quando ("voci": l'Oli, il Tini o insieme), per la scena.
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
    { nome: 'MC CATENA', soglia: 0.64, si: ['Bro, spacca!', 'Bootcamp!', 'Flow pulito, rispetto.'], no: ['Bro... no.', 'Zero flow.', 'Bro, il beat ti ha superato.'] },
    { nome: 'IL PRODUTTORE', soglia: 0.84, si: ['Si può lavorare.', 'Non male. Ho detto non male.', 'Firmate qui.'], no: ['Per me è no.', 'Ho un aereo da prendere.', 'Avanti il prossimo.'] },
    { nome: 'IL COMMOSSO', soglia: 0.33, si: ['Sto piangendo! Sì!', 'Mi avete toccato il cuore.', 'Che emozione, ragazzi!'], no: ['Piango... ma di dispiacere.', 'Mi dispiace tanto, è no.'] },
  ],
  frasiVittoria: ['SEI AI BOOTCAMP!'],
  frasiSconfitta: ['È UN NO PER ME'],
  frasiColpa: ['È colpa sua!', 'Ci ha sbagliato la base!', 'Suonava un\'altra canzone!'],

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori (e ognuno ha la sua mappa delle note). Un oggetto al posto di un elenco
  // (giudici) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { finestre: { perfetto: 0.07, buono: 0.15 }, anticipo: 1.52, giudici: { soglia: 0.85 } },
    difficile: { finestre: { perfetto: 0.04, buono: 0.089 }, anticipo: 1.06, giudici: { soglia: 1.07 } },
  },
};
