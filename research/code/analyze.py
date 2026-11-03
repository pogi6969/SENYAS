#!/usr/bin/env python3
"""SENYAS analysis: turns the benchmark results into the statistics and figures used in the paper and deck.
Run after bench_recognizer.js and bench_browser.js:  python3 analyze.py"""
import json, math, pathlib, subprocess
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = pathlib.Path(__file__).resolve().parent
FIG = HERE.parent / "figures"
FIG.mkdir(exist_ok=True)
R = json.load(open(HERE / "results_recognizer.json"))
B = json.load(open(HERE / "results_browser.json"))
RED, DARK, MID, PINK = "#8B0707", "#2B2020", "#B5524F", "#E3C9C9"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11, "axes.spines.top": False, "axes.spines.right": False})


def wilson(k, n, z=1.96):
    if n == 0: return (0, 0)
    p = k / n; d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (max(0, c - h), min(1, c + h))


def binom_sf(k, n, p):
    """P(X >= k) for X ~ Binomial(n, p): the one-sided p-value for 'more than p'."""
    return sum(math.comb(n, i) * p ** i * (1 - p) ** (n - i) for i in range(k, n + 1))


S = {}
# 1. static letters by noise level
st = []
for s in R["static"]:
    k = round(s["accuracy"] * s["n"]); lo, hi = wilson(k, s["n"])
    st.append({"level": s["level"], "n": s["n"], "k": k, "acc": s["accuracy"], "lo": lo, "hi": hi})
S["static"] = st
nom = [x for x in st if x["level"] == 1][0]
S["H1"] = {"n": nom["n"], "k": nom["k"], "p0": 0.90, "p": binom_sf(nom["k"], nom["n"], 0.90)}
conf = {}
for s in R["static"]:
    for a, d in s["confusions"].items():
        for b, c in d.items(): conf[(a, b)] = conf.get((a, b), 0) + c
S["topConfusions"] = sorted([[a, b, c] for (a, b), c in conf.items()], key=lambda x: -x[2])[:8]

# 2. moving and two-handed signs
mv = []
for k, v in R["moving"].items():
    hit = round(v["detected"] * v["trials"]); lo, hi = wilson(hit, v["trials"])
    mv.append({"sign": k, "two": bool(v.get("twoHands")), "n": v["trials"], "k": hit, "rate": v["detected"], "lo": lo, "hi": hi})
S["moving"] = mv
allk = sum(m["k"] for m in mv); alln = sum(m["n"] for m in mv)
S["movingAll"] = {"k": allk, "n": alln, "rate": allk / alln, "ci": wilson(allk, alln)}
S["H2"] = {"n": alln, "k": allk, "p0": 0.90, "p": binom_sf(allk, alln, 0.90)}
S["still"] = R["still"]
fa = round(R["still"]["movingSignFalseAlarms"] * R["still"]["sequences"])
S["still"]["falseAlarmCI"] = wilson(fa, R["still"]["sequences"])

