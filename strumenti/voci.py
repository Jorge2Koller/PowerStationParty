# Chi canta in una canzone: l'Oli, il Tini o nessuno, riconosciuto DALLA VOCE e non dalla base.
#
# Prima si isola la voce dalla base (Demucs, modello htdemucs): sulla canzone intera un riconoscimento
# confonderebbe chi canta con com'è fatta la base (in Cambiare Aria il Tini entra proprio quando parte il
# ritornello: guardando la base sembra funzionare lì, e sulle altre canzoni sbaglia).
# Poi la voce isolata si taglia in finestre (1,6 secondi, una ogni 0,4) e per ognuna si guarda se c'è
# qualcuno che canta (la voce suona ed è intonata) e com'è la voce: l'"impronta" della voce
# (embedding di Resemblyzer, che riconosce chi parla) e l'altezza media (le note cantate, con pyin).
#
# I campioni vengono dai tratti CONFERMATI A ORECCHIO (qui sotto), uno per voce e per canzone, e ogni
# finestra va a chi ha il campione più simile. Le due voci si somigliano parecchio, e la stessa voce
# cambia molto da un pezzo all'altro (l'Oli tra 170 e 260 Hz, il Tini da 130 a 415, secondo la canzone).
# Dentro la stessa canzone si separano bene; tra canzoni diverse, alla stessa altezza, molto meno: coi
# campioni delle altre canzoni metà dell'Oli di Non ti resisto (207 Hz) è "non sicuro" e un quinto
# risulta il Tini. (All'inizio sembrava ancora peggio, ma era colpa di un campione sbagliato: in Cambiare
# Aria c'era l'Oli fino a 10,8 s e poi il Tini, invece l'Oli canta fino al gran finale.) Per questo:
#   - una canzone che ha in CONFERMATI un pezzo sicuro di tutti e due si riconosce coi SUOI campioni;
#   - una canzone nuova, senza, coi campioni delle altre: è solo una prima idea, e lo script lo dice.
#     Si sente a orecchio un pezzo di ognuno, lo si mette in CONFERMATI, si rifanno i campioni e si
#     rilancia: il resto della canzone lo trova lui.
# Dove le due voci si somigliano quasi uguale è "non sicuro".
#
# Uso, dalla cartella del repository (la prima volta: strumenti\.venv\Scripts\python -m pip install
# librosa soundfile torch torchaudio demucs webrtcvad-wheels, e poi resemblyzer --no-deps; serve anche
# ffmpeg):
#   strumenti\.venv\Scripts\python strumenti\voci.py campioni
#       rifà i campioni dai tratti confermati e li mette alla prova: dentro ogni canzone, campioni da metà
#       dei suoi tratti confermati e riconoscimento sull'altra metà (se sbaglia troppo: "NON
#       AFFIDABILE"); e, per sapere, tra canzoni diverse (ogni canzone coi campioni delle altre)
#   strumenti\.venv\Scripts\python strumenti\voci.py [--senza-audio] canzoni\stare-up.mp3 [altre...]
#       la scaletta di chi canta, a blocchi, e in strumenti/verifica/ un pezzo da ascoltare per ogni
#       blocco (es. stare-up_0m32-0m48_tini.mp3), per controllarla a orecchio (con --senza-audio niente
#       pezzi: si controlla sulla canzone, coi minuti della scaletta)
# La voce isolata di ogni canzone resta in strumenti/verifica/voce-isolata/ (si ascolta anche quella,
# e la seconda volta non si rifà). strumenti/verifica/ non va su GitHub (è nel .gitignore).
import subprocess
import sys
from pathlib import Path

import numpy as np
import librosa
import soundfile as sf

QUI = Path(__file__).resolve().parent
RADICE = QUI.parent
SITO = RADICE / 'PowerStation Party - sito'
CANZONI = RADICE / 'canzoni'
VERIFICA = QUI / 'verifica'
ISOLATE = VERIFICA / 'voce-isolata'
CAMPIONI = QUI / 'voci-campioni.npz'
VOCI = ('oli', 'tini')

