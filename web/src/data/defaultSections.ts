import { BRIDAL_BANNER, FOUNDER_IMAGE, HERO_IMAGES, INSTAGRAM_TILES, STUDIO_IMAGE, VISUAL_VIDEOS } from './storefrontMedia'
import type { HomepageSection, HomepageSectionInput, SectionType } from '../types/homepage'

const now = 0

function base(
  partial: Omit<HomepageSection, 'createdAt' | 'updatedAt' | 'updatedBy' | 'isVisible'> & {
    isVisible?: boolean
  },
): HomepageSection {
  return {
    createdAt: now,
    updatedAt: now,
    updatedBy: 'seed',
    isVisible: true,
    ...partial,
  }
}

/**
 * Default storefront layout — mirrors the Nayaban-style reference
 * (maroon/gold/cream brand colors applied in CSS).
 *
 * Visible order:
 * 1. Hero
 * 2. Category cards
 * 3. Diamonds & Engagement (split carousel)
 * 4. Find the perfect Diamond (dark product grid)
 * 5. Business / bridal feature banner
 * 6. Discover the Ruby Jewellery (dark product grid)
 * 7. Heritage / about
 * 8. Instagram
 *
 * Blog is rendered by PublicHome between ruby and heritage.
 * Video / style / studio / contact stay in the catalogue for admin use but are hidden.
 */
