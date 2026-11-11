// Prima della partita: quanti si è, chi sceglie chi (in stile picchiaduro), come si gioca.
// Ogni schermata parte dall'ultima scelta fatta: per rigiocare uguale basta premere INVIO.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { LIVELLI, NOMI_LIVELLI } from '../livelli.js';
import { Sessione } from '../sessione.js';
import { SP, ritratto } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, ombra, menuLista, molleggia, stelle, caso, eTouch, perDito, pulsante } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

const colore = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;
const sigla = (i) => 'G' + (i + 1);

// ------------------------------------------------------------
//  1. QUANTI SIETE?
// ------------------------------------------------------------
export class GiocatoriScene extends Phaser.Scene {
  constructor() { super('Giocatori'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    raggi(this, 0x4a9fe8, 0x7cc0f8);
    txt(this, 240, 34, 'QUANTI SIETE?', { size: 22, color: '#ffe14a' });
    const max = CONFIG.maxGiocatori, passo = Math.min(50, 420 / max), lato = passo - 6, x0 = 240 - ((max - 1) * passo) / 2, Y = 118;
    let sel = Phaser.Math.Clamp(Sessione.n, 1, max);
    const g = this.add.graphics();
    const numeri = [...Array(max).keys()].map((i) => txt(this, x0 + i * passo, Y, String(i + 1), { size: Math.min(22, lato * 0.5) }));
    const sotto = txt(this, 240, 172, '', { size: 9, wrap: 420 });
    const agg = () => {
      g.clear();
      numeri.forEach((t, i) => {
        const x = x0 + i * passo, scelto = i + 1 === sel;
        g.fillStyle(0x000000, 0.25); g.fillRoundedRect(x - lato / 2 + 1.5, Y - lato / 2 + 2.5, lato, lato, 8);
        g.fillStyle(scelto ? 0xffe14a : 0x1f1430, scelto ? 1 : 0.8); g.fillRoundedRect(x - lato / 2, Y - lato / 2, lato, lato, 8);
        if (!scelto) { g.lineStyle(1.2, 0xffe14a, 0.6); g.strokeRoundedRect(x - lato / 2, Y - lato / 2, lato, lato, 8); }
        t.setColor(scelto ? '#1f1430' : '#ffffff').setStroke(scelto ? '#ffe14a' : '#1f1430', scelto ? 0 : 4).setScale(scelto ? 1.2 : 1);
      });
      sotto.setText(sel === 1 ? 'Da solo: allenamento, un microgioco alla volta'
        : `In ${sel}: un turno a testa sullo stesso microgioco, ${perDito('passandosi la tastiera', 'passandosi il telefono')}`);
    };
    const vai = () => { Audio.sfx('scegli'); this.scene.start('Personaggi', { n: sel }); };
    const cambia = (d) => { sel = ((sel - 1 + d + max) % max) + 1; Audio.sfx('muovi'); agg(); };
    numeri.forEach((_t, i) => {
      this.add.rectangle(x0 + i * passo, Y, passo, lato + 12, 0x000000, 0.001).setInteractive({ useHandCursor: true })
        .on('pointerover', () => { if (sel !== i + 1) { sel = i + 1; Audio.sfx('muovi'); agg(); } })
        .on('pointerdown', () => { sel = i + 1; agg(); vai(); });
    });
    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => cambia(-1));
    kb.on('keydown-RIGHT', () => cambia(1));
    kb.on('keydown', (e) => { const k = Number(e.key); if (!e.repeat && k >= 1 && k <= max) { sel = k; agg(); vai(); } });
    for (const k of ['ENTER', 'SPACE']) kb.on('keydown-' + k, (e) => { if (!e.repeat) vai(); });
    kb.on('keydown-ESC', () => this.scene.start('Menu'));
    if (eTouch()) pulsante(this, 16, 13, 'indietro', () => this.scene.start('Menu'));
    txt(this, 240, 246, perDito('SINISTRA / DESTRA (o un numero) e INVIO, oppure il mouse      ESC: menu', 'Tocca un numero'), { size: 7, color: '#fff3d6' });
    agg();
    pulsantiAngolo(this);
  }
}

