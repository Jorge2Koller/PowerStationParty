// Microgioco 13: "Petri Tentacolari" - scappa dal Piovra! SALVALE!
//
//  Pista della disco vista dall'alto. Il Petri sta in mezzo e allunga i tentacoli verso le
//  ragazze per attaccare bottone. Le ragazze entrano dall'ingresso e ballano: tocca una ragazza
//  e trascina per disegnarle la strada fino al tavolo delle amiche (uscita, a destra): salva.
//  Un tentacolo che la prende la tiene agganciata a chiacchierare col Petri: tocca il tentacolo
//  (SCIAF!) per liberarla. Aiuti con ricarica: la birra gratis (il Petri ci si fionda e molla
//  tutto) e l'amico in mezzo, O'Sfurnacchiat: si piazza tra il Petri e la ragazza più in pericolo,
//  la segue, e i tentacoli che ci passano contro sbattono (BONK!). Ogni tanto un tentacolo a
//  sorpresa sbuca da sotto un tavolino o dalla consolle.
//  Multi-touch: un dito disegna la strada, un altro dà gli schiaffi.
//  Tre atti annunciati: IL PETRI SI MUOVE, poi i TENTACOLI A SORPRESA. Le ragazze arrivano uguali
//  per tutti i giocatori del round (seme del round). Il punteggio non va sotto zero.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { RAGAZZE } from '../grafica/personaggi.js';
import { DISCO } from '../grafica/sfondi.js';
import { curvaTentacolo, disegnaTentacolo } from '../grafica/tentacoli.js';
import { txt, im, scalaDi, scritta, stelle, fumetto, scuoti, puntatore, lerp, caso, eTouch, vibra, multiTouch, puntiHud, numero, quanti } from '../fx.js';

const TAGLIA = 0.4;                                   // ragazze: circa 36x54 unità
const TAGLIA_PETRI = 0.44;
const PISTA = { x0: 52, x1: 428, y0: 106, y1: 246 }; // dove stanno i piedi di chi balla
const ZONA_PETRI = { x0: 180, x1: 300, y0: 140, y1: 214 };
const USCITA = { x: DISCO.uscita, y0: DISCO.uscitaY[0], y1: DISCO.uscitaY[1] };
// distanza del punto (px, py) dal segmento (ax, ay)-(bx, by)
function distSegmento(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy || 1;
  const k = Phaser.Math.Clamp(((px - ax) * vx + (py - ay) * vy) / l2, 0, 1);
  return Math.hypot(px - (ax + vx * k), py - (ay + vy * k));
}

const PULSANTI = [{ tipo: 'birra', x: 206, y: 250, ico: 'birraPetri', tasto: '1' }, { tipo: 'amico', x: 274, y: 250, ico: 'icoAmico', tasto: '2' }];
const ORIGINI_SORPRESA = [{ x: 78, y: 96, nome: 'DAL TAVOLINO!' }, { x: 402, y: 96, nome: 'DAL TAVOLINO!' }, { x: 240, y: 74, nome: 'DALLA CONSOLLE!' }];
// da dove escono i tentacoli del Petri (rispetto ai suoi piedi) e verso dove stanno a riposo
const ATTACCHI = [[-11, -24, Math.PI * 1.1], [11, -24, -Math.PI * 0.1], [-8, -14, Math.PI * 0.8], [8, -14, Math.PI * 0.2], [0, -30, -Math.PI / 2]];
const LUCI = [0xff4ad0, 0x4ad0ff, 0x7dff9a, 0xffd84a, 0xb07aff];
const col = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;

export class PiovraScene extends MicrogiocoBase {
  constructor() { super('piovra'); }

