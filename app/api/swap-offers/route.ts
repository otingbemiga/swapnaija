// /app/api/swap-offers/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role required for inserts
)

export async function POST(req: Request) {
  try {
    const { targetItemId, myItemId, message, userId } = await req.json()

    if (!targetItemId || !myItemId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ✅ Fetch both items (to compare values)
    const { data: targetItem, error: targetErr } = await supabase
      .from('items')
      .select('id, title, estimated_value, image_paths, user_id')
      .eq('id', targetItemId)
      .single()

    const { data: myItem, error: myErr } = await supabase
      .from('items')
      .select('id, title, estimated_value, image_paths, user_id')
      .eq('id', myItemId)
      .single()

    if (targetErr || myErr || !targetItem || !myItem) {
      return NextResponse.json(
        { error: 'Could not fetch items' },
        { status: 400 }
      )
    }

    // ✅ Fairness calculation
    const valueDiff = targetItem.estimated_value - myItem.estimated_value
    const suggested_cash_topup = valueDiff > 0 ? valueDiff : 0

    // ✅ Insert swap offer with explicit status = 'pending'
    const { data: offer, error: offerErr } = await supabase
      .from('swap_offers')
      .insert([
        {
          from_user: userId,
          to_user: targetItem.user_id,
          my_item_id: myItem.id,
          target_item_id: targetItem.id,
          message,
          suggested_cash_topup,
          status: 'pending', // 👈 explicitly set here
        },
      ])
      .select(
        `
        id,
        status,
        suggested_cash_topup,
        message,
        created_at,
        my_item: items!swap_offers_my_item_id_fkey (id, title, image_paths, estimated_value),
        target_item: items!swap_offers_target_item_id_fkey (id, title, image_paths, estimated_value),
        from_user_profile: profiles!swap_offers_from_user_fkey (id, full_name, phone)
        `
      )
      .single()

    if (offerErr) {
      return NextResponse.json(
        { error: offerErr.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      offer,
      summary: `Offer created: Your ${myItem.title} → Their ${targetItem.title}${
        suggested_cash_topup > 0
          ? ` (add ₦${suggested_cash_topup.toLocaleString()})`
          : ''
      }`,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}
