// Microgioco 4: "Il Panino di Marsupino" - al bar del Pallaio, Marsupino fa i panini. IMPILA!
//
//  Ispirato a Papa's Burgeria e a Stack (scheda 2: "la grafica è da rivedere, da migliorare la
//  fluidità: ispirati a giochi esistenti; il Pallaio come ambientazione"). Al bar del Pallaio un
//  cliente ordina un panino (il biglietto in alto: gli ingredienti dal basso in alto). Marsupino,
//  dietro il tavolone, va avanti e indietro con l'ingrediente sopra la testa: quando è sopra al
//  panino, clic / tocco / SPAZIO e lo lascia cadere. Più cade al centro, più vale (PERFETTO, BUONO,
//  STORTO); storto, la pila si sposta e il prossimo va centrato sulla nuova cima, come in Stack.
//  Fuori dal panino: cade sulla tovaglia e va ripreso. Se la pila pende troppo, CROLLA e si
//  ricomincia l'ordine. Ogni tanto Marsupino ha in mano una schifezza (calzino, lisca, ghiaccio,
//  ciabatta) o l'ingrediente sbagliato: NON va lasciata, dopo un attimo la cambia. Finito l'ordine,
//  il pane di sopra, e il panino va al cliente.
//  Tre atti: si comincia piano; ORDINI DA QUATTRO! (più veloce, e le schifezze); MARSUPINO SI
//  ARRABBIA! (ordini da cinque, e va avanti e indietro a scatti).
//  Ordini, clienti e cosa ha in mano sono uguali per tutti i giocatori del round (seme).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { CONFIG } from '../config.js';
import { casuale } from '../grafica/base.js';
import { ritratto } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumo, pannello, scuoti, lerp, caso, quanti, colpetto, fumetto, vibra, puntiHud, numero } from '../fx.js';

const Y_TAVOLA = 222;                   // dove inizia il tavolone (la texture 'tavolaPallaio')
const Y_PANE = 236;                     // dove appoggia il pane sulla tovaglia
const X_PANE = 240;
const H_PANE = 8;                       // altezza della mollica sopra la tovaglia
const Y_MARS = 236, TAGLIA_MARS = 1.05; // Marsupino, dietro al tavolone
const Y_MANO = 74;                      // l'ingrediente sopra la sua testa
const INGREDIENTI = ['prosciutto', 'wurstel', 'sottiletta', 'ketchup', 'maionese'];
const BIGLIETTO = { x: 254, y: 30, passo: 36 };   // il biglietto dell'ordine, in alto: centro e passo tra le icone
const SBAGLIATI = ['calzino', 'lisca', 'ghiaccio', 'ciabatta'];
const SPESSORE = { prosciutto: 4, wurstel: 5.5, sottiletta: 3, ketchup: 3, maionese: 3, sopra: 12 };

export class PaninoScene extends MicrogiocoBase {
  constructor() { super('panino'); }

  get atto() { return this.cfg.atti.filter((a) => this.trascorso >= a.da).pop(); }

