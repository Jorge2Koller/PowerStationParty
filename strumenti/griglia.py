# Rifà le note di "Provini a X-Factor" come in Guitar Hero, sopra i battiti, gli atti e la durata che
# ci sono già nella mappa (li scrive strumenti/beatmap.py) e sopra i due ritagli audio del sito.
# Riscrive solo le note ("mappe" di ogni ritaglio): battiti, forti e voci restano come sono, e gli
# atti anche, tranne quelli del Lampo quando beatmap.py ne segna solo uno (vedi atti_lampo()).
# Scheda di valutazione: "rifare come Guitar Hero le note e la griglia". Le regole, per ogni livello:
#   - le note stanno sui colpi che si sentono: prima i battiti (il primo della battuta e i battimani
#     sul 2 e sul 4), poi i mezzi battiti dove c'è un attacco forte (a NORMALE e DIFFICILE ogni tanto
#     un mezzo battito forte passa avanti a un battito debole, come le sincopi delle chitarre), a
#     DIFFICILE anche i sedicesimi più forti del gran finale; quante note per battuta lo decide l'atto
#     (la strofa è più vuota); dove la canzone si ferma (uno stacco, un respiro) non arrivano note
#   - il pad viene dal "colore" del colpo (la cassa a sinistra, i battimani e i piatti a destra,
#     la voce in mezzo): lo stesso suono torna sullo stesso pad, così le frasi che si ripetono hanno
#     le stesse note; poi qualche correzione (niente tre volte lo stesso pad sulle note fitte, salti
#     piccoli a FACILE e NORMALE)
#   - le note lunghe sulle frasi tenute (la voce o il sintetizzatore che restano su mentre gli
#     attacchi calano, meglio se subito dopo la canzone respira); a FACILE e NORMALE durante una nota
#     lunga non arriva altro
#   - gli accordi (due pad insieme) nel gran finale: a NORMALE sul primo battito di ogni battuta,
#     a DIFFICILE anche nel pezzo forte; in fondo, a tutti i livelli, l'accordo lungo e il colpo finale
# Se i battiti della mappa non sono in fase coi colpi che si sentono (quelli di librosa arrivavano
# circa 45 ms dopo, e con la finestra del PERFETTO di 55 ms si sente), lo dice e sposta le note, non
# i battiti: la cosa giusta è rilanciare beatmap.py, che li mette in fase.
# Senza ffmpeg (o senza i ritagli audio) le note si fanno lo stesso, solo dai battiti: il ritmo dal
# posto nella battuta, le note lunghe alla fine delle frasi di quattro battute.
#
# Serve solo Python (nessuna libreria) e ffmpeg, come per beatmap.py, che alla fine lo lancia da solo.
# Uso, dalla cartella del progetto (senza argomenti, la mappa del sito):
#   py strumenti\griglia.py [percorso\della\xfactor-mappa.json]
import array
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

QUI = Path(__file__).resolve().parent
MAPPA = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else QUI.parent / 'PowerStation Party - sito' / 'js' / 'config' / 'microgiochi' / 'xfactor-mappa.json'
SITO = MAPPA.parents[3]     # (la mappa sta in <sito>/js/config/microgiochi/: i file audio sono relativi al sito)

PRIMA_NOTA = 1.3            # secondi: prima nessuna nota (devono avere il tempo di scendere)
ULTIMA = 0.3                # secondi alla fine del ritaglio senza note (la dissolvenza)
# le bande per il "colore" dei colpi (Hz): cassa, basso, voce, voce alta, rullante, piatti
BANDE = [(30, 120), (120, 300), (300, 800), (800, 2000), (2000, 5000), (5000, 12000)]
VOCE = (2, 3)               # le bande della voce (per le frasi tenute)
# un battito è uno stacco (lì niente note) se suona meno di così, rispetto ai battiti intorno
STACCO = 0.72

