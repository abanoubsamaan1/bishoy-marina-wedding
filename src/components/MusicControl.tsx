import { useSyncExternalStore } from "react";
import { music } from "../lib/audio";
import { cn } from "../utils/cn";

export function MusicControl({ visible }: { visible: boolean }) {
  const st = useSyncExternalStore(music.subscribe, music.getState);
  const active = st.playing && !st.muted;
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[50] flex flex-col items-center gap-2 transition-opacity duration-[1800ms] md:bottom-6 md:right-6",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        onClick={() => music.toggleMute()}
        aria-label={st.muted ? "Unmute music" : "Mute music"}
        className="glass grid h-10 w-10 place-items-center rounded-full text-[#ecd9ac] transition hover:text-white"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
          {st.muted ? (
            <path d="M16 9.5l5 5M21 9.5l-5 5" />
          ) : (
            <>
              <path d="M15.5 9a4 4 0 010 6" />
              <path d="M18 6.5a7.5 7.5 0 010 11" />
            </>
          )}
        </svg>
      </button>
      <button
        onClick={() => music.toggle()}
        aria-label={st.playing ? "Pause music" : "Play music"}
        className="glass relative grid h-12 w-12 place-items-center rounded-full"
      >
        {st.playing ? (
          <span className={cn("eq flex h-4 items-end gap-[3px]", !active && "off")}>
            <i style={{ animationDelay: "0s" }} />
            <i style={{ animationDelay: "-.4s" }} />
            <i style={{ animationDelay: "-.8s" }} />
            <i style={{ animationDelay: "-.2s" }} />
          </span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="#ecd9ac" aria-hidden>
            <path d="M3 1.5v11l9-5.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
