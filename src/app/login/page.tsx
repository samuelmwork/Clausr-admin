'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" />
      {/* Red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-crimson-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm px-4 animate-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-crimson-600 rounded-lg flex items-center justify-center glow-red">
              <span className="text-white font-display font-bold text-lg">C</span>
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">Clausr</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-crimson-600/10 border border-crimson-600/20 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson-500 animate-pulse-slow" />
            <span className="text-crimson-400 text-xs font-medium font-mono">ADMIN CONSOLE</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Restricted Access</h1>
          <p className="text-slate-500 text-sm">Enter your admin password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-surface-2 border border-border-dim rounded-xl p-6 border-glow">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2 font-mono">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 text-sm font-mono"
              required
              autoFocus
            />
            {error && (
              <p className="mt-2 text-xs text-crimson-400 font-mono">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crimson-600 hover:bg-crimson-700 text-white font-semibold py-3 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-display text-sm glow-red"
          >
            {loading ? 'Authenticating...' : 'Enter Console →'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6 font-mono">
          CLAUSR INTERNAL · UNAUTHORIZED ACCESS PROHIBITED
        </p>
      </div>
    </div>
  )
}
