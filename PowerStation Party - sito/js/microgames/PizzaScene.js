// Microgioco 18: "La pizza dal Boni" - le pizze giuste, a memoria, e gli imbucati da coprire. CONDISCI!
//
//  Il Boni fa la pizza a casa sua e non invita mai il Sego e Oli: stasera si sono imbucati, e
//  stanno nascosti (sotto la tovaglia, dietro la botte, nella cesta della legna, dietro la tenda
//  della cantina, sotto i cappotti) o travestiti a tavola (la maschera di Giorgio, baffi finti e
//  cappello, da cuoco). Chi gioca è l'amico che li ha fatti entrare: li copre facendo le pizze
//  giuste, così il Boni resta al forno.
//  - L'ORDINAZIONE: il Boni grida la pizza, il foglietto mostra ingredienti e quantità, poi si gira:
//    la pizza va fatta A MEMORIA (toccandolo lo si rivede un attimo, ma si perde il bonus velocità).
//  - IL POMODORO: col mestolo scelto, si passa in tondo sulla pasta (SPAZIO tenuto, da tastiera).
//  - GLI INGREDIENTI: si tocca la ciotola e poi la pizza (o si trascina): un pezzo a tocco (1-6).
//    L'ananas è una trappola: non è mai nell'ordinazione.
//  - PRONTA!: giusta, il Boni la inforna e la porta in tavola; sbagliata (un pezzo in più o in
//    meno, un ingrediente sbagliato, l'ananas, poco pomodoro) la butta, corre a bere dalla caraffa
//    e scopre un imbucato. Al secondo errore li scopre tutti e due: FUORI TUTTI!, e finisce.
//  Dal secondo atto gli imbucati sbucano (o gli scivola il travestimento): vanno rimandati giù con
//  un tocco (G) prima che il Boni si giri. Nel terzo il Boni ha fretta: il tempo per pizza è contato.
//  Ordini, nascondigli, travestimenti, invitati e i momenti in cui sbucano escono dal seme del round.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { CONFIG } from '../config.js';
import { casuale } from '../grafica/base.js';
import { TAVERNA as T, INGREDIENTI } from '../grafica/taverna.js';
import { ritratto } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, scuoti, puntatore, colpetto, caso, eTouch, perDito, vibra, multiTouch, puntiHud, numero, quanti } from '../fx.js';

const TAGLIA_BONI = 0.78;      // il Boni dietro il bancone (circa 112 unità)
const TAGLIA = 0.5;            // invitati e imbucati (circa 72 unità)
const Y_SEDUTI = 180;          // i piedi di chi è seduto alla tavola (le gambe stanno dietro la tovaglia)
const STRUMENTI = ['sugo', ...INGREDIENTI];   // il mestolo del pomodoro e le sei ciotole
const SETTORI = 12;            // il pomodoro: la pasta è divisa in 12 spicchi x 2 anelli
const NOMI = { oli: 'OLI', sego: 'SEGO' };

export class PizzaScene extends MicrogiocoBase {
  constructor() { super('pizza'); }

