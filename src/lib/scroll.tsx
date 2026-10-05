import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type CSSProps = CSSProperties;

/* ------------------------------------------------------------------ */
/*  Global frame engine: smoothed scroll + smoothed pointer            */
/* ------------------------------------------------------------------ */
type Frame = (y: number, vh: number) => void;
const frames = new Set<Frame>();
const measurers = new Set<() => void>();

export const engine = { y: 0, vh: 0, vw: 0, px: 0, py: 0, dirty: true };
let tpx = 0;
let tpy = 0;
let started = false;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);

export function markDirty() {
  engine.dirty = true;
}

export function measureAll() {
  measurers.forEach((m) => m());
  engine.dirty = true;
}

export function startEngine() {
  if (started || typeof window === "undefined") return;
  started = true;
  engine.vh = window.innerHeight;
  engine.vw = window.innerWidth;
  engine.y = window.scrollY;

  const onResize = () => {
    engine.vh = window.innerHeight;
    engine.vw = window.innerWidth;
    measureAll();
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("load", onResize);
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    tpx = e.clientX / window.innerWidth - 0.5;
    tpy = e.clientY / window.innerHeight - 0.5;
  });
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => onResize()).observe(document.body);
  }
  if (document.fonts?.ready) void document.fonts.ready.then(onResize);

  const tick = () => {
    if (document.hidden) {
      requestAnimationFrame(tick);
      return;
    }
    const t = window.scrollY;
    const d = t - engine.y;
    if (Math.abs(d) > 0.08) {
      engine.y += d * 0.17;
      engine.dirty = true;
    } else if (engine.y !== t) {
      engine.y = t;
      engine.dirty = true;
    }
    const dx = tpx - engine.px;
    const dy = tpy - engine.py;
    if (Math.abs(dx) > 0.0004 || Math.abs(dy) > 0.0004) {
      engine.px += dx * 0.06;
      engine.py += dy * 0.06;
      engine.dirty = true;
    }
    if (engine.dirty) {
      engine.dirty = false;
      frames.forEach((f) => f(engine.y, engine.vh));
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function useFrame(cb: Frame) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    startEngine();
    const f: Frame = (y, vh) => ref.current(y, vh);
    frames.add(f);
    engine.dirty = true;
    return () => {
      frames.delete(f);
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Anchors registry (used by navigation)                              */
/* ------------------------------------------------------------------ */
export type Anchor = { opacity: () => number; target: () => number };
export const registry = new Map<string, Anchor>();

export function goTo(id: string) {
  const a = registry.get(id);
  if (!a) return;
  window.scrollTo({ top: Math.max(0, a.target()), behavior: "smooth" });
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */
type SceneCtx = {
  subscribe: (fn: (p: number) => void) => () => void;
  getP: () => number;
  /** true when the scene's stage is currently painted (within fade range) */
  visible: () => boolean;
};
const Ctx = createContext<SceneCtx | null>(null);

export function useSceneSubscribe(fn: (p: number) => void) {
  const ctx = useContext(Ctx);
  const ref = useRef(fn);
  ref.current = fn;
  useLayoutEffect(() => {
    if (!ctx) return;
    const off = ctx.subscribe((p) => ref.current(p));
    ref.current(ctx.getP());
    return off;
  }, [ctx]);
}

export function useSceneVisible() {
  const ctx = useContext(Ctx);
  return ctx ? ctx.visible() : false;
}

type SceneProps = {
  id: string;
  height: string; // css height of the scroll section, e.g. "300vh"
  fadeIn?: number;
  fadeOut?: number;
  first?: boolean;
  last?: boolean;
  focus?: number;
  z?: number;
  children: ReactNode;
  className?: string;
  /** When true (default), children are only mounted when the scene is near the
   *  viewport, deferring heavy work (images, canvas, 3D) until needed. The
   *  <section> is always in the DOM so scroll geometry is correct. */
  lazyMount?: boolean;
};

export function Scene({
  id,
  height,
  fadeIn = 0.14,
  fadeOut = 0.14,
  first = false,
  last = false,
  focus = 0.5,
  z = 10,
  children,
  className,
  lazyMount = true,
}: SceneProps) {
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const subs = useRef(new Set<(p: number) => void>());
  const pRef = useRef(0);
  const opRef = useRef(0);
  const geom = useRef({ top: 0, h: 1 });
  const [mounted, setMounted] = useState(!lazyMount);

  useLayoutEffect(() => {
    startEngine();
    const s = sec.current!;
    const st = stage.current!;

    const measure = () => {
      const r = s.getBoundingClientRect();
      geom.current = { top: r.top + window.scrollY, h: r.height };
      engine.dirty = true;
    };
    measure();
    measurers.add(measure);

    let io: IntersectionObserver | undefined;
if (lazyMount && !mounted) {
      const margin300 = `${window.innerHeight * 3}px`;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              setMounted(true);
              io?.disconnect();
              break;
            }
          }
        },
        { rootMargin: `${margin300} 0px ${margin300} 0px`, threshold: 0 }
      );
      io.observe(s);
    }

    const frame: Frame = (y, vh) => {
      const { top, h } = geom.current;
      const rel = top - y;
      let p: number;
      if (first) p = (y - top) / h;
      else if (last) p = (vh - rel) / h;
      else p = (vh - rel) / (h + vh);
      pRef.current = p;
      const visible = p > -0.001 && p < 1.001;
      let op = 0;
      if (visible) {
        const a = fadeIn > 0 ? smooth(clamp(p / fadeIn)) : 1;
        const b = fadeOut > 0 ? 1 - smooth(clamp((p - (1 - fadeOut)) / fadeOut)) : 1;
        op = a * b;
      }
      opRef.current = op;
      const vis = visible && op > 0.002;
      st.style.visibility = vis ? "visible" : "hidden";
      st.style.opacity = String(op);
      st.style.pointerEvents = op > 0.6 ? "auto" : "none";
      if (vis) subs.current.forEach((f2) => f2(clamp(p, 0, 1)));
    };
    frames.add(frame);
    frame(engine.y, engine.vh || window.innerHeight);

    registry.set(id, {
      opacity: () => opRef.current,
      target: () => {
        const { top, h } = geom.current;
        const vh = window.innerHeight;
        if (first) return top + focus * h;
        if (last) return top - vh + focus * h;
        return top - vh + focus * (h + vh);
      },
    });

    return () => {
      frames.delete(frame);
      measurers.delete(measure);
      registry.delete(id);
      io?.disconnect();
    };
  }, [id, first, last, fadeIn, fadeOut, focus, lazyMount]);

  const ctx = useRef<SceneCtx>({
    subscribe: (fn) => {
      subs.current.add(fn);
      return () => {
        subs.current.delete(fn);
      };
    },
    getP: () => clamp(pRef.current, 0, 1),
    visible: () => opRef.current > 0.002,
  });

  return (
    <section ref={sec} data-scene={id} style={{ height }} className="relative">
      <div
        ref={stage}
        className={"fixed inset-0 overflow-hidden " + (className ?? "")}
        style={{ zIndex: z, visibility: "hidden", opacity: 0, contain: "layout paint" }}
      >
        <Ctx.Provider value={ctx.current}>{mounted ? children : null}</Ctx.Provider>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Fx — keyframe driven transform / opacity / blur over scene progress */
/* ------------------------------------------------------------------ */
type Props9 = "x" | "y" | "z" | "s" | "rx" | "ry" | "rz" | "o" | "b";
export type KF = Partial<Record<Props9, number>> & { at: number };
type Full = Record<Props9, number> & { at: number };

const DEF: Record<Props9, number> = { x: 0, y: 0, z: 0, s: 1, rx: 0, ry: 0, rz: 0, o: 1, b: 0 };
const KEYS = Object.keys(DEF) as Props9[];

function fill(kf: KF[]): Full[] {
  const out: Full[] = [];
  let prev: Record<Props9, number> = { ...DEF };
  for (const k of kf) {
    const f = { ...prev, at: k.at } as Full;
    for (const key of KEYS) if (k[key] !== undefined) f[key] = k[key] as number;
    out.push(f);
    prev = f;
  }
  return out;
}

function sample(k: Full[], p: number, linear: boolean): Record<Props9, number> {
  if (p <= k[0].at) return k[0];
  const last = k[k.length - 1];
  if (p >= last.at) return last;
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (p < b.at) {
      let t = (p - a.at) / Math.max(1e-6, b.at - a.at);
      if (!linear) t = smooth(t);
      const r = {} as Record<Props9, number>;
      for (const key of KEYS) r[key] = a[key] + (b[key] - a[key]) * t;
      return r;
    }
  }
  return last;
}

type FxProps = {
  kf: KF[];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  origin?: string;
  depth?: number; // pointer parallax (px)
  tilt?: number; // pointer tilt (deg)
  preserve?: boolean;
  linear?: boolean;
  interactive?: boolean;
};

export function Fx({
  kf,
  children,
  className,
  style,
  origin,
  depth = 0,
  tilt = 0,
  preserve = false,
  linear = false,
  interactive = false,
}: FxProps) {
  const el = useRef<HTMLDivElement>(null);
  const kfs = useRef<Full[]>([]);
  kfs.current = fill(kf);
  const pRef = useRef(0);
  const visible = useRef(false);
  const ctx = useContext(Ctx);

  const apply = (p: number) => {
    const e = el.current;
    if (!e) return;
    const v = sample(kfs.current, p, linear);
    let tx = `${v.x}vw`;
    let ty = `${v.y}vh`;
    if (depth) {
      tx = `calc(${v.x}vw + ${(engine.px * depth).toFixed(2)}px)`;
      ty = `calc(${v.y}vh + ${(engine.py * depth).toFixed(2)}px)`;
    }
    const rx = v.rx - engine.py * tilt;
    const ry = v.ry + engine.px * tilt;
    e.style.transform = `translate3d(${tx},${ty},${v.z}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${v.rz}deg) scale(${v.s})`;
    e.style.opacity = v.o.toFixed(3);
    e.style.filter = v.b > 0.15 ? `blur(${v.b.toFixed(1)}px)` : "";
    if (interactive) e.style.pointerEvents = v.o > 0.45 ? "auto" : "none";
  };

  useSceneSubscribe((p) => {
    pRef.current = p;
    visible.current = true;
    apply(p);
  });

  // pointer-driven updates only while the scene is actually on screen
  useFrame(() => {
    if (depth || tilt) {
      if (ctx && !ctx.visible()) return;
      if (visible.current) apply(pRef.current);
    }
  });

  return (
    <div
      ref={el}
      className={className}
      style={{
        transformOrigin: origin,
        transformStyle: preserve ? "preserve-3d" : undefined,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Helper: fade/scale in between a..b, hold, optionally out between c..d */
export function beat(
  a: number,
  b: number,
  c?: number,
  d?: number,
  o: Partial<Record<Props9, number>> = {}
): KF[] {
  const from = { o: 0, y: 4, s: 0.96, b: 10, ...o };
  const arr: KF[] = [
    { at: 0, ...from },
    { at: a, ...from },
    { at: b, o: 1, y: 0, s: 1, b: 0, x: 0, z: 0, rx: 0, ry: 0, rz: 0 },
  ];
  if (c !== undefined && d !== undefined) {
    arr.push({ at: c, o: 1, y: 0, s: 1, b: 0 });
    arr.push({ at: d, o: 0, y: -4, s: 1.03, b: 8 });
  }
  return arr;
}
