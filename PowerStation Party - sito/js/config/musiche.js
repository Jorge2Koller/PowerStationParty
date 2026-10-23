// ============================================================
//  LE MUSICHE (8 bit, originali: melodie, accordi e arrangiamenti inventati per il gioco)
//  Ogni musica è descritta qui e basta: tempo, tonalità, accordi, note, strumenti. La suona il
//  sequencer di js/audio.js; un microgioco la sceglie col campo `musica` della sua configurazione.
//  (Le musiche dei giochi a tempo di musica, che hanno note e colpi sincronizzati con la base, sono
//  ancora quelle di prima, in audio.js: 'pista', 'ballata', 'corsa', 'silenzio'; e 'festa', per premi e
//  classifica finale.)
//
//  Come si scrive una musica:
//    bpm, tonica (la nota del grado 1, es. 'F4'), modo ('maggiore' o 'minore'), metro (4 = 4/4 in
//    ottavi, 8 passi per battuta; '6/8' = 6 passi per battuta, il battito è la semiminima puntata),
//    swing (0 = dritto, 0.33 = terzinato: quanto si sposta l'ottavo in levare, in frazioni di passo)
//    parti: le sezioni che girano in loop una dopo l'altra (di solito A e B, 8 battute l'una), ognuna con
//      accordi: uno per battuta, in numeri romani rispetto alla tonica (I, ii, iii, IV, V, vi, vii°;
//        7 = settima, maj7, 6; b e # davanti per gli accordi prestati: bVII, bVI, bIII). Due accordi
//        nella stessa battuta: 'IV/V' (mezza battuta l'uno)
//      melodia: un segno per passo, battute separate da |. Un numero è un grado della scala (1-7), con
//        b o # davanti per alterarlo, ' dopo per l'ottava sopra e , per quella sotto; - tiene la nota
//        di prima, . è una pausa
//    lead: lo strumento della melodia (onda: 0.5 = quadra, 0.25 e 0.125 = più sottile e nasale;
//      staccato: quanta parte del passo suona, 1 = legato; volume)
//    seconda: la seconda voce, che entra nel secondo atto. tipo 'eco' = risponde negli spazi della
//      melodia con gli accordi (domanda e risposta), 'terze' = una terza sotto la melodia
//    arpeggio: true = nel secondo atto gli accordi arpeggiati veloci, in alto (come sui vecchi giochi)
//    basso: un segno per passo, ripetuto a ogni battuta. R = la fondamentale dell'accordo, 3 5 6 7 = le
//      altre note dell'accordo (7 = la sua settima), 8 = la fondamentale un'ottava sopra, - tiene, . pausa
//    ritmica: gli accordi ribattuti corti (x = un colpo), una battuta, ripetuta
//    batteria: per atto (1 = leggera, 2 = piena, finale = gli ultimi 5 secondi; il terzo atto usa la 2):
//      k cassa, s rullante, h charleston, o charleston aperto, c battimani, t tom. Una battuta per strumento
//      (x = colpo, X = colpo forte). Se manca finale, ce n'è uno di serie
//    atto3: { tempo: 1.06 } = nel terzo atto il 6% più svelta, oppure { tono: 2 } = un tono sopra
//    volume: per pareggiare le musiche tra loro (misurate: vedi prova-musiche.html)
//    auto: true = senza atti da fuori (nei menu) dopo il primo giro passa da sola al secondo atto
// ============================================================

const BATTERIA_POP = {
  1: { k: 'x...x...', h: '..x...x.' },
  2: { k: 'x...x.x.', s: '..x...x.', h: 'x.x.x.x.' },
};

