-- Phase 1 schema: people, links, settings and the learning record.
--
-- Principles
--  * The learning record (learning_events) is append-only. Mastery, reviews and
--    parent insights are calculated from it by the engine (src/engine), so every
--    claim can be traced back to the answers behind it.
--  * Row-level security everywhere. A student sees only their own data; a parent
--    sees only the children linked to them; nobody can edit or delete attempts.
--  * No diagnosis or medical data is collected. Accessibility settings are
--    preferences anyone can choose.
--  * Curriculum and lesson content live in version-controlled files in Phase 1
--    (src/content). Content tables arrive with the editor in a later phase.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- people

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('parent', 'student', 'editor')),
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key references public.profiles (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.guardian_links (
  guardian_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (guardian_id, student_id)
);

-- Profile rows are created from the auth user. Role comes from app_metadata,
-- which only the server (service role) can set, so a sign-up form can never
-- create a student or editor. Public sign-ups are parents.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'role', 'parent'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Learner')
  );
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- The auth server can write app_metadata just after the insert, so keep the
-- role in step when the server changes it. Only app_metadata (server-only) counts.
create function public.sync_user_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.raw_app_meta_data ->> 'role' in ('parent', 'student', 'editor')
     and new.raw_app_meta_data ->> 'role' is distinct from old.raw_app_meta_data ->> 'role' then
    update public.profiles set role = new.raw_app_meta_data ->> 'role' where id = new.id;
  end if;
  return new;
end $$;

create trigger on_auth_user_role_changed
after update of raw_app_meta_data on auth.users
for each row execute function public.sync_user_role();

-- Is the current user a guardian of this student?
create function public.is_guardian_of(p_student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.guardian_links
    where guardian_id = auth.uid() and student_id = p_student
  );
$$;

create function public.current_role_name() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------- settings

create table public.accessibility_prefs (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- learning record

create table public.learning_events (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students (id) on delete cascade,
  at timestamptz not null default now(),
  skill_id text not null,
  kind text not null check (kind in ('attempt', 'lesson')),
  -- attempts
  mode text check (mode in ('guided', 'independent', 'check', 'review')),
  question_id text,
  answer text check (char_length(answer) <= 200),
  outcome text check (outcome in ('correct', 'not-simplified', 'incorrect')),
  correct boolean,
  assisted boolean,
  hints_used smallint check (hints_used between 0 and 10),
  misconception text,
  check_id uuid,
  duration_ms integer check (duration_ms between 0 and 3600000),
  -- lesson views
  stage text check (stage in ('introduction', 'teaching', 'guided', 'independent', 'check', 'review')),
  action text check (action in ('viewed', 'completed')),
  constraint attempt_fields check (
    kind <> 'attempt' or (mode is not null and question_id is not null and correct is not null and assisted is not null)
  ),
  constraint lesson_fields check (kind <> 'lesson' or (stage is not null and action is not null))
);

create index learning_events_student_at on public.learning_events (student_id, at);
create index learning_events_student_skill on public.learning_events (student_id, skill_id, at);

-- Append-only: block updates and deletes for everyone except account deletion (cascade).
create function public.block_event_changes() returns trigger
language plpgsql as $$
begin
  raise exception 'learning_events is append-only';
end $$;

create trigger learning_events_no_update
before update on public.learning_events
for each row execute function public.block_event_changes();

-- Where the student left off, so lessons resume on any device.
create table public.lesson_progress (
  student_id uuid not null references public.students (id) on delete cascade,
  skill_id text not null,
  stage text not null check (stage in ('introduction', 'teaching', 'guided', 'independent', 'check', 'review')),
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, skill_id)
);

-- Weekly goals set by a parent.
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  set_by uuid not null references public.profiles (id),
  week_start date not null,
  text text not null check (char_length(text) between 1 and 200),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- row-level security

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.guardian_links enable row level security;
alter table public.accessibility_prefs enable row level security;
alter table public.learning_events enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.goals enable row level security;

-- profiles: yourself, or a child you're linked to. Parents of a child see the child's name only.
create policy "read own or linked profile" on public.profiles for select
  using (id = auth.uid() or public.is_guardian_of(id)
         or exists (select 1 from public.guardian_links g where g.student_id = auth.uid() and g.guardian_id = profiles.id));
create policy "update own profile name" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = public.current_role_name());

-- students: inserted by the server only (service role) after checking the caller is a parent.
create policy "read own or linked student" on public.students for select
  using (id = auth.uid() or public.is_guardian_of(id));

create policy "read own links" on public.guardian_links for select
  using (guardian_id = auth.uid() or student_id = auth.uid());

create policy "own settings" on public.accessibility_prefs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "guardian reads child settings" on public.accessibility_prefs for select
  using (public.is_guardian_of(user_id));

-- learning record: only the student writes their own; student and guardians read.
create policy "student writes own events" on public.learning_events for insert
  with check (student_id = auth.uid() and public.current_role_name() = 'student');
create policy "read own or child events" on public.learning_events for select
  using (student_id = auth.uid() or public.is_guardian_of(student_id));

create policy "student manages own progress" on public.lesson_progress for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "guardian reads child progress" on public.lesson_progress for select
  using (public.is_guardian_of(student_id));

create policy "guardian manages goals" on public.goals for all
  using (public.is_guardian_of(student_id)) with check (public.is_guardian_of(student_id) and set_by = auth.uid());
create policy "student reads own goals" on public.goals for select
  using (student_id = auth.uid());
