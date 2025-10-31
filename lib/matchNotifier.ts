import { createClient } from '@supabase/supabase-js';

// ✅ Secure Supabase client (server-side key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Sends a notification to the item owner when a new match is found.
 *
 * @param item - Object containing item data (id, title, desired_swap, user_id)
 */
export async function checkAndNotifyMatches(item: {
  id: string;
  title: string;
  description?: string;
  desired_swap?: string;
  user_id: string;
}) {
  try {
    if (!item?.user_id || !item?.id) {
      console.warn('⚠️ Missing item or user ID in checkAndNotifyMatches');
      return;
    }

    // ✅ Check if notification already exists for this item
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('item_id', item.id)
      .eq('type', 'match')
      .eq('recipient_id', item.user_id)
      .maybeSingle();

    if (existing) {
      console.log(`ℹ️ Match notification already exists for item ${item.id}`);
      return;
    }

    // ✅ Create new notification for owner
    const message = `🎉 Your item "${item.title}" now has a match available for swap!`;

    const { error } = await supabase.from('notifications').insert([
      {
        type: 'match',
        message,
        recipient_id: item.user_id,
        sender_email: 'system@swapnaija.com',
        item_id: item.id,
        status: 'unread',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('❌ Error inserting match notification:', error.message);
      return;
    }

    console.log(`✅ Match notification sent for item "${item.title}"`);
  } catch (err: any) {
    console.error('❌ checkAndNotifyMatches failed:', err.message || err);
  }
}
