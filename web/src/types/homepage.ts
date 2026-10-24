export type SectionType =
  | 'hero_banner'
  | 'video_carousel'
  | 'product_carousel'
  | 'style_tiles'
  | 'category_grid'
  | 'collection_tiles'
  | 'catalogue_grid'
  | 'about'
  | 'instagram_gallery'
  | 'studio_location'
  | 'contact'

export type ProductFlag = 'isFounderFavourite' | 'isBridal' | 'isNewArrival' | 'isStatementPick'

export type ProductSelectionMode = 'flag' | 'manual'

export type CtaTarget =
  | { kind: 'bridal' }
  | { kind: 'catalogue' }
  | { kind: 'scroll'; anchorId: string }

export interface HeroSlide {
  id: string
  imageUrl: string
  eyebrow: string
  heading: string
  subheading: string
  ctaLabel: string
  ctaTarget: CtaTarget
}

export interface SectionVideo {
  id: string
  label: string
  posterUrl: string
  videoUrl: string
  sortOrder: number
}

export interface InstagramTile {
  id: string
  imageUrl: string
  alt?: string
}

export interface HeroBannerContent {
  slides: HeroSlide[]
}

export interface VideoCarouselContent {
  videos: SectionVideo[]
}

export type ProductCarouselBand = 'light-split' | 'dark-grid'

export interface ProductCarouselContent {
  variant: 'carousel' | 'bridal'
  /** Visual layout for carousel variant — split showcase vs dark product grid. */
  band?: ProductCarouselBand
  bannerImageUrl?: string
  bannerEyebrow?: string
  bannerHeading?: string
  bannerBody?: string
  bannerCtaLabel?: string
}

export interface TaxonomyTilesContent {
  tileImageOverrides?: Record<string, string>
  /** Preferred display labels for the first category cards (reference layout). */
  preferredLabels?: string[]
}

export interface AboutContent {
  imageUrl?: string
  eyebrow?: string
  bodyParagraphs: string[]
}

export interface InstagramGalleryContent {
  tiles: InstagramTile[]
}

export interface StudioLocationContent {
  imageUrl?: string
  eyebrow?: string
  bodyParagraphs: string[]
  address?: string
  mapUrl?: string
}

export interface ContactContent {
  bodyParagraphs: string[]
}

export type SectionContent =
  | HeroBannerContent
  | VideoCarouselContent
  | ProductCarouselContent
  | TaxonomyTilesContent
  | AboutContent
  | InstagramGalleryContent
  | StudioLocationContent
  | ContactContent
  | Record<string, never>

export interface HomepageSection {
  id: string
  type: SectionType
  title: string
  subtitle?: string
  icon?: string
  anchorId: string
  sortOrder: number
  isVisible: boolean
  createdAt: number
  updatedAt: number
  updatedBy: string
  productSelectionMode?: ProductSelectionMode
  productFlag?: ProductFlag
  productIds?: string[]
  content: SectionContent
}

export type HomepageSectionInput = Omit<HomepageSection, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero_banner: 'Hero Banner',
  video_carousel: 'Shop the Visuals',
  product_carousel: 'Product Carousel',
  style_tiles: 'Shop the Style',
  category_grid: 'Shop by Categories',
  collection_tiles: 'Shop by Craft',
  catalogue_grid: 'Product Catalogue',
  about: 'About',
  instagram_gallery: 'Instagram Gallery',
  studio_location: 'Studio Location',
  contact: 'Contact',
}

export const PRODUCT_FLAG_LABELS: Record<ProductFlag, string> = {
  isFounderFavourite: "Founder's Favourite",
  isBridal: 'Bridal',
  isNewArrival: 'New Arrival',
  isStatementPick: 'Statement Pick',
}