# Quanto è fitta ogni mappa. Per atto (strofa, pezzo forte, gran finale):
#   battuta = quante note per battuta (4 battiti; con la virgola, una battuta sì e una no in più)
#   passo   = la nota più corta, in battiti (1 = solo battiti, 0.5 = mezzi, 0.25 = sedicesimi)
#   stacco  = la distanza minima tra due note, in battiti
#   accordi = dove ci sono i due pad insieme: None, 'inizio' (il primo battito dell'atto) o 'forti'
#             (il primo battito di ogni battuta)
#   battito = quanto un battito passa avanti a un mezzo battito (più è basso, più sincopi)
#   lunghe  = quante note lunghe nel ritaglio intero (nel Lampo la metà, arrotondata in su)
#   salto   = il salto massimo di pad tra due note vicine
# Le note in tutto restano più o meno quelle di prima (FACILE 34, NORMALE 64, DIFFICILE 108: nella
# scheda la difficoltà era "giusta"); in più ci sono gli accordi.
LIVELLI = {
    'facile': {
        'battuta': [2, 2, 3], 'passo': [1, 1, 1], 'stacco': [2, 2, 1],
        'accordi': [None, None, None], 'battito': 0.7, 'lunghe': 2, 'salto': 2,
    },
    'normale': {
        'battuta': [3.5, 4, 4.5], 'passo': [0.5, 0.5, 0.5], 'stacco': [1, 0.5, 0.5],
        'accordi': [None, 'inizio', 'forti'], 'battito': 0.4, 'lunghe': 3, 'salto': 2,
    },
    'difficile': {
        'battuta': [5, 5.5, 7], 'passo': [0.5, 0.5, 0.25], 'stacco': [0.5, 0.5, 0.25],
        'accordi': [None, 'forti', 'forti'], 'battito': 0.3, 'lunghe': 5, 'salto': 3,
    },
}


