import { defineStore } from 'pinia'
import { getCurrentUid, supabase } from '../supabase/client'

export interface BusinessProfile {
  whatsappNumberE164: string
  instagramHandle: string
  address: string
  mapUrl: string
}

interface BusinessState {
  profile: BusinessProfile | null
  loaded: boolean
  channelName: string | null
}

function envFallback(): BusinessProfile {
  return {
    whatsappNumberE164: (import.meta.env.VITE_WHATSAPP_NUMBER as string) || '',
    instagramHandle: (import.meta.env.VITE_INSTAGRAM_HANDLE as string) || '',
    address: '',
    mapUrl: '',
  }
}

function profileFromPayload(payload: Partial<BusinessProfile> | null | undefined): BusinessProfile {
  return {
    whatsappNumberE164: String(payload?.whatsappNumberE164 ?? ''),
    instagramHandle: String(payload?.instagramHandle ?? ''),
    address: String(payload?.address ?? ''),
    mapUrl: String(payload?.mapUrl ?? ''),
  }
}

export const useBusinessStore = defineStore('business', {
  state: (): BusinessState => ({
    profile: null,
    loaded: false,
    channelName: null,
  }),
  getters: {
    whatsappNumberE164(state): string {
      return state.profile?.whatsappNumberE164 || envFallback().whatsappNumberE164
    },
    instagramHandle(state): string {
      return state.profile?.instagramHandle || envFallback().instagramHandle
    },
    address(state): string {
      return state.profile?.address ?? envFallback().address
    },
    mapUrl(state): string {
      return state.profile?.mapUrl ?? envFallback().mapUrl
    },
  },
  actions: {
    async refreshProfile() {
      const { data, error } = await supabase
        .from('homepage_config')
        .select('payload')
        .eq('id', 'business_profile')
        .maybeSingle()
      if (error) throw error
      if (!data) {
        this.profile = null
        this.loaded = true
        return
      }
      this.profile = profileFromPayload(data.payload as Partial<BusinessProfile>)
      this.loaded = true
    },

    subscribeToProfile() {
      void this.refreshProfile().catch(() => {
        this.loaded = true
      })
      if (this.channelName) return
      this.channelName = 'business-profile'
      supabase
        .channel(this.channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'homepage_config', filter: 'id=eq.business_profile' },
          () => {
            void this.refreshProfile()
          },
        )
        .subscribe()
    },


    unsubscribeAll() {
      if (!this.channelName) return
      for (const channel of supabase.getChannels()) {
        if (channel.topic.includes(this.channelName)) void supabase.removeChannel(channel)
      }
      this.channelName = null
    },

    async saveProfile(input: BusinessProfile) {
      const uid = await getCurrentUid()
      const payload: BusinessProfile = {
        whatsappNumberE164: input.whatsappNumberE164.trim(),
        instagramHandle: input.instagramHandle.trim().replace(/^@/, ''),
        address: input.address.trim(),
        mapUrl: input.mapUrl.trim(),
      }
      const { error } = await supabase.from('homepage_config').upsert({
        id: 'business_profile',
        payload,
        updated_at: Date.now(),
        updated_by: uid,
      })
      if (error) throw error
      this.profile = payload
      this.loaded = true
    },
  },
})
