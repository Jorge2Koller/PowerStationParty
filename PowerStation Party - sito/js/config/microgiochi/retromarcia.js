// Configurazione del microgioco 'Emilio in Retromarcia' (id: retromarcia).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/RetromarciaScene.js; questa sezione arriva in CONFIG.microgiochi.retromarcia.)
export default {
  titolo: 'Emilio in Retromarcia',
  verbo: 'SPINGI!',         // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x6a8f3a,
  musica: 'rock',           // js/config/musiche.js
  ospite: { id: 'emilio', etichetta: 'AL VOLANTE:\nEMILIO' },
  cast: ['pastaffi'],      // altri personaggi della storia: chi li sceglie qui gioca "contro se stesso"
  comandi: [
    'FRECCE (o WASD), oppure clic sul vialetto: muoviti',
    'Cammina contro un cane: lo spingi via dalla ZONA ROSSA (ma se la macchina ti tocca: KO!)',
    'SPAZIO o tasto destro: lancia biscotti e palline. BIP BIP: la macchina parte!',
  ],
  comandiTouch: [
    'Trascina il dito sul vialetto: ti muovi',
    'Cammina contro un cane: lo spingi via dalla ZONA ROSSA (ma se la macchina ti tocca: KO!)',
    'Tocca biscotto o pallina, poi dove lanciarli. BIP BIP: la macchina parte!',
  ],
  obiettivo: 'Fai uscire Emilio dal cancello: al massimo uno spavento!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. Il vialetto resta lungo uguale: per uscire in tempo Emilio parte prima e
  // fa scatti più svelti, con meno attesa tra uno e l'altro (coi valori normali, in 15 secondi arrivava
  // a metà vialetto). Il gatto passa in proporzione (a 5 secondi dalla fine, non a 12)
  lampo: {
    primaPartenza: 1, velInizio: 56, velFine: 80, scatto: [0.8, 1.4], pausaInizio: 0.5, pausaFine: 0.35, arrivo: 0.7,
    avvisoInizio: 0.65, avvisoFine: 0.5, accelerazione: 120, frenata: 180, durataIncidente: 1.4, nuoveInizio: 2.5, nuoveFine: 2,
  },
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 80 / 120 / 170; prima ancora 60 / 110 / 160: chi
  // stava fermo a volte usciva con una vita). Ora i cani sono cinque: fuori con 2 vite è il bronzo,
  // fuori senza spaventi (e tutti gli scatti puliti) l'oro.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  // --- vite e punti ---
  vite: 3,                 // spaventi che ti puoi permettere (al terzo la partita finisce)
  unitaMetro: 10,          // quante unità di schermo fanno un metro (il vialetto è lungo 25 metri)
  // (revisione 4) i punti: VIA LIBERA, ogni scatto della macchina finito senza spaventare nessun cane
  // (il k-esimo di fila vale k volte puntiScatto: 4, 8, 12...; uno spavento azzera la serie); i cani
  // salvati all'ultimo valgono meno (capitano anche a chi tocca a caso); se Emilio esce dal cancello,
  // le vite rimaste (indice = vite: con 2 +40, con 3, senza spaventi, +150).
  // Prima: uscita 40, 20 a vita, 10 a cane salvato: chi toccava a caso usciva con una vita e prendeva il bronzo.
  puntiScatto: 4,
  bonusSalvataggio: 5,     // per ogni cane tolto dalla zona rossa all'ultimo istante (era 10)
  vicino: 28,              // "all'ultimo istante" = la coda era a meno di tante unità dal cane, con la macchina in moto o in partenza
  attesaSalvataggio: 2.5,  // lo stesso cane non dà un altro bonus prima di tanti secondi
  bonusUscita: 0,          // se Emilio esce dal cancello (era 40)...
  bonusVite: [0, 0, 40, 150], // ...più tanto secondo le vite rimaste (0, 1, 2, 3)
  viteVittoria: 2,         // per vincere: fuori dal cancello con almeno tante vite (al massimo uno spavento)
  // --- il giocatore ---
  velGiocatore: 104,       // velocità (unità/s)
  raggioSpinta: 15,        // quanto vicino devi passare a un cane per spingerlo
  velSpinta: 80,           // velocità del cane appena spinto (unità/s)...
  durataSpinta: 0.7,       //   ...per tanti secondi, rallentando: fa una trentina di unità
  spintaFuori: 0.45,       // un cane spinto dentro la corsia della macchina devia di tanto verso il bordo più vicino (0 = va solo dove lo spingi)
  // (scheda di valutazione: "se ti metti dietro la macchina dovrebbe lasciarti per terra se ti
  // tocca, tipo un KO di 2 secondi"; prima la coda ti spingeva e basta) se la macchina in moto ti
  // arriva addosso con la coda, fai un volo di lato, fuori dalla corsia, e resti steso con le
  // stelline che girano: non ti muovi, non lanci, non spingi e non raccogli. Non costa vite né punti:
  // costa il tempo, coi cani che intanto fanno di testa loro.
  durataKO: 2,             // secondi KO, dal botto a quando ti rialzi (il volo compreso)
  voloKO: 0.45,            //   ...di cui tanti in volo, prima di toccare terra
  invulnerabileKO: 1.5,    // appena rialzato, per tanti secondi lampeggi e la macchina non ti stende di nuovo (fa solo da muro)
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
  recuperoMax: 1.7,        //   ...ma mai più di tanto (1.7 = il 70% più svelto del normale; era 1,45: coi cinque cani non usciva più)
  zona: 46,                // lunghezza della zona rossa dietro la macchina (unità)
  distrattoDa: 0.34,       // da che punto della partita (0 = inizio, 1 = fine) comincia a distrarsi (0.34 = 12 s: il secondo atto)
  distratto: 0.65,         // a fine partita, quanti scatti su 1 li fa da distratto (radio, bandana, telefono)
  distrattoVel: 1.3,       // da distratto va più forte di tanto
  durataIncidente: 2.4,    // secondi persi quando tocca un cane (scende e si dispera) (era 2,8)
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
    // (revisione 4: era troppo facile, arrivano altri due Morgan: un altro pigro e un altro goloso)
    { nome: 'Morgan IV', collare: '#2fae6a', personalita: 'pigro', taglia: 1 },
    { nome: 'Morgan V', collare: '#8a4fd8', personalita: 'goloso', taglia: 0.95, macchia: '#4a3020' },
  ],
  velCane: 15,             // quanto veloci vanno a spasso (unità/s): ciondolano
  velCorsa: 62,            // quando corrono dietro al biscotto o alla pallina
  sosta: [0.7, 1.8],       // quanto si fermano tra una passeggiata e l'altra (secondi): tra questo e questo
  vogliaZonaInizio: 0.3,   // quante volte su 1 scelgono di andare proprio dietro la macchina, a inizio partita...
  vogliaZonaFine: 0.5,     //   ...e a fine partita (erano 0,16 e 0,3, poi 0,24 e 0,42)
  sicuroInizio: 3.2,       // secondi che restano nel prato (o sotto il portico) prima di tornare sul vialetto, a inizio partita...
  sicuroFine: 2.2,         //   ...e a fine partita (erano 5 e 3,5, poi 3,8 e 2,6)
  pigroDietro: 18,         // il pigro si sdraia a tante unità dalla coda della macchina
  pigroVel: 1.5,           // per tornare dietro la ruota va più svelto degli altri a spasso (1 = uguale): se no la macchina lo semina
  pigroPausa: 4.5,         // dopo una spinta, quanto aspetta prima di tornare a sdraiarsi dietro la ruota, a inizio partita...
  pigroPausaFine: 3,       //   ...e a fine partita (erano 6 e 4)
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
  frasi: ['Talebani', 'Faccio tardi al raduno', 'Spostatevi, ragazzi!', 'Ma chi li ha fatti uscire?', "Rock'n'roll!", 'Via, via, via!', 'Quanto è lungo questo vialetto?'],
  frasiDistratto: {
    radio: ['Questa la alzo!', 'Senti che assolo!'],
    bandana: ['Un attimo, la bandana...', 'Mi è scesa sugli occhi!'],
    telefono: ['Chi è che scrive?', 'Pronto? Sto uscendo!'],
  },
  frasiIncidente: ['NOOO! Il mio cucciolo!', 'Da dove è sbucato?!', 'Non ti avevo visto!', 'Mi viene un infarto!'],
  // Emilio quando ti stende in retromarcia (non se ne accorge neanche)
  frasiKO: ['Ho preso una buca?', "Cos'era quel botto?", 'Chi è che bussa dietro?', 'Mi sa che ho preso un sasso'],
  frasiPastaffi: ['PAPÀ, IL GATTO!', 'PAPÀ, FERMO!'],
  // Pastaffi (Denny) dalla porta di casa, quando Emilio tocca un cane
  frasiPastaffiSpavento: ["Babbo, non un'altra volta!!!!"],
  frasiCarico: ['Quanto pesi!', 'Sei tutto pieghe!', 'Dai, su...'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { avvisoInizio: 1.6, avvisoFine: 1.2, vogliaZonaInizio: 0.2, vogliaZonaFine: 0.36, sicuroInizio: 4.4, sicuroFine: 3 },
    difficile: { avvisoInizio: 0.95, avvisoFine: 0.7, vogliaZonaInizio: 0.38, vogliaZonaFine: 0.6, sicuroInizio: 2.6, sicuroFine: 1.7 },
  },
};
