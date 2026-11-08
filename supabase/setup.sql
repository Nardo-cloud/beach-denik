-- Tréninkový deník beachvolejbalistky – nastavení databáze Supabase
-- Spusť celé najednou v Supabase: SQL Editor → New query → vložit → Run.

-- 1) Hráčky (a trenér). Řádek vznikne sám při prvním přihlášení.
create table if not exists public.players (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  since      date not null default current_date,
  is_coach   boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Zápisy: dny (kind = 'days', key = '2026-11-08') a hodnocení týdnů (kind = 'weeks', key = pondělí týdne)
create table if not exists public.entries (
  owner      uuid not null references public.players(id) on delete cascade,
  kind       text not null check (kind in ('days','weeks')),
  key        text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner, kind, key)
);

-- 3) Je přihlášený uživatel trenér?
create or replace function public.is_coach()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_coach from public.players where id = auth.uid()), false)
$$;

-- 4) Pravidla přístupu: hráčka vidí a mění jen svoje data, trenér všechno čte.
alter table public.players enable row level security;
alter table public.entries enable row level security;

drop policy if exists "players_select" on public.players;
create policy "players_select" on public.players for select
  using (id = auth.uid() or public.is_coach());
drop policy if exists "players_insert" on public.players;
create policy "players_insert" on public.players for insert
  with check (id = auth.uid());
drop policy if exists "players_update" on public.players;
create policy "players_update" on public.players for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Hráčka si smí měnit jen jméno; roli trenéra nastavuje jen správce (krok 6).
revoke insert, update on public.players from anon, authenticated;
grant insert (id, name, since) on public.players to authenticated;
grant update (name) on public.players to authenticated;
grant select on public.players to authenticated;

drop policy if exists "entries_select" on public.entries;
create policy "entries_select" on public.entries for select
  using (owner = auth.uid() or public.is_coach());
drop policy if exists "entries_insert" on public.entries;
create policy "entries_insert" on public.entries for insert
  with check (owner = auth.uid());
drop policy if exists "entries_update" on public.entries;
create policy "entries_update" on public.entries for update
  using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists "entries_delete" on public.entries;
create policy "entries_delete" on public.entries for delete
  using (owner = auth.uid());

revoke all on public.entries from anon;
grant select, insert, update, delete on public.entries to authenticated;

-- 5) Živé aktualizace (trenér vidí nové zápisy bez obnovení stránky)
do $$ begin
  alter publication supabase_realtime add table public.entries, public.players;
exception when duplicate_object then null; end $$;

-- 6) AŽ SE PŘIHLÁSÍŠ DO APLIKACE POPRVÉ, spusť zvlášť tento řádek (se svým e-mailem),
--    tím se z tvého účtu stane trenér:
-- update public.players set is_coach = true
--   where id = (select id from auth.users where email = 'lukikorda@gmail.com');
