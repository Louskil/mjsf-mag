<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useProductsStore } from '@/stores/products.js'
import { usePrivateResource } from '@/composables/usePrivateResource.js'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const products = useProductsStore()

const { request } = storeToRefs(auth)

const skip = ref(0)
const LIMIT = 12
const isLoadingMore = ref(false)

const pathFactory = computed(() => `/auth/products?limit=${LIMIT}&skip=${skip.value}`)

const { data: pageData, error, isLoading, abort: abortResource } = usePrivateResource(pathFactory)

const displayProducts = computed(() => {
  if (!pageData.value) return []
  return pageData.value.products.map((product) => products.getDisplayProduct(product, product.id))
})

const hasMore = computed(() => pageData.value && displayProducts.value.length < pageData.value.total)

const breadcrumbs = [{ label: 'Керування', to: { name: 'manage-products' } }]

let pendingNavigation = false

watch(() => route.query, () => {
  if (pendingNavigation) return
  skip.value = 0
}, { immediate: true })

async function loadNext() {
  if (isLoading.value || isLoadingMore.value || !hasMore.value || error.value) return
  if (skip.value + LIMIT >= (pageData.value?.total ?? 0)) return

  isLoadingMore.value = true
  try {
    skip.value += LIMIT
  } finally {
    isLoadingMore.value = false
  }
}

async function loadPrev() {
  if (isLoading.value || isLoadingMore.value || skip.value === 0) return

  isLoadingMore.value = true
  try {
    skip.value = Math.max(0, skip.value - LIMIT)
  } finally {
    isLoadingMore.value = false
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(price)
}

function formatStock(stock) {
  return stock > 0 ? `У наявності · ${stock}` : 'Немає в наявності'
}
</script>

<template>
  <div class="manage-products-view">
    <Breadcrumbs :items="breadcrumbs" />

    <header class="manage-products-view__header">
      <h2 class="manage-products-view__title">Список товарів</h2>
      <p class="manage-products-view__subtitle">Приватні дані · Зміни діють до reload або виходу</p>
    </header>

    <div v-if="isLoading && !pageData" class="manage-products-view__loading" aria-live="polite">
      <div class="manage-products-view__spinner" aria-hidden="true"></div>
      <p>Завантажуємо список…</p>
    </div>

    <div v-else-if="error && !pageData" class="manage-products-view__error" role="alert">
      <p class="manage-products-view__error-title">Не вдалося завантажити список</p>
      <p class="manage-products-view__error-text">{{ error.message }}</p>
      <button class="manage-products-view__retry" type="button" @click="abortResource">
        Повторити запит
      </button>
    </div>

    <div v-else class="manage-products-view__content">
      <table class="manage-products-view__table" aria-label="Таблиця товарів">
        <thead>
          <tr>
            <th scope="col">Назва</th>
            <th scope="col">Ціна</th>
            <th scope="col">Залишок</th>
            <th scope="col"><span class="visually-hidden">Дії</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in displayProducts" :key="product.id" class="manage-products-view__row">
            <td class="manage-products-view__cell manage-products-view__cell--title">{{ product.title }}</td>
            <td class="manage-products-view__cell manage-products-view__cell--price">{{ formatPrice(product.price) }}</td>
            <td class="manage-products-view__cell manage-products-view__cell--stock">{{ formatStock(product.stock) }}</td>
            <td class="manage-products-view__cell manage-products-view__cell--action">
              <RouterLink
                :to="{ name: 'manage-edit', params: { id: product.id } }"
                class="manage-products-view__edit-link"
              >
                Редагувати
              </RouterLink>
            </td>
          </tr>
          <tr v-if="!displayProducts.length" class="manage-products-view__empty-row">
            <td colspan="4" class="manage-products-view__empty">Товари відсутні</td>
          </tr>
        </tbody>
      </table>

      <div class="manage-products-view__pagination">
        <button
          class="manage-products-view__page-btn"
          type="button"
          @click="loadPrev"
          :disabled="isLoading.value || isLoadingMore.value || skip.value === 0"
          :aria-busy="isLoadingMore.value"
        >
          Попередня
        </button>

        <span class="manage-products-view__page-info" aria-live="polite">
          {{ skip.value + 1 }}–{{ Math.min(skip.value + LIMIT, pageData?.total ?? 0) }} з {{ pageData?.total ?? 0 }}
        </span>

        <button
          class="manage-products-view__page-btn"
          type="button"
          @click="loadNext"
          :disabled="isLoading.value || isLoadingMore.value || !hasMore"
          :aria-busy="isLoadingMore.value"
        >
          Наступна
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manage-products-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.manage-products-view__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.manage-products-view__title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.manage-products-view__subtitle {
  margin: 0;
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.manage-products-view__loading,
.manage-products-view__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: clamp(40px, 6vw, 80px);
  background: var(--paper);
  border: 1px solid var(--line);
  text-align: center;
}

.manage-products-view__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--line);
  border-top-color: var(--signal);
  border-radius: 50%;
  animation: manage-spin 0.8s linear infinite;
}

@keyframes manage-spin {
  to { transform: rotate(360deg); }
}

.manage-products-view__error-title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.manage-products-view__error-text {
  margin: 0;
  color: var(--muted);
}

.manage-products-view__retry {
  padding: 12px 24px;
  color: var(--ink);
  background: var(--acid);
  border: 0;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
}

.manage-products-view__retry:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.manage-products-view__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manage-products-view__table {
  width: 100%;
  border-collapse: collapse;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}

.manage-products-view__table th,
.manage-products-view__table td {
  padding: 14px 18px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.manage-products-view__table thead {
  background: var(--canvas);
}

.manage-products-view__table th {
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.manage-products-view__table tbody tr:last-child td {
  border-bottom: 0;
}

.manage-products-view__table tbody tr:hover td {
  background: var(--canvas);
}

.manage-products-view__cell--title {
  max-width: 400px;
  font-weight: 500;
}

.manage-products-view__cell--price {
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.95rem;
  white-space: nowrap;
}

.manage-products-view__cell--stock {
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.85rem;
  color: var(--muted);
  white-space: nowrap;
}

.manage-products-view__edit-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  color: var(--ink);
  background: var(--acid);
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  min-height: 44px;
  min-width: 44px;
  transition: background 0.15s ease;
}

.manage-products-view__edit-link:hover {
  background: #c8eb3a;
}

.manage-products-view__edit-link:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.manage-products-view__empty-row td {
  text-align: center;
  padding: 48px 18px;
  color: var(--muted);
}

.manage-products-view__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid var(--line);
}

.manage-products-view__page-btn {
  padding: 10px 20px;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--ink);
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
  transition: background 0.15s ease, color 0.15s ease;
}

.manage-products-view__page-btn:hover:not(:disabled) {
  background: var(--ink);
  color: var(--paper);
}

.manage-products-view__page-btn:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.manage-products-view__page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.manage-products-view__page-info {
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.8rem;
  color: var(--muted);
  white-space: nowrap;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 768px) {
  .manage-products-view__table {
    display: block;
    overflow-x: auto;
  }

  .manage-products-view__cell--title {
    max-width: none;
    white-space: nowrap;
  }
}

@media (max-width: 560px) {
  .manage-products-view__pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>