import type { Category, Collection, Product, StyleTag } from '../types/catalogue'

export type SearchSuggestionKind = 'product' | 'category' | 'collection' | 'style'

export interface SearchSuggestion {
  kind: SearchSuggestionKind
  id: string
  label: string
  typeLabel: string
}

export interface SearchSuggestionSource {
  products: Product[]
  categories: Category[]
  collections: Collection[]
  styleTags: StyleTag[]
}

export function buildSearchSuggestions(source: SearchSuggestionSource, query: string): SearchSuggestion[] {
  const term = query.trim().toLowerCase()
  if (!term) return []

  const matches = (name: string) => name.toLowerCase().includes(term)
  const items: SearchSuggestion[] = []

  for (const product of source.products) {
    if (!matches(product.name)) continue
    items.push({ kind: 'product', id: product.id, label: product.name, typeLabel: 'Product' })
    if (items.filter((s) => s.kind === 'product').length >= 6) break
  }

  let categoryCount = 0
  for (const category of source.categories) {
    if (!matches(category.name)) continue
    items.push({ kind: 'category', id: category.id, label: category.name, typeLabel: 'Category' })
    categoryCount += 1
    if (categoryCount >= 3) break
  }

  let collectionCount = 0
  for (const collection of source.collections) {
    if (!matches(collection.name)) continue
    items.push({ kind: 'collection', id: collection.id, label: collection.name, typeLabel: 'Collection' })
    collectionCount += 1
    if (collectionCount >= 3) break
  }

  let styleCount = 0
  for (const style of source.styleTags) {
    if (!matches(style.name)) continue
    items.push({ kind: 'style', id: style.id, label: style.name, typeLabel: 'Style' })
    styleCount += 1
    if (styleCount >= 3) break
  }

  return items
}
