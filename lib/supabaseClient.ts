// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rzjfumrvmmdluunqsqsp.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6amZ1bXJ2bW1kbHV1bnFzcXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTYxNzIsImV4cCI6MjA2OTI5MjE3Mn0.XNvGTRlBT9ZZgnY9qWigSSimRx1XBjDKDBXo6mUJXLg";

// ✅ Ensure singleton instance (avoid "Multiple GoTrueClient instances" warning)
export const supabase =
  (globalThis as any).supabase ||
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).supabase = supabase;
}
