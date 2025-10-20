'use client';

import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Message } from '@/types'; // ✅ now works after creating types.ts

/**
 * Realtime message subscription hook.
 * @param supabase - Supabase client
 * @param conversationId - The active conversation ID
 * @param onNewMessage - Callback when a new message arrives
 */
export function useRealtimeMessages(
  supabase: SupabaseClient,
  conversationId: string | null,
  onNewMessage: (message: Message) => void
) {
  useEffect(() => {
    if (!conversationId) return;

    console.log(`[Realtime] Subscribing to conversation ${conversationId}`);

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log('[Realtime] New message:', newMessage);
          onNewMessage(newMessage);
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Unsubscribing from conversation ${conversationId}`);
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, onNewMessage]);
}
