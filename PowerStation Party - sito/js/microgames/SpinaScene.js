// Microgioco 1: "La Spina del PowerStation" - sfida di spillatura contro Beppe. SPILLA!
//
//  Si tiene premuto (SPAZIO, il mouse o il dito) per spillare e si rilascia quando la birra è
//  nella ZONA VERDE. Al centro della zona: PERFETTA, punti in più.
//  I clienti ordinano tre bicchieri diversi: la pinta, il boccale (grande, si riempie piano,
//  vale di più) e il calice (zona strettissima, vale tanto: il rischio). Tre atti: si comincia
//  con le pinte, poi l'ORA DI PUNTA (arrivano boccali e calici, Beppe accelera), alla fine
//  Beppe FA I DISPETTI (urta il bancone e la zona verde balla mentre spilli).
//  Beppe intanto spilla pinte a ritmo suo (la forma del giorno esce dal seme: cambia da un round
//  all'altro, ma nel round è la stessa per tutti): per vincere bisogna fare più punti di lui.
//  I bicchieri arrivano nello stesso ordine per tutti i giocatori del round (seme del round).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { CONFIG } from '../config.js';
import { casuale, tela } from '../grafica/base.js';
import { clienteDi } from '../grafica/oggetti.js';
import { aspettoDi } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumo, pannello, scuoti, lerp, caso, colpetto, eTouch, vibra, puntiHud, numero, quanti } from '../fx.js';

const Y_BANCONE = 181;            // dove appoggia il bicchiere
const Y_BECCO = 137;              // da dove esce la birra
const X_MIO = 160, X_BEPPE = 320;
const CAVO = 43;                  // altezza interna del bicchiere (unità)
const NOMI = { pinta: 'PINTA', boccale: 'BOCCALE', calice: 'CALICE' };
const Y_ESITO = 200;              // BUONA / TRABOCCA! escono sul bancone, sotto: sopra c'è il nome del bicchiere

export class SpinaScene extends MicrogiocoBase {
  constructor() { super('spina'); }

  get fase() { return this.cfg.atti.filter((a) => this.trascorso >= a.da).pop(); }

  prepara() {
    const c = this.cfg;
    const seme = Sessione.seme;
    this.rnd = casuale(seme);
    // Beppe ha il suo generatore: quello che fa il giocatore non cambia le sue pinte
    this.rndBeppe = casuale((seme ^ 0x9e3779b9) >>> 0);
    this.formaBeppe = c.formaBeppe[0] + this.rndBeppe() * (c.formaBeppe[1] - c.formaBeppe[0]);
    this.punti = 0;
    this.pinte = 0;            // bicchieri buoni (di qualunque tipo)
    this.perfette = 0;
    this.pinteBeppe = 0;
    this.tBeppe = 0;
    this.pintaBeppe();
    this.tOcchiata = 5;
    this.tChiacchiere = 1.5;
    this.tDispetto = 0;
    this.urto = 0;             // il bancone balla (dispetto di Beppe): la zona verde si sposta
    this.atto = 0;

    im(this, 0, 0, 'bgPub').setOrigin(0);
    txt(this, 240, 42, 'POWERSTATION', { size: 9, color: '#f6d36b', thick: 0 });
    txt(this, 240, 69, 'OGGI ALLA SPINA', { size: 8, color: '#ffe9a0', thick: 0 });
    const B = this.cfg.bicchieri, prezzo = (nome, k) => `${nome} ${'.'.repeat(15 - nome.length - String(B[k].punti).length)} ${B[k].punti}`;
    txt(this, 240, 92, [prezzo('Pinta', 'pinta'), prezzo('Boccale', 'boccale'), prezzo('Calice', 'calice')].join('\n'), { size: 7, color: '#eef2e4', thick: 0, spacing: 0 });

    // baristi dietro al bancone
    this.io = im(this, 84, 200, this.giocatore.id + '_normale').setOrigin(0.5, 1);
    this.beppe = im(this, 398, 200, 'beppe_normale').setOrigin(0.5, 1);
    im(this, 0, 168, 'bancone').setOrigin(0).setDepth(10);
    im(this, 132, 182, 'spina').setOrigin(0, 1).setDepth(11);
    im(this, 348, 182, 'spina').setOrigin(1, 1).setFlipX(true).setDepth(11);
    this.getto = this.add.rectangle(X_MIO - 1, Y_BECCO, 3, 1, 0xf6ae1e).setOrigin(0.5, 0).setDepth(12).setVisible(false);
    this.gettoBeppe = this.add.rectangle(X_BEPPE + 1, Y_BECCO, 3, 1, 0xf6ae1e).setOrigin(0.5, 0).setDepth(12);

    // clienti di spalle che chiacchierano e gesticolano: quattro personaggi giocabili a caso (non
    // chi gioca), disegnati da dietro ogni volta (col costume del Bancone, se ce l'hanno)
    const io = this.giocatore.id.replace(DOPPIONE, '');
    const scelti = Phaser.Utils.Array.Shuffle(CONFIG.personaggiGiocabili.map((p) => p.id).filter((id) => id !== io)).slice(0, 4);
    scelti.forEach((id, i) => { for (const f of [0, 1]) tela(this, `clienteSpina${i}_${f}`, 58, 78, (cc) => clienteDi(cc, aspettoDi(id), f), 5); });
    this.clienti = [0, 1, 2, 3].map((i) => {
      const s = im(this, 150 + i * 60, 280, `clienteSpina${i}_0`).setOrigin(0.5, 1).setDepth(20);
      s.idx = i;
      this.tweens.add({ targets: s, y: 277, duration: 500 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      return s;
    });

    // contatore: i miei punti contro quelli di Beppe
    pannello(this, 240, 22, 196, 18, { depth: 1000 });
    this.contatore = txt(this, 240, 22, '', { size: 12, depth: 1001, thick: 3 });
    this.ordine = txt(this, X_MIO, 118, '', { size: 8, depth: 30, color: '#ffe14a' });

    this.spazio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // dito (o mouse) tenuto premuto in qualunque punto = SPAZIO tenuto
    this.premuti = new Set();
    this.input.on('pointerdown', (p) => this.premuti.add(p.id));
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => this.premuti.delete(p.id));
    if (eTouch()) {
      this.spilla = this.add.container(56, 232).setDepth(1000);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.3); g.fillCircle(1.5, 2.5, 25);
      g.fillStyle(0xb5651d, 1); g.fillCircle(0, 0, 25);
      g.lineStyle(2.5, 0xffe14a, 1); g.strokeCircle(0, 0, 25);
      this.spilla.add([g, txt(this, 0, 0, 'SPILLA', { size: 9, color: '#ffe14a' })]);   // ("tieni premuto" lo dicono i comandi)
    }
    this.bicchiereBeppe = this.creaBicchiere(X_BEPPE, 'pinta');
    this.nuovoBicchiere();
    this.aggiornaContatore();
  }

