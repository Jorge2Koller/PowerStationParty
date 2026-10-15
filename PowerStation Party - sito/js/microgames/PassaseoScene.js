// Microgioco 10: "Il Passo del Passaseo" - la salita in bici, testa a testa col Passaseo. PEDALA!
//
//  Vista di fianco: la strada sale verso destra, tu e il Passaseo pedalate fino al traguardo in
//  cima. Si pedala A TEMPO: un pedale alla volta (FRECCE SINISTRA e DESTRA, o A e D; col dito o
//  col mouse la metà sinistra e la metà destra dello schermo), quando la pallina del ritmo, in
//  basso, arriva su quel pedale. Pedalate perfette = spinta piena; a caso = la catena gira a vuoto
//  e si rallenta. Il ritmo lo dà la strada: in salita regolare, prima dei TORNANTI rallenta (chi
//  ci arriva lanciato va LARGO e perde la velocità), sugli STRAPPI è lento e pesante (finestre più
//  strette), allo SPRINT finale va forte (e le pedalate perfette valgono doppio).
//  Tre atti, lungo la salita: LA SALITA (un tornante), I TORNANTI! (due tornanti e uno strappo),
//  STRAPPO E SPRINT! (lo strappo più duro, poi lo sprint fino al traguardo).
//  Il Passaseo va del suo passo, costante, uguale per tutti i giocatori del round (seme), e
//  arriva in cima tra arrivoPassaseo secondi: per batterlo bisogna pedalare quasi perfetti.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { CONFIG } from '../config.js';
import { casuale } from '../grafica/base.js';
import { ritratto, aspettoDi } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, pannello, lerp, caso, quanti, fumetto, vibra, eTouch, perDito, multiTouch, puntatore, puntiHud, numero } from '../fx.js';

const XP = 150, YP = 196;      // dove sta chi gioca sullo schermo (il punto della strada sotto le ruote)
const SCALA = 2.2;             // unità di schermo per metro, in orizzontale
const RIPIDO = 3.2;            // le pendenze si disegnano più ripide di così (6% vero -> 19% a schermo)
const RITMO = { x: 240, y: 248, mezza: 68 };   // la barra del ritmo, in basso (grande: si gioca guardando lei)
const BARRA = { x0: 140, x1: 340, y: 22 };     // la salita in alto: chi è dove
const col = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;

export class PassaseoScene extends MicrogiocoBase {
  constructor() { super('passaseo'); }

