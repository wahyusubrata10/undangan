-- =====================================================================
--  Skema RSVP & Ucapan — jalankan di Supabase → SQL Editor → New query → Run
-- =====================================================================
--  Keamanan (PRIVASI TAMU):
--   • Tabel TERTUTUP total untuk publik (anon key). Tidak ada policy sama sekali.
--   • Halaman tamu membaca ucapan lewat GET /api/rsvp (server, service role) yang
--     hanya mengirim nama + ucapan + waktu — TANPA status kehadiran/jumlah tamu.
--   • Statistik hanya tersedia di /admin (login).
--   • Menulis hanya lewat POST /api/rsvp (honeypot, validasi, rate limit per IP).
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

-- hapus akses publik lama (bila skema versi sebelumnya pernah dijalankan)
drop policy if exists "ucapan bisa dibaca publik" on public.rsvp;
revoke all on public.rsvp from anon, authenticated;
revoke all on public.rsvp_ratelimit from anon, authenticated;
-- sengaja TIDAK ada policy apa pun → anon/authenticated tidak bisa membaca maupun menulis.
-- service role (hanya di server Vercel) melewati RLS.

-- ---------- Statistik (hanya untuk admin, via service role) ----------
drop view if exists public.rsvp_stats;
create view public.rsvp_stats with (security_invoker = true) as
select
  count(*) filter (where attendance = 'yes')::int                        as yes,
  count(*) filter (where attendance = 'no')::int                         as no,
  count(*) filter (where attendance = 'maybe')::int                      as maybe,
  coalesce(sum(guests) filter (where attendance = 'yes'), 0)::int        as guests,
  count(*)::int                                                          as total
from public.rsvp;
revoke all on public.rsvp_stats from anon, authenticated;

-- ---------- Bersih-bersih data rate limit lama (opsional, jalankan sesekali) ----------
-- delete from public.rsvp_ratelimit where created_at < now() - interval '1 day';
