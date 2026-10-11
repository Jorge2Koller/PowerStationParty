# PowerStation Party

Microgiochi in stile WarioWare con Phaser 3, da giocare in compagnia: da 1 a 8
giocatori sullo stesso schermo (ci si passa la tastiera o il telefono). Ognuno
sceglie il suo personaggio, tutti giocano lo stesso microgioco, un turno a testa,
e vince il round chi fa più punti.

I microgiochi sono quindici:

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
| `passaseo` | Passa di qua | Passaseo |
| `bota` | Spalma il Bota! | il Bota |
| `guida` | Il Passaggiorgio | Giorgio |
| `piovra` | Petri Tentacolari | il Petri ("il Piovra") |
| `scapoli` | L'Incubo degli Scapoli | il Manna |
| `retromarcia` | Emilio in Retromarcia | Emilio (con Pastaffi e gli Shar Pei) |

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
o si passa a un'altra app). In alto a destra ci sono i pulsanti **pausa** e
**audio** (sul telefono non ci sono ESC e M) e, nel menu, **schermo intero** dove il
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
`index.html?touch=1` mostra dal computer i testi e i pulsanti del telefono.

## Modalità

Dal menu, **GIOCA** porta a tre schermate, una dopo l'altra:

1. **Quanti siete?** Da 1 a 8 (`maxGiocatori` in `js/config.js`): frecce e INVIO, il
   tasto del numero, oppure un clic o un tocco sulla casella.
2. **Scegliete il personaggio**, uno alla volta, come nei picchiaduro: una griglia di
   ritratti, a sinistra l'anteprima in grande con nome, soprannome e motto. Un
   personaggio già preso non si può riprendere (resta in grigio, col numero di chi
   l'ha scelto); "A CASO" ne pesca uno libero. BACKSPACE o ESC (col dito: un tocco
   sul giocatore nella fila in basso) toglie l'ultima scelta.
3. **La modalità**:
   - **Sfida completa**: tutti e 15 i microgiochi, nell'ordine di `ordineSfida`.
   - **Sfida rapida** da 3, 5 o 8 microgiochi pescati a caso (`sfidaRapida`).
   - **Al meglio di 3** o **di 5** (`alMeglioDi`): microgiochi pescati a caso, vince
     chi per primo vince 2 round (o 3). Se i microgiochi finissero prima, decide la
     classifica.
   - **Partita singola**: un solo microgioco, scelto dalla lista (su due colonne:
     SU/GIÙ scorrono la prima e poi la seconda).

Da soli c'è solo l'**allenamento**: dopo il personaggio si sceglie il microgioco.

Il gioco ricorda i personaggi dell'ultima partita (nel `localStorage` del browser, se
c'è): la volta dopo le schermate arrivano già compilate e per rigiocare uguale basta
premere INVIO fino in fondo.

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
e la **classifica generale**, con le barre che crescono e i sorpassi. In due resta
la schermata di sempre: chi ha vinto il round e i totali.

### Chi vince

- **In due** è come è sempre stato: nella sfida completa, in quella rapida e nella
  partita singola vince chi fa più **punti in totale** nei microgiochi (a parità,
  chi ha vinto più round); al meglio di 3 o 5 contano i **round vinti** (un round
  pari non conta e se ne gioca un altro; a parità, i punti).
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
stessa modalità; i microgiochi a caso si ripescano), **Cambia personaggi**, **Menu**.
Le frasi di sfottò sono in `js/config.js`: `sfotto` (con `{primo}` e `{ultimo}`) e,
da tre giocatori in su, anche `sfottoTanti` (con `{secondo}` e `{tutti}`).

### Contro se stesso

Chi sceglie un personaggio che è anche l'ospite di un microgioco (il Manna
nell'Incubo degli Scapoli, ReGrorio in "Arriva ReGrorio!"...) quel microgioco lo
gioca lo stesso, contro la versione di sé mossa dal computer: nell'introduzione
compare il timbro "CONTRO SE STESSO!" e, dove il giocatore si vede in scena, entra
il suo **doppione**: lo stesso personaggio travestito con occhiali finti, nasone e
baffi, così i due non si confondono. Il microgioco non cambia di una virgola.
Vale anche per i personaggi di contorno, elencati in `cast` nella sezione del
microgioco (Pastaffi in "Emilio in Retromarcia").

