// I livelli dei microgiochi: FACILE, NORMALE, DIFFICILE (Fase 5).
// NORMALE è la configurazione del microgioco così com'è (js/config/microgiochi/<id>.js); FACILE e
// DIFFICILE sono in "livelli" nello stesso file e cambiano solo alcuni valori:
//   - un numero, un testo o un elenco prendono il posto di quello normale;
//   - un oggetto dentro un oggetto si unisce campo per campo (es. finestre: { perfetto: 0.075 });
//   - un oggetto al posto di un ELENCO di voci (fasi, atti) moltiplica quei campi in ogni voce:
//     fasi: { vel: 0.85 } = tutte le fasi un po' più lente (gli elenchi di numeri, come
//     intervallo: [1.3, 1.7], si moltiplicano tutti).
// Ogni giocatore ha il suo livello (l'handicap: Sessione.livelli); chi non l'ha scelto usa quello
// delle Impostazioni ("Difficoltà di partenza").
export const LIVELLI = ['facile', 'normale', 'difficile'];
export const NOMI_LIVELLI = { facile: 'FACILE', normale: 'NORMALE', difficile: 'DIFFICILE' };
export const COLORI_LIVELLI = { facile: '#7dff9a', normale: '#ffffff', difficile: '#ff9a8a' };

const oggetto = (x) => x && typeof x === 'object' && !Array.isArray(x);

function moltiplica(voce, fattori) {
  const out = { ...voce };
  for (const [k, f] of Object.entries(fattori)) {
    if (typeof out[k] === 'number') out[k] *= f;
    else if (Array.isArray(out[k])) out[k] = out[k].map((x) => (typeof x === 'number' ? x * f : x));
  }
  return out;
}

function unisci(base, cambi) {
  const out = { ...base };
  for (const [k, v] of Object.entries(cambi)) {
    if (Array.isArray(base[k]) && oggetto(v)) out[k] = base[k].map((voce) => (oggetto(voce) ? moltiplica(voce, v) : voce));
    else if (oggetto(base[k]) && oggetto(v)) out[k] = unisci(base[k], v);
    else out[k] = v;
  }
  return out;
}

// la configurazione di un microgioco a quel livello (normale: quella di sempre)
export function livellato(cfg, livello = 'normale') {
  const cambi = cfg?.livelli?.[livello];
  return cambi ? unisci(cfg, cambi) : cfg;
}
