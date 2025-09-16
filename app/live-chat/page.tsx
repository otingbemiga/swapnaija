'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LiveChatPage() {
  const whatsappUrl = 'https://wa.me/2348036580132';

  useEffect(() => {
    // Automatically redirect to WhatsApp after page load
    window.location.href = whatsappUrl;
  }, []);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-green-50 text-center p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-4 animate-bounce">
        Redirecting to WhatsApp...
      </h1>
      <p className="text-gray-700 mb-6">
        If you are not redirected automatically, click below to chat with us.
      </p>
      <Link
        href={whatsappUrl}
        target="_blank"
        className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-green-700 transition transform hover:scale-105"
      >
        Chat with us on WhatsApp
      </Link>
    </main>
  );
}
