// Schermate tra un microgioco e l'altro: introduzione (e passaggio di mano), risultato,
// classifica del round e classifica generale (da tre giocatori in su), finale.
// In due il giro è quello di sempre: intro, microgioco, risultato, e alla fine il confronto.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { SP, ritratto, preparaGiocatore } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, ombra, molleggia, stelle, scritta, scuoti, caso, eTouch, perDito, pulsante, menuLista } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

const scurisci = (col, k = 0.72) => {
  const c = Phaser.Display.Color.IntegerToColor(col);
  return Phaser.Display.Color.GetColor(c.red * k, c.green * k, c.blue * k);
};
const colore = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;

// Aspetta INVIO (o click) ignorando i tasti tenuti premuti
function attendiInvio(scene, fn, tasti = ['ENTER']) {
  let fatto = false;
  const vai = (e) => { if (fatto || e?.repeat) return; fatto = true; fn(); };
  scene.time.delayedCall(350, () => {
    for (const k of tasti) scene.input.keyboard.on('keydown-' + k, vai);
    scene.input.on('pointerdown', () => vai());
  });
}

const lampeggia = (scene, t) => scene.tweens.add({ targets: t, alpha: 0.25, duration: 400, yoyo: true, repeat: -1 });

// "1°", "2°"... coi colori del podio
const COLORI_POS = ['#ffe14a', '#dfe6ee', '#e8a264'];
const posto = (pos) => `${pos}°`;

