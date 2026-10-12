// Le schermate della modalità BEER PONG (gruppo PARTY; numeri in js/config/modalita.js, blocco beerpong):
//  - BeerPongSquadre: le squadre (ROSSI e BLU, e l'arbitro se si è dispari) prima di cominciare
//  - BeerPong: la partita vera, a tiri alternati. Il tavolo, il tiro, la sbronza, le gag e le
//    reazioni sono gli stessi del microgioco "Beer Pong al Pallaio" (js/beerpong/tavolo.js); le
//    regole (turni, tempo, oltranza) sono in js/beerpong/partita.js
//  - BeerPongFine: il giro del tavolo dei vincitori, i perdenti che dormono sul tavolo o cantano
//    stonati, la frase di sfottò, Rivincita / Cambia personaggi / Menu
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { Progressi } from '../progressi.js';
import { livellato } from '../livelli.js';
import { SP, ritratto, preparaBevitore, FACCE_SBRONZA } from '../sprites.js';
import { TAVOLO_IMG, RETE_IMG } from '../grafica/pallaio.js';
import { txt, im, scalaDi, inquadra, raggi, pannello, stelle, scritta, fumetto, caso, eTouch, perDito, pulsante, menuLista, annunciaTrofei } from '../fx.js';
import { pulsantiAngolo } from './menu.js';
import { Tavolo } from '../beerpong/tavolo.js';
import { Partita, formato } from '../beerpong/partita.js';

