// Le schermate della Fase 7 (config: js/config/modalita.js):
//  - Torneo: il tabellone a eliminazione diretta, dopo ogni partita (js/torneo.js)
//  - FineGiorno: com'è andata la Sfida del giorno (record del giorno e giorni di fila)
//  - squadre: la classifica a squadre (ROSSI contro BLU) del round e della fine, chiamate da flusso.js
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { Progressi } from '../progressi.js';
import { normalizza } from '../punteggi.js';
import { campione, nomeTurno } from '../torneo.js';
import { SP, ritratto } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, ombra, stelle, scritta, molleggia, perDito, annunciaTrofei } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

function attendi(scene, fn) {
  let fatto = false;
  const vai = (e) => { if (fatto || e?.repeat) return; fatto = true; Audio.sfx('scegli'); fn(); };
  scene.time.delayedCall(600, () => {
    for (const k of ['ENTER', 'SPACE']) scene.input.keyboard.on('keydown-' + k, vai);
    scene.input.on('pointerdown', () => vai());
  });
}
const colore = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;

// ------------------------------------------------------------
export class TorneoScene extends Phaser.Scene {
  constructor() { super('Torneo'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('menu');
    raggi(this, 0x2f6fb0, 0x4a8fd0);
    const S = Sessione, G = S.giocatori, esito = S.chiudiPartita(), T = S.torneo, re = campione(T);
    txt(this, 240, 16, re != null ? 'TORNEO: ABBIAMO UN CAMPIONE!' : `TORNEO: ${nomeTurno(T)}`, { size: 14, color: '#ffe14a' });
    // com'è finita la partita appena giocata
    if (esito) {
      const r = S.risultati[esito.round], A = G[esito.a], B = G[esito.b];
      const riga = `${A.nome} ${r[esito.a].punteggio}  -  ${r[esito.b].punteggio} ${B.nome}`;
      txt(this, 240, 31, riga, { size: 7.5 });
      this.time.delayedCall(400, () => {
        if (esito.pareggio) { scritta(this, 240, 44, 'PARI! SI RIGIOCA CON UN ALTRO MICROGIOCO', { size: 9, color: '#ffffff', durata: 99999 }).setAngle(0); Audio.sfx('tsk'); }
        else { const v = G[esito.vincitore]; scritta(this, 240, 44, `PASSA ${v.nome.toUpperCase()}!`, { size: 10, color: v.colore, durata: 99999 }).setAngle(0); Audio.sfx('ok'); }
      });
    }
    // il tabellone: una colonna per turno, da sinistra a destra
    const colonne = Math.log2(T.turni[0].length * 2), X0 = 52, LARGA = 376 / Math.max(1, colonne);
    const alto = 186, Y0 = 58, g = this.add.graphics();
    for (let c = 0; c < colonne; c++) {
      const turno = T.turni[c] ?? [], quante = T.turni[0].length / 2 ** c;
      for (let k = 0; k < quante; k++) {
        const m = turno[k], cy = Y0 + ((k + 0.5) * alto) / quante, x = X0 + c * LARGA, h = Math.min(30, (alto / quante) * 0.8);
        const corrente = m && m === S.partita && m.vincitore == null;
        g.fillStyle(0x1f1430, 0.7).fillRoundedRect(x, cy - h / 2, LARGA - 22, h, 6);
        g.lineStyle(corrente ? 2 : 1, corrente ? 0xffe14a : 0x8a7aa8, 1).strokeRoundedRect(x, cy - h / 2, LARGA - 22, h, 6);
        // le linee verso la partita dopo
        if (c < colonne - 1) { g.lineStyle(1.2, 0xffffff, 0.5); g.lineBetween(x + LARGA - 22, cy, x + LARGA - 11, cy); }
        if (!m) continue;
        [[m.a, -1], [m.b, 1]].forEach(([chi, lato]) => {
          const y = cy + lato * h / 4.2;
          if (chi == null) return void txt(this, x + 8, y, lato < 0 ? '' : '(passa)', { size: 5, ox: 0, color: '#b8b0c8' });
          const p = G[chi], vinto = m.vincitore === chi, perso = m.vincitore != null && m.vincitore !== chi;
          ritratto(this, x + 9, y, p.id, Math.min(12, h / 2 - 2)).setAlpha(perso ? 0.45 : 1);
          txt(this, x + 18, y, p.nome, { size: h < 22 ? 5 : 6, ox: 0, color: vinto ? '#7dff9a' : perso ? '#a8a0b8' : p.colore });
        });
      }
    }
    // il campione
    if (re != null) {
      const p = G[re];
      this.time.delayedCall(500, () => { Audio.sfx('vittoria'); stelle(this, 430, 140, 12); });
      ombra(this, 446, 214, 40);
      const s = im(this, 446, 214, `${p.id}_felice`).setOrigin(0.5, 1).setScale(1.7 * SP);
      this.tweens.add({ targets: s, y: 204, duration: 260, yoyo: true, repeat: -1, ease: 'Quad.out' });
      txt(this, 446, 224, p.nome.toUpperCase(), { size: 8, color: p.colore });
    }
    const avanti = re != null ? 'classifica finale' : 'prossima partita';
    txt(this, 240, 258, perDito(`INVIO: ${avanti}`, `Tocca: ${avanti}`), { size: 9, color: '#ffe14a' });
    attendi(this, () => {
      if (re != null) return this.scene.start('Finale');
      S.preparaPartita();
      this.scene.start('Intro');
    });
    pulsantiAngolo(this);
  }
}

// ------------------------------------------------------------
export class FineGiornoScene extends Phaser.Scene {
  constructor() { super('FineGiorno'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    const S = Sessione, g = S.giocatore;
    const punti = S.lista.reduce((t, id, i) => t + (S.risultati[i][g.i] ? normalizza(id, S.risultati[i][g.i].punteggio) : 0), 0);
    const esito = S.registrata ? this.registry.get('esitoGiorno') : Progressi.dopoGiorno(S.giorno, punti);
    S.registrata = true;
    this.registry.set('esitoGiorno', esito);
    Audio.musica('festa');
    raggi(this, 0xe09a28, 0xf2c14a);
    Audio.sfx(esito.record ? 'vittoria' : 'ok');
    txt(this, 240, 20, 'SFIDA DEL GIORNO', { size: 18, color: '#ffe14a' });
    txt(this, 240, 38, S.giorno.split('-').reverse().join('/'), { size: 8 });
    ombra(this, 96, 224, 70);
    molleggia(this, im(this, 96, 224, `${g.id}_felice`).setOrigin(0.5, 1).setScale(3.3 * SP));
    txt(this, 96, 238, g.nome.toUpperCase(), { size: 10, color: g.colore });
    pannello(this, 320, 132, 260, 150, { alfa: 0.65, raggio: 10 });
    S.lista.forEach((id, i) => {
      const r = S.risultati[i][g.i], y = 70 + i * 16;
      txt(this, 200, y, CONFIG.microgiochi[id].titolo, { size: 7, ox: 0, color: '#fff3d6' });
      txt(this, 440, y, r ? `${normalizza(id, r.punteggio)}` : '-', { size: 8, ox: 1 });
    });
    const yt = 70 + S.lista.length * 16 + 6;
    txt(this, 200, yt, 'TOTALE (punti sfida)', { size: 8, ox: 0, color: '#ffe14a' });
    const tot = txt(this, 440, yt, String(punti), { size: 11, ox: 1, color: '#ffe14a' });
    this.tweens.add({ targets: tot, scale: 1.25, duration: 300, yoyo: true, delay: 300 });
    txt(this, 320, yt + 18, `Il migliore di oggi: ${esito.migliore}     Giorni di fila: ${esito.serie}`, { size: 7, color: '#fff3d6' });
    if (esito.record) this.time.delayedCall(500, () => scritta(this, 320, yt + 34, esito.primo ? 'FATTA! A DOMANI!' : 'NUOVO RECORD DI OGGI!', { size: 11, color: '#7dff9a', durata: 99999 }).setAngle(0));
    if (esito.pinte) txt(this, 320, yt + 48, `+${esito.pinte} PINTE`, { size: 7.5, color: '#ffe14a' });
    annunciaTrofei(this, esito.trofei, 900);
    txt(this, 240, 258, perDito('INVIO: menu', 'Tocca: menu'), { size: 9, color: '#ffe14a' });
    attendi(this, () => this.scene.start('Menu'));
    pulsantiAngolo(this);
  }
}

// ------------------------------------------------------------
//  SQUADRE: la classifica generale (dopo ogni round) e quella finale, chiamate da flusso.js
export function generaleSquadre(scene, fatto) {
  const S = Sessione, Q = CONFIG.modalita.squadre, prima = S.classifica(S.indice).squadre, dopo = S.classifica(S.indice + 1).squadre;
  raggi(scene, 0x2f7fb0, 0x4a9fd0);
  txt(scene, 240, 17, 'SQUADRE: LA CLASSIFICA', { size: 15, color: '#ffe14a' });
  txt(scene, 240, 34, `dopo il round ${S.indice + 1} di ${S.lista.length}  (conta la media dei punti sfida di ogni squadra)`, { size: 6.5 });
  const barre = scene.add.graphics(), massimo = Math.max(1, ...dopo.punti), val = [...prima.punti];
  [0, 1].forEach((q) => {
    const y = 90 + q * 80, membri = S.giocatori.filter((g) => g.i % 2 === q);
    pannello(scene, 240, y, 430, 66, { alfa: 0.55, raggio: 10, bordo: colore(Q.colori[q]) });
    txt(scene, 40, y - 18, Q.nomi[q], { size: 12, ox: 0, color: Q.colori[q] });
    membri.forEach((g, k) => ritratto(scene, 48 + k * 26, y + 12, g.id, 20));
  });
  const numeri = [0, 1].map((q) => txt(scene, 0, 90 + q * 80 - 18, '', { size: 10, ox: 0 }));
  const disegna = () => {
    barre.clear();
    [0, 1].forEach((q) => {
      const y = 90 + q * 80 - 18, w = Math.max(2, (250 * val[q]) / massimo);
      barre.fillStyle(0x000000, 0.3).fillRoundedRect(120, y - 6, 250, 12, 6);
      barre.fillStyle(colore(Q.colori[q]), 1).fillRoundedRect(120, y - 6, w, 12, 6);
      numeri[q].setPosition(126 + w, y).setText(String(Math.round(val[q])));
    });
  };
  disegna();
  scene.time.delayedCall(450, () => { Audio.sfx('muovi'); scene.tweens.addCounter({ from: 0, to: 1, duration: 900, ease: 'Cubic.out', onUpdate: (t) => { const k = t.getValue(); val[0] = prima.punti[0] + (dopo.punti[0] - prima.punti[0]) * k; val[1] = prima.punti[1] + (dopo.punti[1] - prima.punti[1]) * k; disegna(); } }); });
  const r = dopo.ultimoRound;
  if (r >= 0) scene.time.delayedCall(1400, () => scritta(scene, 240, 238, `ROUND AI ${Q.nomi[r]}!`, { size: 12, color: Q.colori[r], durata: 99999 }).setAngle(0));
  fatto();
}

export function finaleSquadre(scene) {
  const S = Sessione, Q = CONFIG.modalita.squadre, sq = S.classifica().squadre, v = sq.vincitrice;
  txt(scene, 240, 18, v < 0 ? 'PAREGGIO TRA LE SQUADRE!' : `VINCONO I ${Q.nomi[v]}!`, { size: 18, color: v < 0 ? '#ffffff' : Q.colori[v] });
  [0, 1].forEach((q) => {
    const x = q ? 360 : 120, membri = S.giocatori.filter((g) => g.i % 2 === q), vince = v === q;
    pannello(scene, x, 128, 210, 150, { alfa: 0.55, raggio: 12, bordo: colore(Q.colori[q]) });
    txt(scene, x, 66, `${Q.nomi[q]}: ${Math.round(sq.punti[q])}`, { size: 11, color: Q.colori[q] });
    txt(scene, x, 80, sq.round[q] === 1 ? '1 round vinto' : `${sq.round[q]} round vinti`, { size: 7 });
    const passo = Math.min(48, 190 / membri.length);
    membri.forEach((g, k) => {
      const gx = x + (k - (membri.length - 1) / 2) * passo;
      ombra(scene, gx, 190, 30);
      const s = im(scene, gx, 190, `${g.id}_${vince ? 'felice' : v < 0 ? 'normale' : 'triste'}`).setOrigin(0.5, 1).setScale(1.5 * SP);
      if (vince) scene.tweens.add({ targets: s, y: 182, duration: 250, yoyo: true, repeat: -1, ease: 'Quad.out', delay: k * 80 });
      txt(scene, gx, 198, g.nome, { size: 5.5, color: g.colore });
    });
  });
  if (v >= 0) scene.time.addEvent({ delay: 400, loop: true, callback: () => stelle(scene, (v ? 360 : 120) + (Math.random() - 0.5) * 160, 110 + Math.random() * 60, 4) });
}
