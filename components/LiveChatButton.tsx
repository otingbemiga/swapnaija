'use client';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function LiveChatButton() {
  const whatsappUrl = 'https://wa.me/2348036580132';

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      className="
        fixed bottom-6 right-6 z-50 flex items-center gap-2
        bg-green-600 text-white px-4 py-3 rounded-full shadow-lg
        hover:bg-green-700 transition transform hover:scale-105 animate-pulse
      "
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline font-semibold">Chat with us</span>
    </Link>
  );
}