  prepara() {
    const c = this.cfg, seme = Sessione.seme;
    this.rnd = casuale(seme);
    this.costruisciSalita(casuale((seme ^ 0x5a1175) >>> 0));
    // chi gioca
    this.x = 0; this.v = 0; this.spinta = 0;
    this.fase = 0;                 // la fase del ritmo: ogni intero è una pedalata (pari = sinistra, dispari = destra)
    this.usata = -1;               // l'ultima pedalata (indice) già fatta
    this.tUltima = 0;              // da quanto non si pedala a tempo
    this.perfette = 0; this.buone = 0; this.vuoto = 0; this.serie = 0; this.larghi = 0;
    this.tArrivo = null;
    this.atto = 0; this.inSprint = false;
    this.tornantePreso = new Set();
    this.davanti = null;           // chi era davanti all'ultimo controllo (per le frasi del sorpasso)
    this.tFrase = 4;

    // lo sfondo: il cielo e le montagne fermi, le colline che scorrono piano, la strada disegnata
    im(this, 0, 0, 'bgMontagna').setOrigin(0).setDepth(0);
    this.colline = [0, 1].map(() => im(this, 0, 128, 'collineMontagna').setOrigin(0, 0).setDepth(1));
    this.gStrada = this.add.graphics().setDepth(10);
    this.cartelli = this.segni.map((s) => im(this, -100, 0, s.key, s.k ?? 1).setOrigin(0.5, 1).setDepth(s.davanti ? 30 : 9));
    // le due bici: il Passaseo un filo più in là (l'altra corsia), poi chi gioca
    const io = aspettoDi(this.giocatore.id), lui = aspettoDi('passaseo');
    this.ciclisti = [
      { id: 'passaseo', ...this.colori(lui, '#f2c43a'), g: this.add.graphics().setDepth(18), testa: this.testaDi('passaseo', 25).setDepth(19), dy: -5 },
      { id: this.giocatore.id, ...this.colori(io, this.giocatore.colore), g: this.add.graphics().setDepth(20), testa: this.testaDi(this.giocatore.id, 25).setDepth(21), dy: 0 },
    ];
    // il Passaseo fuori dallo schermo: sul bordo, la sua faccia con la freccia e il distacco
    this.indicatore = this.add.container(0, 0).setDepth(40).setVisible(false);
    this.gIndicatore = this.add.graphics();
    this.testoIndicatore = txt(this, 0, 11, '', { size: 8, color: '#ffe14a' });
    this.indicatore.add([this.gIndicatore, this.testaDi('passaseo', 18).setPosition(0, -5), this.testoIndicatore]);
    this.latoIndicatore = 0;

    // in alto: la salita col traguardo e le due facce; il distacco e la velocità
    pannello(this, 240, BARRA.y, 236, 18, { depth: 1000 });
    this.gBarra = this.add.graphics().setDepth(1001);
    this.facce = [this.testaDi('passaseo', 13).setPosition(0, BARRA.y).setDepth(1002), this.testaDi(this.giocatore.id, 13).setPosition(0, BARRA.y).setDepth(1003)];
    this.testoDistacco = txt(this, 474, 36, '', { size: 9, ox: 1, depth: 1001 });
    this.testoVel = txt(this, 474, 49, '', { size: 7, ox: 1, depth: 1001, color: '#fff3d6' });
    this.hud = '';

    // in basso: la barra del ritmo (la pallina va da un pedale all'altro) e, col dito, le due metà
    this.gRitmo = this.add.graphics().setDepth(1000);
    this.pedali = [im(this, RITMO.x - RITMO.mezza - 24, RITMO.y, 'pedaleSx', 0.9).setDepth(1001), im(this, RITMO.x + RITMO.mezza + 24, RITMO.y, 'pedaleDx', 0.9).setDepth(1001)];
    if (eTouch()) {
      for (const [x, k, s] of [[52, 'pedaleSx', 'SINISTRO'], [428, 'pedaleDx', 'DESTRO']]) {
        im(this, x, 232, k, 1).setDepth(1001).setAlpha(0.85);
        txt(this, x, 256, s, { size: 7, color: '#ffe14a', depth: 1001 });
      }
    }
    this.voto = txt(this, RITMO.x, RITMO.y - 22, '', { size: 9, depth: 1002 });

    // comandi
    const k = this.input.keyboard;
    for (const [tasti, lato] of [[['LEFT', 'A'], 0], [['RIGHT', 'D'], 1]]) for (const t of tasti) k.on('keydown-' + t, (e) => { if (!e.repeat) this.pedala(lato); });
    multiTouch(this);
    this.input.on('pointerdown', (p) => { if (this.inCorso) this.pedala(puntatore(this, p).x < 240 ? 0 : 1); });
    this.disegna(0);
  }

  // Una testa da spostare e ruotare intorno al suo centro. (ritratto() mette l'immagine col suo
  // angolo in alto a sinistra: spostata con setPosition, la testa finiva di lato e sembrava staccata)
  testaDi(id, lato) { return this.add.container(0, 0, [ritratto(this, 0, 0, id, lato)]); }

  // i colori di una bici: maglia, pantaloni, pelle, scarpe e telaio
  colori(p, telaio) {
    return { maglia: col(p.vestito?.colore ?? '#5a6070'), gambe: col(p.pantaloni ?? '#3a3c46'), corti: !!p.corti, pelle: col(p.pelle ?? '#e8b890'), scarpe: col(p.scarpe ?? '#2a2a30'), telaio: col(telaio) };
  }

