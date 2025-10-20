import { supabase } from "@/lib/supabaseClient";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession();
  const token = session.data?.session?.access_token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  let json;
  try {
    json = await res.json();
  } catch {
    json = { error: "Invalid response format" };
  }

  if (!res.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json;
}
