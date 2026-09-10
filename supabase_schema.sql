-- ========================================================
-- URLSNIP - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Copy and paste this script into your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql
-- ========================================================

-- 1. Create Links Table
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  original_url text not null,
  short_code text unique not null,
  title text,
  description text,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  clicks_count integer default 0 not null,
  clicks_log jsonb default '[]'::jsonb,
  is_protected boolean default false,
  passcode text,
  status text default 'active' check (status in ('active', 'expired', 'disabled')),
  is_favorite boolean default false,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- 2. Create Indexes for Links
create index if not exists idx_links_user_id on public.links(user_id);
create index if not exists idx_links_short_code on public.links(short_code);

-- 3. Enable RLS on Links
alter table public.links enable row level security;

-- Link Policies
create policy "Public can resolve short codes for redirect"
  on public.links for select
  using (true);

create policy "Users can create own links"
  on public.links for insert
  with check (auth.uid() = user_id);

create policy "Users can update own links"
  on public.links for update
  using (auth.uid() = user_id);

create policy "Users can delete own links"
  on public.links for delete
  using (auth.uid() = user_id);


-- ========================================================
-- 4. Create Bio Link Trees Table
-- ========================================================
create table if not exists public.bio_trees (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  slug text unique not null,
  title text not null,
  bio text default '',
  avatar_url text default '',
  theme text default 'indigo',
  items jsonb default '[]'::jsonb,
  views_count integer default 0 not null,
  clicks_log jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for Bio Trees
create index if not exists idx_bio_trees_user_id on public.bio_trees(user_id);
create index if not exists idx_bio_trees_slug on public.bio_trees(slug);

-- Enable RLS on Bio Trees
alter table public.bio_trees enable row level security;

-- Bio Tree Policies
create policy "Public can view bio trees"
  on public.bio_trees for select
  using (true);

create policy "Users can create bio trees"
  on public.bio_trees for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bio trees"
  on public.bio_trees for update
  using (auth.uid() = user_id);

create policy "Users can delete own bio trees"
  on public.bio_trees for delete
  using (auth.uid() = user_id);


-- ========================================================
-- 5. PUBLIC ANALYTICS RPC FUNCTIONS (SECURITY DEFINER)
-- Allows public visitors to record page views and link clicks
-- without needing full write permissions on tables.
-- ========================================================

-- A. Increment Bio Tree Page Views
create or replace function public.increment_bio_tree_view(tree_slug text, click_log jsonb default null)
returns void
language plpgsql
security definer
as $$
begin
  update public.bio_trees
  set 
    views_count = coalesce(views_count, 0) + 1,
    clicks_log = case
      when click_log is null then clicks_log
      when clicks_log is null or clicks_log = '[]'::jsonb then jsonb_build_array(click_log)
      else click_log || clicks_log
    end
  where lower(slug) = lower(tree_slug);
end;
$$;

-- B. Increment Bio Tree Link Clicks
create or replace function public.increment_bio_tree_link_click(tree_slug text, target_item_id text, click_log jsonb default null)
returns void
language plpgsql
security definer
as $$
declare
  current_items jsonb;
  updated_items jsonb;
begin
  select items into current_items
  from public.bio_trees
  where lower(slug) = lower(tree_slug);

  if current_items is not null then
    select jsonb_agg(
      case
        when (elem->>'id') = target_item_id or (elem->>'url') = target_item_id
        then jsonb_set(elem, '{clicksCount}', to_jsonb(coalesce((elem->>'clicksCount')::int, 0) + 1))
        else elem
      end
    )
    into updated_items
    from jsonb_array_elements(current_items) as elem;

    if updated_items is not null then
      update public.bio_trees
      set 
        items = updated_items,
        clicks_log = case
          when click_log is null then clicks_log
          when clicks_log is null or clicks_log = '[]'::jsonb then jsonb_build_array(click_log)
          else click_log || clicks_log
        end
      where lower(slug) = lower(tree_slug);
    end if;
  end if;
end;
$$;

-- C. Increment Short Link Click Count & Log
create or replace function public.increment_link_click(target_code text, click_log jsonb)
returns void
language plpgsql
security definer
as $$
begin
  update public.links
  set 
    clicks_count = coalesce(clicks_count, 0) + 1,
    clicks_log = case 
      when clicks_log is null or clicks_log = '[]'::jsonb then jsonb_build_array(click_log)
      else click_log || clicks_log
    end
  where lower(short_code) = lower(target_code);
end;
$$;
