// Personaggi in stile cartoon vettoriale (testa grande, corpo piccolo).
// Tutto è disegnato in uno spazio di 192x288 unità, testa centrata su x = 96.
// I tratti di ognuno sono parametri: forma del viso, capelli, barba, occhi, vestiti.
import { CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, mix, risalto, alfa, casuale } from './base.js';

const CX = 96;
const lerp = (a, b, t) => a + (b - a) * t;

export const PERSONAGGI = {
  // ricci neri enormi, sopracciglia folte, pizzetto leggero, maglietta nera
  riccardo: {
    pelle: '#e9b58d', capelli: '#1a1920', capelliLuce: '#4c4a66', occhi: '#7a4a22',
    sopra: '#131217', sopraSpess: 9,
    faccia: { top: 46, larg: 56, mascella: 43, mascellaY: 148, mento: 17, mentoY: 178 },
    stile: 'ricci', barba: 'pizzetto', naso: [8, 11], orecchie: 10.5, sorriso: 4,
    vestito: { tipo: 'tshirt', colore: '#24242e', collo: 'giro' }, pantaloni: '#2f3757', scarpe: '#f3f3f3',
  },
  // capelli castani all'indietro, mascella squadrata, barba di qualche giorno, sguardo serio
  giorgio: {
    pelle: '#f0c5a1', capelli: '#5e3b22', capelliLuce: '#9a683e', occhi: '#3d2817',
    sopra: '#3a2413', sopraSpess: 7.5, serio: true, palpebra: [0.22, 0.22],
    faccia: { top: 46, larg: 57, mascella: 53, mascellaY: 154, mento: 31, mentoY: 179 },
    stile: 'indietro', barba: 'ispida', naso: [9, 11], orecchie: 9, sorriso: 0,
    vestito: { tipo: 'tshirt', colore: '#1f1f27', collo: 'v' }, pantaloni: '#3a3c46', scarpe: '#2a2a30',
  },
  // capelli scuri corti, barba folta e piena, maglietta panna
  marco: {
    pelle: '#e3b089', capelli: '#1e1713', capelliLuce: '#4f3e34', occhi: '#2e1c10',
    sopra: '#1a1410', sopraSpess: 8, palpebra: [0.12, 0.12],
    faccia: { top: 46, larg: 59, mascella: 50, mascellaY: 150, mento: 26, mentoY: 176 },
    stile: 'corto', barba: 'piena', naso: [10, 11], orecchie: 9, sorriso: 3,
    vestito: { tipo: 'tshirt', colore: '#f1e9d4', collo: 'giro', logo: '#3aa6a0' }, pantaloni: '#41608f', scarpe: '#e9e4d8',
  },
  // ciuffo alto, barba appena accennata, giacca blu su camicia a quadretti
  greg: {
    pelle: '#eec09b', capelli: '#3c281b', capelliLuce: '#7a563e', occhi: '#5a4024',
    sopra: '#2c1c12', sopraSpess: 7.5,
    faccia: { top: 46, larg: 54, mascella: 43, mascellaY: 151, mento: 20, mentoY: 181 },
    stile: 'ciuffo', barba: 'accenno', naso: [8, 11], orecchie: 9, sorriso: 5,
    vestito: { tipo: 'giacca', colore: '#25365f' }, pantaloni: '#c9b089', scarpe: '#5a3a22',
  },
  // capelli grigi corti, occhi azzurri (e strabici), viso segnato, maglietta azzurra
  beppe: {
    pelle: '#e0b099', capelli: '#868d96', capelliLuce: '#d6dade', occhi: '#2f9ff2',
    sopra: '#6f757d', sopraSpess: 6, anziano: true,
    sguardo: [[7, -2], [-7.5, 3.5]],   // strabismo: [dx, dy] dell'iride per occhio sinistro e destro
    palpebra: [0.3, 0.08],
    faccia: { top: 46, larg: 54, mascella: 39, mascellaY: 150, mento: 18, mentoY: 180 },
    stile: 'grigio', barba: 'nessuna', naso: [11, 13], orecchie: 11, sorriso: -1,
    vestito: { tipo: 'tshirt', colore: '#6dc0ee', collo: 'giro' }, pantaloni: '#2d313c', scarpe: '#3a3a40',
  },
  // Marsupino: testa rasata, barba folta e scura, occhiali da sole neri,
  // giacca blu aperta su maglietta bianca, corporatura robusta, scarpe bianche
  marsupino: {
    pelle: '#e6b48c', capelli: '#1d1511', capelliLuce: '#54423a', occhi: '#3a2414',
    sopra: '#1d1511', sopraSpess: 8.5,
    faccia: { top: 42, larg: 61, mascella: 56, mascellaY: 150, mento: 36, mentoY: 179 },
    stile: 'rasato', barba: 'folta', naso: [10.5, 11], orecchie: 10, sorriso: 6,
    occhiali: { montatura: '#121216', lenti: '#1c2029' },
    corporatura: 1.2,
    vestito: { tipo: 'giacca', colore: '#2a3b66', sotto: '#f7f6f1' }, pantaloni: '#26345a', scarpe: '#f4f4f4',
  },
  // Guerra: capelli scuri tirati su e stempiati, sopracciglia dritte e folte, viso lungo,
  // barba corta, piumino nero su camicia a righe e catenina d'oro
  guerra: {
    pelle: '#edbf9c', capelli: '#2b1d15', capelliLuce: '#664a38', occhi: '#5c3b1c',
    sopra: '#24170f', sopraSpess: 9, sopraDritte: true, palpebra: [0.2, 0.2],
    faccia: { top: 46, larg: 52, mascella: 45, mascellaY: 157, mento: 23, mentoY: 185 },
    stile: 'stempiato', barba: 'ispida', naso: [8, 14], orecchie: 9.5, sorriso: -1, labbra: true,
    vestito: { tipo: 'piumino', colore: '#1c1d24', camicia: '#5b7fc4', catenina: '#e6bd45' }, pantaloni: '#2e3a56', scarpe: '#ececec',
  },
  // Sego (Franci): capelli castano scuro spettinati con la frangia, barba corta,
  // sopracciglia folte, occhiali da sole in testa, maglietta verde oliva
  sego: {
    pelle: '#e4b08a', capelli: '#2f2017', capelliLuce: '#6e503a', occhi: '#3b2415',
    sopra: '#1f150d', sopraSpess: 9.5, palpebra: [0.14, 0.14], sopraDavanti: true,
    faccia: { top: 46, larg: 54, mascella: 46, mascellaY: 155, mento: 25, mentoY: 184 },
    stile: 'spettinato', barba: 'corta', naso: [9, 14], orecchie: 9.5, sorriso: 1, labbra: true,
    occhiali: { inMaglietta: true, montatura: '#3a2216', lenti: '#2a1d16', tartaruga: '#9a6230' },
    vestito: { tipo: 'tshirt', colore: '#7a7852', collo: 'giro' }, pantaloni: '#3b3f4a', scarpe: '#ddd6c4',
  },
  // il Generale (TorRONDAcelli): ricci corti castano-ramati, occhi chiari, barba rada;
  // mimetica con le medaglie, basco, anfibi
  generale: {
    pelle: '#f0c3a0', capelli: '#7a4526', capelliLuce: '#b8784a', occhi: '#7a98b0',
    sopra: '#6a3a1e', sopraSpess: 8, palpebra: [0.14, 0.14],
    faccia: { top: 46, larg: 55, mascella: 49, mascellaY: 154, mento: 28, mentoY: 182 },
    stile: 'ricciCorti', barba: 'ispida', naso: [9, 12], orecchie: 9.5, sorriso: 2, labbra: true,
    cappello: { tipo: 'basco', colore: '#3f5a2c', stemma: '#e8c048' },
    vestito: { tipo: 'mimetica', colore: '#76844a' }, pantaloni: '#66703c', mimeticaPantaloni: true, scarpe: '#2a2018',
  },
  // l'Ingiocabile: ricci scuri, barba corta scura, viso lungo; da croupier (gilet nero,
  // papillon, targhetta col numero 11) sopra la maglia blu del calcio a 5
  ingiocabile: {
    pelle: '#e6b28a', capelli: '#24170f', capelliLuce: '#5a3e2c', occhi: '#3a2414',
    sopra: '#1e140c', sopraSpess: 8.5, palpebra: [0.12, 0.12],
    faccia: { top: 46, larg: 51, mascella: 44, mascellaY: 157, mento: 22, mentoY: 186 },
    stile: 'ricciCorti', barba: 'nessuna', naso: [9, 14], orecchie: 9.5, sorriso: 3, labbra: true,
    vestito: { tipo: 'croupier', colore: '#1c1c24', manica: '#2a52b8', papillon: '#c0392b' }, pantaloni: '#1c1c24', scarpe: '#141418',
  },
  // lo Zio (MaraZio): capelli neri lunghi fino alle spalle, bagnati e tirati indietro;
  // occhiali da sole tartarugati con le lenti scure, baffi e pizzetto, maglietta bianca
  zio: {
    pelle: '#e0b08a', capelli: '#141114', capelliLuce: '#5a5866', occhi: '#3a2414',
    sopra: '#1c1410', sopraSpess: 7.5,
    faccia: { top: 44, larg: 53, mascella: 45, mascellaY: 156, mento: 22, mentoY: 186 },
    stile: 'lunghiBagnati', barba: 'pizzettoBaffi', naso: [10, 15], orecchie: 9.5, sorriso: 1, labbra: true,
    occhiali: { montatura: '#b06a2a', lenti: '#25262c', tartaruga: '#4a240c' },
    vestito: { tipo: 'tshirt', colore: '#f2f1ec', collo: 'giro' }, pantaloni: '#22222a', corti: true, scarpe: '#f4f4f4',
  },
  // Passaseo: ricci scuri e voluminosi, occhiali da vista tondi, sorrisone;
  // camicia scout col fazzolettone a righe, pantaloncini e calzettoni
  passaseo: {
    pelle: '#ecb894', capelli: '#2a1a12', capelliLuce: '#6a4a36', occhi: '#4a2c18',
    sopra: '#2a1a12', sopraSpess: 7.5,
    faccia: { top: 46, larg: 51, mascella: 42, mascellaY: 154, mento: 20, mentoY: 182 },
    stile: 'ricci', barba: 'nessuna', naso: [8.5, 12], orecchie: 9.5, sorriso: 6, sorrisone: true,
    occhiali: { tondi: true, montatura: '#1a1a1e', lenti: '#dff0ff', trasparenza: 0.15 },
    vestito: { tipo: 'scout', colore: '#6c8fbe', fazzoletto: ['#2f5fc0', '#f2c43a', '#d83a3a'] }, pantaloni: '#2c3a62', corti: true, calzettoni: '#2c3a62', scarpe: '#6a4426',
  },
};

export const ESPRESSIONI = ['normale', 'felice', 'triste', 'shock', 'sufficienza'];

