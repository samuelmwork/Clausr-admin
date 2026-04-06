import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const session = cookies().get('clausr_admin_session')?.value
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { orgId, plan, contractLimit } = await req.json()
  const db = createAdminClient()
  const { error } = await db
    .from('organisations')
    .update({ plan, contract_limit: contractLimit, subscription_status: plan === 'free' ? 'inactive' : 'active' })
    .eq('id', orgId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
