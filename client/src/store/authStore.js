import { create } from 'zustand'
import { api, bindAccessToken } from '../api/client.js'

let sessionPromise = null

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: '',
  status: 'loading',
  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  clearSession: () => set({ user: null, accessToken: '', status: 'anonymous' }),
  loadSession: () => {
    if (!sessionPromise) {
      sessionPromise = api('/api/v1/auth/refresh', { method: 'POST' })
        .then((data) => {
          set({ user: data.user, accessToken: data.accessToken, status: 'authenticated' })
          return data
        })
        .catch(() => {
          set({ user: null, accessToken: '', status: 'anonymous' })
          return null
        })
    }
    return sessionPromise
  },
  logout: async () => {
    try {
      await api('/api/v1/auth/logout', { method: 'POST' })
    } finally {
      sessionPromise = null
      get().clearSession()
    }
  },
}))

bindAccessToken(() => useAuthStore.getState().accessToken)
