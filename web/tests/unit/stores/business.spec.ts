import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const upsertMock = vi.fn().mockResolvedValue({ error: null })
const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: maybeSingleMock,
        }),
      }),
      upsert: upsertMock,
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

vi.stubEnv('VITE_WHATSAPP_NUMBER', '919999999999')
vi.stubEnv('VITE_INSTAGRAM_HANDLE', 'amore.jewelry')

const { useBusinessStore } = await import('../../../src/stores/business')

describe('business store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    upsertMock.mockClear()
    maybeSingleMock.mockResolvedValue({ data: null, error: null })
  })

  it('falls back to env values when no profile is loaded', () => {
    const store = useBusinessStore()
    expect(store.whatsappNumberE164).toBe('919999999999')
    expect(store.instagramHandle).toBe('amore.jewelry')
    expect(store.address).toBe('')
  })

  it('uses profile values once refresh loads a row', async () => {
    maybeSingleMock.mockResolvedValue({
      data: {
        payload: {
          whatsappNumberE164: '918888888888',
          instagramHandle: 'amore.official',
          address: '12 Atelier Lane',
          mapUrl: 'https://maps.example.com',
        },
      },
      error: null,
    })
    const store = useBusinessStore()
    await store.refreshProfile()

    expect(store.whatsappNumberE164).toBe('918888888888')
    expect(store.instagramHandle).toBe('amore.official')
    expect(store.address).toBe('12 Atelier Lane')
    expect(store.mapUrl).toBe('https://maps.example.com')
  })

  it('saveProfile upserts business_profile config', async () => {
    const store = useBusinessStore()
    await store.saveProfile({
      whatsappNumberE164: '917777777777',
      instagramHandle: 'amore.shop',
      address: 'Studio Road',
      mapUrl: 'https://maps.example.com/x',
    })

    expect(upsertMock).toHaveBeenCalled()
    expect(upsertMock.mock.calls[0]![0]).toMatchObject({
      id: 'business_profile',
      payload: {
        whatsappNumberE164: '917777777777',
        instagramHandle: 'amore.shop',
      },
    })
  })
})
