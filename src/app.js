/* SENYAS app: live sign translator, text/voice to sign avatar, lessons, dictionary and phrasebook. */
(function () {
  "use strict";
  var VERSION = "1.0.0";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function first(s) { return String(s || "").split(" / ")[0]; }
  var INAPP = /SENYAS-App/.test(navigator.userAgent);

  /* ---------- words on screen ---------- */
  var T = {
    en: { bLive: "Scan braille live", bUpload: "Upload photo", bTip: "Hold the page flat and straight in good light. Reads Grade 1 (uncontracted) braille.", bHint: "Scan a page or upload a photo of braille. The text appears here.", bNone: "No braille found. Move closer, hold it flat and add light.", bChart: "Braille alphabet", bCellsN: "cells", tabTranslate: "Translate", tabLearn: "Learn", tabDict: "Dictionary", tabPhrases: "Phrases", tabSettings: "Settings", signToText: "Sign → Words", textToSign: "Words → Sign",
      startCamera: "Start camera", stopCamera: "Stop camera", camPrivacy: "Video stays on this device. Nothing is uploaded.", flip: "Switch camera", modeAll: "All", modeWords: "Words",
      readAloud: "Read aloud", captionHint: "Sign in front of the camera. Letters, numbers and words appear here.", space: "Space", backspace: "Delete", newLine: "New line", speak: "Speak",
      copy: "Copy", share: "Share", clear: "Clear", teachSign: "Teach a sign", play: "Play", replay: "Replay", typeHere: "Type or say something…", speakNow: "Speak", signIt: "Sign it",
      conversation: "Conversation", historyEmpty: "Your conversation appears here.", units: "Lessons", games: "Practice games", gReadSpell: "Read fingerspelling", gReadSpellD: "Watch the avatar spell, type the word.",
      gSpellCam: "Spell with your hand", gSpellCamD: "The camera checks each letter.", gFlash: "Flashcards", gFlashD: "Quick review of every sign.", searchWords: "Search in English, Filipino or Bikol",
      alphabet: "Alphabet", numbers: "Numbers", all: "All", cat_greet: "Greetings", cat_people: "People & family", cat_needs: "Everyday needs", cat_feel: "Feelings", cat_quest: "Questions",
      cat_emerg: "Emergencies", cat_time: "Time", cat_num: "Numbers 0–10", cat_a1: "Alphabet A–I", cat_a2: "Alphabet J–R", cat_a3: "Alphabet S–Z, Ñ, NG", level: "Level", streak: "day streak",
      learned: "signs learned", quiz: "Quiz", practice: "Practice with camera", next: "Next", prev: "Back", done: "Done", correct: "Correct!", wrong: "Not quite", whatSign: "What does this sign mean?",
      whichHand: "Which hand shape is", score: "Score", signThis: "Sign this", needCam: "Turn on the camera to practise.", greatJob: "Great job!", skip: "Skip", recordMine: "Record my own",
      typeWord: "Type the word", check: "Check", showAgain: "Show again", answerWas: "The answer was", sUi: "App language", sOut: "Translate into", sVoice: "Voice", sAloud: "Read translations aloud",
      sAloudD: "Says each word as it is recognised", sLetters: "Also say each letter", sRate: "Voice speed", sRecog: "Camera & signing", sHand: "Signing hand", right: "Right", left: "Left",
      sFacing: "Camera", front: "Front", back: "Back", sMirror: "Mirror the preview", sPoints: "Show hand points", sHold: "Hold time per sign", fast: "Fast", normal: "Normal", slow: "Slow",
      sRepeat: "Repeat a letter when held", sSwap: "Swap left/right detection", sAvatar: "Avatar", sTone: "Skin tone", sDisplay: "Display", sTheme: "Theme", auto: "Automatic", light: "Light", dark: "Dark",
      sText: "Text size", sContrast: "High contrast", sMotion: "Reduce motion", sMine: "My signs", sMineD: "Signs you taught SENYAS", none: "None yet", sData: "Privacy & data", privacy: "Privacy policy",
      cookies: "Cookies & storage", export: "Export my data", import: "Import data", reset: "Reset progress", wipe: "Delete all data", sure: "Are you sure?", about: "About", version: "Version", install: "Install app",
      aboutText: "SENYAS uses the manual alphabet and core signs shared by Filipino Sign Language (FSL) and ASL. Signs can vary by region — learn with your local Deaf community.",
      cTitle: "Your privacy", cText: "SENYAS works on your device. The camera picture is never uploaded or saved. SENYAS uses storage on this device (like cookies) only to remember your settings, progress and the signs you teach it — no ads and no tracking.",
      cEssential: "Essential (always on): remembers this choice", cFunctional: "Save settings, progress and my signs on this device", cAccept: "Accept all", cEssentialOnly: "Essential only", cSave: "Save choice",
      tTitle: "Teach SENYAS a sign", tPick: "Meaning", tPickD: "Pick a word from the dictionary, or write a new one.", tRec: "Record 3 takes", tRecD: "Do the sign when the count ends. Keep your hand in view.",
      tSaved: "Sign saved. SENYAS will now read it.", tNoHand: "No hand seen. Try again with your hand in view.", camFirst: "Start the camera first.", loadingModel: "Loading hand tracking…",
      showHand: "Show your hand", reading: "Reading…", camError: "The camera could not start. Allow camera access and try again.", modelError: "Hand tracking could not load. Connect once, then it works offline.",
      copied: "Copied", noSpeech: "Voice input isn't available here. Type instead.", listening: "Listening…", signer: "Signer", speaker: "Speaker", record: "Record", save: "Save", word: "Word",
      newWord: "or a new word", delete: "Delete", passed: "Passed!", tryAgain: "Try again", knew: "I knew it", again: "Again", reveal: "Show answer", personal: "Personal examples", saved: "Saved", unitDone: "Unit complete", badges: "Badges" },
    fil: { bLive: "I-scan ang braille nang live", bUpload: "Mag-upload ng larawan", bTip: "Ilapag nang patag at tuwid ang papel sa maliwanag na lugar. Bumabasa ng Grade 1 na braille.", bHint: "Mag-scan ng pahina o mag-upload ng larawan ng braille. Lalabas dito ang teksto.", bNone: "Walang nakitang braille. Lumapit, ituwid at dagdagan ang ilaw.", bChart: "Alpabeto ng braille", bCellsN: "selda", tabTranslate: "Isalin", tabLearn: "Matuto", tabDict: "Diksiyonaryo", tabPhrases: "Mga Pahayag", tabSettings: "Mga Setting", signToText: "Senyas → Salita", textToSign: "Salita → Senyas",
      startCamera: "Buksan ang camera", stopCamera: "Isara ang camera", camPrivacy: "Nananatili sa device na ito ang video. Walang ina-upload.", flip: "Palitan ang camera", modeAll: "Lahat", modeWords: "Mga Salita",
      readAloud: "Basahin nang malakas", captionHint: "Mag-senyas sa harap ng camera. Lalabas dito ang mga titik, numero at salita.", space: "Espasyo", backspace: "Burahin", newLine: "Bagong linya", speak: "Bigkasin",
      copy: "Kopyahin", share: "Ibahagi", clear: "Linisin", teachSign: "Magturo ng senyas", play: "I-play", replay: "Ulitin", typeHere: "Mag-type o magsalita…", speakNow: "Magsalita", signIt: "I-senyas",
      conversation: "Usapan", historyEmpty: "Lalabas dito ang inyong usapan.", units: "Mga Aralin", games: "Mga laro sa pagsasanay", gReadSpell: "Basahin ang fingerspelling", gReadSpellD: "Panoorin ang avatar, i-type ang salita.",
      gSpellCam: "Mag-spell gamit ang kamay", gSpellCamD: "Sinusuri ng camera ang bawat titik.", gFlash: "Flashcards", gFlashD: "Mabilis na pagbalik-aral sa bawat senyas.", searchWords: "Maghanap sa Ingles, Filipino o Bikol",
      alphabet: "Alpabeto", numbers: "Mga Numero", all: "Lahat", cat_greet: "Pagbati", cat_people: "Tao at pamilya", cat_needs: "Pang-araw-araw", cat_feel: "Damdamin", cat_quest: "Mga Tanong",
      cat_emerg: "Emerhensiya", cat_time: "Oras", cat_num: "Numero 0–10", cat_a1: "Alpabeto A–I", cat_a2: "Alpabeto J–R", cat_a3: "Alpabeto S–Z, Ñ, NG", level: "Antas", streak: "araw na sunod-sunod",
      learned: "natutunang senyas", quiz: "Pagsusulit", practice: "Sanayin sa camera", next: "Susunod", prev: "Bumalik", done: "Tapos", correct: "Tama!", wrong: "Hindi pa", whatSign: "Ano ang ibig sabihin ng senyas?",
      whichHand: "Aling hugis ng kamay ang", score: "Iskor", signThis: "I-senyas ito", needCam: "Buksan ang camera para magsanay.", greatJob: "Magaling!", skip: "Laktawan", recordMine: "I-record ang sarili ko",
      typeWord: "I-type ang salita", check: "Suriin", showAgain: "Ipakita muli", answerWas: "Ang sagot ay", sUi: "Wika ng app", sOut: "Isalin sa", sVoice: "Boses", sAloud: "Basahin nang malakas ang salin",
      sAloudD: "Binibigkas ang bawat salitang nakilala", sLetters: "Bigkasin din ang bawat titik", sRate: "Bilis ng boses", sRecog: "Camera at pag-senyas", sHand: "Kamay na ginagamit", right: "Kanan", left: "Kaliwa",
      sFacing: "Camera", front: "Harap", back: "Likod", sMirror: "I-mirror ang preview", sPoints: "Ipakita ang mga punto ng kamay", sHold: "Tagal ng bawat senyas", fast: "Mabilis", normal: "Karaniwan", slow: "Mabagal",
      sRepeat: "Ulitin ang titik kapag hinawakan", sSwap: "Baligtarin ang kaliwa/kanan", sAvatar: "Avatar", sTone: "Kulay ng balat", sDisplay: "Display", sTheme: "Tema", auto: "Awtomatiko", light: "Maliwanag", dark: "Madilim",
      sText: "Laki ng teksto", sContrast: "Mataas na contrast", sMotion: "Bawasan ang galaw", sMine: "Aking mga senyas", sMineD: "Mga senyas na itinuro mo", none: "Wala pa", sData: "Privacy at datos", privacy: "Patakaran sa privacy",
      cookies: "Cookies at storage", export: "I-export ang aking datos", import: "Mag-import ng datos", reset: "I-reset ang progreso", wipe: "Burahin lahat ng datos", sure: "Sigurado ka ba?", about: "Tungkol", version: "Bersyon", install: "I-install ang app",
      aboutText: "Ginagamit ng SENYAS ang manual alphabet at mga pangunahing senyas na pareho sa Filipino Sign Language (FSL) at ASL. Maaaring magkaiba ang senyas ayon sa lugar — matuto kasama ang lokal na Deaf community.",
      cTitle: "Ang iyong privacy", cText: "Gumagana ang SENYAS sa iyong device. Hindi kailanman ina-upload o sine-save ang larawan ng camera. Gumagamit ang SENYAS ng storage sa device na ito (parang cookies) para lang tandaan ang iyong settings, progreso at mga senyas na itinuro mo — walang ads at walang tracking.",
      cEssential: "Mahalaga (laging bukas): tinatandaan ang pagpiling ito", cFunctional: "I-save ang settings, progreso at aking senyas sa device na ito", cAccept: "Tanggapin lahat", cEssentialOnly: "Mahalaga lang", cSave: "I-save ang pinili",
      tTitle: "Turuan ang SENYAS ng senyas", tPick: "Kahulugan", tPickD: "Pumili ng salita sa diksiyonaryo, o sumulat ng bago.", tRec: "Mag-record ng 3 beses", tRecD: "Gawin ang senyas pagkatapos ng bilang. Panatilihing kita ang kamay.",
      tSaved: "Na-save. Mababasa na ito ng SENYAS.", tNoHand: "Walang nakitang kamay. Subukang muli.", camFirst: "Buksan muna ang camera.", loadingModel: "Nilo-load ang hand tracking…",
      showHand: "Ipakita ang iyong kamay", reading: "Binabasa…", camError: "Hindi nagsimula ang camera. Payagan ang camera at subukang muli.", modelError: "Hindi na-load ang hand tracking. Kumonekta minsan, saka ito gagana offline.",
      copied: "Nakopya", noSpeech: "Walang voice input dito. Mag-type na lang.", listening: "Nakikinig…", signer: "Nag-senyas", speaker: "Nagsalita", record: "I-record", save: "I-save", word: "Salita",
      newWord: "o bagong salita", delete: "Burahin", passed: "Pasado!", tryAgain: "Subukang muli", knew: "Alam ko", again: "Ulitin", reveal: "Ipakita ang sagot", personal: "Sariling halimbawa", saved: "Na-save", unitDone: "Tapos ang aralin", badges: "Mga Badge" },
    bcl: { bLive: "I-scan an braille nin live", bUpload: "Mag-upload nin ladawan", bTip: "Ilapag nin patag asin tuwid an papel sa maliwanag na lugar. Nagbabasa nin Grade 1 na braille.", bHint: "Mag-scan nin pahina o mag-upload nin ladawan kan braille. Maluwas digdi an teksto.", bNone: "Mayong nahiling na braille. Magdani, tuwidon asin dugangan an liwanag.", bChart: "Alpabeto kan braille", bCellsN: "selda", tabTranslate: "Isalin", tabLearn: "Mag-adal", tabDict: "Diksiyonaryo", tabPhrases: "Mga Taram", tabSettings: "Mga Setting", signToText: "Senyas → Tataramon", textToSign: "Tataramon → Senyas",
      startCamera: "Bukasan an kamera", stopCamera: "Serrahan an kamera", camPrivacy: "Yaon sana sa device na ini an video. Mayong ina-upload.", flip: "Ribayan an kamera", modeAll: "Gabos", modeWords: "Mga Tataramon",
      readAloud: "Basahon nin makusog", captionHint: "Magsenyas sa atubangan kan kamera. Maluwas digdi an mga letra, numero asin tataramon.", space: "Espasyo", backspace: "Puraon", newLine: "Bagong linya", speak: "Sabihon",
      copy: "Kopyahon", share: "I-share", clear: "Limpyohan", teachSign: "Magtukdo nin senyas", play: "I-play", replay: "Giraray", typeHere: "Mag-type o magtaram…", speakNow: "Magtaram", signIt: "I-senyas",
      conversation: "Olay", historyEmpty: "Maluwas digdi an saindong olay.", units: "Mga Leksyon", games: "Mga kawat pampraktis", gReadSpell: "Basahon an fingerspelling", gReadSpellD: "Hilingon an avatar, i-type an tataramon.",
      gSpellCam: "Mag-spell gamit an kamot", gSpellCamD: "Sinisiyasat kan kamera an kada letra.", gFlash: "Flashcards", gFlashD: "Madaliang pagbalik-adal sa kada senyas.", searchWords: "Maghanap sa Ingles, Filipino o Bikol",
      alphabet: "Alpabeto", numbers: "Mga Numero", all: "Gabos", cat_greet: "Pagbati", cat_people: "Tawo asin pamilya", cat_needs: "Kaipuhan aroaldaw", cat_feel: "Pagmati", cat_quest: "Mga Hapot",
      cat_emerg: "Emerhensiya", cat_time: "Oras", cat_num: "Numero 0–10", cat_a1: "Alpabeto A–I", cat_a2: "Alpabeto J–R", cat_a3: "Alpabeto S–Z, Ñ, NG", level: "Lebel", streak: "aldaw na sunod-sunod",
      learned: "nanodan na senyas", quiz: "Quiz", practice: "Praktisan sa kamera", next: "Sunod", prev: "Balik", done: "Tapos", correct: "Tama!", wrong: "Dai pa", whatSign: "Ano an buot sabihon kan senyas?",
      whichHand: "Arin na porma kan kamot an", score: "Iskor", signThis: "I-senyas ini", needCam: "Bukasan an kamera tanganing magpraktis.", greatJob: "Marhay na gibo!", skip: "Laktawan", recordMine: "I-record an sako",
      typeWord: "I-type an tataramon", check: "Siyasaton", showAgain: "Ipahiling giraray", answerWas: "An simbag iyo an", sUi: "Tataramon kan app", sOut: "Isalin sa", sVoice: "Boses", sAloud: "Basahon nin makusog an salin",
      sAloudD: "Sinasabi an kada tataramon na namidbid", sLetters: "Sabihon man an kada letra", sRate: "Bilis kan boses", sRecog: "Kamera asin pagsenyas", sHand: "Kamot na gamit", right: "Tuo", left: "Wala",
      sFacing: "Kamera", front: "Atubangan", back: "Likod", sMirror: "I-mirror an preview", sPoints: "Ipahiling an mga punto kan kamot", sHold: "Haba kan kada senyas", fast: "Madali", normal: "Normal", slow: "Hinay",
      sRepeat: "Ulitan an letra kun dai binabago", sSwap: "Baliktaron an wala/tuo", sAvatar: "Avatar", sTone: "Kolor kan kudit", sDisplay: "Display", sTheme: "Tema", auto: "Awtomatiko", light: "Maliwanag", dark: "Madiklom",
      sText: "Kadakulaon kan teksto", sContrast: "Halangkaw na contrast", sMotion: "Bawasan an kiwa", sMine: "Sakong mga senyas", sMineD: "Mga senyas na itinukdo mo", none: "Mayo pa", sData: "Privacy asin datos", privacy: "Palisiya sa privacy",
      cookies: "Cookies asin storage", export: "I-export an sakong datos", import: "Mag-import nin datos", reset: "I-reset an progreso", wipe: "Puraon gabos na datos", sure: "Sigurado ka?", about: "Manongod", version: "Bersyon", install: "I-install an app",
      aboutText: "Gamit kan SENYAS an manual alphabet asin mga pangenot na senyas na parehas sa Filipino Sign Language (FSL) asin ASL. Puwedeng magkaiba an senyas segun sa lugar — mag-adal kaiba an lokal na Deaf community.",
      cTitle: "An saimong privacy", cText: "Nagagana an SENYAS sa saimong device. Dai nanggad ina-upload o sine-save an ladawan kan kamera. Naggagamit an SENYAS nin storage sa device na ini (arog kan cookies) tanganing girumdomon sana an saimong settings, progreso asin mga senyas na itinukdo mo — mayong ads asin mayong tracking.",
      cEssential: "Kaipuhan (pirmeng bukas): ginigirumdom an pagpili na ini", cFunctional: "I-save an settings, progreso asin sakong senyas sa device na ini", cAccept: "Akoon gabos", cEssentialOnly: "Kaipuhan sana", cSave: "I-save an pinili",
      tTitle: "Tukduan an SENYAS nin senyas", tPick: "Kahulugan", tPickD: "Magpili nin tataramon sa diksiyonaryo, o magsurat nin bago.", tRec: "Mag-record nin 3 beses", tRecD: "Gibohon an senyas pagkatapos kan bilang. Ipahiling an kamot.",
      tSaved: "Na-save. Mababasa na ini kan SENYAS.", tNoHand: "Mayong nahiling na kamot. Probaran giraray.", camFirst: "Bukasan muna an kamera.", loadingModel: "Nilo-load an hand tracking…",
      showHand: "Ipahiling an saimong kamot", reading: "Binabasa…", camError: "Dai nagpuon an kamera. Tugotan an kamera asin probaran giraray.", modelError: "Dai na-load an hand tracking. Magkonekta minsan, dangan magagana offline.",
      copied: "Nakopya", noSpeech: "Mayong voice input digdi. Mag-type na sana.", listening: "Nagdadangog…", signer: "Nagsenyas", speaker: "Nagtaram", record: "I-record", save: "I-save", word: "Tataramon",
      newWord: "o bagong tataramon", delete: "Puraon", passed: "Pasado!", tryAgain: "Probaran giraray", knew: "Aram ko", again: "Giraray", reveal: "Ipahiling an simbag", personal: "Sadiring halimbawa", saved: "Na-save", unitDone: "Tapos an leksyon", badges: "Mga Badge" }
  };
  function t(k) { return (T[S.ui] && T[S.ui][k]) || T.en[k] || k; }

  /* ---------- storage, with the visitor's consent ---------- */
  var mem = {}, consent = null;
  try { consent = JSON.parse(localStorage.getItem("senyas.consent")); } catch (e) {}
  function canStore() { return !!(consent && consent.functional); }
  function load(k, d) {
    if (canStore()) { try { var v = localStorage.getItem("senyas." + k); if (v != null) return JSON.parse(v); } catch (e) {} }
    return k in mem ? mem[k] : d;
  }
  function save(k, v) { mem[k] = v; if (canStore()) { try { localStorage.setItem("senyas." + k, JSON.stringify(v)); } catch (e) {} } }
  function setConsent(func) {
    consent = { functional: !!func, at: new Date().toISOString(), v: 1 };
    try { localStorage.setItem("senyas.consent", JSON.stringify(consent)); } catch (e) {}
    if (func) { Object.keys(mem).forEach(function (k) { save(k, mem[k]); }); }
    else { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("senyas.") === 0 && k !== "senyas.consent") localStorage.removeItem(k); }); } catch (e) {} }
  }

  var guess = /^(fil|tl)/i.test(navigator.language || "") ? "fil" : "en";
  var S = Object.assign({ ui: guess, out: guess, inLang: guess, aloud: true, letters: false, rate: 1, hand: "right", facing: "user", mirror: true, points: true, hold: 400,
    repeat: false, swap: false, tone: 1, theme: "auto", fs: 16, hc: false, rm: false, mode: "all", speed: 1 }, load("settings", {}));
  function saveS() { save("settings", S); }
  var P = Object.assign({ xp: 0, days: [], learned: {}, quiz: {}, cam: {}, flash: {} }, load("progress", {}));
  function saveP() { save("progress", P); }
  var CUSTOM = load("custom", []), PERSONAL = load("personal", []), HIST = load("history", []);

  /* ---------- speech out and in ---------- */
  var synth = window.speechSynthesis, CODES = { en: ["en-PH", "en-US", "en-GB", "en"], fil: ["fil-PH", "fil", "tl-PH", "tl"], bcl: ["fil-PH", "fil", "tl-PH", "tl"] };
  function voiceFor(lang) {
    var vs = synth ? synth.getVoices() : [], list = CODES[lang] || CODES.en;
    for (var i = 0; i < list.length; i++) {
      var c = list[i].toLowerCase();
      var v = vs.filter(function (x) { return x.lang.replace("_", "-").toLowerCase().indexOf(c) === 0; })[0];
      if (v) return v;
    }
    return null;
  }
  function say(text, lang, flush) {
    if (!text) return;
    lang = lang || S.out;
    if (window.SenyasNative && window.SenyasNative.speak) { try { window.SenyasNative.speak(String(text), (CODES[lang] || CODES.en)[0], S.rate, !!flush); } catch (e) {} return; }
    if (!synth) return;
    if (flush) synth.cancel();
    var u = new SpeechSynthesisUtterance(text), v = voiceFor(lang);
    if (v) u.voice = v;
    u.lang = v ? v.lang : (CODES[lang] || CODES.en)[0]; u.rate = S.rate;
    synth.speak(u);
  }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
  window.senyasHeard = function (text, final) { if (window.__heard) window.__heard(text, final !== false); };
  function listen(lang, cb) {
    if (window.SenyasNative && window.SenyasNative.listen) { window.__heard = cb; window.SenyasNative.listen(lang === "en" ? "en-PH" : "fil-PH"); return true; }
    if (!SR) return false;
    rec = new SR(); rec.lang = lang === "en" ? "en-PH" : "fil-PH"; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = function (e) { var s = ""; for (var i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; cb(s, e.results[e.results.length - 1].isFinal); };
    rec.onerror = function () { cb(null, true); }; rec.onend = function () { rec = null; cb(null, true); };
    rec.start(); return true;
  }

  /* ---------- small helpers ---------- */
  var toastT = 0;
  function toast(msg) { var el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("on"); }, 2200); }
  var sheetClose = null;
  function openSheet(html, onClose) {
    if (!$("#sheet").hidden) closeSheet(true);
    $("#sheetBody").innerHTML = html; $("#sheet").hidden = false; sheetClose = onClose || null;
    try { history.pushState({ sheet: 1 }, ""); } catch (e) {}
    return $("#sheetBody");
  }
  function closeSheet(silent) {
    if ($("#sheet").hidden) return;
    $("#sheet").hidden = true; Cam.unmount();
    var f = sheetClose; sheetClose = null; if (f) f();
    $("#sheetBody").innerHTML = "";
    if (!silent && history.state && history.state.sheet) { try { history.back(); } catch (e) {} }
  }
  window.addEventListener("popstate", function () { if (!$("#sheet").hidden) closeSheet(true); });
  $("#sheetX").onclick = function () { closeSheet(); };
  $("#sheet").addEventListener("click", function (e) { if (e.target.id === "sheet") closeSheet(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

  function applyText() {
    document.documentElement.lang = S.ui === "fil" ? "fil" : S.ui === "bcl" ? "bcl" : "en";
    $$("[data-t]").forEach(function (el) { el.textContent = t(el.dataset.t); });
    $$("[data-tt]").forEach(function (el) { el.title = t(el.dataset.tt); el.setAttribute("aria-label", t(el.dataset.tt)); });
    $$("[data-ph]").forEach(function (el) { el.placeholder = t(el.dataset.ph); });
    $("#history").dataset.empty = t("historyEmpty");
  }
  function applyLook() {
    var r = document.documentElement;
    if (S.theme === "auto") r.removeAttribute("data-theme"); else r.dataset.theme = S.theme;
    r.classList.toggle("hc", !!S.hc); r.classList.toggle("rm", !!S.rm);
    r.style.setProperty("--fs", S.fs + "px");
    var dark = S.theme === "dark" || (S.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    $$('meta[name="theme-color"]').forEach(function (m) { m.content = dark ? "#0B1220" : "#0E5BD8"; });
  }
  function wordText(w, lang) { return first(w[lang || S.ui]); }
  function itemOf(key) {
    var k = key.slice(0, 1), v = key.slice(2);
    if (k === "l") return { key: key, label: v, spec: v === "NG" ? Avatar.letterSpec("N") + " " + Avatar.letterSpec("G") : Avatar.letterSpec(v), tok: v === "NG" ? null : key, letter: v };
    if (k === "n") { var w = DATA.words["n" + v]; return { key: key, label: v, spec: w.spec, tok: key, w: w }; }
    var ww = DATA.words[v]; return { key: key, label: wordText(ww), spec: ww.spec, face: ww.face, tok: DATA.LIVE.indexOf(v) >= 0 ? key : null, w: ww };
  }

  /* ---------- camera and hand tracking ---------- */
  var Cam = (function () {
    var C = { on: false, lm: null, handler: null }, video = $("#video"), ov = $("#overlay"), box = $("#cam"), home = box.parentNode, homeNext = box.nextSibling, stream = null, raf = 0, lastT = -1, loading = null;
    var CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
    function status(s) { $("#camStatus").textContent = s || ""; }
    function simd() { try { return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])); } catch (e) { return false; } }
    function model() {
      if (loading) return loading;
      loading = (async function () {
        var mp;
        try { mp = await import("./vendor/vision_bundle.mjs"); } catch (e) { mp = await import(CDN + "/vision_bundle.mjs"); }
        var files = simd() ? { wasmLoaderPath: new URL("vendor/vision_wasm_internal.js", location.href).href, wasmBinaryPath: new URL("vendor/vision_wasm_internal.wasm", location.href).href } : await mp.FilesetResolver.forVisionTasks(CDN + "/wasm");
        var local = new URL("vendor/hand_landmarker.task", location.href).href, remote = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
        async function make(f, path, delegate) { return mp.HandLandmarker.createFromOptions(f, { baseOptions: { modelAssetPath: path, delegate: delegate }, runningMode: "VIDEO", numHands: 2, minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5 }); }
        var tries = [[files, local, "GPU"], [files, local, "CPU"], [await mp.FilesetResolver.forVisionTasks(CDN + "/wasm"), remote, "CPU"]];
        for (var i = 0; i < tries.length; i++) { try { return await make(tries[i][0], tries[i][1], tries[i][2]); } catch (e) { if (i === tries.length - 1) throw e; } }
      })();
      loading.catch(function () { loading = null; });
      return loading;
    }
    C.sess = new Recog.Session({
      shape: function (d) { if (C.handler && C.handler.shape) C.handler.shape(d); },
      commit: function (d) { if (C.handler && C.handler.commit) C.handler.commit(d.tok, d); },
      idle: function () { if (C.handler && C.handler.idle) C.handler.idle(); }
    });
    C.refresh = function () {
      var s = C.sess; s.hold = S.hold; s.swap = S.swap; s.lefty = S.hand === "left"; s.repeat = S.repeat;
      s.user = PERSONAL.concat(CUSTOM.filter(function (c) { return !c.dyn; }).reduce(function (a, c) { return a.concat(c.means.map(function (f) { return { l: "u:" + c.id, f: f }; })); }, []));
      s.custom = CUSTOM.filter(function (c) { return c.dyn; });
      box.classList.toggle("mirror", S.mirror && S.facing === "user");
    };
    function draw(res) {
      var ctx = ov.getContext("2d");
      if (ov.width !== video.videoWidth) { ov.width = video.videoWidth; ov.height = video.videoHeight; }
      ctx.clearRect(0, 0, ov.width, ov.height);
      if (!S.points || !res.landmarks) return;
      var W = ov.width, H = ov.height, L = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [5, 9, 10, 11, 12], [9, 13, 14, 15, 16], [13, 17, 18, 19, 20], [0, 17]];
      res.landmarks.forEach(function (lm, h) {
        ctx.strokeStyle = h ? "#F2A900" : "#5B9BFF"; ctx.lineWidth = Math.max(2, W / 220); ctx.lineCap = "round";
        L.forEach(function (ch) { ctx.beginPath(); ch.forEach(function (i, n) { var p = lm[i]; if (n) ctx.lineTo(p.x * W, p.y * H); else ctx.moveTo(p.x * W, p.y * H); }); ctx.stroke(); });
        ctx.fillStyle = "#fff"; lm.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x * W, p.y * H, Math.max(2.5, W / 200), 0, 7); ctx.fill(); });
      });
    }
    function loop() {
      raf = 0; if (!C.on) return;
      if (video.readyState >= 2 && video.currentTime !== lastT) {
        lastT = video.currentTime;
        var now = performance.now(), res;
        try { res = C.lm.detectForVideo(video, now); } catch (e) { res = null; }
        if (res) { draw(res); C.sess.frame(res, now, video.videoWidth / video.videoHeight); if (!res.landmarks.length) status(t("showHand")); else status(""); }
      }
      raf = requestAnimationFrame(loop);
    }
    C.start = async function () {
      if (C.on) return true;
      $("#startCam").disabled = true; status(t("loadingModel"));
      try { C.lm = await model(); } catch (e) { status(""); toast(t("modelError")); $("#startCam").disabled = false; return false; }
      try {
        var low = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: S.facing, width: { ideal: low ? 640 : 960 }, height: { ideal: low ? 480 : 720 } } });
      } catch (e) { status(""); toast(t("camError")); $("#startCam").disabled = false; return false; }
      video.srcObject = stream; try { await video.play(); } catch (e) {}
      C.on = true; C.refresh(); box.classList.add("live"); $("#camstart").hidden = true; $("#startCam").disabled = false; status(t("showHand"));
      loop(); return true;
    };
    C.stop = function () {
      C.on = false; if (raf) cancelAnimationFrame(raf); raf = 0;
      if (stream) stream.getTracks().forEach(function (tr) { tr.stop(); }); stream = null; video.srcObject = null;
      ov.getContext("2d").clearRect(0, 0, ov.width, ov.height); box.classList.remove("live"); $("#camstart").hidden = false; status(""); $("#badge").hidden = true;
    };
    C.flip = async function () { S.facing = S.facing === "user" ? "environment" : "user"; saveS(); if (C.on) { C.stop(); await C.start(); } C.refresh(); };
    C.mount = function (el) { el.appendChild(box); };
    C.unmount = function () { if (box.parentNode !== home) home.insertBefore(box, homeNext); C.handler = translateHandler; C.sess.mode = S.mode; };
    C.preload = function () { model().catch(function () {}); };
    document.addEventListener("visibilitychange", function () { if (document.hidden && C.on) { C.wasOn = true; C.stop(); } else if (!document.hidden && C.wasOn) { C.wasOn = false; C.start(); } });
    return C;
  })();
  $("#startCam").onclick = function () { Cam.start(); };
  $("#stopCam").onclick = function () { Cam.stop(); };
  $("#flipCam").onclick = function () { Cam.flip(); };

  /* ---------- sign -> words ---------- */
  var tokens = [], spell = "";
  function tokText(tk, lang) {
    lang = lang || S.out;
    if (tk.k === "w") return wordText(DATA.words[tk.id], lang);
    if (tk.k === "n") return String(tk.n);
    if (tk.k === "u") { var c = CUSTOM.filter(function (x) { return x.id === tk.id; })[0]; return c ? (c.label[lang] || c.label.en || c.label.fil || c.label.bcl) : "?"; }
    return tk.text.charAt(0) + tk.text.slice(1).toLowerCase();
  }
  function tokLabel(tok) {
    var k = tok.slice(0, 1), v = tok.slice(2);
    if (k === "l" || k === "n") return v;
    if (k === "w") return wordText(DATA.words[v], S.out);
    var c = CUSTOM.filter(function (x) { return x.id === v; })[0];
    return c ? (c.word ? wordText(DATA.words[c.word], S.out) : c.label[S.out] || c.label.en) : "?";
  }
  function sentence(lang) { var s = tokens.map(function (tk) { return tokText(tk, lang); }).join(" "); return s.charAt(0).toUpperCase() + s.slice(1); }
  function renderCaption() {
    $("#spell").textContent = spell;
    var c = $("#caption");
    if (!tokens.length) { c.innerHTML = '<span class="ph">' + esc(t("captionHint")) + "</span>"; return; }
    c.innerHTML = tokens.map(function (tk, i) { var s = tokText(tk); if (!i) s = s.charAt(0).toUpperCase() + s.slice(1); return '<span class="tok">' + esc(s) + "</span>"; }).join("");
  }
  function pushTok(tk) { tokens.push(tk); renderCaption(); if (S.aloud) say(tokText(tk), S.out); }
  function flush() {
    if (!spell) return;
    var w = DATA.find(spell), s = spell; spell = "";
    pushTok(w ? { k: "w", id: w.id, sp: s } : { k: "s", text: s });
  }
  function onToken(tok) {
    var k = tok.slice(0, 1), v = tok.slice(2);
    if (k === "l") { spell += v; renderCaption(); if (S.aloud && S.letters) say(v, "en", false); return; }
    flush();
    if (k === "n") pushTok({ k: "n", n: +v });
    else if (k === "w") pushTok({ k: "w", id: v });
    else { var c = CUSTOM.filter(function (x) { return x.id === v; })[0]; if (c && c.word) pushTok({ k: "w", id: c.word }); else pushTok({ k: "u", id: v }); }
  }
  var idleT = 0;
  var translateHandler = {
    shape: function (d) {
      var b = $("#badge");
      if (!d || d.rec) { b.hidden = true; return; }
      b.hidden = false; $("#badgeTxt").textContent = tokLabel(d.tok); $("#badgeBar").style.width = Math.round(d.conf * 100) + "%";
    },
    commit: function (tok) { onToken(tok); clearTimeout(idleT); idleT = setTimeout(newLine, 7000); },
    idle: function () { flush(); }
  };
  Cam.handler = translateHandler;
  function newLine() { flush(); if (!tokens.length) return; addHist("si", sentence(S.out)); tokens = []; renderCaption(); }
  function addHist(who, text) {
    HIST.push({ w: who, t: text, at: Date.now() }); if (HIST.length > 60) HIST.shift(); save("history", HIST); renderHist();
  }
  function renderHist() {
    $("#history").innerHTML = HIST.map(function (h) {
      var d = new Date(h.at);
      return '<li class="' + h.w + '"><small>' + esc(t(h.w === "si" ? "signer" : "speaker")) + " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "</small>" + esc(h.t) + "</li>";
    }).join("");
    var o = $("#history"); o.scrollTop = o.scrollHeight;
  }
  $("#histClear").onclick = function () { HIST = []; save("history", HIST); renderHist(); };
  $("#tSpace").onclick = function () { flush(); };
  $("#tBack").onclick = function () { if (spell) spell = spell.slice(0, -1); else tokens.pop(); renderCaption(); };
  $("#tEnter").onclick = newLine;
  $("#tSpeak").onclick = function () { flush(); say(sentence(S.out), S.out, true); };
  $("#tClear").onclick = function () { tokens = []; spell = ""; renderCaption(); };
  $("#tCopy").onclick = function () { flush(); var s = sentence(S.out); if (navigator.clipboard) navigator.clipboard.writeText(s).then(function () { toast(t("copied")); }); };
  $("#tShare").onclick = function () { flush(); var s = sentence(S.out); if (navigator.share) navigator.share({ text: s }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(s).then(function () { toast(t("copied")); }); };
  $("#aloud").onchange = function () { S.aloud = this.checked; $("#bAloud").checked = S.aloud; saveS(); if (!S.aloud && synth) synth.cancel(); toast(t("readAloud") + ": " + (S.aloud ? "ON" : "OFF")); };
  $("#outLang").onchange = function () { S.out = this.value; saveS(); renderCaption(); };
  $$("#modes button").forEach(function (b) { b.onclick = function () { S.mode = b.dataset.mode; Cam.sess.mode = S.mode; saveS(); $$("#modes button").forEach(function (x) { x.classList.toggle("on", x === b); }); }; });
  document.addEventListener("keydown", function (e) {
    if (current !== "translate" || !$("#sheet").hidden || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName)) return;
    if (e.key === " ") { e.preventDefault(); flush(); } else if (e.key === "Backspace") { e.preventDefault(); $("#tBack").onclick(); } else if (e.key === "Enter") { e.preventDefault(); newLine(); }
  });

  /* ---------- words -> sign ---------- */
  var player = new Avatar.Player($("#avatar"), { tone: S.tone }), items = [], chips = [];
  player.onitem = function (i) {
    var it = items[i]; if (!it) return;
    $("#nowSign").textContent = it.label;
    $$("#gloss .chip").forEach(function (c, n) { c.classList.toggle("on", n === it.chip); });
  };
  player.onend = function () { $("#aPlay use").setAttribute("href", "#i-play"); $$("#gloss .chip").forEach(function (c) { c.classList.remove("on"); }); setTimeout(function () { $("#nowSign").textContent = ""; }, 900); };
  function buildItems(text, lang) {
    var segs = DATA.toSigns(text), out = [], ch = [];
    segs.forEach(function (sg) {
      if (sg.word) { ch.push({ label: wordText(sg.word, lang) }); out.push({ spec: sg.word.spec, face: sg.word.face, label: wordText(sg.word, lang), chip: ch.length - 1 }); }
      else {
        ch.push({ label: sg.spell, spell: true });
        sg.spell.replace(/[^A-ZÑ]/g, "").split("").forEach(function (c) { var sp = Avatar.letterSpec(c); if (sp) out.push({ spec: sp, label: c, chip: ch.length - 1, hold: 200 }); });
      }
    });
    return { items: out, chips: ch };
  }
  function signText(text, lang, noHist) {
    text = (text || "").trim(); if (!text) return;
    var b = buildItems(text, lang || S.inLang); items = b.items; chips = b.chips;
    $("#gloss").innerHTML = chips.map(function (c, i) { return '<button class="chip" data-i="' + i + '">' + (c.spell ? "✋ " : "") + esc(c.label) + "</button>"; }).join("");
    $$("#gloss .chip").forEach(function (c) { c.onclick = function () { var n = +c.dataset.i; player.play(items.filter(function (it) { return it.chip === n; })); $("#aPlay use").setAttribute("href", "#i-pause"); }; });
    player.speed = S.speed; player.play(items); $("#aPlay use").setAttribute("href", "#i-pause");
    $("#t2sBrl").textContent = Braille.write(text);
    if (!noHist) addHist("sp", text);
  }
  $("#askForm").onsubmit = function (e) { e.preventDefault(); signText($("#askText").value); };
  $("#askText").addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); signText(this.value); } });
  $("#aPlay").onclick = function () {
    if (player.playing) { player.pause(); $("#aPlay use").setAttribute("href", "#i-play"); }
    else if (items.length) { player.play(); $("#aPlay use").setAttribute("href", "#i-pause"); }
  };
  $("#aReplay").onclick = function () { if (items.length) { player.play(items); $("#aPlay use").setAttribute("href", "#i-pause"); } };
  $("#aSpeed").onchange = function () { S.speed = +this.value; player.speed = S.speed; saveS(); };
  $("#inLang").onchange = function () { S.inLang = this.value; saveS(); renderQuick(); };
  $("#mic").onclick = function () {
    var m = this;
    if (rec) { rec.stop(); return; }
    var ok = listen(S.inLang, function (text, final) {
      if (text) $("#askText").value = text;
      if (final) { m.classList.remove("on"); if (text) signText(text); }
    });
    if (!ok) toast(t("noSpeech")); else { m.classList.add("on"); toast(t("listening")); }
  };
  function renderQuick() {
    $("#quick").innerHTML = DATA.phrases.slice(0, 14).map(function (p, i) { return '<button data-i="' + i + '">' + esc(p[S.inLang]) + "</button>"; }).join("");
    $$("#quick button").forEach(function (b) { b.onclick = function () { var p = DATA.phrases[+b.dataset.i]; $("#askText").value = p[S.inLang]; signText(p[S.inLang]); }; });
  }
  $$("#dir button").forEach(function (b) { b.onclick = function () { setDir(b.dataset.dir); }; });
  function setDir(d) {
    $$("#dir button").forEach(function (x) { x.classList.toggle("on", x.dataset.dir === d); });
    $(".tgrid").classList.toggle("t2s", d === "t2s"); $(".tgrid").classList.toggle("brl", d === "brl");
    if (d !== "brl" && BR) BR.stop();
    if (d === "brl" && Cam.on) Cam.stop();
    player.redraw();
  }

  /* ---------- braille: photo or live camera -> text ---------- */
  function makeBraille() {
    var B = { on: false, stream: null, timer: 0, last: "", same: 0, said: "", text: "" }, v = $("#bvideo"), ov = $("#boverlay"), img = $("#bimg");
    function st(s) { $("#bStatus").textContent = s || ""; }
    function drawMarks(res, w, h) {
      ov.width = w; ov.height = h;
      var c = ov.getContext("2d"); c.clearRect(0, 0, w, h);
      if (!res) return;
      c.lineWidth = Math.max(2, w / 400);
      res.boxes.forEach(function (b) { c.save(); c.translate(b.x, b.y); c.rotate(b.ang || 0); c.strokeStyle = "rgba(242,169,0,.9)"; c.strokeRect(0, 0, b.w, b.h); c.restore(); });
      c.fillStyle = "rgba(91,155,255,.85)";
      res.dots.forEach(function (d) { c.beginPath(); c.arc(d.x, d.y, Math.max(3, d.r), 0, 7); c.fill(); });
    }
    function show(res, live) {
      if (!res || !res.cells || res.conf < 0.5) {
        if (!live) { $("#bText").innerHTML = '<span class="ph">' + esc(t("bNone")) + "</span>"; $("#bCells").textContent = ""; $("#bTrans").textContent = ""; $("#bInfo").textContent = ""; }
        return;
      }
      B.text = res.text;
      $("#bCells").textContent = res.braille;
      $("#bText").textContent = res.text;
      $("#bInfo").textContent = res.cells + " " + t("bCellsN") + " · " + Math.round(res.conf * 100) + "%";
      var w = DATA.find(res.text), tr = w ? wordText(w, S.out) : DATA.toSigns(res.text).filter(function (x) { return x.word; }).map(function (x) { return wordText(x.word, S.out); }).join(" ");
      $("#bTrans").textContent = tr && DATA.key(tr) !== DATA.key(res.text) ? "→ " + tr : "";
      if (S.aloud && res.text !== B.said) { B.said = res.text; say(res.text, S.out, true); }
    }
    B.file = function (f) {
      if (!f) return;
      B.stop();
      var url = URL.createObjectURL(f);
      img.onload = function () {
        img.hidden = false; $("#bcam").classList.add("live"); $("#bstart").hidden = true;
        var res = Braille.scan(img, 1400);
        drawMarks(res, img.naturalWidth, img.naturalHeight); show(res, false);
        if (res && res.text && res.conf >= 0.5) addHist("si", "⠃ " + res.text);
      };
      img.src = url;
    };
    B.start = async function () {
      if (B.on) return;
      try { B.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } }); }
      catch (e) { toast(t("camError")); return; }
      img.hidden = true; v.srcObject = B.stream; try { await v.play(); } catch (e) {}
      B.on = true; $("#bcam").classList.add("live"); $("#bstart").hidden = true; st("⠃ " + t("reading"));
      B.timer = setInterval(function () {
        if (v.readyState < 2) return;
        var res = Braille.scan(v, 960);
        drawMarks(res, v.videoWidth, v.videoHeight);
        if (res && res.cells && res.conf >= 0.6) {
          if (res.text === B.last) B.same++; else { B.same = 0; B.last = res.text; }
          if (B.same >= 1) show(res, true);
        }
      }, 650);
    };
    B.stop = function () {
      clearInterval(B.timer);
      var was = B.on || !img.hidden; B.on = false;
      if (B.stream) B.stream.getTracks().forEach(function (tr) { tr.stop(); }); B.stream = null; v.srcObject = null; st("");
      if (was) { ov.getContext("2d").clearRect(0, 0, ov.width, ov.height); img.hidden = true; $("#bcam").classList.remove("live"); $("#bstart").hidden = false; }
    };
    $("#bLive").onclick = function () { B.start(); };
    $("#bStop").onclick = function () { B.stop(); };
    $("#bFile").onchange = function () { B.file(this.files[0]); this.value = ""; };
    $("#bAloud").onchange = function () { S.aloud = this.checked; $("#aloud").checked = S.aloud; saveS(); };
    $("#bSpeak").onclick = function () { if (B.text) say(B.text, S.out, true); };
    $("#bCopy").onclick = function () { if (B.text && navigator.clipboard) navigator.clipboard.writeText(B.text).then(function () { toast(t("copied")); }); };
    $("#bSign").onclick = function () { if (!B.text) return; setDir("t2s"); $("#askText").value = B.text; signText(B.text); };
    $("#bChart").innerHTML = "abcdefghijklmnñopqrstuvwxyz".split("").map(function (c) { return "<span><i>" + Braille.write(c) + "</i>" + c.toUpperCase() + "</span>"; }).join("") +
      "<span><i>" + Braille.cellChar(60) + "</i>#</span><span><i>" + Braille.cellChar(32) + "</i>Aa</span>";
    return B;
  }

  /* ---------- navigation ---------- */
  var current = "translate", BR = null;
  function go(v) {
    if (!$("#v-" + v)) v = "translate";
    current = v;
    $$(".view").forEach(function (s) { s.hidden = s.id !== "v-" + v; });
    $$(".tab").forEach(function (b) { b.classList.toggle("on", b.dataset.go === v); });
    if (v === "learn") renderLearn(); if (v === "dict") renderDict(); if (v === "phrases") renderPhrases(); if (v === "settings") renderSettings();
    if (v === "translate") player.redraw();
    if (v !== "translate" && Cam.on && $("#sheet").hidden) Cam.stop();
    if (v !== "translate" && BR) BR.stop();
    try { history.replaceState(null, "", "#" + v); } catch (e) {}
    window.scrollTo(0, 0);
  }
  $$(".tab").forEach(function (b) { b.onclick = function () { go(b.dataset.go); }; });

  /* ---------- progress ---------- */
  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function streak() {
    var n = 0, d = new Date();
    for (;;) { var k = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); if (P.days.indexOf(k) >= 0) { n++; d.setDate(d.getDate() - 1); } else break; }
    return n;
  }
  function addXP(n) { P.xp += n; if (P.days.indexOf(today()) < 0) { P.days.push(today()); if (P.days.length > 400) P.days.shift(); } saveP(); }
  var BADGES = [["🌱", function () { return Object.keys(P.learned).length >= 1; }], ["🔤", function () { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").every(function (l) { return P.learned["l:" + l]; }); }],
    ["🔢", function () { for (var i = 0; i <= 10; i++) if (!P.learned["n:" + i]) return false; return true; }], ["💬", function () { return Object.keys(P.learned).filter(function (k) { return k[0] === "w"; }).length >= 20; }],
    ["🏆", function () { return Object.keys(P.quiz).filter(function (k) { return P.quiz[k] >= 0.7; }).length >= 5; }], ["🔥", function () { return streak() >= 7; }],
    ["📷", function () { return Object.keys(P.cam).length >= 10; }], ["🧑‍🏫", function () { return CUSTOM.length > 0; }]];
  function renderLearn() {
    var lvl = Math.floor(P.xp / 100) + 1, pct = P.xp % 100;
    $("#stats").innerHTML = '<div class="stat"><b>' + lvl + "</b><span>" + esc(t("level")) + '</span></div><div class="xpbar" title="' + P.xp + ' XP"><i style="width:' + pct + '%"></i></div>' +
      '<div class="stat"><b>🔥 ' + streak() + "</b><span>" + esc(t("streak")) + '</span></div><div class="stat"><b>' + Object.keys(P.learned).length + "</b><span>" + esc(t("learned")) + "</span></div>" +
      '<div class="badges" title="' + esc(t("badges")) + '">' + BADGES.map(function (b) { return '<span class="' + (b[1]() ? "got" : "") + '">' + b[0] + "</span>"; }).join("") + "</div>";
    var ICON = { a1: "🅰️", a2: "🔠", a3: "🔡", num: "🔢", greet: "👋", people: "👪", needs: "🍚", feel: "❤️", quest: "❓", emerg: "🚨", time: "⏰" };
    $("#units").innerHTML = DATA.UNITS.map(function (u, i) {
      var keys = unitKeys(u), got = keys.filter(function (k) { return P.learned[k]; }).length, f = got / keys.length, q = P.quiz[u.id];
      return '<button class="unit' + (q >= 0.7 ? " done" : "") + '" data-u="' + i + '"><span class="uic">' + ICON[u.id] + "</span><b>" + esc(t("cat_" + u.id)) + "</b><small>" + got + "/" + keys.length + (q !== undefined ? " · " + Math.round(q * 100) + "%" : "") + "</small>" +
        '<svg class="prog" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" stroke="var(--soft)" stroke-width="4"/><circle cx="18" cy="18" r="15" stroke="var(--ok)" stroke-width="4" stroke-dasharray="' + (94.2 * f).toFixed(1) + ' 95" transform="rotate(-90 18 18)"/></svg></button>';
    }).join("");
    $$("#units .unit").forEach(function (b) { b.onclick = function () { lesson(DATA.UNITS[+b.dataset.u], 0); }; });
  }
  function unitKeys(u) { return u.items.map(function (x) { return u.kind === "abc" ? "l:" + x : u.kind === "num" ? "n:" + x : "w:" + x; }); }
  function trio(w) {
    if (!w) return "";
    return '<div class="trio">' + [["en", "EN"], ["fil", "FIL"], ["bcl", "BIK"]].map(function (l) { return '<button data-say="' + l[0] + '"><small>' + l[1] + "</small>" + esc(first(w[l[0]])) + "</button>"; }).join("") + "</div>";
  }
  function bindTrio(el, w) { $$("[data-say]", el).forEach(function (b) { b.onclick = function () { say(first(w[b.dataset.say]), b.dataset.say, true); }; }); }

  /* A lesson: watch each sign, hear it, then take the quiz. */
  function lesson(u, i) {
    var keys = unitKeys(u), it = itemOf(keys[i]);
    var el = openSheet('<h2>' + esc(t("cat_" + u.id)) + ' <small class="muted">' + (i + 1) + "/" + keys.length + '</small></h2><div class="lesson"><canvas class="avatar" id="lav"></canvas>' +
      '<div class="wordbig">' + esc(it.label) + "</div>" + trio(it.w) + (it.w && it.w.desc ? '<p class="muted">' + esc(it.w.desc) + "</p>" : it.letter ? '<p class="muted">' + esc(t("alphabet")) + ": " + esc(it.letter) + "</p>" : "") +
      '<div class="navrow"><button class="ghost" id="lp"' + (i ? "" : " disabled") + '><svg><use href="#i-left"/></svg>' + esc(t("prev")) + '</button><button class="ib" id="lr"><svg><use href="#i-redo"/></svg></button>' +
      (i < keys.length - 1 ? '<button class="primary" id="ln">' + esc(t("next")) + '<svg><use href="#i-right"/></svg></button>' : '<button class="primary" id="lq">' + esc(t("quiz")) + "</button>") + "</div>" +
      (it.tok ? '<button class="pill" id="lc"><svg><use href="#i-cam"/></svg>' + esc(t("practice")) + "</button>" : "") + "</div>");
    var pl = new Avatar.Player($("#lav", el), { tone: S.tone, lefty: S.hand === "left" });
    var play = function () { pl.play([{ spec: it.spec, face: it.face, hold: 700 }]); };
    setTimeout(play, 150);
    if (!P.learned[it.key]) { P.learned[it.key] = 1; addXP(2); }
    if (it.w) bindTrio(el, it.w);
    $("#lr", el).onclick = play;
    if ($("#lp", el)) $("#lp", el).onclick = function () { lesson(u, i - 1); };
    if ($("#ln", el)) $("#ln", el).onclick = function () { lesson(u, i + 1); };
    if ($("#lq", el)) $("#lq", el).onclick = function () { quiz(u); };
    if ($("#lc", el)) $("#lc", el).onclick = function () { practice([it], 0, u); };
    sheetClose = function () { if (current === "learn") renderLearn(); };
  }

  /* Quiz: watch a sign and choose its meaning; for letters and numbers, also pick the handshape. */
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function quiz(u) {
    var keys = unitKeys(u).filter(function (k) { return k !== "l:NG"; }), qs = shuffle(keys.slice()).slice(0, 8), n = 0, right = 0;
    function ask() {
      if (n >= qs.length) return finish();
      var it = itemOf(qs[n]), pick = u.kind !== "word" && Math.random() < 0.5;
      var opts = shuffle([qs[n]].concat(shuffle(keys.filter(function (k) { return k !== qs[n]; })).slice(0, 3)));
      var el = openSheet('<h2>' + esc(t("quiz")) + " · " + esc(t("cat_" + u.id)) + '</h2><div class="qbar"><i style="width:' + (n / qs.length * 100) + '%"></i></div><div class="lesson">' +
        (pick ? '<p class="wordbig">' + esc(t("whichHand")) + " “" + esc(it.label) + "”?</p>" : '<canvas class="avatar" id="qav"></canvas><p><b>' + esc(t("whatSign")) + '</b> <button class="link" id="qr">' + esc(t("showAgain")) + "</button></p>") +
        '<div class="opts">' + opts.map(function (k) { var o = itemOf(k); return '<button class="opt" data-k="' + k + '">' + (pick ? '<canvas data-spec="' + esc(o.spec.split(" ")[0]) + '"></canvas>' : esc(o.label)) + "</button>"; }).join("") + "</div></div>", function () { if (current === "learn") renderLearn(); });
      if (pick) $$("canvas[data-spec]", el).forEach(function (c) { Avatar.still(c, c.dataset.spec, { tone: S.tone, crop: "hand" }); });
      else { var pl = new Avatar.Player($("#qav", el), { tone: S.tone, lefty: S.hand === "left" }), play = function () { pl.play([{ spec: it.spec, face: it.face, hold: 600 }]); }; setTimeout(play, 150); $("#qr", el).onclick = play; }
      $$(".opt", el).forEach(function (b) {
        b.onclick = function () {
          if (el.dataset.done) return; el.dataset.done = 1;
          var ok = b.dataset.k === qs[n];
          b.classList.add(ok ? "good" : "bad");
          if (!ok) $$(".opt", el).forEach(function (x) { if (x.dataset.k === qs[n]) x.classList.add("good"); });
          if (ok) { right++; addXP(10); say(t("correct"), S.ui); }
          n++; setTimeout(ask, ok ? 700 : 1400);
        };
      });
    }
    function finish() {
      var sc = right / qs.length; P.quiz[u.id] = Math.max(P.quiz[u.id] || 0, sc); saveP();
      var el = openSheet('<div class="celebrate">' + (sc >= 0.7 ? "🎉" : "💪") + '</div><h2 style="text-align:center">' + esc(sc >= 0.7 ? t("passed") : t("tryAgain")) + "</h2><p class=\"wordbig\">" + right + " / " + qs.length + '</p><div class="navrow"><button class="ghost" id="qa">' + esc(t("tryAgain")) + '</button><button class="primary" id="qd">' + esc(t("done")) + "</button></div>", function () { if (current === "learn") renderLearn(); });
      $("#qa", el).onclick = function () { quiz(u); }; $("#qd", el).onclick = function () { closeSheet(); };
    }
    ask();
  }

  /* Practice with the camera: sign the shown item until SENYAS reads it. */
  function practice(list, i, u) {
    var it = list[i], mode = it.key[0] === "l" ? "abc" : it.key[0] === "n" ? "num" : "all";
    var el = openSheet('<h2>' + esc(t("signThis")) + ': <span class="wordbig" style="font-size:1.6rem">' + esc(it.label) + '</span></h2><div id="pcam"></div><p class="muted" id="pmsg">' + esc(Cam.on ? t("showHand") : t("needCam")) + "</p>" +
      '<div class="navrow"><button class="ghost" id="pmine">' + esc(t("recordMine")) + '</button><canvas id="pdemo" style="width:90px;height:90px"></canvas><button class="primary" id="pskip">' + esc(list.length > 1 ? t("skip") : t("done")) + "</button></div>",
      function () { Cam.sess.mode = S.mode; });
    Cam.mount($("#pcam", el)); Cam.sess.mode = mode;
    Avatar.still($("#pdemo", el), it.spec.split(" ")[0], { tone: S.tone, crop: "hand" });
    if (!Cam.on) Cam.start();
    Cam.handler = {
      shape: translateHandler.shape,
      commit: function (tok) {
        if (tok !== it.tok) { $("#pmsg", el).textContent = "→ " + tokLabel(tok); return; }
        $("#pmsg", el).innerHTML = '<b style="color:var(--ok)">✔ ' + esc(t("greatJob")) + "</b>"; say(t("greatJob"), S.ui, true);
        if (!P.cam[it.key]) { P.cam[it.key] = 1; addXP(20); }
        setTimeout(function () { if (i + 1 < list.length) practice(list, i + 1, u); else closeSheet(); }, 1200);
      }
    };
    $("#pskip", el).onclick = function () { if (i + 1 < list.length) practice(list, i + 1, u); else closeSheet(); };
    $("#pmine", el).onclick = function () {
      if (!Cam.on) return toast(t("camFirst"));
      var lab = personalLabel(it.key); if (!lab) return;
      $("#pmsg", el).textContent = t("record") + "…";
      Cam.sess.record(1000, function (r) {
        if (!r) return toast(t("tNoHand"));
        PERSONAL.push({ l: lab, f: r.mean, k: it.key }); save("personal", PERSONAL); Cam.refresh(); toast(t("saved")); $("#pmsg", el).textContent = t("showHand");
      });
    };
  }
  var NUMLAB = ["O", "ONE", "V", "THREE", "FOUR", "FIVE", "W", "SEVEN", "EIGHT", "F"], WORDLAB = { iloveyou: "ILY", good: "GOOD", bad: "BAD", okay: "F" };
  function personalLabel(key) {
    var v = key.slice(2);
    if (key[0] === "l") return /^[A-IK-Y]$/.test(v) ? v : null;
    if (key[0] === "n") return NUMLAB[+v] || null;
    return WORDLAB[v] || null;
  }

  /* Games. */
  var SPELLWORDS = DATA.list.filter(function (w) { return !w.num; }).map(function (w) { return first(w[S.ui]).toUpperCase(); }).filter(function (s) { return /^[A-Z]{3,7}$/.test(s); });
  $("#gReadSpell").onclick = function () {
    var round = 0, score = 0, speed = 1;
    function next() {
      if (round >= 8) { openSheet('<div class="celebrate">🎉</div><p class="wordbig">' + score + " / 8</p>"); return; }
      var pool = DATA.list.filter(function (w) { return !w.num; }).map(function (w) { return first(w[S.ui]).toUpperCase(); }).filter(function (s) { return /^[A-ZÑ]{3,7}$/.test(s); });
      var word = pool[Math.floor(Math.random() * pool.length)];
      var el = openSheet('<h2>' + esc(t("gReadSpell")) + ' <small class="muted">' + (round + 1) + '/8</small></h2><div class="lesson"><canvas class="avatar" id="gav"></canvas><div class="search card"><input id="gin" type="text" autocomplete="off" autocapitalize="characters" placeholder="' + esc(t("typeWord")) + '"></div><div class="navrow"><button class="ghost" id="gagain">' + esc(t("showAgain")) + '</button><button class="primary" id="gok">' + esc(t("check")) + '</button></div><p id="gmsg"></p></div>');
      var pl = new Avatar.Player($("#gav", el), { tone: S.tone, lefty: S.hand === "left" });
      var play = function () { pl.speed = speed; pl.play(word.split("").map(function (c) { return { spec: Avatar.letterSpec(c), hold: 150 }; }).filter(function (x) { return x.spec; })); };
      setTimeout(play, 200);
      $("#gagain", el).onclick = play;
      var check = function () {
        var ok = DATA.key($("#gin", el).value).toUpperCase().replace(/ /g, "") === DATA.key(word).toUpperCase();
        $("#gmsg", el).innerHTML = ok ? '<b style="color:var(--ok)">✔ ' + esc(t("correct")) + "</b>" : '<b style="color:var(--bad)">✘</b> ' + esc(t("answerWas")) + " <b>" + esc(word) + "</b>";
        if (ok) { score++; addXP(10); speed = Math.min(1.6, speed + 0.1); }
        round++; setTimeout(next, ok ? 900 : 1800);
      };
      $("#gok", el).onclick = check; $("#gin", el).onkeydown = function (e) { if (e.key === "Enter") check(); };
    }
    next();
  };
  $("#gSpellCam").onclick = function () {
    var word = SPELLWORDS[Math.floor(Math.random() * SPELLWORDS.length)] || "SENYAS", pos = 0;
    var el = openSheet('<h2>' + esc(t("gSpellCam")) + '</h2><div id="pcam"></div><p class="wordbig" id="sw"></p>', function () { Cam.sess.mode = S.mode; });
    function show() { $("#sw", el).innerHTML = word.split("").map(function (c, i) { return '<span style="color:' + (i < pos ? "var(--ok)" : i === pos ? "var(--pri)" : "var(--mut)") + '">' + c + "</span>"; }).join(" "); }
    show(); Cam.mount($("#pcam", el)); Cam.sess.mode = "abc"; if (!Cam.on) Cam.start();
    Cam.handler = { shape: translateHandler.shape, commit: function (tok) {
      if (tok === "l:" + word[pos]) { pos++; show(); if (pos >= word.length) { addXP(30); say(t("greatJob"), S.ui, true); setTimeout(function () { $("#gSpellCam").onclick(); }, 1300); } }
    } };
  };
  $("#gFlash").onclick = function () {
    var deck = DATA.list.slice().sort(function (a, b) { return (P.flash[a.id] || 0) - (P.flash[b.id] || 0); }).slice(0, 20), i = 0;
    function card() {
      if (i >= deck.length) return closeSheet();
      var w = deck[i];
      var el = openSheet('<h2>' + esc(t("gFlash")) + ' <small class="muted">' + (i + 1) + "/" + deck.length + '</small></h2><div class="lesson"><canvas class="avatar" id="fav"></canvas><div id="fans" hidden><div class="wordbig">' + esc(wordText(w)) + "</div>" + trio(w) + '</div><div class="navrow"><button class="ghost" id="frev">' + esc(t("reveal")) + '</button><button class="ghost" id="fag">' + esc(t("again")) + '</button><button class="primary" id="fknew">' + esc(t("knew")) + "</button></div></div>");
      var pl = new Avatar.Player($("#fav", el), { tone: S.tone, lefty: S.hand === "left" }); setTimeout(function () { pl.play([{ spec: w.spec, face: w.face, hold: 600 }]); }, 150);
      bindTrio(el, w);
      $("#frev", el).onclick = function () { $("#fans", el).hidden = false; };
      $("#fag", el).onclick = function () { P.flash[w.id] = Math.max(0, (P.flash[w.id] || 0) - 1); saveP(); deck.push(w); i++; card(); };
      $("#fknew", el).onclick = function () { P.flash[w.id] = (P.flash[w.id] || 0) + 1; addXP(3); i++; card(); };
    }
    card();
  };

  /* ---------- dictionary ---------- */
  var dictCat = "all";
  function renderDict() {
    var cats = ["all", "abc", "num"].concat(DATA.CATS);
    $("#cats").innerHTML = cats.map(function (c) { return '<button data-c="' + c + '" class="' + (c === dictCat ? "on" : "") + '">' + esc(c === "all" ? t("all") : c === "abc" ? t("alphabet") : c === "num" ? t("numbers") : t("cat_" + c)) + "</button>"; }).join("");
    $$("#cats button").forEach(function (b) { b.onclick = function () { dictCat = b.dataset.c; renderDict(); }; });
    var q = DATA.key($("#q").value || "");
    var showLetters = (dictCat === "all" && !q) || dictCat === "abc";
    var L = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").concat(["NG"]);
    $("#letters").innerHTML = showLetters ? L.map(function (l) { return '<button data-l="' + l + '"><canvas></canvas>' + l + "</button>"; }).join("") : "";
    $$("#letters button").forEach(function (b) {
      var it = itemOf("l:" + b.dataset.l); Avatar.still($("canvas", b), it.spec.split(" ")[0], { tone: S.tone, crop: "hand" });
      b.onclick = function () { detail(it); };
    });
    var list = DATA.list.filter(function (w) {
      if (dictCat === "abc") return false;
      if (dictCat === "num") { if (!w.num && w.num !== 0) return false; } else if (dictCat !== "all" && w.cat !== dictCat) return false;
      return !q || [w.en, w.fil, w.bcl].some(function (s) { return DATA.key(s).indexOf(q) >= 0; });
    });
    $("#wlist").innerHTML = list.map(function (w) {
      return '<button class="witem" data-id="' + w.id + '"><canvas></canvas><span><b>' + esc(wordText(w)) + (DATA.LIVE.indexOf(w.id) >= 0 || w.num !== undefined ? '<span class="live">LIVE</span>' : "") + "</b><small>" +
        esc(["en", "fil", "bcl"].filter(function (l) { return l !== S.ui; }).map(function (l) { return first(w[l]); }).join(" · ")) + "</small></span></button>";
    }).join("");
    $$("#wlist .witem").forEach(function (b) {
      var w = DATA.words[b.dataset.id]; Avatar.still($("canvas", b), w.spec, { tone: S.tone });
      b.onclick = function () { detail(itemOf(w.num !== undefined ? "n:" + w.num : "w:" + w.id)); };
    });
  }
  $("#q").addEventListener("input", function () { if (dictCat === "abc") dictCat = "all"; renderDict(); });
  function detail(it) {
    var el = openSheet("<h2>" + esc(it.label) + '</h2><div class="lesson"><canvas class="avatar" id="dav"></canvas>' + trio(it.w) + (it.w && it.w.desc ? '<p class="muted">' + esc(it.w.desc) + "</p>" : "") +
      '<div class="navrow"><button class="ib" id="dr"><svg><use href="#i-redo"/></svg></button>' + (it.tok ? '<button class="pill" id="dc"><svg><use href="#i-cam"/></svg>' + esc(t("practice")) + "</button>" : "") +
      (it.w ? '<button class="primary" id="du"><svg><use href="#i-hand"/></svg>' + esc(t("tabTranslate")) + "</button>" : "") + "</div></div>");
    var pl = new Avatar.Player($("#dav", el), { tone: S.tone, lefty: S.hand === "left" }), play = function () { pl.play([{ spec: it.spec, face: it.face, hold: 700 }]); };
    setTimeout(play, 150); $("#dr", el).onclick = play; if (it.w) bindTrio(el, it.w);
    if (!P.learned[it.key]) { P.learned[it.key] = 1; addXP(2); }
    if ($("#dc", el)) $("#dc", el).onclick = function () { practice([it], 0); };
    if ($("#du", el)) $("#du", el).onclick = function () { closeSheet(); go("translate"); setDir("t2s"); var s = first(it.w[S.inLang]); $("#askText").value = s; signText(s); };
  }

  /* ---------- phrasebook ---------- */
  function renderPhrases() {
    var order = [S.ui].concat(["en", "fil", "bcl"].filter(function (l) { return l !== S.ui; })), NAME = { en: "EN", fil: "FIL", bcl: "BIK" };
    $("#plist").innerHTML = DATA.phrases.map(function (p, i) {
      return '<div class="pitem">' + order.map(function (l, n) { return '<button style="text-align:left" data-say="' + l + '" data-i="' + i + '"><span class="l">' + NAME[l] + "</span>" + (n ? esc(p[l]) : "<b>" + esc(p[l]) + "</b>") + "</button>"; }).join("") +
        '<div class="acts"><button class="pill" data-sign="' + i + '"><svg><use href="#i-hand"/></svg>' + esc(t("signIt")) + '</button><button class="ib" data-cp="' + i + '" aria-label="' + esc(t("copy")) + '"><svg><use href="#i-copy"/></svg></button></div></div>';
    }).join("");
    $$("#plist [data-say]").forEach(function (b) { b.onclick = function () { say(DATA.phrases[+b.dataset.i][b.dataset.say], b.dataset.say, true); }; });
    $$("#plist [data-sign]").forEach(function (b) { b.onclick = function () { var p = DATA.phrases[+b.dataset.sign]; go("translate"); setDir("t2s"); $("#askText").value = p[S.inLang]; signText(p[S.inLang]); }; });
    $$("#plist [data-cp]").forEach(function (b) { b.onclick = function () { var p = DATA.phrases[+b.dataset.cp]; if (navigator.clipboard) navigator.clipboard.writeText(p[S.ui]).then(function () { toast(t("copied")); }); }; });
  }

  /* ---------- teach a sign ---------- */
  $("#tTeach").onclick = function () { teach(); };
  function teach() {
    var takes = [], opts = DATA.list.map(function (w) { return '<option value="' + esc(wordText(w)) + '">'; }).join("");
    var el = openSheet('<h2>' + esc(t("tTitle")) + '</h2><div id="pcam"></div><div class="form"><p class="muted small">' + esc(t("tPickD")) + '</p><label>' + esc(t("word")) + '<input id="tw" list="twl" autocomplete="off"><datalist id="twl">' + opts + "</datalist></label>" +
      '<details><summary class="muted">' + esc(t("newWord")) + '</summary><label>English<input id="ten"></label><label>Filipino<input id="tfil"></label><label>Bikol<input id="tbcl"></label></details>' +
      "<b>" + esc(t("tRec")) + '</b><p class="muted small">' + esc(t("tRecD")) + '</p><div class="takes"><span></span><span></span><span></span></div><div class="count" id="tcount"></div>' +
      '<div class="navrow"><button class="ghost" id="trec"><svg><use href="#i-cam"/></svg>' + esc(t("record")) + '</button><button class="primary" id="tsave" disabled>' + esc(t("save")) + "</button></div></div>");
    Cam.mount($("#pcam", el)); if (!Cam.on) Cam.start();
    function paint(rec) { $$(".takes span", el).forEach(function (s, i) { s.className = i < takes.length ? "ok" : i === takes.length && rec ? "rec" : ""; }); $("#tsave", el).disabled = takes.length < 3; }
    $("#trec", el).onclick = function () {
      if (!Cam.on) return toast(t("camFirst"));
      if (takes.length >= 3) takes = [];
      var n = 3, b = this; b.disabled = true;
      (function tick() {
        if (n > 0) { $("#tcount", el).textContent = n--; setTimeout(tick, 650); return; }
        $("#tcount", el).textContent = "●"; paint(true);
        Cam.sess.record(1500, function (r) {
          $("#tcount", el).textContent = ""; b.disabled = false;
          if (!r) { toast(t("tNoHand")); paint(); return; }
          takes.push(r); paint();
        });
      })();
    };
    $("#tsave", el).onclick = function () {
      var w = DATA.find($("#tw", el).value || ""), lab = { en: $("#ten", el).value.trim(), fil: $("#tfil", el).value.trim(), bcl: $("#tbcl", el).value.trim() };
      if (!w && !lab.en && !lab.fil && !lab.bcl) { lab.en = ($("#tw", el).value || "").trim(); if (!lab.en) { $("#tw", el).focus(); return; } }
      var moving = takes.filter(function (x) { return x.moving; }).length >= 2;
      var c = { id: Date.now().toString(36), word: w ? w.id : null, label: w ? { en: first(w.en), fil: first(w.fil), bcl: first(w.bcl) } : lab, means: takes.map(function (x) { return x.mean; }) };
      if (moving) c.dyn = takes.map(function (x) { return x.seq; });
      CUSTOM.push(c); save("custom", CUSTOM); Cam.refresh(); toast(t("tSaved")); closeSheet();
    };
  }

  /* ---------- settings ---------- */
  var installEvt = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); installEvt = e; });
  function sel(id, val, opts) { return '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(val) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>"; }
  function sw(id, on) { return '<label class="switch"><input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + '><span class="knob"></span></label>'; }
  function row(label, ctl, sub) { return '<div class="set"><span>' + esc(label) + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span>" + ctl + "</div>"; }
  var LANGS = [["en", "English"], ["fil", "Filipino"], ["bcl", "Bikol"]];
  function renderSettings() {
    var mine = CUSTOM.map(function (c) { return row(c.label[S.ui] || c.label.en || c.label.fil || c.label.bcl, '<button class="link" data-del="' + c.id + '">' + esc(t("delete")) + "</button>", c.dyn ? "↝" : "✋"); }).join("") || '<p class="muted">' + esc(t("none")) + "</p>";
    $("#sets").innerHTML =
      '<div class="card group"><h3>' + esc(t("sUi")) + "</h3>" + row(t("sUi"), sel("sUi", S.ui, LANGS)) + row(t("sOut"), sel("sOut", S.out, LANGS)) + "</div>" +
      '<div class="card group"><h3>' + esc(t("sVoice")) + "</h3>" + row(t("sAloud"), sw("sAloud", S.aloud), t("sAloudD")) + row(t("sLetters"), sw("sLetters", S.letters)) +
      row(t("sRate"), '<input type="range" id="sRate" min="0.6" max="1.4" step="0.1" value="' + S.rate + '">') + "</div>" +
      '<div class="card group"><h3>' + esc(t("sRecog")) + "</h3>" + row(t("sHand"), sel("sHand", S.hand, [["right", t("right")], ["left", t("left")]])) + row(t("sFacing"), sel("sFacing", S.facing, [["user", t("front")], ["environment", t("back")]])) +
      row(t("sMirror"), sw("sMirror", S.mirror)) + row(t("sPoints"), sw("sPoints", S.points)) + row(t("sHold"), sel("sHold", S.hold, [[300, t("fast")], [400, t("normal")], [600, t("slow")]])) +
      row(t("sRepeat"), sw("sRepeat", S.repeat)) + row(t("sSwap"), sw("sSwap", S.swap)) + "</div>" +
      '<div class="card group"><h3>' + esc(t("sAvatar")) + "</h3>" + row(t("sTone"), '<div class="tones">' + Hand.TONES.map(function (c, i) { return '<button data-tone="' + i + '" class="' + (i === S.tone ? "on" : "") + '" style="background:' + c[0] + '" aria-label="' + (i + 1) + '"></button>'; }).join("") + "</div>") + "</div>" +
      '<div class="card group"><h3>' + esc(t("sDisplay")) + "</h3>" + row(t("sTheme"), sel("sTheme", S.theme, [["auto", t("auto")], ["light", t("light")], ["dark", t("dark")]])) +
      row(t("sText"), sel("sFs", S.fs, [[14, "A−"], [16, "A"], [18, "A+"], [21, "A++"]])) + row(t("sContrast"), sw("sHc", S.hc)) + row(t("sMotion"), sw("sRm", S.rm)) + "</div>" +
      '<div class="card group"><h3>' + esc(t("sMine")) + "</h3><p class=\"muted small\">" + esc(t("sMineD")) + "</p>" + mine + row(t("personal"), "<b>" + PERSONAL.length + "</b>") +
      '<div class="set"><button class="pill" id="sTeach"><svg><use href="#i-plus"/></svg>' + esc(t("teachSign")) + "</button></div></div>" +
      '<div class="card group"><h3>' + esc(t("sData")) + "</h3>" + row(t("privacy"), '<button class="link" id="sPriv">›</button>') + row(t("cookies"), '<button class="link" id="sCk">›</button>') +
      row(t("export"), '<button class="link" id="sExp"><svg><use href="#i-dl"/></svg></button>') + row(t("import"), '<label class="link" style="cursor:pointer">…<input type="file" id="sImp" accept="application/json" hidden></label>') +
      row(t("reset"), '<button class="link" id="sReset">↺</button>') + row(t("wipe"), '<button class="link" id="sWipe" style="color:var(--bad)">✕</button>') + "</div>" +
      '<div class="card group"><h3>' + esc(t("about")) + '</h3><p class="small">' + esc(t("aboutText")) + "</p>" + row(t("version"), "<span>" + VERSION + "</span>") +
      (installEvt && !INAPP ? row(t("install"), '<button class="pill" id="sInst"><svg><use href="#i-dl"/></svg>' + esc(t("install")) + "</button>") : "") +
      '<p class="muted small">Hand tracking: MediaPipe (Apache-2.0). <a href="' + (INAPP ? "https://pogi6969.github.io/SENYAS/" : "../") + '" target="_blank" rel="noopener">SENYAS website</a></p></div>';
    var on = function (id, ev, f) { var e = $("#" + id); if (e) e.addEventListener(ev, f); };
    on("sUi", "change", function () { S.ui = this.value; saveS(); applyText(); renderQuick(); renderSettings(); });
    on("sOut", "change", function () { S.out = this.value; $("#outLang").value = S.out; saveS(); renderCaption(); });
    on("sAloud", "change", function () { S.aloud = this.checked; $("#aloud").checked = S.aloud; $("#bAloud").checked = S.aloud; saveS(); });
    on("sLetters", "change", function () { S.letters = this.checked; saveS(); });
    on("sRate", "change", function () { S.rate = +this.value; saveS(); say(t("readAloud"), S.ui, true); });
    on("sHand", "change", function () { S.hand = this.value; saveS(); player.opts.lefty = S.hand === "left"; player.redraw(); Cam.refresh(); });
    on("sFacing", "change", function () { S.facing = this.value; saveS(); if (Cam.on) { Cam.stop(); Cam.start(); } Cam.refresh(); });
    ["Mirror", "Points", "Repeat", "Swap", "Hc", "Rm"].forEach(function (k) { on("s" + k, "change", function () { S[k.toLowerCase()] = this.checked; saveS(); Cam.refresh(); applyLook(); }); });
    on("sHold", "change", function () { S.hold = +this.value; saveS(); Cam.refresh(); });
    on("sTheme", "change", function () { S.theme = this.value; saveS(); applyLook(); });
    on("sFs", "change", function () { S.fs = +this.value; saveS(); applyLook(); });
    $$("[data-tone]").forEach(function (b) { b.onclick = function () { S.tone = +b.dataset.tone; player.opts.tone = S.tone; saveS(); player.redraw(); renderSettings(); }; });
    $$("[data-del]").forEach(function (b) { b.onclick = function () { if (!confirm(t("sure"))) return; CUSTOM = CUSTOM.filter(function (c) { return c.id !== b.dataset.del; }); save("custom", CUSTOM); Cam.refresh(); renderSettings(); }; });
    on("sTeach", "click", function () { go("translate"); setDir("s2t"); teach(); });
    on("sPriv", "click", showPrivacy); on("sCk", "click", function () { consentSheet(true); });
    on("sExp", "click", function () {
      var blob = new Blob([JSON.stringify({ app: "SENYAS", v: VERSION, settings: S, progress: P, custom: CUSTOM, personal: PERSONAL, history: HIST }, null, 1)], { type: "application/json" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "senyas-data.json"; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    on("sImp", "change", function () {
      var f = this.files[0]; if (!f) return;
      f.text().then(function (s) {
        var d = JSON.parse(s); if (d.app !== "SENYAS") return;
        Object.assign(S, d.settings || {}); P = Object.assign(P, d.progress || {}); CUSTOM = d.custom || CUSTOM; PERSONAL = d.personal || PERSONAL; HIST = d.history || HIST;
        saveS(); saveP(); save("custom", CUSTOM); save("personal", PERSONAL); save("history", HIST); Cam.refresh(); applyLook(); applyText(); renderSettings(); renderHist(); toast(t("saved"));
      }).catch(function () {});
    });
    on("sReset", "click", function () { if (!confirm(t("sure"))) return; P = { xp: 0, days: [], learned: {}, quiz: {}, cam: {}, flash: {} }; saveP(); toast("✓"); });
    on("sWipe", "click", function () {
      if (!confirm(t("sure"))) return;
      try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("senyas.") === 0) localStorage.removeItem(k); }); } catch (e) {}
      location.reload();
    });
    on("sInst", "click", function () { if (installEvt) { installEvt.prompt(); installEvt = null; renderSettings(); } });
  }

  /* ---------- privacy and cookies ---------- */
  function showPrivacy() { openSheet('<div class="policy">' + $("#privacyTpl").innerHTML + "</div>"); }
  function consentSheet(again) {
    var el = openSheet('<h2><svg><use href="#i-shield"/></svg> ' + esc(t("cTitle")) + "</h2><p>" + esc(t("cText")) + "</p>" +
      row(t("cEssential"), sw("cEss", true)) + row(t("cFunctional"), sw("cFun", again ? canStore() : true)) +
      '<p><button class="link" id="cPol">' + esc(t("privacy")) + '</button></p><div class="navrow"><button class="ghost" id="cMin">' + esc(t("cEssentialOnly")) + '</button><button class="ghost" id="cSv">' + esc(t("cSave")) + '</button><button class="primary" id="cAll">' + esc(t("cAccept")) + "</button></div>");
    $("#cEss", el).disabled = true;
    $("#cPol", el).onclick = showPrivacy;
    $("#cMin", el).onclick = function () { setConsent(false); closeSheet(); };
    $("#cSv", el).onclick = function () { setConsent($("#cFun", el).checked); closeSheet(); };
    $("#cAll", el).onclick = function () { setConsent(true); saveS(); saveP(); closeSheet(); };
  }

  /* ---------- start ---------- */
  BR = makeBraille();
  applyLook(); applyText();
  $("#aloud").checked = S.aloud; $("#bAloud").checked = S.aloud; $("#outLang").value = S.out; $("#inLang").value = S.inLang; $("#aSpeed").value = String(S.speed);
  $$("#modes button").forEach(function (x) { x.classList.toggle("on", x.dataset.mode === S.mode); }); Cam.sess.mode = S.mode;
  player.opts.lefty = S.hand === "left";
  renderCaption(); renderHist(); renderQuick();
  go((location.hash || "#translate").slice(1));
  if (!consent) setTimeout(function () { consentSheet(false); }, 400);
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};
  matchMedia("(prefers-color-scheme: dark)").addEventListener && matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyLook);
  if ("serviceWorker" in navigator && !INAPP && /^https:|^http:\/\/localhost/.test(location.href)) navigator.serviceWorker.register("../sw.js", { scope: "../" }).catch(function () {});
  var cn = navigator.connection;
  if (!(cn && (cn.saveData || /2g/.test(cn.effectiveType || "")))) { if ("requestIdleCallback" in window) requestIdleCallback(function () { Cam.preload(); }); else setTimeout(Cam.preload, 2000); }
  window.SENYAS = { version: VERSION, signText: signText, onToken: onToken, go: go };
})();
