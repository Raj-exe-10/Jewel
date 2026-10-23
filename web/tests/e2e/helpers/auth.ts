import { expect, type Page } from '@playwright/test'

export const OWNER_EMAIL = 'owner@amore.test'
export const OWNER_PASSWORD = 'password123'
export const STAFF2_EMAIL = 'staff2@amore.test'

export async function loginAs(page: Page, email: string, password = OWNER_PASSWORD) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto('/admin/login')
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.locator('input[type="password"]').press('Enter')

    try {
      await expect(page).toHaveURL(/\/admin\/homepage$/, { timeout: 25_000 })
      return
    } catch (error) {
      if (attempt === 3) throw error
      await page.waitForTimeout(2_500 * attempt)
    }
  }
}

export async function goAdmin(
  page: Page,
  label: 'Homepage' | 'Products' | 'Taxonomies' | 'Catalogue' | 'Business',
) {
  await page.getByRole('link', { name: label, exact: true }).click()
  const pathByLabel: Record<typeof label, RegExp> = {
    Homepage: /\/admin\/homepage/,
    Products: /\/admin\/products/,
    Taxonomies: /\/admin\/taxonomies/,
    Catalogue: /\/admin\/catalogue/,
    Business: /\/admin\/business/,
  }
  await expect(page).toHaveURL(pathByLabel[label])
}

/** Collection page is more reliable than homepage carousels for product cards. */
export async function gotoCollectionWithProducts(page: Page) {
  // Catalogue fetch can flake under local Realtime/connection load late in a serial suite.
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto('/collection')
    await expect(page.getByTestId('collection-page')).toBeVisible()
    const card = page.locator('[data-testid="product-card"]').first()
    try {
      await expect(card).toBeVisible({ timeout: attempt === 3 ? 20_000 : 10_000 })
      return card
    } catch (error) {
      if (attempt === 3) throw error
      await page.waitForTimeout(1_200 * attempt)
    }
  }
  throw new Error('gotoCollectionWithProducts: unreachable')
}

export async function openNewProductForm(page: Page) {
  await goAdmin(page, 'Products')
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()
  await page.getByRole('button', { name: /add product/i }).click()
  await expect(page.getByTestId('product-form-modal')).toBeVisible({ timeout: 10_000 })
  // Wait until taxonomy hydration enables Save (categoriesReady).
  await expect(page.getByTestId('product-category').locator('option').first()).toBeAttached({
    timeout: 20_000,
  })
}

export async function fillMinimalProduct(
  page: Page,
  opts: { name: string; description?: string; price?: string; photo: string },
) {
  await page.getByTestId('product-name').fill(opts.name)
  await page.getByTestId('product-description').fill(opts.description ?? 'e2e product')
  await page.getByTestId('product-price').fill(opts.price ?? '2100')
  await page.getByTestId('media-image-input').setInputFiles(opts.photo)
  await expect(page.locator('img[alt="Product media"]').first()).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole('button', { name: 'Save Product' })).toBeEnabled({ timeout: 15_000 })
}
