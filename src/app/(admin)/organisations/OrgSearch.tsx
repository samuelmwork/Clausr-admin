'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export default function OrgSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const sp = useSearchParams()

  return (
    <div className="relative ml-auto flex-shrink-0">
      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
      <input
        defaultValue={defaultValue}
        onChange={e => {
          const q = e.target.value
          const plan = sp.get('plan') ?? 'all'
          router.push(`/organisations?plan=${plan}${q ? `&q=${q}` : ''}`)
        }}
        placeholder="Search..."
        className="pl-7 pr-3 py-1.5 text-xs w-32 sm:w-48"
      />
    </div>
  )
}
