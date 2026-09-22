-- ============================================================================
--  DARBU SARAKSTS — Supabase datubāzes shēma
-- ============================================================================
--  Kā izmantot:
--    1. Supabase -> SQL Editor -> New query
--    2. Ielīmē VISU šo failu un nospied "Run"
--    3. Gatavs. Failu var palaist atkārtoti — tas neko nedzēš un vienlaikus
--       atjaunina vecāku versiju (pārceļ dalībniekus uz sadaļu līmeni).
--
--  SVARĪGĀKAIS PRINCIPS:
--    Cilvēkus uzaicina uz KONKRĒTU SADAĻU, nevis uz visu sarakstu.
--    Sadaļa, uz kuru neviens nav uzaicināts, ir privāta — to redz tikai
--    saraksta īpašnieks.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. TABULAS
-- ----------------------------------------------------------------------------

-- Lietotāja profils: redzamais vārds un izskata iestatījumi.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  settings     jsonb,
  created_at   timestamptz not null default now()
);

-- Vecākas versijas atjaunināšana
alter table public.profiles add column if not exists settings jsonb;

-- Saraksts. Tam ir viens īpašnieks; pārējie piekļūst atsevišķām sadaļām.
create table if not exists public.boards (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'Mans saraksts',
  owner_id   uuid not null references auth.users (id) on delete cascade,
  owner_name text,
  created_at timestamptz not null default now()
);
alter table public.boards add column if not exists owner_name text;

