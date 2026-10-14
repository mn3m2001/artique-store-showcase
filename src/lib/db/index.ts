import { DemoStore } from "./demo-store";
import { usesCloudStorage } from "@/lib/cloud";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isDemoMode(): boolean {
  return !usesCloudStorage();
}

// Shared business rules with local atomic files or Supabase revision transactions.
export const db = DemoStore;
