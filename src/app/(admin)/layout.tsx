import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const db = createAdminClient()
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const isAfter8AM = now.getHours() >= 8

  // Count alerts that are unsent and overdue
  const { data: alerts } = await db
    .from('alerts')
    .select('id, scheduled_for')
    .eq('sent', false)
    .lte('scheduled_for', todayStr)

  const alertCount = (alerts ?? []).filter(a =>
    a.scheduled_for < todayStr || (a.scheduled_for === todayStr && isAfter8AM)
  ).length

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar alertCount={alertCount} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