// ------------------------------------------------------------
//  TESTA
// ------------------------------------------------------------
function sagomaTesta(c, f) {
  c.beginPath();
  c.moveTo(CX, f.top);
  c.bezierCurveTo(CX + f.larg * 0.75, f.top, CX + f.larg, f.top + 26, CX + f.larg, 106);
  c.bezierCurveTo(CX + f.larg, 128, CX + f.mascella + 6, f.mascellaY - 10, CX + f.mascella, f.mascellaY);
  c.bezierCurveTo(CX + f.mascella - 6, f.mascellaY + 14, CX + f.mento, f.mentoY, CX, f.mentoY);
  c.bezierCurveTo(CX - f.mento, f.mentoY, CX - f.mascella + 6, f.mascellaY + 14, CX - f.mascella, f.mascellaY);
  c.bezierCurveTo(CX - f.mascella - 6, f.mascellaY - 10, CX - f.larg, 128, CX - f.larg, 106);
  c.bezierCurveTo(CX - f.larg, f.top + 26, CX - f.larg * 0.75, f.top, CX, f.top);
  c.closePath();
}

function orecchie(c, p) {
  const r = p.orecchie;
  for (const s of [-1, 1]) {
    const x = CX + s * (p.faccia.larg + 1);
    ellisse(c, x, 120, r, r * 1.45, s * 0.12);
    c.fillStyle = scuro(p.pelle, 0.04); c.fill(); tratto(c, CONT, 3);
    c.beginPath(); c.ellipse(x + s * 1.5, 120, r * 0.42, r * 0.8, 0, 0, Math.PI * 2);
    tratto(c, scuro(p.pelle, 0.3), 1.6);
  }
}

function pelleTesta(c, p) {
  const P = p.pelle;
  sagomaTesta(c, p.faccia);
  c.fillStyle = gradR(c, CX - 18, 88, 8, 112, [[0, chiaro(P, 0.14)], [0.6, P], [1, scuro(P, 0.1)]]);
  c.fill();
  c.save();
  sagomaTesta(c, p.faccia); c.clip();
  c.fillStyle = gradL(c, CX + 16, 0, CX + 62, 0, [[0, 'rgba(130,55,25,0)'], [1, 'rgba(130,55,25,0.24)']]);
  c.fillRect(0, 0, 192, 288);
  c.fillStyle = gradL(c, 0, 50, 0, 88, [[0, 'rgba(90,40,20,0.28)'], [1, 'rgba(90,40,20,0)']]);
  c.fillRect(0, 40, 192, 50);
  for (const s of [-1, 1]) { ellisse(c, CX + s * 36, 141, 12, 7); c.fillStyle = 'rgba(238,105,95,0.26)'; c.fill(); }
  c.restore();
  sagomaTesta(c, p.faccia); tratto(c, CONT, 3);
}

function rughe(c, p) {
  const col = alfa(scuro(p.pelle, 0.5), 0.65);
  c.save();
  sagomaTesta(c, p.faccia); c.clip();
  for (let i = 0; i < 3; i++) {
    c.beginPath(); c.moveTo(CX - 26 + i * 3, 70 + i * 6.5); c.quadraticCurveTo(CX, 66.5 + i * 6.5, CX + 26 - i * 3, 70 + i * 6.5);
    tratto(c, col, 1.7);
  }
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(CX + s * 3, 93); c.lineTo(CX + s * 4, 102); tratto(c, col, 1.5);
    c.beginPath(); c.moveTo(CX + s * 14, 128); c.quadraticCurveTo(CX + s * 26, 135, CX + s * 38, 127); tratto(c, col, 1.7);
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(CX + s * 41, 113 + i * 3); c.lineTo(CX + s * 49, 111 + i * 6.5); tratto(c, col, 1.3); }
    c.beginPath(); c.moveTo(CX + s * 13, 139); c.quadraticCurveTo(CX + s * 23, 149, CX + s * 20, 164); tratto(c, col, 1.9);
    ellisse(c, CX + s * 39, 148, 9, 17, s * 0.2); c.fillStyle = alfa(scuro(p.pelle, 0.55), 0.16); c.fill();
    c.beginPath(); c.moveTo(CX + s * 10, 170); c.quadraticCurveTo(CX + s * 16, 174, CX + s * 14, 178); tratto(c, col, 1.3);
  }
  c.restore();
}

function occhio(c, p, s, espr) {
  const x = CX + s * 26, y = 113, D = CONT;
  const arco = (su) => {
    c.beginPath();
    if (su) { c.moveTo(x - 11, y + 3); c.quadraticCurveTo(x, y - 12, x + 11, y + 3); }
    else { c.moveTo(x - 11, y - 2); c.quadraticCurveTo(x, y + 9, x + 11, y - 2); }
    tratto(c, D, 4.5);
  };
  if (espr === 'felice') return arco(true);
  if (espr === 'triste' || espr === 'sbadiglio') return arco(false);
  if (espr === 'urlo' || espr === 'starnuto') {
    c.beginPath(); c.moveTo(x + s * 11, y - 9); c.lineTo(x - s * 8, y); c.lineTo(x + s * 11, y + 9);
    return tratto(c, D, 4.5);
  }
  const sgranato = espr === 'shock' || espr === 'sconvolto';
  const rx = sgranato ? 14.5 : 12, ry = sgranato ? 16 : 13;
  ellisse(c, x, y, rx, ry); c.fillStyle = '#ffffff'; c.fill();
  c.save();
  ellisse(c, x, y, rx, ry); c.clip();
  c.fillStyle = 'rgba(70,40,60,0.13)'; c.fillRect(x - 20, y - 20, 40, 12);
  const sg = p.sguardo?.[s < 0 ? 0 : 1] ?? [0, 0];
  const ir = sgranato ? 5 : 7.5;
  const ix = x + sg[0] + (espr === 'sufficienza' ? -3 : 0), iy = y + sg[1] + (sgranato ? 0 : 1);
  ellisse(c, ix, iy, ir, ir);
  c.fillStyle = gradR(c, ix - 1.5, iy - 1.5, 0.5, ir, [[0, chiaro(p.occhi, 0.3)], [0.65, p.occhi], [1, scuro(p.occhi, 0.5)]]);
  c.fill();
  ellisse(c, ix, iy, ir * 0.48, ir * 0.48); c.fillStyle = '#140d0c'; c.fill();
  ellisse(c, ix - ir * 0.36, iy - ir * 0.4, ir * 0.28, ir * 0.28); c.fillStyle = '#ffffff'; c.fill();
  ellisse(c, ix + ir * 0.35, iy + ir * 0.36, ir * 0.13, ir * 0.13); c.fill();
  const palp = espr === 'sufficienza' ? 0.5 : sgranato ? 0 : (p.palpebra?.[s < 0 ? 0 : 1] ?? 0);
  if (palp > 0) {
    const yl = y - ry + ry * 2 * palp;
    c.fillStyle = scuro(p.pelle, 0.1); c.fillRect(x - 20, y - ry - 2, 40, yl - (y - ry - 2));
    c.beginPath(); c.moveTo(x - 20, yl); c.lineTo(x + 20, yl); tratto(c, D, 2.6);
  }
  c.restore();
  ellisse(c, x, y, rx, ry); tratto(c, D, 2.6);
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92); tratto(c, D, 4.2);
}

function sopracciglio(c, p, s, espr) {
  const x = CX + s * 26, y = 92, t = p.sopraSpess;
  let yi = 0, ye = 1, arco = -4; // yi = estremo verso il naso, ye = estremo esterno
  if (p.serio && (espr === 'normale' || espr === 'parla')) { yi = 4; ye = -2; arco = -1; }
  if (p.sopraDritte && (espr === 'normale' || espr === 'parla')) { yi = 1; ye = 0; arco = -1.5; }
  if (espr === 'felice') { yi = -5; ye = -3; arco = -6; }
  if (espr === 'triste' || espr === 'sbadiglio') { yi = -7; ye = 3; arco = -2; }
  if (espr === 'shock' || espr === 'sconvolto') { yi = -11; ye = -9; arco = -7; }
  if (espr === 'urlo' || espr === 'starnuto') { yi = 5; ye = -6; arco = 0; }
  if (espr === 'sufficienza') { if (s < 0) { yi = -8; ye = -7; arco = -6; } else { yi = 3; ye = 1; arco = 0; } }
  const xi = x - s * 13, xe = x + s * 15, ym = y + (yi + ye) / 2 + arco;
  c.beginPath();
  c.moveTo(xi, y + yi - t / 2);
  c.quadraticCurveTo(x, ym - t / 2, xe, y + ye - t * 0.18);
  c.lineTo(xe, y + ye + t * 0.18);
  c.quadraticCurveTo(x, ym + t / 2, xi, y + yi + t / 2);
  c.closePath();
  c.fillStyle = p.sopra; c.fill(); tratto(c, p.sopra, 1.5);
}

function naso(c, p, espr) {
  const [w, h] = p.naso, y = 134;
  c.beginPath();
  c.moveTo(CX - 3, y - h);
  c.quadraticCurveTo(CX - w * 0.7, y - 2, CX - w, y + 2);
  c.quadraticCurveTo(CX - w, y + h * 0.62, CX, y + h * 0.62);
  c.quadraticCurveTo(CX + w, y + h * 0.62, CX + w, y + 2);
  c.quadraticCurveTo(CX + w * 0.7, y - 2, CX + 3, y - h);
  c.closePath();
  c.fillStyle = espr === 'starnuto' ? '#ea8b7c' : scuro(p.pelle, 0.08); c.fill();
  c.beginPath();
  c.moveTo(CX - w, y); c.quadraticCurveTo(CX - w - 0.5, y + h * 0.64, CX, y + h * 0.64); c.quadraticCurveTo(CX + w + 0.5, y + h * 0.64, CX + w, y);
  tratto(c, scuro(p.pelle, 0.5), 2.4);
  ellisse(c, CX - 2, y - 1, w * 0.32, h * 0.3); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill();
}

