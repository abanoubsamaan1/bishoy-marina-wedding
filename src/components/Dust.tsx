import { useEffect, useRef } from "react";
import { engine } from "../lib/scroll";
import { makeGlow, makePetal } from "../lib/glow";

type P = { x: number; y: number; z: number; vx: number; vy: number; ph: number; tw: number };
type Petal = { x: number; y: number; z: number; r: number; vr: number; ph: number; vy: number; vx: number };

/** Foreground layer: floating golden dust, out-of-focus bokeh, a few drifting petals. */
export function Dust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1 : 1.5);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const glow = makeGlow(64);
    const warm = makeGlow(128, "255,200,120");
    const petal = makePetal();
    const small = w < 640;
    const R = Math.random;

    const dust: P[] = Array.from({ length: small ? 38 : 72 }, () => ({
      x: R(),
      y: R(),
      z: 0.25 + R() * 0.75,
      vx: (R() - 0.5) * 0.004,
      vy: -(0.004 + R() * 0.012),
      ph: R() * 6.28,
      tw: 0.6 + R() * 1.6,
    }));
    const bokeh: P[] = Array.from({ length: small ? 4 : 7 }, () => ({
      x: R(),
      y: R(),
      z: 0.5 + R(),
      vx: (R() - 0.5) * 0.003,
      vy: -(0.002 + R() * 0.004),
      ph: R() * 6.28,
      tw: 0.2 + R() * 0.4,
    }));
    const petals: Petal[] = Array.from({ length: small ? 4 : 6 }, () => ({
      x: R(),
      y: R(),
      z: 0.5 + R() * 0.6,
      r: R() * 6.28,
      vr: (R() - 0.5) * 0.6,
      ph: R() * 6.28,
      vy: 0.012 + R() * 0.014,
      vx: (R() - 0.5) * 0.01,
    }));

    let raf = 0;
    let last = performance.now();
    let lastY = engine.y;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dy = engine.y - lastY;
      lastY = engine.y;
      const push = dy / Math.max(1, h);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = now / 1000;

      for (const b of bokeh) {
        b.x += b.vx * dt;
        b.y += b.vy * dt - push * b.z * 0.5;
        if (b.y < -0.2) b.y = 1.2;
        if (b.y > 1.2) b.y = -0.2;
        if (b.x < -0.2) b.x = 1.2;
        if (b.x > 1.2) b.x = -0.2;
        const s = 70 + b.z * 110;
        ctx.globalAlpha = 0.07 + 0.04 * Math.sin(t * b.tw + b.ph);
        ctx.drawImage(warm, b.x * w - s / 2, b.y * h - s / 2, s, s);
      }

      for (const p of dust) {
        p.x += (p.vx + Math.sin(t * 0.4 + p.ph) * 0.0015) * dt * 6;
        p.y += p.vy * dt * 4 * p.z - push * p.z * 0.9;
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = R();
        }
        if (p.y > 1.05) p.y = -0.05;
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        const s = (3 + p.z * 9) * (0.7 + 0.3 * Math.sin(t * p.tw + p.ph));
        ctx.globalAlpha = 0.25 + 0.6 * p.z * (0.6 + 0.4 * Math.sin(t * p.tw * 1.3 + p.ph));
        ctx.drawImage(glow, p.x * w - s / 2, p.y * h - s / 2, s, s);
      }

      ctx.globalAlpha = 0.55;
      for (const p of petals) {
        p.y += p.vy * dt - push * p.z * 0.6;
        p.x += (p.vx + Math.sin(t * 0.5 + p.ph) * 0.02) * dt;
        p.r += p.vr * dt;
        if (p.y > 1.1) {
          p.y = -0.1;
          p.x = R();
        }
        if (p.y < -0.15) p.y = 1.1;
        const flutter = Math.cos(t * 1.1 + p.ph);
        const sz = 0.5 + p.z * 0.5;
        ctx.setTransform(dpr, 0, 0, dpr, p.x * w * dpr, p.y * h * dpr);
        ctx.setTransform(
          Math.cos(p.r) * dpr * sz,
          Math.sin(p.r) * dpr * sz,
          -Math.sin(p.r) * dpr * sz * flutter,
          Math.cos(p.r) * dpr * sz * flutter,
          p.x * w * dpr,
          p.y * h * dpr
        );
        ctx.drawImage(petal, -20, -13);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[30] h-full w-full"
    />
  );
}
