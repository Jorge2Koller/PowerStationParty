# PowerStation Party

Microgiochi in stile WarioWare con Phaser 3, da giocare in compagnia: da 1 a 8
giocatori sullo stesso schermo (ci si passa la tastiera o il telefono). Ognuno
sceglie il suo personaggio, tutti giocano lo stesso microgioco, un turno a testa,
e vince il round chi fa più punti.

I microgiochi sono ventuno:

| id | Titolo | Ospite |
|----|--------|--------|
| `spina` | La Spina del PowerStation | Beppe |
| `regrorio` | Arriva ReGrorio! | ReGrorio (Greg) |
| `barba` | La Barba di O'Sfurnacchiat | O'Sfurnacchiat (Marco) |
| `panino` | Il Panino di Marsupino | Marsupino |
| `mani` | Guerra, via quelle mani! | Guerra |
| `sego` | Sego, sono sotto casa! | Franci (Sego) |
| `ronda` | TorRONDAcelli | il Generale |
| `blackjack` | L'Ingiocabile | l'Ingiocabile |
| `palleggi` | MaraZio | lo Zio |
| `passaseo` | Il Passo del Passaseo | Passaseo |
| `bota` | Spalma il Bota! | il Bota |
| `guida` | Il Passaggiorgio | Giorgio |
| `piovra` | Petri Tentacolari | il Petri ("il Piovra") |
| `scapoli` | L'Incubo degli Scapoli | il Manna |
| `retromarcia` | Emilio in Retromarcia | Emilio (con Pastaffi e gli Shar Pei) |
| `beerpong` | Beer Pong al Pallaio | i veterani del Pallaio (lo Zio e Marsupino) |
| `xfactor` | Provini a X-Factor | i cantanti, Tini e Oli |
| `pizza` | La pizza dal Boni | il Boni (con Oli, il Sego e il Guerra imbucati) |
| `ballata` | La ballata del Pallaio | Lori, il cantastorie |
| `proverbi` | Le Perle di Denny | Denny (Pastaffi, il figlio di Emilio) |
| `scontrino` | Scontrino, prego! | Michele, alla cassa (col Giso, il paladino degli scontrini) |

Il beer pong c'è anche come **modalità** (la partita vera tra di voi, a tiri alternati): vedi
"Modalità" e "Beer pong" qui sotto.

Si gioca su computer (tastiera, mouse, trackpad) e sul telefono (iPhone e Android,
in orizzontale, col dito): vedi "Dal telefono" qui sotto.

## Avvio

Il gioco si apre attraverso il piccolo server locale incluso (`server.py`):
aprire `index.html` con un doppio clic non funziona, perché i browser non
caricano i moduli JavaScript letti direttamente dal disco.

Il server parte sulla prima porta libera dalla 8080 in su, apre il browser e dice
di non tenere i file in cache, così dopo una modifica basta ricaricare la pagina.
Per chiuderlo: CTRL+C nella sua finestra (o chiudi la finestra).
Con `--no-browser` non apre il browser.
Phaser è nella cartella del gioco (`js/vendor/phaser.min.js`), quindi funziona anche
senza internet; il font Fredoka arriva da Google Fonts e, se manca la rete, si usa
un font di sistema simile.

### Windows

Doppio clic su `avvia.bat`, oppure da terminale nella cartella del gioco:

```bash
py server.py
```

### Mac

Doppio clic su `avvia.command`: si apre il Terminale, parte il server e si apre
il browser. Da terminale, nella cartella del gioco:

```bash
python3 server.py
```

La prima volta possono servire due passaggi (capita quando la cartella arriva da
uno zip, da WhatsApp o da una chiavetta):

1. **Renderlo eseguibile**: se il doppio clic apre `avvia.command` in un editor di
   testo, oppure dice che non hai i permessi. Apri il Terminale, scrivi `chmod +x `
   (con lo spazio finale), trascina `avvia.command` nella finestra e premi INVIO.
   È come scrivere, dalla cartella del gioco:

   ```bash
   chmod +x avvia.command
   ```

2. **Sbloccarlo**: se macOS dice che non può aprirlo perché proviene da uno
   sviluppatore non identificato, fai tasto destro (o CTRL+clic) su
   `avvia.command` → **Apri** → **Apri**. Basta farlo una volta.
   Da macOS 15 (Sequoia) quella voce non c'è più: dopo il primo tentativo vai in
   Impostazioni di Sistema → Privacy e sicurezza e, in fondo, premi **Apri comunque**.
   In alternativa, dal Terminale nella cartella del gioco:

   ```bash
   xattr -d com.apple.quarantine avvia.command
   ```

Se Python 3 manca, al primo avvio macOS propone di installare gli "Strumenti da
riga di comando" (accetta), oppure si scarica da https://www.python.org/downloads/.

### Linux

Da terminale nella cartella del gioco: `python3 server.py` (oppure `./avvia.command`).

### Browser

Chrome, Edge, Firefox e Safari. Per i Safari più vecchi (iPhone con iOS 15 o
precedenti, Mac non aggiornati) `js/compat.js` aggiunge al canvas quello che manca.

## Dal telefono

Il gioco si tiene in **orizzontale**: in verticale compare "Gira il telefono" e,
se si stava giocando, il microgioco va in pausa (anche quando arriva una telefonata
o si passa a un'altra app). Sul telefono non ci sono ESC e M: mentre si gioca, in alto a
destra c'è il pulsante **pausa**, che vuole **due tocchi** (al primo si accende e sotto dice
ANCORA: giocando lo si sfiorava e la partita si fermava). L'**audio** si accende e spegne dal
pulsante in alto a destra del menu e della pausa; nel menu c'è anche **schermo intero** dove il
browser lo permette (Android sì, iPhone no: lì si usa la schermata Home, sotto).

### Stessa Wi-Fi, col computer acceso

Doppio clic su `avvia-telefono.command` (Mac) o `avvia-telefono.bat` (Windows),
oppure da terminale:

```bash
python3 server.py --rete
```

Nella finestra compare l'indirizzo da scrivere sul telefono, tipo
`http://192.168.1.23:8080`. Telefono e computer devono essere sulla stessa Wi-Fi.
La prima volta il computer può chiedere se consentire le connessioni in entrata a
Python: rispondi **Consenti**. Il computer deve restare acceso col server aperto.

### Da ovunque, col computer spento: GitHub Pages

Il gioco è fatto solo di file, quindi si può pubblicare gratis come sito:

1. Fai un account su https://github.com e crea un repository nuovo, per esempio
   `powerstation-party` (con l'account gratuito deve essere **pubblico**: chiunque
   abbia il link vede il gioco e i file).
2. Dalla cartella del gioco (è già un repository git) caricalo:

   ```bash
   git remote add origin https://github.com/TUONOME/powerstation-party.git
   ```

   ```bash
   git push -u origin main
   ```

   (GitHub chiede di accedere; in alternativa si può usare GitHub Desktop.)
3. Su GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**,
   branch `main`, cartella `/ (root)`, **Save**.
4. Dopo un paio di minuti il gioco è su `https://TUONOME.github.io/powerstation-party/`:
   mandati il link e aprilo dal telefono.
5. Per aggiornarlo dopo una modifica: `git commit` e `git push`, e in un minuto
   il sito è aggiornato.

In alternativa, senza git: trascina la cartella del gioco su
https://app.netlify.com/drop (serve un account gratuito per tenerlo online).

**Il nostro repository** è `Jorge2Koller/PowerStationParty`, e il gioco sta nella cartella
**`PowerStation Party - sito`** (il nome non va cambiato: il link del sito dipende da lui).
Per aggiornarlo dal sito di GitHub, senza git: apri quella cartella, **Add file → Upload
files**, e trascina il *contenuto* di questa cartella (non la cartella stessa): `index.html`,
`manifest.json`, `sw.js`, `README.md`, `server.py`, gli `avvia*`, `prova-musiche.html` (la pagina
per ascoltare le musiche: facoltativa) e le cartelle `audio/`, `icone/` e `js/`. **Non** caricare `test/` e `note/` (prove automatiche e appunti: non fanno parte del
gioco). Poi **Commit changes**. I file con lo stesso nome vengono sostituiti.

### Come un'app: schermata Home e gioco offline

- **iPhone (Safari)**: Condividi → **Aggiungi alla schermata Home**.
- **Android (Chrome)**: menu ⋮ → **Installa app** (o Aggiungi a schermata Home).

Così si apre a tutto schermo, senza le barre del browser. Dal sito https (GitHub
Pages) dopo la prima apertura il gioco funziona anche **senza internet**
(`sw.js`); dall'indirizzo di casa `http://192.168...` no, perché i browser lo
permettono solo su https. Il service worker ricontrolla ogni file col server (se non è
cambiato costa pochissimo), così dopo un aggiornamento su GitHub non si mescolano file vecchi
e nuovi; se il telefono mostra ancora la versione di prima, basta chiudere e riaprire il gioco.

Su iPhone l'audio parte al primo tocco e rispetta l'interruttore del silenzioso:
se non si sente niente, controlla che il telefono non sia in modalità silenziosa.

### Risoluzione

Sul computer il gioco si disegna a 1920x1080 (`RES = 4`); su telefoni e tablet a
1440x810 (`RES = 3`): metà dei pixel e metà della memoria per le texture, che su
iPhone hanno un tetto e sui telefoni economici pesano. Sullo schermo di un telefono
resta nitido. Per provare: `index.html?res=2` (o 3, 4) forza la risoluzione,
`index.html?touch=1` mostra dal computer i testi e i pulsanti del telefono,
`index.html?seme=1234` fa giocare sempre lo stesso round (stesse uscite, stesse carte), per
rifare una partita uguale mentre si prova qualcosa.

## Modalità

Dal menu, **GIOCA** porta a tre schermate, una dopo l'altra:

1. **Quanti siete?** Da 1 a 8 (`maxGiocatori` in `js/config.js`): frecce e INVIO, il
   tasto del numero, oppure un clic o un tocco sulla casella.
2. **Scegliete il personaggio**, uno alla volta, come nei picchiaduro: una griglia di
   ritratti, a sinistra l'anteprima in grande con nome, soprannome e motto. Un
   personaggio già preso non si può riprendere (resta in grigio, col numero di chi
   l'ha scelto); "A CASO" ne pesca uno libero. BACKSPACE o ESC (col dito: un tocco
   sul giocatore nella fila in basso) toglie l'ultima scelta.
3. **La modalità**, in gruppi:
   - **SFIDE**
     - **Sfida completa**: tutti e 19 i microgiochi, nell'ordine di `ordineSfida`.
     - **Sfida rapida** da 3, 5 o 8 microgiochi pescati a caso (`sfidaRapida`).
     - **Al meglio di 3** o **di 5** (`alMeglioDi`): microgiochi pescati a caso, vince
       chi per primo vince 2 round (o 3). Se i microgiochi finissero prima, decide la
       classifica.
   - **PARTY**
     - **Lampo**: 6 microgiochi da 15 secondi, e si parte subito (niente 3-2-1). I punti,
       più corti, non contano per medaglie e record (si vince con la condizione del microgioco).
     - **Squadre** (da 4 giocatori): ROSSI contro BLU, in ordine di scelta (il 1°, il 3°,
       il 5°... sono rossi; il 2°, il 4°... blu). A ogni round conta la media dei punti
       sfida della squadra, così vale anche con squadre dispari. Vince la squadra con più
       punti; nel profilo la sfida vale per tutti i suoi giocatori.
     - **Torneo** (da 4 a 8 giocatori): tabellone a eliminazione diretta. Ogni partita è
       una sfida a due su un microgioco a caso; chi fa più punti passa (pari: si rigioca
       con un altro microgioco). Se non si è 4 o 8, al primo turno qualcuno passa senza
       giocare. Dopo ogni partita si vede il tabellone.
     - **Beer Pong** (da 2 a 6 giocatori, gratis): la partita vera al tavolo del Pallaio, a tiri
       alternati, ROSSI contro BLU (vedi "Beer pong" qui sotto).
   - **Partita singola**: un solo microgioco, scelto nella sala dei microgiochi (vedi "La sala dei
     microgiochi" qui sotto).
   - **Livelli**: il livello di ogni giocatore (vedi "Livelli" qui sotto).

   Da soli:
   - **Allenamento**: un microgioco a scelta (nella sala dei microgiochi), da rigiocare quanto si vuole.
   - **Da solo**: 7 microgiochi a caso e il **boss**, con 4 vite.
     Senza una medaglia si perde una vita; il boss è un microgioco a DIFFICILE e per
     batterlo serve almeno l'argento (10 Pinte in premio). Alla fine il conto e il record.
   - **Sfida del giorno**: ogni giorno 5 microgiochi, uguali per tutti quel giorno (stessi
     microgiochi, stesso mazzo, stesse Golf...), a livello NORMALE. Si può rigiocare: resta
     il punteggio migliore del giorno; la prima volta valgono 5 Pinte, e si contano i giorni
     di fila.

   Numeri e regole di Lampo, Da solo, Squadre, Torneo, Sfida del giorno e Beer Pong sono in
   `js/config/modalita.js`.

Il gioco ricorda i personaggi dell'ultima partita (nel salvataggio, vedi sotto): la volta
dopo le schermate arrivano già compilate e per rigiocare uguale basta premere INVIO fino
in fondo.

### Impostazioni e salvataggio

Dal menu (e dalla pausa) **IMPOSTAZIONI**: volume della **musica** e degli **effetti**,
**audio** sì/no, **vibrazione** sì/no (dove il telefono la ha: Android), **difficoltà di
partenza**, **prova** (dove parte il cursore prima dei microgiochi nuovi), **velocità dei testi** (quanto
restano a schermo scritte e fumetti), **schermo che trema** sì/no e **ritardo audio**. Si cambiano con le
frecce (SU/GIÙ la riga, SINISTRA/DESTRA il valore) o toccando direttamente i comandi, e si
salvano da sole. La **difficoltà di partenza** è il livello di chi non ne ha scelto uno
(vedi "Livelli" qui sotto).

**Ritardo audio** (0 di serie, da 0 a 500 ms): con le cuffie Bluetooth o la TV il suono arriva
in ritardo, e nei giochi a tempo di musica (L'Incubo degli Scapoli, Provini a X-Factor) le note
sembrano sfasate. Si regola a mano con SINISTRA/DESTRA (di 10 in 10) oppure con **PROVA**: parte
una serie di BIP e si tocca (o si preme SPAZIO) a ogni BIP, ascoltando e senza guardare lo
schermo; il gioco misura di quanto si arriva in ritardo e salva il numero. Quei giochi spostano
il tempo di gioco di quanto indicato.

**La prova**: nell'introduzione di ogni turno ci sono due pulsanti, **PROVA** e **PRONTO!** (frecce
e SPAZIO o INVIO, P per la prova, oppure un clic o un tocco). La prova è una partita come quella vera,
ma con un'altra serata (un altro seme: non si impara la partita vera) e che non conta: la barra del
tempo è rosa e in alto a sinistra, al posto del nome, c'è il pulsante **PRONTO!** (sul computer anche
ESC, come lo START dei vecchi giochi). Quando finisce ricomincia, finché chi gioca non preme PRONTO;
allora si torna all'introduzione e parte subito il conto alla rovescia della partita vera. Ognuno, al
suo turno, può provare quanto vuole. L'impostazione **Prova** (accesa di serie) fa partire il cursore
su PROVA per i microgiochi mai giocati su quel telefono o computer (se no parte su PRONTO!).

