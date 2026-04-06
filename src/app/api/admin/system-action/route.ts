export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const session = cookies().get('clausr_admin_session')?.value
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { action } = await req.json()
  const db = createAdminClient()

  if (action === 'force-logout-all') {
    // Sign out all users by clearing sessions via admin
    // Supabase doesn't have bulk signout — we'd need to revoke tokens one by one
    // For MVP: log the action
    console.log('Force logout requested')
  } else if (action === 'purge-test') {
    // Delete organisations with "test" in the name
    await db.from('organisations').delete().ilike('name', '%test%')
  } else if (action === 'backup') {
    // Log backup trigger — actual backup should be configured in Supabase
    console.log('Backup triggered by admin')
  }

  return NextResponse.json({ ok: true, action })
}
