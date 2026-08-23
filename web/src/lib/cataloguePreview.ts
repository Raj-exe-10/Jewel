import type { Product } from '../types/catalogue'

export const CATALOGUE_PREVIEW_LIMIT = 8

/** First N products for the homepage preview: newest first, then name. */
export function cataloguePreview(products: Product[], limit = CATALOGUE_PREVIEW_LIMIT): Product[] {
  return [...products]
    .sort((a, b) => {
      if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt
      return a.name.localeCompare(b.name)
    })
    .slice(0, limit)
}
