'use client'
import { Download } from 'lucide-react'
import { Button } from './ui'

export default function ExportButton() {
  const handleDownload = () => {
    window.location.href = '/api/export'
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 h-8 px-3 text-[11px] font-mono font-semibold"
      onClick={handleDownload}
    >
      <Download className="w-3.5 h-3.5" />
      Download data as CSV
    </Button>
  )
}
