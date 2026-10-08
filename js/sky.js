/*
 * Un giorno intero, dall'alba alla notte, guidato dallo scroll.
 * Alla fine le stelle si possono unire in una costellazione,
 * che resta salvata nel browser di chi la disegna.
 */
(() => {
  "use strict";

  const body = document.body;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STORAGE_KEY = "ca-constellation-v1";

  /* ---------- Utility ---------- */

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => {
    const t = clamp((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (c1, c2, t) => c1.map((v, i) => v + (c2[i] - v) * t);
  const rgb = (c) => `rgb(${c.map(Math.round).join(" ")})`;
  const channels = (c) => c.map(Math.round).join(" ");

  // PRNG con seme fisso: le stelle sono sempre le stesse, a ogni visita
  const rng = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ---------- Palette del giorno: [posizione, cielo alto, medio, basso, ombra montagne] ---------- */

  const SKY = [
    [0.0, "#070a1c", "#141a3a", "#2a2550", "#0b0e24"],
    [0.12, "#1d2350", "#5b4a7a", "#e8927c", "#1a1b3c"],
    [0.22, "#3a5a9c", "#9fb3d6", "#f7c59f", "#2b3358"],
    [0.38, "#2f7bd0", "#7fb6e6", "#d7ecf7", "#28406a"],
    [0.5, "#3577c4", "#8bbbe3", "#e6eef0", "#2a3f66"],
    [0.6, "#4a5f9e", "#c79a8a", "#f6c27a", "#3a2f4f"],
    [0.7, "#2a2452", "#a04a6a", "#f2774f", "#241a36"],
    [0.78, "#10133a", "#3a2a5e", "#7a3f5e", "#0e0c22"],
    [0.88, "#04061a", "#0b1030", "#1a1a3c", "#070916"],
    [1.0, "#02030d", "#070b22", "#121633", "#04050d"],
  ].map(([p, ...c]) => [p, c.map(hex)]);

  function skyAt(p) {
    let i = 0;
    while (i < SKY.length - 2 && p > SKY[i + 1][0]) i++;
    const [p0, a] = SKY[i];
    const [p1, b] = SKY[i + 1];
    const t = smooth(p0, p1, p);
    return a.map((c, k) => mix(c, b[k], t));
  }

  /* ---------- Montagne ---------- */

  const ridges = [
    { el: document.querySelector(".ridge-far path"), seed: 11, base: 170, amp: 110, rough: 1, depth: 0.45 },
    { el: document.querySelector(".ridge-mid path"), seed: 23, base: 190, amp: 80, rough: 1.4, depth: 0.68 },
    { el: document.querySelector(".ridge-near path"), seed: 37, base: 210, amp: 55, rough: 1.8, depth: 0.88 },
  ];

  function ridgePath({ seed, base, amp, rough }) {
    const r = rng(seed);
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
    const pts = [];
    for (let x = 0; x <= 1200; x += 24) {
      const n =
        Math.sin(x * 0.0042 + ph[0]) * 0.55 +
        Math.sin(x * 0.011 + ph[1]) * 0.3 +
        Math.sin(x * 0.029 + ph[2]) * 0.12 * rough +
        (r() - 0.5) * 0.07 * rough;
      pts.push([x, base - n * amp]);
    }
    let d = `M0,600 L0,${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2;
      const yc = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q${pts[i][0]},${pts[i][1].toFixed(1)} ${xc},${yc.toFixed(1)}`;
    }
    return d + ` L1200,${pts[pts.length - 1][1].toFixed(1)} L1200,600 Z`;
  }

  ridges.forEach((r) => r.el && r.el.setAttribute("d", ridgePath(r)));

  /* ---------- Testi che emergono parola per parola ---------- */

  function splitWords(el) {
    let i = 0;
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) return frag.append(t);
          const s = document.createElement("span");
          s.className = "w";
          s.style.setProperty("--i", i++);
          s.textContent = t;
          frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === Node.ELEMENT_NODE && n.nodeName !== "BR") {
        n.classList.add("w");
        n.style.setProperty("--i", i++);
      }
    });
  }

  document.querySelectorAll(".reveal").forEach(splitWords);

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
    { rootMargin: "-12% 0px -12% 0px", threshold: 0.6 }
  );
  document.querySelectorAll(".reveal, .rise").forEach((el) => io.observe(el));

  // Il nome si compone lettera per lettera
  const name = document.querySelector(".name");
  if (name) {
    name.setAttribute("aria-label", name.textContent.replace(/\s+/g, " ").trim());
    let i = 0;
    name.querySelectorAll(":scope > span").forEach((part) => {
      const text = part.textContent;
      part.textContent = "";
      part.setAttribute("aria-hidden", "true");
      [...text].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.style.setProperty("--i", i++);
        s.textContent = ch;
        part.append(s);
      });
    });
  }

  /* ---------- Stelle ---------- */

  const canvas = document.querySelector(".stars");
  const ctx = canvas.getContext("2d");
  let W = 0;
  let H = 0;
  let dpr = 1;

  const R = rng(7);
  const TINTS = [hex("#ffdcbe"), hex("#c8d7ff"), hex("#ffffff")];
  const stars = Array.from({ length: 260 }, () => {
    const big = R() < 0.08;
    const tint = R();
    return {
      x: R(),
      y: Math.pow(R(), 1.25) * 0.6,
      r: big ? 1.1 + R() * 1.1 : 0.35 + R() * 0.8,
      a: 0.35 + R() * 0.65,
      tw: 0.4 + R() * 2.2,
      ph: R() * Math.PI * 2,
      c: TINTS[tint < 0.15 ? 0 : tint < 0.35 ? 1 : 2],
      big,
    };
  });

  // Sprite di bagliore, disegnato una volta sola
  const glow = document.createElement("canvas");
  glow.width = glow.height = 64;
  {
    const g = glow.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.25)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }

  function resize() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    // La barra del browser su mobile genera resize senza cambiare il cielo
    if (canvas.clientWidth === W && canvas.clientHeight === H && d === dpr) return;
    dpr = d;
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    SW = sea.clientWidth;
    SH = sea.clientHeight;
    sea.width = Math.round(SW * dpr);
    sea.height = Math.round(SH * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    moonSize = moonEl.clientWidth;
    cacheWindows();
  }

  /* ---------- Mare e paesino ---------- */

  const sea = document.querySelector(".sea");
  const sctx = sea.getContext("2d");
  const moonEl = document.querySelector(".moon");
  const houses = document.querySelector(".village .houses");
  const winEls = [...document.querySelectorAll(".village .win")];
  let SW = 0;
  let SH = 0;
  let moonSize = 0;
  let scene = null;
  let wins = [];

  // Posizione delle finestre sullo schermo, per farle riflettere nel mare
  function cacheWindows() {
    wins = winEls.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, w: Math.max(2, r.width), t: parseFloat(el.style.getPropertyValue("--t")) };
    });
  }

  const lightOn = (t, lights) => clamp((lights - t) * 12);

  /* ---------- Costellazione ---------- */

  let edges = [];
  let selected = -1;
  let hovered = -1;

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved)) {
      edges = saved
        .filter((e) => Array.isArray(e) && stars[e[0]] && stars[e[1]])
        .map(([a, b]) => ({ a, b, born: -1e9 }));
    }
  } catch (_) {
    /* storage non disponibile: la costellazione vive solo in questa visita */
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(edges.map((e) => [e.a, e.b])));
    } catch (_) {
      /* ignora */
    }
  }

  const whisper = document.querySelector(".whisper");
  const clearBtn = document.querySelector(".clear");

  function updateCopy() {
    if (!whisper) return;
    const n = edges.length;
    whisper.textContent =
      n === 0 ? whisper.dataset.default : n < 3 ? "Continua, il cielo è grande." : "Ecco il tuo segno.";
    clearBtn.hidden = n === 0;
  }

  const starPos = (s) => [s.x * W, s.y * H];

  function nearestStar(x, y, radius) {
    let best = -1;
    let bestD = radius * radius;
    stars.forEach((s, i) => {
      const [sx, sy] = starPos(s);
      const d = (sx - x) ** 2 + (sy - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }

  /* ---------- Stato ---------- */

  let target = 0;
  let p = -1;
  let starAlpha = 1;
  let interactive = false;
  const pointer = { x: -1e4, y: -1e4, tx: 0, mx: 0 };
  const shooting = [];
  let nextShoot = performance.now() + 3000;
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function readScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    target = max > 0 ? clamp(scrollY / max) : 0;
  }

  function paintSky(p) {
    const [top, mid, bottom, shade] = skyAt(p);
    const st = body.style;
    st.setProperty("--p", p.toFixed(4));
    st.setProperty("--sky-top", rgb(top));
    st.setProperty("--sky-mid", rgb(mid));
    st.setProperty("--sky-bottom", rgb(bottom));

    ridges.forEach((r) => r.el && (r.el.style.fill = rgb(mix(bottom, shade, r.depth))));
    if (houses) houses.style.fill = rgb(mix(bottom, shade, 0.97));

    // Sole: sorge dietro le colline a sinistra, tramonta nella valle al centro
    const t = (p - 0.09) / (0.76 - 0.09);
    const elev = Math.sin(Math.PI * clamp(t));
    const seaLine = H - SH;
    const horizon = seaLine + 0.07 * H;
    const sx = lerp(0.12, 0.6, clamp(t)) * W;
    const sy = horizon - elev * (horizon - 0.15 * H);
    const visible = t > -0.02 && t < 1.02 ? 1 : 0;
    st.setProperty("--sx", `${sx.toFixed(1)}px`);
    st.setProperty("--sy", `${sy.toFixed(1)}px`);
    st.setProperty("--sun", visible);
    const sunRGB = channels(mix(hex("#ff7a45"), hex("#fff4d6"), smooth(0, 0.65, elev)));
    st.setProperty("--sun-rgb", sunRGB);
    st.setProperty("--glow", (visible * lerp(1, 0.4, elev)).toFixed(3));

    // Luna
    const q = smooth(0.74, 0.97, p);
    const moonA = smooth(0.74, 0.84, p);
    const moonX = lerp(0.88, 0.76, q) * W;
    const moonY = (W < 640 ? lerp(0.41, 0.36, q) : lerp(0.6, 0.16, q)) * H;
    st.setProperty("--moon", moonA.toFixed(3));
    st.setProperty("--moon-x", `${moonX.toFixed(1)}px`);
    st.setProperty("--moon-y", `${moonY.toFixed(1)}px`);

    // Luci del paesino: qualcuna all'alba, tutte la sera, metà a notte fonda
    const lights = Math.max(0.45 * (1 - smooth(0.06, 0.15, p)), smooth(0.58, 0.72, p) - 0.55 * smooth(0.93, 1, p));
    st.setProperty("--lights", lights.toFixed(3));

    scene = {
      top, mid, bottom, sx, sunRGB, elev,
      sun: visible * smooth(0, 0.06 * H, seaLine - sy) * lerp(0.95, 0.55, elev),
      glow: visible * smooth(-0.04 * H, 0.08 * H, seaLine - sy) * lerp(1, 0.35, elev),
      moonX: moonX + moonSize / 2, moonA, lights,
    };

    // Testo scuro quando il cielo è chiaro
    const day = smooth(0.2, 0.3, p) * (1 - smooth(0.58, 0.66, p));
    st.setProperty("--ink-rgb", channels(mix(hex("#f3efe6"), hex("#14203a"), day)));
    st.setProperty("--shade", lerp(0.35, 0, day).toFixed(3));
    st.setProperty("--hint", (1 - smooth(0, 0.04, p)).toFixed(3));

    if (themeMeta) themeMeta.content = rgb(top);

    starAlpha = Math.max(1 - smooth(0.06, 0.17, p), smooth(0.74, 0.9, p));
    interactive = p > 0.86;
  }

  function drawStars(now) {
    ctx.clearRect(0, 0, W, H);
    if (starAlpha <= 0.01) return;

    const time = now / 1000;
    const near = interactive ? 140 : 0;

    stars.forEach((s, i) => {
      const [x, y] = starPos(s);
      let a = s.a * (reduceMotion ? 1 : 0.7 + 0.3 * Math.sin(time * s.tw + s.ph));
      if (near) {
        const d = Math.hypot(x - pointer.x, y - pointer.y);
        if (d < near) a = Math.min(1, a + (1 - d / near) * 0.6);
      }
      a *= starAlpha;

      if (s.big || i === hovered || i === selected) {
        const g = s.r * (i === selected ? 16 : 10);
        ctx.globalAlpha = a * 0.5;
        ctx.drawImage(glow, x - g / 2, y - g / 2, g, g);
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = rgb(s.c);
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Linee della costellazione, che si disegnano piano
    ctx.lineCap = "round";
    edges.forEach((e) => {
      const [ax, ay] = starPos(stars[e.a]);
      const [bx, by] = starPos(stars[e.b]);
      const k = reduceMotion ? 1 : smooth(0, 1, (now - e.born) / 700);
      const ex = lerp(ax, bx, k);
      const ey = lerp(ay, by, k);
      ctx.strokeStyle = "rgb(246 214 170)";
      ctx.globalAlpha = 0.12 * starAlpha;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.globalAlpha = 0.7 * starAlpha;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Anelli su stella sotto il cursore e stella selezionata
    const ring = (i, radius, alpha) => {
      const [x, y] = starPos(stars[i]);
      ctx.globalAlpha = alpha * starAlpha;
      ctx.strokeStyle = "rgb(246 214 170)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    };
    if (interactive && hovered >= 0 && hovered !== selected) ring(hovered, 9, 0.5);
    if (selected >= 0) ring(selected, 11 + (reduceMotion ? 0 : Math.sin(time * 3) * 2), 0.8);

    // Stelle cadenti
    if (!reduceMotion && starAlpha > 0.7 && now > nextShoot) {
      const angle = (0.15 + Math.random() * 0.25) * Math.PI;
      const speed = 0.9 + Math.random() * 0.6;
      shooting.push({
        x: Math.random() * W * 0.8 + W * 0.1,
        y: Math.random() * H * 0.25,
        vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1),
        vy: Math.sin(angle) * speed,
        born: now,
      });
      nextShoot = now + 4000 + Math.random() * 7000;
    }
    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i];
      const age = now - s.born;
      if (age > 900) {
        shooting.splice(i, 1);
        continue;
      }
      const hx = s.x + s.vx * age;
      const hy = s.y + s.vy * age;
      const tail = 120;
      const grad = ctx.createLinearGradient(hx, hy, hx - s.vx * tail, hy - s.vy * tail);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = starAlpha * Math.sin((age / 900) * Math.PI);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - s.vx * tail, hy - s.vy * tail);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  // Una colonna di riflessi tremolanti sotto il sole o la luna
  function glitter(x, color, alpha, spread, time) {
    // Prima una colonna di luce morbida, poi i riflessi sulle onde
    const col = sctx.createLinearGradient(0, 0, 0, SH);
    col.addColorStop(0, color.replace(")", " / 0.5)"));
    col.addColorStop(1, color.replace(")", " / 0)"));
    sctx.globalAlpha = alpha * 0.45;
    sctx.fillStyle = col;
    sctx.beginPath();
    sctx.moveTo(x - spread * 0.15, 0);
    sctx.lineTo(x + spread * 0.15, 0);
    sctx.lineTo(x + spread * 0.7, SH);
    sctx.lineTo(x - spread * 0.7, SH);
    sctx.fill();

    sctx.fillStyle = color;
    for (let y = 1; y < SH; y += 3) {
      const t = y / SH;
      for (let k = 0; k < 2; k++) {
        const n = Math.sin(y * 0.71 + time * 1.6 + k * 2.3) * Math.cos(y * 0.23 - time * 0.9 + k * 1.1);
        const len = (2 + 22 * t) * (0.4 + 0.6 * Math.abs(Math.sin(y * 1.9 + time * 2.6 + k)));
        sctx.globalAlpha = alpha * 0.85 * (1 - t * 0.55) * (0.25 + 0.75 * Math.abs(n));
        sctx.fillRect(x + n * spread * (0.25 + t) - len / 2, y, len, 0.8 + t);
      }
    }
  }

  function drawSea(now) {
    if (!scene || !SH) return;
    const time = reduceMotion ? 0 : now / 1000;
    const { top, mid, bottom } = scene;

    // L'acqua riflette il cielo: chiara all'orizzonte, più scura verso di noi
    sctx.globalAlpha = 1;
    const g = sctx.createLinearGradient(0, 0, 0, SH);
    g.addColorStop(0, rgb(mix(mix(bottom, mid, 0.35), [0, 0, 0], 0.12)));
    g.addColorStop(1, rgb(mix(top, [0, 0, 0], 0.35)));
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, SW, SH);

    // Bagliore del sole basso sull'acqua
    if (scene.glow > 0.01) {
      const rg = sctx.createRadialGradient(scene.sx, 0, 0, scene.sx, 0, SW * 0.4);
      rg.addColorStop(0, `rgb(${scene.sunRGB} / ${(0.4 * scene.glow).toFixed(3)})`);
      rg.addColorStop(1, `rgb(${scene.sunRGB} / 0)`);
      sctx.fillStyle = rg;
      sctx.fillRect(0, 0, SW, SH);
    }

    // Linea dell'orizzonte
    sctx.globalAlpha = 0.3;
    sctx.fillStyle = rgb(mix(bottom, [255, 255, 255], 0.4));
    sctx.fillRect(0, 0, SW, 1);

    // Onde: tratti sottili, più fitti e corti verso l'orizzonte
    sctx.fillStyle = rgb(mix(mid, [255, 255, 255], 0.3));
    for (let i = 1; i <= 16; i++) {
      const t = i / 16;
      const y = SH * t ** 1.7;
      const step = 60 * (0.6 + t);
      for (let x = ((time * 10 * (0.5 + t)) % step) - step; x < SW; x += step) {
        const a = 0.5 + 0.5 * Math.sin(x * 0.05 + i * 1.7 + time * 0.8);
        if (a < 0.55) continue;
        sctx.globalAlpha = (a - 0.55) * 0.4 * (0.4 + t);
        sctx.fillRect(x, y, 14 + 30 * t, 1);
      }
    }

    if (scene.sun > 0.01) glitter(scene.sx, `rgb(${scene.sunRGB})`, scene.sun, lerp(70, 30, scene.elev), time);
    if (scene.moonA > 0.01) glitter(scene.moonX, "rgb(236 232 220)", scene.moonA * 0.5, 16, time);

    // Le finestre accese si riflettono in scie tremolanti
    if (scene.lights > 0.01) {
      sctx.fillStyle = "rgb(255 205 130)";
      wins.forEach((w, i) => {
        const on = lightOn(w.t, scene.lights);
        if (!on) return;
        for (let r = 0; r < 5; r++) {
          sctx.globalAlpha = on * 0.45 * (1 - r / 5);
          const len = w.w * (1.4 + r * 0.5);
          sctx.fillRect(w.x + Math.sin(time * 2 + r + i) * 2 - len / 2, 2 + r * 4, len, 1.2);
        }
      });
    }

    sctx.globalAlpha = 1;
  }

  function frame(now) {
    // Lo scroll viene seguito con un filo di inerzia
    const next = reduceMotion ? target : p < 0 ? target : p + (target - p) * 0.12;
    const settled = Math.abs(next - p) < 0.00005;

    if (Math.abs(pointer.tx - pointer.mx) > 0.001) {
      pointer.mx += (pointer.tx - pointer.mx) * 0.05;
      body.style.setProperty("--mx", pointer.mx.toFixed(3));
    }

    if (!settled) {
      p = next;
      paintSky(p);
    }

    drawStars(now);
    drawSea(now);
    requestAnimationFrame(frame);
  }

  /* ---------- Eventi ---------- */

  addEventListener("scroll", readScroll, { passive: true });
  addEventListener("resize", () => {
    resize();
    readScroll();
    paintSky(Math.max(p, 0));
  });

  addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!reduceMotion && e.pointerType === "mouse") {
        pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      }
      hovered = interactive ? nearestStar(e.clientX, e.clientY, 26) : -1;
      // La manina serve solo col mouse: al tocco farebbe evidenziare tutta la pagina
      if (e.pointerType === "mouse") document.documentElement.style.cursor = hovered >= 0 ? "pointer" : "";
    },
    { passive: true }
  );

  addEventListener("click", (e) => {
    if (!interactive || e.target.closest("a, button")) return;
    const i = nearestStar(e.clientX, e.clientY, e.pointerType === "mouse" ? 26 : 40);
    if (i < 0 || i === selected) {
      selected = -1;
      return;
    }
    if (selected >= 0) {
      const exists = edges.some((ed) => (ed.a === selected && ed.b === i) || (ed.a === i && ed.b === selected));
      if (!exists) {
        edges.push({ a: selected, b: i, born: performance.now() });
        save();
        updateCopy();
      }
    }
    selected = i;
  });

  clearBtn?.addEventListener("click", () => {
    edges = [];
    selected = -1;
    save();
    updateCopy();
  });

  document.querySelector(".again")?.addEventListener("click", () => {
    scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  resize();
  readScroll();
  updateCopy();
  requestAnimationFrame(frame);
})();
