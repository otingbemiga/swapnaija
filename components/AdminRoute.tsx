'use client';


import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';


const ADMIN_EMAILS = ['onefirstech@gmail.com', 'admin@swapnaija.com.ng'];


export default function AdminRoute({ children }: { children: ReactNode }) {
const session = useSession();
const router = useRouter();
const [loading, setLoading] = useState(true);


useEffect(() => {
if (!session) {
router.push('/auth/login');
return;
}


const email = session.user?.email ?? '';
if (!ADMIN_EMAILS.includes(email)) {
router.replace('/');
return;
}


setLoading(false);
}, [session, router]);


if (loading) return <div>Loading…</div>;
return <>{children}</>;
}