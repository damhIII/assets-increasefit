"""Efectos y bucles de música sintetizados (obra propia, sin licencias de terceros). Determinista: semilla fija."""
import math, os, sys, wave
import numpy as np
from scipy import signal

SR = 44100
rng = np.random.default_rng(42)
OUT = sys.argv[1]


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=0.2, curva=4.0):
    """Ataque lineal + caída exponencial."""
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4))
    return e * np.exp(-np.maximum(0, x - a) * curva / max(r, 1e-4))


def lp(x, fc, o=2):
    return signal.sosfilt(signal.butter(o, min(fc, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, fc, o=2):
    return signal.sosfilt(signal.butter(o, fc, "high", fs=SR, output="sos"), x)


def bp(x, f1, f2, o=2):
    return signal.sosfilt(signal.butter(o, [f1, min(f2, SR / 2 - 100)], "band", fs=SR, output="sos"), x)


def barrido_bp(x, f_ini, f_fin, q=1.2, bloque=256):
    """Pasa-banda cuyo centro se desplaza exponencialmente de f_ini a f_fin."""
    y = np.zeros_like(x)
    n = len(x)
    zi = None
    for i in range(0, n, bloque):
        fr = i / max(1, n - 1)
        fc = f_ini * (f_fin / f_ini) ** fr
        b, a = signal.iirpeak(fc, q, fs=SR)
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        y[i:i + bloque], zi = signal.lfilter(b, a, x[i:i + bloque], zi=zi)
    return y


def norm(x, pico=0.89):
    m = np.abs(x).max()
    return x / m * pico if m > 0 else x


def fade(x, fin=0.01, ini=0.002):
    n1, n2 = int(SR * ini), int(SR * fin)
    x = x.copy()
    if n1:
        x[:n1] *= np.linspace(0, 1, n1)
    if n2:
        x[-n2:] *= np.linspace(1, 0, n2)
    return x


def guardar(nombre, x, canales=1):
    os.makedirs(os.path.dirname(f"{OUT}/{nombre}"), exist_ok=True)
    x = np.clip(x, -1, 1)
    data = (x * 32767).astype("<i2")
    with wave.open(f"{OUT}/{nombre}", "wb") as w:
        w.setnchannels(canales)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes() if canales == 1 else data.reshape(-1).tobytes())


# ---------------- EFECTOS ----------------
def whoosh(d, f0, f1, nombre):
    n = int(SR * d)
    ruido = rng.standard_normal(n)
    y = barrido_bp(ruido, f0, f1, q=0.9)
    e = np.sin(np.linspace(0, math.pi, n)) ** 1.6
    guardar(nombre, fade(norm(y * e, 0.8)))


whoosh(0.32, 500, 3500, "sfx/whoosh_corto.wav")
whoosh(0.7, 300, 2600, "sfx/whoosh_largo.wav")

# pop: seno que cae de tono + clic
tt = t(0.09)
f = 900 * (300 / 900) ** (tt / tt[-1])
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.001, 0.05, 3)
pop[:40] += rng.standard_normal(40) * 0.3
guardar("sfx/pop.wav", fade(norm(pop)))

# ding: campana (parciales inarmónicos)
tt = t(1.4)
ding = sum(a * np.sin(2 * np.pi * 1318.5 * k * tt) * np.exp(-tt * dcy) for k, a, dcy in [(1, 1, 3), (2.76, 0.45, 6), (5.4, 0.2, 10), (2.0, 0.25, 4)])
guardar("sfx/ding.wav", fade(norm(ding * env(len(tt), 0.002, 1.4, 0.5))))

# golpe sordo: bombo grave + ruido filtrado (punch-in, caída de algo)
tt = t(0.45)
f = 140 * (42 / 140) ** np.minimum(1, tt / 0.12)
golpe = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.001, 0.35, 4)
golpe += lp(rng.standard_normal(len(tt)), 900) * env(len(tt), 0.001, 0.06, 6) * 0.6
guardar("sfx/golpe_sordo.wav", fade(norm(golpe)))

