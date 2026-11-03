#!/usr/bin/env python3
"""SENYAS PR2 deck in the LegaSci PR2 template (red header, faded school photo, white boxes)."""
import copy, json, pathlib, sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE.parent / "paper"))
import content as C
S, pc = C.S, C.pc
FIG = HERE.parent / "figures"
TPL = HERE / "template" / "LegaSci_PR2_template.pptx"
RED, INK, CAP, LINE, PINK, ALT = "8B0707", "2B2020", "6A5656", "E3C9C9", "F8EAEA", "FBF3F3"
FONT = "ITC Avant Garde Gothic"
prs = Presentation(str(TPL))
SRC = list(prs.slides)
KEEP = {"Freeform 2", "Group 3", "TextBox 6", "Subtitle", "Slide number"}
n_slide = [0]


def clone(src, keep=None):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    for ph in list(s.placeholders): ph._element.getparent().remove(ph._element)
    rmap = {}
    for rId, rel in src.part.rels.items():
        if "image" in rel.reltype: rmap[rId] = s.part.relate_to(rel._target, rel.reltype)
    bg = src._element.cSld.find(qn("p:bg"))
    if bg is not None:
        nb = copy.deepcopy(bg); cs = s._element.cSld
        old = cs.find(qn("p:bg"))
        if old is not None: cs.remove(old)
        cs.insert(0, nb)
    for sh in src.shapes:
        if keep is not None and sh.name not in keep: continue
        el = copy.deepcopy(sh._element)
        for node in el.iter():
            for a in (qn("r:embed"), qn("r:link"), qn("r:id")):
                if node.get(a) in rmap: node.set(a, rmap[node.get(a)])
        s.shapes._spTree.append(el)
    return s


def set_text(shape, text):
    tf = shape.text_frame; p0 = tf.paragraphs[0]
    for p in tf.paragraphs[1:]: p._p.getparent().remove(p._p)
    runs = p0.runs
    for r in runs[1:]: r._r.getparent().remove(r._r)
    runs[0].text = text


def named(s, name): return [x for x in s.shapes if x.name == name][0]


def content_slide(title, sub=None):
    s = clone(SRC[1], KEEP); n_slide[0] += 1
    set_text(named(s, "TextBox 6"), title)
    if len(title) > 22: named(s, "TextBox 6").text_frame.paragraphs[0].runs[0].font.size = Pt(40)
    if sub: set_text(named(s, "Subtitle"), sub)
    else: named(s, "Subtitle")._element.getparent().remove(named(s, "Subtitle")._element)
    set_text(named(s, "Slide number"), str(n_slide[0] + 1))
    return s


def run(p, text, size, color=INK, bold=False):
    r = p.add_run(); r.text = text; f = r.font; f.size = Pt(size); f.bold = bold; f.name = FONT; f.color.rgb = RGBColor.from_string(color)
    return r


def text(s, x, y, w, h, paras, size=18, color=INK, align=PP_ALIGN.LEFT, bullet=False, gap=8):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = tb.text_frame; tf.word_wrap = True
    for i, item in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.alignment = align; p.space_after = Pt(gap)
        if isinstance(item, tuple): run(p, item[0] + " ", size, RED, True); run(p, item[1], size, color)
        else: run(p, ("•  " if bullet else "") + item, size, color)
    return tb


def box(s, x, y, w, h, fill="FFFFFF", line=LINE, shape=MSO_SHAPE.RECTANGLE):
    b = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    b.fill.solid(); b.fill.fore_color.rgb = RGBColor.from_string(fill)
    if line: b.line.color.rgb = RGBColor.from_string(line); b.line.width = Pt(1)
    else: b.line.fill.background()
    b.shadow.inherit = False
    return b


def label(s, x, y, w, h, t, size=18):
    b = box(s, x, y, w, h, RED, None); tf = b.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER; run(p, t, size, "FFFFFF", True)
    return b


def bar(s, y, t, h=1.0):
    box(s, 0.9, y, 18.2, h, PINK, LINE)
    text(s, 1.3, y + 0.12, 17.4, h - 0.2, [t], 17, RED).text_frame.paragraphs[0].runs[0].font.bold = True