  prepara() {
    const c = this.cfg, seme = Sessione.seme;
    this.rnd = casuale(seme);
    this.semeOrdini = (seme ^ 0x51a7e3) >>> 0;
    const rImb = casuale((seme ^ 0x2b0e1d) >>> 0);
    this.rSbuca = casuale((seme ^ 0x7a11ce) >>> 0);
    this.punti = 0; this.giuste = 0; this.serie = 0; this.errori = 0; this.nOrdine = 0; this.ananas = 0;
    this.stato = 'attesa';           // 'ordine' (si fa la pizza) | 'pausa' (il Boni è occupato)
    this.strumento = 'sugo';
    this.pezzi = {}; this.celle = new Set();
    this.scoperti = [];
    this.sbuca = null; this.tSbuca = null;

    // --- la taverna ---
    im(this, 0, 0, 'bgTaverna').setOrigin(0).setDepth(0);
    // il fuoco nella bocca del forno, che balla, col bagliore
    this.fuoco = im(this, T.forno.x, T.forno.y - 2, 'fuoco0', 1.05).setOrigin(0.5, 1).setDepth(3);
    this.bagliore = this.add.ellipse(T.forno.x, T.forno.y - 16, 120, 70, 0xff7a1a, 0.22).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: this.bagliore, alpha: 0.6, scaleX: 1.08, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tFuoco = 0; this.kFuoco = 0; this.tCrepita = 0.4;
    // i nascondigli (ci sono sempre tutti: quali sono abitati lo sa solo il seme)
    this.porta = im(this, T.porta.x, T.porta.y, 'portaChiusa').setOrigin(0.5, 1).setDepth(6);
    this.tenda = im(this, T.tenda.x, T.tenda.y - 2, 'tendaChiusa').setOrigin(0.5, 1).setDepth(8);
    im(this, T.cappotti.x, T.cappotti.y, 'attaccapanni').setOrigin(0.5, 1).setDepth(7);
    this.cappotti = im(this, T.cappotti.x + 1, T.cappotti.y - 84, 'cappotti').setOrigin(0.5, 0).setDepth(9);
    this.botte = im(this, T.botte.x, T.botte.y, 'botte').setOrigin(0.5, 1).setDepth(12);
    this.cesta = im(this, T.cesta.x, T.cesta.y, 'cesta').setOrigin(0.5, 1).setDepth(12);
    // il Boni al forno
    // (davanti alla tavola quando ci va a bere: tra la tavola e il bancone)
    this.boni = im(this, T.boni.x, T.boni.y, 'boni_normale', TAGLIA_BONI).setOrigin(0.5, 1).setDepth(34);
    // la tavola: gli invitati (personaggi giocabili, dal seme) e i due imbucati
    this.preparaImbucati(rImb);
    this.tavola = im(this, T.tavola.x0 - 2, T.tavola.y - 2, 'tavolaTaverna').setOrigin(0).setDepth(30);
    this.caraffa = im(this, T.tavola.x1 - 6, T.tavola.y + 3, 'caraffaTavola', 0.85).setOrigin(0.5, 1).setDepth(31);
    this.pizzeInTavola = 0;

    // --- il bancone, la pasta, gli strumenti ---
    im(this, 0, T.bancone, 'banconeTaverna').setOrigin(0).setDepth(40);
    this.pasta = im(this, T.pizza.x, T.pizza.y, 'pastaPizza').setDepth(41);
    this.gSugo = this.add.container(T.pizza.x, T.pizza.y).setDepth(42);
    this.gPezzi = this.add.container(T.pizza.x, T.pizza.y).setDepth(43);
    this.gSel = this.add.graphics().setDepth(41);
    this.ciotole = STRUMENTI.map((k, i) => {
      const x = T.ciotole.x0 + i * T.ciotole.passo, y = T.ciotole.y;
      const parti = [im(this, x, y, 'ciotola', 1).setDepth(42)];
      if (k === 'sugo') {
        parti.push(this.add.ellipse(x, y - 3.5, 30, 7, 0xc8301c).setDepth(42));
        const mestolo = this.add.graphics().setDepth(43);
        mestolo.lineStyle(3, 0x2b1b17, 1).lineBetween(x + 6, y - 6, x + 16, y - 22).lineStyle(1.6, 0xb8bcc8, 1).lineBetween(x + 6, y - 6, x + 16, y - 22);
        parti.push(mestolo);
      } else for (const [dx, dy] of [[-7, -5], [6, -6], [0, -9]]) parti.push(im(this, x + dx, y + dy, 'ing_' + k, 0.85).setDepth(43));
      if (!eTouch()) parti.push(txt(this, x, y + 15, k === 'sugo' ? 'SPAZIO' : String(i), { size: 7, color: '#ffe14a', depth: 44 }));
      return { k, x, y, parti };
    });
    this.disegnaSelezione();
    // i pulsanti: PRONTA! e RIFAI
    this.bottoni = {};
    this.pulsanteGrande('pronta', T.pronta.x, T.pronta.y, 74, 34, 'PRONTA!', 0x2f9a4a, () => this.pronta());
    this.pulsanteGrande('rifai', T.rifai.x, T.rifai.y, 58, 18, 'RIFAI', 0x6a5a4a, () => this.rifai(), 8);
    if (!eTouch()) txt(this, T.pronta.x, T.pronta.y + 23, 'INVIO', { size: 7, color: '#ffe14a', depth: 1001 });

    // --- il foglietto dell'ordinazione ---
    this.foglio = this.add.container(T.foglietto.x, T.foglietto.y).setDepth(950).setVisible(false);
    this.fronte = this.add.container(0, 0);
    this.retro = im(this, 0, 0, 'fogliettoRetro');
    this.foglio.add([im(this, 0, 0, 'foglietto'), this.fronte, this.retro]);
    this.zonaFoglio = this.add.zone(T.foglietto.x, T.foglietto.y, T.foglietto.w, T.foglietto.h).setDepth(952).setInteractive({ useHandCursor: true });
    this.zonaFoglio.on('pointerdown', (p, x, y, ev) => { ev?.stopPropagation(); this.sbircia(); });
    this.barraPizza = this.add.graphics().setDepth(951);
    // --- l'HUD ---
    this.testoPunti = txt(this, 474, 36, '', { size: 9, ox: 1, depth: 1001 });
    this.testoPizze = txt(this, 474, 49, '', { size: 8, ox: 1, depth: 1001, color: '#ffe14a' });
    this.faccine = this.imbucati.map((m, i) => {
      const x = 444 + i * 22, y = 68;
      const f = this.add.container(x, y, [this.add.circle(0, 0, 9, 0x1f1430, 0.85), ritratto(this, 0, 0, m.id, 15)]).setDepth(1001);
      const croce = this.add.graphics().setDepth(1002).setVisible(false);
      croce.lineStyle(2.6, 0xff3b2f, 1).lineBetween(x - 7, y - 7, x + 7, y + 7).lineBetween(x + 7, y - 7, x - 7, y + 7);
      return { f, croce };
    });
    this.hud = '';
    // il Boni che sta per girarsi (quando sbuca un imbucato)
    this.allarme = this.add.container(T.boni.x + 26, T.boni.y - 122).setDepth(960).setVisible(false);
    this.gAllarme = this.add.graphics();
    this.allarme.add([this.gAllarme, ritratto(this, 0, 0, 'boni', 16), txt(this, 13, -10, '!', { size: 12, color: '#ff3b2f' })]);

    // --- i comandi ---
    multiTouch(this);
    this.input.on('pointerdown', (p) => this.giu(p));
    this.input.on('pointermove', (p) => this.muovi(p));
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => this.su(p));
    const k = this.input.keyboard;
    this.tastoSugo = k.addKey('SPACE');
    k.addCapture(['TAB', 'SPACE']);
    INGREDIENTI.forEach((ing, i) => k.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'][i]}`, () => this.aggiungi(ing)));
    k.on('keydown-ENTER', () => this.pronta());
    k.on('keydown-TAB', () => this.sbircia());
    k.on('keydown-G', () => this.rimandaGiu());
    k.on('keydown-BACKSPACE', () => this.rifai());
    this.trascina = null;
    this.time.delayedCall(350, () => this.nuovoOrdine());
  }

  // un pulsante rettangolare (col suo tocco: non arriva al resto della scena)
  pulsanteGrande(nome, x, y, w, h, testo, col, azione, size = 11) {
    const g = this.add.graphics().setDepth(1000);
    g.fillStyle(0x000000, 0.3).fillRoundedRect(x - w / 2 + 1.5, y - h / 2 + 2.5, w, h, 8);
    g.fillStyle(col, 1).fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    g.lineStyle(1.6, 0xffe14a, 1).strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    const t = txt(this, x, y, testo, { size, depth: 1001 });
    const z = this.add.zone(x, y, w + 8, h + 8).setDepth(1002).setInteractive({ useHandCursor: true });
    z.on('pointerdown', (p, lx, ly, ev) => { ev?.stopPropagation(); if (!this.inCorso) return; colpetto(this, t, 1.2, 1.2); azione(); });
    this.bottoni[nome] = { g, t, z };
  }

