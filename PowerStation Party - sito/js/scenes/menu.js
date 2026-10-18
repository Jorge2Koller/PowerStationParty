// Boot, menu iniziale, partita singola/allenamento, comandi e pausa.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { Progressi } from '../progressi.js';
import { LIVELLI, NOMI_LIVELLI, COLORI_LIVELLI } from '../livelli.js';
import { MEDAGLIE } from '../punteggi.js';
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

// Un solo microgioco, scelto nella "sala dei microgiochi" (come nei party game): una griglia di
// riquadri con la foto di ogni microgioco; quello scelto ha la cornice gialla, il nome in un'etichetta
// e, sopra, l'anteprima in grande (tre foto che si alternano) con titolo, comando, obiettivo, record e
// medaglia. Da soli è l'allenamento, in più giocatori una partita singola. Mouse: passandoci sopra si
// vede l'anteprima, col clic si gioca; dito: un tocco sceglie, un altro (o GIOCA!) gioca; tastiera:
// frecce, INVIO, R = a caso, L = livello (da soli). Le foto sono in icone/anteprime/ (le fa
// strumenti/anteprime.py): se mancano, il riquadro ha il colore del microgioco e il titolo.
const GRIGLIA = { col: 7, w: 60, h: 34, gx: 5.5, gy: 5, y0: 146 };
const ANTEPRIMA = { x: 92, y: 75, w: 156, h: 88 };
let ultimoScelto = 0;   // (si riparte dall'ultimo microgioco scelto)

export class AllenamentoScene extends Phaser.Scene {
  constructor() { super('Allenamento'); }

  preload() {
    this.load.on('loaderror', () => {});   // (una foto che manca non ferma niente: c'è il riquadro colorato)
    for (const id of Object.keys(MICROGIOCHI)) if (!this.textures.exists('ant_' + id)) this.load.image('ant_' + id, `icone/anteprime/${id}.webp`);
  }

  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    raggi(this, 0x4a9fe8, 0x7cc0f8);
    const G = Sessione.giocatori, n = G.length, ids = Object.keys(MICROGIOCHI);
    this.ids = ids;
    const indietro = () => this.scene.start('Modalita');
    // le foto grandi (e i riquadri) si buttano uscendo: si ricaricano la volta dopo (sono in cache)
    this.events.once('shutdown', () => { for (const k of this.textures.getTextureKeys()) if (k.startsWith('ant')) this.textures.remove(k); });

    // in alto: A CASO, il titolo, il livello (da soli) o quanti siete
    pannello(this, 240, 14, 468, 22, { alfa: 0.7, raggio: 9 });
    txt(this, 240, 14, n === 1 ? 'ALLENAMENTO' : 'PARTITA SINGOLA', { size: 12, color: '#ffe14a' });
    // (sul telefono a sinistra c'è la freccia per tornare indietro e a destra audio e schermo intero)
    const tocco = eTouch(), aCaso = this.pillola(tocco ? 78 : 48, 14, 70, perDito('A CASO (R)', 'A CASO'), () => this.aCaso());
    if (n === 1) {
      const id = G[0].id;
      const t = this.pillola(tocco ? 362 : 410, 14, tocco ? 96 : 120, '', () => cambia());
      const scrivi = () => { const l = Sessione.livelloDi(id); t.testo.setText(perDito(`${NOMI_LIVELLI[l]} (L)`, NOMI_LIVELLI[l])).setColor(COLORI_LIVELLI[l]); };
      const cambia = () => { const i = LIVELLI.indexOf(Sessione.livelloDi(id)); Sessione.scegliLivello(id, LIVELLI[(i + 1) % LIVELLI.length]); Audio.sfx('muovi'); scrivi(); };
      this.input.keyboard.on('keydown-L', cambia);
      scrivi();
    } else txt(this, tocco ? 362 : 410, 14, `${n} GIOCATORI`, { size: 8, color: '#fff3d6' });
    this.aCasoBtn = aCaso;

