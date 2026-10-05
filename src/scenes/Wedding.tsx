import { Fx, Scene } from "../lib/scroll";
import { ROLE } from "../lib/photos";
import { Photo } from "../components/Photo";
import { Bokeh, Rays, Sparkles } from "../components/visuals";

export function Wedding() {
  return (
    <Scene id="wedding" height="250vh" fadeIn={0.16} fadeOut={0.16} focus={0.5} z={14}>
      <div className="absolute inset-0 bg-[#060403]" />
      <Fx
        kf={[
          { at: 0, s: 1.25 },
          { at: 1, s: 1 },
        ]}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(170,120,58,0.32),transparent_62%)]" />
        <Bokeh count={9} seed={44} className="opacity-80" />
      </Fx>
      <Rays className="inset-x-0 top-0 h-[70svh] opacity-30" />
      <Sparkles count={12} seed={12} />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2.4svh] md:flex-row md:gap-[7vw]" style={{ perspective: 1400 }}>
        {/* title */}
        <div className="order-1 text-center md:order-2 md:w-[34vw] md:text-left">
          <Fx
            kf={[
              { at: 0, o: 0, y: 4, b: 10 },
              { at: 0.14, o: 0, y: 4, b: 10 },
              { at: 0.3, o: 1, y: 0, b: 0 },
            ]}
          >
            <p className="label md:!pl-0">Our Wedding</p>
            <div className="mx-auto mt-3 h-px w-14 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent md:mx-0 md:w-20 md:bg-gradient-to-r md:from-[#d9b873] md:via-[#d9b873]/40 md:to-transparent" />
          </Fx>
          <div className="hidden md:block">
            <Fx
              kf={[
                { at: 0, o: 0, y: 6, b: 10 },
                { at: 0.22, o: 0, y: 6, b: 10 },
                { at: 0.4, o: 1, y: 0, b: 0 },
              ]}
            >
              <h2 className="pearl-text mt-6 font-serif text-[clamp(3rem,5.4vw,5.4rem)] font-light leading-[1]">
                Bishoy
                <br />
                <span className="gold-text italic">&amp;</span> Marina
              </h2>
              <p className="mt-5 font-serif text-2xl italic text-[#ecd9ac]/85">October 18, 2026</p>
            </Fx>
          </div>
        </div>

        {/* 3D photograph composition */}
        <div className="order-2 md:order-1">
          <Fx
            kf={[
              { at: 0, ry: -26, rx: 6, z: -300, o: 0, y: 6 },
              { at: 0.2, ry: -20, rx: 4, z: -120, o: 1, y: 2 },
              { at: 0.5, ry: 0, rx: 0, z: 0, o: 1, y: 0 },
              { at: 0.8, ry: 14, rx: -3, z: 40, o: 1, y: -1 },
              { at: 1, ry: 24, rx: -5, z: -200, o: 0, y: -4 },
            ]}
            tilt={6}
            preserve
            className="relative aspect-[3/4] h-[min(56svh,118vw)] md:h-[min(68svh,48vw)]"
            style={{ maxWidth: "88vw" }}
          >
            {/* back gold plate */}
            <Fx kf={[{ at: 0, z: -70 }]} depth={-22} className="absolute -inset-[4%]">
              <div className="h-full w-full rounded-[10px] border border-[#ecd08e]/50 bg-gradient-to-br from-[#ecd08e]/10 to-transparent shadow-[0_0_40px_rgba(217,184,115,0.15)] md:shadow-[0_0_60px_rgba(217,184,115,0.25)]" />
            </Fx>
            {/* photo */}
            <div className="absolute inset-0 overflow-hidden rounded-[8px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] md:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.95)] ring-1 ring-[#ecd9ac]/25">
              <Photo i={ROLE.wedding} className="h-full w-full" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_62%,rgba(6,4,3,0.75)_100%)]" />
              <div className="sheen-sweep" />
            </div>

            {/* front glass panel (mobile: holds the names) */}
            <Fx
              kf={[{ at: 0, z: 60 }]}
              depth={16}
              className="absolute inset-x-[-5%] bottom-[-5%] md:hidden"
            >
              <div className="glass rounded-xl px-4 py-3 text-center">
                <p className="pearl-text font-serif text-[clamp(1.6rem,7.4vw,2.3rem)] font-light leading-none">
                  Bishoy <span className="gold-text italic">&amp;</span> Marina
                </p>
                <p className="mt-2 font-serif text-[1.05rem] italic text-[#ecd9ac]/85">October 18, 2026</p>
              </div>
            </Fx>

            {/* floor reflection */}
            <div
              className="pointer-events-none absolute left-0 top-full w-full overflow-hidden opacity-35"
              style={{
                height: "26%",
                marginTop: "7%",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
              }}
            >
              <div style={{ height: "385%", transform: "scaleY(-1)", transformOrigin: "50% 50%" }}>
                <div className="h-full w-full" style={{ transform: "translateY(0)" }}>
                  <Photo i={ROLE.wedding} className="h-full w-full" />
                </div>
              </div>
            </div>
          </Fx>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.65)_100%)]" />
    </Scene>
  );
}
