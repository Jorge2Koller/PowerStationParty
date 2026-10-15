// Le frasi delle classifiche finali (sfottò e pareggio). Le usa js/scenes/flusso.js tramite CONFIG.

// Frasi di sfottò della classifica finale. Vengono sostituiti: {primo} (chi ha vinto), {secondo},
// {ultimo} (chi è arrivato in fondo: in due è chi ha perso) e {tutti} (tutti i nomi in fila).
// Le frasi che nominano un personaggio non escono se quel personaggio è il primo o l'ultimo.
export const sfotto = [
  "{ultimo}, pure Beppe con una mano sola faceva meglio.",
  "{ultimo}, stasera il giro lo offri tu. A tutti.",
  "{primo} ti ha asfaltato peggio della Golf di ReGrorio.",
  "{ultimo}, hai i riflessi di una moka spenta.",
  "{ultimo}: tanta buona volontà, zero risultati.",
  "Dai {ultimo}, l'importante è partecipare. Dicono.",
  "{ultimo}, O'Sfurnacchiat si rade meglio da solo. Al buio.",
  "{primo} vince. {ultimo} porta i taralli.",
  "{ultimo}, ti ha battuto pure a mani in tasca.",
  "{ultimo}, chiedi la rivincita finché hai ancora dignità.",
  "{ultimo}, Marsupino ti ha farcito il panino col calzino.",
  "{ultimo}, non prendi al volo nemmeno un würstel.",
  "{primo} fa panini gourmet, {ultimo} solo pane secco.",
  "{ultimo}, con quei riflessi Guerra mangia gratis a vita.",
  "{ultimo}, Guerra ti ha svuotato i piatti e pure il frigo.",
  "{primo} difende la cena, {ultimo} stasera digiuna.",
  "{ultimo}, Sego è ancora in casa che ride di te.",
  "{ultimo}, con quella mira non affumichi nemmeno un salame.",
  "{primo} ha stanato Sego, {ultimo} solo i piccioni.",
  "{ultimo}, il Bota per colpa tua stanotte dorme in piedi.",
  "{primo} abbronza, {ultimo} arrostisce: chiedete al Bota.",
  "{ultimo}, spalmava meglio il gabbiano. E ti ha pure fregato il tubetto.",
  "{ultimo}, pure Giorgio stasera ha guidato più di te.",
  "{ultimo}, a te non danno un passaggio neanche gli scrocconi.",
  "{primo} ha messo Giorgio al volante. {ultimo} non trova neanche la freccia.",
  "{ultimo}, il Piovra ti ha battuto pure a te.",
  "{ultimo}, il Petri rimorchia più di te. Coi tentacoli.",
  "{primo} libera la pista, {ultimo} libera solo il guardaroba.",
  "{ultimo}, in pista ti ha notato solo il buttafuori.",
  "{primo} balla, {ultimo} regge il muro. E il Manna ringrazia.",
  "{ultimo}, pure la mamma del Manna aveva più ritmo di te.",
  "{ultimo}, Emilio in retromarcia ci vede meglio di te in avanti.",
  "{ultimo}, gli Shar Pei hanno meno pieghe della tua strategia.",
  "{primo} salva i cani, {ultimo} non salva nemmeno la faccia. Rock'n'roll!",
];
// ...e queste solo da tre giocatori in su (si aggiungono a quelle sopra)
export const sfottoTanti = [
  "{ultimo} paga il giro al PowerStation.",
  "{primo} sul gradino più alto, {secondo} a rosicare, {ultimo} a lavare i bicchieri.",
  "{secondo}, c'eri quasi. Quasi. {primo} ringrazia.",
  "{tutti}: una serata così non si vedeva da anni. Soprattutto per {ultimo}.",
  "{ultimo}, la prossima volta porta almeno i taralli.",
  "{primo} vince, {secondo} applaude a denti stretti, {ultimo} cerca le chiavi per andare via.",
  "Podio per {primo} e {secondo}. Per {ultimo} c'è lo sgabello in fondo al bancone.",
  "{ultimo}, pure la corona di {primo} ha fatto più punti di te.",
];
export const frasiPareggio = [
  'Pareggio! Rivincita obbligatoria, paga chi perde.',
  'Pari e patta. Beppe scuote la testa.',
];
