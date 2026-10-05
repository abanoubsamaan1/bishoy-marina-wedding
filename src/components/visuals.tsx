import { useMemo, type ReactNode } from "react";
import { Fx, type KF } from "../lib/scroll";
import { cn } from "../utils/cn";

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Soft out-of-focus light discs */
export function Bokeh({
  count = 12,
  seed = 1,
  min = 30,
  max = 140,
  className,
}: {
  count?: number;
  seed?: number;
  min?: number;
  max?: number;
  className?: string;
}) {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      x: r() * 100,
      y: r() * 100,
      size: min + r() * (max - min),
      o: 0.25 + r() * 0.6,
      d: 9 + r() * 12,
      delay: -r() * 14,
    }));
  }, [count, seed, min, max]);
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {items.map((b, i) => (
        <span
          key={i}
          className="bokeh"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            opacity: b.o,
            animationDuration: `${b.d}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Rays({ className }: { className?: string }) {
  return <div className={cn("rays", className)} aria-hidden />;
}

/** Soft architectural texture: tall arches dissolving into the dark */
export function ArchTexture({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute inset-0 h-full w-full", className)}
      viewBox="0 0 500 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="archg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecd09a" stopOpacity="0.6" />
          <stop offset="0.7" stopColor="#ecd09a" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ecd09a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="archf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c89a55" stopOpacity="0.18" />
          <stop offset="1" stopColor="#c89a55" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((k) => {
        const x = k * 100 + 6;
        return (
          <g key={k}>
            <path d={`M${x} 800 V250 A44 44 0 0 1 ${x + 88} 250 V800 Z`} fill="url(#archf)" />
            <path
              d={`M${x} 800 V250 A44 44 0 0 1 ${x + 88} 250 V800`}
              fill="none"
              stroke="url(#archg)"
              strokeWidth="1.4"
            />
            <path
              d={`M${x + 12} 800 V256 A32 32 0 0 1 ${x + 76} 256 V800`}
              fill="none"
              stroke="url(#archg)"
              strokeWidth="0.8"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function Sparkles({ count = 14, seed = 3, className }: { count?: number; seed?: number; className?: string }) {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      x: r() * 100,
      y: r() * 100,
      s: 0.6 + r() * 1.1,
      d: 2.6 + r() * 3.5,
      delay: -r() * 6,
    }));
  }, [count, seed]);
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {items.map((s, i) => (
        <span
          key={i}
          className="spark"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: `scale(${s.s})`,
            animationDuration: `${s.d}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function CrossMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30" className={className} aria-hidden>
      <defs>
        <linearGradient id="crossg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c8" />
          <stop offset="1" stopColor="#b98b43" />
        </linearGradient>
      </defs>
      <path
        d="M10.5 1h3v8h8v3h-8v17h-3V12h-8V9h8z"
        fill="url(#crossg)"
        stroke="rgba(255,240,200,.5)"
        strokeWidth=".4"
      />
    </svg>
  );
}

/** True-3D extruded gold typography (stacked layers in preserve-3d space). */
export function Gold3D({
  text,
  layers = 10,
  step = 1.6,
  className,
  kf,
  rot,
  tilt = 7,
}: {
  text: ReactNode;
  layers?: number;
  step?: number;
  className?: string;
  kf: KF[];
  rot: KF[];
  tilt?: number;
}) {
  return (
    <Fx kf={kf} className="col-start-1 row-start-1 place-self-center">
      <div style={{ perspective: 1100 }}>
        <Fx kf={rot} preserve tilt={tilt} depth={8} className={cn("relative inline-block whitespace-nowrap leading-none", className)}>
          {Array.from({ length: layers }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className="gold-layer absolute left-0 top-0 block whitespace-nowrap"
              style={{
                transform: `translateZ(${-(layers - i) * step}px)`,
                color: `hsl(35 ${52 - i * 1.2}% ${12 + i * 2.6}%)`,
              }}
            >
              {text}
            </span>
          ))}
          <span className="gold-face relative block whitespace-nowrap">{text}</span>
        </Fx>
      </div>
    </Fx>
  );
}

export function Arrow() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
      <path d="M1 5h13M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
