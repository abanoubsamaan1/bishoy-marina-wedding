// Pre-rendered soft glow sprites (much cheaper than gradients per frame)
export function makeGlow(size = 64, rgb = "255,222,160"): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = size / 2;
  const grd = g.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, `rgba(${rgb},1)`);
  grd.addColorStop(0.18, `rgba(${rgb},0.75)`);
  grd.addColorStop(0.5, `rgba(${rgb},0.16)`);
  grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

export function makePetal(w = 40, h = 26): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, "rgba(252,246,232,0.95)");
  grd.addColorStop(0.6, "rgba(236,214,172,0.8)");
  grd.addColorStop(1, "rgba(206,170,110,0.55)");
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(1, h / 2);
  g.bezierCurveTo(w * 0.25, -h * 0.25, w * 0.8, -h * 0.1, w - 1, h / 2);
  g.bezierCurveTo(w * 0.8, h * 1.1, w * 0.25, h * 1.25, 1, h / 2);
  g.fill();
  return c;
}
