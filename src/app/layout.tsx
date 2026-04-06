import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clausr Admin',
  description: 'Clausr Admin Console — Internal Use Only',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface text-slate-200 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
