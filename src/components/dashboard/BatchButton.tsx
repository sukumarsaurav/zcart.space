'use client'

import { useState } from 'react'
import { Layers } from 'lucide-react'
import BatchManagementModal from '@/components/dashboard/BatchManagementModal'

interface BatchButtonProps {
  shopId: string
  productId: string
  productName: string
  hasExpiry?: boolean
}

export default function BatchButton({ shopId, productId, productName, hasExpiry }: BatchButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-sm"
        title="Manage Stock Batches & Prices"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-400)' }}
      >
        <Layers size={14} /> Batches
      </button>

      <BatchManagementModal
        isOpen={open}
        onClose={() => setOpen(false)}
        shopId={shopId}
        productId={productId}
        productName={productName}
        hasExpiry={hasExpiry}
      />
    </>
  )
}
