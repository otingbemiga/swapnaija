'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // 👁️ password toggle
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// ✅ Import with proper typing
const statesLgas: {
  states: () => string[];
  lgas: (state: string) => { lgas: string[] };
} = require('naija-state-local-government');

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [lgas, setLgas] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const session = useSession();
  const router = useRouter();
  const supabaseClient = createClientComponentClient();

  // Redirect logged-in users
  useEffect(() => {
    if (session) router.push('/');
  }, [session, router]);

  // Load LGAs dynamically
  useEffect(() => {
    if (state) {
      const selectedLgas = statesLgas.lgas(state)?.lgas || [];
      setLgas(selectedLgas);
    }
  }, [state]);

  // ✅ Normal email/password registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !address || !state || !lga || !password) {
      toast.error('All fields are required!');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          address,
          state,
          lga,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already in use.');
      } else {
        toast.error('❌ ' + error.message);
      }
      return;
    }

    if (!data.user) {
      toast.error('User not created. Please try again.');
      return;
    }

    toast.success('🎉 Registration successful! Please check your email to confirm your account.');
    router.push('/auth/login');
  };

  // ✅ Google signup/login
  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error('Google sign-in failed: ' + error.message);
        console.error(error);
      }
    } catch (err: any) {
      toast.error('Google sign-in crashed: ' + err.message);
      console.error(err);
    }
  };

  return (
    <>
      <Head>
        <title>Register | SwapNaija</title>
      </Head>

      <main
        className="min-h-screen bg-cover bg-center relative flex items-center justify-center px-4"
        style={{
          backgroundImage: `url('https://img.freepik.com/free-vector/flat-sustainable-living-background_23-2149332014.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

        <motion.div
          className="z-10 bg-white/90 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl space-y-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-green-700">
              🌍 Join the SwapNaija Community
            </h2>
            <p className="text-gray-700 mt-1 italic">
              "Value doesn’t always need cash. Sometimes, your rice is someone’s treasure."
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Together, we’re creating a Nigeria where{' '}
              <strong>value flows through giving, not just spending</strong>. Ready to exchange,
              earn points, and support your community? Let's begin.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-green-700 text-center">Create Your Free Account</h1>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Home Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border p-2 rounded"
            />

            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="border p-2 rounded"
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
            >
              <option value="">Select LGA</option>
              {lgas.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            {/* Password field */}
            <div className="relative col-span-full">
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold col-span-full"
            >
              Register
            </button>
          </form>

          {/* OR separator */}
          <div className="flex items-center my-4">
            <hr className="flex-1 border-gray-300" />
            <span className="px-2 text-gray-500 text-sm">OR</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* ✅ Google Signup Button */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 border py-2 rounded hover:bg-gray-100 transition"
          >
            <img 
               src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5" />
            Sign up with Google
          </button>

          <p className="text-center text-sm text-gray-700">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-green-600 hover:underline font-medium">
              Login here
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
