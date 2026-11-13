"""Content of the SENYAS NSTF paper, second edition (app version 1.2): the first edition plus the nature scan and device adaptation.
Every new number is computed from research/code/results_species.json. Tables, figures and sections are renumbered automatically."""
import json, re, pathlib, collections
import content as C
from content import wilson, sf, pv, FIG, B, APPENDIX

R = json.load(open(pathlib.Path(__file__).resolve().parent.parent / "code" / "results_species.json"))["rows"]
CLS = ["daisy", "dandelion", "sunflowers", "roses", "tulips"]
NICE = {"daisy": "Daisy", "dandelion": "Dandelion", "sunflowers": "Sunflower", "roses": "Garden rose", "tulips": "Tulip"}
INLIST = ["daisy", "dandelion", "sunflowers"]
pc = lambda k, n: f"{100 * k / n:.1f}%"
def cnt(cls, mode, key): return sum(1 for r in R if r["cls"] in cls and r[mode].get(key))
def ci(k, n): lo, hi = wilson(k, n); return f"{100 * lo:.1f}–{100 * hi:.1f}%"
n_in = sum(1 for r in R if r["cls"] in INLIST); n_cls = n_in // 3
a1, p1, a3, p3 = cnt(INLIST, "auto", "top1"), cnt(INLIST, "plant", "top1"), cnt(INLIST, "auto", "top3"), cnt(INLIST, "plant", "top3")
a_none, p_none = cnt(INLIST, "auto", "none"), cnt(INLIST, "plant", "none")
a_wrong = n_in - a1 - a_none
p_h7 = sf(p1, n_in, 0.5)
ms = sorted(r["ms"] for r in R); MED = ms[len(ms) // 2]
rose1, tul1 = cnt(["roses"], "plant", "top1"), cnt(["tulips"], "plant", "top1")
tul_none_auto = cnt(["tulips"], "auto", "none"); rose_none_auto = cnt(["roses"], "auto", "none")
# McNemar exact test, Auto against Plant mode on the same photos
b_ = sum(1 for r in R if r["cls"] in INLIST and r["plant"]["top1"] and not r["auto"]["top1"])
c_ = sum(1 for r in R if r["cls"] in INLIST and r["auto"]["top1"] and not r["plant"]["top1"])
p_mc = min(1.0, 2 * sf(max(b_, c_), b_ + c_, 0.5))

# ---------- figure ----------
def figure():
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(7.2, 3.6), dpi=200); w = 0.38
    for j, (mode, col, lab) in enumerate((("auto", "#9aa5b1", "Auto mode"), ("plant", "#8B0707", "Plant mode"))):
        ks = [cnt([c], mode, "top1") for c in CLS]; ys = [100 * k / n_cls for k in ks]
        err = [[y - 100 * wilson(k, n_cls)[0] for k, y in zip(ks, ys)], [100 * wilson(k, n_cls)[1] - y for k, y in zip(ks, ys)]]
        ax.bar([i + (j - 0.5) * w for i in range(5)], ys, w, yerr=err, capsize=3, color=col, label=lab)
    ax.set_xticks(range(5)); ax.set_xticklabels([NICE[c] + ("" if c in INLIST else "\n(unlisted)") for c in CLS], fontsize=8)
    ax.set_ylabel("Correct genus, top answer (%)"); ax.set_ylim(0, 100); ax.legend(frameon=False); ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout(); fig.savefig(pathlib.Path(__file__).resolve().parent.parent / "figures" / "fig_species.png"); plt.close(fig)
figure()

TITLE = ("SENYAS: An Offline Intelligent System for Trilingual Sign Language and Braille Translation and for Naming Plants and Animals "
         "in Speech, Sign and Braille")
