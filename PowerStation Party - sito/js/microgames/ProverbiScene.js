// Microgioco 20: "Le Perle di Denny" - correggi i proverbi sbagliati di Denny, scrivendo. CORREGGI!
//
//  Il Pallaio di sera (js/grafica/pallaioSera.js): lampadine a filo, mattoni, il frigo delle birre, il
//  ping pong in fondo. Al tavolo di legno, visto dal fondo come da chi ci è seduto, Denny (Pastaffi, il
//  figlio di Emilio) siede a capotavola, sotto la lampada, e fa il grande saggio (dito alzato, mano sul
//  petto, occhi socchiusi)... e sbaglia i proverbi con totale convinzione. Ai due lati lunghi, seduti,
//  ascoltano in tre (gli altri giocatori della partita; se sono meno, altri personaggi del gioco, a
//  caso) e chi gioca, davanti a destra, col suo nome sopra. Tutti sono i personaggi di sempre, alla
//  scala degli altri microgiochi (Denny appena più grande): il tavolo li copre dalla vita in giù.
//  Ogni proverbio arriva intero nel fumetto, con una sola parola sbagliata: chi gioca scrive quella
//  giusta nella casella in basso e preme INVIO.
//  - Giusta: nel fumetto la parola sbagliata si cancella con una riga rossa e sopra arriva quella
//    giusta; il tavolo ride di Denny (chi batte la mano sul tavolo, chi sputa la birra, chi lo indica),
//    lui si offende e ribatte. Subito il proverbio dopo.
//  - Sbagliata: la casella trema, il tavolo ride di chi gioca (e lo indica), Denny gongola e si riprova.
//  - Tempo del proverbio finito: Denny la proclama VERITÀ DEFINITIVA e il tavolo annuisce convinto;
//    il proverbio si mostra giusto per un attimo e si passa al dopo, senza punti.
//  Intanto, ad aspettare, al tavolo si beve, ci si guarda, qualcuno sbadiglia.
//  Tre atti: LE PERLE DI DENNY (la parola sbagliata è sottolineata, tempo largo); TROVALA TU! (non
//  più sottolineata); DENNY SI SCATENA! (sale in piedi sulla sedia, parla in fretta e dopo poco il
//  fumetto sbiadisce: resta la casella; il tavolo ride già prima che finisca).
//  Si scrive in un <input> vero ma invisibile (js/casella.js), che sul telefono apre la tastiera: la
//  casella che si vede, col testo e il cursore che lampeggia, la disegna il gioco, dal valore
//  dell'input. Sul telefono, con la tastiera aperta, fumetto, casella e barra salgono nella parte che
//  resta visibile, e il tavolo rimpicciolisce di lato.
//  I proverbi: a ogni round l'elenco si mescola una volta e ogni giocatore della partita ha un blocco
//  suo, senza sovrapposizioni, con lo stesso numero di proverbi per livello; ogni atto pesca dal suo
//  livello (il primo i facili, il secondo i medi, il terzo i difficili), sempre prima quelli usciti
//  meno di recente (vedi blocchiDelRound e pesca).
//  Memoria: le facce sono le texture dei personaggi che ci sono già; le pose in più (la birra in mano,
//  indicare, battere, bere, applaudire; Denny saggio, che proclama e che brinda), lo sfondo e la luce
//  sono texture piccole, a bassa densità, create qui e buttate alla fine. Tavolo e oggetti sono Graphics.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione, DOPPIONE } from '../sessione.js';
import { Salvataggio } from '../salvataggio.js';
import { RES, casuale, tela, gradR } from '../grafica/base.js';
import { PERSONAGGI } from '../grafica/personaggi.js';
import { sfondoSera } from '../grafica/pallaioSera.js';
import { preparaPosa } from '../sprites.js';
import { casellaTesto } from '../casella.js';
import { txt, im, scalaDi, scritta, stelle, fumetto, caso, eTouch, perDito, vibra, puntiHud, numero, quanti } from '../fx.js';

const LIVELLI = ['facile', 'medio', 'difficile'];
// le taglie: chi siede ai lati come i personaggi degli altri microgiochi (da 0,42 a 0,84), Denny il
// 17% più grande. Le pose nuove hanno la densità che serve a quella taglia, non di più
const TAGLIA = 0.6, DENS_POSE = RES * 0.64, DENS_DENNY = RES * 0.74;
// Denny a capotavola: dove ha la vita (lì c'è il bordo in fondo del tavolo); sedia = quanto sale
// quando ci va in piedi
const DENNY = { x: 240, vita: 144, taglia: 0.7, sedia: 26 };
// il tavolo in prospettiva: il bordo in fondo (y fy, da fx0 a fx1) e quello davanti (y ny, da nx0 a
// nx1), spesso "bordo"
const T = { fy: 140, fx0: 172, fx1: 308, ny: 214, nx0: 36, nx1: 444, bordo: 9 };
// i posti ai lati lunghi (x, y = la vita, sul bordo del tavolo; verso = da che parte guarda): in
// fondo e davanti, a sinistra e a destra. Davanti a destra siede chi gioca
const POSTI = [{ x: 92, y: 186, verso: 1 }, { x: 44, y: 212, verso: 1 }, { x: 388, y: 186, verso: -1 }, { x: 436, y: 212, verso: -1 }];
const POSTO_IO = 3;
// le pose di chi ascolta: [espressione, opzioni del disegno]. Ognuno ha anche un suo modo di ridere di
// Denny (il ruolo): chi batte la mano sul tavolo, chi sputa la birra, chi lo indica
const POSE_ASCOLTA = {
  riposo: ['normale', { posa: 'spritz', accessorio: 'birra' }],
  ride: ['felice', { posa: 'felice', accessorio: 'birra' }],
  beve: ['normale', { posa: 'beve', accessorio: 'birra' }],
  applaude: ['felice', { posa: 'mossaBatti' }],
};
const POSE_RUOLO = {
  batte: { batteSu: ['felice', { posa: 'aVoce' }], batteGiu: ['felice', { posa: 'cassa' }] },
  indica: { indicaSu: ['felice', { posa: 'indicaSu' }], indica: ['felice', { posa: 'indicaTe' }] },
  sputa: {},
};
// (chi indica siede in fondo a destra: da lì il braccio, verso Denny o verso chi gioca, resta fuori dal
// tavolo; gli altri due ruoli si mescolano tra i posti a sinistra)
const RUOLI = ['batte', 'sputa'];
// Denny: le pose nuove (le altre facce sono quelle che ha già: offeso = braccia conserte, gongola = felice)
const POSE_DENNY = { dennySaggio: ['sufficienza', { posa: 'saggio' }], dennyProclama: ['felice', { posa: 'saggio' }], dennyBrinda: ['felice', { posa: 'alza', accessorio: 'birra' }] };
const FACCE_DENNY = { saggio: 'dennySaggio', proclama: 'dennyProclama', brinda: 'dennyBrinda', offeso: 'pastaffi_sufficienza', gongola: 'pastaffi_felice' };
// dove sta tutto: a tastiera chiusa (il fumetto, largo un terzo dello schermo, accanto alla testa di
// Denny: alto quanto serve, fino a h, con la barra del tempo sotto; la casella in basso al centro,
// staccata dal tavolo) e, sul telefono con la tastiera aperta, tutto nella parte che resta visibile in
// alto (basso = fin dove si vede, in unità logiche), col tavolo piccolo di lato
const NORMALE = () => ({
  fumetto: { x: 30, y: 42, w: 160, h: 64 },
  casella: { x: eTouch() ? 117 : 150, y: 231, w: 180, h: 27 }, ok: { x: 303, y: 231, w: 60, h: 27 },
  sala: { x: 0, y: 0, k: 1 }, size: 11, sizeCasella: 13, normale: true,
});
const ALTO = (alto, basso) => {
  // (su iPhone, aprendo la tastiera, Safari può far scorrere la pagina: allora si vede da "alto" in giù)
  const t = Math.max(0, Math.min(150, alto)), b = Math.max(t + 96, Math.min(270, basso)), y0 = t + 26;
  // il tavolo, piccolo, in basso a destra, oltre x 352: non copre né il fumetto né la casella (stanno
  // a sinistra); il fumetto, la barra subito sotto e la casella prendono tutta l'altezza che resta
  const k = 0.27;
  return {
    fumetto: { x: 8, y: y0, w: 340, h: Math.max(30, b - y0 - 47), fisso: true }, barra: { x: 18, y: b - 43, w: 320 },
    casella: { x: 8, y: b - 34, w: 250, h: 30 }, ok: { x: 264, y: b - 34, w: 70, h: 30 },
    sala: { x: 478 - 470 * k, y: b - 224 * k, k }, size: 11, sizeCasella: 13,
  };
};
const INCHIOSTRO = '#2b1b17', GIUSTA = '#1e8a4a', SCADUTA = '#2f6fd8';
const base = (id) => String(id ?? '').replace(new RegExp(DOPPIONE + '$'), '');
// il bordo sinistro e destro del tavolo all'altezza y
const bordoSx = (y) => T.nx0 + ((T.fx0 - T.nx0) * (T.ny - y)) / (T.ny - T.fy);
const bordoDx = (y) => T.nx1 - ((T.nx1 - T.fx1) * (T.ny - y)) / (T.ny - T.fy);

