// La schermata "Novità" (testi in js/config/novita.js). Si apre da sola dopo un aggiornamento
// (Salvataggio.dati.novita diverso dalla versione) e dal menu; si chiude con INVIO, ESC o un tocco.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Salvataggio } from '../salvataggio.js';
import { txt, inquadra, raggi, pannello, stelle, perDito } from '../fx.js';

// c'è qualcosa di nuovo da far vedere?
export const novitaDaVedere = () => Salvataggio.dati.novita !== CONFIG.novita.versione;

export class NovitaScene extends Phaser.Scene {
  constructor() { super('Novita'); }
  create() {
    const N = CONFIG.novita;
    inquadra(this);
    this.input.setDefaultCursor('default');
    raggi(this, 0xb06aff, 0xc890ff);
    // da ora la versione è "vista"
    Salvataggio.dati.novita = N.versione;
    Salvataggio.segna();

    const t = txt(this, 240, 26, N.titolo, { size: 22, color: '#ffe14a' }).setScale(0);
    this.tweens.add({ targets: t, scale: 1, duration: 450, ease: 'Back.out' });
    this.time.addEvent({ delay: 700, loop: true, callback: () => stelle(this, 240 + (Math.random() - 0.5) * 160, 26, 3) });
    const alt = N.voci.length * 20 + 14;
    pannello(this, 240, 52 + alt / 2, 440, alt, { alfa: 0.7 });
    N.voci.forEach((v, i) => {
      const r = txt(this, 34, 66 + i * 20, '★  ' + v, { size: 7.5, ox: 0, wrap: 410 }).setAlpha(0);
      this.tweens.add({ targets: r, alpha: 1, x: 30, delay: 200 + i * 90, duration: 250 });
    });
    const via = (e) => { if (e?.repeat) return; Audio.sfx('scegli'); this.scene.start('Menu'); };
    txt(this, 240, 256, perDito('INVIO: avanti', 'Tocca: avanti'), { size: 9, color: '#ffe14a' });
    this.time.delayedCall(400, () => {
      for (const k of ['ENTER', 'ESC', 'SPACE']) this.input.keyboard.on('keydown-' + k, via);
      this.input.on('pointerdown', () => via());
    });
  }
}
