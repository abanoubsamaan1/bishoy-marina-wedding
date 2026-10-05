import type { ReactElement } from "react";
import { Fx, Scene, type KF } from "../lib/scroll";
import { MAPS } from "../lib/photos";
import { Arrow, CrossMark, Rays } from "../components/visuals";

const PALETTE = ["#f0c874", "#e3a94f", "#f7dfa3", "#b9762f", "#8d4a3a", "#5a7393", "#f3d99a"];
const COLS = 8;
const ROWS = 18;

function StainedGlass() {
  const cells: ReactElement[] = [];
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const c = PALETTE[(i * 5 + j * 3 + ((i * j) % 4)) % PALETTE.length];
      const warm = (i + j * 2) % 5 === 0;
      cells.push(
        <rect
          key={`${i}-${j}`}
          x={26 + i * 18.5}
          y={8 + j * 22}
          width={18.5}
          height={22}
          fill={c}
          opacity={warm ? 0.85 : 0.42 + ((i + j) % 4) * 0.1}
          stroke="#120c07"
          strokeWidth="0.9"
        />
      );
    }
  }
  return <>{cells}</>;
}

const reveal = (a: number, b: number): KF[] => [
  { at: 0, o: 0, y: 4, b: 10 },
  { at: a, o: 0, y: 4, b: 10 },
  { at: b, o: 1, y: 0, b: 0 },
];

