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
  // Revisione 4, la stessa scala per tutti (erano 100 / 190 / 280): gli ombrelloni salvati valgono
  // sempre di più (vedi bonusOmbrelloni), così salvarne 3 (l'obiettivo) va col bronzo.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoOmbrelloni: 3,
  // munizioni
  colpiMax: 5,            // (erano 6)
  colpiCassa: 4,          // colpi in una cassa del Generale (atterra da sola sul cannone)
  cassaOgni: 5.5,         // secondi tra una cassa e l'altra (erano 4,5)
  ricaricaLenta: 4.2,     // intanto, un colpo in più ogni tot secondi (erano 3,5)
  velMira: 230,           // tastiera: velocità del mirino (unità/s)
  // punti
  puntiAffondata: 10,
  bonusLontano: 5,        // ...se affondata lontano dalla riva (sopra yLontano)
  yLontano: 100,
  puntiRipreso: 5,        // ombrellone recuperato da una bagnarola in fuga
  // a fine partita, gli ombrelloni ancora piantati (da 0 a 5): sotto i 3 niente, poi sempre di più
  // (prima 15 a ombrellone)
  bonusOmbrelloni: [0, 0, 0, 40, 70, 100],
  // bagnarole: colpi per affondarle e lentezza rispetto alla velocità della fase
  hp: { gommone: 1, pedalo: 2, galeone: 3 },
  passo: { gommone: 1, pedalo: 0.9, galeone: 0.72 },
  // i tre atti: da quando (secondi), annuncio, secondi tra una bagnarola e l'altra, velocità,
  // quante al massimo in arrivo insieme, probabilità di pedalò e galeone, zig-zag,
  // e una bagnarola che arriva subito all'inizio dell'atto
  atti: [
    // (più difficile dopo la serata di prova: prima 2,4/1,7/1,1 secondi, velocità 17/22/28, zig-zag 0/10/20)
    { da: 0, intervallo: 2.1, vel: 19, maxBarche: 3, pedalo: 0.3, galeone: 0, zigzag: 6 },
    { da: 12, nome: 'ARRIVA IL GALEONE!', subito: 'galeone', intervallo: 1.5, vel: 25, maxBarche: 4, pedalo: 0.4, galeone: 0.25, zigzag: 14 },
    { da: 24, nome: 'ARREMBAGGIO!', intervallo: 1.0, vel: 31, maxBarche: 6, pedalo: 0.4, galeone: 0.35, zigzag: 24 },
  ],
  frasi: ['FUOCO!', 'Mirate alla chiglia!', 'Non un passo indietro!', 'Difendete gli ombrelloni!', 'Avanti, soldato!', 'Ricaricate!'],
  frasiCassa: ['Munizioni!', 'Prendi, soldato!', 'Al volo!'],
  frasiRubato: ['Il mio ombrellone!', 'Inseguiteli!', 'Vergogna!', 'Ritirata no!'],
  // i pirati sono inventati e buffi: nessuna bandiera o nazionalità vera
  frasiPirati: ['Arrr!', 'Questo è nostro!', 'Bottino!', 'Si va al largo!', 'Chi ha la crema solare?', 'Il mio pappagallo soffre il mal di mare!', 'Pedala, ciurma!', 'Ho perso una ciabatta!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { colpiMax: 7, ricaricaLenta: 3.2, cassaOgni: 4.5, atti: { intervallo: 1.2, vel: 0.85 } },
    difficile: { colpiMax: 4, ricaricaLenta: 5, cassaOgni: 6.5, atti: { intervallo: 0.88, vel: 1.12 } },
  },
};
