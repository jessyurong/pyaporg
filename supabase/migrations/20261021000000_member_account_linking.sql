-- ============================================================================
-- MEMBER <-> ACCOUNT LINKING FIX
--
-- PROBLEMA
-- Ang My Profile ay naghahanap ng member row na may user_id = auth.uid().
-- Kapag ang member row ay nauna nang naidagdag (hal. manual na "Add Member")
-- bago pa ma-approve ang account, hindi ito na-link ng sync trigger:
-- ang INSERT branch nito ay "skip" lang kapag may kaparehong pangalan,
-- pero hindi nito sina-set ang user_id. Kaya nagpapakita ng
-- "Wala pang naka-link na member record" kahit nasa Members list naman.
--
-- SOLUSYON
--   * Isang helper na hahanap ng tamang unlinked member row (email muna,
--     tapos exact name kung iisa lang ang match).
--   * Inayos ang sync_member_from_profile(): kapag may existing member row
--     na match, i-link ito (hindi lang i-skip).
--   * Bagong trigger sa members: kapag may bagong manual member row na
--     tugma sa active account, awtomatikong i-link.
--   * link_my_member(): self-heal na pwedeng tawagin ng app kapag bukas ang
--     My Profile — magli-link o gagawa ng member row para sa sariling account.
--   * Backfill para sa lahat ng active accounts na wala pang link.
--
-- Safe i-re-run: CREATE OR REPLACE / IF NOT EXISTS / idempotent updates lang.
--
-- PAANO I-APPLY: Supabase Dashboard -> SQL Editor -> New query ->
-- i-paste ang buong file na ito -> Run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: hanapin ang member row para sa isang profile.
-- Email match ang priority; name match ay gagamitin lang kung iisa lang ang
-- kandidato para hindi makapag-link sa maling tao kapag common ang pangalan.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.find_member_for_profile(_full_name text, _email text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id
  FROM public.members m
  WHERE m.user_id IS NULL
    AND (
      (
        _email IS NOT NULL AND trim(_email) <> ''
        AND m.email IS NOT NULL AND trim(m.email) <> ''
        AND lower(trim(m.email)) = lower(trim(_email))
      )
      OR (
        _full_name IS NOT NULL AND trim(_full_name) <> ''
        AND lower(trim(m.full_name)) = lower(trim(_full_name))
        AND NOT EXISTS (
          SELECT 1
          FROM public.members m2
          WHERE m2.user_id IS NULL
            AND m2.id <> m.id
            AND lower(trim(m2.full_name)) = lower(trim(_full_name))
        )
      )
    )
  ORDER BY
    CASE
      WHEN _email IS NOT NULL
       AND m.email IS NOT NULL
       AND lower(trim(m.email)) = lower(trim(_email)) THEN 0
      ELSE 1
    END,
    m.created_at ASC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_member_for_profile(text, text) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- Sync profile -> member (fixed)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_member_from_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _was_active boolean := false;
  _member_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    _was_active := (OLD.status = 'active');
  END IF;

  IF NEW.status = 'active' AND NEW.full_name IS NOT NULL AND trim(NEW.full_name) <> '' THEN
    -- Isang transaction lang sa isang pagkakataon para sa account na ito.
    PERFORM pg_advisory_xact_lock(hashtext('pyap_member_sync:' || NEW.user_id::text)::bigint);

    SELECT id INTO _member_id
      FROM public.members
     WHERE user_id = NEW.user_id
     LIMIT 1;

    -- Wala pang linked row: hanapin ang existing member row at i-link.
    IF _member_id IS NULL THEN
      _member_id := public.find_member_for_profile(NEW.full_name, NEW.email);

      IF _member_id IS NOT NULL THEN
        UPDATE public.members
           SET user_id = NEW.user_id,
               email = COALESCE(NULLIF(trim(email), ''), NEW.email)
         WHERE id = _member_id;
      END IF;
    END IF;

    IF _member_id IS NULL THEN
      INSERT INTO public.members (full_name, email, address, birthday, user_id)
      VALUES (trim(NEW.full_name), NEW.email, NEW.address, NEW.birthday, NEW.user_id)
      RETURNING id INTO _member_id;
    ELSIF _was_active THEN
      -- Profile edits habang active: i-sync ang info papunta sa member row.
      UPDATE public.members
         SET full_name = trim(NEW.full_name),
             email = NEW.email,
             address = NEW.address,
             birthday = NEW.birthday
       WHERE id = _member_id;
    ELSE
      -- Unang activation / bagong link: huwag burahin ang existing member
      -- info (position, contact, etc.) — punan lang ang mga blangko.
      UPDATE public.members
         SET email = COALESCE(NULLIF(trim(email), ''), NEW.email),
             address = COALESCE(NULLIF(trim(address), ''), NEW.address),
             birthday = COALESCE(birthday, NEW.birthday)
       WHERE id = _member_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_member ON public.profiles;
CREATE TRIGGER profiles_sync_member
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_member_from_profile();

-- ---------------------------------------------------------------------------
-- Member row na naidagdag pagkatapos ma-approve ang account.
-- Halimbawa: manual na "Add Member" -> i-link agad sa active account.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.link_member_to_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _profile record;
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.full_name IS NULL OR trim(NEW.full_name) = '' THEN
    RETURN NEW;
  END IF;

  SELECT p.user_id, p.email, p.full_name
    INTO _profile
    FROM public.profiles p
   WHERE p.status = 'active'
     AND (
       (
         NEW.email IS NOT NULL AND trim(NEW.email) <> ''
         AND p.email IS NOT NULL AND trim(p.email) <> ''
         AND lower(trim(p.email)) = lower(trim(NEW.email))
       )
       OR (
         lower(trim(p.full_name)) = lower(trim(NEW.full_name))
         AND NOT EXISTS (
           SELECT 1
           FROM public.profiles p2
           WHERE p2.status = 'active'
             AND p2.user_id <> p.user_id
             AND lower(trim(p2.full_name)) = lower(trim(NEW.full_name))
         )
       )
     )
   ORDER BY
     CASE
       WHEN NEW.email IS NOT NULL
        AND p.email IS NOT NULL
        AND lower(trim(p.email)) = lower(trim(NEW.email)) THEN 0
       ELSE 1
     END,
     p.created_at ASC
   LIMIT 1;

  IF _profile.user_id IS NOT NULL THEN
    NEW.user_id := _profile.user_id;
    IF NEW.email IS NULL OR trim(NEW.email) = '' THEN
      NEW.email := _profile.email;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS members_link_profile ON public.members;
CREATE TRIGGER members_link_profile
  BEFORE INSERT OR UPDATE OF full_name, email, user_id ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.link_member_to_profile();

-- ---------------------------------------------------------------------------
-- Self-heal RPC: tatawagin ng app kapag walang naka-link na member record.
-- Gagawa rin ng member row kung active account pero wala talagang record.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.link_my_member()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _p record;
  _member_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id, full_name, email, address, birthday, status
    INTO _p
    FROM public.profiles
   WHERE user_id = _uid;

  IF _p.user_id IS NULL
     OR _p.status <> 'active'
     OR _p.full_name IS NULL
     OR trim(_p.full_name) = '' THEN
    RETURN NULL;
  END IF;

  SELECT id INTO _member_id FROM public.members WHERE user_id = _uid LIMIT 1;
  IF _member_id IS NOT NULL THEN
    RETURN _member_id;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('pyap_member_sync:' || _uid::text)::bigint);

  -- Re-check pagkatapos ng lock (baka na-link na ng ibang request).
  SELECT id INTO _member_id FROM public.members WHERE user_id = _uid LIMIT 1;
  IF _member_id IS NOT NULL THEN
    RETURN _member_id;
  END IF;

  _member_id := public.find_member_for_profile(_p.full_name, _p.email);
  IF _member_id IS NOT NULL THEN
    UPDATE public.members
       SET user_id = _uid,
           email = COALESCE(NULLIF(trim(email), ''), _p.email)
     WHERE id = _member_id;
    RETURN _member_id;
  END IF;

  INSERT INTO public.members (full_name, email, address, birthday, user_id)
  VALUES (trim(_p.full_name), _p.email, _p.address, _p.birthday, _uid)
  RETURNING id INTO _member_id;

  RETURN _member_id;
