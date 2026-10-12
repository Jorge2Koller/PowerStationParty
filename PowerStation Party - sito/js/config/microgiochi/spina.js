// Configurazione del microgioco 'La Spina del PowerStation' (id: spina).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/SpinaScene.js; questa sezione arriva in CONFIG.microgiochi.spina.)
export default {
  titolo: 'La Spina del PowerStation',
  verbo: 'SPILLA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0xb5651d,
  ospite: { id: 'beppe', etichetta: 'CONTRO:\nBEPPE' },
  comandi: [
    'Tieni premuto SPAZIO per spillare',
    'Rilascia nella ZONA VERDE (al centro: PERFETTA!)',
    'Boccale e calice valgono di più: il calice è difficile',
  ],
  comandiTouch: [
    'Tieni il dito sullo schermo per spillare',
    'Alza il dito nella ZONA VERDE (al centro: PERFETTA!)',
    'Boccale e calice valgono di più: il calice è difficile',
  ],
  obiettivo: 'Fai più punti di Beppe!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Stima: Beppe in 35 s fa circa 19 pinte (114 punti); chi lo batte prende l'argento.
  medaglie: { bronzo: 80, argento: 120, oro: 170 },
  // i tre bicchieri: forma (largo, alto), ampiezza della zona verde (x), velocità (x) e punti
  bicchieri: {
    pinta: { largo: 1, alto: 1, zona: 1, vel: 1, punti: 5 },
    boccale: { largo: 1.25, alto: 1.1, zona: 1.1, vel: 0.7, punti: 8 },  // grande: si riempie piano
    calice: { largo: 0.8, alto: 1.05, zona: 0.55, vel: 1.15, punti: 9 }, // zona strettissima: il rischio
  },
  perfetta: 0.3,       // PERFETTA se si rilascia entro questa frazione dal centro della zona verde
  bonusPerfetta: 3,    // punti in più per una PERFETTA
  puntiBeppe: 6,       // punti che Beppe fa con ogni sua pinta
  // zona verde: ampiezza (frazione del bicchiere) a inizio e fine partita
  zonaInizio: 0.22,
  zonaFine: 0.13,
  // velocità di riempimento (bicchieri al secondo) a inizio e fine
  velInizio: 0.85,
  velFine: 1.1,
  penalita: 1.2,       // secondi persi per un bicchiere sbagliato
  // i tre atti: da quando (secondi), annuncio, secondi per pinta di Beppe, pausa dopo un bicchiere
  // buono, probabilità di calice e boccale, dispetti di Beppe
  atti: [
    { da: 0, nome: 'SPILLA!', beppe: 2.0, pausa: 0.35, calice: 0, boccale: 0 },
    { da: 12, nome: 'ORA DI PUNTA!', beppe: 1.8, pausa: 0.25, calice: 0.2, boccale: 0.3 },
    { da: 24, nome: 'BEPPE FA I DISPETTI!', beppe: 1.7, pausa: 0.25, calice: 0.25, boccale: 0.3, dispetti: true },
  ],
  dispettoOgni: 3.5,   // secondi (circa) tra un urto al bancone e l'altro
  durataUrto: 1.2,     // secondi in cui la zona verde balla
  ballaZona: 0.08,     // di quanto si sposta la zona verde (frazione del bicchiere)
  frasiBeppe: ['Tsk.', 'Lento...', 'Mah.', 'Dilettante.', 'Guagliò...'],
  frasiDispetto: ['Ops!', 'Scusa eh!', 'Mi è scappato!', 'Hehe.'],
  frasiClienti: ['Uè!', 'Ma dai!', "Un'altra!", 'Eh, oh!', 'Grande!', 'Mamma mia!', 'Offro io!', 'Ma che dici?!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { zonaInizio: 0.28, zonaFine: 0.18, velInizio: 0.75, velFine: 0.95, perfetta: 0.38, dispettoOgni: 5, ballaZona: 0.05 },
    difficile: { zonaInizio: 0.18, zonaFine: 0.1, velInizio: 0.95, velFine: 1.25, perfetta: 0.25, dispettoOgni: 2.6, ballaZona: 0.1 },
  },
};
