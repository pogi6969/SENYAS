/* SENYAS species scan: names a plant or animal from one photo, on the device.
   Four small models work together. A general model (ImageNet, about 400 kinds of animals plus
   some plants and fruits) says what sort of living thing is in the picture; that decides which
   specialist is believed: plants (2,101 species), birds (964) or insects (1,021), all trained on
   iNaturalist photos. The specialists are never trusted alone, because each one always finds
   "something" (a tabby cat looks like a butterfly to the insect model). */
var Species = (function () {
  /* ImageNet class number -> kind of living thing (null = not a plant or animal). */
  function kind(i) {
    if (i <= 6 || (i >= 389 && i <= 397)) return "fish";
    if ((i >= 7 && i <= 24) || (i >= 80 && i <= 100) || (i >= 127 && i <= 146)) return "bird";
    if (i >= 25 && i <= 29) return "animal";
    if (i >= 30 && i <= 32) return "frog";
    if (i >= 33 && i <= 37) return "turtle";
    if (i >= 38 && i <= 50) return "lizard";
    if (i >= 52 && i <= 68) return "snake";
    if (i >= 70 && i <= 78) return "spider";
    if (i === 79 || (i >= 101 && i <= 126) || (i >= 147 && i <= 150)) return "animal";
    if (i >= 151 && i <= 268) return "dog";
    if (i >= 269 && i <= 280) return "animal";
    if (i >= 281 && i <= 285) return "cat";
    if (i >= 286 && i <= 299) return "animal";
    if (i >= 300 && i <= 326) return "insect";
    if (i === 339 || i === 340) return "horse";
    if (i >= 341 && i <= 343) return "pig";
    if (i >= 345 && i <= 347) return "cow";
    if (i >= 365 && i <= 384) return "monkey";
    if (i >= 327 && i <= 388) return "animal";
    if ((i >= 936 && i <= 957) || (i >= 984 && i <= 998)) return "plant";
    return null;
  }

  /* Words for each kind in the three languages, and the sign the avatar uses for it. */
  var KINDS = {
    animal: ["animal", "hayop", "hayop"], plant: ["plant", "halaman", "tanom"], tree: ["tree", "puno", "kahoy"], flower: ["flower", "bulaklak", "burak"],
    bird: ["bird", "ibon", "gamgam"], fish: ["fish", "isda", "sira"], dog: ["dog", "aso", "ayam"], cat: ["cat", "pusa", "ikos"],
    insect: ["insect", "insekto", "insekto"], butterfly: ["butterfly", "paruparo", "alibangbang"], snake: ["snake", "ahas", "halas"],
    frog: ["frog", "palaka", "talapang"], turtle: ["turtle", "pagong", "ba-o"], lizard: ["lizard", "butiki", "tiki"], spider: ["spider", "gagamba", "lawa"],
    monkey: ["monkey", "unggoy", "kabalang"], horse: ["horse", "kabayo", "kabayo"], pig: ["pig", "baboy", "orig"], cow: ["cow", "baka", "baka"]
  };
  var SIGN = { lizard: "animal" };
  var LI = { en: 0, fil: 1, bcl: 2 };

  /* Local names of things people in Albay meet often: scientific name or general label -> [Filipino, Bikol]. */
  var LOCAL = {
    "Mangifera indica": ["mangga", "mangga"], "Cocos nucifera": ["niyog", "niyog"], "Carica papaya": ["papaya", "tapayas"], "Zea mays": ["mais", "mais"],
    "Colocasia esculenta": ["gabi", "natong"], "Psidium guajava": ["bayabas", "bayawas"], "Hibiscus rosa-sinensis": ["gumamela", "gumamela"],
    "Mimosa pudica": ["makahiya", "torog-torog"], "Helianthus annuus": ["mirasol", "mirasol"], "Capsicum annuum": ["sili", "lada"],
    "Solanum lycopersicum": ["kamatis", "kamatis"], "Plumeria rubra": ["kalachuchi", "kalachuchi"], "Apis mellifera": ["pukyutan", "ligwan"],
    banana: ["saging", "batag"], jackfruit: ["langka", "langka"], pineapple: ["pinya", "pinya"], corn: ["mais", "mais"], ear: ["mais", "mais"],
    "water buffalo": ["kalabaw", "damulag"], hen: ["manok", "manok"], cock: ["manok", "manok"], hog: ["baboy", "orig"], ox: ["baka", "baka"],
    bee: ["bubuyog", "ligwan"], fly: ["langaw", "langaw"], ant: ["langgam", "langgam"], mushroom: ["kabute", "kabute"], ram: ["tupa", "karnero"],
    "African crocodile": ["buwaya", "buaya"], "American alligator": ["buwaya", "buaya"], tiger: ["tigre", "tigre"], lion: ["leon", "leon"],
    "Indian elephant": ["elepante", "elepante"], "African elephant": ["elepante", "elepante"], goose: ["gansa", "gansa"], drake: ["pato", "pato"]
  };
  var FLOWER = /flower|rose|lily|daisy|orchid|hibiscus|tulip|poppy|aster|violet|iris|lotus|plumeria|periwinkle|marigold|lupine|primrose|morning.glory|mallow|slipper/i;
  var TREE = /tree|pine|oak|palm|maple|birch|fir|spruce|cedar|mango|beech|elm|willow|cypress|ash$|mangrove|eucalyptus|juniper|poplar|walnut|hickory|acacia|kapok|papaya|guava/i;
  var FLUTTER = /butterfly|moth|swallowtail|monarch|skipper|sulphur|fritillary|admiral|hairstreak|buckeye|emperor|bluewing|nymph|checkerspot|crescent|azure|copper|satyr|sphinx|tussock/i;

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function plantKind(name) { return FLOWER.test(name) ? "flower" : TREE.test(name) ? "tree" : "plant"; }
  function best(list, labels, minAlt) {
    /* A specialist's top answers without its "background" class; bg is that class's score. */
    var bgIndex = labels.length - 1, bg = 0, out = [];
    list.forEach(function (c) { if (c.index === bgIndex) bg = c.score; else out.push({ sci: labels[c.index][0], name: labels[c.index][1] || labels[c.index][0], score: c.score }); });
    return { top: out[0] || null, alts: out.slice(1, 4).filter(function (a) { return a.score >= minAlt; }), bg: bg };
  }

  /* raw: what the four models said: {gen: [{index, name, score}], plant, bird, insect: [{index, score}]}, best first.
     mode: "auto", or what the user says is in the picture: "plant", "bird", "insect" or "animal". */
  function decide(raw, labels, mode) {
    var gen = raw.gen, sums = {}, lead = {}, dead = 0, asked = mode === "plant" || mode === "bird" || mode === "insect";
    gen.forEach(function (c) {
      var k = kind(c.index);
      if (!k) { dead = Math.max(dead, c.score); return; }
      var route = k === "bird" || k === "insect" || k === "plant" ? k : "animal";
      if (mode === "animal" && route === "plant") return;
      sums[route] = (sums[route] || 0) + c.score;
      if (!lead[route]) lead[route] = { kind: k, name: c.name, score: c.score };
    });
    var gate = null;
    Object.keys(sums).forEach(function (r) { if (!gate || sums[r] > sums[gate]) gate = r; });
    if (gate && (sums[gate] < 0.18 || sums[gate] < dead * 0.6)) gate = null;
    var minAlt = asked ? 0.02 : 0.05;
    var B = { plant: best(raw.plant, labels.plant, minAlt), bird: best(raw.bird, labels.bird, minAlt), insect: best(raw.insect, labels.insect, minAlt) };

    function fromSpecialist(route, why) {
      var b = B[route], t = b.top, k = route;
      if (route === "plant") k = plantKind(t.name);
      if (route === "insect" && FLUTTER.test(t.name)) k = "butterfly";
      return { ok: true, kind: k, name: t.name, sci: t.sci, score: t.score, alts: b.alts, source: route, why: why };
    }
    function fromGeneral(route) {
      var l = lead[route], k = l.kind, name = cap(l.name), detail = "";
      if (k === "dog" || k === "cat") { detail = l.name; name = cap(KINDS[k][0]); }
      if (route === "plant") k = FLOWER.test(l.name) ? "flower" : "plant";
      return { ok: true, kind: k, name: name, sci: "", detail: detail, key: l.name, score: Math.min(1, sums[route]), alts: [], source: "general" };
    }

    /* The user said what it is (a leaf, bark or root rarely looks like a "plant" to the general model),
       so the specialist answers even when it is unsure, and its other guesses are offered too. */
    if (asked) {
      if (B[mode].top && B[mode].top.score >= 0.02) return fromSpecialist(mode, "asked");
      if (lead[mode]) return fromGeneral(mode);
      return { ok: false };
    }
    if (gate === "animal") return fromGeneral("animal");
    if (gate) {
      var t = B[gate].top;
      if (t && t.score >= 0.3 && t.score >= B[gate].bg) return fromSpecialist(gate, "gate");
      if (lead[gate].score >= 0.3 || !t || t.score < 0.12) return fromGeneral(gate);
      return fromSpecialist(gate, "weak");
    }
    /* The general model saw no living thing: believe a specialist only when it is sure. */
    var need = mode === "animal" ? { bird: 0.6, insect: 0.6 } : { plant: 0.35, bird: 0.6, insect: 0.6 }, pick = null;
    Object.keys(need).forEach(function (r) { var t = B[r].top; if (t && t.score >= need[r] && t.score > B[r].bg && (!pick || t.score > B[pick].top.score)) pick = r; });
    if (pick) return fromSpecialist(pick, "alone");
    return { ok: false };
  }

  /* Several photos of the same plant or animal (a leaf, the bark, the whole tree): the models' scores are
     averaged, so what the photos agree on wins. */
  function merge(raws) {
    if (raws.length === 1) return raws[0];
    var out = {};
    ["gen", "plant", "bird", "insect"].forEach(function (m) {
      var sum = {}, name = {};
      raws.forEach(function (r) { r[m].forEach(function (c) { sum[c.index] = (sum[c.index] || 0) + c.score; if (c.name) name[c.index] = c.name; }); });
      out[m] = Object.keys(sum).map(function (i) { return { index: +i, name: name[i] || "", score: sum[i] / raws.length }; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 10);
    });
    return out;
  }

  /* A result from a list of names, such as the answer of an online service: [{name, sci, score}], best first. */
  function fromList(route, list, source) {
    if (!list || !list.length) return { ok: false };
    var t = list[0], k = route === "plant" ? plantKind(t.name) : route;
    return { ok: true, kind: k, name: t.name || t.sci, sci: t.sci || "", score: t.score, alts: list.slice(1, 4), source: source };
  }
  /* The same result with one of its other guesses moved to the top (the user tapped it). */
  function choose(res, i) {
    var a = res.alts[i]; if (!a) return res;
    var alts = res.alts.slice(); alts[i] = { name: res.name, sci: res.sci, score: res.score };
    var k = res.source === "plant" || res.source === "plantnet" ? plantKind(a.name) : res.source === "insect" ? (FLUTTER.test(a.name) ? "butterfly" : "insect") : res.kind;
    return { ok: true, kind: k, name: a.name, sci: a.sci, score: a.score, alts: alts, source: res.source, chosen: true };
  }

  /* The name to show and say in a language: a local name if there is one, else the kind and the English name. */
  function nameIn(res, lang) {
    if (!res.ok) return "";
    var full = res.name + (res.detail ? " (" + res.detail + ")" : "");
    if (lang === "en" || !LI[lang]) return full;
    var loc = LOCAL[res.sci] || LOCAL[res.key];
    if (loc && loc[LI[lang] - 1]) return cap(loc[LI[lang] - 1]);
    var word = KINDS[res.kind] ? KINDS[res.kind][LI[lang]] : "";
    if (res.name.toLowerCase() === KINDS[res.kind][0]) return cap(word) + (res.detail ? " (" + res.detail + ")" : "");
    return cap(word) + ": " + res.name;
  }
  function kindWord(res, lang) { return KINDS[res.kind] ? KINDS[res.kind][LI[lang] || 0] : ""; }
  function signId(res) { return SIGN[res.kind] || res.kind; }
  function isPlant(res) { return !!res && res.ok && (res.kind === "plant" || res.kind === "flower" || res.kind === "tree"); }

  /* ---------- running the models ---------- */
  var ready = null, C = {}, LABELS = null;
  function load(vision, base) {
    if (ready) return ready;
    ready = (async function () {
      var v = await vision();
      LABELS = await (await fetch(base + "labels.json")).json();
      var names = ["general", "plants", "birds", "insects"];
      for (var i = 0; i < names.length; i++) {
        C[names[i]] = await v.mp.ImageClassifier.createFromOptions(v.files, { baseOptions: { modelAssetPath: base + names[i] + ".tflite", delegate: "CPU" }, runningMode: "IMAGE", maxResults: 10 });
      }
    })();
    ready.catch(function () { ready = null; });
    return ready;
  }
  /* source: an image, a video frame or a canvas. Returns what the four models said. */
  function look(source) {
    function run(n) { return C[n].classify(source).classifications[0].categories.map(function (c) { return { index: c.index, name: c.categoryName || c.displayName || "", score: c.score }; }); }
    return { gen: run("general"), plant: run("plants"), bird: run("birds"), insect: run("insects") };
  }
  /* raws: one look() per photo of the same subject. */
  function name(raws, mode) { return decide(merge(raws), LABELS, mode || "auto"); }

  return { kind: kind, decide: decide, merge: merge, fromList: fromList, choose: choose, nameIn: nameIn, kindWord: kindWord, signId: signId, isPlant: isPlant, load: load, look: look, name: name, KINDS: KINDS,
    count: { plants: 2101, birds: 964, insects: 1021, general: 398 } };
})();
if (typeof module !== "undefined") module.exports = Species;