  // dopo una pausa nessun dito risulta più appoggiato (se no la spina resterebbe aperta)
  alRientro() { this.premuti.clear(); }

  // bicchiere = contenitore con birra (ritagliata in base al livello), schiuma, zona verde e vetro;
  // il tipo cambia la forma (boccale largo, calice stretto)
  creaBicchiere(x, tipo, zona) {
    const birra = im(this, 0, 1, 'pintaBirra').setOrigin(0.5, 1).setVisible(false);
    const schiuma = im(this, 0, 0, 'pintaSchiuma').setOrigin(0.5, 0).setVisible(false);
    const segni = this.add.graphics();
    const vetro = im(this, 0, 1, 'pintaVetro').setOrigin(0.5, 1);
    const b = this.add.container(x, Y_BANCONE, [birra, schiuma, segni, vetro]).setDepth(13);
    const forma = this.cfg.bicchieri[tipo];
    b.setScale(forma.largo, forma.alto);
    Object.assign(b, { birra, schiuma, segni, tipo });
    if (zona) this.disegnaZona(b, zona, 0);
    return b;
  }

  // la zona verde (spostata di "dy" se Beppe ha urtato il bancone) e il suo centro, per la PERFETTA
  disegnaZona(b, zona, dy) {
    const g = b.segni, y1 = -3 - (zona[1] + dy) * CAVO, y0 = -3 - (zona[0] + dy) * CAVO, mezzo = (y0 + y1) / 2, perf = (y0 - y1) * this.cfg.perfetta / 2;
    g.clear();
    g.fillStyle(0x3bff6a, 0.32); g.fillRect(-10.5, y1, 21, y0 - y1);
    g.fillStyle(0xfff36a, 0.45); g.fillRect(-10.5, mezzo - perf, 21, perf * 2);
    g.fillStyle(0x3bff6a, 1);
    for (const y of [y1, y0]) { g.fillRect(-10.5, y - 0.4, 21, 0.8); g.fillTriangle(-19, y - 2.5, -19, y + 2.5, -14, y); g.fillTriangle(19, y - 2.5, 19, y + 2.5, 14, y); }
  }

  riempi(b, livello) {
    const L = Phaser.Math.Clamp(livello, 0, 1), yTop = 46 - L * CAVO, s = scalaDi('pintaSchiuma');
    b.birra.setVisible(L > 0.01).setCrop(0, yTop * 6, 180, (50 - yTop) * 6);
    b.schiuma.setVisible(L > 0.03).setPosition(0, -3 - L * CAVO - 2.5).setScale((s * lerp(8, 11, L)) / 11, s * Math.min(1, L * 7));
  }

