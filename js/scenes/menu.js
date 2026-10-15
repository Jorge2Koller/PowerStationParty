// Boot, menu iniziale, partita singola/allenamento, comandi e pausa.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { Progressi } from '../progressi.js';
import { LIVELLI, NOMI_LIVELLI, COLORI_LIVELLI } from '../livelli.js';
import { Salvataggio } from '../salvataggio.js';
import { novitaDaVedere } from './novita.js';
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
  // l'unica immagine non disegnata col codice: la copertina (sfondo del menu). Se non arriva
  // (senza rete alla prima apertura) il menu si disegna come prima
  preload() { this.load.image('copertina', 'icone/copertina.webp'); }
  create() {
    creaTexture(this);
    // scorciatoia per provare un microgioco al volo: index.html?prova=barba
    // (con &chi=manna lo si prova con quel personaggio, se no con l'ultimo usato)
    const pagina = new URLSearchParams(location.search), prova = pagina.get('prova'), chi = pagina.get('chi');
    if (prova && MICROGIOCHI[prova]) {
      if (chi) Sessione.imposta([chi]);
      Sessione.nuovoAllenamento(prova, 0);
      // &seme=123: la partita col seme scelto (per rigiocarla identica: le prove automatiche)
      const seme = Number(pagina.get('seme'));
      if (seme) Sessione.semi = [seme >>> 0];
      return this.scene.start('mg_' + prova);
    }
    // dopo un aggiornamento, prima del menu: cosa c'è di nuovo (solo se il salvataggio funziona,
    // se no uscirebbe ogni volta)
    this.scene.start(Salvataggio.disponibile && novitaDaVedere() ? 'Novita' : 'Menu');
  }
}

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    inquadra(this);
    Audio.musica('menu');
    this.input.setDefaultCursor('default');
    if (this.textures.exists('copertina')) this.conCopertina();
    else this.senzaCopertina();
    pulsantiAngolo(this);
  }

  // le voci del menu (uguali con e senza copertina)
  voci(x, y, passo, xPinte = 38, yPinte = 16) {
    // le Pinte da spendere al Bancone
    pannello(this, xPinte, yPinte, 60, 18, { alfa: 0.75, raggio: 8 });
    im(this, xPinte - 17, yPinte, 'iconaPinta', 0.55);
    txt(this, xPinte + 7, yPinte, String(Progressi.pinte), { size: 9, color: '#ffe14a' });
    menuLista(this, [
      { label: 'GIOCA', azione: () => this.scene.start('Giocatori') },
      { label: 'BANCONE', azione: () => this.scene.start('Bancone') },
      { label: 'PROFILO', azione: () => this.scene.start('Profilo') },
      { label: 'IMPOSTAZIONI', azione: () => this.scene.start('Impostazioni', { ritorno: 'Menu' }) },
      { label: 'COMANDI', azione: () => this.scene.start('Comandi') },
      { label: 'NOVITÀ', azione: () => this.scene.start('Novita') },
    ], x, y, passo, 9.5, { larghezza: 124 });
  }

  // la copertina intera a sinistra (il titolo è già dentro: nessuna voce sopra le facce), le voci
  // in colonna a destra. Dietro, la copertina stessa in grande e scurita.
  conCopertina() {
    const fondo = this.add.image(240, 135, 'copertina');
    fondo.setScale(Math.max(480 / fondo.width, 270 / fondo.height) * 1.1);
    this.add.rectangle(0, 0, 480, 270, 0x140c20, 0.82).setOrigin(0);
    const W = 330, c = this.add.image(8 + W / 2, 135, 'copertina'), k = W / c.width, H = c.height * k;
    c.setScale(k);
    const cornice = this.add.graphics();
    cornice.fillStyle(0x000000, 0.35).fillRoundedRect(9, 135 - H / 2 + 2, W, H, 8);
    cornice.lineStyle(2, 0xffe14a, 1).strokeRoundedRect(8, 135 - H / 2, W, H, 8);
    c.setDepth(1); cornice.setDepth(0);
    this.tweens.add({ targets: c, scale: k * 1.015, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // la colonna delle voci
    const X = 409;
    pannello(this, X, 128, 128, 152, { alfa: 0.72, raggio: 10 });
    this.voci(X, 72, 22, X, 38);
    txt(this, X, 222, `Da 1 a ${CONFIG.maxGiocatori} giocatori, sullo stesso schermo`, { size: 7, color: '#fff3d6', wrap: 128 });
    txt(this, X, 248, perDito('Frecce + INVIO o il mouse\nM: audio sì/no', 'Tocca per scegliere'), { size: 7, color: '#fff3d6', wrap: 128 });
  }

  senzaCopertina() {
    raggi(this, 0xff9a3c, 0xffb85a);

    // titolo che rimbalza (in alto e un po' più piccolo dei personaggi sotto: le loro teste
    // non devono coprire la prima e l'ultima lettera)
    const titolo = txt(this, 240, 35, CONFIG.titolo, { size: 26, color: '#ffe14a', stroke: '#7a1f2a', thick: 8, wrap: 460 });
    titolo.setTint(0xffffff, 0xffffff, 0xffc04a, 0xffc04a).setScale(0);
    this.tweens.add({ targets: titolo, scale: 1, duration: 600, ease: 'Bounce.out' });
    this.tweens.add({ targets: titolo, angle: { from: -2, to: 2 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, 240, 71, CONFIG.sottotitolo, { size: 10 });

    // ai lati, animati, i primi due dell'ultima partita (da soli: lui e un altro giocabile)
    const primo = Sessione.giocatori[0], altro = Sessione.giocatori[1] ?? CONFIG.personaggiGiocabili.find((p) => p.id !== primo.id);
    [primo, altro].forEach((g, i) => {
      const x = i ? 404 : 76;
      ombra(this, x, 241, 70);
      const s = im(this, x, 241, g.id + '_normale').setOrigin(0.5, 1).setScale(3.6 * SP);
      molleggia(this, s, 340 + i * 70);
      txt(this, x, 255, g.nome.toUpperCase(), { size: g.nome.length > 10 ? 8 : 10, color: g.colore });
      this.time.addEvent({ delay: 2200 + i * 900, loop: true, callback: () => {
        s.setTexture(g.id + '_felice');
        stelle(this, x, 124, 5);
        this.time.delayedCall(700, () => s.setTexture(g.id + '_normale'));
      } });
    });

    // GIOCA porta a: quanti siete, i personaggi, la modalità (ogni schermata ricorda l'ultima
    // scelta: per rigiocare uguale basta premere INVIO fino in fondo)
    pannello(this, 240, 145, 178, 122, { alfa: 0.55, bordo: null, raggio: 10 });
    this.voci(240, 100, 18);
    txt(this, 240, 204, `Da 1 a ${CONFIG.maxGiocatori} giocatori, sullo stesso schermo`, { size: 7.5, color: '#fff3d6' });
    txt(this, 240, 224, perDito('Frecce + INVIO, oppure il mouse\nM: audio sì/no', 'Tocca per scegliere'), { size: 7, color: '#fff3d6' });
  }
}

// Un solo microgioco, scelto dalla lista: da soli è l'allenamento, in più giocatori una
// partita singola (un turno a testa, poi la classifica)
export class AllenamentoScene extends Phaser.Scene {
  constructor() { super('Allenamento'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    raggi(this, 0x4a9fe8, 0x7cc0f8);
    const G = Sessione.giocatori, n = G.length;
    const indietro = () => this.scene.start('Modalita');
    txt(this, 240, 26, n === 1 ? 'ALLENAMENTO' : 'PARTITA SINGOLA', { size: 18, color: '#ffe14a' });
    pannello(this, 240, 56, 240, 18, { alfa: 0.6, bordo: null, raggio: 9 });
    txt(this, 240, 56, n === 1 ? `${G[0].nome}, scegli il microgioco` : `In ${n}: scegliete il microgioco`, { size: 9 });
    // ai lati chi gioca (i primi due)
    G.slice(0, 2).forEach((g, i) => {
      const x = i ? 420 : 60;
      ombra(this, x, 240, 60);
      molleggia(this, im(this, x, 240, g.id + '_normale').setOrigin(0.5, 1).setScale(3 * SP), 360 + i * 60);
    });

    const voci = Object.keys(MICROGIOCHI).map((id) => ({
      label: CONFIG.microgiochi[id].titolo,
      azione: () => {
        if (n === 1) Sessione.nuovoAllenamento(id, 0); else Sessione.nuovaSfida([id]);
        this.scene.start('Intro');
      },
    }));
    voci.push({ label: 'Indietro', azione: indietro });
    // da soli: il livello si cambia qui (L, o toccando la scritta)
    if (n === 1) {
      const id = G[0].id, t = txt(this, 240, 258, '', { size: 7.5 }).setInteractive({ useHandCursor: true });
      const scrivi = () => { const l = Sessione.livelloDi(id); t.setText(perDito(`LIVELLO: ${NOMI_LIVELLI[l]}   (L per cambiare)`, `LIVELLO: ${NOMI_LIVELLI[l]}   (tocca per cambiare)`)).setColor(COLORI_LIVELLI[l]); };
      const cambia = () => { const i = LIVELLI.indexOf(Sessione.livelloDi(id)); Sessione.scegliLivello(id, LIVELLI[(i + 1) % LIVELLI.length]); Audio.sfx('muovi'); scrivi(); };
      t.on('pointerdown', cambia);
      this.input.keyboard.on('keydown-L', cambia);
      scrivi();
    }
    // tanti microgiochi: due colonne (su e giù scorrono la prima colonna e poi la seconda), Indietro sotto
    const nv = voci.length - 1, righe = Math.ceil(nv / 2), passo = Math.min(20, 100 / righe), y0 = 152 - (righe * passo) / 2;
    pannello(this, 240, 154, 290, righe * passo + passo + 14, { alfa: 0.55, bordo: null, raggio: 10 });
    menuLista(this, voci, 240, y0, passo, 7.5, {
      larghezza: 140,
      pos: (i) => (i === nv ? [240, y0 + righe * passo + 6] : [i < righe ? 168 : 312, y0 + (i % righe) * passo]),
    });
    this.input.keyboard.on('keydown-ESC', indietro);
    if (eTouch()) pulsante(this, 16, 13, 'indietro', indietro);
    pulsantiAngolo(this);
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
    txt(this, 240, 244, perDito('Si gioca a turni: lo stesso microgioco, uno dopo l\'altro.   ESC: pausa   M: audio',
      'Si gioca a turni: lo stesso microgioco, uno dopo l\'altro. Pausa: due tocchi in alto a destra'), { size: 7, color: '#fff3d6' });
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
    inquadra(this, { dissolvenza: false });
    this.input.setDefaultCursor('default');
    this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0.8).setOrigin(0);
    const t = txt(this, 240, 80, 'PAUSA', { size: 32, color: '#ffe14a' });
    this.tweens.add({ targets: t, scale: 1.1, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const riprendi = () => {
      if (['mg_barba', 'mg_mani', 'mg_bota'].includes(dati.chiave)) this.input.setDefaultCursor('none'); // usano un cursore disegnato
      this.scene.resume(dati.chiave);
      this.scene.stop();
    };
    menuLista(this, [
      { label: 'RIPRENDI', azione: riprendi },
      { label: 'IMPOSTAZIONI', azione: () => this.scene.start('Impostazioni', { ritorno: 'Pausa', chiave: dati.chiave }) },
      { label: 'TORNA AL MENU', azione: () => { this.scene.stop(dati.chiave); this.scene.start('Menu'); } },
    ], 240, 132, 22, 10);
    this.input.keyboard.on('keydown-ESC', riprendi);
    pulsantiAngolo(this);
  }
}
