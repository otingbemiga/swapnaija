// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ✅ Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key required for admin access
)

// ✅ Define allowed admin emails
const ADMINS = ['onefirstech@gmail.com', 'admin@swapnaija.com.ng']

export async function GET(req: Request) {
  try {
    // ✅ Check authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // ✅ Verify the token and get user info
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 })
    }

    // ✅ Check if user is admin
    if (!ADMINS.includes(user.email!)) {
      return NextResponse.json({ error: 'Unauthorized – Admins only' }, { status: 403 })
    }

    // ✅ Fetch dashboard stats
    const [{ data: pending }, { data: approved }, { data: rejected }, { data: usersWithItems }, { data: swaps }] = await Promise.all([
      supabase.from('items').select('id').eq('status', 'pending'),
      supabase.from('items').select('id').eq('status', 'approved'),
      supabase.from('items').select('id').eq('status', 'rejected'),
      supabase.from('items').select('user_id'),
      supabase.from('swap_offers').select('id').eq('status', 'accepted'),
    ])

    const uniqueUsers = new Set(usersWithItems?.map(i => i.user_id))

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
