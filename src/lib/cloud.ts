import { createClient } from "@supabase/supabase-js";

export function usesCloudStorage(): boolean {
  return process.env.ARTIQUE_STORAGE === "supabase" || process.env.VERCEL === "1";
}

export function cloudClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are required for cloud storage.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
