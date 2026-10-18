// Microgioco 14: "L'Incubo degli Scapoli" - sfida di ballo contro il Manna. BALLA!
//
//  La pista vista di fronte: tu a sinistra, il Manna a destra, lo Zio DJ in fondo e cinque
//  ragazze che guardano chi balla meglio. Al centro le frecce scendono a tempo di musica:
//  quando una arriva sul suo bersaglio, in basso, si preme quella freccia (FRECCE o WASD; col
//  dito o col mouse si tocca il quarto di schermo della freccia). Perfetto o buono: balli, la
//  pista pende verso di te e le ragazze passano dalla tua parte; mancata: tornano dal Manna, che
//  intanto tira sempre un po' (chi sta fermo le perde tutte).
//  Tre atti: si comincia piano, poi arrivano le frecce d'oro (valgono doppio ma vanno prese
//  precise: la mossa rischiosa), alla fine il Manna si scatena, la musica accelera e arriva
//  qualche freccia doppia (con la finestra più larga: due tasti, o due dita, insieme).
//  Le frecce sono le stesse per tutti i giocatori del round (seme del round): conta l'abilità.
//  Il tempo è quello della musica (Audio.posizione); senza audio si va col proprio orologio.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { PALCO } from '../grafica/palco.js';
import { preparaBallo } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, scuoti, lerp, caso, quanti, eTouch, perDito, vibra, multiTouch, puntatore, fumetto, puntiHud, numero } from '../fx.js';

const CORSIE = [192, 224, 256, 288];          // le quattro frecce: sinistra, giù, su, destra
const ANGOLI = [-90, 180, 0, 90];
const Y_BERSAGLIO = 218;                       // i bersagli, in basso: le frecce scendono dall'alto
const PIX_PASSO = 26;                          // quanto scende una freccia in un passo (un ottavo di battuta)
const BPM = 132;                               // la musica 'pista' (audio.js)
const TASTI = { ARROWLEFT: 0, A: 0, ARROWDOWN: 1, S: 1, ARROWUP: 2, W: 2, ARROWRIGHT: 3, D: 3 };
const N_RAGAZZE = 5;
const TAGLIA = 0.72, TAGLIA_RAGAZZA = 0.4;
const Y_RAGAZZE = 160;
const lato = (io, k) => (io ? 26 + k * 30 : 454 - k * 30);   // i posti delle ragazze: dalla mia parte o da quella del Manna

export class ScapoliScene extends MicrogiocoBase {
  constructor() { super('scapoli'); }

  // la musica: normale, poi nell'ultimo atto accelera fino a tempoFinale (MicrogiocoBase la usa)
  tempoMusica() {
    const c = this.cfg, da = c.atti[c.atti.length - 1].da;
    return this.trascorso < da ? 1 : lerp(1, c.tempoFinale, Math.min(1, (this.trascorso - da) / (c.durata - da)));
  }
  durPasso() { return 60 / (BPM * this.tempoMusica()) / 2; }

  prepara() {
    const c = this.cfg;
    im(this, 0, 0, 'bgPalco').setOrigin(0);
    this.dj = im(this, 240, PALCO.consolle + 10, 'zioDJ', 0.42).setOrigin(0.5, 1).setDepth(2);
    im(this, 240, PALCO.consolle + 10, 'consollePalco').setDepth(3);
    txt(this, 240, PALCO.consolle + 13, 'ZIO DJ', { size: 6, color: '#3bd0ff', thick: 0, depth: 4 });

    // le corsie delle frecce, un po' scure così le frecce si vedono anche sopra al DJ
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x0a0518, 0.45); g.fillRoundedRect(CORSIE[0] - 15, 34, CORSIE[3] - CORSIE[0] + 30, Y_BERSAGLIO - 34 + 22, 8);
    this.bersagli = CORSIE.map((x, i) => im(this, x, Y_BERSAGLIO, 'bersaglioBallo', 1.25).setAngle(ANGOLI[i]).setDepth(6));
    this.lampi = CORSIE.map((x) => this.add.ellipse(x, Y_BERSAGLIO, 30, 30, 0xffffff, 0).setDepth(7).setBlendMode(Phaser.BlendModes.ADD));

