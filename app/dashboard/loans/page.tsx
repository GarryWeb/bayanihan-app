'use client'
import { useEffect, useState } from 'react'
import { getLoans, getGroupMembers, calcLoan, supabase } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

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
    if (!form.principal || !form.interest_rate || !form.term_months) return
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
      setMsg({ type: 'success', text: 'Loan request na-submit! ✓' })
      setForm({ borrower_id: '', principal: '', interest_rate: '3', term_months: '6', method: 'flat' })
      setCalc(null); loadData()
    } catch (e: any) { setMsg({ type: 'error', text: e.message }) }
    setSaving(false)
  }

  async function handleApprove(loanId: string) {
    await supabase.from('loans').update({ status: 'active', approved_by: user?.id, approved_at: new Date().toISOString() }).eq('id', loanId)
    loadData()
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700', active: 'bg-[#E1F5EE] text-[#085041]',
    paid: 'bg-gray-100 text-gray-500', rejected: 'bg-red-50 text-red-600',
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full" /></div>

  if (!isPro) return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-lg font-semibold mb-2">Pro feature</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">Ang loan management at calculator ay available sa Pro plan (₱1,299/buwan) at Elite plan.</p>
      <a href="/dashboard/settings" className="bg-[#1D9E75] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#085041]">Mag-upgrade sa Pro →</a>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Loans</h1>
        <button onClick={() => setShowNew(!showNew)} className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#085041]">+ Bagong loan</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
        {(['loans', 'calculator'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            {t === 'loans' ? '📋 Loans' : '🧮 Calculator'}
          </button>
        ))}
      </div>

      {tab === 'calculator' && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Loan Calculator</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Principal (₱)</label>
              <input type="number" value={form.principal} onChange={e => { setForm(f => ({ ...f, principal: e.target.value })); setCalc(null) }}
                placeholder="10000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monthly interest (%)</label>
              <input type="number" value={form.interest_rate} onChange={e => { setForm(f => ({ ...f, interest_rate: e.target.value })); setCalc(null) }}
                step="0.5" min="0.5" max="20" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Term (months)</label>
              <input type="number" value={form.term_months} onChange={e => { setForm(f => ({ ...f, term_months: e.target.value })); setCalc(null) }}
                min="1" max="24" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
              <select value={form.method} onChange={e => { setForm(f => ({ ...f, method: e.target.value })); setCalc(null) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
                <option value="flat">Flat rate</option>
                <option value="diminishing">Diminishing balance</option>
              </select>
            </div>
          </div>
          <button onClick={handleCalc} className="bg-[#1D9E75] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#085041] mb-4">I-compute</button>
          {calc && (
            <div className="bg-[#E1F5EE] rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><div className="text-xs text-[#085041] mb-1">Monthly payment</div><div className="text-lg font-semibold text-[#085041]">₱{calc.monthlyPayment.toLocaleString()}</div></div>
                <div><div className="text-xs text-[#085041] mb-1">Total interest</div><div className="text-lg font-semibold text-[#085041]">₱{calc.totalInterest.toLocaleString()}</div></div>
                <div><div className="text-xs text-[#085041] mb-1">Total repayment</div><div className="text-lg font-semibold text-[#085041]">₱{(Number(form.principal) + calc.totalInterest).toLocaleString()}</div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'loans' && (
        <>
          {/* New loan form */}
          {showNew && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold mb-3">Bagong loan request</h3>
              {msg.text && <div className={`text-sm px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-[#E1F5EE] text-[#085041]'}`}>{msg.text}</div>}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Borrower</label>
                  <select value={form.borrower_id} onChange={e => setForm(f => ({ ...f, borrower_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
                    <option value="">Piliin ang miyembro</option>
                    {members.map(m => <option key={m.profile_id} value={m.profile_id}>{m.profile?.full_name}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Principal (₱)</label>
                  <input type="number" value={form.principal} onChange={e => setForm(f => ({ ...f, principal: e.target.value }))} placeholder="10000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Rate (%) / month</label>
                  <input type="number" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} step="0.5" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Term (months)</label>
                  <input type="number" value={form.term_months} onChange={e => setForm(f => ({ ...f, term_months: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
                  <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
                    <option value="flat">Flat rate</option><option value="diminishing">Diminishing</option>
                  </select></div>
              </div>
              <button onClick={handleCreate} disabled={saving || !form.borrower_id || !form.principal}
                className="bg-[#1D9E75] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#085041] disabled:opacity-60">
                {saving ? 'Nagse-save...' : 'Submit loan request'}
              </button>
            </div>
          )}

          {/* Loans list */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 text-xs font-medium text-gray-400 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span>Miyembro</span><span>Principal</span><span>Monthly</span><span>Balance</span><span>Status</span>
            </div>
            {loans.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2">🏦</div><p className="text-sm">Walang loans pa</p></div>
            ) : loans.map(l => (
              <div key={l.id} className="grid grid-cols-5 items-center px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="text-sm font-medium text-gray-900 truncate">{l.profile?.full_name}</div>
                <div className="text-sm text-gray-700">₱{Number(l.principal).toLocaleString()}</div>
                <div className="text-sm text-gray-700">₱{Number(l.monthly_payment).toLocaleString()}</div>
                <div className="text-sm text-gray-700">₱{Number(l.balance_remaining).toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[l.status]}`}>{l.status}</span>
                  {l.status === 'pending' && <button onClick={() => handleApprove(l.id)} className="text-xs text-[#1D9E75] hover:underline">Approve</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
