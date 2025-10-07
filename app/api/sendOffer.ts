// app/api/swap-offers/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { targetItemId, myItemId, message } = await req.json();

    if (!targetItemId || !myItemId || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Get target item owner
    const { data: targetItem, error: targetError } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', targetItemId)
      .single();

    if (targetError || !targetItem) {
      return NextResponse.json({ error: 'Target item not found' }, { status: 404 });
    }

    // Insert swap offer
    const { data: newOffer, error: offerError } = await supabase
      .from('swap_offers')
      .insert([
        {
          from_user: user.id,
          to_user: targetItem.user_id,
          my_item_id: myItemId,
          target_item_id: targetItemId,
          message,
          suggested_cash_topup: 0,
        },
      ])
      .select()
      .single();

    if (offerError) {
      return NextResponse.json({ error: offerError.message }, { status: 500 });
    }

    // Insert message alongside offer
    const { data: newMessage } = await supabase
      .from('messages')
      .insert([
        {
          from_user: user.id,
          to_user: targetItem.user_id,
          item_id: targetItemId,
          content: message,
        },
      ])
      .select()
      .single();

    return NextResponse.json({ offer: newOffer, messageInserted: newMessage }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
