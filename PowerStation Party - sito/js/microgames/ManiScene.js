// Microgioco 5: "Guerra, via quelle mani!" - difendi i tuoi piatti a suon di schiaffi.
//
//  Le mani di Guerra (con braccia che si allungano) partono da lui, da sotto la
//  tovaglia e dai lati verso i piatti. Clic/tocco sulla mano = schiaffo: si ritira.
//  Se una mano arriva al piatto lo trascina via piano: colpiscila per salvarlo.
//  Finte: la mano si ferma e torna indietro. Guanto da forno: due schiaffi.
//  Schiaffo a vuoto: la tua mano resta dolorante per un attimo (niente clic a caso).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { txt, im, scalaDi, scritta, stelle, scuoti, caso, quanti, colpetto, fumetto, vibra, multiTouch } from '../fx.js';

const PIATTI = [
  { cibo: 'spaghetti', x: 84, y: 214 },
  { cibo: 'pizza', x: 162, y: 192 },
  { cibo: 'cotoletta', x: 240, y: 224 },
  { cibo: 'lasagna', x: 318, y: 192 },
  { cibo: 'tiramisu', x: 396, y: 214 },
];
// da dove spuntano le braccia
const ORIGINI = [
  { x: 224, y: 94 }, { x: 256, y: 94 },     // dalle spalle di Guerra
  { x: 118, y: 114 }, { x: 362, y: 114 },   // da sotto la tovaglia, sul bordo lontano
  { x: -14, y: 150 }, { x: 494, y: 150 },   // dai lati
  { x: -14, y: 236 }, { x: 494, y: 236 },
];
const TAGLIA_MANO = 0.55;   // mani: 40x56 unità di texture -> circa 22x31 sullo schermo
const PALMO = 11.5;         // dal polso al centro del palmo (unità di gioco)
const MANICA = 12;          // larghezza del braccio (unità di gioco)
const PX_MANICA = 18 * 6;   // larghezza della texture della manica in pixel
const Y_GUERRA = 127;

export class ManiScene extends MicrogiocoBase {
  constructor() { super('mani'); }

