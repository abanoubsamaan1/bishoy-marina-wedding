import { beat, Fx, Scene } from "../lib/scroll";
import { ROLE } from "../lib/photos";
import { Photo } from "../components/Photo";
import { Sparkles } from "../components/visuals";

export function Message() {
  return (
    <Scene id="message" height="230vh" fadeIn={0.18} fadeOut={0.2} focus={0.6} z={19}>
      <div className="absolute inset-0 bg-[#050403]" />

      {/* strongest photograph as the full-bleed background, slow push-in */}
      <Fx
        kf={[
          { at: 0, s: 1.02, y: 0 },
          { at: 1, s: 1.22, y: -2 },
        ]}
        origin="50% 26%"
        className="absolute inset-0"
      >
        <Photo i={ROLE.message} className="h-full w-full" pos="50% 18%" />
      </Fx>

      {/* warm grade + readability gradients (photo itself is untouched) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,4,3,0.97)_0%,rgba(6,4,3,0.82)_30%,rgba(6,4,3,0.2)_58%,rgba(6,4,3,0.35)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
      <div className="absolute inset-0 bg-[#b8873c]/10 mix-blend-soft-light" />
      <Sparkles count={12} seed={14} />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-7 pb-[8svh] text-center">
        <Fx kf={beat(0.22, 0.4)} className="mx-auto max-w-[44rem]">
          <p className="pearl-text font-serif text-[clamp(1.85rem,8vw,3.9rem)] font-light italic leading-[1.14] text-shadow-soft">
            Your presence is the most beautiful part of our celebration.
          </p>
        </Fx>
        <Fx kf={beat(0.36, 0.5)} className="mt-5">
          <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
        </Fx>
        <Fx kf={beat(0.42, 0.58)} className="mx-auto mt-5 max-w-[34rem]">
          <p className="font-serif text-[clamp(1.08rem,4.4vw,1.5rem)] leading-snug text-[#f6efe2]/85 text-shadow-soft">
            We would be honored to have you with us
            <br className="hidden sm:block" /> as we begin this new chapter together.
          </p>
        </Fx>
      </div>
    </Scene>
  );
}
