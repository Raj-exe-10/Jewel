import { describe, expect, it } from 'vitest'
import {
  mediaFromProduct,
  photoUrlsFromMedia,
  type ProductMediaItem,
} from '../../../src/lib/productMedia'

describe('productMedia helpers', () => {
  it('builds media from legacy photoUrls when media is missing', () => {
    const media = mediaFromProduct({ photoUrls: ['https://example.com/a.jpg', 'https://example.com/b.jpg'] })
    expect(media).toHaveLength(2)
    expect(media.every((item) => item.kind === 'image')).toBe(true)
    expect(media.map((item) => item.url)).toEqual([
      'https://example.com/a.jpg',
      'https://example.com/b.jpg',
    ])
  })

  it('prefers explicit media when present', () => {
    const existing: ProductMediaItem[] = [
      { id: 'v1', kind: 'video', url: 'https://example.com/a.mp4', sortOrder: 0 },
      { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 1 },
    ]
    expect(mediaFromProduct({ media: existing, photoUrls: ['https://ignored.jpg'] })).toEqual(existing)
  })

  it('derives photoUrls as image urls in sort order', () => {
    const media: ProductMediaItem[] = [
      { id: 'v1', kind: 'video', url: 'https://example.com/a.mp4', sortOrder: 0 },
      { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 2 },
      { id: 'i0', kind: 'image', url: 'https://example.com/b.jpg', sortOrder: 1 },
    ]
    expect(photoUrlsFromMedia(media)).toEqual([
      'https://example.com/b.jpg',
      'https://example.com/a.jpg',
    ])
  })
})
