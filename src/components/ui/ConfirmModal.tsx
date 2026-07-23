'use client'

import React from 'react'
import { AlertTriangle, X, Check } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantClass =
    variant === 'danger'
      ? 'btn-danger'
      : variant === 'warning'
      ? 'btn-warning'
      : 'btn-primary'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="card-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle
              size={20}
              color={
                variant === 'danger'
                  ? 'var(--color-danger-400)'
                  : 'var(--color-warning-400)'
              }
            />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
            disabled={isPending}
            style={{ padding: '4px', height: 'auto' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="card-body" style={{ paddingTop: '8px', paddingBottom: '20px' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            {message}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            paddingTop: '12px',
            borderTop: '1px solid var(--surface-border)',
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-sm ${variantClass}`}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
