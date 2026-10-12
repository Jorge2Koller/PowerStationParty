// Configurazione del microgioco "Passa di qua" (id: passaseo).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/PassaseoScene.js; questa sezione arriva in CONFIG.microgiochi.passaseo.)
export default {
  titolo: 'Passa di qua',
  verbo: 'SCHIZZA!',        // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  musica: 'corsa',         // traccia di audio.js
  colore: 0xd83a3a,
  ospite: { id: 'passaseo', etichetta: 'IN BICI:\nPASSASEO' },
  comandi: [
    "FRECCE (o A/D), oppure il mouse: sterza. Pozzanghera accanto a un Passaseo: SPLASH!",
    "SPAZIO (o tasto destro): clacson, sbanda e non apre l'ombrello",
    'Non toccare i ciclisti: occhio al fango, alle Vespe e alla Golf',
  ],
  comandiTouch: [
    'Trascina il dito: sterzi. Pozzanghera accanto a un Passaseo: SPLASH!',
    "CLACSON (in basso a destra): sbanda e non apre l'ombrello",
    'Non toccare i ciclisti: occhio al fango, alle Vespe e alla Golf',
  ],
  obiettivo: 'Schizza almeno 10 Passaseo!',
  obiettivoSchizzi: 10,
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // (un giocatore automatico perfetto fa 800-1400 punti; 10 schizzi, la vittoria, sono circa 300)
  medaglie: { bronzo: 120, argento: 320, oro: 650 },
  // punti
  puntiSchizzo: 10,         // moltiplicato per la serie di schizzi di fila (fino a maxSerie)
  maxSerie: 5,
  puntiPozzanghera: 1,      // pozzanghera presa senza nessuno accanto
  malusCiclista: 10,
  malusVeicolo: 10,
  // guida
  velInizio: 165,           // velocità della strada (unità/s), a inizio e fine partita
  velFine: 255,
  velFreno: 35,             // dopo un tocco si scende a questa velocità...
  ripresa: 1.4,             // ...e si torna su in questi secondi
  velSterzo: 175,
  presaBagnato: 5,          // sotto l'acquazzone la Panda scivola (più basso = più scivolosa; all'asciutto è 30)
  guadagnoDito: 1.25,
  rallentaFango: 0.55,      // nel fango la strada va a questa frazione della velocità...
  durataFango: 1.2,         // ...per tanti secondi
  // ciclisti e pozzanghere
  distanzaPozza: 30,        // la pozzanghera è a tanto dal ciclista, verso il centro strada (le piccole un po' più vicino)
  ondeggioInizio: 2,        // il ciclista ondeggia di tanto (unità)...
  ondeggioFine: 6,          // ...e a fine partita di più
  bici: 0.35,               // velocità del ciclista rispetto alla strada
  trattore: 0.55,
  vespa: 95,                // la Vespa arriva contromano, con questa velocità in più
  golf: 150,                // e la Golf di ReGrorio ancora più forte
  // clacson e ombrello
  ricaricaClacson: 3,       // secondi tra un clacson e l'altro
  portataClacson: 150,      // si spaventano i ciclisti fino a tanto davanti alla Panda
  spavento: 0.9,            // secondi di sbandata...
  sbandata: 9,              // ...di tante unità verso il centro strada
  accorgeA: 120,            // chi ha l'ombrello si accorge della Panda quando è a tanto...
  tempoOmbrello: 0.55,      // ...e dopo tanti secondi lo apre (se non lo spaventi prima col clacson)
  // I tre atti: da = secondo d'inizio; intervallo = secondi tra un incontro e l'altro; le altre sono
  // probabilità: veicoli (un mezzo invece di un ciclista), golf (tra i mezzi), contromano (ciclista a
  // sinistra), gruppetto, fango, grande (pozzanghera grande invece che piccola), ombrello,
  // trafficoContromano (una Vespa arriva insieme alla pozzanghera contromano)
  atti: [
    { da: 0, nome: '', intervallo: 1.5, veicoli: 0.15, golf: 0, contromano: 0.3, gruppetto: 0, fango: 0, grande: 0.5, ombrello: 0, trafficoContromano: 0 },
    { da: 11, nome: 'ACQUAZZONE!', pioggia: true, intervallo: 1.1, veicoli: 0.15, golf: 0.2, contromano: 0.35, gruppetto: 0.1, fango: 0.22, grande: 0.45, ombrello: 0.35, trafficoContromano: 0.3 },
    { da: 23, nome: 'ARRIVA IL GRUPPETTO!', intervallo: 1.0, veicoli: 0.22, golf: 0.4, contromano: 0.4, gruppetto: 0.35, fango: 0.12, grande: 0.35, ombrello: 0.3, trafficoContromano: 0.5 },
  ],
  frasi: ['Ma dai!', 'Sono fradicio!', 'La mia divisa!', 'Ma guarda te!', 'Che doccia!', 'Passa di là!'],
  frasiSfiorato: ['Attento!', 'Piano!', 'Ehi!'],
  frasiClacson: ['Eh?!', 'Che spavento!', 'Uh!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { velInizio: 145, velFine: 215, tempoOmbrello: 0.8, ricaricaClacson: 2.2 },
    difficile: { velInizio: 185, velFine: 290, tempoOmbrello: 0.4, ricaricaClacson: 3.8 },
  },
};
