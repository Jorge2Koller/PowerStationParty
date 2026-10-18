// ============================================================
//  SCONTRINO, PREGO!  (id: scontrino)
//  Nella pizzeria al taglio di Michele i clienti entrano dall'arco, scelgono, pagano alla cassa ed
//  escono dalla porta a destra. Michele a volte batte lo scontrino, a volte no, con un trucchetto
//  (che si vede e si sente sempre). Chi gioca è il vice del Giso, il paladino degli scontrini: preme
//  SCONTRINO! (SPAZIO, clic o tocco ovunque) prima che un cliente senza scontrino arrivi alla porta.
//  SCONTRINO! vale per il cliente più vicino alla porta tra quelli che hanno già pagato (la freccia).
//
//  Tutto quello che succede (chi entra e quando, con che trucco, le distrazioni) lo decide all'inizio
//  il seme del round, e dipende solo dal tempo di gioco: tutti i giocatori della sfida trovano gli
//  stessi clienti negli stessi momenti, qualunque cosa facciano (programma, qui sotto).
//  Per i giocatori automatici: scena.clienti (t.P = quando paga, t.G = quando si gira verso la porta,
//  trucco = null se è onesto, esito), scena.bersaglio() e scena.premi().
// ============================================================
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { RES, casuale } from '../grafica/base.js';
import { PIZZERIA as PZ, CLIENTE } from '../grafica/pizzeria.js';
import { preparaPosa, preparaCorpo, preparaTesta } from '../sprites.js';
import { txt, im, scalaDi, scritta, stelle, fumetto, fumo, caso, eTouch, perDito, vibra, puntiHud, numero, quanti } from '../fx.js';

// --- dove stanno le cose (unità logiche) ---
const PIEDI = 228, PIEDI_USCITA = 240;              // i piedi dei clienti: davanti al banco, e verso la porta
const X = { arco: 174, coda: 212, vetrina: 242, attesa: 272, cassa: 306, porta: 458 };
const ATTESA_Y = PIEDI + 7;              // (chi aspetta la cassa sta un passo più avanti)
const MIK = { taglio: 256, cassa: 322, cima: 78, taglia: 0.6 };   // Michele, dietro al banco
const GISO = { x: 58, piedi: 276, taglia: 0.88 };   // il Giso, in primo piano in basso a sinistra
const VICE = { x: 136, piedi: 276, taglia: 0.72 };  // chi gioca, il suo vice
const SC = 1.16;                                    // la grandezza dei clienti (la testa sopra il banco)
const [MX, MY] = CLIENTE.mano;
// i colori dei clienti (pochi tipi generici, ricolorati col tint)
const MAGLIE = [0xe05a4e, 0x3a8fd8, 0x4caf6a, 0xf2c43a, 0x8a5ad8, 0xff8a3a, 0x2a9a9a, 0xe8e4da, 0xd85a9a];
const PANTALONI = [0x2f3a52, 0x3a3a40, 0x5a4a3a, 0x2a4a7a, 0x6a6a70, 0x4a5a3a];
const CAPELLI = [0x2a1c14, 0x5a3a22, 0xb98a4a, 0x1a1a1e, 0x9a9a9e, 0xa8452a];
// Michele a due pezzi: il corpo (le pose alla cassa) e la testa (le facce), che cambiano da soli
const POSE_MICHELE = { normale: {}, cassa: { posa: 'cassa' }, taglia: { posa: 'taglia', accessorio: 'mezzaluna' }, strappa: { posa: 'strappa' }, aVoce: { posa: 'aVoce' }, tasca: { posa: 'tasca' } };
const FACCE_MICHELE = { normale: ['normale'], parla: ['parla'], fischia: ['fischia'], occhiolino: ['occhiolino'], beccato: ['shock', { gote: 1, sudore: true }], felice: ['felice'] };
// il Giso: vigile (occhi stretti, lente alzata), col dito puntato, offeso (falso allarme)
const POSE_GISO = {
  gisoVigile: ['normale', { posa: 'conti', accessorio: 'lente' }, { palpebra: [0.38, 0.38] }],
  gisoPunta: ['urlo', { posa: 'tiIndico' }, {}],
  gisoOffeso: ['shock', { posa: 'conti', accessorio: 'lente' }, {}],
};
const DENS_M = Math.ceil(RES * 0.65), DENS_G = Math.ceil(RES * 0.9);
const COL_CORIANDOLI = [0xff5a6a, 0x5ab4ff, 0xffe14a, 0x7dff9a, 0xff9ac4, 0xb06aff];

