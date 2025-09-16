'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function OfferPage() {
  const { id } = useParams(); // ID of the item being offered to
  const session = useSession();
  const router = useRouter();

  const [targetItem, setTargetItem] = useState<any>(null);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState('');

  useEffect(() => {
    if (!session) {
      toast.error('You must be logged in to make an offer.');
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      const { data: item } = await supabase.from('items').select('*').eq('id', id).single();
      setTargetItem(item);

      const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'approved');
      setUserItems(items || []);
    };

    fetchData();
  }, [session, id]);

  const handleOffer = async () => {
    if (!selectedItemId) {
      toast.error('Please select an item to offer.');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, address')
      .eq('id', session?.user?.id)
      .single();

    const { error } = await supabase.from('swap_offers').insert({
      offered_by: session?.user?.id,
      offered_by_email: session?.user?.email,
      offered_by_name: profile?.full_name || '',
      offered_by_phone: profile?.phone || '',
      offered_by_address: profile?.address || '',
      target_item_id: id,
      offer_item_id: selectedItemId,
      offer_message: offerMessage,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to send offer');
    } else {
      // Optionally notify admin
      await fetch('/api/notify-admin', {
        method: 'POST',
        body: JSON.stringify({
          offerId: id,
          offerorName: profile?.full_name || 'New User',
          itemTitle: targetItem?.title || 'an item'
        })
      });

      toast.success('Offer sent successfully');
      router.push('/offers');
    }
  };

  if (!targetItem) return <div className="p-6">Loading item details...</div>;

  return (
    <motion.main
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <h1 className="text-2xl font-bold text-green-700 mb-6">Make an Offer</h1>

      <section className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Item You Want to Get</h2>
        <Image
          src={`https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/${targetItem.image_paths?.[0]}`}
          alt="target-item"
          width={300}
          height={200}
          className="rounded mb-3"
        />
        <p className="font-bold">{targetItem.title}</p>
        <p className="text-sm text-gray-600">{targetItem.description}</p>
        <p className="text-sm text-gray-600">Points: {targetItem.points}</p>
      </section>

      <section className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Choose One of Your Items to Offer</h2>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
          {userItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              className={`border rounded-xl p-3 cursor-pointer hover:border-green-600 transition-all duration-300 ${
                selectedItemId === item.id ? 'border-green-600 bg-green-50' : ''
              }`}
            >
              <Image
                src={`https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/${item.image_paths?.[0]}`}
                alt={item.title}
                width={200}
                height={150}
                className="rounded mb-2"
              />
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-gray-500">Points: {item.points}</p>
            </div>
          ))}
        </div>

        <textarea
          placeholder="Write a message (optional)"
          className="mt-4 w-full border p-2 rounded"
          value={offerMessage}
          onChange={(e) => setOfferMessage(e.target.value)}
          rows={3}
        />

        <button
          onClick={handleOffer}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow-md"
        >
          Send Offer
        </button>
      </section>
    </motion.main>
  );
}
