<script setup>
import { computed, ref, watchEffect, toValue } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { useFetch } from '@/composables/useFetch.js'

const route = useRoute()

const id = computed(() => route.params.id)

const productUrl = computed(() => {
  const currentId = id.value
  if (!/^\d+$/.test(String(currentId))) {
    return null
  }
  return `https://dummyjson.com/products/${currentId}?delay=800`
})

const { data: product, error: productError, isLoading: productLoading, abort, refetch } = useFetch(productUrl)

const productTitle = computed(() => {
  if (productLoading.value) {
    return `Товар №${id.value}`
  }
  if (product.value) {
    return product.value.title
  }
  return 'Товар не знайдено'
})

function isValidId(value) {
  return /^\d+$/.test(String(value))
}

watchEffect(() => {
  if (!isValidId(id.value)) {
    abort()
  }
})
</script>

<template>
  <div class="product-layout">
    <div v-if="productLoading" class="product-layout__loading" aria-live="polite">
      <div class="product-layout__spinner" aria-hidden="true"></div>
      <p>Завантажуємо товар №{{ id }}…</p>
    </div>

    <div v-else-if="!isValidId(id) || productError || !product" class="product-layout__message">
      <p class="product-layout__message-index">ERR / PRODUCT</p>
      <h2 class="product-layout__message-title">
        <template v-if="!isValidId(id)">Некоректний ідентифікатор</template>
        <template v-else-if="productError">Товар не знайдено</template>
        <template v-else>Товар не знайдено</template>
      </h2>
      <p class="product-layout__message-text">
        <template v-if="!isValidId(id)">
          Ідентифікатор товару має бути додатним цілим числом.
        </template>
        <template v-else-if="productError">
          Товар із ідентифікатором {{ id }} не існує.
        </template>
        <template v-else>
          Товар із ідентифікатором {{ id }} не існує.
        </template>
      </p>
      <button
        v-if="productError"
        class="product-layout__retry"
        type="button"
        @click="refetch"
      >
        Повторити запит
      </button>
      <RouterLink v-else :to="{ name: 'products' }" class="product-layout__back">
        Повернутися до каталогу
      </RouterLink>
    </div>

    <div v-else class="product-layout__content">
      <header class="product-layout__header">
        <img
          class="product-layout__image"
          :src="product.thumbnail"
          :alt="product.title"
          width="420"
          height="320"
        />
        <div class="product-layout__header-meta">
          <div class="product-layout__meta-row">
            <span class="product-layout__category">{{ product.category }}</span>
            <span class="product-layout__rating">{{ product.rating.toFixed(1) }} / 5</span>
          </div>
          <h1 class="product-layout__title">{{ product.title }}</h1>
          <p class="product-layout__description">{{ product.description }}</p>
          <div class="product-layout__footer">
            <strong class="product-layout__price">
              {{ new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(product.price) }}
            </strong>
            <span class="product-layout__stock">
              {{ product.stock > 0 ? `У наявності · ${product.stock}` : 'Немає в наявності' }}
            </span>
          </div>
        </div>
      </header>

      <nav class="product-layout__tabs" aria-label="Розділи товару">
        <RouterLink
          :to="{ name: 'product-overview', params: { id }, query: { q: $route.query.q } }"
          class="product-layout__tab"
          aria-current="page"
        >
          Огляд
        </RouterLink>
        <RouterLink
          :to="{ name: 'product-reviews', params: { id }, query: { q: $route.query.q } }"
          class="product-layout__tab"
        >
          Відгуки
        </RouterLink>
      </nav>

      <RouterView v-slot="{ Component }">
        <component :is="Component" :product="product" />
      </RouterView>
    </div>
  </div>
</template>