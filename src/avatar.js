/* SENYAS avatar: a signer drawn on a canvas, moving two hands through keyframes.
   A sign is written as one or two tracks (right; left), each a list of steps
   "SHAPE.PLACE.FACING[.ms]". PLACE may end in :t (fingertips touch), :i (index tip), :th (thumb tip),
   and @dx,dy,dz to nudge it. Left-track places are mirrored, so "n" is the left hand's own neutral
   space; a leading ~ puts it on the other side. */
var Avatar = (function () {
  var V = Hand.v;
  var LOC = {
    forehead: [0, 1.86, 0.42], temple: [-0.36, 1.76, 0.3], eye: [-0.15, 1.62, 0.45], nose: [0, 1.5, 0.52],
    mouth: [0, 1.33, 0.48], chin: [0, 1.13, 0.44], cheek: [-0.32, 1.4, 0.36], ear: [-0.47, 1.55, 0.15],
    neck: [0, 0.95, 0.32], shoulder: [-0.62, 0.78, 0.22], chest: [0, 0.48, 0.36], chestR: [-0.3, 0.45, 0.36],
    heart: [0.24, 0.5, 0.36], stomach: [0, -0.05, 0.36], n: [-0.34, 0.25, 0.62], nh: [-0.4, 0.72, 0.62],
    nc: [0, 0.3, 0.7], nL: [0.3, 0.18, 0.6], fwd: [-0.3, 0.55, 1.15], fwdlow: [-0.25, 0.05, 1.05],
    side: [-0.85, 0.5, 0.45], up: [-0.42, 1.5, 0.6], down: [-0.3, -0.35, 0.6], fs: [-0.5, 0.82, 0.62],
    rest: [-0.64, -0.98, 0.25], head: [0, 2.1, 0.2]
  };
  Hand.ORI.Hang = [[0.08, -1, 0.05], [1, 0, 0.2]];
  var SCALE = 0.38;

  function parseLoc(s) {
    var mir = s[0] === "~"; if (mir) s = s.slice(1);
    var off = [0, 0, 0], at = s.indexOf("@");
    if (at >= 0) { off = s.slice(at + 1).split(",").map(Number); s = s.slice(0, at); }
    var parts = s.split(":"), p = (LOC[parts[0]] || LOC.n).slice();
    p = V.add(p, [off[0] || 0, off[1] || 0, off[2] || 0]);
    if (mir) p[0] = -p[0];
    return { p: p, c: parts[1] || "" };
  }
  function parseStep(s) {
    var a = s.split(".");
    var ms = a.length > 3 && /^\d+$/.test(a[a.length - 1]) ? +a.pop() : 0;
    var loc = parseLoc(a.slice(1, a.length - 1).join(".") || "n");
    return { shape: a[0], loc: loc.p, c: loc.c, ori: a[a.length - 1] || "F", ms: ms };
  }
  function parse(spec) {
    var t = spec.split(";").map(function (x) { return x.trim().split(/\s+/).filter(Boolean).map(parseStep); });
    return { R: t[0] || [], L: t[1] || [] };
  }

  /* Fingerspelling: each letter is a short spec at the fingerspelling place. */
  var LETTER_ORI = { C: "C", O: "C", G: "G", H: "G", P: "P", Q: "Q", X: "X" };
  function letterSpec(ch) {
    ch = ch.toUpperCase();
    var shape = ch, o = LETTER_ORI[ch] || "Fa";
    if (ch === "J") return "I.fs.Fa I.fs@0.02,-0.16,0.Fa.250 I.fs@0.16,-0.24,0.B.300";
    if (ch === "Z") return "ONE.fs@-0.12,0.1,0.Fa ONE.fs@0.14,0.1,0.Fa.250 ONE.fs@-0.12,-0.14,0.Fa.250 ONE.fs@0.14,-0.14,0.Fa.250";
    if (ch === "Ñ") return "N.fs.Fa N.fs@0.07,0,0.Fa.150 N.fs@-0.05,0,0.Fa.150 N.fs@0.05,0,0.Fa.150";
    if (!Hand.SHAPES[shape]) return null;
    return shape + ".fs." + o;
  }
  var NUM = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
  function numberSpec(n) {
    if (n === 10) return "THUMB.fs.G THUMB.fs@0.05,0,0.I.200 THUMB.fs.G.200 THUMB.fs@0.05,0,0.I.200";
    return NUM[n] + ".fs." + (n === 0 ? "C" : "Fa");
  }

  /* ---------- drawing ---------- */
  function drawBody(ctx, o, face, t) {
    var k = o.k, X = function (x) { return o.cx + x * k; }, Y = function (y) { return o.cy - y * k; };
    var skin = Hand.TONES[o.tone || 0];
    ctx.save();
    ctx.fillStyle = o.shirt || "#1E5BD8";
    ctx.beginPath();
    ctx.moveTo(X(-0.95), Y(-1.6)); ctx.lineTo(X(-0.98), Y(0.42));
    ctx.quadraticCurveTo(X(-0.95), Y(0.85), X(-0.55), Y(0.9));
    ctx.lineTo(X(0.55), Y(0.9)); ctx.quadraticCurveTo(X(0.95), Y(0.85), X(0.98), Y(0.42));
    ctx.lineTo(X(0.95), Y(-1.6)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = skin[1]; ctx.fillRect(X(-0.13), Y(1.2), 0.26 * k, 0.36 * k);
    ctx.beginPath(); ctx.moveTo(X(-0.2), Y(0.9)); ctx.lineTo(X(0), Y(0.66)); ctx.lineTo(X(0.2), Y(0.9)); ctx.fillStyle = skin[1]; ctx.fill();
    ctx.fillStyle = o.hair || "#2A1B14";
    ctx.beginPath(); ctx.ellipse(X(0), Y(1.62), 0.45 * k, 0.52 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skin[0];
    ctx.beginPath(); ctx.ellipse(X(0), Y(1.52), 0.38 * k, 0.46 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(X(-0.39), Y(1.52), 0.07 * k, 0.11 * k, 0, 0, Math.PI * 2); ctx.ellipse(X(0.39), Y(1.52), 0.07 * k, 0.11 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = o.hair || "#2A1B14";
    ctx.beginPath(); ctx.moveTo(X(-0.4), Y(1.62)); ctx.quadraticCurveTo(X(-0.38), Y(2.08), X(0.05), Y(2.05));
    ctx.quadraticCurveTo(X(0.42), Y(2.02), X(0.4), Y(1.62)); ctx.quadraticCurveTo(X(0.2), Y(1.86), X(-0.4), Y(1.62)); ctx.fill();
    var blink = (t % 4200) < 140, brow = face === "yn" ? 0.06 : face === "wh" ? -0.03 : 0;
    ctx.strokeStyle = "#2A1B14"; ctx.lineCap = "round"; ctx.lineWidth = Math.max(1.5, 0.035 * k);
    [-1, 1].forEach(function (s) {
      ctx.beginPath();
      if (face === "wh") { ctx.moveTo(X(s * 0.24), Y(1.74 + brow)); ctx.lineTo(X(s * 0.07), Y(1.7 + brow)); }
      else if (face === "sad") { ctx.moveTo(X(s * 0.24), Y(1.68)); ctx.lineTo(X(s * 0.07), Y(1.74)); }
      else { ctx.moveTo(X(s * 0.24), Y(1.71 + brow)); ctx.quadraticCurveTo(X(s * 0.15), Y(1.76 + brow), X(s * 0.06), Y(1.72 + brow)); }
      ctx.stroke();
      ctx.beginPath();
      if (blink) { ctx.moveTo(X(s * 0.2), Y(1.6)); ctx.lineTo(X(s * 0.09), Y(1.6)); ctx.stroke(); }
      else { ctx.fillStyle = "#2A1B14"; ctx.ellipse(X(s * 0.145), Y(1.6), 0.04 * k, 0.05 * k, 0, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.strokeStyle = skin[2]; ctx.lineWidth = Math.max(1.2, 0.025 * k);
    ctx.beginPath(); ctx.moveTo(X(0), Y(1.55)); ctx.lineTo(X(-0.03), Y(1.44)); ctx.lineTo(X(0.02), Y(1.43)); ctx.stroke();
    ctx.strokeStyle = "#8A3B32"; ctx.lineWidth = Math.max(1.5, 0.03 * k); ctx.beginPath();
    if (face === "o") { ctx.ellipse(X(0), Y(1.3), 0.05 * k, 0.06 * k, 0, 0, Math.PI * 2); }
    else if (face === "sad") { ctx.moveTo(X(-0.1), Y(1.27)); ctx.quadraticCurveTo(X(0), Y(1.33), X(0.1), Y(1.27)); }
    else { ctx.moveTo(X(-0.12), Y(1.33)); ctx.quadraticCurveTo(X(0), Y(face === "happy" ? 1.22 : 1.26), X(0.12), Y(1.33)); }
    ctx.stroke();
    ctx.restore();
  }

  function arm(ctx, o, sh, w, side) {
    var k = o.k, L = 0.66 * k, S = [o.cx + sh[0] * k, o.cy - sh[1] * k];
    var d = [w[0] - S[0], w[1] - S[1]], D = Math.min(Math.hypot(d[0], d[1]), 2 * L - 1), a0 = Math.atan2(d[1], d[0]);
    var a = Math.acos(Math.max(-1, Math.min(1, D / (2 * L)))), best = null;
    [a, -a].forEach(function (aa) {
      var e = [S[0] + Math.cos(a0 + aa) * L, S[1] + Math.sin(a0 + aa) * L];
      var score = side * (e[0] - o.cx) + 0.6 * (e[1] - S[1]);
      if (!best || score > best.s) best = { e: e, s: score };
    });
    var E = best.e, wx = S[0] + Math.cos(a0) * D, wy = S[1] + Math.sin(a0) * D;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 0.23 * k + 2;
    ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(wx, wy); ctx.stroke();
    ctx.strokeStyle = o.shirt || "#1E5BD8"; ctx.lineWidth = 0.23 * k;
    ctx.stroke();
    ctx.strokeStyle = Hand.TONES[o.tone || 0][1]; ctx.lineWidth = 0.14 * k;
    ctx.beginPath(); ctx.moveTo(mixP(E, [wx, wy], 0.7)[0], mixP(E, [wx, wy], 0.7)[1]); ctx.lineTo(w[0], w[1]); ctx.stroke();
  }
  function mixP(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  /* One hand's state in avatar units: pose numbers, facing frame, wrist position. */
  function handState(step, left) {
    var r = Hand.resolve(step.shape), fm = Hand.frame(step.ori);
    var pts = Hand.orient(Hand.local(r), fm), c;
    if (step.c === "t") c = V.mixV(pts[12], pts[8], 0.5);
    else if (step.c === "i") c = pts[8];
    else if (step.c === "th") c = pts[4];
    else if (step.c === "w") c = pts[0];
    else c = V.add(V.mixV(pts[0], pts[9], 0.55), V.mul(fm[2], 0.12));
    var wrist = V.sub(step.loc, V.mul(c, SCALE));
    return { r: r, fm: fm, w: left ? [-wrist[0], wrist[1], wrist[2]] : wrist };
  }
  function mixState(a, b, t) {
    return { r: Hand.blend(a.r, b.r, t), fm: Hand.blendFrame(a.fm, b.fm, t), w: V.mixV(a.w, b.w, t) };
  }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }

  function drawHandState(ctx, o, s, left) {
    var pts = Hand.orient(Hand.local(s.r), s.fm), fm = s.fm;
    if (left) { pts = Hand.mirror(pts); fm = fm.map(function (v) { return [-v[0], v[1], v[2]]; }); }
    var u = SCALE * o.k;
    var sc = Hand.toScreen(pts, fm, o.cx + s.w[0] * o.k, o.cy - s.w[1] * o.k, u);
    sc.P.forEach(function (p) { p[2] += s.w[2] * o.k; });
    return { P: sc.P, nails: sc.nails, u: u };
  }

  /* ---------- player ---------- */
  function Player(canvas, opts) {
    var self = this, ctx = canvas.getContext("2d");
    this.opts = opts || {}; this.speed = 1; this.items = []; this.i = 0; this.playing = false;
    var restR = parseStep("RELAX.rest.Hang"), restL = parseStep("RELAX.rest.Hang");
    var cur = { R: handState(restR, false), L: handState(restL, true) }, from = null, to = null, face = "";
    var queue = [], qStart = 0, last = 0, raf = 0;

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth || 300, h = canvas.clientHeight || 300;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      var k = Math.min(canvas.width / 2.9, canvas.height / 3.3);
      return { k: k, cx: canvas.width / 2, cy: canvas.height * 0.66 + k * 0.05, tone: self.opts.tone, shirt: self.opts.shirt, hair: self.opts.hair };
    }
    function render(t) {
      var o = size(), left = !!self.opts.lefty;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBody(ctx, o, face, t);
      var hands = [["R", false], ["L", true]].map(function (h) {
        var mir = left ? !h[1] : h[1];
        var st = cur[h[0]];
        if (left) st = { r: st.r, fm: st.fm, w: [-st.w[0], st.w[1], st.w[2]] };
        return { d: drawHandState(ctx, o, st, mir), side: h[0] === "R" ? (left ? 1 : -1) : (left ? -1 : 1) };
      });
      hands.forEach(function (h) { arm(ctx, o, [h.side * 0.66, 0.74], h.d.P[0], h.side); });
      hands.sort(function (a, b) { return a.d.P[0][2] - b.d.P[0][2]; });
      hands.forEach(function (h) { Hand.drawHand(ctx, h.d.P, h.d.u, self.opts.tone, h.d.nails); });
    }
    function build(item) {
      var sp = parse(item.spec), n = Math.max(sp.R.length, sp.L.length), steps = [];
      for (var i = 0; i < n; i++) {
        var r = sp.R[Math.min(i, sp.R.length - 1)], l = sp.L.length ? sp.L[Math.min(i, sp.L.length - 1)] : restL;
        steps.push({ R: handState(r, false), L: handState(l, true), ms: (sp.R[i] && sp.R[i].ms) || 420, face: item.face || "", item: item.idx });
      }
      steps[steps.length - 1].hold = item.hold || 380;
      return steps;
    }
    function tick(now) {
      raf = 0;
      if (self.playing && queue.length) {
        var st = queue[0], dur = st.ms / self.speed, hold = (st.hold || 60) / self.speed, el = now - qStart;
        if (!from) { from = { R: cur.R, L: cur.L }; face = st.face; if (self.onitem) self.onitem(st.item); }
        var t = ease(el / dur);
        cur = { R: mixState(from.R, st.R, t), L: mixState(from.L, st.L, t) };
        if (el >= dur + hold) { queue.shift(); from = null; qStart = now; if (!queue.length) end(); }
      } else if (self.resting) {
        var q = ease(Math.min(1, (now - qStart) / 600));
        var rs = { R: handState(restR, false), L: handState(restL, true) };
        cur = { R: mixState(cur.R, rs.R, q * 0.2), L: mixState(cur.L, rs.L, q * 0.2) };
        if (q >= 1) self.resting = false;
      }
      if (now - last > 30 || self.playing) { render(now); last = now; }
      if (self.playing || self.resting || !document.hidden) raf = requestAnimationFrame(self.playing || self.resting ? tick : idle);
    }
    function idle(now) { raf = 0; if (now - last > 120 && canvas.clientWidth) { render(now); last = now; } if (!document.hidden && canvas.isConnected) raf = requestAnimationFrame(idle); }
    document.addEventListener("visibilitychange", function () { if (!document.hidden && canvas.isConnected) kick(); });
    function end() { self.playing = false; face = ""; self.resting = true; if (self.onend) self.onend(); }
    function kick() { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }

    this.load = function (items) { self.items = items; queue = []; items.forEach(function (it, i) { it.idx = i; queue = queue.concat(build(it)); }); from = null; };
    this.play = function (items) { if (items) self.load(items); if (!queue.length && self.items.length) self.load(self.items); self.playing = true; self.resting = false; qStart = performance.now(); from = null; kick(); };
    this.pause = function () { self.playing = false; kick(); };
    this.stop = function () { queue = []; self.playing = false; self.resting = true; qStart = performance.now(); kick(); };
    this.pose = function (spec) { var s = build({ spec: spec })[0]; cur = { R: s.R, L: s.L }; self.playing = false; self.resting = false; kick(); };
    this.redraw = function () { kick(); };
    kick();
  }

  /* One still frame (the first step of a sign) for thumbnails; crop "hand" zooms in on the hand. */
  function still(canvas, spec, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || 64, h = canvas.clientHeight || 64;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    var sp = parse(spec), r = sp.R[0], l = sp.L[0] || parseStep("RELAX.rest.Hang");
    var R = handState(r, false), L = handState(l, true);
    var k = Math.min(canvas.width / 2.9, canvas.height / 3.3);
    var o = { k: k, cx: canvas.width / 2, cy: canvas.height * 0.66 + k * 0.05, tone: opts.tone, shirt: opts.shirt };
    if (opts.crop === "hand") { o.k = canvas.height / 0.95; o.cx = canvas.width / 2 - R.w[0] * o.k; o.cy = canvas.height * 0.82 + R.w[1] * o.k; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (opts.crop !== "hand") drawBody(ctx, o, r.face || "", 1000);
    var hs = [{ d: drawHandState(ctx, o, R, false), side: -1 }];
    if (opts.crop !== "hand") hs.push({ d: drawHandState(ctx, o, L, true), side: 1 });
    if (opts.crop !== "hand") hs.forEach(function (x) { arm(ctx, o, [x.side * 0.66, 0.74], x.d.P[0], x.side); });
    hs.sort(function (a, b) { return a.d.P[0][2] - b.d.P[0][2]; });
    hs.forEach(function (x) { Hand.drawHand(ctx, x.d.P, x.d.u, opts.tone, x.d.nails); });
  }

  return { LOC: LOC, parse: parse, letterSpec: letterSpec, numberSpec: numberSpec, Player: Player, still: still };
})();
if (typeof module !== "undefined") module.exports = Avatar;
