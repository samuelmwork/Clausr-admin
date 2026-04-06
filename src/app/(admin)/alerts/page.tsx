import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardHeader, CardTitle, Table, Th, Td, Tr, Badge, StatCard, SectionLabel, Button } from '@/components/ui'
import { formatDate, formatRelative } from '@/lib/utils'
import RetryButton from './RetryButton'
import TriggerCronButton from './TriggerCronButton'

async function getAlertData() {
  const db = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const [todayAlerts, failedRes, cronHistory, resendUsage] = await Promise.all([
    db.from('alerts').select('id, sent, sent_at, scheduled_for').gte('scheduled_for', today),
    db.from('alerts').select('id, scheduled_for, contracts(vendor_name, organisations(name))')
      .eq('sent', false).lt('scheduled_for', today).limit(20),
    db.from('activity_log').select('id, action, created_at').ilike('action', '%alert%').order('created_at', { ascending: false }).limit(20),
    db.from('alerts').select('id').eq('sent', true)
      .gte('sent_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  const todayData = todayAlerts.data ?? []
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const isAfter8AM = now.getHours() >= 8

  return {
    todaySent: todayData.filter(a => a.sent).length,
    todayFailed: todayData.filter(a => !a.sent && (a.scheduled_for < todayStr || isAfter8AM)).length,
    todayPending: isAfter8AM ? 0 : todayData.filter(a => !a.sent && a.scheduled_for === todayStr).length,
    monthSent: resendUsage.count ?? 0,
    failed: failedRes.data ?? [],
    cronHistory: cronHistory.data ?? [],
  }
}

export default async function AlertsPage() {
  const data = await getAlertData()

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionLabel>Alert system monitor</SectionLabel>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Sent today" value={data.todaySent} deltaPositive />
        <StatCard label="Failed today" value={data.todayFailed} deltaPositive={data.todayFailed === 0} />
        <StatCard label="Pending today" value={data.todayPending} />
        <StatCard label="Sent this month" value={data.monthSent.toLocaleString()} />
        <StatCard label="Monthly limit" value="3,000" sub="Resend free tier" />
      </div>

      <div className="flex gap-3">
        <TriggerCronButton />
      </div>

      {/* Failed alerts */}
      <Card>
        <CardHeader>
          <CardTitle className={data.failed.length > 0 ? 'text-crimson-400' : ''}>
            {data.failed.length > 0 ? `⚠ ${data.failed.length} failed alerts` : 'Failed alerts'}
          </CardTitle>
        </CardHeader>
        {data.failed.length === 0 ? (
          <div className="p-8 text-center text-slate-600 font-mono text-sm">
            ✓ No failed alerts — system healthy
          </div>
        ) : (
          <Table>
            <thead><tr><Th>Organisation</Th><Th>Contract</Th><Th>Scheduled</Th><Th>Action</Th></tr></thead>
            <tbody>
              {data.failed.map((a: any) => (
                <Tr key={a.id}>
                  <Td><span className="text-white">{a.contracts?.organisations?.name ?? '—'}</span></Td>
                  <Td>{a.contracts?.vendor_name ?? '—'}</Td>
                  <Td><span className="font-mono text-xs text-slate-500">{formatDate(a.scheduled_for)}</span></Td>
                  <Td><RetryButton alertId={a.id} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Cron log */}
      <Card>
        <CardHeader><CardTitle>Recent activity log</CardTitle></CardHeader>
        {data.cronHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-600 font-mono text-sm">No alert activity logged yet</div>
        ) : (
          <Table>
            <thead><tr><Th>Action</Th><Th>When</Th></tr></thead>
            <tbody>
              {data.cronHistory.map((log: any) => (
                <Tr key={log.id}>
                  <Td><span className="text-sm">{log.action}</span></Td>
                  <Td><span className="font-mono text-[10px] text-slate-600">{formatRelative(log.created_at)}</span></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
