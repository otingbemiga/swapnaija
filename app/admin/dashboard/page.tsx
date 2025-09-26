'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    users: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    swaps: 0,
  })
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  // ✅ Restrict access to admin only
  useEffect(() => {
    if (!session) return
    const email = session.user?.email
    if (email === 'onefirstech@gmail.com' || email === 'admin@swapnaija.com.ng') {
      setIsAdmin(true)
    } else {
      router.replace('/user/userdashboard')
    }
  }, [session, router])

  // ✅ Fetch dashboard stats from Supabase API
  const fetchStats = async () => {
    try {
      if (!session) throw new Error('No active session found')

      // Use Supabase service role key API or protected endpoint
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard stats')
      }

      setStats(data)
    } catch (err: any) {
      console.error('🔥 fetchStats error:', err)
      toast.error(err.message)
    }
  }

  useEffect(() => {
    if (!session?.user || !isAdmin) return
    fetchStats()
  }, [isAdmin, session])

  if (!session) return <p className="p-6 text-center">Loading session...</p>

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-10">
      <motion.h1 className="text-2xl font-bold text-green-700">
        Admin Dashboard 👋
      </motion.h1>

      {/* ✅ Summary Line */}
      <p className="text-gray-700 font-medium">
        👉 Users: {stats.users} | Pending: {stats.pending} | Approved:{' '}
        {stats.approved} | Rejected: {stats.rejected} | Swaps: {stats.swaps}
      </p>

      {/* ✅ Stats (Clickable) */}
      <section className="grid md:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveTab('pending')}
          className="cursor-pointer bg-yellow-50 p-4 shadow rounded hover:bg-yellow-100 transition"
        >
          <p className="text-lg font-semibold">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending Items</p>
        </div>
        <div
          onClick={() => setActiveTab('approved')}
          className="cursor-pointer bg-green-50 p-4 shadow rounded hover:bg-green-100 transition"
        >
          <p className="text-lg font-semibold">{stats.approved}</p>
          <p className="text-sm text-gray-500">Approved Items</p>
        </div>
        <div
          onClick={() => setActiveTab('rejected')}
          className="cursor-pointer bg-red-50 p-4 shadow rounded hover:bg-red-100 transition"
        >
          <p className="text-lg font-semibold">{stats.rejected}</p>
          <p className="text-sm text-gray-500">Rejected Items</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-lg font-semibold">{stats.users}</p>
          <p className="text-sm text-gray-500">Users with Items</p>
        </div>
        <div className="bg-blue-50 p-4 shadow rounded">
          <p className="text-lg font-semibold">{stats.swaps}</p>
          <p className="text-sm text-gray-500">Successful Swaps</p>
        </div>
      </section>
    </main>
  )
}
