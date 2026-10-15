# Prove automatiche

Non fanno parte del gioco: questa cartella non va caricata sul sito.

## Lanciarle

Doppio clic su `test/fumo.command` (Mac), oppure dal Terminale, nella cartella del gioco:

```bash
./test/fumo.command
```

La prima volta prepara da solo l'ambiente (Python + Playwright + Chromium, in `test/.venv`):
ci vuole qualche minuto e serve internet. Il gioco lo apre da solo su un piccolo server
interno: non serve avviare `server.py`.

Opzioni (dal Terminale):

- `./test/fumo.command --solo spina,bota`: solo quei microgiochi
- `./test/fumo.command --senza-sfide`: solo i microgiochi, senza le sfide dal menu al podio
- `./test/fumo.command --webkit`: anche con WebKit, il motore di Safari (solo computer)
- `./test/fumo.command --fermo`: in più gioca ogni microgioco per intero senza toccare
  niente, per vedere quanti punti fa chi sta fermo (lento)
- `./test/fumo.command --schermo 1920x1080`: la finestra del computer più grande (di solito 1280x720)
- `./test/fumo.command --solo-impostazioni`, `--solo-sfide`, `--solo-seme`, `--solo-fermo`: solo
  quella parte delle prove

## Cosa controllano

1. Ogni microgioco aperto con `index.html?prova=<id>`: qualche secondo di tasti, clic,
   trascinamenti (o tocchi) a caso, poi lo si fa finire: deve arrivare alla schermata dei
   risultati senza errori nella console.
2. Una sfida rapida da 3 microgiochi dal menu al finale, in 2 e in 4 giocatori (col podio).
3. Impostazioni e salvataggio (cambiare, ricaricare, esportare, azzerare, importare), il gioco
   senza salvataggio (navigazione privata), le medaglie e i punti sfida.
4. Solo da computer: il Bancone (compra e mette un costume, compra un tema), il Profilo, i
   livelli (configurazione e schermata), e ogni modalità dal menu fino alla fine: Da solo,
   Lampo in 3, Torneo in 4, Squadre in 4, Sfida del giorno (partite accorciate).
5. Tutto due volte: finestra da computer (1280x720, tastiera e mouse) e telefono in
   orizzontale (844x390, col dito).

Alla fine: `N/N prove superate`. Gli screenshot (durante il gioco, risultati, podio) e
l'elenco degli esiti (`esito.txt`) sono in `test/screenshot/`.

## Altri strumenti

- `test/.venv/bin/python test/bot.py <id> [partite] [--modo bravo|fermo|caso] [--dito] [--seme N] [--schermo 1920x1080]`:
  un giocatore automatico gioca il microgioco per intero e stampa i punti (per tarare le medaglie).
  Il bravo c'è per tutti e 19 (sego, barba e bota coi gesti veri: col mouse, o con --dito col
  dito); "fermo" non tocca niente e "caso" preme tasti e clicca (o tocca) a caso.
  Fermo e a caso non devono mai prendere il bronzo. Con `--piano bravo:2,caso:2,fermo:1` gioca
  più partite di fila nella stessa pagina (semi 101, 102, 201...), e dopo ogni partita stampa anche
  lo "stato" (i campi numerici della scena): servono a provare altri valori dei punti senza
  rigiocare. Per ogni partita dice se la condizione del microgioco e la medaglia vanno d'accordo.
- `test/.venv/bin/python test/prestazioni.py [--cpu 4] [--solo id,id]`: ogni microgioco come su
  un telefono, con la CPU rallentata, misurando i fotogrammi al secondo; più la memoria delle
  texture e di JavaScript. I numeri dipendono dal computer (e da cosa sta facendo intanto).

- `test/fotografia_config.py <file.json>`: salva tutto l'oggetto `CONFIG` in un file, per
  controllare che un riordino della configurazione non abbia cambiato nessun valore.