CATEGORY, RESEARCHERS, ADVISER, SCHOOL, ACK = C.CATEGORY, C.RESEARCHERS, C.ADVISER, C.SCHOOL, C.ACK
KEYWORDS = C.KEYWORDS + ", species identification, biodiversity, adaptive interface"
ABSTRACT = (
    "Deaf, blind and hearing Filipinos often cannot talk to one another without an interpreter, and the same people are left out when a guide, "
    "a book or an app names the plants and animals around them only in spoken or printed English. This study designed, built and evaluated "
    "SENYAS, an intelligent system that runs on an ordinary phone without a signal. It reads Filipino Sign Language fingerspelling and everyday "
    "signs through the camera and can say the words aloud; an avatar signs typed or spoken English, Filipino and Bikol; braille is read from a "
    "photo or the live camera; and one photo of a plant or an animal is named in speech, in sign and in braille. Signs are recognised with a "
    "kinematic hand model, palm-frame geometry and movement rules instead of a video dataset; braille is read by fitting dots to a grid; and "
    "species are named by four small on-device models, in which a general model decides whether a plant, bird or insect specialist may answer. "
    "In repeatable experiments, static letters were named with 99.0% accuracy at expected noise, 570 of 570 moving-sign trials were detected "
    "with no false alarms, 89.2% of fingerspelled words and 81.7% of 300 braille photos were read exactly, and each camera frame took 71 ms. "
    f"On {n_in} photographs of three listed flowers, the nature scan named the correct genus in {pc(a1, n_in)} of photos when it had to decide "
    f"by itself what the subject was and in {pc(p1, n_in)} when the user said it was a plant (McNemar p {pv(p_mc)}); cultivated roses and "
    f"tulips, which are not listed wild species, were almost never named, which marks the limit of an offline list. The interface detected all "
    "five app and device profiles and passed 171 automated checks. SENYAS shows that one offline tool can serve communication and nature "
    "learning for Deaf, blind and hearing users in their own language.")

rec = lambda *b: b
INS = collections.defaultdict(list)   # original index in B -> blocks placed before it
def at(i, *blocks): INS[i].extend(blocks)

# ---------- Chapter 1 ----------
at(6, ("p", "Communication is not the only place where a Deaf or blind learner is left behind. The Philippines is one of the seventeen megadiverse "
    "countries (Mittermeier et al., 1997), and Albay alone has forests, mangroves, rice fields and the slopes of Mayon within a short ride of "
    "any school. Yet the name of a tree in a schoolyard usually reaches a learner through a teacher's voice, a printed label or an English "
    "field guide. A Deaf learner has no sign offered for it, a blind learner has no braille label, and a learner who thinks in Bikol has no "
    "local word. Phone apps that name species from a photo have become accurate (Wäldchen & Mäder, 2018), but they answer on a screen, in "
    "English, and most need the internet, which many barangays and field sites do not have."),
   ("p", "The second edition of SENYAS therefore adds a nature scan to the translator. The reasoning is simple: a device that already turns a "
    "word into speech, into signing and into braille can do the same for the name of a living thing, if it can first find that name from a "
    "photo. The addition also had to respect the rule that shaped the first edition: everything must run on the phone itself. This paper "
    "reports the whole system, with the first edition's experiments unchanged and two new experiments for the new parts."))
at(9, ("p", "For version 1.2, two further questions were asked:"),
   ("n", ["How often does an offline nature scan built from four small models name the correct genus of a photographed flower, when it must "
          "decide by itself what the subject is and when the user states that it is a plant, and what happens with flowers outside its list?",
          "Does the interface detect the app it runs in (Android app, iPhone or iPad app, installed app or browser) and the kind of device "
          "(phone, tablet, computer or television) and change its layout and controls to suit?"]))
at(21, ("p", "Version 1.2 extends the scope to a nature scan and to device adaptation. The scan names, without a connection, 2,101 plants, "
    "964 birds, 1,021 insects and about 400 other kinds of animals from one or several photos, and gives the name in English with the kind of "
    "living thing in Filipino or Bikol; 22 animal and plant signs were added to the lexicon, which now holds 125 words. The offline lists are "
    "fixed and were trained mostly on wild species photographed by volunteers, so garden varieties and many Philippine endemics are absent; "
    "an optional online service for plants is described but was not evaluated. The nature scan was tested on flowers only, on photographs "
    "from a public data set, and not in the field. No living organism was collected, handled or harmed in this study."))

