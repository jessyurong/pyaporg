-- Snapshots: photo albums shown on the dashboard (upload: superadmin + president only)
-- =========================== HELPERS ===========================
CREATE OR REPLACE FUNCTION public.is_snapshot_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('superadmin','president')
  )
$$;

-- =========================== SNAPSHOTS TABLE ===========================
CREATE TABLE IF NOT EXISTS public.snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  album text,
  image_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.snapshots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.snapshots TO authenticated;
GRANT ALL ON public.snapshots TO service_role;
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "snapshots_read_all" ON public.snapshots;
CREATE POLICY "snapshots_read_all" ON public.snapshots FOR SELECT USING (true);

DROP POLICY IF EXISTS "snapshots_manage" ON public.snapshots;
CREATE POLICY "snapshots_manage" ON public.snapshots FOR ALL TO authenticated
  USING (public.is_snapshot_manager(auth.uid())) WITH CHECK (public.is_snapshot_manager(auth.uid()));

-- =========================== STORAGE BUCKET ===========================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('snapshots', 'snapshots', true, 20971520,
        ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 20971520,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic'];

DROP POLICY IF EXISTS "snapshots_storage_read" ON storage.objects;
CREATE POLICY "snapshots_storage_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'snapshots');

DROP POLICY IF EXISTS "snapshots_storage_insert" ON storage.objects;
CREATE POLICY "snapshots_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'snapshots' AND public.is_snapshot_manager(auth.uid()));

DROP POLICY IF EXISTS "snapshots_storage_delete" ON storage.objects;
CREATE POLICY "snapshots_storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'snapshots' AND public.is_snapshot_manager(auth.uid()));
