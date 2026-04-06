'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, Button } from '@/components/ui'
import { Play, Download } from 'lucide-react'

export default function SqlRunner() {
  const [sql, setSql] = useState("SELECT id, name, plan, contract_limit, created_at\nFROM organisations\nORDER BY created_at DESC\nLIMIT 10;")
  const [results, setResults] = useState<any[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      })
      const json = await res.json()
      if (!res.ok) setError(json.error ?? 'Query failed')
      else setResults(json.data ?? [])
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  function exportCsv() {
    if (!results?.length) return
    const cols = Object.keys(results[0])
    const csv = [cols.join(','), ...results.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'clausr-query.csv'
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono">SQL Runner</CardTitle>
        <div className="flex gap-2">
          {results && results.length > 0 && (
            <Button variant="ghost" size="xs" onClick={exportCsv}>
              <Download size={11} className="mr-1" /> Export CSV
            </Button>
          )}
          <Button size="xs" onClick={run} disabled={loading}>
            <Play size={11} className="mr-1" /> {loading ? 'Running…' : 'Run'}
          </Button>
        </div>
      </CardHeader>
      <div className="p-4 space-y-3">
        <textarea
          value={sql}
          onChange={e => setSql(e.target.value)}
          className="w-full px-3 py-3 text-xs font-mono h-28 resize-none"
          spellCheck={false}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run() }}
          placeholder="Enter SQL query... (Ctrl+Enter to run)"
        />
        {error && (
          <div className="bg-crimson-600/10 border border-crimson-600/30 rounded-lg px-3 py-2 text-xs font-mono text-crimson-400">
            {error}
          </div>
        )}
        {results !== null && (
          <div className="overflow-x-auto">
            <div className="text-[10px] font-mono text-slate-600 mb-2">{results.length} rows returned</div>
            {results.length > 0 && (
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr>
                    {Object.keys(results[0]).map(k => (
                      <th key={k} className="text-left px-3 py-2 text-[9px] text-slate-600 uppercase tracking-wider border-b border-border-dim bg-surface-3/50">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} className="border-b border-border-dim/40 hover:bg-white/[0.02]">
                      {Object.values(row).map((v: any, j) => (
                        <td key={j} className="px-3 py-2 text-slate-400 max-w-48 truncate">
                          {v === null ? <span className="text-slate-700">null</span> : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
