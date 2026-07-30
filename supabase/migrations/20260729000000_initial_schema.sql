-- =============================================================================
-- FinancialOS Database Schema Migration
-- Migration File: 20260729000000_initial_schema.sql
-- Description: Sets up FinancialOS PostgreSQL schema with RLS, triggers, 
--              indexes, foreign key constraints, and user synchronization.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. TABLES CREATION
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: Users (Merged Personal & Financial Information)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    occupation TEXT,
    annual_income NUMERIC(15, 2) DEFAULT 0.00,
    monthly_income NUMERIC(15, 2) DEFAULT 0.00,
    monthly_expenses NUMERIC(15, 2) DEFAULT 0.00,
    savings NUMERIC(15, 2) DEFAULT 0.00,
    emergency_fund NUMERIC(15, 2) DEFAULT 0.00,
    total_assets NUMERIC(15, 2) DEFAULT 0.00,
    total_liabilities NUMERIC(15, 2) DEFAULT 0.00,
    risk_profile TEXT DEFAULT 'moderate',
    marital_status TEXT,
    state TEXT,
    city TEXT,
    financial_health_score NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: Investments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    quantity NUMERIC(15, 4) NOT NULL DEFAULT 0,
    purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_value NUMERIC(15, 2) GENERATED ALWAYS AS (quantity * current_price) STORED,
    platform TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: Loans
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    loan_type TEXT NOT NULL,
    lender TEXT NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    outstanding_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    emi NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tenure INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: Insurance_Policies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    policy_number TEXT,
    policy_type TEXT NOT NULL,
    coverage_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    premium NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    renewal_date DATE,
    document_url TEXT,
    ai_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: Goals
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: Life_Event_Simulations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.life_event_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_result JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: Government_Schemes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.government_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_name TEXT NOT NULL,
    description TEXT,
    state TEXT,
    eligibility_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    benefit TEXT,
    official_link TEXT,
    category TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: User_Scheme_Matches
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_scheme_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES public.government_schemes(id) ON DELETE CASCADE,
    eligibility_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_scheme_matches_unique UNIQUE (user_id, scheme_id)
);

-- -----------------------------------------------------------------------------
-- Table: Market_News
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.market_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source TEXT,
    url TEXT,
    summary TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: AI_Insights
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: Notifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. INDEXES
-- =============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Investments
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON public.investments(created_at);

-- Loans
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON public.loans(created_at);

-- Insurance Policies
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON public.insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_renewal_date ON public.insurance_policies(renewal_date);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_created_at ON public.insurance_policies(created_at);

-- Goals
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON public.goals(created_at);

-- Life Event Simulations
CREATE INDEX IF NOT EXISTS idx_life_event_simulations_user_id ON public.life_event_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_life_event_simulations_created_at ON public.life_event_simulations(created_at);

-- Government Schemes & Matches
CREATE INDEX IF NOT EXISTS idx_government_schemes_category ON public.government_schemes(category);
CREATE INDEX IF NOT EXISTS idx_user_scheme_matches_user_id ON public.user_scheme_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scheme_matches_scheme_id ON public.user_scheme_matches(scheme_id);
CREATE INDEX IF NOT EXISTS idx_user_scheme_matches_matched_at ON public.user_scheme_matches(matched_at);

-- Market News
CREATE INDEX IF NOT EXISTS idx_market_news_published_at ON public.market_news(published_at);
CREATE INDEX IF NOT EXISTS idx_market_news_created_at ON public.market_news(created_at);

-- AI Insights
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON public.ai_insights(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- =============================================================================
-- 3. AUTOMATED TRIGGERS & FUNCTIONS
-- =============================================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_investments_updated_at ON public.investments;
CREATE TRIGGER trigger_update_investments_updated_at
    BEFORE UPDATE ON public.investments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_loans_updated_at ON public.loans;
CREATE TRIGGER trigger_update_loans_updated_at
    BEFORE UPDATE ON public.loans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_insurance_policies_updated_at ON public.insurance_policies;
CREATE TRIGGER trigger_update_insurance_policies_updated_at
    BEFORE UPDATE ON public.insurance_policies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_goals_updated_at ON public.goals;
CREATE TRIGGER trigger_update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_government_schemes_updated_at ON public.government_schemes;
CREATE TRIGGER trigger_update_government_schemes_updated_at
    BEFORE UPDATE ON public.government_schemes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function & Trigger: Automatic public.users entry creation on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & SUPABASE POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_event_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scheme_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS Policies: Users
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
    ON public.users FOR DELETE
    USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- RLS Policies: Investments
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own investments"
    ON public.investments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
    ON public.investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
    ON public.investments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
    ON public.investments FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: Loans
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own loans"
    ON public.loans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans"
    ON public.loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
    ON public.loans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
    ON public.loans FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: Insurance_Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own insurance policies"
    ON public.insurance_policies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insurance policies"
    ON public.insurance_policies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance policies"
    ON public.insurance_policies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insurance policies"
    ON public.insurance_policies FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: Goals
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own goals"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: Life_Event_Simulations
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own life event simulations"
    ON public.life_event_simulations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own life event simulations"
    ON public.life_event_simulations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life event simulations"
    ON public.life_event_simulations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life event simulations"
    ON public.life_event_simulations FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: Government_Schemes (Public Read, Admin Write)
-- -----------------------------------------------------------------------------
CREATE POLICY "Government schemes are readable by all authenticated users"
    ON public.government_schemes FOR SELECT
    USING (true);

-- -----------------------------------------------------------------------------
-- RLS Policies: User_Scheme_Matches
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own scheme matches"
    ON public.user_scheme_matches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheme matches"
    ON public.user_scheme_matches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheme matches"
    ON public.user_scheme_matches FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheme matches"
    ON public.user_scheme_matches FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: Market_News (Public Read, Admin Write)
-- -----------------------------------------------------------------------------
CREATE POLICY "Market news is readable by all authenticated users"
    ON public.market_news FOR SELECT
    USING (true);

-- -----------------------------------------------------------------------------
-- RLS Policies: AI_Insights
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own AI insights"
    ON public.ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI insights"
    ON public.ai_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI insights"
    ON public.ai_insights FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI insights"
    ON public.ai_insights FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: Notifications
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);