### La sala dei microgiochi

Allenamento e Partita singola si scelgono in una sala come quella dei party game: in basso una griglia
di riquadri, uno per microgioco, con la sua foto; quello scelto ha la cornice gialla e il nome in
un'etichetta, e in alto c'è l'anteprima in grande (tre foto del microgioco che si alternano) col
titolo, il comando, l'obiettivo, la durata, il record e la medaglia migliore. Sui riquadri: la
medaglia migliore (di chi gioca da solo, o di chiunque) e un angolino rosso con la stellina per i
microgiochi mai giocati su quel telefono o computer. Col mouse basta passare sopra un riquadro per
vederne l'anteprima, e col clic si gioca; col dito il primo tocco sceglie e il secondo (o GIOCA!) fa
partire; da tastiera le frecce e INVIO. **A CASO** (o R) fa saltare il cursore tra i riquadri e si
gioca dove si ferma. Da soli, in alto a destra, il livello (L, o un tocco).

Le foto sono in `icone/anteprime/` (`<id>.webp` il riquadro, `<id>-1.webp`... le tre dell'anteprima):
le scatta `strumenti/anteprime.py`, che apre ogni microgioco nel browser, lo gioca un po' a caso e lo
ferma in tre momenti. Si rilancia quando un microgioco cambia aspetto (anche uno solo:
`anteprime.py scontrino`). Se una foto manca, il riquadro ha il colore del microgioco col titolo.

Tutto quello che il gioco ricorda sta in un **salvataggio** unico (`js/salvataggio.js`, nel
`localStorage` del browser): impostazioni, personaggi dell'ultima partita, un registro degli
ultimi punteggi di ogni microgioco (serve a ritarare le medaglie) e, più avanti, statistiche,
record, trofei e Pinte. Ha un numero di versione: quando la forma dei dati cambia, i
salvataggi vecchi si aggiornano da soli (dalla versione 2, con i punti di tutti i microgiochi
sulla stessa scala, i record e i "migliore" ripartono da zero; trofei, medaglie e Pinte restano,
e chi aveva comprato Lampo o Da solo riprende le sue 30 Pinte). Al primo avvio il gioco chiede
al browser di non cancellare i suoi dati (`navigator.storage.persist()`: Safari li può togliere
ai siti aperti di rado). In navigazione privata, o se il browser non lascia salvare, il gioco
funziona lo stesso ma non ricorda niente.

Sempre dalle Impostazioni, alla riga **Salvataggio**:
- **ESPORTA**: il salvataggio diventa un codice di testo (comincia con `PSP2-`) da copiare e
  mandarsi, per esempio su WhatsApp;
- **IMPORTA**: sull'altro telefono si incolla il codice e si ritrova tutto (sostituisce
  quello che c'era; un codice tagliato o modificato viene rifiutato);
- **AZZERA**: si ricomincia da capo. Serve una doppia conferma (il pulsante diventa
  "SICURO?", poi una finestra con "AZZERA TUTTO").

### Prima e dopo i microgiochi

- **Menu**: la copertina del gioco (`icone/copertina.webp`, l'unica immagine non disegnata col
  codice) sta a sinistra, intera, e le voci in una colonna a destra, così non coprono le facce;
  dietro, la stessa copertina sfocata e scurita. Se non si carica, il menu si disegna come prima
  (personaggi e voci al centro). La copertina è anche
  l'icona dell'app (`icone/icona-*.png`) e l'anteprima quando si condivide il link
  (`icone/copertina-og.jpg`: per WhatsApp e simili funziona meglio quando il gioco è su
  GitHub Pages).
- **NOVITÀ**: dopo un aggiornamento, all'avvio si apre da sola la schermata con le novità
  (testi in `js/config/novita.js`: per un aggiornamento nuovo si cambia `versione`); si
  rivede dal menu.
- **Il comando in una parola**: ogni microgioco ha il suo verbo (SPILLA!, SCHIVA!, BALLA!...,
  `verbo` nel suo file di configurazione): si vede sotto il titolo (anche quando il titolo va su
  due righe) e chiude il conto alla rovescia al posto di VIA!. Durante il 3-2-1 l'introduzione
  si scurisce, così il numero si legge sopra il riquadro dei comandi.
- **Risultati**: il punteggio sale con un ticchettio, poi arriva la **medaglia** (bronzo,
  argento o oro) col timbro; accanto, quanto manca alla prossima. Il riquadro si allunga col
  riepilogo (una o due righe) e i trofei appena presi arrivano dal basso, senza coprire
  VITTORIA! o SCONFITTA. **Vince chi prende la medaglia**: col bronzo (o meglio) è VITTORIA,
  senza è SCONFITTA, in tutti i microgiochi (la regola è in un posto solo,
  `MicrogiocoBase.termina`). L'obiettivo scritto nei comandi (4 guidate, 3 SÌ, 3 ragazze...) è
  tarato per coincidere col bronzo; il finale animato e il titolo seguono sempre il risultato.
  In Lampo, dove le medaglie non contano, decide l'obiettivo del microgioco.
- **Premi buffi**: a fine sfida, prima della classifica finale, fino a tre premi ("Lo
  specialista", "Mani di burro", "L'eterno secondo", "Il diesel"...), calcolati dai punti
  sfida dei round (`js/premi.js`, titoli e frasi in `js/config/premi.js`).
- **Musiche**: vedi "Musiche" qui sotto.
- Le schermate entrano con una dissolvenza veloce.

### Musiche

Tutte le musiche sono **8 bit e originali**: melodie, giri di accordi e arrangiamenti sono stati
inventati per il gioco (nessuna melodia esistente, nemmeno "quasi uguale"), nello stile delle musiche
allegre dei giochi per famiglie: tonalità maggiori (il minore solo per il "di nascosto"), brani brevi
che girano in loop (due parti da 8 battute), basso che rimbalza, melodia staccata e saltellante,
domanda e risposta tra due strumenti, batteria leggera. Gli strumenti sono quelli dei vecchi giochi:
onda quadra al 50% e al 25% (o al 12,5%) per la melodia, triangolo per il basso, rumore per la
batteria, arpeggi veloci per gli accordi e un po' di vibrato sulle note lunghe. Si generano nel codice,
senza file audio (il gioco resta leggero sul telefono).

Ogni musica è scritta **in un posto solo**, `js/config/musiche.js` (tempo, tonalità, accordi in numeri
romani, note in gradi della scala, basso, batteria, strumenti: in cima al file c'è come si scrive), e la
suona il sequencer di `js/audio.js`. Un microgioco la sceglie col campo `musica` della sua
configurazione.

Durante un microgioco la musica **cresce in tre atti** (un terzo del tempo l'uno, anche nel Lampo da
15 secondi): nel secondo entrano la seconda voce (o gli arpeggi) e la batteria piena, nel terzo il
tempo sale del 5-7% oppure la musica sale di un tono; negli **ultimi 5 secondi** la batteria fa il
riempimento. I cambi arrivano a inizio battuta. In **pausa** la musica si ferma e riparte da lì; quando
il microgioco finisce si spegne subito, senza code, e partono i jingle. Volume, audio spento e Ritardo
audio delle Impostazioni valgono come sempre; i volumi delle musiche sono pareggiati tra loro (`volume`
di ogni musica).

| Microgioco | Musica (`musica`) | Carattere | Tempo | Tonalità | Atto 3 |
| --- | --- | --- | --- | --- | --- |
| Menu e schermate | `menu` | il tema del gioco, da fischiettare | 112 | Do maggiore | (nei menu: dal secondo giro il secondo atto) |
| La Spina del PowerStation | `bar` | bar allegro, swing morbido | 116 | Fa maggiore | +6% |
| Arriva ReGrorio! | `strada` | corsa in strada, energica | 150 | La maggiore | un tono sopra |
| La Barba di O'Sfurnacchiat | `barbiere` | bottega del barbiere, pizzicato scherzoso | 104 | Sol maggiore | +6% |
| Il Panino di Marsupino | `cucina` | cucina che rimbalza | 128 | Do maggiore | un tono sopra |
| Guerra, via quelle mani! | `comica` | comica, staccata, a scatti | 140 | Re maggiore | +7% |
| Sego, sono sotto casa! | `nascosto` | di nascosto ma divertente (passi felpati) | 110 | Re minore, ritornello in Fa maggiore | +5% |
| TorRONDAcelli | `marcia` | marcia militare buffa | 120 | Si♭ maggiore | un tono sopra |
| L'Ingiocabile | `casino` | casinò, lounge jazz swing | 96 | Mi♭ maggiore | +5% |
| MaraZio | `stadio` | sportiva, da stadio | 132 | Mi maggiore | un tono sopra |
| Spalma il Bota! | `calypso` | spiaggia, calypso | 108 | Re maggiore | +6% |
| Il Passaggiorgio | `parcheggio` | notte in parcheggio, funky | 118 | Sol maggiore | +6% |
| Petri Tentacolari | `disco` | disco | 124 | La maggiore | un tono sopra |
| Emilio in Retromarcia | `rock` | rock dell'autoradio | 150 | Mi maggiore | un tono sopra |
| Beer Pong al Pallaio | `pallaio` | festa al bar | 118 | Do maggiore | +6% |
| La pizza dal Boni | `osteria` | osteria, tarantella in 6/8 | 112 | Sol maggiore | +7% |
| Le Perle di Denny | `quiz` | quiz, rilassata e sorniona | 100 | Fa maggiore | +5% |
| Scontrino, prego! | `guardie` | guardie e ladri, comica e staccata | 126 | Si♭ maggiore | +7% |

**Musiche che non cambiano**: i giochi a tempo di musica hanno note, battute o colpi sincronizzati con
la base, quindi tengono la loro (in `TRACCE`, in `js/audio.js`): L'Incubo degli Scapoli (`pista`),
Provini a X-Factor (la canzone vera, `silenzio`), La ballata del Pallaio (`ballata`) e Il Passo del
Passaseo (`corsa`, che accelera verso la fine come prima). Premi buffi, classifica finale e la modalità
Beer Pong usano `festa`.

**Jingle** (2-4 secondi, scritti come le musiche, in `JINGLE`): vittoria e sconfitta (dopo ogni turno;
se il finale del microgioco l'ha appena suonato, la schermata del risultato non lo ripete), medaglia
di bronzo, d'argento e d'oro (al timbro della medaglia), trofeo, e il conto alla rovescia (3, 2, 1, VIA!
è una frase sola: durante il conto la musica tace).

**Per ascoltarle**: `prova-musiche.html` (dal server del gioco, anche dal telefono: per esempio
`http://192.168.1.23:8080/prova-musiche.html`) ha un pulsante per ogni musica e ogni jingle, e si
sceglie l'atto (1, 2, 3, ultimi 5 secondi). Non è collegata al gioco e non serve per giocare.

### Livelli: FACILE, NORMALE, DIFFICILE (e l'handicap)

Ogni microgioco ha tre livelli. NORMALE è quello di sempre; FACILE e DIFFICILE cambiano
qualche valore (zona verde più larga o più stretta, mani e Golf più lente o più veloci, più o
meno tempo per decidere...): sono in `livelli` in fondo al file di configurazione di ogni
microgioco (`js/config/microgiochi/<id>.js`, spiegati in `js/livelli.js`).

Il livello è **di ogni giocatore**: così in una sfida chi è più forte può giocare a DIFFICILE e
chi comincia a FACILE (l'handicap). Si sceglie da **GIOCA**, nella schermata della modalità, con
la voce **LIVELLI** (SU/GIÙ il giocatore, SINISTRA/DESTRA il livello, o toccandolo); da soli,
nella lista dei microgiochi, con L (o toccando la scritta in basso). Il livello di ogni
personaggio si ricorda; chi non l'ha mai scelto usa la difficoltà di partenza delle
Impostazioni. Nell'introduzione, sotto al nome di chi gioca, c'è il suo livello.
Le medaglie hanno le stesse soglie a tutti i livelli (a FACILE si prendono più facilmente:
è l'handicap).

### Pinte, Bancone, Profilo e trofei

- **Pinte**: si guadagnano giocando (1 per un bronzo, 2 per un argento, 3 per un oro; a fine
  sfida 3 più una per ogni round; 5 per ogni trofeo; 5 per la prima sfida del giorno; 4 per una
  partita di beer pong) e si vedono in alto a sinistra nel menu.
  Sono una per telefono o computer, non per giocatore. Le quantità sono in
  `js/config/bancone.js`.
- **BANCONE** (dal menu): Beppe vende con le Pinte
  - **costumi** (occhiali da sole, cuffie da DJ, bandana, basco, occhiali rosa, cappuccio,
    corona): si comprano una volta e si mettono a qualunque personaggio (uno a testa; dalla fila
    dei personaggi si mettono e si tolgono). Il personaggio lo porta in tutto il gioco;
  - **temi**: il disegno dello sfondo delle schermate (raggi, pois, scacchi, strisce, cielo
    stellato), sempre coi colori di ogni schermata;
  - **frasi**: pacchetti di sfottò in più per la classifica finale.
  Si comprano solo cose cosmetiche: tutte le modalità sono gratis, e i personaggi giocabili
  sono tutti disponibili da subito.
- **PROFILO** (dal menu), quattro schede: i **personaggi** (microgiochi giocati, sfide e round
  vinti, medaglie, le partite vinte a beer pong, e la medaglia migliore in ogni microgioco), i
  **trofei** (44: ventitré generali e uno "Oro a ..." per ogni microgioco), i **record** di sempre di ogni microgioco
  (punteggio, chi e quando) e l'**albo d'oro** delle ultime sfide (chi ha vinto).
- Dopo ogni turno: le Pinte guadagnate accanto alla medaglia e, se è il caso, NUOVO RECORD!;
  i trofei appena presi scendono dall'alto. Tutto sta nel salvataggio (e quindi si esporta e
  si importa con lui). La logica è in `js/progressi.js`; nomi e descrizioni dei trofei in
  `js/config/trofei.js`.

### Turni

Ogni round è un microgioco, e lo giocano tutti, uno dopo l'altro; a ogni round
comincia il giocatore dopo. Tutti trovano la stessa partita (stesso mazzo a
blackjack, per dire). Da tre giocatori in su, tra un turno e l'altro compare
"TOCCA A [NOME]!" col personaggio in grande: è il momento di passare la tastiera o
il telefono, e si parte solo quando chi deve giocare preme SPAZIO (o INVIO) o
tocca lo schermo. Nell'introduzione e durante il microgioco c'è il punteggio da
battere e di chi è: "RECORD: 85 (Sego)".

Finito il round, da tre giocatori in su ci sono due schermate: la **classifica del
round** (tutti in fila dal primo all'ultimo, coi punti fatti e quelli guadagnati)
e la **classifica generale**, con le barre che crescono e i sorpassi. In due, dopo il
risultato del round (chi l'ha vinto e il totale dei punti sfida) arriva anche la classifica
generale con le barre, così si vede come si mette prima della fine.

### Chi vince

- **In due**: nella sfida completa, in quella rapida e nella partita singola vince chi fa
  più **punti sfida** (a parità, chi ha vinto più round); al meglio di 3 o 5 contano i
  **round vinti** (un round pari non conta e se ne gioca un altro; a parità, i punti sfida).
- **Punti sfida**: tutti i microgiochi hanno la stessa scala di punti (bronzo circa 100,
  argento 200, oro 300; un record da campione sta sui 350-400), così lo stesso numero vuol
  dire la stessa cosa ovunque. Per sommarli, ogni punteggio diventa comunque un numero da 0 a
  100 grazie alle tre **medaglie** del microgioco (`medaglie: { bronzo, argento, oro }` nel suo
  file di configurazione): bronzo = 40, argento = 70, oro = 90, e in mezzo in proporzione
  (`js/punteggi.js`). A schermo, durante il gioco e nei risultati, si vede sempre il punteggio
  vero del microgioco. Dove anche chi non fa niente prende punti si può mettere `zero` (fino a
  lì vale 0).
- **Da tre in su** contano i **punti classifica**: a ogni round, in N giocatori, il
  primo ne prende N, il secondo N-1 e così via fino all'ultimo, che ne prende 1.
  A pari punteggio, pari posizione e stessi punti (due primi, poi il terzo). La
  tabella si può cambiare con `puntiPosizione` in `js/config.js`, per esempio
  `{ 3: [4, 2, 1], 4: [5, 3, 2, 1] }`. A parità di punti classifica vince chi ha
  vinto più round; se ancora pari, chi ha fatto più punti in tutto nei
  microgiochi; se ancora pari, è pari merito (e la corona va a tutti i primi).
  Al meglio di 3 o 5 contano prima i round vinti, poi i punti classifica, poi i
  punti dei microgiochi; un round finito pari in cima lo vincono tutti i primi.

Alla fine: in due la schermata di sempre, da tre in su il **podio** coi primi tre
sui gradini e gli altri in fila sotto. Da lì: **Rivincita** (stessi giocatori e
stessa modalità; i microgiochi a caso si ripescano), **Cambia personaggi**, **Salva il podio**
(la foto della classifica, col nome del gioco e la data: sul telefono si condivide, per esempio
su WhatsApp, sul computer si scarica) e **Menu**.
Le frasi di sfottò sono in `js/config/frasi.js`: `sfotto` (con `{primo}` e `{ultimo}`) e,
da tre giocatori in su, anche `sfottoTanti` (con `{secondo}` e `{tutti}`).

### Contro se stesso

Chi sceglie un personaggio che è anche l'ospite di un microgioco (il Manna
nell'Incubo degli Scapoli, ReGrorio in "Arriva ReGrorio!"...) quel microgioco lo
gioca lo stesso, contro la versione di sé mossa dal computer: nell'introduzione
compare il timbro "CONTRO SE STESSO!" e, dove il giocatore si vede in scena, entra
il suo **doppione**: lo stesso personaggio travestito con occhiali finti, nasone e
baffi, così i due non si confondono. Il microgioco non cambia di una virgola.
Vale anche per i personaggi di contorno, elencati in `cast` nella sezione del
microgioco (Pastaffi in "Emilio in Retromarcia", Oli in "Provini a X-Factor"). Pastaffi è anche
Denny, l'ospite di "Le Perle di Denny": chi lo sceglie lì gioca contro se stesso. In "Scontrino,
prego!" giocano contro se stessi Michele (l'ospite, alla cassa) e il Giso (nel `cast`): il vice
del Giso, lì, è il doppione.

### Beer pong

Il beer pong c'è in due forme, che usano lo stesso motore (`js/beerpong/`), così non divergono:
il **microgioco** "Beer Pong al Pallaio" (contro i veterani, come gli altri) e la
**modalità** BEER PONG del gruppo PARTY (la partita vera tra di voi).

**Il tiro.** Si guarda il tavolo da dietro le spalle di chi tira: i propri bicchieri davanti, quelli
avversari in fondo, a triangolo. Col mouse si preme, si tira indietro e si lascia (come una
fionda); col dito si dà una fiondata verso i bicchieri. Il verso del gesto è la mira, la lunghezza
la forza; mentre si mira si vede solo il primo tratto della traiettoria, tratteggiato. Da tastiera:
FRECCE per mirare, SPAZIO tenuto per la forza (sale e scende), al rilascio parte. La pallina può
entrare (SPLASH), rimbalzare sul tavolo e poi entrare (RIMBALZO!, vale doppio), girare sul bordo e
uscire, fermarsi contro la rete o uscire dal tavolo.

**La sbronza.** Ogni bicchiere che ti centrano lo bevi, e si sale di livello: LUCIDO, ALLEGRO
(guance rosse, e ogni tanto un HIC! che fa sobbalzare la mira), BRILLO (la mira oscilla piano e
ogni tanto la vista si sdoppia), SBRONZO (tutta la visuale ondeggia come una barca, i bicchieri si
vedono doppi: quello vero sta fermo, il fantasma gira piano ed è un po' più trasparente; fumetti con
le parole storpiate). L'ondeggiamento dello schermo c'è solo se nelle Impostazioni "Schermo che
trema" è acceso. Per lasciare possibile la rimonta c'è la **fortuna dell'ubriaco**: più si è
bevuto, più il bordo perdona. Soglie, forza degli effetti e fortuna sono in `sbronza`, in
`js/config/beerpong.js`.

**Le gag.** Quando la pallina esce dal tavolo, ogni tanto parte una gag a caso: colpisce in fronte
uno che guarda, finisce nel bicchiere di chi beveva in disparte, fa dondolare la lampadina, se la
prende al volo Morgan (ed Emilio lo insegue), vola fuori dalla finestra ("AHIA!"). L'elenco è
`gag.lista` in `js/config/beerpong.js` (quanto spesso, con che frasi); per aggiungerne una: una riga
lì e la sua funzione, con lo stesso `id`, in `js/beerpong/gag.js`.

**Le reazioni.** A ogni centro chi tira esulta con la sua frase e il pubblico fa il tifo; con due
centri di fila si va IN FIAMME! (solo un effetto); l'ultimo bicchiere arriva al rallentatore, con lo
zoom sulla pallina e il rullo di tamburi.

**La modalità** (da 2 a 6 giocatori, gratis: GIOCA, poi PARTY, poi BEER PONG):
- 2 giocatori = 1 contro 1, 4 = 2 contro 2, 6 = 3 contro 3; con 3 o 5 l'ultimo scelto fa
  l'**arbitro** (sta a bordo tavolo e commenta). Squadre ROSSI e BLU in ordine di scelta, come in
  Squadre; prima di cominciare c'è la schermata delle squadre.
- 6 bicchieri a testa nell'1 contro 1, 10 a squadra negli altri.
- Si tira a turno, alternando le squadre e, dentro una squadra, i giocatori. Prima di ogni tiro
  "TOCCA A [NOME]!": la visuale passa dietro di lui e si parte quando prende i comandi (SPAZIO, un
  clic o un tocco). Ognuno tira al suo livello (FACILE, NORMALE, DIFFICILE: l'handicap).
- Di rimbalzo vale doppio: se ne va anche il bicchiere più vicino.
- Vince chi toglie per primo tutti i bicchieri avversari. C'è un tempo massimo (4 minuti di gioco:
  il passaggio di mano non conta): allo scadere si finisce il giro e vince chi ha più bicchieri in
  piedi; se sono pari, un tiro a testa a oltranza.
- La sbronza vale per tutta la squadra che perde il bicchiere.
- Alla fine i vincitori fanno il giro del tavolo coi coriandoli e il bicchiere alzato; i perdenti,
  se sono SBRONZI, dormono col mento sulle braccia incrociate e una giacca buttata sulle spalle,
  se no cantano stonati
  abbracciati all'arbitro. Poi la frase di sfottò e Rivincita, Cambia personaggi, Menu.
- Nel salvataggio conta come le altre: Pinte (`pinte.beerpong` in `js/config/bancone.js`), albo
  d'oro, sfide e vittorie dei personaggi (nel Profilo c'è anche la riga "Beer pong"), e il trofeo
  "Re del Pallaio" (5 vittorie con lo stesso personaggio).

Dove si cambiano i numeri: il tiro, la sbronza, le gag e le reazioni in `js/config/beerpong.js`
(valgono per tutte e due le forme); i veterani, i punti e le medaglie del microgioco in
`js/config/microgiochi/beerpong.js`; squadre, bicchieri, tempo, frasi dell'arbitro e di sfottò della
modalità nel blocco `beerpong` di `js/config/modalita.js`.

## Comandi

- Menu: frecce + INVIO, oppure il mouse, oppure il dito (un tocco = scegli)
- La Spina del PowerStation (SPILLA!): tieni premuto SPAZIO, rilascia nella zona verde
  (al centro, la striscia gialla: PERFETTA). Col dito (o col mouse): tieni il dito in
  qualunque punto dello schermo e alzalo nella zona verde (il pulsante SPILLA in basso è
  solo un promemoria)
  - i clienti ordinano pinte, boccali (grandi: si riempiono piano) e calici (zona verde
    strettissima)
  - tre atti a fasi, ognuno più difficile: SPILLA! (solo pinte); dal 12° secondo ORA DI PUNTA!
    (più veloce, arrivano boccali e calici, e la zona verde cambia altezza da un bicchiere
    all'altro); dal 24° LO ZERE SI SCATENA!: ogni tanto alza la vuvuzela blu, prende fiato (sopra
    di lui un "!") e la suona, e finché suona la zona verde balla e il bicchiere trema. In Lampo
    gli atti cominciano a 0, 5 e 10 secondi
  - lo Zere sta in piedi a destra del bancone e fa il tifo (nei primi due atti dà un colpetto di
    vuvuzela a ogni PERFETTA); il bar è pieno: due avventori in piedi con la pinta che brindano, e
    alle pareti le foto incorniciate del gruppo
  - al bancone, di spalle, quattro personaggi giocabili a caso (disegnati da dietro: capelli,
    pettinatura, cappello e maglia dei personaggi veri)
  - Beppe ha la sua giornata: dal seme del round esce quanto è in forma (e ogni pinta è un po'
    diversa, ogni tanto gli trabocca): nel round è uguale per tutti, da un round all'altro cambia
- Arriva ReGrorio! (SCHIVA!): frecce SINISTRA/DESTRA per cambiare corsia, SPAZIO per saltare.
  Col dito: tocca nel terzo di sinistra o di destra dello schermo per cambiare
  corsia, in mezzo per saltare (con due dita insieme si salta e si cambia corsia)
  - passa sulle monete per prenderle; la corona rotola davanti al muso della Golf: per
    prenderla bisogna restare nella corsia fino all'ultimo (o saltare la Golf)
  - le fasi si annunciano: ARRIVA DA DIETRO!, FA LE FINTE!, IL RE SI ARRABBIA!
  - dove sta per passare una Golf la corsia si accende di rosso (più forte dalla parte da cui
    arriva), col cartello di pericolo e le frecce che scendono (o salgono) nel suo verso
- La Barba di O'Sfurnacchiat (mouse o trackpad):
  - tasto destro: stendi la schiuma (dopo qualche secondo si secca).
    Sul trackpad del Mac: clic a due dita, oppure tieni premuto CTRL e clicca.
    Si può premere o lasciare CTRL anche a metà passata per cambiare attrezzo
  - tasto sinistro: radi, solo dove c'è schiuma e senza correre (se vai veloce, taglietto)
  - la lama si intasa: quando è piena (la barretta accanto al rasoio) va sciacquata nella
    bacinella a destra (SCIACQUA QUI!), poi si rade di nuovo
  - la barba copre guance, baffi e mento ed esce appena dal viso; quella tagliata resta
    tagliata (la ricrescita è spenta: `ricrescitaInizio` e `ricrescitaFine` in `js/config/microgiochi/barba.js`)
  - niente rasoio su naso, labbra, occhi, orecchie e nei (nei e cerotti stanno sempre
    sulla pelle del viso)
  - contano solo gli errori di chi rade: la velocità è quella della mano (misurata sugli
    ultimi due decimi di secondo), e se è De Luca a muoversi di scatto o ad aprire la bocca
    sotto la lama non è un errore (`velSussulto` e `margineRincorsa` in `barba.js`)
  - dopo un taglietto o un AHIA De Luca sbotta con una delle sue frasi: "Calma!", "Non ci metti
    le mani!" o "Io ho anni di esperienza con la lametta" (al massimo una ogni 2 secondi;
    `frasiErrore` in `barba.js`)
  - col dito: l'interruttore in basso a sinistra sceglie PENNELLO o RASOIO (si può
    cambiare anche a metà passata con un altro dito); l'attrezzo sta un po' sopra
    il dito, così si vede la lama; col dito si può andare un po' più veloci
    (`velMaxDito` in `barba.js`)
- Il Panino di Marsupino (IMPILA!):
  - FRECCE SINISTRA/DESTRA (o A/D) oppure il mouse: il pane si sposta (stessa
    velocità massima per tutti, col mouse non si teletrasporta)
  - col dito: trascina in basso dove vuoi, il pane si sposta della stessa misura
    (non salta sotto il dito, così non lo copri)
  - ogni panino è l'ORDINE di un cliente (la sua faccia, in alto, col biglietto): gli
    ingredienti vanno presi NELL'ORDINE del biglietto (il prossimo ha il cerchio giallo). Ketchup
    e maionese arrivano come schizzi dai tubetti che passano in alto. Un ingrediente fuori ordine
    non entra (-3): va lasciato cadere. Calzini, lische, ghiaccio e ciabatte rovinano il panino
    (e Marsupino va su tutte le furie: diventa paonazzo, salta, fuma dalle orecchie e urla)
  - si prende in cima alla pila: più è alta, più ondeggia quando ti muovi. Se pende troppo
    (corri e freni di colpo) CROLLA: cadono gli ultimi due strati (un attimo prima lampeggia OCCHIO!)
  - Marsupino lancia la roba buona lontano dal pane: bisogna correre (chi sta fermo non
    prende niente)
  - tre atti: ordini da 3 ingredienti; dal 12° secondo ORDINI DA QUATTRO (e il doppio lancio);
    dal 24° MARSUPINO SI ARRABBIA: ordini da 5 e le schifezze te le tira addosso
- Guerra, via quelle mani! (SCIAF!):
  - clic o tocco sulla mano = schiaffo; col dito si possono colpire due mani insieme
  - tastiera: i tasti da 1 a 5 (il numero è scritto sotto ogni piatto) danno lo schiaffo
    alla mano che punta quel piatto
  - tre atti: dal 12° secondo IL GUANTO DA FORNO; dal 24° GUERRA HA FAME (più mani insieme)
  - se una mano ha già preso un piatto, colpiscila per riportarlo indietro
  - col guanto da forno servono due schiaffi; le finte tornano indietro da sole
  - schiaffo a vuoto: la tua mano resta dolorante per un attimo
- Sego, sono sotto casa! (LANCIA!):
  - mouse e dito: appoggia, tira indietro come una fionda, lascia (tiri più giù = più in alto).
    Per la forza piena basta tirare di poco col mouse, e se premi in fondo allo schermo basta
    ancora meno (`tiroPieno`, `tiroPienoDito`, `tiroMinimo` in `sego.js`); il tiro vale anche
    se il mouse esce dalla finestra
  - tastiera: FRECCE per mirare, SPAZIO tenuto per la forza (sale e scende), rilascia per lanciare
  - tre atti: dal 12° secondo TIRA VENTO (le finestre sbattono più spesso); dal 24° FRANCI
    CHIUDE TUTTO
  - la traiettoria tratteggiata e il mirino dicono dove arriva: verde = finestra
    aperta, rosso = persiane chiuse, grigio = muro
  - la tacca gialla sulla barra del fumo è dove Franci esce: all'80%, al 65% in Lampo
- TorRONDAcelli (SPARA!):
  - mouse: punta sul mare e clicca per sparare; tastiera: FRECCE + SPAZIO;
    dito: tocca il mare dove vuoi colpire
  - la palla ci mette di più ad arrivare lontano: mira un po' avanti alla bagnarola
  - le bagnarole dei pirati (inventati): lo SQUALOTTO (gommone a forma di squalo, 1 colpo), il
    CIGNO PIRATA (pedalò, 2 colpi) e il GALEONE PAPERA (galeone gonfiabile, 3 colpi). Se toccano riva si prendono un
    ombrellone: affondali mentre scappano e l'ombrellone torna
  - munizioni: poche (i pallini in alto). Il Generale lancia una cassa ogni tanto, che
    atterra da sola sul cannone; un colpo torna anche da solo ogni tanto
  - tre atti: gommoni e pedalò; dal 12° secondo ARRIVA IL GALEONE; dal 24° ARREMBAGGIO
- L'Ingiocabile (blackjack):
  - 1, 2, 3 o clic/tocco sulle fiches: punti 10, 25 o 50
  - C o SPAZIO = carta, S o INVIO = stai, D = raddoppia (anche coi pulsanti)
  - il banco sta su 17, il blackjack paga 3 a 2; nella sfida tutti e due trovano
    lo stesso mazzo
  - poco tempo per decidere (la barra sotto le carte: 2,6 secondi, poi 2 dal 12° secondo,
    1,7 dal 24°): poi il banco punta il minimo per te, o ti fa stare. Il banco distribuisce svelto,
    così in 35 secondi si giocano più mani
  - se il tempo finisce a metà di una mano, la mano si annulla: la puntata torna nelle tue fiches
    (si vede tornare in banca, con la scritta MANO ANNULLATA)
  - i punti sono le fiches vinte (sopra le 100 di partenza): la mano vinta paga la puntata,
    quella persa se la porta via, quindi quanto punti conta (al verde, finisce prima)
  - MOSSA DA PRO: la scelta uguale alla strategia di base. Una mano VINTA giocata tutta da pro il
    banco la paga il doppio; con una mossa da principiante niente premio. Mosse giuste e
    mani perse non danno punti
  - al tavolo, spettatore, c'è lo Zio: quando perdi ride ("Popone"), e ogni tanto sogna
- MaraZio (PALLEGGIA!):
  - FRECCE SINISTRA/DESTRA (o A/D) o il mouse per muoversi, SPAZIO o clic per calciare;
    col dito: trascina sul prato per muoverti e tocca CALCIA
  - calcia quando il pallone arriva al piede: perfetto = sale dritto, buono =
    scappa un po', scarso = scappa tanto; se cade, la serie riparte
  - più palleggi di fila, più valgono: x1,5 ogni 5, fino a x3
  - tre atti: un filo di vento; dal 12° secondo TIRA VENTO (il pallone deriva di lato, le righe
    bianche sul prato dicono da che parte); dal 24° lo Zio calcia il PALLONE D'ORO:
    colpiscilo per 25 punti (se cade non succede niente, ma il tuo pallone intanto scende)
  - a ogni colpo la gamba dalla parte del pallone si alza (anche quella dello Zio)
  - il colpo perfetto lascia la scia; ogni 5 palleggi di fila festa (saltello e coriandoli); quando
    il pallone cade si alza la polvere; alla serie da vittoria (12) lo Zio resta a bocca aperta:
    "Ma come...?!"
- Il Passo del Passaseo (PEDALA!: la salita in bici, testa a testa col Passaseo):
  - si pedala un pedale alla volta, A TEMPO: FRECCE SINISTRA e DESTRA (o A e D); col dito (o
    col mouse) la metà sinistra e la metà destra dello schermo. In basso la pallina del ritmo va
    da un pedale all'altro: si preme quando ci arriva. Perfetta = spinta piena; buona = un po'
    meno; fuori tempo o col pedale sbagliato = A VUOTO, si rallenta
  - il ritmo cambia con la strada: prima dei TORNANTI rallenta (chi ci entra lanciato va LARGO e
    perde metà della velocità), sugli STRAPPI è lento e preciso, allo SPRINT va forte (e le
    perfette valgono doppio)
  - in alto la salita col traguardo e le due facce, il distacco e la velocità
  - tre atti lungo la salita: LA SALITA; I TORNANTI! (due tornanti e uno strappo); STRAPPO E
    SPRINT! Il Passaseo va del suo passo, uguale per tutti nel round (seme): arriva in cima in
    32-34 secondi, e la salita è lunga apposta
- Spalma il Bota! (SPALMA!, un gesto solo: strofina la crema sulle scottature):
  - il sole tira un raggio sul Bota e lì nasce un CERCHIO ROSSO, con un anello che fa da timer:
    tieni premuto e strofina (mouse o dito) sul cerchio; dove passi resta la crema bianca e
    l'anello interno diventa verde. Quando il cerchio è quasi tutto coperto si spegne (SPENTA!,
    PRESTO! se lo fai prima di metà anello); se l'anello finisce prima, SCOTTATO! e quella pelle
    resta rossa fino alla fine. La crema non finisce mai
  - la prima scottatura ha la scritta STROFINA QUI!, e un clic da fermo lascia una noce di crema
  - tastiera: FRECCE (o WASD) muovono la mano, SPAZIO tenuto strofina
  - tre atti: UNA ALLA VOLTA (il Bota sta fermo); dal 12° secondo PIÙ SOLE! (due scottature
    insieme, e il Bota si allunga a prendere il telefono o la birra: i cerchi si spostano con
    lui); dal 24° SI GIRA! (a pancia in giù, tre insieme e ogni tanto una grande che vale doppio)
- Il Passaggiorgio (ACCHIAPPA!: stasera guida Giorgio, per forza):
  - Giorgio corre verso le macchine degli amici (la Panda di Guerra, la Golf di Greg, il SUV
    di Sego), apre una portiera e ci si infila: clic o tocco su di lui prima che la chiuda,
    e vola in mezzo al parcheggio. Se la chiude, la macchina parte con lui dentro e torna
    dopo qualche secondo (passaggio scroccato)
  - quando è a terra, trascina le chiavi fino a lui: va alla sua A3. Di solito sono in basso a
    destra, ma ogni tanto (mai due volte di fila) Giorgio le lancia apposta in mezzo al
    parcheggio o sul tetto dell'A3, e bisogna andarle a prendere lì (si prendono anche al volo;
    se le lasci lontano da lui tornano dove erano cadute). Quando sono lontane, Giorgio resta a
    terra un attimo di più
    impolverata e si mette al volante (poi scende con una scusa e si ricomincia)
  - tastiera: FRECCE SINISTRA/DESTRA scelgono la macchina, SPAZIO lo tira fuori, INVIO gli
    lancia le chiavi quando è a terra
  - più lo fai guidare (e più lo tiri fuori), più diventa FURBO (le stelline in alto a destra):
    più veloce, finte, sagome di cartone nelle altre portiere, il cappuccio con un sosia
    incappucciato (da non tirare fuori), il bagagliaio
  - tre atti: il parcheggio; dal 12° secondo ARRIVA EMILIO! (passa in macchina con Denny, che
    grida "Giorgio, ci porta i mi babbo, gnamo monta!": Giorgio molla tutto e gli corre dietro.
    Fermalo con un clic o un tocco prima che salga; da tastiera SPAZIO, ma solo quando sopra di
    lui compare ORA!); dal 24° ANCHE NEL BAGAGLIAIO (ed Emilio ripassa)
  - clic a vuoto (o sul cartone): la mano resta ferma per un attimo
- Petri Tentacolari (SALVALE!: scappa dal Piovra):
  - tocca (o clicca) una ragazza e trascina: le disegni la strada, lei la segue. Se arriva al
    tavolo delle amiche, a destra, è salva
  - i tentacoli del Petri puntano la ragazza più vicina: se la prendono resta agganciata a
    chiacchierare. Tocca il tentacolo (SCIAF!) per liberarla; col dito si può guidare una
    ragazza e intanto schiaffeggiare con un altro dito
  - aiuti in basso, con la ricarica: BIRRA GRATIS (poi tocca dove lanciarla: il Petri ci si
    fionda e molla tutto) e AMICO IN MEZZO: arriva O'Sfurnacchiat ("Gnamo Petri, falla
    finita"), si mette davanti alla ragazza più in pericolo e la segue; i tentacoli che gli
    passano contro sbattono (BONK!) e lei e chi le sta accanto non si possono prendere
  - tastiera: TAB sceglie la ragazza, FRECCE la guidano, SPAZIO schiaffo al tentacolo più
    vicino a lei, 1 e 2 gli aiuti (la birra va da sola nel punto più lontano dalle ragazze)
  - dal computer (mouse o trackpad) i tentacoli vanno un po' più piano che col dito (`velPC` in
    `piovra.js`), e lo schiaffo prende anche un po' accanto al tentacolo (`raggioTentacolo`)
  - tre atti: dal 12° secondo IL PETRI SI MUOVE; dal 24° TENTACOLI A SORPRESA (sbucano da
    sotto un tavolino o dalla consolle)
- L'Incubo degli Scapoli (BALLA!, sfida di ballo contro il Manna, come Just Dance):
  - in basso scorrono a tempo di musica le schede delle mosse (pittogrammi al neon: braccia al
    cielo, giù, a sinistra, a destra, battimani): quando una scheda entra nel riquadro, fai la
    mossa. Tastiera: FRECCE (o WASD) e SPAZIO per le mani; col dito (o col mouse) si striscia
    come la freccia e si tocca per le mani
  - il tuo personaggio balla la mossa che fai, e il Manna fa quella giusta a tempo
  - ogni mossa è PERFETTO, BUONO, MANCATA o SBAGLIATA; la serie moltiplica i punti (x1,5 e poi x2)
  - le ragazze si conquistano coi punti e non si perdono più: la terza è il bronzo, la quarta
    l'argento, la quinta l'oro
  - 35 mosse, sempre sui battiti e al massimo due di fila; tre atti: il primo ha le pause, dall'11°
    secondo LE MOSSE D'ORO! (valgono di più), dal 23° IL MANNA SI SCATENA! (più fitto, e la musica
    accelera come prima)
  - le mosse sono le stesse per tutti i giocatori del round