export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  base({
    id: 'default-hero',
    type: 'hero_banner',
    title: 'Hero Banner',
    anchorId: 'hero',
    sortOrder: 0,
    content: {
      slides: [
        {
          id: 'bridal',
          imageUrl: HERO_IMAGES.bridal,
          eyebrow: '',
          heading: 'The Perfect Jewels For You',
          subheading:
            'Welcoming in the season with an enchanting emerald & diamond necklace with earrings — handcrafted to be loved for a lifetime.',
          ctaLabel: 'Buy Now',
          ctaTarget: { kind: 'bridal' },
        },
        {
          id: 'new-arrivals',
          imageUrl: HERO_IMAGES.newArrivals,
          eyebrow: '',
          heading: 'New Arrivals, Handcrafted with Love',
          subheading: 'Everyday pieces that go from desk to dinner — light, luminous, and made to order.',
          ctaLabel: 'Buy Now',
          ctaTarget: { kind: 'scroll', anchorId: 'founders-favourites' },
        },
        {
          id: 'signature',
          imageUrl: HERO_IMAGES.signature,
          eyebrow: '',
          heading: 'Signature Pieces, Made to Be Loved',
          subheading: 'Our most-requested designs, curated by the Amore atelier for moments that matter.',
          ctaLabel: 'Buy Now',
          ctaTarget: { kind: 'scroll', anchorId: 'founders-favourites' },
        },
      ],
    },
  }),
  base({
    id: 'default-categories',
    type: 'category_grid',
    title: 'Shop by Categories',
    subtitle: 'Bracelet · Earrings · Couple Rings',
    icon: '◈',
    anchorId: 'shop-by-categories',
    sortOrder: 1,
    content: {
      tileImageOverrides: {},
      preferredLabels: ['Bracelet', 'Earrings', 'Couple Rings'],
    },
  }),
  base({
    id: 'default-founders',
    type: 'product_carousel',
    title: 'Diamonds & Engagement Ring',
    subtitle:
      'Discover timeless diamond and engagement pieces — curated signatures from the Amore atelier.',
    icon: '◇',
    anchorId: 'founders-favourites',
    sortOrder: 2,
    productSelectionMode: 'flag',
    productFlag: 'isFounderFavourite',
    content: { variant: 'carousel', band: 'light-split' },
  }),
  base({
    id: 'default-catalogue',
    type: 'catalogue_grid',
    title: 'Find the perfect Diamond for',
    subtitle: 'Browse our diamond edit and enquire on WhatsApp',
    icon: '✦',
    anchorId: 'catalogue',
    sortOrder: 3,
    content: {},
  }),
  base({
    id: 'default-bridal',
    type: 'product_carousel',
    title: 'Bridal Ensembles',
    subtitle: 'Statement sets designed for the big day — from kundan chokers to layered harams.',
    icon: '♛',
    anchorId: 'bridal',
    sortOrder: 4,
    productSelectionMode: 'flag',
    productFlag: 'isBridal',
    content: {
      variant: 'bridal',
      bannerImageUrl: BRIDAL_BANNER,
      bannerEyebrow: 'B2B & Bridal',
      bannerHeading: 'Get the best diamonds for your business',
      bannerBody:
        'Partner with Amore for curated diamond and bridal ensembles — crafted for retailers, stylists, and unforgettable celebrations.',
      bannerCtaLabel: 'Explore Collection',
    },
  }),
  base({
    id: 'default-ruby',
    type: 'product_carousel',
    title: 'Discover the Ruby Jewellery',
    subtitle: 'Rich colour, timeless craft — statement pieces for every occasion.',
    icon: '❖',
    anchorId: 'ruby-jewellery',
    sortOrder: 5,
    productSelectionMode: 'flag',
    productFlag: 'isNewArrival',
    content: { variant: 'carousel', band: 'dark-grid' },
  }),
  base({
    id: 'default-about',
    type: 'about',
    title: 'Crafting Jewellery Since 1888',
    anchorId: 'about',
    sortOrder: 6,
    content: {
      imageUrl: FOUNDER_IMAGE,
      eyebrow: 'Our Story',
      bodyParagraphs: [
        'Amore is a designer jewelry studio crafting handmade pieces that blend traditional Indian artistry with modern silhouettes — from statement bridal sets to everyday minimal wear. Every piece is made to order with care, and no two pieces are ever quite the same.',
        "The beauty of Indian jewellery lies as much in its making as in its form — in the artisan's hand, art becomes craftsmanship.",
      ],
    },
  }),
  base({
    id: 'default-instagram',
    type: 'instagram_gallery',
    title: 'Follow Along',
    icon: '◎',
    anchorId: 'instagram',
    sortOrder: 7,
    content: {
      tiles: INSTAGRAM_TILES.map((tile) => ({
        id: String(tile.id),
        imageUrl: tile.image,
        alt: 'Amore on Instagram',
      })),
    },
  }),

  // Kept for admin / optional restore — hidden from the reference homepage layout
  base({
    id: 'default-visuals',
    type: 'video_carousel',
    title: 'Shop the Visuals',
    subtitle: 'Watch our pieces in motion — bridal edits, festive looks, and everyday glow',
    icon: '✦',
    anchorId: 'shop-the-visuals',
    sortOrder: 90,
    isVisible: false,
    content: {
      videos: VISUAL_VIDEOS.map((tile, index) => ({
        id: `video-${index}`,
        label: tile.label,
        posterUrl: tile.poster,
        videoUrl: tile.src,
        sortOrder: index,
      })),
    },
  }),
  base({
    id: 'default-style',
    type: 'style_tiles',
    title: 'Shop the Style',
    subtitle: 'Find your piece by occasion or mood',
    icon: '✧',
    anchorId: 'shop-the-style',
    sortOrder: 91,
    isVisible: false,
    content: { tileImageOverrides: {} },
  }),
  base({
    id: 'default-craft',
    type: 'collection_tiles',
    title: 'Shop by Craft',
    subtitle: 'Kundan, polki, moissanite — choose your craft',
    icon: '❖',
    anchorId: 'shop-by-craft',
    sortOrder: 92,
    isVisible: false,
    content: { tileImageOverrides: {} },
  }),
  base({
    id: 'default-studio',
    type: 'studio_location',
    title: 'By Appointment Only',
    anchorId: 'studio',
    sortOrder: 93,
    isVisible: false,
    content: {
      imageUrl: STUDIO_IMAGE,
      eyebrow: 'Visit the Studio',
      bodyParagraphs: ['Amore Studio'],
      address: "Studio address to be added — update this section with your atelier's location.",
      mapUrl: 'https://maps.google.com',
    },
  }),
  base({
    id: 'default-contact',
    type: 'contact',
    title: "Let's Talk Jewelry",
    anchorId: 'contact',
    sortOrder: 94,
    isVisible: false,
    content: {
      bodyParagraphs: [
        'Have a question about a piece, custom orders, or bridal sets? Reach out — we reply personally.',
      ],
    },
  }),
]