-- Sadaļas (kategorijas), kas redzamas augšā kā cilnes.
create table if not exists public.sections (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards (id) on delete cascade,
  name       text not null,
  icon       text not null default 'list',
  color      text not null default 'teal',
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

-- KAM IR PIEEJA KONKRĒTAI SADAĻAI (papildus saraksta īpašniekam).
create table if not exists public.section_members (
  section_id uuid not null references public.sections (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  email      text,
  name       text,
  created_at timestamptz not null default now(),
  primary key (section_id, user_id)
);

-- Neapstiprināti uzaicinājumi uz sadaļu (pēc e-pasta).
create table if not exists public.section_invitations (
  id         uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  email      text not null,
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (section_id, email)
);

-- Darbi.
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards (id) on delete cascade,
  section_id uuid not null references public.sections (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 300),
  note       text,
  due_date   date,
  priority   smallint not null default 2 check (priority in (1, 2, 3)), -- 1=augsta, 2=vidēja, 3=zema
  is_done    boolean not null default false,
  done_at    timestamptz,
  position   integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists sections_board_idx      on public.sections (board_id, position);
create index if not exists tasks_section_idx       on public.tasks (section_id, is_done, position);
create index if not exists tasks_board_idx         on public.tasks (board_id);
create index if not exists secmembers_user_idx     on public.section_members (user_id);
create index if not exists secinvites_email_idx    on public.section_invitations (lower(email));

-- ----------------------------------------------------------------------------
-- 2. PALĪGFUNKCIJAS (lai RLS politikas nesāktu atsaukties pašas uz sevi)
-- ----------------------------------------------------------------------------

-- Vai esmu šī saraksta īpašnieks?
create or replace function public.owns_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.boards b where b.id = p_board and b.owner_id = auth.uid());
$$;

-- Vai esmu tā saraksta īpašnieks, kuram pieder šī sadaļa?
create or replace function public.owns_section(p_section uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.sections s
    join public.boards b on b.id = s.board_id
    where s.id = p_section and b.owner_id = auth.uid()
  );
$$;

-- Vai drīkstu redzēt un lietot šo sadaļu? (īpašnieks vai uzaicinātais)
create or replace function public.can_section(p_section uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    exists (
      select 1 from public.sections s
      join public.boards b on b.id = s.board_id
      where s.id = p_section and b.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.section_members m
      where m.section_id = p_section and m.user_id = auth.uid()
    );
$$;

-- Vai šis saraksts man vispār ir redzams? (savs vai ir pieeja kādai tā sadaļai)
create or replace function public.can_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    exists (select 1 from public.boards b where b.id = p_board and b.owner_id = auth.uid())
    or exists (
      select 1 from public.sections s
      join public.section_members m on m.section_id = s.id
      where s.board_id = p_board and m.user_id = auth.uid()
    );
$$;

-- ----------------------------------------------------------------------------
-- 3. PĀREJA NO VECĀS VERSIJAS (kopīgošana bija visam sarakstam)
-- ----------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.board_members') is not null then
    execute $mig$
      insert into public.section_members (section_id, user_id, email, name)
      select s.id, m.user_id, m.email,
             (select p.display_name from public.profiles p where p.id = m.user_id)
      from public.board_members m
      join public.sections s on s.board_id = m.board_id
      join public.boards  b on b.id = m.board_id
      where b.owner_id <> m.user_id
      on conflict (section_id, user_id) do nothing
    $mig$;
    execute 'drop table public.board_members cascade';
  end if;

  if to_regclass('public.board_invitations') is not null then
    execute $mig2$
      insert into public.section_invitations (section_id, email, invited_by)
      select s.id, i.email, i.invited_by
      from public.board_invitations i
      join public.sections s on s.board_id = i.board_id
      on conflict (section_id, email) do nothing
    $mig2$;
    execute 'drop table public.board_invitations cascade';
  end if;
end $$;

-- Aizpilda īpašnieka vārdu sarakstiem, kas izveidoti ar vecāku versiju
update public.boards b
set owner_name = p.display_name
from public.profiles p
where p.id = b.owner_id and b.owner_name is distinct from p.display_name;

-- ----------------------------------------------------------------------------
-- 4. RINDU LĪMEŅA DROŠĪBA (RLS)
-- ----------------------------------------------------------------------------

alter table public.profiles            enable row level security;
alter table public.boards              enable row level security;
alter table public.sections            enable row level security;
alter table public.section_members     enable row level security;
alter table public.section_invitations enable row level security;
alter table public.tasks               enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (id = auth.uid());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- boards ---------------------------------------------------------------------
drop policy if exists boards_select on public.boards;
create policy boards_select on public.boards
  for select using (owner_id = auth.uid() or public.can_board(id));

drop policy if exists boards_insert on public.boards;
create policy boards_insert on public.boards for insert with check (owner_id = auth.uid());

drop policy if exists boards_update on public.boards;
create policy boards_update on public.boards
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists boards_delete on public.boards;
create policy boards_delete on public.boards for delete using (owner_id = auth.uid());

-- sections: redzēt drīkst uzaicinātie, bet veidot/labot/dzēst — tikai īpašnieks
drop policy if exists sections_all on public.sections;
drop policy if exists sections_select on public.sections;
create policy sections_select on public.sections for select using (public.can_section(id));

drop policy if exists sections_insert on public.sections;
create policy sections_insert on public.sections
  for insert with check (public.owns_board(board_id));

drop policy if exists sections_update on public.sections;
create policy sections_update on public.sections
  for update using (public.owns_board(board_id)) with check (public.owns_board(board_id));

drop policy if exists sections_delete on public.sections;
create policy sections_delete on public.sections
  for delete using (public.owns_board(board_id));

-- section_members ------------------------------------------------------------
drop policy if exists secmembers_select on public.section_members;
create policy secmembers_select on public.section_members
  for select using (public.can_section(section_id) or user_id = auth.uid());

drop policy if exists secmembers_insert on public.section_members;
create policy secmembers_insert on public.section_members
  for insert with check (public.owns_section(section_id) or user_id = auth.uid());

drop policy if exists secmembers_update on public.section_members;
create policy secmembers_update on public.section_members
  for update using (public.owns_section(section_id) or user_id = auth.uid())
  with check (public.owns_section(section_id) or user_id = auth.uid());

-- Izņemt cilvēku no sadaļas drīkst īpašnieks; pats sevi — vienmēr.
drop policy if exists secmembers_delete on public.section_members;
create policy secmembers_delete on public.section_members
  for delete using (public.owns_section(section_id) or user_id = auth.uid());

-- section_invitations --------------------------------------------------------
drop policy if exists secinvites_select on public.section_invitations;
create policy secinvites_select on public.section_invitations
  for select using (
    public.can_section(section_id)
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists secinvites_insert on public.section_invitations;
create policy secinvites_insert on public.section_invitations
  for insert with check (public.owns_section(section_id));

drop policy if exists secinvites_delete on public.section_invitations;
create policy secinvites_delete on public.section_invitations
  for delete using (
    public.owns_section(section_id)
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- tasks ----------------------------------------------------------------------
drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks
  for all using (public.can_section(section_id))
  with check (public.can_section(section_id));

-- ----------------------------------------------------------------------------
-- 5. AUTOMĀTIKA
-- ----------------------------------------------------------------------------

create or replace function public.tasks_set_done_at()
returns trigger language plpgsql as $$
begin
  if new.is_done is distinct from old.is_done then
    new.done_at := case when new.is_done then now() else null end;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_done_at on public.tasks;
create trigger tasks_done_at
  before update on public.tasks
  for each row execute function public.tasks_set_done_at();

-- ----------------------------------------------------------------------------
-- 6. FUNKCIJAS, KO IZSAUC APLIKĀCIJA
-- ----------------------------------------------------------------------------

-- Izveido jaunu sarakstu ar trim sākuma sadaļām (visas privātas).
create or replace function public.create_board(p_name text default 'Mans saraksts')
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_board uuid;
  v_uid   uuid := auth.uid();
  v_name  text;
begin
  if v_uid is null then raise exception 'Nav pieteikšanās'; end if;

  select p.display_name into v_name from public.profiles p where p.id = v_uid;

  insert into public.boards (name, owner_id, owner_name)
  values (coalesce(nullif(trim(p_name), ''), 'Mans saraksts'), v_uid, v_name)
  returning id into v_board;

  insert into public.sections (board_id, name, icon, color, position) values
    (v_board, 'Darbi mājās', 'home',   'teal',   0),
    (v_board, 'Būvniecība',  'bricks', 'amber',  1),
    (v_board, 'Teritorija',  'tree',   'green',  2);

  return v_board;
end;
$$;

-- Sagatavo lietotāju: profils, uzaicinājumu pieņemšana, vārda sinhronizācija,
-- un vismaz viens paša saraksts.
create or replace function public.bootstrap_user()
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_name  text;
  v_board uuid;
begin
  if v_uid is null then raise exception 'Nav pieteikšanās'; end if;

  select u.email into v_email from auth.users u where u.id = v_uid;

  insert into public.profiles (id, display_name)
  values (v_uid, nullif(split_part(coalesce(v_email, ''), '@', 1), ''))
  on conflict (id) do nothing;

  select p.display_name into v_name from public.profiles p where p.id = v_uid;

  -- Pieņem uzaicinājumus uz sadaļām
  insert into public.section_members (section_id, user_id, email, name)
  select i.section_id, v_uid, v_email, v_name
  from public.section_invitations i
  where lower(i.email) = lower(coalesce(v_email, ''))
  on conflict (section_id, user_id) do nothing;

  delete from public.section_invitations i
  where lower(i.email) = lower(coalesce(v_email, ''));

  -- Sinhronizē vārdu un e-pastu
  update public.section_members
  set email = v_email, name = v_name
  where user_id = v_uid and (email is distinct from v_email or name is distinct from v_name);

  update public.boards set owner_name = v_name
  where owner_id = v_uid and owner_name is distinct from v_name;

  -- Katram lietotājam ir savs saraksts
  select b.id into v_board from public.boards b
  where b.owner_id = v_uid order by b.created_at limit 1;

  if v_board is null then
    v_board := public.create_board('Mans saraksts');
  end if;

  return v_board;
end;
$$;

-- Maina lietotāja redzamo vārdu visur, kur tas parādās.
create or replace function public.set_display_name(p_name text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_name text;
begin
  if v_uid is null then raise exception 'Nav pieteikšanās'; end if;

  v_name := nullif(btrim(p_name), '');
  if v_name is null then raise exception 'Vārds nevar būt tukšs'; end if;
  v_name := left(v_name, 40);

  insert into public.profiles (id, display_name) values (v_uid, v_name)
  on conflict (id) do update set display_name = excluded.display_name;

  update public.section_members set name = v_name where user_id = v_uid;
  update public.boards set owner_name = v_name where owner_id = v_uid;

  return v_name;
end;
$$;

-- Uzaicina cilvēku uz VIENU SADAĻU. Ja viņš jau reģistrējies — pievieno uzreiz.
create or replace function public.invite_to_section(p_section uuid, p_email text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_email  text := lower(trim(p_email));
  v_target uuid;
  v_name   text;
begin
  if not public.owns_section(p_section) then
    raise exception 'Uzaicināt drīkst tikai saraksta īpašnieks';
  end if;

  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Nederīga e-pasta adrese';
  end if;

  select u.id into v_target from auth.users u where lower(u.email) = v_email;

  if v_target is not null then
    if v_target = auth.uid() then
      return 'self';
    end if;
    select p.display_name into v_name from public.profiles p where p.id = v_target;
    insert into public.section_members (section_id, user_id, email, name)
    values (p_section, v_target, v_email, v_name)
    on conflict (section_id, user_id) do nothing;
    return 'added';
  end if;

  insert into public.section_invitations (section_id, email, invited_by)
  values (p_section, v_email, auth.uid())
  on conflict (section_id, email) do nothing;
  return 'invited';
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. VECO FUNKCIJU SAKOPŠANA
-- ----------------------------------------------------------------------------

drop function if exists public.invite_member(uuid, text) cascade;
drop function if exists public.is_board_member(uuid) cascade;
drop function if exists public.is_board_owner(uuid) cascade;

-- ----------------------------------------------------------------------------
-- 8. TIESĪBAS UZ FUNKCIJĀM
-- ----------------------------------------------------------------------------

grant execute on function public.bootstrap_user()              to authenticated;
grant execute on function public.create_board(text)            to authenticated;
grant execute on function public.set_display_name(text)        to authenticated;
grant execute on function public.invite_to_section(uuid, text) to authenticated;
grant execute on function public.owns_board(uuid)              to authenticated;
grant execute on function public.owns_section(uuid)            to authenticated;
grant execute on function public.can_section(uuid)             to authenticated;
grant execute on function public.can_board(uuid)               to authenticated;

-- ----------------------------------------------------------------------------
-- 9. REALTIME (izmaiņas parādās visiem dalībniekiem uzreiz)
-- ----------------------------------------------------------------------------

do $$
begin
  begin alter publication supabase_realtime add table public.tasks;    exception when others then null; end;
  begin alter publication supabase_realtime add table public.sections; exception when others then null; end;
end $$;

-- ============================================================================
--  Gatavs.
-- ============================================================================
