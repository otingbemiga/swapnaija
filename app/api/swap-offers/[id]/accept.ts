import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // ✅ Extract Bearer token from request
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  // ✅ Verify user with Supabase
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offerId = params.id;

  // ✅ Fetch offer + both items + initiator
  const { data: offer, error } = await supabase
    .from("swap_offers")
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
    .eq("id", offerId)
    .single();

  if (error || !offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  // ✅ Only target item owner can accept
  if (offer.target_item.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (offer.status !== "pending") {
    return NextResponse.json({ error: "Offer already handled" }, { status: 400 });
  }

  // ✅ Accept the offer
  const { error: updateError } = await supabase
    .from("swap_offers")
    .update({ status: "accepted" })
    .eq("id", offerId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // ✅ Mark both items as swapped
  const { error: itemError } = await supabase
    .from("items")
    .update({ status: "swapped" })
    .in("id", [offer.target_item_id, offer.my_item_id]);

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  // ✅ Reject all other pending offers involving either item
  await supabase
    .from("swap_offers")
    .update({ status: "rejected" })
    .in("target_item_id", [offer.target_item_id, offer.my_item_id])
    .neq("id", offerId)
    .eq("status", "pending");

  await supabase
    .from("swap_offers")
    .update({ status: "rejected" })
    .in("my_item_id", [offer.target_item_id, offer.my_item_id])
    .neq("id", offerId)
    .eq("status", "pending");

  // ✅ In-App Notification
  const { error: notifError } = await supabase.from("notifications").insert([
    {
      user_id: offer.initiator_id,
      message: `🎉 Your swap offer #${offerId} was accepted!`,
    },
  ]);

  if (notifError) {
    console.error("❌ Failed to create notification:", notifError.message);
  }

  // ✅ Email Notification (optional - use EmailJS, Resend, etc.)
  /*
  await sendEmail({
    to: initiatorEmail,
    subject: "Your Swap Offer Was Accepted 🎉",
    text: "Good news! Your swap offer has been accepted. Log in to see the details.",
  });
  */

  return NextResponse.json({
    success: true,
    message: "Offer accepted, items swapped, and notification sent",
  });
}