  // ---------- gli imbucati e gli invitati ----------
  preparaImbucati(r) {
    const c = this.cfg, pesca = (a) => a.splice(Math.floor(r() * a.length), 1)[0];
    const nasc = [...c.nascondigli], trav = [...c.travestimenti], posti = [0, 1, 2, 3];
    // chi viene scoperto per primo lo decide il seme
    const ordine = r() < 0.5 ? ['oli', 'sego'] : ['sego', 'oli'];
    this.imbucati = ordine.map((id, i) => {
      const travestito = r() < c.travestito && trav.length;
      return travestito ? { i, id, travestito: pesca(trav), posto: pesca(posti) } : { i, id, nascondiglio: pesca(nasc) };
    });
    // gli invitati: personaggi giocabili presi dal seme (non chi gioca, non il Boni né gli imbucati)
    const io = this.giocatore.id.replace(DOPPIONE, ''), via = new Set([io, 'boni', 'oli', 'sego']);
    const ospiti = CONFIG.personaggiGiocabili.map((g) => g.id).filter((id) => !via.has(id));
    this.invitati = posti.map((i) => {
      const id = pesca(ospiti), x = T.posti[i];
      return { id, x, img: im(this, x, Y_SEDUTI, `${id}_normale`, TAGLIA).setOrigin(0.5, 1).setDepth(25) };
    });
    for (const m of this.imbucati) this.mettiImbucato(m);
  }

  mettiImbucato(m) {
    if (m.travestito) {
      // seduto a tavola in mezzo agli invitati, camuffato: si riconosce guardando bene (la maschera
      // è storta, i capelli spuntano, le scarpe sono le sue)
      const x = T.posti[m.posto];
      m.img = im(this, x, Y_SEDUTI, `${m.id}_normale`, TAGLIA).setOrigin(0.5, 1).setDepth(25);
      const h = { x, y: Y_SEDUTI - 87 * TAGLIA };
      m.trucco = this.add.container(h.x, h.y).setDepth(26);
      if (m.travestito === 'maschera') {
        const elastico = this.add.graphics(); elastico.lineStyle(1, 0x1f1430, 0.8).lineBetween(-15, -2, 15, -5);
        m.trucco.add([elastico, im(this, 0.5, 1, 'bordoMaschera', 0.82), ritratto(this, 0, 0, 'giorgio', 24)]);
        m.trucco.setRotation(0.16);
      } else if (m.travestito === 'baffi') {
        m.trucco.add([im(this, 0, 8.5, 'baffiFinti', 0.62), im(this, 0, -15, 'cappelloFeltro', 0.72)]);
      } else {
        m.trucco.add([im(this, 0, -19, 'cappelloCuoco', 0.72), im(this, 0, 28, 'grembiule', 0.62)]);
      }
      // (gli altri posti restano agli invitati: chi era seduto lì si sposta)
      const inv = this.invitati.find((v) => v.x === x);
      if (inv) { inv.img.destroy(); this.invitati = this.invitati.filter((v) => v !== inv); }
      return;
    }
    // nascosto: dietro (o sotto) il nascondiglio, con qualcosa che spunta per chi guarda bene
    const N = m.nascondiglio;
    const pos = { tovaglia: [T.tavola.x0 + 60, 222, 29], botte: [T.botte.x, 226, 11], cesta: [T.cesta.x, 226, 11], tenda: [T.tenda.x, 172, 7], cappotti: [T.cappotti.x + 1, 190, 8] }[N];
    m.casa = { x: pos[0], y: pos[1] };
    m.img = im(this, pos[0], pos[1], `${m.id}_normale`, TAGLIA).setOrigin(0.5, 1).setDepth(pos[2]);
    if (N === 'tovaglia') {
      // si vedono solo le scarpe, sotto il bordo della tovaglia
      m.indizio = this.add.graphics().setDepth(31);
      for (const s of [-1, 1]) m.indizio.fillStyle(0x1f1430, 1).fillEllipse(pos[0] + s * 6, 193, 10, 4.5);
    }
  }

  // ---------- le ordinazioni ----------
  get atto() { return this.cfg.atti.filter((a) => this.trascorso >= a.da).pop(); }

  nuovoOrdine() {
    if (!this.inCorso && this.trascorso > 0.5) return;
    const c = this.cfg, A = this.atto;
    const r = casuale((this.semeOrdini ^ Math.imul(0x9e3779b1, this.nOrdine + 1)) >>> 0);
    const menu = c.menu[A.menu ?? 0], pizza = menu[Math.floor(r() * menu.length)];
    this.nOrdine++;
    this.ordine = { pizza, inizio: this.trascorso, sbirciato: false, scadenza: A.tempo ? this.trascorso + A.tempo : null, durata: A.tempo ?? 0 };
    this.pulisciPizza();
    this.stato = 'ordine';
    // il Boni grida l'ordinazione
    this.boni.setTexture('boni_grida');
    this.time.delayedCall(700, () => { if (this.stato === 'ordine' && this.boni.texture.key === 'boni_grida') this.boni.setTexture('boni_normale'); });
    Audio.sfx('borbottio');
    fumetto(this, this.boni.x - 30, this.boni.y - 120, caso(c.frasiOrdine).replace('{pizza}', pizza.nome), 1100, 961);   // (a sinistra del foglietto)
    this.mostraFoglietto(A.foglietto);
  }

  // il foglietto: nome della pizza e ingredienti in fila (il pomodoro sempre per primo), con le quantità
  mostraFoglietto(sec) {
    const P = this.ordine.pizza, F = T.foglietto;
    this.fronte.removeAll(true);
    this.fronte.add(txt(this, 0, -F.h / 2 + 12, P.nome, { size: 9, color: '#c0282e', thick: 0 }));
    const voci = [['pomodoro', 0], ...Object.entries(P.pezzi)], passo = Math.min(34, (F.w - 16) / voci.length), x0 = -((voci.length - 1) * passo) / 2;
    voci.forEach(([k, n], i) => {
      const x = x0 + i * passo;
      this.fronte.add(im(this, x, 2, 'ing_' + k, 1.45));
      this.fronte.add(txt(this, x, 24, k === 'pomodoro' ? 'sugo' : `x${n}`, { size: 9, color: '#1f1430', thick: 0 }));
    });
    this.foglio.setVisible(true).setScale(1);
    this.retro.setVisible(false); this.fronte.setVisible(true);
    colpetto(this, this.foglio, 1.08, 1.08);
    this.tGiro?.remove();
    this.tGiro = this.time.delayedCall(sec * 1000, () => this.giraFoglietto());
  }

