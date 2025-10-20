// app/api/messages/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Must use service role for insert
);

// ✅ Get all messages between two users
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userA = searchParams.get("userA");
    const userB = searchParams.get("userB");

    if (!userA || !userB)
      return NextResponse.json({ error: "Missing user IDs" }, { status: 400 });

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(from_user.eq.${userA},to_user.eq.${userB}),and(from_user.eq.${userB},to_user.eq.${userA})`
      )
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("GET /messages error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ Post a new message
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from_user, to_user, content, item_a_id, item_b_id } = body;

    if (!from_user || !to_user || !content)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // Prevent invalid UUIDs
    const validateUUID = (val: string) => val && /^[0-9a-fA-F-]{36}$/.test(val);
    if (!validateUUID(from_user) || !validateUUID(to_user))
      return NextResponse.json({ error: "Invalid user UUIDs" }, { status: 400 });
    if (item_a_id && !validateUUID(item_a_id))
      return NextResponse.json({ error: "Invalid item_a_id UUID" }, { status: 400 });
    if (item_b_id && !validateUUID(item_b_id))
      return NextResponse.json({ error: "Invalid item_b_id UUID" }, { status: 400 });

    const { data, error } = await supabase
      .from("messages")
      .insert([{ from_user, to_user, content, item_a_id, item_b_id }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("POST /messages error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
