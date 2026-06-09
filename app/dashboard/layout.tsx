'use client'
import { useEffect, useState } from 'react'
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

  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600',
    starter: 'bg-blue-50 text-blue-700',
    pro: 'bg-purple-50 text-purple-700',
    elite: 'bg-[#E1F5EE] text-[#085041]',
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">B</span>
          </div>
          <span className="font-semibold text-[#085041] text-sm">Bayanihan</span>
        </div>
      </div>

      {/* Group selector */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="text-xs text-gray-400 font-medium mb-2 px-1">GRUPO</div>
        {groups.map(g => (
          <button key={g.id} onClick={() => setActiveGroup(g)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${activeGroup?.id === g.id ? 'bg-[#E1F5EE] text-[#085041]' : 'hover:bg-gray-50 text-gray-700'}`}>
            <div className="font-medium truncate">{g.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${planColors[g.plan] || planColors.free}`}>
                {g.plan}
              </span>
              <span className="text-xs text-gray-400 capitalize">{g.role}</span>
            </div>
          </button>
        ))}
        <button onClick={() => setShowNewGroup(true)}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#1D9E75] hover:bg-[#E1F5EE] transition-colors font-medium">
          + Bagong grupo
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-[#1D9E75] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-7 h-7 bg-[#E1F5EE] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-[#085041]">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 truncate">{user?.user_metadata?.full_name || 'User'}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
          <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">Exit</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-[#085041] text-sm">Bayanihan</span>
          {activeGroup && (
            <span className="text-xs text-gray-500 truncate">{activeGroup.name}</span>
          )}
        </div>

        {/* Active group context banner */}
        {activeGroup && (
          <div className="bg-white border-b border-gray-100 px-6 py-2 hidden md:flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{activeGroup.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColors[activeGroup.plan] || planColors.free}`}>
              {activeGroup.plan}
            </span>
            {activeGroup.plan === 'free' && (
              <span className="text-xs text-gray-400 ml-auto">
                Free plan · 10 members max ·{' '}
                <Link href="/dashboard/settings" className="text-[#1D9E75] hover:underline">Mag-upgrade</Link>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Walang grupo pa</h2>
                <p className="text-sm text-gray-500 mb-6">Gumawa ng iyong unang grupo para magsimula</p>
                <button onClick={() => setShowNewGroup(true)}
                  className="bg-[#1D9E75] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#085041]">
                  Gumawa ng grupo
                </button>
              </div>
            )
          }
        </main>
      </div>

      {/* New group modal */}
      {showNewGroup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-semibold text-lg mb-1">Bagong grupo</h2>
            <p className="text-sm text-gray-500 mb-4">Paluwagan, kooperatiba, o samahan</p>
            <input
              type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
              placeholder="Samahan ng Marikina"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] mb-4"
              onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setShowNewGroup(false)}
                className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                Kanselahin
              </button>
              <button onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}
                className="flex-1 bg-[#1D9E75] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#085041] disabled:opacity-60">
                {creating ? 'Ginagawa...' : 'Gumawa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Context for passing active group to child pages
import { createContext, useContext } from 'react'
export const ActiveGroupContext = createContext<{ group: any, user: any, reload: () => void }>({ group: null, user: null, reload: () => {} })
export const useActiveGroup = () => useContext(ActiveGroupContext)
