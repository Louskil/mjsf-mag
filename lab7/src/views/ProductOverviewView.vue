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
</script>

<template>
  <div class="product-overview">
    <Breadcrumbs :items="breadcrumbs" />

    <article class="product-overview__content">
      <section class="product-overview__section">
        <h2 class="product-overview__heading">Опис</h2>
        <p class="product-overview__text">{{ product.description }}</p>
      </section>

      <section class="product-overview__section">
        <h2 class="product-overview__heading">Характеристики</h2>
        <dl class="product-overview__specs">
          <div class="product-overview__spec">
            <dt>Категорія</dt>
            <dd>{{ product.category }}</dd>
          </div>
          <div class="product-overview__spec">
            <dt>Бренд</dt>
            <dd>{{ product.brand || '—' }}</dd>
          </div>
          <div class="product-overview__spec">
            <dt>SKU</dt>
            <dd>{{ product.sku || '—' }}</dd>
          </div>
          <div class="product-overview__spec">
            <dt>Вага</dt>
            <dd>{{ product.weight }} г</dd>
          </div>
          <div class="product-overview__spec">
            <dt>Розміри</dt>
            <dd>
              {{ product.dimensions?.width }} ×
              {{ product.dimensions?.height }} ×
              {{ product.dimensions?.depth }} см
            </dd>
          </div>
          <div class="product-overview__spec">
            <dt>Гарантія</dt>
            <dd>{{ product.warrantyInformation || '—' }}</dd>
          </div>
          <div class="product-overview__spec">
            <dt>Доставка</dt>
            <dd>{{ product.shippingInformation || '—' }}</dd>
          </div>
          <div class="product-overview__spec">
            <dt>Політика повернення</dt>
            <dd>{{ product.returnPolicy || '—' }}</dd>
          </div>
          <div class="product-overview__spec">
            <dt>Доступність</dt>
            <dd>
              {{ product.availabilityStatus || (product.stock > 0 ? 'У наявності' : 'Немає в наявності') }}
            </dd>
          </div>
        </dl>
      </section>

      <section v-if="product.images?.length" class="product-overview__section">
        <h2 class="product-overview__heading">Зображення</h2>
        <div class="product-overview__gallery">
          <img
            v-for="image in product.images"
            :key="image"
            :src="image"
            :alt="`${product.title} — зображення`"
            class="product-overview__image"
            loading="lazy"
            width="400"
            height="300"
          />
        </div>
      </section>

      <section class="product-overview__section">
        <h2 class="product-overview__heading">Теги</h2>
        <ul class="product-overview__tags">
          <li v-for="tag in product.tags" :key="tag" class="product-overview__tag">
            {{ tag }}
          </li>
        </ul>
      </section>

      <section class="product-overview__section">
        <RouterLink :to="{ name: 'products', query: { q: $route.query.q } }" class="product-overview__back">
          ← Повернутися до каталогу
        </RouterLink>
      </section>
    </article>
  </div>
</template>

<style scoped>
.product-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-overview__content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.product-overview__section {
  background: var(--paper);
  border: 1px solid var(--line);
  padding: 24px;
}

.product-overview__heading {
  margin: 0 0 16px;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.product-overview__text {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.product-overview__specs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin: 0;
}

.product-overview__spec {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-overview__spec dt {
  margin: 0;
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.product-overview__spec dd {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

.product-overview__gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.product-overview__image {
  width: 100%;
  height: 200px;
  object-fit: contain;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: 4px;
}

.product-overview__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.product-overview__tag {
  padding: 6px 12px;
  background: var(--acid);
  color: var(--ink);
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  border-radius: 4px;
}

.product-overview__back {
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
}

.product-overview__back:hover {
  background: var(--ink);
  color: var(--paper);
}

.product-overview__back:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .product-overview__specs {
    grid-template-columns: 1fr;
  }
}
</style>