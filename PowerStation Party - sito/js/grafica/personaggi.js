// Personaggi in stile cartoon vettoriale (testa grande, corpo piccolo).
// Tutto è disegnato in uno spazio di 192x288 unità, testa centrata su x = 96.
// I tratti di ognuno sono parametri: forma del viso, capelli, barba, occhi, vestiti.
import { CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, mix, risalto, alfa, casuale } from './base.js';
import scontrino from '../config/microgiochi/scontrino.js';

const CX = 96;
// il nome della pizzeria di Michele (in configurazione: nomeLocale), ricamato sulla sua polo
// in due righe: "DA" e "MICHELE"
const LOCALE = scontrino.nomeLocale.toUpperCase().split(' ');
const RICAMO = LOCALE.length > 1 ? [LOCALE[0], LOCALE.slice(1).join(' ')] : LOCALE;
const lerp = (a, b, t) => a + (b - a) * t;

export const PERSONAGGI = {
  // una bella testa di ricci neri (non un afro gigante), sopracciglia folte,
  // viso pulito senza barba, maglietta nera
  riccardo: {
    pelle: '#e9b58d', capelli: '#1a1920', capelliLuce: '#4c4a66', occhi: '#7a4a22',
    sopra: '#131217', sopraSpess: 9,
    faccia: { top: 46, larg: 56, mascella: 43, mascellaY: 148, mento: 17, mentoY: 178 },
    stile: 'ricciMedi', barba: 'nessuna', naso: [8, 11], orecchie: 10.5, sorriso: 4,
    vestito: { tipo: 'tshirt', colore: '#24242e', collo: 'giro' }, pantaloni: '#2f3757', scarpe: '#f3f3f3',
  },
  // capelli castani con riflessi chiari, lunghi e pettinati all'indietro (ai lati arrivano
  // al lobo), viso pulito senza barba, mento un po' più affilato, sguardo serio
  giorgio: {
    pelle: '#f0c5a1', capelli: '#5e3d24', capelliLuce: '#a8794a', occhi: '#3d2817',
    sopra: '#3a2413', sopraSpess: 7, serio: true, palpebra: [0.22, 0.22],
    faccia: { top: 46, larg: 56, mascella: 50, mascellaY: 154, mento: 26, mentoY: 181 },
    stile: 'indietroLungo', barba: 'nessuna', naso: [9, 12], orecchie: 9, sorriso: 0,
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
  // lo Zere (La Spina del PowerStation): giovane, capelli scuri corti sfumati ai lati, barba scura
  // corta e piena che segue la mascella, pelle chiara, palpebre un po' basse; giacca blu scuro su
  // una maglietta bianca. Ha sempre in mano la sua vuvuzela BLU (accessorio): all'ultimo atto la
  // suona (la posa 'vuvuzela', creata dalla scena). Non è giocabile.
  zere: {
    pelle: '#f2cbb0', capelli: '#1f1813', capelliLuce: '#55463c', occhi: '#4a2e1a',
    sopra: '#1a120d', sopraSpess: 8.5, palpebra: [0.24, 0.24],
    faccia: { top: 46, larg: 57, mascella: 51, mascellaY: 152, mento: 30, mentoY: 180 },
    stile: 'sfumato', barba: 'curata', naso: [10, 13], orecchie: 10, sorriso: 3,
    vestito: { tipo: 'giacca', colore: '#1e2a4a', sotto: '#f6f6f2' }, pantaloni: '#2b3142', scarpe: '#f2f2f2',
    accessorio: 'vuvuzela',
  },
  // Marsupino: testa rasata, barba folta e scura, occhiali da sole neri,
  // giacca blu aperta su maglietta bianca, corporatura robusta, scarpe bianche
  marsupino: {
    pelle: '#e6b48c', capelli: '#1d1511', capelliLuce: '#54423a', occhi: '#3a2414',
    sopra: '#1d1511', sopraSpess: 8.5,
    faccia: { top: 42, larg: 63, mascella: 60, mascellaY: 151, mento: 42, mentoY: 180 },
    stile: 'rasato', barba: 'folta', naso: [10.5, 11], orecchie: 10, sorriso: 6,
    occhiali: { montatura: '#121216', lenti: '#1c2029' },
    corporatura: 1.36, pancia: 10,   // bello grasso: busto largo e pancione che esce dalla maglietta
    vestito: { tipo: 'giacca', colore: '#2a3b66', sotto: '#f7f6f1' }, pantaloni: '#26345a', scarpe: '#f4f4f4',
  },
  // Guerra: capelli scuri tirati su e stempiati, sopracciglia dritte e folte, viso lungo,
  // barba corta; vestito da nonno: cardigan di lana coi bottoni grossi sopra la camicia a
  // quadretti chiusa fino al collo, pantaloni di fustagno, scarpe marroni (niente cappello)
  guerra: {
    pelle: '#edbf9c', capelli: '#2b1d15', capelliLuce: '#664a38', occhi: '#5c3b1c',
    sopra: '#24170f', sopraSpess: 9, sopraDritte: true, palpebra: [0.2, 0.2],
    faccia: { top: 46, larg: 52, mascella: 45, mascellaY: 157, mento: 23, mentoY: 185 },
    stile: 'stempiato', barba: 'ispida', naso: [8, 14], orecchie: 9.5, sorriso: -1, labbra: true,
    vestito: { tipo: 'cardigan', colore: '#9a7648', camicia: '#f3eee0', quadretti: 'rgba(96,120,82,0.55)', bottoni: '#4a2f1a' }, pantaloni: '#6e6455', scarpe: '#5b3c26',
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
  // il Bota: testa rasata con l'attaccatura alta, sopracciglia scure e dritte, baffetti e barba
  // appena accennati, viso lungo, pelle chiara (si scotta subito), fisico da palestrato.
  // In costume da bagno: pantaloncini a fiori, occhiali da sole sulla fronte, infradito
  bota: {
    muscoli: true,
    pelle: '#f7d5bd', capelli: '#3a2a22', capelliLuce: '#7a6456', occhi: '#4a3222',
    sopra: '#2c1e16', sopraSpess: 8, sopraDritte: true, palpebra: [0.22, 0.22],
    faccia: { top: 44, larg: 52, mascella: 45, mascellaY: 156, mento: 23, mentoY: 184 },
    stile: 'rasato', rasatoScuro: true, barba: 'accenno', naso: [9, 14], orecchie: 9, sorriso: 2, labbra: true,
    occhiali: { inFronte: true, montatura: '#1a1a20', lenti: '#27324a' },
    vestito: { tipo: 'costume' }, pantaloni: '#18b3c6', fantasia: ['#ffd84a', '#ff7aa8'], corti: true, scarpe: '#ffcf3a', infradito: true,
  },
  // il Boni ("Il Nutrizionista"): capelli scuri corti, sfumati quasi a zero ai lati e un po' più
  // lunghi sopra, con la frangia corta a ciuffetti; sopracciglia folte e dritte, sorrisone coi
  // denti, viso pulito; camicia bianca col colletto
  boni: {
    pelle: '#e8b48c', capelli: '#261a13', capelliLuce: '#5a4234', occhi: '#3a2414',
    sopra: '#1f140d', sopraSpess: 9.5, sopraDritte: true, palpebra: [0.14, 0.14],
    faccia: { top: 46, larg: 55, mascella: 48, mascellaY: 152, mento: 26, mentoY: 181 },
    stile: 'sfumato', barba: 'nessuna', naso: [9, 12], orecchie: 10, sorriso: 6, sorrisone: true, labbra: true,
    vestito: { tipo: 'camicia', colore: '#f4f5f8' }, pantaloni: '#2f3a52', scarpe: '#3a2418',
  },
  // Lori ("Il Cantastorie"): ricci castani corti, con le punte più chiare; sorriso largo coi denti,
  // viso pulito; maglietta bianca col collo alla serafino (i bottoncini), niente costumi
  lori: {
    pelle: '#ecbd96', capelli: '#5a3a24', capelliLuce: '#a9784f', occhi: '#4a2c18',
    sopra: '#3a2414', sopraSpess: 8,
    faccia: { top: 46, larg: 53, mascella: 45, mascellaY: 153, mento: 22, mentoY: 182 },
    stile: 'ricciCorti', barba: 'nessuna', naso: [9, 13], orecchie: 9.5, sorriso: 6, sorrisone: true, labbra: true,
    vestito: { tipo: 'tshirt', colore: '#f6f4ee', collo: 'giro', bottoni: true }, pantaloni: '#3b4d6e', scarpe: '#f2f2f2',
  },
  // il Petri ("il Piovra"): capelli scuri corti tirati su col gel, viso tondo col sorrisone, senza
  // barba; bassino (statura < 1) e appena robusto, non grasso; felpa nera col cappuccio e jeans
  petri: {
    pelle: '#ecbb98', capelli: '#2e1f16', capelliLuce: '#6a4c38', occhi: '#3a2414',
    sopra: '#2a1a10', sopraSpess: 8.5, palpebra: [0.1, 0.1],
    faccia: { top: 48, larg: 58, mascella: 52, mascellaY: 151, mento: 32, mentoY: 179 },
    stile: 'spuntato', barba: 'nessuna', naso: [9.5, 11], orecchie: 10, sorriso: 6, sorrisone: true, labbra: true,
    corporatura: 1.08, pancia: 2, statura: 0.88,
    vestito: { tipo: 'felpa', colore: '#25252e' }, pantaloni: '#3d5278', scarpe: '#ececf0',
  },
  // il Manna: capelli scuri corti e mossi, spettinati, con le ciocche che cadono sulla fronte e
  // si arricciano sopra le orecchie; mascella decisa, sopracciglia folte (una sempre alzata),
  // labbra carnose, sorrisetto, anellino al naso e orecchini. Da discoteca: canottiera bianca
  // aderente, collanina d'oro, braccia tatuate, cinturone con la fibbia dorata, pantaloni larghi
  manna: {
    pelle: '#e9ba94', capelli: '#3c2a1f', capelliLuce: '#8a6a50', occhi: '#4a3020',
    sopra: '#261810', sopraSpess: 9.5, sopraAlzato: true, palpebra: [0.26, 0.26],
    faccia: { top: 46, larg: 52, mascella: 47, mascellaY: 155, mento: 27, mentoY: 184 },
    stile: 'mossi', barba: 'nessuna', naso: [9, 14], orecchie: 9.5, sorriso: 3, labbra: true, ghigno: true,
    anellinoNaso: '#dfe3ea', orecchini: '#dfe3ea',
    vestito: { tipo: 'canottiera', colore: '#fbfbf6', catenina: '#f6c63a', cintura: '#241c22', fibbia: '#f6c63a' },
    tatuaggi: '#2b2d3c', pantaloni: '#39425a', larghi: true, scarpe: '#f4f4f4',
  },
  // Emilio: bassissimo (statura 0.72: tutto più piccolo, coi piedi a terra), viso tondo e bonario,
  // baffi scuri e pizzetto brizzolato, sorriso largo. Da biker: bandana rossa a pallini, occhiali
  // da sole scuri, giubbotto di pelle con le borchie su una maglietta rossa, catena al
  // portafoglio, stivali
  emilio: {
    pelle: '#e6b08a', capelli: '#3a2c26', capelliLuce: '#7a6e68', occhi: '#3a2414',
    sopra: '#2a1c16', sopraSpess: 8, palpebra: [0.2, 0.2],
    faccia: { top: 46, larg: 59, mascella: 55, mascellaY: 152, mento: 35, mentoY: 181 },
    stile: 'rasato', barba: 'pizzettoBaffi', barbaColore: '#8d8884', baffi: '#30241e', naso: [11, 12], orecchie: 10, sorriso: 6,
    cappello: { tipo: 'bandana', colore: '#b3261e', fantasia: '#fff3e6' },
    occhiali: { montatura: '#111114', lenti: '#15171d' },
    corporatura: 1.12, pancia: 3, statura: 0.72,
    vestito: { tipo: 'chiodo', colore: '#1c1c21', sotto: '#8f1f22', borchie: '#d2d6dd' },
    pantaloni: '#2b3040', catenaPortafoglio: '#d2d6dd', scarpe: '#1a1512', stivali: true,
  },
  // Pastaffi (Denny, il figlio di Emilio): capelli biondo scuro corti (e la barba, che prende il
  // colore dei capelli), barba corta e fitta, sopracciglia folte, l'anellino sotto il naso (septum) e
  // gli occhiali da sole tirati su; giacca color tabacco su una maglietta bianca, jeans chiari
  pastaffi: {
    pelle: '#f0c2a2', capelli: '#9a7442', capelliLuce: '#d2ad70', occhi: '#4a5a6a',
    sopra: '#3a2416', sopraSpess: 9, palpebra: [0.3, 0.3],
    faccia: { top: 46, larg: 58, mascella: 54, mascellaY: 153, mento: 33, mentoY: 182 },
    stile: 'corto', barba: 'corta', naso: [10, 12], orecchie: 9.5, sorriso: 2, septum: '#dfe3ea',
    occhiali: { inFronte: true, montatura: '#1a1a20', lenti: '#27324a' },
    vestito: { tipo: 'giacca', colore: '#a8703c', sotto: '#f6f6f2' }, pantaloni: '#9db8d6', scarpe: '#f2f2f2',
  },
  // I due cantanti di "Provini a X-Factor".
  // Tini ("Social Tedio"): dreadlock biondi che cadono sulla fronte e sulle tempie da sotto un
  // berretto blu calcato storto, palpebre a mezz'asta, labbra carnose, orecchini. Da rocker
  // stravagante: maglietta gialla col fulmine, catena al collo, pantaloni scozzesi rossi, anfibi
  tini: {
    pelle: '#f3cbb0', capelli: '#b8863f', capelliLuce: '#ecd08e', occhi: '#4a2c18',
    sopra: '#5a3a20', sopraSpess: 7, palpebra: [0.36, 0.36],
    faccia: { top: 46, larg: 53, mascella: 45, mascellaY: 155, mento: 24, mentoY: 184 },
    stile: 'rasta', barba: 'nessuna', naso: [9, 13], orecchie: 9.5, sorriso: 2, labbra: true,
    cappello: { tipo: 'berretto', colore: '#1c2542', stemma: '#f2c43a' }, orecchini: '#dfe3ea',
    vestito: { tipo: 'tshirt', colore: '#f7d92e', collo: 'giro', stampa: 'fulmine', stampaColore: '#2f6b3f' }, collana: '#cfd4dc',
    pantaloni: '#b3261e', tartan: '#1c1c22', scarpe: '#1a1512', stivali: true,
  },
  // Oli ("Vanz"): ricci scuri e folti che scendono sulla fronte e coprono le orecchie, occhi
  // chiari, sopracciglia scure, barba appena accennata, orecchini a cerchio. Casual punk: maglia
  // blu da calcio (bande bianche sulle spalle, niente stemmi), jeans neri strappati con la catena, anfibi
  oli: {
    pelle: '#eabb98', capelli: '#2a1b14', capelliLuce: '#6f4e3a', occhi: '#7fa9c8',
    sopra: '#21140e', sopraSpess: 9, palpebra: [0.18, 0.18], serio: true,
    faccia: { top: 46, larg: 51, mascella: 45, mascellaY: 157, mento: 25, mentoY: 187 },
    stile: 'ricciLunghetti', barba: 'accenno', naso: [9.5, 15], orecchie: 9.5, sorriso: 1, labbra: true,
    orecchini: '#dfe3ea',
    vestito: { tipo: 'tshirt', colore: '#2452c4', collo: 'v', spalle: '#ffffff' },
    pantaloni: '#2b2d38', strappi: true, catenaPortafoglio: '#d2d6dd', scarpe: '#17171b', stivali: true,
  },
  // I due di "Scontrino, prego!".
  // Michele, il pizzaiolo: viso tondo e pieno, capelli scuri corti brizzolati ai lati, pizzetto pieno
  // coi baffi (scuro, coi fili grigi), occhi stanchi con le occhiaie, sorrisetto da furbetto. Polo
  // bianca col nome del locale ricamato in blu, grembiule bianco
  michele: {
    pelle: '#eab792', capelli: '#2a2320', capelliLuce: '#5f5550', occhi: '#3a2414',
    sopra: '#28201c', sopraSpess: 8.5, palpebra: [0.32, 0.32], occhiaie: 0.85,
    faccia: { top: 47, larg: 60, mascella: 56, mascellaY: 150, mento: 37, mentoY: 181 },
    stile: 'corto', tempie: '#aaa59f', barba: 'pizzettoPieno', barbaGrigi: '#b9b3ab',
    naso: [11, 13], orecchie: 10.5, sorriso: 2, ghigno: true,
    corporatura: 1.12, pancia: 5,
    vestito: { tipo: 'polo', colore: '#f7f7f3', ricamo: RICAMO, ricamoColore: '#2448b8' }, grembiule: '#fdfdfa',
    pantaloni: '#3a3e4a', scarpe: '#2a2a30',
  },
  // il Giso, il paladino degli scontrini: testa rasata, sopracciglia scure e folte, occhi castani,
  // barba corta appena accennata, sorrisetto furbo. Maglione rosso a coste, il fischietto appeso al
  // collo, la fascia al braccio "CONTROLLO SCONTRINI" (lente e cartellina le ha nel suo microgioco)
  // È bassino (statura < 1): nel suo microgioco è sempre più basso di chi gioca
  giso: {
    pelle: '#e9b892', capelli: '#2a1c14', capelliLuce: '#5a4436', occhi: '#5e3a1c',
    sopra: '#1c120c', sopraSpess: 10.5, sopraDritte: true, palpebra: [0.22, 0.22],
    faccia: { top: 44, larg: 53, mascella: 47, mascellaY: 155, mento: 25, mentoY: 184 },
    stile: 'rasato', rasatoScuro: true, barba: 'accenno', naso: [9.5, 13], orecchie: 10, sorriso: 3, ghigno: true, labbra: true,
    vestito: { tipo: 'maglione', colore: '#c8202c' }, fischietto: '#d4d9e2', fascia: { colore: '#f2c43a', testo: '#1f1430' },
    pantaloni: '#2f3a52', scarpe: '#1e1e24', statura: 0.86,
  },
};

// Le ragazze della disco (Petri Tentacolari): personaggi generici, diversi per capelli e vestito.
// gambeNude: col vestito le gambe sono della pelle; ciglia e rossetto sul viso.
const RAGAZZA = {
  sopraSpess: 5, palpebra: [0.08, 0.08], ciglia: true, labbra: true, barba: 'nessuna', naso: [6.5, 8.5], orecchie: 8,
  faccia: { top: 48, larg: 52, mascella: 40, mascellaY: 152, mento: 17, mentoY: 181 }, sorriso: 4, corporatura: 0.94, statura: 0.94,
};
export const RAGAZZE = [
  { ...RAGAZZA, pelle: '#f4cfb0', capelli: '#e6bd62', capelliLuce: '#fff0b4', occhi: '#3a7ac0', sopra: '#a8844a', rossetto: '#e0406e',
    stile: 'lunghi', vestito: { tipo: 'abito', colore: '#ec4f92' }, pantaloni: '#f4cfb0', scarpe: '#e0406e' },
  { ...RAGAZZA, pelle: '#efc29e', capelli: '#5a3420', capelliLuce: '#9a6a42', occhi: '#5a3a1a', sopra: '#3a2414', rossetto: '#c83a4a',
    stile: 'coda', vestito: { tipo: 'abito', colore: '#2fb8d8' }, pantaloni: '#efc29e', scarpe: '#f4f4f4' },
  { ...RAGAZZA, pelle: '#e2ae88', capelli: '#24160e', capelliLuce: '#5e4030', occhi: '#3a2414', sopra: '#1e120a', rossetto: '#b8304a',
    stile: 'ricciLunghi', vestito: { tipo: 'abito', colore: '#f2c43a' }, pantaloni: '#e2ae88', scarpe: '#2a2a30' },
  { ...RAGAZZA, pelle: '#f6d4bc', capelli: '#c8542a', capelliLuce: '#f29a5a', occhi: '#3a8a5a', sopra: '#9a3a1a', rossetto: '#d8405a',
    stile: 'caschetto', vestito: { tipo: 'abito', colore: '#3ac07a' }, pantaloni: '#f6d4bc', scarpe: '#1a1a20' },
  { ...RAGAZZA, pelle: '#c88a62', capelli: '#140e0c', capelliLuce: '#4a3a36', occhi: '#2a1a10', sopra: '#140e0c', rossetto: '#a8203a',
    stile: 'chignon', vestito: { tipo: 'abito', colore: '#ee3e36' }, pantaloni: '#c88a62', scarpe: '#e8c048' },
];

// Le ragazze di "L'Incubo degli Scapoli" (TIPE: altre da quelle di Petri Tentacolari qui sopra):
// personaggi inventati, ognuna col suo stile. accessorio = quello che ha in mano (e la posa che
// ne segue), taglio = pettinatura (stile 'taglio'), vestito 'vestitino'.
export const TIPE = [
  // quella con lo spritz: lisci biondi, vestito arancione
  { nome: 'spritz', pelle: '#f3c9a8', capelli: '#d9a94e', capelliLuce: '#f6dc98', occhi: '#3f7a5a', taglio: 'lisci', abito: '#ef7d2c', scarpe: '#f6f1e6', rossetto: '#d8475a', accessorio: 'spritz' },
  // quella che balla solo reggaeton: coda alta scura, vestito fucsia, orecchini a cerchio, braccia in alto
  { nome: 'reggaeton', pelle: '#c98f66', capelli: '#2a1a14', capelliLuce: '#6a4838', occhi: '#3a2414', taglio: 'coda', abito: '#e0368c', scarpe: '#f4f4f4', rossetto: '#b82a4a', orecchini: '#f6c63a', accessorio: 'balla' },
  // quella che guarda sempre il telefono: caschetto nero con la frangetta, vestito viola
  { nome: 'telefono', pelle: '#f0c8a6', capelli: '#1c1620', capelliLuce: '#5a5068', occhi: '#3a3a52', taglio: 'caschetto', abito: '#7a4ad8', scarpe: '#2a2430', rossetto: '#c4486a', accessorio: 'telefono', sguardo: [[0, 5], [0, 5]], sopraDavanti: true },
  // quella con il ventaglio: chignon ramato, vestito verde smeraldo
  { nome: 'ventaglio', pelle: '#f6d3b8', capelli: '#b0522a', capelliLuce: '#e08a52', occhi: '#4a6a3a', taglio: 'chignon', abito: '#1f9a6e', scarpe: '#f2c43a', rossetto: '#d83a3a', accessorio: 'ventaglio' },
  // quella che fa le foto per Instagram: ricci castani, vestito azzurro, telefono alzato
  { nome: 'foto', pelle: '#dba882', capelli: '#5a3420', capelliLuce: '#9a6a48', occhi: '#3a2414', taglio: 'ricci', abito: '#2f9ad8', scarpe: '#f4f4f4', rossetto: '#d8475a', orecchini: '#f6c63a', accessorio: 'foto' },
].map((r) => ({
  occhi: '#3a2414', sopra: scuro(r.capelli, 0.35), sopraSpess: 5.5, palpebra: [0.06, 0.06], ciglia: true,
  faccia: { top: 48, larg: 50, mascella: 41, mascellaY: 154, mento: 19, mentoY: 181 },
  stile: 'taglio', barba: 'nessuna', naso: [7, 10], orecchie: 8.5, sorriso: 5, labbra: true,
  vestito: { tipo: 'vestitino', colore: r.abito }, pantaloni: r.abito, corti: true,
  ...r,
}));

// il buttafuori della discoteca: armadio pelato in completo nero, occhiali scuri, braccia conserte
export const BUTTAFUORI = {
  pelle: '#c99a74', capelli: '#1d1511', capelliLuce: '#54423a', occhi: '#3a2414',
  sopra: '#1d1511', sopraSpess: 9, sopraDritte: true,
  faccia: { top: 42, larg: 60, mascella: 56, mascellaY: 150, mento: 38, mentoY: 180 },
  stile: 'rasato', barba: 'ispida', naso: [11, 12], orecchie: 10, sorriso: -2,
  occhiali: { montatura: '#0e0e12', lenti: '#16181e' }, corporatura: 1.28,
  vestito: { tipo: 'giacca', colore: '#17171d', sotto: '#17171d' }, pantaloni: '#17171d', scarpe: '#0e0e12',
};

// I quattro giudici di "Provini a X-Factor": personaggi INVENTATI e caricaturali (non sono
// persone vere), nell'ordine in cui siedono al tavolo. La diva (occhiali da sole, ventaglio), il
// rapper (cappellino, catena d'oro), il produttore severo (stempiato, occhialini, a braccia
// conserte), quello che si commuove sempre.
export const GIUDICI = [
  { nome: 'diva', pelle: '#f1cdb2', capelli: '#efe2bd', capelliLuce: '#fffaf0', occhi: '#3a2414', sopra: '#8a7650', sopraSpess: 5, ciglia: true, labbra: true, rossetto: '#d81e4e',
    faccia: { top: 48, larg: 51, mascella: 41, mascellaY: 153, mento: 18, mentoY: 182 }, stile: 'lunghi', barba: 'nessuna', naso: [7, 10], orecchie: 8.5, sorriso: 3,
    occhiali: { montatura: '#17131c', lenti: '#221a2c' }, orecchini: '#f6c63a',
    vestito: { tipo: 'abito', colore: '#d6247a' }, pantaloni: '#f1cdb2', scarpe: '#d6247a', accessorio: 'ventaglio' },
  { nome: 'rapper', pelle: '#b98058', capelli: '#17110e', capelliLuce: '#4a3a32', occhi: '#2a1a10', sopra: '#17110e', sopraSpess: 8.5, palpebra: [0.3, 0.3],
    faccia: { top: 46, larg: 54, mascella: 48, mascellaY: 154, mento: 28, mentoY: 183 }, stile: 'rasato', barba: 'pizzetto', naso: [10.5, 13], orecchie: 9.5, sorriso: 2, labbra: true,
    cappello: { tipo: 'berretto', colore: '#c0282e', stemma: '#ffffff' }, collana: '#f6c63a', orecchini: '#f6c63a',
    vestito: { tipo: 'felpa', colore: '#5a2d9a' }, pantaloni: '#22222a', scarpe: '#f4f4f4' },
  { nome: 'produttore', pelle: '#e6b896', capelli: '#8d8884', capelliLuce: '#c9c6c2', occhi: '#4a5a6a', sopra: '#5a5450', sopraSpess: 8.5, sopraDritte: true, palpebra: [0.26, 0.26], anziano: true,
    faccia: { top: 44, larg: 53, mascella: 47, mascellaY: 156, mento: 26, mentoY: 186 }, stile: 'stempiato', barba: 'nessuna', naso: [10, 15], orecchie: 9.5, sorriso: -3,
    occhiali: { tondi: true, montatura: '#22222a', lenti: '#dfeaf5', trasparenza: 0.2 },
    vestito: { tipo: 'giacca', colore: '#1d1f2a', sotto: '#eef0f4' }, pantaloni: '#1d1f2a', scarpe: '#101014' },
  { nome: 'commosso', pelle: '#f3ceb4', capelli: '#7a4a2a', capelliLuce: '#b4865a', occhi: '#3a6a8a', sopra: '#6a4226', sopraSpess: 7,
    faccia: { top: 48, larg: 56, mascella: 51, mascellaY: 152, mento: 31, mentoY: 180 }, stile: 'ricciCorti', barba: 'nessuna', naso: [9, 11], orecchie: 10, sorriso: 5, labbra: true,
    vestito: { tipo: 'cardigan', colore: '#3f9a8a', camicia: '#fbf6ea', quadretti: 'rgba(120,150,190,0.5)', bottoni: '#f2e6c8' }, pantaloni: '#5a4a3a', scarpe: '#3a2a1c' },
];

// I due finanzieri del finale di "Scontrino, prego!" (inventati: due uomini, nessuna persona vera): la
// divisa grigia della Guardia di Finanza con le fiamme gialle sul bavero, i bottoni dorati, le
// spalline e il berretto rigido con la visiera e la fiamma dorata. Il primo baffuto e serio, il
// secondo più giovane, con la barba corta.
const DIVISA = { tipo: 'divisa', colore: '#5f6873', fiamme: '#f2c818', bottoni: '#e8c048', camicia: '#f4f6fa', cravatta: '#3c4149' };
export const FINANZIERI = [
  { pelle: '#e3ad86', capelli: '#2a1e18', capelliLuce: '#5a4a40', occhi: '#3a2414', sopra: '#2a1c16', sopraSpess: 10, sopraDritte: true, palpebra: [0.3, 0.3],
    faccia: { top: 46, larg: 56, mascella: 52, mascellaY: 152, mento: 32, mentoY: 182 }, stile: 'corto', barba: 'baffi', baffi: '#2a1e18', naso: [10.5, 13], orecchie: 10, sorriso: -1,
    cappello: { tipo: 'visiera', colore: '#5f6873', fregio: '#e8c048' }, corporatura: 1.08,
    vestito: { ...DIVISA, gradi: 3 }, pantaloni: '#59626d', scarpe: '#121216' },
  { pelle: '#efc19e', capelli: '#3a2a1e', capelliLuce: '#7a5e48', occhi: '#4a3020', sopra: '#2e2016', sopraSpess: 9, palpebra: [0.2, 0.2],
    faccia: { top: 47, larg: 52, mascella: 46, mascellaY: 154, mento: 25, mentoY: 183 }, stile: 'corto', barba: 'corta', naso: [9.5, 12], orecchie: 9.5, sorriso: 1,
    cappello: { tipo: 'visiera', colore: '#5f6873', fregio: '#e8c048' },
    vestito: { ...DIVISA, gradi: 1 }, pantaloni: '#59626d', scarpe: '#121216' },
];

// Il Bota a fine giornata, per il finale di "Spalma il Bota!": abbronzato alla perfezione,
// oppure rosso aragosta a chiazze col segno degli occhiali da sole
export const BOTA_ABBRONZATO = { pelle: '#cf9468' };
export const BOTA_ARAGOSTA = { pelle: '#e2513f', chiazze: '#f3a08c', segnoOcchiali: '#f7d5bd', occhiali: null };

export const ESPRESSIONI = ['normale', 'felice', 'triste', 'shock', 'sufficienza'];

// ------------------------------------------------------------
//  TESTA
// ------------------------------------------------------------
export function sagomaTesta(c, f) {
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

// orecchini a cerchio (si disegnano dopo i capelli, se no sparirebbero sotto)
function orecchini(c, p) {
  for (const s of [-1, 1]) {
    c.beginPath(); c.arc(CX + s * (p.faccia.larg + 3), 137, 5.2, 0, Math.PI * 2);
    tratto(c, CONT, 3.6); tratto(c, p.orecchini, 1.9);
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

// scottatura a chiazze (macchie più chiare) e segno degli occhiali da sole attorno agli occhi
function scottatura(c, p) {
  c.save();
  sagomaTesta(c, p.faccia); c.clip();
  if (p.chiazze) {
    const r = casuale(17);
    c.fillStyle = alfa(p.chiazze, 0.75);
    for (let i = 0; i < 9; i++) { ellisse(c, CX - 50 + r() * 100, 50 + r() * 130, 6 + r() * 9, 5 + r() * 7, r() * 3); c.fill(); }
  }
  if (p.segnoOcchiali) {
    c.fillStyle = p.segnoOcchiali;
    for (const s of [-1, 1]) { rrect(c, CX + s * 26 - 20, 98, 40, 30, [8, 8, 14, 14]); c.fill(); c.fillRect(CX + s * 44, 104, s * 20, 6); }
    c.fillRect(CX - 8, 102, 16, 7);
  }
  c.restore();
  sagomaTesta(c, p.faccia); tratto(c, CONT, 3);
}

// la testa vista da dietro (per chi è sdraiato a pancia in giù): orecchie, nuca rasata
export function disegnaNuca(c, p) {
  const f = p.faccia, H = p.capelli, r = casuale(9), a = p.rasatoScuro ? 0.5 : 0.16;
  orecchie(c, p);
  sagomaTesta(c, f); c.fillStyle = gradR(c, CX - 18, 88, 8, 112, [[0, chiaro(p.pelle, 0.14)], [0.6, p.pelle], [1, scuro(p.pelle, 0.1)]]); c.fill();
  c.save(); sagomaTesta(c, f); c.clip();
  c.fillStyle = alfa(H, a); c.fillRect(0, 0, 192, 140);
  c.fillStyle = gradL(c, 0, 140, 0, 166, [[0, alfa(H, a)], [1, alfa(H, 0)]]); c.fillRect(0, 140, 192, 26);
  c.fillStyle = alfa(H, a + 0.12);
  for (let i = 0; i < 420; i++) { ellisse(c, CX - f.larg + r() * f.larg * 2, f.top + r() * 108, 0.7, 0.7); c.fill(); }
  c.restore();
  ellisse(c, CX - 18, f.top + 18, 18, 8, -0.3); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fill();
  sagomaTesta(c, f); tratto(c, CONT, 3);
  for (const y of [166, 173]) { c.beginPath(); c.moveTo(CX - 14, y); c.quadraticCurveTo(CX, y + 3, CX + 14, y); tratto(c, alfa(scuro(p.pelle, 0.5), 0.5), 1.6); }   // pieghe del collo
}

// paonazzo dalla rabbia: la faccia diventa rossa (di più in alto) e in fronte pulsa una vena
function furia(c, p) {
  c.save();
  sagomaTesta(c, p.faccia); c.clip();
  c.fillStyle = gradL(c, 0, p.faccia.top, 0, p.faccia.mentoY, [[0, 'rgba(226,34,24,0.62)'], [0.55, 'rgba(226,44,30,0.4)'], [1, 'rgba(226,60,40,0.26)']]);
  c.fillRect(0, 0, 192, 288);
  c.restore();
  sagomaTesta(c, p.faccia); tratto(c, CONT, 3);
  // la vena: quattro archetti a croce, come nei fumetti
  c.save(); c.translate(CX + 33, 66); c.rotate(0.3);
  for (let i = 0; i < 4; i++) {
    c.rotate(Math.PI / 2);
    c.beginPath(); c.moveTo(3, 11); c.quadraticCurveTo(3.5, 3.5, 11, 3); tratto(c, CONT, 5.4);
    c.beginPath(); c.moveTo(3, 11); c.quadraticCurveTo(3.5, 3.5, 11, 3); tratto(c, '#c81414', 3);
  }
  c.restore();
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
  // le occhiaie (occhiaie, da 0 a 1: Michele, che dorme poco): l'ombra violacea sotto l'occhio e la
  // piega della borsa
  if (p.occhiaie) {
    c.beginPath(); c.ellipse(x, y + 4, 14.5, 13, 0, 0.1 * Math.PI, 0.9 * Math.PI); tratto(c, alfa('#7a4a5e', 0.3 * p.occhiaie), 6);
    c.beginPath(); c.ellipse(x, y + 7, 12.5, 11.5, 0, 0.22 * Math.PI, 0.78 * Math.PI); tratto(c, alfa(scuro(p.pelle, 0.5), 0.6 * p.occhiaie), 1.6);
  }
  const arco = (su) => {
    c.beginPath();
    if (su) { c.moveTo(x - 11, y + 3); c.quadraticCurveTo(x, y - 12, x + 11, y + 3); }
    else { c.moveTo(x - 11, y - 2); c.quadraticCurveTo(x, y + 9, x + 11, y - 2); }
    tratto(c, D, 4.5);
    if (p.ciglia) for (const k of [0, 1]) { c.beginPath(); c.moveTo(x + s * (9 - k * 4), y + (su ? -1 - k * 3 : 1)); c.lineTo(x + s * (13 - k * 3), y + (su ? -5 - k * 4 : -2 - k * 3)); tratto(c, D, 2); }
  };
  // ('canta': chi canta a occhi chiusi, tutto preso, a bocca aperta)
  if (espr === 'felice' || espr === 'canta' || (espr === 'occhiolino' && s < 0)) return arco(true);
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
  // ('fischia': chi fischietta facendo finta di niente guarda in alto, altrove)
  const fischia = espr === 'fischia';
  const ix = x + sg[0] + (espr === 'sufficienza' ? -3 : fischia ? 4 : 0), iy = y + sg[1] + (sgranato ? 0 : fischia ? -4 : 1);
  ellisse(c, ix, iy, ir, ir);
  c.fillStyle = gradR(c, ix - 1.5, iy - 1.5, 0.5, ir, [[0, chiaro(p.occhi, 0.3)], [0.65, p.occhi], [1, scuro(p.occhi, 0.5)]]);
  c.fill();
  ellisse(c, ix, iy, ir * 0.48, ir * 0.48); c.fillStyle = '#140d0c'; c.fill();
  ellisse(c, ix - ir * 0.36, iy - ir * 0.4, ir * 0.28, ir * 0.28); c.fillStyle = '#ffffff'; c.fill();
  ellisse(c, ix + ir * 0.35, iy + ir * 0.36, ir * 0.13, ir * 0.13); c.fill();
  const palp = espr === 'sufficienza' ? 0.5 : espr === 'rabbia' ? 0.3 : sgranato ? 0 : fischia ? 0.2 : (p.palpebra?.[s < 0 ? 0 : 1] ?? 0);
  if (palp > 0) {
    const yl = y - ry + ry * 2 * palp;
    c.fillStyle = scuro(p.pelle, 0.1); c.fillRect(x - 20, y - ry - 2, 40, yl - (y - ry - 2));
    c.beginPath(); c.moveTo(x - 20, yl); c.lineTo(x + 20, yl); tratto(c, D, 2.6);
  }
  c.restore();
  ellisse(c, x, y, rx, ry); tratto(c, D, 2.6);
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92); tratto(c, D, 4.2);
  // ciglia: tre trattini sull'angolo esterno
  if (p.ciglia) for (const a of [0.45, 0.8, 1.15]) {
    const px = x + s * rx * Math.cos(a), py = y - ry * Math.sin(a);
    c.beginPath(); c.moveTo(px, py); c.lineTo(px + s * 4.5 * Math.cos(a - 0.2), py - 4.5 * Math.sin(a + 0.25)); tratto(c, D, 2.2);
  }
}

function sopracciglio(c, p, s, espr) {
  const x = CX + s * 26, y = 92, t = p.sopraSpess;
  let yi = 0, ye = 1, arco = -4; // yi = estremo verso il naso, ye = estremo esterno
  if (p.serio && (espr === 'normale' || espr === 'parla')) { yi = 4; ye = -2; arco = -1; }
  if (p.sopraDritte && (espr === 'normale' || espr === 'parla')) { yi = 1; ye = 0; arco = -1.5; }
  // un sopracciglio sempre alzato, da uno che la sa lunga
  if (p.sopraAlzato && (espr === 'normale' || espr === 'parla')) { if (s > 0) { yi = -8; ye = -6; arco = -6; } else { yi = 3; ye = 0; arco = -1; } }
  if (espr === 'felice' || espr === 'occhiolino') { yi = -5; ye = -3; arco = -6; }
  if (espr === 'canta') { yi = -9; ye = -2; arco = -5; }
  if (espr === 'triste' || espr === 'sbadiglio') { yi = -7; ye = 3; arco = -2; }
  if (espr === 'shock' || espr === 'sconvolto') { yi = -11; ye = -9; arco = -7; }
  if (espr === 'urlo' || espr === 'starnuto') { yi = 5; ye = -6; arco = 0; }
  if (espr === 'rabbia') { yi = 10; ye = -9; arco = 1; }   // a V stretta, sopra gli occhi
  if (espr === 'sufficienza') { if (s < 0) { yi = -8; ye = -7; arco = -6; } else { yi = 3; ye = 1; arco = 0; } }
  if (espr === 'fischia') { yi = -3; ye = -9; arco = -5; }   // l'aria innocente
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
  // (nasoRosso, da 0 a 1: il naso di chi ha bevuto, al beer pong)
  c.fillStyle = espr === 'starnuto' ? '#ea8b7c' : p.nasoRosso ? mix(scuro(p.pelle, 0.08), '#e0453a', p.nasoRosso) : scuro(p.pelle, 0.08); c.fill();
  c.beginPath();
  c.moveTo(CX - w, y); c.quadraticCurveTo(CX - w - 0.5, y + h * 0.64, CX, y + h * 0.64); c.quadraticCurveTo(CX + w + 0.5, y + h * 0.64, CX + w, y);
  tratto(c, scuro(p.pelle, 0.5), 2.4);
  ellisse(c, CX - 2, y - 1, w * 0.32, h * 0.3); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill();
  if (p.anellinoNaso) {   // anellino alla narice
    c.beginPath(); c.arc(CX - w + 0.5, y + h * 0.4, 3.6, 0.2, Math.PI * 1.35);
    tratto(c, CONT, 3.2); tratto(c, p.anellinoNaso, 1.7);
  }
  if (p.septum) {   // anellino sotto il naso, tra le narici, con le due palline
    c.beginPath(); c.arc(CX, y + h * 0.5, 5, 0.25, Math.PI - 0.25);
    tratto(c, CONT, 3.6); tratto(c, p.septum, 2);
    for (const s of [-1, 1]) { ellisse(c, CX + s * 4.9, y + h * 0.5 + 1.4, 1.8, 1.8); c.fillStyle = p.septum; c.fill(); tratto(c, CONT, 0.8); }
  }
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
    case 'felice':
    case 'occhiolino': {
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
    case 'rabbia': {
      // urla a bocca larga, coi denti di sopra e di sotto in vista
      const forma = () => {
        c.beginPath(); c.moveTo(CX - 22, y - 6); c.quadraticCurveTo(CX, y - 13, CX + 22, y - 6);
        c.quadraticCurveTo(CX + 26, y + 8, CX + 17, y + 17); c.quadraticCurveTo(CX, y + 22, CX - 17, y + 17);
        c.quadraticCurveTo(CX - 26, y + 8, CX - 22, y - 6); c.closePath();
      };
      forma(); c.fillStyle = B; c.fill();
      c.save(); forma(); c.clip();
      ellisse(c, CX, y + 12, 11, 6); c.fillStyle = '#ec7b86'; c.fill();
      c.fillStyle = '#ffffff'; c.fillRect(CX - 26, y - 14, 52, 11); c.fillRect(CX - 26, y + 13, 52, 10);
      for (let x = CX - 18; x <= CX + 18; x += 6) { c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x, y - 3); c.moveTo(x, y + 13); c.lineTo(x, y + 23); tratto(c, 'rgba(0,0,0,0.22)', 1); }
      c.restore();
      forma(); tratto(c, D, 3);
      break;
    }
    case 'shock': aperta(8, 11, y + 4, false, true); break;
    case 'sconvolto': aperta(13, 9, y + 4, true, false); break;
    case 'urlo': aperta(18, 15, y + 6, true, true); break;
    case 'canta': aperta(12, 14, y + 5, true, true); break;
    case 'sbadiglio': aperta(12, 17, y + 7, true, true); break;
    case 'starnuto': aperta(6, 5, y + 2, false, false); break;
    case 'parla': aperta(10, 7, y + 3, true, false); break;
    case 'fischia':
      // le labbra a cerchietto, un po' di lato: fischietta facendo finta di niente
      ellisse(c, CX + 6, y + 3, 7.5, 6.5); c.fillStyle = mix(scuro(p.pelle, 0.15), '#c9786c', 0.6); c.fill(); tratto(c, D, 2.6);
      ellisse(c, CX + 6, y + 3, 2.8, 2.6); c.fillStyle = B; c.fill();
      break;
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
      else if (p.rossetto) { ellisse(c, CX, y + 3, 10, 4.6); c.fillStyle = p.rossetto; c.fill(); }   // rossetto
      else if (p.labbra) { ellisse(c, CX, y + 4.5, 9.5, 4); c.fillStyle = alfa('#c9786c', 0.55); c.fill(); } // labbra carnose
      if (p.ghigno) {
        // sorrisetto storto, da uno sicuro di sé: un angolo della bocca sale
        c.beginPath(); c.moveTo(CX - 13, y + 2); c.quadraticCurveTo(CX + 3, y + 5, CX + 15, y - 5); tratto(c, D, 3.4);
        c.beginPath(); c.moveTo(CX + 13, y - 8); c.quadraticCurveTo(CX + 18, y - 5, CX + 16, y); tratto(c, alfa(scuro(p.pelle, 0.5), 0.6), 1.8);
        break;
      }
      c.beginPath(); c.moveTo(CX - 14, y - k * 0.35); c.quadraticCurveTo(CX, y + k * 1.5, CX + 14, y - k * 0.35); tratto(c, D, 3.4);
      if (!folta) {
        c.beginPath(); c.moveTo(CX - 6, y + 7 + k * 0.5); c.quadraticCurveTo(CX, y + 9.5 + k * 0.5, CX + 6, y + 7 + k * 0.5);
        tratto(c, alfa(scuro(p.pelle, 0.5), 0.55), 1.8);
      }
    }
  }
}

function barba(c, p) {
  // (barbaColore: barba di un colore diverso dai capelli, es. brizzolata; baffi: i baffi di un altro ancora)
  const f = p.faccia, H = p.barbaColore ?? p.capelli, r = casuale(5);
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
  if (p.barba === 'pizzettoPieno') {
    // pizzetto pieno coi baffi (Michele): i baffi folti scendono ai lati della bocca e si uniscono
    // alla barba del mento, tonda, che scende un po' sotto; scura, coi fili grigi (barbaGrigi)
    const forma = () => {
      c.beginPath();
      c.moveTo(CX - 25, 151);
      c.quadraticCurveTo(CX - 13, 139, CX, 142); c.quadraticCurveTo(CX + 13, 139, CX + 25, 151);
      c.quadraticCurveTo(CX + 30, 168, CX + 25, 181); c.quadraticCurveTo(CX + 15, 197, CX, 198);
      c.quadraticCurveTo(CX - 15, 197, CX - 25, 181); c.quadraticCurveTo(CX - 30, 168, CX - 25, 151);
      c.closePath();
      // (il buco per la bocca e il labbro di sotto: col pari e dispari resta vuoto)
      c.moveTo(CX - 16, 158); c.quadraticCurveTo(CX, 154, CX + 16, 158); c.quadraticCurveTo(CX + 14, 172, CX, 173); c.quadraticCurveTo(CX - 14, 172, CX - 16, 158); c.closePath();
    };
    forma(); c.fillStyle = gradL(c, 0, 140, 0, 198, [[0, H], [1, scuro(H, 0.25)]]); c.fill('evenodd');
    c.save(); forma(); c.clip('evenodd');
    c.globalAlpha = 0.8;
    for (let i = 0; i < 130; i++) {
      const x = CX - 28 + r() * 56, y = 141 + r() * 56;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (x - CX) * 0.07, y + 3 + r() * 3); tratto(c, i % 3 ? (p.barbaGrigi ?? p.capelliLuce) : p.capelliLuce, 1.2);
    }
    c.globalAlpha = 1;
    c.restore();
    forma(); tratto(c, CONT, 2.4);
    // la barba di qualche giorno sulle guance, appena
    c.save(); sagomaTesta(c, f); c.clip(); puntini(160, CX - 56, 132, 112, 40, 0.16); c.restore();
    return;
  }
  if (p.barba === 'curata') {
    // barba corta ma piena e ben definita (lo Zere): scura e fitta su guance basse, mascella e mento,
    // coi baffi uniti; segue il contorno del viso sporgendo appena, senza scendere sotto il mento.
    // Sulle guance parte più in basso delle barbe lunghe (dalla punta del naso, non dagli occhi).
    // Le labbra restano scoperte (il buco col pari e dispari), così la bocca si vede
    const L = f.larg;
    const guance = () => {
      c.moveTo(CX - L + 5, 110);
      c.bezierCurveTo(CX - L + 10, 126, CX - 40, 137, CX - 27, 141);
      c.quadraticCurveTo(CX - 13, 139, CX, 143); c.quadraticCurveTo(CX + 13, 139, CX + 27, 141);
      c.bezierCurveTo(CX + 40, 137, CX + L - 10, 126, CX + L - 5, 110);
    };
    const zona = () => {
      c.beginPath(); c.moveTo(CX - L - 6, 108); guance(); c.lineTo(CX + L + 6, 108); c.lineTo(CX + L + 8, 215); c.lineTo(CX - L - 8, 215); c.closePath();
      c.moveTo(CX - 13, 155); c.quadraticCurveTo(CX, 151, CX + 13, 155); c.quadraticCurveTo(CX + 11, 164, CX, 165); c.quadraticCurveTo(CX - 11, 164, CX - 13, 155); c.closePath();
    };
    const sagoma = () => sagomaTesta(c, { ...f, larg: L + 1.5, mascella: f.mascella + 2.5, mento: f.mento + 3, mentoY: f.mentoY + 4 });
    c.save(); zona(); c.clip('evenodd');
    sagoma(); c.fillStyle = gradL(c, 0, 110, 0, f.mentoY + 4, [[0, H], [0.55, chiaro(H, 0.06)], [1, scuro(H, 0.22)]]); c.fill();
    c.save(); sagoma(); c.clip();
    c.globalAlpha = 0.6;
    for (let i = 0; i < 190; i++) {
      const x = CX - L + r() * L * 2, y = 110 + r() * (f.mentoY - 104), d = (x - CX) * 0.05;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + d, y + 2, x + d * 1.4, y + 4 + r() * 2); tratto(c, i % 4 ? p.capelliLuce : scuro(H, 0.5), 1.2);
    }
    c.globalAlpha = 1;
    c.restore();
    sagoma(); tratto(c, CONT, 3);
    c.restore();
    // il bordo netto sulle guance (fatto dal barbiere) e intorno alle labbra
    c.save(); sagoma(); c.clip();
    c.beginPath(); guance(); tratto(c, scuro(H, 0.25), 2.2);
    c.beginPath(); c.moveTo(CX - 13, 155); c.quadraticCurveTo(CX, 151, CX + 13, 155); c.quadraticCurveTo(CX + 11, 164, CX, 165); c.quadraticCurveTo(CX - 11, 164, CX - 13, 155); tratto(c, scuro(H, 0.3), 1.6);
    c.restore();
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
  } else if (p.barba === 'baffi') {
    // solo i baffi, folti e ben pettinati, che scendono un po' ai lati (il finanziere); il viso rasato
    const M = p.baffi ?? H;
    const forma = () => {
      c.beginPath(); c.moveTo(CX, 143);
      c.bezierCurveTo(CX + 9, 138, CX + 22, 140, CX + 26, 152); c.quadraticCurveTo(CX + 20, 151, CX + 12, 154);
      c.quadraticCurveTo(CX + 5, 150, CX, 152); c.quadraticCurveTo(CX - 5, 150, CX - 12, 154);
      c.quadraticCurveTo(CX - 20, 151, CX - 26, 152); c.bezierCurveTo(CX - 22, 140, CX - 9, 138, CX, 143); c.closePath();
    };
    forma(); c.fillStyle = gradL(c, 0, 139, 0, 155, [[0, chiaro(M, 0.12)], [1, scuro(M, 0.15)]]); c.fill(); tratto(c, scuro(M, 0.35), 1.2);
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(CX + s * (4 + k * 5), 145); c.lineTo(CX + s * (6 + k * 5.5), 151); tratto(c, alfa(chiaro(M, 0.3), 0.45), 0.8); }
  } else if (p.barba === 'pizzettoBaffi') {
    // barba di qualche giorno, baffi sottili e pizzetto sul mento
    c.beginPath();
    c.moveTo(CX - 62, 124); c.quadraticCurveTo(CX - 32, 142, CX - 18, 148); c.quadraticCurveTo(CX, 143, CX + 18, 148);
    c.quadraticCurveTo(CX + 32, 142, CX + 62, 124); c.lineTo(CX + 62, 200); c.lineTo(CX - 62, 200); c.closePath();
    c.fillStyle = gradL(c, 0, 124, 0, 160, [[0, alfa(H, 0)], [1, alfa(H, 0.13)]]); c.fill();
    c.save(); c.clip(); puntini(260, CX - 58, 128, 116, 60, 0.22); c.restore();
    c.beginPath(); c.moveTo(CX - 19, 152); c.quadraticCurveTo(CX - 10, 144, CX, 146); c.quadraticCurveTo(CX + 10, 144, CX + 19, 152); tratto(c, p.baffi ? alfa(p.baffi, 0.92) : alfa(H, 0.75), p.baffi ? 5 : 3.6);
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

  if (p.stile === 'rasta') {
    // Dreadlock (Tini): ciocche grosse come corde. Dietro scendono ai lati fino alle spalle;
    // davanti cadono sulla fronte da sotto il berretto, le più lunghe sulle tempie.
    const r = casuale(fase === 'dietro' ? 131 : 137);
    const ciocca = (x0, y0, x1, y1, w, curva) => {
      const mx = (x0 + x1) / 2 + curva, my = (y0 + y1) / 2;
      const via = () => { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mx, my, x1, y1); };
      via(); tratto(c, CONT, w + 3.4); via(); tratto(c, H, w);
      // i nodi della corda: trattini di traverso, uno scuro e uno chiaro
      const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 8));
      for (let i = 1; i < n; i++) {
        const t = i / n, qx = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * mx + t * t * x1, qy = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * my + t * t * y1;
        c.beginPath(); c.moveTo(qx - w * 0.42, qy - 1.2); c.lineTo(qx + w * 0.42, qy + 1.2); tratto(c, i % 2 ? scuro(H, 0.32) : L, 1.4);
      }
    };
    if (fase === 'dietro') {
      ellisse(c, CX, 92, 60, 52); c.fillStyle = scuro(H, 0.28); c.fill(); tratto(c, CONT, 3);
      for (const s of [-1, 1]) for (let i = 3; i >= 0; i--) {
        ciocca(CX + s * (40 + i * 6), 98, CX + s * (50 + i * 7 + r() * 4), 150 + i * 9 + r() * 10, 7.5, s * (6 + r() * 4));
      }
      return;
    }
    const y0 = p.faccia.top + 14;
    for (const [x, lung, curva] of [[-47, 84, -6], [-35, 44, -3], [-22, 36, 2], [-8, 50, -2], [6, 32, 3], [19, 42, -2], [33, 38, 3], [46, 80, 6]]) {
      ciocca(CX + x, y0, CX + x + curva * 0.5 + (r() - 0.5) * 4, y0 + lung, 7.5, curva);
    }
    return;
  }

  if (p.stile === 'ricciLunghetti') {
    // Ricci scuri e folti, lasciati lunghi (Oli): stessa tecnica a riccioli di 'ricci', ma i ricci
    // scendono sulla fronte, coprono la cima delle orecchie e spuntano dietro, ai lati del collo.
    const r = casuale(fase === 'dietro' ? 151 : 157), cerchi = [];
    if (fase === 'dietro') {
      for (let i = 0; i <= 19; i++) {
        const th = ((148 + (i / 19) * 244) * Math.PI) / 180;
        cerchi.push([CX + Math.cos(th) * 56 + (r() - 0.5) * 4, 96 + Math.sin(th) * 56 + (r() - 0.5) * 4, 13 + r() * 4.5]);
      }
      for (let i = 0; i < 8; i++) cerchi.push([CX - 39 + i * 11.2, 48 + (r() - 0.5) * 8, 15]);
      for (const s of [-1, 1]) { cerchi.push([CX + s * 52, 143, 10.5], [CX + s * 47, 157, 9.5]); }   // i ricci sulla nuca
    } else {
      for (let i = 0; i < 9; i++) {
        const k = (i - 4) / 4;
        cerchi.push([CX + k * 48, 65 + k * k * 12 + (r() - 0.5) * 4, 11 + r() * 3]);
      }
      // quelli che cadono sulla fronte e sulle tempie
      cerchi.push([CX - 20, 79, 9.5], [CX + 3, 83, 8.5], [CX + 24, 77, 9.5], [CX - 37, 74, 8], [CX + 40, 73, 8]);
      for (const s of [-1, 1]) cerchi.push([CX + s * 52, 93, 8.5], [CX + s * 54, 108, 7.5]);
    }
    for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr + 2.6, rr + 2.6); c.fillStyle = CONT; c.fill(); }
    for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr, rr); c.fillStyle = H; c.fill(); }
    if (fase === 'dietro') { ellisse(c, CX, 89, 56, 50); c.fillStyle = H; c.fill(); }
    else {
      c.save(); c.beginPath(); c.rect(0, 0, 192, 68); c.clip(); sagomaTesta(c, p.faccia); c.fillStyle = H; c.fill(); c.restore();
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

  if (p.stile === 'mossi') {
    // Corti e mossi, spettinati (il Manna): corti ai lati (finiscono sopra le orecchie), un po'
    // di volume a onde in cima; davanti una frangia di ciocche tonde che cadono sulla fronte,
    // più alte dalla parte del sopracciglio alzato.
    const r = casuale(fase === 'dietro' ? 83 : 89);
    if (fase === 'dietro') {
      const massa = () => {
        c.beginPath(); c.moveTo(CX - 50, 112);
        for (const [qx, qy, x, y] of [[-63, 104, -57, 90], [-68, 76, -59, 62], [-65, 44, -49, 35], [-45, 17, -24, 21], [-10, 8, 9, 17], [27, 8, 42, 25], [60, 29, 58, 50], [69, 64, 59, 78], [67, 92, 56, 102], [58, 114, 50, 112]]) c.quadraticCurveTo(CX + qx, qy, CX + x, y);
        c.lineTo(CX + 40, 100); c.lineTo(CX - 40, 100);
        c.closePath();
      };
      massa(); c.fillStyle = gradL(c, 0, 10, 0, 116, [[0, scuro(H, 0.1)], [1, scuro(H, 0.34)]]); c.fill();
      c.globalAlpha = 0.8;
      ciocche(c, massa, 12, (i) => { const a = Math.PI * (1.02 + (i / 11) * 0.96), x = CX + Math.cos(a) * 56, y = 76 + Math.sin(a) * 52; c.beginPath(); c.arc(x, y, 5 + r() * 3.5, r() * 6, r() * 6 + 3.3); tratto(c, L, 1.7); });
      c.globalAlpha = 1;
      massa(); tratto(c, CONT, 3);
      return;
    }
    // ciocche della frangia, da destra a sinistra: [punta, attaccatura della successiva]
    const punte = [[[28, 72], [17, 62]], [[6, 80], [-5, 64]], [[-16, 78], [-26, 66]], [[-36, 84], [-44, 72]]];
    const forma = () => {
      c.beginPath(); c.moveTo(CX - 52, 100);
      c.bezierCurveTo(CX - 60, 86, CX - 61, 66, CX - 51, 50);
      c.bezierCurveTo(CX - 45, 32, CX - 26, 20, CX - 8, 22);
      c.bezierCurveTo(CX + 14, 14, CX + 40, 23, CX + 51, 46);
      c.bezierCurveTo(CX + 61, 64, CX + 60, 86, CX + 52, 100);
      c.quadraticCurveTo(CX + 45, 94, CX + 47, 84);                          // la basetta, corta
      c.quadraticCurveTo(CX + 49, 74, CX + 40, 68);
      let px = CX + 40;
      for (const [[tx, ty], [vx, vy]] of punte) {
        c.quadraticCurveTo(px - 3, ty + 4, CX + tx, ty);                     // la ciocca scende, tonda
        c.quadraticCurveTo(CX + tx - 9, ty - 1, CX + vx, vy);                // e risale all'attaccatura della successiva
        px = CX + vx;
      }
      c.quadraticCurveTo(CX - 49, 76, CX - 47, 86);
      c.quadraticCurveTo(CX - 45, 95, CX - 52, 100);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(14, 90); c.fill();
    c.globalAlpha = 0.8;
    ciocche(c, forma, 24, (i) => {
      // onde: archetti sparsi, più qualche ciocca lunga che scende verso la fronte
      if (i % 3 === 0) { const x1 = CX - 42 + (i / 24) * 84, x0 = CX + (x1 - CX) * 0.3; c.beginPath(); c.moveTo(x0, 21 + r() * 6); c.bezierCurveTo(x0 + 9, 38, x1 - 9, 50, x1, 66 + r() * 10); tratto(c, scuro(H, 0.45), 1.6); }
      else { const x = CX - 48 + r() * 96, y = 28 + r() * 48; c.beginPath(); c.arc(x, y, 4.5 + r() * 4, r() * 6, r() * 6 + 3.2); tratto(c, L, 1.8); }
    });
    c.globalAlpha = 1;
    forma(); tratto(c, CONT, 3);
    // ciuffi ribelli, in cima e ai lati
    for (const [x, y, dx, dy] of [[-30, 23, -7, -7], [4, 17, 5, -8], [35, 25, 9, -5], [-56, 70, -8, 2], [57, 76, 8, 3]]) {
      c.beginPath(); c.moveTo(CX + x, y + 5); c.quadraticCurveTo(CX + x + dx * 0.2, y - 3 + dy * 0.2, CX + x + dx, y + dy);
      tratto(c, CONT, 5.2); tratto(c, H, 2.6);
    }
    return;
  }

  if (p.stile === 'taglio') {
    // Le ragazze del Manna (TIPE), in cinque tagli. (Le ragazze di Petri Tentacolari hanno i
    // loro stili più sotto: 'lunghi', 'caschetto', 'ricciLunghi', 'coda', 'chignon'.)
    //   'lisci'     riga in mezzo e capelli lisci fin sotto le spalle
    //   'ricci'     riga in mezzo, tanto volume e riccioli
    //   'caschetto' frangetta dritta, lunghi fino alla mascella
    //   'coda'      tirati indietro col ciuffo di lato e la coda alta
    //   'chignon'   tirati indietro col ciuffo di lato e la crocchia in cima
    const T = p.taglio ?? 'lisci', riga = T === 'lisci' || T === 'ricci';
    const filo = (forma, n, fn) => { c.globalAlpha = 0.75; ciocche(c, forma, n, fn); c.globalAlpha = 1; };
    if (fase === 'dietro') {
      const giu = { lisci: 216, ricci: 206, caschetto: 172, coda: 0, chignon: 0 }[T], lg = T === 'ricci' ? 72 : T === 'lisci' ? 66 : 63;
      if (T === 'coda') {
        // la coda: parte dall'elastico in cima e ricade di lato
        const coda = () => { c.beginPath(); c.moveTo(CX + 26, 30); c.bezierCurveTo(CX + 60, 10, CX + 92, 44, CX + 86, 96); c.bezierCurveTo(CX + 84, 124, CX + 78, 142, CX + 70, 152); c.bezierCurveTo(CX + 72, 118, CX + 70, 76, CX + 44, 52); c.closePath(); };
        coda(); c.fillStyle = sfum(14, 152); c.fill();
        filo(coda, 5, (i) => { c.beginPath(); c.moveTo(CX + 40 + i * 5, 30 + i * 3); c.bezierCurveTo(CX + 76 + i * 2, 50, CX + 82, 100, CX + 72 + i, 150); tratto(c, i % 2 ? scuro(H, 0.45) : L, 1.8); });
        coda(); tratto(c, CONT, 3);
      }
      if (T === 'chignon') { ellisse(c, CX, 24, 22, 19); c.fillStyle = sfum(4, 44); c.fill(); tratto(c, CONT, 3); c.beginPath(); c.arc(CX, 24, 12, 0.4, 3.6); tratto(c, L, 1.8); }
      const massa = () => {
        c.beginPath(); c.moveTo(CX - 60, 76);
        c.bezierCurveTo(CX - 62, 16, CX + 62, 16, CX + 60, 76);
        if (giu) {
          c.bezierCurveTo(CX + lg, 110, CX + lg + 5, giu - 34, CX + lg - 1, giu);
          c.quadraticCurveTo(CX + lg - 14, giu + 9, CX + 40, giu - 5);
          c.lineTo(CX + 38, 150); c.lineTo(CX - 38, 150); c.lineTo(CX - 40, giu - 5);
          c.quadraticCurveTo(CX - lg + 14, giu + 9, CX - lg + 1, giu);
          c.bezierCurveTo(CX - lg - 5, giu - 34, CX - lg, 110, CX - 60, 76);
        } else { c.bezierCurveTo(CX + 65, 112, CX + 58, 142, CX + 44, 152); c.lineTo(CX - 44, 152); c.bezierCurveTo(CX - 58, 142, CX - 65, 112, CX - 60, 76); }
        c.closePath();
      };
      if (T === 'ricci') {
        // riccioli tutt'attorno alla massa
        const r = casuale(31), cerchi = [];
        for (const s of [-1, 1]) for (let i = 0; i < 9; i++) cerchi.push([CX + s * (62 + (r() - 0.5) * 8 + Math.sin(i * 0.5) * 6), 62 + i * 18 + (r() - 0.5) * 6, 11 + r() * 4]);
        for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr + 2.6, rr + 2.6); c.fillStyle = CONT; c.fill(); }
        for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr, rr); c.fillStyle = scuro(H, 0.18); c.fill(); c.beginPath(); c.arc(x, y, rr * 0.55, r() * 6, r() * 6 + 3.6); tratto(c, L, 1.6); }
      }
      massa(); c.fillStyle = gradL(c, 0, 30, 0, Math.max(160, giu), [[0, scuro(H, 0.12)], [1, scuro(H, 0.36)]]); c.fill(); tratto(c, CONT, 3);
      return;
    }
    if (riga) {
      // due tende che partono dalla riga in mezzo e scendono lungo la fronte e le guance
      const fine = { lisci: 156, ricci: 130 }[T];
      const tenda = (s) => () => {
        c.beginPath(); c.moveTo(CX, 44);
        c.bezierCurveTo(CX + s * 14, 50, CX + s * 36, 64, CX + s * 47, 92);
        c.bezierCurveTo(CX + s * 51, 108, CX + s * 51, 122, CX + s * 49, fine);
        if (T === 'lisci') c.lineTo(CX + s * 66, fine + 8);
        else c.quadraticCurveTo(CX + s * 56, fine + 11, CX + s * 68, fine + 1);   // la punta gira in fuori
        c.bezierCurveTo(CX + s * 72, 110, CX + s * 71, 60, CX + s * 46, 28);
        c.bezierCurveTo(CX + s * 30, 15, CX + s * 12, 15, CX, 19);
        c.closePath();
      };
      for (const s of [-1, 1]) {
        const forma = tenda(s);
        forma(); c.fillStyle = sfum(16, fine + 10); c.fill();
        filo(forma, 6, (i) => {
          const k = i / 5;
          c.beginPath(); c.moveTo(CX + s * (4 + k * 10), 24 + k * 6);
          c.bezierCurveTo(CX + s * (28 + k * 22), 40 + k * 10, CX + s * (50 + k * 14), 84, CX + s * (52 + k * 12) + (T === 'lisci' ? 0 : Math.sin(i * 2) * 4), fine + 4);
          tratto(c, i % 2 ? scuro(H, 0.45) : L, i % 2 ? 1.5 : 2);
        });
        forma(); tratto(c, CONT, 3);
        if (T === 'ricci') {
          const r = casuale(s > 0 ? 61 : 67);
          for (let i = 0; i < 5; i++) { const x = CX + s * (58 + (r() - 0.5) * 8), y = 70 + i * 15; ellisse(c, x, y, 9, 9); c.fillStyle = H; c.fill(); tratto(c, CONT, 2.2); c.beginPath(); c.arc(x, y, 4.6, r() * 6, r() * 6 + 3.8); tratto(c, L, 1.5); }
        }
      }
      return;
    }
    if (T === 'caschetto') {
      const forma = () => {
        c.beginPath(); c.moveTo(CX - 49, 91); c.lineTo(CX + 49, 91);
        c.bezierCurveTo(CX + 52, 118, CX + 52, 150, CX + 50, 167); c.quadraticCurveTo(CX + 60, 177, CX + 69, 166);
        c.bezierCurveTo(CX + 73, 110, CX + 70, 40, CX + 30, 22); c.bezierCurveTo(CX + 10, 14, CX - 10, 14, CX - 30, 22);
        c.bezierCurveTo(CX - 70, 40, CX - 73, 110, CX - 69, 166); c.quadraticCurveTo(CX - 60, 177, CX - 50, 167);
        c.bezierCurveTo(CX - 52, 150, CX - 52, 118, CX - 49, 91);
        c.closePath();
      };
      forma(); c.fillStyle = sfum(14, 176); c.fill();
      filo(forma, 13, (i) => { const x = CX - 48 + i * 8; c.beginPath(); c.moveTo(x, 91); c.quadraticCurveTo(x + (CX - x) * 0.12, 60, x + (CX - x) * 0.35, 24); tratto(c, i % 3 ? L : scuro(H, 0.5), 1.8); });
      c.beginPath(); c.moveTo(CX - 28, 34); c.quadraticCurveTo(CX, 22, CX + 26, 32); tratto(c, 'rgba(255,255,255,0.3)', 3);     // riflesso lucido
      forma(); tratto(c, CONT, 3);
      return;
    }
    // coda e chignon: tirati indietro, con un ciuffo che attraversa la fronte
    const forma = () => {
      c.beginPath(); c.moveTo(CX - 54, 104);
      c.bezierCurveTo(CX - 56, 80, CX - 46, 62, CX - 20, 60);
      c.bezierCurveTo(CX + 8, 60, CX + 32, 70, CX + 51, 94);
      c.lineTo(CX + 54, 106);
      c.bezierCurveTo(CX + 70, 80, CX + 66, 34, CX + 40, 22);
      c.bezierCurveTo(CX + 12, 10, CX - 22, 10, CX - 44, 24);
      c.bezierCurveTo(CX - 68, 40, CX - 70, 84, CX - 54, 104);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(12, 104); c.fill();
    filo(forma, 10, (i) => { const x0 = CX - 46 + i * 10; c.beginPath(); c.moveTo(x0, 64 + Math.max(0, i - 4) * 5); c.bezierCurveTo(x0 + 4, 44, CX + 10 + i * 2, 28, CX + 18 + i * 2, 16); tratto(c, i % 3 ? L : scuro(H, 0.5), 1.9); });
    forma(); tratto(c, CONT, 3);
    if (T === 'coda') { rrect(c, CX + 22, 22, 14, 12, 4); c.fillStyle = p.vestito?.colore ?? '#e0368c'; c.fill(); tratto(c, CONT, 2.2); }   // l'elastico
    return;
  }

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

  if (p.stile === 'ricciMedi') {
    // come 'ricci' (stessa tecnica a riccioli) ma più raccolti: meno larghi ai lati
    // della testa e meno alti sopra. A metà strada tra 'ricci' e 'ricciCorti'. (Riccardo)
    const r = casuale(fase === 'dietro' ? 53 : 71), cerchi = [];
    if (fase === 'dietro') {
      for (let i = 0; i <= 17; i++) {
        const th = ((170 + (i / 17) * 200) * Math.PI) / 180;
        cerchi.push([CX + Math.cos(th) * 56 + (r() - 0.5) * 4, 91 + Math.sin(th) * 52 + (r() - 0.5) * 4, 13.5 + r() * 4]);
      }
      for (let i = 0; i < 7; i++) cerchi.push([CX - 36 + i * 12, 47 + (r() - 0.5) * 7, 14]);
    } else {
      for (let i = 0; i < 8; i++) {
        const k = (i - 3.5) / 3.5;
        cerchi.push([CX + k * 48, 63 + k * k * 11 + (r() - 0.5) * 3, 10 + r() * 3]);
      }
    }
    for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr + 2.6, rr + 2.6); c.fillStyle = CONT; c.fill(); }
    for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr, rr); c.fillStyle = H; c.fill(); }
    if (fase === 'dietro') { ellisse(c, CX, 86, 54, 47); c.fillStyle = H; c.fill(); }
    else {
      c.save(); c.beginPath(); c.rect(0, 0, 192, 65); c.clip(); sagomaTesta(c, p.faccia); c.fillStyle = H; c.fill(); c.restore();
      for (let i = 0; i < 8; i++) cerchi.push([54 + r() * 84, 47 + r() * 14, 5]);
    }
    c.globalAlpha = 0.85;
    for (const [x, y, rr] of cerchi) for (let k = 0; k < (rr > 6 ? 3 : 1); k++) {
      const a = r() * 6.28, qx = x + (r() - 0.5) * rr * 1.1, qy = y + (r() - 0.5) * rr * 1.1, qr = 2.6 + r() * 3;
      c.beginPath(); c.arc(qx, qy, qr, a, a + 3.4 + r() * 1.6);
      tratto(c, k === 2 ? chiaro(L, 0.25) : L, 1.6);
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

  if (p.stile === 'indietroLungo') {
    // come 'indietro' ma più lunghi e con più volume: pettinati all'indietro con la riga appena
    // accennata in mezzo, ai lati scendono sopra le orecchie fino al lobo e finiscono
    // in punte morbide girate in fuori; dietro arrivano alla nuca (Giorgio)
    const lucido = (y0, y1) => gradL(c, 0, y0, 0, y1, [[0, chiaro(H, 0.12)], [0.5, H], [1, scuro(H, 0.3)]]);
    if (fase === 'dietro') {
      const r = casuale(31), dietro = () => {
        c.beginPath(); c.moveTo(CX - 62, 78);
        c.bezierCurveTo(CX - 62, 20, CX + 62, 20, CX + 62, 78);
        c.bezierCurveTo(CX + 68, 98, CX + 70, 124, CX + 66, 140);
        for (let i = 1; i <= 4; i++) { const x = CX + 66 - i * 7; c.lineTo(x + 3.5, 146 + r() * 4); c.lineTo(x, 140 + r() * 2); }
        c.lineTo(CX + 36, 140); c.quadraticCurveTo(CX, 148, CX - 36, 140);
        for (let i = 4; i >= 1; i--) { const x = CX - 66 + i * 7; c.lineTo(x, 140 + r() * 2); c.lineTo(x - 3.5, 146 + r() * 4); }
        c.lineTo(CX - 66, 140);
        c.bezierCurveTo(CX - 70, 124, CX - 68, 98, CX - 62, 78); c.closePath();
      };
      dietro(); c.fillStyle = gradL(c, 0, 30, 0, 150, [[0, scuro(H, 0.12)], [1, scuro(H, 0.38)]]); c.fill(); tratto(c, CONT, 3);
      return;
    }
    // cima gonfia, tirata indietro: l'attaccatura sulla fronte si apre appena in mezzo
    const cima = () => {
      c.beginPath(); c.moveTo(CX - 55, 104);
      c.bezierCurveTo(CX - 56, 84, CX - 50, 70, CX - 34, 63);
      c.bezierCurveTo(CX - 20, 57, CX - 8, 58, CX + 2, 64);
      c.bezierCurveTo(CX + 12, 57, CX + 32, 57, CX + 44, 66);
      c.bezierCurveTo(CX + 53, 74, CX + 57, 88, CX + 56, 104);
      c.bezierCurveTo(CX + 76, 82, CX + 74, 30, CX + 44, 15);
      c.bezierCurveTo(CX + 14, 1, CX - 26, 2, CX - 50, 18);
      c.bezierCurveTo(CX - 78, 38, CX - 76, 84, CX - 55, 104);
      c.closePath();
    };
    // ai lati: due bande che coprono le orecchie e scendono fino alla mascella, punte in fuori
    const lato = (s) => () => {
      const r = casuale(s > 0 ? 13 : 14);
      c.beginPath(); c.moveTo(CX + s * 46, 70);
      c.bezierCurveTo(CX + s * 56, 86, CX + s * 57, 104, CX + s * 57, 118);
      c.bezierCurveTo(CX + s * 56, 126, CX + s * 55, 131, CX + s * 54, 134);
      for (let i = 1; i <= 4; i++) { const x = CX + s * (54 + i * 4); c.lineTo(x - s * 1.5, 140 + r() * 3); c.lineTo(x + s * 1.5, 134 + r() * 2); }
      c.quadraticCurveTo(CX + s * 75, 134, CX + s * 73, 126);   // la punta che gira in fuori
      c.bezierCurveTo(CX + s * 71, 112, CX + s * 71, 96, CX + s * 67, 82);
      c.bezierCurveTo(CX + s * 64, 72, CX + s * 56, 66, CX + s * 46, 70);
      c.closePath();
    };
    for (const s of [-1, 1]) {
      const forma = lato(s);
      forma(); c.fillStyle = lucido(66, 142); c.fill();
      c.globalAlpha = 0.8;
      ciocche(c, forma, 6, (i) => {
        const x0 = CX + s * (52 + i * 4), y0 = 72 + i * 2;
        c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + s * 5, y0 + 22, x0 - s * 2, y0 + 44, x0 + s * (4 + i), 142);
        tratto(c, i % 2 ? scuro(H, 0.45) : L, i % 2 ? 1.4 : 2);
      });
      c.globalAlpha = 1;
      forma(); tratto(c, CONT, 3);
    }
    cima(); c.fillStyle = lucido(4, 104); c.fill();
    c.globalAlpha = 0.8;
    ciocche(c, cima, 15, (i) => {
      // le ciocche partono dalla fronte e vanno indietro, aprendosi verso i lati
      const x0 = CX - 52 + i * 7.4, y0 = 66 - Math.sin((i / 14) * Math.PI) * 6;
      c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 - 3, y0 - 24, x0 + (x0 - CX) * 0.35, 26, x0 + (x0 - CX) * 0.55, 10);
      tratto(c, i % 3 === 0 ? scuro(H, 0.45) : L, i % 3 === 0 ? 1.7 : 2.4);
    });
    c.globalAlpha = 1;
    // riflessi chiari del sole sulla cima
    c.beginPath(); c.moveTo(CX - 34, 28); c.quadraticCurveTo(CX - 10, 16, CX + 20, 22); tratto(c, alfa(chiaro(L, 0.3), 0.45), 3.5);
    c.beginPath(); c.moveTo(CX + 30, 30); c.quadraticCurveTo(CX + 44, 38, CX + 50, 54); tratto(c, alfa(chiaro(L, 0.3), 0.3), 2.5);
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

  // --- capelli delle ragazze della disco ---
  const lucido = (y0, y1) => gradL(c, 0, y0, 0, y1, [[0, chiaro(H, 0.18)], [0.45, H], [1, scuro(H, 0.28)]]);
  const riflesso = (y) => { c.beginPath(); c.moveTo(CX - 34, y + 6); c.quadraticCurveTo(CX - 6, y - 6, CX + 26, y); tratto(c, 'rgba(255,255,255,0.22)', 4); };
  if (['lunghi', 'caschetto', 'ricciLunghi'].includes(p.stile)) {
    const bob = p.stile === 'caschetto', ricci = p.stile === 'ricciLunghi', fine = bob ? 158 : 206, r = casuale(fase === 'dietro' ? 61 : 67);
    if (fase === 'dietro') {
      if (ricci) {
        // tanti riccioli attorno alla testa e giù fino alle spalle
        const cerchi = [];
        for (let i = 0; i <= 14; i++) { const th = ((170 + (i / 14) * 200) * Math.PI) / 180; cerchi.push([CX + Math.cos(th) * 60, 92 + Math.sin(th) * 58, 15 + r() * 4]); }
        for (const sx of [-1, 1]) for (let y = 104; y <= fine; y += 12) cerchi.push([CX + sx * (58 + r() * 10 + (y - 100) * 0.08), y, 12 + r() * 4]);
        for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr + 2.6, rr + 2.6); c.fillStyle = CONT; c.fill(); }
        for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr, rr); c.fillStyle = H; c.fill(); }
        ellisse(c, CX, 88, 60, 52); c.fillStyle = H; c.fill();
        c.globalAlpha = 0.85;
        for (const [x, y, rr] of cerchi) for (let k = 0; k < 3; k++) {
          const a = r() * 6.28; c.beginPath(); c.arc(x + (r() - 0.5) * rr, y + (r() - 0.5) * rr, 3 + r() * 3, a, a + 3.6); tratto(c, L, 1.7);
        }
        c.globalAlpha = 1;
        return;
      }
      const massa = () => {
        const W = bob ? 70 : 82;   // i capelli lunghi si allargano sulle spalle
        c.beginPath(); c.moveTo(CX - 60, 76);
        c.bezierCurveTo(CX - 62, 14, CX + 62, 14, CX + 60, 76);
        c.bezierCurveTo(CX + 70, 110, CX + W, fine - 40, CX + W, fine);
        if (bob) {
          c.quadraticCurveTo(CX + 54, fine + 8, CX + 40, fine - 4); c.lineTo(CX - 40, fine - 4); c.quadraticCurveTo(CX - 54, fine + 8, CX - W, fine);
        } else {
          for (let i = 1; i <= 5; i++) { const x = CX + W - i * 6; c.quadraticCurveTo(x + 3, fine + 9, x, fine + 1); }
          c.lineTo(CX + 40, 160); c.lineTo(CX - 40, 160); c.lineTo(CX - W + 30, fine + 1);
          for (let i = 4; i >= 0; i--) { const x = CX - W + i * 6; c.quadraticCurveTo(x + 3, fine + 9, x, fine + 1); }
        }
        c.bezierCurveTo(CX - W, fine - 40, CX - 70, 110, CX - 60, 76); c.closePath();
      };
      massa(); c.fillStyle = gradL(c, 0, 20, 0, fine + 8, [[0, scuro(H, 0.06)], [1, scuro(H, 0.32)]]); c.fill();
      c.globalAlpha = 0.6;
      ciocche(c, massa, 12, (i) => { const x0 = CX - 78 + i * 14; c.beginPath(); c.moveTo(x0 * 0.8 + CX * 0.2, 40); c.bezierCurveTo(x0, 100, x0 + (x0 - CX) * 0.1, 150, x0 + (x0 - CX) * 0.12, fine + 8); tratto(c, i % 2 ? scuro(H, 0.4) : L, 1.6); });
      c.globalAlpha = 1;
      massa(); tratto(c, CONT, 3);
      return;
    }
    // davanti: la calotta con la frangia (di lato, dritta o a riccioli) e due bande ai lati del viso
    const banda = (sx) => () => {
      const fb = fine - (bob ? 2 : 10);
      c.beginPath(); c.moveTo(CX + sx * 47, 78);
      c.bezierCurveTo(CX + sx * 58, 100, CX + sx * 58, 130, CX + sx * 56, fb);
      if (bob) c.quadraticCurveTo(CX + sx * 66, fb + 8, CX + sx * 74, fb - 4);
      else for (let i = 1; i <= 3; i++) { const x = CX + sx * (56 + i * 5.5); c.quadraticCurveTo(x - sx * 2, fb + 9, x, fb + 1); }
      c.bezierCurveTo(CX + sx * 76, fb - 34, CX + sx * 74, 100, CX + sx * 66, 80);
      c.bezierCurveTo(CX + sx * 62, 72, CX + sx * 54, 70, CX + sx * 47, 78);
      c.closePath();
    };
    for (const sx of [-1, 1]) {
      const forma = banda(sx);
      if (ricci) {
        for (let y = 84; y < fine - 6; y += 12) { const x = CX + sx * (62 + r() * 4); ellisse(c, x, y, 10.5, 10.5); c.fillStyle = CONT; c.fill(); ellisse(c, x, y, 8, 8); c.fillStyle = H; c.fill(); c.beginPath(); c.arc(x, y, 4, r() * 6, r() * 6 + 3.5); tratto(c, L, 1.6); }
        continue;
      }
      forma(); c.fillStyle = lucido(70, fine); c.fill();
      c.globalAlpha = 0.75;
      ciocche(c, forma, 5, (i) => { const x0 = CX + sx * (52 + i * 4.5); c.beginPath(); c.moveTo(x0, 78); c.bezierCurveTo(x0 + sx * 4, 110, x0 - sx * 2, 140, x0 + sx * 3, fine + 6); tratto(c, i % 2 ? scuro(H, 0.4) : L, i % 2 ? 1.3 : 1.9); });
      c.globalAlpha = 1;
      forma(); tratto(c, CONT, 3);
    }
    if (ricci) {
      const cerchi = [];
      for (let i = 0; i < 8; i++) { const k = (i - 3.5) / 3.5; cerchi.push([CX + k * 48, 66 + k * k * 12 + (r() - 0.5) * 4, 11 + r() * 3]); }
      c.save(); c.beginPath(); c.rect(0, 0, 192, 68); c.clip(); sagomaTesta(c, p.faccia); c.fillStyle = H; c.fill(); c.restore();
      for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr + 2.6, rr + 2.6); c.fillStyle = CONT; c.fill(); }
      for (const [x, y, rr] of cerchi) { ellisse(c, x, y, rr, rr); c.fillStyle = H; c.fill(); c.beginPath(); c.arc(x, y, rr * 0.5, r() * 6, r() * 6 + 3.6); tratto(c, L, 1.7); }
      return;
    }
    const cima = () => {
      c.beginPath(); c.moveTo(CX - 56, 108);
      if (bob) {
        c.lineTo(CX - 52, 84);
        for (let i = 0; i <= 8; i++) { const x = CX - 52 + i * 13; c.quadraticCurveTo(x - 6.5, 88, x, 82); }
        c.lineTo(CX + 56, 106);
      } else {
        c.bezierCurveTo(CX - 50, 84, CX - 30, 82, CX - 8, 74);
        c.bezierCurveTo(CX + 12, 68, CX + 34, 62, CX + 50, 78);
        c.bezierCurveTo(CX + 55, 86, CX + 56, 96, CX + 56, 106);
      }
      c.bezierCurveTo(CX + 76, 72, CX + 66, 16, CX, 14);
      c.bezierCurveTo(CX - 66, 16, CX - 76, 72, CX - 56, 108);
      c.closePath();
    };
    cima(); c.fillStyle = lucido(14, 100); c.fill();
    c.globalAlpha = 0.75;
    ciocche(c, cima, 14, (i) => {
      const x0 = CX - 54 + i * 8.2;
      c.beginPath(); c.moveTo(x0 + (bob ? 0 : 10), bob ? 86 : 80); c.bezierCurveTo(x0, 60, x0 + (x0 - CX) * 0.3, 30, x0 + (x0 - CX) * 0.5, 14);
      tratto(c, i % 3 === 0 ? scuro(H, 0.4) : L, i % 3 === 0 ? 1.5 : 2.2);
    });
    c.globalAlpha = 1;
    riflesso(28);
    cima(); tratto(c, CONT, 3);
    return;
  }

  if (p.stile === 'coda' || p.stile === 'chignon') {
    // tirati indietro: la coda (o lo chignon) dietro la testa, davanti una calotta liscia con la riga
    if (fase === 'dietro') {
      if (p.stile === 'coda') {
        const coda = () => {
          c.beginPath(); c.moveTo(CX + 34, 34);
          c.bezierCurveTo(CX + 84, 36, CX + 90, 100, CX + 74, 156);
          c.lineTo(CX + 70, 148); c.lineTo(CX + 66, 160); c.lineTo(CX + 62, 146);
          c.bezierCurveTo(CX + 70, 104, CX + 66, 62, CX + 30, 54); c.closePath();
        };
        coda(); c.fillStyle = lucido(30, 160); c.fill();
        c.globalAlpha = 0.7;
        ciocche(c, coda, 5, (i) => { c.beginPath(); c.moveTo(CX + 40, 40 + i * 3); c.bezierCurveTo(CX + 76 + i, 50, CX + 80 - i * 2, 100, CX + 66 + i * 2, 156); tratto(c, i % 2 ? scuro(H, 0.4) : L, 1.8); });
        c.globalAlpha = 1;
        coda(); tratto(c, CONT, 3);
        ellisse(c, CX + 42, 44, 7, 8, 0.6); c.fillStyle = '#ff6aa8'; c.fill(); tratto(c, CONT, 2.4);   // l'elastico
      } else {
        ellisse(c, CX, 22, 23, 19); c.fillStyle = lucido(2, 42); c.fill(); tratto(c, CONT, 3);
        for (const a of [0, 2.1, 4.2]) { c.beginPath(); c.arc(CX, 22, 12, a, a + 1.8); tratto(c, L, 2); }
        c.beginPath(); c.moveTo(CX - 26, 8); c.lineTo(CX + 22, 30); tratto(c, CONT, 4); tratto(c, '#e8c048', 2);   // la forcina
      }
      return;
    }
    const calotta = () => {
      c.beginPath(); c.moveTo(CX - 55, 106);
      c.bezierCurveTo(CX - 54, 80, CX - 38, 66, CX - 6, 64);
      c.bezierCurveTo(CX + 30, 64, CX + 52, 74, CX + 55, 106);
      c.bezierCurveTo(CX + 70, 70, CX + 62, 24, CX, 24);
      c.bezierCurveTo(CX - 62, 24, CX - 70, 70, CX - 55, 106);
      c.closePath();
    };
    calotta(); c.fillStyle = lucido(24, 100); c.fill();
    c.globalAlpha = 0.75;
    ciocche(c, calotta, 14, (i) => {
      const x0 = CX - 52 + i * 8;
      c.beginPath(); c.moveTo(x0, 70 + Math.abs(x0 - CX) * 0.2); c.quadraticCurveTo(x0 + (x0 - CX) * 0.1, 44, CX + (x0 - CX) * 0.4 + (p.stile === 'coda' ? 20 : 0), 26);
      tratto(c, i % 3 === 0 ? scuro(H, 0.4) : L, i % 3 === 0 ? 1.5 : 2.1);
    });
    c.globalAlpha = 1;
    c.beginPath(); c.moveTo(CX - 6, 64); c.quadraticCurveTo(CX - 8, 44, CX - 2, 26); tratto(c, scuro(H, 0.45), 1.6);   // la riga
    riflesso(34);
    calotta(); tratto(c, CONT, 3);
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

  if (p.stile === 'spuntato') {
    // corti, con la frangia tirata su a punte col gel (il Petri)
    if (fase === 'dietro') return;
    const forma = () => {
      c.beginPath(); c.moveTo(38, 108);
      c.bezierCurveTo(30, 80, 36, 56, 52, 44);
      [[56, 30], [68, 38], [76, 20], [90, 32], [102, 16], [113, 31], [126, 22], [131, 38], [144, 36]].forEach(([x, y]) => c.lineTo(x, y));
      c.bezierCurveTo(158, 54, 162, 82, 155, 108);
      c.lineTo(148, 96);
      c.quadraticCurveTo(147, 80, 137, 74);
      [[126, 80], [116, 69], [105, 78], [94, 67], [83, 76], [72, 68], [62, 76], [53, 73]].forEach(([x, y]) => c.lineTo(x, y));
      c.quadraticCurveTo(44, 84, 45, 98);
      c.closePath();
    };
    forma(); c.fillStyle = sfum(16, 100); c.fill();
    c.globalAlpha = 0.7;
    ciocche(c, forma, 12, (i) => {
      const x0 = 50 + i * 8.8;
      c.beginPath(); c.moveTo(x0, 76); c.quadraticCurveTo(x0 - 2, 48, x0 + 6, 24);
      tratto(c, i % 3 === 0 ? scuro(H, 0.45) : L, i % 3 === 0 ? 1.6 : 2.2);
    });
    c.globalAlpha = 1;
    c.beginPath(); c.moveTo(70, 44); c.quadraticCurveTo(96, 30, 128, 40); tratto(c, 'rgba(255,255,255,0.16)', 4);   // il gel luccica
    forma(); tratto(c, CONT, 3);
    return;
  }

  if (p.stile === 'sfumato') {
    // il Boni: lati e nuca sfumati quasi a zero (l'ombra dei capelli cortissimi, che si schiarisce
    // scendendo verso le orecchie), sopra corti e un po' mossi, con la frangia a ciuffetti
    if (fase === 'dietro') return;
    const f = p.faccia, LG = f.larg;
    c.save();
    sagomaTesta(c, f); c.clip();
    c.beginPath(); c.moveTo(CX - LG - 4, 112);
    c.bezierCurveTo(CX - LG - 6, 30, CX + LG + 6, 30, CX + LG + 4, 112);
    c.lineTo(CX + LG - 7, 106);
    c.bezierCurveTo(CX + LG - 9, 84, CX + 34, 72, CX, 71);
    c.bezierCurveTo(CX - 34, 72, CX - LG + 9, 84, CX - LG + 7, 106);
    c.closePath();
    c.fillStyle = gradL(c, 0, 58, 0, 112, [[0, alfa(H, 0.9)], [0.5, alfa(H, 0.55)], [1, alfa(H, 0.08)]]); c.fill();
    c.clip();
    const r0 = casuale(12);
    c.fillStyle = alfa(H, 0.35);
    for (let i = 0; i < 220; i++) { ellisse(c, CX - LG + r0() * LG * 2, 60 + r0() * 50, 0.7, 0.7); c.fill(); }
    c.restore();
    const forma = () => {
      c.beginPath(); c.moveTo(CX - LG + 7, 84);
      c.bezierCurveTo(CX - LG + 1, 52, CX - 30, 29, CX, 28);
      c.bezierCurveTo(CX + 30, 29, CX + LG - 1, 52, CX + LG - 7, 84);
      [[CX + 41, 73], [CX + 32, 79], [CX + 23, 69], [CX + 13, 76], [CX + 3, 66], [CX - 7, 74], [CX - 17, 67], [CX - 27, 75], [CX - 37, 71]].forEach(([x, y]) => c.lineTo(x, y));
      c.closePath();
    };
    forma(); c.fillStyle = sfum(26, 86); c.fill();
    const r = casuale(11);
    c.globalAlpha = 0.6;
    ciocche(c, forma, 70, () => {
      const x = CX - LG + r() * LG * 2, y = 30 + r() * 44;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - 4, x + 6, y - 1); tratto(c, L, 1.5);
    });
    c.globalAlpha = 1;
    forma(); tratto(c, CONT, 3);
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
    if (p.tempie) {
      // brizzolati: i lati e le tempie grigi (tempie = il colore), sempre più verso le orecchie
      c.save(); forma(); c.clip();
      for (const s of [-1, 1]) {
        c.fillStyle = gradL(c, CX + s * 28, 0, CX + s * 60, 0, [[0, alfa(p.tempie, 0)], [1, alfa(p.tempie, 0.9)]]);
        c.fillRect(s < 0 ? 0 : CX + 28, 58, 68, 60);
      }
      c.restore();
    }
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

// cappelli: basco militare, piegato da un lato, con lo stemma; bandana da motociclista
function cappello(c, p) {
  const k = p.cappello;
  if (k.tipo === 'bandana') {
    // copre la testa fino a metà fronte, annodata di lato con le due code che pendono
    const f = p.faccia, L = f.larg, y0 = f.top + 37;
    for (const [dx, dy] of [[19, 30], [27, 15]]) {
      poli(c, [[CX + L - 3, y0 - 5], [CX + L + dx + 5, y0 + dy - 7], [CX + L + dx - 2, y0 + dy + 4]]); c.fillStyle = scuro(k.colore, 0.05); c.fill(); tratto(c, CONT, 2.6);
    }
    const forma = () => {
      c.beginPath(); c.moveTo(CX - L - 3, y0 + 3);
      c.bezierCurveTo(CX - L - 7, f.top - 4, CX - 36, f.top - 13, CX, f.top - 13);
      c.bezierCurveTo(CX + 36, f.top - 13, CX + L + 7, f.top - 4, CX + L + 3, y0 + 3);
      c.quadraticCurveTo(CX, y0 - 12, CX - L - 3, y0 + 3);
      c.closePath();
    };
    forma(); c.fillStyle = gradR(c, CX - 14, f.top + 2, 4, 76, [[0, chiaro(k.colore, 0.2)], [1, k.colore]]); c.fill();
    if (k.fantasia) {
      // pallini e goccioline, alla buona
      c.save(); forma(); c.clip();
      const r = casuale(47);
      for (let i = 0; i < 26; i++) { const x = CX - L + r() * L * 2, y = f.top - 10 + r() * 46; ellisse(c, x, y, i % 3 ? 1.5 : 2.6, i % 3 ? 1.5 : 1.7, r() * 3); c.fillStyle = alfa(k.fantasia, 0.8); c.fill(); }
      c.restore();
    }
    forma(); tratto(c, CONT, 3);
    c.beginPath(); c.moveTo(CX - L, y0 - 4); c.quadraticCurveTo(CX, y0 - 18, CX + L, y0 - 4); tratto(c, 'rgba(255,255,255,0.16)', 2);   // l'orlo ripiegato
    ellisse(c, CX + L + 1, y0 - 2, 6.5, 7.5); c.fillStyle = chiaro(k.colore, 0.12); c.fill(); tratto(c, CONT, 2.6);                // il nodo
    return;
  }
  if (k.tipo === 'berretto') {
    // berretto con la visiera, calcato storto (Tini): la calotta copre la testa fino a metà
    // fronte, la visiera sporge di lato. Lo stemma è inventato: una stellina.
    const f = p.faccia, L = f.larg, y0 = f.top + 26;
    c.save(); c.translate(CX, f.top + 12); c.rotate(-0.17); c.translate(-CX, -(f.top + 12));
    c.beginPath(); c.moveTo(CX - L + 8, y0 - 8); c.quadraticCurveTo(CX - L - 30, y0 - 8, CX - L - 48, y0 + 9);
    c.quadraticCurveTo(CX - L - 22, y0 + 17, CX - L + 16, y0 + 8); c.closePath();
    c.fillStyle = scuro(k.colore, 0.3); c.fill(); tratto(c, CONT, 3);
    const calotta = () => {
      c.beginPath(); c.moveTo(CX - L - 4, y0 + 4);
      c.bezierCurveTo(CX - L - 9, f.top - 12, CX - 34, f.top - 25, CX, f.top - 25);
      c.bezierCurveTo(CX + 36, f.top - 25, CX + L + 10, f.top - 10, CX + L + 5, y0 + 2);
      c.quadraticCurveTo(CX, y0 - 10, CX - L - 4, y0 + 4);
      c.closePath();
    };
    calotta(); c.fillStyle = gradR(c, CX - 12, f.top - 6, 4, 82, [[0, chiaro(k.colore, 0.24)], [1, k.colore]]); c.fill();
    c.save(); calotta(); c.clip();
    for (const dx of [-27, 0, 27]) { c.beginPath(); c.moveTo(CX, f.top - 25); c.quadraticCurveTo(CX + dx * 1.3, f.top - 4, CX + dx * 1.55, y0 + 6); tratto(c, 'rgba(255,255,255,0.15)', 1.4); }   // le cuciture degli spicchi
    c.restore();
    calotta(); tratto(c, CONT, 3);
    ellisse(c, CX, f.top - 24, 4.2, 2.8); c.fillStyle = chiaro(k.colore, 0.25); c.fill(); tratto(c, CONT, 1.6);                // il bottoncino in cima
    if (k.stemma) {
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 3 : 7; c.lineTo(CX + 12 + Math.cos(a) * rr, f.top + 1 + Math.sin(a) * rr); }
      c.closePath(); c.fillStyle = k.stemma; c.fill(); tratto(c, scuro(k.stemma, 0.45), 1);
    }
    c.restore();
    return;
  }
  if (k.tipo === 'visiera') {
    // il berretto rigido con la visiera (i finanzieri): la calotta grigia larga e dritta, la fascia
    // più scura col soggolo dorato intrecciato, la visiera nera lucida e, davanti, la fiamma dorata
    const f = p.faccia, L = f.larg, yb = f.top + 27;
    const calotta = () => {
      c.beginPath(); c.moveTo(CX - L - 2, yb + 2);
      c.bezierCurveTo(CX - L - 8, yb - 12, CX - L - 18, f.top - 4, CX - L - 12, f.top - 12);
      c.quadraticCurveTo(CX, f.top - 32, CX + L + 12, f.top - 12);
      c.bezierCurveTo(CX + L + 18, f.top - 4, CX + L + 8, yb - 12, CX + L + 2, yb + 2);
      c.closePath();
    };
    calotta(); c.fillStyle = gradL(c, 0, f.top - 26, 0, yb, [[0, chiaro(k.colore, 0.16)], [1, scuro(k.colore, 0.12)]]); c.fill(); tratto(c, CONT, 3);
    c.beginPath(); c.moveTo(CX - L - 8, f.top - 10); c.quadraticCurveTo(CX, f.top - 27, CX + L + 8, f.top - 10); tratto(c, 'rgba(255,255,255,0.18)', 2);   // il bordo della calotta
    rrect(c, CX - L - 3, yb, L * 2 + 6, 16, 3); c.fillStyle = gradL(c, 0, yb, 0, yb + 16, [[0, scuro(k.colore, 0.3)], [1, scuro(k.colore, 0.42)]]); c.fill(); tratto(c, CONT, 2.4);
    // il soggolo: un cordone dorato intrecciato, da un bottoncino all'altro
    const cordone = (y) => { c.beginPath(); c.moveTo(CX - L + 1, y); c.quadraticCurveTo(CX, y + 1.5, CX + L - 1, y); };
    for (const y of [yb + 5, yb + 10.5]) { cordone(y); tratto(c, scuro(k.fregio, 0.45), 4.4); cordone(y); tratto(c, k.fregio, 3); c.setLineDash([2.2, 1.6]); cordone(y); tratto(c, chiaro(k.fregio, 0.5), 1.4); c.setLineDash([]); }
    for (const s of [-1, 1]) { ellisse(c, CX + s * (L - 1), yb + 8, 3.4, 3.4); c.fillStyle = k.fregio; c.fill(); tratto(c, scuro(k.fregio, 0.5), 1.2); }
    // la visiera
    const vis = () => { c.beginPath(); c.moveTo(CX - L + 2, yb + 14); c.quadraticCurveTo(CX, yb + 31, CX + L - 2, yb + 14); c.quadraticCurveTo(CX, yb + 20, CX - L + 2, yb + 14); c.closePath(); };
    vis(); c.fillStyle = gradL(c, 0, yb + 14, 0, yb + 30, [[0, '#2a2c32'], [1, '#0c0d10']]); c.fill(); tratto(c, CONT, 2.4);
    c.beginPath(); c.moveTo(CX - L * 0.55, yb + 19.5); c.quadraticCurveTo(CX - L * 0.2, yb + 24, CX + L * 0.1, yb + 23.5); tratto(c, 'rgba(255,255,255,0.32)', 1.6);
    // la fiamma: la granata (una pallina) con le lingue di fuoco sopra, dorata
    const fx = CX, fy = f.top + 9;
    ellisse(c, fx, fy + 7, 6, 6); c.fillStyle = gradR(c, fx - 2, fy + 5, 0.5, 7, [[0, chiaro(k.fregio, 0.55)], [1, k.fregio]]); c.fill(); tratto(c, scuro(k.fregio, 0.5), 1.2);
    c.beginPath(); c.moveTo(fx - 5, fy + 3);
    c.quadraticCurveTo(fx - 9, fy - 6, fx - 4, fy - 13); c.quadraticCurveTo(fx - 3, fy - 6, fx - 1, fy - 5);
    c.quadraticCurveTo(fx - 2, fy - 13, fx + 2, fy - 20); c.quadraticCurveTo(fx + 3, fy - 10, fx + 4, fy - 7);
    c.quadraticCurveTo(fx + 6, fy - 11, fx + 8, fy - 13); c.quadraticCurveTo(fx + 9, fy - 4, fx + 5, fy + 3); c.closePath();
    c.fillStyle = gradL(c, 0, fy - 20, 0, fy + 3, [[0, chiaro(k.fregio, 0.45)], [1, k.fregio]]); c.fill(); tratto(c, scuro(k.fregio, 0.5), 1.2);
    return;
  }
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
  if (o.inFronte) {
    // tirati su sulla fronte, un po' più piccoli
    c.save(); c.translate(CX, 77); c.scale(0.86, 0.86); c.translate(-CX, -113);
    montatura(c, o);
    c.restore();
    return;
  }
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
// cappuccio della felpa tirato su (il travestimento): dietro la testa e, davanti, il bordo sulla fronte
function cappuccio(c, p, fase) {
  const f = p.faccia, K = p.cappuccio, L = f.larg;
  if (fase === 'dietro') {
    c.beginPath(); c.moveTo(CX - L - 14, 176);
    c.bezierCurveTo(CX - L - 30, 110, CX - L - 12, 10, CX, 8);
    c.bezierCurveTo(CX + L + 12, 10, CX + L + 30, 110, CX + L + 14, 176);
    c.quadraticCurveTo(CX, 196, CX - L - 14, 176); c.closePath();
    c.fillStyle = gradL(c, 0, 8, 0, 190, [[0, chiaro(K, 0.08)], [1, scuro(K, 0.3)]]); c.fill(); tratto(c, CONT, 3);
    return;
  }
  const bordo = () => {
    c.beginPath(); c.moveTo(CX - L - 10, 150);
    c.bezierCurveTo(CX - L - 12, 60, CX - 30, f.top - 14, CX, f.top - 14);
    c.bezierCurveTo(CX + 30, f.top - 14, CX + L + 12, 60, CX + L + 10, 150);
    c.lineTo(CX + L - 2, 150);
    c.bezierCurveTo(CX + L - 2, 74, CX + 26, f.top + 8, CX, f.top + 8);
    c.bezierCurveTo(CX - 26, f.top + 8, CX - L + 2, 74, CX - L + 2, 150);
    c.closePath();
  };
  bordo(); c.fillStyle = gradL(c, 0, f.top - 14, 0, 150, [[0, chiaro(K, 0.15)], [1, scuro(K, 0.12)]]); c.fill(); tratto(c, CONT, 3);
  // i cordini
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(CX + s * 30, 150); c.quadraticCurveTo(CX + s * 34, 172, CX + s * 28, 192); tratto(c, CONT, 3.4); tratto(c, '#f2f2f2', 1.8); }
}

