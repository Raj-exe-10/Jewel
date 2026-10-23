-- Deterministic seed for local / CI (Auth users created by scripts/seed-supabase.ts)

-- Fixed taxonomy IDs
insert into public.categories (id, name, sort_order, created_at) values
  ('11111111-1111-1111-1111-111111111101', 'Necklace', 0, 0),
  ('11111111-1111-1111-1111-111111111102', 'Earring', 1, 0),
  ('11111111-1111-1111-1111-111111111103', 'Bangles', 2, 0),
  ('11111111-1111-1111-1111-111111111104', 'Rings', 3, 0),
  ('11111111-1111-1111-1111-111111111105', 'Bracelets', 4, 0),
  ('11111111-1111-1111-1111-111111111106', 'Earchains', 5, 0),
  ('11111111-1111-1111-1111-111111111107', 'Maang Tikka', 6, 0),
  ('11111111-1111-1111-1111-111111111108', 'Hathphool/Sheekhphool', 7, 0)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.collections (id, name, sort_order, created_at) values
  ('22222222-2222-2222-2222-222222222201', 'Jadau Kundan', 0, 0),
  ('22222222-2222-2222-2222-222222222202', 'Moissanite Kundan', 1, 0),
  ('22222222-2222-2222-2222-222222222203', 'Polki Moissanite', 2, 0),
  ('22222222-2222-2222-2222-222222222204', 'Diamond', 3, 0)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.style_tags (id, name, sort_order, created_at) values
  ('33333333-3333-3333-3333-333333333301', 'Festive', 0, 0),
  ('33333333-3333-3333-3333-333333333302', 'Bridal', 1, 0),
  ('33333333-3333-3333-3333-333333333303', 'Antique', 2, 0),
  ('33333333-3333-3333-3333-333333333304', 'Minimalistic', 3, 0),
  ('33333333-3333-3333-3333-333333333305', 'Long Sets', 4, 0)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

-- Sample products (skip if any product already exists)
do $$
declare
  product_count integer;
  photo text := 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&h=800&q=80';
  pid uuid;
begin
  select count(*) into product_count from public.products;
  if product_count > 0 then
    return;
  end if;

  insert into public.products (
    id, name, price_inr, description, photo_urls, media, category_id, collection_id,
    is_new_arrival, is_founder_favourite, is_statement_pick, is_bridal, style_group,
    created_at, updated_at, created_by, updated_by
  ) values
  (
    '44444444-4444-4444-4444-444444444401',
    'Kundan Choker',
    12500,
    'Handcrafted kundan choker for festive evenings.',
    jsonb_build_array(photo),
    jsonb_build_array(jsonb_build_object('id', 'm1', 'kind', 'image', 'url', photo, 'sortOrder', 0)),
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    true, true, false, true, 'traditional',
    0, 0, 'seed', 'seed'
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    'Chandbali Earrings',
    4800,
    'Classic chandbali pair with pearl drops.',
    jsonb_build_array(photo),
    jsonb_build_array(jsonb_build_object('id', 'm1', 'kind', 'image', 'url', photo, 'sortOrder', 0)),
    '11111111-1111-1111-1111-111111111102',
    '22222222-2222-2222-2222-222222222202',
    true, false, true, false, 'traditional',
    0, 0, 'seed', 'seed'
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    'Polki Cocktail Ring',
    6200,
    'Statement polki ring for modern looks.',
    jsonb_build_array(photo),
    jsonb_build_array(jsonb_build_object('id', 'm1', 'kind', 'image', 'url', photo, 'sortOrder', 0)),
    '11111111-1111-1111-1111-111111111104',
    '22222222-2222-2222-2222-222222222203',
    false, true, true, false, 'modern',
    0, 0, 'seed', 'seed'
  ),
  (
    '44444444-4444-4444-4444-444444444404',
    'Temple Haram',
    18900,
    'Temple-inspired layered haram.',
    jsonb_build_array(photo),
    jsonb_build_array(jsonb_build_object('id', 'm1', 'kind', 'image', 'url', photo, 'sortOrder', 0)),
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    false, false, false, true, 'traditional',
    0, 0, 'seed', 'seed'
  ),
  (
    '44444444-4444-4444-4444-444444444405',
    'Delicate Chain Bracelet',
    3200,
    'Everyday bracelet with a soft glow.',
    jsonb_build_array(photo),
    jsonb_build_array(jsonb_build_object('id', 'm1', 'kind', 'image', 'url', photo, 'sortOrder', 0)),
    '11111111-1111-1111-1111-111111111105',
    '22222222-2222-2222-2222-222222222204',
    true, false, false, false, 'modern',
    0, 0, 'seed', 'seed'
  );

  insert into public.product_style_tags (product_id, style_tag_id) values
    ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333302'),
    ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301'),
    ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301'),
    ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333304'),
    ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333302'),
    ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333304');
end $$;

insert into public.catalogue_config (id, products_per_row, updated_at, updated_by)
values ('collection_page', 10, 0, 'seed')
on conflict (id) do nothing;

insert into public.homepage_config (id, payload, updated_at, updated_by)
values (
  'business_profile',
  '{"whatsappNumberE164":"919999999999","instagramHandle":"amore.jewelry","address":"Amore Studio","mapUrl":"https://maps.google.com"}'::jsonb,
  0,
  'seed'
)
on conflict (id) do nothing;