## Comandi

- Menu: frecce + INVIO, oppure il mouse, oppure il dito (un tocco = scegli)
- La Spina del PowerStation: tieni premuto SPAZIO, rilascia nella zona verde.
  Col dito (o col mouse): tieni il dito in qualunque punto dello schermo e alzalo
  nella zona verde (il pulsante SPILLA in basso è solo un promemoria)
- Arriva ReGrorio!: frecce SINISTRA/DESTRA per cambiare corsia, SPAZIO per saltare.
  Col dito: tocca nel terzo di sinistra o di destra dello schermo per cambiare
  corsia, in mezzo per saltare (con due dita insieme si salta e si cambia corsia)
- La Barba di O'Sfurnacchiat (mouse o trackpad):
  - tasto destro: stendi la schiuma (dopo qualche secondo si secca).
    Sul trackpad del Mac: clic a due dita, oppure tieni premuto CTRL e clicca.
    Si può premere o lasciare CTRL anche a metà passata per cambiare attrezzo
  - tasto sinistro: radi, solo dove c'è schiuma e senza correre (se vai veloce, taglietto)
  - quando la lama è piena, portala sulla bacinella per sciacquarla
  - la barba copre guance, baffi e mento ed esce appena dal viso; quella tagliata resta
    tagliata (la ricrescita è spenta: `ricrescitaInizio` e `ricrescitaFine` in `config.js`)
  - niente rasoio su naso, labbra, occhi, orecchie e nei (nei e cerotti stanno sempre
    sulla pelle del viso)
  - contano solo gli errori di chi rade: la velocità è quella della mano (misurata sugli
    ultimi due decimi di secondo), e se è De Luca a muoversi di scatto o ad aprire la bocca
    sotto la lama non è un errore (`velSussulto` e `margineRincorsa` in `config.js`)
  - col dito: l'interruttore in basso a sinistra sceglie PENNELLO o RASOIO (si può
    cambiare anche a metà passata con un altro dito); l'attrezzo sta un po' sopra
    il dito, così si vede la lama; col dito si può andare un po' più veloci
    (`velMaxDito` in `config.js`)
- Il Panino di Marsupino:
  - FRECCE SINISTRA/DESTRA (o A/D) oppure il mouse: il pane si sposta (stessa
    velocità massima per tutti, col mouse non si teletrasporta)
  - col dito: trascina in basso dove vuoi, il pane si sposta della stessa misura
    (non salta sotto il dito, così non lo copri)
  - prendi prosciutto, würstel, sottiletta, ketchup e maionese (gli ultimi due
    arrivano come schizzi dai tubetti che passano in alto); con tutti e 5 il panino
    si chiude e ne parte un altro. Calzini, lische, ghiaccio e ciabatte lo rovinano
    (e Marsupino va su tutte le furie: diventa paonazzo, salta, fuma dalle orecchie e urla)
  - si prende in cima alla pila: più è alta, più ondeggia quando ti muovi
- Guerra, via quelle mani! (mouse o dito, niente tastiera):
  - clic o tocco sulla mano = schiaffo; col dito si possono colpire due mani insieme
  - se una mano ha già preso un piatto, colpiscila per riportarlo indietro
  - col guanto da forno servono due schiaffi; le finte tornano indietro da sole
  - schiaffo a vuoto: la tua mano resta dolorante per un attimo
- Sego, sono sotto casa!:
  - mouse: punta, tieni premuto (la forza sale e scende da sola), rilascia
  - tastiera: FRECCE per mirare, SPAZIO tenuto per la forza, rilascia per lanciare
  - dito: appoggia, tira indietro come una fionda, lascia
  - la traiettoria tratteggiata e il mirino dicono dove arriva: verde = finestra
    aperta, rosso = persiane chiuse, grigio = muro
