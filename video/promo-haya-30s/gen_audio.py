# Musique originale douce + effets sonores d'interface (style « app promo » : discrets, précis).
# Tout est synthétisé : aucun fichier externe, aucun droit d'auteur.
import numpy as np, wave, os
SR = 48000
os.makedirs('public/sfx', exist_ok=True)
rng = np.random.default_rng(11)

def save(path, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    m = np.max(np.abs(x)) or 1
    x = x / m * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def T(d): return np.arange(int(d * SR)) / SR
def nf(m): return 440 * 2 ** ((m - 69) / 12)
def adsr(n, a=0.005, d=0.1, s=0.0, r=0.05):
    t = np.arange(n) / SR; dur = n / SR
    e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip((dur - t) / r, 0, 1)
    return e * rel

def onepole(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x); acc = 0.0
    b = 1 - a
    for i in range(len(x)):
        acc = a * acc + b * x[i]; y[i] = acc
    return y
def lp(x, cut, n=2):
    for _ in range(n): x = onepole(x, cut)
    return x
def hp(x, cut): return x - lp(x, cut, 1)

def add(buf, x, at, g=1.0, pan=0.0):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i >= len(buf) or j <= i: return
    L = np.cos((pan + 1) * np.pi / 4) * 1.414; R = np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += x[:j - i] * g * L; buf[i:j, 1] += x[:j - i] * g * R

# ───────── MUSIQUE ─────────
DUR = 28.0; BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT
START = 3.38            # le groove démarre après le « silence » de l'accroche
N = int((DUR + 2) * SR)
mus = np.zeros((N, 2)); sc = np.ones(N)   # sc = enveloppe de compression (pompe)

# accords (piano électrique) : Dmaj9 – Bm9 – Gmaj9 – A6/9  (lumineux, posé)
CH = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 62], [45, 52, 57, 59, 61]]
ROOT = [38, 35, 31, 33]

def epiano(m, d, vel=1.0):
    t = T(d); f = nf(m)
    mod = np.sin(2 * np.pi * f * 2 * t) * 1.2 * np.exp(-t / 0.35)
    x = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t / 0.2)
    x *= (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t))     # trémolo doux
    return x * adsr(len(t), 0.004, 0.9, 0.35, 0.25) * vel

def sub(m, d):
    t = T(d); f = nf(m)
    x = np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * 2 * f * t)
    return x * adsr(len(t), 0.01, 0.6, 0.6, 0.08)

def kick(g=1.0):
    t = T(0.42); f = 42 + 95 * np.exp(-t / 0.035)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * adsr(len(t), 0.001, 0.16, 0, 0.05)
    click = lp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.004) * 0.3
    return (x + click) * g

def snap():
    t = T(0.22); n = rng.standard_normal(len(t))
    x = hp(lp(n, 6000), 1200) * (np.exp(-t / 0.045)) + 0.4 * np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.03)
    return x

def shaker():
    t = T(0.07); return hp(rng.standard_normal(len(t)), 7000) * adsr(len(t), 0.012, 0.02, 0, 0.02)

nb = int((DUR - START) / BAR) + 2
for b in range(nb):
    t0 = START + b * BAR; c = b % 4
    if t0 > DUR: break
    for i, m in enumerate(CH[c]):                     # accord arpégé très légèrement
        add(mus, epiano(m + 12, BAR + 0.4, 0.55), t0 + i * 0.012, 0.11, pan=(i - 2) * 0.25)
    for k in range(4):                                 # sub-basse sur les temps, glisse douce
        add(mus, sub(ROOT[c], BEAT * 0.92), t0 + k * BEAT, 0.42)
    for k in (0, 2):
        add(mus, kick(), t0 + k * BEAT, 0.55); i = int((t0 + k * BEAT) * SR)
        L = int(0.28 * SR); sc[i:i + L] = np.minimum(sc[i:i + L], 0.55 + 0.45 * (np.arange(min(L, N - i)) / L) ** 0.7)
    add(mus, kick(0.6), t0 + 3.5 * BEAT, 0.4)
    for k in (1, 3): add(mus, snap(), t0 + k * BEAT, 0.16, pan=0.1)
    for k in range(16): add(mus, shaker(), t0 + k * BEAT / 4, 0.05 if k % 2 else 0.09, pan=0.35)
    if b % 2 == 1:                                     # petite mélodie de clochette, 1 mesure sur 2
        for k, d in enumerate([74, 76, 78, 81]):
            t = T(0.6); f = nf(d + 12)
            add(mus, np.sin(2 * np.pi * f * t) * np.exp(-t / 0.25), t0 + (k * 0.75 + 0.5) * BEAT, 0.035, pan=0.4)

