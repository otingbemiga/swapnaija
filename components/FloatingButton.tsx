'use client';
import { usePathname } from 'next/navigation';

interface FloatingButtonProps {
  label?: string;
  onClick: () => void;
  hideOn?: string[]; // paths where button should hide
}

export default function FloatingButton({ label = "💬 Contact Seller", onClick, hideOn = [] }: FloatingButtonProps) {
  const pathname = usePathname();

  if (hideOn.includes(pathname)) return null; // Auto-hide where needed

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white px-5 py-3 mb-20 rounded-full shadow-lg transition transform hover:scale-105 z-50"
    >
      {label}
    </button>
  );
}
