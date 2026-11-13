/* E10: the nature scan on labelled flower photographs (TensorFlow "flower_photos", CC-BY).
   Usage: node bench_species.js <folder with daisy/ dandelion/ roses/ sunflowers/ tulips/> [photos per class]
   Every k-th photo of each class (sorted by file name) is scanned in Auto and in Plant mode. */
const { chromium } = require("playwright"), fs = require("fs"), os = require("os"), path = require("path"), { spawn } = require("child_process");
const DIR = process.argv[2], N = +(process.argv[3] || 60), ROOT = path.join(__dirname, "..", "..");
const WANT = { daisy: /Bellis|Leucanthemum|^Daisy\s*$/, dandelion: /Taraxacum/, roses: /\bRosa [a-z]/, sunflowers: /Helianthus|^Sunflower\s*$/, tulips: /Tulipa/ };  // genus level; tulips are not in the offline list
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "senyas-")); fs.symlinkSync(ROOT, path.join(dir, "SENYAS"));
  const srv = spawn("python3", ["-m", "http.server", "8791"], { cwd: dir, stdio: "ignore" }); await new Promise((r) => setTimeout(r, 900));
  const browser = await chromium.launch(), p = await browser.newPage();
  await p.goto("http://localhost:8791/SENYAS/app/"); await p.waitForTimeout(500); await p.click("#cAll").catch(() => {});
  await p.click("#dir button[data-dir=spc]"); await p.setInputFiles("#sFile", path.join(ROOT, "icons", fs.readdirSync(path.join(ROOT, "icons")).find((f) => f.endsWith(".png"))));
  await p.waitForFunction(() => document.querySelector("#sRes .spname, #sRes .ph") && !document.querySelector("#sStatus").textContent, null, { timeout: 120000 });
  const rows = [];
  for (const cls of Object.keys(WANT)) {
    const all = fs.readdirSync(path.join(DIR, cls)).filter((f) => f.endsWith(".jpg")).sort(), step = Math.floor(all.length / N);
    for (let i = 0; i < N; i++) {
      const f = all[i * step], b64 = fs.readFileSync(path.join(DIR, cls, f)).toString("base64");
      const r = await p.evaluate(async (b) => {
        const im = new Image(); im.src = "data:image/jpeg;base64," + b; await im.decode();
        const t0 = performance.now(), raw = Species.look(im), ms = performance.now() - t0, out = {};
        for (const m of ["auto", "plant"]) { const x = Species.name([raw], m); out[m] = x.ok ? { name: x.name, sci: x.sci || "", score: x.score, kind: x.kind, source: x.source, alts: (x.alts || []).map((a) => (a.name || "") + " " + (a.sci || "")) } : null; }
        return { ms, out };
      }, b64);
      const row = { cls, file: f, ms: r.ms };
      for (const m of ["auto", "plant"]) { const x = r.out[m], s = x ? x.name + " " + x.sci : ""; row[m] = x ? { label: s.trim(), score: x.score, kind: x.kind, source: x.source, top1: WANT[cls].test(s), top3: WANT[cls].test(s) || x.alts.some((a) => WANT[cls].test(a)) } : { label: "", none: true, top1: false, top3: false }; }
      rows.push(row);
    }
    console.log(cls, rows.filter((r) => r.cls === cls && r.auto.top1).length, rows.filter((r) => r.cls === cls && r.plant.top1).length, "/", N);
  }
  fs.writeFileSync(path.join(__dirname, "results_species.json"), JSON.stringify({ dataset: "TensorFlow flower_photos", perClass: N, rows }, null, 1));
  await browser.close(); srv.kill();
})();
