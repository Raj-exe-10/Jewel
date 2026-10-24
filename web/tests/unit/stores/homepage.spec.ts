import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_HOMEPAGE_SECTIONS } from '../../../src/data/defaultSections'
import type { HomepageSection } from '../../../src/types/homepage'

const insertMock = vi.fn().mockResolvedValue({ error: null })
const upsertMock = vi.fn().mockResolvedValue({ error: null })
const updateMock = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))
const deleteMock = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))
const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: maybeSingleMock,
        }),
      }),
      insert: insertMock,
      upsert: upsertMock,
      update: updateMock,
      delete: deleteMock,
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

const { useHomepageStore } = await import('../../../src/stores/homepage')

function makeSection(overrides: Partial<HomepageSection> = {}): HomepageSection {
  return {
    id: 'sec-1',
    type: 'about',
    title: 'About',
    anchorId: 'about',
    sortOrder: 0,
    isVisible: true,
    createdAt: 0,
    updatedAt: 0,
    updatedBy: 'seed',
    content: { bodyParagraphs: ['hello'] },
    ...overrides,
  }
}

function createDraft() {
  return {
    type: 'about' as const,
    title: 'About',
    anchorId: 'about',
    sortOrder: 0,
    isVisible: true,
    content: { bodyParagraphs: ['hello'] },
  }
}

describe('homepage store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    insertMock.mockClear()
    upsertMock.mockClear()
    updateMock.mockClear()
    deleteMock.mockClear()
    vi.stubGlobal('crypto', { randomUUID: () => 'new-section' })
  })

  it('visibleSections hides unpublished sections and sorts by sortOrder', () => {
    const store = useHomepageStore()
    store.$patch({
      sections: [
        makeSection({ id: 'b', title: 'B', sortOrder: 2, isVisible: true }),
        makeSection({ id: 'hidden', title: 'Hidden', sortOrder: 0, isVisible: false }),
        makeSection({ id: 'a', title: 'A', sortOrder: 1, isVisible: true }),
      ],
    })

    expect(store.visibleSections.map((s) => s.id)).toEqual(['a', 'b'])
  })

  it('falls back to default storefront sections when none are loaded yet', () => {
    const store = useHomepageStore()
    const visibleDefaults = DEFAULT_HOMEPAGE_SECTIONS.filter((section) => section.isVisible)
    expect(store.displaySections).toHaveLength(visibleDefaults.length)
    expect(store.displaySections[0]?.type).toBe('hero_banner')
  })

  it('uses remote sections once they exist instead of the defaults', () => {
    const store = useHomepageStore()
    store.$patch({ sections: [makeSection({ id: 'only' })] })
    expect(store.displaySections.map((s) => s.id)).toEqual(['only'])
  })

  it('saveSection creates a new row when no id is given', async () => {
    const store = useHomepageStore()
    const id = await store.saveSection(createDraft())
    expect(id).toBe('new-section')
    expect(insertMock).toHaveBeenCalledTimes(1)
  })

  it('saveSection upserts an existing row', async () => {
    const store = useHomepageStore()
    await store.saveSection(createDraft(), 'sec-1')
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it('setVisibility writes is_visible for the section', async () => {
    const store = useHomepageStore()
    await store.setVisibility('sec-1', false)
    expect(updateMock).toHaveBeenCalled()
  })

  it('deleteSection removes the row', async () => {
    const store = useHomepageStore()
    await store.deleteSection('sec-1')
    expect(deleteMock).toHaveBeenCalled()
  })

  it('reorderSections writes sequential sort_order values', async () => {
    const store = useHomepageStore()
    await store.reorderSections(['c', 'a', 'b'])
    expect(updateMock).toHaveBeenCalledTimes(3)
  })

  it('saveDefaultLayout upserts default_layout config', async () => {
    const store = useHomepageStore()
    store.$patch({ sections: [makeSection({ id: 'keep-me' })] })
    await store.saveDefaultLayout()
    expect(upsertMock).toHaveBeenCalled()
    expect(upsertMock.mock.calls.at(-1)?.[0]).toMatchObject({ id: 'default_layout' })
  })

  it('replaceAllSections upserts snapshot sections and deletes extras', async () => {
    const store = useHomepageStore()
    store.$patch({
      sections: [
        makeSection({ id: 'keep', title: 'Keep' }),
        makeSection({ id: 'drop-me', title: 'Drop' }),
      ],
    })
    await store.replaceAllSections([
      {
        id: 'keep',
        type: 'about',
        title: 'Keep Updated',
        anchorId: 'about',
        sortOrder: 0,
        isVisible: true,
        content: { bodyParagraphs: ['updated'] },
      },
    ])
    expect(upsertMock).toHaveBeenCalled()
    expect(deleteMock).toHaveBeenCalled()
  })

  it('scrubProductFromSections removes the id from product_ids', async () => {
    const store = useHomepageStore()
    store.$patch({
      sections: [makeSection({ id: 'carousel', productIds: ['p1', 'p2'] })],
    })
    await store.scrubProductFromSections('p1')
    expect(updateMock).toHaveBeenCalled()
    expect(store.sections[0]?.productIds).toEqual(['p2'])
  })
})
