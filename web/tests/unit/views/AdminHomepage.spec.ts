import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_HOMEPAGE_SECTIONS } from '../../../src/data/defaultSections'
import type { HomepageSection } from '../../../src/types/homepage'

const { saveSectionMock, setVisibilityMock, reorderSectionsMock, deleteSectionMock, saveDefaultLayoutMock, loadDefaultLayoutMock, replaceAllSectionsMock } = vi.hoisted(() => ({
  saveSectionMock: vi.fn().mockResolvedValue('new-section-id'),
  setVisibilityMock: vi.fn().mockResolvedValue(undefined),
  reorderSectionsMock: vi.fn().mockResolvedValue(undefined),
  deleteSectionMock: vi.fn().mockResolvedValue(undefined),
  saveDefaultLayoutMock: vi.fn().mockResolvedValue(undefined),
  loadDefaultLayoutMock: vi.fn().mockResolvedValue(null),
  replaceAllSectionsMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../src/firebase/config', () => ({ db: {}, storage: {}, auth: { currentUser: { uid: 'staff-1' } } }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/admin/homepage' }),
}))

const AdminHomepage = (await import('../../../src/views/admin/AdminHomepage.vue')).default
const { useHomepageStore } = await import('../../../src/stores/homepage')
const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const { useAuthStore } = await import('../../../src/stores/auth')

describe('AdminHomepage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    saveSectionMock.mockClear()
    setVisibilityMock.mockClear()
    reorderSectionsMock.mockClear()
    deleteSectionMock.mockClear()
    saveDefaultLayoutMock.mockClear()
    loadDefaultLayoutMock.mockClear()
    replaceAllSectionsMock.mockClear()
    saveSectionMock.mockResolvedValue('new-section-id')
    loadDefaultLayoutMock.mockResolvedValue(null)

    const auth = useAuthStore()
    auth.$patch({ currentUser: { uid: 'staff-1', email: 'owner@amore.test' } as never })

    const homepage = useHomepageStore()
    homepage.$patch({
      sections: structuredClone(DEFAULT_HOMEPAGE_SECTIONS),
      isLoading: false,
    })
    homepage.saveSection = saveSectionMock
    homepage.setVisibility = setVisibilityMock
    homepage.reorderSections = reorderSectionsMock
    homepage.deleteSection = deleteSectionMock
    homepage.saveDefaultLayout = saveDefaultLayoutMock
    homepage.loadDefaultLayout = loadDefaultLayoutMock
    homepage.replaceAllSections = replaceAllSectionsMock
    homepage.subscribeToSections = vi.fn()

    const catalogue = useCatalogueStore()
    catalogue.subscribeToCatalogue = vi.fn()
  })

  function mountPage() {
    return mount(AdminHomepage, {
      global: {
        stubs: {
          HomepageRenderer: { template: '<div data-testid="preview-renderer" />' },
          SectionEditor: {
            props: ['section'],
            emits: ['save', 'cancel'],
            template: '<form data-testid="section-editor"><button type="button" data-testid="cancel-edit" @click="$emit(\'cancel\')">Cancel</button></form>',
          },
          AdminLayout: { template: '<div><slot /></div>' },
          ConfirmDeleteDialog: true,
          ConfirmDialog: {
            props: ['open', 'title', 'message', 'confirmLabel', 'noticeOnly'],
            emits: ['confirm', 'cancel'],
            template:
              '<div v-if="open" data-testid="confirm-dialog"><p>{{ message }}</p><button data-testid="confirm-dialog-confirm" @click="$emit(\'confirm\')">{{ confirmLabel }}</button><button v-if="!noticeOnly" data-testid="confirm-dialog-cancel" @click="$emit(\'cancel\')">Cancel</button></div>',
          },
        },
      },
      attachTo: document.body,
    })
  }

  it('opens the section editor modal when Edit is clicked', async () => {
    const wrapper = mountPage()
    expect(wrapper.find('[data-testid="section-editor-modal"]').exists()).toBe(false)

    await wrapper.findAll('[data-testid="edit-section"]')[0]!.trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="section-editor-modal"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="section-editor"]').exists()).toBe(true)
  })

  it('adds a section then opens the editor for the new id', async () => {
    const wrapper = mountPage()
    await wrapper.get('[data-testid="add-section-button"]').trigger('click')
    await flushPromises()

    expect(saveSectionMock).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-testid="section-editor-modal"]').exists()).toBe(true)
  })

  it('resets preview scroll and bumps remount key after hide', async () => {
    const wrapper = mountPage()
    const preview = wrapper.get('[data-testid="homepage-preview"]').element as HTMLElement
    preview.scrollTop = 400
    const keyBefore = wrapper.get('[data-testid="homepage-preview-inner"]').attributes('data-preview-key')

    await wrapper.findAll('[data-testid="toggle-section-visibility"]')[0]!.trigger('click')
    await flushPromises()

    expect(setVisibilityMock).toHaveBeenCalled()
    expect(preview.scrollTop).toBe(0)
    const keyAfter = wrapper.get('[data-testid="homepage-preview-inner"]').attributes('data-preview-key')
    expect(keyAfter).not.toBe(keyBefore)
  })

  it('rejects saving a section whose title duplicates another section', async () => {
    const wrapper = mountPage()
    saveSectionMock.mockClear()

    const section = structuredClone(DEFAULT_HOMEPAGE_SECTIONS[0]!) as HomepageSection
    section.title = DEFAULT_HOMEPAGE_SECTIONS[1]!.title
    const page = wrapper.vm as unknown as { saveEditing: (s: HomepageSection) => Promise<void> }
    await page.saveEditing(section)
    await flushPromises()

    expect(saveSectionMock).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="homepage-action-error"]').text()).toMatch(/already used/i)
  })

  it('opens a confirmation dialog for restore and does not write until confirmed', async () => {
    const wrapper = mountPage()
    await wrapper.get('[data-testid="restore-defaults"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)
    expect(replaceAllSectionsMock).not.toHaveBeenCalled()
    expect(saveSectionMock).not.toHaveBeenCalled()

    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')
    await flushPromises()

    expect(replaceAllSectionsMock).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-testid="confirm-dialog"]').text()).toMatch(/restored/i)
  })

  it('opens a confirmation dialog for set-as-default and saves on confirm', async () => {
    const wrapper = mountPage()
    await wrapper.get('[data-testid="set-default-layout"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)
    expect(saveDefaultLayoutMock).not.toHaveBeenCalled()

    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')
    await flushPromises()

    expect(saveDefaultLayoutMock).toHaveBeenCalledTimes(1)
  })
})
