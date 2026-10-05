import { SUPABASE_CONFIGURED, supabase, TABLE } from "./supabase";

export type GuestMessage = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

export const NAME_MAX = 50;
export const MESSAGE_MAX = 300;

/** Supabase is the real, shared database. Without credentials we fall back to a
 *  browser-only store so the section can still be designed and tested locally. */
export const usingFallback = !SUPABASE_CONFIGURED;

const LS_KEY = "wedding:guest-messages:v1";

const SEED: GuestMessage[] = [
  {
    id: "seed-1",
    name: "Nour & Tarek",
    message:
      "Wishing you a lifetime of laughter, quiet mornings and endless love. May this next chapter be your most beautiful one yet.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "seed-2",
    name: "Mariam",
    message:
      "From the moment you met, it was clear you were made for each other. Thank you for letting us be part of your story.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
  },
  {
    id: "seed-3",
    name: "Hassan",
    message:
      "Congratulations to you both. May your home be filled with laughter and your hearts with patience for each other.",
    created_at: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  },
];

const readLocal = (): GuestMessage[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      localStorage.setItem(LS_KEY, JSON.stringify(SEED));
      return SEED.slice();
    }
    const parsed = JSON.parse(raw) as GuestMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return SEED.slice();
  }
};

const writeLocal = (list: GuestMessage[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 60)));
  } catch {
    /* private mode — the in-memory list still works for this visit */
  }
};

export const clean = (v: string, max: number) => v.replace(/\s+/g, " ").trim().slice(0, max);

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

export async function fetchMessages(): Promise<GuestMessage[]> {
  if (!supabase) return readLocal().sort(byNewest);
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data as GuestMessage[]).map(normalise).sort(byNewest);
}

const byNewest = (a: GuestMessage, b: GuestMessage) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

const normalise = (r: GuestMessage): GuestMessage => ({
  id: String(r.id),
  name: String(r.name ?? ""),
  message: String(r.message ?? ""),
  created_at: new Date(r.created_at ?? Date.now()).toISOString(),
});

/* ------------------------------------------------------------------ */
/*  Write                                                              */
/* ------------------------------------------------------------------ */

export async function addMessage(name: string, message: string): Promise<GuestMessage> {
  const row = { name: clean(name, NAME_MAX), message: clean(message, MESSAGE_MAX) };
  if (!row.name || !row.message) throw new Error("Please add your name and a message.");

  if (!supabase) {
    const entry: GuestMessage = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: row.name,
      message: row.message,
      created_at: new Date().toISOString(),
    };
    writeLocal([entry, ...readLocal()]);
    return entry;
  }

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) throw error;
  return normalise(data as GuestMessage);
}

/* ------------------------------------------------------------------ */
/*  Live updates                                                       */
/* ------------------------------------------------------------------ */

/** Returns an unsubscribe function. Supabase Realtime pushes a message to every
 *  open invitation the moment it is written; the local fallback listens to
 *  `storage` so a second browser tab still updates live. */
export function subscribeMessages(onMessage: (m: GuestMessage) => void): () => void {
  const client = supabase;
  if (!client) {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== LS_KEY || !e.newValue) return;
      try {
        const list = JSON.parse(e.newValue) as GuestMessage[];
        if (Array.isArray(list) && list[0]) onMessage(normalise(list[0]));
      } catch {
        /* ignore malformed payloads */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }

  const channel = client
    .channel("guest-messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: TABLE },
      (payload) => {
        const m = normalise(payload.new as GuestMessage);
        if (m.name && m.message) onMessage(m);
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
