// app/api/admin/users/route.ts
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

  const { data, error } = await supabase.from('users').select('id, email, status')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const admin = await isAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized – Admins only' }, { status: 403 })

  const { id, action } = await req.json()

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing user id or action' }, { status: 400 })
  }

  let error = null

  if (action === 'suspend') {
    const res = await supabase.from('users').update({ status: 'suspended' }).eq('id', id)
    error = res.error
  } else if (action === 'activate') {
    const res = await supabase.from('users').update({ status: 'active' }).eq('id', id)
    error = res.error
  } else if (action === 'delete') {
    const res = await supabase.from('users').delete().eq('id', id)
    error = res.error
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
