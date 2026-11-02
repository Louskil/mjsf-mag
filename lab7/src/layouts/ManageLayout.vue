<script setup>
import { computed } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useProductsStore } from '@/stores/products.js'
import { storeToRefs } from 'pinia'

const route = useRoute()
const auth = useAuthStore()
const products = useProductsStore()

const { isAuthenticated, user, logout } = storeToRefs(auth)

const breadcrumbs = computed(() => {
  const items = [{ label: 'Керування', to: { name: 'manage-products' } }]

  const matched = route.matched.slice(-1)[0]
  if (matched?.meta?.breadcrumb?.dynamic === 'product') {
    const id = route.params.id
    const serverProduct = route.matched.find(m => m.components?.default?.name === 'ManageProductsView')?.productData?.[id]
    const title = products.getBreadcrumbTitle(serverProduct, id)
    if (title) {
      items.push({ label: title, to: null })
    }
  } else if (route.name === 'manage-edit') {
    items.push({ label: 'Редагування', to: null })
  }

  return items
})

function handleLogout() {
  logout()
}
</script>

<template>
  <div class="manage-layout">
    <header class="manage-layout__header" v-if="isAuthenticated">
      <nav class="manage-layout__nav" aria-label="Навігація керування">
        <RouterLink :to="{ name: 'manage-products' }" class="manage-layout__brand">
          Керування товарами
        </RouterLink>
        <div class="manage-layout__user">
          <span class="manage-layout__username">{{ user.firstName }} {{ user.lastName }}</span>
          <button class="manage-layout__logout" type="button" @click="handleLogout" aria-label="Вийти">
            Вийти
          </button>
        </div>
      </nav>
    </header>

    <nav v-if="isAuthenticated && breadcrumbs.length > 1" class="manage-layout__breadcrumbs" aria-label="Хлібні крихти керування">
      <ol class="manage-layout__crumbs">
        <li v-for="(item, index) in breadcrumbs" :key="index" class="manage-layout__crumb">
          <RouterLink v-if="item.to && index < breadcrumbs.length - 1" :to="item.to" class="manage-layout__crumb-link">
            {{ item.label }}
          </RouterLink>
          <span v-else class="manage-layout__crumb-current" :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">
            {{ item.label }}
          </span>
          <span v-if="index < breadcrumbs.length - 1" class="manage-layout__crumb-separator" aria-hidden="true">/</span>
        </li>
      </ol>
    </nav>

    <main class="manage-layout__main">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.manage-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.manage-layout__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
}

.manage-layout__nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.manage-layout__brand {
  color: var(--ink);
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.manage-layout__user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.manage-layout__username {
  font-size: 0.9rem;
  color: var(--muted);
}

.manage-layout__logout {
  padding: 8px 16px;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--ink);
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  transition: background 0.15s ease, color 0.15s ease;
}

.manage-layout__logout:hover {
  background: var(--ink);
  color: var(--paper);
}

.manage-layout__logout:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.manage-layout__breadcrumbs {
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

.manage-layout__crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.82rem;
  line-height: 1.5;
}

.manage-layout__crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.manage-layout__crumb-link {
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.manage-layout__crumb-link:hover {
  color: var(--ink);
  border-bottom-color: var(--ink);
}

.manage-layout__crumb-link:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
  border-radius: 2px;
}

.manage-layout__crumb-current {
  color: var(--ink);
  font-weight: 500;
}

.manage-layout__crumb-separator {
  color: var(--line);
  flex-shrink: 0;
}

.manage-layout__main {
  flex: 1;
  padding: clamp(24px, 4vw, 48px) 0;
  min-height: 0;
}

@media (max-width: 560px) {
  .manage-layout__header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .manage-layout__user {
    width: 100%;
    justify-content: space-between;
  }

  .manage-layout__username {
    font-size: 0.8rem;
  }
}
</style>