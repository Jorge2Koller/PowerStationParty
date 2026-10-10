// Microgioco 12: "Il Passaggiorgio" - stasera guida Giorgio. Per forza.
//
//  Sabato sera, parcheggio sotto casa. Giorgio non prende mai la macchina: corre verso le
//  macchine degli amici (la Panda di Guerra, la Golf di Greg, il SUV di Sego), apre una
//  portiera e prova a salire. Clic/tocco su di lui prima che chiuda: vola in mezzo al
//  parcheggio. Mentre è a terra si trascinano le chiavi fino a lui: va alla sua A3
//  impolverata e si mette al volante (per poco: poi scende con una scusa).
//  Se chiude la portiera, la macchina parte con lui dentro che saluta: passaggio scroccato.
//  Più avanti: finte, sagome di cartone nelle altre portiere, travestimento col cappuccio
//  (con un sosia incappucciato da non tirare fuori) e, alla fine, anche il bagagliaio.
//  Clic a vuoto: la mano resta ferma per un attimo.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { MODELLI, COLORI_AUTO, porteAuto } from '../grafica/oggetti.js';
import { PARCHEGGIO } from '../grafica/sfondi.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, scuoti, puntatore, lerp, caso, eTouch, vibra, multiTouch } from '../fx.js';

const AMICI = [
  { id: 'guerra', modello: 'panda', x: 128 },
  { id: 'greg', modello: 'golf', x: 268 },
  { id: 'sego', modello: 'suv', x: 408 },
];
const A3 = { modello: 'a3', x: 72, y: PARCHEGGIO.davanti };   // la macchina di Giorgio, col muso a sinistra
const CHIAVI = { x: 448, y: 246 };
const TAGLIA = 0.42;          // Giorgio e il sosia: 40x60 unità
const ALTO = 144 * TAGLIA;    // altezza a schermo di un personaggio
const TESTA = 0.3;            // teste nei finestrini
const TAGLIO_TESTA = 0.64;    // la testa occupa i primi 64% della texture del personaggio
const SOSIA = ['marco', 'beppe', 'bota'];
const COLORI = { ...COLORI_AUTO, a3: '#d8d4c8' };   // l'A3 è bianca, ma impolverata

export class GuidaScene extends MicrogiocoBase {
  constructor() { super('guida'); }

