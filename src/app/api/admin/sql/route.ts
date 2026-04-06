export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

const BLOCKED = ['drop', 'truncate', 'alter table', 'create table', 'delete from organisations', 'delete from members']

export async function POST(req: NextRequest) {
  const session = cookies().get('clausr_admin_session')?.value
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { sql } = await req.json()
  const lower = sql.toLowerCase().trim()
  for (const b of BLOCKED) {
    if (lower.includes(b)) {
      return NextResponse.json({ error: `Blocked operation: ${b}` }, { status: 400 })
    }
  }
  const db = createAdminClient()
  const { data, error } = await db.rpc('exec_sql', { query: sql }).single().then(
    () => ({ data: null, error: 'RPC not available' }),
    () => ({ data: null, error: 'RPC not available' })
  )
  // Fallback: basic select queries via direct table access
  const tableMatch = lower.match(/from\s+(\w+)/)
  if (tableMatch) {
    const table = tableMatch[1]
    const limitMatch = lower.match(/limit\s+(\d+)/)
    const limit = limitMatch ? parseInt(limitMatch[1]) : 50
    const { data: rows, error: err } = await (db.from(table) as any).select('*').limit(Math.min(limit, 200))
    if (err) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ data: rows })
  }
  return NextResponse.json({ error: 'Only SELECT queries with a FROM clause are supported' }, { status: 400 })
}
