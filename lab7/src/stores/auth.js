import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http, HttpError } from '@/api/http.js'
import { AUTH_STORAGE_KEY } from '@/auth/session.js'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const user = ref(null)
  const status = ref('guest')
  const error = ref(null)

  const loginPending = ref(false)
  const restorePending = ref(false)
  let restorePromise = null

  const isAuthenticated = computed(() =>
    status.value === 'authenticated' && accessToken.value && user.value
  )

  const isChecking = computed(() => status.value === 'checking')
  const isGuest = computed(() => status.value === 'guest')
  const isUnavailable = computed(() => status.value === 'unavailable')

  function setError(message) {
    error.value = message
  }

  function clearError() {
    error.value = null
  }

  function clearSession() {
    accessToken.value = null
    user.value = null
    status.value = 'guest'
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    } catch (_) {
      // ignore
    }
  }

  async function login(username, password) {
    if (loginPending.value) return
    loginPending.value = true
    clearError()

    try {
      const result = await http.post('/auth/login', {
        username,
        password,
        expiresInMins: 30,
      })

      accessToken.value = result.accessToken
      user.value = {
        id: result.id,
        username: result.username,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        gender: result.gender,
        image: result.image,
      }
      status.value = 'authenticated'

      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, result.accessToken)
      } catch (_) {
        // ignore
      }
    } catch (cause) {
      clearSession()
      if (cause instanceof HttpError && cause.status === 400) {
        setError('Неправильний логін або пароль')
      } else {
        setError('Не вдалося виконати вхід. Спробуйте пізніше.')
      }
      throw cause
    } finally {
      loginPending.value = false
    }
  }

  async function restore() {
    if (restorePending.value && restorePromise) {
      return restorePromise
    }

    const token = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!token) {
      status.value = 'guest'
      return
    }

    restorePending.value = true
    clearError()
    accessToken.value = token
    status.value = 'checking'

    restorePromise = (async () => {
      try {
        const profile = await http.get('/auth/me', { token })
        user.value = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          gender: profile.gender,
          image: profile.image,
        }
        status.value = 'authenticated'
      } catch (cause) {
        if (cause instanceof HttpError && cause.status === 401) {
          clearSession()
        } else {
          status.value = 'unavailable'
          setError('Не вдалося перевірити сеанс. Перевірте з\'єднання.')
        }
      } finally {
        restorePending.value = false
        restorePromise = null
      }
    })()

    return restorePromise
  }

  function logout() {
    clearSession()
  }

  async function request(path, options = {}) {
    const currentToken = accessToken.value
    const result = await http.request(path, { ...options, token: currentToken })

    if (currentToken === accessToken.value) {
      return result
    }

    throw new Error('Сеанс змінено під час запиту')
  }

  return {
    accessToken,
    user,
    status,
    error,
    loginPending,
    restorePending,
    isAuthenticated,
    isChecking,
    isGuest,
    isUnavailable,
    setError,
    clearError,
    login,
    restore,
    logout,
    request,
  }
})