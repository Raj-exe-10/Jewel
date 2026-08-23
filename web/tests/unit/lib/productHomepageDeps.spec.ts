import { describe, expect, it } from 'vitest'
import {
  findHomepageProductDependencies,
  scrubProductIdFromSections,
} from '../../../src/lib/productHomepageDeps'
import type { Product } from '../../../src/types/catalogue'
import type { HomepageSection } from '../../../src/types/homepage'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Piece',
    priceInr: 1000,
    description: 'd',
    photoUrls: ['https://example.com/a.jpg'],
    categoryId: 'c1',
    styleTagIds: [],
    collectionId: null,
    isNewArrival: false,
    isFounderFavourite: true,
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

function makeSection(overrides: Partial<HomepageSection> = {}): HomepageSection {
  return {
    id: 's1',
    type: 'product_carousel',
    title: 'Founder picks',
    anchorId: 'ff',
    sortOrder: 0,
    isVisible: true,
    createdAt: 0,
    updatedAt: 0,
    updatedBy: 'u',
    content: { variant: 'carousel' },
    ...overrides,
  }
}

describe('productHomepageDeps', () => {
  it('finds manual and flag dependencies', () => {
    const product = makeProduct()
    const sections = [
      makeSection({
        id: 'manual',
        title: 'Hand picks',
        productSelectionMode: 'manual',
        productIds: ['p1', 'p2'],
      }),
      makeSection({
        id: 'flag',
        title: 'Favourites',
        productSelectionMode: 'flag',
        productFlag: 'isFounderFavourite',
      }),
      makeSection({ id: 'other', type: 'about', title: 'About', content: { bodyParagraphs: [] } }),
    ]

    const deps = findHomepageProductDependencies(product, sections)
    expect(deps).toEqual([
      { sectionId: 'manual', sectionTitle: 'Hand picks', reason: 'manual' },
      { sectionId: 'flag', sectionTitle: 'Favourites', reason: 'flag' },
    ])
  })

  it('scrubs a product id from manual productIds arrays', () => {
    const sections = [
      makeSection({ productIds: ['p1', 'p2'], productSelectionMode: 'manual' }),
      makeSection({ id: 's2', productIds: ['p3'], productSelectionMode: 'manual' }),
    ]
    const next = scrubProductIdFromSections(sections, 'p1')
    expect(next[0]!.productIds).toEqual(['p2'])
    expect(next[1]!.productIds).toEqual(['p3'])
  })
})
