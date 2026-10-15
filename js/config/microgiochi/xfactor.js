// Configurazione del microgioco 'Provini a X-Factor' (id: xfactor).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/XfactorScene.js; questa sezione arriva in CONFIG.microgiochi.xfactor.)
// Il talent, la grande X e i giudici sono inventati: non sono il logo del programma né persone vere.
export default {
  titolo: 'Provini a X-Factor',
  verbo: 'INTONA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x7a2fd0,
  musica: 'provino',        // la base di audio.js (una delle canzoni qui sotto): la melodia la dà il microgioco
  // i due cantanti: Tini e Oli (chi li sceglie come personaggio qui gioca "contro se stesso")
  ospite: { id: 'tini', etichetta: 'IL PROVINO DI:\nTINI E OLI' },
  cast: ['oli'],
  cantanti: ['tini', 'oli'],
  comandi: [
    'SU / GIÙ (o W / S) oppure il mouse: sposti la nota',
    'Tienila sulla melodia: i cantanti cantano la tua nota',
    'Le note con la stella valgono doppio, se le tieni precise',
  ],
  comandiTouch: [
    'Trascina su e giù nella metà destra: sposti la nota',
    'Tienila sulla melodia: i cantanti cantano la tua nota',
    'Le note con la stella valgono doppio, se le tieni precise',
  ],
  obiettivo: 'Almeno 3 SÌ su 4 dai giudici!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 150 / 280 / 480, con 50 punti per ogni SÌ): il
  // giocatore automatico che segue la melodia fa 330-355 con l'acuto, chi muove a caso poche decine.
  // I giudici votano sui punti (vedi giudici): 3 SÌ su 4 sono proprio il bronzo.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },

  // --- punti ---
  puntiSecondo: 10,         // per ogni secondo intonato (si contano le frazioni), per il moltiplicatore
  serie: { ogni: 3, passo: 0.5, max: 3 },   // il moltiplicatore: +0,5 ogni 3 secondi di fila intonati, fino a x3
  bonusAcuto: 40,           // l'acuto finale tenuto fino in fondo (intonato per almeno "tenuta" del tempo)
  // (le note d'oro valgono doppio: a fine nota, se non l'hai mai stonata, si riprendono i suoi punti)

  // --- la nota di chi gioca ---
  tolleranza: 0.2,          // quanto il cursore può stare lontano dalla nota giusta (in note) e contare come intonato (era 0,3)
  grazia: 0.18,             // secondi, dopo ogni cambio di nota, in cui non essere ancora arrivati non è una stonatura
  graziaSalto: 0.06,        // ...più tanti secondi per ogni nota di salto oltre la prima (un salto grande chiede più tempo)
  scivola: 26,              // quanto in fretta il cursore scivola da una nota all'altra (più alto = più svelto)
  ditoPasso: 12,            // dito: unità di schermo da trascinare per salire o scendere di una nota
  ripeti: [0.22, 0.085],    // tastiera, tenendo premuto: attesa prima di ripetere, poi ogni quanto (secondi)

  // --- le canzoni ---
  // Tre basi diverse (audio.js, suonaProvino), una per round, scelta col seme: nella stessa sfida
  // tutti cantano la stessa. bpm = il tempo (un passo = un ottavo); giro = gli accordi, uno per
  // battuta (indici di "accordi" qui sotto): Fa, Do, Re minore, Si bemolle.
  canzoni: [
    { nome: 'ROCK', stile: 'rock', bpm: 128, giro: [0, 1, 2, 3] },   // Fa Do Rem Sib: chitarra, cassa e rullante pieni
    { nome: 'POP', stile: 'pop', bpm: 116, giro: [2, 3, 0, 1] },     // Rem Sib Fa Do: cassa in quattro, arpeggi
    { nome: 'RAP', stile: 'rap', bpm: 96, giro: [2, 2, 3, 1] },      // Rem Rem Sib Do: boom bap, basso lungo
  ],
  // Il pentagramma: 7 note utilizzabili, dalla seconda riga (Sol) alla quinta (Fa acuto), in Fa
  // maggiore (il Si è bemolle).
  scala: [67, 69, 70, 72, 74, 76, 77],          // le 7 note (numeri MIDI), dal basso all'alto
  accordi: [[1, 3, 6], [0, 3, 5], [1, 4, 6], [2, 4, 6]],   // le note "buone" di ogni accordo: Fa, Do, Re minore, Si bemolle
  // gli stessi accordi per la base: la nota più bassa (il basso) e le tre dell'accordo (MIDI)
  armonia: { radici: [41, 36, 38, 34], triadi: [[53, 57, 60], [52, 55, 60], [53, 57, 62], [53, 58, 62]] },
  tono: [0, 2, 2],          // semitoni in più in ogni atto: dal ritornello si sale di un tono (voci, guida e base)
  // (le durate qui sotto sono in ottavi a 120 bpm, 0,25 secondi: con ogni canzone durano uguale)
  primoPasso: 6,            // ottavi di attesa prima della prima nota
  scorrimento: 16,          // quanto scorre la melodia a ogni ottavo (unità di schermo): più alto = meno tempo per leggerla
  // I tre atti. da = secondo d'inizio; durate = quanto può durare una nota (in ottavi); salto = di
  // quante note al massimo si sposta la melodia; cambio = ogni quanti ottavi cambia il cantante
  // (all'inizio e alla fine dell'atto); oro = quante note hanno la stella.
  // (più difficili dopo la serata di prova: prima 4-8 ottavi e salti di 2 nella strofa)
  atti: [
    { da: 0, nome: 'LA STROFA', durate: [3, 4, 5], salto: 3, cambio: [16, 12], oro: 0.12 },
    { da: 12, nome: 'IL RITORNELLO!', durate: [1, 2, 2, 3], salto: 5, cambio: [8, 4], oro: 0.2 },
    { da: 24, nome: "L'ACUTO!", durate: [1, 1, 2], salto: 4, cambio: [4, 3], oro: 0.14 },
  ],
  // l'acuto finale (solo se la partita arriva al terzo atto: in Lampo non c'è): la nota più alta
  // tenuta fino alla fine, con qualche tremolo (una discesa breve alla nota sotto) da seguire
  acuto: { secondi: 5.5, tremoli: 4, tenuta: 0.85 },   // (era 4 secondi con 2 tremoli)

  // --- le voci dei cantanti (audio.js): forma d'onda, filtro, ottava rispetto al pentagramma ---
  voci: [
    { tipo: 'square', taglio: 2600, ottava: 0 },      // Tini: squillante
    { tipo: 'sawtooth', taglio: 1500, ottava: -1 },   // Oli: più scura, un'ottava sotto
  ],
  vibrato: { dopo: 0.45, cent: 16, acuto: 2.4 },      // sulla nota giusta, tenuta: un po' di vibrato (sull'acuto, tanto di più)
  stonata: { cala: [55, 120], secondi: 0.9, tremolo: 48, crepa: 0.6 },   // sbagliata: calante (in cent, sempre di più), tremolio largo, la voce si incrina

  // --- i giudici (inventati), nell'ordine in cui siedono. soglia = quanti punti vogliono per
  // dire SÌ, in proporzione al bronzo (1 = i punti del bronzo). Con 3 SÌ su 4 si vince, e il terzo
  // giudice più facile (MC CATENA) sta proprio sul bronzo: così il verdetto coincide sempre con la
  // medaglia (la regola di tutti i microgiochi: bronzo = vittoria). In Lampo, più corto, le soglie
  // scalano con la durata. La lucina sul tavolo diventa verde quando i tuoi punti passano la sua
  // soglia, e la barra degli applausi si riempie coi punti.
  // (Prima guardavano la percentuale di intonazione, 0,62, 0,68, 0,86 e 0,55, e ogni SÌ dava 50
  // punti: si poteva avere il bronzo col NO dei giudici, o il SÌ senza il bronzo.)
  siPerVincere: 3,
  giudici: [
    { nome: 'LA DIVA', soglia: 0.8, si: ['Tesoro, sei una stella!', 'Mi hai fatto venire i brividi.', 'Divino. Quasi come me.'], no: ['Per me è no, tesoro.', 'Mi si è sciolto il trucco.', 'Ho sentito di meglio in ascensore.'] },
    { nome: 'MC CATENA', soglia: 1, si: ['Bro, spacca!', 'Bootcamp!', 'Flow pulito, rispetto.'], no: ['Bro... no.', 'Zero flow.', 'Non ho parole... in senso brutto.'] },
    { nome: 'IL PRODUTTORE', soglia: 1.8, si: ['Si può lavorare.', 'Non male. Ho detto non male.', 'Firmate qui.'], no: ['Per me è no.', 'Ho un aereo da prendere.', 'Avanti il prossimo.'] },
    { nome: 'IL COMMOSSO', soglia: 0.6, si: ['Sto piangendo! Sì!', 'Mi avete toccato il cuore.', 'Che emozione, ragazzi!'], no: ['Piango... ma di dispiacere.', 'Mi dispiace tanto, è no.'] },
  ],
  frasiVittoria: ['SEI AI BOOTCAMP!'],
  frasiSconfitta: ['È UN NO PER ME'],
  frasiColpa: ['È colpa sua!', 'Ci ha dato la nota sbagliata!', 'Suonava un\'altra canzone!'],

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { tolleranza: 0.26, grazia: 0.24, graziaSalto: 0.08, scorrimento: 14, atti: { durate: 1.4, salto: 0.75 }, acuto: { tremoli: 2 } },
    difficile: { tolleranza: 0.16, grazia: 0.13, graziaSalto: 0.045, scorrimento: 18, atti: { durate: 0.8, salto: 1.2 }, acuto: { tremoli: 5 } },
  },
};
