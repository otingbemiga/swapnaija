'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import FloatingButton from '@/components/FloatingButton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// ✅ Supabase realtime payload type
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

// ✅ Interfaces
interface Message {
  id: string;
  from_user: string;
  to_user: string;
  content: string;
  item_id: string;
  created_at?: string;
  read_at?: string | null;
}

interface MatchItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  desired_swap?: string;
  condition?: string; // ✅ Added so item.condition doesn’t break
  image_paths?: string[];
  estimated_value?: number;
  cash_balance?: number;
}

interface Offer {
  id: string;
  from_user: string;
  to_user: string;
  message: string;
  suggested_cash_topup: number;
  created_at: string;
  my_item?: MatchItem;
  target_item?: MatchItem;
  from_profile?: {
    full_name: string;
    phone: string;
  };
}

interface OwnerProfile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
}

export default function SwapDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const session = useSession();

  const [item, setItem] = useState<MatchItem | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [offerMessage, setOfferMessage] = useState('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [matchingItems, setMatchingItems] = useState<MatchItem[]>([]);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Fetch item + owner
  useEffect(() => {
    const fetchItem = async () => {
      const { data: itemData, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !itemData) {
        toast.error('Item not found');
        return;
      }
      setItem(itemData as MatchItem);

      const { data: ownerData } = await supabase
        .from('profiles')
        .select('full_name, phone, address, id')
        .eq('id', (itemData as any).user_id)
        .single();

      if (ownerData) setOwner(ownerData as OwnerProfile);
    };

    if (id) fetchItem();
  }, [id]);

  // ✅ Fetch messages
  const fetchMessages = async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('item_id', id)
      .order('created_at', { ascending: true });

    const visible = (data as Message[] || []).filter(
      (m: Message) =>
        m.from_user === session.user.id || m.to_user === session.user.id
    );
    setMessages(visible);
    scrollToBottom();
  };

  useEffect(() => {
    if (id && session?.user) fetchMessages();
  }, [id, session]);

  // ✅ Fetch swap offers
  const fetchOffers = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('swap_offers')
      .select(
        `
        id,
        from_user,
        to_user,
        message,
        suggested_cash_topup,
        created_at,
        my_item:items!swap_offers_my_item_id_fkey (
          id, title, image_paths
        ),
        target_item:items!swap_offers_target_item_id_fkey (
          id, title, image_paths
        ),
        from_profile:profiles!swap_offers_from_user_fkey (
          full_name, phone
        )
      `
      )
      .eq('target_item_id', id)
      .order('created_at', { ascending: false });

    if (!error && data) setOffers(data as Offer[]);
  };

  useEffect(() => {
    fetchOffers();
  }, [id]);

  // ✅ Realtime subscription
  useEffect(() => {
    if (!session?.user) return;
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `item_id=eq.${id}`,
        },
        (payload: RealtimePostgresInsertPayload<Message>) => {
          const newMsg = payload.new as Message;
          if (
            newMsg.from_user === session.user.id ||
            newMsg.to_user === session.user.id
          ) {
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, session]);

  // ✅ Recipient
  const getRecipientId = () => {
    if (!item || !session?.user) return null;
    return session.user.id === (item as any).user_id
      ? null
      : (item as any).user_id;
  };

  // ✅ Send text message
  const handleSend = async () => {
    if (!session?.user) return toast.error('Please log in to chat');
    if (!message.trim()) return;

    const recipientId = getRecipientId();
    if (!recipientId) return toast.error('Recipient not found');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user: session.user.id,
        to_user: recipientId,
        content: message,
        item_id: item?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Message insert error:', error.message);
      toast.error('Failed to send');
      return;
    }

    setMessages((prev) => [...prev, data as Message]);
    setMessage('');
    scrollToBottom();
  };

  // ✅ Send offer
  const handleSendOffer = async () => {
    if (!session?.user) return toast.error('Please log in');
    if (!offerMessage.trim()) return toast.error('Enter your offer message');

    try {
      const res = await fetch('/api/swap-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetItemId: id,
          myItemId: null,
          message: offerMessage,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send offer');

      toast.success('Offer created ✅');
      setOfferMessage('');
      fetchOffers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ✅ Matching logic (was missing)
  const fetchMatching = async (filter: string) => {
    if (!item) return;

    let query = supabase.from('items').select('*').neq('id', item.id);

    if (filter === 'desired' && item.desired_swap) {
      query = query.ilike('title', `%${item.desired_swap}%`);
    } else if (filter === 'category' && item.category) {
      query = query.eq('category', item.category);
    } else if (filter === 'title') {
      query = query.ilike('title', `%${item.title}%`);
    }

    const { data } = await query.limit(10);
    if (data) setMatchingItems(data as MatchItem[]);
  };

  if (!item) return <p className="p-6">Loading...</p>;

  const imageBucketUrl =
    'https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/';
  const videoBucketUrl =
    'https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-videos/';

  const slides = [
    ...(item.image_paths?.map((img: string) => ({
      type: 'image',
      path: img,
    })) || []),
    ...(item && (item as any).video_path
      ? [{ type: 'video', path: (item as any).video_path }]
      : []),
  ];

  return (
    <main className="p-6 max-w-5xl mx-auto bg-gradient-to-b from-green-50 to-white min-h-screen">
      <FloatingButton
        onClick={() => chatRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      <h1 className="text-3xl font-extrabold text-green-700 mb-6">
        {item.title}
      </h1>

      {/* Swiper for item media */}
      {slides.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={10}
          slidesPerView={1}
          className="w-full h-72 mb-6"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              {slide.type === 'image' ? (
                <Image
                  src={`${imageBucketUrl}${slide.path}`}
                  alt={`slide-${idx}`}
                  width={600}
                  height={400}
                  className="w-full h-72 object-cover cursor-pointer"
                  unoptimized
                  onClick={() => {
                    setLightboxIndex(idx);
                    setZoom(1);
                    setLightboxOpen(true);
                  }}
                />
              ) : (
                <video
                  src={`${videoBucketUrl}${slide.path}`}
                  controls
                  muted
                  loop
                  className="w-full h-72 object-cover cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(idx);
                    setZoom(1);
                    setLightboxOpen(true);
                  }}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Item detail card with icons */}
      <div className="bg-white shadow rounded p-4 mb-8">
        <h2 className="font-bold text-lg mb-3">📋 Item Details</h2>
        <p className="mb-2"><span className="font-semibold">📦 Condition:</span> {item.condition || 'N/A'}</p>
        <p className="mb-2"><span className="font-semibold">🎯 Desired Swap:</span> {item.desired_swap || 'Any good offer'}</p>
        <p className="mb-2"><span className="font-semibold">⭐ Points:</span> {item.estimated_value || 0}</p>
        <p className="text-green-700 font-bold mt-3">Total Value: ₦{((item.estimated_value || 0) + (item.cash_balance || 0)).toLocaleString()}</p>
      </div>

      {/* Owner Info */}
      {session ? (
        owner && (
          <div className="bg-white shadow p-4 rounded mb-8">
            <h2 className="font-bold text-lg">👤 Owner Info</h2>
            <p><b>Name:</b> {owner.full_name}</p>
            <p><b>Phone:</b> {owner.phone}</p>
            <p><b>Address:</b> {owner.address}</p>
          </div>
        )
      ) : (
        <p className="text-red-500 mb-8">Please log in to view owner info.</p>
      )}

      {/* ✅ Matching Items Section */}
      {matchingItems.length > 0 && (
        <div className="bg-white shadow p-4 rounded mb-8">
          <h2 className="font-bold text-lg mb-3">✨ Matching Items</h2>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => fetchMatching('all')} className="px-3 py-1 rounded bg-green-100">All</button>
            <button onClick={() => fetchMatching('desired')} className="px-3 py-1 rounded bg-green-100">Desired Swap</button>
            <button onClick={() => fetchMatching('category')} className="px-3 py-1 rounded bg-green-100">Category</button>
            <button onClick={() => fetchMatching('title')} className="px-3 py-1 rounded bg-green-100">Item Name</button>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={15}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          >
            {matchingItems.map((match) => {
              const totalValue =
                Number(match.estimated_value || 0) + Number(match.cash_balance || 0);

              return (
                <SwiperSlide key={match.id}>
                  <div
                    className="bg-gray-50 rounded-lg shadow p-3 cursor-pointer hover:shadow-lg transition"
                    onClick={() => router.push(`/swap/${match.id}`)}
                  >
                    {match.image_paths?.[0] && (
                      <img
                        src={`${imageBucketUrl}${match.image_paths[0]}`}
                        alt={match.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    <h4 className="text-sm font-semibold text-green-700 mt-2">
                      {match.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      ₦{totalValue.toLocaleString()}
                    </p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}

      {/* Offer Section */}
      <div className="bg-white shadow p-4 rounded mb-8">
        <h2 className="font-bold text-lg mb-3">🔄 Swap Offers</h2>
        {session ? (
          <>
            <textarea
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              placeholder="Write your offer message..."
              className="w-full border rounded p-2 mb-3"
            />
            <button
              onClick={handleSendOffer}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Send Offer
            </button>

            <div className="mt-6 space-y-4">
              {offers.length === 0 && (
                <p className="text-gray-500">No offers yet.</p>
              )}
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="border rounded p-3 shadow bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {offer.my_item?.image_paths?.[0] && (
                      <Image
                        src={`${imageBucketUrl}${offer.my_item.image_paths[0]}`}
                        alt={offer.my_item.title}
                        width={80}
                        height={60}
                        className="rounded object-cover"
                        unoptimized
                      />
                    )}
                    <span className="text-sm font-semibold text-gray-800">
                      {offer.my_item?.title || 'Unknown'}
                    </span>
                    <span className="mx-2">→</span>
                    {offer.target_item?.image_paths?.[0] && (
                      <Image
                        src={`${imageBucketUrl}${offer.target_item.image_paths[0]}`}
                        alt={offer.target_item.title}
                        width={80}
                        height={60}
                        className="rounded object-cover"
                        unoptimized
                      />
                    )}
                    <span className="text-sm font-semibold text-gray-800">
                      {offer.target_item?.title || 'Unknown'}
                    </span>
                  </div>

                  {/* Offer sender info */}
                  {offer.from_profile && (
                    <p className="text-xs text-gray-600 mt-1">
                      👤 From: {offer.from_profile.full_name} ({offer.from_profile.phone})
                    </p>
                  )}

                  <p className="text-sm text-gray-700 mt-2">{offer.message}</p>
                  {offer.suggested_cash_topup !== 0 && (
                    <p className="text-xs text-green-700 mt-2 font-semibold">
                      Fairness:{' '}
                      {offer.suggested_cash_topup > 0
                        ? `You may need to add ₦${offer.suggested_cash_topup.toLocaleString()}`
                        : `Your item is worth ₦${Math.abs(
                            offer.suggested_cash_topup
                          ).toLocaleString()} more`}
                    </p>
                  )}
                  {offer.suggested_cash_topup === 0 && (
                    <p className="text-xs text-green-600 mt-2 font-semibold">
                      ✅ This is a fair swap
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-red-500">Please log in to send an offer.</p>
        )}
      </div>

      {/* Chat Section */}
      <div ref={chatRef} className="bg-white shadow rounded p-5">
        <h2 className="text-lg font-semibold mb-3">💬 Chat</h2>
        {session ? (
          <>
            <div className="bg-gray-50 border rounded h-60 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[70%] ${
                    msg.from_user === session.user.id
                      ? 'ml-auto text-right'
                      : ''
                  }`}
                >
                  {msg.content && (
                    <div
                      className={`p-2 rounded ${
                        msg.from_user === session.user.id
                          ? 'bg-green-200'
                          : 'bg-gray-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  {msg.from_user === session.user.id && msg.read_at && (
                    <p className="text-xs text-gray-500 mt-1">✓ Seen</p>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 mt-4">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message..."
                className="border rounded p-2 flex-grow"
              />
              <button
                onClick={handleSend}
                className="bg-green-600 text-white px-4 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-red-500">Please log in to chat.</p>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>

          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            initialSlide={lightboxIndex}
            spaceBetween={10}
            slidesPerView={1}
            className="w-full max-w-4xl"
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                {slide.type === 'image' ? (
                  <img
                    src={`${imageBucketUrl}${slide.path}`}
                    alt={`lightbox-${idx}`}
                    className="max-h-[80vh] mx-auto object-contain"
                    style={{ transform: `scale(${zoom})` }}
                  />
                ) : (
                  <video
                    src={`${videoBucketUrl}${slide.path}`}
                    controls
                    autoPlay
                    loop
                    muted
                    className="max-h-[80vh] mx-auto object-contain"
                    style={{ transform: `scale(${zoom})` }}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Zoom controls */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
              className="bg-white text-black px-3 py-1 rounded shadow"
            >
              ➖ Zoom Out
            </button>
            <button
              onClick={() => setZoom((z) => z + 0.2)}
              className="bg-white text-black px-3 py-1 rounded shadow"
            >
              ➕ Zoom In
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
