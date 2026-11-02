export const AUTH_STORAGE_KEY = 'forma_auth_token'

export function getStoredToken() {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY)
  } catch (_) {
    return null
  }
}

export function setStoredToken(token) {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, token)
  } catch (_) {
    // ignore
  }
}

export function clearStoredToken() {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (_) {
    // ignore
  }
}