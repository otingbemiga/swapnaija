'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react'; // install lucide-react if not already
import { motion } from 'framer-motion';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 mb-20 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg z-50"
      aria-label="Scroll to top"
    >
      <ArrowUp size={24} />
    </motion.button>
  );
}
