// Microgioco 10: "Passa di qua" - in Panda per le strade toscane.
//
//  La strada scorre dall'alto. Lungo i bordi pedalano i Passaseo in divisa da scout
//  e accanto a loro ci sono le pozzanghere: passarci sopra proprio mentre li
//  affianchi li inzuppa da capo a piedi (SPLASH!). Toccarli no: si inchioda e
//  si perdono punti. Occhio anche a trattori e Vespe.
//  Ciclisti, pozzanghere e mezzi si muovono in proporzione alla strada, così
//  ogni ciclista arriva accanto alla sua pozzanghera anche se la Panda frena.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { STRADA } from '../grafica/sfondi.js';
import { txt, im, scalaDi, scritta, stelle, pannello, scuoti, lerp, caso, quanti, fumetto, vibra } from '../fx.js';

const Y_AUTO = 214;
const X_MIN = STRADA.sx - 10, X_MAX = STRADA.dx + 10;
const AUTO = { mx: 13, my: 23 };            // mezza larghezza e mezza lunghezza della Panda
// corsie: a destra si va nel nostro verso, a sinistra si arriva contromano
const LATO = { dx: { bici: STRADA.dx - 12, verso: -1 }, sx: { bici: STRADA.sx + 12, verso: 1 } };

export class PassaseoScene extends MicrogiocoBase {
  constructor() { super('passaseo'); }

  prepara() {
    const c = this.cfg;
    this.punti = 0;
    this.schizzi = 0;
    this.serie = 0;
    this.sfiorati = 0;
    this.urti = 0;
    this.x = 240;
    this.obiettivoX = 240;
    this.vx = 0;
    this.modo = 'tastiera';
    this.vel = c.velInizio;
    this.freno = 0;
    this.scorri = 0;
    this.tIncontro = 1;
    this.dito = null;          // (la scena viene riusata: un dito rimasto "appoggiato" bloccherebbe lo sterzo)
    this.cose = [];            // { tipo: 'bici'|'pozza'|'trattore'|'vespa', img, f (velocità rispetto alla strada), extra, ... }

    this.fondo = [0, 1].map(() => im(this, 0, 0, 'bgStradaToscana').setOrigin(0));
    this.auto = im(this, this.x, Y_AUTO, 'panda').setDepth(50);

    this.hud = [pannello(this, 240, 34, 120, 26, { depth: 1000 })];
    this.testoSchizzi = txt(this, 240, 30, 'SCHIZZATI: 0', { size: 9, depth: 1001 });
    this.testoSerie = txt(this, 240, 42, '', { size: 6, depth: 1001, color: '#ffe14a' });
    this.hud.push(this.testoSchizzi, this.testoSerie);

    this.tasti = this.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT', a: 'A', d: 'D' });
    const mondo = (p) => this.cameras.main.getWorldPoint(p.x, p.y);
    this.input.on('pointerdown', (p) => { if (p.wasTouch && this.dito == null) { this.dito = { id: p.id, x: mondo(p).x }; this.modo = 'dito'; this.obiettivoX = this.x; } });
    this.input.on('pointermove', (p) => {
      const w = mondo(p);
      if (!p.wasTouch) { this.modo = 'mouse'; this.obiettivoX = Phaser.Math.Clamp(w.x, X_MIN, X_MAX); return; }
      if (this.dito?.id !== p.id) return;
      this.obiettivoX = Phaser.Math.Clamp(this.obiettivoX + (w.x - this.dito.x) * this.cfg.guadagnoDito, X_MIN, X_MAX);
      this.dito.x = w.x;
    });
    this.input.on('pointerup', (p) => { if (this.dito?.id === p.id) this.dito = null; });
  }

  // dopo una pausa il dito che sterzava non c'è più (se no non si potrebbe più sterzare)
  alRientro() { this.dito = null; }

  aggiungi(tipo, x, y, f, extra = {}) {
    const chiave = { bici: 'ciclista', pozza: 'pozzanghera', trattore: 'trattore', vespa: 'vespa' }[tipo];
    const img = im(this, x, y, chiave).setDepth(tipo === 'pozza' ? 10 : 40);
    const o = { tipo, img, f, ...extra };
    this.cose.push(o);
    return o;
  }

