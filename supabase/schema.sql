-- =====================================================================
--  Skema RSVP & Ucapan — jalankan di Supabase → SQL Editor → New query → Run
-- =====================================================================
--  Keamanan:
--   • Publik (anon key di browser) hanya bisa MEMBACA ucapan & statistik.
--   • Menulis hanya lewat /api/rsvp (service role, di server Vercel) yang
--     menjalankan honeypot, validasi, dan rate limit per IP.
-- =====================================================================

create extension if not exists pgcrypto;

create table if not exists public.rsvp (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 60),
  attendance  text not null check (attendance in ('yes', 'no', 'maybe')),
  guests      smallint not null default 0 check (guests between 0 and 20),
  message     text not null check (char_length(message) between 1 and 500),
  created_at  timestamptz not null default now()
);
create index if not exists rsvp_created_at_idx on public.rsvp (created_at desc);

-- hash IP (bukan IP asli) untuk rate limit; tidak bisa dibaca publik
create table if not exists public.rsvp_ratelimit (
  id          bigint generated always as identity primary key,
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists rsvp_ratelimit_idx on public.rsvp_ratelimit (ip_hash, created_at desc);

-- ---------- Row Level Security ----------
alter table public.rsvp enable row level security;
alter table public.rsvp_ratelimit enable row level security;

drop policy if exists "ucapan bisa dibaca publik" on public.rsvp;
create policy "ucapan bisa dibaca publik" on public.rsvp for select to anon, authenticated using (true);
-- sengaja TIDAK ada policy insert/update/delete untuk anon → hanya service role (server) yang bisa menulis.
-- rsvp_ratelimit: tanpa policy sama sekali → tertutup untuk publik.

-- ---------- Statistik ----------
create or replace view public.rsvp_stats with (security_invoker = true) as
select
  count(*) filter (where attendance = 'yes')::int                        as yes,
  count(*) filter (where attendance = 'no')::int                         as no,
  count(*) filter (where attendance = 'maybe')::int                      as maybe,
  coalesce(sum(guests) filter (where attendance = 'yes'), 0)::int        as guests,
  count(*)::int                                                          as total
from public.rsvp;

grant select on public.rsvp to anon, authenticated;
grant select on public.rsvp_stats to anon, authenticated;

-- ---------- Realtime (ucapan baru langsung muncul) ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rsvp'
  ) then
    alter publication supabase_realtime add table public.rsvp;
  end if;
end $$;

-- ---------- Bersih-bersih data rate limit lama (opsional, jalankan sesekali) ----------
-- delete from public.rsvp_ratelimit where created_at < now() - interval '1 day';
