'use client'


import SupabaseProvider from "@/components/SupabaseProvider"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Toaster } from "react-hot-toast"
import LiveChatButton from "@/components/LiveChatButton"
import ScrollToTop from "@/components/ScrollToTop/page"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (

      <SupabaseProvider>
        <Navbar />
        {children}
        <Toaster position="top-center" reverseOrder={false} />
        <ScrollToTop />
        <Footer />
        <LiveChatButton />
      </SupabaseProvider>

  )
}
