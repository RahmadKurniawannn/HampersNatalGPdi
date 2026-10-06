-- Run once in Supabase SQL Editor if the previous pending-account promotion
-- policy was installed. New admin accounts are created by a protected Edge Function.
drop policy if exists "Admins can promote pending profiles" on public.profiles;
revoke update on public.profiles from public, anon, authenticated;
revoke update (role) on public.profiles from public, anon, authenticated;
