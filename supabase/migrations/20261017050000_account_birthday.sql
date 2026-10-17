-- ============================================================================
-- ACCOUNT BIRTHDAY
-- Adds birthday to the Request Account flow:
--   * profiles.birthday + account_requests.birthday columns
--   * handle_new_user() stores the birthday sent by the signup form
--   * active_birthdays() lets every signed-in user read name + birthday of
--     active accounts (profiles RLS is own/leaders only, so the dashboard
--     birthday list uses a SECURITY DEFINER helper).
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday date;
ALTER TABLE public.account_requests ADD COLUMN IF NOT EXISTS birthday date;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _is_first boolean;
  _name text;
  _age text;
  _sex text;
  _address text;
  _birthday date;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'superadmin'
  ) INTO _is_first;

  _name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'member'), '@', 1));
  _age := NEW.raw_user_meta_data->>'age';
  _sex := NEW.raw_user_meta_data->>'sex';
  _address := NEW.raw_user_meta_data->>'address';
  BEGIN
    _birthday := NULLIF(trim(NEW.raw_user_meta_data->>'birthday'), '')::date;
  EXCEPTION WHEN others THEN
    _birthday := NULL;
  END;

  INSERT INTO public.profiles (user_id, full_name, email, age, sex, address, birthday, status)
  VALUES (NEW.id, _name, NEW.email, _age, _sex, _address, _birthday, CASE WHEN _is_first THEN 'active' ELSE 'pending' END)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN _is_first THEN 'superadmin' ELSE 'member' END)
  ON CONFLICT (user_id) DO NOTHING;

  IF _age IS NOT NULL AND _sex IS NOT NULL AND _address IS NOT NULL THEN
    INSERT INTO public.account_requests (user_id, name, email, age, sex, address, birthday, status, notified_roles)
    VALUES (
      NEW.id, _name, NEW.email, _age, _sex, _address, _birthday,
      CASE WHEN _is_first THEN 'accepted' ELSE 'new' END,
      ARRAY['superadmin','president','secretary']
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.active_birthdays()
RETURNS TABLE (name text, birthday date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(NULLIF(trim(p.full_name), ''), split_part(COALESCE(p.email, 'member'), '@', 1))::text AS name,
         p.birthday
  FROM public.profiles p
  WHERE p.status = 'active' AND p.birthday IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.active_birthdays() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.active_birthdays() TO authenticated;
