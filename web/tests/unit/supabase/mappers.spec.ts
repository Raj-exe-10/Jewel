import { describe, expect, it } from 'vitest'
import {
  mapProduct,
  mapSection,
  mapTaxonomy,
  productInputToRow,
  sectionInputToRow,
  TAXONOMY_TABLE,
} from '../../../src/supabase/mappers'
import type { ProductInput } from '../../../src/types/catalogue'
import type { HomepageSectionInput } from '../../../src/types/homepage'

const baseProductInput: ProductInput = {
  name: 'Choker',
  priceInr: 1000,
  description: 'desc',
  photoUrls: ['https://example.com/a.jpg'],
  media: [{ id: 'm1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 }],
  categoryId: 'cat-1',
  styleTagIds: ['tag-1'],
  collectionId: null,
  isNewArrival: true,
  isFounderFavourite: false,
  isStatementPick: false,
  isBridal: false,
  styleGroup: 'traditional',
}

describe('supabase mappers', () => {
  it('mapProduct maps snake_case + style tag junction', () => {
    const product = mapProduct({
      id: 'p1',
      name: 'Choker',
      price_inr: 1200,
      description: 'd',
      photo_urls: ['u1'],
      media: [{ id: 'm1', kind: 'image', url: 'u1', sortOrder: 0 }],
      category_id: 'c1',
      collection_id: null,
      is_new_arrival: true,
      is_founder_favourite: false,
      is_statement_pick: true,
      is_bridal: false,
      style_group: 'modern',
      created_at: 10,
      updated_at: 20,
      created_by: 'a',
      updated_by: 'b',
      product_style_tags: [{ style_tag_id: 't1' }, { style_tag_id: 't2' }],
    })

    expect(product).toMatchObject({
      id: 'p1',
      priceInr: 1200,
      categoryId: 'c1',
      styleTagIds: ['t1', 't2'],
      isNewArrival: true,
      isStatementPick: true,
      styleGroup: 'modern',
    })
  })

  it('mapProduct tolerates null photo_urls and media', () => {
    const product = mapProduct({
      id: 'p1',
      name: 'x',
      price_inr: 0,
      description: 'd',
      photo_urls: null,
      media: null,
      category_id: 'c1',
      collection_id: null,
      is_new_arrival: false,
      is_founder_favourite: false,
      is_statement_pick: false,
      is_bridal: false,
      style_group: null,
      created_at: 0,
      updated_at: 0,
      created_by: 'a',
      updated_by: 'a',
      product_style_tags: null,
    })
    expect(product.photoUrls).toEqual([])
    expect(product.media).toEqual([])
    expect(product.styleTagIds).toEqual([])
  })

  it('productInputToRow omits created_* on update and includes them on create', () => {
    const created = productInputToRow(baseProductInput, 'uid-1', 99)
    expect(created).toMatchObject({
      price_inr: 1000,
      category_id: 'cat-1',
      created_at: 99,
      created_by: 'uid-1',
      updated_by: 'uid-1',
    })

    const updated = productInputToRow(baseProductInput, 'uid-2', 100, {
      id: 'p1',
    } as never)
    expect(updated).not.toHaveProperty('created_at')
    expect(updated).not.toHaveProperty('created_by')
    expect(updated.updated_by).toBe('uid-2')
  })

  it('mapTaxonomy and TAXONOMY_TABLE map styleTags → style_tags', () => {
    expect(mapTaxonomy({ id: '1', name: 'Bridal', sort_order: 2, created_at: 5 })).toEqual({
      id: '1',
      name: 'Bridal',
      sortOrder: 2,
      createdAt: 5,
    })
    expect(TAXONOMY_TABLE.styleTags).toBe('style_tags')
  })

  it('mapSection and sectionInputToRow round-trip nullable fields', () => {
    const section = mapSection({
      id: 's1',
      type: 'about',
      title: 'About',
      subtitle: null,
      icon: null,
      anchor_id: 'about',
      sort_order: 1,
      is_visible: false,
      product_selection_mode: null,
      product_flag: null,
      product_ids: null,
      content: { bodyParagraphs: ['hi'] },
      created_at: 1,
      updated_at: 2,
      updated_by: 'u',
    })
    expect(section.subtitle).toBeUndefined()
    expect(section.productIds).toBeUndefined()
    expect(section.isVisible).toBe(false)

    const input: HomepageSectionInput = {
      type: 'about',
      title: 'About',
      anchorId: 'about',
      sortOrder: 0,
      isVisible: true,
      content: { bodyParagraphs: ['hi'] },
    }
    expect(sectionInputToRow(input, 'uid', 7, 's1')).toMatchObject({
      id: 's1',
      anchor_id: 'about',
      product_ids: [],
      updated_by: 'uid',
    })
  })
})