END;
$$;

REVOKE ALL ON FUNCTION public.link_my_member() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_my_member() TO authenticated;

-- ---------------------------------------------------------------------------
-- Backfill: link (o gumawa ng) member row para sa lahat ng active accounts.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  p record;
  _member_id uuid;
BEGIN
  FOR p IN
    SELECT user_id, full_name, email, address, birthday
      FROM public.profiles
     WHERE status = 'active'
       AND full_name IS NOT NULL
       AND trim(full_name) <> ''
  LOOP
    PERFORM pg_advisory_xact_lock(hashtext('pyap_member_sync:' || p.user_id::text)::bigint);

    SELECT id INTO _member_id FROM public.members WHERE user_id = p.user_id LIMIT 1;
    IF _member_id IS NOT NULL THEN
      CONTINUE;
    END IF;

    _member_id := public.find_member_for_profile(p.full_name, p.email);
    IF _member_id IS NOT NULL THEN
      UPDATE public.members
         SET user_id = p.user_id,
             email = COALESCE(NULLIF(trim(email), ''), p.email)
       WHERE id = _member_id;
    ELSE
      INSERT INTO public.members (full_name, email, address, birthday, user_id)
      VALUES (trim(p.full_name), p.email, p.address, p.birthday, p.user_id);
    END IF;
  END LOOP;
END $$;
