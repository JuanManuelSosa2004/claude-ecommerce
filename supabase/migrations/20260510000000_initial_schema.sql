-- ============================================================
-- TABLAS
-- ============================================================

create table public.services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  price_cents      integer not null check (price_cents >= 0),
  duration_minutes integer check (duration_minutes > 0),
  slug             text unique,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create table public.availability (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references public.services (id) on delete cascade,
  day_of_week  integer not null check (day_of_week between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  check (end_time > start_time)
);

create table public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  service_id            uuid not null references public.services (id) on delete restrict,
  booked_at             timestamptz not null,
  status                text not null default 'pending'
                          check (status in ('pending', 'confirmed', 'cancelled')),
  stripe_session_id     text unique,
  stripe_payment_intent text,
  created_at            timestamptz not null default now()
);

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  updated_at  timestamptz
);

-- ============================================================
-- ÍNDICES
-- ============================================================

create index on public.availability (service_id);
create index on public.bookings (user_id);
create index on public.bookings (service_id);
create index on public.bookings (booked_at);
create index on public.services (slug);

-- ============================================================
-- RLS
-- ============================================================

alter table public.services    enable row level security;
alter table public.availability enable row level security;
alter table public.bookings    enable row level security;
alter table public.profiles    enable row level security;

-- services: lectura pública, escritura solo service_role
create policy "services_select_public"
  on public.services for select
  using (true);

-- availability: lectura pública
create policy "availability_select_public"
  on public.availability for select
  using (true);

-- bookings: el usuario ve y gestiona solo sus propios turnos
create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_update_own"
  on public.bookings for update
  using (auth.uid() = user_id);

-- profiles: el usuario lee y edita solo su propio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrar usuario
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
