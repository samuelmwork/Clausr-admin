'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Badge } from '@/components/ui'
import { RefreshCw, Zap } from 'lucide-react'

export default function RetryButton({ alertId }: { alertId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function retry() {
    setLoading(true)
    await fetch('/api/admin/retry-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId }),
    })
    setLoading(false)
    setDone(true)
    router.refresh()
  }

  if (done) return <Badge className="text-jade-400 bg-jade-400/10 border-jade-400/20">Retried ✓</Badge>
  return (
    <Button variant="danger" size="xs" onClick={retry} disabled={loading}>
      <RefreshCw size={10} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Retrying…' : 'Retry'}
    </Button>
  )
}