// ------------------------------------------------------------
//  2. SCEGLI IL PERSONAGGIO (uno per giocatore, a turno)
//  A sinistra l'anteprima grande di quello su cui sta il cursore; a destra la griglia dei
//  ritratti (chi è già preso resta spento, con la sigla di chi l'ha scelto) e la casella
//  "A CASO"; sotto, i giocatori già fatti. dati.n = quanti giocatori.
// ------------------------------------------------------------
// (cinque colonne per quattro righe: c'è posto per diciannove personaggi più "A CASO"; nelle
// celle il nome breve, quello intero e il soprannome nell'anteprima a sinistra)
const COL = 5, CELLA = { w: 52, h: 40, x0: 222, y0: 64 };

export class PersonaggiScene extends Phaser.Scene {
  constructor() { super('Personaggi'); }
  create(dati) {
    inquadra(this);
    this.input.setDefaultCursor('default');
    raggi(this, 0xb5651d, 0xd98a3a);
    const P = CONFIG.personaggiGiocabili, n = Phaser.Math.Clamp(dati?.n ?? Sessione.n, 1, Math.min(CONFIG.maxGiocatori, P.length));
    const celle = [...P.map((p) => ({ p })), { caso: true }];       // l'ultima casella pesca a caso
    const posto = (i) => [CELLA.x0 + (i % COL) * CELLA.w, CELLA.y0 + Math.floor(i / COL) * CELLA.h];
    // si parte dai personaggi dell'ultima volta: se il numero è lo stesso, è già tutto scelto
    let scelti = Sessione.giocatori.map((g) => g.id).filter((id) => P.some((p) => p.id === id)).slice(0, n);
    let cur = Math.max(0, celle.findIndex((c) => c.p && !scelti.includes(c.p.id)));
    const completo = () => scelti.length >= n;

    // (il titolo un po' a sinistra: sul telefono in alto a destra ci sono audio e schermo intero)
    txt(this, 312, 22, n === 1 ? 'SCEGLI IL PERSONAGGIO' : 'SCEGLIETE I PERSONAGGI', { size: 11, color: '#ffe14a' });
    pannello(this, 92, 148, 172, 232, { alfa: 0.5, bordo: null, raggio: 12 });
    const chi = txt(this, 92, 44, '', { size: 10 });
    ombra(this, 92, 212, 64);
    const anteprima = im(this, 92, 212, P[0].id + '_normale').setOrigin(0.5, 1).setScale(3.2 * SP);
    molleggia(this, anteprima, 360);
    const dubbio = txt(this, 92, 140, '?', { size: 70, color: '#ffe14a' }).setVisible(false);
    const nome = txt(this, 92, 225, '', { size: 11 });
    const soprannome = txt(this, 92, 238, '', { size: 7, color: '#fff3d6' });
    const motto = txt(this, 92, 252, '', { size: 7, color: '#ffe14a', wrap: 168 });

    // la griglia
    const g = this.add.graphics(), cursore = this.add.graphics().setDepth(6);
    const caselle = celle.map((c, i) => {
      const [x, y] = posto(i);
      const cosa = { x, y, sigla: txt(this, x + 17, y - 12, '', { size: 7, depth: 5 }) };
      if (c.caso) { cosa.img = txt(this, x, y - 5, '?', { size: 18, color: '#ffe14a' }); cosa.nome = txt(this, x, y + 13, 'A CASO', { size: 7 }); }
      else { cosa.img = ritratto(this, x, y - 5, c.p.id, 24); cosa.nome = txt(this, x, y + 13, c.p.breve ?? c.p.nome, { size: 7, color: c.p.colore }); }
      this.add.rectangle(x, y, CELLA.w - 2, CELLA.h - 2, 0x000000, 0.001).setInteractive({ useHandCursor: true })
        .on('pointerover', () => { if (cur !== i) { cur = i; Audio.sfx('muovi'); agg(); } })
        .on('pointerdown', () => { cur = i; prendi(); });
      return cosa;
    });
    // sotto la griglia: chi ha già scelto (un tocco su uno lo toglie)
    const fatti = this.add.container(0, 0);
    const avanti = txt(this, 330, 258, '', { size: 9.5, color: '#ffe14a' }).setInteractive({ useHandCursor: true }).on('pointerdown', () => conferma());
    this.tweens.add({ targets: avanti, alpha: 0.35, duration: 400, yoyo: true, repeat: -1 });
    const aiuto = txt(this, 330, 245, '', { size: 7, color: '#fff3d6' });

    const agg = () => {
      const c = celle[cur], libero = (id) => !scelti.includes(id), col = c.p ? colore(c.p.colore) : 0xffffff;
      g.clear(); cursore.clear();
      caselle.forEach((k, i) => {
        const p = celle[i].p, preso = p && !libero(p.id), w = CELLA.w - 5, h = CELLA.h - 5;
        g.fillStyle(0x000000, 0.25); g.fillRoundedRect(k.x - w / 2 + 1.5, k.y - h / 2 + 2, w, h, 7);
        g.fillStyle(preso ? 0x2a2233 : 0x1f1430, preso ? 0.6 : 0.85); g.fillRoundedRect(k.x - w / 2, k.y - h / 2, w, h, 7);
        k.img.setAlpha(preso ? 0.3 : 1); k.nome.setAlpha(preso ? 0.4 : 1);
        const di = p ? scelti.indexOf(p.id) : -1;
        k.sigla.setText(di >= 0 ? sigla(di) : '').setColor(p?.colore ?? '#ffffff');
      });
      // il cursore: del colore del personaggio su cui sta
      const [cx, cy] = posto(cur);
      cursore.lineStyle(3, 0x1f1430, 1); cursore.strokeRoundedRect(cx - CELLA.w / 2 + 1, cy - CELLA.h / 2 + 1, CELLA.w - 2, CELLA.h - 2, 8);
      cursore.lineStyle(2, col, 1); cursore.strokeRoundedRect(cx - CELLA.w / 2 + 1, cy - CELLA.h / 2 + 1, CELLA.w - 2, CELLA.h - 2, 8);
      // l'anteprima
      const turno = Math.min(scelti.length, n - 1);
      chi.setText(completo() ? (n === 1 ? 'PRONTO!' : 'TUTTI PRONTI!') : n === 1 ? 'CHI SEI?' : `GIOCATORE ${turno + 1} DI ${n}`).setColor(completo() ? '#7dff9a' : '#ffffff');
      anteprima.setVisible(!!c.p); dubbio.setVisible(!c.p);
      if (c.p) {
        anteprima.setTexture(c.p.id + '_normale').setAlpha(libero(c.p.id) || completo() ? 1 : 0.45);
        nome.setText(c.p.nome.toUpperCase()).setColor(c.p.colore);
        soprannome.setText(c.p.soprannome ?? '');
        motto.setText(c.p.esulta ? `"${c.p.esulta}"` : '');
      } else { nome.setText('A CASO').setColor('#ffffff'); soprannome.setText('pesca uno di quelli liberi'); motto.setText(''); }
      // la fila di chi ha scelto
      fatti.removeAll(true);
      const passo = Math.min(34, 270 / n);
      scelti.forEach((id, i) => {
        const p = P.find((q) => q.id === id), x = 330 + (i - (n - 1) / 2) * passo;
        const zona = this.add.rectangle(x, 219, passo - 2, 30, 0x000000, 0.001).setInteractive({ useHandCursor: true }).on('pointerdown', () => togli(i));
        fatti.add([ritratto(this, x, 216, id, 18), txt(this, x, 230, sigla(i), { size: 7, color: p.colore }), zona]);
      });
      for (let i = scelti.length; i < n; i++) fatti.add(txt(this, 330 + (i - (n - 1) / 2) * passo, 219, sigla(i), { size: 7, color: '#8a7aa8' }));
      avanti.setText(completo() ? perDito('INVIO: avanti', 'TOCCA QUI: AVANTI') : '');
      aiuto.setText(completo() ? perDito('BACKSPACE: togli l\'ultimo     ESC: indietro', 'Tocca un giocatore qui sopra per cambiarlo')
        : perDito('FRECCE e INVIO, oppure il mouse     BACKSPACE: togli l\'ultimo', 'Tocca un personaggio'));
    };

    // prende per il giocatore di turno il personaggio sotto il cursore (o uno a caso)
    const prendi = () => {
      if (completo()) return;
      const c = celle[cur], liberi = P.filter((p) => !scelti.includes(p.id));
      const p = c.caso ? caso(liberi) : c.p;
      if (!p || scelti.includes(p.id)) return Audio.sfx('errore');
      scelti.push(p.id);
      Audio.sfx('scegli');
      const [x, y] = posto(P.indexOf(p));
      stelle(this, x, y, 5, 20);
      // il cursore passa al prossimo libero
      if (!completo()) { const k = celle.findIndex((q) => q.p && !scelti.includes(q.p.id)); if (c.caso) cur = celle.length - 1; else if (k >= 0) cur = k; }
      else cur = P.indexOf(p);
      agg();
    };
    const togli = (i = scelti.length - 1) => {
      if (i < 0 || i >= scelti.length) return false;
      scelti.splice(i, 1);
      Audio.sfx('muovi');
      agg();
      return true;
    };
    const conferma = () => {
      if (!completo()) return;
      Audio.sfx('scegli');
      Sessione.imposta(scelti);
      Sessione.salva();
      this.scene.start('Modalita');
    };
    const muovi = (dx, dy) => {
      let c = cur % COL, r = Math.floor(cur / COL);
      const righe = Math.ceil(celle.length / COL);
      if (dx) c = (c + dx + COL) % COL;
      if (dy) r = (r + dy + righe) % righe;
      cur = Math.min(celle.length - 1, r * COL + c);
      Audio.sfx('muovi');
      agg();
    };
    const indietro = () => this.scene.start('Giocatori');
    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => muovi(-1, 0));
    kb.on('keydown-RIGHT', () => muovi(1, 0));
    kb.on('keydown-UP', () => muovi(0, -1));
    kb.on('keydown-DOWN', () => muovi(0, 1));
    for (const k of ['ENTER', 'SPACE']) kb.on('keydown-' + k, (e) => { if (e.repeat) return; if (completo()) conferma(); else prendi(); });
    for (const k of ['BACKSPACE', 'DELETE']) kb.on('keydown-' + k, () => togli());
    kb.on('keydown-ESC', () => { if (!togli()) indietro(); });
    if (eTouch()) pulsante(this, 16, 13, 'indietro', indietro);
    agg();
    pulsantiAngolo(this);
  }
}

