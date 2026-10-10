# PowerStation Party

Microgiochi in stile WarioWare con Phaser 3. Riccardo contro Giorgio: stesso
microgioco, un turno a testa, vince il round chi fa più punti.

I microgiochi sono undici:

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
permettono solo su https.

Su iPhone l'audio parte al primo tocco e rispetta l'interruttore del silenzioso:
se non si sente niente, controlla che il telefono non sia in modalità silenziosa.

### Risoluzione

Sul computer il gioco si disegna a 1920x1080 (`RES = 4`); su telefoni e tablet a
1440x810 (`RES = 3`): metà dei pixel e metà della memoria per le texture, che su
iPhone hanno un tetto e sui telefoni economici pesano. Sullo schermo di un telefono
resta nitido. Per provare: `index.html?res=2` (o 3, 4) forza la risoluzione,
`index.html?touch=1` mostra dal computer i testi e i pulsanti del telefono.

## Modalità

- **Sfida completa**: tutti e 10 i microgiochi. Ogni round lo giocano entrambi,
  uno dopo l'altro; chi comincia si alterna a ogni round e il secondo vede a
  schermo il punteggio da battere. Vince chi fa più **punti in totale** (a parità
  di punti, chi ha vinto più round).
- **Sfida al meglio di 3** e **al meglio di 5**: microgiochi pescati a caso, vince
  chi ne vince prima 2 (o 3). Un round pari non conta e se ne gioca un altro;
  se i microgiochi finissero prima, decidono i punti.
- **Partita singola**: un solo microgioco, in sfida a due oppure in allenamento
  da soli (SINISTRA/DESTRA per scegliere, o col dito le frecce < e >). I
  microgiochi sono su due colonne: SU/GIÙ scorrono la prima e poi la seconda.

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
  config.js              titolo, nomi, durate, difficoltà, frasi di sfottò
  compat.js              aggiunte per i browser più vecchi (Safari)
  dispositivo.js         computer o telefono? (eTouch, ?touch=1)
  main.js                avvio di Phaser, scene, audio, telefono in verticale e in sottofondo
  vendor/phaser.min.js   Phaser 3.80.1
  sessione.js            stato della partita (turni, punteggi, classifica)
  audio.js               effetti 8-bit e musica (Web Audio API)
  sprites.js             crea tutte le texture all'avvio
  fx.js                  inquadratura, testi, immagini, stelline, fumo, menu,
                         pulsanti a schermo, eTouch/perDito, vibrazione
  grafica/               tutta la grafica, vettoriale e disegnata via codice
    base.js              strumenti di disegno, risoluzione (RES)
    personaggi.js        i tredici personaggi: tratti, espressioni, vestiti
    marco.js             primo piano per la barba: maschere, zone delicate
    bota.js              il Bota sdraiato visto dall'alto (davanti e dietro), dove
                         c'è pelle, la spiaggia col telo, sole, tubetto, mano,
                         gabbiano, onda
    oggetti.js           Golf di ReGrorio, pinte, spina, clienti, attrezzi del
                         barbiere, panino e ingredienti, mani di Guerra, piatti,
                         finestre con le persiane, fumogeni, ombrelloni,
                         cannone e bagnarole dei pirati, carte e fiches,
                         pallone, Panda, ciclisti scout, trattore e Vespa
    sfondi.js            pub, strada, barberia, bar, sala da pranzo e tavola,
                         cortile con la villetta di Franci, spiaggia, casinò e
                         tavolo verde, prato toscano, strada tra vigne e grano
  scenes/menu.js         boot, menu, partita singola, comandi, pausa
  scenes/flusso.js       introduzione, risultato, classifica finale
  microgames/
    MicrogiocoBase.js    interfaccia comune (timer, pausa, fine, punteggio)
    index.js             registro dei microgiochi
    SpinaScene.js  ReGrorioScene.js  BarbaScene.js
    PaninoScene.js  ManiScene.js  SegoScene.js
    RondaScene.js  BlackjackScene.js  PalleggiScene.js  PassaseoScene.js
    BotaScene.js