# ---------- Chapter 2 ----------
at(38, ("h2", "2.N1 Recognising Species from Photographs"),
   ("p", "Naming a species from a photo is a fine-grained recognition problem: the classes look alike, and the photos of one class differ in "
    "part, season and distance. Progress came from large labelled collections. ImageNet (Deng et al., 2009) covers 1,000 everyday classes, "
    "among them about 400 kinds of animals but few plants. The iNaturalist data set (Van Horn et al., 2018) gathered photographs taken by "
    "volunteers of thousands of species and showed that accuracy falls for species with few pictures. Networks designed for phones, such as "
    "MobileNetV2 (Sandler et al., 2018) and EfficientNet (Tan & Le, 2019), made it possible to run such classifiers on a handset. Pl@ntNet "
    "(Joly et al., 2016) built a citizen-science service that names plants from photos of a leaf, flower, fruit or bark and now covers tens "
    "of thousands of species, but it works through a server. Wäldchen and Mäder (2018) reviewed the field and noted two lasting problems: "
    "a model can only answer with a species it was trained on, and it answers even when the photo shows something else."),
   ("p", "Two ideas from pattern recognition address those problems. Guo et al. (2017) showed that the confidence a network reports is often "
    "higher than its real accuracy, so a system should not trust a single score. Kittler et al. (1998) showed that averaging the outputs of "
    "several classifiers, the sum rule, is a robust way to combine evidence. SENYAS uses both: a general model must agree that a living thing "
    "of the right kind is present before a specialist's answer is accepted, and several photos of the same organism are combined by averaging."),
   ("h2", "2.N2 Access to Nature Learning"),
   ("p", "Science lessons about living things lean on sight and hearing at once: the teacher points and names. For Deaf learners the name "
    "must be fingerspelled or signed, and many species have no established sign, so the general sign (bird, tree, flower) and fingerspelling "
    "carry the meaning. For blind learners the name must be spoken or brailled. Universal Design for Learning asks that the same content be "
    "offered through more than one channel, and Republic Act No. 11106 requires FSL in education. No published tool was found that names a "
    "photographed species through speech, sign language and braille together, or that does so in Filipino or Bikol."))
at(42, ("p", "The same gap appears in species recognition: accurate models exist, but their answers are locked to a screen, to English and often "
    "to a connection. This study joins the two lines of work, so that one offline system serves both everyday communication and learning the "
    "names of living things."))

# ---------- Chapter 3 ----------
at(87, ("h3", "3.4.10 The nature scan"),
   ("p", "The scan uses four image classifiers stored with the app and run by MediaPipe Tasks Vision on the device: a general model "
    "(EfficientNet-Lite0, 1,000 ImageNet classes) and three specialists (MobileNetV2 trained on iNaturalist photographs) for 2,101 plants, "
    "964 birds and 1,021 insects. Each specialist also has a background class for photos that show none of its species. A specialist asked "
    "about a photo outside its field still returns some species, so the general model acts as a gate. Its 1,000 classes were sorted once into "
    "plant, bird, insect, other animal and not living. For a photo, the scores of each group are added; the leading living group is accepted "
    "as the gate if its sum is at least 0.18 and at least 0.6 times the strongest not-living score."),
   ("p", "In Auto mode, if the gate is plant, bird or insect, that specialist's best species is given when its score is at least 0.30 and "
    "above its background score; otherwise the general model's class name is given (for example, daisy), or the specialist's guess marked "
    "Not sure. If the gate is other animal, the general model answers. If there is no gate, a specialist is believed only when it is very "
    "sure (0.35 for plants, 0.60 for birds and insects); otherwise SENYAS says that it sees no plant or animal. A leaf, a piece of bark or a "
    "root seldom looks like a plant to the general model, so the user may say what the subject is (Plant, Bird, Insect or Other animal); the "
    "chosen specialist then answers whenever its score reaches 0.02, with up to three other candidates that the user can tap."),
   ("p", "Up to five photos of the same organism (leaf, flower, bark, whole tree) can be combined: the scores of each model are averaged "
    "before the decision. The result is spoken, signed by the avatar with the sign of its kind followed by fingerspelling, and written in "
    "braille. In Filipino and Bikol the kind is given first (Ibon, Gamgam for bird) and common plants have local names (Mirasol for "
    "sunflower). When the phone is online, More info fetches a short description from Wikipedia by the species name alone. An optional mode, "
    "off by default, sends a plant photo to the Pl@ntNet service with the user's own key; it was not part of the experiments."),
   ("code", "Algorithm N1. Naming a photo in Auto mode", [
       "g ← general model scores; p, b, i ← plant, bird and insect specialist scores",
       "S[k] ← sum of g over classes of kind k ∈ {plant, bird, insect, animal}; D ← largest g of a not-living class",
       "gate ← argmax S; if S[gate] < 0.18 or S[gate] < 0.6 D: gate ← none",
       "if gate = animal: answer with the general model's class",
       "if gate ∈ {plant, bird, insect}: t ← best species of that specialist",
       "    if t ≥ 0.30 and t ≥ background: answer t; else answer the general class or t marked Not sure",
       "if gate = none: answer only if a specialist's best ≥ 0.35 (plant) or 0.60 (bird, insect) and above background; else say none",
       "several photos: average each model's scores first"]),
   ("h3", "3.4.11 Adapting to the app and the device"),
   ("p", "At start, SENYAS works out where it is running from the user-agent string set by its Android and iOS shells, the display mode of an "
    "installed web app, the screen size, and whether the main pointer is a finger or a mouse. It stores three labels on the page: the app "
    "(android, ios, pwa or browser), the form (phone, tablet, desktop or tv) and the input (touch or mouse). Style rules keyed to these labels "
    "choose bottom tabs or a side rail, show keyboard hints only with a mouse, enlarge the focus ring on a television, and offer to install "
    "only in a browser. The layout also follows the device's own dark mode, text size, contrast and reduced-motion settings."))
