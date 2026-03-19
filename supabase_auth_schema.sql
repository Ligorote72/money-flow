-- 1. Agregar columna user_id a todas las tablas (nullable al principio)
alter table transactions add column user_id uuid default auth.uid() references auth.users;
alter table banks add column user_id uuid default auth.uid() references auth.users;
alter table goals add column user_id uuid default auth.uid() references auth.users;
alter table subscriptions add column user_id uuid default auth.uid() references auth.users;
alter table debts add column user_id uuid default auth.uid() references auth.users;

-- 2. Habilitar RLS (Seguridad a nivel de fila) en cada tabla
alter table transactions enable row level security;
alter table banks enable row level security;
alter table goals enable row level security;
alter table subscriptions enable row level security;
alter table debts enable row level security;
alter table businesses enable row level security;

-- 3. Crear políticas para que cada usuario solo vea y maneje su información
create policy "Users can only see their own transactions" on transactions for all using (auth.uid() = user_id);
create policy "Users can only see their own banks" on banks for all using (auth.uid() = user_id);
create policy "Users can only see their own goals" on goals for all using (auth.uid() = user_id);
create policy "Users can only see their own subscriptions" on subscriptions for all using (auth.uid() = user_id);
create policy "Users can only see their own debts" on debts for all using (auth.uid() = user_id);
create policy "Users can only see their own businesses" on businesses for all using (auth.uid() = user_id);

-- 4. Estructura de tabla para negocios (si no existe)
-- create table if not exists businesses (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid references auth.users not null,
--   name text not null,
--   type text,
--   quickActions jsonb default '[]'::jsonb,
--   created_at timestamp with time zone default now()
-- );
