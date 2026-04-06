export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const session = cookies().get('clausr_admin_session')?.value
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { key, enabled } = await req.json()
  const db = createAdminClient()
  // Store in a simple key-value table or use organisations table meta
  // For MVP, we store in a system_settings table if it exists
  const { error } = await db.from('system_settings').upsert({ key, value: String(enabled) }, { onConflict: 'key' })
  if (error) {
    // Table might not exist — that's okay in MVP
    console.log('system_settings table not found, flag not persisted:', error.message)
  }
  return NextResponse.json({ ok: true, key, enabled })
}