function bocca(c, p, espr) {
  const y = 156, D = CONT, B = '#5a1218';
  const aperta = (rx, ry, yy, denti, lingua) => {
    ellisse(c, CX, yy, rx, ry); c.fillStyle = B; c.fill();
    c.save(); ellisse(c, CX, yy, rx, ry); c.clip();
    if (denti) { c.fillStyle = '#ffffff'; c.fillRect(CX - rx, yy - ry, rx * 2, ry * 0.5); }
    if (lingua) { ellisse(c, CX, yy + ry * 0.75, rx * 0.65, ry * 0.5); c.fillStyle = '#ec7b86'; c.fill(); }
    c.restore();
    ellisse(c, CX, yy, rx, ry); tratto(c, D, 3);
  };
  switch (espr) {
    case 'felice': {
      const forma = () => {
        c.beginPath(); c.moveTo(CX - 20, y - 7); c.quadraticCurveTo(CX, y - 2, CX + 20, y - 7);
        c.bezierCurveTo(CX + 18, y + 18, CX - 18, y + 18, CX - 20, y - 7); c.closePath();
      };
      forma(); c.fillStyle = B; c.fill();
      c.save(); forma(); c.clip();
      c.fillStyle = '#ffffff'; c.fillRect(CX - 22, y - 9, 44, 9);
      ellisse(c, CX, y + 13, 11, 6); c.fillStyle = '#ec7b86'; c.fill();
      c.restore();
      forma(); tratto(c, D, 3);
      break;
    }
    case 'triste':
      c.beginPath(); c.moveTo(CX - 13, y + 6); c.quadraticCurveTo(CX, y - 6, CX + 13, y + 6); tratto(c, D, 3.6);
      c.beginPath(); c.moveTo(CX - 5, y + 8); c.quadraticCurveTo(CX, y + 11, CX + 5, y + 8); tratto(c, alfa(scuro(p.pelle, 0.5), 0.7), 1.8);
      break;
    case 'shock': aperta(8, 11, y + 4, false, true); break;
    case 'sconvolto': aperta(13, 9, y + 4, true, false); break;
    case 'urlo': aperta(18, 15, y + 6, true, true); break;
    case 'sbadiglio': aperta(12, 17, y + 7, true, true); break;
    case 'starnuto': aperta(6, 5, y + 2, false, false); break;
    case 'parla': aperta(10, 7, y + 3, true, false); break;
    case 'sufficienza':
      c.beginPath(); c.moveTo(CX - 12, y + 2); c.quadraticCurveTo(CX + 2, y + 3, CX + 14, y - 3); tratto(c, D, 3.4);
      break;
    default: {
      if (p.sorrisone) {
        const forma = () => { c.beginPath(); c.moveTo(CX - 16, y - 5); c.quadraticCurveTo(CX, y, CX + 16, y - 5); c.bezierCurveTo(CX + 13, y + 11, CX - 13, y + 11, CX - 16, y - 5); c.closePath(); };
        forma(); c.fillStyle = B; c.fill();
        c.save(); forma(); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(CX - 17, y - 7, 34, 8); ellisse(c, CX, y + 8, 8, 4); c.fillStyle = '#ec7b86'; c.fill(); c.restore();
        forma(); tratto(c, D, 3);
        break;
      }
      const k = p.sorriso, folta = p.barba === 'piena' || p.barba === 'folta';
      if (folta) { ellisse(c, CX, y + 3.5, 11, 4.5); c.fillStyle = '#cf8a7c'; c.fill(); }
      else if (p.labbra) { ellisse(c, CX, y + 4.5, 9.5, 4); c.fillStyle = alfa('#c9786c', 0.55); c.fill(); } // labbra carnose
      c.beginPath(); c.moveTo(CX - 14, y - k * 0.35); c.quadraticCurveTo(CX, y + k * 1.5, CX + 14, y - k * 0.35); tratto(c, D, 3.4);
      if (!folta) {
        c.beginPath(); c.moveTo(CX - 6, y + 7 + k * 0.5); c.quadraticCurveTo(CX, y + 9.5 + k * 0.5, CX + 6, y + 7 + k * 0.5);
        tratto(c, alfa(scuro(p.pelle, 0.5), 0.55), 1.8);
      }
    }
  }
}

function barba(c, p) {
  const f = p.faccia, H = p.capelli, r = casuale(5);
  const puntini = (n, x0, y0, w, h, a) => {
    c.fillStyle = alfa(scuro(H, 0.3), a);
    for (let i = 0; i < n; i++) { ellisse(c, x0 + r() * w, y0 + r() * h, 0.8, 0.8); c.fill(); }
  };
  if (p.barba === 'piena') {
    const forma = () => {
      c.beginPath();
      c.moveTo(CX - 59, 104);
      c.bezierCurveTo(CX - 64, 132, CX - 58, 162, CX - 40, 178);
      c.bezierCurveTo(CX - 22, 194, CX + 22, 194, CX + 40, 178);
      c.bezierCurveTo(CX + 58, 162, CX + 64, 132, CX + 59, 104);
      c.lineTo(CX + 50, 106);
      c.bezierCurveTo(CX + 50, 126, CX + 42, 136, CX + 28, 140);
      c.bezierCurveTo(CX + 18, 138, CX + 10, 144, CX, 143);
      c.bezierCurveTo(CX - 10, 144, CX - 18, 138, CX - 28, 140);
      c.bezierCurveTo(CX - 42, 136, CX - 50, 126, CX - 50, 106);
      c.closePath();
    };
    forma(); c.fillStyle = gradL(c, 0, 104, 0, 192, [[0, H], [0.6, chiaro(H, 0.06)], [1, scuro(H, 0.2)]]); c.fill();
    c.save(); forma(); c.clip();
    c.globalAlpha = 0.7;
    for (let i = 0; i < 150; i++) {
      const x = CX - 62 + r() * 124, y = 106 + r() * 86, d = (x - CX) * 0.05;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + d, y + 3, x + d * 1.6, y + 6 + r() * 3);
      tratto(c, i % 4 ? p.capelliLuce : scuro(H, 0.5), 1.4);
    }
    c.globalAlpha = 1;
    c.restore();
    forma(); tratto(c, CONT, 3);
    return;
  }
  if (p.barba === 'folta') {
    // barba piena ma curata: segue la mascella, scende un po' sotto il mento, baffi uniti
    const L = f.larg, M = f.mascella, my = f.mascellaY, cy = f.mentoY;
    const forma = () => {
      c.beginPath();
      c.moveTo(CX - L + 1, 100);
      c.bezierCurveTo(CX - L - 3, 126, CX - M - 4, my - 6, CX - M + 4, my + 10);
      c.bezierCurveTo(CX - M + 12, cy + 4, CX - 22, cy + 17, CX, cy + 17);
      c.bezierCurveTo(CX + 22, cy + 17, CX + M - 12, cy + 4, CX + M - 4, my + 10);
      c.bezierCurveTo(CX + M + 4, my - 6, CX + L + 3, 126, CX + L - 1, 100);
      c.lineTo(CX + L - 9, 103);
      c.bezierCurveTo(CX + L - 9, 122, CX + 46, 134, CX + 31, 138);
      c.bezierCurveTo(CX + 21, 140, CX + 13, 135, CX, 137);
      c.bezierCurveTo(CX - 13, 135, CX - 21, 140, CX - 31, 138);
      c.bezierCurveTo(CX - 46, 134, CX - L + 9, 122, CX - L + 9, 103);
      c.closePath();
    };
    forma(); c.fillStyle = gradL(c, 0, 100, 0, cy + 17, [[0, H], [0.55, chiaro(H, 0.07)], [1, scuro(H, 0.25)]]); c.fill();
    c.save(); forma(); c.clip();
    c.globalAlpha = 0.65;
    for (let i = 0; i < 170; i++) {
      const x = CX - L + r() * L * 2, y = 100 + r() * (cy - 80), d = (x - CX) * 0.05;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + d, y + 3, x + d * 1.5, y + 5 + r() * 3);
      tratto(c, i % 4 ? p.capelliLuce : scuro(H, 0.5), 1.3);
    }
    c.globalAlpha = 1;
    c.restore();
    forma(); tratto(c, CONT, 3);
    return;
  }
  if (p.barba === 'nessuna') return;
  c.save();
  sagomaTesta(c, f); c.clip();
  if (p.barba === 'corta') {
    // barba corta e fitta: guance basse, mascella, mento e baffi ben marcati
    const forma = () => {
      c.beginPath();
      c.moveTo(CX - 62, 110); c.bezierCurveTo(CX - 50, 132, CX - 34, 138, CX - 22, 141);
      c.quadraticCurveTo(CX - 11, 137, CX, 139); c.quadraticCurveTo(CX + 11, 137, CX + 22, 141);
      c.bezierCurveTo(CX + 34, 138, CX + 50, 132, CX + 62, 110);
      c.lineTo(CX + 62, 200); c.lineTo(CX - 62, 200); c.closePath();
    };
    forma(); c.fillStyle = gradL(c, 0, 116, 0, 150, [[0, alfa(H, 0.12)], [1, alfa(H, 0.42)]]); c.fill();
    c.save(); forma(); c.clip(); puntini(700, CX - 60, 112, 120, 76, 0.6); c.restore();
    c.beginPath(); c.moveTo(CX - 17, 147); c.quadraticCurveTo(CX, 141, CX + 17, 147); tratto(c, alfa(H, 0.5), 5); // baffi
    ellisse(c, CX, 176, 15, 9); c.fillStyle = alfa(H, 0.3); c.fill();                                         // mento
  } else if (p.barba === 'pizzettoBaffi') {
    // barba di qualche giorno, baffi sottili e pizzetto sul mento
    c.beginPath();
    c.moveTo(CX - 62, 124); c.quadraticCurveTo(CX - 32, 142, CX - 18, 148); c.quadraticCurveTo(CX, 143, CX + 18, 148);
    c.quadraticCurveTo(CX + 32, 142, CX + 62, 124); c.lineTo(CX + 62, 200); c.lineTo(CX - 62, 200); c.closePath();
    c.fillStyle = gradL(c, 0, 124, 0, 160, [[0, alfa(H, 0)], [1, alfa(H, 0.13)]]); c.fill();
    c.save(); c.clip(); puntini(260, CX - 58, 128, 116, 60, 0.22); c.restore();
    c.beginPath(); c.moveTo(CX - 19, 152); c.quadraticCurveTo(CX - 10, 144, CX, 146); c.quadraticCurveTo(CX + 10, 144, CX + 19, 152); tratto(c, alfa(H, 0.75), 3.6);
    ellisse(c, CX, 168, 4.5, 3.5); c.fillStyle = alfa(H, 0.6); c.fill();
    ellisse(c, CX, 180, 14, 7.5); c.fillStyle = alfa(H, 0.45); c.fill();
    puntini(70, CX - 15, 172, 30, 14, 0.5);
  } else if (p.barba === 'pizzetto') {
    ellisse(c, CX, 173, 17, 10); c.fillStyle = alfa(H, 0.55); c.fill();
    ellisse(c, CX, 165, 5, 3.5); c.fillStyle = alfa(H, 0.5); c.fill();
    c.beginPath(); c.moveTo(CX - 15, 150); c.quadraticCurveTo(CX, 144, CX + 15, 150); tratto(c, alfa(H, 0.28), 4);
    puntini(60, CX - 17, 162, 34, 18, 0.5);
  } else {
    const a = p.barba === 'ispida' ? 0.26 : 0.13;
    c.beginPath();
    c.moveTo(CX - 62, 122); c.quadraticCurveTo(CX - 32, 140, CX - 18, 146); c.quadraticCurveTo(CX, 141, CX + 18, 146);
    c.quadraticCurveTo(CX + 32, 140, CX + 62, 122); c.lineTo(CX + 62, 200); c.lineTo(CX - 62, 200); c.closePath();
    c.fillStyle = gradL(c, 0, 122, 0, 150, [[0, alfa(H, 0)], [1, alfa(scuro(H, 0.2), a)]]); c.fill();
    c.save(); c.clip(); puntini(p.barba === 'ispida' ? 420 : 220, CX - 58, 128, 116, 54, a * 1.6); c.restore();
  }
  c.restore();
}

