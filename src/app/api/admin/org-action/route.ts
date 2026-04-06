export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const session = cookies().get('clausr_admin_session')?.value
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { orgId, action } = await req.json()
  const db = createAdminClient()

  if (action === 'suspend') {
    await db.from('organisations').update({ subscription_status: 'suspended' }).eq('id', orgId)
  } else if (action === 'delete') {
    await db.from('contracts').delete().eq('org_id', orgId)
    await db.from('members').delete().eq('org_id', orgId)
    await db.from('organisations').delete().eq('id', orgId)
  } else if (action === 'force-password-reset') {
    const { data: members } = await db.from('members').select('user_id').eq('org_id', orgId)
    for (const m of members ?? []) {
      await db.auth.admin.updateUserById(m.user_id, { password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) })
    }
  }
  return NextResponse.json({ ok: true })
}
