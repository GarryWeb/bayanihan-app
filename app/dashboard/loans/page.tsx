'use client'
import { useEffect, useState } from 'react'
import { getLoans, getGroupMembers, calcLoan, supabase } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

export default function LoansPage() {
  const { group, user } = useActiveGroup()
  const [loans, setLoans] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'loans'|'calculator'>('loans')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ borrower_id: '', principal: '', interest_rate: '3', term_months: '6', method: 'flat' })
  const [calc, setCalc] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const isPro = ['pro', 'elite'].includes(group?.plan)

  useEffect(() => { if (!group) return; loadData() }, [group])

  async function loadData() {
    setLoading(true)
    const [l, m] = await Promise.all([getLoans(group.id), getGroupMembers(group.id)])
    setLoans(l); setMembers(m); setLoading(false)
  }

  function handleCalc() {
    if (!form.principal) return
    const result = calcLoan(Number(form.principal), Number(form.interest_rate), Number(form.term_months), form.method as 'flat'|'diminishing')
    setCalc(result)
  }

  async function handleCreate() {
    if (!form.borrower_id || !form.principal) return
    setSaving(true); setMsg({ type: '', text: '' })
    try {
      const { monthlyPayment, totalInterest } = calcLoan(Number(form.principal), Number(form.interest_rate), Number(form.term_months), form.method as 'flat'|'diminishing')
      const { error } = await supabase.from('loans').insert({
        group_id: group.id, borrower_id: form.borrower_id,
        principal: Number(form.principal), interest_rate: Number(form.interest_rate),
        term_months: Number(form.term_months), method: form.method,
        monthly_payment: monthlyPayment, total_interest: totalInterest,
        balance_remaining: Number(form.principal), status: 'pending'
      })
      if (error) throw error
      setMsg({ type: 'success', text: 'Loan request submitted!' })
      setForm({ borrower_id: '', principal: '', interest_rate: '3', term_months: '6', method: 'flat' })
      setCalc(null); loadData()
    } catch (e: any) { setMsg({ type: 'error', text: e.message }) }
    setSaving(false)
  }

  async function handleApprove(loanId: string) {
    await supabase.from('loans').update({ status: 'active', approved_by: user?.id, approved_at: new Date().toISOString() }).eq('id', loanId)
    loadData()
  }

  const statusColors: Record<string, { bg: string, color: string }> = {
    pending: { bg: '#3A2E00', color: '#FCD34D' },
    active: { bg: '#0B3A1F', color: '#4ADE80' },
    paid: { bg: '#1A2550', color: '#93C5FD' },
    rejected: { bg: '#3A0B0B', color: '#F87171' },
  }

  const inputStyle = { background: '#0B1F3A', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#FFFFFF', outline: 'none', width: '100%', boxSizing: 'border-box' as const }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px'}}><div style={{width:'32px',height:'32px',border:`3px solid ${C.gold}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  if (!isPro) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',textAlign:'center',padding:'24px'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🔒</div>
      <h2 style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF',marginBottom:'8px'}}>Pro Feature</h2>
      <p style={{fontSize:'14px',color:C.muted,marginBottom:'24px',maxWidth:'320px'}}>Loan management and calculator are available on the Pro plan (₱1,299/month) and Elite plan.</p>
      <a href="/dashboard/settings" style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'14px',padding:'10px 24px',borderRadius:'8px',textDecoration:'none'}}>Upgrade to Pro →</a>
    </div>
  )

  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:'#FFFFFF'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <h1 style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF',margin:0}}>Loans</h1>
        <button onClick={() => setShowNew(!showNew)}
          style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
          + New Loan
        </button>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'4px',background:'#0B1F3A',borderRadius:'10px',padding:'4px',marginBottom:'16px',width:'fit-content'}}>
        {(['loans','calculator'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{padding:'7px 16px',borderRadius:'7px',fontSize:'13px',fontWeight:'600',cursor:'pointer',border:'none',background:tab===t?C.gold:'transparent',color:tab===t?C.bg:C.muted,transition:'all 0.15s'}}>
            {t === 'loans' ? 'Loans' : 'Calculator'}
          </button>
        ))}
      </div>

      {tab === 'calculator' && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'20px'}}>
          <h2 style={{fontSize:'14px',fontWeight:'600',color:C.gold,margin:'0 0 16px'}}>Loan Calculator</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'12px',marginBottom:'16px'}}>
            <div><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Principal (₱)</label>
              <input type="number" value={form.principal} onChange={e => {setForm(f=>({...f,principal:e.target.value}));setCalc(null)}} placeholder="10000" style={inputStyle}/></div>
            <div><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Monthly interest (%)</label>
              <input type="number" value={form.interest_rate} onChange={e => {setForm(f=>({...f,interest_rate:e.target.value}));setCalc(null)}} step="0.5" style={inputStyle}/></div>
            <div><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Term (months)</label>
              <input type="number" value={form.term_months} onChange={e => {setForm(f=>({...f,term_months:e.target.value}));setCalc(null)}} min="1" max="24" style={inputStyle}/></div>
            <div><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Method</label>
              <select value={form.method} onChange={e => {setForm(f=>({...f,method:e.target.value}));setCalc(null)}} style={inputStyle}>
                <option value="flat">Flat rate</option>
                <option value="diminishing">Diminishing balance</option>
              </select></div>
          </div>
          <button onClick={handleCalc} style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'9px 20px',borderRadius:'8px',border:'none',cursor:'pointer',marginBottom:'16px'}}>
            Calculate
          </button>
          {calc && (
            <div style={{background:'#0B1F3A',borderRadius:'10px',padding:'16px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',textAlign:'center'}}>
              <div><div style={{fontSize:'11px',color:C.muted,marginBottom:'4px'}}>Monthly Payment</div><div style={{fontSize:'20px',fontWeight:'700',color:C.gold}}>₱{calc.monthlyPayment.toLocaleString()}</div></div>
              <div><div style={{fontSize:'11px',color:C.muted,marginBottom:'4px'}}>Total Interest</div><div style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF'}}>₱{calc.totalInterest.toLocaleString()}</div></div>
              <div><div style={{fontSize:'11px',color:C.muted,marginBottom:'4px'}}>Total Repayment</div><div style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF'}}>₱{(Number(form.principal)+calc.totalInterest).toLocaleString()}</div></div>
            </div>
          )}
        </div>
      )}

      {tab === 'loans' && (
        <>
          {showNew && (
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
              <h3 style={{fontSize:'14px',fontWeight:'600',color:'#FFFFFF',margin:'0 0 12px'}}>New loan request</h3>
              {msg.text && <div style={{fontSize:'13px',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px',background:msg.type==='error'?'#FF000015':'#D4A01715',color:msg.type==='error'?'#FF6B6B':C.gold}}>{msg.text}</div>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'10px',marginBottom:'12px'}}>
                <div style={{gridColumn:'1/-1'}}><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Borrower</label>
                  <select value={form.borrower_id} onChange={e=>setForm(f=>({...f,borrower_id:e.target.value}))} style={inputStyle}>
                    <option value="">Select member</option>
                    {members.map(m=><option key={m.profile_id} value={m.profile_id}>{m.profile?.full_name}</option>)}
                  </select></div>
                <div><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Principal (₱)</label>
                  <input type="number" value={form.principal} onChange={e=>setForm(f=>({...f,principal:e.target.value}))} placeholder="10000" style={inputStyle}/></div>
                <div><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Rate (%) / month</label>
                  <input type="number" value={form.interest_rate} onChange={e=>setForm(f=>({...f,interest_rate:e.target.value}))} step="0.5" style={inputStyle}/></div>
                <div><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Term (months)</label>
                  <input type="number" value={form.term_months} onChange={e=>setForm(f=>({...f,term_months:e.target.value}))} style={inputStyle}/></div>
                <div><label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Method</label>
                  <select value={form.method} onChange={e=>setForm(f=>({...f,method:e.target.value}))} style={inputStyle}>
                    <option value="flat">Flat rate</option><option value="diminishing">Diminishing</option>
                  </select></div>
              </div>
              <button onClick={handleCreate} disabled={saving||!form.borrower_id||!form.principal}
                style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'9px 20px',borderRadius:'8px',border:'none',cursor:'pointer',opacity:saving||!form.borrower_id||!form.principal?0.6:1}}>
                {saving?'Submitting...':'Submit Loan Request'}
              </button>
            </div>
          )}

          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto auto',gap:'8px',padding:'10px 16px',background:'#0B1F3A',borderBottom:`1px solid ${C.border}`,fontSize:'11px',fontWeight:'600',color:C.muted,textTransform:'uppercase' as const}}>
              <span>Member</span><span>Principal</span><span>Monthly</span><span>Balance</span><span>Status</span>
            </div>
            {loans.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px',color:C.muted}}><p style={{fontSize:'13px',margin:0}}>No loans yet</p></div>
            ) : loans.map((l, i) => {
              const sc = statusColors[l.status] || statusColors.pending
              return (
                <div key={l.id} style={{display:'grid',gridTemplateColumns:'1fr auto auto auto auto',gap:'8px',padding:'10px 16px',borderBottom:i<loans.length-1?`1px solid ${C.border}`:'none',alignItems:'center'}}>
                  <div style={{fontSize:'13px',fontWeight:'600',color:'#FFFFFF',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.profile?.full_name}</div>
                  <div style={{fontSize:'13px',color:'#FFFFFF'}}>₱{Number(l.principal).toLocaleString()}</div>
                  <div style={{fontSize:'13px',color:'#FFFFFF'}}>₱{Number(l.monthly_payment).toLocaleString()}</div>
                  <div style={{fontSize:'13px',color:'#FFFFFF'}}>₱{Number(l.balance_remaining).toLocaleString()}</div>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <span style={{fontSize:'11px',padding:'3px 8px',borderRadius:'20px',fontWeight:'600',background:sc.bg,color:sc.color}}>{l.status}</span>
                    {l.status==='pending' && <button onClick={()=>handleApprove(l.id)} style={{fontSize:'11px',color:C.gold,background:'transparent',border:'none',cursor:'pointer',fontWeight:'600'}}>Approve</button>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
