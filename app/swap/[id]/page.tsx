// app/swap/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import FloatingButton from '@/components/FloatingButton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Message {
  id: string;
  from_user: string;
  to_user: string;
  content: string;
  item_a_id?: string;
  item_b_id?: string;
  created_at?: string;
}

interface MatchItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  condition?: string;
  image_paths?: string[];
  video_paths?: string[];
  estimated_value?: number;
  desired_swap?: string;
  user_id?: string;
}

interface OwnerProfile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
}

export default function SwapChatPage() {
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const authUser = useUser();

  const [item, setItem] = useState<MatchItem | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<any>(null);
  const [myItems, setMyItems] = useState<MatchItem[]>([]);
  const [myItemId, setMyItemId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const imageBucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/item-images/`;
  const videoBucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/item-videos/`;

  // Fetch session
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    })();
  }, [supabase]);

  // Fetch item and owner
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      const { data: itemData, error } = await supabase.from('items').select('*').eq('id', id).maybeSingle();
      if (error || !itemData) {
        toast.error('Item not found');
        return;
      }
      setItem(itemData);
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, address')
        .eq('id', itemData.user_id)
        .maybeSingle();
      if (ownerData) setOwner(ownerData);
    };
    fetchItem();
  }, [id, supabase]);

  // Fetch user's own items
  useEffect(() => {
    const fetchMyItems = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: items } = await supabase.from('items').select('id,title,image_paths').eq('user_id', data.user.id);
      if (items) setMyItems(items);
    };
    fetchMyItems();
  }, [supabase]);

  // Fetch existing messages between both users
  const fetchMessages = async (otherUserId: string) => {
    const { data } = await supabase.auth.getUser();
    const currentUser = data.user;
    if (!currentUser) return;

    const res = await fetch(`/api/messages?userA=${currentUser.id}&userB=${otherUserId}`);
    const json = await res.json();
    if (Array.isArray(json)) {
      setMessages(json);
      scrollToBottom();
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!session?.user || !owner) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new;
        if (
          (newMsg.from_user === session.user.id && newMsg.to_user === owner.id) ||
          (newMsg.from_user === owner.id && newMsg.to_user === session.user.id)
        ) {
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user, owner, supabase]);

  // Auto-load existing messages
  useEffect(() => {
    if (owner && session?.user) fetchMessages(owner.id);
  }, [owner, session]);

  // Send message
  const handleSend = async () => {
    if (!message.trim()) return toast.error("Message is empty");
    if (!session?.user?.id) return toast.error("No sender found");
    if (!owner?.id) return toast.error("No recipient found");
    if (!item?.id) return toast.error("No target item found");
    if (!myItemId) return toast.error("Please select your item before sending a message");

    const payload = {
      from_user: session.user.id,
      to_user: owner.id,
      content: message,
      item_a_id: myItemId,
      item_b_id: item.id,
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Message failed');
        return;
      }

      setMessages((prev) => [...prev, json]);
      setMessage('');
      scrollToBottom();
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error while sending message');
    }
  };

  if (!item) {
    return (
      <main className="p-6 text-center min-h-screen flex items-center justify-center">
        <p>Loading item details...</p>
      </main>
    );
  }

  const isOwner = authUser?.id === item?.user_id;

  const slides = (item.image_paths || []).concat(item.video_paths || []);

  return (
    <main className="p-6 max-w-4xl mx-auto bg-gradient-to-b from-green-50 to-white min-h-screen">
      <FloatingButton onClick={scrollToBottom} />

      <h1 className="text-3xl font-extrabold text-green-700 mb-4">{item.title}</h1>

      {/* Media Swiper with staggered fade-in */}
      {slides.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          slidesPerView={1}
          className="w-full h-72 mb-6"
        >
          {slides.map((path, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.3, duration: 0.6 }}
                className="w-full h-72 flex justify-center items-center"
              >
                {path.endsWith('.mp4') ? (
                  <video
                    src={`${videoBucketUrl}${path}`}
                    controls
                    preload="metadata"
                    className="w-full h-72 object-cover rounded"
                  />
                ) : (
                  <Image
                    src={`${imageBucketUrl}${path}`}
                    alt="item"
                    width={800}
                    height={600}
                    loading="lazy"
                    className="w-full h-72 object-cover rounded"
                  />
                )}
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Item Details */}
      <div className="bg-white shadow rounded p-4 mb-8">
        <h2 className="font-bold text-lg mb-3">📋 Item Details</h2>
        <p><strong>Condition:</strong> {item.condition || 'N/A'}</p>
        <p><strong>Desired Swap:</strong> {item.desired_swap || 'Any good offer'}</p>
        <p><strong>Points:</strong> {item.estimated_value || 0}</p>
      </div>

      {/* Owner info */}
      {owner && (
        <div className="bg-white shadow p-4 rounded mb-6">
          <h2 className="font-bold text-lg mb-2">👤 Owner Info</h2>
          <p><b>Name:</b> {owner.full_name}</p>
          <p><b>Phone:</b> {owner.phone}</p>
          <p><b>Address:</b> {owner.address}</p>
        </div>
      )}

      {/* Select your item to link */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="font-bold mb-2">🔁 Select your item for swap</h2>
        <p><strong className='text-red-600'>It is important to select item before you chat</strong></p>
        <select
          className="w-full border rounded p-2"
          value={myItemId}
          onChange={(e) => setMyItemId(e.target.value)}
        >
          <option value="">-- Choose your item --</option>
          {myItems.map((mi) => (
            <option key={mi.id} value={mi.id}>{mi.title}</option>
          ))}
        </select>
      </div>

      {/* Chat */}
      <div className="bg-white shadow p-4 rounded">
        <h2 className="font-bold text-lg mb-3">💬 Chat</h2>
        <div className="h-64 overflow-y-auto border rounded p-3 mb-3 bg-gray-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-2 p-2 rounded max-w-[75%] ${
                m.from_user === session?.user?.id ? 'bg-green-100 ml-auto text-right' : 'bg-gray-200 mr-auto'
              }`}
            >
              <p className="text-sm">{m.content}</p>
              <p className="text-[10px] text-gray-500 mt-1">{new Date(m.created_at || '').toLocaleTimeString()}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isOwner ? "You cannot chat on your own item" : "Type a message..."}
            className="flex-1 border rounded p-2"
            disabled={isOwner}
            onKeyDown={(e) => {
              if (!isOwner && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isOwner}
            className={`px-4 py-2 rounded ${isOwner ? 'bg-gray-400' : 'bg-green-600 text-white'}`}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
