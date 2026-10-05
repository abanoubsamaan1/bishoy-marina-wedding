import { Fx, Scene, type CSSProps } from "../lib/scroll";
import { ROLE } from "../lib/photos";
import { Photo } from "../components/Photo";
import { ArchTexture, Bokeh, Rays } from "../components/visuals";

const d = (s: string) => ({ "--d": s }) as CSSProps;

export function Hero() {
  return (
    <Scene id="home" first height="210vh" fadeIn={0} fadeOut={0.24} focus={0} z={10} lazyMount={false}>
      {/* BACKGROUND — architectural texture, warm light, bokeh */}
      <div className="absolute inset-0 bg-[#070504]" />
      <Fx
        kf={[
          { at: 0, s: 1 },
          { at: 1, s: 1.4 },
        ]}
        className="absolute inset-0"
        origin="50% 38%"
      >
        <div className="rv-bg absolute inset-0">
          <ArchTexture className="opacity-[0.3] blur-[1px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(236,190,110,0.34),transparent_62%)]" />
          <Bokeh count={10} seed={7} min={40} max={170} />
          <div className="light-leak inset-0" />
        </div>
      </Fx>
      <Rays className="inset-x-0 top-0 h-[75svh] opacity-40" />

      {/* MIDDLE — the couple, in a floating arched frame */}
      <div className="absolute inset-0 flex flex-col items-center" style={{ perspective: 1300 }}>
        <Fx
          kf={[
            { at: 0, s: 1, y: 0, o: 1 },
            { at: 0.5, s: 1.1, y: -2, o: 1 },
            { at: 1, s: 1.32, y: -8, o: 0 },
          ]}
          tilt={5}
          preserve
          className="relative mt-[8svh] h-[min(97vw,54svh)] w-[min(76vw,42svh)]"
        >
          {/* glow behind */}
          <div className="absolute -inset-[14%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(236,190,110,0.36),transparent_66%)] blur-sm md:blur-xl" />
          {/* gold outline — sits behind, moves with inverse parallax */}
          <Fx kf={[{ at: 0 }]} depth={-18} className="absolute -inset-[5%]">
            <div className="h-full w-full rounded-t-full border border-[#ecd08e]/45 shadow-[0_0_40px_rgba(217,184,115,0.25)]" />
          </Fx>
          <Fx kf={[{ at: 0 }]} depth={-30} className="absolute -inset-[10%]">
            <div className="h-full w-full rounded-t-full border border-[#ecd08e]/18" />
          </Fx>
          {/* photograph */}
          <Fx kf={[{ at: 0 }]} depth={10} className="absolute inset-0">
            <div className="rv-photo h-full w-full" style={d("0.7s")}>
              <div
                className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[18px]"
                style={{
                  WebkitMaskImage: "linear-gradient(to bottom, #000 60%, transparent 99%)",
                  maskImage: "linear-gradient(to bottom, #000 60%, transparent 99%)",
                }}
              >
                <Photo i={ROLE.hero} eager className="h-full w-full" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,5,3,0.0)_55%,rgba(8,5,3,0.55)_100%)]" />
                <div className="sheen-sweep" />
              </div>
            </div>
          </Fx>
          {/* glass edge highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-t-full ring-1 ring-inset ring-white/15" />
        </Fx>

        {/* NAMES */}
        <Fx
          kf={[
            { at: 0, y: 0, o: 1, b: 0 },
            { at: 0.42, y: -3, o: 1 },
            { at: 0.78, y: -12, o: 0, b: 8 },
          ]}
          className="relative z-10 -mt-[12.5svh] text-center"
        >
          <h1 className="font-serif font-light leading-[0.92] text-shadow-soft">
            <span
              className="rv pearl-text block text-[clamp(2.7rem,13vw,6.4rem)] tracking-[0.01em]"
              style={d("2.2s")}
            >
              Bishoy Yasser
            </span>
            <span
              className="rv gold-text my-[0.6svh] block text-[clamp(1.7rem,6.4vw,2.8rem)] italic"
              style={d("2.7s")}
            >
              &amp;
            </span>
            <span
              className="rv pearl-text block text-[clamp(2.7rem,13vw,6.4rem)] tracking-[0.01em]"
              style={d("3.1s")}
            >
              Marina Rizk
            </span>
          </h1>
        </Fx>

        <Fx
          kf={[
            { at: 0, y: 0, o: 1 },
            { at: 0.36, y: -2, o: 1 },
            { at: 0.66, y: -10, o: 0, b: 6 },
          ]}
          className="relative z-10 mt-[2.6svh] px-6 text-center"
        >
          <p
            className="rv font-serif text-[clamp(1.02rem,4.3vw,1.4rem)] italic leading-snug text-[#f6efe2]/85 text-shadow-soft"
            style={d("4s")}
          >
            Together with their families,
            <br />
            invite you to celebrate their wedding.
          </p>
        </Fx>
      </div>

      {/* scroll cue */}
      <Fx
        kf={[
          { at: 0, o: 1 },
          { at: 0.12, o: 0 },
        ]}
        className="absolute inset-x-0 bottom-[3.2svh] flex flex-col items-center gap-2"
      >
        <span className="rv label !text-[0.58rem]" style={d("5.2s")}>
          Scroll
        </span>
        <span className="rv relative block h-9 w-px overflow-hidden bg-[#d9b873]/20" style={d("5.2s")}>
          <span
            className="absolute inset-0 bg-[#ecd08e]"
            style={{ animation: "scrollCue 2.4s ease-in-out infinite" }}
          />
        </span>
      </Fx>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
    </Scene>
  );
}
