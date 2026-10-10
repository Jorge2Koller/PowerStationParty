// Microgioco 1: "La Spina del PowerStation" - sfida di spillatura contro Beppe.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { txt, im, scalaDi, scritta, stelle, fumo, pannello, scuoti, lerp, caso, colpetto, eTouch, vibra } from '../fx.js';

const Y_BANCONE = 181;            // dove appoggia il bicchiere
const Y_BECCO = 137;              // da dove esce la birra
const X_MIO = 160, X_BEPPE = 320;
const CAVO = 43;                  // altezza interna del bicchiere (unità)

export class SpinaScene extends MicrogiocoBase {
  constructor() { super('spina'); }

  prepara() {
    this.pinte = 0;
    this.pinteBeppe = 0;
    this.tBeppe = 0;
    this.tOcchiata = 5;
    this.tChiacchiere = 1.5;

    im(this, 0, 0, 'bgPub').setOrigin(0);
    txt(this, 240, 42, 'POWERSTATION', { size: 9, color: '#f6d36b', thick: 0 });
    txt(this, 240, 69, 'OGGI ALLA SPINA', { size: 8, color: '#ffe9a0', thick: 0 });
    txt(this, 240, 92, 'Bionda ......... 5\nRossa .......... 6\nTaralli gratis', { size: 7, color: '#eef2e4', thick: 0, spacing: 0 });

    // baristi dietro al bancone
    this.io = im(this, 84, 200, this.giocatore.id + '_normale').setOrigin(0.5, 1);
    this.beppe = im(this, 398, 200, 'beppe_normale').setOrigin(0.5, 1);
    im(this, 0, 168, 'bancone').setOrigin(0).setDepth(10);
    im(this, 132, 182, 'spina').setOrigin(0, 1).setDepth(11);
    im(this, 348, 182, 'spina').setOrigin(1, 1).setFlipX(true).setDepth(11);
    this.getto = this.add.rectangle(X_MIO - 1, Y_BECCO, 3, 1, 0xf6ae1e).setOrigin(0.5, 0).setDepth(12).setVisible(false);
    this.gettoBeppe = this.add.rectangle(X_BEPPE + 1, Y_BECCO, 3, 1, 0xf6ae1e).setOrigin(0.5, 0).setDepth(12);

    // clienti di spalle che chiacchierano e gesticolano
    this.clienti = [0, 1, 2, 3].map((i) => {
      const s = im(this, 150 + i * 60, 280, `cliente${i}_0`).setOrigin(0.5, 1).setDepth(20);
      s.idx = i;
      this.tweens.add({ targets: s, y: 277, duration: 500 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      return s;
    });

    // contatore
    pannello(this, 240, 22, 176, 18, { depth: 1000 });
    this.contatore = txt(this, 240, 22, '', { size: 13, depth: 1001, thick: 3 });

    this.spazio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // dito (o mouse) tenuto premuto in qualunque punto = SPAZIO tenuto
    this.premuti = new Set();
    this.input.on('pointerdown', (p) => this.premuti.add(p.id));
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => this.premuti.delete(p.id));
    if (eTouch()) {
      // un grosso pulsante "SPILLA" come promemoria (funziona tutto lo schermo)
      this.spilla = this.add.container(56, 232).setDepth(1000);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.3); g.fillCircle(1.5, 2.5, 25);
      g.fillStyle(0xb5651d, 1); g.fillCircle(0, 0, 25);
      g.lineStyle(2.5, 0xffe14a, 1); g.strokeCircle(0, 0, 25);
      this.spilla.add([g, txt(this, 0, -4, 'SPILLA', { size: 8, color: '#ffe14a' }), txt(this, 0, 7, 'tieni premuto', { size: 4.6, color: '#fff3d6' })]);
    }
    this.bicchiereBeppe = this.creaBicchiere(X_BEPPE);
    this.nuovoBicchiere();
  }

  // dopo una pausa nessun dito risulta più appoggiato (se no la spina resterebbe aperta)
  alRientro() { this.premuti.clear(); }

  // bicchiere = contenitore con birra (ritagliata in base al livello), schiuma, zona verde e vetro
  creaBicchiere(x, zona) {
    const birra = im(this, 0, 1, 'pintaBirra').setOrigin(0.5, 1).setVisible(false);
    const schiuma = im(this, 0, 0, 'pintaSchiuma').setOrigin(0.5, 0).setVisible(false);
    const segni = this.add.graphics();
    if (zona) {
      const y1 = -3 - zona[1] * CAVO, y0 = -3 - zona[0] * CAVO;
      segni.fillStyle(0x3bff6a, 0.38); segni.fillRect(-10.5, y1, 21, y0 - y1);
      segni.fillStyle(0x3bff6a, 1);
      for (const y of [y1, y0]) { segni.fillRect(-10.5, y - 0.4, 21, 0.8); segni.fillTriangle(-19, y - 2.5, -19, y + 2.5, -14, y); segni.fillTriangle(19, y - 2.5, 19, y + 2.5, 14, y); }
    }
    const vetro = im(this, 0, 1, 'pintaVetro').setOrigin(0.5, 1);
    const b = this.add.container(x, Y_BANCONE, [birra, schiuma, segni, vetro]).setDepth(13);
    Object.assign(b, { birra, schiuma, segni });
    return b;
  }

