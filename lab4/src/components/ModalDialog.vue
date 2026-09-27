<script setup>
import { ref, watch, nextTick, onBeforeUnmount, useId } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  initialFocus: { type: [Object, null], default: null },
  fallbackFocus: { type: [Object, null], default: null },
  closeLabel: { type: String, default: 'Закрити вікно' },
})

const emit = defineEmits(['update:modelValue'])

const panelRef = ref(null)
const headingId = `modal-heading-${useId()}`
let previouslyFocused = null
let isClosing = false

function getFocusable(container) {
  if (!container) return []
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')
  const elements = Array.from(container.querySelectorAll(selector))
  return elements.filter((el) => {
    if (el.offsetParent === null) return false
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
}

function trapFocus(e) {
  if (e.key !== 'Tab') return
  const focusable = getFocusable(panelRef.value)
  if (focusable.length === 0) {
    e.preventDefault()
    panelRef.value?.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function close() {
  if (isClosing) return
  isClosing = true
  emit('update:modelValue', false)
}

function handleEscape(e) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    close()
  }
}

function restoreFocus() {
  if (props.modelValue) return
  nextTick(() => {
    const trigger = previouslyFocused
    if (trigger && trigger.isConnected && trigger.offsetParent !== null) {
      trigger.focus()
    } else if (props.fallbackFocus) {
      props.fallbackFocus.focus()
    }
  })
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement
      const appEl = document.getElementById('app')
      if (appEl) {
        appEl.dataset.prevInert = String(appEl.inert)
        appEl.inert = true
      }
      const body = document.body
      body.dataset.prevOverflow = body.style.overflow || ''
      body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape, true)
      document.addEventListener('keydown', trapFocus, true)
      await nextTick()
      if (props.initialFocus) {
        props.initialFocus.focus()
      } else {
        panelRef.value?.focus()
      }
    } else {
      document.removeEventListener('keydown', handleEscape, true)
      document.removeEventListener('keydown', trapFocus, true)
      const appEl = document.getElementById('app')
      if (appEl && appEl.dataset.prevInert !== undefined) {
        appEl.inert = appEl.dataset.prevInert === 'true'
      }
      const body = document.body
      if (body.dataset.prevOverflow !== undefined) {
        body.style.overflow = body.dataset.prevOverflow || ''
      }
      if (isClosing) {
        isClosing = false
      }
      restoreFocus()
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape, true)
  document.removeEventListener('keydown', trapFocus, true)
  const appEl = document.getElementById('app')
  if (appEl && appEl.dataset.prevInert !== undefined) {
    appEl.inert = appEl.dataset.prevInert === 'true'
  }
  const body = document.body
  if (body.dataset.prevOverflow !== undefined) {
    body.style.overflow = body.dataset.prevOverflow || ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="modal__fade-enter"
      leave-active-class="modal__fade-leave"
      enter-from-class="modal__fade-from"
      enter-to-class="modal__fade-to"
      leave-from-class="modal__fade-from"
      leave-to-class="modal__fade-to"
    >
      <div
        v-if="modelValue"
        class="modal"
        @click.self="close"
      >
        <div
          ref="panelRef"
          class="modal__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="headingId"
          tabindex="-1"
        >
          <header class="modal__header">
            <h2 :id="headingId" class="modal__title">{{ title }}</h2>
            <button
              type="button"
              class="modal__close"
              :aria-label="closeLabel"
              @click="close"
            >
              <span aria-hidden="true" class="modal__close-icon">&times;</span>
            </button>
          </header>
          <div class="modal__body">
            <slot />
          </div>
          <footer class="modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
  background: color-mix(in srgb, var(--color-page) 40%, #000);

  &__panel {
    @apply box-border w-full max-w-screen-sm
           flex flex-col overflow-hidden rounded-xl;
    background: var(--color-surface);
    border: 1px solid var(--color-line);
    box-shadow: var(--shadow-soft);
  }

  &__header {
    @apply shrink-0 flex items-center justify-between px-6 py-4;
    border-bottom: 1px solid var(--color-line);
  }

  &__title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--color-ink);
  }

  &__close {
    @apply shrink-0 min-h-11 min-w-11 flex items-center justify-center
           rounded-lg text-2xl;
    border: none;
    background: transparent;
    color: var(--color-muted);
    cursor: pointer;
    padding: 0;

    &:hover {
      background: color-mix(in srgb, var(--color-accent) 15%, transparent);
      color: var(--color-ink);
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 3px;
    }
  }

  &__body {
    @apply min-h-0 overflow-y-auto px-6 py-4;
    color: var(--color-ink);
  }

  &__footer {
    @apply shrink-0 flex flex-col gap-3 sm:flex-row sm:justify-end px-6 py-4;
    border-top: 1px solid var(--color-line);
  }

  &__fade-enter,
  &__fade-leave {
    transition: opacity 150ms ease;
  }

  &__fade-from {
    opacity: 0;
  }

  &__fade-to {
    opacity: 1;
  }
}
</style>
