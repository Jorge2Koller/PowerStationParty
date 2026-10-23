// Configurazione del microgioco 'TorRONDAcelli' (id: ronda).
// Durata, comandi, obiettivo, punti, difficoltà e frasi: si cambiano qui senza toccare la logica.
// (Il microgioco è in js/microgames/RondaScene.js; questa sezione arriva in CONFIG.microgiochi.ronda.)
export default {
  titolo: 'TorRONDAcelli',
  verbo: 'SPARA!',          // il comando in una parola (schermata prima del microgioco)
  durata: 35,
  colore: 0x2f8fd0,
  musica: 'marcia',           // js/config/musiche.js
  ospite: { id: 'generale', etichetta: 'AGLI ORDINI\nDEL GENERALE' },
  // (scheda di valutazione: "monotono, più barche e più armi": adesso le armi sono tre e si cambiano)
  comandi: [
    'Il mouse mira, il CLIC spara (o FRECCE + SPAZIO). Armi: tasti 1, 2, 3 o la rotella',
    '1 CANNONE: colpi pochi. 2 MORTAIO: a parabola, per i gruppi. 3 SILURO: affonda tutto, anche i sottomarini',
    'Ombrellone rubato? Affondali in fuga e lo riprendi!',
  ],
  comandiTouch: [
    'Tocca il mare per sparare. L\'arma si sceglie a destra',
    'CANNONE: colpi pochi. MORTAIO: a parabola, per i gruppi. SILURO: affonda tutto, anche i sottomarini',
    'Ombrellone rubato? Affondali in fuga e lo riprendi!',
  ],
  obiettivo: 'Salva almeno 3 ombrelloni su 5!',
  // Medaglie (js/punteggi.js): il punteggio per bronzo, argento e oro. Servono anche a rendere
  // confrontabili i microgiochi nella sfida (ognuno vale da 0 a 100 punti sfida).
  // Revisione 4, la stessa scala per tutti (erano 100 / 190 / 280): gli ombrelloni salvati valgono
  // sempre di più (vedi bonusOmbrelloni), così salvarne 3 (l'obiettivo) va col bronzo.
  // Scheda di valutazione ("troppo facile"): le bagnarole sono quasi il doppio ma valgono meno. Il
  // bronzo sono 3 ombrelloni salvati: senza, il totale si ferma a tettoPrima (a caccia e basta, con
  // la spiaggia persa, si faceva il bronzo lo stesso); con, è almeno il bronzo, e argento e oro
  // vengono dalle bagnarole affondate e dagli ombrelloni in più. Simulato su Normale (ottobre 2026,
  // coi nemici di meno): chi spara a caso non ne salva nessuno (5-15), chi mira così così col cannone
  // e basta ne salva 4 o 5 (150-270, bronzo o argento), chi mira e anticipa abbastanza bene 5 su 5
  // quasi sempre (265, argento), chi è bravo e usa le tre armi tutti e 5 con tante bagnarole (300-317,
  // oro). Su Difficile il giocatore medio ne salva ancora 3 o 4, quello scarso quasi nessuno.
  medaglie: { bronzo: 100, argento: 200, oro: 300 },
  obiettivoOmbrelloni: 3,
  tettoPrima: 90,
  // --- le armi (scheda di valutazione: prima c'era solo il cannone) ---
  // il CANNONE: palle contate, che arrivano con le casse del Generale
  colpiMax: 5,            // (erano 6)
  colpiCassa: 5,          // colpi in una cassa del Generale (atterra da sola sul cannone) (erano 4: le bagnarole sono di più)
  cassaOgni: 6,           // secondi tra una cassa e l'altra (erano 5,5: adesso ci sono anche le altre armi)
  ricaricaLenta: 4.5,     // intanto, un colpo in più ogni tot secondi (erano 4,2)
  velMira: 230,           // tastiera: velocità del mirino (unità/s)
  // il MORTAIO: un colpo alla volta, a parabola (ci mette "volo" secondi, anche vicino: bisogna
  // mirare dove la bagnarola SARÀ), fa "danno" a tutto quello che sta nel raggio (in unità sulla
  // riva: lontano il cerchio è più piccolo, come le barche); poi si ricarica da solo
  // (mortaio e siluro si ricaricano in fretta: si cambia arma spesso, il cannone da solo non basta)
  mortaio: { ricarica: 3, volo: 1.15, raggio: 30, danno: 2 },
  // il SILURO: parte dalla riva e corre dritto verso il mirino (e oltre, fino all'orizzonte);
  // affonda la prima bagnarola che incontra (danno 3 = anche il galeone), sott'acqua compresa
  siluro: { ricarica: 4.5, vel: 150, danno: 3 },
  // --- punti ---
  // per tipo di bagnarola (prima 10 per tutte; ora le bagnarole sono quasi il doppio, e quelle
  // difficili valgono di più)
  puntiAffondata: { gommone: 2, pedalo: 3, galeone: 5, banana: 4, ciambella: 1, sottomarino: 6 },
  bonusLontano: 1,        // ...se affondata lontano dalla riva (sopra yLontano) (erano 5)
  yLontano: 100,
  puntiRipreso: 5,        // ombrellone recuperato da una bagnarola in fuga
  bonusMulti: 3,          // per ogni bagnarola in più affondata con lo stesso colpo (DOPPIETTA! ...)
  // a fine partita, gli ombrelloni ancora piantati (da 0 a 5): sotto i 3 niente, poi sempre di più
  // (prima 15 a ombrellone; poi 0/0/0/40/70/100: ora l'ombrellone in più vale più di prima. Tutti e 5
  // valevano 180: coi nemici di meno ci sono meno punti da caccia, e l'oro non lo prendeva nessuno)
  bonusOmbrelloni: [0, 0, 0, 50, 100, 210],
  // bagnarole: colpi per affondarle e lentezza rispetto alla velocità della fase
  // (nuove: la BANANA BOAT, veloce e a zig-zag; le CIAMBELLE, pirati a nuoto che arrivano in
  // gruppo, lente; il SOTTOMARINO, che va sott'acqua e lì lo prende solo il siluro)
  hp: { gommone: 1, pedalo: 2, galeone: 3, banana: 1, ciambella: 1, sottomarino: 2 },
  // (la banana era 1,5 e zig-zag 2,6: nelle prove simulate sfuggiva anche a chi mira bene)
  passo: { gommone: 1, pedalo: 0.9, galeone: 0.72, banana: 1.35, ciambella: 0.62, sottomarino: 0.85 },
  zigzagTipo: { banana: 2, ciambella: 0.5 },      // zig-zag rispetto a quello della fase (gli altri 1)
  sottomarino: { su: 2.4, giu: 1.5 },             // secondi a galla e sott'acqua, a turno (giù era 1,8)
  // i tre atti: da quando (secondi; in Lampo si stringono nei suoi 15), annuncio, secondi tra una
  // bagnarola e l'altra, velocità, quante al massimo in arrivo insieme, i tipi (pesi: più alto =
  // più spesso), zig-zag, e una bagnarola che arriva subito all'inizio dell'atto (frase: cosa dice il Generale)
  atti: [
    // (più difficile dopo la serata di prova: prima 2,4/1,7/1,1 secondi, velocità 17/22/28, zig-zag 0/10/20;
    // scheda di valutazione: più bagnarole in arrivo insieme, erano 3/4/6, e più tipi; nell'ARREMBAGGIO
    // l'intervallo e la velocità sono un po' meno, erano 0,95 e 31: ci sono anche le ondate.
    // Poi, ottobre 2026, "decisamente troppo difficile": meno nemici. Erano 4/6/7 bagnarole insieme,
    // una ogni 1,9/1,35/1,3 secondi, velocità 20/26/29)
    { da: 0, intervallo: 2.4, vel: 18, maxBarche: 3, tipi: { gommone: 0.6, pedalo: 0.4 }, zigzag: 6 },
    { da: 12, nome: 'ARRIVA IL GALEONE!', frase: 'Il galeone! Tre colpi!', subito: 'galeone', intervallo: 1.8, vel: 22, maxBarche: 4, tipi: { gommone: 0.35, pedalo: 0.3, galeone: 0.15, banana: 0.2 }, zigzag: 14 },
    { da: 24, nome: 'ARREMBAGGIO!', frase: 'Sottomarino! Usa il siluro!', subito: 'sottomarino', intervallo: 1.6, vel: 25, maxBarche: 5, tipi: { gommone: 0.3, pedalo: 0.2, galeone: 0.15, banana: 0.2, sottomarino: 0.15 }, zigzag: 24 },
  ],
  // Le ondate: gruppi che arrivano insieme a un'ora precisa (secondi, come gli atti), in più delle
  // bagnarole normali e senza contare nel massimo. Le ciambelle in gruppo sono il bersaglio del mortaio.
  // (ottobre 2026, meno nemici: tolti i due galeoni a 15 secondi e la flottiglia a 17, che aveva 5
  // ciambelle; le altre flottiglie avevano 4 e 6 ciambelle, le banane a 20 secondi erano 2)
  ondate: [
    { t: 5, tipo: 'ciambella', quante: 3, nome: 'FLOTTIGLIA!' },
    { t: 9, tipo: 'banana', quante: 1 },
    { t: 20, tipo: 'banana', quante: 1, nome: 'BANANA IN VISTA!' },
    { t: 26, tipo: 'ciambella', quante: 4, nome: 'FLOTTIGLIA!' },
  ],
  frasi: ['FUOCO!', 'Mirate alla chiglia!', 'Non un passo indietro!', 'Difendete gli ombrelloni!', 'Avanti, soldato!', 'Ricaricate!', 'Mortaio sui gruppi!', 'Il siluro non perdona!'],
  frasiCassa: ['Munizioni!', 'Prendi, soldato!', 'Al volo!'],
  frasiRubato: ['Il mio ombrellone!', 'Inseguiteli!', 'Vergogna!', 'Ritirata no!'],
  // i pirati sono inventati e buffi: nessuna bandiera o nazionalità vera
  frasiPirati: ['Arrr!', 'Questo è nostro!', 'Bottino!', 'Si va al largo!', 'Chi ha la crema solare?', 'Il mio pappagallo soffre il mal di mare!', 'Pedala, ciurma!', 'Ho perso una ciabatta!'],
  // I livelli (Fase 5): Normale è la configurazione qui sopra; Facile e Difficile cambiano solo
  // questi valori. Un oggetto al posto di un elenco (fasi, atti) moltiplica quei campi in ogni voce.
  livelli: {
    facile: { colpiMax: 7, ricaricaLenta: 3.4, cassaOgni: 5, mortaio: { ricarica: 2.4, raggio: 34 }, siluro: { ricarica: 3.6 }, atti: { intervallo: 1.2, vel: 0.85 } },
    difficile: { colpiMax: 4, ricaricaLenta: 5.2, cassaOgni: 7, mortaio: { ricarica: 3.6 }, siluro: { ricarica: 5.5 }, atti: { intervallo: 0.88, vel: 1.12 } },
  },
};
