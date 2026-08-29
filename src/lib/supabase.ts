import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * When the env vars are absent the app runs in practice mode: everything
 * works, data stays in this browser only. Real cloud mode turns on the
 * moment the Supabase URL and publishable key are provided at build time.
 */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
