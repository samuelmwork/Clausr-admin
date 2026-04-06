'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, Button } from '@/components/ui'
import { Megaphone } from 'lucide-react'

const TYPES = [
  { value: 'info', label: 'Info', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { value: 'warning', label: 'Warning', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  { value: 'success', label: 'Success', color: 'bg-jade-500/10 border-jade-500/30 text-jade-400' },
]

export default function AnnouncementForm() {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [saving, setSaving] = useState(false)
  const [published, setPublished] = useState(false)

  async function publish() {
    if (!message.trim()) return
    setSaving(true)
    await fetch('/api/admin/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, type }),
    })
    setSaving(false)
    setPublished(true)
    setTimeout(() => setPublished(false), 3000)
  }

  async function clear() {
    setMessage('')
    await fetch('/api/admin/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '', type: 'info' }),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone size={13} className="text-slate-500" />
          Announcement banner
        </CardTitle>
      </CardHeader>
      <div className="p-5 space-y-4">
        <div className="text-[10px] font-mono text-slate-600 mb-3">
          Displayed to all logged-in users on their next page load
        </div>

        {/* Type selector */}
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
                type === t.value ? t.color : 'text-slate-600 border-border-dim hover:border-border-mid'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="e.g. We're rolling out CSV import this weekend — stay tuned!"
          className="w-full px-3 py-2.5 text-sm"
        />

        {/* Preview */}
        {message && (
          <div className={`rounded-lg px-4 py-2.5 border text-sm font-medium ${TYPES.find(t => t.value === type)?.color}`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={publish} disabled={saving || !message.trim()} size="sm">
            {saving ? 'Publishing…' : published ? '✓ Published!' : 'Publish banner'}
          </Button>
          <Button variant="ghost" size="sm" onClick={clear}>Clear banner</Button>
        </div>
      </div>
    </Card>
  )
}
