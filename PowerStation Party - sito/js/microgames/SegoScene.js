// Microgioco 6: "Sego, sono sotto casa!" - fai uscire Franci di casa coi fumogeni colorati.
//
//  Si mira e si lancia ad arco: il fumogeno vola verso la facciata e la tocca nel
//  punto mirato. Da una finestra aperta entra e la stanza si riempie di fumo, che
//  passa piano alle stanze accanto e si dirada col tempo. Sul muro o sulle persiane
//  chiuse rimbalza nel cortile: fumo sprecato che copre la vista per un po'.
//  Le finestre sbattono col vento e Franci le chiude. All'80% di fumo esce.
//  Comandi: mouse (punta, tieni premuto: la forza sale e scende, rilascia),
//  tastiera (frecce + SPAZIO tenuto), dito (fionda: tira indietro e lascia).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { CASA } from '../grafica/sfondi.js';
import { RES } from '../grafica/base.js';
import { txt, im, scalaDi, scritta, fumo, pannello, lerp, caso, colpetto, fumetto, vibra, eTouch } from '../fx.js';

const MANO = { x: 240, y: 240 };          // da dove parte il fumogeno
const Y_BASSO = 230, Y_ALTO = 34;          // forza 0 = piede della casa, forza 1 = sotto il tetto
const X_MIN = 96, X_MAX = 384;             // il mirino resta sulla facciata
const COLORI = [0xff4a5a, 0xffc93a, 0x4ad97a, 0x4aa8ff, 0xb06aff, 0xff8a3a];
const TAGLIA_FRANCI = 0.43;                // Franci affacciato: testa e spalle nel vano della finestra
const CROP_FRANCI = 82.5;                  // unità del personaggio mostrate (dall'alto, su 144)

export class SegoScene extends MicrogiocoBase {
  constructor() { super('sego'); }

