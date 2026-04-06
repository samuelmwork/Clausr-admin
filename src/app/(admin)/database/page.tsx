import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardHeader, CardTitle, Table, Th, Td, Tr, Badge, SectionLabel } from '@/components/ui'
import { planColor, statusColor, formatDate } from '@/lib/utils'
import SqlRunner from './SqlRunner'

const TABLES = ['organisations', 'members', 'contracts', 'alerts', 'profiles', 'invitations', 'activity_log'] as const
type TableName = typeof TABLES[number]

async function getTableData(table: TableName, limit = 20) {
  const db = createAdminClient()
  const { data, count } = await db.from(table).select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(limit)
  return { rows: data ?? [], count: count ?? 0 }
}

function renderCell(key: string, val: unknown): React.ReactNode {
  if (val === null || val === undefined) return <span className="text-slate-700 font-mono text-[10px]">null</span>
  if (key === 'plan') return <Badge className={planColor(String(val))}>{String(val)}</Badge>
  if (key === 'status' || key === 'subscription_status') return <Badge className={statusColor(String(val))}>{String(val)}</Badge>
  if (key === 'sent') return <Badge className={val ? 'text-jade-400 bg-jade-400/10 border-jade-400/20' : 'text-crimson-400 bg-crimson-400/10 border-crimson-400/20'}>{val ? 'sent' : 'pending'}</Badge>
  if (key.endsWith('_at') || key.endsWith('_date') || key === 'created_at' || key === 'updated_at') {
    return <span className="font-mono text-[10px] text-slate-500">{formatDate(String(val))}</span>
  }
  if (key === 'id' || key.endsWith('_id')) {
    return <span className="font-mono text-[10px] text-slate-600">{String(val).slice(0, 8)}…</span>
  }
  const s = String(val)
  return <span className="text-slate-300 text-xs">{s.length > 40 ? s.slice(0, 40) + '…' : s}</span>
}

export default async function DatabasePage({
  searchParams
}: {
  searchParams: { table?: string }
}) {
  const activeTable = (searchParams.table ?? 'organisations') as TableName
  const { rows, count } = await getTableData(activeTable)
  const columns = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionLabel>Live database viewer</SectionLabel>

      {/* Table picker */}
      <div className="flex gap-2 flex-wrap">
        {TABLES.map(t => (
          <a
            key={t}
            href={`/database?table=${t}`}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
              activeTable === t
                ? 'bg-crimson-600/15 text-crimson-400 border-crimson-600/30'
                : 'text-slate-500 border-border-dim hover:border-border-mid hover:text-slate-300'
            }`}
          >
            {t}
          </a>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono">{activeTable}</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-600">{count.toLocaleString()} rows</span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                {columns.map(col => <Th key={col}>{col}</Th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, i) => (
                <Tr key={i}>
                  {columns.map(col => (
                    <Td key={col}>{renderCell(col, row[col])}</Td>
                  ))}
                </Tr>
              ))}
              {rows.length === 0 && (
                <Tr>
                  <Td className="text-center text-slate-600 py-8 font-mono" colSpan={columns.length as any}>
                    No data in this table
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <SqlRunner />
    </div>
  )
}
