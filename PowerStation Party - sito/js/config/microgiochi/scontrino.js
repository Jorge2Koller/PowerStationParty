// Configurazione del microgioco 'Scontrino, prego!' (id: scontrino).
// Durata, comandi, obiettivo, punti, difficoltà, trucchi e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/ScontrinoScene.js; questa sezione arriva in CONFIG.microgiochi.scontrino.)
// La pizzeria al taglio si chiama come dice nomeLocale: è il nome sull'insegna, sulla polo di Michele
// e nei testi (anche negli atti, al posto di {locale}).
export default {
  titolo: 'Scontrino, prego!',
  verbo: 'SCONTRINO!',      // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x2f7a5a,
  musica: 'osteria',
  nomeLocale: 'Da Michele',
  // Michele alla cassa; il Giso, il paladino degli scontrini, in primo piano (chi gioca è il suo vice).
  // Chi sceglie Michele o il Giso qui gioca "contro se stesso"
  ospite: { id: 'michele', etichetta: 'ALLA CASSA:\nMICHELE' },
  cast: ['giso'],
  comandi: [
    'Lo scontrino vero: tasti, prezzo, "trrr" e foglio in mano',
    'Senza scontrino? SPAZIO o clic prima che arrivi alla porta',
    'Vale per il primo verso la porta (la freccia). Falso: -5',
  ],
  comandiTouch: [
    'Lo scontrino vero: tasti, prezzo, "trrr" e foglio in mano',
    'Senza scontrino? Tocca, ovunque, prima che arrivi alla porta',
    'Vale per il primo verso la porta (la freccia). Falso: -5',
  ],
  obiettivo: 'Becca 6 imbrogli, con al massimo 2 falsi allarmi!',
  // Medaglie (js/punteggi.js): la scala comune (bronzo 100, argento 200, oro 300). L'obiettivo è il
  // bronzo: finché non è raggiunto (6 imbrogli presi e non più di 2 falsi allarmi) il totale si ferma a
  // tettoPrima; quando lo è, sale almeno al bronzo. Argento e oro vengono dai punti.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoPresi: 6,
  maxFalsi: 2,
  obiettivoLampo: 3,        // in Lampo (15 secondi): 3 imbrogli, al massimo 1 falso allarme; lì le
  maxFalsiLampo: 1,         // medaglie non contano e i punti sono quelli e basta
  tettoPrima: 90,

  // --- punti ---
  // un imbroglio scoperto vale preso, più subito se lo becchi entro "secondiSubito" da quando il
  // cliente si gira verso la porta, per il moltiplicatore della serie (imbrogli presi di fila: un falso
  // allarme o uno che scappa la azzerano). Un falso allarme toglie falso punti (mai sotto zero).
  // Ogni serata ha i suoi imbrogli (di più a DIFFICILE, di meno a FACILE): i punti degli imbrogli si
  // contano in proporzione, così una serata perfetta (tutti presi subito, nessun falso allarme) fa
  // sempre "perfetta" punti (l'oro vuole quasi tutto preso subito). In Lampo i punti sono quelli e basta.
  punti: { preso: 10, subito: 5, falso: 5 },
  secondiSubito: 0.6,
  serie: [[3, 1.5], [5, 2]],   // [dopo quanti presi di fila, moltiplicatore]
  perfetta: 360,

  // --- i tempi (secondi) ---
  // finestra = da quando il cliente si gira a quando arriva alla porta (ed esce)
  finestra: 2.0,
  // ritmo = moltiplica tutti i tempi di Michele (più alto: più lento, i trucchi si vedono meglio)
  ritmo: 1,
  // entra = dall'arco alla vetrina; entraCassa = dall'arco dritto alla cassa (chi prende il cartone da
  // asporto); sceglie = davanti alla vetrina; taglio e incarta = Michele col trancio; allaCassa = dalla
  // vetrina alla cassa; paga = i soldi nel cassetto ("cling"); annulla = quanto dopo che il cliente si è
  // girato Michele annulla lo scontrino; cambio = quanto dopo che un cliente si è girato il prossimo
  // arriva alla cassa
  tempi: { entra: 1.0, entraCassa: 1.4, sceglie: 0.45, taglio: 0.75, incarta: 0.3, allaCassa: 0.45, paga: 0.35, annulla: 0.35, cambio: 0.22 },
  // quanto dura, dopo che il cliente ha pagato, quello che fa Michele: lo scontrino vero (onesto) o un trucco
  segnali: { onesto: 0.9, classico: 0.55, finta: 0.8, strappo: 1.15, annullo: 0.9, voce: 1.05 },
  // facile: i trucchi "più evidenti" (lo scontrino in mano ai clienti più grande, il display che lampeggia)
  evidenti: false,

  // --- i trucchetti di Michele ---
  // Si riconoscono sempre, guardando e ascoltando: lo scontrino vero ha i tasti, il display col prezzo,
  // il "trrr" della stampante e lo scontrino bianco in mano al cliente. daAtto = da che atto compare.
  //   IL CLASSICO: niente tasti, niente stampante, niente scontrino
  //   LA FINTA: la mano batte sui tasti, ma il display resta a zero, la stampante zitta, non esce niente
  //   LO STRAPPO: lo scontrino esce, ma lui lo strappa e se lo mette in tasca prima di darlo
  //   L'ANNULLO: lo batte e lo dà, il cliente si gira e lui lo annulla (bip basso, display rosso ANNULLATO)
  //   IL CONTO A VOCE: "Fanno 6 euro, lascia stare!", senza toccare la cassa
  trucchi: [
    { id: 'classico', nome: 'IL CLASSICO', daAtto: 1 },
    { id: 'finta', nome: 'LA FINTA', daAtto: 1 },
    { id: 'strappo', nome: 'LO STRAPPO', daAtto: 2 },
    { id: 'annullo', nome: "L'ANNULLO", daAtto: 2 },
    { id: 'voce', nome: 'IL CONTO A VOCE', daAtto: 3 },
  ],

  // I tre atti: la stessa pizzeria, la serata si scalda. da = secondo d'inizio (daLampo: in Lampo, dove
  // si parte dall'ora di punta: il primo atto, lento, lì non c'è);
  // cadenza = ogni quanti secondi entra un cliente; imbrogli = quanti clienti su 1 escono senza
  // scontrino (se Michele riesce); taglio = quanti su 1 vogliono il trancio tagliato (gli altri il
  // cartone da asporto, già pronto); ritmo = moltiplica i tempi di Michele in quell'atto; finestra =
  // moltiplica la finestra; distrazioni = quante (teglia fumante, telefono, birra, "la margherita?")
  atti: [
    { da: 0, daLampo: -1, nome: 'SI APRE!', cadenza: 3.0, imbrogli: 0.7, taglio: 1, ritmo: 1.1, finestra: 1, distrazioni: 0 },
    { da: 12, daLampo: 0, nome: 'ORA DI PUNTA!', cadenza: 1.5, imbrogli: 0.65, taglio: 0.25, ritmo: 1, finestra: 1, distrazioni: 0 },
    { da: 24, daLampo: 7, nome: 'SABATO SERA {locale}!', cadenza: 1.15, imbrogli: 0.7, taglio: 0, ritmo: 0.8, finestra: 0.9, distrazioni: 4 },
  ],
  distrazioni: ['teglia', 'telefono', 'birra', 'margherita'],
  // quanti imbrogli (che arrivano alla porta prima della fine) può avere una serata, e almeno quanti
  // clienti onesti: il seme del round sceglie sempre una serata così, perché l'obiettivo si possa
  // sempre fare e chi preme SCONTRINO! per tutti faccia più falsi allarmi di quanti ne sono permessi
  imbrogli: [9, 12],
  onesti: 4,
  imbrogliLampo: [4, 6],
  onestiLampo: 2,
  prezzi: [3.5, 4, 4.5, 5, 5.5, 6, 7.5],

  // --- le frasi ---
  frasiGiso: ['Scusi! Lo scontrino!', 'Lo scontrino è un diritto!', 'Le tasse le paghiamo tutti!', 'Non mi muovo finché non lo vedo!'],
  frasiBeccato: ['Ma è un amico!', 'Dopo te lo faccio, dopo!', 'Ma che sei, la Finanza?'],
  frasiFalso: ['Eccolo, contento?'],
  frasiVoce: ['Fanno {prezzo}, lascia stare!', 'Sono {prezzo}, lascia stare!', 'Dai, {prezzo} e lascia stare!'],
  frasiMargherita: ["Ce l'ha la margherita?"],
  frasiFinanza: ['Multa!', 'Favorisca!'],
  titoli: ['MICHELE, MULTATO!', 'TUTTO IN NERO!'],

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { ritmo: 1.1, finestra: 2.5, secondiSubito: 0.85, evidenti: true, imbrogli: [9, 12], atti: { distrazioni: 0.4 } },
    difficile: { ritmo: 0.8, finestra: 1.5, secondiSubito: 0.45, imbrogli: [11, 15], onesti: 5, atti: { cadenza: 0.85, distrazioni: 1.5 } },
  },
};
