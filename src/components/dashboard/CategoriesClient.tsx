'use client'

import { useState } from 'react'
import { Tag, Plus } from 'lucide-react'
import CategoryModal from '@/components/dashboard/CategoryModal'

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
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>Edit</button>
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
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(child)}>Edit</button>
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
    </div>
  )
}
