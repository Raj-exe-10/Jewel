import { defineStore } from 'pinia'
import { DEFAULT_HOMEPAGE_SECTIONS, toFirestoreSection } from '../data/defaultSections'
import { getCurrentUid, supabase } from '../supabase/client'
import { mapSection, sectionInputToRow } from '../supabase/mappers'
import type { HomepageSection, HomepageSectionInput } from '../types/homepage'

interface HomepageState {
  sections: HomepageSection[]
  isLoading: boolean
  channelName: string | null
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
    channelName: null,
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
    async refreshSections() {
      const { data, error } = await supabase.from('homepage_sections').select('*')
      if (error) throw error
      this.sections = (data ?? []).map((row) => mapSection(row as never))
      this.isLoading = false
    },

    subscribeToSections() {
      this.isLoading = true
      void this.refreshSections().catch(() => {
        this.isLoading = false
      })
      if (this.channelName) return
      this.channelName = 'homepage-sections'
      supabase
        .channel(this.channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_sections' }, () => {
          void this.refreshSections()
        })
        .subscribe()
    },


    unsubscribeAll() {
      if (!this.channelName) return
      for (const channel of supabase.getChannels()) {
        if (channel.topic.includes(this.channelName)) void supabase.removeChannel(channel)
      }
      this.channelName = null
    },

    async saveSection(input: HomepageSectionInput, id?: string) {
      const uid = await getCurrentUid()
      const now = Date.now()
      const payload = toFirestoreSection(input)
      if (id) {
        const row = sectionInputToRow(payload, uid, now, id)
        const { error } = await supabase.from('homepage_sections').upsert(row)
        if (error) throw error
        return id
      }
      const newId = crypto.randomUUID()
      const row = sectionInputToRow(payload, uid, now, newId)
      const { error } = await supabase.from('homepage_sections').insert(row)
      if (error) throw error
      return newId
    },

    async setVisibility(id: string, isVisible: boolean) {
      const uid = await getCurrentUid()
      const { error } = await supabase
        .from('homepage_sections')
        .update({ is_visible: isVisible, updated_at: Date.now(), updated_by: uid })
        .eq('id', id)
      if (error) throw error
    },

    async deleteSection(id: string) {
      const { error } = await supabase.from('homepage_sections').delete().eq('id', id)
      if (error) throw error
    },

    async reorderSections(orderedIds: string[]) {
      const uid = await getCurrentUid()
      const now = Date.now()
      await Promise.all(
        orderedIds.map(async (id, index) => {
          const { error } = await supabase
            .from('homepage_sections')
            .update({ sort_order: index, updated_at: now, updated_by: uid })
            .eq('id', id)
          if (error) throw error
        }),
      )
    },

    async saveDefaultLayout(sections?: HomepageSection[]) {
      const list = sections ?? this.sections
      const uid = await getCurrentUid()
      const now = Date.now()
      const snapshot: DefaultLayoutSection[] = list.map((section, index) => ({
        ...toFirestoreSection(section),
        id: section.id,
        sortOrder: index,
      }))
      const { error } = await supabase.from('homepage_config').upsert({
        id: 'default_layout',
        payload: { sections: snapshot },
        updated_at: now,
        updated_by: uid,
      })
      if (error) throw error
    },

    async loadDefaultLayout(): Promise<DefaultLayoutSection[] | null> {
      const { data, error } = await supabase
        .from('homepage_config')
        .select('payload')
        .eq('id', 'default_layout')
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      const payload = data.payload as { sections?: DefaultLayoutSection[] }
      return Array.isArray(payload?.sections) ? payload.sections : null
    },

    async replaceAllSections(sections: DefaultLayoutSection[]) {
      const uid = await getCurrentUid()
      const now = Date.now()
      const keepIds = new Set(sections.map((section) => section.id))
      const extras = this.sections.filter((section) => !keepIds.has(section.id))

      await Promise.all(
        sections.map(async (section, index) => {
          const { id, ...input } = section
          const row = sectionInputToRow(
            toFirestoreSection({ ...input, sortOrder: index }),
            uid,
            now,
            id,
          )
          const { error } = await supabase.from('homepage_sections').upsert(row)
          if (error) throw error
        }),
      )
      await Promise.all(
        extras.map(async (section) => {
          const { error } = await supabase.from('homepage_sections').delete().eq('id', section.id)
          if (error) throw error
        }),
      )
    },

    async scrubProductFromSections(productId: string) {
      const uid = await getCurrentUid()
      const now = Date.now()
      const affected = this.sections.filter((section) => section.productIds?.includes(productId))
      await Promise.all(
        affected.map(async (section) => {
          const { error } = await supabase
            .from('homepage_sections')
            .update({
              product_ids: (section.productIds ?? []).filter((id) => id !== productId),
              updated_at: now,
              updated_by: uid,
            })
            .eq('id', section.id)
          if (error) throw error
        }),
      )
      this.sections = this.sections.map((section) =>
        section.productIds?.includes(productId)
          ? { ...section, productIds: section.productIds.filter((id) => id !== productId) }
          : section,
      )
    },
  },
})