  giraFoglietto() {
    if (!this.foglio.visible || this.retro.visible) return;
    Audio.sfx('scivola');
    this.tweens.add({ targets: this.foglio, scaleX: 0, duration: 110, yoyo: true, onYoyo: () => { this.fronte.setVisible(false); this.retro.setVisible(true); } });
  }

  // toccando il foglietto (o TAB) lo si rivede per un attimo: niente bonus velocità per questa pizza
  sbircia() {
    if (!this.inCorso || this.stato !== 'ordine' || !this.retro.visible) return;
    this.ordine.sbirciato = true;
    Audio.sfx('muovi');
    this.tweens.add({ targets: this.foglio, scaleX: 0, duration: 90, yoyo: true, onYoyo: () => { this.fronte.setVisible(true); this.retro.setVisible(false); } });
    this.tGiro?.remove();
    this.tGiro = this.time.delayedCall(this.cfg.sbirciata * 1000, () => this.giraFoglietto());
  }

  pulisciPizza() {
    this.pezzi = {}; this.celle = new Set();
    this.gSugo.removeAll(true); this.gPezzi.removeAll(true);
    this.pasta.setVisible(true).setAlpha(1).setScale(scalaDi('pastaPizza', 1)).setPosition(T.pizza.x, T.pizza.y).setAngle(0);
    this.gSugo.setVisible(true).setPosition(T.pizza.x, T.pizza.y).setScale(1).setAngle(0).setAlpha(1);
    this.gPezzi.setVisible(true).setPosition(T.pizza.x, T.pizza.y).setScale(1).setAngle(0).setAlpha(1);
    this.strumento = 'sugo';
    this.disegnaSelezione();
  }

  // ---------- fare la pizza ----------
  sullaPizza(w) { return Math.hypot(w.x - T.pizza.x, (w.y - T.pizza.y) * 1.1) <= T.pizza.r + 6; }
  ciotolaSotto(w, extra) { return this.ciotole.find((o) => Math.abs(w.x - o.x) <= 19 + extra && w.y >= o.y - 22 - extra && w.y <= o.y + 14 + extra); }

  giu(p) {
    if (!this.inCorso) return;
    const w = puntatore(this, p), extra = p.wasTouch ? 4 : 0;
    // un imbucato che sbuca: un tocco lo rimanda giù
    if (this.sbuca && Math.hypot(w.x - this.sbuca.zona.x, w.y - this.sbuca.zona.y) <= 24 + extra) return this.rimandaGiu();
    if (this.stato !== 'ordine') return;
    const o = this.ciotolaSotto(w, extra);
    if (o) {
      this.strumento = o.k; this.disegnaSelezione();
      Audio.sfx('muovi');
      if (o.k !== 'sugo') this.trascina = { id: p.id, k: o.k, img: im(this, w.x, w.y, 'ing_' + o.k, 1.1).setDepth(970).setAlpha(0.85) };
      return;
    }
    if (this.sullaPizza(w)) {
      if (this.strumento === 'sugo') { this.pennello = { id: p.id }; this.stendi(w); }
      else this.aggiungi(this.strumento);
    }
  }

  muovi(p) {
    if (this.trascina?.id === p.id) { const w = puntatore(this, p); this.trascina.img.setPosition(w.x, w.y - (p.wasTouch ? 14 : 0)); }
    if (this.pennello?.id === p.id && p.isDown) { const w = puntatore(this, p); if (this.sullaPizza(w)) this.stendi(w); }
  }

  su(p) {
    if (this.pennello?.id === p.id) this.pennello = null;
    if (this.trascina?.id !== p.id) return;
    const t = this.trascina, w = puntatore(this, p);
    this.trascina = null;
    t.img.destroy();
    // trascinato dalla ciotola alla pizza: un pezzo
    if (this.sullaPizza({ x: w.x, y: w.y - (p.wasTouch ? 14 : 0) })) this.aggiungi(t.k);
  }

