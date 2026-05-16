create table if not exists public.ai_settings (
  owner_user_id uuid primary key references public.profiles(user_id) on delete cascade,
  provider text not null,
  model text not null,
  encrypted_api_key text,
  api_key_last_four text,
  created_at timestamp with time zone not null default current_timestamp,
  updated_at timestamp with time zone not null default current_timestamp,
  constraint ai_settings_provider_check check (provider in ('gemini', 'ollama'))
);

create index if not exists idx_ai_settings_updated_at
  on public.ai_settings (updated_at desc);

alter table public.ai_settings enable row level security;

create policy "ai_settings_select_own"
  on public.ai_settings
  for select
  to authenticated
  using (auth.uid() = owner_user_id);

create policy "ai_settings_insert_own"
  on public.ai_settings
  for insert
  to authenticated
  with check (auth.uid() = owner_user_id);

create policy "ai_settings_update_own"
  on public.ai_settings
  for update
  to authenticated
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "ai_settings_delete_own"
  on public.ai_settings
  for delete
  to authenticated
  using (auth.uid() = owner_user_id);
