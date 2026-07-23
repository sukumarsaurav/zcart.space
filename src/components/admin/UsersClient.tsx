'use client'

import { useState } from 'react'
import { toggleUserSuperAdminAction } from '@/app/(admin)/admin/actions'
import { Search, Users, ShieldCheck, UserCheck } from 'lucide-react'

export interface UserRow {
  id: string
  auth_user_id: string
  full_name: string
  email?: string
  phone?: string | null
  is_superadmin: boolean
  created_at: string
  shops_count?: number
}

interface UsersClientProps {
  users: UserRow[]
}

export default function UsersClient({ users: initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'superadmin' | 'merchant'>('all')

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(searchQuery))

    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'superadmin' && user.is_superadmin) ||
      (filterRole === 'merchant' && !user.is_superadmin)

    return matchesSearch && matchesRole
  })

  const handleToggleSuperAdmin = async (user: UserRow) => {
    const nextSuper = !user.is_superadmin
    const msg = nextSuper
      ? `Promote ${user.full_name} (${user.email}) to Super Admin? They will have full control over the SaaS platform.`
      : `Demote ${user.full_name} (${user.email}) from Super Admin to regular merchant?`

    if (!confirm(msg)) return

    const res = await toggleUserSuperAdminAction(user.auth_user_id, nextSuper)
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_superadmin: nextSuper } : u))
      )
    } else {
      alert(`Error toggling superadmin status: ${res.error}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search & Filters */}
      <div className="admin-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div className="admin-search-wrapper" style={{ width: 320 }}>
          <Search className="admin-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search full name, email, or phone..."
            className="admin-search-input"
          />
        </div>

        <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)', borderRadius: '10px' }}>
          <button
            onClick={() => setFilterRole('all')}
            className={`admin-btn ${filterRole === 'all' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setFilterRole('superadmin')}
            className={`admin-btn ${filterRole === 'superadmin' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            Super Admins
          </button>
          <button
            onClick={() => setFilterRole('merchant')}
            className={`admin-btn ${filterRole === 'merchant' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            Merchants
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Profile</th>
              <th>Contact Info</th>
              <th>Role</th>
              <th>Linked Shops</th>
              <th>Registered Date</th>
              <th style={{ textAlign: 'right' }}>Super Admin Control</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-subtle)' }}>
                  <Users size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ margin: 0 }}>No merchant users found</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)',
                        color: 'var(--admin-primary)', fontWeight: 'bold', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem'
                      }}>
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{user.full_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-subtle)', fontFamily: 'monospace' }}>
                          {user.auth_user_id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600 }}>{user.email || 'No email'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{user.phone || 'No phone'}</div>
                  </td>

                  <td>
                    {user.is_superadmin ? (
                      <span className="admin-badge admin-badge-starter">
                        <ShieldCheck size={12} /> Super Admin
                      </span>
                    ) : (
                      <span className="admin-badge admin-badge-free">
                        <UserCheck size={12} /> Merchant
                      </span>
                    )}
                  </td>

                  <td>
                    <span style={{ fontWeight: 600 }}>{user.shops_count || 0} shops</span>
                  </td>

                  <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                    {new Date(user.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleSuperAdmin(user)}
                      className={`admin-btn ${user.is_superadmin ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      {user.is_superadmin ? 'Revoke Super Admin' : 'Grant Super Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
