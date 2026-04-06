import { createAdminClient } from '@/lib/supabase/admin'
import { StatCard, Card, CardHeader, CardTitle, Table, Th, Td, Tr, Badge, SectionLabel } from '@/components/ui'
import { formatINR, formatRelative, planColor } from '@/lib/utils'
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns'
import DashboardCharts from './DashboardCharts'
import Link from 'next/link'
import ExportButton from '@/components/ExportButton'

export const dynamic = 'force-dynamic'



async function getDashboardData() {
  const db = createAdminClient()

  const [orgsRes, usersRes, contractsRes, alertsRes, failedAlertsRes, recentOrgsRes] = await Promise.all([
    db.from('organisations').select('id, plan, created_at'),
    db.from('profiles').select('id, created_at'),
    db.from('contracts').select('id, created_at').neq('status', 'cancelled'),
    db.from('alerts').select('id, sent, created_at, sent_at, scheduled_for').order('created_at', { ascending: false }).limit(500),
    db.from('alerts').select('id, contract_id, contracts(vendor_name, organisations(name))').eq('sent', false).lt('scheduled_for', new Date().toISOString().split('T')[0]),
    db.from('organisations').select('id, name, plan, created_at, contract_limit').order('created_at', { ascending: false }).limit(6),
  ])

  const orgs = orgsRes.data ?? []
  const users = usersRes.data ?? []
  const contracts = contractsRes.data ?? []
  const allAlerts = alertsRes.data ?? []

  const paying = orgs.filter(o => o.plan !== 'free').length
  const planDist: Record<string, number> = { free: 0, starter: 0, pro: 0, team: 0 }
  orgs.forEach(o => { planDist[o.plan] = (planDist[o.plan] || 0) + 1 })

  const planMRR: Record<string, number> = { starter: 79900, pro: 199900, team: 499900 }
  const mrr = orgs.reduce((sum, o) => sum + (planMRR[o.plan] || 0), 0) / 100

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const currentHour = today.getHours()
  const isAfter8AM = currentHour >= 8

  const signupsToday = orgs.filter(o => o.created_at?.startsWith(todayStr)).length
  const emailsToday = allAlerts.filter(a => a.sent_at?.startsWith(todayStr)).length

  // After 8 AM, any unsent email scheduled for today is considered a failure
  // Before 8 AM, they are pending (but the dashboard calls this "Failures" in the KPI grid if they are overdue)
  const failedToday = allAlerts.filter(a => {
    if (a.sent) return false
    const scheduledDate = a.scheduled_for // assuming we have this in the query
    if (!scheduledDate) return false
    return scheduledDate < todayStr || (scheduledDate === todayStr && isAfter8AM)
  }).length


  // Build 14-day signup chart data
  const days14 = eachDayOfInterval({ start: subDays(today, 13), end: today })
  const signupChart = days14.map(day => ({
    date: format(day, 'MMM d'),
    signups: orgs.filter(o => o.created_at?.startsWith(format(day, 'yyyy-MM-dd'))).length,
  }))

  const emailChart = days14.map(day => ({
    date: format(day, 'MMM d'),
    emails: allAlerts.filter(a => a.sent_at?.startsWith(format(day, 'yyyy-MM-dd'))).length,
  }))

  return {
    totals: {
      orgs: orgs.length, users: users.length, contracts: contracts.length,
      mrr, paying, signupsToday, emailsToday, failedToday,
    },
    planDist, signupChart, emailChart,
    recentOrgs: recentOrgsRes.data ?? [],
    failedAlerts: (failedAlertsRes.data ?? []).slice(0, 5),
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <SectionLabel>Live metrics</SectionLabel>
        <ExportButton />
      </div>


      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
        <StatCard label="Organisations" value={data.totals.orgs.toLocaleString()} delta={`${data.totals.signupsToday} today`} deltaPositive />
        <StatCard label="Total users" value={data.totals.users.toLocaleString()} />
        <StatCard label="Contracts" value={data.totals.contracts.toLocaleString()} />
        <StatCard label="Paying" value={data.totals.paying} sub={`${Math.round(data.totals.paying / data.totals.orgs * 100)}% conversion`} />
        <StatCard label="MRR" value={formatINR(data.totals.mrr)} deltaPositive delta="this month" />
        <StatCard label="Emails today" value={data.totals.emailsToday} deltaPositive={data.totals.failedToday === 0} />
        <StatCard label="Failures" value={data.totals.failedToday} deltaPositive={data.totals.failedToday === 0} />
      </div>

      {/* Charts */}
      <DashboardCharts signupChart={data.signupChart} emailChart={data.emailChart} />

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Latest organisations</CardTitle>
            <Link href="/organisations" className="text-[10px] font-mono text-crimson-400 hover:text-crimson-300">View all →</Link>
          </CardHeader>
          <Table>
            <thead><tr><Th>Organisation</Th><Th>Plan</Th><Th>Limit</Th><Th>Joined</Th></tr></thead>
            <tbody>
              {data.recentOrgs.map(org => (
                <Tr key={org.id}>
                  <Td><span className="text-white font-medium">{org.name}</span></Td>
                  <Td>
                    <Badge className={planColor(org.plan)}>{org.plan}</Badge>
                  </Td>
                  <Td><span className="font-mono text-xs">{org.contract_limit}</span></Td>
                  <Td><span className="font-mono text-xs text-slate-600">{formatRelative(org.created_at)}</span></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Plan distribution */}
        <Card>
          <CardHeader><CardTitle>Plan distribution</CardTitle></CardHeader>
          <div className="p-5 space-y-3">
            {Object.entries(data.planDist).map(([plan, count]) => {
              const pct = data.totals.orgs > 0 ? Math.round(count / data.totals.orgs * 100) : 0
              const colors: Record<string, string> = {
                free: 'bg-slate-600',
                starter: 'bg-jade-500',
                pro: 'bg-blue-500',
                team: 'bg-purple-500',
              }
              return (
                <div key={plan}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-slate-400 capitalize">{plan}</span>
                    <span className="text-xs font-mono text-slate-500">{count} orgs · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${colors[plan]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            <div className="pt-3 border-t border-border-dim mt-4">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-600">Monthly Recurring Revenue</span>
                <span className="text-jade-400 font-bold">{formatINR(data.totals.mrr)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Failed Alerts */}
      {data.failedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-crimson-400">⚠ Failed alerts requiring action</CardTitle>
            <Link href="/alerts" className="text-[10px] font-mono text-crimson-400 hover:text-crimson-300">View all →</Link>
          </CardHeader>
          <Table>
            <thead><tr><Th>Organisation</Th><Th>Contract</Th><Th>Action</Th></tr></thead>
            <tbody>
              {data.failedAlerts.map((a: any) => (
                <Tr key={a.id}>
                  <Td><span className="text-white">{a.contracts?.organisations?.name ?? 'Unknown'}</span></Td>
                  <Td>{a.contracts?.vendor_name ?? '—'}</Td>
                  <Td>
                    <Link href="/alerts">
                      <Badge className="text-crimson-400 bg-crimson-400/10 border-crimson-400/20 cursor-pointer hover:bg-crimson-400/20">Retry →</Badge>
                    </Link>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  )
}
