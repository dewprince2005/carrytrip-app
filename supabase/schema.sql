-- Supabase Database Schema for Carrytrip

-- 1. PROFILES TABLE
-- Stores public user information linked to auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  roles text[] not null default '{}', -- 'sender', 'carrier', 'admin'
  rating_avg numeric(3, 2) not null default 0.0,
  rating_count integer not null default 0,
  completed_deliveries_count integer not null default 0,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for Profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- Creates a public profile entry when a user signs up via auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_roles text[];
begin
  -- Parse roles array from user metadata if provided, otherwise default to empty
  if new.raw_user_meta_data ? 'roles' then
    select array(
      select jsonb_array_elements_text(new.raw_user_meta_data->'roles')
    ) into user_roles;
  else
    user_roles := '{}'::text[];
  end if;

  insert into public.profiles (id, name, phone, roles, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    new.raw_user_meta_data->>'phone',
    user_roles,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. ROUTES TABLE
-- Stores trips posted by travelers who can act as carriers
create table public.routes (
  id uuid default gen_random_uuid() primary key,
  carrier_id uuid references public.profiles(id) on delete cascade not null,
  origin text not null,
  destination text not null,
  travel_date date not null,
  price_per_kg numeric(10, 2) not null default 5.00,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for routes
alter table public.routes enable row level security;

-- RLS Policies for Routes
create policy "Routes are viewable by authenticated users"
  on public.routes for select
  to authenticated
  using ( true );

create policy "Carriers can insert their own routes"
  on public.routes for insert
  to authenticated
  with check ( auth.uid() = carrier_id );

create policy "Carriers can update/delete their own routes"
  on public.routes for all
  to authenticated
  using ( auth.uid() = carrier_id );

-- 4. BOOKINGS TABLE
-- Stores parcel delivery orders and matching status
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  route_id uuid references public.routes(id) on delete set null,
  carrier_id uuid references public.profiles(id) on delete set null,
  title text not null,
  weight numeric(5, 2) not null, -- in kg
  origin text not null,
  destination text not null,
  price numeric(10, 2) not null,
  status text not null default 'pending', -- 'pending', 'accepted', 'paid', 'in_transit', 'delivered', 'cancelled'
  pickup_otp text not null,
  delivery_otp text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for bookings
alter table public.bookings enable row level security;

-- RLS Policies for Bookings
create policy "Users can view bookings they are involved in"
  on public.bookings for select
  to authenticated
  using ( auth.uid() = sender_id or auth.uid() = carrier_id );

create policy "Senders can insert bookings"
  on public.bookings for insert
  to authenticated
  with check ( auth.uid() = sender_id );

create policy "Involved parties can update bookings"
  on public.bookings for update
  to authenticated
  using ( auth.uid() = sender_id or auth.uid() = carrier_id );

