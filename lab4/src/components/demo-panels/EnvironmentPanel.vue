<script setup>
import { ref } from 'vue'
import ModalDialog from '../ModalDialog.vue'

const isModalOpen = ref(false)
const note = ref('')
const noteRef = ref(null)

const environment = [
  { label: 'ОС', value: 'Windows' },
  { label: 'Редактор', value: 'IntelliJ IDEA' },
  { label: 'Node.js', value: 'v22.19.0' },
  { label: 'npm', value: '11.6.1' },
  { label: 'Vite', value: '5.4+' },
  { label: 'Vue', value: '3.5+' },
]

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}
</script>

<template>
  <div class="env-panel">
    <h3 class="env-panel__title">Середовище розробки</h3>
    <p class="env-panel__desc">
      Відомості про середовище та кнопка виклику модального діалогу, який
      зберігає локальний стан панелі під час відкриття.
    </p>
    <ul class="env-panel__list">
      <li
        v-for="item in environment"
        :key="item.label"
        class="env-panel__item"
      >
        <strong class="env-panel__label">{{ item.label }}:</strong>
        <span class="env-panel__value">{{ item.value }}</span>
      </li>
    </ul>
    <div class="env-panel__controls">
      <input
        v-model="note"
        ref="noteRef"
        type="text"
        class="env-panel__input"
        placeholder="Введіть примітку до середовища…"
      />
      <button
        type="button"
        class="button button--secondary env-panel__button"
        @click="openModal"
      >
        Докладніше
      </button>
    </div>

    <ModalDialog
      v-model="isModalOpen"
      title="Деталі середовища розробки"
      :initial-focus="note ? noteRef : null"
    >
      <div class="env-detail">
        <p class="env-detail__row">
          <strong>Node.js</strong> — потоки подій, швидке виконання баз даних.
        </p>
        <p class="env-detail__row">
          <strong>Vite</strong> — надпливний бандлер із підтримкою HMR.
        </p>
        <p class="env-detail__row">
          <strong>Vue 3</strong> — Composition API, SFC, реактивність.
        </p>
        <p class="env-detail__row">
          <strong>npm</strong> — менеджер пакетів для екосистеми JavaScript.
        </p>
        <p class="env-detail__row">
          <strong>Примітка</strong> — {{ note || 'не введена' }}
        </p>
      </div>
      <template #footer>
        <button
          type="button"
          class="button button--secondary"
          @click="closeModal"
        >
          Закрити
        </button>
      </template>
    </ModalDialog>
  </div>
</template>

<style scoped lang="scss">
.env-panel {
  &__title {
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  &__desc {
    margin-bottom: 1rem;
    color: var(--color-muted);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  &__list {
    @apply list-none space-y-1.5;
  }

  &__item {
    @apply flex justify-between text-sm;
    color: var(--color-ink);
  }

  &__label {
    color: var(--color-muted);
    font-weight: 600;
  }

  &__controls {
    @apply mt-4 flex flex-col sm:flex-row gap-2;
  }

  &__input {
    @apply flex-1 px-3 py-2 text-sm rounded;
    background: var(--color-page);
    color: var(--color-ink);
    border: 1px solid var(--color-line);

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
  }

  &__button {
    @apply min-h-10;
  }
}

.env-detail {
  &__row {
    margin-bottom: 0.5rem;
    color: var(--color-ink);
    font-size: 0.9rem;
    line-height: 1.6;
  }
}
</style>