def caption(s, x, y, w, t): text(s, x, y, w, 0.4, [t], 14, CAP)


def table(s, x, y, w, widths, rows, size=13, rh=0.42):
    t = s.shapes.add_table(len(rows), len(rows[0]), Inches(x), Inches(y), Inches(w), Inches(rh * len(rows))).table
    tot = sum(widths)
    for j, cw in enumerate(widths): t.columns[j].width = Inches(w * cw / tot)
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            c = t.cell(i, j); c.fill.solid(); c.fill.fore_color.rgb = RGBColor.from_string(RED if i == 0 else ("FFFFFF" if i % 2 else ALT))
            c.margin_left = c.margin_right = Inches(0.08); c.margin_top = c.margin_bottom = Inches(0.04)
            tf = c.text_frame; tf.word_wrap = True; p = tf.paragraphs[0]
            run(p, str(val), size, "FFFFFF" if i == 0 else (RED if j == 0 else INK), i == 0 or j == 0)
    return t


def arrow(s, x, y, w=0.9, h=0.6, shape=MSO_SHAPE.RIGHT_ARROW):
    a = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h)); a.fill.solid(); a.fill.fore_color.rgb = RGBColor.from_string(RED); a.line.fill.background()


def pic(s, path, x, y, w=None, h=None):
    return s.shapes.add_picture(str(path), Inches(x), Inches(y), Inches(w) if w else None, Inches(h) if h else None)


st, br, MA, TM, CU, W, UI = C.st, C.br, C.MA, C.TM, C.CU, C.W, C.UI

# 1. Title
s = clone(SRC[0]); set_text(named(s, "Research title"), C.TITLE)
named(s, "Research title").text_frame.paragraphs[0].runs[0].font.size = Pt(46)
set_text(named(s, "Researchers"), "\n".join(C.RESEARCHERS))
tf = named(s, "Researchers").text_frame
lines = C.RESEARCHERS
for p in list(tf.paragraphs)[1:]: p._p.getparent().remove(p._p)
tf.paragraphs[0].runs[0].text = lines[0]
for ln in lines[1:]:
    np_ = copy.deepcopy(tf.paragraphs[0]._p); tf._txBody.append(np_)
    tf.paragraphs[-1].runs[0].text = ln

# 2. Introduction
s = content_slide("INTRODUCTION", "Background of the Study")
box(s, 0.9, 2.3, 10.25, 6.3)
text(s, 1.3, 2.6, 9.5, 5.8, ["RA 11106 (2018) made Filipino Sign Language the national sign language of the Filipino Deaf, but interpreters are rarely present.",
     "Most translation apps work in English, few in Filipino, almost none in Bikol, and they need the internet.",
     "Disasters in Albay (Mayon, typhoons, earthquakes) cut mobile data exactly when people must communicate.",
     "Deep sign recognisers need large video datasets that FSL does not have; braille readers assume scanners."], 18, bullet=True, gap=12)
caption(s, 11.55, 2.25, 7.55, "Table 1. The problem in figures")
table(s, 11.55, 2.7, 7.55, [3.2, 1.8, 2.2], [["Indicator", "Value", "Source"], ["People needing hearing care", "> 430 million", "WHO (2021)"],
      ["People with vision impairment", "≥ 2.2 billion", "WHO (2019)"], ["National sign language", "FSL", "RA 11106 (2018)"],
      ["Languages of Albay homes", "Bikol, Filipino, English", "—"], ["Offline FSL + braille app in Bikol", "none found", "Review, Ch. 2"]], 13, 0.62)
bar(s, 8.95, "Purpose of the study. To build and test SENYAS, an offline intelligent system that translates between sign language, braille, text and speech in English, Filipino and Bikol.", 1.45)