```

Le coordinate di gioco sono in unità logiche su uno schermo 480x270; il disegno
vero avviene a `RES` volte (4 = 1920x1080 sul computer, 3 = 1440x810 sul telefono). Per aggiungere un'immagine a grandezza naturale
si usa `im(scene, x, y, chiave)` di `fx.js`.

## Personaggi

Per ritoccare un personaggio basta cambiare i suoi parametri in cima a
`js/grafica/personaggi.js`. Oltre a colori e forma del viso (`faccia`) ci sono:

- `stile` dei capelli: `ricci` (Passaseo), `ricciMedi` (Riccardo: gli stessi riccioli ma
  più raccolti), `indietro`, `corto`, `ciuffo`, `grigio`, `rasato` (Marsupino),
  `stempiato` (Guerra), `spettinato` (Sego), `ricciCorti` (il Generale, l'Ingiocabile),
  `lunghiBagnati` (lo Zio); con `rasato`, `rasatoScuro: true` fa vedere la rasatura (il Bota)
- `barba`: `nessuna`, `accenno`, `ispida`, `pizzetto`, `pizzettoBaffi`, `piena`, `folta`, `corta`
- `occhiali: { montatura, lenti, tartaruga? }` sul viso (a Marsupino scivolano sul
  naso quando si spaventa), oppure con `inMaglietta: true` appesi alla maglietta;
  con `tondi: true` occhiali tondi (Passaseo), con `inFronte: true` tirati su sulla
  fronte (il Bota)
- `cappello: { tipo: 'basco', colore, stemma }` (il Generale)
- `corporatura` (1 = normale, 1.2 = robusta) e `pancia` (quanto sporge il pancione:
  Marsupino ha 1.36 e 10), `muscoli: true` per il fisico da palestrato (il Bota: spalle
  larghe, vita stretta, pettorali, addominali e bicipiti), `labbra`, `sopraDritte`,
  `sopraDavanti` (sopracciglia sopra la frangia), `sguardo` (lo strabismo di Beppe)
- `vestito.tipo`: `tshirt`, `giacca` (con `sotto` = colore della maglietta, se no
  camicia a quadretti), `cardigan` (il vestito da nonno di Guerra: lana a coste coi
  bottoni grossi, con `camicia`, `quadretti` e `bottoni`), `piumino` (con `camicia` a
  righe e `catenina`), `mimetica`,
  `croupier` (gilet con `manica` e `papillon`), `scout` (con `fazzoletto` a righe),
  `costume` (a torso nudo: il costume da bagno è `pantaloni`, con `fantasia` = colori
  dei fiorellini);
  `corti: true` per i pantaloncini, `calzettoni` per i calzettoni, `infradito: true`
  per i piedi nudi nelle infradito

Ogni personaggio ha 5 espressioni: `normale`, `felice`, `triste`, `shock`,
`sufficienza` (texture `id_espressione`, es. `sego_felice`). In più, create in
`js/sprites.js` solo per chi le usa: `marsupino_rabbia` (furioso) e le pose del
palleggio `id_calcio1D`, `id_calcio2D` (gamba destra a metà e in alto; `S` per la
sinistra) per i due giocatori e per lo Zio; `bota_abbronzato` (occhiolino e pollice
in su) e `bota_aragosta` (rosso a chiazze col segno degli occhiali) per il finale di
"Spalma il Bota!".

Scorciatoia per le prove: `index.html?prova=barba` (o `spina`, `regrorio`,
`panino`, `mani`, `sego`, `ronda`, `blackjack`, `palleggi`, `passaseo`, `bota`) apre
subito quel microgioco.

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
     (es. `{ id: 'sego', etichetta: 'OBIETTIVO:\nSEGO' }`)
   - `comandi`: righe per tastiera e mouse; `comandiTouch`: le stesse righe per
     chi gioca col dito (saranno mostrate sul telefono)
   - `obiettivo` e tutti i parametri di difficoltà del tuo gioco
   
   e inserisci `'miogioco'` in `ordineSfida` se deve entrare nella sfida.

Partita singola, schermata comandi (a pagine), introduzione, turni, risultati e
classifica lo prendono da soli.

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
