import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'



vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/admin/business' }),
}))

const saveProfileMock = vi.fn().mockResolvedValue(undefined)

const AdminBusiness = (await import('../../../src/views/admin/AdminBusiness.vue')).default
const { useBusinessStore } = await import('../../../src/stores/business')
const { useAuthStore } = await import('../../../src/stores/auth')
const { useHomepageStore } = await import('../../../src/stores/homepage')

describe('AdminBusiness', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    saveProfileMock.mockClear()
    const auth = useAuthStore()
    auth.$patch({ currentUser: { uid: 'staff-1', email: 'owner@amore.test' } as never })
    const business = useBusinessStore()
    business.$patch({
      profile: {
        whatsappNumberE164: '919999999999',
        instagramHandle: 'amore.jewelry',
        address: 'Old address',
        mapUrl: '',
      },
      loaded: true,
    })
    business.saveProfile = saveProfileMock
    business.subscribeToProfile = vi.fn()
    const homepage = useHomepageStore()
    homepage.subscribeToSections = vi.fn()
    homepage.saveSection = vi.fn().mockResolvedValue('studio')
    homepage.$patch({ sections: [] })
  })

  it('saves the edited business contact fields', async () => {
    const wrapper = mount(AdminBusiness, {
      global: { stubs: { AdminLayout: { template: '<div><slot /></div>' } } },
    })

    await wrapper.get('[data-testid="business-whatsapp"]').setValue('918888888888')
    await wrapper.get('[data-testid="business-instagram"]').setValue('amore.official')
    await wrapper.get('[data-testid="business-address"]').setValue('12 Atelier Lane')
    await wrapper.get('[data-testid="business-map-url"]').setValue('https://maps.example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(saveProfileMock).toHaveBeenCalledWith({
      whatsappNumberE164: '918888888888',
      instagramHandle: 'amore.official',
      address: '12 Atelier Lane',
      mapUrl: 'https://maps.example.com',
    })
  })
})
