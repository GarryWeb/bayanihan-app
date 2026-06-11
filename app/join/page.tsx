'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

function JoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [group, setGroup] = useState<any>(null)
  const [status, setStatus] = useState<'loading'|'found'|'signup'|'joining'|'joined'|'error'>('loading')
  const [user, setUser] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMsg('Invalid invite link.'); return }
    supabase.from('groups').select('*').eq('invite_token', token).single()
      .then(({ data, error }) => {
        if (error || !data) { setStatus('error'); setMsg('Invite link is invalid or expired.'); return }
        setGroup(data)
        supabase.auth.getUser().then(({ data: { user } }) => {
          setUser(user)
          setStatus('found')
        })
      })
  }, [token])

  async function handleSignUpAndJoin() {
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Please fill in all fields.'); return
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters.'); return
    }
    setSaving(true); setFormError('')
    
    // Sign up
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name } }
    })
    if (signUpError) { setFormError(signUpError.message); setSaving(false); return }
    
    // Wait a moment for profile to be created
    await new Promise(r => setTimeout(r, 1500))
    
    // Join the group
    const userId = authData.user?.id
    if (userId) {
      await supabase.from('memberships').insert({
        group_id: group.id, profile_id: userId, role: 'member', joined_at: new Date().toISOString()
      })
    }
    
    setStatus('joined')
    setSaving(false)
  }

  async function handleLoginAndJoin() {
    setStatus('joining')
    const { data: existing } = await supabase.from('memberships').select('id')
      .eq('group_id', group.id).eq('profile_id', user.id).single()
    if (existing) { setStatus('joined'); setMsg('You are already a member!'); return }
    const { error } = await supabase.from('memberships').insert({
      group_id: group.id, profile_id: user.id, role: 'member', joined_at: new Date().toISOString()
    })
    if (error) { setStatus('error'); setMsg(error.message); return }
    setStatus('joined')
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'Inter',sans-serif"}}>
      <div style={{width:'100%',maxWidth:'400px',textAlign:'center'}}>
        <div style={{marginBottom:'24px'}}>
          <div style={{width:'48px',height:'48px',background:C.gold,borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',color:C.bg,fontSize:'20px',margin:'0 auto 12px'}}>C</div>
          <div style={{fontWeight:'700',fontSize:'20px',color:'#FFFFFF'}}>CommunityFlow</div>
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'16px',padding:'24px',textAlign:'left'}}>
          
          {status === 'loading' && (
            <div style={{textAlign:'center',color:C.muted}}>Loading invite...</div>
          )}

          {status === 'found' && (
            <>
              <div style={{textAlign:'center',marginBottom:'20px'}}>
                <div style={{fontSize:'28px',marginBottom:'8px'}}>👋</div>
                <h2 style={{fontSize:'18px',fontWeight:'700',color:'#FFFFFF',marginBottom:'4px'}}>You're invited!</h2>
                <p style={{fontSize:'14px',color:C.muted,marginBottom:'4px'}}>Join the group</p>
                <p style={{fontSize:'20px',fontWeight:'700',color:C.gold}}>{group?.name}</p>
              </div>

              {user ? (
                <button onClick={handleLoginAndJoin}
                  style={{width:'100%',background:C.gold,color:C.bg,fontWeight:'700',fontSize:'14px',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
                  Join {group?.name}
                </button>
              ) : (
                <>
                  <button onClick={() => setStatus('signup')}
                    style={{width:'100%',background:C.gold,color:C.bg,fontWeight:'700',fontSize:'14px',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer',marginBottom:'10px'}}>
                    Sign Up & Join
                  </button>
                  <button onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent('/join?token='+token)}`)}
                    style={{width:'100%',background:'transparent',color:C.gold,fontWeight:'600',fontSize:'14px',padding:'12px',borderRadius:'8px',border:`1px solid ${C.gold}`,cursor:'pointer'}}>
                    Already have an account? Login
                  </button>
                </>
              )}
            </>
          )}

          {status === 'signup' && (
            <>
              <div style={{textAlign:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'14px',color:C.muted,margin:0}}>Create account to join</p>
                <p style={{fontSize:'16px',fontWeight:'700',color:C.gold,margin:'4px 0 0'}}>{group?.name}</p>
              </div>
              {formError && <div style={{background:'#FF000015',border:'1px solid #FF000033',color:'#FF6B6B',fontSize:'13px',padding:'10px',borderRadius:'8px',marginBottom:'14px'}}>{formError}</div>}
              <div style={{marginBottom:'12px'}}>
                <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Full name</label>
                <input type="text" value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))}
                  placeholder="Your full name" autoFocus
                  style={{width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'10px 12px',fontSize:'13px',color:'#FFFFFF',outline:'none',boxSizing:'border-box' as const}}/>
              </div>
              <div style={{marginBottom:'12px'}}>
                <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Email address</label>
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                  placeholder="you@example.com"
                  style={{width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'10px 12px',fontSize:'13px',color:'#FFFFFF',outline:'none',boxSizing:'border-box' as const}}/>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'12px',color:C.muted,marginBottom:'4px'}}>Password</label>
                <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                  placeholder="minimum 6 characters"
                  style={{width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'10px 12px',fontSize:'13px',color:'#FFFFFF',outline:'none',boxSizing:'border-box' as const}}/>
              </div>
              <button onClick={handleSignUpAndJoin} disabled={saving}
                style={{width:'100%',background:C.gold,color:C.bg,fontWeight:'700',fontSize:'14px',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer',opacity:saving?0.7:1,marginBottom:'10px'}}>
                {saving?'Creating account...':'Create Account & Join'}
              </button>
              <button onClick={() => setStatus('found')}
                style={{width:'100%',background:'transparent',color:C.muted,fontSize:'13px',padding:'8px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
                ← Back
              </button>
            </>
          )}

          {status === 'joining' && (
            <div style={{textAlign:'center',color:C.muted}}>Joining group...</div>
          )}

          {status === 'joined' && (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>🎉</div>
              <h2 style={{fontSize:'18px',fontWeight:'700',color:C.gold,marginBottom:'8px'}}>Welcome to {group?.name}!</h2>
              <p style={{fontSize:'13px',color:C.muted,marginBottom:'20px'}}>{msg || 'You are now a member of this group.'}</p>
              <button onClick={() => router.push('/dashboard')}
                style={{width:'100%',background:C.gold,color:C.bg,fontWeight:'700',fontSize:'14px',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
                Go to Dashboard →
              </button>
            </div>
          )}

          {status === 'error' && (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>❌</div>
              <h2 style={{fontSize:'18px',fontWeight:'700',color:'#FF6B6B',marginBottom:'8px'}}>Invalid Link</h2>
              <p style={{fontSize:'13px',color:C.muted,marginBottom:'16px'}}>{msg}</p>
              <button onClick={() => router.push('/')}
                style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'10px 20px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
                Go to CommunityFlow
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#0B1F3A'}}/>}>
      <JoinContent />
    </Suspense>
  )
}
