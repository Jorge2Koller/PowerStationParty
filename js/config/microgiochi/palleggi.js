// Configurazione del microgioco 'MaraZio' (id: palleggi).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/PalleggiScene.js; questa sezione arriva in CONFIG.microgiochi.palleggi.)
export default {
  titolo: 'MaraZio',
  verbo: 'PALLEGGIA!',      // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x4a9a3a,
  ospite: { id: 'zio', etichetta: 'SFIDA\nLO ZIO' },
  comandi: [
    'FRECCE (o A/D) o il mouse: muoviti. SPAZIO o CLIC: calcia',
    'Calcia quando il pallone arriva al piede: più sei preciso, più sale dritto',
    "Conta la serie più lunga: da 12 di fila in su vale tanto. Il pallone d'oro vale 20!",
  ],
  comandiTouch: [
    'Trascina il dito sul prato: ti muovi. CALCIA: calcia',
    'Calcia quando il pallone arriva al piede: più sei preciso, più sale dritto',
    "Conta la serie più lunga: da 12 di fila in su vale tanto. Il pallone d'oro vale 20!",
  ],
  obiettivo: 'Fai una serie di almeno 12 palleggi!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 180 / 380 / 600): una serie di 12 (l'obiettivo) è
  // il bronzo, di 17-18 l'argento, di 22 l'oro. Conta soprattutto la serie migliore: chi fa tante
  // serie corte, senza mai arrivare a 12, resta sotto il bronzo.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoSerie: 12,
  // punti
  puntiPalleggio: 1,      // un palleggio, per il moltiplicatore della serie (era 10)
  ogniSerie: 5,           // il moltiplicatore sale di 0,5 ogni tanti palleggi di fila...
  maxMoltiplicatore: 3,   //   ...fino a questo
  bonusPerfetto: 1,       // (era 5)
  // a fine partita, la serie migliore: sotto l'obiettivo bonusSotto a palleggio; arrivati
  // all'obiettivo bonusObiettivo, più bonusOltre per ogni palleggio in più (prima: 5 a palleggio)
  bonusSotto: 4,
  bonusObiettivo: 70,
  bonusOltre: 15,
  puntiOro: 20,           // il pallone d'oro colpito (era 25)
  // fisica (unità e secondi)
  gravita: 300,
  // velocità verso l'alto e spinta di lato per ogni tipo di colpo: [vy, vx minima, vx massima]
  colpi: { perfetto: [232, 0, 10], buono: [215, 18, 42], scarso: [192, 45, 78] },
  // zona del colpo: quanto sopra (e sotto) al piede può essere il pallone, e quanto lontano
  sopra: 34, sotto: 10, portata: 24,
  perfetto: { altezza: 8, distanza: 9 },
  buono: { altezza: 18, distanza: 16 },
  velGiocatore: 210,
  guadagnoDito: 1.2,
  ricarica: 0.3,          // secondi prima di poter calciare di nuovo dopo un colpo a vuoto
  // i tre atti: da quando (secondi), annuncio, gravità (x), vento (spinta di lato, unità/s²),
  // palloni d'oro dello Zio
  atti: [
    { da: 0, gravita: 1, vento: 0 },
    { da: 12, nome: 'TIRA VENTO!', gravita: 1.08, vento: 22 },
    { da: 24, nome: "IL PALLONE D'ORO!", gravita: 1.15, vento: 18, oro: true },
  ],
  cambioVento: [2.5, 4],  // secondi tra un cambio di verso del vento e l'altro
  ogniOro: 3.2,           // secondi tra un pallone d'oro e l'altro (dopo che il precedente è sparito)
  voloOro: 1.5,           // secondi di volo del pallone d'oro, dal piede dello Zio al piede del giocatore
  // mentre palleggia (ogni 5-8 secondi)
  frasi: ['Se avevo le ginocchia buone giocavo in Serie A', 'Io non sbaglio mai.', 'Visto? Facile.', 'Palla incollata al piede.', 'Mai sbagliato in vita mia.', 'Guarda e impara.'],
  // quando ti cade il pallone
  frasiErrore: ['Popone', 'Sei più scarso di Lautaro', "Te l'avevo detto...", 'Ahia.', 'Guarda me!', 'Piede di legno!', 'Si ricomincia.'],
  frasiLancioOro: ['Prendi questo!', 'Vediamo se ci arrivi!', 'Uno per te!'],
  frasiOro: ['Fortuna.', 'Mah, passabile.', 'Ok, ok...'],
  // alla fine: se vince lui, e se vinci tu
  fraseZioVince: "So' bono tanto",
  fraseZioPerde: 'Quasi bravo quanto me!',
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { perfetto: { altezza: 10, distanza: 11 }, buono: { altezza: 21, distanza: 19 }, atti: { gravita: 0.95, vento: 0.6 } },
    difficile: { perfetto: { altezza: 6.5, distanza: 7.5 }, buono: { altezza: 15, distanza: 13 }, atti: { gravita: 1.05, vento: 1.4 } },
  },
};
