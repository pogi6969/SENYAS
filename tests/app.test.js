/* SENYAS functional test: opens the website and the app in a real browser engine and tries every feature.
   Run from the repository root:  node tests/app.test.js
   Needs Playwright with Chromium. Photos for the species scan are read from tests/photos/ when present. */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path"), fs = require("fs"), os = require("os");
const ROOT = path.resolve(__dirname, "..");
const PHOTOS = process.env.SENYAS_PHOTOS || path.join(__dirname, "photos");
const VIDEO = process.env.SENYAS_VIDEO || "";

/* The site is served under /SENYAS/, the same path as on GitHub Pages. */
function serve() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "senyas-"));
  fs.symlinkSync(ROOT, path.join(dir, "SENYAS"));
  const srv = spawn("python3", ["-m", "http.server", "8790"], { cwd: dir, stdio: "ignore" });
  return new Promise((r) => setTimeout(() => r(srv), 900));
}
/* Speech is recorded instead of played, so the test can check what would be said and with which voice. */
const FAKE_SPEECH = (voices) => `
  window.__said = [];
  class U { constructor(t) { this.text = t; this.lang = ""; this.rate = 1; this.voice = null; } }
  window.SpeechSynthesisUtterance = U;
  const vs = ${JSON.stringify(voices)}.map(([name, lang]) => ({ name, lang, voiceURI: name }));
  Object.defineProperty(window, "speechSynthesis", { value: { getVoices: () => vs, speak: (u) => window.__said.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name }), cancel() {}, resume() {}, addEventListener() {} } });
`;
const B = "http://localhost:8790/SENYAS/";
const R = [], errs = [], bad = [];
const ok = (name, pass, info) => { R.push({ name, pass: !!pass, info: info === undefined ? "" : String(info).slice(0, 90) }); };

async function newPage(browser, viewport, voices) {
  const ctx = await browser.newContext({ viewport, permissions: ["camera", "microphone"] });
  await ctx.addInitScript(FAKE_SPEECH(voices || [["English", "en-US"], ["Filipino", "fil-PH"]]));
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push(e.message));
  p.on("console", (m) => { if (m.type() === "error" && /Content Security|Refused to/.test(m.text())) errs.push("CSP " + m.text().slice(0, 140)); });
  p.on("response", (r) => { if (r.status() >= 400 && !/wikipedia|jsdelivr|googleapis/.test(r.url())) bad.push(r.status() + " " + r.url()); });
  return { ctx, p };
}
const said = (p) => p.evaluate(() => window.__said.splice(0));
const tab = (p, v) => p.evaluate((v) => window.SENYAS.go(v), v);

