// Microgioco 9: "MaraZio" - palleggi contro lo Zio. PALLEGGIA!
//
//  Il pallone sale e scende con la gravità: bisogna mettersi sotto e calciare
//  quando arriva al piede. Il colpo dipende dal tempo e dalla distanza:
//  perfetto (sale dritto), buono (scappa un po'), scarso (scappa tanto).
//  Se cade a terra la serie riparte: e più la serie è lunga, più vale ogni palleggio
//  (x1,5 ogni 5 di fila, fino a x3). Tre atti: prima calma; poi TIRA VENTO (il pallone
//  deriva di lato e cade un po' più in fretta); alla fine lo Zio calcia il PALLONE D'ORO:
//  colpirlo vale tanto, ma per andarci si rischia di perdere il proprio.
//  Accanto, lo Zio palleggia senza sbagliare mai, e ci tiene a farlo sapere.
//  Tutti e due palleggiano col piede: a ogni colpo la gamba si alza di lato in due tempi
//  (texture "id_calcio1D/2D" e "S" per la sinistra, create in sprites.js).
//  Vento e palloni d'oro sono uguali per tutti i giocatori del round (seme del round).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { PARCO } from '../grafica/sfondi.js';
import { casuale } from '../grafica/base.js';
import { txt, im, scalaDi, scritta, stelle, pannello, lerp, caso, quanti, fumetto, vibra, eTouch, multiTouch, colpetto, puntiHud, numero } from '../fx.js';

const TERRA = PARCO.terra;
const Y_PIEDE = TERRA - 12;                 // altezza del pallone quando lo colpisci
const R_PALLA = 5.4;
const X_MIN = 40, X_MAX = 292;              // dove può andare il giocatore
const BORDO = [26, 318];                    // il pallone rimbalza qui (oltre c'è lo Zio)
const ZIO = { x: 376, periodo: 0.95, alto: 92, lato: 16 };   // lato: il pallone cade sul suo piede destro
const migliaia = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const TAGLIA = 0.58;
const PULSANTE = { x: 452, y: 242, r: 21 };   // (nell'angolo: più in là coprirebbe lo Zio)
const ORO = 0xffcf3a;

export class PalleggiScene extends MicrogiocoBase {
  constructor() { super('palleggi'); }

  get atto() { return this.cfg.atti.filter((a) => this.trascorso >= a.da).pop(); }

  // quanto vale adesso un palleggio, per la serie in corso
  get moltiplicatore() {
    const c = this.cfg;
    return Math.min(c.maxMoltiplicatore, 1 + 0.5 * Math.floor(this.serie / c.ogniSerie));
  }