// cuffie sopra la testa (Giorgio che si fa scarrozzare)
function cuffie(c, p) {
  const L = p.faccia.larg;
  c.beginPath(); c.moveTo(CX - L - 4, 112); c.bezierCurveTo(CX - L - 8, 10, CX + L + 8, 10, CX + L + 4, 112);
  tratto(c, CONT, 11); tratto(c, '#e8463a', 7);
  for (const s of [-1, 1]) {
    rrect(c, CX + s * (L + 4) - 11, 100, 22, 36, 9); c.fillStyle = '#2a2a33'; c.fill(); tratto(c, CONT, 3);
    rrect(c, CX + s * (L + 4) - 6, 106, 12, 24, 5); c.fillStyle = '#e8463a'; c.fill();
  }
}

export function disegnaTesta(c, p, espr = 'normale', o = {}) {
  const strato = o.strato ?? 'tutto';
  const conBarba = !o.senzaBarba;
  if (strato !== 'top') {
    if (p.cappuccio) cappuccio(c, p, 'dietro');
    else capelli(c, p, 'dietro', o);
    orecchie(c, p);
    pelleTesta(c, p);
    if (p.chiazze || p.segnoOcchiali) scottatura(c, p);
    if (p.gote) gote(c, p);
    if (espr === 'rabbia') furia(c, p);
    if (p.anziano) rughe(c, p);
    if (conBarba && p.barba !== 'piena') barba(c, p);
    for (const s of [-1, 1]) { occhio(c, p, s, espr); if (!p.sopraDavanti) sopracciglio(c, p, s, espr); }
    if (conBarba && p.barba === 'piena') barba(c, p);
  }
  if (strato !== 'base') { naso(c, p, espr); bocca(c, p, espr); }
  if (strato !== 'top') {
    capelli(c, p, 'davanti', o);
    if (p.cappuccio) cappuccio(c, p, 'davanti');
    if (p.cuffie) cuffie(c, p);
    if (p.orecchini) orecchini(c, p);
    if (p.cappello) cappello(c, p);
    // sopracciglia sopra la frangia, se no le espressioni non si vedono
    if (p.sopraDavanti) for (const s of [-1, 1]) sopracciglio(c, p, s, espr);
    lacrime(c, espr);
    // il sudore di chi è stato beccato (Michele, quando non batte lo scontrino)
    if (p.sudore) { goccia(c, CX - 52, 86, 5.5); goccia(c, CX + 55, 98, 5); goccia(c, CX + 46, 70, 3.8); }
    if (p.occhiali) occhiali(c, p, espr);
    if (p.travestimento) travestimento(c, p);
  }
  if (o.corona) corona(c, o);
}

