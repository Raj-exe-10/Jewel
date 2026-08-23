import type { Product } from '../types/catalogue'
import type { HomepageSection } from '../types/homepage'

export interface ProductHomepageDependency {
  sectionId: string
  sectionTitle: string
  reason: 'manual' | 'flag'
}

export function findHomepageProductDependencies(
  product: Product,
  sections: HomepageSection[],
): ProductHomepageDependency[] {
  const deps: ProductHomepageDependency[] = []
  for (const section of sections) {
    if (section.type !== 'product_carousel') continue
    if (section.productSelectionMode === 'manual' && section.productIds?.includes(product.id)) {
      deps.push({ sectionId: section.id, sectionTitle: section.title, reason: 'manual' })
      continue
    }
    if (section.productSelectionMode === 'flag' && section.productFlag && product[section.productFlag]) {
      deps.push({ sectionId: section.id, sectionTitle: section.title, reason: 'flag' })
    }
  }
  return deps
}

export function scrubProductIdFromSections(
  sections: HomepageSection[],
  productId: string,
): HomepageSection[] {
  return sections.map((section) => {
    if (!section.productIds?.includes(productId)) return section
    return {
      ...section,
      productIds: section.productIds.filter((id) => id !== productId),
    }
  })
}
