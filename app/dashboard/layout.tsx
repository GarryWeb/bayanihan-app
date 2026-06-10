'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase, getMyGroups, createGroup } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/dashboard/members', label: 'Members', icon: '⬡' },
  { href: '/dashboard/contributions', label: 'Contributions', icon: '◈' },
  { href: '/dashboard/loans', label: 'Loans', icon: '◎' },
  { href: '/dashboard/settings', label: 'Settings', icon: '◐' },
]

export const ActiveGroupContext = createContext<{ group: any, user: any, reload: () => void }>({ group: null, user: null, reload: () => {} })
export const useActiveGroup = () => useContext(ActiveGroupContext)

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

const planBadge: Record<string, { bg: string, color: string }> = {
  free: { bg: '#1A3A5C', color: '#D6DCE5' },
  starter: { bg: '#1A3A5C', color: '#D4A017' },
  pro: { bg: '#D4A017', color: '#0B1F3A' },
  elite: { bg: '#0B1F3A', color: '#D4A017' },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [activeGroup, setActiveGroup] = useState<any>(null)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      loadGroups(user.id)
    })
  }, [])

  async function loadGroups(uid: string) {
    const data = await getMyGroups(uid)
    const mapped = data.map((m: any) => ({ ...m.groups, role: m.role }))
    setGroups(mapped)
    if (mapped.length > 0 && !activeGroup) setActiveGroup(mapped[0])
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim() || !user) return
    setCreating(true)
    try {
      const group = await createGroup(newGroupName, user.id)
      await loadGroups(user.id)
      setActiveGroup(group)
      setShowNewGroup(false)
      setNewGroupName('')
    } catch (e: any) { alert(e.message) }
    setCreating(false)
  }

  const initials = (s: string) => s?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const SidebarContent = () => (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', background: C.card, borderRight: `1px solid ${C.border}`, fontFamily: "'Inter', sans-serif"}}>
      {/* Brand */}
      <div style={{padding: '16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div style={{width: '32px', height: '32px', background: C.gold, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: C.bg, fontSize: '14px', flexShrink: 0}}>C</div>
          <div>
            <div style={{fontWeight: '700', fontSize: '13px', color: '#FFFFFF'}}>CommunityFlow</div>
            <div style={{fontSize: '10px', color: C.muted}}>Simple. Transparent. Connected.</div>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div style={{padding: '12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0}}>
        <div style={{fontSize: '10px', fontWeight: '600', color: C.muted, letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '4px'}}>GROUPS</div>
        {groups.map(g => {
          const pb = planBadge[g.plan] || planBadge.free
          const active = activeGroup?.id === g.id
          return (
            <button key={g.id} onClick={() => setActiveGroup(g)}
              style={{width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', background: active ? '#0B1F3A' : 'transparent', border: active ? `1px solid ${C.gold}44` : '1px solid transparent', color: active ? '#FFFFFF' : C.text, transition: 'all 0.15s'}}>
              <div style={{fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{g.name}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px'}}>
                <span style={{fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: '600', background: pb.bg, color: pb.color}}>{g.plan}</span>
                <span style={{fontSize: '10px', color: C.muted}}>{g.role}</span>
              </div>
            </button>
          )
        })}
        <button onClick={() => setShowNewGroup(true)}
          style={{width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: `1px dashed ${C.border}`, color: C.gold, fontSize: '12px', fontWeight: '600'}}>
          + New group
        </button>
      </div>

      {/* Nav */}
      <nav style={{flex: 1, padding: '12px', overflowY: 'auto'}}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', marginBottom: '2px', fontSize: '13px', fontWeight: active ? '600' : '400', textDecoration: 'none', background: active ? C.gold : 'transparent', color: active ? C.bg : C.text, borderLeft: active ? 'none' : 'none', transition: 'all 0.15s'}}>
              <span style={{fontSize: '14px'}}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{padding: '12px', borderTop: `1px solid ${C.border}`, flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', background: '#0B1F3A'}}>
          <div style={{width: '28px', height: '28px', borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: C.bg, flexShrink: 0}}>
            {initials(user?.user_metadata?.full_name || user?.email || '')}
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: '12px', fontWeight: '600', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{user?.user_metadata?.full_name || 'User'}</div>
            <div style={{fontSize: '10px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{user?.email}</div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            style={{fontSize: '11px', color: C.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px'}}>
            Exit
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, fontFamily: "'Inter', sans-serif"}}>
      {/* Desktop sidebar */}
      <div style={{width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column'}}>
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div style={{position: 'fixed', inset: 0, zIndex: 50, display: 'flex'}}>
          <div style={{width: '240px', flexShrink: 0}}><SidebarContent /></div>
          <div style={{flex: 1, background: 'rgba(0,0,0,0.6)'}} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden'}}>
        {/* Mobile topbar */}
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0}}>
          <button onClick={() => setSidebarOpen(true)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: C.gold, fontSize: '18px', lineHeight: 1}}>☰</button>
          <span style={{fontWeight: '700', fontSize: '14px', color: '#FFFFFF'}}>CommunityFlow</span>
          {activeGroup && <span style={{fontSize: '12px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{activeGroup.name}</span>}
        </div>

        <main style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
          {activeGroup
            ? <ActiveGroupContext.Provider value={{ group: activeGroup, user, reload: () => loadGroups(user?.id) }}>
                {children}
              </ActiveGroupContext.Provider>
            : (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center'}}>
                <div style={{fontSize: '40px', marginBottom: '16px'}}>◎</div>
                <h2 style={{fontSize: '18px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px'}}>No groups yet</h2>
                <p style={{fontSize: '13px', color: C.muted, marginBottom: '24px'}}>Create your first group to get started</p>
                <button onClick={() => setShowNewGroup(true)}
                  style={{background: C.gold, color: C.bg, fontWeight: '700', fontSize: '14px', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer'}}>
                  Create a group
                </button>
              </div>
            )
          }
        </main>
      </div>

      {/* New group modal */}
      {showNewGroup && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'}}>
          <div style={{background: C.card, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px', border: `1px solid ${C.border}`}}>
            <h2 style={{fontWeight: '700', fontSize: '18px', color: '#FFFFFF', marginBottom: '4px'}}>New group</h2>
            <p style={{fontSize: '13px', color: C.muted, marginBottom: '16px'}}>Cooperative, paluwagan, or community organization</p>
            <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
              placeholder="e.g. Samahan ng Marikina"
              onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
              autoFocus
              style={{width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', marginBottom: '16px'}} />
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => setShowNewGroup(false)}
                style={{flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: '13px', cursor: 'pointer'}}>
                Cancel
              </button>
              <button onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}
                style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: C.gold, color: C.bg, fontWeight: '700', fontSize: '13px', cursor: 'pointer', opacity: creating || !newGroupName.trim() ? 0.6 : 1}}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