// Le guance rosse di chi ha bevuto (p.gote = quanto, da 0 a 1): le facce da sbronza del beer pong.
// Stanno sotto barba e occhiali, sugli zigomi.
function gote(c, p) {
  for (const s of [-1, 1]) {
    const x = CX + s * 41, y = 137;
    ellisse(c, x, y, 14, 9.5, s * 0.15);
    c.fillStyle = gradR(c, x, y, 1, 14, [[0, `rgba(226,58,56,${0.7 * p.gote})`], [0.6, `rgba(226,58,56,${0.42 * p.gote})`], [1, 'rgba(226,58,56,0)']]);
    c.fill();
  }
}

// Il travestimento del "doppione" (chi gioca contro se stesso): gli occhiali finti col nasone,
// le sopracciglia e i baffoni attaccati. Sta sopra a tutto, qualunque faccia ci sia sotto.
function travestimento(c, p) {
  const y = 112, nero = '#15131a';
  for (const s of [-1, 1]) {      // le stanghette, fino alle orecchie
    c.beginPath(); c.moveTo(CX + s * 44, y - 3); c.lineTo(CX + s * (p.faccia.larg + 2), y - 6); tratto(c, CONT, 6); tratto(c, nero, 3.2);
  }
  for (const s of [-1, 1]) {      // le lenti tonde, col riflesso
    const lente = () => ellisse(c, CX + s * 26, y, 19, 17);
    lente(); c.fillStyle = 'rgba(210,232,255,0.3)'; c.fill();
    c.save(); lente(); c.clip();
    poli(c, [[CX + s * 26 - 9, y - 18], [CX + s * 26 - 3, y - 18], [CX + s * 26 - 13, y + 18], [CX + s * 26 - 19, y + 18]]); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill();
    c.restore();
    lente(); tratto(c, CONT, 8); lente(); tratto(c, nero, 4.6);
    // le sopracciglia finte, folte, sopra la montatura
    c.beginPath(); c.moveTo(CX + s * 10, y - 22); c.quadraticCurveTo(CX + s * 28, y - 34, CX + s * 46, y - 19); tratto(c, CONT, 11); tratto(c, nero, 7.5);
  }
  c.beginPath(); c.moveTo(CX - 8, y - 6); c.quadraticCurveTo(CX, y - 12, CX + 8, y - 6); tratto(c, CONT, 7.5); tratto(c, nero, 4.2);      // il ponte
  // il nasone di plastica
  ellisse(c, CX, y + 21, 13.5, 17); c.fillStyle = gradR(c, CX - 4, y + 14, 2, 18, [[0, '#ffd2bd'], [1, '#f0a184']]); c.fill(); tratto(c, CONT, 3);
  ellisse(c, CX - 4.5, y + 13, 3.6, 5, -0.3); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
  // i baffoni
  const baffi = () => {
    c.beginPath(); c.moveTo(CX, y + 35);
    c.bezierCurveTo(CX + 9, y + 30, CX + 26, y + 31, CX + 35, y + 42); c.quadraticCurveTo(CX + 21, y + 49, CX, y + 43);
    c.quadraticCurveTo(CX - 21, y + 49, CX - 35, y + 42); c.bezierCurveTo(CX - 26, y + 31, CX - 9, y + 30, CX, y + 35);
    c.closePath();
  };
  baffi(); c.fillStyle = nero; c.fill(); tratto(c, CONT, 2.6);
  for (const s of [-1, 1]) for (const k of [8, 16, 24]) { c.beginPath(); c.moveTo(CX + s * k, y + 35); c.lineTo(CX + s * (k + 3), y + 44); tratto(c, 'rgba(255,255,255,0.14)', 1.2); }
}

