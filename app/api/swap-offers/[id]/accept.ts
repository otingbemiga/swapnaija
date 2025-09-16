import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // ✅ Get logged-in user from Supabase Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const offerId = params.id;

  // ✅ Fetch offer + target item
  const { data: offer, error } = await supabase
    .from('swap_offers')
    .select(
      `
      id,
      target_item_id,
      status,
      target_item:items!swap_offers_target_item_id_fkey (
        user_id
      )
    `
    )
    .eq('id', offerId)
    .single();

  if (error || !offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }

  // ✅ Only target item owner can accept
  if (offer.target_item.user_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (offer.status !== 'pending') {
    return NextResponse.json({ error: 'Offer already handled' }, { status: 400 });
  }

  // ✅ Update offer
  const { error: updateError } = await supabase
    .from('swap_offers')
    .update({ status: 'accepted' })
    .eq('id', offerId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // ✅ Optional: also update items as "swapped"
  await supabase
    .from('items')
    .update({ status: 'swapped' })
    .in('id', [offer.target_item_id]); // add my_item_id too if needed

  return NextResponse.json({ success: true });
}