- TorRONDAcelli:
  - mouse: punta sul mare e clicca per sparare; tastiera: FRECCE + SPAZIO;
    dito: tocca il mare dove vuoi colpire
  - la palla ci mette di più ad arrivare lontano: mira un po' avanti alla bagnarola
  - gommone 1 colpo, pedalò 2, galeone 3. Se toccano riva si prendono un
    ombrellone: affondali mentre scappano e l'ombrellone torna
  - munizioni: la cassa che lancia il Generale (clic, tocco o R); un colpo torna
    anche da solo ogni tanto
- L'Ingiocabile (blackjack):
  - 1, 2, 3 o clic/tocco sulle fiches: punti 10, 25 o 50
  - C o SPAZIO = carta, S o INVIO = stai, D = raddoppia (anche coi pulsanti)
  - il banco sta su 17, il blackjack paga 3 a 2; nella sfida tutti e due trovano
    lo stesso mazzo
- MaraZio (palleggi):
  - FRECCE SINISTRA/DESTRA (o A/D) o il mouse per muoversi, SPAZIO o clic per calciare;
    col dito: trascina sul prato per muoverti e tocca CALCIA
  - calcia quando il pallone arriva al piede: perfetto = sale dritto, buono =
    scappa un po', scarso = scappa tanto; se cade, la serie riparte
  - a ogni colpo la gamba dalla parte del pallone si alza (anche quella dello Zio)
- Passa di qua:
  - FRECCE SINISTRA/DESTRA (o A/D), il mouse o il dito trascinato per sterzare
  - passa nella pozzanghera proprio mentre affianchi un Passaseo in bici: SPLASH
  - non toccare i ciclisti (si frena e si perdono punti), occhio a trattori e Vespe
- Spalma il Bota! (mouse o trackpad):
  - tasto destro: spremi una goccia di crema dove punti (sul trackpad del Mac: clic a
    due dita, oppure CTRL + clic). Tenendo premuto ne escono altre
  - tasto sinistro tenuto: spalmi. La mano porta via la crema in più e la lascia dove
    manca; le zone spalmate bene luccicano, i mucchietti bianchi sono chiazze da stendere
  - la pelle scoperta diventa rosa, poi rossa (da lì è scottata per sempre), poi rosso
    aragosta. A metà partita il Bota si gira: il davanti resta com'era
  - tubetto vuoto: tasto R, oppure clic sul tubetto in basso a destra, per scuoterlo
    (tornano due gocce, ma si perde tempo)
  - disturbi: il Bota si sposta, un'onda lava una gamba, il vento porta la sabbia (va
    ripassata con la mano), un gabbiano viene a rubare il tubetto (cliccalo per cacciarlo)
  - niente crema su occhi e bocca; se è lui a muoversi sotto la mano non conta
  - col dito: l'interruttore in basso a sinistra sceglie TUBETTO o MANO, l'attrezzo sta
    un po' sopra il dito; tubetto e gabbiano si toccano
- Il Passaggiorgio (stasera guida Giorgio, per forza):
  - Giorgio corre verso le macchine degli amici (la Panda di Guerra, la Golf di Greg, il SUV
    di Sego), apre una portiera e ci si infila: clic o tocco su di lui prima che la chiuda,
    e vola in mezzo al parcheggio. Se la chiude, la macchina parte con lui dentro e torna
    dopo qualche secondo (passaggio scroccato)
  - quando è a terra, trascina le chiavi (in basso a destra) fino a lui: va alla sua A3
    impolverata e si mette al volante (poi scende con una scusa e si ricomincia)
  - tastiera: FRECCE SINISTRA/DESTRA scelgono la macchina, SPAZIO lo tira fuori, INVIO gli
    lancia le chiavi quando è a terra
  - più avanti: finte, sagome di cartone di Giorgio nelle altre portiere, Giorgio col
    cappuccio e gli occhiali con un sosia incappucciato (da non tirare fuori), il bagagliaio
  - clic a vuoto (o sul cartone): la mano resta ferma per un attimo
