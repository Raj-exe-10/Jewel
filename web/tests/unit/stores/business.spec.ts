import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/firebase/config', () => ({ db: {}, auth: { currentUser: { uid: 'staff-1' } } }))

const { setDocMock, onSnapshotMock } = vi.hoisted(() => ({
  setDocMock: vi.fn().mockResolvedValue(undefined),
  onSnapshotMock: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, col: string, id: string) => `${col}/${id}`),
  setDoc: setDocMock,
  onSnapshot: onSnapshotMock,
}))

vi.stubEnv('VITE_WHATSAPP_NUMBER', '919999999999')
vi.stubEnv('VITE_INSTAGRAM_HANDLE', 'amore.jewelry')

const { useBusinessStore } = await import('../../../src/stores/business')

describe('business store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setDocMock.mockClear()
    onSnapshotMock.mockClear()
  })

  it('falls back to env values when no Firestore profile is loaded', () => {
    const store = useBusinessStore()
    expect(store.whatsappNumberE164).toBe('919999999999')
    expect(store.instagramHandle).toBe('amore.jewelry')
    expect(store.address).toBe('')
  })

  it('uses Firestore profile values once subscribed snapshot arrives', () => {
    const store = useBusinessStore()
    store.subscribeToProfile()
    const callback = onSnapshotMock.mock.calls[0]![1] as (snap: {
      exists: () => boolean
      data: () => Record<string, unknown>
    }) => void
    callback({
      exists: () => true,
      data: () => ({
        whatsappNumberE164: '918888888888',
        instagramHandle: 'amore.official',
        address: '12 Atelier Lane',
        mapUrl: 'https://maps.example.com',
      }),
    })

    expect(store.whatsappNumberE164).toBe('918888888888')
    expect(store.instagramHandle).toBe('amore.official')
    expect(store.address).toBe('12 Atelier Lane')
    expect(store.mapUrl).toBe('https://maps.example.com')
  })

  it('saveProfile writes homepageConfig/businessProfile', async () => {
    const store = useBusinessStore()
    await store.saveProfile({
      whatsappNumberE164: '917777777777',
      instagramHandle: 'amore.shop',
      address: 'Studio Road',
      mapUrl: 'https://maps.example.com/x',
    })

    expect(setDocMock).toHaveBeenCalled()
    expect(setDocMock.mock.calls[0]![0]).toBe('homepageConfig/businessProfile')
  })
})
