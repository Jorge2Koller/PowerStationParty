// Microgioco 7: "TorRONDAcelli" - il Generale difende la spiaggia dai pirati.
//
//  Dal largo arrivano le bagnarole dei pirati (gommone, pedalò, galeone gonfiabile):
//  vogliono gli ombrelloni. Il cannone spara dove miri; le palle volano in arco
//  e ci mettono di più ad arrivare lontano. Quelle affondate lasciano i pirati a
//  nuoto con la ciambella. Se una bagnarola tocca riva si prende un ombrellone e
//  scappa: affondala prima che sparisca all'orizzonte e l'ombrellone torna.
//  Le munizioni le lancia il Generale: una cassa ogni tanto, da prendere al volo.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { txt, im, scalaDi, scritta, stelle, fumo, pannello, scuoti, lerp, caso, fumetto, vibra } from '../fx.js';
import { SPIAGGIA } from '../grafica/sfondi.js';

const O = SPIAGGIA.orizzonte, RIVA = 196;
const X_OMBR = [100, 170, 240, 310, 380], Y_OMBR = 226;
const PERNO = { x: 240, y: 243 };        // perno della canna del cannone
const GEN = { x: 42, y: 272, taglia: 0.72 };
// prospettiva: quanto è grande una cosa sull'acqua a quell'altezza (1 = sulla riva)
const prosp = (y) => 0.32 + 0.68 * Phaser.Math.Clamp((y - O) / (RIVA - O), 0, 1);
const PIRATI = { gommone: 2, pedalo: 2, galeone: 3 };

export class RondaScene extends MicrogiocoBase {
  constructor() { super('ronda'); }

