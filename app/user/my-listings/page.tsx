'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ✅ Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function MyListingsPage() {
  const session = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Record<string, any[]>>({}); // 🔄 item.id → recommended matches

  // Fetch user items
  useEffect(() => {
    if (!session?.user) return;

    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select(
          'id, title, description, condition, points, desired_swap, image_paths, video_path, status, user_id, created_at'
        )
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load your listings');
        console.error('❌ Error fetching items:', error.message);
      } else {
        setItems(data || []);
        if (data) fetchMatches(data);
      }
      setLoading(false);
    };

    // Fetch recommended matches for each item
    const fetchMatches = async (userItems: any[]) => {
      const matchesMap: Record<string, any[]> = {};

      for (const item of userItems) {
        if (!item.desired_swap) continue;

        const { data: potentialMatches, error } = await supabase
          .from('items')
          .select(
            'id, title, description, condition, points, image_paths, video_path, user_id, status'
          )
          .neq('user_id', session.user.id) // don’t recommend own items
          .ilike('title', `%${item.desired_swap}%`);

        if (error) {
          console.error(`❌ Error fetching matches for ${item.id}:`, error.message);
        } else {
          matchesMap[item.id] = potentialMatches || [];
        }
      }

      setMatches(matchesMap);
    };

    fetchItems();
  }, [session]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete item');
      console.error('❌ Error deleting item:', error.message);
    } else {
      toast.success('Item deleted');
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (!session) {
    return (
      <p className="p-6 text-center text-red-500">
        Please log in to view your listings.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="p-6 text-center text-gray-500">
        Loading your listings...
      </p>
    );
  }

  const bucketUrl =
    'https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/';

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">📦 My Listings</h1>

      {items.length === 0 ? (
        <p className="text-center text-gray-500">
          You have no listings yet.{' '}
          <Link href="/add-item" className="text-green-600 underline">
            Create one now
          </Link>.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {items.map((item) => {
            // ✅ Build media slides (images + optional video)
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
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition flex flex-col overflow-hidden"
              >
                {/* ✅ Swiper for images + video */}
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
                  <h2 className="text-lg font-semibold text-green-700">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-sm text-gray-700">
                    Condition: {item.condition || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700">⭐ Points: {item.points || 'N/A'}</p>
                  <p className="text-sm text-gray-700">
                    🎯 Desired Swap: {item.desired_swap || 'Not specified'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Status: {item.status}</p>

                  {/* ✅ Recommended Matches (Swiper carousel) */}
                  {matches[item.id] && matches[item.id].length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        You may like these matches:
                      </h3>
                      <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        spaceBetween={10}
                        slidesPerView={1}
                        className="w-full h-40"
                      >
                        {matches[item.id].map((match) => {
                          const matchImg =
                            match.image_paths?.length > 0
                              ? `${bucketUrl}item-images/${match.image_paths[0]}`
                              : null;

                          return (
                            <SwiperSlide key={match.id}>
                              <div className="p-2 border rounded-md bg-gray-50 flex gap-2 items-center">
                                {matchImg && (
                                  <img
                                    src={matchImg}
                                    alt={match.title}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-green-700 text-sm">
                                    {match.title}
                                  </p>
                                  <p className="text-gray-600 text-xs line-clamp-1">
                                    {match.description}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ⭐ {match.points || 'N/A'} |{' '}
                                    {match.condition || 'N/A'}
                                  </p>
                                  <Link
                                    href={`/item/${match.id}`}
                                    className="text-blue-600 hover:underline text-xs"
                                  >
                                    View Item →
                                  </Link>
                                </div>
                              </div>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
                    </div>
                  )}

                  <div className="flex justify-between mt-4">
                    <Link
                      href={`/edit-item/${item.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
