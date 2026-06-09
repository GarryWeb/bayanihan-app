'use client'
import { useEffect, useState } from 'react'
import { getGroupMembers, addMemberByEmail } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

export default function MembersPage() {
  const { group, user } = useActiveGroup()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const isAdmin = members.find(m => m.profile_id === user?.id)?.role === 'admin'
  const planLimit = { free: 10, starter: 30, pro: 80, elite: Infinity }
  const limit = planLimit[group?.plan as keyof typeof planLimit] || 10

  useEffect(() => {
    if (!group) return
    loadMembers()
  }, [group])

  async function loadMembers() {
    setLoading(true)
    const data = await getGroupMembers(group.id)
    setMembers(data)
    setLoading(false)
  }

  async function handleAdd() {
    if (!email.trim()) return
    if (members.length >= limit) {
      setMsg({ type: 'error', text: `Naabot na ang limitasyon ng ${group?.plan} plan (${limit} members). Mag-upgrade para magdagdag pa.` })
      return
    }
    setAdding(true)
    setMsg({ type: '', text: '' })
    try {
      await addMemberByEmail(group.id, email.trim(), role)
      setMsg({ type: 'success', text: 'Miyembro na siya! ✓' })
      setEmail('')
      loadMembers()
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message })
    }
    setAdding(false)
  }

  const roleColor: Record<string, string> = {
    admin: 'bg-[#085041] text-[#9FE1CB]',
    treasurer: 'bg-[#E1F5EE] text-[#085041]',
    member: 'bg-gray-100 text-gray-600',
  }

  const initials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mga Miyembro</h1>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} / {limit === Infinity ? '∞' : limit} members · {group?.plan} plan</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(!showAdd)}
            className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#085041] transition-colors">
            + Magdagdag
          </button>
        )}
      </div>

      {/* Plan limit bar */}
      {limit !== Infinity && (
        <div className="bg-white border border-gray-100 rounded-xl p-3 mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Members</span><span>{members.length}/{limit}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${members.length >= limit ? 'bg-red-400' : 'bg-[#1D9E75]'}`}
              style={{ width: `${Math.min(100, (members.length / limit) * 100)}%` }} />
          </div>
          {members.length >= limit && (
            <p className="text-xs text-red-500 mt-1.5">Naabot na ang limit. <a href="/dashboard/settings" className="underline">Mag-upgrade →</a></p>
          )}
        </div>
      )}

      {/* Add member form */}
      {showAdd && isAdmin && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">Magdagdag ng miyembro</h3>
          {msg.text && (
            <div className={`text-sm px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-[#E1F5EE] text-[#085041]'}`}>
              {msg.text}
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email ng miyembro" onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            <select value={role} onChange={e => setRole(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
              <option value="member">Member</option>
              <option value="treasurer">Treasurer</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleAdd} disabled={adding || !email.trim()}
              className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#085041] disabled:opacity-60 whitespace-nowrap">
              {adding ? 'Idinagdag...' : 'Idagdag'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Kailangan muna siyang mag-sign up sa Bayanihan bago mo siya maidagdag.</p>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {members.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm">Walang miyembro pa. Magdagdag na!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 bg-[#E1F5EE] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-[#085041]">{initials(m.profile?.full_name || '')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{m.profile?.full_name}</div>
                  <div className="text-xs text-gray-400 truncate">{m.profile?.email}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[m.role] || roleColor.member}`}>
                  {m.role}
                </span>
                <div className="text-xs text-gray-400 hidden sm:block">
                  {new Date(m.joined_at).toLocaleDateString('tl-PH')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
