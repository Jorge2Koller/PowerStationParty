// Microgioco 3: "La Barba di O'Sfurnacchiat" - radi De Luca con il mouse.
//
//  TASTO DESTRO  = pennello: stende la schiuma (che dopo qualche secondo si secca)
//                  (sul trackpad del Mac: clic a due dita, oppure CTRL + clic)
//  COL DITO: interruttore PENNELLO / RASOIO in basso a sinistra (si può cambiare anche
//  a metà passata con l'altro dito); l'attrezzo sta un po' sopra il dito, così si vede.
//  TASTO SINISTRO = rasoio: taglia solo dove c'è schiuma, e solo andando piano
//  La lama si intasa e va sciacquata nella bacinella.
//  Naso, labbra, occhi, orecchie e nei: vietati.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { FACCIA, ARTE, mascheraBarba, zonaDelicata, sulViso } from '../sprites.js';
import { txt, im, scritta, stelle, fumo, pannello, scuoti, puntatore, colpetto, lerp, caso, eTouch, perDito, vibra, multiTouch } from '../fx.js';

const GW = FACCIA.w / 2, GH = FACCIA.h / 2; // griglia della barba: celle da 2x2 unità della faccia
const CX = 240, CY = 142;                   // posizione a riposo della testa
const SCALA = 2;                            // unità della faccia -> unità di gioco
const DB = FACCIA.densDin;                  // densità delle texture di barba e schiuma
const BAC = { x: 422, y: 216, r: 30 };      // bacinella per sciacquare la lama
const TAU = Math.PI * 2;

export class BarbaScene extends MicrogiocoBase {
  constructor() { super('barba'); }

  prepara() {
    const c = this.cfg;
    im(this, 0, 0, 'bgBarbiere').setOrigin(0);
    txt(this, 388, 35, 'BARBERIA', { size: 9, color: '#fff3d6', thick: 0 });
    this.bacinella = im(this, BAC.x, BAC.y, 'bacinella').setDepth(40);

    // griglia: -1 = niente barba, 1 = barba, 0.5 = ricrescita, 0 = rasato
    this.celle = new Float32Array(GW * GH);
    this.schiuma = new Float32Array(GW * GH); // secondi di schiuma rimasti su ogni cella
    this.totale = 0;
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
      const ok = mascheraBarba(gx * 2 + 1, gy * 2 + 1);
      this.celle[gy * GW + gx] = ok ? 1 : -1;
      if (ok) this.totale++;
    }
    for (const k of ['barba', 'schiumaViso']) if (this.textures.exists(k)) this.textures.remove(k);
    this.texBarba = this.textures.createCanvas('barba', FACCIA.w * DB, FACCIA.h * DB);
    this.texSchiuma = this.textures.createCanvas('schiumaViso', FACCIA.w * DB, FACCIA.h * DB);
    this.sporcaBarba = this.sporcaSchiuma = true;

    this.imgBase = im(this, 0, 0, 'marcoBase_normale');
    this.imgBarba = this.add.image(0, 0, 'barba').setScale(1 / DB);
    this.imgSchiuma = this.add.image(0, 0, 'schiumaViso').setScale(1 / DB);
    this.imgTop = im(this, 0, 0, 'marcoTop_normale');
    this.testa = this.add.container(CX, CY, [this.imgBase, this.imgBarba, this.imgSchiuma, this.imgTop]).setScale(SCALA).setDepth(50);
    this.mettiNei(c.nei);

    this.spost = { x: 0, y: 0, sx: 1, sy: 1, rot: 0 }; // scatti, sbadigli, starnuti, giri di testa
    this.onda = 0;
    this.tEvento = 3;
    this.tRicrescita = 0;
    this.tSuono = 0;
    this.tAvviso = 0;
    this.tTaglio = 0;
    this.tSciacquo = 0;
    this.stordito = 0;    // dopo un "AHIA" il rasoio non taglia per un attimo
    this.tEspr = 0;
    this.espr = 'normale';
    this.prec = null;       // dov'era l'attrezzo sulla faccia nel fotogramma prima (durante una passata)
    this.precMondo = null;  // dov'era il mouse sullo schermo nel fotogramma prima
    this.locPrec = null;    // ...e dov'era sulla faccia (anche senza premere: serve a capire se si muove la testa)
    this.traccia = [];      // ultimi punti della passata col loro orario, per misurare la velocità
    this.tSussulto = 0;     // De Luca ha appena fatto uno scatto: per un attimo non è colpa mia
    this.tRincorsa = 0;     // ...e per un po' posso rincorrere la faccia più in fretta senza taglietti
    this.perdonato = false; // il rasoio è finito su una zona delicata per colpa sua: non conta finché non esco
    this.tAppoggio = 0;     // col dito: un istante per vedere dove si appoggia la lama
    this.tDisegno = 0;
    this.vel = 0;         // velocità del mouse (unità della faccia al secondo)
    this.lama = 0;        // quanto è intasata la lama
    this.tagli = 0;
    this.bonusTempo = 0;

