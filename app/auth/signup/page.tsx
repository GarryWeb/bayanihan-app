'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
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
    else router.push('/dashboard')
  }

  return (
    <div style={{minHeight: '100vh', background: '#0B1F3A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', sans-serif"}}>
      <div style={{width: '100%', maxWidth: '400px'}}>
        {/* Logo */}
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <div style={{width: '48px', height: '48px', background: '#D4A017', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#0B1F3A', fontSize: '20px', margin: '0 auto 12px'}}>C</div>
          <div style={{fontWeight: '700', fontSize: '20px', color: '#FFFFFF'}}>CommunityFlow</div>
          <div style={{fontSize: '13px', color: '#D6DCE5', marginTop: '4px'}}>Create your free account</div>
        </div>

        {/* Card */}
        <div style={{background: '#132D4E', borderRadius: '16px', padding: '28px', border: '1px solid #1A3A5C'}}>
          <form onSubmit={handleSignup}>
            {error && (
              <div style={{background: '#FF000022', border: '1px solid #FF000044', color: '#FF6B6B', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px'}}>
                {error}
              </div>
            )}
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: '500', color: '#D6DCE5', marginBottom: '6px'}}>Full name</label>
              <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Juan dela Cruz" required
                style={{width: '100%', background: '#0B1F3A', border: '1px solid #1A3A5C', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box'}} />
            </div>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: '500', color: '#D6DCE5', marginBottom: '6px'}}>Email address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required
                style={{width: '100%', background: '#0B1F3A', border: '1px solid #1A3A5C', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box'}} />
            </div>
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: '500', color: '#D6DCE5', marginBottom: '6px'}}>Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="minimum 6 characters" required minLength={6}
                style={{width: '100%', background: '#0B1F3A', border: '1px solid #1A3A5C', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box'}} />
            </div>
            <button type="submit" disabled={loading}
              style={{width: '100%', background: '#D4A017', color: '#0B1F3A', fontWeight: '700', fontSize: '14px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1}}>
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>
        </div>

        {/* Free tier note */}
        <div style={{background: '#132D4E', border: '1px solid #D4A01744', borderRadius: '10px', padding: '12px 16px', marginTop: '16px', textAlign: 'center'}}>
          <p style={{fontSize: '12px', color: '#D4A017', margin: 0}}>Free tier · Up to 10 members · No credit card required</p>
        </div>

        <p style={{textAlign: 'center', fontSize: '13px', color: '#D6DCE5', marginTop: '16px'}}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{color: '#D4A017', fontWeight: '600', textDecoration: 'none'}}>Sign in</Link>
        </p>
        <p style={{textAlign: 'center', marginTop: '12px'}}>
          <Link href="/" style={{color: '#D6DCE5', fontSize: '12px', textDecoration: 'none'}}>← Back to CommunityFlow</Link>
        </p>
      </div>
    </div>
  )
}
