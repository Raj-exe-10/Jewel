import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file' } })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile: vi.fn().mockResolvedValue('https://example.com/file'),
  deletePublicUrl: vi.fn().mockResolvedValue(undefined),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
  splitFolder: vi.fn((folder) => {
    const parts = String(folder).split('/').filter(Boolean)
    return { bucket: parts[0] ?? 'product-photos', prefix: parts.slice(1).join('/') }
  }),
  publicObjectUrl: vi.fn(() => 'https://example.com/file'),
  parsePublicUrl: vi.fn(),
}))


const { imageCompressionMock } = vi.hoisted(() => ({
  imageCompressionMock: vi.fn(),
}))

vi.mock('browser-image-compression', () => ({
  default: imageCompressionMock,
}))

const { useImageCompression } = await import('../../../src/composables/useImageCompression')

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type })
  return new File([blob], name, { type })
}

describe('useImageCompression', () => {
  beforeEach(() => {
    imageCompressionMock.mockReset()
  })

  it('compresses an oversized image file', async () => {
    const original = makeFile('necklace.jpg', 'image/jpeg', 6 * 1024 * 1024)
    const compressed = makeFile('necklace.jpg', 'image/jpeg', 500 * 1024)
    imageCompressionMock.mockResolvedValue(compressed)

    const { compress } = useImageCompression()
    const result = await compress(original)

    expect(imageCompressionMock).toHaveBeenCalledWith(original, expect.objectContaining({ maxSizeMB: expect.any(Number) }))
    expect(result).toBe(compressed)
  })

  it('rejects a non-image file without calling the compression library', async () => {
    const pdf = makeFile('invoice.pdf', 'application/pdf', 1024)
    const { compress } = useImageCompression()

    await expect(compress(pdf)).rejects.toThrow(/image/i)
    expect(imageCompressionMock).not.toHaveBeenCalled()
  })
})
