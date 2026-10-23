import { expect, test } from '@playwright/test'
import { gotoCollectionWithProducts } from '../helpers/auth'

test.describe('GATE 4 public journeys', () => {
  test('filter chip chain on collection narrows then clears', async ({ page }) => {
    await gotoCollectionWithProducts(page)

    const chip = page.locator('[data-testid^="filter-chip-"]').first()
    if ((await chip.count()) === 0) test.skip()
    await chip.click()
    const cards = page.locator('[data-testid="product-card"]')
    const empty = page.getByTestId('empty-state')
    await expect(cards.first().or(empty)).toBeVisible({ timeout: 10_000 })

    await chip.click()
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('wishlist enquire-all opens wa.me with wishlist copy', async ({ page }) => {
    await gotoCollectionWithProducts(page)
    await page.locator('[data-testid="wishlist-toggle"]').first().click()

    await page.getByTestId('wishlist-link').click()
    await expect(page.getByTestId('wishlist-drawer')).toBeVisible()
    const enquire = page.getByTestId('wishlist-enquire-all')
    await expect(enquire).toBeVisible()
    const href = await enquire.getAttribute('href')
    expect(href).toContain('https://wa.me/')
    expect(decodeURIComponent(href!)).toMatch(/wishlist/i)
  })

  test('UI-NEG-07: deep link to missing product shows unavailable', async ({ page }) => {
    await page.goto('/product/00000000-0000-0000-0000-00000000dead')
    await expect(page.getByTestId('product-unavailable')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('product-unavailable')).toContainText(/no longer available/i)
  })
})
