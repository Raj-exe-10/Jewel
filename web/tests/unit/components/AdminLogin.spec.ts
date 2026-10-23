import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'

const { signInMock } = vi.hoisted(() => ({ signInMock: vi.fn() }))

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: signInMock,
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
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
    signInMock.mockResolvedValue({
      data: { user: { id: 'abc', email: 'owner@amore.test' } },
      error: null,
    })
    const { wrapper, router } = await mountLogin()

    await wrapper.get('input[type="email"]').setValue('owner@amore.test')
    await wrapper.get('input[type="password"]').setValue('correct-password')
    await wrapper.get('form').trigger('submit.prevent')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/admin/homepage'), {
      timeout: 5000,
    })
  })

  it('shows a plain-language error and stays on the login screen for invalid credentials', async () => {
    signInMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })
    const { wrapper, router } = await mountLogin()

    await wrapper.get('input[type="email"]').setValue('owner@amore.test')
    await wrapper.get('input[type="password"]').setValue('wrong')
    await wrapper.get('form').trigger('submit.prevent')
    await vi.waitFor(() => expect(wrapper.text()).toMatch(/incorrect|try again/i))
    expect(router.currentRoute.value.path).toBe('/admin/login')
  })
})
