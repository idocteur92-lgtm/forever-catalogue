# Musique originale dynamique (123,2 BPM) + bruitages d'interface discrets. Tout est synthétisé.
import numpy as np, wave, os
SR = 48000
os.makedirs('public/sfx', exist_ok=True)
rng = np.random.default_rng(21)

def save(path, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x / (np.max(np.abs(x)) or 1) * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def T(d): return np.arange(int(d * SR)) / SR
def nf(m): return 440 * 2 ** ((m - 69) / 12)
def adsr(n, a=0.005, d=0.1, s=0.0, r=0.05):
    t = np.arange(n) / SR; dur = n / SR
    e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    return e * np.clip((dur - t) / r, 0, 1)
def onepole(x, cut):
    a = np.exp(-2 * np.pi * cut / SR); y = np.empty_like(x); acc = 0.0; b = 1 - a
    for i in range(len(x)):
        acc = a * acc + b * x[i]; y[i] = acc
    return y
def lp(x, cut, n=2):
    for _ in range(n): x = onepole(x, cut)
    return x
def hp(x, cut): return x - lp(x, cut, 1)
def add(buf, x, at, g=1.0, pan=0.0):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i < 0 or i >= len(buf) or j <= i: return
    L = np.cos((pan + 1) * np.pi / 4) * 1.414; R = np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += x[:j - i] * g * L; buf[i:j, 1] += x[:j - i] * g * R

DUR = 60.0; G0 = 9.45; BARS = 20; FIN = 48.41
BAR = (FIN - G0) / BARS; BEAT = BAR / 4            # ≈ 123,2 BPM
N = int((DUR + 2) * SR)
drums = np.zeros((N, 2)); music = np.zeros((N, 2)); sc = np.ones(N)

CH = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 62], [45, 52, 57, 59, 61]]  # Dmaj9 Bm9 Gmaj9 A6/9
ROOT = [38, 35, 31, 33]

def kick(g=1.0):
    t = T(0.36); f = 44 + 110 * np.exp(-t / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * adsr(len(t), 0.001, 0.13, 0, 0.04)
    return (x + lp(rng.standard_normal(len(t)), 3500) * np.exp(-t / 0.004) * 0.35) * g
def clap():
    t = T(0.24); n = hp(lp(rng.standard_normal(len(t)), 7000), 1100)
    e = sum(np.exp(-np.clip(t - o, 0, None) / 0.012) * (t >= o) for o in (0, 0.011, 0.023)) * 0.5 + np.exp(-t / 0.07) * 0.7
    return n * e
def hat(d=0.05, dec=0.012):
    t = T(d); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t / dec)
def ohat():
    t = T(0.16); return hp(rng.standard_normal(len(t)), 7000) * adsr(len(t), 0.002, 0.07, 0, 0.03)
def bass(m, d):
    t = T(d); f = nf(m)
    x = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.08)) + 0.2 * np.sin(2 * np.pi * 2 * f * t)
    return x * adsr(len(t), 0.004, 0.25, 0.5, 0.03)
def stab(notes, d=0.32, bright=1.0):
    t = T(d); x = np.zeros_like(t)
    for m in notes:
        f = nf(m + 12)
        x += np.sin(2 * np.pi * f * t + bright * 1.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.09)) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.06)
    return x / len(notes) * adsr(len(t), 0.003, 0.16, 0.12, 0.05)
def pad(notes, d):
    t = T(d); x = np.zeros_like(t)
    for m in notes:
        for det in (-0.07, 0.07):
            f = nf(m + 12) * 2 ** (det / 12); x += np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return x / len(notes) * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.6)
def bell(m, d=0.5):
    t = T(d); f = nf(m); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.08)) * np.exp(-t / 0.2)
def duck(at, depth=0.5, L=0.24):
    i = int(at * SR); n = min(int(L * SR), N - i)
    if n > 0: sc[i:i + n] = np.minimum(sc[i:i + n], depth + (1 - depth) * (np.arange(n) / n) ** 0.8)

# ── Intro (histoire) : pulsation douce, puis tension, montée, silence, départ ──
for k in range(1, 20):
    t0 = G0 - k * BEAT
    if t0 < 0.1: break
    dark = t0 > 4.45
    c = CH[1] if dark else CH[0]
    if k % 2 == 0: add(music, stab(c, 0.3, 0.5), t0, 0.16 if not dark else 0.2, pan=0.2 * (-1) ** k)
    add(music, bell(c[(k * 2) % 5] + 24, 0.4), t0 + BEAT / 2, 0.05, pan=0.4)
    if dark and k % 2 == 1 and t0 < G0 - 0.6: add(drums, kick(0.8), t0, 0.5); duck(t0, 0.7)
    if not dark and k % 4 == 0: add(drums, kick(0.6), t0, 0.3)
add(music, pad(CH[0], 4.6), 0.0, 0.2); add(music, pad(CH[1], 4.6), 4.3, 0.22)
t = T(2.2); add(music, hp(rng.standard_normal(len(t)), 1800) * (t / 2.2) ** 2.5, G0 - 2.35, 0.09)            # montée
t = T(1.6); add(music, np.sin(2 * np.pi * np.cumsum(180 + 900 * (t / 1.6) ** 2) / SR) * (t / 1.6) ** 2, G0 - 1.75, 0.035)

