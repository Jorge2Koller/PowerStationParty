# Prepara "Provini a X-Factor" a partire dalle canzoni vere: per ogni canzone di strumenti/canzoni.py i
# due ritagli audio (con ffmpeg) e la mappa delle note per ogni livello (con librosa, dai battiti e dagli
# attacchi della canzone). Si rilancia se cambia una canzone (o i suoi tagli, in canzoni.py); il gioco
# legge solo i file che scrive, nel sito (<id> è quello della canzone in canzoni.py):
#   PowerStation Party - sito/audio/<id>.mp3            il ritaglio da 35 s
#   PowerStation Party - sito/audio/<id>-lampo.mp3      il ritaglio da 15 s (Lampo)
#   PowerStation Party - sito/js/config/microgiochi/xfactor-<id>.json   battiti, atti, voci e note
# Le canzoni intere non vanno su GitHub (sono dei cantanti: nel sito vanno solo i ritagli): stanno in
# canzoni/ nella radice del repository, che è nel .gitignore.
# Le canzoni "fisse" (fissa: True in canzoni.py, come Stare Up) si saltano: i loro ritagli sono
# quelli del sito e non si rifanno.
#
# Uso, dalla cartella del repository (la prima volta: py -m venv strumenti\.venv e poi
# strumenti\.venv\Scripts\python -m pip install librosa soundfile; serve anche ffmpeg):
#   strumenti\.venv\Scripts\python strumenti\beatmap.py              tutte le canzoni (tranne le fisse)
#   strumenti\.venv\Scripts\python strumenti\beatmap.py stare-bene   solo quella (o quelle: più id)
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import librosa

from canzoni import CANZONI

QUI = Path(__file__).resolve().parent
RADICE = QUI.parent
SITO = RADICE / 'PowerStation Party - sito'

# La canzone su cui si lavora: le mette prepara(), da canzoni.py, prima di ogni canzone.
CANZONE = None      # la canzone intera
TITOLO = ''
BPM_CIRCA = 128     # il tempo da cui librosa parte a cercare i battiti
RITAGLI = {}        # nome -> (da, a, file): i ritagli, in secondi nella canzone (si spostano sul battito più vicino)
ATTI = []           # dove cominciano i tre atti, nella canzone: la strofa, il pezzo forte, il gran finale
# Chi canta, e quando, nella canzone (secondi; i confini si spostano sul battito più vicino): 'oli',
# 'tini', 'insieme' (solo se l'abbiamo sentito a orecchio) o 'nessuno' (non si scrive). Bastano i pezzi
# dentro i ritagli: la mappa ne ha l'elenco per ogni ritaglio ("voci"), per la scena.
VOCI = []
CANTANTI = ('oli', 'tini', 'insieme')
BATTUTA = None      # (facoltativo) un primo battito di battuta, in secondi della canzone
BITRATE = '112k'           # mono: circa 0,5 MB il ritaglio intero
DISSOLVENZA = 0.3          # secondi, in entrata e in uscita
PRIMA_NOTA = 1.3           # secondi: prima nessuna nota (le note devono avere il tempo di scendere)
FINALE = 2.6               # secondi alla fine del ritaglio intero: l'esplosione di note

# quanto è fitta ogni mappa: per atto, ogni quanti battiti c'è una nota sicura (sui battiti forti),
# la soglia (quantile) degli attacchi in più che entrano, la distanza minima tra due note, quante
# note lunghe e se ci sono le note doppie (due pad insieme) nel finale
LIVELLI = {
    'facile':    {'ogni': [2, 2, 2], 'attacchi': [None, None, None], 'stacco': 0.85, 'lunghe': 2, 'doppie': False},
    'normale':   {'ogni': [2, 1, 1], 'attacchi': [0.75, 0.5, 0.4], 'stacco': 0.225, 'lunghe': 3, 'doppie': False},
    'difficile': {'ogni': [1, 1, 1], 'attacchi': [0.55, 0.4, 0.3], 'stacco': 0.11, 'lunghe': 5, 'doppie': True},
}