- Petri Tentacolari (scappa dal Piovra):
  - tocca (o clicca) una ragazza e trascina: le disegni la strada, lei la segue. Se arriva al
    tavolo delle amiche, a destra, è salva
  - i tentacoli del Petri puntano la ragazza più vicina: se la prendono resta agganciata a
    chiacchierare. Tocca il tentacolo (SCIAF!) per liberarla; col dito si può guidare una
    ragazza e intanto schiaffeggiare con un altro dito
  - aiuti in basso, con la ricarica: SHOTTINO GRATIS (poi tocca dove lanciarlo: il Petri ci si
    fionda e molla tutto) e AMICO IN MEZZO (un personaggio del gioco blocca i tentacoli)
  - tastiera: TAB sceglie la ragazza, FRECCE la guidano, SPAZIO schiaffo al tentacolo più
    vicino a lei, 1 e 2 gli aiuti (lo shottino va da solo nel punto più lontano dalle ragazze)
  - ogni tanto un tentacolo a sorpresa sbuca da sotto un tavolino o dalla consolle
- L'Incubo degli Scapoli (in discoteca contro il Manna, la calamita):
  - FRECCE (o WASD) per muoverti; col mouse, clic sul punto della pista dove andare;
    col dito, trascina (il personaggio sta un po' sopra il polpastrello)
  - fare colpo: fermati vicino a una ragazza (lei ti aspetta) e sopra di lei esce UNA
    freccia bella grossa, con attorno un anello che si consuma piano: è il tempo che hai
    (un paio di secondi abbondanti). Premi quella freccia sulla tastiera, oppure clicca o
    tocca il bersaglio (sul telefono è un cerchio): non c'è ritmo da seguire. Tre giuste
    e balla con te. Un tasto sbagliato toglie pochissimo e la freccia resta lì; se la
    lasci scadere lei sbadiglia e il cuore scende un po'. Ne escono tre di fila, una
    alla volta; se non bastano, resta lì e ricominciano. Per lasciar perdere col mouse
    o col dito basta toccare la pista lontano da lei
  - in pista ci sono al massimo tre ragazze; di solito girano alla larga dall'aura del
    Manna, ogni tanto ci passano dentro: è lì che bisogna fermarle. Dentro l'aura ogni
    freccia rende la metà (ma mentre fai colpo l'aura la tira molto meno). Con un po'
    di cuore ti viene dietro: portala via
  - fare da muro (facoltativo): se stai tra una ragazza e il Manna l'aura la tira molto
    meno (lei ha un cerchietto verde, e dietro di te l'aura è spezzata)
  - sabotaggi: passa sopra l'oggetto che compare in pista o davanti al bancone (ne tieni
    uno alla volta) e usalo con SPAZIO, con un clic sull'icona in basso a sinistra, o col
    pulsante SABOTAGGIO sul telefono. Drink rovesciato, chiamata della mamma, shottino,
    richiesta al DJ (un lento: le tue frecce rendono il doppio), buttafuori
  - a 12 secondi dalla fine il Manna si scatena e per qualche secondo l'aura si allarga: un
    sabotaggio la spegne
  - per renderlo più facile o più difficile, in `js/config.js` (blocco `scapoli`):
    `tempoFrecciaInizio`/`tempoFrecciaFine` (secondi per ogni freccia), `maxRagazze`,
    `curiosa` (quanto spesso le ragazze vanno da sole verso il Manna), `auraInizio`/
    `auraFine` e `attrazione` (quanto è forte la calamita), `elastico` (l'aiuto a chi
    sta perdendo)
- Emilio in Retromarcia (fai uscire Emilio dal cancello senza che tocchi i cani):
  - FRECCE (o WASD) per muoverti; col mouse, clic sul punto del vialetto dove andare;
    col dito, trascina (il personaggio sta un po' sopra il polpastrello)
  - la macchina esce in retromarcia a scatti: prima di ogni scatto si accendono le luci
    bianche e fa "bip bip". Dietro la coda c'è la zona rossa (lampeggia durante l'avviso):
    se la macchina arriva addosso a un cane che sta lì è uno spavento e perdi una vita
  - spingere: cammina contro un cane e lo spingi dalla parte dove stai andando
  - lanciare: SPAZIO tenuto carica la forza (sale e scende: il cerchio giallo mostra dove
    cade), al rilascio lanci nella direzione in cui guardi; col mouse, tasto destro (o
    CTRL+clic) e lanci verso il puntatore; col dito, tocca l'icona della munizione e poi
    il punto del vialetto. Q, la rotellina o un clic sull'icona cambiano tra biscotto e
    pallina. Il goloso corre solo dietro ai biscotti, quello della pallina solo dietro
    alla pallina, il pigro ignora tutto e si sposta solo a spinte
  - raccogliere: biscotti e palline nuovi compaiono in giro per il giardino (alone
    giallo): ci si passa sopra
  - E, o clic (o tocco) sulla faccia di Pastaffi in basso a destra: esce di casa, prende in
    braccio il cane più vicino alla macchina e lo porta nel prato; Emilio inchioda per un
    secondo. Due chiamate per partita (`pastaffi.chiamate` in `js/config.js`)
  - nel prato e sotto il portico i cani sono al sicuro, ma dopo qualche secondo tornano
    sul vialetto. A 15 secondi dalla fine passa il gatto, e tutti gli vanno dietro
  - i cani stanno nell'array `cani` di `js/config.js` (blocco `retromarcia`): nome, colore
    del collare, personalità (`pigro`, `pallina`, `goloso`), taglia, macchia. Si possono
    rinominare, togliere o aggiungere; chi non ha il nome si chiama da solo Morgan, col
    numero romano che gli tocca (Morgan IV, Morgan V...)
- ESC: pausa — M: audio sì/no (sul telefono: i pulsanti in alto a destra)

Sul telefono, dove il browser lo permette (Android), colpi ed errori fanno vibrare
brevemente il telefono.

## Punteggi dei microgiochi nuovi

- **TorRONDAcelli** (45 s): +10 per ogni bagnarola affondata (+5 se lontana dalla
  riva), +5 per ogni ombrellone ripreso, +15 per ogni ombrellone ancora piantato
  alla fine. Vittoria con almeno 3 ombrelloni su 5; persi tutti, finisce prima.
- **L'Ingiocabile** (60 s): si parte con 100 fiches, il punteggio sono le fiches
  alla fine (una mano a metà si annulla). Vittoria con più di 100; al verde,
  finisce prima.
- **MaraZio** (45 s): +10 per ogni palleggio (+5 se perfetto), +5 per ogni palleggio
  della serie migliore. Vittoria con una serie di almeno 12.
- **Passa di qua** (45 s): SPLASH +10, +20, +30, +40 se fatti di fila (si riparte
  da +10 dopo un tocco), +1 per una pozzanghera presa senza nessuno accanto,
  -10 per un ciclista sfiorato, -5 per trattori e Vespe. Vittoria con almeno 12 schizzi.
- **Spalma il Bota!** (45 s): punti = percentuale di pelle protetta, meno 1 per ogni
  punto percentuale di pelle scottata e di chiazze di troppa crema, più fino a 20 se
  nel tubetto avanza crema. Vittoria con meno del 15% di pelle scottata. Le percentuali
  contano la pelle che ha preso il sole: solo il davanti fino al giro, poi tutto.

- **Panino** (45 s): +10 per ogni ingrediente che mancava, +3 per i doppioni,
  +30 per ogni panino completo (+10 se fatto in meno di 8 s), -10 per ogni
  schifezza. Vittoria con almeno 3 panini.
- **Mani** (45 s): schiaffo +5, +8 se la mano era già vicina al piatto, +4 se stava
  trascinando via un piatto (è un recupero, vale meno: se no converrebbe lasciarli
  prendere apposta), +2 per il guanto tolto, +15 per ogni piatto ancora tuo alla
  fine. Vittoria con almeno 3 piatti su 5; persi tutti, finisce prima.
- **Il Passaggiorgio** (45 s): +10 ogni volta che Giorgio viene tirato fuori (+5 se era già
  quasi dentro), +50 ogni volta che si mette al volante della sua A3, -20 per ogni passaggio
  scroccato, -5 se si tira fuori il sosia incappucciato. Vittoria se guida almeno 4 volte.
- **Petri Tentacolari** (45 s): +10 per ogni ragazza che arriva al tavolo delle amiche, più
  la serie (fughe di fila senza nessuna agganciata nel frattempo: +5 alla seconda, +10 alla
  terza, fino a +20), -15 per ogni ragazza ancora agganciata alla fine. Vittoria con almeno
  10 ragazze salvate.
- **L'Incubo degli Scapoli** (50 s): +15 per ogni ragazza che balla con te, +5 per ogni
  sabotaggio usato, +25 se alla fine ne hai conquistate più del Manna. Vittoria solo se
  ne hai conquistate più di lui.
- **Emilio in Retromarcia** (50 s): +4 per ogni metro fatto dalla macchina (il vialetto è
  lungo 25 metri), +10 per ogni cane tolto dalla zona rossa all'ultimo istante, +20 per
  ogni vita rimasta (sono 3) e, se Emilio esce dal cancello, +15 per ogni chiamata di
  Pastaffi non usata. Vittoria se la macchina esce dal cancello prima che scada il tempo
  con almeno una vita; al terzo spavento finisce prima.
- **Sego** (50 s): +3 per ogni fumogeno in una finestra aperta (+6 nella stanza di
  Franci), -2 per quelli sprecati. Se Franci esce (80% di fumo in casa): +50 e +2
  per ogni secondo che avanza; se non esce, metà della percentuale di fumo.

Tutti i numeri (punti, durate, velocità, curve di difficoltà) sono in `js/config.js`.

## Struttura

```
index.html               pagina del gioco (telefono: zona sicura, "Gira il telefono")
manifest.json            nome, icone e orientamento per la schermata Home
sw.js                    service worker: il gioco offline dopo la prima visita
icone/                   icone per la schermata Home (disegnate col codice del gioco)
server.py                server locale senza cache (Windows, Mac, Linux; --rete)
avvia.bat                doppio clic su Windows
avvia.command            doppio clic su Mac
avvia-telefono.bat       come sopra, ma il gioco si apre anche dai telefoni
avvia-telefono.command   sulla stessa Wi-Fi
js/
  config.js              titolo, personaggi giocabili, modalità, durate, difficoltà,
                         frasi di sfottò
  compat.js              aggiunte per i browser più vecchi (Safari)
  dispositivo.js         computer o telefono? (eTouch, ?touch=1)
  main.js                avvio di Phaser, scene, audio, telefono in verticale e in sottofondo
  vendor/phaser.min.js   Phaser 3.80.1
  sessione.js            stato della partita per N giocatori: chi gioca, turni, record,
                         classifica del round e generale, "contro se stesso"
  audio.js               effetti 8-bit e musica (Web Audio API)
  sprites.js             crea tutte le texture all'avvio; preparaGiocatore (calci e
                         doppione di chi sta per giocare), ritratto (la testa di un
                         personaggio, per selezione e classifiche)
  fx.js                  inquadratura, testi, immagini, stelline, fumo, menu,
                         pulsanti a schermo, eTouch/perDito, vibrazione
  grafica/               tutta la grafica, vettoriale e disegnata via codice
    base.js              strumenti di disegno, risoluzione (RES)
    personaggi.js        i diciassette personaggi (con Emilio e Pastaffi), le ragazze delle
                         due discoteche e il buttafuori: tratti, espressioni, vestiti
    marco.js             primo piano per la barba: maschere, zone delicate
    bota.js              il Bota sdraiato visto dall'alto (davanti e dietro), dove
                         c'è pelle, la spiaggia col telo, sole, tubetto, mano,
                         gabbiano, onda
    oggetti.js           Golf di ReGrorio, pinte, spina, clienti, attrezzi del
                         barbiere, panino e ingredienti, mani di Guerra, piatti,
                         finestre con le persiane, fumogeni, ombrelloni,
                         cannone e bagnarole dei pirati, carte e fiches,
                         pallone, Panda, ciclisti scout, trattore e Vespa,
                         macchine viste di lato (Panda, Golf, SUV e l'A3 di
                         Giorgio), chiavi, cartello, consolle del DJ, tavolini,
                         shottino
    tentacoli.js         i tentacoli del Petri (ridisegnati a ogni fotogramma)
    disco.js             la discoteca del Manna vista dall'alto (sfondo `bgPista`), la
                         palla a specchi, il DJ, gli oggetti dei sabotaggi, i bersagli
                         della sfida
    vialetto.js          il vialetto di ghiaia con la casa, il portico, la tettoia con
                         la moto e il cancello; la station wagon di Emilio, gli Shar
                         Pei (uno per ogni voce dell'array `cani`), il gatto,
                         biscotti e palline, le icone
    sfondi.js            pub, strada, barberia, bar, sala da pranzo e tavola,
                         cortile con la villetta di Franci, spiaggia, casinò e
                         tavolo verde, prato toscano, strada tra vigne e grano,
                         parcheggio sotto casa di notte, pista della discoteca
  scenes/menu.js         boot, menu, lista dei microgiochi (allenamento e partita
                         singola), comandi, pausa
  scenes/partita.js      prima della partita: quanti siete, scelta dei personaggi,
                         modalità
  scenes/flusso.js       introduzione ("TOCCA A...!"), risultato del turno, classifica
                         del round e generale, finale (a due, oppure il podio)
  microgames/
    MicrogiocoBase.js    interfaccia comune (timer, pausa, fine, punteggio)
    index.js             registro dei microgiochi
    SpinaScene.js  ReGrorioScene.js  BarbaScene.js
    PaninoScene.js  ManiScene.js  SegoScene.js
    RondaScene.js  BlackjackScene.js  PalleggiScene.js  PassaseoScene.js
    BotaScene.js  GuidaScene.js  PiovraScene.js  ScapoliScene.js
    RetromarciaScene.js
```

Le coordinate di gioco sono in unità logiche su uno schermo 480x270; il disegno
vero avviene a `RES` volte (4 = 1920x1080 sul computer, 3 = 1440x810 sul telefono). Per aggiungere un'immagine a grandezza naturale
si usa `im(scene, x, y, chiave)` di `fx.js`.

## Personaggi

Per ritoccare un personaggio basta cambiare i suoi parametri in cima a
`js/grafica/personaggi.js`. Oltre a colori e forma del viso (`faccia`) ci sono:

- `stile` dei capelli: `ricci` (Passaseo), `ricciMedi` (Riccardo: gli stessi riccioli ma
  più raccolti), `indietroLungo` (Giorgio: all'indietro, ai lati fino al lobo),
  `spuntato` (il Petri: corti, tirati su a punte), `indietro`, `corto`, `ciuffo`, `grigio`, `rasato` (Marsupino),
  `stempiato` (Guerra), `spettinato` (Sego), `ricciCorti` (il Generale, l'Ingiocabile),
  `lunghiBagnati` (lo Zio); per le ragazze della disco `lunghi`, `caschetto`, `ricciLunghi`,
  `coda`, `chignon`; con `rasato`, `rasatoScuro: true` fa vedere la rasatura (il Bota);
  `mossi` (il Manna: corti e spettinati, con le ciocche sulla fronte); `taglio` (le ragazze
  del Manna, con `taglio`: `lisci`, `ricci`, `caschetto`, `coda`, `chignon`)
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
  di Emilio è 0.72: è il più basso di tutti
- `corporatura` (1 = normale, 1.2 = robusta) e `pancia` (quanto sporge il pancione:
  Marsupino ha 1.36 e 10), `muscoli: true` per il fisico da palestrato (il Bota: spalle
  larghe, vita stretta, pettorali, addominali e bicipiti), `labbra`, `sopraDritte`,
  `sopraDavanti` (sopracciglia sopra la frangia), `sguardo` (lo strabismo di Beppe)
- `vestito.tipo`: `tshirt`, `giacca` (con `sotto` = colore della maglietta, se no
  camicia a quadretti), `cardigan` (il vestito da nonno di Guerra: lana a coste coi
  bottoni grossi, con `camicia`, `quadretti` e `bottoni`), `piumino` (con `camicia` a
  righe e `catenina`), `mimetica`,
  `croupier` (gilet con `manica` e `papillon`), `scout` (con `fazzoletto` a righe),
  `camicia` (Giorgio vestito da sera), `felpa` (col cappuccio abbassato: il Petri),
  `abito` (il vestito a bretelline delle ragazze: con `pantaloni` del colore della pelle),
  `vestitino` (il vestito delle ragazze del Manna), `canottiera` (il Manna: con `catenina`,
  `cintura` e `fibbia`), `chiodo` (il giubbotto di pelle di Emilio: `sotto` = colore della
  maglietta, `borchie` = colore delle borchie),
  `costume` (a torso nudo: il costume da bagno è `pantaloni`, con `fantasia` = colori
  dei fiorellini);
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
disegnati in `js/grafica/vialetto.js`.

Le due discoteche non si pestano i piedi: Petri Tentacolari usa `RAGAZZE`, lo sfondo
`bgDisco` e la musica `disco`; L'Incubo degli Scapoli usa `TIPE`, lo sfondo `bgPista` e la
musica `pista`.

Le icone dell'app (`icone/`) sono Riccardo e Giorgio felici sui raggi arancioni del menu,
disegnati con lo stesso codice dei personaggi: se cambia un personaggio, vanno rifatte.

Scorciatoia per le prove: `index.html?prova=barba` (o `spina`, `regrorio`,
`panino`, `mani`, `sego`, `ronda`, `blackjack`, `palleggi`, `passaseo`, `bota`, `guida`,
`piovra`, `scapoli`, `retromarcia`) apre subito quel microgioco, in allenamento, col
primo personaggio dell'ultima partita; con `&chi=` lo si prova con un altro, per esempio
`index.html?prova=scapoli&chi=manna` (che è anche il modo più svelto di vedere un
"contro se stesso").

## Aggiungere un personaggio giocabile

I personaggi che si possono scegliere sono quelli dell'elenco `personaggiGiocabili` in
`js/config.js` (oggi tredici). Per renderne giocabile uno che c'è già tra i
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

La griglia ha cinque colonne e posto per tre righe (quattordici personaggi più "A
CASO"): se ne servono di più va rimpicciolita la cella (`CELLA` in
`js/scenes/partita.js`). Ognuno ha un personaggio diverso, quindi non si può essere
più dei personaggi giocabili: `maxGiocatori` va tenuto entro quel numero.

## Aggiungere un microgioco

1. Crea `js/microgames/MioGiocoScene.js`:

```js
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { im, txt } from '../fx.js';

export class MioGiocoScene extends MicrogiocoBase {
  constructor() { super('miogioco'); }      // id usato in config.js

  prepara() {                                // sfondo, sprite, input
    this.punti = 0;
  }

  aggiorna(dt, p) {                          // dt = secondi, p = avanzamento 0..1
    // this.cfg = la tua sezione di config.js, this.giocatore = chi gioca
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
3. Aggiungi in `js/config.js` la sezione `microgiochi.miogioco` con:
   - `titolo`, `durata` (secondi), `colore` (sfondo dell'introduzione)
   - `ospite: { id, etichetta }`: il personaggio mostrato nell'introduzione
     (es. `{ id: 'sego', etichetta: 'OBIETTIVO:\nSEGO' }`); facoltativo `cast: [id, ...]`,
     gli altri personaggi della storia: chi sceglie l'ospite o uno del cast lì
     gioca "contro se stesso"
   - `comandi`: righe per tastiera e mouse; `comandiTouch`: le stesse righe per
     chi gioca col dito (saranno mostrate sul telefono)
   - `obiettivo` e tutti i parametri di difficoltà del tuo gioco
   - facoltativo: `musica`, il nome di una traccia di `audio.js` (se no `gioco`; Petri
     Tentacolari usa `disco`)
   
   e inserisci `'miogioco'` in `ordineSfida` se deve entrare nella sfida.

Partita singola, schermata comandi (a pagine), introduzione, turni per tutti i
giocatori, risultati e classifiche lo prendono da soli.

Pausa e audio a schermo sul telefono li mette già `MicrogiocoBase`. Per il resto:
- `eTouch()` e `perDito(testoTastiera, testoDito)` di `fx.js` per scegliere testi e
  comandi; `comandiTouch` in `config.js` per l'introduzione e la schermata Comandi
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
