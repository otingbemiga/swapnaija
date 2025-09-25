'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast.error('❌ ' + error.message);
    } else {
      toast.success('✅ Password reset link sent! Check your email.');
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Reset Password | SwapNaija</title>
      </Head>

      <main
        className="min-h-screen bg-cover bg-center relative flex items-center justify-center px-4"
        style={{
          backgroundImage: `url('https://img.freepik.com/free-vector/flat-sustainable-living-background_23-2149332014.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

        <motion.div
          className="z-10 bg-white/90 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-2xl font-bold text-center text-green-700">Forgot Your Password?</h1>
          <p className="text-center text-gray-700">
            Enter your email and we’ll send you a link to reset your password.
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-700">
            Remembered it?{' '}
            <Link href="/auth/login" className="text-green-700 hover:underline font-medium">
              Back to Login
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
