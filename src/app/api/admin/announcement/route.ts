import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const session = cookies().get('clausr_admin_session')?.value
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { message, type } = await req.json()
  const db = createAdminClient()
  const { error } = await db.from('system_settings').upsert(
    [
      { key: 'announcement_message', value: message },
      { key: 'announcement_type', value: type },
    ],
    { onConflict: 'key' }
  )
  if (error) console.log('system_settings not found:', error.message)
  return NextResponse.json({ ok: true })
}
