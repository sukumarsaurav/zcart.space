'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera, AlertTriangle } from 'lucide-react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

interface BarcodeScannerModalProps {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScannerModal({ onDetected, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    let cancelled = false

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current!,
        (result, err) => {
          if (cancelled) return
          if (result) {
            onDetected(result.getText())
          } else if (err && !(err instanceof NotFoundException)) {
            // NotFoundException fires continuously while no barcode is in
            // frame — that's expected, not a real error.
            console.error('Barcode scan error:', err)
          }
        }
      )
      .catch((err) => {
        if (cancelled) return
        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera access was denied. Allow camera permissions to scan a barcode.'
            : 'Could not access the camera on this device.'
        )
      })

    return () => {
      cancelled = true
      reader.reset()
    }
  }, [onDetected])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Camera size={18} /> Scan Barcode
          </h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">
          {error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-6) 0', textAlign: 'center' }}>
              <AlertTriangle size={32} color="var(--color-warning-400)" />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{error}</p>
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#000' }}>
              <video ref={videoRef} style={{ width: '100%', display: 'block' }} muted playsInline />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '80%', height: 90, border: '2px solid var(--color-primary-400)', borderRadius: 'var(--radius-md)',
                boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
              }} />
              <p style={{
                position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center',
                fontSize: 'var(--text-xs)', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              }}>
                Point the camera at a barcode
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