# I tratti confermati a orecchio: (da, a, chi), in secondi del file, lontano dai cambi di voce (le
# finestre che non stanno tutte dentro un tratto non si usano).
CONFERMATI = [
    # il ritaglio di Cambiare Aria: l'Oli fino al gran finale (26,25 s), il Tini da lì alla fine (prima
    # qui c'era l'Oli fino a 10,8 s: era sbagliato, e i campioni sbagliati confondevano tutto). Il 20
    # ottobre la canzone è uscita dal gioco e il ritaglio dal sito: i suoi campioni restano quelli
    # salvati in voci-campioni.npz
    (SITO / 'audio' / 'cambiare-aria.mp3', [(0, 25.8, 'oli'), (26.7, 35.2, 'tini')]),
    # l'Oli sulla voce bassa, poco prima dell'1:00 e verso l'1:30 (un po' più larga di come l'aveva
    # trovata il riconoscimento); il resto è il Tini
    (CANZONI / 'stare-up.mp3', [(56, 73, 'oli'), (89.6, 94, 'oli'), (10, 54, 'tini'), (76, 88, 'tini'), (100, 146, 'tini')]),
    # la voce alta: il Tini nella parte finale ("il Tini inizia ad esserci nella parte finale") e
    # anche a metà, da 1:17 a 1:31 ("sì è il Tini"). La voce media, a 207 Hz, è l'Oli (1:40-2:14:
    # "è Oli"; e 0:46-0:57, la stessa voce, prima del finale): lì il riconoscimento coi campioni delle
    # altre canzoni diceva il Tini
    (CANZONI / 'non-ti-resisto.mp3', [(46, 57, 'oli'), (101, 133.5, 'oli'), (78, 91.4, 'tini'), (146, 172, 'tini')]),
    # la parte finale: l'Oli fino a 2:05, poi il Tini nell'ultimo ritornello (il riconoscimento diceva
    # "non sicuro"; Riccardo: "è il Tini", prima "da 2:06", poi "da 2:05")
    (CANZONI / 'stare-bene.mp3', [(112.5, 124.6, 'oli'), (125.6, 146.0, 'tini')]),
    # l'Oli da 1:27 a 1:43 (anche 1:32-1:38, la voce più alta: "è Oli"), poi il Tini ("da 1:43 parte il
    # Tini") e il suo ritornello
    (CANZONI / 'fuori-dagli-schemi.mp3', [(87, 102.6, 'oli'), (103.4, 108, 'tini'), (112, 121.5, 'tini')]),
]

SR = 16000                 # Resemblyzer lavora a 16 kHz
FINESTRA = 1.6             # secondi (quanto guarda Resemblyzer per volta)
PASSO = 0.4                # secondi tra una finestra e l'altra
CANTA_INTONATA = 0.35      # una finestra "canta" se almeno così tanta voce è intonata...
CANTA_VOLUME = -32         # ...e la voce isolata non è sotto questi dB rispetto ai suoi momenti forti
# quanto conta l'altezza della voce rispetto all'impronta: poco, ed è la distanza dal campione più
# vicino (che è già quello del registro giusto). Con 0 le finestre in bilico vanno a caso; con 0,6 il
# Tini che nel ritornello di Cambiare Aria scende a 130-155 Hz diventava l'Oli. (La voce isolata
# dell'Oli, sul pezzo ovattato di Cambiare Aria, non è filtrata: arriva sopra gli 11 kHz come quella
# del Tini, quindi l'impronta non sta riconoscendo il filtro della base.)
PESO_ALTEZZA = 0.15
INCERTO = 0.04             # sotto questa differenza tra le due voci: "non sicuro"
LISCIO = 2.0               # secondi: la differenza tra le due voci si media su questo tratto
BLOCCO_MINIMO = 2.0        # secondi: i pezzi più corti si uniscono a quelli vicini
BLOCCO_MASSIMO = 8.0       # secondi: i blocchi più lunghi si dividono (a orecchio si controllano meglio)
BLOCCO_PROVA = 4.0         # secondi: nella prova dentro una canzone, campioni da un blocco sì e uno no


