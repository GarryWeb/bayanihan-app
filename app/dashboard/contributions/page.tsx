'use client'
import { useEffect, useState } from 'react'
import { getContributions, getGroupMembers, recordContribution } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

export default function ContributionsPage() {
  const { group, user } = useActiveGroup()
  const [contributions, setContributions] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cycle, setCycle] = useState(new Date().toISOString().slice(0, 7))
  const [showRecord, setShowRecord] = useState(false)
  const [form, setForm] = useState({ member_id: '', amount_paid: '', late_fee: '0', status: 'paid', notes: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => { if (!group) return; loadData() }, [group, cycle])

  async function loadData() {
    setLoading(true)
    const [c, m] = await Promise.all([getContributions(group.id, cycle), getGroupMembers(group.id)])
    setContributions(c); setMembers(m); setLoading(false)
  }

  async function handleRecord() {
    if (!form.member_id) return
    setSaving(true); setMsg({ type: '', text: '' })
    try {
      const dueDate = `${cycle}-${String(group.due_day || 15).padStart(2, '0')}`
      await recordContribution({
        group_id: group.id, member_id: form.member_id, cycle,
        amount_due: group.contribution_amount || 500,
        amount_paid: Number(form.amount_paid) || group.contribution_amount || 500,
        late_fee: Number(form.late_fee) || 0,
        due_date: dueDate, status: form.status, recorded_by: user?.id, notes: form.notes,
      })
      setMsg({ type: 'success', text: 'Payment recorded!' })
      setForm({ member_id: '', amount_paid: '', late_fee: '0', status: 'paid', notes: '' })
      loadData()
    } catch (e: any) { setMsg({ type: 'error', text: e.message }) }
    setSaving(false)
  }

  const statusColors: Record<string, { bg: string, color: string }> = {
    paid: { bg: '#0B3A1F', color: '#4ADE80' },
    pending: { bg: '#3A2E00', color: '#FCD34D' },
    overdue: { bg: '#3A0B0B', color: '#F87171' },
  }
  const statusLabel: Record<string, string> = { paid: '✓ Paid', pending: '⏳ Pending', overdue: '⚠ Overdue' }

  const paid = contributions.filter(c => c.status === 'paid')
  const totalCollected = paid.reduce((s, c) => s + Number(c.amount_paid), 0)

  const inputStyle = { background: '#0B1F3A', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#FFFFFF', outline: 'none' }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px'}}><div style={{width:'32px',height:'32px',border:`3px solid ${C.gold}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:'#FFFFFF'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF',margin:0}}>Contributions</h1>
          <p style={{fontSize:'13px',color:C.muted,margin:'4px 0 0'}}>{paid.length} paid · {contributions.length - paid.length} pending/overdue</p>
        </div>
        <button onClick={() => setShowRecord(!showRecord)}
          style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
          + Record
        </button>
      </div>

      {/* Cycle selector */}
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',flexWrap:'wrap'}}>
        <label style={{fontSize:'13px',color:C.muted}}>Cycle:</label>
        <input type="month" value={cycle} onChange={e => setCycle(e.target.value)}
          style={{...inputStyle,padding:'6px 10px'}}/>
        <span style={{fontSize:'13px',fontWeight:'700',color:C.gold}}>₱{totalCollected.toLocaleString()} collected</span>
      </div>

      {/* Record form */}
      {showRecord && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
          <h3 style={{fontSize:'14px',fontWeight:'600',color:'#FFFFFF',margin:'0 0 12px'}}>Record a payment</h3>
          {msg.text && <div style={{fontSize:'13px',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px',background:msg.type==='error'?'#FF000015':'#D4A01715',color:msg.type==='error'?'#FF6B6B':C.gold}}>{msg.text}</div>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'10px',marginBottom:'12px'}}>
            <div style={{gridColumn:'1/-1'}}>
              <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Member</label>
              <select value={form.member_id} onChange={e => setForm(f => ({...f,member_id:e.target.value}))}
                style={{...inputStyle,width:'100%',boxSizing:'border-box' as const}}>
                <option value="">Select member</option>
                {members.map(m => <option key={m.profile_id} value={m.profile_id}>{m.profile?.full_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Amount paid (₱)</label>
              <input type="number" value={form.amount_paid} onChange={e => setForm(f => ({...f,amount_paid:e.target.value}))}
                placeholder={String(group.contribution_amount||500)} style={{...inputStyle,width:'100%',boxSizing:'border-box' as const}}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Late fee (₱)</label>
              <input type="number" value={form.late_fee} onChange={e => setForm(f => ({...f,late_fee:e.target.value}))}
                placeholder="0" style={{...inputStyle,width:'100%',boxSizing:'border-box' as const}}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({...f,status:e.target.value}))}
                style={{...inputStyle,width:'100%',boxSizing:'border-box' as const}}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Notes (optional)</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))}
                placeholder="GCash, cash, etc." style={{...inputStyle,width:'100%',boxSizing:'border-box' as const}}/>
            </div>
          </div>
          <button onClick={handleRecord} disabled={saving||!form.member_id}
            style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'9px 20px',borderRadius:'8px',border:'none',cursor:'pointer',opacity:saving||!form.member_id?0.6:1}}>
            {saving?'Saving...':'Save Payment'}
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:'8px',padding:'10px 16px',background:'#0B1F3A',borderBottom:`1px solid ${C.border}`,fontSize:'11px',fontWeight:'600',color:C.muted,textTransform:'uppercase' as const}}>
          <span>Member</span><span>Amount</span><span>Date</span><span>Status</span>
        </div>
        {contributions.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:C.muted}}>
            <p style={{fontSize:'13px',margin:0}}>No contribution records for this cycle</p>
          </div>
        ) : contributions.map((c, i) => {
          const sc = statusColors[c.status] || statusColors.pending
          return (
            <div key={c.id} style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:'8px',padding:'10px 16px',borderBottom:i<contributions.length-1?`1px solid ${C.border}`:'none',alignItems:'center'}}>
              <div>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#FFFFFF'}}>{c.profile?.full_name}</div>
                {c.late_fee > 0 && <div style={{fontSize:'11px',color:'#F87171'}}>+₱{c.late_fee} late fee</div>}
              </div>
              <div style={{fontSize:'13px',color:'#FFFFFF'}}>₱{Number(c.amount_paid).toLocaleString()}</div>
              <div style={{fontSize:'12px',color:C.muted}}>{c.paid_at?new Date(c.paid_at).toLocaleDateString('en-US'):'—'}</div>
              <div><span style={{fontSize:'11px',padding:'3px 8px',borderRadius:'20px',fontWeight:'600',background:sc.bg,color:sc.color}}>{statusLabel[c.status]}</span></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
