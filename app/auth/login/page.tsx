'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  // ✅ Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push('/');
      }
    };

    checkSession();
  }, [router, supabase]);

  const handleEmailLogin = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('✅ Welcome back!');
    router.push('/');
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | SwapNaija</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative flex items-center justify-center px-4">
        {/* Overlay effect */}
        <div className="absolute inset-0 bg-green-800/40 z-0" />

        <motion.div
          className="z-10 bg-white/95 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 backdrop-blur-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Welcoming intro */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-extrabold text-green-700">Welcome Back 👋</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Log in to <span className="font-semibold text-green-700">SwapNaija</span> and continue
              swapping goods and services with ease.
            </p>
          </motion.div>

          {/* Login form */}
          <div className="space-y-4">
            <motion.input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-green-500 outline-none transition"
              whileFocus={{ scale: 1.02 }}
            />

            {/* Password field with toggle */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded-lg w-full pr-10 focus:ring-2 focus:ring-green-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-green-600 transition"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </motion.div>

            <motion.button
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-md"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>

            <div className="text-right text-sm">
              <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
                Reset password?
              </Link>
            </div>
          </div>

          {/* Register link */}
          <motion.p
            className="text-center text-sm text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Don’t have an account?{' '}
            <Link href="/auth/register" className="text-green-700 hover:underline font-semibold">
              Register
            </Link>
          </motion.p>
        </motion.div>
      </main>
    </>
  );
}
