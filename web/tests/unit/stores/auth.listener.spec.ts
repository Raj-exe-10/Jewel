import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getSessionMock = vi.fn()
const onAuthStateChangeMock = vi.fn()
const signInMock = vi.fn()

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
      signInWithPassword: signInMock,
      signOut: vi.fn(),
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

const { useAuthStore } = await import('../../../src/stores/auth')

describe('auth store session listener + negative login', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getSessionMock.mockReset()
    onAuthStateChangeMock.mockReset()
    signInMock.mockReset()
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null })
    onAuthStateChangeMock.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
  })

  it('initAuthListener hydrates session once and ignores second call', async () => {
    getSessionMock.mockResolvedValue({
      data: {
        session: { user: { id: 'u1', email: 'owner@amore.test' } },
      },
      error: null,
    })
    const store = useAuthStore()
    store.initAuthListener()
    store.initAuthListener()
    await vi.waitFor(() => expect(store.currentUser?.uid).toBe('u1'))
    expect(getSessionMock).toHaveBeenCalledTimes(1)
    expect(onAuthStateChangeMock).toHaveBeenCalledTimes(1)
  })

  it('onAuthStateChange clears user on signed-out event', async () => {
    let listener: ((event: string, session: unknown) => void) | undefined
    onAuthStateChangeMock.mockImplementation((cb: (event: string, session: unknown) => void) => {
      listener = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    const store = useAuthStore()
    store.initAuthListener()
    await Promise.resolve()
    listener?.('SIGNED_IN', { user: { id: 'u2', email: 'staff@amore.test' } })
    expect(store.currentUser).toEqual({ uid: 'u2', email: 'staff@amore.test' })
    listener?.('SIGNED_OUT', null)
    expect(store.currentUser).toBeNull()
  })

  it('maps network failures to a friendly offline message', async () => {
    signInMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'Failed to fetch' },
    })
    const store = useAuthStore()
    await store.login('owner@amore.test', 'x')
    expect(store.errorMessage).toMatch(/internet|connection/i)
    expect(store.currentUser).toBeNull()
  })

  it('maps rate-limit style messages', async () => {
    signInMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'over_request_rate_limit' },
    })
    const store = useAuthStore()
    await store.login('owner@amore.test', 'x')
    expect(store.errorMessage).toMatch(/too many attempts/i)
  })
})
