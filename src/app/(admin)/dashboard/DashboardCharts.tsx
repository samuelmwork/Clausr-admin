'use client'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-3 border border-border-mid rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-slate-400 mb-1">{label}</div>
      <div className="text-white font-bold">{payload[0]?.value}</div>
    </div>
  )
}

export default function DashboardCharts({
  signupChart, emailChart
}: {
  signupChart: { date: string; signups: number }[]
  emailChart: { date: string; emails: number }[]
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Signups — last 14 days</CardTitle></CardHeader>
        <div className="p-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={signupChart}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={20} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="signups" stroke="#dc2626" strokeWidth={2} fill="url(#signupGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Emails sent — last 14 days</CardTitle></CardHeader>
        <div className="p-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emailChart} barSize={8}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={20} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="emails" fill="#22c55e" radius={[2, 2, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
