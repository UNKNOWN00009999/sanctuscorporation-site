/* Sanctus Corporation — v2. 외부 요청 없음, 방문자 정보를 모으지 않음. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;

  /* 등장 */
  requestAnimationFrame(function () { setTimeout(function () { body.classList.add("ready"); }, 60); });
  var rv = [].slice.call(document.querySelectorAll(".rv"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); decode(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* 영문 라벨이 풀리듯 나타나는 효과 */
  var GL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+-";
  function decode(root) {
    if (reduce) return;
    var els = root.matches && root.matches("[data-decode]") ? [root] : [].slice.call(root.querySelectorAll("[data-decode]"));
    els.forEach(function (el) {
      if (el._done) return; el._done = 1;
      var fin = el.textContent, t0 = performance.now(), dur = 700 + fin.length * 18;
      el.setAttribute("aria-label", fin);
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), keep = Math.floor(p * fin.length), out = fin.slice(0, keep);
        for (var i = keep; i < fin.length; i++) out += /[\s·—.:]/.test(fin[i]) ? fin[i] : GL[(Math.random() * GL.length) | 0];
        el.textContent = out;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = fin;
      })(t0);
    });
  }
  setTimeout(function () { decode(document.querySelector(".hero") || body); }, 500);

  /* 위쪽 띠, 아래 계기 줄 */
  var top = document.querySelector(".top");
  function onScroll() { if (top) top.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var clock = document.getElementById("kst");
  if (clock) {
    var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    var tk = function () { clock.textContent = fmt.format(new Date()); }; tk(); setInterval(tk, 1000);
  }
  var where = document.getElementById("where");
  if (where && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) where.textContent = e.target.getAttribute("data-hud"); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    [].forEach.call(document.querySelectorAll("[data-hud]"), function (s) { so.observe(s); });
  }

  /* 포인터를 따라오는 옅은 조명 */
  var spot = document.querySelector(".spot");
  if (spot && !reduce && window.matchMedia("(pointer:fine)").matches) {
    var sx = 0, sy = 0, sq = false;
    window.addEventListener("pointermove", function (e) {
      sx = e.clientX; sy = e.clientY;
      if (!sq) { sq = true; requestAnimationFrame(function () { spot.style.setProperty("--mx", sx + "px"); spot.style.setProperty("--my", sy + "px"); sq = false; }); }
    }, { passive: true });
  }

  /* 수수료 계산 예시 — 실제 사례의 수수료율(2.8% → 0.8%)을 고른 월 결제액에 그대로 곱한다. 단위는 만 원 */
  var calc = document.getElementById("calc");
  if (calc) {
    var won = function (n) { return String(n).replace(/\B(?=(\d{3})+$)/g, ",") + "만 원"; };
    var cb = [].slice.call(calc.querySelectorAll("button[data-v]"));
    var cWas = document.getElementById("c-was"), cNow = document.getElementById("c-now"), cYear = document.getElementById("c-year");
    var pick = function (v) {
      cb.forEach(function (b) { b.setAttribute("aria-pressed", String(+b.getAttribute("data-v") === v)); });
      cWas.textContent = "월 " + won(v * 28 / 1000);
      cNow.textContent = "월 " + won(v * 8 / 1000);
      cYear.textContent = won(v * 20 / 1000 * 12);
    };
    cb.forEach(function (b) { b.addEventListener("click", function () { pick(+b.getAttribute("data-v")); }); });
  }

  /* 성장 가치 구역의 점묘 바탕 — 8×8 순서 디더로 호박색 점을 찍는다 (한 번 그리고 크기가 바뀔 때만 다시) */
  var dz = document.getElementById("dither");
  if (dz && dz.getContext) {
    var BAYER = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
      3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
    var dW = 0, dH = 0;
    var blob = function (x, y, bx, by, r) { var dx = x - bx, dy = y - by, q = (dx * dx + dy * dy) / (r * r); return q >= 1 ? 0 : (1 - q) * (1 - q); };
    var ramp = function (v, a, b) { var t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    var drawDither = function () {
      var r = dz.getBoundingClientRect(), cell = r.width < 760 ? 3 : 4, w = Math.ceil(r.width / cell), h = Math.ceil(r.height / cell);
      if (!w || !h || (w === dW && h === dH)) return;
      dW = w; dH = h; dz.width = w; dz.height = h;
      /* 글이 있는 위·아래는 비우고, 창이 놓인 가운데와 오른쪽 위에만 점을 찍는다 */
      var wn = dz.parentNode.querySelector(".wins"), top0 = r.height * 0.3, bot0 = r.height * 0.75, wide = r.width >= 980;
      if (wn) { var wr = wn.getBoundingClientRect(); top0 = wr.top - r.top; bot0 = wr.bottom - r.top; }
      var g = dz.getContext("2d"), im = g.createImageData(w, h), d = im.data, asp = w / h;
      for (var y = 0; y < h; y++) {
        var py = y * cell, v = y / h, zin = ramp(py, top0 - 46, top0 + 60), zout = 1 - 0.96 * ramp(py, bot0 + 6, bot0 + 110);
        for (var x = 0; x < w; x++) {
          var u = x / w * asp, side = wide ? 0.8 * ramp(x / w, 0.6, 0.86) : 0;
          var f = 0.26 + 0.5 * blob(u, v, 0.86 * asp, 0.42, 0.5) + 0.42 * blob(u, v, 0.1 * asp, 0.62, 0.42) + 0.3 * blob(u, v, 0.48 * asp, 0.9, 0.5);
          if (Math.min(0.9, f) * Math.max(zin, side) * zout * 64 > BAYER[(y & 7) * 8 + (x & 7)] + 0.5) {
            var o = (y * w + x) * 4; d[o] = 224; d[o + 1] = 169; d[o + 2] = 99; d[o + 3] = 150;
          }
        }
      }
      g.putImageData(im, 0, 0);
    };
    drawDither();
    window.addEventListener("load", drawDither);
    if ("ResizeObserver" in window) new ResizeObserver(drawDither).observe(dz);
    else window.addEventListener("resize", drawDither);
  }

  /* 첫 화면의 점 구체 — 접수 한 건이 여러 결제사로 이어지는 모습을 그린 장식 */
  var cv = document.getElementById("core");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var NODES = ["KCP", "KPN", "KIS", "KOVAN", "NICE", "웰컴", "KSNET"];
  var W = 0, H = 0, R = 0, cx = 0, cy = 0, K = 1.62, mobile = false, pts = [], inner = [], dust = [], pulses = [], flash = [];
  var px = 0, py = 0, tx = 0, ty = 0, running = true, last = 0, nextPulse = 900;
  /* 캔버스에 data-cy(세로 자리)·data-scale(크기)·data-tone="amber"(한 가지 색)·data-font 를 주면 따른다 */
  var DS = cv.dataset || {}, CY = parseFloat(DS.cy) || 0.5, SC = parseFloat(DS.scale) || 1, AMB = DS.tone === "amber";
  var MONO = DS.font || '11px ui-monospace,"SF Mono","Cascadia Mono",Consolas,"Roboto Mono",Menlo,monospace';
  var C_RING = AMB ? "224,170,96" : "190,205,235", C_COOL = AMB ? "206,146,70" : "150,176,226", C_WARM = AMB ? "255,214,150" : "236,222,196",
      C_DUST = AMB ? "214,160,90" : "170,190,230", C_TXT = AMB ? "255,220,165" : "232,236,244";

  function size() {
    var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    mobile = W < 980;
    var vh = Math.min(H, window.innerHeight);
    K = mobile ? 1.5 : 1.62;
    R = (mobile ? Math.min(W * 0.235, vh * 0.15, 170) : Math.min(vh * 0.235, W * 0.135, 240)) * SC;
    cx = mobile ? W * 0.5 : W - Math.max(72, Math.min(W * 0.05, (W - 1240) / 2 + 72)) - K * R - 24;
    cy = mobile ? vh * 0.28 : vh * CY;
    var n = mobile ? 950 : 2100; pts = []; inner = [];
    for (var m = 0; m < (mobile ? 150 : 280); m++) {
      var y2 = 1 - 2 * (m + 0.5) / (mobile ? 150 : 280), r2 = Math.sqrt(1 - y2 * y2), a2 = m * 2.399963229728653;
      inner.push([Math.cos(a2) * r2 * 0.4, y2 * 0.4, Math.sin(a2) * r2 * 0.4, Math.random()]);
    }
    for (var i = 0; i < n; i++) {
      var y = 1 - 2 * (i + 0.5) / n, rr = Math.sqrt(1 - y * y), a = i * 2.399963229728653;
      pts.push([Math.cos(a) * rr, y, Math.sin(a) * rr, Math.random()]);
    }
    dust = [];
    for (var k = 0; k < (mobile ? 26 : 60); k++) dust.push([Math.random() * W, Math.random() * H, 0.3 + Math.random() * 1.1, Math.random() * 6.28]);
    flash = NODES.map(function () { return 0; });
  }
  function rot(p, ay, ax) {
    var x = p[0], y = p[1], z = p[2], c = Math.cos(ay), s = Math.sin(ay);
    var x1 = x * c + z * s, z1 = -x * s + z * c; c = Math.cos(ax); s = Math.sin(ax);
    return [x1, y * c - z1 * s, y * s + z1 * c];
  }
  function proj(v) { var p = 5 / (5 - v[2]); return [cx + v[0] * R * p, cy + v[1] * R * p, p]; }
  function nodePos(i, t) {
    var a = i / NODES.length * 6.2832 + t * 0.00007, k = K;
    return rot([Math.cos(a) * k, Math.sin(a * 2 + 1) * 0.1, Math.sin(a) * k], 0, 0.42 + py * 0.12);
  }
  function ring(t, k, tilt, spin, alpha, front) {
    ctx.beginPath(); var on = false;
    for (var i = 0; i <= 140; i++) {
      var a = i / 140 * 6.2832 + spin, v = rot([Math.cos(a) * k, 0, Math.sin(a) * k], 0, tilt), q = proj(v);
      if ((v[2] >= 0) === front) { if (on) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); on = true; } } else on = false;
    }
    ctx.strokeStyle = "rgba(" + C_RING + "," + (front ? alpha : alpha * 0.45) + ")"; ctx.lineWidth = 1; ctx.stroke();
  }
  function drawNodes(t, front) {
    ctx.font = MONO; ctx.textBaseline = "middle";
    for (var i = 0; i < NODES.length; i++) {
      var v = nodePos(i, t); if ((v[2] >= 0) !== front) continue;
      var q = proj(v), len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      var s = proj([v[0] / len * 1.04, v[1] / len * 1.04, v[2] / len * 1.04]);
      var dep = front ? 1 : 0.42, f = flash[i];
      var g = ctx.createLinearGradient(s[0], s[1], q[0], q[1]);
      g.addColorStop(0, "rgba(224,169,99,0)"); g.addColorStop(1, "rgba(224,169,99," + (0.3 * dep + f * 0.5) + ")");
      ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      var z = 3.2 + f * 2.5;
      ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(0.7854);
      ctx.fillStyle = "rgba(4,6,11,.9)"; ctx.fillRect(-z, -z, z * 2, z * 2);
      ctx.strokeStyle = "rgba(255,201,122," + (0.55 * dep + f * 0.45) + ")"; ctx.strokeRect(-z, -z, z * 2, z * 2);
      if (f > 0.02) { ctx.fillStyle = "rgba(255,201,122," + f + ")"; ctx.fillRect(-1.6, -1.6, 3.2, 3.2); }
      ctx.restore();
      ctx.fillStyle = "rgba(" + C_TXT + "," + (0.74 * dep + f * 0.26) + ")";
      if (mobile) { ctx.textAlign = "center"; ctx.fillText(NODES[i], q[0], q[1] + 15); }
      else if (q[0] >= cx) { ctx.textAlign = "left"; ctx.fillText(NODES[i], q[0] + 13, q[1]); }
      else { ctx.textAlign = "left"; ctx.fillText(NODES[i], q[0] + 9, q[1] - 14); }
    }
  }
  function frame(now) {
    if (!running) return;
    var dt = Math.min(50, now - (last || now)); last = now;
    var t = now; px += (tx - px) * 0.04; py += (ty - py) * 0.04;
    ctx.clearRect(0, 0, W, H);
    var gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.5);
    gl.addColorStop(0, "rgba(224,169,99,.2)"); gl.addColorStop(0.22, "rgba(224,169,99,.09)"); gl.addColorStop(0.5, AMB ? "rgba(190,120,40,.06)" : "rgba(90,120,190,.07)"); gl.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    for (var k = 0; k < dust.length; k++) {
      var d = dust[k]; d[0] += Math.cos(d[3]) * 0.012 * dt; d[1] += Math.sin(d[3]) * 0.008 * dt - 0.004 * dt;
      if (d[0] < 0) d[0] += W; if (d[0] > W) d[0] -= W; if (d[1] < 0) d[1] += H; if (d[1] > H) d[1] -= H;
      ctx.fillStyle = "rgba(" + C_DUST + "," + (0.1 + 0.12 * Math.sin(t * 0.0006 + d[3] * 9)) + ")"; ctx.fillRect(d[0], d[1], d[2], d[2]);
    }
    var ay = t * 0.00013 + px * 0.5, ax = 0.3 + py * 0.22;
    ring(t, 1.28, 1.1, t * 0.00021, 0.16, false); ring(t, K, 0.42 + py * 0.12, 0, 0.15, false);
    drawNodes(t, false);
    var beat = 0.5 + 0.5 * Math.sin(t * 0.0016);
    for (var w = 0; w < inner.length; w++) {
      var ip = inner[w], iv = rot(ip, -t * 0.00034, 0.5 - py * 0.2), iq = proj(iv), idp = (iv[2] / 0.4 + 1) / 2;
      ctx.fillStyle = "rgba(255,210,140," + ((0.25 + 0.6 * idp) * (0.7 + 0.3 * beat)) + ")";
      var isz = (0.9 + idp * 1.1) * iq[2]; ctx.fillRect(iq[0] - isz / 2, iq[1] - isz / 2, isz, isz);
    }
    var scan = ((t * 0.00021) % 2.6) - 1.3;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], br = 1 + 0.03 * Math.sin(p[1] * 5 + t * 0.0011 + p[3] * 6.28);
      var v = rot([p[0] * br, p[1] * br, p[2] * br], ay, ax), q = proj(v), depth = (v[2] + 1) / 2;
      var band = Math.exp(-(p[1] - scan) * (p[1] - scan) * 70), tw = 0.75 + 0.25 * Math.sin(t * 0.002 + p[3] * 40);
      var al = (0.14 + 0.74 * depth * depth) * tw + band * 0.75, sz = (0.7 + depth * 1.0) * q[2] + band * 0.9;
      if (band > 0.25) ctx.fillStyle = "rgba(255,206,132," + Math.min(1, al) + ")";
      else if (depth > 0.55) ctx.fillStyle = "rgba(" + C_WARM + "," + al + ")";
      else ctx.fillStyle = "rgba(" + C_COOL + "," + al + ")";
      ctx.fillRect(q[0] - sz / 2, q[1] - sz / 2, sz, sz);
    }
    ring(t, 1.28, 1.1, t * 0.00021, 0.16, true); ring(t, K, 0.42 + py * 0.12, 0, 0.15, true);
    /* 접수 신호 */
    nextPulse -= dt;
    if (nextPulse <= 0 && !reduce) { pulses.push({ i: (Math.random() * NODES.length) | 0, p: 0 }); nextPulse = 650 + Math.random() * 1300; }
    for (var j = pulses.length - 1; j >= 0; j--) {
      var u = pulses[j]; u.p += dt / 1500;
      var nv = nodePos(u.i, t), ln = Math.sqrt(nv[0] * nv[0] + nv[1] * nv[1] + nv[2] * nv[2]);
      var e = u.p * u.p * (3 - 2 * u.p), f0 = 1.04 / ln, m = f0 + (1 - f0) * e, m2 = f0 + (1 - f0) * Math.max(0, e - 0.16);
      var a1 = proj([nv[0] * m, nv[1] * m, nv[2] * m]), a0 = proj([nv[0] * m2, nv[1] * m2, nv[2] * m2]);
      var tg = ctx.createLinearGradient(a0[0], a0[1], a1[0], a1[1]);
      tg.addColorStop(0, "rgba(255,201,122,0)"); tg.addColorStop(1, "rgba(255,201,122,.95)");
      ctx.strokeStyle = tg; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke();
      ctx.fillStyle = "rgba(255,226,180,.95)"; ctx.beginPath(); ctx.arc(a1[0], a1[1], 1.9, 0, 6.2832); ctx.fill();
      if (u.p >= 1) { flash[u.i] = 1; pulses.splice(j, 1); }
    }
    for (var n = 0; n < flash.length; n++) flash[n] *= Math.pow(0.9975, dt);
    drawNodes(t, true);
    /* 구체를 감싸는 눈금 */
    ctx.strokeStyle = "rgba(" + C_TXT + ",.22)"; ctx.lineWidth = 1;
    var b = R * (mobile ? 1.36 : 1.42), c0 = 11;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
      var x = cx + s[0] * b, y = cy + s[1] * b * 0.9; ctx.beginPath(); ctx.moveTo(x - s[0] * c0, y); ctx.lineTo(x, y); ctx.lineTo(x, y - s[1] * c0); ctx.stroke();
    });
    if (!reduce) requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } }
  size(); requestAnimationFrame(frame);
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { size(); if (reduce) requestAnimationFrame(frame); }, 120); });
  window.addEventListener("pointermove", function (e) { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting && !document.hidden) start(); else running = false; }).observe(cv);
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) running = false; else start(); });
})();
