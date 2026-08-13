import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'

const { signInMock } = vi.hoisted(() => ({ signInMock: vi.fn() }))

vi.mock('../../../src/firebase/config', () => ({ auth: {}, db: {}, storage: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}))
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: signInMock,
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('../../../src/views/admin/AdminHomepage.vue', () => ({
  default: { name: 'AdminHomepageStub', template: '<div />' },
}))

const { createAppRouter } = await import('../../../src/router/index')
const AdminLogin = (await import('../../../src/views/admin/AdminLogin.vue')).default

describe('AdminLogin', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    signInMock.mockReset()
  })

  async function mountLogin() {
    const router = createAppRouter(createMemoryHistory())
    router.push('/admin/login')
    await router.isReady()
    const wrapper = mount(AdminLogin, { global: { plugins: [router] } })
    return { wrapper, router }
  }

  it('navigates to the homepage manager after a valid login', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'abc', email: 'owner@amore.test' } })
    const { wrapper, router } = await mountLogin()

    await wrapper.get('input[type="email"]').setValue('owner@amore.test')
    await wrapper.get('input[type="password"]').setValue('correct-password')
    await wrapper.get('form').trigger('submit.prevent')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/admin/homepage'), { timeout: 5000 })
  })

  it('shows a plain-language error and stays on the login screen for invalid credentials', async () => {
    signInMock.mockRejectedValue({ code: 'auth/invalid-credential' })
    const { wrapper, router } = await mountLogin()

    await wrapper.get('input[type="email"]').setValue('owner@amore.test')
    await wrapper.get('input[type="password"]').setValue('wrong-password')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/admin/login')
    const errorText = wrapper.get('[data-testid="login-error"]').text()
    expect(errorText.length).toBeGreaterThan(0)
    expect(errorText).not.toMatch(/auth\//)
  })
})
