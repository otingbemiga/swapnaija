// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types' // if you have DB types
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    // ✅ Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // 👀 Example: assuming you store role in "user_metadata.role"
      const role = user.user_metadata?.role

      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/user/userdashboard', request.url))
      }
    }
  }

  // fallback → home
  return NextResponse.redirect(new URL('/', request.url))
}
