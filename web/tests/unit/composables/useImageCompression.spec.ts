import { beforeEach, describe, expect, it, vi } from 'vitest'

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