# 3-4. RRL / RRS
s = content_slide("RRL/RRS", "Related Literature")
caption(s, 0.9, 2.25, 18.2, "Table 2. Related literature and how the study uses it")
table(s, 0.9, 2.7, 18.2, [2.6, 4.2, 4.6], [["Area", "Key sources", "Use in the present study"],
      ["Sign language structure", "Stokoe (1960); RA 11106 (2018)", "Handshape, location and movement guide the recogniser"],
      ["Hand tracking", "Lugaresi et al. (2019); Zhang et al. (2020)", "21 landmarks per hand, on the device"],
      ["Robot kinematics", "Craig (2005); Aristidou & Lasenby (2011)", "Hand model and FABRIK thumb; avatar arms"],
      ["Pattern recognition", "Cover & Hart (1967); Sakoe & Chiba (1978); Schmitt (1938)", "Nearest neighbour, DTW, hysteresis"],
      ["Braille and images", "ICEB (2013); Crow (1984); Viola & Jones (2001)", "Grade 1 decoding; fast local contrast"],
      ["Accessible software", "W3C (2018); ISO/IEC 25010 (2011); CAST (2018)", "Contrast, reflow, quality model, UDL lessons"]], 14, 0.66)
bar(s, 8.85, "Synthesis. Phones can track hands offline, and kinematics and geometry can describe hands and braille cells, so examples can be generated instead of collected.", 1.3)

s = content_slide("RRL/RRS", "Related Studies")
caption(s, 0.9, 2.25, 18.2, "Table 3. Related studies and their relation to the present study")
table(s, 0.9, 2.7, 18.2, [2.8, 4.4, 4.6], [["Study", "What was done", "Relation to the present study"],
      ["Cabalfin et al. (2012)", "FSL recognition from video (manifold learning)", "FSL can be recognised; SENYAS adds offline, Bikol, braille"],
      ["Koller (2020); Rastgoo et al. (2021)", "Surveys: deep, data-hungry methods", "Motivates a geometric method without big data"],
      ["Mitra & Acharya (2007)", "Survey of gesture recognition", "Separate handshape from movement"],
      ["Antonacopoulos & Bridson (2004)", "Braille from scanned pages", "SENYAS reads phone photos and live video"],
      ["Isayed & Tahboub (2015)", "Review of optical braille recognition", "Grid fitting and skew are the key steps"]], 14, 0.7)
bar(s, 8.85, "Synthesis. No free tool joins sign, braille, text and speech offline in English, Filipino and Bikol; the gap is an explainable, offline intelligent system.", 1.3)

# 5. Theoretical framework
s = content_slide("THEORETICAL/CONCEPTUAL FRAMEWORK PARADIGM")
named(s, "TextBox 6").text_frame.paragraphs[0].runs[0].font.size = Pt(34)
text(s, 0.9, 1.55, 18.2, 0.5, ["Theoretical Framework"], 20, "FFFFFF")
text(s, 0.9, 2.2, 7.85, 0.5, ["Research gap"], 18, RED).text_frame.paragraphs[0].runs[0].font.bold = True
text(s, 10.15, 2.2, 8.95, 0.5, ["Theory or method that addresses it"], 18, RED).text_frame.paragraphs[0].runs[0].font.bold = True
G = [("G1  No FSL dataset", "Robot-hand kinematics generates labelled handshapes (FK, FABRIK)."),
     ("G2  Hands vary in place, size, angle", "Palm-frame coordinates are invariant to translation, scale, rotation."),
     ("G3  Signs move at different speeds", "Hysteresis counting, winding number, dynamic time warping."),
     ("G4  Braille photos are skewed and noisy", "Summed-area contrast, robust pitch and skew, grid fitting.")]
for i, (g, th) in enumerate(G):
    y = 2.8 + i * 1.8
    box(s, 0.9, y, 7.85, 1.6); text(s, 1.2, y + 0.3, 7.3, 1.1, [g], 18, INK).text_frame.paragraphs[0].runs[0].font.bold = True
    arrow(s, 8.9, y + 0.5); b = box(s, 10.15, y, 8.95, 1.6, RED, None); text(s, 10.45, y + 0.3, 8.4, 1.1, [th], 18, "FFFFFF")
caption(s, 0.9, 10.05, 18.2, "Figure 1. Research gaps (left) and the theories and methods used to address them (right)")