const colore = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;
const Z = -100;   // la profondità di partenza della scena di fine partita (vedi BeerPongFineScene)
const lampeggia = (scene, t) => scene.tweens.add({ targets: t, alpha: 0.25, duration: 400, yoyo: true, repeat: -1 });
// "a Riccardo", ma "al Manna", "all'Ingiocabile": i nomi con l'articolo
const aChi = (nome) => (/^il /i.test(nome) ? 'al ' + nome.slice(3) : /^lo /i.test(nome) ? 'allo ' + nome.slice(3) : /^la /i.test(nome) ? 'alla ' + nome.slice(3) : /^l'/i.test(nome) ? "all'" + nome.slice(2) : 'a ' + nome);
const elenco = (G) => (G.length === 1 ? G[0].nome : G.slice(0, -1).map((g) => g.nome).join(', ') + ' e ' + G[G.length - 1].nome);
// il nome di una squadra: nell'uno contro uno è il nome del giocatore
const nomeSquadra = (sq) => (sq.membri.length === 1 ? sq.membri[0].nome.toUpperCase() : CONFIG.modalita.squadre.nomi[sq.q]);

// ------------------------------------------------------------
//  1. LE SQUADRE
// ------------------------------------------------------------
export class BeerPongSquadreScene extends Phaser.Scene {
  constructor() { super('BeerPongSquadre'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('menu');
    raggi(this, 0x2f8f6a, 0x4fb58a);
    const S = Sessione, R = CONFIG.modalita.beerpong, Q = CONFIG.modalita.squadre, f = formato(S.n, R);
    const inGioco = f.arbitro ? S.giocatori.slice(0, -1) : S.giocatori, arbitro = f.arbitro ? S.giocatori[S.n - 1] : null;
    txt(this, 240, 17, 'BEER PONG AL PALLAIO', { size: 16, color: '#ffe14a' });
    txt(this, 240, 34, `${f.per} contro ${f.per}` + (arbitro ? `, arbitra ${arbitro.nome}` : ''), { size: 8 });
    [0, 1].forEach((q) => {
      const x = q ? 364 : 116, membri = inGioco.filter((_g, i) => i % 2 === q), passo = Math.min(60, 176 / membri.length);
      pannello(this, x, 122, 204, 150, { alfa: 0.55, raggio: 12, bordo: colore(Q.colori[q]) });
      txt(this, x, 58, membri.length === 1 ? membri[0].nome.toUpperCase() : Q.nomi[q], { size: 12, color: Q.colori[q] });
      membri.forEach((g, k) => {
        const gx = x + (k - (membri.length - 1) / 2) * passo;
        const s = im(this, gx, 178, `${g.id}_normale`).setOrigin(0.5, 1).setScale(2.1 * SP);
        this.tweens.add({ targets: s, y: 174, duration: 380 + k * 40, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: q * 150 });
        if (membri.length > 1) txt(this, gx, 186, g.nome, { size: g.nome.length > 10 ? 5 : 6, color: g.colore });
      });
    });
    txt(this, 240, 96, 'VS', { size: 17, color: '#ffffff' });
    if (arbitro) {
      ritratto(this, 240, 136, arbitro.id, 30);
      txt(this, 240, 158, 'ARBITRO', { size: 6.5, color: '#ffe14a' });
      txt(this, 240, 168, arbitro.nome, { size: arbitro.nome.length > 10 ? 5 : 6, color: arbitro.colore });
    }
    txt(this, 240, 209, `${f.bicchieri} bicchieri ${f.per === 1 ? 'a testa' : 'a squadra'}. Un tiro per uno: chi centra fa bere gli altri!`, { size: 7.5 });
    txt(this, 240, 221, `Vince chi li toglie tutti. Tempo massimo: ${Math.round(R.tempoMassimo / 60)} minuti di gioco.`, { size: 7, color: '#fff3d6' });
    txt(this, 240, 234, perDito('MOUSE: premi, tira indietro e lascia (o FRECCE + SPAZIO tenuto). Di RIMBALZO vale doppio: due bicchieri!', 'Una fiondata col dito verso i bicchieri. Di RIMBALZO vale doppio: due bicchieri!'), { size: 6, color: '#fff3d6' });
    lampeggia(this, txt(this, 240, 255, perDito('INVIO: si comincia!', 'Tocca: si comincia!'), { size: 9, color: '#ffe14a' }));
    const indietro = () => this.scene.start('Modalita', { gruppo: 'party' });
    this.input.keyboard.on('keydown-ESC', indietro);
    if (eTouch()) pulsante(this, 16, 13, 'indietro', indietro);
    pulsantiAngolo(this);
    let fatto = false;
    const vai = (e) => { if (fatto || e?.repeat) return; fatto = true; Audio.sfx('scegli'); this.scene.start('BeerPong'); };
    this.time.delayedCall(450, () => {
      for (const k of ['ENTER', 'SPACE']) this.input.keyboard.on('keydown-' + k, vai);
      this.input.on('pointerdown', () => vai());
    });
  }
}

// ------------------------------------------------------------
//  2. LA PARTITA
// ------------------------------------------------------------
export class BeerPongScene extends Phaser.Scene {
  constructor() { super('BeerPong'); }

  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    const S = Sessione, R = CONFIG.modalita.beerpong;
    this.R = R;
    this.Q = CONFIG.modalita.squadre;
    Audio.musica(R.musica ?? 'festa');
    Audio.tempo(1);
    this.P = new Partita(S.giocatori, R, CONFIG.beerpong.sbronza.soglie);
    for (const g of S.giocatori) preparaBevitore(this, g.id);
    this.file = {};            // i centri di fila di ogni giocatore (per "IN FIAMME!")
    this.attesa = null;        // cosa fare al prossimo tocco (il passaggio di mano)
    this.detto = {};           // gli annunci già fatti (tempo scaduto, oltranza)
    this.inCorso = true;       // (main.js: in verticale o in sottofondo la partita va in pausa)
    this.T = new Tavolo(this, {
      cfg: CONFIG.beerpong, peso: R.sbronzaPeso, musica: R.musica ?? 'festa', nome: true,
      arbitro: this.P.arbitro?.id, escludi: S.giocatori.map((g) => g.id),
      suEsito: (e) => this.esito(e),
    });
    this.creaHud();

    this.input.keyboard.on('keydown-ESC', () => this.pausa());
    const rientro = () => this.T.alRientro();
    this.events.on('resume', rientro);
    this.events.once('shutdown', () => { this.events.off('resume', rientro); this.T.ferma(); Audio.tempo(1); });
    // il tocco (o SPAZIO / INVIO) che chiude il "TOCCA A...!"
    const tocco = (e) => { if (e?.repeat || !this.attesa || this.time.now < this.attesaDa) return; const f = this.attesa; this.attesa = null; f(); };
    for (const k of ['SPACE', 'ENTER']) this.input.keyboard.on('keydown-' + k, tocco);
    this.input.on('pointerdown', () => tocco());

    this.commenta('inizio', 500, 1);
    this.cambio();
  }

  creaHud() {
    const Q = this.Q, xd = eTouch() ? 420 : 474;
    this.barra = this.add.graphics().setDepth(1001);
    this.testoTempo = txt(this, 240, 47, '', { size: 8, depth: 1001 });
    this.tSq = [txt(this, 6, 22, '', { ox: 0, size: 10, color: Q.colori[0], depth: 1001 }), txt(this, xd, 22, '', { ox: 1, size: 10, color: Q.colori[1], depth: 1001 })];
    this.tLiv = [txt(this, 6, 35, '', { ox: 0, size: 6.5, depth: 1001 }), txt(this, xd, 35, '', { ox: 1, size: 6.5, depth: 1001 })];
    // sul telefono non ci sono ESC e M: pulsanti a schermo, in alto a destra
    if (eTouch()) this.pulsanti = [pulsante(this, 464, 24, 'pausa', () => this.pausa()), pulsante(this, 442, 24, 'audio', () => Audio.silenzia())];
    this.hud = null;
  }

  aggiornaHud() {
    const P = this.P, S = CONFIG.beerpong.sbronza;
    const stato = P.squadre.map((sq) => `${P.inPiedi(sq.q)}:${P.sbronza(sq.q)}`).join('|') + P.diTurno + this.fase;
    if (stato === this.hud) return;
    this.hud = stato;
    P.squadre.forEach((sq, q) => {
      const tocca = P.diTurno === q && this.fase !== 'fine', liv = P.sbronza(q), n = P.inPiedi(q);
      this.tSq[q].setText(q ? `${n}  ${nomeSquadra(sq)}${tocca ? ' ◄' : ''}` : `${tocca ? '► ' : ''}${nomeSquadra(sq)}  ${n}`);
      this.tLiv[q].setText((sq.membri.length === 1 ? S.nomi : S.nomiTanti)[liv]).setColor(S.colori[liv]);
    });
  }

  disegnaBarra() {
    const P = this.P, r = P.tempoRimasto, g = this.barra, w = 468 * (r / this.R.tempoMassimo), sec = Math.ceil(r);
    g.clear();
    g.fillStyle(0x1f1430, 0.9); g.fillRoundedRect(4, 3, 472, 9, 4.5);
    g.fillStyle(r < 30 ? 0xf87171 : r < 60 ? 0xfacc15 : 0x4ade80);
    if (w > 1) g.fillRoundedRect(6, 5, w, 5, Math.min(2.5, w / 2));
    const testo = P.oltranza ? 'A OLTRANZA!' : P.scaduto ? 'ULTIMO GIRO!' : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
    if (testo !== this.ultimoTempo) { this.ultimoTempo = testo; this.testoTempo.setText(testo).setColor(P.scaduto ? '#ff9a8a' : '#ffffff'); }
  }

  // l'arbitro (se c'è) dice la sua da bordo tavolo
  commenta(tipo, ritardo = 300, quanto = 0.65) {
    const a = this.T.arbitro, frasi = this.R.arbitro[tipo];
    if (!a || !frasi?.length || Math.random() > quanto) return;
    this.time.delayedCall(ritardo, () => { if (!a.giu && this.inCorso) fumetto(this, a.img.x + 26, a.img.y - a.alto - 4, caso(frasi), 1300, 960); });
  }

  // ---------- il turno ----------
  // tocca a un altro: la visuale passa dietro di lui, e "TOCCA A...!" finché non prende i comandi
  cambio() {
    const P = this.P, T = this.T, Q = this.Q, g = P.tiratore, sq = P.squadra, av = P.avversaria, S = CONFIG.beerpong.sbronza;
    this.fase = 'cambio';
    T.imposta({
      cfg: livellato(CONFIG.beerpong, Sessione.livelloDi(g.id)), tiratore: g, avversari: av.membri.map((m) => m.id),
      lontani: av.bicchieri, vicini: sq.bicchieri, sbronza: P.sbronza(sq.q), sbronzaAvv: P.sbronza(av.q), fila: this.file[g.i] ?? 0,
    });
    T.attivo = false;
    this.aggiornaHud();
    const col = Q.colori[sq.q], liv = P.sbronza(sq.q);
    this.cartello?.destroy();
    const c = this.cartello = this.add.container(0, 0).setDepth(1500);
    c.add([
      this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0.4).setOrigin(0),
      pannello(this, 240, 112, 384, 84, { alfa: 0.93, raggio: 14, bordo: colore(col), spessore: 2.2 }),
      ritratto(this, 92, 112, g.id, 58, FACCE_SBRONZA[liv]),
      txt(this, 272, 92, `TOCCA ${aChi(g.nome).toUpperCase()}!`, { size: g.nome.length > 10 ? 15 : 19, color: g.colore }),
      txt(this, 272, 113, (sq.membri.length > 1 ? `${Q.nomi[sq.q]}  -  ` : '') + (P.oltranza ? 'A OLTRANZA: un tiro a testa!' : liv ? S.nomi[liv] : 'Un tiro solo: fallo bene.'), { size: 8, color: P.oltranza ? '#ff9a8a' : liv ? S.colori[liv] : col }),
    ]);
    const invito = txt(this, 272, 134, perDito(`Passa i comandi ${aChi(g.nome)}, poi SPAZIO (o un clic)`, `Passa il telefono ${aChi(g.nome)}, poi tocca`), { size: 7.5, color: '#fff3d6' });
    c.add(invito);
    lampeggia(this, invito);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 160 });
    Audio.sfx('bip');
    this.attesaDa = this.time.now + 380;
    this.attesa = () => {
      Audio.sfx('via');
      c.destroy();
      this.cartello = null;
      this.fase = 'mira';
      this.aggiornaHud();
      // (un attimo dopo: il tocco che chiude il cartello non deve far partire un tiro)
      this.time.delayedCall(150, () => { if (this.fase === 'mira') T.attivo = true; });
    };
  }

  // com'è andato il tiro (lo dice il tavolo)
  esito(e) {
    if (e.chi !== 'io') return;
    const P = this.P, T = this.T, g = P.tiratore, av = P.avversaria, S = CONFIG.beerpong.sbronza;
    this.file[g.i] = T.fila;
    T.attivo = false;
    const preso = e.tipo === 'centro' || e.tipo === 'rimbalzo';
    if (preso) {
      // di rimbalzo vale doppio: se ne va anche il bicchiere più vicino
      if (e.tipo === 'rimbalzo') {
        const altro = av.bicchieri.filter((b) => b.su).sort((a, b) => Math.hypot(a.x - e.bicchiere.x, a.y - e.bicchiere.y) - Math.hypot(b.x - e.bicchiere.x, b.y - e.bicchiere.y))[0];
        if (altro && T.togliLontano(altro)) scritta(this, 240, 84, 'VALE DOPPIO!', { size: 13, color: '#7dff9a', durata: 800, depth: 951 });
      }
      // gli altri bevono: la sbronza vale per tutta la squadra
      const liv = P.sbronza(av.q);
      if (liv !== T.sbronzaAvv) {
        T.setSbronzaAvv(liv);
        scritta(this, 240, 62, `${nomeSquadra(av)}: ${(av.membri.length === 1 ? S.nomi : S.nomiTanti)[liv]}!`, { size: 11, color: S.colori[liv], durata: 1100, depth: 951 }).setAngle(0);
        this.commenta('sbronza', 1100, 0.5);
      }
    }
    this.commenta(preso ? e.tipo : e.bordo ? 'bordo' : 'fuori');
    this.fase = 'dopo';
    this.tDopo = preso ? 1.5 : 1;
    this.aggiornaHud();
  }

  pausa() {
    if (!this.inCorso) return;
    this.scene.launch('Pausa', { chiave: this.scene.key });
    this.scene.pause();
  }

  update(_ora, delta) {
    if (!this.inCorso) return;
    const dt = Math.min(delta, 50) / 1000, P = this.P, T = this.T;
    // il tempo di gioco: mentre ci si passa i comandi non scorre
    if (this.fase !== 'cambio') P.tempo += dt * T.lento;
    T.aggiorna(dt);
    if (P.scaduto && !this.detto.tempo) { this.detto.tempo = true; Audio.sfx('tempo'); scritta(this, 240, 96, 'TEMPO SCADUTO!', { size: 16, color: '#ff9a8a', durata: 1100, depth: 952 }); }
    if (this.fase === 'dopo') {
      this.tDopo -= dt;
      // (si aspetta che finiscano le gag e i festeggiamenti)
      if (this.tDopo <= 0 && !T.occupato) {
        if (P.dopoTiro()) this.fine(); else this.cambio();
      }
    }
    this.disegnaBarra();
  }

  fine() {
    const P = this.P, v = P.vincitrice, sq = P.squadre[v];
    this.inCorso = false;
    this.fase = 'fine';
    this.attesa = null;
    this.T.ferma();
    this.aggiornaHud();
    Audio.sfx('vittoria');
    scritta(this, 240, 104, sq.membri.length === 1 ? `VINCE ${sq.membri[0].nome.toUpperCase()}!` : `VINCONO I ${this.Q.nomi[v]}!`, { size: 22, color: this.Q.colori[v], durata: 1500, depth: 1600 });
    for (let i = 0; i < 5; i++) this.time.delayedCall(i * 140, () => stelle(this, 100 + Math.random() * 280, 70 + Math.random() * 90, 7));
    this.time.delayedCall(1900, () => this.scene.start('BeerPongFine', { partita: P }));
  }
}

