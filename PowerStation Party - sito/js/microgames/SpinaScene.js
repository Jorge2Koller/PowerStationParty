// Microgioco 1: "La Spina del PowerStation" - sfida di spillatura contro Beppe. SPILLA!
//
//  Si tiene premuto (SPAZIO, il mouse o il dito) per spillare e si rilascia quando la birra è
//  nella ZONA VERDE. Al centro della zona: PERFETTA, punti in più.
//  I clienti ordinano tre bicchieri diversi: la pinta, il boccale (grande, si riempie piano,
//  vale di più) e il calice (zona strettissima, vale tanto: il rischio). Tre atti, a fasi, ognuno
//  più difficile di quello prima: si comincia con le pinte; poi l'ORA DI PUNTA (la birra scende
//  più veloce, la zona verde è più stretta e non sta sempre alla stessa altezza, arrivano boccali e
//  calici, Beppe accelera); alla fine LO ZERE SI SCATENA: ogni tanto alza la sua vuvuzela blu, prende
//  fiato (si vede arrivare) e la suona, e finché suona la zona verde balla e il bicchiere trema.
//  Beppe intanto spilla pinte a ritmo suo (la forma del giorno esce dal seme: cambia da un round
//  all'altro, ma nel round è la stessa per tutti): per vincere bisogna fare più punti di lui.
//  I bicchieri arrivano nello stesso ordine per tutti i giocatori del round (seme del round).
//  Il PowerStation è il bar degli amici, ed è pieno: quattro clienti di spalle al bancone, altri in
//  piedi ai lati con la pinta (brindano, chiacchierano, fanno il tifo), lo Zere con la vuvuzela, e
//  alle pareti le foto incorniciate del gruppo.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { CONFIG } from '../config.js';
import { casuale, tela, DENS } from '../grafica/base.js';
import { clienteDi } from '../grafica/oggetti.js';
import { PERSONAGGI } from '../grafica/personaggi.js';
import { fondoFoto, cornice, BORDO_FOTO, TIPI_FOTO } from '../grafica/powerstation.js';
import { aspettoDi, preparaPosa } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumo, pannello, scuoti, lerp, caso, colpetto, eTouch, vibra, quanti } from '../fx.js';

const Y_BANCONE = 181;            // dove appoggia il bicchiere
const Y_BECCO = 137;              // da dove esce la birra
const X_MIO = 160, X_BEPPE = 320;
const X_IO = 84;                  // chi gioca, dietro al bancone
const CAVO = 43;                  // altezza interna del bicchiere (unità)
const NOMI = { pinta: 'PINTA', boccale: 'BOCCALE', calice: 'CALICE' };
const Y_ESITO = 200;              // BUONA / TRABOCCA! escono sul bancone, sotto: sopra c'è il nome del bicchiere
// La gente in piedi ai lati del bancone, dalla parte dei clienti (i piedi sono sotto il bordo dello
// schermo): due avventori con la pinta, e lo Zere, un po' più grande (è più vicino). giro = la figura
// è girata verso il centro del bar
const Y_PIEDI = 284;
const X_ZERE = 410, K_ZERE = 0.7, K_AVVENTORE = 0.56;
const AVVENTORI = [{ x: 20, giro: false }, { x: 463, giro: true }];
// la campana della vuvuzela mentre la suona, nella texture dello Zere girata (unità della texture,
// 96x144): viene dalla posa 'vuvuzela' di js/grafica/personaggi.js (il bocchino sulle labbra, la
// tromba lunga 92 verso la mano). Da lì partono le onde del suono
const CAMPANA = [9.8, 50.6];
// le foto del gruppo alle pareti (sulla boiserie): centro, misure fuori tutto, quante persone
const FOTO = [
  { x: 21, y: 141, w: 30, h: 36, n: 1 },
  { x: 459, y: 141, w: 30, h: 36, n: 1 },
  { x: 184, y: 138, w: 32, h: 25, n: 2 },
  { x: 298, y: 137, w: 32, h: 25, n: 2 },
];

export class SpinaScene extends MicrogiocoBase {
  constructor() { super('spina'); }

  get fase() { return this.atti.filter((a) => this.trascorso >= a.da).pop(); }

