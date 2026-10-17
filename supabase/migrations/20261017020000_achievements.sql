-- Achievements: member milestones (badge, title, description, awarded date)
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  badge text,
  awarded_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "achievements_read_auth" ON public.achievements;
CREATE POLICY "achievements_read_auth" ON public.achievements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "achievements_manage" ON public.achievements;
CREATE POLICY "achievements_manage" ON public.achievements FOR ALL TO authenticated
  USING (public.is_leader(auth.uid())) WITH CHECK (public.is_leader(auth.uid()));
