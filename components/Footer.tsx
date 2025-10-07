'use client';

import Link from 'next/link';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { FaTwitter, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');

    const templateParams = {
      email: email, // ✅ MUST match your EmailJS variable {{email}}
    };

    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      if (result.status === 200 || result.text === 'OK') {
        setStatus('✅ Subscription successful!');
        setEmail('');
      } else {
        setStatus('❌ Subscription failed. Try again.');
      }
    } catch (error: any) {
      console.error('EmailJS Error:', error);
      setStatus(`❌ Subscription failed: ${error?.text || 'Unknown error'}`);
    }
  };

  return (
    <footer className="bg-[#030712] text-white pt-16 pb-8 px-6 md:px-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Stay Updated with Nigerian Swap Tips
        </h2>
        <p className="text-gray-300 text-sm">
          Get weekly swap insights, new item templates, and success stories delivered to your inbox.
        </p>
        <form
          onSubmit={handleSubscribe}
          className="flex flex-col md:flex-row gap-3 justify-center mt-4"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded w-full md:w-64 text-green-500"
            required
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition"
          >
            Subscribe
          </button>
        </form>
        {status && (
          <p className="text-sm mt-2 text-center text-yellow-400">{status}</p>
        )}
        <div className="mt-2 flex justify-center gap-3">
          <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
            5,000+ Subscribers
          </span>
          <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
            Weekly Updates
          </span>
          <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
            No Spam
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm border-t border-gray-700 pt-10">
        <div>
          <h3 className="text-lg font-bold mb-2">
            <span className="text-green-500">SwapNaija</span>
          </h3>
          <p className="text-gray-400 mb-2">
            Enabling individuals to swap goods & services using their phone, bridging communities.
          </p>
          <p className="text-gray-400">📍 Ogun State, Nigeria</p>
          <p className="text-gray-400">📞 +234 803 658 0132</p>
          <p className="text-gray-400">📧 admin@swapnaija.com.ng</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Categories</h4>
          <ul className="space-y-1 text-gray-400">
            <li><Link href="/category/food">Food Items</Link></li>
            <li><Link href="/category/phone">Phone Accessories</Link></li>
            <li><Link href="/category/electronics">Electronics</Link></li>
            <li><Link href="/category/furniture">Furniture</Link></li>
            <li><Link href="/category/wear">Wears</Link></li>
            <li><Link href="/category/farm">Farm Produce</Link></li>
            <li><Link href="/category/services">Services</Link></li>
            <li><Link href="/category/others">Others</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Support</h4>
          <ul className="space-y-1 text-gray-400">
            <li><Link href="/docs">Documentation</Link></li>
            <li><Link href="/support">Contact Support</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/live-chat">Live Chat</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul className="space-y-1 text-gray-400">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/partners">Partners</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/press">Press Kit</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Legal</h4>
          <ul className="space-y-1 text-gray-400">
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/policy">Swap Policy</Link></li>
            <li><Link href="/compliance">GDPR Compliance</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-around items-center text-xs text-gray-400">
        <p>© 2025 SwapNaija. Bringing people together with ❤️.</p>
        <div className="flex gap-4 text-lg mt-4 md:mt-0">
          <a
            href="https://twitter.com/otingbemiga01"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 transition"
          >
            <FaTwitter />
          </a>
          <a
            href="https://facebook.com/otingbemiga"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 transition"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://instagram.com/otingbemiga01"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 transition"
          >
            <FaInstagram />
          </a>
          <a
            href="https://youtube.com/@otingbemiga"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 transition"
          >
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
}