// --- capelli: 'dietro' (prima della testa) e 'davanti' (sopra la fronte) ---
function ciocche(c, forma, n, fn) {
  c.save(); forma(); c.clip();
  for (let i = 0; i < n; i++) fn(i);
  c.restore();
}

function capelli(c, p, fase, o) {
  const H = p.capelli, L = p.capelliLuce;
  const sfum = (y0, y1) => gradL(c, 0, y0, 0, y1, [[0, chiaro(H, 0.16)], [0.45, H], [1, scuro(H, 0.28)]]);

  if (p.stile === 'ricci') {
    const r = casuale(fase === 'dietro' ? 11 : 23), cerchi = [];
    if (fase === 'dietro') {
      for (let i = 0; i <= 15; i++) {
        const th = ((165 + (i / 15) * 210) * Math.PI) / 180;
        cerchi.push([CX + Math.cos(th) * 64 + (r() - 0.5) * 5, 94 + Math.sin(th) * 60 + (r() - 0.5) * 5, 17 + r() * 5]);
      }
      for (let i = 0; i < 8; i++) cerchi.push([CX - 44 + i * 12.5, 48 + (r() - 0.5) * 10, 18]);
    } else {
      for (let i = 0; i < 8; i++) {
        const k = (i - 3.5) / 3.5;
        cerchi.push([CX + k * 50, 65 + k * k * 12 + (r() - 0.5) * 4, 11.5 + r() * 3.5]);
      }
    }
    for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr + 2.6, rr + 2.6); c.fillStyle = CONT; c.fill(); }
    for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr, rr); c.fillStyle = H; c.fill(); }
    if (fase === 'dietro') { ellisse(c, CX, 88, 62, 54); c.fillStyle = H; c.fill(); }
    else {
      c.save(); c.beginPath(); c.rect(0, 0, 192, 67); c.clip(); sagomaTesta(c, p.faccia); c.fillStyle = H; c.fill(); c.restore();
      for (let i = 0; i < 9; i++) cerchi.push([52 + r() * 88, 46 + r() * 16, 5]);
    }
    c.globalAlpha = 0.85;
    for (const [x, y, rr] of cerchi) for (let k = 0; k < (rr > 6 ? 4 : 1); k++) {
      const a = r() * 6.28, qx = x + (r() - 0.5) * rr * 1.1, qy = y + (r() - 0.5) * rr * 1.1, qr = 3 + r() * 3.5;
      c.beginPath(); c.arc(qx, qy, qr, a, a + 3.4 + r() * 1.6);
      tratto(c, k === 2 ? chiaro(L, 0.25) : L, 1.7);
    }
    c.globalAlpha = 1;
    return;
  }

  if (p.stile === 'lunghiBagnati') {
    const lucido = (y0, y1) => gradL(c, 0, y0, 0, y1, [[0, scuro(H, 0.05)], [0.5, H], [1, scuro(H, 0.3)]]);
    if (fase === 'dietro') {
      // la massa dietro la testa, fino alle spalle, che finisce a punte
      const r = casuale(41), dietro = () => {
        c.beginPath(); c.moveTo(CX - 62, 74);
        c.bezierCurveTo(CX - 62, 18, CX + 62, 18, CX + 62, 74);
        c.bezierCurveTo(CX + 70, 112, CX + 74, 164, CX + 76, 204);
        // punte a destra, poi su dietro il mento (lascia libero il collo) e punte a sinistra
        for (let i = 1; i <= 5; i++) { const x = CX + 76 - i * 6.4; c.lineTo(x + 3.2, 210 + r() * 12); c.lineTo(x, 202 + r() * 4); }
        c.lineTo(CX + 40, 160); c.lineTo(CX - 40, 160); c.lineTo(CX - 44, 202);
        for (let i = 1; i <= 5; i++) { const x = CX - 44 - i * 6.4; c.lineTo(x + 3.2, 210 + r() * 12); c.lineTo(x, 202 + r() * 4); }
        c.bezierCurveTo(CX - 74, 164, CX - 70, 112, CX - 62, 74); c.closePath();
      };
      dietro(); c.fillStyle = gradL(c, 0, 30, 0, 215, [[0, scuro(H, 0.15)], [1, scuro(H, 0.4)]]); c.fill(); tratto(c, CONT, 3);
      return;
    }
    // cima tirata indietro, con l'attaccatura alta e una riga appena accennata
    const cima = () => {
      c.beginPath(); c.moveTo(CX - 53, 104);
      c.bezierCurveTo(CX - 55, 80, CX - 48, 64, CX - 30, 58);
      c.bezierCurveTo(CX - 16, 54, CX - 6, 56, CX + 4, 61);
      c.bezierCurveTo(CX + 14, 54, CX + 34, 56, CX + 45, 66);
      c.bezierCurveTo(CX + 52, 74, CX + 55, 88, CX + 54, 104);
      c.bezierCurveTo(CX + 70, 80, CX + 66, 34, CX + 40, 22);
      c.bezierCurveTo(CX + 12, 10, CX - 22, 10, CX - 44, 24);
      c.bezierCurveTo(CX - 68, 40, CX - 70, 84, CX - 53, 104);
      c.closePath();
    };
    // due tende che coprono le orecchie e scendono lungo le guance fino alle spalle
    const tenda = (s) => () => {
      const r = casuale(s > 0 ? 7 : 8);
      c.beginPath(); c.moveTo(CX + s * 42, 64);
      c.bezierCurveTo(CX + s * 54, 78, CX + s * 54, 108, CX + s * 53, 130);
      c.bezierCurveTo(CX + s * 52, 156, CX + s * 49, 178, CX + s * 45, 198);
      for (let i = 1; i <= 5; i++) { const x = CX + s * (45 + i * 6); c.lineTo(x - s * 3, 206 + r() * 14); c.lineTo(x, 197 + r() * 5); }
      c.bezierCurveTo(CX + s * 76, 160, CX + s * 74, 108, CX + s * 67, 80);
      c.bezierCurveTo(CX + s * 63, 70, CX + s * 54, 62, CX + s * 42, 64);
      c.closePath();
    };
    for (const s of [-1, 1]) {
      const forma = tenda(s);
      forma(); c.fillStyle = lucido(64, 214); c.fill();
      c.globalAlpha = 0.8;
      ciocche(c, forma, 7, (i) => {
        const x0 = CX + s * (50 + i * 3.6), y0 = 70 + i * 2;
        c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + s * 6, y0 + 50, x0 - s * 2, y0 + 90, x0 + s * (2 + i * 0.6), 214);
        tratto(c, i % 2 ? scuro(H, 0.5) : L, i % 2 ? 1.4 : 1.9);
      });
      c.globalAlpha = 1;
      forma(); tratto(c, CONT, 3);
      // qualche ciocca bagnata che si stacca
      for (const [dx, y0, dy] of [[64, 168, 50], [52, 182, 34]]) {
        c.beginPath(); c.moveTo(CX + s * dx, y0); c.quadraticCurveTo(CX + s * (dx + 6), y0 + dy * 0.5, CX + s * (dx + 3), y0 + dy);
        tratto(c, CONT, 3.2); tratto(c, H, 1.5);
      }
    }
    cima(); c.fillStyle = lucido(12, 104); c.fill();
    c.globalAlpha = 0.8;
    ciocche(c, cima, 14, (i) => {
      const x0 = CX - 50 + i * 7.6, y0 = 62 - Math.sin((i / 13) * Math.PI) * 6;
      c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 - 3, y0 - 22, x0 + (x0 - CX) * 0.3, 30, x0 + (x0 - CX) * 0.5, 16);
      tratto(c, i % 3 === 0 ? scuro(H, 0.5) : L, i % 3 === 0 ? 1.6 : 2.2);
    });
    c.globalAlpha = 1;
    c.beginPath(); c.moveTo(CX - 30, 30); c.quadraticCurveTo(CX - 6, 20, CX + 22, 26); tratto(c, 'rgba(255,255,255,0.22)', 3); // riflesso del bagnato
    cima(); tratto(c, CONT, 3);
    return;
  }

  if (p.stile === 'indietro') {
    if (fase === 'dietro') {
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(CX + s * 48, 84);
        c.bezierCurveTo(CX + s * 72, 92, CX + s * 71, 128, CX + s * 59, 140);
        c.bezierCurveTo(CX + s * 55, 128, CX + s * 53, 110, CX + s * 46, 100); c.closePath();
        c.fillStyle = scuro(H, 0.28); c.fill(); tratto(c, CONT, 3);
      }
      return;
    }
    const forma = () => {
      c.beginPath(); c.moveTo(39, 106);
      c.bezierCurveTo(40, 88, 46, 77, 58, 72);
      c.bezierCurveTo(72, 64, 84, 67, 98, 69);
      c.bezierCurveTo(116, 64, 136, 65, 146, 77);
      c.bezierCurveTo(151, 85, 153, 95, 153, 106);
      c.bezierCurveTo(169, 86, 167, 48, 147, 31);
      c.bezierCurveTo(124, 12, 74, 15, 52, 35);
      c.bezierCurveTo(29, 55, 27, 88, 39, 106);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(14, 104); c.fill();
    c.globalAlpha = 0.75;
    ciocche(c, forma, 13, (i) => {
      const x0 = 44 + i * 8.6, y0 = 74 - Math.sin((i / 12) * Math.PI) * 7;
      c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 - 5, y0 - 22, x0 + 4, 32, x0 + 24, 20);
      tratto(c, i % 3 === 0 ? scuro(H, 0.4) : L, i % 3 === 0 ? 1.8 : 2.5);
    });
    c.globalAlpha = 1;
    forma(); tratto(c, CONT, 3);
    return;
  }

  if (p.stile === 'spettinato' && fase === 'dietro') {
    // volume dietro la testa e sopra le orecchie
    c.beginPath(); c.moveTo(CX - 50, 130);
    c.bezierCurveTo(CX - 72, 104, CX - 72, 42, CX - 32, 24);
    c.bezierCurveTo(CX - 4, 12, CX + 40, 18, CX + 62, 46);
    c.bezierCurveTo(CX + 76, 76, CX + 72, 108, CX + 50, 130);
    c.closePath();
    c.fillStyle = scuro(H, 0.25); c.fill(); tratto(c, CONT, 3);
    return;
  }

  if (fase === 'dietro') return;

  if (p.stile === 'rasato') {
    // testa rasata: ombra dei capelli cortissimi, riflesso di luce in cima
    const f = p.faccia, LG = f.larg;
    c.save();
    sagomaTesta(c, f); c.clip();
    c.beginPath(); c.moveTo(CX - LG - 4, 114);
    c.bezierCurveTo(CX - LG - 6, 28, CX + LG + 6, 28, CX + LG + 4, 114);
    c.lineTo(CX + LG - 6, 110);
    c.bezierCurveTo(CX + LG - 8, 84, CX + 34, 70, CX, 69);
    c.bezierCurveTo(CX - 34, 70, CX - LG + 8, 84, CX - LG + 6, 110);
    c.closePath();
    c.fillStyle = alfa(H, p.rasatoScuro ? 0.5 : 0.14); c.fill();
    c.clip();
    const r = casuale(4);
    c.fillStyle = alfa(H, p.rasatoScuro ? 0.6 : 0.3);
    for (let i = 0; i < 300; i++) { ellisse(c, CX - LG + r() * LG * 2, f.top + r() * 70, 0.7, 0.7); c.fill(); }
    c.restore();
    ellisse(c, CX - 20, f.top + 15, 18, 7, -0.3); c.fillStyle = `rgba(255,255,255,${p.rasatoScuro ? 0.12 : 0.32})`; c.fill();
    ellisse(c, CX - 31, f.top + 22, 4.5, 2.4, -0.5); c.fillStyle = `rgba(255,255,255,${p.rasatoScuro ? 0.2 : 0.5})`; c.fill();
    return;
  }

  if (p.stile === 'stempiato') {
    // corti ai lati, tirati su in cima, attaccatura alta alle tempie
    const forma = () => {
      c.beginPath(); c.moveTo(45, 110);
      c.bezierCurveTo(43, 98, 44, 88, 48, 80);
      c.bezierCurveTo(52, 70, 56, 58, 61, 51);
      c.bezierCurveTo(66, 61, 80, 64, 96, 64);
      c.bezierCurveTo(112, 64, 126, 61, 131, 51);
      c.bezierCurveTo(136, 58, 140, 70, 144, 80);
      c.bezierCurveTo(148, 88, 149, 98, 147, 110);
      c.bezierCurveTo(155, 98, 158, 78, 155, 58);
      c.bezierCurveTo(151, 34, 128, 17, 98, 16);
      c.bezierCurveTo(68, 16, 44, 30, 37, 54);
      c.bezierCurveTo(33, 76, 37, 98, 45, 110);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(10, 100); c.fill();
    // lati sfumati: si intravede la pelle
    c.save(); forma(); c.clip();
    for (const s of [-1, 1]) {
      c.fillStyle = gradL(c, CX + s * 32, 0, CX + s * 56, 0, [[0, alfa(p.pelle, 0)], [1, alfa(p.pelle, 0.45)]]);
      c.fillRect(s < 0 ? 0 : CX + 32, 60, 64, 56);
    }
    c.restore();
    c.globalAlpha = 0.75;
    ciocche(c, forma, 15, (i) => {
      const x0 = 58 + i * 5.4, y0 = 52 + Math.sin((i / 14) * Math.PI) * 12;
      c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 - 1, y0 - 18, x0 + 8, 34, x0 + 16 + (i - 7) * 1.4, 17);
      tratto(c, i % 3 === 0 ? scuro(H, 0.45) : L, i % 3 === 0 ? 1.7 : 2.3);
    });
    c.globalAlpha = 1;
    c.beginPath(); c.moveTo(76, 34); c.bezierCurveTo(92, 23, 116, 22, 132, 30); tratto(c, 'rgba(255,255,255,0.12)', 6);
    forma(); tratto(c, CONT, 3);
    return;
  }

  if (p.stile === 'spettinato') {
    // un po' lunghi e spettinati, frangia a ciocche sulla fronte
    // ciocche della frangia, da destra a sinistra: [punta, attaccatura]
    const punte = [[[134, 82], [127, 69]], [[114, 84], [107, 69]], [[93, 83], [86, 68]], [[72, 81], [66, 70]], [[53, 85], [49, 84]]];
    const forma = () => {
      c.beginPath(); c.moveTo(41, 112);
      c.bezierCurveTo(30, 84, 30, 48, 52, 30);
      c.bezierCurveTo(60, 22, 68, 22, 74, 15);
      c.bezierCurveTo(84, 21, 92, 11, 103, 13);
      c.bezierCurveTo(113, 15, 117, 21, 127, 19);
      c.bezierCurveTo(151, 26, 166, 54, 160, 84);
      c.bezierCurveTo(158, 96, 155, 104, 151, 112);
      c.bezierCurveTo(151, 98, 150, 88, 147, 74);
      let px = 147;
      for (const [[tx, ty], [vx, vy]] of punte) {
        c.quadraticCurveTo(px - 1, ty + 1, tx, ty);          // la ciocca scende e si arriccia verso sinistra
        c.quadraticCurveTo(tx - 1, vy + 6, vx, vy);          // e risale all'attaccatura della successiva
        px = vx;
      }
      c.bezierCurveTo(46, 92, 44, 102, 41, 112);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(12, 96); c.fill();
    const r = casuale(17);
    c.globalAlpha = 0.75;
    ciocche(c, forma, 22, (i) => {
      // ciocche che partono dalla nuca e cadono verso la frangia, piegando a sinistra
      const x1 = 44 + i * 5.2 + (r() - 0.5) * 3, y1 = 70 + r() * 12, x0 = 104 + (x1 - 96) * 0.35, y0 = 14 + r() * 6;
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1 + 12 + (x1 - 96) * 0.25, (y0 + y1) / 2 - 6, x1, y1);
      tratto(c, i % 3 === 0 ? scuro(H, 0.45) : L, i % 3 === 0 ? 1.7 : 2.4);
    });
    c.globalAlpha = 1;
    forma(); tratto(c, CONT, 3);
    // ciuffi ribelli
    for (const [x, y, a] of [[84, 18, -0.7], [122, 21, 0.8]]) {
      c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x + a * 2, y - 2, x + a * 6, y - 4);
      tratto(c, CONT, 5); tratto(c, H, 2.4);
    }
    return;
  }

  if (p.stile === 'ricciCorti') {
    // ricci corti e fitti in cima, lati corti
    const r = casuale(37);
    const forma = () => {
      c.beginPath(); c.moveTo(41, 108);
      c.bezierCurveTo(34, 74, 48, 30, 96, 26);
      c.bezierCurveTo(144, 30, 158, 74, 151, 108);
      c.lineTo(146, 94); c.quadraticCurveTo(142, 78, 128, 74); c.quadraticCurveTo(96, 66, 64, 74); c.quadraticCurveTo(50, 78, 46, 94);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(24, 100); c.fill();
    c.save(); forma(); c.clip();
    for (const s of [-1, 1]) {
      c.fillStyle = gradL(c, CX + s * 38, 0, CX + s * 56, 0, [[0, alfa(p.pelle, 0)], [1, alfa(p.pelle, 0.35)]]);
      c.fillRect(s < 0 ? 0 : CX + 38, 80, 58, 36);
    }
    c.restore();
    const ricci = [];
    for (let i = 0; i < 13; i++) { const a = Math.PI * (1.04 + i * 0.0715); ricci.push([96 + Math.cos(a) * 55, 78 + Math.sin(a) * 50, 7 + r() * 2]); }
    for (let i = 0; i < 24; i++) { const a = Math.PI * (1.1 + r() * 0.8), d = 0.3 + r() * 0.6; ricci.push([96 + Math.cos(a) * 54 * d, 76 + Math.sin(a) * 46 * d, 5.5 + r() * 2.5]); }
    for (let i = 0; i < 10; i++) { const k = i / 9; ricci.push([56 + k * 80 + (r() - 0.5) * 3, 74 - Math.sin(k * Math.PI) * 5, 5.5 + r() * 1.5]); }
    for (const [x, y, rr] of ricci) { ellisse(c, x, y, rr + 2.2, rr + 2.2); c.fillStyle = CONT; c.fill(); }
    for (const [x, y, rr] of ricci) { ellisse(c, x, y, rr, rr); c.fillStyle = H; c.fill(); }
    c.globalAlpha = 0.85;
    for (const [x, y, rr] of ricci) { const a = r() * 6.28; c.beginPath(); c.arc(x + (r() - 0.5) * 2, y + (r() - 0.5) * 2, rr * 0.55, a, a + 3.6); tratto(c, L, 1.5); }
    c.globalAlpha = 1;
    return;
  }

  if (p.stile === 'corto') {
    const forma = () => {
      c.beginPath(); c.moveTo(37, 110);
      c.bezierCurveTo(29, 70, 50, 35, 96, 34);
      c.bezierCurveTo(142, 35, 163, 70, 155, 110);
      c.lineTo(148, 98);
      c.quadraticCurveTo(149, 82, 141, 77);
      [[132, 85], [122, 76], [112, 86], [101, 77], [90, 86], [79, 77], [68, 85], [58, 77], [51, 81]].forEach(([x, y]) => c.lineTo(x, y));
      c.quadraticCurveTo(43, 85, 44, 98);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(30, 100); c.fill();
    const r = casuale(3);
    c.globalAlpha = 0.6;
    ciocche(c, forma, 70, () => {
      const x = 36 + r() * 120, y = 36 + r() * 50;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (x - CX) * 0.06, y + 6 + r() * 4); tratto(c, L, 1.5);
    });
    c.globalAlpha = 1;
    forma(); tratto(c, CONT, 3);
    return;
  }

  if (p.stile === 'ciuffo') {
    const v = o.vento ?? 0;
    c.save();
    c.transform(1, 0, v, 1, -v * 70, 0); // il vento piega il ciuffo
    const forma = () => {
      c.beginPath(); c.moveTo(42, 108);
      c.bezierCurveTo(41, 90, 44, 77, 54, 71);
      c.bezierCurveTo(70, 62, 86, 67, 100, 65);
      c.bezierCurveTo(118, 60, 138, 63, 147, 75);
      c.bezierCurveTo(150, 85, 151, 97, 150, 108);
      c.bezierCurveTo(163, 92, 163, 66, 158, 50);
      c.bezierCurveTo(174, 26, 152, 4, 120, 5);
      c.bezierCurveTo(90, 5, 58, 17, 44, 41);
      c.bezierCurveTo(31, 62, 32, 90, 42, 108);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(4, 108); c.fill();
    c.globalAlpha = 0.75;
    ciocche(c, forma, 12, (i) => {
      const x0 = 48 + i * 8.6;
      c.beginPath(); c.moveTo(x0, 72); c.bezierCurveTo(x0 - 8, 44, x0 + 8, 14, x0 + 36, 10);
      tratto(c, i % 3 === 0 ? scuro(H, 0.45) : L, i % 3 === 0 ? 1.8 : 2.6);
    });
    c.globalAlpha = 1;
    c.beginPath(); c.moveTo(70, 34); c.bezierCurveTo(90, 16, 124, 12, 146, 22); tratto(c, 'rgba(255,255,255,0.14)', 7);
    forma(); tratto(c, CONT, 3);
    c.restore();
    return;
  }

  if (p.stile === 'grigio') {
    const forma = () => {
      c.beginPath(); c.moveTo(41, 106);
      c.quadraticCurveTo(42, 92, 46, 88);
      c.bezierCurveTo(50, 78, 52, 64, 64, 57);
      c.bezierCurveTo(72, 62, 84, 66, 96, 66);
      c.bezierCurveTo(108, 66, 120, 62, 128, 57);
      c.bezierCurveTo(140, 64, 142, 78, 146, 88);
      c.quadraticCurveTo(150, 92, 151, 106);
      c.bezierCurveTo(160, 82, 154, 42, 96, 38);
      c.bezierCurveTo(38, 42, 32, 82, 41, 106);
      c.closePath();
    };
    forma(); c.fillStyle = gradL(c, 0, 36, 0, 100, [[0, chiaro(H, 0.3)], [0.5, H], [1, scuro(H, 0.25)]]); c.fill();
    const r = casuale(9);
    c.globalAlpha = 0.8;
    ciocche(c, forma, 90, (i) => {
      const x = 36 + r() * 120, y = 38 + r() * 60;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (x - CX) * 0.07, y + 5 + r() * 4);
      tratto(c, i % 3 ? L : scuro(H, 0.4), 1.4);
    });
    c.globalAlpha = 1;
    forma(); tratto(c, CONT, 3);
  }
}

