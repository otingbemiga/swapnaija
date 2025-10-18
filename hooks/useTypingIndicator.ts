'use client';
import { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export function useTypingIndicator(
  supabase: SupabaseClient,
  conversationId: string | null,
  userId: string | null
) {
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});

  const sendTyping = () => {
    if (!conversationId || !userId) return;
    supabase.channel(`typing-${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId },
    });
  };

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`typing-${conversationId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on('broadcast', { event: 'typing' }, (payload) => {
      const sender = payload.payload.userId;
      if (sender === userId) return;
      setTypingUsers((prev) => ({ ...prev, [sender]: Date.now() }));
    });

    channel.subscribe();

    const cleanup = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([_, t]) => now - t < 2500))
      );
    }, 1000);

    return () => {
      clearInterval(cleanup);
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  const isSomeoneTyping = Object.keys(typingUsers).length > 0;
  return { sendTyping, isSomeoneTyping };
}
