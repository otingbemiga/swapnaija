// app/api/items/pending/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Incoming pending payload:", body);

    const { id, admin_id } = body;

    if (!id || !admin_id) {
      return NextResponse.json(
        { error: "Missing id or admin_id" },
        { status: 400 }
      );
    }

    // 1. Update item status
    const { error: updateError } = await supabase
      .from("items")
      .update({ status: "pending", review_reason: null })
      .eq("id", id);

    if (updateError) throw updateError;
    console.log(`⏳ Item ${id} reset to pending`);

    return NextResponse.json({
      success: true,
      message: "Item set back to pending",
    });
  } catch (err: any) {
    console.error("🔥 Pending route crashed:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
