import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

// Runs against the Firebase Emulator Suite seeded via `npm run seed:emulator`
// (see specs/001-amore-jewelry-catalogue/quickstart.md). Exercises the two
// priority-1 user stories end-to-end: browsing/enquiring (US1) and the
// full manager CRUD lifecycle (US3).

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAMPLE_PHOTO = path.join(__dirname, 'fixtures', 'sample-product.jpg')

const OWNER_EMAIL = 'owner@amore.test'
const OWNER_PASSWORD = 'password123'

test.describe('Public storefront (US1)', () => {
  test('browses seeded products and can filter by search', async ({ page }) => {
    await page.goto('/')

    // exact: true avoids matching other headings that merely contain "Amore"
    // (e.g. the "The Hands Behind Amore" story section).
    await expect(page.getByRole('heading', { name: 'Amore', exact: true })).toBeVisible()
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()

    const initialCount = await page.locator('[data-testid="product-card"]').count()
    expect(initialCount).toBeGreaterThan(0)

    await page.getByPlaceholder('Search by name or keyword...').fill('zzz-no-such-product-zzz')
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()

    await page.getByPlaceholder('Search by name or keyword...').fill('')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
  })

  test('the WhatsApp enquiry link on a product opens wa.me with the product name', async ({ page }) => {
    await page.goto('/')
    const firstCard = page.locator('[data-testid="product-card"]').first()
    const link = firstCard.getByTestId('whatsapp-link')
    const href = await link.getAttribute('href')

    expect(href).toContain('https://wa.me/')
  })
})

test.describe('Manager panel (US3)', () => {
  test('staff can log in, create a product, see it on the public site, then delete it', async ({ page, context }) => {
    const productName = `E2E Test Piece ${Date.now()}`

    await page.goto('/admin/login')
    await page.locator('input[type="email"]').fill(OWNER_EMAIL)
    await page.locator('input[type="password"]').fill(OWNER_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/admin\/homepage$/)
    await page.getByTestId('nav-products').click()
    await expect(page).toHaveURL(/\/admin\/products$/)

    await page.getByTestId('add-product-button').click()
    await page.getByTestId('product-name').fill(productName)
    await page.getByTestId('product-description').fill('Created by the Playwright smoke test.')
    await page.getByTestId('product-price').fill('4200')
    await page.getByTestId('photo-input').setInputFiles(SAMPLE_PHOTO)
    await expect(page.locator('img[alt="Product photo"]')).toBeVisible({ timeout: 15000 })
    await page.getByRole('button', { name: 'Save Product' }).click()

    await expect(page.getByText(productName)).toBeVisible({ timeout: 15000 })

    const publicPage = await context.newPage()
    await publicPage.goto('/')
    await expect(publicPage.getByText(productName)).toBeVisible({ timeout: 15000 })
    await publicPage.close()

    page.once('dialog', (dialog) => dialog.accept())
    const productRow = page.locator('li', { hasText: productName })
    await productRow.getByRole('button', { name: 'Delete' }).click()
    await page.getByTestId('confirm-delete').click()

    await expect(page.getByText(productName)).toHaveCount(0)
  })

  test('unauthenticated visitors are redirected away from the manager panel', async ({ page }) => {
    await page.goto('/admin/homepage')
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test('staff can hide a homepage section and it disappears from the public storefront', async ({ page, context }) => {
    await page.goto('/admin/login')
    await page.locator('input[type="email"]').fill(OWNER_EMAIL)
    await page.locator('input[type="password"]').fill(OWNER_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/admin\/homepage$/)

    const aboutRow = page.locator('[data-testid="section-list"] li', { hasText: 'The Hands Behind Amore' })
    if ((await aboutRow.count()) === 0) {
      await page.getByTestId('restore-defaults').click()
      await page.getByTestId('confirm-dialog-confirm').click()
      await expect(page.locator('[data-testid="section-list"] li', { hasText: 'The Hands Behind Amore' })).toBeVisible({
        timeout: 15000,
      })
    }

    await page
      .locator('[data-testid="section-list"] li', { hasText: 'The Hands Behind Amore' })
      .getByTestId('toggle-section-visibility')
      .click()

    const publicPage = await context.newPage()
    await publicPage.goto('/')
    await expect(publicPage.getByRole('heading', { name: 'The Hands Behind Amore' })).toHaveCount(0, { timeout: 15000 })
    await publicPage.close()
  })
})
