'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase, getMyGroups, createGroup } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/members', label: 'Mga Miyembro', icon: '👥' },
  { href: '/dashboard/contributions', label: 'Contributions', icon: '💵' },
  { href: '/dashboard/loans', label: 'Loans', icon: '🏦' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export const ActiveGroupContext = createContext<{ group: any, user: any, reload: () => void }>({ group: null, user: null, reload: () => {} })
export const useActiveGroup = () => useContext(ActiveGroupContext)

const PH = { navy: '#0038A8', red: '#CE1126', gold: '#FCD116', dark: '#0A0F2E', darker: '#060B1F', card: '#0D1535', border: '#1E2D5A', text: '#A0AEC0' }

const planColors: Record<string, { bg: string, color: string }> = {
  free: { bg: '#1A2550', color: '#5B8BFF' },
  starter: { bg: '#2D1A1A', color: '#FF6B6B' },
  pro: { bg: '#0038A8', color: '#FCD116' },
  elite: { bg: '#CE1126', color: '#FCD116' },
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

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const Sidebar = () => (
    <div className="flex flex-col h-full" style={{background: PH.card, borderRight: `1px solid ${PH.border}`}}>
      {/* Flag bar */}
      <div className="h-1 w-full flex flex-shrink-0">
        <div className="flex-1" style={{background: PH.navy}}></div>
        <div className="flex-1" style={{background: PH.gold}}></div>
        <div className="flex-1" style={{background: PH.red}}></div>
      </div>

      {/* Brand */}
      <div className="px-4 py-3 flex-shrink-0" style={{borderBottom: `1px solid ${PH.border}`}}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{background: `linear-gradient(135deg, ${PH.red}, ${PH.navy})`}}>B</div>
          <div>
            <div className="font-bold text-sm" style={{color: PH.gold}}>Bayanihan</div>
            <div className="text-xs" style={{color: PH.text}}>🇵🇭 Platform</div>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="px-3 py-2 flex-shrink-0" style={{borderBottom: `1px solid ${PH.border}`}}>
        <div className="text-xs font-bold mb-2 px-1" style={{color: PH.gold, letterSpacing: '0.05em'}}>GRUPO</div>
        {groups.map(g => {
          const pc = planColors[g.plan] || planColors.free
          return (
            <button key={g.id} onClick={() => setActiveGroup(g)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-1"
              style={{
                background: activeGroup?.id === g.id ? `${PH.navy}44` : 'transparent',
                border: activeGroup?.id === g.id ? `1px solid ${PH.navy}` : '1px solid transparent',
                color: activeGroup?.id === g.id ? '#fff' : PH.text
              }}>
              <div className="font-medium truncate text-xs">{g.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{background: pc.bg, color: pc.color}}>{g.plan}</span>
                <span className="text-xs" style={{color: PH.text}}>{g.role}</span>
              </div>
            </button>
          )
        })}
        <button onClick={() => setShowNewGroup(true)}
          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all"
          style={{color: PH.gold, border: `1px dashed ${PH.gold}44`}}>
          + Bagong grupo
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium"
              style={{
                background: active ? `linear-gradient(90deg, ${PH.navy}, ${PH.red}33)` : 'transparent',
                color: active ? '#fff' : PH.text,
                borderLeft: active ? `3px solid ${PH.gold}` : '3px solid transparent'
              }}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 flex-shrink-0" style={{borderTop: `1px solid ${PH.border}`}}>
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg" style={{background: `${PH.navy}22`}}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{background: `linear-gradient(135deg, ${PH.navy}, ${PH.red})`, color: '#fff'}}>
            {initials(user?.user_metadata?.full_name || user?.email || '')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate" style={{color: '#fff'}}>{user?.user_metadata?.full_name || 'User'}</div>
            <div className="text-xs truncate" style={{color: PH.text}}>{user?.email}</div>
          </div>
          <button onClick={handleSignOut} className="text-xs font-bold px-2 py-1 rounded" style={{color: PH.red, background: `${PH.red}22`}}>Exit</button>
        </div>
      </div>

      {/* Flag bar bottom */}
      <div className="h-1 w-full flex flex-shrink-0">
        <div className="flex-1" style={{background: PH.red}}></div>
        <div className="flex-1" style={{background: PH.gold}}></div>
        <div className="flex-1" style={{background: PH.navy}}></div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{background: PH.dark}}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{background: PH.card, borderBottom: `1px solid ${PH.border}`}}>
          <button onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke={PH.gold} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm" style={{color: PH.gold}}>Bayanihan</span>
          {activeGroup && <span className="text-xs truncate" style={{color: PH.text}}>{activeGroup.name}</span>}
        </div>

        {/* Group banner desktop */}
        {activeGroup && (
          <div className="hidden md:flex items-center gap-3 px-6 py-2 flex-shrink-0" style={{background: PH.card, borderBottom: `1px solid ${PH.border}`}}>
            <span className="text-sm font-bold" style={{color: '#fff'}}>{activeGroup.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{background: planColors[activeGroup.plan]?.bg || planColors.free.bg, color: planColors[activeGroup.plan]?.color || planColors.free.color}}>
              {activeGroup.plan}
            </span>
            {activeGroup.plan === 'free' && (
              <span className="text-xs ml-auto" style={{color: PH.text}}>
                Free plan · 10 members max ·{' '}
                <Link href="/dashboard/settings" style={{color: PH.gold}}>Mag-upgrade</Link>
              </span>
            )}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeGroup
            ? <ActiveGroupContext.Provider value={{ group: activeGroup, user, reload: () => loadGroups(user?.id) }}>
                {children}
              </ActiveGroupContext.Provider>
            : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-4">👥</div>
                <h2 className="text-lg font-bold mb-2" style={{color: '#fff'}}>Walang grupo pa</h2>
                <p className="text-sm mb-6" style={{color: PH.text}}>Gumawa ng iyong unang grupo para magsimula</p>
                <button onClick={() => setShowNewGroup(true)}
                  className="px-6 py-2.5 rounded-lg text-white font-bold text-sm"
                  style={{background: `linear-gradient(135deg, ${PH.red}, ${PH.navy})`}}>
                  Gumawa ng grupo
                </button>
              </div>
            )
          }
        </main>
      </div>

      {/* New group modal */}
      {showNewGroup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{background: PH.card, border: `1px solid ${PH.border}`}}>
            <div className="h-1 w-full flex rounded-full overflow-hidden mb-4">
              <div className="flex-1" style={{background: PH.navy}}></div>
              <div className="flex-1" style={{background: PH.gold}}></div>
              <div className="flex-1" style={{background: PH.red}}></div>
            </div>
            <h2 className="font-bold text-lg mb-1" style={{color: '#fff'}}>Bagong grupo</h2>
            <p className="text-sm mb-4" style={{color: PH.text}}>Paluwagan, kooperatiba, o samahan</p>
            <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
              placeholder="Samahan ng Marikina"
              className="w-full px-3 py-2.5 text-sm rounded-lg mb-4 outline-none"
              style={{background: PH.dark, border: `1px solid ${PH.border}`, color: '#fff'}}
              onKeyDown={e => e.key === 'Enter' && handleCreateGroup()} autoFocus />
            <div className="flex gap-2">
              <button onClick={() => setShowNewGroup(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold"
                style={{border: `1px solid ${PH.border}`, color: PH.text, background: 'transparent'}}>
                Kanselahin
              </button>
              <button onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{background: `linear-gradient(135deg, ${PH.red}, ${PH.navy})`}}>
                {creating ? 'Ginagawa...' : 'Gumawa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
