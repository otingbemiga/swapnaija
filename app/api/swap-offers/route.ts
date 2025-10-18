import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { offerFrom, offerTo, offeredItemId, requestedItemId } = await req.json()

    if (!offerFrom || !offerTo || !offeredItemId || !requestedItemId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('swap_offers')
      .insert([{ offer_from: offerFrom, offer_to: offerTo, offered_item_id: offeredItemId, requested_item_id: requestedItemId }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('POST /api/swap-offer error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
