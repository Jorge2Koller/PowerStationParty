// Microgioco 22: "Capitan Ghiori" - il gommone di Giorgio non parte. TIRA!
//
//  Il golfo di Baratti in una giornata grigia (js/grafica/baratti.js): acqua bassa e calma, i barchini
//  ormeggiati alle boe, i pali, la riva di ciottoli. Giorgio, vestito da marinaio (il cappello bianco
//  con l'ancora, la casacca col colletto blu), è a poppa del Danda 2: l'avviamento elettrico è morto
//  ("La batteria è a terra!") e il fuoribordo va fatto partire con la cordicella, in piedi, col piede
//  sul motore. Chi gioca è seduto a prua e lo incita. Dal secondo atto, nell'acqua bassa vicino ai
//  motori delle barche ormeggiate, nuota Greg, terrorizzato (ha la submechanophobia): quando il motore
//  del Danda parte scappa via velocissimo. Se gioca Greg, in acqua c'è il suo doppione.
//  Un solo comando: SPAZIO, il clic o un tocco ovunque (anche con due dita). Contano al massimo
//  premuteAlSecondo pressioni al secondo: vince il ritmo, non il dito più veloce.
//  - CARICA ("TIRA!"): ogni pressione è uno strappo e la barra dei GIRI sale; se rallenti scende da
//    sola. A ogni strappo il motore tossisce ("brum... prff") e Giorgio tira con tutto il corpo.
//  - STRAPPO FINALE ("ORA!"): a barra piena compare il contagiri con la lancetta che va avanti e
//    indietro e la zona verde che lampeggia. Conta UN colpo: nella zona verde il motore parte (al
//    centro: PERFETTO!), il gommone fa qualche metro tra i barchini, poi "puf puf" e si ricomincia;
//    fuori dalla zona il motore muore, Giorgio si dispera e la barra torna a metà. Se non premi, dopo
//    un po' la lancetta sparisce e la barra si scarica.
//  Tre atti: SI PARTE! (la barra sale svelta, zona larga); INGOLFATO! (fumo nero, la barra sale più
//  piano e scende più svelta, zona più stretta); ARRIVA LA BURRASCA! (le onde fanno ondeggiare il
//  gommone, la zona verde si sposta, la lancetta corre; Greg, in acqua, è ancora più agitato).
//  In Lampo (15 secondi) solo lo strappo puro: a barra piena il motore parte da solo.
//  Punti: +10 a partenza, +5 se PERFETTO, +1 a metro. Vittoria: la boa rossa in fondo al golfo.
//  Memoria: le pose di Giorgio e di chi gioca, il gommone, i barchini (pochi tipi, ricolorati), la
//  riva e lo sfondo sono texture piccole create qui e buttate alla fine.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { RES, casuale, tela } from '../grafica/base.js';
import { PERSONAGGI } from '../grafica/personaggi.js';
import { sfondoBaratti, rivaBaratti, gommoneDietro, gommoneDavanti, barchino, GOMMONE, BARCHINO } from '../grafica/baratti.js';
import { preparaPosa } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumo, fumetto, caso, eTouch, vibra, multiTouch, puntiHud, quanti, scuoti } from '../fx.js';

// dove sta il gommone: il punto della sua texture che sta sul pelo dell'acqua, a metà (lì gira quando
// ondeggia), e dove sta sullo schermo
const PERNO = { x: GOMMONE.w / 2, y: GOMMONE.acqua };
const BARCA = { x: 110 + PERNO.x, y: 110 + PERNO.y };         // (la texture comincia a x 110, y 110)
const ACQUA = BARCA.y;                                          // il pelo dell'acqua, vicino a riva
// Giorgio a poppa (i piedi sul ponte) e chi gioca seduto a prua (la vita sul tubolare), in coordinate
// della texture del gommone; taglie come negli altri microgiochi
const GIORGIO = { x: 48, piedi: GOMMONE.ponte - 4, taglia: 0.62 };   // (sul gradino di poppa: il piede sul motore si vede)
const IO = { x: 206, vita: GOMMONE.ponte - 4, taglia: 0.6 };
const METRO = 9;                  // unità dello schermo per metro (lo scorrimento)
const DENS_POSE = RES * 0.66;     // le pose: la densità che serve a quella taglia
const CONTAGIRI = { x: 240, y: 88, r: 40 };
const GIRI = { x: 12, y: 64, w: 14, h: 140 };
// Giorgio da marinaio: il cappello bianco tondo con l'ancora blu, la casacca bianca col colletto alla
// marinara blu navy a due righe, il fazzoletto e i polsini blu, i pantaloni bianchi (il viso e i capelli
// restano i suoi); la fatica cresce con gli atti
const NAVY = '#22305e';
const MARINAIO = {
  cappello: { tipo: 'marinaio', colore: '#f6f6f2', ancora: NAVY },
  vestito: { tipo: 'marinaio', colore: '#f7f7f3', collo: NAVY, righe: '#ffffff' }, pantaloni: '#efefe9',
};
// Greg in acqua: dove nuota (la sua "casa": vicino ai motori delle barche ormeggiate, a destra della
// prua), quanto è grande e quanto si vede di lui fuori dall'acqua (dal petto in su: la frazione della
// figura, dall'alto)
const GREG = { x: 420, y: 197, taglia: 0.44, vis: 0.72, giu: 0.16 };
const FATICA = [{}, { sudore: true, gote: 0.55 }, { sudore: true, gote: 0.9, paonazzo: 0.75 }];
const PIEDE = { calcio: { lato: -1, angolo: 0.95 } };             // il piede appoggiato al motore
// i barchini ormeggiati: tipo, colore (tinta; banda = la fascia rossa del barchino rosso e bianco)
const BARCHINI = [['barchino', 0xffffff], ['motoscafo', 0xffffff], ['barchinoRosso', 0xffffff], ['barchino', 0x7ab0ff], ['gozzo', 0xe8dcc0], ['motoscafo', 0xffffff], ['barchino', 0xffffff], ['gozzo', 0xd8e4ea]];
const statura = (id) => PERSONAGGI[id.replace(DOPPIONE, '')]?.statura ?? 1;
const origineVita = (id) => (284 - 44 * statura(id)) / 288;     // la vita, nella figura 96x144

export class BarattiScene extends MicrogiocoBase {
  constructor() { super('baratti'); }

  get atto() { return this.atti.filter((a) => this.trascorso >= a.da).pop(); }