def analizza():
    y, sr = librosa.load(str(CANZONE), sr=22050, mono=True)
    hop = 256
    _, beats = librosa.beat.beat_track(y=y, sr=sr, units='time', start_bpm=BPM_CIRCA, tightness=200)
    # i battiti trovati, con i buchi riempiti e i doppioni tolti (così si contano giusti)
    T = float(np.median(np.diff(beats)))
    pulita = [float(beats[0])]
    for t in beats[1:]:
        g = t - pulita[-1]
        if g < 0.5 * T:
            continue
        for k in range(1, int(round(g / T))):
            pulita.append(pulita[-1] + g / round(g / T))
        pulita.append(float(t))
    pulita = np.array(pulita)
    # La canzone va a tempo fisso (gli attacchi cadono al millisecondo su una griglia a 128 bpm, per
    # tutta la canzone): la griglia è regolare, t0 + k*T dall'inizio alla fine, con T dalla retta che
    # passa meglio per i battiti trovati (tolti quelli fuori posto). (Prima T era la mediana degli
    # stacchi tra i battiti, che vanno a passi di un frame dell'analisi, 23 ms: veniva 20 frame =
    # 0,4644 s, cioè 129,2 bpm invece di 128, e i mezzi battiti delle note in più scivolavano fuori
    # tempo; e i battiti erano proprio quelli trovati, che nel pezzo filtrato, 45-60 s, ballano fino
    # a 60 ms). La retta si fa sui battiti vicino ai ritagli (da 20 s prima a 20 s dopo): se in un
    # pezzo della canzone librosa prende il controtempo (in Stare Up i primi 30 s, quasi 0,2 s fuori),
    # su tutta la canzone esce un filo storta, e nei ritagli i battiti scivolavano di 30-60 ms
    lo = min(da for da, _, _ in RITAGLI.values()) - 20
    hi = max(a for _, a, _ in RITAGLI.values()) + 20
    k = np.arange(len(pulita))
    buoni = (pulita >= lo) & (pulita <= hi)
    for _ in range(3):
        T, t0 = np.polyfit(k[buoni], pulita[buoni], 1)
        scarto = pulita - (t0 + T * k)
        buoni &= np.abs(scarto) < 2.5 * scarto[buoni].std()
    # Poi la griglia si rifinisce sugli attacchi: tra i tempi vicini a quello della retta (più o meno
    # 1,5%) e tutte le fasi, quella su cui l'inviluppo degli attacchi (a 3 ms) è più forte, vicino ai
    # ritagli. Serve quando librosa in un tratto prende il controtempo dei piatti (mezzo battito fuori):
    # in Fuori Dagli Schemi la retta dava 90,09 bpm, e la canzone va a 89,00 fissi
    lo, hi = max(0.5, lo), min(len(y) / sr - 0.5, hi)
    fine = librosa.onset.onset_strength(y=y, sr=sr, hop_length=64)
    fps = sr / 64
    def sui_colpi(T_, t0_):
        tt = t0_ + T_ * np.arange(int(np.ceil((lo - t0_) / T_)), int((hi - t0_) / T_))
        return float(fine[(tt * fps).astype(int)].mean())
    _, T, t0 = max((sui_colpi(T_, f), T_, f) for T_ in np.linspace(T * 0.985, T * 1.015, 151) for f in np.arange(0, T_, 0.004))
    # t0 sull'attacco vero: i battiti di librosa cadono circa 40 ms dopo (l'inviluppo degli attacchi
    # guarda finestre di 93 ms). L'attacco è dove il suono ripiegato sul battito (il massimo di |y|
    # ogni millisecondo, in media sui battiti vicino ai ritagli) sale più di colpo, da 100 ms prima a 20 ms dopo
    passo = sr // 1000
    picchi = np.abs(y[:len(y) // passo * passo]).reshape(-1, passo).max(axis=1)
    centri = t0 + T * np.arange(int(np.ceil((max(1, lo) - t0) / T)), int((min(len(y) / sr - 1, hi) - t0) / T))
    fasi = np.arange(-100, 21)
    piega = [picchi[((centri + f / 1000) * sr / passo).astype(int)].mean() for f in fasi]
    anticipo = -int(fasi[int(np.argmax(np.diff(piega))) + 1])
    t0 -= anticipo / 1000
    griglia = t0 + T * np.arange(int(np.ceil(-t0 / T)), int((len(y) / sr - t0) / T) + 1)
    # il battito forte della battuta (in 4): quello scritto in canzoni.py ("battuta"), se c'è; se no
    # quello con più bassi, nel pezzo forte (con la cassa forte sull'1 e sul 3, a volte prende il 3)
    S = np.abs(librosa.stft(y, hop_length=hop))
    freqs = librosa.fft_frequencies(sr=sr)
    if BATTUTA is not None:
        fase = int(np.argmin(np.abs(griglia - BATTUTA))) % 4
    else:
        basse = S[freqs < 150].sum(axis=0)
        fr = np.clip(librosa.time_to_frames(griglia, sr=sr, hop_length=hop), 0, S.shape[1] - 1)
        nel = (griglia >= ATTI[1]) & (griglia < ATTI[1] + 23)
        fase = int(np.argmax([basse[fr[nel & (np.arange(len(griglia)) % 4 == f)]].mean() for f in range(4)]))
    # gli attacchi, con la loro forza; il "colore" del suono (centroide spettrale) per scegliere il pad
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    on = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, hop_length=hop, units='frames', backtrack=False)
    attacchi = librosa.frames_to_time(on, sr=sr, hop_length=hop)
    forza = oenv[on]
    centroide = librosa.feature.spectral_centroid(S=S, sr=sr)[0]
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    return dict(sr=sr, hop=hop, T=float(T), griglia=griglia, fase=fase, anticipo=anticipo, attacchi=attacchi, forza=forza, centroide=centroide, rms=rms, oenv=oenv)


def vicino(griglia, t):
    return float(griglia[int(np.argmin(np.abs(griglia - t)))])


def voci(G, da, a):
    # chi canta nel ritaglio [da, a]: i pezzi di VOCI, in secondi del ritaglio, coi confini sul
    # battito più vicino e tagliati ai bordi del ritaglio ('nessuna' non si scrive)
    out = []
    for v0, v1, voce in VOCI:
        x0, x1 = max(da, vicino(G, v0)), min(a, vicino(G, v1))
        if voce in CANTANTI and x1 - x0 > 1e-6:
            out.append({'da': round(x0 - da, 3), 'a': round(x1 - da, 3), 'cantante': voce})
    return out


def colore(A, t):
    # il centroide medio intorno a t (+-40 ms): basso = suono grave, alto = acuto
    f = librosa.time_to_frames([t - 0.04, t + 0.04], sr=A['sr'], hop_length=A['hop'])
    return float(A['centroide'][max(0, f[0]):max(f[0] + 1, f[1])].mean())


def mappa(A, da, a, liv, intero):
    P = LIVELLI[liv]
    G = A['griglia']
    atti = [x for x in ATTI]
    def atto(t):
        return 2 if t >= atti[2] else 1 if t >= atti[1] else 0
    cand = []   # (tempo nella canzone, priorità)
    # le note sicure: sui battiti (forti, se ogni = 2)
    for i, t in enumerate(G):
        if t < da + PRIMA_NOTA or t > a - 0.25:
            continue
        k = P['ogni'][atto(t)]
        if k == 2 and (i - A['fase']) % 2 != 0:
            continue
        cand.append((float(t), 2 + (1 if (i - A['fase']) % 4 == 0 else 0)))
    # gli attacchi in più: i più forti (sopra il quantile dell'atto), sul mezzo battito più vicino
    for at in range(3):
        q = P['attacchi'][at]
        if q is None:
            continue
        lo, hi = max(da + PRIMA_NOTA, [da, atti[1], atti[2]][at]), min(a - 0.25, [atti[1], atti[2], a][at])
        m = (A['attacchi'] >= lo) & (A['attacchi'] < hi)
        if not m.any():
            continue
        soglia = np.quantile(A['forza'][m], q)
        passo = A['T'] / (4 if liv == 'difficile' and at == 2 else 2)
        for t, f in zip(A['attacchi'][m], A['forza'][m]):
            if f >= soglia:
                g = G[0] + round((t - G[0]) / passo) * passo
                cand.append((float(g), 1))
    # l'esplosione del finale (solo nel ritaglio intero): mezzi battiti (quarti a difficile)
    if intero and liv != 'facile':
        passo = A['T'] / (4 if liv == 'difficile' else 2)
        t = G[np.searchsorted(G, a - FINALE)]
        while t < a - 0.2:
            cand.append((float(t), 1))
            t += passo
    # le note lunghe: sulle frasi tenute (vedi tenute()), la nota lunga parte sul battito e dura
    # 3 battiti; a facile e normale durante la tenuta non arrivano altre note
    lunghe = tenute(A, da, a)[:P['lunghe'] if intero else (P['lunghe'] + 1) // 2]   # (nel Lampo, la metà)
    for t, d in lunghe:
        cand.append((t, 9))
    # in ordine, senza doppioni, rispettando la distanza minima (vince la priorità più alta)
    cand.sort()
    note = []
    for t, p in cand:
        if note and t - note[-1][0] < P['stacco'] - 1e-6:
            if p > note[-1][1]:
                note[-1] = (t, p)
            continue
        note.append((t, p))
    durata = {}
    for t, d in lunghe:
        k = min(range(len(note)), key=lambda q: abs(note[q][0] - t))
        durata[k] = round(d, 3)
    if liv != 'difficile':
        via = set()
        for k, d in durata.items():
            via |= {q for q in range(len(note)) if note[k][0] < note[q][0] < note[k][0] + d + 0.2}
        note = [n for q, n in enumerate(note) if q not in via]
        durata = {sum(1 for q in range(k) if q not in via): d for k, d in durata.items()}
    # il pad: dal colore del suono (quantili, così i pad sono usati tutti), poi qualche correzione
    col = np.array([colore(A, t) for t, _ in note])
    qs = np.quantile(col, [0.25, 0.5, 0.75]) if len(col) > 4 else [0, 0, 0]
    pad = [int(np.searchsorted(qs, c)) for c in col]
    occupato = {}   # pad -> fino a quando lo tiene una nota lunga
    for j in range(len(note)):
        t = note[j][0]
        veloce = j > 0 and t - note[j - 1][0] < 0.3
        # niente tre volte di fila lo stesso pad quando le note sono fitte
        if veloce and j > 1 and pad[j] == pad[j - 1] == pad[j - 2]:
            pad[j] = pad[j] + 1 if pad[j] < 3 else pad[j] - 1
        # a facile e normale, sulle note fitte, al massimo due pad di salto
        if veloce and liv != 'difficile' and abs(pad[j] - pad[j - 1]) > 2:
            pad[j] = pad[j - 1] + (2 if pad[j] > pad[j - 1] else -2)
        # un pad tenuto da una nota lunga non prende altre note
        liberi = [k for k in range(4) if occupato.get(k, -1) <= t]
        if pad[j] not in liberi:
            pad[j] = min(liberi, key=lambda k: abs(k - pad[j]))
        if j in durata:
            occupato[pad[j]] = t + durata[j] + 0.15
    out = []
    for j, (t, p) in enumerate(note):
        out.append([round(t - da, 3), pad[j], durata.get(j, 0)])
        # le doppie (due pad insieme), a difficile: sui battiti forti del gran finale
        if P['doppie'] and atto(t) == 2 and p >= 3 and j not in durata:
            altro = 3 - pad[j] if 3 - pad[j] != pad[j] else (pad[j] + 2) % 4
            if occupato.get(altro, -1) <= t:
                out.append([round(t - da, 3), altro, 0])
    return out


def tenute(A, da, a):
    # Le frasi tenute del ritaglio: dai battiti dove, nei 3 battiti dopo, gli attacchi sono deboli ma il
    # volume resta alto (una voce o un accordo che tiene). In ordine di "tenuta" (più nel finale,
    # meglio), almeno 3 secondi l'una dall'altra; ognuna (tempo nella canzone, durata della nota)
    G, T = A['griglia'], A['T']
    m = (librosa.time_to_frames([da], sr=A['sr'], hop_length=A['hop'])[0], librosa.time_to_frames([a], sr=A['sr'], hop_length=A['hop'])[0])
    on_med, rms_med = float(np.median(A['oenv'][m[0]:m[1]])), float(np.median(A['rms'][m[0]:m[1]]))
    prove = []
    for t in G:
        if t < da + PRIMA_NOTA + 1 or t + 3 * T > a - 0.6:
            continue
        f = librosa.time_to_frames([t + 0.12, t + 3 * T], sr=A['sr'], hop_length=A['hop'])
        ons = float(A['oenv'][f[0]:f[1]].mean()) / on_med
        vol = float(A['rms'][f[0]:f[1]].mean()) / rms_med
        fase = 2 if t >= ATTI[2] else 1 if t >= ATTI[1] else 0
        prove.append((vol - ons + 0.25 * fase, float(t)))
    scelte = []
    for _, t in sorted(prove, reverse=True):
        if all(abs(t - u) >= 3 for u, _ in scelte):
            scelte.append((t, 3 * T - 0.12))
    return scelte


def ritaglia(da, a, dest):
    durata = a - da
    filtro = f'afade=t=in:st=0:d={DISSOLVENZA},afade=t=out:st={durata - DISSOLVENZA:.3f}:d={DISSOLVENZA}'
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{da:.3f}', '-t', f'{durata:.3f}', '-i', str(CANZONE), '-vn', '-map_metadata', '-1',
                    '-ac', '1', '-ar', '44100', '-af', filtro, '-c:a', 'libmp3lame', '-b:a', BITRATE, str(dest)], check=True)
    return dest.stat().st_size


