<script setup>
import { ref } from 'vue'

const note = ref('')
</script>

<template>
  <div class="overview-panel">
    <h3 class="overview-panel__title">Огляд</h3>
    <p class="overview-panel__desc">
      Короткий опис роботи або нотатка користувача. Введіть текст у полі нижче —
      він зберігатиметься під час перемикання вкладок завяка KeepAlive.
    </p>
    <div class="overview-panel__field">
      <label for="overview-note" class="overview-panel__label">Нотатка</label>
      <textarea
        id="overview-note"
        v-model="note"
        class="overview-panel__textarea"
        placeholder="Введіть зауваження..."
        rows="4"
      ></textarea>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overview-panel {
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

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  &__label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  &__textarea {
    @apply w-full px-3 py-2 text-sm rounded;
    background: var(--color-page);
    color: var(--color-ink);
    border: 1px solid var(--color-line);
    resize: vertical;

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
  }
}
</style>