// ------------------------------------------------------------
//  3. FINE PARTITA
// ------------------------------------------------------------
export class BeerPongFineScene extends Phaser.Scene {
  constructor() { super('BeerPongFine'); }

  create(dati) {
    inquadra(this);
    this.input.setDefaultCursor('default');
    Audio.musica('festa');
    const S = Sessione, R = CONFIG.modalita.beerpong, Q = CONFIG.modalita.squadre, P = dati.partita;
    const v = P.vincitrice, vinc = P.squadre[v], perd = P.squadre[1 - v], sbronzi = P.sbronza(perd.q) >= 3;
    for (const g of [...P.giocatori(), ...(P.arbitro ? [P.arbitro] : [])]) preparaBevitore(this, g.id);
    // Pinte, albo d'oro, partite e vittorie dei personaggi, trofei (una volta sola per partita)
    const E = S.registrata ? { pinte: 0, trofei: [] } : Progressi.dopoBeerPong({ giocatori: P.giocatori(), vincitori: vinc.membri, arbitro: P.arbitro, squadra: Q.nomi[v] });
    S.registrata = true;
    if (E.pinte) this.time.delayedCall(1800, () => scritta(this, 240, 76, `+${E.pinte} PINTE`, { size: 14, color: '#ffe14a', durata: 1200, depth: 4000 }));
    annunciaTrofei(this, E.trofei, 2600);

    // il Pallaio e il tavolo (tutta la scena sta "sotto zero": Z + ..., così i pulsanti in fondo,
    // con la loro evidenziazione, restano sopra)
    im(this, 0, 0, 'bgPallaio').setOrigin(0).setDepth(Z);
    im(this, TAVOLO_IMG.x, TAVOLO_IMG.y, 'tavoloPong').setOrigin(0).setDepth(Z + 10);
    im(this, RETE_IMG.x, RETE_IMG.y, 'retePong').setOrigin(0).setDepth(Z + 20);
    const titolo = vinc.membri.length === 1 ? `VINCE ${vinc.membri[0].nome.toUpperCase()}!` : `VINCONO I ${Q.nomi[v]}!`;
    txt(this, 240, 17, titolo, { size: 18, color: Q.colori[v], depth: 1000 });
    txt(this, 240, 34, `Bicchieri in piedi: ${nomeSquadra(vinc)} ${P.inPiedi(v)}  -  ${P.inPiedi(1 - v)} ${nomeSquadra(perd)}` + (P.oltranza ? '   (a oltranza)' : P.scaduto ? '   (a tempo scaduto)' : ''), { size: 7, depth: 1000 });

    this.perdenti(perd, P.arbitro, sbronzi);
    // i vincitori fanno il giro del tavolo, col bicchiere alzato
    this.giro = vinc.membri.map((g, i) => ({
      g, fase: (i * Math.PI * 2) / vinc.membri.length,
      img: im(this, 0, 0, `${g.id}_felice`).setOrigin(0.5, 1),
      bic: im(this, 0, 0, 'bicchierePong', 0.5),
    }));
    this.t = 0;
    this.muoviGiro(0);
    this.coriandoli();
    this.time.addEvent({ delay: 520, loop: true, callback: () => stelle(this, 60 + Math.random() * 360, 60 + Math.random() * 80, 4) });

    // la frase di sfottò per chi ha perso
    const frase = caso(perd.membri.length === 1 ? R.frasiPerdente : R.frasiPerdenti).replaceAll('{perdenti}', elenco(perd.membri)).replaceAll('{vincitori}', elenco(vinc.membri));
    pannello(this, 240, 232, 380, 22, { alfa: 0.7, bordo: null, raggio: 9, depth: 999 });
    const f = txt(this, 240, 232, `"${frase}"`, { size: 7.5, wrap: 368, depth: 1000 });
    f.setScale(0);
    this.tweens.add({ targets: f, scale: 1, delay: 900, duration: 400, ease: 'Back.out' });

    pannello(this, 240, 258, 300, 17, { alfa: 0.6, bordo: null, raggio: 8 });
    menuLista(this, [
      { label: 'RIVINCITA', azione: () => { S.rivincita(); this.scene.start('BeerPong'); } },
      { label: 'CAMBIA PERSONAGGI', azione: () => this.scene.start('Personaggi', { n: S.n }) },
      { label: 'MENU', azione: () => this.scene.start('Menu') },
    ], 0, 0, 18, 7.5, { pos: (i) => [[152, 240, 328][i], 258], larghezza: 84, orizzontale: true });
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
    pulsantiAngolo(this);
  }

