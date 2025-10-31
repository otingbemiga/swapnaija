// app/auth/callback/route.ts
export const runtime = 'edge'; // ✅ Edge runtime is faster and fully supported on Vercel

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      console.warn('⚠️ No code found in callback URL');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const supabase = createRouteHandlerClient({ cookies });

    // ✅ Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('❌ exchangeCodeForSession error:', exchangeError.message);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // ✅ Get the user session
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
      console.error('❌ getUser error:', getUserError?.message);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // ✅ Check role or redirect based on available user data
    const metadata = user.user_metadata || {};
    const role = metadata.role || 'user';

    console.log(`✅ OAuth login success for: ${user.email} (role: ${role})`);

    // ✅ Redirect based on role
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/user/userdashboard', request.url));
    }
  } catch (err: any) {
    console.error('🔥 /auth/callback unexpected error:', err.message || err);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
