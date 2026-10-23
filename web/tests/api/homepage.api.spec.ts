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

describeIfConfigured('API homepage + config (NEG-HP / NEG-CFG)', () => {
  beforeAll(async () => {
    anon = anonClient()
    staff = await authedClient('owner@amore.test', 'password123')
  })

  it('homepage_sections public read allowed', async () => {
    const { error } = await anon.from('homepage_sections').select('id').limit(1)
    expect(error).toBeNull()
  })

  it('NEG-HP-01: anon upsert section denied', async () => {
    const { error } = await anon.from('homepage_sections').insert({
      id: `${runId}-anon-section`,
      type: 'about',
      title: 'Nope',
      anchor_id: 'x',
      content: {},
    })
    expect(error).toBeTruthy()
  })

  it('NEG-CFG-01: products_per_row 0 and 11 rejected', async () => {
    const zero = await staff.from('catalogue_config').upsert({
      id: 'collection_page',
      products_per_row: 0,
    })
    expect(zero.error).toBeTruthy()

    const eleven = await staff.from('catalogue_config').upsert({
      id: 'collection_page',
      products_per_row: 11,
    })
    expect(eleven.error).toBeTruthy()
  })

  it('NEG-CFG-02: anon upsert business_profile denied', async () => {
    const { error } = await anon.from('homepage_config').upsert({
      id: 'business_profile',
      payload: { phone: '000' },
    })
    expect(error).toBeTruthy()
  })

  it('auth upsert catalogue_config within bounds ok', async () => {
    const { error } = await staff.from('catalogue_config').upsert({
      id: 'collection_page',
      products_per_row: 5,
      updated_by: 'api-qa',
    })
    expect(error).toBeNull()
  })
})

describe('API homepage suite gate', () => {
  it('documents when skipped', () => {
    if (!configured) {
      console.warn('Skipping API homepage: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
    expect(true).toBe(true)
  })
})
