import { useEffect, useRef, useState } from "react";
import { goTo, registry, useFrame } from "../lib/scroll";
import { autoScroll } from "../lib/autoscroll";
import { cn } from "../utils/cn";

const ITEMS: [string, string][] = [
  ["home", "Home"],
  ["story", "Our Story"],
  ["ceremony", "Ceremony"],
  ["reception", "Reception"],
  ["gallery", "Gallery"],
  ["details", "Details"],
  ["messages", "Messages"],
];

export function Nav({ visible }: { visible: boolean }) {
  const [active, setActive] = useState("home");
  const [menu, setMenu] = useState(false);
  const cur = useRef("home");

  // the full-screen menu is an overlay: the cinematic drift waits for it
  useEffect(() => {
    if (menu) autoScroll.hold("nav-menu");
    else autoScroll.release("nav-menu");
    return () => {
      if (menu) autoScroll.release("nav-menu");
    };
  }, [menu]);

  useFrame(() => {
    let best = "";
    let bo = 0.5;
    for (const [id] of ITEMS) {
      const o = registry.get(id)?.opacity() ?? 0;
      if (o > bo) {
        bo = o;
        best = id;
      }
    }
    if (best && best !== cur.current) {
      cur.current = best;
      setActive(best);
    }
  });

  const go = (id: string) => {
    setMenu(false);
    goTo(id);
  };

  return (
    <div
      className={cn(
        "transition-opacity duration-[1800ms] ease-out",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      {/* monogram */}
      <button
        onClick={() => go("home")}
        aria-label="Back to the beginning"
        className="fixed left-4 top-4 z-[50] grid h-11 place-items-center px-2 font-serif text-lg italic tracking-[0.2em] text-[#ecd9ac]/80 transition hover:text-[#fff0c8] md:left-7 md:top-6"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        B &amp; M
      </button>

      {/* desktop: minimal dot rail */}
      <nav
        aria-label="Sections"
        className="fixed right-6 top-1/2 z-[50] hidden -translate-y-1/2 flex-col items-end gap-3.5 md:flex"
      >
        {ITEMS.map(([id, label]) => (
          <button key={id} onClick={() => go(id)} className="group flex items-center gap-3" aria-label={label}>
            <span
              className={cn(
                "text-[0.6rem] font-light uppercase tracking-[0.32em] text-[#ecd9ac] transition-all duration-500",
                active === id ? "translate-x-0 opacity-90" : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all duration-500",
                active === id
                  ? "h-2 w-2 bg-[#ecd08e] shadow-[0_0_12px_3px_rgba(236,208,142,0.6)]"
                  : "h-1.5 w-1.5 bg-[#ecd9ac]/35 group-hover:bg-[#ecd9ac]/80"
              )}
            />
          </button>
        ))}
      </nav>

      {/* mobile: minimal menu button */}
      <button
        onClick={() => setMenu((m) => !m)}
        aria-label={menu ? "Close menu" : "Open menu"}
        className="glass fixed right-4 top-4 z-[70] grid h-11 w-11 place-items-center rounded-full md:hidden"
      >
        <span className="relative block h-3 w-5">
          <span
            className={cn(
              "absolute left-0 h-px w-full bg-[#ecd9ac] transition-all duration-500",
              menu ? "top-1.5 rotate-45" : "top-0"
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-1.5 h-px bg-[#ecd9ac] transition-all duration-500",
              menu ? "w-0 opacity-0" : "w-3/5"
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-px w-full bg-[#ecd9ac] transition-all duration-500",
              menu ? "top-1.5 -rotate-45" : "top-3"
            )}
          />
        </span>
      </button>

        <div
          className={cn(
            "fixed inset-0 z-[60] flex flex-col items-center justify-center gap-1 bg-[#050403]/88 backdrop-blur-sm md:backdrop-blur-xl transition-all duration-700 md:hidden",
            menu ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
        {ITEMS.map(([id, label], i) => (
          <button
            key={id}
            onClick={() => go(id)}
            className={cn(
              "min-h-[56px] px-8 font-serif text-[2rem] font-light tracking-[0.08em] transition-all duration-700",
              active === id ? "gold-text" : "text-[#f6efe2]/80",
              menu ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
            style={{ transitionDelay: menu ? `${120 + i * 70}ms` : "0ms" }}
          >
            {label}
          </button>
        ))}
        <div className="mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
        <p className="mt-4 font-serif italic text-[#ecd9ac]/70">October 18, 2026</p>
      </div>
    </div>
  );
}
