import { afterAll, beforeAll, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  anonClient,
  authedClient,
  configured,
  describeIfConfigured,
  resolveCategoryId,
  runId,
} from './helpers/clients'
import { negativeProductPayloads, validProductRow } from './helpers/payloads'

let anon: SupabaseClient
let staffA: SupabaseClient
let staffB: SupabaseClient
let categoryId: string
const createdIds: string[] = []

describeIfConfigured('API products CRUD + negatives (NEG-PRD)', () => {
  beforeAll(async () => {
    anon = anonClient()
    staffA = await authedClient('owner@amore.test', 'password123')
    staffB = await authedClient('staff2@amore.test', 'password123')
    categoryId = await resolveCategoryId(anon)
    expect(categoryId).toBeTruthy()
  })

  afterAll(async () => {
    if (!staffA) return
    for (const id of createdIds) {
      await staffA.from('products').delete().eq('id', id)
    }
    await staffA.from('products').delete().like('name', `${runId}%`)
  })

  it('anon SELECT allowed', async () => {
    const { error } = await anon.from('products').select('id').limit(1)
    expect(error).toBeNull()
  })

  it('NEG-PRD-06: anon INSERT denied', async () => {
    const { error } = await anon.from('products').insert(validProductRow(categoryId))
    expect(error).toBeTruthy()
  })

  it('NEG-PRD-01: missing name rejected', async () => {
    const { error } = await staffA.from('products').insert(negativeProductPayloads.missingName(categoryId))
    expect(error).toBeTruthy()
  })

  it('NEG-PRD-02: negative price rejected', async () => {
    const { error } = await staffA
      .from('products')
      .insert(negativeProductPayloads.negativePrice(categoryId))
    expect(error).toBeTruthy()
  })

  it('NEG-PRD-03: oversized price rejected or coerced — assert no silent accept as-is', async () => {
    const { data, error } = await staffA
      .from('products')
      .insert(negativeProductPayloads.hugePrice(categoryId))
      .select('id, price_inr')
      .maybeSingle()
    if (!error && data?.id) {
      createdIds.push(data.id as string)
      // Postgres integer max is ~2e9; 1e15 must not persist as that float
      expect(data.price_inr).not.toBe(1e15)
    } else {
      expect(error).toBeTruthy()
    }
  })

  it('NEG-PRD-04: random category UUID FK rejected', async () => {
    const { error } = await staffA.from('products').insert(negativeProductPayloads.badCategory())
    expect(error).toBeTruthy()
  })

  it('NEG-PRD-05: invalid style_group rejected', async () => {
    const { error } = await staffA
      .from('products')
      .insert(negativeProductPayloads.badStyleGroup(categoryId))
    expect(error).toBeTruthy()
  })

  it('NEG-PRD-09: media null rejected', async () => {
    const { error } = await staffA.from('products').insert(negativeProductPayloads.nullMedia(categoryId))
    expect(error).toBeTruthy()
  })

  it('NEG-PRD-07: Staff B can update Staff A row (equal staff perms)', async () => {
    const { data: created, error: createError } = await staffA
      .from('products')
      .insert(validProductRow(categoryId, { name: `${runId}-shared` }))
      .select('id')
      .single()
    expect(createError).toBeNull()
    const id = created!.id as string
    createdIds.push(id)

    const { error: updateB } = await staffB.from('products').update({ name: `${runId}-by-b` }).eq('id', id)
    expect(updateB).toBeNull()

    const { data: publicRead } = await anon.from('products').select('name').eq('id', id).maybeSingle()
    expect(publicRead?.name).toBe(`${runId}-by-b`)
  })

  it('NEG-PRD-08: concurrent dual update — both succeed; last write readable', async () => {
    const { data: created } = await staffA
      .from('products')
      .insert(validProductRow(categoryId, { name: `${runId}-race` }))
      .select('id')
      .single()
    const id = created!.id as string
    createdIds.push(id)

    const [a, b] = await Promise.all([
      staffA.from('products').update({ name: `${runId}-race-a` }).eq('id', id),
      staffB.from('products').update({ name: `${runId}-race-b` }).eq('id', id),
    ])
    expect(a.error).toBeNull()
    expect(b.error).toBeNull()

    const { data: final } = await anon.from('products').select('name').eq('id', id).single()
    expect([`${runId}-race-a`, `${runId}-race-b`]).toContain(final?.name)
  })

  it('NEG-PRD-10: delete missing id does not throw', async () => {
    const { error } = await staffA
      .from('products')
      .delete()
      .eq('id', '00000000-0000-0000-0000-0000000000aa')
    expect(error).toBeNull()
  })

  it('happy: staff create + delete', async () => {
    const { data, error } = await staffA
      .from('products')
      .insert(validProductRow(categoryId, { name: `${runId}-happy` }))
      .select('id')
      .single()
    expect(error).toBeNull()
    const { error: del } = await staffA.from('products').delete().eq('id', data!.id)
    expect(del).toBeNull()
  })
})

describe('API products suite gate', () => {
  it('documents when skipped', () => {
    if (!configured) {
      console.warn('Skipping API products: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
    expect(true).toBe(true)
  })
})