  // ------------------------------------------------------------
  //  LA SALITA: i tratti, la sua forma, il passo del Passaseo
  // ------------------------------------------------------------
  // I tratti si scrivono in proporzione, poi la salita si allunga (o si accorcia) finché il
  // Passaseo, col suo passo, ci mette quanto deve (arrivoPassaseo, dal seme): così è giusta per
  // tutti e il traguardo si raggiunge in 35 secondi pedalando bene.
  costruisciSalita(r) {
    const c = this.cfg, T = [];
    const metti = (tipo, lungo) => T.push({ tipo, lungo });
    const tra = (a, b) => a + r() * (b - a);
    // primo atto: la salita, con un tornante
    metti('salita', tra(110, 150)); metti('tornante', c.lunghezze.tornante); metti('salita', tra(70, 100));
    const atto2 = T.length;
    // secondo atto: due tornanti e uno strappo (in un ordine che cambia)
    const pezzi = r() < 0.5 ? ['tornante', 'strappo', 'tornante'] : ['strappo', 'tornante', 'tornante'];
    for (const p of pezzi) { metti('salita', tra(45, 75)); metti(p, p === 'strappo' ? tra(55, 75) : c.lunghezze.tornante); }
    metti('salita', tra(40, 60));
    const atto3 = T.length;
    // terzo atto: lo strappo più duro, un po' di respiro, lo sprint
    metti('strappo', tra(85, 110)); metti('salita', tra(45, 65)); metti('sprint', c.lunghezze.sprint);
    // il Passaseo: il suo passo dal seme, e quanto ci mette così com'è
    this.passo = c.passoPassaseo[0] + this.rnd() * (c.passoPassaseo[1] - c.passoPassaseo[0]);
    const voluto = c.arrivoPassaseo[0] + this.rnd() * (c.arrivoPassaseo[1] - c.arrivoPassaseo[0]);
    const posa = (k) => { let x = 0; for (const t of T) { t.da = x; x += t.lungo * k; t.a = x; } return x; };
    this.tratti = T;
    let k = 1;
    for (let i = 0; i < 3; i++) { this.lunghezza = posa(k); k *= voluto / this.simulaPassaseo().t; }
    this.lunghezza = posa(k);
    this.atti = [0, T[atto2].da, T[atto3].da];
    const S = this.simulaPassaseo();
    this.corsaPassaseo = S.punti; this.arrivoPassaseo = S.t;
    // la quota (per disegnare la pendenza): metri saliti a ogni inizio di tratto
    let q = 0;
    for (const t of T) { t.q = q; q += (t.a - t.da) * c.pendenze[t.tipo]; }
    // i cartelli: prima di ogni tornante e di ogni strappo; gli striscioni dello sprint e del traguardo
    this.segni = [];
    for (const t of T) {
      if (t.tipo === 'tornante') this.segni.push({ x: t.da - c.avvicinamento, key: 'cartelloTornante' });
      if (t.tipo === 'strappo') this.segni.push({ x: t.da - 12, key: 'cartelloStrappo' });
      if (t.tipo === 'sprint') this.segni.push({ x: t.da, key: 'striscioneSprint', k: 0.7, arco: true, davanti: true });
    }
    this.segni.push({ x: this.lunghezza, key: 'striscioneArrivo', k: 0.7, arco: true, davanti: true });
  }

  // il tratto in un punto della salita; "ritmo" è quello che detta la cadenza (prima di un
  // tornante si rallenta già: l'avvicinamento)
  trattoIn(x) {
    const T = this.tratti;
    let t = T[T.length - 1];
    for (const u of T) if (x < u.a) { t = u; break; }
    const prossimo = T[T.indexOf(t) + 1];
    const ritmo = t.tipo === 'salita' && prossimo?.tipo === 'tornante' && prossimo.da - x < this.cfg.avvicinamento ? 'tornante' : t.tipo;
    return { t, ritmo };
  }

  quota(x) {
    const { t } = this.trattoIn(Phaser.Math.Clamp(x, 0, this.lunghezza));
    const base = t.q + (Phaser.Math.Clamp(x, t.da, t.a) - t.da) * this.cfg.pendenze[t.tipo];
    return x < 0 ? x * this.cfg.pendenze.salita : x > this.lunghezza ? base + (x - this.lunghezza) * 0.01 : base;
  }

  // il Passaseo: va a "passo" di chi pedala perfetto, cambiando velocità con dolcezza
  simulaPassaseo() {
    const c = this.cfg, dt = 1 / 30, punti = [{ t: 0, x: 0 }];
    let x = 0, v = 0, t = 0;
    while (x < this.lunghezza && t < 120) {
      const vt = c.vel[this.trattoIn(x).ritmo] * this.passo;
      v += (vt - v) * Math.min(1, dt * (vt > v ? c.accelera : c.frena));
      x += v * dt; t += dt;
      punti.push({ t, x: Math.min(x, this.lunghezza) });
    }
    return { t, punti };
  }

  xPassaseo(t) {
    const P = this.corsaPassaseo, i = Math.min(P.length - 1, Math.floor(t * 30));
    return i >= P.length - 1 ? this.lunghezza : lerp(P[i].x, P[i + 1].x, t * 30 - i);
  }

  // ------------------------------------------------------------
  //  PEDALARE
  // ------------------------------------------------------------
  get cadenza() { return this.cfg.cadenza[this.trattoIn(this.x).ritmo]; }

