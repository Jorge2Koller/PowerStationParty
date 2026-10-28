// Microgioco 12: "Il Passaggiorgio" - stasera guida Giorgio. Per forza. ACCHIAPPA!
//
//  Sabato sera, parcheggio sotto casa. Giorgio non prende mai la macchina: corre verso le
//  macchine degli amici (la Panda di Guerra, la Golf di Greg, il SUV di Sego), apre una
//  portiera e prova a salire. Clic/tocco su di lui prima che chiuda: vola in mezzo al
//  parcheggio. Mentre è a terra si trascinano le chiavi fino a lui: va alla sua A3
//  impolverata e si mette al volante (per poco: poi scende con una scusa).
//  Se chiude la portiera, la macchina parte con lui dentro che saluta: passaggio scroccato.
//  Giorgio diventa più FURBO col tempo e soprattutto coi tuoi successi (ogni volta che lo metti
//  al volante, e un po' ogni volta che lo tiri fuori): più veloce, finte, sagome di cartone nelle
//  altre portiere, travestimento col cappuccio (con un sosia incappucciato da non tirare fuori),
//  il bagagliaio. I tre atti: il parcheggio; ARRIVA EMILIO! (passa con Denny, che lo chiama:
//  Giorgio gli corre dietro e va fermato prima che salga); alla fine anche il bagagliaio.
//  Clic a vuoto: la mano resta ferma per un attimo.
//  Quando scende dall'A3 rilancia le chiavi: di solito nell'angolo, ogni tanto lontano (in mezzo al
//  parcheggio o sul tetto dell'A3), e si prendono da lì (chiaviLontane in config).
//  La scena si muove (scheda di valutazione: "da aggiungere animazioni, un po' monotono"): le
//  macchine molleggiano e dondolano, chi guida fa le facce e tiene il tempo con la testa, Giorgio
//  ha l'ombra e alza la polvere correndo, l'A3 trema e si spolvera, le lucine lampeggiano a onda e
//  nei palazzi si accendono e si spengono le finestre.
//  I punti non scendono mai sotto zero (un passaggio scroccato toglie solo quello che hai).
//  Le corse di Giorgio sono uguali per tutti i giocatori del round (seme del round).
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { MODELLI, COLORI_AUTO, porteAuto } from '../grafica/oggetti.js';
import { PARCHEGGIO } from '../grafica/sfondi.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, scuoti, puntatore, lerp, caso, eTouch, perDito, vibra, multiTouch, puntiHud, numero, quanti } from '../fx.js';
import { ritratto } from '../sprites.js';
import { VIALETTO } from '../grafica/vialetto.js';

const AMICI = [
  { id: 'guerra', modello: 'panda', x: 128 },
  { id: 'greg', modello: 'golf', x: 268 },
  { id: 'sego', modello: 'suv', x: 408 },
];
const A3 = { modello: 'a3', x: 72, y: PARCHEGGIO.davanti };   // la macchina di Giorgio, col muso a sinistra
const CHIAVI = { x: 448, y: 246 };   // l'angolo delle chiavi (dove stanno all'inizio e quasi sempre)
const TETTO_A3 = { x: A3.x + 12, y: A3.y - MODELLI.a3.tetto - 9 };   // ...e dove restano se le lancia sul tetto
// le lucine colorate appese nello sfondo (come in grafica/sfondi.js: inizio, fine, quanto pendono, seme dei colori)
const FILI = [[0, 70, 240, 60, 22, 3], [240, 60, 480, 76, 20, 4]];
const COLORI_LUCINE = [0xff5a6a, 0xffd84a, 0x5ad0ff, 0x7dff9a, 0xff9af0];
const PALAZZI = [[-10, 120, 54], [370, 120, 62], [130, 220, 24]];   // i palazzi dello sfondo: x, larghezza, tetto
const TAGLIA = 0.42;          // Giorgio e il sosia: 40x60 unità
const ALTO = 144 * TAGLIA;    // altezza a schermo di un personaggio
const TESTA = 0.3;            // teste nei finestrini
const TAGLIO_TESTA = 0.64;    // la testa occupa i primi 64% della texture del personaggio
const SOSIA = ['marco', 'beppe', 'bota'];
const COLORI = { ...COLORI_AUTO, a3: '#d8d4c8' };   // l'A3 è bianca, ma impolverata

export class GuidaScene extends MicrogiocoBase {
  constructor() { super('guida'); }

  pesca(a) { return a[Math.floor(this.rnd() * a.length)]; }

  mescola(a) {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
  }

