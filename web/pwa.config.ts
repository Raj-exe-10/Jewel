import type { ManifestOptions } from 'vite-plugin-pwa'

// Shared between vite.config.ts (build-time PWA plugin) and
// tests/unit/pwa-manifest.spec.ts (T062) so the installable-app contract
// (FR-027 / Constitution Principle VI) is verified without a full build.
export const pwaManifest: Partial<ManifestOptions> = {
  name: 'Amore',
  short_name: 'Amore',
  description: 'Amore — designer jewelry, made to be loved. Browse and enquire on WhatsApp.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  theme_color: '#262220',
  background_color: '#faf6f0',
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    {
      src: '/icons/icon-maskable-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
}
