// Shared catalogue types — mirrors specs/001-amore-jewelry-catalogue/data-model.md

export type StyleGroup = 'traditional' | 'modern'

export interface Product {
  id: string
  name: string
  priceInr: number
  description: string
  photoUrls: string[]
  categoryId: string
  styleTagIds: string[]
  collectionId: string | null
  isNewArrival: boolean
  isFounderFavourite: boolean
  isStatementPick: boolean
  isBridal: boolean
  styleGroup: StyleGroup | null
  createdAt: number
  updatedAt: number
  createdBy: string
  updatedBy: string
}

/** Fields the manager panel form collects before create/updatedAt/createdBy are attached. */
export type ProductInput = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>

export interface Category {
  id: string
  name: string
  sortOrder: number
  createdAt: number
}

export interface Collection {
  id: string
  name: string
  sortOrder: number
  createdAt: number
}

export interface StyleTag {
  id: string
  name: string
  sortOrder: number
  createdAt: number
}

export type NamedTaxonomyInput = Pick<Category | Collection | StyleTag, 'name' | 'sortOrder'>

/** Filters applied to the public catalogue grid (FR-002/FR-003/FR-004). */
export interface CatalogueFilters {
  categoryId: string | null
  collectionId: string | null
  styleTagId: string | null
  isBridal: boolean | null
  searchTerm: string
}

export const EMPTY_FILTERS: CatalogueFilters = {
  categoryId: null,
  collectionId: null,
  styleTagId: null,
  isBridal: null,
  searchTerm: '',
}