  // il pomodoro: lo spicchio sotto il dito (o il prossimo, da tastiera) si riempie
  stendi(w) {
    if (this.stato !== 'ordine') return;
    const dx = w.x - T.pizza.x, dy = (w.y - T.pizza.y) * 1.1, d = Math.hypot(dx, dy);
    const s = Math.floor(((Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2 / SETTORI)), anello = d < T.pizza.r * 0.45 ? 0 : 1;
    this.sugoIn(s + anello * SETTORI);
  }
  sugoIn(cella) {
    if (this.celle.has(cella)) return;
    this.celle.add(cella);
    const s = cella % SETTORI, anello = Math.floor(cella / SETTORI), a0 = (s + 0.5) * (Math.PI * 2 / SETTORI);
    for (let i = 0; i < (anello ? 2 : 1); i++) {
      const a = a0 + (Math.random() - 0.5) * 0.4, rr = anello ? 17 + Math.random() * 7 : 4 + Math.random() * 7;
      this.gSugo.add(im(this, Math.cos(a) * rr, Math.sin(a) * rr * 0.88, 'pomodoroPizza', 1.25 + Math.random() * 0.3).setAngle(Math.random() * 360));
    }
    if (this.celle.size % 4 === 1) Audio.sfx('pennello');
  }
  get pomodoro() { return this.celle.size / (SETTORI * 2); }

  aggiungi(k) {
    if (!this.inCorso || this.stato !== 'ordine') return;
    this.pezzi[k] = (this.pezzi[k] ?? 0) + 1;
    const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 23;
    const pz = im(this, Math.cos(a) * rr, Math.sin(a) * rr * 0.88, 'ing_' + k, 0.9).setAngle(Math.random() * 360);
    this.gPezzi.add(pz);
    this.tweens.add({ targets: pz, scale: { from: pz.scale * 1.6, to: pz.scale }, duration: 140, ease: 'Quad.out' });
    Audio.sfx('pof');
  }

  rifai() {
    if (!this.inCorso || this.stato !== 'ordine') return;
    Audio.sfx('scivola');
    this.pulisciPizza();
  }

  disegnaSelezione() {
    const g = this.gSel, o = this.ciotole?.find((x) => x.k === this.strumento);
    g.clear();
    if (!o) return;
    g.fillStyle(0xffe14a, 0.55).fillEllipse(o.x, o.y + 1, 46, 30);
    g.lineStyle(2, 0xffe14a, 1).strokeEllipse(o.x, o.y + 1, 46, 30);
  }

  // ---------- la consegna ----------
  giusta() {
    const P = this.ordine.pizza.pezzi;
    if (this.pomodoro < this.cfg.pomodoroMinimo || this.pezzi.ananas) return false;
    const chiavi = new Set([...Object.keys(P), ...Object.keys(this.pezzi)]);
    for (const k of chiavi) if ((P[k] ?? 0) !== (this.pezzi[k] ?? 0)) return false;
    return true;
  }

  pronta() {
    if (!this.inCorso || this.stato !== 'ordine') return;
    this.stato = 'pausa';
    this.tGiro?.remove();
    this.foglio.setVisible(false);
    this.barraPizza.clear();
    if (this.giusta()) this.pizzaGiusta();
    else this.sbaglio(this.pezzi.ananas ? 'ananas' : 'pizza');
  }

  pizzaGiusta() {
    const c = this.cfg, O = this.ordine;
    this.giuste++; this.serie++;
    const rapido = !O.sbirciato && this.trascorso - O.inizio <= c.secondiRapido;
    const guadagno = c.puntiPizza + c.crescitaPizza * (this.giuste - 1) + (rapido ? c.bonusRapido : 0) + c.bonusSerie * (this.serie - 1);
    this.punti += guadagno;
    Audio.sfx('ok');
    scritta(this, T.pizza.x, T.pizza.y - 48, rapido ? `GIUSTA! +${guadagno} (VELOCE)` : `GIUSTA! +${guadagno}`, { size: 10, color: '#7dff9a', durata: 700, depth: 965 });
    fumetto(this, this.boni.x - 30, this.boni.y - 120, caso(c.frasiGiusta), 900, 961);
    // il Boni la impala con la pala e la inforna con un gesto teatrale; poi la porta in tavola
    this.boni.setTexture('boni_pala');
    const pizza = im(this, T.pizza.x, T.pizza.y, 'pizzaCotta', 1).setDepth(44).setAlpha(0);
    this.pasta.setVisible(false); this.gSugo.setVisible(false); this.gPezzi.setVisible(false);
    pizza.setAlpha(1);
    Audio.sfx('pala');
    this.tweens.add({
      targets: pizza, x: T.forno.x + 4, y: T.forno.y - 14, scale: pizza.scale * 0.42, duration: 380, ease: 'Quad.inOut',
      onStart: () => pizza.setDepth(5),
      onComplete: () => {
        this.tweens.add({ targets: this.bagliore, alpha: 0.95, scaleX: 1.4, duration: 120, yoyo: true });
        for (let i = 0; i < 3; i++) fumo(this, T.forno.x + (i - 1) * 10, T.forno.y - 30, 1, 6, 0x6a5a4a);
        pizza.destroy();
        this.time.delayedCall(260, () => this.inTavola());
        this.time.delayedCall(520, () => { if (this.inCorso) { this.boni.setTexture('boni_normale'); this.nuovoOrdine(); } });
      },
    });
    this.invitati.forEach((v) => { v.img.setTexture(`${v.id}_felice`); this.time.delayedCall(900, () => v.img.setTexture(`${v.id}_normale`)); });
  }

  // una pizza fumante arriva in tavola (ne restano al massimo quattro)
  inTavola() {
    const x = T.tavola.x0 + 24 + (this.pizzeInTavola % 4) * 40;
    this.pizzeInTavola++;
    const p = im(this, x, T.tavola.y + 4, 'pizzaCotta', 0.36).setDepth(32).setScale(0);
    this.tweens.add({ targets: p, scaleX: scalaDi('pizzaCotta', 0.36), scaleY: scalaDi('pizzaCotta', 0.36) * 0.45, duration: 200, ease: 'Back.out' });
    fumo(this, x, T.tavola.y - 4, 1, 33, 0xdddddd);
  }

  // ---------- gli errori ----------
  // tipo: 'pizza' (sbagliata) | 'ananas' | 'visto' (un imbucato che sbucava)
  sbaglio(tipo, chi) {
    const c = this.cfg;
    this.stato = 'pausa';
    this.serie = 0;
    this.errori++;
    if (tipo === 'ananas') this.ananas++;
    this.fineSbuca(false);
    vibra(90);
    Audio.sfx('errore');
    const urlo = tipo === 'ananas' ? caso(c.frasiAnanas) : tipo === 'visto' ? '' : caso(c.frasiSbagliata);
    this.boni.setTexture(tipo === 'ananas' ? 'boni_beccati' : 'boni_rabbia');
    if (urlo) scritta(this, 240, 108, urlo, { size: tipo === 'ananas' ? 17 : 14, color: '#ff3b2f', durata: 900, depth: 965 });
    scuoti(this, tipo === 'ananas' ? 380 : 220, tipo === 'ananas' ? 0.014 : 0.008);
    if (tipo !== 'visto') {
      // butta la pizza
      Audio.sfx('schiaffo');
      const via = { x: -60, y: 120 };
      for (const o of [this.pasta, this.gSugo, this.gPezzi]) this.tweens.add({ targets: o, x: via.x, y: via.y, angle: -540, scale: o.scale * 0.5, duration: 520, ease: 'Quad.in' });
    }
    // corre alla tavola a bere dalla caraffa, poi scopre il prossimo imbucato
    this.time.delayedCall(tipo === 'ananas' ? 650 : 450, () => this.correABere(() => this.scopri(chi)));
  }

  correABere(poi) {
    if (this.finito) return;
    const B = this.boni, xc = this.caraffa.x - 8;
    B.setTexture('boni_corre').setFlipX(false);
    Audio.sfx('borbottio');
    this.tweens.add({
      targets: B, x: xc, duration: 420, ease: 'Sine.inOut',
      onUpdate: () => B.setY(T.boni.y - Math.abs(Math.sin(this.time.now / 60)) * 3),
      onComplete: () => {
        if (this.finito) return;
        B.setTexture('boni_beve').setY(T.boni.y);
        this.caraffa.setVisible(false);
        Audio.sfx('caraffa');
        this.time.delayedCall(560, () => { if (this.finito) return; this.caraffa.setVisible(true); poi(); });
      },
    });
  }

  // il Boni scopre il prossimo imbucato: toglie il nascondiglio o strappa il travestimento, e lo caccia
  scopri(chi) {
    const c = this.cfg, m = chi && !chi.scoperto ? chi : this.imbucati.find((x) => !x.scoperto);
    if (!m) return this.tornaAlForno();
    m.scoperto = true;
    this.scoperti.push(m.id);
    const B = this.boni;
    B.setTexture('boni_beccati').setFlipX(m.img.x < B.x);
    Audio.sfx('ruggito');
    this.svela(m);
    fumetto(this, Phaser.Math.Clamp(m.img.x, 90, 390), m.img.y - 82, caso(c.frasiScoperto).replace('{nome}', NOMI[m.id]), 1300, 962);
    this.invitati.forEach((v) => v.img.setTexture(`${v.id}_shock`));
    this.faccine[m.i].croce.setVisible(true);
    colpetto(this, this.faccine[m.i].f, 1.4, 1.4);
    if (this.scoperti.length >= 2) {
      // li ha scoperti tutti e due: FUORI TUTTI!
      this.time.delayedCall(900, () => this.termina());
      return;
    }
    // lo caccia fuori dalla porta con la pala
    this.time.delayedCall(850, () => {
      if (this.finito) return;
      B.setTexture('boni_caccia').setFlipX(false);
      Audio.sfx('pala');
      this.cacciaFuori([m], () => {
        this.invitati.forEach((v) => v.img.setTexture(`${v.id}_normale`));
        this.tornaAlForno();
      });
    });
  }

  // il nascondiglio si apre (o il travestimento vola via) e sotto c'è l'imbucato con la faccia colpevole
  svela(m) {
    m.img.setTexture(`${m.id}_shock`).setVisible(true);
    m.indizio?.destroy();
    if (m.travestito) {
      const t = m.trucco;
      this.tweens.add({ targets: t, x: t.x + 40, y: T.bancone - 8, angle: 300, duration: 650, ease: 'Quad.in', onComplete: () => t.setDepth(39) });
      this.tweens.add({ targets: m.img, y: m.img.y - 6, duration: 120, yoyo: true });
      return;
    }
    const N = m.nascondiglio, img = m.img;
    if (N === 'tovaglia') this.tweens.add({ targets: img, y: Y_SEDUTI + 12, duration: 300, ease: 'Back.out', onStart: () => img.setDepth(35) });
    else if (N === 'botte') { this.tweens.add({ targets: this.botte, x: this.botte.x + 30, angle: 18, duration: 300, ease: 'Quad.out' }); this.tweens.add({ targets: img, y: img.y - 30, duration: 260 }); }
    else if (N === 'cesta') {
      // la cesta si rovescia e lui salta fuori tra i ciocchi
      this.tweens.add({ targets: this.cesta, angle: -24, x: this.cesta.x - 10, duration: 260, ease: 'Quad.out' });
      this.tweens.add({ targets: img, y: img.y - 26, duration: 260, onStart: () => img.setDepth(13) });
      fumo(this, this.cesta.x, this.cesta.y - 20, 3, 14, 0xb8a888);
    } else if (N === 'tenda') this.tenda.setTexture('tendaAperta');
    else if (N === 'cappotti') { this.cappotti.setTexture('cappottiTerra').setOrigin(0.5, 1).setPosition(this.cappotti.x + 8, T.cappotti.y + 2); }
  }

  // via dalla porta: gli imbucati corrono, il Boni dietro con la pala, la porta sbatte
  cacciaFuori(chi, poi) {
    this.porta.setTexture('portaAperta').setOrigin(0.5, 1);
    chi.forEach((m, k) => {
      m.trucco?.destroy();
      m.img.setFlipX(false).setDepth(36);
      this.tweens.add({ targets: m.img, x: T.porta.x + 2, y: T.porta.y + 26, duration: 620 + k * 120, ease: 'Quad.in', onUpdate: () => m.img.setAngle(Math.sin(this.time.now / 50) * 6),
        onComplete: () => m.img.setVisible(false) });
    });
    this.tweens.add({ targets: this.boni, x: T.tavola.x1 + 4, duration: 640, ease: 'Sine.inOut' });
    this.time.delayedCall(820 + chi.length * 100, () => {
      if (this.finito && !poi) return;
      this.porta.setTexture('portaChiusa');
      Audio.sfx('portone');
      scuoti(this, 160, 0.006);
      poi?.();
    });
  }

  tornaAlForno() {
    if (this.finito) return;
    const B = this.boni;
    B.setTexture('boni_corre').setFlipX(true);
    this.tweens.add({ targets: B, x: T.boni.x, duration: 480, ease: 'Sine.inOut', onComplete: () => {
      if (this.finito) return;
      B.setFlipX(false).setTexture('boni_normale');
      this.nuovoOrdine();
    } });
  }

  // il terzo atto: il Boni ha fretta (il tempo per pizza è contato)
  troppoLento() {
    const c = this.cfg;
    this.stato = 'pausa';
    this.serie = 0;
    this.tGiro?.remove();
    this.foglio.setVisible(false);
    this.barraPizza.clear();
    Audio.sfx('borbottio');
    this.boni.setTexture('boni_rabbia');
    scritta(this, 240, 108, caso(c.frasiLento), { size: 14, color: '#ff9a3a', durata: 800, depth: 965 });
    for (const o of [this.pasta, this.gSugo, this.gPezzi]) this.tweens.add({ targets: o, alpha: 0, duration: 300 });
    this.time.delayedCall(700, () => { if (this.inCorso) { this.boni.setTexture('boni_normale'); this.nuovoOrdine(); } });
  }

  // ---------- gli imbucati che sbucano (dal secondo atto) ----------
  aggiornaSbuca(dt) {
    const A = this.atto;
    if (!A.sbuca || this.stato !== 'ordine') return;
    if (this.sbuca) {
      this.sbuca.t -= dt;
      const k = Math.max(0, this.sbuca.t / this.sbuca.tot), g = this.gAllarme;
      g.clear();
      g.fillStyle(0x1f1430, 0.85).fillCircle(0, 0, 12);
      g.lineStyle(3, k > 0.35 ? 0xffe14a : 0xff3b2f, 1).beginPath().arc(0, 0, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)).strokePath();
      if (this.sbuca.t <= 0) {
        // il Boni si gira e lo vede: è come una pizza sbagliata
        const m = this.sbuca.m;
        this.fineSbuca(false);
        scritta(this, 240, 108, 'TI HA VISTO!', { size: 14, color: '#ff3b2f', durata: 800, depth: 965 });
        this.sbaglio('visto', m);   // (scopre proprio lui)
      }
      return;
    }
    if (this.tSbuca == null) this.tSbuca = A.sbuca[0] + this.rSbuca() * (A.sbuca[1] - A.sbuca[0]);
    this.tSbuca -= dt;
    if (this.tSbuca > 0) return;
    this.tSbuca = null;
    const m = this.imbucati.find((x) => !x.scoperto);
    if (!m) return;
    // sbuca: dal nascondiglio a chiedere una fetta, o gli scivola il travestimento
    const tot = A.avviso;
    this.sbuca = { m, t: tot, tot, zona: { x: m.img.x, y: m.travestito ? m.img.y - 42 : m.img.y - 46 } };
    if (m.travestito) {
      this.tweens.add({ targets: m.trucco, y: m.trucco.y + 12, angle: m.trucco.angle + 28, duration: 160 });
      m.img.setTexture(`${m.id}_felice`);
    } else {
      m.img.setTexture(`${m.id}_felice`).setVisible(true);
      this.tweens.add({ targets: m.img, y: m.casa.y - 26, duration: 160, ease: 'Back.out' });
      if (m.nascondiglio === 'tovaglia') m.img.setDepth(35);
      this.sbuca.zona = { x: m.casa.x, y: m.casa.y - 60 };
    }
    m.fumetto = fumetto(this, Phaser.Math.Clamp(this.sbuca.zona.x, 70, 410), this.sbuca.zona.y - 20, caso(this.cfg.frasiImbucato), tot * 1000, 962);
    Audio.sfx('muovi');
    this.allarme.setVisible(true);
  }

