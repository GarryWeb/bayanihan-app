export type Plan = 'free' | 'starter' | 'pro' | 'elite'
export type MemberRole = 'member' | 'treasurer' | 'admin'
export type ContributionStatus = 'paid' | 'pending' | 'overdue'
export type LoanStatus = 'pending' | 'active' | 'paid' | 'rejected'

export interface Group {
  id: string
  name: string
  slug: string
  plan: Plan
  contribution_amount: number
  due_day: number
  grace_days: number
  penalty_amount: number
  max_loan_percent: number
  owner_id: string
  created_at: string
  member_count?: number
  total_fund?: number
}

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  created_at: string
}

export interface Membership {
  id: string
  group_id: string
  profile_id: string
  role: MemberRole
  joined_at: string
  status: 'active' | 'inactive'
  profile?: Profile
}

export interface Contribution {
  id: string
  group_id: string
  member_id: string
  cycle: string
  amount_due: number
  amount_paid: number
  late_fee: number
  paid_at?: string
  due_date: string
  status: ContributionStatus
  notes?: string
  profile?: Profile
}

export interface Loan {
  id: string
  group_id: string
  borrower_id: string
  principal: number
  interest_rate: number
  term_months: number
  method: 'flat' | 'diminishing'
  monthly_payment: number
  total_interest: number
  balance_remaining: number
  status: LoanStatus
  approved_by?: string
  approved_at?: string
  disbursed_at?: string
  created_at: string
  profile?: Profile
}

export interface Announcement {
  id: string
  group_id: string
  title: string
  body: string
  posted_by: string
  posted_at: string
  is_pinned: boolean
  profile?: Profile
}

export interface DashboardStats {
  total_members: number
  total_fund: number
  collected_this_cycle: number
  pending_this_cycle: number
  overdue_count: number
  active_loans: number
  total_loans_out: number
}
