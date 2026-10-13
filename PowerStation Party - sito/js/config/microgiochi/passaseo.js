// Configurazione del microgioco "Il Passo del Passaseo" (id: passaseo): la salita in bici.
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/PassaseoScene.js; questa sezione arriva in CONFIG.microgiochi.passaseo.)
// Prima era "Passa di qua" (in Panda tra le pozzanghere): rifatto dopo la serata di prova.
export default {
  titolo: 'Il Passo del Passaseo',
  verbo: 'PEDALA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  musica: 'corsa',          // traccia di audio.js
  colore: 0x2f8a4a,
  ospite: { id: 'passaseo', etichetta: 'TESTA A TESTA:\nPASSASEO' },
  comandi: [
    'FRECCE SINISTRA e DESTRA (o A e D), una alla volta: pedali',
    'A TEMPO: quando la pallina in basso arriva sul pedale. A caso si va piano',
    'Prima del TORNANTE il ritmo rallenta: seguilo, o vai largo! Allo SPRINT, tutto',
  ],
  comandiTouch: [
    'Tocca la metà SINISTRA e la DESTRA dello schermo, una alla volta: pedali',
    'A TEMPO: quando la pallina in basso arriva sul pedale. A caso si va piano',
    'Prima del TORNANTE il ritmo rallenta: seguilo, o vai largo! Allo SPRINT, tutto',
  ],
  obiettivo: 'Arriva in cima prima del Passaseo!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // (tarate coi giocatori automatici: quello bravo arriva in cima in 30 s e fa circa 310, quello a
  // caso 25-30, chi sta fermo 0)
  medaglie: { bronzo: 110, argento: 220, oro: 290 },
  // punti: i metri fatti, le pedalate perfette (allo sprint doppie) e, se batti il Passaseo, un
  // premio più tanto per ogni secondo di vantaggio
  punti: { metro: 0.2, perfetta: 2, vittoria: 50, secondo: 10 },

  // --- la salita ---
  // la lunghezza si adatta: il Passaseo, col suo passo, arriva in cima tra questi secondi (dal seme)
  arrivoPassaseo: [32.6, 33.8],
  passoPassaseo: [0.8, 0.85],     // il Passaseo va a questa frazione della velocità di chi pedala perfetto
  lunghezze: { tornante: 26, sprint: 110 },   // (in proporzione: poi la salita si allunga tutta insieme)
  avvicinamento: 34,              // metri prima di un tornante in cui il ritmo rallenta già
  pendenze: { salita: 0.06, tornante: 0.02, strappo: 0.13, sprint: 0.04 },
  nomiAtti: ['', 'I TORNANTI!', 'STRAPPO E SPRINT!'],

  // --- pedalare ---
  vel: { salita: 30, tornante: 15, strappo: 17, sprint: 38 },     // velocità con la spinta piena (metri al secondo)
  cadenza: { salita: 2.2, tornante: 1.35, strappo: 1.55, sprint: 2.9 },   // pedalate al secondo (il ritmo)
  finestre: { perfetta: 0.075, buona: 0.15 },   // quanto si può sbagliare il tempo (secondi, prima o dopo)
  finestraStrappo: 0.8,           // sugli strappi le finestre sono più strette (x)
  // ogni pedalata porta la spinta (da 0 a 1) verso il suo valore: perfetta 1, buona 0,75, a vuoto
  // (fuori tempo o col pedale sbagliato) giù. Senza pedalare, dopo un po' la spinta cala
  potenza: { perfetta: 1, buona: 0.75, vuoto: -0.35 },
  spinta: { presa: 0.45, cala: 0.8 },
  accelera: 1.5,                  // quanto in fretta si prende velocità (al secondo)...
  frena: 2.2,                     // ...e quanto in fretta si perde
  tornanteMax: 21,                // chi entra in un tornante più veloce di così va LARGO...
  largo: 0.45,                    // ...e resta con tanto della sua velocità

  frasiPassaseo: ['In salita sono un fulmine!', 'Respira col naso!', 'Che bel panorama, eh?', 'Su, su, su!', 'Questa la faccio ogni domenica.'],
  frasiSorpasso: ['Ciao ciao!', 'Ti aspetto in cima!', 'Passo io!'],
  frasiSorpassato: ['Ehi! Da dove sbuchi?', 'Ma che gambe hai?', 'Non vale, hai la bici nuova!'],
  frasiVince: ['Torna quando hai le gambe!', 'Tutta questione di fiato.', 'Ci vediamo al prossimo passo!'],
  frasiPerde: ['Mi si è scaricata la borraccia...', 'Ho bucato, giuro.', 'Rivincita in discesa!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto dentro un oggetto si unisce campo per campo (valori assoluti).
  livelli: {
    facile: { passoPassaseo: [0.74, 0.78], finestre: { perfetta: 0.095, buona: 0.18 }, tornanteMax: 24 },
    difficile: { passoPassaseo: [0.86, 0.9], finestre: { perfetta: 0.06, buona: 0.12 }, tornanteMax: 19 },
  },
};
