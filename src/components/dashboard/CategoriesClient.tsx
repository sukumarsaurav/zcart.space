'use client'

import { useState, useTransition } from 'react'
import { Tag, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import CategoryModal from '@/components/dashboard/CategoryModal'
import { deleteCategory } from '@/app/(dashboard)/categories/actions'

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  is_active: boolean
  sort_order: number
  image_url: string | null
}

interface CategoriesClientProps {
  shopId: string
  categories: Category[]
  countMap: Record<string, number>
}

export default function CategoriesClient({ shopId, categories, countMap }: CategoriesClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const roots = categories.filter((c) => !c.parent_id)
  const children = (parentId: string) => categories.filter((c) => c.parent_id === parentId)

  const openAdd = () => {
    setEditCategory(null)
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditCategory(cat)
    setModalOpen(true)
  }

  const confirmDelete = (cat: Category) => {
    setDeleteTarget(cat)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      await deleteCategory(shopId, deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
        <button id="add-category-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add category
        </button>
      </div>

      {!roots.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Tag size={28} /></div>
          <p className="empty-state-title">No categories yet</p>
          <p className="empty-state-description">Organise your products into categories to help customers find what they need.</p>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Create first category
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roots.map((cat) => (
                <>
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tag size={14} color="var(--color-primary-400)" />
                          </div>
                        )}
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>{cat.slug}</td>
                    <td>
                      <span className="badge badge-neutral">{countMap[cat.id] ?? 0}</span>
                    </td>
                    <td>
                      <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => confirmDelete(cat)} style={{ color: 'var(--color-danger-500)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {children(cat.id).map((child) => (
                    <tr key={child.id} style={{ background: 'rgba(15,23,42,0.015)' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingLeft: 'var(--space-8)' }}>
                          <span style={{ color: 'var(--text-tertiary)' }}>└</span>
                          <span style={{ fontSize: 'var(--text-sm)' }}>{child.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>{child.slug}</td>
                      <td><span className="badge badge-neutral">{countMap[child.id] ?? 0}</span></td>
                      <td><span className={`badge ${child.is_active ? 'badge-success' : 'badge-neutral'}`}>{child.is_active ? 'Active' : 'Hidden'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(child)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => confirmDelete(child)} style={{ color: 'var(--color-danger-500)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCategory(null); }}
        shopId={shopId}
        categories={categories}
        editCategory={editCategory}
      />

      {deleteTarget && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-scale-in" style={{
            width: '100%', maxWidth: 420, padding: 'var(--space-6)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <AlertTriangle size={24} color="var(--color-danger-500)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Delete Category</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? Products in this category will be uncategorised. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  background: 'var(--color-danger-500)', color: '#fff',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
