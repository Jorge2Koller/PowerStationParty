# Le canzoni di "Provini a X-Factor", per gli script (beatmap.py, griglia.py): una voce per canzone.
# (Nel gioco l'elenco corrispondente è "canzoni" in js/config/microgiochi/xfactor.js: titolo, artisti,
# ritagli e mappa. Una canzone nuova = una voce qui, una lì, e il lancio di beatmap.py.)
#
# Per ogni canzone:
#   id        il nome dei file: audio/<id>.mp3 (35 s), audio/<id>-lampo.mp3 (15 s) e la mappa
#             js/config/microgiochi/xfactor-<id>.json (nel sito)
#   intera    la canzone intera, in canzoni/ nella radice del repository: NON va su GitHub (è dei
#             cantanti: nel sito vanno solo i ritagli), canzoni/ è nel .gitignore
#   bpm       il tempo indicativo, da cui librosa parte a cercare i battiti
#   ritagli   i due tagli, in secondi della canzone intera (si spostano sul battito più vicino): il
#             microgioco (35 s) e il Lampo (15 s). Dentro ci devono essere tutti e due i cantanti, uno
#             dopo l'altro
#   atti      dove cominciano i tre atti, nella canzone: la strofa, il pezzo forte, il gran finale
#   voci      chi canta, e quando (secondi della canzone; i confini vanno sul battito più vicino):
#             'oli', 'tini' o 'insieme' (solo se l'abbiamo sentito a orecchio). Li trova
#             strumenti/voci.py, dalla voce isolata; poi si controllano ascoltando
#   densita   (facoltativo, di solito 1) quante note in più o in meno per battuta fa griglia.py: a
#             parità di livello le canzoni devono essere difficili più o meno uguali. Del tempo tiene
#             già conto griglia.py da solo (una canzone lenta ha le battute più lunghe: più note per
#             battuta, le stesse al secondo); questo serve solo per ritoccare
#   battuta   (facoltativo) un primo battito di battuta, in secondi della canzone: se no beatmap.py lo
#             cerca dai bassi, e con la cassa forte sull'1 e sul 3 a volte prende il 3
#   fissa     True = i ritagli e la mappa non si rifanno (beatmap.py la salta; griglia.py la rifà
#             solo se gliela si chiede per nome)
CANZONI = [
    {
        'id': 'fuori-dagli-schemi',
        'titolo': 'Fuori Dagli Schemi',
        'artisti': 'Corso Italia',
        'intera': 'canzoni/fuori-dagli-schemi.mp3',
        # (89,00 bpm fissi: le sezioni cambiano sui primi battiti)
        'bpm': 89,
        # l'intero: la strofa dell'Oli, che si alza quando entra la base piena, il Tini da 1:43, lo
        # stacco (1:51) e il secondo ritornello del Tini, forte come l'ultimo. Il Lampo: l'ultima frase
        # dell'Oli, il Tini, lo stacco e l'ingresso del ritornello
        'ritagli': {'intero': (86.840, 121.897), 'lampo': (100.323, 115.829)},
        # la strofa, il pezzo forte quando entra la base piena (1:34.9), il gran finale sul ritornello (1:53.8)
        'atti': [86.840, 94.930, 113.807],
        'battuta': 86.840,
        'voci': [
            (86.0, 103.0, 'oli'),      # l'Oli, anche a 1:32-1:38 dove la voce sale (confermato a orecchio)
            (103.0, 122.5, 'tini'),    # "il Tini parte da 1:43", poi il suo ritornello
        ],
        'densita': 1,
    },
    {
        'id': 'stare-up',
        'titolo': 'Stare Up',
        'artisti': 'Corso Italia',
        'intera': 'canzoni/stare-up.mp3',
        'bpm': 86,
        # l'intero: la strofa dell'Oli (sulla base vuota, poi entra il basso), il Tini che entra a 1:16
        # e il suo ritornello, fino a dove finisce (1:30). Il Lampo: l'ultimo pezzo dell'Oli e il Tini
        'ritagli': {'intero': (54.453, 89.969), 'lampo': (68.381, 83.702)},
        # la strofa, il pezzo forte quando entra il basso (1:02.8), il gran finale sul ritornello pieno (1:19.5)
        'atti': [54.453, 62.810, 79.524],
        'voci': [
            (8.6, 55.5, 'tini'),       # (l'inizio del ritaglio intero è la coda di una frase del Tini)
            (55.5, 76.0, 'oli'),       # la voce bassa: l'Oli (confermato a orecchio, "un po' più larga"
            (76.0, 89.8, 'tini'),      # di come l'aveva trovata strumenti/voci.py: fino a 1:16)
            (89.8, 95.0, 'oli'),       # (poi, fuori dai ritagli, quasi sempre il Tini)
        ],
        'densita': 1,
        # "Stare Up è perfetta" (Riccardo, 20 ottobre): i ritagli e la mappa restano questi
        'fissa': True,
    },
    {
        'id': 'stare-bene',
        'titolo': 'Stare Bene',
        'artisti': 'Corso Italia',
        'intera': 'canzoni/stare-bene.mp3',
        # (92,00 bpm fissi)
        'bpm': 92,
        # l'intero, dalla parte finale: la strofa bassa dell'Oli, lo stacco (2:02.6) e l'ultimo
        # ritornello, dove a 2:05 entra il Tini. Il Lampo: la fine della strofa dell'Oli, lo stacco e
        # l'ingresso del Tini
        'ritagli': {'intero': (112.182, 147.399), 'lampo': (117.399, 132.399)},
        # la strofa, il pezzo forte quando parte l'ultimo ritornello (2:05.2), il gran finale sulla sua
        # seconda metà, un filo più piena (2:15.7)
        'atti': [112.182, 125.224, 135.658],
        'battuta': 112.182,
        'voci': [
            (112.0, 125.0, 'oli'),     # l'Oli fino a 2:05
            (125.0, 147.5, 'tini'),    # il Tini nell'ultimo ritornello, a voce più bassa del solito (185 Hz):
        ],                             # il riconoscimento diceva "non sicuro", l'ha sentito Riccardo
        # (coi giocatori simulati, a NORMALE e DIFFICILE veniva un filo più difficile delle altre: con
        # meno note per battuta torna pari)
        'densita': {'normale': 0.8, 'difficile': 0.8},
    },
]


def per_id(id):
    return next(c for c in CANZONI if c['id'] == id)
