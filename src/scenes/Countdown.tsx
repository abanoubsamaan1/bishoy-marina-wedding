import { useEffect, useState } from "react";
import { Fx, Scene, type KF } from "../lib/scroll";
import { WEDDING_DATE } from "../lib/photos";
import { Bokeh, Sparkles } from "../components/visuals";

function useCountdown() {
  const calc = () => {
    const diff = Math.max(0, WEDDING_DATE.getTime() - Date.now());
    const s = Math.floor(diff / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = window.setInterval(() => setT(calc()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

const pad = (n: number, l = 2) => String(n).padStart(l, "0");

const tileKf = (i: number): KF[] => [
  { at: 0, o: 0, rx: 70, y: 8, z: -200 },
  { at: 0.14 + i * 0.035, o: 0, rx: 70, y: 8, z: -200 },
  { at: 0.3 + i * 0.035, o: 1, rx: 0, y: 0, z: 0 },
];

export function Countdown() {
  const t = useCountdown();
  const tiles: [string, string][] = [
    ["Days", pad(t.days, t.days > 99 ? 3 : 2)],
    ["Hours", pad(t.hours)],
    ["Minutes", pad(t.minutes)],
    ["Seconds", pad(t.seconds)],
  ];
  return (
    <Scene id="countdown" height="210vh" fadeIn={0.2} fadeOut={0.18} focus={0.62} z={13}>
      <div className="absolute inset-0 bg-[#050403]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(110,78,34,0.3),transparent_62%)]" />
      <Bokeh count={7} seed={33} className="opacity-60" />
      <Sparkles count={16} seed={9} />

      {/* slow golden orbit rings in 3D space */}
      <div className="absolute inset-0 grid place-items-center" style={{ perspective: 1100 }}>
        <div className="relative h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
          <div className="orbit -left-[44vmin] -top-[44vmin] h-[88vmin] w-[88vmin]" />
          <div className="orbit -left-[33vmin] -top-[33vmin] h-[66vmin] w-[66vmin]" style={{ animationDirection: "reverse", animationDuration: "55s" }} />
          <div className="orbit -left-[56vmin] -top-[56vmin] h-[112vmin] w-[112vmin] opacity-60" style={{ animationDuration: "70s" }} />
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ perspective: 1000 }}>
        <Fx
          kf={[
            { at: 0, o: 0, y: 4, b: 10 },
            { at: 0.14, o: 0, y: 4, b: 10 },
            { at: 0.28, o: 1, y: 0, b: 0 },
          ]}
          className="mb-[4.5svh] text-center"
        >
          <p className="label !tracking-[0.36em] leading-relaxed">
            Countdown to
            <br className="sm:hidden" /> our wedding
          </p>
          <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
        </Fx>

        <div className="grid w-full max-w-[38rem] grid-cols-4 gap-2 sm:gap-4">
          {tiles.map(([label, val], i) => (
            <Fx key={label} kf={tileKf(i)} tilt={6} depth={6} preserve>
              <div
                className="glass relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-2xl sm:aspect-[4/5]"
                style={{ animation: `swing ${5 + i * 0.6}s ease-in-out ${-i}s infinite alternate` }}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent" />
                <span
                  key={val}
                  className="digit gold-text font-serif text-[clamp(1.9rem,9.6vw,4rem)] font-light leading-none tabular-nums"
                >
                  {val}
                </span>
                <span className="mt-3 text-[clamp(0.52rem,2.2vw,0.7rem)] font-light uppercase tracking-[0.26em] text-[#ecd9ac]/75 pl-[0.26em]">
                  {label}
                </span>
                <div className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d9b873]/60 to-transparent" />
              </div>
            </Fx>
          ))}
        </div>

        <Fx
          kf={[
            { at: 0, o: 0 },
            { at: 0.4, o: 0 },
            { at: 0.52, o: 1 },
          ]}
          className="mt-[5svh] text-center"
        >
          <p className="font-serif text-[clamp(1.05rem,4.4vw,1.4rem)] italic text-[#f6efe2]/80">
            Sunday, October 18, 2026
          </p>
        </Fx>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
    </Scene>
  );
}
