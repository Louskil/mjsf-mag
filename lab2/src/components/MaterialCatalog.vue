<script setup>
import { computed, reactive, ref } from 'vue'
import { materials } from '../data/materials.js'
import MaterialCard from './MaterialCard.vue'
import MaterialFilterForm from './MaterialFilterForm.vue'

const activeFilters = reactive({
  query: '',
  topic: 'all'
})

const selectedTitle = ref(materials[0]?.title ?? '')

function applyFilters(payload) {
  activeFilters.query = payload.query
  activeFilters.topic = payload.topic
}

function clearFilters() {
  activeFilters.query = ''
  activeFilters.topic = 'all'
}

const filteredMaterials = computed(() => {
  const query = activeFilters.query.toLowerCase()

  return materials.filter((material) => {
    const matchesQuery = material.title.toLowerCase().includes(query)
    const matchesTopic =
      activeFilters.topic === 'all' || material.topic === activeFilters.topic

    return matchesQuery && matchesTopic
  })
})

const totalMinutes = computed(() => {
  return filteredMaterials.value.reduce((sum, material) => sum + material.minutes, 0)
})
</script>

<template>
  <section class="material-catalog" aria-labelledby="catalog-title">
    <div class="material-catalog__heading">
      <div>
        <h2 class="material-catalog__title" id="catalog-title">Каталог матеріалів</h2>
      </div>
      <p class="material-catalog__summary">
        <strong class="material-catalog__count">
          Знайдено: {{ filteredMaterials.length }}
        </strong>
        <span aria-hidden="true">·</span>
        Загальна тривалість: {{ totalMinutes }} хв
      </p>
    </div>

    <MaterialFilterForm @apply="applyFilters" @clear="clearFilters" />

    <p class="selection-status" aria-live="polite">
      <span class="selection-status__label">Обраний матеріал</span>
      <strong class="selection-status__value">{{ selectedTitle }}</strong>
    </p>

    <div v-if="filteredMaterials.length" class="material-list">
      <MaterialCard
        v-for="material in filteredMaterials"
        :key="material.id"
        :title="material.title"
        :topic="material.topic"
        :description="material.description"
        :minutes="material.minutes"
        :selected="material.title === selectedTitle"
        :number="String(material.id).padStart(2, '0')"
        @select="selectedTitle = $event"
      />
    </div>

    <p v-else class="empty-state">
      За заданими умовами матеріалів немає.
    </p>
  </section>
</template>