// ------------------------------------------------------------
//  CORPO
// ------------------------------------------------------------
const POSE = {
  normale: [[33, 196], [43, 219], [40, 241]],
  felice: [[33, 195], [58, 185], [75, 150]],
  triste: [[33, 199], [39, 221], [37, 244]],
  shock: [[33, 196], [55, 207], [72, 190]],
  rabbia: [[33, 196], [62, 206], [78, 181]],   // pugni alzati
  calcio: [[33, 196], [52, 209], [64, 224]],   // braccia larghe, per l'equilibrio
  robot: [[33, 196], [54, 214], [60, 238]],    // braccia rigide e staccate dal corpo (scottato: guai a toccarsi)
  // un braccio diverso dall'altro: sx e dx; pollice = pollice in su sulla mano destra
  pollice: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [58, 208], [68, 184]], pollice: true },
  // in discoteca: il Manna che balla (due tempi), che si sistema la collanina indicando il
  // pubblico, che si tocca la collanina e basta, al telefono...
  balla1: { sx: [[33, 196], [56, 200], [66, 174]], dx: [[33, 196], [48, 216], [54, 236]] },
  balla2: { sx: [[33, 196], [48, 216], [54, 236]], dx: [[33, 196], [56, 200], [66, 174]] },
  // le mosse della sfida di ballo (L'Incubo degli Scapoli), come nei pittogrammi: braccia al cielo,
  // giù (le mani sulle ginocchia), a sinistra e a destra (un braccio teso in alto di lato, l'altro
  // che punta di traverso davanti al petto: la gamba di lato la mette o.calcio), battimani
  mossaSu: [[33, 196], [60, 164], [78, 114]],
  mossaGiu: [[33, 196], [56, 222], [30, 250]],
  mossaSx: { sx: [[33, 196], [60, 186], [84, 166]], dx: [[33, 196], [36, 222], [-8, 212]] },
  mossaDx: { sx: [[33, 196], [36, 222], [-8, 212]], dx: [[33, 196], [60, 186], [84, 166]] },
  mossaBatti: [[33, 196], [54, 218], [7, 200]],
  indica: { sx: [[33, 196], [30, 216], [5, 204]], dx: [[33, 196], [60, 196], [80, 184]] },
  collana: { sx: [[33, 196], [30, 216], [5, 204]], dx: [[33, 196], [43, 219], [40, 241]] },
  alTelefono: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [57, 188], [51, 152]] },
  // ...le ragazze, ognuna con la sua cosa nella mano destra, e il buttafuori che chiede i documenti
  spritz: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [52, 216], [58, 198]] },
  telefono: { sx: [[33, 196], [40, 220], [16, 216]], dx: [[33, 196], [40, 220], [14, 216]] },
  ventaglio: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [54, 210], [58, 188]] },
  foto: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [60, 192], [66, 160]] },
  balla: [[33, 195], [58, 187], [72, 158]],
  chiede: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [56, 208], [72, 206]] },
  // nel vialetto: le mani nei capelli (Emilio disperato) e le braccia avanti di chi porta un peso
  // (Pastaffi col cane in braccio). Con o.maniSopra le braccia si ridisegnano sopra la testa.
  maniInTesta: [[33, 196], [70, 168], [50, 84]],
  porta: [[33, 196], [44, 224], [20, 232]],
  // "La Spina del PowerStation": lo Zere che suona la vuvuzela (la mano destra alla guancia regge il
  // bocchino, il gomito in fuori; l'altra mano sul fianco)
  vuvuzela: { sx: [[33, 196], [58, 212], [44, 232]], dx: [[33, 196], [62, 196], [27, 140]] },
  // sul palco (i cantanti di "Provini a X-Factor"): il microfono davanti alla bocca, e "ti
  // indico" (il braccio destro teso di lato, col dito puntato: dito = true)
  microfono: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [53, 215], [27, 185]] },
  tiIndico: { sx: [[33, 196], [45, 216], [36, 232]], dx: [[33, 196], [60, 199], [87, 195]], dito: true },
  // i giudici: le mani sulle orecchie (o.maniSopra le ridisegna sopra la testa)
  orecchie: [[33, 196], [70, 176], [60, 122]],
  // il grande saggio (Denny, "Le Perle di Denny"): una mano sul petto, l'altra alzata col dito in su
  saggio: { sx: [[33, 196], [44, 224], [12, 204]], dx: [[33, 196], [58, 194], [62, 160]], dito: true },
  // "La pizza dal Boni": la pala tenuta dritta (la sinistra in basso sul manico), le mani a coppa
  // davanti alla bocca per gridare l'ordinazione (con o.maniSopra), la corsa a pugni stretti, la
  // caraffa alla bocca, la pala alzata sopra la testa per cacciare gli imbucati
  pala: { sx: [[33, 196], [30, 218], [6, 226]], dx: [[33, 196], [52, 214], [46, 190]] },
  grida: [[33, 196], [46, 184], [20, 158]],
  corre: { sx: [[33, 196], [54, 186], [60, 164]], dx: [[33, 196], [40, 220], [56, 236]] },
  beve: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [60, 192], [42, 164]] },
  caccia: { sx: [[33, 196], [48, 168], [42, 126]], dx: [[33, 196], [58, 166], [62, 124]] },
  // "La ballata del Pallaio" (Lori, il cantastorie): la mano sul cuore mentre canta, la bacchetta
  // alzata, il braccio teso che batte sulla vignetta, la mano che gratta la testa (confuso, con
  // o.maniSopra), l'inchino finale (un braccio che si allarga)
  cuore: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [44, 222], [10, 206]] },
  alza: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [60, 172], [74, 132]] },
  batte: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [62, 200], [88, 196]] },
  gratta: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [68, 168], [46, 92]] },
  inchino: { sx: [[33, 196], [30, 222], [10, 238]], dx: [[33, 196], [58, 212], [84, 226]] },
  // "Scontrino, prego!": Michele che batte alla cassa (il braccio teso verso i tasti), che taglia con
  // la mezzaluna a due mani, che tiene lo scontrino davanti al petto (per strapparlo), che fa il conto
  // a voce (la mano alzata: "lascia stare!"), che si mette i soldi in tasca; il Giso con la cartellina
  // sotto il braccio e la lente alzata
  cassa: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [60, 210], [86, 212]] },
  taglia: [[33, 196], [46, 220], [24, 230]],
  strappa: [[33, 196], [46, 214], [12, 202]],
  aVoce: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [62, 192], [80, 168]] },
  tasca: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [46, 222], [34, 240]] },
  conti: { sx: [[33, 196], [48, 220], [26, 228]], dx: [[33, 196], [62, 200], [72, 176]] },
  // i finanzieri: il saluto con la mano alla visiera (con o.maniSopra), il blocchetto delle multe
  saluto: { sx: [[33, 196], [43, 219], [40, 241]], dx: [[33, 196], [70, 172], [46, 98]] },
  blocchetto: { sx: [[33, 196], [44, 222], [14, 214]], dx: [[33, 196], [46, 222], [22, 206]] },
};

