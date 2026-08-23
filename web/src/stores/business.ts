import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { auth, db } from '../firebase/config'

export interface BusinessProfile {
  whatsappNumberE164: string
  instagramHandle: string
  address: string
  mapUrl: string
}

interface BusinessState {
  profile: BusinessProfile | null
  loaded: boolean
  unsubscribers: Array<() => void>
}

function envFallback(): BusinessProfile {
  return {
    whatsappNumberE164: (import.meta.env.VITE_WHATSAPP_NUMBER as string) || '',
    instagramHandle: (import.meta.env.VITE_INSTAGRAM_HANDLE as string) || '',
    address: '',
    mapUrl: '',
  }
}

export const useBusinessStore = defineStore('business', {
  state: (): BusinessState => ({
    profile: null,
    loaded: false,
    unsubscribers: [],
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
    subscribeToProfile() {
      const unsub = onSnapshot(doc(db, 'homepageConfig', 'businessProfile'), (snapshot) => {
        if (!snapshot.exists()) {
          this.profile = null
          this.loaded = true
          return
        }
        const data = snapshot.data() as Partial<BusinessProfile>
        this.profile = {
          whatsappNumberE164: String(data.whatsappNumberE164 ?? ''),
          instagramHandle: String(data.instagramHandle ?? ''),
          address: String(data.address ?? ''),
          mapUrl: String(data.mapUrl ?? ''),
        }
        this.loaded = true
      })
      this.unsubscribers = [unsub]
    },
    unsubscribeAll() {
      this.unsubscribers.forEach((unsub) => unsub())
      this.unsubscribers = []
    },
    async saveProfile(input: BusinessProfile) {
      const uid = auth.currentUser?.uid ?? 'unknown'
      const payload: BusinessProfile = {
        whatsappNumberE164: input.whatsappNumberE164.trim(),
        instagramHandle: input.instagramHandle.trim().replace(/^@/, ''),
        address: input.address.trim(),
        mapUrl: input.mapUrl.trim(),
      }
      await setDoc(
        doc(db, 'homepageConfig', 'businessProfile'),
        { ...payload, updatedAt: Date.now(), updatedBy: uid },
        { merge: true },
      )
      this.profile = payload
      this.loaded = true
    },
  },
})
