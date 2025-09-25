import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key
)

const ADMINS = ['onefirstech@gmail.com', 'admin@swapnaija.com.ng']

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // ✅ Verify the token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 })
    }

    if (!ADMINS.includes(user.email!)) {
      return NextResponse.json({ error: 'Unauthorized – Admins only' }, { status: 403 })
    }

    // ✅ Fetch stats
    const { data: pending } = await supabase.from('items').select('id').eq('status', 'pending')
    const { data: approved } = await supabase.from('items').select('id').eq('status', 'approved')
    const { data: rejected } = await supabase.from('items').select('id').eq('status', 'rejected')
    const { data: usersWithItems } = await supabase.from('items').select('user_id')
    const { data: swaps } = await supabase.from('swap_offers').select('id').eq('status', 'accepted')

    const uniqueUsers = new Set(usersWithItems?.map((i) => i.user_id))

    return NextResponse.json({
      pending: pending?.length || 0,
      approved: approved?.length || 0,
      rejected: rejected?.length || 0,
      users: uniqueUsers.size,
      swaps: swaps?.length || 0,
    })
  } catch (err: any) {
    console.error('🔥 Dashboard API failed:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
