// Microgioco 11: "Spalma il Bota!" - il Bota prende il sole e il sole lo cuoce. SPALMA!
//
//  IL DESIGN (rifatto da zero dopo la scheda di valutazione di Giorgio: "difficoltà impossibile,
//  gioco incomprensibile: non hai mai la crema, l'ombrello non serve a nulla"). Un verbo e un gesto
//  solo: STROFINA LA CREMA SULLE SCOTTATURE.
//  - Il Bota è sdraiato sul telo, visto dall'alto. Il sole (in alto a sinistra) gli punta un raggio
//    addosso e lì nasce una SCOTTATURA: un cerchio sulla pelle che si arrossa, con l'anello del
//    tempo che si svuota.
//  - Tieni premuto e strofina (o passa il dito): dove passa la mano resta la crema bianca. Un clic
//    da fermo lascia una noce di crema (così chi prova a cliccare vede subito che funziona), ma
//    strofinare è molto più veloce. Il cerchio coperto (quasi) tutto di crema: SPENTA! Se l'anello
//    finisce prima: SCOTTATO! (quella pelle resta rossa fino alla fine, e la serie si azzera).
//    Da tastiera: FRECCE (o WASD) portano la mano, SPAZIO tenuto e strofina da sola.
//  - La crema non finisce mai e non c'è altro da fare: niente tubetto, ombrellone, gabbiani, onde.
//  - Tre atti: 1) UNA ALLA VOLTA, il Bota sta fermo (si impara); 2) PIÙ SOLE!: due scottature
//    insieme, e il Bota si allunga a prendere il telefono o la birra (le scottature si spostano con
//    lui: seguilo); 3) SI GIRA!: pancia in giù, tre insieme che durano meno, e ogni tanto una
//    GRANDE (vale doppio). Appena una si spegne o si scotta, dopo un attimo ne nasce un'altra:
//    chi è veloce ne spegne di più.
//  - Punti: ogni scottatura spenta 4, +2 se PRESTO (entro metà del suo tempo), x2 se grande, per
//    il moltiplicatore della serie (x1,5 dopo 5 spente di fila, x2 dopo 10); ogni SCOTTATO -3.
//    Obiettivo (è il bronzo): 15 spente. Finché non ci sei il totale si ferma a 90, quando ci sei
//    sale almeno a 100 (come le Perle di Denny). In Lampo (15 s, i tre atti in 5 secondi l'uno)
//    bastano 5 spente e i punti sono quelli.
//  Il seme del round decide dove nascono le scottature (e le mosse del Bota); la logica che conta
//  (scottature, mosse, giro) va avanti tutta in aggiorna(), senza tween: così le prove automatiche
//  possono giocare la partita a passi, sostituendo leggiMano().
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { CORPO, GW, GH, PELLE } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, pannello, scuoti, puntatore, colpetto, lerp, caso, quanti, eTouch, perDito, vibra, puntiHud, numero } from '../fx.js';

const CELLA = CORPO.cella, BW = CORPO.w, BH = CORPO.h;
const CX = 232, CY = 150;            // centro del corpo a riposo (il centro del telo)
const SCALA = 2;                     // unità del corpo -> unità di gioco
const DB = CORPO.densDin;            // densità della texture di crema e scottatura
const SOLE = { x: 44, y: 68 };       // da qui partono i raggi
const GIRO = 0.5;                    // secondi del giro (a metà cambia lato)
const dolce = (k) => k * k * (3 - 2 * k);   // (smoothstep: le mosse del Bota partono e arrivano morbide)

export class BotaScene extends MicrogiocoBase {
  constructor() { super('bota'); }

  get obiettivo() { return this.lampo ? this.cfg.obiettivoLampo : this.cfg.obiettivoSpente; }
  get condizione() { return this.spente >= this.obiettivo; }
  // i punti sulla scala delle medaglie: senza l'obiettivo al massimo tettoPrima, con l'obiettivo
  // almeno il bronzo (in Lampo le medaglie non contano: i punti e basta)
  get punti() {
    const c = this.cfg;
    if (this.lampo) return this.grezzo;
    return this.condizione ? Math.max(c.medaglie.bronzo, this.grezzo) : Math.min(c.tettoPrima, this.grezzo);
  }
  molt() { return this.cfg.serie.reduce((m, [n, k]) => (this.serie >= n ? k : m), 1); }