  prepara() {
    const c = this.cfg;
    this.rnd = casuale(Sessione.seme);
    this.palleggi = 0;
    this.perfetti = 0;
    this.serie = 0;
    this.serieMigliore = 0;
    this.punti = 0;
    this.cadute = 0;
    this.ori = 0;               // palloni d'oro colpiti
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
    this.nAtto = 0;
    this.vento = 0;           // spinta di lato adesso (unità/s²)
    this.tVento = 0;
    this.tOro = 1;            // secondi al prossimo pallone d'oro (quando è il suo atto)
    this.oro = null;          // il pallone d'oro in campo: { img, vx, vy, stato }
    // (la scena viene riusata da una partita all'altra: si azzera anche quello che resta in memoria)
    this.dito = null;
    this.tEsprIo = 0;
    this.tEsprZio = 0;
    this.saltando = false; this.tStupito = 0; this.tScia = 0;   // (festa, Zio a bocca aperta e scia: la scena viene riusata)

    im(this, 0, 0, 'bgParco').setOrigin(0);
    this.ombra = this.add.ellipse(this.x, TERRA + 1, 34, 6, 0x000000, 0.22).setDepth(5);
    this.io = im(this, this.x, TERRA + 2, `${this.giocatore.id}_normale`, TAGLIA).setOrigin(0.5, 1).setDepth(10);
    this.zio = im(this, ZIO.x, TERRA + 2, 'zio_normale', TAGLIA).setOrigin(0.5, 1).setDepth(10);
    this.add.ellipse(ZIO.x, TERRA + 1, 34, 6, 0x000000, 0.22).setDepth(5);
    this.pallaZio = im(this, ZIO.x + ZIO.lato, Y_PIEDE, 'pallone', 1).setDepth(12);
    this.ombraPalla = this.add.ellipse(this.x, TERRA + 1, 10, 3, 0x000000, 0.2).setDepth(6);
    this.palla = im(this, this.x, 120, 'pallone', 1).setDepth(12);
    this.scia = this.add.graphics().setDepth(11);
    // le folate di vento: righe bianche che attraversano il prato
    this.folate = [];
    this.gVento = this.add.graphics().setDepth(13);

    // contatori
    this.hud = [pannello(this, 240, 36, 120, 30, { depth: 1000 })];
    this.testoPalleggi = txt(this, 240, 31, '0', { size: 14, depth: 1001 });
    this.testoMolt = txt(this, 290, 31, '', { size: 8, depth: 1001, color: '#7dff9a' });
    this.testoSerie = txt(this, 240, 45, 'SERIE MIGLIORE: 0', { size: 7, depth: 1001, color: '#ffe14a' });
    this.testoPunti = txt(this, 474, 36, 'PUNTI: 0', { ox: 1, depth: 1001, size: 8 });
    this.testoZio = txt(this, ZIO.x, 122, 'ZIO: 4.312', { size: 7, depth: 1001, color: '#ffffff' });
    this.testoVento = txt(this, 166, 62, '', { size: 7, depth: 1001, color: '#e8f4ff' });
    this.hud.push(this.testoPalleggi, this.testoMolt, this.testoSerie, this.testoPunti, this.testoZio, this.testoVento);

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
      this.hud.push(g, txt(this, PULSANTE.x, PULSANTE.y, 'CALCIA', { size: 8, depth: 1001 }));
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
      this.obiettivoX = Phaser.Math.Clamp(this.obiettivoX + (w.x - this.dito.x) * c.guadagnoDito, X_MIN, X_MAX);
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

  // il colpo che darebbe adesso il piede a un pallone (null = fuori portata)
  colpoSu(img, vy) {
    const c = this.cfg, dy = img.y - Y_PIEDE, dx = Math.abs(img.x - this.x);
    if (!(vy > 0 && dy > -c.sopra && dy < c.sotto && dx < c.portata)) return null;
    const h = Math.abs(dy);
    return { h, dx, tipo: h < c.perfetto.altezza && dx < c.perfetto.distanza ? 'perfetto' : h < c.buono.altezza && dx < c.buono.distanza ? 'buono' : 'scarso' };
  }

  calcia() {
    if (!this.inCorso || this.ricarica > 0 || this.tCalcio > 0) return;
    const c = this.cfg;
    this.tCalcio = 0.2;
    // quale pallone: il mio o quello d'oro (se tutti e due sono al piede, il più vicino)
    const mio = this.statoPalla === 'volo' ? this.colpoSu(this.palla, this.vy) : null;
    const oro = this.oro?.stato === 'volo' ? this.colpoSu(this.oro.img, this.oro.vy) : null;
    const suOro = oro && (!mio || oro.h + oro.dx < mio.h + mio.dx);
    const bersaglio = suOro ? this.oro.img : this.palla;
    // la gamba dalla parte del pallone si alza, il corpo si piega dall'altra per stare in equilibrio
    const sinistra = bersaglio.visible && bersaglio.x < this.x;
    this.latoCalcio = sinistra ? 'S' : 'D';
    this.io.setAngle(sinistra ? 5 : -5);
    if (!mio && !oro) {
      this.ricarica = c.ricarica;
      Audio.sfx('vuotoCalcio');
      scritta(this, this.x, Y_PIEDE - 30, 'A VUOTO!', { size: 7, color: '#ffffff', durata: 250 });
      return;
    }
    if (suOro) return this.calciaOro(oro.tipo);

    const tipo = mio.tipo;
    const [vy, vMin, vMax] = c.colpi[tipo];
    // di lato: verso il centro del campo se il colpo è buono, a caso se è scarso
    const r = this.rnd;
    const verso = tipo === 'perfetto' ? Math.sign(166 - this.palla.x) : tipo === 'buono' && r() < 0.6 ? Math.sign(166 - this.palla.x) : (r() < 0.5 ? -1 : 1);
    this.vy = -vy;
    this.vx = verso * lerp(vMin, vMax, r()) + (this.palla.x - this.x) * 1.5;
    this.palleggi++;
    const prima = this.moltiplicatore;
    this.serie++;
    this.serieMigliore = Math.max(this.serieMigliore, this.serie);
    const molt = this.moltiplicatore, guadagno = Math.round(c.puntiPalleggio * molt) + (tipo === 'perfetto' ? c.bonusPerfetto : 0);
    this.punti += guadagno;
    if (tipo === 'perfetto') this.perfetti++;
    Audio.sfx('calcio');
    if (tipo === 'perfetto') Audio.sfx('ding');
    vibra(tipo === 'perfetto' ? 25 : 15);
    const [scritto, col] = { perfetto: ['PERFETTO!', '#7dff9a'], buono: ['BUONO', '#ffe14a'], scarso: ['SCARSO...', '#ff9a5a'] }[tipo];
    scritta(this, this.palla.x, this.palla.y - 16, `${scritto} +${guadagno}`, { size: 8, color: col, durata: 300 });
    if (tipo === 'perfetto') stelle(this, this.palla.x, this.palla.y, 4, 900);
    this.onda(this.palla.x, this.palla.y, tipo === 'perfetto' ? 0x7dff9a : 0xffffff);
    if (tipo === 'perfetto') this.tScia = 0.45;
    this.aggiornaHud();
    // ogni 5 di fila: un saltino di gioia; all'obiettivo lo Zio resta a bocca aperta
    if (this.serie % 5 === 0) this.festa();
    if (this.serie === c.obiettivoSerie) { this.tStupito = 1.6; this.zioParla('Ma come...?!', 1200); }
    if (molt > prima) {
      Audio.sfx('bonus');
      scritta(this, 240, 70, `${this.serie} DI FILA! x${String(molt).replace('.', ',')}`, { size: 12, color: '#7dff9a', durata: 600 });
      colpetto(this, this.testoMolt, 1.4, 1.4);
    } else if (this.serie % 10 === 0) { Audio.sfx('bonus'); scritta(this, 240, 70, `${this.serie} DI FILA!`, { size: 12, color: '#7dff9a', durata: 600 }); }
  }

  // colpito il pallone d'oro: torna allo Zio, e vale tanto (la serie non si tocca)
  calciaOro(tipo) {
    const c = this.cfg, o = this.oro, img = o.img;
    o.stato = 'preso';
    this.ori++;
    this.punti += c.puntiOro;
    Audio.sfx('calcio'); Audio.sfx('bonus');
    vibra(30);
    scritta(this, img.x, img.y - 18, `PALLONE D'ORO! +${c.puntiOro}`, { size: 9, color: '#ffe14a', durata: 500 });
    stelle(this, img.x, img.y, 8, 900);
    this.aggiornaHud();
    this.tweens.add({ targets: img, x: ZIO.x + ZIO.lato, y: Y_PIEDE - 60, angle: img.angle + 720, duration: 650, ease: 'Sine.inOut', onComplete: () => img.destroy() });
    this.tEsprZio = 1.2;
    this.zioParla(caso(c.frasiOro), 1200);
    this.oro = null;
  }

  // lo Zio calcia il pallone d'oro nel mio campo, con un bel campanile
  lanciaOro() {
    const c = this.cfg, r = this.rnd;
    const xArrivo = lerp(70, 270, r()), T = c.voloOro, g = c.gravita * this.atto.gravita;
    const x0 = ZIO.x - 30, y0 = Y_PIEDE - 20;
    const img = im(this, x0, y0, 'pallone', 1.15).setDepth(12).setTint(ORO);
    this.oro = { img, vx: (xArrivo - x0) / T, vy: (Y_PIEDE - y0 - 0.5 * g * T * T) / T, stato: 'volo' };
    Audio.sfx('calcio');
    this.zio.setAngle(-6);
    this.time.delayedCall(140, () => this.zio.setAngle(0));
    this.zioParla(caso(c.frasiLancioOro), 1000);
  }

  aggiornaHud() {
    const m = this.moltiplicatore;
    this.testoPalleggi.setText(String(this.serie));
    this.testoMolt.setText(m > 1 ? 'x' + numero(m, 1) : '');
    this.testoSerie.setText('SERIE MIGLIORE: ' + this.serieMigliore);
    this.testoPunti.setText(puntiHud(this.punti));
  }

  // l'onda d'urto del calcio: un cerchio che si allarga e sparisce
  onda(x, y, col) {
    const g = this.add.graphics().setDepth(890).setPosition(x, y);
    const o = { r: 4, a: 0.9 };
    this.tweens.add({ targets: o, r: 18, a: 0, duration: 260, ease: 'Quad.out', onUpdate: () => g.clear().lineStyle(2, col, o.a).strokeCircle(0, 0, o.r), onComplete: () => g.destroy() });
  }

  // il polverone quando il pallone tocca terra
  polvere(x) {
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(x + (Math.random() - 0.5) * 8, TERRA - 2, 2.5 + Math.random() * 2, 0xd9c9a3, 0.85).setDepth(880);
      const d = (i % 2 ? 1 : -1) * (8 + Math.random() * 14);
      this.tweens.add({ targets: p, x: p.x + d, y: p.y - 6 - Math.random() * 8, scale: 2, alpha: 0, duration: 420 + Math.random() * 200, ease: 'Quad.out', onComplete: () => p.destroy() });
    }
  }