function goccia(c, x, y, r) {
  c.beginPath(); c.moveTo(x, y - r * 1.8);
  c.bezierCurveTo(x + r * 1.3, y, x + r, y + r, x, y + r);
  c.bezierCurveTo(x - r, y + r, x - r * 1.3, y, x, y - r * 1.8);
  c.fillStyle = '#7fd3ff'; c.fill(); tratto(c, '#3d8fc4', 1.3);
}

function lacrime(c, espr) {
  if (espr === 'triste') for (const s of [-1, 1]) {
    const x = CX + s * 26;
    c.beginPath(); c.moveTo(x - 5, 116);
    c.bezierCurveTo(x - 7, 136, x + s * 2 - 6, 150, x + s * 4 - 5, 166);
    c.lineTo(x + s * 4 + 5, 166);
    c.bezierCurveTo(x + s * 2 + 6, 150, x + 7, 136, x + 5, 116); c.closePath();
    c.fillStyle = 'rgba(115,208,255,0.92)'; c.fill(); tratto(c, '#3d8fc4', 1.5);
    c.beginPath(); c.moveTo(x - 1, 121); c.lineTo(x + s * 2 - 1, 158); tratto(c, 'rgba(255,255,255,0.8)', 2);
    goccia(c, x + s * 34, 128, 5); goccia(c, x + s * 42, 148, 3.5);
  }
  if (espr === 'sconvolto' || espr === 'shock') goccia(c, CX + 42, 72, 6);
}

