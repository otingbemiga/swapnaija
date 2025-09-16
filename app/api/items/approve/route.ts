// app/api/items/approve/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ service role bypasses RLS
);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Incoming approve payload:", body);

    const { id, user_id, points, admin_id } = body;

    if (!id || !user_id || !admin_id) {
      console.error("❌ Missing required fields:", { id, user_id, admin_id });
      return NextResponse.json(
        { error: "Missing id, user_id or admin_id" },
        { status: 400 }
      );
    }

    // 1. Update item status
    const { error: updateError } = await supabase
      .from("items")
      .update({ status: "approved", review_reason: null })
      .eq("id", id);

    if (updateError) {
      console.error("❌ Update item failed:", updateError);
      throw updateError;
    }
    console.log(`✅ Item ${id} marked as approved`);

    // 2. Try RPC first
    const { error: rpcError } = await supabase.rpc("increment_user_points", {
      user_id,
      amount: points || 10,
    });

    if (rpcError) {
      console.warn("⚠️ RPC failed, fallback to direct points update:", rpcError);

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", user_id)
        .single();

      if (profileErr) {
        console.error("❌ Fetch profile failed:", profileErr);
        throw profileErr;
      }

      const newPoints = (profile?.points || 0) + (points || 10);

      const { error: directUpdateError } = await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", user_id);

      if (directUpdateError) {
        console.error("❌ Direct profile update failed:", directUpdateError);
        throw directUpdateError;
      }

      console.log(`✅ Fallback: Updated profile ${user_id} points → ${newPoints}`);
    } else {
      console.log("✅ RPC increment_user_points executed successfully");
    }

    // 3. Create notification
    const { error: notifyError } = await supabase.from("notifications").insert([
      {
        type: "approval",
        message: "Your item has been approved 🎉",
        sender_id: admin_id,
        recipient_id: user_id,
        item_id: id,
        status: "unread",
      },
    ]);

    if (notifyError) {
      console.error("❌ Notification insert failed:", notifyError);
      throw notifyError;
    }
    console.log(`✅ Notification created for user ${user_id}`);

    return NextResponse.json({
      success: true,
      message: "Item approved + notification sent",
    });
  } catch (err: any) {
    console.error("🔥 Approve route crashed:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
