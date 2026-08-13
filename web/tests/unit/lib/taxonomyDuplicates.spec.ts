import { describe, expect, it } from 'vitest'
import {
  findDuplicateGroups,
  planTaxonomyCollapse,
  normalizeTaxonomyName,
} from '../../../src/lib/taxonomyDuplicates'

describe('taxonomyDuplicates', () => {
  it('normalizes names by trimming and lowercasing', () => {
    expect(normalizeTaxonomyName('  Necklace ')).toBe('necklace')
  })

  it('groups duplicate taxonomy entries by normalized name keeping earliest createdAt', () => {
    const items = [
      { id: 'a1', name: 'Bangles', createdAt: 100 },
      { id: 'a2', name: 'bangles', createdAt: 200 },
      { id: 'a3', name: 'Rings', createdAt: 50 },
      { id: 'a4', name: 'Bangles', createdAt: 300 },
    ]
    const groups = findDuplicateGroups(items)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.keepId).toBe('a1')
    expect(groups[0]!.dropIds).toEqual(['a2', 'a4'])
  })

  it('plans product remaps for category, collection, and style tag duplicates', () => {
    const plan = planTaxonomyCollapse({
      categories: [
        { id: 'c1', name: 'Necklace', createdAt: 1 },
        { id: 'c2', name: 'Necklace', createdAt: 2 },
      ],
      collections: [
        { id: 'col1', name: 'Diamond', createdAt: 1 },
        { id: 'col2', name: 'Diamond', createdAt: 9 },
      ],
      styleTags: [
        { id: 't1', name: 'Bridal', createdAt: 1 },
        { id: 't2', name: 'Bridal', createdAt: 3 },
      ],
      products: [
        {
          id: 'p1',
          categoryId: 'c2',
          collectionId: 'col2',
          styleTagIds: ['t2', 't1'],
        },
      ],
    })

    expect(plan.deleteIds).toEqual(
      expect.arrayContaining([
        { taxonomy: 'categories', id: 'c2' },
        { taxonomy: 'collections', id: 'col2' },
        { taxonomy: 'styleTags', id: 't2' },
      ]),
    )
    expect(plan.productUpdates).toEqual([
      {
        id: 'p1',
        categoryId: 'c1',
        collectionId: 'col1',
        styleTagIds: ['t1'],
      },
    ])
  })
})
