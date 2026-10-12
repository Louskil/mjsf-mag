<script setup>
import { computed, ref, watch } from 'vue'
import { API_DELAY, PAGE_SIZE, createProductsUrl } from './api/products.js'
import CatalogLoadMore from './components/CatalogLoadMore.vue'
import ProductCatalog from './components/ProductCatalog.vue'
import ProductSearchForm from './components/ProductSearchForm.vue'
import { useDebouncedValue } from './composables/useDebouncedValue.js'
import { useFetch } from './composables/useFetch.js'

const query = ref('')
const debouncedQuery = useDebouncedValue(query, 400)

const skip = ref(0)
const products = ref([])
const total = ref(0)

const requestUrl = computed(() =>
  createProductsUrl(debouncedQuery.value, skip.value),
)

const { data, error, isLoading, abort, refetch } = useFetch(requestUrl)

const hasMore = computed(
  () => total.value > 0 && products.value.length < total.value,
)

// Сирий query скасовує активний запит одразу, ще до завершення debounce.
watch(
  query,
  () => {
    abort()
  },
  { flush: 'sync' },
)

// Новий пошуковий рядок скидає пагінацію й накопичені сторінки.
watch(debouncedQuery, () => {
  skip.value = 0
  products.value = []
  total.value = 0
})

// Нова сторінка: перша заміняє список, наступні додаються без повторення id.
watch(data, (page) => {
  if (!page) {
    return
  }

  if (skip.value === 0) {
    products.value = page.products
  } else {
    const knownIds = new Set(products.value.map((product) => product.id))

    products.value = [
      ...products.value,
      ...page.products.filter((product) => !knownIds.has(product.id)),
    ]
  }

  total.value = page.total
})

function loadMore() {
  if (!hasMore.value) {
    return
  }

  if (isLoading.value) {
    return
  }

  if (error.value) {
    return
  }

  if (query.value !== debouncedQuery.value) {
    return
  }

  skip.value += PAGE_SIZE
}
</script>

<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <a class="storefront__brand" href="#" aria-label="Forma, на початок">
        FORMA<span class="storefront__brand-mark">®</span>
      </a>
      <p class="storefront__edition">Лабораторна / 05</p>
      <p class="storefront__note">Каталог і composables</p>
    </header>

    <section class="storefront__hero">
      <div class="storefront__intro">
        <p class="storefront__eyebrow">Каталог DummyJSON</p>
        <h1 class="storefront__title">
          Речі з ясною
          <em class="storefront__title-accent">формою</em>
        </h1>
      </div>

      <ProductSearchForm
        v-model="query"
        :is-loading="isLoading"
        :error="error"
        :shown-count="products.length"
        :total="total"
        :delay="API_DELAY"
      />
    </section>

    <section class="catalog" aria-labelledby="catalog-title">
      <div class="catalog__heading">
        <h2 id="catalog-title" class="catalog__title">Початкова добірка</h2>
        <span class="catalog__count">
          {{ products.length.toString().padStart(2, '0') }}
        </span>
      </div>

      <ProductCatalog
        :products="products"
        :is-loading="isLoading"
        :error="error"
        @retry="refetch"
      />

      <CatalogLoadMore
        v-if="products.length"
        :loaded="products.length"
        :total="total"
        :is-loading="isLoading"
        :error="error"
        :has-more="hasMore"
        @load-more="loadMore"
        @retry="refetch"
      />
    </section>

    <footer class="storefront__footer">
      <p>
        Бікулов Тимур Дамірович · 7.F2.25-2 · Vue 3 · Vite · Node.js 22 LTS
      </p>
      <a
        href="https://dummyjson.com/docs/products"
        target="_blank"
        rel="noreferrer"
      >
        Дані: DummyJSON
      </a>
    </footer>
  </main>
</template>
