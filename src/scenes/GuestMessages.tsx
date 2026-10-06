import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { registry, startEngine } from "../lib/scroll";
import { autoScroll } from "../lib/autoscroll";
import {
  MESSAGE_MAX,
  NAME_MAX,
  addMessage,
  fetchMessages,
  subscribeMessages,
  usingFallback,
  type GuestMessage,
} from "../lib/guestMessages";
import { Bokeh, Rays, Sparkles } from "../components/visuals";
import { cn } from "../utils/cn";

type Status = "loading" | "ready" | "error";

const stamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const clock = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

function Card({ m, fresh }: { m: GuestMessage; fresh: boolean }) {
  return (
    <article className={cn("msg-card", fresh && "msg-fresh")}>
      <span className="msg-corner" aria-hidden />
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="gold-text font-serif text-[clamp(1.05rem,4.4vw,1.3rem)] font-medium italic leading-tight">
          {m.name}
        </h3>
        <time
          dateTime={m.created_at}
          className="shrink-0 text-[0.58rem] font-light uppercase tracking-[0.22em] text-[#ecd9ac]/45"
        >
          {stamp(m.created_at)}
        </time>
      </header>
      <span className="mx-auto mt-3 block h-px w-10 bg-gradient-to-r from-transparent via-[#d9b873]/60 to-transparent" />
      <p className="mt-3 font-serif text-[clamp(0.98rem,3.7vw,1.12rem)] italic leading-[1.6] text-[#f6efe2]/85">
        {m.message}
      </p>
      <span className="mt-3 block text-[0.55rem] font-light uppercase tracking-[0.3em] text-[#ecd9ac]/35">
        {clock(m.created_at)}
      </span>
    </article>
  );
}

