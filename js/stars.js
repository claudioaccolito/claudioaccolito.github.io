/* Cielo stellato statico per le pagine secondarie */
(() => {
  "use strict";

  const canvas = document.querySelector(".stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const stars = Array.from({ length: 220 }, () => ({
    x: rand(),
    y: rand(),
    r: rand() < 0.08 ? 1.1 + rand() : 0.3 + rand() * 0.7,
    a: 0.25 + rand() * 0.6,
  }));

  let lastW = 0;
  let lastH = 0;

  function draw() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fff";
    stars.forEach((s) => {
      ctx.globalAlpha = s.a;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  addEventListener("resize", draw);
  draw();
})();