  prepara() {
    const seme = Sessione.seme;
    this.rnd = casuale(seme);
    this.semeOrdini = seme;
    this.nOrdine = 0;
    this.nAtto = 0;
    this.punti = 0;
    this.panini = 0;
    this.presi = 0;
    this.perfetti = 0;
    this.mancati = 0;
    this.crolli = 0;
    this.schifezze = 0;
    this.fase = 0;            // l'andirivieni di Marsupino (radianti)
    this.stato = 'attesa';    // 'pronto' (ha in mano qualcosa) | 'cade' | 'attesa' (tra un pezzo e l'altro) | 'aspetta' (panino nuovo)
    this.tAttesa = 0.6;
    this.tCambio = 0;         // con la schifezza in mano: tra quanto la cambia
    this.tFrase = 5;
    this.tEspr = 0;
    this.dopo = null;
    this.hud = null;          // (la scena viene riusata: l'HUD va riscritto da capo)
    this.inMano = null;

    im(this, 0, 0, 'bgPallaioBar').setOrigin(0);
    this.mars = im(this, 240, Y_MARS, 'marsupino_normale', TAGLIA_MARS).setOrigin(0.5, 1).setDepth(5);
    im(this, 0, Y_TAVOLA, 'tavolaPallaio').setOrigin(0).setDepth(10);
    // la guida: una riga tratteggiata dal pezzo in mano alla cima della pila (aiuta a mirare)
    this.guida = this.add.graphics().setDepth(25);

    // l'ordine del cliente, in alto: la sua faccia e il biglietto con gli ingredienti in fila
    // (da sinistra a destra = dal basso in alto); il prossimo sul tondo giallo, i fatti con la spunta
    this.hudPanino = [pannello(this, BIGLIETTO.x, BIGLIETTO.y, 214, 34, { depth: 1000 })];
    this.fondoProssimo = this.add.graphics().setDepth(1001);
    this.hudPanino.push(this.fondoProssimo);
    this.icone = [0, 1, 2, 3, 4].map((i) => {
      const x = BIGLIETTO.x + (i - 2) * BIGLIETTO.passo;
      const icona = im(this, x, BIGLIETTO.y, 'pan_prosciutto', 1).setDepth(1002);
      const spunta = this.add.graphics().setDepth(1003).setPosition(x + 9, BIGLIETTO.y + 7);
      spunta.lineStyle(2.6, 0x1f1430, 1).beginPath().moveTo(-3.5, 0).lineTo(-1, 2.5).lineTo(4, -3.5).strokePath();
      spunta.lineStyle(1.4, 0x7dff9a, 1).beginPath().moveTo(-3.5, 0).lineTo(-1, 2.5).lineTo(4, -3.5).strokePath();
      const freccia = i ? txt(this, x - BIGLIETTO.passo / 2, BIGLIETTO.y, '›', { size: 9, color: '#ffe14a', depth: 1002 }) : null;
      this.hudPanino.push(icona, spunta, ...(freccia ? [freccia] : []));
      return { icona, spunta, freccia, scala: icona.scaleX };
    });
    this.anello = this.add.graphics().setDepth(1002);
    this.hudPanino.push(this.anello);
    this.tweens.add({ targets: this.anello, alpha: 0.35, duration: 260, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: this.fondoProssimo, alpha: 0.55, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });
    this.testoPanini = txt(this, 474, 49, '', { ox: 1, depth: 1001, size: 8, color: '#ffe14a' });
    this.hudPanino.push(this.testoPunti, this.testoPanini);
    this.nuovoOrdine();
    this.nuovoPane();

    // comandi: clic, tocco o SPAZIO (anche INVIO / freccia giù) per lasciarlo cadere
    this.input.on('pointerdown', () => this.lascia());
    for (const t of ['SPACE', 'ENTER', 'DOWN']) this.input.keyboard.on('keydown-' + t, (e) => { if (!e.repeat) this.lascia(); });
  }

  // L'ordine nuovo: il cliente (un personaggio a caso, non chi gioca) e la ricetta, lunga quanto dice
  // l'atto. Dipende solo dal seme e da quale ordine è: tutti trovano gli stessi.
  nuovoOrdine() {
    const r = casuale((this.semeOrdini ^ (0x9e3779b1 * (this.nOrdine + 1))) >>> 0);
    const lunga = this.atto.ricetta ?? 5, lista = INGREDIENTI.map((k) => [r(), k]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).slice(0, lunga);
    const io = this.giocatore.id.replace(DOPPIONE, ''), tutti = CONFIG.personaggiGiocabili.map((g) => g.id).filter((id) => id !== io && id !== 'marsupino');
    this.nOrdine++;
    this.ordine = { lista, cliente: tutti[Math.floor(r() * tutti.length)], inizio: this.trascorso };
    this.faccia?.destroy();
    this.faccia = ritratto(this, BIGLIETTO.x - 126, BIGLIETTO.y, this.ordine.cliente, 30).setDepth(1001);
    colpetto(this, this.faccia, 1.3, 1.3);
    // il cliente che aspetta, seduto al tavolino verde in fondo
    this.cliente?.destroy();
    this.cliente = im(this, 404, 168, `${this.ordine.cliente}_normale`, 0.42).setOrigin(0.5, 1).setDepth(3);
    if (this.strati) this.aggiornaRicetta();
  }