export function GuestMessages() {
  const sec = useRef<HTMLElement>(null);
  const [list, setList] = useState<GuestMessage[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState(false);
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState(false);
  const lock = useRef(0);

  /* ---- load + live updates ---- */
  useEffect(() => {
    let alive = true;
    fetchMessages()
      .then((rows) => {
        if (!alive) return;
        setList(rows);
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));
    const off = subscribeMessages((m) => {
      setList((prev) => (prev.some((p) => p.id === m.id) ? prev : [m, ...prev].slice(0, 60)));
      setFresh((prev) => new Set(prev).add(m.id));
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  useEffect(() => {
    if (fresh.size === 0) return;
    const t = window.setTimeout(() => setFresh(new Set()), 3000);
    return () => window.clearTimeout(t);
  }, [fresh]);

  /* ---- anchor for the section navigation ---- */
  useEffect(() => {
    startEngine();
    registry.set("messages", {
      opacity: () => {
        const r = sec.current?.getBoundingClientRect();
        if (!r) return 0;
        const mid = window.innerHeight / 2;
        return r.top <= mid && r.bottom >= mid ? 1 : 0;
      },
      target: () => {
        const r = sec.current!.getBoundingClientRect();
        return r.top + window.scrollY + window.innerHeight * 0.1;
      },
    });
    return () => {
      registry.delete("messages");
    };
  }, []);

  /* ---- entrance animations ---- */
  useEffect(() => {
    const root = sec.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [list.length, status]);

  /* ---- submission ---- */
  const nLen = name.length;
  const mLen = message.length;
  const nameBad = touched && !name.trim();
  const msgBad = touched && !message.trim();
  const nameLong = nLen > NAME_MAX;
  const msgLong = mLen > MESSAGE_MAX;

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setTouched(true);
      const cleanName = name.replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
      const cleanMsg = message.replace(/\s+/g, " ").trim().slice(0, MESSAGE_MAX);
      if (!cleanName || !cleanMsg) {
        setError("Please write your name and a short message.");
        return;
      }
      if (sending || Date.now() - lock.current < 1200) return; // no double submits
      lock.current = Date.now();
      setSending(true);
      setError(null);
      try {
        const saved = await addMessage(cleanName, cleanMsg);
        setList((prev) => (prev.some((p) => p.id === saved.id) ? prev : [saved, ...prev].slice(0, 60)));
        setFresh((prev) => new Set(prev).add(saved.id));
        setName("");
        setMessage("");
        setTouched(false);
        setNotice(true);
        window.setTimeout(() => setNotice(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Your message could not be saved. Please try again.");
      } finally {
        setSending(false);
      }
    },
    [name, message, sending]
  );

  return (
    <section
      id="messages"
      ref={sec}
      className="relative z-[21]"
      style={{
        background:
          "linear-gradient(to bottom, rgba(4,3,2,0) 0, #040302 20vh, #040302 80%, rgba(4,3,2,0) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <Bokeh count={9} seed={128} className="opacity-45" />
        <Rays className="inset-x-0 top-[6vh] h-[50vh] opacity-20" />
        <Sparkles count={12} seed={63} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(120,84,36,0.26),transparent_64%)]" />
      </div>

      <div className="relative mx-auto max-w-[1080px] px-4 pb-[16svh] pt-[22svh] md:px-8">
        {/* heading */}
        <div data-rv className="rv-item text-center">
          <p className="label">Guest Book</p>
          <div className="mx-auto mt-3 h-px w-14 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
          <h2 className="pearl-text mx-auto mt-5 max-w-[22ch] font-serif text-[clamp(2rem,7.6vw,3.9rem)] font-light italic leading-[1.12] text-shadow-soft">
            Messages From Our Guests
          </h2>
          <p className="mx-auto mt-4 max-w-[38ch] font-serif text-[clamp(1rem,3.8vw,1.18rem)] italic leading-snug text-[#f6efe2]/70">
            Leave a little note for Bishoy &amp; Marina — it will appear here for everyone.
          </p>
        </div>

        {/* form */}
        <div
          data-rv
          className="rv-item glass mx-auto mt-[7svh] w-full max-w-[42rem] rounded-[14px] p-[clamp(1.1rem,4.4vw,2.1rem)]"
          style={{ transitionDelay: "120ms" }}
          onFocusCapture={() => autoScroll.hold("guest-message-form")}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) autoScroll.release("guest-message-form");
          }}
        >
          <form onSubmit={onSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
              <div>
                <label className="field-label" htmlFor="guest-name">
                  Name
                </label>
                <input
                  id="guest-name"
                  className="field mt-2"
                  type="text"
                  autoComplete="name"
                  maxLength={NAME_MAX}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Your name"
                  aria-invalid={nameBad || nameLong}
                />
                <p className="field-hint">
                  {nameBad ? (
                    <span className="text-[#e5a08a]">Please enter your name.</span>
                  ) : nameLong ? (
                    <span className="text-[#e5a08a]">{nLen} / {NAME_MAX}</span>
                  ) : (
                    <>{nLen} / {NAME_MAX}</>
                  )}
                </p>
              </div>

              <div>
                <label className="field-label" htmlFor="guest-message">
                  Message
                </label>
                <textarea
                  id="guest-message"
                  className="field mt-2 min-h-[7.5rem] resize-y"
                  rows={4}
                  maxLength={MESSAGE_MAX}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Wishes for the happy couple…"
                  aria-invalid={msgBad || msgLong}
                />
                <p className="field-hint">
                  {msgBad ? (
                    <span className="text-[#e5a08a]">Please write a message.</span>
                  ) : msgLong ? (
                    <span className="text-[#e5a08a]">{mLen} / {MESSAGE_MAX}</span>
                  ) : (
                    <>{mLen} / {MESSAGE_MAX}</>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <p
                className={cn(
                  "min-h-[1.1rem] font-serif text-[0.92rem] italic",
                  notice ? "gold-text" : "text-[#e5a08a]/85"
                )}
                role="status"
                aria-live="polite"
              >
                {notice ? "Thank you for your message!" : error ?? ""}
              </p>
              <button type="submit" className="btn-gold !min-h-[48px]" disabled={sending}>
                {sending ? "Sending…" : "Send Message"}
              </button>
            </div>
          </form>
        </div>

        {usingFallback && (
          <p className="preview-badge mx-auto mt-5 flex max-w-[34rem] items-center justify-center gap-2 rounded-full px-4 py-2 text-center text-[0.58rem] font-light uppercase tracking-[0.2em]">
            Preview mode — messages are stored in this browser only. Connect Supabase to go live.
          </p>
        )}

        {/* wall of notes */}
        <div className="mt-[8svh]">
          {status === "loading" && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
              {[0, 1, 2].map((k) => (
                <div key={k} className="msg-skeleton h-[13rem] rounded-[14px]" />
              ))}
            </div>
          )}

          {status === "error" && (
            <p className="text-center font-serif text-[1.05rem] italic text-[#e5a08a]/85">
              The guest book could not be reached just now. Please try again shortly.
            </p>
          )}

          {status === "ready" && list.length === 0 && (
            <p className="text-center font-serif text-[clamp(1rem,3.8vw,1.2rem)] italic text-[#f6efe2]/60">
              No notes yet — be the first to write one.
            </p>
          )}

          {list.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m, i) => (
                <li key={m.id} data-rv className="rv-item" style={{ transitionDelay: `${Math.min(i, 8) * 70}ms` }}>
                  <Card m={m} fresh={fresh.has(m.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div data-rv className="rv-item mt-[10svh] text-center">
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[#d9b873] to-transparent" />
          <p className="pearl-text mt-6 font-serif text-[clamp(1.8rem,7vw,3.2rem)] font-light italic text-shadow-soft">
            Bishoy <span className="gold-text">&amp;</span> Marina
          </p>
          <p className="label mt-4 !text-[0.62rem] !tracking-[0.36em] text-[#ecd9ac]/70">18 · 10 · 2026</p>
        </div>
      </div>
    </section>
  );
}
