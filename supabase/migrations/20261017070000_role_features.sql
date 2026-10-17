-- ============================================================================
-- ROLE FEATURE ACCESS
-- Lets the superadmin grant extra app screens (features) to each role.
-- The app keeps its built-in default features per role; this table only
-- stores the ADDITIONS (e.g. give "member" access to Finance or Attendance).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.role_features (
  role text PRIMARY KEY,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_features TO authenticated;
GRANT ALL ON public.role_features TO service_role;
ALTER TABLE public.role_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "role_features_read_auth" ON public.role_features;
CREATE POLICY "role_features_read_auth" ON public.role_features FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "role_features_manage_superadmin" ON public.role_features;
CREATE POLICY "role_features_manage_superadmin" ON public.role_features FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'));

DROP TRIGGER IF EXISTS role_features_updated ON public.role_features;
CREATE TRIGGER role_features_updated BEFORE UPDATE ON public.role_features
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
