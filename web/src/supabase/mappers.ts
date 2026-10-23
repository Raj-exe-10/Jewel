import type { Category, Collection, Product, ProductInput, StyleTag } from '../types/catalogue'
import type { HomepageSection, HomepageSectionInput } from '../types/homepage'
import type { ProductMediaItem } from '../lib/productMedia'

type ProductRow = {
  id: string
  name: string
  price_inr: number
  description: string
  photo_urls: unknown
  media: unknown
  category_id: string
  collection_id: string | null
  is_new_arrival: boolean
  is_founder_favourite: boolean
  is_statement_pick: boolean
  is_bridal: boolean
  style_group: 'traditional' | 'modern' | null
  created_at: number
  updated_at: number
  created_by: string
  updated_by: string
  product_style_tags?: Array<{ style_tag_id: string }> | null
}

type TaxonomyRow = {
  id: string
  name: string
  sort_order: number
  created_at: number
}

type SectionRow = {
  id: string
  type: HomepageSection['type']
  title: string
  subtitle: string | null
  icon: string | null
  anchor_id: string
  sort_order: number
  is_visible: boolean
  product_selection_mode: HomepageSection['productSelectionMode'] | null
  product_flag: HomepageSection['productFlag'] | null
  product_ids: string[] | null
  content: HomepageSection['content']
  created_at: number
  updated_at: number
  updated_by: string
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : []
}

function asMedia(value: unknown): ProductMediaItem[] {
  if (!Array.isArray(value)) return []
  return value as ProductMediaItem[]
}

export function mapProduct(row: ProductRow): Product {
  const styleTagIds = (row.product_style_tags ?? []).map((j) => j.style_tag_id)
  return {
    id: row.id,
    name: row.name,
    priceInr: row.price_inr,
    description: row.description,
    photoUrls: asStringArray(row.photo_urls),
    media: asMedia(row.media),
    categoryId: row.category_id,
    styleTagIds,
    collectionId: row.collection_id,
    isNewArrival: row.is_new_arrival,
    isFounderFavourite: row.is_founder_favourite,
    isStatementPick: row.is_statement_pick,
    isBridal: row.is_bridal,
    styleGroup: row.style_group,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  }
}

export function productInputToRow(input: ProductInput, uid: string, now: number, existing?: Product) {
  return {
    name: input.name,
    price_inr: input.priceInr,
    description: input.description,
    photo_urls: input.photoUrls,
    media: input.media ?? [],
    category_id: input.categoryId,
    collection_id: input.collectionId,
    is_new_arrival: input.isNewArrival,
    is_founder_favourite: input.isFounderFavourite,
    is_statement_pick: input.isStatementPick,
    is_bridal: input.isBridal,
    style_group: input.styleGroup,
    updated_at: now,
    updated_by: uid,
    ...(existing
      ? {}
      : {
          created_at: now,
          created_by: uid,
        }),
  }
}

export function mapTaxonomy(row: TaxonomyRow): Category | Collection | StyleTag {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    createdAt: Number(row.created_at),
  }
}

export function mapSection(row: SectionRow): HomepageSection {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    icon: row.icon ?? undefined,
    anchorId: row.anchor_id,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    productSelectionMode: row.product_selection_mode ?? undefined,
    productFlag: row.product_flag ?? undefined,
    productIds: row.product_ids ?? undefined,
    content: row.content ?? {},
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    updatedBy: row.updated_by,
  }
}

export function sectionInputToRow(input: HomepageSectionInput, uid: string, now: number, id?: string) {
  return {
    ...(id ? { id } : {}),
    type: input.type,
    title: input.title,
    subtitle: input.subtitle ?? null,
    icon: input.icon ?? null,
    anchor_id: input.anchorId,
    sort_order: input.sortOrder,
    is_visible: input.isVisible,
    product_selection_mode: input.productSelectionMode ?? null,
    product_flag: input.productFlag ?? null,
    product_ids: input.productIds ?? [],
    content: input.content ?? {},
    updated_at: now,
    updated_by: uid,
    created_at: now,
  }
}

export const TAXONOMY_TABLE: Record<'categories' | 'collections' | 'styleTags', string> = {
  categories: 'categories',
  collections: 'collections',
  styleTags: 'style_tags',
}

export const PRODUCT_SELECT =
  '*, product_style_tags(style_tag_id)'
