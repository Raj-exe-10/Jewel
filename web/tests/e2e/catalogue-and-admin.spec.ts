import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import {
  fillMinimalProduct,
  goAdmin,
  gotoCollectionWithProducts,
  loginAs,
  openNewProductForm,
  OWNER_EMAIL,
  STAFF2_EMAIL,
} from './helpers/auth'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAMPLE_PHOTO = path.join(__dirname, 'fixtures', 'sample-product.jpg')

test.describe('Public storefront', () => {
  test('E2E-PUB-01/02: browses seeded products and can filter by search', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /^amore$/i })).toBeVisible()

    await gotoCollectionWithProducts(page)
    await page.getByTestId('collection-search').locator('input').fill('zzz-no-such-product-zzz')
    await expect(page.getByTestId('empty-state')).toBeVisible({ timeout: 10_000 })
  })

  test('E2E-PUB-05: WhatsApp enquiry link opens wa.me', async ({ page }) => {
    await page.goto('/')
    const href = await page.getByTestId('whatsapp-link').first().getAttribute('href')
    expect(href).toContain('https://wa.me/')
  })

  test('E2E-PUB-04: product detail page loads from a card', async ({ page }) => {
    await gotoCollectionWithProducts(page)
    await page.locator('[data-testid="product-detail-link"]').first().click()
    await expect(page).toHaveURL(/\/product\//)
    await expect(page.getByTestId('whatsapp-link').first()).toBeVisible()
  })

  test('E2E-PUB-12: in-app Back and browser Back return to the previous page', async ({ page }) => {
    await gotoCollectionWithProducts(page)
    await page.locator('[data-testid="product-detail-link"]').first().click()
    await expect(page).toHaveURL(/\/product\//)

    await page.getByTestId('product-back-link').click()
    await expect(page).toHaveURL(/\/collection/)

    await page.locator('[data-testid="product-detail-link"]').first().click()
    await expect(page).toHaveURL(/\/product\//)
    await page.goBack()
    await expect(page).toHaveURL(/\/collection/)
  })

  test('E2E-PUB-08: wishlist toggle persists in localStorage', async ({ page }) => {
    await gotoCollectionWithProducts(page)
    const heart = page.locator('[data-testid="wishlist-toggle"]').first()
    await heart.click()
    const stored = await page.evaluate(() => localStorage.getItem('amore:wishlist'))
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored!)).not.toHaveLength(0)
  })

  test('E2E-PUB-09: collection page loads', async ({ page }) => {
    await gotoCollectionWithProducts(page)
  })
})

test.describe('Auth / admin shell', () => {
  test('E2E-ADM-01: unauthenticated visitors are redirected', async ({ page }) => {
    await page.goto('/admin/homepage')
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test('E2E-ADM-02: owner can log in', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL)
  })

  test('E2E-ADM-03: bad password stays on login', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('input[type="email"]').fill(OWNER_EMAIL)
    await page.locator('input[type="password"]').fill('wrong-password')
    await page.locator('input[type="password"]').press('Enter')
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 15_000 })
  })

  test('E2E-ADM-05: staff2 has the same admin access', async ({ page }) => {
    await loginAs(page, STAFF2_EMAIL)
    await goAdmin(page, 'Products')
  })
})

test.describe('Products CRUD + homepage', () => {
  test('E2E-PRD-01/04: create product, see on public site, delete', async ({ page, context }) => {
    const productName = `E2E Test Piece ${Date.now()}`

    await loginAs(page, OWNER_EMAIL)
    await openNewProductForm(page)
    await fillMinimalProduct(page, {
      name: productName,
      description: 'Created by the Playwright smoke test.',
      price: '4200',
      photo: SAMPLE_PHOTO,
    })
    await page.getByRole('button', { name: 'Save Product' }).click()
    await expect(page.getByText(productName)).toBeVisible({ timeout: 20_000 })

    const publicPage = await context.newPage()
    await publicPage.goto('/collection')
    await expect(publicPage.getByText(productName)).toBeVisible({ timeout: 20_000 })
    await publicPage.close()

    page.once('dialog', (dialog) => dialog.accept())
    const productRow = page.locator('li', { hasText: productName })
    await productRow.getByRole('button', { name: 'Delete' }).click()
    await page.getByTestId('confirm-delete').click()
    await expect(page.getByText(productName)).toHaveCount(0)
  })

  test('E2E-HP-01: hide homepage section disappears from storefront', async ({ page, context }) => {
    await loginAs(page, OWNER_EMAIL)
    await expect(page.getByTestId('section-list').locator('li').first()).toBeVisible({ timeout: 15_000 })

    const aboutRow = page.locator('[data-testid="section-list"] li', {
      hasText: /Crafting Jewellery Since 1888|The Hands Behind Amore/,
    })
    if ((await aboutRow.count()) === 0) {
      await page.getByTestId('restore-defaults').click()
      await page.getByTestId('confirm-dialog-confirm').click()
      // Restore swaps into a notice dialog; dismiss after it appears.
      await expect(page.getByRole('heading', { name: 'Layout restored' })).toBeVisible({
        timeout: 20_000,
      })
      await page.getByTestId('confirm-dialog-confirm').click()
      await expect(page.getByTestId('confirm-dialog')).toHaveCount(0)
      await expect(aboutRow).toBeVisible({ timeout: 15_000 })
    }

    const toggle = aboutRow.getByTestId('toggle-section-visibility')
    // Visible → "Hide"; hidden → "Unhide"
    if ((await toggle.textContent())?.match(/^unhide$/i)) {
      await toggle.click()
      await expect(toggle).toHaveText(/^hide$/i)
    }
    await toggle.click()
    await expect(toggle).toHaveText(/^unhide$/i)

    const publicPage = await context.newPage()
    await publicPage.goto('/')
    await expect(publicPage.getByRole('heading', { name: /Crafting Jewellery Since 1888|The Hands Behind Amore/ })).toHaveCount(0, {
      timeout: 15_000,
    })
    await publicPage.close()
  })



  test('E2E-BIZ-01: business settings page reachable', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL)
    await goAdmin(page, 'Business')
  })

  test('E2E-CAT-01: catalogue settings page reachable', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL)
    await goAdmin(page, 'Catalogue')
  })

  test('E2E-TAX-01: taxonomies page reachable', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL)
    await goAdmin(page, 'Taxonomies')
  })
})
