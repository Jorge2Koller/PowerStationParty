// Boot, menu iniziale, partita singola/allenamento, comandi e pausa.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { creaTexture, SP } from '../sprites.js';
import { MICROGIOCHI } from '../microgames/index.js';
import { txt, im, inquadra, raggi, pannello, ombra, menuLista, molleggia, stelle, eTouch, perDito, pulsante, schermoIntero, schermoInteroPossibile } from '../fx.js';

// sul telefono, in alto a destra: audio sì/no e (dove si può) schermo intero
export function pulsantiAngolo(scene) {
  if (!eTouch()) return;
  pulsante(scene, 464, 13, 'audio', () => Audio.silenzia());
  if (schermoInteroPossibile(scene)) pulsante(scene, 441, 13, 'schermo', () => schermoIntero(scene), { suRilascio: true });
}

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    creaTexture(this);
    // scorciatoia per provare un microgioco al volo: index.html?prova=barba
    const prova = new URLSearchParams(location.search).get('prova');
    if (prova && MICROGIOCHI[prova]) { Sessione.nuovoAllenamento(prova, 0); return this.scene.start('mg_' + prova); }
    this.scene.start('Menu');
  }
}

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    inquadra(this);
    Audio.musica('menu');
    this.input.setDefaultCursor('default');
    raggi(this, 0xff9a3c, 0xffb85a);

    // titolo che rimbalza
    const titolo = txt(this, 240, 44, CONFIG.titolo, { size: 28, color: '#ffe14a', stroke: '#7a1f2a', thick: 8, wrap: 460 });
    titolo.setTint(0xffffff, 0xffffff, 0xffc04a, 0xffc04a).setScale(0);
    this.tweens.add({ targets: titolo, scale: 1, duration: 600, ease: 'Bounce.out' });
    this.tweens.add({ targets: titolo, angle: { from: -2, to: 2 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, 240, 80, CONFIG.sottotitolo, { size: 10 });

    // Riccardo e Giorgio animati
    CONFIG.giocatori.forEach((g, i) => {
      const x = i ? 404 : 76;
      ombra(this, x, 238, 76);
      const s = im(this, x, 238, g.id + '_normale').setOrigin(0.5, 1).setScale(4 * SP);
      molleggia(this, s, 340 + i * 70);
      txt(this, x, 253, g.nome.toUpperCase(), { size: 10, color: g.colore });
      this.time.addEvent({ delay: 2200 + i * 900, loop: true, callback: () => {
        s.setTexture(g.id + '_felice');
        stelle(this, x, 110, 5);
        this.time.delayedCall(700, () => s.setTexture(g.id + '_normale'));
      } });
    });

    pannello(this, 240, 152, 150, 92, { alfa: 0.55, bordo: null, raggio: 10 });
    menuLista(this, [
      { label: 'GIOCA', azione: () => { Sessione.nuovaSfida(); this.scene.start('Intro'); } },
      { label: 'PARTITA SINGOLA', azione: () => this.scene.start('Allenamento') },
      { label: 'COMANDI', azione: () => this.scene.start('Comandi') },
    ], 240, 128, 24, 10);
    txt(this, 240, 218, perDito('Frecce + INVIO, oppure il mouse\nM: audio sì/no', 'Tocca per scegliere'), { size: 7, color: '#fff3d6' });
    pulsantiAngolo(this);
  }
}

// Un solo microgioco: sfida a due (a turno) oppure allenamento da soli
export class AllenamentoScene extends Phaser.Scene {
  constructor() { super('Allenamento'); }
  create() {
    inquadra(this);
    raggi(this, 0x4a9fe8, 0x7cc0f8);
    txt(this, 240, 26, 'PARTITA SINGOLA', { size: 18, color: '#ffe14a' });
    const G = CONFIG.giocatori;
    const modi = [
      { label: `${G[0].nome.toUpperCase()}  VS  ${G[1].nome.toUpperCase()}`, chi: null },
      { label: `Allenamento: solo ${G[0].nome}`, chi: 0 },
      { label: `Allenamento: solo ${G[1].nome}`, chi: 1 },
    ];
    let m = 0;
    pannello(this, 240, 56, 240, 18, { alfa: 0.6, bordo: null, raggio: 9 });
    const testoChi = txt(this, 240, 56, '', { size: 9 });
    txt(this, 240, 71, perDito('SINISTRA / DESTRA per cambiare', 'Tocca < o > per cambiare'), { size: 6, color: '#fff3d6' });
    const sprite = [0, 1].map((i) => {
      const x = i ? 420 : 60;
      ombra(this, x, 240, 60);
      const s = im(this, x, 240, G[i].id + '_normale').setOrigin(0.5, 1).setScale(3 * SP).setFlipX(false);
      molleggia(this, s, 360 + i * 60);
      return s;
    });
    const agg = () => {
      testoChi.setText(modi[m].label);
      sprite.forEach((s, i) => s.setAlpha(modi[m].chi === null || modi[m].chi === i ? 1 : 0.3));
    };
    const cambia = (d) => { m = (m + d + modi.length) % modi.length; Audio.sfx('muovi'); agg(); };
    this.input.keyboard.on('keydown-LEFT', () => cambia(-1));
    this.input.keyboard.on('keydown-RIGHT', () => cambia(1));
    // frecce < e > toccabili, con una zona di tocco grande ciascuna; la scritta in mezzo va avanti
    [-1, 1].forEach((d) => {
      txt(this, 240 + d * 108, 56, d < 0 ? '<' : '>', { size: 12, color: '#ffe14a' });
      this.add.rectangle(240 + d * 104, 56, 44, 26, 0x000000, 0.001).setInteractive({ useHandCursor: true }).on('pointerdown', () => cambia(d));
    });
    testoChi.setInteractive({ useHandCursor: true }).on('pointerdown', () => cambia(1));
    agg();

    const voci = Object.keys(MICROGIOCHI).map((id) => ({
      label: CONFIG.microgiochi[id].titolo,
      azione: () => {
        if (modi[m].chi === null) Sessione.nuovaSfida([id]); else Sessione.nuovoAllenamento(id, modi[m].chi);
        this.scene.start('Intro');
      },
    }));
    voci.push({ label: 'Indietro', azione: () => this.scene.start('Menu') });
    // la lista si stringe quando i microgiochi sono tanti
    const passo = Math.min(22, 112 / (voci.length - 1)), cy = 156;
    pannello(this, 240, cy, 230, 18 + voci.length * passo, { alfa: 0.55, bordo: null, raggio: 10 });
    menuLista(this, voci, 240, cy - ((voci.length - 1) * passo) / 2, passo, passo < 20 ? 8.5 : 9);
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
  }
}

