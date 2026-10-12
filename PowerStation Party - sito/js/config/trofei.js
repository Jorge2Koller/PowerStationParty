// I trofei (js/progressi.js li controlla dopo ogni turno, ogni sfida e ogni acquisto).
// Qui si cambiano nomi e descrizioni; le condizioni sono in js/progressi.js (stesso id).
// "pinte" = quante Pinte si guadagnano quando si sblocca.
// Ci sono anche i trofei "Oro a ..." di ogni microgioco: si creano da soli (oro_<id>).
export default {
  pinte: 5,
  generali: [
    { id: 'primoTurno', nome: 'Si comincia!', descrizione: 'Gioca il primo microgioco' },
    { id: 'primoBronzo', nome: 'Sul podio', descrizione: 'Prendi una medaglia di bronzo' },
    { id: 'primoArgento', nome: 'Argenteria', descrizione: "Prendi una medaglia d'argento" },
    { id: 'primoOro', nome: 'Oro colato', descrizione: "Prendi una medaglia d'oro" },
    { id: 'filotto', nome: 'Filotto', descrizione: "Tre medaglie d'oro di fila" },
    { id: 'tuttiGiocati', nome: 'Il giro completo', descrizione: 'Gioca tutti i 17 microgiochi' },
    { id: 'tuttiBronzo', nome: 'Tuttofare', descrizione: 'Almeno il bronzo in tutti i microgiochi' },
    { id: 'tuttiArgento', nome: 'Il collezionista', descrizione: "Almeno l'argento in tutti i microgiochi" },
    { id: 'tuttiOro', nome: 'Leggenda del PowerStation', descrizione: "L'oro in tutti i microgiochi" },
    { id: 'centoTurni', nome: 'Habitué', descrizione: 'Gioca 100 microgiochi' },
    { id: 'primaSfida', nome: 'Prima serata', descrizione: 'Finisci una sfida' },
    { id: 'dieciSfide', nome: 'Il sabato sera', descrizione: 'Finisci 10 sfide' },
    { id: 'sfidaCompleta', nome: 'Maratona', descrizione: 'Finisci una sfida completa (tutti i microgiochi)' },
    { id: 'otto', nome: 'Tavolata', descrizione: 'Una sfida in 8 giocatori' },
    { id: 'cappotto', nome: 'Cappotto', descrizione: 'Vinci tutti i round di una sfida (almeno 3)' },
    { id: 'controSeStesso', nome: 'Specchio, specchio', descrizione: 'Gioca contro te stesso' },
    { id: 'zero', nome: 'Mani di burro', descrizione: 'Fai zero punti in un microgioco' },
    { id: 'nottambulo', nome: 'Nottambulo', descrizione: "Gioca tra mezzanotte e le cinque" },
    { id: 'cinquantaPinte', nome: 'Giro offerto', descrizione: 'Guadagna 50 Pinte in tutto' },
    { id: 'primoAcquisto', nome: 'Cliente affezionato', descrizione: 'Compra qualcosa al Bancone' },
    { id: 'guardaroba', nome: 'Guardaroba', descrizione: 'Metti un costume a un personaggio' },
    { id: 'abitudinario', nome: 'Abitudinario', descrizione: 'La sfida del giorno per 3 giorni di fila' },
    { id: 'rePallaio', nome: 'Re del Pallaio', descrizione: 'Vinci 5 partite a beer pong con lo stesso personaggio' },
  ],
  // i trofei "Oro a <microgioco>": nome e descrizione ({titolo} = il titolo del microgioco)
  oro: { nome: 'Oro: {titolo}', descrizione: "Prendi l'oro a {titolo}" },
};
