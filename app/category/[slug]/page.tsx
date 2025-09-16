'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// ✅ Define a safe payload type
type RealtimePayload<T = any> = {
  commit_timestamp: string;
  errors: any[] | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
  schema: string;
  table: string;
};

// ✅ Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ✅ Format errors
function formatSupabaseError(error: any): string {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in error) return (error as any).message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

// ✅ Highlight keyword in text
function highlightText(text: string, keyword: string) {
  if (!text || !keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-300 text-black">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const key = (slug as string)?.toLowerCase();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Filters
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [condition, setCondition] = useState('');
  const [minPoints, setMinPoints] = useState<number>(0);
  const [maxPoints, setMaxPoints] = useState<number>(1000);

  // ✅ Matches
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [matchItems, setMatchItems] = useState<Record<string, any[]>>({});
  const [loadingMatches, setLoadingMatches] = useState<string | null>(null);

  // ✅ User points (sync with dashboard)
  const [userPoints, setUserPoints] = useState<number>(0);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // ✅ Fetch logged-in user's points
  const fetchUserPoints = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setUserPoints(data.points);
    }
  };

  // ✅ Listen for realtime updates on points
  useEffect(() => {
    fetchUserPoints();

    const subscription = supabase
      .channel('points-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload: RealtimePayload<{ points: number }>) => {
          if (payload.new && payload.new.points !== undefined) {
            setUserPoints(payload.new.points);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // ✅ Fetch items
  const fetchItems = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('items')
        .select(
          `
          id,
          title,
          description,
          category,
          condition,
          state,
          lga,
          price,
          points,
          desired_swap,
          image_paths,
          video_path,
          created_at,
          status,
          user_id
        `
        )
        .ilike('category', `%${key}%`)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range((page - 1) * 12, page * 12 - 1);

      if (search) query = query.ilike('title', `%${search}%`);
      if (state) query = query.eq('state', state);
      if (condition) query = query.eq('condition', condition);
      if (minPoints) query = query.gte('points', minPoints);
      if (maxPoints) query = query.lte('points', maxPoints);

      const { data, error } = await query;

      if (error) {
        console.error('Error loading items:', formatSupabaseError(error));
        setItems([]);
        return;
      }

      const freshItems = data || [];

      setItems((prev) => {
        const all = [...(page === 1 ? [] : prev), ...freshItems];
        const unique = Array.from(new Map(all.map((i) => [i.id, i])).values());
        return unique.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      if (!data || data.length < 12) setHasMore(false);
    } catch (err: any) {
      console.error('Unexpected error:', formatSupabaseError(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch fuzzy matches
  const fetchMatches = async (item: any) => {
    setLoadingMatches(item.id);

    try {
      const { data, error } = await supabase.rpc('fuzzy_item_matches', {
        search_term: item.desired_swap,
        user_id_param: item.user_id,
      });

      if (error) {
        console.warn(
          `❌ Fuzzy match RPC error for ${item.id}:`,
          formatSupabaseError(error)
        );
        setMatchItems((prev) => ({ ...prev, [item.id]: [] }));
      } else {
        const sortedMatches = (data || []).sort(
          (a: any, b: any) => b.similarity_score - a.similarity_score
        );
        setMatchItems((prev) => ({ ...prev, [item.id]: sortedMatches }));
      }
    } catch (err: any) {
      console.error('Unexpected match error:', formatSupabaseError(err));
      setMatchItems((prev) => ({ ...prev, [item.id]: [] }));
    } finally {
      setLoadingMatches(null);
    }
  };

  // ✅ Toggle matches
  const toggleMatches = (item: any) => {
    if (expandedItems.has(item.id)) {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    } else {
      fetchMatches(item);
      setExpandedItems((prev) => new Set(prev).add(item.id));
    }
  };

  // Reset when filters change
  useEffect(() => {
    if (key) {
      setPage(1);
      setItems([]);
      setHasMore(true);
    }
  }, [key, search, state, condition, minPoints, maxPoints]);

  useEffect(() => {
    if (key) fetchItems();
  }, [page, key, search, state, condition, minPoints, maxPoints]);

  const bucketUrl =
    'https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/';

  return (
    <main className="p-6 max-w-6xl mx-auto min-h-screen bg-gradient-to-b from-green-100 via-white to-green-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-extrabold text-green-800">
          {slug?.toString().toUpperCase()} Items
        </h1>
        <p className="text-green-700 font-bold">💰 {userPoints} Points</p>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Any Condition</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min Points"
            value={minPoints}
            onChange={(e) => setMinPoints(Number(e.target.value))}
            className="border p-2 rounded w-1/2"
          />
          <input
            type="number"
            placeholder="Max Points"
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
            className="border p-2 rounded w-1/2"
          />
        </div>
      </div>

      {/* Results */}
      {loading && page === 1 ? (
        <p className="text-gray-600">Loading items...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 bg-white border rounded p-4 shadow-sm">
          No items found in this category with your filters.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {items.map((item, index) => {
            const slides: { type: 'image' | 'video'; url: string }[] = [];
            if (item.image_paths?.length > 0) {
              item.image_paths.forEach((imgPath: string) => {
                slides.push({
                  type: 'image',
                  url: `${bucketUrl}item-images/${imgPath}`,
                });
              });
            }
            if (item.video_path) {
              slides.push({
                type: 'video',
                url: `${bucketUrl}item-videos/${item.video_path}`,
              });
            }

            return (
              <div
                key={item.id}
                ref={index === items.length - 1 ? lastItemRef : undefined}
                className="border rounded-lg shadow hover:shadow-lg transition bg-white flex flex-col overflow-hidden"
              >
                {slides.length > 0 && (
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    spaceBetween={10}
                    slidesPerView={1}
                    className="w-full h-48"
                  >
                    {slides.map((slide, idx) => (
                      <SwiperSlide key={idx}>
                        {slide.type === 'image' ? (
                          <img
                            src={slide.url}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-48 object-cover"
                            controls
                            muted
                          />
                        )}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}

                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-sm text-green-700 mt-1 font-medium">
                    {item.points} pts | ₦{item.price || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    📍 {item.state || 'N/A'}, {item.lga || 'N/A'}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => router.push(`/swap/${item.id}`)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                    >
                      View Item →
                    </button>
                    <button
                      onClick={() => toggleMatches(item)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      {expandedItems.has(item.id)
                        ? 'Hide Matches'
                        : 'View Matches'}
                    </button>
                  </div>

                  {/* Matches Section */}
                  {expandedItems.has(item.id) && (
                    <div className="mt-4 bg-gray-50 p-2 rounded border">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Matches for "
                        {highlightText(item.desired_swap, item.desired_swap)}"
                      </h3>
                      {loadingMatches === item.id ? (
                        <p className="text-xs text-gray-500">
                          Loading matches...
                        </p>
                      ) : (matchItems[item.id] || []).length === 0 ? (
                        <p className="text-xs text-gray-500">No matches found.</p>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {matchItems[item.id].map((m) => {
                            const mSlides: {
                              type: 'image' | 'video';
                              url: string;
                            }[] = [];
                            if (m.image_paths?.length > 0) {
                              m.image_paths.forEach((imgPath: string) => {
                                mSlides.push({
                                  type: 'image',
                                  url: `${bucketUrl}item-images/${imgPath}`,
                                });
                              });
                            }
                            if (m.video_path) {
                              mSlides.push({
                                type: 'video',
                                url: `${bucketUrl}item-videos/${m.video_path}`,
                              });
                            }

                            return (
                              <div
                                key={m.id}
                                className="border rounded shadow bg-white overflow-hidden"
                              >
                                {mSlides.length > 0 && (
                                  <Swiper
                                    modules={[Navigation, Pagination]}
                                    pagination={{ clickable: true }}
                                    spaceBetween={10}
                                    slidesPerView={1}
                                    className="w-full h-32"
                                  >
                                    {mSlides.map((slide, idx) => (
                                      <SwiperSlide key={idx}>
                                        {slide.type === 'image' ? (
                                          <img
                                            src={slide.url}
                                            alt={m.title}
                                            className="w-full h-32 object-cover rounded-t"
                                          />
                                        ) : (
                                          <video
                                            src={slide.url}
                                            className="w-full h-32 object-cover rounded-t"
                                            controls
                                            muted
                                          />
                                        )}
                                      </SwiperSlide>
                                    ))}
                                  </Swiper>
                                )}
                                <div className="p-2">
                                  <h4 className="text-sm font-medium">
                                    {highlightText(m.title, item.desired_swap)}
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    {highlightText(
                                      m.description || '',
                                      item.desired_swap
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {m.points} pts | ₦{m.price || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500 italic">
                                    Similarity: {m.similarity_score?.toFixed(2)}
                                  </p>
                                  <Link
                                    href={`/swap/${m.id}`}
                                    className="block mt-1 bg-green-500 text-white text-xs px-2 py-1 rounded text-center"
                                  >
                                    View →
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && page > 1 && (
        <p className="text-center mt-4 text-sm text-gray-500">
          Loading more...
        </p>
      )}
      {!hasMore && (
        <p className="text-center mt-4 text-sm text-gray-400">
          No more items to show.
        </p>
      )}
    </main>
  );
}
