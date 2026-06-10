'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

const PLANS = [
  { key: 'free', name: 'Free', price: '₱0', sub: 'forever', members: 'Up to 10 members' },
  { key: 'starter', name: 'Starter', price: '₱200', sub: '/month', members: 'Up to 30 members' },
  { key: 'pro', name: 'Pro', price: '₱1,299', sub: '/month', members: 'Up to 80 members' },
  { key: 'elite', name: 'Elite', price: '₱2,999', sub: '/month', members: 'Unlimited members' },
]

export default function SettingsPage() {
  const { group, reload } = useActiveGroup()
  const [form, setForm] = useState({
    name: group?.name || '',
    contribution_amount: group?.contribution_amount || 500,
    due_day: group?.due_day || 15,
    grace_days: group?.grace_days || 3,
    penalty_amount: group?.penalty_amount || 50,
    max_loan_percent: group?.max_loan_percent || 80,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('groups').update(form).eq('id', group.id)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500); reload() }
    setSaving(false)
  }

  const inputStyle = { width: '100%', background: '#0B1F3A', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:'#FFFFFF'}}>
      <h1 style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF',margin:'0 0 20px'}}>Settings</h1>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'20px',marginBottom:'16px'}}>
        <h2 style={{fontSize:'14px',fontWeight:'600',color:C.gold,margin:'0 0 16px'}}>Group Configuration</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'14px'}}>
          <div style={{gridColumn:'1/-1'}}>
            <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'5px'}}>Group name</label>
            <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} style={inputStyle}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'5px'}}>Monthly contribution (₱)</label>
            <input type="number" value={form.contribution_amount} onChange={e=>set('contribution_amount',Number(e.target.value))} style={inputStyle}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'5px'}}>Due day (day of month)</label>
            <input type="number" value={form.due_day} min={1} max={31} onChange={e=>set('due_day',Number(e.target.value))} style={inputStyle}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'5px'}}>Grace period (days)</label>
            <input type="number" value={form.grace_days} min={0} max={30} onChange={e=>set('grace_days',Number(e.target.value))} style={inputStyle}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'5px'}}>Late penalty (₱)</label>
            <input type="number" value={form.penalty_amount} min={0} onChange={e=>set('penalty_amount',Number(e.target.value))} style={inputStyle}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'5px'}}>Max loan (% of balance)</label>
            <select value={form.max_loan_percent} onChange={e=>set('max_loan_percent',Number(e.target.value))} style={inputStyle}>
              <option value={50}>50%</option>
              <option value={80}>80%</option>
              <option value={100}>100%</option>
            </select>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'16px'}}>
          <button onClick={handleSave} disabled={saving}
            style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'9px 20px',borderRadius:'8px',border:'none',cursor:'pointer',opacity:saving?0.7:1}}>
            {saving?'Saving...':'Save Settings'}
          </button>
          {saved && <span style={{fontSize:'13px',color:C.gold}}>Saved! ✓</span>}
        </div>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'20px'}}>
        <h2 style={{fontSize:'14px',fontWeight:'600',color:C.gold,margin:'0 0 4px'}}>Plan & Pricing</h2>
        <p style={{fontSize:'12px',color:C.muted,margin:'0 0 16px'}}>Current plan: <strong style={{color:'#FFFFFF'}}>{group?.plan}</strong></p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'10px'}}>
          {PLANS.map(p => (
            <div key={p.key} style={{background:group?.plan===p.key?`${C.gold}15`:'#0B1F3A',border:`1px solid ${group?.plan===p.key?C.gold:C.border}`,borderRadius:'10px',padding:'14px'}}>
              <div style={{fontWeight:'700',fontSize:'14px',color:group?.plan===p.key?C.gold:'#FFFFFF',marginBottom:'2px'}}>{p.name}</div>
              <div style={{fontSize:'16px',fontWeight:'700',color:'#FFFFFF'}}>{p.price}<span style={{fontSize:'11px',fontWeight:'400',color:C.muted}}>{p.sub}</span></div>
              <div style={{fontSize:'11px',color:C.muted,margin:'4px 0 10px'}}>{p.members}</div>
              {group?.plan===p.key
                ? <div style={{fontSize:'11px',color:C.gold,fontWeight:'600'}}>✓ Current plan</div>
                : <button style={{fontSize:'11px',color:C.gold,background:'transparent',border:'none',cursor:'pointer',padding:0,fontWeight:'600'}}>Upgrade →</button>
              }
            </div>
          ))}
        </div>
        <div style={{marginTop:'14px',padding:'12px',background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:'8px'}}>
          <p style={{fontSize:'12px',color:C.gold,margin:0}}>In-app payment coming soon. Contact support to upgrade your plan manually.</p>
        </div>
      </div>
    </div>
  )
}
