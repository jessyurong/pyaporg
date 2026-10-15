-- ============================================================================
-- PYAP Barangay Samac — FULL schema for a fresh Supabase project
--
-- HOW TO USE: open your Supabase project → SQL Editor → New query, paste this
-- whole file and press Run. It is safe to re-run (guards are included).
--
-- This file replaces the previous partial migrations and includes the new
-- account-request / approval workflow tables.
-- ============================================================================

-- =========================== HELPERS ===========================

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================== USER ROLES ===========================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('superadmin','president','secretary','treasurer','organizer','member')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper: does the user have this exact role? (SECURITY DEFINER avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: allow-list of leadership roles
CREATE OR REPLACE FUNCTION public.is_leader(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('superadmin','president','secretary','organizer')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_finance_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('superadmin','president','treasurer')
  )
$$;

DROP POLICY IF EXISTS "user_roles_read_own" ON public.user_roles;
CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_roles_read_leaders" ON public.user_roles;
CREATE POLICY "user_roles_read_leaders" ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_leader(auth.uid()));
DROP POLICY IF EXISTS "user_roles_manage_leaders" ON public.user_roles;
CREATE POLICY "user_roles_manage_leaders" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

-- =========================== PROFILES ===========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  age text,
  sex text,
  address text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_read_leaders" ON public.profiles;
CREATE POLICY "profiles_read_leaders" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_leader(auth.uid()));
DROP POLICY IF EXISTS "profiles_update_leaders" ON public.profiles;
CREATE POLICY "profiles_update_leaders" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================== ACCOUNT REQUESTS ===========================
CREATE TABLE IF NOT EXISTS public.account_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  age text,
  sex text,
  address text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','accepted','rejected')),
  notified_roles text[] NOT NULL DEFAULT ARRAY['superadmin','president','secretary'],
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_requests TO authenticated;
GRANT ALL ON public.account_requests TO service_role;
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "account_requests_read_own" ON public.account_requests;
CREATE POLICY "account_requests_read_own" ON public.account_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "account_requests_read_leaders" ON public.account_requests;
CREATE POLICY "account_requests_read_leaders" ON public.account_requests FOR SELECT TO authenticated
  USING (public.is_leader(auth.uid()));
DROP POLICY IF EXISTS "account_requests_update_leaders" ON public.account_requests;
CREATE POLICY "account_requests_update_leaders" ON public.account_requests FOR UPDATE TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

-- =========================== ANNOUNCEMENTS ===========================
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal','important','urgent')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_read_public" ON public.announcements;
CREATE POLICY "announcements_read_public" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "announcements_write_leaders" ON public.announcements;
CREATE POLICY "announcements_write_leaders" ON public.announcements FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

DROP TRIGGER IF EXISTS announcements_updated ON public.announcements;
CREATE TRIGGER announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================== MEMBERS ===========================
CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  address text,
  birthday date,
  position text,
  notes text,
  avatar_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_read_auth" ON public.members;
CREATE POLICY "members_read_auth" ON public.members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "members_update_own" ON public.members;
CREATE POLICY "members_update_own" ON public.members FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "members_manage_leaders" ON public.members;
CREATE POLICY "members_manage_leaders" ON public.members FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

DROP TRIGGER IF EXISTS members_updated ON public.members;
CREATE TRIGGER members_updated BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================== EVENTS ===========================
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  location text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_read_auth" ON public.events;
CREATE POLICY "events_read_auth" ON public.events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "events_manage_leaders" ON public.events;
CREATE POLICY "events_manage_leaders" ON public.events FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

DROP TRIGGER IF EXISTS events_updated ON public.events;
CREATE TRIGGER events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================== ATTENDANCE ===========================
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','excused','late')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, member_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_read_auth" ON public.attendance;
CREATE POLICY "attendance_read_auth" ON public.attendance FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "attendance_manage_leaders" ON public.attendance;
CREATE POLICY "attendance_manage_leaders" ON public.attendance FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

