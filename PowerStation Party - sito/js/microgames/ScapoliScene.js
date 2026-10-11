// Microgioco 12: "L'Incubo degli Scapoli" - in discoteca contro il Manna, la calamita.
//
//  La pista è vista dall'alto; i personaggi stanno in piedi e chi è più in basso copre chi è
//  dietro. Le ragazze entrano una alla volta, ballano e girano per il locale.
//  IL MANNA lo muove il computer: balla al centro e ha un'AURA dorata che tira a sé le ragazze
//  (più sono vicine, più forte). Se una lo tocca, è sua.
//  IL GIOCATORE:
//   - FARE COLPO: se resta fermo vicino a una ragazza, sopra di lei compare UNA freccia (sul
//     telefono un cerchio) con un anello che si consuma piano: basta premere quella freccia, o
//     toccare il bersaglio, prima che finisca il tempo. Non c'è ritmo da seguire. Tre giuste
//     e balla con lui; dentro l'aura del Manna ogni freccia rende la metà.
//   - FARE DA MURO: se sta tra lei e il Manna, l'aura la tira molto meno.
//   - SABOTAGGI: raccoglie un oggetto passandoci sopra e lo usa (SPAZIO, clic sull'icona,
//     pulsante sul telefono): per qualche secondo l'aura si spegne o si indebolisce.
//  Negli ultimi secondi il Manna si scatena e l'aura si allarga.
//  Luci e balletti vanno a tempo su un "battito" lungo quanto quello della musica (Audio.battito).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { DISCO, SABOTAGGI } from '../grafica/disco.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, pannello, scuoti, puntatore, colpetto, lerp, caso, quanti, eTouch, vibra, multiTouch } from '../fx.js';

const P = DISCO.pista, A = DISCO.area, C = DISCO.centro, U = DISCO.uscita, B = DISCO.buttafuori;
const LARGA = P.col * P.lato, ALTA = P.righe * P.alt;
const TAGLIA = 0.42;                          // grandezza dei personaggi in pista
const GRANDE = 1.5;                           // grandezza del bersaglio della sfida
const COLORI = [0xff3b7a, 0x3bd0ff, 0xffe14a, 0x7dff9a, 0xb06aff, 0xff8a3a];
const ANGOLO = { su: 0, dx: 90, giu: 180, sx: -90 };
const NOMI = { drink: 'DRINK ROVESCIATO', mamma: 'CHIAMATA DELLA MAMMA', shottino: 'SHOTTINO', dj: 'RICHIESTA AL DJ', buttafuori: 'BUTTAFUORI' };
const SLOT = { x: 40, y: 246 };               // l'oggetto che hai in mano (clic per usarlo)
const BOTTONE = { x: 440, y: 234, r: 24 };    // sul telefono: il pulsante SABOTAGGIO
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const limita = Phaser.Math.Clamp;

export class ScapoliScene extends MicrogiocoBase {
  constructor() { super('scapoli'); }

