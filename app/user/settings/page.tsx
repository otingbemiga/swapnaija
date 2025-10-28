'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const AVATARS_BUCKET = 'avatars';

export default function UserSettingsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    })();
  }, [supabase]);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address, state, lga, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        toast.error('Failed to load profile');
      } else if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setState(data.state || '');
        setLga(data.lga || '');
        setAvatarUrl(data.avatar_url || null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [session, supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user) return toast.error('Please log in');
    if (!e.target.files?.length) return;

    setUploading(true);
    const file = e.target.files[0];
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const filePath = `${session.user.id}/passport.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    await supabase.from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', session.user.id);

    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    setAvatarUrl(publicUrl);
    setUploading(false);
    toast.success('Passport updated ✅');
  };

  const handleSave = async () => {
    if (!session?.user) return toast.error('You must be logged in');

    setLoading(true);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        address,
        state,
        lga,
        avatar_url: avatarUrl || undefined
      })
      .eq('id', session.user.id);

    if (profileError) {
      setLoading(false);
      return toast.error('Failed to update profile');
    }

    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone,
        address,
        state,
        lga,
        avatar_url: avatarUrl || undefined,
      },
    });

    setLoading(false);
    toast.success('Profile updated ✅');
    router.push('/user/userdashboard');
  };

  if (!session) {
    return (
      <p className='text-center text-red-600 p-6'>
        Please log in to update your settings.
      </p>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-50 p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          User Settings
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <>
            <div className="mb-6 text-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Passport"
                  className="w-28 h-28 rounded-full object-cover mx-auto border"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 mx-auto border flex items-center justify-center">
                  <span className="text-gray-600 text-xs">No Image</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleAvatarUpload}
                className="mt-3 text-sm"
              />
            </div>

            <label className="block mb-3">
              Full Name
              <input className="border p-2 w-full rounded" value={fullName} onChange={e => setFullName(e.target.value)} />
            </label>

            <label className="block mb-3">
              Phone
              <input className="border p-2 w-full rounded" value={phone} onChange={e => setPhone(e.target.value)} />
            </label>

            <label className="block mb-3">
              Address
              <input className="border p-2 w-full rounded" value={address} onChange={e => setAddress(e.target.value)} />
            </label>

            <label className="block mb-3">
              State
              <input className="border p-2 w-full rounded" value={state} onChange={e => setState(e.target.value)} />
            </label>

            <label className="block mb-3">
              LGA
              <input className="border p-2 w-full rounded" value={lga} onChange={e => setLga(e.target.value)} />
            </label>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
