// Microgioco 4: "Il Panino di Marsupino" - prendi al volo quello che lancia Marsupino.
//
//  Il pane scorre a destra e sinistra sul bancone. Quello che prendi si impila
//  davvero: si prende in cima alla pila, e più la pila è alta più ondeggia.
//  Ricetta: prosciutto, würstel, sottiletta, ketchup e maionese (gli ultimi due
//  arrivano come schizzi dai tubetti in alto). Calzini, lische, ghiaccio e
//  ciabatte rovinano il panino.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { txt, im, scalaDi, scritta, stelle, fumo, pannello, scuoti, lerp, caso, quanti, colpetto, fumetto, vibra } from '../fx.js';

const Y_PANE = 250;                     // dove appoggia il pane sul bancone
const X_MIN = 36, X_MAX = 444;          // corsa del pane
const H_PANE = 8;                       // altezza della mollica sopra il bancone
const Y_MARS = 212, TAGLIA_MARS = 1.1;  // Marsupino, dietro al bancone (il pancione ci si appoggia sopra)
const INGREDIENTI = ['prosciutto', 'wurstel', 'sottiletta', 'ketchup', 'maionese'];
const LANCIABILI = ['prosciutto', 'wurstel', 'sottiletta'];
const SALSE = ['ketchup', 'maionese'];
const SBAGLIATI = ['calzino', 'lisca', 'ghiaccio', 'ciabatta'];
const SPESSORE = { prosciutto: 4, wurstel: 5.5, sottiletta: 3, ketchup: 3, maionese: 3 };

export class PaninoScene extends MicrogiocoBase {
  constructor() { super('panino'); }

