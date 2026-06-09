'use client'
import { useEffect, useState } from 'react'
import { getDashboardStats, getAnnouncements } from '@/lib/supabase'
import { useActiveGroup } from './layout'

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function DashboardPage() {
  const { group } = useActiveGroup()
  const [stats, setStats] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!group) return
    setLoading(true)
    Promise.all([
      getDashboardStats(group.id),
      getAnnouncements(group.id)
    ]).then(([s, a]) => {
      setStats(s)
      setAnnouncements(a)
      setLoading(false)
    })
  }, [group])

  if (!group) return null
  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full" />
    </div>
  )

  const cycle = stats?.current_cycle
  const cycleLabel = cycle ? new Date(cycle + '-01').toLocaleDateString('tl-PH', { month: 'long', year: 'numeric' }) : ''

  const statCards = [
    { label: 'Total Members', value: stats?.total_members, icon: '👥', color: 'bg-white' },
    { label: 'Community Fund', value: fmt(stats?.total_fund || 0), icon: '💰', color: 'bg-white' },
    { label: 'Collected ngayong buwan', value: fmt(stats?.collected_this_cycle || 0), icon: '✅', color: 'bg-white' },
    { label: 'Pending', value: fmt(stats?.pending_this_cycle || 0), icon: '⏳', color: 'bg-white' },
    { label: 'Overdue ngayong buwan', value: stats?.overdue_count, icon: '⚠️', color: stats?.overdue_count > 0 ? 'bg-red-50 border-red-100' : 'bg-white' },
    { label: 'Active Loans', value: fmt(stats?.total_loans_out || 0), icon: '🏦', color: 'bg-white' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{cycleLabel} · Overview</p>
      </div>

      {/* Overdue alert */}
      {stats?.overdue_count > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 flex gap-3 items-start">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="text-sm font-medium text-red-700">{stats.overdue_count} miyembro ang overdue ngayong cycle</div>
            <div className="text-xs text-red-500 mt-0.5">Pumunta sa Contributions para makita kung sino</div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {statCards.map(s => (
          <div key={s.label} className={`${s.color} border border-gray-100 rounded-xl p-4`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-semibold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Collection progress ngayong buwan</span>
          <span className="text-sm font-medium text-[#1D9E75]">
            {stats?.total_members > 0
              ? Math.round(((stats.total_members - (stats.overdue_count + Math.round(stats.pending_this_cycle / (group.contribution_amount || 500)))) / stats.total_members) * 100)
              : 0}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1D9E75] rounded-full transition-all"
            style={{ width: `${stats?.total_members > 0 ? Math.min(100, Math.round((stats.collected_this_cycle / (stats.total_members * (group.contribution_amount || 500))) * 100)) : 0}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>{fmt(stats?.collected_this_cycle || 0)} nakolekta</span>
          <span>{fmt(stats?.total_members * (group.contribution_amount || 500))} target</span>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Mga Anunsyo</h2>
        </div>
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Walang anunsyo pa</p>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className={`p-3 rounded-lg border-l-4 ${a.is_pinned ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-300'}`}>
                <div className="text-sm font-medium text-gray-900">{a.title}</div>
                <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{a.body}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {a.profile?.full_name} · {new Date(a.posted_at).toLocaleDateString('tl-PH')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
