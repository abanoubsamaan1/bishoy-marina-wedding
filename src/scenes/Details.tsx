import type { ReactNode } from "react";
import { Fx, Scene, type KF } from "../lib/scroll";
import { Bokeh, Rays, Sparkles } from "../components/visuals";

const S = { fill: "none", stroke: "url(#ig)", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Icon({ name }: { name: "date" | "time" | "church" | "hall" }) {
  return (
    <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden>
      <defs>
        <linearGradient id="ig" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0c0" />
          <stop offset="1" stopColor="#c39a52" />
        </linearGradient>
      </defs>
      {name === "date" && (
        <g {...S}>
          <rect x="8" y="12" width="32" height="28" rx="3" />
          <path d="M8 21h32M17 8v8M31 8v8" />
          <circle cx="24" cy="30" r="1.6" fill="#ecd08e" />
          <circle cx="16" cy="30" r="1" fill="#ecd08e" />
          <circle cx="32" cy="30" r="1" fill="#ecd08e" />
        </g>
      )}
      {name === "time" && (
        <g {...S}>
          <circle cx="24" cy="24" r="16" />
          <path d="M24 13v11l7 4" />
          <circle cx="24" cy="24" r="1.3" fill="#ecd08e" />
        </g>
      )}
      {name === "church" && (
        <g {...S}>
          <path d="M9 41V23l15-9 15 9v18zM20 41v-8a4 4 0 018 0v8" />
          <path d="M24 3v9M20.5 6.5h7" />
        </g>
      )}
      {name === "hall" && (
        <g {...S}>
          <path d="M24 4v9M24 13L11 25M24 13l13 12M11 25q13 11 26 0" />
          <path d="M16 31v5M24 33v6M32 31v5" />
          <circle cx="16" cy="38" r="1.2" fill="#ecd08e" />
          <circle cx="24" cy="41" r="1.2" fill="#ecd08e" />
          <circle cx="32" cy="38" r="1.2" fill="#ecd08e" />
        </g>
      )}
    </svg>
  );
}

const kf = (i: number): KF[] => [
  { at: 0, o: 0, y: 6, rx: 35, z: -120 },
  { at: 0.12 + i * 0.06, o: 0, y: 6, rx: 35, z: -120 },
  { at: 0.26 + i * 0.06, o: 1, y: 0, rx: 0, z: 0 },
];

function Item({ i, icon, label, children }: { i: number; icon: "date" | "time" | "church" | "hall"; label: string; children: ReactNode }) {
  return (
    <Fx kf={kf(i)} tilt={3} className="flex items-center gap-5 text-left md:gap-6">
      <div style={{ perspective: 400 }} className="shrink-0">
        <div
          className="icon3d glass grid h-[60px] w-[60px] place-items-center rounded-full md:h-16 md:w-16"
          style={{ animationDelay: `${-i * 1.7}s` }}
        >
          <Icon name={icon} />
        </div>
      </div>
      <div>
        <p className="label !pl-0 !text-[0.62rem] !tracking-[0.34em]">{label}</p>
        <div className="mt-1.5 font-serif text-[clamp(1.25rem,5.4vw,1.85rem)] font-light leading-[1.18] text-[#f6efe2]">
          {children}
        </div>
      </div>
    </Fx>
  );
}

export function Details() {
  return (
    <Scene id="details" height="210vh" fadeIn={0.2} fadeOut={0.18} focus={0.6} z={18}>
      <div className="absolute inset-0 bg-[#050403]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(120,84,36,0.28),transparent_62%)]" />
      <Rays className="inset-x-0 top-0 h-[60svh] opacity-25" />
      <Bokeh count={7} seed={50} className="opacity-50" />
      <Sparkles count={10} seed={2} />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-7" style={{ perspective: 1000 }}>
        <Fx
          kf={[
            { at: 0, o: 0, y: 4, b: 10 },
            { at: 0.1, o: 0, y: 4, b: 10 },
            { at: 0.24, o: 1, y: 0, b: 0 },
          ]}
          className="mb-[5.5svh] text-center"
        >
          <p className="label">The Details</p>
          <div className="mx-auto mt-3 h-px w-14 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
        </Fx>

        <div className="grid w-full max-w-[46rem] grid-cols-1 gap-[3.4svh] md:grid-cols-2 md:gap-x-16 md:gap-y-[6svh]">
          <Item i={0} icon="date" label="Date">
            Sunday,
            <br />
            October 18, 2026
          </Item>
          <Item i={1} icon="time" label="Ceremony">
            6:00 PM
          </Item>
          <Item i={2} icon="church" label="Location">
            St. George Church – Abu El-Naga
            <span className="mt-0.5 block text-[0.78em] italic text-[#ecd9ac]/70">Tanta, Egypt</span>
          </Item>
          <Item i={3} icon="hall" label="Reception">
            Al Nakheel Hall
            <span className="mt-0.5 block text-[0.78em] italic text-[#ecd9ac]/70">Tanta, Egypt</span>
          </Item>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
    </Scene>
  );
}
