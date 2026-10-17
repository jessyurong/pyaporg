-- ============================================================================
-- MEMBER SYNC
-- Every approved account (profiles.status = 'active') is kept in the Members
-- list, so approved users show up in attendance, certificates, etc.
--   * trigger: on activation -> insert a member row if none matches (by
--     user_id, name or email); while active, profile edits (name, email,
--     address, birthday) sync into the member row.
--   * backfill: adds every existing active profile not yet in Members, and
--     links existing member rows (matched by name/email) to their account.
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

DROP TRIGGER IF EXISTS profiles_sync_member ON public.profiles;
CREATE TRIGGER profiles_sync_member
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_member_from_profile();

-- Backfill 1: add every active profile that has no member row yet
INSERT INTO public.members (full_name, email, address, birthday, user_id)
SELECT trim(p.full_name), p.email, p.address, p.birthday, p.user_id
FROM public.profiles p
WHERE p.status = 'active'
  AND p.full_name IS NOT NULL
  AND trim(p.full_name) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.user_id = p.user_id
       OR lower(m.full_name) = lower(trim(p.full_name))
       OR (p.email IS NOT NULL AND m.email IS NOT NULL AND lower(m.email) = lower(p.email))
  );

-- Backfill 2: link existing member rows (same name or email) to their account
UPDATE public.members m
   SET user_id = p.user_id
  FROM public.profiles p
 WHERE p.status = 'active'
   AND m.user_id IS NULL
   AND (lower(m.full_name) = lower(trim(p.full_name))
        OR (p.email IS NOT NULL AND m.email IS NOT NULL AND lower(m.email) = lower(p.email)));
