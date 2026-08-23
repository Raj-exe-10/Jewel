<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import ConfirmDeleteDialog from '../../components/admin/ConfirmDeleteDialog.vue'
import ConfirmDialog from '../../components/admin/ConfirmDialog.vue'
import SectionEditor from '../../components/admin/SectionEditor.vue'
import SectionList from '../../components/admin/SectionList.vue'
import HomepageRenderer from '../../components/public/HomepageRenderer.vue'
import { createSectionDraft, DEFAULT_HOMEPAGE_SECTIONS, toSectionInput } from '../../data/defaultSections'
import { useBusinessStore } from '../../stores/business'
import { useCatalogueStore } from '../../stores/catalogue'
import { useHomepageStore, type DefaultLayoutSection } from '../../stores/homepage'
import { SECTION_TYPE_LABELS, type HomepageSection, type SectionType } from '../../types/homepage'

const homepage = useHomepageStore()
const catalogue = useCatalogueStore()
const business = useBusinessStore()

const editing = ref<HomepageSection | null>(null)
const pendingDelete = ref<HomepageSection | null>(null)
const addType = ref<SectionType>('product_carousel')
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)
const isSavingDefaults = ref(false)
const isAdding = ref(false)
const previewKey = ref(0)
const previewEl = ref<HTMLElement | null>(null)

type LayoutDialog =
  | { kind: 'restore-confirm' }
  | { kind: 'set-default-confirm' }
  | { kind: 'notice'; title: string; message: string }
  | null

const layoutDialog = ref<LayoutDialog>(null)

const sectionTypes = Object.keys(SECTION_TYPE_LABELS) as SectionType[]

onMounted(() => {
  catalogue.subscribeToCatalogue()
  homepage.subscribeToSections()
  business.subscribeToProfile()
})

const listSections = computed(() => homepage.orderedSections)

function refreshPreview() {
  previewKey.value += 1
  void nextTick(() => {
    if (previewEl.value) previewEl.value.scrollTop = 0
  })
}

function openEditor(id: string) {
  editing.value =
    homepage.sections.find((section) => section.id === id) ??
    listSections.value.find((section) => section.id === id) ??
    null
}

function factoryAsDefaultLayout(): DefaultLayoutSection[] {
  return DEFAULT_HOMEPAGE_SECTIONS.map((section) => ({
    ...toSectionInput(section),
    id: section.id,
  }))
}

function requestRestoreDefaults() {
  layoutDialog.value = { kind: 'restore-confirm' }
}

function requestSetDefaultLayout() {
  layoutDialog.value = { kind: 'set-default-confirm' }
}

async function onLayoutDialogConfirm() {
  const dialog = layoutDialog.value
  if (!dialog) return

  if (dialog.kind === 'notice') {
    layoutDialog.value = null
    return
  }

  if (dialog.kind === 'set-default-confirm') {
    try {
      await homepage.saveDefaultLayout(homepage.orderedSections)
      layoutDialog.value = {
        kind: 'notice',
        title: 'Default layout saved',
        message: 'Your current homepage layout is now the default. Restore will use this layout next time.',
      }
    } catch {
      layoutDialog.value = null
      actionError.value = 'Could not save the default layout. Please try again.'
    }
    return
  }

  isSavingDefaults.value = true
  actionError.value = null
  actionSuccess.value = null
  try {
    const saved = await homepage.loadDefaultLayout()
    const snapshot = saved && saved.length > 0 ? saved : factoryAsDefaultLayout()
    await homepage.replaceAllSections(snapshot)
    refreshPreview()
    layoutDialog.value = {
      kind: 'notice',
      title: 'Layout restored',
      message: 'Default layout restored.',
    }
  } catch {
    layoutDialog.value = null
    actionError.value = 'Could not restore the default layout. Please try again.'
  } finally {
    isSavingDefaults.value = false
  }
}

async function addSection() {
  actionError.value = null
  actionSuccess.value = null
  isAdding.value = true
  try {
    const existingTitles = homepage.sections.map((section) => section.title)
    const draft = createSectionDraft(addType.value, homepage.sections.length, existingTitles)
    const id = await homepage.saveSection(draft)
    // Optimistic local row so the editor can open immediately even before snapshot.
    if (!homepage.sections.some((section) => section.id === id)) {
      homepage.sections = [
        ...homepage.sections,
        {
          ...draft,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          updatedBy: 'local',
        },
      ]
    }
    actionSuccess.value = `Added “${draft.title}”. Edit the details below.`
    openEditor(id)
    refreshPreview()
  } catch {
    actionError.value = 'Could not add that section. Please try again.'
  } finally {
    isAdding.value = false
  }
}

async function toggleVisibility(id: string) {
  const section = homepage.sections.find((item) => item.id === id)
  if (!section) return
  const next = !section.isVisible
  section.isVisible = next
  try {
    await homepage.setVisibility(id, next)
    refreshPreview()
  } catch {
    section.isVisible = !next
    actionError.value = 'Could not update visibility. Please try again.'
  }
}

async function moveSection(id: string, direction: -1 | 1) {
  const ids = listSections.value.map((section) => section.id)
  const index = ids.indexOf(id)
  const next = index + direction
  if (index < 0 || next < 0 || next >= ids.length) return
  const copy = [...ids]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item!)

  const previous = homepage.sections.map((section) => ({ id: section.id, sortOrder: section.sortOrder }))
  homepage.sections = homepage.sections.map((section) => {
    const sortOrder = copy.indexOf(section.id)
    return sortOrder >= 0 ? { ...section, sortOrder } : section
  })

  try {
    await homepage.reorderSections(copy)
    refreshPreview()
  } catch {
    homepage.sections = homepage.sections.map((section) => {
      const prior = previous.find((entry) => entry.id === section.id)
      return prior ? { ...section, sortOrder: prior.sortOrder } : section
    })
    actionError.value = 'Could not reorder sections. Please try again.'
  }
}

