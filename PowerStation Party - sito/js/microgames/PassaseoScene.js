// Microgioco 10: "Passa di qua" - in Panda per le strade toscane. SCHIZZA!
//
//  La strada scorre dall'alto. Lungo i bordi pedalano i Passaseo in divisa da scout, con le
//  pozzanghere accanto: passarci dentro proprio mentre li affianchi li inzuppa (SPLASH!).
//  Toccarli no: si inchioda e si perdono punti.
//  Gli incontri cambiano: il Passaseo nel nostro verso (a destra), quello contromano (a sinistra:
//  la pozzanghera è nella corsia opposta e arrivano Vespe e la Golf di ReGrorio), il GRUPPETTO
//  (tre in fila, con una pozzanghera lunga: tanti punti, tanto rischio). Pozzanghere piccole
//  (bisogna stargli attaccati), grandi, e di fango (rallenta la Panda).
//  Il CLACSON (con la ricarica): i Passaseo davanti sbandano verso la pozzanghera e non fanno in
//  tempo ad aprire l'OMBRELLO (quelli che si accorgono di te lo aprono, e l'ombrello para).
//  Tre atti: si comincia tranquilli, poi l'ACQUAZZONE (pioggia, più pozzanghere, sterzo che
//  scivola), alla fine il gruppetto e il traffico. Strada uguale per tutti (seme del round).
//  Ciclisti, pozzanghere e mezzi si muovono in proporzione alla strada, così ogni ciclista
//  arriva accanto alla sua pozzanghera anche se la Panda frena.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { STRADA } from '../grafica/sfondi.js';
import { txt, im, scalaDi, scritta, stelle, pannello, scuoti, lerp, caso, quanti, fumetto, vibra, eTouch, multiTouch, puntatore } from '../fx.js';

const Y_AUTO = 214;
const X_MIN = STRADA.sx - 10, X_MAX = STRADA.dx + 10;
const AUTO = { mx: 13, my: 23 };              // mezza larghezza e mezza lunghezza della Panda
// a destra si va nel nostro verso, a sinistra si arriva contromano
const LATO = { dx: { bici: STRADA.dx - 12, verso: -1 }, sx: { bici: STRADA.sx + 12, verso: 1 } };
const POZZE = { piccola: { key: 'pozzanghera', k: 0.75, presa: 9, raggio: 34, lungo: 12 }, grande: { key: 'pozzanghera', k: 1.25, presa: 16, raggio: 48, lungo: 20 },
  lunga: { key: 'pozzanghera', k: 1.3, kY: 3.2, presa: 16, raggio: 48, lungo: 70 }, fango: { key: 'fango', k: 1.1, presa: 15, raggio: 0, lungo: 16 } };
const CLACSON = { x: 440, y: 236, r: 22 };   // sul telefono, il pulsante

export class PassaseoScene extends MicrogiocoBase {
  constructor() { super('passaseo'); }

