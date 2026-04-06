'use client'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui'

const T = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-3 border border-border-mid rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function AnalyticsCharts({ signupsByDay, emailsByDay }: {
  signupsByDay: { date: string; signups: number }[]
  emailsByDay: { date: string; sent: number; failed: number }[]
}) {
  const show = signupsByDay.filter((_, i) => i % 3 === 0).map(d => d.date)

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader><CardTitle>Signups per day — 30 days</CardTitle></CardHeader>
        <div className="px-4 pb-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={signupsByDay}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
                ticks={show} />
              <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={20} />
              <Tooltip content={<T />} />
              <Area type="monotone" dataKey="signups" stroke="#dc2626" strokeWidth={2} fill="url(#ag1)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Email alerts per day — 30 days</CardTitle></CardHeader>
        <div className="px-4 pb-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emailsByDay} barSize={5}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
                ticks={show} />
              <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={20} />
              <Tooltip content={<T />} />
              <Bar dataKey="sent" fill="#22c55e" radius={[2, 2, 0, 0]} opacity={0.8} stackId="a" />
              <Bar dataKey="failed" fill="#dc2626" radius={[2, 2, 0, 0]} opacity={0.8} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
