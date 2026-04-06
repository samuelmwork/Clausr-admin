'use client'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { Zap } from 'lucide-react'

export default function TriggerCronButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  async function trigger() {
    setLoading(true)
    setResult('')
    const res = await fetch('/api/alerts/send', {
      method: 'POST',
      headers: { 'x-cron-secret': '' },
    })
    const json = await res.json().catch(() => ({}))
    setResult(res.ok ? `✓ Sent ${json.sent ?? 0} alerts` : '✗ Failed')
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={trigger} disabled={loading} size="sm">
        <Zap size={12} className="mr-1.5" />
        {loading ? 'Triggering…' : 'Trigger cron now'}
      </Button>
      {result && <span className="text-xs font-mono text-slate-400">{result}</span>}
    </div>
  )
}