  riempi(b, livello) {
    const L = Phaser.Math.Clamp(livello, 0, 1), yTop = 46 - L * CAVO, s = scalaDi('pintaSchiuma');
    b.birra.setVisible(L > 0.01).setCrop(0, yTop * 6, 180, (50 - yTop) * 6);
    b.schiuma.setVisible(L > 0.03).setPosition(0, -3 - L * CAVO - 2.5).setScale((s * lerp(8, 11, L)) / 11, s * Math.min(1, L * 7));
  }

  nuovoBicchiere() {
    this.bicchiere?.destroy();
    const amp = lerp(this.cfg.zonaInizio, this.cfg.zonaFine, this.progresso);
    const centro = 0.68 + Math.random() * 0.16;
    this.zona = [centro - amp / 2, centro + amp / 2];
    this.livello = 0;
    this.stato = 'pronto';
    this.armato = false; // bisogna rilasciare SPAZIO prima di ricominciare
    this.bicchiere = this.creaBicchiere(X_MIO - 40, this.zona);
    this.bicchiere.alpha = 0;
    this.tweens.add({ targets: this.bicchiere, x: X_MIO, alpha: 1, duration: 120, ease: 'Quad.out' });
  }

  aggiorna(dt, p) {
    const c = this.cfg, giu = this.spazio.isDown || this.premuti.size > 0;
    this.spilla?.setScale(giu ? 0.9 : 1).setAlpha(giu ? 1 : 0.85);

    // --- il mio bicchiere ---
    if (this.stato === 'pronto') {
      if (!giu) this.armato = true;
      else if (this.armato) { this.stato = 'versa'; Audio.versaInizio(); }
    } else if (this.stato === 'versa') {
      this.livello += lerp(c.velInizio, c.velFine, p) * dt;
      Audio.versaLivello(this.livello);
      if (this.livello >= 1) this.valuta(true);
      else if (!giu) this.valuta(false);
    }
    const verso = this.stato === 'versa';
    this.getto.setVisible(verso);
    if (verso) {
      this.getto.setSize(3, Math.max(1, Y_BANCONE - 3 - this.livello * CAVO - Y_BECCO));
      this.riempi(this.bicchiere, this.livello);
    }

    // --- Beppe, metronomo umano ---
    const interv = this.tempoRimasto <= c.beppeSprint ? c.beppeIntervalloFinale : c.beppeIntervallo;
    this.tBeppe += dt;
    const f = this.tBeppe / interv;
    const livB = Math.min(0.82, f * 1.05);
    this.riempi(this.bicchiereBeppe, livB);
    this.gettoBeppe.setVisible(livB < 0.82 && f > 0.05);
    this.gettoBeppe.setSize(3, Math.max(1, Y_BANCONE - 3 - livB * CAVO - Y_BECCO));
    if (f >= 1) {
      this.tBeppe = 0;
      this.pinteBeppe++;
      const g = this.bicchiereBeppe;
      this.bicchiereBeppe = this.creaBicchiere(X_BEPPE);
      this.servi(g, 270, false);
    }

    // occhiata di sufficienza
    this.tOcchiata -= dt;
    if (this.tOcchiata <= 0) {
      this.tOcchiata = 6 + Math.random() * 5;
      this.beppe.setTexture('beppe_sufficienza');
      Audio.sfx('tsk');
      this.fumetto(this.beppe.x - 56, 92, caso(c.frasiBeppe), 1300);
      this.time.delayedCall(1300, () => this.beppe.setTexture('beppe_normale'));
    }

    // chiacchiere dei clienti
    this.tChiacchiere -= dt;
    if (this.tChiacchiere <= 0) {
      this.tChiacchiere = 1.6 + Math.random() * 1.6;
      const s = caso(this.clienti);
      s.setTexture(`cliente${s.idx}_1`);
      this.fumetto(s.x + 8, 190, caso(c.frasiClienti), 1000);
      this.time.delayedCall(700, () => s.setTexture(`cliente${s.idx}_0`));
    }

    this.contatore.setText(`TU: ${this.pinte}  -  BEPPE: ${this.pinteBeppe}`);
    this.contatore.setColor(this.pinte > this.pinteBeppe ? '#7dff9a' : this.pinte < this.pinteBeppe ? '#ff9a8a' : '#ffffff');
  }