# ---------- la voce isolata ----------
def separa(file):
    """La voce isolata della canzone (mono, 44,1 kHz), con Demucs htdemucs (si salva e si riusa)."""
    ISOLATE.mkdir(parents=True, exist_ok=True)
    dest = ISOLATE / (Path(file).stem + '.wav')
    if dest.is_file():
        y, sr = sf.read(str(dest), dtype='float32')
        return y, sr
    import torch
    from demucs.pretrained import get_model
    from demucs.apply import apply_model
    modello = get_model('htdemucs')
    modello.eval()
    y, sr = librosa.load(str(file), sr=modello.samplerate, mono=False)
    if y.ndim == 1:
        y = np.stack([y, y])
    wav = torch.tensor(y, dtype=torch.float32)
    rif = wav.mean(0)
    media, dev = rif.mean(), rif.std() + 1e-8
    with torch.no_grad():
        out = apply_model(modello, ((wav - media) / dev)[None], device='cpu', shifts=1, split=True, overlap=0.25, progress=False)[0]
    out = out * dev + media
    voce = out[modello.sources.index('vocals')].mean(0).numpy().astype(np.float32)
    sf.write(str(dest), voce, sr)
    return voce, sr


# ---------- le finestre ----------
def analizza(voce, sr):
    """Per ogni finestra: il centro (s), se canta, l'impronta della voce, l'altezza media (Hz)."""
    from resemblyzer import VoiceEncoder
    y = librosa.resample(voce, orig_sr=sr, target_sr=SR) if sr != SR else voce
    y = y / (np.sqrt(np.mean(y ** 2)) + 1e-8) * 0.05          # volume uguale per tutte le canzoni
    # l'intonazione e il volume, a fotogrammi di 32 ms
    hop = 512
    f0, intonata, _ = librosa.pyin(y, fmin=70, fmax=700, sr=SR, frame_length=2048, hop_length=hop)
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
    db = 20 * np.log10(rms + 1e-9)
    forte = np.percentile(db, 95)
    tf = librosa.frames_to_time(np.arange(len(rms)), sr=SR, hop_length=hop)
    # l'impronta: Resemblyzer, a pezzi di 1,6 s, PASSO secondi l'uno dall'altro
    enc = VoiceEncoder('cpu', verbose=False)
    _, impronte, pezzi = enc.embed_utterance(y.astype(np.float32), return_partials=True, rate=1 / PASSO, min_coverage=0.5)
    out = []
    for e, s in zip(impronte, pezzi):
        t0, t1 = s.start / SR, min(len(y), s.stop) / SR
        m = (tf >= t0) & (tf < t1)
        if not m.any():
            continue
        quota = float(np.mean(intonata[m]))
        vol = float(np.percentile(db[m], 75) - forte)
        note = f0[m][intonata[m]]
        altezza = float(np.median(note)) if len(note) >= 5 else np.nan
        canta = quota >= CANTA_INTONATA and vol >= CANTA_VOLUME and not np.isnan(altezza)
        out.append({'t': (t0 + t1) / 2, 'da': t0, 'a': t1, 'canta': canta, 'impronta': e / np.linalg.norm(e), 'altezza': altezza})
    return out


def finestre_di(file):
    voce, sr = separa(file)
    return analizza(voce, sr)


# ---------- i campioni e il riconoscimento ----------
def nei_tratti(F, tratti):
    """Le finestre cantate che stanno tutte dentro un tratto confermato, con la voce di quel tratto."""
    return [(f, chi) for f in F if f['canta'] for da, a, chi in tratti if f['da'] >= da and f['a'] <= a]


def campione(finestre, chi, canzone):
    E = np.array([f['impronta'] for f in finestre])
    c = E.mean(0)
    return {'chi': chi, 'canzone': canzone, 'impronta': c / np.linalg.norm(c),
            'altezza': float(np.median([f['altezza'] for f in finestre])), 'n': len(finestre)}


def campioni_da(F_per_canzone):
    C = []
    for canzone, (F, tratti) in F_per_canzone.items():
        dentro = nei_tratti(F, tratti)
        for chi in VOCI:
            W = [f for f, c in dentro if c == chi]
            if W:
                C.append(campione(W, chi, canzone))
    return C


