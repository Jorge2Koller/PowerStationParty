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
  musica: 'guardie',           // js/config/musiche.js
  nomeLocale: 'Da Michele',
  // Michele alla cassa; il Giso, il paladino degli scontrini, in primo piano (chi gioca è il suo vice;
  // il Giso è bassino: è sempre più basso di chi gioca).
  // Chi sceglie Michele o il Giso qui gioca "contro se stesso"
  ospite: { id: 'michele', etichetta: 'ALLA CASSA:\nMICHELE' },
  cast: ['giso'],
  comandi: [
    'Guarda la mano: lo scontrino è il foglietto BIANCO',
    'Chi esce senza (o col foglio sbagliato): CLICCALO prima della porta',
    'SPAZIO: il più vicino alla porta. Se Michele grida ASPETTA, aspetta!',
  ],
  comandiTouch: [
    'Guarda la mano: lo scontrino è il foglietto BIANCO',
    'Chi esce senza (o col foglio sbagliato): TOCCALO prima della porta',
    'Fermi uno onesto? Falso allarme. Se Michele grida ASPETTA, aspetta!',
  ],
  obiettivo: 'Becca 6 furbi, con al massimo 2 falsi allarmi!',
  // In Lampo (15 secondi): vale questa sezione sopra le altre (vedi MicrogiocoBase); comandi e obiettivo
  // li mostra l'introduzione. stringi = gli elenchi a tempo i cui atti si stringono nei 15 secondi
  lampo: { obiettivo: 'Becca 3 furbi, con al massimo 1 falso allarme!' },
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
  segnali: { onesto: 0.9, classico: 0.6, finto: 0.9, strappo: 1.15, annullo: 0.9, voce: 1.05, ultimo: 0.55 },
  // facile: i trucchi "più evidenti" (lo scontrino in mano ai clienti più grande, il display che lampeggia)
  evidenti: false,
  // ALL'ULTIMO (onesto): Michele se lo scorda, il cliente si gira senza scontrino, Michele grida "ASPETTA!"
  // e glielo lancia: arriva dopo "presa" secondi da quando il cliente si è girato. Chi lo ferma prima fa
  // un falso allarme. ultimi = quanti dei clienti onesti, per atto, se lo vedono arrivare così
  presa: 0.9,
  ultimi: [0, 0.3, 0.35],
  // IL FURBETTO (dal terzo atto): entra, non paga e sgattaiola dritto alla porta, con gli occhiali scuri.
  // furbetti = quanti per atto; il suo passo verso la porta dura finestraFurbetto secondi
  furbetti: [0, 0, 2],
  finestraFurbetto: 2.3,

  // --- i trucchetti di Michele ---
  // Una regola sola: chi esce deve avere in mano lo scontrino, il foglietto BIANCO e lungo. I trucchi
  // sono i modi in cui Michele non glielo dà, e si vedono sempre. daAtto = da che atto compare.
  //   IL CLASSICO: niente tasti, niente stampante: fischietta guardando in alto, e niente scontrino
  //   LO STRAPPO: lo scontrino esce, ma lui lo strappa e se lo mette in tasca prima di darlo
  //   IL CONTO A VOCE: "Fanno 6 euro, lascia stare!", senza toccare la cassa
  //   LO SCONTRINO FINTO: al posto dello scontrino gli dà il volantino giallo della pizzeria
  //   L'ANNULLO: lo batte e lo dà, il cliente si gira e lui lo annulla: sullo scontrino in mano compare
  //     la croce rossa (e il display della cassa diventa rosso)
  trucchi: [
    { id: 'classico', nome: 'IL CLASSICO', daAtto: 1 },
    { id: 'strappo', nome: 'LO STRAPPO', daAtto: 1 },
    { id: 'voce', nome: 'IL CONTO A VOCE', daAtto: 2 },
    { id: 'finto', nome: 'LO SCONTRINO FINTO', daAtto: 2 },
    { id: 'annullo', nome: "L'ANNULLO", daAtto: 3 },
  ],

  // I tre atti: la stessa pizzeria, la serata si scalda. da = secondo d'inizio (daLampo: in Lampo, dove
  // si parte dall'ora di punta: il primo atto, lento, lì non c'è);
  // cadenza = ogni quanti secondi entra un cliente; imbrogli = quanti clienti su 1 escono senza
  // scontrino (se Michele riesce); taglio = quanti su 1 vogliono il trancio tagliato (gli altri il
  // cartone da asporto, già pronto); ritmo = moltiplica i tempi di Michele in quell'atto; finestra =
  // moltiplica la finestra; distrazioni = quante (teglia fumante, telefono: poche, per non confondere)
  atti: [
    { da: 0, daLampo: -1, nome: 'SI APRE!', cadenza: 3.0, imbrogli: 0.6, taglio: 1, ritmo: 1.1, finestra: 1.1, distrazioni: 0 },
    { da: 12, daLampo: 0, nome: 'ORA DI PUNTA!', cadenza: 1.7, imbrogli: 0.6, taglio: 0.25, ritmo: 1, finestra: 1, distrazioni: 0 },
    { da: 24, daLampo: 7, nome: 'SABATO SERA {locale}!', cadenza: 1.3, imbrogli: 0.6, taglio: 0, ritmo: 0.85, finestra: 0.9, distrazioni: 2 },
  ],
  distrazioni: ['teglia', 'telefono'],
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
  frasiFinanza: ['Favorisca i documenti!', 'Guardia di Finanza!'],
  frasiAspetta: ['ASPETTA! LO SCONTRINO!', 'ASPETTA! ECCOLO!'],
  frasiCeLho: ["Ce l'ho, ce l'ho!", 'Eccolo, contento?'],
  titoli: ['MICHELE, MULTATO!', 'TUTTO IN NERO!'],

  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { ritmo: 1.1, finestra: 2.5, secondiSubito: 0.85, evidenti: true, imbrogli: [9, 12], ultimi: [0, 0.15, 0.2], furbetti: [0, 0, 1], atti: { distrazioni: 0 } },
    difficile: { ritmo: 0.8, finestra: 1.5, secondiSubito: 0.45, imbrogli: [11, 15], onesti: 5, ultimi: [0, 0.4, 0.45], furbetti: [0, 1, 3], finestraFurbetto: 1.9, atti: { cadenza: 0.85, distrazioni: 1.5 } },
  },
};
