<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useProductsStore } from '@/stores/products.js'
import { usePrivateResource } from '@/composables/usePrivateResource.js'
import { normalizeDraft, validateDraft } from '@/api/productDraft.js'
import { storeToRefs } from 'pinia'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const products = useProductsStore()

const { request } = storeToRefs(auth)
const { savePending, hasConfirmed, getConfirmed, save: saveProduct, cancelSave } = storeToRefs(products)

const id = computed(() => route.params.id)
const isValidId = computed(() => /^\d+$/.test(String(id.value)))

const pathFactory = computed(() => isValidId.value ? `/auth/products/${id.value}` : null)

const { data: productData, error, isLoading, abort: abortResource } = usePrivateResource(pathFactory)

const draft = ref({
  title: '',
  price: '',
  stock: '',
  description: '',
})

const fieldErrors = ref({})
const submitError = ref('')
const touched = ref({})
const initialDraft = ref(null)
let unsubBeforeUnload = null

const is404 = computed(() => error.value && (error.value.status === 404 || (error.value.message && error.value.message.includes('404'))))
const isNotFound = computed(() => !isValidId.value || is404.value)

const isSaving = computed(() => savePending.value[id.value])
const hasUnsavedChanges = computed(() => {
  if (!initialDraft.value) return false
  const current = normalizeDraft(draft.value)
  return (
    current.title !== initialDraft.value.title ||
    current.price !== initialDraft.value.price ||
    current.stock !== initialDraft.value.stock ||
    current.description !== initialDraft.value.description
  )
})

const breadcrumbs = computed(() => {
  const items = [{ label: 'Керування', to: { name: 'manage-products' } }]
  if (productData.value) {
    const title = products.getBreadcrumbTitle(productData.value, id.value)
    if (title) {
      items.push({ label: title, to: null })
    }
  }
  items.push({ label: 'Редагування', to: null })
  return items
})

function isFieldInvalid(field) {
  return touched.value[field] && !!fieldErrors.value[field]
}

function validateField(field) {
  const validation = validateDraft(draft.value)
  fieldErrors.value = validation.errors
}

function validateAll() {
  const validation = validateDraft(draft.value)
  fieldErrors.value = validation.errors
  touched.value = { title: true, price: true, stock: true, description: true }
  return validation.valid
}

function getFirstInvalidField() {
  const order = ['title', 'price', 'stock', 'description']
  return order.find(f => fieldErrors.value[f])
}

function focusFirstError() {
  const field = getFirstInvalidField()
  if (field) {
    const input = document.getElementById(`edit-${field}`)
    input?.focus()
  }
}

function handleInput(field) {
  touched.value[field] = true
  validateField(field)
  submitError.value = ''
}

async function handleSubmit(event) {
  event.preventDefault()

  if (!validateAll()) {
    focusFirstError()
    return
  }

  try {
    await saveProduct(id.value, draft.value)
    initialDraft.value = normalizeDraft(draft.value)
    submitError.value = ''
  } catch (cause) {
    if (cause instanceof Error && cause.message === 'Сеанс закінчився') {
      submitError.value = 'Сеанс закінчився під час збереження'
    } else if (cause && typeof cause === 'object' && 'errors' in cause) {
      submitError.value = 'Перевірте правильність полів'
    } else {
      submitError.value = 'Не вдалося зберегти. Спробуйте пізніше.'
    }
  }
}

function handleCancel() {
  if (initialDraft.value) {
    draft.value = { ...initialDraft.value }
  }
  fieldErrors.value = {}
  touched.value = {}
  submitError.value = ''
}

function setupBeforeUnload() {
  const handler = (event) => {
    if (hasUnsavedChanges.value) {
      event.preventDefault()
      event.returnValue = ''
    }
  }
  window.addEventListener('beforeunload', handler)
  unsubBeforeUnload = () => window.removeEventListener('beforeunload', handler)
}

onMounted(() => {
  setupBeforeUnload()
})

onBeforeUnmount(() => {
  unsubBeforeUnload?.()
})

async function confirmLeave() {
  if (hasUnsavedChanges.value) {
    return confirm('Є незбережені зміни. Ви справді хочете покинути сторінку?')
  }
  return true
}

onBeforeRouteLeave(async (to, from, next) => {
  const ok = await confirmLeave()
  if (ok) {
    cancelSave(id.value)
    next()
  } else {
    next(false)
  }
})