  // un ciclista con la sua pozzanghera, oppure un mezzo da evitare
  incontro(p) {
    const c = this.cfg;
    const r = Math.random(), lato = Math.random() < 0.6 ? 'dx' : 'sx', L = LATO[lato];
    if (r < lerp(c.veicoliInizio, c.veicoliFine, p)) {
      if (Math.random() < 0.55) this.aggiungi('trattore', STRADA.dx - 42 + Phaser.Math.Between(-4, 4), -40, 1 - c.trattore);
      else this.aggiungi('vespa', STRADA.sx + 44 + Phaser.Math.Between(-6, 6), -30, 1, { extra: c.vespa }).img.setFlipY(true);
      return;
    }
    // il ciclista va più piano della strada (nel nostro verso) o più forte (contromano):
    // si sceglie da dove partono perché arrivino insieme all'altezza della Panda
    const f = 1 + L.verso * c.bici;
    let yb, yp;
    if (f < 1) { yb = -30; yp = Y_AUTO - (Y_AUTO - yb) / f; } else { yp = -20; yb = Y_AUTO - (Y_AUTO - yp) * f; }
    const pozza = this.aggiungi('pozza', L.bici + L.verso * c.distanzaPozza + Phaser.Math.Between(-3, 3), yp, 1);
    if (Math.random() < 0.12) return;           // ogni tanto una pozzanghera e basta
    // il ciclista ondeggia attorno alla sua riga: passargli accanto senza toccarlo è più delicato
    const bici = this.aggiungi('bici', L.bici, yb, f, { pozza, lato, x0: L.bici, onda: lerp(c.ondeggioInizio, c.ondeggioFine, p), fase: Math.random() * 6.28 });
    pozza.bici = bici;
    bici.img.setFlipY(L.verso > 0);
  }

  frena(perche) {
    this.freno = this.cfg.ripresa;
    Audio.sfx('frenata');
    vibra(60);
    scuoti(this, 120, 0.005);
    this.serie = 0;
    this.testoSerie.setText('');
    if (perche) scritta(this, this.x, Y_AUTO - 34, perche, { size: 8, color: '#ff6b5a', durata: 300 });
  }

  schizza(bici, pozza) {
    const c = this.cfg;
    bici.bagnato = true;
    bici.img.setTexture('ciclistaBagnato');
    this.schizzi++;
    this.serie++;
    const p = c.puntiSchizzo * Math.min(this.serie, c.maxSerie);
    this.punti += p;
    Audio.sfx('schizzo');
    vibra(40);
    this.testoSchizzi.setText('SCHIZZATI: ' + this.schizzi);
    this.testoSerie.setText(this.serie > 1 ? `DI FILA x${Math.min(this.serie, c.maxSerie)}` : '');
    scritta(this, bici.img.x, bici.img.y - 24, 'SPLASH! +' + p, { size: 9, color: '#9fe0ff', durata: 400 });
    // onda d'acqua verso il ciclista
    const verso = Math.sign(bici.img.x - pozza.img.x) || 1;
    for (let i = 0; i < 7; i++) {
      const g = im(this, pozza.img.x, pozza.img.y, 'spruzzo', 0.6 + Math.random() * 0.5).setDepth(45).setAlpha(0.95).setTint(0x8fd0ff);
      this.tweens.add({ targets: g, x: bici.img.x + verso * Phaser.Math.Between(-6, 14), y: bici.img.y + Phaser.Math.Between(-18, 14), scale: g.scale * 1.6, alpha: 0, duration: 380 + i * 40, ease: 'Quad.out', onComplete: () => g.destroy() });
    }
    this.tweens.add({ targets: bici.img, angle: { from: -14 * verso, to: 0 }, duration: 500, ease: 'Elastic.out' });
    // il Passaseo, fradicio, si affaccia dal bordo strada
    const xr = bici.lato === 'dx' ? 418 : 62, yr = Phaser.Math.Clamp(bici.img.y + 30, 96, 230);
    const ritratto = im(this, xr, yr, 'passaseo_shock', 0.42).setOrigin(0.5, 1).setDepth(900).setScale(0);
    this.tweens.add({ targets: ritratto, scale: scalaDi('passaseo_shock', 0.42), duration: 200, ease: 'Back.out' });
    for (let i = 0; i < 5; i++) {
      const goccia = this.add.ellipse(xr + Phaser.Math.Between(-16, 16), yr - 60, 2.4, 3.4, 0x9fd4ff).setDepth(901);
      this.tweens.add({ targets: goccia, y: yr - 10, alpha: 0, delay: 100 + i * 120, duration: 500, onComplete: () => goccia.destroy() });
    }
    this.fumRitratto?.destroy();
    this.fumRitratto = fumetto(this, Phaser.Math.Clamp(xr, 60, 420), yr - 66, caso(c.frasi), 1000, 902);
    this.time.delayedCall(1000, () => this.tweens.add({ targets: ritratto, scale: 0, duration: 160, onComplete: () => ritratto.destroy() }));
  }

