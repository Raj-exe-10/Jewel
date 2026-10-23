import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[amore] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. Set them in .env for local or Vercel.',
  )
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseAnonKey || 'public-anon-key',
)

/** Current auth user id for audit fields (async). */
export async function getCurrentUid(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? 'unknown'
}
