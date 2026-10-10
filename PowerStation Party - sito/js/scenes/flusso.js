// Schermate tra un microgioco e l'altro: introduzione, risultato, finale.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { SP } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, ombra, molleggia, stelle, scritta, scuoti, caso, eTouch, perDito, pulsante } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

const scurisci = (col, k = 0.72) => {
  const c = Phaser.Display.Color.IntegerToColor(col);
  return Phaser.Display.Color.GetColor(c.red * k, c.green * k, c.blue * k);
};

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

// ------------------------------------------------------------
export class IntroScene extends Phaser.Scene {
  constructor() { super('Intro'); }
  create() {
    inquadra(this);
    const S = Sessione, id = S.idCorrente, m = CONFIG.microgiochi[id], g = S.giocatore;
    Audio.musica('menu');
    this.input.setDefaultCursor('default');
    raggi(this, m.colore, scurisci(m.colore));

    const vinti = S.classifica().round;
    const round = S.modo !== 'sfida' ? 'ALLENAMENTO'
      : S.meglioDi ? `AL MEGLIO DI ${S.meglioDi}: ROUND ${S.indice + 1}  (${vinti[0]} - ${vinti[1]})`
      : S.lista.length > 1 ? `ROUND ${S.indice + 1} DI ${S.lista.length}` : 'SFIDA A DUE';
    txt(this, 240, 14, `${round}  -  ${S.modo === 'sfida' ? `turno ${S.passo + 1} di 2` : g.nome}`, { size: 7 });
    const titolo = txt(this, 240, 40, m.titolo, { size: 19, color: '#ffe14a', wrap: 460 });
    titolo.setScale(0);
    this.tweens.add({ targets: titolo, scale: 1, duration: 450, ease: 'Back.out' });

    // chi gioca
    ombra(this, 60, 224, 62);
    const s = im(this, 60, 224, g.id + '_normale').setOrigin(0.5, 1).setScale(3.3 * SP);
    molleggia(this, s);
    txt(this, 60, 236, 'TOCCA A', { size: 7 });
    txt(this, 60, 249, g.nome.toUpperCase(), { size: 11, color: g.colore });

    // l'ospite del microgioco
    if (m.ospite) {
      ombra(this, 422, 224, 56);
      const o = im(this, 422, 224, m.ospite.id + (m.ospite.id === 'beppe' ? '_sufficienza' : '_normale')).setOrigin(0.5, 1).setScale(3 * SP).setFlipX(m.ospite.id === 'beppe');
      this.tweens.add({ targets: o, angle: { from: -2, to: 2 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      txt(this, 422, 243, m.ospite.etichetta, { size: 7, spacing: 0 });
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

    // nella sfida, il secondo vede cosa deve battere (sotto il pannello dei comandi: se i
    // comandi sono tanti il riquadro scende, e con lui la scritta "quando sei pronto")
    const db = S.daBattere;
    let yPronto = 252;
    if (db) {
      const yb = Math.max(225, cima + alt + 10);
      pannello(this, 240, yb, 190, 15, { colore: 0x7a1f2a, raggio: 7 });
      txt(this, 240, yb, `DA BATTERE: ${db.punteggio} punti di ${S.avversario.nome}`, { size: 7.5, color: '#ffe14a' });
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
      ['3', '2', '1', 'VIA!'].forEach((n, i) => this.time.delayedCall(i * 650, () => {
        Audio.sfx(i < 3 ? 'bip' : 'via');
        const t = txt(this, 240, 135, n, { size: i < 3 ? 70 : 56, color: i < 3 ? '#ffffff' : '#7dff9a', thick: 10, depth: 100 });
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
    const r = dati.risultato, S = Sessione, g = S.giocatore, m = CONFIG.microgiochi[S.idCorrente], G = CONFIG.giocatori;
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
    txt(this, 104, 219, g.nome.toUpperCase(), { size: 11, color: g.colore });

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
    } else if (S.passo === 0) {
      // stesso microgioco, ora tocca all'altro
      pannello(this, 330, 186, 240, 30, { colore: 0x7a1f2a, raggio: 9 });
      txt(this, 330, 180, `Ora tocca a ${S.avversario.nome.toUpperCase()}`, { size: 10, color: '#ffe14a' });
      txt(this, 330, 193, `stesso gioco: da battere ${r.punteggio} punti`, { size: 7 });
      prompt = perDito(`Passa i comandi a ${S.avversario.nome} e premi INVIO`, `Passa il telefono a ${S.avversario.nome} e tocca lo schermo`);
      avanti = () => { S.passo = 1; this.scene.start('Intro'); };
    } else {
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
    }
    lampeggia(this, txt(this, 240, 253, prompt, { size: 9, color: '#ffe14a' }));
    attendiInvio(this, () => { Audio.sfx('scegli'); avanti(); });
  }
}

// ------------------------------------------------------------
export class FinaleScene extends Phaser.Scene {
  constructor() { super('Finale'); }
  create() {
    inquadra(this);
    const S = Sessione, G = CONFIG.giocatori, cl = S.classifica(), v = cl.vincitore, n = S.giocati;
    Audio.musica('menu');
    raggi(this, 0xe09a28, 0xf2c14a);
    Audio.sfx('vittoria');
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
    const XV = 62, XP = 418, Y = 236, yPari = Math.max(172, 36 + alt + 14);
    const mostra = (i, x, espr) => {
      ombra(this, x, Y, 62);
      return im(this, x, Y, `${G[i].id}_${espr}`).setOrigin(0.5, 1).setScale(3.2 * SP);
    };

    let frase;
    if (v < 0) {
      [XV, XP].forEach((x, i) => { molleggia(this, mostra(i, x, 'shock')); txt(this, x, Y + 13, G[i].nome.toUpperCase(), { size: 10, color: G[i].colore }); });
      txt(this, 240, yPari, 'PAREGGIO!', { size: 18 });
      frase = caso(CONFIG.frasiPareggio);
    } else {
      const p = 1 - v;
      // il vincitore esulta
      const sv = mostra(v, XV, 'felice'), k = sv.scaleX;
      this.tweens.add({ targets: sv, y: Y - 22, duration: 240, yoyo: true, repeat: -1, ease: 'Quad.out' });
      this.tweens.add({ targets: sv, scaleX: k * 1.08, scaleY: k * 0.9, duration: 240, yoyo: true, repeat: -1 });
      txt(this, XV, 58, 'VINCE!', { size: 11, color: '#ffe14a' });
      txt(this, XV, Y + 13, `1. ${G[v].nome.toUpperCase()}`, { size: 10, color: G[v].colore });
      this.time.addEvent({ delay: 350, loop: true, callback: () => stelle(this, XV + (Math.random() - 0.5) * 110, 100 + Math.random() * 100, 6) });
      // il perdente si dispera
      const sp = mostra(p, XP, 'triste');
      this.tweens.add({ targets: sp, x: XP + 3, duration: 55, yoyo: true, repeat: -1 });
      txt(this, XP, Y + 13, `2. ${G[p].nome.toUpperCase()}`, { size: 10, color: G[p].colore });
      this.time.addEvent({ delay: 220, loop: true, callback: () => {
        const sx = Math.random() < 0.5 ? -1 : 1;
        const g = this.add.ellipse(XP + sx * 22, 150, 4, 6, 0x7fd3ff);
        this.tweens.add({ targets: g, x: g.x + sx * 26, y: Y, duration: 550, ease: 'Quad.in', onComplete: () => g.destroy() });
      } });
      frase = caso(CONFIG.sfotto).replaceAll('{perdente}', G[p].nome).replaceAll('{vincitore}', G[v].nome);
    }
    // frase di sfottò
    const f = txt(this, 240, v < 0 ? yPari + 34 : 200, `"${frase}"`, { size: 9, wrap: 232 });
    f.setScale(0);
    this.tweens.add({ targets: f, scale: 1, delay: 800, duration: 400, ease: 'Back.out' });

    lampeggia(this, txt(this, 240, 258, perDito('INVIO: torna al menu', 'Tocca: torna al menu'), { size: 9, color: '#ffe14a' }));
    attendiInvio(this, () => { Audio.sfx('scegli'); this.scene.start('Menu'); });
  }
}