# tic-tac (1 s, en bucle): dos clics resonantes
tic = np.zeros(SR)
for pos, fc in [(0, 3200), (SR // 2, 2300)]:
    clic = signal.lfilter(*signal.iirpeak(fc, 25, fs=SR), rng.standard_normal(1200)) * env(1200, 0.0005, 0.012, 5)
    tic[pos:pos + 1200] += clic
guardar("sfx/tic_tac.wav", norm(tic, 0.8))

# zumbador de error: dos pulsos de onda cuadrada grave
tt = t(0.22)
cuad = signal.square(2 * np.pi * 110 * tt) + signal.square(2 * np.pi * 116.5 * tt)
pulso = lp(cuad, 1800) * env(len(tt), 0.004, 0.25, 1.5)
err = np.concatenate([pulso, np.zeros(int(SR * 0.06)), pulso])
guardar("sfx/error_zumbador.wav", fade(norm(err, 0.8)))

# rasgado de vinilo (record scratch)
tt = t(0.5)
osc = 0.5 + 0.5 * np.sin(2 * np.pi * (3 + 9 * tt) * tt)
ruido = rng.standard_normal(len(tt))
scr = barrido_bp(ruido * (0.4 + osc), 2500, 600, q=3)
saw = signal.sawtooth(2 * np.pi * np.cumsum(300 * (0.4 + osc)) / SR) * 0.25
scr = (scr + lp(saw, 2500)) * env(len(tt), 0.003, 0.5, 2.5)
guardar("sfx/rasgado_vinilo.wav", fade(norm(scr)))

# brillo: arpegio agudo ascendente
br = np.zeros(int(SR * 1.0))
for i, fr in enumerate([2093, 2637, 3136, 4186]):
    s = int(SR * 0.06 * i)
    tt = t(0.6)
    nota = (np.sin(2 * np.pi * fr * tt) + 0.3 * np.sin(2 * np.pi * fr * 2.01 * tt)) * env(len(tt), 0.002, 0.6, 5)
    br[s:s + len(nota)] += nota
guardar("sfx/brillo.wav", fade(norm(br, 0.7)))

# tachón de rotulador: ruido agudo modulado (garabato)
tt = t(0.5)
mod = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 11 * tt))
tach = bp(rng.standard_normal(len(tt)), 2000, 7000) * (0.3 + mod) * env(len(tt), 0.01, 0.5, 1)
guardar("sfx/tachon_rotulador.wav", fade(norm(tach, 0.7), 0.05))

# subida de tensión (riser 1,5 s)
tt = t(1.5)
f = 200 * (1600 / 200) ** (tt / tt[-1])
riser = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.3 + barrido_bp(rng.standard_normal(len(tt)), 400, 6000, q=1.5)
riser = lp(riser, 7000) * (tt / tt[-1]) ** 2
guardar("sfx/subida_tension.wav", fade(norm(riser, 0.8), 0.02))

# caída de fracaso ("wah wah wah waaah" de trombón)
notas = [(311.1, 0.32), (293.7, 0.32), (277.2, 0.32), (261.6, 0.9)]
fr_ = []
for f0, d in notas:
    tt = t(d)
    vib = 1 + (0.012 * np.sin(2 * np.pi * 5.5 * tt) if d > 0.5 else 0)
    fr_.append(f0 * vib * np.ones_like(tt))
fr_ = np.concatenate(fr_)
saw = signal.sawtooth(2 * np.pi * np.cumsum(fr_) / SR)
wah = np.zeros_like(saw)
bloques = np.cumsum([0] + [int(SR * d) for _, d in notas])
for i in range(len(notas)):
    a, b = bloques[i], bloques[i + 1]
    seg = saw[a:b]
    corte = 400 + 1400 * np.sin(np.linspace(0, math.pi, b - a)) ** 0.7
    y = np.zeros_like(seg)
    for k in range(0, len(seg), 512):
        y[k:k + 512] = lp(seg[k:k + 512], corte[k], 2)
    wah[a:b] = y * env(b - a, 0.02, (b - a) / SR, 1.2)
guardar("sfx/caida_fracaso.wav", fade(norm(lp(wah, 3000), 0.8), 0.05))


# ---------------- MÚSICA (bucles sin costura) ----------------
def reverb(x, dur=1.2, mezcla=0.25):
    n = int(SR * dur)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 5)
    ir = lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    return x + mezcla * signal.fftconvolve(x, ir)[: len(x)]


def bombo(d=0.4):
    tt = t(d)
    f = 120 * (45 / 120) ** np.minimum(1, tt / 0.09)
    k = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.001, d, 5)
    k[:300] += bp(rng.standard_normal(300), 2000, 6000) * 0.25          # ataque audible en altavoces de móvil
    return k


def caja(d=0.25):
    tt = t(d)
    return (0.7 * bp(rng.standard_normal(len(tt)), 1200, 8000) + 0.5 * np.sin(2 * np.pi * 190 * tt)) * env(len(tt), 0.001, d, 9)


def palmas():
    x = np.zeros(int(SR * 0.3))
    for k in range(3):
        s = int(SR * 0.009 * k)
        x[s:s + 2000] += bp(rng.standard_normal(2000), 900, 3500) * env(2000, 0.0005, 0.03, 4)
    x[2000:] += bp(rng.standard_normal(len(x) - 2000), 900, 3500) * env(len(x) - 2000, 0.001, 0.2, 8) * 0.5
    return x


def hat(d=0.06, abierto=False):
    d = 0.3 if abierto else d
    tt = t(d)
    return hp(rng.standard_normal(len(tt)), 7000) * env(len(tt), 0.0005, d, 7 if not abierto else 5)


def nota_hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def bajo(m, d, tipo="saw", fc=500):
    tt = t(d)
    f = nota_hz(m)
    w = signal.sawtooth(2 * np.pi * f * tt) if tipo == "saw" else np.sin(2 * np.pi * f * tt) + 0.45 * np.sin(4 * np.pi * f * tt) + 0.25 * np.sin(6 * np.pi * f * tt)
    return lp(w, fc, 4) * env(len(tt), 0.005, d, 2)


