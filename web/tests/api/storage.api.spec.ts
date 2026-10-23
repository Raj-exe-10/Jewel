import { afterAll, beforeAll, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  anonClient,
  authedClient,
  configured,
  describeIfConfigured,
  runId,
} from './helpers/clients'
import { oversizedBlob } from './helpers/payloads'

let anon: SupabaseClient
let staff: SupabaseClient
const uploaded: string[] = []

describeIfConfigured('API storage (NEG-STO)', () => {
  beforeAll(async () => {
    anon = anonClient()
    staff = await authedClient('owner@amore.test', 'password123')
  })

  afterAll(async () => {
    if (uploaded.length) {
      await staff.storage.from('product-photos').remove(uploaded)
    }
  })

  it('NEG-STO-01: anon upload denied', async () => {
    const blob = new Blob(['x'], { type: 'image/png' })
    const { error } = await anon.storage
      .from('product-photos')
      .upload(`qa/${runId}/anon.png`, blob, { contentType: 'image/png' })
    expect(error).toBeTruthy()
  })

  it('NEG-STO-02: auth upload text/plain as image denied by MIME policy', async () => {
    const blob = new Blob(['not-an-image'], { type: 'text/plain' })
    const path = `qa/${runId}/plain.txt`
    const { error } = await staff.storage.from('product-photos').upload(path, blob, {
      contentType: 'text/plain',
    })
    expect(error).toBeTruthy()
  })

  it('NEG-STO-03: oversized blob (>5MB image) denied', async () => {
    const path = `qa/${runId}/huge.png`
    const { error } = await staff.storage.from('product-photos').upload(path, oversizedBlob(5_500_000), {
      contentType: 'image/png',
    })
    expect(error).toBeTruthy()
  })

  it('NEG-STO-04: anon delete does not remove staff object', async () => {
    const path = `qa/${runId}/owned.png`
    const blob = new Blob(['png'], { type: 'image/png' })
    const { error: up } = await staff.storage.from('product-photos').upload(path, blob, {
      contentType: 'image/png',
    })
    expect(up).toBeNull()
    uploaded.push(path)

    // Storage client may return error=null even when RLS blocks; assert object remains.
    await anon.storage.from('product-photos').remove([path])
    const folder = `qa/${runId}`
    const { data: listed, error: listError } = await staff.storage.from('product-photos').list(folder)
    expect(listError).toBeNull()
    expect(listed?.some((f) => f.name === 'owned.png')).toBe(true)
  })

  it('NEG-STO-05: auth delete qa object allowed + public URL still resolvable shape', async () => {
    const path = `qa/${runId}/deletable.png`
    const blob = new Blob(['png'], { type: 'image/png' })
    const { error: up } = await staff.storage.from('product-photos').upload(path, blob, {
      contentType: 'image/png',
    })
    expect(up).toBeNull()
    const { data } = staff.storage.from('product-photos').getPublicUrl(path)
    expect(data.publicUrl).toContain('product-photos')

    const { error: del } = await staff.storage.from('product-photos').remove([path])
    expect(del).toBeNull()
  })
})

describe('API storage suite gate', () => {
  it('documents when skipped', () => {
    if (!configured) {
      console.warn('Skipping API storage: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
    expect(true).toBe(true)
  })
})
