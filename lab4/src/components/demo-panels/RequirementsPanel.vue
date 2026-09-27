<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, label: 'Використано Vue 3 Composition API', checked: true },
  { id: 2, label: 'Реалізовано Roving Tabindex', checked: false },
  { id: 3, label: 'Передано контекст через provide/inject', checked: false },
  { id: 4, label: 'Збережено стан через KeepAlive', checked: false },
  { id: 5, label: 'Додано підтримку клавіатурної навігації', checked: false },
])

const counter = ref(0)

const completedCount = computed(() =>
  items.value.filter((i) => i.checked).length,
)

function toggle(id) {
  const item = items.value.find((i) => i.id === id)
  if (item) item.checked = !item.checked
}
</script>

<template>
  <div class="requirements-panel">
    <h3 class="requirements-panel__title">Вимоги до виконання</h3>
    <p class="requirements-panel__summary">
      Виконано: <strong class="requirements-panel__count">{{ completedCount }}</strong> з
      {{ items.length }}
    </p>
    <ul class="requirements-panel__list">
      <li
        v-for="item in items"
        :key="item.id"
        class="requirements-panel__item"
      >
        <label class="requirements-panel__label">
          <input
            type="checkbox"
            class="requirements-panel__checkbox"
            :checked="item.checked"
            @change="toggle(item.id)"
          />
          {{ item.label }}
        </label>
      </li>
    </ul>
    <button
      type="button"
      class="requirements-panel__counter"
      @click="counter++"
    >
      Кліків: {{ counter }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.requirements-panel {
  &__title {
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  &__summary {
    margin-bottom: 1rem;
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  &__count {
    color: var(--color-accent);
    font-weight: 700;
  }

  &__list {
    @apply list-none space-y-1.5;
  }

  &__label {
    @apply flex items-center gap-2 cursor-pointer text-sm;
    color: var(--color-ink);
  }

  &__checkbox {
    @apply w-4 h-4 rounded
           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2;
    accent-color: var(--color-accent);
    outline-color: var(--color-accent);
  }

  &__counter {
    @apply mt-4 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer;
    background: color-mix(in srgb, var(--color-css) 30%, transparent);
    color: var(--color-css);
    border: 1px solid var(--color-line);

    &:hover {
      background: color-mix(in srgb, var(--color-css) 45%, transparent);
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2;
      outline-color: var(--color-accent);
    }
  }
}
</style>
