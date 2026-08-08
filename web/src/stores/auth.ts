import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { auth } from '../firebase/config'

const FRIENDLY_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'That email or password is incorrect. Please try again.',
  'auth/invalid-email': 'That email address doesn\'t look right. Please check and try again.',
  'auth/user-not-found': 'That email or password is incorrect. Please try again.',
  'auth/wrong-password': 'That email or password is incorrect. Please try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'No internet connection. Please check your connection and try again.',
}

function friendlyMessageFor(code: unknown): string {
  if (typeof code === 'string' && FRIENDLY_ERRORS[code]) {
    return FRIENDLY_ERRORS[code]
  }
  return 'Something went wrong signing you in. Please try again.'
}

interface AuthState {
  currentUser: Pick<User, 'uid' | 'email'> | null
  isLoading: boolean
  errorMessage: string | null
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    isLoading: false,
    errorMessage: null,
    initialized: false,
  }),
  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      this.errorMessage = null
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        this.currentUser = credential.user
      } catch (error: unknown) {
        this.currentUser = null
        const code = (error as { code?: string } | undefined)?.code
        this.errorMessage = friendlyMessageFor(code)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      await signOut(auth)
      this.currentUser = null
    },

    /** Subscribes to Firebase Auth session state; call once at app startup. */
    initAuthListener() {
      if (this.initialized) return
      this.initialized = true
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user
      })
    },
  },
})
