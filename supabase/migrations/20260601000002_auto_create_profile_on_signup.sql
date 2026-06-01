-- Create a function that inserts a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, updated_at)
  values (
    new.id,
    new.email,
    now()
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Attach the trigger to auth.users (fires after every INSERT).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill: create profile rows for any existing auth users who don't have one yet.
insert into public.profiles (user_id, email, updated_at)
select
  u.id,
  u.email,
  now()
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null
on conflict (user_id) do nothing;
