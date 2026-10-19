import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'

export function useBreadcrumbs(productTitle) {
  const route = useRoute()

  return computed(() => {
    const title = toValue(productTitle)
    const items = []

    for (const record of route.matched) {
      const breadcrumb = record.meta?.breadcrumb
      if (!breadcrumb) {
        continue
      }

      let label
      let to = null

      if (breadcrumb.dynamic === 'product') {
        label = title
        if (title && route.params.id) {
          to = {
            name: breadcrumb.name,
            params: { id: route.params.id },
            query: route.query.q ? { q: route.query.q } : undefined,
          }
        }
      } else {
        label = breadcrumb.label
        if (breadcrumb.name) {
          to = {
            name: breadcrumb.name,
            params: route.params.id ? { id: route.params.id } : undefined,
            query: route.query.q ? { q: route.query.q } : undefined,
          }
        }
      }

      if (label) {
        items.push({ label, to })
      }
    }

    return items
  })
}