  prepara() {
    this.punti = 0;
    this.guidate = 0;
    this.fuori = 0;
    this.scrocchi = 0;
    this.bloccata = 0;
    this.sel = 1;
    this.hud = null;
    this.tScarico = 1;
    this.trascina = null;   // id del dito (o del mouse) che tiene le chiavi

    im(this, 0, 0, 'bgParcheggio').setOrigin(0);
    this.auto = AMICI.map((a, i) => this.creaAuto({ ...a, i, y: PARCHEGGIO.fila, verso: 1 }));
    this.a3 = this.creaAuto({ ...A3, verso: -1 });
    im(this, 150, 268, 'cartello2019', 1).setOrigin(0.5, 1).setDepth(267);

    // le chiavi della A3, nell'angolo
    this.chiavi = im(this, CHIAVI.x, CHIAVI.y, 'chiavi', 1.1).setDepth(800);
    this.aiutoChiavi = txt(this, CHIAVI.x - 8, CHIAVI.y - 26, 'LE CHIAVI!', { size: 7, color: '#ffe14a', depth: 801 }).setVisible(false);
    this.tweens.add({ targets: this.aiutoChiavi, scale: 1.15, duration: 300, yoyo: true, repeat: -1 });

    // Giorgio (vestito da sera) e, quando serve, il sosia incappucciato
    this.G = { stato: 'pausa', t: 1, x: 240, y: 236, dir: 1, key: (e) => 'giorgioSera_' + e, img: im(this, 240, 236, 'giorgioSera_normale', TAGLIA).setOrigin(0.5, 1).setDepth(238) };
    this.sosia = null;

    // la freccia della tastiera sopra la macchina scelta (sul telefono non serve)
    this.freccia = txt(this, 0, 0, '▼', { size: 12, color: '#ffe14a', depth: 850 }).setVisible(!eTouch());
    this.tweens.add({ targets: this.freccia, y: '+=3', duration: 300, yoyo: true, repeat: -1 });

    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });
    this.testoGuidate = txt(this, 474, 49, '', { ox: 1, depth: 1001, size: 8 });

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

  get fase() {
    let f = this.cfg.fasi[0];
    for (const x of this.cfg.fasi) if (this.trascorso >= x.da) f = x;
    return f;
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
    const auto = { ...a, M, P, cont, testa, dietro, img, vano, dentro, anta, casa: true, ap: null };
    if (a.id) this.mettiTesta(auto, testa, a.id + '_normale', 'ant');
    return auto;
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
    const f = this.fase;
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

    const sc = this.auto[this.sel];
    this.freccia.setPosition(sc.cont.x, sc.cont.y - sc.M.tetto - 12).setVisible(!eTouch() && sc.casa);
    this.aiutoChiavi.setVisible(this.G.stato === 'aTerra' && this.trascina == null);
    if (this.trascina == null && this.G.stato === 'aTerra') this.chiavi.angle = Math.sin(this.trascorso * 18) * 12;
    else if (this.trascina == null) this.chiavi.angle = 0;

    const hud = `${this.punti}|${this.guidate}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText('PUNTI: ' + this.punti);
      this.testoGuidate.setText(`AL VOLANTE: ${this.guidate}/${this.cfg.obiettivoGuidate}`).setColor(this.guidate >= this.cfg.obiettivoGuidate ? '#7dff9a' : '#ffe14a');
    }
  }

  muoviGiorgio(dt, f) {
    const G = this.G, c = this.cfg;
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
    }
  }

  // Giorgio (o il sosia) punta una portiera di una macchina libera; fa = auto da evitare
  sceltaPorta(f, evita) {
    const libere = this.auto.filter((a) => a.casa && !a.ap && a !== evita && !(this.sosia?.meta?.auto === a));
    if (!libere.length) return null;
    const auto = caso(libere);
    const porta = Math.random() < f.bagagliaio ? 'bag' : caso(['ant', 'post']);
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
    G.travestito = Math.random() < f.travestimento;
    G.key = (e) => (G.travestito ? (e === 'shock' ? 'incognito_giorgio_shock' : 'incognito_giorgio') : 'giorgioSera_' + e);
    G.img.setTexture(G.key('normale')).setVisible(true);
    G.vel = f.vel;
    G.stato = 'corre';
    this.punta(G, meta);
    G.finta = Math.random() < f.finta ? Phaser.Math.FloatBetween(0.5, 0.75) : null;
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
    const id = caso(SOSIA), da = Math.random() < 0.5 ? -20 : 500;
    const S = { id, x: da, y: 230 + Math.random() * 20, vel: f.vel * 0.95, stato: 'corre' };
    S.img = im(this, S.x, S.y, `incognito_${id}`, TAGLIA).setOrigin(0.5, 1);
    this.punta(S, meta);
    this.sosia = S;
  }

  muoviSosia(dt) {
    const S = this.sosia;
    if (S.stato !== 'corre') return;
    const dx = S.tx - S.x, dy = S.ty - S.y, d = Math.hypot(dx, dy), passo = Math.min(d, S.vel * dt);
    if (d > 0) { S.x += (dx / d) * passo; S.y += (dy / d) * passo; }
    S.img.setPosition(S.x, S.y - Math.abs(Math.sin(this.trascorso * 15 + 1)) * 2.5).setFlipX(dx < 0).setDepth(S.y + 2);
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
    if (chi === 'giorgio') {
      G.stato = 'dentro';
      G.img.setVisible(false);
      fumetto(this, auto.cont.x, auto.cont.y - auto.M.tetto - 12, caso(this.cfg.scuse), Math.max(900, f.finestra * 1000), 860);
      // più portiere insieme: nelle altre macchine spunta un Giorgio di cartone
      const altre = this.auto.filter((a) => a !== auto && a.casa && !a.ap);
      Phaser.Utils.Array.Shuffle(altre).slice(0, f.insieme - 1).forEach((a) => {
        fumo(this, a.cont.x, a.cont.y - 20, 3, a.cont.depth + 2);
        this.entra(a, caso(['ant', 'post']), 'cartone');
      });
    }
  }

  aggiornaAuto(auto, dt) {
    const ap = auto.ap;
    if (auto.casa && auto.id) auto.cont.y = auto.y + (Math.sin(this.trascorso * 40 + auto.i) > 0 ? 0.25 : 0);   // motore acceso
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
    if (!silenzio) Audio.sfx('portiera');
    if (ap.chi === 'sosia' && this.sosia) { this.sosia.img.destroy(); this.sosia = null; }
    if (ap.chi === 'giorgio') this.scrocca(auto);
  }

  scrocca(auto) {
    const c = this.cfg, G = this.G;
    this.punti -= c.malusPassaggio;
    this.scrocchi++;
    G.stato = 'via';
    vibra(60);
    Audio.sfx('errore');
    scritta(this, auto.cont.x, auto.cont.y - 80, `PASSAGGIO SCROCCATO! -${c.malusPassaggio}`, { size: 9, color: '#ff6b5a', durata: 900 });
    // cartoni via: il gioco è fatto
    for (const a of this.auto) if (a.ap?.chi === 'cartone') this.chiudi(a, true);
    // Giorgio felice nel finestrino di dietro, la macchina va via
    this.mettiTesta(auto, auto.dietro, G.travestito ? 'incognito_giorgio' : 'giorgioSera_felice', 'post');
    auto.casa = false;
    this.time.delayedCall(250, () => {
      Audio.sfx('clacson');
      fumetto(this, auto.cont.x - 20, auto.cont.y - auto.M.tetto - 12, caso(c.frasiCiao), 1000, 860);
    });
    this.tweens.add({
      targets: auto.cont, y: PARCHEGGIO.strada + 8, delay: 400, duration: 450, ease: 'Sine.inOut',
      onStart: () => { auto.cont.setDepth(PARCHEGGIO.strada); Audio.sfx('sgommata'); },
      onComplete: () => this.tweens.add({
        targets: auto.cont, x: 560, duration: 1100, ease: 'Quad.in',
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
      targets: auto.cont, x: auto.x, duration: 1100, ease: 'Quad.out',
      onComplete: () => this.tweens.add({
        targets: auto.cont, y: auto.y, duration: 400, ease: 'Sine.inOut',
        onComplete: () => {
          auto.cont.setDepth(auto.y);
          auto.casa = true;
          if (this.finito) return;
          const G = this.G, g = this.geometria(auto, 'post');
          G.x = auto.x + g.x; G.y = auto.y + 8;
          G.img.setPosition(G.x, G.y).setTexture(G.key('felice')).setVisible(true).setDepth(G.y + 2);
          G.stato = 'pausa'; G.t = 0.6;
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
    const w = puntatore(this, p);
    // le chiavi si prendono sempre (anche con la mano dolorante)
    if (this.trascina == null && this.chiavi.visible && this.G.stato !== 'chiavi' && Math.hypot(w.x - this.chiavi.x, w.y - this.chiavi.y) < 18 + (p.wasTouch ? 6 : 0)) {
      this.trascina = p.id;
      this.chiavi.setScale(scalaDi('chiavi', 1.4)).setAngle(0);
      Audio.sfx('tintinnio');
      return;
    }
    if (this.bloccata > 0) return;
    const extra = p.wasTouch ? this.cfg.raggioDito : 0;
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
    Audio.sfx('schiaffo');
    vibra(30);
    scuoti(this, 90, 0.004);
    const x0 = a.cont.x + g.x, y0 = a.cont.y + g.soglia + 30;
    scritta(this, x0, y0 - 66, ultimo ? `ALL'ULTIMO! +${pt}` : `FUORI! +${pt}`, { size: 9, color: '#7dff9a', durata: 500 });
    if (Math.random() < 0.5) fumetto(this, a.cont.x + 24, a.cont.y - a.M.tetto - 12, caso(c.frasiAutisti), 800, 860);
    // vola in mezzo al parcheggio, a gambe all'aria
    const tx = Phaser.Math.Between(170, 330), ty = Phaser.Math.Between(226, 246);
    G.stato = 'vola';
    G.x = tx; G.y = ty;
    G.img.setVisible(true).setTexture(G.key('shock')).setPosition(x0, y0).setDepth(860).setFlipX(tx < x0);
    const salto = { t: 0 };
    this.tweens.add({
      targets: salto, t: 1, duration: 520, ease: 'Linear',
      onUpdate: () => {
        const t = salto.t;
        G.img.setPosition(lerp(x0, tx, t), lerp(y0, ty, t) - Math.sin(t * Math.PI) * 50).setAngle(t * 360 * (tx < x0 ? -1 : 1));
      },
      onComplete: () => {
        if (this.finito) return;
        G.img.setAngle(0).setDepth(ty + 2).setTexture(G.key(Math.random() < 0.5 ? 'triste' : 'shock'));
        Audio.sfx('tonfo');
        stelle(this, tx, ty - ALTO * 0.6, 6, ty + 3);
        fumo(this, tx, ty - 2, 3, ty + 3, 0xb8b0a0);
        fumetto(this, tx, ty - ALTO - 8, caso(c.frasiFuori), 900, 860);
        G.stato = 'aTerra';
        G.t = lerp(c.scopertoInizio, c.scopertoFine, this.progresso);
        G.tStelle = 0.4;
      },
    });
  }

  sbagliato(a) {
    const c = this.cfg, g = this.geometria(a, a.ap.porta), x = a.cont.x + g.x, y = a.cont.y - 40, id = this.sosia?.id;
    this.punti -= c.malusSbagliato;
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
    const a = this.auto[this.sel];
    if (a.casa && a.ap) return this.colpito(a);
    this.aVuoto({ x: a.cont.x, y: a.cont.y - 40 });
  }

  tastoChiavi() {
    if (!this.inCorso || this.trascina != null) return;
    if (this.G.stato !== 'aTerra') { Audio.sfx('vuoto'); return; }
    const G = this.G;
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

  riportaChiavi() {
    this.tweens.add({ targets: this.chiavi, x: CHIAVI.x, y: CHIAVI.y, angle: 0, scale: scalaDi('chiavi', 1.1), duration: 280, ease: 'Quad.out' });
  }

  // le prende controvoglia e va alla sua A3
  consegna() {
    const G = this.G, a3 = this.a3, g = this.geometria(a3, 'ant');
    this.chiavi.setVisible(false);
    Audio.sfx('tintinnio');
    G.img.setAngle(0).setTexture(G.travestito ? 'incognito_giorgio' : 'giorgioSera_sufficienza');
    scritta(this, G.x, G.y - ALTO - 6, 'UFFA...', { size: 9, color: '#ffe14a', durata: 450 });
    G.stato = 'versoA3';
    G.vel = 120;
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
      targets: salita, q: 1, duration: 450,
      onUpdate: () => { if (!this.finito) this.mettiDentro(a3, 'giorgioSera_sufficienza', 'ant', salita.q); },
      onComplete: () => {
        if (this.finito) return;
        a3.dentro.setVisible(false);
        this.disegnaPorta(a3, null, false);
        Audio.sfx('portiera');
        this.mettiTesta(a3, a3.testa, 'giorgioSera_sufficienza', 'ant');
        // il motore dopo anni: tossisce, poi parte
        Audio.sfx('tossisce');
        fumo(this, a3.cont.x + a3.M.m, a3.cont.y - 8, 4, 900, 0x8a8478);
        this.time.delayedCall(650, () => {
          if (this.finito) return;
          Audio.sfx('motore');
          this.punti += c.puntiGuida;
          this.guidate++;
          G.stato = 'volante';
          G.t = c.alVolante;
          vibra(80);
          scuoti(this, 200, 0.006);
          fumo(this, a3.cont.x + a3.M.m + 4, a3.cont.y - 8, 6, 900, 0x6a6458);
          scritta(this, 150, 196, `AL VOLANTE! +${c.puntiGuida}`, { size: 14, color: '#7dff9a', durata: 900 });
          scritta(this, a3.cont.x, a3.cont.y - 70, 'BRUM BRUM!', { size: 9, color: '#ffffff', durata: 600 });
          fumetto(this, a3.cont.x - 16, a3.cont.y - a3.M.tetto - 12, caso(c.frasiVolante), 1300, 860);
          Phaser.Utils.Array.Shuffle([...this.auto]).slice(0, 2).forEach((a, i) => this.time.delayedCall(200 + i * 300, () => {
            if (!a.casa || this.finito) return;
            Audio.sfx('clacson');
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
    fumetto(this, G.x + 10, G.y - ALTO - 8, caso(this.cfg.frasiScende), 1000, 860);
    G.stato = 'pausa'; G.t = 0.5;
    // le chiavi tornano nell'angolo (lanciate)
    this.chiavi.setVisible(true).setPosition(G.x, G.y - 30);
    this.tweens.add({ targets: this.chiavi, x: CHIAVI.x, duration: 600, ease: 'Linear' });
    this.tweens.add({ targets: this.chiavi, y: { from: G.y - 30, to: CHIAVI.y }, angle: 540, duration: 600, ease: 'Back.in' });
  }

  risultato() {
    const c = this.cfg;
    return {
      punteggio: this.punti,
      vittoria: this.guidate >= c.obiettivoGuidate,
      riepilogo: `al volante ${this.guidate}, tirato fuori ${this.fuori}, passaggi scroccati ${this.scrocchi}`,
      titoloFine: this.guidate ? 'TEMPO!' : 'NIENTE DA FARE!',
    };
  }

  // Ha guidato: l'A3 impolverata parte verso la disco con Giorgio al volante e gli amici dietro.
  // Non ha guidato: Giorgio con le cuffie, seduto dietro nel SUV di Sego, felice.
  finale(ris, fatto) {
    for (const o of [this.testoPunti, this.testoGuidate, this.freccia, this.aiutoChiavi, this.chiavi]) o.setVisible(false);
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
      if (this.guidate) {
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
