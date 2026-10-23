import { beforeEach, describe, expect, it, vi } from 'vitest'

const uploadMock = vi.fn()
const removeMock = vi.fn()
const getPublicUrlMock = vi.fn(() => ({ data: { publicUrl: 'http://127.0.0.1:54321/storage/v1/object/public/product-photos/a.jpg' } }))

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: uploadMock,
        remove: removeMock,
        getPublicUrl: getPublicUrlMock,
      })),
    },
  },
}))

const {
  deletePublicUrl,
  isManagedStorageUrl,
  parsePublicUrl,
  uploadPublicFile,
} = await import('../../../src/supabase/storage')

describe('supabase storage operations', () => {
  beforeEach(() => {
    uploadMock.mockReset()
    removeMock.mockReset()
    uploadMock.mockResolvedValue({ error: null })
    removeMock.mockResolvedValue({ error: null })
  })

  it('uploadPublicFile uploads under bucket/prefix and returns public URL', async () => {
    const url = await uploadPublicFile(
      'product-photos/p1',
      'img.jpg',
      new Blob(['x'], { type: 'image/jpeg' }),
      'image/jpeg',
    )
    expect(uploadMock).toHaveBeenCalledWith(
      'p1/img.jpg',
      expect.any(Blob),
      expect.objectContaining({ contentType: 'image/jpeg', upsert: false }),
    )
    expect(url).toContain('/object/public/product-photos/')
  })

  it('uploadPublicFile throws when storage returns an error', async () => {
    uploadMock.mockResolvedValue({ error: { message: 'Payload too large' } })
    await expect(
      uploadPublicFile('product-photos', 'big.jpg', new Blob(['x']), 'image/jpeg'),
    ).rejects.toMatchObject({ message: 'Payload too large' })
  })

  it('deletePublicUrl is a no-op for unparsable paths and removes managed URLs', async () => {
    await deletePublicUrl('')
    expect(removeMock).not.toHaveBeenCalled()

    await deletePublicUrl(
      'http://127.0.0.1:54321/storage/v1/object/public/product-photos/p1/a.jpg?token=1',
    )
    expect(removeMock).toHaveBeenCalledWith(['p1/a.jpg'])
  })

  it('isManagedStorageUrl detects supabase and local hosts', () => {
    expect(isManagedStorageUrl('https://xyz.supabase.co/storage/v1/object/public/b/p')).toBe(true)
    expect(isManagedStorageUrl('https://cdn.example.com/a.jpg')).toBe(false)
    expect(parsePublicUrl('section-videos/sec/v.mp4')).toEqual({
      bucket: 'section-videos',
      path: 'sec/v.mp4',
    })
    expect(parsePublicUrl('only-bucket')).toBeNull()
  })
})
