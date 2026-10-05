// The wedding music is the real audio file supplied in `public/audio`.
// It is played through a plain HTMLAudioElement (no Web Audio synthesis),
// loops continuously, and starts by itself: the first autoplay attempt happens
// on page load, and if the browser blocks audible autoplay it is retried on the
// visitor's very first interaction with the page (no button press required).

// Root-relative ("/audio/…"), never "/public/audio/…" and never document-relative
// ("audio/…") — it must resolve from the site root on any host, not from the URL
// of the page that happens to be showing it. Vite copies `public/` to the
// deployment root. `import.meta.env.BASE_URL` is deliberately not used: the
// single-file build sets it to "./", which is document-relative and 404s.
const SRC = "/audio/wedding-music.mp3";
const BASE_VOLUME = 0.55;

/** Any of these counts as "the visitor is here now" for the autoplay retry. */
const UNLOCK_EVENTS = ["pointerdown", "touchstart", "wheel", "keydown", "click"] as const;
const UNLOCK_OPTS: AddEventListenerOptions = { passive: true, capture: true };

export type MusicState = { playing: boolean; muted: boolean; ready: boolean };

class MusicEngine {
  private el: HTMLAudioElement | null = null;
  private muted = false;
  private userPaused = false;
  private unlocked = false;
  private duckUntil = 0;
  private duckAmount = 1;
  private duckTimer = 0;
  private rampRaf = 0;
  private listeners = new Set<() => void>();
  private snapshot: MusicState = { playing: false, muted: false, ready: false };
  private onUnlock = () => this.attempt();

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getState = () => this.snapshot;

  private emit() {
    const el = this.el;
    this.snapshot = {
      playing: !!el && !el.paused && !el.ended,
      muted: this.muted,
      ready: !!el && el.readyState >= 2,
    };
    this.listeners.forEach((l) => l());
  }

  private ensure(): HTMLAudioElement | null {
    if (this.el || typeof window === "undefined" || typeof Audio === "undefined") return this.el;
    const el = new Audio();
    el.src = SRC;
    el.preload = "auto";
    el.autoplay = true;
    el.loop = true;
    el.volume = BASE_VOLUME;
    el.muted = false;

    const sync = () => this.emit();
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    el.addEventListener("ended", sync);
    el.addEventListener("canplay", sync);
    el.addEventListener("loadedmetadata", sync);
    el.addEventListener("volumechange", sync);
    el.addEventListener("error", sync);

    this.el = el;
    this.emit();
    return el;
  }

  /** Creates the single element and starts the music immediately — called once,
   *  at module evaluation, so playback begins at the earliest possible moment:
   *  PAGE OPENS → element created → load() → play() → music starts.
   *  Nothing waits for React, the hero, the loader, the opening animation,
   *  auto-scroll, Supabase, canplaythrough or any user interaction. */
  private boot() {
    const el = this.ensure();
    if (!el) return;
    this.armUnlock(); // first-interaction fallback, used ONLY if autoplay is blocked
    el.load();
    this.attempt(); // play() right away — audible, never muted to fake it
  }

  private armUnlock() {
    if (this.unlocked || typeof window === "undefined") return;
    this.unlocked = true;
    UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, this.onUnlock, UNLOCK_OPTS));
  }

  private disarmUnlock() {
    if (!this.unlocked) return;
    UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, this.onUnlock, UNLOCK_OPTS));
    this.unlocked = false;
  }

  /** Tries to start playback; safe to call at any time. */
  private attempt() {
    const el = this.ensure();
    if (!el) return;
    this.userPaused = false;
    void el
      .play()
      .then(() => {
        this.disarmUnlock();
        this.emit();
      })
      .catch(() => {
        // Blocked by the browser's autoplay policy — stay armed and wait for
        // the visitor's first interaction, then try again.
        this.armUnlock();
        this.emit();
      });
  }

  /** Called on page load: begin the music without asking anything of the visitor. */
  prime() {
    const el = this.ensure();
    if (!el) return;
    if (el.paused && !this.userPaused) this.attempt();
    this.armUnlock();
  }

  /** The invitation is opening — bring the music in at full level. */
  begin() {
    this.prime();
    this.duckAmount = 1;
    this.duckUntil = 0;
    this.applyGain();
  }

  toggle() {
    const el = this.ensure();
    if (!el) return;
    if (el.paused) {
      this.userPaused = false;
      this.attempt();
    } else {
      this.userPaused = true;
      this.disarmUnlock();
      el.pause();
      this.emit();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.applyGain();
    this.emit();
  }

  /** Gently lowers the music while something interactive is in use. */
  duck(ms = 2200, amount = 0.45) {
    if (this.userPaused) return;
    this.duckAmount = amount;
    this.duckUntil = performance.now() + ms;
    this.applyGain();
    window.clearTimeout(this.duckTimer);
    this.duckTimer = window.setTimeout(() => {
      this.duckAmount = 1;
      this.applyGain();
    }, ms + 40);
  }

  private targetVolume() {
    if (this.muted) return 0;
    if (this.userPaused) return 0;
    if (this.duckUntil > performance.now()) return BASE_VOLUME * this.duckAmount;
    return BASE_VOLUME;
  }

  private applyGain() {
    const el = this.el;
    if (!el) return;
    const target = this.targetVolume();
    if (Math.abs(el.volume - target) < 0.005) {
      el.volume = target;
      this.duckUntil = 0;
      return;
    }
    cancelAnimationFrame(this.rampRaf);
    const from = el.volume;
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / 320);
      el.volume = from + (target - from) * k;
      if (k < 1) this.rampRaf = requestAnimationFrame(step);
      else el.volume = target;
    };
    this.rampRaf = requestAnimationFrame(step);
  }

  /** Releases the element and every listener it owns. */
  dispose() {
    this.disarmUnlock();
    cancelAnimationFrame(this.rampRaf);
    window.clearTimeout(this.duckTimer);
    const el = this.el;
    this.el = null;
    el?.pause();
    this.listeners.clear();
  }

  constructor() {
    // The one and only audio element, created and started the moment this
    // module is evaluated — before React mounts anything.
    this.boot();
  }
}

// Starting playback here (module scope) is the earliest possible point: the
// music is requested and played during application startup, with the
// first-interaction fallback already armed.
export const music = new MusicEngine();
