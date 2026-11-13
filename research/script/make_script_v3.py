#!/usr/bin/env python3
"""SENYAS 2:00 rationale video script, version 3 (2:00, more on the plant and animal scan): FIRST LEGO League BIOGLOW theme and Core Values (DOCX and PDF)."""
import pathlib, subprocess
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = pathlib.Path(__file__).resolve().parent
NAME = "SENYAS_Rationale_Video_Script_v3_BIOGLOW_2min"
ROWS = [
    ("0:00 – 0:12", "Hook: the theme",
     "BIOGLOW asks us to explore the living world. But in Albay, a Deaf student or a blind child can stand beside a tree, a bird or a firefly and never learn its name.",
     "Mayon and green fields; a child touching a leaf; a kingfisher; title: BIOGLOW."),
    ("0:12 – 0:25", "The problem",
     "More than 430 million people need care for hearing loss, and 2.2 billion live with a vision impairment. Nature guides and apps speak English, need the internet, and leave out sign language, braille and Bikol.",
     "Figures: 430 million (WHO, 2021), 2.2 billion (WHO, 2019). A phone showing “No signal”."),
    ("0:25 – 0:58", "The plant and animal scan",
     "So we built SENYAS. Point the camera at a plant or an animal, or upload a photo, and four small models inside the phone go to work. A general model decides first: plant, bird, insect or other animal. Then a specialist names it, from 2,101 plants, 964 birds, 1,021 insects and about 400 other animals, with no signal at all.",
     "Live camera on a hibiscus, then an uploaded photo of a bird; on-screen labels: General model → Plant / Bird / Insect / Animal → Specialist; the counts appear one by one; “No signal” icon."),
    ("0:58 – 1:13", "Any part of the plant",
     "Only have a leaf, a piece of bark or a seed head? Tap Plant, add photos of the flower and the whole tree, and SENYAS combines them. Unsure answers are marked, and other likely species are one tap away.",
     "Leaf → bark → whole tree photos; “3 photos combined”; a “Not sure” tag; finger tapping another candidate."),
    ("1:13 – 1:28", "Voice, sign and dots",
     "Then the name glows three ways: spoken aloud, signed by an avatar, and written in braille, in English, Filipino or Bikol. A sunflower becomes Mirasol. The same app also translates sign language and reads braille.",
     "Sunflower → “Mirasol”: speaker icon, the avatar signing, the braille line; quick cut to live sign translation and the braille reader."),
    ("1:28 – 1:36", "We tested it",
     "On 300 flower photos, it named the right genus seven times in ten when told it was a plant, and showed us our next step: adding Albay's own species.",
     "Bar chart from the paper (69.4% Plant mode); a team member photographing a local tree."),
    ("1:36 – 1:52", "FIRST Core Values",
     "Discovery and Innovation: a robot-hand model and small models instead of big data. Impact and Inclusion: one free app for Deaf, blind and hearing neighbours, in our language. Teamwork and Fun: we built, tested and laughed until all 171 checks passed.",
     "Six cards appear in pairs: Discovery + Innovation, Impact + Inclusion, Teamwork + Fun, over clips of the team."),
    ("1:52 – 2:00", "Closing",
     "With SENYAS, biodiversity glows for everyone, because people protect what they can name.",
     "A Deaf student signs “bird” as the app names it; SENYAS logo; team name and school."),
]
VALUES = [
    ("Discovery", "We explored new skills and ideas.", "Learned hand tracking, braille rules, species models and three languages; tested ideas with repeatable experiments."),
    ("Innovation", "We used creativity and persistence to solve problems.", "A robot-hand model and geometry replace big data; four small models work together so plants and animals are named offline."),
    ("Impact", "We applied what we learned to improve our world.", "A free tool for Deaf, blind and hearing people in Albay: naming nature, everyday talk and emergencies, with no signal needed."),
    ("Inclusion", "We respected each other and embraced our differences.", "Speech, sign language and braille side by side; English, Filipino and Bikol; large text, high contrast, any screen."),
    ("Teamwork", "We are stronger when we work together.", "Roles shared across design, coding, testing and research; every bug found by one member was fixed with the others."),
    ("Fun", "We enjoyed and celebrated what we did.", "Lessons, quizzes, games, streaks and badges; scanning the school garden to see who finds the most species."),
]


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hexcolor); tcPr.append(sh)


d = Document()
s = d.sections[0]; s.page_width, s.page_height = Inches(8.5), Inches(11)
s.left_margin = s.right_margin = s.top_margin = s.bottom_margin = Inches(0.85)
st = d.styles["Normal"]; st.font.name = "Times New Roman"; st.font.size = Pt(11.5); st.element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")


