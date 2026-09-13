<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['apply', 'clear'])

const filterForm = reactive({
  query: '',
  topic: 'all'
})

function submitFilters() {
  emit('apply', {
    query: filterForm.query,
    topic: filterForm.topic
  })
}

function clearFilters() {
  filterForm.query = ''
  filterForm.topic = 'all'
  emit('clear')
}
</script>

<template>
  <form
    class="filters"
    aria-label="Фільтри каталогу"
    @submit.prevent="submitFilters"
    @reset.prevent="clearFilters"
    @keydown.esc="clearFilters"
  >
    <label class="field">
      <span class="field__label">Пошук за назвою</span>
      <span class="field__control">
        <span class="field__icon" aria-hidden="true">⌕</span>
        <input
          v-model.trim="filterForm.query"
          class="field__input"
          type="search"
          name="query"
          placeholder="Наприклад, компоненти"
        />
      </span>
    </label>

    <label class="field">
      <span class="field__label">Тема</span>
      <span class="field__control">
        <select v-model="filterForm.topic" class="field__select" name="topic">
          <option value="all">Усі теми</option>
          <option value="vue">Vue</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="javascript">JavaScript</option>
        </select>
      </span>
    </label>

    <div class="filters__actions">
      <button class="button button--primary" type="submit">Застосувати</button>
      <button class="button button--secondary" type="reset">Очистити</button>
    </div>
  </form>
</template>