'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

// ✅ Import correct type for realtime payload
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

interface Message {
  id: string;
  from_user: string;
  to_user: string;
  content: string;
  item_id: string;
  created_at: string;
}

export default function MyOffersPage() {
  const session = useSession();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const bucketUrl =
    'https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/';

  // Fetch offers using secure function
  const fetchOffers = async () => {
    if (!session?.user) {
      toast.error('Please log in to view your offers');
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.rpc('get_user_offers', {
      uid: session.user.id,
    });

    if (error) {
      console.error('❌ Error fetching offers:', error.message);
      toast.error('Failed to load offers');
      setLoading(false);
      return;
    }

    setOffers(data || []);
    setLoading(false);
  };

  // Load on mount
  useEffect(() => {
    if (session?.user) fetchOffers();
  }, [session]);

  // Real-time updates
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel(`realtime:offers_${session.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload: RealtimePostgresInsertPayload<Message>) => {
          if (
            payload.new.from_user === session.user.id ||
            payload.new.to_user === session.user.id
          ) {
            fetchOffers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  if (!session?.user) {
    return (
      <p className="p-6 text-red-500">Please log in to view your offers.</p>
    );
  }

  if (loading) {
    return <p className="p-6">Loading offers...</p>;
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold text-green-700 mb-6 border-b pb-2">
        My Swap Offers
      </h1>

      {offers.length === 0 ? (
        <p className="text-gray-600">You have no offers yet.</p>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white shadow-md rounded-lg p-4 flex gap-4 border"
            >
              {offer.item_image_paths?.length > 0 && (
                <Image
                  src={`${bucketUrl}${offer.item_image_paths[0]}`}
                  alt={offer.item_title}
                  width={120}
                  height={90}
                  className="rounded-md object-cover"
                  unoptimized
                />
              )}

              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {offer.item_title || 'Unknown Item'}
                </h2>
                <p className="text-gray-600 mb-2">
                  {offer.item_description || 'No description'}
                </p>
                <p className="text-sm text-gray-500">
                  {offer.from_user === session.user.id
                    ? 'You sent this offer'
                    : 'Offer received'}{' '}
                  • {new Date(offer.created_at).toLocaleString()}
                </p>
                <div className="mt-2 bg-gray-100 p-2 rounded">
                  <b>Message:</b> {offer.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
