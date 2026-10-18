-- ============================================================================
-- MEMBER SYNC — duplicate guard
--
-- PROBLEMA
-- Ang trigger na ito ay "check-then-insert" (NOT EXISTS bago mag-INSERT).
-- Kapag sabay dumating ang dalawang approve requests (double-tap habang
-- mahina ang signal at walang feedback ang button), hindi pa nakikita ng isa
-- ang uncommitted INSERT ng isa pa -> dalawang member row ang nagagawa.
-- Doble rin ang lumalabas sa attendance/finance/certificates dahil sa
-- duplicate member.
--
-- SOLUSYON
-- Isang advisory lock bawat user_id bago ang check-then-insert. Ang
-- pangalawang transaction ay naghihintay hanggang mag-commit ang una, kaya
-- nakikita na nito ang naunang row at hindi na mag-i-insert.
--
-- Safe i-re-run: CREATE OR REPLACE lang — walang binubura o binabago sa data.
--
-- PAANO I-APPLY: Supabase Dashboard -> SQL Editor -> New query ->
-- i-paste ang buong file na ito -> Run.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_member_from_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _was_active boolean := false;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    _was_active := (OLD.status = 'active');
  END IF;

  IF NEW.status = 'active' AND NEW.full_name IS NOT NULL AND trim(NEW.full_name) <> '' THEN
    -- Isang transaction lang sa isang pagkakataon para sa account na ito.
    PERFORM pg_advisory_xact_lock(hashtext('pyap_member_sync:' || NEW.user_id::text)::bigint);

    IF _was_active THEN
      UPDATE public.members m
         SET full_name = trim(NEW.full_name),
             email = NEW.email,
             address = NEW.address,
             birthday = NEW.birthday,
             user_id = NEW.user_id
       WHERE m.user_id = NEW.user_id
          OR lower(m.full_name) = lower(trim(OLD.full_name))
          OR (OLD.email IS NOT NULL AND m.email IS NOT NULL AND lower(m.email) = lower(OLD.email));
    ELSE
      INSERT INTO public.members (full_name, email, address, birthday, user_id)
      SELECT trim(NEW.full_name), NEW.email, NEW.address, NEW.birthday, NEW.user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.user_id = NEW.user_id
           OR lower(m.full_name) = lower(trim(NEW.full_name))
           OR (NEW.email IS NOT NULL AND m.email IS NOT NULL AND lower(m.email) = lower(NEW.email))
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
