// app/auth/callback/route.ts
export const runtime = 'nodejs';


import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';


export async function GET(request: Request) {
try {
const url = new URL(request.url);
const code = url.searchParams.get('code');
if (!code) return NextResponse.redirect(new URL('/', request.url));


const supabase = createRouteHandlerClient({ cookies });


// Exchange the code for a session
const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
if (exchangeError) {
console.error('exchangeCodeForSession error', exchangeError);
return NextResponse.redirect(new URL('/', request.url));
}


// Get the user and redirect based on role
const { data: { user }, error: getUserError } = await supabase.auth.getUser();
if (getUserError || !user) {
console.error('getUser error', getUserError);
return NextResponse.redirect(new URL('/', request.url));
}


const role = (user.user_metadata as any)?.role;
if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
return NextResponse.redirect(new URL('/user/userdashboard', request.url));
} catch (err) {
console.error('/auth/callback error', err);
return NextResponse.redirect(new URL('/', request.url));
}
}