onBeforeRouteUpdate(async (to, from, next) => {
  if (to.params.id !== from.params.id) {
    const ok = await confirmLeave()
    if (ok) {
      cancelSave(id.value)
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

watch(productData, (product) => {
  if (product && !initialDraft.value) {
    const confirmed = hasConfirmed.value(id.value) ? getConfirmed.value(id.value) : null
    const base = confirmed ?? product
    draft.value = {
      title: base.title ?? '',
      price: String(base.price ?? ''),
      stock: String(base.stock ?? ''),
      description: base.description ?? '',
    }
    initialDraft.value = normalizeDraft(draft.value)
    fieldErrors.value = {}
    touched.value = {}
    submitError.value = ''
  }
}, { immediate: true })

watch(id, () => {
  initialDraft.value = null
  draft.value = { title: '', price: '', stock: '', description: '' }
  fieldErrors.value = {}
  touched.value = {}
  submitError.value = ''
})
</script>

<template>
  <div class="edit-view">
    <Breadcrumbs :items="breadcrumbs" />

    <header class="edit-view__header">
      <h2 class="edit-view__title">Редагування товару</h2>
      <p class="edit-view__subtitle">ID: {{ id }} · Зміни застосовуються після збереження</p>
    </header>

    <div v-if="isLoading && !productData" class="edit-view__loading" aria-live="polite">
      <div class="edit-view__spinner" aria-hidden="true"></div>
      <p>Завантажуємо товар…</p>
    </div>

    <div v-else-if="isNotFound" class="edit-view__error" role="alert">
      <p class="edit-view__error-index" v-if="!isValidId">ERR / PARAM</p>
      <p class="edit-view__error-index" v-else>ERR / 404</p>
      <h3 class="edit-view__error-title">
        <template v-if="!isValidId">Некоректний ідентифікатор</template>
        <template v-else>Товар не знайдено</template>
      </h3>
      <p class="edit-view__error-text">
        <template v-if="!isValidId">Ідентифікатор товару має бути додатним цілим числом.</template>
        <template v-else>Товар із ідентифікатором {{ id }} не існує.</template>
      </p>
      <RouterLink :to="{ name: 'manage-products' }" class="edit-view__back">
        Повернутися до списку
      </RouterLink>
    </div>

    <form v-else class="edit-form" @submit="handleSubmit" novalidate>
      <div v-if="submitError" class="edit-form__submit-error" role="alert" aria-live="assertive">
        {{ submitError }}
      </div>

      <div class="edit-form__field">
        <label for="edit-title" class="edit-form__label">Назва <span class="edit-form__required" aria-hidden="true">*</span></label>
        <input
          id="edit-title"
          type="text"
          class="edit-form__input"
          :class="{ 'edit-form__input--invalid': isFieldInvalid('title') }"
          :value="draft.title"
          @input="draft.title = $event.target.value; handleInput('title')"
          @blur="handleInput('title')"
          :disabled="isSaving"
          :aria-invalid="isFieldInvalid('title')"
          :aria-describedby="isFieldInvalid('title') ? 'edit-title-error' : undefined"
          required
          maxlength="120"
        />
        <span v-if="isFieldInvalid('title')" id="edit-title-error" class="edit-form__error" role="alert">{{ fieldErrors.title }}</span>
      </div>

      <div class="edit-form__field">
        <label for="edit-price" class="edit-form__label">Ціна <span class="edit-form__required" aria-hidden="true">*</span></label>
        <input
          id="edit-price"
          type="number"
          step="0.01"
          min="0.01"
          class="edit-form__input"
          :class="{ 'edit-form__input--invalid': isFieldInvalid('price') }"
          :value="draft.price"
          @input="draft.price = $event.target.value; handleInput('price')"
          @blur="handleInput('price')"
          :disabled="isSaving"
          :aria-invalid="isFieldInvalid('price')"
          :aria-describedby="isFieldInvalid('price') ? 'edit-price-error' : undefined"
          required
        />
        <span v-if="isFieldInvalid('price')" id="edit-price-error" class="edit-form__error" role="alert">{{ fieldErrors.price }}</span>
      </div>

      <div class="edit-form__field">
        <label for="edit-stock" class="edit-form__label">Залишок <span class="edit-form__required" aria-hidden="true">*</span></label>
        <input
          id="edit-stock"
          type="number"
          step="1"
          min="0"
          class="edit-form__input"
          :class="{ 'edit-form__input--invalid': isFieldInvalid('stock') }"
          :value="draft.stock"
          @input="draft.stock = $event.target.value; handleInput('stock')"
          @blur="handleInput('stock')"
          :disabled="isSaving"
          :aria-invalid="isFieldInvalid('stock')"
          :aria-describedby="isFieldInvalid('stock') ? 'edit-stock-error' : undefined"
          required
        />
        <span v-if="isFieldInvalid('stock')" id="edit-stock-error" class="edit-form__error" role="alert">{{ fieldErrors.stock }}</span>
      </div>

      <div class="edit-form__field edit-form__field--full">
        <label for="edit-description" class="edit-form__label">Опис <span class="edit-form__required" aria-hidden="true">*</span></label>
        <textarea
          id="edit-description"
          class="edit-form__textarea"
          :class="{ 'edit-form__input--invalid': isFieldInvalid('description') }"
          :value="draft.description"
          @input="draft.description = $event.target.value; handleInput('description')"
          @blur="handleInput('description')"
          :disabled="isSaving"
          :aria-invalid="isFieldInvalid('description')"
          :aria-describedby="isFieldInvalid('description') ? 'edit-description-error' : undefined"
          required
          maxlength="2000"
          rows="6"
        ></textarea>
        <span v-if="isFieldInvalid('description')" id="edit-description-error" class="edit-form__error" role="alert">{{ fieldErrors.description }}</span>
        <p class="edit-form__counter">
          {{ draft.description.length }} / 2000
        </p>
      </div>

      <div class="edit-form__actions">
        <button
          class="edit-form__btn edit-form__btn--secondary"
          type="button"
          @click="handleCancel"
          :disabled="isSaving"
          :aria-busy="isSaving"
        >
          Скасувати зміни
        </button>
        <button
          class="edit-form__btn edit-form__btn--primary"
          type="submit"
          :disabled="isSaving"
          :aria-busy="isSaving"
        >
          <span v-if="isSaving">Збереження…</span>
          <span v-else>Зберегти</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
}

.edit-view__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-view__title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.edit-view__subtitle {
  margin: 0;
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.edit-view__loading,
.edit-view__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: clamp(40px, 6vw, 80px);
  background: var(--paper);
  border: 1px solid var(--line);
  text-align: center;
}

.edit-view__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--line);
  border-top-color: var(--signal);
  border-radius: 50%;
  animation: edit-spin 0.8s linear infinite;
}

@keyframes edit-spin {
  to { transform: rotate(360deg); }
}

.edit-view__error-index {
  margin: 0 0 8px;
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.edit-view__error-title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.edit-view__error-text {
  margin: 0;
  color: var(--muted);
  max-width: 520px;
}

.edit-view__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 16px;
  color: var(--ink);
  text-decoration: none;
  font-weight: 600;
  border: 1px solid var(--ink);
  background: transparent;
  border-radius: 4px;
  transition: background 0.15s ease, color 0.15s ease;
  min-height: 44px;
  min-width: 44px;
}

.edit-view__back:hover {
  background: var(--ink);
  color: var(--paper)
}

.edit-view__back:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--paper);
  border: 1px solid var(--line);
  padding: clamp(24px, 4vw, 40px);
  border-radius: 8px;
}