def para(t, bold=False, size=None, align=WD_ALIGN_PARAGRAPH.CENTER, color=None, after=4, italic=False):
    p = d.add_paragraph(); p.alignment = align; p.paragraph_format.space_after = Pt(after)
    r = p.add_run(t); r.bold = bold; r.italic = italic
    if size: r.font.size = Pt(size)
    if color: r.font.color.rgb = RGBColor.from_string(color)
    return p


def table(head, rows, widths, sizes, band="F8EAEA"):
    t = d.add_table(rows=1 + len(rows), cols=len(head)); t.style = "Table Grid"; t.autofit = False
    for j, h in enumerate(head):
        c = t.cell(0, j); c.text = ""; r = c.paragraphs[0].add_run(h); r.bold = True; r.font.color.rgb = RGBColor(255, 255, 255); shade(c, "8B0707")
    for i, row in enumerate(rows, 1):
        for j, val in enumerate(row):
            c = t.cell(i, j); c.text = ""; r = c.paragraphs[0].add_run(val)
            r.font.size = Pt(sizes[j]); r.bold = j < 2 and len(head) == 4 or (j == 0 and len(head) == 3)
            if j == 0: r.font.color.rgb = RGBColor.from_string("8B0707")
            if i % 2 == 0: shade(c, band)
    for col, w in zip(t.columns, widths): col.width = Inches(w)
    for row in t.rows:
        for c, w in zip(row.cells, widths): c.width = Inches(w)


p = para("", after=2); p.add_run().add_picture(str(HERE.parent.parent / "assets" / "senyas-logo.png"), width=Inches(0.85))
para("RATIONALE VIDEO SCRIPT (2:00)", bold=True, size=15, color="8B0707")
para("SENYAS: Biodiversity for Every Voice, Sign and Dot", bold=True, size=13, after=2)
para("FIRST LEGO League Challenge 2026–27 · BIOGLOW · Legazpi City Science High School, Legazpi City, Albay", italic=True, size=10.5, after=8)
words = sum(len(r[2].split()) for r in ROWS)
para(f"Total running time: 2 minutes · {words} words · about {words / 2.0:.0f} words per minute · one narrator, calm and clear, captions on", size=10.5, after=8)
table(["Time", "Part", "Narration", "On screen"], ROWS, [0.95, 1.0, 3.35, 1.5], [10, 10, 11.5, 9.5])

para("", after=4)
para("How SENYAS answers BIOGLOW", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, color="8B0707", after=2)
para("BIOGLOW is the biodiversity season of FIRST LEGO League. Our problem: people who are Deaf or blind are left out of learning about the "
     "living things around them, because guides and apps rely on hearing, sight, English and the internet. Our solution, SENYAS, lets anyone point "
     "a phone at a plant or an animal and receive its name as speech, as sign language and as braille, in English, Filipino or Bikol, with no signal. "
     "The same app translates sign language and reads braille, so the people who learn about nature together can also talk about it together.",
     align=WD_ALIGN_PARAGRAPH.JUSTIFY, after=8)
para("Where each Core Value shows in our work", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, color="8B0707", after=2)
table(["Core Value", "What it means", "Evidence in SENYAS"], VALUES, [1.1, 2.2, 3.5], [10.5, 10, 10])
para("", after=4)
para("Reading and filming notes", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, color="8B0707", after=2)
for n in ["Pause for one beat after “never learn its name” (0:12) and before “With SENYAS” (1:52).",
          "Say “SENYAS” as seh-NYAHS, “Bikol” as BEE-kol, “BIOGLOW” as BY-oh-glow.",
          "The scan part (0:25–1:13) is the heart of the video: film it live, outdoors, on real plants and animals; show each card exactly when its Core Value is said.",
          "The Teamwork and Fun lines should match your team's real story: change the examples to what you actually did.",
          "Figures on screen: WHO (2021) World report on hearing; WHO (2019) World report on vision. Species counts: app/vendor/species/README.txt; “300 flower photos … seven in ten” is Experiment E10 of the NSTF paper (69.4%); “171 checks” is tests/app.test.js.",
          "Keep captions on for the whole video, and add an FSL interpreter window if you can, so the video itself is inclusive."]:
    q = d.add_paragraph(n, style="List Bullet"); q.paragraph_format.space_after = Pt(2)
out = HERE / (NAME + ".docx"); d.save(out)
subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(HERE), str(out)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("words", words, "wpm", round(words / 2.0))
