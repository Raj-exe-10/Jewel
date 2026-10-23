-- Amore jewellery catalogue — initial schema, RLS, storage
-- Parity with specs/001-amore-jewelry-catalogue/contracts/security-rules.md

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Taxonomies
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table public.style_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ---------------------------------------------------------------------------
-- Products (+ junction for style tags)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_inr integer not null check (price_inr >= 0),
  description text not null,
  photo_urls jsonb not null default '[]'::jsonb,
  media jsonb not null default '[]'::jsonb,
  category_id uuid not null references public.categories (id) on delete restrict,
  collection_id uuid references public.collections (id) on delete restrict,
  is_new_arrival boolean not null default false,
  is_founder_favourite boolean not null default false,
  is_statement_pick boolean not null default false,
  is_bridal boolean not null default false,
  style_group text check (style_group is null or style_group in ('traditional', 'modern')),
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_by text not null default 'unknown',
  updated_by text not null default 'unknown'
);

create table public.product_style_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  style_tag_id uuid not null references public.style_tags (id) on delete restrict,
  primary key (product_id, style_tag_id)
);

-- ---------------------------------------------------------------------------
-- Homepage CMS
-- ---------------------------------------------------------------------------
create table public.homepage_sections (
  id text primary key,
  type text not null,
  title text not null,
  subtitle text,
  icon text,
  anchor_id text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  product_selection_mode text,
  product_flag text,
  product_ids uuid[] not null default '{}',
  content jsonb not null default '{}'::jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_by text not null default 'unknown'
);

create table public.homepage_config (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_by text not null default 'unknown'
);

create table public.catalogue_config (
  id text primary key,
  products_per_row integer not null default 10
    check (products_per_row >= 1 and products_per_row <= 10),
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_by text not null default 'unknown'
);

-- Optional staff mirror (Firebase staff/{uid} parity)
create table public.staff (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_authenticated()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null;
$$;

-- Enable RLS
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.style_tags enable row level security;
alter table public.products enable row level security;
alter table public.product_style_tags enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.homepage_config enable row level security;
alter table public.catalogue_config enable row level security;
alter table public.staff enable row level security;

-- Public read / auth write (catalogue + homepage + configs)
create policy "categories_select_public" on public.categories for select using (true);
create policy "categories_write_auth" on public.categories for all using (public.is_authenticated()) with check (public.is_authenticated());

create policy "collections_select_public" on public.collections for select using (true);
create policy "collections_write_auth" on public.collections for all using (public.is_authenticated()) with check (public.is_authenticated());

create policy "style_tags_select_public" on public.style_tags for select using (true);
create policy "style_tags_write_auth" on public.style_tags for all using (public.is_authenticated()) with check (public.is_authenticated());

create policy "products_select_public" on public.products for select using (true);
create policy "products_write_auth" on public.products for all using (public.is_authenticated()) with check (public.is_authenticated());

create policy "product_style_tags_select_public" on public.product_style_tags for select using (true);
create policy "product_style_tags_write_auth" on public.product_style_tags for all using (public.is_authenticated()) with check (public.is_authenticated());

create policy "homepage_sections_select_public" on public.homepage_sections for select using (true);
create policy "homepage_sections_write_auth" on public.homepage_sections for all using (public.is_authenticated()) with check (public.is_authenticated());

create policy "homepage_config_select_public" on public.homepage_config for select using (true);
create policy "homepage_config_write_auth" on public.homepage_config for all using (public.is_authenticated()) with check (public.is_authenticated());

create policy "catalogue_config_select_public" on public.catalogue_config for select using (true);
create policy "catalogue_config_write_auth" on public.catalogue_config for all using (public.is_authenticated()) with check (public.is_authenticated());

-- Staff: auth read; write own row only
create policy "staff_select_auth" on public.staff for select using (public.is_authenticated());
create policy "staff_insert_own" on public.staff for insert with check (auth.uid() = id);
create policy "staff_update_own" on public.staff for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "staff_delete_own" on public.staff for delete using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.collections;
alter publication supabase_realtime add table public.style_tags;
alter publication supabase_realtime add table public.product_style_tags;
alter publication supabase_realtime add table public.homepage_sections;
alter publication supabase_realtime add table public.homepage_config;
alter publication supabase_realtime add table public.catalogue_config;

-- ---------------------------------------------------------------------------
-- Storage buckets + policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-photos', 'product-photos', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif','image/avif']),
  ('product-videos', 'product-videos', true, 52428800, array['video/mp4','video/webm']),
  ('section-media', 'section-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif','image/avif']),
  ('section-videos', 'section-videos', true, 52428800, array['video/mp4','video/webm'])
on conflict (id) do nothing;

create policy "public_read_product_photos" on storage.objects for select using (bucket_id = 'product-photos');
create policy "auth_write_product_photos" on storage.objects for insert with check (bucket_id = 'product-photos' and auth.uid() is not null);
create policy "auth_update_product_photos" on storage.objects for update using (bucket_id = 'product-photos' and auth.uid() is not null);
create policy "auth_delete_product_photos" on storage.objects for delete using (bucket_id = 'product-photos' and auth.uid() is not null);

create policy "public_read_product_videos" on storage.objects for select using (bucket_id = 'product-videos');
create policy "auth_write_product_videos" on storage.objects for insert with check (bucket_id = 'product-videos' and auth.uid() is not null);
create policy "auth_update_product_videos" on storage.objects for update using (bucket_id = 'product-videos' and auth.uid() is not null);
create policy "auth_delete_product_videos" on storage.objects for delete using (bucket_id = 'product-videos' and auth.uid() is not null);

create policy "public_read_section_media" on storage.objects for select using (bucket_id = 'section-media');
create policy "auth_write_section_media" on storage.objects for insert with check (bucket_id = 'section-media' and auth.uid() is not null);
create policy "auth_update_section_media" on storage.objects for update using (bucket_id = 'section-media' and auth.uid() is not null);
create policy "auth_delete_section_media" on storage.objects for delete using (bucket_id = 'section-media' and auth.uid() is not null);

create policy "public_read_section_videos" on storage.objects for select using (bucket_id = 'section-videos');
create policy "auth_write_section_videos" on storage.objects for insert with check (bucket_id = 'section-videos' and auth.uid() is not null);
create policy "auth_update_section_videos" on storage.objects for update using (bucket_id = 'section-videos' and auth.uid() is not null);
create policy "auth_delete_section_videos" on storage.objects for delete using (bucket_id = 'section-videos' and auth.uid() is not null);
