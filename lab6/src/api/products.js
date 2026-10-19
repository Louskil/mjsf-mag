const API_BASE = 'https://dummyjson.com'

export const PAGE_SIZE = 12
export const API_DELAY = 1500

export function createProductsUrl(query, skip = 0) {
  const q = String(query ?? '').trim()

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(skip),
    delay: String(API_DELAY),
  })

  if (q) {
    params.append('q', q)
  }

  const path = q ? '/products/search' : '/products'
  return `${API_BASE}${path}?${params}`
}