  // il saltino di gioia (ogni 5 palleggi di fila), con i coriandoli
  festa() {
    if (this.saltando) return;
    this.saltando = true;
    this.tweens.add({ targets: this.io, y: this.io.y - 7, duration: 110, yoyo: true, ease: 'Quad.out', onComplete: () => { this.saltando = false; } });
    const col = [0xff5fa2, 0xffe14a, 0x7dff9a, 0x5ab8ff];
    for (let i = 0; i < 10; i++) {
      const p = this.add.rectangle(this.x, Y_PIEDE - 60, 3, 2, col[i % 4]).setDepth(895);
      this.tweens.add({ targets: p, x: this.x + (Math.random() - 0.5) * 70, y: Y_PIEDE - 70 - Math.random() * 30, angle: 360, duration: 300, ease: 'Quad.out',
        onComplete: () => this.tweens.add({ targets: p, y: TERRA, alpha: 0, angle: 720, duration: 700, ease: 'Quad.in', onComplete: () => p.destroy() }) });
    }
  }

  caduta() {
    this.statoPalla = 'terra';
    this.polvere(this.palla.x);
    this.attesa = 1.3;
    this.cadute++;
    if (this.serie >= 3) Audio.sfx('errore');
    this.serie = 0;
    this.aggiornaHud();
    this.tEsprZio = 1.6;      // sguardo di sufficienza (le texture le sceglie aggiorna)
    this.zioParla(caso(this.cfg.frasiErrore), 1400);
    this.tEsprIo = 1.2;       // e io ci resto male
  }