  prepara() {
    const c = this.cfg;
    this.punti = 0;
    this.lanciate = 0;
    this.centrate = 0;
    this.voli = [];
    this.uscito = false;
    this.mira = 240;
    this.carica = null;     // mouse/tastiera: { t0 } da quando si tiene premuto
    this.fionda = null;     // dito: { id, ax, ay, x, y }
    this.tRicarica = 0;
    this.tVento = c.ventoInizio;
    this.tChiude = c.franciInizio;
    this.tMuovi = 2.5;
    this.tFrase = 3;

    im(this, 0, 0, 'bgCortile').setOrigin(0);
    // le 12 stanze: interno, Franci, fumo, finestra con le persiane
    const aperte = new Set(Phaser.Utils.Array.Shuffle([...Array(12).keys()]).slice(0, c.aperteInizio));
    this.stanze = [];
    CASA.righe.forEach((y, r) => CASA.colonne.forEach((x, k) => {
      const s = {
        i: this.stanze.length, r, k, x, y, aperta: false, fumo: 0, colore: 0xffffff, tSbuffo: 0,
        velo: this.add.rectangle(x, y, CASA.w, CASA.h, 0xffffff, 0).setDepth(4),
        img: im(this, x, y, 'finestraChiusa').setDepth(5),
      };
      this.add.rectangle(x, y, CASA.w, CASA.h, 0x2e2220).setDepth(2);
      this.add.ellipse(x + 6, y - 5, 18, 14, 0xffd890, 0.16).setDepth(2);
      this.stanze.push(s);
    }));
    for (const s of this.stanze) this.apri(s, aperte.has(s.i), true);
    this.vicine = this.stanze.map((s) => this.stanze.filter((n) => Math.abs(n.r - s.r) + Math.abs(n.k - s.k) === 1));

    // Franci: si vede solo quando la finestra della sua stanza è aperta
    this.franci = { stanza: this.stanze.find((s) => s.aperta), espr: 'normale', tosse: false };
    this.franciImg = im(this, 0, 0, 'sego_normale', TAGLIA_FRANCI).setOrigin(0.5, 0).setDepth(3).setCrop(0, 0, 96 * RES, CROP_FRANCI * RES);
    this.mostraFranci();

    // la mia postazione: la cassetta e il fumogeno in mano
    im(this, 52, 270, 'cassaFumogeni').setOrigin(0.5, 1).setDepth(55);
    this.manoMia = im(this, MANO.x + 4, 274, 'manoMia', 0.85).setOrigin(0.5, 1).setDepth(55);
    this.colore = caso(COLORI);
    this.inMano = im(this, MANO.x, MANO.y, 'granata').setTint(this.colore).setDepth(56);
    this.gMira = this.add.graphics().setDepth(70);

    // HUD: quanto fumo c'è in casa, con la tacca della soglia
    this.hudSego = [pannello(this, 240, 27, 196, 24, { depth: 1000 })];
    this.barraFumo = this.add.graphics().setDepth(1001);
    this.testoFumo = txt(this, 240, 21, '', { size: 8, depth: 1002 });
    this.hudSego.push(this.barraFumo, this.testoFumo);
    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });
    this.testoGranate = txt(this, 474, 49, '', { ox: 1, depth: 1001, size: 8, color: '#ffe14a' });

    // comandi
    this.tasti = this.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT' });
    this.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) this.inizia(); });
    this.input.keyboard.on('keyup-SPACE', () => this.rilascia());
    const mondo = (p) => this.cameras.main.getWorldPoint(p.x, p.y);
    const limita = (x) => Phaser.Math.Clamp(x, X_MIN, X_MAX);
    this.input.on('pointerdown', (p) => {
      const w = mondo(p);
      if (p.wasTouch) { if (!this.fionda) this.fionda = { id: p.id, ax: w.x, ay: w.y, x: w.x, y: w.y }; }
      else if (p.leftButtonDown()) { this.mira = limita(w.x); this.inizia(); }
    });
    this.input.on('pointermove', (p) => {
      const w = mondo(p);
      if (!p.wasTouch) this.mira = limita(w.x);
      else if (this.fionda?.id === p.id) Object.assign(this.fionda, { x: w.x, y: w.y });
    });
    this.input.on('pointerup', (p) => {
      if (!p.wasTouch) return this.rilascia();
      if (this.fionda?.id !== p.id) return;
      const t = this.tiroFionda(this.fionda);
      this.fionda = null;
      if (t) this.lancia(t.x, t.forza);
    });
  }

  // --- finestre ---
  apri(s, aperta, subito = false) {
    s.aperta = aperta;
    s.img.setTexture(aperta ? 'finestraAperta' : 'finestraChiusa');
    if (!subito) {
      colpetto(this, s.img, 1.08, 0.94);
      Audio.sfx(aperta ? 'muovi' : 'sbam');
      if (!aperta) scritta(this, s.x, s.y - 26, 'SBAM!', { size: 8, color: '#ffffff', durata: 300 });
    }
    if (this.franci?.stanza === s) this.mostraFranci();
  }

  stanzaIn(x, y) {
    const t = this.cfg.tolleranza;
    return this.stanze.find((s) => Math.abs(x - s.x) <= CASA.w / 2 + t && Math.abs(y - s.y) <= CASA.h / 2 + t);
  }

  get percentuale() { return (this.stanze.reduce((n, s) => n + s.fumo, 0) / this.stanze.length) * 100; }

  // --- Franci ---
  mostraFranci(espr) {
    const s = this.franci.stanza;
    if (espr) this.franci.espr = espr;
    this.franciImg.setTexture('sego_' + this.franci.espr).setPosition(s.x, s.y - CASA.h / 2 + 1).setVisible(s.aperta);
  }

  // gira per casa: va nella stanza con meno fumo tra alcune a caso
  sposta() {
    const scelte = Phaser.Utils.Array.Shuffle(this.stanze.filter((s) => s !== this.franci.stanza)).slice(0, 4);
    this.franci.stanza = scelte.sort((a, b) => a.fumo - b.fumo)[0];
    this.mostraFranci(this.franci.stanza.fumo > 0.3 ? 'triste' : caso(['normale', 'normale', 'felice', 'sufficienza']));
  }

  tossisce(colpito) {
    const c = this.cfg, s = this.franci.stanza;
    this.franci.tosse = true;
    Audio.sfx('tosse');
    this.mostraFranci('shock');
    if (s.aperta) fumetto(this, s.x + 18, s.y - 30, caso(c.frasiTosse), 900, 80);
    else if (colpito) scritta(this, s.x, s.y - 30, 'COF COF!', { size: 9, color: '#ffffff' });
    this.time.delayedCall(800, () => { this.franci.tosse = false; if (this.inCorso) this.sposta(); });
  }

  // --- lancio ---
  forza() {
    const f = ((this.trascorso - this.carica.t0) / this.cfg.periodoForza) % 1;   // sale e scende
    return f < 0.5 ? f * 2 : 2 - f * 2;
  }

  inizia() { if (this.inCorso && !this.carica) this.carica = { t0: this.trascorso }; }

  rilascia() {
    if (!this.carica) return;
    const f = this.forza();
    this.carica = null;
    this.lancia(this.mira, f);
  }

  // fionda: si tira indietro, il tiro va dalla parte opposta; più giù = più in alto
  tiroFionda(f) {
    const dx = f.x - f.ax, dy = f.y - f.ay;
    if (Math.hypot(dx, dy) < 8) return null;
    return { x: Phaser.Math.Clamp(MANO.x - dx * 2.2, X_MIN, X_MAX), forza: Phaser.Math.Clamp(dy / 70, 0, 1) };
  }

  // posizione lungo il volo (e da 0 a 1): un arco verso la facciata, rimpicciolendo
  volo(P, forza, e) {
    const arco = 40 + 70 * forza;
    return { x: lerp(MANO.x, P.x, e), y: lerp(MANO.y, P.y, e) - arco * 4 * e * (1 - e), s: lerp(1, 0.42, e) };
  }

  lancia(px, forza) {
    if (!this.inCorso) return;
    if (this.tRicarica > 0) { scritta(this, MANO.x, MANO.y - 26, 'ASPETTA!', { size: 7, color: '#ffe14a', durata: 250 }); return; }
    const c = this.cfg, P = { x: px, y: lerp(Y_BASSO, Y_ALTO, forza) };
    this.tRicarica = c.ricarica;
    this.lanciate++;
    const g = im(this, MANO.x, MANO.y, 'granata').setTint(this.colore).setDepth(50);
    this.voli.push({ g, P, forza, colore: this.colore, t: 0, T: 0.55 + 0.35 * forza, scia: 0, scala: g.scaleX });
    this.colore = caso(COLORI);
    this.inMano.setVisible(false).setTint(this.colore);
    this.tweens.add({ targets: this.manoMia, y: 266, angle: -14, duration: 90, yoyo: true });
    Audio.sfx('lancioGranata');
  }

  aggiorna(dt, p) {
    const c = this.cfg;
    // mirino da tastiera
    const dir = (this.tasti.dx.isDown ? 1 : 0) - (this.tasti.sx.isDown ? 1 : 0);
    if (dir) this.mira = Phaser.Math.Clamp(this.mira + dir * c.velMira * dt, X_MIN, X_MAX);
    // fumogeno successivo
    if (this.tRicarica > 0) {
      this.tRicarica -= dt;
      if (this.tRicarica <= 0) { this.inMano.setVisible(true); colpetto(this, this.inMano, 1.4, 1.4); }
    }
    this.voliInCorso(dt);
    this.fumoInCasa(dt, p);
    this.casa(dt, p);
    this.disegnaMira();

    const pct = Math.floor(this.percentuale), hud = `${pct}|${this.punti}|${this.lanciate}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoFumo.setText(`FUMO IN CASA: ${pct}%`);
      const g = this.barraFumo, w = 176;
      g.clear();
      g.fillStyle(0x000000, 0.45); g.fillRoundedRect(152, 30, w, 6, 3);
      g.fillStyle(pct >= c.soglia ? 0x7dff9a : 0xb06aff, 1);
      if (pct > 2) g.fillRoundedRect(152, 30, (w * Math.min(100, pct)) / 100, 6, 3);
      g.fillStyle(0xffe14a, 1); g.fillRect(152 + (w * c.soglia) / 100 - 0.75, 28, 1.5, 10);
      this.testoPunti.setText('PUNTI: ' + this.punti);
      this.testoGranate.setText('FUMOGENI: ' + this.lanciate);
    }
    if (!this.uscito && this.percentuale >= c.soglia) {
      this.uscito = true;
      this.secondiRimasti = Math.ceil(this.tempoRimasto);
      this.termina();
    }
  }

  voliInCorso(dt) {
    for (const v of this.voli) {
      v.t += dt;
      const e = Math.min(1, v.t / v.T), q = this.volo(v.P, v.forza, e);
      v.g.setPosition(q.x, q.y).setScale(v.scala * q.s).setAngle(v.g.angle + 600 * dt);
      v.scia -= dt;
      if (v.scia <= 0) {
        v.scia = 0.04;
        const f = im(this, q.x, q.y, 'fumo', 0.3 * q.s).setTint(v.colore).setAlpha(0.6).setDepth(49);
        this.tweens.add({ targets: f, alpha: 0, scale: f.scale * 2.2, duration: 500, onComplete: () => f.destroy() });
      }
      if (e >= 1) { v.fatto = true; this.impatto(v); }
    }
    this.voli = this.voli.filter((v) => !v.fatto);
  }

  impatto(v) {
    const c = this.cfg, P = v.P, s = this.stanzaIn(P.x, P.y);
    if (s?.aperta) return this.entra(v, s);
    // muro o persiane chiuse: rimbalza e cade nel cortile
    this.punti -= c.malusSprecato;
    Audio.sfx(s ? 'tonk' : 'tonfo');
    vibra(25);
    scritta(this, P.x, P.y - 12, s ? 'TONK!' : caso(['MURO!', 'TUNF!']), { size: 9, color: '#ff9a8a', durata: 350 });
    const g = v.g, xa = Phaser.Math.Clamp(P.x + Phaser.Math.Between(-30, 30), 60, 420);
    this.tweens.add({
      targets: g, x: xa, y: 238, angle: g.angle + 300, duration: 450 + (238 - P.y) * 1.2, ease: 'Bounce.out',
      onComplete: () => { g.destroy(); if (this.inCorso) this.nebbia(xa, v.colore); },
    });
  }

  entra(v, s) {
    const c = this.cfg, colpito = this.franci.stanza === s;
    this.centrate++;
    this.punti += colpito ? c.puntiFranci : c.puntiFinestra;
    s.fumo = Math.min(1, s.fumo + c.fumoGranata);
    s.colore = v.colore;
    for (const n of this.vicine[s.i]) { n.fumo = Math.min(1, n.fumo + c.fumoVicine); if (n.fumo < 0.2) n.colore = v.colore; }
    v.g.destroy();
    Audio.sfx('fumata');
    fumo(this, s.x, s.y, 8, 6, v.colore);
    scritta(this, s.x, s.y - 28, colpito ? `COLPITO! +${c.puntiFranci}` : `PAF! +${c.puntiFinestra}`, { size: 9, color: '#7dff9a', durata: 400 });
    if (colpito) this.tossisce(true);
  }

  // fumo sprecato: una nuvola colorata nel cortile che copre la parte bassa della casa
  nebbia(x, colore) {
    const d = this.cfg.nebbia * 1000;
    Audio.sfx('fumata');
    for (let i = 0; i < 6; i++) {
      const f = im(this, x + Phaser.Math.Between(-45, 45), 222 + Phaser.Math.Between(-12, 8), 'fumo', 2.5 + Math.random() * 1.5).setTint(colore).setAlpha(0).setDepth(60);
      this.tweens.add({ targets: f, alpha: 0.85, duration: 250 });
      this.tweens.add({ targets: f, y: f.y - 30 - Math.random() * 30, scale: f.scale * 1.4, duration: d, ease: 'Sine.out' });
      this.tweens.add({ targets: f, alpha: 0, delay: d * 0.6, duration: d * 0.4, onComplete: () => f.destroy() });
    }
  }

  // il fumo passa alle stanze vicine, si dirada (di più con la finestra aperta) ed esce a sbuffi
  fumoInCasa(dt, p) {
    const c = this.cfg, k = lerp(c.diradaInizio, c.diradaFine, p);
    const nuovo = this.stanze.map((s) => s.fumo);
    for (const s of this.stanze) for (const n of this.vicine[s.i]) if (n.i > s.i) {
      const flusso = (s.fumo - n.fumo) * c.passaggio * dt;
      nuovo[s.i] -= flusso;
      nuovo[n.i] += flusso;
      if (flusso > 0 && n.fumo < 0.15) n.colore = s.colore; else if (flusso < 0 && s.fumo < 0.15) s.colore = n.colore;
    }
    for (const s of this.stanze) {
      s.fumo = Phaser.Math.Clamp(nuovo[s.i] * (1 - k * (s.aperta ? c.diradaAperta : 1) * dt), 0, 1);
      s.velo.setFillStyle(s.colore, s.fumo * 0.85);
      s.tSbuffo -= dt;
      if (s.fumo > 0.08 && s.tSbuffo <= 0) {
        s.tSbuffo = (s.aperta ? 0.45 : 1.1) / (0.3 + s.fumo);
        const f = im(this, s.x + Phaser.Math.Between(-10, 10), s.y - (s.aperta ? 14 : 2), 'fumo', 0.5 + s.fumo).setTint(s.colore).setAlpha(s.aperta ? 0.8 : 0.4).setDepth(6);
        this.tweens.add({ targets: f, y: f.y - 30 - Math.random() * 20, x: f.x + Phaser.Math.Between(-12, 12), scale: f.scale * 2, alpha: 0, duration: 1300, onComplete: () => f.destroy() });
      }
    }
  }

  // finestre che sbattono, Franci che gira, chiude e tossisce
  casa(dt, p) {
    const c = this.cfg, F = this.franci;
    this.tVento -= dt;
    if (this.tVento <= 0) {
      this.tVento = lerp(c.ventoInizio, c.ventoFine, p) * Phaser.Math.FloatBetween(0.8, 1.2);
      const aperte = this.stanze.filter((s) => s.aperta), chiuse = this.stanze.filter((s) => !s.aperta);
      if (aperte.length > 4 && (Math.random() < 0.5 || !chiuse.length)) this.apri(caso(aperte), false);
      else if (chiuse.length) this.apri(caso(chiuse), true);
    }
    this.tMuovi -= dt;
    if (this.tMuovi <= 0 && !F.tosse) { this.tMuovi = Phaser.Math.FloatBetween(2.2, 3.8); this.sposta(); }
    this.tChiude -= dt;
    if (this.tChiude <= 0 && !F.tosse) {
      this.tChiude = lerp(c.franciInizio, c.franciFine, p) * Phaser.Math.FloatBetween(0.8, 1.2);
      const aperte = this.stanze.filter((s) => s.aperta);
      const bersaglio = aperte.sort((a, b) => b.fumo - a.fumo)[0];
      if (bersaglio && aperte.length > 3) {
        F.stanza = bersaglio;
        this.mostraFranci('sufficienza');
        fumetto(this, bersaglio.x + 18, bersaglio.y - 30, caso(c.frasiChiude), 800, 80);
        this.time.delayedCall(650, () => { if (this.inCorso && F.stanza === bersaglio && bersaglio.aperta) this.apri(bersaglio, false); });
      }
    }
    if (F.stanza.fumo > 0.45 && !F.tosse) this.tossisce(false);
    this.franciImg.y = F.stanza.y - CASA.h / 2 + 1 + Math.sin(this.trascorso * 3) * 1;
    this.tFrase -= dt;
    if (this.tFrase <= 0) {
      this.tFrase = 5 + Math.random() * 3;
      if (F.stanza.aperta && !F.tosse) fumetto(this, F.stanza.x + 18, F.stanza.y - 30, caso(c.frasi), 1000, 80);
    }
  }

  // traiettoria tratteggiata, mirino colorato (verde = finestra aperta) e barra della forza
  disegnaMira() {
    const g = this.gMira;
    g.clear();
    const t = this.fionda ? this.tiroFionda(this.fionda) : this.carica ? { x: this.mira, forza: this.forza() } : null;
    if (!t) {
      if (eTouch()) return;   // col dito si mira con la fionda: la guida del mouse non serve
      g.fillStyle(0xffffff, 0.4);
      for (let y = Y_ALTO; y < Y_BASSO; y += 9) g.fillRect(this.mira - 0.5, y, 1, 4);
      return;
    }
    const P = { x: t.x, y: lerp(Y_BASSO, Y_ALTO, t.forza) }, s = this.stanzaIn(P.x, P.y);
    const col = s ? (s.aperta ? 0x7dff9a : 0xff6b5a) : 0xd8d8d8;
    for (let i = 1; i < 18; i++) {
      const q = this.volo(P, t.forza, i / 18);
      g.fillStyle(0x1f1430, 0.6); g.fillCircle(q.x, q.y, 1.9 * q.s + 0.4);
      g.fillStyle(0xffffff, 0.95); g.fillCircle(q.x, q.y, 1.3 * q.s + 0.2);
    }
    g.lineStyle(3, 0x1f1430, 0.7); g.strokeCircle(P.x, P.y, 7);
    g.lineStyle(1.6, col, 1); g.strokeCircle(P.x, P.y, 7);
    g.lineBetween(P.x - 11, P.y, P.x - 4, P.y); g.lineBetween(P.x + 4, P.y, P.x + 11, P.y);
    g.lineBetween(P.x, P.y - 11, P.x, P.y - 4); g.lineBetween(P.x, P.y + 4, P.x, P.y + 11);
    g.fillStyle(0x1f1430, 0.8); g.fillRoundedRect(MANO.x + 20, 194, 8, 50, 3);
    g.fillStyle(col, 1); if (t.forza > 0.06) g.fillRoundedRect(MANO.x + 21.5, 242.5 - 47 * t.forza, 5, 47 * t.forza, 2);
  }

  risultato() {
    const c = this.cfg, pct = Math.floor(this.percentuale);
    const bonus = this.uscito ? c.bonusUscita + c.bonusSecondo * this.secondiRimasti : Math.floor(pct / 2);
    return {
      punteggio: Math.max(0, this.punti + bonus),
      vittoria: this.uscito,
      riepilogo: this.uscito
        ? `Uscito con ${this.secondiRimasti}s di anticipo! A segno: ${this.centrate}/${this.lanciate}`
        : `Fumo in casa: ${pct}%   A segno: ${this.centrate}/${this.lanciate}`,
      titoloFine: this.uscito ? 'È USCITO!' : 'TEMPO!',
    };
  }

  // Franci esce dal portone nel fumo, oppure si affaccia tranquillo
  finale(ris, fatto) {
    for (const v of this.voli) v.g.destroy();
    this.voli = [];
    this.carica = this.fionda = null;
    this.gMira.clear();
    for (const o of [this.inMano, this.manoMia, ...this.hudSego]) o.setVisible(false);
    Audio.sfx('tempo');
    const titolo = (s, col) => txt(this, 240, 24, s, { size: 18, color: col, depth: 710 });
    if (ris.vittoria) {
      const P = CASA.porta;
      this.franciImg.setVisible(false);
      this.time.delayedCall(400, () => {
        Audio.sfx('porta');
        titolo('È USCITO!', '#7dff9a');
        im(this, P.x - P.w / 2 - 12, P.y - P.h - 2, 'portoneAperto').setOrigin(0).setDepth(7);
        for (let i = 0; i < 18; i++) this.time.delayedCall(i * 70, () => fumo(this, P.x + Phaser.Math.Between(-16, 16), P.y - 18, 2, 8, caso(COLORI)));
        const f = im(this, P.x, P.y, 'sego_shock', 0.4).setOrigin(0.5, 1).setDepth(9);
        this.tweens.add({
          targets: f, y: 268, scale: scalaDi('sego_shock', 1.2), delay: 300, duration: 1100, ease: 'Quad.in',
          onUpdate: () => { if (Math.random() < 0.3) fumo(this, f.x + Phaser.Math.Between(-20, 20), f.y - 40, 1, 10, caso(COLORI)); },
          onComplete: () => {
            Audio.sfx('tosse');
            scritta(this, 240, 92, 'COF COF!', { size: 16, color: '#ffffff', depth: 711 });
            this.time.delayedCall(700, () => { f.setTexture('sego_felice'); fumetto(this, 316, 74, caso(['Arrivo, arrivo!', 'Eccomi! Che fretta...', 'Ok, ok, scendo!']), 1800, 712); });
          },
        });
      });
    } else {
      // si affaccia tranquillo dalla finestra in alto
      const s = this.stanze[1];
      this.franci.stanza = s;
      if (!s.aperta) this.apri(s, true);
      this.mostraFranci('sufficienza');
      this.time.delayedCall(500, () => {
        titolo('NON SI MUOVE!', '#ff6b5a');
        Audio.sfx('tsk');
        fumetto(this, s.x + 40, s.y - 30, 'Scendo tra cinque minuti...', 2200, 712);
        this.tweens.add({ targets: this.franciImg, y: this.franciImg.y + 2, duration: 300, yoyo: true, repeat: 4 });
      });
    }
    this.time.delayedCall(3800, fatto);
  }
}