const lerp = (a, b, t) => a + (b - a) * t;
const tra = (x, a, b) => Math.max(a, Math.min(b, x));
function mescola(rnd, a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// i prezzi: sul display "4,50", a voce "4 e 50" (o "6 euro")
const sulDisplay = (p) => `${Math.floor(p)},${String(Math.round((p % 1) * 100)).padStart(2, '0')}`;
const aVoce = (p) => (p % 1 ? `${Math.floor(p)} e ${Math.round((p % 1) * 100)}` : `${p} euro`);

// ------------------------------------------------------------
//  IL PROGRAMMA DELLA SERATA (dal seme): i clienti coi loro tempi, quello che fa Michele istante per
//  istante (segmenti), le distrazioni. Serve due volte: per il livello di chi gioca e, a FACILE e
//  DIFFICILE, per NORMALE (quanti imbrogli ci sarebbero: i punti si contano in proporzione).
//  (Esportato per le prove: dice in anticipo com'è la serata di un seme.)
// ------------------------------------------------------------
export function programma(c, seme, durata, lampo) {
  const rnd = casuale(seme), T = c.tempi, S = c.segnali;
  const atti = c.atti.map((a) => ({ ...a, da: lampo ? a.daLampo : a.da }));
  const attoA = (t) => atti.reduce((k, a, i) => (t >= a.da ? i : k), 0);
  // per ogni atto un sacchetto di 10 "imbroglia sì / no", così le proporzioni tornano sempre
  const sacchi = atti.map((a) => mescola(rnd, Array.from({ length: 10 }, (_, i) => i < Math.round(a.imbrogli * 10))));
  const pescati = atti.map(() => 0);
  const clienti = [], michele = [];
  let A = 0.3, libero = 0, ultimoGiro = -9, vetrinaLibera = 0, ultimoTrucco = null;
  for (let i = 0; i < 80; i++) {
    const taglio = rnd() < atti[attoA(A)].taglio;
    // (non entra troppo presto: al massimo un attimo di attesa davanti alla vetrina o alla cassa)
    const rit0 = c.ritmo * atti[attoA(A)].ritmo, mv0 = 0.35 * rit0;
    const pronto = taglio ? Math.max(vetrinaLibera + 0.35, libero + mv0 - T.sceglie * rit0) - T.entra : Math.max(libero, ultimoGiro + T.cambio) - T.entraCassa;
    A = Math.max(A, pronto - 0.6);
    if (A > durata - 2.4) break;
    const k = attoA(A), atto = atti[k], rit = c.ritmo * atto.ritmo, mv = 0.35 * rit;
    // imbroglia? e con che trucco (tra quelli già arrivati, mai lo stesso due volte di fila)
    let trucco = null;
    if (sacchi[k][pescati[k]++ % 10]) {
      const ok = c.trucchi.filter((tr) => tr.daAtto - 1 <= k).map((tr) => tr.id);
      const scelte = ok.length > 1 ? ok.filter((id) => id !== ultimoTrucco) : ok;
      trucco = scelte[Math.floor(rnd() * scelte.length)];
      ultimoTrucco = trucco;
    }
    const aspetto = {
      tipo: rnd() < 0.35 ? 1 : 0, tono: Math.floor(rnd() * 3), capelli: Math.floor(rnd() * 5) - 1,
      maglia: MAGLIE[Math.floor(rnd() * MAGLIE.length)], pantaloni: PANTALONI[Math.floor(rnd() * PANTALONI.length)], coloreCapelli: CAPELLI[Math.floor(rnd() * CAPELLI.length)],
    };
    const prezzo = c.prezzi[Math.floor(rnd() * c.prezzi.length)];
    // il percorso fino alla cassa: [quando, x, y]
    const passi = [[A, X.arco, PIEDI - 14]];
    let P, S0 = null, inc = null;
    if (taglio) {
      const arrV = Math.max(A + T.entra, vetrinaLibera + 0.35);
      if (arrV > A + T.entra + 0.05) passi.push([A + T.entra * 0.6, X.coda, PIEDI], [arrV - 0.35, X.coda, PIEDI]);
      passi.push([arrV, X.vetrina, PIEDI]);
      S0 = Math.max(arrV + T.sceglie * rit, libero + mv);
      inc = S0 + (T.taglio + T.incarta) * rit;
      michele.push({ t0: S0 - mv, t1: S0, x0: MIK.cassa, x1: MIK.taglio, corpo: 'normale', testa: 'normale' });
      michele.push({ t0: S0, t1: inc, x0: MIK.taglio, x1: MIK.taglio, corpo: 'taglia', testa: 'normale' });
      michele.push({ t0: inc, t1: inc + mv, x0: MIK.taglio, x1: MIK.cassa, corpo: 'normale', testa: 'normale' });
      vetrinaLibera = inc;
      P = Math.max(inc + T.allaCassa, inc + mv, ultimoGiro + T.cambio);
      if (P > inc + T.allaCassa + 0.05) passi.push([inc + 0.3, X.attesa, ATTESA_Y], [P - 0.25, X.attesa, ATTESA_Y]);
    } else {
      P = Math.max(A + T.entraCassa, libero, ultimoGiro + T.cambio);
      if (P > A + T.entraCassa + 0.05) passi.push([A + T.entraCassa * 0.85, X.attesa, ATTESA_Y], [P - 0.25, X.attesa, ATTESA_Y]);
    }
    passi.push([P, X.cassa, PIEDI]);
    // alla cassa: paga, poi lo scontrino o il trucco, poi si gira verso la porta
    const paga = T.paga * rit, d = S[trucco ?? 'onesto'] * rit, seg = P + paga, G = seg + d;
    const M = (t0, t1, corpo, testa = 'normale', segnale = false) => michele.push({ t0, t1, x0: MIK.cassa, x1: MIK.cassa, corpo, testa, segnale });
    if (trucco === 'voce') { M(P, seg + d * 0.5, 'aVoce', 'parla', true); M(seg + d * 0.5, G, 'tasca', 'normale', true); }
    else {
      M(P, seg, 'cassa');
      if (trucco === 'classico') M(seg, G, 'normale', 'normale', true);
      else if (trucco === 'strappo') { M(seg, seg + d * 0.6, 'cassa', 'normale', true); M(seg + d * 0.6, G, 'strappa', 'normale', true); }
      else M(seg, G, 'cassa', 'normale', true);
    }
    let fine = G, annulla = null;
    if (trucco === 'annullo') { annulla = G + T.annulla * rit; fine = annulla + 0.15; M(G, fine, 'cassa', 'normale', true); }
    libero = fine; ultimoGiro = G;
    const fin = c.finestra * atto.finestra;
    clienti.push({ i, atto: k, taglio, trucco, prezzo, aspetto, passi, t: { A, S0, inc, P, seg, G, D: G + fin, fin, d, rit, annulla } });
    A += atto.cadenza * (0.85 + rnd() * 0.3);
  }
  // le distrazioni: mai sopra un momento che serve per riconoscere un trucco (la stampante che parte,
  // lo strappo, l'annullo, il conto a voce). "Ce l'ha la margherita?" arriva mentre un altro paga.
  const chiavi = [];
  for (const cl of clienti) {
    const { seg, d, P: p } = cl.t;
    if (cl.trucco === 'voce') chiavi.push(p);
    else if (cl.trucco !== 'classico' && cl.trucco !== 'finta') chiavi.push(seg + d * 0.35);
    if (cl.trucco === 'strappo') chiavi.push(seg + d * 0.8);
    if (cl.trucco === 'annullo') chiavi.push(cl.t.annulla);
  }
  const tipi = mescola(rnd, [...c.distrazioni]), distrazioni = [];
  let n = 0;
  atti.forEach((a, k) => {
    const quante = Math.round(a.distrazioni), fine = Math.min(durata - 0.6, k + 1 < atti.length ? atti[k + 1].da : durata);
    for (let j = 0; j < quante; j++) {
      const tipo = tipi[n++ % tipi.length];
      let t = a.da + 0.8 + ((j + rnd() * 0.7) / quante) * (fine - a.da - 1.6);
      if (tipo === 'margherita') {
        const paganti = clienti.filter((cl) => cl.atto === k && cl.trucco !== 'voce' && cl.t.P < fine - 0.3);
        if (paganti.length) t = paganti[Math.floor(rnd() * paganti.length)].t.P + 0.1;
      }
      for (let g = 0; g < 8 && chiavi.some((x) => Math.abs(x - t) < 0.45); g++) t += 0.5;
      if (t < fine && !distrazioni.some((x) => Math.abs(x.t - t) < 0.8)) distrazioni.push({ t, tipo });
    }
  });
  return { clienti, michele, distrazioni, atti };
}

// la serata di un seme: la prima (dal seme, poi dai semi che ne derivano) che ha un numero di imbrogli
// dentro la forchetta della configurazione e abbastanza clienti onesti (se no a premere sempre i falsi
// allarmi sarebbero pochi); nelle prove lampo, più corte, va bene la prima
export function serata(c, seme, durata, lampo) {
  const [lo, hi] = lampo ? c.imbrogliLampo : c.imbrogli, onesti = lampo ? c.onestiLampo : c.onesti;
  let p = null;
  for (let k = 0; k < 40; k++) {
    p = programma(c, (seme + k * 977) >>> 0, durata, lampo);
    const arrivano = p.clienti.filter((cl) => cl.t.D <= durata), n = arrivano.filter((cl) => cl.trucco).length;
    if (durata < 15 || (n >= lo && n <= hi && arrivano.length - n >= onesti)) break;
  }
  return p;
}

export class ScontrinoScene extends MicrogiocoBase {
  constructor() { super('scontrino'); }

  get obiettivo() { return this.lampo ? this.cfg.obiettivoLampo : this.cfg.obiettivoPresi; }
  get maxFalsi() { return this.lampo ? this.cfg.maxFalsiLampo : this.cfg.maxFalsi; }
  get condizione() { return this.presi >= this.obiettivo && this.falsi <= this.maxFalsi; }
  // i punti sulla scala delle medaglie: senza l'obiettivo al massimo tettoPrima, con l'obiettivo
  // almeno il bronzo (in Lampo le medaglie non contano: i punti e basta)
  get punti() {
    const c = this.cfg;
    if (this.lampo) return this.grezzo;
    return this.condizione ? Math.max(c.medaglie.bronzo, this.grezzo) : Math.min(c.tettoPrima, this.grezzo);
  }
  molt() { return this.cfg.serie.reduce((m, [n, k]) => (this.serie >= n ? k : m), 1); }

  prepara() {
    const c = this.cfg;
    this.lampo = Sessione.tipo === 'lampo';
    const seme = Sessione.seme;
    this.prog = serata(c, seme, this.durata, this.lampo);
    // i punti degli imbrogli in proporzione: la serata perfetta (tutti presi subito, di fila) fa
    // sempre c.perfetta punti, qualunque sia il seme e il livello (in Lampo: i punti e basta). Contano
    // tutti quelli che si possono beccare: che pagano e si girano prima della fine
    const imbrogli = this.prog.clienti.filter((cl) => cl.trucco && cl.t.G < this.durata).length;
    let perfetta = 0;
    for (let k = 0; k < imbrogli; k++) perfetta += (c.punti.preso + c.punti.subito) * c.serie.reduce((m, [n, f]) => (k >= n ? f : m), 1);
    this.fattore = this.lampo || !perfetta ? 1 : c.perfetta / perfetta;
    this.clienti = this.prog.clienti.map((cl) => ({ ...cl, x: X.arco, y: PIEDI, fermo: 0, ferma: -1, esito: null, uscito: false, progresso: 0 }));
    this.grezzo = 0; this.presi = 0; this.falsi = 0; this.scappati = 0; this.serie = 0; this.serieMax = 0;
    this.nAtto = -1; this.iSeg = 0; this.facce = [];
    this.bolla = null; this.display = { di: null };

    // la pizzeria: lo sfondo, Michele dietro al banco, il banco davanti
    im(this, 0, 0, 'bgPizzeria').setOrigin(0).setDepth(0);
    this.telefono = im(this, PZ.telefono.x, PZ.telefono.y, 'telefonoMuro').setOrigin(0.5, 0).setDepth(2);
    this.birra = im(this, PZ.mensola.x + 10, PZ.mensola.y, 'birraBicchiere').setOrigin(0.5, 1).setDepth(3);
    this.porta = im(this, PZ.porta.x0, PZ.porta.y0, 'portaUscita').setOrigin(0).setDepth(4);
    this.portaAperta = false;
    // Michele: le pose e le facce, create adesso (e buttate alla fine)
    for (const [k, o] of Object.entries(POSE_MICHELE)) preparaCorpo(this, 'mikCorpo_' + k, 'michele', o, DENS_M);
    for (const [k, [espr, altro]] of Object.entries(FACCE_MICHELE)) preparaTesta(this, 'mikTesta_' + k, 'michele', espr, altro, DENS_M);
    this.mikCorpo = im(this, MIK.cassa, MIK.cima, 'mikCorpo_normale', MIK.taglia).setOrigin(0.5, 0).setDepth(10);
    this.mikTesta = im(this, MIK.cassa, MIK.cima, 'mikTesta_normale', MIK.taglia).setOrigin(0.5, 0).setDepth(11);
    this.mikOra = { corpo: 'normale', testa: 'normale' };
    im(this, PZ.banco.x, PZ.banco.y, 'bancoPizzeria').setOrigin(0).setDepth(20);
    // la cassa: il display, la mano di Michele sui tasti
    const D = PZ.display;
    this.gDisplay = this.add.graphics().setDepth(21);
    this.testoDisplay = txt(this, D.x, D.y, '', { size: 7, color: '#7dffb0', thick: 0, depth: 22 });
    const prova = txt(this, 0, -100, 'ANNULLATO', { size: 7, thick: 0 });
    this.scrittaAnnullo = prova.width - 6 <= D.w ? 'ANNULLATO' : 'ANNULLA';
    prova.destroy();
    this.mano = im(this, PZ.tasti.x, PZ.tasti.y, 'manoMichele').setOrigin(0.5, 0.7).setDepth(24).setVisible(false);
    this.mezzaluna = im(this, MIK.taglio, PZ.vetrina.y0 + 1, 'mezzaluna').setOrigin(0.5, 1).setDepth(21).setVisible(false);

    // il Giso e il vice (chi gioca), con le cartelline
    for (const [k, [espr, o, altro]] of Object.entries(POSE_GISO)) preparaPosa(this, k, 'giso', espr, o, DENS_G, altro);
    this.giso = im(this, GISO.x, GISO.piedi, 'gisoVigile', GISO.taglia).setOrigin(0.5, 1).setDepth(60);
    this.gisoFino = 0;
    this.cartellina = im(this, 44, 249, 'cartellina', 0.95).setAngle(-8).setDepth(61);
    this.mazzetta = im(this, 45, 238, 'mazzetta', 0.95).setOrigin(0.5, 1).setAngle(-8).setDepth(62).setVisible(false);
    this.vice = im(this, VICE.x, VICE.piedi, `${this.giocatore.id}_normale`, VICE.taglia).setOrigin(0.5, 1).setDepth(63);
    this.viceFino = 0;
    im(this, 119, 254, 'cartellina', 0.62).setAngle(8).setDepth(64);

    // la freccia sul cliente che conta (il più vicino alla porta tra quelli che hanno pagato)
    this.gFreccia = this.add.graphics().setDepth(80);
    // HUD
    const rec = !!Sessione.record;
    this.testoPunti = txt(this, 474, 36, '', { ox: 1, size: 9, depth: 1001 });
    this.testoPresi = txt(this, 474, 49, '', { ox: 1, size: 8, depth: 1001 });
    this.testoFalsi = txt(this, 474, 61, '', { ox: 1, size: 8, depth: 1001 });
    this.testoSerie = txt(this, 6, rec ? 48 : 36, '', { ox: 0, size: 9, color: '#ffe14a', depth: 1001 });
    this.hud();

    // i comandi: SPAZIO, clic o tocco in qualsiasi punto (sul telefono c'è anche il pulsante grande)
    this.input.keyboard.on('keydown-SPACE', () => this.premi());
    this.input.on('pointerdown', () => this.premi());
    if (eTouch()) {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.3); g.fillRoundedRect(-47, -12, 96, 27, 9);
      g.fillStyle(0xd8343a, 0.95); g.fillRoundedRect(-48, -14, 96, 27, 9);
      g.lineStyle(1.5, 0xffe14a, 1); g.strokeRoundedRect(-48, -14, 96, 27, 9);
      this.bottone = this.add.container(424, 250, [g, txt(this, 0, -0.5, 'SCONTRINO!', { size: 11 })]).setDepth(1002);
    } else {
      const aiuto = txt(this, 474, 258, perDito('SPAZIO: SCONTRINO!', ''), { ox: 1, size: 8, color: '#fff3d6', depth: 1001 });
      this.tweens.add({ targets: aiuto, alpha: 0, delay: 4000, duration: 600, onComplete: () => aiuto.destroy() });
    }

    // gli eventi della serata, in ordine di tempo
    this.eventi = [];
    for (const cl of this.clienti) this.eventiCliente(cl);
    for (const ds of this.prog.distrazioni) this.eventi.push({ t: ds.t, fn: () => this.distrazione(ds.tipo) });
    this.eventi.sort((a, b) => a.t - b.t);
    this.iEv = 0;
    this.comparse = [];
  }

  pulisci() {
    for (const o of [this.mikCorpo, this.mikTesta, this.giso]) o?.destroy();
    const chiavi = [...Object.keys(POSE_MICHELE).map((k) => 'mikCorpo_' + k), ...Object.keys(FACCE_MICHELE).map((k) => 'mikTesta_' + k), ...Object.keys(POSE_GISO), 'micheleMulta', 'micheleCaccia', 'gisoPosa', 'gisoSpinto'];
    for (const k of chiavi) if (this.textures.exists(k)) this.textures.remove(k);
  }

  // ---------- gli eventi di un cliente (tutti a tempo, dal programma) ----------
  eventiCliente(cl) {
    const T = cl.t, d = T.d, ev = (t, fn) => this.eventi.push({ t, fn });
    ev(T.A, () => this.entra(cl));
    if (cl.taglio) {
      ev(T.S0, () => this.taglia(cl));
      ev(T.inc - this.cfg.tempi.incarta * T.rit, () => { Audio.sfx('carta'); this.trancioSulBanco?.setTexture('trancio'); });
      ev(T.inc, () => this.consegnaTrancio(cl));
    }
    ev(T.P, () => this.paga(cl));
    if (!cl.taglio) ev(T.P + (T.seg - T.P) * 0.5, () => this.dallaCassa(cl, 'cartonePizza', false));
    const tr = cl.trucco;
    if (tr === null || tr === 'annullo') {
      ev(T.seg, () => this.tasta(cl, d * 0.3, true));
      ev(T.seg + d * 0.35, () => this.stampa(cl, d * 0.42));
      ev(T.seg + d * 0.8, () => this.consegna(cl, d * 0.2));
    } else if (tr === 'finta') {
      ev(T.seg, () => this.tasta(cl, d * 0.75, false));
    } else if (tr === 'strappo') {
      ev(T.seg, () => this.tasta(cl, d * 0.25, true));
      ev(T.seg + d * 0.28, () => this.stampa(cl, d * 0.3));
      ev(T.seg + d * 0.6, () => this.strappa(cl, d * 0.4));
    } else if (tr === 'classico') {
      ev(T.seg, () => this.mikCorpo && this.tweens.add({ targets: [this.mikCorpo, this.mikTesta], y: MIK.cima + 1.5, duration: 120, yoyo: true }));
    }
    ev(T.G, () => this.gira(cl));
    if (tr === 'annullo') ev(T.annulla, () => this.annulla(cl));
  }

  // ---------- i clienti ----------
  entra(cl) {
    const a = cl.aspetto, pezzi = [];
    const pezzo = (key, tinta) => { const p = this.add.image(0, 0, key).setOrigin(0.5, 1).setScale(scalaDi(key, 1)); if (tinta != null) p.setTint(tinta); pezzi.push(p); };
    pezzo(`clGambe${a.tipo}`, a.pantaloni);
    pezzo(`clMaglia${a.tipo}`, a.maglia);
    pezzo(`clPelle${a.tipo}_${a.tono}`);
    if (a.capelli >= 0) pezzo(`clCapelli${a.capelli}`, a.coloreCapelli);
    cl.spr = this.add.container(X.arco, PIEDI - 14, pezzi).setScale(SC).setAlpha(0);
    this.tweens.add({ targets: cl.spr, alpha: 1, duration: 250 });
  }

  // dove sta un cliente prima di girarsi verso la porta (segue i passi del programma)
  sulPercorso(cl, t) {
    const p = cl.passi;
    if (t <= p[0][0]) return [p[0][1], p[0][2], 0];
    for (let i = 1; i < p.length; i++) {
      if (t <= p[i][0]) {
        const [t0, x0, y0] = p[i - 1], [t1, x1, y1] = p[i], k = t1 > t0 ? (t - t0) / (t1 - t0) : 1;
        return [lerp(x0, x1, k), lerp(y0, y1, k), Math.sign(x1 - x0)];
      }
    }
    const u = p[p.length - 1];
    return [u[1], u[2], 0];
  }

  aggiornaCliente(cl, t, dt) {
    if (!cl.spr || cl.uscito) return;
    let x, y, dir;
    if (t < cl.t.G) [x, y, dir] = this.sulPercorso(cl, t);
    else {
      if (t < cl.ferma) cl.fermo += dt;
      const u = Math.max(0, t - cl.t.G - cl.fermo), p = Math.min(1, u / cl.t.fin);
      cl.progresso = p;
      x = lerp(X.cassa, X.porta, p); y = lerp(PIEDI, PIEDI_USCITA, p);
      dir = t < cl.ferma ? 0 : 1;
      if (p >= 1) return this.allaPorta(cl);
    }
    if (t < cl.ferma && cl.guarda) dir = cl.guarda;
    cl.x = x; cl.y = y;
    // la camminata: il passo che rimbalza e il corpo un po' inclinato
    const cammina = dir !== 0;
    cl.spr.setPosition(x, y - (cammina ? Math.abs(Math.sin(t * 13 + cl.i)) * 1.8 : 0)).setAngle(cammina ? dir * 3 + Math.sin(t * 13 + cl.i) * 2 : 0);
    cl.spr.setDepth(30 + y * 0.05 + cl.i * 0.001);
    // quello che ha in mano: lo scontrino nella destra (più grande a FACILE), il trancio o il cartone nell'altra
    const lato = dir < 0 ? -1 : 1, hx = x + lato * MX * SC, hy = y + MY * SC;
    if (cl.scontrino) {
      const sv = t < cl.sventola;
      cl.scontrino.setPosition(hx + (sv ? -lato * 6 : 0), hy - (sv ? 18 : 0)).setAngle(sv ? Math.sin(t * 32) * 28 : -8 * lato).setDepth(cl.spr.depth + 0.5);
    }
    if (cl.oggetto) cl.oggetto.setPosition(x - lato * MX * SC, hy + 1).setDepth(cl.spr.depth + 0.4);
  }

  // il cliente arriva alla porta ed esce: se aveva un imbroglio e nessuno l'ha fermato, è scappato
  allaPorta(cl) {
    cl.uscito = true;
    if (!cl.esito) {
      if (cl.trucco) this.scappato(cl);
      else cl.esito = 'onesto';
    }
    const via = [cl.spr, cl.scontrino, cl.oggetto].filter(Boolean);
    this.tweens.add({ targets: via, alpha: 0, x: '+=10', duration: 220, onComplete: () => via.forEach((o) => o.destroy()) });
  }

  // ---------- quello che fa Michele ----------
  taglia(cl) {
    this.mezzaluna.setVisible(true).setPosition(MIK.taglio, PZ.vetrina.y0 + 1).setAngle(0);
    this.tweens.add({ targets: this.mezzaluna, angle: { from: -14, to: 14 }, duration: 160, yoyo: true, repeat: Math.max(1, Math.round(this.cfg.tempi.taglio * cl.t.rit / 0.32) - 1) });
    for (let k = 0; k < 3; k++) this.time.delayedCall(k * 230, () => Audio.sfx('toc'));
    this.trancioSulBanco?.destroy();
    this.trancioSulBanco = im(this, MIK.taglio - 12, PZ.vetrina.y0 + 1, 'tegliaNuova', 0.4).setOrigin(0.5, 1).setDepth(21);
  }

  consegnaTrancio(cl) {
    this.tweens.killTweensOf(this.mezzaluna);
    this.mezzaluna.setVisible(false);
    const tr = this.trancioSulBanco;
    this.trancioSulBanco = null;
    if (!tr || !cl.spr) { tr?.destroy(); return; }
    tr.setTexture('trancio').setScale(scalaDi('trancio', 1)).setOrigin(0.5);
    this.tweens.add({ targets: tr, x: cl.x - MX * SC, y: cl.y + MY * SC, duration: 260, ease: 'Sine.out', onComplete: () => { if (cl.uscito) tr.destroy(); else cl.oggetto = tr; } });
  }

  // il cartone da asporto (o lo scontrino strappato di corsa): da dietro la cassa al cliente
  dallaCassa(cl, key) {
    if (!cl.spr) return;
    const o = im(this, MIK.cassa + 8, PZ.piano - 4, key).setDepth(25);
    this.tweens.add({ targets: o, x: cl.x - MX * SC, y: cl.y + MY * SC + 1, duration: 260, ease: 'Sine.out', onComplete: () => { if (cl.uscito) o.destroy(); else { cl.oggetto?.destroy(); cl.oggetto = o; } } });
  }

  // i soldi: dal cliente al cassetto ("cling"), oppure (conto a voce) nella mano di Michele
  paga(cl) {
    if (!cl.spr) return;
    const voce = cl.trucco === 'voce', b = im(this, cl.x + MX * SC, cl.y + MY * SC, 'banconota').setDepth(26);
    if (voce) {
      this.frase(caso(this.cfg.frasiVoce).replace('{prezzo}', aVoce(cl.prezzo)), (cl.t.seg - cl.t.P + cl.t.d * 0.5) * 1000);
      this.tweens.add({ targets: b, x: MIK.cassa + 22, y: 128, delay: 300, duration: 300, ease: 'Sine.out' });
      this.time.delayedCall((cl.t.seg - cl.t.P + cl.t.d * 0.5) * 1000, () => this.tweens.add({ targets: b, y: 150, x: MIK.cassa + 10, alpha: 0, duration: 260, onComplete: () => b.destroy() }));
    } else {
      this.tweens.add({ targets: b, x: 372, y: 138, duration: 300, ease: 'Sine.out', onComplete: () => { b.destroy(); Audio.sfx('cassa'); } });
    }
  }

  // la mano di Michele sui tasti; vero = il display mostra il prezzo, se no resta a zero (la finta)
  tasta(cl, dur, vero) {
    this.mano.setVisible(true).setPosition(PZ.tasti.x - 8, PZ.tasti.y);
    const volte = Math.max(2, Math.round(dur / 0.11));
    this.tweens.add({ targets: this.mano, y: PZ.tasti.y + 2.2, x: { from: PZ.tasti.x - 8, to: PZ.tasti.x + 8 }, duration: (dur * 1000) / volte / 2, yoyo: true, repeat: volte - 1, onComplete: () => this.mano.setVisible(false) });
    Audio.sfx('tasti');
    if (dur > 0.35) this.time.delayedCall(dur * 500, () => Audio.sfx('tasti'));
    this.time.delayedCall(dur * 1000 * 0.7, () => this.mostraDisplay(cl, vero ? sulDisplay(cl.prezzo) : '0,00'));
  }

  mostraDisplay(cl, s, rosso = false) {
    const D = PZ.display;
    this.display.di = cl?.i ?? null;
    this.gDisplay.clear();
    if (rosso) { this.gDisplay.fillStyle(0x6a0e14, 1); this.gDisplay.fillRoundedRect(D.x - D.w / 2, D.y - D.h / 2, D.w, D.h, 1.5); }
    this.testoDisplay.setText(s).setColor(rosso ? '#ff6a6a' : '#7dffb0').setAlpha(1);
    this.tweens.killTweensOf(this.testoDisplay);
    if (rosso || (this.cfg.evidenti && s)) this.tweens.add({ targets: this.testoDisplay, alpha: 0.25, duration: 180, yoyo: true, repeat: 3 });
  }

  // la stampante: "trrr" e lo scontrino che sale dalla fessura
  stampa(cl, dur) {
    Audio.sfx('stampante');
    const F = PZ.fessura, s = im(this, F.x, F.y + 1, 'scontrinoCarta').setOrigin(0.5, 1).setDepth(23);
    const sy = s.scaleY;
    s.setScale(s.scaleX, sy * 0.05);
    this.tweens.add({ targets: s, scaleY: sy, duration: dur * 1000 });
    cl.carta = s;
  }

  // lo scontrino vero, staccato e dato al cliente (lo tiene ben in vista)
  consegna(cl, dur) {
    const s = cl.carta;
    cl.carta = null;
    if (!s) return;
    Audio.sfx('carta');
    if (!cl.spr || cl.uscito) { s.destroy(); return; }
    const k = this.cfg.evidenti ? 1.35 : 1;
    s.setOrigin(0.5, 0.85);
    this.tweens.add({ targets: s, x: cl.x + MX * SC, y: cl.y + MY * SC, scale: scalaDi('scontrinoCarta', 0.75 * k), duration: Math.max(140, dur * 1000), ease: 'Sine.out', onComplete: () => { if (cl.uscito) s.destroy(); else cl.scontrino = s; } });
  }

  // lo strappo: Michele prende lo scontrino, lo strappa davanti al petto e se lo mette in tasca
  strappa(cl, dur) {
    const s = cl.carta;
    cl.carta = null;
    if (!s) return;
    const x = MIK.cassa + 19, y = 116;
    this.tweens.add({
      targets: s, x, y: y + 9, duration: dur * 300, ease: 'Sine.out', onComplete: () => {
        Audio.sfx('strappo');
        const h = s.height, w = s.width;
        const meta = [0, 1].map((k) => {
          const m = this.add.image(x, y, s.texture.key).setOrigin(0.5, k ? 0 : 1).setScale(s.scaleX, s.scaleY).setDepth(23);
          m.setCrop(0, k ? h / 2 : 0, w, h / 2);
          m.y = y + (k ? -h / 2 : h / 2) * s.scaleY + (k ? 1 : -1);
          return m;
        });
        s.destroy();
        meta.forEach((m, k) => this.tweens.add({ targets: m, angle: k ? 35 : -35, x: x + (k ? 5 : -5), duration: dur * 250, onComplete: () => this.tweens.add({ targets: m, x: x - 4, y: 150, alpha: 0, duration: dur * 300, onComplete: () => m.destroy() }) }));
      },
    });
  }

  gira(cl) {
    if (this.display.di === cl.i && cl.trucco !== 'annullo') this.time.delayedCall(650, () => { if (this.display.di === cl.i) this.mostraDisplay(null, ''); });
    if (cl.carta) { cl.carta.destroy(); cl.carta = null; }
  }

  // l'annullo: il cliente si è girato, Michele preme un tasto: bip basso e display rosso
  annulla(cl) {
    this.mano.setVisible(true).setPosition(PZ.tasti.x + 12, PZ.tasti.y);
    this.tweens.add({ targets: this.mano, y: PZ.tasti.y + 2.5, duration: 90, yoyo: true, onComplete: () => this.mano.setVisible(false) });
    Audio.sfx('annullo');
    this.mostraDisplay(cl, this.scrittaAnnullo, true);
    if (this.cfg.evidenti) cl.scontrino?.setTint(0xff9090);
    this.time.delayedCall(1300, () => { if (this.display.di === cl.i) this.mostraDisplay(null, ''); });
  }

  // una battuta di Michele, nel fumetto sopra la sua testa (una alla volta; mai sopra i punti, a destra)
  frase(s, ms = 1300) {
    this.bolla?.destroy();
    const b = fumetto(this, this.mikCorpo.x + 4, 68, s, ms, 960), w = (b.list[1]?.width ?? 60) + 10;
    b.x = Math.max(w / 2 + 4, Math.min(b.x, 368 - w / 2));
    this.bolla = b;
  }

  // ---------- SCONTRINO! ----------
  bersaglio() {
    const t = this.trascorso;
    let best = null;
    for (const cl of this.clienti) {
      if (!cl.spr || cl.esito || cl.uscito || t < cl.t.P) continue;
      if (!best || cl.x > best.x + 0.01 || (Math.abs(cl.x - best.x) <= 0.01 && cl.t.G < best.t.G)) best = cl;
    }
    return best;
  }

  premi() {
    if (!this.inCorso) return;
    if (this.bottone) this.tweens.add({ targets: this.bottone, scale: { from: 0.88, to: 1 }, duration: 140, ease: 'Back.out' });
    const cl = this.bersaglio();
    if (!cl) { Audio.sfx('tsk'); return; }
    if (cl.trucco) this.preso(cl); else this.falso(cl);
  }

  // imbroglio scoperto: il Giso fischia e blocca il cliente, Michele arrossisce, suda e lo batte di corsa
  preso(cl) {
    const c = this.cfg, t = this.trascorso, subito = t <= cl.t.G + c.secondiSubito;
    const valore = (c.punti.preso + (subito ? c.punti.subito : 0)) * this.molt() * this.fattore;
    const prima = this.condizione;
    this.grezzo += valore; this.presi++; this.serie++; this.serieMax = Math.max(this.serieMax, this.serie);
    cl.esito = 'preso';
    cl.ferma = t + 1.4; cl.guarda = -1;
    this.punto(cl, `+${numero(Math.round(valore))}${subito ? '  SUBITO!' : ''}`, '#7dff9a');
    const esc = txt(this, cl.x, cl.y - 92, '!', { size: 16, color: '#ff5a5a', depth: 940 });
    this.tweens.add({ targets: esc, y: esc.y - 8, alpha: 0, delay: 500, duration: 400, onComplete: () => esc.destroy() });
    // il Giso
    Audio.sfx('fischietto');
    this.giso.setTexture('gisoPunta'); this.gisoFino = t + 1.1;
    this.tweens.add({ targets: this.giso, x: GISO.x + 10, duration: 110, yoyo: true, ease: 'Quad.out' });
    this.bollaGiso?.destroy();
    this.bollaGiso = fumetto(this, 96, 152, caso(c.frasiGiso), 1100, 960);
    this.vice.setTexture(`${this.giocatore.id}_felice`); this.viceFino = t + 0.9;
    // Michele, beccato: rosso e sudato, e lo scontrino battuto di corsa (vola al cliente)
    this.facce = [{ testa: 'beccato', fino: t + 1.2 }];
    if (!this.bolla?.active) this.frase(caso(c.frasiBeccato), 1100);
    this.time.delayedCall(250, () => {
      if (!cl.spr || cl.uscito) return;
      Audio.sfx('stampante');
      cl.carta?.destroy(); cl.carta = null;
      const F = PZ.fessura, s = im(this, F.x, F.y - 10, 'scontrinoCarta', 0.75).setOrigin(0.5, 0.85).setDepth(90);
      this.tweens.add({ targets: s, x: cl.x + MX * SC, y: cl.y + MY * SC, angle: { from: -30, to: 360 }, duration: 420, ease: 'Sine.out', onComplete: () => { if (cl.uscito) s.destroy(); else { cl.scontrino?.destroy(); s.setAngle(0); cl.scontrino = s; } } });
    });
    // la cartellina si gonfia
    this.mazzetta.setVisible(true);
    this.tweens.add({ targets: this.mazzetta, scaleY: scalaDi('mazzetta', 0.95) * Math.min(4.5, 0.55 * this.presi), duration: 200, ease: 'Back.out' });
    if (!prima && this.condizione) { scritta(this, 240, 70, `${this.obiettivo} IMBROGLI!`, { size: 13, color: '#7dff9a', durata: 900 }); Audio.sfx('bonus'); }
    vibra(30);
    this.hud();
  }

  // falso allarme: lo scontrino c'era. Il cliente lo sventola in faccia al Giso: "Eccolo, contento?"
  falso(cl) {
    const c = this.cfg, t = this.trascorso, prima = this.condizione;
    this.grezzo = Math.max(0, this.grezzo - c.punti.falso);
    this.falsi++; this.serie = 0;
    cl.esito = 'falso';
    cl.ferma = t + 1.1; cl.guarda = -1; cl.sventola = t + 1;
    this.punto(cl, `-${c.punti.falso}`, '#ff8a7a');
    Audio.sfx('errore');
    this.giso.setTexture('gisoOffeso'); this.gisoFino = t + 1;
    this.vice.setTexture(`${this.giocatore.id}_shock`); this.viceFino = t + 0.9;
    this.frase(caso(c.frasiFalso), 1100);
    this.facce = [{ testa: 'felice', fino: t + 1 }];
    if (prima && !this.condizione) scritta(this, 240, 70, 'TROPPI FALSI ALLARMI!', { size: 12, color: '#ff6b5a', durata: 900 });
    vibra(70);
    this.hud();
  }

  // imbroglio riuscito: la porta si chiude, Michele fa l'occhiolino e si mette i soldi in tasca fischiettando
  scappato(cl) {
    const t = this.trascorso;
    cl.esito = 'scappato';
    this.scappati++; this.serie = 0;
    const s = txt(this, X.porta - 4, 200, 'SENZA SCONTRINO!', { size: 7, color: '#ff8a7a', depth: 940 });
    this.tweens.add({ targets: s, y: 190, alpha: 0, delay: 500, duration: 400, onComplete: () => s.destroy() });
    this.facce = [{ testa: 'occhiolino', fino: t + 0.5 }, { testa: 'fischia', fino: t + 1.5 }];
    Audio.sfx('fischiettio');
    for (let k = 0; k < 2; k++) {
      const n = im(this, this.mikCorpo.x + 14 + k * 6, 92, 'notaMusica').setDepth(30).setAlpha(0);
      this.tweens.add({ targets: n, alpha: 1, y: 70 - k * 6, x: n.x + 8, delay: 300 + k * 260, duration: 700, onComplete: () => this.tweens.add({ targets: n, alpha: 0, duration: 200, onComplete: () => n.destroy() }) });
    }
    const b = im(this, 372, 138, 'banconota').setDepth(26);
    this.tweens.add({ targets: b, x: this.mikCorpo.x + 10, y: 150, alpha: 0.2, duration: 500, ease: 'Sine.in', onComplete: () => b.destroy() });
    this.vice.setTexture(`${this.giocatore.id}_triste`); this.viceFino = t + 0.9;
    this.hud();
  }

  punto(cl, s, col) {
    const p = txt(this, cl.x, cl.y - 100, s, { size: 9, color: col, depth: 945 });
    this.tweens.add({ targets: p, y: p.y - 16, alpha: 0, duration: 900, onComplete: () => p.destroy() });
  }

  hud() {
    this.testoPunti.setText(puntiHud(this.punti));
    const ob = this.obiettivo, mf = this.maxFalsi;
    this.testoPresi.setText(`PRESI: ${this.presi}/${ob}`).setColor(this.presi >= ob ? '#7dff9a' : '#ffe14a');
    this.testoFalsi.setText(`FALSI ALLARMI: ${this.falsi}/${mf}`).setColor(this.falsi > mf ? '#ff6b5a' : '#fff3d6');
    const m = this.molt();
    this.testoSerie.setText(m > 1 ? `SERIE x${numero(m, m % 1 ? 1 : 0)}` : '');
  }

  // ---------- le distrazioni (terzo atto) ----------
  distrazione(tipo) {
    if (tipo === 'teglia') {
      // esce una teglia nuova, fumante, e va sulla vetrina
      const tg = im(this, 256, 108, 'tegliaNuova', 0.9).setOrigin(0.5, 1).setDepth(21);
      this.tweens.add({ targets: tg, x: 236, y: PZ.vetrina.y0 + 1, duration: 400, ease: 'Sine.out' });
      Audio.sfx('sfrigola');
      for (let k = 0; k < 4; k++) this.time.delayedCall(k * 300, () => fumo(this, tg.x, tg.y - 6, 4, 22));
      this.tweens.add({ targets: tg, alpha: 0, delay: 2600, duration: 400, onComplete: () => tg.destroy() });
    } else if (tipo === 'telefono') {
      // squilla il telefono degli ordini
      Audio.sfx('squillo');
      this.time.delayedCall(700, () => Audio.sfx('squillo'));
      this.tweens.add({ targets: this.telefono, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 9, onComplete: () => this.telefono.setAngle(0) });
      const s = txt(this, PZ.telefono.x, PZ.telefono.y - 6, 'DRIIN!', { size: 8, color: '#ffe14a', depth: 940 });
      this.tweens.add({ targets: s, y: s.y - 8, alpha: 0, delay: 900, duration: 300, onComplete: () => s.destroy() });
    } else if (tipo === 'birra') {
      // un cliente rovescia la birra sulla mensola
      if (!this.birra.visible) return;
      Audio.sfx('splash');
      this.tweens.add({ targets: this.birra, angle: 95, x: this.birra.x + 4, duration: 220, ease: 'Quad.in', onComplete: () => this.birra.setVisible(false) });
      const pz = im(this, PZ.mensola.x + 6, 214, 'pozzaBirra').setDepth(5).setAlpha(0);
      this.tweens.add({ targets: pz, alpha: 1, delay: 200, duration: 300 });
      const s = txt(this, PZ.mensola.x + 4, PZ.mensola.y - 10, 'OPS!', { size: 8, color: '#fff3d6', depth: 940 });
      this.tweens.add({ targets: s, y: s.y - 8, alpha: 0, delay: 700, duration: 300, onComplete: () => s.destroy() });
    } else if (tipo === 'margherita') {
      fumetto(this, 196, 132, caso(this.cfg.frasiMargherita), 1300, 955);
      Audio.sfx('borbottio');
    }
  }

  // le comparse: chi aspetta in coda all'arco (terzo atto) e chi mangia alla mensola (dal secondo)
  comparsa(x, y, a, oggetto) {
    const pezzi = [`clGambe${a.tipo}`, `clMaglia${a.tipo}`, `clPelle${a.tipo}_${a.tono}`, a.capelli >= 0 ? `clCapelli${a.capelli}` : null].filter(Boolean);
    const tinte = [a.pantaloni, a.maglia, null, a.coloreCapelli];
    const imgs = pezzi.map((k, i) => { const p = this.add.image(0, 0, k).setOrigin(0.5, 1).setScale(scalaDi(k, 1)); if (tinte[i] != null) p.setTint(tinte[i]); return p; });
    const c = this.add.container(x, y, imgs).setScale(SC * 0.94).setDepth(28).setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 400 });
    this.tweens.add({ targets: c, y: y - 1, duration: 700 + x, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    if (oggetto) im(this, x - MX * SC, y + MY * SC + 1, oggetto).setDepth(28.5);
    this.comparse.push(c);
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    const t = this.trascorso;
    while (this.iEv < this.eventi.length && this.eventi[this.iEv].t <= t) this.eventi[this.iEv++].fn();
    // gli atti si annunciano (e la pizzeria si riempie)
    const atti = this.prog.atti, atto = atti.reduce((k, a, i) => (t >= a.da ? i : k), 0);
    if (atto !== this.nAtto) {
      this.nAtto = atto;
      if (atto > 0 || !this.lampo) {
        Audio.sfx(atto === 2 ? 'scatena' : 'bonus');
        const nome = this.cfg.atti[atto].nome.replace('{locale}', this.cfg.nomeLocale.toUpperCase());
        scritta(this, 240, 70, nome, { size: 15, color: atto === 2 ? '#ff6b5a' : '#ffe14a', durata: 900, depth: 970 });
      }
      const gente = (k) => ({ tipo: k % 2, tono: (k * 2) % 3, capelli: k % 4, maglia: MAGLIE[(k * 3) % MAGLIE.length], pantaloni: PANTALONI[k % PANTALONI.length], coloreCapelli: CAPELLI[(k * 5) % CAPELLI.length] });
      if (atto >= 2 && !this.inCoda) { this.inCoda = true; this.comparsa(188, 210, gente(2)); this.comparsa(204, 213, gente(5), 'cartonePizza'); }
    }
    for (const cl of this.clienti) this.aggiornaCliente(cl, t, dt);
    this.aggiornaMichele(t);
    // il Giso e il vice tornano normali
    if (this.gisoFino && t > this.gisoFino) { this.gisoFino = 0; this.giso.setTexture('gisoVigile'); }
    if (this.viceFino && t > this.viceFino) { this.viceFino = 0; this.vice.setTexture(`${this.giocatore.id}_normale`); }
    // la porta si apre quando qualcuno ci arriva
    const aperta = this.clienti.some((cl) => cl.spr && !cl.uscito && cl.progresso > 0.8);
    if (aperta !== this.portaAperta) {
      this.portaAperta = aperta;
      this.porta.setTexture(aperta ? 'portaUscitaAperta' : 'portaUscita').setScale(scalaDi(aperta ? 'portaUscitaAperta' : 'portaUscita', 1));
      if (aperta) Audio.sfx('apri');
    }
    // il cliente che conta: l'anello giallo ai piedi e la freccia sotto, che pulsa (sopra la testa
    // coprirebbe Michele e la cassa)
    const g = this.gFreccia, b = this.bersaglio();
    g.clear();
    if (b) {
      const k = 1 + Math.sin(t * 10) * 0.08, y = b.y + 9 + Math.sin(t * 9) * 1.5;
      g.lineStyle(4, 0x1f1430, 0.55); g.strokeEllipse(b.x, b.y + 1, 38 * k, 10 * k);
      g.lineStyle(2.2, 0xffe14a, 1); g.strokeEllipse(b.x, b.y + 1, 38 * k, 10 * k);
      g.fillStyle(0x1f1430, 0.9); g.fillTriangle(b.x - 7.5, y + 10, b.x + 7.5, y + 10, b.x, y - 1.5);
      g.fillStyle(0xffe14a, 1); g.fillTriangle(b.x - 6, y + 9, b.x + 6, y + 9, b.x, y);
    }
  }

  aggiornaMichele(t) {
    const segs = this.prog.michele;
    while (this.iSeg + 1 < segs.length && segs[this.iSeg + 1].t0 <= t) this.iSeg++;
    const s = segs[this.iSeg];
    let x = MIK.cassa, corpo = 'normale', testa = 'normale', muove = false;
    if (s && t >= s.t0) {
      if (t <= s.t1) { x = lerp(s.x0, s.x1, tra((t - s.t0) / Math.max(0.01, s.t1 - s.t0), 0, 1)); corpo = s.corpo; testa = s.testa; muove = s.x0 !== s.x1; }
      else x = s.x1;
    }
    // le facce delle reazioni (beccato, occhiolino, fischietta): non coprono mai il conto a voce
    while (this.facce.length && this.facce[0].fino < t) this.facce.shift();
    if (this.facce.length && testa === 'normale') testa = this.facce[0].testa;
    if (corpo !== this.mikOra.corpo) { this.mikOra.corpo = corpo; this.mikCorpo.setTexture('mikCorpo_' + corpo); }
    if (testa !== this.mikOra.testa) { this.mikOra.testa = testa; this.mikTesta.setTexture('mikTesta_' + testa); }
    const y = MIK.cima - (muove ? Math.abs(Math.sin(t * 14)) * 1.5 : 0);
    if (!this.tweens.isTweening(this.mikCorpo)) { this.mikCorpo.setPosition(x, y); this.mikTesta.setPosition(x, y); }
    else { this.mikCorpo.x = x; this.mikTesta.x = x; }
  }

  risultato() {
    const imbrogli = this.presi + this.scappati;
    return {
      punteggio: Math.round(this.punti),
      vittoria: this.condizione,
      riepilogo: `${quanti(this.presi, 'imbroglio scoperto', 'imbrogli scoperti')} su ${imbrogli}, ${quanti(this.falsi, 'falso allarme', 'falsi allarmi')}`,
      titoli: this.cfg.titoli,
    };
  }

  // ---------- la fine ----------
  // Vinci: arrivano due finanzieri da cartone con le sirenette, multa a Michele (disperato, con la
  // mezzaluna in mano), il Giso in posa con la cartellina gonfissima tra i coriandoli. Perdi: Michele
  // mette il Giso alla porta con la pala, gli cade la cartellina e volano via tutti gli scontrini.
  // Al massimo 3,6 secondi; si salta con un tocco, INVIO o SPAZIO.
  finale(ris, fatto) {
    const c = this.cfg;
    for (const o of [this.gFreccia, this.testoSerie, this.bottone, this.testoFalsi, this.testoPresi]) o?.setVisible(false);
    this.bolla?.destroy(); this.bollaGiso?.destroy();
    this.mano.setVisible(false);
    let chiuso = false;
    const fine = () => { if (chiuso) return; chiuso = true; fatto(); };
    this.time.delayedCall(400, () => {
      for (const k of ['ENTER', 'SPACE']) this.input.keyboard.once('keydown-' + k, fine);
      this.input.once('pointerdown', fine);
    });
    this.time.delayedCall(3600, fine);
    const titolo = txt(this, 240, 26, ris.titoloFine, { size: 20, color: ris.vittoria ? '#7dff9a' : '#ff6b5a', depth: 1100 });
    this.tweens.add({ targets: titolo, scale: { from: 1.6, to: 1 }, duration: 260, ease: 'Back.out' });
    const mx = this.mikCorpo.x;
    if (ris.vittoria) {
      // i finanzieri entrano dalla porta, con la sirenetta che lampeggia
      Audio.sfx('sirena'); this.time.delayedCall(900, () => Audio.sfx('sirena'));
      this.porta.setTexture('portaUscitaAperta').setScale(scalaDi('portaUscitaAperta', 1));
      [[0, 340], [1, 384]].forEach(([k, xf]) => {
        const a = { tipo: k, tono: k ? 2 : 0, capelli: 0, maglia: 0x6b7466, pantaloni: 0x4a4f48, coloreCapelli: 0x2a1c14 };
        const pezzi = [`clGambe${a.tipo}`, `clMaglia${a.tipo}`, `clPelle${a.tipo}_${a.tono}`, 'clCapelli0'].map((key, i) => {
          const p = this.add.image(0, 0, key).setOrigin(0.5, 1).setScale(scalaDi(key, 1));
          const tinta = [a.pantaloni, a.maglia, null, a.coloreCapelli][i];
          if (tinta != null) p.setTint(tinta);
          return p;
        });
        const cap = this.add.image(0, -74, 'cappelloFinanza').setOrigin(0.5, 1).setScale(scalaDi('cappelloFinanza', 1));
        const luce = this.add.image(0, -88.5, 'sirenetta').setOrigin(0.5, 1).setScale(scalaDi('sirenetta', 1)).setTint(0x3a7aff);
        this.time.addEvent({ delay: 170, repeat: 20, callback: () => luce.setTint(luce.tintTopLeft === 0x3a7aff ? 0xff3a3a : 0x3a7aff) });
        const f = this.add.container(X.porta, PIEDI_USCITA, [...pezzi, cap, luce]).setScale(SC).setDepth(70 + k);
        this.tweens.add({ targets: f, x: xf, y: PIEDI, duration: 900, delay: k * 250, ease: 'Sine.out' });
        this.tweens.add({ targets: f, angle: { from: -3, to: 3 }, duration: 110, yoyo: true, repeat: 7, delay: k * 250 });
        if (k === 0) this.time.delayedCall(1050, () => {
          fumetto(this, xf - 6, 132, caso(c.frasiFinanza), 1500, 1050);
          const m = im(this, xf + 14, 200, 'multa').setDepth(75);
          this.tweens.add({ targets: m, x: mx + 4, y: 128, angle: 360, duration: 380, ease: 'Sine.out' });
          Audio.sfx('carta');
          // Michele, multato: disperato, con la mezzaluna in mano
          preparaPosa(this, 'micheleMulta', 'michele', 'triste', { posa: 'taglia', accessorio: 'mezzaluna' }, DENS_M, { sudore: true });
          this.mikCorpo.setTexture('micheleMulta'); this.mikTesta.setVisible(false);
          this.tweens.add({ targets: this.mikCorpo, y: MIK.cima - 4, duration: 90, yoyo: true, repeat: 2 });
        });
      });
      // il Giso in posa, la cartellina gonfissima, i coriandoli
      preparaPosa(this, 'gisoPosa', 'giso', 'felice', { posa: 'felice' }, DENS_G);
      this.giso.setTexture('gisoPosa');
      this.tweens.add({ targets: [this.cartellina, this.mazzetta], x: '-=18', y: '-=34', angle: -18, duration: 320, ease: 'Back.out' });
      this.mazzetta.setVisible(true).setScale(scalaDi('mazzetta', 1.1), scalaDi('mazzetta', 0.95) * Math.max(2.5, Math.min(5, 0.6 * this.presi)));
      this.vice.setTexture(`${this.giocatore.id}_felice`);
      Audio.sfx('vittoria');
      stelle(this, 52, 150, 10, 1050);
      this.time.addEvent({ delay: 45, repeat: 46, callback: () => {
        const r = this.add.rectangle(Math.random() * 480, -6, 3.2, 5, caso(COL_CORIANDOLI)).setAngle(Math.random() * 360).setDepth(1050);
        this.tweens.add({ targets: r, y: 280, x: r.x + (Math.random() - 0.5) * 70, angle: r.angle + 500, duration: 1300 + Math.random() * 700, onComplete: () => r.destroy() });
      } });
    } else {
      // Michele salta il banco con la pala e caccia il Giso dall'arco
      Audio.sfx('sconfitta');
      preparaPosa(this, 'micheleCaccia', 'michele', 'rabbia', { posa: 'caccia', accessorio: 'palaAlta' }, DENS_G);
      preparaPosa(this, 'gisoSpinto', 'giso', 'shock', { posa: 'shock' }, DENS_G);
      this.mikTesta.setVisible(false);
      this.mikCorpo.setTexture('micheleCaccia').setScale(scalaDi('micheleCaccia', MIK.taglia)).setOrigin(0.5, 1).setPosition(mx, MIK.cima + 144 * MIK.taglia).setDepth(70);
      this.tweens.add({ targets: this.mikCorpo, x: 150, duration: 650, ease: 'Sine.inOut' });
      this.tweens.add({ targets: this.mikCorpo, y: 276, duration: 650, ease: 'Back.in' });
      this.tweens.add({ targets: this.mikCorpo, scale: scalaDi('micheleCaccia', 0.86), duration: 650 });
      Audio.sfx('pala');
      this.giso.setTexture('gisoSpinto');
      this.vice.setTexture(`${this.giocatore.id}_shock`);
      this.time.delayedCall(700, () => {
        Audio.sfx('schiaffo');
        this.tweens.add({ targets: this.giso, x: -70, angle: -12, duration: 700, ease: 'Quad.in' });
        this.tweens.add({ targets: this.mikCorpo, x: 70, duration: 900, ease: 'Sine.out' });
        // la cartellina cade e gli scontrini volano via
        this.tweens.add({ targets: this.cartellina, y: 262, angle: 80, duration: 400, ease: 'Bounce.out' });
        this.mazzetta.setVisible(false);
        Audio.sfx('fiuu');
        const n = 10 + Math.min(20, this.presi * 3);
        for (let k = 0; k < n; k++) {
          const s = im(this, 44, 240, 'scontrinoCarta', 0.6).setDepth(1040);
          const vx = (Math.random() - 0.3) * 240, alto = 60 + Math.random() * 120;
          this.tweens.add({ targets: s, x: s.x + vx, duration: 1500 + Math.random() * 600 });
          this.tweens.add({ targets: s, y: s.y - alto, duration: 500, ease: 'Quad.out', yoyo: true, hold: 100 });
          this.tweens.add({ targets: s, angle: (Math.random() - 0.5) * 900, alpha: 0, duration: 1900 });
        }
      });
    }
  }
}