# 6. Conceptual paradigm
s = content_slide("THEORETICAL/CONCEPTUAL FRAMEWORK PARADIGM")
named(s, "TextBox 6").text_frame.paragraphs[0].runs[0].font.size = Pt(34)
text(s, 0.9, 1.55, 18.2, 0.5, ["Conceptual Paradigm"], 20, "FFFFFF")
for x, w, head, items, num in [(0.9, 5.2, "INPUT", ["Camera frames of hands", "Braille photos or frames", "Typed or spoken text (EN, FIL, BIK)", "Kinematic hand model", "Trilingual lexicon (93 words, 32 phrases)"], False),
                                (6.85, 6.3, "PROCESS", ["MediaPipe 21-point landmarks", "Palm-frame features + nearest template", "Motion rules, two-hand rules, DTW", "Braille dots → grid fit → Grade 1 decode", "Longest-match phrase lookup", "Nine computational experiments"], True),
                                (13.9, 5.2, "OUTPUT", ["SENYAS app, website, Android app", "Text + Read aloud (on/off)", "Signing avatar + braille line", "Accuracy, CER, speed, layout results"], False)]:
    label(s, x, 2.3, w, 0.68, head, 20); box(s, x, 2.98, w, 5.72)
    text(s, x + 0.3, 3.28, w - 0.55, 5.2, [f"{i + 1}.  {t}" if num else t for i, t in enumerate(items)], 16, bullet=not num, gap=10)
arrow(s, 6.2, 5.42, 0.6, 0.84); arrow(s, 13.25, 5.42, 0.6, 0.84)
box(s, 5.7, 8.97, 8.6, 0.6, PINK, LINE); text(s, 5.8, 9.02, 8.4, 0.5, ["Feedback: results guide a field validation with Deaf and blind learners"], 14, RED, PP_ALIGN.CENTER)
caption(s, 0.9, 9.8, 18.2, "Figure 2. Conceptual paradigm of the study")

# 7. Significance
s = content_slide("SIGNIFICANCE OF THE STUDY")
box(s, 0.9, 2.3, 18.2, 7.15)
text(s, 1.4, 2.75, 8.4, 6.5, [("Deaf and hard-of-hearing learners.", "Their signing becomes spoken Filipino, English or Bikol, free and offline."),
     ("Blind and low-vision persons.", "Braille labels and notices are read aloud from a photo."),
     ("Teachers, SPED centres, families.", "Lessons, quizzes and camera practice in the home language.")], 18, gap=14)
text(s, 10.2, 2.75, 8.4, 6.5, [("Responders and health workers.", "An emergency phrasebook that works with no signal."),
     ("LGUs and DepEd.", "A free tool that supports RA 11106 and RA 7277."),
     ("Future researchers.", "An explainable method and open, repeatable benchmarks.")], 18, gap=14)
ln = s.shapes.add_connector(1, Inches(10.0), Inches(2.85), Inches(10.0), Inches(8.9)); ln.line.color.rgb = RGBColor.from_string(LINE)
text(s, 0.9, 9.65, 18.2, 0.5, ["The study supports SDG 4 (inclusive education), SDG 10 (reduced inequalities) and SDG 11.5 (disaster resilience)."], 15, CAP, PP_ALIGN.CENTER)

# 8. Objectives / SOP
s = content_slide("OBJECTIVES OF THE STUDY / SOP")
bar(s, 2.2, "General objective. To design, develop and evaluate SENYAS, an offline intelligent system for trilingual sign language and braille translation with a learning module.", 1.3)
text(s, 0.9, 3.7, 18.2, 0.5, ["Specifically, it seeks to answer the following questions:"], 16, CAP)
Q = ["How accurately are the 24 static letters classified as pose noise rises, and which design parts matter?",
     "How reliably are 13 moving and 6 two-handed signs detected, with what false-alarm rate?",
     "How accurately are fingerspelled words read across hold times and signer speeds?",
     "How reliably are user-taught signs recognised, and how often are others falsely accepted?",
     "How accurately are braille photos read across dot type, skew, blur and size?",
     "How long does each component take per frame?",
     "Does the interface fit all screens with readable contrast, and does the lexicon cover the phrasebook?"]
