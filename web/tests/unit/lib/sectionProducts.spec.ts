import { describe, expect, it } from 'vitest'
import { productsForSection } from '../../../src/lib/sectionProducts'
import type { Product } from '../../../src/types/catalogue'
import type { HomepageSection } from '../../../src/types/homepage'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Kundan Choker Necklace',
    priceInr: 5000,
    description: 'desc',
    photoUrls: ['https://example.com/photo.jpg'],
    categoryId: 'cat-necklace',
    styleTagIds: [],
    collectionId: null,
    isNewArrival: false,
    isFounderFavourite: false,
    isStatementPick: false,
    isBridal: false,
    styleGroup: null,
    createdAt: 0,
    updatedAt: 0,
    createdBy: 'uid1',
    updatedBy: 'uid1',
    ...overrides,
  }
}

function makeCarousel(overrides: Partial<HomepageSection> = {}): HomepageSection {
  return {
    id: 'sec-1',
    type: 'product_carousel',
    title: "Founder's Favourites",
    anchorId: 'founders-favourites',
    sortOrder: 0,
    isVisible: true,
    createdAt: 0,
    updatedAt: 0,
    updatedBy: 'seed',
    productSelectionMode: 'flag',
    productFlag: 'isFounderFavourite',
    content: { variant: 'carousel' },
    ...overrides,
  }
}

describe('productsForSection', () => {
  it('returns products matching the selected flag', () => {
    const products = [
      makeProduct({ id: 'p1', isFounderFavourite: true }),
      makeProduct({ id: 'p2', isFounderFavourite: false }),
      makeProduct({ id: 'p3', isFounderFavourite: true }),
    ]

    expect(productsForSection(makeCarousel(), products).map((p) => p.id)).toEqual(['p1', 'p3'])
  })

  it('returns hand-picked products in the stored order, skipping missing ids', () => {
    const products = [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2' }), makeProduct({ id: 'p3' })]
    const section = makeCarousel({
      productSelectionMode: 'manual',
      productIds: ['p3', 'missing', 'p1'],
    })

    expect(productsForSection(section, products).map((p) => p.id)).toEqual(['p3', 'p1'])
  })

  it('returns an empty list for non-product sections', () => {
    const section = makeCarousel({ type: 'about', content: { bodyParagraphs: ['hi'] } })
    expect(productsForSection(section, [makeProduct()])).toEqual([])
  })
})
