// Microgioco 2: "Arriva ReGrorio!" - schiva la Golf bianca del Re.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { txt, im, scalaDi, scritta, stelle, fumo, scuoti, caso, colpetto, eTouch, vibra, multiTouch } from '../fx.js';

const CORSIE = [180, 240, 300];
const PY = 252; // piedi del giocatore
const TAGLIA = 2 / 3;
const ZONE = [160, 320];  // col dito: sinistra | salta | destra

export class ReGrorioScene extends MicrogiocoBase {
  constructor() { super('regrorio'); }

  prepara() {
    const c = this.cfg;
    this.vite = c.vite;
    this.bonus = 0;
    this.corsia = 1;
    this.auto = [];
    this.tLancio = 1.2;
    this.salto = 0;        // secondi di salto rimasti
    this.ricarica = 0;     // pausa tra un salto e l'altro
    this.colpito = false;
    this.invulnerabile = false;
    this.ko = false;
    this.ultimoCambio = { da: -1, t: -9 };

    im(this, 0, 0, 'bgStrada').setOrigin(0);
    this.ombra = this.add.ellipse(CORSIE[1], PY - 2, 38, 10, 0x000000, 0.3).setDepth(4);
    this.io = im(this, CORSIE[1], PY, this.giocatore.id + '_normale', TAGLIA).setOrigin(0.5, 1).setDepth(40);
    this.scala = this.io.scaleX;

    this.cuori = [];
    for (let i = 0; i < c.vite; i++) this.cuori.push(im(this, 13 + i * 16, 50, 'cuore').setDepth(1001));
    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });

    this.tasti = this.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT', salta: 'SPACE' });
    // dito (o clic): tocco nel terzo di sinistra = corsia a sinistra, in quello di destra = a destra,
    // in mezzo = salto. Con due dita si salta e si cambia corsia insieme.
    multiTouch(this);
    this.tocco = { sx: false, dx: false, salta: false };
    // anche i tasti passano da qui: l'evento non si perde mai, nemmeno se il tasto viene
    // premuto e lasciato nello stesso fotogramma (leggendo lo stato del tasto poteva capitare)
    for (const [tasto, zona] of [['LEFT', 'sx'], ['RIGHT', 'dx'], ['SPACE', 'salta']]) {
      this.input.keyboard.on('keydown-' + tasto, (e) => { if (!e.repeat) this.tocco[zona] = true; });
    }
    this.input.on('pointerdown', (p) => {
      const x = this.cameras.main.getWorldPoint(p.x, p.y).x, zona = x < ZONE[0] ? 'sx' : x > ZONE[1] ? 'dx' : 'salta';
      this.tocco[zona] = true;
      this.lampo(zona);
    });
    if (eTouch()) {
      // le tre zone segnate in basso (sotto alla strada, dietro alle macchine)
      const g = this.add.graphics().setDepth(3);
      g.fillStyle(0x1f1430, 0.35);
      g.fillRoundedRect(6, 254, ZONE[0] - 12, 14, 6); g.fillRoundedRect(ZONE[0] + 6, 254, ZONE[1] - ZONE[0] - 12, 14, 6); g.fillRoundedRect(ZONE[1] + 6, 254, 480 - ZONE[1] - 12, 14, 6);
      g.fillStyle(0xffe14a, 0.9);
      g.fillTriangle(ZONE[0] / 2 - 6, 261, ZONE[0] / 2 + 4, 256, ZONE[0] / 2 + 4, 266);
      g.fillTriangle((480 + ZONE[1]) / 2 + 6, 261, (480 + ZONE[1]) / 2 - 4, 256, (480 + ZONE[1]) / 2 - 4, 266);
      txt(this, 240, 261, 'SALTA', { size: 6.5, color: '#ffe14a', depth: 3 });
    }
  }

  get fase() {
    let f = this.cfg.fasi[0];
    for (const x of this.cfg.fasi) if (this.trascorso >= x.da) f = x;
    return f;
  }

  aggiorna(dt) {
    const c = this.cfg, S = this.scala;

    // --- movimento (tasti o tocchi arrivati da un fotogramma all'altro) ---
    const T = this.tocco, sx = T.sx, dx = T.dx, salta = T.salta;
    T.sx = T.dx = T.salta = false;
    if (!this.colpito) {
      const d = (dx ? 1 : 0) - (sx ? 1 : 0);
      const nuova = Phaser.Math.Clamp(this.corsia + d, 0, 2);
      if (nuova !== this.corsia) {
        this.ultimoCambio = { da: this.corsia, t: this.trascorso };
        this.corsia = nuova;
        Audio.sfx('muovi');
        this.tweens.add({ targets: [this.io, this.ombra], x: CORSIE[nuova], duration: 80, ease: 'Quad.out' });
      }
      this.ricarica -= dt;
      if (salta && this.salto <= 0 && this.ricarica <= 0) { this.salto = c.durataSalto; Audio.sfx('salto'); }
      if (this.salto > 0) {
        this.salto -= dt;
        const k = 1 - Math.max(0, this.salto) / c.durataSalto;
        const h = Math.sin(k * Math.PI);
        this.io.y = PY - h * 40;
        this.io.setScale(S * (1 - h * 0.08), S * (1 + h * 0.12));
        this.ombra.setScale(1 - h * 0.4);
        if (this.salto <= 0) { this.io.y = PY; this.io.setScale(S); this.ombra.setScale(1); this.ricarica = 0.25; colpetto(this, this.io, 1.2, 0.8); }
      }
    }
    const inAria = this.salto > 0;

    // --- arrivi di ReGrorio ---
    this.tLancio -= dt;
    if (this.tLancio <= 0) {
      const f = this.fase;
      this.tLancio = Phaser.Math.FloatBetween(f.intervallo[0], f.intervallo[1]);
      const corsia = Math.random() < 0.6 ? this.corsia : Phaser.Math.Between(0, 2);
      const dalBasso = Math.random() < f.dalBasso;
      this.annuncia(corsia, dalBasso, f);
      if (Math.random() < f.doppia) {
        const altra = caso([0, 1, 2].filter((x) => x !== corsia));
        this.annuncia(altra, dalBasso, f, true);
      }
    }

    // --- auto in movimento ---
    const quadro = Math.floor(this.trascorso * 9) % 2;
    for (const a of this.auto) {
      a.img.y += a.dir * a.vel * dt;
      a.img.setTexture((a.dir > 0 ? 'golfGiu' : 'golfSu') + quadro);
      a.tFumo -= dt;
      if (a.tFumo <= 0) { a.tFumo = 0.08; fumo(this, a.img.x, a.img.y - a.dir * 42, 1, 19, 0xd8dce6); }

      // finta: sterza all'ultimo in un'altra corsia
      if (a.finta != null && a.img.y > 60) {
        a.corsia = a.finta;
        a.finta = null;
        Audio.sfx('sgommata');
        this.tweens.add({ targets: a.img, x: CORSIE[a.corsia], duration: 170, ease: 'Quad.inOut' });
        this.tweens.add({ targets: a.img, angle: a.img.x < CORSIE[a.corsia] ? -14 : 14, duration: 85, yoyo: true });
      }

      const vicina = Math.abs(a.img.y - (PY - 22)) < 46;
      const stessaX = Math.abs(a.img.x - this.io.x) < 30;
      if (vicina && !a.passata) {
        if (stessaX && !inAria && !this.invulnerabile) { a.passata = true; this.botto(); }
        else if (!a.premiata && !this.invulnerabile) {
          // schivata all'ultimo istante: appena cambiata corsia, oppure saltata
          const scansata = this.ultimoCambio.da === a.corsia && this.trascorso - this.ultimoCambio.t < c.finestraSchivata;
          if (scansata || (inAria && stessaX)) {
            a.premiata = true;
            this.bonus += c.bonusSchivata;
            Audio.sfx('bonus');
            scritta(this, this.io.x, PY - 110, `ALL'ULTIMO! +${c.bonusSchivata}`, { size: 9, color: '#7dff9a' });
            stelle(this, this.io.x, PY - 60, 5);
          }
        }
      }
    }
    this.auto = this.auto.filter((a) => {
      const fuori = a.img.y > 340 || a.img.y < -70;
      if (fuori) a.img.destroy();
      return !fuori;
    });

    this.testoPunti.setText('PUNTI: ' + this.punti);
  }

  // la zona toccata si illumina un attimo
  lampo(zona) {
    if (!eTouch()) return;
    const x0 = zona === 'sx' ? 0 : zona === 'dx' ? ZONE[1] : ZONE[0], x1 = zona === 'sx' ? ZONE[0] : zona === 'dx' ? 480 : ZONE[1];
    const r = this.add.rectangle(x0, 0, x1 - x0, 270, 0xffffff, 0.12).setOrigin(0).setDepth(2);
    this.tweens.add({ targets: r, alpha: 0, duration: 220, onComplete: () => r.destroy() });
  }

  get punti() { return Math.floor(Math.min(this.trascorso, this.durata)) + this.bonus; }

  // clacson + "!" lampeggiante sulla corsia, poi parte la Golf
  annuncia(corsia, dalBasso, f, muta = false) {
    const x = CORSIE[corsia];
    if (!muta) Audio.sfx('clacson');
    const striscia = this.add.rectangle(x, 135, 56, 270, 0xff3b3b, 0.18).setDepth(3);
    const segno = txt(this, x, dalBasso ? 204 : 46, '!', { size: 30, color: '#ffe14a', stroke: '#c81e1e', thick: 7, depth: 60 });
    const freccia = this.add.triangle(x, dalBasso ? 232 : 74, -7, dalBasso ? 5 : -5, 7, dalBasso ? 5 : -5, 0, dalBasso ? -6 : 6, 0xffe14a).setStrokeStyle(1.5, 0xc81e1e).setDepth(60);
    this.tweens.add({ targets: [striscia, segno, freccia], alpha: 0.15, duration: 90, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: segno, scale: 1.3, duration: 180, yoyo: true, repeat: -1 });
    const attesa = f.avviso + (dalBasso ? 0.3 : 0);
    this.time.delayedCall(attesa * 1000, () => {
      striscia.destroy(); segno.destroy(); freccia.destroy();
      if (!this.inCorso) return;
      const img = im(this, x, dalBasso ? 332 : -54, dalBasso ? 'golfSu0' : 'golfGiu0').setDepth(dalBasso ? 45 : 20);
      const altre = [corsia - 1, corsia + 1].filter((k) => k >= 0 && k <= 2);
      this.auto.push({
        img, corsia, dir: dalBasso ? -1 : 1, vel: f.vel, tFumo: 0,
        finta: !dalBasso && Math.random() < f.finta ? caso(altre) : null,
      });
    });
  }

  // preso! vola in aria roteando con le stelline e torna giù
  botto() {
    const S = this.scala;
    this.vite--;
    this.colpito = true;
    this.invulnerabile = true;
    this.salto = 0;
    Audio.sfx('botto');
    vibra(90);
    scuoti(this, 250, 0.015);
    const cuore = this.cuori[this.vite];
    this.tweens.add({ targets: cuore, scale: cuore.scale * 2.5, alpha: 0, duration: 300 });
    scritta(this, this.io.x, PY - 90, caso(this.cfg.frasiBotto), { color: '#ff6b5a' });
    stelle(this, this.io.x, PY - 40, 10);
    this.io.setTexture(this.giocatore.id + '_shock').setScale(S).setOrigin(0.5, 0.5);
    this.io.y = PY - 48;
    this.tweens.add({
      targets: this.io, y: 50, angle: 720, duration: 520, ease: 'Quad.out', yoyo: true,
      onUpdate: () => this.ombra.setScale(0.4 + (this.io.y / PY) * 0.6),
      onComplete: () => {
        this.io.setOrigin(0.5, 1).setAngle(0).setTexture(this.giocatore.id + '_normale');
        this.io.y = PY;
        this.ombra.setScale(1);
        fumo(this, this.io.x, PY, 5, 41);
        colpetto(this, this.io, 1.3, 0.7);
        if (this.vite <= 0) { this.ko = true; this.termina(); return; }
        this.colpito = false;
        this.tweens.add({ targets: this.io, alpha: 0.3, duration: 90, yoyo: true, repeat: 5, onComplete: () => { this.io.alpha = 1; this.invulnerabile = false; } });
      },
    });
  }

  risultato() {
    const sec = Math.floor(Math.min(this.trascorso, this.durata));
    return {
      punteggio: sec + this.bonus,
      vittoria: !this.ko,
      riepilogo: `${sec}s sopravvissuti + ${this.bonus} bonus`,
      titoloFine: this.ko ? 'K.O.!' : 'SALVO!',
    };
  }
}