at(90, ("p", "For E10, the photographs came from the public TensorFlow flower collection (The TensorFlow Team, 2019), which holds 3,670 "
    f"licensed photos in five folders. The files of each folder were sorted by name and every k-th file was taken to give {n_cls} per class, "
    "so the sample does not depend on chance or on choice. Daisy, dandelion and sunflower are in the plant list of SENYAS; the cultivated "
    "roses of the collection are mostly garden hybrids, of which the list has only wild relatives, and tulips are not in the list at all. "
    "These two classes show what the scan does with a plant it does not know. Each photo was passed once through the four models inside the "
    "app in a browser, and the decision was taken in Auto mode and in Plant mode from the same scores. An answer was counted correct when its "
    "genus matched (Bellis or Leucanthemum for daisy, Taraxacum, Helianthus, Rosa, Tulipa) or when the general model gave the plain class "
    "name. For E11, the app was opened under five profiles that imitate an Android app on a phone, an iPad app, a phone browser, a laptop "
    "browser and a smart television, and the labels and visible controls were read back."))
at(92, ("p", "For E10, the two modes were compared on the same photos with the exact McNemar test, which uses only the photos where one mode "
    "was right and the other wrong. H₀7 was tested with a one-sided exact binomial test. The script is bench_species.js; the adaptation "
    "checks are in tests/app.test.js."))

# ---------- Chapter 4 ----------
def row(c):
    return [NICE[c], "yes" if c in INLIST else "no", f"{cnt([c], 'auto', 'top1')} ({pc(cnt([c], 'auto', 'top1'), n_cls)})", str(cnt([c], "auto", "none")),
            f"{cnt([c], 'plant', 'top1')} ({pc(cnt([c], 'plant', 'top1'), n_cls)})", f"{cnt([c], 'plant', 'top3')} ({pc(cnt([c], 'plant', 'top3'), n_cls)})"]
def common_wrong(cls, mode, k=3):
    cc = collections.Counter(r[mode]["label"] for r in R if r["cls"] == cls and not r[mode]["top1"] and r[mode]["label"])
    return "; ".join(f"{re.sub(r' [A-Z][a-z]+ [a-z-]+.*$', '', l) or l} ({n})" for l, n in cc.most_common(k)) or "none"
