import { describe, expect, it } from 'vitest'
import { parsePublicUrl, splitFolder } from '../../../src/supabase/storage'

describe('supabase storage helpers', () => {
  it('splits folder into bucket and prefix', () => {
    expect(splitFolder('product-photos')).toEqual({ bucket: 'product-photos', prefix: '' })
    expect(splitFolder('section-media/sec-1/posters')).toEqual({
      bucket: 'section-media',
      prefix: 'sec-1/posters',
    })
  })

  it('parses public object URLs', () => {
    const url =
      'http://127.0.0.1:54321/storage/v1/object/public/product-photos/p1/img.jpg?token=x'
    expect(parsePublicUrl(url)).toEqual({
      bucket: 'product-photos',
      path: 'p1/img.jpg',
    })
  })
})