box(s, 0.9, 4.3, 8.95, 5.6); box(s, 10.15, 4.3, 8.95, 5.6)
text(s, 1.2, 4.55, 8.4, 5.2, [f"{i + 1}.  {q}" for i, q in enumerate(Q[:4])], 16, gap=10)
text(s, 10.45, 4.55, 8.4, 5.2, [f"{i + 5}.  {q}" for i, q in enumerate(Q[4:])], 16, gap=10)

# 9. Hypotheses
s = content_slide("HYPOTHESES", "Null Hypotheses")
text(s, 0.9, 2.25, 18.2, 0.5, ["The hypotheses were stated before testing and are tested at the 0.05 level of significance."], 16, CAP)
table(s, 0.9, 2.85, 18.2, [1.0, 10.0, 4.2], [["Code", "Hypothesis", "Test or decision rule"],
      ["H₀1", "Static-letter accuracy at expected noise is at most 90%.", "One-sided exact binomial test"],
      ["H₀2", "Detection of moving and two-handed signs is at most 90%.", "One-sided exact binomial test"],
      ["H₀3", "Fingerspelled-word accuracy at the default hold time is at most 80%.", "One-sided exact binomial test"],
      ["H₀4", "The braille character error rate is at least 20%.", "Bound comparison; Wilson CI"],
      ["H₀5", "Processing time per frame exceeds 100 ms.", "Median latency"],
      ["H₀6", "The interface has layout faults on at least one screen size.", "Automated layout test"]], 15, 0.78)
text(s, 0.9, 9.6, 18.2, 0.5, ["Reject H₀ when p < 0.05 (or when the measured value is beyond the bound)."], 14, CAP)

# 10. Scope
s = content_slide("SCOPE AND DELIMITATION")
box(s, 0.9, 2.3, 8.95, 4.4); box(s, 10.15, 2.3, 8.95, 4.4)
text(s, 1.2, 2.5, 8.4, 0.5, ["Scope"], 19, RED).text_frame.paragraphs[0].runs[0].font.bold = True
text(s, 1.2, 3.1, 8.4, 3.5, ["Alphabet A–Z with Ñ, numbers 0–10, 21 live signs", "93 words, 32 phrases in EN, FIL, BIK", "User-taught signs; Grade 1 braille with Ñ", "Web, installable and Android apps"], 16, bullet=True, gap=6)
text(s, 10.45, 2.5, 8.4, 0.5, ["Delimitation"], 19, RED).text_frame.paragraphs[0].runs[0].font.bold = True
text(s, 10.45, 3.1, 8.4, 3.5, ["No full FSL sentences or facial grammar", "No Grade 2 braille", "No tests with human participants in this phase", "Results from generated data (repeatable)"], 16, bullet=True, gap=6)
caption(s, 0.9, 6.95, 18.2, "Table 4. Validation experiments of SENYAS")
table(s, 0.9, 7.4, 18.2, [2.4, 6.4, 2.6], [["Experiment", "Data", "Measure"], ["E1–E2 Static letters", "24 letters × 40 hands × 4 noise levels; ablation", "Accuracy"],
      ["E3–E5 Moving, words, taught", "19 signs × 30; 40 words × 9 settings; 4 taught signs", "Detection, word accuracy"],
      ["E6–E9 Braille, camera, speed, screens", "300 photos; 288 renders; 11 screen sizes", "CER, ms, layout faults"]], 14, 0.55)

# 11. Research design
s = content_slide("METHODOLOGY", "Research Design")
text(s, 0.9, 2.2, 18.2, 1.0, ["A developmental engineering-design study (Hevner et al., 2004). SENYAS is designed from kinematic and geometric models, built as working software, and evaluated with nine repeatable computational experiments."], 16)
for i, t in enumerate(["1. Model", "2. Build", "3. Benchmark", "4. Analyse"]):
    label(s, 1.0 + i * 4.6, 3.55, 3.6, 0.8, t, 18)
    if i < 3: arrow(s, 4.7 + i * 4.6, 3.65, 0.8, 0.6)
