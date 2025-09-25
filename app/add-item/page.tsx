'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';

// ✅ Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// ✅ Proper typing for naija-state-local-government
const statesLgas: {
  states: () => string[];
  lgas: (state: string) => { lgas: string[] };
} = require('naija-state-local-government');

export default function AddItemPage() {
  const router = useRouter();
  const session = useSession();

  const [agreementAccepted, setAgreementAccepted] = useState(false); // ✅ new state

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [desiredSwap, setDesiredSwap] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null, null]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [condition, setCondition] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [lgas, setLgas] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<string>('');
  const [cashBalance, setCashBalance] = useState<string>('');

  // Redirect if not logged in
  useEffect(() => {
    if (!session) router.push('/auth/login');
  }, [session, router]);

  // Load LGAs when state changes
  useEffect(() => {
    if (state) {
      const selectedLgas = statesLgas.lgas(state)?.lgas || [];
      setLgas(selectedLgas);
    } else {
      setLgas([]);
    }
  }, [state]);

  // Handle single image + preview
  const handleSingleImageUpload = (index: number, file: File | null) => {
    const newImages = [...images];
    const newPreviews = [...previewUrls];
    newImages[index] = file;
    newPreviews[index] = file ? URL.createObjectURL(file) : null;
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleVideoUpload = (file: File | null) => {
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) {
      toast.error('Video must be less than 60MB (≈60s).');
      return;
    }
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreementAccepted) {
      toast.error('⚠️ You must accept the User Agreement before adding an item.');
      return;
    }

    if (
      !title ||
      !description ||
      !desiredSwap ||
      !category ||
      images.some((img) => img === null) ||
      !video ||
      !state ||
      !lga ||
      !phone ||
      !address ||
      !condition ||
      !estimatedValue
    ) {
      toast.error('All fields are required! (4 images + 1 video + estimated value)');
      return;
    }

    try {
      // 1️⃣ Insert item FIRST with empty media → get ID
      const { data: insertedItem, error } = await supabase
        .from('items')
        .insert({
          title,
          description,
          desired_swap: desiredSwap,
          category,
          condition,
          state,
          lga,
          phone,
          address,
          estimated_value: Number(estimatedValue),
          cash_balance: cashBalance ? Number(cashBalance) : 0,
          image_paths: [],
          video_path: null,
          status: 'pending', // ✅ goes for review
          user_id: session?.user?.id,
          points: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Item submitted for review! Redirecting…');
      router.push(`/add-item/${insertedItem.id}`);

      // 2️⃣ Background uploads (images + video)
      (async () => {
        try {
          const uploadedImages: string[] = [];

          for (const image of images) {
            if (!image) continue;
            const filePath = `public/images/${insertedItem.id}-${Date.now()}-${image.name}`;
            const { error: imgError } = await supabase.storage
              .from('item-images')
              .upload(filePath, image, { contentType: image.type });
            if (imgError) throw imgError;
            uploadedImages.push(filePath.replace('public/', ''));
          }

          let uploadedVideo: string | null = null;
          if (video) {
            const videoPath = `public/videos/${insertedItem.id}-${Date.now()}-${video.name}`;
            const { error: vidError } = await supabase.storage
              .from('item-videos')
              .upload(videoPath, video, { contentType: video.type });
            if (vidError) throw vidError;
            uploadedVideo = videoPath.replace('public/', '');
          }

          await supabase
            .from('items')
            .update({ image_paths: uploadedImages, video_path: uploadedVideo })
            .eq('id', insertedItem.id);
        } catch (uploadErr: any) {
          console.error('⚠️ Background upload failed:', uploadErr.message);
        }
      })();

      // 3️⃣ Log Activity
      await supabase.from('activities').insert([
        {
          user_id: session?.user?.id,
          action: 'ITEM_SUBMITTED',
          item_id: insertedItem.id,
        },
      ]);

      // 4️⃣ Notify admin (use API route)
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ITEM_SUBMITTED',
          message: `New item submitted: "${title}"`,
          sender_id: session?.user?.id,
          recipient_id: process.env.NEXT_PUBLIC_ADMIN_USER_ID, // ⚠️ set in .env
          item_id: insertedItem.id,
        }),
      });
    } catch (err: any) {
      console.warn('❌ Add item failed:', err.message);
      toast.error('Could not submit item.');
    }
  };

  // ✅ Build previews
  const previewSlides = [
    ...previewUrls
      .filter((url): url is string => Boolean(url))
      .map((url) => ({ type: 'image', url })),
    ...(videoPreview ? [{ type: 'video', url: videoPreview }] : []),
  ];

  return (
    <>
      <Head>
        <title>Add Item | SwapNaija</title>
      </Head>
      <main
        className="min-h-screen bg-cover bg-center relative flex py-15 items-center justify-center px-4"
        style={{ backgroundImage: "url('/swap-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-green-900 bg-opacity-60 z-0" />

        {/* ✅ User Agreement Modal */}
        {!agreementAccepted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full space-y-4"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-center text-red-700">
                🚨 User Agreement (Strict Policy)
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                By proceeding, you confirm that <strong>any item you list on SwapNaija is your
                rightful property</strong>. You further affirm that the item is <strong>NOT stolen,
                illegally obtained, or involved in any fraudulent activity</strong>.  
                <br /><br />
                Submitting stolen or fraudulent items will result in <strong>immediate account
                termination</strong>, possible <strong>legal action</strong>, and cooperation with
                law enforcement agencies.  
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Decline
                </button>
                <button
                  onClick={() => setAgreementAccepted(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  I Agree
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ✅ Main Form (disabled if agreement not accepted) */}
        <motion.div
          className={`z-10 bg-white/90 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl space-y-6 ${
            !agreementAccepted ? 'pointer-events-none opacity-40' : ''
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-2xl font-bold text-center text-green-700">
            Add Your Swap Item
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {/* Basic info */}
            <input
              type="text"
              placeholder="Item Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded"
              rows={4}
              required
            />
            <textarea
              placeholder="What do you want in exchange?"
              value={desiredSwap}
              onChange={(e) => setDesiredSwap(e.target.value)}
              className="border p-2 rounded"
              rows={2}
              required
            />

            {/* Category & Condition */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Category</option>
              <option value="Food">Food Item</option>
              <option value="Phone">Phone Accessories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Wears">Wears</option>
              <option value="Services">Services</option>
              <option value="Farm">Farm Produce</option>
              <option value="Others">Others</option>
            </select>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Fairly Used">Fairly Used</option>
            </select>

            {/* Address & Location */}
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="border p-2 rounded"
              required
            >
              <option value="">Select State</option>
              {statesLgas.states().map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              disabled={!state}
              className="border p-2 rounded"
              required
            >
              <option value="">Select LGA</option>
              {lgas.map((l: string) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2 rounded"
              required
            />

            {/* Value & Cash Option */}
            <input
              type="number"
              placeholder="Estimated Value (₦)"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Add Cash Balance (Optional)"
              value={cashBalance}
              onChange={(e) => setCashBalance(e.target.value)}
              className="border p-2 rounded"
            />

            {/* Image Uploads */}
            <label className="font-semibold">Upload 4 Images</label>
            {images.map((_, idx) => (
              <input
                key={idx}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleSingleImageUpload(idx, e.target.files ? e.target.files[0] : null)
                }
                className="border p-2 rounded bg-white"
                required
              />
            ))}

            {/* Video Upload */}
            <label className="font-semibold">Upload 60s Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoUpload(e.target.files ? e.target.files[0] : null)}
              className="border p-2 rounded bg-white"
              required
            />

            {/* ✅ Preview Swiper */}
            {previewSlides.length > 0 && (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={10}
                slidesPerView={1}
                className="w-full rounded shadow"
              >
                {previewSlides.map((slide, idx) => (
                  <SwiperSlide key={idx}>
                    {slide.type === 'image' ? (
                      <img
                        src={slide.url}
                        alt={`preview-${idx}`}
                        className="rounded shadow w-full h-60 object-cover"
                      />
                    ) : (
                      <video
                        src={slide.url}
                        controls
                        autoPlay
                        muted
                        loop
                        className="rounded shadow w-full h-60 object-cover"
                      />
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            <button
              type="submit"
              className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold"
            >
              Submit for Review
            </button>
          </form>
        </motion.div>
      </main>
    </>
  );
}