# ── Groove : 20 mesures ──
STAB_R = [0, 0.75, 1.5, 2.5, 3.25]; BASS_R = [(0, 0), (0.5, 12), (1.0, 0), (1.75, 12), (2.5, 0), (3.0, 7), (3.5, 12)]
MOTIF = [78, 81, 78, 76, 74, 76]
def bar_at(b, t0, full=True, fill=False, light=False):
    c = b % 4
    add(music, pad(CH[c], BAR + 0.3), t0, 0.07)
    for r in STAB_R: add(music, stab(CH[c], 0.3, 1.0 if full else 0.6), t0 + r * BEAT, 0.2 if not light else 0.15, pan=0.25 if int(r * 4) % 2 else -0.25)
    if not light:
        for r, o in BASS_R: add(music, bass(ROOT[c] + o, BEAT * 0.42), t0 + r * BEAT, 0.3)
    else:
        add(music, bass(ROOT[c], BEAT * 1.6), t0, 0.26)
    for k in range(4):
        if fill and k >= 2: continue
        add(drums, kick(), t0 + k * BEAT, 0.6); duck(t0 + k * BEAT)
        add(drums, ohat(), t0 + (k + 0.5) * BEAT, 0.085, pan=0.3)
    if full:
        for k in (1, 3):
            if fill and k == 3: continue
            add(drums, clap(), t0 + k * BEAT, 0.2, pan=-0.1)
    for k in range(16): add(drums, hat(), t0 + k * BEAT / 4, 0.03 if k % 2 else 0.055, pan=-0.35)
    if fill:
        for k in range(8): add(drums, clap(), t0 + (2 + k * 0.25) * BEAT, 0.07 + 0.02 * k)
        tt = T(BEAT * 2); add(music, hp(rng.standard_normal(len(tt)), 2500) * (tt / (BEAT * 2)) ** 2, t0 + 2 * BEAT, 0.06)
    if b % 2 == 1 and full:
        for k, m in enumerate(MOTIF): add(music, bell(m + 12 if b >= 12 else m, 0.45), t0 + (k * 0.5 + 0.5) * BEAT, 0.06, pan=0.45)
    if b >= 12 and full:
        for k in range(8): add(music, bell(CH[c][(k * 3) % 5] + 24, 0.2), t0 + k * BEAT / 2 + BEAT / 4, 0.03, pan=-0.5)
for b in range(BARS):
    bar_at(b, G0 + b * BAR, full=b >= 2, fill=b in (11, 19))
def crash(at, g=0.12):
    t = T(1.8); add(drums, hp(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.5), at, g)
for b in (0, 4, 12): crash(G0 + b * BAR)
# ── Final : impact, puis groove allégé, dernier accord ──
crash(FIN, 0.16); add(drums, kick(1.2), FIN, 0.7)
b = 0
while FIN + (b + 1) * BAR < 58.4:
    bar_at(b, FIN + b * BAR, full=True, light=True); b += 1
END = FIN + b * BAR
for i, m in enumerate(CH[0]): add(music, stab([m], 2.4, 0.6), END + i * 0.02, 0.14)
add(music, pad(CH[0], 2.6), END, 0.16); add(drums, kick(1.1), END, 0.6)

music[:, 0] *= sc; music[:, 1] *= sc
mix = music + drums
for dly, g in ((0.11, 0.13), (0.23, 0.08), (0.37, 0.04)):
    k = int(dly * SR); mix[k:] += music[:-k] * g
n_end = int(DUR * SR); f = int(1.3 * SR); mix[n_end - f:n_end] *= (np.linspace(1, 0, f) ** 2)[:, None]
mix = np.tanh(mix[:n_end] * 1.6) / 1.6
save('public/music.wav', mix, 0.85)

# ── Bruitages d'interface (mêmes recettes que la vidéo précédente) ──
def blip(f0=1320, f1=1760, d=0.16):
    t = T(d); f = f0 + (f1 - f0) * (1 - np.exp(-t / 0.02))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)) * adsr(len(t), 0.002, 0.05, 0, 0.03)
save('public/sfx/blip.wav', blip()); save('public/sfx/blip2.wav', blip(990, 1320))
t = T(0.05); save('public/sfx/tick.wav', (np.sin(2 * np.pi * 2900 * t) * 0.6 + lp(rng.standard_normal(len(t)), 8000) * 0.4) * np.exp(-t / 0.006))
t = T(0.12); save('public/sfx/tap.wav', np.sin(2 * np.pi * np.cumsum(260 + 400 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.025) + lp(rng.standard_normal(len(t)), 4000) * np.exp(-t / 0.003) * 0.5)
t = T(0.14); save('public/sfx/pop.wav', np.sin(2 * np.pi * np.cumsum(380 + 700 * (1 - np.exp(-t / 0.03))) / SR) * adsr(len(t), 0.003, 0.05, 0, 0.03))
t = T(0.35); save('public/sfx/air.wav', hp(lp(rng.standard_normal(len(t)), 5000), 800) * np.sin(np.pi * t / 0.35) ** 2)
t = T(0.03); save('public/sfx/key.wav', hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.003) * 0.3)
t = T(0.06); save('public/sfx/count.wav', np.sin(2 * np.pi * 3400 * t) * np.exp(-t / 0.004))
t = T(2.2); save('public/sfx/chime.wav', sum(a * np.sin(2 * np.pi * nf(m) * t) * np.exp(-t / d) for m, a, d in ((86, 1, 0.9), (93, 0.6, 0.7), (98, 0.35, 0.5), (74, 0.5, 1.4))) * adsr(len(t), 0.003, 5, 1, 0.3))
t = T(0.5); save('public/sfx/thump.wav', np.sin(2 * np.pi * np.cumsum(55 + 140 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.12))
print('audio ok', round(BEAT, 4), round(60 / BEAT, 1), 'bpm, fin', round(END, 2))