// la vuvuzela blu, disegnata lungo l'asse x: il bocchino in (0, 0), la campana in (L, 0). Un cono
// lungo e stretto che si apre solo in fondo; l'apertura della campana si vede di sbieco (un'ellisse)
export const BLU_VUVUZELA = '#1f6fe8';
export function vuvuzela(c, L) {
  const B = BLU_VUVUZELA;
  const forma = () => {
    c.beginPath(); c.moveTo(0, -2.8);
    c.lineTo(L * 0.7, -6.4); c.quadraticCurveTo(L * 0.9, -7.6, L, -17);
    c.lineTo(L, 17); c.quadraticCurveTo(L * 0.9, 7.6, L * 0.7, 6.4);
    c.lineTo(0, 2.8); c.closePath();
  };
  forma(); c.fillStyle = gradL(c, 0, -14, 0, 14, [[0, chiaro(B, 0.5)], [0.4, B], [1, scuro(B, 0.42)]]); c.fill(); tratto(c, CONT, 2.6);
  c.beginPath(); c.moveTo(5, -1.4); c.lineTo(L * 0.68, -4); tratto(c, 'rgba(255,255,255,0.6)', 1.5);     // il riflesso
  for (const k of [0.3, 0.5]) { c.beginPath(); c.moveTo(L * k, -2.8 - 3.6 * k / 0.7); c.lineTo(L * k, 2.8 + 3.6 * k / 0.7); tratto(c, scuro(B, 0.35), 1.6); }   // le giunture
  ellisse(c, L, 0, 4.6, 17); c.fillStyle = scuro(B, 0.5); c.fill(); tratto(c, CONT, 2.4);
  ellisse(c, L + 0.9, 0, 2.6, 11.5); c.fillStyle = '#0b1c40'; c.fill();
  rrect(c, -2, -3.8, 6, 7.6, 1.8); c.fillStyle = chiaro(B, 0.3); c.fill(); tratto(c, CONT, 1.6);           // il bocchino
}

