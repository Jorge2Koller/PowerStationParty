// Il Bancone: Beppe serve, le Pinte si spendono (cosa c'è in vendita: js/config/bancone.js;
// i conti: js/progressi.js). Quattro banchi: COSTUMI, TEMI, FRASI, MODALITÀ.
//  - tastiera: SINISTRA/DESTRA il banco, SU/GIÙ la voce, INVIO compra (o usa), ESC indietro;
//    su un costume già comprato INVIO apre la fila dei personaggi: SINISTRA/DESTRA chi, INVIO
//    glielo metti (o glielo togli), ESC chiude la fila
//  - mouse e dito: si tocca il banco, la voce, il personaggio
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Progressi } from '../progressi.js';
import { SP, ritratto, vestiPersonaggio } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, ombra, stelle, scritta, fumetto, caso, eTouch, perDito, pulsante, annunciaTrofei } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

const BANCHI = [['costumi', 'COSTUMI'], ['temi', 'TEMI'], ['frasi', 'FRASI'], ['modalita', 'MODALITÀ']];
const X_LISTA = 290, Y_LISTA = 66, PASSO = 19;
const FRASI_BEPPE = { compra: ['Salute!', 'Ottima scelta.', 'Offre la casa? No.', 'Alla tua!'], poche: ['Prima le Pinte.', 'Qui non si fa credito.', 'Torna più ricco.'] };

export class BanconeScene extends Phaser.Scene {
  constructor() { super('Bancone'); }

