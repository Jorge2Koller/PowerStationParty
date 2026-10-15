// ============================================================
//  BEER PONG: IL MOTORE DI TIRO
//  La geometria del tavolo visto da dietro le spalle di chi tira (prospettiva), i triangoli di
//  bicchieri e il volo della pallina: dove atterra, se entra, se prende il bordo, se rimbalza sul
//  tavolo, se esce. Qui non c'è niente di Phaser: solo conti. Lo usano il microgioco
//  (js/microgames/BeerpongScene.js) e la modalità (js/scenes/beerpong.js) attraverso il tavolo
//  (js/beerpong/tavolo.js). I numeri che si regolano sono in js/config/beerpong.js.
//
//  Coordinate del tavolo: x = di lato (0 al centro, da -W a +W), y = in profondità (0 = il bordo
//  di chi tira, L = il bordo in fondo), h = altezza dal piano del tavolo.
// ============================================================

// la telecamera: sta dietro al bordo vicino, più in alto del tavolo (distanza e altezza = 1)
export const CAM = { cx: 240, oriz: 46, F: 210 };
export const TAV = { W: 0.752, L: 1.55, rete: 0.775, altoRete: 0.1, terra: -0.76 };
// i bicchieri: raggio, altezza, distanza tra i centri, distanza dell'ultima fila dal bordo
export const BIC = { r: 0.066, h: 0.17, passo: 0.152, fondo: 0.19 };
export const MANO = { x: 0, y: -0.12, h: 0.2 };      // da dove parte la pallina di chi tira
export const PALLA = 0.026;                           // raggio della pallina

const lerp = (a, b, t) => a + (b - a) * t;

// dal tavolo allo schermo: { x, y } in unità di schermo, k = quante unità vale 1 a quella profondità
export function proietta(x, y, h = 0) {
  const k = CAM.F / (1 + y);
  return { x: CAM.cx + x * k, y: CAM.oriz + (1 - h) * k, k };
}

// Il triangolo dei bicchieri in fondo (quelli a cui si tira), con la punta verso chi tira:
// 10 bicchieri = 4 file, 6 = 3 file. riga 0 = la punta.
export function triangolo(n) {
  const righe = n >= 10 ? 4 : n >= 6 ? 3 : n >= 3 ? 2 : 1, d = BIC.passo * 0.866, out = [];
  for (let r = 0; r < righe; r++) for (let i = 0; i <= r; i++) out.push({ x: (i - r / 2) * BIC.passo, y: TAV.L - BIC.fondo - (righe - 1 - r) * d, riga: r });
  return out;
}
// lo stesso bicchiere visto dall'altra parte del tavolo (i propri bicchieri, davanti a chi tira)
export const specchia = (c) => ({ x: -c.x, y: TAV.L - c.y });

export const sulTavolo = (P) => Math.abs(P.x) <= TAV.W && P.y >= 0 && P.y <= TAV.L;

// Il livello di sbronza (0..3) di chi ha bevuto "bevuti" bicchieri su "totale"
export function livelloSbronza(bevuti, totale, soglie) {
  return soglie.filter((s) => bevuti >= Math.max(1, Math.ceil(s * totale - 1e-9))).length;
}

// Dal gesto al tiro. m = di lato (la pendenza del gesto sullo schermo: 0 = dritto), p = forza 0..1.
// La pallina atterra, all'altezza del bordo dei bicchieri, lungo la retta che sullo schermo parte
// dalla mano con quella pendenza: così si mira "puntando" verso il bicchiere.
export function tiroDa(m, p, T) {
  const Y = lerp(T.corto, T.lungo, p), s0 = proietta(MANO.x, MANO.y, MANO.h), s1 = proietta(0, Y, BIC.h);
  return { da: { ...MANO }, a: { x: (m * (s0.y - s1.y)) / s1.k, y: Y, h: BIC.h }, arco: T.arco[0] + T.arco[1] * p, durata: T.volo[0] + T.volo[1] * p, p };
}
// ...e al contrario: la pendenza e la forza che servono per far atterrare la pallina in (x, y)
// (serve ai giocatori automatici delle prove)
export function gestoPer(x, y, T) {
  const s0 = proietta(MANO.x, MANO.y, MANO.h), s1 = proietta(0, y, BIC.h);
  return { m: (x * s1.k) / (s0.y - s1.y), p: (y - T.corto) / (T.lungo - T.corto) };
}

