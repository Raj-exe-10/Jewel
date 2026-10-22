/**
 * Soft-launch post-deploy smoke checks (Phase 5 checklist helpers).
 * Usage: node scripts/verify-soft-launch.mjs https://<project-id>.web.app
 */
const base = (process.argv[2] || '').replace(/\/$/, '')

if (!base || !/^https:\/\//.test(base)) {
  console.error('Usage: node scripts/verify-soft-launch.mjs https://<project-id>.web.app')
  process.exit(1)
}

const paths = ['/', '/admin/login', '/manifest.webmanifest']

async function check(path) {
  const url = `${base}${path}`
  const res = await fetch(url, { redirect: 'follow' })
  const ok = res.ok
  console.log(`${ok ? 'OK' : 'FAIL'} ${res.status} ${url}`)
  return ok
}

const results = []
for (const path of paths) {
  try {
    results.push(await check(path))
  } catch (err) {
    console.log(`FAIL  --- ${base}${path} (${err.message})`)
    results.push(false)
  }
}

console.log('')
console.log('Manual checklist (cannot automate):')
console.log('- [ ] Search/filters + WhatsApp product enquire on phone')
console.log('- [ ] Admin add/edit/delete syncs to public site without redeploy')
console.log('- [ ] PWA Add to Home Screen on Android + iOS')
console.log('- [ ] Firebase Console: still on Spark; usage near zero')
console.log('- [ ] Prefer images / short videos for Storage quota')

process.exit(results.every(Boolean) ? 0 : 1)
