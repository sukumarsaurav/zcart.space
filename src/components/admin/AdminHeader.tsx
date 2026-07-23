'use client'

import { Search, CheckCircle2 } from 'lucide-react'

interface AdminHeaderProps {
  userEmail?: string
}

export default function AdminHeader({ userEmail = 'admin@zcart.space' }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      {/* Search Input */}
      <div className="admin-search-wrapper">
        <Search className="admin-search-icon" />
        <input
          type="text"
          placeholder="Search shops, owners, or plans..."
          className="admin-search-input"
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* System Health Badge */}
        <div className="admin-badge admin-badge-active" style={{ padding: '0.35rem 0.75rem', textTransform: 'none' }}>
          <CheckCircle2 size={14} />
          <span>Supabase Backend Online</span>
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid var(--admin-border-subtle)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '0.75rem'
          }}>
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>{userEmail}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', margin: 0 }}>SaaS Platform Owner</p>
          </div>
        </div>
      </div>
    </header>
  )
}