// un punto lungo un tratto di volo (e da 0 a 1): un arco tra "da" e "a"
export function puntoVolo(tr, e) {
  return { x: lerp(tr.da.x, tr.a.x, e), y: lerp(tr.da.y, tr.a.y, e), h: lerp(tr.da.h, tr.a.h, e) + tr.arco * 4 * e * (1 - e) };
}

// Che cosa succede a una pallina che arriva in P (all'altezza del bordo dei bicchieri):
// null = nessun bicchiere; se no { tipo: 'centro' | 'bordo', c, q } (q = quanto è in fuori sul bordo, 0..1)
export function suiBicchieri(P, bicchieri, T) {
  let meglio = null, dm = Infinity;
  for (const c of bicchieri) {
    if (!c.su) continue;
    const d = Math.hypot(P.x - c.x, P.y - c.y);
    if (d < dm) { dm = d; meglio = c; }
  }
  if (!meglio) return null;
  const rd = BIC.r * T.dentro, rb = BIC.r * T.bordo;
  if (dm <= rd) return { tipo: 'centro', c: meglio, q: 0 };
  if (dm <= rb) return { tipo: 'bordo', c: meglio, q: (dm - rd) / Math.max(1e-6, rb - rd) };
  return null;
}

// Tutto il viaggio della pallina, deciso al momento del tiro: i tratti da animare uno dopo
// l'altro e l'esito finale.
//   tiro      = { da, a, arco, durata, p } (vedi tiroDa)
//   bicchieri = [{ x, y, su }] quelli a cui si tira, nelle coordinate di chi guarda
//   fortuna   = quanto in più il bordo perdona (la fortuna dell'ubriaco)
// Ritorna { tratti: [{ tipo: 'volo' | 'salto' | 'bordo' | 'via', da, a, arco, durata, ... }],
//           esito: { tipo: 'centro' | 'rimbalzo' | 'fuori' | 'rete', bicchiere?, bordo? } }
// ('rimbalzo' = è entrata dopo aver toccato il tavolo: vale doppio.)
export function pianifica(tiro, bicchieri, T, fortuna = 0) {
  const tratti = [{ tipo: 'volo', da: tiro.da, a: tiro.a, arco: tiro.arco, durata: tiro.durata }];
  const lung = Math.hypot(tiro.a.x - tiro.da.x, tiro.a.y - tiro.da.y) || 1;
  const dir = { x: (tiro.a.x - tiro.da.x) / lung, y: (tiro.a.y - tiro.da.y) / lung };
  const avanti = (P, d, h) => ({ x: P.x + dir.x * d, y: P.y + dir.y * d, h });
  let P = tiro.a, toccato = false, r = suiBicchieri(P, bicchieri, T);

  if (!r) {
    // niente bicchiere: scende fino al tavolo, un po' più avanti
    const Pt = avanti(P, 0.045, 0);
    if (!sulTavolo(Pt)) {
      tratti.push({ tipo: 'via', da: P, a: avanti(P, 0.5, TAV.terra), arco: 0.02, durata: 0.42 });
      return { tratti, esito: { tipo: 'fuori' } };
    }
    tratti[0].a = Pt;
    toccato = true;
    // il salto dopo il rimbalzo sul tavolo
    const salto = { tipo: 'salto', da: Pt, a: avanti(Pt, T.salto[0] + T.salto[1] * tiro.p, BIC.h), arco: 0.15, durata: 0.34 };
    // la rete: se il salto la attraversa troppo basso, la pallina ci resta contro
    const passa = (salto.da.y - TAV.rete) * (salto.a.y - TAV.rete) < 0;
    if (passa) {
      const e = (TAV.rete - salto.da.y) / (salto.a.y - salto.da.y), q = puntoVolo(salto, e);
      if (q.h < TAV.altoRete) {
        tratti.push({ ...salto, a: q, arco: salto.arco * e, durata: salto.durata * e });
        tratti.push({ tipo: 'via', da: q, a: { x: q.x, y: q.y, h: 0 }, arco: 0.03, durata: 0.25, resta: true });
        return { tratti, esito: { tipo: 'rete' } };
      }
    }
    tratti.push(salto);
    P = salto.a;
    r = suiBicchieri(P, bicchieri, T);
    if (!r) {
      // rotola e cade dal tavolo
      tratti.push({ tipo: 'via', da: P, a: avanti(P, 0.75, TAV.terra), arco: 0.05, durata: 0.5 });
      return { tratti, esito: { tipo: 'fuori' } };
    }
  }

  const buono = { tipo: toccato ? 'rimbalzo' : 'centro', bicchiere: r.c };
  if (r.tipo === 'centro') return { tratti, esito: buono };
  // sul bordo: ci gira sopra, poi cade dentro oppure schizza via
  const dentro = r.q <= T.bordoDentro + fortuna;
  const ang = Math.atan2(P.y - r.c.y, P.x - r.c.x);
  tratti.push({ tipo: 'bordo', bicchiere: r.c, ang, durata: T.giroBordo, dentro });
  if (dentro) return { tratti, esito: { ...buono, bordo: true } };
  const lato = Math.cos(ang + Math.PI * 3) >= 0 ? 1 : -1;      // (dopo un giro e mezzo esce dalla parte opposta)
  const orlo = { x: r.c.x + lato * BIC.r, y: r.c.y, h: BIC.h };
  tratti.push({ tipo: 'via', da: orlo, a: { x: orlo.x + lato * 0.75, y: orlo.y + dir.y * 0.2, h: TAV.terra }, arco: 0.16, durata: 0.6 });
  return { tratti, esito: { tipo: 'fuori', bordo: true, bicchiere: r.c } };
}

