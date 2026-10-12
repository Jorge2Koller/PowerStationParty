// BEER PONG, la modalità: le regole della partita vera (niente Phaser: solo lo stato e i conti).
// Squadre ROSSI (0) e BLU (1) in ordine di scelta, come nella modalità Squadre: il 1°, il 3°, il 5°
// sono rossi; il 2°, il 4°, il 6° blu. Con un numero dispari di giocatori l'ultimo scelto fa
// l'arbitro. Si tira a turno, alternando le squadre e, dentro una squadra, i giocatori. Vince chi
// toglie per primo tutti i bicchieri avversari; a tempo scaduto si finisce il giro (un tiro per
// squadra) e vince chi ha più bicchieri in piedi; se sono pari si va a oltranza, un giro alla volta.
// I numeri sono in js/config/modalita.js (blocco beerpong).
import { triangolo, livelloSbronza } from './motore.js';

// in quanti si gioca: quanti per squadra, se c'è l'arbitro, quanti bicchieri a squadra
export function formato(n, R) {
  const per = Math.max(1, Math.floor(n / 2));
  return { per, arbitro: n % 2 === 1 && n > 1, bicchieri: R.bicchieri[per] ?? 10 };
}

export class Partita {
  // giocatori = quelli della sessione, nell'ordine di scelta; R = CONFIG.modalita.beerpong;
  // soglie = quelle della sbronza (CONFIG.beerpong.sbronza.soglie)
  constructor(giocatori, R, soglie, rnd = Math.random) {
    const f = formato(giocatori.length, R);
    this.R = R;
    this.soglie = soglie;
    this.totale = f.bicchieri;
    this.arbitro = f.arbitro ? giocatori[giocatori.length - 1] : null;
    const inGioco = f.arbitro ? giocatori.slice(0, -1) : giocatori;
    this.squadre = [0, 1].map((q) => ({
      q,
      membri: inGioco.filter((_g, i) => i % 2 === q),
      bicchieri: triangolo(f.bicchieri).map((b) => ({ ...b, su: true })),
      giro: 0,                        // quanti tiri ha fatto la squadra (decide a chi tocca dentro la squadra)
    }));
    this.primo = rnd() < 0.5 ? 0 : 1; // chi tira per primo in ogni giro: a sorte
    this.diTurno = this.primo;
    this.tempo = 0;                   // secondi di gioco passati
    this.tiri = 0;
    this.oltranza = false;
    this.vincitrice = null;           // 0 | 1 quando è finita
  }

  get squadra() { return this.squadre[this.diTurno]; }
  get avversaria() { return this.squadre[1 - this.diTurno]; }
  get tiratore() { const s = this.squadra; return s.membri[s.giro % s.membri.length]; }
  get scaduto() { return this.tempo >= this.R.tempoMassimo; }
  get tempoRimasto() { return Math.max(0, this.R.tempoMassimo - this.tempo); }
  inPiedi(q) { return this.squadre[q].bicchieri.filter((b) => b.su).length; }
  // ogni bicchiere centrato alla squadra è un bicchiere bevuto dalla squadra
  bevuti(q) { return this.totale - this.inPiedi(q); }
  sbronza(q) { return livelloSbronza(this.bevuti(q), this.totale, this.soglie); }
  giocatori() { return [...this.squadre[0].membri, ...this.squadre[1].membri]; }

  // Dopo ogni tiro (i bicchieri li ha già spenti il tavolo): tocca agli altri, oppure è finita.
  // Ritorna true se la partita è finita (this.vincitrice dice chi ha vinto).
  dopoTiro() {
    this.tiri++;
    this.squadra.giro++;
    const a = this.inPiedi(0), b = this.inPiedi(1);
    if (a === 0 || b === 0) { this.vincitrice = a === 0 ? 1 : 0; return true; }
    const giroFinito = this.diTurno !== this.primo;       // hanno tirato tutte e due
    if (giroFinito && this.scaduto) {
      if (a !== b) { this.vincitrice = a > b ? 0 : 1; return true; }
      this.oltranza = true;                               // pari: un altro giro, un tiro a testa
    }
    this.diTurno = 1 - this.diTurno;
    return false;
  }
}
