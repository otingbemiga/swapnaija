// pages/api/notify-admin.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { item_id, offer_id, type } = req.body

    if (!item_id || !offer_id || !type) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    // Fetch the offer with related item and user
    const { data: offer, error } = await supabase
      .from('swap_offers')
      .select(`
        *,
        items!swap_offers_offer_item_id_fkey(title),
        users:offer_by(fullname, email)
      `)
      .eq('id', offer_id)
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Here you can implement actual email logic or webhook to notify admin
    console.log('📬 Notifying admin about', type, offer)

    return res.status(200).json({ status: 'notified', offer })
  } catch (err: any) {
    console.error('Error notifying admin:', err)
    return res.status(500).json({ error: err.message })
  }
}