  prepara() {
    const c = this.cfg;
    this.lampo = Sessione.tipo === 'lampo';
    this.rnd = casuale(Sessione.seme);
    // (in Lampo, 15 secondi, i tre atti stanno più stretti: daLampo)
    this.atti = c.atti.map((a) => ({ ...a, da: this.lampo ? a.daLampo : a.da }));
    im(this, 0, 0, 'bgLido').setOrigin(0);
    for (let i = 0; i < 3; i++) {
      const o = this.add.ellipse(474, 42 + i * 94, 24, 74, 0xffffff, 0.5).setDepth(2);
      this.tweens.add({ targets: o, x: 463, alpha: 0.12, duration: 1500 + i * 280, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // i due lati del Bota: dove c'è pelle, quanta crema, quanto scotta, cosa è bruciato per sempre
    this.lati = {};
    for (const nome of ['fronte', 'retro']) {
      const n = GW * GH, P = PELLE[nome];
      const L = { nome, pelle: P.celle, maschera: P.maschera, crema: new Float32Array(n), calore: new Float32Array(n), bruciata: new Uint8Array(n), dentro: new Uint8Array(n) };
      // dove può nascere una scottatura: sulla pelle, dalle spalle ai piedi (non in testa: lì ci
      // sono occhi, bocca e occhiali, e sul retro i capelli)
      L.centri = [];
      for (let i = 0; i < n; i++) if (P.celle[i] && ((i % GW) + 0.5) * CELLA >= c.daX) L.centri.push(i);
      this.lati[nome] = L;
    }
    this.lato = this.lati.fronte;
    this.atto = -1;
    this.grezzo = 0;
    this.spente = 0; this.scottate = 0; this.presto = 0; this.serie = 0; this.serieMax = 0;
    this.zone = [];               // le scottature accese: { lato, cx, cy (unità del corpo), r, celle, vita, eta, grande }
    this.raggi = [];              // i raggi del sole appena tirati (solo disegno)
    this.tNasce = c.primaScottatura;
    this.primaVolta = true;       // la prima scottatura della partita ha la scritta STROFINA QUI!

    // crema e scottatura si disegnano su una texture sopra il corpo (un pixel per cella, ingrandito)
    if (this.textures.exists('botaStrato')) this.textures.remove('botaStrato');
    this.texStrato = this.textures.createCanvas('botaStrato', BW * DB, BH * DB);
    this.mini = document.createElement('canvas');
    this.mini.width = GW; this.mini.height = GH;
    this.miniDati = this.mini.getContext('2d').createImageData(GW, GH);
    this.sporco = true;
    this.tDisegno = 0;

    this.imgCorpo = im(this, 0, 0, 'botaFronte');
    this.imgTesta = im(this, -61, 0, 'botaTesta_normale');
    this.imgStrato = this.add.image(0, 0, 'botaStrato').setScale(1 / DB);
    this.corpo = this.add.container(CX, CY, [this.imgCorpo, this.imgTesta, this.imgStrato]).setScale(SCALA).setDepth(50);
    this.zoneG = this.add.graphics().setDepth(55);    // gli anelli delle scottature, sopra al corpo
    this.raggiG = this.add.graphics().setDepth(57);   // i raggi del sole
    // le mosse del Bota (secondo e terzo atto) e il giro (terzo): li muove aggiorna, non i tween
    this.mossa = null; this.tMossa = c.primaMossa;
    this.giro = null; this.girato = false;
    this.espr = 'normale'; this.tEspr = 0;
    this.tFrase = 2.4; this.tSuono = 0; this.fum = null; this.hud = '';

    // la mano (il cursore del mouse è nascosto: si vede la mano). Mouse: tieni premuto e strofina;
    // dito: passalo sul Bota; tastiera: FRECCE (o WASD) muovono la mano, SPAZIO spalma
    this.mano = im(this, CX, 236, 'manoCrema', 0.8).setOrigin(0.5, 0.62).setDepth(600);
    this.input.setDefaultCursor('none');
    this.modo = eTouch() ? 'dito' : 'mouse';
    this.dito = null;
    this.pos = { x: CX, y: 236 };     // dove sta la mano (unità di gioco)
    this.prec = null;                 // dov'era la mano al fotogramma prima, se spalmava
    this.premutoPrima = false;
    this.visto = false;               // il mouse non si è ancora mosso sul gioco: la mano resta giù in mezzo
    this.input.on('pointerdown', (p) => {
      this.visto = true;
      if (!this.inCorso) return;
      if (p.wasTouch) { if (!this.dito) { this.dito = p; this.modo = 'dito'; } }
      else this.modo = 'mouse';
    });
    // tutta la strada della mano tra un fotogramma e l'altro, non solo dove arriva: chi strofina
    // veloce (o su un telefono lento) fa più di un avanti e indietro in un fotogramma solo
    this.traccia = [];
    this.input.on('pointermove', (p) => {
      this.visto = true;
      if (!p.wasTouch && this.modo === 'tasti') this.modo = 'mouse';
      if (!this.inCorso || this.traccia.length >= 64) return;
      if (p.wasTouch ? this.dito?.id === p.id : this.modo === 'mouse' && p.isDown) this.traccia.push(puntatore(this, p));
    });
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => { if (this.dito?.id === p.id) this.dito = null; });
    this.tasti = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE');
    this.input.keyboard.on('keydown', (e) => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space'].includes(e.code)) this.modo = 'tasti'; });

    // il sole, sempre più cattivo: è lui che tira i raggi
    this.livSole = 0;
    this.sole = im(this, SOLE.x, SOLE.y, 'sole_0').setDepth(30);
    this.tweens.add({ targets: this.sole, angle: { from: -7, to: 7 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // in alto: i punti e quante ne hai spente (verso l'obiettivo); sotto, la serie
    this.testoPunti = txt(this, 186, 22, '', { size: 9, depth: 1001, color: '#7dff9a' });
    this.testoSpente = txt(this, 296, 22, '', { size: 9, depth: 1001 });
    this.testoSerie = txt(this, 240, 37, '', { depth: 1001, size: 7, color: '#ffe14a' });
    this.aiuto = txt(this, 6, 262, '', { ox: 0, size: 7, depth: 1001 });
    this.hudBota = [pannello(this, 240, 22, 220, 18, { depth: 1000 }), this.testoPunti, this.testoSpente, this.testoSerie, this.aiuto, this.sole];
  }

  pulisci() { this.input.setDefaultCursor('default'); }

  // dopo una pausa il dito che spalmava non c'è più
  alRientro() { this.dito = null; this.prec = null; this.premutoPrima = false; this.traccia = []; }

  // dal punto sullo schermo alle coordinate del corpo (che trasla, ruota e si schiaccia), e ritorno
  aLocale(wx, wy) {
    const t = this.corpo, dx = wx - t.x, dy = wy - t.y, cs = Math.cos(-t.rotation), sn = Math.sin(-t.rotation);
    return { x: (dx * cs - dy * sn) / t.scaleX + BW / 2, y: (dx * sn + dy * cs) / t.scaleY + BH / 2 };
  }
  aMondo(lx, ly) {
    const t = this.corpo, x = (lx - BW / 2) * t.scaleX, y = (ly - BH / 2) * t.scaleY, cs = Math.cos(t.rotation), sn = Math.sin(t.rotation);
    return { x: t.x + x * cs - y * sn, y: t.y + x * sn + y * cs };
  }

  // applica fn(indice) alle celle il cui centro è entro il raggio dal punto (unità del corpo)
  perCelle(x, y, r, fn) {
    const gx0 = Math.floor(x / CELLA), gy0 = Math.floor(y / CELLA), gr = Math.ceil(r / CELLA);
    for (let gy = gy0 - gr; gy <= gy0 + gr; gy++) for (let gx = gx0 - gr; gx <= gx0 + gr; gx++) {
      if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
      if (((gx + 0.5) * CELLA - x) ** 2 + ((gy + 0.5) * CELLA - y) ** 2 <= r * r) fn(gy * GW + gx);
    }
  }

  espressione(e, sec = 0) {
    if (this.lato.nome !== 'fronte') return;   // (pancia in giù la faccia non si vede)
    this.espr = e;
    this.imgTesta.setTexture('botaTesta_' + e);
    this.tEspr = sec;
  }

  parla(s, ms = 1300) {
    this.fum?.destroy();
    this.fum = fumetto(this, Phaser.Math.Clamp(this.corpo.x - 104, 66, 300), this.corpo.y - 58, s, ms, 900);
    this.tFrase = Math.max(this.tFrase, 3);
    if (this.espr === 'normale') this.espressione('parla', 0.8);
  }

  // cambio d'atto: annuncio, aiuto in basso, e (nel terzo) il giro
  nuovoAtto(n) {
    const A = this.atti[n];
    this.atto = n;
    this.aiuto.setText(perDito(A.aiuto, A.aiutoDito));
    if (A.nome) {
      Audio.sfx(n === 2 ? 'scatena' : 'bonus');
      scritta(this, 240, 74, A.nome, { size: 15, color: n === 2 ? '#ff6b5a' : '#ffe14a', durata: 900, depth: 970 });
    }
    if (A.gira && !this.girato) this.gira();
    else if (n === 0) this.parla(caso(this.cfg.frasiInizio), 1500);
  }

  // dove sta la mano e se spalma. (Le prove automatiche sostituiscono questo metodo: deve solo
  // restituire { x, y, premuto } in unità di gioco)
  leggiMano(dt) {
    const c = this.cfg, K = this.tasti;
    if (this.modo === 'tasti') {
      const dx = (K.RIGHT.isDown || K.D.isDown ? 1 : 0) - (K.LEFT.isDown || K.A.isDown ? 1 : 0);
      const dy = (K.DOWN.isDown || K.S.isDown ? 1 : 0) - (K.UP.isDown || K.W.isDown ? 1 : 0);
      const k = dx && dy ? Math.SQRT1_2 : 1;
      this.pos.x = Phaser.Math.Clamp(this.pos.x + dx * k * c.velTasti * dt, 10, 470);
      this.pos.y = Phaser.Math.Clamp(this.pos.y + dy * k * c.velTasti * dt, 44, 260);
      // da tastiera, con SPAZIO la mano strofina da sola (piccoli giri): basta portarla sul cerchio
      const premuto = K.SPACE.isDown, a = this.trascorso * c.giriTasti;
      return premuto ? { x: this.pos.x + Math.cos(a) * c.raggioGiri, y: this.pos.y + Math.sin(a) * c.raggioGiri, premuto } : { x: this.pos.x, y: this.pos.y, premuto };
    }
    if (this.modo === 'dito') {
      if (this.dito) { const w = puntatore(this, this.dito); this.pos = { x: w.x, y: w.y }; }
      return { x: this.pos.x, y: this.pos.y, premuto: !!this.dito };
    }
    if (!this.visto) return { x: this.pos.x, y: this.pos.y, premuto: false };
    const w = puntatore(this);
    this.pos = { x: w.x, y: w.y };
    return { x: w.x, y: w.y, premuto: this.input.activePointer.isDown };
  }

  aggiorna(dt, p) {
    const c = this.cfg, t = this.trascorso;
    const atto = this.atti.reduce((k, a, i) => (t >= a.da ? i : k), 0);
    if (atto !== this.atto) this.nuovoAtto(atto);
    const A = this.atti[this.atto];
    this.muoviBota(dt, A);
    if (this.tEspr > 0) { this.tEspr -= dt; if (this.tEspr <= 0) this.espressione('normale'); }

    // --- la mano: dove passa, tenendo premuto, lascia la crema ---
    const m = this.leggiMano(dt);
    const lavora = m.premuto && !this.giro;
    this.mano.setPosition(m.x, m.y).setAngle(lavora ? Math.sin(t * 18) * 6 : 0).setAlpha(this.modo === 'dito' && !m.premuto ? 0.45 : 1);
    if (lavora) {
      // (appena premuto la strada parte dal primo punto della traccia, non da dove arriva)
      const fatto = this.spalma([...(this.prec ? [this.prec] : []), ...this.traccia, m], !this.premutoPrima, dt);
      this.tSuono -= dt;
      if (fatto && this.tSuono <= 0) { this.tSuono = 0.11; Audio.sfx('pennello'); }
      this.prec = { x: m.x, y: m.y };
    } else this.prec = null;
    this.traccia = [];
    this.premutoPrima = m.premuto;

    this.scottature(dt, A);

    // fuori dalle scottature accese la crema si scioglie piano (così sul corpo si vede sempre dove
    // serve); dentro resta, così quello che hai già spalmato su un cerchio non lo perdi
    const L = this.lato, via = c.sciogli * dt;
    for (let i = 0; i < L.crema.length; i++) if (L.crema[i] > 0 && !L.dentro[i]) { L.crema[i] = Math.max(0, L.crema[i] - via); this.sporco = true; }

    // --- il sole si incattivisce: un livello per atto, e furibondo negli ultimi 5 secondi ---
    const liv = this.tempoRimasto <= 5 ? 3 : Math.min(2, this.atto);
    if (liv !== this.livSole) { this.livSole = liv; this.sole.setTexture('sole_' + liv); colpetto(this, this.sole, 1.4, 1.4); }

    this.tFrase -= dt;
    if (this.tFrase <= 0) { this.tFrase = 6 + this.rnd() * 3; this.parla(caso(c.frasi)); }

    // contatori (si riscrivono solo quando cambiano)
    const mk = this.molt(), hud = `${Math.round(this.punti)}|${this.spente}|${this.serie}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(this.punti));
      this.testoSpente.setText(`SPENTE: ${this.spente}/${this.obiettivo}`).setColor(this.condizione ? '#7dff9a' : '#ffffff');
      this.testoSerie.setText(this.serie >= 2 ? `SERIE: ${this.serie}${mk > 1 ? `  x${numero(mk, 1)}` : ''}` : '');
    }
    this.tDisegno -= dt;
    if (this.sporco && this.tDisegno <= 0) { this.tDisegno = 1 / 30; this.ridisegna(); }
  }

  // la mano ha fatto questa strada (punti in unità di gioco): crema sulle celle sotto la mano lungo
  // la strada, tanta quanta strada ha fatto (strofinare è quello che spalma; il primo tocco lascia
  // una noce di crema). La strada si misura sulla mano, non sul Bota: se si sposta lui, non conta
  spalma(strada, tocco, dt) {
    const c = this.cfg, L = this.lato, loc = strada.map((w) => this.aLocale(w.x, w.y));
    let tot = 0;
    for (let k = 1; k < loc.length; k++) tot += Math.hypot(loc[k].x - loc[k - 1].x, loc[k].y - loc[k - 1].y);
    // (chi strofina più veloce di velMax non spalma di più: e a pochi fotogrammi al secondo un salto
    // lungo non vale come cento passate)
    const per = tot > 0 ? (Math.min(tot, c.velMax * dt) / tot) * c.cremaPerUnita : 0;
    let fatto = 0;
    const metti = (x, y, q) => this.perCelle(x, y, c.raggioMano, (i) => {
      if (!L.pelle[i] || L.bruciata[i]) return;
      if (L.dentro[i] && L.crema[i] < 1) fatto++;
      L.crema[i] = Math.min(c.cremaMax, L.crema[i] + q);
    });
    for (let k = 1; k < loc.length; k++) {
      const a = loc[k - 1], b = loc[k], d = Math.hypot(b.x - a.x, b.y - a.y), passi = Math.ceil(d / 2);
      for (let s = 1; s <= passi; s++) metti(lerp(a.x, b.x, s / passi), lerp(a.y, b.y, s / passi), (d / passi) * per);
    }
    const fine = loc[loc.length - 1];
    if (tocco) metti(fine.x, fine.y, c.noce);
    this.sporco = true;
    return fatto;
  }

  // --- LE SCOTTATURE ---
  scottature(dt, A) {
    const c = this.cfg, L = this.lato;
    // ne nasce una nuova quando ce ne sono meno di quante ne vuole l'atto (dopo una pausa, e non
    // mentre si gira)
    if (!this.giro) {
      if (this.zone.length < A.attivi) this.tNasce -= dt;
      if (this.tNasce <= 0 && this.zone.length < A.attivi) { this.tNasce = A.pausa; this.nasce(A); }
    }
    L.dentro.fill(0);
    for (const z of this.zone) {
      z.eta += dt;
      // quanta pelle del cerchio è coperta (quella già bruciata da prima non conta)
      let ok = 0;
      for (const i of z.celle) { L.dentro[i] = 1; if (L.crema[i] >= 1) ok++; }
      z.coperta = ok / z.celle.length;
      if (z.coperta >= c.coperta) this.spenta(z);
      else if (z.eta >= z.vita) this.scottato(z);
      else { const h = Math.min(1, z.eta / z.vita); for (const i of z.celle) L.calore[i] = h; }
    }
    this.zone = this.zone.filter((z) => !z.finita);
    if (this.zone.length) this.sporco = true;
    this.disegnaZone(dt);
  }

  // il sole tira un raggio: una scottatura nuova in un posto libero (lontano dalle altre e da dove
  // è già bruciato), su un pezzo di pelle abbastanza grande
  nasce(A) {
    const c = this.cfg, L = this.lato, grande = this.rnd() < (A.grandi ?? 0), r = grande ? c.raggioGrande : c.raggio;
    for (let prova = 0; prova < 30; prova++) {
      const k = L.centri[Math.floor(this.rnd() * L.centri.length)];
      const cx = ((k % GW) + 0.5) * CELLA, cy = (Math.floor(k / GW) + 0.5) * CELLA;
      if (this.zone.some((z) => Math.hypot(z.cx - cx, z.cy - cy) < z.r + r + 6)) continue;
      const celle = [];
      let bruciate = 0;
      this.perCelle(cx, cy, r, (i) => { if (!L.pelle[i]) return; if (L.bruciata[i]) bruciate++; else celle.push(i); });
      if (celle.length < (grande ? c.minCelleGrande : c.minCelle) || bruciate > celle.length * 0.3) continue;
      // il raggio scioglie la crema che c'era: il cerchio parte da pelle nuda
      for (const i of celle) { L.crema[i] = 0; L.calore[i] = 0; }
      const z = { lato: L, cx, cy, r, celle, vita: A.vita * (grande ? c.vitaGrande : 1), eta: 0, grande, coperta: 0 };
      this.zone.push(z);
      this.raggi.push({ z, t: 0 });
      Audio.sfx('fiuu');
      if (this.primaVolta) {
        // la prima della partita: la scritta che dice cosa fare, finché non la spegni
        this.primaVolta = false;
        z.etichetta = txt(this, 0, 0, 'STROFINA QUI!', { size: 9, color: '#ffe14a', depth: 980 });
      }
      return;
    }
  }

  spenta(z) {
    const c = this.cfg, L = z.lato, presto = z.eta < z.vita * c.presto;
    z.finita = true;
    this.serie++; this.serieMax = Math.max(this.serieMax, this.serie);
    this.spente++;
    if (presto) this.presto++;
    const valore = (c.punti.spenta + (presto ? c.punti.presto : 0)) * (z.grande ? c.punti.grande : 1) * this.molt();
    this.grezzo += valore;
    // la pelle guarisce: niente più rosso, la crema resta lucida (poi si scioglie)
    for (const i of z.celle) { L.calore[i] = 0; L.crema[i] = c.cremaMax; }
    this.sporco = true;
    z.etichetta?.destroy();
    Audio.sfx('ok');
    const m = this.aMondo(z.cx, z.cy);
    stelle(this, m.x, m.y, z.grande ? 8 : 5, 610);
    scritta(this, m.x, m.y - 22, `${presto ? 'PRESTO! ' : 'SPENTA! '}+${numero(valore, valore % 1 ? 1 : 0)}`, { size: presto ? 9 : 8, color: '#7dff9a', durata: 400, depth: 615 });
    if (this.spente === this.obiettivo) { scritta(this, 240, 96, `${this.obiettivo} SPENTE!`, { size: 13, color: '#7dff9a', durata: 900, depth: 970 }); Audio.sfx('bonus'); }
    else if (c.serie.some(([n]) => n === this.serie)) { scritta(this, 240, 52, `SERIE x${numero(this.molt(), 1)}!`, { size: 11, color: '#ffe14a', durata: 600, depth: 970 }); colpetto(this, this.testoSerie, 1.5, 1.5); }
    if (this.spente % 5 === 0 && this.tFrase < 4) this.parla(caso(c.frasiBravo));
  }

  // finito il tempo del cerchio: la pelle rimasta scoperta si brucia (e resta rossa)
  scottato(z) {
    const c = this.cfg, L = z.lato;
    z.finita = true;
    this.scottate++;
    this.serie = 0;
    this.grezzo = Math.max(0, this.grezzo - c.punti.scottata);
    for (const i of z.celle) { L.calore[i] = 0; if (L.crema[i] < 1) L.bruciata[i] = 1; }
    this.sporco = true;
    z.etichetta?.destroy();
    Audio.sfx('sfrigola'); Audio.sfx('ahia');
    vibra(50);
    scuoti(this, 160, 0.006);
    const m = this.aMondo(z.cx, z.cy);
    fumo(this, m.x, m.y, 5, 610);
    scritta(this, m.x, m.y - 22, 'SCOTTATO!', { size: 10, color: '#ff6b5a', durata: 500, depth: 615 });
    colpetto(this, this.sole, 1.5, 1.5);
    this.espressione('urlo', 0.9);
    if (this.tFrase < 4.5) this.parla(caso(c.frasiBrucia), 1100);
  }

  // gli anelli delle scottature (seguono il Bota): l'anello colorato di fuori è il tempo che resta
  // (giallo, arancio, rosso, e quando sta per scottarsi lampeggia), quello di dentro quanta crema c'è
  // già; le grandi hanno un anello giallo in più. E i raggi del sole che le hanno appena accese
  disegnaZone(dt) {
    const g = this.zoneG, t = this.trascorso;
    g.clear();
    for (const z of this.zone) {
      if (z.lato !== this.lato) continue;
      const m = this.aMondo(z.cx, z.cy), resta = Math.max(0, 1 - z.eta / z.vita);
      const R = z.r * SCALA * Math.min(1, 0.4 + z.eta / this.cfg.compare * 0.6), urgente = resta < 0.3, lampo = urgente && Math.floor(t * 8) % 2;
      const col = resta > 0.6 ? 0xffd84a : resta > 0.3 ? 0xff9a2e : 0xff3b20;
      g.lineStyle(1.2, 0x1f1430, 0.55).strokeCircle(m.x, m.y, R + 4.5);
      // l'anello di dentro diventa verde man mano che il cerchio si copre di crema
      const k = Math.min(1, z.coperta / this.cfg.coperta), dentro = (Math.round(255 - 130 * k) << 16) | (255 << 8) | Math.round(255 - 101 * k);
      g.lineStyle(1.4 + k * 1.2, dentro, lampo ? 1 : 0.85).strokeCircle(m.x, m.y, R);
      if (resta > 0) { g.lineStyle(3.2, lampo ? 0xffffff : col, 1); g.beginPath(); g.arc(m.x, m.y, R + 4.5, -Math.PI / 2, -Math.PI / 2 + resta * Math.PI * 2, false); g.strokePath(); }
      if (z.grande) g.lineStyle(1, 0xffe14a, 0.7).strokeCircle(m.x, m.y, R + 8);
      z.etichetta?.setPosition(m.x, m.y - R - 13 + Math.sin(t * 8) * 2);
    }
    const r = this.raggiG;
    r.clear();
    for (const ra of this.raggi) {
      ra.t += dt;
      if (ra.z.finita || ra.t > 0.45) continue;
      const m = this.aMondo(ra.z.cx, ra.z.cy), a = 1 - ra.t / 0.45;
      r.lineStyle(7, 0xffd84a, 0.35 * a).lineBetween(SOLE.x, SOLE.y, m.x, m.y);
      r.lineStyle(2.4, 0xfff6b0, 0.9 * a).lineBetween(SOLE.x, SOLE.y, m.x, m.y);
    }
    this.raggi = this.raggi.filter((ra) => ra.t <= 0.45 && !ra.z.finita);
  }

  // --- IL BOTA CHE SI MUOVE ---
  // respira; dal secondo atto ogni tanto si allunga (telefono, birra) o si stiracchia: uno scatto,
  // resta spostato un po', torna; nel terzo atto si gira a pancia in giù
  muoviBota(dt, A) {
    const c = this.cfg, t = this.trascorso;
    if (A.mosse && !this.giro && !this.mossa) {
      this.tMossa -= dt;
      if (this.tMossa <= 0) { this.tMossa = c.ogniMossa[0] + this.rnd() * (c.ogniMossa[1] - c.ogniMossa[0]); this.siMuove(); }
    }
    let ox = 0, oy = 0, rot = 0, sy = 1;
    const M = this.mossa;
    if (M) {
      M.t += dt;
      const s = c.scattoIn, k = M.t < s ? dolce(M.t / s) : M.t < s + c.tieneMossa ? 1 : M.t < 2 * s + c.tieneMossa ? 1 - dolce((M.t - s - c.tieneMossa) / s) : 0;
      ox = M.dx * k; oy = M.dy * k; rot = M.rot * k;
      if (M.t >= 2 * s + c.tieneMossa) { this.mossa = null; M.oggetto?.destroy(); }
    }
    const G = this.giro;
    if (G) {
      G.t += dt;
      // si schiaccia, a metà cambia lato, e torna su
      const k = G.t / GIRO;
      if (k >= 0.5 && !G.fatto) { G.fatto = true; this.cambiaLato(); }
      sy = k < 0.5 ? 1 - dolce(k * 2) * 0.94 : 0.06 + dolce(Math.min(1, (k - 0.5) * 2)) * 0.94;
      if (k >= 1) { this.giro = null; sy = 1; }
    }
    const tr = this.corpo;
    tr.x = CX + ox; tr.y = CY + oy;
    tr.rotation = rot;
    tr.setScale(SCALA, SCALA * sy * (1 + Math.sin(t * 2.2) * 0.012));
  }

  siMuove() {
    const c = this.cfg, cosa = ['telefono', 'birra', 'stira'][Math.floor(this.rnd() * 3)], s = this.rnd() < 0.5 ? 1 : -1;
    Audio.sfx('muovi');
    const stira = cosa === 'stira';
    this.mossa = { t: 0, dx: stira ? s * c.scatto : s * c.scatto * 0.4, dy: stira ? -s * c.scatto * 0.25 : s * c.scatto * 0.45, rot: s * 0.07 };
    if (!stira) {
      this.parla(caso(c.frasiMuove[cosa]), 1200);
      const key = cosa === 'birra' ? 'lattina' : 'telefono';
      const o = im(this, CX + 4 + this.mossa.dx, CY + s * 74 + this.mossa.dy, key).setDepth(56).setScale(0);
      this.tweens.add({ targets: o, scale: scalaDi(key, 1.3), duration: 160, ease: 'Back.out' });
      this.mossa.oggetto = o;
    }
  }

  // il giro (terzo atto): le scottature del davanti spariscono (non si contano: è il Bota che si
  // gira), e per mezzo secondo non si spalma e non ne nascono
  gira() {
    const c = this.cfg;
    this.girato = true;
    this.giro = { t: 0, fatto: false };
    if (this.mossa) { this.mossa.oggetto?.destroy(); this.mossa = null; }
    for (const z of this.zone) { for (const i of z.celle) z.lato.calore[i] = 0; z.etichetta?.destroy(); }
    this.zone = [];
    this.raggi = [];
    this.tNasce = GIRO + 0.15;
    this.tMossa = Math.max(this.tMossa, 1.5);
    this.prec = null;
    Audio.sfx('scivola');
    this.parla(caso(c.frasiGira), 1500);
  }

  cambiaLato() {
    this.lato = this.lati.retro;
    this.imgCorpo.setTexture('botaRetro');
    this.imgTesta.setVisible(false);
    this.sporco = true;
    this.tDisegno = 0;
  }

  // --- DISEGNO DI CREMA E SCOTTATURE ---
  ridisegna() {
    const L = this.lato, d = this.miniDati.data, n = GW * GH;
    for (let i = 0; i < n; i++) {
      let r = 0, g = 0, b = 0, a = 0;
      if (L.pelle[i]) {
        // bruciata: rosso aragosta; in una scottatura accesa: da rosa a rosso, man mano che passa il tempo
        if (L.bruciata[i]) { r = 206; g = 40; b = 32; a = 0.8; }
        else if (L.calore[i] > 0) { const h = L.calore[i]; r = 255; g = 150 - h * 105; b = 140 - h * 100; a = 0.3 + h * 0.5; }
        const v = Math.min(1, L.crema[i]);
        if (v > 0.03) {
          const ca = v * (v >= 1 ? 0.72 : 0.5);
          const tot = ca + a * (1 - ca);
          r = (255 * ca + r * a * (1 - ca)) / tot; g = (255 * ca + g * a * (1 - ca)) / tot; b = (255 * ca + b * a * (1 - ca)) / tot;
          a = tot;
        }
      }
      d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = a * 255;
    }
    // le celle fuori dalla pelle prendono il colore delle vicine (il bordo lo ritaglia la maschera)
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
      const i = gy * GW + gx;
      if (L.pelle[i]) continue;
      let r = 0, g = 0, b = 0, a = 0, q = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const x = gx + dx, y = gy + dy;
        if (x < 0 || y < 0 || x >= GW || y >= GH || !L.pelle[y * GW + x]) continue;
        const j = (y * GW + x) * 4;
        r += d[j]; g += d[j + 1]; b += d[j + 2]; a += d[j + 3]; q++;
      }
      if (q) { d[i * 4] = r / q; d[i * 4 + 1] = g / q; d[i * 4 + 2] = b / q; d[i * 4 + 3] = a / q; }
    }
    this.mini.getContext('2d').putImageData(this.miniDati, 0, 0);
    const k = this.texStrato.context, W = BW * DB, H = BH * DB, U = CELLA * DB;
    k.globalCompositeOperation = 'source-over';
    k.clearRect(0, 0, W, H);
    k.imageSmoothingEnabled = true;
    k.imageSmoothingQuality = 'high';
    k.drawImage(this.mini, 0, 0, W, H);
    // riflessi dove la crema è stesa bene
    k.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < n; i++) {
      if (!L.pelle[i] || L.crema[i] < 0.9 || (i + Math.floor(i / GW)) % 2) continue;
      const x = ((i % GW) + 0.5) * U, y = (Math.floor(i / GW) + 0.5) * U;
      k.beginPath(); k.ellipse(x - U * 0.12, y - U * 0.16, U * 0.2, U * 0.085, -0.55, 0, Math.PI * 2); k.fill();
    }
    k.globalCompositeOperation = 'destination-in';
    k.drawImage(L.maschera, 0, 0, W, H);
    k.globalCompositeOperation = 'source-over';
    this.texStrato.refresh();
    this.sporco = false;
  }

  risultato() {
    const vinto = this.condizione;
    return {
      punteggio: Math.max(0, Math.round(this.punti)),
      vittoria: vinto,
      riepilogo: `${quanti(this.spente, 'scottatura spenta', 'scottature spente')}, ${quanti(this.scottate, 'scottato', 'scottati')}, serie migliore ${this.serieMax}`,
    };
  }

  // il Bota si alza e si guarda: abbronzato alla perfezione, oppure rosso aragosta
  finale(ris, fatto) {
    for (const o of [...this.hudBota, this.mano, this.zoneG, this.raggiG, ...this.zone.map((z) => z.etichetta)]) o?.setVisible(false);
    this.mossa?.oggetto?.destroy();
    this.fum?.destroy();
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.82, duration: 300 });
    this.tweens.add({ targets: this.corpo, alpha: 0, duration: 250 });
    const key = ris.vittoria ? 'bota_abbronzato' : 'bota_aragosta';
    const b = im(this, 240, 290, key, 0.4).setOrigin(0.5, 1).setDepth(702);
    this.tweens.add({ targets: b, y: 262, scale: scalaDi(key, 1.6), delay: 150, duration: 420, ease: 'Back.out' });
    this.time.delayedCall(800, () => {
      if (ris.vittoria) {
        Audio.sfx('vittoria');
        txt(this, 240, 22, 'ABBRONZATURA PERFETTA!', { size: 16, color: '#7dff9a', depth: 710 });
        for (let i = 0; i < 4; i++) this.time.delayedCall(i * 250, () => stelle(this, 150 + Math.random() * 180, 70 + Math.random() * 130, 8, 705));
        this.tweens.add({ targets: b, scaleY: b.scaleY * 1.04, scaleX: b.scaleX * 0.97, y: 258, duration: 240, yoyo: true, repeat: -1 });
      } else {
        Audio.sfx('sconfitta');
        txt(this, 240, 22, 'ROSSO ARAGOSTA!', { size: 16, color: '#ff6b5a', depth: 710 });
        this.tweens.add({ targets: b, x: { from: 240, to: 296 }, duration: 1500, ease: 'Stepped', easeParams: [5], yoyo: true, repeat: -1 });
        this.tweens.add({ targets: b, angle: { from: -3, to: 3 }, duration: 150, ease: 'Stepped', easeParams: [1], yoyo: true, repeat: -1 });
        this.time.addEvent({ delay: 300, repeat: 8, callback: () => { Audio.sfx('tonk'); fumo(this, b.x + (Math.random() - 0.5) * 50, 110 + Math.random() * 60, 1, 705); } });
        this.time.delayedCall(350, () => fumetto(this, 372, 84, 'Non mi toccare!', 2100, 712));
      }
    });
    this.time.delayedCall(3600, fatto);
  }
}
