// app/admin/users/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    try {
      const token = session?.access_token
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(data)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const updateUser = async (id: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      const token = session?.access_token
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`User ${action}d successfully`)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    if (session) fetchUsers()
  }, [session])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.status}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => updateUser(u.id, 'suspend')}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Suspend
                </button>
                <button
                  onClick={() => updateUser(u.id, 'activate')}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Activate
                </button>
                <button
                  onClick={() => updateUser(u.id, 'delete')}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
