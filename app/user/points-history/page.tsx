'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

type PointsHistoryEntry = {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  created_at: string;
};

export default function PointsHistoryPage() {
  const session = useSession();
  const [history, setHistory] = useState<PointsHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);

  // Fetch user’s current points balance
  const fetchBalance = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      setBalance(data.points || 0);
    }
  };

  // Fetch user’s points history
  const fetchHistory = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('points_history')
      .select('id, points, reason, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistory(data as PointsHistoryEntry[]);
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    if (!session?.user?.id) return;
    fetchBalance();
    fetchHistory();
  }, [session]);

  // Real-time subscription for new points history entries
  useEffect(() => {
    if (!session?.user?.id) return;

    type RealtimePayload = {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: PointsHistoryEntry;
      old?: PointsHistoryEntry;
    };

    const channel = supabase
      .channel(`points_history_${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'points_history',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload: RealtimePayload) => {
          if (payload.eventType === 'INSERT') {
            // Insert new row at top
            setHistory((prev) => [payload.new, ...prev]);
            toast.success(
              `🎉 You earned ${payload.new.points} points (${payload.new.reason})`
            );
          }
          // Re-fetch balance to keep it in sync
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  if (!session) {
    return <div className="p-6">Please log in to view your points history.</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold text-green-700 mb-6"
      >
        Points History 📊
      </motion.h1>

      {/* Balance Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-green-600 text-white p-4 rounded-lg shadow mb-6 text-center"
      >
        <p className="text-lg font-semibold">Current Balance</p>
        <p className="text-3xl font-bold">{balance} Points</p>
      </motion.div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-600">No points history yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow">
            <thead className="bg-green-100">
              <tr>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Points</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Reason</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4 text-sm text-gray-700">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td
                    className={`py-2 px-4 text-sm font-semibold ${
                      entry.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {entry.points > 0 ? `+${entry.points}` : entry.points}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    {entry.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
