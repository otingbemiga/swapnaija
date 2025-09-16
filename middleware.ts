// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: any) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Protect ONLY certain pages
  if (!session && req.nextUrl.pathname.startsWith('/user-only-route')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}
