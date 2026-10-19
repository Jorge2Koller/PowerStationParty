// Microgioco 7: "TorRONDAcelli" - il Generale difende la spiaggia dai pirati. SPARA!
//
//  Dal largo arrivano le bagnarole dei pirati (gommone, pedalò, galeone gonfiabile, banana boat,
//  ciambelle in gruppo, sottomarino): vogliono gli ombrelloni. Chi gioca ha tre armi e le cambia
//  quando vuole (tasti 1, 2, 3, la rotella, o i pulsanti a destra):
//    - il CANNONE spara dove miri; le palle volano in arco e ci mettono di più ad arrivare lontano.
//      Le palle sono poche: le lancia il Generale, una cassa ogni tanto (atterra da sola sul cannone);
//    - il MORTAIO tira a parabola alta (ci mette più di un secondo: si mira dove la barca SARÀ) e fa
//      saltare tutto quello che sta in un tratto di mare: è l'arma per i gruppi. Si ricarica piano;
//    - il SILURO corre dritto sull'acqua dalla riva verso il mirino e affonda la prima bagnarola che
//      incontra, galeone compreso, anche il sottomarino quando è sott'acqua. Si ricarica piano.
//  Quelle affondate lasciano i pirati a nuoto con la ciambella. Se una bagnarola tocca riva si prende
//  un ombrellone e scappa: affondala prima che sparisca all'orizzonte e l'ombrellone torna.
//  Tre atti (in Lampo si stringono nei suoi 15 secondi): prima gommoni e pedalò, poi ARRIVA IL
//  GALEONE (con le banane), alla fine l'ARREMBAGGIO (coi sottomarini); in mezzo, le ondate
//  (FLOTTIGLIA! di ciambelle, due galeoni...). Le bagnarole arrivano uguali per tutti (seme del round).
//  (Scheda di valutazione: "monotono, troppo facile": prima c'erano solo il cannone e tre tipi di
//  bagnarole, ora tre armi, sei tipi e le ondate.)
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { txt, im, scalaDi, scritta, stelle, fumo, pannello, scuoti, lerp, caso, quanti, fumetto, vibra, eTouch, perDito } from '../fx.js';
import { SPIAGGIA } from '../grafica/sfondi.js';

const O = SPIAGGIA.orizzonte, RIVA = 196;
const X_OMBR = [100, 170, 240, 310, 380], Y_OMBR = 226;
const PERNO = { x: 240, y: 243 };        // perno della canna del cannone
const GEN = { x: 42, y: 272, taglia: 0.72 };
// prospettiva: quanto è grande una cosa sull'acqua a quell'altezza (1 = sulla riva)
const prosp = (y) => 0.32 + 0.68 * Phaser.Math.Clamp((y - O) / (RIVA - O), 0, 1);
const PIRATI = { gommone: 2, pedalo: 2, galeone: 3, banana: 3, ciambella: 0, sottomarino: 1 };
// la grandezza delle bagnarole sulla riva (le ciambelle sono il pirata a nuoto, più piccolo: un po' più grande)
const TAGLIA = { ciambella: 1.15 };
const texBarca = (tipo) => (tipo === 'ciambella' ? 'pirataNuota' : 'barca_' + tipo);

// le armi: nome, la canna sull'affusto (fa anche da icona), il colore del mirino
const ARMI = ['cannone', 'mortaio', 'siluro'];
const NOMI_ARMI = { cannone: 'CANNONE', mortaio: 'MORTAIO', siluro: 'SILURO' };
const CANNE = { cannone: 'cannone', mortaio: 'mortaio', siluro: 'lanciasiluri' };
const COLORI_ARMI = { cannone: 0xffe14a, mortaio: 0xff9a3a, siluro: 0x6ad8ff };
// i pulsanti delle armi: una colonna a destra, sulla sabbia e sul bagnino (le bagnarole vicino a
// riva non arrivano mai così a destra: lì il tocco può non sparare)
const PULS = { x: 452, y: [188, 221, 254], w: 46, h: 30 };

export class RondaScene extends MicrogiocoBase {
  constructor() { super('ronda'); }

  // i tempi degli atti e delle ondate sono pensati per 35 secondi: in Lampo si stringono
  get scalaTempo() { return this.durata / this.cfg.durata; }
  get atto() { return this.cfg.atti.filter((a) => this.trascorso >= a.da * this.scalaTempo).pop(); }

