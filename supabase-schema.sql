-- ============================================
-- BAYANIHAN APP — SUPABASE SQL SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- GROUPS
-- ============================================
CREATE TABLE groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','pro','elite')),
  contribution_amount NUMERIC(10,2) DEFAULT 500,
  due_day INTEGER DEFAULT 15 CHECK (due_day BETWEEN 1 AND 31),
  grace_days INTEGER DEFAULT 3,
  penalty_amount NUMERIC(10,2) DEFAULT 50,
  max_loan_percent INTEGER DEFAULT 80,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEMBERSHIPS
-- ============================================
CREATE TABLE memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member','treasurer','admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  UNIQUE(group_id, profile_id)
);

-- ============================================
-- CONTRIBUTIONS
-- ============================================
CREATE TABLE contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES profiles(id) NOT NULL,
  cycle TEXT NOT NULL, -- format: '2025-06'
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  late_fee NUMERIC(10,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid','pending','overdue')),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOANS
-- ============================================
CREATE TABLE loans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  borrower_id UUID REFERENCES profiles(id) NOT NULL,
  principal NUMERIC(10,2) NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL,
  term_months INTEGER NOT NULL,
  method TEXT DEFAULT 'flat' CHECK (method IN ('flat','diminishing')),
  monthly_payment NUMERIC(10,2) NOT NULL,
  total_interest NUMERIC(10,2) NOT NULL,
  balance_remaining NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','paid','rejected')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOAN PAYMENTS
-- ============================================
CREATE TABLE loan_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  principal_portion NUMERIC(10,2) NOT NULL,
  interest_portion NUMERIC(10,2) NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by UUID REFERENCES profiles(id)
);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  posted_by UUID REFERENCES profiles(id) NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE
);

-- ============================================
-- AUDIT LOG (tamper-evident)
-- ============================================
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups(id),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: view own
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Groups: members can view their groups
CREATE POLICY "groups_member_view" ON groups FOR SELECT USING (
  id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND status = 'active')
);
CREATE POLICY "groups_owner_all" ON groups FOR ALL USING (owner_id = auth.uid());

-- Memberships: members see their own group
CREATE POLICY "memberships_view" ON memberships FOR SELECT USING (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid())
);
CREATE POLICY "memberships_own" ON memberships FOR ALL USING (profile_id = auth.uid());

-- Contributions: members see own group's contributions
CREATE POLICY "contributions_group" ON contributions FOR SELECT USING (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND status = 'active')
);
CREATE POLICY "contributions_treasurer_write" ON contributions FOR INSERT WITH CHECK (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND role IN ('treasurer','admin'))
);
CREATE POLICY "contributions_treasurer_update" ON contributions FOR UPDATE USING (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND role IN ('treasurer','admin'))
);

-- Loans: group members can view
CREATE POLICY "loans_group" ON loans FOR SELECT USING (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND status = 'active')
);
CREATE POLICY "loans_write" ON loans FOR ALL USING (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND role IN ('treasurer','admin'))
);

-- Announcements: all group members can view
CREATE POLICY "announcements_view" ON announcements FOR SELECT USING (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND status = 'active')
);
CREATE POLICY "announcements_write" ON announcements FOR ALL USING (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND role IN ('treasurer','admin'))
);

-- Audit logs: treasurer/admin can view
CREATE POLICY "audit_view" ON audit_logs FOR SELECT USING (
  group_id IN (SELECT group_id FROM memberships WHERE profile_id = auth.uid() AND role IN ('treasurer','admin'))
);