mus[:, 0] *= sc; mus[:, 1] *= sc
# accroche (0–3 s) : un coup de sub sur chaque question, puis silence net avant le groove
for at in (0.15, 0.89, 1.83):
    add(mus, kick(1.0), at, 0.7); add(mus, sub(38, 0.7), at, 0.35)
t = T(1.0); rise = hp(rng.standard_normal(len(t)), 2500) * (t / 1.0) ** 3
add(mus, rise, 2.15, 0.05)
add(mus, kick(1.0), START, 0.7)
# fin : accord final tenu + fondu
end = 19.93
for i, m in enumerate(CH[0]): add(mus, epiano(m + 12, 7.0, 0.7), end + i * 0.02, 0.12, pan=(i - 2) * 0.25)
add(mus, sub(38, 4.0), end, 0.4)
n_end = int(DUR * SR); f = int(2.0 * SR)
mus[n_end - f:n_end] *= (np.linspace(1, 0, f) ** 2)[:, None]
mus = mus[:n_end]
for dly, g in ((0.09, 0.14), (0.19, 0.09), (0.33, 0.05)):   # petit espace
    k = int(dly * SR); mus[k:] += mus[:-k] * g
save('public/music.wav', mus, 0.8)

# ───────── EFFETS D'INTERFACE ─────────
def blip(f0=1320, f1=1760, d=0.16):        # carte qui se pose : « blip » tonal doux
    t = T(d); f = f0 + (f1 - f0) * (1 - np.exp(-t / 0.02))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
    return x * adsr(len(t), 0.002, 0.05, 0, 0.03)
save('public/sfx/blip.wav', blip())
save('public/sfx/blip2.wav', blip(990, 1320))

t = T(0.05)                                  # tic de validation (case cochée)
save('public/sfx/tick.wav', (np.sin(2 * np.pi * 2900 * t) * 0.6 + lp(rng.standard_normal(len(t)), 8000) * 0.4) * np.exp(-t / 0.006))

t = T(0.12)                                  # appui de doigt : petit « toc » mat
x = np.sin(2 * np.pi * np.cumsum(260 + 400 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.025) + lp(rng.standard_normal(len(t)), 4000) * np.exp(-t / 0.003) * 0.5
save('public/sfx/tap.wav', x)

t = T(0.14)                                  # bulle de message qui arrive : « pop » montant
f = 380 + 700 * (1 - np.exp(-t / 0.03))
save('public/sfx/pop.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * adsr(len(t), 0.003, 0.05, 0, 0.03))

t = T(0.35)                                  # souffle très léger (changement de carte)
n = rng.standard_normal(len(t)); env = np.sin(np.pi * t / 0.35) ** 2
save('public/sfx/air.wav', hp(lp(n, 5000), 800) * env)

t = T(0.03)                                  # touche de clavier (frappe)
save('public/sfx/key.wav', hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.003) * 0.3)

t = T(0.06)                                  # cliquetis de compteur
save('public/sfx/count.wav', np.sin(2 * np.pi * 3400 * t) * np.exp(-t / 0.004))

t = T(2.2)                                   # carillon de fin (logo)
x = sum(a * np.sin(2 * np.pi * nf(m) * t) * np.exp(-t / dcy) for m, a, dcy in ((86, 1, 0.9), (93, 0.6, 0.7), (98, 0.35, 0.5), (74, 0.5, 1.4)))
save('public/sfx/chime.wav', x * adsr(len(t), 0.003, 5, 1, 0.3))

t = T(0.5)                                   # coup sourd (mots de l'accroche)
save('public/sfx/thump.wav', np.sin(2 * np.pi * np.cumsum(55 + 140 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.12))
print('audio ok')
