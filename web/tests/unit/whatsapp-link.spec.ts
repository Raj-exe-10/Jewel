import { describe, expect, it } from 'vitest'
import {
  buildGeneralEnquiryLink,
  buildInstagramProfileLink,
  buildProductEnquiryLink,
} from '../../src/composables/useWhatsAppLink'
import type { Product } from '../../src/types/catalogue'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Kundan Choker Necklace',
    priceInr: 5000,
    description: 'A lovely necklace',
    photoUrls: ['https://example.com/photo.jpg'],
    categoryId: 'cat1',
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

describe('buildProductEnquiryLink', () => {
  it('builds a wa.me link addressed to the business number', () => {
    const url = buildProductEnquiryLink(makeProduct(), '919999999999')
    const parsed = new URL(url)

    expect(parsed.hostname).toBe('wa.me')
    expect(parsed.pathname).toBe('/919999999999')
  })

  it('includes the exact product name in the decoded message', () => {
    const url = buildProductEnquiryLink(
      makeProduct({ name: 'Kundan Choker Necklace' }),
      '919999999999',
    )
    const parsed = new URL(url)
    const text = parsed.searchParams.get('text')

    expect(text).toContain('Kundan Choker Necklace')
  })

  it('round-trips product names containing special characters', () => {
    const specialName = 'Mom & Me "Heritage" Set 💍'
    const url = buildProductEnquiryLink(makeProduct({ name: specialName }), '919999999999')
    const parsed = new URL(url)
    const text = parsed.searchParams.get('text')

    expect(text).toContain(specialName)
  })

  it('throws a descriptive error for an empty business phone number', () => {
    expect(() => buildProductEnquiryLink(makeProduct(), '')).toThrow(/business phone/i)
    expect(() => buildProductEnquiryLink(makeProduct(), '   ')).toThrow(/business phone/i)
  })
})

describe('buildGeneralEnquiryLink', () => {
  it('builds a well-formed wa.me link with a generic message', () => {
    const url = buildGeneralEnquiryLink('919999999999')
    const parsed = new URL(url)

    expect(parsed.hostname).toBe('wa.me')
    expect(parsed.pathname).toBe('/919999999999')
    expect(parsed.searchParams.get('text')).toMatch(/jewelry|jewellery/i)
  })

  it('does not reference any specific product', () => {
    const url = buildGeneralEnquiryLink('919999999999')
    const parsed = new URL(url)

    expect(parsed.searchParams.get('text')).not.toMatch(/necklace|ring|earring/i)
  })
})

describe('buildInstagramProfileLink', () => {
  it('normalizes a handle with a leading @', () => {
    expect(buildInstagramProfileLink('@amore.jewelry')).toBe('https://instagram.com/amore.jewelry')
  })

  it('accepts a handle without a leading @ as-is', () => {
    expect(buildInstagramProfileLink('amore.jewelry')).toBe('https://instagram.com/amore.jewelry')
  })
})
