// I livelli dei giocatori (l'handicap): ognuno sceglie FACILE, NORMALE o DIFFICILE prima della
// sfida. Si arriva qui dalla schermata della modalità; il livello di ogni personaggio si ricorda.
//  - tastiera: SU/GIÙ il giocatore, SINISTRA/DESTRA il livello, INVIO o ESC per tornare
//  - mouse e dito: si tocca il livello per cambiarlo
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { LIVELLI, NOMI_LIVELLI, COLORI_LIVELLI } from '../livelli.js';
import { ritratto } from '../sprites.js';
import { txt, inquadra, raggi, pannello, eTouch, perDito, pulsante } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

export class LivelliScene extends Phaser.Scene {
  constructor() { super('Livelli'); }

  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    raggi(this, 0x3fae74, 0x62cf96);
    const G = Sessione.giocatori, n = G.length;
    this.sel = 0;
    txt(this, 240, 18, 'I LIVELLI', { size: 16, color: '#ffe14a' });
    txt(this, 240, 34, 'Chi è più forte può giocare a DIFFICILE, chi comincia a FACILE', { size: 6.5, color: '#fff3d6' });
    const passo = Math.min(24, 190 / n), y0 = 140 - ((n - 1) * passo) / 2;
    pannello(this, 240, 140, 300, n * passo + 14, { alfa: 0.6, raggio: 10 });
    this.evid = this.add.graphics();
    this.righe = G.map((g, i) => {
      const y = y0 + i * passo;
      ritratto(this, 120, y, g.id, Math.min(20, passo - 3));
      txt(this, 138, y, g.nome, { size: 8, ox: 0, color: g.colore });
      const liv = txt(this, 330, y, '', { size: 8.5 }).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { this.sel = i; this.cambia(1); });
      return { g, y, liv };
    });
    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => { this.sel = (this.sel - 1 + n) % n; Audio.sfx('muovi'); this.disegna(); });
    kb.on('keydown-DOWN', () => { this.sel = (this.sel + 1) % n; Audio.sfx('muovi'); this.disegna(); });
    kb.on('keydown-LEFT', () => this.cambia(-1));
    kb.on('keydown-RIGHT', () => this.cambia(1));
    const fine = () => { Audio.sfx('scegli'); this.scene.start('Modalita'); };
    for (const k of ['ENTER', 'ESC']) kb.on('keydown-' + k, fine);
    if (eTouch()) pulsante(this, 16, 13, 'indietro', fine);
    txt(this, 240, 252, perDito('SU/GIÙ: chi     SINISTRA/DESTRA: livello     INVIO: fatto', 'Tocca un livello per cambiarlo, la freccia per tornare'), { size: 6.5, color: '#fff3d6' });
    pulsantiAngolo(this);
    this.disegna();
  }

  cambia(d) {
    const r = this.righe[this.sel], i = LIVELLI.indexOf(Sessione.livelloDi(r.g.id));
    Sessione.scegliLivello(r.g.id, LIVELLI[(i + d + LIVELLI.length) % LIVELLI.length]);
    Audio.sfx('muovi');
    this.disegna();
  }

  disegna() {
    this.evid.clear();
    this.righe.forEach((r, i) => {
      const l = Sessione.livelloDi(r.g.id);
      r.liv.setText(`<  ${NOMI_LIVELLI[l]}  >`).setColor(COLORI_LIVELLI[l]);
      if (i === this.sel) { this.evid.fillStyle(0xffe14a, 0.2).fillRoundedRect(100, r.y - 9, 280, 18, 8); this.evid.lineStyle(1.2, 0xffe14a, 1).strokeRoundedRect(100, r.y - 9, 280, 18, 8); }
    });
  }
}