  valuta(traboccata) {
    const c = this.cfg, [a, b] = this.zona, g = this.bicchiere;
    Audio.versaFine();
    this.getto.setVisible(false);
    this.riempi(g, this.livello);
    g.segni.setVisible(false);
    this.bicchiere = null;

    if (!traboccata && this.livello >= a && this.livello <= b) {
      // pinta perfetta: scivola fino al cliente
      this.stato = 'attesa';
      this.pinte++;
      Audio.sfx('scivola');
      this.time.delayedCall(260, () => Audio.sfx('ding'));
      scritta(this, X_MIO, 112, 'PERFETTA!', { size: 10, color: '#7dff9a', durata: 400 });
      this.faccia('felice', 500);
      colpetto(this, this.contatore, 1.15, 1.15);
      this.servi(g, 210, true);
      this.time.delayedCall(c.pausaPerfetta * 1000, () => this.nuovoBicchiere());
      return;
    }

    this.stato = 'errore';
    Audio.sfx('errore');
    vibra(50);
    this.faccia('shock', c.penalita * 1000 - 100);
    scuoti(this, 120, 0.006);
    if (this.livello < a) {
      // troppo poca: il cliente la rimanda indietro
      scritta(this, X_MIO, 112, 'TROPPO POCA!', { size: 10, color: '#ff9a8a' });
      this.fumetto(218, 190, 'È mezza vuota!', 1000);
      this.tweens.add({ targets: g, x: 205, duration: 300, ease: 'Cubic.out', yoyo: true, hold: 250, onComplete: () => g.destroy() });
    } else {
      // troppa: la schiuma trabocca sul bancone
      scritta(this, X_MIO, 112, 'TRABOCCA!', { size: 10, color: '#ff9a8a' });
      Audio.sfx('splash');
      fumo(this, X_MIO, Y_BANCONE - 46, 6, 14, 0xfffbe8);
      for (let i = 0; i < 12; i++) {
        const d = this.add.ellipse(X_MIO + (Math.random() - 0.5) * 24, Y_BANCONE - 46, 4, 3.4, 0xfffbe8).setDepth(14);
        this.tweens.add({ targets: d, x: d.x + (Math.random() - 0.5) * 50, y: Y_BANCONE + 2, duration: 350 + Math.random() * 250, ease: 'Bounce.out', onComplete: () => this.tweens.add({ targets: d, alpha: 0, delay: 400, duration: 200, onComplete: () => d.destroy() }) });
      }
      this.tweens.add({ targets: g, alpha: 0, delay: 700, duration: 250, onComplete: () => g.destroy() });
    }
    this.time.delayedCall(c.penalita * 1000, () => this.nuovoBicchiere());
  }

  // il bicchiere scivola sul bancone fino al cliente, che se lo prende
  servi(g, xArrivo, mio) {
    this.tweens.add({
      targets: g, x: xArrivo, duration: 300, ease: 'Cubic.out',
      onComplete: () => {
        if (mio) stelle(this, xArrivo, Y_BANCONE - 24, 6, 15);
        this.tweens.add({ targets: g, y: g.y + 26, alpha: 0, delay: 120, duration: 200, onComplete: () => g.destroy() });
      },
    });
  }

  faccia(espr, ms) {
    this.io.setTexture(`${this.giocatore.id}_${espr}`);
    this.tFaccia?.remove();
    this.tFaccia = this.time.delayedCall(ms, () => this.io.setTexture(this.giocatore.id + '_normale'));
  }

  fumetto(x, y, s, ms) {
    const t = txt(this, 0, 0, s, { size: 7, color: '#1f1430', thick: 0 });
    const w = t.width + 8, h = 13;
    const g = this.add.graphics();
    g.fillStyle(0x1f1430, 1); g.fillRoundedRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2, 6);
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 5); g.fillTriangle(-4, h / 2 - 0.5, 3, h / 2 - 0.5, -3, h / 2 + 4.5);
    const b = this.add.container(x, y, [g, t]).setDepth(30).setScale(0.3);
    this.tweens.add({ targets: b, scale: 1, duration: 140, ease: 'Back.out' });
    this.time.delayedCall(ms, () => b.destroy());
  }

  risultato() {
    return {
      punteggio: this.pinte,
      vittoria: this.pinte > this.pinteBeppe,
      riepilogo: `Pinte: tu ${this.pinte} - Beppe ${this.pinteBeppe}`,
    };
  }
}
