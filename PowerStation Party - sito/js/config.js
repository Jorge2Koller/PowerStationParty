// ============================================================
//  CONFIGURAZIONE CENTRALE
//  Qui si cambiano titolo, nomi, durate, difficoltà e frasi
//  senza toccare la logica del gioco.
// ============================================================

export const CONFIG = {
  titolo: 'POWERSTATION PARTY',
  sottotitolo: 'Tutti contro tutti, un turno a testa',
  // Schermo logico: tutte le coordinate di gioco sono in queste unità.
  // Il disegno vero avviene a 4x (1920x1080), vedi RES in js/grafica/base.js.
  larghezza: 480,
  altezza: 270,

  // ---------------------------------------------------------
  //  I GIOCATORI
  // ---------------------------------------------------------
  maxGiocatori: 8,          // quanti si può essere al massimo (uno alla volta, passandosi telefono o tastiera)

  // I personaggi che si possono scegliere. Per aggiungerne o toglierne uno basta una riga qui:
  //   id = il suo nome in js/grafica/personaggi.js (PERSONAGGI), nome = come compare nel gioco,
  //   soprannome = la riga sotto il nome nella selezione, colore = il colore del giocatore
  //   (diverso da tutti gli altri), esulta / perde = le sue frasi quando vince e quando perde.
  // Chi non è in questo elenco (Marsupino, Beppe, lo Zio, Emilio) resta solo ospite del suo microgioco.
  personaggiGiocabili: [
    { id: 'riccardo', nome: 'Riccardo', soprannome: 'Mister PowerStation', colore: '#ff6b5a', esulta: 'Stasera offro io. Forse.', perde: 'Era solo riscaldamento.' },
    { id: 'giorgio', nome: 'Giorgio', soprannome: 'Il Passaggiorgio', colore: '#5ab4ff', esulta: 'E adesso chi mi riporta a casa?', perde: 'Tanto guidava qualcun altro.' },
    { id: 'marco', nome: "O'Sfurnacchiat", soprannome: 'Marco De Luca', colore: '#ffb02e', esulta: 'Liscio come una barba fatta bene!', perde: 'Mi sono tagliato da solo.' },
    { id: 'greg', nome: 'ReGrorio', soprannome: 'Greg, il re della Golf', colore: '#b06aff', esulta: 'Largo, passa il re!', perde: 'Mi si è ingolfata la Golf.' },
    { id: 'guerra', nome: 'Guerra', soprannome: 'Mani lunghe', colore: '#4ade80', esulta: 'E ora si mangia!', perde: 'A stomaco vuoto non rendo.' },
    { id: 'sego', nome: 'Sego', soprannome: 'Franci', colore: '#ff7ac8', esulta: 'Scendo, scendo... a festeggiare!', perde: 'Io stavo ancora dormendo.' },
    { id: 'generale', nome: 'Il Generale', soprannome: 'Torricelli', colore: '#9fb86a', esulta: 'Missione compiuta, soldati!', perde: 'Ritirata strategica.' },
    { id: 'ingiocabile', nome: "L'Ingiocabile", soprannome: 'Il banco vince sempre', colore: '#2dd4bf', esulta: 'Il banco vince. Sempre.', perde: 'Avete barato, lo so.' },
    { id: 'passaseo', nome: 'Passaseo', soprannome: 'Il ciclista', colore: '#ffe14a', esulta: 'In volata!', perde: 'Ho bucato.' },
    { id: 'bota', nome: 'Il Bota', soprannome: 'Mister abbronzatura', colore: '#ff8a3a', esulta: 'Abbronzato e vincente.', perde: 'Mi sono scottato.' },
    { id: 'petri', nome: 'Petri', soprannome: 'Il Piovra', colore: '#8fa8ff', esulta: 'Ci ho messo le mani, tutte!', perde: 'Mi sono impigliato.' },
    { id: 'manna', nome: 'Il Manna', soprannome: 'La Calamita', colore: '#f6c63a', esulta: 'Ovviamente.', perde: 'Era bianca! BIANCA!' },
    { id: 'pastaffi', nome: 'Pastaffi', soprannome: 'Il figlio di Emilio', colore: '#c98a4e', esulta: 'Papà, hai visto?', perde: 'Papà, non guardare.' },
  ],

  // Punti classifica per posizione nel round, da tre giocatori in su (in due si contano i punti dei
  // microgiochi, come sempre). null = alla Mario Party: in N giocatori il primo ne prende N, il
  // secondo N-1... l'ultimo 1. Oppure una tabella per numero di giocatori, es.
  //   puntiPosizione: { 3: [4, 2, 1], 4: [5, 3, 2, 1] }
  // A pari punteggio, pari posizione (e stessi punti).
  puntiPosizione: null,
  sfidaRapida: [3, 5, 8],   // quanti microgiochi (pescati a caso) nelle sfide rapide del menu
  alMeglioDi: [3, 5],       // le sfide "al meglio di": di 3 vince chi per primo vince 2 round, di 5 chi ne vince 3

  // Ordine dei microgiochi nella modalità sfida
  // (la sfida veloce li pesca a caso da questa lista)
  ordineSfida: ['spina', 'regrorio', 'barba', 'panino', 'mani', 'sego', 'ronda', 'blackjack', 'palleggi', 'passaseo', 'bota', 'guida', 'piovra', 'scapoli', 'retromarcia'],

  microgiochi: {
    // ---------------------------------------------------------
    spina: {
      titolo: 'La Spina del PowerStation',
      durata: 60,
      colore: 0xb5651d,
      ospite: { id: 'beppe', etichetta: 'CONTRO:\nBEPPE' },
      comandi: ['Tieni premuto SPAZIO per spillare', 'Rilascia nella ZONA VERDE'],
      comandiTouch: ['Tieni il dito sullo schermo per spillare', 'Alza il dito nella ZONA VERDE'],
      obiettivo: 'Spilla più pinte di Beppe!',
      // zona verde: ampiezza (frazione del bicchiere) a inizio e fine partita
      zonaInizio: 0.22,
      zonaFine: 0.11,
      // velocità di riempimento (bicchieri al secondo) a inizio e fine
      velInizio: 0.85,
      velFine: 1.15,
      pausaPerfetta: 0.35, // secondi prima del bicchiere nuovo dopo una pinta buona
      penalita: 1.2,       // secondi persi per una pinta sbagliata
      // Beppe: secondi per pinta, normale e negli ultimi "beppeSprint" secondi
      beppeIntervallo: 2.0,
      beppeIntervalloFinale: 1.7,
      beppeSprint: 20,
      frasiBeppe: ['Tsk.', 'Lento...', 'Mah.', 'Dilettante.', 'Guagliò...'],
      frasiClienti: ['Uè!', 'Ma dai!', "Un'altra!", 'Eh, oh!', 'Grande!', 'Mamma mia!', 'Offro io!', 'Ma che dici?!'],
    },

    // ---------------------------------------------------------
    regrorio: {
      titolo: 'Arriva ReGrorio!',
      durata: 45,
      colore: 0x3b6fd1,
      ospite: { id: 'greg', etichetta: 'OCCHIO A:\nREGRORIO' },
      comandi: ['FRECCE SINISTRA/DESTRA: cambia corsia', 'SPAZIO: salta'],
      comandiTouch: ['Tocca a SINISTRA o a DESTRA: cambia corsia', 'Tocca in MEZZO: salta (anche insieme, con due dita)'],
      obiettivo: 'Sopravvivi alla Golf del Re!',
      vite: 3,
      bonusSchivata: 2,       // punti per ogni schivata all'ultimo istante
      finestraSchivata: 0.35, // secondi: quanto "all'ultimo" deve essere
      durataSalto: 0.55,
      // Fasi di difficoltà. "da" = secondo da cui vale la fase.
      //  vel = px/s, avviso = secondi di preavviso, intervallo = [min,max] tra un passaggio e l'altro,
      //  dalBasso / finta / doppia = probabilità (0-1)
      fasi: [
        { da: 0,  vel: 200, avviso: 0.95, intervallo: [1.9, 2.3],  dalBasso: 0,    finta: 0,    doppia: 0 },
        { da: 10, vel: 270, avviso: 0.8,  intervallo: [1.3, 1.7],  dalBasso: 0.3,  finta: 0,    doppia: 0 },
        { da: 20, vel: 320, avviso: 0.7,  intervallo: [1.1, 1.4],  dalBasso: 0.25, finta: 0.5,  doppia: 0 },
        { da: 32, vel: 380, avviso: 0.55, intervallo: [0.6, 0.9],  dalBasso: 0.25, finta: 0.3,  doppia: 0.3 },
      ],
      frasiBotto: ['BONK!', 'SBAM!', 'PATAPUM!', 'STONK!'],
    },

    // ---------------------------------------------------------
    barba: {
      titolo: "La Barba di O'Sfurnacchiat",
      durata: 45,
      colore: 0xc0392b,
      ospite: { id: 'marco', etichetta: "IL CLIENTE:\nO'SFURNACCHIAT" },
      comandi: [
        'TASTO DESTRO (o CTRL+clic): stendi la schiuma',
        'TASTO SINISTRO: radi dove c\'è schiuma. PIANO!',
        'Lama piena? Sciacquala nella bacinella',
        'Evita naso, labbra, occhi, orecchie e nei',
      ],
      comandiTouch: [
        'In basso a sinistra scegli PENNELLO o RASOIO',
        'PENNELLO: passa il dito per la schiuma. RASOIO: radi. PIANO!',
        'L\'attrezzo sta un po\' sopra il dito, così lo vedi',
        'Lama piena? Sciacquala nella bacinella',
        'Evita naso, labbra, occhi, orecchie e nei',
      ],
      obiettivo: "Radi almeno l'80% della barba!",
      soglia: 80,          // % per vincere
      sogliaFine: 98,      // % a cui il microgioco finisce in anticipo (bonus tempo)
      bonusPerSecondo: 2,  // punti per ogni secondo avanzato
      // --- attrezzi (misure in unità della faccia: 1 unità = 2 px di gioco) ---
      raggio: 5.5,           // raggio del rasoio (largo come la lama che si vede)
      raggioPennello: 9,     // raggio del pennello
      durataSchiuma: 15,     // secondi prima che la schiuma si secchi
      capienzaLama: 200,     // celle di barba che la lama regge prima di intasarsi (in tutto sono circa 330)
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
      chiacchiere: ['E poi gli ho detto...', "Uè, fai piano!", 'Ma lo sai che...', "'O ssaje comm'è...", 'Senti questa!'],
    },

    // ---------------------------------------------------------
    panino: {
      titolo: 'Il Panino di Marsupino',
      durata: 45,
      colore: 0xe08a2a,
      ospite: { id: 'marsupino', etichetta: 'CHEF:\nMARSUPINO' },
      comandi: [
        'FRECCE SINISTRA/DESTRA (o A/D), oppure il mouse: muovi il pane',
        'Prendi prosciutto, würstel, sottiletta, ketchup e maionese',
        'Ketchup e maionese arrivano dai tubetti in alto',
        'NON prendere calzini, lische, ghiaccio e ciabatte!',
        'Più è alto il panino, più ondeggia',
      ],
      comandiTouch: [
        'Trascina il dito in basso: il pane si sposta con lui',
        'Prendi prosciutto, würstel, sottiletta, ketchup e maionese',
        'Ketchup e maionese arrivano dai tubetti in alto',
        'NON prendere calzini, lische, ghiaccio e ciabatte!',
        'Più è alto il panino, più ondeggia',
      ],
      obiettivo: 'Fai almeno 3 panini completi!',
      obiettivoPanini: 3,
      // punti
      puntiIngrediente: 10,   // ingrediente che mancava nel panino
      puntiDoppione: 3,       // ingrediente che c'era già (si impila lo stesso)
      puntiPanino: 30,        // panino completo
      bonusRapido: 10,        // ...se fatto in meno di "secondiRapido" secondi
      secondiRapido: 8,
      malusSbagliato: 10,     // presa una schifezza: punti tolti e panino nel cestino
      // movimento del pane: velocità massima uguale per tastiera, mouse e dito (unità/s)
      velPane: 300,
      guadagnoDito: 1.15,     // col dito: quanto si sposta il pane per ogni unità di trascinamento
      presa: 20,              // mezza larghezza della zona in cui si prende (cresce di 0,6 per strato)
      maxStrati: 10,          // oltre, i doppioni non entrano più (gli ingredienti che mancano sì)
      // la pila ondeggia: molla (rigidità e smorzamento) spinta dalle accelerazioni del pane;
      // più strati = molla più morbida
      ondeggio: 0.003,
      rigidita: 90,
      smorzamento: 9,
      // lanci di Marsupino: velocità di caduta e secondi tra un lancio e l'altro, a inizio e fine partita
      cadutaInizio: 75,
      cadutaFine: 150,
      lancioInizio: 1.1,
      lancioFine: 0.5,
      sbagliatiInizio: 0.1,   // probabilità che lanci una schifezza
      sbagliatiFine: 0.3,
      doppioDa: 0.5,          // da metà partita, a volte lancia due cose insieme
      probDoppio: 0.35,
      // tubetti di ketchup e maionese
      tubettoInizio: 3.4,     // secondi tra un tubetto e l'altro
      tubettoFine: 2.2,
      velSchizzo: 1.35,       // gli schizzi cadono più veloci degli ingredienti
      frasi: ['Al volo!', 'Abbonda col ketchup!', 'Questo è arte.', 'Panino della casa!', 'Occhio al würstel!', 'Dai che si fredda!'],
      frasiPanino: ['Capolavoro!', 'Uno spettacolo!', 'Questo lo mangio io!', 'Chef stellato!'],
      // panino rovinato: prima l'urlo (corto, a caratteri cubitali), poi continua a brontolare
      urla: ['MA CHE FAI?!', 'NOOOO!', 'CHE SCHIFO!', 'IL MIO PANINO!', 'MA SEI MATTO?!', 'ROBA DA PAZZI!'],
      frasiSbaglio: ['Quello era il mio calzino!', 'Così me lo rovini!', 'Fuori dal mio bar!', 'Ma chi ti ha insegnato?!', 'Lo butto, lo butto tutto!', 'Non ci vedo più dalla rabbia!'],
    },

    // ---------------------------------------------------------
    mani: {
      titolo: 'Guerra, via quelle mani!',
      durata: 45,
      colore: 0x2f8a5a,
      ospite: { id: 'guerra', etichetta: 'OCCHIO A:\nGUERRA' },
      comandi: [
        'MOUSE: clicca sulle mani di Guerra per dargli uno schiaffo',
        'Se una mano prende un piatto, colpiscila per salvarlo',
        'Col guanto da forno ci vogliono DUE schiaffi',
        'Schiaffo a vuoto: la mano ti fa male per un attimo',
      ],
      comandiTouch: [
        'Tocca le mani di Guerra per dargli uno schiaffo (anche due insieme)',
        'Se una mano prende un piatto, colpiscila per salvarlo',
        'Col guanto da forno ci vogliono DUE schiaffi',
        'Schiaffo a vuoto: la mano ti fa male per un attimo',
      ],
      obiettivo: 'Salva almeno 3 piatti su 5!',
      piattiMinimi: 3,
      // punti
      puntiSchiaffo: 5,      // schiaffo normale
      puntiUltimo: 8,        // ...se la mano era a meno di "vicino" unità dal piatto
      puntiSalvato: 4,       // ...se stava già trascinando via un piatto: è un recupero, vale meno
                             //    (altrimenti converrebbe lasciarli prendere apposta)
      puntiGuanto: 2,        // guanto da forno tolto (primo schiaffo)
      puntiPiatto: 15,       // per ogni piatto ancora tuo alla fine
      vicino: 30,
      // schiaffi
      raggioSchiaffo: 15,    // quanto vicino al palmo bisogna cliccare (unità)
      raggioDito: 19,        // col dito un po' di più: è meno preciso del mouse
      bloccoVuoto: 0.6,      // secondi di mano dolorante dopo uno schiaffo a vuoto
      velRitiro: 420,        // velocità della mano che scappa dopo lo schiaffo
      // Fasi di difficoltà. "da" = secondo da cui vale la fase.
      //  maxMani = mani in giro insieme, vel = velocità delle mani (unità/s),
      //  intervallo = [min,max] secondi tra una mano e l'altra, tira = velocità con cui trascina un piatto,
      //  finta / guanto = probabilità (0-1)
      fasi: [
        { da: 0,  maxMani: 1, vel: 62,  intervallo: [1.4, 1.8],  tira: 22, finta: 0,    guanto: 0 },
        { da: 8,  maxMani: 2, vel: 80,  intervallo: [1.0, 1.4],  tira: 26, finta: 0.15, guanto: 0 },
        { da: 18, maxMani: 3, vel: 100, intervallo: [0.8, 1.1],  tira: 32, finta: 0.25, guanto: 0.15 },
        { da: 30, maxMani: 4, vel: 120, intervallo: [0.6, 0.85], tira: 38, finta: 0.3,  guanto: 0.2 },
        { da: 38, maxMani: 5, vel: 140, intervallo: [0.45, 0.65], tira: 45, finta: 0.3, guanto: 0.25 },
      ],
      frasi: ['Solo un assaggio!', 'Ma questo lo lasci?', 'Una forchettata e basta!', 'Che fame...', 'Dai, dividiamo!', 'Non lo finisci?'],
      frasiSchiaffo: ['Ahia!', 'Che manesco!', 'Ma dai!', 'Ohi!', 'Che cattiveria...'],
      frasiFurto: ['Grazie!', 'Buonissimo!', 'Gnam!', 'Questo è mio!'],
    },

    // ---------------------------------------------------------
    sego: {
      titolo: 'Sego, sono sotto casa!',
      durata: 50,
      colore: 0x8a5ac8,
      ospite: { id: 'sego', etichetta: 'OBIETTIVO:\nSEGO' },
      comandi: [
        'MOUSE: punta, TIENI PREMUTO (la forza sale e scende), rilascia',
        'TASTIERA: FRECCE per mirare, SPAZIO tenuto per la forza',
        'Fai entrare i fumogeni dalle finestre APERTE',
        'Riempi la casa di fumo: all\'80% Franci esce!',
      ],
      comandiTouch: [
        'Appoggia il dito e tira indietro come una fionda, poi lascia',
        'Fai entrare i fumogeni dalle finestre APERTE',
        'Riempi la casa di fumo: all\'80% Franci esce!',
      ],
      obiettivo: 'Fai uscire Franci di casa!',
      soglia: 80,             // % di fumo in casa a cui Franci esce
      // punti
      puntiFinestra: 3,       // fumogeno entrato da una finestra
      puntiFranci: 6,         // ...nella stanza dove c'è Franci
      malusSprecato: 2,       // fumogeno sul muro, sulle persiane chiuse o nel cortile
      bonusUscita: 50,        // Franci esce
      bonusSecondo: 2,        // ...più 2 punti per ogni secondo che avanza
      // fumo (1 = stanza piena)
      fumoGranata: 0.6,       // quanto fumo porta un fumogeno nella stanza
      fumoVicine: 0.15,       // ...e nelle stanze accanto
      passaggio: 0.25,        // quanto fumo passa da una stanza all'altra (al secondo)
      diradaInizio: 0.015,    // parte del fumo che se ne va ogni secondo, a inizio e fine partita
      diradaFine: 0.03,       //   (con la finestra aperta un po' di più)
      diradaAperta: 1.3,      // quanto se ne va più in fretta con la finestra aperta
      // finestre e Franci
      aperteInizio: 7,        // finestre aperte all'inizio (su 12)
      ventoInizio: 4,         // secondi tra una finestra che sbatte e l'altra, a inizio e fine
      ventoFine: 1.8,
      franciInizio: 6,        // secondi tra una finestra chiusa da Franci e l'altra
      franciFine: 2.5,
      // lancio
      ricarica: 0.7,          // secondi per prendere il fumogeno successivo
      periodoForza: 2.2,      // secondi perché la forza salga e riscenda
      velMira: 200,           // tastiera: velocità del mirino (unità/s)
      tolleranza: 4,          // margine (unità) intorno al vano della finestra
      nebbia: 3,              // secondi di fumo sprecato davanti alla casa
      frasi: ['Chi è?', 'Cinque minuti!', 'Non ci sono!', 'Sto arrivando...', 'Sto finendo una cosa!', 'Ma che volete?'],
      frasiTosse: ['COF COF!', 'Ma siete matti?!', 'Che fumo!', 'Non si respira!'],
      frasiChiude: ['Chiudo tutto!', 'Che spiffero!', 'Fuori di qui!'],
    },

    // ---------------------------------------------------------
    ronda: {
      titolo: 'TorRONDAcelli',
      durata: 45,
      colore: 0x2f8fd0,
      ospite: { id: 'generale', etichetta: 'AGLI ORDINI\nDEL GENERALE' },
      comandi: [
        'Il mouse mira, il CLIC spara (oppure FRECCE + SPAZIO)',
        'Affonda le bagnarole dei pirati prima che tocchino riva',
        'Se arrivano si prendono un ombrellone: affondali mentre scappano per riaverlo',
        'Clicca la cassa del Generale (o premi R) per le munizioni',
        'Gommone: 1 colpo. Pedalò: 2. Galeone: 3',
      ],
      comandiTouch: [
        'Tocca il mare: il cannone spara lì',
        'Affonda le bagnarole dei pirati prima che tocchino riva',
        'Se arrivano si prendono un ombrellone: affondali mentre scappano per riaverlo',
        'Tocca la cassa del Generale per le munizioni',
        'Gommone: 1 colpo. Pedalò: 2. Galeone: 3',
      ],
      obiettivo: 'Salva almeno 3 ombrelloni su 5!',
      obiettivoOmbrelloni: 3,
      // munizioni
      colpiMax: 6,
      colpiCassa: 4,          // colpi in una cassa del Generale
      cassaOgni: 4.5,         // secondi tra una cassa e l'altra (se quella prima è stata presa)
      ricaricaLenta: 3.5,     // intanto, un colpo in più ogni tot secondi
      velMira: 230,           // tastiera: velocità del mirino (unità/s)
      // punti
      puntiAffondata: 10,
      bonusLontano: 5,        // ...se affondata lontano dalla riva (sopra yLontano)
      yLontano: 100,
      puntiRipreso: 5,        // ombrellone recuperato da una bagnarola in fuga
      puntiOmbrellone: 15,    // a fine partita, per ogni ombrellone ancora piantato
      // bagnarole: colpi per affondarle e lentezza rispetto alla velocità della fase
      hp: { gommone: 1, pedalo: 2, galeone: 3 },
      passo: { gommone: 1, pedalo: 0.9, galeone: 0.72 },
      // difficoltà a inizio e a fine partita (in mezzo si sfuma)
      inizio: { intervallo: 2.7, vel: 16, maxBarche: 2, pedalo: 0.25, galeone: 0, zigzag: 0 },
      fine: { intervallo: 1.1, vel: 30, maxBarche: 6, pedalo: 0.4, galeone: 0.3, zigzag: 20 },
      frasi: ['FUOCO!', 'Mirate alla chiglia!', 'Non un passo indietro!', 'Difendete gli ombrelloni!', 'Avanti, soldato!', 'Ricaricate!'],
      frasiCassa: ['Munizioni!', 'Prendi, soldato!', 'Al volo!'],
      frasiRubato: ['Il mio ombrellone!', 'Inseguiteli!', 'Vergogna!', 'Ritirata no!'],
      frasiPirati: ['Arrr!', 'Questo è nostro!', 'Bottino!', 'Si va al largo!'],
    },

    // ---------------------------------------------------------
    blackjack: {
      titolo: "L'Ingiocabile",
      durata: 60,
      colore: 0x1f8a4a,
      ospite: { id: 'ingiocabile', etichetta: "AL BANCO:\nL'INGIOCABILE" },
      comandi: [
        '1, 2, 3 (o clic sulle fiches): punti 10, 25 o 50',
        'C o SPAZIO: carta    S o INVIO: stai    D: raddoppia',
        'Arriva più vicino possibile a 21 senza sballare',
        'Il banco sta su 17. Il blackjack paga 3 a 2',
        'Si parte con 100 fiches',
      ],
      comandiTouch: [
        'Tocca una fiche per puntare 10, 25 o 50',
        'Poi tocca CARTA, STAI o RADDOPPIA',
        'Arriva più vicino possibile a 21 senza sballare',
        'Il banco sta su 17. Il blackjack paga 3 a 2',
        'Si parte con 100 fiches',
      ],
      obiettivo: 'Finisci con più di 100 fiches!',
      fiches: 100,
      puntate: [10, 25, 50],
      mazzi: 2,
      rimescola: 20,          // sotto queste carte rimaste, il sabot si rimescola
      stai: 17,               // il banco tira finché non arriva almeno a questo
      frasi: ['Puntate, signori.', 'Fate il vostro gioco.', 'Il banco aspetta.', 'Coraggio...', 'Carte!'],
      frasiPerde: ['Mah...', 'Fortuna.', 'Stavolta passi.', 'Mischio meglio la prossima.', 'Pff.'],
      fraseVince: 'Come le leggo!',
    },

    // ---------------------------------------------------------
    palleggi: {
      titolo: 'MaraZio',
      durata: 45,
      colore: 0x4a9a3a,
      ospite: { id: 'zio', etichetta: 'SFIDA\nLO ZIO' },
      comandi: [
        'FRECCE SINISTRA/DESTRA (o A/D), oppure il mouse: muoviti',
        'SPAZIO o CLIC: calcia, quando il pallone arriva al piede',
        'Più il colpo è preciso, più il pallone sale dritto',
        'Colpo scarso: il pallone scappa di lato. Se cade, si ricomincia',
        'Lo Zio intanto palleggia. E non sbaglia mai.',
      ],
      comandiTouch: [
        'Trascina il dito sul prato: ti muovi',
        'Tocca CALCIA quando il pallone arriva al piede',
        'Più il colpo è preciso, più il pallone sale dritto',
        'Colpo scarso: il pallone scappa di lato. Se cade, si ricomincia',
        'Lo Zio intanto palleggia. E non sbaglia mai.',
      ],
      obiettivo: 'Fai una serie di almeno 12 palleggi!',
      obiettivoSerie: 12,
      // punti
      puntiPalleggio: 10,
      bonusPerfetto: 5,
      bonusSerie: 5,          // a fine partita, per ogni palleggio della serie migliore
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
      frasi: ['Io non sbaglio mai.', 'Visto? Facile.', 'Palla incollata al piede.', 'Mai sbagliato in vita mia.', 'Guarda e impara.'],
      frasiErrore: ["Te l'avevo detto...", 'Ahia.', 'Guarda me!', 'Piede di legno!', 'Si ricomincia.'],
    },

    // ---------------------------------------------------------
    passaseo: {
      titolo: 'Passa di qua',
      durata: 45,
      colore: 0xd83a3a,
      ospite: { id: 'passaseo', etichetta: 'IN BICI:\nPASSASEO' },
      comandi: [
        'FRECCE SINISTRA/DESTRA (o A/D), oppure il mouse: sterzi',
        "Prendi le pozzanghere quando c'è un Passaseo in bici accanto: SPLASH!",
        'Più schizzi di fila, più punti (se ne lasci passare uno asciutto si riparte)',
        'Non toccare i ciclisti: freni e perdi punti',
        'Occhio a trattori e Vespe',
      ],
      comandiTouch: [
        'Trascina il dito a destra e a sinistra: sterzi',
        "Prendi le pozzanghere quando c'è un Passaseo in bici accanto: SPLASH!",
        'Più schizzi di fila, più punti (se ne lasci passare uno asciutto si riparte)',
        'Non toccare i ciclisti: freni e perdi punti',
        'Occhio a trattori e Vespe',
      ],
      obiettivo: 'Schizza almeno 12 Passaseo!',
      obiettivoSchizzi: 12,
      // punti
      puntiSchizzo: 10,       // moltiplicato per la serie di schizzi di fila (fino a maxSerie)
      maxSerie: 4,
      puntiPozzanghera: 1,    // pozzanghera presa senza nessuno accanto
      malusCiclista: 10,
      malusVeicolo: 5,
      // guida
      velInizio: 165,         // velocità della strada (unità/s)
      velFine: 265,
      velFreno: 35,           // dopo un tocco si scende a questa velocità...
      ripresa: 1.4,           // ...e si torna su in questi secondi
      velSterzo: 175,
      presa: 13,              // quanto (in unità) il centro della Panda può stare fuori dal centro della pozzanghera
      distanzaPozza: 30,      // la pozzanghera è a questa distanza dal ciclista, verso il centro strada
      ondeggioInizio: 2,      // il ciclista ondeggia a destra e a sinistra di tanto (unità)...
      ondeggioFine: 6,        // ...e a fine partita di più
      guadagnoDito: 1.25,
      // traffico
      intervalloInizio: 1.6,  // secondi tra un incontro e l'altro
      intervalloFine: 0.95,
      veicoliInizio: 0.2,     // probabilità che invece del ciclista arrivi un trattore o una Vespa
      veicoliFine: 0.4,
      bici: 0.35,             // velocità del ciclista rispetto alla strada
      trattore: 0.55,
      vespa: 95,              // la Vespa arriva contromano, con questa velocità in più
      frasi: ['Ma dai!', 'Sono fradicio!', 'La mia divisa!', 'Ma guarda te!', 'Che doccia!', 'Passa di là!'],
      frasiSfiorato: ['Attento!', 'Piano!', 'Ehi!'],
    },

    // ---------------------------------------------------------
    bota: {
      titolo: 'Spalma il Bota!',
      durata: 45,
      colore: 0x1fa8c9,
      ospite: { id: 'bota', etichetta: 'DA SPALMARE:\nIL BOTA' },
      comandi: [
        'TASTO DESTRO (o CTRL+clic): spremi una goccia di crema',
        'TASTO SINISTRO tenuto: spalmala in giro, niente chiazze',
        'Tubetto vuoto? Scuotilo: tasto R, o clic sul tubetto',
        'Onde e sabbia rovinano il lavoro. Il gabbiano: cliccalo!',
        'Niente crema su occhi e bocca. A metà partita si gira',
      ],
      comandiTouch: [
        'In basso a sinistra scegli TUBETTO o MANO',
        'TUBETTO: tocca dove vuoi la goccia. MANO: striscia e spalma',
        'Tubetto vuoto? Toccalo per scuoterlo',
        'Onde e sabbia rovinano il lavoro. Il gabbiano: toccalo!',
        'Niente crema su occhi e bocca. A metà partita si gira',
      ],
      obiettivo: 'Finisci con meno del 15% di pelle scottata!',
      sogliaScottata: 15,     // % di pelle scottata: per vincere bisogna restare sotto
      // punti = % di pelle protetta - malus + bonus
      malusScottata: 1,       // punti tolti per ogni punto percentuale di pelle scottata
      malusChiazze: 1,        // ...e per ogni punto percentuale di chiazze di troppa crema
      bonusTubetto: 20,       // punti in più col tubetto ancora pieno (in proporzione a quanta crema avanza)
      // --- la crema (1 = una cella coperta per bene; le celle di pelle sono circa 260 per lato) ---
      tubetto: 430,           // crema nel tubetto all'inizio: basta per davanti e schiena, con pochi sprechi
      goccia: 11,             // crema in una goccia
      ritmoGocce: 0.2,        // tenendo premuto, una goccia ogni tanti secondi
      scossa: 22,             // crema che torna scuotendo il tubetto vuoto (due gocce)
      tempoScossa: 0.55,      // secondi persi ogni volta che lo scuoti
      strato: 0.75,           // quanta ne lascia la mano su ogni cella (spalmando porta via quella in più)
      sogliaProtetta: 0.4,    // da qui in su la cella è protetta
      troppa: 1.8,            // da qui in su è una chiazza bianca: va spalmata in giro
      raggioMano: 8.5,        // raggio della mano che spalma (unità del corpo: 1 unità = 2 px di gioco)
      capienzaMano: 26,       // quanta crema può portarsi dietro la mano
      sopraDito: 22,          // col dito l'attrezzo sta tante unità sopra il polpastrello (così si vede)
      // --- il sole ---
      secondiRossoInizio: 21, // secondi di sole perché una cella scoperta diventi rossa, a inizio partita...
      secondiRossoFine: 17,   //   ...e a fine partita (il sole picchia di più)
      rossa: 0.5,             // scottatura da cui la cella è "rossa" e non torna più bianca (1 = rosso aragosta)
      giraA: 0.5,             // a questo punto della partita (0..1) il Bota si gira a pancia in giù
      // --- errori ---
      penalita: 1.5,          // secondi persi se la crema finisce su occhi o bocca
      velSussulto: 30,        // se il Bota si sposta più veloce di così (unità/s) e occhi o bocca finiscono
                              //   sotto la mano, per un quarto di secondo non conta: non è colpa di chi spalma
      // --- disturbi ---
      primoDisturbo: 6,       // secondi prima del primo disturbo
      disturboInizio: 6.5,    // secondi tra un disturbo e l'altro, a inizio partita...
      disturboFine: 4.5,      //   ...e a fine partita
      gabbianoTempo: 3.2,     // secondi che il gabbiano ci mette ad arrivare al tubetto (va cacciato prima)
      gabbianoFurto: 4,       // secondi senza tubetto, se riesce a rubarlo
      raggioSabbia: 15,       // raggio (unità del corpo) della zona che il vento copre di sabbia
      // --- frasi del Bota ---
      frasi: ['Spalma bene eh!', 'Dai che mi scotto!', 'Non lasciarmi le righe!', 'Che caldo oggi!', 'Più su... no, più giù!'],
      frasiFredda: ["Fa freddo 'sta crema!", 'Brrr!', 'È gelata!'],
      frasiTroppa: ['Ma quanta ne metti?!', 'Sembro un fantasma!', 'Piano con quel tubetto!'],
      frasiBrucia: ['Lì mi brucia!', 'Ahia, scotta!', 'Sento friggere!', 'Sto cuocendo!'],
      frasiGira: ['Fammi la schiena!'],
      frasiMuove: { telefono: ["Aspe', il telefono!", 'Un messaggino...'], birra: ['Una birretta!', 'Che sete!'] },
      frasiOcchi: ['NEGLI OCCHI NO!', 'BRUCIAAA!', 'MA DOVE SPALMI?!'],
      frasiOnda: ['È gelata!', "L'acqua no!"],
      frasiSabbia: ['Pure la sabbia!', 'Che vento!'],
    },

    // ---------------------------------------------------------
    guida: {
      titolo: 'Il Passaggiorgio',
      durata: 45,
      colore: 0x3a3a8a,
      ospite: { id: 'giorgio', etichetta: 'STASERA GUIDA:\nGIORGIO' },
      comandi: [
        'Giorgio si infila nelle macchine degli altri: CLICCALO prima che chiuda!',
        'Quando è a terra TRASCINA LE CHIAVI fino a lui: deve guidare lui!',
        'TASTIERA: FRECCE scegli la macchina, SPAZIO lo tiri fuori, INVIO le chiavi',
        'Occhio alle sagome di cartone e agli amici incappucciati',
        'Clic a vuoto: la mano resta ferma per un attimo',
      ],
      comandiTouch: [
        'Giorgio si infila nelle macchine degli altri: TOCCALO prima che chiuda!',
        'Quando è a terra TRASCINA LE CHIAVI fino a lui: deve guidare lui!',
        'Occhio alle sagome di cartone e agli amici incappucciati',
        'Tocco a vuoto: la mano resta ferma per un attimo',
      ],
      obiettivo: 'Fallo guidare almeno 4 volte!',
      obiettivoGuidate: 4,
      // punti
      puntiFuori: 10,          // Giorgio tirato fuori da una macchina
      bonusUltimo: 5,          // ...se era già quasi dentro (oltre "quasiDentro" della finestra)
      quasiDentro: 0.66,
      puntiGuida: 50,          // Giorgio si siede al volante della sua A3
      malusPassaggio: 25,      // riesce a chiudere la portiera: passaggio scroccato
      malusSbagliato: 5,       // tirata fuori la persona sbagliata (l'amico incappucciato)
      bloccoVuoto: 0.85,        // secondi di mano ferma dopo un clic a vuoto
      // tempi
      scopertoInizio: 1.9,     // secondi che Giorgio resta a terra (le chiavi vanno portate prima)
      scopertoFine: 1.3,
      alVolante: 2.4,          // secondi al volante prima di scendere con una scusa
      rientro: 4,              // secondi prima che torni la macchina partita con Giorgio dentro
      raggioChiavi: 22,        // quanto vicino a Giorgio vanno lasciate le chiavi (unità)
      raggioDito: 6,           // col dito si prende un po' più largo
      // Fasi di difficoltà. "da" = secondo da cui vale la fase.
      //  vel = corsa di Giorgio (unità/s), finestra = secondi per tirarlo fuori, finta = probabilità che
      //  cambi macchina all'ultimo, insieme = portiere aperte insieme (le altre con la sagoma di cartone),
      //  travestimento = probabilità di cappuccio e occhiali (con un sosia incappucciato), bagagliaio = probabilità
      //  che si infili nel bagagliaio, pausa = [min,max] secondi prima della corsa successiva
      fasi: [
        { da: 0,  vel: 115, finestra: 1.0,  finta: 0.15, insieme: 1, travestimento: 0,    bagagliaio: 0,    pausa: [0.5, 0.8] },
        { da: 8,  vel: 135, finestra: 0.85, finta: 0.3,  insieme: 2, travestimento: 0.2,  bagagliaio: 0,    pausa: [0.4, 0.7] },
        { da: 16, vel: 155, finestra: 0.75, finta: 0.4,  insieme: 2, travestimento: 0.3,  bagagliaio: 0.25, pausa: [0.3, 0.6] },
        { da: 26, vel: 175, finestra: 0.65, finta: 0.45, insieme: 3, travestimento: 0.3,  bagagliaio: 0.35, pausa: [0.25, 0.5] },
        { da: 36, vel: 195, finestra: 0.55, finta: 0.5,  insieme: 3, travestimento: 0.25, bagagliaio: 0.4,  pausa: [0.2, 0.4] },
      ],
      scuse: ['Stasera bevo io!', "Ce l'ho dal meccanico", 'Tanto passi tu da casa mia', 'Non trovo le chiavi',
        'Mi si è scaricata', 'La mia consuma troppo', 'Guido al ritorno, giuro', 'Ho appena lavato i sedili', 'Non so dove parcheggiare'],
      frasiFuori: ['Ero quasi dentro!', 'Ma dai!', 'Ahia!', 'Uffa...', 'Che cattiveria!'],
      frasiVolante: ['Va bene, va bene...', 'E la benzina chi la paga?', 'Ma torniamo presto, eh'],
      frasiScende: ['Ho scordato il telefono!', 'Mi scappa!', 'Fa un rumore strano...', 'Torno subito!'],
      frasiAmici: ['Miracolo!', 'Fate una foto!', 'Grande Giorgio!', 'Non ci credo!'],
      frasiAutisti: ['Ma scendi!', 'Di nuovo?!', 'Fuori dalla mia macchina!', 'Ancora tu?!'],
      frasiSosia: ['Ehi, io pago la benzina!', 'Ma che fai?!', 'Non sono Giorgio!'],
      frasiCiao: ['Ciao ciao!', 'Grazie del passaggio!', 'Ci vediamo in disco!'],
    },

    // ---------------------------------------------------------
    piovra: {
      titolo: 'Petri Tentacolari',
      durata: 45,
      colore: 0x7a2fa8,
      musica: 'disco',
      ospite: { id: 'petri', etichetta: 'OCCHIO A:\nIL PIOVRA' },
      comandi: [
        'Clicca una ragazza e TRASCINA: disegni la strada fino al tavolo delle amiche',
        'CLIC sui tentacoli del Petri: SCIAF! Mollano la presa',
        'Aiuti (in basso o 1 e 2): SHOTTINO GRATIS (poi clicca dove lanciarlo) e AMICO IN MEZZO',
        'TASTIERA: TAB scegli la ragazza, FRECCE la guidi, SPAZIO schiaffo',
      ],
      comandiTouch: [
        'Tocca una ragazza e TRASCINA: disegni la strada fino al tavolo delle amiche',
        'Tocca i tentacoli del Petri: SCIAF! Mollano la presa (anche con un altro dito)',
        'Aiuti in basso: SHOTTINO GRATIS (poi tocca dove lanciarlo) e AMICO IN MEZZO',
      ],
      obiettivo: 'Fai scappare almeno 10 ragazze!',
      obiettivoSalvate: 10,
      // punti
      puntiSalvata: 10,
      bonusSerie: 5,           // fughe di fila senza nessuna agganciata nel frattempo: +5 alla seconda, +10 alla terza...
      maxBonusSerie: 20,
      malusAgganciata: 15,     // a fine partita, per ogni ragazza ancora agganciata
      // ragazze
      velSegue: 95,            // velocità lungo la strada disegnata (unità/s)
      velBalla: 22,            // mentre balla si sposta piano
      velTrascinata: 45,       // agganciata, il tentacolo la tira verso il Petri
      distanzaChiacchiera: 40, // ...fin qui
      // schiaffi
      raggioTentacolo: 5,      // quanto lontano dal tentacolo vale il colpo (unità, oltre al suo spessore)
      raggioDito: 4,           // col dito un po' di più
      // aiuti
      shottino: { ricarica: 9, durata: 3, velPetri: 170 },
      amico: { ricarica: 11, durata: 4, raggio: 18 },
      amici: ['beppe', 'marsupino', 'guerra', 'sego', 'greg', 'generale', 'ingiocabile', 'zio', 'passaseo', 'bota', 'marco'],
      // Fasi di difficoltà. "da" = secondo da cui vale la fase.
      //  ogni = secondi tra una ragazza nuova e l'altra, max = ragazze in pista insieme, tentacoli = quanti ne usa,
      //  vel = velocità dei tentacoli (unità/s), portata = fin dove arrivano, petri = velocità con cui si sposta
      //  (0 = fermo), reazione = [min,max] secondi prima che un tentacolo libero punti qualcuno
      fasi: [
        { da: 0,  ogni: 3.0, max: 3, tentacoli: 2, vel: 70,  portata: 120, petri: 0,  reazione: [0.9, 1.6] },
        { da: 12, ogni: 2.4, max: 4, tentacoli: 3, vel: 85,  portata: 140, petri: 12, reazione: [0.7, 1.3] },
        { da: 24, ogni: 2.0, max: 5, tentacoli: 4, vel: 100, portata: 160, petri: 20, reazione: [0.5, 1.1] },
        { da: 36, ogni: 1.6, max: 6, tentacoli: 5, vel: 120, portata: 180, petri: 30, reazione: [0.4, 0.9] },
      ],
      // tentacolo a sorpresa (da sotto un tavolino o dalla consolle)
      sorpresaDa: 15,
      sorpresaOgni: [6, 8],
      velSorpresa: 150,
      frasiPetri: ['Ciao, vieni spesso qui?', 'Ti offro da bere?', 'Sai che faccio palestra?', 'Che segno sei?', 'Balli benissimo!', 'Ti posso dire una cosa?'],
      frasiRagazze: ['Aiuto!', 'Le mie amiche mi aspettano!', 'Ma quante mani hai?!', 'Ehm... devo andare', 'Lasciami!'],
      frasiSalva: ['Ciao ciao!', 'Salva!', 'Grazie!', 'Arrivo, ragazze!'],
      frasiSchiaffo: ['Ahia!', 'Era per salutare!', 'Che manesca!', 'Ma dai!'],
      frasiShottino: ['Shottino gratis?! Arrivo!', 'Uno shottino! Mio!', 'Offre la casa?!'],
      frasiAmico: ['Ehi, io no!', 'Petri, calmati!', 'Giù le mani!', 'Fermo lì!'],
    },

    // ---------------------------------------------------------
    scapoli: {
      titolo: "L'Incubo degli Scapoli",
      durata: 50,
      colore: 0x9b3fd6,
      musica: 'pista',        // traccia di audio.js (un'altra da 'disco', che è quella di Petri Tentacolari)
      ospite: { id: 'manna', etichetta: 'LA CALAMITA:\nIL MANNA' },
      comandi: [
        'FRECCE (o WASD), oppure clic sulla pista: muoviti',
        'Fermati vicino a una ragazza: sopra di lei esce una freccia',
        'Premi quella freccia, con calma: tre giuste e balla con te',
        'Non farle arrivare dal Manna: la sua aura le attira',
        'Passa sugli oggetti e usali con SPAZIO: lo saboti',
      ],
      comandiTouch: [
        'Trascina il dito sulla pista: ti muovi',
        'Fermati vicino a una ragazza: sopra di lei esce un cerchio',
        'Tocca il cerchio, con calma: tre volte e balla con te',
        'Non farle arrivare dal Manna: la sua aura le attira',
        'Passa sugli oggetti e tocca SABOTAGGIO: lo saboti',
      ],
      obiettivo: 'Conquista più ragazze del Manna!',
      // --- punti ---
      puntiRagazza: 15,       // per ogni ragazza che balla con te
      puntiSabotaggio: 5,     // per ogni sabotaggio andato a segno
      bonusVittoria: 25,      // se a fine tempo ne hai conquistate più del Manna
      // --- il giocatore ---
      velGiocatore: 108,      // velocità (unità/s)
      // --- le ragazze ---
      maxRagazze: 3,          // quante ce ne sono in pista al massimo
      inizio: 2,              // quante ce ne sono già quando si comincia (la prima è vicina all'aura:
                              //   il Manna parte favorito)
      arrivoInizio: 6.5,      // secondi tra un arrivo e l'altro, a inizio partita...
      arrivoFine: 5,          //   ...e a fine partita
      velRagazze: 18,         // quanto veloci girano per la pista (unità/s)
      curiosa: 0.45,          // quante volte su 1 una ragazza, cambiando posto, passa di suo per l'aura del Manna
                              //   (le altre volte ci gira alla larga). Più è alto, più il Manna è pericoloso
      elastico: 0.1,          // per ogni ragazza di vantaggio che hai, "curiosa" sale di tanto (e scende se sei
                              //   sotto): tiene la gara aperta. 0 = nessun aiuto, né a te né a lui
      curiosaMin: 0.15,       // ...ma non scende mai sotto questo
      curiosaMax: 0.85,       // ...e non sale mai sopra questo
      pazienza: 30,           // dopo tanti secondi senza che nessuno la conquisti, se ne va
      // --- l'aura del Manna ---
      auraInizio: 34,         // raggio dell'aura a inizio partita (unità)...
      auraFine: 50,           //   ...e a fine partita
      attrazione: 17,         // velocità con cui tira a sé una ragazza che gli è vicinissima (unità/s);
                              //   sul bordo dell'aura tira a un terzo
      auraInSfida: 0.4,       // quanto resta dell'attrazione mentre stai facendo colpo su di lei
      muro: 0.2,              // quanto ne resta se ti metti tra lei e lui (0.2 = un quinto)
      raggioMuro: 18,         // quanto puoi stare fuori dalla linea tra lei e lui e fare ancora da muro
      contatto: 13,           // se una ragazza gli arriva così vicina, è sua
      velManna: 10,           // quanto veloce si sposta per la pista quando balla
      mannaInsegue: 0.3,      // quanto si avvicina alla ragazza libera più vicina (0 = resta al centro, 1 = le va addosso)
      // --- fare colpo ---
      raggioColpo: 36,        // quanto vicino devi stare alla ragazza
      attesaColpo: 0.3,       // per quanti secondi devi restarle vicino, fermo, prima che esca la freccia
      frecce: 3,              // quante frecce escono di fila, una alla volta (poi, se serve, si ricomincia)
      tempoFrecciaInizio: 2.4, // secondi che hai per premere ogni freccia, a inizio partita...
      tempoFrecciaFine: 1.9,  //   ...e a fine partita
      pausaFreccia: 0.3,      // respiro tra una freccia e la successiva
      cuoreFreccia: 0.36,     // quanto riempie il cuore una freccia giusta (1 = è tua: ne servono tre, e avanza qualcosa)
      cuoreErrore: 0.12,      // quanto ne toglie una freccia lasciata scadere
      cuoreSbaglio: 0.06,     // quanto ne toglie un tasto sbagliato (la freccia resta lì: puoi riprovare)
      resaAura: 0.5,          // se lei è dentro l'aura del Manna ogni freccia rende la metà
      sogliaSegue: 0.3,       // col cuore pieno almeno così, se ti allontani ti viene dietro (per portarla via dall'aura)
      velSegue: 62,           // ...a questa velocità
      // --- sabotaggi ---
      sabotaggioMin: 6,       // ogni quanti secondi compare un oggetto: tra questo...
      sabotaggioMax: 8,       //   ...e questo
      durate: { drink: 5, mamma: 6, shottino: 5, dj: 6, buttafuori: 6 },   // secondi di effetto di ogni sabotaggio
      auraLento: 0.35,        // col lento del DJ l'aura si riduce a questa frazione
      lentoBonus: 2,          // ...e ogni tua freccia giusta rende il doppio
      // --- gli ultimi secondi ---
      scatenaA: 12,           // a tanti secondi dalla fine il Manna si scatena
      scatenaDurata: 4,       // per quanti secondi
      scatenaAura: 1.6,       // e di quanto si moltiplica l'aura
      // --- frasi ---
      frasi: ['Ciao bella...', 'Lo so, lo so...', 'Non è colpa mia se sono così', 'Tutte da me stasera', 'La pista è mia', 'Piano, una alla volta'],
      frasiPresa: ['E sono altre!', 'Ovviamente.', 'Benvenuta, tesoro', 'Te lo dicevo...'],
      frasiNoia: ['Che noia...', 'Sbadiglio...', 'Tutto qui?', 'Mah.'],
      frasiRisata: ['Ahahah!', 'Ma dai!', 'Simpatico!', 'Mi fai morire!'],
      frasiSabotaggio: {
        drink: ['LA CANOTTIERA!', 'Era bianca! BIANCA!'],
        mamma: ['Sì mà... no mà...', 'Ho mangiato, mà!', 'Torno presto, mà...'],
        shottino: ['Gira tutto...', 'Chi ha mosso la pista?'],
        dj: ['Un lento?! Io?!', 'Non so dove mettere le mani...'],
        buttafuori: ['Ma mi conosce!', 'Li ho lasciati in macchina...'],
      },
      frasiButtafuori: ['Documenti.', 'Lei non entra.', 'Favorisca.'],
    },

    // ---------------------------------------------------------
    retromarcia: {
      titolo: 'Emilio in Retromarcia',
      durata: 50,
      colore: 0x6a8f3a,
      musica: 'rock',          // l'autoradio di Emilio (traccia di audio.js)
      ospite: { id: 'emilio', etichetta: 'AL VOLANTE:\nEMILIO' },
      cast: ['pastaffi'],      // altri personaggi della storia: chi li sceglie qui gioca "contro se stesso"
      comandi: [
        'FRECCE (o WASD), oppure clic sul vialetto: muoviti',
        'Cammina contro un cane: lo spingi via dalla zona rossa',
        'SPAZIO (tieni e lascia) o tasto destro: lanci. Q: cambia',
        'E, o clic sulla sua faccia: Pastaffi porta via un cane',
        'Luci bianche e BIP BIP: la macchina sta per muoversi!',
      ],
      comandiTouch: [
        'Trascina il dito sul vialetto: ti muovi',
        'Cammina contro un cane: lo spingi via dalla zona rossa',
        'Tocca biscotto o pallina, poi il punto dove lanciare',
        'Tocca la faccia di Pastaffi: porta via un cane',
        'Luci bianche e BIP BIP: la macchina sta per muoversi!',
      ],
      obiettivo: 'Fai uscire Emilio dal cancello senza toccare i cani!',
      // --- vite e punti ---
      vite: 3,                 // spaventi che ti puoi permettere (al terzo la partita finisce)
      unitaMetro: 10,          // quante unità di schermo fanno un metro (il vialetto è lungo 25 metri)
      puntiMetro: 4,           // punti per ogni metro fatto dalla macchina
      bonusSalvataggio: 10,    // per ogni cane tolto dalla zona rossa all'ultimo istante
      vicino: 28,              // "all'ultimo istante" = la coda era a meno di tante unità dal cane, con la macchina in moto o in partenza
      attesaSalvataggio: 2.5,  // lo stesso cane non dà un altro bonus prima di tanti secondi
      bonusVita: 20,           // per ogni vita rimasta
      bonusChiamata: 15,       // per ogni chiamata di Pastaffi non usata (solo se Emilio esce dal cancello)
      // --- il giocatore ---
      velGiocatore: 104,       // velocità (unità/s)
      raggioSpinta: 15,        // quanto vicino devi passare a un cane per spingerlo
      velSpinta: 80,           // velocità del cane appena spinto (unità/s)...
      durataSpinta: 0.7,       //   ...per tanti secondi, rallentando: fa una trentina di unità
      spintaFuori: 0.45,       // un cane spinto dentro la corsia della macchina devia di tanto verso il bordo più vicino (0 = va solo dove lo spingi)
      // --- lanci e munizioni ---
      munizioni: { biscotto: 2, pallina: 2 },   // con quante cominci
      maxMunizioni: 4,         // quante ne puoi tenere, per tipo
      gittataMin: 30,          // il lancio più corto (SPAZIO appena toccato)...
      gittataMax: 150,         //   ...e il più lungo (nemmeno col mouse o col dito si va oltre)
      periodoForza: 1.4,       // secondi perché la forza salga e riscenda, tenendo SPAZIO
      durataOggetto: 7,        // secondi che biscotto o pallina restano a terra se nessuno li prende
      mangia: 2.4,             // secondi che il goloso ci mette a finire il biscotto
      giocaPallina: 3.6,       // secondi che l'altro si tiene la pallina
      nuoveInizio: 6,          // ogni quanti secondi compare una munizione da raccogliere, a inizio partita...
      nuoveFine: 4.5,          //   ...e a fine partita
      maxInGiro: 2,            // quante ce ne possono essere in giro da raccogliere
      // --- la macchina di Emilio ---
      primaPartenza: 2.4,      // secondi prima del primo movimento
      velInizio: 11,           // velocità di uno scatto (unità/s), a inizio partita...
      velFine: 21,             //   ...e a fine partita (ogni scatto varia del 20% in più o in meno)
      scatto: [1.1, 2.2],      // quanto dura uno scatto (secondi): tra questo e questo
      pausaInizio: 1.6,        // quanto sta ferma tra uno scatto e l'altro, a inizio partita...
      pausaFine: 0.9,          //   ...e a fine partita
      avvisoInizio: 1.2,       // secondi di luci bianche e "bip bip" prima che parta, a inizio partita...
      avvisoFine: 0.9,         //   ...e a fine partita
      accelerazione: 40,       // quanto in fretta prende velocità (unità/s²)
      frenata: 70,             //   ...e quanto in fretta si ferma
      arrivo: 0.82,            // Emilio conta di essere fuori a questo punto della partita (0.82 = a 41 secondi su 50)
      curvaArrivo: 1.35,       // la sua tabella di marcia: 1 = regolare, più di 1 = piano all'inizio e forte alla fine
      recupero: 5,             // se è in ritardo sulla tabella (uno spavento, una frenata) accelera: più è alto, più recupera in fretta
      recuperoMax: 1.45,       //   ...ma mai più di tanto (1.45 = il 45% più svelto del normale)
      zona: 46,                // lunghezza della zona rossa dietro la macchina (unità)
      distrattoDa: 0.3,        // da che punto della partita (0 = inizio, 1 = fine) comincia a distrarsi
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
      // --- Pastaffi, l'aiuto da casa ---
      pastaffi: {
        chiamate: 2,           // quante volte lo puoi chiamare (mettilo a 1 per renderlo più raro)
        velCorsa: 135,         // quanto corre quando esce (unità/s)
        velCarico: 52,         //   ...e quanto va piano col cane in braccio (lo Shar Pei pesa)
        frenata: 1,            // secondi che Emilio resta inchiodato quando sente "PAPÀ, FERMO!"
        sosta: 7,              // secondi che il cane resta nel prato dopo che ce l'ha portato
      },
      // --- il gatto ---
      gatto: {
        a: 15,                 // a tanti secondi dalla fine passa il gatto
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
      frasiPastaffi: ['PAPÀ, FERMO!'],
      frasiCarico: ['Quanto pesi!', 'Sei tutto pieghe!', 'Dai, su...'],
    },
  },

  // Frasi di sfottò della classifica finale. Vengono sostituiti: {primo} (chi ha vinto), {secondo},
  // {ultimo} (chi è arrivato in fondo: in due è chi ha perso) e {tutti} (tutti i nomi in fila).
  // Le frasi che nominano un personaggio non escono se quel personaggio è il primo o l'ultimo.
  sfotto: [
    "{ultimo}, pure Beppe con una mano sola faceva meglio.",
    "{ultimo}, stasera il giro lo offri tu. A tutti.",
    "{primo} ti ha asfaltato peggio della Golf di ReGrorio.",
    "{ultimo}, hai i riflessi di una moka spenta.",
    "{ultimo}: tanta buona volontà, zero risultati.",
    "Dai {ultimo}, l'importante è partecipare. Dicono.",
    "{ultimo}, O'Sfurnacchiat si rade meglio da solo. Al buio.",
    "{primo} vince. {ultimo} porta i taralli.",
    "{ultimo}, ti ha battuto pure a mani in tasca.",
    "{ultimo}, chiedi la rivincita finché hai ancora dignità.",
    "{ultimo}, Marsupino ti ha farcito il panino col calzino.",
    "{ultimo}, non prendi al volo nemmeno un würstel.",
    "{primo} fa panini gourmet, {ultimo} solo pane secco.",
    "{ultimo}, con quei riflessi Guerra mangia gratis a vita.",
    "{ultimo}, Guerra ti ha svuotato i piatti e pure il frigo.",
    "{primo} difende la cena, {ultimo} stasera digiuna.",
    "{ultimo}, Sego è ancora in casa che ride di te.",
    "{ultimo}, con quella mira non affumichi nemmeno un salame.",
    "{primo} ha stanato Sego, {ultimo} solo i piccioni.",
    "{ultimo}, il Bota per colpa tua stanotte dorme in piedi.",
    "{primo} abbronza, {ultimo} arrostisce: chiedete al Bota.",
    "{ultimo}, spalmava meglio il gabbiano. E ti ha pure fregato il tubetto.",
    "{ultimo}, pure Giorgio stasera ha guidato più di te.",
    "{ultimo}, a te non danno un passaggio neanche gli scrocconi.",
    "{primo} ha messo Giorgio al volante. {ultimo} non trova neanche la freccia.",
    "{ultimo}, il Piovra ti ha battuto pure a te.",
    "{ultimo}, il Petri rimorchia più di te. Coi tentacoli.",
    "{primo} libera la pista, {ultimo} libera solo il guardaroba.",
    "{ultimo}, in pista ti ha notato solo il buttafuori.",
    "{primo} balla, {ultimo} regge il muro. E il Manna ringrazia.",
    "{ultimo}, pure la mamma del Manna aveva più ritmo di te.",
    "{ultimo}, Emilio in retromarcia ci vede meglio di te in avanti.",
    "{ultimo}, gli Shar Pei hanno meno pieghe della tua strategia.",
    "{primo} salva i cani, {ultimo} non salva nemmeno la faccia. Rock'n'roll!",
  ],
  // ...e queste solo da tre giocatori in su (si aggiungono a quelle sopra)
  sfottoTanti: [
    "{ultimo} paga il giro al PowerStation.",
    "{primo} sul gradino più alto, {secondo} a rosicare, {ultimo} a lavare i bicchieri.",
    "{secondo}, c'eri quasi. Quasi. {primo} ringrazia.",
    "{tutti}: una serata così non si vedeva da anni. Soprattutto per {ultimo}.",
    "{ultimo}, la prossima volta porta almeno i taralli.",
    "{primo} vince, {secondo} applaude a denti stretti, {ultimo} cerca le chiavi per andare via.",
    "Podio per {primo} e {secondo}. Per {ultimo} c'è lo sgabello in fondo al bancone.",
    "{ultimo}, pure la corona di {primo} ha fatto più punti di te.",
  ],
  frasiPareggio: [
    'Pareggio! Rivincita obbligatoria, paga chi perde.',
    'Pari e patta. Beppe scuote la testa.',
  ],
};
