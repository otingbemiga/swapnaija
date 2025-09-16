import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ service role key
);

// POST: create a user notification
export async function POST(req: Request) {
  try {
    const { type, message, sender_id, recipient_id, item_id } = await req.json();

    if (!type || !message || !sender_id || !recipient_id) {
      return NextResponse.json(
        { error: "Missing required fields (type, message, sender_id, recipient_id)" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          type,
          message,
          sender_id,
          recipient_id,
          item_id,
          status: "unread",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error inserting user notification:", error.message);
      return NextResponse.json({ error: "Failed to notify user" }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (err: any) {
    console.error("❌ Notify User Error:", err.message);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
