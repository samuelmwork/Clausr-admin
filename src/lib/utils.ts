import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy')
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function getInitials(name: string): string {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

export function planColor(plan: string): string {
  const map: Record<string, string> = {
    free: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    starter: 'text-jade-400 bg-jade-400/10 border-jade-400/20',
    pro: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    team: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  }
  return map[plan] || map.free
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'text-jade-400 bg-jade-400/10 border-jade-400/20',
    inactive: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    suspended: 'text-crimson-400 bg-crimson-400/10 border-crimson-400/20',
    expiring: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    expired: 'text-crimson-400 bg-crimson-400/10 border-crimson-400/20',
  }
  return map[status] || map.inactive
}
