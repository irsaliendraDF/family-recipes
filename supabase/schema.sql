-- Family Recipes schema. Paste this whole file into the Supabase SQL editor
-- (left sidebar, SQL Editor, New query) and press Run. Safe to run twice.

create table if not exists public.recipes (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.pantry_items (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_plans (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.suggestions (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.recipes enable row level security;
alter table public.pantry_items enable row level security;
alter table public.meal_plans enable row level security;
alter table public.suggestions enable row level security;

-- Only signed-in family members can touch anything. Sign-ups get disabled
-- in the dashboard once the family accounts exist (step 6 of the setup guide).
drop policy if exists "family full access" on public.recipes;
create policy "family full access" on public.recipes
  for all to authenticated using (true) with check (true);

drop policy if exists "family full access" on public.pantry_items;
create policy "family full access" on public.pantry_items
  for all to authenticated using (true) with check (true);

drop policy if exists "family full access" on public.meal_plans;
create policy "family full access" on public.meal_plans
  for all to authenticated using (true) with check (true);

drop policy if exists "family full access" on public.suggestions;
create policy "family full access" on public.suggestions
  for all to authenticated using (true) with check (true);
