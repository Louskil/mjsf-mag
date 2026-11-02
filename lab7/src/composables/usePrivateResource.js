import { ref, watchEffect, toValue } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

export function usePrivateResource(pathFactory) {
  const auth = useAuthStore()
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)

  let activeController = null

  watchEffect(async (onCleanup) => {
    const currentPath = toValue(pathFactory)
    const controller = new AbortController()
    activeController = controller

    error.value = null
    data.value = null
    isLoading.value = true

    onCleanup(() => controller.abort())

    try {
      const result = await auth.request(currentPath, { signal: controller.signal })

      if (activeController !== controller) return

      data.value = result
    } catch (cause) {
      if (activeController !== controller) return
      if (controller.signal.aborted) return

      error.value = cause
    } finally {
      if (activeController === controller) {
        isLoading.value = false
      }
    }
  })

  return { data, error, isLoading }
}