    this.rasoio = im(this, CX, 232, 'rasoio').setOrigin(0.5, 0.11).setDepth(600);
    this.pennello = im(this, CX, 232, 'pennello').setOrigin(0.5, 0.16).setDepth(600).setVisible(false);
    this.barraLama = this.add.graphics().setDepth(601);
    this.avvisoLama = txt(this, BAC.x, BAC.y - 34, 'SCIACQUA QUI!', { size: 8, color: '#ffe14a', depth: 602 }).setVisible(false);
    this.tweens.add({ targets: this.avvisoLama, y: BAC.y - 40, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.input.setDefaultCursor('none');
    // CTRL tenuto premuto = tasto destro (Mac). Vale l'ultima notizia arrivata:
    // dalla tastiera o dal mouse, che a ogni movimento dice se CTRL è giù.
    this.ctrl = false;
    this.input.keyboard.on('keydown-CTRL', () => { this.ctrl = true; });
    this.input.keyboard.on('keyup-CTRL', () => { this.ctrl = false; });
    for (const ev of ['pointerdown', 'pointermove', 'pointerup']) this.input.on(ev, (p) => { if (p.event) this.ctrl = !!p.event.ctrlKey; });

    // col dito: il primo dito appoggiato (fuori dall'interruttore) è quello che lavora;
    // un secondo dito può cambiare attrezzo intanto
    multiTouch(this);
    this.attrezzo = 'pennello';
    this.dito = null;       // il puntatore del dito che lavora
    this.modoDito = eTouch();             // sul telefono da subito (sul computer al primo tocco)
    this.puntoDito = { x: CX, y: 232 };   // dove sta l'attrezzo finché non si tocca
    this.input.on('pointerdown', (p) => {
      if (!p.wasTouch || this.dito) return;
      this.dito = p;
      this.modoDito = true;
      this.prec = null;
      // l'attrezzo compare sopra il dito solo adesso, e prima non si sa di preciso dove finirà:
      // per un istante non taglia, e se la lama è atterrata su una zona delicata non conta
      // (conta entrarci strisciando)
      this.tAppoggio = 0.12;
      this.tSussulto = Math.max(this.tSussulto, 0.3);
    });
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => { if (this.dito?.id === p.id) { this.dito = null; this.prec = null; } });
    if (eTouch()) this.creaInterruttore();

    this.testoPct = txt(this, 240, 22, '', { size: 13, depth: 1001, thick: 3 });
    this.testoTagli = txt(this, 240, 47, '', { size: 7, depth: 1001, color: '#ff9a8a' });
    this.hudBarba = [
      pannello(this, 240, 22, 150, 18, { depth: 1000 }),
      this.testoPct, this.testoTagli, this.avvisoLama, this.barraLama,
      txt(this, 240, 37, `OBIETTIVO ${c.soglia}%`, { depth: 1001, size: 7 }),
      txt(this, 6, 262, perDito('DESTRO (o CTRL+CLIC): schiuma    SINISTRO: rasoio', 'Tocca qui sopra per cambiare attrezzo'), { ox: 0, size: 6.5, depth: 1001 }),
    ];
    if (this.interruttore) this.hudBarba.push(this.interruttore);
  }

  // interruttore PENNELLO / RASOIO (telefono): un tocco cambia attrezzo
  creaInterruttore() {
    const X = 62, Y = 236, W = 104, H = 30;
    const c = this.add.container(X, Y).setDepth(1002);
    const g = this.add.graphics();
    const icone = [im(this, -W / 4, -4, 'pennello', 0.42), im(this, W / 4, -4, 'rasoio', 0.42)];
    const scritte = [txt(this, -W / 4, 8, 'PENNELLO', { size: 5.5 }), txt(this, W / 4, 8, 'RASOIO', { size: 5.5 })];
    c.add([g, ...icone, ...scritte]);
    const disegna = () => {
      const i = this.attrezzo === 'pennello' ? 0 : 1;
      g.clear();
      g.fillStyle(0x000000, 0.3); g.fillRoundedRect(-W / 2 + 1.5, -H / 2 + 2.5, W, H, 9);
      g.fillStyle(0x1f1430, 0.85); g.fillRoundedRect(-W / 2, -H / 2, W, H, 9);
      g.fillStyle(0xffe14a, 1); g.fillRoundedRect(i ? 1 : -W / 2 + 2, -H / 2 + 2, W / 2 - 3, H - 4, 7);
      g.lineStyle(1.5, 0xffe14a, 1); g.strokeRoundedRect(-W / 2, -H / 2, W, H, 9);
      scritte.forEach((t, k) => t.setColor(k === i ? '#1f1430' : '#ffffff').setStroke('#1f1430', k === i ? 0 : 3));
      icone.forEach((t, k) => t.setAlpha(k === i ? 1 : 0.5));
    };
    disegna();
    this.add.rectangle(X, Y, W + 8, H + 8, 0x000000, 0.001).setDepth(1002).setInteractive()
      .on('pointerdown', (_p, _x, _y, ev) => {
        ev.stopPropagation();   // il tocco sull'interruttore non è una passata
        this.attrezzo = this.attrezzo === 'pennello' ? 'rasoio' : 'pennello';
        this.prec = null;
        Audio.sfx('muovi');
        this.tweens.add({ targets: c, scaleX: { from: 1.08, to: 1 }, scaleY: { from: 0.92, to: 1 }, duration: 140 });
        disegna();
      });
    this.interruttore = c;
  }

