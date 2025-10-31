// /app/api/notify-match/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ Safe: server-only
);

export async function POST(req: Request) {
  try {
    const { user_id, item_id, message } = await req.json();

    if (!user_id || !item_id || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("notifications").insert([
      {
        recipient_id: user_id,
        type: "match",
        message,
        item_id,
        status: "unread",
      },
    ]);

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ notify-match crashed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