# 3. braille
br = B["braille"]
def cer(rows): return sum(min(r["errors"], r["chars"]) for r in rows) / max(1, sum(r["chars"] for r in rows))
def exact(rows): return sum(r["exact"] for r in rows) / max(1, len(rows))
groups = {
    "All photos": br,
    "Printed dots": [r for r in br if not r["emb"]], "Embossed dots": [r for r in br if r["emb"]],
    "Skew 0–2°": [r for r in br if abs(r["rotDeg"]) < 2], "Skew 2–4°": [r for r in br if 2 <= abs(r["rotDeg"]) < 4], "Skew 4–6°": [r for r in br if abs(r["rotDeg"]) >= 4],
    "Blur < 0.8 px": [r for r in br if r["blur"] < 0.8], "Blur ≥ 0.8 px": [r for r in br if r["blur"] >= 0.8],
    "Dot pitch < 15 px": [r for r in br if r["d"] < 15], "Dot pitch 15–18 px": [r for r in br if 15 <= r["d"] < 18], "Dot pitch ≥ 18 px": [r for r in br if r["d"] >= 18],
}
S["braille"] = [{"group": g, "n": len(rows), "cer": cer(rows), "exact": exact(rows), "ci": wilson(sum(r["exact"] for r in rows), len(rows))} for g, rows in groups.items()]
ms = sorted(r["ms"] for r in br)
S["brailleMs"] = {"median": ms[len(ms) // 2], "p90": ms[int(len(ms) * 0.9)]}
n_ok = sum(1 for r in br if min(r["errors"], r["chars"]) / r["chars"] <= 0.2)
S["H3"] = {"n": len(br), "cer": cer(br), "k20": n_ok}

# 4. camera path on rendered hands
mp = B["mediapipe"]["rows"]
det = [r for r in mp if r["det"]]
S["mediapipe"] = {"n": len(mp), "detected": len(det), "detRate": len(det) / len(mp), "correct": sum(r["got"] == r["L"] for r in det),
                  "accDet": sum(r["got"] == r["L"] for r in det) / max(1, len(det)), "ms": B["mediapipe"]["msMedian"]}
per = {}
for r in mp:
    d = per.setdefault(r["L"], [0, 0, 0]); d[0] += 1; d[1] += r["det"]; d[2] += r["det"] and r["got"] == r["L"]
S["mediapipePer"] = per
S["timing"] = {"recognizerMs": R["timing"]["msPerFrame"], "templates": R["timing"]["templates"], "mediapipeMs": B["mediapipe"]["msMedian"], "brailleMs": S["brailleMs"]["median"]}

# 5. lexicon coverage of the phrasebook
cov = json.loads(subprocess.check_output(["node", "-e", """
global.Hand=require('../../src/hand.js');global.Avatar=require('../../src/avatar.js');
eval(require('fs').readFileSync('../../src/data.js','utf8')+';global.DATA=DATA');
var o={};['en','fil','bcl'].forEach(function(l){var w=0,s=0;DATA.phrases.forEach(function(p){DATA.toSigns(p[l]).forEach(function(x){if(x.word)w++;else s++;});});o[l]={signs:w,spelled:s};});
o.words=DATA.list.filter(function(w){return !w.num;}).length;o.numbers=11;o.phrases=DATA.phrases.length;o.live=DATA.LIVE.length;
console.log(JSON.stringify(o));"""], cwd=HERE))
S["coverage"] = cov
json.dump(S, open(HERE / "stats.json", "w"), indent=1, ensure_ascii=False)

# ---------- figures ----------
def save(fig, name): fig.tight_layout(); fig.savefig(FIG / name, dpi=200); plt.close(fig)

fig, ax = plt.subplots(figsize=(6.4, 3.6))
xs = [x["level"] for x in st]; ys = [x["acc"] * 100 for x in st]
ax.errorbar(xs, ys, yerr=[[ max(0, x["acc"] - x["lo"]) * 100 for x in st], [max(0, x["hi"] - x["acc"]) * 100 for x in st]], color=RED, marker="o", capsize=4, lw=2)
for x, y in zip(xs, ys): ax.annotate(f"{y:.1f}%", (x, y), textcoords="offset points", xytext=(0, 8), ha="center", color=DARK)
ax.axhline(90, ls="--", color=MID, lw=1); ax.text(0.5, 90.6, "90% target", color=MID, fontsize=9)
ax.set_xlabel("Pose-noise multiplier (1 = expected camera noise)"); ax.set_ylabel("Top-1 accuracy (%)"); ax.set_ylim(80, 102); ax.set_xticks(xs)
ax.set_title("Static letters (24 classes, n = 960 per level)", fontsize=11)
save(fig, "fig_static.png")

fig, ax = plt.subplots(figsize=(7.2, 3.8))
names = [m["sign"] for m in mv]; vals = [m["rate"] * 100 for m in mv]
ax.bar(range(len(mv)), vals, color=[MID if m["two"] else RED for m in mv])
ax.errorbar(range(len(mv)), vals, yerr=[[max(0, m["rate"] - m["lo"]) * 100 for m in mv], [max(0, m["hi"] - m["rate"]) * 100 for m in mv]], fmt="none", ecolor=DARK, capsize=2, lw=1)
ax.set_xticks(range(len(mv))); ax.set_xticklabels(names, rotation=50, ha="right", fontsize=9); ax.set_ylabel("Detected (%)"); ax.set_ylim(0, 105)
ax.set_title("Moving (dark) and two-handed (light) signs, 30 trials each", fontsize=11)
save(fig, "fig_moving.png")

fig, ax = plt.subplots(figsize=(7.2, 3.8))
gs = [g for g in S["braille"] if g["group"] != "All photos"]
ax.barh(range(len(gs)), [g["exact"] * 100 for g in gs], color=RED)
for i, g in enumerate(gs): ax.text(g["exact"] * 100 + 1, i, f"{g['exact']*100:.0f}% exact · CER {g['cer']*100:.1f}%", va="center", fontsize=8.5, color=DARK)
ax.set_yticks(range(len(gs))); ax.set_yticklabels([g["group"] for g in gs], fontsize=9); ax.invert_yaxis(); ax.set_xlim(0, 118); ax.set_xlabel("Photos read exactly (%)")
ax.set_title("Braille reader on 300 generated photos", fontsize=11)
save(fig, "fig_braille.png")

fig, ax = plt.subplots(figsize=(7.2, 3.2))
Ls = sorted(per); ax.bar(range(len(Ls)), [per[l][1] / per[l][0] * 100 for l in Ls], color=PINK, label="hand found")
ax.bar(range(len(Ls)), [per[l][2] / per[l][0] * 100 for l in Ls], color=RED, label="letter correct")
ax.set_xticks(range(len(Ls))); ax.set_xticklabels(Ls); ax.set_ylabel("% of 12 images"); ax.legend(frameon=False, fontsize=9, loc="lower right")
ax.set_title("Full camera path on rendered hands (3 skin tones × 2 hands × 2 tilts)", fontsize=11)
save(fig, "fig_camera.png")

# system diagram
fig, ax = plt.subplots(figsize=(8, 4.2)); ax.axis("off"); ax.set_xlim(0, 100); ax.set_ylim(0, 52)
def box(x, y, w, h, t, fc="white", tc=DARK, bold=False):
    ax.add_patch(plt.Rectangle((x, y), w, h, fc=fc, ec=RED, lw=1.4)); ax.text(x + w / 2, y + h / 2, t, ha="center", va="center", fontsize=8.6, color=tc, wrap=True, weight="bold" if bold else "normal")
def arr(x1, y1, x2, y2): ax.annotate("", (x2, y2), (x1, y1), arrowprops=dict(arrowstyle="->", color=RED, lw=1.4))
box(1, 38, 18, 10, "Camera\n(hands)", RED, "white", True); box(1, 22, 18, 10, "Camera / photo\n(braille)", RED, "white", True); box(1, 6, 18, 10, "Keyboard /\nmicrophone", RED, "white", True)
box(25, 38, 22, 10, "MediaPipe hand\nlandmarks (21 points)"); box(52, 38, 22, 10, "Palm-frame features\n+ nearest example\n+ movement rules")
box(25, 22, 22, 10, "Local contrast,\ndot blobs, skew"); box(52, 22, 22, 10, "Grid fit (pitch, cell)\n+ Grade 1 decoding")
box(25, 6, 22, 10, "Phrase / word index\n(EN · FIL · BIK)"); box(52, 6, 22, 10, "Kinematic avatar\n(FK + FABRIK thumb)")
box(80, 30, 19, 12, "Text in EN / FIL / BIK\n+ read aloud (on/off)", "#F9ECEC", RED, True); box(80, 8, 19, 12, "Signing avatar\n+ braille text", "#F9ECEC", RED, True)
for y in (43, 27, 11): arr(19, y, 25, y); arr(47, y, 52, y)
arr(74, 43, 80, 37); arr(74, 27, 80, 35); arr(74, 11, 80, 14)
save(fig, "fig_system.png")
print(json.dumps({k: S[k] for k in ("H1", "H2", "H3", "movingAll", "mediapipe", "timing", "coverage")}, indent=1, default=str))

# ---------- extended analyses ----------
PL = R["perLetter"]; M = PL["matrix"]; Ls = sorted(M)
S["perLetter"] = {L: M[L].get(L, 0) / PL["perClass"] for L in Ls}
S["ablation"] = R["ablation"]
S["words"] = R["words"]
S["custom"] = R["custom"]
S["brailleAblation"] = B["brailleAblation"]
U = json.load(open(HERE / "results_ui.json"))
S["ui"] = [{"name": x["name"], "w": x["w"], "h": x["h"], "layout": x["layout"], "overflow": max(v["overflowX"] for v in x["views"].values()),
            "small": sum(v["smallTargets"] for v in x["views"].values()), "loadMs": x["loadMs"], "errors": len(x["errors"])} for x in U]

def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
def ratio(a, b): la, lb = sorted([lum(a), lum(b)], reverse=True); return (la + 0.05) / (lb + 0.05)
PAIRS = [("Light: body text on page", "#0B1630", "#F4F7FC"), ("Light: muted text on card", "#5B6880", "#FFFFFF"), ("Light: button text on blue", "#FFFFFF", "#0E5BD8"),
         ("Dark: body text on page", "#E8EEF9", "#0B1220"), ("Dark: muted text on card", "#9AA8C0", "#131C2E"), ("Dark: button text on blue", "#06101F", "#5B9BFF"),
         ("Camera caption on glass", "#FFFFFF", "#2A3550")]
S["contrast"] = [{"pair": n, "ratio": ratio(a, b)} for n, a, b in PAIRS]
json.dump(S, open(HERE / "stats.json", "w"), indent=1, ensure_ascii=False)

import numpy as np
fig, ax = plt.subplots(figsize=(6.6, 6.0))
labs = Ls + ["-"]
A = np.array([[M[a].get(b, 0) for b in labs] for a in Ls], float) / PL["perClass"]
ax.imshow(A, cmap="Reds", vmin=0, vmax=1)
ax.set_xticks(range(len(labs))); ax.set_xticklabels(labs, fontsize=8); ax.set_yticks(range(len(Ls))); ax.set_yticklabels(Ls, fontsize=8)
for i in range(len(Ls)):
    for j in range(len(labs)):
        if A[i, j] >= 0.05: ax.text(j, i, f"{A[i, j]*100:.0f}", ha="center", va="center", fontsize=6, color="white" if A[i, j] > 0.5 else DARK)
ax.set_xlabel("Recognised as"); ax.set_ylabel("Signed letter"); ax.set_title(f"Confusion matrix at 1.5× noise ({PL['perClass']} hands per letter, %)", fontsize=10)
save(fig, "fig_confusion.png")

fig, ax = plt.subplots(figsize=(6.6, 3.0))
ab = list(R["ablation"].items())
ax.barh(range(len(ab)), [v["accuracy"] * 100 for _, v in ab], color=[RED] + [MID] * (len(ab) - 1))
for i, (_, v) in enumerate(ab): ax.text(v["accuracy"] * 100 + 0.5, i, f"{v['accuracy']*100:.1f}%", va="center", fontsize=9)
ax.set_yticks(range(len(ab))); ax.set_yticklabels([k for k, _ in ab], fontsize=9); ax.invert_yaxis(); ax.set_xlim(60, 104); ax.set_xlabel("Accuracy (%) at 1.5× noise, 15% wrong hand labels")
ax.set_title("Ablation: removing one part of the feature design", fontsize=10)
save(fig, "fig_ablation.png")

fig, ax = plt.subplots(figsize=(5.4, 3.4))
holds = sorted({w["holdMs"] for w in R["words"]}); sig = sorted({w["signerMs"] for w in R["words"]})
G = np.array([[[w for w in R["words"] if w["holdMs"] == h and w["signerMs"] == s][0]["wordAccuracy"] for s in sig] for h in holds])
ax.imshow(G, cmap="Reds", vmin=0, vmax=1)
for i in range(len(holds)):
    for j in range(len(sig)): ax.text(j, i, f"{G[i, j]*100:.0f}%", ha="center", va="center", color="white" if G[i, j] > 0.55 else DARK, fontsize=10)
ax.set_xticks(range(len(sig))); ax.set_xticklabels([f"{s} ms" for s in sig]); ax.set_yticks(range(len(holds))); ax.set_yticklabels([f"{h} ms" for h in holds])
ax.set_xlabel("How long the signer holds each letter"); ax.set_ylabel("App hold time"); ax.set_title("Fingerspelled words read exactly (40 words each)", fontsize=10)
save(fig, "fig_words.png")
print("extended ok")
