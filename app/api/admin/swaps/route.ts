// app/api/admin/swaps/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key
)

const ADMINS = ['onefirstech@gmail.com', 'admin@swapnaija.com.ng']

async function isAdmin(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const {
    data: { user },
  } = await supabase.auth.getUser(token)
  if (!user || !ADMINS.includes(user.email!)) return null
  return user
}

export async function GET(req: Request) {
  const admin = await isAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized – Admins only' }, { status: 403 })

  const { data, error } = await supabase
    .from('swap_offers')
    .select('id, from_user_email, to_user_email, item1, item2, status, created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
