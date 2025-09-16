'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Item {
  id: string;
  title: string;
  description: string;
  image_paths?: string[];
  points: number;
}

interface Offer {
  id: string;
  status: string;
  created_at: string;
  offered_item: Item;
  requested_item: Item;
  unread_count: number;
}

export default function ReceivedOffersPage() {
  const session = useSession();
  const [offers, setOffers] = useState<Offer[]>([]);

  const fetchOffers = async () => {
    if (!session?.user) return;

    // 1. Get IDs of items owned by this user
    const { data, error: itemsOwnedError } = await supabase
      .from('items')
      .select('id')
      .eq('user_id', session.user.id);

    if (itemsOwnedError) {
      console.error('Supabase error fetching user items:', itemsOwnedError.message);
      toast.error('Failed to load user items');
      return;
    }

    const userItems = data as { id: string }[] | null;
    const ownedItemIds = userItems?.map((i) => i.id) || [];

    if (ownedItemIds.length === 0) {
      setOffers([]);
      return;
    }

    // 2. Fetch offers where item_requested belongs to this user (join items inline)
    const { data: rawOffers, error } = await supabase
      .from('swap_offers')
      .select(
        `
        id,
        status,
        created_at,
        item_requested (
          id, title, description, image_paths, points
        ),
        item_offered (
          id, title, description, image_paths, points
        )
      `
      )
      .in('item_requested', ownedItemIds);

    if (error) {
      console.error('Supabase error fetching offers:', error.message);
      toast.error('Failed to load received offers');
      return;
    }

    if (!rawOffers || rawOffers.length === 0) {
      setOffers([]);
      return;
    }

    // 3. Fetch all unread message counts in one grouped query
    const { data: unreadCounts, error: unreadError } = await supabase
      .from('messages')
      .select('item_id, count:id', { count: 'exact', head: false })
      .eq('to_user', session.user.id)
      .is('read_at', null)
      .in(
        'item_id',
        (rawOffers as any[]).map((o) => o.item_requested.id)
      )
      .group('item_id');

    if (unreadError) {
      console.error('Supabase error fetching unread counts:', unreadError.message);
    }

    const unreadMap: Record<string, number> = {};
    unreadCounts?.forEach((row: any) => {
      unreadMap[row.item_id] = row.count;
    });

    // 4. Merge counts into offers
    const enrichedOffers: Offer[] = (rawOffers as any[]).map((o) => ({
      id: o.id,
      status: o.status,
      created_at: o.created_at,
      offered_item: o.item_offered,
      requested_item: o.item_requested,
      unread_count: unreadMap[o.item_requested.id] || 0,
    }));

    setOffers(enrichedOffers);
  };

  useEffect(() => {
    fetchOffers();

    if (!session?.user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          if (payload.new.to_user === session.user.id) {
            fetchOffers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return (
    <main className="p-6 max-w-5xl mx-auto bg-gradient-to-b from-green-50 to-green-100 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        Received Swap Offers
      </h1>

      {offers.length === 0 ? (
        <p>No offers received yet.</p>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white p-4 rounded shadow hover:shadow-lg transition relative"
            >
              {offer.unread_count > 0 && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {offer.unread_count} new
                </span>
              )}
              <h2 className="font-semibold text-lg mb-2">
                Offer Status: {offer.status}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-green-700 font-bold mb-1">Item Offered</h3>
                  {offer.offered_item?.image_paths?.[0] && (
                    <Image
                      src={`https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/${offer.offered_item.image_paths[0]}`}
                      alt={offer.offered_item.title}
                      width={200}
                      height={150}
                      className="rounded mb-2"
                      unoptimized
                    />
                  )}
                  <p>{offer.offered_item?.title}</p>
                  <p className="text-sm text-gray-600">{offer.offered_item?.description}</p>
                </div>

                <div>
                  <h3 className="text-green-700 font-bold mb-1">Your Item</h3>
                  {offer.requested_item?.image_paths?.[0] && (
                    <Image
                      src={`https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/${offer.requested_item.image_paths[0]}`}
                      alt={offer.requested_item.title}
                      width={200}
                      height={150}
                      className="rounded mb-2"
                      unoptimized
                    />
                  )}
                  <p>{offer.requested_item?.title}</p>
                  <p className="text-sm text-gray-600">{offer.requested_item?.description}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Sent on {new Date(offer.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
