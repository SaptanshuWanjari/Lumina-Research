alter table public.ai_settings
  drop constraint if exists ai_settings_pkey;

alter table public.ai_settings
  add constraint ai_settings_pkey primary key (owner_user_id, provider);
