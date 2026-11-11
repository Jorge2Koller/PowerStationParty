// Configurazione del microgioco 'Guerra, via quelle mani!' (id: mani).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/ManiScene.js; questa sezione arriva in CONFIG.microgiochi.mani.)
export default {
  titolo: 'Guerra, via quelle mani!',
  verbo: 'SCIAF!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x2f8a5a,
  musica: 'comica',           // js/config/musiche.js
  ospite: { id: 'guerra', etichetta: 'OCCHIO A:\nGUERRA' },
  comandi: [
    'CLIC sulle mani di Guerra: schiaffo! (o i tasti 1-5: la mano su quel piatto)',
    'Se una mano prende un piatto, colpiscila per salvarlo. Col guanto: DUE schiaffi',
    'Il CAMERIERE porta piatti nuovi: difendi anche il suo vassoio!',
  ],
  comandiTouch: [
    'Tocca le mani di Guerra per dargli uno schiaffo (anche due insieme)',
    'Se una mano prende un piatto, colpiscila per salvarlo. Col guanto: DUE schiaffi',
    'Il CAMERIERE porta piatti nuovi: difendi anche il suo vassoio!',
  ],
  obiettivo: 'Salva almeno 3 piatti su 5!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4 (stessa scala per tutti: bronzo 100, argento 200, oro 300): erano 70 / 150 / 240.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  piattiMinimi: 3,
  // punti
  // (scheda di valutazione, "tendente al facile": lo schiaffo normale valeva 5 e il recupero 4, e anche
  //  chi giocava male arrivava all'argento; quello all'ultimo istante resta 8, così rischiare paga di più)
  puntiSchiaffo: 4,      // schiaffo normale
  puntiUltimo: 8,        // ...se la mano era a meno di "vicino" unità dal piatto
  puntiSalvato: 3,       // ...se stava già trascinando via un piatto: è un recupero, vale meno
                         //    (altrimenti converrebbe lasciarli prendere apposta)
  puntiGuanto: 2,        // guanto da forno tolto (primo schiaffo)
  // alla fine, i piatti ancora tuoi (da 0 a 5): sotto i 3 niente, poi sempre di più. Così salvarne
  // 3 è proprio il bronzo (prima: 15 punti a piatto, e si prendeva il bronzo anche con 2)
  bonusPiatti: [0, 0, 0, 50, 80, 120],
  vicino: 30,
  // schiaffi
  raggioSchiaffo: 15,    // quanto vicino al palmo bisogna cliccare (unità)
  raggioDito: 19,        // col dito un po' di più: è meno preciso del mouse
  bloccoVuoto: 0.7,      // secondi di mano dolorante dopo uno schiaffo a vuoto (era 0,6: scheda di valutazione)
  velRitiro: 420,        // velocità della mano che scappa dopo lo schiaffo
  // Fasi di difficoltà. "da" = secondo da cui vale la fase (in Lampo, più corto, in proporzione).
  //  maxMani = mani in giro insieme, vel = velocità delle mani (unità/s),
  //  intervallo = [min,max] secondi tra una mano e l'altra, tira = velocità con cui trascina un piatto,
  //  finta / guanto = probabilità (0-1); nome = l'annuncio (i tre atti)
  // (scheda di valutazione: "giusta, forse tendente al facile". Mani un 10% più svelte, un po' meno
  //  respiro tra una mano e l'altra, qualche guanto in più e i piatti trascinati via più in fretta, di
  //  più nel terzo atto: prima c'erano 4-5 secondi per riprenderli e chi giocava anche male li salvava tutti.
  //  Erano: vel 66 / 82 / 100 / 125 / 140, tira 22 / 26 / 32 / 40 / 45, intervalli [1.3, 1.7] /
  //  [1.0, 1.4] / [0.8, 1.1] / [0.55, 0.8] / [0.45, 0.65], guanto 0.25 / 0.2 / 0.25 dal 12° secondo)
  fasi: [
    { da: 0,  maxMani: 1, vel: 72,  intervallo: [1.2, 1.5],  tira: 26, finta: 0,    guanto: 0 },
    { da: 6,  maxMani: 2, vel: 90,  intervallo: [0.9, 1.25], tira: 31, finta: 0.15, guanto: 0 },
    { da: 12, nome: 'IL GUANTO DA FORNO!', maxMani: 3, vel: 110, intervallo: [0.75, 1.0], tira: 40, finta: 0.25, guanto: 0.3 },
    { da: 24, nome: 'GUERRA HA FAME!', maxMani: 4, vel: 138, intervallo: [0.5, 0.74], tira: 54, finta: 0.3, guanto: 0.25 },
    { da: 30, maxMani: 5, vel: 154, intervallo: [0.42, 0.6], tira: 62, finta: 0.3, guanto: 0.3 },
  ],
  // il cameriere (scheda 2: "aggiungere il cameriere che porta ulteriori piatti, mentre arriva il Guerra
  // tenta di rubare i piatti anche a lui"): arriva a questi secondi (in Lampo in proporzione) e porta un
  // piatto nuovo al posto di uno mangiato, o il dolce (puntiDolce) se non ne manca nessuno. Mentre
  // cammina, "mani" = probabilità che una mano nuova vada sul suo vassoio, a velMani della velocità
  cameriere: {
    quando: [9, 20, 28],
    vel: 70,                 // unità/s
    mani: 0.6,
    velMani: 0.8,
    puntiDolce: 15,
    frasi: ['Permesso, permesso!', 'Ecco a voi!', 'Attenzione, caldo!'],
    frasiConsegna: ['Buon appetito!', 'Prego, signori.', 'Offre la casa!'],
    frasiRubato: ['Ma signore!', 'Era per il tavolo!', 'Ancora lei?!'],
  },
  frasi: ['Solo un assaggio!', 'Ma questo lo lasci?', 'Una forchettata e basta!', 'Che fame...', 'Dai, dividiamo!', 'Non lo finisci?'],
  frasiSchiaffo: ['Ahia!', 'Che manesco!', 'Ma dai!', 'Ohi!', 'Che cattiveria...'],
  frasiFurto: ['Grazie!', 'Buonissimo!', 'Gnam!', 'Questo è mio!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { bloccoVuoto: 0.4, fasi: { vel: 0.85, intervallo: 1.2, tira: 0.8 } },
    difficile: { bloccoVuoto: 0.8, fasi: { vel: 1.15, intervallo: 0.85, tira: 1.15 } },
  },
};
