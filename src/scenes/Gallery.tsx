import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { createPortal } from "react-dom";
import { clamp, registry, startEngine, useFrame } from "../lib/scroll";
import { music } from "../lib/audio";
import { Photo } from "../components/Photo";
import { Lightbox } from "../components/Lightbox";
import { Bokeh, Rays } from "../components/visuals";
import { cn } from "../utils/cn";

type CardDef = {
  i: number;
  ratio: string;
  depth: number; // parallax (negative = deeper, moves slower/opposite)
  rot: number;
  scale: number;
  shade: number;
};

const CARDS: CardDef[] = [
  { i: 5, ratio: "3/4", depth: 0.1, rot: -2.4, scale: 1.04, shade: 0 },
  { i: 0, ratio: "4/5", depth: -0.06, rot: 1.8, scale: 0.93, shade: 0.3 },
  { i: 2, ratio: "3/4", depth: 0.05, rot: 1.4, scale: 1, shade: 0.1 },
  { i: 4, ratio: "7/10", depth: 0.12, rot: -1.6, scale: 1.05, shade: 0 },
  { i: 1, ratio: "3/4", depth: -0.08, rot: -1.2, scale: 0.92, shade: 0.34 },
  { i: 3, ratio: "4/5", depth: 0.04, rot: 2.2, scale: 0.99, shade: 0.14 },
  { i: 6, ratio: "3/4", depth: 0.07, rot: -1.9, scale: 1.01, shade: 0.2 },
];
const ITEMS = CARDS.map((c) => c.i);

function useWide() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 900px)");
    const f = () => setWide(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return wide;
}

