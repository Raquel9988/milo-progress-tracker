-- ============================================================
-- SETTLEPATH UNIVERSAL DOG INDEPENDENCE TRACKER
-- Run this whole file in Supabase SQL Editor.
-- It is safe to run after the earlier SettlePath setup.
-- Existing dogs and sessions are preserved.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.dog_tracker_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.dog_tracker_dogs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    breed text,
    birth_date date,
    pronouns text not null default 'they',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.dog_tracker_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    dog_id uuid not null references public.dog_tracker_dogs(id) on delete cascade,
    session_date date not null,
    plan_id text not null,
    calmness_score smallint not null,
    vocalisation text not null,
    actual_absence_seconds integer not null default 0,
    notes text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- New universal-profile fields.
alter table public.dog_tracker_dogs
    add column if not exists age_months smallint,
    add column if not exists gender text not null default 'unknown',
    add column if not exists training_style text not null default 'pen',
    add column if not exists starting_capability text not null default 'none',
    add column if not exists preferred_path text not null default 'pen',
    add column if not exists outdoor_available boolean not null default false,
    add column if not exists profile_completed boolean not null default false;

-- Existing dogs from the earlier pen tracker remain usable.
update public.dog_tracker_dogs
set
    gender = coalesce(gender, 'unknown'),
    training_style = coalesce(training_style, 'pen'),
    starting_capability = coalesce(starting_capability, 'none'),
    preferred_path = coalesce(preferred_path, 'pen'),
    outdoor_available = coalesce(outdoor_available, false),
    profile_completed = coalesce(profile_completed, false);

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_username_format'
          and conrelid = 'public.dog_tracker_profiles'::regclass
    ) then
        alter table public.dog_tracker_profiles
            add constraint dog_tracker_username_format
            check (username ~ '^[a-z0-9_]{3,24}$');
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_dog_name_length'
          and conrelid = 'public.dog_tracker_dogs'::regclass
    ) then
        alter table public.dog_tracker_dogs
            add constraint dog_tracker_dog_name_length
            check (char_length(trim(name)) between 1 and 40);
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_pronouns_allowed'
          and conrelid = 'public.dog_tracker_dogs'::regclass
    ) then
        alter table public.dog_tracker_dogs
            add constraint dog_tracker_pronouns_allowed
            check (pronouns in ('he', 'she', 'they'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_gender_allowed'
          and conrelid = 'public.dog_tracker_dogs'::regclass
    ) then
        alter table public.dog_tracker_dogs
            add constraint dog_tracker_gender_allowed
            check (gender in ('male', 'female', 'unknown'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_training_style_allowed'
          and conrelid = 'public.dog_tracker_dogs'::regclass
    ) then
        alter table public.dog_tracker_dogs
            add constraint dog_tracker_training_style_allowed
            check (training_style in ('pen', 'no_pen', 'both'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_starting_capability_allowed'
          and conrelid = 'public.dog_tracker_dogs'::regclass
    ) then
        alter table public.dog_tracker_dogs
            add constraint dog_tracker_starting_capability_allowed
            check (starting_capability in ('none', '10s', '30s', '1m', '5m', '10m', '20m', '30m', '45m', '60m'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_preferred_path_allowed'
          and conrelid = 'public.dog_tracker_dogs'::regclass
    ) then
        alter table public.dog_tracker_dogs
            add constraint dog_tracker_preferred_path_allowed
            check (preferred_path in ('pen', 'home', 'outdoor'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_age_months_range'
          and conrelid = 'public.dog_tracker_dogs'::regclass
    ) then
        alter table public.dog_tracker_dogs
            add constraint dog_tracker_age_months_range
            check (age_months is null or age_months between 1 and 360);
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_calmness_range'
          and conrelid = 'public.dog_tracker_sessions'::regclass
    ) then
        alter table public.dog_tracker_sessions
            add constraint dog_tracker_calmness_range
            check (calmness_score between 1 and 5);
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_vocalisation_allowed'
          and conrelid = 'public.dog_tracker_sessions'::regclass
    ) then
        alter table public.dog_tracker_sessions
            add constraint dog_tracker_vocalisation_allowed
            check (vocalisation in ('None', 'A little', 'Moderate', 'A lot'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'dog_tracker_absence_nonnegative'
          and conrelid = 'public.dog_tracker_sessions'::regclass
    ) then
        alter table public.dog_tracker_sessions
            add constraint dog_tracker_absence_nonnegative
            check (actual_absence_seconds >= 0);
    end if;
end
$$;

create index if not exists dog_tracker_dogs_user_id_idx
    on public.dog_tracker_dogs(user_id);

create index if not exists dog_tracker_sessions_user_dog_date_idx
    on public.dog_tracker_sessions(user_id, dog_id, session_date, created_at);

create or replace function public.set_dog_tracker_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists dog_tracker_profiles_updated_at on public.dog_tracker_profiles;
create trigger dog_tracker_profiles_updated_at
before update on public.dog_tracker_profiles
for each row execute function public.set_dog_tracker_updated_at();

drop trigger if exists dog_tracker_dogs_updated_at on public.dog_tracker_dogs;
create trigger dog_tracker_dogs_updated_at
before update on public.dog_tracker_dogs
for each row execute function public.set_dog_tracker_updated_at();

drop trigger if exists dog_tracker_sessions_updated_at on public.dog_tracker_sessions;
create trigger dog_tracker_sessions_updated_at
before update on public.dog_tracker_sessions
for each row execute function public.set_dog_tracker_updated_at();

create or replace function public.handle_settlepath_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    requested_username text;
begin
    requested_username := lower(
        coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
    );

    insert into public.dog_tracker_profiles (user_id, username)
    values (new.id, requested_username)
    on conflict (user_id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_settlepath_auth_user_created on auth.users;
create trigger on_settlepath_auth_user_created
after insert on auth.users
for each row execute function public.handle_settlepath_new_user();

alter table public.dog_tracker_profiles enable row level security;
alter table public.dog_tracker_dogs enable row level security;
alter table public.dog_tracker_sessions enable row level security;

drop policy if exists "Users read own dog tracker profile" on public.dog_tracker_profiles;
create policy "Users read own dog tracker profile"
on public.dog_tracker_profiles for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own dog tracker profile" on public.dog_tracker_profiles;
create policy "Users insert own dog tracker profile"
on public.dog_tracker_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own dog tracker profile" on public.dog_tracker_profiles;
create policy "Users update own dog tracker profile"
on public.dog_tracker_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own dogs" on public.dog_tracker_dogs;
create policy "Users manage own dogs"
on public.dog_tracker_dogs for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own dog sessions" on public.dog_tracker_sessions;
create policy "Users manage own dog sessions"
on public.dog_tracker_sessions for all
to authenticated
using (
    (select auth.uid()) = user_id
    and exists (
        select 1
        from public.dog_tracker_dogs d
        where d.id = dog_id
          and d.user_id = (select auth.uid())
    )
)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1
        from public.dog_tracker_dogs d
        where d.id = dog_id
          and d.user_id = (select auth.uid())
    )
);

grant select, insert, update, delete on public.dog_tracker_profiles to authenticated;
grant select, insert, update, delete on public.dog_tracker_dogs to authenticated;
grant select, insert, update, delete on public.dog_tracker_sessions to authenticated;


-- ============================================================
-- AUTHENTICATION RELIABILITY UPDATE (v31)
-- Allows the browser app to say clearly when a username exists.
-- It returns only true/false and exposes no account details.
-- ============================================================

create or replace function public.settlepath_username_available(
    candidate_username text
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
    select
        candidate_username is not null
        and lower(trim(candidate_username)) ~ '^[a-z0-9_]{3,24}$'
        and not exists (
            select 1
            from public.dog_tracker_profiles profile
            where profile.username = lower(trim(candidate_username))
        )
        and not exists (
            select 1
            from auth.users auth_user
            where lower(auth_user.email) =
                lower(trim(candidate_username)) || '@accounts.settlepath.app'
        );
$$;

revoke all on function public.settlepath_username_available(text) from public;
grant execute on function public.settlepath_username_available(text)
to anon, authenticated;

create or replace function public.handle_settlepath_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    requested_username text;
begin
    requested_username := lower(
        coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
    );

    if exists (
        select 1
        from public.dog_tracker_profiles existing_profile
        where existing_profile.username = requested_username
          and existing_profile.user_id <> new.id
    ) then
        raise exception using
            errcode = '23505',
            message = 'SettlePath username already exists';
    end if;

    insert into public.dog_tracker_profiles (user_id, username)
    values (new.id, requested_username)
    on conflict (user_id) do update
    set username = excluded.username;

    return new;
end;
$$;
