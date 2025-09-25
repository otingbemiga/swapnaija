// app/contact/page.tsx
'use client';

import { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('📩 Message sent! Thank you for contacting SwapNaija.');
    setForm({ name: '', email: '', phone: '', business: '', message: '' });
  };

  return (
    <main className="min-h-screen bg-white px-6 py-16 md:px-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Ready to Start Your Swap Journey?</h2>
      <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
        Get in touch with our team to discuss your swap needs and find the perfect support for your location.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-xl shadow p-6">
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-semibold">💬 Get in Touch</h3>
          <p className="text-sm text-gray-500">Let’s discuss your swap idea or feedback.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="tel"
              name="phone"
              placeholder="+234 (0) 123 456 7890"
              value={form.phone}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required
            />
            <select
              name="business"
              value={form.business}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Select swap category</option>
              <option value="Pood">Food Item</option>
              <option value="Phone">Services</option>
              <option value="Electronic">Electronics</option>
              <option value="Furniture">Furniturer</option>
              <option value="Wears">Wears</option>
              <option value="Farm">Farm Produce</option>
              <option value="Services">Services</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <textarea
            name="message"
            placeholder="Tell us about your swap request or inquiry..."
            value={form.message}
            onChange={handleChange}
            className="p-2 border rounded w-full h-28"
            required
          ></textarea>

          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full">
            Send Message →
          </button>
        </form>

        {/* Contact Info */}
        <div className="bg-green-50 p-6 rounded-lg space-y-6">
          <h3 className="text-xl font-semibold">📍 Contact Information</h3>
          <p className="text-sm text-gray-600">
            Reach out to us directly or visit our support hub in Lagos.
          </p>

          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <FaEnvelope className="text-green-600" /> Email
              </p>
              <p className="text-gray-600 text-sm">admin@swapnaija.com.ng</p>
              <p className="text-gray-600 text-sm">support@swapnija.com.ng</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <FaPhone className="text-green-600" /> Phone
              </p>
              <p className="text-gray-600 text-sm">+234 (0) 803 658 0132</p>
              <p className="text-gray-600 text-sm">+234 (0) 8085088031</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600" /> Office
              </p>
              <p className="text-gray-600 text-sm"> Mowe</p>
              <p className="text-gray-600 text-sm">Ogun State, Nigeria</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700">Office Hours</h4>
              <p className="text-xs text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
              <p className="text-xs text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
              <p className="text-xs text-gray-600">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