  aggiorna(dt) {
    const c = this.cfg, t = this.tasti, A = this.atto, g = c.gravita * A.gravita;
    this.ricarica = Math.max(0, this.ricarica - dt);

    // gli atti si annunciano
    const n = c.atti.indexOf(A);
    if (n !== this.nAtto) {
      this.nAtto = n;
      if (A.nome) { Audio.sfx('bonus'); scritta(this, 240, 96, A.nome, { size: 13, color: '#ffe14a', durata: 900 }); }
      if (A.oro) this.tOro = 0.6;
    }

    // il vento: cambia verso ogni tanto (sempre uguale per tutti: seme del round)
    if (A.vento) {
      this.tVento -= dt;
      if (this.tVento <= 0) {
        this.tVento = c.cambioVento[0] + this.rnd() * (c.cambioVento[1] - c.cambioVento[0]);
        this.versoVento = this.rnd() < 0.5 ? -1 : 1;
      }
    }
    const ventoVoluto = A.vento ? A.vento * this.versoVento : 0;
    this.vento += (ventoVoluto - this.vento) * Math.min(1, dt * 2);
    this.testoVento.setText(Math.abs(this.vento) > 4 ? (this.vento < 0 ? '<<  VENTO' : 'VENTO  >>') : '');
    this.disegnaVento(dt);

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
        this.palla.setPosition(this.x + Math.round(this.rnd() * 12 - 6), 118).setVisible(true).setAlpha(1);
        this.ombraPalla.setVisible(true);
        this.vx = 0; this.vy = 0;
      }
    } else {
      this.vy += g * dt;
      if (this.statoPalla === 'volo') this.vx += this.vento * dt;
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
      // dopo un colpo perfetto il pallone lascia una scia
      if (this.tScia > 0) {
        this.tScia -= dt;
        const sc = this.add.circle(x, y, R_PALLA * 0.8, 0x7dff9a, 0.45).setDepth(this.palla.depth - 1);
        this.tweens.add({ targets: sc, alpha: 0, scale: 0.4, duration: 220, onComplete: () => sc.destroy() });
      }
      this.ombraPalla.setPosition(x, TERRA + 1).setScale(lerp(1, 0.4, Phaser.Math.Clamp((TERRA - y) / 140, 0, 1)));
    }

    // il pallone d'oro
    if (A.oro && !this.oro) {
      this.tOro -= dt;
      if (this.tOro <= 0) { this.tOro = c.ogniOro; this.lanciaOro(); }
    }
    const o = this.oro;
    if (o?.stato === 'volo') {
      o.vy += g * dt;
      o.vx += this.vento * dt * 0.5;
      let x = o.img.x + o.vx * dt;
      if (x < BORDO[0] || x > BORDO[1]) { o.vx = -o.vx * 0.6; x = Phaser.Math.Clamp(x, BORDO[0], BORDO[1]); }
      o.img.setPosition(x, o.img.y + o.vy * dt).setAngle(o.img.angle + o.vx * dt * 8);
      if (o.img.y > TERRA - R_PALLA) {
        // caduto: rotola via e sparisce (la serie non si tocca)
        o.stato = 'giu';
        Audio.sfx('rimbalzo');
        const img = o.img;
        this.tweens.add({ targets: img, y: TERRA - R_PALLA - 10, duration: 160, yoyo: true, ease: 'Quad.out' });
        this.tweens.add({ targets: img, alpha: 0, delay: 400, duration: 300, onComplete: () => img.destroy() });
        this.oro = null;
      }
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
    if (this.tStupito > 0) { this.tStupito -= dt; this.posa(this.zio, 'zio', 'shock'); }
    else this.posa(this.zio, 'zio', calcio ? (aria === 'normale' ? calcio : `${calcio}_${aria}`) : aria);
    this.tFrase -= dt;
    if (this.tFrase <= 0) { this.tFrase = 5 + Math.random() * 3; this.zioParla(caso(c.frasi)); }
  }

  // righe bianche che scorrono sul prato nel verso del vento (più vento, più righe)
  disegnaVento(dt) {
    const g = this.gVento, forza = Math.min(1, Math.abs(this.vento) / 25);
    g.clear();
    if (forza < 0.05) { this.folate.length = 0; return; }
    while (this.folate.length < Math.round(9 * forza)) this.folate.push({ x: Math.random() * 330, y: 70 + Math.random() * 130, l: 10 + Math.random() * 16 });
    g.lineStyle(1, 0xffffff, 0.35 * forza);
    for (const f of this.folate) {
      f.x += this.vento * 6 * dt;
      if (f.x > 340) f.x = -20; else if (f.x < -20) f.x = 340;
      g.lineBetween(f.x, f.y, f.x + f.l, f.y);
    }
  }

  risultato() {
    const c = this.cfg, s = this.serieMigliore;
    const serie = s >= c.obiettivoSerie ? c.bonusObiettivo + c.bonusOltre * (s - c.obiettivoSerie) : c.bonusSotto * s;
    return {
      punteggio: this.punti + serie,
      vittoria: this.serieMigliore >= c.obiettivoSerie,
      riepilogo: `${quanti(this.palleggi, 'palleggio', 'palleggi')}, serie migliore ${this.serieMigliore} (+${serie}), ${quanti(this.perfetti, 'perfetto', 'perfetti')}` + (this.ori ? `, ${quanti(this.ori, "pallone d'oro", "palloni d'oro")}` : ''),
    };
  }

  finale(ris, fatto) {
    for (const o of [...this.hud, this.palla, this.ombraPalla, this.gVento]) o.setVisible(false);
    this.oro?.img.destroy();
    this.oro = null;
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
      this.time.delayedCall(300, () => fumetto(this, 330, 130, ris.vittoria ? this.cfg.fraseZioPerde : this.cfg.fraseZioVince, 2000, 712));
    });
    this.time.delayedCall(3300, fatto);
  }
}
