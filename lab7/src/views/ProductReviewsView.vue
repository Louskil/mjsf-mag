<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs.js'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const breadcrumbs = useBreadcrumbs(computed(() => props.product.title))

const reviews = computed(() => props.product.reviews ?? [])
const hasReviews = computed(() => reviews.value.length > 0)

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="product-reviews">
    <Breadcrumbs :items="breadcrumbs" />

    <section class="product-reviews__content">
      <header class="product-reviews__header">
        <h2 class="product-reviews__title">Відгуки покупців</h2>
        <span v-if="hasReviews" class="product-reviews__count">{{ reviews.length }} відгук(ів)</span>
      </header>

      <div v-if="hasReviews" class="product-reviews__list">
        <article
          v-for="review in reviews"
          :key="review.id || review.reviewerName + review.date"
          class="product-reviews__item"
        >
          <header class="product-reviews__item-header">
            <div class="product-reviews__author">
              <strong class="product-reviews__name">{{ review.reviewerName }}</strong>
              <time class="product-reviews__date" :datetime="review.date">{{ formatDate(review.date) }}</time>
            </div>
            <div class="product-reviews__rating">
              <span v-for="star in 5" :key="star" class="product-reviews__star" :class="{ 'product-reviews__star--filled': star <= review.rating }">
                ★
              </span>
              <span class="product-reviews__score">{{ review.rating.toFixed(1) }} / 5</span>
            </div>
          </header>
          <p class="product-reviews__comment">{{ review.comment }}</p>
        </article>
      </div>

      <div v-else class="product-reviews__empty">
        <p class="product-reviews__empty-title">Відгуків немає</p>
        <p class="product-reviews__empty-text">
          Цей товар ще не має відгуків. Будьте першим, хто поділиться враженнями!
        </p>
      </div>

      <RouterLink :to="{ name: 'product-overview', params: { id: product.id }, query: { q: $route.query.q } }" class="product-reviews__back">
        ← Повернутися до огляду
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.product-reviews {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-reviews__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-reviews__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  padding: 20px 24px;
}

.product-reviews__title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.product-reviews__count {
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.product-reviews__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-reviews__item {
  background: var(--paper);
  border: 1px solid var(--line);
  padding: 24px;
}

.product-reviews__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.product-reviews__author {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-reviews__name {
  font-size: 1rem;
  font-weight: 600;
}

.product-reviews__date {
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.product-reviews__rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-reviews__star {
  color: var(--line);
  font-size: 1.1rem;
  line-height: 1;
}

.product-reviews__star--filled {
  color: #f5c518;
}

.product-reviews__score {
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.75rem;
  color: var(--muted);
}

.product-reviews__comment {
  margin: 0;
  line-height: 1.6;
  color: var(--ink);
}

.product-reviews__empty {
  text-align: center;
  padding: clamp(40px, 6vw, 88px);
  background: var(--paper);
  border: 1px solid var(--line);
}

.product-reviews__empty-title {
  margin: 0 0 12px;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(2.4rem, 5vw, 5rem);
  font-weight: 400;
  letter-spacing: -0.06em;
}

.product-reviews__empty-text {
  max-width: 520px;
  margin: 0 auto;
  color: var(--muted);
  line-height: 1.6;
}

.product-reviews__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: var(--ink);
  text-decoration: none;
  font-weight: 600;
  border: 1px solid var(--ink);
  background: transparent;
  border-radius: 4px;
  transition: background 0.15s ease, color 0.15s ease;
  align-self: flex-start;
}

.product-reviews__back:hover {
  background: var(--ink);
  color: var(--paper);
}

.product-reviews__back:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}
</style>