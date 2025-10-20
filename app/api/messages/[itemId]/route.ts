import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  req: Request,
  context: any // ✅ Force loose type to bypass buggy type inference
) {
  try {
    const { itemId } = context?.params ?? {};

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
    }

    await supabase.auth.setSession({ access_token: token, refresh_token: '' });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id, from_user, to_user, content, created_at,
        from_user_profile:from_user (id, full_name, avatar_url),
        to_user_profile:to_user (id, full_name, avatar_url)
      `)
      .eq('item_id', itemId)
      .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch messages error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages }, { status: 200 });
  } catch (err: any) {
    console.error('Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