  prepara() {
    const c = this.cfg;
    this.rnd = casuale(Sessione.seme);
    this.nFase = 0;
    this.punti = 0;
    this.salvate = 0;
    this.serie = 0;
    this.serieMax = 0;
    this.hud = null;
    this.ragazze = [];
    this.disegni = {};          // id del dito (o del mouse) -> ragazza a cui sta disegnando la strada
    this.ultima = -1;
    this.tNuova = 0.2;
    this.tSorpresa = c.sorpresaDa;
    this.tChat = 1.5;
    this.tBattito = 0;
    this.sel = null;            // la ragazza scelta con la tastiera
    this.tastiera = false;
    this.mira = false;          // birra in mano: il prossimo tocco la lancia
    this.pinta = null;
    this.bevuta = 0;
    this.amico = null;
    this.aiuti = { birra: 0, amico: 0 };   // secondi di ricarica che mancano

    im(this, 0, 0, 'bgDisco').setOrigin(0);
    // luci della pista: ogni mattonella si accende a tempo di musica
    this.luci = [];
    for (let j = 0; j < DISCO.righe; j++) for (let i = 0; i < DISCO.col; i++) {
      const r = this.add.rectangle(DISCO.x0 + i * DISCO.lato + 1, DISCO.y0 + j * DISCO.alto + 1, DISCO.lato - 2, DISCO.alto - 2, LUCI[0], 0)
        .setOrigin(0).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
      this.luci.push({ r, v: 0 });
    }
    this.fasci = this.add.graphics().setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    this.percorsi = this.add.graphics().setDepth(5);
    this.segno = this.add.graphics().setDepth(6);

    // la consolle col DJ (lo Zio con le cuffie), i tavolini
    this.dj = im(this, 240, 64, 'zioDJ', 0.4).setOrigin(0.5, 1).setDepth(70);
    im(this, 240, 78, 'consolle', 1).setOrigin(0.5, 1).setDepth(78);
    for (const o of ORIGINI_SORPRESA.slice(0, 2)) im(this, o.x, o.y + 4, 'tavolino', 1).setOrigin(0.5, 1).setDepth(o.y + 4);

    // il Petri e i suoi tentacoli
    this.petri = { x: 240, y: 178, meta: null, pausa: 1, img: im(this, 240, 178, 'petri_normale', TAGLIA_PETRI).setOrigin(0.5, 1), espr: 'normale', tEspr: 0 };
    this.gT = this.add.graphics();
    this.gS = this.add.graphics().setDepth(101);   // i tentacoli a sorpresa, sopra i tavolini
    this.tentacoli = ATTACCHI.map(([dx, dy, ang], k) => ({
      tipo: 'petri', k, dx, dy, ang, stato: 'nascosto', len: 0, dir: ang, cool: 0.6 + k * 0.4, fase: k * 1.7, piega: (k % 2 ? 1 : -1) * 14, punti: null,
    }));
    this.sorprese = [];

    // gli aiuti
    this.gPuls = this.add.graphics().setDepth(1002);
    for (const b of PULSANTI) {
      b.img = im(this, b.x, b.y, b.ico, b.tipo === 'birra' ? 1.25 : 1.1).setDepth(1003);
      if (!eTouch()) b.lettera = txt(this, b.x + 11, b.y + 9, b.tasto, { size: 6, depth: 1004 });
    }
    this.aiutoMira = txt(this, 240, 228, '', { size: 8, color: '#ffe14a', depth: 1004 });
    this.birraMano = im(this, 0, 0, 'birraPetri', 1.2).setDepth(1005).setVisible(false);

    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });
    this.testoSalvate = txt(this, 474, 49, '', { ox: 1, depth: 1001, size: 8 });
    this.testoSerie = txt(this, 474, 61, '', { ox: 1, depth: 1001, size: 8, color: '#ff9af0' });

    multiTouch(this);
    this.input.on('pointerdown', (p) => this.tocco(p));
    this.input.on('pointermove', (p) => this.muoviDito(p));
    this.input.on('pointerup', (p) => { delete this.disegni[p.id]; });
    const k = this.input.keyboard;
    k.addCapture(['TAB', 'SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.frecce = k.createCursorKeys();
    k.on('keydown-TAB', () => this.prossima());
    k.on('keydown-SPACE', () => this.tastoSchiaffo());
    k.on('keydown-ONE', () => this.usaAiuto('birra', true));
    k.on('keydown-TWO', () => this.usaAiuto('amico', true));
  }

  alRientro() { this.disegni = {}; }

  get fase() {
    let f = this.cfg.fasi[0];
    for (const x of this.cfg.fasi) if (this.trascorso >= x.da) f = x;
    return f;
  }

  // ------------------------------------------------------------
  aggiorna(dt, p) {
    const f = this.fase, c = this.cfg, n = c.fasi.indexOf(f);
    if (n !== this.nFase) {
      this.nFase = n;
      if (f.nome) { Audio.sfx('bonus'); scritta(this, 240, 100, f.nome, { size: 14, color: '#ffe14a', durata: 1000, depth: 960 }); }
    }
    this.luciDisco(dt, p);

    // ragazze nuove dall'ingresso
    this.tNuova -= dt;
    if (this.tNuova <= 0 && this.ragazze.filter((r) => r.stato !== 'salva').length < f.max) {
      this.tNuova = f.ogni * (0.8 + this.rnd() * 0.4);
      this.nuovaRagazza();
    }
    for (const r of [...this.ragazze]) this.muoviRagazza(r, dt);

    this.muoviPetri(dt, f);
    for (const t of this.tentacoli) this.muoviTentacolo(t, dt, f);
    // tentacoli a sorpresa
    this.tSorpresa -= dt;
    if (this.trascorso >= c.sorpresaDa && this.tSorpresa <= 0) {
      this.tSorpresa = c.sorpresaOgni[0] + this.rnd() * (c.sorpresaOgni[1] - c.sorpresaOgni[0]);
      this.sorpresa();
    }
    for (const t of this.sorprese) this.muoviTentacolo(t, dt, f);
    this.sorprese = this.sorprese.filter((t) => t.stato !== 'via');
    this.disegnaTentacoli();

    // aiuti: ricarica, amico in mezzo
    for (const k of Object.keys(this.aiuti)) this.aiuti[k] = Math.max(0, this.aiuti[k] - dt);
    if (this.amico) { this.amico.t -= dt; if (this.amico.t <= 0) this.viaAmico(); else this.muoviAmico(dt); }
    this.disegnaPulsanti();
    if (this.mira) {
      const w = puntatore(this);
      this.birraMano.setVisible(!eTouch()).setPosition(w.x, w.y - 6);
    }

    // il Petri chiacchiera con chi ha agganciato
    const prese = this.ragazze.filter((r) => r.stato === 'presa');
    this.tChat -= dt;
    if (prese.length && this.tChat <= 0) {
      this.tChat = 2.4;
      const P = this.petri;
      fumetto(this, P.x, P.y - 66, caso(c.frasiPetri), 1300, 950);
      if (Math.random() < 0.5) {
        const r = caso(prese);
        this.time.delayedCall(700, () => { if (r.stato === 'presa' && !this.finito) fumetto(this, r.x, r.y - 62, caso(c.frasiRagazze), 1000, 950); });
      }
    }
    this.disegnaPercorsi();
    this.tastieraMuovi(dt);

    const hud = `${this.punti}|${this.salvate}|${this.serie}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(this.punti));
      this.testoSalvate.setText(`SALVATE: ${this.salvate}/${c.obiettivoSalvate}`).setColor(this.salvate >= c.obiettivoSalvate ? '#7dff9a' : '#ffe14a');
      this.testoSerie.setText(this.serie >= 2 ? `SERIE x${this.serie}` : '');
    }
  }

  // --- luci: mattonelle a tempo e due fasci che girano ---
  luciDisco(dt, p) {
    const passo = 60 / (122 * (1 + p * 0.3));
    this.tBattito -= dt;
    if (this.tBattito <= 0) {
      this.tBattito += passo;
      for (let i = 0; i < 12; i++) { const l = caso(this.luci); l.v = 1; l.r.fillColor = caso(LUCI); }
      this.dj.setScale(scalaDi('zioDJ', 0.4) * 1.04, scalaDi('zioDJ', 0.4) * 0.96);
      this.time.delayedCall(120, () => this.dj.setScale(scalaDi('zioDJ', 0.4)));
    }
    for (const l of this.luci) if (l.v > 0) { l.v = Math.max(0, l.v - dt * 2.2); l.r.fillAlpha = l.v * 0.32; }
    const g = this.fasci, a = this.trascorso * 0.8;
    g.clear();
    for (const [x, a0, colore] of [[20, a, 0xff4ad0], [460, Math.PI - a * 1.1, 0x4ad0ff]]) {
      const b = Math.PI / 2 + Math.sin(a0) * 0.7;
      g.fillStyle(colore, 0.1);
      g.fillTriangle(x, 0, x + Math.cos(b - 0.12) * 320, Math.sin(b - 0.12) * 320, x + Math.cos(b + 0.12) * 320, Math.sin(b + 0.12) * 320);
    }
  }

  // ------------------------------------------------------------
  //  RAGAZZE
  // ------------------------------------------------------------
  nuovaRagazza() {
    let v = Phaser.Math.Between(0, RAGAZZE.length - 1);
    if (v === this.ultima) v = (v + 1) % RAGAZZE.length;
    this.ultima = v;
    const r0 = this.rnd, y = DISCO.ingressoY + Math.round(r0() * 28 - 14);
    const r = {
      v, x: -12, y, stato: 'entra', perc: [], fase: r0() * 6, espr: '', tEspr: 0, colore: col(RAGAZZE[v].vestito.colore),
      meta: { x: 70 + Math.round(r0() * 80), y: Math.round(PISTA.y0 + 20 + r0() * (PISTA.y1 - PISTA.y0 - 40)) }, tMeta: 0,
      img: im(this, -12, y, `ragazza${v}_felice`, TAGLIA).setOrigin(0.5, 1),
    };
    this.ragazze.push(r);
  }

  libera(r) { return ['entra', 'balla', 'segue', 'tastiera', 'stordita'].includes(r.stato); }

  verso(o, x, y, vel, dt) {
    const dx = x - o.x, dy = y - o.y, d = Math.hypot(dx, dy), passo = Math.min(d, vel * dt);
    if (d > 0) { o.x += (dx / d) * passo; o.y += (dy / d) * passo; }
    return d - passo;
  }

  muoviRagazza(r, dt) {
    const c = this.cfg;
    if (r.stato === 'salva') return;
    if (r.stato === 'entra') {
      if (this.verso(r, r.meta.x, r.meta.y, c.velSegue * 0.7, dt) <= 1) { r.stato = 'balla'; r.tMeta = 1 + this.rnd(); }
    } else if (r.stato === 'balla') {
      r.tMeta -= dt;
      if (r.tMeta <= 0) {
        r.tMeta = 1.5 + this.rnd() * 1.5;
        r.meta = { x: Phaser.Math.Clamp(r.x + Math.round(this.rnd() * 80 - 40), PISTA.x0, PISTA.x1), y: Phaser.Math.Clamp(r.y + Math.round(this.rnd() * 60 - 30), PISTA.y0, PISTA.y1) };
      }
      this.verso(r, r.meta.x, r.meta.y, c.velBalla, dt);
    } else if (r.stato === 'segue') {
      if (r.perc.length) {
        const q = r.perc[0];
        if (this.verso(r, q.x, q.y, c.velSegue, dt) <= 0.5) r.perc.shift();
      } else if (!Object.values(this.disegni).includes(r)) {
        r.stato = 'balla'; r.meta = { x: Phaser.Math.Clamp(r.x, PISTA.x0, PISTA.x1), y: Phaser.Math.Clamp(r.y, PISTA.y0, PISTA.y1) }; r.tMeta = 1.5;
      }
    } else if (r.stato === 'stordita') {
      r.tStordita -= dt;
      if (r.tStordita <= 0) { r.stato = 'balla'; r.tMeta = 0.3; r.meta = { x: r.x, y: r.y }; }
    } else if (r.stato === 'presa') {
      const T = r.T, b = this.base(T), giu = r.y - 26;
      const d = Math.hypot(r.x - b.x, giu - b.y);
      if (d > (T.tipo === 'sorpresa' ? 22 : c.distanzaChiacchiera)) this.verso(r, r.x + (b.x - r.x), r.y + (b.y - giu), c.velTrascinata, dt);
      r.y = Phaser.Math.Clamp(r.y, PISTA.y0 - 6, PISTA.y1 + 6);
    }
    // arrivata al tavolo delle amiche?
    if (this.libera(r) && r.x >= USCITA.x && r.y >= USCITA.y0 && r.y <= USCITA.y1) return this.salva(r);

    // balla a tempo; la faccia dice come sta
    const tb = this.trascorso * 4.1 + r.fase;
    const presa = r.stato === 'presa', ballo = presa ? 0.3 : 1;
    r.img.setPosition(r.x, r.y - Math.abs(Math.sin(tb)) * 2.2 * ballo).setAngle(Math.sin(tb * 0.5) * 5 * ballo).setDepth(r.y);
    let e = 'felice';
    if (presa) e = Math.sin(this.trascorso * 1.6 + r.fase) > 0 ? 'sufficienza' : 'triste';
    else if (r.stato === 'stordita') e = 'shock';
    else if ([...this.tentacoli, ...this.sorprese].some((t) => t.stato === 'allunga' && t.bersaglio === r)) e = 'shock';
    else if (r.stato === 'segue' || r.stato === 'tastiera') e = 'normale';
    if (e !== r.espr) { r.espr = e; r.img.setTexture(`ragazza${r.v}_${e}`); }
  }

  salva(r) {
    const c = this.cfg;
    r.stato = 'salva';
    r.perc = [];
    this.salvate++;
    this.serie++;
    this.serieMax = Math.max(this.serieMax, this.serie);
    const bonus = this.serie >= 2 ? Math.min(c.maxBonusSerie, c.bonusSerie * (this.serie - 1)) : 0;
    const vale = Math.round(c.puntiSalvata * this.salvate);   // (la k-esima salvata vale k volte puntiSalvata)
    this.punti += vale + bonus;
    if (this.sel === r) this.sel = null;
    Audio.sfx('salva');
    r.img.setTexture(`ragazza${r.v}_felice`);
    scritta(this, r.x - 14, r.y - 64, bonus ? `SALVA! +${vale} SERIE +${bonus}` : `SALVA! +${vale}`, { size: 8, color: '#7dff9a', durata: 600 });
    fumetto(this, r.x - 20, r.y - 76, caso(c.frasiSalva), 900, 950);
    this.tweens.add({ targets: r.img, x: 500, alpha: 0, duration: 600, ease: 'Quad.in', onComplete: () => { r.img.destroy(); this.ragazze = this.ragazze.filter((x) => x !== r); } });
  }

  // ------------------------------------------------------------
  //  IL PETRI E I TENTACOLI
  // ------------------------------------------------------------
  muoviPetri(dt, f) {
    const P = this.petri, cs = this.cfg.birra;
    if (this.pinta) {
      // corre verso la birra gratis, poi se la beve
      if (this.verso(P, this.pinta.x, this.pinta.y, cs.velPetri, dt) <= 1) {
        this.pinta.img.destroy();
        this.pinta = null;
        this.bevuta = cs.durata;
        Audio.sfx('glu');
        scritta(this, P.x, P.y - 70, 'GLU GLU!', { size: 10, color: '#ffc34a', durata: 700 });
        this.espressione('felice', cs.durata);
      }
    } else if (this.bevuta > 0) {
      this.bevuta -= dt;
    } else if (f.petri > 0) {
      if (!P.meta) {
        P.pausa -= dt;
        if (P.pausa <= 0) P.meta = { x: Math.round(ZONA_PETRI.x0 + this.rnd() * (ZONA_PETRI.x1 - ZONA_PETRI.x0)), y: Math.round(ZONA_PETRI.y0 + this.rnd() * (ZONA_PETRI.y1 - ZONA_PETRI.y0)) };
      } else if (this.verso(P, P.meta.x, P.meta.y, f.petri, dt) <= 0.5) { P.meta = null; P.pausa = 1 + this.rnd() * 1.5; }
    }
    const tb = this.trascorso * 4.1;
    P.img.setPosition(P.x, P.y - Math.abs(Math.sin(tb)) * 1.5).setAngle(Math.sin(tb * 0.5) * 3).setDepth(P.y);
    this.gT.setDepth(P.y - 0.5);
    // espressione: felice con qualcuna agganciata, se no normale (dopo le reazioni brevi)
    P.tEspr -= dt;
    if (P.tEspr <= 0) {
      const e = this.ragazze.some((r) => r.stato === 'presa') ? 'felice' : 'normale';
      if (e !== P.espr) { P.espr = e; P.img.setTexture('petri_' + e); }
    }
  }

  espressione(e, sec) {
    const P = this.petri;
    P.espr = e; P.tEspr = sec;
    P.img.setTexture('petri_' + e);
  }

  // da dove parte il tentacolo
  base(t) {
    if (t.tipo === 'sorpresa') return { x: t.ox, y: t.oy };
    return { x: this.petri.x + t.dx, y: this.petri.y + t.dy };
  }

  bloccati() { return !!this.pinta || this.bevuta > 0; }

  // la ragazza libera più vicina, meglio se non è già puntata da un altro tentacolo
  scegliBersaglio(b, portata) {
    const puntate = new Set([...this.tentacoli, ...this.sorprese].filter((t) => t.stato === 'allunga').map((t) => t.bersaglio));
    let meglio = null, dMin = portata;
    for (const r of this.ragazze) {
      if (!this.libera(r) || r.stato === 'stordita' || this.protetta(r)) continue;
      const d = Math.hypot(r.x - b.x, r.y - 26 - b.y) + (puntate.has(r) ? 60 : 0);
      if (d < dMin) { dMin = d; meglio = r; }
    }
    return meglio;
  }

  muoviTentacolo(t, dt, f) {
    const b = this.base(t);
    t.tRosso = Math.max(0, (t.tRosso ?? 0) - dt);
    if (t.tipo === 'petri') {
      if (t.k >= f.tentacoli && t.stato === 'nascosto') return;
      if (t.stato === 'nascosto') { t.stato = 'ritira'; t.len = 0; }
    }
    const riposo = t.tipo === 'petri' ? 14 : 0;
    if (this.bloccati() && t.tipo === 'petri' && ['allunga', 'presa'].includes(t.stato)) this.molla(t, false);
    if (t.stato === 'riposo') {
      t.dir = t.ang + Math.sin(this.trascorso * 1.5 + t.fase) * 0.5;
      t.len = riposo + Math.sin(this.trascorso * 3 + t.fase) * 3;
      t.cool -= dt;
      if (t.cool <= 0 && !this.bloccati()) {
        const r = this.scegliBersaglio(b, f.portata);
        if (r) { t.stato = 'allunga'; t.bersaglio = r; t.piega = (this.rnd() < 0.5 ? -1 : 1) * Math.round(10 + this.rnd() * 16); Audio.sfx('plop'); }
        else t.cool = 0.3;
      }
    } else if (t.stato === 'allunga') {
      const r = t.bersaglio;
      if (!r || !this.libera(r)) return this.molla(t, false);
      const tx = r.x, ty = r.y - 26, D = Math.hypot(tx - b.x, ty - b.y);
      const voluto = Math.atan2(ty - b.y, tx - b.x);
      t.dir += Phaser.Math.Angle.Wrap(voluto - t.dir) * Math.min(1, dt * 8);
      t.len += (t.tipo === 'sorpresa' ? this.cfg.velSorpresa : f.vel) * (eTouch() ? 1 : this.cfg.velPC ?? 1) * dt;
      // l'amico in mezzo: se il tentacolo gli passa contro (in qualunque punto) sbatte, e se
      // puntava la ragazza che lui protegge rinuncia appena ci arriva vicino
      const A = this.amico, punta = { x: b.x + Math.cos(t.dir) * t.len, y: b.y + Math.sin(t.dir) * t.len };
      if (A && (distSegmento(A.x, A.y - 18, b.x, b.y, punta.x, punta.y) < this.cfg.amico.raggio || this.protetta(r) && Math.hypot(punta.x - r.x, punta.y - r.y + 26) < 40)) return this.sbatte(t, punta);
      if (t.len >= D - 3) return this.aggancia(t, r);
      if (D > f.portata * 1.2 || t.len > f.portata * 1.3) this.molla(t, false);
    } else if (t.stato === 'presa') {
      const r = t.bersaglio;
      if (this.protetta(r)) return this.sbatte(t, { x: r.x, y: r.y - 26 });
      t.dir = Math.atan2(r.y - 26 - b.y, r.x - b.x);
      t.len = Math.hypot(r.x - b.x, r.y - 26 - b.y);
    } else if (t.stato === 'ritira') {
      t.len = Math.max(riposo, t.len - (t.tRosso > 0 ? 40 : 230) * dt);
      if (t.len <= riposo + 0.5) {
        if (t.tipo === 'sorpresa') t.stato = 'via';
        else { t.stato = 'riposo'; t.cool = f.reazione[0] + this.rnd() * (f.reazione[1] - f.reazione[0]) + (t.dopoSchiaffo ? 0.6 : 0); t.dopoSchiaffo = false; }
      }
    }
  }

  // il tentacolo sbatte contro l'amico e torna indietro
  sbatte(t, punto) {
    const A = this.amico;
    Audio.sfx('bonk');
    scritta(this, punto.x, punto.y - 10, 'BONK!', { size: 9, color: '#ffe14a', durata: 400 });
    if (A && this.time.now - (A.ultimaFrase ?? 0) > 1500 && Math.random() < 0.5) { A.ultimaFrase = this.time.now; fumetto(this, A.x, A.y - 64, caso(this.cfg.frasiAmico), 800, 950); }
    this.molla(t, false);
    t.tRosso = 0.25;
  }

  // la protegge l'amico? (quella che segue, e chi gli sta proprio accanto)
  protetta(r) {
    const A = this.amico;
    return !!A && !!r && (r === A.r || Math.hypot(r.x - A.x, r.y - A.y) < this.cfg.amico.scudo);
  }

  aggancia(t, r) {
    const c = this.cfg;
    t.stato = 'presa';
    r.stato = 'presa';
    r.T = t;
    r.perc = [];
    for (const k of Object.keys(this.disegni)) if (this.disegni[k] === r) delete this.disegni[k];
    if (this.sel === r) this.sel = null;
    this.serie = 0;
    Audio.sfx('plop');
    vibra(40);
    scritta(this, r.x, r.y - 66, 'AGGANCIATA!', { size: 8, color: '#ff9af0', durata: 500 });
    this.espressione('felice', 1.2);
    fumetto(this, this.petri.x, this.petri.y - 66, caso(c.frasiPetri), 1200, 950);
    this.tChat = 2.4;
  }

  // il tentacolo lascia (e la ragazza, se l'aveva presa, resta un attimo frastornata)
  molla(t, schiaffo) {
    const r = t.bersaglio;
    if (t.stato === 'presa' && r && r.stato === 'presa') { r.stato = 'stordita'; r.tStordita = 0.5; r.T = null; }
    t.stato = 'ritira';
    t.bersaglio = null;
    if (schiaffo) { t.tRosso = 0.35; t.dopoSchiaffo = true; }
  }

  sorpresa() {
    const o = ORIGINI_SORPRESA[Math.floor(this.rnd() * ORIGINI_SORPRESA.length)];
    const t = { tipo: 'sorpresa', ox: o.x, oy: o.y, stato: 'riposo', len: 0, dir: Math.PI / 2, ang: Math.PI / 2, cool: 0, fase: this.rnd() * 6, piega: 16, punti: null };
    const r = this.scegliBersaglio(o, 230);
    if (!r) return;
    t.stato = 'allunga'; t.bersaglio = r;
    this.sorprese.push(t);
    Audio.sfx('plop');
    scritta(this, o.x, o.y - 14, o.nome, { size: 7, color: '#ff9af0', durata: 500 });
  }

  disegnaTentacoli() {
    this.gT.clear(); this.gS.clear();
    for (const t of [...this.tentacoli, ...this.sorprese]) {
      if (t.stato === 'nascosto' || t.stato === 'via' || t.len < 2) { t.punti = null; continue; }
      const b = this.base(t), presa = t.stato === 'presa';
      const x1 = b.x + Math.cos(t.dir) * t.len, y1 = b.y + Math.sin(t.dir) * t.len;
      const n = t.len < 30 ? 7 : 13;
      t.punti = curvaTentacolo(b.x, b.y, x1, y1, { n, piega: t.piega * Math.min(1, t.len / 70), fase: this.trascorso * 4 + t.fase, onda: presa ? 1.5 : 3, ricciolo: presa ? 1 : 0.6 });
      t.spessore = t.tipo === 'sorpresa' ? 8 : 9;
      disegnaTentacolo(t.tipo === 'sorpresa' ? this.gS : this.gT, t.punti, { base: t.spessore, punta: 2.6, tinta: t.tRosso > 0 ? '#ff6a8a' : undefined });
    }
  }

  // il tentacolo sotto il dito (o null)
  tentacoloSotto(w, extra) {
    let meglio = null, dMin = Infinity;
    for (const t of [...this.tentacoli, ...this.sorprese]) {
      const P = t.punti;
      if (!P || t.len < 6 || t.stato === 'ritira') continue;
      for (let i = 0; i < P.length - 1; i++) {
        const a = P[i], q = P[i + 1], dx = q.x - a.x, dy = q.y - a.y, L2 = dx * dx + dy * dy || 1;
        const u = Phaser.Math.Clamp(((w.x - a.x) * dx + (w.y - a.y) * dy) / L2, 0, 1);
        const d = Math.hypot(w.x - (a.x + dx * u), w.y - (a.y + dy * u));
        const s = t.spessore * (1 - Math.min(1, i / P.length)) / 2 + this.cfg.raggioTentacolo + extra;
        if (d <= s && d < dMin) { dMin = d; meglio = t; }
      }
    }
    return meglio;
  }

  schiaffo(t) {
    const c = this.cfg, P = t.punti, pt = P ? P[Math.min(P.length - 1, Math.floor(P.length * 0.7))] : this.base(t);
    this.molla(t, true);
    Audio.sfx('schiaffo');
    vibra(30);
    scuoti(this, 80, 0.003);
    stelle(this, pt.x, pt.y, 5, 960);
    scritta(this, pt.x, pt.y - 14, 'SCIAF!', { size: 12, color: '#ffffff', durata: 450 });
    if (t.tipo === 'petri') {
      this.espressione('shock', 0.4);
      this.time.delayedCall(400, () => { if (!this.finito) this.espressione('sufficienza', 0.6); });
      if (Math.random() < 0.3) fumetto(this, this.petri.x, this.petri.y - 66, caso(c.frasiSchiaffo), 800, 950);
    }
  }

  // ------------------------------------------------------------
  //  AIUTI
  // ------------------------------------------------------------
  usaAiuto(tipo, daTastiera) {
    if (!this.inCorso || this.aiuti[tipo] > 0) { Audio.sfx('vuoto'); return; }
    if (tipo === 'amico') return this.chiamaAmico();
    if (daTastiera) return this.lanciaBirra(this.puntoLontano());
    this.mira = !this.mira;
    this.aiutoMira.setText(this.mira ? (eTouch() ? 'TOCCA DOVE LANCIARE LA BIRRA' : 'CLICCA DOVE LANCIARE LA BIRRA') : '');
    this.birraMano.setVisible(false);
    Audio.sfx('muovi');
  }

  // per la tastiera: il punto della pista più lontano dalle ragazze
  puntoLontano() {
    let meglio = { x: 240, y: 200 }, dMax = -1;
    for (let x = PISTA.x0 + 20; x <= PISTA.x1 - 20; x += 40) for (let y = PISTA.y0 + 10; y <= PISTA.y1 - 10; y += 30) {
      const d = Math.min(400, ...this.ragazze.filter((r) => r.stato !== 'salva').map((r) => Math.hypot(r.x - x, r.y - y)));
      if (d > dMax) { dMax = d; meglio = { x, y }; }
    }
    return meglio;
  }

  lanciaBirra(w) {
    const c = this.cfg, P = this.petri;
    this.mira = false;
    this.aiutoMira.setText('');
    this.birraMano.setVisible(false);
    this.aiuti.birra = c.birra.ricarica;
    const x = Phaser.Math.Clamp(w.x, PISTA.x0, PISTA.x1), y = Phaser.Math.Clamp(w.y, PISTA.y0, PISTA.y1);
    const img = im(this, PULSANTI[0].x, PULSANTI[0].y, 'birraPetri', 1.2).setDepth(959);
    this.tweens.add({ targets: img, x, duration: 380, ease: 'Linear' });
    this.tweens.add({ targets: img, y: { from: PULSANTI[0].y, to: y - 4 }, angle: 360, duration: 380, ease: 'Back.in', onComplete: () => img.setDepth(y) });
    Audio.sfx('lancio');
    this.pinta = { x, y, img };
    P.meta = null;
    for (const t of [...this.tentacoli, ...this.sorprese]) if (t.stato === 'allunga' || t.stato === 'presa') this.molla(t, false);
    fumetto(this, P.x, P.y - 66, caso(c.frasiBirra), 1000, 950);
    this.espressione('shock', 0.5);
  }

  chiamaAmico() {
    const c = this.cfg, P = this.petri;
    this.aiuti.amico = c.amico.ricarica;
    if (this.amico) this.viaAmico();
    const r = this.inPericolo();
    const { x: tx, y: ty } = r ? this.postoAmico(r) : { x: P.x + 40, y: P.y + 20 };
    const img = im(this, tx, ty - 80, `${c.amico.id}_sufficienza`, TAGLIA).setOrigin(0.5, 1).setDepth(ty);
    this.tweens.add({ targets: img, y: ty, duration: 260, ease: 'Bounce.out' });
    this.amico = { x: tx, y: ty, img, t: c.amico.durata, r, arrivo: 0.26 };
    Audio.sfx('fischietto');
    // "Gnamo Petri, falla finita": il Petri risponde con un verso, poi il lamento
    fumetto(this, tx, ty - 64, c.fraseAmico, 1300, 950);
    this.time.delayedCall(1150, () => { if (!this.finito) { fumetto(this, this.petri.x, this.petri.y - 66, c.versoPetri, 700, 951); Audio.sfx('verso'); this.espressione('shock', 0.7); } });
    this.time.delayedCall(1900, () => { if (!this.finito) { fumetto(this, this.petri.x, this.petri.y - 66, c.lamentoPetri, 1400, 951); Audio.sfx('lamento'); this.espressione('triste', 1.4); } });
    // i tentacoli che la tenevano o stavano arrivando sbattono contro di lui
    for (const t of [...this.tentacoli, ...this.sorprese]) if ((t.stato === 'allunga' || t.stato === 'presa') && t.bersaglio && this.protetta(t.bersaglio)) this.sbatte(t, { x: tx, y: ty - 40 });
  }

  // la ragazza più in pericolo: quella col tentacolo più vicino (o già presa), se no la più vicina al Petri
  inPericolo() {
    const P = this.petri;
    let r = null, dMin = Infinity;
    for (const t of [...this.tentacoli, ...this.sorprese]) if ((t.stato === 'allunga' || t.stato === 'presa') && t.bersaglio && t.bersaglio.stato !== 'salva') {
      const b = this.base(t), d = t.stato === 'presa' ? -1 : Math.hypot(t.bersaglio.x - b.x, t.bersaglio.y - b.y) - t.len;
      if (d < dMin) { dMin = d; r = t.bersaglio; }
    }
    if (!r) for (const x of this.ragazze) if (this.libera(x)) { const d = Math.hypot(x.x - P.x, x.y - P.y); if (d < dMin) { dMin = d; r = x; } }
    return r;
  }

  // dove si mette l'amico: davanti alla ragazza, dalla parte del Petri
  postoAmico(r) {
    const P = this.petri, dx = P.x - r.x, dy = P.y - r.y, d = Math.hypot(dx, dy) || 1;
    return { x: Phaser.Math.Clamp(r.x + (dx / d) * 24, PISTA.x0, PISTA.x1), y: Phaser.Math.Clamp(r.y + (dy / d) * 12 + 4, PISTA.y0, PISTA.y1) };
  }

  // l'amico segue la ragazza che protegge (se è salva o sparita, passa alla prossima in pericolo)
  muoviAmico(dt) {
    const A = this.amico;
    A.arrivo -= dt;
    if (!A.r || A.r.stato === 'salva' || !this.ragazze.includes(A.r)) A.r = this.inPericolo();
    if (A.r && A.arrivo <= 0) {
      const p = this.postoAmico(A.r);
      this.verso(A, p.x, p.y, this.cfg.amico.vel, dt);
      A.img.setPosition(A.x, A.y).setDepth(A.y);
    }
  }

  viaAmico() {
    const A = this.amico;
    this.amico = null;
    this.tweens.add({ targets: A.img, alpha: 0, y: A.img.y - 20, duration: 300, onComplete: () => A.img.destroy() });
  }

  disegnaPulsanti() {
    const g = this.gPuls, c = this.cfg;
    g.clear();
    for (const b of PULSANTI) {
      const resto = this.aiuti[b.tipo], tot = c[b.tipo].ricarica, pronto = resto <= 0;
      g.fillStyle(0x000000, 0.3); g.fillCircle(b.x + 1, b.y + 2, 15);
      g.fillStyle(this.mira && b.tipo === 'birra' ? 0x7a2fa8 : 0x1f1430, 0.92); g.fillCircle(b.x, b.y, 15);
      if (!pronto) {
        g.fillStyle(0x000000, 0.55);
        g.beginPath(); g.slice(b.x, b.y, 15, -Math.PI / 2, -Math.PI / 2 + (resto / tot) * Math.PI * 2, false); g.fillPath();
      }
      g.lineStyle(2, pronto ? 0xffe14a : 0x6a6a7a, 1); g.strokeCircle(b.x, b.y, 15);
      b.img.setAlpha(pronto ? 1 : 0.45);
    }
  }

  // ------------------------------------------------------------
  //  INPUT
  // ------------------------------------------------------------
  tocco(p) {
    if (!this.inCorso) return;
    const w = puntatore(this, p), extra = p.wasTouch ? this.cfg.raggioDito : 0;
    // i pulsanti degli aiuti
    for (const b of PULSANTI) if (Math.hypot(w.x - b.x, w.y - b.y) <= 16 + extra) return this.usaAiuto(b.tipo, false);
    if (this.mira) return this.lanciaBirra(w);
    // una ragazza libera: si comincia a disegnarle la strada
    let r = null, dMin = Infinity;
    for (const x of this.ragazze) {
      if (!this.libera(x) || x.stato === 'entra' && x.x < 10) continue;
      if (Math.abs(w.x - x.x) <= 11 + extra && w.y <= x.y + 3 + extra && w.y >= x.y - 52 - extra) {
        const d = Math.hypot(w.x - x.x, w.y - (x.y - 26));
        if (d < dMin) { dMin = d; r = x; }
      }
    }
    if (r) {
      r.stato = 'segue';
      r.perc = [];
      this.disegni[p.id] = r;
      return;
    }
    // un tentacolo (o una ragazza agganciata: lo schiaffo va al suo tentacolo)
    const t = this.tentacoloSotto(w, extra);
    if (t) return this.schiaffo(t);
    for (const x of this.ragazze) if (x.stato === 'presa' && Math.abs(w.x - x.x) <= 12 + extra && w.y <= x.y + 3 && w.y >= x.y - 52) return this.schiaffo(x.T);
  }

  muoviDito(p) {
    const r = this.disegni[p.id];
    if (!r || r.stato !== 'segue') return;
    const w = puntatore(this, p), x = Phaser.Math.Clamp(w.x, PISTA.x0 - 20, 476), y = Phaser.Math.Clamp(w.y + 20, PISTA.y0, PISTA.y1);
    const ult = r.perc[r.perc.length - 1] ?? r;
    if (Math.hypot(x - ult.x, y - ult.y) >= 5) r.perc.push({ x, y });
  }

  // la strada disegnata: puntini del colore del vestito
  disegnaPercorsi() {
    const g = this.percorsi;
    g.clear();
    for (const r of this.ragazze) {
      if (r.stato !== 'segue' || !r.perc.length) continue;
      let prec = { x: r.x, y: r.y }, resto = 0;
      for (const q of r.perc) {
        const d = Math.hypot(q.x - prec.x, q.y - prec.y);
        for (let s = 8 - resto; s <= d; s += 8) { const u = s / d; g.fillStyle(r.colore, 0.85); g.fillCircle(prec.x + (q.x - prec.x) * u, prec.y + (q.y - prec.y) * u, 1.6); }
        resto = (resto + d) % 8;
        prec = q;
      }
      const fine = r.perc[r.perc.length - 1];
      g.lineStyle(1.5, r.colore, 0.9); g.strokeCircle(fine.x, fine.y, 4);
    }
    // la ragazza scelta con la tastiera
    this.segno.clear();
    if (this.tastiera && this.sel && this.sel.stato !== 'salva') {
      this.segno.lineStyle(1.6, 0xffe14a, 1); this.segno.strokeEllipse(this.sel.x, this.sel.y, 26, 9);
    }
  }

  // --- tastiera ---
  prossima() {
    if (!this.inCorso) return;
    this.tastiera = true;
    const libere = this.ragazze.filter((r) => this.libera(r)).sort((a, b) => a.x - b.x);
    if (!libere.length) { this.sel = null; return; }
    const i = libere.indexOf(this.sel);
    this.sel = libere[(i + 1) % libere.length];
    Audio.sfx('muovi');
  }

  tastieraMuovi(dt) {
    const k = this.frecce, dx = (k.right.isDown ? 1 : 0) - (k.left.isDown ? 1 : 0), dy = (k.down.isDown ? 1 : 0) - (k.up.isDown ? 1 : 0);
    if (!dx && !dy) {
      if (this.sel?.stato === 'tastiera' && (this.sel.tFermo = (this.sel.tFermo ?? 0) + dt) > 1.5) { this.sel.stato = 'balla'; this.sel.meta = { x: this.sel.x, y: this.sel.y }; }
      return;
    }
    this.tastiera = true;
    if (!this.sel || !this.libera(this.sel)) this.prossima();
    const r = this.sel;
    if (!r || !this.libera(r)) return;
    r.stato = 'tastiera';
    r.tFermo = 0;
    r.perc = [];
    const L = Math.hypot(dx, dy), v = this.cfg.velSegue * dt;
    r.x = Phaser.Math.Clamp(r.x + (dx / L) * v, PISTA.x0 - 20, 476);
    r.y = Phaser.Math.Clamp(r.y + (dy / L) * v, PISTA.y0, PISTA.y1);
  }

  tastoSchiaffo() {
    if (!this.inCorso) return;
    const r = this.sel, tutti = [...this.tentacoli, ...this.sorprese].filter((t) => t.punti && t.len > 6 && t.stato !== 'ritira');
    let t = null;
    if (r?.stato === 'presa') t = r.T;
    else if (r) t = tutti.find((x) => x.bersaglio === r) ?? null;
    if (!t) {
      // il tentacolo più lungo (quello che sta per arrivare qualcuno)
      const pericolosi = tutti.filter((x) => x.stato === 'allunga' || x.stato === 'presa').sort((a, b) => b.len - a.len);
      t = pericolosi[0] ?? null;
    }
    if (t) this.schiaffo(t);
    else Audio.sfx('vuoto');
  }

  // ------------------------------------------------------------
  risultato() {
    const c = this.cfg, prese = this.ragazze.filter((r) => r.stato === 'presa').length;
    const vittoria = this.salvate >= c.obiettivoSalvate;
    // (mai sotto zero; e con l'obiettivo raggiunto le agganciate non portano sotto il bronzo:
    // scheda di valutazione, "se salvi 8 ragazze perdi comunque". Con 2,8 a salvata le prime 8
    // fanno 101, e bastava una ragazza agganciata allo scadere per scendere sotto i 100)
    let punteggio = Math.max(0, this.punti - prese * c.malusAgganciata);
    if (vittoria) punteggio = Math.max(punteggio, Math.min(this.punti, c.medaglie.bronzo));
    const tolti = this.punti - punteggio;
    return {
      punteggio,
      vittoria,
      // (le agganciate si scrivono solo se tolgono davvero qualcosa)
      riepilogo: `salvate ${this.salvate}, serie max ${this.serieMax}` + (tolti > 0 ? `, agganciate ${prese} (-${tolti})` : ''),
      titoli: ['TEMPO!', 'IL PIOVRA HA VINTO!'],
    };
  }

  // Tante salvate: il Petri resta solo in mezzo alla pista, coi tentacoli a terra.
  // Tante agganciate: lui al centro, felicissimo, circondato di ragazze annoiate.
  finale(ris, fatto) {
    const prese = this.ragazze.filter((r) => r.stato === 'presa');
    for (const o of [this.testoPunti, this.testoSalvate, this.testoSerie, this.aiutoMira, this.gPuls, this.percorsi, this.segno, this.birraMano]) o.setVisible(false);
    for (const b of PULSANTI) { b.img.setVisible(false); b.lettera?.setVisible(false); }
    this.gT.clear(); this.gS.clear();
    this.pinta?.img.destroy();
    if (this.amico) this.amico.img.setVisible(false);
    for (const r of this.ragazze) if (r.stato !== 'presa') r.img.setVisible(false);
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x0a0614, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.75, duration: 300 });
    const titolo = (s, colore) => txt(this, 240, 24, s, { size: 17, color: colore, depth: 720 });
    const P = this.petri, g = this.add.graphics().setDepth(705);
    P.img.setDepth(710).setAngle(0);
    this.tweens.add({ targets: P.img, x: 240, y: 214, scale: scalaDi('petri_normale', 0.9), duration: 450, ease: 'Back.out' });

    this.time.delayedCall(550, () => {
      if (ris.vittoria) {
        // solo, sotto un faro, coi tentacoli mosci per terra
        for (const r of prese) r.img.setVisible(false);
        P.img.setTexture('petri_triste');
        titolo('IL PIOVRA RESTA SOLO!', '#7dff9a');
        Audio.sfx('sbadiglio');
        const faro = this.add.graphics().setDepth(704).setBlendMode(Phaser.BlendModes.ADD);
        faro.fillStyle(0xfff0c0, 0.16); faro.fillTriangle(240, 0, 180, 222, 300, 222); faro.fillEllipse(240, 214, 130, 22);
        for (const [x, y, piega] of [[120, 226, -10], [150, 248, 12], [340, 248, -12], [365, 226, 10], [240, 258, 8]]) {
          disegnaTentacolo(g, curvaTentacolo(240 + Math.sign(x - 240) * 12, 196, x, y, { piega, onda: 1, ricciolo: 0.9, n: 12 }), { base: 13, punta: 3 });
        }
        fumetto(this, 240, 120, 'Vabbè... vado a casa.', 1400, 721);
      } else {
        // felicissimo, circondato di ragazze annoiate (le agganciate, o almeno tre)
        P.img.setTexture('petri_felice');
        titolo('IL PIOVRA HA FATTO IL PIENO!', '#ff6b5a');
        Audio.sfx('ok');
        const posti = [[140, 236], [340, 236], [180, 262], [300, 262], [110, 262], [370, 262]];
        const quante = Math.max(3, Math.min(posti.length, prese.length));
        for (let i = 0; i < quante; i++) {
          const [x, y] = posti[i], v = prese[i] ? prese[i].v : (i + 2) % RAGAZZE.length;
          if (prese[i]) prese[i].img.setVisible(false);
          const img = im(this, x, y + 30, `ragazza${v}_sufficienza`, 0.62).setOrigin(0.5, 1).setDepth(708 + (y > 250 ? 4 : 0)).setAlpha(0);
          this.tweens.add({ targets: img, y, alpha: 1, delay: i * 120, duration: 260, ease: 'Quad.out' });
          this.time.delayedCall(300 + i * 120, () => disegnaTentacolo(g, curvaTentacolo(240 + (x < 240 ? -14 : 14), 180, x, y - 34, { piega: (x < 240 ? 12 : -12), onda: 2, ricciolo: 1 }), { base: 13, punta: 3 }));
        }
        fumetto(this, 240, 112, caso(['Chi vuole un altro drink?', 'Serata fortunata!', 'Sono irresistibile.']), 1400, 721);
        this.time.delayedCall(900, () => fumetto(this, 140, 160, '...noia.', 900, 721));
      }
    });
    this.time.delayedCall(3600, fatto);
  }
}
