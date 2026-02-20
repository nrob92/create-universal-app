-- ============================================================================
-- 1. Profiles (auto-created on signup)
-- ============================================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  onboarded     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile + updated_at trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 2. Plans (public pricing catalog — used on Pricing page)
-- ============================================================================
create table public.plans (
  id                    serial primary key,
  name                  text not null,                    -- "Pro Monthly", "Pro Yearly"
  slug                  text unique not null,             -- "pro-monthly", "pro-yearly"
  price_monthly         numeric,
  price_yearly          numeric,
  currency              text default 'usd',
  description           text,
  features              jsonb default '[]'::jsonb,       -- ["Unlimited projects", "Priority support"]
  is_active             boolean default true,
  created_at            timestamptz default now()
);

alter table public.plans enable row level security;
create policy "Anyone can read plans" on public.plans for select using (true);

-- ============================================================================
-- 3. Subscriptions (unified Stripe + RevenueCat)
-- ============================================================================
create table public.subscriptions (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  plan_id                     integer references public.plans(id),
  status                      text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'inactive')),
  provider                    text not null check (provider in ('stripe', 'revenuecat')),
  provider_subscription_id    text,                         -- Stripe sub ID or RevenueCat original_transaction_id
  current_period_start        timestamptz,
  current_period_end          timestamptz,
  cancel_at                   timestamptz,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Only Edge Functions / webhooks (service role) can write
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_provider_id on public.subscriptions(provider_subscription_id);

create trigger on_subscription_updated
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 4. Delete User Function (Invoked from Client via RPC)
-- ============================================================================
create or replace function public.delete_user()
returns void as $$
begin
  -- Deleting from auth.users will automatically cascade and delete the profile
  -- and subscriptions if they have "on delete cascade" configured.
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;