- Emilio in Retromarcia (SPINGI!: fai uscire Emilio dal cancello senza che tocchi i cani):
  - FRECCE (o WASD) per muoverti; col mouse, clic sul punto del vialetto dove andare;
    col dito, trascina (il personaggio sta un po' sopra il polpastrello)
  - la macchina esce in retromarcia a scatti: prima di ogni scatto si accendono le luci
    bianche e fa "bip bip". Dietro la coda c'è la zona rossa (lampeggia durante l'avviso):
    se la macchina arriva addosso a un cane che sta lì è uno spavento e perdi una vita
  - spingere: cammina contro un cane e lo spingi dalla parte dove stai andando
  - lanciare: SPAZIO lancia in avanti, nella direzione in cui guardi; col mouse, tasto destro
    (o CTRL+clic) e lanci verso il puntatore; col dito, tocca l'icona del biscotto o della
    pallina e poi il punto del vialetto. Con tastiera e mouse il gioco sceglie da solo cosa
    lanciare: quello che piace al cane più vicino alla zona rossa. Il goloso corre solo
    dietro ai biscotti, quello della pallina solo dietro alla pallina, il pigro ignora tutto
    e si sposta solo a spinte
  - raccogliere: biscotti e palline nuovi compaiono in giro per il giardino (alone
    giallo): ci si passa sopra
  - nel prato e sotto il portico i cani sono al sicuro, ma dopo qualche secondo tornano
    sul vialetto
  - occhio a stare dietro la coda: se la macchina in retromarcia ti arriva addosso, SBAM! KO!
    voli di lato e resti steso 2 secondi, con le stelline che girano (se ne spegne una per ogni
    terzo del KO) e gli uccellini. Intanto non puoi fare niente. Poi ti rialzi e per un secondo
    e mezzo lampeggi: lì la macchina non ti stende di nuovo. Il KO non costa vite né punti, solo
    tempo (`durataKO`, `voloKO` e `invulnerabileKO` in config)
  - tre atti: tranquillo; dal 12° secondo EMILIO SI DISTRAE (radio, bandana, telefono: va
    più forte); a 12 secondi dalla fine PASSA IL GATTO e tutti i cani gli vanno dietro.
    Allora Pastaffi esce di casa, prende in braccio il cane più vicino alla macchina e lo
    porta nel prato (ed Emilio inchioda per un secondo)
  - i cani stanno nell'array `cani` di `js/config/microgiochi/retromarcia.js`: nome, colore
    del collare, personalità (`pigro`, `pallina`, `goloso`), taglia, macchia. Si possono
    rinominare, togliere o aggiungere; chi non ha il nome si chiama da solo Morgan, col
    numero romano che gli tocca (Morgan IV, Morgan V...)
