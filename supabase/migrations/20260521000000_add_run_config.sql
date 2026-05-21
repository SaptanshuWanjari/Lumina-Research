ALTER TABLE public.runs
ADD COLUMN IF NOT EXISTS run_config jsonb NOT NULL DEFAULT '{}'::jsonb;
