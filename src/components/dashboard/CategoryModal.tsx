'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2 } from 'lucide-react'
import { createCategory, updateCategory } from '@/app/(dashboard)/categories/actions'

interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  is_active?: boolean
  image_url?: string | null
}

interface CategoryModalProps {
  shopId: string
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  editCategory?: Category | null
}

export default function CategoryModal({ shopId, categories, isOpen, onClose, editCategory }: CategoryModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const roots = categories.filter((c) => !c.parent_id && c.id !== editCategory?.id)

  function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      let res;
      if (editCategory) {
        res = await updateCategory(shopId, editCategory.id, formData)
      } else {
        res = await createCategory(shopId, formData)
      }
      
      if (res.error) {
        setError(res.error)
      } else {
        onClose()
      }
    })
  }

  // Auto-generate slug from name
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    const slugInput = document.getElementById('cat-slug') as HTMLInputElement
    if (slugInput && !slugInput.dataset.manual) {
      slugInput.value = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-scale-in" style={{
        width: '100%', maxWidth: 500, padding: 'var(--space-6)',
        position: 'relative', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-tertiary)' }}
          className="btn btn-ghost btn-icon"
        >
          <X size={18} />
        </button>
        
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
          {editCategory ? 'Edit Category' : 'Add Category'}
        </h2>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger-500)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="label">Name</label>
            <input name="name" required className="input" defaultValue={editCategory?.name} placeholder="e.g., Summer Collection" onChange={handleNameChange} />
          </div>
          <div>
            <label className="label">URL Slug</label>
            <input id="cat-slug" name="slug" required className="input" defaultValue={editCategory?.slug} placeholder="e.g., summer-collection" onChange={(e) => { e.target.dataset.manual = 'true' }} />
          </div>
          <div>
            <label className="label">Cover Image (Optional)</label>
            {editCategory?.image_url && (
              <img src={editCategory.image_url} alt="Cover" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
            )}
            <input type="file" name="cover_image" accept="image/*" className="input" style={{ padding: '8px' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Recommended size: 500x500px</p>
          </div>
          <div>
            <label className="label">Parent Category (Optional)</label>
            <select name="parent_id" className="input" defaultValue={editCategory?.parent_id || ''}>
              <option value="">None (Top-level)</option>
              {roots.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <input type="checkbox" name="is_active" id="is_active" defaultChecked={editCategory ? editCategory.is_active : true} style={{ width: 16, height: 16 }} />
            <label htmlFor="is_active" style={{ fontSize: '14px', cursor: 'pointer' }}>Visible to customers</label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {editCategory ? 'Save Changes' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
