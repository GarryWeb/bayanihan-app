'use client'
import { useEffect, useState } from 'react'
import { getGroupMembers, addMemberByEmail } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

export default function MembersPage() {
  const { group, user } = useActiveGroup()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const planLimit: Record<string, number> = { free: 10, starter: 30, pro: 80, elite: Infinity }
  const limit = planLimit[group?.plan] || 10
  const isAdmin = members.find(m => m.profile_id === user?.id)?.role === 'admin'

  useEffect(() => { if (!group) return; loadMembers() }, [group])

  async function loadMembers() {
    setLoading(true)
    const data = await getGroupMembers(group.id)
    setMembers(data)
    setLoading(false)
  }

  async function handleAdd() {
    if (!email.trim()) return
    if (members.length >= limit) { setMsg({ type: 'error', text: `Plan limit reached (${limit} members). Upgrade to add more.` }); return }
    setAdding(true)
    setMsg({ type: '', text: '' })
    try {
      await addMemberByEmail(group.id, email.trim(), role)
      setMsg({ type: 'success', text: 'Member added successfully!' })
      setEmail('')
      loadMembers()
    } catch (e: any) { setMsg({ type: 'error', text: e.message }) }
    setAdding(false)
  }

  const roleColor: Record<string, { bg: string, color: string }> = {
    admin: { bg: C.gold, color: C.bg },
    treasurer: { bg: '#1A3A5C', color: C.gold },
    member: { bg: '#0B1F3A', color: C.text },
  }

  const initials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px'}}><div style={{width:'32px',height:'32px',border:`3px solid ${C.gold}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:'#FFFFFF'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF',margin:0}}>Members</h1>
          <p style={{fontSize:'13px',color:C.muted,margin:'4px 0 0'}}>{members.length} / {limit === Infinity ? '∞' : limit} · {group?.plan} plan</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(!showAdd)}
            style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
            + Add Member
          </button>
        )}
      </div>

      {/* Plan limit bar */}
      {limit !== Infinity && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'10px',padding:'12px 16px',marginBottom:'14px'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:C.muted,marginBottom:'6px'}}>
            <span>Members</span><span>{members.length}/{limit}</span>
          </div>
          <div style={{height:'5px',background:'#0B1F3A',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${Math.min(100,(members.length/limit)*100)}%`,background:members.length>=limit?'#FF6B6B':C.gold,borderRadius:'3px'}}/>
          </div>
          {members.length >= limit && <p style={{fontSize:'12px',color:'#FF6B6B',margin:'6px 0 0'}}>Plan limit reached. <a href="/dashboard/settings" style={{color:C.gold}}>Upgrade →</a></p>}
        </div>
      )}

      {/* Add member form */}
      {showAdd && isAdmin && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'16px',marginBottom:'14px'}}>
          <h3 style={{fontSize:'14px',fontWeight:'600',color:'#FFFFFF',margin:'0 0 12px'}}>Add a member</h3>
          {msg.text && <div style={{fontSize:'13px',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px',background:msg.type==='error'?'#FF000015':'#D4A01715',color:msg.type==='error'?'#FF6B6B':C.gold}}>{msg.text}</div>}
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@email.com"
              onKeyDown={e => e.key==='Enter'&&handleAdd()}
              style={{flex:1,minWidth:'200px',background:'#0B1F3A',border:`1px solid ${C.border}`,borderRadius:'8px',padding:'9px 12px',fontSize:'13px',color:'#FFFFFF',outline:'none'}}/>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{background:'#0B1F3A',border:`1px solid ${C.border}`,borderRadius:'8px',padding:'9px 12px',fontSize:'13px',color:'#FFFFFF',outline:'none'}}>
              <option value="member">Member</option>
              <option value="treasurer">Treasurer</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleAdd} disabled={adding||!email.trim()}
              style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'9px 16px',borderRadius:'8px',border:'none',cursor:'pointer',opacity:adding||!email.trim()?0.6:1}}>
              {adding?'Adding...':'Add'}
            </button>
          </div>
          <p style={{fontSize:'12px',color:C.muted,margin:'8px 0 0'}}>The member must have a CommunityFlow account first.</p>
        </div>
      )}

      {/* Members list */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',overflow:'hidden'}}>
        {members.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:C.muted}}>
            <div style={{fontSize:'32px',marginBottom:'8px'}}>◎</div>
            <p style={{fontSize:'13px',margin:0}}>No members yet. Add your first member!</p>
          </div>
        ) : members.map((m, i) => {
          const rc = roleColor[m.role] || roleColor.member
          return (
            <div key={m.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderBottom:i<members.length-1?`1px solid ${C.border}`:'none'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'50%',background:C.gold,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700',color:C.bg,flexShrink:0}}>
                {initials(m.profile?.full_name||'')}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#FFFFFF',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.profile?.full_name}</div>
                <div style={{fontSize:'12px',color:C.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.profile?.email}</div>
              </div>
              <span style={{fontSize:'11px',padding:'3px 8px',borderRadius:'20px',fontWeight:'600',background:rc.bg,color:rc.color,flexShrink:0}}>{m.role}</span>
              <div style={{fontSize:'11px',color:C.muted,flexShrink:0,display:'none'}}>{new Date(m.joined_at).toLocaleDateString('en-US')}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
