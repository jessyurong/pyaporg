-- ============================================================================
-- SNAPSHOT LIMIT
-- Hard cap sa bilang ng snapshots para hindi mapuno ang 1 GB free-tier
-- storage ng Supabase (dati: hanggang 20 MB per file, walang limit sa count).
--
-- Kapag na-hit na ang limit, kailangan munang mag-delete ng lumang snapshots
-- bago maka-upload ulit ng bago.
--
-- Importante: panatilihing pareho ang numero sa SNAPSHOT_LIMIT na nasa
-- src/pyap/constants.js (client-side check) — ito ang server-side backstop
-- para hindi ma-bypass ang limit.
-- ============================================================================

-- Single source of truth ng limit sa database
CREATE OR REPLACE FUNCTION public.snapshot_count_limit()
RETURNS int LANGUAGE sql IMMUTABLE AS $$ SELECT 300 $$;

CREATE OR REPLACE FUNCTION public.enforce_snapshot_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.snapshots) >= public.snapshot_count_limit() THEN
    RAISE EXCEPTION 'Snapshot limit reached (% photos). Delete old photos first.', public.snapshot_count_limit();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS snapshots_enforce_limit ON public.snapshots;
CREATE TRIGGER snapshots_enforce_limit
  BEFORE INSERT ON public.snapshots
  FOR EACH ROW EXECUTE FUNCTION public.enforce_snapshot_limit();

-- =========================== FILE SIZE SAFETY NET ===========================
-- Ang bagong app ay nag-a-auto-compress ng photos sa client (~0.2-0.5 MB),
-- pero i-limit pa rin ang bucket sa 10 MB per file bilang safety net
-- (kung may mag-upload via API na hindi dumadaan sa app).
UPDATE storage.buckets
   SET file_size_limit = 10485760
 WHERE id = 'snapshots'
   AND (file_size_limit IS NULL OR file_size_limit > 10485760);
