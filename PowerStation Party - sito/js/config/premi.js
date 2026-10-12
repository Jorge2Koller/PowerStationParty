// I premi buffi della fine della sfida (js/premi.js li assegna guardando i punteggi dei round).
// Per ogni premio: il titolo e la frase sotto ({nome} = chi lo vince, {gioco} = il microgioco,
// {n} = il numero che conta). Si possono cambiare le frasi; i premi nuovi vanno anche calcolati
// in js/premi.js. "quanti" = quanti premi si mostrano al massimo.
export default {
  quanti: 3,
  minimoRound: 2,          // sotto questi round giocati da tutti, niente premi
  premi: {
    specialista: { titolo: 'LO SPECIALISTA', frase: '{n} punti sfida a {gioco}' },
    medagliere: { titolo: 'IL MEDAGLIERE', frase: '{n} medaglie d\'oro' },
    maniDiBurro: { titolo: 'MANI DI BURRO', frase: '{n} round a zero punti' },
    secondo: { titolo: "L'ETERNO SECONDO", frase: 'secondo {n} volte' },
    regolare: { titolo: 'IL RAGIONIERE', frase: 'sempre sui {n} punti, mai una sorpresa' },
    rimonta: { titolo: 'IL DIESEL', frase: 'parte piano, poi +{n} punti a round' },
    turista: { titolo: 'IL TURISTA', frase: 'in media {n} punti: ma si è divertito' },
  },
};
