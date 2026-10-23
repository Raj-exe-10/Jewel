import { describe, expect, it } from 'vitest'
import { buildSearchSuggestions } from '../../../src/lib/searchSuggestions'
import type { Category, Collection, Product, StyleTag } from '../../../src/types/catalogue'

function product(id: string, name: string): Product {
  return {
    id,
    name,
    priceInr: 1,
    description: '',
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
  }
}

const categories: Category[] = [
  { id: 'c1', name: 'Necklace', sortOrder: 0, createdAt: 0 },
  { id: 'c2', name: 'Rings', sortOrder: 1, createdAt: 0 },
]
const collections: Collection[] = [{ id: 'col1', name: 'Jadau Kundan', sortOrder: 0, createdAt: 0 }]
const styleTags: StyleTag[] = [{ id: 't1', name: 'Bridal', sortOrder: 0, createdAt: 0 }]

describe('buildSearchSuggestions', () => {
  it('returns empty for blank query', () => {
    expect(
      buildSearchSuggestions(
        { products: [product('p1', 'Kundan')], categories, collections, styleTags },
        '   ',
      ),
    ).toEqual([])
  })

  it('caps products at 6 and taxonomies at 3 each', () => {
    const products = Array.from({ length: 10 }, (_, i) => product(`p${i}`, `Kundan ${i}`))
    const manyCategories = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i}`,
      name: `Kundan Cat ${i}`,
      sortOrder: i,
      createdAt: 0,
    }))
    const result = buildSearchSuggestions(
      { products, categories: manyCategories, collections, styleTags },
      'kundan',
    )
    expect(result.filter((s) => s.kind === 'product')).toHaveLength(6)
    expect(result.filter((s) => s.kind === 'category')).toHaveLength(3)
  })

  it('is case-insensitive and includes style/collection matches', () => {
    const result = buildSearchSuggestions(
      {
        products: [product('p1', 'Temple Haram')],
        categories,
        collections,
        styleTags,
      },
      'BRIDAL',
    )
    expect(result.some((s) => s.kind === 'style' && s.label === 'Bridal')).toBe(true)
  })
})
