
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

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================== ANNOUNCEMENTS ===========================
CREATE TABLE public.announcements (
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
CREATE POLICY "announcements_read_public" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "announcements_write_leaders" ON public.announcements FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));
CREATE TRIGGER announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================== MEMBERS ===========================
CREATE TABLE public.members (
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
CREATE POLICY "members_read_auth" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "members_update_own" ON public.members FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_manage_leaders" ON public.members FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));
CREATE TRIGGER members_updated BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================== EVENTS ===========================
CREATE TABLE public.events (
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
CREATE POLICY "events_read_auth" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_manage_leaders" ON public.events FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));
CREATE TRIGGER events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================== ATTENDANCE ===========================
CREATE TABLE public.attendance (
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
CREATE POLICY "attendance_read_auth" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendance_manage_leaders" ON public.attendance FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

-- =========================== FINANCE ===========================
CREATE TABLE public.finance_transactions (
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
CREATE POLICY "finance_read_auth" ON public.finance_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "finance_manage" ON public.finance_transactions FOR ALL TO authenticated
  USING (public.is_finance_manager(auth.uid())) WITH CHECK (public.is_finance_manager(auth.uid()));

-- =========================== SUGGESTIONS ===========================
CREATE TABLE public.suggestions (
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
CREATE POLICY "suggestions_insert_any" ON public.suggestions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "suggestions_insert_anon" ON public.suggestions FOR INSERT TO anon WITH CHECK (is_anonymous = true);
CREATE POLICY "suggestions_read_own" ON public.suggestions FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());
CREATE POLICY "suggestions_manage_leaders" ON public.suggestions FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));

-- =========================== WELCOME CONTENT ===========================
CREATE TABLE public.welcome_content (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT ON public.welcome_content TO anon;
GRANT SELECT, INSERT, UPDATE ON public.welcome_content TO authenticated;
GRANT ALL ON public.welcome_content TO service_role;
ALTER TABLE public.welcome_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "welcome_read_public" ON public.welcome_content FOR SELECT USING (true);
CREATE POLICY "welcome_write_superadmin" ON public.welcome_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin')) WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
INSERT INTO public.welcome_content (id, content) VALUES (1, '{}'::jsonb) ON CONFLICT DO NOTHING;

-- =========================== DASHBOARD SETTINGS ===========================
CREATE TABLE public.dashboard_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  visible_widgets jsonb NOT NULL DEFAULT '["announcements","members","events","attendance","finance"]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_settings TO authenticated;
GRANT ALL ON public.dashboard_settings TO service_role;
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dashboard_settings_own" ON public.dashboard_settings FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