// i livelli dei giocatori in breve: "tutti NORMALE" o "2 FACILE, 1 DIFFICILE..."
function livelliInBreve(G) {
  const l = G.map((g) => Sessione.livelloDi(g.id));
  if (l.every((x) => x === l[0])) return `tutti ${NOMI_LIVELLI[l[0]]}`;
  return LIVELLI.filter((x) => l.includes(x)).map((x) => `${l.filter((y) => y === x).length} ${NOMI_LIVELLI[x]}`).join(', ');
}

// ------------------------------------------------------------
//  3. COME SI GIOCA? A QUADRANTI (scheda di valutazione 2): quattro riquadri grandi (da due in su:
//  AL MEGLIO DI, SFIDA, LAMPO, PARTY; da soli: ALLENAMENTO, DA SOLO, SFIDA DEL GIORNO, LAMPO).
//  Toccandone uno si sceglie quanto lunga: al meglio di 3 o 5, una sfida da 3, 5, 8 microgiochi o
//  completa, un Lampo da 3, 6 o 10. Sotto, in piccolo: partita singola, livelli, personaggi.
//  Si parte dal riquadro dell'ultima partita: per rigiocare uguale basta INVIO, INVIO.
// ------------------------------------------------------------

// i riquadri che si scelgono con le frecce (verso il più vicino in quella direzione), il mouse o il
// dito. Ogni voce: { x, y, w, h, colore, azione, spento, disegna(g, x, y, w, h, scelto) }
function riquadri(scene, voci, iniziale = 0) {
  let sel = Phaser.Math.Clamp(iniziale, 0, voci.length - 1);
  const g = scene.add.graphics();
  const agg = () => {
    g.clear();
    voci.forEach((v, i) => {
      const su = i === sel, { x, y, w, h } = v, r = Math.min(12, h / 3);
      g.fillStyle(0x000000, 0.3); g.fillRoundedRect(x - w / 2 + 2, y - h / 2 + 3, w, h, r);
      g.fillStyle(v.spento ? 0x3a3346 : v.colore, v.spento ? 0.7 : 0.92); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
      g.fillStyle(0xffffff, v.spento ? 0.03 : 0.12); g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h * 0.42, { tl: r - 2, tr: r - 2, bl: 4, br: 4 });
      g.lineStyle(su ? 3 : 1.4, su ? 0xffe14a : 0x1f1430, 1); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
      if (su) { g.lineStyle(1, 0x1f1430, 1); g.strokeRoundedRect(x - w / 2 - 2.5, y - h / 2 - 2.5, w + 5, h + 5, r + 2); }
      v.testi?.forEach((t) => t.setAlpha(v.spento ? 0.45 : 1));
    });
    voci[sel].aggiorna?.();
  };
  voci.forEach((v, i) => {
    scene.add.rectangle(v.x, v.y, v.w, v.h, 0x000000, 0.001).setInteractive({ useHandCursor: true })
      .on('pointerover', () => { if (sel !== i) { sel = i; Audio.sfx('muovi'); agg(); } })
      .on('pointerdown', () => { Audio.sblocca?.(); sel = i; agg(); scegli(); });
  });
  const scegli = () => { const v = voci[sel]; if (v.spento) return Audio.sfx('vuoto'); Audio.sfx('scegli'); v.azione(); };
  const muovi = (dx, dy) => {
    const a = voci[sel];
    let meglio = -1, dist = Infinity;
    voci.forEach((b, i) => {
      const vx = b.x - a.x, vy = b.y - a.y, avanti = vx * dx + vy * dy;
      if (i === sel || avanti <= 4) return;
      const d = avanti + Math.abs(vx * dy + vy * dx) * 2.2;
      if (d < dist) { dist = d; meglio = i; }
    });
    if (meglio < 0) return;
    sel = meglio; Audio.sfx('muovi'); agg();
  };
  const kb = scene.input.keyboard;
  kb.on('keydown-LEFT', () => muovi(-1, 0));
  kb.on('keydown-RIGHT', () => muovi(1, 0));
  kb.on('keydown-UP', () => muovi(0, -1));
  kb.on('keydown-DOWN', () => muovi(0, 1));
  for (const k of ['ENTER', 'SPACE']) kb.on('keydown-' + k, (e) => { if (!e.repeat) scegli(); });
  agg();
  return { agg };
}

