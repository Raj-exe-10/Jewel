import { defineStore } from 'pinia'
import { supabase } from '../supabase/client'

const FRIENDLY_ERRORS: Record<string, string> = {
  invalid_credentials: 'That email or password is incorrect. Please try again.',
  'Invalid login credentials': 'That email or password is incorrect. Please try again.',
  email_not_confirmed: 'That email address has not been confirmed yet.',
  over_request_rate_limit: 'Too many attempts. Please wait a moment and try again.',
  user_not_found: 'That email or password is incorrect. Please try again.',
}

function friendlyMessageFor(error: unknown): string {
  const message =
    (error as { message?: string } | undefined)?.message ??
    (error as { code?: string } | undefined)?.code ??
    ''
  if (message && FRIENDLY_ERRORS[message]) return FRIENDLY_ERRORS[message]
  if (/invalid login credentials/i.test(message)) return FRIENDLY_ERRORS.invalid_credentials
  if (/rate/i.test(message)) return FRIENDLY_ERRORS.over_request_rate_limit
  if (/network|fetch/i.test(message)) {
    return 'No internet connection. Please check your connection and try again.'
  }
  return 'Something went wrong signing you in. Please try again.'
}

interface AuthUser {
  uid: string
  email: string | null
}

interface AuthState {
  currentUser: AuthUser | null
  isLoading: boolean
  errorMessage: string | null
  initialized: boolean
  /** Resolves after the first getSession() hydration (and listener attach). */
  ready: Promise<void> | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    isLoading: false,
    errorMessage: null,
    initialized: false,
    ready: null,
  }),
  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      this.errorMessage = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const user = data.user
        this.currentUser = user ? { uid: user.id, email: user.email ?? null } : null
      } catch (error: unknown) {
        this.currentUser = null
        this.errorMessage = friendlyMessageFor(error)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      await supabase.auth.signOut()
      this.currentUser = null
    },

    /** Subscribes to Auth session state; call once at app startup. */
    initAuthListener() {
      if (this.initialized) return this.ready ?? Promise.resolve()
      this.initialized = true
      this.ready = (async () => {
        const { data } = await supabase.auth.getSession()
        const user = data.session?.user
        this.currentUser = user ? { uid: user.id, email: user.email ?? null } : null
        supabase.auth.onAuthStateChange((_event, session) => {
          const next = session?.user
          this.currentUser = next ? { uid: next.id, email: next.email ?? null } : null
        })
      })()
      return this.ready
    },

    /** Await before auth-gated navigation so full reloads don't race the guard. */
    async ensureReady() {
      await this.initAuthListener()
      if (this.ready) await this.ready
    },
  },
})

