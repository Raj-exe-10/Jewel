export type ProductMediaKind = 'image' | 'video'

export interface ProductMediaItem {
  id: string
  kind: ProductMediaKind
  url: string
  posterUrl?: string
  sortOrder: number
}

export function mediaFromProduct(product: {
  media?: ProductMediaItem[] | null
  photoUrls?: string[] | null
}): ProductMediaItem[] {
  if (Array.isArray(product.media) && product.media.length > 0) {
    return [...product.media].sort((a, b) => a.sortOrder - b.sortOrder)
  }
  return (product.photoUrls ?? []).map((url, index) => ({
    id: `legacy-${index}`,
    kind: 'image' as const,
    url,
    sortOrder: index,
  }))
}

export function photoUrlsFromMedia(media: ProductMediaItem[]): string[] {
  return [...media]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((item) => item.kind === 'image')
    .map((item) => item.url)
}

export function coverUrlFromMedia(media: ProductMediaItem[], fallback = ''): string {
  const ordered = [...media].sort((a, b) => a.sortOrder - b.sortOrder)
  const image = ordered.find((item) => item.kind === 'image')
  if (image) return image.url
  const video = ordered.find((item) => item.kind === 'video')
  if (video?.posterUrl) return video.posterUrl
  return fallback
}
