"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"

const ADMIN_EMAILS = ["onefirstech@gmail.com", "admin@swapnaija.com.ng"]

export default function AdminRoute({ children }: { children: ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/auth/login")
        return
      }

      if (ADMIN_EMAILS.includes(user.email!)) {
        setAuthorized(true)
      } else {
        router.push("/")
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

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
