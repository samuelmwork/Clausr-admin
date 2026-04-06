import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardHeader, CardTitle, SectionLabel, StatCard } from '@/components/ui'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import AnalyticsCharts from './AnalyticsCharts'

async function getAnalyticsData() {
  const db = createAdminClient()
  const today = new Date()
  const days30 = eachDayOfInterval({ start: subDays(today, 29), end: today })

  const [orgsRes, alertsRes, contractsRes] = await Promise.all([
    db.from('organisations').select('id, plan, created_at').order('created_at'),
    db.from('alerts').select('id, sent, sent_at, created_at').order('created_at'),
    db.from('contracts').select('id, created_at').neq('status', 'cancelled'),
  ])

  const orgs = orgsRes.data ?? []
  const alerts = alertsRes.data ?? []

  const signupsByDay = days30.map(day => {
    const d = format(day, 'yyyy-MM-dd')
    return {
      date: format(day, 'MMM d'),
      signups: orgs.filter(o => o.created_at?.startsWith(d)).length,
    }
  })

  const emailsByDay = days30.map(day => {
    const d = format(day, 'yyyy-MM-dd')
    return {
      date: format(day, 'MMM d'),
      sent: alerts.filter(a => a.sent_at?.startsWith(d)).length,
      failed: alerts.filter(a => !a.sent && a.created_at?.startsWith(d)).length,
    }
  })

  const thisWeek = orgs.filter(o => {
    const d = new Date(o.created_at)
    return d >= subDays(today, 7)
  }).length
  const lastWeek = orgs.filter(o => {
    const d = new Date(o.created_at)
    return d >= subDays(today, 14) && d < subDays(today, 7)
  }).length

  const planDist = { free: 0, starter: 0, pro: 0, team: 0 } as Record<string, number>
  orgs.forEach(o => planDist[o.plan] = (planDist[o.plan] || 0) + 1)

  const planMRR: Record<string, number> = { starter: 79900, pro: 199900, team: 499900 }
  const mrr = orgs.reduce((s, o) => s + (planMRR[o.plan] || 0), 0) / 100

  const totalSent = alerts.filter(a => a.sent).length
  const totalFailed = alerts.filter(a => !a.sent).length

  return {
    signupsByDay, emailsByDay, planDist, mrr,
    totals: {
      orgs: orgs.length, thisWeek, lastWeek,
      contracts: (contractsRes.data ?? []).length,
      emailsSent: totalSent, emailsFailed: totalFailed,
    }
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()
  const signupGrowth = data.totals.lastWeek > 0
    ? Math.round((data.totals.thisWeek - data.totals.lastWeek) / data.totals.lastWeek * 100)
    : 0

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionLabel>30-day analytics</SectionLabel>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Signups this week" value={data.totals.thisWeek} delta={`${signupGrowth > 0 ? '+' : ''}${signupGrowth}% vs last week`} deltaPositive={signupGrowth >= 0} />
        <StatCard label="Total orgs" value={data.totals.orgs.toLocaleString()} />
        <StatCard label="Total emails sent" value={data.totals.emailsSent.toLocaleString()} />
        <StatCard label="Email failures" value={data.totals.emailsFailed} deltaPositive={data.totals.emailsFailed === 0} />
      </div>

      <AnalyticsCharts signupsByDay={data.signupsByDay} emailsByDay={data.emailsByDay} />

      {/* Plan distribution */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Plan distribution</CardTitle></CardHeader>
          <div className="p-5 space-y-4">
            {Object.entries(data.planDist).map(([plan, count]) => {
              const pct = data.totals.orgs > 0 ? Math.round(count / data.totals.orgs * 100) : 0
              const colors: Record<string, string> = { free: 'bg-slate-500', starter: 'bg-jade-500', pro: 'bg-blue-500', team: 'bg-purple-500' }
              return (
                <div key={plan}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-mono capitalize text-slate-400">{plan}</span>
                    <span className="text-xs font-mono text-slate-500">{count} · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[plan]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue overview</CardTitle></CardHeader>
          <div className="p-5 space-y-3">
            <div className="text-center py-4">
              <div className="text-4xl font-display font-bold text-white">
                ₹{Math.round(data.mrr).toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-mono text-slate-500 mt-1">Monthly Recurring Revenue</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-dim">
              <div className="bg-surface-3 rounded-lg p-3 text-center">
                <div className="text-lg font-display font-bold text-white">
                  ₹{Math.round(data.mrr * 12).toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-1">ARR (projected)</div>
              </div>
              <div className="bg-surface-3 rounded-lg p-3 text-center">
                <div className="text-lg font-display font-bold text-jade-400">
                  {Object.entries(data.planDist).filter(([p]) => p !== 'free').reduce((s, [, c]) => s + c, 0)}
                </div>
                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-1">Paying customers</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