// la risposta, per confrontarla: niente maiuscole, spazi prima e dopo, accenti e apostrofi
const norma = (s) => String(s ?? '').toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’`´]/g, '');
function levenshtein(a, b) {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prima = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prima + (a[i - 1] === b[j - 1] ? 0 : 1));
      prima = t;
    }
  }
  return d[b.length];
}
// un proverbio della configurazione: "Il mattino ha l'[oro] in bocca" -> le parole prima, la parola
// tra quadre (coi pezzi attaccati: l'apostrofo davanti, la virgola dopo) e le parole dopo
function leggi(voce) {
  const m = voce.proverbio.match(/^(.*?)(\S*)\[([^\]]+)\](\S*)(.*)$/);
  return { prima: m[1].trim().split(/\s+/).filter(Boolean), pre: m[2], giusta: m[3], post: m[4], dopo: m[5].trim().split(/\s+/).filter(Boolean), dice: voce.dice, perla: !!voce.perla, testo: voce.proverbio };
}

// la sigla di un proverbio, per ricordarlo nel salvataggio: poche lettere dal testo (così il codice del
// salvataggio da mandarsi resta corto)
export const sigla = (testo) => { let h = 5381; for (const ch of testo) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0; return h.toString(36); };

// I blocchi di proverbi del round, uno per giocatore della partita. Dal seme del round: ogni livello
// (facile, medio, difficile) si mescola una volta, quelli usciti di recente vanno in fondo (recenti =
// le sigle, dalla più vecchia alla più nuova; null = non contano, come nella Sfida del giorno), poi si
// distribuiscono a giro, così ogni blocco ha lo stesso numero di proverbi per livello e una parte
// uguale di quelli meno recenti: blocchi[giocatore][livello]. Quelli che avanzano (non si dividono in
// parti uguali) sono il resto, per chi finisce il suo blocco; ordine[livello] = tutti, dal meno
// recente (per riusarli, se proprio non bastano). Si calcola una volta per round (lo stesso seme e gli stessi
// giocatori danno gli stessi blocchi, anche se nel frattempo i recenti sono cambiati; se ne tengono
// alcuni, perché tra un turno e l'altro può passare la prova, che ha un seme suo).
const BLOCCHI = new Map();
export function blocchiDelRound(proverbi, seme, n, recenti) {
  const chiave = `${seme}|${n}|${recenti ? 'r' : 'g'}`;
  if (BLOCCHI.has(chiave)) return BLOCCHI.get(chiave);
  const rnd = casuale(seme >>> 0);
  const eta = new Map((recenti ?? []).map((t, i) => [t, i]));
  const blocchi = Array.from({ length: n }, () => ({})), resto = {}, ordine = {};
  for (const l of LIVELLI) {
    const g = proverbi.map((_, i) => i).filter((i) => (proverbi[i].livello ?? 'medio') === l);
    for (let i = g.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [g[i], g[j]] = [g[j], g[i]]; }
    // (sort è stabile: tra quelli mai usciti resta l'ordine mescolato)
    if (recenti) g.sort((a, b) => (eta.get(sigla(proverbi[a].proverbio)) ?? -1) - (eta.get(sigla(proverbi[b].proverbio)) ?? -1));
    const q = Math.floor(g.length / n);
    for (const b of blocchi) b[l] = [];
    for (let k = 0; k < q * n; k++) blocchi[k % n][l].push(g[k]);
    resto[l] = g.slice(q * n);
    ordine[l] = g;
  }
  const B = { blocchi, resto, ordine };
  BLOCCHI.set(chiave, B);
  if (BLOCCHI.size > 12) BLOCCHI.delete(BLOCCHI.keys().next().value);
  return B;
}

export class ProverbiScene extends MicrogiocoBase {
  constructor() { super('proverbi'); }

  attoA(t) { return this.cfg.atti.filter((a) => t >= a.da).pop(); }
  // in Lampo (15 secondi) l'obiettivo è più piccolo e i punti non seguono la scala delle medaglie
  get obiettivo() { return this.lampo ? this.cfg.obiettivoLampo : this.cfg.obiettivoProverbi; }

  prepara() {
    // (per le cose a caso di questo turno: gli ascoltatori che mancano, i loro ruoli, i gesti al tavolo)
    this.rnd = casuale((Sessione.seme + 7919 * ((this.giocatore?.i ?? 0) + 1)) >>> 0);
    this.lampo = Sessione.tipo === 'lampo';
    this.proverbiDelTurno();
    this.punti = 0; this.giusti = 0; this.serie = 0; this.perle = 0; this.visti = 0;
    this.stato = 'attesa';
    this.L = NORMALE(); this.chiaveLayout = 'normale';
    this.creati = [];       // le texture create qui (si buttano alla fine)

    // il Pallaio di sera (una texture sola, morbida), le lampadine a filo, la fascia scura in basso
    tela(this, 'proverbiSera', 480, 270, sfondoSera, 1.5);
    tela(this, 'proverbiAlone', 32, 32, (c) => { c.fillStyle = gradR(c, 16, 16, 0, 16, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(0, 0, 32, 32); }, 2);
    this.creati.push('proverbiSera', 'proverbiAlone');
    this.sfondo = im(this, 0, 0, 'proverbiSera').setOrigin(0).setDepth(0);
    this.lucine = this.lampadine();
    this.fascia = this.add.graphics().setDepth(20);
    this.fascia.fillStyle(0x0c0712, 0.5); this.fascia.fillRect(0, 223, 480, 4);
    this.fascia.fillStyle(0x0c0712, 0.88); this.fascia.fillRect(0, 227, 480, 43);
    this.fascia.lineStyle(1, 0x4a3658, 1); this.fascia.lineBetween(0, 227, 480, 227);
    this.sala = this.add.container(0, 0).setDepth(10);
    this.tavolo();

    // il fumetto (disegnato: niente immagini), le parole, la barra del tempo del proverbio
    this.gFumetto = this.add.graphics().setDepth(30);
    this.gSegni = this.add.graphics().setDepth(32);
    this.gPillola = this.add.graphics().setDepth(33.5);
    this.parole = [];
    this.gBarra = this.add.graphics().setDepth(30);
    this.perlaTesto = txt(this, 0, 0, 'PERLA ORIGINALE!', { size: 8, color: '#ffe14a', depth: 34 }).setAngle(-4).setVisible(false);
    this.aiuto = txt(this, 0, 0, perDito('Scrivi la parola giusta e premi INVIO', ''), { size: 7, color: '#fff3d6', depth: 30 });
    this.testoPunti = txt(this, 474, 36, '', { ox: 1, size: 9, depth: 1001 });
    this.testoGiusti = txt(this, 474, 49, '', { ox: 1, size: 8, depth: 1001 });
    this.testoSerie = txt(this, 0, 0, '', { ox: 0, size: 9, color: '#ffe14a', depth: 31 });
    // la casella che si vede: il riquadro, quello che si scrive, il cursore che lampeggia
    this.gCasella = this.add.graphics();
    this.testoCasella = txt(this, 0, 0, '', { size: 13, color: '#ffffff', thick: 0, ox: 0 });
    this.misura = txt(this, -999, -999, '', { size: 13, thick: 0, ox: 0 }).setVisible(false);
    this.cursore = this.add.rectangle(0, 0, 2, 10, 0xffe14a).setOrigin(0, 0.5);
    this.vCasella = this.add.container(0, 0, [this.gCasella, this.testoCasella, this.cursore]).setDepth(36);
    this.hud();

    // la casella (HTML): si chiude in pausa e si riapre alla ripresa
    this.apriCasella();
    this.alPausa = () => this.chiudiCasella();
    this.events.on('pause', this.alPausa);
    this.prossimoGesto = 2.5;
    this.misuraFumetto(30);
    this.disponi();
    this.nuovoProverbio();
  }

  // I proverbi di chi gioca, in questo turno: il suo blocco del round. In una partita (sfida, Sfida del
  // giorno) i blocchi sono uno per giocatore; in Allenamento, Da solo e simili, uno solo. Nella Sfida
  // del giorno i recenti non contano (deve essere uguale per tutti, su ogni telefono).
  proverbiDelTurno() {
    const partita = Sessione.modo === 'sfida' || Sessione.modo === 'giorno';
    const n = partita ? Math.max(1, Sessione.n) : 1, b = partita ? (this.giocatore?.i ?? 0) % n : 0;
    let recenti = null;
    if (Sessione.modo !== 'giorno') try { recenti = Array.isArray(Salvataggio.dati.proverbiRecenti) ? [...Salvataggio.dati.proverbiRecenti] : []; } catch (e) { recenti = []; }
    this.B = blocchiDelRound(this.cfg.proverbi, Sessione.seme, n, recenti);
    this.mazzo = Object.fromEntries(LIVELLI.map((l) => [l, [...this.B.blocchi[b][l]]]));
    this.usciti = new Set();
  }

  // il prossimo proverbio di un livello: dal blocco di chi gioca; finito quello, da quelli avanzati (dello
  // stesso livello, poi degli altri) e, se proprio non bastano, si riusano quelli usciti meno di recente
  pesca(l) {
    const B = this.B, altri = LIVELLI.filter((x) => x !== l);
    let i = this.mazzo[l].shift();
    if (i == null) for (const g of [B.resto[l], ...altri.map((x) => B.resto[x]), B.ordine[l], ...altri.map((x) => B.ordine[x])]) {
      i = g.find((k) => !this.usciti.has(k));
      if (i != null) break;
    }
    if (i == null) { this.usciti.clear(); i = B.ordine[l][0]; }
    this.usciti.add(i);
    return i;
  }

  // un proverbio uscito: in fondo ai recenti (se il salvataggio non si può usare, niente)
  ricorda(testo) {
    try {
      const r = Salvataggio.dati.proverbiRecenti, k = sigla(testo);
      if (!Array.isArray(r)) return;
      const i = r.indexOf(k);
      if (i >= 0) r.splice(i, 1);
      r.push(k);
      while (r.length > (this.cfg.recenti ?? 45)) r.shift();
      Salvataggio.segna();
    } catch (e) { /* niente */ }
  }

  // ---------- la sala ----------
  // le lampadine a filo, gialle, con l'alone (davanti al muro, dietro a tutto il resto); un paio tremolano
  lampadine() {
    const c = this.add.container(0, 0).setDepth(2), g = this.add.graphics();
    const punto = (t) => ({ x: -10 + 500 * t, y: 6 + 3 * t + 92 * t * (1 - t) });
    g.lineStyle(1, 0x120a10, 1);
    g.strokePoints(Array.from({ length: 31 }, (_, i) => punto(i / 30)), false);
    c.add(g);
    const n = 16;
    for (let i = 0; i < n; i++) {
      const p = punto((i + 0.5) / n);
      const alo = im(this, p.x, p.y + 5, 'proverbiAlone', 1.1).setTint(0xffb44a).setAlpha(0.55).setBlendMode(Phaser.BlendModes.ADD);
      const b = this.add.graphics();
      b.fillStyle(0x120a10, 1); b.fillRect(p.x - 1, p.y, 2, 2.4);
      b.fillStyle(0xffd76a, 1); b.fillEllipse(p.x, p.y + 4.6, 3.8, 5);
      b.fillStyle(0xfffbe0, 1); b.fillEllipse(p.x - 0.5, p.y + 3.8, 1.2, 1.8);
      c.add([alo, b]);
      if (i % 5 === 2) this.tweens.add({ targets: alo, alpha: 0.3, duration: 120 + this.rnd() * 200, yoyo: true, repeat: -1, repeatDelay: 900 + this.rnd() * 2400 });
    }
    return c;
  }

  // il tavolo con chi ci siede: Denny a capotavola, gli ascoltatori e chi gioca ai lati lunghi; sopra
  // il tavolo le cose, con la loro ombra; la luce della lampada su Denny
  tavolo() {
    const S = this.sala, D = DENNY;
    // chi ascolta: gli altri giocatori della partita (non chi gioca), fino a 3, poi personaggi a caso
    // (giocabili o ospiti), mai doppioni, mai chi gioca, mai Denny
    const io = this.giocatore?.id ?? 'riccardo';
    const presi = new Set([base(io), 'pastaffi']), ids = [];
    for (const g of Sessione.giocatori ?? []) {
      const id = base(g.id);
      if (ids.length < 3 && !presi.has(id) && PERSONAGGI[id]) { presi.add(id); ids.push(id); }
    }
    const altri = Object.keys(PERSONAGGI).filter((id) => !presi.has(id) && this.textures.exists(`${id}_normale`));
    while (ids.length < 3 && altri.length) ids.push(altri.splice(Math.floor(this.rnd() * altri.length), 1)[0]);
    const ruoli = [...this.mescolaDi([...RUOLI]), 'indica'];
    this.ascoltatori = ids.map((id, k) => this.persona(id, POSTI[k], ruoli[k], false));
    this.io = this.persona(io, POSTI[POSTO_IO], null, true);
    this.tutti = [...this.ascoltatori, this.io];

    // la lampada sopra Denny: il filo, il paralume verde, la lampadina
    const lampada = this.add.graphics();
    lampada.lineStyle(1.4, 0x120a10, 1); lampada.lineBetween(D.x, 0, D.x, 47);
    lampada.fillStyle(0x1f4a34, 1); lampada.fillPoints([{ x: D.x - 6, y: 46 }, { x: D.x + 6, y: 46 }, { x: D.x + 15, y: 57 }, { x: D.x - 15, y: 57 }], true);
    lampada.lineStyle(1.4, 0x2b1b17, 1); lampada.strokePoints([{ x: D.x - 6, y: 46 }, { x: D.x + 6, y: 46 }, { x: D.x + 15, y: 57 }, { x: D.x - 15, y: 57 }], true);
    lampada.fillStyle(0xfff0b0, 1); lampada.fillEllipse(D.x, 58, 10, 4);
    S.add(lampada);
    S.add(im(this, D.x, 70, 'proverbiAlone', 5.2).setTint(0xffc46a).setAlpha(0.32).setBlendMode(Phaser.BlendModes.ADD));
    // Denny: in un contenitore (respira), con la vita nell'origine; la sedia si vede quando ci sale
    for (const [k, [espr, o]] of Object.entries(POSE_DENNY)) { preparaPosa(this, k, 'pastaffi', espr, o, DENS_DENNY); this.creati.push(k); }
    const hD = PERSONAGGI.pastaffi?.statura ?? 1;
    this.sedia = this.add.graphics().setVisible(false);
    const sy = D.vita - D.sedia + 0.5 * D.taglia * hD * 44;    // dove poggia i piedi, in piedi sulla sedia
    this.sedia.fillStyle(0x2b1b17, 1);
    for (const dx of [-21, 17]) this.sedia.fillRect(D.x + dx - 1, sy - 40, 6, 42);
    this.sedia.fillRect(D.x - 25, sy - 1, 50, 7);
    this.sedia.fillStyle(0x9a5f30, 1);
    for (const dx of [-21, 17]) this.sedia.fillRect(D.x + dx, sy - 39, 4, 40);
    this.sedia.fillRect(D.x - 24, sy, 48, 5);
    this.sedia.fillRect(D.x - 21, sy - 38, 42, 5);
    S.add(this.sedia);
    this.dennyImg = im(this, 0, 0, 'dennySaggio', D.taglia).setOrigin(0.5, (284 - 44 * hD) / 288);
    this.denny = this.add.container(D.x, D.vita, [this.dennyImg]);
    this.dennyY = D.vita;
    S.add(this.denny);
    this.respiro = this.tweens.add({ targets: this.denny, scaleY: 1.012, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // chi siede ai lati: prima quelli in fondo, poi quelli davanti (il tavolo, sopra, li copre dalla vita in giù)
    for (const k of [0, 2, 1, 3]) S.add(this.tutti.find((a) => a.P === POSTI[k]).img);
    // il tavolo e le cose sopra
    const g = this.add.graphics();
    this.disegnaTavolo(g);
    this.cose(g);
    S.add(g);
    // la luce della lampada sul fondo del tavolo
    S.add(im(this, D.x, T.fy + 10, 'proverbiAlone').setScale(scalaDi('proverbiAlone', 5.5), scalaDi('proverbiAlone', 1.6)).setTint(0xffc46a).setAlpha(0.28).setBlendMode(Phaser.BlendModes.ADD));
    // il fumo della sigaretta nel posacenere
    this.time.addEvent({ delay: 520, loop: true, callback: () => {
      const f = this.add.circle(207 + this.rnd() * 2, 163, 1.6, 0xd8d2cc, 0.45);
      S.add(f);
      this.tweens.add({ targets: f, y: 146, x: f.x + 4 - this.rnd() * 8, radius: 3.4, alpha: 0, duration: 1500, onComplete: () => f.destroy() });
    } });
    // il nome di chi gioca, sopra la sua testa, nel suo colore
    const P = this.io.P, cima = P.y + 0.3 * this.io.h * (29 - 240);
    this.nomeIo = txt(this, P.x, cima - 9, (this.giocatore?.nome ?? '').toUpperCase(), { size: 8, color: this.giocatore?.colore ?? '#ffe14a' });
    S.add(this.nomeIo);
  }

  // una persona al tavolo: la sua figura (con la vita nell'origine, così ride e annuisce piegandosi
  // lì) e le sue pose. Chi gioca ha solo la birra in mano: per il resto le facce che ci sono già
  persona(id, P, ruolo, io) {
    const b = base(id), h = PERSONAGGI[b]?.statura ?? 1, tex = {};
    const pose = io ? { riposo: POSE_ASCOLTA.riposo } : { ...POSE_ASCOLTA, ...POSE_RUOLO[ruolo] };
    for (const [nome, [espr, o]] of Object.entries(pose)) {
      const key = `prv_${id}_${nome}`;
      preparaPosa(this, key, b, espr, o, DENS_POSE, b !== id ? { travestimento: true } : {});
      this.creati.push(key);
      tex[nome] = key;
    }
    const img = im(this, P.x, P.y, tex.riposo, TAGLIA).setOrigin(0.5, (284 - 44 * h) / 288).setFlipX(P.verso < 0).setAngle(3 * P.verso);
    return { id, P, h, img, tex, ruolo, io, verso: P.verso, gira: 0 };
  }

  // il tavolo di legno in prospettiva (vettoriale): le assi verso il fondo, le venature, le fessure,
  // il bordo spesso davanti; più chiaro in fondo, sotto la lampada
  disegnaTavolo(g) {
    const { fy, fx0, fx1, ny, nx0, nx1, bordo } = T, N = 6;
    const vicino = (i) => nx0 + (i * (nx1 - nx0)) / N, lontano = (i) => fx0 + (i * (fx1 - fx0)) / N;
    g.fillStyle(0x000000, 0.4); g.fillEllipse(240, ny + bordo + 2, nx1 - nx0 + 24, 14);
    const COL = [0xa8642a, 0xb06a2c, 0xa25e26, 0xb87230, 0xaa6629, 0xa4602a];
    for (let i = 0; i < N; i++) { g.fillStyle(COL[i], 1); g.fillPoints([{ x: lontano(i), y: fy }, { x: lontano(i + 1), y: fy }, { x: vicino(i + 1), y: ny }, { x: vicino(i), y: ny }], true); }
    // davanti più in ombra
    for (let k = 1; k <= 4; k++) {
      const y0 = fy + ((ny - fy) * k) / 5;
      g.fillStyle(0x1a0c06, 0.05); g.fillPoints([{ x: bordoSx(y0), y: y0 }, { x: bordoDx(y0), y: y0 }, { x: nx1, y: ny }, { x: nx0, y: ny }], true);
    }
    // le venature: righe un po' mosse lungo le assi
    for (let i = 0; i < N; i++) for (let j = 1; j <= 3; j++) {
      const u = (i + j / 4) / N, pts = [];
      for (let t = 0; t <= 1.0001; t += 0.05) {
        const y = fy + (ny - fy) * t, x = fx0 + (fx1 - fx0) * u + (nx0 + (nx1 - nx0) * u - (fx0 + (fx1 - fx0) * u)) * t;
        pts.push({ x: x + Math.sin(t * 9 + i * 2.1 + j * 1.7) * (0.5 + 1.4 * t), y });
      }
      g.lineStyle(0.7, j === 2 ? 0xd99248 : 0x6e3a14, j === 2 ? 0.35 : 0.5);
      g.strokePoints(pts, false);
    }
    // un nodo nel legno
    g.lineStyle(0.8, 0x6e3a14, 0.55); g.strokeEllipse(132, 205, 9, 3); g.strokeEllipse(132, 205, 4, 1.4);
    // le fessure tra le assi
    g.lineStyle(1.2, 0x4e2a0e, 0.85);
    for (let i = 1; i < N; i++) g.lineBetween(lontano(i), fy, vicino(i), ny);
    // il bordo davanti, spesso, con lo spigolo chiaro
    g.fillStyle(0x7a4216, 1); g.fillRect(nx0, ny, nx1 - nx0, bordo);
    g.fillStyle(0x5a300f, 1); g.fillRect(nx0, ny + bordo - 3, nx1 - nx0, 3);
    g.lineStyle(1.2, 0xeaa860, 0.55); g.lineBetween(nx0 + 2, ny + 0.9, nx1 - 2, ny + 0.9);
    g.lineStyle(2, 0x2b1b17, 1);
    g.strokePoints([{ x: fx0, y: fy }, { x: fx1, y: fy }, { x: nx1, y: ny }, { x: nx1, y: ny + bordo }, { x: nx0, y: ny + bordo }, { x: nx0, y: ny }], true);
    g.lineBetween(nx0, ny, nx1, ny);
  }

  // le cose sul tavolo, ognuna con la sua ombra (più piccole verso il fondo): la birra di Denny e
  // un'altra lasciata lì, le patatine, il posacenere, le carte, un mazzo di chiavi
  cose(g) {
    const k = (y) => 0.6 + (0.4 * (y - T.fy)) / (T.ny - T.fy);
    const ombra = (x, y, w, h) => { g.fillStyle(0x1a0a04, 0.4); g.fillEllipse(x + 1.6, y + 0.8, w, h); };
    // le birre
    for (const [x, y] of [[272, 152], [160, 190]]) this.boccale(g, x, y, k(y), ombra);
    // le patatine nella ciotola
    { const x = 248, y = 183, s = k(y);
      ombra(x, y + 2 * s, 40 * s, 12 * s);
      g.fillStyle(0xdcd4c4, 1); g.fillEllipse(x, y, 36 * s, 13 * s);
      g.fillStyle(0xb8ae9c, 1); g.fillEllipse(x, y + 2.5 * s, 30 * s, 8 * s);
      g.lineStyle(1.2, 0x2b1b17, 1); g.strokeEllipse(x, y, 36 * s, 13 * s);
      const P = [[-9, -1], [-3, -2.5], [4, -1.5], [10, -0.5], [-6, 1.5], [1, 1], [7, 2], [-1, -4]];
      for (const [dx, dy] of P) { g.fillStyle(0xf3c13a, 1); g.fillEllipse(x + dx * s, y + dy * s, 7 * s, 4 * s); g.lineStyle(0.6, 0xa87a18, 1); g.strokeEllipse(x + dx * s, y + dy * s, 7 * s, 4 * s); } }
    // il posacenere col mozzicone acceso
    { const x = 202, y = 166, s = k(y);
      ombra(x, y + 1, 26 * s, 8 * s);
      g.fillStyle(0x6a7078, 1); g.fillEllipse(x, y, 24 * s, 8.5 * s);
      g.fillStyle(0x34383e, 1); g.fillEllipse(x, y - 0.5 * s, 15 * s, 5 * s);
      g.lineStyle(1, 0x2b1b17, 1); g.strokeEllipse(x, y, 24 * s, 8.5 * s);
      g.lineStyle(2 * s, 0xf3efe4, 1); g.lineBetween(x + 1 * s, y - 1 * s, x + 9 * s, y - 3 * s);
      g.lineStyle(2 * s, 0xd8a060, 1); g.lineBetween(x + 1 * s, y - 1 * s, x + 3 * s, y - 1.5 * s);
      g.fillStyle(0xff7a2a, 1); g.fillCircle(x + 9.2 * s, y - 3.1 * s, 1.2 * s); }
    // le carte: il mazzo e tre carte sparse, stese sul tavolo
    const carta = (x, y, a, s, retro, seme) => {
      const cs = Math.cos(a), sn = Math.sin(a), pt = (u, v) => ({ x: x + (u * cs - v * sn) * s, y: y + (u * sn + v * cs) * 0.5 * s });
      const q = [pt(-6, -9), pt(6, -9), pt(6, 9), pt(-6, 9)];
      g.fillStyle(0x1a0a04, 0.35); g.fillPoints(q.map((p) => ({ x: p.x + 1.2, y: p.y + 0.8 })), true);
      g.fillStyle(retro ? 0x2f5aa8 : 0xfffaf0, 1); g.fillPoints(q, true);
      g.lineStyle(0.9, 0x2b1b17, 1); g.strokePoints(q, true);
      if (!retro) { g.fillStyle(seme, 1); g.fillCircle(x, y, 1.8 * s); }
      else { g.lineStyle(0.6, 0xffffff, 0.6); g.strokePoints([pt(-4, -7), pt(4, -7), pt(4, 7), pt(-4, 7)], true); }
    };
    for (let i = 0; i < 4; i++) carta(310, 192 - i * 0.7, -0.15, k(192), true);
    carta(288, 199, 0.35, k(199), false, 0xd8263a); carta(298, 204, -0.1, k(204), false, 0x1f1430); carta(322, 206, 0.6, k(206), false, 0xd8263a);
    // il mazzo di chiavi
    { const x = 120, y = 202, s = k(y);
      ombra(x + 3, y + 1, 18 * s, 5 * s);
      g.lineStyle(1.4 * s, 0xc8ccd4, 1); g.strokeEllipse(x, y, 8 * s, 4 * s);
      for (const [a, col] of [[0.2, 0xd8b048], [0.9, 0xc8ccd4], [-0.5, 0xd8b048]]) {
        const cx = x + Math.cos(a) * 4 * s, cy = y + Math.sin(a) * 2 * s, ex = cx + Math.cos(a) * 10 * s, ey = cy + Math.sin(a) * 4 * s;
        g.lineStyle(2 * s, col, 1); g.lineBetween(cx, cy, ex, ey);
        g.fillStyle(col, 1); g.fillCircle(cx + Math.cos(a) * 2 * s, cy + Math.sin(a) * s, 2.2 * s);
        g.lineStyle(0.6, 0x2b1b17, 0.8); g.strokeCircle(cx + Math.cos(a) * 2 * s, cy + Math.sin(a) * s, 2.2 * s);
      } }
  }

  // un boccale di birra in (x, y) (il fondo), grande k, con la sua ombra
  boccale(g, x, y, k = 1, ombra = null) {
    ombra?.(x + 2 * k, y, 16 * k, 5 * k);
    g.fillStyle(0xe8a220, 1); g.fillRect(x - 5 * k, y - 14 * k, 10 * k, 14 * k);
    g.fillStyle(0xf8cc52, 1); g.fillRect(x - 4 * k, y - 13 * k, 2.4 * k, 12 * k);
    g.fillStyle(0xfff6e0, 1); g.fillEllipse(x, y - 14 * k, 12 * k, 5 * k);
    g.lineStyle(1.1, 0x2b1b17, 1); g.strokeRect(x - 5 * k, y - 14 * k, 10 * k, 14 * k);
    g.lineStyle(1.6 * k, 0x2b1b17, 1); g.strokeCircle(x + 7.5 * k, y - 7 * k, 3.4 * k);
  }

  // ---------- chi siede al tavolo: pose e gesti ----------
  // una posa (dalle sue: riposo, ride, beve...) o una faccia di quelle che ci sono già (felice, shock,
  // triste, sufficienza); dopo ms torna a riposo. verso = da che parte la gira (se no la sua)
  posa(a, nome, ms = 0, verso = a.verso) {
    const key = a.tex[nome] ?? `${a.id}_${nome}`;
    if (!a.img.active || !this.textures.exists(key)) return;
    a.img.setTexture(key).setScale(scalaDi(key, TAGLIA)).setFlipX(verso < 0);
    const giro = ++a.gira;
    if (ms) this.time.delayedCall(ms, () => { if (a.gira === giro && this.stato !== 'fine') this.posa(a, 'riposo'); });
  }
  // rimette la figura al suo posto (dopo un gesto)
  fermo(a) {
    this.tweens.killTweensOf(a.img);
    a.img.setPosition(a.P.x, a.P.y).setAngle(3 * a.verso);
  }
  testa(a) { return { x: a.P.x, y: a.P.y + 0.3 * a.h * (100 - 240) }; }
  // ride: le braccia al cielo (con la birra), ondeggia e sobbalza
  ride(a, ms = 1100, ritardo = 0, piega = false) {
    this.time.delayedCall(ritardo, () => {
      if (!a.img.active || this.stato === 'fine') return;
      this.posa(a, a.tex.ride ? 'ride' : 'felice', ms);
      this.fermo(a);
      if (piega) this.tweens.add({ targets: a.img, angle: 3 * a.verso + 8 * a.verso, y: a.P.y + 3, duration: 180, yoyo: true, hold: ms - 420, onComplete: () => this.fermo(a) });
      else this.tweens.add({ targets: a.img, y: a.P.y + 2.5, angle: { from: 3 * a.verso - 5, to: 3 * a.verso + 5 }, duration: 150, yoyo: true, repeat: Math.max(1, Math.round(ms / 300) - 1), onComplete: () => this.fermo(a) });
    });
  }
  // batte la mano sul tavolo, due volte: TOC! (la mano si alza e poi sbatte sul piano)
  batte(a) {
    const colpo = (t) => this.time.delayedCall(t, () => {
      if (!a.img.active) return;
      this.posa(a, 'batteGiu');
      Audio.sfx('toc');
      this.fermo(a);
      this.tweens.add({ targets: a.img, y: a.P.y + 3, duration: 70, yoyo: true });
      const x = a.P.x + 30 * a.verso, y = a.P.y - 2, s = this.add.graphics();
      s.lineStyle(1.6, 0xfff3c0, 1);
      for (let i = 0; i < 6; i++) { const ang = Math.PI * (1.05 + i * 0.18); s.lineBetween(x + Math.cos(ang) * 5, y + Math.sin(ang) * 3, x + Math.cos(ang) * 11, y + Math.sin(ang) * 6); }
      this.sala.add(s);
      this.tweens.add({ targets: s, alpha: 0, duration: 380, onComplete: () => s.destroy() });
    });
    this.posa(a, 'batteSu');
    colpo(130);
    this.time.delayedCall(300, () => { if (a.img.active) this.posa(a, 'batteSu'); });
    colpo(430);
    this.time.delayedCall(620, () => this.ride(a, 600));
  }
  // sputa la birra: la faccia sconvolta e lo spruzzo dalla bocca verso il tavolo, poi si piega dal ridere
  sputa(a) {
    this.posa(a, 'shock');
    this.fermo(a);
    Audio.sfx('spruzzo');
    const x = a.P.x + 3 * a.verso, y = a.P.y + 0.3 * a.h * (150 - 240);
    for (let i = 0; i < 16; i++) {
      const d = this.add.ellipse(x, y, 3.2, 2.6, i % 3 ? 0xffc23a : 0xfff6e0);
      this.sala.add(d);
      this.tweens.add({ targets: d, x: x + a.verso * (14 + Math.random() * 34), y: y + 6 + Math.random() * 22, alpha: 0, scale: 0.5, duration: 420 + Math.random() * 220, ease: 'Quad.out', onComplete: () => d.destroy() });
    }
    this.tweens.add({ targets: a.img, angle: 3 * a.verso - 6 * a.verso, duration: 90, yoyo: true });
    this.time.delayedCall(560, () => this.ride(a, 700, 0, true));
  }
  // indica qualcuno (Denny, in alto, o chi gioca), ridendo
  indica(a, dove, ms = 950) {
    const v = Math.sign(dove.x - a.P.x) || a.verso, su = dove.y < this.testa(a).y - 12;
    this.posa(a, su ? 'indicaSu' : 'indica', ms, v);
    this.fermo(a);
    this.tweens.add({ targets: a.img, y: a.P.y + 2, duration: 140, yoyo: true, repeat: Math.round(ms / 280) - 1, onComplete: () => this.fermo(a) });
  }
  // annuisce convinto
  annuisce(a, ritardo = 0) {
    this.time.delayedCall(ritardo, () => {
      if (!a.img.active) return;
      this.posa(a, 'riposo');
      this.fermo(a);
      this.tweens.add({ targets: a.img, angle: 3 * a.verso + 4 * a.verso, y: a.P.y + 1.5, duration: 160, yoyo: true, repeat: 2, onComplete: () => this.fermo(a) });
    });
  }
  // beve un sorso
  beve(a) {
    this.posa(a, 'beve', 1100);
    this.time.delayedCall(380, () => Audio.sfx('glu'));
  }
  // sbadiglia (gli occhi socchiusi e le braccia conserte, la testa indietro)
  sbadiglia(a) {
    this.posa(a, 'sufficienza', 1200);
    Audio.sfx('sbadiglio');
    this.fermo(a);
    this.tweens.add({ targets: a.img, angle: 3 * a.verso - 7 * a.verso, duration: 420, yoyo: true, hold: 360, onComplete: () => this.fermo(a) });
  }
  // due che si guardano: si girano uno verso l'altro
  siGuardano(a, b) {
    for (const [p, q] of [[a, b], [b, a]]) {
      const v = Math.sign(q.P.x - p.P.x) || p.verso;
      this.posa(p, 'riposo', 0, v);
      this.fermo(p);
      this.tweens.add({ targets: p.img, angle: 3 * p.verso + 7 * v, duration: 240, yoyo: true, hold: 700, onComplete: () => { this.fermo(p); this.posa(p, 'riposo'); } });
    }
  }
  // applaude (le mani che battono davanti al petto, e su), piegato verso qualcuno (senza girarsi: la
  // birra resta dalla sua parte, lontano dagli altri)
  applaude(a, verso, volte = 8) {
    this.fermo(a);
    a.img.setAngle(3 * a.verso + 4 * verso);
    for (let i = 0; i < volte * 2; i++) this.time.delayedCall(i * 140, () => { if (a.img.active) this.posa(a, i % 2 ? 'ride' : 'applaude'); });
  }
  // chi gioca: contento, mogio o sorpreso per un po'
  reagisci(espr, ms) {
    const a = this.io;
    this.posa(a, espr, ms);
    this.fermo(a);
    if (espr === 'felice') this.tweens.add({ targets: a.img, y: a.P.y - 3, duration: 140, yoyo: true, repeat: 1 });
    else this.tweens.add({ targets: a.img, angle: 3 * a.verso - 4 * a.verso, duration: 200, yoyo: true, hold: ms - 500 });
  }
  get versoDenny() { return { x: DENNY.x, y: this.dennyY + 0.5 * DENNY.taglia * (100 - 240) }; }
  ruolo(r) { return this.ascoltatori.find((a) => a.ruolo === r); }

  // il tavolo ride di Denny (proverbio corretto): ognuno a modo suo; chi gioca se la gode
  ridonoDiDenny() {
    Audio.sfx('risate');
    this.batte(this.ruolo('batte'));
    this.time.delayedCall(90, () => this.sputa(this.ruolo('sputa')));
    this.time.delayedCall(40, () => this.indica(this.ruolo('indica'), this.versoDenny, 1100));
    this.reagisci('felice', 1000);
  }
  // il tavolo ride di chi gioca (risposta sbagliata), uno lo indica
  ridonoDiTe() {
    Audio.sfx('risate');
    this.indica(this.ruolo('indica'), this.testa(this.io), 900);
    this.ride(this.ruolo('batte'), 900, 60, true);
    this.ride(this.ruolo('sputa'), 900, 120);
    this.reagisci('triste', 900);
  }
  mescolaDi(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // nell'attesa, ogni tanto: uno beve, due vicini si guardano, uno sbadiglia
  gesto() {
    const A = this.ascoltatori, a = A[Math.floor(this.rnd() * A.length)], r = this.rnd();
    if (r < 0.45) this.beve(a);
    else if (r < 0.8) this.siGuardano(a, a.P === POSTI[2] ? this.io : a.P === POSTI[0] ? A.find((x) => x.P === POSTI[1]) : A.find((x) => x.P === POSTI[0]));
    else this.sbadiglia(a);
  }

  // ---------- Denny ----------
  faccDenny(nome) {
    const key = FACCE_DENNY[nome];
    this.dennyImg.setTexture(key).setScale(scalaDi(key, DENNY.taglia));
  }
  // terzo atto: Denny sale in piedi sulla sedia (e alla fine scende)
  sullaSedia(si) {
    const D = DENNY;
    this.sedia.setVisible(si);
    this.dennyY = si ? D.vita - D.sedia : D.vita;
    this.tweens.add({ targets: this.denny, y: this.dennyY, duration: 280, ease: 'Back.out', onUpdate: () => this.disegnaFumetto() });
  }

  // ---------- la casella e il layout ----------
  apriCasella() {
    if (this.casella) return;
    this.casella = casellaTesto({ invio: (t) => this.risposta(t), cambia: () => { this.cambiata = true; } });
    this.casella.mettiIn(this.posti());
    this.cambiata = true;
  }

  // alla ripresa dopo la pausa: la casella di nuovo (sul telefono va ritoccato SCRIVI)
  alRientro() { this.apriCasella(); this.chiaveLayout = ''; this.disponi(); }

  chiudiCasella() { this.casella?.chiudi(); this.casella = null; this.cambiata = true; }

  pulisci() {
    this.chiudiCasella();
    this.events.off('pause', this.alPausa);
    // prima le immagini, poi le texture create qui
    this.sala?.destroy(true);
    this.lucine?.destroy(true);
    this.sfondo?.destroy();
    for (const k of this.creati ?? []) if (this.textures.exists(k)) this.textures.remove(k);
  }

  termina() {
    this.chiudiCasella();
    this.stato = 'fine';     // (le correzioni ancora in arrivo non partono più)
    super.termina();
  }

  posti() {
    const L = this.L;
    return { casella: L.casella, ok: L.ok, scrivi: { x: L.casella.x, y: L.casella.y, w: L.ok.x + L.ok.w - L.casella.x, h: L.casella.h } };
  }

  // sul telefono: la tastiera aperta copre metà schermo, tutto sale nella parte che si vede
  controllaTastiera() {
    if (!eTouch() || !this.casella) return;
    const k = this.casella.tastiera(), a = Math.round(k.alto / 6) * 6, b = Math.round(k.basso / 6) * 6;
    const chiave = k.aperta ? `alto${a}-${b}` : 'normale';
    if (chiave === this.chiaveLayout) return;
    this.chiaveLayout = chiave;
    this.L = k.aperta ? ALTO(a, b) : NORMALE();
    this.disponi();
  }

  disponi() {
    const L = this.L, s = L.sala;
    this.sala.setPosition(s.x, s.y).setScale(s.k);
    this.fascia.setVisible(!!L.normale);
    this.scriviProverbio(false);
    this.disegnaFumetto();
    const cx = L.casella.x + L.casella.w / 2;
    this.aiuto.setPosition(cx, L.casella.y + L.casella.h + 7).setVisible(!!L.normale && !eTouch());
    this.testoSerie.setPosition(eTouch() ? L.ok.x + L.ok.w + 6 : L.casella.x + L.casella.w + 8, L.casella.y + L.casella.h / 2);
    if (eTouch() && L.normale) this.testoSerie.setPosition(L.casella.x + 4, L.casella.y - 9);
    this.casella?.mettiIn(this.posti());
    this.cambiata = true;
    this.disegnaCasella();
    this.disegnaBarra2();
  }

  // dove ha la bocca Denny, sullo schermo (il fumetto punta lì, alla guancia), e la cima della testa
  bocca() {
    const D = DENNY, s = this.L.sala, y = (g) => this.denny.y + 0.5 * D.taglia * (g - 240);
    return { x: s.x + (D.x - 17) * s.k, y: s.y + y(140) * s.k, testa: s.y + y(29) * s.k };
  }

  // il fumetto della misura giusta per hTesto unità di testo: a tastiera chiusa alto quanto serve, con
  // la barra del tempo subito sotto; con la tastiera aperta fisso, come lo dà il layout
  misuraFumetto(hTesto) {
    const F0 = this.L.fumetto;
    const h = F0.fisso ? F0.h : Math.max(30, Math.min(F0.h, hTesto + 14));
    this.F = { x: F0.x, y: F0.y, w: F0.w, h };
    this.barraF = F0.fisso ? this.L.barra : { x: F0.x + 10, y: F0.y + h + 4, w: F0.w - 20 };
  }

  // il fumetto: bianco, con la punta verso la bocca di Denny (a destra)
  disegnaFumetto() {
    const F = this.F, g = this.gFumetto, M = Phaser.Math, b = this.bocca();
    const y1 = M.Clamp(b.y - 24, F.y + 8, F.y + F.h - 24), y2 = y1 + 14;
    const C = [M.Clamp(b.x, F.x + F.w + 8, F.x + F.w + 66), M.Clamp(b.y, F.y + 6, F.y + F.h + 30)];
    const A = [F.x + F.w - 3, y1], B = [F.x + F.w - 3, y2];
    g.clear();
    g.fillStyle(0x000000, 0.32); g.fillRoundedRect(F.x + 2, F.y + 3, F.w, F.h, 12); g.fillTriangle(A[0] + 2, A[1] + 3, B[0] + 2, B[1] + 3, C[0] + 2, C[1] + 3);
    g.fillStyle(0xfffaf0, 1); g.fillRoundedRect(F.x, F.y, F.w, F.h, 11);
    g.lineStyle(3, 0x2b1b17, 1); g.strokeRoundedRect(F.x, F.y, F.w, F.h, 11);
    g.fillTriangle(A[0], A[1], B[0], B[1], C[0], C[1]);
    g.beginPath(); g.moveTo(A[0] + 1.5, A[1]); g.lineTo(C[0], C[1]); g.lineTo(B[0] + 1.5, B[1]); g.strokePath();
    this.perlaTesto.setPosition(F.x + 50, F.y - 2);
  }

  // la casella che si vede: il riquadro, il testo (dal valore dell'input) e il cursore che lampeggia
  // al suo posto; vuota, il suggerimento (Facile) in grigio
  disegnaCasella() {
    const Q = this.L.casella, g = this.gCasella, cas = this.casella;
    const fuoco = !!cas && (cas.haFuoco() || !eTouch()), valore = cas?.valore ?? '';
    g.clear();
    g.fillStyle(0x000000, 0.4); g.fillRoundedRect(Q.x + 2, Q.y + 3, Q.w, Q.h, 10);
    g.fillStyle(0x1f1430, 1); g.fillRoundedRect(Q.x, Q.y, Q.w, Q.h, 10);
    g.lineStyle(3, fuoco ? 0xffe14a : 0x9a8cc8, 1); g.strokeRoundedRect(Q.x, Q.y, Q.w, Q.h, 10);
    const vuota = !valore, mostra = vuota ? this.segnaposto ?? '' : valore;
    // il testo: grande, e più piccolo solo se non ci sta (mai sotto 8)
    let size = this.L.sizeCasella;
    this.testoCasella.setFontSize(size * 1.3).setText(mostra);
    while (this.testoCasella.width - 6 > Q.w - 16 && size > 8) { size -= 1; this.testoCasella.setFontSize(size * 1.3); }
    const w = this.testoCasella.width - 6, x0 = Q.x + (Q.w - w) / 2;
    this.testoCasella.setPosition(x0 - 3, Q.y + Q.h / 2).setOrigin(0, 0.5).setColor(vuota ? '#8f86a6' : '#ffffff');
    // il cursore: dove sta nell'input (sul telefono, solo quando la tastiera è aperta)
    let cx = x0;
    if (!vuota) { this.misura.setFontSize(size * 1.3).setText(valore.slice(0, Math.min(valore.length, cas.cursore))); cx = x0 + Math.max(0, this.misura.width - 6); }
    else cx = Q.x + Q.w / 2;
    this.cursore.setPosition(cx + 1, Q.y + Q.h / 2).setSize(2, size * 1.3 * 0.95);
    this.cursoreAcceso = fuoco && this.stato === 'risposta';
    this.cambiata = false;
  }

  // la casella trema (risposta sbagliata)
  tremaCasella() {
    this.tweens.killTweensOf(this.vCasella);
    this.vCasella.x = 0;
    this.tweens.add({ targets: this.vCasella, x: { from: -8, to: 8 }, duration: 55, yoyo: true, repeat: 2, onComplete: () => { this.vCasella.x = 0; } });
  }

  // ---------- il proverbio ----------
  nuovoProverbio() {
    if (!this.inCorso && this.visti) return;
    const c = this.cfg, atto = this.attoA(this.trascorso);
    // (ogni atto il suo livello: il primo i facili, il secondo i medi, il terzo i difficili)
    this.prov = leggi(c.proverbi[this.pesca(LIVELLI[Math.min(2, c.atti.indexOf(atto))])]);
    this.ricorda(this.prov.testo);
    this.visti++;
    this.sottolinea = !c.sottolineaMai && (c.sottolineaSempre || atto.sottolinea);
    this.limite = atto.tempo;
    this.leggibile = atto.leggibile ?? null;
    this.svelto = !!atto.svelto;
    this.tProv = 0;
    this.sbiadito = false;
    this.correzione = null;
    this.stato = 'risposta';
    this.casella?.svuota();
    // (Facile) la prima lettera in grigio nella casella
    this.segnaposto = c.suggerimento ? this.prov.giusta[0].toLowerCase() + '…' : '';
    this.cambiata = true;
    this.perlaTesto.setVisible(this.prov.perla);
    this.faccDenny(this.svelto ? 'proclama' : 'saggio');
    this.scriviProverbio(true);
    this.disegnaFumetto();
    // nel terzo atto il tavolo ride già prima che Denny finisca
    if (this.svelto) for (const [i, a] of this.mescolaDi([...this.ascoltatori]).slice(0, 2).entries()) this.ride(a, 700, 350 + i * 160);
  }

  // le parole del proverbio, una per una (così la sbagliata si sottolinea e si cancella), a capo
  // quando serve: il fumetto resta stretto e si allunga in giù; il testo si rimpicciolisce solo se
  // proprio non ci sta (mai sotto 8)
  scriviProverbio(entra) {
    for (const t of this.parole) t.destroy();
    this.parole = [];
    this.rigaRossa?.stop(); this.rigaRossa = null;
    this.gSegni.clear(); this.gPillola.clear().setAlpha(1);
    this.giustaTesto?.destroy(); this.giustaTesto = null;
    if (!this.prov) return;
    const F0 = this.L.fumetto, p = this.prov;
    const maxTesto = F0.fisso ? F0.h - Math.min(18, F0.h * 0.25) : F0.h - 14, maxW = F0.w - (F0.fisso ? 26 : 18);
    let size = this.L.size, righe, misure, alt;
    const crea = () => {
      for (const t of this.parole) t.destroy();
      this.parole = [];
      const pezzi = [];
      const parola = (s, sbagliata = false) => { const t = txt(this, 0, 0, s, { size, color: INCHIOSTRO, thick: 0, depth: 33, ox: 0 }); this.parole.push(t); return { t, w: t.width - 6, sbagliata }; };
      for (const s of p.prima) pezzi.push([parola(s)]);
      pezzi.push([p.pre && parola(p.pre), parola(p.dice, true), p.post && parola(p.post)].filter(Boolean));
      for (const s of p.dopo) pezzi.push([parola(s)]);
      const spazio = size * 1.3 * 0.32;
      righe = [[]]; let w = 0;
      for (const gruppo of pezzi) {
        const gw = gruppo.reduce((a, q) => a + q.w, 0);
        if (righe[righe.length - 1].length && w + spazio + gw > maxW) { righe.push([]); w = 0; }
        w += (righe[righe.length - 1].length ? spazio : 0) + gw;
        righe[righe.length - 1].push(gruppo);
      }
      misure = { spazio, riga: size * 1.3 * 1.2 };
      alt = righe.length * misure.riga;
    };
    crea();
    while (alt > maxTesto && size > 8) { size -= 1; crea(); }
    this.sizeTesto = size;
    this.misuraFumetto(alt);
    // a posto: righe centrate nel fumetto
    const F = this.F;
    let y = F.y + (F.h - alt) / 2 + misure.riga / 2 + (this.prov.perla ? 2 : 0);
    let ordine = 0;
    this.sbagliata = null;
    for (const r of righe) {
      const w = r.reduce((a, gr) => a + gr.reduce((b, q) => b + q.w, 0), 0) + misure.spazio * (r.length - 1);
      let x = F.x + (F.w - w) / 2;
      for (const gr of r) {
        for (const q of gr) {
          q.t.setPosition(x - 3, y).setOrigin(0, 0.5);
          if (q.sbagliata) this.sbagliata = { x, y, w: q.w, t: q.t };
          q.t.ordine = ordine;
          x += q.w;
        }
        ordine++;
        x += misure.spazio;
      }
      y += misure.riga;
    }
    // Denny parla in fretta (terzo atto): le parole arrivano una dopo l'altra
    if (entra && this.svelto) {
      for (const t of this.parole) { t.setAlpha(0); this.time.delayedCall(t.ordine * 60, () => t.setAlpha(1)); }
      this.rivelato = (ordine * 60) / 1000;
    } else this.rivelato = 0;
    if (entra && !this.svelto) for (const t of this.parole) { t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 140, delay: t.ordine * 12 }); }
    this.disegnaSegni(false);
    if (!entra) this.sbiadisci(this.sbiadito, true);
  }

  // la sottolineatura della parola sbagliata, o la correzione (riga rossa e la parola giusta sopra)
  disegnaSegni(anima) {
    const g = this.gSegni, s = this.sbagliata;
    g.clear(); this.gPillola.clear();
    if (!s || !this.prov) return;
    const fs = this.sizeTesto * 1.3;
    if (!this.correzione && this.sottolinea && this.stato === 'risposta') {
      g.lineStyle(2.2, 0xe23b4e, 1); g.lineBetween(s.x - 1, s.y + fs * 0.55, s.x + s.w + 1, s.y + fs * 0.55);
    }
    if (!this.correzione) return;
    const riga = { w: anima ? 0 : s.w + 4 };
    const traccia = () => { g.clear(); g.lineStyle(2.8, 0xd8263a, 1); g.lineBetween(s.x - 2, s.y + 1, s.x - 2 + riga.w, s.y - 1); };
    traccia();
    this.rigaRossa?.stop();
    this.rigaRossa = anima ? this.tweens.add({ targets: riga, w: s.w + 4, duration: 160, onUpdate: traccia }) : null;
    s.t.setAlpha(0.55);
    const col = this.correzione === 'giusto' ? GIUSTA : SCADUTA;
    this.giustaTesto?.destroy();
    this.giustaTesto = txt(this, s.x + s.w / 2, s.y - fs * 0.92, this.prov.giusta, { size: this.sizeTesto, color: col, stroke: '#fffaf0', thick: 4, depth: 34 });
    // (un fondino chiaro col bordo del suo colore: si legge anche sopra la riga di prima)
    const pw = this.giustaTesto.width + 2, ph = fs * 1.05, px = s.x + s.w / 2 - pw / 2, py = s.y - fs * 0.92 - ph / 2, pc = this.correzione === 'giusto' ? 0x1e8a4a : 0x2f6fd8;
    this.gPillola.clear().fillStyle(0xfffaf0, 1).fillRoundedRect(px, py, pw, ph, ph / 2).lineStyle(1.6, pc, 1).strokeRoundedRect(px, py, pw, ph, ph / 2);
    if (anima) { this.giustaTesto.setScale(0.2); this.gPillola.setAlpha(0); this.tweens.add({ targets: this.giustaTesto, scale: 1, duration: 220, delay: 120, ease: 'Back.out' }); this.tweens.add({ targets: this.gPillola, alpha: 1, duration: 140, delay: 120 }); }
  }

  // terzo atto: il fumetto sbiadisce (resta la casella)
  sbiadisci(si, subito = false) {
    const oggetti = [this.gFumetto, this.gSegni, this.gPillola, ...this.parole, this.perlaTesto];
    if (this.giustaTesto) oggetti.push(this.giustaTesto);
    this.tweens.killTweensOf(oggetti.filter((o) => o !== this.perlaTesto));
    if (subito) { for (const o of oggetti) o.setAlpha(si ? 0 : o === this.sbagliata?.t && this.correzione ? 0.55 : 1); return; }
    this.tweens.add({ targets: oggetti, alpha: si ? 0 : 1, duration: si ? 450 : 120 });
  }

  // ---------- la risposta ----------
  accettata(testo) {
    const c = this.cfg, t = norma(testo), giusta = norma(this.prov.giusta), sbagliata = norma(this.prov.dice);
    if (t === sbagliata) return false;                 // la parola di Denny non vale mai
    if (t === giusta) return true;
    return giusta.length >= c.lunghezzaTolleranza && levenshtein(t, giusta) <= c.tolleranza;
  }

  risposta(testo) {
    if (!this.inCorso || this.stato !== 'risposta' || !norma(testo)) return;
    if (this.accettata(testo)) this.giusto(); else this.sbagliato();
  }

  molt() { return this.cfg.serie.reduce((m, [n, k]) => (this.serie >= n ? k : m), 1); }

  giusto() {
    const c = this.cfg, p = this.prov, veloce = this.tProv < c.secondiVeloce;
    const valore = (c.punti + (veloce ? c.bonusVeloce : 0)) * this.molt() * (p.perla ? c.perla : 1);
    this.giusti++; this.serie++;
    if (p.perla) this.perle++;
    // la scala delle medaglie: fino all'obiettivo al massimo tettoPrima; l'obiettivo porta almeno
    // al bronzo (in Lampo le medaglie non contano: i punti e basta)
    const ob = this.obiettivo, bronzo = c.medaglie.bronzo;
    if (this.lampo) this.punti += valore;
    else if (this.giusti < ob) this.punti = Math.min(c.tettoPrima, this.punti + valore);
    else if (this.giusti === ob) this.punti = Math.max(bronzo, this.punti + valore);
    else this.punti += valore;
    this.stato = 'giusto';
    this.correzione = 'giusto';
    this.casella?.svuota();
    this.sbiadisci(false, true);
    this.disegnaSegni(true);
    Audio.sfx('ding');
    const L = this.L, F = this.F;
    const pt = txt(this, L.casella.x + L.casella.w / 2, L.casella.y - 6, `+${numero(valore, valore % 1 ? 1 : 0)}${veloce ? '  VELOCE!' : ''}`, { size: 9, color: '#7dff9a', depth: 40 });
    this.tweens.add({ targets: pt, y: pt.y - 16, alpha: 0, duration: 800, onComplete: () => pt.destroy() });
    if (p.perla) { scritta(this, F.x + F.w / 2, F.y + 10, 'PERLA ORIGINALE! x2', { size: 13, color: '#ffe14a' }); Audio.sfx('applauso'); stelle(this, F.x + F.w / 2, F.y + 10, 8, 940); }
    if (this.giusti === ob) { scritta(this, 240, 62, `${ob} GIUSTI!`, { size: 12, color: '#7dff9a', durata: 900 }); Audio.sfx('bonus'); }
    // il tavolo ride di Denny; lui si offende e ribatte
    this.ridonoDiDenny();
    this.faccDenny('offeso');
    this.frase(caso(c.frasiOffeso), 1100);
    Audio.sfx('borbottio');
    this.hud();
    this.time.delayedCall(c.pausaGiusto * 1000, () => this.nuovoProverbio());
  }

  sbagliato() {
    const c = this.cfg;
    this.serie = 0;
    this.punti = Math.max(!this.lampo && this.giusti >= this.obiettivo ? c.medaglie.bronzo : 0, this.punti - c.sbaglio);
    this.tremaCasella();
    this.casella?.svuota();
    Audio.sfx('errore');
    vibra(60);
    const L = this.L, pt = txt(this, L.casella.x + L.casella.w / 2, L.casella.y - 6, `-${c.sbaglio}`, { size: 9, color: '#ff8a7a', depth: 40 });
    this.tweens.add({ targets: pt, y: pt.y - 14, alpha: 0, duration: 700, onComplete: () => pt.destroy() });
    // il tavolo ride di chi gioca, Denny gongola, poi torna saggio
    this.ridonoDiTe();
    this.faccDenny('gongola');
    this.frase(caso(c.frasiGongola), 1000);
    this.time.delayedCall(900, () => { if (this.stato === 'risposta') this.faccDenny(this.svelto ? 'proclama' : 'saggio'); });
    this.hud();
  }

  // tempo del proverbio finito: VERITÀ DEFINITIVA (il tavolo annuisce convinto), poi il proverbio giusto per un attimo
  scaduto() {
    const c = this.cfg, F = this.F;
    this.stato = 'scaduto';
    this.serie = 0;
    this.casella?.svuota();
    Audio.sfx('tamburo');
    this.sbiadisci(false, true);
    this.disegnaSegni(false);
    this.faccDenny('proclama');
    this.tweens.add({ targets: this.denny, angle: { from: -3, to: 3 }, duration: 90, yoyo: true, repeat: 3, onComplete: () => this.denny.setAngle(0) });
    // (grande sul tavolo, come gli atti: il proverbio nel fumetto resta da leggere)
    if (this.L.normale) scritta(this, 240, 176, 'VERITÀ DEFINITIVA!', { size: 15, color: '#ff6b5a', durata: 650 });
    else scritta(this, F.x + F.w / 2, F.y + F.h / 2, 'VERITÀ DEFINITIVA!', { size: 15, color: '#ff6b5a', durata: 650 });
    this.frase(caso(c.frasiVerita), 1300);
    this.ascoltatori.forEach((a, i) => this.annuisce(a, 150 + i * 90));
    this.reagisci('shock', 900);
    this.time.delayedCall(700, () => { if (this.stato !== 'scaduto') return; this.correzione = 'scaduto'; this.disegnaSegni(true); });
    this.hud();
    this.time.delayedCall(c.pausaScaduto * 1000, () => this.nuovoProverbio());
  }

  // una battuta di Denny, nel fumettino sopra la sua testa (a destra del fumetto grande)
  frase(s, ms) {
    this.fumettino?.destroy();
    const b = this.bocca(), F = this.F;
    this.fumettino = fumetto(this, b.x, Math.max(36, b.testa - 8), s, ms, 960);
    const w = (this.fumettino.list[1]?.width ?? 100) + 10;
    this.fumettino.x = Math.max(F.x + F.w + w / 2 + 6, Math.min(476 - w / 2, b.x));
  }

  hud() {
    this.testoPunti.setText(puntiHud(this.punti));
    const ob = this.obiettivo;
    this.testoGiusti.setText(`GIUSTI: ${this.giusti}/${ob}`).setColor(this.giusti >= ob ? '#7dff9a' : '#ffe14a');
    const m = this.molt();
    this.testoSerie.setText(m > 1 ? `SERIE x${numero(m, m % 1 ? 1 : 0)}` : '');
  }

  // la barra del tempo del proverbio, sotto il fumetto
  disegnaBarra2() {
    const B = this.barraF, g = this.gBarra, r = this.stato === 'risposta' ? Math.max(0, 1 - this.tProv / this.limite) : 0;
    g.clear();
    if (!B) return;
    g.fillStyle(0x1f1430, 0.92); g.fillRoundedRect(B.x, B.y, B.w, 7, 3.5);
    g.fillStyle(r < 0.3 ? 0xf87171 : r < 0.6 ? 0xfacc15 : 0x7dd3fc, 1);
    if (r > 0.01) g.fillRoundedRect(B.x + 1.5, B.y + 1.5, (B.w - 3) * r, 4, 2);
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    this.controllaTastiera();
    this.casella?.aggiorna();
    // la casella che si vede: si ridisegna quando cambia il testo (o il focus); il cursore lampeggia
    const f = !!this.casella?.haFuoco();
    if (this.cambiata || f !== this.avevaFuoco || this.casella?.valore !== this.ultimoValore) { this.avevaFuoco = f; this.ultimoValore = this.casella?.valore; this.disegnaCasella(); }
    this.cursore.setVisible(this.cursoreAcceso && this.stato === 'risposta' && Math.floor(this.time.now / 530) % 2 === 0);
    // gli atti si annunciano, grandi sul tavolo (il terzo: Denny sale in piedi sulla sedia)
    const atto = this.cfg.atti.indexOf(this.attoA(this.trascorso));
    if (atto !== this.nAtto) {
      this.nAtto = atto;
      Audio.sfx(atto === 2 ? 'scatena' : 'bonus');
      if (atto === 2) this.sullaSedia(true);
      const L = this.L, F = this.F, x = L.normale ? 240 : F.x + F.w / 2, y = L.normale ? 176 : this.barraF.y + 4;
      scritta(this, x, y, this.cfg.atti[atto].nome, { size: 15, color: atto === 2 ? '#ff6b5a' : '#ffe14a', durata: 900, depth: 950 });
    }
    if (this.stato === 'risposta') {
      this.tProv += dt;
      // terzo atto: dopo un po' il fumetto sbiadisce
      if (this.leggibile && !this.sbiadito && this.tProv >= this.rivelato + this.leggibile) { this.sbiadito = true; this.sbiadisci(true); }
      if (this.tProv >= this.limite) this.scaduto();
      // nell'attesa, al tavolo: ogni tanto un gesto
      if (this.trascorso >= this.prossimoGesto) { this.gesto(); this.prossimoGesto = this.trascorso + 2.6 + this.rnd() * 2.4; }
    }
    this.disegnaBarra2();
  }

  risultato() {
    const ob = this.obiettivo;
    return {
      punteggio: Math.round(this.punti),
      vittoria: this.giusti >= ob,
      riepilogo: `${quanti(this.giusti, 'proverbio corretto', 'proverbi corretti')} su ${this.visti}` + (this.perle ? ` (${quanti(this.perle, 'perla', 'perle')})` : ''),
      titoli: ['DENNY SI ARRENDE!', 'HA RAGIONE DENNY!'],
    };
  }

  // ---------- la fine ----------
  // Vinci: tutto il tavolo applaude chi gioca, e Denny incrocia le braccia, offeso. Perdi: Denny
  // brinda da solo, in piedi sulla sedia, e il tavolo gli batte le mani (e proclama l'ultima perla,
  // tra i coriandoli). Al massimo 3 secondi; si salta con un tocco, INVIO o SPAZIO.
  finale(ris, fatto) {
    const c = this.cfg;
    this.chiudiCasella();
    this.L = NORMALE();
    this.sala.setPosition(0, 0).setScale(1);
    this.fascia.setVisible(true);
    for (const o of [this.gBarra, this.aiuto, this.testoSerie, this.perlaTesto, this.gSegni, this.gPillola, this.vCasella]) o.setVisible(false);
    this.giustaTesto?.destroy();
    this.fumettino?.destroy();
    let chiuso = false;
    const fine = () => { if (chiuso) return; chiuso = true; fatto(); };
    this.time.delayedCall(400, () => {
      for (const k of ['ENTER', 'SPACE']) this.input.keyboard.once('keydown-' + k, fine);
      this.input.once('pointerdown', fine);
    });
    const titolo = txt(this, 240, 26, ris.titoloFine, { size: 20, color: ris.vittoria ? '#7dff9a' : '#ff6b5a', depth: 1100 });
    this.tweens.add({ targets: titolo, scale: { from: 1.6, to: 1 }, duration: 260, ease: 'Back.out' });
    this.respiro?.stop();
    this.denny.setAngle(0).setScale(1);
    for (const a of this.tutti) { a.gira++; this.fermo(a); }
    let frase;
    if (ris.vittoria) {
      // Denny seduto, braccia incrociate; il tavolo applaude chi gioca, che esulta
      if (this.dennyY !== DENNY.vita) this.sullaSedia(false);
      this.faccDenny('offeso');
      frase = c.fraseResa;
      Audio.sfx('vittoria'); Audio.sfx('applauso');
      for (const a of this.ascoltatori) this.applaude(a, Math.sign(this.io.P.x - a.P.x) || 1, 9);
      this.posa(this.io, 'felice');
      this.tweens.add({ targets: this.io.img, y: this.io.P.y - 4, duration: 160, yoyo: true, repeat: 5 });
      const t = this.testa(this.io);
      stelle(this, t.x, t.y, 10, 1050);
    } else {
      // Denny in piedi sulla sedia, la birra alzata, da solo; il tavolo gli batte le mani
      if (this.dennyY === DENNY.vita) this.sullaSedia(true);
      this.faccDenny('brinda');
      this.tweens.add({ targets: this.denny, angle: { from: -2, to: 2 }, duration: 260, yoyo: true, repeat: 3, onComplete: () => this.denny.setAngle(0) });
      const v = leggi(caso(c.proverbi));
      frase = `${caso(c.frasiSedia)} ${[...v.prima, v.pre + v.dice + v.post, ...v.dopo].join(' ')}!`;
      Audio.sfx('tintinnio'); Audio.sfx('applauso');
      for (const a of this.ascoltatori) this.applaude(a, Math.sign(DENNY.x - a.P.x) || 1, 8);
      this.posa(this.io, 'triste');
      const COL = [0xff5a6a, 0x5ab4ff, 0xffe14a, 0x7dff9a, 0xff9ac4, 0xb06aff];
      this.time.addEvent({ delay: 45, repeat: 40, callback: () => {
        const r = this.add.rectangle(Math.random() * 480, -6, 3.2, 5, caso(COL)).setAngle(Math.random() * 360).setDepth(1050);
        this.tweens.add({ targets: r, y: 280, x: r.x + (Math.random() - 0.5) * 70, angle: r.angle + 500, duration: 1300 + Math.random() * 700, onComplete: () => r.destroy() });
      } });
    }
    // l'ultima parola di Denny, nel fumetto (alto quanto serve)
    this.prov = null;
    for (const t of this.parole) t.destroy();
    // (il proverbio dalla sedia può essere lungo: il testo scende fino a 8 e il fumetto, qui, può
    // allungarsi un po' di più: è fermo, e la barra non c'è più)
    const F0 = this.L.fumetto, t = txt(this, 0, 0, frase, { size: 10, color: INCHIOSTRO, thick: 0, depth: 33, wrap: F0.w - 20 });
    for (let s = 10; s > 8 && t.height - 6 > F0.h - 14; s--) t.setFontSize((s - 1) * 1.3);
    this.F = { x: F0.x, y: F0.y, w: F0.w, h: Math.max(30, Math.min(F0.h + 24, t.height + 8)) };
    t.setPosition(this.F.x + this.F.w / 2, this.F.y + this.F.h / 2);
    this.parole = [t];
    this.disegnaFumetto();
    this.gFumetto.setAlpha(1);
    this.time.delayedCall(3000, fine);
  }
}
