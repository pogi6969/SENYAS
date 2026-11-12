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
  function best(list, labels) {
    /* A specialist's top answers without its "background" class; bg is that class's score. */
    var bgIndex = labels.length - 1, bg = 0, out = [];
    list.forEach(function (c) { if (c.index === bgIndex) bg = c.score; else out.push({ sci: labels[c.index][0], name: labels[c.index][1] || labels[c.index][0], score: c.score }); });
    return { top: out[0] || null, alts: out.slice(1, 3).filter(function (a) { return a.score >= 0.05; }), bg: bg };
  }

  /* gen: the general model's answers [{index, name, score}], best first. sp: {plant, bird, insect}, each the
     specialist's answers [{index, score}]. labels: {plant, bird, insect} name lists. */
  function decide(gen, sp, labels) {
    var sums = {}, lead = {}, dead = 0;
    gen.forEach(function (c) {
      var k = kind(c.index);
      if (!k) { dead = Math.max(dead, c.score); return; }
      var route = k === "bird" || k === "insect" || k === "plant" ? k : "animal";
      sums[route] = (sums[route] || 0) + c.score;
      if (!lead[route]) lead[route] = { kind: k, name: c.name, score: c.score };
    });
    var gate = null;
    Object.keys(sums).forEach(function (r) { if (!gate || sums[r] > sums[gate]) gate = r; });
    if (gate && (sums[gate] < 0.18 || sums[gate] < dead * 0.6)) gate = null;
    var B = { plant: best(sp.plant, labels.plant), bird: best(sp.bird, labels.bird), insect: best(sp.insect, labels.insect) };

    function fromSpecialist(route, why) {
      var b = B[route], t = b.top, k = route;
      if (route === "plant") k = FLOWER.test(t.name) ? "flower" : TREE.test(t.name) ? "tree" : "plant";
      if (route === "insect" && FLUTTER.test(t.name)) k = "butterfly";
      return { ok: true, kind: k, name: t.name, sci: t.sci, score: t.score, alts: b.alts, source: route, why: why };
    }
    function fromGeneral(route) {
      var l = lead[route], k = l.kind, name = cap(l.name), detail = "";
      if (k === "dog" || k === "cat") { detail = l.name; name = cap(KINDS[k][0]); }
      if (route === "plant") k = FLOWER.test(l.name) ? "flower" : "plant";
      return { ok: true, kind: k, name: name, sci: "", detail: detail, key: l.name, score: Math.min(1, sums[route]), alts: [], source: "general" };
    }

    if (gate === "animal") return fromGeneral("animal");
    if (gate) {
      var t = B[gate].top;
      if (t && t.score >= 0.3 && t.score >= B[gate].bg) return fromSpecialist(gate, "gate");
      if (lead[gate].score >= 0.3 || !t || t.score < 0.12) return fromGeneral(gate);
      return fromSpecialist(gate, "weak");
    }
    /* The general model saw no living thing: believe a specialist only when it is sure. */
    var need = { plant: 0.35, bird: 0.6, insect: 0.6 }, pick = null;
    Object.keys(B).forEach(function (r) { var t = B[r].top; if (t && t.score >= need[r] && t.score > B[r].bg && (!pick || t.score > B[pick].top.score)) pick = r; });
    if (pick) return fromSpecialist(pick, "alone");
    return { ok: false };
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

  /* ---------- running the models ---------- */
  var ready = null, C = {}, LABELS = null;
  function load(vision, base) {
    if (ready) return ready;
    ready = (async function () {
      var v = await vision();
      LABELS = await (await fetch(base + "labels.json")).json();
      var names = ["general", "plants", "birds", "insects"];
      for (var i = 0; i < names.length; i++) {
        C[names[i]] = await v.mp.ImageClassifier.createFromOptions(v.files, { baseOptions: { modelAssetPath: base + names[i] + ".tflite", delegate: "CPU" }, runningMode: "IMAGE", maxResults: names[i] === "general" ? 10 : 4 });
      }
    })();
    ready.catch(function () { ready = null; });
    return ready;
  }
  /* source: an image, a video frame or a canvas. */
  function classify(source) {
    function run(n) { return C[n].classify(source).classifications[0].categories.map(function (c) { return { index: c.index, name: c.categoryName || c.displayName || "", score: c.score }; }); }
    return decide(run("general"), { plant: run("plants"), bird: run("birds"), insect: run("insects") }, LABELS);
  }

  return { kind: kind, decide: decide, nameIn: nameIn, kindWord: kindWord, signId: signId, load: load, classify: classify, KINDS: KINDS, count: { plants: 2101, birds: 964, insects: 1021, general: 398 } };
})();
if (typeof module !== "undefined") module.exports = Species;
