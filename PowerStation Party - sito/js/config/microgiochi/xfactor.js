// Configurazione del microgioco 'Provini a X-Fattore' (id: xfactor).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/XfactorScene.js; questa sezione arriva in CONFIG.microgiochi.xfactor.)
// Il talent, la grande X e i giudici sono inventati: non sono il programma né persone vere.
export default {
  titolo: 'Provini a X-Fattore',
  verbo: 'INTONA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x7a2fd0,
  musica: 'provino',        // la base (batteria e accordi) di audio.js: la melodia la dà il microgioco
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
  // Tarate coi giocatori simulati: chi passa il provino (3 SÌ) fa almeno 276 punti (280 a Facile),
  // quindi prende almeno l'argento; chi non passa di solito resta sotto i 240. Chi non tocca niente
  // non supera i 60 e chi muove a caso (tasti o mouse) i 90, a tutti i livelli: niente bronzo.
  // Chi segue bene tutta la canzone sta sui 750 (oro); il massimo è circa 1100.
  medaglie: { bronzo: 150, argento: 250, oro: 650 },

  // --- punti ---
  puntiSecondo: 10,         // per ogni secondo intonato (si contano le frazioni), per il moltiplicatore
  serie: { ogni: 3, passo: 0.5, max: 3 },   // il moltiplicatore: +0,5 ogni 3 secondi di fila intonati, fino a x3
  bonusAcuto: 40,           // l'acuto finale tenuto fino in fondo (intonato per almeno "tenuta" del tempo)
  bonusSi: 50,              // per ogni SÌ dei giudici
  // (le note d'oro valgono doppio: a fine nota, se non l'hai mai stonata, si riprendono i suoi punti)

  // --- la nota di chi gioca ---
  tolleranza: 0.3,          // quanto il cursore può stare lontano dalla nota giusta (in note) e contare come intonato
  grazia: 0.18,             // secondi, dopo ogni cambio di nota, in cui non essere ancora arrivati non è una stonatura
  graziaSalto: 0.06,        // ...più tanti secondi per ogni nota di salto oltre la prima (un salto grande chiede più tempo)
  calamita: 0.6,            // mouse e dito: entro tante note dalla nota giusta, il cursore ci si aggancia (0.5 = nessun aiuto)
  scivola: 26,              // quanto in fretta il cursore scivola da una nota all'altra (più alto = più svelto)
  ditoPasso: 12,            // dito: unità di schermo da trascinare per salire o scendere di una nota
  ripeti: [0.22, 0.085],    // tastiera, tenendo premuto: attesa prima di ripetere, poi ogni quanto (secondi)

  // --- la canzone ---
  // Il pentagramma: 7 note utilizzabili, dalla seconda riga (Sol) alla quinta (Fa acuto), in Fa
  // maggiore (il Si è bemolle). Il tempo è quello della base 'provino' (120: un passo = un ottavo = 0,25 s).
  scala: [67, 69, 70, 72, 74, 76, 77],          // le 7 note (numeri MIDI), dal basso all'alto
  accordi: [[1, 3, 6], [0, 3, 5], [1, 4, 6], [2, 4, 6]],   // le note "buone" di ogni battuta: Fa, Do, Re minore, Si bemolle
  primoPasso: 6,            // ottavi di attesa prima della prima nota
  scorrimento: 16,          // quanto scorre la melodia a ogni ottavo (unità di schermo): più alto = meno tempo per leggerla
  // I tre atti. da = secondo d'inizio; durate = quanto può durare una nota (in ottavi); salto = di
  // quante note al massimo si sposta la melodia; cambio = ogni quanti ottavi cambia il cantante
  // (all'inizio e alla fine dell'atto); oro = quante note hanno la stella
  atti: [
    { da: 0, nome: 'LA STROFA', durate: [4, 6, 8], salto: 2, cambio: [16, 16], oro: 0.12 },
    { da: 12, nome: 'IL RITORNELLO!', durate: [2, 3, 4], salto: 4, cambio: [8, 4], oro: 0.2 },
    { da: 24, nome: "L'ACUTO!", durate: [1, 2, 2], salto: 3, cambio: [4, 4], oro: 0.12 },
  ],
  // l'acuto finale (solo se la partita arriva al terzo atto: in Lampo non c'è): la nota più alta
  // tenuta fino alla fine, con qualche tremolo (una discesa breve alla nota sotto) da seguire
  acuto: { secondi: 4, tremoli: 2, tenuta: 0.85 },

  // --- le voci dei cantanti (audio.js): forma d'onda, filtro, ottava rispetto al pentagramma ---
  voci: [
    { tipo: 'square', taglio: 2600, ottava: 0 },      // Tini: squillante
    { tipo: 'sawtooth', taglio: 1500, ottava: -1 },   // Oli: più scura, un'ottava sotto
  ],
  vibrato: { dopo: 0.45, cent: 16 },                  // sulla nota giusta, tenuta: un po' di vibrato
  stonata: { cala: [55, 120], secondi: 0.9, tremolo: 48, crepa: 0.6 },   // sbagliata: calante (in cent, sempre di più), tremolio largo, la voce si incrina

  // --- i giudici (inventati), nell'ordine in cui siedono. soglia = quanto bisogna essere stati
  // intonati (da 0 a 1, sul tempo cantato) perché dica SÌ: è una percentuale, quindi vale uguale
  // nelle partite corte (Lampo). La lucina sul tavolo dice già come la sta pensando.
  // (Nessuna soglia sotto 0.4: chi muove a caso, o resta fermo su una nota di mezzo, azzecca per
  // sbaglio un quarto del tempo, e non deve strappare neanche un SÌ.)
  siPerVincere: 3,
  giudici: [
    { nome: 'LA DIVA', soglia: 0.47, si: ['Tesoro, sei una stella!', 'Mi hai fatto venire i brividi.', 'Divino. Quasi come me.'], no: ['Per me è no, tesoro.', 'Mi si è sciolto il trucco.', 'Ho sentito di meglio in ascensore.'] },
    { nome: 'MC CATENA', soglia: 0.55, si: ['Bro, spacca!', 'Bootcamp!', 'Flow pulito, rispetto.'], no: ['Bro... no.', 'Zero flow.', 'Non ho parole... in senso brutto.'] },
    { nome: 'IL PRODUTTORE', soglia: 0.78, si: ['Si può lavorare.', 'Non male. Ho detto non male.', 'Firmate qui.'], no: ['Per me è no.', 'Ho un aereo da prendere.', 'Avanti il prossimo.'] },
    { nome: 'IL COMMOSSO', soglia: 0.4, si: ['Sto piangendo! Sì!', 'Mi avete toccato il cuore.', 'Che emozione, ragazzi!'], no: ['Piango... ma di dispiacere.', 'Mi dispiace tanto, è no.'] },
  ],
  frasiVittoria: ['SEI AI BOOTCAMP!'],
  frasiSconfitta: ['È UN NO PER ME'],
  frasiColpa: ['È colpa sua!', 'Ci ha dato la nota sbagliata!', 'Suonava un\'altra canzone!'],

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti, giudici) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { tolleranza: 0.36, grazia: 0.26, graziaSalto: 0.08, calamita: 0.75, scorrimento: 14, atti: { durate: 1.5, salto: 0.75 }, giudici: { soglia: 0.85 }, acuto: { tremoli: 1 } },
    difficile: { tolleranza: 0.26, grazia: 0.13, graziaSalto: 0.045, calamita: 0.5, scorrimento: 19, atti: { durate: 0.75, salto: 1.3 }, giudici: { soglia: 1.1 }, acuto: { tremoli: 3 } },
  },
};