def prepara(c):
    # la canzone su cui si lavora, da canzoni.py
    global CANZONE, TITOLO, BPM_CIRCA, RITAGLI, ATTI, VOCI, BATTUTA
    CANZONE = RADICE / c['intera']
    TITOLO = c['titolo']
    BPM_CIRCA = c['bpm']
    RITAGLI = {nome: (da, a, f'audio/{c["id"]}{"" if nome == "intero" else "-" + nome}.mp3') for nome, (da, a) in c['ritagli'].items()}
    ATTI = list(c['atti'])
    VOCI = list(c['voci'])
    BATTUTA = c.get('battuta')


def fai(c):
    global ATTI
    prepara(c)
    if not CANZONE.is_file():
        print(f'{TITOLO}: manca la canzone intera, {CANZONE.relative_to(RADICE)} (non è nel repository: va messa lì)')
        return False
    A = analizza()
    G = A['griglia']
    print(f'{TITOLO}: {60 / A["T"]:.2f} bpm, battito {A["T"]:.4f} s, battito forte in fase {A["fase"]}, '
          f'griglia {A["anticipo"]} ms prima dei battiti di librosa (un battito a {vicino(G, 30):.3f} s)')
    ATTI = [vicino(G, t) for t in ATTI]
    dati = {'canzone': TITOLO, 'bpm': round(60 / A['T'], 3), 'battito': round(A['T'], 5), 'ritagli': {}}
    for nome, (da0, a0, file) in RITAGLI.items():
        da, a = vicino(G, da0), vicino(G, a0)
        intero = nome == 'intero'
        dim = ritaglia(da, a, SITO / file)
        nel = [(i, t) for i, t in enumerate(G) if da - 1e-6 <= t < a]
        r = {
            'file': file, 'da': round(da, 3), 'a': round(a, 3), 'durata': round(a - da, 3),
            # inizio degli atti dentro il ritaglio (null = l'atto non c'è: il Lampo parte dal pezzo forte)
            'atti': [round(t - da, 3) if da - 1e-6 <= t < a else None for t in ATTI],
            # i battiti del ritaglio (per far cantare i cantanti a tempo) e quali sono forti (il primo della battuta)
            'battiti': [round(t - da, 3) for _, t in nel],
            'forti': [1 if (i - A['fase']) % 4 == 0 else 0 for i, _ in nel],
            # chi canta, e quando: [{da, a, cantante}], cantante = 'oli', 'tini' o 'insieme'
            'voci': voci(G, da, a),
            'mappe': {liv: mappa(A, da, a, liv, intero) for liv in LIVELLI},
        }
        if r['atti'][0] is None and r['atti'][1] is not None and r['atti'][1] > 0.5:
            r['atti'][1] = 0.0
        dati['ritagli'][nome] = r
        print(f'  {nome}: {da:.3f}-{a:.3f} s ({a - da:.3f} s), atti {r["atti"]}, {file} {dim / 1024:.0f} KB')
        print('    voci     ', ', '.join(f'{v["cantante"]} {v["da"]}-{v["a"]}' for v in r['voci']))
    dest = SITO / 'js' / 'config' / 'microgiochi' / f'xfactor-{c["id"]}.json'
    dest.write_text(json.dumps(dati, ensure_ascii=False, separators=(',', ':')), encoding='utf-8', newline='\n')
    print(f'  mappa: {dest.relative_to(RADICE)} ({dest.stat().st_size / 1024:.0f} KB)')
    # le note come in Guitar Hero (scheda di valutazione): le rifà strumenti/griglia.py, sopra i
    # battiti, gli atti e i ritagli appena scritti (quelle di mappa() qui sopra si buttano)
    subprocess.run([sys.executable, str(QUI / 'griglia.py'), c['id']], check=True)
    return True


def main():
    chieste = sys.argv[1:]
    sconosciute = [x for x in chieste if x not in {c['id'] for c in CANZONI}]
    if sconosciute:
        sys.exit(f'Canzoni che non ci sono in strumenti/canzoni.py: {", ".join(sconosciute)} (ci sono: {", ".join(c["id"] for c in CANZONI)})')
    ok = True
    for c in CANZONI:
        if chieste and c['id'] not in chieste:
            continue
        if c.get('fissa'):
            print(f'{c["titolo"]}: fissa, non si rifà (i suoi ritagli sono quelli del sito; per rifarla togli "fissa" in canzoni.py)')
            continue
        ok = fai(c) and ok
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