  prepara() {
    const c = this.cfg;
    const seme = Sessione.seme;
    // gli atti, coi loro inizi: in Lampo (15 secondi) arrivano prima (daLampo), così anche lì si
    // passa per tutte e tre le fasi e lo Zere fa in tempo a suonare
    this.atti = c.atti.map((a) => ({ ...a, da: Sessione.tipo === 'lampo' ? a.daLampo : a.da }));
    this.rnd = casuale(seme);
    // Beppe ha il suo generatore: quello che fa il giocatore non cambia le sue pinte
    this.rndBeppe = casuale((seme ^ 0x9e3779b9) >>> 0);
    // ...e anche lo Zere: le sue suonate cadono uguali per tutti i giocatori del round
    this.rndZere = casuale((seme ^ 0x5bd1e995) >>> 0);
    this.formaBeppe = c.formaBeppe[0] + this.rndBeppe() * (c.formaBeppe[1] - c.formaBeppe[0]);
    this.punti = 0;
    this.pinte = 0;            // bicchieri buoni (di qualunque tipo)
    this.perfette = 0;
    this.pinteBeppe = 0;
    this.tBeppe = 0;
    this.pintaBeppe();
    this.tOcchiata = 5;
    this.tChiacchiere = 1.5;
    this.tAvventori = 2.5;
    this.atto = 0;
    this.statoZere = 'tifo';   // 'tifo', 'carica' (alza la vuvuzela e prende fiato), 'suona'
    this.tZere = 0;
    this.soffio = 0;           // secondi di vuvuzela che restano: intanto la zona verde balla
    this.tOnda = 0;
    this.texture = [];         // le texture fatte per questa partita (si buttano alla fine: pulisci)

    im(this, 0, 0, 'bgPub').setOrigin(0);
    txt(this, 240, 42, 'POWERSTATION', { size: 9, color: '#f6d36b', thick: 0 });
    txt(this, 240, 69, 'OGGI ALLA SPINA', { size: 8, color: '#ffe9a0', thick: 0 });
    const B = this.cfg.bicchieri, prezzo = (nome, k) => `${nome} ${'.'.repeat(15 - nome.length - String(B[k].punti).length)} ${B[k].punti}`;
    txt(this, 240, 92, [prezzo('Pinta', 'pinta'), prezzo('Boccale', 'boccale'), prezzo('Calice', 'calice')].join('\n'), { size: 7, color: '#eef2e4', thick: 0, spacing: 0 });

    // chi c'è stasera: quattro clienti al bancone e due avventori in piedi, personaggi giocabili a
    // caso (non chi gioca); le foto alle pareti, a caso tra tutti
    const io = this.giocatore.id.replace(DOPPIONE, '');
    const tutti = CONFIG.personaggiGiocabili.map((p) => p.id);
    const scelti = Phaser.Utils.Array.Shuffle(tutti.filter((id) => id !== io)).slice(0, 4 + AVVENTORI.length);
    this.creaFoto(Phaser.Utils.Array.Shuffle([...tutti]));

    // baristi dietro al bancone
    this.io = im(this, X_IO, 200, this.giocatore.id + '_normale').setOrigin(0.5, 1);
    this.beppe = im(this, 398, 200, 'beppe_normale').setOrigin(0.5, 1);
    im(this, 0, 168, 'bancone').setOrigin(0).setDepth(10);
    im(this, 132, 182, 'spina').setOrigin(0, 1).setDepth(11);
    im(this, 348, 182, 'spina').setOrigin(1, 1).setFlipX(true).setDepth(11);
    this.getto = this.add.rectangle(X_MIO - 1, Y_BECCO, 3, 1, 0xf6ae1e).setOrigin(0.5, 0).setDepth(12).setVisible(false);
    this.gettoBeppe = this.add.rectangle(X_BEPPE + 1, Y_BECCO, 3, 1, 0xf6ae1e).setOrigin(0.5, 0).setDepth(12);

    // clienti di spalle che chiacchierano e gesticolano, disegnati da dietro ogni volta (col costume
    // del Bancone, se ce l'hanno)
    scelti.slice(0, 4).forEach((id, i) => { for (const f of [0, 1]) tela(this, `clienteSpina${i}_${f}`, 58, 78, (cc) => clienteDi(cc, aspettoDi(id), f), 5); });
    this.clienti = [0, 1, 2, 3].map((i) => {
      const s = im(this, 150 + i * 60, 280, `clienteSpina${i}_0`).setOrigin(0.5, 1).setDepth(20);
      s.idx = i;
      this.tweens.add({ targets: s, y: 277, duration: 500 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      return s;
    });
    this.creaGente(scelti.slice(4));

    // contatore: i miei punti contro quelli di Beppe
    pannello(this, 240, 22, 196, 18, { depth: 1000 });
    this.contatore = txt(this, 240, 22, '', { size: 12, depth: 1001, thick: 3 });
    this.ordine = txt(this, X_MIO, 118, '', { size: 8, depth: 30, color: '#ffe14a' });

    this.spazio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // dito (o mouse) tenuto premuto in qualunque punto = SPAZIO tenuto
    this.premuti = new Set();
    this.input.on('pointerdown', (p) => this.premuti.add(p.id));
    for (const ev of ['pointerup', 'pointerupoutside']) this.input.on(ev, (p) => this.premuti.delete(p.id));
    if (eTouch()) {
      this.spilla = this.add.container(56, 232).setDepth(1000);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.3); g.fillCircle(1.5, 2.5, 25);
      g.fillStyle(0xb5651d, 1); g.fillCircle(0, 0, 25);
      g.lineStyle(2.5, 0xffe14a, 1); g.strokeCircle(0, 0, 25);
      this.spilla.add([g, txt(this, 0, 0, 'SPILLA', { size: 9, color: '#ffe14a' })]);   // ("tieni premuto" lo dicono i comandi)
    }
    this.bicchiereBeppe = this.creaBicchiere(X_BEPPE, 'pinta');
    this.nuovoBicchiere();
    this.aggiornaContatore();
  }

  // dopo una pausa nessun dito risulta più appoggiato (se no la spina resterebbe aperta)
  alRientro() { this.premuti.clear(); }

  // le pose e le foto fatte per questa partita
  pulisci() { for (const k of this.texture) if (this.textures.exists(k)) this.textures.remove(k); }

  // Le foto del gruppo alle pareti: il fondo (al mare, al bar...), i ritratti dei personaggi felici
  // (ritagliati dalle loro figure) e la cornice col vetro sopra. ids = i personaggi, in ordine
  creaFoto(ids) {
    const b = BORDO_FOTO, tipi = Phaser.Utils.Array.Shuffle([...TIPI_FOTO]);
    let n = 0;
    FOTO.forEach((f, i) => {
      const iw = f.w - 2 * b, ih = f.h - 2 * b, x0 = f.x - f.w / 2, y0 = f.y - f.h / 2, kf = `fotoSpina${i}_f`, kc = `fotoSpina${i}_c`;
      tela(this, kf, iw, ih, (c) => fondoFoto(c, iw, ih, tipi[i % tipi.length]));
      tela(this, kc, f.w + 2, f.h + 6, (c) => { c.translate(0, 3.5); cornice(c, f.w, f.h); });
      this.texture.push(kf, kc);
      im(this, x0 + b, y0 + b, kf).setOrigin(0);
      for (let k = 0; k < f.n; k++) this.ritrattoInFoto(ids[n++ % ids.length], x0 + b, y0 + b, iw, ih, (k + 0.5) / f.n, f.n);
      im(this, x0, y0 - 3.5, kc).setOrigin(0);
    });
  }

  // un ritratto dentro una foto (x0, y0, w, h = la parte interna): testa e spalle di un personaggio
  // felice, centrato a u (frazione della larghezza), tagliato al bordo della foto. n = quanti nella foto
  ritrattoInFoto(id, x0, y0, w, h, u, n) {
    const key = `${id}_felice`, d = DENS[key], st = PERSONAGGI[id]?.statura ?? 1;
    // la testa nella figura (96x144 unità): alta 96 per la statura, col centro a 142 - 91 x statura
    // (come in ritratto(), in js/sprites.js: chi è più basso ha la testa più giù)
    const k = (h * (n === 1 ? 0.78 : 0.66)) / (96 * st);
    const ix = x0 + w * u - 48 * k, iy = y0 + h * (n === 1 ? 0.45 : 0.5) - (142 - 91 * st) * k;
    const cl = Math.max(0, (x0 - ix) / k), ct = Math.max(0, (y0 - iy) / k);
    const cr = Math.min(96, (x0 + w - ix) / k), cb = Math.min(144, (y0 + h - iy) / k);
    return this.add.image(ix, iy, key).setOrigin(0).setScale(k / d).setCrop(cl * d, ct * d, (cr - cl) * d, (cb - ct) * d);
  }

  // In piedi ai lati del bancone: gli avventori con la pinta (due pose: la tengono, e brindano
  // alzandola) e lo Zere con la vuvuzela (in più le due pose della suonata: la porta alla bocca
  // prendendo fiato, e soffia a guance rosse)
  creaGente(ids) {
    this.avventori = AVVENTORI.map((a, i) => {
      const k = `avventoreSpina${i}`;
      preparaPosa(this, k + '_a', ids[i], 'normale', { posa: 'spritz', accessorio: 'birra' });
      preparaPosa(this, k + '_b', ids[i], 'felice', { posa: 'felice', accessorio: 'birra' });
      this.texture.push(k + '_a', k + '_b');
      const s = im(this, a.x, Y_PIEDI, k + '_a', K_AVVENTORE).setOrigin(0.5, 1).setDepth(19).setFlipX(a.giro);
      s.chiave = k;
      this.tweens.add({ targets: s, y: Y_PIEDI - 2, duration: 640 + i * 170, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: s, angle: { from: -1.6, to: 1.6 }, duration: 1300 + i * 230, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      return s;
    });
    preparaPosa(this, 'zere_carica', 'zere', 'normale', { posa: 'vuvuzela' }, undefined, { gote: 0.35 });
    preparaPosa(this, 'zere_suona', 'zere', 'fischia', { posa: 'vuvuzela' }, undefined, { gote: 1 });
    this.texture.push('zere_carica', 'zere_suona');
    this.zere = im(this, X_ZERE, Y_PIEDI, 'zere_normale', K_ZERE).setOrigin(0.5, 1).setDepth(21).setFlipX(true);
    this.kZere = this.zere.scaleX;
    this.tweens.add({ targets: this.zere, y: Y_PIEDI - 2.5, duration: 560, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // bicchiere = contenitore con birra (ritagliata in base al livello), schiuma, zona verde e vetro;
  // il tipo cambia la forma (boccale largo, calice stretto)
  creaBicchiere(x, tipo, zona) {
    const birra = im(this, 0, 1, 'pintaBirra').setOrigin(0.5, 1).setVisible(false);
    const schiuma = im(this, 0, 0, 'pintaSchiuma').setOrigin(0.5, 0).setVisible(false);
    const segni = this.add.graphics();
    const vetro = im(this, 0, 1, 'pintaVetro').setOrigin(0.5, 1);
    const b = this.add.container(x, Y_BANCONE, [birra, schiuma, segni, vetro]).setDepth(13);
    const forma = this.cfg.bicchieri[tipo];
    b.setScale(forma.largo, forma.alto);
    Object.assign(b, { birra, schiuma, segni, tipo });
    if (zona) this.disegnaZona(b, zona, 0);
    return b;
  }

  // la zona verde (spostata di "dy" mentre lo Zere suona) e il suo centro, per la PERFETTA
  disegnaZona(b, zona, dy) {
    const g = b.segni, y1 = -3 - (zona[1] + dy) * CAVO, y0 = -3 - (zona[0] + dy) * CAVO, mezzo = (y0 + y1) / 2, perf = (y0 - y1) * this.cfg.perfetta / 2;
    g.clear();
    g.fillStyle(0x3bff6a, 0.32); g.fillRect(-10.5, y1, 21, y0 - y1);
    g.fillStyle(0xfff36a, 0.45); g.fillRect(-10.5, mezzo - perf, 21, perf * 2);
    g.fillStyle(0x3bff6a, 1);
    for (const y of [y1, y0]) { g.fillRect(-10.5, y - 0.4, 21, 0.8); g.fillTriangle(-19, y - 2.5, -19, y + 2.5, -14, y); g.fillTriangle(19, y - 2.5, 19, y + 2.5, 14, y); }
  }

  riempi(b, livello) {
    const L = Phaser.Math.Clamp(livello, 0, 1), yTop = 46 - L * CAVO, s = scalaDi('pintaSchiuma');
    b.birra.setVisible(L > 0.01).setCrop(0, yTop * 6, 180, (50 - yTop) * 6);
    b.schiuma.setVisible(L > 0.03).setPosition(0, -3 - L * CAVO - 2.5).setScale((s * lerp(8, 11, L)) / 11, s * Math.min(1, L * 7));
  }

  // il prossimo bicchiere: tipo, ampiezza e altezza della zona verde e velocità della birra vengono
  // dall'atto in cui arriva (e restano quelli finché non lo servi)
  nuovoBicchiere() {
    const c = this.cfg, F = this.fase;
    this.bicchiere?.destroy();
    const r = this.rnd(), tipo = r < F.calice ? 'calice' : r < F.calice + F.boccale ? 'boccale' : 'pinta';
    const forma = c.bicchieri[tipo];
    const amp = F.zona * forma.zona;
    const centro = lerp(F.altezza[0], F.altezza[1], this.rnd());
    this.zona = [centro - amp / 2, centro + amp / 2];
    this.vel = F.vel * forma.vel;
    this.tipo = tipo;
    this.livello = 0;
    this.stato = 'pronto';
    this.armato = false; // bisogna rilasciare SPAZIO prima di ricominciare
    this.bicchiere = this.creaBicchiere(X_MIO - 40, tipo, this.zona);
    this.bicchiere.alpha = 0;
    this.tweens.add({ targets: this.bicchiere, x: X_MIO, alpha: 1, duration: 120, ease: 'Quad.out' });
    this.ordine.setText(`${NOMI[tipo]}  +${forma.punti}`).setColor(tipo === 'calice' ? '#ff9ad8' : tipo === 'boccale' ? '#ffe14a' : '#ffffff');
    colpetto(this, this.ordine, 1.2, 1.2);
  }

  aggiornaContatore() {
    const beppe = this.pinteBeppe * this.cfg.puntiBeppe;
    this.contatore.setText(`TU: ${this.punti}  -  BEPPE: ${beppe}`);
    this.contatore.setColor(this.punti > beppe ? '#7dff9a' : this.punti < beppe ? '#ff9a8a' : '#ffffff');
  }

  aggiorna(dt) {
    const c = this.cfg, F = this.fase, giu = this.spazio.isDown || this.premuti.size > 0;
    this.spilla?.setScale(giu ? 0.9 : 1).setAlpha(giu ? 1 : 0.85);

    // gli atti: l'annuncio, e sotto cosa cambia
    const atto = this.atti.indexOf(F);
    if (atto !== this.atto) {
      this.atto = atto;
      Audio.sfx('bonus');
      scritta(this, 240, 124, F.nome, { size: 14, color: '#ffe14a', durata: 1100 });
      if (F.sotto) scritta(this, 240, 143, F.sotto, { size: 8, color: '#ffffff', durata: 1600 });
      if (F.vuvuzela) {
        this.tZere = c.primaVuvuzela;
        this.fumettoZere('Ora suono io!', 1200);
      }
    }

    // lo Zere e la vuvuzela: mentre suona la zona verde balla su e giù, il bicchiere (e chi spilla)
    // trema, e dalla campana partono le onde verso il bicchiere
    if (F.vuvuzela) this.aggiornaZere(dt);
    let dy = 0;
    if (this.soffio > 0) {
      this.soffio = Math.max(0, this.soffio - dt);
      const t = this.trascorso, forza = Math.min(1, (c.suonata - this.soffio) / 0.15, this.soffio / 0.2);
      dy = Math.sin(t * 13) * c.ballaZona * forza;
      if (this.stato !== 'attesa') this.bicchiere?.setX(X_MIO + Math.sin(t * 47) * 1.4 * forza);
      this.io.setX(X_IO + Math.sin(t * 41) * 1.1 * forza);
      this.zere.setX(X_ZERE + Math.sin(t * 63) * 0.7);
      this.tOnda -= dt;
      if (this.tOnda <= 0) { this.tOnda = 0.13; this.onda(); }
      if (this.soffio === 0) { this.io.setX(X_IO); this.zere.setX(X_ZERE); if (this.stato !== 'attesa') this.bicchiere?.setX(X_MIO); }
    }
    this.dyZona = dy;
    if (this.bicchiere && this.stato !== 'attesa') this.disegnaZona(this.bicchiere, this.zona, dy);

    // --- il mio bicchiere ---
    if (this.stato === 'pronto') {
      if (!giu) this.armato = true;
      else if (this.armato) { this.stato = 'versa'; Audio.versaInizio(); }
    } else if (this.stato === 'versa') {
      this.livello += this.vel * dt;
      Audio.versaLivello(this.livello);
      if (this.livello >= 1) this.valuta(true);
      else if (!giu) this.valuta(false);
    }
    const verso = this.stato === 'versa';
    this.getto.setVisible(verso);
    if (verso) {
      const alto = c.bicchieri[this.tipo].alto;
      this.getto.setSize(3, Math.max(1, Y_BANCONE - 3 - this.livello * CAVO * alto - Y_BECCO));
      this.riempi(this.bicchiere, this.livello);
    }

    // --- Beppe: la sua forma del giorno, e ogni pinta un po' diversa (ogni tanto gli trabocca) ---
    this.tBeppe += dt;
    const f = this.tBeppe / (F.beppe * this.kBeppe);
    const livB = Math.min(this.buttaBeppe ? 1 : 0.82, f * 1.05);
    this.riempi(this.bicchiereBeppe, livB);
    this.gettoBeppe.setVisible(livB < 0.82 && f > 0.05);
    this.gettoBeppe.setSize(3, Math.max(1, Y_BANCONE - 3 - livB * CAVO - Y_BECCO));
    if (f >= 1) {
      this.tBeppe = 0;
      const g = this.bicchiereBeppe;
      this.bicchiereBeppe = this.creaBicchiere(X_BEPPE, 'pinta');
      if (this.buttaBeppe) {
        // traboccata: la butta via, niente punti
        scritta(this, X_BEPPE, Y_ESITO, 'TRABOCCA!', { size: 9, color: '#ff9a8a', durata: 500 });
        this.tweens.add({ targets: g, alpha: 0, y: g.y + 6, duration: 300, onComplete: () => g.destroy() });
        this.faccinaBeppe('triste', 700);
      } else {
        this.pinteBeppe++;
        this.servi(g, 270, false);
        this.aggiornaContatore();
      }
      this.pintaBeppe();
    }

    // occhiata di sufficienza (non mentre lo Zere suona: lì Beppe se la ride)
    this.tOcchiata -= dt;
    if (this.tOcchiata <= 0 && this.statoZere === 'tifo') {
      this.tOcchiata = 6 + Math.random() * 5;
      this.faccinaBeppe('sufficienza', 1300);
      Audio.sfx('tsk');
      this.fumetto(this.beppe.x - 56, 92, caso(c.frasiBeppe), 1300);
    }

    // chiacchiere dei clienti
    this.tChiacchiere -= dt;
    if (this.tChiacchiere <= 0) {
      this.tChiacchiere = 1.6 + Math.random() * 1.6;
      const s = caso(this.clienti);
      s.setTexture(`clienteSpina${s.idx}_1`);
      this.fumetto(s.x + 8, 190, caso(c.frasiClienti), 1000);
      this.time.delayedCall(700, () => s.setTexture(`clienteSpina${s.idx}_0`));
    }
    // ...e gli avventori in piedi, che ogni tanto brindano
    this.tAvventori -= dt;
    if (this.tAvventori <= 0) {
      this.tAvventori = 2.2 + Math.random() * 2.4;
      const s = caso(this.avventori);
      this.brinda(s, 900);
      if (Math.random() < 0.4) this.fumetto(Phaser.Math.Clamp(s.x, 34, 446), 196, caso(c.frasiClienti), 1000);
    }
  }

  // lo Zere nel terzo atto: fa il tifo, poi alza la vuvuzela e prende fiato (il preavviso), poi la
  // suona per "suonata" secondi (intanto la zona balla: vedi aggiorna), poi di nuovo il tifo
  aggiornaZere(dt) {
    const c = this.cfg, z = this.zere;
    this.tZere -= dt;
    if (this.tZere > 0) return;
    if (this.statoZere === 'tifo') {
      this.statoZere = 'carica';
      this.tZere = c.preavviso;
      this.tFacciaZere?.remove();
      z.setTexture('zere_carica');
      this.fiato = this.tweens.add({ targets: z, scaleY: this.kZere * 1.06, duration: c.preavviso * 1000, ease: 'Quad.in' });   // prende fiato
      const t = txt(this, X_ZERE - 12, 172, '!', { size: 16, color: '#ffe14a', depth: 31 }).setScale(0.3);
      this.tweens.add({ targets: t, scale: 1, duration: 160, ease: 'Back.out' });
      this.time.delayedCall(c.preavviso * 1000, () => t.destroy());
    } else if (this.statoZere === 'carica') {
      this.statoZere = 'suona';
      this.tZere = c.suonata;
      this.soffio = c.suonata;
      this.tOnda = 0;
      this.fiato?.stop();
      z.setTexture('zere_suona').setScale(this.kZere);
      Audio.sfx('vuvuzela');
      vibra(60);
      scritta(this, X_ZERE - 52, 172, 'VUUUUU!', { size: 12, color: '#8cc4ff', durata: c.suonata * 700 });
      // Beppe se la ride (a volte lo incita), e la gente in piedi fa il tifo
      this.faccinaBeppe('felice', c.suonata * 1000);
      if (this.rndZere() < 0.5) this.fumetto(this.beppe.x - 56, 92, caso(c.frasiBeppeZere), 1100);
      for (const s of this.avventori) this.brinda(s, c.suonata * 1000);
    } else {
      this.statoZere = 'tifo';
      this.tZere = c.vuvuzelaOgni[0] + this.rndZere() * (c.vuvuzelaOgni[1] - c.vuvuzelaOgni[0]);
      z.setTexture('zere_normale');
    }
  }

  // un'onda del suono: parte dalla campana della vuvuzela e vola verso il mio bicchiere, allargandosi
  onda() {
    const z = this.zere, bx = z.x + (CAMPANA[0] - 48) * K_ZERE, by = z.y - (144 - CAMPANA[1]) * K_ZERE;
    const tx = X_MIO + 16, ty = Y_BANCONE - 28, a = Math.atan2(ty - by, tx - bx);
    const g = this.add.graphics().setDepth(25).setPosition(bx, by).setRotation(a);
    g.lineStyle(3.2, 0x1f1430, 0.45); g.beginPath(); g.arc(0, 0, 7, -0.8, 0.8); g.strokePath();
    g.lineStyle(1.8, 0x8cc4ff, 1); g.beginPath(); g.arc(0, 0, 7, -0.8, 0.8); g.strokePath();
    this.tweens.add({ targets: g, x: tx, y: ty, scale: 2.3, alpha: { from: 1, to: 0.2 }, duration: 520, ease: 'Quad.in', onComplete: () => g.destroy() });
  }

  // un avventore alza la pinta (brinda, fa il tifo) per ms millisecondi
  brinda(s, ms) {
    s.setTexture(s.chiave + '_b');
    s.tBrindisi?.remove();
    s.tBrindisi = this.time.delayedCall(ms, () => s.setTexture(s.chiave + '_a'));
  }

  // lo Zere fa il tifo per una PERFETTA (nei primi atti con un colpetto di vuvuzela)
  tifoZere() {
    if (this.statoZere !== 'tifo') return;
    this.zere.setTexture('zere_felice');
    if (!this.fase.vuvuzela) this.time.delayedCall(420, () => Audio.sfx('vuvuzelina'));
    if (Math.random() < 0.35) this.fumettoZere(caso(this.cfg.frasiZere), 900);
    this.tFacciaZere?.remove();
    this.tFacciaZere = this.time.delayedCall(800, () => { if (this.statoZere === 'tifo') this.zere.setTexture('zere_normale'); });
  }

  // la prossima pinta di Beppe: quanto ci mette (in proporzione) e se gli trabocca
  pintaBeppe() {
    const c = this.cfg;
    this.kBeppe = this.formaBeppe * (1 + (this.rndBeppe() * 2 - 1) * c.variaBeppe);
    this.buttaBeppe = this.rndBeppe() < c.sbagliaBeppe;
  }

  valuta(traboccata) {
    const c = this.cfg, dy = this.dyZona ?? 0, a = this.zona[0] + dy, b = this.zona[1] + dy, g = this.bicchiere, forma = c.bicchieri[this.tipo];
    Audio.versaFine();
    this.getto.setVisible(false);
    this.riempi(g, this.livello);
    g.segni.setVisible(false);
    this.bicchiere = null;

    if (!traboccata && this.livello >= a && this.livello <= b) {
      // buona: scivola fino al cliente. Al centro della zona: PERFETTA
      const perfetta = Math.abs(this.livello - (a + b) / 2) <= ((b - a) / 2) * c.perfetta;
      const guadagno = forma.punti + (perfetta ? c.bonusPerfetta : 0);
      this.stato = 'attesa';
      this.pinte++;
      if (perfetta) this.perfette++;
      this.punti += guadagno;
      Audio.sfx('scivola');
      this.time.delayedCall(260, () => Audio.sfx(perfetta ? 'bonus' : 'ding'));
      scritta(this, X_MIO, Y_ESITO, perfetta ? `PERFETTA! +${guadagno}` : `BUONA +${guadagno}`, { size: 10, color: perfetta ? '#ffe14a' : '#7dff9a', durata: 400 });
      if (perfetta) { stelle(this, X_MIO, Y_BANCONE - 40, 6, 15); this.tifoZere(); }
      this.faccia('felice', 500);
      colpetto(this, this.contatore, 1.15, 1.15);
      this.aggiornaContatore();
      this.servi(g, 210, true);
      this.time.delayedCall(this.fase.pausa * 1000, () => this.nuovoBicchiere());
      return;
    }

    this.stato = 'errore';
    Audio.sfx('errore');
    vibra(50);
    this.faccia('shock', c.penalita * 1000 - 100);
    scuoti(this, 120, 0.006);
    if (this.livello < a) {
      // troppo poca: il cliente la rimanda indietro
      scritta(this, X_MIO, Y_ESITO, 'TROPPO POCA!', { size: 10, color: '#ff9a8a' });
      this.fumetto(218, 190, 'È mezza vuota!', 1000);
      this.tweens.add({ targets: g, x: 205, duration: 300, ease: 'Cubic.out', yoyo: true, hold: 250, onComplete: () => g.destroy() });
    } else {
      // troppa: la schiuma trabocca sul bancone
      scritta(this, X_MIO, Y_ESITO, 'TRABOCCA!', { size: 10, color: '#ff9a8a' });
      Audio.sfx('splash');
      fumo(this, X_MIO, Y_BANCONE - 46, 6, 14, 0xfffbe8);
      for (let i = 0; i < 12; i++) {
        const d = this.add.ellipse(X_MIO + (Math.random() - 0.5) * 24, Y_BANCONE - 46, 4, 3.4, 0xfffbe8).setDepth(14);
        this.tweens.add({ targets: d, x: d.x + (Math.random() - 0.5) * 50, y: Y_BANCONE + 2, duration: 350 + Math.random() * 250, ease: 'Bounce.out', onComplete: () => this.tweens.add({ targets: d, alpha: 0, delay: 400, duration: 200, onComplete: () => d.destroy() }) });
      }
      this.tweens.add({ targets: g, alpha: 0, delay: 700, duration: 250, onComplete: () => g.destroy() });
    }
    this.time.delayedCall(c.penalita * 1000, () => this.nuovoBicchiere());
  }

  // il bicchiere scivola sul bancone fino al cliente, che se lo prende
  servi(g, xArrivo, mio) {
    this.tweens.add({
      targets: g, x: xArrivo, duration: 300, ease: 'Cubic.out',
      onComplete: () => {
        if (mio) stelle(this, xArrivo, Y_BANCONE - 24, 6, 15);
        this.tweens.add({ targets: g, y: g.y + 26, alpha: 0, delay: 120, duration: 200, onComplete: () => g.destroy() });
      },
    });
  }

  faccia(espr, ms) {
    this.io.setTexture(`${this.giocatore.id}_${espr}`);
    this.tFaccia?.remove();
    this.tFaccia = this.time.delayedCall(ms, () => this.io.setTexture(this.giocatore.id + '_normale'));
  }

  // la faccia di Beppe per un po' (poi torna normale; una nuova prende il posto di quella di prima)
  faccinaBeppe(espr, ms) {
    this.beppe.setTexture('beppe_' + espr);
    this.tBeppeFaccia?.remove();
    this.tBeppeFaccia = this.time.delayedCall(ms, () => this.beppe.setTexture('beppe_normale'));
  }

  fumetto(x, y, s, ms) {
    const t = txt(this, 0, 0, s, { size: 7, color: '#1f1430', thick: 0 });
    const w = t.width + 8, h = 13;
    const g = this.add.graphics();
    g.fillStyle(0x1f1430, 1); g.fillRoundedRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2, 6);
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 5); g.fillTriangle(-4, h / 2 - 0.5, 3, h / 2 - 0.5, -3, h / 2 + 4.5);
    const b = this.add.container(x, y, [g, t]).setDepth(30).setScale(0.3);
    this.tweens.add({ targets: b, scale: 1, duration: 140, ease: 'Back.out' });
    this.time.delayedCall(ms, () => b.destroy());
    return b;
  }

  // il fumetto dello Zere: uno alla volta (il nuovo prende il posto di quello di prima, se no si
  // sovrappongono: stanno nello stesso punto)
  fumettoZere(s, ms) {
    this.fumZere?.destroy();
    this.fumZere = this.fumetto(X_ZERE - 14, 174, s, ms);
  }

  risultato() {
    // il punteggio è la sfida con Beppe: a pari punti con lui vale puntiPari (il bronzo), e poi
    // quanto lo batti (o quanto ti batte). Così "fai più punti di Beppe" è proprio il bronzo, anche
    // se Beppe un giorno va più forte e un altro più piano
    const c = this.cfg, beppe = this.pinteBeppe * c.puntiBeppe, scarto = this.punti - beppe;
    return {
      punteggio: Math.max(0, c.puntiPari + scarto),
      vittoria: this.punti >= beppe,
      riepilogo: `${quanti(this.pinte, 'bicchiere', 'bicchieri')} (${quanti(this.perfette, 'perfetto', 'perfetti')}): tu ${this.punti}, Beppe ${beppe} (${scarto >= 0 ? '+' : ''}${scarto})`,
    };
  }
}