// quello che un personaggio tiene in mano (x, y = la mano destra; p = il personaggio)
function accessorio(c, tipo, x, y, p) {
  if (tipo === 'microfono') {
    // microfono da palco: il manico passa nel pugno, la testa a retina sta verso la bocca
    const tx = x - 9, ty = y - 17;
    c.beginPath(); c.moveTo(x + 6, y + 13); c.lineTo(tx + 3, ty + 6); tratto(c, CONT, 8.6); tratto(c, '#2c2e3a', 5.4);
    ellisse(c, tx, ty, 9, 9); c.fillStyle = gradR(c, tx - 3, ty - 3, 1, 10, [[0, '#f4f6fa'], [0.55, '#aab0bc'], [1, '#6a6f7c']]); c.fill(); tratto(c, CONT, 2.4);
    c.save(); ellisse(c, tx, ty, 9, 9); c.clip();
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(tx - 10, ty + i * 4.2); c.lineTo(tx + 10, ty + i * 4.2 + 3); c.moveTo(tx + i * 4.2, ty - 10); c.lineTo(tx + i * 4.2 - 3, ty + 10); tratto(c, 'rgba(40,44,56,0.5)', 0.9); }
    c.restore();
    c.beginPath(); c.moveTo(tx - 6, ty + 6.5); c.lineTo(tx + 6.6, ty - 5.8); tratto(c, '#e23b4e', 2.2);    // la fascetta colorata
    // il pugno torna sopra al manico
    if (p) { ellisse(c, x, y, 9, 9); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3); }
    return;
  }
  if (tipo === 'vuvuzela') {
    // la vuvuzela BLU dello Zere. Con la mano vicino alla bocca la suona: il bocchino è sulle labbra
    // e la tromba va di lato verso l'alto, passando per il pugno. Se no la tiene in pugno dritta in
    // su, come una fiaccola (un po' più dritta se ha il braccio alzato, così resta nel disegno)
    const bx = CX + 4, by = 158, suona = Math.hypot(x - bx, y - by) < 45;
    const a = suona ? Math.atan2(y - by, x - bx) : y < 200 ? -1.42 : -1.2, L = suona ? 92 : 84;
    const [ax, ay] = suona ? [bx, by] : [x - 14 * Math.cos(a), y - 14 * Math.sin(a)];
    c.save(); c.translate(ax, ay); c.rotate(a); vuvuzela(c, L); c.restore();
    if (p) { ellisse(c, x, y, 9, 9); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3); }
    return;
  }
  if (tipo === 'birra') {
    // una pinta di bionda con la schiuma (gli avventori della Spina): il pugno la tiene in basso
    const vetro = () => { c.beginPath(); c.moveTo(x - 10, y - 32); c.lineTo(x + 10, y - 32); c.lineTo(x + 8, y + 8); c.lineTo(x - 8, y + 8); c.closePath(); };
    vetro(); c.fillStyle = 'rgba(235,245,255,0.6)'; c.fill();
    c.save(); vetro(); c.clip();
    c.fillStyle = gradL(c, 0, y - 26, 0, y + 8, [[0, '#ffc23a'], [1, '#e08a12']]); c.fillRect(x - 11, y - 26, 22, 35);
    c.fillStyle = '#fffbe8'; c.fillRect(x - 11, y - 33, 22, 8);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - 6, y - 23, 2.4, 27);
    c.restore();
    vetro(); tratto(c, CONT, 2);
    for (const [dx, r] of [[-6, 4.5], [0, 5.5], [6, 4.5]]) { ellisse(c, x + dx, y - 33, r, 3.6); c.fillStyle = '#fffbe8'; c.fill(); }
    if (p) { ellisse(c, x, y, 9, 9); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3); }
    return;
  }
  if (tipo === 'spritz') {
    // calice con lo spritz, la fetta d'arancia e la cannuccia
    c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x, y - 15); tratto(c, CONT, 3.4); tratto(c, '#eaf4ff', 1.6);
    const coppa = () => { c.beginPath(); c.moveTo(x - 10, y - 34); c.lineTo(x + 10, y - 34); c.quadraticCurveTo(x + 10, y - 16, x, y - 14); c.quadraticCurveTo(x - 10, y - 16, x - 10, y - 34); c.closePath(); };
    coppa(); c.fillStyle = 'rgba(235,245,255,0.75)'; c.fill();
    c.save(); coppa(); c.clip(); c.fillStyle = '#ff8a2e'; c.fillRect(x - 11, y - 29, 22, 16); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(x - 7, y - 28, 3, 11); c.restore();
    coppa(); tratto(c, CONT, 2);
    ellisse(c, x + 8, y - 34, 5, 5); c.fillStyle = '#ffb02e'; c.fill(); tratto(c, '#c8700c', 1.4);
    c.beginPath(); c.moveTo(x - 3, y - 20); c.lineTo(x - 8, y - 42); tratto(c, '#2f9a4a', 1.8);
  } else if (tipo === 'telefono' || tipo === 'foto' || tipo === 'cellulare') {
    // telefono: guardato a due mani, alzato per la foto (col flash), oppure all'orecchio
    const [px, py, a] = tipo === 'telefono' ? [CX - 1, 207, 0] : tipo === 'foto' ? [x - 1, y - 15, 0.12] : [x + 4, y - 4, -0.3];
    c.save(); c.translate(px, py); c.rotate(a);
    rrect(c, -8, -13, 16, 26, 3.5); c.fillStyle = '#22242c'; c.fill(); tratto(c, CONT, 2);
    if (tipo !== 'cellulare') { rrect(c, -6, -10.5, 12, 19, 1.5); c.fillStyle = tipo === 'telefono' ? '#bfe6ff' : '#3a3f4c'; c.fill(); }
    if (tipo === 'foto') {
      ellisse(c, -3, -7.5, 2.4, 2.4); c.fillStyle = '#0e0e12'; c.fill(); tratto(c, '#8a8e9a', 0.8);
      for (let i = 0; i < 8; i++) { const an = i * 0.785; c.beginPath(); c.moveTo(4 + Math.cos(an) * 3, -8 + Math.sin(an) * 3); c.lineTo(4 + Math.cos(an) * (i % 2 ? 6.5 : 9), -8 + Math.sin(an) * (i % 2 ? 6.5 : 9)); tratto(c, '#fff8c0', 1.5); }   // il flash
    }
    c.restore();
  } else if (tipo === 'pala' || tipo === 'palaAlta') {
    // la pala del pizzaiolo, di legno: dritta in mano (il manico scende verso l'altra mano) o
    // alzata sopra la testa, di traverso
    const alta = tipo === 'palaAlta';
    const [ax, ay, bx, by] = alta ? [x + 14, y - 2, x - 92, y + 8] : [x - 58, y + 40, x + 18, y - 30];
    const a = Math.atan2(by - ay, bx - ax);
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); tratto(c, CONT, 8.4); tratto(c, '#a8743a', 5);
    c.save(); c.translate(bx + Math.cos(a) * 16, by + Math.sin(a) * 16); c.rotate(a + Math.PI / 2);
    const pala = () => { c.beginPath(); c.moveTo(-8, 16); c.quadraticCurveTo(-17, 8, -17, -6); c.quadraticCurveTo(-17, -19, 0, -20); c.quadraticCurveTo(17, -19, 17, -6); c.quadraticCurveTo(17, 8, 8, 16); c.closePath(); };
    pala(); c.fillStyle = gradL(c, -17, 0, 17, 0, [[0, '#c48a46'], [0.5, '#dcab68'], [1, '#b67a38']]); c.fill(); tratto(c, CONT, 2.4);
    for (const k of [-8, 0, 8]) { c.beginPath(); c.moveTo(k, -16); c.lineTo(k * 0.8, 12); tratto(c, 'rgba(120,70,30,0.35)', 1); }
    c.restore();
    if (p) { ellisse(c, x, y, 9, 9); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3); }
    return;
  } else if (tipo === 'caraffa') {
    // la caraffa del vino, inclinata verso la bocca
    c.save(); c.translate(x - 2, y - 6); c.rotate(-1.05);
    const vetro = () => { c.beginPath(); c.moveTo(-5, -26); c.lineTo(5, -26); c.lineTo(5, -14); c.quadraticCurveTo(14, -8, 13, 6); c.quadraticCurveTo(12, 16, 0, 16); c.quadraticCurveTo(-12, 16, -13, 6); c.quadraticCurveTo(-14, -8, -5, -14); c.closePath(); };
    vetro(); c.fillStyle = 'rgba(230,240,255,0.55)'; c.fill();
    c.save(); vetro(); c.clip(); c.fillStyle = '#8a1f2e'; c.fillRect(-14, -12, 28, 30); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-9, -10, 3, 22); c.restore();
    vetro(); tratto(c, CONT, 2.2);
    c.beginPath(); c.moveTo(12, -8); c.quadraticCurveTo(22, -4, 13, 8); tratto(c, CONT, 2);   // il manico
    c.restore();
    if (p) { ellisse(c, x, y, 9, 9); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3); }
    return;
  } else if (tipo === 'ventaglio') {
    // ventaglio aperto, con le stecche
    const forma = () => { c.beginPath(); c.moveTo(x, y); c.arc(x, y, 30, -2.75, -0.55); c.closePath(); };
    forma(); c.fillStyle = '#ffe2ec'; c.fill();
    c.save(); forma(); c.clip();
    c.beginPath(); c.arc(x, y, 22, 0, Math.PI * 2); tratto(c, '#e0527a', 5);
    for (let i = 0; i <= 6; i++) { const a = -2.75 + i * 0.367; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 31, y + Math.sin(a) * 31); tratto(c, '#b8926a', 1.3); }
    c.restore();
    forma(); tratto(c, CONT, 2.2);
  } else if (tipo === 'mezzaluna') {
    // la mezzaluna del pizzaiolo, tenuta a due mani: la lama curva d'acciaio e i due pomelli di
    // legno, uno per mano (la destra è in x, y; la sinistra è alla stessa altezza, dall'altra parte)
    const sx = 2 * CX - x, mx = (x + sx) / 2, w = (x - sx) / 2 + 6, ly = y + 9;
    const lama = () => { c.beginPath(); c.moveTo(mx - w, ly); c.quadraticCurveTo(mx, ly + 30, mx + w, ly); c.quadraticCurveTo(mx, ly + 12, mx - w, ly); c.closePath(); };
    lama(); c.fillStyle = gradL(c, 0, ly, 0, ly + 22, [[0, '#eef2f6'], [0.6, '#a9b2bc'], [1, '#6e7782']]); c.fill(); tratto(c, CONT, 2.2);
    c.beginPath(); c.moveTo(mx - w + 6, ly + 4); c.quadraticCurveTo(mx, ly + 22, mx + w - 6, ly + 4); tratto(c, 'rgba(255,255,255,0.75)', 1.4);
    for (const hx of [sx, x]) {
      rrect(c, hx - 4, ly - 15, 8, 17, 3.5); c.fillStyle = gradL(c, hx - 4, 0, hx + 4, 0, [[0, '#8a5428'], [0.5, '#c58a4c'], [1, '#7a4620']]); c.fill(); tratto(c, CONT, 2);
      if (p) { ellisse(c, hx, y, 9, 9); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3); }
    }
    return;
  } else if (tipo === 'lente') {
    // la lente d'ingrandimento alzata: il manico nel pugno, la lente in alto, col riflesso
    const lx = x - 4, ly = y - 27;
    c.beginPath(); c.moveTo(x + 2, y + 9); c.lineTo(lx + 1, ly + 13); tratto(c, CONT, 8); tratto(c, '#3a2a22', 4.6);
    ellisse(c, lx, ly, 15, 15); c.fillStyle = 'rgba(214,236,255,0.55)'; c.fill();
    ellisse(c, lx - 5, ly - 5, 5, 3.4, -0.6); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill();
    ellisse(c, lx, ly, 15, 15); tratto(c, CONT, 6.4); ellisse(c, lx, ly, 15, 15); tratto(c, '#c8a43a', 3.4);
    if (p) { ellisse(c, x, y, 9, 9); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3); }
    return;
  }
}

// fantasia a fiorellini del costume, dentro un riquadro (si usa dentro un tracciato ritagliato)
export function fiori(c, p, x0, y0, w, h, seme, k = 1) {
  if (!p.fantasia) return;
  const r = casuale(seme);
  for (let i = 0; i < Math.round((w * h) / (70 * k * k)); i++) {
    const x = x0 + r() * w, y = y0 + r() * h;
    c.fillStyle = p.fantasia[i % p.fantasia.length];
    for (let j = 0; j < 5; j++) { ellisse(c, x + Math.cos(j * 1.257) * 1.7 * k, y + Math.sin(j * 1.257) * 1.7 * k, 1.3 * k, 1.3 * k); c.fill(); }
    ellisse(c, x, y, 0.9 * k, 0.9 * k); c.fillStyle = '#ffffff'; c.fill();
  }
}

function braccio(c, p, punti, pollice) {
  const v = p.vestito, lunga = ['giacca', 'piumino', 'mimetica', 'cardigan', 'camicia', 'felpa', 'chiodo', 'maglione', 'divisa'].includes(v.tipo) || v.maniche === 'lunghe';
  const manica = v.manica ?? v.colore;
  const linea = (a, b, m) => { c.beginPath(); c.moveTo(...a); c.lineTo(...b); if (m) c.lineTo(...m); };
  // palestrato: braccio più grosso, e il bicipite gonfio tra spalla e gomito
  const M = p.muscoli ? 5 : 0;
  const bicipite = () => linea([lerp(punti[0][0], punti[1][0], 0.2), lerp(punti[0][1], punti[1][1], 0.2)], [lerp(punti[0][0], punti[1][0], 0.86), lerp(punti[0][1], punti[1][1], 0.86)]);
  linea(...punti); tratto(c, CONT, 19 + M);
  if (M) { bicipite(); tratto(c, CONT, 31); }
  linea(...punti); tratto(c, lunga ? manica : p.pelle, 13 + M);
  if (M) { bicipite(); tratto(c, lunga ? manica : p.pelle, 25); }
  if (v.tipo === 'cardigan' || v.tipo === 'maglione') {
    // polsino a coste, più scuro
    const a = punti[1], b = punti[2];
    linea([lerp(a[0], b[0], 0.7), lerp(a[1], b[1], 0.7)], b); tratto(c, scuro(manica, 0.22), 13);
  }
  if (p.fascia && punti[0][0] < CX) {
    // la fascia al braccio (il Giso, sul braccio a sinistra): gialla, con la scritta CONTROLLO SCONTRINI
    const [a, b] = punti, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    c.save(); c.translate(lerp(a[0], b[0], 0.5), lerp(a[1], b[1], 0.5)); c.rotate(ang - Math.PI / 2);
    rrect(c, -9.5, -6.5, 19, 13, 2); c.fillStyle = p.fascia.colore; c.fill(); tratto(c, CONT, 1.8);
    c.font = 'bold 3.3px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = p.fascia.testo;
    c.fillText('CONTROLLO', 0, -2.2); c.fillText('SCONTRINI', 0, 2.4);
    c.restore();
  }
  if (!lunga && !['costume', 'canottiera', 'abito', 'vestitino'].includes(v.tipo)) {
    const m = [lerp(punti[0][0], punti[1][0], 0.62), lerp(punti[0][1], punti[1][1], 0.62)];
    linea(punti[0], m); tratto(c, CONT, 21);
    linea(punti[0], m); tratto(c, manica, 15);
  }
  if (p.tatuaggi && !lunga) {
    // braccia tatuate: fasce tribali, zig-zag e qualche simbolo, su braccio e avambraccio
    const T = p.tatuaggi;
    [[punti[0], punti[1]], [punti[1], punti[2]]].forEach(([a, b], k) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const pt = (t, q) => [a[0] + dx * t + nx * q, a[1] + dy * t + ny * q];
      for (const t of k ? [0.2, 0.3] : [0.3, 0.42]) { linea(pt(t, -5.4), pt(t, 5.4)); tratto(c, T, 2.2); }                        // fasce
      c.beginPath(); [[0.5, -4], [0.57, 3.5], [0.64, -3.5], [0.71, 3.5], [0.78, -4]].forEach(([t, q], i) => (i ? c.lineTo(...pt(t, q)) : c.moveTo(...pt(t, q)))); tratto(c, T, 1.7);   // zig-zag
      if (k === 0) { const [x, y] = pt(0.9, 0); c.beginPath(); c.moveTo(x - 3.4, y); c.lineTo(x + 3.4, y); c.moveTo(x, y - 3.4); c.lineTo(x, y + 3.4); tratto(c, T, 1.6); }   // una croce
      else { ellisse(c, ...pt(0.9, 0), 2.6, 2.6); tratto(c, T, 1.5); }                                                           // un cerchietto
    });
  }
  const [mx, my] = punti[2];
  if (pollice === 'dito') {
    // l'indice puntato, nel verso dell'avambraccio
    const dx = mx - punti[1][0], dy = my - punti[1][1], d = Math.hypot(dx, dy) || 1, fx = mx + (dx / d) * 19, fy = my + (dy / d) * 19 - 2;
    linea([mx, my - 2], [fx, fy]); tratto(c, CONT, 9.5);
    linea([mx, my - 2], [fx, fy]); tratto(c, p.pelle, 5.6);
  } else if (pollice) {
    linea([mx - 1, my - 4], [mx - 1, my - 17]); tratto(c, CONT, 10);
    linea([mx - 1, my - 4], [mx - 1, my - 17]); tratto(c, p.pelle, 6);
  }
  ellisse(c, mx, my, 9 + M * 0.3, 9 + M * 0.3); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3);
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

