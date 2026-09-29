-- ==============================================================================
-- Teenager Expense Tracker - Supabase PostgreSQL Schema
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT '₹',
    monthly_income NUMERIC(12, 2) DEFAULT 0.00 CHECK (monthly_income >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    payment_method VARCHAR(50) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_necessary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INCOME TABLE
CREATE TABLE IF NOT EXISTS public.income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    income_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_category_month_year UNIQUE (user_id, category, month, year)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses(user_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_necessary ON public.expenses(user_id, is_necessary);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON public.income(user_id, income_date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, year, month);

-- ==============================================================================
-- AUTOMATIC updated_at TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
CREATE TRIGGER set_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Note: The Express backend uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS for system operations.
-- If client direct access or Supabase Auth is ever used, the policies below ensure strict tenant isolation.
CREATE POLICY "Users can only view their own user profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can only update their own user profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can only access their own expenses"
    ON public.expenses FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own income"
    ON public.income FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id);

-- ==============================================================================
-- SAMPLE DEVELOPMENT SEED DATA (OPTIONAL)
-- (Run this only if you want test accounts in Supabase directly)
-- Password for demo user is: "Password123!" (hashed with bcrypt 12 rounds)
-- ==============================================================================
/*
INSERT INTO public.users (id, name, email, password_hash, currency, monthly_income)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Alex Rivers',
    'alex@teentracker.com',
    '$2a$12$6z37YmYg1q/B9c1W71Jq6eXlM6nC1jU0w5EeVwXvG0CqU9uWq9U0y',
    '₹',
    10000.00
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.income (user_id, source, amount, income_date, description)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Monthly Pocket Money', 7000.00, CURRENT_DATE - INTERVAL '10 days', 'Parents monthly allowance'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Freelance Tutoring', 3000.00, CURRENT_DATE - INTERVAL '5 days', 'Math tutoring junior student');

INSERT INTO public.budgets (user_id, category, amount, month, year)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Food', 3000.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Entertainment', 1500.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Transport', 1200.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Subscriptions', 600.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);

INSERT INTO public.expenses (user_id, title, amount, category, payment_method, expense_date, is_necessary, description)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'School Cafeteria Lunch', 250.00, 'Food', 'UPI', CURRENT_DATE - INTERVAL '1 day', true, 'Lunch with friends'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bus Pass Monthly', 450.00, 'Transport', 'Cash', CURRENT_DATE - INTERVAL '2 days', true, 'Student bus transit pass'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cinema Tickets', 650.00, 'Entertainment', 'Debit Card', CURRENT_DATE - INTERVAL '3 days', false, 'Weekend movie'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Coding Book', 800.00, 'Education', 'UPI', CURRENT_DATE - INTERVAL '4 days', true, 'Web development guide'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Music Streaming', 199.00, 'Subscriptions', 'Debit Card', CURRENT_DATE - INTERVAL '5 days', false, 'Spotify Student');
*/
