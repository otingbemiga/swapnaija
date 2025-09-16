'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface SwapStats {
  completed: number;
  pending: number;
  declined: number;
}

interface Item {
  status: 'completed' | 'pending' | 'declined' | string;
}

export default function CompleteSwapPage() {
  const session = useSession();
  const [stats, setStats] = useState<SwapStats>({ completed: 0, pending: 0, declined: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user) {
        toast.error('Please log in to see your swap stats');
        return;
      }
      setLoading(true);

      // Fetch only status column for the user's items
      const { data, error } = await supabase
        .from('items') // Removed <Item> generic
        .select('status')
        .eq('user_id', session.user.id);

      if (error) {
        toast.error('Failed to load swap stats');
        console.error(error);
        setLoading(false);
        return;
      }

      const items = (data as Item[]) || [];

      // Count statuses
      const counts: SwapStats = { completed: 0, pending: 0, declined: 0 };
      items.forEach((item) => {
        if (item.status === 'completed') counts.completed++;
        else if (item.status === 'pending') counts.pending++;
        else if (item.status === 'declined') counts.declined++;
      });

      setStats(counts);
      setLoading(false);
    };

    fetchStats();
  }, [session]);

  if (loading) return <p className="p-6">Loading swap stats...</p>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-green-700 mb-6 border-b pb-2">
        My Swap Stats
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 border hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700">Completed</h2>
          <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700">Pending</h2>
          <p className="text-4xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700">Declined</h2>
          <p className="text-4xl font-bold text-red-500">{stats.declined}</p>
        </div>
      </div>
    </main>
  );
}