// o.calcio = { lato: -1 | 1, angolo } alza una gamba di lato (il palleggio);
// o.posa = nome di una posa delle braccia diversa da quella dell'espressione
function corpo(c, p, espr, o = {}) {
  const v = p.vestito, S = p.pelle;
  // corporatura robusta: gambe, collo e busto si allargano attorno al centro,
  // le braccia partono da spalle più larghe. pancia = quanto sporge il pancione.
  // muscoli: spalle larghe, vita stretta, collo taurino.
  const k = p.corporatura ?? 1, g = p.pancia ?? 0, M = p.muscoli ? 1 : 0, sp = (k - 1) * 33 + g * 0.6 + M * 8;
  c.save(); c.translate(CX, 0); c.scale(k, 1); c.translate(-CX, 0);
  // gambe e scarpe
  for (const s of [-1, 1]) {
    const x = s < 0 ? CX - 24 : CX + 5;
    // la gamba che calcia ruota verso l'esterno attorno all'anca (e si allunga un po': si vede meglio)
    const calcia = o.calcio?.lato === s;
    if (calcia) { c.save(); c.translate(x + 9.5, 244); c.rotate(-s * o.calcio.angolo); c.scale(1, 1.25); c.translate(-(x + 9.5), -244); }
    if (p.corti) {
      // pantaloncini: sotto la gamba nuda (e i calzettoni, se ci sono)
      rrect(c, x + 2 - M * 1.5, 250, 15 + M * 3, 26, 5); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3);
      if (p.calzettoni) { rrect(c, x + 2, 262, 15, 12, 3); c.fillStyle = p.calzettoni; c.fill(); tratto(c, CONT, 2.4); }
      rrect(c, x - 1, 240, 21, 17, [6, 6, 3, 3]); c.fillStyle = gradL(c, 0, 240, 0, 257, [[0, p.pantaloni], [1, scuro(p.pantaloni, 0.25)]]); c.fill();
      if (p.fantasia) { c.save(); c.clip(); fiori(c, p, x - 1, 241, 21, 15, s < 0 ? 41 : 43); c.restore(); rrect(c, x - 1, 240, 21, 17, [6, 6, 3, 3]); }
      tratto(c, CONT, 3);
    } else {
      // (pantaloni larghi: la gamba è più ampia e si allarga in fondo, sopra la scarpa)
      const gamba = () => (p.larghi ? poli(c, [[x - 1, 240], [x + 20, 240], [x + 23.5, 277], [x - 4.5, 277]]) : rrect(c, x, 240, 19, 36, 6));
      gamba(); c.fillStyle = gradL(c, 0, 240, 0, 276, [[0, p.pantaloni], [1, scuro(p.pantaloni, 0.25)]]); c.fill();
      if (p.mimeticaPantaloni) { c.save(); rrect(c, x, 240, 19, 36, 6); c.clip(); mimetica(c, x - 4, 236, 27, 44, p.pantaloni, s < 0 ? 5 : 6); c.restore(); }
      if (p.tartan) {
        // pantaloni scozzesi: righe incrociate (tartan = il colore delle righe)
        c.save(); gamba(); c.clip();
        c.fillStyle = alfa(p.tartan, 0.6);
        for (let yy = 243; yy < 278; yy += 8) c.fillRect(x - 6, yy, 32, 2);
        for (let xx = x + 3; xx < x + 20; xx += 7) c.fillRect(xx, 238, 2, 42);
        c.fillStyle = 'rgba(255,255,255,0.35)';
        for (let yy = 247; yy < 278; yy += 8) c.fillRect(x - 6, yy, 32, 0.7);
        c.restore();
      }
      if (p.strappi) {
        // jeans strappati: sotto si vede la pelle, coi fili bianchi
        c.save(); gamba(); c.clip();
        for (const [dy, w] of s < 0 ? [[6, 12]] : [[3, 9], [11, 13]]) {
          rrect(c, x + (19 - w) / 2, 240 + dy, w, 3.4, 1.6); c.fillStyle = p.pelle; c.fill(); tratto(c, 'rgba(255,255,255,0.75)', 0.8);
        }
        c.restore();
      }
      gamba(); tratto(c, CONT, 3);
      if (p.larghi) { c.beginPath(); c.moveTo(x + 6, 252); c.lineTo(x + 4.5, 272); c.moveTo(x + 14, 256); c.lineTo(x + 16, 273); tratto(c, 'rgba(0,0,0,0.22)', 1.4); }   // pieghe
    }
    const xs = x - (s < 0 ? 7 : 1);
    if (p.infradito) {
      // piede nudo nell'infradito: suola e laccetto a V
      rrect(c, xs, 270, 27, 14, [8, 8, 4, 4]); c.fillStyle = p.pelle; c.fill(); tratto(c, CONT, 3);
      c.fillStyle = p.scarpe; c.fillRect(xs + 1.5, 280, 24, 3.2);
      c.beginPath(); c.moveTo(xs + 5, 281); c.lineTo(xs + 13.5, 273); c.lineTo(xs + 22, 281); tratto(c, p.scarpe, 2.4);
    } else {
      if (p.stivali) {
        // stivali da motociclista: il gambale sopra la scarpa, con la fibbia
        rrect(c, x - 2, 256, 23, 19, 3); c.fillStyle = p.scarpe; c.fill(); tratto(c, CONT, 3);
        c.fillStyle = '#c9cdd4'; c.fillRect(x - 0.5, 262, 20, 2.2); rrect(c, x + (s < 0 ? 1 : 13), 260.4, 5, 5.4, 1); c.fill(); tratto(c, CONT, 0.9);
      }
      rrect(c, xs, 270, 27, 14, [8, 8, 4, 4]); c.fillStyle = p.scarpe; c.fill(); tratto(c, CONT, 3);
      c.fillStyle = scuro(p.scarpe, 0.35); c.fillRect(xs + (s < 0 ? 1.5 : 0.5), 279.5, 24, 3);
    }
    if (calcia) c.restore();
  }
  if (p.catenaPortafoglio) {
    // la catena del portafoglio: dal passante della cintura alla tasca dietro
    const cat = () => { c.beginPath(); c.moveTo(CX + 7, 249); c.quadraticCurveTo(CX + 15, 273, CX + 26, 251); };
    cat(); tratto(c, CONT, 4.4); cat(); tratto(c, p.catenaPortafoglio, 2.2);
    c.setLineDash([2, 2.6]); cat(); tratto(c, scuro(p.catenaPortafoglio, 0.45), 2.2); c.setLineDash([]);
  }
  // collo (coi trapezi, se è palestrato)
  if (M) for (const s of [-1, 1]) { poli(c, [[CX + s * 13, 167], [CX + s * 40, 188], [CX + s * 13, 192]]); c.fillStyle = scuro(S, 0.1); c.fill(); tratto(c, CONT, 3); }
  rrect(c, CX - 12 - M * 3, 164, 24 + M * 6, 28, 6); c.fillStyle = scuro(S, 0.16); c.fill(); tratto(c, CONT, 3);
  // busto (col pancione i fianchi si allargano e il fondo scende, tondo, sopra le gambe;
  // coi muscoli è a V: spalle larghe e vita stretta)
  const busto = () => {
    if (M) {
      c.beginPath(); c.moveTo(CX - 45, 202); c.quadraticCurveTo(CX - 46, 183, CX - 22, 181); c.lineTo(CX + 22, 181); c.quadraticCurveTo(CX + 46, 183, CX + 45, 202);
      c.bezierCurveTo(CX + 43, 225, CX + 29, 232, CX + 27, 249); c.quadraticCurveTo(CX, 255, CX - 27, 249); c.bezierCurveTo(CX - 29, 232, CX - 43, 225, CX - 45, 202);
      c.closePath();
      return;
    }
    c.beginPath(); c.moveTo(CX - 36, 199); c.quadraticCurveTo(CX - 36, 184, CX - 18, 182); c.lineTo(CX + 18, 182);
    c.quadraticCurveTo(CX + 36, 184, CX + 36, 199);
    if (g) {
      c.bezierCurveTo(CX + 37 + g * 0.5, 214, CX + 36 + g, 246, CX + 26, 258);
      c.quadraticCurveTo(CX, 266 + g * 0.25, CX - 26, 258);
      c.bezierCurveTo(CX - 36 - g, 246, CX - 37 - g * 0.5, 214, CX - 36, 199);
    } else { c.lineTo(CX + 31, 249); c.quadraticCurveTo(CX, 255, CX - 31, 249); }
    c.closePath();
  };
  // (in costume il busto è nudo: colore della pelle)
  const tinta = v.tipo === 'costume' ? S : v.colore;
  busto(); c.fillStyle = gradL(c, 0, 182, 0, 254, v.tipo === 'costume' ? [[0, chiaro(S, 0.06)], [1, scuro(S, 0.08)]] : [[0, chiaro(tinta, 0.1)], [1, scuro(tinta, 0.2)]]); c.fill();
  c.save(); busto(); c.clip();
  if (v.tipo === 'costume') {
    // a torso nudo: clavicole, pettorali, ombelico; in fondo l'elastico del costume col laccetto
    if (p.chiazze) {
      const r = casuale(29);
      c.fillStyle = alfa(p.chiazze, 0.75);
      for (let i = 0; i < 7; i++) { ellisse(c, CX - 34 + r() * 68, 186 + r() * 50, 5 + r() * 8, 4 + r() * 6, r() * 3); c.fill(); }
    }
    const om = alfa(scuro(S, 0.5), 0.55);
    if (M) {
      // pettorali gonfi, addominali a tartaruga, fianchi scolpiti
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(CX + s * 1.5, 189); c.bezierCurveTo(CX + s * 3, 215, CX + s * 32, 218, CX + s * 39, 199); c.quadraticCurveTo(CX + s * 37, 187, CX + s * 20, 186); c.closePath();
        c.fillStyle = chiaro(S, 0.1); c.fill(); tratto(c, om, 1.9);
        ellisse(c, CX + s * 22, 205.5, 2.2, 2); c.fillStyle = alfa(scuro(S, 0.45), 0.8); c.fill();
        for (let i = 0; i < 3; i++) { rrect(c, CX + (s < 0 ? -11.5 : 1.5), 215 + i * 7.5, 10, 6.1, 2.6); c.fillStyle = chiaro(S, 0.09); c.fill(); tratto(c, om, 1.3); }
        c.beginPath(); c.moveTo(CX + s * 27, 216); c.quadraticCurveTo(CX + s * 20.5, 226, CX + s * 21.5, 237); tratto(c, om, 1.3);
      }
    } else {
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(CX + s * 4, 186); c.quadraticCurveTo(CX + s * 14, 190, CX + s * 25, 186); tratto(c, om, 1.4);
        c.beginPath(); c.moveTo(CX + s * 3, 207); c.quadraticCurveTo(CX + s * 16, 213, CX + s * 29, 204); tratto(c, om, 1.8);
        ellisse(c, CX + s * 17, 203, 2.2, 2); c.fillStyle = alfa(scuro(S, 0.45), 0.8); c.fill();
      }
      ellisse(c, CX, 228, 1.8, 2.6); c.fillStyle = alfa(scuro(S, 0.55), 0.85); c.fill();
    }
    c.fillStyle = p.pantaloni; c.fillRect(CX - 42, 238, 84, 24);
    fiori(c, p, CX - 40, 243, 80, 14, 31);
    c.fillStyle = scuro(p.pantaloni, 0.25); c.fillRect(CX - 42, 238, 84, 3.6);
    c.beginPath(); c.moveTo(CX - 2, 241); c.quadraticCurveTo(CX - 8, 249, CX - 5, 255); c.moveTo(CX + 2, 241); c.quadraticCurveTo(CX + 8, 248, CX + 6, 254); tratto(c, '#ffffff', 1.5);
  } else if (v.tipo === 'giacca' && v.sotto) {
    // giacca aperta su una maglietta girocollo (col pancione non si chiude: la maglietta si allarga)
    const maglia = () => poli(c, [[CX - 18, 180], [CX + 18, 180], [CX + 15 + g * 1.3, 240], [CX + 15 + g, 272], [CX - 15 - g, 272], [CX - 15 - g * 1.3, 240]]);
    maglia(); c.fillStyle = gradL(c, 0, 180, 0, 258, [[0, v.sotto], [1, scuro(v.sotto, 0.1)]]); c.fill();
    if (g) {
      // la maglietta non ce la fa: sotto spunta la pancia, con l'ombelico
      c.save(); maglia(); c.clip();
      const orlo = () => { c.beginPath(); c.moveTo(CX - 34, 256); c.quadraticCurveTo(CX, 240, CX + 34, 256); };
      orlo(); c.lineTo(CX + 34, 280); c.lineTo(CX - 34, 280); c.closePath(); c.fillStyle = gradL(c, 0, 244, 0, 268, [[0, S], [1, scuro(S, 0.14)]]); c.fill();
      orlo(); tratto(c, scuro(v.sotto, 0.3), 2);
      ellisse(c, CX, 257, 1.7, 2.6); c.fillStyle = scuro(S, 0.45); c.fill();
      c.beginPath(); c.moveTo(CX - 22, 212); c.quadraticCurveTo(CX, 220, CX + 22, 212); tratto(c, 'rgba(0,0,0,0.09)', 2.4);   // ombra sotto il petto
      c.restore();
    }
    ellisse(c, CX, 181, 12, 7.5); c.fillStyle = scuro(S, 0.1); c.fill();
    c.beginPath(); c.ellipse(CX, 181, 12, 7.5, 0, 0, Math.PI); tratto(c, scuro(v.sotto, 0.2), 2.6);
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 17, 180], [CX + s * 28, 182], [CX + s * (16 + g * 0.9), 238]]); c.fillStyle = scuro(v.colore, 0.25); c.fill(); tratto(c, CONT, 2.2);
      c.beginPath(); c.moveTo(CX + s * 17, 182); c.lineTo(CX + s * (15 + g * 1.3), 240); c.lineTo(CX + s * (15 + g), 272); tratto(c, 'rgba(0,0,0,0.3)', 1.4);
    }
    rrect(c, CX - 33 - g * 0.5, 230, 13, 3.5, 1); c.fillStyle = scuro(v.colore, 0.3); c.fill();  // tasca
  } else if (v.tipo === 'chiodo') {
    // giubbotto di pelle da motociclista, aperto su una maglietta: risvolti larghi e spalle
    // con le borchie, la zip della tasca, la cintura con la fibbia in fondo
    const maglia = () => poli(c, [[CX - 15, 180], [CX + 15, 180], [CX + 10 + g, 262], [CX - 10 - g, 262]]);
    maglia(); c.fillStyle = gradL(c, 0, 180, 0, 258, [[0, v.sotto], [1, scuro(v.sotto, 0.18)]]); c.fill();
    ellisse(c, CX, 181, 12, 7.5); c.fillStyle = scuro(S, 0.1); c.fill();
    c.beginPath(); c.ellipse(CX, 181, 12, 7.5, 0, 0, Math.PI); tratto(c, scuro(v.sotto, 0.3), 2.6);
    c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(CX - 37, 196, 3.5, 40); c.fillRect(CX + 31, 204, 2.5, 28);     // la pelle lucida
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 15, 180], [CX + s * 34, 185], [CX + s * 28, 216], [CX + s * (11 + g), 236]]); c.fillStyle = chiaro(v.colore, 0.12); c.fill(); tratto(c, CONT, 2.2);
      for (const [bx, by] of [[28.5, 191], [27, 200], [25, 209], [31, 186.5]]) { ellisse(c, CX + s * bx, by, 2, 2); c.fillStyle = v.borchie; c.fill(); tratto(c, CONT, 0.8); }
      c.beginPath(); c.moveTo(CX + s * 15, 182); c.lineTo(CX + s * (10 + g), 262); tratto(c, 'rgba(0,0,0,0.4)', 1.4);
    }
    c.beginPath(); c.moveTo(CX - 33 - g * 0.4, 224); c.lineTo(CX - 20 - g * 0.4, 229); tratto(c, v.borchie, 1.7);                // la zip della tasca
    c.fillStyle = scuro(v.colore, 0.45); c.fillRect(CX - 46, 245 + g * 0.5, 92, 7);
    rrect(c, CX + 17 + g * 0.5, 243.5 + g * 0.5, 9, 10, 2); tratto(c, v.borchie, 1.8);
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
  } else if (v.tipo === 'cardigan') {
    // da nonno: cardigan di lana a coste coi bottoni grossi e le tasche, sopra la camicia
    // a quadretti chiusa fino all'ultimo bottone
    const bordo = scuro(v.colore, 0.24);
    c.fillStyle = 'rgba(0,0,0,0.1)';
    for (let x = CX - 40; x < CX + 40; x += 4) c.fillRect(x, 180, 1.2, 80);            // coste della lana
    c.fillStyle = bordo; c.fillRect(CX - 42, 243, 84, 16);                              // fondo a coste fitte
    c.fillStyle = 'rgba(0,0,0,0.2)';
    for (let x = CX - 41; x < CX + 41; x += 3) c.fillRect(x, 243, 1, 16);
    c.fillRect(CX - 42, 242.4, 84, 1.2);
    // scollo a V: la camicia
    const scollo = () => poli(c, [[CX - 17, 180], [CX + 17, 180], [CX + 2.5, 217], [CX - 2.5, 217]]);
    scollo(); c.fillStyle = v.camicia; c.fill();
    c.save(); scollo(); c.clip();
    c.fillStyle = v.quadretti;
    for (let x = CX - 17.5; x < CX + 18; x += 5) c.fillRect(x, 178, 1.5, 42);
    for (let y = 181; y < 220; y += 5) c.fillRect(CX - 18, y, 36, 1.5);
    c.restore();
    c.beginPath(); c.moveTo(CX, 190); c.lineTo(CX, 217); tratto(c, 'rgba(0,0,0,0.28)', 1.1);
    for (const y of [199, 209]) { ellisse(c, CX, y, 1.5, 1.5); c.fillStyle = '#ffffff'; c.fill(); tratto(c, 'rgba(0,0,0,0.5)', 0.7); }
    // bordo lungo lo scollo e giù fino in fondo, dove si abbottona
    const orlo = (s) => { c.beginPath(); c.moveTo(CX + s * 18.5, 178); c.lineTo(CX + s * 3, 217); c.lineTo(CX + s * 3, 260); };
    for (const s of [-1, 1]) { orlo(s); tratto(c, CONT, 7.6); }
    for (const s of [-1, 1]) { orlo(s); tratto(c, bordo, 5.2); }
    for (const y of [224, 235, 246]) {
      ellisse(c, CX, y, 3.2, 3.2); c.fillStyle = v.bottoni; c.fill(); tratto(c, CONT, 1.1);
      c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(CX - 1.5, y - 0.5, 1, 1); c.fillRect(CX + 0.5, y - 0.5, 1, 1);
    }
    // tasche
    for (const s of [-1, 1]) {
      rrect(c, CX + s * 20 - 8.5, 223, 17, 15, 2); c.fillStyle = 'rgba(0,0,0,0.07)'; c.fill(); tratto(c, 'rgba(0,0,0,0.42)', 1.2);
      rrect(c, CX + s * 20 - 8.5, 223, 17, 4.5, 1.5); c.fillStyle = bordo; c.fill(); tratto(c, 'rgba(0,0,0,0.42)', 1);
    }
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
  } else if (v.tipo === 'abito') {
    // vestito a bretelline: scollo sulla pelle, cintura sottile in vita
    c.beginPath(); c.moveTo(CX - 40, 176); c.lineTo(CX + 40, 176); c.lineTo(CX + 40, 192);
    c.quadraticCurveTo(CX + 18, 188, CX, 198); c.quadraticCurveTo(CX - 18, 188, CX - 40, 192); c.closePath();
    c.fillStyle = gradL(c, 0, 176, 0, 198, [[0, chiaro(S, 0.06)], [1, S]]); c.fill();
    c.beginPath(); c.moveTo(CX - 40, 192); c.quadraticCurveTo(CX - 18, 188, CX, 198); c.quadraticCurveTo(CX + 18, 188, CX + 40, 192); tratto(c, CONT, 2);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(CX + s * 22, 178); c.lineTo(CX + s * 19, 191); tratto(c, CONT, 4); tratto(c, v.colore, 2.2); }
    c.fillStyle = scuro(v.colore, 0.3); c.fillRect(CX - 40, 230, 80, 3.5);
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(CX - 30, 200, 3, 26);
  } else if (v.tipo === 'felpa') {
    // felpa col cappuccio: tasca a marsupio davanti, polsini e fondo a coste
    const fondo = scuro(v.colore, 0.25);
    c.fillStyle = fondo; c.fillRect(CX - 50, 246 + g * 0.3, 100, 14);
    poli(c, [[CX - 22, 228], [CX + 22, 228], [CX + 28 + g * 0.4, 248], [CX - 28 - g * 0.4, 248]]); c.fillStyle = chiaro(v.colore, 0.05); c.fill(); tratto(c, alfa('#000000', 0.55), 1.4);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(CX + s * 22, 228); c.quadraticCurveTo(CX + s * 21, 238, CX + s * 28, 247); tratto(c, alfa('#000000', 0.5), 1.4); }
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(CX - 34, 192, 3, 40);
  } else if (v.tipo === 'camicia') {
    // camicia da sera: primo bottone aperto (si vede il collo), abbottonatura, taschino
    poli(c, [[CX - 12, 180], [CX + 12, 180], [CX, 199]]); c.fillStyle = scuro(S, 0.1); c.fill();
    c.beginPath(); c.moveTo(CX, 199); c.lineTo(CX, 254); tratto(c, alfa(scuro(v.colore, 0.4), 0.7), 1.3);
    for (const y of [208, 222, 236, 250]) { ellisse(c, CX + 2.5, y, 1.5, 1.5); c.fillStyle = chiaro(v.colore, 0.4); c.fill(); tratto(c, alfa(scuro(v.colore, 0.5), 0.8), 0.7); }
    rrect(c, CX - 30, 202, 14, 13, 2); tratto(c, alfa(scuro(v.colore, 0.4), 0.7), 1.2);
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(CX - 34, 186, 3, 50);
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
  } else if (v.tipo === 'canottiera') {
    // canottiera aderente: scollo largo e spalle scoperte; la cintura (con la fibbia) e la collanina
    // si disegnano dopo, sopra il contorno
    ellisse(c, CX, 181, 16, 13); c.fillStyle = scuro(S, 0.1); c.fill(); tratto(c, scuro(v.colore, 0.2), 2.2);
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(CX + s * 24, 180); c.lineTo(CX + s * 40, 180); c.lineTo(CX + s * 40, 208); c.quadraticCurveTo(CX + s * 25, 204, CX + s * 24, 180); c.closePath();
      c.fillStyle = S; c.fill(); tratto(c, scuro(v.colore, 0.2), 2.2);
    }
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(CX + s * 8, 210); c.quadraticCurveTo(CX + s * 17, 214, CX + s * 26, 208); tratto(c, 'rgba(0,0,0,0.1)', 1.6); }   // aderente: si intravedono i pettorali
    if (p.macchia) {
      // il drink rovesciato
      c.fillStyle = alfa(p.macchia, 0.9);
      ellisse(c, CX + 3, 214, 15, 12, 0.3); c.fill(); ellisse(c, CX - 11, 222, 8, 6); c.fill(); ellisse(c, CX + 14, 203, 6, 5); c.fill();
      for (const [x, y, h] of [[CX - 4, 226, 12], [CX + 8, 224, 15], [CX - 14, 226, 7]]) { rrect(c, x - 1.8, y, 3.6, h, 1.8); c.fill(); }
    }
    if (v.cintura) { c.fillStyle = v.cintura; c.fillRect(CX - 42, 236, 84, 11); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(CX - 42, 237.5, 84, 1.6); }
  } else if (v.tipo === 'polo') {
    // polo (Michele): l'apertura coi due bottoni sotto il colletto, il nome ricamato sul petto
    poli(c, [[CX - 9, 180], [CX + 9, 180], [CX, 194]]); c.fillStyle = scuro(S, 0.1); c.fill();
    rrect(c, CX - 5, 186, 10, 24, 2); c.fillStyle = scuro(v.colore, 0.05); c.fill(); tratto(c, alfa(scuro(v.colore, 0.35), 0.8), 1.2);
    for (const y of [196, 204]) { ellisse(c, CX, y, 1.8, 1.8); c.fillStyle = '#ffffff'; c.fill(); tratto(c, alfa(scuro(v.colore, 0.5), 0.9), 0.8); }
    if (v.ricamo) {
      c.save(); c.translate(CX + 23, 204); c.rotate(-0.04);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = v.ricamoColore;
      if (v.ricamo.length > 1) { c.font = 'bold 5px sans-serif'; c.fillText(v.ricamo[0], 0, -4.5); c.font = 'bold 6px sans-serif'; c.fillText(v.ricamo[1], 0, 2.5, 30); }
      else { c.font = 'bold 6px sans-serif'; c.fillText(v.ricamo[0], 0, 0, 30); }
      c.restore();
    }
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(CX - 34, 188, 3, 46);
  } else if (v.tipo === 'maglione') {
    // maglione di lana a coste (il Giso): coste verticali, fondo a coste fitte, girocollo (sotto)
    for (let x = CX - 44; x < CX + 46; x += 4.4) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x, 180, 1.5, 80); c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x + 2.2, 180, 1, 80); }
    c.fillStyle = scuro(v.colore, 0.16); c.fillRect(CX - 46, 243, 92, 16);
    c.fillStyle = 'rgba(0,0,0,0.24)';
    for (let x = CX - 45; x < CX + 46; x += 2.8) c.fillRect(x, 243, 1, 16);
    c.fillRect(CX - 46, 242.4, 92, 1.2);
    ellisse(c, CX, 181, 13, 8); c.fillStyle = scuro(S, 0.1); c.fill();
  } else if (v.tipo === 'divisa') {
    // la divisa dei finanzieri: giacca chiusa coi bottoni dorati, camicia bianca e cravatta nello
    // scollo, il bavero (con le fiamme gialle: le disegna dopo, sopra il contorno), i taschini con la
    // patta, le tasche in basso e il nastrino sul petto
    poli(c, [[CX - 15, 180], [CX + 15, 180], [CX, 213]]); c.fillStyle = v.camicia; c.fill();
    poli(c, [[CX - 4, 184], [CX + 4, 184], [CX + 3, 191], [CX - 3, 191]]); c.fillStyle = v.cravatta; c.fill(); tratto(c, CONT, 1.2);
    poli(c, [[CX - 3, 191], [CX + 3, 191], [CX + 5.5, 207], [CX, 213], [CX - 5.5, 207]]); c.fillStyle = v.cravatta; c.fill(); tratto(c, CONT, 1.2);
    for (const s of [-1, 1]) { poli(c, [[CX + s * 13, 178], [CX + s * 3, 183], [CX + s * 9, 193]]); c.fillStyle = v.camicia; c.fill(); tratto(c, CONT, 1.4); }
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 15, 179], [CX + s * 28, 183], [CX + s * 25, 191], [CX + s * 21, 192], [CX + s * 2, 216]]);
      c.fillStyle = gradL(c, 0, 180, 0, 216, [[0, chiaro(v.colore, 0.06)], [1, scuro(v.colore, 0.14)]]); c.fill(); tratto(c, CONT, 2);
      // i taschini sul petto, con la patta e il bottoncino; le tasche in basso
      rrect(c, CX + s * 21 - 8, 207, 16, 15, 2); tratto(c, alfa(scuro(v.colore, 0.5), 0.8), 1.3);
      rrect(c, CX + s * 21 - 9, 204, 18, 6, 2); c.fillStyle = scuro(v.colore, 0.12); c.fill(); tratto(c, CONT, 1.3);
      ellisse(c, CX + s * 21, 207.5, 1.8, 1.8); c.fillStyle = v.bottoni; c.fill(); tratto(c, scuro(v.bottoni, 0.5), 0.8);
      rrect(c, CX + s * 22 - 10, 236, 20, 15, 2); tratto(c, alfa(scuro(v.colore, 0.5), 0.8), 1.3);
      rrect(c, CX + s * 22 - 10.5, 233.5, 21, 6, 2); c.fillStyle = scuro(v.colore, 0.12); c.fill(); tratto(c, CONT, 1.3);
    }
    c.beginPath(); c.moveTo(CX + 1, 214); c.lineTo(CX + 1, 258); tratto(c, alfa(scuro(v.colore, 0.55), 0.9), 1.4);   // la chiusura
    [['#c8282e', '#f2f2f2'], ['#2a5ab8', '#f2c43a'], ['#2e8a4a', '#f2f2f2']].forEach(([a, b], i) => {
      const x = CX + 13 + i * 5.5;
      c.fillStyle = a; c.fillRect(x, 198, 5, 4.5); c.fillStyle = b; c.fillRect(x + 1.8, 198, 1.4, 4.5);
      c.strokeStyle = CONT; c.lineWidth = 0.7; c.strokeRect(x, 198, 5, 4.5);
    });
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(CX - 34, 190, 3, 50);
  } else if (v.tipo === 'vestitino') {
    // (le ragazze del Manna) vestito da sera senza maniche: scollo tondo, cinturina, qualche brillantino. La gonna è più sotto.
    ellisse(c, CX, 181, 15, 10); c.fillStyle = scuro(S, 0.1); c.fill();
    c.beginPath(); c.ellipse(CX, 181, 15, 10, 0, 0, Math.PI); tratto(c, chiaro(v.colore, 0.3), 2.6);
    c.fillStyle = scuro(v.colore, 0.28); c.fillRect(CX - 42, 232, 84, 4.5);
    const r = casuale(v.colore.charCodeAt(2) + 7);
    c.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 9; i++) { ellisse(c, CX - 28 + r() * 56, 194 + r() * 34, 1.1, 1.1); c.fill(); }
  } else {
    if (v.collo === 'v') { poli(c, [[CX - 13, 180], [CX + 13, 180], [CX, 203]]); c.fillStyle = scuro(S, 0.1); c.fill(); tratto(c, scuro(v.colore, 0.4), 3); }
    else {
      ellisse(c, CX, 181, 13, 8); c.fillStyle = scuro(S, 0.1); c.fill();
      c.beginPath(); c.ellipse(CX, 181, 13, 8, 0, 0, Math.PI); tratto(c, risalto(v.colore), 3);
    }
    if (v.bottoni) {
      // il collo "alla serafino": l'apertura coi bottoncini sotto il girocollo
      c.beginPath(); c.moveTo(CX, 186); c.lineTo(CX, 206); tratto(c, scuro(v.colore, 0.22), 1.6);
      for (const y of [192, 200]) { ellisse(c, CX + 2.6, y, 1.6, 1.6); c.fillStyle = scuro(v.colore, 0.32); c.fill(); }
    }
    if (v.logo) { ellisse(c, CX + 17, 206, 5.5, 5.5); c.fillStyle = v.logo; c.fill(); ellisse(c, CX + 17, 206, 2.5, 2.5); c.fillStyle = '#f1e9d4'; c.fill(); }
    if (v.spalle) {
      // maglia da calcio: le bande sulle spalle e il tessuto a righe appena accennate (niente stemmi né sponsor)
      c.fillStyle = 'rgba(0,0,0,0.09)';
      for (let y = 198; y < 252; y += 10) c.fillRect(CX - 42, y, 84, 4.5);
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(CX + s * 15, 181.5); c.lineTo(CX + s * 39, 190); tratto(c, v.spalle, 2.6);
        c.beginPath(); c.moveTo(CX + s * 14, 186); c.lineTo(CX + s * 38, 194.5); tratto(c, v.spalle, 1.8);
      }
    }
    if (v.stampa === 'fulmine') {
      // la stampa sul petto: un fulmine (inventato)
      const col = v.stampaColore ?? '#ffffff';
      poli(c, [[CX + 5, 197], [CX - 11, 221], [CX - 1, 221], [CX - 7, 242], [CX + 12, 214], [CX + 2, 214], [CX + 10, 197]]);
      c.fillStyle = col; c.fill(); tratto(c, scuro(col, 0.45), 1.3);
    }
    c.beginPath(); c.moveTo(CX - 22, 244); c.quadraticCurveTo(CX - 10, 238, CX - 2, 246); tratto(c, 'rgba(0,0,0,0.12)', 2);
  }
  c.restore();
  busto(); tratto(c, CONT, 3);
  if (p.collana) {
    // una catena al collo, sopra la maglietta (collana = il colore)
    const giro = () => { c.beginPath(); c.moveTo(CX - 13.5, 177); c.quadraticCurveTo(CX, 207, CX + 13.5, 177); };
    giro(); tratto(c, CONT, 5); giro(); tratto(c, p.collana, 2.8);
    c.setLineDash([2.2, 2.4]); giro(); tratto(c, scuro(p.collana, 0.45), 2.8); c.setLineDash([]);
  }
  if (v.tipo === 'vestitino') {
    // la gonna, che si allarga sopra le gambe
    const gonna = () => { c.beginPath(); c.moveTo(CX - 29, 235); c.lineTo(CX + 29, 235); c.quadraticCurveTo(CX + 36, 248, CX + 38, 262); c.quadraticCurveTo(CX, 268, CX - 38, 262); c.quadraticCurveTo(CX - 36, 248, CX - 29, 235); c.closePath(); };
    gonna(); c.fillStyle = gradL(c, 0, 235, 0, 266, [[0, v.colore], [1, scuro(v.colore, 0.22)]]); c.fill();
    for (const x of [-18, -6, 7, 19]) { c.beginPath(); c.moveTo(CX + x, 240); c.lineTo(CX + x * 1.25, 262); tratto(c, 'rgba(0,0,0,0.16)', 1.5); }
    gonna(); tratto(c, CONT, 3);
  }
  if (v.tipo === 'canottiera') {
    if (v.fibbia) {
      // la fibbia: grossa, dorata, lucida
      rrect(c, CX - 10.5, 232.5, 21, 16, 3.5); c.fillStyle = gradL(c, 0, 232, 0, 249, [[0, chiaro(v.fibbia, 0.55)], [0.5, v.fibbia], [1, scuro(v.fibbia, 0.3)]]); c.fill(); tratto(c, CONT, 2.2);
      rrect(c, CX - 6, 236.5, 12, 8, 1.5); tratto(c, scuro(v.fibbia, 0.45), 1.6);
      c.beginPath(); c.moveTo(CX - 7.5, 235); c.lineTo(CX - 2, 235); tratto(c, 'rgba(255,255,255,0.9)', 1.6);
    }
    if (v.catenina) {
      // la collanina d'oro, col ciondolo
      const giro = () => { c.beginPath(); c.moveTo(CX - 12.5, 175); c.quadraticCurveTo(CX, 207, CX + 12.5, 175); };
      giro(); tratto(c, CONT, 5.4); giro(); tratto(c, v.catenina, 3);
      c.setLineDash([2.2, 2.6]); giro(); tratto(c, chiaro(v.catenina, 0.6), 1.2); c.setLineDash([]);
      ellisse(c, CX, 194, 4.6, 5); c.fillStyle = gradR(c, CX - 1.5, 192.5, 0.5, 5, [[0, chiaro(v.catenina, 0.7)], [1, v.catenina]]); c.fill(); tratto(c, CONT, 1.8);
    }
  }
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
  if (v.tipo === 'divisa') {
    // le fiamme gialle sul bavero (con la fiammella d'argento), le spalline coi gradi, i bottoni dorati
    for (const s of [-1, 1]) {
      poli(c, [[CX + s * 15.5, 180.5], [CX + s * 26.5, 184], [CX + s * 18, 199]]); c.fillStyle = v.fiamme; c.fill(); tratto(c, scuro(v.fiamme, 0.5), 1.2);
      c.beginPath(); c.moveTo(CX + s * 19.5, 191); c.quadraticCurveTo(CX + s * 18, 187.5, CX + s * 20.5, 185); c.quadraticCurveTo(CX + s * 22.5, 188, CX + s * 21, 191); c.closePath();
      c.fillStyle = '#eef0f4'; c.fill(); tratto(c, 'rgba(60,60,70,0.6)', 0.6);
      rrect(c, CX + s * 29 - 8.5, 181.5, 17, 6, 2.5); c.fillStyle = scuro(v.colore, 0.18); c.fill(); tratto(c, CONT, 1.4);
      for (let k = 0; k < (v.gradi ?? 1); k++) { ellisse(c, CX + s * (29 + (k - ((v.gradi ?? 1) - 1) / 2) * 4.5), 184.5, 1.5, 1.5); c.fillStyle = v.bottoni; c.fill(); }
    }
    for (const y of [219, 231, 243]) {
      ellisse(c, CX + 1, y, 2.8, 2.8); c.fillStyle = gradR(c, CX, y - 1, 0.3, 3, [[0, chiaro(v.bottoni, 0.55)], [1, v.bottoni]]); c.fill(); tratto(c, scuro(v.bottoni, 0.55), 1);
    }
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
  if (v.tipo === 'abito') {
    // la gonna che si apre sotto la vita
    const gonna = () => {
      c.beginPath(); c.moveTo(CX - 31, 232); c.lineTo(CX + 31, 232);
      c.quadraticCurveTo(CX + 40, 248, CX + 46, 262); c.quadraticCurveTo(CX, 270, CX - 46, 262);
      c.quadraticCurveTo(CX - 40, 248, CX - 31, 232); c.closePath();
    };
    gonna(); c.fillStyle = gradL(c, 0, 232, 0, 266, [[0, v.colore], [1, scuro(v.colore, 0.22)]]); c.fill();
    c.save(); gonna(); c.clip();
    for (const x of [-26, -10, 8, 24]) { c.beginPath(); c.moveTo(CX + x * 0.7, 236); c.lineTo(CX + x * 1.25, 268); tratto(c, alfa(scuro(v.colore, 0.4), 0.5), 1.6); }
    c.restore();
    gonna(); tratto(c, CONT, 3);
    c.fillStyle = scuro(v.colore, 0.3); c.fillRect(CX - 31, 230, 62, 3.5);
  }
  if (v.tipo === 'felpa') {
    // il cappuccio abbassato attorno al collo e i cordini bianchi
    c.beginPath(); c.moveTo(CX - 24, 182); c.quadraticCurveTo(CX, 200, CX + 24, 182);
    tratto(c, CONT, 11); c.beginPath(); c.moveTo(CX - 24, 182); c.quadraticCurveTo(CX, 200, CX + 24, 182); tratto(c, chiaro(v.colore, 0.12), 7.5);
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(CX + s * 7, 192); c.quadraticCurveTo(CX + s * 9, 205, CX + s * 7, 216); tratto(c, CONT, 3.2); tratto(c, '#f2f2f2', 1.8);
      rrect(c, CX + s * 7 - 1.6, 215, 3.2, 5, 1); c.fillStyle = '#c8c8d0'; c.fill();
    }
  }
  if (v.tipo === 'camicia') {
    // colletto aperto a punta
    for (const s of [-1, 1]) { poli(c, [[CX + s * 11, 178], [CX + s * 20, 181], [CX + s * 9, 197], [CX + s * 3, 186]]); c.fillStyle = chiaro(v.colore, 0.12); c.fill(); tratto(c, CONT, 1.6); }
  }
  if (v.tipo === 'cardigan') {
    // colletto della camicia, con l'ultimo bottone chiuso
    for (const s of [-1, 1]) { poli(c, [[CX + s * 0.8, 185], [CX + s * 15, 179], [CX + s * 12.5, 201]]); c.fillStyle = v.camicia; c.fill(); tratto(c, CONT, 1.6); }
    ellisse(c, CX, 188.5, 1.5, 1.5); c.fillStyle = '#ffffff'; c.fill(); tratto(c, 'rgba(0,0,0,0.5)', 0.7);
  }
  if (v.tipo === 'polo') {
    // il colletto della polo, piatto sulle spalle
    for (const s of [-1, 1]) { poli(c, [[CX + s * 2, 182], [CX + s * 13, 176], [CX + s * 25, 182], [CX + s * 12, 192]]); c.fillStyle = chiaro(v.colore, 0.4); c.fill(); tratto(c, CONT, 1.6); }
  }
  if (v.tipo === 'maglione') {
    // il girocollo a coste
    const giro = () => { c.beginPath(); c.ellipse(CX, 179, 16, 9.5, 0, 0.02 * Math.PI, 0.98 * Math.PI); };
    giro(); tratto(c, CONT, 8.6); giro(); tratto(c, scuro(v.colore, 0.12), 5.8);
    c.setLineDash([1, 2]); giro(); tratto(c, 'rgba(0,0,0,0.3)', 5.8); c.setLineDash([]);
  }
  if (p.fischietto) {
    // il fischietto appeso al collo: il cordino e il fischietto di metallo sul petto
    const cordino = () => { c.beginPath(); c.moveTo(CX - 13, 177); c.quadraticCurveTo(CX - 8, 200, CX + 3, 213); c.moveTo(CX + 13, 177); c.quadraticCurveTo(CX + 11, 199, CX + 3, 213); };
    cordino(); tratto(c, CONT, 3.4); cordino(); tratto(c, '#22305a', 1.8);
    c.save(); c.translate(CX + 6, 218); c.rotate(0.4);
    rrect(c, -9, -5, 14, 10, 5); c.fillStyle = gradL(c, 0, -5, 0, 5, [[0, chiaro(p.fischietto, 0.5)], [0.5, p.fischietto], [1, scuro(p.fischietto, 0.35)]]); c.fill(); tratto(c, CONT, 1.6);
    rrect(c, 3, -3, 9, 5.5, 1.5); c.fillStyle = p.fischietto; c.fill(); tratto(c, CONT, 1.4);
    ellisse(c, -2, -1, 2.2, 2); c.fillStyle = '#2a2a33'; c.fill();
    c.restore();
  }
  if (p.grembiule) {
    // il grembiule da pizzaiolo legato in vita: dalla cintura alle ginocchia, con la tasca davanti,
    // i lacci e qualche spolverata di farina
    const G = p.grembiule, fianchi = 33 + g * 0.6;
    const telo = () => { c.beginPath(); c.moveTo(CX - fianchi, 227); c.lineTo(CX + fianchi, 227); c.quadraticCurveTo(CX + fianchi + 4, 248, CX + 34, 268); c.quadraticCurveTo(CX, 272, CX - 34, 268); c.quadraticCurveTo(CX - fianchi - 4, 248, CX - fianchi, 227); c.closePath(); };
    telo(); c.fillStyle = gradL(c, 0, 227, 0, 270, [[0, G], [1, scuro(G, 0.12)]]); c.fill();
    c.save(); telo(); c.clip();
    for (const [x, y, r] of [[-14, 255, 4], [10, 248, 3], [20, 262, 2.5]]) { ellisse(c, CX + x, y, r * 1.6, r); c.fillStyle = 'rgba(200,190,170,0.35)'; c.fill(); }
    c.restore();
    telo(); tratto(c, CONT, 2.6);
    rrect(c, CX - 15, 242, 30, 13, 2.5); tratto(c, alfa(scuro(G, 0.4), 0.9), 1.3);
    rrect(c, CX - fianchi - 1, 222, fianchi * 2 + 2, 6.5, 2); c.fillStyle = scuro(G, 0.06); c.fill(); tratto(c, CONT, 1.8);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(CX + s * (fianchi - 4), 227); c.quadraticCurveTo(CX + s * (fianchi + 2), 238, CX + s * (fianchi - 1), 246); tratto(c, CONT, 3.6); tratto(c, G, 1.8); }
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
  // (la posa a braccia conserte dell'aria di sufficienza vale solo se non ne è stata chiesta un'altra)
  if (espr === 'sufficienza' && !o.posa) {
    braccio(c, p, [[CX - 33, 196], [CX - 38, 223], [CX + 14, 219]].map((pt, i) => largo(pt, i, -1)));
    braccio(c, p, [[CX + 33, 196], [CX + 38, 225], [CX - 12, 227]].map((pt, i) => largo(pt, i, 1)));
    return null;
  }
  const posa = POSE[o.posa ?? espr] ?? POSE.normale;
  let destro = null;
  ultimeBraccia = [];
  for (const s of [-1, 1]) {
    const punti = (Array.isArray(posa) ? posa : posa[s < 0 ? 'sx' : 'dx']).map(([x, y], i) => [CX + s * (x + (i < 2 ? sp : Math.min(sp, Math.max(0, 80 - x)))), y]);
    braccio(c, p, punti, s > 0 && (posa.dito ? 'dito' : posa.pollice));
    ultimeBraccia.push(punti);
    if (s > 0) destro = punti;
  }
  return destro;   // il braccio destro: serve a chi tiene qualcosa in mano
}
let ultimeBraccia = [];   // le due braccia appena disegnate (per chi le vuole ridisegnare sopra la testa)

