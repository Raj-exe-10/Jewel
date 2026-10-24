/**
 * Seeds Auth staff users (and optional homepage sections) into a local or
 * hosted Supabase project. Requires SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage (local):
 *   npx supabase start
 *   set VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from `supabase status`
 *   npm run seed:local
 */
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_HOMEPAGE_SECTIONS, toFirestoreSection } from '../src/data/defaultSections'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required (never ship this to the browser).')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const staffAccounts = [
  { email: 'owner@amore.test', password: 'password123', displayName: 'Owner' },
  { email: 'staff1@amore.test', password: 'password123', displayName: 'Staff One' },
  { email: 'staff2@amore.test', password: 'password123', displayName: 'Staff Two' },
]

async function ensureUser(email: string, password: string, displayName: string) {
  const list = await admin.auth.admin.listUsers({ perPage: 200 })
  const existing = list.data.users.find((u) => u.email === email)
  if (existing) {
    await admin.from('staff').upsert({
      id: existing.id,
      email,
      display_name: displayName,
    })
    console.log(`Auth user exists: ${email}`)
    return
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })
  if (error) throw error
  if (data.user) {
    await admin.from('staff').upsert({
      id: data.user.id,
      email,
      display_name: displayName,
    })
  }
  console.log(`Created Auth user: ${email}`)
}

async function seedHomepageSections() {
  const force = process.env.FORCE_HOMEPAGE_LAYOUT === '1'
  const { count } = await admin.from('homepage_sections').select('*', { count: 'exact', head: true })
  if ((count ?? 0) > 0 && !force) {
    console.log('homepage_sections already populated; skipping (set FORCE_HOMEPAGE_LAYOUT=1 to replace)')
    return
  }

  if (force && (count ?? 0) > 0) {
    const { error: deleteError } = await admin.from('homepage_sections').delete().neq('id', '')
    if (deleteError) throw deleteError
    console.log('Cleared existing homepage_sections for layout replace')
  }

  const now = Date.now()
  const rows = DEFAULT_HOMEPAGE_SECTIONS.map((section) => {
    const input = toFirestoreSection(section)
    return {
      id: section.id,
      type: input.type,
      title: input.title,
      subtitle: input.subtitle ?? null,
      icon: input.icon ?? null,
      anchor_id: input.anchorId,
      sort_order: input.sortOrder,
      is_visible: input.isVisible,
      product_selection_mode: input.productSelectionMode ?? null,
      product_flag: input.productFlag ?? null,
      product_ids: input.productIds ?? [],
      content: input.content ?? {},
      created_at: now,
      updated_at: now,
      updated_by: 'seed',
    }
  })
  const { error } = await admin.from('homepage_sections').insert(rows)
  if (error) throw error
  console.log(`Seeded ${rows.length} homepage sections`)

  if (force) {
    const snapshot = DEFAULT_HOMEPAGE_SECTIONS.map((section, index) => ({
      ...toFirestoreSection(section),
      id: section.id,
      sortOrder: index,
    }))
    const { error: layoutError } = await admin.from('homepage_config').upsert({
      id: 'default_layout',
      payload: { sections: snapshot },
      updated_at: now,
      updated_by: 'seed',
    })
    if (layoutError) throw layoutError
    console.log('Updated homepage_config default_layout snapshot')
  }
}

async function main() {
  for (const account of staffAccounts) {
    await ensureUser(account.email, account.password, account.displayName)
  }
  await seedHomepageSections()
  console.log('Seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