    // l'anteprima grande e, accanto, le informazioni
    const A = ANTEPRIMA;
    pannello(this, 240, A.y, 468, A.h + 10, { alfa: 0.75, raggio: 10 });
    this.cornice = this.add.graphics().setDepth(3);
    this.cornice.lineStyle(2.5, 0xffe14a, 1).strokeRoundedRect(A.x - A.w / 2 - 1, A.y - A.h / 2 - 1, A.w + 2, A.h + 2, 4);
    this.foto = [0, 1].map(() => this.add.image(A.x, A.y, '__DEFAULT').setDepth(2).setVisible(false));
    // (senza foto: il colore del microgioco col titolo)
    this.fondoFoto = this.add.rectangle(A.x, A.y, A.w, A.h, 0x1f1430).setDepth(1);
    this.titoloFoto = txt(this, A.x, A.y, '', { size: 10, wrap: A.w - 16, depth: 1.5 });
    const X0 = A.x + A.w / 2 + 10;
    this.titolo = txt(this, X0, 29, '', { size: 11, color: '#ffe14a', ox: 0, oy: 0, wrap: 440 - X0, align: 'left' });
    this.verbo = txt(this, X0, 0, '', { size: 8, ox: 0, oy: 0, align: 'left' });
    this.obiettivo = txt(this, X0, 0, '', { size: 7, ox: 0, oy: 0, color: '#7dff9a', wrap: 466 - X0, align: 'left' });
    this.dati = txt(this, X0, 0, '', { size: 6.5, ox: 0, oy: 0, color: '#fff3d6', wrap: 392 - X0, align: 'left', spacing: -1 });
    this.medagliaInfo = im(this, 0, 0, 'medaglia_vuota', 0.42).setVisible(false);
    this.gioca = this.pillola(432, 110, 64, 'GIOCA!', () => this.gioca1(this.sel), true);

