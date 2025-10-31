import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Fallback admin ID
const ADMIN_ID =
  process.env.ADMIN_USER_ID || "6bce5da8-9255-4e25-925a-4344d7436fe2";

// GET: Fetch all admin/global notifications
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`recipient_id.eq.${ADMIN_ID},recipient_id.is.null`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase GET error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: data });
  } catch (err: any) {
    console.error("❌ GET /notify-admin crashed:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create admin notification
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, message, sender_id, recipient_id, item_id } = body;

    if (!type || !message || !sender_id) {
      return NextResponse.json(
        { error: "Missing required fields (type, message, sender_id)" },
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
          recipient_id: recipient_id || ADMIN_ID, // ✅ always send to admin
          item_id: item_id || null,
          status: "unread",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase POST error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (err: any) {
    console.error("❌ POST /notify-admin crashed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Mark as read/update status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase PATCH error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (err: any) {
    console.error("❌ PATCH /notify-admin crashed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
