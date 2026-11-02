import { readonly, ref, toValue, watch } from 'vue'

export function useDebouncedValue(source, delay = 400) {
  const value = ref(toValue(source))

  watch(
    () => toValue(source),
    (next, _previous, onCleanup) => {
      const timer = setTimeout(() => {
        value.value = next
      }, delay)

      onCleanup(() => clearTimeout(timer))
    },
  )

  return readonly(value)
}
