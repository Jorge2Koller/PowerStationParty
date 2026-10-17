// ============================================================
//  CONFIGURAZIONE GENERALE
//  Titolo, giocatori, personaggi giocabili, modalità. Ogni microgioco ha il suo file in
//  js/config/microgiochi/<id>.js (durata, comandi, punti, difficoltà); le frasi di sfottò
//  sono in js/config/frasi.js. Qui sotto si mettono insieme in CONFIG, che il resto del
//  gioco usa come prima (CONFIG.microgiochi.spina, CONFIG.sfotto...).
// ============================================================

import spina from './config/microgiochi/spina.js';
import regrorio from './config/microgiochi/regrorio.js';
import barba from './config/microgiochi/barba.js';
import panino from './config/microgiochi/panino.js';
import mani from './config/microgiochi/mani.js';
import sego from './config/microgiochi/sego.js';
import ronda from './config/microgiochi/ronda.js';
import blackjack from './config/microgiochi/blackjack.js';
import palleggi from './config/microgiochi/palleggi.js';
import passaseo from './config/microgiochi/passaseo.js';
import bota from './config/microgiochi/bota.js';
import guida from './config/microgiochi/guida.js';
import piovra from './config/microgiochi/piovra.js';
import scapoli from './config/microgiochi/scapoli.js';
import retromarcia from './config/microgiochi/retromarcia.js';
import beerpongMicro from './config/microgiochi/beerpong.js';
import xfactor from './config/microgiochi/xfactor.js';
import pizza from './config/microgiochi/pizza.js';
import ballata from './config/microgiochi/ballata.js';
import proverbi from './config/microgiochi/proverbi.js';
import beerpong from './config/beerpong.js';
import { sfotto, sfottoTanti, frasiPareggio } from './config/frasi.js';
import premi from './config/premi.js';
import novita from './config/novita.js';
import trofei from './config/trofei.js';
import bancone from './config/bancone.js';
import modalita from './config/modalita.js';

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
  // (breve: il nome nelle celle piccole, come la griglia della selezione, dove quello intero non entra)
  personaggiGiocabili: [
    { id: 'riccardo', nome: 'Riccardo', soprannome: 'Mister PowerStation', colore: '#ff6b5a', esulta: 'Stasera offro io. Forse.', perde: 'Era solo riscaldamento.' },
    { id: 'giorgio', nome: 'Giorgio', soprannome: 'Il Passaggiorgio', colore: '#5ab4ff', esulta: 'E adesso chi mi riporta a casa?', perde: 'Tanto guidava qualcun altro.' },
    { id: 'marco', nome: "O'Sfurnacchiat", breve: 'Marco', soprannome: 'Marco De Luca', colore: '#ffb02e', esulta: 'Liscio come una barba fatta bene!', perde: 'Mi sono tagliato da solo.' },
    { id: 'greg', nome: 'ReGrorio', soprannome: 'Greg, il re della Golf', colore: '#b06aff', esulta: 'Largo, passa il re!', perde: 'Mi si è ingolfata la Golf.' },
    { id: 'guerra', nome: 'Guerra', soprannome: 'Mani lunghe', colore: '#4ade80', esulta: 'E ora si mangia!', perde: 'A stomaco vuoto non rendo.' },
    { id: 'sego', nome: 'Sego', soprannome: 'Franci', colore: '#ff7ac8', esulta: 'Scendo, scendo... a festeggiare!', perde: 'Io stavo ancora dormendo.' },
    { id: 'generale', nome: 'Il Generale', breve: 'Generale', soprannome: 'Torricelli', colore: '#9fb86a', esulta: 'Missione compiuta, soldati!', perde: 'Ritirata strategica.' },
    { id: 'ingiocabile', nome: "L'Ingiocabile", breve: 'Ingiocabile', soprannome: 'Il banco vince sempre', colore: '#2dd4bf', esulta: 'Il banco vince. Sempre.', perde: 'Avete barato, lo so.' },
    { id: 'passaseo', nome: 'Passaseo', soprannome: 'Il ciclista', colore: '#ffe14a', esulta: 'In volata!', perde: 'Ho bucato.' },
    { id: 'bota', nome: 'Il Bota', breve: 'Bota', soprannome: 'Mister abbronzatura', colore: '#ff8a3a', esulta: 'Abbronzato e vincente.', perde: 'Mi sono scottato.' },
    { id: 'petri', nome: 'Petri', soprannome: 'Il Piovra', colore: '#8fa8ff', esulta: 'Ci ho messo le mani, tutte!', perde: 'Mi sono impigliato.' },
    { id: 'manna', nome: 'Il Manna', breve: 'Manna', soprannome: 'La Calamita', colore: '#f6c63a', esulta: 'Ovviamente.', perde: 'Era bianca! BIANCA!' },
    { id: 'pastaffi', nome: 'Pastaffi', soprannome: 'Il figlio di Emilio', colore: '#c98a4e', esulta: 'Papà, hai visto?', perde: 'Papà, non guardare.' },
    // i due cantanti di "Provini a X-Factor"
    { id: 'tini', nome: 'Tini', soprannome: 'Social Tedio', colore: '#b6f23c', esulta: 'Questa finisce nel disco.', perde: 'Il pubblico non era pronto.' },
    { id: 'oli', nome: 'Oli', soprannome: 'Vanz', colore: '#4d7cff', esulta: 'Sold out, ragazzi!', perde: 'Avevo il microfono spento.' },
    { id: 'boni', nome: 'Boni', soprannome: 'Il Nutrizionista', colore: '#e5383b', esulta: 'Pizza per tutti: è dietetica, lo dico io!', perde: 'Troppi carboidrati. Mi ritiro.' },
    { id: 'lori', nome: 'Lori', soprannome: 'Il Cantastorie', colore: '#f4e3c1', esulta: 'E vissero tutti felici e contenti!', perde: 'Il pubblico non capisce l\'arte.' },
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
  ordineSfida: ['spina', 'regrorio', 'barba', 'panino', 'mani', 'sego', 'ronda', 'blackjack', 'palleggi', 'passaseo', 'bota', 'guida', 'piovra', 'scapoli', 'retromarcia', 'beerpong', 'xfactor', 'pizza', 'ballata', 'proverbi'],

  // un file per microgioco, nell'ordine della raccolta (vedi js/config/microgiochi/)
  microgiochi: { spina, regrorio, barba, panino, mani, sego, ronda, blackjack, palleggi, passaseo, bota, guida, piovra, scapoli, retromarcia, beerpong: beerpongMicro, xfactor, pizza, ballata, proverbi },

  // il beer pong: il tiro, la sbronza, le gag e le reazioni, in comune tra il microgioco qui sopra
  // e la modalità BEER PONG (js/config/beerpong.js)
  beerpong,

  // frasi di sfottò e di pareggio della classifica finale (js/config/frasi.js)
  sfotto, sfottoTanti, frasiPareggio,

  // prova lampo: la prima volta che si incontra un microgioco (Impostazioni: Prova lampo),
  // prima della partita vera si gioca tanti secondi di prova, che non contano
  provaLampo: 6,

  // premi buffi di fine sfida (js/config/premi.js) e schermata Novità (js/config/novita.js)
  premi, novita,

  // trofei (js/config/trofei.js) e Bancone: Pinte, costumi, temi, frasi (js/config/bancone.js)
  trofei, bancone,

  // le modalità Lampo, Da solo, Torneo, Squadre, Sfida del giorno (js/config/modalita.js)
  modalita,
};
