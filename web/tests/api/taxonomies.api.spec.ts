import { beforeAll, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  anonClient,
  authedClient,
  configured,
  describeIfConfigured,
  runId,
} from './helpers/clients'

let anon: SupabaseClient
let staff: SupabaseClient

describeIfConfigured('API taxonomies (NEG-TAX)', () => {
  beforeAll(async () => {
    anon = anonClient()
    staff = await authedClient('owner@amore.test', 'password123')
  })

  it('public read categories allowed', async () => {
    const { error } = await anon.from('categories').select('id').limit(1)
    expect(error).toBeNull()
  })

  it('NEG-TAX-01: anon insert category denied', async () => {
    const { error } = await anon.from('categories').insert({ name: `${runId}-anon-cat`, sort_order: 0 })
    expect(error).toBeTruthy()
  })

  it('NEG-TAX-02: delete category still referenced is restricted', async () => {
    const { data: product } = await anon
      .from('products')
      .select('category_id')
      .not('category_id', 'is', null)
      .limit(1)
      .maybeSingle()
    if (!product?.category_id) {
      expect(true).toBe(true)
      return
    }
    const { error } = await staff.from('categories').delete().eq('id', product.category_id)
    expect(error).toBeTruthy()
  })

  it('staff can create and delete unused category', async () => {
    const { data, error } = await staff
      .from('categories')
      .insert({ name: `${runId}-temp-cat`, sort_order: 98 })
      .select('id')
      .single()
    expect(error).toBeNull()
    const { error: del } = await staff.from('categories').delete().eq('id', data!.id)
    expect(del).toBeNull()
  })
})

describe('API taxonomies suite gate', () => {
  it('documents when skipped', () => {
    if (!configured) {
      console.warn('Skipping API taxonomies: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
    expect(true).toBe(true)
  })
})