function Card({
  idx,
  c,
  onOpen,
  boxRef,
  wide,
}: {
  idx: number;
  c: CardDef;
  onOpen: (idx: number) => void;
  boxRef: (el: HTMLDivElement | null) => void;
  wide: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const par = useRef<HTMLDivElement>(null);
  const tiltEl = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);

  useFrame((_y, vh) => {
    const w = wrap.current;
    const p = par.current;
    if (!w || !p) return;
    const r = w.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const off = r.top + r.height / 2 - vh / 2;
    const e = clamp((vh - r.top) / (vh * 0.42));
    if (wide) {
      p.style.transform = `translate3d(0, ${(-off * c.depth).toFixed(1)}px, 0) rotateX(${((1 - e) * 16).toFixed(
        1
      )}deg) rotateZ(${c.rot}deg) scale(${(c.scale * (0.94 + 0.06 * e)).toFixed(3)})`;
    }
    p.style.opacity = e.toFixed(3);
  });

  const tilt = (e: RPE<HTMLDivElement>) => {
    if (!wide || e.pointerType === "touch") return;
    const t = tiltEl.current;
    if (!t) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    t.style.transform = `rotateY(${(x * 18).toFixed(1)}deg) rotateX(${(-y * 18).toFixed(1)}deg) translateZ(46px)`;
    if (sheen.current)
      sheen.current.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,240,205,0.3), transparent 55%)`;
  };
  const reset = () => {
    if (tiltEl.current) tiltEl.current.style.transform = "";
    if (sheen.current) sheen.current.style.background = "transparent";
  };

  return (
    <div ref={wrap} className="relative" style={{ perspective: 1000 }}>
      <div ref={par} style={{ transformStyle: "preserve-3d", opacity: 0, willChange: "transform, opacity" }}>
        <div
          ref={tiltEl}
          className="group relative cursor-pointer transition-transform duration-300 ease-out active:scale-[0.97]"
          style={{ transformStyle: "preserve-3d" }}
          onPointerMove={tilt}
          onPointerLeave={reset}
          onClick={() => onOpen(idx)}
          role="button"
          tabIndex={0}
          aria-label="Open photograph"
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(idx)}
        >
            <div
              ref={boxRef}
              className="relative w-full overflow-hidden rounded-[10px] ring-1 ring-[#ecd9ac]/25 shadow-[0_25px_40px_-15px_rgba(0,0,0,0.7)] md:shadow-[0_40px_70px_-25px_rgba(0,0,0,0.95)] transition-shadow duration-500 group-hover:shadow-[0_25px_40px_-15px_rgba(0,0,0,0.8)] md:group-hover:shadow-[0_50px_90px_-20px_rgba(0,0,0,1),0_0_50px_rgba(217,184,115,0.25)]               group-hover:ring-[#ecd08e]/60"
              style={{ aspectRatio: c.ratio }}
            >
            <Photo i={c.i} className="h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]" />
            <div
              className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-700 group-hover:opacity-0"
              style={{ opacity: c.shade }}
            />
            <div ref={sheen} className="pointer-events-none absolute inset-0 md:mix-blend-screen" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Gallery() {
  const sec = useRef<HTMLElement>(null);
  const boxes = useRef<(HTMLDivElement | null)[]>([]);
  const wide = useWide();
  const [lb, setLb] = useState<{ index: number; origin: DOMRect | null } | null>(null);

  useLayoutEffect(() => {
    startEngine();
    registry.set("gallery", {
      opacity: () => {
        const r = sec.current?.getBoundingClientRect();
        if (!r) return 0;
        const mid = window.innerHeight / 2;
        return r.top <= mid && r.bottom >= mid ? 1 : 0;
      },
      target: () => {
        const r = sec.current!.getBoundingClientRect();
        return r.top + window.scrollY + window.innerHeight * 0.12;
      },
    });
    return () => {
      registry.delete("gallery");
    };
  }, []);

  const open = useCallback((idx: number) => {
    music.duck(5000);
    const origin = boxes.current[idx]?.getBoundingClientRect() ?? null;
    setLb({ index: idx, origin });
  }, []);
  const getRect = useCallback((idx: number) => boxes.current[idx]?.getBoundingClientRect() ?? null, []);

  const nCols = wide ? 3 : 2;
  const cols: number[][] = Array.from({ length: nCols }, () => []);
  CARDS.forEach((_, k) => cols[k % nCols].push(k));
  const colOffset = wide ? ["0vh", "16vh", "5vh"] : ["0vh", "13vh"];

  return (
    <section
      id="gallery"
      ref={sec}
      className="relative z-[20] overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, rgba(6,4,3,0) 0, #060403 26vh, #060403 calc(100% - 26vh), rgba(6,4,3,0) 100%)",
      }}
    >
      <Bokeh count={10} seed={90} className="opacity-50" />
      <Rays className="inset-x-0 top-[14vh] h-[60vh] opacity-20" />

      <div className="relative mx-auto max-w-[1080px] px-4 pb-[30svh] pt-[24svh] md:px-8">
        <div className="mb-[9svh] text-center">
          <p className="label">Gallery</p>
          <div className="mx-auto mt-3 h-px w-14 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
          <p className="mt-5 font-serif text-[clamp(1.05rem,4.2vw,1.35rem)] italic text-[#f6efe2]/70">
            Tap a photograph to step inside.
          </p>
        </div>

        <div className={cn("flex items-start", wide ? "gap-10" : "gap-3")}>
          {cols.map((col, ci) => (
            <div key={ci} className={cn("flex flex-1 flex-col", wide ? "gap-14" : "gap-9")} style={{ marginTop: colOffset[ci] }}>
               {col.map((k) => (
                 <Card
                   key={k}
                   idx={k}
                   c={CARDS[k]}
                   wide={wide}
                   onOpen={open}
                   boxRef={(el) => {
                     boxes.current[k] = el;
                   }}
                 />
               ))}
            </div>
          ))}
        </div>
      </div>

      {lb &&
        createPortal(
          <Lightbox
            items={ITEMS}
            index={lb.index}
            origin={lb.origin}
            getRect={getRect}
            onIndex={(i) => setLb((s) => (s ? { ...s, index: i } : s))}
            onClose={() => setLb(null)}
          />,
          document.body
        )}
    </section>
  );
}
