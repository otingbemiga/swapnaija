'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';

export default function ChatBox({ otherUserId, itemId }: { otherUserId: string; itemId: string }) {
  const session = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // ✅ Fetch existing chat messages
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_user.eq.${session?.user.id},to_user.eq.${otherUserId}),and(from_user.eq.${otherUserId},to_user.eq.${session?.user.id})`)
      .order('created_at', { ascending: true });

    if (error) console.error(error);
    else setMessages(data);
  };

  // ✅ Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { error } = await supabase.from('messages').insert([
      {
        from_user: session?.user.id,
        to_user: otherUserId,
        content: newMessage.trim(),
        item_id: itemId,
      },
    ]);

    if (error) {
      console.error(error);
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
    }
  };

  // ✅ Realtime subscription to new messages
  useEffect(() => {
    if (!session?.user) return;

    fetchMessages();

    const channel = supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(from_user.eq.${session.user.id},to_user.eq.${session.user.id})`,
        },
        (payload) => {
          const message = payload.new;
          // Only add if it belongs to this chat
          if (
            (message.from_user === session.user.id && message.to_user === otherUserId) ||
            (message.from_user === otherUserId && message.to_user === session.user.id)
          ) {
            setMessages((prev) => [...prev, message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, otherUserId]);

  return (
    <div className="flex flex-col h-[80vh] p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-[70%] ${
              msg.from_user === session?.user.id
                ? 'bg-blue-100 self-end ml-auto text-right'
                : 'bg-gray-100 self-start text-left'
            }`}
          >
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-1 border rounded-l-lg p-2 outline-none"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
