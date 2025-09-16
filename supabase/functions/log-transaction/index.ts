// pages/api/log-transaction.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { offer_id } = req.body

    if (!offer_id) {
      return res.status(400).json({ error: 'Missing offer_id' })
    }

    // Fetch the offer
    const { data: offer, error } = await supabaseClient
      .from('swap_offers')
      .select('*, offered_item:offered_item_id(*), target_item:target_item_id(*)')
      .eq('id', offer_id)
      .single()

    if (error || !offer) {
      return res.status(400).json({ error: 'Offer not found' })
    }

    // Insert into transactions
    const { error: insertError } = await supabaseClient.from('transactions').insert({
      offer_id,
      offerer_id: offer.offerer_id,
      target_owner_id: offer.target_owner_id,
      offer_item_id: offer.offered_item_id,
      target_item_id: offer.target_item_id,
      status: 'completed',
    })

    if (insertError) {
      return res.status(500).json({ error: insertError.message })
    }

    return res.status(200).json({ message: 'Transaction logged' })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