- Beer Pong al Pallaio (TIRA!: contro i veterani, lo Zio e Marsupino):
  - mouse: premi, tira indietro come una fionda e lascia; dito: una fiondata verso i bicchieri.
    Il verso del gesto è la mira, la lunghezza la forza (il rilascio vale anche fuori dal gioco)
  - tastiera: FRECCE SINISTRA/DESTRA per mirare, SPAZIO tenuto per la forza (sale e scende),
    rilascia per tirare
  - si può mirare mentre la pallina di prima è ancora per aria: si tira appena torna in mano
  - centra i 10 bicchieri dei veterani (finiti quelli ne rimettono 6, con un bonus); di rimbalzo
    vale doppio. Intanto loro tirano ai tuoi 6: ogni bicchiere che ti centrano lo bevi e la
    sbronza sale (vedi "Beer pong" più su). Senza più bicchieri, finisce prima
  - anche i veterani bevono quelli che gli centri: più bevono, meno centrano
  - tre atti: RISCALDAMENTO; dal 12° secondo SI BEVE! (tirano più spesso e più precisi); dal 24°
    ULTIMO GIRO!, e Marsupino disturba (la mira sobbalza)
- Provini a X-Factor (SUONA!: fai la base a Tini e Oli su "Cambiare Aria", la loro canzone vera):
  - come in Guitar Hero: al centro del palco una strada in prospettiva parte dalla console in
    fondo e arriva in basso a 4 pad colorati (verde, rosso, giallo, blu). Le note scendono lungo
    le corsie e si ingrandiscono mentre arrivano: si colpiscono quando toccano il pad (PERFETTO,
    BUONO, MANCATO), e a ogni colpo esce una fiammata del colore della corsia. Le note lunghe sono
    scie da tenere premute, gli accordi due note legate da una sbarretta. Con la serie i bordi della
    strada si accendono e le fiamme crescono, e a 10, 20 e 40 colpi di fila arrivano le stelle
  - chi canta si vede: il cantante attivo viene avanti sotto il riflettore col nome sopra la
    testa, l'altro fa un passo indietro col cartellino CORO, e ai cambi compare "TOCCA A TINI!" o
    "INSIEME!" (lo legge dalle `voci` della mappa)
  - tastiera: D F J K (o le frecce), da sinistra a destra; dito e mouse: si tocca il pad (o la sua
    corsia nella metà bassa dello schermo), anche con più dita insieme
  - l'errore si sente sulla canzone vera: a ogni nota mancata si ovatta per mezzo secondo e il
    disco graffia; con 3 errori di fila resta ovattata e un po' più lenta finché non si torna a
    prendere le note. Toccare a vuoto vicino a una nota azzera la serie
  - note prese: i cantanti si gasano, i giudici annuiscono, il pubblico alza gli accendini; note
    mancate: il cantante ti guarda malissimo, il produttore preme il NO, i fischi
  - tre atti, allineati alla canzone, che ora ha tutti e due i cantanti: LA STROFA (canta l'Oli:
    note lente sui battiti forti); dall'11° secondo IL PEZZO FORTE! (canta il Tini, parte il beat
    pieno, note più fitte, luci a tutta); dal 26° IL GRAN FINALE! (il ritornello: note fitte e
    lunghe, riflettori, tutti in piedi, e l'esplosione di note in fondo)
  - alla fine i quattro giudici (inventati) votano la precisione, uno alla volta: con almeno 3 SÌ
    si passa (SEI AI BOOTCAMP!). Le lucine sul tavolo dicono già come la pensano
  - la canzone è un ritaglio di 35 secondi (15 in Lampo: la fine della strofa dell'Oli e l'inizio di
    quella del Tini), si carica quando parte
    il microgioco e si butta quando finisce; il tempo è quello dell'audio, col **Ritardo audio**
    delle Impostazioni. Con la pausa canzone e note si fermano insieme. Senza audio si gioca lo
    stesso, col proprio orologio
  - la mappa delle note è una per livello, la stessa per tutti, in sfida: le note cadono sui colpi
    che si sentono, niente note dove la canzone si ferma, note lunghe sulle frasi tenute, accordi nel
    gran finale (FACILE meno note, DIFFICILE più fitte e con gli accordi anche nel pezzo forte). Nel
    Lampo la strofa dell'Oli e, dal 7,5° secondo, IL PEZZO FORTE! col Tini
  - per renderlo più facile o più difficile, in `js/config/microgiochi/xfactor.js`: `finestre`
    (quanto si può sbagliare il tempo), `anticipo` (quanto prima si vede la nota), le `soglia` dei
    `giudici`, `errori`; le note in `xfactor-mappa.json`, che fanno `strumenti/beatmap.py` e
    `strumenti/griglia.py` (vedi
    "La canzone di X-Factor" più sotto)
- La pizza dal Boni (CONDISCI!: fai le pizze del Boni e copri Oli, il Sego e il Guerra, che si sono imbucati):
  - il Boni grida la pizza e il foglietto mostra ingredienti e quantità; dopo un attimo si gira e
    la pizza va fatta A MEMORIA. Toccandolo (o TAB) lo si rivede un momento, ma si perde il bonus
    velocità
  - il pomodoro: col dito (o il mouse) si passa in tondo sulla pasta; da tastiera SPAZIO tenuto
  - gli ingredienti: si tocca la ciotola e poi la pizza (o si trascina dalla ciotola alla pizza),
    un pezzo a tocco; da tastiera da 1 a 6. L'ananas è una trappola: non è mai nell'ordinazione
  - PRONTA! (INVIO) la consegna; RIFAI (BACKSPACE) ricomincia la pizza
  - pizza giusta: il Boni la inforna e la porta in tavola. Sbagliata (un pezzo in più o in meno,
    un ingrediente che non c'era, l'ananas, poco pomodoro): la butta, corre a bere dalla caraffa e
    scopre uno degli imbucati, che caccia fuori con la pala. Al terzo errore li ha scoperti tutti e
    tre: FUORI TUTTI!, e finisce
  - gli imbucati stanno nascosti (sotto la tovaglia, dietro la botte, nella cesta della legna,
    dietro la tenda della cantina, sotto i cappotti) o travestiti a tavola tra gli invitati (la
    maschera di Giorgio, baffi finti e cappello, da cuoco). Gli invitati sono personaggi giocabili
  - tre atti: LE PRIME PIZZE (due o tre ingredienti); dal 12° secondo GLI INVITATI ORDINANO
    (pizze più ricche, il foglietto resta meno); dal 24° IL BONI HA FRETTA (il foglietto resta
    poco e ogni pizza ha il suo tempo)
  - ordini, nascondigli, travestimenti e invitati escono dal seme del round: sono gli stessi per
    tutti i giocatori
  - (gli imbucati che sbucano a chiedere una fetta, da rimandare giù con un tocco, ci sono ancora
    nel codice ma sono spenti: troppo difficile. Si riaccendono con `sbuca` e `avviso` negli
    `atti` di `js/config/microgiochi/pizza.js`)
- La ballata del Pallaio (RIORDINA!: sei il garzone di Lori, il cantastorie, e hai appeso le
  vignette del suo cartellone alla rinfusa):
  - Lori canta una strofa alla volta: sopra di lui il fumetto con la scena della strofa, e la
    casella dove cadrà la bacchetta si illumina (con l'arco tratteggiato e il cerchio che si
    stringe). La bacchetta cade sul tempo della musica, sulla battuta forte, preceduta da due note
    che salgono. Ogni strofa cade su una casella diversa, che si scopre solo quando si illumina:
    lì ci va la scena del fumetto (chi conosce la storia la riconosce prima, ma il cartellone non
    si può sistemare in anticipo)
  - dito e mouse: trascina una vignetta su un'altra casella e le due si scambiano; col mouse anche
    un clic sulla vignetta e uno sulla casella. Una vignetta girata dal vento (il retro bianco) si
    tocca per rigirarla
  - tastiera: FRECCE il cursore, SPAZIO prende la vignetta e SPAZIO la lascia (scambio), INVIO
    rigira una vignetta girata
  - quando la bacchetta cade: vignetta giusta, TOC, OOOH e monete nel cappello; sbagliata, Lori
    canta quello che c'è davvero nella casella ("...le chiavi nel bicchiere?!"), il pubblico ride,
    volano i pomodori e lui fulmina il garzone. Subito dopo la vignetta giusta va da sola in quella
    casella (senza punti) e quella sbagliata torna libera nella casella lasciata: un errore non ne
    trascina un altro alla strofa dopo. Una vignetta battuta resta lì, bloccata
  - tre atti: LA PRIMA STROFA (la riga in alto: quella in basso è sotto il telo); dal 12° secondo
    IL VENTO (metà del telo vola via; le folate girano una vignetta o ne scambiano due già
    sistemate, e la bacchetta fa qualche finta: punta una casella, di solito lì accanto, e
    all'ultimo cade su quella giusta, col punto esclamativo); dal 24° IL GRAN FINALE (tutte e 8,
    Lori accelera, le ultime due bacchettate ravvicinate). L'ultima strofa è la morale: tutte
    giuste, il cartellone si illumina e c'è il bonus
  - ballata (cinque, nel file di configurazione), caselle delle strofe, disposizione iniziale
    (nessuna vignetta parte al posto giusto), folate e finte escono dal seme del round. In Lampo si gioca la riga in alto:
    tre strofe e la morale
  - si gioca anche senza audio: la casella illuminata, l'arco e il cerchio dicono dove e quando
- Le Perle di Denny (CORREGGI!: al Pallaio Denny, il figlio di Emilio, fa il grande saggio e
  sbaglia i proverbi con totale convinzione):
  - ogni proverbio arriva intero nel fumetto, con una sola parola sbagliata: si scrive quella
    giusta e si preme INVIO. Sul computer si scrive e basta, senza clic (mentre si scrive le
    scorciatoie del gioco tacciono, tranne ESC per la pausa); sul telefono si tocca SCRIVI, che
    apre la tastiera, e si manda con Invio o con OK. Con la tastiera aperta fumetto, casella e
    barra del tempo salgono nella parte che resta visibile, Denny si fa piccolo e sopra la barra si
    legge quello che stai scrivendo (SCRIVI: ...), anche dove la casella finisce sotto la tastiera
  - maiuscole, spazi prima e dopo, accenti e apostrofi non contano; dalle parole di 5 lettere in su
    va bene anche un errore di battitura. La parola sbagliata di Denny non vale mai
  - giusta: la parola sbagliata si cancella con una riga rossa e sopra arriva quella giusta, Denny
    si offende e ribatte, e arriva subito il proverbio dopo. Sbagliata: la casella trema, Denny
    gongola e si riprova. Ogni proverbio ha la sua barra del tempo: se finisce, Denny la
    proclama VERITÀ DEFINITIVA, si vede il proverbio giusto e si passa al dopo, senza punti
  - le PERLE ORIGINALI (gli sbagli veri di Denny, `perla: true`) valgono doppio
  - tre atti: LE PERLE DI DENNY (la parola sbagliata è sottolineata, tempo largo); dal 12° secondo
    TROVALA TU! (non più sottolineata); dal 24° DENNY SI SCATENA! (parla in fretta e dopo un paio
    di secondi il fumetto sbiadisce: resta la casella). A FACILE la parola è sempre sottolineata,
    c'è la prima lettera in grigio nella casella e più tempo; a DIFFICILE mai sottolineata, meno
    tempo e nessun errore di battitura
  - i proverbi sono in `proverbi` di `js/config/microgiochi/proverbi.js`: una riga ciascuno, il
    proverbio giusto con tra [quadre] la parola da scrivere, `dice` la parola sbagliata di Denny,
    `perla: true` se è un suo sbaglio vero. L'ordine esce dal seme del round e da chi gioca (ognuno li trova in un ordine diverso), senza ripetizioni
- Scontrino, prego! (SCONTRINO!: nella pizzeria al taglio "Da Michele" chi gioca è il vice del
  Giso, il paladino degli scontrini, e tiene d'occhio Michele alla cassa):
  - una regola sola: chi esce deve avere in mano lo scontrino, il foglietto BIANCO (bello grande,
    tenuto alzato). I clienti entrano dall'arco, scelgono, pagano alla cassa ("cling") e vanno verso
    la porta: chi esce senza, o col foglio sbagliato, si clicca (o si tocca) prima che arrivi alla
    porta. SPAZIO ferma il più vicino alla porta (sul computer ha l'anello giallo ai piedi); un clic
    lontano da tutti, lo stesso. Il Giso fischia e lo blocca, Michele diventa rosso, suda e lo batte di
    corsa. Se lo scontrino c'era è un falso allarme ("Eccolo, contento?"); se nessuno lo ferma, la porta
    si chiude e Michele fischietta
  - i trucchetti di Michele, che si vedono sempre: IL CLASSICO (niente tasti, niente stampante: fa il
    vago e fischietta), LO STRAPPO (lo scontrino esce, ma lui lo strappa e se lo mette in tasca), IL
    CONTO A VOCE ("Fanno 6 euro, lascia stare!", senza toccare la cassa), LO SCONTRINO FINTO (al posto
    dello scontrino gli dà il volantino giallo della pizzeria), L'ANNULLO (lo dà, il cliente si gira e
    lui lo annulla: sullo scontrino in mano compare la croce rossa, e il display diventa rosso)
  - ALL'ULTIMO: Michele si scorda lo scontrino, il cliente si avvia senza, Michele grida ASPETTA! e
    glielo lancia al volo. Quel cliente è onesto: fermarlo è un falso allarme ("Me lo stava dando!")
  - I FURBETTI (dal terzo atto): entrano e invece di mettersi in fila sgattaiolano dritti alla porta,
    chinati e con gli occhiali scuri, senza pagare. Beccati, tornano a pagare ("Pagavo, pagavo!")
  - tre atti: SI APRE! (un cliente alla volta, il classico e lo strappo); dal 12° secondo ORA DI
    PUNTA! (il locale si riempie, due clienti che si accavallano, arrivano il conto a voce, il
    volantino e ALL'ULTIMO); dal 24° SABATO SERA DA MICHELE! (la coda all'arco, i cartoni da asporto,
    l'annullo, i furbetti e due distrazioni: la teglia fumante e il telefono degli ordini). A FACILE
    Michele è più lento, la finestra più lunga e lo scontrino in mano più grande; a DIFFICILE più
    veloce, la finestra corta, più clienti insieme e più furbetti. In Lampo si parte dall'ora di punta
  - in alto a destra: i punti, gli scontrini dei furbi beccati (si accendono: l'obiettivo) e le croci
    dei falsi allarmi (si colorano quando li fai)
  - il Giso è bassino: è sempre più basso di chi gioca. Quando vinci entrano due finanzieri in divisa
    (uno saluta, l'altro fa la multa a Michele) e fuori lampeggia la luce blu
  - clienti, trucchi e distrazioni escono dal seme del round: nella stessa sfida tutti trovano
    gli stessi clienti negli stessi momenti (Sfida del giorno compresa). Il nome del locale
    (sull'insegna, sulla polo di Michele e nei testi) è `nomeLocale` nella configurazione
- ESC: pausa — M: audio sì/no (sul telefono: la pausa con due tocchi in alto a destra, l'audio dalla pausa)

Sul telefono, dove il browser lo permette (Android), colpi ed errori fanno vibrare
brevemente il telefono.

## Punteggi dei microgiochi

Dalla revisione 4 tutti i microgiochi hanno la **stessa scala**: bronzo 100, argento 200, oro
300, e un record da campione sta sui 350-400. Il bronzo è la vittoria: l'obiettivo scritto nei
comandi è tarato per coincidere col bronzo. Dove l'obiettivo è un numero (piatti, ombrelloni,
ragazze, guidate, ordini...) quel che lo raggiunge vale sempre di più, così sotto l'obiettivo non
si arriva al bronzo e sopra si sale in fretta verso l'oro. Tarati coi giocatori automatici
(`test/bot.py`: bravo, a caso, fermo; chi tocca a caso o sta fermo non prende mai il bronzo).

- **La Spina** (35 s): pinta 15, boccale 24, calice 27, +9 se PERFETTA; Beppe fa 18 a pinta. Il
  punteggio è la sfida con Beppe: 100 a pari punti, più quanto lo batti (o meno quanto ti batte).
- **Arriva ReGrorio!** (35 s): 1 punto per ogni secondo vivo, 2 a moneta, 12 a corona, 4 per ogni
  schivata all'ultimo, e +60 se arrivi in fondo senza K.O. (3 vite).
- **La Barba**: 1,34 punti per ogni % rasata (il 75% per vincere); la barba finita (98%) vale +60
  e 8 punti per ogni secondo avanzato; -6 per cerotto. La schiuma si secca in 8 secondi, la lama
  si intasa ogni 75 celle (quattro sciacqui per una barba intera), quattro nei.
- **Il Panino** (35 s): +5 per ogni ingrediente al momento giusto; ogni ordine servito vale più del
  precedente (10, 16, 34, 64, 106...), +10 se fatto in meno di 8 s; -2 per un ingrediente fuori
  ordine, -5 per un crollo, -8 per una schifezza (il totale non va sotto zero). Vittoria con 3 ordini.
- **Guerra** (35 s): schiaffo +5, +8 se la mano era già vicina al piatto, +4 se stava trascinando via
  un piatto, +2 per il guanto; alla fine i piatti ancora tuoi: sotto i 3 niente, 3 = +50, 4 = +80,
  5 = +120. Persi tutti, finisce prima.
- **Sego** (35 s): +5 per ogni fumogeno in una finestra aperta (+9 nella stanza di Franci), -3 per
  quelli sprecati. Se Franci esce (80% di fumo in casa, 65% in Lampo): +40 e +15 per ogni secondo che
  avanza, e vale almeno il bronzo; se non esce, un quinto della percentuale di fumo, e il totale si
  ferma a 90 (la vittoria è farlo uscire).
- **TorRONDAcelli** (35 s): +10 per ogni bagnarola affondata (+5 se lontana), +5 per ogni
  ombrellone ripreso; alla fine gli ombrelloni piantati: sotto i 3 niente, 3 = +40, 4 = +70, 5 = +100.
- **L'Ingiocabile** (35 s): 1 punto per ogni fiche vinta (sopra le 100 di partenza). Le mani vinte
  giocate tutte da pro (le scelte uguali alla strategia di base) il banco le paga il doppio.
  Vittoria con 100 fiches vinte. Al verde, finisce prima.
- **MaraZio** (35 s): 1 punto a palleggio per il moltiplicatore della serie (x1,5 ogni 5 di fila,
  fino a x3), +1 se perfetto, +20 per il pallone d'oro; alla fine la serie migliore: 4 a palleggio
  sotto i 12, poi 70 più 15 per ogni palleggio oltre i 12. Vittoria con una serie di 12.
- **Il Passo del Passaseo** (35 s): 0,1 punti per metro, 0,5 per pedalata perfetta (doppia allo
  sprint); se arrivi in cima prima del Passaseo, +20 e +110 per ogni secondo di vantaggio. Se
  nessuno arriva in cima, vince chi è più avanti allo scadere.
- **Spalma il Bota!** (35 s): 4 per ogni scottatura spenta, +2 se entro metà del suo tempo, il doppio
  se è grande, per la serie (x1,5 dopo 5 di fila, x2 dopo 10); -3 per ogni scottato (mai sotto zero).
  Vittoria con 15 spente (il bronzo): fino ad allora il totale si ferma a 90. In Lampo bastano 5.
- **Il Passaggiorgio** (35 s): ogni guidata vale 10 più della precedente (10, 20, 30, 40...), +2 ogni
  volta che Giorgio viene tirato fuori (+2 se era già quasi dentro), +5 se lo fermi o lo tiri giù
  dalla macchina di Emilio, -10 per ogni passaggio scroccato, -3 per il sosia (mai sotto zero).
  Vittoria con 4 guidate.
- **Petri Tentacolari** (35 s): ogni ragazza salvata vale più della precedente (2,8 x quante ne hai
  salvate: 3, 6, 8, 11...), più la serie (+2 alla seconda di fila, fino a +8); -10 per ogni ragazza
  ancora agganciata alla fine, ma con 8 salvate non si scende sotto il bronzo. Vittoria con 8 ragazze.
- **L'Incubo degli Scapoli** (35 s): mossa perfetta 5, buona 3, d'oro +2, per il moltiplicatore della
  serie (+0,5 ogni 6 di fila, fino a x2). Le ragazze arrivano a 20, 50, 100, 200 e 300 punti (in
  Lampo al 40%): vittoria con 3 ragazze, cioè il bronzo.
- **Emilio in Retromarcia** (35 s): VIA LIBERA, ogni scatto della macchina finito senza spaventare
  nessun cane: il primo di fila vale 4, il secondo 8, il terzo 12... (uno spavento azzera la serie);
  +5 per ogni cane tolto dalla zona rossa all'ultimo; se Emilio esce dal cancello, le vite rimaste
  (2 = +40, 3 = +150). Vittoria se esce con almeno 2 vite. I cani sono cinque (Morgan I-V: due
  pigri, uno della pallina, due golosi).
- **Beer Pong al Pallaio** (35 s): si parte da 80 (la partita pari): +20 per ogni bicchiere centrato,
  +40 se di rimbalzo, +10 in più quando si è IN FIAMME, +40 per ogni triangolo finito; -20 per ogni
  bicchiere tuo che ti centrano. Un bicchiere più di loro è il bronzo.
- **Provini a X-Factor** (35 s): PERFETTO 2,5, BUONO 1,25 (la proporzione 10 a 5), per il
  moltiplicatore della serie (x1,5 dopo 10 note di fila, x2 dopo 20, x3 dopo 40; un errore la
  azzera), +1 per ogni nota lunga tenuta fino in fondo, +10 per ogni SÌ dei giudici. Le note di
  FACILE (meno) valgono di più e quelle di DIFFICILE (più) di meno, e la serie si conta in
  proporzione: in tutto si fanno i punti di NORMALE. I giudici votano la precisione (PERFETTO 1,
  BUONO 0,6, MANCATO 0): il Commosso dice SÌ dal 33%, la Diva dal 52%, MC Catena dal 64%, il
  Produttore dall'84%; con 3 SÌ su 4 si passa. Il provino passato è il bronzo: senza 3 SÌ il
  totale si ferma a 90, con 3 SÌ sale almeno a 100. Coi giocatori simulati: chi è bravo arriva
  all'argento, l'oro vuole quasi tutte le note perfette; chi tocca a caso non passa mai. In
  Lampo (15 secondi, il ritaglio dal pezzo forte) decide il verdetto e i punti sono quelli e basta.
- **La pizza dal Boni** (35 s): ogni pizza giusta vale più della precedente (30, 35, 40, 45...),
  +5 se consegnata entro 8 secondi senza rivedere il foglietto, +2 per ogni pizza giusta di fila
  dopo la prima. Vittoria con 3 pizze giuste (il bronzo; 6 pizze perfette sono l'oro) senza farsi
  scoprire tutti e tre: se il Boni li scopre tutti e tre, FUORI TUTTI! e i punti si fermano a 90.
- **La ballata del Pallaio** (35 s): ogni strofa giusta vale più della precedente (10, 15, 20,
  25...), per la serie (+10% per ogni strofa giusta di fila dopo la prima); +60 per la morale se
  sono giuste tutte e 8. Vittoria con 5 strofe giuste su 8 (il bronzo); 7 giuste di fila sono
  l'argento, tutte e 8 l'oro. In Lampo (la riga in alto: 4 strofe) bastano 3 giuste.
- **Le Perle di Denny** (35 s): +10 per ogni proverbio corretto, +5 se in meno di 3 secondi, per il
  moltiplicatore della serie (x1,5 dopo 3 giusti di fila, x2 dopo 5; un errore o un tempo scaduto
  la azzerano); le PERLE ORIGINALI valgono doppio; -2 per ogni tentativo sbagliato (mai sotto
  zero). Vittoria con 6 proverbi corretti, che sono il bronzo: fino a 5 il totale si ferma a 90, il
  sesto lo porta almeno a 100 e da lì non si scende più sotto. Coi giocatori simulati: chi è
  bravo arriva all'argento (una decina di proverbi), l'oro vuole 13-14 proverbi quasi tutti
  veloci. In Lampo (15 secondi) bastano 3 giusti e i punti sono quelli e basta.
- **Scontrino, prego!** (35 s): +10 per ogni imbroglio scoperto, +5 se lo becchi entro 0,6 secondi
  da quando il cliente si gira verso la porta, per il moltiplicatore della serie (x1,5 dopo 3
  presi di fila, x2 dopo 5; un falso allarme o uno che scappa la azzerano); -5 per ogni falso
  allarme (mai sotto zero). Ogni serata ha i suoi imbrogli (tra 9 e 12 a NORMALE, con almeno 4
  clienti onesti): i punti degli imbrogli si contano in proporzione, così una serata perfetta
  (tutti presi subito, nessun falso allarme) fa sempre 360. Vittoria con 6 imbrogli scoperti e al
  massimo 2 falsi allarmi, che sono il bronzo: finché non ci sei il totale si ferma a 90, quando
  ci sei sale almeno a 100. Coi giocatori simulati: chi è lento passa quasi sempre, chi è medio
  arriva all'argento una volta su due, l'oro vuole quasi tutto preso subito; chi preme sempre o
  a caso fa troppi falsi allarmi e non passa mai. In Lampo (15 secondi, dall'ora di punta)
  bastano 3 imbrogli con al massimo 1 falso allarme, e i punti sono quelli e basta.

Tutti i numeri (punti, durate, velocità, curve di difficoltà) sono nei file di configurazione:
`js/config/microgiochi/<id>.js`, uno per microgioco.

## Prove automatiche

Nella cartella `test/` ci sono le prove automatiche (Python + Playwright): aprono ogni
microgioco, lo giocano con input a caso fino ai risultati e fanno una sfida rapida dal menu al
podio in 2 e in 4 giocatori, da computer e da telefono, controllando che non ci siano errori.
Controllano anche impostazioni e salvataggio, Bancone, livelli e tutte le modalità (Da solo,
Lampo, Torneo, Squadre, Sfida del giorno).
Si lanciano con un doppio clic su `test/fumo.command` (o `./test/fumo.command` dal Terminale);
la prima volta preparano da sole l'ambiente. Dettagli e opzioni in `test/README.md`, insieme ai
giocatori automatici (`test/bot.py`, per tarare le medaglie) e alla prova delle prestazioni
(`test/prestazioni.py`, con la CPU rallentata come un telefono). Le prove da fare a mano sono
in `note/test-manuali.md`.
La cartella `test/` non fa parte del gioco: non va caricata sul sito.
Tutti i microgiochi sono nelle prove e hanno il loro giocatore automatico in `test/bot.py`
(la modalità Beer Pong, la partita vera a tiri alternati, non ancora). Per chi scrive un giocatore
automatico: nel beer pong il tiro si può dare dal codice, `scena.T.tira(m, p)`, e `gestoPer(x, y,
tiro)` di `js/beerpong/motore.js` dice che gesto serve per un bicchiere; nel provino le note sono
in `scena.note` (`t` e `dur` in secondi di canzone, `pad` da 0 a 3), il tempo in `scena.pos`, e i
pad si premono con `scena.premi(pad, quando)` e si lasciano con `scena.rilascia(pad)`; nella ballata la strofa in corso è `scena.armata`, la casella
illuminata `scena.bersaglio`, e le vignette si scambiano con `scena.scambia(a, b)`; nelle Perle di
Denny il proverbio è `scena.prov` (`giusta`, `dice`), si risponde con `scena.risposta(testo)` (come
INVIO) quando `scena.stato` è `'risposta'`, e `scena.tProv` è il tempo passato sul proverbio.
In Scontrino, prego! i clienti sono in `scena.clienti` (`trucco`: null se è onesto, 'furbetto' per chi
sgattaiola; `ultimo`: lo scontrino gli arriva al volo; `t.P` da quando si può fermare, `t.G` quando si
gira verso la porta, `t.D` quando ci arriva), `scena.bersaglio()` dice chi ferma SPAZIO, `scena.premi()`
lo ferma e `scena.premi(x, y)` è un clic lì; `programma` e `serata` di `ScontrinoScene.js`
dicono in anticipo com'è la serata di un seme.
(Le Perle di Denny e Scontrino, prego!, arrivati dopo, nelle prove non ci sono ancora.)

## La canzone di X-Factor

"Provini a X-Factor" si suona su una canzone vera, "Cambiare Aria" del Tini e dell'Oli. Nel sito ci
sono solo due ritagli, in mono: `audio/cambiare-aria.mp3`, 35 secondi (dalla canzone, da 0:48,9 a
1:24,1: la fine della strofa dell'Oli, la strofa del Tini e il ritornello), e
`audio/cambiare-aria-lampo.mp3`, 15 secondi (da 0:52,7 a 1:07,7: l'Oli e poi il Tini). C'è poi la mappa
delle note `js/config/microgiochi/xfactor-mappa.json`: i battiti (la canzone va a 128 bpm esatti),
dove cominciano gli atti, chi canta e quando (`voci`: l'Oli, il Tini o insieme) e le note di ogni
livello. La canzone intera sta fuori dal sito e non va caricata su GitHub.

Ritagli e mappa li fa `strumenti/beatmap.py` (fuori dal sito), con librosa (battiti e attacchi della
canzone) e ffmpeg (i ritagli, con la dissolvenza): se cambia la canzone, o i tagli scritti in cima
allo script, basta rilanciarlo, con la canzone intera come argomento. La prima volta:

```bash
py -m venv strumenti\.venv
```

```bash
strumenti\.venv\Scripts\python -m pip install librosa soundfile
```

poi, ogni volta:

```bash
strumenti\.venv\Scripts\python strumenti\beatmap.py percorso\della\canzone-intera.mp3
```

Le note di ogni livello le scrive poi `strumenti/griglia.py` (Python normale, senza librosa: beatmap.py
lo lancia da solo alla fine), che riscrive solo le note e lascia battiti, atti e voci come sono. Per
rifare solo le note, per esempio dopo aver cambiato le sue regole (scritte in cima allo script):

```bash
py strumenti\griglia.py
```

Usa ffmpeg per sentire i colpi nei due ritagli; senza ffmpeg le note le fa solo dai battiti.

In memoria, decodificato, il ritaglio da 35 secondi pesa circa 6,7 MB (a 48 kHz, come su iPhone) e
quello da 15 circa 2,9 MB; ce n'è caricato uno solo, solo durante il microgioco. Se su qualche
telefono le note sembrano tutte un filo in anticipo o in ritardo rispetto alla musica, c'è
`canzone.offset` nella configurazione (secondi da aggiungere a ogni nota); per le cuffie Bluetooth
c'è il Ritardo audio delle Impostazioni.

## Struttura

```
index.html               pagina del gioco (telefono: zona sicura, "Gira il telefono")
manifest.json            nome, icone e orientamento per la schermata Home
sw.js                    service worker: il gioco offline dopo la prima visita (i ritagli
                         della canzone di X-Factor li scarica subito)
audio/                   i ritagli di "Cambiare Aria" per X-Factor (35 e 15 secondi, mono)
icone/anteprime/         le foto dei microgiochi per la sala (strumenti/anteprime.py)
icone/                   la copertina (sfondo del menu, copertina.webp), le icone per la
                         schermata Home ricavate da lei e l'anteprima dei link (copertina-og.jpg)
server.py                server locale senza cache (Windows, Mac, Linux; --rete)
avvia.bat                doppio clic su Windows
avvia.command            doppio clic su Mac
avvia-telefono.bat       come sopra, ma il gioco si apre anche dai telefoni
avvia-telefono.command   sulla stessa Wi-Fi
js/
  config.js              configurazione generale: titolo, giocatori, personaggi giocabili,
                         modalità; mette insieme i file qui sotto in CONFIG
  config/microgiochi/    un file per microgioco (spina.js, regrorio.js...): durata,
                         comandi, obiettivo, punti, difficoltà, frasi
  config/frasi.js        frasi di sfottò e di pareggio della classifica finale
  config/premi.js        titoli e frasi dei premi buffi di fine sfida
  config/novita.js       la schermata Novità: versione e voci
  config/trofei.js       nomi e descrizioni dei trofei
  config/bancone.js      Pinte (quante se ne guadagnano) e cosa vende il Bancone
  config/modalita.js     Lampo, Da solo, Squadre, Torneo, Sfida del giorno, Beer Pong
  config/beerpong.js     il beer pong: tiro, sbronza, gag, reazioni (per il microgioco e per
                         la modalità)
  beerpong/              il motore del beer pong, in comune tra microgioco e modalità
    motore.js            prospettiva del tavolo, triangoli, volo della pallina, esiti
    tavolo.js            il tavolo in scena: gesto e mira, pallina, sbronza, reazioni
    gag.js               le gag dei tiri sbagliati
    partita.js           le regole della modalità: squadre, turni, tempo, oltranza
  salvataggio.js         tutto quello che il gioco ricorda (impostazioni, registro dei
                         punteggi...): versione, esporta/importa come codice, azzera
  punteggi.js            medaglie e punti sfida (punteggio da 0 a 100 per microgioco)
  premi.js               i premi buffi di fine sfida (chi li vince)
  livelli.js             i livelli dei microgiochi: la configurazione a FACILE e DIFFICILE
  torneo.js              il tabellone del Torneo (eliminazione diretta)
  progressi.js           statistiche, record, albo d'oro, trofei, Pinte, acquisti e costumi
  dialogo.js             finestra HTML sopra al gioco (codice del salvataggio, conferme)
  casella.js             casella di testo HTML sopra al gioco (Le Perle di Denny): sul telefono
                         apre la tastiera (pulsante SCRIVI), dice se è aperta e quanto si vede
  compat.js              aggiunte per i browser più vecchi (Safari)
  dispositivo.js         computer o telefono? (eTouch, ?touch=1)
  main.js                avvio di Phaser, scene, audio, telefono in verticale e in sottofondo
  vendor/phaser.min.js   Phaser 3.80.1
  sessione.js            stato della partita per N giocatori: chi gioca, turni, record,
                         classifica del round e generale, "contro se stesso"
  config/musiche.js      le musiche e i jingle, scritti come note (le suona audio.js)
  audio.js               effetti 8-bit e il sequencer delle musiche (Web Audio API): atti, pausa,
                         jingle; le musiche dei giochi a tempo (TRACCE); le canzoni vere (carica e
                         canzone: il ritaglio di X-Factor, col filtro degli errori); le voci
                         continue e la melodia cantata da Lori nella ballata (vaiA, voce, notaCanto)
  sprites.js             crea tutte le texture all'avvio; preparaGiocatore (calci e
                         doppione di chi sta per giocare), ritratto (la testa di un
                         personaggio, per selezione e classifiche)
  fx.js                  inquadratura, testi, immagini, stelline, fumo, menu,
                         pulsanti a schermo, eTouch/perDito, vibrazione
  grafica/               tutta la grafica, vettoriale e disegnata via codice
    base.js              strumenti di disegno, risoluzione (RES), e i gruppi di immagini che si
                         creano solo quando servono (gruppoPigro, usaGruppi): vedi sotto
    personaggi.js        i ventiquattro personaggi (con Emilio, Pastaffi, i cantanti Tini e
                         Oli, il Boni, Lori, Michele, il Giso e lo Zere), le ragazze delle due discoteche, il buttafuori e i quattro
                         giudici del provino: tratti, espressioni, vestiti
    marco.js             primo piano per la barba: maschere, zone delicate
    bota.js              il Bota sdraiato visto dall'alto (davanti e dietro), dove
                         c'è pelle, la spiaggia col telo, sole, mano, telefono e
                         lattina
    powerstation.js      il bar della Spina: le foto incorniciate del gruppo alle pareti
    oggetti.js           Golf di ReGrorio, pinte, spina, clienti, attrezzi del
                         barbiere, panino e ingredienti, mani di Guerra, piatti,
                         finestre con le persiane, fumogeni, ombrelloni,
                         cannone e bagnarole dei pirati, carte e fiches,
                         pallone, Panda, ciclisti scout, trattore e Vespa,
                         macchine viste di lato (Panda, Golf, SUV e l'A3 di
                         Giorgio), chiavi, cartello, consolle del DJ, tavolini,
                         birra gratis
    tentacoli.js         i tentacoli del Petri (ridisegnati a ogni fotogramma)
    disco.js             la discoteca del Manna vista dall'alto (sfondo `bgPista`), la
                         palla a specchi, il DJ, gli oggetti dei sabotaggi, i bersagli
                         della sfida
    medaglie.js          le medaglie di bronzo, argento e oro, la coppa dei trofei, la pinta
    palco.js             la pista del Manna vista di fronte (sfida di ballo dell'Incubo degli
                         Scapoli): parete coi LED, consolle, frecce e bersagli
    vialetto.js          il vialetto di ghiaia con la casa, il portico, la tettoia con
                         la moto e il cancello; la station wagon di Emilio, gli Shar
                         Pei (uno per ogni voce dell'array `cani`), il gatto,
                         biscotti e palline, le icone
    pallaio.js           il Pallaio visto da dietro le spalle di chi tira, il tavolo da
                         ping pong in prospettiva, la rete, i bicchieri di plastica pieni
                         di birra, la pallina, la mano, la lampadina, la giacca
    provino.js           il palco del talent (inventato) di "Provini a X-Factor": la grande
                         X luminosa, i fari, il tavolo dei giudici, il pubblico con gli
                         accendini (la console coi pad la disegna la scena)
    taverna.js           "La pizza dal Boni": la taverna col forno a legna, la tavola lunga
                         con la tovaglia a quadri, il bancone con la pasta e le ciotole, gli
                         ingredienti, il foglietto, i nascondigli e i travestimenti
    piazzetta.js         "La ballata del Pallaio": la piazzetta davanti al Pallaio di sera
                         con le lucine, il cartellone del cantastorie, il telo, i tavolini,
                         e le vignette (vignetta(): piccole scene coi personaggi e gli
                         oggetti del gioco, composte all'inizio di ogni ballata)
    pizzeria.js          "Scontrino, prego!": la pizzeria al taglio di Michele vista di fronte
                         (lavagna, orologio, arco, insegna col nome del locale, porta d'uscita),
                         il banco con la vetrina e la cassa (display e stampante), i clienti a
                         pezzi da ricolorare col tint, lo scontrino, il volantino, la luce blu
    sfondi.js            pub, strada, barberia, bar, sala da pranzo e tavola,
                         cortile con la villetta di Franci, spiaggia, casinò e
                         tavolo verde, prato toscano, strada tra vigne e grano,
                         parcheggio sotto casa di notte, pista della discoteca
  scenes/menu.js         boot, menu, la sala dei microgiochi (allenamento e partita
                         singola), comandi, pausa
  scenes/partita.js      prima della partita: quanti siete, scelta dei personaggi,
                         modalità
  scenes/impostazioni.js la schermata Impostazioni (dal menu e dalla pausa)
  scenes/novita.js       la schermata Novità (dopo un aggiornamento, e dal menu)
  scenes/bancone.js      il Bancone (negozio delle Pinte)
  scenes/profilo.js      il Profilo: personaggi, trofei, record, albo d'oro
  scenes/livelli.js      i livelli di ogni giocatore (l'handicap)
  scenes/modalita.js     la fine della partita Da solo
  scenes/torneo.js       il tabellone del Torneo, la fine della Sfida del giorno, le
                         classifiche a Squadre
  scenes/beerpong.js     la modalità BEER PONG: le squadre, la partita, la fine
  scenes/flusso.js       introduzione ("TOCCA A...!", PROVA e PRONTO!), risultato del turno
                         con la medaglia, classifica del round e generale, premi buffi,
                         finale (a due, oppure il podio)
  microgames/
    MicrogiocoBase.js    interfaccia comune (timer, pausa, fine, punteggio)
    index.js             registro dei microgiochi
    SpinaScene.js  ReGrorioScene.js  BarbaScene.js
    PaninoScene.js  ManiScene.js  SegoScene.js
    RondaScene.js  BlackjackScene.js  PalleggiScene.js  PassaseoScene.js
    BotaScene.js  GuidaScene.js  PiovraScene.js  ScapoliScene.js
    RetromarciaScene.js  BeerpongScene.js  XfactorScene.js
    PizzaScene.js  BallataScene.js  ProverbiScene.js  ScontrinoScene.js
```

Le immagini sono tutte disegnate dal codice, all'avvio. Gli sfondi e le immagini che servono a un
microgioco solo stanno in **gruppi** (`gruppoPigro` in `js/grafica/base.js`): si creano quando parte
il loro microgioco e si buttano quando ne parte un altro. Senza, sul telefono le immagini di tutto
il gioco superavano i 300 MB, e Safari su iPhone ha un tetto: oltre, i disegni restavano vuoti (lo
sfondo del Bota, la schiuma della Barba). Ora all'avvio sono circa 140 MB, e durante un microgioco
al massimo 180. Quali gruppi servono a ogni microgioco: `GRUPPI_MICROGIOCHI` in `js/sprites.js`.

Le coordinate di gioco sono in unità logiche su uno schermo 480x270; il disegno
vero avviene a `RES` volte (4 = 1920x1080 sul computer, 3 = 1440x810 sul telefono). Per aggiungere un'immagine a grandezza naturale
si usa `im(scene, x, y, chiave)` di `fx.js`.

## Personaggi

Per ritoccare un personaggio basta cambiare i suoi parametri in cima a
`js/grafica/personaggi.js`. Oltre a colori e forma del viso (`faccia`) ci sono:

- `stile` dei capelli: `ricci` (Passaseo), `ricciMedi` (Riccardo: gli stessi riccioli ma
  più raccolti), `indietroLungo` (Giorgio: all'indietro, ai lati fino al lobo),
  `spuntato` (il Petri: corti, tirati su a punte), `indietro`, `corto`, `ciuffo`, `grigio`, `rasato` (Marsupino),
  `stempiato` (Guerra), `spettinato` (Sego), `ricciCorti` (il Generale, l'Ingiocabile, Lori),
  `lunghiBagnati` (lo Zio); per le ragazze della disco `lunghi`, `caschetto`, `ricciLunghi`,
  `coda`, `chignon`; con `rasato`, `rasatoScuro: true` fa vedere la rasatura (il Bota);
  `mossi` (il Manna: corti e spettinati, con le ciocche sulla fronte); `taglio` (le ragazze
  del Manna, con `taglio`: `lisci`, `ricci`, `caschetto`, `coda`, `chignon`); `rasta` (Tini: i
  rasta lunghi sulle spalle) e `ricciLunghetti` (Oli: ricci scuri fino al collo); `sfumato` (il
  Boni: corti sopra, coi lati e la nuca sfumati quasi a zero)
- `barba`: `nessuna`, `accenno`, `ispida`, `pizzetto`, `pizzettoBaffi`, `piena`, `folta`, `corta`
- `occhiali: { montatura, lenti, tartaruga? }` sul viso (a Marsupino scivolano sul
  naso quando si spaventa), oppure con `inMaglietta: true` appesi alla maglietta;
  con `tondi: true` occhiali tondi (Passaseo), con `inFronte: true` tirati su sulla
  fronte (il Bota)
- `cappello: { tipo: 'basco', colore, stemma }` (il Generale); `cappuccio: colore` (la felpa
  tirata su: il travestimento del Passaggiorgio), `cuffie: true`
- `statura` (1 = normale; il Petri 0.88: più basso, coi piedi sempre a terra), `ciglia: true`,
  `rossetto: colore`
- del Manna: `sopraAlzato` (un sopracciglio sempre alzato), `ghigno` (il sorrisetto storto),
  `anellinoNaso: colore`, `orecchini: colore` (a cerchio), `tatuaggi: colore` (sulle braccia
  scoperte), `larghi: true` (pantaloni larghi); `accessorio` (quello che si tiene in mano:
  `spritz`, `telefono`, `ventaglio`, `foto`, `cellulare`)
- di Emilio e Pastaffi: `cappello: { tipo: 'bandana', colore, fantasia }`, `barbaColore` e
  `baffi` (barba e baffi di un colore diverso dai capelli), `stivali: true`,
  `catenaPortafoglio: colore`, `septum: colore` (l'anellino sotto il naso); la `statura`
  di Emilio è 0.72: è il più basso di tutti. Pastaffi (Denny) ha i capelli biondo scuro (e la
  barba, che prende il colore dei capelli)
- dei cantanti: `cappello: { tipo: 'berretto', colore, stemma }` (Tini: il berretto con la
  visiera di traverso e una stella inventata), `collana: colore`, e nel `vestito`: `stampa:
  'fulmine'` (con `stampaColore`) sulla maglietta, `collo: 'v'` e `spalle: colore` (le maniche
  di un altro colore: Oli), `tartan: colore` (i quadri sui pantaloni), `strappi: true` (i
  jeans strappati al ginocchio)
- di Michele e del Giso: `tempie: colore` (con `corto`: i lati brizzolati), `occhiaie` (da 0 a
  1), `barba: 'pizzettoPieno'` (il pizzetto coi baffi folti, con `barbaGrigi` = i fili grigi),
  `grembiule: colore`, `sudore: true` (le gocce di chi è beccato); `fischietto: colore` (appeso
  al collo) e `fascia: { colore, testo }` (al braccio, con la scritta CONTROLLO SCONTRINI)
- `corporatura` (1 = normale, 1.2 = robusta) e `pancia` (quanto sporge il pancione:
  Marsupino ha 1.36 e 10), `muscoli: true` per il fisico da palestrato (il Bota: spalle
  larghe, vita stretta, pettorali, addominali e bicipiti), `labbra`, `sopraDritte`,
  `sopraDavanti` (sopracciglia sopra la frangia), `sguardo` (lo strabismo di Beppe)
- `vestito.tipo`: `tshirt`, `giacca` (con `sotto` = colore della maglietta, se no
  camicia a quadretti), `cardigan` (il vestito da nonno di Guerra: lana a coste coi
  bottoni grossi, con `camicia`, `quadretti` e `bottoni`), `piumino` (con `camicia` a
  righe e `catenina`), `mimetica`,
  `croupier` (gilet con `manica` e `papillon`), `scout` (con `fazzoletto` a righe),
  `camicia` (Giorgio vestito da sera, il Boni), `felpa` (col cappuccio abbassato: il Petri),
  `abito` (il vestito a bretelline delle ragazze: con `pantaloni` del colore della pelle),
  `vestitino` (il vestito delle ragazze del Manna), `canottiera` (il Manna: con `catenina`,
  `cintura` e `fibbia`), `chiodo` (il giubbotto di pelle di Emilio: `sotto` = colore della
  maglietta, `borchie` = colore delle borchie),
  `polo` (Michele: col colletto, i due bottoni e `ricamo` = le righe del nome ricamato sul petto,
  che vengono da `nomeLocale` nella configurazione del suo microgioco), `maglione` (il Giso: lana
  a coste, girocollo e polsini),
  `costume` (a torso nudo: il costume da bagno è `pantaloni`, con `fantasia` = colori
  dei fiorellini);
  con `tshirt`, `bottoni: true` fa i bottoncini sotto il collo (Lori);
  `corti: true` per i pantaloncini, `calzettoni` per i calzettoni, `infradito: true`
  per i piedi nudi nelle infradito

Ogni personaggio ha 5 espressioni: `normale`, `felice`, `triste`, `shock`,
`sufficienza` (texture `id_espressione`, es. `sego_felice`). In più, create in
`js/sprites.js` solo per chi le usa: `marsupino_rabbia` (furioso) e le pose del
palleggio `id_calcio1D`, `id_calcio2D` (gamba destra a metà e in alto; `S` per la
sinistra) per lo Zio e, create al momento, per chi sta per giocare (`preparaGiocatore`,
che fa anche il doppione `idBis_<espressione>` di chi gioca contro se stesso:
lo stesso personaggio con `travestimento: true`); `bota_abbronzato` (occhiolino e pollice
in su) e `bota_aragosta` (rosso a chiazze col segno degli occhiali) per il finale di
"Spalma il Bota!"; per il Passaggiorgio `giorgioSera_<espressione>` (in camicia),
`giorgioCuffie` e `incognito_<id>` (cappuccio e occhiali: Giorgio e i sosia); per Petri
Tentacolari `ragazza0_<espressione>` ... `ragazza4_<espressione>` (le cinque ragazze, in
`RAGAZZE`) e `zioDJ` (lo Zio alla consolle, con le cuffie); per "L'Incubo degli Scapoli"
le figure del Manna (`manna_balla1`, `manna_balla2`, `manna_colpo`, `manna_occhiolino`,
`manna_macchia`, `manna_telefono`, `manna_collana`), le sue ragazze `tipa0_<espressione>` ...
`tipa4_<espressione>` (normale, felice, sbadiglio: sono in `TIPE`, altre da `RAGAZZE`) e
`buttafuori`, `buttafuori_chiede`; per "Emilio in Retromarcia" `emilio_disperato` (le mani
nella bandana), `pastaffi_corre` e `pastaffi_porta`, e i cani `cane0_a`, `cane0_b` (i due
passi), `cane0_giu` (sdraiato), `cane0_felice` (lingua fuori) e così via per ogni cane,
disegnati in `js/grafica/vialetto.js`; per il beer pong, create al momento per chi gioca, per gli
avversari e per il pubblico (`preparaBevitore` in `js/sprites.js`), le facce della sbronza che
sale `id_allegro`, `id_brillo`, `id_sbronzo` (guance rosse con `gote`, naso rosso con `nasoRosso`,
da 0 a 1; palpebre a mezz'asta e occhi incrociati con `palpebra` e `sguardo`), quelle del finale
`id_dorme` e `id_canta`, e la mano con la pallina `manoPong_<id>` (del colore della sua pelle);
per "Provini a X-Factor" le pose sul palco di Tini e Oli, col microfono in mano (`tini_palco`,
`tini_canta` a bocca aperta, `tini_gasato`, `tini_stona` sconvolto, `tini_male`, `tini_acuto`
con le braccia al cielo, `tini_indica` col dito puntato, e lo stesso per `oli_`), e i quattro
giudici inventati `giudice0_normale` ... `giudice3_normale` (anche `_felice`, `_orecchie` con le
mani sulle orecchie e `_no`): sono in `GIUDICI`, in fondo a `js/grafica/personaggi.js`. Le pose
nuove (`microfono`, `tiIndico`, `orecchie`) e l'espressione `canta` si possono dare a chiunque.
Per "La pizza dal Boni" il Boni con la pala (`boni_pala`), che grida l'ordinazione con le mani a
coppa (`boni_grida`), che corre arrabbiato (`boni_corre`), che beve dalla caraffa (`boni_beve`),
"vi ho beccati!" (`boni_beccati`), che caccia gli imbucati con la pala alzata (`boni_caccia`) e
furioso (`boni_rabbia`); Oli e il Sego che fanno l'occhiolino sotto la tovaglia
(`oli_occhiolino`, `sego_occhiolino`). Per "La ballata del Pallaio" Lori che canta con la mano sul
cuore (`lori_canta`), che alza la bacchetta (`lori_alza`), che batte (`lori_batte`), confuso
(`lori_confuso`), che fulmina il garzone (`lori_fulmina`), che si ripara dai pomodori
(`lori_ripara`) e l'inchino (`lori_inchino`); la bacchetta, lunga, la disegna la scena (va dalla
mano alla casella). Le pose sono in `POSE` (`pala`, `grida`, `corre`, `beve`, `caccia`, `cuore`,
`alza`, `batte`, `gratta`, `inchino`), gli oggetti in mano (`pala`, `palaAlta`, `caraffa`) in
`accessorio()`. Per "Le Perle di Denny" Denny da grande saggio (la posa `saggio`: dito alzato e
mano sul petto, con la faccia di sufficienza), offeso, che gongola, che si arrende e che proclama
dalla sedia: le crea la scena quando parte e le butta alla fine (`preparaPosa` in `js/sprites.js`,
densità più alta perché si vede in grande). Per "Scontrino, prego!" Michele è a due pezzi, corpo
e testa (`preparaCorpo` e `preparaTesta` in `js/sprites.js`), così cambia faccia senza cambiare
posa: le pose alla cassa (`cassa`, `taglia` con la `mezzaluna`, `strappa`, `aVoce`, `tasca`) e le
facce (`fischia`, l'espressione nuova di chi fischietta guardando altrove, `occhiolino`, `parla`,
beccato con `gote` e `sudore`); il Giso con la cartellina e la lente (la posa `conti`,
l'accessorio `lente`). Anche queste le crea la scena e le butta alla fine.

Le due discoteche non si pestano i piedi: Petri Tentacolari usa `RAGAZZE`, lo sfondo
`bgDisco` (vista dall'alto) e la musica `disco`; L'Incubo degli Scapoli usa `TIPE`, lo sfondo
`bgPalco` (vista di fronte, `js/grafica/palco.js`) e la musica `pista`.

Le icone dell'app (`icone/`) sono Riccardo e Giorgio felici sui raggi arancioni del menu,
disegnati con lo stesso codice dei personaggi: se cambia un personaggio, vanno rifatte.

Scorciatoia per le prove: `index.html?prova=barba` (o `spina`, `regrorio`,
`panino`, `mani`, `sego`, `ronda`, `blackjack`, `palleggi`, `passaseo`, `bota`, `guida`,
`piovra`, `scapoli`, `retromarcia`, `beerpong`, `xfactor`, `pizza`, `ballata`, `proverbi`, `scontrino`) apre subito quel microgioco, in
allenamento, col primo personaggio dell'ultima partita; con `&chi=` lo si prova con un altro, per
esempio `index.html?prova=scapoli&chi=manna` (che è anche il modo più svelto di vedere un
"contro se stesso").

## Aggiungere un personaggio giocabile

I personaggi che si possono scegliere sono quelli dell'elenco `personaggiGiocabili` in
`js/config.js` (oggi diciannove). Per renderne giocabile uno che c'è già tra i
`PERSONAGGI` di `js/grafica/personaggi.js` basta **una riga**:

```js
{ id: 'beppe', nome: 'Beppe', soprannome: 'Lo spinatore', colore: '#7ad1c0',
  esulta: 'Una media per tutti!', perde: 'È finito il fusto.' },
```

- `id`: il suo nome in `PERSONAGGI`
- `nome`: come compare nel gioco; `soprannome`: la riga sotto il nome nella selezione
- `colore`: il colore del giocatore (cursore, barra in classifica, scritte): meglio
  diverso da quelli degli altri
- `esulta` / `perde`: le sue frasi quando vince e quando perde

Griglia di selezione, ritratti, classifiche, podio, calci del palleggio e doppione
lo prendono da soli. Se è l'ospite di un microgioco, lì giocherà "contro se stesso"
senza fare altro; se è un personaggio di contorno, va aggiunto al `cast` di quel
microgioco. Per toglierne uno si cancella la riga (resta ospite del suo microgioco).

Per un personaggio del tutto nuovo, prima lo si disegna: una voce in `PERSONAGGI`
coi parametri descritti qui sopra (le cinque espressioni si creano da sole
all'avvio), poi la riga in `personaggiGiocabili`.

La griglia ha cinque colonne (così nella cella ci sta il nome breve, `breve` nella riga del
personaggio, se il nome è lungo) e posto per quattro righe (diciannove personaggi più "A
CASO": con Michele e il Giso è piena): se ne servono di più va rimpicciolita la cella (`COL` e `CELLA` in
`js/scenes/partita.js`). Al Bancone la fila dei personaggi si stringe da sola. Ognuno ha un personaggio diverso, quindi non si può essere
più dei personaggi giocabili: `maxGiocatori` va tenuto entro quel numero.

## Aggiungere un microgioco

1. Crea `js/microgames/MioGiocoScene.js`:

```js
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { im, txt } from '../fx.js';

export class MioGiocoScene extends MicrogiocoBase {
  constructor() { super('miogioco'); }      // id del microgioco (anche il nome del suo file di configurazione)

  prepara() {                                // sfondo, sprite, input
    this.punti = 0;
  }

  aggiorna(dt, p) {                          // dt = secondi, p = avanzamento 0..1
    // this.cfg = la tua configurazione (js/config/microgiochi/miogioco.js), this.giocatore = chi gioca
    // (this.giocatore.id + '_felice' ecc. sono i suoi sprite: usali così come sono,
    // senza dare per scontato che sia Riccardo o Giorgio; se gioca contro se
    // stesso sono già quelli del doppione)
    // this.termina() chiude il microgioco in anticipo
  }

  risultato() {
    return { punteggio: this.punti, vittoria: this.punti >= 10, riepilogo: `${this.punti} punti` };
  }
}
```

2. Registralo in `js/microgames/index.js`: `miogioco: MioGiocoScene`.
3. Crea la sua configurazione, `js/config/microgiochi/miogioco.js` (`export default { ... }`,
   copia la forma da un altro file della stessa cartella), con:
   - `titolo`, `durata` (secondi), `colore` (sfondo dell'introduzione)
   - `ospite: { id, etichetta }`: il personaggio mostrato nell'introduzione
     (es. `{ id: 'sego', etichetta: 'OBIETTIVO:\nSEGO' }`); facoltativo `cast: [id, ...]`,
     gli altri personaggi della storia: chi sceglie l'ospite o uno del cast lì
     gioca "contro se stesso"
   - `comandi`: righe per tastiera e mouse; `comandiTouch`: le stesse righe per
     chi gioca col dito (saranno mostrate sul telefono)
   - `obiettivo` e tutti i parametri di difficoltà del tuo gioco
   - facoltativo: `musica`, il nome di una musica di `js/config/musiche.js` (se no `gioco`):
     meglio una nuova, scritta apposta (vedi "Musiche")
   
   Poi in `js/config.js` importalo (`import miogioco from './config/microgiochi/miogioco.js';`),
   aggiungilo a `microgiochi: { ... }` e inserisci `'miogioco'` in `ordineSfida` se deve entrare
   nella sfida.

Partita singola, schermata comandi (a pagine), introduzione, turni per tutti i
giocatori, risultati e classifiche lo prendono da soli.

Se il microgioco ha immagini sue (uno sfondo, i suoi oggetti), conviene metterle in un gruppo che
si crea solo quando serve: in `js/sprites.js` un `gruppoPigro(scene, 'miogioco', creaMioGioco)` al
posto di `creaMioGioco(scene)`, e in `GRUPPI_MICROGIOCHI` la riga `miogioco: ['miogioco']` (con gli
eventuali sfondi di `sfondi.js` che usa, per nome).

La pausa a schermo sul telefono (coi due tocchi, `pulsantePausa` di `fx.js`) la mette già
`MicrogiocoBase`. Per il resto:
- testi mai sotto 7 (`size` di `txt()`; quelli che servono per giocare almeno 8): `txt()` alza
  da solo quelli più piccoli. Se non c'è posto, meglio togliere parole che rimpicciolire
- per le scelte di gioco (chi esce, quando, dove) `this.rnd = casuale(Sessione.seme)` di
  `grafica/base.js`, mai `Math.random()` (quello solo per gli effetti: fumo, scintille): così
  tutti i giocatori del round trovano la stessa partita. La prova `--solo-seme` lo controlla
- `eTouch()` e `perDito(testoTastiera, testoDito)` di `fx.js` per scegliere testi e
  comandi; `comandiTouch` nel file di configurazione per l'introduzione e la schermata Comandi
- `multiTouch(this)` (usa `this.input.addPointer`) se servono più dita insieme;
  `pointer.wasTouch` dice se l'input arriva da un dito
- `pulsante(scene, x, y, icona, azione)` per un pulsantino a schermo: il suo tocco
  non arriva al resto della scena
- `vibra(ms)` per colpi ed errori (solo sul telefono, dove si può)
- mai numeri che danno per scontato `RES = 4` (es. ritagli di texture: usa `RES`)
- aggiorna le scritte dell'HUD solo quando cambiano (`setText`/`setColor` a ogni
  fotogramma ridisegnano il testo e rallentano)
- nel `finale()` nascondi l'HUD del microgioco, se no copre il titolo
- se usi un cursore disegnato, nascondi quello del mouse (`setDefaultCursor('none')`)
  e aggiungi la scena alla lista in `PausaScene`, così resta nascosto dopo la pausa
