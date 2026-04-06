'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, BarChart2, Database, Bell, Settings, LogOut, Shield, X } from 'lucide-react'
import { useEffect } from 'react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Monitor' },
  { href: '/analytics', label: 'Analytics', icon: BarChart2, group: 'Monitor' },
  { href: '/organisations', label: 'Organisations', icon: Building2, group: 'Customers' },
  { href: '/database', label: 'Database', icon: Database, group: 'Data' },
  { href: '/alerts', label: 'Alerts & Email', icon: Bell, group: 'Ops', badge: true },
  { href: '/system', label: 'System', icon: Settings, group: 'Config' },
]

export default function MobileSidebar({ 
  isOpen, 
  onClose, 
  alertCount = 0 
}: { 
  isOpen: boolean
  onClose: () => void
  alertCount?: number 
}) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const groups = [...new Set(NAV.map(n => n.group))]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface-2 border-r border-border-dim flex flex-col animate-in slide-in-from-left duration-300">
        <div className="px-5 py-5 border-b border-border-dim flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-crimson-600 rounded-lg flex items-center justify-center glow-red shrink-0">
              <span className="text-white font-display font-bold text-sm">C</span>
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm leading-none">Clausr</div>
              <div className="text-[10px] font-mono text-crimson-400 mt-0.5 tracking-widest">ADMIN</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-3 border border-border-dim flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {groups.map(group => (
            <div key={group} className="mb-4">
              <div className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-[.12em] px-3 mb-1.5">{group}</div>
              {NAV.filter(n => n.group === group).map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-100 mb-0.5 group ${
                      active
                        ? 'bg-crimson-600/15 text-crimson-400 border border-crimson-600/20'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <item.icon size={16} className={active ? 'text-crimson-400' : 'text-slate-600 group-hover:text-slate-400'} strokeWidth={2} />
                    <span>{item.label}</span>
                    {item.badge && alertCount > 0 && (
                      <span className="ml-auto px-1.5 h-5 min-w-[20px] bg-crimson-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {alertCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-border-dim p-3">
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-crimson-600/20 border border-crimson-600/30 flex items-center justify-center">
              <Shield size={12} className="text-crimson-400" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-300">Super Admin</div>
              <div className="text-[10px] font-mono text-slate-600">Full access</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-600 hover:text-crimson-400 hover:bg-crimson-600/10 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
    </div>
  )
}