// o: opzioni del corpo (vedi corpo): la gamba che calcia, una posa delle braccia (o.posa),
// qualcosa in mano (o.accessorio, se no quello del personaggio)
export function disegnaPersonaggio(c, p, espr, o = {}) {
  // statura < 1: più basso (tutto un po' più piccolo, coi piedi sempre a terra)
  const h = p.statura ?? 1;
  if (h !== 1) { c.save(); c.translate(CX, 284); c.scale(h, h); c.translate(-CX, -284); }
  const destro = corpo(c, p, espr, o);
  // (o.senzaTesta: solo il corpo, per chi ha la testa in un'immagine a parte e cambia faccia senza
  // cambiare posa: Michele alla cassa)
  if (!o.senzaTesta) disegnaTesta(c, p, espr);
  if (o.maniSopra) for (const b of ultimeBraccia) braccio(c, p, b);   // mani nei capelli: sopra la testa
  // Quello che ha in mano si disegna per ultimo, e anche il braccio che lo regge: se no una
  // mano alzata sparirebbe dietro i capelli lunghi (la testa si disegna dopo il corpo).
  const acc = o.accessorio ?? p.accessorio;
  if (acc && acc !== 'balla' && destro) {
    if (acc !== 'telefono') braccio(c, p, destro);
    accessorio(c, acc, destro[2][0], destro[2][1], p);
  }
  if (h !== 1) c.restore();
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