  prepara() {
    this.punti = 0;
    this.schiaffi = 0;
    this.rubati = [];
    this.mani = [];
    this.tMano = 0.8;
    this.tFrase = 3;
    this.tEspr = 0;
    this.bloccata = 0;
    this.hud = null;   // (la scena viene riusata: il testo dell'HUD va riscritto da capo)
    this.dopo = null;

    im(this, 0, 0, 'bgSala').setOrigin(0);
    this.guerra = im(this, 240, Y_GUERRA, 'guerra_normale', 0.8).setOrigin(0.5, 1).setDepth(5);
    im(this, 0, 80, 'tavola').setOrigin(0).setDepth(10);
    this.piatti = PIATTI.map((p) => ({
      ...p, stato: 'tavola', mano: null,
      img: im(this, p.x, p.y, 'piatto_' + p.cibo, 0.85).setOrigin(0.5, 23 / 40).setDepth(30 + p.y / 100),
    }));

    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });
    this.testoPiatti = txt(this, 474, 49, '', { ox: 1, depth: 1001, size: 8 });

    // la mia mano: col mouse fa da cursore, col dito compare dove tocchi
    this.manoMia = im(this, 240, 200, 'manoMia', 0.62).setOrigin(0.5, 0.6).setDepth(900);
    this.manoMia.scala = this.manoMia.scaleX;
    this.input.setDefaultCursor('none');
    multiTouch(this);   // si possono colpire due mani insieme
    this.input.on('pointerdown', (p) => this.schiaffo(p));
  }

  pulisci() { this.input.setDefaultCursor('default'); }

  get fase() {
    let f = this.cfg.fasi[0];
    for (const x of this.cfg.fasi) if (this.trascorso >= x.da) f = x;
    return f;
  }

  aggiorna(dt) {
    const c = this.cfg, f = this.fase;
    // --- nuove mani ---
    this.tMano -= dt;
    const attive = this.mani.filter((m) => m.stato !== 'colpita' && m.stato !== 'ritira').length;
    if (this.tMano <= 0 && attive < f.maxMani) {
      this.tMano = Phaser.Math.FloatBetween(f.intervallo[0], f.intervallo[1]);
      this.nuovaMano(f);
    }
    // --- mani in movimento ---
    for (const m of this.mani) this.muovi(m, dt, f);
    this.mani = this.mani.filter((m) => {
      if (!m.via) return true;
      m.img.destroy(); m.braccio.destroy();
      return false;
    });
    // --- la mia mano ---
    this.bloccata -= dt;
    const p = this.input.activePointer;
    if (!p.wasTouch) {
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      this.manoMia.setPosition(w.x, w.y).setVisible(true);
    }
    this.manoMia.setTint(this.bloccata > 0 ? 0xff7a6a : 0xffffff);
    if (this.bloccata > 0) this.manoMia.x += Math.sin(this.trascorso * 60) * 1.5;

    this.umore(dt);
    const rimasti = this.piatti.filter((x) => x.stato !== 'perso').length, hud = `${this.punti}|${rimasti}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText('PUNTI: ' + this.punti);
      this.testoPiatti.setText(`PIATTI: ${rimasti}/${PIATTI.length}`).setColor(rimasti >= c.piattiMinimi ? '#7dff9a' : '#ff9a8a');
    }
  }

  // una mano nuova verso un piatto che è ancora in tavola (meglio se nessuno lo sta già puntando)
  nuovaMano(f) {
    const liberi = this.piatti.filter((p) => p.stato === 'tavola');
    if (!liberi.length) return;
    const puntati = new Set(this.mani.filter((m) => m.stato === 'arriva').map((m) => m.piatto));
    const piatto = caso(liberi.filter((p) => !puntati.has(p)).length ? liberi.filter((p) => !puntati.has(p)) : liberi);
    const usate = new Set(this.mani.map((m) => m.o));
    const lontane = ORIGINI.filter((o) => Math.hypot(o.x - piatto.x, o.y - piatto.y) > 110);
    const o = caso(lontane.filter((x) => !usate.has(x)).length ? lontane.filter((x) => !usate.has(x)) : lontane);
    const L = Math.hypot(piatto.x - o.x, piatto.y - o.y), dir = { x: (piatto.x - o.x) / L, y: (piatto.y - o.y) / L };
    const guanto = Math.random() < f.guanto;
    const m = {
      o, piatto, dir, x: o.x, y: o.y, stato: 'arriva', vel: f.vel * Phaser.Math.FloatBetween(0.9, 1.1),
      finta: Math.random() < f.finta ? Phaser.Math.FloatBetween(0.45, 0.7) : null, guanto, attesa: 0,
      braccio: this.add.tileSprite(o.x, o.y, PX_MANICA, 1, 'manicaGuerra').setOrigin(0.5, 0).setScale(MANICA / PX_MANICA).setDepth(40),
      img: im(this, o.x, o.y, guanto ? 'manoGuerra_guanto' : 'manoGuerra_aperta', TAGLIA_MANO).setOrigin(0.5, 1).setDepth(45),
    };
    m.img.rotation = Math.atan2(dir.x, -dir.y);   // le dita guardano verso il piatto
    this.mani.push(m);
    this.disegna(m);
  }

  muovi(m, dt, f) {
    const c = this.cfg, verso = (tx, ty, v) => {
      const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy), passo = Math.min(d, v * dt);
      if (d > 0) { m.x += (dx / d) * passo; m.y += (dy / d) * passo; }
      return d - passo;
    };
    if (m.attesa > 0) { m.attesa -= dt; return this.disegna(m); }   // stordita o indecisa
    if (m.stato === 'arriva') {
      const P = m.piatto, resto = verso(P.x, P.y - 2, m.vel);
      const fatta = 1 - resto / Math.hypot(P.x - m.o.x, P.y - 2 - m.o.y);
      if (m.finta != null && fatta >= m.finta) { m.stato = 'ritira'; m.attesa = 0.3; }    // finta: si ferma e torna
      else if (resto <= 0.5) {
        if (P.stato === 'tavola') this.afferra(m);
        else m.stato = 'ritira';                                                         // l'ha già preso un'altra
      }
    } else if (m.stato === 'tira') {
      const resto = verso(m.o.x, m.o.y, f.tira);
      m.piatto.img.setPosition(m.x, m.y + 4);
      if (resto <= 1) this.rubato(m);
    } else if (m.stato === 'ritira' || m.stato === 'colpita') {
      if (verso(m.o.x, m.o.y, m.stato === 'colpita' ? c.velRitiro : m.vel * 1.5) <= 1) m.via = true;
    }
    this.disegna(m);
  }

  // braccio dall'origine al polso, mano col palmo in (x, y)
  disegna(m) {
    const wx = m.x - m.dir.x * PALMO, wy = m.y - m.dir.y * PALMO;
    const dx = wx - m.o.x, dy = wy - m.o.y, L = Math.hypot(dx, dy);
    m.braccio.setVisible(L > 1);
    if (L > 1) m.braccio.setSize(PX_MANICA, (L * PX_MANICA) / MANICA).setRotation(Math.atan2(-dx / L, dy / L));
    m.img.setPosition(wx, wy);
  }

  afferra(m) {
    const P = m.piatto;
    P.stato = 'presa';
    P.mano = m;
    m.stato = 'tira';
    if (!m.guanto) m.img.setTexture('manoGuerra_presa');
    P.img.setDepth(44);
    Audio.sfx('furto');
    scritta(this, P.x, P.y - 26, 'ME LO PRENDO!', { size: 8, color: '#ff9a8a', durata: 500 });
    this.espressione('felice', 0.8);
  }

  // il piatto arriva fino a Guerra: perso
  rubato(m) {
    const P = m.piatto;
    P.stato = 'perso';
    P.mano = null;
    m.via = true;
    this.rubati.push(P.cibo);
    Audio.sfx('gnam');
    scuoti(this, 120, 0.006);
    scritta(this, 240, 70, 'GNAM!', { size: 14, color: '#ffe14a' });
    this.espressione('felice', 1);
    if (Math.random() < 0.6) fumetto(this, 296, 30, caso(this.cfg.frasiFurto), 900, 50);
    this.tweens.add({ targets: P.img, x: 240, y: 62, scale: P.img.scale * 0.3, alpha: 0, duration: 260, ease: 'Quad.in', onComplete: () => P.img.setVisible(false) });
    if (this.piatti.every((x) => x.stato === 'perso')) this.time.delayedCall(400, () => this.termina());
  }

  // clic o tocco: schiaffo alla mano più vicina sotto il dito
  schiaffo(p) {
    if (!this.inCorso) return;
    const c = this.cfg, w = this.cameras.main.getWorldPoint(p.x, p.y);
    this.manoMia.setPosition(w.x, w.y).setVisible(true).setAngle(-25);
    this.tweens.killTweensOf(this.manoMia);
    this.tweens.add({ targets: this.manoMia, angle: 0, scale: { from: this.manoMia.scala * 1.25, to: this.manoMia.scala }, duration: 140, ease: 'Quad.out' });
    if (p.wasTouch) this.tweens.add({ targets: this.manoMia, alpha: { from: 1, to: 0 }, delay: 200, duration: 200 });
    else this.manoMia.setAlpha(1);
    if (this.bloccata > 0) return;   // la mano fa ancora male
    let mira = null, dMin = p.wasTouch ? c.raggioDito : c.raggioSchiaffo;
    for (const m of this.mani) {
      if (m.stato === 'colpita') continue;
      const d = Math.hypot(m.x - w.x, m.y - w.y);
      if (d <= dMin) { dMin = d; mira = m; }
    }
    if (mira) this.colpisci(mira);
    else this.aVuoto(w);
  }

  colpisci(m) {
    const c = this.cfg;
    stelle(this, m.x, m.y, 6, 901);
    scuoti(this, 90, 0.004);
    if (m.guanto) {
      // primo schiaffo: vola via il guanto
      m.guanto = false;
      m.attesa = 0.25;
      this.punti += c.puntiGuanto;
      Audio.sfx('pof');
      m.img.setTexture(m.stato === 'tira' ? 'manoGuerra_presa' : 'manoGuerra_aperta');
      const g = im(this, m.img.x, m.img.y, 'manoGuerra_guanto', TAGLIA_MANO).setOrigin(0.5, 1).setRotation(m.img.rotation).setDepth(46);
      this.tweens.add({ targets: g, x: g.x + Phaser.Math.Between(-60, 60), y: g.y - 70, angle: g.angle + 400, alpha: 0, duration: 600, ease: 'Quad.out', onComplete: () => g.destroy() });
      scritta(this, m.x, m.y - 22, `VIA IL GUANTO! +${c.puntiGuanto}`, { size: 8, color: '#ffe14a', durata: 400 });
      return;
    }
    const salvato = m.stato === 'tira';
    const ultimo = !salvato && m.stato === 'arriva' && Math.hypot(m.piatto.x - m.x, m.piatto.y - m.y) < c.vicino;
    const pt = salvato ? c.puntiSalvato : ultimo ? c.puntiUltimo : c.puntiSchiaffo;
    this.punti += pt;
    this.schiaffi++;
    m.stato = 'colpita';
    m.img.setTexture('manoGuerra_colpita');
    Audio.sfx('schiaffo');
    vibra(30);
    scritta(this, m.x, m.y - 20, 'SCIAF!', { size: 13, color: '#ffffff' });
    scritta(this, m.x, m.y - 6, salvato ? `SALVATO! +${pt}` : ultimo ? `ALL'ULTIMO! +${pt}` : `+${pt}`, { size: 8, color: '#7dff9a', durata: 450 });
    if (salvato) {
      // il piatto torna al suo posto
      const P = m.piatto;
      P.stato = 'torna';
      P.mano = null;
      this.tweens.add({ targets: P.img, x: P.x, y: P.y, duration: 260, ease: 'Back.out', onComplete: () => { P.stato = 'tavola'; P.img.setDepth(30 + P.y / 100); } });
    }
    this.espressione('shock', 0.35, 'sufficienza', 0.8);
    if (Math.random() < 0.3) fumetto(this, 296, 30, caso(c.frasiSchiaffo), 800, 50);
  }

  aVuoto(w) {
    this.bloccata = this.cfg.bloccoVuoto;
    Audio.sfx('tonfo');
    scritta(this, w.x, w.y - 18, 'AHIA! A VUOTO!', { size: 8, color: '#ff6b5a', durata: 400 });
  }

  // --- Guerra: espressioni e chiacchiere ---
  espressione(e, sec, poi, secPoi) {
    this.guerra.setTexture('guerra_' + e);
    this.tEspr = sec;
    this.dopo = poi ? [poi, secPoi] : null;
  }

  umore(dt) {
    this.guerra.angle = Math.sin(this.trascorso * 2.2) * 1.5;
    if (this.tEspr > 0) {
      this.tEspr -= dt;
      if (this.tEspr <= 0) {
        if (this.dopo) this.espressione(...this.dopo);
        else this.guerra.setTexture('guerra_normale');
      }
    }
    this.tFrase -= dt;
    if (this.tFrase <= 0) {
      this.tFrase = 5 + Math.random() * 3;
      fumetto(this, 296, 30, caso(this.cfg.frasi), 1100, 50);
    }
  }

  risultato() {
    const c = this.cfg, rimasti = this.piatti.filter((p) => p.stato !== 'perso').length;
    return {
      punteggio: this.punti + rimasti * c.puntiPiatto,
      vittoria: rimasti >= c.piattiMinimi,
      riepilogo: `${quanti(this.schiaffi, 'schiaffo', 'schiaffi')}, ${quanti(rimasti, 'piatto salvato', 'piatti salvati')} su ${PIATTI.length} (+${rimasti * c.puntiPiatto})`,
      titoloFine: rimasti ? 'TEMPO!' : 'TUTTO SPARITO!',
    };
  }

  // Guerra si mangia quello che ha rubato, oppure resta a bocca asciutta con le mani rosse
  finale(ris, fatto) {
    for (const m of this.mani) { m.img.destroy(); m.braccio.destroy(); }
    this.mani = [];
    this.manoMia.setVisible(false);
    for (const o of [this.testoPunti, this.testoPiatti]) o.setVisible(false);   // il conto finale è nella schermata dopo
    this.input.setDefaultCursor('default');
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.7, duration: 300 });
    this.guerra.setDepth(701).setAngle(0).setTexture('guerra_normale');
    this.tweens.add({ targets: this.guerra, y: 268, scale: scalaDi('guerra_normale', 1.7), duration: 400, ease: 'Back.out' });
    const titolo = (s, col) => txt(this, 240, 24, s, { size: 17, color: col, depth: 710 });

    this.time.delayedCall(700, () => {
      if (this.rubati.length) {
        this.guerra.setTexture('guerra_felice');
        titolo(ris.vittoria ? 'CENA SALVA! (QUASI)' : 'TI HA SVUOTATO LA TAVOLA!', ris.vittoria ? '#7dff9a' : '#ff6b5a');
        this.rubati.slice(0, 5).forEach((cibo, i) => this.time.delayedCall(i * 450, () => {
          const p = im(this, 240 + (i % 2 ? 60 : -60), 230, 'piatto_' + cibo, 1.3).setDepth(705);
          this.tweens.add({ targets: p, x: 240, y: 150, scale: p.scale * 0.4, alpha: 0, duration: 380, ease: 'Quad.in', onComplete: () => p.destroy() });
          this.time.delayedCall(330, () => { Audio.sfx('gnam'); scritta(this, 240 + Phaser.Math.Between(-70, 70), 120, 'GNAM!', { size: 14, color: '#ffe14a', depth: 711 }); });
        }));
      } else {
        this.guerra.setTexture('guerra_triste');
        Audio.sfx('tsk');
        titolo('A BOCCA ASCIUTTA!', '#7dff9a');
        // tutte le mani rosse che si soffia
        [[116, 118], [96, 172], [120, 226], [364, 118], [384, 172], [360, 226]].forEach(([x, y], i) => {
          const verso = x < 240 ? -1 : 1;
          const h = im(this, x, y, 'manoGuerra_colpita', 0.8).setDepth(702).setRotation(verso * (Math.PI / 2 + (y - 172) / 160)).setScale(0);
          this.tweens.add({ targets: h, scale: scalaDi('manoGuerra_colpita', 0.8), delay: i * 90, duration: 250, ease: 'Back.out' });
          this.tweens.add({ targets: h, angle: h.angle + 12, delay: 400, duration: 140, yoyo: true, repeat: -1 });
        });
      }
    });
    this.time.delayedCall(3400, fatto);
  }
}
