import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_HOMEPAGE_SECTIONS } from '../../../src/data/defaultSections'
import type { HomepageSection } from '../../../src/types/homepage'

vi.mock('../../../src/firebase/config', () => ({ db: {}, auth: { currentUser: { uid: 'staff-1' } } }))

const { addDocMock, setDocMock, deleteDocMock } = vi.hoisted(() => ({
  addDocMock: vi.fn().mockResolvedValue({ id: 'new-section' }),
  setDocMock: vi.fn().mockResolvedValue(undefined),
  deleteDocMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'homepageSections'),
  doc: vi.fn((_db: unknown, _col: string, id: string) => id),
  addDoc: addDocMock,
  setDoc: setDocMock,
  deleteDoc: deleteDocMock,
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
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

describe('homepage store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    addDocMock.mockClear()
    setDocMock.mockClear()
    deleteDocMock.mockClear()
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

  it('falls back to default storefront sections when Firestore has none yet', () => {
    const store = useHomepageStore()
    expect(store.displaySections).toHaveLength(DEFAULT_HOMEPAGE_SECTIONS.length)
    expect(store.displaySections[0]?.type).toBe('hero_banner')
  })

  it('uses remote sections once they exist instead of the defaults', () => {
    const store = useHomepageStore()
    store.$patch({ sections: [makeSection({ id: 'only' })] })
    expect(store.displaySections.map((s) => s.id)).toEqual(['only'])
  })

  it('saveSection creates a new document when no id is given', async () => {
    const store = useHomepageStore()
    const id = await store.saveSection(createDraft())
    expect(id).toBe('new-section')
    expect(addDocMock).toHaveBeenCalledTimes(1)
  })

  it('saveSection merges an existing document', async () => {
    const store = useHomepageStore()
    await store.saveSection(createDraft(), 'sec-1')
    expect(setDocMock).toHaveBeenCalledTimes(1)
  })

  it('setVisibility writes isVisible for the section', async () => {
    const store = useHomepageStore()
    await store.setVisibility('sec-1', false)
    expect(setDocMock).toHaveBeenCalled()
  })

  it('deleteSection removes the Firestore document', async () => {
    const store = useHomepageStore()
    await store.deleteSection('sec-1')
    expect(deleteDocMock).toHaveBeenCalled()
  })

  it('reorderSections writes sequential sortOrder values', async () => {
    const store = useHomepageStore()
    await store.reorderSections(['c', 'a', 'b'])
    expect(setDocMock).toHaveBeenCalledTimes(3)
  })

  it('saveDefaultLayout writes the current sections snapshot to homepageConfig', async () => {
    const store = useHomepageStore()
    store.$patch({ sections: [makeSection({ id: 'keep-me' })] })
    await store.saveDefaultLayout()
    expect(setDocMock).toHaveBeenCalled()
    const args = setDocMock.mock.calls.at(-1)
    expect(args?.[0]).toBe('defaultLayout')
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
      {
        id: 'brand-new',
        type: 'contact',
        title: 'Contact',
        anchorId: 'contact',
        sortOrder: 1,
        isVisible: true,
        content: { bodyParagraphs: ['hi'] },
      },
    ])

    expect(setDocMock).toHaveBeenCalled()
    expect(deleteDocMock).toHaveBeenCalledWith('drop-me')
  })

  it('scrubProductFromSections removes the id from productIds', async () => {
    const store = useHomepageStore()
    store.$patch({
      sections: [
        makeSection({
          id: 'manual',
          type: 'product_carousel',
          productSelectionMode: 'manual',
          productIds: ['p1', 'p2'],
          content: { variant: 'carousel' },
        }),
      ],
    })
    await store.scrubProductFromSections('p1')
    expect(setDocMock).toHaveBeenCalled()
    expect(store.sections[0]!.productIds).toEqual(['p2'])
  })
})

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
