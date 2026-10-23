// Configurazione del microgioco 'La ballata del Pallaio' (id: ballata).
// Durata, comandi, obiettivo, punti, difficoltà, le ballate e le loro vignette: si cambiano qui senza
// toccare la logica. (Il microgioco è in js/microgames/BallataScene.js.)
export default {
  titolo: 'La ballata del Pallaio',
  verbo: 'RIORDINA!',       // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x7a4a9a,
  musica: 'ballata',
  ospite: { id: 'lori', etichetta: 'CANTA PER VOI:\nLORI' },
  comandi: [
    'Trascina una vignetta su un\'altra casella: si scambiano (o clicca la vignetta, poi la casella)',
    'Lori canta la strofa e la bacchetta cade sulla casella illuminata: lì ci vuole quella scena',
    'Tastiera: FRECCE il cursore, SPAZIO prendi e lascia, INVIO rigira una vignetta girata',
  ],
  comandiTouch: [
    'Trascina una vignetta su un\'altra casella: si scambiano',
    'Lori canta la strofa e la bacchetta cade sulla casella illuminata: lì ci vuole quella scena',
    'Una folata gira una vignetta? Toccala per rigirarla',
  ],
  obiettivo: 'Almeno 5 strofe giuste su 8!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. stringi = gli elenchi a tempo i cui atti si stringono nei 15 secondi
  lampo: { obiettivo: 'Almeno 3 strofe giuste su 4!' },
  // Medaglie (js/punteggi.js): la scala comune (bronzo 100, argento 200, oro 300). 5 strofe giuste
  // (l'obiettivo) sono il bronzo: la k-esima strofa giusta vale di più della precedente.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoStrofe: 5,
  // punti: la k-esima bacchettata giusta vale puntiStrofa + crescitaStrofa x (k - 1), per la serie
  // (1 + serie x (giuste di fila - 1)); più bonusMorale se a fine canzone sono tutte al posto giusto
  puntiStrofa: 10,
  crescitaStrofa: 5,
  serie: 0.1,
  bonusMorale: 60,
  // la canzone (120 battiti al minuto: un ottavo è 1/4 di secondo; nel terzo atto Lori accelera fino a
  // tempoFinale). Le bacchettate, in ottavi dall'inizio, sempre sul primo o sul terzo battito della
  // battuta (la battuta forte): ogni strofa su una casella diversa, scelta col seme. Il terzo atto
  // comincia all'ottavo 96 (24 secondi), e le ultime due bacchettate sono ravvicinate
  colpi: [16, 32, 44, 64, 80, 104, 120, 128],
  tempoFinale: 1.15,
  // in Lampo (15 secondi, i primi due atti) la ballata si accorcia: si gioca solo la riga in alto, con
  // le prime tre strofe e la morale
  colpiLampo: [16, 28, 40, 52],
  strofeLampo: [0, 1, 2, 7],
  // i tre atti: da quando (secondi), annuncio, quante caselle si giocano (le altre sono sotto il telo),
  // quanti ottavi prima del colpo la casella si illumina e la bacchetta si alza, ogni quanti secondi
  // una folata di vento (gira una vignetta o ne scambia due già sistemate), probabilità di una finta
  atti: [
    { da: 0, nome: 'LA PRIMA STROFA', caselle: 4, preavviso: 12 },
    { da: 12, nome: 'IL VENTO', caselle: 6, preavviso: 10, folata: [3.6, 5], finta: 0.5 },
    { da: 24, nome: 'IL GRAN FINALE', caselle: 8, preavviso: 8, folata: [4, 6], finta: 0.3 },
  ],
  finta: 4,                 // ottavi prima del colpo in cui la bacchetta passa dalla casella finta a quella vera
  frasiGiusta: ['OOOH!', 'BRAVO!', 'CHE STORIA!', 'BIS!'],
  frasiRisate: ['AH AH AH!', 'MA COSA CANTA?!', 'HAHAHA!', 'BUUU!'],
  frasiLori: ['Garzone!', 'Ma chi le ha appese?!', 'Te la faccio pagare!', 'Ma dai!'],

  // Le ballate: il seme del round ne sceglie una. Ognuna ha 8 strofe, l'ultima è la morale. Ogni
  // strofa: inizio e fine (due mezze righe), "scena" (come la nomina Lori quando la vignetta finisce
  // nel posto sbagliato: "...e la Panda finì... a ballare col Manna?!") e la vignetta, disegnata coi
  // personaggi e gli oggetti del gioco: sfondo (uno sfondo dei microgiochi, e la parte da mostrare,
  // da 0 a 1), chi [id della texture, x, y, grandezza] e cosa [texture, x, y, grandezza, angolo];
  // sopra, come cosa, ma disegnati davanti alle figure. (x e y vanno da -1 a 1 dentro la vignetta;
  // le figure stanno coi piedi in y; gli oggetti hanno il lato lungo largo grandezza / 2 vignette.)
  ballate: [
    {
      titolo: 'La ballata del Passaggiorgio',
      strofe: [
        { inizio: 'Gente del Pallaio, venite a sentire', fine: 'di Giorgio che a piedi non voleva più ire!', scena: 'Giorgio al bar del Pallaio',
          vignetta: { sfondo: ['bgPallaio', 0.5], chi: [['giorgio_felice', 0, 1, 1]], cosa: [['pintaBirra', 0.55, 0.3, 0.6]] } },
        { inizio: 'Le chiavi le nasconde in fondo al bicchiere', fine: 'così stasera guida qualcun altro, a dovere!', scena: 'le chiavi nel bicchiere',
          vignetta: { sfondo: ['bgPallaio', 0.2], cosa: [['pintaBirra', 0, 0.25, 1.1], ['chiavi', 0.05, 0.35, 0.9, 0.4]] } },
        { inizio: 'Si infila di soppiatto nell\'auto di un amico', fine: 'e si siede dietro, tranquillo come un fico!', scena: 'Giorgio nascosto nell\'auto di un amico',
          vignetta: { sfondo: ['bgParcheggio', 0.3], chi: [['giorgioSera_felice', 0.22, 0.62, 0.8]], sopra: [['auto_suv', -0.04, 0.6, 1.75]] } },
        { inizio: 'Ma c\'è la sua A3, ferma dal diciannove', fine: 'coperta di polvere e di ragnatele nuove!', scena: 'l\'A3 ferma dal 2019',
          vignetta: { sfondo: ['bgParcheggio', 0.7], cosa: [['auto_a3', -0.08, 0.62, 1.35], ['cartello2019', 0.6, 0.05, 0.75, 0.1]] } },
        { inizio: 'Gli amici lo afferrano e gli danno le chiavi', fine: '«Stasera guidi tu!», gridano i più bravi!', scena: 'Giorgio costretto al volante',
          vignetta: { sfondo: ['bgParcheggio', 0.5], chi: [['giorgioSera_sufficienza', -0.3, 1, 1]], cosa: [['chiavi', 0.4, 0.1, 1.1, -0.3]] } },
        { inizio: 'Arrivano alla disco, il parcheggio è pieno', fine: 'e Giorgio gira e rigira come un treno!', scena: 'il parcheggio della disco',
          vignetta: { sfondo: ['bgParcheggio', 0.55], cosa: [['auto_a3', 0.08, 0.62, 1.35], ['pallaDisco', 0.55, -0.5, 0.75], ['nota', -0.55, -0.45, 0.6]] } },
        { inizio: 'E al ritorno, chi guida? Indovinate un po\'', fine: 'Giorgio dietro in cuffia, che russa e dice: «No!»', scena: 'Giorgio dietro con le cuffie',
          vignetta: { sfondo: ['bgParcheggio', 0.9], chi: [['giorgioCuffie', 0, 1, 1]], cosa: [['nota', 0.55, -0.4, 0.9], ['nota', -0.5, -0.6, 0.7]] } },
        { inizio: 'La morale è questa, e ve la dico in rima:', fine: 'chi scrocca un passaggio poi guida... la prossima!', scena: 'la morale della favola',
          vignetta: { morale: true, chi: [['giorgio_felice', 0, 1, 0.8]], cosa: [['chiavi', 0.55, 0.3, 0.8]] } },
      ],
    },
    {
      titolo: 'La leggenda del Piovra',
      strofe: [
        { inizio: 'Le ragazze entrano in disco, belle e sorridenti', fine: 'non sanno che il Piovra già digrigna i denti!', scena: 'le ragazze che entrano in disco',
          vignetta: { sfondo: ['bgDisco', 0.3], chi: [['ragazza0_felice', -0.35, 1, 0.9], ['ragazza1_felice', 0.35, 1, 0.9]] } },
        { inizio: 'Il Petri le avvista dal fondo del locale', fine: 'e punta il bersaglio come un generale!', scena: 'il Petri che punta il bersaglio',
          vignetta: { sfondo: ['bgDisco', 0.7], chi: [['petri_sufficienza', -0.3, 1, 1]], cosa: [['cerchioSfida', 0.45, -0.1, 0.8]] } },
        { inizio: 'I tentacoli si allungano sopra la pista', fine: 'più lunghi di una fila al bar, a prima vista!', scena: 'i tentacoli sulla pista',
          vignetta: { sfondo: ['bgPista', 0.5], chi: [['petri_felice', 0, 1, 1]], tentacoli: true } },
        { inizio: '«Vieni spesso qui?», fa il Piovra sorridente', fine: 'e la ragazza sbadiglia, poveretta, sofferente!', scena: 'il Piovra che chiede «vieni spesso qui?»',
          vignetta: { sfondo: ['bgDisco', 0.5], chi: [['petri_felice', -0.35, 1, 1], ['ragazza2_sufficienza', 0.4, 1, 0.9]] } },
        { inizio: 'Ma l\'amico gli lancia una birra bella fresca', fine: 'e il Piovra ci si tuffa come un pesce all\'esca!', scena: 'la birra lanciata al Piovra',
          vignetta: { sfondo: ['bgDisco', 0.2], chi: [['petri_shock', -0.3, 1, 1]], cosa: [['birraPetri', 0.45, -0.2, 1.1, 0.5]] } },
        { inizio: 'Le ragazze scappano verso le amiche', fine: 'ridendo come matte, leggere come spighe!', scena: 'la fuga verso le amiche',
          vignetta: { sfondo: ['bgDisco', 0.9], chi: [['ragazza0_felice', -0.3, 1, 0.85], ['ragazza3_felice', 0.4, 1, 0.85]], cosa: [['cuore', 0, -0.6, 0.7]] } },
        { inizio: 'E il Piovra resta solo in mezzo alla pista', fine: 'con otto tentacoli, e nessuna in vista!', scena: 'il Piovra solo in pista',
          vignetta: { sfondo: ['bgPista', 0.3], chi: [['petri_triste', 0, 1, 1]], cosa: [['pallaDisco', 0.55, -0.55, 0.6]] } },
        { inizio: 'La morale, signori, la sa anche il barista:', fine: 'chi allunga le mani resta solo in pista!', scena: 'la morale della favola',
          vignetta: { morale: true, chi: [['petri_triste', 0, 1, 0.8]], cosa: [['cuore', 0.55, 0.2, 0.7]] } },
      ],
    },
    {
      titolo: 'Il re della Golf',
      strofe: [
        { inizio: 'C\'era una volta il re di una Golf bianca', fine: 'ReGrorio la guida, e mai che si stanca!', scena: 'ReGrorio e la sua Golf',
          vignetta: { sfondo: ['bgStrada', 0.4], cosa: [['auto_golf', 0.3, 0.62, 1.35]], chi: [['greg_felice', -0.48, 1, 0.9]] } },
        { inizio: 'La lava ogni giorno con la spugna e il sapone', fine: 'la lustra e la bacia come un campione!', scena: 'ReGrorio che lava la Golf',
          vignetta: { sfondo: ['bgStrada', 0.7], cosa: [['auto_golf', 0.28, 0.62, 1.35], ['stella', 0.55, -0.35, 0.5], ['stella', 0.1, -0.6, 0.4]], chi: [['greg_felice', -0.52, 1, 0.8]] } },
        { inizio: 'Si mette la corona e parte di sera', fine: 're della strada, con la faccia più fiera!', scena: 'ReGrorio con la corona',
          vignetta: { sfondo: ['bgStrada', 0.1], chi: [['greg_sufficienza', 0, 1, 1]], cosa: [['coronaRe', 0, -0.72, 1]] } },
        { inizio: 'Ma dal fondo del viale le Golf arrivano a frotte', fine: 'e lui salta di lato, di giorno e di notte!', scena: 'le Golf che arrivano a frotte',
          vignetta: { sfondo: ['bgStrada', 0.5], cosa: [['golfGiu0', -0.32, 0.4, 0.75], ['golfGiu0', 0.34, 0.05, 0.75], ['cartelloPericolo', 0, -0.62, 0.5]] } },
        { inizio: 'Con un salto le schiva, all\'ultimo istante', fine: 'e la folla grida: «Che re elegante!»', scena: 'il salto all\'ultimo istante',
          vignetta: { sfondo: ['bgStrada', 0.9], chi: [['greg_shock', 0, 0.75, 1]], cosa: [['chevron', -0.55, 0.4, 0.8], ['chevron', 0.55, 0.4, 0.8]] } },
        { inizio: 'Raccoglie le monete che cadono dal cielo', fine: 'e se le mette in tasca con un certo zelo!', scena: 'ReGrorio con le monete',
          vignetta: { sfondo: ['bgStrada', 0.3], chi: [['greg_felice', 0, 1, 1]], cosa: [['monetaRe', -0.55, -0.45, 0.45], ['monetaRe', 0.55, -0.3, 0.45], ['monetaRe', 0.1, -0.68, 0.45]] } },
        { inizio: 'Arriva a fine strada con la Golf tutta intera', fine: 'col sorriso di chi ha fatto la sua sera!', scena: 'ReGrorio salvo a fine strada',
          vignetta: { sfondo: ['bgStrada', 0.6], cosa: [['auto_golf', 0.3, 0.62, 1.35], ['stella', -0.55, -0.55, 0.5]], chi: [['greg_felice', -0.45, 1, 0.9]] } },
        { inizio: 'La morale è chiara, scolpitela nel marmo:', fine: 'per essere re basta schivare con garbo!', scena: 'la morale della favola',
          vignetta: { morale: true, chi: [['greg_felice', 0, 1, 0.8]], cosa: [['coronaRe', 0, -0.25, 0.7]] } },
      ],
    },
    {
      titolo: 'La pizza dal Boni',
      strofe: [
        { inizio: 'Il Boni fa la pizza nel suo forno a legna', fine: 'e chi non è invitato si attacca e si rassegna!', scena: 'il Boni al forno a legna',
          vignetta: { sfondo: ['bgTaverna', 0.15], chi: [['boni_pala', 0.1, 1, 1]] } },
        { inizio: 'Non invita mai il Sego, non invita mai Oli', fine: '«Stasera pizza? No, mangiate da soli!»', scena: 'il Boni che non invita nessuno',
          vignetta: { sfondo: ['bgTaverna', 0.95], chi: [['boni_beccati', -0.25, 1, 1]], cosa: [['portaChiusa', 0.62, 0.42, 1.25]] } },
        { inizio: 'Ma Oli e il Sego entrano di nascosto', fine: 'in punta di piedi, e ognuno al suo posto!', scena: 'gli imbucati che entrano di nascosto',
          vignetta: { sfondo: ['bgTaverna', 0.8], chi: [['oli_felice', -0.35, 1, 0.9], ['sego_felice', 0.35, 1, 0.9]] } },
        { inizio: 'Il Sego s\'infila sotto la tovaglia a quadri', fine: 'si vedono le scarpe, come due ladri!', scena: 'il Sego sotto la tovaglia',
          vignetta: { sfondo: ['bgTaverna', 0.7], chi: [['sego_shock', 0.05, 1.4, 0.7]], sopra: [['tavolaTaverna', 0, 0.12, 2.3]] } },
        { inizio: 'Oli si siede con la maschera di Giorgio sul viso', fine: 'ma da sotto il cartone gli scappa un sorriso!', scena: 'Oli con la maschera di Giorgio',
          vignetta: { sfondo: ['bgTaverna', 0.6], chi: [['oli_normale', 0, 1, 1]], maschera: true } },
        { inizio: 'Poi qualcuno sulla pizza ci mette l\'ananas', fine: 'e il Boni diventa viola, e non è per il gas!', scena: 'l\'ananas sulla pizza',
          vignetta: { sfondo: ['bgTaverna', 0.3], chi: [['boni_rabbia', -0.45, 1, 0.9]], cosa: [['pizzaCotta', 0.42, 0.42, 1.05], ['ing_ananas', 0.32, 0.36, 0.4, 0.3], ['ing_ananas', 0.52, 0.48, 0.4, -0.5], ['ing_ananas', 0.46, 0.28, 0.4, 1.2]] } },
        { inizio: 'Strappa la maschera, solleva la tovaglia', fine: 'e con la pala li caccia: che battaglia!', scena: 'il Boni che li caccia con la pala',
          vignetta: { sfondo: ['bgTaverna', 0.9], chi: [['boni_caccia', -0.35, 1, 0.9], ['oli_shock', 0.4, 1, 0.75], ['sego_shock', 0.75, 1, 0.7]] } },
        { inizio: 'La morale, amici, è facile da ricordare:', fine: 'alla pizza del Boni non ci si deve imbucare!', scena: 'la morale della favola',
          vignetta: { morale: true, chi: [['boni_felice', 0, 1, 0.8]], cosa: [['fettaPizza', 0.55, 0.3, 0.6]] } },
      ],
    },
    {
      titolo: 'L\'Incubo degli Scapoli',
      strofe: [
        { inizio: 'Il Manna entra in pista con la collanina d\'oro', fine: 'e tutte le ragazze lo guardano in coro!', scena: 'il Manna che entra in pista',
          vignetta: { sfondo: ['bgPista', 0.5], chi: [['manna_occhiolino', 0, 1, 1]] } },
        { inizio: '«Chi vuole ballare?», dice con l\'occhiolino', fine: 'e gli scapoli tremano come un budino!', scena: 'il Manna che fa l\'occhiolino',
          vignetta: { sfondo: ['bgPista', 0.2], chi: [['manna_colpo', -0.25, 1, 1]], cosa: [['cuore', 0.55, -0.4, 0.8]] } },
        { inizio: 'Ma gli scapoli lo sfidano a colpi di frecce', fine: 'su, giù, destra, sinistra, e mille piroette!', scena: 'la sfida a colpi di frecce',
          vignetta: { sfondo: ['bgPista', 0.8], cosa: [['frecciaBallo', -0.5, 0, 0.7, 0], ['frecciaBallo', 0, -0.2, 0.7, 1.57], ['frecciaBallo', 0.5, 0, 0.7, 3.14]] } },
        { inizio: 'Il Manna balla in due tempi, avanti e indietro', fine: 'che a guardarlo si appanna perfino il vetro!', scena: 'il Manna che balla in due tempi',
          vignetta: { sfondo: ['bgPista', 0.4], chi: [['manna_balla1', 0, 1, 1]], cosa: [['nota', 0.6, -0.5, 0.9]] } },
        { inizio: 'Una ragazza si stanca e passa dall\'altra parte', fine: 'e il Manna resta lì, senza arte né parte!', scena: 'la ragazza che cambia parte',
          vignetta: { sfondo: ['bgPista', 0.6], chi: [['tipa0_felice', 0.2, 1, 0.9]], cosa: [['cuore', -0.45, -0.3, 0.9]] } },
        { inizio: 'Gli si macchia la camicia di aranciata', fine: 'e il Manna si dispera: «Serata rovinata!»', scena: 'la macchia sulla camicia del Manna',
          vignetta: { sfondo: ['bgPista', 0.3], chi: [['manna_macchia', 0, 1, 1]] } },
        { inizio: 'Alla fine se ne va, toccandosi la collana', fine: 'solo, nella notte, per la strada lontana!', scena: 'il Manna che torna a casa da solo',
          vignetta: { sfondo: ['bgStrada', 0.2], chi: [['manna_collana', 0, 1, 1]] } },
        { inizio: 'La morale è questa, e la sa tutto il Pallaio:', fine: 'chi balla da solo... finisce nel pollaio!', scena: 'la morale della favola',
          vignetta: { morale: true, chi: [['manna_triste', 0, 1, 0.8]], cosa: [['frecciaBallo', 0.55, 0.25, 0.5, 1.57]] } },
      ],
    },
  ],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { atti: { preavviso: 1.3, folata: 1.4, finta: 0.5 }, tempoFinale: 1 },
    difficile: { atti: { preavviso: 0.8, folata: 0.75, finta: 1.5 }, tempoFinale: 1.3 },
  },
};