  get fatti() { return this.strati.length; }
  // quello che serve adesso: un ingrediente dell'ordine, o il pane di sopra alla fine
  get prossimo() { return this.ordine.lista[this.fatti] ?? 'sopra'; }

  // pane nuovo (fondo): l'ordine resta, si ricomincia dal primo ingrediente
  nuovoPane() {
    this.strati = [];
    this.cimaX = 0;           // la cima della pila, rispetto al centro del pane (si sposta coi pezzi storti)
    this.inizioPanino = this.trascorso;
    this.pila?.destroy();
    this.pila = this.add.container(X_PANE, Y_PANE).setDepth(30);
    this.pila.add(this.add.ellipse(0, 1, 50, 6, 0x000000, 0.2));
    const pane = im(this, 0, 1, 'paneSotto').setOrigin(0.5, 1);
    this.pila.add(pane);
    this.tweens.add({ targets: pane, scale: { from: pane.scale * 0.4, to: pane.scale }, duration: 180, ease: 'Back.out' });
    if (this.icone) this.aggiornaRicetta();
  }

  get altezza() { return H_PANE + this.strati.reduce((h, s) => h + s.sp, 0); }

  aggiornaRicetta() {
    const L = this.ordine.lista, { x: xc, y, passo } = BIGLIETTO, x0 = xc - ((L.length - 1) * passo) / 2;
    this.icone.forEach((o, i) => {
      const k = L[i], c = !!k;
      o.icona.setVisible(c); o.spunta.setVisible(c && i < this.fatti); o.freccia?.setVisible(c);
      if (!c) return;
      const x = x0 + i * passo, prossimo = i === this.fatti;
      this.tweens.killTweensOf(o.icona);
      o.icona.setTexture('pan_' + k).setPosition(x, y).setScale(o.scala * (prossimo ? 1.3 : i < this.fatti ? 0.85 : 1)).setAlpha(i <= this.fatti ? 1 : 0.5);
      o.spunta.setPosition(x + 9, y + 7);
      o.freccia?.setPosition(x - passo / 2, y);
    });
    this.anello.clear();
    this.fondoProssimo.clear();
    if (this.fatti < L.length) {
      const x = x0 + this.fatti * passo;
      this.fondoProssimo.fillStyle(0xffe14a, 0.45).fillCircle(x, y, 16);
      this.anello.lineStyle(2.2, 0xffe14a, 1).strokeCircle(x, y, 16.5);
    }
  }

