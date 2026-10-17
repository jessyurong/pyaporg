-- Add per-member note column to attendance (e.g. reasons for excused/late)
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS note text;
