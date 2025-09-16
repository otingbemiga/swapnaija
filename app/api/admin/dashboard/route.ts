// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ bypass RLS
);

export async function GET() {
  try {
    // Pending
    const { data: pending, error: pendingErr } = await supabase
      .from("items")
      .select("id")
      .eq("status", "pending");
    if (pendingErr) throw pendingErr;

    // Approved
    const { data: approved, error: approvedErr } = await supabase
      .from("items")
      .select("id")
      .eq("status", "approved");
    if (approvedErr) throw approvedErr;

    // Rejected
    const { data: rejected, error: rejectedErr } = await supabase
      .from("items")
      .select("id")
      .eq("status", "rejected");
    if (rejectedErr) throw rejectedErr;

    // Users with items → group by user_id
    const { data: usersWithItems, error: usersErr } = await supabase
      .from("items")
      .select("user_id", { count: "exact" });
    if (usersErr) throw usersErr;
    const uniqueUsers = new Set(usersWithItems?.map((i) => i.user_id));

    // Successful swaps
    const { data: swaps, error: swapsErr } = await supabase
      .from("swap_offers")
      .select("id")
      .eq("status", "accepted");
    if (swapsErr) throw swapsErr;

    return NextResponse.json({
      pending: pending?.length || 0,
      approved: approved?.length || 0,
      rejected: rejected?.length || 0,
      users: uniqueUsers.size,
      swaps: swaps?.length || 0,
    });
  } catch (err: any) {
    console.error("🔥 Dashboard API failed:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