    // io, il Manna, le ragazze
    preparaBallo(this, this.giocatore.id);
    this.io = im(this, 92, 268, `${this.giocatore.id}_normale`, TAGLIA).setOrigin(0.5, 1).setDepth(20);
    this.tBallo = 0;          // fino a quando balla (ogni freccia presa lo fa ballare un po')
    this.passoBallo = 0;
    this.manna = im(this, 388, 268, 'manna_balla1', TAGLIA).setOrigin(0.5, 1).setDepth(20);
    this.tipi = Phaser.Utils.Array.Shuffle([0, 1, 2, 3, 4]);
    // la pista: da che parte pende (0 = tutta del Manna, 1 = tutta mia). Si parte a metà: due
    // ragazze con me, tre col Manna (la terza bisogna conquistarla)
    this.pista = 0.5;
    const mie0 = Math.floor(this.pista * N_RAGAZZE);
    this.ragazze = this.tipi.map((t, k) => {
      const mia = k < mie0;
      const img = im(this, lato(mia, mia ? k : N_RAGAZZE - 1 - k), Y_RAGAZZE, `tipa${t}_${mia ? 'felice' : 'normale'}`, TAGLIA_RAGAZZA).setOrigin(0.5, 1).setDepth(10).setFlipX(!mia);
      return { t, img, mia };
    });
    this.barra = this.add.graphics().setDepth(1000);
    txt(this, 128, 26, 'TU', { size: 8, color: this.giocatore.colore, depth: 1001, ox: 1 });
    txt(this, 352, 26, 'MANNA', { size: 8, color: '#f6c63a', depth: 1001, ox: 0 });
    this.testoPunti = txt(this, 474, 36, '', { size: 9, ox: 1, depth: 1001 });

    // lo spartito: uguale per tutti i giocatori del round
    this.note = this.spartito(casuale(Sessione.seme));
    this.prossima = 0;                         // la prima nota non ancora disegnata
    this.pos = -c.primoPasso;                  // dove siamo, in passi (si parte un po' prima della prima nota)
    this.offsetAudio = null;
    this.punti = 0; this.combo = 0; this.comboMax = 0; this.perfetti = 0; this.buoni = 0; this.mancate = 0;
    this.atto = 0;
    this.tFrase = 5;
    this.ultimoBattito = -1;