  // una pedalata (0 = sinistra, 1 = destra): la si confronta con la battuta più vicina di quel lato
  pedala(lato) {
    if (!this.inCorso || this.tArrivo != null) return;
    const c = this.cfg, cad = this.cadenza, f = this.fase, n0 = Math.floor(f), dopo = (n0 + 1 - f) / cad, prima = (f - n0) / cad;
    let n = null, err = Infinity;
    for (const [m, e] of [[n0, prima], [n0 + 1, dopo]]) if (m % 2 === lato && m > this.usata && e < err) { n = m; err = e; }
    const k = this.trattoIn(this.x).ritmo === 'strappo' ? c.finestraStrappo : 1;
    const voto = n == null ? 'vuoto' : err <= c.finestre.perfetta * k ? 'perfetta' : err <= c.finestre.buona * k ? 'buona' : 'vuoto';
    const q = c.potenza[voto];
    this.spinta = Phaser.Math.Clamp(this.spinta + (q - this.spinta) * c.spinta.presa, 0, 1);
    this.pedali[lato].setScale(scalaDi(lato ? 'pedaleDx' : 'pedaleSx', 0.62) * 1.25);
    this.tweens.add({ targets: this.pedali[lato], scale: scalaDi(lato ? 'pedaleDx' : 'pedaleSx', 0.62), duration: 120 });
    if (voto === 'vuoto') {
      this.vuoto++; this.serie = 0;
      Audio.sfx('vuoto');
      this.mostraVoto('A VUOTO', '#ff9a8a');
      return;
    }
    this.usata = n;
    this.tUltima = 0;
    this.serie++;
    if (voto === 'perfetta') { this.perfette += this.inSprint ? 2 : 1; Audio.sfx('muovi'); this.mostraVoto(this.inSprint ? 'PERFETTA x2' : 'PERFETTA', '#7dff9a'); }
    else { this.buone++; this.mostraVoto('BUONA', '#9af0ff'); }
    if (this.serie > 0 && this.serie % 12 === 0) { Audio.sfx('ok'); scritta(this, XP + 30, YP - 74, `${this.serie} DI FILA!`, { size: 9, color: '#ffe14a', durata: 500 }); }
  }

  mostraVoto(s, colore) {
    this.voto.setText(s).setColor(colore).setAlpha(1);
    this.tweens.killTweensOf(this.voto);
    this.tweens.add({ targets: this.voto, alpha: 0, delay: 250, duration: 250 });
  }

  aggiorna(dt) {
    const c = this.cfg;
    if (this.tArrivo == null) {
      const { t, ritmo } = this.trattoIn(this.x);
      // il ritmo: le pedalate a tempo tengono su la spinta; se ne salti, cala
      this.fase += c.cadenza[ritmo] * dt;
      this.tUltima += dt;
      if (this.tUltima > 1.5 / c.cadenza[ritmo]) this.spinta = Math.max(0, this.spinta - c.spinta.cala * dt);
      // la velocità va verso quella che la spinta permette in quel tratto
      const vt = c.vel[ritmo] * this.spinta;
      this.v += (vt - this.v) * Math.min(1, dt * (vt > this.v ? c.accelera : c.frena));
      const prima = this.x;
      this.x += this.v * dt;
      // il tornante: chi ci entra lanciato va largo
      const tn = this.tratti.find((u) => u.tipo === 'tornante' && prima < u.da && this.x >= u.da);
      if (tn && this.v > c.tornanteMax) this.largo();
      // gli atti, lo sprint, il traguardo
      const atto = this.atti.filter((a) => this.x >= a).length - 1;
      if (atto !== this.atto) { this.atto = atto; this.annuncia(c.nomiAtti[atto]); }
      if (!this.inSprint && t.tipo === 'sprint') { this.inSprint = true; this.annuncia('SPRINT!'); }
      if (this.x >= this.lunghezza) this.arriva();
    }
    // il Passaseo dice la sua quando lo superi (o ti supera)
    const xr = this.xPassaseo(this.trascorso), avanti = this.x >= xr;
    if (this.davanti != null && avanti !== this.davanti && Math.abs(this.x - xr) > 3) {
      const q = this.aSchermo(xr);
      fumetto(this, Phaser.Math.Clamp(q.x, 80, 400), q.y - 64, caso(avanti ? c.frasiSorpassato : c.frasiSorpasso), 1100, 900);
      if (avanti) Audio.sfx('ok');
    }
    this.davanti = avanti;
    this.tFrase -= dt;
    if (this.tFrase <= 0) {
      this.tFrase = 6 + Math.random() * 3;
      const q = this.aSchermo(xr);
      if (q.x > 40 && q.x < 440) fumetto(this, q.x, q.y - 64, caso(c.frasiPassaseo), 1200, 900);
    }
    this.disegna(dt);
  }

  largo() {
    const c = this.cfg;
    this.larghi++;
    this.v *= c.largo;
    this.spinta *= 0.5;
    this.serie = 0;
    Audio.sfx('errore');
    vibra(60);
    scritta(this, XP + 20, YP - 70, 'LARGO! TROPPO VELOCE', { size: 10, color: '#ff6b5a', durata: 700 });
  }

