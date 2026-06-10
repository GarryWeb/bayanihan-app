'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [group, setGroup] = useState<any>(null)
  const [status, setStatus] = useState<'loading'|'found'|'joining'|'joined'|'error'>('loading')
  const [user, setUser] = useState<any>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMsg('Invalid invite link.'); return }
    supabase.from('groups').select('*').eq('invite_token', token).single()
      .then(({ data, error }) => {
        if (error || !data) { setStatus('error'); setMsg('Invite link is invalid or expired.'); return }
        setGroup(data)
        setStatus('found')
      })
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [token])

  async function handleJoin() {
    if (!user) { router.push(`/auth/signup?redirect=/join?token=${token}`); return }
    setStatus('joining')
    const { data: existing } = await supabase.from('memberships').select('id').eq('group_id', group.id).eq('profile_id', user.id).single()
    if (existing) { setStatus('joined'); setMsg('You are already a member of this group!'); return }
    const { error } = await supabase.from('memberships').insert({
      group_id: group.id, profile_id: user.id, role: 'member', joined_at: new Date().toISOString()
    })
    if (error) { setStatus('error'); setMsg(error.message); return }
    setStatus('joined')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'Inter',sans-serif"}}>
      <div style={{width:'100%',maxWidth:'400px',textAlign:'center'}}>
        <div style={{marginBottom:'32px'}}>
          <div style={{width:'48px',height:'48px',background:C.gold,borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',color:C.bg,fontSize:'20px',margin:'0 auto 12px'}}>C</div>
          <div style={{fontWeight:'700',fontSize:'20px',color:'#FFFFFF'}}>CommunityFlow</div>
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'16px',padding:'28px'}}>
          {status === 'loading' && <div style={{color:C.muted}}>Loading invite...</div>}

          {status === 'found' && (
            <>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>👋</div>
              <h2 style={{fontSize:'18px',fontWeight:'700',color:'#FFFFFF',marginBottom:'8px'}}>You're invited!</h2>
              <p style={{fontSize:'14px',color:C.muted,marginBottom:'4px'}}>Join the group</p>
              <p style={{fontSize:'20px',fontWeight:'700',color:C.gold,marginBottom:'20px'}}>{group?.name}</p>
              {user ? (
                <button onClick={handleJoin}
                  style={{width:'100%',background:C.gold,color:C.bg,fontWeight:'700',fontSize:'14px',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
                  Join {group?.name}
                </button>
              ) : (
                <>
                  <p style={{fontSize:'13px',color:C.muted,marginBottom:'16px'}}>Sign up or log in to join this group.</p>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button onClick={() => router.push(`/auth/signup?redirect=/join?token=${token}`)}
                      style={{flex:1,background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'10px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
                      Sign Up & Join
                    </button>
                    <button onClick={() => router.push(`/auth/login?redirect=/join?token=${token}`)}
                      style={{flex:1,background:'transparent',color:C.gold,fontWeight:'700',fontSize:'13px',padding:'10px',borderRadius:'8px',border:`1px solid ${C.gold}`,cursor:'pointer'}}>
                      Login & Join
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {status === 'joining' && <div style={{color:C.muted}}>Joining group...</div>}

          {status === 'joined' && (
            <>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>🎉</div>
              <h2 style={{fontSize:'18px',fontWeight:'700',color:C.gold,marginBottom:'8px'}}>Welcome to {group?.name}!</h2>
              <p style={{fontSize:'13px',color:C.muted}}>{msg || 'Redirecting to dashboard...'}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>❌</div>
              <h2 style={{fontSize:'18px',fontWeight:'700',color:'#FF6B6B',marginBottom:'8px'}}>Invalid Link</h2>
              <p style={{fontSize:'13px',color:C.muted,marginBottom:'16px'}}>{msg}</p>
              <button onClick={() => router.push('/')}
                style={{background:C.gold,color:C.bg,fontWeight:'700',fontSize:'13px',padding:'10px 20px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
                Go to CommunityFlow
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
