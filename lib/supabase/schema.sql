-- Golden Trident Financial Readiness System Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  messenger_link TEXT,
  preferred_contact TEXT,
  consent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'assessment',
  readiness_score NUMERIC,
  buying_intent TEXT
);

-- 2. Assessment responses table
CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Personal Information (Step 1)
  age INTEGER,
  gender TEXT,
  marital_status TEXT,
  num_children INTEGER,
  occupation TEXT,
  location TEXT,
  
  -- Family Information (Step 2)
  dependents INTEGER,
  spouse_working BOOLEAN,
  
  -- Income (Step 3)
  monthly_income NUMERIC,
  additional_income NUMERIC,
  
  -- Expenses (Step 4)
  monthly_expenses NUMERIC,
  housing_cost NUMERIC,
  
  -- Emergency Fund (Step 5)
  emergency_fund NUMERIC,
  savings NUMERIC,
  existing_investments BOOLEAN,
  
  -- Existing Insurance (Step 6)
  has_life_insurance BOOLEAN,
  life_insurance_coverage NUMERIC,
  has_health_insurance BOOLEAN,
  has_critical_illness BOOLEAN,
  has_hmo BOOLEAN,
  has_accident_insurance BOOLEAN,
  
  -- Outstanding Debts (Step 7)
  home_loan NUMERIC,
  car_loan NUMERIC,
  personal_loan NUMERIC,
  credit_card_debt NUMERIC,
  other_debt NUMERIC,
  
  -- Financial Goals (Step 8)
  goals TEXT[], -- Array of selected goals
  
  -- Calculated fields
  total_debt NUMERIC,
  debt_to_income_ratio NUMERIC,
  emergency_fund_months NUMERIC,
  readiness_score NUMERIC,
  completed BOOLEAN DEFAULT false
);

-- 3. Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  preferred_contact_method TEXT,
  status TEXT DEFAULT 'requested',
  notes TEXT,
  confirmed_at TIMESTAMPTZ
);

-- 4. Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- 5. Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'private'
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can manage leads" ON public.leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.active = true
    )
  );

CREATE POLICY "Admins can manage assessment responses" ON public.assessment_responses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.active = true
    )
  );

CREATE POLICY "Admins can manage appointments" ON public.appointments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.active = true
    )
  );

CREATE POLICY "Admins can manage notes" ON public.notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.active = true
    )
  );

CREATE POLICY "Admins can read admin_users" ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.active = true
    )
  );

-- Public insert policies for leads and assessments (anonymous users can submit)
CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create assessment responses" ON public.assessment_responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create appointments" ON public.appointments
  FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_lead_id ON public.assessment_responses(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON public.appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON public.notes(lead_id);

-- After creating the tables, you need to:
-- 1. Create an admin user in Supabase Auth (via dashboard or sign-up)
-- 2. Get the user_id from auth.users table
-- 3. Insert into admin_users table:
--    INSERT INTO public.admin_users (user_id, email, full_name)
--    VALUES ('<your-auth-user-id>', 'admin@example.com', 'Admin Name');
