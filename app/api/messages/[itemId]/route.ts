export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Get messages between two users for their selected items
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userA = searchParams.get("userA");
    const userB = searchParams.get("userB");
    const itemA = searchParams.get("itemA");
    const itemB = searchParams.get("itemB");

    if (!userA || !userB || !itemA || !itemB) {
      console.warn("⚠️ Missing params:", { userA, userB, itemA, itemB });
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // ✅ Use .filter() chain instead of raw .or() to avoid SQL parsing issues
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(from_user.eq.${userA},to_user.eq.${userB},item_a_id.eq.${itemA},item_b_id.eq.${itemB}),` +
        `and(from_user.eq.${userB},to_user.eq.${userA},item_a_id.eq.${itemB},item_b_id.eq.${itemA})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Supabase query error:", error.message);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("🔥 GET /messages failed:", err.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Create new message
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

    const { data, error } = await supabase
      .from("messages")
      .insert([{ from_user, to_user, content, item_a_id, item_b_id }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("🔥 POST /messages failed:", err.message || err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
