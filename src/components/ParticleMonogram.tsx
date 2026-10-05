import { useEffect, useRef } from "react";
import { makeGlow } from "../lib/glow";
import { clamp, smooth, useSceneSubscribe } from "../lib/scroll";

/** Golden particles drift through the frame, then gather to form the monogram. */
export function ParticleMonogram({ text = "B & M", from = 0.08, to = 0.34 }: { text?: string; from?: number; to?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pRef = useRef(0);

  useSceneSubscribe((p) => {
    pRef.current = p;
  });

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const glow = makeGlow(48);
    let w = 0;
    let h = 0;
    let n = 0;
    let tx = new Float32Array(0);
    let ty = new Float32Array(0);
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let ph = new Float32Array(0);
    let sz = new Float32Array(0);
    let cancelled = false;

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d")!;
      const fs = Math.min(w * 0.46, h * 0.3);
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.font = `italic 500 ${fs}px "Cormorant Garamond", Georgia, serif`;
      o.fillText(text, w / 2, h / 2);
      const step = Math.max(3, Math.round(w / 120));
      const data = o.getImageData(0, 0, w, h).data;
      const pts: number[] = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 128) pts.push(x, y);
        }
      }
      n = Math.min(pts.length / 2, 1100);
      tx = new Float32Array(n);
      ty = new Float32Array(n);
      ox = new Float32Array(n);
      oy = new Float32Array(n);
      ph = new Float32Array(n);
      sz = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const k = Math.floor((i / n) * (pts.length / 2)) * 2;
        tx[i] = pts[k];
        ty[i] = pts[k + 1];
        ox[i] = Math.random();
        oy[i] = Math.random();
        ph[i] = Math.random() * 6.28;
        sz[i] = 0.6 + Math.random() * 1.1;
      }
    };

    const ready = async () => {
      try {
        await document.fonts.load('italic 500 100px "Cormorant Garamond"');
      } catch {
        /* fall back to default serif */
      }
      if (!cancelled) build();
    };
    void ready();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) {
        return;
      }
      const p = pRef.current;
      if (p <= 0.001 || p >= 0.999 || n === 0) return;
      const t = now / 1000;
      const g = smooth(clamp((p - from) / (to - from)));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const intro = smooth(clamp(p / 0.1));
      for (let i = 0; i < n; i++) {
        // free-floating position (slow drift through the screen)
        const fx = (ox[i] + Math.sin(t * 0.25 + ph[i]) * 0.06 + t * 0.004 * sz[i]) % 1;
        const fy = (oy[i] + Math.cos(t * 0.21 + ph[i]) * 0.06 - t * 0.006 * sz[i] + 10) % 1;
        const x0 = fx * w;
        const y0 = fy * h;
        const shimmer = g >= 1 ? Math.sin(t * 1.4 + ph[i]) * 1.4 : 0;
        const x = x0 + (tx[i] - x0) * g + shimmer;
        const y = y0 + (ty[i] - y0) * g + Math.cos(t * 1.1 + ph[i]) * (g >= 1 ? 1.2 : 0);
        const s = (5 + sz[i] * 5) * (1 + g * 0.2);
        ctx.globalAlpha = intro * (0.35 + 0.65 * g) * (0.75 + 0.25 * Math.sin(t * 2 + ph[i]));
        ctx.drawImage(glow, x - s / 2, y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [text, from, to]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