function corona(c, o) {
  const v = o.vento ?? 0;
  c.save();
  c.translate(108 - v * 56, 16); c.rotate(0.1 + v * 0.8);
  c.beginPath();
  c.moveTo(-30, 4); c.lineTo(-35, -27); c.lineTo(-19, -12); c.lineTo(-10, -35); c.lineTo(0, -13);
  c.lineTo(10, -35); c.lineTo(19, -12); c.lineTo(35, -27); c.lineTo(30, 4); c.closePath();
  c.fillStyle = gradL(c, 0, -35, 0, 6, [[0, '#fff3a6'], [0.5, '#f6c62e'], [1, '#c88f18']]); c.fill(); tratto(c, '#6b4a0c', 3);
  rrect(c, -31, -6, 62, 12, 3); c.fillStyle = gradL(c, 0, -6, 0, 6, [[0, '#ffd84a'], [1, '#d49a1c']]); c.fill(); tratto(c, '#6b4a0c', 2.6);
  for (const [x, y] of [[-35, -27], [-10, -35], [10, -35], [35, -27]]) { ellisse(c, x, y, 4.2, 4.2); c.fillStyle = '#fff3a6'; c.fill(); tratto(c, '#6b4a0c', 2); }
  for (const [x, col] of [[-18, '#3aa0ff'], [0, '#e0304a'], [18, '#3ad07a']]) { ellisse(c, x, 0, 4.2, 3.6); c.fillStyle = col; c.fill(); tratto(c, '#6b4a0c', 1.5); ellisse(c, x - 1.2, -1, 1.2, 1); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill(); }
  c.restore();
}

// --- occhiali da sole stile Wayfarer, centrati sugli occhi (y = 113) ---
function montatura(c, o) {
  const lente = (x) => {
    c.beginPath(); c.moveTo(x - 17, 102); c.lineTo(x + 17, 102);
    c.quadraticCurveTo(x + 17.5, 117, x + 12, 124.5); c.quadraticCurveTo(x, 128, x - 12, 124.5);
    c.quadraticCurveTo(x - 17.5, 117, x - 17, 102); c.closePath();
  };
  const ponte = () => { c.beginPath(); c.moveTo(CX - 10, 107); c.quadraticCurveTo(CX, 102.5, CX + 10, 107); };
  ponte(); tratto(c, CONT, 7); ponte(); tratto(c, o.montatura, 4);
  for (const s of [-1, 1]) {
    const x = CX + s * 26;
    lente(x); c.fillStyle = gradL(c, 0, 102, 0, 126, [[0, chiaro(o.lenti, 0.12)], [1, o.lenti]]); c.fill();
    c.save(); lente(x); c.clip();
    poli(c, [[x - 9, 102], [x - 3, 102], [x - 13, 127], [x - 19, 127]]); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill();
    poli(c, [[x + 1, 102], [x + 3.5, 102], [x - 6, 127], [x - 8.5, 127]]); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fill();
    c.restore();
    lente(x); tratto(c, CONT, 6.5); lente(x); tratto(c, o.montatura, 3.6);
    // barra superiore, più spessa
    rrect(c, x - 19, 98.5, 38, 7.5, 3); c.fillStyle = o.montatura; c.fill(); tratto(c, CONT, 2.2);
    if (o.tartaruga) {
      c.save(); rrect(c, x - 19, 98.5, 38, 7.5, 3); c.clip();
      const r = casuale(s + 3);
      for (let i = 0; i < 9; i++) { ellisse(c, x - 18 + r() * 36, 99 + r() * 7, 1.2 + r() * 2, 0.8 + r() * 1.2, r()); c.fillStyle = alfa(o.tartaruga, 0.75); c.fill(); }
      c.restore();
    }
    c.beginPath(); c.moveTo(x - 15, 100.5); c.lineTo(x + 12, 100.5); tratto(c, 'rgba(255,255,255,0.25)', 1.2);
  }
}

// occhiali tondi: da vista (lenti chiare) o da sole ambrati; gli occhi si vedono attraverso
function occhialiTondi(c, p, espr) {
  const o = p.occhiali, y = 113 + (espr === 'shock' ? 3 : 0);
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(CX + s * 41, y - 3); c.lineTo(CX + s * (p.faccia.larg + 1), 108);
    tratto(c, CONT, 5); tratto(c, o.montatura, 2.6);
  }
  const ponte = () => { c.beginPath(); c.moveTo(CX - 11, y - 3); c.quadraticCurveTo(CX, y - 9, CX + 11, y - 3); };
  ponte(); tratto(c, CONT, 5.5); ponte(); tratto(c, o.montatura, 3);
  for (const s of [-1, 1]) {
    const x = CX + s * 26, lente = () => ellisse(c, x, y, 16, 15);
    lente(); c.fillStyle = alfa(o.lenti, o.trasparenza ?? 0.2); c.fill();
    c.save(); lente(); c.clip();
    poli(c, [[x - 8, y - 16], [x - 2, y - 16], [x - 12, y + 16], [x - 18, y + 16]]); c.fillStyle = 'rgba(255,255,255,0.28)'; c.fill();
    c.restore();
    lente(); tratto(c, CONT, 5.5); lente(); tratto(c, o.montatura, 3);
  }
}

// cappelli: basco militare, piegato da un lato, con lo stemma
function cappello(c, p) {
  const k = p.cappello;
  if (k.tipo !== 'basco') return;
  c.save(); c.translate(104, 38); c.rotate(0.14);
  const calotta = () => { c.beginPath(); c.ellipse(4, -2, 60, 21, 0, 0, Math.PI * 2); };
  calotta(); c.fillStyle = gradR(c, -10, -10, 4, 66, [[0, chiaro(k.colore, 0.18)], [1, scuro(k.colore, 0.25)]]); c.fill(); tratto(c, CONT, 3);
  c.beginPath(); c.ellipse(-4, 12, 50, 7, 0, 0, Math.PI * 2); c.fillStyle = scuro(k.colore, 0.5); c.fill(); tratto(c, CONT, 2.5);
  ellisse(c, -32, 6, 7, 8.5); c.fillStyle = k.stemma; c.fill(); tratto(c, scuro(k.stemma, 0.5), 1.6);
  poli(c, [[-32, 1], [-29, 6], [-32, 11], [-35, 6]]); c.fillStyle = scuro(k.stemma, 0.35); c.fill();
  c.restore();
}

function occhiali(c, p, espr) {
  const o = p.occhiali;
  if (o.inMaglietta) return; // appesi allo scollo: li disegna corpo()
  if (o.tondi) return occhialiTondi(c, p, espr);
  // per lo spavento gli occhiali scivolano sul naso e si vedono gli occhi
  const dy = espr === 'shock' ? 17 : espr === 'felice' ? -3 : espr === 'triste' ? 2 : 0;
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(CX + s * 42, 104 + dy); c.lineTo(CX + s * (p.faccia.larg + 1), 110);
    tratto(c, CONT, 6); tratto(c, o.montatura, 3);
  }
  c.save();
  c.translate(CX, 113 + dy); c.rotate(espr === 'shock' ? 0.12 : 0); c.translate(-CX, -113);
  montatura(c, o);
  c.restore();
}

// o.strato: 'tutto' | 'base' (senza naso e bocca) | 'top' (solo naso e bocca)
// o.senzaBarba, o.vento (piega i capelli), o.corona
export function disegnaTesta(c, p, espr = 'normale', o = {}) {
  const strato = o.strato ?? 'tutto';
  const conBarba = !o.senzaBarba;
  if (strato !== 'top') {
    capelli(c, p, 'dietro', o);
    orecchie(c, p);
    pelleTesta(c, p);
    if (p.anziano) rughe(c, p);
    if (conBarba && p.barba !== 'piena') barba(c, p);
    for (const s of [-1, 1]) { occhio(c, p, s, espr); if (!p.sopraDavanti) sopracciglio(c, p, s, espr); }
    if (conBarba && p.barba === 'piena') barba(c, p);
  }
  if (strato !== 'base') { naso(c, p, espr); bocca(c, p, espr); }
  if (strato !== 'top') {
    capelli(c, p, 'davanti', o);
    if (p.cappello) cappello(c, p);
    // sopracciglia sopra la frangia, se no le espressioni non si vedono
    if (p.sopraDavanti) for (const s of [-1, 1]) sopracciglio(c, p, s, espr);
    lacrime(c, espr);
    if (p.occhiali) occhiali(c, p, espr);
  }
  if (o.corona) corona(c, o);
}

