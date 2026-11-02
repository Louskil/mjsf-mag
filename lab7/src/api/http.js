const API_BASE = 'https://dummyjson.com'

let authTokenProvider = null

export function setAuthTokenProvider(provider) {
  authTokenProvider = provider
}

export function getAuthToken() {
  return authTokenProvider?.()
}

export class HttpError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const { token, signal, ...fetchOptions } = options

  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  const controller = new AbortController()
  const signals = [controller.signal]
  if (signal) signals.push(signal)

  const combinedSignal = AbortSignal.any(signals)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: combinedSignal,
      credentials: 'omit',
    })

    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.message) message = errorData.message
      } catch (_) {
        // ignore
      }
      throw new HttpError(message, response.status)
    }

    return await response.json()
  } catch (cause) {
    if (cause instanceof HttpError) throw cause
    if (cause.name === 'AbortError' || combinedSignal.aborted) {
      throw cause
    }
    throw new HttpError('Мережева помилка', 0)
  }
}

export const http = {
  get(path, options = {}) {
    return request(path, { ...options, method: 'GET' })
  },
  post(path, body, options = {}) {
    return request(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
  patch(path, body, options = {}) {
    return request(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },
  request,
  setAuthTokenProvider,
  getAuthToken,
}