alter table public.ai_settings
  add column if not exists encrypted_embeddings_api_key text,
  add column if not exists embeddings_api_key_last_four text,
  add column if not exists reuse_api_key_for_embeddings boolean not null default true;

alter table public.ai_settings
  drop constraint if exists ai_settings_provider_check;

alter table public.ai_settings
  add constraint ai_settings_provider_check
  check (provider in ('gemini', 'ollama', 'groq'));