// ------------------------------------------------------------
//  CORPO
// ------------------------------------------------------------
const POSE = {
  normale: [[33, 196], [43, 219], [40, 241]],
  felice: [[33, 195], [58, 185], [75, 150]],
  triste: [[33, 199], [39, 221], [37, 244]],
  shock: [[33, 196], [55, 207], [72, 190]],
};

function braccio(c, p, punti) {
  const v = p.vestito, lunga = ['giacca', 'piumino', 'mimetica'].includes(v.tipo) || v.maniche === 'lunghe';
  const manica = v.manica ?? v.colore;
  const linea = (a, b, m) => { c.beginPath(); c.moveTo(...a); c.lineTo(...b); if (m) c.lineTo(...m); };
  linea(...punti); tratto(c, CONT, 19);
  linea(...punti); tratto(c, lunga ? manica : p.pelle, 13);
  if (!lunga) {
    const m = [lerp(punti[0][0], punti[1][0], 0.62), lerp(punti[0][1], punti[1][1], 0.62)];
    linea(punti[0], m); tratto(c, CONT, 21);
    linea(punti[0], m); tratto(c, manica, 15);
  }
  const [mx, my] = punti[2];
  ellisse(c, mx, my, 9, 9); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3);
}

// macchie mimetiche dentro un riquadro (si usano dentro un tracciato già ritagliato)
function mimetica(c, x0, y0, w, h, base, seme) {
  const r = casuale(seme), colori = [scuro(base, 0.38), mix(base, '#8a6a3a', 0.55), chiaro(base, 0.22)];
  for (let i = 0; i < Math.round((w * h) / 300); i++) {
    const x = x0 + r() * w, y = y0 + r() * h, rr = 4 + r() * 6;
    c.beginPath();
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2, d = rr * (0.6 + r() * 0.6);
      k ? c.lineTo(x + Math.cos(a) * d * 1.4, y + Math.sin(a) * d) : c.moveTo(x + Math.cos(a) * d * 1.4, y + Math.sin(a) * d);
    }
    c.closePath(); c.fillStyle = colori[i % 3]; c.fill();
  }
}