caption(s, 0.9, 4.75, 18.2, "Table 5. Variables of the study")
table(s, 0.9, 5.2, 18.2, [1, 1, 1], [["Independent (varied)", "Dependent (measured)", "Controlled (fixed)"],
      ["Pose noise level; sign; hold time and signer speed", "Accuracy; detection and false-alarm rates", "Hand model and templates; random seed"],
      ["Braille dot type, skew, blur, size", "Word accuracy; character error rate", "Frame rate 30 fps; image size"],
      ["Screen size", "Time per frame; layout faults; contrast", "Same code as the shipped app"]], 15, 0.95)

# 12. Materials
s = content_slide("METHODOLOGY", "Materials and Device")
box(s, 0.9, 2.3, 7.6, 7.4)
text(s, 1.2, 2.5, 7.1, 0.5, ["System specification"], 19, RED).text_frame.paragraphs[0].runs[0].font.bold = True
text(s, 1.2, 3.1, 7.1, 6.4, ["Input: phone or laptop camera, microphone, keyboard, photos", "Engine: MediaPipe Hand Landmarker (on device)",
     "Recogniser: 572 templates × 41 features", "Braille reader: grid fitting, Grade 1 + Ñ", "Output: text in EN/FIL/BIK, Read aloud, avatar, braille", "App: 190 KB page + 17 MB offline engine; Android app"], 15, bullet=True, gap=8)
caption(s, 8.9, 2.25, 10.2, "Table 6. Materials and components")
table(s, 8.9, 2.7, 10.2, [3.2, 3.4, 2.6], [["Item", "Specification", "Purpose"], ["Computer", "x86-64, Linux, CPU only", "Build and test"],
      ["Chromium + Playwright", "Headless browser", "App, MediaPipe, braille, layout tests"], ["Node.js 22", "JavaScript runtime", "Recogniser tests"],
      ["MediaPipe 0.10.14", "Float16 hand model", "Landmarks"], ["HTML/CSS/JS", "No framework", "App and website"],
      ["Kotlin WebView", "Android 7+", "Android app"], ["Python 3", "Matplotlib, docx", "Analysis, reports"]], 13, 0.62)
pic(s, FIG.parent.parent / "assets" / "senyas-logo.png", 3.4, 7.75, h=1.8)

# 13. Data gathering
s = content_slide("METHODOLOGY", "Data Gathering Procedure")
steps = ["Define 37 handshapes with the hand model", "Generate 572 templates", "Build app, website, Android app", "E1 static letters (3,840 hands)", "E2 ablation (5 designs)",
         "E3 moving and two-handed signs", "E4 fingerspelled words", "E5 taught signs", "E6 braille photos (300)", "E7–E9 camera, speed, screens"]
