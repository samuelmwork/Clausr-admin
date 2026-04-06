import { cn } from '@/lib/utils'

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-surface-2 border border-border-dim rounded-xl border-glow', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-4 border-b border-border-dim flex items-center justify-between', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('font-display font-semibold text-white text-sm', className)}>{children}</h2>
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono border', className)}>
      {children}
    </span>
  )
}

export function StatCard({
  label, value, delta, deltaPositive, sub
}: {
  label: string; value: string | number; delta?: string; deltaPositive?: boolean; sub?: string
}) {
  return (
    <div className="bg-surface-2 border border-border-dim rounded-xl p-4 border-glow group hover:border-border-mid transition-colors">
      <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</div>
      <div className="font-display font-bold text-2xl text-white mb-1 leading-none">{value}</div>
      {delta && (
        <div className={`text-[10px] font-mono ${deltaPositive ? 'text-jade-400' : 'text-crimson-400'}`}>
          {deltaPositive ? '↑' : '↓'} {delta}
        </div>
      )}
      {sub && <div className="text-[10px] font-mono text-slate-600 mt-1">{sub}</div>}
    </div>
  )
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full table-auto">{children}</table>
    </div>
  )
}

export function Th({ children, className, colSpan, rowSpan }: { children: React.ReactNode; className?: string; colSpan?: number; rowSpan?: number }) {
  return (
    <th 
      colSpan={colSpan} 
      rowSpan={rowSpan}
      className={cn("px-4 py-3 text-left text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest border-b border-border-dim bg-surface-3/50", className)}
    >
      {children}
    </th>
  )
}


export function Td({ children, className, colSpan, rowSpan }: { children: React.ReactNode; className?: string; colSpan?: number; rowSpan?: number }) {
  return (
    <td 
      colSpan={colSpan} 
      rowSpan={rowSpan}
      className={cn('px-4 py-3 text-sm border-b border-border-dim/50 text-slate-400', className)}
    >
      {children}
    </td>
  )
}


export function Tr({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={cn('hover:bg-white/[0.02] transition-colors', onClick && 'cursor-pointer', className)}
    >
      {children}
    </tr>
  )
}

export function Button({
  children, onClick, variant = 'default', size = 'sm', className, disabled, type = 'button'
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'danger' | 'success' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const variants = {
    default: 'bg-crimson-600 hover:bg-crimson-700 text-white border-crimson-600',
    danger: 'bg-crimson-600/10 hover:bg-crimson-600/20 text-crimson-400 border border-crimson-600/30',
    success: 'bg-jade-600/10 hover:bg-jade-600/20 text-jade-400 border border-jade-600/30',
    ghost: 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-border-dim',
    outline: 'bg-transparent hover:bg-white/[0.04] text-slate-400 border border-border-mid',
  }
  const sizes = {
    xs: 'px-2.5 py-1 text-[10px] rounded-md',
    sm: 'px-3.5 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-lg',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-semibold font-display transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
    >
      {children}
    </button>
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full px-3 py-2 text-sm', className)}
      {...props}
    />
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-[.14em] mb-3">
      {children}
    </div>
  )
}