  aggiorna(dt, p) {
    const c = this.cfg, t = this.tasti;

    // velocità della strada, con la frenata dopo un tocco
    const obiettivo = lerp(c.velInizio, c.velFine, p);
    if (this.freno > 0) { this.freno = Math.max(0, this.freno - dt); this.vel = lerp(obiettivo, c.velFreno, this.freno / c.ripresa); }
    else this.vel = obiettivo;
    this.auto.setTexture(this.freno > c.ripresa * 0.45 ? 'pandaFreni' : 'panda');
    const dD = this.vel * dt;
    this.scorri = (this.scorri + dD) % 270;
    this.fondo[0].y = this.scorri - 270;
    this.fondo[1].y = this.scorri;

    // sterzo
    const dir = (t.dx.isDown || t.d.isDown) - (t.sx.isDown || t.a.isDown);
    const x0 = this.x;
    if (dir) { this.modo = 'tastiera'; this.x += dir * c.velSterzo * dt; }
    else if (this.modo !== 'tastiera') this.x += Phaser.Math.Clamp((this.obiettivoX - this.x) * 10, -c.velSterzo, c.velSterzo) * dt;
    this.x = Phaser.Math.Clamp(this.x, X_MIN, X_MAX);
    if (this.modo === 'tastiera') this.obiettivoX = this.x;
    this.vx = lerp(this.vx, (this.x - x0) / Math.max(dt, 0.001), 0.3);
    this.auto.setPosition(this.x, Y_AUTO).setAngle(Phaser.Math.Clamp(this.vx * 0.05, -9, 9));

    // nuovi incontri
    this.tIncontro -= dt;
    if (this.tIncontro <= 0) { this.incontro(p); this.tIncontro = lerp(c.intervalloInizio, c.intervalloFine, p) * (0.85 + Math.random() * 0.3); }

    for (const o of this.cose) {
      o.img.y += o.f * dD + (o.extra ?? 0) * dt;
      if (o.onda && !o.sfiorato) { o.fase += dt * 2.6; o.img.x = o.x0 + Math.sin(o.fase) * o.onda; }
      const dx = Math.abs(this.x - o.img.x), dy = Math.abs(Y_AUTO - o.img.y);
      if (o.tipo === 'pozza' && !o.presa && dy < 12 && dx < c.presa) {
        o.presa = true;
        const bici = this.cose.find((b) => b.tipo === 'bici' && !b.bagnato && !b.sfiorato && Math.abs(b.img.y - o.img.y) < 34 && Math.abs(b.img.x - o.img.x) < 44);
        if (bici) this.schizza(bici, o);
        else {
          this.punti += c.puntiPozzanghera;
          Audio.sfx('splash');
          for (const s of [-1, 1]) {
            const g = im(this, o.img.x, o.img.y, 'spruzzo', 0.6).setDepth(45).setTint(0x8fd0ff);
            this.tweens.add({ targets: g, x: g.x + s * 18, alpha: 0, duration: 350, onComplete: () => g.destroy() });
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
      } else if ((o.tipo === 'trattore' || o.tipo === 'vespa') && !o.urtato && dx < AUTO.mx + (o.tipo === 'trattore' ? 14 : 6) && dy < AUTO.my + (o.tipo === 'trattore' ? 26 : 18)) {
        o.urtato = true;
        this.urti++;
        this.punti -= c.malusVeicolo;
        Audio.sfx('clacson');
        this.frena('-' + c.malusVeicolo);
        this.scansa(o.img.x, AUTO.mx + (o.tipo === 'trattore' ? 16 : 8));
      }
    }
    for (const o of this.cose) if (o.tipo === 'pozza' && !o.presa && !o.persa && o.bici && !o.bici.bagnato && o.img.y > Y_AUTO + 14) {
      o.persa = true;
      if (this.serie > 0) { this.serie = 0; this.testoSerie.setText(''); scritta(this, o.bici.img.x, o.bici.img.y - 20, 'ASCIUTTO!', { size: 8, color: '#ffffff', durata: 300 }); }
    }
    for (const o of this.cose) if (o.img.y > 310 || o.img.y < -500) { this.tweens.killTweensOf(o.img); o.img.destroy(); o.via = true; }
    this.cose = this.cose.filter((o) => !o.via);
  }

  // la Panda sterza di colpo e si toglie da davanti a quello che stava per toccare
  scansa(x, distanza) {
    let verso = Math.sign(this.x - x) || 1;
    if (x + verso * distanza < X_MIN || x + verso * distanza > X_MAX) verso = -verso;
    this.x = this.obiettivoX = Phaser.Math.Clamp(x + verso * distanza, X_MIN, X_MAX);
  }

  risultato() {
    return {
      punteggio: Math.max(0, this.punti),
      vittoria: this.schizzi >= this.cfg.obiettivoSchizzi,
      riepilogo: `${quanti(this.schizzi, 'Passaseo schizzato', 'Passaseo schizzati')}, ${quanti(this.sfiorati, 'sfiorato', 'sfiorati')}, ${quanti(this.urti, 'mezzo toccato', 'mezzi toccati')}`,
    };
  }

  finale(ris, fatto) {
    for (const o of this.hud) o.setVisible(false);
    this.fumRitratto?.destroy();
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
