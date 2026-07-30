-- ================================================================
-- MILO PEN TRAINING TRACKER - SUPABASE SETUP
-- Run this whole file once in Supabase Dashboard > SQL Editor.
-- ================================================================

create extension if not exists pgcrypto;

-- Each signed-in user gets their own private training rows.
create table if not exists public.milo_training_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    session_date date not null,
    plan_id text not null,
    calmness smallint not null check (calmness between 1 and 5),
    crying text not null check (
        crying in ('None', 'A little', 'Moderate', 'A lot')
    ),
    absence_seconds integer not null default 0 check (absence_seconds >= 0),
    notes text not null default '',
    created_at timestamptz not null default now()
);

create index if not exists milo_training_sessions_user_date_idx
    on public.milo_training_sessions (user_id, session_date, created_at);

-- Stores the user's current recommended stage.
create table if not exists public.milo_tracker_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    current_plan_id text not null default 'F01',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Optional database-side safety rule: no more than 3 sessions per user per date.
create or replace function public.limit_milo_sessions_per_day()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if (
        select count(*)
        from public.milo_training_sessions
        where user_id = new.user_id
          and session_date = new.session_date
    ) >= 3 then
        raise exception 'A maximum of three training sessions may be saved per day.';
    end if;

    return new;
end;
$$;

drop trigger if exists limit_milo_sessions_per_day_trigger
    on public.milo_training_sessions;

create trigger limit_milo_sessions_per_day_trigger
before insert on public.milo_training_sessions
for each row
execute function public.limit_milo_sessions_per_day();

-- Turn on Row Level Security.
alter table public.milo_training_sessions enable row level security;
alter table public.milo_tracker_settings enable row level security;

-- Remove old versions of the policies so this script can be run again safely.
drop policy if exists "Users can read their own Milo sessions"
    on public.milo_training_sessions;
drop policy if exists "Users can insert their own Milo sessions"
    on public.milo_training_sessions;
drop policy if exists "Users can update their own Milo sessions"
    on public.milo_training_sessions;
drop policy if exists "Users can delete their own Milo sessions"
    on public.milo_training_sessions;

drop policy if exists "Users can read their own Milo settings"
    on public.milo_tracker_settings;
drop policy if exists "Users can insert their own Milo settings"
    on public.milo_tracker_settings;
drop policy if exists "Users can update their own Milo settings"
    on public.milo_tracker_settings;
drop policy if exists "Users can delete their own Milo settings"
    on public.milo_tracker_settings;

-- Training-session policies.
create policy "Users can read their own Milo sessions"
on public.milo_training_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own Milo sessions"
on public.milo_training_sessions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own Milo sessions"
on public.milo_training_sessions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own Milo sessions"
on public.milo_training_sessions
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Tracker-setting policies.
create policy "Users can read their own Milo settings"
on public.milo_tracker_settings
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own Milo settings"
on public.milo_tracker_settings
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own Milo settings"
on public.milo_tracker_settings
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own Milo settings"
on public.milo_tracker_settings
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Allow only signed-in users to use these tables through the API.
revoke all on table public.milo_training_sessions from anon;
revoke all on table public.milo_tracker_settings from anon;

grant select, insert, update, delete
    on table public.milo_training_sessions
    to authenticated;

grant select, insert, update, delete
    on table public.milo_tracker_settings
    to authenticated;
