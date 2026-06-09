import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getMyGroups(userId: string) {
  const { data } = await supabase
    .from('memberships')
    .select('group_id, role, groups(*)')
    .eq('profile_id', userId)
    .eq('status', 'active')
  return data || []
}

export async function createGroup(name: string, ownerId: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36)
  const { data, error } = await supabase
    .from('groups').insert({ name, slug, owner_id: ownerId }).select().single()
  if (error) throw error
  await supabase.from('memberships').insert({ group_id: data.id, profile_id: ownerId, role: 'admin' })
  return data
}

export async function getGroupMembers(groupId: string) {
  const { data } = await supabase
    .from('memberships')
    .select('*, profile:profiles(*)')
    .eq('group_id', groupId).eq('status', 'active')
    .order('joined_at', { ascending: true })
  return data || []
}

export async function addMemberByEmail(groupId: string, email: string, role = 'member') {
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single()
  if (!profile) throw new Error('Hindi nahanap ang user. Kailangan muna siyang mag-sign up sa Bayanihan.')
  const { error } = await supabase.from('memberships').insert({ group_id: groupId, profile_id: profile.id, role })
  if (error) throw new Error('Miyembro na siya ng grupong ito.')
  return true
}

export async function getContributions(groupId: string, cycle?: string) {
  let q = supabase.from('contributions')
    .select('*, profile:profiles(full_name, email)')
    .eq('group_id', groupId).order('created_at', { ascending: false })
  if (cycle) q = q.eq('cycle', cycle)
  const { data } = await q
  return data || []
}

export async function recordContribution(payload: {
  group_id: string, member_id: string, cycle: string,
  amount_due: number, amount_paid: number, late_fee: number,
  due_date: string, status: string, recorded_by: string, notes?: string
}) {
  const { data, error } = await supabase.from('contributions')
    .upsert({ ...payload, paid_at: payload.status === 'paid' ? new Date().toISOString() : null },
      { onConflict: 'group_id,member_id,cycle' })
    .select().single()
  if (error) throw error
  return data
}

export async function getDashboardStats(groupId: string) {
  const currentCycle = new Date().toISOString().slice(0, 7)
  const [members, contributions, loans, allContribs] = await Promise.all([
    supabase.from('memberships').select('id', { count: 'exact' }).eq('group_id', groupId).eq('status', 'active'),
    supabase.from('contributions').select('*').eq('group_id', groupId).eq('cycle', currentCycle),
    supabase.from('loans').select('*').eq('group_id', groupId).eq('status', 'active'),
    supabase.from('contributions').select('amount_paid').eq('group_id', groupId).eq('status', 'paid'),
  ])
  const c = contributions.data || []
  const activeLoans = loans.data || []
  return {
    total_members: members.count || 0,
    total_fund: (allContribs.data || []).reduce((s: number, x: any) => s + Number(x.amount_paid), 0),
    collected_this_cycle: c.filter((x: any) => x.status === 'paid').reduce((s: number, x: any) => s + Number(x.amount_paid), 0),
    pending_this_cycle: c.filter((x: any) => x.status === 'pending').reduce((s: number, x: any) => s + Number(x.amount_due), 0),
    overdue_count: c.filter((x: any) => x.status === 'overdue').length,
    active_loans: activeLoans.length,
    total_loans_out: activeLoans.reduce((s: number, x: any) => s + Number(x.balance_remaining), 0),
    current_cycle: currentCycle,
  }
}

export async function getAnnouncements(groupId: string) {
  const { data } = await supabase.from('announcements')
    .select('*, profile:profiles(full_name)').eq('group_id', groupId)
    .order('is_pinned', { ascending: false }).order('posted_at', { ascending: false }).limit(10)
  return data || []
}

export async function getLoans(groupId: string) {
  const { data } = await supabase.from('loans')
    .select('*, profile:profiles(full_name, email)').eq('group_id', groupId)
    .order('created_at', { ascending: false })
  return data || []
}

export function calcLoan(principal: number, rate: number, term: number, method: 'flat' | 'diminishing') {
  const r = rate / 100
  let monthlyPayment: number, totalInterest: number
  if (method === 'flat') {
    totalInterest = principal * r * term
    monthlyPayment = (principal + totalInterest) / term
  } else {
    monthlyPayment = principal * (r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1)
    totalInterest = (monthlyPayment * term) - principal
  }
  return { monthlyPayment: Math.round(monthlyPayment * 100) / 100, totalInterest: Math.round(totalInterest * 100) / 100 }
}
