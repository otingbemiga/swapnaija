// app/api/whoami/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookieStore }
  )

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message })
  }

  if (!session) {
    return NextResponse.json({ ok: false, error: 'No active session' })
  }

  return NextResponse.json({
    ok: true,
    user: session.user,
  })
}
