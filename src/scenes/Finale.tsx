import { beat, Fx, Scene } from "../lib/scroll";
import { ParticleMonogram } from "../components/ParticleMonogram";

export function Finale() {
  return (
    <Scene id="finale" last height="500vh" fadeIn={0.1} fadeOut={0.09} focus={0.97} z={20}>
      {/* fade everything into darkness */}
      <div className="absolute inset-0 bg-[#020101]" />

      {/* glowing cross / light element */}
      <Fx
        kf={[
          { at: 0, o: 0, s: 0.7 },
          { at: 0.2, o: 0, s: 0.7 },
          { at: 0.5, o: 1, s: 1 },
          { at: 1, o: 1, s: 1.12 },
        ]}
        className="absolute inset-0 grid place-items-center"
      >
        <div className="relative h-[92svh] w-[92vw] max-w-[60rem]" style={{ animation: "crossPulse 5s ease-in-out infinite alternate" }}>
          <div className="absolute left-1/2 top-[6%] h-[88%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#f3dca0]/60 to-transparent shadow-[0_0_24px_6px_rgba(255,214,140,0.22)]" />
          <div className="absolute left-[8%] top-[34%] h-px w-[84%] bg-gradient-to-r from-transparent via-[#f3dca0]/55 to-transparent shadow-[0_0_24px_6px_rgba(255,214,140,0.2)]" />
          <div className="absolute left-1/2 top-[34%] h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,214,140,0.22),transparent_68%)]" />
        </div>
      </Fx>

      {/* particles gather into the monogram, then rise to make room */}
      <Fx
        kf={[
          { at: 0, y: 0, s: 1 },
          { at: 0.4, y: 0, s: 1 },
          { at: 0.52, y: -25, s: 0.55 },
          { at: 1, y: -25, s: 0.55 },
        ]}
        className="absolute inset-0"
      >
        <ParticleMonogram text="B & M" from={0.08} to={0.34} />
      </Fx>

      {/* names */}
      <div className="absolute inset-0 grid place-items-center px-6 text-center">
        <Fx kf={beat(0.44, 0.52, 0.6, 0.66)} className="col-start-1 row-start-1 mt-[14svh]">
          <p className="pearl-text font-serif text-[clamp(2.7rem,13vw,6.4rem)] font-light leading-[0.98] text-shadow-soft">
            Bishoy
          </p>
          <p className="gold-text my-1 font-serif text-[clamp(1.6rem,6.4vw,2.8rem)] italic">&amp;</p>
          <p className="pearl-text font-serif text-[clamp(2.7rem,13vw,6.4rem)] font-light leading-[0.98] text-shadow-soft">
            Marina
          </p>
        </Fx>

        {/* date + invitation line */}
        <Fx kf={beat(0.66, 0.73, 0.83, 0.88)} className="col-start-1 row-start-1 mt-[14svh]">
          <p className="gold-text pl-[0.4em] font-serif text-[clamp(1.6rem,7vw,3rem)] font-light uppercase tracking-[0.4em]">
            18 October 2026
          </p>
          <div className="mx-auto my-5 h-px w-24 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
          <p className="pearl-text font-serif text-[clamp(2rem,9vw,4.2rem)] font-light italic leading-[1.05]">
            See You At Our Wedding
          </p>
        </Fx>

        {/* sign-off */}
        <Fx kf={beat(0.9, 0.96)} className="col-start-1 row-start-1 mt-[14svh]">
          <p className="font-serif text-[clamp(1.3rem,5.4vw,2rem)] italic text-[#ecd9ac]/85">With Love,</p>
          <p className="pearl-text mt-2 font-serif text-[clamp(2.4rem,11vw,5rem)] font-light leading-none text-shadow-soft">
            Bishoy <span className="gold-text italic">&amp;</span> Marina
          </p>
        </Fx>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)]" />
    </Scene>
  );
}