  prepara() {
    this.rnd = casuale(Sessione.seme);
    this.nAtto = 0;
    this.nOndata = 0;
    this.punti = 0;
    this.affondate = 0;
    this.ripresi = 0;
    this.colpi = this.cfg.colpiMax;
    this.arma = 'cannone';
    this.carica = { mortaio: 1, siluro: 1 };   // 0..1: 1 = pronto a sparare
    this.barche = [];          // { tipo, img, hp, stato: 'arriva'|'ferma'|'fugge'|'giu', x0, xa, xb, y, fase, vel, bottino, giu (sottomarino) }
    this.palle = [];           // { img, x0, y0, x1, y1, t, T, arco, bomba }
    this.siluri = [];          // { img, x, y, dx, dy, tScia }
    this.tBarca = 0.8;
    this.tLenta = this.cfg.ricaricaLenta;
    this.tCassa = 2.5;
    this.tFrase = 6;
    this.tEspr = 0;
    this.tRotella = 0;
    this.rinculo = 0;
    this.tVuoto = null;        // (la scena viene riusata: senza azzerarlo l'avviso "MUNIZIONI!" non uscirebbe più)
    this.cassa = null;
    this.mira = { x: 240, y: 120 };

    im(this, 0, 0, 'bgSpiaggia').setOrigin(0);
    this.ombrelloni = X_OMBR.map((x) => ({ x, stato: 'su', img: im(this, x, Y_OMBR, 'ombrellone', 0.8).setOrigin(0.5, 1).setDepth(40) }));

    this.gen = im(this, GEN.x, GEN.y, 'generale_normale', GEN.taglia).setOrigin(0.5, 1).setDepth(60);
    this.soldato = im(this, 290, 276, `${this.giocatore.id}_normale`, 0.5).setOrigin(0.5, 1).setDepth(58);
    im(this, 240, 254, 'affusto', 0.9).setDepth(63);
    this.canna = im(this, PERNO.x, PERNO.y, 'cannone', 0.9).setOrigin(4 / 40, 0.5).setDepth(62);

    // mirino (e la "guida" dell'arma: il cerchio del mortaio, la scia prevista del siluro)
    this.guida = this.add.graphics().setDepth(899);
    this.mirino = this.add.graphics().setDepth(900);
    this.mirino.lineStyle(1.6, 0x1f1430, 1).strokeCircle(0, 0, 7.5);
    this.mirino.lineStyle(1, 0xffe14a, 1).strokeCircle(0, 0, 7).lineBetween(-11, 0, -3, 0).lineBetween(3, 0, 11, 0).lineBetween(0, -11, 0, -3).lineBetween(0, 3, 0, 11);
    this.bersagli = this.add.graphics().setDepth(45);   // dove cadranno le bombe del mortaio

    // munizioni del cannone in alto
    this.hud = [pannello(this, 240, 25, 120, 18, { depth: 1000 })];
    this.iconeColpi = [];
    for (let i = 0; i < this.cfg.colpiMax; i++) this.iconeColpi.push(im(this, 240 - 50 + i * (100 / this.cfg.colpiMax) + 50 / this.cfg.colpiMax, 25, 'palla', 1.3).setDepth(1001));
    this.hud.push(...this.iconeColpi);
    this.testoPunti = txt(this, 474, 36, 'AFFONDATE: 0', { ox: 1, depth: 1001, size: 8 });
    this.hud.push(this.testoPunti);
    this.creaPulsantiArmi();
    this.aggiornaColpi();

    // comandi
    this.tasti = this.input.keyboard.addKeys({ sx: 'LEFT', dx: 'RIGHT', su: 'UP', giu: 'DOWN', a: 'A', d: 'D', w: 'W', s: 'S' });
    this.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) this.spara(); });
    // le armi: 1, 2, 3 (anche sul tastierino), la rotella del mouse le fa girare
    this.input.keyboard.on('keydown', (e) => { const i = '123'.indexOf(e.key); if (i >= 0 && !e.repeat) this.scegliArma(i); });
    this.input.on('wheel', (_p, _o, _dx, dy) => {
      if (!dy || this.oraVera - this.tRotella < 150) return;
      this.tRotella = this.oraVera;
      this.scegliArma((ARMI.indexOf(this.arma) + (dy > 0 ? 1 : 2)) % 3);
    });
    const mondo = (p) => this.cameras.main.getWorldPoint(p.x, p.y);
    this.input.on('pointermove', (p) => { if (!p.wasTouch) this.punta(mondo(p)); });
    this.input.on('pointerdown', (p) => {
      if (!this.inCorso || (!p.wasTouch && !p.leftButtonDown())) return;
      const w = mondo(p);
      if (w.y > RIVA + 16) return;
      this.punta(w);
      this.spara();
    });
  }

  // --- le armi ---
  // tre pulsanti in colonna: l'icona (la canna dell'arma), lo stato (le palle, o la ricarica che si
  // riempie) e, con la tastiera, il numero. Quello scelto è più grande, chiaro e col bordo giallo.
  creaPulsantiArmi() {
    this.pulsArmi = ARMI.map((arma, i) => {
      const x = PULS.x, y = PULS.y[i];
      const g = this.add.graphics().setPosition(x, y).setDepth(1001);
      const icona = im(this, x - 2, y - 3, CANNE[arma], 0.62).setDepth(1002).setAngle(-28);
      const stato = txt(this, x + 13, y + 7, '', { size: 7, depth: 1003 });
      const tasto = eTouch() ? null : txt(this, x - PULS.w / 2 + 6, y - PULS.h / 2 + 6, String(i + 1), { size: 7, depth: 1003, color: '#ffe14a' });
      // (il tocco sul pulsante non arriva al mare: non spara)
      this.add.zone(x, y, PULS.w + 4, PULS.h + 3).setDepth(1004).setInteractive({ useHandCursor: true })
        .on('pointerdown', (_p, _x, _y, ev) => { ev.stopPropagation(); this.scegliArma(i); });
      return { arma, g, icona, stato, tasto, x, y };
    });
    this.nomeArma = txt(this, PULS.x, PULS.y[0] - PULS.h / 2 - 8, NOMI_ARMI.cannone, { size: 8, depth: 1003, color: '#ffe14a' });
    for (const p of this.pulsArmi) this.hud.push(p.g, p.icona, p.stato, ...(p.tasto ? [p.tasto] : []));
    this.hud.push(this.nomeArma);
    this.disegnaPulsanti();
  }

  disegnaPulsanti() {
    for (const p of this.pulsArmi) {
      const scelta = p.arma === this.arma, w = PULS.w, h = PULS.h, g = p.g;
      const pronta = p.arma === 'cannone' ? this.colpi > 0 : this.carica[p.arma] >= 1;
      g.clear();
      g.fillStyle(0x000000, 0.3); g.fillRoundedRect(-w / 2 + 1.2, -h / 2 + 2, w, h, 6);
      g.fillStyle(scelta ? 0x3a2a5a : 0x1f1430, scelta ? 0.95 : 0.7); g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      // la ricarica: il fondo si riempie dal basso, del colore dell'arma
      if (p.arma !== 'cannone' && !pronta) {
        const hh = (h - 4) * this.carica[p.arma];
        g.fillStyle(COLORI_ARMI[p.arma], 0.35); g.fillRect(-w / 2 + 2, h / 2 - 2 - hh, w - 4, hh);
      }
      g.lineStyle(scelta ? 2.2 : 1.2, scelta ? 0xffe14a : pronta ? COLORI_ARMI[p.arma] : 0x6a5a7a, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      p.icona.setAlpha(pronta ? 1 : 0.45);
      p.stato.setText(p.arma === 'cannone' ? '×' + this.colpi : pronta ? 'OK' : '').setColor(pronta ? '#7dff9a' : '#ff6b5a');
      g.setScale(scelta ? 1.08 : 1);
    }
  }

  scegliArma(i) {
    const arma = ARMI[i];
    if (!arma || !this.inCorso || arma === this.arma) return;
    this.arma = arma;
    this.canna.setTexture(CANNE[arma]);
    this.nomeArma.setText(NOMI_ARMI[arma]).setColor('#' + COLORI_ARMI[arma].toString(16).padStart(6, '0'));
    this.tweens.add({ targets: this.nomeArma, scale: { from: 1.4, to: 1 }, duration: 200, ease: 'Back.out' });
    const p = this.pulsArmi[i];
    this.tweens.add({ targets: p.icona, scale: { from: p.icona.scale * 1.35, to: p.icona.scale }, duration: 200, ease: 'Back.out' });
    Audio.sfx('muovi');
    this.disegnaPulsanti();
  }

  punta(w) {
    this.mira.x = Phaser.Math.Clamp(w.x, 8, 472);
    this.mira.y = Phaser.Math.Clamp(w.y, O + 3, RIVA + 2);
  }

  aggiornaColpi() {
    this.iconeColpi.forEach((ic, i) => ic.setAlpha(i < this.colpi ? 1 : 0.22));
    this.disegnaPulsanti();
  }

  espr(e, sec = 1.2) { this.gen.setTexture('generale_' + e); this.tEspr = sec; }

  parla(s, ms = 1300) {
    this.fumGen?.destroy();
    this.fumGen = fumetto(this, 78, 152, s, ms, 800);
  }

  // l'arma scelta non può sparare: un suono e (non troppo spesso) un avviso, che dice anche cosa fare
  aVuoto(s) {
    Audio.sfx('vuoto');
    if (this.tVuoto != null && this.trascorso - this.tVuoto < 1.5) return;
    this.tVuoto = this.trascorso;
    scritta(this, 240, 214, s, { size: 9, color: '#ff6b5a', durata: 450, depth: 950 });
  }

  // --- sparare ---
  spara() {
    if (!this.inCorso) return;
    if (this.arma === 'mortaio') return this.sparaMortaio();
    if (this.arma === 'siluro') return this.sparaSiluro();
    if (this.colpi <= 0) {
      const altra = this.carica.mortaio >= 1 ? 'mortaio' : this.carica.siluro >= 1 ? 'siluro' : null;
      return this.aVuoto(altra ? perDito(`MUNIZIONI! PROVA IL ${NOMI_ARMI[altra]} (${ARMI.indexOf(altra) + 1})`, `MUNIZIONI! PROVA IL ${NOMI_ARMI[altra]}`) : 'MUNIZIONI!');
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

  sparaMortaio() {
    if (this.carica.mortaio < 1) return this.aVuoto('RICARICA...');
    this.carica.mortaio = 0;
    const m = this.cfg.mortaio, ang = this.canna.rotation, bx = PERNO.x + Math.cos(ang) * 26, by = PERNO.y + Math.sin(ang) * 26;
    const sP = prosp(this.mira.y);
    const img = im(this, bx, by, 'bombaMortaio', 1.4).setDepth(885);
    // (la parabola è alta e lenta: anche vicino ci mette quasi tutto il "volo")
    this.palle.push({ img, bomba: true, x0: bx, y0: by, x1: this.mira.x, y1: this.mira.y, t: 0, T: m.volo * (0.85 + 0.3 * (1 - sP)), arco: 95 + 40 * (1 - sP) });
    this.rinculo = 1;
    Audio.sfx('botto');
    Audio.sfx('fiuu');
    vibra(40);
    scuoti(this, 120, 0.005);
    fumo(this, bx, by, 6, 870);
    this.disegnaPulsanti();
  }

  sparaSiluro() {
    if (this.carica.siluro < 1) return this.aVuoto('RICARICA...');
    this.carica.siluro = 0;
    // parte dalla riva davanti al lanciasiluri e va dritto verso il mirino (sempre verso il largo)
    const x0 = PERNO.x, y0 = RIVA - 2;
    let dx = this.mira.x - x0, dy = Math.min(-10, this.mira.y - y0);
    const l = Math.hypot(dx, dy); dx /= l; dy /= l;
    // (mezzo sott'acqua: un po' trasparente, e si vede soprattutto la scia)
    const img = im(this, x0, y0, 'siluro', 0.8).setDepth(Math.round(y0 / 10) + 10).setAlpha(0.85).setAngle(Phaser.Math.RadToDeg(Math.atan2(dy, dx)) + 90);
    this.siluri.push({ img, x: x0, y: y0, dx, dy, tScia: 0 });
    this.rinculo = 1;
    Audio.sfx('lancioGranata');
    Audio.sfx('splash');
    vibra(30);
    const sp = im(this, x0, y0 + 2, 'spruzzo', 1).setOrigin(0.5, 1).setDepth(30);
    this.tweens.add({ targets: sp, scaleY: sp.scaleY * 1.4, alpha: 0, duration: 400, onComplete: () => sp.destroy() });
    this.disegnaPulsanti();
  }

  // la bagnarola che si può colpire in quel punto (quelle davanti coprono quelle dietro);
  // i sottomarini sott'acqua no (li prende solo il siluro)
  barcaIn(x, y) {
    let presa = null;
    for (const b of this.barche) {
      if (b.stato === 'giu' || b.giu) continue;
      const w = b.img.displayWidth, h = b.img.displayHeight;
      if (Math.abs(x - b.img.x) < w * 0.5 + 3 && y > b.img.y - h - 2 && y < b.img.y + 3 + 4 * prosp(b.y) && (!presa || b.y > presa.y)) presa = b;
    }
    return presa;
  }

  spruzza(x, y, depth, grande = 1) {
    const s = prosp(y);
    const sp = im(this, x, y + 2 * s, 'spruzzo', s * 1.2 * grande).setOrigin(0.5, 1).setDepth(depth);
    this.tweens.add({ targets: sp, scaleY: sp.scaleY * 1.5, alpha: 0, duration: 450 + 200 * (grande - 1), onComplete: () => sp.destroy() });
  }

  impatto(pl) {
    if (pl.bomba) return this.esplosione(pl.x1, pl.y1);
    const { x1: x, y1: y } = pl;
    const presa = this.barcaIn(x, y);
    this.spruzza(x, y, presa ? presa.img.depth + 1 : Math.round(y / 10) + 10);
    if (!presa) { Audio.sfx('splash'); return; }
    this.colpisci(presa, 1, x, y);
  }

  // la bomba del mortaio: tutto quello che sta nel cerchio (schiacciato, è sull'acqua) prende il danno
  esplosione(x, y) {
    const m = this.cfg.mortaio, s = prosp(y), rx = m.raggio * s, ry = rx * 0.42;
    Audio.sfx('schizzo');
    Audio.sfx('botto');
    vibra(70);
    scuoti(this, 160, 0.008);
    this.spruzza(x, y, Math.round(y / 10) + 12, 2.2);
    for (const k of [-1, 1]) this.spruzza(x + k * rx * 0.6, y, Math.round(y / 10) + 11, 1.3);
    fumo(this, x, y - 6 * s, 5, Math.round(y / 10) + 13, 0xcccccc);
    // l'onda d'urto: un anello che si allarga sull'acqua
    const onda = this.add.graphics().setDepth(Math.round(y / 10) + 9).setPosition(x, y);
    onda.lineStyle(2, 0xffffff, 0.9).strokeEllipse(0, 0, rx * 2, ry * 2);
    onda.setScale(0.3);
    this.tweens.add({ targets: onda, scale: 1.15, alpha: 0, duration: 420, ease: 'Quad.out', onComplete: () => onda.destroy() });
    let affondate = 0;
    for (const b of [...this.barche]) {
      if (b.stato === 'giu' || b.giu) continue;
      const dx = (b.img.x - x) / (rx + b.img.displayWidth * 0.3), dy = (b.y - y) / (ry + 3);
      if (dx * dx + dy * dy <= 1 && this.colpisci(b, m.danno, b.img.x, b.img.y - b.img.displayHeight * 0.4)) affondate++;
    }
    this.multiplo(affondate, x, y - 30 * s);
  }

  // più bagnarole con lo stesso colpo: un premio per ognuna in più
  multiplo(n, x, y) {
    if (n < 2) return;
    const p = this.cfg.bonusMulti * (n - 1);
    this.punti += p;
    const nome = n === 2 ? 'DOPPIETTA!' : n === 3 ? 'TRIPLETTA!' : 'STRAGE!';
    scritta(this, Phaser.Math.Clamp(x, 60, 420), Math.max(70, y), `${nome} +${p}`, { size: 11, color: '#ffe14a', durata: 700, depth: 952 });
    Audio.sfx('bonus');
    this.espr('felice', 1);
    if (n >= 3) this.parla('Che artiglieria!', 1000);
  }

  // un colpo a segno: true se la bagnarola va giù
  colpisci(b, danno, x, y) {
    b.hp -= danno;
    if (b.hp > 0) {
      Audio.sfx('buco');
      b.inclina += (Math.random() < 0.5 ? -1 : 1) * 7;
      this.tingi(b);
      fumo(this, x, y - 4 * prosp(b.y), 2, b.img.depth + 2, 0x888888);
      return false;
    }
    this.affonda(b);
    return true;
  }

  // il colore di una bagnarola: più grigia quando è bucata, azzurrina e trasparente sott'acqua
  tingi(b) {
    if (b.giu) return void b.img.setTint(0x3a8ac0).setAlpha(0.35);
    b.img.setAlpha(1);
    if (b.hp >= this.cfg.hp[b.tipo]) b.img.clearTint();
    else b.img.setTint(b.hp === 1 ? 0xb8b0a8 : 0xd8d0c8);
  }

  affonda(b) {
    b.stato = 'giu';
    b.giu = false;
    b.img.setAlpha(1);
    this.affondate++;
    let p = this.cfg.puntiAffondata[b.tipo] + (b.y < this.cfg.yLontano ? this.cfg.bonusLontano : 0);
    const s = prosp(b.y);
    Audio.sfx(b.tipo === 'ciambella' ? 'pof' : 'affonda');
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
    // la bagnarola si inclina e va giù (la ciambella si sgonfia e il pirata se ne va sott'acqua)
    this.tweens.add({ targets: b.img, angle: b.img.angle + (b.inclina >= 0 ? 28 : -28), y: b.img.y + 8 * s, scaleX: b.img.scaleX * (b.tipo === 'ciambella' ? 0.6 : 1), alpha: 0, duration: b.tipo === 'ciambella' ? 600 : 1100, ease: 'Quad.in', onComplete: () => b.img.destroy() });
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
  // il tipo a caso coi pesi dell'atto (col seme: uguale per tutti)
  scegliTipo(f) {
    const voci = Object.entries(f.tipi);
    let r = this.rnd() * voci.reduce((t, [, p]) => t + p, 0);
    for (const [tipo, p] of voci) if ((r -= p) < 0) return tipo;
    return voci[0][0];
  }

  // o: { xa, xb, dy, fase, ondata } per le ondate (le ciambelle arrivano in fila, insieme)
  nuovaBarca(f, tipoVoluto, o = {}) {
    const rnd = this.rnd, c = this.cfg;
    const tipo = tipoVoluto ?? this.scegliTipo(f);
    // punta a un ombrellone (scelto col seme fra i cinque posti: se quello non c'è più, al più vicino)
    const xb = o.xb ?? X_OMBR[Math.floor(rnd() * X_OMBR.length)] + Math.round(rnd() * 20 - 10);
    const y = O + 4 + (o.dy ?? 0);
    const b = {
      tipo, hp: c.hp[tipo], stato: 'arriva', inclina: 0, y, ondata: !!o.ondata,
      xa: o.xa ?? 40 + Math.round(rnd() * 400), xb,
      fase: o.fase ?? rnd() * 6.28, zig: f.zigzag * (c.zigzagTipo[tipo] ?? 1) * (0.5 + rnd() * 0.5), vel: f.vel * c.passo[tipo], bottino: null,
      img: im(this, 0, y, texBarca(tipo), 0.1).setOrigin(0.5, 1),
    };
    // il sottomarino: a galla e sott'acqua, a turno (parte a galla, col seme sfasato)
    if (tipo === 'sottomarino') { b.giu = false; b.tSub = c.sottomarino.su * (0.5 + rnd() * 0.5); }
    this.barche.push(b);
    this.posiziona(b, 0);
    return b;
  }

  // un'ondata: "quante" bagnarole dello stesso tipo insieme, con l'annuncio
  lanciaOndata(od, f) {
    const rnd = this.rnd, n = od.quante;
    if (od.nome) {
      Audio.sfx('fischietto');
      scritta(this, 240, 92, od.nome, { size: 12, color: '#ff9a3a', durata: 800, depth: 950 });
    }
    if (od.tipo === 'ciambella') {
      // in fila e vicine: un bel bersaglio per il mortaio
      const xa = 110 + rnd() * 260, xb = 130 + rnd() * 220, fase = rnd() * 6.28;
      for (let i = 0; i < n; i++) {
        const k = i - (n - 1) / 2;
        this.nuovaBarca(f, 'ciambella', { xa: xa + k * 15, xb: Phaser.Math.Clamp(xb + k * 24, 70, 410), dy: (i % 2) * 4, fase, ondata: true });
      }
      if (rnd() < 0.5) this.parla('Un gruppo! Mortaio!', 1100);
    } else {
      for (let i = 0; i < n; i++) this.nuovaBarca(f, od.tipo, { xa: 60 + (i + rnd()) * (360 / n), ondata: true });
    }
  }

  posiziona(b, dt) {
    const s = prosp(b.y), k = (b.y - O) / (RIVA - O);
    b.fase += dt * (b.tipo === 'banana' ? 2.6 : 1.6);
    const x = b.stato === 'fugge' ? b.xFuga + Math.sin(b.fase) * 4 * s : lerp(b.xa, b.xb, Phaser.Math.Clamp(k * 1.15, 0, 1)) + Math.sin(b.fase) * b.zig * s * (1 - k * 0.7);
    // (il sottomarino sott'acqua sta un po' più giù: resta fuori solo la torretta)
    const giu = b.giu ? 0.45 * b.img.displayHeight : 0;
    b.img.setPosition(x, b.y + giu + Math.sin(b.fase * 2.3) * 0.6 * s).setScale(scalaDi(b.img.texture.key, (TAGLIA[b.tipo] ?? 0.8) * s)).setDepth(Math.round(b.y / 10) + 10);
    b.img.setAngle(b.inclina + Math.sin(b.fase * 1.7) * 3);
    if (b.bottino) b.bottino.img.setPosition(x + 2 * s, b.img.y - b.img.displayHeight * 0.45).setScale(scalaDi('ombrellone', 0.5 * s)).setDepth(b.img.depth + 1);
  }

  // il sottomarino si immerge ed emerge (solo mentre arriva: a riva e in fuga resta a galla)
  sommergi(b, dt) {
    b.tSub -= dt;
    if (b.tSub > 0) return;
    b.giu = !b.giu;
    b.tSub = b.giu ? this.cfg.sottomarino.giu : this.cfg.sottomarino.su;
    this.tingi(b);
    const s = prosp(b.y);
    for (let i = 0; i < 3; i++) {
      const bolla = this.add.circle(b.img.x + (Math.random() - 0.5) * 20 * s, b.y - 2 * s, 1.6 * s + 0.6, 0xe8f6ff, 0.9).setDepth(b.img.depth + 1);
      this.tweens.add({ targets: bolla, y: bolla.y - 10 * s, alpha: 0, delay: i * 90, duration: 500, onComplete: () => bolla.destroy() });
    }
    Audio.sfx(b.giu ? 'glu' : 'plop');
  }

  aRiva(b) {
    b.stato = 'ferma';
    b.tFerma = 0.8;
    if (b.giu) { b.giu = false; this.tingi(b); }
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
    const x = PERNO.x - 26, y = PERNO.y + 6;
    this.cassa = { img, pronta: false };
    this.espr('felice', 0.8);
    this.parla(caso(this.cfg.frasiCassa), 900);
    Audio.sfx('lancio');
    this.tweens.add({ targets: img, x, duration: 520 });
    this.tweens.add({ targets: img, y: 168, duration: 260, ease: 'Quad.out', yoyo: false, onComplete: () => this.tweens.add({ targets: img, y, duration: 260, ease: 'Quad.in', onComplete: () => { this.cassa.pronta = true; Audio.sfx('tonfo'); this.prendiCassa(); } }) });
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

  // il mirino dell'arma scelta: il cerchio del mortaio (dove salta tutto), la rotta del siluro
  disegnaGuida() {
    const g = this.guida, { x, y } = this.mira, s = prosp(y);
    g.clear();
    if (this.arma === 'mortaio') {
      const rx = this.cfg.mortaio.raggio * s, pronto = this.carica.mortaio >= 1;
      g.fillStyle(0xff9a3a, pronto ? 0.18 : 0.06); g.fillEllipse(x, y, rx * 2, rx * 0.84);
      g.lineStyle(1.4, pronto ? 0xff9a3a : 0x8a7a8a, pronto ? 0.95 : 0.6); g.strokeEllipse(x, y, rx * 2, rx * 0.84);
    } else if (this.arma === 'siluro') {
      const x0 = PERNO.x, y0 = RIVA - 2, pronto = this.carica.siluro >= 1;
      let dx = x - x0, dy = Math.min(-10, y - y0);
      const l = Math.hypot(dx, dy); dx /= l; dy /= l;
      // a trattini, fino all'orizzonte
      const fine = (y0 - O - 2) / -dy;
      g.fillStyle(pronto ? 0x6ad8ff : 0x8a7a8a, pronto ? 0.85 : 0.45);
      for (let d = 6; d < fine; d += 9) { const px = x0 + dx * d, py = y0 + dy * d; g.fillCircle(px, py, 1.3 * prosp(py) + 0.3); }
    }
  }

  aggiorna(dt) {
    const c = this.cfg, f = this.atto, n = c.atti.indexOf(f);
    if (n !== this.nAtto) {
      this.nAtto = n;
      if (f.nome) {
        Audio.sfx('fischietto');
        scritta(this, 240, 110, f.nome, { size: 14, color: '#ffe14a', durata: 900, depth: 950 });
        if (f.frase) this.parla(f.frase, 1200);
      }
      if (f.subito) { this.nuovaBarca(f, f.subito); this.tBarca = f.intervallo; }
    }
    // le ondate, alla loro ora
    while (this.nOndata < c.ondate.length && this.trascorso >= c.ondate[this.nOndata].t * this.scalaTempo) this.lanciaOndata(c.ondate[this.nOndata++], f);

    // mira con la tastiera
    const t = this.tasti, vx = (t.dx.isDown || t.d.isDown) - (t.sx.isDown || t.a.isDown), vy = (t.giu.isDown || t.s.isDown) - (t.su.isDown || t.w.isDown);
    if (vx || vy) this.punta({ x: this.mira.x + vx * c.velMira * dt, y: this.mira.y + vy * c.velMira * dt * 0.7 });
    this.mirino.setPosition(this.mira.x, this.mira.y).setScale(0.55 + 0.45 * prosp(this.mira.y));
    this.disegnaGuida();

    // la canna segue il mirino, e rincula dopo il colpo (il mortaio guarda quasi in su)
    let ang = Math.atan2(this.mira.y - PERNO.y, this.mira.x - PERNO.x);
    if (this.arma === 'mortaio') ang = -Math.PI / 2 + Phaser.Math.Clamp((this.mira.x - PERNO.x) / 300, -0.55, 0.55);
    this.rinculo = Math.max(0, this.rinculo - dt * 5);
    this.canna.setRotation(ang).setPosition(PERNO.x - Math.cos(ang) * 4 * this.rinculo, PERNO.y - Math.sin(ang) * 4 * this.rinculo);

    // palle e bombe in volo (la bomba diventa grande in cima alla parabola: è più vicina a noi)
    this.bersagli.clear();
    for (const pl of this.palle) {
      pl.t += dt;
      const u = Math.min(1, pl.t / pl.T);
      const sc = pl.bomba ? 1.4 * lerp(1, prosp(pl.y1), u) * (1 + Math.sin(u * Math.PI) * 0.8) : 1.6 * lerp(1, prosp(pl.y1), u);
      pl.img.setPosition(lerp(pl.x0, pl.x1, u), lerp(pl.y0, pl.y1, u) - Math.sin(u * Math.PI) * pl.arco).setScale(scalaDi(pl.img.texture.key, sc));
      if (pl.bomba) {
        // dove cadrà: un cerchio rosso sull'acqua che si stringe
        const rx = this.cfg.mortaio.raggio * prosp(pl.y1) * (1.4 - 0.4 * u);
        this.bersagli.lineStyle(1.3, 0xff4a3a, 0.5 + 0.5 * u).strokeEllipse(pl.x1, pl.y1, rx * 2, rx * 0.84);
        pl.img.setAngle(pl.img.angle + dt * 400);
      }
      if (u >= 1) { pl.img.destroy(); pl.fatta = true; this.impatto(pl); }
    }
    this.palle = this.palle.filter((pl) => !pl.fatta);

    // siluri in corsa (lontano sembrano più lenti, come tutto il resto), con la scia di bollicine
    for (const sl of this.siluri) {
      const s = prosp(sl.y), v = c.siluro.vel * s * dt;
      sl.x += sl.dx * v; sl.y += sl.dy * v;
      sl.img.setPosition(sl.x, sl.y).setScale(scalaDi('siluro', 0.8 * s)).setDepth(Math.round(sl.y / 10) + 10);
      sl.tScia -= dt;
      if (sl.tScia <= 0) {
        sl.tScia = 0.05;
        const bolla = this.add.circle(sl.x + (Math.random() - 0.5) * 2 * s, sl.y + 5 * s, (1 + Math.random()) * s, 0xffffff, 0.85).setDepth(sl.img.depth - 1);
        this.tweens.add({ targets: bolla, scale: 1.8, alpha: 0, duration: 650, onComplete: () => bolla.destroy() });
      }
      // la prima bagnarola sulla rotta (anche il sottomarino sott'acqua)
      const presa = this.barche.find((b) => b.stato !== 'giu' && Math.abs(sl.x - b.img.x) < b.img.displayWidth * 0.42 && Math.abs(sl.y - b.y) < 3 + 5 * prosp(b.y));
      if (presa) {
        sl.fatto = true;
        sl.img.destroy();
        presa.giu = false;
        this.spruzza(sl.x, sl.y, presa.img.depth + 1, 1.8);
        Audio.sfx('botto');
        scuoti(this, 120, 0.006);
        this.colpisci(presa, c.siluro.danno, sl.x, sl.y - 6 * s);
      } else if (sl.y <= O + 2 || sl.x < -10 || sl.x > 490) {
        sl.fatto = true;
        this.tweens.add({ targets: sl.img, alpha: 0, duration: 200, onComplete: () => sl.img.destroy() });
      }
    }
    this.siluri = this.siluri.filter((sl) => !sl.fatto);

    // munizioni: la cassa del Generale e il colpo che arriva da solo; mortaio e siluro si ricaricano
    this.tLenta -= dt;
    if (this.tLenta <= 0) { this.tLenta = c.ricaricaLenta; if (this.colpi < c.colpiMax) { this.colpi++; this.aggiornaColpi(); } }
    if (!this.cassa) { this.tCassa -= dt; if (this.tCassa <= 0) this.lanciaCassa(); }
    for (const a of ['mortaio', 'siluro']) {
      if (this.carica[a] >= 1) continue;
      this.carica[a] = Math.min(1, this.carica[a] + dt / c[a].ricarica);
      if (this.carica[a] >= 1) {
        // pronto: un "tonk", e il pulsante fa un saltino
        Audio.sfx('tonk');
        const p = this.pulsArmi[ARMI.indexOf(a)];
        this.tweens.add({ targets: p.icona, angle: { from: -48, to: -28 }, duration: 260, ease: 'Back.out' });
      }
    }
    this.disegnaPulsanti();

    // nuove bagnarole (quelle delle ondate non contano nel massimo)
    this.tBarca -= dt;
    const inArrivo = this.barche.filter((b) => b.stato === 'arriva' && !b.ondata).length;
    if (this.tBarca <= 0 && inArrivo < f.maxBarche) { this.nuovaBarca(f); this.tBarca = f.intervallo * (0.8 + this.rnd() * 0.4); }

    for (const b of this.barche) {
      if (b.stato === 'giu') continue;
      const s = prosp(b.y);
      if (b.stato === 'arriva') {
        b.y += b.vel * s * dt;
        if (b.tipo === 'sottomarino') this.sommergi(b, dt);
        if (b.y >= RIVA) { b.y = RIVA; this.aRiva(b); }
      }
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
    const c = this.cfg, n = this.salvati(), ok = n >= c.obiettivoOmbrelloni;
    // la scala delle medaglie: senza l'obiettivo (3 ombrelloni) il totale si ferma a tettoPrima,
    // con l'obiettivo è almeno il bronzo (con tante bagnarole, a caccia e basta si arrivava al
    // bronzo anche con la spiaggia persa). In Lampo, dove le medaglie non contano, i punti e basta.
    const grezzo = Math.max(0, this.punti + c.bonusOmbrelloni[n]);
    const lampo = Sessione.tipo === 'lampo';
    return {
      punteggio: lampo ? grezzo : ok ? Math.max(c.medaglie.bronzo, grezzo) : Math.min(c.tettoPrima, grezzo),
      vittoria: ok,
      riepilogo: `${quanti(this.affondate, 'bagnarola affondata', 'bagnarole affondate')}, ${quanti(n, 'ombrellone salvato', 'ombrelloni salvati')} su 5`,
      titoloFine: n ? 'TEMPO!' : 'SPIAGGIA PERSA!',
    };
  }

  finale(ris, fatto) {
    for (const o of [...this.hud, this.mirino, this.guida, this.bersagli, ...this.palle.map((pl) => pl.img), ...this.siluri.map((sl) => sl.img)]) o.setVisible(false);
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
