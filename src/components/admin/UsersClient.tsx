'use client'

import { useState } from 'react'
import { toggleUserSuperAdminAction } from '@/app/(admin)/admin/actions'
import { Search, Users, ShieldCheck, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search full name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterRole === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setFilterRole('superadmin')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterRole === 'superadmin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Super Admins
          </button>
          <button
            onClick={() => setFilterRole('merchant')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterRole === 'merchant' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Merchants
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User Profile</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Role Badge</th>
                <th className="py-3.5 px-4">Linked Shops</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Super Admin Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-400">No merchant users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-bold flex items-center justify-center text-sm">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{user.full_name}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{user.auth_user_id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-200">{user.email || 'No email'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{user.phone || 'No phone'}</div>
                    </td>

                    <td className="py-4 px-4">
                      {user.is_superadmin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-950 border border-indigo-800 text-indigo-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          Merchant
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-200">{user.shops_count || 0} shops</span>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(user.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleSuperAdmin(user)}
                        className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors ${
                          user.is_superadmin
                            ? 'bg-rose-950/60 border border-rose-900/60 text-rose-300 hover:bg-rose-900'
                            : 'bg-indigo-950/60 border border-indigo-900/60 text-indigo-300 hover:bg-indigo-900'
                        }`}
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
    </div>
  )
}
