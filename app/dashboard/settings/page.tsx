'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

const PLANS = [
  { key: 'free', name: 'Free', price: '₱0', members: '10 members', color: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
  { key: 'starter', name: 'Starter', price: '₱200/mo', members: '30 members', color: 'border-blue-200', badge: 'bg-blue-50 text-blue-700' },
  { key: 'pro', name: 'Pro', price: '₱1,299/mo', members: '80 members', color: 'border-purple-200', badge: 'bg-purple-50 text-purple-700' },
  { key: 'elite', name: 'Elite', price: '₱2,999/mo', members: 'Unlimited', color: 'border-[#1D9E75]', badge: 'bg-[#E1F5EE] text-[#085041]' },
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

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Group Settings</h1>

      {/* Group config */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Grupo configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Pangalan ng grupo</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Monthly contribution (₱)</label>
            <input type="number" value={form.contribution_amount} onChange={e => set('contribution_amount', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due day (day of month)</label>
            <input type="number" value={form.due_day} min={1} max={31} onChange={e => set('due_day', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Grace period (days)</label>
            <input type="number" value={form.grace_days} min={0} max={30} onChange={e => set('grace_days', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Late penalty (₱)</label>
            <input type="number" value={form.penalty_amount} min={0} onChange={e => set('penalty_amount', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max loan (% of share balance)</label>
            <select value={form.max_loan_percent} onChange={e => set('max_loan_percent', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
              <option value={50}>50%</option><option value={80}>80%</option><option value={100}>100%</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleSave} disabled={saving}
            className="bg-[#1D9E75] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#085041] disabled:opacity-60">
            {saving ? 'Nagse-save...' : 'I-save ang settings'}
          </button>
          {saved && <span className="text-sm text-[#1D9E75] font-medium">Na-save na! ✓</span>}
        </div>
      </div>

      {/* Plan upgrade */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Plano at pricing</h2>
        <p className="text-xs text-gray-500 mb-4">Kasalukuyang plan: <strong>{group?.plan}</strong></p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLANS.map(p => (
            <div key={p.key} className={`border-2 rounded-xl p-4 ${group?.plan === p.key ? p.color : 'border-gray-100'}`}>
              <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2 ${p.badge}`}>{p.name}</div>
              <div className="text-base font-semibold text-gray-900">{p.price}</div>
              <div className="text-xs text-gray-500 mt-0.5 mb-3">{p.members}</div>
              {group?.plan === p.key
                ? <div className="text-xs font-medium text-[#1D9E75]">✓ Kasalukuyang plan</div>
                : <button className="text-xs text-[#1D9E75] font-medium hover:underline">Pumili →</button>
              }
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-[#E1F5EE] rounded-xl text-xs text-[#085041]">
          💡 Ang payment para sa upgrade ay darating sa susunod na update. Sa ngayon, makipag-ugnayan sa admin para sa manual upgrade.
        </div>
      </div>
    </div>
  )
}
