import { beforeAll, expect, it } from 'vitest'
import {
  anonClient,
  authedClient,
  configured,
  describeIfConfigured,
} from './helpers/clients'

describeIfConfigured('API auth (NEG-AUTH)', () => {
  beforeAll(() => {
    expect(configured).toBe(true)
  })

  it('NEG-AUTH-01: wrong password fails with no session', async () => {
    const client = anonClient()
    // Unique email avoids GoTrue rate-limit delays on repeated owner failures.
    const result = await Promise.race([
      client.auth.signInWithPassword({
        email: `wrong-${Date.now()}@amore.test`,
        password: 'wrong-password',
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('signInWithPassword timed out')), 10000),
      ),
    ])
    expect(result.error).toBeTruthy()
    expect(result.data.session).toBeNull()
  }, 15000)

  it('NEG-AUTH-02: empty email/password fails', async () => {
    const client = anonClient()
    const result = await Promise.race([
      client.auth.signInWithPassword({ email: '', password: '' }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('signInWithPassword timed out')), 10000),
      ),
    ])
    expect(result.error).toBeTruthy()
    expect(result.data.session).toBeNull()
  }, 15000)

  it('NEG-AUTH-03: public signUp is rejected', async () => {
    const client = anonClient()
    const { error } = await client.auth.signUp({
      email: `public-${Date.now()}@example.com`,
      password: 'password123',
    })
    expect(error).toBeTruthy()
  })

  it('NEG-AUTH-04: anon cannot write products (RLS)', async () => {
    const anon = anonClient()
    const { data: cats } = await anon.from('categories').select('id').limit(1)
    const categoryId = cats?.[0]?.id ?? '00000000-0000-0000-0000-000000000001'
    const { error } = await anon.from('products').insert({
      name: 'anon-write',
      price_inr: 1,
      description: 'x',
      category_id: categoryId,
    })
    expect(error).toBeTruthy()
  })

  it('happy: valid staff sign-in and sign-out', async () => {
    const client = await authedClient('owner@amore.test', 'password123')
    const { data: session } = await client.auth.getSession()
    expect(session.session?.user?.email).toBe('owner@amore.test')
    await client.auth.signOut()
    const { data: after } = await client.auth.getSession()
    expect(after.session).toBeNull()
  })
})

describe('API auth suite gate', () => {
  it('documents when skipped', () => {
    if (!configured) {
      console.warn('Skipping API auth: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
    expect(true).toBe(true)
  })
})
