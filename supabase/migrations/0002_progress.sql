-- Per-account study progress (tracker, solved exercises, exam attempts).
-- Each row belongs to one account; the browser can only touch its own rows.
create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  key     text not null check (key ~ '^progress-[a-z-]{3,40}$'),
  state   text not null check (length(state) < 2000000),
  updated bigint not null default 0,
  primary key (user_id, key)
);
alter table public.progress enable row level security;
create policy "progress: read own"   on public.progress for select using (auth.uid() = user_id);
create policy "progress: insert own" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress: update own" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