for i, t in enumerate(steps):
    x, y = 0.9 + (i % 5) * 3.68, 2.3 + (i // 5) * 3.6
    box(s, x, y, 3.2, 2.8); text(s, x + 0.15, y + 0.15, 2.9, 0.4, [f"Step {i + 1}"], 14, RED).text_frame.paragraphs[0].runs[0].font.bold = True
    text(s, x + 0.15, y + 0.75, 2.9, 1.9, [t], 15)
    if i % 5 < 4: arrow(s, x + 3.22, y + 1.15, 0.42, 0.45)
caption(s, 0.9, 9.6, 18.2, "Figure 3. Data gathering procedure (fixed random seeds, so every run can be repeated)")

# 14. Treatment of data
s = content_slide("METHODOLOGY", "Treatment of Data")
box(s, 0.9, 2.3, 8.2, 7.6)
text(s, 1.2, 2.5, 7.6, 0.5, ["Formulas"], 19, RED).text_frame.paragraphs[0].runs[0].font.bold = True
text(s, 1.2, 3.1, 7.6, 6.6, ["Accuracy = correct ÷ trials", "Wilson CI: (p̂ + z²/2n ± z√(p̂(1−p̂)/n + z²/4n²)) ÷ (1 + z²/n)",
     "Binomial test: p = P(X ≥ k | n, p₀)", "CER = Σ Levenshtein(read, true) ÷ Σ length(true)", "Palm frame: Y = (p₉−p₀)/s, Z = (p₅−p₁₇)×Y, X = Y×Z",
     "Grid fit: min over P, x₀ of Σ min(|u−kP|, |u−δ−k′P|)"], 15, gap=12)
text(s, 9.5, 2.3, 9.6, 0.5, ["Statistical treatment"], 19, RED).text_frame.paragraphs[0].runs[0].font.bold = True
table(s, 9.5, 2.9, 9.6, [0.8, 5.0, 2.8], [["SOP", "Question", "Tool"], ["1", "Static-letter accuracy; ablation", "Accuracy, Wilson CI, binomial"],
      ["2", "Moving and two-handed signs", "Detection rate, binomial"], ["3", "Fingerspelled words", "Word accuracy, CER, binomial"],
      ["4", "Taught signs", "Detection, false accepts"], ["5", "Braille photos", "Exact rate, CER"], ["6", "Speed", "Median ms"], ["7", "Screens, contrast, coverage", "Faults, WCAG ratio"]], 13, 0.7)
text(s, 9.5, 9.5, 9.6, 0.4, ["α = 0.05; software: Node.js, Chromium, Python"], 13, CAP)

# 15. Ethics
s = content_slide("METHODOLOGY", "Ethical Considerations and Safety")
box(s, 0.9, 2.3, 18.2, 7.4)
text(s, 1.4, 2.6, 8.4, 6.8, [("Ethics.", "No human participants in this phase; all data were generated."), ("Privacy.", "Video, photos and audio never leave the device; consent before storage (RA 10173)."),
     ("Honesty.", "All sources cited in APA 7; every number comes from open scripts.")], 17, gap=14)
text(s, 10.2, 2.6, 8.4, 6.8, [("Accuracy notice.", "Signs shown are forms shared by FSL and ASL; local signs vary; not a certified interpreter."),
     ("Future tests.", "Ethics review, parental consent for minors, partnership with the Deaf community."), ("Licences.", "MediaPipe used under Apache-2.0.")], 17, gap=14)
ln = s.shapes.add_connector(1, Inches(10.0), Inches(2.7), Inches(10.0), Inches(9.3)); ln.line.color.rgb = RGBColor.from_string(LINE)

# 16-18. Results
s = content_slide("RESULTS AND DISCUSSION", "Sign Recognition")
named(s, "TextBox 6").text_frame.paragraphs[0].runs[0].font.size = Pt(40)
box(s, 0.9, 2.25, 9.0, 5.6); pic(s, FIG / "fig_static.png", 1.0, 2.35, w=8.8)
box(s, 10.2, 2.25, 8.9, 5.6); pic(s, FIG / "fig_moving.png", 10.3, 2.4, w=8.7)
table(s, 0.9, 8.05, 18.2, [3, 2.2, 2.2, 3], [["Result", "Value", "95% CI", "Decision"],
      ["Static letters at expected noise (E1)", pc(st[1]["acc"]), f"{pc(st[1]['lo'])}–{pc(st[1]['hi'])}", "H₀1 rejected"],
      ["Moving and two-handed signs (E3)", f"{MA['k']}/{MA['n']}", f"{pc(MA['ci'][0])}–{pc(MA['ci'][1])}", "H₀2 rejected; 0 false alarms"]], 14, 0.5)

s = content_slide("RESULTS AND DISCUSSION", "Words, Taught Signs and Braille")
named(s, "TextBox 6").text_frame.paragraphs[0].runs[0].font.size = Pt(40)
box(s, 0.9, 2.25, 7.6, 5.6); pic(s, FIG / "fig_words.png", 1.1, 2.4, w=7.2)
box(s, 8.8, 2.25, 10.3, 5.6); pic(s, FIG / "fig_braille.png", 8.95, 2.4, w=10.0)
table(s, 0.9, 8.05, 18.2, [3.2, 2.6, 3.6], [["Result", "Value", "Decision"],
      ["Fingerspelled words at 400 ms (E4)", pc(C.wk / C.wn), "H₀3 rejected"],
      ["Taught signs (E5)", f"{C.cu_k}/{C.cu_n}, {CU['lookalikes']['falseAccepts']} false accepts", "Reliable from 3 takes"],
      ["Braille photos (E6)", f"{pc(br['All photos']['exact'])} exact, CER {pc(br['All photos']['cer'])}", "H₀4 rejected"]], 14, 0.45)

s = content_slide("RESULTS AND DISCUSSION", "Speed, Screens and the App")
named(s, "TextBox 6").text_frame.paragraphs[0].runs[0].font.size = Pt(40)
for i, f in enumerate(["shot-phone-1translate.png", "shot-phone-2t2s.png", "shot-phone-3brl.png"]):
    box(s, 0.9 + i * 3.05, 2.25, 2.85, 6.25); pic(s, FIG / f, 0.98 + i * 3.05, 2.33, w=2.69)
table(s, 10.2, 2.25, 8.9, [3.6, 2.4, 2.4], [["Hypothesis", "Result", "Decision"],
      ["H₀1 accuracy ≤ 90%", pc(st[1]["acc"]), "Rejected"], ["H₀2 detection ≤ 90%", pc(MA["rate"]), "Rejected"],
      ["H₀3 words ≤ 80%", pc(C.wk / C.wn), "Rejected"], ["H₀4 CER ≥ 20%", pc(br["All photos"]["cer"]), "Rejected"],
      ["H₀5 time > 100 ms", f"{TM['mediapipeMs']:.0f} + {TM['recognizerMs']:.2f} ms", "Rejected"], ["H₀6 layout faults", f"0 of {len(UI)} sizes", "Rejected"]], 14, 0.75)
caption(s, 0.9, 8.7, 9.0, "Figure 4. Live translation with Read aloud, the avatar, the braille reader")
text(s, 10.2, 8.0, 8.9, 1.6, [f"All contrast pairs ≥ 4.5 : 1 (WCAG AA). All {C.CV['phrases']} phrases signed in 3 languages with no fingerspelling."], 14, CAP)

# 19. Conclusions
s = content_slide("CONCLUSIONS AND RECOMMENDATIONS")
named(s, "TextBox 6").text_frame.paragraphs[0].runs[0].font.size = Pt(40)
box(s, 0.9, 2.3, 18.2, 7.4)
text(s, 1.3, 2.5, 8.4, 0.5, ["Conclusions"], 19, RED).text_frame.paragraphs[0].runs[0].font.bold = True
text(s, 1.3, 3.1, 8.4, 6.4, [f"Geometry and kinematics classify static letters at {pc(st[1]['acc'])} without a dataset.", f"Moving and two-handed signs: {pc(MA['rate'])}, no false alarms.",
     f"Words {pc(C.wk / C.wn)}; taught signs {pc(C.cu_k / C.cu_n)}; braille {pc(br['All photos']['exact'])} exact.", "Fast, offline, fits every screen; Read aloud on or off."], 16, bullet=True, gap=10)
text(s, 10.3, 2.5, 8.4, 0.5, ["Recommendations"], 19, RED).text_frame.paragraphs[0].runs[0].font.bold = True
text(s, 10.3, 3.1, 8.4, 6.4, ["Field-validate with Deaf and blind learners in Albay (ethics review, TAM).", "Calibrate templates with real landmark recordings.",
     "Review words and signs with Bikol speakers and Deaf FSL users.", "Add facial grammar, Grade 2 braille and a Bikol voice."], 16, bullet=True, gap=10)
ln = s.shapes.add_connector(1, Inches(10.0), Inches(2.6), Inches(10.0), Inches(9.3)); ln.line.color.rgb = RGBColor.from_string(LINE)

# 20-21. Q&A and thank you
clone(SRC[15]); clone(SRC[16])

# drop the template's own slides
ids = prs.slides._sldIdLst
for sid in list(ids)[:len(SRC)]:
    prs.part.drop_rel(sid.rId); ids.remove(sid)
out = HERE / "SENYAS_RIM_PR2_Presentation.pptx"
prs.save(out); print("slides", len(prs.slides), out.name)