// la frase di sfottò della classifica finale: non ne esce una che nomina proprio il primo o l'ultimo
function sfotto(G, ordine) {
  const primo = G[ordine[0]], secondo = G[ordine[1]], ultimo = G[ordine[ordine.length - 1]];
  const parola = (g) => g.nome.replace(/^(il |lo |la |l')/i, '').toLowerCase();
  const vietate = [parola(primo), parola(ultimo)];
  const tutte = [...CONFIG.sfotto, ...(G.length >= 3 ? CONFIG.sfottoTanti : [])];
  const buone = tutte.filter((f) => { const nuda = f.replace(/\{\w+\}/g, '').toLowerCase(); return !vietate.some((v) => nuda.includes(v)); });
  return caso(buone.length ? buone : tutte)
    .replaceAll('{primo}', primo.nome).replaceAll('{secondo}', secondo.nome).replaceAll('{ultimo}', ultimo.nome)
    .replaceAll('{tutti}', G.map((g) => g.nome).join(', '));
}

// ------------------------------------------------------------
export class IntroScene extends Phaser.Scene {
  constructor() { super('Intro'); }
  create() {
    inquadra(this);
    const S = Sessione, id = S.idCorrente, m = CONFIG.microgiochi[id], g = S.giocatore, n = S.n;
    const doppio = S.controSeStesso;
    // da tre giocatori in su, dal secondo turno del round in poi questa è la schermata del
    // passaggio di mano: "TOCCA A...!" a tutta pagina (il microgioco lo conoscono già)
    const cambio = S.modo === 'sfida' && n >= 3 && S.passo > 0;
    preparaGiocatore(this, g.id, doppio);
    Audio.musica('menu');
    this.input.setDefaultCursor('default');
    raggi(this, m.colore, scurisci(m.colore));

    const vinti = S.classifica().round;
    const round = S.modo !== 'sfida' ? 'ALLENAMENTO'
      : S.meglioDi ? `AL MEGLIO DI ${S.meglioDi}: ROUND ${S.indice + 1}` + (n === 2 ? `  (${vinti[0]} - ${vinti[1]})` : '')
      : S.lista.length > 1 ? `ROUND ${S.indice + 1} DI ${S.lista.length}` : n === 2 ? 'SFIDA A DUE' : 'PARTITA SINGOLA';
    txt(this, 240, 14, `${round}  -  ${S.modo === 'sfida' ? `turno ${S.passo + 1} di ${n}` : g.nome}` + (cambio ? `  -  ${m.titolo}` : ''), { size: 7 });
    const titolo = txt(this, 240, cambio ? 37 : 40, cambio ? `TOCCA A ${g.nome.toUpperCase()}!` : m.titolo, { size: cambio ? 21 : 19, color: cambio ? g.colore : '#ffe14a', wrap: 460 });
    titolo.setScale(0);
    this.tweens.add({ targets: titolo, scale: 1, duration: 450, ease: 'Back.out' });
    if (cambio) txt(this, 240, 57, perDito(`Passa la tastiera a ${g.nome}`, `Passa il telefono a ${g.nome}`), { size: 7.5, color: '#fff3d6' });

    // chi gioca (travestito, se gioca contro se stesso)
    ombra(this, 60, 224, 62);
    const s = im(this, 60, 224, S.inScena.id + '_normale').setOrigin(0.5, 1).setScale((cambio ? 3.7 : 3.3) * SP);
    molleggia(this, s);
    txt(this, 60, 236, 'TOCCA A', { size: 7 });
    txt(this, 60, 249, g.nome.toUpperCase(), { size: g.nome.length > 11 ? 9 : 11, color: g.colore });

    // l'ospite del microgioco
    if (m.ospite) {
      ombra(this, 422, 224, 56);
      const o = im(this, 422, 224, m.ospite.id + (m.ospite.id === 'beppe' ? '_sufficienza' : '_normale')).setOrigin(0.5, 1).setScale(3 * SP).setFlipX(m.ospite.id === 'beppe');
      this.tweens.add({ targets: o, angle: { from: -2, to: 2 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      txt(this, 422, 243, m.ospite.etichetta, { size: 7, spacing: 0 });
    }
    if (doppio) {
      // gioca nel microgioco in cui c'è già lui: un timbro, e si va avanti uguale
      const t = txt(this, 422, 72, 'CONTRO\nSE STESSO!', { size: 9, color: '#ff5a4a', stroke: '#fff3d6', thick: 4, spacing: -2, depth: 5 }).setAngle(-7).setScale(2.4).setAlpha(0);
      this.tweens.add({ targets: t, scale: 1, alpha: 1, delay: 500, duration: 220, ease: 'Quad.in', onComplete: () => { Audio.sfx('sbam'); scuoti(this, 120, 0.006); } });
    }

    // comandi e obiettivo
    // (il pannello si adatta all'altezza reale dei testi)
    const cima = 66;
    txt(this, 240, cima + 11, 'COMANDI', { size: 9, color: '#ffe14a', depth: 2 });
    const tc = txt(this, 240, cima + 18, (eTouch() && m.comandiTouch ? m.comandiTouch : m.comandi).join('\n'), { size: 7, oy: 0, spacing: 0, wrap: 246, depth: 2 });
    const to = txt(this, 240, tc.y + tc.height + 1, m.obiettivo, { size: 8, oy: 0, color: '#7dff9a', wrap: 246, depth: 2 });
    const td = txt(this, 240, to.y + to.height - 2, `Durata: ${m.durata} secondi`, { size: 6.5, oy: 0, color: '#fff3d6', depth: 2 });
    const alt = td.y + td.height + 3 - cima;
    pannello(this, 240, cima + alt / 2, 256, alt, { depth: 1 });

    // nella sfida, chi non gioca per primo vede il record del round (sotto il pannello dei comandi:
    // se i comandi sono tanti il riquadro scende, e con lui la scritta "quando sei pronto")
    const rec = S.record;
    let yPronto = 252;
    if (rec) {
      const yb = Math.max(225, cima + alt + 10);
      pannello(this, 240, yb, 196, 15, { colore: 0x7a1f2a, raggio: 7 });
      txt(this, 240, yb, `RECORD: ${rec.punteggio} punti (${rec.giocatore.nome})`, { size: 7.5, color: '#ffe14a' });
      yPronto = Math.max(252, yb + 17);
    }

    const pronto = txt(this, 240, yPronto, perDito('Premi SPAZIO quando sei pronto!', 'Tocca lo schermo quando sei pronto!'), { size: 10, color: '#ffe14a' });
    lampeggia(this, pronto);
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
    // sul telefono non c'è ESC: freccia per tornare al menu, audio e schermo intero
    if (eTouch()) pulsante(this, 16, 13, 'indietro', () => this.scene.start('Menu'));
    pulsantiAngolo(this);

    attendiInvio(this, () => {
      pronto.destroy();
      // conto alla rovescia 3-2-1-VIA
      ['3', '2', '1', 'VIA!'].forEach((num, i) => this.time.delayedCall(i * 650, () => {
        Audio.sfx(i < 3 ? 'bip' : 'via');
        const t = txt(this, 240, 135, num, { size: i < 3 ? 70 : 56, color: i < 3 ? '#ffffff' : '#7dff9a', thick: 10, depth: 100 });
        t.setScale(2.5).setAlpha(0);
        this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 220, ease: 'Back.out' });
        this.tweens.add({ targets: t, alpha: 0, scale: 0.6, delay: 480, duration: 150, onComplete: () => t.destroy() });
        scuoti(this, 80, 0.004);
      }));
      this.time.delayedCall(4 * 650, () => this.scene.start('mg_' + id));
    }, ['SPACE', 'ENTER']);
  }
}

// ------------------------------------------------------------
export class RisultatoScene extends Phaser.Scene {
  constructor() { super('Risultato'); }
  create(dati) {
    inquadra(this);
    const r = dati.risultato, S = Sessione, g = S.giocatore, m = CONFIG.microgiochi[S.idCorrente], G = S.giocatori, n = S.n;
    S.registra(r);
    Audio.musica('menu');
    this.input.setDefaultCursor('default');
    raggi(this, r.vittoria ? 0x3fae74 : 0x8a5a9a, r.vittoria ? 0x62cf96 : 0xa878b8);
    Audio.sfx(r.vittoria ? 'vittoria' : 'sconfitta');

    txt(this, 240, 14, m.titolo, { size: 8 });
    scritta(this, 240, 44, r.vittoria ? 'VITTORIA!' : 'SCONFITTA!', { size: 26, color: r.vittoria ? '#ffe14a' : '#ffb0a4', durata: 999999 });

    ombra(this, 104, 204, 72);
    const s = im(this, 104, 204, `${g.id}_${r.vittoria ? 'felice' : 'triste'}`).setOrigin(0.5, 1).setScale(3.7 * SP);
    if (r.vittoria) {
      this.tweens.add({ targets: s, y: 186, duration: 260, yoyo: true, repeat: -1, ease: 'Quad.out' });
      this.time.addEvent({ delay: 500, loop: true, callback: () => stelle(this, 104 + (Math.random() - 0.5) * 130, 80 + Math.random() * 70, 5) });
    } else this.tweens.add({ targets: s, x: 106, duration: 60, yoyo: true, repeat: -1 });
    txt(this, 104, 219, g.nome.toUpperCase(), { size: g.nome.length > 11 ? 9 : 11, color: g.colore });
    // la sua frase, da vincitore o da sconfitto
    const frase = r.vittoria ? g.esulta : g.perde;
    if (frase) txt(this, 104, 233, `"${frase}"`, { size: 6, color: '#fff3d6', wrap: 190 });

    // (il riquadro parte un po' più in alto: se il riepilogo va su due righe ci sta lo stesso)
    pannello(this, 330, 116, 240, 86, { alfa: 0.6, bordo: null, raggio: 10 });
    txt(this, 330, 88, r.riepilogo, { size: 8, wrap: 230 });
    txt(this, 330, 106, 'PUNTEGGIO', { size: 9, color: '#ffe14a' });
    const pt = txt(this, 330, 134, String(r.punteggio), { size: 32 });
    pt.setScale(0);
    this.tweens.add({ targets: pt, scale: 1, delay: 300, duration: 400, ease: 'Bounce.out' });

    let prompt, avanti;
    if (S.modo === 'allenamento') {
      prompt = perDito('INVIO: riprova     ESC: menu', 'Tocca: riprova');
      avanti = () => { S.nuovoAllenamento(S.idCorrente, S.turno); this.scene.start('Intro'); };
      this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
      if (eTouch()) pulsante(this, 16, 13, 'indietro', () => this.scene.start('Menu'));
    } else if (!S.ultimoTurno) {
      // stesso microgioco, ora tocca al prossimo
      const p = S.prossimo, rec = S.record;
      pannello(this, 330, 186, 240, 30, { colore: 0x7a1f2a, raggio: 9 });
      txt(this, 330, 180, `Ora tocca a ${p.nome.toUpperCase()}`, { size: 10, color: '#ffe14a' });
      txt(this, 330, 193, n === 2 ? `stesso gioco: da battere ${r.punteggio} punti` : `record del round: ${rec.punteggio} punti (${rec.giocatore.nome})`, { size: 7 });
      prompt = perDito(`Passa i comandi a ${p.nome} e premi INVIO`, `Passa il telefono a ${p.nome} e tocca lo schermo`);
      avanti = () => { S.passo++; this.scene.start('Intro'); };
    } else if (n === 2) {
      // entrambi hanno giocato: chi ha vinto il round?
      const [a, b] = S.risultati[S.indice], v = S.vincitoreRound(S.indice);
      pannello(this, 330, 190, 240, 42, { alfa: 0.75, raggio: 9 });
      txt(this, 330, 179, `${G[0].nome} ${a.punteggio}  -  ${b.punteggio} ${G[1].nome}`, { size: 9 });
      const esito = v < 0 ? 'ROUND PARI!' : `ROUND A ${G[v].nome.toUpperCase()}!`;
      // (dritta: è larga, e con l'inclinazione a caso di scritta() finiva sopra la riga dei punteggi)
      this.time.delayedCall(700, () => { scritta(this, 330, 197, esito, { size: 14, color: v < 0 ? '#ffffff' : G[v].colore, durata: 999999 }).setAngle(0); Audio.sfx('ok'); });
      const ultimo = S.finita;
      if (S.meglioDi) {
        const vr = S.classifica().round;
        txt(this, 330, 221, `AL MEGLIO DI ${S.meglioDi}:  ${G[0].nome} ${vr[0]} - ${vr[1]} ${G[1].nome}`, { size: 7, color: '#7dff9a' });   // sotto il riquadro, non sul bordo
      }
      prompt = perDito(ultimo ? 'INVIO: classifica finale' : 'INVIO: prossimo round', ultimo ? 'Tocca: classifica finale' : 'Tocca: prossimo round');
      avanti = () => {
        if (ultimo) return this.scene.start('Finale');
        S.indice++;
        S.passo = 0;
        this.scene.start('Intro');
      };
    } else {
      // hanno giocato tutti: si va alla classifica del round
      pannello(this, 330, 186, 240, 30, { colore: 0x7a1f2a, raggio: 9 });
      txt(this, 330, 180, 'HANNO GIOCATO TUTTI!', { size: 10, color: '#ffe14a' });
      txt(this, 330, 193, 'chi sale e chi scende in classifica?', { size: 7 });
      prompt = perDito('INVIO: classifica del round', 'Tocca: classifica del round');
      // (i dati vanno passati sempre: se no Phaser ridà alla scena quelli dell'ultima volta, cioè la fase 2)
      avanti = () => this.scene.start('Classifica', { fase: 1 });
    }
    lampeggia(this, txt(this, 240, 253, prompt, { size: 9, color: '#ffe14a' }));
    attendiInvio(this, () => { Audio.sfx('scegli'); avanti(); });
  }
}

// ------------------------------------------------------------
//  Da tre giocatori in su, a fine round: prima la classifica del round (i personaggi in fila,
//  dal primo all'ultimo, coi punti che prendono), poi quella generale (le barre che salgono e
//  chi sorpassa chi). dati.fase = 2 per la seconda.
export class ClassificaScene extends Phaser.Scene {
  constructor() { super('Classifica'); }
  create(dati) {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('menu');
    if (dati?.fase === 2) this.generale(); else this.delRound();
    pulsantiAngolo(this);
  }

  delRound() {
    const S = Sessione, n = S.n, c = S.classificaRound(S.indice), m = CONFIG.microgiochi[S.idCorrente];
    raggi(this, 0x7a4ac8, 0x9a6ae0);
    txt(this, 240, 17, 'CLASSIFICA DEL ROUND', { size: 15, color: '#ffe14a' });
    txt(this, 240, 34, m.titolo, { size: 8 });
    // tanti giocatori: personaggi più piccoli e più vicini, i nomi non si devono toccare
    const passo = Math.min(104, 452 / n), k = n <= 4 ? 2.5 : n <= 6 ? 2.05 : 1.55, alto = 48 * k, Y = 202, ultima = c[n - 1].pos;
    c.forEach((r, i) => {
      const x = 240 + (i - (n - 1) / 2) * passo, g = r.g, primo = r.pos === 1, fondo = r.pos === ultima && r.pos > 1;
      ombra(this, x, Y, 18 * k);
      const s = im(this, x, Y, `${g.id}_${primo ? 'felice' : i >= n / 2 ? 'triste' : 'normale'}`).setOrigin(0.5, 1).setScale(k * SP);
      if (primo) this.tweens.add({ targets: s, y: Y - 12, duration: 240, yoyo: true, repeat: -1, ease: 'Quad.out' });        // esulta
      else if (fondo) this.tweens.add({ targets: s, x: x + 2, duration: 60, yoyo: true, repeat: -1 });                         // si dispera
      else molleggia(this, s, 380 + i * 30);
      txt(this, x, Y - alto - 9, posto(r.pos), { size: n <= 4 ? 13 : 11, color: COLORI_POS[r.pos - 1] ?? '#ffffff' });
      txt(this, x, Y + 9, g.nome, { size: n <= 4 ? 8 : n <= 6 ? 6.5 : 5.4, color: g.colore });
      txt(this, x, Y + 20, `${r.punteggio} pt`, { size: n <= 6 ? 7 : 6, color: '#fff3d6' });
      // i punti classifica arrivano uno alla volta, dall'ultimo al primo
      const p = txt(this, x, Y + 34, `+${r.punti}`, { size: n <= 6 ? 11 : 9, color: '#7dff9a' }).setScale(0);
      this.tweens.add({ targets: p, scale: 1, delay: 500 + (n - 1 - i) * 220, duration: 260, ease: 'Back.out', onStart: () => Audio.sfx(primo ? 'ok' : 'muovi') });
    });
    stelle(this, 240 - ((n - 1) / 2) * passo, Y - alto / 2, 8);
    const ultimo = S.finita;
    lampeggia(this, txt(this, 240, 260, perDito(ultimo ? 'INVIO: classifica finale' : 'INVIO: classifica generale', ultimo ? 'Tocca: classifica finale' : 'Tocca: classifica generale'), { size: 8.5, color: '#ffe14a' }));
    attendiInvio(this, () => { Audio.sfx('scegli'); if (ultimo) this.scene.start('Finale'); else this.scene.restart({ fase: 2 }); });
  }

  generale() {
    const S = Sessione, G = S.giocatori, n = S.n;
    const prima = S.classifica(S.indice), dopo = S.classifica(S.indice + 1), cosa = S.meglioDi ? 'round vinti' : 'punti';
    raggi(this, 0x2f7fb0, 0x4a9fd0);
    txt(this, 240, 17, 'CLASSIFICA GENERALE', { size: 15, color: '#ffe14a' });
    txt(this, 240, 34, S.meglioDi ? `round vinti: al meglio di ${S.meglioDi} vince chi arriva a ${S.serve}` : `${cosa} dopo il round ${S.indice + 1} di ${S.lista.length}`, { size: 7.5 });
    // una riga per giocatore: ritratto, nome, barra, numero. Si parte dall'ordine di prima.
    const alt = Math.min(26, 196 / n), y0 = 50 + alt / 2, X0 = 176, LARGA = 236, massimo = Math.max(1, ...dopo.conta);
    pannello(this, 240, 48 + (n * alt) / 2, 420, n * alt + 8, { alfa: 0.55, bordo: null, raggio: 8 });
    const barre = this.add.graphics();
    const righe = G.map((g) => {
      const riga = { g, k: prima.ordine.indexOf(g.i), val: prima.conta[g.i], y: 0 };
      riga.y = y0 + riga.k * alt;
      riga.cose = this.add.container(0, riga.y, [
        ritratto(this, 44, 0, g.id, Math.min(22, alt - 3)),
        txt(this, 60, 0, g.nome, { size: alt < 20 ? 6.5 : 7.5, color: g.colore, ox: 0 }),
      ]);
      riga.numero = txt(this, 0, riga.y, '', { size: alt < 20 ? 7.5 : 9, ox: 0 });
      riga.freccia = txt(this, 30, riga.y, '', { size: 8, color: '#7dff9a' });
      return riga;
    });
    const disegna = () => {
      barre.clear();
      for (const r of righe) {
        const w = Math.max(2, (LARGA * r.val) / massimo), h = Math.min(13, alt - 8);
        barre.fillStyle(0x000000, 0.3); barre.fillRoundedRect(X0, r.y - h / 2 + 1.5, LARGA, h, h / 2);
        barre.fillStyle(colore(r.g.colore), 1); barre.fillRoundedRect(X0, r.y - h / 2, w, h, Math.min(h / 2, w / 2));
        r.numero.setPosition(X0 + w + 5, r.y).setText(String(Math.round(r.val)));
        r.cose.y = r.y; r.freccia.y = r.y;
      }
    };
    disegna();
    // le barre salgono ai punti nuovi; poi chi ha sorpassato qualcuno sale di riga, con la freccia
    this.time.delayedCall(450, () => {
      Audio.sfx('muovi');
      for (const r of righe) this.tweens.add({ targets: r, val: dopo.conta[r.g.i], duration: 900, ease: 'Cubic.out', onUpdate: disegna });
    });
    this.time.delayedCall(1500, () => {
      let sorpassi = 0;
      const primoRound = S.indice === 0;      // al primo round non c'era ancora una classifica: niente frecce
      for (const r of righe) {
        const k2 = dopo.ordine.indexOf(r.g.i);
        if (primoRound) { /* si mettono in ordine e basta */ }
        else if (k2 < r.k) { sorpassi++; r.freccia.setText('▲'); this.tweens.add({ targets: r.cose, scaleX: 1.08, scaleY: 1.08, duration: 160, yoyo: true, repeat: 2 }); }
        else if (k2 > r.k) r.freccia.setText('▼').setColor('#ff9a8a');
        this.tweens.add({ targets: r, y: y0 + k2 * alt, duration: 500, ease: 'Back.out', onUpdate: disegna });
      }
      if (sorpassi) { Audio.sfx('ok'); scritta(this, 240, 44, sorpassi === 1 ? 'SORPASSO!' : 'SORPASSI!', { size: 12, color: '#7dff9a', durata: 900 }); }
    });
    lampeggia(this, txt(this, 240, 260, perDito('INVIO: prossimo round', 'Tocca: prossimo round'), { size: 8.5, color: '#ffe14a' }));
    attendiInvio(this, () => { Audio.sfx('scegli'); S.indice++; S.passo = 0; this.scene.start('Intro'); });
  }
}

// ------------------------------------------------------------
export class FinaleScene extends Phaser.Scene {
  constructor() { super('Finale'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('menu');
    raggi(this, 0xe09a28, 0xf2c14a);
    Audio.sfx('vittoria');
    if (Sessione.n >= 3) this.podio(); else this.aDue();
    pulsantiAngolo(this);
  }

  // i tre pulsanti di fine partita: stessi giocatori e stessa modalità, altri personaggi, menu
  pulsanti(pos, o = {}) {
    const S = Sessione;
    menuLista(this, [
      { label: 'RIVINCITA', azione: () => { S.rivincita(); this.scene.start('Intro'); } },
      { label: 'CAMBIA PERSONAGGI', azione: () => this.scene.start('Personaggi', { n: S.n }) },
      { label: 'MENU', azione: () => this.scene.start('Menu') },
    ], 0, 0, o.passo ?? 18, o.size ?? 7.5, { pos, larghezza: o.larghezza ?? 110, orizzontale: true });
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
  }

  // coriandoli che scendono dall'alto
  coriandoli(x0, x1) {
    const COL = [0xff5a6a, 0x5ab4ff, 0xffe14a, 0x7dff9a, 0xff9ac4, 0xb06aff];
    this.time.addEvent({ delay: 110, loop: true, callback: () => {
      const r = this.add.rectangle(x0 + Math.random() * (x1 - x0), -6, 3.2, 5, caso(COL)).setAngle(Math.random() * 360).setDepth(50);
      this.tweens.add({ targets: r, y: 280, x: r.x + (Math.random() - 0.5) * 60, angle: r.angle + 500, duration: 2300 + Math.random() * 1200, onComplete: () => r.destroy() });
    } });
  }

  // --- in due: il tabellone dei round e i due faccia a faccia, come sempre ---
  aDue() {
    const S = Sessione, G = S.giocatori, cl = S.classifica(), v = cl.vincitore, n = S.giocati;
    txt(this, 240, 18, 'CLASSIFICA FINALE', { size: 18, color: '#ffe14a' });

    // tabellone dei round (da 4 round in su, una riga per round: titolo a sinistra, punti a destra)
    // (con più di 10 round le righe si stringono un po': il tabellone resta alto uguale)
    const compatto = n > 3, fitto = n > 6, passo = fitto ? Math.min(10, 100 / n) : compatto ? 14 : 22, y0 = fitto ? 46 : 48;
    const alt = fitto ? 28 + n * passo : compatto ? 34 + n * passo : 36 + n * 22;
    pannello(this, 240, 36 + alt / 2, 250, alt);
    S.lista.slice(0, n).forEach((id, i) => {
      const [a, b] = S.risultati[i], vr = S.vincitoreRound(i), col = vr < 0 ? '#ffffff' : G[vr].colore;
      if (compatto) {
        txt(this, 126, y0 + i * passo, CONFIG.microgiochi[id].titolo, { size: fitto ? 6 : 7, color: '#ffe14a', ox: 0 });
        txt(this, 354, y0 + i * passo, `${a.punteggio}  -  ${b.punteggio}`, { size: fitto ? 6.5 : 8, color: col, ox: 1 });
      } else {
        txt(this, 240, 46 + i * 22, CONFIG.microgiochi[id].titolo, { size: 7, color: '#ffe14a' });
        txt(this, 240, 56 + i * 22, `${a.punteggio}  -  ${b.punteggio}`, { size: 8, color: col });
      }
    });
    const yRiep = fitto ? y0 + n * passo + 2 : compatto ? 40 + n * passo + 6 : 40 + n * 22 + 8;
    // quello che decide la sfida va per primo: i minigiochi vinti nella veloce, i punti nella completa
    const riep = S.meglioDi
      ? `MINIGIOCHI VINTI: ${cl.round[0]} - ${cl.round[1]}      punti: ${cl.punti[0]} - ${cl.punti[1]}`
      : `PUNTI TOTALI: ${cl.punti[0]} - ${cl.punti[1]}      round vinti: ${cl.round[0]} - ${cl.round[1]}`;
    txt(this, 240, yRiep, riep, { size: 7.5, color: '#7dff9a' });
    txt(this, 240, yRiep + (fitto ? 9 : 11), `${G[0].nome}  -  ${G[1].nome}`, { size: 6.5, color: '#fff3d6' });

    // (col tabellone lungo la scritta PAREGGIO! scende sotto il riquadro, e la frase con lei)
    const XV = 62, XP = 418, Y = 232, yPari = Math.max(172, 36 + alt + 14);
    const mostra = (i, x, espr) => {
      ombra(this, x, Y, 62);
      return im(this, x, Y, `${G[i].id}_${espr}`).setOrigin(0.5, 1).setScale(3.2 * SP);
    };
    const nome = (i, x, s) => txt(this, x, Y + 11, s, { size: G[i].nome.length > 10 ? 8 : 10, color: G[i].colore });

    let frase;
    if (v < 0) {
      [XV, XP].forEach((x, i) => { molleggia(this, mostra(i, x, 'shock')); nome(i, x, G[i].nome.toUpperCase()); });
      txt(this, 240, yPari, 'PAREGGIO!', { size: 18 });
      frase = caso(CONFIG.frasiPareggio);
    } else {
      const p = 1 - v;
      // il vincitore esulta
      const sv = mostra(v, XV, 'felice'), k = sv.scaleX;
      this.tweens.add({ targets: sv, y: Y - 22, duration: 240, yoyo: true, repeat: -1, ease: 'Quad.out' });
      this.tweens.add({ targets: sv, scaleX: k * 1.08, scaleY: k * 0.9, duration: 240, yoyo: true, repeat: -1 });
      txt(this, XV, 58, 'VINCE!', { size: 11, color: '#ffe14a' });
      nome(v, XV, `1. ${G[v].nome.toUpperCase()}`);
      this.time.addEvent({ delay: 350, loop: true, callback: () => stelle(this, XV + (Math.random() - 0.5) * 110, 100 + Math.random() * 100, 6) });
      // il perdente si dispera
      const sp = mostra(p, XP, 'triste');
      this.tweens.add({ targets: sp, x: XP + 3, duration: 55, yoyo: true, repeat: -1 });
      nome(p, XP, `2. ${G[p].nome.toUpperCase()}`);
      this.time.addEvent({ delay: 220, loop: true, callback: () => {
        const sx = Math.random() < 0.5 ? -1 : 1;
        const g = this.add.ellipse(XP + sx * 22, 150, 4, 6, 0x7fd3ff);
        this.tweens.add({ targets: g, x: g.x + sx * 26, y: Y, duration: 550, ease: 'Quad.in', onComplete: () => g.destroy() });
      } });
      frase = sfotto(G, cl.ordine);
    }
    // frase di sfottò
    const f = txt(this, 240, v < 0 ? yPari + 30 : 196, `"${frase}"`, { size: 9, wrap: 232 });
    f.setScale(0);
    this.tweens.add({ targets: f, scale: 1, delay: 800, duration: 400, ease: 'Back.out' });

    this.pulsanti((i) => [[152, 240, 328][i], 258], { larghezza: 84 });
  }

  // --- da tre in su: il podio, gli altri in fila sotto, l'ultimo disperato ---
  podio() {
    const S = Sessione, G = S.giocatori, n = S.n, cl = S.classifica(), o = cl.ordine;
    const cosa = S.meglioDi ? 'round' : 'punti', pari = cl.vincitore < 0;
    txt(this, 240, 16, 'CLASSIFICA FINALE', { size: 16, color: '#ffe14a' });
    this.coriandoli(150, 330);

    // i gradini: primo in mezzo, secondo a sinistra, terzo a destra
    const BASE = 168, K = 1.85, gradini = [{ x: 240, h: 40, col: 0xf2c43a }, { x: 172, h: 28, col: 0xcfd6de }, { x: 308, h: 20, col: 0xd98a4e }];
    const g = this.add.graphics();
    gradini.forEach((gr, k) => {
      const pl = G[o[k]], y = BASE - gr.h;
      g.fillStyle(0x000000, 0.25); g.fillRect(gr.x - 33 + 2, y + 2, 66, gr.h);
      g.fillStyle(gr.col, 1); g.fillRect(gr.x - 33, y, 66, gr.h);
      g.fillStyle(0xffffff, 0.35); g.fillRect(gr.x - 33, y, 66, 3);
      g.lineStyle(1.5, 0x2b1b17, 1); g.strokeRect(gr.x - 33, y, 66, gr.h);
      txt(this, gr.x, y + gr.h / 2 + 1, String(cl.pos[pl.i]), { size: Math.min(16, gr.h * 0.62), color: '#2b1b17', thick: 0 });
      // (in tre l'ultimo sta sul terzo gradino: è lui quello disperato)
      const faccia = cl.pos[pl.i] === 1 ? 'felice' : k === n - 1 ? 'triste' : k === 2 ? 'normale' : 'felice';
      const s = im(this, gr.x, y, `${pl.id}_${faccia}`).setOrigin(0.5, 1).setScale(K * SP);
      if (cl.pos[pl.i] === 1) {
        // il primo salta, con la corona in testa (sta nella stessa scatola, così salta con lui)
        const corona = this.add.graphics();
        corona.fillStyle(0xffd83a, 1); corona.lineStyle(1.2, 0x2b1b17, 1);
        corona.beginPath(); [[-10, 0], [-12, -9], [-6, -4], [0, -12], [6, -4], [12, -9], [10, 0]].forEach(([x, yy], i) => (i ? corona.lineTo(x, yy) : corona.moveTo(x, yy))); corona.closePath(); corona.fillPath(); corona.strokePath();
        corona.fillStyle(0xff5a6a, 1); corona.fillCircle(0, -3.4, 1.6);
        const alto = 48 * K * (pl.statura ?? 1), scatola = this.add.container(gr.x, y, [corona.setPosition(0, -alto + (pl.id === 'generale' ? -2 : 6))]);
        s.setPosition(0, 0); scatola.addAt(s, 0);
        this.tweens.add({ targets: scatola, y: y - 10, duration: 240, yoyo: true, repeat: -1, ease: 'Quad.out' });
        this.time.addEvent({ delay: 420, loop: true, callback: () => stelle(this, gr.x + (Math.random() - 0.5) * 70, 50 + Math.random() * 60, 5) });
      } else molleggia(this, s, 380 + k * 40);
      txt(this, gr.x, BASE + 8, pl.nome, { size: pl.nome.length > 11 ? 6 : 7, color: pl.colore });
      txt(this, gr.x, BASE + 17, `${cl.conta[pl.i]} ${cosa}`, { size: 6, color: '#fff3d6' });
    });

    // gli altri in fila sotto; l'ultimo in fondo, disperato
    const altri = o.slice(3), passo = Math.min(84, 440 / Math.max(1, altri.length));
    altri.forEach((gi, k) => {
      const pl = G[gi], x = 240 + (k - (altri.length - 1) / 2) * passo, Y = 250, ultimo = k === altri.length - 1;
      ombra(this, x, Y, 26);
      const s = im(this, x, Y, `${pl.id}_${ultimo ? 'triste' : 'sufficienza'}`).setOrigin(0.5, 1).setScale(1.2 * SP);
      if (ultimo) this.tweens.add({ targets: s, x: x + 2, duration: 55, yoyo: true, repeat: -1 });
      txt(this, x, Y + 7, `${posto(cl.pos[gi])} ${pl.nome}  ${cl.conta[gi]}`, { size: 5.4, color: pl.colore });
    });
    if (!altri.length) {
      // in tre: l'ultimo è quello sul terzo gradino
      this.time.addEvent({ delay: 260, loop: true, callback: () => { const d = this.add.ellipse(308 + (Math.random() < 0.5 ? -16 : 16), BASE - 70, 3, 5, 0x7fd3ff); this.tweens.add({ targets: d, y: BASE - 20, alpha: 0, duration: 500, onComplete: () => d.destroy() }); } });
    }

    // a sinistra la frase di sfottò, a destra i pulsanti
    const frase = pari ? caso(CONFIG.frasiPareggio) : sfotto(G, o);
    pannello(this, 66, 100, 118, 112, { alfa: 0.55, bordo: null, raggio: 9 });
    txt(this, 66, 60, pari ? 'PARI IN TESTA!' : `VINCE\n${G[o[0]].nome.toUpperCase()}!`, { size: 7.5, color: pari ? '#ffffff' : G[o[0]].colore, spacing: -1 });
    const f = txt(this, 66, 112, `"${frase}"`, { size: 6.4, wrap: 108 });
    f.setScale(0);
    this.tweens.add({ targets: f, scale: 1, delay: 700, duration: 400, ease: 'Back.out' });
    pannello(this, 414, 96, 118, 78, { alfa: 0.55, bordo: null, raggio: 9 });
    this.pulsanti((i) => [414, 74 + i * 22], { passo: 20, size: 7 });
  }
}
