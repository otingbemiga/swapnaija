// app/admin/swaps/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function SwapsPage() {
  const { data: session } = useSession()
  const [swaps, setSwaps] = useState([])

  const fetchSwaps = async () => {
    try {
      const token = session?.access_token
      const res = await fetch('/api/admin/swaps', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSwaps(data)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    if (session) fetchSwaps()
  }, [session])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Swap Deals</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {swaps.map((s: any) => (
            <tr key={s.id}>
              <td className="border p-2">{s.id}</td>
              <td className="border p-2">{s.user_id}</td>
              <td className="border p-2">{s.item_id}</td>
              <td className="border p-2">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
