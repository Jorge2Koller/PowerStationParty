// Configurazione del microgioco 'TorRONDAcelli' (id: ronda).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/RondaScene.js; questa sezione arriva in CONFIG.microgiochi.ronda.)
export default {
  titolo: 'TorRONDAcelli',
  verbo: 'SPARA!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x2f8fd0,
  musica: 'marcia',        // la marcia del Generale (traccia di audio.js)
  ospite: { id: 'generale', etichetta: 'AGLI ORDINI\nDEL GENERALE' },
  comandi: [
    'Il mouse mira, il CLIC spara (oppure FRECCE + SPAZIO). I colpi sono pochi!',
    'Affonda le bagnarole prima che tocchino riva: lontano vale di più',
    'Se rubano un ombrellone, affondali mentre scappano per riaverlo',
  ],
  comandiTouch: [
    'Tocca il mare: il cannone spara lì. I colpi sono pochi!',
    'Affonda le bagnarole prima che tocchino riva: lontano vale di più',
    'Se rubano un ombrellone, affondali mentre scappano per riaverlo',
  ],
  obiettivo: 'Salva almeno 3 ombrelloni su 5!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: 10-15 per bagnarola + 15 per ombrellone rimasto (un giocatore perfetto ne fa circa 400).
  medaglie: { bronzo: 100, argento: 200, oro: 320 },   // (giocatore automatico con la mira perfetta: 375-390)
  obiettivoOmbrelloni: 3,
  // munizioni
  colpiMax: 6,
  colpiCassa: 4,          // colpi in una cassa del Generale (atterra da sola sul cannone)
  cassaOgni: 4.5,         // secondi tra una cassa e l'altra
  ricaricaLenta: 3.5,     // intanto, un colpo in più ogni tot secondi
  velMira: 230,           // tastiera: velocità del mirino (unità/s)
  // punti
  puntiAffondata: 10,
  bonusLontano: 5,        // ...se affondata lontano dalla riva (sopra yLontano)
  yLontano: 100,
  puntiRipreso: 5,        // ombrellone recuperato da una bagnarola in fuga
  puntiOmbrellone: 15,    // a fine partita, per ogni ombrellone ancora piantato
  // bagnarole: colpi per affondarle e lentezza rispetto alla velocità della fase
  hp: { gommone: 1, pedalo: 2, galeone: 3 },
  passo: { gommone: 1, pedalo: 0.9, galeone: 0.72 },
  // i tre atti: da quando (secondi), annuncio, secondi tra una bagnarola e l'altra, velocità,
  // quante al massimo in arrivo insieme, probabilità di pedalò e galeone, zig-zag,
  // e una bagnarola che arriva subito all'inizio dell'atto
  atti: [
    { da: 0, intervallo: 2.4, vel: 17, maxBarche: 2, pedalo: 0.25, galeone: 0, zigzag: 0 },
    { da: 12, nome: 'ARRIVA IL GALEONE!', subito: 'galeone', intervallo: 1.7, vel: 22, maxBarche: 4, pedalo: 0.35, galeone: 0.2, zigzag: 10 },
    { da: 24, nome: 'ARREMBAGGIO!', intervallo: 1.1, vel: 28, maxBarche: 6, pedalo: 0.4, galeone: 0.3, zigzag: 20 },
  ],
  frasi: ['FUOCO!', 'Mirate alla chiglia!', 'Non un passo indietro!', 'Difendete gli ombrelloni!', 'Avanti, soldato!', 'Ricaricate!'],
  frasiCassa: ['Munizioni!', 'Prendi, soldato!', 'Al volo!'],
  frasiRubato: ['Il mio ombrellone!', 'Inseguiteli!', 'Vergogna!', 'Ritirata no!'],
  frasiPirati: ['Arrr!', 'Questo è nostro!', 'Bottino!', 'Si va al largo!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { colpiMax: 8, ricaricaLenta: 2.8, atti: { intervallo: 1.2, vel: 0.85 } },
    difficile: { colpiMax: 5, ricaricaLenta: 4.2, atti: { intervallo: 0.88, vel: 1.12 } },
  },
};