  prepara() {
    const c = this.cfg;
    this.lampo = Sessione.tipo === 'lampo';
    this.atti = c.atti.map((a) => ({ ...a, da: this.lampo ? a.daLampo : a.da }));
    this.rnd = casuale(Sessione.seme);
    this.boa = this.lampo ? c.boaLampo : c.boa;
    this.metriBoa = this.boa * c.metri;
    this.punti = 0; this.totale = 0; this.partenze = 0; this.perfetti = 0; this.metri = 0; this.arrivato = false;
    this.giri = 0;
    this.stato = 'carica';      // 'carica', 'lancetta', 'corsa', 'puf', 'sbagliato'
    this.tStato = 0;
    this.ultimaPremuta = -1e9;
    this.strappi = 0;
    this.nAtto = -1;
    this.creati = [];
    // chi è a prua e chi è Greg in acqua: di solito chi gioca e Greg; se chi gioca è Greg ("contro se
    // stesso"), a prua c'è lui e in acqua il suo doppione
    const io = this.giocatore.id, base = io.replace(DOPPIONE, '');
    this.gregDoppione = base === 'greg' && io !== base;
    this.idPrua = this.gregDoppione ? base : io;

    this.creaTexture();
    im(this, 0, 0, 'barattiSfondo').setOrigin(0).setDepth(0);
    this.onde = this.add.graphics().setDepth(4);
    this.creaBarchini();
    // la riva di ciottoli, in primo piano: scorre più svelta del resto (è più vicina)
    const dR = 2;
    this.riva = this.add.tileSprite(0, 234, 480 * dR, 40 * dR, 'barattiRiva').setOrigin(0).setScale(1 / dR).setDepth(40);
    this.creaGommone();
    this.creaGreg();
    this.scia = this.add.graphics().setDepth(18);
    this.velo = this.add.graphics().setDepth(26);   // l'acqua davanti allo scafo (si vede sotto, un po')
    this.disegnaVelo();
    this.hudBarca();
    this.disponiBoa();

    // un solo comando: SPAZIO, clic o tocco (anche con due dita)
    multiTouch(this, 2);
    this.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) this.premi(); });
    this.input.on('pointerdown', () => this.premi());
    this.posaGiorgio('impugna');
  }

  // ---------- le texture (create qui, buttate alla fine) ----------
  creaTexture() {
    const T = (k, w, h, fn, d) => { tela(this, k, w, h, fn, d); this.creati.push(k); };
    T('barattiSfondo', 480, 270, sfondoBaratti, 1.5);
    T('barattiRiva', 160, 40, rivaBaratti, 2);
    const dG = RES * 0.7;
    T('gommoneDietro', GOMMONE.w, GOMMONE.h, gommoneDietro, dG);
    T('gommoneDavanti', GOMMONE.w, GOMMONE.h, gommoneDavanti, dG);
    for (const [k, tipo, banda] of [['barchino', 'barchino'], ['motoscafo', 'motoscafo'], ['gozzo', 'gozzo'], ['barchinoRosso', 'barchino', '#d8263a']]) T('bar_' + k, BARCHINO.w, BARCHINO.h, (cc) => barchino(cc, tipo, banda), 2);
    // Giorgio da marinaio, nelle sue pose (impugna e strappa a tre livelli di fatica)
    const G = (k, espr, o, altro = {}) => { preparaPosa(this, k, 'giorgio', espr, o, DENS_POSE, { ...MARINAIO, ...altro }); this.creati.push(k); };
    FATICA.forEach((f, i) => {
      G('capImpugna' + i, 'normale', { posa: 'impugna', ...PIEDE }, f);
      G('capStrappo' + i, 'urlo', { posa: 'strappo', ...PIEDE }, f);
    });
    G('capFelice', 'felice', {}, FATICA[1]);
    G('capSeduto', 'triste', {}, FATICA[1]);
    G('capDispera', 'shock', { posa: 'maniInTesta', maniSopra: true }, FATICA[2]);
    G('capVolante', 'felice', { posa: 'porta' }, { cappello: null });
    const pelle = PERSONAGGI.giorgio.pelle;
    G('capSpinge', 'triste', { posa: 'spinge' }, { ...FATICA[2], arrotolati: true, scarpe: pelle });
    // chi gioca, a prua: che incita coi pugni (le altre facce sono quelle che ci sono già)
    const base = this.idPrua.replace(DOPPIONE, ''), trav = (id) => (id !== base ? { travestimento: true } : {});
    preparaPosa(this, 'ioIncita', base, 'felice', { posa: 'rabbia' }, DENS_POSE, trav(this.idPrua));
    this.creati.push('ioIncita');
    // Greg in acqua, con gli occhialini da nuoto sulla fronte: che nuota terrorizzato e che scappa
    // urlando (se gioca Greg, è il suo doppione)
    const trG = this.gregDoppione ? { travestimento: true } : {};
    for (const [k, espr, o] of [['gregNuota', 'shock', { posa: 'nuota' }], ['gregScappa', 'urlo', { posa: 'mossaSu' }]]) {
      preparaPosa(this, k, 'greg', espr, o, RES * 0.5, { occhialini: '#38b6e8', ...trG });
      this.creati.push(k);
    }
  }

  pulisci() {
    // prima le immagini, poi le texture create qui
    this.barca?.destroy(true);
    for (const b of this.barchini ?? []) b.c.destroy(true);
    this.riva?.destroy();
    for (const k of this.creati ?? []) if (this.textures.exists(k)) this.textures.remove(k);
  }

  // ---------- la scena ----------
  // i barchini ormeggiati alle boe, i pali di legno: a tre distanze (i più lontani più piccoli e più
  // lenti a scorrere). Quando escono a sinistra rientrano a destra
  creaBarchini() {
    this.barchini = [];
    const PIANI = [{ y: 146, k: 0.42, v: 0.45 }, { y: 160, k: 0.58, v: 0.65 }, { y: 178, k: 0.78, v: 0.85 }];
    for (let i = 0; i < 9; i++) {
      const piano = PIANI[i % 3], [tipo, tinta] = BARCHINI[i % BARCHINI.length];
      const img = im(this, 0, 0, 'bar_' + tipo, piano.k).setOrigin(0.5, BARCHINO.acqua / BARCHINO.h).setTint(tinta).setFlipX(this.rnd() < 0.4);
      const boa = this.add.circle(BARCHINO.w * 0.42 * piano.k, 1, 1.8 * piano.k + 0.6, 0xff8a2a).setStrokeStyle(0.8, 0x2b1b17);
      const c = this.add.container(0, piano.y, [boa, img]).setDepth(5 + i % 3);
      this.barchini.push({ c, img, piano, x0: 10 + i * 62 + this.rnd() * 20, dondola: this.rnd() * 6 });
    }
    // i pali di legno nell'acqua, a mezza strada
    this.pali = [];
    for (let i = 0; i < 5; i++) {
      const g = this.add.graphics().setDepth(9);
      const h = 18 + this.rnd() * 10;
      g.fillStyle(0x5a4632, 1); g.fillRect(-2, -h, 4, h + 4);
      g.fillStyle(0x7a6448, 1); g.fillRect(-2, -h, 1.4, h + 4);
      g.lineStyle(1, 0x2b1b17, 1); g.strokeRect(-2, -h, 4, h + 4);
      g.fillStyle(0xd8263a, 1); g.fillRect(-2, -h, 4, 3);
      g.fillStyle(0x3a4448, 0.35); g.fillRect(-2, 4, 4, 6);    // il riflesso
      this.pali.push({ g, x0: 60 + i * 115 + this.rnd() * 40, y: 192 + this.rnd() * 8 });
    }
  }

  // la boa rossa in fondo al golfo (la vittoria): grande, con la bandierina
  disponiBoa() {
    const g = this.add.graphics().setDepth(12);
    g.fillStyle(0x2b1b17, 1); g.fillRect(-0.8, -28, 1.6, 16);
    g.fillStyle(0xffe14a, 1); g.fillTriangle(0.8, -28, 0.8, -20, 9, -24);
    g.fillStyle(0xd8263a, 1); g.fillEllipse(0, -6, 18, 16);
    g.fillStyle(0xffffff, 0.35); g.fillEllipse(-4, -10, 5, 4);
    g.lineStyle(1.6, 0x2b1b17, 1); g.strokeEllipse(0, -6, 18, 16);
    g.fillStyle(0xffffff, 1); g.fillRect(-9, -6, 18, 2.4);
    g.fillStyle(0x3a4448, 0.35); g.fillEllipse(0, 3, 22, 4);
    this.boaRossa = g;
  }

  // il Danda 2 con Giorgio e chi gioca: un contenitore col perno sul pelo dell'acqua (per ondeggiare)
  creaGommone() {
    const P = PERNO, at = (x, y) => [x - P.x, y - P.y];
    this.barca = this.add.container(BARCA.x, BARCA.y).setDepth(20);
    this.barca.add(im(this, ...at(0, 0), 'gommoneDietro').setOrigin(0));
    // la cordicella del fuoribordo, dalla maniglia alla mano di Giorgio
    this.corda = this.add.graphics();
    this.giorgio = im(this, ...at(GIORGIO.x, GIORGIO.piedi), 'capImpugna0', GIORGIO.taglia).setOrigin(0.5, 1);
    this.io = im(this, ...at(IO.x, IO.vita), this.idPrua + '_normale', IO.taglia).setOrigin(0.5, origineVita(this.idPrua));
    this.barca.add([this.giorgio, this.corda, this.io]);
    this.barca.add(im(this, ...at(0, 0), 'gommoneDavanti').setOrigin(0));
    this.giorgioY = this.giorgio.y;
  }

  // l'acqua davanti alla parte sommersa dello scafo (e delle gambe di Giorgio, quando spinge): solo lì,
  // limpida, appena velata di turchese, coi bordi sfumati; sul pelo dell'acqua la riga chiara della
  // superficie. Segue il gommone
  disegnaVelo() {
    const g = this.velo, x0 = this.barca.x - PERNO.x - 46, x1 = this.barca.x - PERNO.x + GOMMONE.w + 6, y = ACQUA + 3;
    g.clear();
    for (let i = 0; i < 4; i++) {
      const d = 5 * i;
      g.fillStyle(0x3fb3b6, 0.08); g.fillRect(x0 + d, y, x1 - x0 - 2 * d, 40);
      g.fillStyle(0xeafcff, 0.05); g.fillRect(x0 + d, y, x1 - x0 - 2 * d, 3);
      g.lineStyle(1.3, 0xf2feff, 0.2); g.lineBetween(x0 + d, y, x1 - d, y);
    }
  }

  // (non creaHud: quello è della base, col tempo, il nome e la pausa)
  hudBarca() {
    // la barra dei GIRI, a sinistra
    this.gGiri = this.add.graphics().setDepth(1000);
    this.testoGiri = txt(this, GIRI.x + GIRI.w / 2, GIRI.y - 8, 'GIRI', { size: 8, depth: 1001, color: '#fff3d6' });
    // il contagiri dello strappo finale, in alto in mezzo (c'è solo durante lo strappo finale)
    this.gContagiri = this.add.graphics().setDepth(1000).setVisible(false);
    this.testoOra = txt(this, CONTAGIRI.x, CONTAGIRI.y + 14, 'ORA!', { size: 16, color: '#7dff9a', depth: 1001 }).setVisible(false);
    this.testoTira = txt(this, CONTAGIRI.x, CONTAGIRI.y - 16, 'TIRA!', { size: 16, color: '#ffe14a', depth: 1001 });
    this.tweens.add({ targets: this.testoTira, scale: 1.12, duration: 260, yoyo: true, repeat: -1 });
    this.testoBoa = txt(this, 240, 28, '', { size: 8, depth: 1001, color: '#ffffff' });
    this.testoPunti = txt(this, 474, 36, '', { ox: 1, size: 9, depth: 1001 });
    this.testoPartenze = txt(this, 474, 49, '', { ox: 1, size: 8, depth: 1001 });
    this.hud();
  }

  hud() {
    this.testoPunti.setText(puntiHud(this.punti));
    this.testoPartenze.setText(`PARTENZE: ${this.partenze}/${this.boa}`).setColor(this.partenze >= this.boa ? '#7dff9a' : '#ffe14a');
    // quanto manca alla boa rossa (si riscrive solo quando cambia il numero)
    const manca = Math.max(0, Math.ceil(this.metriBoa - this.metri - 1e-6)), s = this.arrivato ? 'BOA ROSSA: PRESA!' : `BOA ROSSA: ${manca} m`;
    if (s !== this.testoBoa.text) this.testoBoa.setText(s).setColor(this.arrivato ? '#7dff9a' : '#ffffff');
  }

  // ---------- il comando ----------
  premi(ora = performance.now()) {
    if (!this.inCorso) return;
    // al massimo premuteAlSecondo pressioni al secondo: quelle in più non contano
    // (l'orologio vero: vale uguale anche su un telefono che va a scatti; le prove simulate passano il loro)
    if (ora - this.ultimaPremuta < 1000 / this.cfg.premuteAlSecondo - 2) return;
    this.ultimaPremuta = ora;
    if (this.stato === 'carica') this.strappa();
    else if (this.stato === 'lancetta') this.colpoFinale();
  }

  // uno strappo alla cordicella: la barra sale, il motore tossisce, Giorgio tira con tutto il corpo
  strappa() {
    const a = this.atto;
    this.giri = Math.min(1, this.giri + a.strappo);
    this.strappi++;
    Audio.sfx('strappo');
    Audio.sfx('brum');
    vibra(18);
    this.posaGiorgio('strappo');
    this.time.delayedCall(170, () => { if (this.stato === 'carica' || this.stato === 'lancetta') this.posaGiorgio('impugna'); });
    this.tweens.killTweensOf(this.giorgio);
    this.giorgio.setAngle(0);
    this.tweens.add({ targets: this.giorgio, angle: 6, duration: 80, yoyo: true });
    // il fumo dallo scarico (nero, nel secondo atto)
    const s = this.puntoBarca(8, 54);
    fumo(this, s.x, s.y, 2, 25, a.fumoNero ? 0x3a3a40 : 0xc8ccd0);
    // chi gioca si agita
    this.posaIo('ioIncita', 180);
    if (this.strappi % 7 === 3) this.frase(caso(this.cfg.frasi), 900);
    if (this.giri >= 1) {
      if (this.lampo) this.parte(false);     // in Lampo parte da solo
      else this.inizioLancetta();
    }
  }

  // ---------- lo strappo finale ----------
  inizioLancetta() {
    const a = this.atto;
    this.stato = 'lancetta';
    this.tStato = 0;
    this.lancetta = 0; this.versoLancetta = 1;
    // dove sta la zona verde (dal seme: la stessa per tutti, alla stessa partenza)
    this.zonaBase = 0.32 + this.rnd() * 0.36;
    this.zonaAmp = a.zona;
    this.gContagiri.setVisible(true);
    this.testoOra.setVisible(true);
    Audio.sfx('bip');
  }

  // dove sta adesso il centro della zona verde (nel terzo atto si sposta avanti e indietro)
  get zonaCentro() {
    const a = this.atto, half = this.zonaAmp / 2;
    return Phaser.Math.Clamp(this.zonaBase + a.sposta * Math.sin(this.tStato * 2.4), half + 0.02, 1 - half - 0.02);
  }

  colpoFinale() {
    const c = this.cfg, centro = this.zonaCentro, half = this.zonaAmp / 2, d = Math.abs(this.lancetta - centro);
    this.fineLancetta();
    if (d <= half) this.parte(d <= half * c.perfetta);
    else this.sbagliato();
  }

  fineLancetta() {
    this.gContagiri.setVisible(false);
    this.testoOra.setVisible(false);
  }

  // il motore parte: ruggito, fumo, il gommone scatta avanti per qualche metro; poi "puf puf"
  parte(perfetto) {
    const c = this.cfg;
    this.stato = 'corsa';
    this.tStato = 0;
    this.partenze++;
    if (perfetto) this.perfetti++;
    this.aggiungi(c.punti + (perfetto ? c.perfetto : 0));
    Audio.sfx('avviamento');
    vibra(80);
    const s = this.puntoBarca(8, 54);
    fumo(this, s.x, s.y, 8, 25, this.atto.fumoNero ? 0x2a2a30 : 0xdde0e3);
    scuoti(this, 160, 0.004);
    scritta(this, BARCA.x, 110, perfetto ? `PERFETTO! +${c.punti + c.perfetto}` : `PARTITO! +${c.punti}`, { size: 12, color: perfetto ? '#ffe14a' : '#7dff9a', durata: 500 });
    if (perfetto) stelle(this, BARCA.x, 120, 8, 1001);
    this.posaGiorgio('felice');
    this.posaIo(this.idPrua + '_felice', c.corsa * 1000 + 200);
    this.frase(caso(c.frasiParte), 800);
    this.spaventaGreg();
    this.daFare = c.metri;          // i metri di questa corsa
    this.giri = 0;
    this.hud();
  }

  // il motore tossisce e muore: Giorgio si dispera (o si siede di colpo sul tubolare), la barra a metà
  sbagliato() {
    const c = this.cfg;
    this.stato = 'sbagliato';
    this.tStato = 0;
    this.giri = c.meta;
    Audio.sfx('muore');
    vibra(60);
    const s = this.puntoBarca(8, 54);
    fumo(this, s.x, s.y, 4, 25, 0x2a2a30);
    scritta(this, BARCA.x, 110, 'NIENTE!', { size: 12, color: '#ff6b5a', durata: 500 });
    if (this.rnd() < 0.5) {
      this.posaGiorgio('dispera');
    } else {
      this.posaGiorgio('seduto');
      this.tweens.add({ targets: this.giorgio, y: this.giorgioY + 16, duration: 90, ease: 'Quad.in' });
      Audio.sfx('tonfo');
    }
    this.posaIo(this.idPrua + '_shock', 700);
    this.frase(caso(c.frasiMuore), 900);
  }

  // i punti: si contano tutti (totale), ma fino alla boa se ne vedono al massimo tettoPrima; quando
  // ci arrivi c'è il totale, e almeno il bronzo (in Lampo le medaglie non contano: i punti e basta)
  aggiungi(v) {
    const c = this.cfg;
    this.totale += v;
    this.punti = this.lampo ? this.totale : this.arrivato ? Math.max(c.medaglie.bronzo, this.totale) : Math.min(c.tettoPrima, this.totale);
  }

  // ---------- pose ----------
  posaGiorgio(nome) {
    const f = Math.min(2, Math.max(0, this.atti.indexOf(this.atto)));
    const key = { impugna: 'capImpugna' + f, strappo: 'capStrappo' + f, felice: 'capFelice', seduto: 'capSeduto', dispera: 'capDispera', volante: 'capVolante', spinge: 'capSpinge' }[nome];
    this.giorgio.setTexture(key).setScale(scalaDi(key, GIORGIO.taglia));
    this.posaG = nome;
    this.disegnaCorda();
  }
  posaIo(key, ms = 0) {
    if (!this.textures.exists(key)) return;
    this.io.setTexture(key).setScale(scalaDi(key, IO.taglia));
    this.tweens.killTweensOf(this.io);
    this.io.y = IO.vita - PERNO.y;
    this.tweens.add({ targets: this.io, y: this.io.y - 3, duration: 90, yoyo: true });
    const giro = (this.giroIo = (this.giroIo ?? 0) + 1);
    if (ms) this.time.delayedCall(ms, () => { if (this.giroIo === giro && !this.finito) this.posaIo(this.idPrua + '_normale'); });
  }

  // la cordicella: dalla maniglia sul motore alla mano di Giorgio (dove sta la mano dipende dalla posa)
  disegnaCorda() {
    const g = this.corda, P = PERNO, k = 0.5 * GIORGIO.taglia;
    g.clear();
    const mano = { impugna: [-78, 234], strappo: [-44, 128] }[this.posaG];
    if (!mano) return;
    const mx = GIORGIO.x + mano[0] * k - P.x, my = GIORGIO.piedi + (mano[1] - 284) * k - P.y, ax = GOMMONE.maniglia.x - P.x, ay = GOMMONE.maniglia.y - P.y;
    g.lineStyle(1.1, 0xf3efe4, 1); g.lineBetween(ax, ay, mx, my);
  }

  // un punto del gommone (coordinate della sua texture) sullo schermo, ondeggiamento compreso
  puntoBarca(x, y) {
    const b = this.barca, a = Phaser.Math.DegToRad(b.angle), dx = x - PERNO.x, dy = y - PERNO.y;
    return { x: b.x + dx * Math.cos(a) - dy * Math.sin(a), y: b.y + dx * Math.sin(a) + dy * Math.cos(a) };
  }

  // una frase di Giorgio, sopra la sua testa (a sinistra del contagiri, dopo la barra dei giri)
  frase(s, ms) {
    this.fumettino?.destroy();
    const p = this.puntoBarca(GIORGIO.x, GIORGIO.piedi - 92);
    this.fumettino = fumetto(this, p.x, Math.max(64, p.y), s, ms, 960);
    const w = (this.fumettino.list[1]?.width ?? 100) + 10;
    this.fumettino.x = Phaser.Math.Clamp(p.x, GIRI.x + GIRI.w + 4 + w / 2, CONTAGIRI.x - CONTAGIRI.r - 8 - w / 2);
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    const c = this.cfg, a = this.atto;
    this.tStato += dt;
    // gli atti si annunciano
    const n = this.atti.indexOf(a);
    if (n !== this.nAtto) {
      this.nAtto = n;
      Audio.sfx(n === 2 ? 'vento' : 'bonus');
      scritta(this, 240, 132, a.nome, { size: 15, color: n === 2 ? '#ff6b5a' : '#ffe14a', durata: 900 });
      if (a.sotto) scritta(this, 240, 150, a.sotto, { size: 8, color: '#fff3d6', durata: 1100 });
      if (this.stato === 'carica') this.posaGiorgio('impugna');
    }
    if (this.stato === 'carica') {
      this.giri = Math.max(0, this.giri - a.cala * dt);
    } else if (this.stato === 'lancetta') {
      // la lancetta va avanti e indietro, a velocità costante
      this.lancetta += this.versoLancetta * a.lancetta * dt;
      if (this.lancetta >= 1) { this.lancetta = 2 - this.lancetta; this.versoLancetta = -1; }
      if (this.lancetta <= 0) { this.lancetta = -this.lancetta; this.versoLancetta = 1; }
      if (this.tStato >= c.tempoLancetta) {
        // niente colpo: la lancetta sparisce e la barra si scarica
        this.fineLancetta();
        this.stato = 'carica';
        Audio.sfx('spento');
      }
    } else if (this.stato === 'corsa') {
      // il gommone fa i suoi metri (più svelto all'inizio), poi il motore si spegne
      const t = Math.min(1, this.tStato / c.corsa), fatti = c.metri * (1 - (1 - t) ** 2), passo = fatti - (c.metri - this.daFare);
      if (passo > 0) { this.daFare -= passo; this.avanza(passo); }
      if (Math.floor(this.tStato / 0.42) !== Math.floor((this.tStato - dt) / 0.42)) Audio.sfx('motoreVa');
      if (t >= 1) {
        this.stato = 'puf';
        this.tStato = 0;
        Audio.sfx('pufpuf');
        const s = this.puntoBarca(8, 54);
        this.time.delayedCall(0, () => fumo(this, s.x, s.y, 2, 25, 0x5a5a60));
        this.time.delayedCall(320, () => fumo(this, s.x, s.y, 2, 25, 0x5a5a60));
      }
    } else if (this.stato === 'puf') {
      if (this.tStato >= c.pausaPuf) { this.stato = 'carica'; this.posaGiorgio('impugna'); }
    } else if (this.stato === 'sbagliato') {
      if (this.tStato >= c.pausaSbagliato) {
        this.stato = 'carica';
        this.tweens.add({ targets: this.giorgio, y: this.giorgioY, duration: 160 });
        this.posaGiorgio('impugna');
      }
    }
    this.muovi(dt);
    this.muoviGreg(dt);
    this.disegnaGiri();
    if (this.stato === 'lancetta') this.disegnaContagiri();
    // TIRA! in alto, dove poi arriva il contagiri dello strappo finale, finché si carica
    this.testoTira.setVisible(this.stato === 'carica');
  }

  // metri fatti: i punti, il cartello della boa (arrivati: almeno il bronzo)
  avanza(m) {
    const c = this.cfg, prima = Math.floor(this.metri);
    this.metri += m;
    const interi = Math.floor(this.metri) - prima;
    if (interi > 0) this.aggiungi(interi * c.puntoMetro);
    if (!this.arrivato && this.metri >= this.metriBoa - 1e-6) {
      this.arrivato = true;
      this.aggiungi(0);
      Audio.sfx('conquista');
      scritta(this, 240, 96, 'LA BOA ROSSA!', { size: 15, color: '#7dff9a', durata: 1000 });
      stelle(this, this.boaRossa.x, this.boaRossa.y - 10, 10, 1001);
    }
    this.hud();
  }

  // lo scorrimento (barchini, pali, riva, boa), le onde, il gommone che ondeggia e la scia
  muovi(dt) {
    const a = this.atto, w = this.metri * METRO, t = this.time.now / 1000, span = 640;
    for (const b of this.barchini) {
      let x = b.x0 - w * b.piano.v;
      while (x < -60) { b.x0 += span; x += span; }
      b.c.x = x;
      b.c.y = b.piano.y + Math.sin(t * 1.3 + b.dondola) * (a.onde ? 1.6 : 0.5);
      b.c.angle = Math.sin(t * 1.1 + b.dondola) * (a.onde ? 4 : 1);
    }
    for (const p of this.pali) {
      let x = p.x0 - w * 0.95;
      while (x < -20) { p.x0 += 575; x += 575; }
      p.g.setPosition(x, p.y);
    }
    this.riva.tilePositionX = w * 1.3 * 2;
    const bx = BARCA.x + PERNO.x - 2 + (this.metriBoa - this.metri) * METRO;
    this.boaRossa.setPosition(bx, ACQUA - 4 + Math.sin(t * 1.6) * (a.onde ? 2 : 0.6));
    // il gommone: ondeggia (di più con la burrasca), scatta quando corre
    const corre = this.stato === 'corsa' ? 1 - Math.min(1, this.tStato / this.cfg.corsa) : 0;
    this.barca.angle = Math.sin(t * 1.7) * (a.onde ? 3.2 : 0.7) - corre * 3;
    this.barca.y = BARCA.y + Math.sin(t * 1.3) * (a.onde ? 2.4 : 0.8);
    this.barca.x = BARCA.x + corre * 6;
    this.disegnaVelo();
    // le onde sull'acqua: righe chiare che vanno, più alte con la burrasca, e i luccichii del sole
    // che si accendono e si spengono
    const g = this.onde, h = a.onde ? 2.6 : 1;
    g.clear();
    for (let i = 0; i < 9; i++) {
      const y = 134 + i * 11 + (i % 2) * 3, k = 0.4 + i * 0.08, passo = 50 + i * 6, off = (w * (0.4 + i * 0.07) + t * 10 * (i % 2 ? 1 : -1)) % passo;
      g.lineStyle(0.8 + k * 0.6, 0xf2feff, (a.onde ? 0.65 : 0.45) + k * 0.1);
      for (let x = -passo - off; x < 480; x += passo) {
        const yy = y + Math.sin((x + t * 40) / 30) * h;
        g.lineBetween(x + passo * 0.2, yy, x + passo * 0.2 + 16 * k, yy - 0.6 * h);
      }
    }
    for (let i = 0; i < 16; i++) {
      const v = Math.sin(t * 2.6 + i * 1.9);
      if (v <= 0.3) continue;
      const x = (((i * 131 - w * (0.5 + (i % 3) * 0.15)) % 480) + 480) % 480, y = 136 + ((i * 41) % 92), s = 0.8 + (i % 3) * 0.5;
      g.fillStyle(0xffffff, (v - 0.3) * 1.2);
      g.fillRect(x - s * 1.8, y - 0.35, s * 3.6, 0.7); g.fillRect(x - 0.35, y - s, 0.7, s * 2);
    }
    // la scia bianca dietro e l'onda davanti, mentre corre
    const s = this.scia;
    s.clear();
    if (corre > 0) {
      const poppa = this.puntoBarca(20, GOMMONE.acqua - 2), prua = this.puntoBarca(250, GOMMONE.acqua - 4);
      s.fillStyle(0xffffff, 0.75 * corre);
      for (let i = 0; i < 6; i++) s.fillEllipse(poppa.x - 12 - i * 16, poppa.y + 2 + (i % 2), 26 - i * 2, 4);
      s.fillEllipse(prua.x + 6, prua.y + 2, 20, 5);
    }
  }

  disegnaGiri() {
    const g = this.gGiri, B = GIRI, r = this.giri, h = (B.h - 4) * r;
    g.clear();
    g.fillStyle(0x000000, 0.3); g.fillRoundedRect(B.x + 1.5, B.y + 2, B.w, B.h, 6);
    g.fillStyle(0x1f1430, 0.92); g.fillRoundedRect(B.x, B.y, B.w, B.h, 6);
    const col = r >= 1 ? (Math.floor(this.time.now / 120) % 2 ? 0x7dff9a : 0xffe14a) : r > 0.7 ? 0xff8a3a : r > 0.4 ? 0xffd34a : 0x7dd3fc;
    if (h > 1) { g.fillStyle(col, 1); g.fillRoundedRect(B.x + 2, B.y + 2 + (B.h - 4) - h, B.w - 4, h, 4); }
    for (let i = 1; i < 5; i++) { g.fillStyle(0xffffff, 0.25); g.fillRect(B.x + 3, B.y + (B.h * i) / 5, B.w - 6, 1); }
    g.lineStyle(2, 0xffe14a, 1); g.strokeRoundedRect(B.x, B.y, B.w, B.h, 6);
  }

  // il contagiri: il quadrante a semicerchio, la zona verde che lampeggia, il centro del PERFETTO e la
  // lancetta
  disegnaContagiri() {
    const g = this.gContagiri, C = CONTAGIRI, ang = (v) => Math.PI + v * Math.PI;
    const centro = this.zonaCentro, half = this.zonaAmp / 2, acceso = Math.floor(this.time.now / 150) % 2 === 0;
    g.clear();
    g.fillStyle(0x000000, 0.35); g.slice(C.x + 1.5, C.y + 2, C.r + 6, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0x1f1430, 0.95); g.slice(C.x, C.y, C.r + 6, Math.PI, 0, false); g.fillPath();
    g.lineStyle(10, 0x4a3a5a, 1); g.beginPath(); g.arc(C.x, C.y, C.r - 6, Math.PI, 0, false); g.strokePath();
    g.lineStyle(10, acceso ? 0x4ade80 : 0x2fae5f, 1); g.beginPath(); g.arc(C.x, C.y, C.r - 6, ang(centro - half), ang(centro + half), false); g.strokePath();
    const p = half * this.cfg.perfetta;
    g.lineStyle(10, 0xffe14a, 1); g.beginPath(); g.arc(C.x, C.y, C.r - 6, ang(centro - p), ang(centro + p), false); g.strokePath();
    g.lineStyle(2, 0xffe14a, 1); g.beginPath(); g.arc(C.x, C.y, C.r + 6, Math.PI, 0, false); g.strokePath();
    const a = ang(this.lancetta);
    g.lineStyle(4, 0x2b1b17, 1); g.lineBetween(C.x, C.y, C.x + Math.cos(a) * (C.r + 2), C.y + Math.sin(a) * (C.r + 2));
    g.lineStyle(2.2, 0xff5a4a, 1); g.lineBetween(C.x, C.y, C.x + Math.cos(a) * (C.r + 2), C.y + Math.sin(a) * (C.r + 2));
    g.fillStyle(0xfff3d6, 1); g.fillCircle(C.x, C.y, 4); g.lineStyle(1.4, 0x2b1b17, 1); g.strokeCircle(C.x, C.y, 4);
    this.testoOra.setAlpha(acceso ? 1 : 0.55);
  }

  // ---------- Greg in acqua ----------
  // la figura (dal petto in su: il resto lo taglia il ritaglio, sotto il pelo dell'acqua) e il cerchio
  // d'acqua intorno; compare dal secondo atto
  creaGreg() {
    const img = im(this, 540, GREG.y, 'gregNuota', GREG.taglia).setDepth(12).setVisible(false);
    const anello = this.add.graphics().setDepth(12.5).setVisible(false);
    this.greg = { img, anello, x: 540, y: GREG.y, stato: 'via', t: 0, tFrase: 1.2, tGuarda: 3.5, vx: 0, schizzi: 0 };
    this.tagliaGreg(GREG.vis);
  }

  // quanto si vede di Greg fuori dall'acqua (v = frazione della figura, dall'alto): l'origine sta lì, sul
  // pelo dell'acqua, e il resto della figura non si disegna
  tagliaGreg(v) {
    const G = this.greg, f = G.img.frame;
    G.vis = v;
    G.img.setCrop(0, 0, f.width, f.height * v).setOrigin(0.5, v);
  }

  faccGreg(key) {
    const G = this.greg;
    if (G.img.texture.key === key) return;
    G.img.setTexture(key).setScale(scalaDi(key, GREG.taglia));
    this.tagliaGreg(G.vis);
  }

  // il motore del Danda parte: Greg scappa via velocissimo, con gli spruzzi (poi torna piano)
  spaventaGreg() {
    const G = this.greg;
    if (!G || G.stato === 'via' || G.stato === 'fugge' || G.stato === 'lontano') return;
    G.stato = 'fugge';
    G.vx = 300;
    this.tagliaGreg(GREG.vis);
    this.faccGreg('gregScappa');
    Audio.sfx('schizzo');
    this.fraseGreg(caso(this.cfg.frasiGregMotore), 900);
  }

  fraseGreg(s, ms) {
    const G = this.greg;
    this.fumGreg?.destroy();
    this.fumGreg = fumetto(this, Phaser.Math.Clamp(G.x, 60, 420), G.y - 44, s, ms, 961);
  }

  // gli spruzzi di quando scatta via
  spruzziGreg() {
    const G = this.greg;
    for (let i = 0; i < 4; i++) {
      const d = this.add.ellipse(G.x - 6 + Math.random() * 12, G.y - 2, 3, 2.4, 0xffffff, 0.9).setDepth(13);
      this.tweens.add({ targets: d, x: d.x - 10 - Math.random() * 16, y: d.y - 6 - Math.random() * 10, alpha: 0, duration: 380, ease: 'Quad.out', onComplete: () => d.destroy() });
    }
  }

  // Greg a ogni fotogramma: nuota sul posto, terrorizzato (più agitato con la burrasca); ogni tanto
  // guarda sott'acqua e scatta via, poi torna; quando il Danda parte scappa e torna piano
  muoviGreg(dt) {
    const G = this.greg, a = this.atto, c = this.cfg, t = this.time.now / 1000, agitato = a.onde ? 1 : 0;
    if (G.stato === 'via') {
      if (this.atti.indexOf(a) < 1) return;
      G.stato = 'torna'; G.x = 520; G.img.setVisible(true); G.anello.setVisible(true);
    }
    const casa = GREG.x + Math.sin(t * (0.9 + agitato)) * (6 + agitato * 6);
    G.t += dt;
    if (G.stato === 'torna') {
      // torna piano piano, a rana
      G.x += Math.sign(casa - G.x) * Math.min(Math.abs(casa - G.x), 34 * dt);
      if (Math.abs(casa - G.x) < 2) { G.stato = 'nuota'; this.faccGreg('gregNuota'); }
    } else if (G.stato === 'nuota') {
      G.x = casa;
      G.tFrase -= dt; G.tGuarda -= dt;
      if (G.tFrase <= 0) { G.tFrase = (agitato ? 2.4 : 3.6) + this.rnd() * 1.5; this.fraseGreg(caso(c.frasiGreg), 1300); }
      if (G.tGuarda <= 0) { G.stato = 'guarda'; G.t = 0; }
    } else if (G.stato === 'guarda') {
      // mette la testa sott'acqua a guardare... poi riemerge urlando e scatta via
      const k = G.t < 0.3 ? G.t / 0.3 : G.t < 0.65 ? 1 : 1 - (G.t - 0.65) / 0.15;
      this.tagliaGreg(GREG.vis - (GREG.vis - GREG.giu) * Phaser.Math.Clamp(k, 0, 1));
      if (G.t >= 0.8) {
        this.tagliaGreg(GREG.vis);
        this.faccGreg('gregScappa');
        G.stato = 'scatta'; G.t = 0; G.vx = (this.rnd() < 0.5 ? -1 : 1) * (150 + agitato * 60);
        Audio.sfx('schizzo');
      }
    } else if (G.stato === 'scatta') {
      G.x = Phaser.Math.Clamp(G.x + G.vx * dt, 388, 470);
      if (G.t >= 0.4) { G.stato = 'torna'; G.tGuarda = (agitato ? 2.6 : 4.4) + this.rnd() * 2; }
    } else if (G.stato === 'fugge') {
      G.x += G.vx * dt;
      if (G.x > 540) { G.stato = 'lontano'; G.t = 0; }
    } else if (G.stato === 'lontano') {
      // aspetta che il Danda si fermi, poi torna
      if (this.stato !== 'corsa' && G.t > 0.8) { G.stato = 'torna'; G.x = 520; this.faccGreg('gregNuota'); }
    }
    if (G.stato === 'scatta' || G.stato === 'fugge') {
      G.schizzi -= dt;
      if (G.schizzi <= 0) { G.schizzi = 0.07; this.spruzziGreg(); }
    }
    // a galla, che si agita (con le onde va su e giù)
    const y = G.y + Math.sin(t * 2.2) * (0.6 + agitato * 1.6);
    G.img.setPosition(G.x, y).setAngle(Math.sin(t * (6 + agitato * 5)) * (2 + agitato * 3));
    const g = G.anello, r = 13 + Math.sin(t * 3) * 1.2;
    g.clear();
    g.lineStyle(1.3, 0xf2feff, 0.75); g.strokeEllipse(G.x, y, r * 2, 5);
    g.lineStyle(0.9, 0xf2feff, 0.35); g.strokeEllipse(G.x, y + 0.5, r * 2.9 + (t * 20) % 10, 7);
  }

  risultato() {
    return {
      punteggio: Math.round(this.punti),
      vittoria: this.arrivato,
      riepilogo: `${quanti(this.partenze, 'partenza', 'partenze')}, ${Math.round(this.metri)} metri` + (this.perfetti ? ` (${quanti(this.perfetti, 'PERFETTO', 'PERFETTI')})` : ''),
      titoli: ['ALLA BOA, CAPITANO!', 'LA BATTERIA È A TERRA!'],
    };
  }

  // ---------- la fine ----------
  // Vinci: il Danda 2 sfreccia oltre la boa con la scia bianca, Giorgio al volante col vento nei
  // capelli e il cappellino che vola via, chi gioca saluta dalla prua. Perdi: Giorgio scende
  // nell'acqua bassa e spinge il gommone a piedi, coi pantaloni arrotolati, e da riva qualcuno ride.
  // Al massimo 3 secondi; si salta con un tocco, INVIO o SPAZIO.
  finale(ris, fatto) {
    const c = this.cfg;
    for (const o of [this.gGiri, this.testoGiri, this.gContagiri, this.testoOra, this.testoTira, this.testoBoa, this.testoPunti, this.testoPartenze, this.corda]) o.setVisible(false);
    this.fumettino?.destroy();
    let chiuso = false;
    const fine = () => { if (chiuso) return; chiuso = true; fatto(); };
    this.time.delayedCall(400, () => {
      for (const k of ['ENTER', 'SPACE']) this.input.keyboard.once('keydown-' + k, fine);
      this.input.once('pointerdown', fine);
    });
    const titolo = txt(this, 240, 26, ris.titoloFine, { size: 20, color: ris.vittoria ? '#7dff9a' : '#ff6b5a', depth: 1100 });
    this.tweens.add({ targets: titolo, scale: { from: 1.6, to: 1 }, duration: 260, ease: 'Back.out' });
    if (ris.vittoria) {
      Audio.sfx('vittoria'); Audio.sfx('avviamento');
      this.posaGiorgio('volante');
      this.giorgio.setY(this.giorgioY);
      this.posaIo(this.idPrua + '_felice');
      this.tweens.add({ targets: this.barca, x: BARCA.x + 520, duration: 2400, ease: 'Quad.in', onUpdate: () => this.disegnaVelo() });
      // Greg, se c'è, scappa urlando
      const G = this.greg;
      if (G.stato !== 'via' && G.stato !== 'lontano') {
        this.tagliaGreg(GREG.vis); this.faccGreg('gregScappa'); G.anello.setVisible(false);
        this.tweens.add({ targets: G.img, x: 560, duration: 700, ease: 'Quad.in' });
      }
      // la scia lunga e il cappellino che vola via
      this.time.addEvent({ delay: 60, repeat: 36, callback: () => {
        const p = this.puntoBarca(14, GOMMONE.acqua - 1), e = this.add.ellipse(p.x - 10, p.y + 2, 26, 4, 0xffffff, 0.85).setDepth(19);
        this.tweens.add({ targets: e, alpha: 0, scaleX: 1.8, duration: 900, onComplete: () => e.destroy() });
      } });
      // (il cappello da marinaio: la cupola bianca, la tesa rivoltata e l'ancora blu)
      const h = this.puntoBarca(GIORGIO.x, GIORGIO.piedi - 84), cap = this.add.graphics().setDepth(30).setPosition(h.x, h.y);
      cap.fillStyle(0xffffff, 1); cap.fillEllipse(0, -3, 17, 12);
      cap.lineStyle(1.2, 0x2b1b17, 1); cap.strokeEllipse(0, -3, 17, 12);
      cap.fillStyle(0xf2f2ec, 1); cap.fillRoundedRect(-11.5, -1.5, 23, 6, 3); cap.strokeRoundedRect(-11.5, -1.5, 23, 6, 3);
      cap.fillStyle(0x22305e, 1); cap.fillRect(-0.7, -1, 1.4, 4.4); cap.fillRect(-2.4, -0.2, 4.8, 1.1); cap.fillRect(-2.6, 2.6, 5.2, 1);
      this.tweens.add({ targets: cap, x: h.x - 70, y: h.y - 38, angle: -540, duration: 1300, ease: 'Quad.out', onComplete: () => this.tweens.add({ targets: cap, x: cap.x - 20, y: ACQUA - 2, angle: -620, duration: 800, ease: 'Quad.in', onComplete: () => Audio.sfx('splash') }) });
      stelle(this, 240, 120, 10, 1050);
    } else {
      Audio.sfx('sconfitta'); Audio.sfx('splash');
      // Giorgio in acqua, dietro la poppa (oltre il motore), che spinge (le gambe nell'acqua fino al ginocchio)
      this.giorgio.setVisible(false);
      this.posaIo(this.idPrua + '_triste');
      this.tweens.add({ targets: this.greg.img, y: '+=1.5', duration: 300, yoyo: true, repeat: 4 });
      const g = im(this, BARCA.x - PERNO.x - 24, ACQUA + 30, 'capSpinge', GIORGIO.taglia).setOrigin(0.5, 1).setDepth(21);
      this.tweens.add({ targets: [this.barca, g], x: '+=34', duration: 3000, ease: 'Sine.inOut', onUpdate: () => this.disegnaVelo() });
      this.tweens.add({ targets: g, angle: { from: -3, to: 3 }, duration: 380, yoyo: true, repeat: 3 });
      // da riva qualcuno ride (non Giorgio, non chi gioca, non Greg: è in acqua)
      const chi = Object.keys(PERSONAGGI).filter((id) => !['giorgio', 'greg', this.idPrua.replace(DOPPIONE, '')].includes(id) && this.textures.exists(`${id}_felice`));
      const id = chi[Math.floor(this.rnd() * chi.length)];
      if (id) {
        const r = im(this, 432, 282, `${id}_felice`, 0.46).setOrigin(0.5, 1).setDepth(45);
        this.tweens.add({ targets: r, y: 279, duration: 160, yoyo: true, repeat: 7 });
        this.time.delayedCall(300, () => { fumetto(this, 420, 196, caso(c.frasiRiva), 1800, 1060); Audio.sfx('risate'); });
      }
    }
    this.time.delayedCall(3000, fine);
  }
}
