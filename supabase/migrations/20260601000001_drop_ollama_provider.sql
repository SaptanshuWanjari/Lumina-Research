alter table public.ai_settings
  drop constraint if exists ai_settings_provider_check;

alter table public.ai_settings
  add constraint ai_settings_provider_check
  check (provider in ('gemini', 'groq'));