  nuovoBicchiere() {
    const c = this.cfg, F = this.fase;
    this.bicchiere?.destroy();
    const r = this.rnd(), tipo = r < F.calice ? 'calice' : r < F.calice + F.boccale ? 'boccale' : 'pinta';
    const forma = c.bicchieri[tipo];
    const amp = lerp(c.zonaInizio, c.zonaFine, this.progresso) * forma.zona;
    const centro = 0.66 + this.rnd() * 0.16;
    this.zona = [centro - amp / 2, centro + amp / 2];
    this.tipo = tipo;
    this.livello = 0;
    this.stato = 'pronto';
    this.armato = false; // bisogna rilasciare SPAZIO prima di ricominciare
    this.bicchiere = this.creaBicchiere(X_MIO - 40, tipo, this.zona);
    this.bicchiere.alpha = 0;
    this.tweens.add({ targets: this.bicchiere, x: X_MIO, alpha: 1, duration: 120, ease: 'Quad.out' });
    this.ordine.setText(`${NOMI[tipo]}  +${forma.punti}`).setColor(tipo === 'calice' ? '#ff9ad8' : tipo === 'boccale' ? '#ffe14a' : '#ffffff');
    colpetto(this, this.ordine, 1.2, 1.2);
  }

  aggiornaContatore() {
    const beppe = this.pinteBeppe * this.cfg.puntiBeppe;
    this.contatore.setText(`TU: ${this.punti}  -  BEPPE: ${beppe}`);
    this.contatore.setColor(this.punti > beppe ? '#7dff9a' : this.punti < beppe ? '#ff9a8a' : '#ffffff');
  }

  aggiorna(dt, p) {
    const c = this.cfg, F = this.fase, giu = this.spazio.isDown || this.premuti.size > 0;
    this.spilla?.setScale(giu ? 0.9 : 1).setAlpha(giu ? 1 : 0.85);

    // gli atti
    const atto = c.atti.indexOf(F);
    if (atto !== this.atto) {
      this.atto = atto;
      Audio.sfx('bonus');
      scritta(this, 240, 128, F.nome, { size: 14, color: '#ffe14a', durata: 900 });
    }

    // i dispetti di Beppe: urta il bancone, e la zona verde balla per un po'
    if (F.dispetti) {
      this.tDispetto -= dt;
      if (this.tDispetto <= 0) {
        this.tDispetto = c.dispettoOgni * (0.8 + this.rnd() * 0.4);
        this.urto = c.durataUrto;
        Audio.sfx('sbam');
        scuoti(this, 160, 0.006);
        this.beppe.setTexture('beppe_sufficienza');
        this.fumetto(this.beppe.x - 56, 92, caso(c.frasiDispetto), 900);
        this.time.delayedCall(900, () => this.beppe.setTexture('beppe_normale'));
      }
    }
    let dy = 0;
    if (this.urto > 0) {
      this.urto = Math.max(0, this.urto - dt);
      dy = Math.sin(this.urto * 14) * c.ballaZona * (this.urto / c.durataUrto);
      this.bicchiere?.setX(X_MIO + Math.sin(this.urto * 30) * 1.2);
    }
    this.dyZona = dy;
    if (this.bicchiere && this.stato !== 'attesa') this.disegnaZona(this.bicchiere, this.zona, dy);

    // --- il mio bicchiere ---
    if (this.stato === 'pronto') {
      if (!giu) this.armato = true;
      else if (this.armato) { this.stato = 'versa'; Audio.versaInizio(); }
    } else if (this.stato === 'versa') {
      this.livello += lerp(c.velInizio, c.velFine, p) * c.bicchieri[this.tipo].vel * dt;
      Audio.versaLivello(this.livello);
      if (this.livello >= 1) this.valuta(true);
      else if (!giu) this.valuta(false);
    }
    const verso = this.stato === 'versa';
    this.getto.setVisible(verso);
    if (verso) {
      const alto = c.bicchieri[this.tipo].alto;
      this.getto.setSize(3, Math.max(1, Y_BANCONE - 3 - this.livello * CAVO * alto - Y_BECCO));
      this.riempi(this.bicchiere, this.livello);
    }

    // --- Beppe: la sua forma del giorno, e ogni pinta un po' diversa (ogni tanto gli trabocca) ---
    this.tBeppe += dt;
    const f = this.tBeppe / (F.beppe * this.kBeppe);
    const livB = Math.min(this.buttaBeppe ? 1 : 0.82, f * 1.05);
    this.riempi(this.bicchiereBeppe, livB);
    this.gettoBeppe.setVisible(livB < 0.82 && f > 0.05);
    this.gettoBeppe.setSize(3, Math.max(1, Y_BANCONE - 3 - livB * CAVO - Y_BECCO));
    if (f >= 1) {
      this.tBeppe = 0;
      const g = this.bicchiereBeppe;
      this.bicchiereBeppe = this.creaBicchiere(X_BEPPE, 'pinta');
      if (this.buttaBeppe) {
        // traboccata: la butta via, niente punti
        scritta(this, X_BEPPE, Y_ESITO, 'TRABOCCA!', { size: 9, color: '#ff9a8a', durata: 500 });
        this.tweens.add({ targets: g, alpha: 0, y: g.y + 6, duration: 300, onComplete: () => g.destroy() });
        this.beppe.setTexture('beppe_triste');
        this.time.delayedCall(700, () => this.beppe.setTexture('beppe_normale'));
      } else {
        this.pinteBeppe++;
        this.servi(g, 270, false);
        this.aggiornaContatore();
      }
      this.pintaBeppe();
    }

    // occhiata di sufficienza
    this.tOcchiata -= dt;
    if (this.tOcchiata <= 0 && !F.dispetti) {
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
      s.setTexture(`clienteSpina${s.idx}_1`);
      this.fumetto(s.x + 8, 190, caso(c.frasiClienti), 1000);
      this.time.delayedCall(700, () => s.setTexture(`clienteSpina${s.idx}_0`));
    }
  }

