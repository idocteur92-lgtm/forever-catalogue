# Musique originale + effets sonores, synthétisés (aucun fichier externe).
# 120 BPM : 1 temps = 0,5 s = 15 images à 30 i/s ; 1 mesure = 2 s.
import numpy as np, wave, os
SR = 44100
BPM = 120; BEAT = 60 / BPM; BAR = BEAT * 4
DUR = 30.0
os.makedirs('public/sfx', exist_ok=True)
rng = np.random.default_rng(7)

def save(path, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * 0.89
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def t_(d): return np.arange(int(d * SR)) / SR
def nf(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a=0.005, r=0.2, d=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
    return e

def lp(x, cut):  # filtre passe-bas simple (1 pôle, appliqué 2x)
    a = np.exp(-2 * np.pi * cut / SR)
    for _ in range(2):
        y = np.zeros_like(x); acc = 0.0
        # vectorisation impossible proprement : boucle sur blocs via lfilter maison
        from itertools import accumulate
        y = np.array(list(accumulate(x * (1 - a), lambda p, v: p * a + v)))
        x = y
    return x

def add(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i >= len(buf) or j <= i: return
    L = np.cos((pan + 1) * np.pi / 4); R = np.sin((pan + 1) * np.pi / 4)
    buf[i:j, 0] += x[:j - i] * gain * L * 1.414
    buf[i:j, 1] += x[:j - i] * gain * R * 1.414

N = int(DUR * SR) + SR * 2
mix = np.zeros((N, 2))

# Accords : D - A - Bm - G (I V vi IV), ré majeur, chaleureux et positif
CH = [[62, 66, 69, 74], [61, 64, 69, 73], [59, 62, 66, 71], [59, 62, 67, 71]]
BASS = [38, 33, 35, 31]

def pad(notes, d):
    t = t_(d); x = np.zeros_like(t)
    for m in notes:
        for det in (-0.08, 0.08):
            f = nf(m) * 2 ** (det / 12)
            x += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    a = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.5)
    return x * a / len(notes)

def pluck(m, d=0.35):
    t = t_(d); f = nf(m)
    x = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) + 0.2 * np.sin(2 * np.pi * 3 * f * t))
    return x * env(len(t), 0.002, 0.12)

def kick():
    t = t_(0.35); f = 45 + 120 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(len(t), 0.001, 0.12)

def hat():
    t = t_(0.08); x = rng.standard_normal(len(t)); x = x - lp(x, 6000)
    return x * env(len(t), 0.0005, 0.02)

def clap():
    t = t_(0.25); x = rng.standard_normal(len(t)); x = lp(x, 5000) - lp(x, 900)
    e = sum(env(len(t), 0.001, 0.012) * (np.arange(len(t)) >= int(k * SR)) for k in (0, 0.01, 0.02)) + env(len(t), 0.001, 0.08) * 0.6
    return x * e

def bass(m, d):
    t = t_(d); f = nf(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return x * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.05)

nbars = int(DUR / BAR)  # 15 mesures
for b in range(nbars):
    t0 = b * BAR; c = b % 4
    last = b >= 13
    add(mix, pad(CH[c], BAR + 0.3 if not last else (DUR - t0 + 1.5)), t0, 0.16 if b < 2 else 0.12)
    if last and b == 14: pass
    # arpège (croches) dès la mesure 1
    if b < 14:
        arp = CH[c] + [CH[c][1] + 12]
        for k in range(8):
            if b < 2 and k % 2: continue
            m = arp[[0, 2, 1, 3, 4, 3, 2, 1][k]] + 12
            add(mix, pluck(m), t0 + k * BEAT / 2, 0.10 if b >= 2 else 0.08, pan=(-0.4 if k % 2 else 0.4))
    # batterie à partir de la mesure 2 (4 s)
    if 2 <= b < 14:
        for k in range(4):
            if b == 12 and k >= 2: continue  # mini-cassure avant la fin
            add(mix, kick(), t0 + k * BEAT, 0.55)
            add(mix, hat(), t0 + k * BEAT + BEAT / 2, 0.10, pan=0.3)
            add(mix, bass(BASS[c], BEAT * 0.45), t0 + k * BEAT + BEAT / 2, 0.20)
        if b >= 7:
            for k in (1, 3):
                if b == 12 and k == 3: continue
                add(mix, clap(), t0 + k * BEAT, 0.22)
    if b == 13:  # arrivée de la fin : grosse note
        add(mix, kick(), t0, 0.6); add(mix, bass(BASS[0], 2.5), t0, 0.22)

# riser vers 4 s
t = t_(1.8); x = rng.standard_normal(len(t)); x = lp(x, 3000) * (t / 1.8) ** 2
add(mix, x, 4.0 - 1.8, 0.10)

# fondu final
n_end = int(DUR * SR); fade = int(1.2 * SR)
mix[n_end - fade:n_end] *= np.linspace(1, 0, fade)[:, None] ** 2
mix = mix[:n_end]
# légère réverbération (échos)
for dly, g in ((0.11, 0.18), (0.23, 0.12), (0.37, 0.07)):
    k = int(dly * SR); mix[k:] += mix[:-k] * g
save('public/music.wav', mix)

# ---- effets sonores ----
def whoosh(d=0.45):
    t = t_(d); x = rng.standard_normal(len(t))
    cut = 400 + 5000 * np.sin(np.pi * t / d) ** 2
    y = lp(x, 2500) * np.sin(np.pi * t / d) ** 2
    return y
save('public/sfx/whoosh.wav', whoosh())
t = t_(0.18); f = 900 * np.exp(-t / 0.05) + 300
save('public/sfx/pop.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.05))
t = t_(0.06); save('public/sfx/click.wav', (np.sin(2 * np.pi * 2400 * t) + 0.5 * rng.standard_normal(len(t))) * env(len(t), 0.0005, 0.008))
t = t_(0.7); x = sum(np.sin(2 * np.pi * nf(m) * t) * env(len(t), 0.003, 0.25) * (t >= o) for m, o in ((81, 0), (88, 0.09)))
save('public/sfx/ding.wav', x)
t = t_(1.2); x = sum(np.sin(2 * np.pi * nf(m) * t + i) * np.exp(-t / 0.5) * (0.5 + 0.5 * np.sin(2 * np.pi * (6 + i) * t)) for i, m in enumerate((86, 90, 93, 98)))
save('public/sfx/shimmer.wav', x * np.minimum(1, t / 0.02))
t = t_(0.04); save('public/sfx/tick.wav', np.sin(2 * np.pi * 3200 * t) * env(len(t), 0.0003, 0.006))
print('audio ok')
