'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function SwapPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  // ✅ Infinite scroll observer
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

  // ✅ Fetch approved items
  const fetchItems = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('items')
      .select(
        'id, title, description, category, condition, state, lga, estimated_value, cash_balance, desired_swap, image_paths, video_path, created_at, status'
      )
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range((page - 1) * 12, page * 12 - 1);

    if (error) {
      console.error('❌ Error fetching items:', error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setItems((prev) => {
        const all = [...prev, ...data];
        const unique = Array.from(new Map(all.map((item) => [item.id, item])).values());
        return unique.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      if (data.length < 12) setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  // ✅ Group items by category
  const groupedByCategory = useMemo(() => {
    return items.reduce((acc: Record<string, any[]>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [items]);

  const bucketUrl = 'https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/';

  // ✅ Modified: allow non-logged users to view item detail page
  const handleSwapClick = (itemId: string) => {
    router.push(`/swap/${itemId}`);
  };

  // Motion variants
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="p-6 min-h-screen bg-gradient-to-b from-green-50 to-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700">Explore Swap Opportunities</h1>
        <p className="text-sm text-gray-600 mt-2">
          Discover items grouped by category. Each card shows total value (item + cash balance).
        </p>
      </div>

      {Object.entries(groupedByCategory).map(([cat, catItems]) => (
        <section key={cat} className="mb-14">
          <h2
            className="text-2xl font-bold text-green-600 mb-4 cursor-pointer hover:underline"
            onClick={() => router.push(`/category/${encodeURIComponent(cat)}`)}
          >
            {cat}
          </h2>

          <motion.div
            className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {catItems.slice(0, 3).map((item, index) => {
              const estimated = Number(item.estimated_value || 0);
              const cash = Number(item.cash_balance || 0);
              const totalValue = estimated + cash;

              const slides = [];
              if (item.image_paths?.length > 0) {
                item.image_paths.forEach((imgPath: string) => {
                  slides.push({ type: 'image', url: `${bucketUrl}item-images/${imgPath}` });
                });
              }
              if (item.video_path) {
                slides.push({ type: 'video', url: `${bucketUrl}item-videos/${item.video_path}` });
              }

              const matchingItems = catItems.filter((i) => i.id !== item.id).slice(0, 2);

              return (
                <motion.div
                  key={item.id}
                  ref={index === catItems.length - 1 ? lastItemRef : undefined}
                  className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition flex flex-col"
                  variants={itemVariants}
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
                            <img src={slide.url} alt={item.title} className="w-full h-48 object-cover" />
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
                    <h3 className="text-lg font-semibold text-green-700">{item.title}</h3>
                    <p className="text-xs">📍 {item.state}, {item.lga}</p>
                    <p className="text-xs">💰 Value: ₦{totalValue.toLocaleString()}</p>
                    {cash > 0 && (
                      <p className="text-xs text-blue-600">+ Cash Balance: ₦{cash.toLocaleString()}</p>
                    )}
                    <p className="text-xs">🛠️ {item.condition}</p>

                    {item.desired_swap && (
                      <p className="text-xs text-gray-600 mt-1">🎯 Wants: {item.desired_swap}</p>
                    )}

                    {matchingItems.length > 0 && (
                      <div className="mt-3 border-t pt-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Matching Items:</p>
                        <ul className="text-xs space-y-1">
                          {matchingItems.map((match) => (
                            <li
                              key={match.id}
                              className="cursor-pointer text-green-600 hover:underline"
                              onClick={() => router.push(`/swap/${match.id}`)}
                            >
                              📦 {match.title} — ₦
                              {(
                                Number(match.estimated_value || 0) +
                                Number(match.cash_balance || 0)
                              ).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm w-full"
                      onClick={() => handleSwapClick(item.id)}
                    >
                      Swap Now
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {catItems.length > 3 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">You may also like</h3>
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
                className="w-full"
              >
                {catItems.slice(3, 9).map((rec) => {
                  const recValue = Number(rec.estimated_value || 0) + Number(rec.cash_balance || 0);

                  return (
                    <SwiperSlide key={rec.id}>
                      <motion.div
                        className="bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-lg transition"
                        onClick={() => router.push(`/swap/${rec.id}`)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {rec.image_paths?.[0] && (
                          <img
                            src={`${bucketUrl}item-images/${rec.image_paths[0]}`}
                            alt={rec.title}
                            className="w-full h-32 object-cover rounded"
                          />
                        )}
                        <h4 className="text-sm font-semibold text-green-700 mt-2">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          ₦{recValue.toLocaleString()}
                        </p>
                      </motion.div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          )}
        </section>
      ))}

      {loading && <p className="text-center mt-4 text-sm text-gray-500">Loading more...</p>}
      {!hasMore && <p className="text-center mt-4 text-sm text-gray-400">No more items to show.</p>}
    </main>
  );
}
