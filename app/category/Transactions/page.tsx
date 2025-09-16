'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from '@supabase/auth-helpers-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AdminTransactionsPage() {
  const session = useSession()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isAdmin = session?.user?.email === 'admin@SwapHub.com'

  useEffect(() => {
    if (!isAdmin) return

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          swap_offer:swap_offer_id(
            status,
            offer_message,
            offer_item:offer_item_id(*),
            target_item:target_item_id(*),
            from_user_id,
            to_user_id
          )
        `)
        .order('swapped_at', { ascending: false })

      if (!error) setTransactions(data || [])
      setLoading(false)
    }

    fetchTransactions()
  }, [isAdmin])

  if (!isAdmin) return <div className="p-6 text-red-500">Access denied. Admins only.</div>
  if (loading) return <div className="p-6">Loading transactions...</div>

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Swap Transactions History</h1>

      <div className="grid gap-6">
        {transactions.map((tx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white shadow rounded p-4 border"
          >
            <div className="grid md:grid-cols-2 gap-4">
              {/* Offered Item */}
              <div>
                <h2 className="font-semibold mb-2">Offered Item</h2>
                {tx.swap_offer.offer_item?.image_paths?.[0] && (
                  <Image
                    src={`https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/${tx.swap_offer.offer_item.image_paths[0]}`}
                    alt="offered"
                    width={200}
                    height={150}
                    className="rounded"
                  />
                )}
                <p><strong>{tx.swap_offer.offer_item?.title || 'N/A'}</strong></p>
                <p>Points: {tx.swap_offer.offer_item?.points || 'N/A'}</p>
              </div>

              {/* Target Item */}
              <div>
                <h2 className="font-semibold mb-2">Target Item</h2>
                {tx.swap_offer.target_item?.image_paths?.[0] && (
                  <Image
                    src={`https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/${tx.swap_offer.target_item.image_paths[0]}`}
                    alt="target"
                    width={200}
                    height={150}
                    className="rounded"
                  />
                )}
                <p><strong>{tx.swap_offer.target_item?.title || 'N/A'}</strong></p>
                <p>Points: {tx.swap_offer.target_item?.points || 'N/A'}</p>
              </div>
            </div>

            {/* Transaction Meta */}
            <div className="mt-4 text-sm text-gray-700">
              <p>Status: <strong>{tx.status}</strong></p>
              <p>Swapped At: {new Date(tx.swapped_at).toLocaleString()}</p>
            </div>

            {/* Admin Detail Display (Optional) */}
            <div className="mt-2 text-sm text-gray-600">
              <p>From User ID: {tx.swap_offer.from_user_id}</p>
              <p>To User ID: {tx.swap_offer.to_user_id}</p>
              <p>Message: {tx.swap_offer.offer_message || 'No message'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  )
}