  prepara() {
    this.rnd = casuale(Sessione.seme);
    this.nFase = -1;
    this.punti = 0;
    this.guidate = 0;
    this.fuori = 0;
    this.scrocchi = 0;
    this.bloccata = 0;
    this.sel = 1;
    this.hud = null;
    this.tScarico = 1;
    this.trascina = null;   // id del dito (o del mouse) che tiene le chiavi
    this.atto = 0;
    this.emilio = null;     // la macchina di Emilio che passa (vedi passaEmilio)
    this.presiEmilio = 0;
    this.saliti = 0;        // volte che è salito da Emilio
    this.tScuoti = 0;       // l'A3 al volante: sbuffi e polvere
    this.tLuccica = 0.5;    // il luccichio delle chiavi a terra

    im(this, 0, 0, 'bgParcheggio').setOrigin(0);
    this.lucine();
    this.auto = AMICI.map((a, i) => this.creaAuto({ ...a, i, y: PARCHEGGIO.fila, verso: 1 }));
    this.a3 = this.creaAuto({ ...A3, verso: -1 });
    im(this, 150, 268, 'cartello2019', 1).setOrigin(0.5, 1).setDepth(267);

    // le chiavi della A3, nell'angolo (posto = dove sono appoggiate adesso: ci tornano se le lasci
    // lontano da Giorgio; lontane = l'ultima volta le ha lanciate lontano)
    this.chiavi = im(this, CHIAVI.x, CHIAVI.y, 'chiavi', 1.1).setDepth(800);
    this.posto = { ...CHIAVI };
    this.lontane = false;
    this.voloChiavi = null;
    this.aiutoChiavi = txt(this, CHIAVI.x - 8, CHIAVI.y - 26, 'LE CHIAVI!', { size: 7, color: '#ffe14a', depth: 801 }).setVisible(false);
    this.tweens.add({ targets: this.aiutoChiavi, scale: 1.15, duration: 300, yoyo: true, repeat: -1 });

    // Giorgio (vestito da sera) e, quando serve, il sosia incappucciato. Sotto, la sua ombra
    // (in volo resta a terra e si stringe: si vede quanto è alto e dove cadrà)
    this.ombra = this.add.ellipse(240, 237, 26, 7, 0x05040c, 0.55).setDepth(237);
    this.G = { stato: 'pausa', t: 1, x: 240, y: 236, dir: 1, key: (e) => 'giorgioSera_' + e, img: im(this, 240, 236, 'giorgioSera_normale', TAGLIA).setOrigin(0.5, 1).setDepth(238) };
    this.sosia = null;

    // ORA!: da tastiera, quando si può fermare Giorgio che corre da Emilio
    this.oraEmilio = txt(this, 0, 0, 'ORA! (SPAZIO)', { size: 8, color: '#7dff9a', depth: 851 }).setVisible(false);
    // la freccia della tastiera sopra la macchina scelta (sul telefono non serve)
    this.freccia = txt(this, 0, 0, '▼', { size: 12, color: '#ffe14a', depth: 850 }).setVisible(!eTouch());
    this.tweens.add({ targets: this.freccia, y: '+=3', duration: 300, yoyo: true, repeat: -1 });

    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });
    this.testoGuidate = txt(this, 474, 49, '', { ox: 1, depth: 1001, size: 8 });
    this.testoFurbo = txt(this, 474, 61, '', { ox: 1, depth: 1001, size: 7, color: '#ff9af0' });

    multiTouch(this);   // un dito trascina le chiavi, un altro tira fuori Giorgio
    this.input.on('pointerdown', (p) => this.tocco(p));
    this.input.on('pointermove', (p) => { if (this.trascina === p.id) this.spostaChiavi(p); });
    this.input.on('pointerup', (p) => { if (this.trascina === p.id) this.lasciaChiavi(); });
    const k = this.input.keyboard;
    k.on('keydown-LEFT', () => this.scegli(-1));
    k.on('keydown-RIGHT', () => this.scegli(1));
    k.on('keydown-SPACE', () => this.tastoTira());
    k.on('keydown-ENTER', () => this.tastoChiavi());
  }

  alRientro() { if (this.trascina != null) { this.trascina = null; this.riportaChiavi(); } }

  // le lucine colorate dello sfondo, sopra ognuna un alone che si accende e si spegne: tutte
  // insieme fanno un'onda che corre lungo il filo, come le luci di Natale (lo sfondo le ha ferme).
  // Posizioni e colori sono quelli di grafica/sfondi.js (stessa curva, stesso seme)
  lucine() {
    let n = 0;
    for (const [x0, y0, x1, y1, abbasso, seme] of FILI) {
      const rr = casuale(seme), xc = (x0 + x1) / 2, yc = Math.max(y0, y1) + abbasso;
      for (let i = 1; i < 18; i++) {
        const t = i / 18, u = 1 - t;
        const x = u * u * x0 + 2 * t * u * xc + t * t * x1, y = u * u * y0 + 2 * t * u * yc + t * t * y1;
        const l = this.add.circle(x, y + 2, 3.6, COLORI_LUCINE[Math.floor(rr() * 5)], 1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.05).setDepth(2);
        this.tweens.add({ targets: l, alpha: 0.85, duration: 380, yoyo: true, repeat: -1, delay: (n++ % 7) * 110, ease: 'Sine.inOut' });
      }
    }
    // e nei palazzi qualcuno accende e spegne la luce (le finestre sono quelle dello sfondo)
    const finestre = [];
    for (const [x, w, top] of PALAZZI) {
      for (let y = top + 9; y < 128; y += 14) for (let xx = x + 7; xx < x + w - 10; xx += 16) {
        if (xx > 0 && xx < 470 && !(xx + 9 > 222 && xx < 258 && y + 8 > 104)) finestre.push([xx, y]);   // (non dietro al portone)
      }
    }
    this.time.addEvent({ delay: 700, loop: true, callback: () => {
      const [x, y] = caso(finestre), luce = this.add.rectangle(x + 4.5, y + 4, 9, 8, Math.random() < 0.3 ? 0xffd9a0 : 0xffe78a).setAlpha(0).setDepth(1);
      this.tweens.add({ targets: luce, alpha: 0.9, duration: 150, hold: 1500 + Math.random() * 2500, yoyo: true, onComplete: () => luce.destroy() });
    } });
  }

  // La furbizia di Giorgio: sale col tempo e coi tuoi successi. Le fasi valgono da quella.
  get furbizia() {
    const c = this.cfg;
    return this.trascorso * c.furbiziaSecondo + this.guidate * c.furbiziaGuida + this.fuori * c.furbiziaFuori + this.presiEmilio * c.furbiziaFuori;
  }
  get fase() {
    let f = this.cfg.fasi[0];
    for (const x of this.cfg.fasi) if (this.furbizia >= x.da) f = x;
    // i trucchi arrivano con gli atti: il cappuccio dal secondo, il bagagliaio dal terzo
    const A = this.cfg.atti[this.atto];
    return { ...f, travestimento: A.travestimento ? f.travestimento : 0, bagagliaio: A.bagagliaio ? f.bagagliaio : 0 };
  }

  // ------------------------------------------------------------
  //  MACCHINE: contenitore con chi guida, carrozzeria, portiera aperta e chi ci sta salendo
  // ------------------------------------------------------------
  creaAuto(a) {
    const M = MODELLI[a.modello], P = porteAuto(M);
    const cont = this.add.container(a.x, a.y).setDepth(a.y).setScale(a.verso, 1);
    const testa = this.add.image(0, 0, (a.id ?? 'giorgioSera') + '_normale').setVisible(!!a.id);
    const dietro = this.add.image(0, 0, 'giorgioSera_felice').setVisible(false);   // chi è seduto dietro
    const img = im(this, 0, 0, 'auto_' + a.modello).setOrigin(0.5, 72 / 76);
    const vano = this.add.graphics();
    const dentro = this.add.image(0, 0, 'giorgioSera_normale').setVisible(false);
    const anta = this.add.graphics();
    cont.add([testa, dietro, img, vano, dentro, anta]);
    // molla = quanto è schiacciata sulle sospensioni (unità: la muove sobbalza)
    const auto = { ...a, M, P, cont, testa, dietro, img, vano, dentro, anta, casa: true, ap: null, molla: 0 };
    if (a.id) {
      this.mettiTesta(auto, testa, a.id + '_normale', 'ant');
      // chi guida aspetta con la musica accesa: tiene il tempo con la testa (ognuno col suo)
      this.tweens.add({ targets: testa, y: '+=1', duration: 230 + a.i * 40, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: a.i * 90 });
    }
    return auto;
  }

  // la macchina che molleggia quando qualcuno sale o sbatte la portiera, e dondola (ang, gradi)
  // quando ne tiri fuori Giorgio
  sobbalza(auto, giu = 1.5, ang = 0) {
    this.tweens.killTweensOf(auto);
    this.tweens.add({ targets: auto, molla: giu, duration: 70, yoyo: true, repeat: 1, ease: 'Quad.out', onComplete: () => { auto.molla = 0; } });
    if (ang) this.tweens.add({ targets: auto.cont, angle: { from: ang * auto.verso, to: 0 }, duration: 550, ease: 'Elastic.out' });
  }

  // la faccia di chi guida (nel finestrino): reagisce per un attimo, poi torna normale (ms = 0: resta)
  faccia(auto, espr, ms = 800) {
    if (!auto?.id) return;
    this.mettiTesta(auto, auto.testa, `${auto.id}_${espr}`, 'ant');
    auto.tFaccia?.remove();
    auto.tFaccia = ms ? this.time.delayedCall(ms, () => this.mettiTesta(auto, auto.testa, `${auto.id}_normale`, 'ant')) : null;
  }

  // sbuffi di polvere dai piedi di chi corre (chi = Giorgio o il sosia)
  passi(chi, dt) {
    chi.tPasso = (chi.tPasso ?? 0) - dt;
    if (chi.tPasso > 0) return;
    chi.tPasso = 0.12;
    const d = chi.dir ?? 1, s = im(this, chi.x - d * 6, chi.y - 1, 'fumo', 0.22).setDepth(chi.y).setTint(0x9a96aa).setAlpha(0.55);
    this.tweens.add({ targets: s, x: s.x - d * 7, y: s.y - 4, scale: scalaDi('fumo', 0.5), alpha: 0, duration: 360, onComplete: () => s.destroy() });
  }

  // una testa nel finestrino ('ant' = davanti, chi guida; 'post' = dietro)
  mettiTesta(auto, img, key, porta) {
    const { M, P } = auto, [x0, x1] = P[porta];
    img.setTexture(key).setOrigin(0.5, 0).setScale(scalaDi(key, TESTA)).setVisible(true);
    img.setCrop(0, 0, img.frame.width, img.frame.height * TAGLIO_TESTA);
    img.setPosition((x0 + x1) / 2 + (porta === 'ant' ? 3 : 0), -(M.tetto - 3));
  }

  // porta: 'ant' | 'post' | 'bag'. Dove sta chi sale (x locale) e da dove si vede (soglia)
  geometria(auto, porta) {
    const { M, P } = auto, [x0, x1] = P[porta];
    if (porta === 'bag') return { x: (x0 + x1) / 2, soglia: -(M.cintura - 4), base: 30, corsa: 22 };
    return { x: (x0 + x1) / 2 - 2, soglia: -(M.sotto + 2), base: 22, corsa: 26 };
  }

  // portiera aperta (vano scuro col sedile e anta che sporge verso di noi) o portellone alzato
  disegnaPorta(auto, porta, aperta) {
    const { M, P, vano, anta } = auto, col = Phaser.Display.Color.HexStringToColor(COLORI[auto.modello]).color;
    vano.clear(); anta.clear();
    if (!aperta) return;
    const [x0, x1] = P[porta];
    if (porta === 'bag') {
      vano.fillStyle(0x15121c, 1); vano.fillRect(-M.m + 1, -(M.tetto - 2), x1 - (-M.m + 1), M.tetto - M.cintura + 4);
      // il portellone alzato
      const h = -(M.tetto - 1);
      anta.fillStyle(0x1f1430, 1); anta.fillPoints([{ x: x1 + 1, y: h - 1 }, { x: -M.m - 6, y: h - 15 }, { x: -M.m - 7, y: h - 9 }, { x: x1 + 1, y: h + 3 }], true);
      anta.fillStyle(col, 1); anta.fillPoints([{ x: x1, y: h }, { x: -M.m - 5, y: h - 13 }, { x: -M.m - 6, y: h - 9.5 }, { x: x1, y: h + 2 }], true);
      anta.fillStyle(0x3a4a6a, 1); anta.fillPoints([{ x: x1 - 6, y: h - 1 }, { x: -M.m, y: h - 11 }, { x: -M.m - 1, y: h - 9 }, { x: x1 - 6, y: h + 1 }], true);
      return;
    }
    const top = -(M.tetto - 4), bot = -(M.sotto + 2), w = x1 - x0;
    vano.fillStyle(0x15121c, 1); vano.fillRoundedRect(x0, top, w, bot - top, 2);
    vano.fillStyle(0x4a3a4c, 1); vano.fillRoundedRect(x0 + 3, -(M.cintura + 3), w - 6, 9, 2);    // sedile
    vano.fillRoundedRect(x0 + w * 0.15, top + 3, 7, 10, 2);                                         // poggiatesta
    // l'anta, aperta verso di noi: incernierata davanti, accorciata dalla prospettiva
    const L = w * 0.42, ant = [{ x: x1, y: top }, { x: x1 - L, y: top - 3 }, { x: x1 - L, y: bot + 5 }, { x: x1, y: bot }];
    anta.fillStyle(0x1f1430, 1); anta.fillPoints(ant.map((p) => ({ x: p.x + (p.x < x1 ? -0.8 : 0.8), y: p.y + (p.y < -20 ? -0.8 : 0.8) })), true);
    anta.fillStyle(col, 1); anta.fillPoints(ant, true);
    anta.fillStyle(0x3a4a6a, 0.9); anta.fillPoints([{ x: x1 - 1, y: top + 2 }, { x: x1 - L + 1, y: top }, { x: x1 - L + 1, y: -(M.cintura + 2) }, { x: x1 - 1, y: -(M.cintura + 3) }], true);
    anta.fillStyle(0x000000, 0.25); anta.fillRect(x1 - L, -(M.cintura - 3), L, 1.5);
  }

  // chi sta salendo: si vede dalla soglia in su e sprofonda pian piano dentro la macchina
  mettiDentro(auto, key, porta, quanto) {
    const g = this.geometria(auto, porta), d = auto.dentro;
    if (d.texture.key !== key) d.setTexture(key);
    d.setOrigin(0.5, 1).setScale(scalaDi(key, TAGLIA)).setVisible(true);
    const giu = g.base + quanto * g.corsa, vis = Math.max(2, ALTO - giu);
    d.setPosition(g.x, g.soglia + giu);
    d.setCrop(0, 0, d.frame.width, d.frame.height * (vis / ALTO));
    return { vis, g };
  }

  // ------------------------------------------------------------
  //  GIOCO
  // ------------------------------------------------------------
  aggiorna(dt) {
    const c = this.cfg;
    // gli atti (a tempo): l'annuncio, e quando passa Emilio
    const atto = c.atti.filter((a) => this.trascorso >= a.da).length - 1;
    if (atto !== this.atto) {
      this.atto = atto;
      const A = c.atti[atto];
      if (A.nome) { Audio.sfx('bonus'); scritta(this, 240, 110, A.nome, { size: 14, color: '#ffe14a', durata: 1000, depth: 950 }); }
      for (const t of A.emilio ?? []) this.time.delayedCall(t * 1000, () => { if (this.inCorso) this.passaEmilio(); });
    }
    const f = this.fase, n = c.fasi.findIndex((x) => x.da === f.da);
    if (n !== this.nFase) {
      // più furbo: lo dice, e lo segna in alto
      if (n > this.nFase && this.nFase >= 0) { Audio.sfx('tsk'); scritta(this, this.G.x, this.G.y - ALTO - 14, 'PIÙ FURBO!', { size: 8, color: '#ff9af0', durata: 600 }); }
      this.nFase = n;
      this.testoFurbo.setText('FURBIZIA ' + '★'.repeat(n + 1));
    }
    if (this.emilio) this.muoviEmilio(dt);
    this.bloccata -= dt;
    this.muoviGiorgio(dt, f);
    if (this.sosia) this.muoviSosia(dt);
    for (const a of this.auto) this.aggiornaAuto(a, dt);
    this.aggiornaAuto(this.a3, dt);

    // motori accesi: ogni tanto uno sbuffo dal tubo di scarico
    this.tScarico -= dt;
    if (this.tScarico <= 0) {
      this.tScarico = 0.5 + Math.random() * 0.6;
      const a = caso(this.auto.filter((x) => x.casa));
      if (a) fumo(this, a.cont.x - a.M.m - 2, a.cont.y - 6, 2, a.cont.depth + 1, 0xb8b8c8);
    }

    // l'A3 al volante: col motore che tossisce butta fumo dal tubo e perde la polvere dal tetto
    if (this.G.stato === 'volante') {
      this.tScuoti -= dt;
      if (this.tScuoti <= 0) {
        this.tScuoti = 0.16;
        const a3 = this.a3;
        fumo(this, a3.cont.x + a3.M.m + 2, a3.cont.y - 7, 1, 900, 0x6a6458);
        fumo(this, a3.cont.x - 30 + Math.random() * 60, a3.cont.y - a3.M.tetto + 2, 1, 900, 0xd8d0c0);
      }
    }
    this.ombraGiorgio();

    const sc = this.auto[this.sel];
    this.freccia.setPosition(sc.cont.x, sc.cont.y - sc.M.tetto - 12).setVisible(!eTouch() && sc.casa);
    // LE CHIAVI! sta sopra le chiavi, dovunque siano finite
    this.aiutoChiavi.setVisible(this.G.stato === 'aTerra' && this.trascina == null && !this.voloChiavi)
      .setPosition(Phaser.Math.Clamp(this.chiavi.x - 8, 28, 450), this.chiavi.y - 26);
    if (this.trascina == null && !this.voloChiavi && this.G.stato === 'aTerra') this.chiavi.angle = Math.sin(this.trascorso * 18) * 12;
    else if (this.trascina == null && !this.voloChiavi) this.chiavi.angle = 0;
    // e luccicano (di più quando servono), così si trovano anche lontano dall'angolo
    this.tLuccica -= dt;
    if (this.tLuccica <= 0 && this.chiavi.visible && this.trascina == null && !this.voloChiavi) {
      this.tLuccica = this.G.stato === 'aTerra' ? 0.3 : 1;
      const s = im(this, this.chiavi.x - 5 + Math.random() * 10, this.chiavi.y - 5 + Math.random() * 8, 'stella', 0.3).setDepth(801);
      this.tweens.add({ targets: s, scale: scalaDi('stella', 0.9), angle: 90, alpha: 0, duration: 380, onComplete: () => s.destroy() });
    }

    const hud = `${this.punti}|${this.guidate}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(this.punti));
      this.testoGuidate.setText(`AL VOLANTE: ${this.guidate}/${this.cfg.obiettivoGuidate}`).setColor(this.guidate >= this.cfg.obiettivoGuidate ? '#7dff9a' : '#ffe14a');
    }
  }

  // l'ombra sotto Giorgio quando è a terra (in volo la porta vola; in macchina non c'è)
  ombraGiorgio() {
    const G = this.G;
    if (G.stato === 'vola') return;
    const vis = G.img.visible && !['dentro', 'via', 'sale', 'volante'].includes(G.stato);
    this.ombra.setVisible(vis);
    if (vis) this.ombra.setPosition(G.x, G.y).setScale(G.stato === 'aTerra' ? 1.3 : 1).setDepth(G.img.depth - 1);
  }

  muoviGiorgio(dt, f) {
    const G = this.G, c = this.cfg;
    if (G.stato === 'corre' || G.stato === 'versoA3' || G.stato === 'emilio') this.passi(G, dt);
    if (G.stato === 'pausa') {
      G.t -= dt;
      G.img.y = G.y + Math.sin(this.trascorso * 6) * 0.6;
      if (G.t <= 0) this.nuovaCorsa(f);
    } else if (G.stato === 'corre' || G.stato === 'versoA3') {
      const dx = G.tx - G.x, dy = G.ty - G.y, d = Math.hypot(dx, dy), passo = Math.min(d, G.vel * dt);
      if (d > 0) { G.x += (dx / d) * passo; G.y += (dy / d) * passo; G.dir = dx < 0 ? -1 : 1; }
      G.img.setPosition(G.x, G.y - Math.abs(Math.sin(this.trascorso * 16)) * 2.5).setFlipX(G.dir < 0).setAngle(Math.sin(this.trascorso * 16) * 4).setDepth(G.y + 2);
      // finta: a metà strada cambia macchina
      if (G.finta != null && 1 - d / G.dist >= G.finta) {
        G.finta = null;
        const nuova = this.sceltaPorta(f, G.meta.auto);
        if (nuova) { this.punta(G, nuova); scritta(this, G.x, G.y - ALTO - 6, 'FINTA!', { size: 8, color: '#ff9af0', durata: 350 }); }
      }
      if (d - passo <= 0.5) {
        G.img.setAngle(0);
        if (G.stato === 'versoA3') this.saleA3();
        else this.entra(G.meta.auto, G.meta.porta, 'giorgio');
      }
    } else if (G.stato === 'aTerra') {
      G.t -= dt;
      G.tStelle -= dt;
      if (G.tStelle <= 0) { G.tStelle = 0.6; stelle(this, G.x, G.y - ALTO * 0.75, 3, G.y + 3); }
      G.img.setAngle(Math.sin(this.trascorso * 5) * 6);
      if (G.t <= 0) {
        // si rialza e riparte
        G.img.setAngle(0).setTexture(G.key('normale'));
        G.stato = 'pausa'; G.t = 0.25;
        scritta(this, G.x, G.y - ALTO - 4, 'SI RIALZA!', { size: 7, color: '#ff9a8a', durata: 350 });
      }
    } else if (G.stato === 'volante') {
      G.t -= dt;
      if (G.t <= 0) this.scendeA3();
    } else if (G.stato === 'emilio') {
      // corre dietro alla macchina di Emilio (che si muove): se arriva alla portiera, sale
      const E = this.emilio, tx = E.cont.x - 22, ty = E.y + 4, dx = tx - G.x, dy = ty - G.y, d = Math.hypot(dx, dy), passo = Math.min(d, G.vel * dt);
      if (d > 0) { G.x += (dx / d) * passo; G.y += (dy / d) * passo; G.dir = dx < 0 ? -1 : 1; }
      G.img.setPosition(G.x, G.y - Math.abs(Math.sin(this.trascorso * 18)) * 3).setFlipX(G.dir < 0).setAngle(Math.sin(this.trascorso * 18) * 5).setDepth(G.y + 2);
      G.corsa = Math.min(1, G.corsa + passo / G.dist);
      this.oraEmilio.setText('ORA! (SPAZIO)').setVisible(!eTouch() && G.corsa >= this.cfg.emilio.daQuando).setPosition(G.x, G.y - ALTO - 12);
      if (d - passo <= 3) this.iniziaSalita(f);
    } else if (G.stato === 'salendoEmilio') {
      // sale da Emilio, piano: finché non chiude la portiera si può ancora tirarlo fuori
      G.t -= dt;
      const q = 1 - Math.max(0, G.t) / G.finestra;
      G.img.setPosition(G.x + q * 6, G.y - q * 4 - Math.abs(Math.sin(this.trascorso * 22)) * 1.5).setAngle(Math.sin(this.trascorso * 22) * 6).setFlipX(false);
      this.oraEmilio.setPosition(G.x, G.y - ALTO - 12);
      if (G.t <= 0) this.saleEmilio();
    }
  }

  // Arrivato alla portiera di Emilio: la macchina si ferma ad aspettarlo e lui sale, ma ci mette
  // quanto ci mette con le altre portiere (la finestra della fase): fin lì si tira fuori come dalle
  // altre macchine, con un tocco su di lui (o SPAZIO). Prima saliva e partiva subito.
  iniziaSalita(f) {
    const G = this.G, E = this.emilio;
    G.stato = 'salendoEmilio';
    G.finestra = G.t = f.finestra;
    E.stato = 'aspetta';
    Audio.sfx('apri');
    this.oraEmilio.setText(eTouch() ? 'TIRALO FUORI!' : 'TIRALO FUORI! (SPAZIO)').setVisible(true);
  }

  // ------------------------------------------------------------
  //  EMILIO: passa in macchina con Denny, che chiama Giorgio
  // ------------------------------------------------------------
  passaEmilio() {
    if (this.emilio) return;
    const c = this.cfg, A = VIALETTO.auto, y = PARCHEGGIO.strada + 10;
    const cont = this.add.container(-90, y).setDepth(y);
    const img = im(this, 0, 0, 'wagon', 1.05).setOrigin(0.5, A.suolo / A.h).setFlipX(true);
    const emilio = ritratto(this, 18, -38, 'emilio', 17);
    const denny = ritratto(this, -22, -44, 'pastaffi', 18, 'felice');
    cont.add([emilio, denny, img]);
    this.emilio = { cont, y, img, stato: 'arriva', x: -90, t: 0, vel: c.emilio.vel };
    Audio.sfx('clacson');
    this.time.delayedCall(450, () => {
      if (!this.emilio) return;
      Audio.sfx('clacson');
      fumetto(this, Phaser.Math.Clamp(this.emilio.cont.x - 20, 90, 390), y - 70, c.fraseDenny, 2200, 870);
      const G = this.G;
      // Giorgio molla tutto e gli corre dietro (se non sta già guidando, salendo o in macchina)
      if (['pausa', 'corre', 'aTerra'].includes(G.stato)) {
        if (G.stato === 'aTerra') G.img.setAngle(0);
        G.stato = 'emilio';
        G.vel = c.emilio.velGiorgio;
        G.corsa = 0;
        G.dist = Math.max(60, Math.hypot(this.emilio.cont.x - G.x, y - G.y));
        G.img.setTexture(G.key('felice')).setVisible(true);
        scritta(this, G.x, G.y - ALTO - 6, 'ARRIVO!', { size: 8, color: '#ff9af0', durata: 500 });
      }
    });
  }

  // la macchina: entra, rallenta davanti al parcheggio (aspetta Giorgio), riparte
  muoviEmilio(dt) {
    const E = this.emilio, c = this.cfg.emilio;
    E.t += dt;
    const lenta = E.stato === 'arriva' && E.cont.x > c.ferma[0] && E.cont.x < c.ferma[1];
    E.cont.x += E.vel * (E.stato === 'aspetta' ? 0 : lenta ? c.rallenta : 1) * dt;
    E.cont.y = E.y + (Math.sin(this.trascorso * 40) > 0 ? 0.3 : 0);
    if (E.cont.x > 560) {
      E.cont.destroy();
      this.emilio = null;
      this.oraEmilio.setVisible(false);
      // se Giorgio gli correva ancora dietro, rinuncia
      if (this.G.stato === 'emilio') { this.G.stato = 'pausa'; this.G.t = 0.4; this.G.img.setAngle(0).setTexture(this.G.key('triste')); }
    }
  }

  // ce l'ha fatta: sale da Emilio, che riparte a tutta (passaggio scroccato)
  saleEmilio() {
    const c = this.cfg, G = this.G, E = this.emilio;
    this.oraEmilio.setVisible(false);
    this.punti = Math.max(0, this.punti - c.emilio.malus);
    this.saliti++;
    G.stato = 'via';
    G.img.setVisible(false).setAngle(0);
    E.stato = 'parte';
    E.vel = c.emilio.vel * 2.2;
    E.cont.add(ritratto(this, -4, -40, 'giorgioSera', 17, 'felice'));
    vibra(60);
    Audio.sfx('portiera');
    this.time.delayedCall(150, () => Audio.sfx('sgommata'));
    scritta(this, Phaser.Math.Clamp(E.cont.x, 100, 380), E.y - 80, `SALE DA EMILIO! -${c.emilio.malus}`, { size: 9, color: '#ff6b5a', durata: 900 });
    // torna dopo un po', a piedi, dal fondo del parcheggio
    this.time.delayedCall(c.rientro * 1000, () => {
      if (this.finito) return;
      G.x = 500; G.y = 236;
      G.img.setTexture(G.key('felice')).setPosition(G.x, G.y).setVisible(true).setFlipX(true);
      G.stato = 'pausa'; G.t = 0.3;
    });
  }

  // fermato mentre corre da Emilio, o tirato fuori mentre sale: vola via come dalle portiere (e
  // intanto ci sono le chiavi); Emilio e Denny ripartono senza di lui
  fermaEmilio() {
    const c = this.cfg, G = this.G;
    this.oraEmilio.setVisible(false);
    const giu = G.stato === 'salendoEmilio';
    if (this.emilio?.stato === 'aspetta') this.emilio.stato = 'parte';
    this.presiEmilio++;
    this.punti += c.emilio.punti;
    Audio.sfx('schiaffo');
    vibra(30);
    scuoti(this, 90, 0.004);
    scritta(this, G.x, G.y - ALTO - 10, `${giu ? 'TIRATO GIÙ!' : 'FERMATO!'} +${c.emilio.punti}`, { size: 10, color: '#7dff9a', durata: 600 });
    if (this.emilio) fumetto(this, Phaser.Math.Clamp(this.emilio.cont.x, 90, 390), this.emilio.y - 70, caso(c.emilio.frasiVia), 1000, 870);
    this.vola(G.x, G.y - ALTO * 0.5);
  }

  // Giorgio (o il sosia) punta una portiera di una macchina libera; fa = auto da evitare
  sceltaPorta(f, evita) {
    const libere = this.auto.filter((a) => a.casa && !a.ap && a !== evita && !(this.sosia?.meta?.auto === a));
    if (!libere.length) return null;
    const auto = this.pesca(libere);
    const porta = this.rnd() < f.bagagliaio ? 'bag' : this.pesca(['ant', 'post']);
    return { auto, porta };
  }

  punta(chi, meta) {
    const g = this.geometria(meta.auto, meta.porta);
    chi.meta = meta;
    chi.tx = meta.auto.cont.x + g.x * meta.auto.verso;
    chi.ty = meta.auto.cont.y + 6;
    chi.dist = Math.max(1, Math.hypot(chi.tx - chi.x, chi.ty - chi.y));
  }

  nuovaCorsa(f) {
    const G = this.G, meta = this.sceltaPorta(f);
    if (!meta) { G.t = 0.3; return; }
    G.travestito = this.rnd() < f.travestimento;
    G.key = (e) => (G.travestito ? (e === 'shock' ? 'incognito_giorgio_shock' : 'incognito_giorgio') : 'giorgioSera_' + e);
    G.img.setTexture(G.key('normale')).setVisible(true);
    G.vel = f.vel;
    G.stato = 'corre';
    this.punta(G, meta);
    G.finta = this.rnd() < f.finta ? 0.5 + this.rnd() * 0.25 : null;
    if (G.travestito) {
      this.scritta(G, 'IN INCOGNITO...', '#c8c8ff');
      this.nuovoSosia(f);
    }
  }

  scritta(G, s, col) { scritta(this, G.x, G.y - ALTO - 6, s, { size: 7, color: col, durata: 450 }); }

  // il sosia incappucciato: entra da un lato e va a salire in un'altra macchina
  nuovoSosia(f) {
    if (this.sosia) return;
    const meta = this.sceltaPorta(f, this.G.meta.auto);
    if (!meta) return;
    const id = this.pesca(SOSIA), da = this.rnd() < 0.5 ? -20 : 500;
    const S = { id, x: da, y: 230 + this.rnd() * 20, vel: f.vel * 0.95, stato: 'corre' };
    S.img = im(this, S.x, S.y, `incognito_${id}`, TAGLIA).setOrigin(0.5, 1);
    this.punta(S, meta);
    this.sosia = S;
  }

  muoviSosia(dt) {
    const S = this.sosia;
    if (S.stato !== 'corre') return;
    const dx = S.tx - S.x, dy = S.ty - S.y, d = Math.hypot(dx, dy), passo = Math.min(d, S.vel * dt);
    if (d > 0) { S.x += (dx / d) * passo; S.y += (dy / d) * passo; S.dir = dx < 0 ? -1 : 1; }
    S.img.setPosition(S.x, S.y - Math.abs(Math.sin(this.trascorso * 15 + 1)) * 2.5).setFlipX(dx < 0).setDepth(S.y + 2);
    this.passi(S, dt);
    if (d - passo <= 0.5) {
      if (!S.meta.auto.casa || S.meta.auto.ap) { S.img.destroy(); this.sosia = null; return; }
      S.img.setVisible(false);
      S.stato = 'dentro';
      this.entra(S.meta.auto, S.meta.porta, 'sosia');
    }
  }

  // qualcuno apre una portiera e prova a salire. chi: 'giorgio' | 'sosia' | 'cartone'
  entra(auto, porta, chi) {
    const f = this.fase, G = this.G;
    if (!auto.casa || auto.ap) {
      // nel frattempo la macchina è partita o è occupata: Giorgio ne cerca un'altra
      if (chi === 'giorgio') { G.stato = 'pausa'; G.t = 0.1; }
      if (chi === 'sosia') { this.sosia.img.destroy(); this.sosia = null; }
      return;
    }
    const key = chi === 'giorgio' ? G.key('normale') : chi === 'sosia' ? `incognito_${this.sosia.id}` : (G.travestito ? 'incognito_giorgio' : 'giorgioSera_felice');
    auto.ap = { porta, chi, key, t: 0, durata: f.finestra + (chi === 'cartone' ? 0.3 : 0) };
    this.disegnaPorta(auto, porta, true);
    this.mettiDentro(auto, key, porta, 0);
    auto.dentro.setTint(chi === 'cartone' ? 0xc89a62 : 0xffffff);
    Audio.sfx('apri');
    // la macchina si abbassa sotto il peso e chi guida si gira spaventato (con chiunque salga, anche
    // col sosia e col cartone: la faccia non tradisce chi è il vero Giorgio)
    this.sobbalza(auto, 1.2);
    this.faccia(auto, 'shock', auto.ap.durata * 1000);
    if (chi === 'giorgio') {
      G.stato = 'dentro';
      G.img.setVisible(false);
      fumetto(this, auto.cont.x, auto.cont.y - auto.M.tetto - 12, caso(this.cfg.scuse), Math.max(900, f.finestra * 1000), 860);
      // più portiere insieme: nelle altre macchine spunta un Giorgio di cartone
      const altre = this.auto.filter((a) => a !== auto && a.casa && !a.ap);
      this.mescola(altre).slice(0, f.insieme - 1).forEach((a) => {
        fumo(this, a.cont.x, a.cont.y - 20, 3, a.cont.depth + 2);
        this.entra(a, this.pesca(['ant', 'post']), 'cartone');
      });
    }
  }

  aggiornaAuto(auto, dt) {
    const ap = auto.ap;
    // motore acceso (quelle degli amici sempre; l'A3 solo con Giorgio al volante, e trema di più:
    // è ferma da anni), più la molla delle sospensioni
    if (auto.casa) {
      const motore = auto.id ? (Math.sin(this.trascorso * 40 + auto.i) > 0 ? 0.25 : 0)
        : this.G.stato === 'volante' ? (Math.sin(this.trascorso * 47) > 0 ? 0.9 : -0.3) : 0;
      auto.cont.y = auto.y + motore + auto.molla;
    }
    if (!ap || ap.chi === 'a3') return;
    ap.t += dt;
    const quanto = Math.min(1, ap.t / ap.durata);
    if (ap.chi !== 'cartone') this.mettiDentro(auto, ap.key, ap.porta, quanto);
    if (ap.t >= ap.durata) this.chiudi(auto);
  }

  // la portiera si chiude: se dentro c'è ancora Giorgio, la macchina parte con lui
  chiudi(auto, silenzio) {
    const ap = auto.ap;
    auto.ap = null;
    this.disegnaPorta(auto, null, false);
    auto.dentro.setVisible(false).clearTint();
    if (!silenzio) { Audio.sfx('portiera'); this.sobbalza(auto, 2); }
    if (ap.chi === 'sosia' && this.sosia) { this.sosia.img.destroy(); this.sosia = null; }
    if (ap.chi === 'giorgio') this.scrocca(auto);
  }

  scrocca(auto) {
    const c = this.cfg, G = this.G;
    this.punti = Math.max(0, this.punti - c.malusPassaggio);
    this.scrocchi++;
    G.stato = 'via';
    vibra(60);
    Audio.sfx('errore');
    scritta(this, auto.cont.x, auto.cont.y - 80, `PASSAGGIO SCROCCATO! -${c.malusPassaggio}`, { size: 9, color: '#ff6b5a', durata: 900 });
    // cartoni via: il gioco è fatto
    for (const a of this.auto) if (a.ap?.chi === 'cartone') this.chiudi(a, true);
    // Giorgio felice nel finestrino di dietro, chi guida rassegnato, la macchina va via
    this.mettiTesta(auto, auto.dietro, G.travestito ? 'incognito_giorgio' : 'giorgioSera_felice', 'post');
    this.faccia(auto, 'sufficienza', 0);
    auto.casa = false;
    this.time.delayedCall(150, () => {
      Audio.sfx('clacson');
      fumetto(this, auto.cont.x - 20, auto.cont.y - auto.M.tetto - 12, caso(c.frasiCiao), 1000, 860);
    });
    this.tweens.add({
      targets: auto.cont, y: PARCHEGGIO.strada + 8, delay: 250, duration: 300, ease: 'Sine.inOut',
      onStart: () => { auto.cont.setDepth(PARCHEGGIO.strada); Audio.sfx('sgommata'); },
      onComplete: () => this.tweens.add({
        targets: auto.cont, x: 560, duration: 750, ease: 'Quad.in',
        onComplete: () => this.time.delayedCall(c.rientro * 1000, () => this.torna(auto)),
      }),
    });
  }

  // la macchina torna al suo posto e Giorgio scende, pronto a riprovarci
  torna(auto) {
    if (this.finito) return;
    auto.dietro.setVisible(false);
    auto.cont.setPosition(-90, PARCHEGGIO.strada + 8);
    this.tweens.add({
      targets: auto.cont, x: auto.x, duration: 650, ease: 'Quad.out',
      onComplete: () => this.tweens.add({
        targets: auto.cont, y: auto.y, duration: 250, ease: 'Sine.inOut',
        onComplete: () => {
          auto.cont.setDepth(auto.y);
          auto.casa = true;
          if (this.finito) return;
          this.faccia(auto, 'triste', 900);
          this.sobbalza(auto, 1.5, 1.5);
          const G = this.G, g = this.geometria(auto, 'post');
          G.x = auto.x + g.x; G.y = auto.y + 8;
          G.img.setPosition(G.x, G.y).setTexture(G.key('felice')).setVisible(true).setDepth(G.y + 2);
          G.stato = 'pausa'; G.t = 0.15;
          Audio.sfx('portiera');
        },
      }),
    });
  }

  // ------------------------------------------------------------
  //  INPUT
  // ------------------------------------------------------------
  tocco(p) {
    if (!this.inCorso) return;
    const w = puntatore(this, p), extra = p.wasTouch ? this.cfg.raggioDito : 0, G = this.G;
    // Giorgio che corre da Emilio (o che ci sta salendo): si ferma toccandolo. Viene prima delle
    // chiavi, che possono essere finite in mezzo al parcheggio proprio dove passa lui
    const suGiorgio = (G.stato === 'emilio' || G.stato === 'salendoEmilio') && Math.abs(w.x - G.x) <= 12 + extra && w.y <= G.y + 4 + extra && w.y >= G.y - ALTO - extra;
    if (suGiorgio && this.bloccata <= 0) return this.fermaEmilio();
    // le chiavi si prendono sempre (anche con la mano dolorante, e anche al volo mentre le lancia)
    if (this.trascina == null && this.chiavi.visible && G.stato !== 'chiavi' && Math.hypot(w.x - this.chiavi.x, w.y - this.chiavi.y) < 18 + (p.wasTouch ? 6 : 0)) {
      this.fermaChiavi();
      this.trascina = p.id;
      this.chiavi.setScale(scalaDi('chiavi', 1.4)).setAngle(0);
      Audio.sfx('tintinnio');
      return;
    }
    if (this.bloccata > 0) return;
    for (const a of this.auto) {
      if (!a.ap || !a.casa) continue;
      const g = this.geometria(a, a.ap.porta), quanto = Math.min(1, a.ap.t / a.ap.durata);
      const vis = Math.max(2, ALTO - g.base - quanto * g.corsa);
      const x = a.cont.x + g.x, giu = a.cont.y + g.soglia;
      if (Math.abs(w.x - x) <= 13 + extra && w.y <= giu + 4 + extra && w.y >= giu - vis - 3 - extra) return this.colpito(a);
    }
    this.aVuoto(w);
  }

  colpito(a) {
    const chi = a.ap.chi;
    if (chi === 'giorgio') return this.tiraFuori(a);
    if (chi === 'sosia') return this.sbagliato(a);
    // il cartone: non conta, e la mano resta ferma
    const g = this.geometria(a, a.ap.porta);
    this.aVuoto({ x: a.cont.x + g.x, y: a.cont.y - 40 }, 'È DI CARTONE!');
  }

  tiraFuori(a) {
    const c = this.cfg, G = this.G, ap = a.ap, quanto = Math.min(1, ap.t / ap.durata);
    const ultimo = quanto >= c.quasiDentro, pt = c.puntiFuori + (ultimo ? c.bonusUltimo : 0);
    const g = this.geometria(a, ap.porta);
    this.punti += pt;
    this.fuori++;
    ap.chi = 'fuori';
    this.chiudi(a, true);
    for (const x of this.auto) if (x.ap?.chi === 'cartone') this.chiudi(x, true);
    // lo strattone fa dondolare la macchina, e chi guida tira un sospiro di sollievo
    this.sobbalza(a, 2.5, 3);
    this.faccia(a, 'felice', 900);
    Audio.sfx('schiaffo');
    vibra(30);
    scuoti(this, 90, 0.004);
    const x0 = a.cont.x + g.x, y0 = a.cont.y + g.soglia + 30;
    scritta(this, x0, y0 - 66, ultimo ? `ALL'ULTIMO! +${pt}` : `FUORI! +${pt}`, { size: 9, color: '#7dff9a', durata: 500 });
    if (Math.random() < 0.5) fumetto(this, a.cont.x + 24, a.cont.y - a.M.tetto - 12, caso(c.frasiAutisti), 800, 860);
    this.vola(x0, y0);
  }

  // vola in mezzo al parcheggio, a gambe all'aria, e resta a terra un attimo (le chiavi!)
  vola(x0, y0) {
    const c = this.cfg, G = this.G;
    const tx = 170 + Math.round(this.rnd() * 160), ty = 226 + Math.round(this.rnd() * 20);
    const terra0 = G.y;   // dove toccava terra prima del volo (l'ombra parte da lì)
    G.stato = 'vola';
    G.x = tx; G.y = ty;
    G.img.setVisible(true).setTexture(G.key('shock')).setPosition(x0, y0).setDepth(860).setFlipX(tx < x0);
    this.ombra.setVisible(true);
    const salto = { t: 0 };
    this.tweens.add({
      targets: salto, t: 1, duration: 520, ease: 'Linear',
      onUpdate: () => {
        const t = salto.t, su = Math.sin(t * Math.PI);
        G.img.setPosition(lerp(x0, tx, t), lerp(y0, ty, t) - su * 50).setAngle(t * 360 * (tx < x0 ? -1 : 1));
        // l'ombra a terra, più piccola e chiara quanto più è in alto
        const ty0 = lerp(terra0, ty, t);
        this.ombra.setPosition(lerp(x0, tx, t), ty0).setScale(1 - su * 0.5).setAlpha(0.55 - su * 0.3).setDepth(ty0 + 1);
      },
      onComplete: () => {
        this.ombra.setAlpha(0.55);
        if (this.finito) return;
        G.img.setAngle(0).setDepth(ty + 2).setTexture(G.key(Math.random() < 0.5 ? 'triste' : 'shock'));
        // atterra di sedere: si schiaccia e torna su
        const sx = G.img.scaleX, sy = G.img.scaleY;
        this.tweens.add({ targets: G.img, scaleX: sx * 1.3, scaleY: sy * 0.7, duration: 90, yoyo: true, ease: 'Quad.out', onComplete: () => G.img.setScale(sx, sy) });
        Audio.sfx('tonfo');
        scuoti(this, 80, 0.003);
        stelle(this, tx, ty - ALTO * 0.6, 6, ty + 3);
        fumo(this, tx, ty - 2, 3, ty + 3, 0xb8b0a0);
        fumetto(this, tx, ty - ALTO - 8, caso(c.frasiFuori), 900, 860);
        G.stato = 'aTerra';
        // (se le chiavi non sono nell'angolo, un attimo in più per trovarle)
        G.t = lerp(c.scopertoInizio, c.scopertoFine, this.progresso) + (this.lontane ? c.chiaviLontane?.piuTempo ?? 0 : 0);
        G.tStelle = 0.4;
      },
    });
  }

  sbagliato(a) {
    const c = this.cfg, g = this.geometria(a, a.ap.porta), x = a.cont.x + g.x, y = a.cont.y - 40, id = this.sosia?.id;
    this.punti = Math.max(0, this.punti - c.malusSbagliato);
    this.bloccata = c.bloccoVuoto;
    Audio.sfx('errore');
    vibra(50);
    scritta(this, x, y - 16, `NON È GIORGIO! -${c.malusSbagliato}`, { size: 8, color: '#ff6b5a', durata: 500 });
    fumetto(this, x, y - 30, caso(c.frasiSosia), 900, 860);
    if (id) a.ap.key = `incognito_${id}_shock`;
  }

  aVuoto(w, s = 'A VUOTO!') {
    this.bloccata = this.cfg.bloccoVuoto;
    Audio.sfx('tonfo');
    scritta(this, w.x, w.y - 12, s, { size: 8, color: '#ff6b5a', durata: 400 });
  }

  // --- tastiera ---
  scegli(d) {
    if (!this.inCorso) return;
    this.sel = (this.sel + d + this.auto.length) % this.auto.length;
    Audio.sfx('muovi');
  }

  tastoTira() {
    if (!this.inCorso || this.bloccata > 0) return;
    // (da tastiera, Giorgio che corre da Emilio si ferma con SPAZIO: ma solo da metà corsa in poi,
    // quando sopra di lui compare ORA!; prima è un colpo a vuoto)
    if (this.G.stato === 'salendoEmilio') return this.fermaEmilio();
    if (this.G.stato === 'emilio') return this.G.corsa >= this.cfg.emilio.daQuando ? this.fermaEmilio() : this.aVuoto({ x: this.G.x, y: this.G.y - 40 }, 'TROPPO PRESTO!');
    const a = this.auto[this.sel];
    if (a.casa && a.ap) return this.colpito(a);
    this.aVuoto({ x: a.cont.x, y: a.cont.y - 40 });
  }

  tastoChiavi() {
    if (!this.inCorso || this.trascina != null) return;
    if (this.G.stato !== 'aTerra') { Audio.sfx('vuoto'); return; }
    const G = this.G;
    this.fermaChiavi();
    this.G.stato = 'chiavi';   // (intanto non si rialza)
    Audio.sfx('tintinnio');
    this.tweens.add({ targets: this.chiavi, x: G.x, y: G.y - ALTO * 0.45, angle: 720, duration: 380, ease: 'Quad.out', onComplete: () => { if (!this.finito) this.consegna(); } });
  }

  // --- le chiavi col mouse o col dito ---
  spostaChiavi(p) {
    const w = puntatore(this, p);
    this.chiavi.setPosition(Phaser.Math.Clamp(w.x, 6, 474), Phaser.Math.Clamp(w.y, 6, 264));
  }

  lasciaChiavi() {
    this.trascina = null;
    const G = this.G, c = this.cfg;
    this.chiavi.setScale(scalaDi('chiavi', 1.1));
    const d = Math.hypot(this.chiavi.x - G.x, this.chiavi.y - (G.y - ALTO * 0.45));
    if (G.stato === 'aTerra' && d <= c.raggioChiavi + (this.input.activePointer.wasTouch ? c.raggioDito : 0)) {
      G.stato = 'chiavi';
      this.consegna();
    } else this.riportaChiavi();
  }

  // lasciate lontano da Giorgio: tornano dov'erano appoggiate (l'angolo, o dove le aveva lanciate)
  riportaChiavi() {
    this.tweens.add({ targets: this.chiavi, x: this.posto.x, y: this.posto.y, angle: 0, scale: scalaDi('chiavi', 1.1), duration: 280, ease: 'Quad.out' });
  }

  // le chiavi prese (col dito o col mouse, o lanciate con INVIO) anche mentre volano, rimbalzano o
  // tornano al loro posto: quel movimento si ferma lì
  fermaChiavi() {
    this.voloChiavi?.stop();
    this.voloChiavi = null;
    this.tweens.killTweensOf(this.chiavi);
    this.chiavi.setScale(scalaDi('chiavi', 1.1));
  }

  // Giorgio scende dall'A3 e rilancia le chiavi: di solito nell'angolo, ogni tanto lontano (in mezzo
  // al parcheggio o sul tetto dell'A3: vedi chiaviLontane in config). Volano ad arco girando su se
  // stesse, rimbalzano una volta e restano lì finché non servono. Dice se le ha lanciate lontano
  lanciaChiavi(x0, y0) {
    const L = this.cfg.chiaviLontane;
    let dove = CHIAVI, lontane = false;
    if (L && (L.diFila || !this.lontane) && this.rnd() < L.prob) {
      if (this.rnd() < L.tetto) { dove = TETTO_A3; lontane = true; }
      else for (let i = 0; i < 12 && !lontane; i++) {
        const x = lerp(L.zona.x[0], L.zona.x[1], this.rnd()), y = lerp(L.zona.y[0], L.zona.y[1], this.rnd());
        const d = Math.hypot(x - CHIAVI.x, y - CHIAVI.y);
        if (d >= L.distanza[0] && d <= L.distanza[1]) { dove = { x: Math.round(x), y: Math.round(y) }; lontane = true; }
      }
    }
    this.lontane = lontane;
    this.posto = { ...dove };
    const ch = this.chiavi, d = Math.hypot(dove.x - x0, dove.y - y0), alto = 30 + d * 0.12, volo = { t: 0 };
    ch.setVisible(true).setPosition(x0, y0).setScale(scalaDi('chiavi', 1.1));
    this.voloChiavi = this.tweens.add({
      targets: volo, t: 1, duration: 420 + d * 0.5, ease: 'Linear',
      onUpdate: () => ch.setPosition(lerp(x0, dove.x, volo.t), lerp(y0, dove.y, volo.t) - Math.sin(volo.t * Math.PI) * alto).setAngle(volo.t * 720),
      onComplete: () => {
        this.voloChiavi = null;
        if (this.finito) return;
        Audio.sfx('tintinnio');
        ch.setAngle(0);
        // il rimbalzo, e un po' di polvere dove cadono
        this.tweens.add({ targets: ch, y: dove.y - 6, duration: 90, yoyo: true, ease: 'Quad.out' });
        fumo(this, dove.x, dove.y + 4, 2, 799, 0xb8b0a0);
        if (lontane) scritta(this, Phaser.Math.Clamp(dove.x, 40, 440), dove.y - 30, dove === TETTO_A3 ? 'SUL TETTO!' : 'LE CHIAVI SONO LÌ!', { size: 8, color: '#ffe14a', durata: 600 });
      },
    });
    return lontane;
  }

  // le prende controvoglia e va alla sua A3
  consegna() {
    const G = this.G, a3 = this.a3, g = this.geometria(a3, 'ant');
    this.chiavi.setVisible(false);
    Audio.sfx('tintinnio');
    G.img.setAngle(0).setTexture(G.travestito ? 'incognito_giorgio' : 'giorgioSera_sufficienza');
    scritta(this, G.x, G.y - ALTO - 6, 'UFFA...', { size: 9, color: '#ffe14a', durata: 450 });
    G.stato = 'versoA3';
    G.vel = this.cfg.velVersoA3;
    G.tx = a3.cont.x - g.x; G.ty = 252;
    G.dist = Math.max(1, Math.hypot(G.tx - G.x, G.ty - G.y));
    G.finta = null;
  }

  saleA3() {
    const G = this.G, a3 = this.a3, c = this.cfg;
    G.stato = 'sale';
    G.img.setVisible(false);
    a3.ap = { porta: 'ant', chi: 'a3' };
    this.disegnaPorta(a3, 'ant', true);
    Audio.sfx('apri');
    const salita = { q: 0 };
    this.mettiDentro(a3, 'giorgioSera_sufficienza', 'ant', 0);
    this.tweens.add({
      targets: salita, q: 1, duration: 260,
      onUpdate: () => { if (!this.finito) this.mettiDentro(a3, 'giorgioSera_sufficienza', 'ant', salita.q); },
      onComplete: () => {
        if (this.finito) return;
        a3.dentro.setVisible(false);
        this.disegnaPorta(a3, null, false);
        Audio.sfx('portiera');
        this.sobbalza(a3, 2);
        this.mettiTesta(a3, a3.testa, 'giorgioSera_sufficienza', 'ant');
        // il motore dopo anni: tossisce, poi parte
        Audio.sfx('tossisce');
        fumo(this, a3.cont.x + a3.M.m, a3.cont.y - 8, 4, 900, 0x8a8478);
        this.time.delayedCall(300, () => {
          if (this.finito) return;
          Audio.sfx('motore');
          // ogni guidata vale un po' di più della precedente (Giorgio è sempre più furbo)
          const vale = c.puntiGuida + c.crescitaGuida * this.guidate;
          this.punti += vale;
          this.guidate++;
          G.stato = 'volante';
          G.t = c.alVolante;
          vibra(80);
          scuoti(this, 200, 0.006);
          // l'A3 si sveglia di soprassalto, con una nuvola di polvere (sono anni che sta lì)
          this.sobbalza(a3, 3, 2.5);
          fumo(this, a3.cont.x, a3.cont.y - a3.M.tetto / 2, 5, 901, 0xd8d0c0);
          // gli amici non ci credono: a bocca aperta (chi suona il clacson poi è felice, vedi sotto)
          for (const a of this.auto) if (a.casa && !a.ap) this.faccia(a, 'shock', 1200);
          fumo(this, a3.cont.x + a3.M.m + 4, a3.cont.y - 8, 6, 900, 0x6a6458);
          scritta(this, 150, 196, `AL VOLANTE! +${vale}`, { size: 14, color: '#7dff9a', durata: 900 });
          scritta(this, a3.cont.x, a3.cont.y - 70, 'BRUM BRUM!', { size: 9, color: '#ffffff', durata: 600 });
          fumetto(this, a3.cont.x - 16, a3.cont.y - a3.M.tetto - 12, caso(c.frasiVolante), 1300, 860);
          Phaser.Utils.Array.Shuffle([...this.auto]).slice(0, 2).forEach((a, i) => this.time.delayedCall(200 + i * 300, () => {
            if (!a.casa || this.finito) return;
            Audio.sfx('clacson');
            if (!a.ap) { this.faccia(a, 'felice', 1000); this.sobbalza(a, 1); }
            fumetto(this, a.cont.x + 20, a.cont.y - a.M.tetto - 12, caso(c.frasiAmici), 1000, 860);
          }));
        });
      },
    });
  }

  // scende con una scusa e rimette a posto le chiavi
  scendeA3() {
    const G = this.G, a3 = this.a3, g = this.geometria(a3, 'ant');
    a3.ap = null;
    a3.testa.setVisible(false);
    Audio.sfx('portiera');
    G.x = a3.cont.x - g.x; G.y = 252;
    G.img.setTexture(G.travestito ? 'incognito_giorgio' : 'giorgioSera_normale').setPosition(G.x, G.y).setVisible(true).setDepth(270);
    G.stato = 'pausa'; G.t = 0.1;   // e riparte subito di corsa
    this.sobbalza(a3, 1.5);
    // le chiavi: le rilancia (se lontano, lo dice lui)
    const lontane = this.lanciaChiavi(G.x, G.y - 30);
    fumetto(this, G.x + 10, G.y - ALTO - 8, caso(lontane ? this.cfg.chiaviLontane.frasi : this.cfg.frasiScende), 1000, 860);
  }

  risultato() {
    const c = this.cfg;
    // l'obiettivo raggiunto vale almeno il bronzo: i malus (passaggi scroccati, persona sbagliata)
    // tolgono punti, e con 4 guidate su 4 si restava sotto (scheda 2: "se fai 4 su 4 non raggiungi
    // il bronzo")
    const centrato = this.guidate >= c.obiettivoGuidate;
    return {
      punteggio: centrato ? Math.max(this.punti, c.medaglie.bronzo) : this.punti,
      vittoria: centrato,
      riepilogo: `al volante: ${this.guidate}, tirato fuori: ${this.fuori + this.presiEmilio}, scroccati: ${this.scrocchi + this.saliti}`,
      titoli: ['SI VA IN DISCO!', 'NIENTE DA FARE!'],
    };
  }

  // Ha guidato: l'A3 impolverata parte verso la disco con Giorgio al volante e gli amici dietro.
  // Non ha guidato: Giorgio con le cuffie, seduto dietro nel SUV di Sego, felice.
  finale(ris, fatto) {
    this.fermaChiavi();
    for (const o of [this.testoPunti, this.testoGuidate, this.testoFurbo, this.freccia, this.aiutoChiavi, this.chiavi, this.oraEmilio, this.ombra]) o.setVisible(false);
    this.emilio?.cont.destroy();
    this.emilio = null;
    for (const a of [...this.auto, this.a3]) { a.ap = null; this.disegnaPorta(a, null, false); a.dentro.setVisible(false).clearTint(); }
    this.sosia?.img.destroy();
    this.sosia = null;
    this.tweens.killTweensOf(this.G.img);
    this.G.img.setVisible(false);
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.6, duration: 300 });
    const titolo = (s, col) => txt(this, 240, 24, s, { size: 17, color: col, depth: 710 });

    this.time.delayedCall(500, () => {
      if (ris.vittoria) {
        const a3 = this.a3;
        titolo('SI VA IN DISCO: GUIDA GIORGIO!', '#7dff9a');
        a3.cont.setDepth(705);
        this.tweens.add({ targets: a3.cont, x: 250, y: 236, scaleX: -1.7, scaleY: 1.7, duration: 500, ease: 'Sine.inOut' });
        this.mettiTesta(a3, a3.testa, 'giorgioSera_sufficienza', 'ant');
        this.mettiTesta(a3, a3.dietro, 'greg_felice', 'post');
        Audio.sfx('motore');
        this.time.delayedCall(700, () => {
          Audio.sfx('clacson');
          fumetto(this, 200, 120, 'Si parte!', 900, 711);
          fumetto(this, 300, 112, 'EVVAI! Miracolo!', 900, 711);
          this.tweens.add({ targets: a3.cont, x: -160, duration: 1400, ease: 'Quad.in' });
          for (let i = 0; i < 6; i++) this.time.delayedCall(i * 160, () => fumo(this, a3.cont.x + a3.M.m * 1.7, 222, 3, 706, 0x8a8478));
        });
      } else {
        const suv = this.auto[2];
        titolo('ANCHE STASERA SCROCCA!', '#ff6b5a');
        suv.cont.setDepth(705);
        this.tweens.killTweensOf(suv.cont);
        suv.cont.setAngle(0);
        suv.cont.setPosition(suv.casa ? suv.cont.x : -90, suv.casa ? suv.cont.y : PARCHEGGIO.fila);
        this.tweens.add({ targets: suv.cont, x: 240, y: 236, scaleX: 1.5, scaleY: 1.5, duration: 600, ease: 'Sine.inOut' });
        this.mettiTesta(suv, suv.dietro, 'giorgioCuffie', 'post');
        Audio.sfx('tsk');
        this.time.delayedCall(800, () => {
          fumetto(this, 220, 112, 'Svegliatemi all\'arrivo!', 1100, 711);
          Audio.sfx('clacson');
          this.tweens.add({ targets: suv.cont, x: 640, delay: 500, duration: 1300, ease: 'Quad.in' });
        });
      }
    });
    this.time.delayedCall(3400, fatto);
  }
}
