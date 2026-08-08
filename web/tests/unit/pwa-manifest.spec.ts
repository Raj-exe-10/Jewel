import { describe, expect, it } from 'vitest'
import { pwaManifest } from '../../pwa.config'

// FR-027/US4: the app must be installable to a home screen as "Amore" with
// a standalone (chrome-less) display, per quickstart.md Scenario 4.
describe('PWA manifest configuration', () => {
  it('sets the app name to Amore', () => {
    expect(pwaManifest.name).toBe('Amore')
    expect(pwaManifest.short_name).toBe('Amore')
  })

  it('renders as a standalone installed app', () => {
    expect(pwaManifest.display).toBe('standalone')
  })

  it('declares at least one 192x192 and one 512x512 icon, including a maskable variant', () => {
    const sizes = pwaManifest.icons.map((icon) => icon.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
    expect(pwaManifest.icons.some((icon) => icon.purpose?.includes('maskable'))).toBe(true)
  })

  it('sets theme and background colors matching the brand palette', () => {
    expect(pwaManifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(pwaManifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})
