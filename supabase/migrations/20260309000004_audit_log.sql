-- Audit log table
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text not null default '',
  action      text not null check (action in ('create','update','delete')),
  table_name  text not null,
  record_id   text not null,
  label       text not null default '',
  created_at  timestamptz not null default now()
);

-- Index for fast recent-first queries
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- RLS
alter table public.audit_logs enable row level security;

-- Authenticated users can insert their own entries
create policy "authenticated can insert audit_logs"
  on public.audit_logs for insert
  to authenticated
  with check (user_id = auth.uid());

-- Only admins / dg can read
create policy "admin can read audit_logs"
  on public.audit_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'dg')
    )
  );
