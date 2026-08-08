import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { signInMock, signOutMock, onAuthStateChangedMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  signOutMock: vi.fn(),
  onAuthStateChangedMock: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: signInMock,
  signOut: signOutMock,
  onAuthStateChanged: onAuthStateChangedMock,
}))

vi.mock('../../../src/firebase/config', () => ({
  auth: {},
}))

import { useAuthStore } from '../../../src/stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    signInMock.mockReset()
    signOutMock.mockReset()
    onAuthStateChangedMock.mockReset()
  })

  it('starts with no current user and not loading', () => {
    const store = useAuthStore()
    expect(store.currentUser).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.errorMessage).toBeNull()
  })

  it('sets currentUser on successful login', async () => {
    const fakeUser = { uid: 'abc123', email: 'owner@amore.test' }
    signInMock.mockResolvedValue({ user: fakeUser })

    const store = useAuthStore()
    await store.login('owner@amore.test', 'correct-password')

    expect(signInMock).toHaveBeenCalledWith(expect.anything(), 'owner@amore.test', 'correct-password')
    expect(store.currentUser).toEqual(fakeUser)
    expect(store.errorMessage).toBeNull()
  })

  it('sets a plain-language error message on invalid credentials, never a raw code', async () => {
    signInMock.mockRejectedValue({ code: 'auth/invalid-credential' })

    const store = useAuthStore()
    await store.login('owner@amore.test', 'wrong-password')

    expect(store.currentUser).toBeNull()
    expect(store.errorMessage).toBeTruthy()
    expect(store.errorMessage).not.toMatch(/auth\//)
    expect(store.errorMessage).not.toMatch(/firebase/i)
  })

  it('clears currentUser on logout', async () => {
    signOutMock.mockResolvedValue(undefined)
    const store = useAuthStore()
    store.$patch({ currentUser: { uid: 'abc123', email: 'owner@amore.test' } as never })

    await store.logout()

    expect(signOutMock).toHaveBeenCalled()
    expect(store.currentUser).toBeNull()
  })
})
