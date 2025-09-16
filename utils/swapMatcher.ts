// utils/swapMatcher.ts
import { supabase } from '@/lib/supabaseClient';

export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  state?: string;
  status: string;
  created_at: string;
  image_paths?: string[];
}

/**
 * Fetches potential swap matches for a given item ID based on points, category, and location proximity.
 */
export async function matchSwapItems(userItemId: string): Promise<Item[]> {
  // 1. Get the user's item details
  const { data, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('id', userItemId)
    .eq('status', 'approved')
    .single();

  if (itemError || !data) throw new Error('Your item was not found.');

  const userItem = data as Item; // cast to Item

  const pointMin = userItem.points * 0.9;
  const pointMax = userItem.points * 1.1;

  // 2. Fetch potential matches
  const { data: matchesData, error: matchError } = await supabase
    .from('items')
    .select('*')
    .neq('user_id', userItem.user_id)
    .eq('status', 'approved')
    .eq('category', userItem.category)
    .gte('points', pointMin)
    .lte('points', pointMax)
    .order('created_at', { ascending: false });

  if (matchError) throw matchError;

  const matches = (matchesData || []) as Item[];

  // 3. Optional: Sort closer items by same state first
  const sortedMatches = matches.sort((a: Item, b: Item) => {
    const stateA = a.state === userItem.state ? 0 : 1;
    const stateB = b.state === userItem.state ? 0 : 1;
    return stateA - stateB;
  });

  return sortedMatches;
}
