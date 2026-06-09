'use client'
import { useEffect, useState } from 'react'
import { getContributions, getGroupMembers, recordContribution } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

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

  useEffect(() => {
    if (!group) return
    loadData()
  }, [group, cycle])

  async function loadData() {
    setLoading(true)
    const [c, m] = await Promise.all([getContributions(group.id, cycle), getGroupMembers(group.id)])
    setContributions(c)
    setMembers(m)
    setLoading(false)
  }

  async function handleRecord() {
    if (!form.member_id) return
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      const dueDate = `${cycle}-${String(group.due_day || 15).padStart(2, '0')}`
      await recordContribution({
        group_id: group.id,
        member_id: form.member_id,
        cycle,
        amount_due: group.contribution_amount || 500,
        amount_paid: Number(form.amount_paid) || group.contribution_amount || 500,
        late_fee: Number(form.late_fee) || 0,
        due_date: dueDate,
        status: form.status,
        recorded_by: user?.id,
        notes: form.notes,
      })
      setMsg({ type: 'success', text: 'Na-record na! ✓' })
      setForm({ member_id: '', amount_paid: '', late_fee: '0', status: 'paid', notes: '' })
      loadData()
    } catch (e: any) { setMsg({ type: 'error', text: e.message }) }
    setSaving(false)
  }

  const statusColors: Record<string, string> = {
    paid: 'bg-[#E1F5EE] text-[#085041]',
    pending: 'bg-yellow-50 text-yellow-700',
    overdue: 'bg-red-50 text-red-600',
  }
  const statusLabel: Record<string, string> = { paid: '✓ Bayad', pending: '⏳ Pending', overdue: '⚠️ Overdue' }

  const paid = contributions.filter(c => c.status === 'paid')
  const pending = contributions.filter(c => c.status !== 'paid')
  const totalCollected = paid.reduce((s, c) => s + Number(c.amount_paid), 0)

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Contributions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{paid.length} paid · {pending.length} pending/overdue</p>
        </div>
        <button onClick={() => setShowRecord(!showRecord)}
          className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#085041]">
          + I-record
        </button>
      </div>

      {/* Cycle selector */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-gray-500">Cycle:</label>
        <input type="month" value={cycle} onChange={e => setCycle(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
        <span className="text-sm text-[#1D9E75] font-medium">₱{totalCollected.toLocaleString()} nakolekta</span>
      </div>

      {/* Record form */}
      {showRecord && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">I-record ang payment</h3>
          {msg.text && (
            <div className={`text-sm px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-[#E1F5EE] text-[#085041]'}`}>
              {msg.text}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Miyembro</label>
              <select value={form.member_id} onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
                <option value="">Piliin ang miyembro</option>
                {members.map(m => <option key={m.profile_id} value={m.profile_id}>{m.profile?.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount paid (₱)</label>
              <input type="number" value={form.amount_paid}
                onChange={e => setForm(f => ({ ...f, amount_paid: e.target.value }))}
                placeholder={String(group.contribution_amount || 500)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Late fee (₱)</label>
              <input type="number" value={form.late_fee} onChange={e => setForm(f => ({ ...f, late_fee: e.target.value }))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="GCash, cash, etc."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
          </div>
          <button onClick={handleRecord} disabled={saving || !form.member_id}
            className="bg-[#1D9E75] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#085041] disabled:opacity-60">
            {saving ? 'Nagse-save...' : 'I-save ang payment'}
          </button>
        </div>
      )}

      {/* Contributions table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 text-xs font-medium text-gray-400 px-4 py-2.5 border-b border-gray-50 bg-gray-50">
          <span>Miyembro</span><span>Amount</span><span>Date</span><span>Status</span>
        </div>
        {contributions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">Walang contribution records para sa cycle na ito</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {contributions.map(c => (
              <div key={c.id} className="grid grid-cols-4 items-center px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate">{c.profile?.full_name}</div>
                  {c.late_fee > 0 && <div className="text-xs text-red-500">+₱{c.late_fee} late fee</div>}
                </div>
                <div className="text-sm text-gray-900">₱{Number(c.amount_paid).toLocaleString()}</div>
                <div className="text-xs text-gray-400">{c.paid_at ? new Date(c.paid_at).toLocaleDateString('tl-PH') : '—'}</div>
                <div><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>{statusLabel[c.status]}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
