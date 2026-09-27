create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  roles text[] not null default array['authority']::text[],
  created_at timestamptz not null default now(),
  constraint staff_roles_allowed check (roles <@ array['authority', 'admin']::text[] and cardinality(roles) > 0)
);

create table if not exists public.staff_invites (
  email text primary key,
  roles text[] not null default array['authority']::text[],
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  constraint staff_invites_roles_allowed check (roles <@ array['authority']::text[] and cardinality(roles) = 1)
);

create table if not exists public.reports (
  id uuid primary key,
  incident_category text not null check (incident_category in ('violence', 'harassment', 'theft', 'safety-hazard', 'suspicious-activity', 'other')),
  incident_date text not null,
  location_mode text not null check (location_mode in ('gps', 'approximate', 'manual')),
  location_label text,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  description text not null check (char_length(description) between 20 and 4000),
  supporting_details text check (supporting_details is null or char_length(supporting_details) <= 1600),
  retrieval_code_hash text not null unique check (retrieval_code_hash ~ '^[0-9a-f]{64}$'),
  retrieval_code_hint text not null,
  status text not null default 'received' check (status in ('received', 'under-review', 'action-taken', 'closed')),
  ai_analysis jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  retention_until timestamptz not null,
  check (retention_until > submitted_at and retention_until <= submitted_at + interval '91 days')
);

create table if not exists public.report_updates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  kind text not null check (kind in ('status_change', 'note')),
  officer_user_id uuid not null references auth.users(id),
  officer_label text not null,
  old_status text,
  new_status text,
  note text check (note is null or char_length(note) <= 1600),
  created_at timestamptz not null default now()
);

create index if not exists reports_retention_submitted_idx on public.reports (retention_until, submitted_at desc);
create index if not exists report_updates_report_created_idx on public.report_updates (report_id, created_at desc);

create or replace function public.is_clearline_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = (select auth.uid()))
$$;

create or replace function public.is_clearline_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = (select auth.uid()) and 'admin' = any(s.roles))
$$;

create or replace function public.attach_invited_staff()
returns trigger language plpgsql security definer set search_path = '' as $$
declare invitation public.staff_invites%rowtype;
begin
  select * into invitation from public.staff_invites where lower(email) = lower(new.email) limit 1;
  if found then
    insert into public.staff(user_id, email, roles) values (new.id, lower(new.email), invitation.roles)
    on conflict (user_id) do update set email = excluded.email, roles = excluded.roles;
    delete from public.staff_invites where lower(email) = lower(new.email);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_attach_staff on auth.users;
create trigger on_auth_user_created_attach_staff after insert on auth.users
for each row execute function public.attach_invited_staff();

create or replace function public.apply_staff_invite()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.staff(user_id, email, roles)
  select u.id, lower(u.email), new.roles from auth.users u where lower(u.email) = lower(new.email)
  on conflict (user_id) do update set email = excluded.email, roles = excluded.roles;
  return new;
end;
$$;

drop trigger if exists on_staff_invite_created on public.staff_invites;
create trigger on_staff_invite_created after insert or update on public.staff_invites
for each row execute function public.apply_staff_invite();

alter table public.staff enable row level security;
alter table public.staff_invites enable row level security;
alter table public.reports enable row level security;
alter table public.report_updates enable row level security;

revoke all on public.staff, public.staff_invites, public.reports, public.report_updates from anon, authenticated;
grant select, delete on public.staff to authenticated;
grant select, insert, update, delete on public.staff_invites to authenticated;
grant select, insert on public.reports to anon;
grant select on public.reports to authenticated;
grant update (status) on public.reports to authenticated;
grant select, insert on public.report_updates to authenticated;

drop policy if exists staff_read_self_or_admin on public.staff;
create policy staff_read_self_or_admin on public.staff for select to authenticated
using (user_id = (select auth.uid()) or public.is_clearline_admin());
drop policy if exists staff_remove_admin on public.staff;
create policy staff_remove_admin on public.staff for delete to authenticated
using (public.is_clearline_admin() and user_id <> (select auth.uid()));

drop policy if exists staff_invites_admin_access on public.staff_invites;
create policy staff_invites_admin_access on public.staff_invites for all to authenticated
using (public.is_clearline_admin()) with check (public.is_clearline_admin());

drop policy if exists reports_public_submit on public.reports;
create policy reports_public_submit on public.reports for insert to anon, authenticated
with check (status = 'received' and submitted_at between now() - interval '5 minutes' and now() + interval '5 minutes' and retention_until <= now() + interval '91 days');
drop policy if exists reports_staff_read on public.reports;
create policy reports_staff_read on public.reports for select to authenticated
using (public.is_clearline_staff());
drop policy if exists reports_staff_update on public.reports;
create policy reports_staff_update on public.reports for update to authenticated
using (public.is_clearline_staff()) with check (public.is_clearline_staff());

drop policy if exists report_updates_staff_read on public.report_updates;
create policy report_updates_staff_read on public.report_updates for select to authenticated
using (public.is_clearline_staff());
drop policy if exists report_updates_staff_add on public.report_updates;
create policy report_updates_staff_add on public.report_updates for insert to authenticated
with check (public.is_clearline_staff() and officer_user_id = (select auth.uid()));

create or replace function public.retrieve_anonymous_report(p_retrieval_code_hash text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', r.id,
    'category', r.incident_category,
    'incidentDate', r.incident_date,
    'locationMode', r.location_mode,
    'locationLabel', r.location_label,
    'status', r.status,
    'analysis', r.ai_analysis,
    'submittedAt', r.submitted_at,
    'retentionUntil', r.retention_until
  )
  from public.reports r
  where r.retrieval_code_hash = p_retrieval_code_hash
    and r.retention_until > now()
    and p_retrieval_code_hash ~ '^[0-9a-f]{64}$'
  limit 1
$$;

revoke all on function public.retrieve_anonymous_report(text) from public;
grant execute on function public.retrieve_anonymous_report(text) to anon, authenticated;
revoke all on function public.is_clearline_staff() from public;
revoke all on function public.is_clearline_admin() from public;
revoke all on function public.attach_invited_staff() from public;
revoke all on function public.apply_staff_invite() from public;
grant execute on function public.is_clearline_staff() to authenticated;
grant execute on function public.is_clearline_admin() to authenticated;
