// app/auth/callback/route.ts
export const runtime = 'edge'; // ✅ Edge runtime is faster and supported on Vercel

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

    // ✅ Exchange the OAuth code for a Supabase session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('❌ exchangeCodeForSession error:', exchangeError.message);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // ✅ Retrieve the signed-in user
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
      console.error('❌ getUser error:', getUserError?.message);
      return NextResponse.redirect(new URL('/', request.url));
    }

    const metadata = user.user_metadata || {};
    const role = metadata.role || 'user';

    console.log(`✅ OAuth login success for: ${user.email} (role: ${role})`);

    // ✅ Determine environment origin (handles both localhost and production)
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://swapnaija.com.ng'
        : 'http://localhost:3000');

    // ✅ Redirect users based on their role
    const redirectUrl =
      role === 'admin'
        ? `${origin}/admin/dashboard`
        : `${origin}/user/userdashboard`;

    console.log('🔀 Redirecting user to:', redirectUrl);

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error('🔥 /auth/callback unexpected error:', err.message || err);
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://swapnaija.com.ng'
        : 'http://localhost:3000');
    return NextResponse.redirect(origin);
  }
}
