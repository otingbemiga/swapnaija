// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMINS = ['onefirstech@gmail.com', 'admin@swapnaija.com.ng'];


const supabase = createClient(SUPA_URL, SUPA_SERVICE_KEY);


export async function GET(req: Request) {
try {
const authHeader = req.headers.get('authorization');
if (!authHeader) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });


const token = authHeader.replace('Bearer ', '');
const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);
if (getUserError || !user) return NextResponse.json({ error: 'Invalid user' }, { status: 401 });


if (!ADMINS.includes(user.email!)) {
return NextResponse.json({ error: 'Unauthorized – Admins only' }, { status: 403 });
}


// Fetch dashboard counts in parallel
const [pendingRes, approvedRes, rejectedRes, usersWithItemsRes, swapsRes] = await Promise.all([
supabase.from('items').select('id').eq('status', 'pending'),
supabase.from('items').select('id').eq('status', 'approved'),
supabase.from('items').select('id').eq('status', 'rejected'),
supabase.from('items').select('user_id'),
supabase.from('swap_offers').select('id').eq('status', 'accepted'),
]);


const pending = pendingRes.data ?? [];
const approved = approvedRes.data ?? [];
const rejected = rejectedRes.data ?? [];
const usersWithItems = usersWithItemsRes.data ?? [];
const swaps = swapsRes.data ?? [];


const uniqueUsers = new Set(usersWithItems.map((i: any) => i.user_id));


return NextResponse.json({
pending: pending.length,
approved: approved.length,
rejected: rejected.length,
users: uniqueUsers.size,
swaps: swaps.length,
});
} catch (err) {
console.error('/api/admin/dashboard error', err);
return NextResponse.json({ error: (err as any).message || 'Server error' }, { status: 500 });
}
}