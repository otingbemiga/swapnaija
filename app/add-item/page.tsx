'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

const statesLgas: {
  states: () => string[];
  lgas: (state: string) => { lgas: string[] };
} = require('naija-state-local-government');

export default function AddItemPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true); // ✅ new

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoadingSession(false); // ✅ session check completed
    })();
  }, [supabase]);

  useEffect(() => {
    if (!loadingSession && !session) {
      router.push('/auth/login');
    }
  }, [loadingSession, session, router]);

  const [agreementAccepted, setAgreementAccepted] = useState(false);
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

  useEffect(() => {
    if (state) {
      const selectedLgas = statesLgas.lgas(state)?.lgas || [];
      setLgas(selectedLgas);
    } else {
      setLgas([]);
    }
  }, [state]);

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
      return toast.error('Video must be less than 60MB');
    }
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) return toast.error('Please login again.');

    if (!agreementAccepted)
      return toast.error('⚠️ You must agree to the terms.');

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
    )
      return toast.error('All fields are required!');

    try {
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
          user_id: user.id,
          status: 'pending',
          image_paths: [],
          video_path: null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Item submitted for review ✅');
      router.push(`/add-item/${insertedItem.id}`);

      (async () => {
        try {
          const uploadedImages: string[] = [];

          for (const image of images) {
            if (!image) continue;
            const filePath = `public/images/${insertedItem.id}-${Date.now()}-${image.name}`;
            await supabase.storage.from('item-images').upload(filePath, image);
            uploadedImages.push(filePath.replace('public/', ''));
          }

          let uploadedVideo: string | null = null;
          if (video) {
            const videoPath = `public/videos/${insertedItem.id}-${Date.now()}-${video.name}`;
            await supabase.storage.from('item-videos').upload(videoPath, video);
            uploadedVideo = videoPath.replace('public/', '');
          }

          await supabase
            .from('items')
            .update({ image_paths: uploadedImages, video_path: uploadedVideo })
            .eq('id', insertedItem.id);

        } catch (uploadErr) {
          console.warn('⚠ Upload issue:', uploadErr);
        }
      })();

    } catch (err: any) {
      console.warn(err.message);
      toast.error('Could not submit item.');
    }
  };

  const previewSlides = [
    ...previewUrls.filter(Boolean).map(url => ({ type: 'image', url: url! })),
    ...(videoPreview ? [{ type: 'video', url: videoPreview }] : []),
  ];

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking login...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Add Item | SwapNaija</title>
      </Head>

      <main
        className="min-h-screen bg-cover bg-center relative flex py-15 justify-center px-4"
        style={{ backgroundImage: "url('/swap-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-green-900 bg-opacity-60 z-0" />

        {!agreementAccepted && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
            <motion.div
              className="bg-white p-6 rounded shadow-xl max-w-lg w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h2 className="text-xl font-bold text-center text-red-700">
                🚨 User Agreement
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
              <div className="flex justify-between mt-6">
                <button onClick={() => router.push('/')} className="bg-gray-500 text-white px-4 py-2 rounded">
                  Decline
                </button>
                <button onClick={() => setAgreementAccepted(true)} className="bg-green-600 text-white px-4 py-2 rounded">
                  I Agree
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <motion.div
          className={`z-10 bg-white/95 p-6 rounded-lg shadow-2xl w-full max-w-2xl ${
            !agreementAccepted ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          <h1 className="text-center text-2xl font-bold text-green-700 mb-6">
            Add Your Swap Item
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="border p-2 rounded w-full" placeholder="Title" value={title}
              onChange={(e) => setTitle(e.target.value)} />

            <textarea className="border p-2 rounded w-full" placeholder="Description"
              value={description} onChange={(e) => setDescription(e.target.value)} rows={3}/>

            <textarea className="border p-2 rounded w-full" placeholder="Desired Swap"
              value={desiredSwap} onChange={(e) => setDesiredSwap(e.target.value)} rows={2}/>

            <select className="border p-2 rounded w-full" value={category}
              onChange={(e) => setCategory(e.target.value)}>
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

            <select className="border p-2 rounded w-full" value={condition}
              onChange={(e) => setCondition(e.target.value)}>
              <option value="">Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Fairly Used">Fairly Used</option>
            </select>

            <input className="border p-2 rounded w-full" placeholder="Address"
              value={address} onChange={(e) => setAddress(e.target.value)} />

            <select className="border p-2 rounded w-full" value={state}
              onChange={(e) => setState(e.target.value)}>
              <option value="">Select State</option>
              {statesLgas.states().map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select className="border p-2 rounded w-full" value={lga}
              onChange={(e) => setLga(e.target.value)} disabled={!state}>
              <option value="">Select LGA</option>
              {lgas.map((l: string) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <input className="border p-2 rounded w-full" placeholder="Phone Number"
              value={phone} onChange={(e) => setPhone(e.target.value)} />

            <input className="border p-2 rounded w-full" placeholder="Estimated Value ₦"
              value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)}
              type="number"/>

            <input className="border p-2 rounded w-full" placeholder="Extra Cash (Optional)"
              value={cashBalance} onChange={(e) => setCashBalance(e.target.value)}
              type="number"/>

            <label className="font-semibold block">Upload 4 Images</label>
            {images.map((_, idx) => (
              <input key={idx} type="file" accept="image/*"
                className="border p-2 rounded" required
                onChange={(e) =>
                  handleSingleImageUpload(idx, e.target.files ? e.target.files[0] : null)
                }/>
            ))}

            <label className="font-semibold block">Upload 60s Video</label>
            <input type="file" accept="video/*"
              className="border p-2 rounded" required
              onChange={(e) => handleVideoUpload(e.target.files ? e.target.files[0] : null)}
            />

            {previewSlides.length > 0 && (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                slidesPerView={1}
                className="w-full h-56 rounded shadow"
              >
                {previewSlides.map((slide, i) => (
                  <SwiperSlide key={i}>
                    {slide.type === 'image' ? (
                      <img src={slide.url} className="w-full h-56 object-cover rounded"/>
                    ) : (
                      <video src={slide.url} controls className="w-full h-56 rounded"/>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            <button className="bg-green-600 text-white w-full py-2 rounded font-bold">
              Submit for Review
            </button>
          </form>
        </motion.div>
      </main>
    </>
  );
}