  annuncia(s) {
    if (!s) return;
    Audio.sfx('bonus');
    scritta(this, 240, 96, s, { size: 15, color: '#ffe14a', durata: 900 });
  }

  // in cima! (la partita finisce subito: il tempo che avanza conta)
  arriva() {
    this.x = this.lunghezza;
    this.tArrivo = this.trascorso;
    const primo = this.tArrivo < this.arrivoPassaseo;
    Audio.sfx(primo ? 'vittoria' : 'ok');
    stelle(this, XP, YP - 40, 10, 900);
    scritta(this, 240, 110, primo ? 'IN CIMA PER PRIMO!' : 'IN CIMA!', { size: 16, color: primo ? '#7dff9a' : '#ffe14a', durata: 1000 });
    this.time.delayedCall(900, () => { if (this.inCorso) this.termina(); });
  }

  // ------------------------------------------------------------
  //  DISEGNO
  // ------------------------------------------------------------
  // dalla salita allo schermo: x in metri -> punto sulla strada
  aSchermo(x) { return { x: XP + (x - this.x) * SCALA, y: YP - (this.quota(x) - this.quota(this.x)) * SCALA * RIPIDO }; }

  disegna(dt) {
    const c = this.cfg, g = this.gStrada;
    // le colline scorrono più piano della strada
    const off = (this.x * SCALA * 0.3) % 960;
    this.colline[0].x = -off; this.colline[1].x = 960 - off;
    this.colline.forEach((img) => { img.y = 128 + (this.quota(this.x) * SCALA * RIPIDO * 0.08) % 20; });
    // la montagna e la strada: il terreno sotto, l'asfalto, le strisce, il guardrail
    g.clear();
    const punti = [];
    for (let sx = -8; sx <= 488; sx += 6) { const x = this.x + (sx - XP) / SCALA; punti.push({ x: sx, y: this.aSchermo(x).y, m: x }); }
    g.fillStyle(0x5a8a46, 1);
    g.fillPoints([...punti.map((p) => ({ x: p.x, y: p.y + 4 })), { x: 488, y: 280 }, { x: -8, y: 280 }], true);
    g.fillStyle(0x3f6a34, 1);
    g.fillPoints([...punti.map((p) => ({ x: p.x, y: p.y + 22 })), { x: 488, y: 280 }, { x: -8, y: 280 }], true);
    for (let i = 1; i < punti.length; i++) {
      const a = punti[i - 1], b = punti[i], tipo = this.trattoIn(b.m).t.tipo, fuori = b.m < 0 || b.m > this.lunghezza;
      g.lineStyle(9, fuori ? 0x6a6a72 : tipo === 'strappo' ? 0x4a4a54 : 0x55565f, 1).lineBetween(a.x, a.y + 3.5, b.x, b.y + 3.5);
      g.lineStyle(1.2, 0xeceade, 1).lineBetween(a.x, a.y - 0.8, b.x, b.y - 0.8);
    }
    // la striscia di mezzo (a tratti) e il guardrail coi paletti, ogni 8 metri
    const m0 = Math.ceil((this.x - XP / SCALA) / 8) * 8;
    for (let m = m0; m < this.x + (480 - XP) / SCALA; m += 8) {
      const a = this.aSchermo(m), b = this.aSchermo(m + 3.5);
      g.lineStyle(1.4, 0xf4f3ea, 0.9).lineBetween(a.x, a.y + 3.5, b.x, b.y + 3.5);
      g.fillStyle(0xb8bcc6, 1).fillRect(a.x - 0.8, a.y + 7, 1.6, 6);
      // sui tornanti, i pannelli gialli e neri con la freccia (come in montagna)
      if (this.trattoIn(m).t.tipo === 'tornante') {
        g.fillStyle(0xffd23a, 1).fillRect(a.x - 4, a.y - 13, 8, 8);
        g.lineStyle(1.4, 0x1c1c22, 1).beginPath(); g.moveTo(a.x + 1.5, a.y - 11.5); g.lineTo(a.x - 1.5, a.y - 9); g.lineTo(a.x + 1.5, a.y - 6.5); g.strokePath();
      }
    }
    for (let m = m0; m < this.x + (480 - XP) / SCALA; m += 8) { const a = this.aSchermo(m), b = this.aSchermo(m + 8); g.lineStyle(1.6, 0xd8dce4, 1).lineBetween(a.x, a.y + 8, b.x, b.y + 8); }
    // cartelli e striscioni
    this.segni.forEach((s, i) => {
      const img = this.cartelli[i], q = this.aSchermo(s.x), vis = q.x > -70 && q.x < 550;
      img.setVisible(vis);
      if (!vis) return;
      if (s.arco) {
        img.setPosition(q.x, q.y - 46);
        g.fillStyle(0x8a8e96, 1).fillRect(q.x - 42, q.y - 52, 2.4, 52).fillRect(q.x + 40, q.y - 52, 2.4, 52);
      } else img.setPosition(q.x + 6, q.y - 2);
    });
    // le due bici
    const xr = this.xPassaseo(this.trascorso);
    this.bici(this.ciclisti[0], xr, this.fasePassaseo(xr));
    this.bici(this.ciclisti[1], this.x, this.fase);
    // il Passaseo fuori dallo schermo: la sua faccia sul bordo, con la freccia e il distacco
    const q = this.aSchermo(xr), d = Math.round(xr - this.x), lato = q.x > 462 ? 1 : q.x < 18 ? -1 : 0;
    this.indicatore.setVisible(lato !== 0);
    if (lato) {
      if (lato !== this.latoIndicatore) {
        const g = this.gIndicatore.clear();
        g.fillStyle(0x1f1430, 0.88).fillRoundedRect(-21, -18, 42, 38, 8);
        g.lineStyle(1.6, 0xf2c43a, 1).strokeRoundedRect(-21, -18, 42, 38, 8);
        g.fillStyle(0xf2c43a, 1).fillTriangle(lato * 22, -8, lato * 22, 8, lato * 30, 0);
      }
      this.latoIndicatore = lato;
      this.indicatore.setPosition(lato > 0 ? 448 : 32, Phaser.Math.Clamp(q.y - 40, 76, 192));
      this.testoIndicatore.setText(`${d > 0 ? '+' : ''}${d} m`);
    }
    this.disegnaHud(xr);
  }

