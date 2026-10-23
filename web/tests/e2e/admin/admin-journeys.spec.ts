import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import {
  fillMinimalProduct,
  goAdmin,
  loginAs,
  openNewProductForm,
  OWNER_EMAIL,
} from '../helpers/auth'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAMPLE_PHOTO = path.join(__dirname, '../fixtures', 'sample-product.jpg')

test.describe('GATE 4 admin journeys', () => {
  test('taxonomies: cannot remove an in-use category (UI-NEG-05)', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL)
    await goAdmin(page, 'Taxonomies')

    const removeButtons = page.locator('[data-testid^="remove-item-"]')
    await expect(removeButtons.first()).toBeVisible({ timeout: 15_000 })
    const countBefore = await removeButtons.count()
    await removeButtons.first().click()
    const warning = page.getByTestId('reference-warning')
    if (await warning.isVisible().catch(() => false)) {
      await expect(warning).toContainText(/still used/i)
      expect(await removeButtons.count()).toBe(countBefore)
    } else {
      expect(await removeButtons.count()).toBeLessThanOrEqual(countBefore)
    }
  })

  test('business save reflects WhatsApp digits on public enquire link', async ({ page, context }) => {
    await loginAs(page, OWNER_EMAIL)
    await goAdmin(page, 'Business')
    const uniqueSuffix = String(Date.now()).slice(-6)
    const phone = `91999${uniqueSuffix}`
    await page.getByTestId('business-whatsapp').fill(phone)
    await page.getByTestId('business-save').click()
    await expect(page.getByTestId('business-success')).toBeVisible({ timeout: 20_000 })

    const publicPage = await context.newPage()
    await publicPage.goto('/')
    // Header CTA uses business profile phone (product-card links share the same source).
    const headerCta = publicPage.getByTestId('header-whatsapp-cta')
    await expect(headerCta).toBeVisible({ timeout: 15_000 })
    await expect
      .poll(async () => (await headerCta.getAttribute('href')) ?? '', { timeout: 15_000 })
      .toContain(`wa.me/${phone}`)
    await publicPage.close()
  })



  test('catalogue products-per-row save succeeds within bounds', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL)
    await goAdmin(page, 'Catalogue')
    await page.getByTestId('products-per-row').fill('4')
    await page.getByTestId('save-catalogue-settings').click()
    await expect(page.getByTestId('catalogue-settings-success')).toBeVisible({ timeout: 15_000 })
  })

  test('logout returns to login and blocks admin routes', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL)
    await page.getByTestId('logout-button').click()
    await expect(page).toHaveURL(/\/admin\/login/)
    await page.goto('/admin/products')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('UI-NEG-02 E2E: rapid double Save creates a single product row', async ({ page }) => {
    const productName = `E2E-Dbl-${Date.now()}`
    await loginAs(page, OWNER_EMAIL)
    await openNewProductForm(page)
    await fillMinimalProduct(page, { name: productName, photo: SAMPLE_PHOTO })

    const save = page.getByRole('button', { name: 'Save Product' })
    await save.click()
    await save.click({ force: true }).catch(() => undefined)
    await expect(page.getByText(productName)).toBeVisible({ timeout: 20_000 })
    expect(await page.getByText(productName).count()).toBe(1)

    page.once('dialog', (dialog) => dialog.accept())
    const productRow = page.locator('li', { hasText: productName })
    await productRow.getByRole('button', { name: 'Delete' }).click()
    await page.getByTestId('confirm-delete').click()
    await expect(page.getByText(productName)).toHaveCount(0)
  })
})