export const BRANI = {
  // il tema del gioco: quello che si fischietta (menu e schermate)
  menu: {
    titolo: 'Tema di PowerStation Party', carattere: 'il tema del gioco, da fischiettare',
    bpm: 112, tonica: 'C5', modo: 'maggiore', metro: 4, swing: 0.12, auto: true,
    lead: { onda: 0.5, staccato: 0.75 }, seconda: { tipo: 'eco', onda: 0.25 },
    basso: 'R . 5 . R . 5 .', ritmica: '..x...x.',
    batteria: BATTERIA_POP, atto3: { tempo: 1.06 }, volume: 0.92,
    parti: [
      { accordi: 'I vi IV V I vi II7 V7',
        melodia: `1 . 3 5 6 5 3 . | 6 . 6 5 3 . 1 . | 4 . 6 1' 2' 1' 6 . | 5 - - . 7, . 2 . |
                  1 . 3 5 6 5 3 . | 6 . 1' 7 6 . 5 . | 2 . #4 6 1' . 6 . | 7 . 2' . 5 - - .` },
      { accordi: 'IV I IV V IV iii II7 V7',
        melodia: `6 6 . 6 1' . 6 . | 5 5 . 5 3 . 1 . | 4 4 . 4 6 . 1' . | 7 . 6 . 5 . . . |
                  6 6 . 6 1' . 2' . | 3' . 2' . 7 . 5 . | #4 . 6 . 1' . 2' . | 4' . 2' . 7 . 5 .` },
    ],
  },

  // La Spina del PowerStation: il bar allegro, swing morbido
  bar: {
    titolo: 'Al bancone', carattere: 'bar allegro, swing morbido',
    bpm: 116, tonica: 'F4', modo: 'maggiore', metro: 4, swing: 0.3,
    lead: { onda: 0.5, staccato: 0.7 }, seconda: { tipo: 'eco', onda: 0.25 },
    basso: 'R . 3 . 5 . 6 .', ritmica: '..x...x.',
    batteria: { 1: { k: 'x...x...', h: 'x.x.x.x.' }, 2: { k: 'x...x...', s: '..x...x.', h: 'xxxxxxxx' } },
    atto3: { tempo: 1.06 }, volume: 1.01,
    parti: [
      { accordi: 'I I IV I V IV I V7',
        melodia: `1 . 3 . 5 . 6 5 | . 3 . 1 2 . 3 . | 4 . 6 . 1' . 6 4 | 5 - - . . . 3 4 |
                  5 . 7 . 2' . 7 5 | 6 . 4 . 6 . 1' . | 5 . 3 . 1 . 3 5 | 2 - - . 7, . 2 .` },
      { accordi: 'IV IV I vi II7 V7 I V7',
        melodia: `6 . 6 . 1' . 6 . | 4 . 6 . 1' 2' 1' . | 5 . 3 . 5 . 1' . | 6 - - . 5 . 3 . |
                  2 . #4 . 6 . 1' . | 5 . 7 . 2' . 4' . | 3' . 1' . 5 . 3 . | 1 - - . 5, . 7, .` },
    ],
  },

  // Arriva ReGrorio!: la corsa in strada, energica
  strada: {
    titolo: 'Largo, passa il re!', carattere: 'corsa in strada, energica',
    bpm: 150, tonica: 'A4', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.5, staccato: 0.6 }, seconda: { tipo: 'eco', onda: 0.25 }, arpeggio: true,
    basso: 'R 8 R 8 R 8 R 8',
    batteria: { 1: { k: 'x...x...', h: 'x.x.x.x.' }, 2: { k: 'x.x.x.x.', s: '..x...x.', h: 'xxxxxxxx' } },
    atto3: { tono: 2 }, volume: 0.78,
    parti: [
      { accordi: 'I V vi IV I V IV V',
        melodia: `5 5 . 5 1' . 7 6 | 5 . 2' . 7 . 5 . | 6 6 . 6 1' . 3' 2' | 1' . 6 . 4 . 6 . |
                  5 5 . 5 1' . 2' 3' | 2' . 7 . 5 . 2' . | 1' . 6 . 4 . 1' . | 7 - 5 - 7 - 2' -` },
      { accordi: 'IV V iii vi IV V I I',
        melodia: `4' . 3' . 2' . 1' . | 2' . 1' . 7 . 5 . | 3' . 2' . 1' . 7 . | 1' . 7 . 6 . 3 . |
                  4 . 6 . 1' . 4' . | 3' . 2' . 7 . 5 . | 1' 1' . 3' 5' . 3' 1' | 5 . . . 5 . 5 .` },
    ],
  },

  // La Barba di O'Sfurnacchiat: la bottega del barbiere, pizzicato scherzoso
  barbiere: {
    titolo: 'Barba e capelli', carattere: 'bottega del barbiere, pizzicato scherzoso',
    bpm: 104, tonica: 'G4', modo: 'maggiore', metro: 4, swing: 0.15,
    lead: { onda: 0.25, staccato: 0.35 }, seconda: { tipo: 'eco', onda: 0.125 },
    basso: 'R . 5 . R . 5 .', ritmica: '..x...x.',
    batteria: { 1: { k: 'x...x...', h: '..x...x.' }, 2: { k: 'x...x...', s: '..x...x.', h: 'x.x.x.x.' } },
    atto3: { tempo: 1.06 }, volume: 1.33,
    parti: [
      { accordi: 'I V7 V7 I I IV V7 I',
        melodia: `1 . 3 . 5 . 3 . | 4 . 2 . 7, . 2 . | 4 . 7 . 6 . 5 . | 3 . 1 . 5, . . . |
                  1 . 3 . 5 . 1' . | 6 . 4 . 6 . 1' . | 7 . 5 . 2' . 7 . | 1' . 5 . 1' . . .` },
      { accordi: 'IV IV I I II7 II7 V7 V7',
        melodia: `6 . 1' . 6 . 4 . | 6 . 5 . 4 . 3 . | 5 . 1' . 5 . 3 . | 5 . 4 . 3 . 2 . |
                  #4 . 6 . 1' . 6 . | #4 . 2 . #4 . 6 . | 5 . 7 . 2' . 4' . | 2' . 7 . 5 . 4 .` },
    ],
  },

  // Il Panino di Marsupino: la cucina che rimbalza
  cucina: {
    titolo: 'Panino espresso', carattere: 'cucina che rimbalza',
    bpm: 128, tonica: 'C5', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.5, staccato: 0.55 }, seconda: { tipo: 'eco', onda: 0.25 },
    basso: 'R . 5 . 8 . 5 .', ritmica: '.x.x.x.x',
    batteria: { 1: { k: 'x...x...', h: '..x...x.' }, 2: { k: 'x..xx...', s: '..x...x.', h: 'x.x.x.x.' } },
    atto3: { tono: 2 }, volume: 0.99,
    parti: [
      { accordi: 'I IV V I vi IV II7 V7',
        melodia: `1 1 . 5, 1 . 3 . | 4 4 . 1 4 . 6 . | 5 5 . 2 5 . 7 . | 1' . 5 . 3 . 1 . |
                  6 6 . 3 6 . 1' . | 4 4 . 6 1' . 4' . | 2' . 1' . 6 . #4 . | 5 . 7 . 2' . . .` },
      { accordi: 'IV V iii vi IV I II7 V7',
        melodia: `6 . 4 . 6 . 1' 1' | 7 . 5 . 7 . 2' 2' | 3' . 1' . 7 . 5 . | 6 . 3 . 6 . 1' . |
                  4' . 3' . 2' . 1' . | 3' . 5 . 1' . 3' . | 2' . #4 . 6 . 1' . | 7 . 5 . 4 . 2 .` },
    ],
  },

  // Guerra, via quelle mani!: comica, staccata, a scatti
  comica: {
    titolo: 'Giù le mani', carattere: 'comica, staccata, a scatti',
    bpm: 140, tonica: 'D5', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.25, staccato: 0.3 }, seconda: { tipo: 'eco', onda: 0.125 },
    basso: 'R . 5 . R . 5 .', ritmica: '..x...x.',
    batteria: { 1: { k: 'x...x...', t: '......x.' }, 2: { k: 'x...x...', s: '..x...x.', h: 'x.x.x.x.' } },
    atto3: { tempo: 1.07 }, volume: 1.23,
    parti: [
      { accordi: 'I IV V7 I I IV V7 I',
        melodia: `1 . . 3 . . 5 . | 6 . . 4 . . 1' . | 7 . 6 . 5 . 4 . | 3 . 1 . 1 . . . |
                  5 . . 5 #4 5 1' . | 6 . . 6 #5 6 2' . | 1' 7 6 5 4 3 2 . | 1 . 5, . 1 . . .` },
      { accordi: 'vi vi II7 II7 IV iv I V7',
        melodia: `3' . . 3' 2' . 1' . | 7 . . 1' 6 . . . | #4 . 6 . 1' . 6 . | 2' . 1' . 6 . #4 . |
                  4 . 6 . 1' . 4' . | b6 . 4 . 1' . b6 . | 5 . 3 . 1 . 3 . | 2 . . 7, . . 5, .` },
    ],
  },

  // Sego, sono sotto casa!: di nascosto ma divertente, a passi felpati (Re minore, ritornello in Fa)
  nascosto: {
    titolo: 'Passi felpati', carattere: 'di nascosto ma divertente (Re minore, ritornello in Fa maggiore)',
    bpm: 110, tonica: 'D5', modo: 'minore', metro: 4, swing: 0.2,
    lead: { onda: 0.25, staccato: 0.4 }, seconda: { tipo: 'eco', onda: 0.125 },
    basso: 'R . . 5 R . 5 .',
    batteria: { 1: { k: 'x.......', h: '..x...x.' }, 2: { k: 'x...x...', s: '......x.', h: 'x.x.x.x.' } },
    atto3: { tempo: 1.05 }, volume: 1.31,
    parti: [
      { accordi: 'i iv i V7 i iv bVI V7',
        melodia: `1 . . 3 . . 5 . | 4 . . 6 . . 1' . | 5 . 3 . 1 . 3 . | #7, . 2 . 5, . #7, . |
                  1 . . 3 5 . . 1' | 6 . 4 . 6 . 1' . | 6 . 1' . 3' . 1' . | #7 - 5 - 2' - #7 -` },
      { accordi: 'bIII bVII i bVI bIII bVII bVI V7',
        melodia: `3 . 5 . 7 . 5 . | 7, . 2 . 4 . 2 . | 1 . 3 . 5 . 3 . | 6, . 1 . 3 . 6 . |
                  3 5 . 5 7 . 5 3 | 2 4 . 4 7 . 4 2 | 1 3 . 3 6 . 1' . | 5 . 4 . 2 . #7, .` },
    ],
  },

  // TorRONDAcelli: la marcia militare buffa del Generale
  marcia: {
    titolo: 'Avanti, soldati!', carattere: 'marcia militare buffa',
    bpm: 120, tonica: 'Bb4', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.5, staccato: 0.6 }, seconda: { tipo: 'terze', onda: 0.25 },
    basso: 'R . 5 . R . 5 .', ritmica: '..x...x.',
    batteria: { 1: { k: 'x...x...', s: 'x.x.x.xx' }, 2: { k: 'x...x...', s: 'xxx.x.xx', h: 'x.x.x.x.' } },
    atto3: { tono: 2 }, volume: 1.03,
    parti: [
      { accordi: 'I V7 V7 I I IV V7 I',
        melodia: `1 . 1 . 3 . 5 . | 4 . 2 . 7, . 5, . | 7, . 2 . 4 . 7 . | 1' . 5 . 3 . 1 . |
                  5 . 5 . 6 . 5 . | 4 . 6 . 1' . 6 . | 5 . 4 . 2 . 7, . | 1 - - . 3 . 5 .` },
      { accordi: 'IV I V I IV I II7 V7',
        melodia: `6 . 6 . 6 . 4 . | 5 . 3 . 1 . 3 . | 2 . 5 . 7 . 5 . | 1' - - . 5 . . . |
                  6 6 . 6 1' . 6 . | 5 5 . 5 3 . 1 . | #4 . 6 . 1' . 2' . | 7 . 5 . 2 . 5, .` },
    ],
  },

  // L'Ingiocabile: il casinò, lounge jazz swing
  casino: {
    titolo: 'Il banco vince sempre', carattere: 'casinò, lounge jazz swing',
    bpm: 96, tonica: 'Eb5', modo: 'maggiore', metro: 4, swing: 0.33,
    lead: { onda: 0.5, staccato: 0.85 }, seconda: { tipo: 'eco', onda: 0.25 },
    basso: 'R . 3 . 5 . 6 .', ritmica: '...x..x.',
    batteria: { 1: { h: 'x..xx..x' }, 2: { k: 'x.......', s: '......x.', h: 'x..xx..x' } },
    atto3: { tempo: 1.05 }, volume: 1.06,
    parti: [
      { accordi: 'Imaj7 vi7 ii7 V7 Imaj7 vi7 ii7 V7',
        melodia: `3 - - 5 . 3 2 . | 1 - - 6, . 1 . 3 | 2 - - 4 . 6 . 4 | 5 - - . 7, - 2 . |
                  3 - - 5 . 7 . 6 | 5 - - 3 . 1 . 6, | 2 . 4 . 6 . 1' 6 | 7 - - . 5 . . .` },
      { accordi: 'IVmaj7 iv7 iii7 VI7 ii7 V7 Imaj7 V7',
        melodia: `6 - - 1' . 3' . 1' | b6 - - 1' . b3' . 1' | 7 - - 5 . 3 . 2 | 3 . 5 . 6 . #1' . |
                  2 - - 4 . 6 . 1' | 7 - - 6 . 5 . 4 | 3 - - . 5 - 1' . | 7 - 6 - 5 - 4 -` },
    ],
  },

  // MaraZio: sportiva, da stadio (coi battimani)
  stadio: {
    titolo: 'Forza Zio!', carattere: 'sportiva, da stadio',
    bpm: 132, tonica: 'E4', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.5, staccato: 0.6 }, seconda: { tipo: 'terze', onda: 0.25 },
    basso: 'R 8 R 8 R 8 R 8',
    batteria: { 1: { k: 'x...x...', c: '..x...x.' }, 2: { k: 'x.x.x.x.', s: '..x...x.', c: '..x...x.', h: 'x.x.x.x.' } },
    atto3: { tono: 2 }, volume: 0.79,
    parti: [
      { accordi: 'I IV V I I IV V V',
        melodia: `1' . 1' . 1' 3' 5' . | 6' . 6' . 6' 5' 4' . | 5' . 5' . 7' . 2'' . | 1'' - - . 5' . . . |
                  1'' . 1'' . 1'' 7' 6' . | 6' . 1'' . 6' . 4' . | 5' . 7' . 2'' . 4'' . | 2'' - - . 7' . 5' .` },
      { accordi: 'vi IV I V vi IV II7 V',
        melodia: `3'' . 3'' . 3'' . 1'' . | 1'' . 1'' . 1'' . 6' . | 5' . 5' . 5' 3' 1' 3' | 5' - - . 7' . . . |
                  3'' . 3'' . 3'' 2'' 1'' . | 4'' . 4'' . 4'' . 1'' . | 6' . 6' . #4' . 6' . | 7' - - . 5' . 5' .` },
    ],
  },

  // Spalma il Bota!: la spiaggia, calypso
  calypso: {
    titolo: 'Crema solare', carattere: 'spiaggia, calypso',
    bpm: 108, tonica: 'D5', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.5, staccato: 0.5 }, seconda: { tipo: 'terze', onda: 0.25 },
    basso: 'R . . 5 . . R .', ritmica: '..x..x.x',
    batteria: { 1: { k: 'x..x..x.', h: '.x.x.x.x' }, 2: { k: 'x..x..x.', s: '....x...', c: '..x...x.', h: '.x.x.x.x' } },
    atto3: { tempo: 1.06 }, volume: 1.14,
    parti: [
      { accordi: 'I IV V7 I I IV V7 I',
        melodia: `5 . . 3 . . 1 . | 4 . . 6 . . 1' . | 7 . . 5 . . 2 . | 3 . 5 . 1' . . . |
                  5 . . 6 . . 5 3 | 4 . . 6 . . 4 1 | 2 . 4 . 5 . 7 . | 1 - - . . . 5 .` },
      { accordi: 'IV I V7 I IV I V7 I',
        melodia: `6 . . 6 . . 1' . | 5 . . 5 . . 3 . | 4 . . 4 . . 7 . | 1' - . 1' . 5 . . |
                  6 . 1' . 2' . 1' . | 5 . 3 . 1 . 3 . | 2 . 4 . 7, . 2 . | 1 . . . 1 . 5, .` },
    ],
  },

  // Il Passaggiorgio: la notte nel parcheggio, funky
  parcheggio: {
    titolo: 'Chi guida stasera?', carattere: 'notte in parcheggio, funky',
    bpm: 118, tonica: 'G4', modo: 'maggiore', metro: 4, swing: 0.1,
    lead: { onda: 0.25, staccato: 0.55 }, seconda: { tipo: 'eco', onda: 0.125 },
    basso: 'R . R 8 . 5 7 .', ritmica: '.x...x.x',
    batteria: { 1: { k: 'x..x..x.', h: 'x.x.x.x.' }, 2: { k: 'x..x..x.', s: '..x...x.', h: 'xxxxxxx.', o: '.......x' } },
    atto3: { tempo: 1.06 }, volume: 1.1,
    parti: [
      { accordi: 'I7 I7 IV7 I7 V7 IV7 I7 V7',
        melodia: `1' . b3' 3' 5' . b7' . | 5' . 3' . 1' . . . | 4' . 6' . 1'' . b7' 6' | 5' - 3' - 1' . . . |
                  2' . 4' . 5' . 7' . | 1'' . 6' . 4' . 6' . | 5' . b7' . 1'' . 5' . | 2' - - . 7 . . .` },
      { accordi: 'IV7 IV7 I7 I7 ii7 V7 I7 V7',
        melodia: `4' 4' . 6' . 4' 1'' . | b7' . 6' . 4' . 1' . | 1'' 1'' . 5' . 1'' b7' . | 5' . b3' . 3' . 1' . |
                  6' . 4' . 2' . 4' . | 5' . 7' . 2'' . 4'' . | 3'' . 1'' . 5' . b7' . | 7' - 5' - 2' - 7 -` },
    ],
  },

  // Petri Tentacolari: la discoteca
  disco: {
    titolo: 'Otto braccia in pista', carattere: 'disco',
    bpm: 124, tonica: 'A4', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.5, staccato: 0.6 }, seconda: { tipo: 'eco', onda: 0.25 }, arpeggio: true,
    basso: 'R 8 R 8 R 8 R 8',
    batteria: { 1: { k: 'x.x.x.x.', h: '.x.x.x.x' }, 2: { k: 'x.x.x.x.', c: '..x...x.', o: '.x.x.x.x' } },
    atto3: { tono: 2 }, volume: 0.84,
    parti: [
      { accordi: 'vi IV I V vi IV I V',
        melodia: `1' . 1' 7 1' . 3' . | 1' . 6 . 4 . 6 . | 5 . 5 3 5 . 1' . | 7 - 5 - 2 - . . |
                  1' . 1' 7 1' . 3' . | 4' . 3' . 1' . 6 . | 5 . 1' . 3' . 5' . | 2' - - . 7 . 5 .` },
      { accordi: 'IV V iii vi IV V I I',
        melodia: `6 . 4 . 6 . 1' . | 7 . 5 . 7 . 2' . | 3' . 2' . 1' . 5 . | 6 . 1' . 3' . 1' . |
                  4' . 3' . 2' . 1' . | 2' . 7 . 5 . 2' . | 1' . 3' . 5' . 3' . | 1' - - . . . 5 .` },
    ],
  },

  // Emilio in Retromarcia: il rock dell'autoradio
  rock: {
    titolo: "L'autoradio di Emilio", carattere: "rock dell'autoradio",
    bpm: 150, tonica: 'E4', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.25, staccato: 0.7 }, seconda: { tipo: 'terze', onda: 0.125 },
    basso: 'R R R R R R R R', ritmica: 'x.x.x.x.',
    batteria: { 1: { k: 'x...x...', s: '..x...x.' }, 2: { k: 'x..xx...', s: '..x...x.', h: 'xxxxxxxx' } },
    atto3: { tono: 2 }, volume: 0.9,
    parti: [
      { accordi: 'I I bVII IV I I bVII V',
        melodia: `1' . 1' . 7 1' . 5 | . 5 6 . 5 3 . 1 | b7 . b7 . 6 b7 . 4 | 6 - 4 - 6 - 1' - |
                  1' . 1' . 2' 3' . 5' | 3' . 2' . 1' . 5 . | b7 . 1' . 2' . 4' . | 2' - 7 - 5 - 7 -` },
      { accordi: 'IV IV I I IV IV bVII V',
        melodia: `4' . 4' . 3' 4' . 6' | 4' . 3' . 1' . 6 . | 3' . 3' . 2' 3' . 5' | 3' . 1' . 5 . 3 . |
                  6 . 1' . 4' . 1' . | 6 . 4 . 1 . 4 . | b7 . 2' . 4' . 2' . | 5' - - . 7 . 5 .` },
    ],
  },

  // Beer Pong al Pallaio: la festa al bar (coi battimani)
  pallaio: {
    titolo: 'Festa al Pallaio', carattere: 'festa al bar',
    bpm: 118, tonica: 'C5', modo: 'maggiore', metro: 4, swing: 0.15,
    lead: { onda: 0.5, staccato: 0.6 }, seconda: { tipo: 'eco', onda: 0.25 },
    basso: 'R 8 R 8 R 8 R 8', ritmica: '..x...x.',
    batteria: { 1: { k: 'x...x...', c: '..x...x.' }, 2: { k: 'x...x.x.', s: '..x...x.', c: '..x...x.', h: 'x.x.x.x.' } },
    atto3: { tempo: 1.06 }, volume: 0.9,
    parti: [
      { accordi: 'I iii IV V I iii IV/V I',
        melodia: `3 . 5 . 1' . 5 . | 3 . 5 . 7 . 5 . | 4 . 6 . 1' . 2' . | 1' - 7 - 5 . . . |
                  3 . 5 . 1' . 3' . | 2' . 1' . 7 . 5 . | 6 . 1' . 7 . 2' . | 1' - - . 5 . 3 .` },
      { accordi: 'vi V IV V vi V IV V7',
        melodia: `6 6 . 6 1' . 3' . | 2' 2' . 2' 7 . 5 . | 1' 1' . 1' 6 . 4 . | 7 . 5 . 2 . 5 . |
                  6 6 . 6 1' . 3' . | 5' . 3' . 2' . 7 . | 1' . 6 . 4 . 6 . | 5 . 7 . 2' . 4' .` },
    ],
  },

  // La pizza dal Boni: l'osteria, tarantella in 6/8 (il mandolino in terze, la fisarmonica che fa um-pa-pa)
  osteria: {
    titolo: "Tarantella dell'osteria", carattere: 'osteria, tarantella in 6/8',
    bpm: 112, tonica: 'G4', modo: 'maggiore', metro: '6/8', swing: 0,
    lead: { onda: 0.5, staccato: 0.6 }, seconda: { tipo: 'terze', onda: 0.25 },
    basso: 'R . . 5 . .', ritmica: '.xx.xx',
    batteria: { 1: { h: '..x..x' }, 2: { k: 'x..x..', h: 'x.xx.x' }, finale: { k: 'x..x..', s: '..x.xx', h: 'xxxxxx' } },
    atto3: { tempo: 1.07 }, volume: 0.91,
    parti: [
      { accordi: 'I IV V7 I I IV V7 I',
        melodia: `5 . 5 1' . 5 | 6 . 6 1' . 6 | 7 . 2' 5 . 7 | 1' . 5 3 . 1 |
                  5 . 6 7 . 1' | 6 . 4 1' . 6 | 5 . 4 2 . 7, | 1 - - 5 6 7` },
      { accordi: 'vi vi II7 V7 IV I V7 I',
        melodia: `3' . 3' 2' . 1' | 6 . 1' 3' . 1' | #4 . 6 1' . 6 | 7 . 5 4 . 2 |
                  6 . 1' 4' . 1' | 5 . 1' 3' . 1' | 2' . 7 5 . 4 | 3 . 2 1 . .` },
    ],
  },

  // Le Perle di Denny: il quiz, rilassata e sorniona
  quiz: {
    titolo: 'Il grande saggio', carattere: 'quiz, rilassata e sorniona',
    bpm: 100, tonica: 'F4', modo: 'maggiore', metro: 4, swing: 0.25,
    lead: { onda: 0.25, staccato: 0.6 }, seconda: { tipo: 'eco', onda: 0.125 },
    basso: 'R . 3 . 5 . 6 .', ritmica: '...x...x',
    batteria: { 1: { h: '..x...x.' }, 2: { k: 'x...x...', s: '......x.', h: 'x.x.x.x.' } },
    atto3: { tempo: 1.05 }, volume: 1.26,
    parti: [
      { accordi: 'Imaj7 vi7 ii7 V7 iii7 VI7 ii7 V7',
        melodia: `5 . 3 . . 5 3 . | 6 . 1' . 6 . 5 . | 4 . 6 . . 4 6 . | 5 - - . 4 . 2 . |
                  3 . 5 . . 7 5 . | 3' . #1' . 6 . 5 . | 4 . 6 . 1' . 6 . | 7 . 5 . 2' . . .` },
      { accordi: 'IVmaj7 IVmaj7 iii7 vi7 ii7 V7 I V7',
        melodia: `6 - 3' - 1' . 6 . | 3 - 1' - 6 . 3 . | 7 . 5 . 3 . 2' . | 1' - 6 - 3 . . . |
                  4 . 6 . 1' . 2' . | 4' . 2' . 7 . 5 . | 1' . 5 . 3 . 1 . | 2 . . 5, . 7, . .` },
    ],
  },

  // Scontrino, prego!: guardie e ladri, comica e staccata
  guardie: {
    titolo: 'Guardie e ladri', carattere: 'guardie e ladri, comica e staccata',
    bpm: 126, tonica: 'Bb4', modo: 'maggiore', metro: 4, swing: 0,
    lead: { onda: 0.25, staccato: 0.4 }, seconda: { tipo: 'eco', onda: 0.125 },
    basso: 'R . 5 . R . 5 .', ritmica: '..x...x.',
    batteria: { 1: { k: 'x...x...', h: '..x...x.' }, 2: { k: 'x...x...', s: '..x...x.', h: 'x.x.x.x.' } },
    atto3: { tempo: 1.07 }, volume: 1.14,
    parti: [
      { accordi: 'I I IV I II7 V7 I V7',
        melodia: `1 . 3 . 5 . 5 . | 6 5 #4 5 1' . . . | 6 . 4 . 6 . 1' . | 5 4 3 2 1 . . . |
                  2 . #4 . 6 . 1' . | 7 . 5 . 2' . 4' . | 3' . 1' . 5 . 3 . | 2 - 7, - 5, - . .` },
      { accordi: 'vi vi iii iii IV iv I V7',
        melodia: `3 . . 3 #2 3 6 . | 1' . 6 . 3 . . . | 7 . . 7 #6 7 3' . | 5 . 3 . 7, . . . |
                  4 . 6 . 1' . 6 . | b6 . 4 . b6 . 1' . | 5 . 3 . 1 . 3 . | 2 . 4 . 7 . 2' .` },
    ],
  },

  // Capitan Ghiori: la canzone dei marinai, in 6/8 e in minore (la fisarmonica che fa um-pa-pa, il
  // ponte di legno battuto coi piedi)
  marinara: {
    titolo: 'Capitan Ghiori', carattere: 'canzone da marinai, in 6/8',
    bpm: 108, tonica: 'D5', modo: 'minore', metro: '6/8', swing: 0,
    lead: { onda: 0.5, staccato: 0.6 }, seconda: { tipo: 'terze', onda: 0.25 },
    basso: 'R . . 5 . .', ritmica: '.xx.xx',
    batteria: { 1: { k: 'x..x..', h: '..x..x' }, 2: { k: 'x..x..', s: '...x..', h: 'x.xx.x' }, finale: { k: 'x..x..', s: '..x.xx', h: 'xxxxxx' } },
    atto3: { tempo: 1.07 }, volume: 1,
    parti: [
      { accordi: 'i i bVII bVII i i V7 i',
        melodia: `1 . 1 1 3 5 | 5 . 4 3 . 1 | 7, . 7, 7, 2 4 | 4 . 3 2 . 7, |
                  1 . 1 1 3 5 | 1' . 7 5 . 3 | 2 . #7, 2 . 5 | 1 - - 1 . .` },
      { accordi: 'bIII bVII iv V7 i bVII V7 i',
        melodia: `3 . 5 7 . 5 | 4 . 2 7, . 2 | 6 . 4 1 . 4 | 5 - - . #7, 2 |
                  1' . 5 3 . 5 | 4 . 2 7, 2 4 | 5 . 4 2 . #7, | 1 - - . . .` },
    ],
  },
};

