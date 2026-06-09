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
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1D9E75] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          <h1 className="text-xl font-semibold">Gumawa ng libreng account</h1>
          <p className="text-sm text-gray-500 mt-1">Simulan ang inyong bayanihan platform</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buong pangalan</label>
              <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                placeholder="Juan dela Cruz" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="juan@example.com" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="minimum 6 characters" required minLength={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1D9E75] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#085041] transition-colors disabled:opacity-60">
              {loading ? 'Gumagawa ng account...' : 'Gumawa ng libreng account'}
            </button>
          </form>
        </div>
        <div className="bg-[#E1F5EE] rounded-xl p-3 mt-4 text-center">
          <p className="text-xs text-[#085041]">✓ Free tier · 10 members · Walang credit card kailangan</p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          May account na?{' '}
          <Link href="/auth/login" className="text-[#1D9E75] font-medium hover:underline">Mag-login</Link>
        </p>
      </div>
    </div>
  )
}
