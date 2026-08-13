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
          eyebrow: 'New Season',
          heading: 'Discover the Bridal Edit',
          subheading: 'Kundan, polki, and antique pieces made to be heirlooms.',
          ctaLabel: 'Shop Bridal',
          ctaTarget: { kind: 'bridal' },
        },
        {
          id: 'new-arrivals',
          imageUrl: HERO_IMAGES.newArrivals,
          eyebrow: 'Just In',
          heading: 'New Arrivals, Handcrafted with Love',
          subheading: 'Everyday pieces that go from desk to dinner.',
          ctaLabel: 'Shop New Arrivals',
          ctaTarget: { kind: 'scroll', anchorId: 'shop-the-visuals' },
        },
        {
          id: 'signature',
          imageUrl: HERO_IMAGES.signature,
          eyebrow: "Founder's Picks",
          heading: 'Signature Pieces, Made to Be Loved',
          subheading: 'Our most-requested designs, curated by the Amore team.',
          ctaLabel: 'Shop Signature Picks',
          ctaTarget: { kind: 'scroll', anchorId: 'founders-favourites' },
        },
      ],
    },
  }),
  base({
    id: 'default-visuals',
    type: 'video_carousel',
    title: 'Shop the Visuals',
    subtitle: 'Watch our pieces in motion — bridal edits, festive looks, and everyday glow',
    icon: '✦',
    anchorId: 'shop-the-visuals',
    sortOrder: 1,
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
    id: 'default-founders',
    type: 'product_carousel',
    title: "Founder's Favourites",
    subtitle: 'Signature pieces our atelier returns to again and again',
    icon: '◇',
    anchorId: 'founders-favourites',
    sortOrder: 2,
    productSelectionMode: 'flag',
    productFlag: 'isFounderFavourite',
    content: { variant: 'carousel' },
  }),
  base({
    id: 'default-style',
    type: 'style_tiles',
    title: 'Shop the Style',
    subtitle: 'Find your piece by occasion or mood',
    icon: '✧',
    anchorId: 'shop-the-style',
    sortOrder: 3,
    content: { tileImageOverrides: {} },
  }),
  base({
    id: 'default-categories',
    type: 'category_grid',
    title: 'Shop by Categories',
    subtitle: 'Browse every silhouette in the Amore atelier',
    icon: '◈',
    anchorId: 'shop-by-categories',
    sortOrder: 4,
    content: { tileImageOverrides: {} },
  }),
  base({
    id: 'default-craft',
    type: 'collection_tiles',
    title: 'Shop by Craft',
    subtitle: 'Kundan, polki, moissanite — choose your craft',
    icon: '❖',
    anchorId: 'shop-by-craft',
    sortOrder: 5,
    content: { tileImageOverrides: {} },
  }),
  base({
    id: 'default-bridal',
    type: 'product_carousel',
    title: 'Bridal Ensembles',
    subtitle: 'Statement sets designed for the big day — from kundan chokers to layered harams.',
    icon: '♛',
    anchorId: 'bridal',
    sortOrder: 6,
    productSelectionMode: 'flag',
    productFlag: 'isBridal',
    content: {
      variant: 'bridal',
      bannerImageUrl: BRIDAL_BANNER,
      bannerEyebrow: 'Bridal',
      bannerHeading: 'Curated Bridal Ensembles',
      bannerBody: 'Statement sets designed for the big day — from kundan chokers to layered harams.',
      bannerCtaLabel: 'Explore Bridal Collection',
    },
  }),
  base({
    id: 'default-catalogue',
    type: 'catalogue_grid',
    title: 'Shop the Collection',
    subtitle: 'Browse, filter, and enquire on WhatsApp',
    icon: '✦',
    anchorId: 'catalogue',
    sortOrder: 7,
    content: {},
  }),
  base({
    id: 'default-about',
    type: 'about',
    title: 'The Hands Behind Amore',
    anchorId: 'about',
    sortOrder: 8,
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
    sortOrder: 9,
    content: {
      tiles: INSTAGRAM_TILES.map((tile) => ({
        id: String(tile.id),
        imageUrl: tile.image,
        alt: 'Amore on Instagram',
      })),
    },
  }),
  base({
    id: 'default-studio',
    type: 'studio_location',
    title: 'By Appointment Only',
    anchorId: 'studio',
    sortOrder: 10,
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
    sortOrder: 11,
    content: {
      bodyParagraphs: [
        'Have a question about a piece, custom orders, or bridal sets? Reach out — we reply personally.',
      ],
    },
  }),
]

const DRAFT_TEMPLATES: Record<SectionType, () => HomepageSectionInput> = {
  hero_banner: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[0]!),
  video_carousel: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[1]!),
  product_carousel: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[2]!),
  style_tiles: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[3]!),
  category_grid: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[4]!),
  collection_tiles: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[5]!),
  catalogue_grid: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[7]!),
  about: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[8]!),
  instagram_gallery: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[9]!),
  studio_location: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[10]!),
  contact: () => omitIds(DEFAULT_HOMEPAGE_SECTIONS[11]!),
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
  return {
    ...draft,
    title: uniqueSectionTitle(draft.title, existingTitles),
    sortOrder,
    isVisible: true,
    anchorId: `${type}-${sortOrder}`,
  }
}

export function defaultSectionByAnchor(anchorId: string): HomepageSection {
  const found = DEFAULT_HOMEPAGE_SECTIONS.find((section) => section.anchorId === anchorId)
  if (!found) {
    throw new Error(`No default homepage section for anchor "${anchorId}"`)
  }
  return found
}