at(136, ("h2", "4.N1 Nature Scan (E10)"),
   ("fgrow", [FIG + "shot-phone-7nature.png", FIG + "shot-tablet-7nature.png"], "Figure N1. The nature scan: a sunflower named in Bikol on a phone, and a bird named on a tablet, each with the avatar, braille and other candidates"),
   ("t", f"Table N1. Nature scan on {len(R)} flower photographs ({n_cls} per class): photos with the correct genus",
    [["Flower", "In offline list", "Auto: correct", "Auto: no answer", "Plant mode: correct", "Plant mode: correct in top 3"]] + [row(c) for c in CLS] +
    [["Listed flowers together", "yes", f"{a1} of {n_in} ({pc(a1, n_in)})", str(a_none), f"{p1} of {n_in} ({pc(p1, n_in)})", f"{p3} of {n_in} ({pc(p3, n_in)})"]],
    [1.5, 0.8, 1.1, 0.9, 1.1, 1.1]),
   ("f", FIG + "fig_species.png", "Figure N2. Correct top answers by flower and mode, with 95% Wilson intervals", 6.0),
   ("p", f"For the three listed flowers, Auto mode gave the correct genus for {a1} of {n_in} photos ({pc(a1, n_in)}; 95% CI {ci(a1, n_in)}), gave "
    f"no answer for {a_none} and a wrong name for {a_wrong}. When the user stated that the subject was a plant, {p1} of {n_in} were correct "
    f"({pc(p1, n_in)}; 95% CI {ci(p1, n_in)}), and the correct genus was among the top three answers for {p3} ({pc(p3, n_in)}). Plant mode was "
    f"right where Auto was wrong on {b_} photos and the reverse happened on {c_}, a difference that the exact McNemar test finds "
    f"{'significant' if p_mc < 0.05 else 'not significant'} (p {pv(p_mc)}). H₀7, that Plant-mode accuracy on listed flowers is at most 50%, "
    f"was {'rejected' if p_h7 < 0.05 else 'not rejected'} (p {pv(p_h7)})."),
   ("p", f"The gain was not even. Dandelions rose from {cnt(['dandelion'], 'auto', 'top1')} to {cnt(['dandelion'], 'plant', 'top1')} of {n_cls}: many "
    "dandelion photos show the round white seed head, which the general model took for something that is not a plant "
    f"(its most frequent wrong answers were: {common_wrong('dandelion', 'auto')}), so the gate never opened; once the user said plant, the "
    f"specialist named it. Daisies moved the other way, from {cnt(['daisy'], 'auto', 'top1')} to {cnt(['daisy'], 'plant', 'top1')}, because in "
    "Auto mode the general model's own daisy class rescues photos on which the specialist prefers a look-alike species. The two routes "
    "therefore fail on different photos, and offering the other candidates, as the app does, recovers part of the loss."),
   ("p", f"The two unlisted classes show the limit plainly. Only {rose1} of {n_cls} garden roses and {tul1} of {n_cls} tulips received the right "
    f"genus in Plant mode. In Auto mode SENYAS gave no answer for {rose_none_auto} roses and {tul_none_auto} tulips, which is the better "
    "behaviour for an unknown plant, but for the rest it offered a wrong name "
    f"(roses: {common_wrong('roses', 'auto')}; tulips: {common_wrong('tulips', 'auto')}). An offline list cannot name what it does not "
    "contain, and its confidence does not reliably warn the user, in line with Guo et al. (2017) and Wäldchen and Mäder (2018). For this "
    "reason the app marks weak answers Not sure, lets the user choose another candidate, and offers the optional online plant service for "
    "wider coverage. One scan, all four models together, took a median of "
    f"{MED:.0f} ms on the test computer's processor."),
   ("h2", "4.N2 Adapting to the App and the Device (E11)"),
   ("t", "Table N2. Detection of the app and device under five profiles",
    [["Profile", "Screen (px)", "App detected", "Form", "Input", "Navigation", "Keyboard hints", "Install offer"],
     ["Android app on a phone", "390×844", "android", "phone", "touch", "bottom tabs", "hidden", "hidden"],
     ["iPad app", "820×1180", "ios", "tablet", "touch", "side rail", "hidden", "hidden"],
     ["Browser on a phone", "390×844", "browser", "phone", "touch", "bottom tabs", "hidden", "allowed"],
     ["Browser on a laptop", "1366×768", "browser", "desktop", "mouse", "side rail", "shown", "allowed"],
     ["Smart television", "1920×1080", "browser", "tv", "mouse", "side rail", "shown", "allowed"]], [1.6, 0.8, 0.7, 0.6, 0.6, 0.9, 0.7, 0.7]),
   ("p", "All five profiles were detected correctly and each was named in Settings, so H₀8 was rejected. Turning the phone sideways switched "
    "the bottom tabs to the side rail, and the page followed the device's dark mode, reduced-motion and text-size settings. Together with the "
    "eleven screen sizes of E9, this shows one code base that changes its form to the device instead of separate apps."),
   ("p", "The whole app is also covered by a functional test that opens the website and the app in a browser engine and tries every feature: "
    "consent, translation both ways, speech with and without a Filipino voice, the braille reader and writer, the nature scan in each mode, "
    "lessons and quizzes, import and export, offline use and the security policy. All 171 checks pass on version 1.2."))
