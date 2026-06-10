'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push(redirect || '/dashboard')
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'Inter',sans-serif"}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'48px',height:'48px',background:C.gold,borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',color:C.bg,fontSize:'20px',margin:'0 auto 12px'}}>C</div>
          <div style={{fontWeight:'700',fontSize:'20px',color:'#FFFFFF'}}>CommunityFlow</div>
          <div style={{fontSize:'13px',color:C.muted,marginTop:'4px'}}>
            {redirect ? 'Create an account to join the group' : 'Create your free account'}
          </div>
        </div>

        <div style={{background:C.card,borderRadius:'16px',padding:'28px',border:`1px solid ${C.border}`}}>
          <form onSubmit={handleSignup}>
            {error && <div style={{background:'#FF000022',border:'1px solid #FF000044',color:'#FF6B6B',fontSize:'13px',padding:'10px 14px',borderRadius:'8px',marginBottom:'16px'}}>{error}</div>}
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:'500',color:C.text,marginBottom:'6px'}}>Full name</label>
              <input type="text" value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="Juan dela Cruz" required
                style={{width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'11px 14px',fontSize:'14px',color:'#FFFFFF',outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:'500',color:C.text,marginBottom:'6px'}}>Email address</label>
              <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" required
                style={{width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'11px 14px',fontSize:'14px',color:'#FFFFFF',outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:'500',color:C.text,marginBottom:'6px'}}>Password</label>
              <input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="minimum 6 characters" required minLength={6}
                style={{width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'11px 14px',fontSize:'14px',color:'#FFFFFF',outline:'none',boxSizing:'border-box'}}/>
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',background:C.gold,color:C.bg,fontWeight:'700',fontSize:'14px',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer',opacity:loading?0.7:1}}>
              {loading?'Creating account...':'Create Free Account'}
            </button>
          </form>
        </div>

        <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:'10px',padding:'12px 16px',marginTop:'16px',textAlign:'center'}}>
          <p style={{fontSize:'12px',color:C.gold,margin:0}}>Free tier · Up to 10 members · No credit card required</p>
        </div>

        <p style={{textAlign:'center',fontSize:'13px',color:C.text,marginTop:'16px'}}>
          Already have an account?{' '}
          <Link href={redirect ? `/auth/login?redirect=${redirect}` : '/auth/login'} style={{color:C.gold,fontWeight:'600',textDecoration:'none'}}>Sign in</Link>
        </p>
        <p style={{textAlign:'center',marginTop:'12px'}}>
          <Link href="/" style={{color:C.muted,fontSize:'12px',textDecoration:'none'}}>← Back to CommunityFlow</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#0B1F3A'}}/>}>
      <SignupContent />
    </Suspense>
  )
}
