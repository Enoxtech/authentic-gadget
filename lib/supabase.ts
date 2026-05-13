import { createBrowserClient } from "@supabase/ssr";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Gracefully handle missing or placeholder env vars during build
  if (!supabaseUrl || supabaseUrl === "placeholder" || !supabaseAnonKey || supabaseAnonKey === "placeholder_anon_key_for_build") {
    // Return a dummy client that won't crash the build but will fail gracefully at runtime
    // This allows `npm run build` to succeed even without real Supabase credentials
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder_key_for_build_only"
    );
  }

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _client;
}