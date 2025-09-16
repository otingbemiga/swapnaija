// app/api/items/reject/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Incoming reject payload:", body);

    const { id, user_id, points, admin_id, reason } = body;

    if (!id || !user_id || !admin_id) {
      return NextResponse.json(
        { error: "Missing id, user_id or admin_id" },
        { status: 400 }
      );
    }

    // ✅ Call transactional function
    const { error } = await supabase.rpc("reject_item_transaction", {
      p_item_id: id,
      p_user_id: user_id,
      p_admin_id: admin_id,
      p_points: points || 10,
      p_reason: reason || "Not specified",
    });

    if (error) {
      console.error("❌ Transaction failed:", error);
      throw error;
    }

    console.log(`✅ Reject transaction completed safely for item ${id}`);

    return NextResponse.json({
      success: true,
      message: "Item rejected + rollback-safe points update + notification sent",
    });
  } catch (err: any) {
    console.error("🔥 Reject route crashed:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
