import imageCompression from 'browser-image-compression'

export interface CompressedImageOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
}

export function useImageCompression() {
  async function compress(file: File, options: CompressedImageOptions = {}): Promise<File> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files can be uploaded as product photos.')
    }
    return imageCompression(file, {
      maxSizeMB: options.maxSizeMB ?? 1,
      maxWidthOrHeight: options.maxWidthOrHeight ?? 1600,
      useWebWorker: true,
    })
  }

  return { compress }
}
