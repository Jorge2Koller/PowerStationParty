// Schermate tra un microgioco e l'altro: introduzione (e passaggio di mano), risultato,
// classifica del round e classifica generale (da tre giocatori in su), finale.
// In due il giro è quello di sempre: intro, microgioco, risultato, e alla fine il confronto.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { Salvataggio } from '../salvataggio.js';
import { medaglia, MEDAGLIE } from '../punteggi.js';
import { premiBuffi } from '../premi.js';
import { Progressi } from '../progressi.js';
import { NOMI_LIVELLI, COLORI_LIVELLI } from '../livelli.js';
import { SP, ritratto, preparaGiocatore } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, ombra, molleggia, stelle, scritta, scuoti, caso, eTouch, perDito, pulsante, menuLista, annunciaTrofei } from '../fx.js';
import { pulsantiAngolo } from './menu.js';
import { generaleSquadre as classificaSquadre, finaleSquadre } from './torneo.js';
import { nomeTurno } from '../torneo.js';

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

// a fine sfida: prima i premi buffi (se ce ne sono), poi la classifica finale
const alFinale = (scene) => scene.scene.start(premiBuffi(Sessione).length ? 'Premi' : 'Finale');
const NOMI_MEDAGLIE = { bronzo: 'BRONZO', argento: 'ARGENTO', oro: 'ORO' };

// "1°", "2°"... coi colori del podio
const COLORI_POS = ['#ffe14a', '#dfe6ee', '#e8a264'];
const posto = (pos) => `${pos}°`;

