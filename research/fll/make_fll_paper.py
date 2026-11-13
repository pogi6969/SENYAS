#!/usr/bin/env python3
"""SENYAS short paper for FIRST LEGO League Challenge, BIOGLOW season (Innovation Project). DOCX and PDF.
Numbers come from research/code/results_species.json and stats.json."""
import json, pathlib, subprocess, sys
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE.parent / "paper"))
import content_v2 as V
NAME = "SENYAS_FLL_BIOGLOW_Innovation_Project_Paper"
DEEP, LEAF, GLOW, MIST, INK = "0B3D2E", "1B7F5A", "C8FF5A", "EAF7EE", "13231C"
pc = V.pc

d = Document(); s = d.sections[0]; s.page_width, s.page_height = Inches(8.5), Inches(11)
s.left_margin = s.right_margin = Inches(0.8); s.top_margin = Inches(0.6); s.bottom_margin = Inches(0.7)
st = d.styles["Normal"]; st.font.name = "Arial"; st.font.size = Pt(10); st.element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hexcolor); tcPr.append(sh)


def noborder(t):
    tblPr = t._tbl.tblPr; b = OxmlElement("w:tblBorders")
    for e in ("top", "left", "bottom", "right", "insideH", "insideV"):
        x = OxmlElement("w:" + e); x.set(qn("w:val"), "nil"); b.append(x)
    tblPr.append(b)


def run(p, t, bold=False, size=None, color=None, italic=False):
    r = p.add_run(t); r.bold = bold; r.italic = italic
    if size: r.font.size = Pt(size)
    if color: r.font.color.rgb = RGBColor.from_string(color)
    return r


def para(t="", after=5, align=WD_ALIGN_PARAGRAPH.JUSTIFY, **k):
    p = d.add_paragraph(); p.alignment = align; p.paragraph_format.space_after = Pt(after); p.paragraph_format.line_spacing = 1.08
    if t: run(p, t, **k)
    return p


def band(cells, fill, widths, height=None):
    t = d.add_table(rows=1, cols=len(cells)); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False; noborder(t)
    for col, w in zip(t.columns, widths): col.width = Inches(w)
    for c, w in zip(t.rows[0].cells, widths): c.width = Inches(w); shade(c, fill)
    return t.rows[0].cells


def head(n, t, step):
    c = band([0, 0], DEEP, [0.55, 6.35])
    p = c[0].paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next = True; run(p, str(n), bold=True, size=13, color=GLOW)
    p = c[1].paragraphs[0]; p.paragraph_format.keep_with_next = True; run(p, t.upper(), bold=True, size=11.5, color="FFFFFF"); run(p, "   " + step, size=9, color=GLOW, italic=True)
    q = d.add_paragraph(); q.paragraph_format.space_after = Pt(0); q.paragraph_format.line_spacing = 0.3; q.paragraph_format.keep_with_next = True


def bullets(xs):
    for x in xs:
        p = d.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(2); p.paragraph_format.line_spacing = 1.05
        if isinstance(x, tuple): run(p, x[0] + " ", bold=True, color=LEAF); run(p, x[1])
        else: run(p, x)


def grid(headr, rows, widths, size=9.5):
    t = d.add_table(rows=1 + len(rows), cols=len(headr)); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    for j, h in enumerate(headr):
        c = t.cell(0, j); shade(c, LEAF); run(c.paragraphs[0], h, bold=True, size=size, color="FFFFFF")
    for i, r in enumerate(rows, 1):
        for j, v in enumerate(r):
            c = t.cell(i, j); run(c.paragraphs[0], v, size=size, bold=j == 0, color=DEEP if j == 0 else None)
            if i % 2 == 0: shade(c, MIST)
    for col, w in zip(t.columns, widths): col.width = Inches(w)
    for row in t.rows:
        for c, w in zip(row.cells, widths): c.width = Inches(w)
    para(after=4)


# ---------- cover band ----------
c = band([0, 0], DEEP, [1.2, 5.7])
c[0].paragraphs[0].add_run().add_picture(str(ROOT / "assets" / "senyas-logo.png"), width=Inches(0.95))
p = c[1].paragraphs[0]; run(p, "FIRST® LEGO® League Challenge 2026–27  ·  BIOGLOW℠  ·  Innovation Project", size=9, color=GLOW, bold=True)
p = c[1].add_paragraph(); run(p, "SENYAS: Biodiversity for Every Voice, Sign and Dot", bold=True, size=19, color="FFFFFF")
p = c[1].add_paragraph(); run(p, "An offline app that names plants and animals in speech, sign language and braille, in English, Filipino and Bikol", size=10.5, color="FFFFFF", italic=True)
p = c[1].add_paragraph(); run(p, "Team: [Team name and number]   ·   Members: [names]   ·   Coach: [name]", size=9, color=GLOW)
p = c[1].add_paragraph(); run(p, "Legazpi City Science High School, Legazpi City, Albay, Philippines", size=9, color=GLOW)
para(after=3)
c = band([0], MIST, [6.9])
p = c[0].paragraphs[0]; run(p, "In one glow:  ", bold=True, color=LEAF)
run(p, "People can only protect the living things they can name. Deaf and blind learners are left out when nature is named only by voice, in print "
       "and in English. SENYAS lets anyone point a phone at a leaf, a flower, a bird or an insect and receive its name out loud, in sign language and in "
       "braille, with no signal.", size=10.5)
