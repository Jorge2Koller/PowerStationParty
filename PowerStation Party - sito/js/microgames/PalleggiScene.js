// Microgioco 9: "MaraZio" - palleggi contro lo Zio.
//
//  Il pallone sale e scende con la gravità: bisogna mettersi sotto e calciare
//  quando arriva al piede. Il colpo dipende dal tempo e dalla distanza:
//  perfetto (sale dritto), buono (scappa un po'), scarso (scappa tanto).
//  Se cade a terra la serie riparte. Accanto, lo Zio palleggia senza sbagliare
//  mai, e ci tiene a farlo sapere.
//  Tutti e due palleggiano col piede: a ogni colpo la gamba si alza di lato in due tempi
//  (texture "id_calcio1D/2D" e "S" per la sinistra, create in sprites.js).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { PARCO } from '../grafica/sfondi.js';
import { txt, im, scalaDi, scritta, stelle, pannello, lerp, caso, quanti, fumetto, vibra, eTouch, multiTouch } from '../fx.js';

const TERRA = PARCO.terra;
const Y_PIEDE = TERRA - 12;                 // altezza del pallone quando lo colpisci
const R_PALLA = 5.4;
const X_MIN = 40, X_MAX = 292;              // dove può andare il giocatore
const BORDO = [26, 318];                    // il pallone rimbalza qui (oltre c'è lo Zio)
const ZIO = { x: 392, periodo: 0.95, alto: 92, lato: 16 };   // lato: il pallone cade sul suo piede destro
const migliaia = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const TAGLIA = 0.58;
const PULSANTE = { x: 436, y: 236, r: 23 };

export class PalleggiScene extends MicrogiocoBase {
  constructor() { super('palleggi'); }