def da_usare(C, nome):
    """I campioni per riconoscere la canzone `nome`: i suoi, se ne ha di tutti e due; se no quelli delle
    altre canzoni (e allora è solo una prima idea: vedi in cima)."""
    suoi = [c for c in C if c['canzone'] == nome]
    if {c['chi'] for c in suoi} == set(VOCI):
        return suoi, True
    return [c for c in C if c['canzone'] != nome], False


def punteggi(f, C):
    """Quanto la finestra somiglia a ognuna delle due voci (più alto = più simile): col campione più
    vicino di quella voce."""
    s = {}
    for c in C:
        vicino = float(np.dot(f['impronta'], c['impronta']))
        nota = abs(np.log2(f['altezza'] / c['altezza']))          # in ottave
        s[c['chi']] = max(s.get(c['chi'], -9.0), vicino - PESO_ALTEZZA * min(1.0, nota))
    return s


def differenza(f, C):
    """Quanto la finestra somiglia più all'Oli che al Tini (positiva = l'Oli)."""
    s = punteggi(f, C)
    return s['oli'] - s['tini']


def chi(f, C):
    if not f['canta']:
        return 'nessuno', 0.0
    d = differenza(f, C)
    return ('oli' if d >= INCERTO else 'tini' if d <= -INCERTO else 'non sicuro'), d


def leggi_campioni():
    d = np.load(CAMPIONI)
    return [{'chi': str(c), 'canzone': str(k), 'impronta': e, 'altezza': float(a)}
            for c, k, e, a in zip(d['chi'], d['canzone'], d['impronte'], d['altezze'])]


def conta(W, C, vero):
    e = [chi(f, C)[0] for f in W]
    g, n = e.count(vero), e.count('non sicuro')
    return g, len(e) - g - n, n


