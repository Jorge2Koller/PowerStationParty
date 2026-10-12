// Il Bancone: le Pinte che si guadagnano giocando si spendono qui (js/scenes/bancone.js).
// Si comprano costumi (per i personaggi), temi (lo sfondo delle schermate), frasi di sfottò e,
// quando arriveranno, modalità nuove. I personaggi giocabili sono tutti già disponibili: non si
// comprano. Le Pinte sono una per telefono o computer (non per giocatore).
export default {
  // quante Pinte si guadagnano
  pinte: {
    medaglia: { bronzo: 1, argento: 2, oro: 3 },   // a ogni turno, con la medaglia presa
    sfida: 3,                                      // a fine sfida...
    round: 1,                                      // ...più una per ogni round giocato
    giorno: 5,                                     // la prima sfida del giorno finita, ogni giorno
  },
  // costumi: si comprano una volta e si mettono a qualunque personaggio giocabile (uno a testa).
  // "aspetto" sono le proprietà del disegno del personaggio (js/grafica/personaggi.js) che cambiano
  costumi: [
    { id: 'occhialiSole', nome: 'Occhiali da sole', costo: 10, aspetto: { occhiali: { montatura: '#121216', lenti: '#1c2029' } } },
    { id: 'cuffie', nome: 'Cuffie da DJ', costo: 15, aspetto: { cuffie: true } },
    { id: 'bandana', nome: 'Bandana da motociclista', costo: 15, aspetto: { cappello: { tipo: 'bandana', colore: '#2f5fc0', fantasia: '#ffffff' } } },
    { id: 'basco', nome: 'Basco da generale', costo: 20, aspetto: { cappello: { tipo: 'basco', colore: '#c0392b', stemma: '#ffe14a' } } },
    { id: 'occhialiRosa', nome: 'Occhiali rosa', costo: 20, aspetto: { occhiali: { tondi: true, montatura: '#ff7ac8', lenti: '#ff9ac4', trasparenza: 0.45 } } },
    { id: 'cappuccio', nome: 'Cappuccio in incognito', costo: 25, aspetto: { cappuccio: '#3e4452' } },
    { id: 'corona', nome: 'Corona del Re', costo: 40, opzioni: { corona: true } },
  ],
  // temi: il disegno dello sfondo delle schermate (i colori restano quelli di ogni schermata)
  temi: [
    { id: 'raggi', nome: 'Raggi (quello di sempre)', costo: 0 },
    { id: 'pois', nome: 'Pois', costo: 15 },
    { id: 'scacchi', nome: 'Scacchi', costo: 15 },
    { id: 'strisce', nome: 'Strisce', costo: 20 },
    { id: 'stelle', nome: 'Cielo stellato', costo: 25 },
  ],
  // pacchetti di frasi di sfottò per la classifica finale (si aggiungono a quelle di sempre)
  frasi: [
    { id: 'bar', nome: 'Frasi da bar', costo: 10, frasi: [
      '{ultimo}, al bar ti fanno ancora pagare il caffè di ieri.',
      '{primo} offre da bere, {ultimo} lava i bicchieri.',
      '{ultimo}, stasera Beppe ti spilla solo la schiuma.',
      '{primo} al bancone, {ultimo} in cantina a cambiare i fusti.',
    ] },
    { id: 'sport', nome: 'Telecronaca', costo: 15, frasi: [
      'Che partita! {primo} in fuga, {ultimo} si ritira ai box.',
      '{ultimo} esce dal campo tra i fischi del pubblico.',
      'Gol di {primo}! {ultimo} guarda il pallone passare.',
      '{primo} alza la coppa, {ultimo} raccoglie i coriandoli.',
    ] },
    { id: 'nonna', nome: 'Le frasi della nonna', costo: 15, frasi: [
      '{ultimo}, mangia di più che sei sciupato. E gioca meglio.',
      '{primo}, bravo! {ultimo}, la prossima volta va meglio, tesoro.',
      '{ultimo}, ai miei tempi a quest\'ora si era già a letto.',
      'Hai visto {primo}? Impara, {ultimo}, impara.',
    ] },
  ],
  // modalità nuove (js/config/modalita.js). Con "presto: true" si vedono ma non si comprano ancora
  modalita: [
    { id: 'lampo', nome: 'Modalità Lampo', costo: 30 },
    { id: 'solitario', nome: 'Da solo: 4 vite e il boss', costo: 30 },
  ],
};
