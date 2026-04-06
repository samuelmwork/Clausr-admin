import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const db = createAdminClient()

  // Fetch all organisations and related member counts
  const { data: orgs, error } = await db
    .from('organisations')
    .select(`
      id, name, plan, contract_limit, subscription_status, created_at,
      members:members(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Generate CSV content
  const headers = ['ID', 'Name', 'Plan', 'Contract Limit', 'Status', 'Users', 'Joined At']
  const csvRows = [headers.join(',')]

  orgs?.forEach(org => {
    const row = [
      org.id,
      `"${org.name.replace(/"/g, '""')}"`,
      org.plan,
      org.contract_limit,
      org.subscription_status,
      org.members?.[0]?.count ?? 0,
      org.created_at
    ]
    csvRows.push(row.join(','))
  })

  const csvString = csvRows.join('\n')

  return new Response(csvString, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=clausr_organisations_export.csv',
    },
  })
}
