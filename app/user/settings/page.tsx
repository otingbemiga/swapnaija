'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const AVATARS_BUCKET = 'avatars'; // ✅ ensure this bucket exists in Supabase

function sanitizeFilename(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, '-') // spaces → dash
      .replace(/[^a-z0-9.\-_]/g, '') || 'file'
  );
}

export default function UserSettingsPage() {
  const session = useSession();
  const router = useRouter(); // ✅ for redirection
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Fetch profile on mount
  useEffect(() => {
    if (!session?.user) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address, state, lga, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error(error.message);
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
  }, [session]);

  // ✅ Upload avatar to avatars/{userId}/passport.ext
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!session?.user) {
        toast.error('Please log in');
        return;
      }
      if (!e.target.files?.length) return;

      setUploading(true);
      const file = e.target.files[0];

      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const filePath = `${session.user.id}/passport.${ext}`; // stable path per user

      const { error: uploadError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type || 'image/png',
        });

      if (uploadError) {
        console.error(uploadError);
        toast.error('Upload failed (check that the avatars bucket exists)');
        return;
      }

      // ✅ public URL (if bucket is public); otherwise use signed URL in UI
      const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // Update profile row
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (profileError) {
        console.error(profileError);
        toast.error('Avatar saved to storage, but profile update failed');
        return;
      }

      // Sync auth metadata (optional)
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (authError) console.warn('Auth metadata update failed:', authError.message);

      setAvatarUrl(publicUrl);
      toast.success('Passport uploaded ✅');
    } catch (err: any) {
      console.error(err.message || err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ✅ Save profile + redirect
  const handleSave = async () => {
    if (!session?.user) {
      toast.error('Please log in');
      return;
    }

    setLoading(true);

    // Update profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, address, state, lga })
      .eq('id', session.user.id);

    if (profileError) {
      console.error(profileError.message);
      toast.error('Failed to update profile');
      setLoading(false);
      return;
    }

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
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

    if (authError) {
      console.error(authError.message);
      toast.error('Failed to update auth metadata');
    } else {
      toast.success('Profile updated ✅');
      router.push('/admin/userdashboard'); // ✅ redirect after save
    }
  };

  if (!session) {
    return (
      <p className="text-center p-6 text-red-600">
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
            {/* Avatar */}
            <div className="mb-6 text-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Passport"
                  className="w-28 h-28 rounded-full object-cover mx-auto border"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center mx-auto border">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="text-sm"
                />
                {uploading && (
                  <p className="text-xs text-gray-500">Uploading...</p>
                )}
              </div>
            </div>

            {/* Full name */}
            <label className="block mb-3">
              <span className="text-gray-700">Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </label>

            {/* Phone */}
            <label className="block mb-3">
              <span className="text-gray-700">Phone</span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </label>

            {/* Address */}
            <label className="block mb-3">
              <span className="text-gray-700">Address</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </label>

            {/* State */}
            <label className="block mb-3">
              <span className="text-gray-700">State</span>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </label>

            {/* LGA */}
            <label className="block mb-3">
              <span className="text-gray-700">LGA</span>
              <input
                type="text"
                value={lga}
                onChange={(e) => setLga(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </label>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
