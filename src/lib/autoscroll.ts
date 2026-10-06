// Slow, cinematic automatic scrolling through the whole invitation.
//
// The visitor always wins: any manual scroll (wheel, trackpad, touch, swipe,
// scrollbar drag, keyboard) immediately pauses the drift, and the drift only
// comes back after a short period of stillness. Overlays, forms and a hidden
// tab suspend it entirely.

const IDLE_RESUME_MS = 2500; // ~2–3s of stillness before the film drifts on
const EASE_IN_MS = 1800; // gentle acceleration when the drift starts
const END_FADE_VH = 0.7; // soften the approach to the very end of the page
const MIN_SPEED_VH = 0.20; // mobile: viewport heights per second (faster)
const MAX_SPEED_VH = 0.25; // desktop: viewport heights per second (faster)

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

const INTERACTIVE = "a,button,input,textarea,select,option,label,[role='button'],[contenteditable='true']";

export type AutoScrollState = { drifting: boolean; held: boolean; atEnd: boolean };

class AutoScrollEngine {
  private running = false;
  private raf = 0;
  private last = 0;
  private pos = 0;
  private written = 0;
  private startedAt = 0;
  private userHold = false; // paused by a manual interaction
  private holds = new Set<string>(); // overlays / form focus
  private idleTimer = 0;
  private onVisibility = () => {
    if (document.hidden) this.stopLoop();
    else if (this.running) this.startLoop();
  };
  private onKey = (e: KeyboardEvent) => {
    if (SCROLL_KEYS.has(e.key)) this.interrupt();
  };
  private onPointer = (e: Event) => {
    const t = e.target as HTMLElement | null;
    if (t?.closest?.(INTERACTIVE)) return; // never fight a control being used
    this.interrupt();
  };

  private listeners = new Set<() => void>();
  private snapshot: AutoScrollState = { drifting: false, held: false, atEnd: false };

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getState = () => this.snapshot;

  private emit(patch?: Partial<AutoScrollState>) {
    const next = { ...this.snapshot, ...patch };
    if (
      next.drifting === this.snapshot.drifting &&
      next.held === this.snapshot.held &&
      next.atEnd === this.snapshot.atEnd
    )
      return;
    this.snapshot = next;
    this.listeners.forEach((l) => l());
  }

  private get speed() {
    const vh = window.innerHeight || 1;
    const w = window.innerWidth || 1;
    // a phone gets a slightly gentler drift so nothing whips past
    const perVh = w < 640 ? MIN_SPEED_VH : MAX_SPEED_VH;
    return vh * perVh;
  }

  private get maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  /** Starts the drift and installs every listener it needs. */
  start() {
    if (typeof window === "undefined" || this.running) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    this.running = true;
    this.userHold = false;
    this.pos = window.scrollY;
    this.written = this.pos;
    this.startedAt = performance.now();
    this.last = this.startedAt;

    window.addEventListener("wheel", this.interrupt, { passive: true });
    window.addEventListener("touchstart", this.interrupt, { passive: true, capture: true });
    window.addEventListener("touchmove", this.interrupt, { passive: true, capture: true });
    window.addEventListener("keydown", this.onKey, { passive: true, capture: true });
    window.addEventListener("pointerdown", this.onPointer, { passive: true, capture: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("resize", this.onResize);

    this.emit({ atEnd: this.pos >= this.maxScroll - 2, held: false });
    this.startLoop();
  }

  private onResize = () => {
    if (!this.userHold) this.pos = window.scrollY;
  };

  /** Stops the drift completely and removes every listener and timer. */
  stop() {
    if (!this.running) return;
    this.running = false;
    this.stopLoop();
    window.clearTimeout(this.idleTimer);
    window.removeEventListener("wheel", this.interrupt);
    window.removeEventListener("touchstart", this.interrupt, { capture: true } as EventListenerOptions);
    window.removeEventListener("touchmove", this.interrupt, { capture: true } as EventListenerOptions);
    window.removeEventListener("keydown", this.onKey, { capture: true } as EventListenerOptions);
    window.removeEventListener("pointerdown", this.onPointer, { capture: true } as EventListenerOptions);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("resize", this.onResize);
    this.emit({ drifting: false });
  }

  private startLoop() {
    if (this.raf) return;
    this.last = performance.now();
    const tick = (now: number) => {
      this.raf = requestAnimationFrame(tick);
      this.step(now);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private stopLoop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private step(now: number) {
    const dt = Math.min(0.06, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    const y = window.scrollY;

    // a scroll we did not perform ourselves — scrollbar drag, momentum, a nav jump
    if (Math.abs(y - this.written) > 2) {
      this.pos = y;
      this.interrupt();
      return;
    }

    const drifting = !this.userHold && this.holds.size === 0;
    if (drifting) {
      const max = this.maxScroll;
      if (this.pos >= max - 0.5) {
        this.emit({ drifting: false, atEnd: true });
        return;
      }
      // ease in at the start, ease out at the very end of the film
      const rise = Math.min(1, (now - this.startedAt) / EASE_IN_MS);
      const easeIn = rise * rise * (3 - 2 * rise);
      const left = max - this.pos;
      const tail = Math.min(1, left / (window.innerHeight * END_FADE_VH));
      const easeOut = tail * tail * (3 - 2 * tail);
      this.pos = Math.min(max, this.pos + this.speed * dt * easeIn * Math.max(0.12, easeOut));
      window.scrollTo(0, this.pos);
      this.written = window.scrollY;
      if (this.pos >= max - 0.5) {
        this.emit({ atEnd: true });
        window.clearTimeout(this.idleTimer);
      }
    } else {
      this.pos = y;
    }
    this.emit({ drifting, held: this.holds.size > 0 });
  }

  /** A manual interaction happened: hand control straight to the visitor. */
  interrupt = () => {
    this.pos = window.scrollY;
    this.written = this.pos;
    this.userHold = true;
    this.emit({ drifting: false });
    window.clearTimeout(this.idleTimer);
    this.idleTimer = window.setTimeout(() => this.resume(), IDLE_RESUME_MS);
  };

  /** Gives the drift back once the page has been still for a moment. */
  private resume() {
    if (!this.running) return;
    this.pos = window.scrollY;
    this.written = this.pos;
    this.userHold = false;
    this.startedAt = performance.now() - EASE_IN_MS; // continue at a steady pace
    if (this.pos >= this.maxScroll - 2) {
      this.emit({ atEnd: true });
      return;
    }
    this.emit({ atEnd: false });
  }

  /** Suspends the drift while an overlay, lightbox or form has focus. */
  hold(reason: string) {
    this.holds.add(reason);
    this.emit({ held: true, drifting: false });
  }

  release(reason: string) {
    this.holds.delete(reason);
    if (this.holds.size === 0) this.interrupt(); // normal inactivity delay before drifting on
  }
}

export const autoScroll = new AutoScrollEngine();
