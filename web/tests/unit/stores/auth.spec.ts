import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { signInMock, signOutMock, onAuthStateChangeMock, getSessionMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  signOutMock: vi.fn(),
  onAuthStateChangeMock: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  getSessionMock: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
}))

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: signInMock,
      signOut: signOutMock,
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

// ensureReady used by router in other suites; keep getSession resolving in this mock.

import { useAuthStore } from '../../../src/stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    signInMock.mockReset()
    signOutMock.mockReset()
    onAuthStateChangeMock.mockClear()
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null })
  })

  it('starts with no current user and not loading', () => {
    const store = useAuthStore()
    expect(store.currentUser).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.errorMessage).toBeNull()
  })

  it('sets currentUser on successful login', async () => {
    const fakeUser = { id: 'abc123', email: 'owner@amore.test' }
    signInMock.mockResolvedValue({ data: { user: fakeUser }, error: null })

    const store = useAuthStore()
    await store.login('owner@amore.test', 'correct-password')

    expect(signInMock).toHaveBeenCalledWith({
      email: 'owner@amore.test',
      password: 'correct-password',
    })
    expect(store.currentUser).toEqual({ uid: 'abc123', email: 'owner@amore.test' })
    expect(store.errorMessage).toBeNull()
  })

  it('sets a plain-language error message on invalid credentials, never a raw code', async () => {
    signInMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    const store = useAuthStore()
    await store.login('owner@amore.test', 'wrong-password')

    expect(store.currentUser).toBeNull()
    expect(store.errorMessage).toBeTruthy()
    expect(store.errorMessage).not.toMatch(/auth\//)
    expect(store.errorMessage).not.toMatch(/supabase/i)
  })

  it('clears currentUser on logout', async () => {
    signOutMock.mockResolvedValue({ error: null })
    const store = useAuthStore()
    store.$patch({ currentUser: { uid: 'abc123', email: 'owner@amore.test' } })

    await store.logout()

    expect(signOutMock).toHaveBeenCalled()
    expect(store.currentUser).toBeNull()
  })
})