para(after=3)

# ---------- 1 ----------
head(1, "The problem we chose", "Identify")
para("BIOGLOW asks teams to explore the living world and help it thrive. When we looked at how people in our community learn about plants and "
     "animals, we saw who was missing. A teacher points at a tree and says its name; a sign in a park prints it; an app shows it in English. "
     "A Deaf student gets no sign, a blind student gets no braille, and a child who thinks in Bikol gets no local word. The World Health "
     "Organization counts more than 430 million people who need care for hearing loss and 2.2 billion with a vision impairment. The Philippines "
     "is one of the world's megadiverse countries, so the people left out are surrounded by the very life that needs their care.")
c = band([0], MIST, [6.9]); p = c[0].paragraphs[0]
run(p, "Our problem statement:  ", bold=True, color=LEAF)
run(p, "How can we help people who are Deaf or blind, and people who speak Bikol or Filipino, learn the names of the plants and animals "
       "around them, even where there is no internet?", italic=True)
para(after=3)

# ---------- 2 ----------
head(2, "What we found out", "Research")
bullets([("Existing nature apps", "name species well from a photo, but they answer on a screen, mostly in English, and most need a connection (Wäldchen & Mäder, 2018)."),
         ("Small models can run on a phone.", "Open models trained on volunteers' photos from iNaturalist know thousands of plants, birds and insects (Van Horn et al., 2018)."),
         ("Filipino Sign Language", "is the national sign language by law (Republic Act No. 11106), yet most species have no agreed sign, so signers use a general sign such as BIRD or TREE and fingerspell the name."),
         ("People to ask:", "[Write here the experts and users your team talked to, for example a SPED teacher, a Deaf signer, a blind student, a biology teacher or a DENR officer, and one thing each of them told you.]")])

# ---------- 3 ----------
head(3, "Our solution: SENYAS", "Design")
t = d.add_table(rows=1, cols=2); t.autofit = False; noborder(t)
t.columns[0].width = Inches(4.75); t.columns[1].width = Inches(2.15)
L, Rr = t.rows[0].cells; L.width = Inches(4.75); Rr.width = Inches(2.15)
Rr.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
Rr.paragraphs[0].add_run().add_picture(str(ROOT / "research" / "figures" / "shot-phone-7nature.png"), width=Inches(1.75))
q = Rr.add_paragraph(); q.alignment = WD_ALIGN_PARAGRAPH.CENTER; run(q, "A sunflower named in Bikol, signed by the avatar and written in braille", size=8, italic=True)
p = L.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
run(p, "SENYAS is a free app for phones, tablets and computers. In its Nature scan, the user takes or chooses a photo. Four small models inside "
       "the app look at it: a general model first decides whether it shows a plant, a bird, an insect or another animal, and then the matching "
       "specialist names the species. The name is then given three ways at once:")
for a, b in (("Voice:", "read aloud in English, Filipino or Bikol."), ("Sign:", "an avatar signs the kind of living thing and fingerspells its name."),
             ("Dots:", "the name is written in braille, ready for a braille display or a label.")):
    q = L.add_paragraph(style="List Bullet"); q.paragraph_format.space_after = Pt(1); run(q, a + " ", bold=True, color=LEAF); run(q, b)
q = L.add_paragraph(); q.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY; q.paragraph_format.space_before = Pt(4)
run(q, "A leaf or a piece of bark can be named by telling the app it is a plant, several photos of the same plant can be combined, and other "
       "likely answers can be tapped. The same app translates sign language through the camera and reads braille from a photo, so friends who "
       "learn about nature together can also talk about it together. It knows 2,101 plants, 964 birds, 1,021 insects and about 400 other kinds of "
       "animals, and it works with no signal. Photos stay on the phone.")
para(after=3)
c = band([0], MIST, [6.9]); p = c[0].paragraphs[0]
run(p, "What is new:  ", bold=True, color=LEAF)
run(p, "we found no other tool that names a photographed species in speech, sign language and braille together, or in Bikol.")
para(after=3)

# ---------- 4 ----------
head(4, "How we built and improved it", "Create and Iterate")
para("We built SENYAS as one web app that also installs as an Android app. We tested each version and changed it when the test showed a problem:")
grid(["What we tested", "What happened", "What we changed"], [
    ["First scan: one specialist model for everything", "It gave a species name even for a photo of a person or a beach.", "Added a general model as a gate; now such photos get “No plant or animal”."],
    ["Leaves, bark and seed heads", "The gate did not see them as plants, so the scan stayed silent.", "Added Plant, Bird, Insect and Other animal buttons, and combining of several photos."],
    ["Bikol and Filipino voice", "Many phones have no Filipino voice, so nothing was spoken.", "The app now falls back to the closest voice and lets the user choose one."],
    ["Different devices", "Buttons were too small on phones and the layout broke on wide screens.", "The app now detects phone, tablet, computer or TV and changes its layout."]], [1.9, 2.5, 2.5])
