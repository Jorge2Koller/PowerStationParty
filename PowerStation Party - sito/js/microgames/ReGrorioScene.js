// Microgioco 2: "Arriva ReGrorio!" - schiva la Golf bianca del Re. SCHIVA!
//
//  Tre corsie: un "!" lampeggiante dice dove sta per passare la Golf; si cambia corsia o si salta.
//  Oltre a sopravvivere si raccolgono le MONETE che rotolano sulla strada (a volte proprio nella
//  corsia della Golf) e la CORONA che il Re perde davanti alla macchina: per prenderla bisogna
//  restare davanti alla Golf fino all'ultimo (il rischio, che vale tanto).
//  Le fasi si annunciano: ARRIVA DA DIETRO!, FA LE FINTE!, IL RE SI ARRABBIA!
//  Monete, corone e Golf arrivano nello stesso ordine per tutti i giocatori del round (seme).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { txt, im, scritta, stelle, fumo, scuoti, caso, colpetto, eTouch, vibra, multiTouch } from '../fx.js';

const CORSIE = [180, 240, 300];
const PY = 252; // piedi del giocatore
const Y_PRESA = PY - 20; // dove si prendono monete e corone
const TAGLIA = 2 / 3;
const ZONE = [160, 320];  // col dito: sinistra | salta | destra

export class ReGrorioScene extends MicrogiocoBase {
  constructor() { super('regrorio'); }

