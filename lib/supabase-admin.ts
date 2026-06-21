import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { createPostgresDataClient } from "@/lib/postgres";

// This project does not have generated Supabase database types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseSupabaseClient = SupabaseClient<any>;

let adminClient: LooseSupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  if (process.env.DATABASE_URL) {
    adminClient = createPostgresDataClient() as unknown as LooseSupabaseClient;
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    supabaseUrl === "https://placeholder.supabase.co" ||
    !serviceRoleKey ||
    serviceRoleKey === "placeholder_service_role_key_for_build"
  ) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  adminClient = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  ) as unknown as LooseSupabaseClient;

  return adminClient;
}
