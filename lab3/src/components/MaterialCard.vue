<script setup>
const props = defineProps({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  minutes: { type: Number, required: true },
  selected: { type: Boolean, default: false },
  number: { type: String, required: true },
  id: { type: Number, required: true },
})

const emit = defineEmits(['select', 'edit', 'delete'])
</script>

<template>
  <article
    class="material-card"
    :class="[
      `material-card--${topic}`,
      { 'material-card--selected': selected }
    ]"
  >
    <div class="material-card__meta">
      <span class="material-card__number">{{ number }}</span>
      <span class="material-card__topic">{{ topic }}</span>
    </div>
    <h3 class="material-card__title">{{ title }}</h3>
    <p class="material-card__description">{{ description }}</p>
    <div class="material-card__footer">
      <span class="material-card__duration">{{ minutes }} хв</span>
      <button
        class="material-card__action"
        type="button"
        :aria-pressed="selected"
        @click="emit('select', id)"
      >
        <template v-if="selected">
          Обрано <span aria-hidden="true">✓</span>
        </template>
        <template v-else>
          Обрати <span aria-hidden="true">↗</span>
        </template>
      </button>
    </div>
    <div class="material-card__actions flex gap-2 mt-3">
      <button
        type="button"
        class="button button--secondary flex-1 min-h-11 text-sm"
        @click="emit('edit', id)"
      >
        Редагувати
      </button>
      <button
        type="button"
        class="button button--secondary flex-1 min-h-11 text-sm"
        @click="emit('delete', id)"
      >
        Видалити
      </button>
    </div>
  </article>
</template>