  // la prossima pinta di Beppe: quanto ci mette (in proporzione) e se gli trabocca
  pintaBeppe() {
    const c = this.cfg;
    this.kBeppe = this.formaBeppe * (1 + (this.rndBeppe() * 2 - 1) * c.variaBeppe);
    this.buttaBeppe = this.rndBeppe() < c.sbagliaBeppe;
  }

  valuta(traboccata) {
    const c = this.cfg, dy = this.dyZona ?? 0, a = this.zona[0] + dy, b = this.zona[1] + dy, g = this.bicchiere, forma = c.bicchieri[this.tipo];
    Audio.versaFine();
    this.getto.setVisible(false);
    this.riempi(g, this.livello);
    g.segni.setVisible(false);
    this.bicchiere = null;

    if (!traboccata && this.livello >= a && this.livello <= b) {
      // buona: scivola fino al cliente. Al centro della zona: PERFETTA
      const perfetta = Math.abs(this.livello - (a + b) / 2) <= ((b - a) / 2) * c.perfetta;
      const guadagno = forma.punti + (perfetta ? c.bonusPerfetta : 0);
      this.stato = 'attesa';
      this.pinte++;
      if (perfetta) this.perfette++;
      this.punti += guadagno;
      Audio.sfx('scivola');
      this.time.delayedCall(260, () => Audio.sfx(perfetta ? 'bonus' : 'ding'));
      scritta(this, X_MIO, Y_ESITO, perfetta ? `PERFETTA! +${guadagno}` : `BUONA +${guadagno}`, { size: 10, color: perfetta ? '#ffe14a' : '#7dff9a', durata: 400 });
      if (perfetta) stelle(this, X_MIO, Y_BANCONE - 40, 6, 15);
      this.faccia('felice', 500);
      colpetto(this, this.contatore, 1.15, 1.15);
      this.aggiornaContatore();
      this.servi(g, 210, true);
      this.time.delayedCall(this.fase.pausa * 1000, () => this.nuovoBicchiere());
      return;
    }

    this.stato = 'errore';
    Audio.sfx('errore');
    vibra(50);
    this.faccia('shock', c.penalita * 1000 - 100);
    scuoti(this, 120, 0.006);
    if (this.livello < a) {
      // troppo poca: il cliente la rimanda indietro
      scritta(this, X_MIO, Y_ESITO, 'TROPPO POCA!', { size: 10, color: '#ff9a8a' });
      this.fumetto(218, 190, 'È mezza vuota!', 1000);
      this.tweens.add({ targets: g, x: 205, duration: 300, ease: 'Cubic.out', yoyo: true, hold: 250, onComplete: () => g.destroy() });
    } else {
      // troppa: la schiuma trabocca sul bancone
      scritta(this, X_MIO, Y_ESITO, 'TRABOCCA!', { size: 10, color: '#ff9a8a' });
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
    // il punteggio è la sfida con Beppe: a pari punti con lui vale puntiPari (il bronzo), e poi
    // quanto lo batti (o quanto ti batte). Così "fai più punti di Beppe" è proprio il bronzo, anche
    // se Beppe un giorno va più forte e un altro più piano
    const c = this.cfg, beppe = this.pinteBeppe * c.puntiBeppe, scarto = this.punti - beppe;
    return {
      punteggio: Math.max(0, c.puntiPari + scarto),
      vittoria: this.punti >= beppe,
      riepilogo: `${quanti(this.pinte, 'bicchiere', 'bicchieri')} (${quanti(this.perfette, 'perfetto', 'perfetti')}): tu ${this.punti}, Beppe ${beppe} (${scarto >= 0 ? '+' : ''}${scarto})`,
    };
  }
}
