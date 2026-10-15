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
  obiettivo: "Radi almeno il 75% della barba!",
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 50 / 85 / 102, e si vinceva con l'85%: il bronzo
  // arrivava senza la vittoria). Poi più difficile (l'utente: "molto semplice"): il 75% rasato è il
  // bronzo; la barba finita (98%) proprio allo scadere è l'argento; finita con una decina di
  // secondi d'anticipo, l'oro.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  soglia: 75,          // % per vincere (era 70; all'inizio 85)
  sogliaFine: 98,      // % a cui il microgioco finisce in anticipo (barba finita: bonus e bonus tempo)
  puntiPercento: 1.34, // punti per ogni % di barba rasata (75% = 101, 74% = 99; era 1,45 col 70%)
  bonusFinita: 60,     // la barba finita (arrivata al 98%)
  bonusPerSecondo: 8,  // punti per ogni secondo avanzato (era 2)
  // --- attrezzi (misure in unità della faccia: 1 unità = 2 px di gioco) ---
  raggio: 5.5,           // raggio del rasoio (largo come la lama che si vede)
  raggioPennello: 9,     // raggio del pennello
  durataSchiuma: 8,      // secondi prima che la schiuma si secchi (era 11; all'inizio 15)
  capienzaLama: 75,      // celle di barba che la lama regge prima di intasarsi (in tutto sono circa 330: quattro
                         //   sciacqui nella bacinella per una barba intera; era 100). 99999 = non si intasa mai
  velMax: 104,           // velocità massima del rasoio (unità/s): oltre, taglietto (era 118; all'inizio 130)
  velMaxDito: 152,       // ...col dito, meno preciso del mouse e con passate più veloci (era 172)
  velSussulto: 30,       // se la testa si sposta più veloce di così (unità/s) è uno scatto: per un quarto
                         //   di secondo, quello che finisce sotto il rasoio non conta come errore
  margineRincorsa: 1.5,  // ...e per 0,7 secondi il limite di velocità è più largo (x1,5): si rincorre la faccia
  sopraDito: 22,         // col dito l'attrezzo sta tante unità sopra il polpastrello (si vede la lama)
  penalitaTaglio: 1,     // secondi persi per un taglietto
  malusTaglio: 6,        // punti tolti a fine partita per ogni taglietto (era 3)
  penalita: 1,           // secondi persi se tocchi naso, labbra, occhi, orecchie o un neo
  nei: 4,                // quanti nei spuntano (erano 3, all'inizio 2) (in posizioni casuali, sempre sulla pelle del viso)
  // ricrescita: probabilità (per tick da 0.25s) che una cella rasata confinante con barba
  // non rasata ricresca, a inizio e fine partita. 0 = spenta: la barba tagliata resta tagliata
  // (accesa, sembrava che in certi punti il rasoio non tagliasse)
  ricrescitaInizio: 0,
  ricrescitaFine: 0,
  // quanto si agita De Luca (ampiezza in px, rotazione in radianti) e ogni quanti secondi fa qualcosa
  agitazioneInizio: 3,     // (erano 2,5, 6, 0,06, 3,5 e 2,2; all'inizio 2, 5, 4 e 2,6)
  agitazioneFine: 7.5,
  rotazioneFine: 0.08,
  eventoInizio: 3,
  eventoFine: 1.7,
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
    facile: { velMax: 135, velMaxDito: 195, agitazioneInizio: 2, agitazioneFine: 5, eventoInizio: 4, eventoFine: 2.8, capienzaLama: 110, durataSchiuma: 12, nei: 3 },
    difficile: { velMax: 92, velMaxDito: 135, agitazioneInizio: 3.6, agitazioneFine: 8.5, eventoInizio: 2.6, eventoFine: 1.4, capienzaLama: 60, durataSchiuma: 6.5, nei: 5 },
  },
};