  // un tocco (o G) rimanda giù l'imbucato che sbucava
  rimandaGiu() {
    if (!this.sbuca || !this.inCorso) return;
    Audio.sfx('pof');
    scritta(this, this.sbuca.zona.x, this.sbuca.zona.y - 10, 'GIÙ!', { size: 10, color: '#7dff9a', durata: 400, depth: 965 });
    this.fineSbuca(true);
  }

  fineSbuca(rimesso) {
    const S = this.sbuca;
    this.allarme.setVisible(false);
    this.sbuca = null;
    if (!S) return;
    const m = S.m;
    m.fumetto?.destroy();
    if (!rimesso) return;
    m.img.setTexture(`${m.id}_normale`);
    if (m.travestito) {
      const h = { x: T.posti[m.posto], y: Y_SEDUTI - 87 * TAGLIA };
      this.tweens.add({ targets: m.trucco, x: h.x, y: h.y, angle: m.travestito === 'maschera' ? 9 : 0, duration: 140 });
    } else this.tweens.add({ targets: m.img, y: m.casa.y, duration: 140, onComplete: () => { if (m.nascondiglio === 'tovaglia') m.img.setDepth(29); } });
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    const c = this.cfg, A = this.atto;
    // gli atti si annunciano
    const n = c.atti.indexOf(A);
    if (n !== this.nAtto) {
      if (this.nAtto != null && A.nome) { Audio.sfx('bonus'); scritta(this, 240, 132, A.nome, { size: 14, color: '#ffe14a', durata: 1000, depth: 966 }); }
      this.nAtto = n;
    }
    // il fuoco che balla e crepita
    this.tFuoco -= dt;
    if (this.tFuoco <= 0) { this.tFuoco = 0.12; this.kFuoco = (this.kFuoco + 1) % 3; this.fuoco.setTexture('fuoco' + this.kFuoco); }
    this.tCrepita -= dt;
    if (this.tCrepita <= 0) { this.tCrepita = 0.9 + Math.random() * 1.2; Audio.sfx('crepitio'); }
    // il pomodoro da tastiera: SPAZIO tenuto riempie gli spicchi uno dopo l'altro
    if (this.tastoSugo.isDown && this.stato === 'ordine') {
      this.tSugo = (this.tSugo ?? 0) - dt;
      if (this.tSugo <= 0) {
        this.tSugo = c.pomodoroTasto / (SETTORI * 2);
        const libera = [...Array(SETTORI * 2).keys()].find((k) => !this.celle.has(k));
        if (libera != null) this.sugoIn(libera);
      }
    }
    // il tempo per la pizza (terzo atto)
    const O = this.ordine;
    this.barraPizza.clear();
    if (O?.scadenza && this.stato === 'ordine') {
      const resto = O.scadenza - this.trascorso, k = Phaser.Math.Clamp(resto / O.durata, 0, 1), F = T.foglietto, y = F.y + F.h / 2 + 6;
      this.barraPizza.fillStyle(0x1f1430, 0.85).fillRoundedRect(F.x - F.w / 2, y - 3, F.w, 6, 3);
      this.barraPizza.fillStyle(k > 0.35 ? 0x7dff9a : 0xff6b5a, 1).fillRoundedRect(F.x - F.w / 2 + 1, y - 2, (F.w - 2) * k, 4, 2);
      if (resto <= 0) this.troppoLento();
    }
    this.aggiornaSbuca(dt);
    // l'HUD (solo quando cambia)
    const hud = `${this.punti}|${this.giuste}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(this.punti));
      this.testoPizze.setText(`PIZZE: ${this.giuste}/${this.obiettivo}`).setColor(this.giuste >= this.obiettivo ? '#7dff9a' : '#ffe14a');
    }
  }

  // (in Lampo, più corto, l'obiettivo è in proporzione)
  get obiettivo() { return Math.max(1, Math.round(this.cfg.obiettivoPizze * Math.min(1, this.durata / this.cfg.durata))); }

  alRientro() { this.pennello = null; if (this.trascina) { this.trascina.img.destroy(); this.trascina = null; } }

  risultato() {
    const c = this.cfg, scoperti = this.scoperti.length, fuori = scoperti >= 2;
    const punteggio = fuori ? Math.min(Math.round(this.punti), c.maxScoperti) : Math.round(this.punti);
    return {
      punteggio,
      vittoria: !fuori && this.giuste >= this.obiettivo,
      riepilogo: `Pizze giuste ${this.giuste}, imbucati scoperti ${scoperti}` + (this.ananas ? `, ${quanti(this.ananas, 'ananas', 'ananas')}!` : ''),
    };
  }

  // Vittoria: il Boni a tavola, contento, con la pizza fumante; sotto la tovaglia gli imbucati si
  // passano una fetta e fanno l'occhiolino. Sconfitta: FUORI TUTTI!, il Boni li caccia con la pala.
  finale(ris, fatto) {
    this.fineSbuca(false);
    for (const o of [this.pasta, this.gSugo, this.gPezzi, this.foglio, this.barraPizza, this.testoPunti, this.testoPizze, this.allarme, this.gSel, ...Object.values(this.bottoni).flatMap((b) => [b.g, b.t]), ...this.faccine.flatMap((f) => [f.f, f.croce])]) o.setVisible(false);
    this.trascina?.img.destroy();
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.45, duration: 300 });
    const titolo = (s, col) => txt(this, 240, 24, s, { size: 18, color: col, depth: 980 });
    const B = this.boni.setDepth(720);
    this.tweens.killTweensOf(B);
    for (const o of [this.tavola, this.caraffa, ...this.invitati.map((v) => v.img)]) o.setDepth(o === this.tavola ? 712 : 710);
    this.time.delayedCall(450, () => {
      if (ris.vittoria) {
        Audio.sfx('vittoria');
        titolo('CHE CENA!', '#7dff9a');
        B.setTexture('boni_felice').setFlipX(false).setPosition(T.tavola.x0 + 70, Y_SEDUTI + 4).setScale(scalaDi('boni_felice', 0.62)).setDepth(711);
        const pz = im(this, T.tavola.x0 + 70, T.tavola.y + 4, 'pizzaCotta', 0.5).setDepth(713);
        pz.setScale(pz.scaleX, pz.scaleY * 0.5);
        this.time.addEvent({ delay: 260, repeat: 10, callback: () => fumo(this, pz.x + (Math.random() - 0.5) * 16, pz.y - 6, 1, 714, 0xeeeeee) });
        this.invitati.forEach((v) => v.img.setTexture(`${v.id}_felice`));
        // sotto la tovaglia: gli imbucati (quelli non scoperti) si passano la fetta e fanno l'occhiolino
        const sotto = this.imbucati.filter((m) => !m.scoperto);
        sotto.forEach((m, k) => {
          m.trucco?.setVisible(false);
          const x = T.tavola.x0 + 112 + k * 46, f = this.add.container(x, T.tavola.y + 40, [ritratto(this, 0, 0, m.id, 22, 'occhiolino')]).setDepth(715).setScale(0);
          this.tweens.add({ targets: f, scale: 1, delay: 300 + k * 200, duration: 220, ease: 'Back.out' });
          m.img.setVisible(false);
        });
        if (sotto.length) {
          const fetta = im(this, T.tavola.x0 + 112, T.tavola.y + 44, 'fettaPizza', 0.8).setDepth(716).setAlpha(0);
          this.tweens.add({ targets: fetta, alpha: 1, x: T.tavola.x0 + 112 + (sotto.length > 1 ? 46 : 20), delay: 800, duration: 700, yoyo: true, repeat: 1, ease: 'Sine.inOut' });
        }
        stelle(this, 240, 120, 8, 990);
      } else {
        Audio.sfx('sconfitta');
        titolo('FUORI TUTTI!', '#ff6b5a');
        // il Boni insegue Oli e il Sego fuori dalla taverna, agitando la pala
        const tutti = this.imbucati;
        tutti.forEach((m) => { m.trucco?.destroy(); m.trucco = null; m.img.setVisible(true).setTexture(`${m.id}_shock`).setDepth(717); });
        tutti.forEach((m, k) => m.img.setPosition(T.tavola.x0 + 20 + k * 30, Y_SEDUTI + 14));
        B.setTexture('boni_caccia').setFlipX(false).setDepth(716).setPosition(T.tavola.x0 - 40, T.boni.y);
        Audio.sfx('ruggito');
        this.tweens.add({ targets: B, x: T.porta.x - 30, duration: 1400, ease: 'Sine.in', onUpdate: () => B.setAngle(Math.sin(this.time.now / 70) * 5) });
        this.cacciaFuori(tutti, null);
        this.invitati.forEach((v) => v.img.setTexture(`${v.id}_shock`));
        this.time.delayedCall(500, () => fumetto(this, 230, 120, 'E NON TORNATE!', 1600, 990));
      }
    });
    this.time.delayedCall(3400, fatto);
  }
}
