-- Parent Insight — Supabase schema and row-level security
-- Apply this file in Supabase SQL Editor as a project administrator.
-- No service-role key is required by the browser application.
create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  display_name text not null default '',
  role text not null default 'teacher' check (role in ('owner', 'admin', 'teacher')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  phase text not null default 'Fase C',
  academic_year text not null default '2026/2027',
  semester text not null default 'Ganjil' check (semester in ('Ganjil', 'Genap')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (workspace_id, name, academic_year, semester)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  nis text not null,
  nisn text,
  full_name text not null,
  gender text check (gender in ('L', 'P')),
  birth_place text,
  birth_date date,
  religion text,
  blood_type text,
  address text,
  parent_name text,
  parent_relation text,
  parent_phone text,
  parent_occupation text,
  mother_name text,
  mother_phone text,
  mother_occupation text,
  profile_data jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, nis)
);

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  file_name text not null,
  academic_year text not null,
  semester text not null check (semester in ('Ganjil', 'Genap')),
  assessment_type text not null,
  source_sheet text,
  row_count integer not null default 0 check (row_count >= 0),
  status text not null default 'preview' check (status in ('preview', 'validated', 'committed', 'rejected')),
  summary jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  academic_year text not null,
  semester text not null check (semester in ('Ganjil', 'Genap')),
  assessment_type text not null,
  subject_name text not null,
  component_name text not null default 'Nilai',
  score numeric(5,2) check (score >= 0 and score <= 100),
  source_row integer,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.parent_interviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  interview_date date,
  status text not null default 'draf' check (status in ('belum', 'terjadwal', 'draf', 'selesai')),
  study_habit text,
  interests text,
  challenges jsonb not null default '[]'::jsonb,
  home_obstacles text,
  physical_facility text,
  parent_support_agreed jsonb not null default '[]'::jsonb,
  teacher_notes text,
  extra_data jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  priority_need text not null,
  triangulation_reason text,
  smart_goal text,
  teacher_strategy text,
  family_support text,
  person_in_charge text,
  start_date date,
  evaluation_date date,
  indicator text,
  status text not null default 'Direncanakan' check (status in ('Direncanakan', 'Berjalan', 'Selesai', 'Perlu Ditinjau')),
  evaluation_score numeric(5,2) check (evaluation_score >= 0 and evaluation_score <= 100),
  evaluation_notes text,
  created_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_workspace on public.profiles(workspace_id);
create index if not exists idx_classes_workspace on public.classes(workspace_id);
create index if not exists idx_students_workspace_class on public.students(workspace_id, class_id);
create index if not exists idx_assessment_student_year on public.assessment_records(workspace_id, student_id, academic_year, semester);
create index if not exists idx_interviews_student on public.parent_interviews(workspace_id, student_id);
create index if not exists idx_followups_student on public.follow_ups(workspace_id, student_id);
create index if not exists idx_import_batches_workspace on public.import_batches(workspace_id, created_at desc);

-- Create a profile for each new authenticated user. Workspace membership is assigned
-- by an administrator; a new signup cannot choose its own workspace or role.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    'teacher'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_parent_insight on auth.users;
create trigger on_auth_user_created_parent_insight
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- RLS on every tenant-scoped table.
alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.import_batches enable row level security;
alter table public.assessment_records enable row level security;
alter table public.parent_interviews enable row level security;
alter table public.follow_ups enable row level security;

drop policy if exists "workspace members can view workspace" on public.workspaces;
create policy "workspace members can view workspace" on public.workspaces
for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.workspace_id = workspaces.id));

drop policy if exists "users can view own profile" on public.profiles;
create policy "users can view own profile" on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists "users can update own display profile" on public.profiles;
create policy "users can update own display profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- Note: do not grant browser users permission to change workspace_id or role at column level.
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

drop policy if exists "workspace members manage classes" on public.classes;
create policy "workspace members manage classes" on public.classes
for all to authenticated
using (workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid()))
with check (workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid()));

drop policy if exists "workspace members manage students" on public.students;
create policy "workspace members manage students" on public.students
for all to authenticated
using (workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid()))
with check (workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid()));

drop policy if exists "workspace members manage import batches" on public.import_batches;
create policy "workspace members manage import batches" on public.import_batches
for all to authenticated
using (workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid()))
with check (
  workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid())
  and created_by = auth.uid()
);

drop policy if exists "workspace members manage assessment records" on public.assessment_records;
create policy "workspace members manage assessment records" on public.assessment_records
for all to authenticated
using (workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid()))
with check (
  workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid())
  and created_by = auth.uid()
  and exists (select 1 from public.students s where s.id = student_id and s.workspace_id = assessment_records.workspace_id)
);

drop policy if exists "workspace members manage interviews" on public.parent_interviews;
create policy "workspace members manage interviews" on public.parent_interviews
for all to authenticated
using (workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid()))
with check (
  workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid())
  and created_by = auth.uid()
  and exists (select 1 from public.students s where s.id = student_id and s.workspace_id = parent_interviews.workspace_id)
);

drop policy if exists "workspace members manage followups" on public.follow_ups;
create policy "workspace members manage followups" on public.follow_ups
for all to authenticated
using (workspace_id = (select p.workspace_id from public.profiles p where p.id = auth.uid()))
with check (
  workspace_id = (select p.workspace_id from public.profiles p where s.id = student_id and s.workspace_id = follow_ups.workspace_id)
);
