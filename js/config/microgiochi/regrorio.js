// Configurazione del microgioco 'Arriva ReGrorio!' (id: regrorio).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/RegrorioScene.js; questa sezione arriva in CONFIG.microgiochi.regrorio.)
export default {
  titolo: 'Arriva ReGrorio!',
  verbo: 'SCHIVA!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x3b6fd1,
  musica: 'corsa',         // traccia di audio.js
  ospite: { id: 'greg', etichetta: 'OCCHIO A:\nREGRORIO' },
  comandi: [
    'FRECCE SINISTRA/DESTRA: cambia corsia. SPAZIO: salta',
    'Il "!" dice dove passa la Golf: scansala all\'ultimo!',
    'Prendi le monete. La CORONA davanti alla Golf vale tanto',
  ],
  comandiTouch: [
    'Tocca a SINISTRA o a DESTRA: cambia corsia. In MEZZO: salta',
    'Il "!" dice dove passa la Golf: scansala all\'ultimo!',
    'Prendi le monete. La CORONA davanti alla Golf vale tanto',
  ],
  obiettivo: 'Sopravvivi alla Golf del Re!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Punti: secondi vivi + monete + corone + schivate all'ultimo, e arrivare in fondo vale bonusSalvo.
  // Revisione 4, la stessa scala per tutti (erano 40 / 70 / 100, con lo "zero" a 20): ora arrivare
  // in fondo è il bronzo, e chi va K.O. resta sotto anche se ha preso tante monete.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  vite: 3,
  bonusSalvo: 60,         // arrivato in fondo senza K.O.
  bonusSchivata: 4,       // punti per ogni schivata all'ultimo istante (era 2)
  finestraSchivata: 0.35, // secondi: quanto "all'ultimo" deve essere
  durataSalto: 0.55,
  // --- monete e corone ---
  puntiMoneta: 2,         // (era 1)
  puntiCorona: 12,        // (era 6)
  primeMonete: 2,         // secondi prima della prima fila di monete
  ogniMonete: [1.6, 2.6], // secondi tra una fila e l'altra
  filaMonete: [3, 5],     // quante monete in una fila
  passoMonete: 22,        // distanza tra le monete di una fila (px)
  velMonete: 150,         // px/s
  anticipoCorona: 66,     // px davanti al centro della Golf: la corona arriva un attimo prima della macchina
  // Fasi di difficoltà. "da" = secondo da cui vale la fase; "nome" = l'annuncio.
  //  vel = px/s, avviso = secondi di preavviso, intervallo = [min,max] tra un passaggio e l'altro,
  //  dalBasso / finta / doppia / corona = probabilità (0-1)
  fasi: [
    { da: 0,  vel: 200, avviso: 0.95, intervallo: [1.9, 2.3],  dalBasso: 0,    finta: 0,    doppia: 0,   corona: 0.3 },
    { da: 8,  nome: 'ARRIVA DA DIETRO!', vel: 270, avviso: 0.8,  intervallo: [1.3, 1.7],  dalBasso: 0.3,  finta: 0,    doppia: 0,   corona: 0.3 },
    { da: 16, nome: 'FA LE FINTE!', vel: 320, avviso: 0.7,  intervallo: [1.1, 1.4],  dalBasso: 0.25, finta: 0.5,  doppia: 0,   corona: 0.3 },
    { da: 25, nome: 'IL RE SI ARRABBIA!', arrabbiato: true, vel: 380, avviso: 0.55, intervallo: [0.6, 0.9],  dalBasso: 0.25, finta: 0.3,  doppia: 0.3, corona: 0.25 },
  ],
  frasiBotto: ['BONK!', 'SBAM!', 'PATAPUM!', 'STONK!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { vite: 4, fasi: { vel: 0.85, avviso: 1.25, intervallo: 1.2 } },
    difficile: { fasi: { vel: 1.12, avviso: 0.85, intervallo: 0.88 } },
  },
};
