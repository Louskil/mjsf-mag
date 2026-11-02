import { useAuthStore } from '@/stores/auth.js'

const PRIVATE_ROUTE_NAMES = new Set(['manage-products', 'manage-edit'])

export function createRouteGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()

    if (!auth.restorePending && !auth.isAuthenticated && !auth.isChecking) {
      await auth.restore()
    } else if (auth.isChecking || auth.restorePending) {
      await new Promise((resolve) => {
        const unwatch = auth.$subscribe((_mutation, state) => {
          if (!state.restorePending) {
            unwatch()
            resolve()
          }
        })
      })
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth) {
      if (auth.isAuthenticated) {
        next()
        return
      }

      const redirectPath = to.fullPath
      const targetRoute = router.resolve(redirectPath)
      const isInternalTarget = PRIVATE_ROUTE_NAMES.has(targetRoute.name)

      next({
        name: 'login',
        query: isInternalTarget ? { redirect: redirectPath } : {},
      })
      return
    }

    if (to.name === 'login' && auth.isAuthenticated) {
      const redirect = to.query.redirect
      if (typeof redirect === 'string') {
        const targetRoute = router.resolve(redirect)
        if (PRIVATE_ROUTE_NAMES.has(targetRoute.name)) {
          next({ path: redirect, replace: true })
          return
        }
      }
      next({ name: 'manage-products', replace: true })
      return
    }

    next()
  })
}

export function setupSessionLostHandler(router) {
  let handlerAttached = false
  let auth = null

  function attach() {
    if (handlerAttached) return
    handlerAttached = true

    if (!auth) {
      auth = useAuthStore()
    }

    auth.$subscribe((mutation, state) => {
      if (mutation.type === 'direct' && mutation.key === 'status') {
        if (state.status === 'guest' && router.currentRoute.value.matched.some(r => r.meta.requiresAuth)) {
          const currentName = router.currentRoute.value.name
          if (currentName === 'manage-edit') {
            router.replace({ name: 'login', query: {} })
          } else {
            router.replace({ name: 'products', replace: true })
          }
        }
      }
    })
  }

  return { attach }
}