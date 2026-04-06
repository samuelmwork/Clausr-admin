'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileSidebar from './MobileSidebar'

export default function AdminShell({ 
  children, 
  alertCount 
}: { 
  children: React.ReactNode
  alertCount: number 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar alertCount={alertCount} />
      
      <MobileSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        alertCount={alertCount} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar 
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isOpen={mobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