at(140, ("p", "The nature scan was tested on flowers only, with photographs taken mostly in gardens and fields abroad; birds, insects, leaves, "
    "bark and Philippine species still need a test set, ideally photographed in Albay. Accuracy was judged at the level of the genus. The "
    "offline lists hold about 4,500 kinds of living things, a small part of the species known to science, and they cannot be extended "
    "without training. The device profiles of E11 were imitated in a browser engine, not run on physical phones, tablets and televisions."))

# ---------- edits to existing blocks ----------
def edit(i, f): B[i] = f(B[i])
edit(11, lambda b: (b[0], b[1], b[2] + [["H₀7", "With the subject stated as a plant, the nature scan names the correct genus of listed flowers in at most 50% of photos.", "One-sided exact binomial test"],
                                        ["H₀8", "The interface fails to detect the app or the device in at least one of five profiles.", "Automated profile test"]], b[3]))
edit(51, lambda b: (b[0], b[1], b[2] + [["Image classifiers", "EfficientNet-Lite0 (ImageNet) and three MobileNetV2 models (iNaturalist plants, birds, insects), Apache-2.0", "Nature scan on the device"],
                                        ["Flower photographs", "TensorFlow flower collection, 3,670 licensed photos in five classes", "Test set of E10"]], b[3]))
edit(88, lambda b: (b[0], b[1].replace("nine", "eleven"), b[2] + [["E10", "Nature scan", f"{len(R)} flower photos, {n_cls} per class: three listed and two unlisted flowers; Auto and Plant mode", "Correct genus, no-answer count, time"],
                                                                  ["E11", "Device adaptation", "Five app and device profiles; device settings", "Labels and controls shown"]], b[3]))
edit(137, lambda b: (b[0], b[1], b[2] + [["H₀7 plant-mode accuracy ≤ 50%", f"{pc(p1, n_in)}, p {pv(p_h7)}", "Rejected" if p_h7 < 0.05 else "Not rejected"],
                                         ["H₀8 a profile is not detected", "5 of 5 profiles detected", "Rejected"]], b[3]))
edit(142, lambda b: (b[0], b[1] + [f"Four small models, with a general model acting as a gate, named the correct genus of listed flowers in {pc(a1, n_in)} of photos unaided and "
                                   f"in {pc(p1, n_in)} when the user said the subject was a plant, entirely on the device, and gave each name in speech, sign and braille. "
                                   "Flowers outside the list were almost never named, so the offline list, not the method, sets the limit.",
                                   "The interface detected every app and device profile tested and changed its navigation and controls to suit, and the complete app passed 171 automated checks."]))
edit(143, lambda b: ("p", "Overall, the study shows that an intelligent machine built on kinematics, geometry and a few small models can give Deaf, blind and "
                          "hearing people one offline, trilingual aid for talking with one another and for learning the names of living things, and that "
                          "its behaviour, including its limits, can be measured and improved."))
edit(145, lambda b: (b[0], b[1] + ["Build a labelled set of photographs of Albay's plants, birds and insects, by part (leaf, flower, fruit, bark), with the help of biology "
                                   "teachers and the Department of Environment and Natural Resources, and use it to test and retrain the plant model for local and endemic species.",
                                   "Work with Deaf signers and FSL teachers to collect or agree on signs for common local species, and with blind learners to test the spoken and braille output outdoors.",
                                   "Evaluate the optional online plant service against the offline models, and study how the scan could report sightings to biodiversity monitoring with the user's consent."]))
for i, b in enumerate(B):   # the first edition called itself a set of nine experiments
    if b[0] == "p": B[i] = ("p", b[1].replace("nine experiments", "eleven experiments").replace("nine repeatable", "eleven repeatable"))

for i in sorted(INS, reverse=True): B[i:i] = INS[i]

# ---------- renumber tables, figures and sections ----------
tmap, smap, tn, fn, ch, sn = {}, {}, 0, 0, 0, 0
for i, b in enumerate(B):
    cap_i = {"t": 1, "f": 2, "fgrow": 2}.get(b[0])
    if cap_i:
        m = re.match(r"(Table|Figure) (\w+)\.", b[cap_i])
        if m.group(1) == "Table": tn += 1; tmap[m.group(0)[:-1]] = f"Table {tn}"
        else: fn += 1; tmap[m.group(0)[:-1]] = f"Figure {fn}"
    elif b[0] == "h1": ch += 1; sn = 0
    elif b[0] == "h2":
        m = re.match(r"(\d+\.\w+) ", b[1]); sn += 1; smap[m.group(1)] = f"{ch}.{sn}"
