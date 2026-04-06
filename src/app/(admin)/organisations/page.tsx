import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardHeader, CardTitle, Table, Th, Td, Tr, Badge, SectionLabel } from '@/components/ui'
import { formatRelative, planColor } from '@/lib/utils'
import OrgSearch from './OrgSearch'
import OrgDrawer from './OrgDrawer'

export const dynamic = 'force-dynamic'

async function getOrgs(plan?: string, q?: string) {
  try {
    const db = createAdminClient()
    let query = db
      .from('organisations')
      .select(`
        id, name, plan, contract_limit, subscription_status, created_at
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (plan && plan !== 'all') query = query.eq('plan', plan)
    if (q) query = query.ilike('name', `%${q}%`)

    const { data, error } = await query
    if (error) {
      console.error('getOrgs Error:', error)
      return { error: error.message }
    }

    if (!data || data.length === 0) {
      return { data: [] }
    }

    const orgIds = data.map(o => o.id)

    const [{ data: membersWithProfiles }, { data: contractsData }] = await Promise.all([
      db
        .from('members')
        .select('id, user_id, role, organisation_id, profiles(email, full_name)')
        .in('organisation_id', orgIds),
      db
        .from('contracts')
        .select('id, status, organisation_id')
        .in('organisation_id', orgIds)
    ])

    const membersByOrg = (membersWithProfiles ?? []).reduce((acc: any, m) => {
      if (!acc[m.organisation_id]) acc[m.organisation_id] = []
      acc[m.organisation_id].push(m)
      return acc
    }, {})

    const contractsByOrg = (contractsData ?? []).reduce((acc: any, c) => {
      if (!acc[c.organisation_id]) acc[c.organisation_id] = []
      acc[c.organisation_id].push(c)
      return acc
    }, {})

    const enrichedOrgs = data.map(org => ({
      ...org,
      members: membersByOrg[org.id] ?? [],
      contracts: contractsByOrg[org.id] ?? []
    }))

    return { data: enrichedOrgs }
  } catch (e) {
    console.error('getOrgs Exception:', e)
    return { error: String(e) }
  }
}


export default async function OrgsPage({
  searchParams
}: {
  searchParams: { plan?: string; q?: string; org?: string }
}) {
  const result = await getOrgs(searchParams.plan, searchParams.q)
  const orgs = 'error' in result ? [] : result.data
  const fetchError = 'error' in result ? result.error : null

  const selectedOrg = searchParams.org
    ? orgs.find((o: any) => o.id === searchParams.org)
    : null

  const counts = orgs.reduce((acc: Record<string, number>, o: any) => {
    acc[o.plan] = (acc[o.plan] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5 max-w-7xl">
      {fetchError && (
        <div className="bg-crimson-600/10 border border-crimson-600/30 text-crimson-400 rounded-lg p-4 text-sm font-mono">
          Error loading organisations: {fetchError}
        </div>
      )}
      <SectionLabel>{orgs.length} organisations</SectionLabel>

      {/* Plan filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'free', 'starter', 'pro', 'team'] as const).map(p => {
          const active = (searchParams.plan ?? 'all') === p
          const n = p === 'all' ? orgs.length : (counts[p] ?? 0)
          return (
            <a
              key={p}
              href={`/organisations?plan=${p}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                active
                  ? 'bg-crimson-600/15 text-crimson-400 border-crimson-600/30'
                  : 'text-slate-500 border-border-dim hover:border-border-mid hover:text-slate-300'
              }`}
            >
              {p} ({n})
            </a>
          )
        })}
        <OrgSearch defaultValue={searchParams.q} />
      </div>

      <div className={`grid gap-4 md:gap-5 ${selectedOrg ? 'lg:grid-cols-[1fr,380px]' : ''}`}>
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Organisation</Th>
                <Th>Plan</Th>
                <Th>Users</Th>
                <Th>Contracts</Th>
                <Th>Limit</Th>
                <Th>Joined</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org: any) => {
                const userCount = org.members?.length ?? 0
                const contractCount = org.contracts?.filter((c: any) => c.status !== 'cancelled').length ?? 0
                const usagePct = Math.min(100, Math.round(contractCount / org.contract_limit * 100))
                const isSelected = org.id === selectedOrg?.id
                return (
                  <Tr key={org.id} className={isSelected ? 'bg-crimson-600/5' : ''}>
                    <Td>
                      <div className="font-medium text-white text-sm">{org.name}</div>
                      <div className="text-[10px] font-mono text-slate-600 mt-0.5">
                        {org.members?.[0]?.profiles?.email ?? '—'}
                      </div>
                    </Td>
                    <Td><Badge className={planColor(org.plan)}>{org.plan}</Badge></Td>
                    <Td><span className="font-mono text-xs">{userCount}</span></Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{contractCount}</span>
                        <div className="w-14 h-1 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${usagePct >= 100 ? 'bg-crimson-500' : usagePct >= 80 ? 'bg-amber-500' : 'bg-jade-500'}`}
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                      </div>
                    </Td>
                    <Td><span className="font-mono text-xs text-slate-600">{org.contract_limit}</span></Td>
                    <Td><span className="font-mono text-[10px] text-slate-600">{formatRelative(org.created_at)}</span></Td>
                    <Td>
                      <a
                        href={`/organisations?plan=${searchParams.plan ?? 'all'}${searchParams.q ? `&q=${searchParams.q}` : ''}&org=${org.id}`}
                        className="text-[10px] font-mono text-crimson-400 hover:text-crimson-300 font-semibold"
                      >
                        Manage →
                      </a>
                    </Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>
        </Card>

        {selectedOrg && <OrgDrawer org={selectedOrg} />}
      </div>
    </div>
  )
}