function sectionByType(type: SectionType): HomepageSection {
  const found = DEFAULT_HOMEPAGE_SECTIONS.find((section) => section.type === type)
  if (!found) throw new Error(`No default section for type "${type}"`)
  return found
}

function sectionById(id: string): HomepageSection {
  const found = DEFAULT_HOMEPAGE_SECTIONS.find((section) => section.id === id)
  if (!found) throw new Error(`No default section for id "${id}"`)
  return found
}

const DRAFT_TEMPLATES: Record<SectionType, () => HomepageSectionInput> = {
  hero_banner: () => omitIds(sectionByType('hero_banner')),
  video_carousel: () => omitIds(sectionByType('video_carousel')),
  product_carousel: () => omitIds(sectionById('default-founders')),
  style_tiles: () => omitIds(sectionByType('style_tiles')),
  category_grid: () => omitIds(sectionByType('category_grid')),
  collection_tiles: () => omitIds(sectionByType('collection_tiles')),
  catalogue_grid: () => omitIds(sectionByType('catalogue_grid')),
  about: () => omitIds(sectionByType('about')),
  instagram_gallery: () => omitIds(sectionByType('instagram_gallery')),
  studio_location: () => omitIds(sectionByType('studio_location')),
  contact: () => omitIds(sectionByType('contact')),
}

function omitIds(section: HomepageSection): HomepageSectionInput {
  return {
    type: section.type,
    title: section.title,
    subtitle: section.subtitle,
    icon: section.icon,
    anchorId: section.anchorId,
    sortOrder: section.sortOrder,
    isVisible: section.isVisible,
    productSelectionMode: section.productSelectionMode,
    productFlag: section.productFlag,
    productIds: section.productIds,
    content: JSON.parse(JSON.stringify(section.content)),
  }
}

export function toSectionInput(section: HomepageSection): HomepageSectionInput {
  return omitIds(section)
}

export function toFirestoreSection(section: HomepageSection | HomepageSectionInput) {
  const input = 'id' in section ? toSectionInput(section as HomepageSection) : section
  return JSON.parse(JSON.stringify(input)) as HomepageSectionInput
}

export function uniqueSectionTitle(base: string, existingTitles: string[]): string {
  const taken = new Set(existingTitles.map((title) => title.trim().toLowerCase()))
  const trimmed = base.trim() || 'Untitled section'
  if (!taken.has(trimmed.toLowerCase())) return trimmed
  let n = 2
  while (taken.has(`${trimmed} ${n}`.toLowerCase())) n += 1
  return `${trimmed} ${n}`
}

export function createSectionDraft(
  type: SectionType,
  sortOrder: number,
  existingTitles: string[] = [],
): HomepageSectionInput {
  const draft = DRAFT_TEMPLATES[type]()
  const next: HomepageSectionInput = {
    ...draft,
    title: uniqueSectionTitle(draft.title, existingTitles),
    sortOrder,
    isVisible: true,
    anchorId: `${type}-${sortOrder}`,
  }
  if (type === 'product_carousel') {
    next.productSelectionMode = 'manual'
    next.productIds = []
    next.productFlag = undefined
  }
  return next
}

export function defaultSectionByAnchor(anchorId: string): HomepageSection {
  const found = DEFAULT_HOMEPAGE_SECTIONS.find((section) => section.anchorId === anchorId)
  if (!found) {
    throw new Error(`No default homepage section for anchor "${anchorId}"`)
  }
  return found
}
