// Configurazione del microgioco 'Emilio in Retromarcia' (id: retromarcia).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/RetromarciaScene.js; questa sezione arriva in CONFIG.microgiochi.retromarcia.)
export default {
  titolo: 'Emilio in Retromarcia',
  verbo: 'SPINGI!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x6a8f3a,
  musica: 'rock',          // l'autoradio di Emilio (traccia di audio.js)
  ospite: { id: 'emilio', etichetta: 'AL VOLANTE:\nEMILIO' },
  cast: ['pastaffi'],      // altri personaggi della storia: chi li sceglie qui gioca "contro se stesso"
  comandi: [
    'FRECCE (o WASD), oppure clic sul vialetto: muoviti',
    'Cammina contro un cane: lo spingi via dalla ZONA ROSSA dietro la macchina',
    'SPAZIO o tasto destro: lancia biscotti e palline. BIP BIP: la macchina parte!',
  ],
  comandiTouch: [
    'Trascina il dito sul vialetto: ti muovi',
    'Cammina contro un cane: lo spingi via dalla ZONA ROSSA dietro la macchina',
    'Tocca biscotto o pallina, poi dove lanciarli. BIP BIP: la macchina parte!',
  ],
  obiettivo: 'Fai uscire Emilio dal cancello senza toccare i cani!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Stima: uscire vale 40, più 20 per vita rimasta, più 10 per ogni cane salvato all'ultimo.
  medaglie: { bronzo: 60, argento: 110, oro: 160 },   // (chi sta fermo perde le 3 vite: 0)
  // --- vite e punti ---
  vite: 3,                 // spaventi che ti puoi permettere (al terzo la partita finisce)
  unitaMetro: 10,          // quante unità di schermo fanno un metro (il vialetto è lungo 25 metri)
  puntiMetro: 0,           // punti per ogni metro fatto dalla macchina (era 4: chi stava fermo prendeva punti)
  bonusSalvataggio: 10,    // per ogni cane tolto dalla zona rossa all'ultimo istante
  vicino: 28,              // "all'ultimo istante" = la coda era a meno di tante unità dal cane, con la macchina in moto o in partenza
  attesaSalvataggio: 2.5,  // lo stesso cane non dà un altro bonus prima di tanti secondi
  bonusUscita: 40,         // se Emilio esce dal cancello
  bonusVita: 20,           // per ogni vita rimasta (solo se Emilio esce dal cancello)
  // --- il giocatore ---
  velGiocatore: 104,       // velocità (unità/s)
  raggioSpinta: 15,        // quanto vicino devi passare a un cane per spingerlo
  velSpinta: 80,           // velocità del cane appena spinto (unità/s)...
  durataSpinta: 0.7,       //   ...per tanti secondi, rallentando: fa una trentina di unità
  spintaFuori: 0.45,       // un cane spinto dentro la corsia della macchina devia di tanto verso il bordo più vicino (0 = va solo dove lo spingi)
  // --- lanci e munizioni ---
  munizioni: { biscotto: 2, pallina: 2 },   // con quante cominci
  maxMunizioni: 4,         // quante ne puoi tenere, per tipo
  gittataTasto: 80,        // quanto lontano va il lancio con SPAZIO (in avanti, dove guardi)
  gittataMax: 150,         // il lancio più lungo (col mouse o col dito non si va oltre)
  durataOggetto: 7,        // secondi che biscotto o pallina restano a terra se nessuno li prende
  mangia: 2.4,             // secondi che il goloso ci mette a finire il biscotto
  giocaPallina: 3.6,       // secondi che l'altro si tiene la pallina
  nuoveInizio: 4.5,        // ogni quanti secondi compare una munizione da raccogliere, a inizio partita...
  nuoveFine: 3.5,          //   ...e a fine partita
  maxInGiro: 2,            // quante ce ne possono essere in giro da raccogliere
  // --- la macchina di Emilio ---
  primaPartenza: 2,        // secondi prima del primo movimento
  velInizio: 15,           // velocità di uno scatto (unità/s), a inizio partita...
  velFine: 28,             //   ...e a fine partita (ogni scatto varia del 20% in più o in meno)
  scatto: [1.1, 2.2],      // quanto dura uno scatto (secondi): tra questo e questo
  pausaInizio: 1.3,        // quanto sta ferma tra uno scatto e l'altro, a inizio partita...
  pausaFine: 0.75,         //   ...e a fine partita
  avvisoInizio: 1.2,       // secondi di luci bianche e "bip bip" prima che parta, a inizio partita...
  avvisoFine: 0.9,         //   ...e a fine partita
  accelerazione: 40,       // quanto in fretta prende velocità (unità/s²)
  frenata: 70,             //   ...e quanto in fretta si ferma
  arrivo: 0.84,            // Emilio conta di essere fuori a questo punto della partita (0.84 = a 29 secondi su 35)
  curvaArrivo: 1.35,       // la sua tabella di marcia: 1 = regolare, più di 1 = piano all'inizio e forte alla fine
  recupero: 5,             // se è in ritardo sulla tabella (uno spavento, una frenata) accelera: più è alto, più recupera in fretta
  recuperoMax: 1.45,       //   ...ma mai più di tanto (1.45 = il 45% più svelto del normale)
  zona: 46,                // lunghezza della zona rossa dietro la macchina (unità)
  distrattoDa: 0.34,       // da che punto della partita (0 = inizio, 1 = fine) comincia a distrarsi (0.34 = 12 s: il secondo atto)
  distratto: 0.65,         // a fine partita, quanti scatti su 1 li fa da distratto (radio, bandana, telefono)
  distrattoVel: 1.3,       // da distratto va più forte di tanto
  durataIncidente: 2.8,    // secondi persi quando tocca un cane (scende e si dispera)
  // --- i cani ---
  // personalita: 'pigro' (si sdraia dietro la ruota e si sposta solo a spinte), 'pallina' (rincorre
  // la pallina ovunque), 'goloso' (va solo dietro ai biscotti). Si possono rinominare, togliere o
  // aggiungere (anche due con la stessa personalità). collare: colore; taglia: 1 = normale;
  // macchia: colore di una macchia sulla schiena (facoltativa). Si chiamano tutti Morgan:
  // se a un cane aggiunto non metti il nome, prende da solo il numero che gli tocca (Morgan IV...).
  cani: [
    { nome: 'Morgan I', collare: '#e8463a', personalita: 'pigro', taglia: 1.1 },
    { nome: 'Morgan II', collare: '#3f8ae0', personalita: 'pallina', taglia: 0.9 },
    { nome: 'Morgan III', collare: '#f2c43a', personalita: 'goloso', macchia: '#8a5a2e' },
  ],
  velCane: 15,             // quanto veloci vanno a spasso (unità/s): ciondolano
  velCorsa: 62,            // quando corrono dietro al biscotto o alla pallina
  sosta: [0.7, 1.8],       // quanto si fermano tra una passeggiata e l'altra (secondi): tra questo e questo
  vogliaZonaInizio: 0.16,  // quante volte su 1 scelgono di andare proprio dietro la macchina, a inizio partita...
  vogliaZonaFine: 0.3,     //   ...e a fine partita
  sicuroInizio: 5,         // secondi che restano nel prato (o sotto il portico) prima di tornare sul vialetto, a inizio partita...
  sicuroFine: 3.5,         //   ...e a fine partita
  pigroDietro: 18,         // il pigro si sdraia a tante unità dalla coda della macchina
  pigroVel: 1.5,           // per tornare dietro la ruota va più svelto degli altri a spasso (1 = uguale): se no la macchina lo semina
  pigroPausa: 6,           // dopo una spinta, quanto aspetta prima di tornare a sdraiarsi dietro la ruota, a inizio partita...
  pigroPausaFine: 4,       //   ...e a fine partita
  // --- Pastaffi: quando passa il gatto esce di casa e porta via un cane ---
  pastaffi: {
    ritardo: 0.8,          // secondi dopo il gatto
    velCorsa: 135,         // quanto corre quando esce (unità/s)
    velCarico: 52,         //   ...e quanto va piano col cane in braccio (lo Shar Pei pesa)
    frenata: 1,            // secondi che Emilio resta inchiodato quando sente "PAPÀ, FERMO!"
    sosta: 7,              // secondi che il cane resta nel prato dopo che ce l'ha portato
  },
  // --- il gatto ---
  gatto: {
    a: 12,                 // a tanti secondi dalla fine passa il gatto (il terzo atto)
    vel: 24,               // quanto veloce attraversa (unità/s)
    velCani: 15,           // quanto veloci (cioè piano) gli vanno dietro i cani
    avanti: 42,            // passa a tante unità dalla coda della macchina
  },
  // --- frasi ---
  frasi: ['Spostatevi, ragazzi!', 'Faccio tardi!', 'Ma chi li ha fatti uscire?', "Rock'n'roll!", 'Via, via, via!', 'Quanto è lungo questo vialetto?'],
  frasiDistratto: {
    radio: ['Questa la alzo!', 'Senti che assolo!'],
    bandana: ['Un attimo, la bandana...', 'Mi è scesa sugli occhi!'],
    telefono: ['Chi è che scrive?', 'Pronto? Sto uscendo!'],
  },
  frasiIncidente: ['NOOO! Il mio cucciolo!', 'Da dove è sbucato?!', 'Non ti avevo visto!', 'Mi viene un infarto!'],
  frasiPastaffi: ['PAPÀ, IL GATTO!', 'PAPÀ, FERMO!'],
  frasiCarico: ['Quanto pesi!', 'Sei tutto pieghe!', 'Dai, su...'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { avvisoInizio: 1.6, avvisoFine: 1.2, vogliaZonaInizio: 0.1, vogliaZonaFine: 0.2 },
    difficile: { avvisoInizio: 0.95, avvisoFine: 0.7, vogliaZonaInizio: 0.22, vogliaZonaFine: 0.38 },
  },
};
