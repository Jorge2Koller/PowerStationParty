// Prima della partita: quanti si è, chi sceglie chi (in stile picchiaduro), come si gioca.
// Ogni schermata parte dall'ultima scelta fatta: per rigiocare uguale basta premere INVIO.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { LIVELLI, NOMI_LIVELLI } from '../livelli.js';
import { Progressi } from '../progressi.js';
import { Sessione } from '../sessione.js';
import { SP, ritratto } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, ombra, menuLista, molleggia, stelle, caso, eTouch, perDito, pulsante, scritta } from '../fx.js';
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
// (sei colonne per tre righe: c'è posto per diciassette personaggi più "A CASO")
const COL = 6, CELLA = { w: 46, h: 49, x0: 215, y0: 68 };

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

    txt(this, 330, 20, n === 1 ? 'SCEGLI IL PERSONAGGIO' : 'SCEGLIETE I PERSONAGGI', { size: 13, color: '#ffe14a' });
    pannello(this, 92, 148, 172, 232, { alfa: 0.5, bordo: null, raggio: 12 });
    const chi = txt(this, 92, 44, '', { size: 10 });
    ombra(this, 92, 212, 64);
    const anteprima = im(this, 92, 212, P[0].id + '_normale').setOrigin(0.5, 1).setScale(3.2 * SP);
    molleggia(this, anteprima, 360);
    const dubbio = txt(this, 92, 140, '?', { size: 70, color: '#ffe14a' }).setVisible(false);
    const nome = txt(this, 92, 225, '', { size: 11 });
    const soprannome = txt(this, 92, 238, '', { size: 6.5, color: '#fff3d6' });
    const motto = txt(this, 92, 251, '', { size: 5.6, color: '#ffe14a', wrap: 168 });

    // la griglia
    const g = this.add.graphics(), cursore = this.add.graphics().setDepth(6);
    const caselle = celle.map((c, i) => {
      const [x, y] = posto(i);
      const cosa = { x, y, sigla: txt(this, x + 14, y - 15, '', { size: 6, depth: 5 }) };
      if (c.caso) { cosa.img = txt(this, x, y - 5, '?', { size: 22, color: '#ffe14a' }); cosa.nome = txt(this, x, y + 16, 'A CASO', { size: 4.8 }); }
      else { cosa.img = ritratto(this, x, y - 5, c.p.id, 30); cosa.nome = txt(this, x, y + 16, c.p.nome, { size: c.p.nome.length > 11 ? 4.2 : 4.8, color: c.p.colore }); }
      this.add.rectangle(x, y, CELLA.w - 2, CELLA.h - 2, 0x000000, 0.001).setInteractive({ useHandCursor: true })
        .on('pointerover', () => { if (cur !== i) { cur = i; Audio.sfx('muovi'); agg(); } })
        .on('pointerdown', () => { cur = i; prendi(); });
      return cosa;
    });
    // sotto la griglia: chi ha già scelto (un tocco su uno lo toglie)
    const fatti = this.add.container(0, 0);
    const avanti = txt(this, 330, 258, '', { size: 9.5, color: '#ffe14a' }).setInteractive({ useHandCursor: true }).on('pointerdown', () => conferma());
    this.tweens.add({ targets: avanti, alpha: 0.35, duration: 400, yoyo: true, repeat: -1 });
    const aiuto = txt(this, 330, 246, '', { size: 5.6, color: '#fff3d6' });

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
        fatti.add([ritratto(this, x, 216, id, 18), txt(this, x, 230, sigla(i), { size: 5, color: p.colore }), zona]);
      });
      for (let i = scelti.length; i < n; i++) fatti.add(txt(this, 330 + (i - (n - 1) / 2) * passo, 219, sigla(i), { size: 6, color: '#8a7aa8' }));
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
//  3. COME SI GIOCA? (da due giocatori in su; da soli c'è solo l'allenamento)
// ------------------------------------------------------------
export class ModalitaScene extends Phaser.Scene {
  constructor() { super('Modalita'); }
  create(dati) {
    inquadra(this);
    this.input.setDefaultCursor('default');
    raggi(this, 0x3fae74, 0x62cf96);
    const S = Sessione, G = S.giocatori, n = S.n, tutti = CONFIG.ordineSfida.length;
    txt(this, 240, 20, 'COME SI GIOCA?', { size: 16, color: '#ffe14a' });
    // chi gioca, in fila
    const passo = Math.min(58, 440 / n);
    G.forEach((g, i) => {
      const x = 240 + (i - (n - 1) / 2) * passo;
      ritratto(this, x, 50, g.id, 24);
      txt(this, x, 67, g.nome, { size: n > 6 || g.nome.length > 10 ? 4.6 : 5.6, color: g.colore });
    });
    const via = (fn) => () => { fn(); this.scene.start('Intro'); };
    // le modalità del Bancone: se non sono ancora tue, si dice dove comprarle
    const delBancone = (id, label, fn) => Progressi.comprato('modalita', id) ? { label, azione: via(fn) }
      : { label: `${label.split(':')[0]}  (al Bancone)`, azione: () => { Audio.sfx('vuoto'); scritta(this, 240, 238, 'SI COMPRA AL BANCONE, CON LE PINTE!', { size: 9, color: '#ffe14a', durata: 900 }).setAngle(0); } };
    const MO = CONFIG.modalita, gruppo = dati?.gruppo ?? null, apri = (g) => () => this.scene.restart({ gruppo: g });
    const indietro = { label: 'Indietro', azione: apri(null) };
    let voci;
    if (n === 1) voci = [
      { label: 'ALLENAMENTO: un microgioco a scelta', azione: () => this.scene.start('Allenamento') },
      delBancone('solitario', `DA SOLO: ${MO.solitario.vite} vite, ${MO.solitario.microgiochi} microgiochi e il boss`, () => S.nuovoSolitario(0)),
      { label: `SFIDA DEL GIORNO: ${MO.giorno.microgiochi} microgiochi, uguali per tutti oggi`, azione: via(() => S.nuovaSfidaDelGiorno(0)) },
      { label: `LIVELLO: ${livelliInBreve(G).replace('tutti ', '')}`, azione: () => this.scene.start('Livelli') },
      { label: 'Cambia personaggio', azione: () => this.scene.start('Personaggi', { n }) },
    ];
    else if (gruppo === 'sfide') voci = [
      { label: `SFIDA COMPLETA: tutti i ${tutti} microgiochi`, azione: via(() => S.nuovaSfida()) },
      ...CONFIG.sfidaRapida.filter((k) => k < tutti).map((k) => ({ label: `SFIDA RAPIDA: ${k} microgiochi a caso`, azione: via(() => S.nuovaSfidaRapida(k)) })),
      ...CONFIG.alMeglioDi.map((m) => ({ label: `AL MEGLIO DI ${m}: vince chi arriva a ${Math.ceil(m / 2)} round`, azione: via(() => S.nuovaSfidaVeloce(m)) })),
      indietro,
    ];
    else if (gruppo === 'party') voci = [
      delBancone('lampo', `LAMPO: ${MO.lampo.microgiochi} microgiochi da ${MO.lampo.durata} secondi`, () => S.nuovoLampo()),
      ...(n >= MO.squadre.minimo ? [{ label: `SQUADRE: ${MO.squadre.nomi[0]} (1°, 3°...) contro ${MO.squadre.nomi[1]} (2°, 4°...)`, azione: via(() => S.nuoveSquadre()) }] : []),
      ...(n >= MO.torneo.minimo ? [{ label: 'TORNEO: tabellone a eliminazione, sfide a due', azione: via(() => S.nuovoTorneo()) }] : []),
      // il beer pong vero, a tiri alternati (da 2 a 6: con 3 o 5 l'ultimo scelto fa l'arbitro)
      n >= MO.beerpong.minimo && n <= MO.beerpong.massimo
        ? { label: `BEER PONG: ${Math.floor(n / 2)} contro ${Math.floor(n / 2)}` + (n % 2 ? ' e un arbitro' : '') + ', la partita vera', azione: () => { S.nuovoBeerPong(); this.scene.start('BeerPongSquadre'); } }
        : { label: `(BEER PONG: da ${MO.beerpong.minimo} a ${MO.beerpong.massimo} giocatori)`, azione: () => Audio.sfx('vuoto') },
      ...(n < MO.squadre.minimo ? [{ label: `(da ${MO.squadre.minimo} giocatori: SQUADRE e TORNEO)`, azione: () => Audio.sfx('vuoto') }] : []),
      indietro,
    ];
    else voci = [
      { label: 'SFIDE: completa, rapida, al meglio di...', azione: apri('sfide') },
      { label: n >= MO.squadre.minimo ? 'PARTY: Lampo, Squadre, Torneo, Beer Pong' : 'PARTY: Lampo, Beer Pong', azione: apri('party') },
      { label: 'PARTITA SINGOLA: un microgioco a scelta', azione: () => this.scene.start('Allenamento') },
      { label: `LIVELLI: ${livelliInBreve(G)}`, azione: () => this.scene.start('Livelli') },
      { label: 'Cambia personaggi', azione: () => this.scene.start('Personaggi', { n }) },
    ];
    const altezza = 150, pv = Math.min(19, altezza / voci.length), y0 = 84 + (altezza - (voci.length - 1) * pv) / 2;
    pannello(this, 240, 84 + altezza / 2, 300, altezza + 14, { alfa: 0.55, bordo: null, raggio: 10 });
    menuLista(this, voci, 240, y0, pv, 7.5, { larghezza: 280 });
    txt(this, 240, 252, perDito('Frecce + INVIO, oppure il mouse      ESC: cambia personaggi', 'Tocca per scegliere'), { size: 6.5, color: '#fff3d6' });
    const esci = () => (gruppo ? this.scene.restart({ gruppo: null }) : this.scene.start('Personaggi', { n }));
    this.input.keyboard.on('keydown-ESC', esci);
    if (eTouch()) pulsante(this, 16, 13, 'indietro', esci);
    pulsantiAngolo(this);
  }
}