  pulisci() { this.input.setDefaultCursor('default'); }

  // dopo una pausa il dito che lavorava non c'è più (se no l'attrezzo resterebbe "premuto")
  alRientro() { this.dito = null; this.prec = null; this.precMondo = null; this.locPrec = null; this.traccia.length = 0; this.perdonato = false; }

  // nei in posizioni casuali sotto la barba, ma sulla pelle del viso (non dove la barba esce
  // dalla faccia) e lontani dalle altre zone delicate
  mettiNei(n) {
    this.nei = [];
    for (let prove = 0; prove < 400 && this.nei.length < n; prove++) {
      const gx = Phaser.Math.Between(4, GW - 5), gy = Phaser.Math.Between(26, 44);
      if (this.celle[gy * GW + gx] !== 1) continue;
      const x = gx * 2 + 1, y = gy * 2 + 1;
      if (!sulViso(x, y, 4)) continue;
      let libero = true;
      for (let a = 0; a < 8; a++) if (zonaDelicata(x + Math.cos(a * 0.785) * 6, y + Math.sin(a * 0.785) * 6, 'sbadiglio')) libero = false;   // lontani anche dalla bocca spalancata
      if (!libero || this.nei.some((m) => Math.hypot(m.x - x, m.y - y) < 14)) continue;
      this.nei.push({ x, y });
      this.testa.add(im(this, x - FACCIA.w / 2, y - FACCIA.h / 2, 'neo'));
    }
  }

  get percentuale() {
    let n = 0;
    for (let i = 0; i < this.celle.length; i++) if (this.celle[i] === 0) n++;
    return (n / this.totale) * 100;
  }

  espressione(e, sec = 0) {
    // quando apre la bocca la zona delicata si allarga di colpo: chi stava radendo lì sotto
    // non ha sbagliato niente, quindi per un attimo vale come uno scatto della testa
    if (e === 'parla' || e === 'sbadiglio') this.tSussulto = Math.max(this.tSussulto, 0.4);
    this.espr = e;
    this.imgBase.setTexture('marcoBase_' + e);
    this.imgTop.setTexture('marcoTop_' + e);
    this.tEspr = sec;
  }

  // Velocità della passata (unità della faccia al secondo): strada fatta dal mouse negli ultimi
  // due decimi di secondo divisa per il tempo VERO passato. Misurarla su un solo fotogramma (e
  // col delta "lisciato" di Phaser) dava taglietti a chi andava piano: bastava un fotogramma
  // lento, o due eventi del mouse arrivati insieme, per far sembrare veloce una passata lenta.
  misuraVel(w, appoggiato) {
    const tr = this.traccia, ora = this.oraVera / 1000;
    if (!appoggiato) { tr.length = 0; return 0; }
    const ultimo = tr[tr.length - 1];
    // un punto nuovo solo quando il mouse si è spostato: così il tempo tra due punti è quello del tratto
    if (!ultimo || ultimo.x !== w.x || ultimo.y !== w.y) tr.push({ t: ora, x: w.x, y: w.y });
    while (tr.length > 2 && ora - tr[1].t > 0.2) tr.shift();
    const primo = tr[0], fine = tr[tr.length - 1];
    if (ora - fine.t > 0.1) { tr.length = 0; tr.push({ t: ora, x: w.x, y: w.y }); return 0; }   // fermo
    const tempo = fine.t - primo.t;
    if (tr.length < 3 || tempo < 0.08) return 0;   // appena appoggiato: troppo poca strada per giudicare
    let strada = 0;
    for (let i = 1; i < tr.length; i++) strada += Math.hypot(tr[i].x - tr[i - 1].x, tr[i].y - tr[i - 1].y);
    return strada / tempo / SCALA;
  }

