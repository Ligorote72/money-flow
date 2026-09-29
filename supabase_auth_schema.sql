-- ==============================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS Y SEGURIDAD RLS PARA MONEYFLOW (SUPABASE)
-- ==============================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase.

-- 1. TABLA DE TRANSACCIONES PERSONALES
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  amount numeric not null,
  description text not null,
  category text,
  type text not null check (type in ('income', 'expense', 'transfer')),
  date timestamp with time zone default now() not null,
  account_id text,
  to_account_id text,
  created_at timestamp with time zone default now()
);

-- 2. TABLA DE BANCOS Y BILLETERAS
create table if not exists banks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- 3. TABLA DE METAS Y PRESUPUESTOS
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric default 0 not null,
  created_at timestamp with time zone default now()
);

-- 4. TABLA DE GASTOS FIJOS / SUSCRIPCIONES
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  name text not null,
  amount numeric not null,
  day integer not null check (day between 1 and 31),
  category text,
  account_id text,
  last_processed text,
  created_at timestamp with time zone default now()
);

-- 5. TABLA DE DEUDAS Y PRESTAMOS
create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  person text not null,
  amount numeric not null,
  type text not null check (type in ('owe', 'lend')),
  paid boolean default false not null,
  date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- 6. TABLA DE ALCANCIAS / COCHINITOS
create table if not exists piggy_banks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  name text not null,
  target numeric not null,
  saved numeric default 0 not null,
  icon text default '🐷',
  created_at timestamp with time zone default now()
);

-- 7. TABLA DE NEGOCIOS (Fincas cafeteras, ganadería, comercio, servicios)
create table if not exists businesses (
  id text primary key,
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  name text not null,
  type text,
  quick_actions jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 8. TABLA DE TRANSACCIONES DE NEGOCIOS / FINCAS
create table if not exists business_transactions (
  id text primary key,
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  business_id text not null,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  date timestamp with time zone default now() not null,
  created_at timestamp with time zone default now()
);

-- 9. TABLA DE TRABAJADORES DE FINCAS Y NEGOCIOS (Recolectores de café, jornaleros)
create table if not exists business_workers (
  id text primary key,
  user_id uuid default auth.uid() references auth.users on delete cascade not null,
  business_id text not null,
  name text not null,
  type text not null, -- 'recolector_arroba', 'recolector', 'jornal', etc.
  rate numeric default 0,
  created_at timestamp with time zone default now()
);

-- ==============================================================================
-- HABILITACION DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table transactions enable row level security;
alter table banks enable row level security;
alter table goals enable row level security;
alter table subscriptions enable row level security;
alter table debts enable row level security;
alter table piggy_banks enable row level security;
alter table businesses enable row level security;
alter table business_transactions enable row level security;
alter table business_workers enable row level security;

-- ==============================================================================
-- POLITICAS DE SEGURIDAD (Cada usuario solo accede a sus propios datos)
-- ==============================================================================
drop policy if exists "Users can only access own transactions" on transactions;
create policy "Users can only access own transactions" on transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access own banks" on banks;
create policy "Users can only access own banks" on banks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access own goals" on goals;
create policy "Users can only access own goals" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access own subscriptions" on subscriptions;
create policy "Users can only access own subscriptions" on subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access own debts" on debts;
create policy "Users can only access own debts" on debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access own piggy_banks" on piggy_banks;
create policy "Users can only access own piggy_banks" on piggy_banks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access own businesses" on businesses;
create policy "Users can only access own businesses" on businesses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access own business_transactions" on business_transactions;
create policy "Users can only access own business_transactions" on business_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access own business_workers" on business_workers;
create policy "Users can only access own business_workers" on business_workers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