  prepara() {
    const c = this.cfg;
    this.rnd = casuale(Sessione.seme);
    this.punti = 0; this.schizzi = 0; this.serie = 0; this.serieMax = 0; this.sfiorati = 0; this.urti = 0; this.parati = 0;
    this.x = 240; this.obiettivoX = 240; this.vx = 0;
    this.modo = 'tastiera';
    this.vel = c.velInizio;
    this.freno = 0; this.fango = 0;
    this.scorri = 0;
    this.tIncontro = 1;
    this.ricaricaClacson = 0;
    this.atto = 0;
    this.dito = null;
    this.cose = [];            // { tipo: 'bici'|'pozza'|'trattore'|'vespa'|'golf', img, f (velocità rispetto alla strada), extra, ... }

    this.fondo = [0, 1].map(() => im(this, 0, 0, 'bgStradaToscana').setOrigin(0));
    this.bagnato = this.add.rectangle(0, 0, 480, 270, 0x203048, 0).setOrigin(0).setDepth(5);   // la strada scura sotto l'acquazzone
    this.pioggia = this.add.graphics().setDepth(800);
    this.auto = im(this, this.x, Y_AUTO, 'panda').setDepth(50);

    this.hud = [pannello(this, 240, 34, 132, 26, { depth: 1000 })];
    this.testoSchizzi = txt(this, 240, 30, 'SCHIZZATI: 0', { size: 9, depth: 1001 });
    this.testoSerie = txt(this, 240, 42, '', { size: 6.5, depth: 1001, color: '#ffe14a' });
    this.hud.push(this.testoSchizzi, this.testoSerie);
    // la ricarica del clacson (in basso a destra; sul telefono è anche il pulsante)
    this.clacsonG = this.add.graphics().setDepth(1000);
    this.hud.push(this.clacsonG, txt(this, CLACSON.x, CLACSON.y + 1, eTouch() ? 'CLACSON' : 'SPAZIO:\nCLACSON', { size: 4.8, depth: 1001, spacing: -1 }));
    this.disegnaClacson();

    this.tasti = this.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT', a: 'A', d: 'D' });
    this.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) this.clacson(); });
    multiTouch(this, 2);
    this.input.on('pointerdown', (p) => {
      const w = puntatore(this, p);
      if (Math.hypot(w.x - CLACSON.x, w.y - CLACSON.y) < CLACSON.r + 6 || (!p.wasTouch && p.rightButtonDown())) return this.clacson();
      if (p.wasTouch && this.dito == null) { this.dito = { id: p.id, x: w.x }; this.modo = 'dito'; this.obiettivoX = this.x; }
    });
    this.input.on('pointermove', (p) => {
      const w = puntatore(this, p);
      if (!p.wasTouch) { this.modo = 'mouse'; this.obiettivoX = Phaser.Math.Clamp(w.x, X_MIN, X_MAX); return; }
      if (this.dito?.id !== p.id) return;
      this.obiettivoX = Phaser.Math.Clamp(this.obiettivoX + (w.x - this.dito.x) * this.cfg.guadagnoDito, X_MIN, X_MAX);
      this.dito.x = w.x;
    });
    this.input.on('pointerup', (p) => { if (this.dito?.id === p.id) this.dito = null; });
  }

  // dopo una pausa il dito che sterzava non c'è più (se no non si potrebbe più sterzare)
  alRientro() { this.dito = null; }

  disegnaClacson() {
    const g = this.clacsonG, pronto = this.ricaricaClacson <= 0, k = 1 - this.ricaricaClacson / this.cfg.ricaricaClacson;
    g.clear();
    g.fillStyle(0x1f1430, 0.85).fillCircle(CLACSON.x, CLACSON.y, CLACSON.r + 1.5);
    g.fillStyle(pronto ? 0xe8603a : 0x5a4a6a, 1).fillCircle(CLACSON.x, CLACSON.y, CLACSON.r);
    if (!pronto) { g.lineStyle(3, 0xffe14a, 1); g.beginPath(); g.arc(CLACSON.x, CLACSON.y, CLACSON.r - 3, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); g.strokePath(); }
  }

  get fase() { const c = this.cfg; return c.atti.filter((a) => this.trascorso >= a.da).pop(); }

  aggiungi(tipo, x, y, f, extra = {}) {
    const chiave = { bici: 'ciclista', trattore: 'trattore', vespa: 'vespa', golf: 'golfGiu0' }[tipo] ?? extra.chiave;
    const img = im(this, x, y, chiave, extra.scala ?? 1).setDepth(tipo === 'pozza' ? 10 : 40);
    if (extra.kY) img.setScale(img.scaleX, img.scaleY * extra.kY);
    const o = { tipo, img, f, ...extra };
    this.cose.push(o);
    return o;
  }

  // Un incontro: ciclista (nel nostro verso o contromano) con la sua pozzanghera, il gruppetto,
  // oppure un mezzo da evitare. Il ciclista va più piano (o più forte) della strada: si sceglie
  // da dove partono perché arrivino insieme all'altezza della Panda.
  incontro() {
    const c = this.cfg, F = this.fase, r = this.rnd;
    if (r() < F.veicoli) {
      const v = r();
      if (v < 0.4) this.aggiungi('trattore', STRADA.dx - 42 + (r() - 0.5) * 8, -40, 1 - c.trattore);
      else if (v < 0.4 + F.golf) this.aggiungi('golf', STRADA.sx + 42, -60, 1, { extra: c.golf, scala: 0.55 });
      else this.aggiungi('vespa', STRADA.sx + 44 + (r() - 0.5) * 12, -30, 1, { extra: c.vespa }).img.setFlipY(true);
      return;
    }
    const gruppo = r() < F.gruppetto;
    const lato = gruppo ? 'dx' : r() < F.contromano ? 'sx' : 'dx', L = LATO[lato];
    const f = 1 + L.verso * c.bici;
    const tipoPozza = gruppo ? 'lunga' : r() < F.fango ? 'fango' : r() < F.grande ? 'grande' : 'piccola';
    const P = POZZE[tipoPozza];
    let yb, yp;
    if (f < 1) { yb = -30; yp = Y_AUTO - (Y_AUTO - yb) / f; } else { yp = -20 - P.lungo; yb = Y_AUTO - (Y_AUTO - yp) * f; }
    // la pozzanghera: più vicina al ciclista se è piccola (bisogna stargli attaccati)
    const dist = tipoPozza === 'piccola' ? c.distanzaPozza - 4 : c.distanzaPozza;
    const pozza = this.aggiungi('pozza', L.bici + L.verso * dist + (r() - 0.5) * 4, yp, 1, { chiave: P.key, scala: P.k, kY: P.kY, pozza: P, tipoPozza });
    if (tipoPozza === 'fango') return;                      // il fango sta lì da solo: è una trappola
    const ombrello = !gruppo && r() < F.ombrello;
    const quanti_ = gruppo ? 3 : 1;
    // contromano, a volte, arriva una Vespa proprio mentre stai per prendere la pozzanghera
    if (lato === 'sx' && r() < F.trafficoContromano) this.aggiungi('vespa', STRADA.sx + 44, yp - 90, 1, { extra: c.vespa }).img.setFlipY(true);
    for (let i = 0; i < quanti_; i++) {
      const dy = gruppo ? (i - 1) * 24 * f : 0;
      const bici = this.aggiungi('bici', L.bici, yb + dy, f, { pozza, lato, x0: L.bici, onda: lerp(c.ondeggioInizio, c.ondeggioFine, this.progresso), fase: r() * 6.28, ombrello, accorto: false });
      bici.img.setFlipY(L.verso > 0);
    }
    pozza.bici = true;
  }

  frena(perche, quanto = 1) {
    this.freno = this.cfg.ripresa * quanto;
    Audio.sfx('frenata');
    vibra(60);
    scuoti(this, 120, 0.005);
    if (perche) {
      this.serie = 0;
      this.testoSerie.setText('');
      scritta(this, this.x, Y_AUTO - 34, perche, { size: 8, color: '#ff6b5a', durata: 300 });
    }
  }

  // il clacson: i Passaseo davanti si spaventano, sbandano verso la pozzanghera e non aprono l'ombrello
  clacson() {
    if (!this.inCorso || this.ricaricaClacson > 0) return;
    const c = this.cfg;
    this.ricaricaClacson = c.ricaricaClacson;
    Audio.sfx('clacson');
    scritta(this, this.x, Y_AUTO - 40, 'PEEP!', { size: 9, color: '#ffe14a', durata: 200 });
    for (const o of this.cose) {
      if (o.tipo !== 'bici' || o.bagnato || o.sfiorato) continue;
      const davanti = Y_AUTO - o.img.y;
      if (davanti < -10 || davanti > c.portataClacson) continue;
      o.spavento = c.spavento;                 // secondi di sbandata verso il centro strada
      if (o.aperto) { o.aperto = false; o.ombrelloImg?.destroy(); o.ombrelloImg = null; }
      o.ombrello = false;
      fumetto(this, o.img.x, o.img.y - 24, caso(c.frasiClacson), 600, 902);
    }
    this.disegnaClacson();
  }

  // SPLASH: il ciclista è fradicio (se ha l'ombrello aperto, invece, ha parato)
  schizza(bici, pozza) {
    const c = this.cfg;
    if (bici.aperto) {
      bici.bagnato = true;
      this.parati++;
      Audio.sfx('pof');
      scritta(this, bici.img.x, bici.img.y - 24, 'OMBRELLO!', { size: 8, color: '#9fe0ff', durata: 350 });
      return;
    }
    bici.bagnato = true;
    bici.img.setTexture('ciclistaBagnato');
    this.schizzi++;
    this.serie++;
    this.serieMax = Math.max(this.serieMax, this.serie);
    const p = c.puntiSchizzo * Math.min(this.serie, c.maxSerie);
    this.punti += p;
    Audio.sfx('schizzo');
    vibra(40);
    this.testoSchizzi.setText('SCHIZZATI: ' + this.schizzi);
    this.testoSerie.setText(this.serie > 1 ? `DI FILA x${Math.min(this.serie, c.maxSerie)}` : '');
    scritta(this, bici.img.x, bici.img.y - 24, 'SPLASH! +' + p, { size: 9, color: '#9fe0ff', durata: 400 });
    const verso = Math.sign(bici.img.x - pozza.img.x) || 1;
    for (let i = 0; i < 6; i++) {
      const g = im(this, pozza.img.x, Y_AUTO, 'spruzzo', 0.6 + Math.random() * 0.5).setDepth(45).setAlpha(0.95).setTint(0x8fd0ff);
      this.tweens.add({ targets: g, x: bici.img.x + verso * Phaser.Math.Between(-6, 14), y: bici.img.y + Phaser.Math.Between(-18, 14), scale: g.scale * 1.6, alpha: 0, duration: 380 + i * 40, ease: 'Quad.out', onComplete: () => g.destroy() });
    }
    this.tweens.add({ targets: bici.img, angle: { from: -14 * verso, to: 0 }, duration: 500, ease: 'Elastic.out' });
    if (this.serie > 0 && this.serie % 5 === 0) Audio.sfx('bonus');
    // il Passaseo, fradicio, si affaccia dal bordo strada
    const xr = bici.lato === 'dx' ? 418 : 62, yr = Phaser.Math.Clamp(bici.img.y + 30, 96, 230);
    this.ritratto?.destroy();
    this.ritratto = im(this, xr, yr, 'passaseo_shock', 0.42).setOrigin(0.5, 1).setDepth(900).setScale(0);
    this.tweens.add({ targets: this.ritratto, scale: scalaDi('passaseo_shock', 0.42), duration: 200, ease: 'Back.out' });
    const rit = this.ritratto;
    this.time.delayedCall(900, () => this.tweens.add({ targets: rit, scale: 0, duration: 160, onComplete: () => rit.destroy() }));
    this.fumRitratto?.destroy();
    this.fumRitratto = fumetto(this, Phaser.Math.Clamp(xr, 60, 420), yr - 66, caso(c.frasi), 900, 902);
  }

  aggiorna(dt, p) {
    const c = this.cfg, t = this.tasti, F = this.fase;

    // gli atti: all'inizio di quelli nuovi, un annuncio
    const atto = c.atti.indexOf(F);
    if (atto !== this.atto) {
      this.atto = atto;
      Audio.sfx('bonus');
      scritta(this, 240, 120, F.nome, { size: 14, color: '#ffe14a', durata: 900 });
    }
    // l'acquazzone: strada scura e pioggia
    const piove = !!F.pioggia;
    this.bagnato.fillAlpha = lerp(this.bagnato.fillAlpha, piove ? 0.28 : 0, dt * 2);
    this.pioggia.clear();
    if (piove) {
      this.pioggia.lineStyle(1, 0xcfe6ff, 0.45);
      for (let i = 0; i < 46; i++) {
        const x = (i * 97.3 + this.trascorso * 140) % 500 - 10, y = (i * 53.7 + this.trascorso * 520) % 290 - 10;
        this.pioggia.lineBetween(x, y, x - 4, y + 12);
      }
    }

    // velocità della strada, con la frenata dopo un tocco e il fango
    const obiettivo = lerp(c.velInizio, c.velFine, p) * (this.fango > 0 ? c.rallentaFango : 1);
    this.fango = Math.max(0, this.fango - dt);
    if (this.freno > 0) { this.freno = Math.max(0, this.freno - dt); this.vel = lerp(obiettivo, c.velFreno, Math.min(1, this.freno / c.ripresa)); }
    else this.vel = lerp(this.vel, obiettivo, Math.min(1, dt * 4));
    this.auto.setTexture(this.freno > c.ripresa * 0.45 ? 'pandaFreni' : 'panda');
    const dD = this.vel * dt;
    this.scorri = (this.scorri + dD) % 270;
    this.fondo[0].y = this.scorri - 270;
    this.fondo[1].y = this.scorri;

    // sterzo (sotto l'acquazzone la Panda scivola: ci mette di più a cambiare direzione)
    const dir = (t.dx.isDown || t.d.isDown) - (t.sx.isDown || t.a.isDown);
    let voglio = 0;
    if (dir) { this.modo = 'tastiera'; voglio = dir * c.velSterzo; }
    else if (this.modo !== 'tastiera') voglio = Phaser.Math.Clamp((this.obiettivoX - this.x) * 10, -c.velSterzo, c.velSterzo);
    this.vx = lerp(this.vx, voglio, Math.min(1, dt * (piove ? c.presaBagnato : 30)));
    this.x = Phaser.Math.Clamp(this.x + this.vx * dt, X_MIN, X_MAX);
    if (this.modo === 'tastiera') this.obiettivoX = this.x;
    this.auto.setPosition(this.x, Y_AUTO).setAngle(Phaser.Math.Clamp(this.vx * 0.05, -9, 9));

    // clacson in ricarica
    if (this.ricaricaClacson > 0) { this.ricaricaClacson = Math.max(0, this.ricaricaClacson - dt); this.disegnaClacson(); }

    // nuovi incontri
    this.tIncontro -= dt;
    if (this.tIncontro <= 0) { this.incontro(); this.tIncontro = F.intervallo * (0.85 + this.rnd() * 0.3); }

    for (const o of this.cose) {
      o.img.y += o.f * dD + (o.extra ?? 0) * dt;
      if (o.tipo === 'bici' && !o.sfiorato) {
        o.fase += dt * 2.6;
        // sbandata per lo spavento del clacson: verso il centro strada
        o.spavento = Math.max(0, (o.spavento ?? 0) - dt);
        const verso = LATO[o.lato].verso, sbanda = o.spavento > 0 ? Math.sin((o.spavento / c.spavento) * Math.PI) * c.sbandata : 0;
        o.img.x = o.x0 + Math.sin(o.fase) * o.onda + verso * sbanda;
        // chi ha l'ombrello si accorge della Panda e lo apre (se non è stato spaventato prima)
        const davanti = Y_AUTO - o.img.y;
        if (o.ombrello && !o.accorto && davanti < c.accorgeA && davanti > 0) {
          o.accorto = true;
          o.allarme = txt(this, o.img.x, o.img.y - 22, '!', { size: 12, color: '#ffe14a', depth: 902 });
          this.time.delayedCall(c.tempoOmbrello * 1000, () => {
            o.allarme?.destroy();
            if (!o.ombrello || o.bagnato || !o.img.active) return;
            o.aperto = true;
            Audio.sfx('pof');
            o.ombrelloImg = im(this, o.img.x, o.img.y - 4, 'ombrelloBici').setDepth(41);
          });
        }
        o.allarme?.setPosition(o.img.x, o.img.y - 22);
        o.ombrelloImg?.setPosition(o.img.x, o.img.y - 4);
      }
      const dx = Math.abs(this.x - o.img.x), dy = Math.abs(Y_AUTO - o.img.y);
      if (o.tipo === 'pozza') {
        const P = o.pozza, dentro = dy < P.lungo / 2 + 6 && dx < P.presa;
        if (dentro && !o.toccata) {
          o.toccata = true;
          if (o.tipoPozza === 'fango') {
            this.fango = c.durataFango;
            Audio.sfx('splat');
            scritta(this, this.x, Y_AUTO - 34, 'FANGO!', { size: 8, color: '#c8a070', durata: 300 });
            for (const s of [-1, 1]) { const g = im(this, o.img.x, o.img.y, 'spruzzo', 0.7).setDepth(45).setTint(0x8a6a3a); this.tweens.add({ targets: g, x: g.x + s * 22, alpha: 0, duration: 380, onComplete: () => g.destroy() }); }
          } else if (!o.bici) { this.punti += c.puntiPozzanghera; Audio.sfx('splash'); }
        }
        // finché la Panda è dentro, chi le pedala accanto si bagna (il gruppetto, uno dopo l'altro)
        if (dentro && o.tipoPozza !== 'fango') {
          for (const b of this.cose) {
            if (b.tipo !== 'bici' || b.bagnato || b.sfiorato || b.pozza !== o) continue;
            if (Math.abs(b.img.y - Y_AUTO) < 22 && Math.abs(b.img.x - o.img.x) < P.raggio) this.schizza(b, o);
          }
        }
      } else if (o.tipo === 'bici' && !o.sfiorato && dx < AUTO.mx + 7 && dy < AUTO.my + 20) {
        // mai addosso ai ciclisti: si inchioda, lui sbanda e suona il campanello
        o.sfiorato = true;
        this.sfiorati++;
        this.punti -= c.malusCiclista;
        Audio.sfx('campanello');
        this.frena('-' + c.malusCiclista);
        this.scansa(o.img.x, AUTO.mx + 9);
        this.tweens.add({ targets: o.img, angle: { from: 18, to: -18 }, duration: 110, yoyo: true, repeat: 2, onComplete: () => o.img.setAngle(0) });
        fumetto(this, o.img.x, o.img.y - 26, caso(c.frasiSfiorato), 800, 902);
      } else if (['trattore', 'vespa', 'golf'].includes(o.tipo) && !o.urtato) {
        const mx = { trattore: 14, vespa: 6, golf: 14 }[o.tipo], my = { trattore: 26, vespa: 18, golf: 28 }[o.tipo];
        if (dx < AUTO.mx + mx && dy < AUTO.my + my) {
          o.urtato = true;
          this.urti++;
          this.punti -= c.malusVeicolo;
          Audio.sfx('clacson');
          this.frena('-' + c.malusVeicolo);
          this.scansa(o.img.x, AUTO.mx + mx + 2);
        }
      }
    }
    // pozzanghere passate con un ciclista asciutto accanto: la serie riparte
    for (const o of this.cose) if (o.tipo === 'pozza' && o.bici && !o.persa && o.img.y > Y_AUTO + o.pozza.lungo / 2 + 14) {
      o.persa = true;
      const asciutti = this.cose.filter((b) => b.tipo === 'bici' && b.pozza === o && !b.bagnato && !b.sfiorato);
      if (asciutti.length && this.serie > 0) { this.serie = 0; this.testoSerie.setText(''); scritta(this, asciutti[0].img.x, asciutti[0].img.y - 20, 'ASCIUTTO!', { size: 8, color: '#ffffff', durata: 300 }); }
    }
    for (const o of this.cose) if (o.img.y > 330 || o.img.y < -600) { this.tweens.killTweensOf(o.img); o.img.destroy(); o.ombrelloImg?.destroy(); o.allarme?.destroy(); o.via = true; }
    this.cose = this.cose.filter((o) => !o.via);
  }

  // la Panda sterza di colpo e si toglie da davanti a quello che stava per toccare
  scansa(x, distanza) {
    let verso = Math.sign(this.x - x) || 1;
    if (x + verso * distanza < X_MIN || x + verso * distanza > X_MAX) verso = -verso;
    this.x = this.obiettivoX = Phaser.Math.Clamp(x + verso * distanza, X_MIN, X_MAX);
    this.vx = 0;
  }

  risultato() {
    return {
      punteggio: Math.max(0, this.punti),
      vittoria: this.schizzi >= this.cfg.obiettivoSchizzi,
      riepilogo: `${quanti(this.schizzi, 'Passaseo schizzato', 'Passaseo schizzati')}, serie max ${this.serieMax}` + (this.parati ? `, ${this.parati} con l'ombrello` : '') + `, ${quanti(this.sfiorati + this.urti, 'tocco', 'tocchi')}`,
    };
  }

  finale(ris, fatto) {
    for (const o of this.hud) o.setVisible(false);
    this.fumRitratto?.destroy();
    this.pioggia.clear();
    Audio.sfx('tempo');
    this.auto.setTexture('pandaFreni');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.7, duration: 300 });
    const pas = im(this, 240, 330, ris.vittoria ? 'passaseo_shock' : 'passaseo_felice', 1.35).setOrigin(0.5, 1).setDepth(701);
    this.tweens.add({ targets: pas, y: 300, duration: 400, ease: 'Back.out' });
    this.time.delayedCall(700, () => {
      txt(this, 240, 26, ris.vittoria ? 'FRADICI!' : 'TUTTI ASCIUTTI!', { size: 18, color: ris.vittoria ? '#9fe0ff' : '#ff6b5a', depth: 710 });
      if (ris.vittoria) {
        Audio.sfx('schizzo');
        for (let i = 0; i < 24; i++) {
          const g = this.add.ellipse(Phaser.Math.Between(150, 330), Phaser.Math.Between(40, 90), 3, 4.5, 0x9fd4ff).setDepth(705);
          this.tweens.add({ targets: g, y: 280, delay: i * 50, duration: 700, ease: 'Quad.in', onComplete: () => g.destroy() });
        }
        this.time.delayedCall(300, () => fumetto(this, 330, 130, 'Passa di qua, eh?!', 1900, 712));
        stelle(this, 240, 70, 8, 706);
      } else {
        Audio.sfx('sconfitta');
        this.time.delayedCall(300, () => fumetto(this, 330, 130, 'Asciutto come un biscotto!', 1900, 712));
      }
    });
    this.time.delayedCall(3300, fatto);
  }
}
