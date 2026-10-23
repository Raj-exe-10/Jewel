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
} from '../helpers/auth'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAMPLE_PHOTO = path.join(__dirname, '../fixtures', 'sample-product.jpg')

test.describe('GATE 4 negative / history / offline', () => {
  test('UI-NEG-06: in-app Back then browser Back does not loop on product', async ({ page }) => {
    await gotoCollectionWithProducts(page)
    await page.locator('[data-testid="product-detail-link"]').first().click()
    await expect(page).toHaveURL(/\/product\//)

    await page.getByTestId('product-back-link').click()
    await expect(page).toHaveURL(/\/collection/)

    await page.goBack()
    if (/\/product\//.test(page.url())) {
      await page.goBack()
    }
    await expect(page).not.toHaveURL(/\/product\//)
  })

  test('forced network fail on product save shows form error', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL)
    await openNewProductForm(page)
    await fillMinimalProduct(page, {
      name: `E2E-NetFail-${Date.now()}`,
      photo: SAMPLE_PHOTO,
    })

    await page.route('**/rest/v1/products**', (route) => route.abort('failed'))
    await page.getByRole('button', { name: 'Save Product' }).click()
    await expect(page.getByTestId('form-error')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('form-error')).toContainText(/connection|try again/i)
    await page.unroute('**/rest/v1/products**')
  })

  test('UI-NEG-09: offline public shell still loads; admin mutate fails gracefully', async ({
    page,
    context,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /^amore$/i })).toBeVisible()

    // Already-loaded shell should remain interactive when the network drops (no reload —
    // Chromium throws ERR_INTERNET_DISCONNECTED on offline navigations).
    await context.setOffline(true)
    await expect(page.getByRole('heading', { name: /^amore$/i })).toBeVisible()
    await context.setOffline(false)

    await loginAs(page, OWNER_EMAIL)
    await goAdmin(page, 'Business')
    await context.setOffline(true)
    await page.getByTestId('business-whatsapp').fill('919988877766')
    await page.getByTestId('business-save').click()
    await expect(page.getByTestId('business-error')).toBeVisible({ timeout: 15_000 })
    await context.setOffline(false)
  })
})