def acorde(ms, d, tipo="pad", fc=2200):
    tt = t(d)
    x = np.zeros_like(tt)
    for m in ms:
        f = nota_hz(m)
        if tipo == "pad":
            x += sum(signal.sawtooth(2 * np.pi * f * det * tt) for det in (0.997, 1.0, 1.004)) / 3
        elif tipo == "rhodes":
            x += (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 6)) * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * tt))
        else:  # pluck
            x += signal.sawtooth(2 * np.pi * f * tt) * np.exp(-tt * 9)
    a = 0.25 if tipo == "pad" else 0.003
    return lp(x / len(ms), fc, 2) * np.minimum(1, tt / a) * np.minimum(1, (tt[-1] - tt) / 0.05 + 0.0)


def pista(bpm, compases, construir, nombre, swing=0.0):
    beat = 60 / bpm
    total = int(SR * beat * 4 * compases)
    L = np.zeros(total + SR * 3)
    capas = {"drums": L.copy(), "bass": L.copy(), "keys": L.copy()}

    def pon(capa, x, beat_pos, gain=1.0):
        frac = beat_pos % 1
        if swing and abs(frac - 0.5) < 1e-6:
            beat_pos += swing
        s = int(SR * beat * beat_pos)
        capas[capa][s:s + len(x)] += x * gain

    construir(pon, beat)
    # compresión lateral (sidechain) del bajo y teclas con el pulso de negras
    fase = (np.arange(len(L)) / SR) % beat / beat
    side = 0.45 + 0.55 * np.minimum(1, fase / 0.35)
    mezcla = capas["drums"] + capas["bass"] * side + reverb(capas["keys"], 1.6, 0.35) * side
    # bucle sin costura: la cola que sobra se suma al principio
    out = mezcla[:total].copy()
    out[: len(mezcla) - total] += mezcla[total:]
    out = np.tanh(out * 1.2) / np.tanh(1.2)
    estereo = np.stack([out, np.roll(reverb(out, 0.3, 0.08), 9)], 1)
    estereo = norm(estereo, 0.9)
    guardar(nombre, estereo, canales=2)


def pulso_120(pon, beat):          # enérgico: método, resultado
    prog = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [64, 67, 72]), (55, [67, 71, 74])]
    for c in range(8):
        raiz, ac = prog[c % 4]
        for b in range(4):
            pon("drums", bombo(), c * 4 + b, 0.75)
            if b in (1, 3):
                pon("drums", palmas(), c * 4 + b, 0.55)
            for h in (0.5,):
                pon("drums", hat(abierto=True), c * 4 + b + h, 0.07)
            pon("drums", hat(), c * 4 + b, 0.05)
            for e in (0, 0.5):
                pon("bass", bajo(raiz - 12, beat * 0.45, "saw", 1500), c * 4 + b + e, 0.4)
            pon("keys", acorde(ac, beat * 0.4, "pluck", 4500), c * 4 + b + 0.5, 1.3)


def groove_92(pon, beat):          # lo-fi relajado: explicación, por qué
    prog = [(50, [62, 65, 69, 72, 76]), (55, [65, 69, 71, 76]), (48, [64, 67, 71, 74]), (57, [61, 64, 67, 71])]
    for c in range(8):
        raiz, ac = prog[c % 4]
        pon("keys", acorde(ac, beat * 4, "rhodes", 3000), c * 4, 1.5)
        pon("bass", bajo(raiz - 12, beat * 1.5, "sine", 400), c * 4, 0.9)
        pon("bass", bajo(raiz - 12, beat * 0.8, "sine", 400), c * 4 + 2.5, 0.7)
        for b in range(4):
            if b in (0, 2):
                pon("drums", bombo(0.35), c * 4 + b, 0.9)
            if b == 2 and c % 2:
                pon("drums", bombo(0.35), c * 4 + b + 0.75, 0.6)
            if b in (1, 3):
                pon("drums", caja(), c * 4 + b, 0.45)
            for h in (0, 0.5):
                pon("drums", hat(0.04), c * 4 + b + h, 0.1 if h else 0.14)


def tension_100(pon, beat):        # suspense: error, gancho
    for c in range(8):
        pon("keys", acorde([64, 71, 76] if c % 4 < 2 else [65, 72, 77], beat * 4, "pad", 2000), c * 4, 0.6)
        for s in range(16):
            pon("bass", bajo(40 if c % 4 < 3 else 41, beat * 0.22, "saw", 700 + 150 * (s % 4)), c * 4 + s / 4, 0.4)
            if s % 2 == 0:
                pon("drums", hat(0.03), c * 4 + s / 4, 0.1)
        pon("drums", bombo(0.6), c * 4, 0.7)
        if c % 2 == 1:
            pon("drums", golpe_metal(), c * 4 + 2, 0.25)


def golpe_metal():
    tt = t(0.8)
    return sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * k) for f, k in [(523, 4), (1347, 7), (2211, 10)]) / 3


pista(120, 8, pulso_120, "musica/pulso_120.wav")
pista(92, 8, groove_92, "musica/groove_92.wav", swing=0.08)
pista(100, 8, tension_100, "musica/tension_100.wav")
print("listo")
