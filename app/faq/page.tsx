'use client';

import { useState } from 'react';

export default function FAQPage() {
  const faqs = [
    {
      question: "What is this platform about?",
      answer:
        "This is a swap marketplace where you can list your items and trade them with other registered users.",
    },
    {
      question: "How do I list an item?",
      answer:
        "Go to your dashboard, click 'Add Item', fill in the details, upload photos, and submit. Your item will appear after admin approval.",
    },
    {
      question: "How do I contact a seller?",
      answer:
        "Click on an item you're interested in, then click 'Contact Seller' to chat directly with them in real time.",
    },
    {
      question: "Is my chat private?",
      answer:
        "Yes. All messages are fully private between you and the other user using Supabase Row Level Security.",
    },
    {
      question: "Can I update my profile?",
      answer:
        "Yes. Go to your profile settings to change your phone number, address, and location anytime.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-green-700 mb-6 border-b pb-2">
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white shadow rounded-lg border p-4 cursor-pointer hover:bg-green-50 transition"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <h2 className="text-lg font-semibold text-gray-800 flex justify-between items-center">
              {faq.question}
              <span>{openIndex === idx ? "−" : "+"}</span>
            </h2>
            {openIndex === idx && (
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