-- =========================== FINANCE ===========================
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income','expense')),
  amount numeric(12,2) NOT NULL,
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_transactions TO authenticated;
GRANT ALL ON public.finance_transactions TO service_role;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "finance_read_auth" ON public.finance_transactions;
CREATE POLICY "finance_read_auth" ON public.finance_transactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "finance_manage" ON public.finance_transactions;
CREATE POLICY "finance_manage" ON public.finance_transactions FOR ALL TO authenticated
  USING (public.is_finance_manager(auth.uid())) WITH CHECK (public.is_finance_manager(auth.uid()));

-- =========================== SUGGESTIONS ===========================
CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_name text,
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suggestions TO authenticated;
GRANT INSERT ON public.suggestions TO anon;
GRANT ALL ON public.suggestions TO service_role;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suggestions_insert_any" ON public.suggestions;
CREATE POLICY "suggestions_insert_any" ON public.suggestions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "suggestions_insert_anon" ON public.suggestions;
CREATE POLICY "suggestions_insert_anon" ON public.suggestions FOR INSERT TO anon WITH CHECK (is_anonymous = true);
DROP POLICY IF EXISTS "suggestions_read_own" ON public.suggestions;
CREATE POLICY "suggestions_read_own" ON public.suggestions FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());
DROP POLICY IF EXISTS "suggestions_manage_leaders" ON public.suggestions;
CREATE POLICY "suggestions_manage_leaders" ON public.suggestions FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

-- =========================== WELCOME CONTENT ===========================
CREATE TABLE IF NOT EXISTS public.welcome_content (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT ON public.welcome_content TO anon;
GRANT SELECT, INSERT, UPDATE ON public.welcome_content TO authenticated;
GRANT ALL ON public.welcome_content TO service_role;
ALTER TABLE public.welcome_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "welcome_read_public" ON public.welcome_content;
CREATE POLICY "welcome_read_public" ON public.welcome_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "welcome_write_superadmin" ON public.welcome_content;
CREATE POLICY "welcome_write_superadmin" ON public.welcome_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin')) WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
INSERT INTO public.welcome_content (id, content) VALUES (1, '{}'::jsonb) ON CONFLICT DO NOTHING;

-- =========================== DASHBOARD SETTINGS ===========================
CREATE TABLE IF NOT EXISTS public.dashboard_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  visible_widgets jsonb NOT NULL DEFAULT '["announcements","members","events","attendance","finance"]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_settings TO authenticated;
GRANT ALL ON public.dashboard_settings TO service_role;
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_settings_own" ON public.dashboard_settings;
CREATE POLICY "dashboard_settings_own" ON public.dashboard_settings FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- NEW USER BOOTSTRAP
-- When someone signs up (Request Account Access), this trigger:
--   1. Creates their profile row (status = pending, or active for the FIRST user)
--   2. Assigns the member role (or superadmin for the FIRST user)
--   3. Creates an account_requests row so leaders can review it
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _is_first boolean;
  _name text;
  _age text;
  _sex text;
  _address text;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'superadmin'
  ) INTO _is_first;

  _name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'member'), '@', 1));
  _age := NEW.raw_user_meta_data->>'age';
  _sex := NEW.raw_user_meta_data->>'sex';
  _address := NEW.raw_user_meta_data->>'address';

  INSERT INTO public.profiles (user_id, full_name, email, age, sex, address, status)
  VALUES (NEW.id, _name, NEW.email, _age, _sex, _address, CASE WHEN _is_first THEN 'active' ELSE 'pending' END)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN _is_first THEN 'superadmin' ELSE 'member' END)
  ON CONFLICT (user_id) DO NOTHING;

  IF _age IS NOT NULL AND _sex IS NOT NULL AND _address IS NOT NULL THEN
    INSERT INTO public.account_requests (user_id, name, email, age, sex, address, status, notified_roles)
    VALUES (
      NEW.id, _name, NEW.email, _age, _sex, _address,
      CASE WHEN _is_first THEN 'accepted' ELSE 'new' END,
      ARRAY['superadmin','president','secretary']
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