function corpo(c, p, espr) {
  const v = p.vestito, S = p.pelle;
  // corporatura robusta: gambe, collo e busto si allargano attorno al centro,
  // le braccia partono da spalle più larghe
  const k = p.corporatura ?? 1, sp = (k - 1) * 33;
  c.save(); c.translate(CX, 0); c.scale(k, 1); c.translate(-CX, 0);
  // gambe e scarpe
  for (const s of [-1, 1]) {
    const x = s < 0 ? CX - 24 : CX + 5;
    if (p.corti) {
      // pantaloncini: sotto la gamba nuda (e i calzettoni, se ci sono)
      rrect(c, x + 2, 250, 15, 26, 5); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3);
      if (p.calzettoni) { rrect(c, x + 2, 262, 15, 12, 3); c.fillStyle = p.calzettoni; c.fill(); tratto(c, CONT, 2.4); }
      rrect(c, x - 1, 240, 21, 17, [6, 6, 3, 3]); c.fillStyle = gradL(c, 0, 240, 0, 257, [[0, p.pantaloni], [1, scuro(p.pantaloni, 0.25)]]); c.fill(); tratto(c, CONT, 3);
    } else {
      rrect(c, x, 240, 19, 36, 6); c.fillStyle = gradL(c, 0, 240, 0, 276, [[0, p.pantaloni], [1, scuro(p.pantaloni, 0.25)]]); c.fill();
      if (p.mimeticaPantaloni) { c.save(); rrect(c, x, 240, 19, 36, 6); c.clip(); mimetica(c, x - 4, 236, 27, 44, p.pantaloni, s < 0 ? 5 : 6); c.restore(); }
      rrect(c, x, 240, 19, 36, 6); tratto(c, CONT, 3);
    }
    rrect(c, x - (s < 0 ? 7 : 1), 270, 27, 14, [8, 8, 4, 4]); c.fillStyle = p.scarpe; c.fill(); tratto(c, CONT, 3);
    c.fillStyle = scuro(p.scarpe, 0.35); c.fillRect(x - (s < 0 ? 5.5 : -0.5), 279.5, 24, 3);
  }
  // collo
  rrect(c, CX - 12, 164, 24, 28, 6); c.fillStyle = scuro(S, 0.16); c.fill(); tratto(c, CONT, 3);
  // busto
  const busto = () => {
    c.beginPath(); c.moveTo(CX - 36, 199); c.quadraticCurveTo(CX - 36, 184, CX - 18, 182); c.lineTo(CX + 18, 182);
    c.quadraticCurveTo(CX + 36, 184, CX + 36, 199); c.lineTo(CX + 31, 249); c.quadraticCurveTo(CX, 255, CX - 31, 249); c.closePath();
  };
  busto(); c.fillStyle = gradL(c, 0, 182, 0, 254, [[0, chiaro(v.colore, 0.1)], [1, scuro(v.colore, 0.2)]]); c.fill();
  c.save(); busto(); c.clip();
  if (v.tipo === 'giacca' && v.sotto) {
    // giacca aperta su una maglietta girocollo
    poli(c, [[CX - 18, 180], [CX + 18, 180], [CX + 15, 258], [CX - 15, 258]]);
    c.fillStyle = gradL(c, 0, 180, 0, 258, [[0, v.sotto], [1, scuro(v.sotto, 0.1)]]); c.fill();
    ellisse(c, CX, 181, 12, 7.5); c.fillStyle = scuro(S, 0.1); c.fill();
    c.beginPath(); c.ellipse(CX, 181, 12, 7.5, 0, 0, Math.PI); tratto(c, scuro(v.sotto, 0.2), 2.6);
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 17, 180], [CX + s * 28, 182], [CX + s * 16, 238]]); c.fillStyle = scuro(v.colore, 0.25); c.fill(); tratto(c, CONT, 2.2);
      c.beginPath(); c.moveTo(CX + s * 17, 182); c.lineTo(CX + s * 17, 256); tratto(c, 'rgba(0,0,0,0.3)', 1.4);
    }
    rrect(c, CX - 33, 230, 13, 3.5, 1); c.fillStyle = scuro(v.colore, 0.3); c.fill();  // tasca
  } else if (v.tipo === 'piumino') {
    // piumino trapuntato, aperto sul collo: camicia a righe
    for (let y = 194; y < 258; y += 12) {
      c.beginPath(); c.moveTo(CX - 40, y - 5); c.quadraticCurveTo(CX, y - 1.5, CX + 40, y - 5); tratto(c, 'rgba(255,255,255,0.09)', 4);
      c.beginPath(); c.moveTo(CX - 40, y); c.quadraticCurveTo(CX, y + 4, CX + 40, y); tratto(c, 'rgba(0,0,0,0.6)', 1.6);
    }
    c.beginPath(); c.moveTo(CX + 2, 200); c.lineTo(CX + 2, 256); tratto(c, '#6a6c78', 1.2);
    const scollo = () => poli(c, [[CX - 14, 180], [CX + 14, 180], [CX + 2, 206]]);
    scollo(); c.fillStyle = '#f4f7ff'; c.fill();
    c.save(); scollo(); c.clip();
    c.fillStyle = v.camicia;
    for (let x = CX - 15; x < CX + 15; x += 3.2) c.fillRect(x, 178, 1.3, 30);
    poli(c, [[CX - 6, 180], [CX + 6, 180], [CX, 192]]); c.fillStyle = scuro(S, 0.1); c.fill();
    c.restore();
  } else if (v.tipo === 'mimetica') {
    // giacca mimetica: macchie, abbottonatura, taschini con la patta, cinturone
    mimetica(c, CX - 42, 176, 84, 84, v.colore, 13);
    poli(c, [[CX - 14, 180], [CX + 14, 180], [CX, 196]]); c.fillStyle = scuro(S, 0.1); c.fill();
    c.beginPath(); c.moveTo(CX, 196); c.lineTo(CX, 240); tratto(c, 'rgba(0,0,0,0.4)', 1.4);
    for (const s of [-1, 1]) {
      rrect(c, CX + s * 18 - 8, 200, 16, 14, 2); tratto(c, 'rgba(0,0,0,0.45)', 1.2);
      rrect(c, CX + s * 18 - 8.5, 198, 17, 5, 1.5); c.fillStyle = scuro(v.colore, 0.25); c.fill(); tratto(c, 'rgba(0,0,0,0.5)', 1);
    }
    c.fillStyle = '#3a2a1a'; c.fillRect(CX - 42, 238, 84, 7);
    rrect(c, CX - 5, 237, 10, 9, 1.5); c.fillStyle = '#d8b048'; c.fill(); tratto(c, '#6a4a10', 1);
  } else if (v.tipo === 'croupier') {
    // maglia blu del calcio a 5 (si vede nello scollo) sotto il gilet nero da croupier
    const scollo = () => poli(c, [[CX - 17, 180], [CX + 17, 180], [CX + 4, 224], [CX - 4, 224]]);
    scollo(); c.fillStyle = v.manica; c.fill();
    c.save(); scollo(); c.clip(); poli(c, [[CX - 18, 200], [CX + 18, 186], [CX + 18, 193], [CX - 18, 207]]); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill(); c.restore();
    ellisse(c, CX, 181, 12, 7.5); c.fillStyle = scuro(S, 0.1); c.fill();
    c.beginPath(); c.ellipse(CX, 181, 12, 7.5, 0, 0, Math.PI); tratto(c, '#ffffff', 2.8);
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 16, 180], [CX + s * 42, 186], [CX + s * 40, 258], [CX + s * 1.5, 258], [CX + s * 4, 224]]);
      c.fillStyle = gradL(c, 0, 180, 0, 258, [[0, chiaro(v.colore, 0.12)], [1, scuro(v.colore, 0.2)]]); c.fill(); tratto(c, CONT, 1.8);
    }
    for (const y of [230, 240, 250]) { ellisse(c, CX - 3, y, 1.6, 1.6); c.fillStyle = '#c8c8d0'; c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(CX - 32, 216, 12, 1.6); c.fillRect(CX + 20, 236, 12, 1.6);
  } else if (v.tipo === 'scout') {
    // camicia scout: abbottonatura, taschini con la patta, colletto
    c.beginPath(); c.moveTo(CX, 194); c.lineTo(CX, 254); tratto(c, 'rgba(0,0,0,0.3)', 1.2);
    for (const s of [-1, 1]) {
      rrect(c, CX + s * 18 - 8, 206, 16, 15, 2); tratto(c, 'rgba(0,0,0,0.35)', 1.2);
      rrect(c, CX + s * 18 - 8.5, 204, 17, 5, 1.5); c.fillStyle = scuro(v.colore, 0.15); c.fill(); tratto(c, 'rgba(0,0,0,0.4)', 1);
    }
    poli(c, [[CX - 13, 180], [CX + 13, 180], [CX, 198]]); c.fillStyle = scuro(S, 0.1); c.fill();
    c.fillStyle = '#6a4426'; c.fillRect(CX - 40, 242, 80, 6);
  } else if (v.tipo === 'giacca') {
    // camicia a quadretti bianchi e blu sotto la giacca
    poli(c, [[CX - 15, 180], [CX + 15, 180], [CX + 9, 258], [CX - 9, 258]]);
    c.fillStyle = '#f5f8ff'; c.fill();
    c.save(); c.clip();
    c.fillStyle = 'rgba(48,88,190,0.45)';
    for (let x = CX - 16; x < CX + 16; x += 5) c.fillRect(x, 178, 2.5, 82);
    for (let y = 178; y < 260; y += 5) c.fillRect(CX - 16, y, 32, 2.5);
    c.restore();
    c.beginPath(); c.moveTo(CX, 192); c.lineTo(CX, 256); tratto(c, 'rgba(30,50,110,0.5)', 1.2);
    for (const y of [206, 222, 238]) { ellisse(c, CX, y, 1.7, 1.7); c.fillStyle = '#ffffff'; c.fill(); tratto(c, 'rgba(30,50,110,0.7)', 0.8); }
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 15, 180], [CX + s * 3, 181], [CX + s * 7, 196]]); c.fillStyle = '#e9efff'; c.fill(); tratto(c, CONT, 2);
      poli(c, [[CX + s * 15, 180], [CX + s * 26, 182], [CX + s * 9, 230]]); c.fillStyle = scuro(v.colore, 0.25); c.fill(); tratto(c, CONT, 2.2);
    }
  } else {
    if (v.collo === 'v') { poli(c, [[CX - 13, 180], [CX + 13, 180], [CX, 203]]); c.fillStyle = scuro(S, 0.1); c.fill(); tratto(c, scuro(v.colore, 0.4), 3); }
    else {
      ellisse(c, CX, 181, 13, 8); c.fillStyle = scuro(S, 0.1); c.fill();
      c.beginPath(); c.ellipse(CX, 181, 13, 8, 0, 0, Math.PI); tratto(c, risalto(v.colore), 3);
    }
    if (v.logo) { ellisse(c, CX + 17, 206, 5.5, 5.5); c.fillStyle = v.logo; c.fill(); ellisse(c, CX + 17, 206, 2.5, 2.5); c.fillStyle = '#f1e9d4'; c.fill(); }
    c.beginPath(); c.moveTo(CX - 22, 244); c.quadraticCurveTo(CX - 10, 238, CX - 2, 246); tratto(c, 'rgba(0,0,0,0.12)', 2);
  }
  c.restore();
  busto(); tratto(c, CONT, 3);
  if (p.occhiali?.inMaglietta) {
    // occhiali da sole appesi allo scollo della maglietta
    c.save(); c.translate(CX + 3, 198); c.rotate(0.1); c.scale(0.5, 0.5); c.translate(-CX, -113);
    montatura(c, p.occhiali);
    c.restore();
  }
  if (v.tipo === 'mimetica') {
    // colletto, spalline e medaglie
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 4, 182], [CX + s * 15, 179], [CX + s * 13, 194]]); c.fillStyle = scuro(v.colore, 0.15); c.fill(); tratto(c, CONT, 1.6);
      rrect(c, CX + s * 28 - 7, 184, 14, 6, 2); c.fillStyle = scuro(v.colore, 0.35); c.fill(); tratto(c, CONT, 1.2);
      ellisse(c, CX + s * 24, 187, 1.6, 1.6); c.fillStyle = '#e8c048'; c.fill();
    }
    [['#d83a3a', '#f2f2f2'], ['#2f6fd8', '#f2c43a'], ['#2e9b57', '#f2f2f2']].forEach(([a, b], i) => {
      const x = CX - 30 + i * 6.5;
      c.fillStyle = a; c.fillRect(x, 213, 6, 6); c.fillStyle = b; c.fillRect(x + 2, 213, 2, 6);
      c.strokeStyle = CONT; c.lineWidth = 0.8; c.strokeRect(x, 213, 6, 6);
    });
    for (const x of [CX - 27, CX - 17]) { ellisse(c, x, 225, 4, 4); c.fillStyle = '#e8c048'; c.fill(); tratto(c, '#8a6a10', 1.2); ellisse(c, x - 1, 224, 1.2, 1); c.fillStyle = '#fff6c0'; c.fill(); }
  }
  if (v.tipo === 'croupier') {
    // papillon e targhetta dorata col numero 11
    const fiocco = (s) => poli(c, [[CX, 187], [CX + s * 10, 181], [CX + s * 10, 193]]);
    for (const s of [-1, 1]) { fiocco(s); c.fillStyle = v.papillon; c.fill(); tratto(c, CONT, 1.6); }
    ellisse(c, CX, 187, 3, 3.4); c.fillStyle = scuro(v.papillon, 0.25); c.fill(); tratto(c, CONT, 1.2);
    rrect(c, CX + 12, 204, 20, 10, 2); c.fillStyle = gradL(c, 0, 204, 0, 214, [[0, '#fbe08a'], [1, '#c8961e']]); c.fill(); tratto(c, '#6a4a10', 1);
    c.fillStyle = '#2a1a0a';
    for (const x of [CX + 18, CX + 24]) { c.fillRect(x, 206.5, 1.8, 5.5); poli(c, [[x, 206.5], [x - 1.6, 208], [x, 208.2]]); c.fill(); }
  }
  if (v.tipo === 'scout') {
    // colletto e fazzolettone a righe col fermaglio di cuoio
    for (const s of [-1, 1]) { poli(c, [[CX + s * 12, 179], [CX + s * 24, 184], [CX + s * 12, 194]]); c.fillStyle = chiaro(v.colore, 0.2); c.fill(); tratto(c, CONT, 1.6); }
    const [a, b, d] = v.fazzoletto;
    const giro = () => { c.beginPath(); c.moveTo(CX - 18, 181); c.quadraticCurveTo(CX, 194, CX + 18, 181); };
    const coda = (s) => { c.beginPath(); c.moveTo(CX + s * 9, 187); c.lineTo(CX + s * 1.5, 205); c.lineTo(CX + s * 7, 238); };
    for (const disegna of [giro, () => coda(-1), () => coda(1)]) {
      disegna(); tratto(c, CONT, 10); disegna(); tratto(c, a, 7.5); disegna(); tratto(c, b, 4.5); disegna(); tratto(c, d, 1.8);
    }
    ellisse(c, CX, 205, 5, 6); c.fillStyle = '#9a6a3a'; c.fill(); tratto(c, CONT, 1.6);
    c.beginPath(); c.moveTo(CX - 4, 203); c.lineTo(CX + 4, 203); c.moveTo(CX - 4, 207); c.lineTo(CX + 4, 207); tratto(c, '#5a3a1a', 0.8);
  }
  if (v.tipo === 'piumino') {
    // catenina, colletto della camicia e collo alto del piumino
    if (v.catenina) {
      const cat = () => { c.beginPath(); c.moveTo(CX - 10.5, 175); c.quadraticCurveTo(CX, 195, CX + 10.5, 175); };
      cat(); tratto(c, scuro(v.catenina, 0.45), 2.4); cat(); tratto(c, v.catenina, 1.2);
    }
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 4, 181], [CX + s * 13, 179], [CX + s * 10, 194]]); c.fillStyle = '#f4f7ff'; c.fill(); tratto(c, CONT, 1.6);
      c.beginPath(); c.moveTo(CX + s * 3, 206); c.lineTo(CX + s * 14, 176); c.quadraticCurveTo(CX + s * 23, 175, CX + s * 26, 184); c.lineTo(CX + s * 13, 212); c.closePath();
      c.fillStyle = chiaro(v.colore, 0.07); c.fill(); tratto(c, CONT, 2.2);
    }
  }
  c.restore();

  // braccia (sp = spalle più larghe per i robusti; le mani restano dentro il disegno)
  const largo = (pt, i, s) => [pt[0] + s * (i < 2 ? sp : 0), pt[1]];
  if (espr === 'sufficienza') {
    braccio(c, p, [[CX - 33, 196], [CX - 38, 223], [CX + 14, 219]].map((pt, i) => largo(pt, i, -1)));
    braccio(c, p, [[CX + 33, 196], [CX + 38, 225], [CX - 12, 227]].map((pt, i) => largo(pt, i, 1)));
  } else {
    const posa = POSE[espr] ?? POSE.normale;
    for (const s of [-1, 1]) braccio(c, p, posa.map(([x, y], i) => [CX + s * (x + (i < 2 ? sp : Math.min(sp, Math.max(0, 80 - x)))), y]));
  }
}

export function disegnaPersonaggio(c, p, espr) {
  corpo(c, p, espr);
  disegnaTesta(c, p, espr);
}

// mantellina del barbiere (per il primo piano di Marco)
export function disegnaMantellina(c, p) {
  rrect(c, CX - 13, 162, 26, 34, 6); c.fillStyle = scuro(p.pelle, 0.16); c.fill(); tratto(c, CONT, 3);
  const forma = () => {
    c.beginPath(); c.moveTo(CX - 20, 184); c.quadraticCurveTo(CX, 195, CX + 20, 184);
    c.bezierCurveTo(CX + 62, 190, CX + 94, 214, CX + 102, 244); c.lineTo(CX - 102, 244);
    c.bezierCurveTo(CX - 94, 214, CX - 62, 190, CX - 20, 184); c.closePath();
  };
  forma(); c.fillStyle = gradL(c, 0, 184, 0, 244, [[0, '#ffffff'], [1, '#dde5f2']]); c.fill();
  c.save(); forma(); c.clip();
  for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(CX + i * 5, 186); c.lineTo(CX + i * 18, 246); tratto(c, 'rgba(110,165,230,0.55)', 3); }
  c.restore();
  forma(); tratto(c, CONT, 3);
  c.beginPath(); c.moveTo(CX - 21, 183); c.quadraticCurveTo(CX, 196, CX + 21, 183); tratto(c, CONT, 9.5);
  c.beginPath(); c.moveTo(CX - 21, 183); c.quadraticCurveTo(CX, 196, CX + 21, 183); tratto(c, '#f7f7fb', 5.5);
}
