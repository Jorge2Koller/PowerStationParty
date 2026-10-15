// Il BEER PONG: i numeri del motore di tiro, della sbronza, delle gag e delle reazioni.
// Li usano sia il microgioco "Beer Pong al Pallaio" (js/config/microgiochi/beerpong.js: i veterani,
// i punti, le medaglie) sia la modalità BEER PONG (js/config/modalita.js: squadre, bicchieri,
// tempo): così le due cose non divergono. Arrivano in CONFIG.beerpong.
//
// Le misure del tavolo sono in "metri di cartone animato": il tavolo è largo 1.5 e lungo 1.55, i
// bicchieri avversari stanno tra 0.97 (la punta del triangolo) e 1.36 (l'ultima fila).
export default {
  // --- il tiro ---
  tiro: {
    gestoMin: 14,          // lunghezza minima del gesto (unità di schermo): più corto non parte
    gestoMax: 124,         // lunghezza del gesto per la forza massima
    gestoDito: 1.35,       // col dito il gesto è più lungo di tante volte (un dito è meno preciso del mouse)
    corto: 0.62,           // dove atterra la pallina con la forza minima...
    lungo: 1.78,           // ...e con la massima (oltre 1.55 esce dal fondo del tavolo)
    apertura: 0.62,        // quanto si può mirare di lato (pendenza massima del gesto)
    arco: [0.42, 0.25],    // altezza dell'arco: base + questo per la forza
    volo: [0.62, 0.3],     // secondi di volo: base + questo per la forza
    dentro: 0.92,          // la pallina entra se cade entro questa parte del raggio del bicchiere
    bordo: 1.4,            // ...e fino a qui prende il bordo, e ci gira sopra
    bordoDentro: 0.34,     // dal bordo cade dentro se è entro questa parte della fascia del bordo (0 mai, 1 sempre)
    giroBordo: 0.85,       // secondi di giro sul bordo, al rallentatore
    salto: [0.2, 0.2],     // lunghezza del salto dopo un rimbalzo sul tavolo: base + questo per la forza
    anteprima: 0.36,       // quanta traiettoria si vede, tratteggiata, mentre si mira (0..1)
    ricarica: 0.4,         // secondi per riavere la pallina in mano
    velMira: 0.42,         // tastiera: velocità della mira (pendenza al secondo)
    periodoForza: 2,       // tastiera: secondi perché la forza salga e riscenda (SPAZIO tenuto)
  },

  // --- la sbronza progressiva: 0 LUCIDO, 1 ALLEGRO, 2 BRILLO, 3 SBRONZO ---
  // Si sale bevendo: ogni bicchiere che ti centrano è un bicchiere bevuto.
  sbronza: {
    nomi: ['LUCIDO', 'ALLEGRO', 'BRILLO', 'SBRONZO'],
    nomiTanti: ['LUCIDI', 'ALLEGRI', 'BRILLI', 'SBRONZI'],   // per una squadra (o per i veterani)
    colori: ['#ffffff', '#ffe14a', '#ffb02e', '#ff6b5a'],
    soglie: [0.2, 0.5, 0.8],              // parte dei propri bicchieri bevuta a cui si passa di livello
    // ALLEGRO in su: ogni tanto un HIC! che fa sobbalzare la mira (forza per livello)
    hic: { ogni: [3.2, 6], forza: [0, 0.06, 0.08, 0.1], durata: 0.55 },
    // BRILLO in su: la mira oscilla piano (di lato e in forza, per livello) con questo periodo (secondi)
    onda: { lato: [0, 0, 0.045, 0.075], forza: [0, 0, 0.03, 0.05], periodo: 2.8 },
    // BRILLO: ogni tanto la vista si sdoppia per un attimo; SBRONZO: sempre (il fantasma gira piano
    // attorno al bicchiere vero, a questa distanza in unità di schermo, ed è un po' più trasparente)
    doppio: { ogni: [5, 8], durata: 1.3, distanza: 8, alfa: 0.62 },
    // SBRONZO: tutta la visuale ondeggia come una barca (solo se "Schermo che trema" è acceso)
    barca: { gradi: 1.2, sposta: 2.5, periodo: 3.6 },
    // la fortuna dell'ubriaco: quanto in più il bordo perdona (si somma a tiro.bordoDentro), per
    // livello. Serve a lasciare possibile la rimonta: chi perde bicchieri mira peggio, ma ha più fortuna
    fortuna: [0, 0.05, 0.16, 0.34],
    annunci: ['', 'ALLEGRO!', 'BRILLO!', 'SBRONZO!'],
    // fumetti di chi tira, per livello (da BRILLO in su le parole si storpiano)
    frasi: [
      [],
      ['Hic!', 'Che serata!', 'Ne prendo un altro.'],
      ['Tutto shotto controllo.', 'Fermo il tavolo, per favore.', 'Chi ha shposhtato i bicchieri?'],
      ['Shono lucidishimo.', 'Ti voglio bene, shai?', 'Quanti bicchieri shono?', 'Tiro a quello di meszo.', 'Non shono io che ondeggio, è il Pallaio.'],
    ],
    fraseOgni: [5, 8],                    // secondi tra un fumetto e l'altro
  },

  // --- le gag dei tiri sbagliati ---
  // Quando la pallina esce dal tavolo, ogni tanto parte una gag a caso (peso = quanto esce spesso).
  // Per aggiungerne una: una riga qui e la sua funzione, con lo stesso id, in js/beerpong/gag.js.
  gag: {
    probabilita: 0.55,     // quante volte parte una gag quando la pallina esce
    pausa: 4,              // secondi minimi tra una gag e l'altra
    lista: [
      { id: 'fronte', peso: 3, testo: 'TONK!', frasi: ['Ahio!', 'Chi è stato?!', 'Vedo le stelle...'] },
      { id: 'bicchiere', peso: 2, testo: 'PLOP!', frasi: ['La mia birra!', 'Oh! E adesso?', 'Me ne dovete una.'] },
      { id: 'lampadina', peso: 2, testo: 'DLING!' },
      { id: 'cane', peso: 2, testo: 'GNAM!', frasi: ['MORGAN! Torna qui!', 'MORGAN, molla la pallina!'] },
      { id: 'finestra', peso: 2, testo: 'AHIA!', frasi: ['Ma chi è che tira?!', 'Guardate che chiamo i vigili!', 'Ce l\'avete con me?'] },
    ],
  },

  // --- reazioni ---
  reazioni: {
    fiamme: 2,             // centri di fila per andare "IN FIAMME!" (solo un effetto)
    esulta: 0.6,           // quante volte, dopo un centro, chi tira dice la sua frase
    // l'ultimo bicchiere: rallentatore, zoom sulla pallina, rullo di tamburi
    ultimo: { rallenta: 0.3, zoom: 1.28, raggio: 2.6 },
    centro: ['SPLASH!', 'DENTRO!', 'CIAF!'],
    bordo: ['GIRA...', 'SUL BORDO...'],
    bordoFuori: ['NOOO!', 'USCITA!', 'PER UN PELO!'],
    fuori: ['FUORI!', 'LISCIO!', 'LARGA!', 'LUNGA!'],
    rete: ['RETE!'],
    tifo: ['Grande!', 'Ooooh!', 'Che mira!', 'Bevi, bevi!', 'Olé!'],
    bevi: ['BEVI!', 'GLU GLU!', 'ALLA SALUTE!'],
  },

  // chi può fare da pubblico (tra chi non sta giocando)
  comparse: ['beppe', 'sego', 'guerra', 'passaseo', 'generale', 'ingiocabile', 'bota', 'petri', 'manna', 'greg', 'marco', 'riccardo', 'giorgio', 'pastaffi', 'zio', 'marsupino'],

  // I livelli di chi tira (l'handicap: js/livelli.js). Normale è quello qui sopra.
  livelli: {
    facile: { tiro: { dentro: 1.02, bordoDentro: 0.6, anteprima: 0.6 } },
    difficile: { tiro: { dentro: 0.82, bordoDentro: 0.2, anteprima: 0.24 } },
  },
};
