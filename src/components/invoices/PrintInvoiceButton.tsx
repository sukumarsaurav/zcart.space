'use client'

import { Printer } from 'lucide-react'

export default function PrintInvoiceButton({ color }: { color: string }) {
  return (
    <button className="btn btn-primary btn-sm no-print" style={{ background: color }} onClick={() => window.print()}>
      <Printer size={14} /> Print
    </button>
  )
}