def fix(x):
    if isinstance(x, str):
        x = re.sub(r"\b(Table|Figure) (N?\d+)\b", lambda m: tmap.get(m.group(0), m.group(0)), x)
        return re.sub(r"\bSection (\d+\.\w+)(\.\d+)?", lambda m: "Section " + smap.get(m.group(1), m.group(1)) + (m.group(2) or ""), x)
    if isinstance(x, (list, tuple)): return type(x)(fix(y) for y in x)
    return x
for i, b in enumerate(B):
    if b[0] == "h2": m = re.match(r"(\d+\.\w+) ", b[1]); b = ("h2", smap[m.group(1)] + b[1][m.end() - 1:])
    elif b[0] == "h3" and b[1].startswith("3.4."): pass
    B[i] = fix(b) if b[0] != "h2" else b

REFERENCES = sorted(set(C.REFERENCES + [
    "Deng, J., Dong, W., Socher, R., Li, L.-J., Li, K., & Fei-Fei, L. (2009). ImageNet: A large-scale hierarchical image database. In 2009 IEEE Conference on Computer Vision and Pattern Recognition (pp. 248–255). IEEE.",
    "Guo, C., Pleiss, G., Sun, Y., & Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning, PMLR 70, 1321–1330.",
    "Joly, A., Bonnet, P., Goëau, H., Barbe, J., Selmi, S., Champ, J., Dufour-Kowalski, S., Affouard, A., Carré, J., Molino, J.-F., Boujemaa, N., & Barthélémy, D. (2016). A look inside the Pl@ntNet experience. Multimedia Systems, 22(6), 751–766.",
    "Kittler, J., Hatef, M., Duin, R. P. W., & Matas, J. (1998). On combining classifiers. IEEE Transactions on Pattern Analysis and Machine Intelligence, 20(3), 226–239.",
    "McNemar, Q. (1947). Note on the sampling error of the difference between correlated proportions or percentages. Psychometrika, 12(2), 153–157.",
    "Mittermeier, R. A., Robles Gil, P., & Mittermeier, C. G. (1997). Megadiversity: Earth's biologically wealthiest nations. CEMEX.",
    "Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., & Chen, L.-C. (2018). MobileNetV2: Inverted residuals and linear bottlenecks. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (pp. 4510–4520).",
    "Tan, M., & Le, Q. V. (2019). EfficientNet: Rethinking model scaling for convolutional neural networks. Proceedings of the 36th International Conference on Machine Learning, PMLR 97, 6105–6114.",
    "The TensorFlow Team. (2019). Flowers [Data set]. http://download.tensorflow.org/example_images/flower_photos.tgz",
    "Van Horn, G., Mac Aodha, O., Song, Y., Cui, Y., Sun, C., Shepard, A., Adam, H., Perona, P., & Belongie, S. (2018). The iNaturalist species classification and detection dataset. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (pp. 8769–8778).",
    "Wäldchen, J., & Mäder, P. (2018). Machine learning for image based species identification. Methods in Ecology and Evolution, 9(11), 2216–2225.",
]), key=lambda s: s.lower())

APPENDIX += [
    ("h2", "Appendix I. Using the nature scan"),
    ("n", ["Open Translate and choose Nature. Take a photo, or choose one from the phone.",
           "If the photo shows only a part (a leaf, bark, a fruit), choose Plant, Bird, Insect or Other animal so that the right list answers.",
           "Add more photos of the same plant or animal to combine them; tap another candidate if it fits better.",
           "Choose English, Filipino or Bikol. Press Say to hear the name, Sign to watch the avatar, or Show big to fill the screen. The braille line can be copied.",
           "More info needs a connection. Online plant identification is off unless switched on in Settings with the user's own key."]),
    ("h2", "Appendix J. Second-edition data"),
    ("p", "The nature scan experiment is in research/code/bench_species.js with its per-photo results in results_species.json; the adaptation and "
          "functional checks are in tests/app.test.js; this edition of the paper is produced by research/paper/content_v2.py."),
]
