// app/api/typing/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, conversation_key, is_typing } = body;

    if (!user_id || !conversation_key || typeof is_typing !== 'boolean') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const payload = { user_id, conversation_key, is_typing, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('typing_status')
      .upsert(payload, { onConflict: '(user_id, conversation_key)' })
      .select()
      .single();

    if (error) {
      console.error('POST /api/typing supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('POST /api/typing error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
