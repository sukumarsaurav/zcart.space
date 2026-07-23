'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  DollarSign,
  CreditCard,
  Users,
  ShieldCheck,
  ArrowLeft,
  Settings,
  Activity,
  BarChart3
} from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Shops Directory', href: '/admin/shops', icon: Store },
  { name: 'SaaS Earnings', href: '/admin/earnings', icon: DollarSign },
  { name: 'Subscription Plans', href: '/admin/plans', icon: CreditCard },
  { name: 'Merchant Users', href: '/admin/users', icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* SaaS Platform Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
              z
            </div>
            <div>
              <h1 className="font-extrabold text-white tracking-tight text-base leading-tight">zCart Admin</h1>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-indigo-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Navigation Back to Merchant App */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-900/40 text-xs text-indigo-300 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>SaaS System Live</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors w-full"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Merchant Dashboard</span>
        </Link>
      </div>
    </aside>
  )
}