# ---------- l'audio ----------
def inviluppo(file, lo, hi):
    # quanto suona una banda, millesimo per millesimo (lo fa ffmpeg: filtro, valore assoluto, media)
    filtro = f'highpass=f={lo},highpass=f={lo},lowpass=f={hi},lowpass=f={hi},aeval=exprs=abs(val(0)),lowpass=f=80,aresample=1000'
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(file), '-ac', '1', '-af', filtro, '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    a = array.array('f')
    a.frombytes(out[:len(out) // 4 * 4])
    return a


def ascolta(R):
    # gli inviluppi delle bande del ritaglio, o None se non si può (niente ffmpeg o niente file)
    file = SITO / R.get('file', '')
    if not shutil.which('ffmpeg') or not file.is_file():
        print(f'  (senza {"ffmpeg" if not shutil.which("ffmpeg") else file.name}: le note vengono solo dai battiti)')
        return None
    return [inviluppo(file, lo, hi) for lo, hi in BANDE]


def attacco(e, n):
    # quanto sale il suono al millesimo n (il logaritmo di dopo / prima): 0 se non sale
    if n < 30 or n + 20 > len(e):
        return 0.0
    dopo = sum(e[n:n + 15]) / 15
    prima = sum(e[n - 25:n - 5]) / 20
    return max(0.0, math.log((dopo + 1e-6) / (prima + 1e-6)))


def volume(e, t0, t1):
    a, b = max(0, int(t0 * 1000)), min(len(e), int(t1 * 1000))
    return sum(e[a:b]) / max(1, b - a)


def quantile(v, q):
    s = sorted(v)
    return s[min(len(s) - 1, max(0, int(q * (len(s) - 1))))] if s else 0.0


def ritardo(env, battiti):
    # di quanto i battiti della mappa sono in ritardo sui colpi che si sentono (secondi, a 5 ms)
    B = battiti[1:-1]
    stime = []
    for e in env:
        prof = [(sum(attacco(e, int(round(b * 1000)) + d) for b in B), d) for d in range(-100, 101, 5)]
        stime.append(max(prof)[1])
    stime.sort()
    return stime[len(stime) // 2] / 1000


def stacchi(R, env, sposta):
    # i battiti in cui la canzone si ferma (uno stacco, un respiro): suonano molto meno dei battiti
    # intorno (8 prima e 8 dopo). Senza audio, nessuno
    if env is None:
        return set()
    B = R['battiti']
    med = [volume(e, 0, R['durata']) or 1 for e in env]
    vol = [sum(volume(e, B[i] + sposta, B[i + 1] + sposta) / m for e, m in zip(env, med)) / len(env) for i in range(len(B) - 1)]
    return {i for i, v in enumerate(vol) if v < STACCO * quantile(vol[max(0, i - 8):i + 9], 0.5)}


# ---------- la griglia ----------
def caselle(R, sposta):
    # tutti i posti dove può cadere una nota: ogni sedicesimo di ogni battito (i, q), col suo tempo
    B, F = R['battiti'], R['forti']
    fase = F.index(1) if 1 in F else 0
    out = []
    for i in range(len(B)):
        T = (B[i + 1] - B[i]) if i + 1 < len(B) else (B[i] - B[i - 1])
        for q in range(4):
            out.append({'i': i, 'q': q, 't': B[i] + sposta + q * T / 4, 'battuta': (i - fase) // 4, 'nella': (i - fase) % 4})
    return out


def atto_di(R, t):
    a = 0
    for k, da in enumerate(R['atti']):
        if da is not None and t >= da - 0.06:
            a = k
    return a


def analizza(R, env, sposta):
    # per ogni casella: la forza dei colpi (bande normalizzate), il colore (0 = grave, 1 = acuto)
    C = caselle(R, sposta)
    if env is None:
        # senza audio: dal posto nella battuta (la cassa sull'1 e sul 3, i battimani sul 2 e sul 4,
        # i mezzi battiti più deboli), con un po' di varietà perché i pad non vengano tutti uguali
        for c in C:
            if c['q'] == 0:
                c['forza'], c['colore'] = (1.0, 0.15) if c['nella'] == 0 else (0.75, 0.2) if c['nella'] == 2 else (0.85, 0.85)
            else:
                c['forza'], c['colore'] = (0.35, 0.5) if c['q'] == 2 else (0.12, 0.6)
            c['colore'] += 0.12 * math.sin(c['i'] * 2.3 + c['q'] * 1.1 + c['battuta'] % 2)
        return C
    forze = [[max(attacco(e, int(round(c['t'] * 1000)) + d) for d in (-10, -5, 0, 5, 10)) for e in env] for c in C]
    norm = [quantile([f[k] for f in forze], 0.9) or 1 for k in range(len(env))]
    for c, f in zip(C, forze):
        f = [x / n for x, n in zip(f, norm)]
        tot = sum(f)
        c['forza'] = tot / len(f)
        c['colore'] = (sum(k * x for k, x in enumerate(f)) / tot / (len(f) - 1)) if tot > 0 else 0.5
    return C


def tenute(R, env, C, intero, ferme):
    # Le frasi tenute: le caselle (battiti e mezzi battiti) con un bell'attacco dopo le quali, per due
    # battiti, la voce resta forte ma non attacca più (una nota tenuta); meglio se poco dopo la
    # canzone respira (la frase finisce lì). Ognuna col suo punteggio.
    T = (R['battiti'][-1] - R['battiti'][0]) / (len(R['battiti']) - 1)
    fine = R['durata'] - ULTIMA - (5 * T if intero else 3 * T)
    adatte = [c for c in C if not c['q'] % 2 and PRIMA_NOTA + 0.8 <= c['t'] <= fine and c['i'] not in ferme]
    if env is None:
        # senza audio: alla fine delle frasi (il primo battito dell'ultima battuta di ogni quattro)
        return {id(c): (1.0 if c['nella'] == 0 else 0.6) for c in adatte if c['q'] == 0 and c['nella'] in (0, 2) and c['battuta'] % 4 == 3}
    voce = [env[k] for k in VOCE]
    vol_med = [volume(e, 0, R['durata']) for e in voce]
    campioni = range(200, len(voce[0]) - 200, 37)
    att_med = [sum(attacco(e, m) for m in campioni) / max(1, len(campioni)) or 1 for e in voce]
    prove = {}
    for c in adatte:
        if c['forza'] < 0.25:
            continue
        t0, t1 = c['t'] + 0.12, c['t'] + 2 * T
        dentro = range(int(t0 * 1000), int(t1 * 1000), 11)
        vol = sum(volume(e, t0, t1) / v for e, v in zip(voce, vol_med)) / len(voce)
        att = sum(sum(attacco(e, m) for m in dentro) / max(1, len(dentro)) / a for e, a in zip(voce, att_med)) / len(voce)
        respiro = 0.3 if any(c['i'] + k in ferme for k in (1, 2, 3)) else 0
        prove[id(c)] = vol - att + 0.3 * c['forza'] + (0.2 if c['q'] == 0 else 0) + respiro
    return prove


def nuova(c, **altro):
    return {'t': c['t'], 'colore': c['colore'], 'forza': c['forza'], 'i': c['i'], 'q': c['q'], 'nella': c['nella'], 'pad': [], 'dur': 0, **altro}


def mappa(R, C, env, liv, intero, ferme):
    P = LIVELLI[liv]
    B = R['battiti']
    T = (B[-1] - B[0]) / (len(B) - 1)
    fine = R['durata'] - ULTIMA
    # (negli stacchi niente note: la canzone si ferma, chi suona respira)
    ok = [c for c in C if PRIMA_NOTA <= c['t'] <= fine - 0.1 and c['i'] not in ferme]
    for c in ok:
        c['atto'] = atto_di(R, c['t'])
    # 1) il ritmo: i posti più forti di tutto il ritaglio, uno alla volta (i battiti valgono di più,
    # il primo della battuta più di tutti), finché ogni battuta ha le sue note, rispettando la nota
    # più corta e lo stacco dell'atto (così il primo battito passa sempre avanti agli altri; un mezzo
    # battito con un attacco molto più forte passa avanti a un battito debole: la sincope)
    def punti(c):
        return c['forza'] + (P['battito'] if c['q'] == 0 else 0) + (1.5 if c['q'] == 0 and c['nella'] == 0 else 0) - (0.35 if c['q'] % 2 else 0)
    quota = {}
    for c in ok:
        k = P['battuta'][atto_di(R, c['t'] + T) if c['nella'] == 0 and c['q'] == 0 else c['atto']]
        quota.setdefault(c['battuta'], int(k) + (1 if (k % 1) and c['battuta'] % 2 else 0))
    prese, tempi = {}, []
    for c in sorted(ok, key=lambda c: -punti(c)):
        passo, stacco = P['passo'][c['atto']], P['stacco'][c['atto']] * T - 0.02
        if (c['q'] / 4) % passo > 1e-6 or prese.get(c['battuta'], 0) >= quota[c['battuta']]:
            continue
        if any(abs(c['t'] - u) < stacco for u in tempi):
            continue
        prese[c['battuta']] = prese.get(c['battuta'], 0) + 1
        tempi.append(c['t'])
        c['presa'] = True
    scelte = [c for c in ok if c.pop('presa', False)]
    note = [nuova(c) for c in scelte]

    # 2) le note lunghe: sulle frasi tenute (vedi tenute()), sparse negli atti (prima il gran finale,
    # poi il pezzo forte, poi la strofa, e di nuovo), almeno 3,5 secondi l'una dall'altra; se lì non
    # c'è una nota, si aggiunge. Durano 3 battiti (meno, se dopo arriva una nota: vedi in fondo)
    quante = P['lunghe'] if intero else (P['lunghe'] + 1) // 2
    prove = tenute(R, env, C, intero, ferme)
    per_atto = {}
    for c in sorted((c for c in ok if id(c) in prove and (c['q'] / 4) % P['passo'][c['atto']] < 1e-6), key=lambda c: -prove[id(c)]):
        per_atto.setdefault(c['atto'], []).append(c)
    lunghe = []
    giro = [a for a in (2, 1, 0) if a in per_atto]
    while len(lunghe) < quante and any(per_atto.get(a) for a in giro):
        for a in giro:
            while per_atto.get(a):
                c = per_atto[a].pop(0)
                if all(abs(c['t'] - u['t']) >= 3.5 for u in lunghe):
                    lunghe.append(c)
                    break
            if len(lunghe) >= quante:
                break
    for c in lunghe:
        stacco = P['stacco'][c['atto']] * T - 0.02
        note = [m for m in note if abs(m['t'] - c['t']) >= stacco]
        n = nuova(c, dur=3 * T - 0.12)
        note.append(n)
        note.sort(key=lambda m: m['t'])
        if liv != 'difficile':
            # (niente altre note durante la tenuta)
            note = [m for m in note if not (n['t'] < m['t'] < n['t'] + n['dur'] + 0.2)]
    if note:
        qs = [quantile([n['colore'] for n in note], q) for q in (0.25, 0.5, 0.75)]
        fase = R['forti'].index(1) if 1 in R['forti'] else 0
        for n in note:
            n['base'] = sum(1 for q in qs if n['colore'] > q)
            # una frase (due battute) sì e una no i pad si scambiano a coppie (0 con 1, 2 con 3): la
            # cassa resta a sinistra e i battimani a destra, ma la mano si sposta, come quando cambia
            # l'accordo (sennò ogni battuta comincerebbe uguale)
            if (n['i'] - fase) // 8 % 2:
                n['base'] ^= 1

    # 3) gli accordi: nel gran finale (e a DIFFICILE anche nel pezzo forte) sui primi battiti
    for n in note:
        a = atto_di(R, n['t'])
        modo = P['accordi'][a]
        primo = R['atti'][a] is not None and abs(n['t'] - R['atti'][a]) < 0.06
        n['accordo'] = n['dur'] == 0 and n['q'] == 0 and ((modo == 'forti' and n['nella'] == 0) or (modo == 'inizio' and primo))

    # 4) il finale: l'accordo lungo sull'ultimo primo battito con tre battiti dopo, poi (nel ritaglio
    # intero, se c'è posto) il colpo finale. Prima dell'accordo lungo, un respiro di un battito
    forti = [c for c in ok if c['q'] == 0 and c['nella'] == 0 and c['t'] + 2 * T <= fine]
    if forti:
        ultimo = forti[-1] if not intero else next((c for c in reversed(forti) if c['t'] + 4 * T <= fine), forti[-1])
        dur = min(3 * T, fine - ultimo['t']) - 0.12
        colpo = next((c for c in ok if c['q'] == 0 and c['nella'] == 0 and c['t'] >= ultimo['t'] + 3.5 * T), None) if intero else None
        note = [m for m in note if m['t'] < ultimo['t'] - T + 0.02]
        note.append({'t': ultimo['t'], 'colore': ultimo['colore'], 'forza': 9, 'i': ultimo['i'], 'q': 0, 'nella': 0, 'pad': [], 'dur': dur, 'accordo': True, 'base': 1, 'finale': True})
        if colpo:
            note.append({'t': colpo['t'], 'colore': colpo['colore'], 'forza': 9, 'i': colpo['i'], 'q': 0, 'nella': 0, 'pad': [], 'dur': 0, 'accordo': True, 'base': 2, 'finale': True})

    # 5) i pad, nota per nota: dal colore, a quarti (così i quattro pad si usano tutti), poi le
    # regole: niente tre volte lo stesso pad a meno di un battito l'una dall'altra, salti piccoli, un
    # pad tenuto da una nota lunga non prende altro; gli accordi in coppie che cambiano
    occupato = {}       # pad -> fino a quando lo tiene una nota lunga
    prima = []          # i pad delle note prima (l'ultima in fondo)
    ultimo_accordo = None
    t_prima = -9
    for n in note:
        t = n['t']
        liberi = [k for k in range(4) if occupato.get(k, -1) <= t]
        veloce = t - t_prima < 0.3
        vicina = t - t_prima < 0.5       # (entro un battito)
        if n.get('accordo'):
            b = min(n['base'], 2)
            if n.get('finale'):
                coppie = [[0, 3], [1, 2]] if liv != 'facile' else [[1, 2], [0, 2]]
            elif liv == 'difficile':
                coppie = [[b, b + 1], [max(0, b - 1), max(0, b - 1) + 2], [0, 2], [1, 3]]
            else:
                coppie = [[b, b + 1], [max(0, b - 1), max(0, b - 1) + 1], [1, 2], [2, 3], [0, 1]]
            coppie = [c for c in coppie if all(k in liberi for k in c)]
            scelta = next((c for c in coppie if c != ultimo_accordo), coppie[0] if coppie else None)
            if scelta:
                n['pad'] = scelta
                ultimo_accordo = scelta
                prima.append(scelta[0])
                t_prima = t
                for k in scelta:
                    if n['dur']:
                        occupato[k] = t + n['dur'] + 0.15
                continue
        p = n['base']
        if prima:
            ul = prima[-1]
            if vicina and len(prima) > 1 and p == ul == prima[-2]:
                p = p + 1 if p < 3 else p - 1
            salto = P['salto'] if veloce or liv == 'facile' else 3
            if abs(p - ul) > salto:
                p = ul + (salto if p > ul else -salto)
        if p not in liberi:
            p = min(liberi, key=lambda k: (abs(k - p), k)) if liberi else p
        n['pad'] = [p]
        if n['dur']:
            occupato[p] = t + n['dur'] + 0.15
        prima.append(p)
        t_prima = t

    # le note lunghe finiscono un attimo prima della nota dopo (dello stesso pad, a DIFFICILE)
    for j, n in enumerate(note):
        if not n['dur']:
            continue
        dopo = [m['t'] for m in note[j + 1:] if m['t'] > n['t'] + 0.01 and (liv != 'difficile' or set(m['pad']) & set(n['pad']))]
        if dopo:
            n['dur'] = min(n['dur'], dopo[0] - n['t'] - (0.3 if liv == 'facile' else 0.22))
        if n['dur'] < 1.2 * T:
            n['dur'] = 0
    out = []
    for n in note:
        for p in n['pad']:
            out.append([round(n['t'], 3), p, round(n['dur'], 3)])
    out.sort()
    return out


def atti_lampo(dati):
    # Gli atti dei ritagli più corti (il Lampo), da quelli del ritaglio intero: beatmap.py dà al Lampo
    # solo gli atti che cominciano dentro (e il primo lo fa partire da 0 come pezzo forte), che andava
    # bene quando il Lampo era tutto nel pezzo forte. Ora il Lampo parte nella strofa dell'Oli (fino a
    # 7 s) e poi c'è la strofa del Tini: con [null, 0, null] era tutto "IL PEZZO FORTE!". Qui l'atto in
    # corso all'inizio del ritaglio comincia a 0 e gli altri dove cominciano nella canzone (nel Lampo
    # di adesso: la strofa da 0, il pezzo forte da 7,5 s, niente gran finale). Serve il ritaglio intero
    # con tutti e tre gli atti; se no, gli atti restano come sono.
    I = dati['ritagli'].get('intero')
    if not I or any(a is None for a in I.get('atti', [None])) or 'da' not in I:
        return
    nella = [I['da'] + a for a in I['atti']]           # dove cominciano gli atti, nella canzone
    for nome, R in dati['ritagli'].items():
        if nome == 'intero' or 'da' not in R:
            continue
        da, a = R['da'], R['da'] + R['durata']
        in_corso = max((k for k, t in enumerate(nella) if t <= da + 0.06), default=0)
        atti = [0.0 if k == in_corso else round(t - da, 3) if da + 0.06 < t < a - 1 else None for k, t in enumerate(nella)]
        if atti != R['atti']:
            print(f'{nome}: atti {R["atti"]} -> {atti} (dagli atti del ritaglio intero)')
            R['atti'] = atti


def main():
    dati = json.loads(MAPPA.read_text(encoding='utf-8'))
    print(f'{dati.get("canzone", "?")}: le note di {MAPPA.name}')
    atti_lampo(dati)
    for nome, R in dati['ritagli'].items():
        print(f'{nome}: {R["durata"]} s, atti {R["atti"]}')
        env = ascolta(R)
        # i battiti in fase coi colpi che si sentono? (se no si spostano le note: vedi in cima)
        sposta = ritardo(env, R['battiti']) if env else 0.0
        if abs(sposta) < 0.01:
            sposta = 0.0
        else:
            print(f'  ATTENZIONE: i battiti della mappa sono {sposta * 1000:+.0f} ms fuori fase coi colpi: le note si spostano (meglio rilanciare beatmap.py)')
        ferme = stacchi(R, env, sposta)
        if ferme:
            print(f'  stacchi (niente note) ai battiti delle {", ".join(f"{R["battiti"][i]:.2f}" for i in sorted(ferme))} s')
        intero = nome == 'intero'
        C = analizza(R, env, sposta)
        R['mappe'] = {liv: mappa(R, C, env, liv, intero, ferme) for liv in LIVELLI}
        for liv, m in R['mappe'].items():
            atti = [a for a in R['atti'] if a is not None]
            per = [sum(1 for n in m if a0 <= n[0] < a1) for a0, a1 in zip(atti, atti[1:] + [1e9])]
            tempi = sorted({n[0] for n in m})
            mezzi = sum(1 for t in tempi if min(abs(t - b - sposta) for b in R['battiti']) > 0.05)
            print(f'  {liv:9s} {len(m):3d} note (per atto {per}), accordi {len(m) - len(tempi)}, lunghe {sum(1 for n in m if n[2])}, fuori dai battiti {mezzi}')
    MAPPA.write_text(json.dumps(dati, ensure_ascii=False, separators=(',', ':')), encoding='utf-8', newline='\n')
    print(f'mappa: {MAPPA} ({MAPPA.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