  aggiorna(dt) {
    const c = this.cfg, A = this.atto, n = c.atti.indexOf(A);
    if (n !== this.nAtto) {
      this.nAtto = n;
      if (A.nome) {
        Audio.sfx('bonus');
        scritta(this, 240, 110, A.nome, { size: 14, color: '#ffe14a', durata: 1000, depth: 1005 });
        if (A.scatti) this.espressione('rabbia', 1);
      }
    }
    // Marsupino va avanti e indietro (nell'ultimo atto a scatti: ora svelto, ora piano)
    const vel = A.vel * (A.scatti ? 1 + A.scatti * Math.sin(this.trascorso * 2.3) : 1);
    this.fase += vel * dt;
    this.mars.x = X_PANE + Math.sin(this.fase) * c.corsa;
    this.mars.y = Y_MARS - Math.abs(Math.sin(this.fase * 4)) * 1.5;

    if (this.stato === 'attesa') {
      this.tAttesa -= dt;
      if (this.tAttesa <= 0) this.prendiInMano();
    } else if (this.stato === 'pronto' && this.inMano) {
      this.inMano.setPosition(this.mars.x, Y_MANO + Math.sin(this.trascorso * 6) * 1.2);
      if (this.inMano.sbagliato) {
        this.tCambio -= dt;
        if (this.tCambio <= 0) this.cambia();
      }
    }
    this.disegnaGuida();
    this.umore(dt);
    const hud = `${this.punti}|${this.panini}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(this.punti));
      this.testoPanini.setText(`PANINI: ${this.panini}/${c.obiettivoPanini}`).setColor(this.panini >= c.obiettivoPanini ? '#7dff9a' : '#ffe14a');
    }
  }

  // il pezzo nuovo in mano a Marsupino: quello che serve, oppure (dal secondo atto) una schifezza o un
  // altro ingrediente, da NON lasciare. Pescato col seme: uguale per tutti
  prendiInMano() {
    const A = this.atto, r = this.rnd, serve = this.prossimo;
    let tipo = serve, sbagliato = false;
    const giusto = this.forzaGiusto;
    this.forzaGiusto = false;
    if (!giusto && serve !== 'sopra' && this.fatti > 0 && r() < A.sbagliati) {
      sbagliato = true;
      tipo = r() < 0.6 ? SBAGLIATI[Math.floor(r() * SBAGLIATI.length)] : caso(INGREDIENTI.filter((k) => k !== serve));
    }
    const key = tipo === 'sopra' ? 'paneSopra' : 'pan_' + tipo;
    this.inMano = im(this, this.mars.x, Y_MANO, key, 1.25).setDepth(26);
    this.inMano.tipo = tipo;
    this.inMano.sbagliato = sbagliato;
    this.tCambio = this.cfg.tempoSbagliato;
    this.stato = 'pronto';
    this.inMano.setScale(this.inMano.scaleX);
    this.tweens.add({ targets: this.inMano, scale: { from: this.inMano.scaleX * 0.5, to: this.inMano.scaleX }, duration: 160, ease: 'Back.out' });
    if (sbagliato) this.mars.setTexture('marsupino_felice');
  }

  // Marsupino si accorge della schifezza e la butta: al suo posto quello che serve
  cambia() {
    const vecchio = this.inMano;
    this.tweens.add({ targets: vecchio, x: vecchio.x + 80, y: vecchio.y - 30, angle: 300, alpha: 0, duration: 380, onComplete: () => vecchio.destroy() });
    fumo(this, vecchio.x, vecchio.y, 3, 27);
    Audio.sfx('pof');
    this.inMano = null;
    this.stato = 'attesa';
    this.tAttesa = 0.15;
    this.forzaGiusto = true;   // (la prossima pesca dà quello che serve)
  }

  // la riga tratteggiata dal pezzo alla cima della pila: verde quando è centrato
  disegnaGuida() {
    const g = this.guida;
    g.clear();
    if (this.stato !== 'pronto' || !this.inMano) return;
    const x = this.inMano.x, cima = X_PANE + this.cimaX, d = Math.abs(x - cima), f = this.cfg.finestre;
    const col = d <= f.perfetto ? 0x7dff9a : d <= f.buono ? 0xffe14a : 0xffffff;
    g.lineStyle(1.2, col, d <= f.buono ? 0.9 : 0.35);
    for (let y = Y_MANO + 12; y < Y_PANE - this.altezza - 4; y += 8) g.lineBetween(x, y, x, y + 4);
  }

  // clic / tocco / SPAZIO: Marsupino lascia cadere quello che ha in mano
  lascia() {
    if (!this.inCorso || this.stato !== 'pronto' || !this.inMano) return;
    const o = this.inMano, c = this.cfg;
    this.inMano = null;
    this.stato = 'cade';
    Audio.sfx('lancio');
    const cimaY = Y_PANE - this.altezza, tempo = ((cimaY - o.y) / c.velCaduta) * 1000;
    this.tweens.add({ targets: o, y: cimaY - 3, angle: Phaser.Math.Between(-20, 20), duration: tempo, ease: 'Quad.in', onComplete: () => this.atterra(o) });
  }

  atterra(o) {
    const c = this.cfg, f = c.finestre, d = o.x - (X_PANE + this.cimaX), ad = Math.abs(d);
    if (o.sbagliato) return this.schifezza(o);
    if (ad > f.storto) return this.mancato(o, d);
    // dentro: la qualità del colpo
    const voto = ad <= f.perfetto ? 'perfetto' : ad <= f.buono ? 'buono' : 'storto';
    const pt = c.punti[voto];
    this.punti += pt;
    this.presi++;
    if (voto === 'perfetto') this.perfetti++;
    // come in Stack: il pezzo resta dove è caduto (la cima si sposta); il perfetto si centra da solo
    const dx = voto === 'perfetto' ? this.cimaX : this.cimaX + d * c.spostamento;
    const sp = SPESSORE[o.tipo], h = this.altezza;
    o.destroy();
    const img = im(this, dx, -h - (o.tipo === 'sopra' ? 0 : sp / 2) + 1, o.tipo === 'sopra' ? 'paneSopra' : 'strato_' + o.tipo);
    if (o.tipo === 'sopra') img.setOrigin(0.5, 20.5 / 22);
    img.setAngle(voto === 'storto' ? Math.sign(d) * 6 : 0);
    this.pila.add(img);
    this.tweens.add({ targets: img, scaleY: { from: img.scaleY * 0.6, to: img.scaleY }, duration: 140, ease: 'Back.out' });
    this.strati.push({ tipo: o.tipo, img, sp, x: dx });
    this.cimaX = dx;
    Audio.sfx(voto === 'perfetto' ? 'bonus' : 'ding');
    const colore = { perfetto: '#7dff9a', buono: '#ffe14a', storto: '#ffb36b' }[voto];
    scritta(this, X_PANE + dx, Y_PANE - this.altezza - 16, `${voto.toUpperCase()}! +${pt}`, { size: voto === 'perfetto' ? 11 : 9, color: colore, durata: 550 });
    if (voto === 'perfetto') stelle(this, X_PANE + dx, Y_PANE - this.altezza, 5, 40);
    if (voto === 'storto') this.espressione('shock', 0.4);
    // troppo storto in tutto: crolla
    if (Math.abs(this.cimaX) > c.crollo) return this.crolla();
    if (o.tipo === 'sopra') return this.servi();
    this.aggiornaRicetta();
    this.prossimoPezzo();
  }

  prossimoPezzo() {
    this.stato = 'attesa';
    this.tAttesa = this.cfg.attesa;
  }

  // fuori dal panino: cade sulla tovaglia, e Marsupino ne prende un altro uguale
  mancato(o, d) {
    const c = this.cfg;
    this.mancati++;
    this.punti = Math.max(0, this.punti - c.malusMancato);
    Audio.sfx('splat');
    scritta(this, o.x, Y_PANE - 30, `FUORI! -${c.malusMancato}`, { size: 9, color: '#ff6b5a', durata: 550 });
    this.tweens.add({ targets: o, x: o.x + Math.sign(d) * 30, y: Y_PANE, angle: Math.sign(d) * 160, duration: 260, ease: 'Quad.in', onComplete: () => this.tweens.add({ targets: o, alpha: 0, duration: 300, onComplete: () => o.destroy() }) });
    this.espressione('rabbia', 0.6);
    if (Math.random() < 0.5) fumetto(this, this.mars.x + 50, 62, caso(c.urla), 800, 40);
    this.prossimoPezzo();
  }

  // ha lasciato cadere la schifezza: panino da buttare (l'ordine resta)
  schifezza(o) {
    const c = this.cfg;
    this.schifezze++;
    this.punti = Math.max(0, this.punti - c.malusSbagliato);
    o.destroy();
    Audio.sfx('bleah');
    vibra(50);
    scritta(this, X_PANE, Y_PANE - this.altezza - 26, `BLEAH! -${c.malusSbagliato}`, { size: 12, color: '#ff6b5a', durata: 700 });
    fumetto(this, this.mars.x + 50, 62, caso(c.frasiSbaglio), 1000, 40);
    this.espressione('rabbia', 0.8);
    this.buttaPanino();
  }

  // la pila pende troppo e crolla: si ricomincia l'ordine
  crolla() {
    const c = this.cfg, verso = Math.sign(this.cimaX) || 1;
    this.crolli++;
    this.punti = Math.max(0, this.punti - c.malusCrollo);
    Audio.sfx('splat');
    vibra(50);
    scritta(this, X_PANE, Y_PANE - this.altezza - 26, `CROLLA! -${c.malusCrollo}`, { size: 12, color: '#ff6b5a', durata: 700 });
    this.espressione('shock', 0.6);
    this.buttaPanino(verso);
  }

  buttaPanino(verso = 1) {
    const pila = this.pila;
    this.pila = null;
    this.tweens.add({ targets: pila, x: pila.x + verso * 60, angle: verso * 70, alpha: 0, duration: 420, ease: 'Quad.in', onComplete: () => pila.destroy() });
    this.time.delayedCall(250, () => { if (this.inCorso) { this.nuovoPane(); this.prossimoPezzo(); } });
    this.stato = 'aspetta';
  }

  // ordine finito: il panino vola al cliente, punti e un ordine nuovo
  servi() {
    const c = this.cfg, n = this.panini, rapido = this.trascorso - this.ordine.inizio < c.secondiRapido;
    const pt = c.puntiPanino + c.crescitaPanino * n * n + (rapido ? c.bonusRapido : 0);
    this.panini++;
    this.punti += pt;
    Audio.sfx('conquista');
    stelle(this, X_PANE, Y_PANE - 30, 10, 40);
    scritta(this, X_PANE, 120, `SERVITO! +${pt}` + (rapido ? ' VELOCE!' : ''), { size: 13, color: '#7dff9a', durata: 900, depth: 1005 });
    fumetto(this, this.mars.x + 50, 62, caso(c.frasiPanino), 900, 40);
    this.espressione('felice', 0.8);
    const pila = this.pila, cl = this.cliente;
    this.pila = null;
    this.tweens.add({ targets: pila, x: cl.x, y: cl.y - 10, scale: 0.4, duration: 450, ease: 'Quad.inOut', onComplete: () => {
      pila.destroy();
      if (cl.active) { cl.setTexture(`${this.ordine.cliente}_felice`); Audio.sfx('gnam'); }
    } });
    this.stato = 'aspetta';
    this.time.delayedCall(600, () => {
      if (!this.inCorso) return;
      this.nuovoOrdine();
      this.nuovoPane();
      this.prossimoPezzo();
    });
  }

  espressione(e, sec, poi, secPoi) {
    this.mars.setTexture('marsupino_' + e);
    this.tEspr = sec;
    this.dopo = poi ? [poi, secPoi] : null;
  }

  umore(dt) {
    if (this.tEspr > 0) {
      this.tEspr -= dt;
      if (this.tEspr <= 0) {
        if (this.dopo) this.espressione(...this.dopo);
        else this.mars.setTexture('marsupino_normale');
      }
    }
    this.tFrase -= dt;
    if (this.tFrase <= 0) {
      this.tFrase = 5 + Math.random() * 3;
      fumetto(this, Phaser.Math.Clamp(this.mars.x + 50, 60, 420), 62, caso(this.cfg.frasi), 1100, 40);
    }
  }

  risultato() {
    return {
      punteggio: Math.max(0, this.punti),
      vittoria: this.panini >= this.cfg.obiettivoPanini,
      riepilogo: `${quanti(this.panini, 'ordine servito', 'ordini serviti')}, ${quanti(this.perfetti, 'perfetto', 'perfetti')} su ${this.presi}, ${quanti(this.crolli, 'crollo', 'crolli')}, ${quanti(this.schifezze, 'schifezza', 'schifezze')}`,
    };
  }

  // Marsupino addenta il panino (o lo guarda schifato)
  finale(ris, fatto) {
    for (const o of [this.inMano, ...this.hudPanino, this.pila, this.faccia, this.cliente].filter(Boolean)) o.setVisible(false);
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.7, duration: 300 });
    this.tweens.killTweensOf(this.mars);   // se stava ancora saltando di rabbia
    this.mars.setDepth(701).setAngle(0).setTexture('marsupino_normale');
    this.tweens.add({ targets: this.mars, x: 240, y: 268, scale: scalaDi('marsupino_normale', 1.75), duration: 400, ease: 'Back.out' });

    // il panino gigante davanti a lui
    const pan = this.add.container(240, 214).setDepth(702).setScale(0);
    pan.add(im(this, 0, 1, 'paneSotto').setOrigin(0.5, 1));
    let h = H_PANE;
    for (const k of INGREDIENTI) { pan.add(im(this, ris.vittoria ? 0 : Phaser.Math.Between(-7, 7), -h - SPESSORE[k] / 2, 'strato_' + k).setAngle(ris.vittoria ? 0 : Phaser.Math.Between(-12, 12))); h += SPESSORE[k]; }
    if (!ris.vittoria && this.schifezze) pan.add(im(this, 4, -h - 2, 'pan_calzino'));
    pan.add(im(this, ris.vittoria ? 0 : 6, -h + 1, 'paneSopra').setOrigin(0.5, 20.5 / 22).setAngle(ris.vittoria ? 0 : 14));
    this.tweens.add({ targets: pan, scale: 1.7, delay: 250, duration: 350, ease: 'Back.out' });

    this.time.delayedCall(800, () => {
      if (ris.vittoria) {
        this.mars.setTexture('marsupino_felice');
        txt(this, 240, 24, 'CHE BONTÀ!', { size: 18, color: '#7dff9a', depth: 710 });
        // tre morsi
        for (let i = 0; i < 3; i++) this.time.delayedCall(i * 520, () => {
          Audio.sfx('gnam');
          scritta(this, 240 + Phaser.Math.Between(-70, 70), 110 + Phaser.Math.Between(-20, 20), 'GNAM!', { size: 14, color: '#ffe14a', depth: 711 });
          this.tweens.add({ targets: pan, scaleX: pan.scaleX * 0.7, x: pan.x - 10, duration: 120 });
          for (let k = 0; k < 6; k++) {
            const b = this.add.ellipse(240 + Phaser.Math.Between(-30, 30), 190, 3, 2, 0xe8a64e).setDepth(703);
            this.tweens.add({ targets: b, x: b.x + Phaser.Math.Between(-40, 40), y: 262, duration: 500, ease: 'Quad.in', onComplete: () => b.destroy() });
          }
          if (i === 2) this.tweens.add({ targets: pan, alpha: 0, delay: 150, duration: 200, onComplete: () => stelle(this, 240, 150, 10, 712) });
        });
      } else {
        // lo assaggia con lo sguardo, e si infuria: salta, fuma dalle orecchie e spazza via il panino
        this.mars.setTexture('marsupino_rabbia');
        Audio.sfx('bleah');
        Audio.sfx('ruggito');
        const titolo = txt(this, 240, 24, 'MA CHE SCHIFO! RIFALLO!', { size: 18, color: '#ff3b2f', depth: 710 });
        this.tweens.add({ targets: titolo, x: { from: 237, to: 243 }, duration: 50, yoyo: true, repeat: 20 });
        const tonfo = () => { Audio.sfx('tonfo'); scuoti(this, 120, 0.008); };
        this.tweens.add({ targets: this.mars, y: 250, duration: 110, ease: 'Quad.out', yoyo: true, repeat: 3, onRepeat: tonfo, onComplete: tonfo });
        this.tweens.add({ targets: this.mars, angle: { from: -4, to: 4 }, duration: 55, yoyo: true, repeat: 22, onComplete: () => this.mars.setAngle(0) });
        this.time.addEvent({ delay: 120, repeat: 16, callback: () => { for (const s of [-1, 1]) fumo(this, 240 + s * 62, 114, 1, 705); } });
        this.tweens.add({ targets: pan, x: 540, y: 110, angle: 540, delay: 520, duration: 380, ease: 'Quad.in', onStart: () => Audio.sfx('schiaffo') });
      }
    });
    this.time.delayedCall(3300, fatto);
  }
}
