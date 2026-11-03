#!/usr/bin/env python3
"""SENYAS 1:45 rationale narration script (DOCX and PDF)."""
import pathlib, subprocess
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = pathlib.Path(__file__).resolve().parent
NAME = "SENYAS_Rationale_Narration_Script_v1"
TITLE = "SENYAS: An Offline Intelligent System for Trilingual Sign Language and Braille Translation Using a Kinematic Hand Model, Landmark Geometry, and Braille Grid Fitting"
ROWS = [
    ("0:00 – 0:12", "Hook",
     "Imagine a Deaf student in Legazpi trying to ask for help, or a blind grandmother holding a printed notice she cannot read. Every day, conversations like these simply stop.",
     "A Deaf student signing to a jeepney driver who does not understand; a hand touching a braille notice."),
    ("0:12 – 0:30", "The problem",
     "The World Health Organization estimates that more than 430 million people need care for disabling hearing loss, and 2.2 billion live with a vision impairment. Republic Act 11106 made Filipino Sign Language our national sign language, but interpreters are rarely there when they are needed.",
     "Figures appear: 430 million (WHO, 2021), 2.2 billion (WHO, 2019), RA 11106 (2018)."),
    ("0:30 – 0:47", "Why Albay",
     "In Albay the gap is wider. Most translation tools work in English, almost none in Bikol, and they need the internet, exactly what fails during a typhoon, an earthquake, or a Mayon evacuation.",
     "Map of Albay; Mayon; a phone showing “No signal”; the words English · Filipino · Bikol."),
    ("0:47 – 1:05", "The research gap",
     "Research on sign recognition relies on deep networks trained on thousands of videos, and Filipino Sign Language has no dataset that large. Braille readers assume scanners and perfect light, not a phone held over a page.",
     "Stacks of video clips crossed out; a scanner beside a phone held over braille."),
    ("1:05 – 1:28", "What SENYAS does",
     "So we built SENYAS, an intelligent system that runs entirely on a phone. It reads signs through the camera and speaks them aloud in English, Filipino or Bikol; it signs back with an avatar; it reads braille from a photo; and it teaches signing, even with no signal.",
     "SENYAS logo; screens: live translation with Read aloud on, the signing avatar, the braille reader, a lesson."),
    ("1:28 – 1:45", "Purpose",
     "Instead of big data, SENYAS uses the kinematics of a robot hand and the geometry of the braille cell. This study measures how accurately and how fast it works, so that no conversation in Albay has to stop.",
     "The 21 hand points become a robot-hand skeleton; braille dots snap to their grid; title card."),
]


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hexcolor); tcPr.append(sh)


d = Document()
s = d.sections[0]; s.page_width, s.page_height = Inches(8.5), Inches(11)
s.left_margin = s.right_margin = s.top_margin = s.bottom_margin = Inches(0.9)
st = d.styles["Normal"]; st.font.name = "Times New Roman"; st.font.size = Pt(11.5); st.element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
def para(t, bold=False, size=None, align=WD_ALIGN_PARAGRAPH.CENTER, color=None, after=4, italic=False):
    p = d.add_paragraph(); p.alignment = align; p.paragraph_format.space_after = Pt(after)
    r = p.add_run(t); r.bold = bold; r.italic = italic
    if size: r.font.size = Pt(size)
    if color: r.font.color.rgb = RGBColor.from_string(color)
    return p
p = para("", after=2); p.add_run().add_picture(str(HERE.parent.parent / "assets" / "senyas-logo.png"), width=Inches(0.9))
para("RATIONALE NARRATION SCRIPT (1:45)", bold=True, size=15, color="8B0707")
para(TITLE, bold=True, size=12.5, after=2)
para("Robotics and Intelligent Machines, Team (RIM-T) · Legazpi City Science High School · Legazpi City, Albay", italic=True, size=10.5, after=10)
words = sum(len(r[2].split()) for r in ROWS)
para(f"Total running time: 1 minute 45 seconds · {words} words · about {words / 1.75:.0f} words per minute · one narrator, calm and clear", size=10.5, after=10)
t = d.add_table(rows=1 + len(ROWS), cols=4); t.style = "Table Grid"; t.autofit = False
W = [1.05, 1.0, 3.25, 1.6]
for j, h in enumerate(["Time", "Part", "Narration", "On screen"]):
    c = t.cell(0, j); c.text = ""; r = c.paragraphs[0].add_run(h); r.bold = True; r.font.color.rgb = RGBColor(255, 255, 255); shade(c, "8B0707")
for i, row in enumerate(ROWS, 1):
    for j, val in enumerate(row):
        c = t.cell(i, j); c.text = ""; r = c.paragraphs[0].add_run(val)
        r.font.size = Pt(11.5 if j == 2 else 10); r.bold = j < 2
        if j == 0: r.font.color.rgb = RGBColor.from_string("8B0707")
        if i % 2 == 0: shade(c, "F8EAEA")
for col, w in zip(t.columns, W): col.width = Inches(w)
for row in t.rows:
    for c, w in zip(row.cells, W): c.width = Inches(w)
para("", after=6)
para("Reading notes", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, color="8B0707", after=2)
for n in ["Pause for one beat after “simply stop” (0:12) and after “has to stop” (1:45).",
          "Say “SENYAS” as seh-NYAHS; “Bikol” as BEE-kol.",
          "Figures on screen must match the paper: WHO (2021) for hearing, WHO (2019) for vision, RA 11106 (2018).",
          "Background music low (about 20% volume); captions on throughout so the video is accessible to Deaf viewers."]:
    p = d.add_paragraph(n, style="List Bullet"); p.paragraph_format.space_after = Pt(2)
out = HERE / (NAME + ".docx"); d.save(out)
subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(HERE), str(out)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("words", words)
