'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Camera, AlertTriangle, Zap, ZapOff, FlipHorizontal } from 'lucide-react'
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
} from '@zxing/library'

interface BarcodeScannerModalProps {
  onDetected: (code: string) => void
  onClose: () => void
}

/**
 * A robust barcode scanner modal that requests high-resolution video with
 * continuous autofocus to eliminate blur issues.  Works on both desktop webcams
 * and mobile rear cameras.
 */
export default function BarcodeScannerModal({ onDetected, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [scanning, setScanning] = useState(true)

  // ---------- helpers ----------

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()?.[0]
    if (!track) return
    try {
      await (track as any).applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn((p) => !p)
    } catch {
      /* torch not supported — silently ignore */
    }
  }, [torchOn])

  // ---------- main effect ----------

  useEffect(() => {
    let cancelled = false

    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.ITF,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
    ])
    hints.set(DecodeHintType.TRY_HARDER, true)

    const reader = new BrowserMultiFormatReader(hints, 300) // scan every 300ms
    readerRef.current = reader

    // High-res constraints with continuous autofocus to combat blur
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        // @ts-expect-error – focusMode is valid in Chrome/Safari but not yet in TS types
        focusMode: { ideal: 'continuous' },
        focusDistance: { ideal: 0 },
      },
      audio: false,
    }

    ;(async () => {
      try {
        // Acquire the stream ourselves so we can inspect capabilities
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream

        // Check for torch capability
        const track = stream.getVideoTracks()[0]
        const caps = track.getCapabilities?.() as any
        if (caps?.torch) setHasTorch(true)

        // Ensure continuous autofocus is applied (some devices need it explicitly)
        if (caps?.focusMode?.includes?.('continuous')) {
          try {
            await (track as any).applyConstraints({
              advanced: [{ focusMode: 'continuous' }],
            })
          } catch { /* best-effort */ }
        }

        // Start decoding from the existing stream
        reader.decodeFromStream(stream, videoRef.current!, (result, err) => {
          if (cancelled) return
          if (result) {
            const text = result.getText()
            if (text) {
              setLastScanned(text)
              onDetected(text)
            }
          }
          // NotFoundException fires continuously — that's expected
        })
      } catch (err: any) {
        if (cancelled) return
        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera access was denied. Please allow camera permissions to scan a barcode.'
            : err?.name === 'NotFoundError'
              ? 'No camera found on this device.'
              : 'Could not access the camera. Please try again.'
        )
      }
    })()

    return () => {
      cancelled = true
      reader.reset()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    // onDetected is stable from the parent via useCallback, but we intentionally
    // only start the scanner once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- render ----------

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 440, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h3
            className="modal-title"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Camera size={18} /> Scan Barcode
          </h3>
          <button onClick={onClose} aria-label="Close scanner" className="btn btn-ghost btn-icon btn-sm">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: 0 }}>
          {error ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-8) var(--space-4)',
                textAlign: 'center',
              }}
            >
              <AlertTriangle size={36} color="var(--color-warning-400)" />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{error}</p>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', background: '#000' }}>
              {/* Video feed */}
              <video
                ref={videoRef}
                style={{ width: '100%', display: 'block', minHeight: 260 }}
                muted
                playsInline
                autoPlay
              />

              {/* Scan-line animation overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '82%',
                  height: 120,
                  border: '2px solid var(--color-primary-400)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 0 0 2000px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
              >
                {/* Animated scan line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, var(--color-primary-400), transparent)',
                    animation: 'barcode-scan-line 2s ease-in-out infinite',
                  }}
                />
                {/* Corner markers */}
                {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((corner) => {
                  const isTop = corner.includes('top')
                  const isLeft = corner.includes('Left')
                  return (
                    <div
                      key={corner}
                      style={{
                        position: 'absolute',
                        [isTop ? 'top' : 'bottom']: -1,
                        [isLeft ? 'left' : 'right']: -1,
                        width: 20,
                        height: 20,
                        borderColor: 'var(--color-primary-300)',
                        borderStyle: 'solid',
                        borderWidth: 0,
                        ...(isTop ? { borderTopWidth: 3 } : { borderBottomWidth: 3 }),
                        ...(isLeft ? { borderLeftWidth: 3 } : { borderRightWidth: 3 }),
                        borderRadius: isTop
                          ? isLeft
                            ? 'var(--radius-sm) 0 0 0'
                            : '0 var(--radius-sm) 0 0'
                          : isLeft
                            ? '0 0 0 var(--radius-sm)'
                            : '0 0 var(--radius-sm) 0',
                      }}
                    />
                  )
                })}
              </div>

              {/* Bottom controls bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                }}
              >
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: '#fff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    margin: 0,
                  }}
                >
                  {lastScanned ? `Scanned: ${lastScanned}` : 'Point the camera at a barcode'}
                </p>
                {hasTorch && (
                  <button
                    onClick={toggleTorch}
                    className="btn btn-ghost btn-icon btn-sm"
                    style={{ color: '#fff' }}
                    aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                    title={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                  >
                    {torchOn ? <ZapOff size={16} /> : <Zap size={16} />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with last scanned result */}
        {lastScanned && (
          <div
            className="modal-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderTop: '1px solid var(--surface-border)',
              background: 'var(--surface-elevated)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  margin: 0,
                }}
              >
                Last scanned
              </p>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {lastScanned}
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>

      {/* Keyframe animation for the scan line */}
      <style>{`
        @keyframes barcode-scan-line {
          0%, 100% { top: 10%; }
          50% { top: 85%; }
        }
      `}</style>
    </div>
  )
}
