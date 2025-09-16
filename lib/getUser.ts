import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";

// Decode Supabase session from cookies
export async function getUser() {
  // Await the cookies() if it returns a Promise
  const cookieStore = await cookies();

  // Safely get the Supabase access token
  const access_token = cookieStore.get("sb-access-token")?.value;

  if (!access_token) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(access_token);

  if (error) {
    console.error("Error fetching user from Supabase:", error.message);
    return null;
  }

  return user || null;
}
