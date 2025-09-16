// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar'; 
import Footer from "@/components/Footer";
import SupabaseProvider from '@/components/SupabaseProvider';
import { Toaster } from 'react-hot-toast';
import LiveChatButton from '@/components/LiveChatButton';
import ScrollToTop from "@/components/ScrollToTop/page";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwapHub",
  description: "Easily swap goods and services in Nigeria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SupabaseProvider>
          <Navbar />
          {children}
          <Toaster position="top-center" reverseOrder={false} />
           {/* Floating scroll-to-top button */}
            <ScrollToTop/>
          <Footer />
           <LiveChatButton />
        </SupabaseProvider>
      </body>
    </html>
  );
}
