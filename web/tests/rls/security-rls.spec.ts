/**
 * RLS / Storage / Auth API parity suite (replaces Firebase rules unit tests).
 *
 * Requires a running Supabase (local or hosted) with migrations applied and
 * seed users created (`npm run seed:local`).
 *
 * Env:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY (optional; used to seed a category for FK inserts)
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { beforeAll, describe, expect, it } from 'vitest'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const configured = Boolean(url && anonKey)
const describeIf = configured ? describe : describe.skip

let anon: SupabaseClient
let staffA: SupabaseClient
let staffB: SupabaseClient
let categoryId: string

async function authedClient(email: string, password: string) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

beforeAll(async () => {
  if (!configured) return
  anon = createClient(url, anonKey, { auth: { persistSession: false } })
  staffA = await authedClient('owner@amore.test', 'password123')
  staffB = await authedClient('staff2@amore.test', 'password123')

  const { data: cats } = await anon.from('categories').select('id').limit(1)
  categoryId = cats?.[0]?.id ?? ''
  if (!categoryId && serviceKey) {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data } = await admin
      .from('categories')
      .insert({ name: 'RLS Test Category', sort_order: 99 })
      .select('id')
      .single()
    categoryId = data?.id ?? ''
  }
})

describeIf('Auth API', () => {
  it('API-AUTH-01: sign in valid staff', async () => {
    const client = createClient(url, anonKey, { auth: { persistSession: false } })
    const { data, error } = await client.auth.signInWithPassword({
      email: 'owner@amore.test',
      password: 'password123',
    })
    expect(error).toBeNull()
    expect(data.user?.email).toBe('owner@amore.test')
  })

  it('API-AUTH-02: wrong password fails', async () => {
    const client = createClient(url, anonKey, { auth: { persistSession: false } })
    const { data, error } = await client.auth.signInWithPassword({
      email: 'owner@amore.test',
      password: 'wrong-password',
    })
    expect(error).toBeTruthy()
    expect(data.session).toBeNull()
  })

  it('API-AUTH-03: sign out clears session', async () => {
    const client = await authedClient('owner@amore.test', 'password123')
    await client.auth.signOut()
    const { data } = await client.auth.getSession()
    expect(data.session).toBeNull()
  })

  it('API-AUTH-04: public signup disabled', async () => {
    const client = createClient(url, anonKey, { auth: { persistSession: false } })
    const { error } = await client.auth.signUp({
      email: `public-${Date.now()}@example.com`,
      password: 'password123',
    })
    expect(error).toBeTruthy()
  })
})

describeIf('Products RLS', () => {
  it('API-PRD-01: anon SELECT allowed', async () => {
    const { error } = await anon.from('products').select('id').limit(1)
    expect(error).toBeNull()
  })

  it('API-PRD-02: anon INSERT denied', async () => {
    const { error } = await anon.from('products').insert({
      name: 'Nope',
      price_inr: 1,
      description: 'x',
      category_id: categoryId || '00000000-0000-0000-0000-000000000001',
    })
    expect(error).toBeTruthy()
  })

  it('API-PRD-03..06: auth CRUD and equal permissions', async () => {
    expect(categoryId).toBeTruthy()
    const { data: created, error: createError } = await staffA
      .from('products')
      .insert({
        name: `RLS Product ${Date.now()}`,
        price_inr: 100,
        description: 'rls test',
        photo_urls: [],
        media: [],
        category_id: categoryId,
      })
      .select('id')
      .single()
    expect(createError).toBeNull()
    const id = created!.id as string

    const { error: updateB } = await staffB
      .from('products')
      .update({ name: 'Edited by B' })
      .eq('id', id)
    expect(updateB).toBeNull()

    const { data: publicRead } = await anon.from('products').select('name').eq('id', id).maybeSingle()
    expect(publicRead?.name).toBe('Edited by B')

    const { error: delError } = await staffA.from('products').delete().eq('id', id)
    expect(delError).toBeNull()
  })
})

describeIf('Taxonomies + homepage + config RLS', () => {
  it('API-TAX: public read / auth write on categories', async () => {
    const { error: readError } = await anon.from('categories').select('id').limit(1)
    expect(readError).toBeNull()
    const { error: writeError } = await anon.from('categories').insert({ name: 'anon-cat', sort_order: 0 })
    expect(writeError).toBeTruthy()
  })

  it('API-HP: homepage_sections public read / auth write', async () => {
    const { error: readError } = await anon.from('homepage_sections').select('id').limit(1)
    expect(readError).toBeNull()
    const { error: writeError } = await anon.from('homepage_sections').insert({
      id: `anon-${Date.now()}`,
      type: 'about',
      title: 'Nope',
      anchor_id: 'x',
      content: {},
    })
    expect(writeError).toBeTruthy()
  })

  it('API-CFG: anon read configs; anon write denied; auth upsert ok', async () => {
    const { error: readError } = await anon.from('homepage_config').select('id').limit(1)
    expect(readError).toBeNull()
    const { error: writeAnon } = await anon.from('catalogue_config').upsert({
      id: 'collection_page',
      products_per_row: 3,
    })
    expect(writeAnon).toBeTruthy()
    const { error: writeAuth } = await staffA.from('catalogue_config').upsert({
      id: 'collection_page',
      products_per_row: 5,
      updated_by: 'rls',
    })
    expect(writeAuth).toBeNull()
  })
})

describeIf('Staff mirror RLS', () => {
  it('API-STF: authenticated read; cannot write another uid', async () => {
    const { error: readError } = await staffA.from('staff').select('id').limit(1)
    expect(readError).toBeNull()

    const { data: me } = await staffA.auth.getUser()
    const { data: other } = await staffB.auth.getUser()
    if (!me.user || !other.user) return

    const { error: writeOther } = await staffA.from('staff').upsert({
      id: other.user.id,
      email: 'hijack@amore.test',
    })
    expect(writeOther).toBeTruthy()
  })
})

describeIf('Storage policies', () => {
  it('API-STO-02: anon upload denied', async () => {
    const blob = new Blob(['x'], { type: 'image/png' })
    const { error } = await anon.storage.from('product-photos').upload(`anon-${Date.now()}.png`, blob, {
      contentType: 'image/png',
    })
    expect(error).toBeTruthy()
  })

  it('API-STO-03: auth upload + public read path', async () => {
    const path = `rls/${Date.now()}.png`
    const blob = new Blob(['png'], { type: 'image/png' })
    const { error } = await staffA.storage.from('product-photos').upload(path, blob, {
      contentType: 'image/png',
    })
    expect(error).toBeNull()
    const { data } = staffA.storage.from('product-photos').getPublicUrl(path)
    expect(data.publicUrl).toContain('product-photos')
    await staffA.storage.from('product-photos').remove([path])
  })
})

describe('RLS suite gate', () => {
  it('documents when skipped', () => {
    if (!configured) {
      console.warn(
        'Skipping live RLS tests: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (and seed staff users).',
      )
    }
    expect(true).toBe(true)
  })
})
