<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PAGE_SIZE, createProductsUrl } from '@/api/products.js'
import { useFetch } from '@/composables/useFetch.js'
import { useDebouncedValue } from '@/composables/useDebouncedValue.js'
import ProductSearchForm from '@/components/ProductSearchForm.vue'
import ProductCatalog from '@/components/ProductCatalog.vue'
import CatalogLoadMore from '@/components/CatalogLoadMore.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs.js'

const route = useRoute()
const router = useRouter()

const query = ref(route.query.q ?? '')
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

const breadcrumbs = useBreadcrumbs()

watch(
  query,
  () => {
    abort()
  },
  { flush: 'sync' },
)

watch(debouncedQuery, () => {
  skip.value = 0
  products.value = []
  total.value = 0
})

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

function updateQueryFromInput() {
  const trimmed = query.value.trim()

  if (trimmed === debouncedQuery.value) {
    refetch()
    return
  }

  const nextQuery = trimmed ? { q: trimmed } : {}

  router.replace({
    name: 'products',
    query: nextQuery,
  })
}

watch(
  () => route.query.q,
  (nextQ) => {
    const nextQueryString = typeof nextQ === 'string' ? nextQ : ''
    if (query.value !== nextQueryString) {
      query.value = nextQueryString
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (route.query.q && !query.value) {
    query.value = route.query.q
  }
})
</script>

<template>
  <div class="catalog-view">
    <Breadcrumbs :items="breadcrumbs" />

    <section class="catalog-view__hero">
      <div class="catalog-view__intro">
        <p class="catalog-view__eyebrow">Каталог DummyJSON</p>
        <h2 class="catalog-view__title">
          Речі з ясною
          <em class="catalog-view__title-accent">формою</em>
        </h2>
      </div>

      <ProductSearchForm
        v-model="query"
        :is-loading="isLoading"
        :error="error"
        :shown-count="products.length"
        :total="total"
        @update:modelValue="updateQueryFromInput"
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
  </div>
</template>

<style scoped>
.catalog-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.catalog-view__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.65fr);
  gap: clamp(40px, 7vw, 120px);
  align-items: end;
  padding: clamp(56px, 8vw, 116px) 0 clamp(50px, 7vw, 92px);
}

.catalog-view__eyebrow {
  margin: 0 0 22px;
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.catalog-view__title {
  max-width: 850px;
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(4.5rem, 9.5vw, 9.4rem);
  font-weight: 400;
  letter-spacing: -0.075em;
  line-height: 0.78;
}

.catalog-view__title-accent {
  position: relative;
  display: inline-block;
  padding: 0 0.09em 0.08em 0.02em;
  color: var(--paper);
  font-weight: 400;
  isolation: isolate;
}

.catalog-view__title-accent::before {
  position: absolute;
  z-index: -1;
  inset: 0.12em -0.02em -0.03em -0.03em;
  background: var(--ink);
  content: "";
  transform: rotate(-1.2deg);
}

@media (max-width: 1100px) {
  .catalog-view__hero {
    grid-template-columns: 1fr;
    gap: 54px;
  }

  .catalog-view__title {
    font-size: clamp(4rem, 17vw, 7rem);
  }
}

@media (max-width: 560px) {
  .catalog-view__hero {
    padding-top: 48px;
  }

  .catalog-view__title {
    font-size: clamp(3.25rem, 15vw, 4.5rem);
    line-height: 0.84;
  }

  .catalog-view__title-accent {
    display: block;
    width: max-content;
  }
}
</style>