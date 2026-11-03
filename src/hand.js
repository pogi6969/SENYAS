/* SENYAS hand: a 3D hand built from joint angles. It draws the signing avatar and makes the
   built-in examples the live translator compares camera hands against.
   Space: x to the viewer's right, y up, z toward the viewer. Hands are built as a right hand;
   a left hand is the mirror image (x -> -x). Points follow the MediaPipe order (0 wrist,
   1-4 thumb, 5-8 index, 9-12 middle, 13-16 ring, 17-20 pinky). */
var Hand = (function () {
  var RAD = Math.PI / 180;
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function mixV(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
  function avg(a, b) { return mixV(a, b, 0.5); }

  var MCP = [[0.30, 0.95, 0], [0.08, 1.0, 0], [-0.13, 0.95, 0], [-0.32, 0.85, 0]];
  var SEG = [[0.45, 0.27, 0.22], [0.50, 0.31, 0.23], [0.47, 0.29, 0.22], [0.36, 0.21, 0.19]];
  var BASE = [5, 0, -5, -10];
  var CMC = [0.21, 0.2, 0.08], TH = [0.42, 0.33, 0.27];
  var CURL = {
    x: [0, 0, 0], c: [88, 100, 65], h: [8, 95, 75], b: [85, 5, 5], r: [28, 45, 30], o: [45, 65, 40],
    e: [62, 105, 72], m: [72, 85, 40], k: [45, 0, 0], f: [55, 22, 12], s: [12, 18, 10], t: [70, 95, 55], w: [25, 20, 12]
  };

  /* Handshapes. f: index, middle, ring, pinky (a CURL letter or [mcp, pip, dip]); s: extra
     spread in degrees (toward the thumb is positive); t: where the thumb tip goes. */
  var SHAPES = {
    A: { f: "cccc", t: "up" }, B: { f: "xxxx", t: "across" }, C: { f: "rrrr", t: "c" },
    D: { f: "xooo", t: "tm" }, E: { f: "eeee", t: "e" }, F: { f: "oxxx", s: [0, 3, -3, -8], t: "ti" },
    G: { f: "xccc", t: "g" }, H: { f: "xxcc", s: [-2, 2, 0, 0], t: "hold" }, I: { f: "cccx", s: [0, 0, 0, -6], t: "fist" },
    K: { f: ["x", "k", "c", "c"], s: [6, -10, 0, 0], t: "kmid" }, L: { f: "xccc", t: "out" },
    M: { f: "mmmc", t: "m" }, N: { f: "mmcc", t: "n" }, O: { f: "oooo", t: "ti" },
    R: { f: [[0, 0, 0], [14, 0, 0], "c", "c"], s: [-9, 13, 0, 0], t: "hold" }, S: { f: "cccc", t: "fist" },
    T: { f: ["t", "c", "c", "c"], t: "between" }, U: { f: "xxcc", s: [-3, 3, 0, 0], t: "hold" },
    V: { f: "xxcc", s: [9, -9, 0, 0], t: "hold" }, W: { f: "xxxc", s: [9, 0, -9, 0], t: "tp" },
    X: { f: "hccc", t: "fist" }, Y: { f: "cccx", s: [0, 0, 0, -18], t: "out" }, ONE: { f: "xccc", t: "hold" },
    THREE: { f: "xxcc", s: [9, -9, 0, 0], t: "out" }, FOUR: { f: "xxxx", s: [10, 2, -6, -14], t: "across" },
    FIVE: { f: "xxxx", s: [14, 2, -9, -20], t: "out" }, SEVEN: { f: ["x", "x", "o", "x"], s: [8, 0, -4, -14], t: "tr" },
    EIGHT: { f: ["x", "o", "x", "x"], s: [8, 0, -6, -14], t: "tm" }, ILY: { f: "xccx", s: [4, 0, 0, -14], t: "out" },
    THUMB: { f: "cccc", t: "thumb" }, FLAT: { f: "xxxx", t: "side" }, FLATO: { f: "ffff", t: "tm" },
    BENT: { f: "bbbb", t: "side" }, CLAW: { f: [[30, 60, 40], [30, 60, 40], [30, 60, 40], [30, 60, 40]], s: [14, 2, -9, -20], t: "claw" },
    RELAX: { f: "wwww", s: [4, 1, -3, -6], t: "relax" }, HOOK2: { f: "hhcc", s: [6, -6, 0, 0], t: "hold" },
    PINCH: { f: ["o", "x", "x", "x"], s: [0, 3, -3, -8], t: "ti" }, BENTV: { f: "hhcc", s: [9, -9, 0, 0], t: "hold" }
  };
  SHAPES.J = SHAPES.I; SHAPES.Z = SHAPES.ONE; SHAPES.P = SHAPES.K; SHAPES.Q = SHAPES.G;
  SHAPES.TWO = SHAPES.V; SHAPES.SIX = SHAPES.W; SHAPES.NINE = SHAPES.F; SHAPES.ZERO = SHAPES.O; SHAPES.OK = SHAPES.F;

  /* Orientations: the direction the fingers point and the direction the palm faces. */
  var ORI = {
    F: [[0, 1, 0], [0, 0, 1]], Fa: [[0, 1, 0], [0.4, 0, 0.92]], B: [[0, 1, 0], [0, 0, -1]],
    C: [[0, 1, 0], [0.82, 0, 0.57]], S: [[0, 1, 0], [1, 0, 0.15]], G: [[1, 0, 0.15], [0, 0, -1]],
    Gd: [[-1, 0, 0.15], [0, 0, -1]], P: [[0.15, -0.6, 0.8], [0.2, -0.8, -0.6]], Q: [[0.3, -0.92, 0.25], [0, 0.2, -1]],
    U: [[0, 0.25, 1], [0, 1, -0.25]], D: [[0, -0.2, 1], [0, -1, -0.2]], X: [[0, 1, 0], [0.7, 0, 0.7]],
    I: [[1, 0.3, 0], [0, 0, -1]], Iu: [[0.9, 0.4, 0], [0, 1, 0]], Id: [[0.9, 0.3, 0], [0, -1, 0]],
    T: [[0.3, 1, 0], [0.8, 0, 0.6]], Dn: [[0, -1, 0.1], [0, 0, -1]], Df: [[0, -1, 0.1], [0, 0, 1]],
    Fw: [[0, 0.1, 1], [1, 0, 0]], Ul: [[0.9, 0.2, 0.3], [0, 1, 0]], Bi: [[0.5, 1, 0], [0, 0, -1]],
    Fi: [[0.4, 1, 0], [0, 0, 1]], Si: [[0.6, 0.8, 0.2], [0.8, -0.5, 0.2]], Up: [[0, 1, 0.2], [0, 0.2, -1]]
  };

  function curlOf(c) { return typeof c === "string" ? CURL[c] : c; }

  function finger(i, c, s) {
    var a = (BASE[i] + (s || 0)) * RAD, u = [Math.sin(a), Math.cos(a), 0], z = [0, 0, 1];
    var p = MCP[i], out = [p], th = 0;
    for (var j = 0; j < 3; j++) {
      th += c[j] * RAD;
      p = add(p, mul(add(mul(u, Math.cos(th)), mul(z, Math.sin(th))), SEG[i][j]));
      out.push(p);
    }
    return out;
  }

  /* The thumb is placed by reaching its tip to a target (FABRIK), starting from a natural bow. */
  function thumb(target) {
    var b = CMC, d = sub(target, b), dist = len(d), dn = norm(d), tot = TH[0] + TH[1] + TH[2];
    if (dist >= tot - 1e-3) return [b, add(b, mul(dn, TH[0])), add(b, mul(dn, TH[0] + TH[1])), add(b, mul(dn, tot))];
    var j1 = add(b, mul(norm(add(mul(dn, 0.55), [0.55, 0.35, -0.05])), TH[0]));
    var j2 = add(j1, mul(norm(add(mul(dn, 0.9), [0.25, 0.15, 0.05])), TH[1]));
    var j3 = add(j2, mul(dn, TH[2]));
    for (var k = 0; k < 14; k++) {
      j3 = target;
      j2 = add(j3, mul(norm(sub(j2, j3)), TH[2]));
      j1 = add(j2, mul(norm(sub(j1, j2)), TH[1]));
      j1 = add(b, mul(norm(sub(j1, b)), TH[0]));
      j2 = add(j1, mul(norm(sub(j2, j1)), TH[1]));
      j3 = add(j2, mul(norm(sub(j3, j2)), TH[2]));
    }
    return [b, j1, j2, j3];
  }

  function thumbTarget(t, F) {
    if (Array.isArray(t)) return t;
    var tip = function (i, o) { return add(F[i][3], o || [0, -0.02, 0.035]); };
    switch (t) {
      case "out": return add(CMC, [0.8, 0.48, 0.1]);
      case "thumb": return add(CMC, [0.98, 0.3, 0.12]);
      case "up": return [0.45, 0.98, 0.24];
      case "side": return [0.4, 0.72, 0.04];
      case "relax": return [0.48, 0.78, 0.2];
      case "g": return [0.44, 0.98, 0.1];
      case "across": return [-0.1, 0.62, 0.16];
      case "fist": return add(F[1][1], [-0.06, -0.22, 0.15]);
      case "between": return add(avg(F[0][1], F[1][1]), [0, 0, 0.09]);
      case "n": return add(avg(MCP[1], MCP[2]), [0, -0.2, 0.36]);
      case "m": return add(avg(MCP[2], MCP[3]), [0, -0.2, 0.33]);
      case "e": return [0.0, 0.6, 0.2];
      case "hold": return add(F[2][1], [0.07, -0.08, 0.1]);
      case "kmid": return add(F[1][1], [0.06, -0.02, 0.05]);
      case "c": return add(F[0][3], [-0.06, -0.72, 0]);
      case "claw": return add(CMC, [0.62, 0.52, 0.3]);
      case "ti": return tip(0); case "tm": return tip(1); case "tr": return tip(2); case "tp": return tip(3);
    }
    return add(CMC, [0.6, 0.5, 0.1]);
  }

  /* Resolve a shape (by name or object) to numbers that can be blended frame to frame. */
  function resolve(shape) {
    var sh = typeof shape === "string" ? SHAPES[shape] : shape;
    var fl = [], sp = [], F = [];
    for (var i = 0; i < 4; i++) {
      var c = curlOf(typeof sh.f === "string" ? sh.f[i] : sh.f[i]);
      fl.push(c.slice()); sp.push(sh.s ? sh.s[i] : 0);
      F.push(finger(i, c, sp[i]));
    }
    return { fl: fl, sp: sp, tt: thumbTarget(sh.t, F) };
  }

  function blend(a, b, t) {
    var fl = [], sp = [];
    for (var i = 0; i < 4; i++) {
      fl.push([mix(a.fl[i][0], b.fl[i][0], t), mix(a.fl[i][1], b.fl[i][1], t), mix(a.fl[i][2], b.fl[i][2], t)]);
      sp.push(mix(a.sp[i], b.sp[i], t));
    }
    return { fl: fl, sp: sp, tt: mixV(a.tt, b.tt, t) };
  }

  /* Local points (palm facing +z, fingers +y): the 21 landmarks plus the two wrist edges. */
  function local(r) {
    var pts = [[0, 0, 0]], T = thumb(r.tt);
    for (var j = 0; j < 4; j++) pts.push(T[j]);
    for (var i = 0; i < 4; i++) { var F = finger(i, r.fl[i], r.sp[i]); for (var k = 0; k < 4; k++) pts.push(F[k]); }
    pts.push([0.22, 0.02, 0.02], [-0.21, 0.05, 0.02]);
    return pts;
  }

  function frame(o) {
    var v = typeof o === "string" ? ORI[o] : o;
    var y = norm(v[0]), z = v[1];
    z = norm(sub(z, mul(y, dot(z, y))));
    return [cross(y, z), y, z];
  }
  function blendFrame(a, b, t) {
    var y = norm(mixV(a[1], b[1], t)), z = mixV(a[2], b[2], t);
    if (len(z) < 1e-3) z = a[0];
    z = norm(sub(z, mul(y, dot(z, y))));
    return [cross(y, z), y, z];
  }
  function orient(pts, f) {
    return pts.map(function (p) { return add(add(mul(f[0], p[0]), mul(f[1], p[1])), mul(f[2], p[2])); });
  }
  function mirror(pts) { return pts.map(function (p) { return [-p[0], p[1], p[2]]; }); }

  function build(shape, ori) { return orient(local(resolve(shape)), frame(ori || "F")); }

  /* ---------- Features (shared by the templates and the camera) ---------- */
  /* Shape: fingertip and middle-joint positions in the palm's own frame, so they hold however the
     hand turns; orientation: which way the fingers point and the palm faces, for G/H/P/Q. */
  function features(p) {
    var W = p[0], Y = sub(p[9], W), s = len(Y) || 1;
    Y = mul(Y, 1 / s);
    var Z = norm(cross(sub(p[5], p[17]), Y)), X = cross(Y, Z);
    function loc(q) { var d = sub(q, W); return [dot(d, X) / s, dot(d, Y) / s, dot(d, Z) / s]; }
    var f = [], i, tips = [4, 8, 12, 16, 20], mids = [3, 6, 10, 14, 18];
    for (i = 0; i < 5; i++) f.push.apply(f, loc(p[tips[i]]));
    for (i = 0; i < 5; i++) f.push.apply(f, loc(p[mids[i]]).map(function (x) { return x * 0.7; }));
    for (i = 1; i < 5; i++) f.push(1.4 * len(sub(p[4], p[tips[i]])) / s);
    for (i = 1; i < 4; i++) f.push(1.2 * len(sub(p[tips[i]], p[tips[i + 1]])) / s);
    f.push(Y[0] * 0.9, Y[1] * 0.9, Z[2] * 0.5, Z[0] * 0.4);
    return f;
  }
  function dist(a, b) { var d = 0; for (var i = 0; i < a.length; i++) { var e = a[i] - b[i]; d += e * e; } return Math.sqrt(d); }

  /* Built-in examples: each sign's shape, turned and loosened a little at random. */
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
  function rotate(f, ax, ay, az) {
    function rx(v) { var c = Math.cos(ax), s = Math.sin(ax); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; }
    function ry(v) { var c = Math.cos(ay), s = Math.sin(ay); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; }
    function rz(v) { var c = Math.cos(az), s = Math.sin(az); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; }
    return f.map(function (v) { return rz(rx(ry(v))); });
  }
  function variants(shape, ori, n, seed) {
    var r = rng(seed || 7), base = resolve(shape), out = [];
    for (var k = 0; k < n; k++) {
      var j = k === 0 ? 0 : 1;
      var q = { fl: base.fl.map(function (c) { return c.map(function (a) { return Math.max(0, a + j * (r() - 0.5) * 16); }); }),
        sp: base.sp.map(function (a) { return a + j * (r() - 0.5) * 6; }),
        tt: add(base.tt, [j * (r() - 0.5) * 0.08, j * (r() - 0.5) * 0.08, j * (r() - 0.5) * 0.08]) };
      var f = rotate(frame(ori), j * (r() - 0.5) * 0.6, j * (r() - 0.5) * 0.8, j * (r() - 0.5) * 0.5);
      out.push(features(orient(local(q), f).slice(0, 21)));
    }
    return out;
  }

  /* ---------- Drawing ---------- */
  var TONES = [["#F1C7A3", "#D9A47F", "#7A4A33"], ["#E0A57A", "#C4865C", "#6B3E2A"], ["#B9774D", "#9C5F3A", "#4E2A18"], ["#8A5236", "#6E3F28", "#33190D"]];
  var WID = [0.2, 0.205, 0.195, 0.17], THW = 0.22;

  /* P: 23 points already in screen space (x right, y down, z toward the viewer, in px); u: px per palm. */
  function drawHand(ctx, P, u, tone, nails) {
    var col = TONES[tone || 0], items = [], ow = Math.max(1.2, u * 0.035);
    function seg(a, b, w, kind) { items.push({ z: (P[a][2] + P[b][2]) / 2 + (kind === 2 ? 0.02 * u : 0), a: a, b: b, w: w * u, k: kind }); }
    var palm = [21, 1, 5, 9, 13, 17, 22];
    var pz = 0; palm.forEach(function (i) { pz += P[i][2]; }); pz /= palm.length;
    items.push({ z: pz - 0.01 * u, palm: palm });
    seg(1, 2, THW, 0); seg(2, 3, THW * 0.95, 1); seg(3, 4, THW * 0.9, 2);
    for (var f = 0; f < 4; f++) { var b = 5 + f * 4; seg(b, b + 1, WID[f], 0); seg(b + 1, b + 2, WID[f] * 0.95, 1); seg(b + 2, b + 3, WID[f] * 0.9, 2); }
    items.sort(function (a, b) { return a.z - b.z; });
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    items.forEach(function (it) {
      if (it.palm) {
        ctx.beginPath();
        it.palm.forEach(function (i, n) { if (n) ctx.lineTo(P[i][0], P[i][1]); else ctx.moveTo(P[i][0], P[i][1]); });
        ctx.closePath();
        ctx.strokeStyle = col[2]; ctx.lineWidth = u * 0.24 + ow * 2; ctx.stroke();
        ctx.fillStyle = col[0]; ctx.fill(); ctx.strokeStyle = col[0]; ctx.lineWidth = u * 0.24; ctx.stroke();
        return;
      }
      var A = P[it.a], B = P[it.b];
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0] + 0.01, B[1]);
      ctx.strokeStyle = col[2]; ctx.lineWidth = it.w + ow * 2; ctx.stroke();
      ctx.strokeStyle = it.k === 0 ? col[1] : col[0]; ctx.lineWidth = it.w; ctx.stroke();
      if (it.k === 0) { ctx.strokeStyle = col[0]; ctx.lineWidth = it.w * 0.7; ctx.stroke(); }
      if (it.k === 2 && nails && nails[it.b]) {
        var n = nails[it.b];
        ctx.beginPath(); ctx.moveTo(mix(A[0], B[0], 0.45) + n[0], mix(A[1], B[1], 0.45) + n[1]); ctx.lineTo(B[0] + n[0], B[1] + n[1]);
        ctx.strokeStyle = "rgba(255,240,230,0.7)"; ctx.lineWidth = it.w * 0.45; ctx.stroke();
      }
    });
  }

  /* World hand points -> screen points; returns the nail offsets for fingers whose backs face us. */
  function toScreen(pts, frameM, cx, cy, u) {
    var P = pts.map(function (p) { return [cx + p[0] * u, cy - p[1] * u, p[2] * u]; });
    var back = mul(frameM[2], -1), nails = {};
    if (back[2] > 0.25) [4, 8, 12, 16, 20].forEach(function (i) { nails[i] = [back[0] * u * 0.05, -back[1] * u * 0.05]; });
    return { P: P, nails: nails };
  }

  function drawStatic(ctx, shape, ori, cx, cy, u, opt) {
    opt = opt || {};
    var fm = frame(ori || "F"), pts = orient(local(resolve(shape)), fm);
    if (opt.left) { pts = mirror(pts); fm = [mul(fm[0], -1), [-fm[1][0], fm[1][1], fm[1][2]], [-fm[2][0], fm[2][1], fm[2][2]]]; }
    var mid = mul(add(pts[0], pts[9]), 0.5), s = toScreen(pts.map(function (p) { return sub(p, [mid[0], mid[1] - 0.15, 0]); }), fm, cx, cy, u);
    drawHand(ctx, s.P, u, opt.tone, s.nails);
  }

  return {
    SHAPES: SHAPES, ORI: ORI, resolve: resolve, blend: blend, local: local, frame: frame, blendFrame: blendFrame,
    orient: orient, mirror: mirror, build: build, features: features, dist: dist, variants: variants,
    drawHand: drawHand, toScreen: toScreen, drawStatic: drawStatic, TONES: TONES,
    v: { add: add, sub: sub, mul: mul, dot: dot, cross: cross, len: len, norm: norm, mixV: mixV, mix: mix }
  };
})();
if (typeof module !== "undefined") module.exports = Hand;