// ------------------------------------------------------------
//  I JINGLE (2-4 secondi), scritti come le musiche: si suonano una volta (Audio.jingle). bus: 'effetti'
//  = sul volume degli effetti (il conto alla rovescia), se no su quello della musica.
// ------------------------------------------------------------
export const JINGLE = {
  vittoria: {
    bpm: 168, tonica: 'C5', modo: 'maggiore', metro: 4,
    lead: { onda: 0.5, staccato: 0.85 }, seconda: { tipo: 'terze', onda: 0.25 }, basso: 'R . 5 . 8 . 5 .',
    batteria: { 1: { k: 'x...x...', s: '..x.xxxx' } },
    parti: [{ accordi: 'I IV/V I', melodia: `1 . 3 . 5 . 1' . | 6 . 1' . 7 . 2' . | 1' - - - - - . .` }],
  },
  sconfitta: {
    bpm: 132, tonica: 'C5', modo: 'maggiore', metro: 4,
    lead: { onda: 0.25, staccato: 0.9 }, basso: 'R - - - 5 - - -',
    batteria: { 1: { k: 'x.......', t: '....x...' } },
    parti: [{ accordi: 'iv V7', melodia: `1' - 7 - b7 - 6 - | b6 - 5 - . 2 1 .` }],
  },
  medagliaBronzo: {
    bpm: 176, tonica: 'C5', modo: 'maggiore', metro: 4,
    lead: { onda: 0.25, staccato: 0.8 }, basso: 'R - - - - - - -',
    parti: [{ accordi: 'I', melodia: `1 3 5 1' 3' - - .` }],
  },
  medagliaArgento: {
    bpm: 176, tonica: 'D5', modo: 'maggiore', metro: 4,
    lead: { onda: 0.25, staccato: 0.8 }, seconda: { tipo: 'terze', onda: 0.125 }, basso: 'R - - - 5 - - -',
    parti: [{ accordi: 'I', melodia: `1 3 5 1' 3' 5' 1'' .` }],
  },
  medagliaOro: {
    bpm: 176, tonica: 'Eb5', modo: 'maggiore', metro: 4,
    lead: { onda: 0.5, staccato: 0.85 }, seconda: { tipo: 'terze', onda: 0.25 }, basso: 'R . 5 . 8 . 5 .',
    batteria: { 1: { k: 'x...x...', s: '....xxxx' } },
    parti: [{ accordi: 'I IV/V I', melodia: `1 3 5 1' 3' 5' 1'' . | 6' . 4' . 7' . 5' . | 1'' - - - . . . .` }],
  },
  trofeo: {
    bpm: 144, tonica: 'F4', modo: 'maggiore', metro: 4,
    lead: { onda: 0.5, staccato: 0.8 }, seconda: { tipo: 'terze', onda: 0.25 }, basso: 'R . 5 . R . 5 .',
    batteria: { 1: { k: 'x...x...', s: '..x.xxxx' } },
    parti: [{ accordi: 'I IV/V I', melodia: `5, . 1 . 1 1 3 . | 4 . 6 . 5 . 7 . | 1' - - - - . . .` }],
  },
  // il conto alla rovescia: 3, 2, 1 e VIA! (uno alla volta, ogni 650 ms: vedi l'introduzione)
  conto3: { bpm: 120, tonica: 'C5', modo: 'maggiore', metro: 4, bus: 'effetti', lead: { onda: 0.5, staccato: 0.6 }, batteria: { 1: { t: 'x.......' } }, parti: [{ accordi: 'I', melodia: `1 . . . . . . .` }] },
  conto2: { bpm: 120, tonica: 'C5', modo: 'maggiore', metro: 4, bus: 'effetti', lead: { onda: 0.5, staccato: 0.6 }, batteria: { 1: { t: 'x.......' } }, parti: [{ accordi: 'I', melodia: `3 . . . . . . .` }] },
  conto1: { bpm: 120, tonica: 'C5', modo: 'maggiore', metro: 4, bus: 'effetti', lead: { onda: 0.5, staccato: 0.6 }, batteria: { 1: { t: 'x.......' } }, parti: [{ accordi: 'I', melodia: `5 . . . . . . .` }] },
  contoVia: {
    bpm: 150, tonica: 'C5', modo: 'maggiore', metro: 4, bus: 'effetti',
    lead: { onda: 0.5, staccato: 0.9 }, seconda: { tipo: 'terze', onda: 0.25 }, basso: 'R - - - . . . .',
    batteria: { 1: { k: 'x.......', s: 'X.......', o: 'x.......' } },
    parti: [{ accordi: 'I', melodia: `1' - - - . . . .` }],
  },
};
