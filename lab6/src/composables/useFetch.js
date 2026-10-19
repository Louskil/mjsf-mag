import { ref, toValue, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)

  let activeController = null
  const refetchCount = ref(0)

  watchEffect(async (onCleanup) => {
    refetchCount.value
    const currentUrl = toValue(url)
    const controller = new AbortController()
    activeController = controller

    error.value = null
    isLoading.value = true

    onCleanup(() => controller.abort())

    try {
      const response = await fetch(currentUrl, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const page = await response.json()

      if (activeController !== controller) {
        return
      }

      data.value = page
    } catch (cause) {
      if (activeController !== controller) {
        return
      }

      if (controller.signal.aborted) {
        return
      }

      error.value = cause
    } finally {
      if (activeController === controller) {
        isLoading.value = false
      }
    }
  })

  function abort() {
    if (!activeController) {
      return
    }

    activeController.abort()
    activeController = null
    isLoading.value = false
  }

  function refetch() {
    refetchCount.value += 1
  }

  return { data, error, isLoading, abort, refetch }
}
