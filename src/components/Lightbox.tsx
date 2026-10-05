import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { photoAt } from "../lib/photos";
import { autoScroll } from "../lib/autoscroll";
import { cn } from "../utils/cn";

type Props = {
  items: number[];
  index: number;
  origin: DOMRect | null;
  getRect: (idx: number) => DOMRect | null;
  onIndex: (i: number) => void;
  onClose: () => void;
};

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export function Lightbox({ items, index, origin, getRect, onIndex, onClose }: Props) {
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const mediaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const flipped = useRef(false);
  const drag = useRef({ active: false, x0: 0, dx: 0, t0: 0 });
  const n = items.length;
  const src = photoAt(items[index]);

  const flipIn = useCallback(() => {
    const el = mediaRef.current;
    if (!el || !origin || flipped.current) return;
    const to = el.getBoundingClientRect();
    if (!to.width) return;
    flipped.current = true;
    const s = origin.width / to.width;
    const dx = origin.left + origin.width / 2 - (to.left + to.width / 2);
    const dy = origin.top + origin.height / 2 - (to.top + to.height / 2);
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.transition = `transform 0.8s ${EASE}, opacity 0.5s ease`;
      el.style.transform = "none";
      el.style.opacity = "1";
    });
  }, [origin]);

  useLayoutEffect(() => {
    setShown(true);
    const img = mediaRef.current?.querySelector("img");
    if (!img || img.complete) flipIn();
    first.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // lock page scroll while open, and suspend the automatic drift
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    autoScroll.hold("lightbox");
    return () => {
      html.style.overflow = prev;
      autoScroll.release("lightbox");
    };
  }, []);

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setShown(false);
    const el = mediaRef.current;
    const r = getRect(index);
    if (el && r) {
      if (dragRef.current) {
        dragRef.current.style.transition = "none";
        dragRef.current.style.transform = "none";
      }
      const to = el.getBoundingClientRect();
      const s = r.width / to.width;
      const dx = r.left + r.width / 2 - (to.left + to.width / 2);
      const dy = r.top + r.height / 2 - (to.top + to.height / 2);
      el.style.transition = `transform 0.65s ${EASE}, opacity 0.5s ease 0.1s`;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
      el.style.opacity = "0";
    }
    window.setTimeout(onClose, 650);
  }, [closing, getRect, index, onClose]);

  const go = useCallback(
    (delta: 1 | -1) => {
      setDir(delta);
      onIndex((index + delta + n) % n);
    },
    [index, n, onIndex]
  );

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [close, go]);

  const down = (e: RPE) => {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { active: true, x0: e.clientX, dx: 0, t0: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (dragRef.current) dragRef.current.style.transition = "none";
  };
  const move = (e: RPE) => {
    const d = drag.current;
    if (!d.active) return;
    d.dx = e.clientX - d.x0;
    if (dragRef.current) dragRef.current.style.transform = `translateX(${d.dx}px) rotate(${d.dx / 90}deg)`;
  };
  const up = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const v = Math.abs(d.dx) / Math.max(1, performance.now() - d.t0);
    if (dragRef.current) {
      dragRef.current.style.transition = `transform 0.45s ${EASE}`;
      dragRef.current.style.transform = "none";
    }
    if (Math.abs(d.dx) > 70 || (Math.abs(d.dx) > 30 && v > 0.5)) go(d.dx < 0 ? 1 : -1);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] select-none transition-opacity duration-500",
        shown ? "opacity-100" : "opacity-0"
      )}
      style={{ touchAction: "none" }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <div className="absolute inset-0 bg-[#040302]/95" />
      {src && (
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-[20px] md:blur-[60px]"
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />

      <div className="absolute inset-0 grid place-items-center">
        <div ref={dragRef}>
          <div
            key={index}
            ref={mediaRef}
            className={cn("relative", !first.current && (dir === 1 ? "lb-in-r" : "lb-in-l"))}
            style={{ willChange: "transform, opacity" }}
          >
            {src ? (
              <img
                src={src}
                alt="Bishoy and Marina"
                draggable={false}
                onLoad={flipIn}
                className="block max-h-[82svh] max-w-[92vw] rounded-[6px] object-contain shadow-[0_20px_60px_-12px_rgba(0,0,0,0.8)] md:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] md:max-h-[86svh]"
              />
            ) : (
              <div
                className="grid aspect-[3/4] w-[min(86vw,58svh)] place-items-center rounded-[6px] font-serif text-5xl italic tracking-widest text-[#d9b873]/60"
                style={{ background: "radial-gradient(ellipse at 50% 30%, #3b2a16, #0b0806)" }}
              >
                B &amp; M
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-[6px] ring-1 ring-[#ecd9ac]/20" />
          </div>
        </div>
      </div>

      <button
        onClick={close}
        aria-label="Close viewer"
        className="glass absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full text-[#ecd9ac] md:right-7 md:top-6"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>

      {n > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="glass absolute left-6 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full text-[#ecd9ac] md:grid"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2L4 8l6 6" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next photo"
            className="glass absolute right-6 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full text-[#ecd9ac] md:grid"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2l6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-3"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i === index ? "w-6 bg-[#ecd08e]" : "w-1.5 bg-[#ecd9ac]/30"
              )}
            />
          ))}
        </div>
        <p className="label !text-[0.6rem] !tracking-[0.35em] opacity-70">
          {index + 1} / {n}
        </p>
      </div>
    </div>
  );
}
