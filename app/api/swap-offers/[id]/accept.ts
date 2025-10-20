import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ✅ Define TypeScript interface to guide Supabase's inferred response
interface Offer {
  id: string;
  status: string;
  target_item_id: string;
  my_item_id: string;
  initiator_id: string;
  target_item:
    | { user_id: string }[]
    | { user_id: string }
    | null;
}

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

  const { data: offerData, error } = await supabase
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
    .single<Offer>(); // ✅ Explicitly type it here

  if (error || !offerData) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }

  const offer = offerData as Offer;

  // ✅ Safely extract the user_id whether it's an array or object
  const targetItemUserId = Array.isArray(offer.target_item)
    ? offer.target_item[0]?.user_id
    : offer.target_item?.user_id;

  if (targetItemUserId !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (offer.status !== 'pending') {
    return NextResponse.json({ error: 'Offer already handled' }, { status: 400 });
  }

  // ✅ Accept the offer
  const { error: updateError } = await supabase
    .from('swap_offers')
    .update({ status: 'accepted' })
    .eq('id', offerId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // ✅ Mark both items as swapped
  const { error: itemError } = await supabase
    .from('items')
    .update({ status: 'swapped' })
    .in('id', [offer.target_item_id, offer.my_item_id]);

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  // ✅ Reject all other pending offers involving either item
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

  // ✅ Notify initiator
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
