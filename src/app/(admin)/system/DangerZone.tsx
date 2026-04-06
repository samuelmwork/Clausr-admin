'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, Button } from '@/components/ui'
import { AlertTriangle } from 'lucide-react'

export default function DangerZone() {
  const [result, setResult] = useState('')

  async function act(action: string, label: string) {
    if (!confirm(`Are you sure you want to: ${label}?`)) return
    const res = await fetch('/api/admin/system-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setResult(res.ok ? `✓ ${label} completed` : `✗ ${label} failed`)
    setTimeout(() => setResult(''), 4000)
  }

  return (
    <Card className="border-crimson-600/20">
      <CardHeader className="bg-crimson-600/5">
        <CardTitle className="text-crimson-400 flex items-center gap-2">
          <AlertTriangle size={13} />
          Danger zone
        </CardTitle>
      </CardHeader>
      <div className="p-5 space-y-3">
        {result && (
          <div className="bg-surface-3 border border-border-mid rounded-lg px-3 py-2 text-xs font-mono text-slate-300">
            {result}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" size="sm" onClick={() => act('force-logout-all', 'Force logout all users')}>
            Force logout all users
          </Button>
          <Button variant="danger" size="sm" onClick={() => act('backup', 'Backup database')}>
            Backup database now
          </Button>
          <Button variant="ghost" size="sm" onClick={() => act('pause-cron', 'Pause all cron jobs')}>
            Pause all cron jobs
          </Button>
          <Button variant="danger" size="sm" onClick={() => act('purge-test', 'Purge test accounts')}>
            Purge test accounts
          </Button>
        </div>
      </div>
    </Card>
  )
}