.edit-form__submit-error {
  padding: 12px 16px;
  color: var(--paper);
  background: var(--signal);
  border-radius: 4px;
  font-size: 0.9rem;
}

.edit-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.edit-form__field--full {
  flex: 1;
}

.edit-form__label {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink);
}

.edit-form__required {
  color: var(--signal);
}

.edit-form__input,
.edit-form__textarea {
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--canvas);
  color: var(--ink);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  min-height: 44px;
}

.edit-form__textarea {
  resize: vertical;
  min-height: 120px;
}

.edit-form__input:hover,
.edit-form__textarea:hover {
  border-color: var(--muted);
}

.edit-form__input:focus,
.edit-form__textarea:focus {
  outline: none;
  border-color: var(--signal);
  box-shadow: 0 0 0 3px rgba(242, 78, 46, 0.25);
}

.edit-form__input:disabled,
.edit-form__textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-form__input--invalid,
.edit-form__textarea--invalid {
  border-color: var(--signal);
}

.edit-form__input--invalid:focus,
.edit-form__textarea--invalid:focus {
  box-shadow: 0 0 0 3px rgba(242, 78, 46, 0.25);
}

.edit-form__error {
  margin: 0;
  font-size: 0.8rem;
  color: var(--signal);
  line-height: 1.4;
}

.edit-form__counter {
  margin: 4px 0 0;
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.7rem;
  color: var(--muted);
  text-align: right;
}

.edit-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.edit-form__btn {
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.edit-form__btn:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.edit-form__btn:active:not(:disabled) {
  transform: scale(0.98);
}

.edit-form__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-form__btn--primary {
  color: var(--ink);
  background: var(--acid);
  border: 0;
}

.edit-form__btn--primary:hover:not(:disabled) {
  background: #c8eb3a;
}

.edit-form__btn--secondary {
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--ink);
}

.edit-form__btn--secondary:hover:not(:disabled) {
  background: var(--ink);
  color: var(--paper);
}

@media (max-width: 560px) {
  .edit-form__actions {
    flex-direction: column-reverse;
  }

  .edit-form__btn {
    width: 100%;
  }
}
</style>