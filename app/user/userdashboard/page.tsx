'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function UserDashboard() {
  const session = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const user = session?.user?.user_metadata || {};
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    myItems: 0,
    offersSent: 0,
    offersReceived: 0,
    completedSwaps: 0,
    points: 0
  });

  // ✅ Fetch profile details
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address, avatar_url, points')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [session]);

  // ✅ Load stats + points from view
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadStats = async () => {
      const [items, sent, received, completed, pointsView] = await Promise.all([
        supabase.from('items').select('id').eq('user_id', session.user.id),
        supabase.from('swap_offers').select('id').eq('offered_by', session.user.id),
        supabase.from('swap_offers').select('id').eq('target_owner_id', session.user.id),
        supabase.from('transactions').select('id').or(`from_user_id.eq.${session.user.id},to_user_id.eq.${session.user.id}`),
        supabase.from('user_points_summary').select('points').eq('user_id', session.user.id).limit(1).single()
      ]);

      setStats({
        myItems: items.data?.length || 0,
        offersSent: sent.data?.length || 0,
        offersReceived: received.data?.length || 0,
        completedSwaps: completed.data?.length || 0,
        points: pointsView.data?.points || 0
      });
    };

    loadStats();
  }, [session]);

  if (!session) return <div className="p-6">Please log in to view your dashboard.</div>;

  return (
    <main className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen py-10 px-6`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold"
          >
            Welcome {profile?.full_name?.split(' ')[0] || user.fullName?.split(' ')[0] || 'User'} 👋
          </motion.h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-700 dark:text-white"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Image
            src={profile?.avatar_url || user.profile_image || '/avatar-placeholder.png'}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full border object-cover"
          />
          <div>
            <p className="text-lg font-semibold">{profile?.full_name || user.full_name || 'N/A'}</p>
            <p className="text-sm">📧 {session.user.email}</p>
            <p className="text-sm">📱 {profile?.phone || user.phone || 'N/A'}</p>
            <p className="text-sm">📍 {profile?.address || user.address || 'N/A'}</p>
          </div>
        </div>

        {/* ✅ Dashboard grid with Add Item card aligned */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{
            label: 'My Listings',
            value: stats.myItems,
            href: '/user/my-listings'
          }, {
            label: 'Offers Sent',
            value: stats.offersSent,
            href: '/user/my-offers'
          }, {
            label: 'Offers Received',
            value: stats.offersReceived,
            href: '/user/received-offers'
          }, {
            label: 'Completed Swaps',
            value: stats.completedSwaps,
            href: '/user/transactions'
          }, {
            label: 'Points Balance',
            value: stats.points,
            href: '/user/points-history'
          }, {
            label: 'Account Settings',
            value: '-',
            href: '/user/settings'
          }].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center hover:shadow-lg transition-all flex flex-col justify-center"
            >
              <Link href={stat.href}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm mt-1 text-green-600 dark:text-green-400">{stat.label}</p>
              </Link>
            </motion.div>
          ))}

          {/* 🚀 Standout Add Item Card (same size as others but green) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded shadow-lg cursor-pointer p-6 text-center"
          >
            <Link href="/add-item" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-5xl font-bold mb-2">＋</span>
              <p className="text-lg font-semibold">Add New Item</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
