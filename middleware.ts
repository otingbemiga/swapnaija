// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ✅ Create middleware Supabase client that syncs session cookies
  const supabase = createMiddlewareClient({ req, res })

  // ✅ Refresh session if needed (this keeps cookies valid)
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Middleware auth error:', error.message)
  }

  // ✅ Optional: protect specific routes (adjust as needed)
  if (!session && req.nextUrl.pathname.startsWith('/user-only-route')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// ✅ Run middleware on all routes except static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
