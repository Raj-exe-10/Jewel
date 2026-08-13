export function normalizeTaxonomyName(name: string): string {
  return name.trim().toLowerCase()
}

export interface NamedTaxonomyItem {
  id: string
  name: string
  createdAt: number
}

export interface DuplicateGroup {
  keepId: string
  dropIds: string[]
  name: string
}

export function findDuplicateGroups(items: NamedTaxonomyItem[]): DuplicateGroup[] {
  const byName = new Map<string, NamedTaxonomyItem[]>()
  for (const item of items) {
    const key = normalizeTaxonomyName(item.name)
    const list = byName.get(key) ?? []
    list.push(item)
    byName.set(key, list)
  }

  const groups: DuplicateGroup[] = []
  for (const [, group] of byName) {
    if (group.length < 2) continue
    const sorted = [...group].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
    const keep = sorted[0]!
    groups.push({
      keepId: keep.id,
      dropIds: sorted.slice(1).map((item) => item.id),
      name: keep.name,
    })
  }
  return groups
}

type TaxonomyName = 'categories' | 'collections' | 'styleTags'

export interface CollapseProduct {
  id: string
  categoryId: string
  collectionId: string | null
  styleTagIds: string[]
}

export interface TaxonomyCollapsePlan {
  deleteIds: Array<{ taxonomy: TaxonomyName; id: string }>
  productUpdates: Array<{
    id: string
    categoryId: string
    collectionId: string | null
    styleTagIds: string[]
  }>
}

export function planTaxonomyCollapse(input: {
  categories: NamedTaxonomyItem[]
  collections: NamedTaxonomyItem[]
  styleTags: NamedTaxonomyItem[]
  products: CollapseProduct[]
}): TaxonomyCollapsePlan {
  const categoryMap = new Map<string, string>()
  const collectionMap = new Map<string, string>()
  const styleTagMap = new Map<string, string>()
  const deleteIds: TaxonomyCollapsePlan['deleteIds'] = []

  for (const group of findDuplicateGroups(input.categories)) {
    for (const id of group.dropIds) {
      categoryMap.set(id, group.keepId)
      deleteIds.push({ taxonomy: 'categories', id })
    }
  }
  for (const group of findDuplicateGroups(input.collections)) {
    for (const id of group.dropIds) {
      collectionMap.set(id, group.keepId)
      deleteIds.push({ taxonomy: 'collections', id })
    }
  }
  for (const group of findDuplicateGroups(input.styleTags)) {
    for (const id of group.dropIds) {
      styleTagMap.set(id, group.keepId)
      deleteIds.push({ taxonomy: 'styleTags', id })
    }
  }

  const productUpdates: TaxonomyCollapsePlan['productUpdates'] = []
  for (const product of input.products) {
    const categoryId = categoryMap.get(product.categoryId) ?? product.categoryId
    const collectionId =
      product.collectionId === null
        ? null
        : (collectionMap.get(product.collectionId) ?? product.collectionId)
    const styleTagIds = [
      ...new Set(product.styleTagIds.map((id) => styleTagMap.get(id) ?? id)),
    ]
    const changed =
      categoryId !== product.categoryId ||
      collectionId !== product.collectionId ||
      styleTagIds.length !== product.styleTagIds.length ||
      styleTagIds.some((id, index) => id !== product.styleTagIds[index])
    if (changed) {
      productUpdates.push({ id: product.id, categoryId, collectionId, styleTagIds })
    }
  }

  return { deleteIds, productUpdates }
}
