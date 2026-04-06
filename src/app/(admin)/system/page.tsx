import { Card, CardHeader, CardTitle, SectionLabel } from '@/components/ui'
import FeatureFlagToggle from './FeatureFlagToggle'
import AnnouncementForm from './AnnouncementForm'
import DangerZone from './DangerZone'

const FEATURE_FLAGS = [
  { key: 'csv_import', label: 'CSV bulk import', desc: 'Shows as "coming soon" when disabled' },
  { key: 'whatsapp_alerts', label: 'WhatsApp alerts', desc: 'Enables WhatsApp message sending' },
  { key: 'maintenance_mode', label: 'Maintenance mode', desc: 'Locks all users out instantly' },
  { key: 'new_signups', label: 'New user signups', desc: 'Disable to pause growth temporarily' },
]

export default function SystemPage() {
  return (
    <div className="space-y-5 max-w-4xl">
      <SectionLabel>System configuration</SectionLabel>

      {/* Infra health */}
      <Card>
        <CardHeader><CardTitle>Infrastructure health</CardTitle></CardHeader>
        <div className="p-5 space-y-3">
          {[
            { label: 'Supabase connection', status: 'Operational', ok: true },
            { label: 'Vercel deployment', status: 'Live', ok: true },
            { label: 'Resend email API', status: 'Operational', ok: true },
            { label: 'Razorpay', status: 'Operational', ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-dim last:border-0">
              <span className="text-sm text-slate-400">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-jade-500 animate-pulse-slow' : 'bg-crimson-500'}`} />
                <span className={`text-xs font-mono font-semibold ${item.ok ? 'text-jade-400' : 'text-crimson-400'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Feature flags */}
      <Card>
        <CardHeader><CardTitle>Feature flags</CardTitle></CardHeader>
        <div className="p-5 space-y-4">
          {FEATURE_FLAGS.map(flag => (
            <FeatureFlagToggle key={flag.key} flag={flag} />
          ))}
        </div>
      </Card>

      {/* Announcement banner */}
      <AnnouncementForm />

      {/* Danger zone */}
      <DangerZone />
    </div>
  )
}