  prepara() {
    this.palleggi = 0;
    this.perfetti = 0;
    this.serie = 0;
    this.serieMigliore = 0;
    this.punti = 0;
    this.cadute = 0;
    this.x = 150;
    this.obiettivoX = 150;
    this.modo = 'tastiera';
    this.ricarica = 0;
    this.tCalcio = 0;
    this.latoCalcio = 'D';    // con che gamba si calcia: quella dalla parte del pallone
    this.tFrase = 3;
    this.contaZio = 4312;
    this.tZio = 0;
    this.giriZio = 0;
    // (la scena viene riusata da una partita all'altra: si azzera anche quello che resta in memoria)
    this.dito = null;
    this.tEsprIo = 0;
    this.tEsprZio = 0;

    im(this, 0, 0, 'bgParco').setOrigin(0);
    this.ombra = this.add.ellipse(this.x, TERRA + 1, 34, 6, 0x000000, 0.22).setDepth(5);
    this.io = im(this, this.x, TERRA + 2, `${this.giocatore.id}_normale`, TAGLIA).setOrigin(0.5, 1).setDepth(10);
    this.zio = im(this, ZIO.x, TERRA + 2, 'zio_normale', TAGLIA).setOrigin(0.5, 1).setDepth(10);
    this.add.ellipse(ZIO.x, TERRA + 1, 34, 6, 0x000000, 0.22).setDepth(5);
    this.pallaZio = im(this, ZIO.x + ZIO.lato, Y_PIEDE, 'pallone', 1).setDepth(12);
    this.ombraPalla = this.add.ellipse(this.x, TERRA + 1, 10, 3, 0x000000, 0.2).setDepth(6);
    this.palla = im(this, this.x, 120, 'pallone', 1).setDepth(12);
    this.scia = this.add.graphics().setDepth(11);

    // contatori
    this.hud = [pannello(this, 240, 36, 120, 30, { depth: 1000 })];
    this.testoPalleggi = txt(this, 240, 31, '0', { size: 14, depth: 1001 });
    this.testoSerie = txt(this, 240, 45, 'SERIE MIGLIORE: 0', { size: 5.5, depth: 1001, color: '#ffe14a' });
    this.testoZio = txt(this, ZIO.x, 122, 'ZIO: 4.312', { size: 7, depth: 1001, color: '#ffffff' });
    this.hud.push(this.testoPalleggi, this.testoSerie, this.testoZio);

    // comandi
    this.tasti = this.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT', a: 'A', d: 'D' });
    this.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) this.calcia(); });
    const mondo = (p) => this.cameras.main.getWorldPoint(p.x, p.y);
    if (eTouch()) {
      multiTouch(this, 3);
      const g = this.add.graphics().setDepth(1000);
      g.fillStyle(0x1f1430, 0.85).fillCircle(PULSANTE.x, PULSANTE.y, PULSANTE.r + 1.5);
      g.fillStyle(0xe8603a, 1).fillCircle(PULSANTE.x, PULSANTE.y, PULSANTE.r);
      g.fillStyle(0xffffff, 0.25).fillEllipse(PULSANTE.x, PULSANTE.y - 9, PULSANTE.r * 1.3, 9);
      this.hud.push(g, txt(this, PULSANTE.x, PULSANTE.y, 'CALCIA', { size: 7, depth: 1001 }));
    }
    this.input.on('pointerdown', (p) => {
      if (!this.inCorso) return;
      const w = mondo(p);
      if (p.wasTouch) {
        if (Math.hypot(w.x - PULSANTE.x, w.y - PULSANTE.y) < PULSANTE.r + 8) return this.calcia();
        if (this.dito == null) { this.dito = { id: p.id, x: w.x }; this.modo = 'dito'; this.obiettivoX = this.x; }
      } else if (p.leftButtonDown()) this.calcia();
    });
    this.input.on('pointermove', (p) => {
      const w = mondo(p);
      if (!p.wasTouch) { this.modo = 'mouse'; this.obiettivoX = Phaser.Math.Clamp(w.x, X_MIN, X_MAX); return; }
      if (this.dito?.id !== p.id) return;
      this.obiettivoX = Phaser.Math.Clamp(this.obiettivoX + (w.x - this.dito.x) * this.cfg.guadagnoDito, X_MIN, X_MAX);
      this.dito.x = w.x;
    });
    this.input.on('pointerup', (p) => { if (this.dito?.id === p.id) this.dito = null; });

    this.servi(0.9);
  }

  // dopo una pausa il dito che trascinava non c'è più (se no non si potrebbe più muoversi)
  alRientro() { this.dito = null; }

  // il pallone torna in mano: cade dall'alto sopra il giocatore
  servi(attesa = 0) {
    this.statoPalla = 'attesa';
    this.attesa = attesa;
    this.palla.setVisible(false);
    this.ombraPalla.setVisible(false);
  }

  zioParla(s, ms = 1300) {
    this.fumZio?.destroy();
    this.fumZio = fumetto(this, ZIO.x - 40, 100, s, ms, 800);
  }

  // mette a un personaggio la texture di una posa (solo se è cambiata)
  posa(img, id, nome) {
    const k = `${id}_${nome}`;
    if (img.texture.key !== k) img.setTexture(k);
  }

  calcia() {
    if (!this.inCorso || this.ricarica > 0 || this.tCalcio > 0) return;
    const c = this.cfg;
    this.tCalcio = 0.2;
    // la gamba dalla parte del pallone si alza, il corpo si piega dall'altra per stare in equilibrio
    const sinistra = this.palla.visible && this.palla.x < this.x;
    this.latoCalcio = sinistra ? 'S' : 'D';
    this.io.setAngle(sinistra ? 5 : -5);
    const dy = this.palla.y - Y_PIEDE, dx = Math.abs(this.palla.x - this.x);
    const inZona = this.statoPalla === 'volo' && this.vy > 0 && dy > -c.sopra && dy < c.sotto && dx < c.portata;
    if (!inZona) {
      this.ricarica = c.ricarica;
      Audio.sfx('vuotoCalcio');
      scritta(this, this.x, Y_PIEDE - 30, 'A VUOTO!', { size: 7, color: '#ffffff', durata: 250 });
      return;
    }
    const h = Math.abs(dy);
    const tipo = h < c.perfetto.altezza && dx < c.perfetto.distanza ? 'perfetto' : h < c.buono.altezza && dx < c.buono.distanza ? 'buono' : 'scarso';
    const [vy, vMin, vMax] = c.colpi[tipo];
    // di lato: verso il centro del campo se il colpo è buono, a caso se è scarso
    const verso = tipo === 'perfetto' ? Math.sign(166 - this.palla.x) : tipo === 'buono' && Math.random() < 0.6 ? Math.sign(166 - this.palla.x) : (Math.random() < 0.5 ? -1 : 1);
    this.vy = -vy;
    this.vx = verso * Phaser.Math.FloatBetween(vMin, vMax) + (this.palla.x - this.x) * 1.5;
    this.palleggi++;
    this.serie++;
    this.serieMigliore = Math.max(this.serieMigliore, this.serie);
    this.punti += c.puntiPalleggio + (tipo === 'perfetto' ? c.bonusPerfetto : 0);
    if (tipo === 'perfetto') this.perfetti++;
    Audio.sfx('calcio');
    if (tipo === 'perfetto') Audio.sfx('ding');
    vibra(tipo === 'perfetto' ? 25 : 15);
    const [scritto, col] = { perfetto: ['PERFETTO!', '#7dff9a'], buono: ['BUONO', '#ffe14a'], scarso: ['SCARSO...', '#ff9a5a'] }[tipo];
    scritta(this, this.palla.x, this.palla.y - 16, scritto, { size: 8, color: col, durata: 300 });
    if (tipo === 'perfetto') stelle(this, this.palla.x, this.palla.y, 4, 900);
    this.testoPalleggi.setText(String(this.serie));
    this.testoSerie.setText('SERIE MIGLIORE: ' + this.serieMigliore);
    if (this.serie > 0 && this.serie % 10 === 0) { Audio.sfx('bonus'); scritta(this, 240, 70, `${this.serie} DI FILA!`, { size: 12, color: '#7dff9a', durata: 600 }); }
  }

  caduta() {
    this.statoPalla = 'terra';
    this.attesa = 1.3;
    this.cadute++;
    if (this.serie >= 3) Audio.sfx('errore');
    this.serie = 0;
    this.testoPalleggi.setText('0');
    this.tEsprZio = 1.6;      // sguardo di sufficienza (le texture le sceglie aggiorna)
    this.zioParla(caso(this.cfg.frasiErrore), 1400);
    this.tEsprIo = 1.2;       // e io ci resto male
  }

  aggiorna(dt) {
    const c = this.cfg, t = this.tasti;
    this.ricarica = Math.max(0, this.ricarica - dt);

    // movimento del giocatore
    const dir = (t.dx.isDown || t.d.isDown) - (t.sx.isDown || t.a.isDown);
    if (dir) { this.modo = 'tastiera'; this.x += dir * c.velGiocatore * dt; }
    else if (this.modo !== 'tastiera') this.x += Phaser.Math.Clamp((this.obiettivoX - this.x) * 12, -c.velGiocatore, c.velGiocatore) * dt;
    this.x = Phaser.Math.Clamp(this.x, X_MIN, X_MAX);
    if (this.modo === 'tastiera') this.obiettivoX = this.x;
    this.io.x = this.x;
    this.ombra.x = this.x;
    if (this.tCalcio > 0) { this.tCalcio -= dt; if (this.tCalcio <= 0) this.io.setAngle(0); }
    if (this.tEsprIo > 0) this.tEsprIo -= dt;
    // la gamba che calcia: subito sul pallone (2), poi torna giù passando da metà altezza (1)
    this.posa(this.io, this.giocatore.id, this.tCalcio > 0.08 ? `calcio2${this.latoCalcio}` : this.tCalcio > 0 ? `calcio1${this.latoCalcio}` : this.tEsprIo > 0 ? 'triste' : 'normale');

    // il pallone
    if (this.statoPalla === 'attesa') {
      this.attesa -= dt;
      if (this.attesa <= 0) {
        this.statoPalla = 'volo';
        this.palla.setPosition(this.x + Phaser.Math.Between(-6, 6), 118).setVisible(true).setAlpha(1);
        this.ombraPalla.setVisible(true);
        this.vx = 0; this.vy = 0;
      }
    } else {
      this.vy += c.gravita * dt;
      let x = this.palla.x + this.vx * dt, y = this.palla.y + this.vy * dt;
      if (x < BORDO[0] || x > BORDO[1]) { this.vx = -this.vx * 0.6; x = Phaser.Math.Clamp(x, BORDO[0], BORDO[1]); }
      if (this.statoPalla === 'volo' && y > TERRA - R_PALLA) this.caduta();
      if (this.statoPalla === 'terra') {
        if (y > TERRA - R_PALLA) {
          y = TERRA - R_PALLA;
          if (Math.abs(this.vy) > 40) { this.vy = -this.vy * 0.45; this.vx *= 0.6; Audio.sfx('rimbalzo'); }
          else { this.vy = 0; this.vx *= 0.9; }
        }
        this.attesa -= dt;
        if (this.attesa <= 0) { this.tweens.add({ targets: this.palla, alpha: 0, duration: 120 }); this.servi(0.2); }
      }
      this.palla.setPosition(x, y).setAngle(this.palla.angle + this.vx * dt * 8);
      this.ombraPalla.setPosition(x, TERRA + 1).setScale(lerp(1, 0.4, Phaser.Math.Clamp((TERRA - y) / 140, 0, 1)));
    }

    // lo Zio: palleggia a tempo, sempre perfetto
    this.tZio += dt;
    const u = (this.tZio % ZIO.periodo) / ZIO.periodo, giro = Math.floor(this.tZio / ZIO.periodo);
    this.pallaZio.setPosition(ZIO.x + ZIO.lato, Y_PIEDE - 4 * ZIO.alto * u * (1 - u)).setAngle(u * 360);
    if (giro !== this.giriZio) {
      this.giriZio = giro;
      this.contaZio++;
      this.testoZio.setText('ZIO: ' + migliaia(this.contaZio));
      this.zio.setAngle(-4);
      this.time.delayedCall(120, () => this.zio.setAngle(0));
    }
    // la sua gamba destra si alza un attimo prima che il pallone arrivi (u = 0) e si riabbassa
    // subito dopo; se intanto mi guarda con sufficienza, palleggia lo stesso, a braccia conserte
    if (this.tEsprZio > 0) this.tEsprZio -= dt;
    const calcio = u > 0.95 || u < 0.07 ? 'calcio2D' : u > 0.87 || u < 0.15 ? 'calcio1D' : null;
    const aria = this.tEsprZio > 0 ? 'sufficienza' : 'normale';
    this.posa(this.zio, 'zio', calcio ? (aria === 'normale' ? calcio : `${calcio}_${aria}`) : aria);
    this.tFrase -= dt;
    if (this.tFrase <= 0) { this.tFrase = 5 + Math.random() * 3; this.zioParla(caso(c.frasi)); }
  }

  risultato() {
    const c = this.cfg;
    return {
      punteggio: this.punti + this.serieMigliore * c.bonusSerie,
      vittoria: this.serieMigliore >= c.obiettivoSerie,
      riepilogo: `${quanti(this.palleggi, 'palleggio', 'palleggi')}, serie migliore ${this.serieMigliore}, ${quanti(this.perfetti, 'perfetto', 'perfetti')}`,
    };
  }

  finale(ris, fatto) {
    for (const o of [...this.hud, this.palla, this.ombraPalla]) o.setVisible(false);
    this.fumZio?.destroy();
    this.posa(this.io, this.giocatore.id, 'normale');
    this.io.setAngle(0);
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.7, duration: 300 });
    this.zio.setDepth(701).setAngle(0).setTexture(ris.vittoria ? 'zio_shock' : 'zio_sufficienza');
    this.pallaZio.setDepth(702);
    this.tweens.add({ targets: this.zio, x: 240, y: 300, scale: scalaDi('zio_normale', 1.35), duration: 400, ease: 'Back.out' });
    this.tweens.add({ targets: this.pallaZio, x: 240, y: 74, scale: scalaDi('pallone', 2.2), duration: 400, ease: 'Back.out' });
    this.time.delayedCall(700, () => {
      txt(this, 240, 26, ris.vittoria ? 'CAMPIONE!' : 'SCARPONE!', { size: 18, color: ris.vittoria ? '#7dff9a' : '#ff6b5a', depth: 710 });
      Audio.sfx(ris.vittoria ? 'vittoria' : 'sconfitta');
      // lo Zio palleggia di testa nel finale, ovviamente senza sbagliare
      this.tweens.add({ targets: this.pallaZio, y: 52, angle: 360, duration: 260, yoyo: true, repeat: 4, ease: 'Quad.out' });
      this.time.delayedCall(300, () => fumetto(this, 330, 130, ris.vittoria ? 'Quasi bravo quanto me!' : "Te l'avevo detto: io non sbaglio mai.", 2000, 712));
    });
    this.time.delayedCall(3300, fatto);
  }
}
