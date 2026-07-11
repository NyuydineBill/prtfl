import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Client-side only: the anon key is safe to expose and relies on Supabase
// Row Level Security policies (see web/README.md) to restrict access.
// Uses the cookie-aware browser client so an admin's auth session (set via
// the server) is available to client-side calls too.
export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
