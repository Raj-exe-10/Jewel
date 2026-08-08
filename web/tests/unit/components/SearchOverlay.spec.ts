import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const SearchOverlay = (await import('../../../src/components/public/SearchOverlay.vue')).default

describe('SearchOverlay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders nothing when closed', () => {
    const wrapper = mount(SearchOverlay, { props: { open: false } })
    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(false)
  })

  it('renders the search box when open and emits close on the close button', async () => {
    const wrapper = mount(SearchOverlay, { props: { open: true } })
    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(true)

    await wrapper.get('[data-testid="search-overlay-close"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
