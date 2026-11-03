/* SENYAS benchmark 2 (Chromium via Playwright): the braille reader on generated photos, and the
   full camera path (MediaPipe Hand Landmarker + SENYAS recogniser) on rendered hands, with timings.
   Run from the repository root: node research/code/bench_browser.js > research/code/results_browser.json */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");

(async () => {
  const srv = spawn("python3", ["-m", "http.server", "8799"], { cwd: ROOT, stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 900));
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("http://localhost:8799/research/code/bench_page.html");
  await p.waitForFunction("window.ready === true", null, { timeout: 60000 });
  const out = await p.evaluate(() => window.runAll());
  console.log(JSON.stringify(out, null, 1));
  await b.close(); srv.kill();
})();
