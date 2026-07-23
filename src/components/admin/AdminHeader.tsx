'use client'

import { Search, Bell, Shield, Server, CheckCircle2 } from 'lucide-react'

interface AdminHeaderProps {
  userEmail?: string
}

export default function AdminHeader({ userEmail = 'admin@zcart.space' }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-slate-100">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search shops, owners, or plans..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System Health Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded-full text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">Supabase Backend Online</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{userEmail}</p>
            <p className="text-[10px] text-slate-400 font-medium">SaaS Platform Owner</p>
          </div>
        </div>
      </div>
    </header>
  )
}
