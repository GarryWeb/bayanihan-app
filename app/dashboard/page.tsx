'use client'
import { useEffect, useState } from 'react'
import { getDashboardStats, getAnnouncements } from '@/lib/supabase'
import { useActiveGroup } from './layout'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

function fmt(n: number) {
  return '₱' + (n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })
}

export default function DashboardPage() {
  const { group } = useActiveGroup()
  const [stats, setStats] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!group) return
    setLoading(true)
    Promise.all([getDashboardStats(group.id), getAnnouncements(group.id)])
      .then(([s, a]) => { setStats(s); setAnnouncements(a); setLoading(false) })
  }, [group])

  if (!group) return null
  if (loading) return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px'}}>
      <div style={{width: '32px', height: '32px', border: `3px solid ${C.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const collected = stats?.collected_this_cycle || 0
  const target = (stats?.total_members || 0) * (group.contribution_amount || 500)
  const pct = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0
  const cycleLabel = stats?.current_cycle ? new Date(stats.current_cycle + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''

  const cards = [
    { label: 'Total Members', value: stats?.total_members || 0, gold: false },
    { label: 'Community Fund', value: fmt(stats?.total_fund || 0), gold: true },
    { label: 'Collected This Month', value: fmt(collected), gold: false },
    { label: 'Pending', value: fmt(stats?.pending_this_cycle || 0), gold: false },
    { label: 'Overdue', value: stats?.overdue_count || 0, gold: stats?.overdue_count > 0, red: stats?.overdue_count > 0 },
    { label: 'Active Loans', value: fmt(stats?.total_loans_out || 0), gold: false },
  ]

  return (
    <div style={{fontFamily: "'Inter', sans-serif", color: '#FFFFFF'}}>
      {/* Header */}
      <div style={{marginBottom: '20px'}}>
        <h1 style={{fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0}}>{group.name}</h1>
        <p style={{fontSize: '13px', color: C.muted, margin: '4px 0 0'}}>{cycleLabel} · Overview</p>
      </div>

      {/* Overdue alert */}
      {stats?.overdue_count > 0 && (
        <div style={{background: '#FF000015', border: '1px solid #FF000033', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center'}}>
          <span style={{fontSize: '16px'}}>⚠️</span>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600', color: '#FF6B6B'}}>{stats.overdue_count} member{stats.overdue_count > 1 ? 's' : ''} overdue this cycle</div>
            <div style={{fontSize: '12px', color: C.muted, marginTop: '2px'}}>Go to Contributions to view details</div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px'}}>
        {cards.map(c => (
          <div key={c.label} style={{background: C.card, border: `1px solid ${(c as any).red ? '#FF000033' : C.border}`, borderRadius: '12px', padding: '16px'}}>
            <div style={{fontSize: '18px', fontWeight: '700', color: (c as any).red ? '#FF6B6B' : c.gold ? C.gold : '#FFFFFF'}}>{String(c.value)}</div>
            <div style={{fontSize: '12px', color: C.muted, marginTop: '4px'}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '14px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
          <span style={{fontSize: '13px', fontWeight: '600', color: '#FFFFFF'}}>Monthly Collection Progress</span>
          <span style={{fontSize: '13px', fontWeight: '700', color: C.gold}}>{pct}%</span>
        </div>
        <div style={{height: '6px', background: '#0B1F3A', borderRadius: '3px', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${pct}%`, background: C.gold, borderRadius: '3px', transition: 'width 0.5s'}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: C.muted, marginTop: '6px'}}>
          <span>{fmt(collected)} collected</span>
          <span>{fmt(target)} target</span>
        </div>
      </div>

      {/* Announcements */}
      <div style={{background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px'}}>
        <h2 style={{fontSize: '14px', fontWeight: '600', color: C.gold, margin: '0 0 12px'}}>Announcements</h2>
        {announcements.length === 0 ? (
          <p style={{fontSize: '13px', color: C.muted, textAlign: 'center', padding: '16px 0', margin: 0}}>No announcements yet</p>
        ) : announcements.slice(0, 3).map(a => (
          <div key={a.id} style={{borderLeft: `3px solid ${a.is_pinned ? C.gold : C.border}`, paddingLeft: '12px', marginBottom: '12px', background: a.is_pinned ? '#D4A01710' : 'transparent', borderRadius: '0 8px 8px 0', padding: '8px 12px'}}>
            <div style={{fontSize: '13px', fontWeight: '600', color: '#FFFFFF'}}>{a.title}</div>
            <div style={{fontSize: '12px', color: C.muted, marginTop: '2px'}}>{a.body}</div>
            <div style={{fontSize: '11px', color: C.muted, marginTop: '4px'}}>{a.profile?.full_name} · {new Date(a.posted_at).toLocaleDateString('en-US')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
