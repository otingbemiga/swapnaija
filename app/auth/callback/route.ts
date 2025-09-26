// app/auth/callback/route.ts
export const runtime = 'nodejs' // ✅ Force Node.js runtime

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // ✅ Create Supabase client for this request
    const supabase = createRouteHandlerClient({ cookies })

    // Exchange code for session
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(new URL('/', request.url))
    }

    // ✅ Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error fetching user:', userError)
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 👀 Redirect based on user role (example: admin or normal user)
    const role = user.user_metadata?.role
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/user/userdashboard', request.url))
    }
  } catch (err) {
    console.error('Callback route error:', err)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
