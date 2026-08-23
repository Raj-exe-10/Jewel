import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { DEFAULT_HOMEPAGE_SECTIONS, toFirestoreSection } from '../data/defaultSections'
import { auth, db } from '../firebase/config'
import type { HomepageSection, HomepageSectionInput } from '../types/homepage'

interface HomepageState {
  sections: HomepageSection[]
  isLoading: boolean
  unsubscribers: Array<() => void>
}

export type DefaultLayoutSection = HomepageSectionInput & { id: string }

function sortVisible(sections: HomepageSection[]): HomepageSection[] {
  return [...sections]
    .filter((section) => section.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export const useHomepageStore = defineStore('homepage', {
  state: (): HomepageState => ({
    sections: [],
    isLoading: false,
    unsubscribers: [],
  }),
  getters: {
    visibleSections(state): HomepageSection[] {
      return sortVisible(state.sections)
    },
    displaySections(state): HomepageSection[] {
      const source = state.sections.length > 0 ? state.sections : DEFAULT_HOMEPAGE_SECTIONS
      return sortVisible(source)
    },
    orderedSections(state): HomepageSection[] {
      return [...state.sections].sort((a, b) => a.sortOrder - b.sortOrder)
    },
  },
  actions: {
    subscribeToSections() {
      this.isLoading = true
      const unsub = onSnapshot(collection(db, 'homepageSections'), (snapshot) => {
        this.sections = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as HomepageSection)
        this.isLoading = false
      })
      this.unsubscribers = [unsub]
    },
    unsubscribeAll() {
      this.unsubscribers.forEach((unsub) => unsub())
      this.unsubscribers = []
    },
    async saveSection(input: HomepageSectionInput, id?: string) {
      const uid = auth.currentUser?.uid ?? 'unknown'
      const now = Date.now()
      const payload = toFirestoreSection(input)
      if (id) {
        await setDoc(doc(db, 'homepageSections', id), { ...payload, updatedAt: now, updatedBy: uid }, { merge: true })
        return id
      }
      const created = await addDoc(collection(db, 'homepageSections'), {
        ...payload,
        createdAt: now,
        updatedAt: now,
        updatedBy: uid,
      })
      return created.id
    },
    async setVisibility(id: string, isVisible: boolean) {
      const uid = auth.currentUser?.uid ?? 'unknown'
      await setDoc(
        doc(db, 'homepageSections', id),
        { isVisible, updatedAt: Date.now(), updatedBy: uid },
        { merge: true },
      )
    },
    async deleteSection(id: string) {
      await deleteDoc(doc(db, 'homepageSections', id))
    },
    async reorderSections(orderedIds: string[]) {
      const uid = auth.currentUser?.uid ?? 'unknown'
      const now = Date.now()
      await Promise.all(
        orderedIds.map((id, index) =>
          setDoc(doc(db, 'homepageSections', id), { sortOrder: index, updatedAt: now, updatedBy: uid }, { merge: true }),
        ),
      )
    },
    async saveDefaultLayout(sections: HomepageSection[] = this.sections) {
      const uid = auth.currentUser?.uid ?? 'unknown'
      const now = Date.now()
      const snapshot: DefaultLayoutSection[] = sections.map((section, index) => ({
        ...toFirestoreSection(section),
        id: section.id,
        sortOrder: index,
      }))
      await setDoc(doc(db, 'homepageConfig', 'defaultLayout'), {
        sections: snapshot,
        updatedAt: now,
        updatedBy: uid,
      })
    },
    async loadDefaultLayout(): Promise<DefaultLayoutSection[] | null> {
      const snap = await getDoc(doc(db, 'homepageConfig', 'defaultLayout'))
      if (!snap.exists()) return null
      const data = snap.data() as { sections?: DefaultLayoutSection[] }
      return Array.isArray(data.sections) ? data.sections : null
    },
    async replaceAllSections(sections: DefaultLayoutSection[]) {
      const uid = auth.currentUser?.uid ?? 'unknown'
      const now = Date.now()
      const keepIds = new Set(sections.map((section) => section.id))
      const extras = this.sections.filter((section) => !keepIds.has(section.id))

      await Promise.all(
        sections.map((section, index) => {
          const { id, ...input } = section
          return setDoc(
            doc(db, 'homepageSections', id),
            {
              ...toFirestoreSection({ ...input, sortOrder: index }),
              updatedAt: now,
              updatedBy: uid,
              createdAt: now,
            },
            { merge: true },
          )
        }),
      )
      await Promise.all(extras.map((section) => deleteDoc(doc(db, 'homepageSections', section.id))))
    },
    async scrubProductFromSections(productId: string) {
      const uid = auth.currentUser?.uid ?? 'unknown'
      const now = Date.now()
      const affected = this.sections.filter((section) => section.productIds?.includes(productId))
      await Promise.all(
        affected.map((section) =>
          setDoc(
            doc(db, 'homepageSections', section.id),
            {
              productIds: (section.productIds ?? []).filter((id) => id !== productId),
              updatedAt: now,
              updatedBy: uid,
            },
            { merge: true },
          ),
        ),
      )
      this.sections = this.sections.map((section) =>
        section.productIds?.includes(productId)
          ? { ...section, productIds: section.productIds.filter((id) => id !== productId) }
          : section,
      )
    },
  },
})
