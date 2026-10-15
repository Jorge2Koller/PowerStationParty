// Il Profilo: statistiche dei personaggi, trofei, record dei microgiochi, albo d'oro delle sfide
// (i dati li tiene js/progressi.js). Quattro schede:
//  - tastiera: SINISTRA/DESTRA la scheda, SU/GIÙ il personaggio (o la pagina), ESC menu
//  - mouse e dito: si toccano la scheda e le frecce
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Progressi, elencoTrofei } from '../progressi.js';
import { ritratto } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, eTouch, perDito, pulsante } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

const SCHEDE = [['personaggi', 'PERSONAGGI'], ['trofei', 'TROFEI'], ['record', 'RECORD'], ['albo', "ALBO D'ORO"]];
const MEDAGLIA = ['medaglia_vuota', 'medaglia_bronzo', 'medaglia_argento', 'medaglia_oro'];
const TIPI = { completa: 'COMPLETA', rapida: 'RAPIDA', meglioDi: 'AL MEGLIO DI', singola: 'SINGOLA', lampo: 'LAMPO', squadre: 'SQUADRE', torneo: 'TORNEO', beerpong: 'BEER PONG' };
const PER_PAGINA = { trofei: 12, albo: 11 };
const data = (ms) => { const d = new Date(ms); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`; };

export class ProfiloScene extends Phaser.Scene {
  constructor() { super('Profilo'); }

  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('menu');
    raggi(this, 0x2f8fd0, 0x5ab0ea);
    this.scheda = 0;
    this.chi = 0;              // il personaggio della scheda PERSONAGGI
    this.pagina = 0;
    this.oggetti = [];

    txt(this, 240, 18, 'PROFILO', { size: 18, color: '#ffe14a' });
    this.gSchede = this.add.graphics();   // (prima delle scritte: ci stanno sopra)
    this.schede = SCHEDE.map(([, nome], i) => txt(this, 105 + i * 92, 40, nome, { size: 8 })
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.vaiScheda(i)));
    pannello(this, 240, 146, 456, 172, { alfa: 0.72, raggio: 10 });
    // frecce su e giù (personaggio o pagina), anche da toccare
    this.frecce = [-1, 1].map((d) => txt(this, 458, 146 + d * 70, d < 0 ? '▲' : '▼', { size: 10, color: '#ffe14a' })
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.su(d)));

    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => this.vaiScheda(this.scheda - 1));
    kb.on('keydown-RIGHT', () => this.vaiScheda(this.scheda + 1));
    kb.on('keydown-UP', () => this.su(-1));
    kb.on('keydown-DOWN', () => this.su(1));
    const indietro = () => { Audio.sfx('scegli'); this.scene.start('Menu'); };
    for (const k of ['ESC', 'ENTER']) kb.on('keydown-' + k, indietro);
    if (eTouch()) pulsante(this, 16, 13, 'indietro', indietro);
    txt(this, 240, 254, perDito('SINISTRA/DESTRA: scheda     SU/GIÙ: scorri     ESC: menu', 'Tocca le schede e le frecce'), { size: 6.5, color: '#fff3d6' });
    pulsantiAngolo(this);
    this.disegna();
  }

  get nome() { return SCHEDE[this.scheda][0]; }

  vaiScheda(i) {
    const n = (i + SCHEDE.length) % SCHEDE.length;
    if (n === this.scheda) return;
    this.scheda = n;
    this.pagina = 0;
    Audio.sfx('muovi');
    this.disegna();
  }

  pagine() {
    if (this.nome === 'trofei') return Math.ceil(elencoTrofei().length / PER_PAGINA.trofei);
    if (this.nome === 'albo') return Math.max(1, Math.ceil(Progressi.albo.length / PER_PAGINA.albo));
    return 1;
  }

  su(d) {
    if (this.nome === 'personaggi') {
      const n = CONFIG.personaggiGiocabili.length;
      this.chi = (this.chi + d + n) % n;
    } else {
      const p = Phaser.Math.Clamp(this.pagina + d, 0, this.pagine() - 1);
      if (p === this.pagina) return;
      this.pagina = p;
    }
    Audio.sfx('muovi');
    this.disegna();
  }

  disegna() {
    for (const o of this.oggetti) o.destroy();
    this.oggetti = [];
    const g = this.gSchede;
    g.clear();
    this.schede.forEach((t, i) => {
      const su = i === this.scheda, w = t.width + 14;
      t.setColor(su ? '#1f1430' : '#ffffff').setStroke(su ? '#ffe14a' : '#1f1430', su ? 0 : 3);
      if (su) { g.fillStyle(0xffe14a, 1); g.fillRoundedRect(t.x - w / 2, t.y - 7, w, 14, 7); }
    });
    const scorre = this.nome === 'personaggi' || this.pagine() > 1;
    this.frecce.forEach((f) => f.setVisible(scorre));
    this[this.nome]();
  }

  t(x, y, s, o) { const t = txt(this, x, y, s, o); this.oggetti.push(t); return t; }
  i(x, y, key, k) { const i = im(this, x, y, key, k); this.oggetti.push(i); return i; }

  // --- un personaggio: le sue statistiche e la medaglia migliore in ogni microgioco ---
  personaggi() {
    const G = CONFIG.personaggiGiocabili[this.chi], s = Progressi.statistiche.personaggi[G.id];
    this.oggetti.push(ritratto(this, 70, 100, G.id, 56, 'felice'));
    this.t(70, 140, G.nome.toUpperCase(), { size: G.nome.length > 11 ? 8 : 10, color: G.colore });
    this.t(70, 152, G.soprannome, { size: 6, color: '#fff3d6' });
    const righe = s ? [
      ['Microgiochi giocati', s.turni],
      ['Sfide', `${s.sfideVinte} vinte su ${s.sfide}`],
      ['Round vinti', s.roundVinti],
      ['Medaglie', `${s.ori} ori, ${s.argenti} argenti, ${s.bronzi} bronzi`],
      // (le partite della modalità BEER PONG, per chi ne ha giocate)
      ...(s.beerpong ? [['Beer pong', `${s.beerpong.vittorie} vinte su ${s.beerpong.partite}`]] : []),
    ] : [['Non ha ancora giocato', '']];
    const passoRighe = righe.length > 4 ? 12 : 13;
    righe.forEach(([a, b], k) => {
      this.t(20, 172 + k * passoRighe, a, { size: 6.5, ox: 0, color: '#ffe14a' });
      this.t(140, 172 + k * passoRighe, String(b), { size: 6.5, ox: 1 });
    });
    // la griglia dei microgiochi: celle tutte uguali, 5 per riga (il verbo più lungo, PALLEGGIA!,
    // ci sta con un po' di spazio prima del vicino)
    this.t(310, 70, 'LA MEDAGLIA MIGLIORE', { size: 7, color: '#ffe14a' });
    const tutti = Object.keys(CONFIG.microgiochi), COL = 5, largo = 56, alto = 38;
    tutti.forEach((id, k) => {
      const x = 198 + (k % COL) * largo, y = 94 + Math.floor(k / COL) * alto, liv = Progressi.medagliaMigliore(id, G.id);
      this.i(x, y, MEDAGLIA[liv], 0.6).setAlpha(liv ? 1 : 0.6);
      this.t(x, y + 16, CONFIG.microgiochi[id].verbo ?? id, { size: 7, color: liv ? '#ffffff' : '#b8b0c8' });
    });
  }

  // --- i trofei: 12 per pagina, in due colonne ---
  trofei() {
    const T = elencoTrofei(), presi = T.filter((t) => t.sbloccato).length, P = PER_PAGINA.trofei;
    this.t(240, 64, `TROFEI: ${presi} su ${T.length}` + (this.pagine() > 1 ? `   (pagina ${this.pagina + 1} di ${this.pagine()})` : ''), { size: 7, color: '#ffe14a' });
    T.slice(this.pagina * P, this.pagina * P + P).forEach((t, k) => {
      const x = 28 + (k % 2) * 214, y = 84 + Math.floor(k / 2) * 25;
      this.i(x, y, t.sbloccato ? 'coppa' : 'coppaGrigia', 0.6);
      this.t(x + 14, y - 5, t.nome, { size: 7, ox: 0, color: t.sbloccato ? '#ffe14a' : '#d8d0e8' });
      this.t(x + 14, y + 5, t.descrizione + (t.sbloccato ? `  (${data(t.giorno)})` : ''), { size: 5.2, ox: 0, color: t.sbloccato ? '#fff3d6' : '#a8a0b8', wrap: 196 });
    });
  }

  // --- i record di sempre, uno per microgioco ---
  record() {
    const R = Progressi.record, tutti = Object.keys(CONFIG.microgiochi), passo = Math.min(11.2, 160 / tutti.length);   // (con più di 15 le righe si stringono un po')
    tutti.forEach((id, k) => {
      const y = 66 + k * passo, r = R[id], liv = Progressi.medagliaMigliore(id);
      this.t(22, y, CONFIG.microgiochi[id].titolo, { size: 6.5, ox: 0, color: '#ffe14a' });
      this.t(300, y, r ? String(r.punteggio) : '-', { size: 7, ox: 1 });
      if (r) this.t(312, y, r.nome, { size: 6.5, ox: 0, color: CONFIG.personaggiGiocabili.find((g) => g.id === r.chi)?.colore ?? '#ffffff' });
      if (r) this.t(410, y, data(r.giorno), { size: 5.5, ox: 0, color: '#b8b0c8' });
      this.i(448, y, MEDAGLIA[liv], 0.3).setAlpha(liv ? 1 : 0.5);
    });
  }

  // --- l'albo d'oro: le ultime sfide e chi le ha vinte ---
  albo() {
    const A = Progressi.albo, P = PER_PAGINA.albo, nomi = Object.fromEntries(CONFIG.personaggiGiocabili.map((g) => [g.id, g]));
    this.t(240, 64, `SFIDE FINITE: ${Progressi.statistiche.sfide}` + (this.pagine() > 1 ? `   (pagina ${this.pagina + 1} di ${this.pagine()})` : ''), { size: 7, color: '#ffe14a' });
    if (!A.length) return void this.t(240, 140, 'Ancora nessuna sfida finita: si comincia da GIOCA!', { size: 8 });
    A.slice(this.pagina * P, this.pagina * P + P).forEach((a, k) => {
      const y = 82 + k * 13.5, v = a.vincitore && nomi[a.vincitore];
      this.t(22, y, data(a.giorno), { size: 6.5, ox: 0, color: '#b8b0c8' });
      this.t(78, y, `${TIPI[a.tipo] ?? a.tipo}, in ${a.n}`, { size: 6.5, ox: 0 });
      this.t(200, y, a.squadra ? `VINCONO I ${a.squadra}` : v ? `VINCE ${v.nome.toUpperCase()}` : 'PAREGGIO', { size: 7, ox: 0, color: v ? v.colore : '#ffffff' });
      this.oggetti.push(...a.giocatori.filter((id) => nomi[id]).slice(0, 8).map((id, j) => ritratto(this, 330 + j * 15, y, id, 12)));   // (chi non c'è più si salta)
    });
  }
}