para(f"Then we measured it. We scanned {len(V.R)} flower photos from a public collection. For flowers on the app's list (daisy, dandelion and "
     f"sunflower), it named the right kind in {V.a1} of {V.n_in} photos ({pc(V.a1, V.n_in)}) by itself and in {V.p1} of {V.n_in} "
     f"({pc(V.p1, V.n_in)}) when we told it the photo showed a plant; the right answer was among its top three for {pc(V.p3, V.n_in)}. "
     f"Garden roses and tulips are not on its list, and it almost never named them ({V.rose1 + V.tul1} of {2 * V.n_cls}). That taught us our next "
     "step: the list must grow with local species. One scan took about "
     f"{V.MED:.0f} milliseconds on a computer, and the whole app passes 171 automatic checks.")
t = d.add_table(rows=1, cols=1); noborder(t); t.alignment = WD_TABLE_ALIGNMENT.CENTER
cp = t.rows[0].cells[0].paragraphs[0]; cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
cp.add_run().add_picture(str(ROOT / "research" / "figures" / "fig_species.png"), width=Inches(3.7))
para("Our test: correct answers for each flower, when the app decides alone (grey) and when told it is a plant (red)", after=6, align=WD_ALIGN_PARAGRAPH.CENTER, size=8, italic=True)

# ---------- 5 ----------
head(5, "Who it helps and how we share it", "Communicate and Impact")
bullets([("Deaf learners", "see the sign and the fingerspelled name; hearing classmates learn the sign with them."),
         ("Blind learners", "hear the name and can read it in braille."),
         ("Bikol and Filipino speakers", "get the kind of living thing, and common plants, in their own language."),
         ("Schools and field trips", "can use it far from any signal, on the phones they already have, for free."),
         ("Sharing:", "[Write here who your team showed SENYAS to, what they said, and what you changed because of it. Plan: demonstrate it to a SPED class and a science class, and collect their suggestions.]")])
para("Next steps: photograph the plants, birds and insects of Albay with biology teachers so the list includes local and endemic species; agree on "
     "signs for common local species with Deaf signers; and make braille labels for the trees in our school garden.", after=6)

# ---------- 6 ----------
head(6, "Core Values in our work", "How we worked")
grid(["Core Value", "How it showed in SENYAS"], [
    ["Discovery", "We learned how a camera can read hands, braille dots and species, and we tested ideas with real measurements."],
    ["Innovation", "A general model works as a gate for three specialists, and one name comes out as voice, sign and braille."],
    ["Impact", "A free, offline tool that lets Deaf, blind and hearing neighbours name, and so care for, the life around them."],
    ["Inclusion", "Three languages, three ways of receiving a name, large text, high contrast, and any screen size."],
    ["Teamwork", "[Describe your roles: who designed, coded, tested, researched and presented, and how you solved one disagreement.]"],
    ["Fun", "Lessons, quizzes and badges in the app, and a race to scan the most species in the school garden."]], [1.3, 5.6])

# ---------- sources ----------
p = para(after=2, align=WD_ALIGN_PARAGRAPH.LEFT); run(p, "SOURCES", bold=True, color=LEAF, size=10)
for r_ in ["Republic Act No. 11106, The Filipino Sign Language Act (2018).",
           "Mittermeier, R. A., Robles Gil, P., & Mittermeier, C. G. (1997). Megadiversity: Earth's biologically wealthiest nations. CEMEX.",
           "The TensorFlow Team. (2019). Flowers [Data set].",
           "Van Horn, G., et al. (2018). The iNaturalist species classification and detection dataset. IEEE Conference on Computer Vision and Pattern Recognition, 8769–8778.",
           "Wäldchen, J., & Mäder, P. (2018). Machine learning for image based species identification. Methods in Ecology and Evolution, 9(11), 2216–2225.",
           "World Health Organization. (2019). World report on vision.  World Health Organization. (2021). World report on hearing.",
           "SENYAS app, tests and data: github.com/pogi6969/SENYAS"]:
    p = para(after=1, align=WD_ALIGN_PARAGRAPH.LEFT); p.paragraph_format.left_indent = Inches(0.3); p.paragraph_format.first_line_indent = Inches(-0.3); run(p, r_, size=8.5)
para("FIRST® and FIRST® LEGO® League are registered trademarks of FIRST; LEGO® is a registered trademark of the LEGO Group. This team paper is not an official FIRST document.",
     after=0, align=WD_ALIGN_PARAGRAPH.CENTER, size=7.5, italic=True, color="666666")

out = HERE / (NAME + ".docx"); d.save(out)
subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(HERE), str(out)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print(subprocess.check_output(["pdfinfo", str(HERE / (NAME + ".pdf"))]).decode().split("Pages:")[1].split()[0], "pages")