export class ComandiScene extends Phaser.Scene {
  constructor() { super('Comandi'); }
  create() {
    inquadra(this);
    raggi(this, 0x5cbf6a, 0x86d990);
    txt(this, 240, 20, 'COMANDI', { size: 18, color: '#ffe14a' });
    pannello(this, 240, 136, 440, 198, { alfa: 0.7 });
    // i microgiochi si dividono in pagine: ognuna si riempie finché c'è spazio
    const CIMA = 41, FONDO = 220, pagine = [[]];
    let y = CIMA;
    for (const id of Object.keys(MICROGIOCHI)) {
      const m = CONFIG.microgiochi[id];
      const tt = txt(this, 240, 0, m.titolo.toUpperCase(), { size: 8, oy: 0, color: '#ffe14a' });
      const tc = txt(this, 240, 0, (eTouch() && m.comandiTouch ? m.comandiTouch : m.comandi).join('\n'), { size: 6.5, oy: 0, spacing: -1, wrap: 420 });
      const alt = tt.height - 5 + tc.height + 1;
      if (y + alt > FONDO && pagine[pagine.length - 1].length) { pagine.push([]); y = CIMA; }
      tt.y = y;
      tc.y = y + tt.height - 5;
      pagine[pagine.length - 1].push(tt, tc);
      y += alt;
    }
    let pag = 0;
    const indice = txt(this, 240, 226, '', { size: 7, color: '#fff3d6' });
    const cambia = (d) => {
      const n = Phaser.Math.Clamp(pag + d, 0, pagine.length - 1);
      if (n === pag) return;
      pag = n;
      Audio.sfx('muovi');
      mostra();
    };
    const frecce = [-1, 1].map((d) => txt(this, 240 + d * 52, 226, d < 0 ? '<' : '>', { size: 12, color: '#ffe14a' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (_p, _x, _y, ev) => { ev.stopPropagation(); cambia(d); }));
    const mostra = () => {
      pagine.forEach((p, i) => p.forEach((t) => t.setVisible(i === pag)));
      indice.setText(`Pagina ${pag + 1} di ${pagine.length}`).setVisible(pagine.length > 1);
      frecce.forEach((f, i) => f.setVisible(pagine.length > 1).setAlpha((i ? pag < pagine.length - 1 : pag > 0) ? 1 : 0.3));
    };
    mostra();
    txt(this, 240, 244, perDito('La sfida è a turni: lo stesso microgioco, prima uno poi l\'altro.   ESC: pausa   M: audio',
      'La sfida è a turni: lo stesso microgioco, prima uno poi l\'altro. Pausa e audio: in alto a destra'), { size: 6, color: '#fff3d6' });
    txt(this, 240, 259, perDito(pagine.length > 1 ? 'SINISTRA/DESTRA: pagina     INVIO: torna al menu' : 'INVIO: torna al menu',
      pagine.length > 1 ? 'Tocca: pagina dopo   (dall\'ultima si torna al menu)' : 'Tocca: torna al menu'), { color: '#ffe14a' });
    const via = (e) => { if (!e?.repeat) { Audio.sfx('scegli'); this.scene.start('Menu'); } };
    for (const k of ['ENTER', 'ESC', 'SPACE']) this.input.keyboard.on('keydown-' + k, via);
    this.input.keyboard.on('keydown-LEFT', () => cambia(-1));
    this.input.keyboard.on('keydown-RIGHT', () => cambia(1));
    // clic o tocco: pagina dopo; dall'ultima si torna al menu
    this.input.on('pointerdown', () => (pag < pagine.length - 1 ? cambia(1) : via()));
  }
}

export class PausaScene extends Phaser.Scene {
  constructor() { super('Pausa'); }
  create(dati) {
    inquadra(this);
    this.input.setDefaultCursor('default');
    this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0.8).setOrigin(0);
    const t = txt(this, 240, 80, 'PAUSA', { size: 32, color: '#ffe14a' });
    this.tweens.add({ targets: t, scale: 1.1, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const riprendi = () => {
      if (['mg_barba', 'mg_mani'].includes(dati.chiave)) this.input.setDefaultCursor('none'); // usano un cursore disegnato
      this.scene.resume(dati.chiave);
      this.scene.stop();
    };
    menuLista(this, [
      { label: 'RIPRENDI', azione: riprendi },
      { label: 'TORNA AL MENU', azione: () => { this.scene.stop(dati.chiave); this.scene.start('Menu'); } },
    ], 240, 140, 24, 10);
    this.input.keyboard.on('keydown-ESC', riprendi);
    pulsantiAngolo(this);
  }
}
