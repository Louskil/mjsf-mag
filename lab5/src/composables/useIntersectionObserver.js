import { onMounted, onUnmounted, toValue, watch } from 'vue'

export function useIntersectionObserver(target, callback, options = {}) {
  let observer = null

  const run = () => {
    const handler = toValue(callback)

    if (typeof handler === 'function') {
      handler()
    }
  }

  onMounted(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting === true) {
            run()
          }
        }
      },
      { root: null, ...options },
    )

    const element = toValue(target)

    if (element) {
      observer.observe(element)
    }
  })

  const stopWatching = watch(
    () => toValue(target),
    (next, previous) => {
      if (!observer) {
        return
      }

      if (previous) {
        observer.unobserve(previous)
      }

      if (next) {
        observer.observe(next)
      }
    },
  )

  onUnmounted(() => {
    stopWatching()

    if (observer) {
      observer.disconnect()
      observer = null
    }
  })
}
