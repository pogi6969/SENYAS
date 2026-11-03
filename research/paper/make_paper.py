#!/usr/bin/env python3
"""Builds the SENYAS NSTF research paper (DOCX and PDF) from content.py.
Two passes: the first PDF gives the page of every heading, the second writes them into the table of contents."""
import pathlib, subprocess, re, sys
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import content as C

NAME = "SENYAS_NSTF_RIM_Research_Paper"
FONT = "Times New Roman"


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hexcolor); tcPr.append(sh)


def field(par, code):
    r = par.add_run(); f1 = OxmlElement("w:fldChar"); f1.set(qn("w:fldCharType"), "begin"); r._r.append(f1)
    r2 = par.add_run(); it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = code; r2._r.append(it)
    r3 = par.add_run(); f2 = OxmlElement("w:fldChar"); f2.set(qn("w:fldCharType"), "end"); r3._r.append(f2)


def build(pages):
    d = Document()
    for s in d.sections:
        s.page_width, s.page_height = Inches(8.5), Inches(11)
        s.left_margin = s.right_margin = s.top_margin = s.bottom_margin = Inches(1)
    st = d.styles["Normal"]; st.font.name = FONT; st.font.size = Pt(12)
    st.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    pf = st.paragraph_format; pf.line_spacing = 1.5; pf.space_after = Pt(6)
    for n, size in (("Heading 1", 14), ("Heading 2", 12), ("Heading 3", 12)):
        h = d.styles[n]; h.font.name = FONT; h.font.size = Pt(size); h.font.bold = True; h.font.color.rgb = RGBColor(0, 0, 0)
        h.element.rPr.rFonts.set(qn("w:asciiTheme"), FONT) if False else None
        rf = h.element.rPr.find(qn("w:rFonts"))
        if rf is None: rf = OxmlElement("w:rFonts"); h.element.rPr.append(rf)
        for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"): rf.set(qn(a), FONT)
        for a in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
            if rf.get(qn(a)) is not None: del rf.attrib[qn(a)]
        h.font.italic = n == "Heading 3"
        h.paragraph_format.space_before = Pt(12 if n == "Heading 1" else 8); h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True; h.paragraph_format.line_spacing = 1.15

    # footer page numbers
    fp = d.sections[0].footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER; field(fp, "PAGE")

    def para(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, italic=False, size=None, after=6, spacing=None):
        p = d.add_paragraph(); p.alignment = align
        if text:
            r = p.add_run(text); r.bold = bold; r.italic = italic
            if size: r.font.size = Pt(size)
        p.paragraph_format.space_after = Pt(after)
        if spacing: p.paragraph_format.line_spacing = spacing
        return p

    def pagebreak(): d.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

    # ---------- title page ----------
    p = para(align=WD_ALIGN_PARAGRAPH.CENTER); p.add_run().add_picture(str(HERE.parent / "figures" / "legasci-logo.png"), width=Inches(1.25))
    p.add_run("    ").add_picture(str(HERE.parent.parent / "assets" / "senyas-logo.png"), width=Inches(1.25))
    para(C.TITLE, WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, after=18, spacing=1.15)
    for label, vals in (("Research Category", [C.CATEGORY]), ("Researchers", C.RESEARCHERS), ("Research Adviser", [C.ADVISER])):
        para(label, WD_ALIGN_PARAGRAPH.CENTER, bold=True, after=0)
        for v in vals: para(v, WD_ALIGN_PARAGRAPH.CENTER, after=0)
        para("", after=6)
    for v in C.SCHOOL: para(v, WD_ALIGN_PARAGRAPH.CENTER, after=0)
    para("National Science and Technology Fair 2026–2027", WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=0)
    pagebreak()

    # ---------- acknowledgment ----------
    d.add_heading("ACKNOWLEDGMENT", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    para(C.ACK)
    pagebreak()

    # ---------- abstract ----------
    d.add_heading("ABSTRACT", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    para(C.TITLE, WD_ALIGN_PARAGRAPH.CENTER, bold=True, after=2, spacing=1.15)
    para(", ".join(C.RESEARCHERS), WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=0)
    para(", ".join(C.SCHOOL), WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=10)
    para(C.ABSTRACT, spacing=1.15)
    p = para(spacing=1.15); r = p.add_run("Keywords: "); r.bold = True; p.add_run(C.KEYWORDS)
    pagebreak()

    # ---------- table of contents ----------
    para("TABLE OF CONTENTS", WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, after=12)
    heads = [("h1", "ACKNOWLEDGMENT"), ("h1", "ABSTRACT"), ("h1", "LIST OF TABLES"), ("h1", "LIST OF FIGURES")] + [(b[0], b[1]) for b in C.B if b[0] in ("h1", "h2")] + [("h1", "REFERENCES"), ("h1", "APPENDICES")]
    sec = d.sections[0]; tabpos = sec.page_width - sec.left_margin - sec.right_margin
    for kind, text in heads:
        p = d.add_paragraph(); p.paragraph_format.line_spacing = 1.15; p.paragraph_format.space_after = Pt(2)
        if kind == "h2": p.paragraph_format.left_indent = Inches(0.35)
        p.paragraph_format.tab_stops.add_tab_stop(tabpos, alignment=2, leader=1)
        r = p.add_run(text); r.bold = kind == "h1"
        p.add_run("\t" + str(pages.get(text, "")))
    pagebreak()
    caps = [("t", b[1]) for b in C.B if b[0] == "t"] + [("f", b[2]) for b in C.B if b[0] == "f"] + [("f", b[2]) for b in C.B if b[0] == "fgrow"]
    for title, kind in (("LIST OF TABLES", "t"), ("LIST OF FIGURES", "f")):
        d.add_heading(title, level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
        items = [c for k, c in caps if k == kind]
        items.sort(key=lambda c: int(re.search(r"(\d+)", c).group(1)))
        for c in items:
            q = d.add_paragraph(); q.paragraph_format.line_spacing = 1.15; q.paragraph_format.space_after = Pt(2)
            q.paragraph_format.tab_stops.add_tab_stop(tabpos, alignment=2, leader=1)
            q.add_run(c.split(". ", 1)[0] + ". " + c.split(". ", 1)[1][:80]); q.add_run("\t" + str(pages.get(c, "")))
        pagebreak()

    # ---------- body ----------
    tno = [0]
    def table(caption, rows, widths):
        cp = para(caption, WD_ALIGN_PARAGRAPH.LEFT, after=2, spacing=1.0); cp.runs[0].bold = True; cp.paragraph_format.keep_with_next = True
        t = d.add_table(rows=len(rows), cols=len(rows[0])); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
        widths = widths or [6.5 / len(rows[0])] * len(rows[0])
        tot = sum(widths); widths = [w * 6.5 / tot for w in widths]
        for col, w in zip(t.columns, widths): col.width = Inches(w)
        for i, row in enumerate(rows):
            for j, val in enumerate(row):
                c = t.cell(i, j); c.text = ""
                pp = c.paragraphs[0]; pp.paragraph_format.line_spacing = 1.0; pp.paragraph_format.space_after = Pt(0)
                r = pp.add_run(str(val)); r.font.size = Pt(10); r.bold = i == 0
                if i == 0: shade(c, "D9D9D9")
                if widths: c.width = Inches(widths[j])
        para("", after=4)

    def figure(path, caption, width):
        p = para(align=WD_ALIGN_PARAGRAPH.CENTER, after=2); p.add_run().add_picture(path, width=Inches(width)); p.paragraph_format.keep_with_next = True
        c = para(caption, WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=10, spacing=1.0); c.runs[0].font.size = Pt(10)

    def figrow(paths, caption):
        t = d.add_table(rows=1, cols=len(paths)); t.alignment = WD_TABLE_ALIGNMENT.CENTER
        for j, pth in enumerate(paths):
            pp = t.cell(0, j).paragraphs[0]; pp.alignment = WD_ALIGN_PARAGRAPH.CENTER; pp.add_run().add_picture(pth, width=Inches(1.85))
        c = para(caption, WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=10, spacing=1.0); c.runs[0].font.size = Pt(10)

    def render(blocks):
        for b in blocks:
            k = b[0]
            if k == "h1": d.add_heading(b[1], level=1)
            elif k == "h2": d.add_heading(b[1], level=2)
            elif k == "h3": d.add_heading(b[1], level=3)
            elif k == "p":
                p = para(b[1])
                if b[1].startswith("Synthesis."): p.runs[0].text = ""; p.add_run("Synthesis.").bold = True; p.add_run(b[1][len("Synthesis."):])
            elif k == "b":
                for x in b[1]: p = d.add_paragraph(x, style="List Bullet"); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            elif k == "n":
                for i, x in enumerate(b[1]): p = para(f"{i + 1}.  {x}"); p.paragraph_format.left_indent = Inches(0.35); p.paragraph_format.first_line_indent = Inches(-0.3)
            elif k == "eq":
                p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.tab_stops.add_tab_stop(tabpos, alignment=2)
                r = p.add_run(b[1]); r.italic = True; r.font.name = "Cambria Math"; p.add_run(f"\t({b[2]})")
            elif k == "t": table(b[1], b[2], b[3])
            elif k == "f": figure(b[1], b[2], b[3])
            elif k == "fgrow": figrow(b[1], b[2])
            elif k == "brl":
                import json
                rows = [["Letter", "Dots", "Cell", "Letter", "Dots", "Cell", "Letter", "Dots", "Cell"]]
                L = "abcdefghijklmnñopqrstuvwxyz"
                bits = {"a": 1, "b": 3, "c": 9, "d": 25, "e": 17, "f": 11, "g": 27, "h": 19, "i": 10, "j": 26}
                for i, c in enumerate("klmnopqrst"): bits[c] = bits["abcdefghij"[i]] | 4
                for i, c in enumerate("uvxyz"): bits[c] = bits["abcde"[i]] | 36
                bits["w"] = 58; bits["ñ"] = 59
                dots = lambda m: "-".join(str(k + 1) for k in range(6) if m >> k & 1)
                items = [(c.upper(), dots(bits[c]), chr(0x2800 + bits[c])) for c in L] + [("Number sign", "3-4-5-6", chr(0x2800 + 60)), ("Capital sign", "6", chr(0x2800 + 32))]
                while len(items) % 3: items.append(("", "", ""))
                n = len(items) // 3
                for i in range(n): rows.append(list(items[i]) + list(items[i + n]) + list(items[i + 2 * n]))
                table("Table A1. Grade 1 braille cells read by SENYAS (dot 1–3 left column, 4–6 right)", rows, [0.9, 0.75, 0.5] * 3)
            elif k == "lex":
                sys.path.insert(0, str(HERE.parent / "code"))
                out = subprocess.check_output(["node", "-e", "global.Hand=require('../../src/hand.js');global.Avatar=require('../../src/avatar.js');eval(require('fs').readFileSync('../../src/data.js','utf8')+';global.DATA=DATA');console.log(JSON.stringify(DATA.list.filter(w=>!w.num).map(w=>[w.en,w.fil,w.bcl,w.cat])))"], cwd=HERE.parent / "code")
                import json
                rows = [["English", "Filipino", "Bikol", "Group"]] + json.loads(out)
                table("Table C1. Signed words in the three languages", rows, [1.8, 1.8, 1.8, 1.1])
            elif k == "pb": pagebreak()
            elif k == "lead":
                p = para(); r = p.add_run(b[1] + " "); r.bold = True; p.add_run(b[2])
            elif k == "code":
                cp = para(b[1], WD_ALIGN_PARAGRAPH.LEFT, after=2, spacing=1.0); cp.runs[0].bold = True; cp.paragraph_format.keep_with_next = True
                t = d.add_table(rows=1, cols=1); t.style = "Table Grid"; c = t.cell(0, 0); shade(c, "F2F2F2"); c.text = ""
                for i, line in enumerate(b[2]):
                    pp = c.paragraphs[0] if i == 0 else c.add_paragraph(); pp.paragraph_format.line_spacing = 1.0; pp.paragraph_format.space_after = Pt(0)
                    r = pp.add_run(line); r.font.name = "Courier New"; r.font.size = Pt(9.5)
                para("", after=4)
            elif k == "phr":
                out = subprocess.check_output(["node", "-e", "global.Hand=require('../../src/hand.js');global.Avatar=require('../../src/avatar.js');eval(require('fs').readFileSync('../../src/data.js','utf8')+';global.DATA=DATA');console.log(JSON.stringify(DATA.phrases.map(p=>[p.en,p.fil,p.bcl,p.gloss.join(' ').toUpperCase()])))"], cwd=HERE.parent / "code")
                import json
                table("Table D1. Phrasebook in three languages and the signs used (gloss)", [["English", "Filipino", "Bikol", "Signs"]] + json.loads(out), [1.6, 1.7, 1.7, 1.5])

    render(C.B)
    pagebreak()
    d.add_heading("REFERENCES", level=1)
    for ref in C.REFERENCES:
        p = para(ref, WD_ALIGN_PARAGRAPH.LEFT, spacing=1.15); p.paragraph_format.left_indent = Inches(0.5); p.paragraph_format.first_line_indent = Inches(-0.5)
    pagebreak()
    d.add_heading("APPENDICES", level=1)
    render(C.APPENDIX)
    return d


def heading_pages(pdf):
    txt = subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"]).decode("utf-8", "ignore").split("\f")
    norm = [re.sub(r"\s+", " ", t) for t in txt]
    lead = [len(re.findall(r"\.{6,}", t)) > 4 for t in txt]
    first = [next((ln.strip() for ln in t.splitlines() if ln.strip()), "") for t in txt]
    pages = {}
    for h in ("ACKNOWLEDGMENT", "ABSTRACT"):
        for i, t in enumerate(first):
            if t.startswith(h): pages[h] = i + 1; break
    for h in ("LIST OF TABLES", "LIST OF FIGURES"):
        for i, t in enumerate(first):
            if t.startswith(h): pages[h] = i + 1; break
    body = max([i for i, x in enumerate(lead) if x] + [0]) + 1
    start = body
    for h in [b[1] for b in C.B if b[0] in ("h1", "h2")] + ["REFERENCES", "APPENDICES"]:
        key = re.sub(r"\s+", " ", h).strip()[:40]
        for i in range(start, len(txt)):
            if key in norm[i]: pages[h] = i + 1; start = i; break
    for b in C.B:
        if b[0] in ("t", "f", "fgrow"):
            cap = b[1] if b[0] == "t" else b[2]
            key = re.sub(r"\s+", " ", cap).strip()[:38]
            for i in range(body, len(txt)):
                if key in norm[i]: pages[cap] = i + 1; break
    return pages


def to_pdf(docx):
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(HERE), str(docx)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


if __name__ == "__main__":
    out = HERE / (NAME + ".docx")
    build({}).save(out); to_pdf(out)
    pages = heading_pages(HERE / (NAME + ".pdf"))
    build(pages).save(out); to_pdf(out)
    print("pages", subprocess.check_output(["pdfinfo", str(HERE / (NAME + ".pdf"))]).decode().split("Pages:")[1].split()[0], pages)