  create(dati) {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('menu');
    raggi(this, 0xb5651d, 0xd8893a);
    this.banco = dati?.banco ?? 0;     // (cambiando tema la schermata riparte, sullo stesso banco)
    this.sel = 0;
    this.fila = null;          // la fila dei personaggi (costumi): indice del personaggio scelto
    this.oggetti = [];         // quello che si ridisegna cambiando banco

    txt(this, 290, 18, 'IL BANCONE', { size: 18, color: '#ffe14a' });
    // Beppe dietro al bancone
    ombra(this, 54, 262, 60);
    this.beppe = im(this, 54, 262, 'beppe_normale').setOrigin(0.5, 1).setScale(2.7 * SP);
    // le Pinte
    pannello(this, 438, 18, 70, 20, { alfa: 0.7, raggio: 9 });
    im(this, 418, 18, 'iconaPinta', 0.62);
    this.testoPinte = txt(this, 446, 18, '', { size: 10, color: '#ffe14a' });
    // i banchi (lo sfondo giallo di quello scelto va disegnato prima delle scritte)
    this.gSchede = this.add.graphics();
    this.schede = BANCHI.map(([, nome], i) => txt(this, 150 + i * 88, 44, nome, { size: 8 })
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.chiudiFila(); this.vaiBanco(i); }));
    pannello(this, X_LISTA, 140, 352, 156, { alfa: 0.72, raggio: 10 });
    this.aiuto = txt(this, X_LISTA, 228, '', { size: 6.5, color: '#fff3d6', wrap: 350 });

    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => (this.fila != null ? this.muoviFila(-1) : this.vaiBanco(this.banco - 1)));
    kb.on('keydown-RIGHT', () => (this.fila != null ? this.muoviFila(1) : this.vaiBanco(this.banco + 1)));
    kb.on('keydown-UP', () => (this.fila != null ? this.chiudiFila() : this.vaiVoce(this.sel - 1)));
    kb.on('keydown-DOWN', () => { if (this.fila == null) this.vaiVoce(this.sel + 1); });
    const ok = (e) => { if (!e.repeat) { if (this.fila != null) this.indossa(); else this.agisci(); } };
    kb.on('keydown-ENTER', ok);
    kb.on('keydown-SPACE', ok);
    const indietro = () => { if (this.fila != null) return this.chiudiFila(); Audio.sfx('scegli'); this.scene.start('Menu'); };
    kb.on('keydown-ESC', indietro);
    if (eTouch()) pulsante(this, 16, 13, 'indietro', indietro);
    else txt(this, 290, 256, 'FRECCE: scegli     INVIO: compra o usa     ESC: menu', { size: 6.5, color: '#fff3d6' });
    pulsantiAngolo(this);
    this.parla('Cosa ti servo?');
    this.vaiBanco(this.banco, true);
  }

  get voci() { return CONFIG.bancone[BANCHI[this.banco][0]]; }
  get tipo() { return BANCHI[this.banco][0]; }

  parla(s) {
    this.fum?.destroy();
    this.fum = fumetto(this, 70, 150, s, 1600, 50);
  }

  vaiBanco(i, primo = false) {
    const n = (i + BANCHI.length) % BANCHI.length;
    if (n !== this.banco && !primo) Audio.sfx('muovi');
    this.banco = n;
    this.sel = 0;
    this.disegna();
  }

  vaiVoce(i) {
    const n = Phaser.Math.Clamp(i, 0, this.voci.length - 1);
    if (n !== this.sel) { this.sel = n; Audio.sfx('muovi'); this.disegna(); }
  }

  // lo stato di una voce: quanto costa, o se è già tua / in uso / in arrivo
  stato(v) {
    const T = this.tipo;
    if (v.presto) return ['IN ARRIVO', '#c8c8ff'];
    if (T === 'temi' && Progressi.tema === v.id) return ['IN USO', '#7dff9a'];
    if (Progressi.comprato(T, v.id)) {
      if (T === 'costumi') { const chi = CONFIG.personaggiGiocabili.filter((g) => Progressi.costume(g.id) === v.id).length; return [chi ? `TUO (${chi})` : 'TUO', '#7dff9a']; }
      return ['TUO', '#7dff9a'];
    }
    return [null, Progressi.pinte >= v.costo ? '#ffffff' : '#ff9a8a'];
  }

  disegna() {
    for (const o of this.oggetti) o.destroy();
    this.oggetti = [];
    const g = this.gSchede;
    g.clear();
    this.schede.forEach((t, i) => {
      const su = i === this.banco, w = t.width + 14;
      t.setColor(su ? '#1f1430' : '#ffffff').setStroke(su ? '#ffe14a' : '#1f1430', su ? 0 : 3);
      if (su) { g.fillStyle(0xffe14a, 1); g.fillRoundedRect(t.x - w / 2, t.y - 7, w, 14, 7); }
    });
    this.testoPinte.setText(String(Progressi.pinte));
    this.voci.forEach((v, i) => {
      const y = Y_LISTA + i * PASSO, su = i === this.sel, [stato, col] = this.stato(v);
      if (su) {
        const h = this.add.graphics();
        h.fillStyle(0xffe14a, 0.22).fillRoundedRect(X_LISTA - 168, y - 8.5, 336, 17, 8);
        h.lineStyle(1.2, 0xffe14a, 1).strokeRoundedRect(X_LISTA - 168, y - 8.5, 336, 17, 8);
        this.oggetti.push(h);
      }
      const nome = txt(this, X_LISTA - 156, y, v.nome, { size: 8, ox: 0, color: su ? '#ffe14a' : '#ffffff' });
      const zona = this.add.rectangle(X_LISTA, y, 336, PASSO - 1, 0xffffff, 0.001).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { this.chiudiFila(); if (this.sel !== i) { this.sel = i; this.disegna(); } this.agisci(); });
      this.oggetti.push(nome, zona);
      if (stato) this.oggetti.push(txt(this, X_LISTA + 156, y, stato, { size: 7.5, ox: 1, color: col }));
      else { const c = txt(this, X_LISTA + 156, y, String(v.costo), { size: 8.5, ox: 1, color: col }); this.oggetti.push(c, im(this, c.x - c.width - 6, y, 'iconaPinta', 0.45)); }
    });
    const v = this.voci[this.sel], [stato] = this.stato(v), T = this.tipo;
    this.aiuto.setText(v.presto ? 'Arriva con un prossimo aggiornamento.'
      : !stato || stato === 'IN ARRIVO' ? perDito('INVIO: compra', 'Tocca di nuovo: compra')
      : T === 'costumi' ? perDito('INVIO: scegli a chi metterlo', 'Tocca: scegli a chi metterlo')
      : T === 'temi' ? (stato === 'IN USO' ? 'Lo sfondo di tutte le schermate' : perDito('INVIO: usalo', 'Tocca: usalo'))
      : T === 'frasi' ? 'Le frasi escono da sole nella classifica finale' : '');
    if (this.fila != null) this.disegnaFila();
  }

  agisci() {
    const v = this.voci[this.sel], T = this.tipo;
    if (Progressi.comprato(T, v.id)) {
      if (T === 'costumi') return this.apriFila();
      if (T === 'temi') { Progressi.scegliTema(v.id); Audio.sfx('ok'); return this.scene.restart({ banco: this.banco }); }
      Audio.sfx('muovi');
      return;
    }
    const r = Progressi.compra(T, v.id);
    if (!r.ok) {
      Audio.sfx('vuoto');
      scritta(this, X_LISTA, 210, r.errore, { size: 10, color: '#ff9a8a', durata: 500 });
      if (r.errore === 'PINTE NON BASTANO!') this.parla(caso(FRASI_BEPPE.poche));
      return;
    }
    Audio.sfx('bonus');
    scritta(this, X_LISTA, 210, 'COMPRATO!', { size: 12, color: '#7dff9a', durata: 600 });
    stelle(this, X_LISTA, Y_LISTA + this.sel * PASSO, 6);
    this.beppe.setTexture('beppe_felice');
    this.time.delayedCall(900, () => this.beppe.setTexture('beppe_normale'));
    this.parla(caso(FRASI_BEPPE.compra));
    annunciaTrofei(this, r.trofei);
    this.disegna();
    if (T === 'costumi') this.apriFila();
  }

  // --- la fila dei personaggi, per mettere (o togliere) un costume ---
  apriFila() {
    this.fila = 0;
    Audio.sfx('scegli');
    this.disegnaFila();
  }

  chiudiFila() {
    if (this.fila == null) return;
    this.fila = null;
    for (const o of this.oggettiFila ?? []) o.destroy();
    this.oggettiFila = [];
    this.disegna();
  }

  muoviFila(d) {
    const n = CONFIG.personaggiGiocabili.length;
    this.fila = (this.fila + d + n) % n;
    Audio.sfx('muovi');
    this.disegnaFila();
  }

  disegnaFila() {
    for (const o of this.oggettiFila ?? []) o.destroy();
    // (con tanti personaggi la fila si stringe, per restare dentro al riquadro)
    const G = CONFIG.personaggiGiocabili, costume = this.voci[this.sel].id, y = 188, passo = Math.min(25, 322 / Math.max(1, G.length - 1)), x0 = X_LISTA - ((G.length - 1) * passo) / 2;
    const fondo = pannello(this, X_LISTA, y, 352, 40, { alfa: 0.9, raggio: 10, colore: 0x3a2050 });
    this.oggettiFila = [fondo];
    G.forEach((g, i) => {
      const x = x0 + i * passo, su = i === this.fila, indossa = Progressi.costume(g.id) === costume;
      if (su) { const h = this.add.graphics(); h.lineStyle(1.6, 0xffe14a, 1).strokeRoundedRect(x - 12, y - 16, 24, 30, 5); this.oggettiFila.push(h); }
      const r = ritratto(this, x, y - 2, g.id, Math.min(22, passo - 2)).setAlpha(indossa || su ? 1 : 0.75);
      const zona = this.add.rectangle(x, y, passo, 34, 0xffffff, 0.001).setInteractive({ useHandCursor: true })
        .on('pointerdown', (_p, _x, _y, ev) => { ev?.stopPropagation(); this.fila = i; this.indossa(); });
      this.oggettiFila.push(r, zona);
      if (indossa) this.oggettiFila.push(txt(this, x, y + 13, '★', { size: 7, color: '#7dff9a' }));
    });
    const g = G[this.fila], indossa = Progressi.costume(g.id) === costume;
    this.aiuto.setText(perDito(`${g.nome}: INVIO ${indossa ? 'toglie' : 'mette'} il costume   (ESC: chiudi)`, `Tocca un personaggio: ${indossa ? 'toglie' : 'mette'} il costume`));
  }

  indossa() {
    const g = CONFIG.personaggiGiocabili[this.fila], costume = this.voci[this.sel].id;
    const togli = Progressi.costume(g.id) === costume;
    const trofei = Progressi.vesti(g.id, togli ? null : costume);
    vestiPersonaggio(this, g.id);
    Audio.sfx(togli ? 'muovi' : 'ok');
    if (!togli) stelle(this, X_LISTA, 186, 5);
    annunciaTrofei(this, trofei);
    this.disegna();
  }
}
