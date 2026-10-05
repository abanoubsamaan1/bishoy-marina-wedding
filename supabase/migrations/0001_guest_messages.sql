-- Guest messages for the wedding invitation
-- Run this once in the Supabase SQL editor (or with `supabase db push`).

create table if not exists public.guest_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) between 1 and 50),
  message    text not null check (char_length(btrim(message)) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists guest_messages_created_at_idx
  on public.guest_messages (created_at desc);

-- Row level security: the browser only ever talks to this table with the public
-- anon key, so reads and inserts are explicitly allowed and everything else is
-- denied by default.
alter table public.guest_messages enable row level security;

drop policy if exists "guest_messages are readable by everyone" on public.guest_messages;
create policy "guest_messages are readable by everyone"
  on public.guest_messages for select
  to anon, authenticated
  using (true);

drop policy if exists "guests may leave a message" on public.guest_messages;
create policy "guests may leave a message"
  on public.guest_messages for insert
  to anon, authenticated
  with check (true);

-- no edits and no deletes from the client
drop policy if exists "guest_messages cannot be updated" on public.guest_messages;
drop policy if exists "guest_messages cannot be deleted" on public.guest_messages;

-- realtime: push every new row to the open invitations (safe to re-run)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'guest_messages'
  ) then
    alter publication supabase_realtime add table public.guest_messages;
  end if;
end
$$;
