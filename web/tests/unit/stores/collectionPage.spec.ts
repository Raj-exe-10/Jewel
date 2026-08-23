import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/firebase/config', () => ({
  db: {},
  auth: { currentUser: { uid: 'staff-1' } },
}))

const { onSnapshotMock, setDocMock } = vi.hoisted(() => ({
  onSnapshotMock: vi.fn(),
  setDocMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, collection: string, id: string) => `${collection}/${id}`),
  onSnapshot: onSnapshotMock,
  setDoc: setDocMock,
}))

const { useCollectionPageStore } = await import('../../../src/stores/collectionPage')

describe('collection page store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    onSnapshotMock.mockReset()
    setDocMock.mockClear()
  })

  it('uses ten products per row until a saved configuration arrives', () => {
    onSnapshotMock.mockImplementation((_ref, callback) => {
      callback({ exists: () => false })
      return vi.fn()
    })

    const store = useCollectionPageStore()
    store.subscribeToConfig()

    expect(store.productsPerRow).toBe(10)
  })

  it('uses a saved row limit and persists valid admin changes', async () => {
    onSnapshotMock.mockImplementation((_ref, callback) => {
      callback({ exists: () => true, data: () => ({ productsPerRow: 6 }) })
      return vi.fn()
    })

    const store = useCollectionPageStore()
    store.subscribeToConfig()
    await store.saveProductsPerRow(8)

    expect(store.productsPerRow).toBe(8)
    expect(setDocMock).toHaveBeenCalledWith(
      'catalogueConfig/collectionPage',
      expect.objectContaining({ productsPerRow: 8 }),
      { merge: true },
    )
  })
})
