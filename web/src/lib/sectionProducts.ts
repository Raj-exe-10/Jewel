import type { Product } from '../types/catalogue'
import type { HomepageSection } from '../types/homepage'

export function productsForSection(section: HomepageSection, products: Product[]): Product[] {
  if (section.type !== 'product_carousel') return []

  if (section.productSelectionMode === 'manual') {
    const byId = new Map(products.map((product) => [product.id, product]))
    return (section.productIds ?? []).flatMap((id) => {
      const product = byId.get(id)
      return product ? [product] : []
    })
  }

  const flag = section.productFlag
  if (!flag) return []
  return products.filter((product) => product[flag])
}
