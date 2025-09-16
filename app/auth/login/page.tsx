'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';

export default function LoginPage() {
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ toggle

  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const handleEmailLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('✅ Welcome back!');
      router.push('/');
    }
    setLoading(false);
  };

  const handlePhoneLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('📩 OTP sent to your phone');
      router.push('/verify-otp');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | SwapHub</title>
      </Head>

      <main
        className="min-h-screen bg-cover bg-center relative flex items-center justify-center px-4"
        style={{
          backgroundImage: `url('none')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

        <motion.div
          className="z-10 bg-white/90 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-2xl font-bold text-center text-green-700">Login to SwapHub</h1>

          <div className="flex justify-center gap-4">
            <button
              className={`px-4 py-2 rounded-t-md font-medium ${tab === 'email' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setTab('email')}
            >
              Login with Email
            </button>
            <button
              className={`px-4 py-2 rounded-t-md font-medium ${tab === 'phone' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setTab('phone')}
            >
              Login with Phone
            </button>
          </div>

          {tab === 'email' ? (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full"
              />

              {/* 👁️ Password field with toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border p-2 rounded w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <div className="text-right text-sm">
                <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
                  Rest password?
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <button
                onClick={handlePhoneLogin}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-700">
            Don’t have an account?{' '}
            <Link href="/auth/register" className="text-green-700 hover:underline font-medium">
              Register
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
