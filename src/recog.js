/* SENYAS recogniser: turns MediaPipe hand landmarks into letters, numbers and words.
   Handshapes are matched against built-in examples made from the 3D hand (and any the user
   recorded); movement over the last moment of video gives J, Z, Ñ and the moving word signs. */
var Recog = (function () {
  var LETTERS = "ABCDEFGHIKLMNOPQRSTUVWXY".split("");
  var ORI_OF = { C: "C", O: "C", G: "G", H: "G", P: "P", Q: "Q", X: "X", BAD: "Gd", GOOD: "G" };
  var EXTRA = { ONE: "ONE", THREE: "THREE", FOUR: "FOUR", FIVE: "FIVE", SEVEN: "SEVEN", EIGHT: "EIGHT", ILY: "ILY", GOOD: "THUMB", BAD: "THUMB", FLATO: "FLATO" };
  var GROUP = {
    B: "flat", FOUR: "flat", FIVE: "flat", A: "fist", S: "fist", E: "fist", D: "one", ONE: "one", I: "I", T: "T", W: "W",
    O: "O", FLATO: "O", N: "N", GOOD: "thumb", X: "X", H: "H", U: "H", M: "fist"
  };
  var NUMBER = { O: 0, FLATO: 0, ONE: 1, D: 1, V: 2, K: 2, THREE: 3, FOUR: 4, B: 4, FIVE: 5, W: 6, SEVEN: 7, EIGHT: 8, F: 9 };
  var LETTER_ALIAS = { ONE: "D", FLATO: "O" };
  var WORD_STATIC = { ILY: "iloveyou", GOOD: "good", BAD: "bad", F: "okay" };

  var builtIn = null;
  function templates() {
    if (builtIn) return builtIn;
    builtIn = [];
    var seed = 11;
    function addT(label, shape, ori, n) { Hand.variants(shape, ori, n, seed++).forEach(function (f) { builtIn.push({ l: label, f: f }); }); }
    LETTERS.forEach(function (L) {
      var o = ORI_OF[L];
      if (o) addT(L, L, o, 18); else { addT(L, L, "F", 10); addT(L, L, "Fa", 8); }
    });
    Object.keys(EXTRA).forEach(function (k) { addT(k, EXTRA[k], ORI_OF[k] || "F", 14); });
    return builtIn;
  }

  /* Distances from a hand to every example, kept as the nearest per label. */
  function nearest(f, user, f2) {
    var best = {};
    function take(l, d) { if (best[l] === undefined || d < best[l]) best[l] = d; }
    templates().forEach(function (t) { take(t.l, Hand.dist(f, t.f)); if (f2) take(t.l, Hand.dist(f2, t.f) * 1.04); });
    (user || []).forEach(function (t) { take(t.l, Hand.dist(f, t.f) * 0.8); });
    return best;
  }
  function pick(best, allow) {
    var a = null, b = null;
    Object.keys(best).forEach(function (l) {
      var tok = allow(l); if (tok === null || tok === undefined) return;
      var d = best[l];
      if (!a || d < a.d) { if (a && a.tok !== tok) b = a; a = { l: l, tok: tok, d: d }; }
      else if ((!b || d < b.d) && tok !== a.tok) b = { l: l, tok: tok, d: d };
    });
    if (!a) return null;
    var conf = Math.max(0, Math.min(1, (1.55 - a.d) / 1.0)) * (b ? Math.min(1, 0.35 + (b.d - a.d) * 2.2) : 1);
    a.conf = conf;
    return a;
  }

  function allowFor(mode) {
    return function (l) {
      if (l.indexOf("u:") === 0) return l;
      if (mode === "num") return NUMBER[l] !== undefined ? "n:" + NUMBER[l] : null;
      if (mode === "word") return WORD_STATIC[l] ? "w:" + WORD_STATIC[l] : null;
      var L = LETTER_ALIAS[l] || l;
      if (L.length === 1) return "l:" + L;
      if (mode === "all" && WORD_STATIC[l] && l !== "F") return "w:" + WORD_STATIC[l];
      return null;
    };
  }

  /* ---------- landmarks ---------- */
  function hands(res, aspect, swap) {
    var out = [], lm = res.landmarks || [], wl = res.worldLandmarks || [], hd = res.handednesses || res.handedness || [];
    for (var i = 0; i < lm.length; i++) {
      var lab = hd[i] && hd[i][0] ? hd[i][0].categoryName : "Left";
      var right = (lab === "Left") !== !!swap;
      var w = (wl[i] && wl[i].length ? wl[i] : lm[i]).map(function (p) { return [p.x, -p.y, -p.z]; });
      var img = lm[i].map(function (p) { return [p.x * aspect, p.y]; });
      var s = Math.hypot(img[9][0] - img[0][0], img[9][1] - img[0][1]) || 0.1;
      /* Which hand it is decides the mirror; both are tried, since the label can be wrong. */
      var fa = Hand.features(right ? w : Hand.mirror(w)), fb = Hand.features(right ? Hand.mirror(w) : w);
      out.push({ right: right, f: fa, f2: fb, img: img, s: s });
    }
    return out;
  }

  /* ---------- movement ---------- */
  function osc(a, amp) {
    var dir = 0, ext = a[0], n = 0;
    for (var i = 1; i < a.length; i++) {
      var v = a[i];
      if (dir === 0) { if (v > ext + amp) { dir = 1; ext = v; } else if (v < ext - amp) { dir = -1; ext = v; } }
      else if (dir > 0) { if (v > ext) ext = v; else if (v < ext - amp) { n++; dir = -1; ext = v; } }
      else { if (v < ext) ext = v; else if (v > ext + amp) { n++; dir = 1; ext = v; } }
    }
    return n;
  }
  function path(xs, ys) { var d = 0; for (var i = 1; i < xs.length; i++) d += Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]); return d; }
  function circle(xs, ys, s) {
    var n = xs.length, cx = 0, cy = 0, i;
    for (i = 0; i < n; i++) { cx += xs[i]; cy += ys[i]; }
    cx /= n; cy /= n;
    var turn = 0, r = 0, prev = Math.atan2(ys[0] - cy, xs[0] - cx);
    for (i = 0; i < n; i++) {
      var a = Math.atan2(ys[i] - cy, xs[i] - cx), d = a - prev;
      while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      turn += d; prev = a; r += Math.hypot(xs[i] - cx, ys[i] - cy);
    }
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var round = Math.min(x1 - x0, y1 - y0) / (Math.max(x1 - x0, y1 - y0) || 1);
    return round > 0.45 && Math.abs(turn) > 1.6 * Math.PI && r / n > 0.28 * s;
  }

  /* ---------- custom signs: dynamic time warping over short recordings ---------- */
  function resample(seq, n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(seq[Math.min(seq.length - 1, Math.round(i * (seq.length - 1) / (n - 1)))]);
    return out;
  }
  function dtw(a, b) {
    var n = a.length, m = b.length, D = [], i, j, band = 4;
    for (i = 0; i <= n; i++) { D.push(new Float64Array(m + 1).fill(Infinity)); }
    D[0][0] = 0;
    for (i = 1; i <= n; i++) for (j = Math.max(1, i - band); j <= Math.min(m, i + band); j++) {
      D[i][j] = Hand.dist(a[i - 1], b[j - 1]) + Math.min(D[i - 1][j], D[i][j - 1], D[i - 1][j - 1]);
    }
    return D[n][m] / (n + m) * 2;
  }
  function seqFrames(frames) {
    var f0 = frames[0];
    return resample(frames, 16).map(function (fr) {
      return fr.f.concat([(fr.w[0] - f0.w[0]) / fr.s * 1.5, (fr.w[1] - f0.w[1]) / fr.s * 1.5, fr.two ? 0.8 : 0]);
    });
  }

  /* ---------- the live session ---------- */
  function Session(opts) {
    var S = this;
    this.mode = "all"; this.hold = 400; this.swap = false; this.lefty = false; this.user = []; this.custom = [];
    var buf = [], stable = { tok: null, since: 0, done: false, last: 0 }, lastHand = 0, cooldown = 0, frameN = 0, twoSince = 0, twoTok = null, twoDone = false;
    function emit(type, data) { if (opts && opts[type]) opts[type](data); }

    function commit(tok, t, conf) {
      cooldown = t + 700; buf = [];
      emit("commit", { tok: tok, conf: conf || 1 });
    }

    function dynamic(t) {
      var win = buf.filter(function (b) { return t - b.t < 1500; });
      if (win.length < 10 || t < cooldown) return null;
      var m = S.mode, n = win.length, s = win.map(function (b) { return b.s; }).sort()[n >> 1];
      function frac(g) { return win.filter(function (b) { return b.g === g; }).length / n; }
      function col(k, j) { return win.map(function (b) { return b[k][j]; }); }
      var wx = col("w", 0), wy = col("w", 1), ix = col("i", 0), iy = col("i", 1), mx = col("m", 0), py = col("p", 1), px = col("p", 0), ky = col("k", 1);
      var ti = win.map(function (b) { return b.ti; });
      var L = m === "abc" || m === "all", W = m === "word" || m === "all";
      var two = win.filter(function (b) { return b.two; }).length / n > 0.6;
      if (W && two && frac("flat") > 0.5 && osc(wx, 0.3 * s) >= 2) return "w:finished";
      if (two) return null;
      if (L && frac("I") > 0.8 && win[n - 1].g === "I" && win[0].g === "I" && path(px, py) > 1.0 * s && py[n - 1] - py[0] > 0.25 * s) return "l:J";
      if (frac("one") > 0.75 && win[n - 1].g === "one" && osc(ix, 0.35 * s) >= 2) {
        if (L && iy[n - 1] - iy[0] > 0.3 * s) return "l:Z";
        if (W && Math.abs(iy[n - 1] - iy[0]) < 0.3 * s) return "w:where";
      }
      if (L && frac("N") > 0.8 && osc(wx, 0.15 * s) >= 2) return "l:Ñ";
      if (m === "num" && frac("thumb") > 0.5 && osc(wx, 0.15 * s) >= 2) return "n:10";
      if (!W) return null;
      if (frac("flat") > 0.5) {
        if (osc(mx, 0.35 * s) >= 2) return "w:hello";
        if (circle(wx, wy, s)) return "w:please";
        if (wy[n - 1] - wy[0] > 1.0 * s && wy[0] < 0.6 && osc(mx, 0.35 * s) < 1) return "w:thankyou";
      }
      if (frac("fist") > 0.5) {
        if (circle(wx, wy, s)) return "w:sorry";
        if (osc(ky, 0.16 * s) >= 2 && osc(wx, 0.3 * s) < 2) return "w:yes";
      }
      if (frac("W") > 0.5 && osc(iy, 0.15 * s) >= 2) return "w:water";
      if (frac("O") > 0.5 && osc(wy, 0.2 * s) >= 2) return "w:eat";
      if (frac("T") > 0.5 && osc(wx, 0.15 * s) >= 2) return "w:bathroom";
      if (frac("flat") < 0.3 && osc(ti, 0.35) >= 3) return "w:no";
      return null;
    }

    function twoHand(a, b) {
      var ga = a.g, gb = b.g, s = (a.s + b.s) / 2;
      function d(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]) / s; }
      if (ga === "fist" && gb === "fist" && d(a.img[0], b.img[0]) < 1.6) return "w:love";
      if (ga === "O" && gb === "O" && d(a.img[8], b.img[8]) < 0.7) return "w:more";
      if (ga === "flat" && gb === "flat" && d(a.img[12], b.img[12]) < 0.6 && d(a.img[0], b.img[0]) > 1.0) return "w:house";
      if ((ga === "thumb" || ga === "fist") && gb === "flat" && a.img[0][1] < b.img[0][1] && d(a.img[0], b.img[9]) < 1.6) return "w:help";
      if ((gb === "thumb" || gb === "fist") && ga === "flat" && b.img[0][1] < a.img[0][1] && d(b.img[0], a.img[9]) < 1.6) return "w:help";
      if (ga === "X" && gb === "X" && d(a.img[8], b.img[8]) < 0.8) return "w:friend";
      if (ga === "H" && gb === "H" && d(a.img[12], b.img[12]) < 1.0) return "w:name";
      return null;
    }

    function customMatch(t) {
      if (!S.custom.length || frameN % 5) return null;
      var win = buf.filter(function (b) { return t - b.t < 1600; });
      if (win.length < 12) return null;
      var q = seqFrames(win), best = null;
      S.custom.forEach(function (c) {
        if (!c.dyn) return;
        if (c.tol === undefined) {
          var tot = 0, k = 0;
          for (var i = 0; i < c.dyn.length; i++) for (var j = i + 1; j < c.dyn.length; j++) { tot += dtw(c.dyn[i], c.dyn[j]); k++; }
          c.tol = Math.max(0.75, Math.min(1.6, (k ? tot / k : 0.5) * 1.6));
        }
        c.dyn.forEach(function (sq) { var d = dtw(q, sq) / c.tol; if (!best || d < best.d) best = { d: d, id: c.id }; });
      });
      return best && best.d < 1 ? "u:" + best.id : null;
    }

    /* res: HandLandmarker result; t: ms; aspect: video width / height. */
    this.frame = function (res, t, aspect) {
      frameN++;
      var hs = hands(res, aspect, S.swap);
      if (!hs.length) {
        if (lastHand && t - lastHand > 900) { lastHand = 0; buf = []; stable.tok = null; emit("idle", {}); }
        emit("shape", null);
        return;
      }
      lastHand = t;
      hs.forEach(function (h) {
        h.near = nearest(h.f, S.user, h.f2);
        var g = pick(h.near, function (l) { return l.indexOf("u:") === 0 ? null : l; });
        h.lab = g ? g.l : null; h.g = g ? GROUP[g.l] || g.l : null;
      });
      var dom = hs[0];
      if (hs.length > 1) { var want = !S.lefty; dom = hs.filter(function (h) { return h.right === want; })[0] || (hs[0].s >= hs[1].s ? hs[0] : hs[1]); }
      var other = hs.length > 1 ? hs.filter(function (h) { return h !== dom; })[0] : null;
      var im = dom.img;
      buf.push({ t: t, g: dom.g, l: dom.lab, w: im[0], i: im[8], m: im[12], p: im[20], k: im[6], s: dom.s, f: dom.f,
        ti: Math.hypot(im[4][0] - im[8][0], im[4][1] - im[8][1]) / dom.s, two: !!other });
      while (buf.length && t - buf[0].t > 1700) buf.shift();

      var dyn = customMatch(t) || dynamic(t);
      if (dyn) { commit(dyn, t, 0.9); stable = { tok: dyn, since: t, done: true, last: t }; return; }

      var cur = pick(dom.near, allowFor(S.mode));
      if (other && (S.mode === "word" || S.mode === "all")) {
        var tt = twoHand(dom, other);
        if (tt) {
          if (tt !== twoTok) { twoTok = tt; twoSince = t; twoDone = false; }
          emit("shape", { tok: tt, conf: 0.9, two: true });
          if (!twoDone && t - twoSince > S.hold && t > cooldown) { twoDone = true; commit(tt, t, 0.9); }
          return;
        }
        twoTok = null;
      }
      var ok = cur && cur.conf > 0.32;
      emit("shape", ok ? { tok: cur.tok, conf: cur.conf, lab: cur.l } : null);
      if (!ok) { stable.tok = null; return; }
      var recent = buf.filter(function (b) { return t - b.t < 400; }), moved = 0;
      if (recent.length > 1) moved = Math.hypot(recent[recent.length - 1].w[0] - recent[0].w[0], recent[recent.length - 1].w[1] - recent[0].w[1]) / dom.s;
      if (cur.tok !== stable.tok) { stable = { tok: cur.tok, since: t, done: false, last: 0 }; return; }
      var isLetter = cur.tok.indexOf("l:") === 0 || cur.tok.indexOf("n:") === 0, w = dom.img[0];
      if (stable.done && isLetter && stable.at && Math.hypot(w[0] - stable.at[0], w[1] - stable.at[1]) / dom.s > 0.4) { stable.slid = t; stable.at = w; }
      if (moved > 0.6 || t < cooldown) return;
      if (!stable.done && t - stable.since > S.hold) { stable.done = true; stable.last = t; stable.at = w; emit("commit", { tok: cur.tok, conf: cur.conf }); }
      else if (stable.done && isLetter && stable.slid && moved < 0.25 && t - stable.slid > S.hold * 0.4) { stable.slid = 0; stable.last = t; stable.at = w; emit("commit", { tok: cur.tok, conf: cur.conf, again: true }); }
      else if (stable.done && isLetter && S.repeat && t - stable.last > S.hold * 3.2) { stable.last = t; stable.at = w; emit("commit", { tok: cur.tok, conf: cur.conf, again: true }); }
    };

    /* Recording a custom sign or a personal example: collects frames for ms, then hands them back. */
    this.record = function (ms, done) {
      var frames = [], t0 = 0, prev = S.frame;
      S.frame = function (res, t, aspect) {
        var hs = hands(res, aspect, S.swap);
        if (!t0) t0 = t;
        if (hs.length) {
          var dom = hs[0];
          if (hs.length > 1) { var want = !S.lefty; dom = hs.filter(function (h) { return h.right === want; })[0] || hs[0]; }
          frames.push({ f: dom.f, w: dom.img[0], s: dom.s, two: hs.length > 1 });
        }
        if (opts && opts.shape) opts.shape(hs.length ? { rec: true } : null);
        if (t - t0 >= ms) { S.frame = prev; done(summarise(frames)); }
      };
    };
    function summarise(frames) {
      if (frames.length < 5) return null;
      var s = frames[0].s, xs = frames.map(function (f) { return f.w[0]; }), ys = frames.map(function (f) { return f.w[1]; });
      var moving = path(xs, ys) > 1.1 * s;
      var mean = frames[0].f.map(function (_, i) { var a = 0; frames.forEach(function (fr) { a += fr.f[i]; }); return a / frames.length; });
      return { moving: moving, mean: mean, seq: seqFrames(frames) };
    }
  }

  return { Session: Session, templates: templates, nearest: nearest, pick: pick, allowFor: allowFor, hands: hands, osc: osc, circle: circle, dtw: dtw, GROUP: GROUP, NUMBER: NUMBER };
})();
if (typeof module !== "undefined") module.exports = Recog;
