/* SENYAS braille: reads Grade 1 braille from a photo or a camera frame, and writes text as braille.
   Dots are found as small round spots darker (print) or lighter (embossed, lit) than their
   surroundings; they are then fitted to the braille grid: 3 rows per line, 2 columns per cell. */
var Braille = (function () {
  var L = { a: 1, b: 3, c: 9, d: 25, e: 17, f: 11, g: 27, h: 19, i: 10, j: 26 };
  var MAP = {}, REV = {};
  "abcdefghij".split("").forEach(function (c, i) {
    MAP[L[c]] = c; MAP[L[c] | 4] = "klmnopqrst"[i];
    if (i < 5) MAP[L[c] | 4 | 32] = "uvxyz"[i];
  });
  MAP[58] = "w"; MAP[59] = "ñ";
  var PUNCT = { 2: ",", 50: ".", 38: "?", 22: "!", 4: "'", 36: "-", 6: ";", 18: ":" };
  var WORDS = { 47: "and", 63: "for", 55: "of", 46: "the", 62: "with" };
  /* Switches for the ablation study. The benchmark showed that neither extra step improved accuracy,
     so both are off in the app (it is also faster). */
  var OPT = { smooth: false, support: false };
  var NUM = 60, CAP = 32, DIG = { 1: "1", 3: "2", 9: "3", 25: "4", 17: "5", 11: "6", 27: "7", 19: "8", 10: "9", 26: "0" };
  Object.keys(MAP).forEach(function (k) { REV[MAP[k]] = +k; });
  Object.keys(PUNCT).forEach(function (k) { REV[PUNCT[k]] = +k; });

  function cellChar(m) { return String.fromCharCode(0x2800 + m); }

  /* Text -> braille (Unicode cells), uncontracted. */
  function write(text) {
    var out = "", num = false;
    String(text).split("").forEach(function (ch) {
      var lo = ch.toLowerCase();
      if (/[0-9]/.test(ch)) { if (!num) { out += cellChar(NUM); num = true; } out += cellChar(+Object.keys(DIG).filter(function (k) { return DIG[k] === ch; })[0]); return; }
      if (ch === " " || ch === "\n") { num = false; out += ch === " " ? "⠀" : "\n"; return; }
      num = false;
      if (REV[lo] !== undefined) { if (lo !== ch) out += cellChar(CAP); out += cellChar(REV[lo]); }
    });
    return out;
  }

  /* Cells -> text. Each line is a list of masks (0 = empty cell). */
  function read(lines) {
    var good = 0, total = 0;
    var text = lines.map(function (cells) {
      var s = "", num = false, cap = false;
      cells.forEach(function (m, i) {
        if (!m) { s += " "; num = false; return; }
        total++;
        var alone = (i === 0 || !cells[i - 1]) && (i === cells.length - 1 || !cells[i + 1]);
        if (m === NUM) { num = true; good++; return; }
        if (m === CAP) { cap = true; good++; return; }
        if (num && DIG[m]) { s += DIG[m]; good++; return; }
        num = false;
        if (alone && WORDS[m]) { s += WORDS[m]; good++; return; }
        var c = MAP[m] || PUNCT[m];
        if (c) { s += cap ? c.toUpperCase() : c; good++; } else s += "·";
        cap = false;
      });
      return s.replace(/\s+/g, " ").trim();
    }).filter(Boolean).join("\n");
    return { text: text, conf: total ? good / total : 0, cells: total };
  }

  /* ---------- image -> dots ---------- */
  function blobs(gray, W, H, sign, thr, maxA) {
    var lab = new Int32Array(W * H), out = [], stack = [], id = 0;
    for (var p = 0; p < W * H; p++) {
      if (lab[p] || sign[p] < thr) continue;
      id++; stack.push(p); lab[p] = id;
      var n = 0, sx = 0, sy = 0, x0 = W, x1 = 0, y0 = H, y1 = 0, sw = 0;
      while (stack.length) {
        var q = stack.pop(), x = q % W, y = (q - x) / W, w = sign[q];
        n++; sx += x * w; sy += y * w; sw += w;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (n > maxA) continue;
        if (x > 0 && !lab[q - 1] && sign[q - 1] >= thr) { lab[q - 1] = id; stack.push(q - 1); }
        if (x < W - 1 && !lab[q + 1] && sign[q + 1] >= thr) { lab[q + 1] = id; stack.push(q + 1); }
        if (y > 0 && !lab[q - W] && sign[q - W] >= thr) { lab[q - W] = id; stack.push(q - W); }
        if (y < H - 1 && !lab[q + W] && sign[q + W] >= thr) { lab[q + W] = id; stack.push(q + W); }
      }
      var bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      if (n >= 4 && n <= maxA && bw / bh < 2.2 && bh / bw < 2.2 && n / (bw * bh) > 0.4) out.push({ x: sx / sw, y: sy / sw, a: n, r: Math.sqrt(n / Math.PI) });
    }
    return out;
  }
  function median(a) { if (!a.length) return 0; var b = a.slice().sort(function (x, y) { return x - y; }); return b[b.length >> 1]; }

  function findDots(img) {
    var W = img.width, H = img.height, d = img.data, g = new Float32Array(W * H), i, x, y;
    for (i = 0; i < W * H; i++) g[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    /* Two passes of a small box blur remove paper grain and sensor noise smaller than a dot. */
    var sr = Math.max(1, Math.round(Math.min(W, H) / 400));
    for (var pass = 0; pass < (OPT.smooth ? 2 : 0); pass++) {
      var tmp = new Float32Array(W * H);
      for (y = 0; y < H; y++) { var acc = 0, cnt = 0; for (x = -sr; x < W; x++) { if (x + sr < W) { acc += g[y * W + x + sr]; cnt++; } if (x - sr - 1 >= 0) { acc -= g[y * W + x - sr - 1]; cnt--; } if (x >= 0) tmp[y * W + x] = acc / cnt; } }
      for (x = 0; x < W; x++) { var ac = 0, cn = 0; for (y = -sr; y < H; y++) { if (y + sr < H) { ac += tmp[(y + sr) * W + x]; cn++; } if (y - sr - 1 >= 0) { ac -= tmp[(y - sr - 1) * W + x]; cn--; } if (y >= 0) g[y * W + x] = ac / cn; } }
    }
    var I = new Float64Array((W + 1) * (H + 1));
    for (y = 0; y < H; y++) { var rs = 0; for (x = 0; x < W; x++) { rs += g[y * W + x]; I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + rs; } }
    var R = Math.max(6, Math.round(Math.min(W, H) / 40)), dark = new Float32Array(W * H), light = new Float32Array(W * H), ss = 0;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var xa = Math.max(0, x - R), xb = Math.min(W, x + R + 1), ya = Math.max(0, y - R), yb = Math.min(H, y + R + 1);
      var m = (I[yb * (W + 1) + xb] - I[ya * (W + 1) + xb] - I[yb * (W + 1) + xa] + I[ya * (W + 1) + xa]) / ((xb - xa) * (yb - ya));
      var v = g[y * W + x] - m; dark[y * W + x] = -v; light[y * W + x] = v; ss += v * v;
    }
    var sd = Math.sqrt(ss / (W * H)), thr = Math.max(10, sd * 1.8), maxA = Math.pow(Math.min(W, H) / 12, 2);
    var best = null;
    [dark, light].forEach(function (s, k) {
      var b = blobs(g, W, H, s, thr, maxA).filter(function (o) { return o.a >= 8; });
      if (b.length < 3) return;
      /* The dot size is the most common blob size, weighted toward the larger ones (noise is small). */
      var ma = median(b.map(function (o) { return o.a; }).filter(function (a, _, all) { return a >= 0.5 * Math.max.apply(null, all.slice().sort(function (p, q) { return q - p; }).slice(0, Math.max(3, all.length >> 3))) * 0.4; }));
      b = b.filter(function (o) { return o.a > ma * 0.4 && o.a < ma * 2.6; });
      if (b.length < 3) return;
      var cv = 0; b.forEach(function (o) { cv += Math.pow(o.a / ma - 1, 2); }); cv = Math.sqrt(cv / b.length);
      /* Grid support: real dots have a neighbour about one dot-spacing away. */
      var r0 = Math.sqrt(ma / Math.PI), sup = 0;
      b.forEach(function (o) { for (var j = 0; j < b.length; j++) { var q = b[j]; if (q === o) continue; var dd = Math.hypot(q.x - o.x, q.y - o.y); if (dd > r0 * 2.2 && dd < r0 * 9) { sup++; break; } } });
      if (OPT.support) b = b.filter(function (o) { for (var j = 0; j < b.length; j++) { var q = b[j]; if (q === o) continue; var dd = Math.hypot(q.x - o.x, q.y - o.y); if (dd > r0 * 2.2 && dd < r0 * 12) return true; } return false; });
      var score = b.length * (sup / Math.max(1, b.length)) * (1 - Math.min(0.9, cv));
      if (!best || score > best.score) best = { dots: b, score: score, light: k === 1 };
    });
    return best ? best.dots : [];
  }

  /* ---------- dots -> cells ---------- */
  function cluster(vals, gap) {
    var s = vals.slice().sort(function (a, b) { return a - b; }), out = [], cur = [];
    s.forEach(function (v) { if (cur.length && v - cur[cur.length - 1] > gap) { out.push(cur); cur = []; } cur.push(v); });
    if (cur.length) out.push(cur);
    return out.map(function (c) { var m = 0; c.forEach(function (v) { m += v; }); return m / c.length; });
  }
  function grid(dots) {
    if (dots.length < 2) return null;
    var nn = dots.map(function (p) {
      var b = null;
      dots.forEach(function (q) { if (q === p) return; var dd = Math.hypot(q.x - p.x, q.y - p.y); if (!b || dd < b.d) b = { d: dd, q: q }; });
      return b;
    });
    var nd = nn.map(function (b) { return b.d; }).sort(function (a, b) { return a - b; }), lo = nd[Math.floor(nd.length * 0.25)];
    var dpitch = median(nd.filter(function (v) { return v <= lo * 1.2; }));
    var angs = [];
    nn.forEach(function (b, i) {
      if (b.d > dpitch * 1.3) return;
      var a = Math.atan2(b.q.y - dots[i].y, b.q.x - dots[i].x);
      while (a > Math.PI / 4) a -= Math.PI / 2; while (a <= -Math.PI / 4) a += Math.PI / 2; angs.push(a);
    });
    var ang = median(angs);
    var c = Math.cos(-ang), s = Math.sin(-ang);
    var pts = dots.map(function (p) { return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, o: p }; });
    var rows = cluster(pts.map(function (p) { return p.y; }), dpitch * 0.5);
    var lines = [], cur = null;
    rows.forEach(function (ry) {
      if (cur && ry - cur.y0 < dpitch * 2.5 && ry - cur.last < dpitch * 1.6) { cur.last = ry; cur.rows.push(ry); }
      else { cur = { y0: ry, last: ry, rows: [ry] }; lines.push(cur); }
    });
    var out = [], boxes = [];
    lines.forEach(function (ln) {
      var span = ln.last - ln.y0, top = span > dpitch * 1.5 ? ln.y0 : ln.y0;
      var lp = pts.filter(function (p) { return p.y > ln.y0 - dpitch * 0.5 && p.y < ln.last + dpitch * 0.5; });
      if (!lp.length) return;
      var cols = cluster(lp.map(function (p) { return p.x; }), dpitch * 0.45);
      var best = null;
      for (var P = 2.1 * dpitch; P <= 2.9 * dpitch; P += 0.05 * dpitch) {
        for (var off = 0; off < P; off += P / 24) {
          var err = 0;
          cols.forEach(function (cx) {
            var u = cx - cols[0] - off, k = Math.round(u / P), e0 = Math.abs(u - k * P), k1 = Math.round((u - dpitch) / P), e1 = Math.abs(u - dpitch - k1 * P);
            err += Math.min(e0, e1);
          });
          if (!best || err < best.err) best = { err: err, P: P, x0: cols[0] + off };
        }
      }
      var cells = {}, kmin = Infinity, kmax = -Infinity;
      lp.forEach(function (p) {
        var u = p.x - best.x0, k0 = Math.round(u / best.P), e0 = Math.abs(u - k0 * best.P), k1 = Math.round((u - dpitch) / best.P), e1 = Math.abs(u - dpitch - k1 * best.P);
        var k = e0 <= e1 ? k0 : k1, col = e0 <= e1 ? 0 : 1, row = Math.max(0, Math.min(2, Math.round((p.y - top) / dpitch)));
        cells[k] = (cells[k] || 0) | (1 << (col * 3 + row));
        kmin = Math.min(kmin, k); kmax = Math.max(kmax, k);
      });
      var masks = [];
      for (var k = kmin; k <= kmax; k++) {
        var m = cells[k] || 0;
        masks.push(m);
        if (m) {
          var cx = best.x0 + k * best.P, cy = top;
          boxes.push({ x: cx * c + cy * s - dpitch * 0.5, y: -cx * s + cy * c - dpitch * 0.5, w: dpitch * 2, h: dpitch * 3, ang: ang, m: m });
        }
      }
      out.push(masks);
    });
    return { lines: out, boxes: boxes, pitch: dpitch };
  }

  /* source: an image, video or canvas. Returns text, confidence, the dots and the cell boxes (in source pixels). */
  function scan(source, maxW) {
    var sw = source.videoWidth || source.naturalWidth || source.width, sh = source.videoHeight || source.naturalHeight || source.height;
    if (!sw || !sh) return null;
    var k = Math.min(1, (maxW || 900) / sw), W = Math.round(sw * k), H = Math.round(sh * k);
    var cv = scan.cv || (scan.cv = document.createElement("canvas")); cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d", { willReadFrequently: true }); ctx.drawImage(source, 0, 0, W, H);
    return scanData(ctx.getImageData(0, 0, W, H), 1 / k);
  }
  function scanData(img, back) {
    back = back || 1;
    var dots = findDots(img);
    var gr = grid(dots);
    if (!gr) return { text: "", conf: 0, cells: 0, dots: dots, boxes: [], braille: "" };
    var r = read(gr.lines);
    function up(o) { return Object.assign({}, o, { x: o.x * back, y: o.y * back, w: (o.w || 0) * back, h: (o.h || 0) * back, r: (o.r || 0) * back }); }
    r.dots = dots.map(up); r.boxes = gr.boxes.map(up);
    r.braille = gr.lines.map(function (l) { return l.map(function (m) { return cellChar(m); }).join(""); }).join("\n");
    return r;
  }

  return { opts: OPT, grid: grid, write: write, read: read, scan: scan, scanData: scanData, findDots: findDots, cellChar: cellChar, MAP: MAP, REV: REV };
})();
if (typeof module !== "undefined") module.exports = Braille;
