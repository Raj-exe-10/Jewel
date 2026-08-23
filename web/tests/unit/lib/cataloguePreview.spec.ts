import { describe, expect, it } from 'vitest'
import { cataloguePreview, CATALOGUE_PREVIEW_LIMIT } from '../../../src/lib/cataloguePreview'
import type { Product } from '../../../src/types/catalogue'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Alpha',
    priceInr: 1000,
    description: 'd',
    photoUrls: [],
    categoryId: 'c',
    styleTagIds: [],
    collectionId: null,
    isNewArrival: false,
    isFounderFavourite: false,
    isStatementPick: false,
    isBridal: false,
    styleGroup: null,
    createdAt: 0,
    updatedAt: 0,
    createdBy: 'u',
    updatedBy: 'u',
    ...overrides,
  }
}

describe('cataloguePreview', () => {
  it(`returns at most ${CATALOGUE_PREVIEW_LIMIT} products`, () => {
    const products = Array.from({ length: 12 }, (_, i) =>
      makeProduct({ id: `p${i}`, name: `Item ${i}`, createdAt: i }),
    )
    expect(cataloguePreview(products)).toHaveLength(CATALOGUE_PREVIEW_LIMIT)
  })

  it('orders by newest createdAt first, then name', () => {
    const products = [
      makeProduct({ id: 'old', name: 'Zebra', createdAt: 1 }),
      makeProduct({ id: 'new-b', name: 'Beta', createdAt: 10 }),
      makeProduct({ id: 'new-a', name: 'Alpha', createdAt: 10 }),
    ]
    expect(cataloguePreview(products, 3).map((p) => p.id)).toEqual(['new-a', 'new-b', 'old'])
  })
})
