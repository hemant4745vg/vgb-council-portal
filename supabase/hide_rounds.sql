create table if not exists public.hide_rounds (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  phase text not null default 'hide',
  host_id uuid not null,
  time_left integer not null default 8,
  created_at timestamptz not null default now()
);

create table if not exists public.hide_players (
  round_id uuid references public.hide_rounds(id) on delete cascade,
  user_id uuid not null,
  role text not null,
  x double precision not null default 24,
  z double precision not null default -70,
  hidden boolean not null default false,
  primary key (round_id, user_id)
);

alter table public.hide_rounds enable row level security;
alter table public.hide_players enable row level security;

create policy "signed in can play rounds" on public.hide_rounds for all to authenticated using (true) with check (true);
create policy "signed in can play players" on public.hide_players for all to authenticated using (true) with check (true);
alter publication supabase_realtime add table public.hide_rounds;
alter publication supabase_realtime add table public.hide_players;
