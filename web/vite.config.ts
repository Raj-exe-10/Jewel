import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { pwaManifest } from './pwa.config.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: pwaManifest,
      workbox: {
        // App shell (HTML/JS/CSS/local icons): cache-first so the storefront
        // opens instantly offline once installed.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            // Supabase API/Storage: network-first so managers' catalogue edits
            // show up as soon as there's connectivity, falling back to the
            // last-seen catalogue when offline (FR-024/FR-027).
            urlPattern: ({ url }) =>
              url.hostname.includes('supabase.co') ||
              url.hostname.includes('supabase.in') ||
              url.hostname === 'localhost' ||
              url.hostname === '127.0.0.1',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'amore-supabase-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'picsum.photos',
            handler: 'CacheFirst',
            options: {
              cacheName: 'amore-placeholder-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
})
