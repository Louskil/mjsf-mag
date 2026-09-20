<script setup>
import { computed, reactive, ref } from 'vue'
import { materials } from '../data/materials.js'
import MaterialCard from './MaterialCard.vue'
import MaterialFilterForm from './MaterialFilterForm.vue'
import ModalDialog from './ModalDialog.vue'

const activeFilters = reactive({
  query: '',
  topic: 'all'
})

const items = ref(materials.map(material => ({...material})))
const selectedId = ref(items.value[0]?.id ?? null)
const isOpen = ref(false)
const mode = ref(null)
const editingId = ref(null)
const deletingId = ref(null)
const dialogTitle = ref('')
const draft = ref({ title: '', minutes: '' })
const editError = ref('')

const nameInputRef = ref(null)
const cancelBtnRef = ref(null)
const catalogHeadingRef = ref(null)

const selectedMaterial = computed(() => items.value.find(m => m.id === selectedId.value))
const selectedTitle = computed(() => selectedMaterial.value?.title ?? '')

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
  return items.value.filter((material) => {
    const matchesQuery = material.title.toLowerCase().includes(query)
    const matchesTopic =
      activeFilters.topic === 'all' || material.topic === activeFilters.topic
    return matchesQuery && matchesTopic
  })
})

const totalMinutes = computed(() => {
  return filteredMaterials.value.reduce((sum, material) => sum + material.minutes, 0)
})

function openEdit(id) {
  const material = items.value.find(m => m.id === id)
  if (!material) return
  editingId.value = id
  deletingId.value = null
  draft.value = { title: material.title, minutes: String(material.minutes) }
  editError.value = ''
  mode.value = 'edit'
  dialogTitle.value = 'Редагування матеріалу'
  isOpen.value = true
}

function openDelete(id) {
  const material = items.value.find(m => m.id === id)
  if (!material) return
  deletingId.value = id
  editingId.value = null
  draft.value = { title: '', minutes: '' }
  editError.value = ''
  mode.value = 'delete'
  dialogTitle.value = 'Підтвердження видалення'
  isOpen.value = true
}

function handleSave() {
  const title = draft.value.title.trim()
  const minutesRaw = draft.value.minutes
  const minutes = Number(minutesRaw)
  if (!title) {
    editError.value = 'Назва не може бути порожньою.'
    return
  }
  if (!Number.isInteger(minutes) || minutes <= 0) {
    editError.value = 'Тривалість має бути додатним цілим числом.'
    return
  }
  const idx = items.value.findIndex(m => m.id === editingId.value)
  if (idx !== -1) {
    items.value[idx] = { ...items.value[idx], title, minutes }
  }
  isOpen.value = false
}

function handleDelete() {
  const id = deletingId.value
  if (id === null) return
  items.value = items.value.filter(m => m.id !== id)
  if (selectedId.value === id) {
    const remaining = items.value
    selectedId.value = remaining[0]?.id ?? null
  }
  isOpen.value = false
}

function handleCancel() {
  isOpen.value = false
}
</script>

<template>
  <section class="material-catalog" aria-labelledby="catalog-title">
    <div class="material-catalog__heading">
      <div>
        <h2 class="material-catalog__title" id="catalog-title" tabindex="-1" ref="catalogHeadingRef">Каталог матеріалів</h2>
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
        :selected="material.id === selectedId"
        :number="String(material.id).padStart(2, '0')"
        :id="material.id"
        @select="selectedId = $event"
        @edit="openEdit"
        @delete="openDelete"
      />
    </div>

    <p v-else class="empty-state">
      За заданими умовами матеріалів немає.
    </p>

    <ModalDialog
      v-model="isOpen"
      :title="dialogTitle"
      :initial-focus="mode === 'delete' ? cancelBtnRef : nameInputRef"
      :fallback-focus="catalogHeadingRef"
    >
      <template v-if="mode === 'edit'">
        <form
          id="material-edit-form"
          @submit.prevent="handleSave"
        >
          <div class="mb-4">
            <label for="edit-title" class="block text-sm font-medium mb-1">Назва</label>
            <input
              ref="nameInputRef"
              id="edit-title"
              v-model.trim="draft.title"
              type="text"
              class="w-full min-h-11 px-3 py-2 border border-gray-300 rounded focus-visible:outline focus-visible:outline-3 focus-visible:outline-green-700"
              autocomplete="off"
            />
          </div>
          <div class="mb-4">
            <label for="edit-minutes" class="block text-sm font-medium mb-1">Тривалість (хв)</label>
            <input
              id="edit-minutes"
              v-model="draft.minutes"
              type="number"
              min="1"
              step="1"
              class="w-full min-h-11 px-3 py-2 border border-gray-300 rounded focus-visible:outline focus-visible:outline-3 focus-visible:outline-green-700"
            />
          </div>
          <p v-if="editError" class="text-red-600 text-sm mb-2">{{ editError }}</p>
        </form>
      </template>

      <template v-else-if="mode === 'delete'">
        <p>Ви впевнені, що хочете видалити матеріал «{{ items.find(m => m.id === deletingId)?.title }}»?</p>
        <p class="text-sm mt-2 text-gray-600">Ця дія незворотна.</p>
      </template>

      <template #footer>
        <template v-if="mode === 'edit'">
          <button
            type="button"
            class="button button--secondary"
            @click="handleCancel"
          >
            Скасувати
          </button>
          <button
            type="submit"
            form="material-edit-form"
            class="button button--primary"
          >
            Зберегти
          </button>
        </template>
        <template v-else-if="mode === 'delete'">
          <button
            ref="cancelBtnRef"
            type="button"
            class="button button--secondary"
            @click="handleCancel"
          >
            Скасувати
          </button>
          <button
            type="button"
            class="button button--primary"
            @click="handleDelete"
          >
            Видалити
          </button>
        </template>
      </template>
    </ModalDialog>
  </section>
</template>
