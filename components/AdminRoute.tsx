"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@supabase/auth-helpers-react"

const ADMIN_EMAILS = ["onefirstech@gmail.com", "admin@swapnaija.com.ng"]

export default function AdminRoute({ children }: { children: ReactNode }) {
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!session) {
      setLoading(true)
      return
    }

    if (session.user && ADMIN_EMAILS.includes(session.user.email)) {
      setAuthorized(true)
    } else {
      router.replace("/")
    }

    setLoading(false)
  }, [session, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Checking access...</p>
      </div>
    )
  }

  if (!authorized) return null

  return <>{children}</>
}