  // il Passaseo pedala a tempo anche lui (la sua pedalata segue la sua velocità)
  fasePassaseo(xr) { return xr * 0.075; }

  // una bici di fianco, con chi ci pedala sopra: tutto ruotato secondo la pendenza
  bici(C, x, fase) {
    const g = C.g, q = this.aSchermo(x), q2 = this.aSchermo(x + 2), ang = Math.atan2(q2.y - q.y, q2.x - q.x);
    g.clear();
    C.testa.setVisible(q.x > -30 && q.x < 510);
    if (!C.testa.visible) return;
    const cs = Math.cos(ang), sn = Math.sin(ang), ox = q.x, oy = q.y + C.dy;
    const P = (lx, ly) => ({ x: ox + lx * cs - ly * sn, y: oy + lx * sn + ly * cs });
    const linea = (a, b, w, colore) => { g.lineStyle(w, colore, 1).lineBetween(a.x, a.y, b.x, b.y); };
    const ruota = (cx, cy) => {
      const p = P(cx, cy), giro = x / 9;
      g.lineStyle(2.2, 0x1c1c22, 1).strokeCircle(p.x, p.y, 8.6);
      g.lineStyle(0.8, 0xb8bcc6, 1).strokeCircle(p.x, p.y, 7);
      for (let k = 0; k < 4; k++) { const a = giro + (k * Math.PI) / 4; g.lineStyle(0.6, 0xc8ccd4, 1).lineBetween(p.x - Math.cos(a) * 7, p.y - Math.sin(a) * 7, p.x + Math.cos(a) * 7, p.y + Math.sin(a) * 7); }
      g.fillStyle(0x8a8e96, 1).fillCircle(p.x, p.y, 1.2);
    };
    // la pedivella: mezzo giro a ogni pedalata (la pedalata sinistra spinge giù il pedale sinistro)
    const a = Math.PI * fase + Math.PI / 2, mov = P(0, -9);
    const pedale = (s) => P(Math.cos(a + (s ? Math.PI : 0)) * 4.6, -9 + Math.sin(a + (s ? Math.PI : 0)) * 4.6);
    // Chi pedala non si inclina quanto la bici: la bici segue la strada, il corpo resta quasi dritto
    // (ruota solo di un quarto della pendenza) e chino in avanti sul manubrio. Il corpo si misura
    // dall'anca, sulla sella.
    const anca = P(-5, -30), manubrio = P(13, -31), aB = ang * 0.25, cB = Math.cos(aB), sB = Math.sin(aB);
    const Q = (dx, dy) => ({ x: anca.x + dx * cB - dy * sB, y: anca.y + dx * sB + dy * cB });
    const spalla = Q(11, -11);
    const gamba = (s, scura) => {
      // il ginocchio: a metà tra anca e pedale, spostato in avanti (verso il manubrio) quanto serve
      const f = pedale(s), dx = f.x - anca.x, dy = f.y - anca.y, lungo = Math.hypot(dx, dy) || 1, L = 11.2;
      const m = Math.min(lungo, 2 * L - 0.5) / 2, h = Math.sqrt(Math.max(0, L * L - m * m)), ux = dx / lungo, uy = dy / lungo;
      const avanti = -uy * cs + ux * sn > 0 ? 1 : -1;
      const gin = { x: anca.x + ux * m - uy * h * avanti, y: anca.y + uy * m + ux * h * avanti };
      const k1 = scura ? 0.75 : 1;
      linea(anca, gin, 5.2, C.gambe);
      linea(gin, f, 4.2, C.corti ? C.pelle : C.gambe);
      if (scura) { g.fillStyle(0x000000, 0.25).fillCircle(gin.x, gin.y, 2); }
      g.fillStyle(C.scarpe, k1).fillEllipse(f.x + 1.6, f.y, 6, 3);
    };
    gamba(1, true);                        // la gamba di là, dietro alla bici
    ruota(-14, -9); ruota(14, -9);
    const t = C.telaio;
    linea(P(-14, -9), mov, 2, t); linea(mov, P(-4, -26), 2.2, t); linea(P(-4, -26), P(11, -26), 2.2, t); linea(mov, P(11, -26), 2.2, t);
    linea(P(-14, -9), P(-4, -26), 1.6, t); linea(P(11, -26), P(14, -9), 2, t); linea(P(11, -26), manubrio, 1.8, 0x3a3a42);
    linea(P(-8, -28), P(-1, -28), 2.6, 0x1c1c22);                                  // la sella
    g.fillStyle(0x8a8e96, 1).fillCircle(mov.x, mov.y, 2.6);
    linea(mov, pedale(1), 1.4, 0x6a6e78); linea(mov, pedale(0), 1.4, 0x8a8e96);
    gamba(0, false);                       // la gamba di qua
    // il busto chino sul manubrio (col contorno, come i personaggi), il collo e il braccio teso
    linea(anca, spalla, 12, 0x2b1b17);
    g.fillStyle(0x2b1b17, 1).fillCircle(spalla.x, spalla.y, 6.2).fillCircle(anca.x, anca.y, 5.6);
    linea(anca, spalla, 10, C.maglia);
    g.fillStyle(C.maglia, 1).fillCircle(spalla.x, spalla.y, 5.2).fillCircle(anca.x, anca.y, 4.6);
    const collo = Q(12, -14);
    g.fillStyle(C.pelle, 1).fillCircle(collo.x, collo.y, 3.4);
    linea(spalla, manubrio, 3.2, C.pelle);
    g.fillStyle(C.pelle, 1).fillCircle(manubrio.x, manubrio.y, 1.8);
    // la testa sta SULLE spalle: il mento appoggia sul collo (prima era più avanti e sembrava staccata)
    const testa = Q(13, -22);
    C.testa.setPosition(testa.x, testa.y).setRotation(aB);
  }

