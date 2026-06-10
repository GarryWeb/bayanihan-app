'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
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
          <div style={{fontSize: '13px', color: '#D6DCE5', marginTop: '4px'}}>Sign in to your account</div>
        </div>

        {/* Card */}
        <div style={{background: '#132D4E', borderRadius: '16px', padding: '28px', border: '1px solid #1A3A5C'}}>
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{background: '#FF000022', border: '1px solid #FF000044', color: '#FF6B6B', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px'}}>
                {error}
              </div>
            )}
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: '500', color: '#D6DCE5', marginBottom: '6px'}}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                style={{width: '100%', background: '#0B1F3A', border: '1px solid #1A3A5C', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box'}} />
            </div>
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: '500', color: '#D6DCE5', marginBottom: '6px'}}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{width: '100%', background: '#0B1F3A', border: '1px solid #1A3A5C', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box'}} />
            </div>
            <button type="submit" disabled={loading}
              style={{width: '100%', background: '#D4A017', color: '#0B1F3A', fontWeight: '700', fontSize: '14px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{textAlign: 'center', fontSize: '13px', color: '#D6DCE5', marginTop: '20px'}}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{color: '#D4A017', fontWeight: '600', textDecoration: 'none'}}>Start for free</Link>
        </p>
        <p style={{textAlign: 'center', marginTop: '16px'}}>
          <Link href="/" style={{color: '#D6DCE5', fontSize: '12px', textDecoration: 'none'}}>← Back to CommunityFlow</Link>
        </p>
      </div>
    </div>
  )
}
