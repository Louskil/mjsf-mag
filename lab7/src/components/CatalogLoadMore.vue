<script setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '../composables/useIntersectionObserver.js'

defineProps({
  loaded: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Object,
    default: null,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['load-more', 'retry'])

const marker = ref(null)

useIntersectionObserver(marker, () => emit('load-more'), {
  rootMargin: '280px 0px',
  threshold: 0.01,
})
</script>

<template>
  <div ref="marker" class="catalog__load-more">
    <span class="catalog__load-progress">{{ loaded }} / {{ total }}</span>

    <div class="catalog__load-copy">
      <template v-if="isLoading">
        <div class="catalog__load-spinner" aria-hidden="true"></div>
        <strong class="catalog__load-title">
          Завантажуємо наступну сторінку…
        </strong>
        <span class="catalog__load-text">
          Нові товари буде додано без повторення
        </span>
      </template>

      <template v-else-if="error">
        <strong class="catalog__load-title">
          Не вдалося завантажити сторінку
        </strong>
        <span class="catalog__load-text">
          Поновіть запит, щоб продовжити перегляд каталогу
        </span>
        <button
          class="catalog__load-button"
          type="button"
          @click="emit('retry')"
        >
          Повторити запит
        </button>
      </template>

      <template v-else-if="hasMore">
        <strong class="catalog__load-title">
          Наступна сторінка завантажиться автоматично
        </strong>
        <span class="catalog__load-text">
          Прокрутіть каталог нижче — маркер уже спостерігається
        </span>
      </template>

      <template v-else>
        <strong class="catalog__load-title">Усі товари показано</strong>
        <span class="catalog__load-text">
          Більше запитів не виконуватиметься
        </span>
      </template>
    </div>
  </div>
</template>