  prepara() {
    this.punti = 0;
    this.affondate = 0;
    this.ripresi = 0;
    this.colpi = this.cfg.colpiMax;
    this.barche = [];          // { tipo, img, hp, stato: 'arriva'|'ferma'|'fugge'|'giu', x0, xa, xb, y, fase, vel, bottino }
    this.palle = [];           // { img, x0, y0, x1, y1, t, T }
    this.tBarca = 0.8;
    this.tLenta = this.cfg.ricaricaLenta;
    this.tCassa = 2.5;
    this.tFrase = 6;
    this.tEspr = 0;
    this.rinculo = 0;
    this.cassa = null;
    this.mira = { x: 240, y: 120 };

    im(this, 0, 0, 'bgSpiaggia').setOrigin(0);
    this.ombrelloni = X_OMBR.map((x) => ({ x, stato: 'su', img: im(this, x, Y_OMBR, 'ombrellone', 0.8).setOrigin(0.5, 1).setDepth(40) }));

    this.gen = im(this, GEN.x, GEN.y, 'generale_normale', GEN.taglia).setOrigin(0.5, 1).setDepth(60);
    this.soldato = im(this, 290, 276, `${this.giocatore.id}_normale`, 0.5).setOrigin(0.5, 1).setDepth(58);
    im(this, 240, 254, 'affusto', 0.9).setDepth(63);
    this.canna = im(this, PERNO.x, PERNO.y, 'cannone', 0.9).setOrigin(4 / 40, 0.5).setDepth(62);

    // mirino
    this.mirino = this.add.graphics().setDepth(900);
    this.mirino.lineStyle(1.6, 0x1f1430, 1).strokeCircle(0, 0, 7.5);
    this.mirino.lineStyle(1, 0xffe14a, 1).strokeCircle(0, 0, 7).lineBetween(-11, 0, -3, 0).lineBetween(3, 0, 11, 0).lineBetween(0, -11, 0, -3).lineBetween(0, 3, 0, 11);

    // munizioni in alto
    this.hud = [pannello(this, 240, 25, 120, 18, { depth: 1000 })];
    this.iconeColpi = [];
    for (let i = 0; i < this.cfg.colpiMax; i++) this.iconeColpi.push(im(this, 240 - 50 + i * 12 + 10, 25, 'palla', 1.3).setDepth(1001));
    this.hud.push(...this.iconeColpi);
    this.testoPunti = txt(this, 474, 36, 'AFFONDATE: 0', { ox: 1, depth: 1001, size: 7 });
    this.hud.push(this.testoPunti);
    this.aggiornaColpi();

    // comandi
    this.tasti = this.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT', su: 'UP', giu: 'DOWN', a: 'A', d: 'D', w: 'W', s: 'S' });
    this.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) this.spara(); });
    this.input.keyboard.on('keydown-R', () => this.prendiCassa());
    const mondo = (p) => this.cameras.main.getWorldPoint(p.x, p.y);
    this.input.on('pointermove', (p) => { if (!p.wasTouch) this.punta(mondo(p)); });
    this.input.on('pointerdown', (p) => {
      if (!this.inCorso || (!p.wasTouch && !p.leftButtonDown())) return;
      const w = mondo(p);
      if (this.cassa?.pronta && Math.hypot(w.x - this.cassa.img.x, w.y - this.cassa.img.y) < 18) return this.prendiCassa();
      if (w.y > RIVA + 16) return;
      this.punta(w);
      this.spara();
    });
  }

  punta(w) {
    this.mira.x = Phaser.Math.Clamp(w.x, 8, 472);
    this.mira.y = Phaser.Math.Clamp(w.y, O + 3, RIVA + 2);
  }

  aggiornaColpi() {
    this.iconeColpi.forEach((ic, i) => ic.setAlpha(i < this.colpi ? 1 : 0.22));
  }

  espr(e, sec = 1.2) { this.gen.setTexture('generale_' + e); this.tEspr = sec; }

  parla(s, ms = 1300) {
    this.fumGen?.destroy();
    this.fumGen = fumetto(this, 78, 152, s, ms, 800);
  }

  // --- cannone ---
  spara() {
    if (!this.inCorso) return;
    if (this.colpi <= 0) {
      Audio.sfx('vuoto');
      if (!this.tVuoto || this.trascorso - this.tVuoto > 1.5) { this.tVuoto = this.trascorso; scritta(this, 240, 214, 'MUNIZIONI!', { size: 9, color: '#ff6b5a', durata: 300, depth: 950 }); }
      return;
    }
    this.colpi--;
    this.aggiornaColpi();
    const ang = this.canna.rotation, bx = PERNO.x + Math.cos(ang) * 33, by = PERNO.y + Math.sin(ang) * 33;
    const sP = prosp(this.mira.y);
    const img = im(this, bx, by, 'palla', 1.6).setDepth(880);
    this.palle.push({ img, x0: bx, y0: by, x1: this.mira.x, y1: this.mira.y, t: 0, T: 0.22 + 0.4 * (1 - sP), arco: 10 + 26 * (1 - sP) });
    this.rinculo = 1;
    Audio.sfx('cannonata');
    vibra(30);
    scuoti(this, 90, 0.004);
    fumo(this, bx, by, 4, 870);
  }

  impatto(pl) {
    const { x1: x, y1: y } = pl;
    // la bagnarola più vicina sotto il colpo (quelle davanti coprono quelle dietro)
    let presa = null;
    for (const b of this.barche) {
      if (b.stato === 'giu') continue;
      const w = b.img.displayWidth, h = b.img.displayHeight;
      if (Math.abs(x - b.img.x) < w * 0.5 + 3 && y > b.img.y - h - 2 && y < b.img.y + 3 + 4 * prosp(b.y) && (!presa || b.y > presa.y)) presa = b;
    }
    const s = prosp(y);
    const sp = im(this, x, y + 2 * s, 'spruzzo', s * 1.2).setOrigin(0.5, 1).setDepth(presa ? presa.img.depth + 1 : Math.round(y / 10) + 10);
    this.tweens.add({ targets: sp, scaleY: sp.scaleY * 1.5, alpha: 0, duration: 450, onComplete: () => sp.destroy() });
    if (!presa) { Audio.sfx('splash'); return; }
    presa.hp--;
    if (presa.hp > 0) {
      Audio.sfx('buco');
      presa.inclina += (Math.random() < 0.5 ? -1 : 1) * 7;
      presa.img.setTint(presa.hp === 1 ? 0xb8b0a8 : 0xd8d0c8);
      fumo(this, x, y - 4 * s, 2, presa.img.depth + 2, 0x888888);
      return;
    }
    this.affonda(presa);
  }

  affonda(b) {
    b.stato = 'giu';
    this.affondate++;
    let p = this.cfg.puntiAffondata + (b.y < this.cfg.yLontano ? this.cfg.bonusLontano : 0);
    const s = prosp(b.y);
    Audio.sfx('affonda');
    if (b.bottino) {
      // l'ombrellone torna al suo posto
      const o = b.bottino; b.bottino = null;
      p += this.cfg.puntiRipreso; this.ripresi++;
      o.stato = 'torna';
      this.tweens.add({ targets: o.img, x: o.x, y: Y_OMBR, scale: scalaDi('ombrellone', 0.8), duration: 650, ease: 'Quad.inOut', onComplete: () => { o.stato = 'su'; o.img.setDepth(40); } });
      o.img.setDepth(870);
      scritta(this, o.x, Y_OMBR - 36, 'RIPRESO!', { size: 9, color: '#7dff9a', depth: 951 });
      this.espr('felice');
      this.parla('Così si fa!', 1000);
    } else if (Math.random() < 0.35) { this.espr('felice', 0.9); }
    this.punti += p;
    this.testoPunti.setText('AFFONDATE: ' + this.affondate);
    scritta(this, b.img.x, b.img.y - b.img.displayHeight - 4, '+' + p, { size: 8 + 4 * s, color: '#7dff9a', durata: 400 });
    // la bagnarola si inclina e va giù
    this.tweens.add({ targets: b.img, angle: b.img.angle + (b.inclina >= 0 ? 28 : -28), y: b.img.y + 8 * s, alpha: 0, duration: 1100, ease: 'Quad.in', onComplete: () => b.img.destroy() });
    // i pirati scappano a nuoto con la ciambella
    for (let i = 0; i < PIRATI[b.tipo]; i++) {
      const lato = i % 2 ? 1 : -1, n = im(this, b.img.x + lato * 6 * s, b.img.y - 2 * s, 'pirataNuota', s).setOrigin(0.5, 1).setDepth(b.img.depth - 1).setAlpha(0);
      this.tweens.add({ targets: n, alpha: 1, delay: 300 + i * 120, duration: 200 });
      this.tweens.add({ targets: n, x: n.x + lato * (34 + i * 10) * s, y: n.y - (8 + i * 3) * s, delay: 300 + i * 120, duration: 2600, ease: 'Sine.out' });
      this.tweens.add({ targets: n, angle: { from: -8, to: 8 }, duration: 260, yoyo: true, repeat: 6 });
      this.tweens.add({ targets: n, alpha: 0, delay: 2500 + i * 120, duration: 400, onComplete: () => n.destroy() });
    }
  }

  // --- bagnarole ---
  nuovaBarca(f) {
    const r = Math.random();
    const tipo = r < f.galeone ? 'galeone' : r < f.galeone + f.pedalo ? 'pedalo' : 'gommone';
    const vivi = this.ombrelloni.filter((o) => o.stato === 'su');
    const bersaglio = vivi.length ? caso(vivi).x : caso(X_OMBR);
    const y = O + 4;
    const b = {
      tipo, hp: this.cfg.hp[tipo], stato: 'arriva', inclina: 0, y,
      xa: Phaser.Math.Between(40, 440), xb: bersaglio + Phaser.Math.Between(-10, 10),
      fase: Math.random() * 6.28, zig: f.zigzag * (0.5 + Math.random() * 0.5), vel: f.vel * this.cfg.passo[tipo], bottino: null,
      img: im(this, 0, y, 'barca_' + tipo, 0.1).setOrigin(0.5, 1),
    };
    this.barche.push(b);
    this.posiziona(b, 0);
  }

  posiziona(b, dt) {
    const s = prosp(b.y), k = (b.y - O) / (RIVA - O);
    b.fase += dt * 1.6;
    const x = b.stato === 'fugge' ? b.xFuga + Math.sin(b.fase) * 4 * s : lerp(b.xa, b.xb, Phaser.Math.Clamp(k * 1.15, 0, 1)) + Math.sin(b.fase) * b.zig * s * (1 - k * 0.7);
    b.img.setPosition(x, b.y + Math.sin(b.fase * 2.3) * 0.6 * s).setScale(scalaDi(b.img.texture.key, 0.8 * s)).setDepth(Math.round(b.y / 10) + 10);
    b.img.setAngle(b.inclina + Math.sin(b.fase * 1.7) * 3);
    if (b.bottino) b.bottino.img.setPosition(x + 2 * s, b.img.y - b.img.displayHeight * 0.45).setScale(scalaDi('ombrellone', 0.5 * s)).setDepth(b.img.depth + 1);
  }

  aRiva(b) {
    b.stato = 'ferma';
    b.tFerma = 0.8;
    const vivi = this.ombrelloni.filter((o) => o.stato === 'su').sort((p, q) => Math.abs(p.x - b.img.x) - Math.abs(q.x - b.img.x));
    const o = vivi[0];
    if (!o) return;
    o.stato = 'preso';
    b.bottino = null;
    Audio.sfx('rubato');
    Audio.sfx('fischietto');
    vibra(60);
    fumetto(this, b.img.x, b.img.y - b.img.displayHeight - 8, caso(this.cfg.frasiPirati), 900, 820);
    this.espr('shock', 1.4);
    this.parla(caso(this.cfg.frasiRubato), 1200);
    o.img.setDepth(870);
    this.tweens.add({ targets: o.img, x: b.img.x, y: b.img.y - b.img.displayHeight * 0.45, scale: scalaDi('ombrellone', 0.5), angle: 360, duration: 600, ease: 'Quad.out', onComplete: () => {
      o.img.setAngle(0);
      if (b.stato !== 'giu') return void (b.bottino = o);
      // affondata mentre se lo prendeva: l'ombrellone torna a casa
      o.stato = 'torna';
      this.tweens.add({ targets: o.img, x: o.x, y: Y_OMBR, scale: scalaDi('ombrellone', 0.8), duration: 500, onComplete: () => { o.stato = 'su'; o.img.setDepth(40); } });
    } });
  }

  perdi(o) {
    o.stato = 'perso';
    o.img.setVisible(false);
    if (this.ombrelloni.every((u) => u.stato === 'perso')) this.time.delayedCall(400, () => this.termina());
  }

  // --- munizioni del Generale ---
  lanciaCassa() {
    const img = im(this, GEN.x + 14, 196, 'cassaMunizioni', 1).setDepth(64);
    const x = Phaser.Math.Between(118, 196), y = Phaser.Math.Between(240, 258);
    this.cassa = { img, pronta: false };
    this.espr('felice', 0.8);
    this.parla(caso(this.cfg.frasiCassa), 900);
    Audio.sfx('lancio');
    this.tweens.add({ targets: img, x, duration: 520 });
    this.tweens.add({ targets: img, y: 168, duration: 260, ease: 'Quad.out', yoyo: false, onComplete: () => this.tweens.add({ targets: img, y, duration: 260, ease: 'Quad.in', onComplete: () => { this.cassa.pronta = true; Audio.sfx('tonfo'); } }) });
    this.tweens.add({ targets: img, angle: 360, duration: 520 });
  }

  prendiCassa() {
    if (!this.inCorso || !this.cassa?.pronta) return;
    const img = this.cassa.img;
    this.cassa = null;
    this.tCassa = this.cfg.cassaOgni;
    this.colpi = Math.min(this.cfg.colpiMax, this.colpi + this.cfg.colpiCassa);
    this.aggiornaColpi();
    Audio.sfx('ricarica');
    scritta(this, img.x, img.y - 10, '+' + this.cfg.colpiCassa, { size: 9, color: '#ffe14a', durata: 300 });
    this.tweens.add({ targets: img, x: PERNO.x, y: PERNO.y + 8, scale: img.scale * 0.4, alpha: 0, duration: 260, onComplete: () => img.destroy() });
  }

  aggiorna(dt, p) {
    const c = this.cfg, f = {};
    for (const k in c.inizio) f[k] = lerp(c.inizio[k], c.fine[k], p);

    // mira con la tastiera
    const t = this.tasti, vx = (t.dx.isDown || t.d.isDown) - (t.sx.isDown || t.a.isDown), vy = (t.giu.isDown || t.s.isDown) - (t.su.isDown || t.w.isDown);
    if (vx || vy) this.punta({ x: this.mira.x + vx * c.velMira * dt, y: this.mira.y + vy * c.velMira * dt * 0.7 });
    this.mirino.setPosition(this.mira.x, this.mira.y).setScale(0.55 + 0.45 * prosp(this.mira.y));

    // la canna segue il mirino, e rincula dopo il colpo
    const ang = Math.atan2(this.mira.y - PERNO.y, this.mira.x - PERNO.x);
    this.rinculo = Math.max(0, this.rinculo - dt * 5);
    this.canna.setRotation(ang).setPosition(PERNO.x - Math.cos(ang) * 4 * this.rinculo, PERNO.y - Math.sin(ang) * 4 * this.rinculo);

    // palle in volo
    for (const pl of this.palle) {
      pl.t += dt;
      const u = Math.min(1, pl.t / pl.T);
      pl.img.setPosition(lerp(pl.x0, pl.x1, u), lerp(pl.y0, pl.y1, u) - Math.sin(u * Math.PI) * pl.arco).setScale(scalaDi('palla', 1.6 * lerp(1, prosp(pl.y1), u)));
      if (u >= 1) { pl.img.destroy(); pl.fatta = true; this.impatto(pl); }
    }
    this.palle = this.palle.filter((pl) => !pl.fatta);

    // munizioni: la cassa del Generale e il colpo che arriva da solo
    this.tLenta -= dt;
    if (this.tLenta <= 0) { this.tLenta = c.ricaricaLenta; if (this.colpi < c.colpiMax) { this.colpi++; this.aggiornaColpi(); } }
    if (!this.cassa) { this.tCassa -= dt; if (this.tCassa <= 0) this.lanciaCassa(); }

    // nuove bagnarole
    this.tBarca -= dt;
    const inArrivo = this.barche.filter((b) => b.stato === 'arriva').length;
    if (this.tBarca <= 0 && inArrivo < Math.round(f.maxBarche)) { this.nuovaBarca(f); this.tBarca = f.intervallo * (0.8 + Math.random() * 0.4); }

    for (const b of this.barche) {
      if (b.stato === 'giu') continue;
      const s = prosp(b.y);
      if (b.stato === 'arriva') { b.y += b.vel * s * dt; if (b.y >= RIVA) { b.y = RIVA; this.aRiva(b); } }
      else if (b.stato === 'ferma') { b.tFerma -= dt; if (b.tFerma <= 0) { b.stato = 'fugge'; b.xFuga = b.img.x; b.img.setFlipX(true); } }
      else if (b.stato === 'fugge') {
        b.y -= b.vel * 1.35 * s * dt;
        if (b.y <= O + 3) { b.stato = 'giu'; b.img.destroy(); if (b.bottino) this.perdi(b.bottino); }
      }
      if (b.stato !== 'giu') this.posiziona(b, dt);
    }
    this.barche = this.barche.filter((b) => b.stato !== 'giu' || b.img.active);

    // il Generale
    if (this.tEspr > 0) { this.tEspr -= dt; if (this.tEspr <= 0) this.gen.setTexture('generale_normale'); }
    this.tFrase -= dt;
    if (this.tFrase <= 0) { this.tFrase = 5 + Math.random() * 3; this.parla(caso(c.frasi)); }
  }

  salvati() { return this.ombrelloni.filter((o) => o.stato === 'su' || o.stato === 'torna').length; }

  risultato() {
    const n = this.salvati();
    return {
      punteggio: Math.max(0, this.punti + n * this.cfg.puntiOmbrellone),
      vittoria: n >= this.cfg.obiettivoOmbrelloni,
      riepilogo: `${this.affondate} bagnarole affondate, ${n} ombrelloni salvati su 5`,
      titoloFine: n ? 'TEMPO!' : 'SPIAGGIA PERSA!',
    };
  }

  finale(ris, fatto) {
    for (const o of [...this.hud, this.mirino, ...this.palle.map((pl) => pl.img)]) o.setVisible(false);
    this.cassa?.img.setVisible(false);
    this.fumGen?.destroy();
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.7, duration: 300 });
    this.gen.setDepth(701).setTexture(ris.vittoria ? 'generale_felice' : 'generale_shock');
    this.tweens.add({ targets: this.gen, x: 240, y: 290, scale: scalaDi('generale_normale', 1.35), duration: 400, ease: 'Back.out' });
    this.time.delayedCall(700, () => {
      if (ris.vittoria) {
        txt(this, 240, 26, 'MISSIONE COMPIUTA!', { size: 18, color: '#7dff9a', depth: 710 });
        Audio.sfx('fischietto');
        const n = this.salvati();
        for (let i = 0; i < n; i++) {
          const o = im(this, 240 - (n - 1) * 26 + i * 52, 96, 'ombrellone', 1).setOrigin(0.5, 1).setDepth(702).setScale(0);
          this.tweens.add({ targets: o, scale: scalaDi('ombrellone', 1), delay: i * 140, duration: 260, ease: 'Back.out', onComplete: () => stelle(this, o.x, 76, 4, 703) });
        }
        this.time.delayedCall(500, () => fumetto(this, 300, 150, 'Riposo, soldato!', 1800, 712));
      } else {
        txt(this, 240, 26, 'RITIRATA!', { size: 18, color: '#ff6b5a', depth: 710 });
        Audio.sfx('rubato');
        this.tweens.add({ targets: this.gen, angle: { from: -3, to: 3 }, duration: 160, yoyo: true, repeat: 5 });
        const b = im(this, -40, 110, 'barca_galeone', 1.1).setOrigin(0.5, 1).setDepth(702);
        const o = im(this, -40, 80, 'ombrellone', 0.7).setOrigin(0.5, 1).setDepth(703);
        this.tweens.add({ targets: [b, o], x: 520, duration: 2200, ease: 'Sine.inOut' });
        this.time.delayedCall(300, () => fumetto(this, 300, 150, 'Ci rivedremo, pirati!', 1800, 712));
      }
    });
    this.time.delayedCall(3300, fatto);
  }
}