  disegnaHud(xr) {
    const c = this.cfg, g = this.gBarra, L = this.lunghezza, X = (x) => lerp(BARRA.x0, BARRA.x1, Phaser.Math.Clamp(x / L, 0, 1));
    g.clear();
    g.fillStyle(0x1f1430, 0.9).fillRoundedRect(BARRA.x0 - 2, BARRA.y - 3, BARRA.x1 - BARRA.x0 + 4, 6, 3);
    for (const a of this.atti.slice(1)) g.fillStyle(0xffe14a, 0.7).fillRect(X(a) - 0.5, BARRA.y - 4, 1, 8);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.fillStyle((i + j) % 2 ? 0xffffff : 0x1c1c22, 1).fillRect(BARRA.x1 + 3 + i * 2.5, BARRA.y - 5 + j * 2.5, 2.5, 2.5);
    g.fillStyle(col(this.giocatore.colore), 1).fillRoundedRect(BARRA.x0, BARRA.y - 1.5, X(this.x) - BARRA.x0, 3, 1.5);
    this.facce[0].setX(X(xr)); this.facce[1].setX(X(this.x));
    // il ritmo: la pallina va da un pedale all'altro; il pedale che tocca si accende
    const r = this.gRitmo, f = this.fase, px = RITMO.x - Math.cos(Math.PI * f) * RITMO.mezza, vicino = Math.abs(f - Math.round(f)) < 0.18;
    r.clear();
    r.fillStyle(0x1f1430, 0.8).fillRoundedRect(RITMO.x - RITMO.mezza - 10, RITMO.y - 8, RITMO.mezza * 2 + 20, 16, 8);
    for (const s of [-1, 1]) r.fillStyle(0x7dff9a, vicino && (s > 0) === (Math.round(f) % 2 === 1) ? 0.75 : 0.35).fillRoundedRect(RITMO.x + s * RITMO.mezza - 9, RITMO.y - 6.5, 18, 13, 6.5);
    r.fillStyle(this.tArrivo != null ? 0x8a8e96 : 0xffe14a, 1).fillCircle(px, RITMO.y, 6.5);
    r.lineStyle(1.6, 0x1c1c22, 1).strokeCircle(px, RITMO.y, 6.5);
    const lato = Math.round(f) % 2;
    this.pedali.forEach((p, i) => p.setAlpha(vicino && lato === i ? 1 : 0.55));
    // il distacco e la velocità (si riscrivono solo quando cambiano)
    const d = Math.round(this.x - xr), kmh = Math.round(this.v * 1.25), hud = `${d}|${kmh}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoDistacco.setText(d >= 0 ? `+${d} m` : `${d} m`).setColor(d >= 0 ? '#7dff9a' : '#ff9a8a');
      this.testoVel.setText(`${kmh} km/h`);
    }
  }

  risultato() {
    const c = this.cfg, t = this.tArrivo ?? this.trascorso, arrivato = this.tArrivo != null;
    // chi vince: chi arriva prima in cima; se nessuno ci arriva, chi è più avanti allo scadere
    const vittoria = arrivato ? this.tArrivo < this.arrivoPassaseo : this.arrivoPassaseo > this.trascorso && this.x > this.xPassaseo(this.trascorso);
    const vantaggio = vittoria && arrivato ? Math.min(this.arrivoPassaseo, this.durata) - this.tArrivo : 0;
    const P = c.punti;
    return {
      punteggio: Math.max(0, Math.round(this.x * P.metro + this.perfette * P.perfetta + (vittoria ? P.vittoria + vantaggio * P.secondo : 0))),
      vittoria,
      riepilogo: `${Math.round(this.x)} m su ${Math.round(this.lunghezza)}, ${quanti(this.perfette, 'pedalata perfetta', 'pedalate perfette')}` + (arrivato ? `, in cima in ${numero(t, 1)} s` : '') + (this.larghi ? `, ${quanti(this.larghi, 'tornante largo', 'tornanti larghi')}` : ''),
      titoli: ['IN CIMA PER PRIMO!', 'TI HA STACCATO!'],
    };
  }

  // chi ha vinto in grande, in cima al passo; l'altro arriva sbuffando
  finale(ris, fatto) {
    for (const o of [this.gRitmo, ...this.pedali, this.voto, this.gBarra, ...this.facce, this.testoDistacco, this.testoVel, this.indicatore]) o.setVisible(false);
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.7, duration: 300 });
    const vince = ris.vittoria ? this.giocatore.id : 'passaseo', perde = ris.vittoria ? 'passaseo' : this.giocatore.id;
    this.time.delayedCall(450, () => {
      // (il titolo dice chi è arrivato su per primo solo se va d'accordo con la medaglia)
      const titolo = ris.vittoria ? (ris.condizione ? 'IN CIMA PER PRIMO!' : 'BELLA SALITA!') : ris.condizione ? 'PRIMO, MA CHE FATICA!' : 'IL PASSASEO TI HA STACCATO!';
      txt(this, 240, 26, titolo, { size: 17, color: ris.vittoria ? '#7dff9a' : '#ff6b5a', depth: 710 });
      Audio.sfx(ris.vittoria ? 'vittoria' : 'sconfitta');
      const v = im(this, 220, 290, `${vince}_felice`, 0.5).setOrigin(0.5, 1).setDepth(705);
      this.tweens.add({ targets: v, y: 262, scale: scalaDi(`${vince}_felice`, 1.45), duration: 420, ease: 'Back.out' });
      this.tweens.add({ targets: v, y: 254, delay: 500, duration: 260, yoyo: true, repeat: -1, ease: 'Quad.out' });
      const p = im(this, 400, 262, `${perde}_triste`, 0.9).setOrigin(0.5, 1).setDepth(704);
      this.tweens.add({ targets: p, x: 396, duration: 70, yoyo: true, repeat: -1 });
      for (let i = 0; i < 4; i++) this.time.delayedCall(i * 260, () => stelle(this, 150 + Math.random() * 140, 80 + Math.random() * 90, 6, 706));
      fumetto(this, 400, 120, caso(ris.vittoria ? this.cfg.frasiPerde : this.cfg.frasiVince), 1800, 712);
    });
    this.time.delayedCall(3300, fatto);
  }
}