    // comandi: tastiera, dito o mouse (un quarto di schermo per freccia; più dita insieme per le doppie)
    this.input.keyboard.on('keydown', (e) => { if (!e.repeat && TASTI[e.key.toUpperCase()] !== undefined) this.premi(TASTI[e.key.toUpperCase()]); });
    multiTouch(this, 4);
    this.input.on('pointerdown', (p) => { if (this.inCorso) this.premi(Phaser.Math.Clamp(Math.floor(puntatore(this, p).x / 120), 0, 3)); });
    if (eTouch()) {
      // sul telefono, i quattro quarti dello schermo segnati in basso
      const h = this.add.graphics().setDepth(900);
      for (let i = 0; i < 4; i++) { h.fillStyle(0x1f1430, 0.35); h.fillRoundedRect(i * 120 + 6, 250, 108, 16, 7); }
      CORSIE.forEach((_x, i) => im(this, 60 + i * 120, 258, 'bersaglioBallo', 0.7).setAngle(ANGOLI[i]).setDepth(901).setAlpha(0.8));
    }
    this.aggiornaHud();
  }

  // le note: { passo, corsia, oro, img, fatta }. Si scrive tutto all'inizio, col tempo della musica.
  spartito(rnd) {
    const c = this.cfg, note = [];
    // l'istante di ogni passo (la musica accelera nell'ultimo atto): t[n] in secondi
    const durata = (t) => 60 / (BPM * (t < c.atti[c.atti.length - 1].da ? 1 : lerp(1, c.tempoFinale, Math.min(1, (t - c.atti[c.atti.length - 1].da) / (c.durata - c.atti[c.atti.length - 1].da))))) / 2;
    const tPasso = [0];
    while (tPasso[tPasso.length - 1] < c.durata + 1) tPasso.push(tPasso[tPasso.length - 1] + durata(tPasso[tPasso.length - 1]));
    let n = 0, ultima = -1, ripetute = 0;
    while (tPasso[n] < c.durata - 0.7) {
      const a = c.atti.filter((x) => tPasso[n] >= x.da).pop();
      let corsia = Math.floor(rnd() * 4);
      if (corsia === ultima && ++ripetute >= 2) { corsia = (corsia + 1 + Math.floor(rnd() * 3)) % 4; ripetute = 0; } else if (corsia !== ultima) ripetute = 0;
      ultima = corsia;
      const oro = rnd() < a.oro;
      // la doppia (solo nell'ultimo atto, mai subito dopo un'altra): due frecce insieme
      if (!oro && rnd() < a.doppie && note[note.length - 1]?.passo < n - 4 && !note[note.length - 1]?.doppia) {
        note.push({ passo: n, corsia, oro, doppia: true });
        note.push({ passo: n, corsia: (corsia + 1 + Math.floor(rnd() * 3)) % 4, oro: false, doppia: true });
        n += Math.max(4, a.ogni);
        continue;
      }
      note.push({ passo: n, corsia, oro });
      n += rnd() < a.raffica ? 1 : a.ogni;
    }
    return note;
  }

  aggiornaHud() {
    const b = this.barra, x0 = 134, W = 212, m = this.pista;
    b.clear();
    b.fillStyle(0x1f1430, 0.9); b.fillRoundedRect(x0 - 2, 21, W + 4, 10, 5);
    b.fillStyle(0xf6c63a, 1); b.fillRoundedRect(x0, 23, W, 6, 3);
    b.fillStyle(Phaser.Display.Color.HexStringToColor(this.giocatore.colore).color, 1); if (m > 0.01) b.fillRoundedRect(x0, 23, W * m, 6, Math.min(3, W * m / 2));
    for (let k = 1; k < N_RAGAZZE; k++) { b.fillStyle(0x1f1430, 0.8); b.fillRect(x0 + (W * k) / N_RAGAZZE - 0.5, 23, 1, 6); }
    const molt = this.moltiplicatore();
    this.testoPunti.setText(puntiHud(this.punti) + (molt > 1 ? `  x${numero(molt, 1)}` : ''));
  }

  moltiplicatore() { return Math.min(this.cfg.maxMoltiplicatore, 1 + Math.floor(this.combo / 10) * 0.5); }

  // una freccia premuta (o il suo quarto di schermo toccato)
  premi(corsia) {
    if (!this.inCorso) return;
    const c = this.cfg, dur = this.durPasso();
    this.lampi[corsia].setFillStyle(0xffffff, 0.35);
    this.tweens.add({ targets: this.lampi[corsia], fillAlpha: 0, duration: 140 });
    // la nota più vicina in quella corsia, se è abbastanza vicina
    let scelta = null, errore = Infinity;
    for (let i = Math.max(0, this.prossima - 40); i < this.prossima; i++) {
      const n = this.note[i];
      if (n.fatta || n.corsia !== corsia) continue;
      const e = Math.abs(n.passo - this.pos) * dur;
      if (e < errore) { errore = e; scelta = n; }
    }
    if (!scelta || errore > this.finestra(scelta).buono) {
      // a vuoto: niente punti e la serie riparte (pestare a caso non conviene)
      this.combo = 0;
      this.spingi(-c.spinta.vuoto);
      this.io.setTint(0xffb0b0); this.time.delayedCall(90, () => this.io.clearTint());
      return this.aggiornaHud();
    }
    const f = this.finestra(scelta);
    const voto = errore <= f.perfetto ? 'perfetto' : errore <= f.buono ? 'buono' : 'mancato';
    if (voto === 'mancato') return this.manca(scelta, 'TROPPO TARDI!');
    scelta.fatta = true;
    this.combo++; this.comboMax = Math.max(this.comboMax, this.combo);
    if (voto === 'perfetto') this.perfetti++; else this.buoni++;
    const molt = this.moltiplicatore(), base = (voto === 'perfetto' ? c.puntiPerfetto : c.puntiBuono) * (scelta.oro ? 2 : 1);
    const guadagno = Math.round(base * molt);
    this.punti += guadagno;
    this.spingi((voto === 'perfetto' ? c.spinta.perfetto : c.spinta.buono) * (scelta.oro ? 2 : 1));
    Audio.sfx(scelta.oro ? 'bonus' : voto === 'perfetto' ? 'preso' : 'muovi');
    const x = CORSIE[corsia];
    this.balla();
    scritta(this, x, Y_BERSAGLIO - 24, voto === 'perfetto' ? (scelta.oro ? 'ORO!' : 'PERFETTO') : 'BUONO', { size: 8, color: scelta.oro ? '#ffe14a' : voto === 'perfetto' ? '#7dff9a' : '#9af0ff', durata: 220, depth: 960 }).setAngle(0);
    if (scelta.img) { const img = scelta.img; scelta.img = null; this.tweens.add({ targets: img, scale: img.scale * 1.6, alpha: 0, duration: 160, onComplete: () => img.destroy() }); }
    if (voto === 'perfetto') stelle(this, x, Y_BERSAGLIO, scelta.oro ? 6 : 3, 950);
    if (this.combo > 0 && this.combo % 10 === 0) {
      Audio.sfx('ok');
      scritta(this, 240, 120, `SERIE DA ${this.combo}! x${numero(this.moltiplicatore(), 1)}`, { size: 11, color: '#ffe14a', durata: 500 });
    }
    this.aggiornaHud();
  }

  // la finestra di tempo di una freccia: quelle d'oro sono più strette, le doppie più larghe
  finestra(n) {
    const c = this.cfg;
    return n.oro ? c.finestreOro : n.doppia ? c.finestreDoppie : c.finestre;
  }

  // freccia presa: chi gioca balla (cambia passo subito, e continua a tempo per un po')
  balla() {
    this.tBallo = this.trascorso + this.cfg.durataBallo;
    this.passoBallo = 1 - this.passoBallo;
    this.io.tFaccia = 0;
    this.io.setTexture(`${this.giocatore.id}_balla${this.passoBallo + 1}`);
  }

  manca(n, perche) {
    const c = this.cfg;
    n.fatta = true;
    this.mancate++;
    this.combo = 0;
    this.spingi(-c.spinta.mancato);
    if (n.img) { const img = n.img; n.img = null; img.setTint(0x777777); this.tweens.add({ targets: img, alpha: 0, y: img.y + 10, duration: 200, onComplete: () => img.destroy() }); }
    scritta(this, CORSIE[n.corsia], Y_BERSAGLIO - 24, perche, { size: 8, color: '#ff9a8a', durata: 220, depth: 960 }).setAngle(0);
    this.tBallo = 0;
    this.faccia(this.io, `${this.giocatore.id}_triste`, 350);
    Audio.sfx('errore');
    vibra(30);
    if (Math.random() < 0.35) this.faccia(this.manna, 'manna_occhiolino', 450);
    this.aggiornaHud();
  }

  // la pista pende di più verso di me (d > 0) o verso il Manna; le ragazze seguono
  spingi(d) {
    this.pista = Phaser.Math.Clamp(this.pista + d, 0, 1);
    const mie = Math.min(N_RAGAZZE, Math.floor(this.pista * N_RAGAZZE + 1e-6));
    // le prime "mie" dell'elenco stanno con me, le altre col Manna
    this.ragazze.forEach((r, k) => {
      const ora = k < mie;
      if (ora === r.mia) return;
      r.mia = ora;
      r.img.setTexture(`tipa${r.t}_${ora ? 'felice' : 'normale'}`).setFlipX(!ora);
      this.tweens.killTweensOf(r.img);
      this.tweens.add({ targets: r.img, x: lato(ora, ora ? k : N_RAGAZZE - 1 - k), duration: 520, ease: 'Sine.inOut' });
      this.tweens.add({ targets: r.img, y: Y_RAGAZZE - 8, duration: 260, yoyo: true, ease: 'Quad.out' });
      if (ora) { Audio.sfx('ding'); stelle(this, lato(true, k), Y_RAGAZZE - 40, 4, 900); }
      else Audio.sfx('furto');
    });
  }

  faccia(img, key, ms) {
    img.setTexture(key);
    img.tFaccia = this.trascorso + ms / 1000;
  }

  aggiorna(dt) {
    const c = this.cfg, dur = this.durPasso();
    // dove siamo nella musica: il proprio orologio, tenuto agganciato all'audio quando c'è
    this.pos += dt / dur;
    const ap = Audio.posizione;
    if (ap != null) {
      if (this.offsetAudio == null) this.offsetAudio = ap - this.pos;
      // (col ritardo audio misurato nelle Impostazioni le frecce vanno a tempo con quello che si sente)
      this.pos += (ap - this.offsetAudio - Audio.ritardo / dur - this.pos) * Math.min(1, dt * 3);
    }

    // l'atto: all'inizio di quelli nuovi, un annuncio
    const atto = c.atti.filter((x) => this.trascorso >= x.da).length - 1;
    if (atto !== this.atto) {
      this.atto = atto;
      Audio.sfx('bonus');
      scritta(this, 240, 120, c.atti[atto].nome, { size: 14, color: atto === c.atti.length - 1 ? '#ff6b9a' : '#ffe14a', durata: 900 });
      if (atto === c.atti.length - 1) { this.faccia(this.manna, 'manna_colpo', 1200); scuoti(this, 300, 0.006); }
    }

    // la pressione del Manna: la pista pende piano verso di lui (finché ci sono frecce da prendere)
    const ultima = this.note[this.note.length - 1];
    if (ultima && this.pos < ultima.passo + 2) this.spingi(-c.pressione[atto] * dt);

    // le note: si creano poco prima di entrare nello schermo (in alto), scendono, quelle passate sono mancate
    const vista = (Y_BERSAGLIO + 20) / PIX_PASSO + 1;
    while (this.prossima < this.note.length && this.note[this.prossima].passo - this.pos < vista) {
      const n = this.note[this.prossima++];
      n.img = im(this, CORSIE[n.corsia], -20, n.oro ? 'frecciaOro' : 'frecciaBallo', 1.25).setAngle(ANGOLI[n.corsia]).setDepth(8);
      // le doppie hanno un alone, per riconoscerle
      if (n.doppia) n.img.setTint(0xffd6ff);
    }
    for (let i = Math.max(0, this.prossima - 40); i < this.prossima; i++) {
      const n = this.note[i];
      if (n.fatta) continue;
      if (n.img) n.img.y = Y_BERSAGLIO - (n.passo - this.pos) * PIX_PASSO;
      if ((this.pos - n.passo) * dur > this.finestra(n).buono) this.manca(n, 'MANCATA');
    }
    // la prima doppia: un avviso
    const doppia = !this.vistaDoppia && this.note.find((n, i) => i < this.prossima && n.doppia && !n.fatta && n.img && n.img.y > 60);
    if (doppia) { this.vistaDoppia = true; scritta(this, 240, 96, perDito('DOPPIA: DUE TASTI INSIEME!', 'DOPPIA: DUE DITA INSIEME!'), { size: 10, color: '#ffd6ff', durata: 900 }).setAngle(0); }

    // a tempo: il Manna balla, il DJ muove la testa, i bersagli pulsano
    const battito = Math.floor(this.pos / 2);
    if (battito !== this.ultimoBattito && this.pos >= 0) {
      this.ultimoBattito = battito;
      if (!(this.manna.tFaccia > this.trascorso)) this.manna.setTexture(battito % 2 ? 'manna_balla2' : 'manna_balla1');
      this.dj.setScale(scalaDi('zioDJ', 0.42) * 1.03, scalaDi('zioDJ', 0.42) * 0.97);
      this.time.delayedCall(110, () => this.dj.setScale(scalaDi('zioDJ', 0.42)));
      for (const b of this.bersagli) { b.setScale(scalaDi('bersaglioBallo', 1.25) * 1.12); this.tweens.add({ targets: b, scale: scalaDi('bersaglioBallo', 1.25), duration: 160 }); }
      for (const r of this.ragazze) if (Math.random() < 0.3) this.tweens.add({ targets: r.img, y: Y_RAGAZZE - 3, duration: 90, yoyo: true });
    }
    // chi gioca: balla a tempo finché prende le frecce, se no torna fermo
    if (this.io.tFaccia && this.io.tFaccia < this.trascorso) { this.io.tFaccia = 0; this.io.setTexture(`${this.giocatore.id}_normale`); }
    if (this.tBallo && battito !== this.battitoBallo) {
      this.battitoBallo = battito;
      if (this.tBallo > this.trascorso) { this.passoBallo = 1 - this.passoBallo; this.io.setTexture(`${this.giocatore.id}_balla${this.passoBallo + 1}`); }
      else { this.tBallo = 0; if (!this.io.tFaccia) this.io.setTexture(`${this.giocatore.id}_normale`); }
    }
    if (this.manna.tFaccia && this.manna.tFaccia < this.trascorso) this.manna.tFaccia = 0;

    // ogni tanto il Manna dice la sua
    this.tFrase -= dt;
    if (this.tFrase <= 0) { this.tFrase = 6 + Math.random() * 3; fumetto(this, 388, 150, caso(this.pista > 0.5 ? c.frasiMannaPerde : c.frasiManna), 1300, 800); }
    this.aggiornaHud();
  }

  mie() { return this.ragazze.filter((r) => r.mia).length; }

  risultato() {
    const c = this.cfg, mie = this.mie();
    return {
      punteggio: Math.round(this.punti + c.bonusRagazze[mie]),
      vittoria: mie >= c.ragazzeVittoria,
      riepilogo: `${quanti(mie, 'ragazza', 'ragazze')} con te (+${c.bonusRagazze[mie]}), ${quanti(this.perfetti, 'perfetta', 'perfette')}, serie max ${this.comboMax}`,
      titoli: ['CHE BALLERINO!', 'VINCE IL MANNA!'],
    };
  }

  // Vittoria: il Manna se ne va da solo, toccandosi la collanina; sconfitta: lui con le ragazze
  finale(ris, fatto) {
    for (const n of this.note) n.img?.setVisible(false);
    for (const o of [...this.bersagli, ...this.lampi, this.barra, this.testoPunti]) o.setVisible(false);
    Audio.sfx('tempo');
    const buio = this.add.rectangle(0, 0, 480, 270, 0x05020c, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: buio, fillAlpha: 0.7, duration: 400 });
    const grande = (key, x, y, k) => im(this, x, y, key, k).setOrigin(0.5, 1).setDepth(705);
    const mie = this.ragazze.filter((r) => r.mia);
    this.time.delayedCall(500, () => {
      if (ris.vittoria) {
        Audio.sfx('vittoria');
        txt(this, 240, 26, 'IL MANNA TORNA A CASA DA SOLO!', { size: 14, color: '#7dff9a', depth: 710 });
        const io = grande(`${this.giocatore.id}_felice`, 240, 262, 0.95);
        this.tweens.add({ targets: io, y: 248, duration: 240, yoyo: true, repeat: -1, ease: 'Quad.out' });
        mie.forEach((r, k) => {
          const x = 240 + (k - (mie.length - 1) / 2) * 56 + (k < mie.length / 2 ? -40 : 40);
          const s = grande(`tipa${r.t}_felice`, x, 262, 0.7).setFlipX(x > 240).setDepth(704);
          this.tweens.add({ targets: s, y: 256, duration: 200 + k * 30, yoyo: true, repeat: -1 });
        });
        const solo = grande('manna_collana', 430, 262, 0.7).setDepth(703);
        this.tweens.add({ targets: solo, x: 520, delay: 900, duration: 1600, ease: 'Sine.in' });
      } else {
        Audio.sfx('sconfitta');
        txt(this, 240, 26, 'IL MANNA SI PRENDE LA PISTA', { size: 14, color: '#ff6b5a', depth: 710 });
        const lui = grande('manna_occhiolino', 240, 262, 0.95).setDepth(708);
        this.tweens.add({ targets: lui, scaleX: lui.scaleX * 1.04, duration: 300, yoyo: true, repeat: -1 });
        this.ragazze.filter((r) => !r.mia).forEach((r, k, tutte) => {
          const x = 240 + (k - (tutte.length - 1) / 2) * 50 + (k < tutte.length / 2 ? -45 : 45);
          grande(`tipa${r.t}_felice`, x, 262, 0.7).setFlipX(x > 240).setDepth(704);
        });
        const io = grande(`${this.giocatore.id}_triste`, 60, 262, 0.7).setDepth(706);
        this.tweens.add({ targets: io, x: 62, duration: 60, yoyo: true, repeat: -1 });
        fumetto(this, 240, 120, caso(this.cfg.frasiMannaVince), 2000, 712);
      }
    });
    this.time.delayedCall(3300, fatto);
  }
}
