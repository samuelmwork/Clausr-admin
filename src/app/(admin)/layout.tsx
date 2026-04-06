import AdminShell from '@/components/layout/AdminShell'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const db = createAdminClient()
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const isAfter8AM = now.getHours() >= 8

  const { data: alerts } = await db
    .from('alerts')
    .select('id, scheduled_for')
    .eq('sent', false)
    .lte('scheduled_for', todayStr)

  const alertCount = (alerts ?? []).filter(a =>
    a.scheduled_for < todayStr || (a.scheduled_for === todayStr && isAfter8AM)
  ).length

  return (
    <AdminShell alertCount={alertCount}>
      {children}
    </AdminShell>
  )
}
