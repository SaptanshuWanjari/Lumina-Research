-- Supabase-focused SQL that complements Prisma migrations.
-- This file assumes base tables already exist.
-- Initialize schema first with either:
--   1) Prisma migrate (recommended), or
--   2) `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists vector;

-- Enforce one currently published version per case.
do $$
begin
  if to_regclass('public.report_versions') is not null then
    execute $sql$
      create unique index if not exists uq_report_versions_one_published_per_case
      on public.report_versions (case_id)
      where status = 'published'
    $sql$;
  else
    raise notice 'Skipping uq_report_versions_one_published_per_case: table public.report_versions does not exist yet';
  end if;
end
$$;

-- Fast queue for review-required runs.
do $$
begin
  if to_regclass('public.runs') is not null then
    execute $sql$
      create index if not exists idx_runs_needs_review_queue
      on public.runs (owner_user_id, updated_at desc)
      where needs_review = true and status in ('needs_review', 'running')
    $sql$;
  else
    raise notice 'Skipping idx_runs_needs_review_queue: table public.runs does not exist yet';
  end if;
end
$$;

-- Fast semantic search by case ownership.
do $$
begin
  if to_regclass('public.chunks') is not null then
    execute $sql$
      create index if not exists idx_chunks_owner_case
      on public.chunks (owner_user_id, case_id)
    $sql$;
  else
    raise notice 'Skipping idx_chunks_owner_case: table public.chunks does not exist yet';
  end if;
end
$$;

-- ANN vector index (use cosine ops for normalized embeddings).
-- Tune m and ef_construction based on dataset size.
do $$
begin
  if to_regclass('public.chunks') is not null then
    execute $sql$
      create index if not exists idx_chunks_embedding_hnsw
      on public.chunks
      using hnsw (embedding vector_cosine_ops)
      with (m = 16, ef_construction = 64)
    $sql$;
  else
    raise notice 'Skipping idx_chunks_embedding_hnsw: table public.chunks does not exist yet';
  end if;
end
$$;

-- Optional row-level security templates for single-user ownership.
do $$
begin
  if to_regclass('public.cases') is not null then
    alter table public.cases enable row level security;
    drop policy if exists p_cases_owner_all on public.cases;
    create policy p_cases_owner_all on public.cases
      using (owner_user_id = auth.uid())
      with check (owner_user_id = auth.uid());
  else
    raise notice 'Skipping cases RLS policy setup: table public.cases does not exist yet';
  end if;

  if to_regclass('public.sources') is not null then
    alter table public.sources enable row level security;
    drop policy if exists p_sources_owner_all on public.sources;
    create policy p_sources_owner_all on public.sources
      using (owner_user_id = auth.uid())
      with check (owner_user_id = auth.uid());
  else
    raise notice 'Skipping sources RLS policy setup: table public.sources does not exist yet';
  end if;

  if to_regclass('public.runs') is not null then
    alter table public.runs enable row level security;
    drop policy if exists p_runs_owner_all on public.runs;
    create policy p_runs_owner_all on public.runs
      using (owner_user_id = auth.uid())
      with check (owner_user_id = auth.uid());
  else
    raise notice 'Skipping runs RLS policy setup: table public.runs does not exist yet';
  end if;

  if to_regclass('public.report_versions') is not null then
    alter table public.report_versions enable row level security;
    drop policy if exists p_report_versions_owner_all on public.report_versions;
    create policy p_report_versions_owner_all on public.report_versions
      using (owner_user_id = auth.uid())
      with check (owner_user_id = auth.uid());
  else
    raise notice 'Skipping report_versions RLS policy setup: table public.report_versions does not exist yet';
  end if;
end
$$;
