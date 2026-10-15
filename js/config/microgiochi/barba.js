// Configurazione del microgioco "La Barba di O'Sfurnacchiat" (id: barba).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/; questa sezione arriva in CONFIG.microgiochi.barba.)
export default {
  titolo: "La Barba di O'Sfurnacchiat",
  verbo: 'RADI!',           // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0xc0392b,
  ospite: { id: 'marco', etichetta: "IL CLIENTE:\nO'SFURNACCHIAT" },
  comandi: [
    'TASTO DESTRO (o CTRL+clic): stendi la schiuma',
    'TASTO SINISTRO: radi dove c\'è schiuma. PIANO!',
    'Evita naso, labbra, occhi e nei. LAMA PIENA: sciacquala nella bacinella',
  ],
  comandiTouch: [
    'In basso a sinistra: PENNELLO (schiuma) o RASOIO',
    'Col rasoio radi dove c\'è schiuma. PIANO!',
    'Evita naso, labbra, occhi e nei. LAMA PIENA: sciacquala nella bacinella',
  ],
  obiettivo: "Radi almeno il 70% della barba!",
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 50 / 85 / 102, e si vinceva con l'85%: il bronzo
  // arrivava senza la vittoria). Ora: il 70% rasato è il bronzo; la barba finita (98%) proprio allo
  // scadere è l'argento; finita con una dozzina di secondi d'anticipo, l'oro.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  soglia: 70,          // % per vincere (era 85)
  sogliaFine: 98,      // % a cui il microgioco finisce in anticipo (barba finita: bonus e bonus tempo)
  puntiPercento: 1.45, // punti per ogni % di barba rasata (era 1)
  bonusFinita: 60,     // la barba finita (arrivata al 98%)
  bonusPerSecondo: 8,  // punti per ogni secondo avanzato (era 2)
  // --- attrezzi (misure in unità della faccia: 1 unità = 2 px di gioco) ---
  raggio: 5.5,           // raggio del rasoio (largo come la lama che si vede)
  raggioPennello: 9,     // raggio del pennello
  durataSchiuma: 11,     // secondi prima che la schiuma si secchi (era 15)
  capienzaLama: 100,     // celle di barba che la lama regge prima di intasarsi (in tutto sono circa 330: tre
                         //   sciacqui nella bacinella per una barba intera). 99999 = non si intasa mai
  velMax: 118,           // velocità massima del rasoio (unità/s): oltre, taglietto (era 130)
  velMaxDito: 172,       // ...col dito, meno preciso del mouse e con passate più veloci (era 190)
  velSussulto: 30,       // se la testa si sposta più veloce di così (unità/s) è uno scatto: per un quarto
                         //   di secondo, quello che finisce sotto il rasoio non conta come errore
  margineRincorsa: 1.5,  // ...e per 0,7 secondi il limite di velocità è più largo (x1,5): si rincorre la faccia
  sopraDito: 22,         // col dito l'attrezzo sta tante unità sopra il polpastrello (si vede la lama)
  penalitaTaglio: 1,     // secondi persi per un taglietto
  malusTaglio: 6,        // punti tolti a fine partita per ogni taglietto (era 3)
  penalita: 1,           // secondi persi se tocchi naso, labbra, occhi, orecchie o un neo
  nei: 3,                // quanti nei spuntano (erano 2) (in posizioni casuali, sempre sulla pelle del viso)
  // ricrescita: probabilità (per tick da 0.25s) che una cella rasata confinante con barba
  // non rasata ricresca, a inizio e fine partita. 0 = spenta: la barba tagliata resta tagliata
  // (accesa, sembrava che in certi punti il rasoio non tagliasse)
  ricrescitaInizio: 0,
  ricrescitaFine: 0,
  // quanto si agita De Luca (ampiezza in px, rotazione in radianti) e ogni quanti secondi fa qualcosa
  agitazioneInizio: 2.5,   // (erano 2, 5, 4 e 2,6)
  agitazioneFine: 6,
  rotazioneFine: 0.06,
  eventoInizio: 3.5,
  eventoFine: 2.2,
  // i tre atti (solo gli annunci: l'agitazione cresce da sola dall'inizio alla fine)
  atti: [
    { da: 0, nome: '' },
    { da: 12, nome: 'DE LUCA SI AGITA!' },
    { da: 24, nome: 'CHIACCHIERA E SBADIGLIA!' },
  ],
  chiacchiere: ['E poi gli ho detto...', "Uè, fai piano!", 'Ma lo sai che...', "'O ssaje comm'è...", 'Senti questa!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { velMax: 150, velMaxDito: 215, agitazioneInizio: 1.5, agitazioneFine: 4, eventoInizio: 4.5, eventoFine: 3.2, capienzaLama: 140, durataSchiuma: 14 },
    difficile: { velMax: 105, velMaxDito: 155, agitazioneInizio: 3.2, agitazioneFine: 7, eventoInizio: 3, eventoFine: 1.9, capienzaLama: 80, durataSchiuma: 9 },
  },
};
