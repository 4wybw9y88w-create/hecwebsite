-- HEC BSc1 Study Hub: accounts, paid access, private course storage.
-- Run once in the Supabase dashboard (SQL Editor) or with `supabase db push`.

-- One profile per account, filled automatically at sign-up.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A row here means "this account has paid". Visitors can read their own row.
-- There is deliberately no insert / update / delete policy: only the Stripe
-- webhook (service role) can grant or revoke access, never the browser.
create table if not exists public.entitlements (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  plan                  text not null default 'all-courses',
  stripe_session_id     text unique,
  stripe_payment_intent text,
  amount_total          integer,
  currency              text,
  paid_at               timestamptz not null default now()
);
create index if not exists entitlements_payment_intent_idx on public.entitlements (stripe_payment_intent);
alter table public.entitlements enable row level security;

create policy "entitlements: read own" on public.entitlements for select using (auth.uid() = user_id);

-- Private bucket for the course pages. No storage policies are created, so the
-- browser can never read it directly; only the `course` function (service role) can.
insert into storage.buckets (id, name, public)
values ('courses', 'courses', false)
on conflict (id) do update set public = false;