async function saveEditing(section: HomepageSection) {
  actionError.value = null
  actionSuccess.value = null
  const duplicate = homepage.sections.some(
    (item) =>
      item.id !== section.id && item.title.trim().toLowerCase() === section.title.trim().toLowerCase(),
  )
  if (duplicate) {
    actionError.value = 'That section name is already used. Choose a different title.'
    return
  }
  try {
    await homepage.saveSection(toSectionInput(section), section.id)
    editing.value = null
    actionSuccess.value = 'Section saved.'
    refreshPreview()
  } catch {
    actionError.value = 'Could not save that section. Please try again.'
  }
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  try {
    const id = pendingDelete.value.id
    await homepage.deleteSection(id)
    if (editing.value?.id === id) editing.value = null
    pendingDelete.value = null
    actionSuccess.value = 'Section deleted.'
    refreshPreview()
  } catch {
    actionError.value = 'Could not delete that section. Please try again.'
  }
}

const layoutDialogTitle = computed(() => {
  const dialog = layoutDialog.value
  if (!dialog) return ''
  if (dialog.kind === 'restore-confirm') return 'Restore default layout'
  if (dialog.kind === 'set-default-confirm') return 'Set as default layout'
  return dialog.title
})

const layoutDialogMessage = computed(() => {
  const dialog = layoutDialog.value
  if (!dialog) return ''
  if (dialog.kind === 'restore-confirm') {
    return 'This will replace the current homepage with your saved default layout (or the factory layout if none is saved). Extra sections not in the default will be removed.'
  }
  if (dialog.kind === 'set-default-confirm') {
    return 'Save the current homepage sections as the new default layout? Restore will use this snapshot later.'
  }
  return dialog.message
})

const layoutDialogConfirmLabel = computed(() => {
  const dialog = layoutDialog.value
  if (!dialog) return 'Confirm'
  if (dialog.kind === 'restore-confirm') return 'Restore'
  if (dialog.kind === 'set-default-confirm') return 'Save as default'
  return 'OK'
})
</script>

<template>
  <AdminLayout>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-neutral-900">Homepage</h1>
        <p class="mt-1 text-sm text-neutral-600">Add, hide, reorder, and edit every storefront section.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="addType" data-testid="add-section-type" class="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option v-for="type in sectionTypes" :key="type" :value="type">{{ SECTION_TYPE_LABELS[type] }}</option>
        </select>
        <button
          type="button"
          data-testid="add-section-button"
          class="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          :disabled="isAdding"
          @click="addSection"
        >
          {{ isAdding ? 'Adding…' : '+ Add Section' }}
        </button>
        <button
          type="button"
          data-testid="set-default-layout"
          class="rounded-full border border-neutral-300 px-4 py-2 text-sm"
          @click="requestSetDefaultLayout"
        >
          Set as default layout
        </button>
        <button
          type="button"
          data-testid="restore-defaults"
          class="rounded-full border border-neutral-300 px-4 py-2 text-sm"
          :disabled="isSavingDefaults"
          @click="requestRestoreDefaults"
        >
          Restore default layout
        </button>
      </div>
    </div>

    <p v-if="actionError" class="mb-4 text-sm text-red-600" data-testid="homepage-action-error">{{ actionError }}</p>
    <p v-if="actionSuccess" class="mb-4 text-sm text-emerald-700" data-testid="homepage-action-success">{{ actionSuccess }}</p>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <SectionList
          :sections="listSections"
          @edit="openEditor"
          @remove="(id) => (pendingDelete = homepage.sections.find((s) => s.id === id) ?? null)"
          @toggle="toggleVisibility"
          @move="moveSection"
        />
      </div>
      <div class="overflow-hidden rounded-lg border border-amore-gold/30 bg-white">
        <p class="border-b border-neutral-100 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-500">Live preview</p>
        <div ref="previewEl" class="max-h-[80vh] overflow-y-auto" data-testid="homepage-preview">
          <div :data-preview-key="String(previewKey)" data-testid="homepage-preview-inner">
            <HomepageRenderer
              :key="previewKey"
              :sections="homepage.displaySections"
              :business-phone-e164="business.whatsappNumberE164"
              :instagram-handle="business.instagramHandle"
              show-empty-placeholders
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="editing"
      data-testid="section-editor-modal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit section"
    >
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="font-medium">Edit section</h2>
          <button
            type="button"
            data-testid="close-section-editor"
            class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            @click="editing = null"
          >
            Close
          </button>
        </div>
        <SectionEditor :section="editing" @save="saveEditing" @cancel="editing = null" />
      </div>
    </div>

    <ConfirmDeleteDialog
      :open="pendingDelete !== null"
      :item-label="pendingDelete?.title ?? ''"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />

    <ConfirmDialog
      :open="layoutDialog !== null"
      :title="layoutDialogTitle"
      :message="layoutDialogMessage"
      :confirm-label="layoutDialogConfirmLabel"
      :notice-only="layoutDialog?.kind === 'notice'"
      @confirm="onLayoutDialogConfirm"
      @cancel="layoutDialog = null"
    />
  </AdminLayout>
</template>
