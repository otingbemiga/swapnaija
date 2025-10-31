
// /lib/supabaseClient.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// ✅ Secure client for Next.js App Router
export const supabase = createClientComponentClient();