// la frase di sfottò della classifica finale: non ne esce una che nomina proprio il primo o l'ultimo
function sfotto(G, ordine) {
  const primo = G[ordine[0]], secondo = G[ordine[1]], ultimo = G[ordine[ordine.length - 1]];
  const parola = (g) => g.nome.replace(/^(il |lo |la |l')/i, '').toLowerCase();
  const vietate = [parola(primo), parola(ultimo)];
  const tutte = [...CONFIG.sfotto, ...(G.length >= 3 ? CONFIG.sfottoTanti : []), ...Progressi.frasiExtra()];   // (più quelle comprate al Bancone)
  const buone = tutte.filter((f) => { const nuda = f.replace(/\{\w+\}/g, '').toLowerCase(); return !vietate.some((v) => nuda.includes(v)); });
  return caso(buone.length ? buone : tutte)
    .replaceAll('{primo}', primo.nome).replaceAll('{secondo}', secondo.nome).replaceAll('{ultimo}', ultimo.nome)
    .replaceAll('{tutti}', G.map((g) => g.nome).join(', '));
}

// I due pulsanti in fondo all'introduzione: PROVA e PRONTO! (frecce + SPAZIO o INVIO, P per la prova,
// oppure un clic o un tocco sul pulsante). primaProva = il cursore parte su PROVA. frecce = i due tasti
// che spostano il cursore (SU/GIÙ quando SINISTRA/DESTRA servono ad altro, come a scegliere la canzone)
function sceltaProva(scene, y, primaProva, prova, pronto, frecce = ['LEFT', 'RIGHT']) {
  const voci = [{ testo: 'PROVA', x: 186, w: 78, fn: prova }, { testo: 'PRONTO!', x: 294, w: 96, fn: pronto }];
  const c = scene.add.container(0, 0).setDepth(20);
  let sel = primaProva ? 0 : 1, fatto = false, attivo = false;
  const g = scene.add.graphics();
  c.add(g);
  const scritte = voci.map((v) => { const t = txt(scene, v.x, y, v.testo, { size: 10 }); c.add(t); return t; });
  const disegna = () => {
    g.clear();
    voci.forEach((v, i) => {
      const su = i === sel;
      g.fillStyle(0x000000, 0.35); g.fillRoundedRect(v.x - v.w / 2 + 1.5, y - 8.5, v.w, 18, 9);
      g.fillStyle(su ? 0xffe14a : 0x1f1430, su ? 1 : 0.85); g.fillRoundedRect(v.x - v.w / 2, y - 10, v.w, 18, 9);
      g.lineStyle(1.6, su ? 0xffffff : 0xffe14a, 1); g.strokeRoundedRect(v.x - v.w / 2, y - 10, v.w, 18, 9);
      scritte[i].setColor(su ? '#1f1430' : '#ffe14a').setStroke(su ? '#ffe14a' : '#1f1430', su ? 0 : 4);
    });
  };
  // (i tasti aspettano un attimo, per quelli tenuti premuti dalla schermata prima; il clic e il tocco no)
  const scegli = (i, tasto = false) => { if (fatto || (tasto && !attivo)) return; fatto = true; voci[i].fn(); };
  const muovi = (i) => { if (i === sel || fatto) return; sel = i; Audio.sfx('muovi'); disegna(); };
  voci.forEach((v, i) => {
    const z = scene.add.zone(v.x, y - 1, v.w + 6, 24).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => muovi(i));
    z.on('pointerdown', () => { muovi(i); scegli(i); });
    c.add(z);
  });
  scene.tweens.add({ targets: scritte, scale: 1.06, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  disegna();
  // (come attendiInvio: un attimo prima di ascoltare, così i tasti tenuti premuti non contano)
  scene.time.delayedCall(350, () => {
    attivo = true;
    const k = scene.input.keyboard, ok = (e) => { if (!e.repeat) scegli(sel, true); };
    k.on('keydown-' + frecce[0], () => muovi(0)); k.on('keydown-' + frecce[1], () => muovi(1));
    k.on('keydown-SPACE', ok); k.on('keydown-ENTER', ok);
    k.on('keydown-P', (e) => { if (!e.repeat) { muovi(0); scegli(0, true); } });
  });
  return c;
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
    const round = S.tipo === 'torneo' ? `TORNEO: ${nomeTurno(S.torneo)}`
      : S.tipo === 'giorno' ? `SFIDA DEL GIORNO: ${S.indice + 1} DI ${S.lista.length}`
      : S.tipo === 'squadre' ? `SQUADRE, ROUND ${S.indice + 1} DI ${S.lista.length}: ${g.nome} gioca per i ${CONFIG.modalita.squadre.nomi[g.i % 2]}`
      : S.solitario ? `DA SOLO: ${S.indice + 1} DI ${S.lista.length}` + (S.boss ? '  -  IL BOSS!' : '')
      : S.tipo === 'lampo' ? `LAMPO: ${S.indice + 1} DI ${S.lista.length}`
      : S.modo !== 'sfida' ? 'ALLENAMENTO'
      : S.meglioDi ? `AL MEGLIO DI ${S.meglioDi}: ROUND ${S.indice + 1}` + (n === 2 ? `  (${vinti[0]} - ${vinti[1]})` : '')
      : S.lista.length > 1 ? `ROUND ${S.indice + 1} DI ${S.lista.length}` : n === 2 ? 'SFIDA A DUE' : 'PARTITA SINGOLA';
    txt(this, 240, 14, `${round}  -  ${S.modo === 'sfida' ? `turno ${S.passo + 1} di ${S.turni}` : g.nome}` + (cambio ? `  -  ${m.titolo}` : ''), { size: 7 });
    // da solo: le vite in alto a destra
    if (S.solitario) for (let k = 0; k < CONFIG.modalita.solitario.vite; k++) im(this, 400 + k * 16, 14, 'cuore', 1).setAlpha(k < S.solitario.vite ? 1 : 0.25);
    const titolo = txt(this, 240, cambio ? 37 : 40, cambio ? `TOCCA A ${g.nome.toUpperCase()}!` : m.titolo, { size: cambio ? 21 : 19, color: cambio ? g.colore : '#ffe14a', wrap: 460 });
    titolo.setScale(0);
    this.tweens.add({ targets: titolo, scale: 1, duration: 450, ease: 'Back.out' });
    // sotto il titolo, alla sua altezza vera (un titolo lungo va su due righe)
    let sotto = titolo.y + titolo.height / 2 - 3;
    if (cambio) { const t = txt(this, 240, sotto + 1, perDito(`Passa la tastiera a ${g.nome}`, `Passa il telefono a ${g.nome}`), { size: 7.5, color: '#fff3d6', oy: 0 }); sotto = t.y + t.height; }
    else if (m.verbo) {
      // il comando in una parola
      const v = txt(this, 240, sotto + 8, m.verbo, { size: 11, color: '#ffffff', stroke: '#1f1430', thick: 4 }).setAlpha(0);
      sotto = v.y + v.height / 2;
      this.tweens.add({ targets: v, alpha: 1, delay: 350, duration: 200 });
      this.tweens.add({ targets: v, scale: 1.12, delay: 550, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    // la canzone, nei microgiochi che ne hanno più d'una (Provini a X-Factor): quale suona in questo
    // turno (Sessione.canzone). In Allenamento si sceglie: SINISTRA/DESTRA, o un clic o un tocco sulle
    // frecce (e PROVA/PRONTO! allora vanno con SU/GIÙ)
    const canzoni = m.canzoni?.length > 1 ? m.canzoni : null, sceglieCanzone = !!canzoni && S.modo === 'allenamento';
    if (canzoni) {
      // il titolo e, più piccoli, gli artisti, in una riga stretta (le frecce non devono toccare i
      // personaggi ai lati)
      const y = sotto + 9, tt = txt(this, 0, y, '', { size: 7.5, color: '#ffe14a', ox: 0 }), ta = txt(this, 0, y + 0.5, '', { size: 6, color: '#fff3d6', ox: 0 });
      let largo = 0;
      const scrivi = () => {
        const b = canzoni[S.canzone(id)];
        tt.setText(b.titolo.toUpperCase()); ta.setText(b.di);
        // (le scritte hanno già 3 pixel di margine per lato: attaccate, restano staccate di 6)
        largo = tt.width + ta.width;
        tt.x = 240 - largo / 2; ta.x = tt.x + tt.width;
      };
      scrivi();
      if (sceglieCanzone) {
        const frecce = [-1, 1].map((d) => {
          const t = txt(this, 0, y, d < 0 ? '<' : '>', { size: 10, color: '#ffe14a' });
          const z = this.add.zone(0, y, 30, 22).setInteractive({ useHandCursor: true }).on('pointerdown', () => cambia(d));
          return { d, t, z };
        });
        const metti = () => frecce.forEach(({ d, t, z }) => { t.x = z.x = 240 + d * (largo / 2 + 12); });
        const cambia = (d) => {
          S.scegliCanzone(id, (S.canzone(id) + d + canzoni.length) % canzoni.length);
          Audio.sfx('muovi');
          scrivi();
          metti();
        };
        metti();
        this.tweens.add({ targets: frecce.map((f) => f.t), alpha: 0.45, duration: 450, yoyo: true, repeat: -1 });
        // (come per PROVA/PRONTO!: un attimo prima di ascoltare i tasti)
        this.time.delayedCall(350, () => {
          this.input.keyboard.on('keydown-LEFT', () => cambia(-1));
          this.input.keyboard.on('keydown-RIGHT', () => cambia(1));
        });
      }
      sotto = y + 9;
    }

    // PROVA o PRONTO!: prima di ogni turno si può provare il microgioco (una partita come quella vera,
    // ma diversa e che non conta), finché chi gioca non preme PRONTO. Tornando dalla prova si parte
    // subito col conto alla rovescia. Per i microgiochi mai giocati su questo telefono o computer il
    // cursore parte su PROVA (Impostazioni: Prova)
    const chiaveTurno = `${S.seme}:${S.passo}`;
    const dallaProva = S.dopoProva === chiaveTurno;
    S.dopoProva = null;

    // chi gioca (travestito, se gioca contro se stesso)
    ombra(this, 60, 224, 62);
    const s = im(this, 60, 224, S.inScena.id + '_normale').setOrigin(0.5, 1).setScale((cambio ? 3.7 : 3.3) * SP);
    molleggia(this, s);
    txt(this, 60, 236, 'TOCCA A', { size: 7 });
    txt(this, 60, 249, g.nome.toUpperCase(), { size: g.nome.length > 11 ? 9 : 11, color: g.colore });
    txt(this, 60, 261, NOMI_LIVELLI[S.livello], { size: 6, color: COLORI_LIVELLI[S.livello] });

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
    const cima = Math.max(66, Math.round(sotto + 1));
    txt(this, 240, cima + 11, 'COMANDI', { size: 9, color: '#ffe14a', depth: 2 });
    const tc = txt(this, 240, cima + 18, (eTouch() && m.comandiTouch ? m.comandiTouch : m.comandi).join('\n'), { size: 7, oy: 0, spacing: 0, wrap: 246, depth: 2 });
    const to = txt(this, 240, tc.y + tc.height + 1, m.obiettivo, { size: 8, oy: 0, color: '#7dff9a', wrap: 246, depth: 2 });
    const td = txt(this, 240, to.y + to.height - 2, `Durata: ${S.tipo === 'lampo' ? CONFIG.modalita.lampo.durata : m.durata} secondi`, { size: 6.5, oy: 0, color: '#fff3d6', depth: 2 });
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

    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
    // sul telefono non c'è ESC: freccia per tornare al menu, audio e schermo intero
    if (eTouch()) pulsante(this, 16, 13, 'indietro', () => this.scene.start('Menu'));
    pulsantiAngolo(this);

    const parti = () => {
      bottoni?.destroy();
      Audio.musica(null);   // (durante il conto alla rovescia la musica tace: si sente il conto)
      // durante il conto alla rovescia regole e personaggi si scuriscono: i numeri si leggono meglio
      const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(90);
      this.tweens.add({ targets: velo, fillAlpha: 0.78, duration: 180 });
      // conto alla rovescia 3-2-1-VIA
      // (l'ultimo è il comando in una parola: SPILLA!, SCHIVA!...)
      // in Lampo si parte subito: solo il comando
      const conto = S.tipo === 'lampo' ? [m.verbo ?? 'VIA!'] : ['3', '2', '1', m.verbo ?? 'VIA!'];
      conto.forEach((num, k) => this.time.delayedCall(k * 650, () => {
        const i = k + 4 - conto.length;   // (0, 1, 2 = i numeri; 3 = il comando)
        Audio.jingle(['conto3', 'conto2', 'conto1', 'contoVia'][i]);
        const t = txt(this, 240, 135, num, { size: i < 3 ? 70 : num.length > 8 ? 46 : 56, color: i < 3 ? '#ffffff' : '#7dff9a', thick: 10, depth: 100 });
        t.setScale(2.5).setAlpha(0);
        this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 220, ease: 'Back.out' });
        this.tweens.add({ targets: t, alpha: 0, scale: 0.6, delay: 480, duration: 150, onComplete: () => t.destroy() });
        scuoti(this, 80, 0.004);
      }));
      this.time.delayedCall(conto.length * 650, () => this.scene.start('mg_' + id));
    };
    const prova = () => { Audio.sfx('scegli'); S.prova = true; this.scene.start('mg_' + id); };
    const bottoni = dallaProva ? null : sceltaProva(this, yPronto, !Salvataggio.dati.visti[id] && Salvataggio.impostazioni.provaLampo !== false, prova, parti, sceglieCanzone ? ['UP', 'DOWN'] : undefined);
    if (dallaProva) parti();
  }
}

// ------------------------------------------------------------
export class RisultatoScene extends Phaser.Scene {
  constructor() { super('Risultato'); }
  create(dati) {
    inquadra(this);
    const r = dati.risultato, S = Sessione, g = S.giocatore, m = CONFIG.microgiochi[S.idCorrente], G = S.giocatori, n = S.n;
    S.registra(r);
    Salvataggio.dati.visti[S.idCorrente] = true;       // niente più prova lampo per questo microgioco
    // (in Lampo i microgiochi durano meno: i punti non si confrontano con le medaglie)
    const intero = S.tipo !== 'lampo';
    if (intero) {
      Salvataggio.registra(S.idCorrente, r.punteggio, S.livello);   // il registro locale dei punteggi (per ritarare le medaglie)
      // statistiche, record, Pinte e trofei (js/progressi.js)
      this.progressi = Progressi.dopoTurno({ id: S.idCorrente, punteggio: r.punteggio, giocatore: g, controSeStesso: S.controSeStesso });
    } else this.progressi = null;
    this.input.setDefaultCursor('default');
    raggi(this, r.vittoria ? 0x3fae74 : 0x8a5a9a, r.vittoria ? 0x62cf96 : 0xa878b8);
    // prima il jingle (se il finale del microgioco non l'ha appena suonato; con la medaglia suona il suo,
    // al timbro), poi la musica del menu
    Audio.musica(null);
    if (!(intero && r.vittoria)) Audio.sfx(r.vittoria ? 'vittoria' : 'sconfitta');
    this.time.delayedCall(2600, () => Audio.musica('menu'));

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

    // il riepilogo (una o due righe), e sotto, all'altezza vera del testo, PUNTEGGIO e il numero;
    // il riquadro si allunga quanto serve (come nell'introduzione)
    // (con due righe tutto si stringe un po', se no la medaglia tocca il riquadro di sotto)
    const riep = txt(this, 330, 79, r.riepilogo, { size: 8, wrap: 230, oy: 0, depth: 2 });
    const stretto = riep.height > 20;
    const yEtichetta = Math.max(103, riep.y + riep.height + (stretto ? 2 : 4));
    this.yPunti = yEtichetta + (stretto ? 24 : 27);
    this.dySotto = stretto ? 19 : 21;
    pannello(this, 330, (74 + this.yPunti + this.dySotto + 9) / 2, 240, this.yPunti + this.dySotto + 9 - 74, { alfa: 0.6, bordo: null, raggio: 10 });
    txt(this, 330, yEtichetta, 'PUNTEGGIO', { size: 9, color: '#ffe14a', depth: 2 });
    const pt = txt(this, 330, this.yPunti, '0', { size: 32, depth: 2 });
    pt.setScale(0);
    this.tweens.add({ targets: pt, scale: 1, delay: 300, duration: 400, ease: 'Bounce.out' });
    // il punteggio sale (col ticchettio), poi arriva la medaglia col timbro
    const conta = { v: 0 };
    let tic = 0;
    this.tweens.add({
      targets: conta, v: r.punteggio, delay: 300, duration: Math.min(900, 250 + Math.abs(r.punteggio) * 4), ease: 'Quad.out',
      onUpdate: () => { pt.setText(String(Math.round(conta.v))); if (this.time.now - tic > 70) { tic = this.time.now; Audio.sfx('muovi'); } },
      onComplete: () => { pt.setText(String(r.punteggio)); if (intero) this.medaglia(r.punteggio); },
    });

    let prompt, avanti;
    if (S.solitario) {
      // da solo: con una medaglia si va avanti, senza si perde una vita (il boss vuole di più)
      const R = S.solitario, C = CONFIG.modalita.solitario, boss = S.boss, serve = boss ? C.medagliaBoss : 'bronzo';
      const superato = MEDAGLIE.indexOf(medaglia(S.idCorrente, r.punteggio)) >= MEDAGLIE.indexOf(serve);
      if (!R.contati[S.indice]) {
        R.contati[S.indice] = true;
        if (superato) R.superati++; else R.vite--;
        if (boss) R.boss = superato ? 'vinto' : 'perso';
      }
      pannello(this, 330, 186, 240, 34, { colore: superato ? 0x2e7a4a : 0x7a1f2a, raggio: 9 });
      for (let k = 0; k < C.vite; k++) im(this, 330 - (C.vite - 1) * 8 + k * 16, 179, 'cuore', 1).setAlpha(k < R.vite ? 1 : 0.25);
      txt(this, 330, 194, superato ? (boss ? 'BOSS BATTUTO!' : 'SUPERATO!') : boss ? `PER IL BOSS SERVIVA ${serve.toUpperCase()}` : 'NIENTE MEDAGLIA: VITA PERSA!', { size: 8, color: superato ? '#7dff9a' : '#ffb0a4' });
      const fine = boss || R.vite <= 0;
      prompt = perDito(fine ? 'INVIO: com\'è andata' : 'INVIO: prossimo microgioco', fine ? 'Tocca: com\'è andata' : 'Tocca: prossimo microgioco');
      avanti = () => { if (fine) return this.scene.start('FineSolitario'); S.indice++; S.passo = 0; this.scene.start('Intro'); };
    } else if (S.modo === 'giorno') {
      // la sfida del giorno: uno dopo l'altro, poi il totale
      const fine = S.indice >= S.lista.length - 1;
      pannello(this, 330, 186, 240, 30, { colore: 0x7a5a1a, raggio: 9 });
      txt(this, 330, 186, `SFIDA DEL GIORNO: ${S.indice + 1} di ${S.lista.length}`, { size: 9, color: '#ffe14a' });
      prompt = perDito(fine ? 'INVIO: com\'è andata' : 'INVIO: prossimo microgioco', fine ? 'Tocca: com\'è andata' : 'Tocca: prossimo microgioco');
      avanti = () => { if (fine) return this.scene.start('FineGiorno'); S.indice++; S.passo = 0; this.scene.start('Intro'); };
    } else if (S.modo === 'allenamento') {
      prompt = perDito('INVIO: riprova     ESC: menu', 'Tocca: riprova');
      avanti = () => { S.nuovoAllenamento(S.idCorrente, S.turno); this.scene.start('Intro'); };
      this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
      if (eTouch()) pulsante(this, 16, 13, 'indietro', () => this.scene.start('Menu'));
    } else if (!S.ultimoTurno) {
      // stesso microgioco, ora tocca al prossimo
      const p = S.prossimo, rec = S.record;
      pannello(this, 330, 186, 240, 30, { colore: 0x7a1f2a, raggio: 9 });
      txt(this, 330, 180, `Ora tocca a ${p.nome.toUpperCase()}`, { size: 10, color: '#ffe14a' });
      txt(this, 330, 193, n === 2 || S.tipo === 'torneo' ? `stesso gioco: da battere ${r.punteggio} punti` : `record del round: ${rec.punteggio} punti (${rec.giocatore.nome})`, { size: 7 });
      prompt = perDito(`Passa i comandi a ${p.nome} e premi INVIO`, `Passa il telefono a ${p.nome} e tocca lo schermo`);
      avanti = () => { S.passo++; this.scene.start('Intro'); };
    } else if (S.tipo === 'torneo') {
      // la partita è finita: il risultato, poi il tabellone
      const [a, b] = S.chiGioca(S.indice), R = S.risultati[S.indice];
      pannello(this, 330, 186, 240, 30, { colore: 0x2f4f9a, raggio: 9 });
      txt(this, 330, 186, `${a.nome} ${R[a.i].punteggio}  -  ${R[b.i].punteggio} ${b.nome}`, { size: 8.5 });
      prompt = perDito('INVIO: il tabellone del torneo', 'Tocca: il tabellone del torneo');
      avanti = () => this.scene.start('Torneo');
    } else if (n === 2) {
      // entrambi hanno giocato: chi ha vinto il round?
      const [a, b] = S.risultati[S.indice], v = S.vincitoreRound(S.indice);
      pannello(this, 330, 190, 240, 42, { alfa: 0.75, raggio: 9 });
      txt(this, 330, 179, `${G[0].nome} ${a.punteggio}  -  ${b.punteggio} ${G[1].nome}`, { size: 9 });
      const esito = v < 0 ? 'ROUND PARI!' : `ROUND A ${G[v].nome.toUpperCase()}!`;
      // (dritta: è larga, e con l'inclinazione a caso di scritta() finiva sopra la riga dei punteggi)
      this.time.delayedCall(700, () => { scritta(this, 330, 197, esito, { size: 14, color: v < 0 ? '#ffffff' : G[v].colore, durata: 999999 }).setAngle(0); Audio.sfx('ok'); });
      const ultimo = S.finita, cl = S.classifica();
      // (sotto il riquadro, non sul bordo) il totale finora: round vinti o punti sfida
      txt(this, 330, 221, S.meglioDi ? `AL MEGLIO DI ${S.meglioDi}:  ${G[0].nome} ${cl.round[0]} - ${cl.round[1]} ${G[1].nome}`
        : `TOTALE PUNTI SFIDA:  ${G[0].nome} ${cl.punti[0]} - ${cl.punti[1]} ${G[1].nome}`, { size: 7, color: '#7dff9a' });
      // dopo ogni round (tranne l'ultimo) la classifica generale, come da tre giocatori in su
      prompt = perDito(ultimo ? 'INVIO: classifica finale' : 'INVIO: classifica', ultimo ? 'Tocca: classifica finale' : 'Tocca: classifica');
      avanti = () => (ultimo ? alFinale(this) : this.scene.start('Classifica', { fase: 2 }));
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

  // la medaglia presa (col timbro) e, accanto, quanto manca alla prossima
  medaglia(punteggio) {
    const id = Sessione.idCorrente, soglie = CONFIG.microgiochi[id].medaglie, tipo = medaglia(id, punteggio);
    if (!soglie) return;
    if (tipo) {
      const Y = this.yPunti, img = im(this, 262, Y - 2, 'medaglia_' + tipo, 1.3).setAngle(-10).setDepth(3), s0 = img.scaleX;
      img.setScale(s0 * 3).setAlpha(0);
      this.tweens.add({ targets: img, scale: s0, alpha: 1, duration: 200, ease: 'Quad.in', onComplete: () => {
        Audio.jingle({ bronzo: 'medagliaBronzo', argento: 'medagliaArgento', oro: 'medagliaOro' }[tipo]);
        scuoti(this, 90, 0.004);
        stelle(this, 262, Y - 2, tipo === 'oro' ? 9 : 5);
        this.tweens.add({ targets: img, angle: 10, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      } });
      txt(this, 262, Y + this.dySotto, NOMI_MEDAGLIE[tipo], { size: 7, color: '#ffe14a', depth: 3 });
    }
    const P = this.progressi;
    const Y = this.yPunti;
    if (P?.pinte) { im(this, 388, Y + this.dySotto, 'iconaPinta', 0.42).setDepth(3); txt(this, 394, Y + this.dySotto, `+${P.pinte} PINTE`, { size: 7, ox: 0, color: '#ffe14a', depth: 3 }); }
    if (P?.record) { scritta(this, 330, Y + this.dySotto, 'NUOVO RECORD!', { size: 10, color: '#7dff9a', durata: 1600 }).setAngle(0); Audio.sfx('bonus'); }
    // (i trofei arrivano in basso, dopo il titolo e la medaglia)
    annunciaTrofei(this, P?.trofei, 900);
    const prossima = MEDAGLIE.find((k) => punteggio < soglie[k]);
    txt(this, 404, Y - 2, prossima ? `${NOMI_MEDAGLIE[prossima]}\na ${soglie[prossima]}` : 'TUTTE LE\nMEDAGLIE!', { size: 7, color: '#fff3d6', spacing: -1, depth: 3 });
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
    const S = Sessione, c = S.classificaRound(S.indice), n = c.length, m = CONFIG.microgiochi[S.idCorrente];
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
    attendiInvio(this, () => { Audio.sfx('scegli'); if (ultimo) alFinale(this); else this.scene.restart({ fase: 2 }); });
  }

  // squadre: due barre, ROSSI e BLU (js/scenes/torneo.js)
  squadre() {
    const S = Sessione;
    classificaSquadre(this, () => {});
    lampeggia(this, txt(this, 240, 260, perDito('INVIO: prossimo round', 'Tocca: prossimo round'), { size: 8.5, color: '#ffe14a' }));
    attendiInvio(this, () => { Audio.sfx('scegli'); S.indice++; S.passo = 0; this.scene.start('Intro'); });
  }

  generale() {
    if (Sessione.tipo === 'squadre') return this.squadre();
    const S = Sessione, G = S.giocatori, n = S.n;
    const prima = S.classifica(S.indice), dopo = S.classifica(S.indice + 1), cosa = S.meglioDi ? 'round vinti' : n <= 2 ? 'punti sfida' : 'punti';
    raggi(this, 0x2f7fb0, 0x4a9fd0);
    txt(this, 240, 17, 'CLASSIFICA GENERALE', { size: 15, color: '#ffe14a' });
    txt(this, 240, 34, S.meglioDi ? `round vinti: al meglio di ${S.meglioDi} vince chi arriva a ${S.serve}` : `${cosa} dopo il round ${S.indice + 1} di ${S.lista.length}`, { size: 7.5 });
    // una riga per giocatore: ritratto, nome, barra, numero. Si parte dall'ordine di prima.
    // (in due: righe grandi, al centro dello schermo)
    const grande = n <= 2, alt = grande ? 46 : Math.min(26, 196 / n), y0 = grande ? 135 - alt / 2 : 50 + alt / 2, X0 = 176, LARGA = 236, massimo = Math.max(1, ...dopo.conta);
    pannello(this, 240, y0 - alt / 2 - 2 + (n * alt) / 2, 420, n * alt + 8, { alfa: 0.55, bordo: null, raggio: 8 });
    const barre = this.add.graphics();
    const righe = G.map((g) => {
      const riga = { g, k: prima.ordine.indexOf(g.i), val: prima.conta[g.i], y: 0 };
      riga.y = y0 + riga.k * alt;
      riga.cose = this.add.container(0, riga.y, [
        ritratto(this, grande ? 50 : 44, 0, g.id, grande ? 38 : Math.min(22, alt - 3)),
        txt(this, grande ? 74 : 60, 0, g.nome, { size: grande ? 10 : alt < 20 ? 6.5 : 7.5, color: g.colore, ox: 0 }),
      ]);
      riga.numero = txt(this, 0, riga.y, '', { size: grande ? 13 : alt < 20 ? 7.5 : 9, ox: 0 });
      riga.freccia = txt(this, 30, riga.y, '', { size: 8, color: '#7dff9a' });
      return riga;
    });
    const disegna = () => {
      barre.clear();
      for (const r of righe) {
        const w = Math.max(2, (LARGA * r.val) / massimo), h = grande ? 20 : Math.min(13, alt - 8);
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
      if (grande) {
        const [p0, p1] = dopo.ordine, d = Math.round(dopo.conta[p0] - dopo.conta[p1]), cosa2 = S.meglioDi ? 'round' : 'punti';
        scritta(this, 240, 214, d === 0 ? 'PARI!' : `${G[p0].nome.toUpperCase()} AVANTI DI ${d} ${cosa2.toUpperCase()}`, { size: 12, color: d === 0 ? '#ffffff' : G[p0].colore, durata: 99999 }).setAngle(0);
      }
    });
    lampeggia(this, txt(this, 240, 260, perDito('INVIO: prossimo round', 'Tocca: prossimo round'), { size: 8.5, color: '#ffe14a' }));
    attendiInvio(this, () => { Audio.sfx('scegli'); S.indice++; S.passo = 0; this.scene.start('Intro'); });
  }
}

// ------------------------------------------------------------
// ------------------------------------------------------------
//  I premi buffi della serata (js/premi.js), prima della classifica finale
export class PremiScene extends Phaser.Scene {
  constructor() { super('Premi'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('festa');
    raggi(this, 0xb06aff, 0xd09aff);
    const premi = premiBuffi(Sessione);
    const t = txt(this, 240, 22, 'I PREMI DELLA SERATA', { size: 18, color: '#ffe14a' }).setScale(0);
    this.tweens.add({ targets: t, scale: 1, duration: 450, ease: 'Back.out' });
    premi.forEach((p, k) => this.time.delayedCall(500 + k * 750, () => {
      const y = 135 + (k - (premi.length - 1) / 2) * 58, riga = this.add.container(0, 0);
      riga.add([
        pannello(this, 240, y, 400, 50, { alfa: 0.72, raggio: 10 }),
        ritratto(this, 76, y, p.g.id, 40, 'felice'),
        txt(this, 112, y - 12, p.titolo, { size: 12, color: '#ffe14a', ox: 0 }),
        txt(this, 112, y + 4, p.g.nome.toUpperCase(), { size: 9, color: p.g.colore, ox: 0 }),
        txt(this, 112, y + 16, p.frase, { size: 6.5, color: '#fff3d6', ox: 0, wrap: 320 }),
      ]);
      riga.setAlpha(0).setX(-40);
      this.tweens.add({ targets: riga, alpha: 1, x: 0, duration: 260, ease: 'Back.out' });
      Audio.sfx('sbam');
      stelle(this, 76, y, 5);
    }));
    this.time.delayedCall(500 + premi.length * 750, () => lampeggia(this, txt(this, 240, 253, perDito('INVIO: classifica finale', 'Tocca: classifica finale'), { size: 9, color: '#ffe14a' })));
    attendiInvio(this, () => { Audio.sfx('scegli'); this.scene.start('Finale'); });
    pulsantiAngolo(this);
  }
}

export class FinaleScene extends Phaser.Scene {
  constructor() { super('Finale'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('festa');
    raggi(this, 0xe09a28, 0xf2c14a);
    Audio.sfx('vittoria');
    // l'albo d'oro, le statistiche, le Pinte della serata e i trofei (una volta sola per sfida)
    const P = Progressi.dopoSfida(Sessione);
    if (P.pinte) this.time.delayedCall(1800, () => scritta(this, 240, 132, `+${P.pinte} PINTE`, { size: 14, color: '#ffe14a', durata: 1200, depth: 4000 }));
    annunciaTrofei(this, P.trofei, 2600);
    if (Sessione.tipo === 'squadre') { finaleSquadre(this); this.pulsanti((i) => [[86, 186, 294, 394][i], 258], { larghezza: 88 }); }
    else if (Sessione.n >= 3) this.podio(); else this.aDue();
    pulsantiAngolo(this);
  }

  // i pulsanti di fine partita: stessi giocatori e stessa modalità, altri personaggi, menu, e la
  // foto del podio da mandare nel gruppo
  pulsanti(pos, o = {}) {
    const S = Sessione;
    this.menuFine = menuLista(this, [
      { label: 'RIVINCITA', azione: () => { S.rivincita(); this.scene.start('Intro'); } },
      { label: 'CAMBIA PERSONAGGI', azione: () => this.scene.start('Personaggi', { n: S.n }) },
      { label: 'SALVA IL PODIO', azione: () => this.salvaPodio() },
      { label: 'MENU', azione: () => this.scene.start('Menu') },
    ], 0, 0, o.passo ?? 18, o.size ?? 7.5, { pos, larghezza: o.larghezza ?? 110, orizzontale: true });
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
  }

  // La foto della classifica (senza i pulsanti), con il nome del gioco e la data: sul telefono si
  // condivide (WhatsApp...) con la condivisione del sistema, sul computer si scarica.
  salvaPodio() {
    if (this.inFoto) return;
    this.inFoto = true;
    const via = [...(this.menuFine ?? []), this.menuFine?.evid, this.pannelloPulsanti].filter(Boolean);
    via.forEach((o) => o.setVisible(false));
    this.game.renderer.snapshot((img) => {
      via.forEach((o) => o.setVisible(true));
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const k = c.getContext('2d'), h = Math.round(c.height * 0.045);
      k.drawImage(img, 0, 0);
      k.font = `bold ${h}px sans-serif`; k.textAlign = 'right'; k.lineWidth = h * 0.22; k.strokeStyle = '#1f1430'; k.fillStyle = '#ffe14a';
      const firma = `PowerStation Party  ·  ${new Date().toLocaleDateString('it-IT')}`;
      k.strokeText(firma, c.width - h * 0.6, c.height - h * 0.6); k.fillText(firma, c.width - h * 0.6, c.height - h * 0.6);
      c.toBlob(async (blob) => {
        this.inFoto = false;
        if (!blob) return;
        const nome = `podio-powerstation-${new Date().toISOString().slice(0, 10)}.png`, file = new File([blob], nome, { type: 'image/png' });
        try {
          if (eTouch() && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'PowerStation Party', text: 'Com\'è finita stasera:' });
            return;
          }
        } catch (e) { if (e?.name === 'AbortError') return; }   // (condivisione annullata: va bene così)
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = nome;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        if (this.scene.isActive()) scritta(this, 240, 136, 'PODIO SALVATO!', { size: 14, color: '#7dff9a', durata: 900, depth: 4000 });
      }, 'image/png');
    });
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
      : `PUNTI SFIDA: ${cl.punti[0]} - ${cl.punti[1]}      round vinti: ${cl.round[0]} - ${cl.round[1]}`;
    txt(this, 240, yRiep, riep, { size: 7.5, color: '#7dff9a' });
    txt(this, 240, yRiep + (fitto ? 9 : 11), `${G[0].nome}  -  ${G[1].nome}` + (S.meglioDi ? '' : '   (ogni microgioco vale da 0 a 100 punti sfida)'), { size: 6.5, color: '#fff3d6' });

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

    this.pulsanti((i) => [[86, 186, 294, 394][i], 258], { larghezza: 88 });
  }

  // --- da tre in su: il podio, gli altri in fila sotto, l'ultimo disperato ---
  podio() {
    const S = Sessione, G = S.giocatori, n = S.n, cl = S.classifica(), o = cl.ordine;
    const cosa = S.tipo === 'torneo' ? 'vittorie' : S.meglioDi ? 'round' : 'punti', pari = cl.vincitore < 0;
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
    this.pannelloPulsanti = pannello(this, 414, 106, 118, 98, { alfa: 0.55, bordo: null, raggio: 9 });
    this.pulsanti((i) => [414, 73 + i * 22], { passo: 20, size: 7 });
  }
}
