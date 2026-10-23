import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
export const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
export const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const configured = Boolean(url && anonKey)
export const describeIfConfigured = configured ? describe : describe.skip

export const runId = `qa-${Date.now()}`

export function anonClient(): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function authedClient(email: string, password: string): Promise<SupabaseClient> {
  const client = anonClient()
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

export function serviceClient(): SupabaseClient | null {
  if (!serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function resolveCategoryId(anon: SupabaseClient): Promise<string> {
  const { data: cats } = await anon.from('categories').select('id').limit(1)
  if (cats?.[0]?.id) return cats[0].id as string

  const admin = serviceClient()
  if (!admin) return ''
  const { data } = await admin
    .from('categories')
    .insert({ name: `${runId}-category`, sort_order: 99 })
    .select('id')
    .single()
  return (data?.id as string) ?? ''
}
