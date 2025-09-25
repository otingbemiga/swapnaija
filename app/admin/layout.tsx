// app/admin/layout.tsx
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || '' // make sure to expose it as NEXT_PUBLIC_

export default function AdminLayout({ children }: { children: ReactNode }) {
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Not logged in → redirect
    if (!session) {
      router.replace('/auth/login')
      return
    }

    // Logged in but not admin → redirect
    if (session.user.id !== ADMIN_ID) {
      router.replace('/')
      return
    }

    setLoading(false)
  }, [session, router])

  if (loading) {
    return <p className="p-6 text-center">🔑 Checking admin access...</p>
  }

  return <>{children}</>
}