  prepara() {
    const c = this.cfg;
    this.rnd = casuale(Sessione.seme);
    this.vite = c.vite;
    this.bonus = 0;
    this.monete = 0;           // monete prese
    this.corone = 0;           // corone prese
    this.corsia = 1;
    this.auto = [];
    this.tesori = [];          // monete e corone sulla strada
    this.tLancio = 1.2;
    this.tMonete = c.primeMonete;
    this.salto = 0;        // secondi di salto rimasti
    this.ricarica = 0;     // pausa tra un salto e l'altro
    this.colpito = false;
    this.invulnerabile = false;
    this.ko = false;
    this.ultimoCambio = { da: -1, t: -9 };
    this.avvisi = [];          // corsie dove sta per passare una Golf (le legge anche il giocatore automatico)
    this.nFase = 0;

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
      // le tre zone segnate in basso coi loro tasti (sotto alla strada, dietro alle macchine)
      im(this, ZONE[0] / 2, 260, 'tastoRe_sx').setDepth(3);
      im(this, (480 + ZONE[1]) / 2, 260, 'tastoRe_dx').setDepth(3);
      im(this, 240, 260, 'tastoRe_salta').setDepth(3);
      txt(this, 248, 260, 'SALTA', { size: 8, color: '#ffe14a', depth: 3 });
    }
  }

  get fase() {
    let f = this.cfg.fasi[0];
    for (const x of this.cfg.fasi) if (this.trascorso >= x.da) f = x;
    return f;
  }

  aggiorna(dt) {
    const c = this.cfg, S = this.scala, F = this.fase;

    // --- le fasi si annunciano ---
    const n = c.fasi.indexOf(F);
    if (n !== this.nFase) {
      this.nFase = n;
      if (F.nome) {
        Audio.sfx('clacson');
        scritta(this, 240, 120, F.nome, { size: 14, color: '#ffe14a', durata: 900 });
        if (F.arrabbiato) scuoti(this, 300, 0.01);
      }
    }

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
      const r = this.rnd;
      this.tLancio = F.intervallo[0] + r() * (F.intervallo[1] - F.intervallo[0]);
      const corsia = r() < 0.6 ? this.corsia : Math.floor(r() * 3);
      const dalBasso = r() < F.dalBasso;
      this.annuncia(corsia, dalBasso, F);
      if (r() < F.doppia) {
        const altre = [0, 1, 2].filter((x) => x !== corsia);
        this.annuncia(altre[Math.floor(r() * altre.length)], dalBasso, F, true);
      }
    }

    // --- monete che rotolano giù, a file ---
    this.tMonete -= dt;
    if (this.tMonete <= 0) {
      const r = this.rnd;
      this.tMonete = c.ogniMonete[0] + r() * (c.ogniMonete[1] - c.ogniMonete[0]);
      const corsia = Math.floor(r() * 3), quante = c.filaMonete[0] + Math.floor(r() * (c.filaMonete[1] - c.filaMonete[0] + 1));
      for (let i = 0; i < quante; i++) this.tesoro('moneta', CORSIE[corsia], -14 - i * c.passoMonete, c.velMonete);
    }

    // --- auto in movimento ---
    const quadro = Math.floor(this.trascorso * 9) % 2;
    for (const a of this.auto) {
      a.img.y += a.dir * a.vel * dt;
      a.img.setTexture((a.dir > 0 ? 'golfGiu' : 'golfSu') + quadro);
      a.tFumo -= dt;
      if (a.tFumo <= 0) { a.tFumo = 0.08; fumo(this, a.img.x, a.img.y - a.dir * 42, 1, 19, 0xd8dce6); }

      // finta: sterza all'ultimo in un'altra corsia (la corona, se c'è, resta dov'è)
      if (a.finta != null && a.img.y > 60) {
        a.corsia = a.finta;
        a.finta = null;
        if (a.corona) a.corona.vel = c.velMonete;
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

    // --- monete e corone: rotolano e si prendono passandoci sopra (anche saltando) ---
    for (const t of this.tesori) {
      t.img.y += t.vel * dt;
      t.giro += dt;
      if (t.tipo === 'moneta') t.img.scaleX = t.s0 * Math.max(0.25, Math.abs(Math.cos(t.giro * 7)));
      else t.img.setAngle(Math.sin(t.giro * 9) * 12);
      if (!t.presa && !this.colpito && Math.abs(t.img.y - Y_PRESA) < 16 && Math.abs(t.img.x - this.io.x) < 22) this.prendi(t);
    }
    this.tesori = this.tesori.filter((t) => {
      const via = t.presa || t.img.y > 290;
      if (via && !t.presa) t.img.destroy();
      return !via;
    });

    this.testoPunti.setText('PUNTI: ' + this.punti);
  }

  tesoro(tipo, x, y, vel) {
    const img = im(this, x, y, tipo === 'moneta' ? 'monetaRe' : 'coronaRe').setDepth(tipo === 'moneta' ? 15 : 21);
    const t = { tipo, img, vel, giro: Math.random() * 3, s0: img.scaleX, presa: false };
    this.tesori.push(t);
    return t;
  }

  prendi(t) {
    const c = this.cfg, corona = t.tipo === 'corona', v = corona ? c.puntiCorona : c.puntiMoneta;
    t.presa = true;
    if (corona) this.corone++; else this.monete++;
    this.bonus += v;
    Audio.sfx(corona ? 'bonus' : 'ding');
    if (corona) {
      scritta(this, this.io.x, PY - 96, `LA CORONA! +${v}`, { size: 10, color: '#ffe14a' });
      stelle(this, this.io.x, PY - 50, 8);
    }
    colpetto(this, this.testoPunti, 1.15, 1.15);
    this.tweens.add({ targets: t.img, y: t.img.y - 26, alpha: 0, scale: t.s0 * 1.6, duration: 220, onComplete: () => t.img.destroy() });
  }

  // la zona toccata si illumina un attimo
  lampo(zona) {
    if (!eTouch()) return;
    const x0 = zona === 'sx' ? 0 : zona === 'dx' ? ZONE[1] : ZONE[0], x1 = zona === 'sx' ? ZONE[0] : zona === 'dx' ? 480 : ZONE[1];
    const r = this.add.rectangle(x0, 0, x1 - x0, 270, 0xffffff, 0.12).setOrigin(0).setDepth(2);
    this.tweens.add({ targets: r, alpha: 0, duration: 220, onComplete: () => r.destroy() });
  }

  get punti() { return Math.floor(Math.min(this.trascorso, this.durata)) + this.bonus; }

  // clacson + "!" lampeggiante sulla corsia, poi parte la Golf (a volte con la corona davanti)
  annuncia(corsia, dalBasso, f, muta = false) {
    const x = CORSIE[corsia], r = this.rnd;
    const altre = [corsia - 1, corsia + 1].filter((k) => k >= 0 && k <= 2);
    const finta = !dalBasso && r() < f.finta ? altre[Math.floor(r() * altre.length)] : null;
    const corona = !dalBasso && r() < f.corona;
    if (!muta) Audio.sfx('clacson');
    // la corsia si accende (forte dalla parte da cui arriva), il cartello di pericolo lampeggia e
    // tre frecce scorrono nel verso della Golf
    const striscia = im(this, x, 135, 'corsiaPericolo').setDepth(3).setFlipY(dalBasso).setAlpha(0.9);
    const cartello = im(this, x, dalBasso ? 212 : 40, 'cartelloPericolo').setDepth(60);
    const frecce = [0, 1, 2].map((i) => im(this, x, 0, 'chevron').setDepth(59).setFlipY(dalBasso).setAlpha(0));
    const y0 = dalBasso ? 196 : 62, verso = dalBasso ? -1 : 1;
    frecce.forEach((fr, i) => this.tweens.add({ targets: fr, y: { from: y0, to: y0 + verso * 36 }, alpha: { from: 1, to: 0 }, duration: 520, delay: i * 170, repeat: -1 }));
    this.tweens.add({ targets: striscia, alpha: 0.45, duration: 150, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: cartello, scale: cartello.scale * 1.18, duration: 150, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const avviso = { corsia };
    this.avvisi.push(avviso);
    const attesa = f.avviso + (dalBasso ? 0.3 : 0);
    this.time.delayedCall(attesa * 1000, () => {
      striscia.destroy(); cartello.destroy(); frecce.forEach((fr) => fr.destroy());
      this.avvisi = this.avvisi.filter((v) => v !== avviso);
      if (!this.inCorso) return;
      const img = im(this, x, dalBasso ? 332 : -54, dalBasso ? 'golfSu0' : 'golfGiu0').setDepth(dalBasso ? 45 : 20);
      const a = { img, corsia, dir: dalBasso ? -1 : 1, vel: f.vel, tFumo: 0, finta };
      // la corona rotola davanti al muso della Golf, alla sua stessa velocità
      if (corona) a.corona = this.tesoro('corona', x, img.y + this.cfg.anticipoCorona, f.vel);
      this.auto.push(a);
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
    const tesori = this.monete * this.cfg.puntiMoneta + this.corone * this.cfg.puntiCorona;
    return {
      punteggio: sec + this.bonus,
      vittoria: !this.ko,
      riepilogo: `${sec}s vivo + ${tesori} di monete e corone (${this.corone} corone) + ${this.bonus - tesori} di schivate`,
      titoloFine: this.ko ? 'K.O.!' : 'SALVO!',
    };
  }
}