// Il tiro di un avversario mosso dal computer verso uno dei bicchieri davanti a chi guarda.
//   bersaglio = il bicchiere a cui tira; voglio = 'centro' | 'bordo' | 'fuori' (deciso da chi chiama)
//   rnd = generatore casuale (col seme del round: uguale per tutti)
// Ritorna il piano del volo (come pianifica), con l'esito che si voleva.
export function tiroAvversario(bersaglio, voglio, bicchieri, T, rnd, da = { x: 0, y: TAV.L + 0.12, h: 0.24 }) {
  const rd = BIC.r * T.dentro, rb = BIC.r * T.bordo;
  let piano = null;
  for (let prova = 0; prova < 8; prova++) {
    const ang = rnd() * Math.PI * 2;
    // (il bordo lo si prende sempre nella parte "in fuori": dal bordo l'avversario non entra mai)
    const dist = voglio === 'centro' ? rnd() * rd * 0.6 : voglio === 'bordo' ? lerp(rd + (rb - rd) * 0.7, rb * 0.98, rnd()) : BIC.r * (2.3 + rnd() * 2.2);
    const a = { x: bersaglio.x + Math.cos(ang) * dist, y: bersaglio.y + Math.sin(ang) * dist, h: BIC.h };
    piano = pianifica({ da, a, arco: 0.5, durata: 0.85, p: 0.4 }, bicchieri, { ...T, bordoDentro: -1 }, 0);
    const preso = piano.esito.tipo === 'centro' || piano.esito.tipo === 'rimbalzo';
    if (voglio === 'centro' ? preso : !preso) break;
  }
  return piano;
}
