import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public, browser-safe configuration only. The anon key is designed to be
// shipped to the client (row level security protects the table) — a service
// role key must never appear anywhere in this front-end.
const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

/** Placeholders copied straight out of .env.example are not credentials. */
function isReal(value: string, mustContain: string) {
  if (!value) return false;
  const v = value.toLowerCase();
  if (v.includes("your-") || v.includes("your_") || v.includes("example") || v.includes("placeholder"))
    return false;
  if (v.includes("<") || v.includes(">") || v.includes("xxxx") || v.includes("changeme")) return false;
  return value.includes(mustContain);
}

export const SUPABASE_URL = url;
export const SUPABASE_CONFIGURED =
  isReal(url, "supabase.co") && anonKey.length >= 20 && isReal(anonKey, "");

export const supabase: SupabaseClient | null = SUPABASE_CONFIGURED
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 4 } },
      global: { headers: { "x-client-info": "wedding-invitation" } },
    })
  : null;

export const TABLE = "guest_messages";