(async () => {
  const srv = await serve();
  const args = ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"];
  if (VIDEO) args.push("--use-file-for-fake-video-capture=" + VIDEO);
  const browser = await chromium.launch({ args });
  let { ctx, p } = await newPage(browser, { width: 390, height: 844 });

  // ---------- website ----------
  await p.goto(B); await p.waitForTimeout(2000);
  ok("site: cookie banner", await p.isVisible("#ck")); await p.click("#ckYes");
  ok("site: consent cookie saved", (await ctx.cookies()).some((c) => c.name === "senyas_consent"));
  for (const l of ["fil", "bcl", "en"]) { await p.click(`.lang button[data-l=${l}]`); ok("site: language " + l, (await p.textContent("h1")).length > 10, await p.textContent("h1")); }
  ok("site: avatar demo draws", await p.evaluate(() => { const c = document.getElementById("demo"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 1000; }));
  for (const u of ["manifest.webmanifest", "sw.js", "privacy.html", "favicon.ico", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "assets/senyas-logo.png", "app/", "app/vendor/hand_landmarker.task",
    "app/vendor/vision_wasm_internal.wasm", "app/vendor/species/general.tflite", "app/vendor/species/plants.tflite", "app/vendor/species/birds.tflite", "app/vendor/species/insects.tflite", "app/vendor/species/labels.json"])
    ok("file " + u, (await p.request.get(B + u)).status() === 200);
  ok("site: every link on the page", await p.evaluate(async () => { const bad = []; for (const a of document.querySelectorAll("a[href]")) { const h = a.getAttribute("href"); if (/^(#|https?:)/.test(h)) continue; const r = await fetch(h, { method: "GET" }); if (!r.ok) bad.push(h); } return bad.length === 0; }));
  await p.goto(B + "privacy.html"); ok("privacy page", (await p.textContent("main")).includes("Camera and photos"));

  // ---------- app: first start ----------
  await p.goto(B + "app/"); await p.waitForTimeout(700);
  ok("app: consent sheet on first start", await p.isVisible("#cAll")); await p.click("#cAll");
  ok("app: version", await p.evaluate(() => window.SENYAS.version));

  // ---------- sign -> words ----------
  await p.click("#startCam");
  await p.waitForFunction(() => { const s = document.querySelector("#camStatus").textContent; return s && !/Loading/.test(s); }, null, { timeout: 90000 });
  ok("s2t: camera and hand tracking start", !(await p.isVisible("#camstart")), await p.textContent("#camStatus"));
  await said(p);
  await p.evaluate(() => { "TUBIG".split("").forEach((l) => SENYAS.onToken("l:" + l)); document.querySelector("#tSpace").click(); SENYAS.onToken("w:thankyou"); SENYAS.onToken("n:5"); });
  ok("s2t: letters become a word, word is translated", (await p.textContent("#caption")).startsWith("Water"), await p.textContent("#caption"));
  let s = await said(p); ok("s2t: read aloud says each word", s.map((x) => x.text).join("|") === "water|thank you|5", JSON.stringify(s));
  await p.selectOption("#outLang", "bcl");
  ok("s2t: Bikol output", (await p.textContent("#caption")) === "TubigDios mabalos5", await p.textContent("#caption"));
  await p.click("#tSpeak"); await p.waitForTimeout(200); s = await said(p);
  ok("s2t: Bikol sentence spoken with the Filipino voice", s.length === 1 && s[0].text === "Tubig Dios mabalos 5" && s[0].voice === "Filipino", JSON.stringify(s));
  await p.selectOption("#outLang", "fil"); ok("s2t: Filipino output", (await p.textContent("#caption")).includes("salamat"), await p.textContent("#caption"));
  await p.click("#aloudWrap"); await p.evaluate(() => SENYAS.onToken("w:hello")); s = await said(p);
  ok("s2t: read aloud OFF is silent", s.length === 0 && !(await p.isChecked("#aloud"))); await p.click("#aloudWrap");
  await p.click("#tBack"); ok("s2t: delete removes the last word", !(await p.textContent("#caption")).toLowerCase().includes("kumusta"));
  await p.click("#tBig"); ok("big text: opens", await p.isVisible("#big"), await p.textContent("#bigTxt"));
  ok("big text: fits the screen", await p.evaluate(() => { const b = document.querySelector("#bigTxt"); return b.scrollHeight <= b.clientHeight + 2 && b.scrollWidth <= b.clientWidth + 2; }));
  await p.click("#bigFlash"); ok("big text: flash", await p.evaluate(() => document.querySelector("#big").classList.contains("flash")));
  await p.click("#bigSpeak"); await p.waitForTimeout(200); ok("big text: speaks", (await said(p)).length === 1); await p.click("#bigX"); ok("big text: closes", !(await p.isVisible("#big")));
  await p.click("#tEnter"); ok("s2t: new line moves the sentence to the conversation", (await p.$$eval("#history li", (e) => e.length)) >= 1 && (await p.textContent("#caption")).includes("Sign in front"));
  for (const m of ["abc", "num", "word", "all"]) { await p.click(`#modes button[data-mode=${m}]`); }
  ok("s2t: mode buttons", await p.evaluate(() => document.querySelector("#modes .on").dataset.mode === "all"));
  await p.click("#tTeach"); await p.waitForTimeout(300); ok("teach: sheet opens with the camera inside", await p.evaluate(() => !!document.querySelector("#pcam #cam")));
  await p.fill("#tw", "test sign"); await p.click("#trec"); await p.waitForTimeout(4300);
  ok("teach: recording with no hand is refused politely", /No hand/.test(await p.textContent("#toast")), await p.textContent("#toast")); await p.click("#sheetX");
  ok("teach: camera returns to the translate screen", await p.evaluate(() => document.querySelector(".pane.s2t #cam") !== null));
  await p.click("#flipCam"); await p.waitForTimeout(1500); ok("s2t: switch camera keeps running", !(await p.isVisible("#camstart")));
  await p.click("#stopCam"); ok("s2t: stop camera", await p.isVisible("#camstart"));

  // ---------- words -> sign ----------
  await p.selectOption("#outLang", "en");
  await p.click("#dir button[data-dir=t2s]"); await p.fill("#askText", "Marhay na aga, paha na ako. Ako si Ana"); await p.click("#askForm button[type=submit]"); await p.waitForTimeout(1500);
  ok("t2s: Bikol sentence becomes signs", (await p.$$eval("#gloss .chip", (e) => e.map((x) => x.textContent).join("|"))) === "good|morning|I|thirsty|I|✋ ANA", await p.$$eval("#gloss .chip", (e) => e.map((x) => x.textContent).join("|")));
  ok("t2s: avatar is signing", await p.evaluate(() => { const c = document.getElementById("avatar"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 2000; }));
  ok("t2s: braille line", (await p.textContent("#t2sBrl")).length > 10);
  ok("t2s: meaning in three languages", (await p.$$eval("#t2sMean button", (e) => e.map((x) => x.textContent).join(" / "))).includes("BIKmarhay aga ako paha ako Ana"), await p.$$eval("#t2sMean button", (e) => e.map((x) => x.textContent).join(" / ")));
  await said(p); await p.click("#t2sMean button[data-l=bcl]"); await p.waitForTimeout(200); s = await said(p); ok("t2s: Bikol meaning is spoken", s.length === 1 && s[0].voice === "Filipino", JSON.stringify(s));
  await p.click("#aPlay"); await p.click("#aReplay"); await p.selectOption("#aSpeed", "0.5"); ok("t2s: play, replay, speed", true);
  await p.click("#quick button"); await p.waitForTimeout(300); ok("t2s: quick phrase", (await p.inputValue("#askText")).length > 3, await p.inputValue("#askText"));
  await p.click("#mic"); await p.waitForTimeout(300); ok("t2s: microphone button answers", /Listening|isn't available/.test(await p.textContent("#toast")), await p.textContent("#toast"));

  // ---------- braille ----------
  await p.click("#dir button[data-dir=brl]");
  const brl = await p.evaluate(() => { const c = document.createElement("canvas"); c.width = 900; c.height = 300; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, 900, 300); x.fillStyle = "#222";
    [...Braille.write("Dios mabalos")].forEach((ch, ci) => { const m = ch.charCodeAt(0) - 0x2800; for (let k = 0; k < 6; k++) if (m & (1 << k)) { x.beginPath(); x.arc(60 + ci * 44 + (k >= 3 ? 18 : 0), 110 + (k % 3) * 18, 6, 0, 7); x.fill(); } }); return c.toDataURL("image/png"); });
  const brlFile = path.join(os.tmpdir(), "senyas-braille.png"); fs.writeFileSync(brlFile, Buffer.from(brl.split(",")[1], "base64"));
  await said(p); await p.setInputFiles("#bFile", brlFile); await p.waitForTimeout(1200);
  ok("braille: photo is read", (await p.textContent("#bText")) === "Dios mabalos", await p.textContent("#bText"));
  ok("braille: translated", (await p.textContent("#bTrans")).includes("thank you"), await p.textContent("#bTrans"));
  s = await said(p); ok("braille: read aloud", s.length === 1 && s[0].text === "Dios mabalos", JSON.stringify(s));
  const junk = path.join(os.tmpdir(), "senyas-junk.txt"); fs.writeFileSync(junk, "not a picture");
  await p.setInputFiles("#bFile", junk); await p.waitForTimeout(300); ok("braille: a non-image file is refused", /can't be used/.test(await p.textContent("#toast")));
  await p.click("#bStop"); await p.click("#bLive"); await p.waitForTimeout(1800); ok("braille: live scan starts", !(await p.isVisible("#bstart"))); await p.click("#bStop"); ok("braille: live scan stops", await p.isVisible("#bstart"));
  await p.click(".chart summary"); ok("braille: alphabet chart", (await p.$$eval("#bChart span", (e) => e.length)) === 29);

  // ---------- species scan ----------
  await p.click("#dir button[data-dir=spc]");
  ok("species: pane opens with a hint", (await p.textContent("#sRes")).includes("Scan a plant"));
  const photo = (f) => path.join(PHOTOS, f), has = (f) => fs.existsSync(photo(f));
  async function scan(file) { await said(p); await p.evaluate(() => { document.querySelector("#sRes").innerHTML = ""; }); await p.setInputFiles("#sFile", photo(file)); await p.waitForFunction(() => document.querySelector("#sRes .spname, #sRes .ph") && !document.querySelector("#sStatus").textContent, null, { timeout: 90000 }); await p.waitForTimeout(500);
    return p.evaluate(() => ({ name: (document.querySelector(".spname") || {}).textContent || "", sci: (document.querySelector(".spsci") || {}).textContent || "", brl: (document.querySelector("#sBrl") || {}).textContent || "", none: (document.querySelector("#sRes .ph") || {}).textContent || "" })); }
  if (has("parrot.jpg")) {
    let r = await scan("parrot.jpg"); ok("species: bird photo is named", r.name === "Scarlet Macaw" && r.sci.includes("Ara macao"), r.name + " · " + r.sci);
    s = await said(p); ok("species: name is read aloud", s.length === 1 && s[0].text === "Scarlet Macaw", JSON.stringify(s));
    ok("species: name in braille", r.brl === (await p.evaluate(() => Braille.write("Scarlet Macaw"))), r.brl);
    await p.waitForTimeout(900); ok("species: avatar signs the result", await p.evaluate(() => { const c = document.getElementById("sAv"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 1500; }));
    await p.selectOption("#sLang", "bcl"); ok("species: Bikol name", (await p.textContent(".spname")) === "Gamgam: Scarlet Macaw", await p.textContent(".spname"));
    await p.click("#sSay"); await p.waitForTimeout(200); s = await said(p); ok("species: Bikol name spoken with the Filipino voice", s.length === 1 && s[0].text === "Gamgam: Scarlet Macaw" && s[0].voice === "Filipino", JSON.stringify(s));
    await p.selectOption("#sLang", "fil"); ok("species: Filipino name", (await p.textContent(".spname")) === "Ibon: Scarlet Macaw", await p.textContent(".spname"));
    await p.click("#sSign"); await p.click("#sBig"); ok("species: show big", await p.isVisible("#big")); await p.click("#bigX");
    await p.click("#sWiki"); await p.waitForTimeout(2500); ok("species: more info answers (text or a clear offline note)", (await p.textContent("#sMore")).length > 5, await p.textContent("#sMore"));
    await p.selectOption("#sLang", "en");
    r = await scan("cat.jpg"); ok("species: cat photo", /^Cat/.test(r.name), r.name);
    r = await scan("sunflower.jpg"); ok("species: flower photo", r.name === "Sunflower" && r.sci.includes("Helianthus annuus"), r.name + " · " + r.sci);
    await p.selectOption("#sLang", "bcl"); ok("species: local plant name in Bikol", (await p.textContent(".spname")) === "Mirasol", await p.textContent(".spname")); await p.selectOption("#sLang", "en");
    r = await scan("owl.jpg"); ok("species: owl photo", /Owl/.test(r.name), r.name);
    r = await scan("bird.jpg"); ok("species: small bird photo", /Chickadee/.test(r.name), r.name);
    r = await scan("grace_hopper.jpg"); ok("species: a photo of a person gives no species", r.none.includes("No plant or animal"), r.none || r.name);
    r = await scan("kite_and_cold.jpg"); ok("species: a beach scene gives no species", r.none.includes("No plant or animal"), r.none || r.name);
    ok("species: my finds list", (await p.$$eval("#finds li", (e) => e.length)) >= 5, await p.$$eval("#finds li", (e) => e.length));
  }
  await p.setInputFiles("#sFile", junk); await p.waitForTimeout(300); ok("species: a non-image file is refused", /can't be used/.test(await p.textContent("#toast")));
  await p.click("#sStop"); await p.click("#sLive"); await p.waitForSelector("#sShot:not([hidden])", { timeout: 20000 }); await p.waitForTimeout(800); await p.click("#sShot");
  await p.waitForFunction(() => !document.querySelector("#sShot").disabled, null, { timeout: 90000 });
  ok("species: live camera scan runs", (await p.textContent("#sRes")).length > 10, (await p.textContent("#sRes")).slice(0, 60));
  await p.click("#sStop"); ok("species: camera stops", await p.isVisible("#sstart"));

  // ---------- learn ----------
  await tab(p, "learn");
  ok("learn: 12 units", (await p.$$eval("#units .unit", (e) => e.length)) === 12);
  ok("learn: sign of the day", (await p.textContent("#sod")).includes("Sign of the day")); await p.click("#sodGo"); await p.waitForTimeout(300); ok("learn: sign of the day opens", await p.isVisible("#dav")); await p.click("#sheetX");
  for (let u = 0; u < 12; u++) {
    await p.click(`#units .unit[data-u="${u}"]`); await p.waitForTimeout(250);
    const title = await p.textContent("#sheetBody h2"); let steps = 0;
    while (await p.$("#ln")) { await p.click("#ln"); steps++; await p.waitForTimeout(40); }
    const quiz = !!(await p.$("#lq")); await p.click("#sheetX"); await p.waitForTimeout(80);
    ok("learn: unit " + (u + 1) + " lessons to the end", quiz && steps >= 4, title.trim() + " (" + (steps + 1) + " cards)");
  }
  await p.click('#units .unit[data-u="11"]'); await p.waitForTimeout(200); while (await p.$("#ln")) await p.click("#ln");
  await p.click("#lq"); let answered = 0;
  for (let i = 0; i < 9; i++) { await p.waitForTimeout(350); const o = await p.$(".opt"); if (!o) break; await o.click(); answered++; await p.waitForTimeout(1500); }
  ok("learn: quiz runs to the score screen", answered === 8 && (await p.isVisible("#qd")), answered + " questions; " + (await p.textContent(".wordbig")));
  await p.click("#qd"); await p.waitForTimeout(200);
  await p.click('#units .unit[data-u="0"]'); await p.waitForTimeout(200); await p.click("#lc"); await p.waitForTimeout(2500);
  ok("learn: camera practice opens with the camera", await p.evaluate(() => !!document.querySelector("#pcam #cam") && document.querySelector("#camstart").hidden));
  await p.click("#pskip"); await p.waitForTimeout(400);
  ok("learn: camera is off after practice closes", await p.evaluate(() => !document.querySelector("#video").srcObject));
  await p.click("#gReadSpell"); await p.waitForTimeout(400); await p.fill("#gin", "x"); await p.click("#gok"); await p.waitForTimeout(400); ok("game: read fingerspelling checks an answer", (await p.textContent("#gmsg")).length > 3); await p.click("#sheetX");
  await p.click("#gSpellCam"); await p.waitForTimeout(600); ok("game: spell with your hand", (await p.textContent("#sw")).length > 2); await p.click("#sheetX"); await p.waitForTimeout(300);
  await p.click("#gFlash"); await p.waitForTimeout(300); await p.click("#frev"); ok("game: flashcards reveal", await p.isVisible("#fans")); await p.click("#fknew"); await p.click("#sheetX");
  ok("learn: XP and streak counted", /🔥 1/.test(await p.textContent("#stats")), (await p.textContent("#stats")).slice(0, 40));

  // ---------- dictionary ----------
  await tab(p, "dict");
  ok("dictionary: letters and words", (await p.$$eval("#letters button", (e) => e.length)) === 28 && (await p.$$eval("#wlist .witem", (e) => e.length)) === 125, await p.$$eval("#wlist .witem", (e) => e.length));
  for (const [q, want] of [["dios mabalos", "thank you"], ["ayam", "dog"], ["kalabaw", "carabao"], ["paha", "thirsty"]]) { await p.fill("#q", q); await p.waitForTimeout(200); ok("dictionary: search “" + q + "”", (await p.textContent("#wlist")).includes(want), (await p.textContent("#wlist")).slice(0, 40)); }
  await p.fill("#q", ""); await p.click('#cats button[data-c="nature"]'); ok("dictionary: nature category", (await p.$$eval("#wlist .witem", (e) => e.length)) === 22);
  await p.click("#wlist .witem"); await p.waitForTimeout(300); await said(p); await p.click('[data-say="bcl"]'); await p.waitForTimeout(200); s = await said(p);
  ok("dictionary: Bikol word spoken", s.length === 1 && s[0].voice === "Filipino", JSON.stringify(s)); await p.click("#sheetX");
  await p.click('#cats button[data-c="abc"]'); await p.click('#letters button[data-l="Ñ"]'); await p.waitForTimeout(200); ok("dictionary: letter Ñ opens", (await p.textContent("#sheetBody h2")) === "Ñ"); await p.click("#sheetX");

  // ---------- phrases ----------
  await tab(p, "phrases");
  ok("phrases: 32 phrases", (await p.$$eval(".pitem", (e) => e.length)) === 32);
  await said(p); await p.click('.pitem [data-say="bcl"]'); await p.waitForTimeout(200); s = await said(p); ok("phrases: Bikol phrase spoken", s.length === 1 && s[0].text === "Marhay na aga", JSON.stringify(s));
  await p.click('[data-big="0"]'); ok("phrases: show big", await p.isVisible("#big")); await p.click("#bigX");
  await p.click('[data-sign="2"]'); await p.waitForTimeout(400); ok("phrases: sign it goes to the avatar", (await p.inputValue("#askText")) === "Thank you");

  // ---------- settings ----------
  await tab(p, "settings");
  for (const l of ["fil", "bcl", "en"]) { await p.selectOption("#sUi", l); const txt = await p.textContent("#app"); ok("settings: app language " + l + " has no missing words", !/undefined|\bnull\b/.test(txt), await p.textContent('.bar [data-go="learn"] span')); }
  await said(p); await p.click("#sTestV"); await p.waitForTimeout(300); s = await said(p); ok("settings: test voice says English, Filipino, Bikol", s.length === 3 && s[2].text.includes("Dios mabalos"), JSON.stringify(s.map((x) => x.voice)));
  ok("settings: voice pickers", (await p.$$eval("#sVen option", (e) => e.length)) >= 2 && (await p.$$eval("#sVfil option", (e) => e.length)) >= 2);
  for (const [id, v] of [["sHand", "left"], ["sFacing", "environment"], ["sHold", "600"], ["sTheme", "dark"], ["sFs", "18"]]) await p.selectOption("#" + id, v);
  ok("settings: theme and text size apply", await p.evaluate(() => document.documentElement.dataset.theme === "dark" && getComputedStyle(document.documentElement).getPropertyValue("--fs").trim() === "18px"));
  for (const id of ["sMirror", "sPoints", "sRepeat", "sSwap", "sHc", "sRm", "sLetters"]) await p.click(`label:has(#${id})`);
  ok("settings: switches", await p.evaluate(() => document.documentElement.classList.contains("hc")));
  await p.click("[data-tone='2']"); ok("settings: avatar skin tone", await p.evaluate(() => document.querySelector("[data-tone='2']").classList.contains("on")));
  const dl = p.waitForEvent("download"); await p.click("#sExp"); const file = await dl; const exported = path.join(os.tmpdir(), "senyas-export.json"); await file.saveAs(exported);
  const data = JSON.parse(fs.readFileSync(exported, "utf8")); ok("settings: export my data", data.app === "SENYAS" && data.settings.theme === "dark" && Array.isArray(data.finds));
  await p.selectOption("#sTheme", "light"); await p.setInputFiles("#sImp", exported); await p.waitForTimeout(600); ok("settings: import restores data", await p.evaluate(() => document.documentElement.dataset.theme === "dark"));
  fs.writeFileSync(exported, JSON.stringify({ app: "SENYAS", settings: { theme: "<img src=x onerror=window.pwned=1>", fs: "999" }, history: [{ w: "si", t: "<script>window.pwned=2</script>", at: 1 }], custom: [{ id: "abc", label: { en: "<b onmouseover=window.pwned=3>x</b>" }, means: [Array(41).fill(0.1)] }] }));
  await p.setInputFiles("#sImp", exported); await p.waitForTimeout(600); ok("settings: a hostile data file cannot run code", await p.evaluate(() => !window.pwned && document.querySelector("#sets").innerHTML.includes("&lt;b")));
  await p.click("#sPriv"); ok("settings: privacy policy", (await p.textContent("#sheetBody")).includes("Camera and photos")); await p.click("#sheetX");
  await p.click("#sCk"); await p.click("#cSv"); ok("settings: cookies and storage sheet", !(await p.isVisible("#sheet")));
  p.once("dialog", (d) => d.accept()); await p.click("#sReset"); await tab(p, "learn"); ok("settings: reset progress", (await p.textContent("#stats")).includes("0signs learned"), (await p.textContent("#stats")).slice(0, 50));
  await p.selectOption("#sTheme", "auto").catch(() => {});

  // ---------- back button, offline ----------
  await tab(p, "dict"); await p.click('#cats button[data-c="all"]'); await p.click("#wlist .witem"); await p.waitForTimeout(200); await p.goBack(); await p.waitForTimeout(200); ok("back button closes a sheet, not the app", !(await p.isVisible("#sheet")) && (await p.url()).includes("/app/"));
  ok("offline: service worker registered", await p.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())));
  await p.waitForTimeout(1500); await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1200);
  ok("offline: app opens with no internet", await p.evaluate(() => !!window.SENYAS));
  await tab(p, "translate"); await p.evaluate(() => SENYAS.setDir("spc")); if (has("parrot.jpg")) { const r = await scan("parrot.jpg"); ok("offline: species scan works with no internet", r.name === "Scarlet Macaw", r.name); await p.click("#sWiki"); await p.waitForTimeout(400); ok("offline: more info explains it needs internet", /needs the internet/.test(await p.textContent("#sMore"))); }
  await ctx.setOffline(false); await ctx.close();

  // ---------- no Filipino voice on the device: Bikol must still be spoken ----------
  ({ ctx, p } = await newPage(browser, { width: 390, height: 844 }, [["English", "en-US"], ["Indonesian", "id-ID"]]));
  await p.goto(B + "app/"); await p.waitForTimeout(600); await p.click("#cAll"); await p.selectOption("#outLang", "bcl"); await said(p);
  await p.evaluate(() => SENYAS.onToken("w:thankyou")); s = await said(p);
  ok("voice: with no Filipino voice, Bikol uses the closest voice (not English)", s.length === 1 && s[0].text === "Dios mabalos" && s[0].voice === "Indonesian", JSON.stringify(s));
  await tab(p, "settings"); ok("voice: settings explain the missing Filipino voice", (await p.textContent("#sets")).includes("no Filipino voice")); await ctx.close();
  ({ ctx, p } = await newPage(browser, { width: 390, height: 844 }, []));
  await p.goto(B + "app/"); await p.waitForTimeout(600); await p.click("#cAll"); await p.evaluate(() => SENYAS.onToken("w:hello")); s = await said(p);
  ok("voice: with no voices at all the app still asks the device to speak", s.length === 1 && s[0].lang === "en-US", JSON.stringify(s)); await ctx.close();

  // ---------- every screen size ----------
  for (const [name, w, h] of [["small phone", 320, 568], ["phone sideways", 844, 390], ["tablet", 820, 1180], ["laptop", 1366, 768], ["TV", 2560, 1440]]) {
    ({ ctx, p } = await newPage(browser, { width: w, height: h }));
    await p.goto(B + "app/"); await p.waitForTimeout(500); await p.click("#cAll");
    let over = 0; for (const v of ["translate", "learn", "dict", "phrases", "settings"]) { await tab(p, v); await p.waitForTimeout(100); over = Math.max(over, await p.evaluate(() => document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth)); }
    await tab(p, "translate"); for (const d of ["s2t", "t2s", "brl", "spc"]) { await p.evaluate((d) => SENYAS.setDir(d), d); await p.waitForTimeout(100); over = Math.max(over, await p.evaluate(() => document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth)); }
    ok("layout: " + name + " (" + w + "×" + h + ") has no sideways scrolling", over <= 0, over + " px"); await ctx.close();
  }

  await browser.close(); srv.kill();
  const failed = R.filter((r) => !r.pass);
  R.forEach((r) => console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.info ? "  [" + r.info + "]" : "")));
  console.log("\n" + (R.length - failed.length) + " of " + R.length + " checks passed");
  console.log("page errors: " + JSON.stringify(errs)); console.log("missing files: " + JSON.stringify(bad));
  process.exit(failed.length || errs.length || bad.length ? 1 : 0);
})().catch((e) => { console.error("TEST CRASHED:", e.message.split("\n").slice(0, 6).join("\n")); R.forEach((r) => console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.info ? "  [" + r.info + "]" : ""))); process.exit(2); });