  // I perdenti, in fondo al tavolo. Allo stadio peggiore della sbronza dormono con la faccia sul
  // tavolo e qualcuno li copre con una giacca; se no cantano stonati abbracciati all'arbitro (o tra loro).
  perdenti(perd, arbitro, sbronzi) {
    const R = CONFIG.modalita.beerpong, n = perd.membri.length;
    if (sbronzi) {
      const passo = n === 1 ? 0 : n === 2 ? 84 : 66;
      perd.membri.forEach((g, i) => {
        const x = 240 + (i - (n - 1) / 2) * passo, y = 142;
        // la testa appoggiata di lato sul tavolo
        const testa = this.add.container(x - 14, y, [ritratto(this, 0, 0, g.id, 40, 'dorme')]).setDepth(Z + 12).setAngle(78);
        this.tweens.add({ targets: testa, scale: 1.04, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        // la giacca arriva dopo un attimo, buttata sulle spalle
        const giacca = im(this, x + 14, -40, 'giaccaPong', 1.15).setDepth(Z + 11).setAngle(-8);
        this.tweens.add({ targets: giacca, y: y - 12, angle: 4, delay: 1100 + i * 250, duration: 420, ease: 'Bounce.out', onStart: () => Audio.sfx('pof') });
        this.time.addEvent({ delay: 1300, loop: true, startAt: i * 400, callback: () => {
          const z = txt(this, x - 20, y - 22, 'Z', { size: 9, color: '#dfe6ff', depth: Z + 13 });
          this.tweens.add({ targets: z, x: z.x + 16, y: z.y - 34, alpha: 0, scale: 1.7, duration: 1500, onComplete: () => z.destroy() });
        } });
      });
      // chi li ha coperti: l'arbitro, se c'è, che scuote la testa
      if (arbitro) {
        const a = im(this, 240 + ((n - 1) / 2) * passo + 78, 160, `${arbitro.id}_sufficienza`).setOrigin(0.5, 1).setScale(2.1 * SP).setDepth(Z + 6);
        this.tweens.add({ targets: a, angle: { from: -2, to: 2 }, duration: 700, yoyo: true, repeat: -1 });
      }
      txt(this, 240, 58, n === 1 ? `${perd.membri[0].nome} dorme sul tavolo...` : 'I perdenti dormono sul tavolo...', { size: 7, color: '#dfe6ff', depth: 1000 });
      return;
    }
    // cantano stonati, abbracciati (con l'arbitro in mezzo, se c'è)
    const coro = [...perd.membri.map((g) => ({ id: g.id, faccia: 'canta' }))];
    if (arbitro) coro.splice(Math.ceil(coro.length / 2), 0, { id: arbitro.id, faccia: 'canta' });
    const passo = Math.min(62, 190 / coro.length);
    coro.forEach((p, i) => {
      const x = 240 + (i - (coro.length - 1) / 2) * passo;
      const s = im(this, x, 160, `${p.id}_${p.faccia}`).setOrigin(0.5, 1).setScale(2.15 * SP).setDepth(Z + 6 + i * 0.01);
      // dondolano tutti insieme, a braccetto
      this.tweens.add({ targets: s, angle: { from: -7, to: 7 }, x: { from: x - 5, to: x + 5 }, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
    this.time.addEvent({ delay: 900, loop: true, callback: () => {
      const x = 240 + (Math.random() - 0.5) * 150;
      if (this.textures.exists('nota')) {
        const nota = im(this, x, 84, 'nota', 0.9).setDepth(Z + 14).setAngle((Math.random() - 0.5) * 40);
        this.tweens.add({ targets: nota, y: 44, x: x + (Math.random() - 0.5) * 30, alpha: 0, duration: 1300, onComplete: () => nota.destroy() });
      }
      if (Math.random() < 0.6) { Audio.sfx('stonato'); scritta(this, x, 66, caso(R.canzone), { size: 8, color: '#ffffff', durata: 500, depth: Z + 15 }); }
    } });
  }

  coriandoli() {
    const COL = [0xff5a6a, 0x5ab4ff, 0xffe14a, 0x7dff9a, 0xff9ac4, 0xb06aff];
    this.time.addEvent({ delay: 100, loop: true, callback: () => {
      const r = this.add.rectangle(Math.random() * 480, -6, 3.2, 5, caso(COL)).setAngle(Math.random() * 360).setDepth(Z + 60);
      this.tweens.add({ targets: r, y: 280, x: r.x + (Math.random() - 0.5) * 60, angle: r.angle + 500, duration: 2300 + Math.random() * 1200, onComplete: () => r.destroy() });
    } });
  }

  // il giro attorno al tavolo: dietro (piccoli, coperti dal tavolo) e davanti (grandi)
  muoviGiro(dt) {
    this.t += dt;
    for (const p of this.giro) {
      const a = this.t * 1.5 + p.fase, sn = Math.sin(a), davanti = sn > 0;
      const x = 240 + Math.cos(a) * 206, y = 204 + sn * 50, taglia = 1.75 + (sn + 1) * 0.42;
      const salto = Math.abs(Math.sin(this.t * 9 + p.fase)) * 5, alto = 48 * taglia;
      p.img.setPosition(x, y - salto).setScale(taglia * SP).setDepth(Z + (davanti ? 30 + sn : 4));
      // (il bicchiere sta nella mano alzata)
      p.bic.setPosition(x + taglia * 15, y - salto - alto * 0.7).setScale(scalaDi('bicchierePong', taglia * 0.2)).setDepth(Z + (davanti ? 31 + sn : 4.5)).setAngle(Math.sin(this.t * 9 + p.fase) * 10);
    }
  }

  update(_ora, delta) { this.muoviGiro(Math.min(delta, 50) / 1000); }
}
