// pages/api/setup-storage-policies.ts
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
    // Example: insert an object (or call RPC) for storage policies setup
    const { error } = await supabase
      .from('objects')
      .insert({
        bucket_id: 'item-images',
        name: 'upload',
      })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Storage policy setup complete.' })
  } catch (err: any) {
    console.error('Error setting up storage policy:', err)
    return res.status(500).json({ error: err.message })
  }
}