export function Ceremony() {
  return (
    <Scene id="ceremony" height="270vh" fadeIn={0.15} fadeOut={0.15} focus={0.62} z={15}>
      {/* atmosphere */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#060403_0%,#140d07_55%,#0a0604_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,rgba(255,200,120,0.22),transparent_55%)]" />
      <Rays className="inset-x-0 top-[6svh] h-[80svh] opacity-50" />

      {/* CAMERA — slow push through the arch toward the window light */}
      <Fx
        kf={[
          { at: 0, s: 0.9, y: 2 },
          { at: 0.5, s: 1.12, y: 0 },
          { at: 1, s: 1.75, y: 6 },
        ]}
        origin="50% 26%"
        className="absolute inset-0"
      >
        <svg
          viewBox="-60 -30 320 470"
          className="absolute left-1/2 top-[2svh] h-[66svh] w-auto -translate-x-1/2 overflow-visible"
          aria-hidden
        >
          <defs>
            <clipPath id="winClip">
              <path d="M26 400 V150 C26 84 72 34 100 10 C128 34 174 84 174 150 V400 Z" />
            </clipPath>
            <radialGradient id="roseG" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#fff3c8" />
              <stop offset="0.6" stopColor="#e9b75d" />
              <stop offset="1" stopColor="#a8682a" />
            </radialGradient>
            <linearGradient id="lightFall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe8b0" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffd890" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paneShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#140d06" stopOpacity="0.55" />
              <stop offset="0.45" stopColor="#140d06" stopOpacity="0" />
              <stop offset="1" stopColor="#fff0c0" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="edgeG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3dca0" />
              <stop offset="1" stopColor="#7a5a26" />
            </linearGradient>
            <radialGradient id="winGlow" cx="50%" cy="38%" r="55%">
              <stop offset="0" stopColor="#ffdca0" stopOpacity="0.85" />
              <stop offset="1" stopColor="#ffdca0" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* glow behind the window */}
          <ellipse cx="100" cy="180" rx="150" ry="230" fill="url(#winGlow)" />

          {/* stained-glass-inspired window */}
          <g clipPath="url(#winClip)">
            <rect x="26" y="0" width="148" height="410" fill="#2a1a0b" />
            <StainedGlass />
            <rect x="26" y="0" width="148" height="410" fill="url(#paneShade)" />
            {/* tracery */}
            <g stroke="#100a05" strokeWidth="2.2" fill="none">
              <path d="M100 60 V400" />
              <path d="M26 210 H174" />
              <path d="M26 300 H174" />
              <path d="M63 210 V400 M137 210 V400" strokeWidth="1.4" />
            </g>
            {/* rose window */}
            <circle cx="100" cy="118" r="33" fill="#140d07" />
            <circle cx="100" cy="118" r="30" fill="url(#roseG)" opacity="0.92" />
            <g stroke="#140d07" strokeWidth="1.3" fill="none">
              {Array.from({ length: 12 }).map((_, k) => {
                const a = (k / 12) * Math.PI * 2;
                return <path key={k} d={`M100 118 L${100 + Math.cos(a) * 30} ${118 + Math.sin(a) * 30}`} />;
              })}
              <circle cx="100" cy="118" r="18" />
              <circle cx="100" cy="118" r="8" fill="#140d07" />
            </g>
            <path d="M100 106 V130 M91 116 H109" stroke="#f3dca0" strokeWidth="1.4" />
          </g>
          <path
            d="M26 400 V150 C26 84 72 34 100 10 C128 34 174 84 174 150 V400"
            fill="none"
            stroke="url(#edgeG)"
            strokeWidth="2.4"
          />

          {/* minimal cross above the arch */}
          <g stroke="#f7e3a8" strokeWidth="2.2" strokeLinecap="round">
            <path d="M100 -22 V2" />
            <path d="M92 -14 H108" />
          </g>

          {/* dark architectural frame (near silhouette) */}
          <path
            fillRule="evenodd"
            fill="#040302"
            d="M-1200 -1200 H1400 V1400 H-1200 Z M12 1400 V150 C12 70 64 18 100 -8 C136 18 188 70 188 150 V1400 Z"
          />
          <path
            d="M12 440 V150 C12 70 64 18 100 -8 C136 18 188 70 188 150 V440"
            fill="none"
            stroke="url(#edgeG)"
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
          <path
            d="M2 440 V154 C2 62 60 8 100 -20 C140 8 198 62 198 154 V440"
            fill="none"
            stroke="#ecd08e"
            strokeOpacity="0.14"
            strokeWidth="0.8"
          />

          {/* volumetric shafts crossing the frame */}
          <g className="beam">
            {[
              [70, -150],
              [90, -40],
              [110, 70],
              [130, 190],
              [84, 300],
              [118, -250],
            ].map(([cx, dx], k) => (
              <polygon
                key={k}
                points={`${cx - 6},110 ${cx + 6},110 ${cx + dx + 70},720 ${cx + dx - 70},720`}
                fill="url(#lightFall)"
                opacity={0.3 + (k % 3) * 0.12}
              />
            ))}
          </g>
        </svg>

        {/* floor light pool */}
        <div className="absolute inset-x-0 bottom-[6svh] mx-auto h-[26svh] w-[90vw] max-w-[60rem] rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,206,130,0.3),transparent_68%)] blur-sm md:blur-xl" />
      </Fx>

      {/* soft light flood as the camera moves on toward the reception */}
      <Fx
        kf={[
          { at: 0, o: 0 },
          { at: 0.78, o: 0 },
          { at: 1, o: 0.7 },
        ]}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,232,185,0.95),rgba(255,200,120,0.5)_45%,transparent_78%)]"
      />

      {/* INFORMATION */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-t from-[#050302] via-[#050302]/88 to-transparent px-6 pb-[7svh] pt-[24svh] text-center">
        <Fx kf={reveal(0.2, 0.3)} className="flex flex-col items-center gap-3">
          <CrossMark size={22} />
          <p className="label">The Ceremony</p>
        </Fx>
        <Fx kf={reveal(0.27, 0.37)} className="mt-4">
          <h2 className="pearl-text font-serif text-[clamp(1.75rem,7.2vw,3.3rem)] font-light leading-[1.1] text-shadow-soft">
            St. George Church – Abu El-Naga
          </h2>
        </Fx>
        <Fx kf={reveal(0.33, 0.43)} className="mt-2">
          <p className="font-light uppercase tracking-[0.32em] text-[#f6efe2]/75 text-[0.78rem] pl-[0.32em]">Tanta, Egypt</p>
        </Fx>
        <Fx kf={reveal(0.39, 0.49)} className="mt-4">
          <p className="gold-text font-serif text-[clamp(2.3rem,10vw,3.8rem)] font-light italic leading-none">6:00 PM</p>
        </Fx>
        <Fx kf={reveal(0.45, 0.55)} className="mt-6" interactive>
          <a className="btn-gold" href={MAPS.church} target="_blank" rel="noopener noreferrer">
            View Location <Arrow />
          </a>
        </Fx>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
    </Scene>
  );
}
