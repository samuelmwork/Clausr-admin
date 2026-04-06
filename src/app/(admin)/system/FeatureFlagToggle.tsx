'use client'
import { useState } from 'react'

export default function FeatureFlagToggle({ flag }: { flag: { key: string; label: string; desc: string } }) {
  const safeDefaults: Record<string, boolean> = {
    csv_import: false, whatsapp_alerts: false, maintenance_mode: false, new_signups: true
  }
  const [enabled, setEnabled] = useState(safeDefaults[flag.key] ?? false)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    setSaving(true)
    const next = !enabled
    await fetch('/api/admin/feature-flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: flag.key, enabled: next }),
    })
    setEnabled(next)
    setSaving(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-slate-300">{flag.label}</div>
        <div className="text-[10px] font-mono text-slate-600 mt-0.5">{flag.desc}</div>
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        className={`relative w-11 h-6 rounded-full transition-all duration-200 disabled:opacity-50 ${
          enabled ? 'bg-jade-600' : 'bg-surface-4'
        }`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  )
}
