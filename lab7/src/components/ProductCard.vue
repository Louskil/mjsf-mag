<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const priceFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})
</script>

<template>
  <article class="product-card">
    <div class="product-card__visual">
      <span
        v-if="product.discountPercentage >= 10"
        class="product-card__discount"
      >
        −{{ Math.round(product.discountPercentage) }}%
      </span>
      <img
        class="product-card__image"
        :src="product.thumbnail"
        :alt="product.title"
        loading="lazy"
        width="420"
        height="320"
      />
    </div>

    <div class="product-card__body">
      <div class="product-card__meta">
        <span class="product-card__category">{{ product.category }}</span>
        <span class="product-card__rating">
          {{ product.rating.toFixed(1) }} / 5
        </span>
      </div>

      <h2 class="product-card__title">
        <RouterLink
          :to="{ name: 'product-overview', params: { id: product.id }, query: { q: $route.query.q } }"
          class="product-card__link"
        >
          {{ product.title }}
        </RouterLink>
      </h2>
      <p class="product-card__description">{{ product.description }}</p>

      <div class="product-card__footer">
        <strong class="product-card__price">
          {{ priceFormatter.format(product.price) }}
        </strong>
        <span class="product-card__stock">
          {{ product.stock > 0 ? `У наявності · ${product.stock}` : 'Немає в наявності' }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card__title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: 1.55rem;
  font-weight: 400;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.product-card__link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.product-card__link:hover {
  color: var(--signal);
  border-bottom-color: var(--signal);
}

.product-card__link:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
  border-radius: 2px;
}
</style>