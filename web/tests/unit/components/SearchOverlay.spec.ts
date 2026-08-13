import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const SearchOverlay = (await import('../../../src/components/public/SearchOverlay.vue')).default

describe('SearchOverlay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
  })

  it('renders nothing when closed', () => {
    const wrapper = mount(SearchOverlay, { props: { open: false } })
    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(false)
  })

  it('renders the search input when open and emits close on the close button', async () => {
    const wrapper = mount(SearchOverlay, { props: { open: true } })
    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(true)

    await wrapper.get('[data-testid="search-overlay-close"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('updates the catalogue search filter and scrolls to results on input', async () => {
    const store = useCatalogueStore()
    const scrollSpy = document.getElementById('catalogue')!.scrollIntoView as ReturnType<typeof vi.fn>
    const wrapper = mount(SearchOverlay, { props: { open: true }, attachTo: document.body })

    const input = wrapper.get('input')
    await input.setValue('kundan')
    await input.trigger('input')

    expect(store.filters.searchTerm).toBe('kundan')
    expect(scrollSpy).toHaveBeenCalled()
    wrapper.unmount()
  })
})