// il fulmine del Lampo, disegnato
function fulmine(g, x, y, k = 1, colore = 0xffe14a) {
  g.fillStyle(0x1f1430, 1);
  g.fillPoints([[2, -11], [-6, 2], [-0.5, 2], [-3, 12], [7, -3], [1.5, -3], [5, -11]].map(([a, b]) => new Phaser.Geom.Point(x + a * k * 1.18, y + b * k * 1.12)), true);
  g.fillStyle(colore, 1);
  g.fillPoints([[2, -11], [-6, 2], [-0.5, 2], [-3, 12], [7, -3], [1.5, -3], [5, -11]].map(([a, b]) => new Phaser.Geom.Point(x + a * k, y + b * k)), true);
}

export class ModalitaScene extends Phaser.Scene {
  constructor() { super('Modalita'); }
  create(dati) {
    inquadra(this);
    this.input.setDefaultCursor('default');
    raggi(this, 0x3fae74, 0x62cf96);
    const S = Sessione, G = S.giocatori, n = S.n, tutti = CONFIG.ordineSfida.length, MO = CONFIG.modalita;
    const gruppo = dati?.gruppo ?? null, u = S.ultima;
    txt(this, 240, 17, 'COME SI GIOCA?', { size: 15, color: '#ffe14a' });
    // chi gioca, in fila
    const passo = Math.min(58, 400 / n);
    G.forEach((g, i) => {
      const x = 240 + (i - (n - 1) / 2) * passo;
      ritratto(this, x, 42, g.id, 20);
      txt(this, x, 57, g.nome, { size: n > 6 || g.nome.length > 10 ? 4.6 : 5.6, color: g.colore });
    });
    const via = (fn) => () => { fn(); this.scene.start('Intro'); };
    const apri = (gr) => () => this.scene.restart({ gruppo: gr });
    const esci = () => (gruppo ? this.scene.restart({ gruppo: null }) : this.scene.start('Personaggi', { n }));
    const fondo = this.add.graphics().setDepth(1);
    const testo = (x, y, s, o) => txt(this, x, y, s, { depth: 2, ...o });

    // un riquadro grande: titolo, una riga sotto e le "pillole" delle scelte che ci sono dentro
    const quadrante = (v, x, y, titolo, sotto, pillole = [], icona) => {
      const w = 200, h = 70;
      Object.assign(v, { x, y, w, h });
      v.testi = [testo(x, y - 20, titolo, { size: 12 }), testo(x, y - 4, sotto, { size: 7, color: '#fff3d6' })];
      if (pillole.length) {
        const larg = pillole.map((p) => Math.max(18, p.length * 6 + 8)), tot = larg.reduce((a, b) => a + b, 0) + (pillole.length - 1) * 5;
        let px = x - tot / 2;
        pillole.forEach((p, k) => {
          const cx = px + larg[k] / 2;
          fondo.fillStyle(0x1f1430, 0.55); fondo.fillRoundedRect(px, y + 9, larg[k], 15, 7.5);
          v.testi.push(testo(cx, y + 16.5, p, { size: 7, color: '#ffe14a' }));
          px += larg[k] + 5;
        });
      }
      if (icona === 'lampo') { const ig = this.add.graphics().setDepth(2); fulmine(ig, x - w / 2 + 18, y - 14, 0.9); fulmine(ig, x + w / 2 - 18, y - 14, 0.9); }
      return v;
    };
    // una scelta dentro un riquadro: il numero grande e sotto cosa vuol dire
    const scelta = (v, x, y, grande, sotto, w = 84, h = 74) => {
      Object.assign(v, { x, y, w, h });
      v.testi = [testo(x, y - 9, grande, { size: grande.length > 3 ? 11 : 24 }), testo(x, y + 20, sotto, { size: 7, color: '#fff3d6', wrap: w - 6 })];
      return v;
    };
    // le pillole piccole in fondo (partita singola, livelli, personaggi, indietro)
    const pillola = (v, x, y, s) => {
      const t = testo(x, y, s, { size: 7.5 });
      return Object.assign(v, { x, y, w: Math.max(70, t.width + 18), h: 18, colore: 0x1f1430, testi: [t] });
    };
    const fila = (voci, y) => {
      const larg = voci.map((v) => v.w), tot = larg.reduce((a, b) => a + b, 0) + (voci.length - 1) * 8;
      let x = 240 - tot / 2;
      voci.forEach((v) => { const dx = x + v.w / 2 - v.x; v.x += dx; v.testi.forEach((t) => (t.x += dx)); x += v.w + 8; });
      return voci;
    };
    const titolo = (s, sotto, colore) => { testo(240, 82, s, { size: 15, color: '#ffe14a' }); testo(240, 100, sotto, { size: 7.5, color: '#fff3d6' }); return colore; };
    const opzioni = (voci) => {
      const W = voci.length <= 3 ? 108 : 84, gap = 10, tot = voci.length * W + (voci.length - 1) * gap;
      return voci.map((v, i) => scelta({ colore: v.colore, azione: v.azione, spento: v.spento }, 240 - tot / 2 + W / 2 + i * (W + gap), 152, v.grande, v.sotto, W));
    };

    let voci, iniziale = 0;
    const bassi = [];
    const livello = (s) => pillola({ azione: () => this.scene.start('Livelli') }, 0, 232, s);
    if (gruppo === 'meglio') {
      const c = titolo('AL MEGLIO DI', 'Round dopo round: vince chi ne vince di più', 0xc8412f);
      voci = opzioni(CONFIG.alMeglioDi.map((m) => ({ colore: c, grande: String(m), sotto: `vince chi arriva a ${Math.ceil(m / 2)}`, azione: via(() => S.nuovaSfidaVeloce(m)) })));
      iniziale = Math.max(0, CONFIG.alMeglioDi.indexOf(u?.meglioDi));
    } else if (gruppo === 'sfida') {
      const c = titolo('SFIDA', 'Più microgiochi di fila: vince chi fa più punti sfida', 0x2f6fc8);
      const quanti = CONFIG.sfidaRapida.filter((k) => k < tutti);
      voci = opzioni([
        ...quanti.map((k) => ({ colore: c, grande: String(k), sotto: 'microgiochi a caso', azione: via(() => S.nuovaSfidaRapida(k)) })),
        { colore: c, grande: 'TUTTI', sotto: `tutti i ${tutti} microgiochi`, azione: via(() => S.nuovaSfida()) },
      ]);
      iniziale = u?.tipo === 'completa' ? quanti.length : Math.max(0, quanti.indexOf(u?.tipo === 'rapida' ? u.lista.length : -1));
    } else if (gruppo === 'lampo') {
      const c = titolo('LAMPO', `Microgiochi da ${MO.lampo.durata} secondi, uno dopo l'altro`, 0x7a3fc8);
      const quanti = MO.lampo.scelte ?? [MO.lampo.microgiochi];
      voci = opzioni(quanti.map((k) => ({ colore: c, grande: String(k), sotto: 'microgiochi lampo', azione: via(() => S.nuovoLampo(k)) })));
      const k = quanti.indexOf(u?.tipo === 'lampo' ? u.lista.length : MO.lampo.microgiochi);
      iniziale = Math.max(0, k);
    } else if (gruppo === 'party') {
      const c = titolo('PARTY', 'Le partite speciali per la compagnia', 0xd8862a);
      const bp = MO.beerpong, inBP = n >= bp.minimo && n <= bp.massimo;
      voci = opzioni([
        { colore: c, grande: 'SQUADRE', sotto: n >= MO.squadre.minimo ? `${MO.squadre.nomi[0]} contro ${MO.squadre.nomi[1]}` : `da ${MO.squadre.minimo} giocatori`, spento: n < MO.squadre.minimo, azione: via(() => S.nuoveSquadre()) },
        { colore: c, grande: 'TORNEO', sotto: n >= MO.torneo.minimo ? 'tabellone a eliminazione' : `da ${MO.torneo.minimo} giocatori`, spento: n < MO.torneo.minimo, azione: via(() => S.nuovoTorneo()) },
        { colore: c, grande: 'BEER PONG', sotto: inBP ? `${Math.floor(n / 2)} contro ${Math.floor(n / 2)}` + (n % 2 ? ' e un arbitro' : '') : `da ${bp.minimo} a ${bp.massimo} giocatori`, spento: !inBP,
          azione: () => { S.nuovoBeerPong(); this.scene.start('BeerPongSquadre'); } },
      ]);
      iniziale = Math.max(0, ['squadre', 'torneo', 'beerpong'].indexOf(u?.tipo));
      if (voci[iniziale].spento) iniziale = Math.max(0, voci.findIndex((v) => !v.spento));
    } else if (n === 1) {
      voci = [
        quadrante({ colore: 0x3f9a5a, azione: () => this.scene.start('Allenamento') }, 136, 104, 'ALLENAMENTO', 'un microgioco a scelta'),
        quadrante({ colore: 0xc8412f, azione: via(() => S.nuovoSolitario(0)) }, 344, 104, 'DA SOLO', `${MO.solitario.vite} vite, ${MO.solitario.microgiochi} microgiochi e il boss`),
        quadrante({ colore: 0x2f6fc8, azione: via(() => S.nuovaSfidaDelGiorno(0)) }, 136, 182, 'SFIDA DEL GIORNO', `${MO.giorno.microgiochi} microgiochi, uguali per tutti oggi`),
        quadrante({ colore: 0x7a3fc8, azione: via(() => S.nuovoLampo()) }, 344, 182, 'LAMPO', `${MO.lampo.microgiochi} microgiochi da ${MO.lampo.durata} secondi`, [], 'lampo'),
      ];
      iniziale = Math.max(0, ['allenamento', 'solitario', 'giorno', 'lampo'].indexOf(u?.tipo));
      bassi.push(livello(`LIVELLO: ${livelliInBreve(G).replace('tutti ', '')}`), pillola({ azione: () => this.scene.start('Personaggi', { n }) }, 0, 232, 'CAMBIA PERSONAGGIO'));
    } else {
      voci = [
        quadrante({ colore: 0xc8412f, azione: apri('meglio') }, 136, 104, 'AL MEGLIO DI', 'vince chi vince più round', CONFIG.alMeglioDi.map(String)),
        quadrante({ colore: 0x2f6fc8, azione: apri('sfida') }, 344, 104, 'SFIDA', 'più microgiochi di fila', [...CONFIG.sfidaRapida.filter((k) => k < tutti).map(String), 'TUTTI']),
        quadrante({ colore: 0x7a3fc8, azione: apri('lampo') }, 136, 182, 'LAMPO', `microgiochi da ${MO.lampo.durata} secondi`, (MO.lampo.scelte ?? [MO.lampo.microgiochi]).map(String), 'lampo'),
        quadrante({ colore: 0xd8862a, azione: apri('party') }, 344, 182, 'PARTY', 'per la compagnia', n >= MO.squadre.minimo ? ['SQUADRE', 'TORNEO', 'BEER PONG'] : ['BEER PONG']),
      ];
      const t = u?.tipo;
      iniziale = t === 'meglioDi' ? 0 : t === 'rapida' || t === 'completa' ? 1 : t === 'lampo' && u.lista.length > 1 ? 2 : ['squadre', 'torneo', 'beerpong'].includes(t) ? 3 : 0;
      bassi.push(pillola({ azione: () => this.scene.start('Allenamento') }, 0, 232, 'PARTITA SINGOLA'), livello(`LIVELLI: ${livelliInBreve(G)}`), pillola({ azione: () => this.scene.start('Personaggi', { n }) }, 0, 232, 'PERSONAGGI'));
    }
    if (gruppo) bassi.push(pillola({ azione: esci }, 0, 232, 'INDIETRO'));
    fila(bassi, 232);
    riquadri(this, [...voci, ...bassi], iniziale);
    txt(this, 240, 254, perDito(gruppo ? 'Frecce + INVIO, oppure il mouse      ESC: indietro' : 'Frecce + INVIO, oppure il mouse      ESC: cambia personaggi', 'Tocca per scegliere'), { size: 6.5, color: '#fff3d6' });
    this.input.keyboard.on('keydown-ESC', esci);
    if (eTouch()) pulsante(this, 16, 13, 'indietro', esci);
    pulsantiAngolo(this);
  }
}
