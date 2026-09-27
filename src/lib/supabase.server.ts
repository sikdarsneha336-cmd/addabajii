import { createClient } from "@supabase/supabase-js";

const projectUrl = import.meta.env["VITE_SUPABASE_URL"];
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

export function assertSupabaseConfigured() {
  if (!projectUrl || !publishableKey) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart Bun.");
  }
}

export function getSupabaseUrl() {
  assertSupabaseConfigured();
  return projectUrl;
}

export function getSupabasePublishableKey() {
  assertSupabaseConfigured();
  return publishableKey;
}

export function createSupabaseClient(accessToken?: string) {
  assertSupabaseConfigured();
  return createClient(projectUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });
}

export async function hashSecret(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
