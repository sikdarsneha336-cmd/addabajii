import { createMiddleware } from "@tanstack/react-start";

export const SUPABASE_SESSION_KEY = "clearline_supabase_session";
const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

export type StoredSupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export function storeSupabaseSession(session: StoredSupabaseSession) {
  localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("clearline-auth-change"));
}

export function clearSupabaseSession() {
  localStorage.removeItem(SUPABASE_SESSION_KEY);
  window.dispatchEvent(new Event("clearline-auth-change"));
}

async function getFreshAccessToken() {
  const raw = localStorage.getItem(SUPABASE_SESSION_KEY);
  if (!raw) return null;
  let session: StoredSupabaseSession;
  try { session = JSON.parse(raw) as StoredSupabaseSession; }
  catch { clearSupabaseSession(); return null; }

  if (session.expires_at * 1000 > Date.now() + 60_000) return session.access_token;
  if (!supabaseUrl || !publishableKey || !session.refresh_token) { clearSupabaseSession(); return null; }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: publishableKey, "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (!response.ok) { clearSupabaseSession(); return null; }
    const renewed = await response.json() as { access_token: string; refresh_token: string; expires_at?: number; expires_in?: number };
    session = { access_token: renewed.access_token, refresh_token: renewed.refresh_token, expires_at: renewed.expires_at ?? Math.floor(Date.now() / 1000) + (renewed.expires_in ?? 3600) };
    localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
    return session.access_token;
  } catch {
    return session.access_token;
  }
}

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = typeof localStorage === "undefined" ? null : await getFreshAccessToken();
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
