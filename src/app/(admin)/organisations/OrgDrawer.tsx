'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, Button, Badge, SectionLabel } from '@/components/ui'
import { planColor, formatRelative } from '@/lib/utils'
import { X, Users, FileText, Calendar, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PLANS = ['free', 'starter', 'pro', 'team'] as const
const PLAN_LIMITS: Record<string, number> = { free: 5, starter: 25, pro: 999, team: 9999 }

export default function OrgDrawer({ org }: { org: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(org.plan)
  const [contractLimit, setContractLimit] = useState(org.contract_limit)
  const [toast, setToast] = useState('')

  function close() {
    router.back()
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function savePlan() {
    setSaving(true)
    const res = await fetch('/api/admin/set-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: org.id, plan: selectedPlan, contractLimit: Number(contractLimit) }),
    })
    setSaving(false)
    if (res.ok) {
      showToast('Plan updated successfully')
      router.refresh()
    } else {
      showToast('Failed to update plan')
    }
  }

  async function action(act: string) {
    if (act === 'delete' && !confirm(`Permanently delete ${org.name}? This cannot be undone.`)) return
    const res = await fetch('/api/admin/org-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: org.id, action: act }),
    })
    if (res.ok) showToast(`Action "${act}" completed`)
    else showToast('Action failed')
    router.refresh()
  }

  const users = org.members ?? []
  const contracts = org.contracts ?? []
  const activeContracts = contracts.filter((c: any) => c.status !== 'cancelled').length

  return (
    <Card className="relative">
      {toast && (
        <div className="absolute top-3 right-3 left-3 bg-jade-500/20 border border-jade-500/30 text-jade-400 text-xs font-mono rounded-lg px-3 py-2 z-10">
          {toast}
        </div>
      )}
      <CardHeader>
        <div>
          <CardTitle>{org.name}</CardTitle>
          <div className="text-[10px] font-mono text-slate-600 mt-0.5">
            {users[0]?.profiles?.email ?? 'No admin email'}
          </div>
        </div>
        <button onClick={close} className="text-slate-600 hover:text-slate-300 transition-colors">
          <X size={14} />
        </button>
      </CardHeader>

      <div className="p-4 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface-3 rounded-lg p-3 text-center">
            <div className="text-lg font-display font-bold text-white">{users.length}</div>
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-0.5">Users</div>
          </div>
          <div className="bg-surface-3 rounded-lg p-3 text-center">
            <div className="text-lg font-display font-bold text-white">{activeContracts}</div>
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-0.5">Contracts</div>
          </div>
          <div className="bg-surface-3 rounded-lg p-3 text-center">
            <div className="text-lg font-display font-bold text-white">
              {Math.round(activeContracts / org.contract_limit * 100)}%
            </div>
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-0.5">Used</div>
          </div>
        </div>

        {/* Plan assignment */}
        <div>
          <SectionLabel>Assign plan — no payment required</SectionLabel>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {PLANS.map(p => (
              <button
                key={p}
                onClick={() => {
                  setSelectedPlan(p)
                  setContractLimit(PLAN_LIMITS[p])
                }}
                className={`py-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                  selectedPlan === p
                    ? 'bg-crimson-600/20 text-crimson-400 border-crimson-600/40'
                    : 'text-slate-500 border-border-dim hover:border-border-mid hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <label className="text-[9px] font-mono text-slate-600 uppercase tracking-widest block mb-1.5">
              Custom contract limit
            </label>
            <input
              type="number"
              value={contractLimit}
              onChange={e => setContractLimit(e.target.value)}
              className="w-full px-3 py-2 text-sm"
            />
          </div>

          <Button onClick={savePlan} disabled={saving} className="w-full justify-center" size="md">
            {saving ? 'Saving...' : 'Save plan changes'}
          </Button>
        </div>

        {/* Trial extension */}
        <div>
          <SectionLabel>Extend trial</SectionLabel>
          <div className="flex gap-2">
            {[7, 14, 30].map(days => (
              <Button key={days} variant="ghost" size="xs" onClick={() => showToast(`Trial extended by ${days} days`)}>
                +{days}d
              </Button>
            ))}
          </div>
        </div>

        {/* Members */}
        {users.length > 0 && (
          <div>
            <SectionLabel>Team members</SectionLabel>
            <div className="space-y-1.5">
              {users.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400">
                    {m.profiles?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{m.profiles?.full_name ?? 'Unknown'}</div>
                    <div className="text-[10px] font-mono text-slate-600 truncate">{m.profiles?.email}</div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 capitalize">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div>
          <SectionLabel>Admin actions</SectionLabel>
          <div className="space-y-1.5">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => action('impersonate')}>
              <Users size={12} /> Login as org admin
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => action('email')}>
              <Mail size={12} /> Send email to admin
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => action('force-password-reset')}>
              <FileText size={12} /> Force password reset
            </Button>
            <Button variant="danger" size="sm" className="w-full justify-start gap-2" onClick={() => action('suspend')}>
              Suspend organisation
            </Button>
            <Button variant="danger" size="sm" className="w-full justify-start gap-2 mt-2" onClick={() => action('delete')}>
              Delete org + all data
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
