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
    'Evita naso, labbra, occhi, orecchie e nei',
  ],
  comandiTouch: [
    'In basso a sinistra: PENNELLO (schiuma) o RASOIO',
    'Col rasoio radi dove c\'è schiuma. PIANO!',
    'Evita naso, labbra, occhi, orecchie e nei',
  ],
  obiettivo: "Radi almeno l'80% della barba!",
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida). Stima: percentuale rasata (+ bonus tempo oltre il 98%): l'80% per vincere è l'argento.
  medaglie: { bronzo: 40, argento: 80, oro: 100 },
  soglia: 80,          // % per vincere
  sogliaFine: 98,      // % a cui il microgioco finisce in anticipo (bonus tempo)
  bonusPerSecondo: 2,  // punti per ogni secondo avanzato
  // --- attrezzi (misure in unità della faccia: 1 unità = 2 px di gioco) ---
  raggio: 5.5,           // raggio del rasoio (largo come la lama che si vede)
  raggioPennello: 9,     // raggio del pennello
  durataSchiuma: 15,     // secondi prima che la schiuma si secchi
  capienzaLama: 99999,   // celle di barba che la lama regge prima di intasarsi (in tutto sono circa 330):
                         //   tanto alto = non si intasa mai (la bacinella resta come arredo). Era 200
  velMax: 130,           // velocità massima del rasoio (unità/s): oltre, taglietto
  velMaxDito: 190,       // ...col dito, meno preciso del mouse e con passate più veloci
  velSussulto: 30,       // se la testa si sposta più veloce di così (unità/s) è uno scatto: per un quarto
                         //   di secondo, quello che finisce sotto il rasoio non conta come errore
  margineRincorsa: 1.5,  // ...e per 0,7 secondi il limite di velocità è più largo (x1,5): si rincorre la faccia
  sopraDito: 22,         // col dito l'attrezzo sta tante unità sopra il polpastrello (si vede la lama)
  penalitaTaglio: 1,     // secondi persi per un taglietto
  malusTaglio: 3,        // punti tolti a fine partita per ogni taglietto
  penalita: 1,           // secondi persi se tocchi naso, labbra, occhi, orecchie o un neo
  nei: 2,                // quanti nei spuntano (in posizioni casuali, sempre sulla pelle del viso)
  // ricrescita: probabilità (per tick da 0.25s) che una cella rasata confinante con barba
  // non rasata ricresca, a inizio e fine partita. 0 = spenta: la barba tagliata resta tagliata
  // (accesa, sembrava che in certi punti il rasoio non tagliasse)
  ricrescitaInizio: 0,
  ricrescitaFine: 0,
  // quanto si agita De Luca (ampiezza in px, rotazione in radianti) e ogni quanti secondi fa qualcosa
  agitazioneInizio: 2,
  agitazioneFine: 5,
  rotazioneFine: 0.06,
  eventoInizio: 4,
  eventoFine: 2.6,
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
    facile: { velMax: 160, velMaxDito: 230, agitazioneInizio: 1, agitazioneFine: 3, eventoInizio: 5, eventoFine: 3.5 },
    difficile: { velMax: 110, velMaxDito: 165, agitazioneInizio: 3, agitazioneFine: 6.5, eventoInizio: 3.2, eventoFine: 2 },
  },
};
