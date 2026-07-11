'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, GripVertical, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploaderProps {
  shopId: string
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ shopId, value, onChange, maxImages = 8 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${shopId}/products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    return publicUrl
  }, [shopId])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!fileArr.length) return
    if (value.length + fileArr.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }
    setError(null)
    setUploading(true)

    const urls = await Promise.all(fileArr.map(uploadFile))
    const valid = urls.filter(Boolean) as string[]
    onChange([...value, ...valid])
    setUploading(false)
  }, [value, maxImages, onChange, uploadFile])

  const removeImage = (idx: number) => {
    const next = [...value]
    next.splice(idx, 1)
    onChange(next)
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--color-primary-500)' : 'var(--surface-border)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(99,102,241,0.05)' : 'var(--surface-elevated)',
          transition: 'all var(--transition-fast)',
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <div style={{
          width: 48, height: 48, margin: '0 auto var(--space-3)',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(99,102,241,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary-400)',
        }}>
          {uploading ? (
            <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--color-primary-400)', borderTopColor: 'transparent', borderRadius: '50%' }} />
          ) : (
            <Upload size={20} />
          )}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 4 }}>
          {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          PNG, JPG, WEBP · Max {maxImages} images · First image = main photo
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-400)', marginTop: 'var(--space-2)' }}>
          {error}
        </p>
      )}

      {/* Image previews */}
      {value.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-4)',
        }}>
          {value.map((url, i) => (
            <div key={url} style={{ position: 'relative' }}>
              {i === 0 && (
                <span style={{
                  position: 'absolute', top: 4, left: 4, zIndex: 1,
                  fontSize: 10, fontWeight: 700,
                  background: 'var(--color-primary-500)',
                  color: 'white',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                }}>MAIN</span>
              )}
              <div style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: i === 0
                  ? '2px solid var(--color-primary-500)'
                  : '1px solid var(--surface-border)',
                background: 'var(--surface-elevated)',
              }}>
                <img src={url} alt={`Product image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="btn btn-danger btn-icon btn-sm"
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 22, height: 22, borderRadius: 'var(--radius-full)',
                }}
                aria-label={`Remove image ${i + 1}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {value.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed var(--surface-border)',
                background: 'var(--surface-elevated)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4, cursor: 'pointer',
                color: 'var(--text-tertiary)',
                transition: 'all var(--transition-fast)',
              }}
              aria-label="Add more images"
            >
              <ImageIcon size={16} />
              <span style={{ fontSize: 10 }}>Add</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
