import { runId } from './clients'

export function validProductRow(categoryId: string, overrides: Record<string, unknown> = {}) {
  return {
    name: `${runId}-product`,
    price_inr: 1000,
    description: 'qa product',
    photo_urls: [],
    media: [],
    category_id: categoryId,
    style_group: 'traditional' as const,
    ...overrides,
  }
}

/** NEG-PRD catalog factories — expect DB/RLS rejection unless noted. */
export const negativeProductPayloads = {
  missingName: (categoryId: string) =>
    validProductRow(categoryId, { name: null }),
  emptyDescription: (categoryId: string) =>
    validProductRow(categoryId, { description: '' }),
  negativePrice: (categoryId: string) =>
    validProductRow(categoryId, { price_inr: -1 }),
  hugePrice: (categoryId: string) =>
    validProductRow(categoryId, { price_inr: 1e15 }),
  badCategory: () =>
    validProductRow('00000000-0000-0000-0000-000000000099', {
      name: `${runId}-bad-fk`,
    }),
  badStyleGroup: (categoryId: string) =>
    validProductRow(categoryId, { style_group: 'vintage' }),
  nullMedia: (categoryId: string) =>
    validProductRow(categoryId, { media: null }),
}

export function oversizedBlob(bytes: number): Blob {
  return new Blob([new Uint8Array(bytes)], { type: 'image/png' })
}
