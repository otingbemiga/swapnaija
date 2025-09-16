'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// ✅ Define Item type (matches your DB schema)
type Item = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  condition?: string;
  state?: string;
  lga?: string;
  address?: string;
  phone?: string;
  desired_swap?: string;
  image_paths?: string[];
  video_path?: string | null;
  estimated_value?: number | string;
  cash_balance?: number | string;
  status?: string;
  user_id?: string;
};

export default function AddItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const session = useSession();
  const [item, setItem] = useState<Item | null>(null);
  const [matches, setMatches] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  // ✅ Supabase public bucket URLs
  const imageBucketUrl =
    'https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/';
  const videoBucketUrl =
    'https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-videos/';

  useEffect(() => {
    const fetchItemAndMatches = async () => {
      // 🔧 Removed `<Item>` from .single()
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (itemError || !itemData) {
        toast.error('Item not found.');
        router.push('/swap');
        return;
      }

      setItem(itemData);
      setLoading(false);

      // Compute total value of this item
      const itemTotal =
        Number(itemData.estimated_value || 0) +
        Number(itemData.cash_balance || 0);

      const minVal = Math.floor(itemTotal * 0.9);
      const maxVal = Math.ceil(itemTotal * 1.1);

      // Fetch potential matches
      const { data: matchedItems, error: matchError } = await supabase
        .from('items')
        .select('*')
        .neq('user_id', itemData.user_id)
        .eq('status', 'approved')
        .eq('category', itemData.category);

      if (!matchError && matchedItems) {
        const filtered = matchedItems.filter((m: Item) => {
          const total =
            Number(m.estimated_value || 0) + Number(m.cash_balance || 0);
          return total >= minVal && total <= maxVal;
        });

        const sortedMatches = filtered.sort((a: Item, b: Item) => {
          if (a.state === itemData.state && b.state !== itemData.state) return -1;
          if (b.state === itemData.state && a.state !== itemData.state) return 1;
          return 0;
        });

        setMatches(sortedMatches);
      }
    };

    if (id) fetchItemAndMatches();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete item.');
    } else {
      toast.success('Item deleted.');
      router.push('/swap');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!item) return <div className="p-6 text-center">Item not found.</div>;

  const isOwner = session?.user?.id === item.user_id;

  // ✅ Build slides (images + video)
  const slides = [
    ...(item.image_paths?.map((img: string) => ({ type: 'image', path: img })) ||
      []),
    ...(item.video_path ? [{ type: 'video', path: item.video_path }] : []),
  ];

  const totalValue =
    Number(item.estimated_value || 0) + Number(item.cash_balance || 0);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* ✅ Media Swiper always on top */}
        {slides.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            className="w-full h-80 bg-black"
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                {slide.type === 'image' ? (
                  <Image
                    src={`${imageBucketUrl}${slide.path}`}
                    alt={`slide-${idx}`}
                    width={600}
                    height={400}
                    className="w-full h-80 object-cover cursor-pointer"
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
                    className="w-full h-80 object-cover cursor-pointer"
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

        {/* ✅ Item details below media */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-700 mb-3">{item.title}</h1>
          <p className="mb-2"><strong>Description:</strong> {item.description}</p>
          <p className="mb-2"><strong>Desired Swap:</strong> {item.desired_swap || 'Not specified'}</p>
          <p className="mb-2"><strong>Category:</strong> {item.category}</p>
          <p className="mb-2"><strong>Condition:</strong> {item.condition}</p>
          <p className="mb-2"><strong>Address:</strong> {item.address}</p>
          <p className="mb-2"><strong>Location:</strong> {item.state}, {item.lga}</p>
          <p className="mb-2"><strong>Phone:</strong> {item.phone}</p>
          <p className="mb-2"><strong>Estimated Value:</strong> ₦{Number(item.estimated_value || 0).toLocaleString()}</p>
          <p className="mb-2"><strong>Cash Balance:</strong> ₦{Number(item.cash_balance || 0).toLocaleString()}</p>
          <p className="text-green-700 font-semibold">💰 Total Value: ₦{totalValue.toLocaleString()}</p>
          <p className="mb-2"><strong>Status:</strong> {item.status}</p>

          {isOwner && (
            <div className="mt-4 flex gap-4">
              <Link href={`/edit-item/${item.id}`} className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600">Edit</Link>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Matching Items Section */}
      {matches.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Matching Swap Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match: Item) => {
              const matchTotal =
                Number(match.estimated_value || 0) +
                Number(match.cash_balance || 0);
              const diff = matchTotal - totalValue;

              let fairnessMsg = '';
              if (diff > 0) {
                fairnessMsg = `This match is ₦${diff.toLocaleString()} higher → you may need to add ₦${diff.toLocaleString()}`;
              } else if (diff < 0) {
                fairnessMsg = `Your item is ₦${Math.abs(diff).toLocaleString()} higher → they may need to add ₦${Math.abs(diff).toLocaleString()}`;
              } else {
                fairnessMsg = 'This is a fair swap ✅';
              }

              const matchSlides = [
                ...(match.image_paths?.map((img: string) => ({ type: 'image', path: img })) || []),
                ...(match.video_path ? [{ type: 'video', path: match.video_path }] : []),
              ];

              return (
                <div key={match.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {matchSlides.length > 0 && (
                    <Swiper
                      modules={[Navigation, Pagination]}
                      pagination={{ clickable: true }}
                      spaceBetween={10}
                      slidesPerView={1}
                      className="w-full h-48"
                    >
                      {matchSlides.map((slide, idx) => (
                        <SwiperSlide key={idx}>
                          {slide.type === 'image' ? (
                            <Image
                              src={`${imageBucketUrl}${slide.path}`}
                              alt={match.title}
                              width={400}
                              height={300}
                              className="w-full h-48 object-cover"
                              unoptimized
                            />
                          ) : (
                            <video
                              src={`${videoBucketUrl}${slide.path}`}
                              controls
                              muted
                              loop
                              className="w-full h-48 object-cover"
                            />
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}

                  <div className="p-3">
                    <h3 className="font-bold text-lg text-green-700">{match.title}</h3>
                    <p>{match.description}</p>
                    <p><strong>Desired Swap:</strong> {match.desired_swap || 'Not specified'}</p>
                    <p><strong>Total Value:</strong> ₦{matchTotal.toLocaleString()}</p>
                    <p className="text-sm text-blue-700 mt-1">{fairnessMsg}</p>
                    <p><strong>Location:</strong> {match.state}, {match.lga}</p>
                    <Link
                      href={`/swap/${match.id}`}
                      className="inline-block mt-2 text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                    >
                      View Item
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ Lightbox */}
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
                  <Image
                    src={`${imageBucketUrl}${slide.path}`}
                    alt={`lightbox-${idx}`}
                    width={900}
                    height={600}
                    style={{ transform: `scale(${zoom})` }}
                    className="transition-transform duration-300 rounded mx-auto"
                    unoptimized
                  />
                ) : (
                  <video
                    src={`${videoBucketUrl}${slide.path}`}
                    controls
                    muted
                    loop
                    className="rounded shadow w-full max-h-[80vh] object-contain mx-auto"
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {slides[lightboxIndex]?.type === 'image' && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="bg-white px-3 py-1 rounded"
                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
              >
                ➖ Zoom Out
              </button>
              <button
                className="bg-white px-3 py-1 rounded"
                onClick={() => setZoom((z) => z + 0.2)}
              >
                ➕ Zoom In
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
