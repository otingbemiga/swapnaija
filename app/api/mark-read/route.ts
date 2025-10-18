import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { user_id, item_a_id, item_b_id } = await req.json();
    if (!user_id || !item_a_id || !item_b_id) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .or(`and(item_a_id.eq.${item_a_id},item_b_id.eq.${item_b_id},to_user.eq.${user_id}),and(item_a_id.eq.${item_b_id},item_b_id.eq.${item_a_id},to_user.eq.${user_id})`);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/mark-read error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
