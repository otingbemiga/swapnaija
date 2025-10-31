'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import Image from 'next/image';


// ✅ Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ✅ Proper import for states & LGAs
import statesLgas from 'naija-state-local-government';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const session = useSession();

  const itemId = (params?.id as string) || '';

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [lgas, setLgas] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [points, setPoints] = useState<number>(0);
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [desiredSwap, setDesiredSwap] = useState('');

  // ✅ File state
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [video, setVideo] = useState<File | null>(null);

  // ✅ Preview state
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null, null]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // ✅ Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ✅ Fetch existing item on load
  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error || !data) {
        console.error('Fetch item error:', error);
        toast.error('Failed to load item');
        router.push('/user/userdashboard');
        return;
      }

      setTitle(data.title || '');
      setDescription(data.description || '');
      setCategory(data.category || '');
      setCondition(data.condition || '');
      setState(data.state || '');
      setLga(data.lga || '');
      setAddress(data.address || '');
      setPhone(data.phone || '');
      setPoints(data.points || 0);
      setEstimatedValue(data.estimated_value || 0);
      setDesiredSwap(data.desired_swap || '');

      if (data.image_paths) {
        const urls = data.image_paths.map((path: string) =>
          supabase.storage.from('item-images').getPublicUrl(path).data.publicUrl
        );
        setPreviewUrls(urls);
      }
      if (data.video_path) {
        const videoUrl = supabase.storage.from('item-videos').getPublicUrl(data.video_path).data.publicUrl;
        setVideoPreview(videoUrl);
      }

      setLoading(false);
    };

    fetchItem();
  }, [itemId, router]);

  // ✅ Update LGAs when state changes
  useEffect(() => {
    if (state) {
      const result = statesLgas.lgas(state)?.lgas || [];
      setLgas(result);
    } else {
      setLgas([]);
    }
  }, [state]);

  // ✅ Build previewSlides
  const previewSlides = [
    ...previewUrls.filter((url): url is string => Boolean(url)).map((url) => ({ type: 'image' as const, url })),
    ...(videoPreview ? [{ type: 'video' as const, url: videoPreview }] : []),
  ];

  // ✅ Handle file/image change
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedFiles = [...files];
      updatedFiles[index] = file;
      setFiles(updatedFiles);

      const updatedPreviews = [...previewUrls];
      updatedPreviews[index] = URL.createObjectURL(file);
      setPreviewUrls(updatedPreviews);
    }
  };

  // ✅ Handle video change
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 60 * 1024 * 1024) {
        toast.error('Video must be ≤ 60MB.');
        return;
      }
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!session?.user?.id) {
    toast.error('You must be logged in to edit an item.');
    return;
  }

  try {
    // ✅ BASIC ITEM UPDATE (Always safe)
    const { error: updateError } = await supabase
      .from('items')
      .update({
        title,
        description,
        category,
        condition,
        state,
        lga,
        address,
        phone,
        points,
        estimated_value: estimatedValue,
        desired_swap: desiredSwap,
        status: 'pending', // Re-approval required
      })
      .eq('id', itemId)
      .eq('user_id', session.user.id);

    if (updateError) {
      console.error('Update Error:', updateError);
      toast.error('Failed to update item.');
      return;
    }

    // ✅ Upload new IMAGES if any
    const newFiles = files.filter((f) => f !== null) as File[];
    let imagePaths: string[] = [];

    if (newFiles.length > 0) {
      const uploads = await Promise.all(
        newFiles.map(async (file) => {
          const path = `${Date.now()}-${file.name}`;
          const { error } = await supabase.storage
            .from('item-images')
            .upload(path, file, { upsert: true });

          if (error) throw error;
          return path;
        })
      );
      imagePaths = uploads;
    }

    // ✅ Upload new VIDEO if provided
    let videoPath: string | null = null;
    if (video) {
      const path = `${Date.now()}-${video.name}`;
      const { error } = await supabase.storage
        .from('item-videos')
        .upload(path, video, { upsert: true });

      if (error) throw error;
      videoPath = path;
    }

    // ✅ PRESERVE OLD MEDIA IF NOT REPLACED
    const finalImagePaths =
      imagePaths.length > 0
        ? imagePaths
        : previewUrls.filter((u) => u !== null).map((url) =>
            url!.split('/').pop()
          );

    const finalVideoPath =
      videoPath ||
      (videoPreview ? videoPreview.split('/').pop() : null);

    // ✅ ONLY update media if something changed
    if (imagePaths.length > 0 || videoPath) {
      await supabase
        .from('items')
        .update({
          image_paths: finalImagePaths,
          video_path: finalVideoPath,
        })
        .eq('id', itemId)
        .eq('user_id', session.user.id);
    }

     // ✅ Step 3: Notify Admin
      try {
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'Item Edited',
            message: `An item "${title}" was updated by a user and needs admin review.`,
            sender_id: session.user.id,
            recipient_id: 'admin',
            item_id: itemId,
          }),
        });
        console.log('✅ Admin notified successfully about edit.');
      } catch (notifyErr) {
        console.error('❌ Failed to notify admin:', notifyErr);
        
      }

    toast.success('✅ Item updated successfully!');
    router.push('/user/userdashboard');

  } catch (err) {
    console.error('Update item error:', err);
    toast.error('Failed to update item.');
  }
};




  if (loading) return <p className="p-6">Loading item...</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-md space-y-6">
      <h2 className="text-xl font-bold text-green-600">Edit Item</h2>

      {/* ✅ Live Preview Card */}
      <div className="p-4 border rounded-lg shadow-sm bg-gray-50 space-y-2">
        <h3 className="font-semibold text-lg">{title || 'Item title'}</h3>
        <p className="text-gray-700">{description || 'Item description...'}</p>

        <div className="text-sm space-y-1">
          <p><span className="font-semibold">📦 Condition:</span> {condition || 'N/A'}</p>
          <p><span className="font-semibold">⭐ Points:</span> {points || 0}</p>
          <p><span className="font-semibold">💰 Estimated Value:</span> <span className="text-green-600 font-semibold">₦{estimatedValue || 0}</span></p>
          <p><span className="font-semibold">🎯 Swap Request:</span> {desiredSwap || 'N/A'}</p>
          <p><span className="font-semibold">📍 Location:</span> {state && lga ? `${lga}, ${state}` : 'N/A'}</p>
          <p><span className="font-semibold">📞 Phone:</span> {phone || 'N/A'}</p>
          <p><span className="font-semibold">⏳ Status:</span> <span className="text-yellow-600 font-semibold">Pending</span></p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="Title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded" placeholder="Description" />
        <textarea value={desiredSwap} onChange={(e) => setDesiredSwap(e.target.value)} className="w-full p-2 border rounded" placeholder="What item do you want in exchange?" />

        {/* Category */}
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Select Category</option>
          <option value="Food">Food Item</option>
          <option value="Phone Accessories">Phone Accessories</option>
          <option value="Electronics">Electronics</option>
          <option value="Wears">Wears</option>
          <option value="Furniture">Furniture</option>
          <option value="Farm Produce">Farm Produce</option>
          <option value="Services">Services</option>
          <option value="Others">Others</option>
        </select>

        {/* Condition */}
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Select Condition</option>
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Used">Used</option>
          <option value="Heavily Used">Heavily Used</option>
        </select>

        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full p-2 border rounded" />

        {/* State + LGA */}
        <select value={state} onChange={(e) => setState(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Select State</option>
          {statesLgas.states().map((s: string) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select value={lga} onChange={(e) => setLga(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Select LGA</option>
          {lgas.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" placeholder="Phone Number" />
        <input type="number" value={points} onChange={(e) => setPoints(+e.target.value)} className="w-full p-2 border rounded" placeholder="Points" />
        <input type="number" value={estimatedValue} onChange={(e) => setEstimatedValue(+e.target.value)} className="w-full p-2 border rounded" placeholder="Estimated Value (₦)" />

        {/* Upload inputs */}
        {[0, 1, 2, 3].map((i) => (
          <input key={i} type="file" accept="image/*" onChange={(e) => handleFileChange(i, e)} className="w-full p-2 border rounded bg-white" />
        ))}
        <input type="file" accept="video/*" onChange={handleVideoChange} className="w-full p-2 border rounded bg-white" />

        {/* ✅ Preview Swiper */}
        {previewSlides.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            className="w-full rounded shadow"
            onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
          >
            {previewSlides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                {slide.type === 'image' ? (
                  <img
                    src={slide.url}
                    alt={`preview-${idx}`}
                    className="rounded shadow w-full h-60 object-cover cursor-pointer"
                    onClick={() => {
                      setZoom(1);
                      setLightboxOpen(true);
                      setCurrentSlide(idx);
                    }}
                  />
                ) : (
                  <video
                    src={slide.url}
                    controls
                    muted
                    loop
                    className="rounded shadow w-full h-60 object-cover cursor-pointer"
                    onClick={() => {
                      setZoom(1);
                      setLightboxOpen(true);
                      setCurrentSlide(idx);
                    }}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Update Item
        </button>
      </form>

      {/* ✅ Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button className="absolute top-4 right-4 text-white text-3xl" onClick={() => setLightboxOpen(false)}>✕</button>
          <div className="relative max-w-3xl w-full px-4">
            {previewSlides[currentSlide].type === 'image' ? (
              <Image
                src={previewSlides[currentSlide].url}
                alt="Zoomed"
                width={900}
                height={600}
                style={{ transform: `scale(${zoom})` }}
                className="transition-transform duration-300 rounded mx-auto"
                unoptimized
              />
            ) : (
              <video src={previewSlides[currentSlide].url} controls muted loop className="rounded mx-auto max-h-[80vh]" />
            )}
            <div className="flex justify-center gap-4 mt-4">
              <button className="bg-white px-3 py-1 rounded" onClick={() => setZoom((z) => Math.max(1, z - 0.2))}>➖ Zoom Out</button>
              <button className="bg-white px-3 py-1 rounded" onClick={() => setZoom((z) => z + 0.2)}>➕ Zoom In</button>
            </div>
            <div className="absolute inset-0 flex justify-between items-center px-4">
              <button onClick={() => setCurrentSlide((prev) => (prev === 0 ? previewSlides.length - 1 : prev - 1))} className="text-white text-3xl">◀</button>
              <button onClick={() => setCurrentSlide((prev) => (prev === previewSlides.length - 1 ? 0 : prev + 1))} className="text-white text-3xl">▶</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
