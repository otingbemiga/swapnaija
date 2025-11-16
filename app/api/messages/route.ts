export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Safe UUID check
function isUUID(str: string) {
  return /^[0-9a-fA-F-]{36}$/.test(str);
}

// ✅ Get all messages between two users and their selected items
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userA = searchParams.get("userA");
    const userB = searchParams.get("userB");
    const itemA = searchParams.get("itemA");
    const itemB = searchParams.get("itemB");

    // Validate all parameters
    if (!userA || !userB || !itemA || !itemB) {
      return NextResponse.json(
        { error: "Missing one or more required parameters." },
        { status: 400 }
      );
    }

    if (![userA, userB, itemA, itemB].every(isUUID)) {
      return NextResponse.json({ error: "Invalid UUID format" }, { status: 400 });
    }

    // ✅ Query for messages between both users for both items
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        [
          `and(from_user.eq.${userA},to_user.eq.${userB},item_a_id.eq.${itemA},item_b_id.eq.${itemB})`,
          `and(from_user.eq.${userB},to_user.eq.${userA},item_a_id.eq.${itemB},item_b_id.eq.${itemA})`
        ].join(",")
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Supabase query error:", error.message);
      return NextResponse.json(
        { error: "Supabase query failed: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("🔥 GET /api/messages failed:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Post a new message
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from_user, to_user, content, item_a_id, item_b_id } = body;

    if (!from_user || !to_user || !content || !item_a_id || !item_b_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (![from_user, to_user, item_a_id, item_b_id].every(isUUID)) {
      return NextResponse.json({ error: "Invalid UUID format" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([{ from_user, to_user, content, item_a_id, item_b_id }])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to send message: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("🔥 POST /api/messages failed:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
