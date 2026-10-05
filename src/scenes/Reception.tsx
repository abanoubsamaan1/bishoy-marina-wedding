import { Fx, Scene, type KF } from "../lib/scroll";
import { MAPS } from "../lib/photos";
import { Arrow, Bokeh, Sparkles } from "../components/visuals";

const reveal = (a: number, b: number): KF[] => [
  { at: 0, o: 0, y: 4, b: 10 },
  { at: a, o: 0, y: 4, b: 10 },
  { at: b, o: 1, y: 0, b: 0 },
];

const FLAMES: [number, number][] = [
  [28, 86], [64, 104], [100, 110], [136, 104], [172, 86],
  [58, 56], [79, 67], [100, 71], [121, 67], [142, 56],
];
const DROPS: [number, number, number][] = [
  [28, 92, 12], [64, 110, 15], [100, 116, 18], [136, 110, 15], [172, 92, 12],
  [79, 73, 9], [100, 77, 11], [121, 73, 9],
];

function Chandelier() {
  return (
    <svg viewBox="0 0 200 170" className="h-auto w-full overflow-visible" fill="none" aria-hidden>
      <defs>
        <radialGradient id="flame" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.4" stopColor="#ffd98f" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb85a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="#e8cc8c" strokeWidth="0.9" strokeLinecap="round" opacity="0.92">
        <path d="M100 -60 V36" strokeOpacity="0.5" />
        <circle cx="100" cy="40" r="4.5" fill="#1a1007" />
        <path d="M100 40 Q70 48 58 62 M100 40 Q130 48 142 62" />
        <path d="M58 62 Q40 72 28 92 M142 62 Q160 72 172 92" />
        <path d="M58 62 Q100 92 142 62" />
        <path d="M28 92 Q100 140 172 92" />
        {DROPS.map(([x, y, l], i) => (
          <g key={i}>
            <path d={`M${x} ${y} V${y + l}`} strokeOpacity="0.55" />
            <path
              d={`M${x} ${y + l} l-2.2 3.4 l2.2 3.6 l2.2 -3.6 z`}
              fill="#fff1cc"
              fillOpacity="0.55"
              strokeWidth="0.5"
            />
          </g>
        ))}
      </g>
      {FLAMES.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y - 5} r="9" fill="url(#flame)" opacity="0.85" />
          <ellipse cx={x} cy={y - 4} rx="1.3" ry="2.6" fill="#fff8e0" />
        </g>
      ))}
    </svg>
  );
}

export function Reception() {
  return (
    <Scene id="reception" height="230vh" fadeIn={0.16} fadeOut={0.16} focus={0.56} z={16}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#4d3015_0%,#1c1008_48%,#080503_92%)]" />
      <Fx
        kf={[
          { at: 0, s: 1 },
          { at: 1, s: 1.35 },
        ]}
        className="absolute inset-0"
        origin="50% 40%"
      >
        <Bokeh count={20} seed={61} min={50} max={230} />
        <div className="light-leak inset-0 opacity-70" />
      </Fx>
      <Sparkles count={20} seed={18} />

      {/* chandelier */}
      <Fx
        kf={[
          { at: 0, y: -6, s: 0.92, o: 0 },
          { at: 0.2, y: 0, s: 1, o: 1 },
          { at: 1, y: 4, s: 1.12, o: 1 },
        ]}
        depth={10}
        origin="50% 0"
        className="absolute left-1/2 top-0 w-[min(74vw,430px)] -translate-x-1/2"
      >
        <div style={{ animation: "swing 8s ease-in-out infinite alternate", transformOrigin: "50% 0" }}>
          <Chandelier />
        </div>
      </Fx>
      <div className="pointer-events-none absolute left-1/2 top-[6svh] h-[38svh] w-[110vw] max-w-[60rem] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,206,130,0.3),transparent_65%)] blur-lg md:blur-2xl" />

      {/* warm wash carried over from the church light */}
      <Fx
        kf={[
          { at: 0, o: 0.6 },
          { at: 0.24, o: 0 },
        ]}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,232,185,0.9),rgba(255,200,120,0.4)_45%,transparent_78%)]"
      />

      {/* information */}
      <div className="absolute inset-x-0 top-[37svh] flex flex-col items-center px-6 text-center">
        <Fx kf={reveal(0.2, 0.3)}>
          <p className="label">The Reception</p>
        </Fx>
        <Fx kf={reveal(0.26, 0.38)} className="mt-4">
          <h2 className="pearl-text font-serif text-[clamp(2.7rem,12.4vw,5.6rem)] font-light leading-[1] text-shadow-soft">
            Al Nakheel Hall
          </h2>
        </Fx>
        <Fx kf={reveal(0.33, 0.43)} className="mt-3">
          <p className="pl-[0.32em] text-[0.8rem] font-light uppercase tracking-[0.32em] text-[#f6efe2]/75">Tanta, Egypt</p>
        </Fx>
        <Fx kf={reveal(0.4, 0.5)} className="mt-7 flex flex-col items-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
          <p className="gold-text font-serif text-[clamp(1.6rem,6.8vw,2.6rem)] font-light italic leading-tight">
            Let’s celebrate together.
          </p>
        </Fx>
        <Fx kf={reveal(0.47, 0.57)} className="mt-7" interactive>
          <a className="btn-gold" href={MAPS.hall} target="_blank" rel="noopener noreferrer">
            View Location <Arrow />
          </a>
        </Fx>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30svh] bg-gradient-to-t from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
    </Scene>
  );
}