    // la griglia dei riquadri
    const R = GRIGLIA, larghezza = R.col * R.w + (R.col - 1) * R.gx, x0 = (480 - larghezza) / 2 + R.w / 2;
    this.riquadri = ids.map((id, i) => {
      const m = CONFIG.microgiochi[id], x = x0 + (i % R.col) * (R.w + R.gx), y = R.y0 + Math.floor(i / R.col) * (R.h + R.gy);
      const c = this.add.container(x, y).setDepth(5);
      const ombraR = this.add.rectangle(1.5, 2, R.w, R.h, 0x000000, 0.35);
      const fondo = this.add.rectangle(0, 0, R.w, R.h, m.colore);
      c.add([ombraR, fondo]);
      if (this.textures.exists('ant_' + id)) c.add(this.add.image(0, 0, 'ant_' + id).setDisplaySize(R.w, R.h));
      else c.add(txt(this, 0, 0, m.titolo, { size: 6.5, wrap: R.w - 4 }));
      const bordo = this.add.graphics();
      c.add(bordo);
      // la medaglia migliore (di chi gioca da solo, o di chiunque) e "NUOVO!" per quelli mai giocati qui
      const med = Progressi.medagliaMigliore(id, n === 1 ? G[0].id : null);
      if (med) c.add(im(this, -R.w / 2 + 5, -R.h / 2 + 6, 'medaglia_' + MEDAGLIE[med - 1], 0.3));
      if (!Salvataggio.dati.visti[id]) {
        // l'angolino rosso con la stellina: mai giocato su questo telefono o computer
        const g = this.add.graphics(), sx = R.w / 2 - 5, sy = -R.h / 2 + 4.5;
        g.fillStyle(0xe5383b, 1).fillTriangle(R.w / 2 - 15, -R.h / 2, R.w / 2, -R.h / 2, R.w / 2, -R.h / 2 + 15);
        g.fillStyle(0xffffff, 1).fillPoints(Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 1.3 : 3; return { x: sx + Math.cos(a) * r, y: sy + Math.sin(a) * r }; }), true);
        c.add(g);
      }
      const z = this.add.zone(0, 0, R.w + R.gx, R.h + R.gy).setInteractive({ useHandCursor: true });
      z.on('pointerover', (p) => { if (!p.wasTouch) this.scegli(i); });
      z.on('pointerdown', (p) => {
        Audio.sblocca();
        // col mouse il riquadro è già scelto (ci sei passato sopra): si gioca; col dito il primo tocco sceglie
        if (this.sel === i && (!p.wasTouch || this.toccato === i)) this.gioca1(i);
        else { this.scegli(i); this.toccato = i; }
      });
      c.add(z);
      return { c, bordo, x, y };
    });
    // l'etichetta col nome, sotto (o sopra, per l'ultima fila) il riquadro scelto
    this.etichetta = this.add.container(0, 0).setDepth(30);
    this.etichettaFondo = this.add.graphics();
    this.etichettaTesto = txt(this, 0, 0, '', { size: 7, color: '#1f1430', thick: 0 });
    this.etichetta.add([this.etichettaFondo, this.etichettaTesto]);

    // tastiera
    const kb = this.input.keyboard, muovi = (dx, dy) => {
      const i = this.sel, r = Math.floor(i / R.col), cc = i % R.col, righe = Math.ceil(ids.length / R.col);
      let k = dy ? ((r + dy + righe) % righe) * R.col + cc : r * R.col + ((cc + dx + R.col) % R.col);
      if (k >= ids.length) k = dy ? cc : ids.length - 1;
      this.scegli(k);
    };
    kb.on('keydown-LEFT', () => muovi(-1, 0)); kb.on('keydown-RIGHT', () => muovi(1, 0));
    kb.on('keydown-UP', () => muovi(0, -1)); kb.on('keydown-DOWN', () => muovi(0, 1));
    const ok = (e) => { if (!e.repeat) this.gioca1(this.sel); };
    kb.on('keydown-ENTER', ok); kb.on('keydown-SPACE', ok);
    kb.on('keydown-R', () => this.aCaso());
    kb.on('keydown-ESC', indietro);
    if (eTouch()) pulsante(this, 16, 13, 'indietro', indietro);
    else txt(this, 240, 263, 'Frecce: scegli   INVIO o clic: gioca   R: a caso   ESC: indietro', { size: 6.5, color: '#fff3d6' });
    pulsantiAngolo(this);

    // l'anteprima: le foto che si alternano, con un leggero avvicinamento
    this.time.addEvent({ delay: 1700, loop: true, callback: () => this.prossimaFoto() });
    this.sel = -1;
    this.scegli(Math.min(ultimoScelto, ids.length - 1), true);
  }

  // un pulsante a pillola (testo, azione); evidente = giallo
  pillola(x, y, w, testo, fn, evidente = false) {
    const c = this.add.container(x, y).setDepth(20), g = this.add.graphics();
    g.fillStyle(0x000000, 0.3).fillRoundedRect(-w / 2 + 1, -7, w, 15, 7.5);
    g.fillStyle(evidente ? 0xffe14a : 0x1f1430, 1).fillRoundedRect(-w / 2, -8, w, 15, 7.5);
    g.lineStyle(1.3, evidente ? 0xffffff : 0xffe14a, 1).strokeRoundedRect(-w / 2, -8, w, 15, 7.5);
    const t = txt(this, 0, -0.5, testo, { size: 7.5, color: evidente ? '#1f1430' : '#ffe14a', thick: evidente ? 0 : 3 });
    const z = this.add.zone(0, 0, w + 6, 20).setInteractive({ useHandCursor: true }).on('pointerdown', () => { Audio.sblocca(); Audio.sfx('scegli'); fn(); });
    c.add([g, t, z]);
    c.testo = t;
    return c;
  }

  scegli(i, subito = false) {
    if (i === this.sel || this.parte) return;
    this.sel = i;
    ultimoScelto = i;
    this.toccato = null;
    if (!subito) Audio.sfx('muovi');
    const R = GRIGLIA, id = this.ids[i], m = CONFIG.microgiochi[id];
    this.riquadri.forEach((q, k) => {
      const su = k === i;
      q.bordo.clear();
      q.bordo.lineStyle(su ? 3 : 1, su ? 0xffe14a : 0x1f1430, 1).strokeRect(-R.w / 2, -R.h / 2, R.w, R.h);
      q.c.setDepth(su ? 10 : 5);
      this.tweens.killTweensOf(q.c);
      this.tweens.add({ targets: q.c, scale: su ? 1.14 : 1, duration: 120, ease: 'Quad.out' });
    });
    // l'etichetta col nome
    const q = this.riquadri[i], sotto = Math.floor(i / R.col) < Math.ceil(this.ids.length / R.col) - 1;
    this.etichettaTesto.setText(m.titolo);
    const w = this.etichettaTesto.width + 12, ey = q.y + (sotto ? R.h / 2 + 9 : -R.h / 2 - 9);
    this.etichettaFondo.clear().fillStyle(0x000000, 0.3).fillRoundedRect(-w / 2 + 1, -6, w, 13, 6.5).fillStyle(0xffffff, 1).fillRoundedRect(-w / 2, -7, w, 13, 6.5);
    this.etichetta.setPosition(Phaser.Math.Clamp(q.x, w / 2 + 4, 476 - w / 2), ey);
    // le informazioni
    const G = Sessione.giocatori, rec = Salvataggio.dati.record[id], med = Progressi.medagliaMigliore(id, G.length === 1 ? G[0].id : null);
    this.titolo.setText(m.titolo);
    this.fondoFoto.setFillStyle(m.colore);
    this.titoloFoto.setText(m.titolo);
    this.verbo.setY(this.titolo.y + this.titolo.height - 3).setText(m.verbo ?? '');
    this.obiettivo.setY(this.verbo.y + this.verbo.height - 3).setText(m.obiettivo);
    this.dati.setY(this.obiettivo.y + this.obiettivo.height - 2).setText(`Durata: ${m.durata} s   ` + (rec ? `Record: ${rec.punteggio} (${rec.nome})` : 'Record: ancora nessuno') + (Salvataggio.dati.visti[id] ? '' : '\nMai giocato qui: prima c\'è la PROVA'));
    this.medagliaInfo.setVisible(!!med).setPosition(458, 40);
    if (med) this.medagliaInfo.setTexture('medaglia_' + MEDAGLIE[med - 1]);
    // l'anteprima: subito il riquadro ingrandito, poi le tre foto (si caricano adesso, se non ci sono)
    this.nFoto = 0;
    this.mostraFoto(this.textures.exists(`antG_${id}_1`) ? `antG_${id}_1` : this.textures.exists('ant_' + id) ? 'ant_' + id : null);
    if (!this.textures.exists(`antG_${id}_1`)) {
      for (let k = 1; k <= 3; k++) this.load.image(`antG_${id}_${k}`, `icone/anteprime/${id}-${k}.webp`);
      this.load.once('complete', () => { if (this.ids[this.sel] === id && this.textures.exists(`antG_${id}_1`)) this.mostraFoto(`antG_${id}_1`); });
      this.load.start();
    }
  }

  // una foto nell'anteprima, in dissolvenza sopra quella di prima, con un leggero avvicinamento
  mostraFoto(key) {
    const A = ANTEPRIMA, [vecchia, nuova] = this.foto[0].visible && this.foto[0].alpha > 0.5 ? this.foto : [this.foto[1], this.foto[0]];
    if (!key) { this.foto.forEach((f) => f.setVisible(false)); this.titoloFoto.setVisible(true); return; }
    this.titoloFoto.setVisible(false);
    nuova.setTexture(key).setVisible(true).setAlpha(0).setDepth(2.1);
    vecchia.setDepth(2);
    const k = Math.max(A.w / nuova.width, A.h / nuova.height);
    nuova.setScale(k).setCrop();
    this.tweens.killTweensOf(this.foto);
    this.tweens.add({ targets: nuova, alpha: 1, duration: 320 });
    this.tweens.add({ targets: nuova, scale: k * 1.06, duration: 2000, ease: 'Sine.inOut' });
    this.tweens.add({ targets: vecchia, alpha: 0, duration: 320 });
  }

  prossimaFoto() {
    const id = this.ids[this.sel];
    if (!this.textures.exists(`antG_${id}_1`)) return;
    this.nFoto = (this.nFoto + 1) % 3;
    const key = `antG_${id}_${this.nFoto + 1}`;
    if (this.textures.exists(key)) this.mostraFoto(key);
  }

  // A CASO: il cursore salta da un riquadro all'altro, sempre più piano, e dove si ferma si gioca
  aCaso() {
    if (this.parte) return;
    const salti = 12 + Math.floor(Math.random() * this.ids.length);
    let k = 0, i = this.sel;
    const passo = () => {
      i = (i + 1 + Math.floor(Math.random() * (this.ids.length - 1))) % this.ids.length;
      this.scegli(i);
      if (++k < salti) this.time.delayedCall(50 + k * k * 1.6, passo);
      else this.time.delayedCall(600, () => this.gioca1(i));
    };
    passo();
  }

  gioca1(i) {
    if (this.parte || i < 0) return;
    this.parte = true;
    Audio.sfx('scegli');
    const id = this.ids[i], n = Sessione.giocatori.length;
    const q = this.riquadri[i];
    this.tweens.add({ targets: q.c, scale: 1.3, duration: 160, yoyo: true });
    this.time.delayedCall(260, () => {
      if (n === 1) Sessione.nuovoAllenamento(id, 0); else Sessione.nuovaSfida([id]);
      this.scene.start('Intro');
    });
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
    Audio.pausaMusica();   // in pausa la musica si ferma (e al rientro riparte da lì)
    const t = txt(this, 240, 80, 'PAUSA', { size: 32, color: '#ffe14a' });
    this.tweens.add({ targets: t, scale: 1.1, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const riprendi = () => {
      if (['mg_barba', 'mg_mani', 'mg_bota'].includes(dati.chiave)) this.input.setDefaultCursor('none'); // usano un cursore disegnato
      Audio.riprendiMusica();
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
