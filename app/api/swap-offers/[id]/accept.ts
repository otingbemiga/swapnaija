// ✅ app/api/swap-offers/[id]/accept/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const offerId = params.id;

  const { data: offer, error } = await supabase
    .from('swap_offers')
    .select(
      `
      id,
      status,
      target_item_id,
      my_item_id,
      initiator_id,
      target_item:items!swap_offers_target_item_id_fkey ( user_id )
    `
    )
    .eq('id', offerId)
    .single();

  if (error || !offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }

  if (offer.target_item.user_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (offer.status !== 'pending') {
    return NextResponse.json({ error: 'Offer already handled' }, { status: 400 });
  }

  // Accept the offer
  const { error: updateError } = await supabase
    .from('swap_offers')
    .update({ status: 'accepted' })
    .eq('id', offerId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Mark both items as swapped
  const { error: itemError } = await supabase
    .from('items')
    .update({ status: 'swapped' })
    .in('id', [offer.target_item_id, offer.my_item_id]);

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  // Reject other pending offers
  await supabase
    .from('swap_offers')
    .update({ status: 'rejected' })
    .in('target_item_id', [offer.target_item_id, offer.my_item_id])
    .neq('id', offerId)
    .eq('status', 'pending');

  await supabase
    .from('swap_offers')
    .update({ status: 'rejected' })
    .in('my_item_id', [offer.target_item_id, offer.my_item_id])
    .neq('id', offerId)
    .eq('status', 'pending');

  // Notification
  const { error: notifError } = await supabase.from('notifications').insert([
    {
      user_id: offer.initiator_id,
      message: `🎉 Your swap offer #${offerId} was accepted!`,
    },
  ]);

  if (notifError) {
    console.error('❌ Failed to create notification:', notifError.message);
  }

  return NextResponse.json({
    success: true,
    message: 'Offer accepted and items swapped successfully.',
  });
}
