import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http, HttpError } from '@/api/http.js'
import { normalizeDraft, validateDraft } from '@/api/productDraft.js'
import { useAuthStore } from './auth.js'

export const useProductsStore = defineStore('products', () => {
  const confirmedChanges = ref({})
  const savePending = ref({})
  const saveAbortControllers = ref({})

  function getConfirmed(id) {
    return confirmedChanges.value[id]
  }

  function hasConfirmed(id) {
    return Object.prototype.hasOwnProperty.call(confirmedChanges.value, id)
  }

  function getDisplayProduct(serverProduct, id) {
    const confirmed = confirmedChanges.value[id]
    if (!confirmed) return serverProduct
    return {
      ...serverProduct,
      title: confirmed.title,
      price: confirmed.price,
      stock: confirmed.stock,
      description: confirmed.description,
    }
  }

  function getBreadcrumbTitle(serverProduct, id) {
    const confirmed = confirmedChanges.value[id]
    if (!confirmed) return serverProduct?.title
    return confirmed.title
  }

  async function save(id, draft) {
    if (savePending.value[id]) return

    const validation = validateDraft(draft)
    if (!validation.valid) {
      throw validation.errors
    }

    const normalized = normalizeDraft(draft)
    const auth = useAuthStore()
    const currentToken = auth.accessToken

    console.log('[ProductsStore] Saving product', id, 'with token:', currentToken ? 'present' : 'MISSING')

    if (!currentToken) {
      throw new Error('No access token available')
    }

    savePending.value[id] = true
    const controller = new AbortController()
    saveAbortControllers.value[id] = controller

    try {
      const result = await http.patch(`/auth/products/${id}`, normalized, {
        signal: controller.signal,
        token: currentToken,
      })

      console.log('[ProductsStore] Save successful:', result)

      if (currentToken !== auth.accessToken) {
        throw new Error('Сеанс змінено під час запиту')
      }

      confirmedChanges.value[id] = {
        title: normalized.title,
        price: normalized.price,
        stock: normalized.stock,
        description: normalized.description,
      }
      return result
    } catch (cause) {
      console.error('[ProductsStore] Save error:', cause)
      if (cause instanceof HttpError && cause.status === 401) {
        throw new Error('Сеанс закінчився')
      }
      throw cause
    } finally {
      savePending.value[id] = false
      saveAbortControllers.value[id] = null
    }
  }

  function cancelSave(id) {
    const controller = saveAbortControllers.value[id]
    if (controller) {
      controller.abort()
    }
  }

  function reset() {
    confirmedChanges.value = {}
    savePending.value = {}
    for (const controller of Object.values(saveAbortControllers.value)) {
      if (controller) controller.abort()
    }
    saveAbortControllers.value = {}
  }

  return {
    confirmedChanges,
    savePending,
    getConfirmed,
    hasConfirmed,
    getDisplayProduct,
    getBreadcrumbTitle,
    save,
    cancelSave,
    reset,
  }
})