// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ✅ Must pass request + response cookies to avoid Vercel build errors
  const supabase = createMiddlewareClient({
    req,
    res,
  })

  // ✅ Sync & refresh session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) console.error('Middleware auth error:', error.message)

  // ✅ Protect user routes (optional)
  if (!session && req.nextUrl.pathname.startsWith('/user-only-route')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

// ✅ Exclude static files & API routes (required for Vercel)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|api).*)',
  ],
}
