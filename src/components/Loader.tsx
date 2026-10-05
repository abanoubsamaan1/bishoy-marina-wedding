import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { makeGlow } from "../lib/glow";
import { cn } from "../utils/cn";
import { Rays } from "./visuals";

function LoaderParticles({ burst }: { burst: MutableRefObject<number> }) {
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
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const glow = makeGlow(64);
    const N = w < 640 ? 55 : 170;
    const R = Math.random;
    const ps = Array.from({ length: N }, () => ({
      a: R() * 6.283,
      r: 0.3 + R() * 0.85,
      s: 0.5 + R() * 1.4,
      v: 0.025 + R() * 0.06,
      w: (R() - 0.5) * 0.5,
      birth: R() * 4.5,
    }));
    const start = performance.now();
    let last = start;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const el = (now - start) / 1000;
      const bursting = burst.current > 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.max(w, h) * 0.6;
      for (const p of ps) {
        if (el < p.birth) continue;
        if (bursting) p.r += dt * (0.25 + p.v * 8);
        else p.r -= p.v * dt;
        p.a += (p.w * dt) / (p.r + 0.25);
        if (!bursting && p.r < 0.04) {
          p.r = 0.75 + R() * 0.5;
          p.a = R() * 6.283;
        }
        const x = cx + Math.cos(p.a) * p.r * maxR;
        const y = cy + Math.sin(p.a) * p.r * maxR * 0.85;
        const fadeIn = Math.min(1, (el - p.birth) / 2);
        const near = Math.min(1, p.r / 0.14);
        const size = (4 + p.s * 9) * (0.55 + 0.45 * near);
        ctx.globalAlpha = Math.max(0, fadeIn * near * (bursting ? Math.max(0, 1 - p.r * 0.9) : 1) * 0.9);
        ctx.drawImage(glow, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [burst]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}

const d = (s: string) => ({ "--d": s }) as CSSProperties;

type Timings = { fast: boolean; open: number; reveal: number; done: number; monogram: number; caption: number };

/* The opening is a fixed sequence of CSS beats:
     emerge -> flap opens -> letter rises -> letter pushes past the
     camera + its text dissolves.
   The JS timers below exist only to (a) start the beats and (b) hand the
   scroll back once the last beat has played, so shortening the hold means
   shortening the beats in index.css, not just these numbers.
   Phones run the exact same beats on a shorter clock — the envelope still
   emerges, the flap still opens, the letter still rises and pushes past the
   camera. Nothing is skipped, only the dead air between beats is removed.

   The viewport is read once per mount, not when this module is first
   evaluated, and that single snapshot drives the timers, the intro text
   delays AND the `fast` class that switches the CSS beats over. Driving both
   sides from one snapshot is what stops them from drifting apart — if this
   were read at module scope instead, a rotation mid-opening would leave the
   JS on the phone clock while the CSS keyframes re-evaluated to desktop, and
   the handoff would fire in the middle of the letter rising.

   INVARIANT: `reveal` (2300ms) must equal the `letterPush` end in index.css
   (delay 1.55s + duration 0.75s). Changing one requires changing the other. */
const timings = (): Timings =>
  typeof window !== "undefined" && window.innerWidth < 640
    ? { fast: true, open: 1550, reveal: 2300, done: 2900, monogram: 0, caption: 0.2 }
    : { fast: false, open: 2700, reveal: 4350, done: 5200, monogram: 1.5, caption: 2.3 };

export function Loader({ onOpen, onDone }: { onOpen: () => void; onDone: () => void }) {
  const [phase, setPhase] = useState<"intro" | "opening" | "out">("intro");
  const [t] = useState(timings);
  const burst = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // the invitation opens by itself — no button, no gesture required.
    // The emergence animation starts at t≈0 (see CSS), so we trigger the
    // flap/letter/seal opening right after it finishes.
    const id = window.setTimeout(open, t.open);
    timers.current.push(id);
    return () => {
      window.clearTimeout(id);
      timers.current.forEach((x) => window.clearTimeout(x));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = () => {
    if (phase !== "intro") return;
    burst.current = performance.now();
    setPhase("opening");
    timers.current.push(
      window.setTimeout(() => {
        setPhase("out");
        onOpen();
      }, t.reveal),
      window.setTimeout(onDone, t.done)
    );
  };

  const opening = phase !== "intro";

  return (
    <div
      className={cn(
        "loader fixed inset-0 z-[100] overflow-hidden bg-[#020101]",
        t.fast && "fast",
        opening && "opening",
        phase === "out" && "loader-out"
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(58,38,16,0.35),transparent_60%)]" />
      <div className="core" />
      <div className="halo" />
      <Rays className="inset-x-0 top-0 h-[80svh] opacity-[0.16]" />
      <LoaderParticles burst={burst} />

      <div
        className="relative z-10 flex h-[100svh] flex-col items-center justify-center"
        style={{ gap: "clamp(14px, 3.4svh, 34px)" }}
      >
        <div className="ld-fade text-center" style={d(`${t.monogram}s`)}>
          <p className="gold-text font-serif text-[clamp(2.6rem,11vw,4.4rem)] font-light italic leading-none tracking-[0.2em] pl-[0.2em]">
            B &amp; M
          </p>
        </div>

        <div className="env-scene">
          <div className="env-float">
            <div className={cn("env", opening && "env-open")}>
              <div className="env-back" />
              <div className="letter">
                <div className="letter-inner text-center">
                  <p className="gold-text font-serif italic font-medium leading-[1.15] tracking-[0.04em] text-[length:calc(var(--ew)*0.075)]">
                    Bishoy Yasser
                  </p>
                  <p className="gold-text my-[calc(var(--ew)*0.012)] font-serif italic leading-none text-[length:calc(var(--ew)*0.06)]">
                    &amp;
                  </p>
                  <p className="gold-text font-serif italic font-medium leading-[1.15] tracking-[0.04em] text-[length:calc(var(--ew)*0.075)]">
                    Marina Rizk
                  </p>
                  <div className="mx-auto my-[calc(var(--ew)*0.03)] h-px w-[calc(var(--ew)*0.22)] bg-gradient-to-r from-transparent via-[#b98b43] to-transparent" />
                  <p className="font-serif italic text-[#6b5530] text-[length:calc(var(--ew)*0.042)]">October 18, 2026</p>
                </div>
              </div>
              <div className="env-pocket grain">
                <i className="pl" />
                <i className="pr" />
                <i className="pb" />
              </div>
              <svg className="env-lines" viewBox="0 0 100 68" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f3dca0" />
                    <stop offset="0.5" stopColor="#b98b43" />
                    <stop offset="1" stopColor="#f0d48c" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 0 L52 36.7 L0 68 M100 0 L48 36.7 L100 68 M0 68 L50 34.7 L100 68"
                  fill="none"
                  stroke="rgba(150,115,55,0.45)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <rect
                  x="1.6"
                  y="1.6"
                  width="96.8"
                  height="64.8"
                  fill="none"
                  stroke="url(#foil)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.85"
                />
              </svg>
              <div className="flap">
                <div className="flap-f grain">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    <path
                      d="M0 0 L50 100 L100 0"
                      fill="none"
                      stroke="url(#foil)"
                      strokeWidth="2.6"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                <div className="flap-b" />
              </div>
              <div className="seal text-[length:calc(var(--ew)*0.052)]">B&amp;M</div>
              <div className="env-shadow" />
              <div className="env-reflect" />
            </div>
          </div>
        </div>

        <div className="ld-fade text-center" style={d(`${t.caption}s`)}>
          <p className="font-serif text-[clamp(1.2rem,5vw,1.65rem)] italic text-[#f6efe2]/85">
            An Invitation to Our Wedding
          </p>
        </div>
      </div>
    </div>
  );
}