  prepara() {
    const c = this.cfg;
    im(this, 0, 0, 'bgPista').setOrigin(0);     // (non 'bgDisco': quello è lo sfondo di Petri Tentacolari)
    this.mattonelle = this.add.graphics().setDepth(1);
    // fari colorati che girano sulla pista, palla stroboscopica, DJ
    [0, 1, 2].forEach((i) => {
      const l = this.add.ellipse(C.x, C.y, 78, 48, COLORI[i * 2], 0.15).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: l, x: { from: P.x0 + 24 + i * 70, to: P.x0 + LARGA - 30 - i * 80 }, y: { from: P.y0 + 20 + i * 44, to: P.y0 + ALTA - 20 - i * 40 }, duration: 1700 + i * 520, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
    const palla = im(this, DISCO.palla.x, DISCO.palla.y, 'pallaDisco').setDepth(20);
    this.tweens.add({ targets: palla, angle: 360, duration: 4000, repeat: -1 });
    this.dj = im(this, DISCO.console.x, DISCO.console.y - 6, 'dj').setDepth(19);
    this.aura = this.add.graphics().setDepth(4);

    this.mie = 0;             // ragazze conquistate da me...
    this.sue = 0;             // ...e dal Manna
    this.sabUsati = 0;
    this.ragazze = [];
    this.tipi = Phaser.Utils.Array.Shuffle([0, 1, 2, 3, 4]);
    this.arrivi = 0;
    this.tArrivo = 1.5;
    this.sfida = null;        // la sfida in corso: { r, uscite, f (il bersaglio), tPausa, ultima }
    this.tAggancio = 0;       // da quanto sto fermo vicino a una ragazza
    this.tPausaSfida = 0;
    this.oggetto = null;      // l'oggetto in pista
    this.inMano = null;       // ...e quello che ho raccolto
    this.tOggetto = 3.5;
    this.ultimoOggetto = '';
    this.sab = null;          // il sabotaggio in corso: { tipo, t, durata }
    this.tScatena = 0;
    this.scatenato = false;
    this.meta = null;         // dove sto andando (clic o dito)
    this.dito = null;
    this.fermo = true;
    this.tBeat = 0;
    this.beat = 0;
    this.fase = 0;            // a che punto del battito siamo (0..1)
    this.tFrase = 4;
    this.tLuccica = 1.2;
    this.tAvviso = 0;
    this.tEsprIo = 0;
    this.hud = '';
    this.fum = null;

    this.io = Object.assign(this.personaggio(`${this.giocatore.id}_normale`, 150, 204), { key: '' });
    this.manna = Object.assign(this.personaggio('manna_balla1', C.x, C.y), { bx: C.x, by: C.y, tGiro: 3, meta: null, fuori: false, tFesta: 0, key: 'manna_balla1' });
    this.butta = this.personaggio('buttafuori', B.x, B.y);
    this.butta.img.setDepth(100 + B.y);
    for (let i = 0; i < c.inizio; i++) this.arriva(true);
    this.accendi();

    // contatore, e l'oggetto in mano: icona in basso a sinistra (clic per usarlo) oppure,
    // sul telefono, pulsante SABOTAGGIO in basso a destra
    this.contatore = txt(this, 240, 22, '', { size: 12, depth: 1001, thick: 3 });
    this.hudDisco = [pannello(this, 240, 22, 196, 18, { depth: 1000 }), this.contatore];
    if (eTouch()) {
      const g = this.add.graphics().setDepth(1000);
      g.fillStyle(0x1f1430, 0.85).fillCircle(BOTTONE.x, BOTTONE.y, BOTTONE.r + 1.5);
      g.fillStyle(0x9b3fd6, 1).fillCircle(BOTTONE.x, BOTTONE.y, BOTTONE.r);
      g.lineStyle(1.5, 0xffe14a, 1).strokeCircle(BOTTONE.x, BOTTONE.y, BOTTONE.r);
      this.iconaMano = im(this, BOTTONE.x, BOTTONE.y - 5, 'sab_drink', 1.25).setDepth(1001).setVisible(false);
      this.hudDisco.push(g, this.iconaMano, txt(this, BOTTONE.x, BOTTONE.y + 13, 'SABOTAGGIO', { size: 5, depth: 1001 }));
    } else {
      this.iconaMano = im(this, SLOT.x - 20, SLOT.y, 'sab_drink', 1.1).setDepth(1001).setVisible(false);
      this.testoSlot = txt(this, SLOT.x + 11, SLOT.y + 5, '', { size: 5, depth: 1001 });
      this.hudDisco.push(pannello(this, SLOT.x, SLOT.y, 68, 28, { depth: 1000 }), this.iconaMano, this.testoSlot,
        txt(this, SLOT.x + 11, SLOT.y - 6, 'SABOTAGGIO', { size: 4.6, depth: 1001, color: '#ffe14a' }),
        txt(this, 80, 263, 'FRECCE: muoviti, e premi quella che compare    SPAZIO: sabotaggio', { ox: 0, size: 5.5, depth: 1001 }));
    }
    this.aggiornaSlot();

    // --- comandi ---
    this.tasti = this.input.keyboard.addKeys({ su: 'UP', giu: 'DOWN', sx: 'LEFT', dx: 'RIGHT', w: 'W', a: 'A', s: 'S', d: 'D' });
    for (const [k, dir] of [['UP', 'su'], ['W', 'su'], ['DOWN', 'giu'], ['S', 'giu'], ['LEFT', 'sx'], ['A', 'sx'], ['RIGHT', 'dx'], ['D', 'dx']]) {
      this.input.keyboard.on('keydown-' + k, (e) => { if (!e.repeat) this.freccia(dir); });
    }
    this.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) this.usa(); });
    multiTouch(this);
    this.input.on('pointerdown', (p) => {
      if (!this.inCorso) return;
      const w = puntatore(this, p);
      if (eTouch() ? dist(w, BOTTONE) < BOTTONE.r + 6 : Math.abs(w.x - SLOT.x) < 36 && Math.abs(w.y - SLOT.y) < 16) return this.usa();
      if (this.sfida && this.tocca(w, p.wasTouch)) return;
      this.dito = p.id;
      this.vaiA(w, p.wasTouch);
    });
    this.input.on('pointermove', (p) => { if (p.isDown && this.dito === p.id && !this.sfida) this.vaiA(puntatore(this, p), p.wasTouch); });
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => {
      if (this.dito !== p.id) return;
      this.dito = null;
      if (p.wasTouch) this.meta = null;       // col dito ci si ferma quando lo si alza; col clic si arriva fino al punto
    });
  }

  // dopo una pausa il dito che trascinava non c'è più
  alRientro() { this.dito = null; this.meta = null; }

  personaggio(key, x, y) {
    return { x, y, ombra: this.add.ellipse(x, y - 1, 24, 7, 0x000000, 0.4).setDepth(9), img: im(this, x, y, key, TAGLIA).setOrigin(0.5, 1) };
  }

  // sposta "o" verso un punto a velocità v; ritorna true quando ci è arrivato
  vai(o, x, y, v, dt) {
    const d = Math.hypot(x - o.x, y - o.y), passo = v * dt;
    if (d <= passo) { o.x = x; o.y = y; return true; }
    o.x += ((x - o.x) / d) * passo; o.y += ((y - o.y) / d) * passo;
    return false;
  }

  vaiA(w, colDito) {
    // col dito il personaggio sta un po' sopra il polpastrello, così si vede
    this.meta = { x: limita(w.x, A.x0, A.x1), y: limita(w.y - (colDito ? 12 : 0), A.y0, A.y1) };
  }

  avviso(s) {
    if (this.tAvviso > 0) return;
    this.tAvviso = 1;
    Audio.sfx('tsk');
    scritta(this, this.io.x, this.io.y - 76, s, { size: 7, color: '#ff9a8a', durata: 600, depth: 950 });
  }

  // il Manna dice la sua
  parlaManna(s, ms = 1300) {
    const m = this.manna;
    if (m.fuori) return;
    this.fum?.destroy();
    this.fum = fumetto(this, limita(m.x + 34, 70, 410), Math.max(52, m.y - 72), s, ms, 940);
    this.tFrase = Math.max(this.tFrase, 3.5);
  }

  // --- LE MATTONELLE: cambiano colore a ogni battito ---
  accendi() {
    const g = this.mattonelle, n = this.beat, lento = this.sab?.tipo === 'dj', figura = Math.floor(n / 8) % 3;
    g.clear();
    for (let gy = 0; gy < P.righe; gy++) for (let gx = 0; gx < P.col; gx++) {
      let k;
      if (lento) k = (gx + gy + n) % 3 === 0 ? 0 : -1;                       // il lento: poche luci rosa, piano
      else if (figura === 0) k = (gx + gy + n) % 2 ? (gx + n) % 6 : -1;      // scacchiera
      else if (figura === 1) k = (gx + gy * 2 + n) % 6;                      // onde in diagonale
      else k = (gx * 7 + gy * 13 + n * 5) % 9 < 6 ? (gx * 3 + gy + n) % 6 : -1;   // sparse
      if (k < 0) continue;
      g.fillStyle(lento ? 0xff6b9a : COLORI[k], lento ? 0.3 : 0.4);
      g.fillRoundedRect(P.x0 + gx * P.lato + 1.5, P.y0 + gy * P.alt + 1.5, P.lato - 3, P.alt - 3, 2.5);
    }
  }

  aggiorna(dt, p) {
    const c = this.cfg, b = Audio.battito;
    // il battito, a tempo con la musica: il balletto, e le mattonelle (che cambiano un battito sì e uno no)
    this.tBeat += dt;
    if (this.tBeat >= b) { this.tBeat -= b; this.beat++; if (this.beat % 2 === 0) this.accendi(); colpetto(this, this.dj, 1.06, 0.92); }
    this.fase = this.tBeat / b;
    this.tPausaSfida -= dt; this.tAvviso -= dt;

    this.muovi(dt);
    this.aggiornaManna(dt);
    this.aggiornaRagazze(dt);
    this.aggiornaSfida(dt);
    this.aggiornaOggetti(dt);
    this.disegnaAura();

    // arrivano altre ragazze, una alla volta, un po' più spesso verso la fine
    this.tArrivo -= dt;
    if (this.tArrivo <= 0 && this.ragazze.filter((r) => r.stato === 'gira' || r.stato === 'sfida').length < c.maxRagazze) {
      this.tArrivo = lerp(c.arrivoInizio, c.arrivoFine, p) * (0.85 + Math.random() * 0.3);
      this.arriva(false);
    }
    // parte la sfida se resto fermo vicino a una ragazza libera
    if (!this.sfida && this.tPausaSfida <= 0 && this.fermo) {
      let vicina = null, dMin = c.raggioColpo;
      for (const r of this.ragazze) if (r.stato === 'gira') { const d = dist(r, this.io); if (d < dMin) { dMin = d; vicina = r; } }
      this.tAggancio = vicina ? this.tAggancio + dt : 0;
      if (vicina && this.tAggancio >= c.attesaColpo) this.iniziaSfida(vicina);
    } else this.tAggancio = 0;

    // gli ultimi secondi: il Manna si scatena (se in quel momento è sabotato, appena si riprende)
    if (!this.scatenato && this.tempoRimasto <= c.scatenaA && !this.sab) this.scatena();
    if (this.tScatena > 0) this.tScatena -= dt;

    this.tFrase -= dt;
    if (this.tFrase <= 0 && !this.sab) { this.tFrase = 4.5 + Math.random() * 3; this.parlaManna(caso(c.frasi)); }

    const hud = `${this.mie}|${this.sue}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.contatore.setText(`TU: ${this.mie}  —  MANNA: ${this.sue}`);
      this.contatore.setColor(this.mie > this.sue ? '#7dff9a' : this.mie < this.sue ? '#ff9a8a' : '#ffffff');
    }
  }

  // --- IL GIOCATORE ---
  muovi(dt) {
    const c = this.cfg, io = this.io, t = this.tasti;
    let vx = 0, vy = 0;
    if (!this.sfida) {
      const dx = (t.dx.isDown || t.d.isDown ? 1 : 0) - (t.sx.isDown || t.a.isDown ? 1 : 0);
      const dy = (t.giu.isDown || t.s.isDown ? 1 : 0) - (t.su.isDown || t.w.isDown ? 1 : 0);
      if (dx || dy) {
        const L = Math.hypot(dx, dy);
        vx = (dx / L) * c.velGiocatore; vy = (dy / L) * c.velGiocatore;
        this.meta = null;
      } else if (this.meta) {
        const d = dist(this.meta, io);
        if (d < 1.5) { if (this.dito == null) this.meta = null; }
        else { const v = Math.min(c.velGiocatore, d * 12); vx = ((this.meta.x - io.x) / d) * v; vy = ((this.meta.y - io.y) / d) * v; }
      }
    }
    io.x = limita(io.x + vx * dt, A.x0, A.x1);
    io.y = limita(io.y + vy * dt, A.y0, A.y1);
    this.fermo = Math.hypot(vx, vy) < 10;
    if (Math.abs(vx) > 4) io.img.setFlipX(vx < 0);
    if (this.tEsprIo > 0) this.tEsprIo -= dt;
    const key = `${this.giocatore.id}_${this.tEsprIo > 0 ? 'felice' : 'normale'}`;
    if (key !== io.key) { io.key = key; io.img.setTexture(key); }
    io.img.setPosition(io.x, io.y - Math.abs(Math.sin(this.fase * Math.PI)) * (this.fermo ? 1.2 : 2.6)).setDepth(100 + io.y);
    io.ombra.setPosition(io.x, io.y - 1);
  }

  // --- LE RAGAZZE ---
  // ne entra una: da un lato, oppure (a inizio partita) già in pista, lontano dal Manna
  arriva(subito) {
    const c = this.cfg, tipo = this.tipi[this.arrivi++ % 5];     // a rotazione: così in pista sono sempre diverse
    const lato = Math.random() < 0.5 ? -1 : 1, y = Phaser.Math.Between(P.y0 + 24, P.y0 + ALTA - 4);
    const r = Object.assign(this.personaggio(`tipa${tipo}_normale`, lato < 0 ? A.x0 - 30 : A.x1 + 30, y), {
      tipo, stato: 'gira', cuore: 0, tFermo: 0, eta: 0, sfasa: Math.random(), t: 0, tEspr: 0, tCuore: 0, tCaso: 0, aCaso: 0, coperta: false,
      vel: c.velRagazze * (tipo === 2 ? 0.8 : tipo === 1 ? 1.15 : 1) * (0.9 + Math.random() * 0.2),   // quella col telefono va piano, quella del reggaeton no
      barra: this.add.graphics().setDepth(820),
    });
    if (subito) {
      // la prima è già vicina all'aura (il Manna parte favorito), le altre più in là
      const prima = this.ragazze.length === 0;
      r.x = C.x + (this.ragazze.length % 2 ? -1 : 1) * (prima ? c.auraInizio + 16 : Phaser.Math.Between(96, 126));
      r.y = prima ? C.y + 8 : Phaser.Math.Between(P.y0 + 30, P.y0 + ALTA - 6);
    }
    this.nuovaMeta(r, subito);
    this.ragazze.push(r);
  }

  // Dove va a ballare adesso: un punto a caso della pista. Di solito ci arriva girando alla
  // larga dall'aura del Manna; ogni tanto ("curiosa") ci passa dentro, e lì bisogna fermarla.
  // Le prime (alLargo) all'aura non si avvicinano: si comincia con calma. E c'è un elastico:
  // se sto vincendo ci passano più spesso, se sta vincendo lui meno, così la gara resta aperta.
  nuovaMeta(r, alLargo = false) {
    const c = this.cfg, m = this.manna, R = this.raggioAura + 10;
    const curiosa = !alLargo && Math.random() < limita(c.curiosa + (this.mie - this.sue) * c.elastico, c.curiosaMin, c.curiosaMax);
    for (let prove = 0; prove < 12; prove++) {
      r.bx = Phaser.Math.Between(P.x0 + 12, P.x0 + LARGA - 12);
      r.by = Phaser.Math.Between(P.y0 + 24, P.y0 + ALTA - 2);
      // quanto passa vicino al Manna la strada da dove è adesso fin lì
      const dx = r.bx - r.x, dy = r.by - r.y, t = limita(((m.x - r.x) * dx + (m.y - r.y) * dy) / Math.max(1, dx * dx + dy * dy), 0, 1);
      if (curiosa || Math.hypot(r.x + dx * t - m.x, r.y + dy * t - m.y) > R) break;
    }
  }

  faccia(r, e, sec = 0) {
    r.img.setTexture(`tipa${r.tipo}_${e}`);
    r.tEspr = sec;
  }

  // sono tra lei e il Manna? Allora la copro.
  faMuro(r) {
    const m = this.manna, io = this.io, dx = m.x - r.x, dy = m.y - r.y, L2 = dx * dx + dy * dy;
    if (L2 < 1) return false;
    const t = ((io.x - r.x) * dx + (io.y - r.y) * dy) / L2;
    return t > 0.08 && t < 0.95 && Math.hypot(io.x - (r.x + dx * t), io.y - (r.y + dy * t)) < this.cfg.raggioMuro;
  }

  aggiornaRagazze(dt) {
    const c = this.cfg, m = this.manna, io = this.io, R = this.raggioAura;
    for (const r of this.ragazze) {
      r.eta += dt;
      let vx = 0, vy = 0;
      if (r.stato === 'gira' || r.stato === 'sfida') {
        const d = dist(r, m), dentro = R > 0 && d < R, dIo = dist(r, io);
        if (r.stato === 'gira') {
          if (r.cuore >= c.sogliaSegue && !this.sfida && dIo < 84 && dIo > 22) { vx = ((io.x - r.x) / dIo) * c.velSegue; vy = ((io.y - r.y) / dIo) * c.velSegue; }   // le sto simpatico: mi viene dietro
          else if (!this.sfida && this.fermo && dIo < c.raggioColpo) r.tFermo = Math.max(r.tFermo, 0.2);     // mi sono fermato da lei: mi aspetta
          else if (r.tFermo > 0) r.tFermo -= dt;
          else {
            const db = Math.hypot(r.bx - r.x, r.by - r.y);
            if (db < 4) { r.tFermo = 0.5 + Math.random() * 1.4; this.nuovaMeta(r); }
            else { const v = r.vel * (dentro ? 0.45 : 1); vx = ((r.bx - r.x) / db) * v; vy = ((r.by - r.y) / db) * v; }
          }
        }
        r.coperta = false;
        if (dentro) {
          // la calamita: tira di più da vicino; meno se sto facendo colpo su di lei, molto meno se
          // faccio da muro; a caso se lui è brillo
          let f = c.attrazione * (1 / 3 + (2 / 3) * (1 - d / R)), ax = (m.x - r.x) / Math.max(d, 0.01), ay = (m.y - r.y) / Math.max(d, 0.01);
          r.coperta = this.faMuro(r);
          if (r.coperta) f *= c.muro;
          else if (r.stato === 'sfida') f *= c.auraInSfida;
          const brillo = this.sab?.tipo === 'shottino';
          if (brillo) { r.tCaso -= dt; if (r.tCaso <= 0) { r.tCaso = 0.5; r.aCaso = Math.random() * 6.283; } ax = Math.cos(r.aCaso); ay = Math.sin(r.aCaso); }
          vx += ax * f; vy += ay * f;
          if (d < c.contatto && !brillo) this.presa(r);
        }
        if (r.stato === 'gira' && r.eta > c.pazienza) r.stato = 'esce';      // si è stufata
        r.x = limita(r.x + vx * dt, A.x0 - 34, A.x1 + 34);
        r.y = limita(r.y + vy * dt, A.y0, A.y1);
      } else if (r.stato === 'mia' || r.stato === 'sua') {
        // balla con chi l'ha conquistata, coi cuoricini, poi se ne va contenta
        const chi = r.stato === 'mia' ? io : m, x0 = r.x;
        this.vai(r, chi.x + r.lato * 24, chi.y + 5, 130, dt);
        vx = (r.x - x0) / Math.max(dt, 0.001);
        r.tCuore -= dt;
        if (r.tCuore <= 0) { r.tCuore = 0.28; this.cuoricino(r.x + Phaser.Math.Between(-8, 8), r.y - 62); }
        r.t -= dt;
        if (r.t <= 0) r.stato = 'esce';
      } else {
        const x0 = r.x;
        if (this.vai(r, U.x, U.y - 2, 78, dt)) { this.togli(r); continue; }
        vx = (r.x - x0) / Math.max(dt, 0.001);
      }
      if (Math.abs(vx) > 5) r.img.setFlipX(vx < 0);
      if (r.tEspr > 0) { r.tEspr -= dt; if (r.tEspr <= 0) this.faccia(r, 'normale'); }
      r.img.setPosition(r.x, r.y - Math.abs(Math.sin((this.fase + r.sfasa) * Math.PI)) * (r.tipo === 1 ? 3.4 : 2.2)).setDepth(100 + r.y);
      r.ombra.setPosition(r.x, r.y - 1);
      // il cuore: quanto manca a conquistarla
      const g = r.barra;
      g.clear();
      if (r.stato === 'gira' || r.stato === 'sfida') {
        if (r.cuore > 0.01 || r.stato === 'sfida') {
          const x = r.x - 16, y = r.y - 69;
          g.fillStyle(0x1f1430, 0.9); g.fillRoundedRect(x - 1.5, y - 1.5, 35, 8, 4);
          g.fillStyle(0xff4a7a, 1); g.fillRoundedRect(x, y, Math.max(2.5, 32 * Math.min(1, r.cuore)), 5, 2.5);
          g.fillStyle(0x1f1430, 0.55); for (const k of [1, 2]) g.fillRect(x + (32 * k) / 3 - 0.4, y, 0.8, 5);       // tre tacche: tre frecce
        }
        if (r.coperta) { g.lineStyle(1.5, 0x7dff9a, 0.9); g.strokeCircle(r.x, r.y - 3, 15); }       // la sto coprendo
      }
    }
    this.ragazze = this.ragazze.filter((r) => !r.via);
  }

  togli(r) {
    r.via = true;
    r.img.destroy(); r.ombra.destroy(); r.barra.destroy();
  }

  cuoricino(x, y) {
    const h = im(this, x, y, 'cuore', 0.7).setDepth(930);
    this.tweens.add({ targets: h, y: y - 18, alpha: 0, scale: scalaDi('cuore', 1.1), duration: 650, onComplete: () => h.destroy() });
  }

  // una ragazza ha toccato il Manna: è sua
  presa(r) {
    const c = this.cfg, m = this.manna;
    if (this.sfida?.r === r) this.fineSfida();
    this.sue++;
    Object.assign(r, { stato: 'sua', t: 2.1, lato: this.sue % 2 ? 1 : -1, cuore: 0 });
    this.faccia(r, 'felice');
    Audio.sfx('rubato');
    scritta(this, m.x, m.y - 80, '+1 AL MANNA', { size: 9, color: '#ffd84a', durata: 600, depth: 950 });
    m.tFesta = 1.1;           // si sistema la collanina e indica il pubblico
    this.parlaManna(caso(c.frasiPresa));
  }

  // ...oppure l'ho fatta ridere io
  conquista(r) {
    const c = this.cfg;
    this.fineSfida();
    this.mie++;
    Object.assign(r, { stato: 'mia', t: 2.3, lato: this.mie % 2 ? 1 : -1 });
    this.faccia(r, 'felice');
    this.tEsprIo = 1.2;
    Audio.sfx('conquista');
    vibra(30);
    scritta(this, r.x, r.y - 86, '+1!', { size: 14, color: '#7dff9a', durata: 600, depth: 950 });
    stelle(this, r.x, r.y - 40, 6, 940);
    fumetto(this, limita(r.x + 26, 60, 420), Math.max(54, r.y - 74), caso(c.frasiRisata), 900, 940);
  }

  // --- FARE COLPO ---
  // quanto rende una freccia giusta: piena fuori dall'aura del Manna, ridotta dentro
  resa(r) {
    const c = this.cfg, R = this.raggioAura;
    return (R > 0 && dist(r, this.manna) < R ? c.resaAura : 1) * (this.sab?.tipo === 'dj' ? c.lentoBonus : 1);
  }

  // mi sono fermato vicino a lei: si gira verso di me, e dopo un attimo esce il primo bersaglio
  iniziaSfida(r) {
    r.stato = 'sfida';
    r.img.setFlipX(this.io.x < r.x);
    this.tAggancio = 0;
    this.meta = null; this.dito = null;
    this.sfida = { r, uscite: 0, f: null, tPausa: 0.25, ultima: '' };
    Audio.sfx('muovi');
  }

  // Esce un bersaglio, uno solo e bello grosso: una freccia (sul telefono un cerchio da toccare),
  // con attorno l'anello del tempo che gli resta.
  bersaglio() {
    const c = this.cfg, s = this.sfida, r = s.r, tocco = eTouch();
    const dir = caso(['su', 'giu', 'sx', 'dx'].filter((d) => d !== s.ultima));     // mai due uguali di fila: si capisce che è nuova
    const durata = lerp(c.tempoFrecciaInizio, c.tempoFrecciaFine, this.progresso);
    // sopra la sua testa; se lei è troppo in alto, di fianco (dalla parte dove non ci sono io)
    const alto = r.y < 146, dx = alto ? (this.io.x > r.x ? -42 : 42) : 0, dy = alto ? -40 : -94;
    const img = im(this, r.x + dx, r.y + dy, tocco ? 'cerchioSfida' : 'frecciaSfida', GRANDE).setDepth(902).setAngle(tocco ? 0 : ANGOLO[dir]);
    s.ultima = dir; s.uscite++;
    s.f = { dir, t: durata, durata, img, scala: img.scale, anello: this.add.graphics().setDepth(901), dx, dy, x: img.x, y: img.y, tErrore: 0 };
  }

  aggiornaSfida(dt) {
    const s = this.sfida, c = this.cfg;
    if (!s) return;
    const r = s.r, f = s.f;
    if (!f) {
      // un attimo di respiro tra un bersaglio e l'altro; dopo l'ultimo la sfida finisce
      s.tPausa -= dt;
      if (s.tPausa <= 0) { if (s.uscite >= c.frecce) this.fineSfida(); else this.bersaglio(); }
      return;
    }
    f.t -= dt;
    f.tErrore -= dt;
    const eta = f.durata - f.t, k = limita(f.t / f.durata, 0, 1), trema = f.tErrore > 0 ? Math.sin(eta * 70) * 1.6 : 0;
    // il bersaglio la segue, se l'aura la trascina
    f.x = limita(r.x + f.dx, 24, 456); f.y = Math.max(52, r.y + f.dy);
    f.img.setPosition(f.x + trema, f.y).setScale(f.scala * (1 + 0.4 * Math.max(0, 1 - eta / 0.14)));
    if (f.tErrore > 0) f.img.setTint(0xff7a7a); else f.img.clearTint();
    // il tempo che resta: un anello che si consuma, verde, poi giallo, poi rosso
    const g = f.anello, R = 10 * GRANDE + 3.5;
    g.clear();
    g.lineStyle(5, 0x1f1430, 0.85); g.strokeCircle(f.x, f.y, R);
    g.lineStyle(3, k > 0.5 ? 0x7dff9a : k > 0.25 ? 0xffe14a : 0xff5a5a, 1);
    g.beginPath(); g.arc(f.x, f.y, R, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2, false); g.strokePath();
    if (f.t <= 0) this.sbaglia(true);        // tempo scaduto
  }

  // una freccia della tastiera (WASD compreso): giusta se è quella che si vede
  freccia(dir) {
    const f = this.sfida?.f;
    if (!f || !this.inCorso) return;
    if (dir === f.dir || eTouch()) this.azzecca(); else this.sbaglia(false);
  }

  // Un clic o un tocco durante la sfida: sul bersaglio è un colpo giusto. Lontano da lei vuol
  // dire "lascio perdere, vado lì" (ritorna false e il clic muove il personaggio); vicino a
  // lei ma fuori dal bersaglio non succede niente.
  tocca(w, colDito) {
    const s = this.sfida, f = s.f, r = s.r;
    if (f && Math.hypot(w.x - f.x, w.y - f.y) < (colDito ? 27 : 21)) { this.azzecca(); return true; }
    if (Math.hypot(w.x - r.x, w.y - (r.y - 34)) < 70) return true;
    this.fineSfida();
    return false;
  }

  azzecca() {
    const c = this.cfg, s = this.sfida, r = s.r, f = s.f;
    this.viaBersaglio(0x7dff9a, { scale: f.scala * 1.6 });
    r.cuore += c.cuoreFreccia * this.resa(r);
    Audio.sfx('preso');
    this.cuoricino(f.x, f.y - 8);
    if (r.cuore >= 1) this.conquista(r);
  }

  // un tasto sbagliato toglie poco e la freccia resta lì; se invece scade il tempo, la freccia è persa
  sbaglia(persa) {
    const c = this.cfg, s = this.sfida, r = s.r, f = s.f;
    r.cuore = Math.max(0, r.cuore - (persa ? c.cuoreErrore : c.cuoreSbaglio));
    if (!persa) { f.tErrore = 0.25; Audio.sfx('errore'); return; }
    this.viaBersaglio(0xff5a5a, { y: f.y + 8 });
    this.faccia(r, 'sbadiglio', 0.8);
    Audio.sfx('tsk');
    scritta(this, r.x, r.y - 98, caso(c.frasiNoia), { size: 7, color: '#ff9a8a', durata: 450, depth: 950 });
  }

  // il bersaglio ha finito: sfuma via, e dopo una pausa esce il prossimo
  viaBersaglio(tinta, verso) {
    const s = this.sfida, f = s.f;
    s.f = null;
    s.tPausa = this.cfg.pausaFreccia;
    f.anello.destroy();
    f.img.setTint(tinta).setPosition(f.x, f.y).setScale(f.scala);
    this.tweens.add({ targets: f.img, ...verso, alpha: 0, duration: 230, onComplete: () => f.img.destroy() });
  }

  fineSfida() {
    const s = this.sfida;
    if (!s) return;
    this.sfida = null;
    if (s.f) { s.f.anello.destroy(); s.f.img.destroy(); }
    if (s.r.stato === 'sfida') { s.r.stato = 'gira'; s.r.tFermo = 0.6; }
    this.tPausaSfida = 0.5;
  }

  // --- IL MANNA ---
  // il raggio dell'aura adesso: cresce col tempo, si allarga quando si scatena, si spegne coi sabotaggi
  get raggioAura() {
    const c = this.cfg, s = this.sab;
    if (this.manna.fuori) return 0;
    let R = lerp(c.auraInizio, c.auraFine, this.progresso);
    if (this.tScatena > 0) R *= c.scatenaAura;
    if (s) R *= s.tipo === 'dj' ? c.auraLento : s.tipo === 'shottino' ? 0.8 : 0;
    return R;
  }

  aggiornaManna(dt) {
    const c = this.cfg, m = this.manna, s = this.sab;
    if (s) { s.t -= dt; if (s.t <= 0) this.fineSabotaggio(); }
    if (m.meta) {
      if (this.vai(m, m.meta.x, m.meta.y, m.meta.v, dt)) { const poi = m.meta.poi; m.meta = null; poi?.(); }
    } else if (!this.sab || this.sab.tipo === 'shottino') {
      // balla al centro, e ogni tanto si sposta piano verso la ragazza libera più vicina
      m.tGiro -= dt;
      if (m.tGiro <= 0) {
        m.tGiro = 3.5 + Math.random() * 3;
        let bx = C.x + Phaser.Math.Between(-40, 40), by = C.y + Phaser.Math.Between(-22, 24), dMin = 1e9;
        for (const r of this.ragazze) if (r.stato === 'gira') { const d = dist(r, m); if (d < dMin) { dMin = d; bx = lerp(C.x, r.x, c.mannaInsegue); by = lerp(C.y, r.y, c.mannaInsegue); } }
        m.bx = limita(bx, C.x - 72, C.x + 72); m.by = limita(by, C.y - 36, C.y + 40);
      }
      this.vai(m, m.bx, m.by, c.velManna, dt);
    }
    m.tFesta -= dt;
    // che figura fa
    let key = this.beat % 2 ? 'manna_balla1' : 'manna_balla2';
    if (this.sab) {
      const t = this.sab.durata - this.sab.t;
      key = { drink: t < 0.9 ? 'manna_macchia' : 'manna_macchiaTriste', mamma: 'manna_telefono', shottino: 'manna_felice', dj: t < 0.9 ? 'manna_shock' : 'manna_triste', buttafuori: 'manna_shock' }[this.sab.tipo];
    } else if (m.tFesta > 0) key = 'manna_colpo';
    if (key !== m.key) { m.key = key; m.img.setTexture(key); }
    const brillo = this.sab?.tipo === 'shottino', fermo = this.sab && !brillo;
    m.img.setVisible(!m.fuori).setAngle(brillo ? Math.sin(this.trascorso * 7) * 13 : 0)
      .setPosition(m.x, m.y - (fermo ? 0 : Math.abs(Math.sin(this.fase * Math.PI)) * 2.4)).setDepth(100 + m.y);
    m.ombra.setVisible(!m.fuori).setPosition(m.x, m.y - 1);
    // la collanina luccica
    this.tLuccica -= dt;
    if (this.tLuccica <= 0 && !m.fuori) {
      this.tLuccica = 0.9 + Math.random() * 1.2;
      const l = im(this, m.x + Phaser.Math.Between(-3, 3), m.y - 20, 'stella', 0.2).setDepth(101 + m.y).setTint(0xfff6c0);
      this.tweens.add({ targets: l, scale: scalaDi('stella', 0.9), angle: 120, alpha: 0, duration: 420, onComplete: () => l.destroy() });
    }
  }

  disegnaAura() {
    const g = this.aura, m = this.manna, io = this.io, c = this.cfg, R = this.raggioAura;
    g.clear();
    if (m.fuori) return;
    if (R <= 0) { g.lineStyle(1, 0xffd84a, 0.3); g.strokeEllipse(m.x, m.y, 30, 14); return; }     // afflosciata
    const trema = this.sab?.tipo === 'shottino' ? 0.35 + Math.random() * 0.6 : 1, Rv = R * (1 + Math.sin(this.trascorso * 5) * 0.03);
    g.fillStyle(0xffd84a, 0.14 * trema); g.fillCircle(m.x, m.y, Rv);
    g.fillStyle(0xfff3a0, 0.1 * trema); g.fillCircle(m.x, m.y, Rv * 0.6);
    g.lineStyle(2, 0xffe98a, 0.8 * trema); g.strokeCircle(m.x, m.y, Rv);
    g.fillStyle(0xffffff, 0.85 * trema);
    for (let i = 0; i < 12; i++) { const a = this.trascorso * 0.9 + i * 0.5236; g.fillCircle(m.x + Math.cos(a) * Rv, m.y + Math.sin(a) * Rv, 1.3); }
    // il muro: dietro di me l'aura è spezzata
    const d = dist(io, m);
    if (d > 8 && d < Rv) {
      const a = Math.atan2(io.y - m.y, io.x - m.x), h = Math.min(0.7, Math.atan2(c.raggioMuro + 5, d));
      g.fillStyle(0x120a26, 0.82);
      g.beginPath(); g.arc(m.x, m.y, Rv + 3, a - h, a + h, false); g.arc(m.x, m.y, d, a + h, a - h, true); g.closePath(); g.fillPath();
      g.lineStyle(1.5, 0xffe98a, 0.6);
      for (const k of [-h, h]) g.lineBetween(m.x + Math.cos(a + k) * d, m.y + Math.sin(a + k) * d, m.x + Math.cos(a + k) * (Rv + 3), m.y + Math.sin(a + k) * (Rv + 3));
    }
  }

  // gli ultimi secondi: la sua mossa migliore, e l'aura si allarga
  scatena() {
    const c = this.cfg, m = this.manna, sc = m.img.scaleX;
    this.scatenato = true;
    this.tScatena = c.scatenaDurata;
    Audio.sfx('scatena');
    scuoti(this, 300, 0.01);
    vibra(80);
    scritta(this, 240, 124, 'IL MANNA SI SCATENA!', { size: 26, color: '#ffd84a', durata: 1300, depth: 960 });
    this.tweens.add({ targets: m.img, scaleX: -sc, duration: 130, yoyo: true, repeat: 3, onComplete: () => m.img.setScale(sc, Math.abs(m.img.scaleY)) });   // la piroetta
    stelle(this, m.x, m.y - 30, 12, 940);
    this.parlaManna('Adesso si balla!', 1500);
  }

  // --- I SABOTAGGI ---
  aggiornaOggetti(dt) {
    const c = this.cfg, io = this.io;
    this.tOggetto -= dt;
    if (this.tOggetto <= 0 && !this.oggetto) {
      this.tOggetto = Phaser.Math.FloatBetween(c.sabotaggioMin, c.sabotaggioMax);
      const tipo = caso(SABOTAGGI.filter((t) => t !== this.ultimoOggetto));
      this.ultimoOggetto = tipo;
      // in pista (non addosso al Manna) oppure davanti al bancone
      let x, y, prove = 0;
      do {
        if (Math.random() < 0.3) { x = A.x0 + 6; y = Phaser.Math.Between(100, 224); }
        else { x = Phaser.Math.Between(P.x0 + 12, P.x0 + LARGA - 12); y = Phaser.Math.Between(P.y0 + 16, P.y0 + ALTA - 6); }
      } while (++prove < 20 && Math.hypot(x - this.manna.x, y - this.manna.y) < 46);
      const alone = this.add.ellipse(x, y - 2, 26, 14, 0xffe14a, 0.35).setDepth(8);
      const img = im(this, x, y - 12, 'sab_' + tipo, 1.15).setDepth(100 + y);
      this.tweens.add({ targets: img, y: y - 17, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: alone, alpha: 0.12, duration: 420, yoyo: true, repeat: -1 });
      this.oggetto = { tipo, x, y, img, alone };
      Audio.sfx('pof');
    }
    const o = this.oggetto;
    if (o && !this.inMano && dist(o, io) < 16) {
      this.oggetto = null;
      this.tweens.killTweensOf(o.img); this.tweens.killTweensOf(o.alone);
      o.img.destroy(); o.alone.destroy();
      this.inMano = o.tipo;
      this.tOggetto = Math.max(this.tOggetto, 2.5);
      Audio.sfx('preso');
      scritta(this, io.x, io.y - 78, NOMI[o.tipo] + '!', { size: 7, color: '#ffe14a', durata: 700, depth: 950 });
      this.aggiornaSlot();
    }
  }

  aggiornaSlot() {
    this.iconaMano.setVisible(!!this.inMano);
    if (this.inMano) { this.iconaMano.setTexture('sab_' + this.inMano); colpetto(this, this.iconaMano, 1.4, 1.4); }
    this.testoSlot?.setText(this.inMano ? 'SPAZIO' : 'nessuno');
  }

  usa() {
    const c = this.cfg, tipo = this.inMano, m = this.manna;
    if (!this.inCorso) return;
    if (!tipo) return this.avviso('NIENTE IN MANO!');
    if (this.sab) return this.avviso('È GIÀ SISTEMATO: ASPETTA');
    this.inMano = null;
    this.sabUsati++;
    this.aggiornaSlot();
    m.tFesta = 0;
    m.meta = null;
    if (this.tScatena > 0) { this.tScatena = 0; scritta(this, 240, 124, 'SPENTO!', { size: 22, color: '#7dff9a', durata: 700, depth: 960 }); }
    this.sab = { tipo, t: c.durate[tipo], durata: c.durate[tipo] };
    Audio.sfx('spento');
    vibra(40);
    scritta(this, 240, 66, NOMI[tipo] + '!', { size: 12, color: '#ffe14a', durata: 900, depth: 960 });
    // l'oggetto vola da me al bersaglio
    const dove = tipo === 'dj' ? { x: DISCO.console.x, y: DISCO.console.y + 20 } : tipo === 'buttafuori' ? { x: B.x, y: B.y - 16 } : { x: m.x, y: m.y };
    const o = im(this, this.io.x, this.io.y - 30, 'sab_' + tipo, 1).setDepth(945);
    this.tweens.add({ targets: o, x: dove.x, y: dove.y - 30, angle: 360, duration: 260, ease: 'Quad.in', onComplete: () => o.destroy() });
    this.time.delayedCall(320, () => { if (this.inCorso && this.sab?.tipo === tipo) this.parlaManna(caso(c.frasiSabotaggio[tipo]), 1600); });
    if (tipo === 'drink') { fumo(this, m.x, m.y - 30, 5, 940, 0xff8a2e); scuoti(this, 120, 0.006); }
    if (tipo === 'mamma') { Audio.sfx('squillo'); m.meta = { x: U.x, y: U.y - 4, v: 86, poi: () => { if (this.sab?.tipo === 'mamma') m.fuori = true; } }; }
    if (tipo === 'dj') { colpetto(this, this.dj, 1.5, 1.5); scritta(this, 240, 84, 'PARTE UN LENTO...', { size: 8, color: '#ff9ac4', durata: 1100, depth: 960 }); this.accendi(); }
    if (tipo === 'buttafuori') {
      this.butta.img.setTexture('buttafuori_chiede');
      fumetto(this, B.x - 34, B.y - 72, caso(c.frasiButtafuori), 1500, 940);
      m.meta = { x: B.x - 36, y: B.y - 6, v: 92 };
    }
  }

  fineSabotaggio() {
    const m = this.manna, tipo = this.sab.tipo;
    this.sab = null;
    if (tipo === 'mamma') { m.fuori = false; m.x = U.x; m.y = U.y - 4; }
    if (tipo === 'buttafuori') this.butta.img.setTexture('buttafuori');
    if (tipo === 'mamma' || tipo === 'buttafuori') m.meta = { x: m.bx, y: m.by, v: 70 };
    if (tipo === 'dj') this.accendi();
    Audio.sfx('ok');
    scritta(this, limita(m.x, 60, 420), m.y - 84, "L'AURA È TORNATA!", { size: 8, color: '#ffd84a', durata: 650, depth: 950 });
  }

  risultato() {
    const c = this.cfg, vinto = this.mie > this.sue;
    return {
      punteggio: this.mie * c.puntiRagazza + this.sabUsati * c.puntiSabotaggio + (vinto ? c.bonusVittoria : 0),
      vittoria: vinto,
      riepilogo: `Tu ${this.mie}, il Manna ${this.sue}` + (this.sabUsati ? ` - ${quanti(this.sabUsati, 'sabotaggio', 'sabotaggi')}` : '') + (vinto ? ' - battuto!' : ''),
    };
  }

  // Se ho vinto: il Manna resta solo in mezzo alla pista, le luci si spengono, si sistema la
  // collanina e se ne va. Se ho perso: esce circondato di ragazze e mi fa l'occhiolino, e io
  // resto al bancone col bicchiere vuoto.
  finale(ris, fatto) {
    const m = this.manna, id = this.giocatore.id;
    this.fineSfida();
    this.fum?.destroy();
    this.aura.clear();
    for (const o of [...this.hudDisco, this.oggetto?.img, this.oggetto?.alone, m.img, m.ombra, this.io.img, this.io.ombra]) o?.setVisible(false);
    for (const r of this.ragazze) { r.barra.clear(); if (!ris.vittoria) { r.img.setVisible(false); r.ombra.setVisible(false); } }
    Audio.sfx('tempo');
    const buio = this.add.rectangle(0, 0, 480, 270, 0x05020c, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: buio, fillAlpha: ris.vittoria ? 0.86 : 0.6, duration: ris.vittoria ? 900 : 300 });
    const grande = (key, x, y, k) => im(this, x, y, key, k).setOrigin(0.5, 1).setDepth(705);

    if (ris.vittoria) {
      this.add.ellipse(C.x, C.y + 34, 130, 150, 0xfff3c0, 0.2).setDepth(701).setBlendMode(Phaser.BlendModes.ADD);    // l'ultimo faro acceso
      const solo = grande('manna_collana', m.x, m.y, TAGLIA);
      this.tweens.add({ targets: solo, x: C.x, y: C.y + 64, scale: scalaDi('manna_collana', 1), duration: 420, ease: 'Quad.out' });
      const io = grande(`${id}_felice`, 92, 262, 0.95);
      this.tweens.add({ targets: io, y: 248, duration: 240, yoyo: true, repeat: -1, ease: 'Quad.out' });
      this.time.addEvent({ delay: 320, repeat: 9, callback: () => this.cuoricino(92 + Phaser.Math.Between(-30, 30), 150 + Phaser.Math.Between(-10, 20)) });
      this.time.delayedCall(800, () => {
        Audio.sfx('vittoria');
        txt(this, 240, 26, 'IL MANNA TORNA A CASA DA SOLO!', { size: 14, color: '#7dff9a', depth: 710 });
        const l = im(this, C.x - 2, C.y + 16, 'stella', 0.4).setDepth(706).setTint(0xfff6c0);       // la collanina luccica ancora, almeno quella
        this.tweens.add({ targets: l, scale: scalaDi('stella', 1.5), angle: 180, alpha: 0, duration: 600, repeat: 1 });
      });
      this.time.delayedCall(2000, () => {
        solo.setTexture('manna_triste');
        this.tweens.add({ targets: solo, x: U.x, y: 300, scale: scalaDi('manna_triste', 0.7), duration: 1500, ease: 'Sine.in' });
      });
    } else {
      // lui, verso l'uscita, con le ragazze attorno
      const gruppo = [];
      [[-82, -2, 3], [80, 0, 0], [-46, 8, 4], [46, 10, 1]].forEach(([dx, dy, t], i) => {
        const r = grande(`tipa${t}_felice`, C.x + dx, C.y + 60 + dy, 0.74).setDepth(703 + i).setFlipX(dx > 0);
        this.tweens.add({ targets: r, y: r.y - 5, duration: 200 + i * 40, yoyo: true, repeat: -1 });
        gruppo.push(r);
      });
      const lui = grande('manna_occhiolino', C.x, C.y + 68, 0.95).setDepth(708);      // lui davanti a tutte
      gruppo.push(lui);
      this.time.addEvent({ delay: 260, repeat: 12, callback: () => this.cuoricino(lui.x + Phaser.Math.Between(-60, 60), lui.y - 90 + Phaser.Math.Between(-10, 20)) });
      // io, al bancone, col bicchiere vuoto
      this.add.ellipse(72, 228, 90, 70, 0xbfd8ff, 0.12).setDepth(701).setBlendMode(Phaser.BlendModes.ADD);
      grande(`${id}_triste`, 78, 256, 0.85).setDepth(703);
      im(this, 44, 206, 'bicchiereVuoto', 1.3).setDepth(704).setAngle(-12);
      this.time.delayedCall(800, () => {
        Audio.sfx('sconfitta');
        txt(this, 240, 26, 'TUTTE CON IL MANNA...', { size: 14, color: '#ff6b5a', depth: 710 });
        fumetto(this, C.x + 62, C.y - 36, ';)', 2300, 712);
      });
      this.time.delayedCall(1900, () => this.tweens.add({ targets: gruppo, x: `+=${U.x - C.x}`, y: '+=70', duration: 1700, ease: 'Sine.in' }));
    }
    this.time.delayedCall(3800, fatto);
  }
}
