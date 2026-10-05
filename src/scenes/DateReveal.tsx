import { Fx, Scene, type KF } from "../lib/scroll";
import { Bokeh, Gold3D, Rays, Sparkles } from "../components/visuals";

/** appear between a..b, hold, vanish between c..d (pushing "through" the camera) */
const word = (a: number, b: number, c?: number, d?: number): KF[] => {
  const k: KF[] = [
    { at: 0, o: 0, s: 0.5, b: 14, y: 2 },
    { at: a, o: 0, s: 0.5, b: 14, y: 2 },
    { at: b, o: 1, s: 1, b: 0, y: 0 },
  ];
  if (c !== undefined && d !== undefined) {
    k.push({ at: c, o: 1, s: 1, b: 0, y: 0 });
    k.push({ at: d, o: 0, s: 1.7, b: 12, y: -2 });
  }
  return k;
};
const rot = (a: number, b: number, d: number): KF[] => [
  { at: 0, ry: -42, rx: 12 },
  { at: a, ry: -42, rx: 12 },
  { at: b, ry: 0, rx: 0 },
  { at: Math.max(d, b + 0.01), ry: 22, rx: -6 },
];

export function DateReveal() {
  return (
    <Scene id="date" height="340vh" fadeIn={0.12} fadeOut={0.1} focus={0.78} z={12}>
      {/* darker, cinematic backdrop */}
      <div className="absolute inset-0 bg-[#040302]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,rgba(120,84,36,0.35),transparent_60%)]" />
      <Rays className="inset-x-0 top-0 h-[90svh] opacity-50" />
      <Bokeh count={8} seed={21} min={30} max={110} className="opacity-70" />

      {/* stacked words — each one replaces the last in the same spot of space */}
      <div className="absolute inset-x-0 top-[12svh] grid h-[42svh] place-items-center">
        <Sparkles count={18} seed={5} className="opacity-90" />

        <Gold3D
          text="18"
          layers={14}
          step={1.7}
          kf={word(0.1, 0.22, 0.29, 0.38)}
          rot={rot(0.1, 0.22, 0.38)}
          className="font-serif text-[clamp(9.5rem,54vw,22rem)] font-medium"
        />
        <Gold3D
          text="OCTOBER"
          layers={8}
          step={1.4}
          kf={word(0.31, 0.4, 0.47, 0.54)}
          rot={rot(0.31, 0.4, 0.54)}
          className="font-serif text-[clamp(2.8rem,15vw,9.5rem)] font-medium tracking-[0.05em]"
        />
        <Gold3D
          text="2026"
          layers={8}
          step={1.4}
          kf={word(0.47, 0.55, 0.61, 0.68)}
          rot={rot(0.47, 0.55, 0.68)}
          className="font-serif text-[clamp(4.6rem,28vw,15rem)] font-medium tracking-[0.03em]"
        />
        <Gold3D
          text="SUNDAY"
          layers={7}
          step={1.3}
          kf={word(0.61, 0.69)}
          rot={rot(0.61, 0.69, 1.2)}
          className="font-serif text-[clamp(2.6rem,14vw,8.5rem)] font-medium tracking-[0.12em]"
        />
      </div>

      {/* Save the Date */}
      <Fx
        kf={[
          { at: 0, o: 0, y: 6, b: 10 },
          { at: 0.74, o: 0, y: 6, b: 10 },
          { at: 0.82, o: 1, y: 0, b: 0 },
        ]}
        className="absolute inset-x-0 top-[60svh] flex flex-col items-center gap-3 px-6 text-center"
      >
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
        <p className="gold-text font-serif text-[clamp(2.3rem,10.5vw,4.4rem)] font-light italic leading-none">
          Save the Date
        </p>
        <p className="label !tracking-[0.3em] !text-[#ecd9ac]/70">Sunday · October 18 · 2026</p>
      </Fx>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.65)_100%)]" />
    </Scene>
  );
}