  prepara() {
    this.punti = 0;
    this.panini = 0;
    this.presi = 0;
    this.schifezze = 0;
    this.oggetti = [];        // cose lanciate: { tipo, img, stato: 'lancio'|'caduta'|'fatto', vel, giro, yPrec }
    this.tLancio = 1;
    this.tTubetto = 2.2;
    this.tFrase = 5;
    this.tEspr = 0;
    // pane: posizione, velocità e "obiettivo" per mouse e dito
    this.x = 240;
    this.vel = 0;
    this.velPrec = 0;
    this.obiettivoX = 240;
    this.modo = 'tastiera';
    this.piega = 0;           // inclinazione della pila (spostamento per unità di altezza)
    this.vPiega = 0;
    // (la scena viene riusata da una partita all'altra: si azzera anche quello che resta in memoria)
    this.hud = null;
    this.ditoX = null;
    this.tPosa = 0;
    this.dopo = null;

    im(this, 0, 0, 'bgBar').setOrigin(0);
    txt(this, 171, 60, 'PANINI', { size: 7, color: '#f6f1e0', thick: 0 });
    txt(this, 171, 85, 'Crudo ..... 4\nWürstel ... 4\nIl Marsupino\n.......... 6', { size: 4.6, color: '#e8efe6', thick: 0, spacing: 0 });
    txt(this, 423, 70, 'APERTO', { size: 5.5, color: '#c0392b', thick: 0 });

    this.mars = im(this, 240, Y_MARS, 'marsupino_normale', TAGLIA_MARS).setOrigin(0.5, 1).setDepth(5);
    im(this, 0, 196, 'banconeBar').setOrigin(0).setDepth(10);
    this.nuovoPane();

    // ricetta in alto: le icone si accendono quando l'ingrediente è nel panino
    this.hudPanino = [pannello(this, 240, 26, 170, 24, { depth: 1000 })];
    this.icone = {};
    INGREDIENTI.forEach((k, i) => {
      const x = 240 - 64 + i * 32;
      const icona = im(this, x, 26, 'pan_' + k, 0.75).setDepth(1001);
      const spunta = this.add.graphics().setDepth(1002).setPosition(x + 7, 31);
      spunta.lineStyle(2.6, 0x1f1430, 1).beginPath().moveTo(-3.5, 0).lineTo(-1, 2.5).lineTo(4, -3.5).strokePath();
      spunta.lineStyle(1.4, 0x7dff9a, 1).beginPath().moveTo(-3.5, 0).lineTo(-1, 2.5).lineTo(4, -3.5).strokePath();
      this.icone[k] = { icona, spunta };
      this.hudPanino.push(icona, spunta);
    });
    this.aggiornaRicetta();
    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });
    this.testoPanini = txt(this, 474, 49, '', { ox: 1, depth: 1001, size: 8, color: '#ffe14a' });
    this.hudPanino.push(this.testoPunti, this.testoPanini);
    this.tubi = new Set();    // tubetti in volo (per nasconderli nel finale)

    // comandi: frecce o A/D; il mouse muove il pane dove punta; il dito lo trascina
    this.tasti = this.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT', a: 'A', d: 'D' });
    const xMondo = (p) => this.cameras.main.getWorldPoint(p.x, p.y).x;
    this.input.on('pointerdown', (p) => {
      if (!p.wasTouch) return;
      this.modo = 'dito';
      this.ditoX = xMondo(p);
      this.obiettivoX = this.x;
    });
    this.input.on('pointerup', (p) => { if (p.wasTouch) this.ditoX = null; });
    this.input.on('pointermove', (p) => {
      const x = xMondo(p);
      if (p.wasTouch) {
        if (!p.isDown || this.ditoX == null) return;
        this.obiettivoX = Phaser.Math.Clamp(this.obiettivoX + (x - this.ditoX) * this.cfg.guadagnoDito, X_MIN, X_MAX);
        this.ditoX = x;
      } else {
        this.modo = 'mouse';
        this.obiettivoX = Phaser.Math.Clamp(x, X_MIN, X_MAX);
      }
    });
  }

  // dopo una pausa il dito che trascinava non c'è più
  alRientro() { this.ditoX = null; }

  // pane nuovo (fondo), ricetta da capo
  nuovoPane() {
    this.ricetta = Object.fromEntries(INGREDIENTI.map((k) => [k, false]));
    this.strati = [];
    this.piega = this.vPiega = 0;
    this.inizioPanino = this.trascorso;
    this.pila = this.add.container(this.x, Y_PANE).setDepth(30);
    this.pila.add(this.add.ellipse(0, 1, 50, 6, 0x000000, 0.2));
    const pane = im(this, 0, 1, 'paneSotto').setOrigin(0.5, 1);
    this.pila.add(pane);
    this.tweens.add({ targets: pane, scale: { from: pane.scale * 0.4, to: pane.scale }, duration: 180, ease: 'Back.out' });
    if (this.icone) this.aggiornaRicetta();
  }

  get altezza() { return H_PANE + this.strati.reduce((h, s) => h + s.sp, 0); }

  aggiornaRicetta() {
    for (const k of INGREDIENTI) {
      const { icona, spunta } = this.icone[k];
      icona.setAlpha(this.ricetta[k] ? 1 : 0.4);
      spunta.setVisible(this.ricetta[k]);
    }
  }

  aggiorna(dt, p) {
    this.muoviPane(dt);
    this.ondeggia(dt);
    this.lanci(dt, p);
    this.cadute(dt);
    this.tubetti(dt, p);
    this.umore(dt);
    // (le scritte si ridisegnano solo quando cambiano: rifarle a ogni fotogramma costa)
    const hud = `${this.punti}|${this.panini}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText('PUNTI: ' + this.punti);
      this.testoPanini.setText(`PANINI: ${this.panini}/${this.cfg.obiettivoPanini}`);
      this.testoPanini.setColor(this.panini >= this.cfg.obiettivoPanini ? '#7dff9a' : '#ffe14a');
    }
  }

  muoviPane(dt) {
    const c = this.cfg, T = this.tasti;
    const dir = (T.dx.isDown || T.d.isDown ? 1 : 0) - (T.sx.isDown || T.a.isDown ? 1 : 0);
    if (dir) {
      this.modo = 'tastiera';
      this.vel += (dir * c.velPane - this.vel) * Math.min(1, dt * 12);
    } else if (this.modo === 'tastiera') this.vel -= this.vel * Math.min(1, dt * 14);
    else this.vel = Phaser.Math.Clamp((this.obiettivoX - this.x) * 14, -c.velPane, c.velPane);
    this.x = Phaser.Math.Clamp(this.x + this.vel * dt, X_MIN, X_MAX);
    if (this.x === X_MIN || this.x === X_MAX) this.vel = 0;
    if (this.modo === 'tastiera') this.obiettivoX = this.x;
    this.pila.x = this.x;
  }

  // la pila è una molla spinta dalle accelerazioni del pane: più è alta, più è morbida
  ondeggia(dt) {
    const c = this.cfg, acc = (this.vel - this.velPrec) / Math.max(dt, 0.001);
    this.velPrec = this.vel;
    const k = c.rigidita / (1 + this.strati.length * 0.15);
    this.vPiega += (-k * this.piega - c.smorzamento * this.vPiega - acc * c.ondeggio) * dt;
    this.piega = Phaser.Math.Clamp(this.piega + this.vPiega * dt, -0.45, 0.45);
    for (const s of this.strati) { s.img.x = this.piega * s.h; s.img.rotation = this.piega * 0.4; }
  }

  // --- Marsupino lancia ---
  lanci(dt, p) {
    const c = this.cfg;
    this.tLancio -= dt;
    if (this.tLancio > 0) return;
    this.tLancio = lerp(c.lancioInizio, c.lancioFine, p) * Phaser.Math.FloatBetween(0.85, 1.15);
    const x1 = Phaser.Math.Between(48, 432);
    this.lancia(this.scegli(p), x1);
    if (p >= c.doppioDa && Math.random() < c.probDoppio) {
      let x2;
      do x2 = Phaser.Math.Between(48, 432); while (Math.abs(x2 - x1) < 100);
      this.lancia(this.scegli(p), x2);
    }
  }

  // preferisce gli ingredienti che mancano, così il panino si può sempre finire
  scegli(p) {
    const c = this.cfg;
    if (Math.random() < lerp(c.sbagliatiInizio, c.sbagliatiFine, p)) return caso(SBAGLIATI);
    const mancano = LANCIABILI.filter((k) => !this.ricetta[k]);
    return mancano.length && Math.random() < 0.65 ? caso(mancano) : caso(LANCIABILI);
  }

  // dalle mani di Marsupino in su, fuori dallo schermo; poi ricade dritto su x
  lancia(tipo, x) {
    const mano = x < this.mars.x ? -1 : 1;
    const img = im(this, this.mars.x + mano * 44, 145, 'pan_' + tipo).setDepth(20);
    const o = { tipo, img, stato: 'lancio', vel: 0, giro: Phaser.Math.Between(-120, 120), yPrec: 145 };
    this.oggetti.push(o);
    if (this.tEspr <= 0) { this.mars.setTexture('marsupino_felice'); this.tPosa = 0.22; } // braccia in alto: lancia
    Audio.sfx('lancio');
    this.tweens.add({
      targets: img, x, y: -24, angle: Phaser.Math.Between(-220, 220), duration: 420, ease: 'Sine.out',
      onComplete: () => { o.stato = 'caduta'; o.yPrec = img.y; o.vel = this.velCaduta; },
    });
  }

  get velCaduta() { return lerp(this.cfg.cadutaInizio, this.cfg.cadutaFine, this.progresso); }

  // --- cose in caduta: si prendono quando attraversano la cima della pila ---
  cadute(dt) {
    const c = this.cfg, H = this.altezza, cimaY = Y_PANE - H, cimaX = this.x + this.piega * H;
    const presa = c.presa + this.strati.length * 0.6;
    for (const o of this.oggetti) {
      if (o.stato !== 'caduta') continue;
      o.yPrec = o.img.y;
      o.img.y += o.vel * dt;
      o.img.angle += o.giro * dt;
      if (o.yPrec < cimaY && o.img.y >= cimaY && Math.abs(o.img.x - cimaX) < presa) this.prendi(o, cimaX, cimaY);
      else if (o.img.y >= Y_PANE) this.aTerra(o);
    }
    this.oggetti = this.oggetti.filter((o) => o.stato !== 'fatto');
  }

  prendi(o, x, y) {
    const c = this.cfg;
    o.stato = 'fatto';
    o.img.destroy();
    if (SBAGLIATI.includes(o.tipo)) return this.rovina(o.tipo);
    // a pila piena i doppioni non entrano più; quello che manca alla ricetta entra sempre
    if (this.ricetta[o.tipo] && this.strati.length >= c.maxStrati) {
      scritta(this, x, y - 14, 'TROPPO PIENO!', { size: 8, color: '#ff9a8a', durata: 400 });
      return;
    }
    this.presi++;
    this.aggiungiStrato(o.tipo);
    this.tweens.add({ targets: this.pila, scaleX: { from: 1.08, to: 1 }, scaleY: { from: 0.9, to: 1 }, duration: 140, ease: 'Quad.out' });
    if (!this.ricetta[o.tipo]) {
      this.ricetta[o.tipo] = true;
      this.punti += c.puntiIngrediente;
      this.aggiornaRicetta();
      colpetto(this, this.icone[o.tipo].icona, 1.5, 1.5);
      Audio.sfx('preso');
      scritta(this, x, y - 16, `+${c.puntiIngrediente}`, { size: 10, color: '#7dff9a', durata: 350 });
      if (INGREDIENTI.every((k) => this.ricetta[k])) this.completa();
      else this.espressione('felice', 0.4);
    } else {
      this.punti += c.puntiDoppione;
      Audio.sfx('muovi');
      scritta(this, x, y - 16, `+${c.puntiDoppione} DOPPIO!`, { size: 8, color: '#ffe14a', durata: 350 });
    }
  }

  aggiungiStrato(k) {
    const sp = SPESSORE[k], h = this.altezza + sp / 2;
    const img = im(this, this.piega * h, -h - 6, 'strato_' + k);
    this.pila.add(img);
    this.strati.push({ tipo: k, img, h, sp });
    this.tweens.add({ targets: img, y: -h, duration: 90, ease: 'Quad.in' });
  }

  // tutti e 5: cala il pane di sopra, il panino vola nel contatore e se ne comincia un altro
  completa() {
    const c = this.cfg, rapido = this.trascorso - this.inizioPanino <= c.secondiRapido;
    const guadagno = c.puntiPanino + (rapido ? c.bonusRapido : 0), H = this.altezza;
    this.punti += guadagno;
    this.panini++;
    const fatto = this.pila.setDepth(1003);
    const cappello = im(this, this.piega * H, -H - 50, 'paneSopra').setOrigin(0.5, 20.5 / 22);
    fatto.add(cappello);
    Audio.sfx('bonus');
    scritta(this, this.x, Y_PANE - H - 34, rapido ? `PANINO! +${guadagno} VELOCE!` : `PANINO! +${guadagno}`, { size: 11, color: '#7dff9a' });
    this.espressione('felice', 1);
    fumetto(this, this.mars.x + 50, 62, caso(c.frasiPanino), 1100, 40);
    this.tweens.add({
      targets: cappello, y: -H + 1, duration: 200, ease: 'Quad.in',
      onComplete: () => {
        stelle(this, fatto.x, Y_PANE - H, 7, 1004);
        colpetto(this, fatto, 1.15, 0.85);
        this.tweens.add({
          targets: fatto, x: 452, y: 62, scale: 0.3, delay: 220, duration: 420, ease: 'Cubic.in',
          onComplete: () => { fatto.destroy(); colpetto(this, this.testoPanini, 1.3, 1.3); },
        });
      },
    });
    this.nuovoPane();
  }

  // presa una schifezza: panino nel cestino
  rovina(tipo) {
    const c = this.cfg, H = this.altezza, vecchio = this.pila;
    this.schifezze++;
    this.punti -= c.malusSbagliato;
    vibra(60);
    vecchio.add(im(this, this.piega * H, -H - 8, 'pan_' + tipo));
    Audio.sfx('errore');
    scuoti(this, 160, 0.008);
    this.cameras.main.flash(100, 255, 90, 90);
    scritta(this, this.x, Y_PANE - H - 40, caso(['PANINO ROVINATO!', 'CHE SCHIFO!', 'BLEAH!']), { size: 12, color: '#ff6b5a' });
    scritta(this, this.x, Y_PANE - H - 26, `-${c.malusSbagliato}`, { size: 10, color: '#ff6b5a' });
    // un attimo di incredulità (gli scivolano gli occhiali) e poi esplode
    this.espressione('shock', 0.4);
    this.time.delayedCall(170, () => { if (this.inCorso) this.furia(); });
    const verso = this.x < 240 ? -1 : 1;
    this.tweens.add({ targets: vecchio, x: vecchio.x + verso * 140, y: 330, angle: verso * 220, duration: 650, ease: 'Quad.in', onComplete: () => vecchio.destroy() });
    this.nuovoPane();
  }

  // Marsupino va su tutte le furie: paonazzo, salta sul posto facendo tremare il bancone,
  // gli esce il fumo dalle orecchie e urla a caratteri cubitali; poi brontola ancora un po'
  furia() {
    const c = this.cfg, m = this.mars;
    this.espressione('rabbia', 1.6);
    Audio.sfx('ruggito');
    this.tweens.killTweensOf(m);      // una sfuriata sopra l'altra riparte da capo
    m.setAngle(0).setY(Y_MARS);
    const tonfo = () => {
      if (!this.inCorso) return;
      Audio.sfx('tonfo');
      scuoti(this, 110, 0.007);
      for (const s of [-1, 1]) fumo(this, m.x + s * 46, 197, 2, 12, 0xe6d8bc);
    };
    this.tweens.add({ targets: m, y: Y_MARS - 16, duration: 95, ease: 'Quad.out', yoyo: true, repeat: 2, onRepeat: tonfo, onComplete: tonfo });
    this.tweens.add({ targets: m, angle: { from: -4, to: 4 }, duration: 50, yoyo: true, repeat: 13, onComplete: () => m.setAngle(0) });
    this.time.addEvent({ delay: 110, repeat: 9, callback: () => { if (this.inCorso) for (const s of [-1, 1]) fumo(this, m.x + s * 40, m.y - 96, 1, 6); } });
    const urlo = scritta(this, m.x, 64, caso(c.urla), { size: 15, color: '#ff3b2f', durata: 900, depth: 41 });
    this.tweens.add({ targets: urlo, x: { from: m.x - 3, to: m.x + 3 }, duration: 45, yoyo: true, repeat: 12 });
    this.time.delayedCall(800, () => { if (this.inCorso) fumetto(this, this.mars.x + 56, 70, caso(c.frasiSbaglio), 1200, 40); });
    this.tFrase = Math.max(this.tFrase, 3);   // niente battute allegre mentre è furioso
  }

  // non presa: finisce sul bancone
  aTerra(o) {
    o.stato = 'fatto';
    const img = o.img;
    img.y = Y_PANE;
    Audio.sfx('splat');
    if (!SBAGLIATI.includes(o.tipo) && this.tEspr <= 0) this.espressione('triste', 0.5);
    this.tweens.add({ targets: img, scaleY: img.scaleY * 0.5, scaleX: img.scaleX * 1.3, y: Y_PANE + 3, duration: 90 });
    this.tweens.add({ targets: img, alpha: 0, delay: 350, duration: 250, onComplete: () => img.destroy() });
  }

  // --- tubetti di ketchup e maionese che passano in alto e spruzzano ---
  tubetti(dt, p) {
    const c = this.cfg;
    this.tTubetto -= dt;
    if (this.tTubetto > 0) return;
    this.tTubetto = lerp(c.tubettoInizio, c.tubettoFine, p) * Phaser.Math.FloatBetween(0.85, 1.15);
    const mancano = SALSE.filter((s) => !this.ricetta[s]);
    const salsa = mancano.length && Math.random() < 0.8 ? caso(mancano) : caso(SALSE);
    const da = Math.random() < 0.5 ? -1 : 1, xSpruzzo = Phaser.Math.Between(70, 410), y = 66;
    const img = im(this, da < 0 ? -20 : 500, y, 'tubetto_' + salsa).setDepth(25);
    this.tubi.add(img);
    this.tweens.add({
      targets: img, x: xSpruzzo, duration: (Math.abs(xSpruzzo - img.x) / lerp(170, 260, p)) * 1000, ease: 'Sine.inOut',
      onComplete: () => this.tweens.add({
        targets: img, angle: { from: -9, to: 9 }, duration: 60, yoyo: true, repeat: 3,  // trema: sta per spruzzare
        onComplete: () => {
          if (!this.inCorso) return;    // partita finita mentre il tubetto tremava
          img.angle = 0;
          colpetto(this, img, 0.8, 1.25);
          Audio.sfx('spruzzo');
          const goccia = im(this, xSpruzzo, y + 24, 'pan_' + salsa).setDepth(20);
          this.oggetti.push({ tipo: salsa, img: goccia, stato: 'caduta', vel: this.velCaduta * c.velSchizzo, giro: 0, yPrec: y + 24 });
          this.tweens.add({ targets: img, x: da < 0 ? 500 : -20, delay: 200, duration: 700, ease: 'Sine.in', onComplete: () => { this.tubi.delete(img); img.destroy(); } });
        },
      }),
    });
  }

  // --- Marsupino: espressioni, posa di lancio, chiacchiere ---
  espressione(e, sec, poi, secPoi) {
    this.mars.setTexture('marsupino_' + e);
    this.tEspr = sec;
    this.dopo = poi ? [poi, secPoi] : null;
  }

  umore(dt) {
    this.mars.x = 240 + Math.sin(this.trascorso * 0.9) * 26;
    if (this.tPosa > 0) {
      this.tPosa -= dt;
      if (this.tPosa <= 0 && this.tEspr <= 0) this.mars.setTexture('marsupino_normale');
    }
    if (this.tEspr > 0) {
      this.tEspr -= dt;
      if (this.tEspr <= 0) {
        if (this.dopo) this.espressione(...this.dopo);
        else this.mars.setTexture('marsupino_normale');
      }
    }
    this.tFrase -= dt;
    if (this.tFrase <= 0) {
      this.tFrase = 5 + Math.random() * 3;
      fumetto(this, this.mars.x + 50, 62, caso(this.cfg.frasi), 1100, 40);
    }
  }

  risultato() {
    return {
      punteggio: Math.max(0, this.punti),
      vittoria: this.panini >= this.cfg.obiettivoPanini,
      riepilogo: `${quanti(this.panini, 'panino', 'panini')}, ${quanti(this.presi, 'ingrediente preso', 'ingredienti presi')}, ${quanti(this.schifezze, 'schifezza', 'schifezze')}`,
    };
  }

  // Marsupino addenta il panino (o lo guarda schifato)
  finale(ris, fatto) {
    for (const o of [...this.oggetti.map((o) => o.img), ...this.tubi, ...this.hudPanino, this.pila]) o.setVisible(false);
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.7, duration: 300 });
    this.tweens.killTweensOf(this.mars);   // se stava ancora saltando di rabbia
    this.mars.setDepth(701).setAngle(0).setTexture('marsupino_normale');
    this.tweens.add({ targets: this.mars, x: 240, y: 268, scale: scalaDi('marsupino_normale', 1.75), duration: 400, ease: 'Back.out' });

    // il panino gigante davanti a lui
    const pan = this.add.container(240, 214).setDepth(702).setScale(0);
    pan.add(im(this, 0, 1, 'paneSotto').setOrigin(0.5, 1));
    let h = H_PANE;
    for (const k of INGREDIENTI) { pan.add(im(this, ris.vittoria ? 0 : Phaser.Math.Between(-7, 7), -h - SPESSORE[k] / 2, 'strato_' + k).setAngle(ris.vittoria ? 0 : Phaser.Math.Between(-12, 12))); h += SPESSORE[k]; }
    if (!ris.vittoria && this.schifezze) pan.add(im(this, 4, -h - 2, 'pan_calzino'));
    pan.add(im(this, ris.vittoria ? 0 : 6, -h + 1, 'paneSopra').setOrigin(0.5, 20.5 / 22).setAngle(ris.vittoria ? 0 : 14));
    this.tweens.add({ targets: pan, scale: 1.7, delay: 250, duration: 350, ease: 'Back.out' });

    this.time.delayedCall(800, () => {
      if (ris.vittoria) {
        this.mars.setTexture('marsupino_felice');
        txt(this, 240, 24, 'CHE BONTÀ!', { size: 18, color: '#7dff9a', depth: 710 });
        // tre morsi
        for (let i = 0; i < 3; i++) this.time.delayedCall(i * 520, () => {
          Audio.sfx('gnam');
          scritta(this, 240 + Phaser.Math.Between(-70, 70), 110 + Phaser.Math.Between(-20, 20), 'GNAM!', { size: 14, color: '#ffe14a', depth: 711 });
          this.tweens.add({ targets: pan, scaleX: pan.scaleX * 0.7, x: pan.x - 10, duration: 120 });
          for (let k = 0; k < 6; k++) {
            const b = this.add.ellipse(240 + Phaser.Math.Between(-30, 30), 190, 3, 2, 0xe8a64e).setDepth(703);
            this.tweens.add({ targets: b, x: b.x + Phaser.Math.Between(-40, 40), y: 262, duration: 500, ease: 'Quad.in', onComplete: () => b.destroy() });
          }
          if (i === 2) this.tweens.add({ targets: pan, alpha: 0, delay: 150, duration: 200, onComplete: () => stelle(this, 240, 150, 10, 712) });
        });
      } else {
        // lo assaggia con lo sguardo, e si infuria: salta, fuma dalle orecchie e spazza via il panino
        this.mars.setTexture('marsupino_rabbia');
        Audio.sfx('bleah');
        Audio.sfx('ruggito');
        const titolo = txt(this, 240, 24, 'MA CHE SCHIFO! RIFALLO!', { size: 18, color: '#ff3b2f', depth: 710 });
        this.tweens.add({ targets: titolo, x: { from: 237, to: 243 }, duration: 50, yoyo: true, repeat: 20 });
        const tonfo = () => { Audio.sfx('tonfo'); scuoti(this, 120, 0.008); };
        this.tweens.add({ targets: this.mars, y: 250, duration: 110, ease: 'Quad.out', yoyo: true, repeat: 3, onRepeat: tonfo, onComplete: tonfo });
        this.tweens.add({ targets: this.mars, angle: { from: -4, to: 4 }, duration: 55, yoyo: true, repeat: 22, onComplete: () => this.mars.setAngle(0) });
        this.time.addEvent({ delay: 120, repeat: 16, callback: () => { for (const s of [-1, 1]) fumo(this, 240 + s * 62, 114, 1, 705); } });
        this.tweens.add({ targets: pan, x: 540, y: 110, angle: 540, delay: 520, duration: 380, ease: 'Quad.in', onStart: () => Audio.sfx('schiaffo') });
      }
    });
    this.time.delayedCall(3300, fatto);
  }
}
