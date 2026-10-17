-- ============================================================================
-- AVATARS (Profile Photos)
-- Bucket + policies para makapag-upload ang bawat member ng sariling profile
-- photo. Leaders (superadmin/president/secretary/organizer) ay pwede ring
-- mag-upload/change ng photo para sa ibang member.
--
-- Paalala: ang public URL ng photo ay ise-save sa public.members.avatar_url
-- (existing column). 1 photo lang per member — binubura ng app ang lumang
-- file pag nagpalit ng photo.
--
-- Storage size: client-side na pinapaliit ang photo (~512px, WebP, ~20-40 KB)
-- kaya hindi agad mapupuno ang 1 GB free-tier storage.
-- ============================================================================

-- =========================== BUCKET ===========================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

-- =========================== STORAGE POLICIES ===========================
-- Public read (kagaya ng snapshots bucket)
DROP POLICY IF EXISTS "avatars_storage_read" ON storage.objects;
CREATE POLICY "avatars_storage_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Upload: sariling folder lang ({user_id}/...), o kahit anong folder kung leader.
-- Ang folder na "member-<id>" ay para sa mga member row na hindi pa naka-link
-- sa isang account (leaders lang ang pwedeng mag-upload doon).
DROP POLICY IF EXISTS "avatars_storage_insert" ON storage.objects;
CREATE POLICY "avatars_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_leader(auth.uid()))
  );

-- Replace/overwrite (kailangan ang parehong USING at WITH CHECK sa update)
DROP POLICY IF EXISTS "avatars_storage_update" ON storage.objects;
CREATE POLICY "avatars_storage_update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_leader(auth.uid()))
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_leader(auth.uid()))
  );

-- Delete (self o leader) — ginagamit kapag nagpalit o nag-remove ng photo
DROP POLICY IF EXISTS "avatars_storage_delete" ON storage.objects;
CREATE POLICY "avatars_storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_leader(auth.uid()))
  );