def fai_campioni():
    # (i campioni di una canzone il cui file non c'è più, come il ritaglio di Cambiare Aria tolto dal
    # sito, restano quelli già salvati in voci-campioni.npz: non si perdono)
    salvati = leggi_campioni() if CAMPIONI.is_file() else []
    tutte, tenuti = {}, []
    for file, tratti in CONFERMATI:
        if not Path(file).is_file():
            vecchi = [c for c in salvati if c['canzone'] == Path(file).stem]
            print(f'  manca {Path(file).relative_to(RADICE)}: ' + (f'restano i suoi campioni salvati ({len(vecchi)})' if vecchi else 'i suoi tratti non si usano'))
            tenuti += vecchi
            continue
        tutte[Path(file).stem] = (finestre_di(file), tratti)
    C = campioni_da(tutte) + tenuti
    for c in C:
        print(f'  {c["chi"]:4s} da {c["canzone"]}: ' + (f'{c["n"]} finestre, ' if 'n' in c else '(salvato), ') + f'altezza media {c["altezza"]:.0f} Hz')
    np.savez(CAMPIONI, chi=np.array([c['chi'] for c in C]), canzone=np.array([c['canzone'] for c in C]),
             impronte=np.array([c['impronta'] for c in C]), altezze=np.array([c['altezza'] for c in C]))
    print(f'  campioni: {CAMPIONI.relative_to(RADICE)}')
    # 1) la prova che conta, dentro ogni canzone con tutti e due confermati: i tratti confermati a
    # blocchi di BLOCCO_PROVA secondi, campioni dai blocchi pari e riconoscimento sui dispari, e il
    # contrario (conta soprattutto che non dica il nome sbagliato; "non sicuro" vuol dire solo che quel
    # pezzo va sentito a orecchio)
    giusti = sbagliati = tot = 0
    for canzone, (F, tratti) in tutte.items():
        dentro = nei_tratti(F, tratti)
        if {c for _, c in dentro} != set(VOCI):
            continue
        g = s = n = 0
        for parte in (0, 1):
            prendi = [(f, c) for f, c in dentro if int(f['t'] // BLOCCO_PROVA) % 2 == parte]
            prova = [(f, c) for f, c in dentro if int(f['da'] // BLOCCO_PROVA) % 2 != parte and int(f['a'] // BLOCCO_PROVA) % 2 != parte]
            Cp = []
            for v in VOCI:
                W = [f for f, c in prendi if c == v]
                if W:
                    Cp.append(campione(W, v, canzone))
            for v in VOCI:
                a, b, k = conta([f for f, c in prova if c == v], Cp, v)
                g, s, n = g + a, s + b, n + k
        print(f'  prova dentro {canzone}: {g} giuste, {s} sbagliate, {n} non sicure')
        giusti, sbagliati, tot = giusti + g, sbagliati + s, tot + g + s + n
    ok = tot > 0 and giusti / tot >= 0.85 and sbagliati / tot <= 0.03
    print(f'  in tutto {giusti} giuste su {tot} ({100 * giusti / max(1, tot):.0f}%), sbagliate {sbagliati}')
    # 2) per sapere: tra canzoni diverse (ogni canzone coi campioni delle altre). Qui l'Oli e il Tini alla
    # stessa altezza si confondono: per una canzone nuova serve un pezzo sicuro di ognuno
    for canzone, (F, tratti) in tutte.items():
        altre = [c for c in C if c['canzone'] != canzone]
        if {c['chi'] for c in altre} != set(VOCI):
            continue
        righe = []
        for da, a, vero in tratti:
            g, s, n = conta([f for f, _ in nei_tratti(F, [(da, a, vero)])], altre, vero)
            righe.append(f'{mmss(da)}-{mmss(a)} {vero} {g}/{s}/{n}')
        print(f'  (coi campioni delle altre canzoni, giuste/sbagliate/non sicure) {canzone}: ' + ', '.join(righe))
    print('RICONOSCIMENTO ' + ('OK (dentro le canzoni)' if ok else 'NON AFFIDABILE: fermarsi'))
    return ok


# ---------- la scaletta ----------
def mmss(t):
    return f'{int(t // 60)}:{t % 60:04.1f}'


def nome_file(t):
    return f'{int(t // 60)}m{int(t % 60):02d}'


def scaletta(F, C):
    """I blocchi di chi canta. Per ogni finestra la differenza tra le due voci, mediata sulle finestre
    cantate dei LISCIO secondi intorno (così una finestra sola non fa un blocco); da lì l'etichetta:
    l'Oli, il Tini, "non sicuro" se la differenza è piccola, "nessuno" dove non canta quasi nessuno.
    Poi i blocchi di fila uguali, quelli troppo corti assorbiti dai vicini e quelli troppo lunghi
    divisi in pezzi di qualche secondo (da ascoltare si controllano meglio)."""
    t = np.array([f['t'] for f in F])
    canta = np.array([f['canta'] for f in F])
    d = np.array([differenza(f, C) if f['canta'] else 0.0 for f in F])
    etich = []
    for ti in t:
        m = np.abs(t - ti) <= LISCIO / 2
        if canta[m].mean() < 0.4:
            etich.append('nessuno')
            continue
        x = float(d[m & canta].mean())
        etich.append('oli' if x >= INCERTO else 'tini' if x <= -INCERTO else 'non sicuro')
    blocchi = []
    for f, e in zip(F, etich):
        da, a = f['t'] - PASSO / 2, f['t'] + PASSO / 2
        if blocchi and blocchi[-1][2] == e:
            blocchi[-1][1] = a
        else:
            blocchi.append([da, a, e])
    blocchi[0][0] = 0.0
    # i pezzi corti: si uniscono al vicino più lungo (non si fa sparire una voce: diventano "non sicuro"
    # se stanno tra due voci diverse)
    cambiato = True
    while cambiato and len(blocchi) > 1:
        cambiato = False
        for i, (da, a, e) in enumerate(blocchi):
            if a - da >= BLOCCO_MINIMO:
                continue
            vicini = [j for j in (i - 1, i + 1) if 0 <= j < len(blocchi)]
            j = max(vicini, key=lambda j: blocchi[j][1] - blocchi[j][0])
            if e not in ('nessuno', 'non sicuro') and blocchi[j][2] not in ('nessuno', 'non sicuro', e):
                blocchi[i][2] = 'non sicuro'
                if a - da >= BLOCCO_MINIMO / 2:
                    continue
            lo, hi = min(i, j), max(i, j)
            blocchi[lo:hi + 1] = [[blocchi[lo][0], blocchi[hi][1], blocchi[j][2]]]
            cambiato = True
            break
        # i vicini uguali si uniscono
        k = 0
        while k < len(blocchi) - 1:
            if blocchi[k][2] == blocchi[k + 1][2]:
                blocchi[k:k + 2] = [[blocchi[k][0], blocchi[k + 1][1], blocchi[k][2]]]
                cambiato = True
            else:
                k += 1
    # i blocchi lunghi, in pezzi uguali di al massimo BLOCCO_MASSIMO secondi
    divisi = []
    for da, a, e in blocchi:
        n = max(1, int(np.ceil((a - da) / BLOCCO_MASSIMO - 1e-6)))
        divisi += [[da + (a - da) * k / n, da + (a - da) * (k + 1) / n, e] for k in range(n)]
    return divisi


def ritaglia(file, da, a, dest):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{da:.2f}', '-t', f'{a - da:.2f}', '-i', str(file), '-vn', '-ac', '2',
                    '-af', 'afade=t=in:d=0.15,areverse,afade=t=in:d=0.15,areverse', '-c:a', 'libmp3lame', '-b:a', '128k', str(dest)], check=True)


def canzone(file, audio=True):
    file = Path(file)
    nome = file.stem
    C, suoi = da_usare(leggi_campioni(), nome)
    F = finestre_di(file)
    durata = librosa.get_duration(path=str(file))
    blocchi = scaletta(F, C)
    blocchi[-1][1] = durata
    if audio:
        VERIFICA.mkdir(parents=True, exist_ok=True)
        for vecchio in VERIFICA.glob(f'{nome}_*.mp3'):
            vecchio.unlink()
    print(f'== {nome} ({mmss(durata)}), cantate {sum(f["canta"] for f in F)} finestre su {len(F)}')
    print(f'  campioni: {", ".join(sorted({c["chi"] + " da " + c["canzone"] for c in C}))}')
    if not suoi:
        print('  ATTENZIONE: questa canzone non ha in CONFERMATI un pezzo sicuro di tutti e due, e coi campioni\n'
              '  delle altre canzoni l\'Oli e il Tini alla stessa altezza si confondono: è solo una prima idea.\n'
              '  Sentire a orecchio un pezzo di ognuno, metterlo in CONFERMATI, voci.py campioni e rilanciare.')
    for da, a, e in blocchi:
        # da che parte pende il blocco, e quanto: la differenza media tra le due voci nelle finestre
        # cantate (sui tratti confermati, le parti sicure stanno tra 0,05 e 0,25; sotto 0,04 è "non sicuro"),
        # e l'altezza della voce
        dentro = [f for f in F if da <= f['t'] < a and f['canta']]
        m = float(np.mean([differenza(f, C) for f in dentro])) if dentro else 0.0
        pende = f'  (pende {"oli" if m > 0 else "tini"} {abs(m):.2f}, {np.median([f["altezza"] for f in dentro]):.0f} Hz)' if dentro and e != 'nessuno' else ''
        print(f'  {mmss(da):>7} - {mmss(a):>7}  {e}{pende}')
        if audio:
            ritaglia(file, da, a, VERIFICA / f'{nome}_{nome_file(da)}-{nome_file(a)}_{e.replace(" ", "-")}.mp3')
    if audio:
        print(f'  pezzi da ascoltare: {VERIFICA.relative_to(RADICE)}{chr(92)}{nome}_*.mp3')
    return blocchi


def main():
    argomenti = [a for a in sys.argv[1:] if a != '--senza-audio']
    if not argomenti:
        sys.exit('uso: voci.py campioni | voci.py [--senza-audio] canzone.mp3 [...]')
    if argomenti[0] == 'campioni':
        sys.exit(0 if fai_campioni() else 1)
    if not CAMPIONI.is_file():
        sys.exit('Mancano i campioni delle voci: prima  voci.py campioni')
    for f in argomenti:
        canzone(f, audio='--senza-audio' not in sys.argv)


if __name__ == '__main__':
    main()