  // dal punto sullo schermo alle coordinate della faccia (la testa trasla, ruota e si deforma)
  aLocale(wx, wy) {
    const t = this.testa, dx = wx - t.x, dy = wy - t.y, cs = Math.cos(-t.rotation), sn = Math.sin(-t.rotation);
    return { x: (dx * cs - dy * sn) / t.scaleX + FACCIA.w / 2, y: (dx * sn + dy * cs) / t.scaleY + FACCIA.h / 2 };
  }

  // traccia un cerchio per ogni cella che soddisfa il test
  tracciaCelle(ctx, dati, test, raggio, dy = 0) {
    ctx.beginPath();
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
      if (!test(dati[gy * GW + gx])) continue;
      const x = (gx * 2 + 1) * DB, y = (gy * 2 + 1 + dy) * DB;
      ctx.moveTo(x + raggio, y); ctx.arc(x, y, raggio, 0, TAU);
    }
    ctx.fill();
  }

  // ritaglia un'"arte" (barba, schiuma) con la sagoma delle celle e la stampa su k
  stampa(k, arte, dati, test, raggio) {
    const t = ARTE.tmp.getContext('2d');
    t.setTransform(1, 0, 0, 1, 0, 0);
    t.globalCompositeOperation = 'source-over';
    t.clearRect(0, 0, ARTE.tmp.width, ARTE.tmp.height);
    t.fillStyle = '#000000';
    this.tracciaCelle(t, dati, test, raggio);
    t.globalCompositeOperation = 'source-in';
    t.drawImage(arte, 0, 0);
    k.drawImage(ARTE.tmp, 0, 0);
  }

  ridisegnaBarba() {
    const k = this.texBarba.context, r = 1.55 * DB;
    k.clearRect(0, 0, FACCIA.w * DB, FACCIA.h * DB);
    k.fillStyle = '#100a08';
    this.tracciaCelle(k, this.celle, (v) => v >= 1, r + 0.3 * DB);      // contorno
    this.stampa(k, ARTE.barba, this.celle, (v) => v >= 1, r);
    // ricrescita: puntini di barba corta
    k.fillStyle = 'rgba(40,28,22,0.8)';
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
      if (this.celle[gy * GW + gx] !== 0.5) continue;
      const x = gx * 2 * DB, y = gy * 2 * DB, d = DB * 0.45;
      k.fillRect(x + d, y + d * 0.6, d, d); k.fillRect(x + d * 2.6, y + d * 2.2, d, d); k.fillRect(x + d * 0.4, y + d * 2.8, d, d);
    }
    this.texBarba.refresh();
    this.sporcaBarba = false;
  }

  ridisegnaSchiuma() {
    const k = this.texSchiuma.context, r = 1.9 * DB;
    k.clearRect(0, 0, FACCIA.w * DB, FACCIA.h * DB);
    k.globalAlpha = 1;
    k.fillStyle = 'rgba(110,145,190,0.5)';
    this.tracciaCelle(k, this.schiuma, (v) => v > 0, r, 0.45);           // ombra
    k.globalAlpha = 0.5;                                                   // sta per seccarsi
    this.stampa(k, ARTE.schiuma, this.schiuma, (v) => v > 0 && v < 1.5, r);
    k.globalAlpha = 1;
    this.stampa(k, ARTE.schiuma, this.schiuma, (v) => v >= 1.5, r);
    this.texSchiuma.refresh();
    this.sporcaSchiuma = false;
  }

  // applica fn a tutte le celle entro il raggio dal punto (coordinate della faccia)
  perCelle(x, y, r, fn) {
    const gx0 = Math.floor(x / 2), gy0 = Math.floor(y / 2), gr = Math.ceil(r / 2);
    for (let gy = gy0 - gr; gy <= gy0 + gr; gy++) for (let gx = gx0 - gr; gx <= gx0 + gr; gx++) {
      if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
      if ((gx * 2 + 1 - x) ** 2 + (gy * 2 + 1 - y) ** 2 <= r * r) fn(gy * GW + gx);
    }
  }

  // pennello: schiuma su tutta la barba sotto le setole. Ritorna quante celle ha coperto.
  insapona(x, y) {
    const d = this.cfg.durataSchiuma;
    let n = 0;
    this.perCelle(x, y, this.cfg.raggioPennello, (i) => {
      if (this.celle[i] <= 0) return;
      if (this.schiuma[i] < d - 0.6) n++;
      this.schiuma[i] = d;
    });
    if (n) this.sporcaSchiuma = true;
    return n;
  }

  // rasoio: taglia solo le celle insaponate. Ritorna quante ne ha tolte.
  radi(x, y) {
    let n = 0;
    this.perCelle(x, y, this.cfg.raggio, (i) => {
      const v = this.celle[i];
      if (v <= 0) return;
      if (this.schiuma[i] <= 0) { this.aSecco = true; return; }
      this.celle[i] = 0;
      this.schiuma[i] = 0;
      n++;
    });
    if (n) this.sporcaBarba = this.sporcaSchiuma = true;
    return n;
  }

  pericolo(x, y) {
    return zonaDelicata(x, y, this.espr) || this.nei.some((m) => Math.hypot(m.x - x, m.y - y) < 2.4);
  }

  ricresci(p) {
    const prob = lerp(this.cfg.ricrescitaInizio, this.cfg.ricrescitaFine, p), c = this.celle;
    if (prob <= 0) return;   // ricrescita spenta (config.js)
    const nuove = [];
    for (let gy = 1; gy < GH - 1; gy++) for (let gx = 1; gx < GW - 1; gx++) {
      const i = gy * GW + gx;
      if (c[i] === 0.5) { if (Math.random() < 0.2) nuove.push([i, 1]); }
      else if (c[i] === 0 && (c[i - 1] >= 1 || c[i + 1] >= 1 || c[i - GW] >= 1 || c[i + GW] >= 1) && Math.random() < prob) nuove.push([i, 0.5]);
    }
    for (const [i, v] of nuove) c[i] = v;
    if (nuove.length) this.sporcaBarba = true;
  }

  aggiorna(dt, p) {
    const c = this.cfg, ptr = this.input.activePointer;
    let w = puntatore(this);

    // --- De Luca non sta fermo ---
    const amp = lerp(c.agitazioneInizio, c.agitazioneFine, p);
    this.onda += dt * lerp(1.6, 4, p);
    this.testa.x = CX + Math.sin(this.onda) * amp + this.spost.x;
    this.testa.y = CY + Math.sin(this.onda * 1.7) * amp * 0.45 + this.spost.y;
    this.testa.rotation = Math.sin(this.onda * 0.63) * c.rotazioneFine * p + this.spost.rot;
    this.testa.setScale(SCALA * this.spost.sx, SCALA * this.spost.sy);

    this.tEvento -= dt;
    if (this.tEvento <= 0) {
      this.tEvento = lerp(c.eventoInizio, c.eventoFine, p) * (0.7 + Math.random() * 0.6);
      this[caso(['scatto', 'scatto', 'sbadiglio', 'starnuto', 'parla', 'gira'])]();
    }
    if (this.tEspr > 0) { this.tEspr -= dt; if (this.tEspr <= 0) this.espressione('normale'); }

    // --- attrezzi ---
    let insapono, rado, pennelloInMano;
    if (this.modoDito) {
      // col dito: l'attrezzo lo sceglie l'interruttore e sta un po' sopra il dito (si vede la lama)
      if (this.dito) { const d = puntatore(this, this.dito); this.puntoDito = { x: d.x, y: d.y - c.sopraDito }; }
      w = this.puntoDito ?? w;
      pennelloInMano = this.attrezzo === 'pennello';
      insapono = !!this.dito && pennelloInMano;
      rado = !!this.dito && !pennelloInMano;
    } else {
      insapono = ptr.rightButtonDown() || (ptr.leftButtonDown() && this.ctrl);
      rado = ptr.leftButtonDown() && !insapono;
      pennelloInMano = insapono;
    }
    // col dito, appena appoggiato: un istante in cui l'attrezzo si vede ma non lavora ancora
    if (this.tAppoggio > 0) { this.tAppoggio -= dt; insapono = rado = false; }
    this.rasoio.setVisible(!pennelloInMano).setPosition(w.x, w.y).setAngle(rado ? -12 : 0);
    this.pennello.setVisible(pennelloInMano).setPosition(w.x, w.y).setAngle(insapono ? Math.sin(this.trascorso * 30) * 8 : 0);
    const loc = this.aLocale(w.x, w.y);
    // Di quanto si è spostato l'attrezzo sulla faccia in questo fotogramma per merito di De Luca
    // (ha mosso la testa) e non mio (ho mosso il mouse)? Se fa uno scatto, per un attimo quello
    // che finisce sotto la lama non è colpa di chi rade.
    if (this.locPrec && this.precMondo) {
      const t = this.testa, dxw = w.x - this.precMondo.x, dyw = w.y - this.precMondo.y, cs = Math.cos(-t.rotation), sn = Math.sin(-t.rotation);
      const mx = (dxw * cs - dyw * sn) / t.scaleX, my = (dxw * sn + dyw * cs) / t.scaleY;
      const vTesta = Math.hypot(loc.x - this.locPrec.x - mx, loc.y - this.locPrec.y - my) / Math.max(dt, 0.001);
      if (vTesta > c.velSussulto) { this.tSussulto = 0.25; this.tRincorsa = 0.7; }
    }
    this.tSussulto -= dt; this.tRincorsa -= dt;
    this.locPrec = loc;
    this.vel = this.misuraVel(w, rado);
    this.precMondo = { x: w.x, y: w.y };
    this.stordito -= dt; this.tSuono -= dt; this.tAvviso -= dt; this.tTaglio -= dt;

    const da = this.prec ?? loc;
    const passi = Math.max(1, Math.ceil(Math.hypot(loc.x - da.x, loc.y - da.y) / 2));
    if (insapono) {
      let n = 0;
      for (let i = 1; i <= passi; i++) n += this.insapona(lerp(da.x, loc.x, i / passi), lerp(da.y, loc.y, i / passi));
      if (n && this.tSuono <= 0) {
        this.tSuono = 0.09;
        Audio.sfx('pennello');
        const b = this.add.ellipse(w.x + (Math.random() - 0.5) * 16, w.y, 4, 4, 0xffffff).setDepth(590);
        this.tweens.add({ targets: b, y: w.y - 14, alpha: 0, scale: 1.8, duration: 400, onComplete: () => b.destroy() });
      }
      this.prec = loc;
    } else if (rado && this.stordito <= 0) {
      let tolte = 0, piena = false, delicato = false;
      this.aSecco = false;
      for (let i = 1; i <= passi; i++) {
        const x = lerp(da.x, loc.x, i / passi), y = lerp(da.y, loc.y, i / passi);
        if (this.pericolo(x, y)) { delicato = true; break; }
        if (this.lama >= c.capienzaLama) { piena = true; break; }
        tolte += this.radi(x, y);
      }
      // È un errore solo se sulla zona delicata il rasoio ce l'ho portato io. Se ci è finita
      // sotto per uno scatto di De Luca la lama si alza da sola, e non conta finché non ne esco.
      if (!delicato) this.perdonato = false;
      else if (this.tSussulto > 0 || this.perdonato) this.perdonato = true;
      else this.ahia();
      this.lama += tolte;
      if (tolte) {
        if (this.tSuono <= 0) {
          this.tSuono = 0.07;
          Audio.sfx('rasoio');
          for (let i = 0; i < 2; i++) {
            const pelo = this.add.rectangle(w.x + (Math.random() - 0.5) * 16, w.y, 2, 2, 0x1e1612).setDepth(590);
            this.tweens.add({ targets: pelo, y: w.y + 30 + Math.random() * 20, x: pelo.x + (Math.random() - 0.5) * 20, alpha: 0, duration: 450, onComplete: () => pelo.destroy() });
          }
        }
        // subito dopo uno scatto della testa il limite è più largo: chi rincorre la faccia non sta "correndo"
        const limite = (this.modoDito ? c.velMaxDito : c.velMax) * (this.tRincorsa > 0 ? c.margineRincorsa : 1);
        if (this.vel > limite && this.tTaglio <= 0) this.taglio(loc);
      } else if (this.tAvviso <= 0 && (piena || this.aSecco)) {
        this.tAvviso = 1.3;
        Audio.sfx('tsk');
        scritta(this, w.x, w.y - 22, piena ? 'LAMA PIENA!' : 'SERVE LA SCHIUMA!', { size: 8, color: '#ff9a8a', durata: 600 });
      }
      this.prec = loc;
    } else this.prec = null;

    // --- sciacquo della lama nella bacinella ---
    const pienezza = Math.min(1, this.lama / c.capienzaLama);
    if (!pennelloInMano && this.lama > 0 && Math.hypot(w.x - BAC.x, w.y - (BAC.y - 6)) < BAC.r) {
      this.tSciacquo += dt;
      if (this.tSciacquo > 0.18) {
        this.lama = 0;
        Audio.sfx('splash');
        fumo(this, BAC.x, BAC.y - 10, 5, 590, 0xbfe6ff);
        colpetto(this, this.bacinella, 1.12, 0.9);
        scritta(this, BAC.x, BAC.y - 40, 'PULITA!', { size: 8, color: '#7dff9a', durata: 400 });
      }
    } else this.tSciacquo = 0;
    this.avvisoLama.setVisible(pienezza >= 1);
    const g = this.barraLama;
    g.clear();
    if (!pennelloInMano) {
      g.fillStyle(0x1f1430, 0.85); g.fillRoundedRect(w.x + 13, w.y - 2, 6, 24, 3);
      g.fillStyle(pienezza >= 1 ? (Math.floor(this.trascorso * 8) % 2 ? 0xff3b3b : 0xffe14a) : pienezza > 0.7 ? 0xffa53b : 0x7dff9a);
      if (pienezza > 0.05) g.fillRoundedRect(w.x + 14.5, w.y + 20.5 - 21 * pienezza, 3, 21 * pienezza, 1.5);
    }

    // --- la schiuma si secca ---
    for (let i = 0; i < this.schiuma.length; i++) {
      const s = this.schiuma[i];
      if (s <= 0) continue;
      const n = s - dt;
      this.schiuma[i] = n > 0 ? n : 0;
      if (n <= 0 || (s >= 1.5 && n < 1.5)) this.sporcaSchiuma = true;
    }

    // --- ricrescita ---
    this.tRicrescita += dt;
    if (this.tRicrescita >= 0.25) { this.tRicrescita = 0; this.ricresci(p); }

    // barba e schiuma si ridisegnano al massimo 30 volte al secondo: è il lavoro più pesante
    // del microgioco, e farlo a ogni fotogramma mentre si rade faceva andare il gioco a scatti
    this.tDisegno -= dt;
    if ((this.sporcaBarba || this.sporcaSchiuma) && this.tDisegno <= 0) {
      this.tDisegno = 1 / 30;
      if (this.sporcaBarba) this.ridisegnaBarba();
      if (this.sporcaSchiuma) this.ridisegnaSchiuma();
    }
    const pct = this.percentuale;
    this.testoPct.setText(`RASATA: ${Math.floor(pct)}%`);
    this.testoPct.setColor(pct >= c.soglia ? '#7dff9a' : '#ffffff');
    this.testoTagli.setText(this.tagli ? `CEROTTI: ${this.tagli}  (-${this.tagli * c.malusTaglio} punti)` : '');
    if (pct >= c.sogliaFine) {
      this.bonusTempo = Math.ceil(this.tempoRimasto) * c.bonusPerSecondo;
      this.termina();
    }
  }

  // rasoio su naso, labbra, occhi, orecchie o su un neo
  ahia() {
    if (this.stordito > -0.4) return; // un attimo di tregua tra un urlo e l'altro
    this.stordito = 0.6;
    this.prec = null;
    this.trascorso += this.cfg.penalita;
    this.espressione('urlo', 0.8);
    Audio.sfx('ahia');
    vibra(70);
    scuoti(this, 250, 0.012);
    this.cameras.main.flash(120, 255, 80, 80);
    scritta(this, this.testa.x, 70, 'AHIA!!', { size: 24, color: '#ff6b5a' });
    scritta(this, 440, 50, `-${String(this.cfg.penalita).replace('.', ',')} SEC`, { size: 9, color: '#ff6b5a', durata: 900 });
    this.tweens.add({ targets: this.spost, sy: 1.12, sx: 0.92, duration: 80, yoyo: true, repeat: 2 });
  }

  // rasoio troppo veloce: taglietto e cerotto
  taglio(loc) {
    const c = this.cfg;
    this.tTaglio = 0.9;
    this.tagli++;
    this.trascorso += c.penalitaTaglio;
    // il cerotto va sulla pelle: se il taglietto è arrivato dove la barba esce dal viso
    // (sotto il mento, oltre le guance) si sposta verso il centro finché non ci sta
    let k = 0;
    while (k < 1 && !sulViso(lerp(loc.x, 48, k), lerp(loc.y, 64, k), 4)) k += 0.04;
    const cx = lerp(loc.x, 48, k), cy = lerp(loc.y, 64, k);
    this.testa.add(im(this, cx - FACCIA.w / 2, cy - FACCIA.h / 2, 'cerotto').setAngle(Phaser.Math.Between(-50, 50)));
    this.espressione('urlo', 0.5);
    Audio.sfx('errore');
    vibra(40);
    scuoti(this, 120, 0.006);
    scritta(this, this.testa.x, 78, 'TAGLIETTO! PIANO!', { size: 12, color: '#ff9a8a' });
    scritta(this, 440, 50, `-${String(c.penalitaTaglio).replace('.', ',')} SEC`, { size: 9, color: '#ff6b5a', durata: 900 });
  }

  scatto() {
    const d = (Math.random() < 0.5 ? -1 : 1) * Phaser.Math.Between(14, 26);
    this.tweens.add({ targets: this.spost, x: d, duration: 110, ease: 'Quad.out', yoyo: true, hold: 350 });
  }

  gira() {
    const d = (Math.random() < 0.5 ? -1 : 1) * 0.2;
    this.tweens.add({ targets: this.spost, rot: d, duration: 220, ease: 'Quad.out', yoyo: true, hold: 500 });
  }

  // si mette a chiacchierare: a bocca aperta la zona delle labbra è più grande
  parla() {
    this.espressione('parla', 1.5);
    scritta(this, Math.min(400, this.testa.x + 96), 82, caso(this.cfg.chiacchiere), { size: 7, color: '#ffffff', durata: 1100 });
    this.time.addEvent({ delay: 150, repeat: 8, callback: () => {
      if (this.espr !== 'parla') return;
      this.imgTop.setTexture(this.imgTop.texture.key === 'marcoTop_parla' ? 'marcoTop_normale' : 'marcoTop_parla');
    } });
  }

  sbadiglio() {
    this.espressione('sbadiglio', 1.3);
    Audio.sfx('sbadiglio');
    scritta(this, this.testa.x + 90, 80, 'YAAAWN...', { size: 8, color: '#ffffff', durata: 1000 });
    this.tweens.add({ targets: this.spost, y: -10, sy: 1.07, duration: 500, ease: 'Sine.inOut', yoyo: true, hold: 300 });
  }

  starnuto() {
    this.espressione('starnuto', 1.1);
    scritta(this, this.testa.x - 90, 80, 'Eh... eh...', { size: 8, color: '#ffffff', durata: 500 });
    this.tweens.add({ targets: this.spost, y: -6, duration: 600, ease: 'Sine.in' });
    this.time.delayedCall(620, () => {
      if (!this.inCorso) return;
      Audio.sfx('starnuto');
      scritta(this, this.testa.x, 70, 'ETCIÙ!!', { color: '#ffffff' });
      fumo(this, this.testa.x, this.testa.y + 30, 6, 580);
      scuoti(this, 150, 0.008);
      this.tweens.add({ targets: this.spost, y: 18, sx: 1.08, sy: 0.94, duration: 80, ease: 'Quad.out', yoyo: true, hold: 60, onComplete: () => Object.assign(this.spost, { y: 0, sx: 1, sy: 1 }) });
    });
  }

  risultato() {
    const c = this.cfg, pct = Math.floor(this.percentuale), malus = this.tagli * c.malusTaglio;
    return {
      punteggio: Math.max(0, pct + this.bonusTempo - malus),
      vittoria: pct >= c.soglia,
      riepilogo: `Rasata ${pct}%  +${this.bonusTempo} tempo  -${malus} cerotti`,
    };
  }

  // De Luca si guarda allo specchio
  finale(ris, fatto) {
    this.tweens.killTweensOf(this.spost);
    this.rasoio.setVisible(false);
    this.pennello.setVisible(false);
    this.hudBarba.forEach((o) => o.setVisible(false));
    this.schiuma.fill(0);
    this.ridisegnaSchiuma();
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.8, duration: 300 });
    // cornice dello specchio
    const sp = this.add.graphics().setDepth(701);
    sp.fillStyle(0x6b4a0c); sp.fillRoundedRect(124, 32, 232, 236, 14);
    sp.fillStyle(0xf2c94c); sp.fillRoundedRect(127, 35, 226, 230, 12);
    sp.fillStyle(0xc8901a); sp.fillRoundedRect(133, 41, 214, 218, 9);
    sp.fillStyle(0xbfe6f4); sp.fillRoundedRect(137, 45, 206, 210, 7);
    sp.fillStyle(0xe4f6fc); sp.fillRoundedRect(150, 54, 9, 70, 4); sp.fillRoundedRect(163, 54, 4, 40, 2);
    sp.alpha = 0;
    this.tweens.add({ targets: sp, alpha: 1, duration: 300 });
    this.testa.setDepth(702).setScale(SCALA);
    this.tweens.add({ targets: this.testa, x: 240, y: 152, rotation: 0, duration: 300 });

    this.time.delayedCall(900, () => {
      if (ris.vittoria) {
        this.espressione('felice');
        Audio.sfx('vittoria');
        txt(this, 240, 20, 'CHE BELLEZZA!', { size: 16, color: '#7dff9a', depth: 710 });
        for (let i = 0; i < 4; i++) this.time.delayedCall(i * 250, () => stelle(this, 160 + Math.random() * 160, 80 + Math.random() * 120, 8, 705));
        this.tweens.add({ targets: this.testa, scaleY: SCALA * 1.05, scaleX: SCALA * 0.97, y: 146, duration: 220, yoyo: true, repeat: -1 });
      } else {
        // barba a chiazze: un po' di ricrescita qua e là per peggiorare il quadro
        for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
          const i = gy * GW + gx, chiazza = ((gx >> 2) * 5 + (gy >> 2) * 3) % 4;
          if (this.celle[i] === 0 && chiazza === 0) this.celle[i] = Math.random() < 0.5 ? 1 : 0.5;
        }
        this.ridisegnaBarba();
        this.espressione('sconvolto');
        Audio.sfx('sconfitta');
        txt(this, 240, 20, "MA CHE M'HAI FATTO?!", { size: 16, color: '#ff6b5a', depth: 710 });
        scuoti(this, 300, 0.01);
        this.tweens.add({ targets: this.testa, x: 243, duration: 50, yoyo: true, repeat: -1 });
      }
    });
    this.time.delayedCall(3600, fatto);
  }
}
