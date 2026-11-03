/* SENYAS benchmark 3: does the app fit every screen? Opens the built app at common phone, tablet,
   laptop and TV sizes and checks for sideways scrolling, a visible navigation bar, and load time.
   Run from the repository root: node research/code/bench_ui.js > research/code/results_ui.json */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const SIZES = [["Small phone", 320, 568], ["Android phone", 360, 740], ["iPhone", 390, 844], ["Large phone", 412, 915], ["Phone, sideways", 844, 390],
  ["Small tablet", 768, 1024], ["Tablet", 820, 1180], ["Tablet, sideways", 1180, 820], ["Laptop", 1366, 768], ["Desktop", 1920, 1080], ["TV / 4K (scaled)", 2560, 1440]];
(async () => {
  const srv = spawn("python3", ["-m", "http.server", "8798"], { cwd: ROOT, stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 800));
  const b = await chromium.launch(), out = [];
  for (const [name, w, h] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }), p = await ctx.newPage(), errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    const t0 = Date.now();
    await p.goto("http://localhost:8798/app/#translate", { waitUntil: "load" });
    const loadMs = Date.now() - t0;
    await p.waitForTimeout(500);
    if (await p.$("#cAll")) await p.click("#cAll");
    const res = {};
    for (const v of ["translate", "learn", "dict", "phrases", "settings"]) {
      await p.evaluate((v) => SENYAS.go(v), v); await p.waitForTimeout(150);
      res[v] = await p.evaluate(() => {
        const el = document.scrollingElement, nav = [...document.querySelectorAll(".bar .tab, .rail .tab")].filter((t) => t.offsetParent && t.getBoundingClientRect().width > 0);
        const small = [...document.querySelectorAll("button, select, .chips button")].filter((x) => x.offsetParent && x.getBoundingClientRect().height > 0 && x.getBoundingClientRect().height < 32).length;
        return { overflowX: el.scrollWidth - el.clientWidth, navTabs: nav.length, smallTargets: small };
      });
    }
    const layout = await p.evaluate(() => (getComputedStyle(document.querySelector(".bar")).display !== "none" ? "bottom tabs" : "side rail"));
    out.push({ name, w, h, loadMs, layout, views: res, errors });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close(); srv.kill();
})();
