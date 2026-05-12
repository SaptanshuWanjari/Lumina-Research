-- Simple cloud seed SQL
-- Run in Supabase SQL editor after replacing placeholders.

-- 1) Ensure profile exists for an auth user (user_id must exist in auth.users).
insert into public.profiles (user_id, email, display_name, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000000', -- replace with auth user UUID
  'seed.user@example.com',                 -- replace with auth email
  'Seed User',
  now(),
  now()
)
on conflict (user_id) do update
set
  email = excluded.email,
  display_name = excluded.display_name,
  updated_at = now();

-- 2) Create one sample case for that user.
insert into public.cases (
  owner_user_id,
  title,
  question,
  tags,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000', -- same auth user UUID
  'Seeded case',
  'Should we expand into a new market?',
  array['seed', 'manual'],
  now(),
  now()
);
