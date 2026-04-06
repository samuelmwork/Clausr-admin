'use client'
import { usePathname } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Dashboard', sub: 'Live platform overview' },
  '/analytics': { title: 'Analytics', sub: 'Signups, emails, revenue trends' },
  '/organisations': { title: 'Organisations', sub: 'All customers and their data' },
  '/database': { title: 'Database', sub: 'Live table viewer and SQL runner' },
  '/alerts': { title: 'Alerts & Email', sub: 'Delivery logs, cron history, failures' },
  '/system': { title: 'System', sub: 'Flags, infra health, announcements' },
}

export default function Topbar() {
  const pathname = usePathname()
  const [time, setTime] = useState('')
  const [spinning, setSpinning] = useState(false)
  const info = PAGE_TITLES[pathname] ?? { title: 'Admin', sub: '' }

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  function refresh() {
    setSpinning(true)
    window.location.reload()
    setTimeout(() => setSpinning(false), 1000)
  }

  return (
    <header className="h-14 border-b border-border-dim bg-surface-2/60 backdrop-blur-sm flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display font-bold text-white text-base">{info.title}</h1>
          {info.sub && <span className="text-slate-600 text-xs font-mono hidden md:block">/ {info.sub}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-slate-600 hidden sm:block">{time} IST</span>
        <div className="flex items-center gap-1.5 bg-jade-500/10 border border-jade-500/20 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse-slow" />
          <span className="text-jade-400 text-[10px] font-mono font-semibold">LIVE</span>
        </div>
        <button
          onClick={refresh}
          className="w-8 h-8 rounded-lg bg-surface-3 border border-border-dim flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-surface-4 transition-all"
        >
          <RefreshCw size={13} className={spinning ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  )
}
