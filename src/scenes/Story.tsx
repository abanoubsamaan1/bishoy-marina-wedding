import { beat, Fx, Scene, type KF } from "../lib/scroll";
import { Photo } from "../components/Photo";
import { Bokeh, Sparkles } from "../components/visuals";

type Flyer = { i: number; t: number; x: number; y: number; rz: number };
const FLYERS: Flyer[] = [
  { i: 0, t: -0.02, x: -16, y: -12, rz: -4 },
  { i: 1, t: 0.09, x: 17, y: -15, rz: 3 },
  { i: 3, t: 0.21, x: -17, y: -10, rz: -2 },
  { i: 4, t: 0.33, x: 18, y: -14, rz: 4 },
  { i: 2, t: 0.46, x: -15, y: -13, rz: -3 },
  { i: 5, t: 0.58, x: 16, y: -11, rz: 2 },
];

/** photograph flies from deep background, past the camera */
const fly = (f: Flyer): KF[] => [
  { at: f.t, z: -1700, o: 0, x: f.x, y: f.y, rz: f.rz },
  { at: f.t + 0.04, z: -1450, o: 1 },
  { at: f.t + 0.16, z: 0, o: 1 },
  { at: f.t + 0.185, z: 240, o: 0.6 },
  { at: f.t + 0.21, z: 520, o: 0 },
];

export function Story() {
  return (
    <Scene id="story" height="560vh" fadeIn={0.08} fadeOut={0.1} focus={0.12} z={17}>
      <div className="absolute inset-0 bg-[#050403]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_36%,rgba(130,92,42,0.3),transparent_62%)]" />
      <Bokeh count={8} seed={77} className="opacity-60" />
      <Sparkles count={14} seed={31} />

      {/* camera flies through floating photographs */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: 900, perspectiveOrigin: "50% 38%" }}
      >
        {FLYERS.map((f) => (
          <Fx key={f.i} kf={fly(f)} linear className="absolute left-1/2 top-1/2 -ml-[14.3svh] -mt-[19svh] h-[38svh] w-[28.5svh]">
            <div className="relative h-full w-full overflow-hidden rounded-[6px] shadow-[0_20px_50px_-8px_rgba(0,0,0,0.7)] md:shadow-[0_30px_80px_-10px_rgba(0,0,0,0.95)] ring-1 ring-[#ecd9ac]/30">
              <Photo i={f.i} className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
            </div>
          </Fx>
        ))}
      </div>

      {/* bottom readability gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40svh] bg-gradient-to-t from-[#050403] via-[#050403]/75 to-transparent" />

      {/* label */}
      <Fx kf={beat(0.001, 0.06, 0.18, 0.24)} className="absolute inset-x-0 top-[9svh] text-center">
        <p className="label">Our Story</p>
        <div className="mx-auto mt-3 h-px w-14 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
      </Fx>

      {/* beats */}
      <div className="absolute inset-x-0 bottom-[9svh] grid h-[22svh] place-items-center px-6 text-center">
        <Fx kf={beat(0.07, 0.14, 0.23, 0.27)} className="col-start-1 row-start-1">
          <p className="pearl-text font-serif text-[clamp(1.9rem,8.4vw,4rem)] font-light leading-[1.12] text-shadow-soft">
            Two people.
            <br />
            <span className="gold-text italic">One beautiful story.</span>
          </p>
        </Fx>
        <Fx kf={beat(0.28, 0.34, 0.42, 0.46)} className="col-start-1 row-start-1">
          <p className="pearl-text font-serif text-[clamp(2.1rem,9.4vw,4.4rem)] font-light italic leading-[1.1] text-shadow-soft">
            Countless memories.
          </p>
        </Fx>
        <Fx kf={beat(0.48, 0.54, 0.58, 0.62)} className="col-start-1 row-start-1">
          <p className="gold-text font-serif text-[clamp(2.4rem,11vw,5rem)] font-light italic leading-none">And now...</p>
        </Fx>
        <Fx kf={beat(0.63, 0.69, 0.76, 0.81)} className="col-start-1 row-start-1">
          <p className="pearl-text font-serif text-[clamp(2rem,9vw,4.2rem)] font-light leading-[1.1] text-shadow-soft">
            A new chapter <span className="gold-text italic">begins.</span>
          </p>
        </Fx>
      </div>

      {/* light pulse on "And now..." */}
      <Fx
        kf={[
          { at: 0, o: 0 },
          { at: 0.5, o: 0 },
          { at: 0.56, o: 0.35 },
          { at: 0.64, o: 0 },
        ]}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(255,220,150,0.8),transparent_60%)]"
      />

      {/* finale of the story */}
      <div className="absolute inset-0 grid place-items-center px-6 text-center">
        <Fx kf={beat(0.83, 0.9)}>
          <p className="pearl-text font-serif text-[clamp(2.8rem,13vw,6.4rem)] font-light leading-[1] text-shadow-soft">
            Bishoy <span className="gold-text italic">&amp;</span> Marina
          </p>
        </Fx>
      </div>
    </Scene>
  );
}
